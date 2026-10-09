-- Audit log: insert via service role only, admin read.
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.audit_log FROM anon, authenticated;
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);

-- Points ledger: append-only, owner read.
CREATE TABLE public.points_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  ref_type text,
  ref_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.points_ledger FROM anon, authenticated;
GRANT SELECT ON public.points_ledger TO authenticated;
GRANT ALL ON public.points_ledger TO service_role;
ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own points" ON public.points_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX points_ledger_user_idx ON public.points_ledger (user_id, created_at DESC);

-- Culture -> providers / products links.
CREATE TABLE public.culture_item_providers (
  culture_item_id uuid NOT NULL REFERENCES public.culture_items(id) ON DELETE CASCADE,
  provider_id text NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (culture_item_id, provider_id)
);
CREATE TABLE public.culture_item_products (
  culture_item_id uuid NOT NULL REFERENCES public.culture_items(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (culture_item_id, product_id)
);
REVOKE ALL ON public.culture_item_providers, public.culture_item_products FROM anon, authenticated;
GRANT SELECT (culture_item_id, provider_id, sort_order) ON public.culture_item_providers TO anon, authenticated;
GRANT SELECT (culture_item_id, product_id, sort_order) ON public.culture_item_products TO anon, authenticated;
GRANT ALL ON public.culture_item_providers, public.culture_item_products TO service_role;
ALTER TABLE public.culture_item_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culture_item_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads links of visible culture items" ON public.culture_item_providers FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.culture_items i WHERE i.id = culture_item_id AND i.is_active AND i.review_status IN ('editorial_reviewed','verified')));
CREATE POLICY "Public reads links of visible culture items" ON public.culture_item_products FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.culture_items i WHERE i.id = culture_item_id AND i.is_active AND i.review_status IN ('editorial_reviewed','verified')));

-- Licence / rights fields (not granted to visitors).
ALTER TABLE public.culture_media ADD COLUMN license_type text, ADD COLUMN rights_holder text, ADD COLUMN license_url text, ADD COLUMN attribution_text text, ADD COLUMN rights_verified_at timestamptz;
ALTER TABLE public.military_media ADD COLUMN license_type text, ADD COLUMN rights_holder text, ADD COLUMN license_url text, ADD COLUMN attribution_text text, ADD COLUMN rights_verified_at timestamptz;
ALTER TABLE public.traveller_stories ADD COLUMN license_type text, ADD COLUMN rights_holder text, ADD COLUMN license_url text, ADD COLUMN attribution_text text, ADD COLUMN rights_verified_at timestamptz;

-- AI usage log: admin read, service-role write.
CREATE TABLE public.ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  feature text NOT NULL,
  model text,
  tokens_in integer,
  tokens_out integer,
  cost_estimate numeric(12,6),
  created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.ai_usage_log FROM anon, authenticated;
GRANT SELECT ON public.ai_usage_log TO authenticated;
GRANT ALL ON public.ai_usage_log TO service_role;
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read AI usage" ON public.ai_usage_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Trip preview videos (empty; same visibility rule as other content).
CREATE TABLE public.trip_preview_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate_slug text,
  destination_slug text,
  title_ar text,
  title_en text,
  video_url text,
  thumbnail_url text,
  source_url text,
  license_type text,
  rights_holder text,
  license_url text,
  attribution_text text,
  rights_verified_at timestamptz,
  review_status text NOT NULL DEFAULT 'needs_check' CHECK (review_status IN ('needs_check','editorial_reviewed','verified')),
  is_active boolean NOT NULL DEFAULT false,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (video_url IS NULL OR video_url ~ '^https://')
);
REVOKE ALL ON public.trip_preview_videos FROM anon, authenticated;
GRANT SELECT (id, governorate_slug, destination_slug, title_ar, title_en, video_url, thumbnail_url, source_url, license_type, rights_holder, license_url, attribution_text, review_status, created_at) ON public.trip_preview_videos TO anon, authenticated;
GRANT ALL ON public.trip_preview_videos TO service_role;
ALTER TABLE public.trip_preview_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible trip videos" ON public.trip_preview_videos FOR SELECT TO anon, authenticated
  USING (is_active AND review_status IN ('editorial_reviewed','verified'));
CREATE TRIGGER trip_preview_videos_touch BEFORE UPDATE ON public.trip_preview_videos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Site settings: visitors only see the maintenance row; admins see all (feature flags).
DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT TO anon, authenticated USING (key = 'maintenance');
CREATE POLICY site_settings_admin_read ON public.site_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Notes columns: close leaks to signed-in users.
REVOKE SELECT (notes) ON public.emergency_numbers FROM anon, authenticated;
REVOKE SELECT (internal_notes) ON public.egypt_apps FROM anon, authenticated;