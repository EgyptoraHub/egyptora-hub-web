-- Prompt 36 Stage 4: owner switch for DEMO traveller stories. Missing row = ON (current behaviour).
CREATE OR REPLACE FUNCTION public.show_demo_stories()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT (value->>'enabled')::boolean FROM public.site_settings WHERE key = 'show_demo_stories'), true)
$$;
REVOKE ALL ON FUNCTION public.show_demo_stories() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.show_demo_stories() TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Public reads published, consented traveller stories" ON public.traveller_stories;
CREATE POLICY "Public reads published, consented traveller stories" ON public.traveller_stories
  FOR SELECT TO anon, authenticated
  USING (
    moderation_state = 'PUBLISHED'
    AND (video_url IS NULL OR (consent_status <> 'none' AND COALESCE(TRIM(BOTH FROM rights_statement), '') <> ''))
    AND (source_status IS DISTINCT FROM 'DEMO' OR public.show_demo_stories())
  );

INSERT INTO public.site_settings (key, value) VALUES ('show_demo_stories', '{"enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;