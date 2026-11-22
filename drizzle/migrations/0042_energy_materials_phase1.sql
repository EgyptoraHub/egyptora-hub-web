CREATE TABLE public.energy_official_bodies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE CHECK(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), name_en text NOT NULL CHECK(length(trim(name_en)) BETWEEN 1 AND 300), name_ar text NOT NULL CHECK(length(trim(name_ar)) BETWEEN 1 AND 300), body_type text NOT NULL CHECK(length(trim(body_type)) BETWEEN 1 AND 200), summary_en text, summary_ar text, official_url text, source_name text, source_name_ar text, source_url text, verified_on date, languages text CHECK(languages IN ('ar','en','ar,en')), review_status text NOT NULL DEFAULT 'needs_check' CHECK(review_status IN ('needs_check','editorial_reviewed','verified')), is_active boolean NOT NULL DEFAULT false, sort_order integer DEFAULT 0, internal_notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.energy_official_bodies TO service_role;
REVOKE ALL ON public.energy_official_bodies FROM anon,authenticated;
GRANT SELECT(id,slug,name_en,name_ar,body_type,summary_en,summary_ar,official_url,source_name,source_name_ar,source_url,verified_on,languages,review_status,is_active,sort_order,created_at,updated_at) ON public.energy_official_bodies TO anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.energy_official_bodies TO authenticated;
ALTER TABLE public.energy_official_bodies ENABLE ROW LEVEL SECURITY;
CREATE POLICY energy_official_bodies_public ON public.energy_official_bodies FOR SELECT TO anon,authenticated USING(is_active AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY energy_official_bodies_admin ON public.energy_official_bodies FOR ALL TO authenticated USING(public.has_role(auth.uid(),'admin')) WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.validate_energy_official_body() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NEW.verified_on > CURRENT_DATE THEN RAISE EXCEPTION 'Verification date cannot be in the future'; END IF;
 IF NEW.source_url IS NOT NULL AND (length(NEW.source_url)>2048 OR NEW.source_url !~ '^https?://' OR NEW.source_url ~* '\.pdf([?#]|$)') THEN RAISE EXCEPTION 'Source must be an HTTP website, not a PDF'; END IF;
 IF NEW.official_url IS NOT NULL AND (length(NEW.official_url)>2048 OR NEW.official_url !~ '^https://') THEN RAISE EXCEPTION 'Official URL must be HTTPS'; END IF;
 IF NEW.is_active AND (nullif(trim(NEW.source_url),'') IS NULL OR NEW.verified_on IS NULL OR NEW.review_status NOT IN ('editorial_reviewed','verified') OR coalesce(NEW.official_url,'') !~ '^https://') THEN RAISE EXCEPTION 'Activation requires source URL, verification date, reviewed status and HTTPS official URL'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER energy_official_bodies_validate BEFORE INSERT OR UPDATE ON public.energy_official_bodies FOR EACH ROW EXECUTE FUNCTION public.validate_energy_official_body();
CREATE TRIGGER energy_official_bodies_touch BEFORE UPDATE ON public.energy_official_bodies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
REVOKE ALL ON FUNCTION public.validate_energy_official_body() FROM PUBLIC;
CREATE TABLE public.energy_partner_interest (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_name text NOT NULL CHECK(length(trim(company_name)) BETWEEN 1 AND 200), country text NOT NULL CHECK(length(trim(country)) BETWEEN 1 AND 100), company_role text NOT NULL CHECK(company_role IN ('buyer/operator','engineering or construction contractor','supplier or manufacturer','recycler or waste handler','logistics provider','other')), disciplines text[] NOT NULL CHECK(cardinality(disciplines) BETWEEN 1 AND 6 AND disciplines <@ ARRAY['civil','mechanical','electrical','instrumentation_control','telecommunications','circular']::text[]), contact_name text NOT NULL CHECK(length(trim(contact_name)) BETWEEN 1 AND 100), contact_email text NOT NULL CHECK(length(contact_email)<=255 AND contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'), message text NOT NULL CHECK(length(trim(message)) BETWEEN 1 AND 1000), consent_given boolean NOT NULL CHECK(consent_given=true), status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','in_review','resolved','dismissed')), created_at timestamptz NOT NULL DEFAULT now(), internal_notes text);
GRANT ALL ON public.energy_partner_interest TO service_role;
REVOKE ALL ON public.energy_partner_interest FROM anon,authenticated;
ALTER TABLE public.energy_partner_interest ENABLE ROW LEVEL SECURITY;
CREATE INDEX energy_partner_interest_created_at_idx ON public.energy_partner_interest(created_at);
CREATE FUNCTION public.energy_partner_interest_rate_limit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('energy_partner_interest_rate_limit'));
 IF (SELECT count(*) FROM public.energy_partner_interest WHERE created_at > now()-interval '1 minute') >= 30 THEN RAISE EXCEPTION 'Too many inquiries, please try again shortly'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER energy_partner_interest_rate_limit BEFORE INSERT ON public.energy_partner_interest FOR EACH ROW EXECUTE FUNCTION public.energy_partner_interest_rate_limit();
REVOKE ALL ON FUNCTION public.energy_partner_interest_rate_limit() FROM PUBLIC;
COMMENT ON TABLE public.energy_partner_interest IS 'Private company expressions of interest; server-only validated insert, role-checked central administrator reads and status edits; no direct visitor access.';