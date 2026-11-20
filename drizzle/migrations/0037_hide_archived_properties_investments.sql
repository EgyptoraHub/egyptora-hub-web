DROP POLICY IF EXISTS "Public read published properties" ON public.properties;
CREATE POLICY "Public read listed properties" ON public.properties FOR SELECT TO anon, authenticated
USING (moderation_state = 'PUBLISHED' AND governance_status IS NOT NULL AND upper(governance_status) <> ALL (ARRAY['REJECTED','ARCHIVED','REMOVED']));
CREATE POLICY "Admins read all properties" ON public.properties FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Public read published investment_opportunities" ON public.investment_opportunities;
CREATE POLICY "Public read listed investment_opportunities" ON public.investment_opportunities FOR SELECT TO anon, authenticated
USING (moderation_state = 'PUBLISHED' AND governance_status IS NOT NULL AND upper(governance_status) <> ALL (ARRAY['REJECTED','ARCHIVED','REMOVED']));
CREATE POLICY "Admins read all investment_opportunities" ON public.investment_opportunities FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));