-- Owner explicitly requested a public, collaboratively editable library without login.
-- Original PDFs remain in Drive. Imports and AI assessments remain write-protected.
do $$declare t text;begin
 foreach t in array array['math_contents','math_locations','math_pages','math_topics','math_assessments','math_overrides','math_saved_filters','math_collections','math_collection_items'] loop
  execute format('grant select on public.%I to anon',t);
  execute format('create policy public_catalogue_read on public.%I for select to anon using (true)',t);
 end loop;
 foreach t in array array['math_overrides','math_saved_filters','math_collections','math_collection_items'] loop
  execute format('grant insert,update,delete on public.%I to anon',t);
  execute format('create policy shared_insert on public.%I for insert to anon with check (true)',t);
  execute format('create policy shared_update on public.%I for update to anon using (true) with check (true)',t);
  execute format('create policy shared_delete on public.%I for delete to anon using (true)',t);
 end loop;
end$$;
grant insert,update,delete on public.math_assessments to anon;
create policy shared_manual_insert on public.math_assessments for insert to anon with check(origin='manual');
create policy shared_manual_update on public.math_assessments for update to anon using(origin='manual') with check(origin='manual');
create policy shared_manual_delete on public.math_assessments for delete to anon using(origin='manual');
grant select on public.math_effective_assessments to anon;
grant execute on function public.math_search(jsonb,integer,integer),public.math_stats(),public.math_correct_page(text,jsonb) to anon;
create or replace function public.math_correct_page(p_id text,p_data jsonb) returns void
language plpgsql security invoker set search_path='' as $$
begin
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
