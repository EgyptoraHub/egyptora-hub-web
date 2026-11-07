ALTER TABLE public.procedure_guides ADD COLUMN published_fee_text_ar text, ADD COLUMN published_processing_time_text_ar text;
GRANT SELECT (published_fee_text_ar, published_processing_time_text_ar) ON public.procedure_guides TO anon;
CREATE OR REPLACE FUNCTION public.validate_trade_content() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN
IF NEW.is_active AND (nullif(trim(NEW.source_url),'') IS NULL OR NEW.last_verified_at IS NULL) THEN RAISE EXCEPTION 'Activation requires a source URL and verification date'; END IF;
IF NEW.last_verified_at > CURRENT_DATE THEN RAISE EXCEPTION 'Verification date cannot be in the future'; END IF;
IF NEW.source_url IS NOT NULL AND (NEW.source_url !~ '^https?://' OR NEW.source_url ~* '\.pdf([?#]|$)') THEN RAISE EXCEPTION 'Source must be an HTTP website, not a PDF'; END IF;
IF TG_TABLE_NAME = 'trade_country_commodities' THEN IF nullif(trim(NEW.source_name),'') IS NULL OR nullif(trim(NEW.source_url),'') IS NULL OR NEW.reference_year IS NULL THEN RAISE EXCEPTION 'Commodity requires source name, URL and reference year'; END IF; END IF;
IF TG_TABLE_NAME = 'procedure_guides' THEN
IF (nullif(trim(NEW.published_fee_text),'') IS NOT NULL OR nullif(trim(NEW.published_fee_text_ar),'') IS NOT NULL) AND nullif(trim(NEW.fee_source_url),'') IS NULL THEN RAISE EXCEPTION 'Published fee requires its own source'; END IF;
IF (nullif(trim(NEW.published_processing_time_text),'') IS NOT NULL OR nullif(trim(NEW.published_processing_time_text_ar),'') IS NOT NULL) AND nullif(trim(NEW.time_source_url),'') IS NULL THEN RAISE EXCEPTION 'Published processing time requires its own source'; END IF; END IF;
RETURN NEW; END $$;