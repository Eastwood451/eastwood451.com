-- Private, capability-scoped diagram bridge. No access from public browser roles.
create table if not exists public.smfi_mcp_workspaces (
 id uuid primary key default gen_random_uuid(),
 owner_hash text not null unique,
 label text not null default 'Nested Actor',
 state jsonb not null,
 revision integer not null default 1 check (revision > 0),
 source text not null default 'browser',
 connected_at timestamptz,
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 check (octet_length(state::text) <= 1200000)
);
create table if not exists public.smfi_mcp_history (
 workspace_id uuid not null references public.smfi_mcp_workspaces(id) on delete cascade,
 revision integer not null,
 state jsonb not null,
 source text not null,
 created_at timestamptz not null default now(),
 primary key (workspace_id,revision)
);
create table if not exists public.smfi_mcp_oauth (
 id text primary key,
 kind text not null check (kind in ('client','request','code','access','refresh','rate')),
 workspace_id uuid references public.smfi_mcp_workspaces(id) on delete cascade,
 payload jsonb not null default '{}',
 expires_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index if not exists smfi_mcp_oauth_expiry on public.smfi_mcp_oauth(expires_at);
create index if not exists smfi_mcp_oauth_workspace on public.smfi_mcp_oauth(workspace_id) where workspace_id is not null;
alter table public.smfi_mcp_workspaces enable row level security;
alter table public.smfi_mcp_history enable row level security;
alter table public.smfi_mcp_oauth enable row level security;
revoke all on public.smfi_mcp_workspaces, public.smfi_mcp_history, public.smfi_mcp_oauth from public,anon,authenticated;
grant select,insert,update,delete on public.smfi_mcp_workspaces, public.smfi_mcp_history, public.smfi_mcp_oauth to service_role;
create or replace function public.smfi_mcp_keep_history() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if new.revision <> old.revision + 1 then raise exception 'Revision must advance by one'; end if;
 insert into public.smfi_mcp_history(workspace_id,revision,state,source)
 values(old.id,old.revision,old.state,old.source) on conflict do nothing;
 delete from public.smfi_mcp_history where workspace_id=old.id and revision < new.revision-30;
 return new;
end;
$$;
revoke all on function public.smfi_mcp_keep_history() from public,anon,authenticated;
grant execute on function public.smfi_mcp_keep_history() to service_role;
drop trigger if exists smfi_mcp_history_trigger on public.smfi_mcp_workspaces;
create trigger smfi_mcp_history_trigger before update of state on public.smfi_mcp_workspaces
 for each row execute function public.smfi_mcp_keep_history();
