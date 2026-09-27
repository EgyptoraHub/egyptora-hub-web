CREATE OR REPLACE FUNCTION public.notify_admins_partner_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, link)
  SELECT ur.user_id, 'partner_application', 'New partner application',
         NEW.company_name || ' (' || NEW.partnership_type || ') applied to become a partner.',
         '/admin/partners'
  FROM public.user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END; $$;
CREATE TRIGGER partner_applications_notify_admins
AFTER INSERT ON public.partner_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_partner_application();