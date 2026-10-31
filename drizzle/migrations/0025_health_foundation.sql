CREATE TABLE public.health_specialties (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), name_en text NOT NULL CHECK (length(trim(name_en)) BETWEEN 1 AND 200), name_ar text NOT NULL CHECK (length(trim(name_ar)) BETWEEN 1 AND 200), summary_en text, summary_ar text, when_to_visit_en text, when_to_visit_ar text, icon text, sort_order integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT false, source_url text, last_verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.health_specialties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_specialties TO authenticated;
GRANT ALL ON public.health_specialties TO service_role;
ALTER TABLE public.health_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY health_specialties_public_read ON public.health_specialties FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY health_specialties_admin_all ON public.health_specialties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER health_specialties_updated BEFORE UPDATE ON public.health_specialties FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.health_facilities (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), name_en text NOT NULL CHECK (length(trim(name_en)) BETWEEN 1 AND 200), name_ar text NOT NULL CHECK (length(trim(name_ar)) BETWEEN 1 AND 200), facility_type text NOT NULL CHECK (facility_type IN ('hospital','clinic','health_unit','lab','imaging','pharmacy','blood_center','rehab','mental_health','home_care')), ownership text NOT NULL CHECK (ownership IN ('government','private','university')), governorate_id text REFERENCES public.governorates(id), city_en text, city_ar text, address_en text, address_ar text, lat double precision CHECK (lat BETWEEN -90 AND 90), lng double precision CHECK (lng BETWEEN -180 AND 180), phone text CHECK (length(phone) <= 50), hours_en text, hours_ar text, official_website text CHECK (official_website IS NULL OR official_website ~ '^https://[^[:space:]/]+([/?#][^[:space:]]*)?$'), services text[] NOT NULL DEFAULT '{}', description_en text, description_ar text, license_status text, license_source_url text, accreditation_status text, accreditation_source_url text, source_url text, last_verified_at timestamptz, is_active boolean NOT NULL DEFAULT false, external_ids jsonb NOT NULL DEFAULT '{}', image_key text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id,slug,name_en,name_ar,facility_type,ownership,governorate_id,city_en,city_ar,address_en,address_ar,lat,lng,phone,hours_en,hours_ar,official_website,services,description_en,description_ar,license_status,license_source_url,accreditation_status,accreditation_source_url,source_url,last_verified_at,is_active,image_key,created_at,updated_at) ON public.health_facilities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_facilities TO authenticated;
GRANT ALL ON public.health_facilities TO service_role;
ALTER TABLE public.health_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY health_facilities_public_read ON public.health_facilities FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY health_facilities_admin_all ON public.health_facilities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.validate_health_facility() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NEW.is_active AND (nullif(trim(NEW.source_url), '') IS NULL OR NEW.last_verified_at IS NULL) THEN RAISE EXCEPTION 'Activation requires a source URL and verification date'; END IF;
 IF nullif(trim(NEW.license_status),'') IS NOT NULL AND (nullif(trim(NEW.license_source_url),'') IS NULL OR NEW.last_verified_at IS NULL) THEN RAISE EXCEPTION 'License status requires its own source URL and verification date'; END IF;
 IF nullif(trim(NEW.accreditation_status),'') IS NOT NULL AND (nullif(trim(NEW.accreditation_source_url),'') IS NULL OR NEW.last_verified_at IS NULL) THEN RAISE EXCEPTION 'Accreditation status requires its own source URL and verification date'; END IF;
 IF NEW.last_verified_at > now() THEN RAISE EXCEPTION 'Verification date cannot be in the future'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER health_facilities_validate BEFORE INSERT OR UPDATE ON public.health_facilities FOR EACH ROW EXECUTE FUNCTION public.validate_health_facility();
CREATE TRIGGER health_facilities_updated BEFORE UPDATE ON public.health_facilities FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
COMMENT ON COLUMN public.health_facilities.phone IS 'Public facility telephone line only; never a personal phone number.';
COMMENT ON COLUMN public.health_facilities.external_ids IS 'Reserved for future official identifiers; not exposed to anonymous readers.';

