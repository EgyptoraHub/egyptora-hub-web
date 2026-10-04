REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.emergency_categories, public.emergency_numbers, public.app_categories, public.egypt_apps FROM anon;
REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.emergency_reports, public.app_reports FROM anon;
GRANT INSERT ON public.emergency_reports, public.app_reports TO anon;