ALTER TABLE public.partner_applications ADD COLUMN IF NOT EXISTS flagged_docs text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.partner_applications DROP CONSTRAINT partner_applications_verification_status_check;
ALTER TABLE public.partner_applications ADD CONSTRAINT partner_applications_verification_status_check
  CHECK (verification_status = ANY (ARRAY['documents_pending','under_review','verified','rejected','changes_requested']));

DROP FUNCTION IF EXISTS public.review_partner_application(uuid, text, text);
CREATE FUNCTION public.review_partner_application(app_id uuid, decision text, note text, flagged text[] DEFAULT '{}')
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.partner_applications; clean_note text; f text[];
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF decision NOT IN ('verified','rejected','changes_requested') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  clean_note := nullif(left(trim(coalesce(note,'')), 2000), '');
  IF decision IN ('rejected','changes_requested') AND clean_note IS NULL THEN RAISE EXCEPTION 'A note is required'; END IF;
  f := ARRAY(SELECT DISTINCT x FROM unnest(coalesce(flagged,'{}')) x WHERE x IN ('registration','authorization'));
  IF decision = 'changes_requested' AND cardinality(f) = 0 THEN RAISE EXCEPTION 'Flag at least one document'; END IF;
  IF decision <> 'changes_requested' THEN f := '{}'; END IF;
  UPDATE public.partner_applications
    SET verification_status = decision, verification_note = clean_note, flagged_docs = f,
        reviewed_at = now(), reviewed_by = auth.uid()
    WHERE id = app_id RETURNING * INTO r;
  IF r.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, link)
    VALUES (r.user_id, 'partner_application',
      CASE decision WHEN 'verified' THEN 'Your partner application is verified'
        WHEN 'rejected' THEN 'Your partner application was not approved'
        ELSE 'Changes requested on your partner application' END,
      CASE decision WHEN 'verified' THEN r.company_name || ' now has the Verified status.'
        ELSE r.company_name || ': a reviewer note is waiting for you. Open the partner portal to read it.' END,
      '/partners');
  END IF;
END; $function$;
REVOKE ALL ON FUNCTION public.review_partner_application(uuid, text, text, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_partner_application(uuid, text, text, text[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_partner_document(app_id uuid, doc_kind text, doc_path text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.partner_applications;
BEGIN
  SELECT * INTO r FROM public.partner_applications WHERE id = app_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF doc_path NOT LIKE app_id::text || '/%' THEN RAISE EXCEPTION 'Invalid path'; END IF;
  IF r.verification_status IN ('verified','under_review') THEN RAISE EXCEPTION 'Not editable now'; END IF;
  IF r.verification_status = 'changes_requested' AND NOT (doc_kind = ANY(r.flagged_docs)) THEN
    RAISE EXCEPTION 'Only flagged documents can be replaced'; END IF;
  IF doc_kind = 'registration' THEN
    UPDATE public.partner_applications SET registration_doc_path = doc_path WHERE id = app_id;
  ELSIF doc_kind = 'authorization' THEN
    UPDATE public.partner_applications SET authorization_doc_path = doc_path WHERE id = app_id;
  ELSE RAISE EXCEPTION 'Unknown document type'; END IF;
  UPDATE public.partner_applications SET flagged_docs = array_remove(flagged_docs, doc_kind) WHERE id = app_id;
  UPDATE public.partner_applications
    SET verification_status = 'under_review', verification_note = NULL, flagged_docs = '{}'
    WHERE id = app_id AND registration_doc_path IS NOT NULL AND authorization_doc_path IS NOT NULL
      AND (verification_status IN ('documents_pending','rejected')
           OR (verification_status = 'changes_requested' AND cardinality(flagged_docs) = 0));
  SELECT verification_status INTO r.verification_status FROM public.partner_applications WHERE id = app_id;
  RETURN r.verification_status;
END; $function$;