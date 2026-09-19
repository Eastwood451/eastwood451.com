create table public.math_owners (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.math_owners enable row level security;
create policy owner_read on public.math_owners for select to authenticated using(user_id=(select auth.uid()));
grant select on public.math_owners to authenticated;
revoke all on public.math_owners from anon;
create function public.math_is_owner() returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.math_owners where user_id=(select auth.uid()))
$$;
revoke all on function public.math_is_owner() from public,anon;
grant execute on function public.math_is_owner() to authenticated;

create table public.math_contents (
 id text primary key check(id ~ '^[a-f0-9]{64}$'),
 title text not null,
 page_count integer not null default 0,
 error text,
 updated_at timestamptz not null default now()
);
create table public.math_locations (
 path text primary key,
 content_id text not null references public.math_contents(id),
 bytes bigint not null,
 drive_id text,
 drive_status text not null check(drive_status in ('verified','missing','ambiguous')),
 error text,
 source_metadata jsonb not null default '{}',
 active boolean not null default true,
 check(drive_status <> 'verified' or drive_id ~ '^[A-Za-z0-9_-]+$')
);
create index math_locations_content on public.math_locations(content_id) where active;
create table public.math_pages (
 id text primary key,
 content_id text not null references public.math_contents(id),
 number integer not null check(number>0),
 search_text text not null default '',
 search_vector tsvector generated always as (to_tsvector('danish',search_text)) stored,
 status text not null default 'pending' check(status in ('pending','review','complete','error')),
 summary text not null default '',
 subject text not null default 'unknown' check(subject in ('math','other','unknown')),
 material_type text not null default 'student' check(material_type in ('student','answers','teacher','other')),
 model text, analysis_version text,
 preview_key text,
 analyzed_at timestamptz,
 unique(content_id,number)
);
create index math_pages_search on public.math_pages using gin(search_vector);
create index math_pages_status on public.math_pages(status,subject,material_type);
create table public.math_topics (
 id text primary key,label text not null
);
insert into public.math_topics values
 ('tal','Tal og talforståelse'),('regning','Regnearter'),('broeker','Brøker'),('decimaltal','Decimaltal'),('procent','Procent'),
 ('algebra','Algebra og ligninger'),('geometri','Geometri'),('maaling','Måling og enheder'),('funktioner','Funktioner og grafer'),
 ('statistik','Statistik'),('sandsynlighed','Sandsynlighed'),('oekonomi','Økonomi'),('problemlosning','Problemløsning'),('logik','Logik og kombinatorik');
create table public.math_assessments (
 page_id text not null references public.math_pages(id) on delete cascade,
 origin text not null check(origin in ('ai','manual')),
 ordinal integer not null,
 topic text not null references public.math_topics(id),
 subtopic text not null default '',
 skill text not null default '',
 grade_min integer check(grade_min between 0 and 12),
 grade_max integer check(grade_max between 0 and 12),
 difficulty text check(difficulty in ('let','middel','svaer')),
 confidence real check(confidence between 0 and 1),
 reason text not null default '',
 primary key(page_id,origin,ordinal),
 check((grade_min is null and grade_max is null) or (grade_min is not null and grade_max is not null and grade_min<=grade_max))
);
create index math_assessments_filters on public.math_assessments(topic,difficulty,grade_min,grade_max,page_id);
create table public.math_overrides (
 page_id text primary key references public.math_pages(id) on delete cascade,
 summary text not null,
 subject text not null check(subject in ('math','other','unknown')),
 material_type text not null check(material_type in ('student','answers','teacher','other')),
 updated_at timestamptz not null default now()
);
create table public.math_saved_filters (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 150),
 filters jsonb not null,
 created_at timestamptz not null default now()
);
create table public.math_collections (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 1 and 150),
 created_at timestamptz not null default now()
);
create table public.math_collection_items (
 id uuid primary key default gen_random_uuid(),
 collection_id uuid not null references public.math_collections(id) on delete cascade,
 content_id text references public.math_contents(id),
 page_id text references public.math_pages(id),
 created_at timestamptz not null default now(),
 check((content_id is null) <> (page_id is null))
);
create unique index math_collection_files on public.math_collection_items(collection_id,content_id) where content_id is not null;
create unique index math_collection_pages on public.math_collection_items(collection_id,page_id) where page_id is not null;
create index math_collection_content on public.math_collection_items(content_id);
create index math_collection_page on public.math_collection_items(page_id);
create table public.math_imports (
 id uuid primary key default gen_random_uuid(),
 started_at timestamptz not null default now(),
 status text not null,
 report jsonb not null default '{}'
);
do $$
declare t text;
begin
 foreach t in array array['math_contents','math_locations','math_pages','math_topics','math_assessments','math_overrides','math_saved_filters','math_collections','math_collection_items','math_imports']
 loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy owner_access on public.%I for all to authenticated using ((select public.math_is_owner())) with check ((select public.math_is_owner()))',t);
  execute format('grant select on public.%I to authenticated',t);
  execute format('revoke all on public.%I from anon',t);
 end loop;
