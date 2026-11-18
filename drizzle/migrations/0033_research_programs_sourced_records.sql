ALTER TABLE public.research_programs
  ADD COLUMN name_ar text, ADD COLUMN university_ar text, ADD COLUMN degree_ar text, ADD COLUMN summary_ar text,
  ADD COLUMN source_name text, ADD COLUMN source_name_ar text, ADD COLUMN source_url text, ADD COLUMN last_verified_at date,
  ADD COLUMN internal_notes text,
  ADD COLUMN review_status text NOT NULL DEFAULT 'needs_check' CHECK (review_status IN ('needs_check','editorial_reviewed','verified')),
  ADD COLUMN is_active boolean NOT NULL DEFAULT false;
UPDATE public.research_programs SET is_active = false, review_status = 'needs_check';
CREATE FUNCTION public.validate_research_program() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
IF NEW.is_active AND (nullif(trim(NEW.source_url),'') IS NULL OR NEW.last_verified_at IS NULL) THEN RAISE EXCEPTION 'Activation requires a source URL and verification date'; END IF;
IF NEW.is_active AND NEW.review_status NOT IN ('editorial_reviewed','verified') THEN RAISE EXCEPTION 'Activation requires a reviewed status'; END IF;
IF NEW.last_verified_at > CURRENT_DATE THEN RAISE EXCEPTION 'Verification date cannot be in the future'; END IF;
IF NEW.source_url IS NOT NULL AND (NEW.source_url !~ '^https?://' OR NEW.source_url ~* '\.pdf([?#]|$)') THEN RAISE EXCEPTION 'Source must be an HTTP website, not a PDF'; END IF;
RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.validate_research_program() FROM PUBLIC;
CREATE TRIGGER research_programs_validate BEFORE INSERT OR UPDATE ON public.research_programs FOR EACH ROW EXECUTE FUNCTION public.validate_research_program();
DROP POLICY IF EXISTS "Public read access to research_programs" ON public.research_programs;
CREATE POLICY research_programs_public ON public.research_programs FOR SELECT TO anon, authenticated USING (is_active AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY research_programs_admin ON public.research_programs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
GRANT ALL ON public.research_programs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.research_programs TO authenticated;
REVOKE ALL ON public.research_programs FROM anon;
GRANT SELECT (id, slug, name, name_ar, university, university_ar, governorate_slug, field, degree, degree_ar, languages, summary, summary_ar, description, images, tags, source_status, source_owner, verified_at, data_class, created_at, updated_at, governance_status, source_name, source_name_ar, source_url, last_verified_at, review_status, is_active) ON public.research_programs TO anon;