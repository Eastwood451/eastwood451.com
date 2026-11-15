-- Separate fields preserve independent edits and leave source_meta intact.
alter table public.smfi_gambits
 add column analysis_purpose jsonb not null default '{}'::jsonb,
 add column analysis_mechanism jsonb not null default '{}'::jsonb,
 add column analysis_culpability jsonb not null default '{}'::jsonb,
 add constraint smfi_gambits_purpose_object check (jsonb_typeof(analysis_purpose)='object'),
 add constraint smfi_gambits_mechanism_object check (jsonb_typeof(analysis_mechanism)='object'),
 add constraint smfi_gambits_culpability_object check (jsonb_typeof(analysis_culpability)='object');

-- Existing approved-editor RLS policies and revision trigger still apply.
grant update (analysis_purpose,analysis_mechanism,analysis_culpability)
 on public.smfi_gambits to authenticated;
notify pgrst, 'reload schema';