end $$;
grant insert,update,delete on public.math_overrides,public.math_assessments,public.math_saved_filters,public.math_collections,public.math_collection_items to authenticated;
create view public.math_effective_assessments with(security_invoker=true) as
 select a.* from public.math_assessments a
 where a.origin='manual' or not exists(select 1 from public.math_overrides o where o.page_id=a.page_id);
grant select on public.math_effective_assessments to authenticated;

create function public.math_correct_page(p_id text,p_data jsonb) returns void
language plpgsql security invoker set search_path='' as $$
begin
 if not public.math_is_owner() then raise insufficient_privilege; end if;
 if jsonb_typeof(p_data->'assessments')<>'array' or jsonb_array_length(p_data->'assessments')>40 then raise exception 'Ugyldige vurderinger'; end if;
 insert into public.math_overrides(page_id,summary,subject,material_type)
 values(p_id,p_data->>'summary',p_data->>'subject',p_data->>'material_type')
 on conflict(page_id) do update set summary=excluded.summary,subject=excluded.subject,material_type=excluded.material_type,updated_at=now();
 delete from public.math_assessments where page_id=p_id and origin='manual';
 insert into public.math_assessments(page_id,origin,ordinal,topic,subtopic,skill,grade_min,grade_max,difficulty,confidence,reason)
 select p_id,'manual',n::integer,x->>'topic',coalesce(x->>'subtopic',''),coalesce(x->>'skill',''),
 (x->>'grade_min')::integer,(x->>'grade_max')::integer,x->>'difficulty',1,coalesce(x->>'reason','Manuelt rettet')
 from jsonb_array_elements(p_data->'assessments') with ordinality e(x,n);
end $$;
revoke all on function public.math_correct_page(text,jsonb) from public,anon;
grant execute on function public.math_correct_page(text,jsonb) to authenticated;

