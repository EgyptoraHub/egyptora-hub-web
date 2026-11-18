DROP POLICY IF EXISTS "Legal document versions are public" ON public.legal_document_versions;
CREATE POLICY "Approved legal document versions are public" ON public.legal_document_versions
  FOR SELECT TO anon, authenticated
  USING (approval_status IS NOT NULL AND lower(approval_status) NOT IN ('draft','rejected','archived','withdrawn'));

DROP POLICY IF EXISTS "Public read access to offers" ON public.offers;
CREATE POLICY "Listed offers are public" ON public.offers
  FOR SELECT TO anon, authenticated
  USING (slug IS NOT NULL AND governance_status IS NOT NULL AND upper(governance_status) NOT IN ('REJECTED','ARCHIVED','REMOVED'));

DROP POLICY IF EXISTS "Public read access to providers" ON public.providers;
CREATE POLICY "Listed providers are public" ON public.providers
  FOR SELECT TO anon, authenticated
  USING (slug IS NOT NULL AND governance_status IS NOT NULL AND upper(governance_status) NOT IN ('REJECTED','ARCHIVED','REMOVED'));