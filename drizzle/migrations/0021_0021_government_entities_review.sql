ALTER TABLE public.government_entities
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS phone_label text,
  ADD COLUMN IF NOT EXISTS phone_source_url text,
  ADD COLUMN IF NOT EXISTS last_verified_at date,
  ADD COLUMN IF NOT EXISTS internal_notes text;

REVOKE ALL ON public.government_entities FROM anon, authenticated;
GRANT SELECT (id, category_en, category_ar, entity_name_en, entity_name_ar, description_en, official_url, verification_status, sort_order, is_active, phone, phone_label, last_verified_at) ON public.government_entities TO anon, authenticated;
GRANT ALL ON public.government_entities TO service_role;

DROP POLICY IF EXISTS "Government entities are public" ON public.government_entities;
CREATE POLICY "Public reads active government entities" ON public.government_entities FOR SELECT TO anon, authenticated USING (is_active = true);