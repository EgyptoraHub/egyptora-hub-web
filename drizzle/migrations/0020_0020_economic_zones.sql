CREATE TABLE public.economic_zones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  zone_type text not null,
  name_ar text not null check (length(trim(name_ar)) > 0),
  name_en text,
  governorate_slug text,
  listed_under text,
  managing_body_ar text, managing_body_en text,
  summary_ar text, summary_en text,
  source_url text, source_note text,
  last_verified_at date,
  review_status text not null default 'needs_check' check (review_status in ('needs_check','editorial_reviewed','verified')),
  is_active boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX economic_zones_type_idx ON public.economic_zones(zone_type);
CREATE INDEX economic_zones_gov_idx ON public.economic_zones(governorate_slug);

CREATE TABLE public.zone_facts (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  text_ar text, text_en text,
  source_name text, source_url text, source_date date,
  review_status text not null default 'needs_check' check (review_status in ('needs_check','editorial_reviewed','verified')),
  is_active boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  CONSTRAINT zone_facts_text_required CHECK (text_ar is not null or text_en is not null)
);

REVOKE ALL ON public.economic_zones, public.zone_facts FROM anon, authenticated;
GRANT SELECT (id, slug, zone_type, name_ar, name_en, governorate_slug, listed_under, managing_body_ar, managing_body_en, summary_ar, summary_en, source_url, last_verified_at, review_status, is_active, created_at, updated_at) ON public.economic_zones TO anon, authenticated;
GRANT SELECT (id, topic, text_ar, text_en, source_name, source_url, source_date, review_status, is_active, created_at, updated_at) ON public.zone_facts TO anon, authenticated;
GRANT ALL ON public.economic_zones, public.zone_facts TO service_role;

ALTER TABLE public.economic_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads visible economic zones" ON public.economic_zones FOR SELECT TO anon, authenticated USING (is_active = true AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY "Public reads visible zone facts" ON public.zone_facts FOR SELECT TO anon, authenticated USING (is_active = true AND review_status IN ('editorial_reviewed','verified'));

CREATE TRIGGER economic_zones_touch BEFORE UPDATE ON public.economic_zones FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER zone_facts_touch BEFORE UPDATE ON public.zone_facts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();