REVOKE ALL ON public.egypt_apps FROM anon;
GRANT SELECT (id, category_id, name_ar, name_en, publisher, app_type, description_ar, description_en, google_play_url, app_store_url, website_url, is_featured, status, last_verified_at, last_link_check, is_active, sort_order, governance_status, created_at, updated_at) ON public.egypt_apps TO anon;
REVOKE ALL ON public.app_reports FROM anon;
GRANT INSERT ON public.app_reports TO anon;