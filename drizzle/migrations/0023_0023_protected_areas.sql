CREATE TABLE public.protected_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null check (length(trim(name_ar)) > 0),
  name_en text,
  governorate_slug text,
  declared_year integer check (declared_year is null or declared_year between 1800 and 2100),
  area_km2 numeric check (area_km2 is null or area_km2 >= 0),
  summary_ar text, summary_en text,
  source_url text, source_note text,
  review_status text not null default 'needs_check',
  is_active boolean not null default false,
  internal_notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE UNIQUE INDEX protected_areas_name_ar_key ON public.protected_areas (name_ar);
REVOKE ALL ON public.protected_areas FROM anon, authenticated;
GRANT SELECT (id, slug, name_ar, name_en, governorate_slug, declared_year, area_km2, summary_ar, summary_en, source_url, source_note, review_status, is_active, sort_order, created_at, updated_at) ON public.protected_areas TO anon, authenticated;
GRANT ALL ON public.protected_areas TO service_role;
ALTER TABLE public.protected_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible protected areas" ON public.protected_areas FOR SELECT TO anon, authenticated USING (is_active = true AND review_status IN ('editorial_reviewed','verified'));
CREATE TRIGGER protected_areas_touch BEFORE UPDATE ON public.protected_areas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();