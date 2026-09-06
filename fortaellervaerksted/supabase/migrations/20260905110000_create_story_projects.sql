create table if not exists public.story_projects (
  id text primary key,
  owner_email text not null,
  title text not null default 'Ny historie',
  project jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  saved_at timestamptz not null default now()
);

create index if not exists story_projects_owner_saved_idx
  on public.story_projects (owner_email, saved_at desc);

alter table public.story_projects enable row level security;

revoke all on table public.story_projects from anon, authenticated;
grant select, insert, update, delete on table public.story_projects to service_role;
