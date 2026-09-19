create or replace function public.math_stats() returns jsonb language sql stable security invoker set search_path='' as $$
with active_contents as (select c.* from public.math_contents c where exists(select 1 from public.math_locations l where l.content_id=c.id and l.active)),
active_pages as (select p.* from public.math_pages p join active_contents c on c.id=p.content_id)
select jsonb_build_object(
 'files',(select count(*) from public.math_locations where active),
 'contents',(select count(*) from active_contents),
 'pages',(select count(*) from active_pages),
 'original_pages',(select coalesce(sum(c.page_count),0) from public.math_locations l join public.math_contents c on c.id=l.content_id where l.active),
 'complete',(select count(*) from active_pages p where p.status='complete' or exists(select 1 from public.math_overrides o where o.page_id=p.id)),
 'review',(select count(*) from active_pages p where p.status='review' and not exists(select 1 from public.math_overrides o where o.page_id=p.id)),
 'pending',(select count(*) from active_pages p where p.status='pending' and not exists(select 1 from public.math_overrides o where o.page_id=p.id)),
 'errors',(select coalesce(jsonb_agg(jsonb_build_object('path',l.path,'error',l.error,'drive_id',l.drive_id,'drive_status',l.drive_status)),'[]'::jsonb) from public.math_locations l where l.active and l.error is not null)
)
$$;
revoke all on function public.math_stats() from public,anon;
grant execute on function public.math_stats() to authenticated;
