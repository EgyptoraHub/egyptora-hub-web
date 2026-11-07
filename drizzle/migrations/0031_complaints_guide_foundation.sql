CREATE TABLE public.complaint_sectors (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name_en text NOT NULL, name_ar text NOT NULL, family text NOT NULL CHECK (family IN ('local_urban','utilities_infrastructure','transport_traffic','health_social','education_work','trade_finance','environment_agriculture','culture_tourism_civic','integrity_justice','safety_identity_other')), scope_en text, scope_ar text, notice_type text NOT NULL DEFAULT 'none' CHECK (notice_type IN ('none','sensitive','emergency')), sort_order integer DEFAULT 0, review_status text NOT NULL DEFAULT 'needs_check' CHECK (review_status IN ('needs_check','editorial_reviewed','verified')), is_active boolean NOT NULL DEFAULT false, internal_notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.complaint_sectors TO service_role; GRANT SELECT,INSERT,UPDATE,DELETE ON public.complaint_sectors TO authenticated;
ALTER TABLE public.complaint_sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY complaint_sectors_public ON public.complaint_sectors FOR SELECT TO anon USING (is_active AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY complaint_sectors_admin ON public.complaint_sectors FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TABLE public.complaint_channels (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, sector_slug text NOT NULL REFERENCES public.complaint_sectors(slug) ON UPDATE CASCADE, authority_name_en text NOT NULL, authority_name_ar text, channel_type text NOT NULL CHECK (channel_type IN ('hotline','website','app','whatsapp')), channel_value text NOT NULL, label_en text, label_ar text, hours_en text, hours_ar text, handles_en text, handles_ar text, source_name text, source_name_ar text, source_url text, last_verified_at date, review_status text NOT NULL DEFAULT 'needs_check' CHECK (review_status IN ('needs_check','editorial_reviewed','verified')), is_active boolean NOT NULL DEFAULT false, internal_notes text, sort_order integer DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.complaint_channels TO service_role; GRANT SELECT,INSERT,UPDATE,DELETE ON public.complaint_channels TO authenticated;
ALTER TABLE public.complaint_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY complaint_channels_public ON public.complaint_channels FOR SELECT TO anon USING (is_active AND review_status IN ('editorial_reviewed','verified'));
CREATE POLICY complaint_channels_admin ON public.complaint_channels FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.validate_complaint_channel() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
IF NEW.is_active AND (nullif(trim(NEW.source_url),'') IS NULL OR NEW.last_verified_at IS NULL) THEN RAISE EXCEPTION 'Activation requires a source URL and verification date'; END IF;
IF NEW.last_verified_at > CURRENT_DATE THEN RAISE EXCEPTION 'Verification date cannot be in the future'; END IF;
IF NEW.source_url IS NOT NULL AND (NEW.source_url !~ '^https?://' OR NEW.source_url ~* '\.pdf([?#]|$)') THEN RAISE EXCEPTION 'Source must be an HTTP website, not a PDF'; END IF;
IF NEW.channel_value ~* '^(javascript|data):' THEN RAISE EXCEPTION 'Unsafe channel value'; END IF;
IF NEW.channel_type = 'hotline' AND NEW.channel_value !~ '^[+0-9][0-9 +\-]{2,19}$' THEN RAISE EXCEPTION 'Hotline must be a phone number (digits, +, spaces, dashes; 3-20 chars)'; END IF;
IF NEW.channel_type IN ('website','app','whatsapp') AND NEW.channel_value !~ '^https://' THEN RAISE EXCEPTION 'Channel value must be an HTTPS URL'; END IF;
IF (nullif(trim(coalesce(NEW.hours_en,'')),'') IS NOT NULL OR nullif(trim(coalesce(NEW.hours_ar,'')),'') IS NOT NULL OR nullif(trim(coalesce(NEW.handles_en,'')),'') IS NOT NULL OR nullif(trim(coalesce(NEW.handles_ar,'')),'') IS NOT NULL) AND nullif(trim(NEW.source_url),'') IS NULL THEN RAISE EXCEPTION 'Published hours or scope text requires the row source'; END IF;
RETURN NEW; END $$;
CREATE TRIGGER complaint_channels_validate BEFORE INSERT OR UPDATE ON public.complaint_channels FOR EACH ROW EXECUTE FUNCTION public.validate_complaint_channel();
DO $$ DECLARE t text; safe_cols text; BEGIN FOREACH t IN ARRAY ARRAY['complaint_sectors','complaint_channels'] LOOP
EXECUTE format('REVOKE SELECT ON public.%I FROM anon',t);
SELECT string_agg(quote_ident(column_name),',') INTO safe_cols FROM information_schema.columns WHERE table_schema='public' AND table_name=t AND column_name <> 'internal_notes';
EXECUTE format('GRANT SELECT(%s) ON public.%I TO anon',safe_cols,t);
EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()',t||'_touch',t);
END LOOP; END $$;
REVOKE ALL ON FUNCTION public.validate_complaint_channel() FROM PUBLIC;