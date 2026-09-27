CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 200),
  company_name text NOT NULL CHECK (char_length(company_name) BETWEEN 1 AND 160),
  partnership_type text NOT NULL CHECK (partnership_type IN ('hotel','developer','service_provider','exporter')),
  description text CHECK (description IS NULL OR char_length(description) <= 2000),
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.partner_applications.status IS 'submitted now; reserved for future badges: verified, strategic, technology, sponsor';
GRANT INSERT ON public.partner_applications TO anon;
GRANT SELECT, INSERT ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.partner_applications FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'submitted' AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Applicants and admins can read" ON public.partner_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));