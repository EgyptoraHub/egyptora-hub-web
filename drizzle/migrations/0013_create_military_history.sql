CREATE TABLE public.military_eras (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  number int not null,
  name_ar text not null,
  name_en text not null,
  start_label_ar text, start_label_en text, end_label_ar text, end_label_en text,
  sort_order int not null default 0,
  rulers_ar text, rulers_en text, key_leadership_ar text, key_leadership_en text,
  intro_ar text, intro_en text,
  egypt_era_id text references public.eras(key) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.military_records (
  id uuid primary key default gen_random_uuid(),
  register_no int unique not null check (register_no > 0),
  slug text unique not null,
  era_id uuid not null references public.military_eras(id) on delete restrict,
  record_type text not null check (record_type in ('battle','war','campaign','siege','naval','air','operation','defensive_action','conflict_phase','other_record')),
  title_ar text, title_en text not null, alt_names text,
  date_label_ar text, date_label_en text,
  year_from int, year_to int,
  place_ar text, place_en text,
  lat numeric check (lat between -90 and 90), lng numeric check (lng between -180 and 180),
  egyptian_leadership_ar text, egyptian_leadership_en text,
  opposing_side_ar text, opposing_side_en text,
  outcome text not null default 'not_assessed' check (outcome in ('egyptian_victory','defeat','inconclusive','disputed','strategic_withdrawal','not_assessed')),
  note_ar text, note_en text, significance_ar text, significance_en text,
  review_status text not null default 'needs_check' check (review_status in ('needs_check','editorial_reviewed','verified')),
  source_url text, last_verified_at date,
  is_featured boolean not null default false,
  is_active boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.military_figures (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text, name_en text not null,
  role_ar text, role_en text,
  era_id uuid references public.military_eras(id) on delete set null,
  years_label_ar text, years_label_en text,
  bio_ar text, bio_en text,
  portrait_media_id uuid,
  review_status text not null default 'needs_check' check (review_status in ('needs_check','editorial_reviewed','verified')),
  is_active boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.military_record_figures (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.military_records(id) on delete cascade,
  figure_id uuid not null references public.military_figures(id) on delete cascade,
  role_label text,
  unique (record_id, figure_id)
);

CREATE TABLE public.military_media (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.military_records(id) on delete cascade,
  figure_id uuid references public.military_figures(id) on delete cascade,
  era_id uuid references public.military_eras(id) on delete cascade,
  kind text not null check (kind in ('image','video','map','document')),
  url text not null,
  title_ar text, title_en text, caption_ar text, caption_en text,
  institution text, accession_id text,
  rights_statement text not null,
  origin_type text not null check (origin_type in ('original_artifact','archival_photo','historical_artwork','map','editorial_reconstruction')),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.military_sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('primary','scholarly','institutional')),
  title text not null, author text, publisher text, year text, url text, notes text,
  review_status text not null default 'needs_check' check (review_status in ('needs_check','editorial_reviewed','verified')),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE public.military_record_sources (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.military_records(id) on delete cascade,
  source_id uuid not null references public.military_sources(id) on delete cascade,
  citation_detail text,
  unique (record_id, source_id)
);

CREATE TABLE public.military_reports (
  id uuid primary key default gen_random_uuid(),
  record_id uuid references public.military_records(id) on delete set null,
  message text not null check (char_length(message) between 5 and 500),
  contact_email text,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

-- Grants: anon reads only public columns; writes are admin-only via authenticated + RLS.
GRANT SELECT ON public.military_eras, public.military_record_figures, public.military_record_sources TO anon;
GRANT SELECT (id, register_no, slug, era_id, record_type, title_ar, title_en, alt_names, date_label_ar, date_label_en, year_from, year_to, place_ar, place_en, lat, lng, egyptian_leadership_ar, egyptian_leadership_en, opposing_side_ar, opposing_side_en, outcome, note_ar, note_en, significance_ar, significance_en, review_status, source_url, last_verified_at, is_featured, is_active, created_at, updated_at) ON public.military_records TO anon;
GRANT SELECT (id, slug, name_ar, name_en, role_ar, role_en, era_id, years_label_ar, years_label_en, bio_ar, bio_en, portrait_media_id, review_status, is_active, created_at) ON public.military_figures TO anon;
GRANT SELECT (id, record_id, figure_id, era_id, kind, url, title_ar, title_en, caption_ar, caption_en, institution, accession_id, rights_statement, origin_type, is_active) ON public.military_media TO anon;
GRANT SELECT (id, kind, title, author, publisher, year, url, review_status, is_active) ON public.military_sources TO anon;
GRANT INSERT ON public.military_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.military_eras, public.military_records, public.military_figures, public.military_record_figures, public.military_media, public.military_sources, public.military_record_sources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.military_reports TO authenticated;
GRANT ALL ON public.military_eras, public.military_records, public.military_figures, public.military_record_figures, public.military_media, public.military_sources, public.military_record_sources, public.military_reports TO service_role;

ALTER TABLE public.military_eras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_record_figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_record_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.military_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active military eras" ON public.military_eras FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Public reads visible military records" ON public.military_records FOR SELECT TO anon, authenticated USING (is_active = true AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY "Public reads visible military figures" ON public.military_figures FOR SELECT TO anon, authenticated USING (is_active = true AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY "Public reads rights-cleared military media" ON public.military_media FOR SELECT TO anon, authenticated USING (is_active = true AND coalesce(trim(institution),'') <> '' AND coalesce(trim(rights_statement),'') <> '');
CREATE POLICY "Public reads visible military sources" ON public.military_sources FOR SELECT TO anon, authenticated USING (is_active = true AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY "Public reads visible record-figure links" ON public.military_record_figures FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.military_records r WHERE r.id = record_id AND r.is_active AND r.review_status IN ('editorial_reviewed','verified'))
  AND EXISTS (SELECT 1 FROM public.military_figures f WHERE f.id = figure_id AND f.is_active AND f.review_status IN ('editorial_reviewed','verified')));
CREATE POLICY "Public reads visible record-source links" ON public.military_record_sources FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.military_records r WHERE r.id = record_id AND r.is_active AND r.review_status IN ('editorial_reviewed','verified'))
  AND EXISTS (SELECT 1 FROM public.military_sources s WHERE s.id = source_id AND s.is_active AND s.review_status IN ('editorial_reviewed','verified')));

CREATE POLICY "Admins manage military eras" ON public.military_eras FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage military records" ON public.military_records FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage military figures" ON public.military_figures FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage record figures" ON public.military_record_figures FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage military media" ON public.military_media FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage military sources" ON public.military_sources FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage record sources" ON public.military_record_sources FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone can report a military record" ON public.military_reports FOR INSERT TO anon, authenticated WITH CHECK (handled = false);
CREATE POLICY "Admins read military reports" ON public.military_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update military reports" ON public.military_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete military reports" ON public.military_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER military_eras_touch BEFORE UPDATE ON public.military_eras FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER military_records_touch BEFORE UPDATE ON public.military_records FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER military_figures_touch BEFORE UPDATE ON public.military_figures FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER military_media_touch BEFORE UPDATE ON public.military_media FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER military_sources_touch BEFORE UPDATE ON public.military_sources FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.military_reports_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.military_reports WHERE created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'Too many reports, please try again shortly';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER military_reports_rate_limit BEFORE INSERT ON public.military_reports FOR EACH ROW EXECUTE FUNCTION public.military_reports_rate_limit();