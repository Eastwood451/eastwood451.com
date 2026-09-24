-- The planner otherwise rescans math_contents for every matching page, exceeding
-- the anonymous API statement timeout. Scope the join choice to this RPC only.
alter function public.math_search(jsonb, integer, integer)
  set enable_nestloop = off;
