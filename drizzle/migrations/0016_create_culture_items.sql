CREATE TABLE public.culture_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  section text not null check (section in ('cuisine','fashion','jewelry_accessories')),
  category text,
  name_ar text,
  name_en text,
  governorate_id text references public.governorates(id) on delete set null,
  region_ar text, region_en text,
  summary_ar text, summary_en text,
  story_ar text, story_en text,
  origin_note_ar text, origin_note_en text,
  ingredients_ar text, ingredients_en text,
  materials_ar text, materials_en text,
  occasion_ar text, occasion_en text,
  video_url text check (video_url is null or video_url ~* '^https://(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com|player\.vimeo\.com)/'),
  marketplace_collection text check (marketplace_collection is null or marketplace_collection in ('wear-egypt','handmade-crafts')),
  review_status text not null default 'needs_check' check (review_status in ('needs_check','editorial_reviewed','verified')),
  source_url text,
  last_verified_at date,
  is_featured boolean not null default false,
  is_active boolean not null default false,
  access_level text not null default 'free' check (access_level in ('free','premium')),
  internal_notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  CONSTRAINT culture_items_name_required CHECK (name_ar is not null or name_en is not null)
);
CREATE INDEX culture_items_section_idx ON public.culture_items(section);
CREATE INDEX culture_items_gov_idx ON public.culture_items(governorate_id);
CREATE UNIQUE INDEX culture_items_section_name_ar_key ON public.culture_items(section, name_ar) WHERE name_ar IS NOT NULL;

CREATE TABLE public.culture_media (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.culture_items(id) on delete cascade,
  kind text not null default 'image' check (kind in ('image','video')),
  url text not null,
  caption_ar text, caption_en text,
  institution text,
  rights_statement text not null,
  origin_type text not null default 'photo' check (origin_type in ('photo','archival','illustration','editorial_reconstruction')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.culture_reports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.culture_items(id) on delete set null,
  message text not null check (char_length(message) between 5 and 500),
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

REVOKE ALL ON public.culture_items, public.culture_media, public.culture_reports FROM anon, authenticated;
GRANT SELECT (id, slug, section, category, name_ar, name_en, governorate_id, region_ar, region_en, summary_ar, summary_en, story_ar, story_en, origin_note_ar, origin_note_en, ingredients_ar, ingredients_en, materials_ar, materials_en, occasion_ar, occasion_en, video_url, marketplace_collection, review_status, source_url, last_verified_at, is_featured, is_active, sort_order, created_at, updated_at) ON public.culture_items TO anon, authenticated;
GRANT SELECT (id, item_id, kind, url, caption_ar, caption_en, institution, rights_statement, origin_type, is_active) ON public.culture_media TO anon, authenticated;
GRANT INSERT (item_id, message) ON public.culture_reports TO anon, authenticated;
GRANT ALL ON public.culture_items, public.culture_media, public.culture_reports TO service_role;

ALTER TABLE public.culture_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culture_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culture_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads visible culture items" ON public.culture_items FOR SELECT TO anon, authenticated USING (is_active = true AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY "Public reads rights-cleared culture media" ON public.culture_media FOR SELECT TO anon, authenticated USING (
  is_active = true AND coalesce(trim(institution),'') <> '' AND coalesce(trim(rights_statement),'') <> ''
  AND EXISTS (SELECT 1 FROM public.culture_items i WHERE i.id = item_id AND i.is_active AND i.review_status IN ('editorial_reviewed','verified')));
CREATE POLICY "Anyone can report a culture item" ON public.culture_reports FOR INSERT TO anon, authenticated WITH CHECK (handled = false);

CREATE TRIGGER culture_items_touch BEFORE UPDATE ON public.culture_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER culture_media_touch BEFORE UPDATE ON public.culture_media FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.culture_reports_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.culture_reports WHERE created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'Too many reports, please try again shortly';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER culture_reports_rate_limit BEFORE INSERT ON public.culture_reports FOR EACH ROW EXECUTE FUNCTION public.culture_reports_rate_limit();