create function public.math_search(p_filters jsonb default '{}',p_offset integer default 0,p_limit integer default 30)
returns jsonb language sql stable security invoker set search_path='' as $$
with options as (
 select nullif(p_filters->>'q','') q,nullif(p_filters->>'grade','')::integer grade,
 nullif(p_filters->>'topic','') topic,nullif(p_filters->>'subtopic','') subtopic,
 nullif(p_filters->>'difficulty','') difficulty,
 coalesce(p_filters->>'scope','students') scope,
 nullif(p_filters->>'status','') status,
 coalesce(p_filters->>'view','files') view_mode,
 nullif(p_filters->>'collection','')::uuid collection
), candidates as materialized (
 select p.id,p.content_id,p.number,p.preview_key,c.title,c.page_count,c.error,
 coalesce(m.summary,p.summary) summary,coalesce(m.subject,p.subject) subject,
 coalesce(m.material_type,p.material_type) material_type,
 case when m.page_id is not null then 'complete' else p.status end status,
 m.page_id is not null corrected
 from public.math_pages p join public.math_contents c on c.id=p.content_id
 left join public.math_overrides m on m.page_id=p.id cross join options o
 where exists(select 1 from public.math_locations l where l.content_id=c.id and l.active)
 and (o.q is null or p.search_vector @@ websearch_to_tsquery('danish',o.q)
      or to_tsvector('danish',coalesce(m.summary,p.summary)) @@ websearch_to_tsquery('danish',o.q))
 and (o.scope='all' or (coalesce(m.subject,p.subject) in ('math','unknown') and coalesce(m.material_type,p.material_type)='student'))
 and (o.status is null or (case when m.page_id is not null then 'complete' else p.status end)=o.status)
 and (o.collection is null or exists(select 1 from public.math_collection_items i where i.collection_id=o.collection and (i.page_id=p.id or i.content_id=p.content_id)))
 and ((o.grade is null and o.topic is null and o.subtopic is null and o.difficulty is null) or exists(
   select 1 from public.math_effective_assessments a where a.page_id=p.id
   and (o.grade is null or o.grade between a.grade_min and a.grade_max)
   and (o.topic is null or a.topic=o.topic)
   and (o.subtopic is null or a.subtopic=o.subtopic)
   and (o.difficulty is null or a.difficulty=o.difficulty)))
), groups as (
 select case when o.view_mode='pages' then c.id else c.content_id end key,
 min(c.content_id) content_id,min(c.number) number,count(*) matched_pages
 from candidates c cross join options o group by 1
), paged as (
 select g.*,c.id page_id,c.title,c.page_count,c.summary,c.status,c.material_type,c.subject,c.preview_key,c.corrected
 from groups g join candidates c on c.content_id=g.content_id and c.number=g.number
 order by c.title collate "C",g.key limit least(greatest(p_limit,1),100) offset greatest(p_offset,0)
), result as (
 select p.*,coalesce((select jsonb_agg(to_jsonb(a)-'page_id') from public.math_effective_assessments a where a.page_id=p.page_id),'[]'::jsonb) assessments,
 coalesce((select jsonb_agg(jsonb_build_object('path',l.path,'drive_id',l.drive_id,'status',l.drive_status,'error',l.error,'source',l.source_metadata)) from public.math_locations l where l.content_id=p.content_id and l.active),'[]'::jsonb) locations
 from paged p
)
select jsonb_build_object(
 'total',(select count(*) from groups),
 'pages',(select count(*) from candidates),
 'items',coalesce((select jsonb_agg(to_jsonb(r)) from result r),'[]'::jsonb),
 'facets',jsonb_build_object(
 'topics',coalesce((select jsonb_agg(to_jsonb(t)) from (select a.topic value,count(distinct c.id) count from candidates c join public.math_effective_assessments a on a.page_id=c.id group by a.topic)t),'[]'::jsonb),
 'grades',coalesce((select jsonb_agg(to_jsonb(t)) from (select grade value,count(distinct c.id) count from candidates c join public.math_effective_assessments a on a.page_id=c.id cross join lateral generate_series(a.grade_min,a.grade_max) grade group by grade)t),'[]'::jsonb),
 'difficulties',coalesce((select jsonb_agg(to_jsonb(t)) from (select a.difficulty value,count(distinct c.id) count from candidates c join public.math_effective_assessments a on a.page_id=c.id where a.difficulty is not null group by a.difficulty)t),'[]'::jsonb)
 ))
$$;
revoke all on function public.math_search(jsonb,integer,integer) from public,anon;
grant execute on function public.math_search(jsonb,integer,integer) to authenticated;
create function public.math_stats() returns jsonb language sql stable security invoker set search_path='' as $$
select jsonb_build_object(
 'files',(select count(*) from public.math_locations where active),
 'contents',(select count(*) from public.math_contents),
 'pages',(select count(*) from public.math_pages),
 'original_pages',(select coalesce(sum(c.page_count),0) from public.math_locations l join public.math_contents c on c.id=l.content_id where l.active),
 'complete',(select count(*) from public.math_pages p where p.status='complete' or exists(select 1 from public.math_overrides o where o.page_id=p.id)),
 'review',(select count(*) from public.math_pages p where p.status='review' and not exists(select 1 from public.math_overrides o where o.page_id=p.id)),
 'pending',(select count(*) from public.math_pages p where p.status='pending' and not exists(select 1 from public.math_overrides o where o.page_id=p.id)),
 'errors',(select coalesce(jsonb_agg(jsonb_build_object('path',l.path,'error',l.error,'drive_id',l.drive_id,'drive_status',l.drive_status)),'[]'::jsonb) from public.math_locations l where l.active and l.error is not null)
)
$$;
revoke all on function public.math_stats() from public,anon;
grant execute on function public.math_stats() to authenticated;
