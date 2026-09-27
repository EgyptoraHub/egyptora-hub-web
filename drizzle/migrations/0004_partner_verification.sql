ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'documents_pending'
    CHECK (verification_status IN ('documents_pending','under_review','verified','rejected')),
  ADD COLUMN IF NOT EXISTS verification_note text,
  ADD COLUMN IF NOT EXISTS registration_doc_path text,
  ADD COLUMN IF NOT EXISTS authorization_doc_path text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);

CREATE OR REPLACE FUNCTION public.owns_partner_application(app_folder text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_applications
    WHERE id::text = app_folder AND user_id = auth.uid()
  );
$$;

CREATE POLICY "Applicants upload own partner docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'partner-documents' AND public.owns_partner_application((storage.foldername(name))[1]));
CREATE POLICY "Applicants and admins read partner docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'partner-documents' AND (public.owns_partner_application((storage.foldername(name))[1]) OR public.has_role(auth.uid(), 'admin')));

CREATE OR REPLACE FUNCTION public.submit_partner_document(app_id uuid, doc_kind text, doc_path text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.partner_applications;
BEGIN
  SELECT * INTO r FROM public.partner_applications WHERE id = app_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF doc_path NOT LIKE app_id::text || '/%' THEN RAISE EXCEPTION 'Invalid path'; END IF;
  IF r.verification_status = 'verified' THEN RAISE EXCEPTION 'Already verified'; END IF;
  IF doc_kind = 'registration' THEN
    UPDATE public.partner_applications SET registration_doc_path = doc_path WHERE id = app_id;
  ELSIF doc_kind = 'authorization' THEN
    UPDATE public.partner_applications SET authorization_doc_path = doc_path WHERE id = app_id;
  ELSE RAISE EXCEPTION 'Unknown document type'; END IF;
  UPDATE public.partner_applications
    SET verification_status = 'under_review', verification_note = NULL
    WHERE id = app_id AND registration_doc_path IS NOT NULL AND authorization_doc_path IS NOT NULL
      AND verification_status IN ('documents_pending','rejected');
  SELECT verification_status INTO r.verification_status FROM public.partner_applications WHERE id = app_id;
  RETURN r.verification_status;
END; $$;

CREATE OR REPLACE FUNCTION public.review_partner_application(app_id uuid, decision text, note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF decision NOT IN ('verified','rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  UPDATE public.partner_applications
    SET verification_status = decision,
        verification_note = nullif(left(trim(coalesce(note,'')), 2000), ''),
        reviewed_at = now(), reviewed_by = auth.uid()
    WHERE id = app_id;
END; $$;

REVOKE ALL ON FUNCTION public.submit_partner_document(uuid,text,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_partner_application(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_partner_document(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_partner_application(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_partner_application(text) TO authenticated;