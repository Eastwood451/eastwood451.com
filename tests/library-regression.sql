-- Transactional regression fixtures; every change is rolled back.
begin;
insert into math_contents(id,title,page_count) values(repeat('f',64),'zz_codex_regression_mix',3),(repeat('e',64),'zz_codex_regression_match',1);
insert into math_locations(path,content_id,bytes,drive_id,drive_status) values('zz_codex_regression_mix',repeat('f',64),1,'test','verified'),('zz_codex_regression_match',repeat('e',64),1,'test','verified');
insert into math_pages(id,content_id,number,search_text,status,subject,material_type)
select repeat('f',64)||':'||n,repeat('f',64),n,'zzcodexregression blandede brøker','complete','math','student' from generate_series(1,3)n;
insert into math_pages(id,content_id,number,search_text,status,subject,material_type)values(repeat('e',64)||':1',repeat('e',64),1,'zzcodexregression lette brøker','complete','math','student');
insert into math_assessments(page_id,origin,ordinal,topic,grade_min,grade_max,difficulty)values
(repeat('f',64)||':1','ai',1,'geometri',3,3,'let'),(repeat('f',64)||':2','ai',1,'broeker',3,3,'svaer'),(repeat('f',64)||':3','ai',1,'broeker',6,6,'let'),(repeat('e',64)||':1','ai',1,'broeker',3,3,'let');
select set_config('request.jwt.claim.sub',(select user_id::text from math_owners limit 1),true);
set local role authenticated;
do $$declare r jsonb; cid uuid;begin
 r:=math_search('{"q":"zzcodexregression","grade":"3","topic":"broeker","difficulty":"let"}');
 if (r->>'total')::int<>1 or r->'items'->0->>'content_id'<>repeat('e',64) then raise exception 'Cross-page filter regression';end if;
 perform math_correct_page(repeat('e',64)||':1','{"summary":"Ændret: æ ø å","subject":"math","material_type":"student","assessments":[{"topic":"geometri","subtopic":"Vinkler","skill":"Måle","grade_min":3,"grade_max":3,"difficulty":"let"}]}');
 r:=math_search('{"q":"zzcodexregression","grade":"3","topic":"broeker","difficulty":"let"}');
 if (r->>'total')::int<>0 then raise exception 'Manual override ignored';end if;
 insert into math_saved_filters(name,filters)values('zz_codex_regression','{"grade":"3","topic":"geometri"}');
 insert into math_collections(name)values('zz_codex_regression') returning id into cid;
 insert into math_collection_items(collection_id,page_id)values(cid,repeat('e',64)||':1');
 r:=math_search(jsonb_build_object('collection',cid,'view','pages','scope','all'));
 if (r->>'total')::int<>1 then raise exception 'Collection read-back failed';end if;
end$$;
reset role;
-- Same operations as reimport and reanalysis: user records must survive.
insert into math_pages(id,content_id,number,search_text)values(repeat('e',64)||':1',repeat('e',64),1,'zzcodexregression genimport')on conflict(id)do update set search_text=excluded.search_text;
delete from math_assessments where page_id=repeat('e',64)||':1' and origin='ai';
insert into math_assessments(page_id,origin,ordinal,topic,grade_min,grade_max,difficulty)values(repeat('e',64)||':1','ai',1,'broeker',6,6,'svaer');
set local role authenticated;
do $$declare r jsonb;begin
 r:=math_search('{"q":"zzcodexregression","grade":"3","topic":"geometri","difficulty":"let","view":"pages"}');
 if (r->>'total')::int<>2 then raise exception 'Reimport lost manual tags';end if;
 if not exists(select 1 from math_overrides where page_id=repeat('e',64)||':1' and summary='Ændret: æ ø å')then raise exception 'Danish text/override lost';end if;
 if not exists(select 1 from math_saved_filters where name='zz_codex_regression' and filters->>'grade'='3')then raise exception 'Saved filter lost';end if;
 if not exists(select 1 from math_collection_items where page_id=repeat('e',64)||':1')then raise exception 'Collection lost';end if;
end$$;
reset role;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
do $$begin
 if math_is_owner() or exists(select 1 from math_pages) or exists(select 1 from math_locations) or exists(select 1 from math_collection_items)then raise exception 'Nonowner RLS leak';end if;
 if has_table_privilege('anon','public.math_effective_assessments','select') or has_table_privilege('anon','public.math_pages','select') or has_function_privilege('anon','public.math_search(jsonb,integer,integer)','execute')then raise exception 'Anonymous permission leak';end if;
end$$;
rollback;
select 'PASS: same-page/assessment filters, manual override, reimport, collections, saved filters, Danish text and nonowner/anonymous access' as regression;
