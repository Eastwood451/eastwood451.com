create or replace function public.math_search(p_filters jsonb default '{}',p_offset integer default 0,p_limit integer default 30)
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
 select p.id,p.content_id,p.number,c.title
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
 min(c.content_id) content_id,min(c.number) number,min(c.title) title,count(*) matched_pages
 from candidates c cross join options o group by 1
), selected as materialized (
 select g.* from groups g order by g.title collate "C",g.key
 limit least(greatest(p_limit,1),300) offset greatest(p_offset,0)
), paged as (
 select g.*,p.id page_id,c.page_count,coalesce(m.summary,p.summary) summary,
 case when m.page_id is not null then 'complete' else p.status end status,
 coalesce(m.material_type,p.material_type) material_type,coalesce(m.subject,p.subject) subject,
 p.preview_key,m.page_id is not null corrected
 from selected g join public.math_pages p on p.content_id=g.content_id and p.number=g.number
 join public.math_contents c on c.id=g.content_id left join public.math_overrides m on m.page_id=p.id
), facet_assessments as materialized (
 select a.* from candidates c join public.math_effective_assessments a on a.page_id=c.id cross join options o
 where (o.grade is null or o.grade between a.grade_min and a.grade_max)
 and (o.topic is null or a.topic=o.topic)
 and (o.subtopic is null or a.subtopic=o.subtopic)
 and (o.difficulty is null or a.difficulty=o.difficulty)
), result as (
 select p.*,coalesce((select jsonb_agg(to_jsonb(a)-'page_id') from public.math_effective_assessments a where a.page_id=p.page_id),'[]'::jsonb) assessments,
 coalesce((select jsonb_agg(jsonb_build_object('path',l.path,'drive_id',l.drive_id,'status',l.drive_status,'error',l.error,'source',l.source_metadata)) from public.math_locations l where l.content_id=p.content_id and l.active),'[]'::jsonb) locations
 from paged p
)
select jsonb_build_object(
 'total',(select count(*) from groups),
 'pages',(select count(*) from candidates),
 'items',coalesce((select jsonb_agg(to_jsonb(r) order by r.title collate "C",r.key) from result r),'[]'::jsonb),
 'facets',jsonb_build_object(
 'topics',coalesce((select jsonb_agg(to_jsonb(t)) from (select a.topic value,count(distinct a.page_id) count from facet_assessments a group by a.topic)t),'[]'::jsonb),
 'subtopics',coalesce((select jsonb_agg(to_jsonb(t)) from (select a.subtopic value,count(distinct a.page_id) count from facet_assessments a where a.subtopic<>'' group by a.subtopic order by a.subtopic)t),'[]'::jsonb),
 'grades',coalesce((select jsonb_agg(to_jsonb(t)) from (select grade value,count(distinct a.page_id) count from facet_assessments a cross join lateral generate_series(a.grade_min,a.grade_max) grade group by grade)t),'[]'::jsonb),
 'difficulties',coalesce((select jsonb_agg(to_jsonb(t)) from (select a.difficulty value,count(distinct a.page_id) count from facet_assessments a where a.difficulty is not null group by a.difficulty)t),'[]'::jsonb)
 ))
$$;
