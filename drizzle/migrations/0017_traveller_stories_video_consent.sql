ALTER TABLE public.traveller_stories
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS creator_name text,
  ADD COLUMN IF NOT EXISTS creator_url text,
  ADD COLUMN IF NOT EXISTS consent_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS rights_statement text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer,
  ADD COLUMN IF NOT EXISTS language_code text,
  ADD COLUMN IF NOT EXISTS internal_notes text;

ALTER TABLE public.traveller_stories
  ADD CONSTRAINT traveller_stories_consent_status_check CHECK (consent_status IN ('none','creator_confirmed','licensed')),
  ADD CONSTRAINT traveller_stories_video_url_check CHECK (video_url IS NULL OR video_url ~* '^https://(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com|player\.vimeo\.com)/'),
  ADD CONSTRAINT traveller_stories_creator_url_check CHECK (creator_url IS NULL OR creator_url ~* '^https://'),
  ADD CONSTRAINT traveller_stories_duration_check CHECK (duration_seconds IS NULL OR duration_seconds BETWEEN 1 AND 86400);

DROP POLICY IF EXISTS "Public read access to published traveller_stories" ON public.traveller_stories;
CREATE POLICY "Public reads published, consented traveller stories" ON public.traveller_stories
  FOR SELECT TO anon, authenticated
  USING (
    moderation_state = 'PUBLISHED'
    AND (video_url IS NULL OR (consent_status <> 'none' AND coalesce(trim(rights_statement), '') <> ''))
  );

REVOKE ALL ON public.traveller_stories FROM anon, authenticated, PUBLIC;
GRANT SELECT (id, slug, name, summary, description, country, group_type, destinations, rating, positives, negatives, suggestions, media_type, images, tags, source_status, source_owner, verified_at, data_class, governance_status, created_at, updated_at, video_url, creator_name, creator_url, consent_status, rights_statement, duration_seconds, language_code)
  ON public.traveller_stories TO anon, authenticated;
GRANT ALL ON public.traveller_stories TO service_role;

CREATE TABLE public.traveller_story_reports (
  id uuid primary key default gen_random_uuid(),
  story_id text references public.traveller_stories(id) on delete set null,
  message text not null check (char_length(message) between 5 and 500),
  created_at timestamptz not null default now(),
  handled boolean not null default false
);
REVOKE ALL ON public.traveller_story_reports FROM anon, authenticated;
GRANT INSERT (story_id, message) ON public.traveller_story_reports TO anon, authenticated;
GRANT ALL ON public.traveller_story_reports TO service_role;
ALTER TABLE public.traveller_story_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report a traveller story" ON public.traveller_story_reports FOR INSERT TO anon, authenticated WITH CHECK (handled = false);

CREATE OR REPLACE FUNCTION public.traveller_story_reports_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.traveller_story_reports WHERE created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'Too many reports, please try again shortly';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER traveller_story_reports_rate_limit BEFORE INSERT ON public.traveller_story_reports FOR EACH ROW EXECUTE FUNCTION public.traveller_story_reports_rate_limit();