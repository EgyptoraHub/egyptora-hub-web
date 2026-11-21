REVOKE ALL PRIVILEGES ON TABLE public.shipping_platforms FROM anon,authenticated;
GRANT INSERT,UPDATE,DELETE ON public.shipping_platforms TO authenticated;
GRANT ALL ON public.shipping_platforms TO service_role;
GRANT SELECT (id,slug,name_en,name_ar,operator_name_en,operator_name_ar,category,audience_en,audience_ar,services_summary_en,services_summary_ar,languages,published_fee_text,published_fee_text_ar,fee_source_url,official_url,source_name,source_name_ar,source_url,last_verified_at,review_status,is_active,sort_order,created_at,updated_at) ON public.shipping_platforms TO anon,authenticated;