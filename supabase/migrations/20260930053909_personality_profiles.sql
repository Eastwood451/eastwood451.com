create table public.personality_documents (
 user_id uuid primary key references auth.users(id) on delete cascade,
 people jsonb not null default '[]'::jsonb,
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now(),
 constraint personality_people_array check (jsonb_typeof(people) = 'array'),
 constraint personality_people_limit check (jsonb_array_length(people) <= 500),
 constraint personality_document_size check (octet_length(people::text) <= 2000000)
);
alter table public.personality_documents enable row level security;
revoke all on public.personality_documents from anon;
grant select, insert, update, delete on public.personality_documents to authenticated;
create policy personality_read_own on public.personality_documents for select to authenticated using ((select auth.uid()) = user_id);
create policy personality_insert_own on public.personality_documents for insert to authenticated with check ((select auth.uid()) = user_id);
create policy personality_update_own on public.personality_documents for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy personality_delete_own on public.personality_documents for delete to authenticated using ((select auth.uid()) = user_id);
