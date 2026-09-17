-- Tre-og-noget: private per-account progress and idempotent answer history.
create table public.tre_og_noget_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('nw','ne','south','all','preferences')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, mode)
);
create table public.tre_og_noget_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.tre_og_noget_progress enable row level security;
alter table public.tre_og_noget_events enable row level security;
grant select, insert, update on public.tre_og_noget_progress to authenticated;
grant select, insert on public.tre_og_noget_events to authenticated;
revoke all on public.tre_og_noget_progress, public.tre_og_noget_events from anon;
create policy own_progress on public.tre_og_noget_progress to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_events on public.tre_og_noget_events to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.tre_og_noget_sync(op jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := auth.uid(); event_id uuid; m text; kind text; p jsonb; c jsonb;
  idx integer; n integer; ms numeric; expected integer; correct boolean; gap integer;
begin
  if uid is null then raise exception 'Login required'; end if;
  -- Serialize this account's devices. Retries of a recorded event are harmless.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 517));
  if op is not null then
    event_id := (op->>'id')::uuid; m := op->>'mode'; kind := op->>'kind';
    if event_id is null or m is null or m not in ('nw','ne','south','all','preferences')
      or kind is null or kind not in ('seed','answer','reset','preferences') then
      raise exception 'Invalid operation';
    end if;
    if not exists(select 1 from public.tre_og_noget_events where user_id=uid and id=event_id) then
      select data into p from public.tre_og_noget_progress where user_id=uid and mode=m;
      if kind='seed' then
        if p is null then
          if jsonb_typeof(op->'data') <> 'object' then raise exception 'Invalid initial state'; end if;
          p := op->'data';
        end if;
      elsif kind='preferences' then
        if m <> 'preferences' or jsonb_typeof(op->'data') <> 'object' then raise exception 'Invalid preferences'; end if;
        p := coalesce(p,'{}'::jsonb) || (op->'data');
      elsif kind='reset' then
        if m='preferences' or jsonb_array_length(op->'data'->'cards') <> 45 then raise exception 'Invalid reset'; end if;
        p := op->'data';
      else
        if p is null or m='preferences' then raise exception 'Missing progress'; end if;
        if op->>'side' not in ('nw','ne','south') or (m<>'all' and m<>op->>'side') then raise exception 'Invalid side'; end if;
        ms := (op->>'ms')::numeric;
        if ms is null or ms<0 or (op->>'value')::integer not between 0 and 9 then raise exception 'Invalid answer'; end if;
        select value, ordinality::integer-1 into c,idx
          from jsonb_array_elements(p->'cards') with ordinality where value->>'id'=op->>'card';
        if c is null then raise exception 'Invalid card'; end if;
        expected := (c->>case op->>'side' when 'nw' then 'a' when 'ne' then 'b' else 'c' end)::integer;
        correct := (op->>'value')::integer=expected;
        n := coalesce((p->>'round')::integer,0)+1;
        gap := case when correct then greatest(2,round(14-least(ms,3000)/250)::integer) else 1 end;
        c := c || jsonb_build_object('attempts',(c->>'attempts')::integer+1,
          'hits',least(3,(c->>'hits')::integer+case when correct and ms<=1000 then 1 else 0 end),
          'due',n+gap,'lastMs',ms);
        p := jsonb_set(p,array['cards',idx::text],c) || jsonb_build_object('round',n,'lastId',op->>'card');
      end if;
      insert into public.tre_og_noget_progress(user_id,mode,data) values(uid,m,p)
        on conflict(user_id,mode) do update set data=excluded.data,updated_at=now();
      insert into public.tre_og_noget_events(user_id,id,payload) values(uid,event_id,op);
    end if;
  end if;
  return coalesce((select jsonb_object_agg(mode,data) from public.tre_og_noget_progress where user_id=uid),'{}'::jsonb);
end;
$$;
revoke execute on function public.tre_og_noget_sync(jsonb) from public, anon;
grant execute on function public.tre_og_noget_sync(jsonb) to authenticated;