CREATE TABLE public.health_facility_specialties (
 facility_id uuid NOT NULL REFERENCES public.health_facilities(id) ON DELETE CASCADE, specialty_id uuid NOT NULL REFERENCES public.health_specialties(id) ON DELETE CASCADE, id uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (facility_id, specialty_id)
);
GRANT SELECT ON public.health_facility_specialties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_facility_specialties TO authenticated;
GRANT ALL ON public.health_facility_specialties TO service_role;
ALTER TABLE public.health_facility_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY health_facility_specialties_public_read ON public.health_facility_specialties FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.health_facilities f WHERE f.id = facility_id AND f.is_active) AND EXISTS (SELECT 1 FROM public.health_specialties s WHERE s.id = specialty_id AND s.is_active));
CREATE POLICY health_facility_specialties_admin_all ON public.health_facility_specialties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER health_facility_specialties_updated BEFORE UPDATE ON public.health_facility_specialties FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.health_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), facility_id uuid REFERENCES public.health_facilities(id) ON DELETE SET NULL, kind text NOT NULL CHECK (kind IN ('wrong_info','closed','link_broken','other')), message text NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 1000), contact_email text CHECK (contact_email IS NULL OR (length(contact_email) <= 255 AND contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')), status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_review','resolved','dismissed')), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT (facility_id,kind,message,contact_email) ON public.health_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_reports TO authenticated;
GRANT ALL ON public.health_reports TO service_role;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY health_reports_public_insert ON public.health_reports FOR INSERT TO anon, authenticated WITH CHECK (status = 'new' AND (facility_id IS NULL OR EXISTS (SELECT 1 FROM public.health_facilities f WHERE f.id = facility_id AND f.is_active)));
CREATE POLICY health_reports_admin_all ON public.health_reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.health_reports_rate_limit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('health_reports_rate_limit'));
 IF (SELECT count(*) FROM public.health_reports WHERE created_at > now() - interval '1 minute') >= 30 THEN RAISE EXCEPTION 'Too many reports, please try again shortly'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER health_reports_rate_limit BEFORE INSERT ON public.health_reports FOR EACH ROW EXECUTE FUNCTION public.health_reports_rate_limit();
CREATE TRIGGER health_reports_updated BEFORE UPDATE ON public.health_reports FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.health_inquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), type text NOT NULL CHECK (type IN ('medical_travel','partner','research')), full_name text NOT NULL CHECK (length(trim(full_name)) BETWEEN 1 AND 100), email text NOT NULL CHECK (length(email) <= 255 AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'), country text NOT NULL CHECK (length(trim(country)) BETWEEN 1 AND 100), preferred_language text NOT NULL CHECK (preferred_language IN ('en','ar','fr','de','es','it','ru','zh','hi')), message text NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 1500), consent boolean NOT NULL CHECK (consent = true), status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_review','resolved','dismissed')), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT (type,full_name,email,country,preferred_language,message,consent) ON public.health_inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_inquiries TO authenticated;
GRANT ALL ON public.health_inquiries TO service_role;
ALTER TABLE public.health_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY health_inquiries_public_insert ON public.health_inquiries FOR INSERT TO anon, authenticated WITH CHECK (status = 'new' AND consent = true);
CREATE POLICY health_inquiries_admin_all ON public.health_inquiries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
COMMENT ON TABLE public.health_inquiries IS 'Administrative inquiries only. Users must not enter medical information. No medical files, health details or patient records are collected.';
CREATE FUNCTION public.health_inquiries_rate_limit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('health_inquiries_rate_limit'));
 IF (SELECT count(*) FROM public.health_inquiries WHERE created_at > now() - interval '1 minute') >= 30 THEN RAISE EXCEPTION 'Too many inquiries, please try again shortly'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER health_inquiries_rate_limit BEFORE INSERT ON public.health_inquiries FOR EACH ROW EXECUTE FUNCTION public.health_inquiries_rate_limit();
CREATE TRIGGER health_inquiries_updated BEFORE UPDATE ON public.health_inquiries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX health_reports_facility_idx ON public.health_reports(facility_id);
CREATE INDEX health_facilities_governorate_idx ON public.health_facilities(governorate_id);
CREATE INDEX health_facility_specialties_specialty_idx ON public.health_facility_specialties(specialty_id);