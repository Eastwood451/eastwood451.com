-- The public RLS query plan underestimated candidate rows and scanned all
-- contents once per matching page (17k scans). Prefer hash/merge joins only
-- within this function; other apps and queries retain their planner settings.
alter function public.math_search(jsonb,integer,integer) set enable_nestloop=off;
