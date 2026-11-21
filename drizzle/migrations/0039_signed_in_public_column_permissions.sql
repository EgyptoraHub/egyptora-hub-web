-- Prompt 61: live-catalog grants, unchanged row predicates and data.
DO $change$
DECLARE
  target_table text;
  public_columns text;
  all_columns text;
  widen text[] := ARRAY['trade_sectors','trade_country_profiles','trade_country_commodities','procedure_guides','procedure_steps','procedure_documents','complaint_sectors','complaint_channels','education_platforms'];
  policy_row record;
  before_policies jsonb;
  after_policies jsonb;
  before_grants jsonb;
  after_grants jsonb;
  before_data text;
  after_data text;
BEGIN
  FOREACH target_table IN ARRAY widen || ARRAY['real_estate_platforms','research_programs','health_facilities','military_media'] LOOP
    SELECT string_agg(quote_ident(a.attname),', ' ORDER BY a.attnum),string_agg(quote_ident(a.attname),', ' ORDER BY a.attnum) FILTER (WHERE has_column_privilege('anon',a.attrelid,a.attnum,'SELECT')) INTO all_columns,public_columns FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attnum>0 AND NOT a.attisdropped;
    IF public_columns IS NULL THEN RAISE EXCEPTION 'No anon columns: %',target_table; END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attname='internal_notes' AND has_column_privilege('anon',a.attrelid,a.attnum,'SELECT')) THEN RAISE EXCEPTION 'Anon notes exposed: %',target_table; END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attnum>0 AND NOT a.attisdropped AND has_column_privilege('anon',a.attrelid,a.attnum,'SELECT') AND NOT EXISTS (SELECT 1 FROM information_schema.column_privileges p WHERE p.table_schema='public' AND p.table_name=target_table AND p.column_name=a.attname AND p.grantee='anon' AND p.privilege_type='SELECT')) THEN RAISE EXCEPTION 'information_schema/catalog mismatch: %',target_table; END IF;
    SELECT jsonb_agg(to_jsonb(p) ORDER BY policyname) INTO before_policies FROM pg_policies p WHERE schemaname='public' AND tablename=target_table AND NOT (target_table=ANY(widen) AND policyname=target_table || '_public');
    SELECT jsonb_build_object('table',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,privilege_type) FROM information_schema.table_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT')),'columns',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,column_name,privilege_type) FROM information_schema.column_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT'))) INTO before_grants;
    EXECUTE format('SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,''[]'')) FROM public.%I t',target_table) INTO before_data;
    IF target_table=ANY(widen) THEN
      SELECT * INTO STRICT policy_row FROM pg_policies WHERE schemaname='public' AND tablename=target_table AND cmd='SELECT' AND policyname=target_table || '_public';
      EXECUTE format('ALTER POLICY %I ON public.%I TO anon, authenticated',policy_row.policyname,target_table);
      IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE schemaname='public' AND tablename=target_table AND policyname=policy_row.policyname AND qual IS NOT DISTINCT FROM policy_row.qual AND with_check IS NOT DISTINCT FROM policy_row.with_check AND roles=ARRAY['anon','authenticated']::name[]) THEN RAISE EXCEPTION 'Public predicate changed: %',target_table; END IF;
    END IF;
    EXECUTE format('REVOKE SELECT ON public.%I FROM authenticated',target_table);
    EXECUTE format('REVOKE SELECT (%s) ON public.%I FROM authenticated',all_columns,target_table);
    EXECUTE format('GRANT SELECT (%s) ON public.%I TO authenticated',public_columns,target_table);
    IF has_table_privilege('authenticated',format('public.%I',target_table),'SELECT') OR EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attnum>0 AND NOT a.attisdropped AND has_column_privilege('anon',a.attrelid,a.attnum,'SELECT') IS DISTINCT FROM has_column_privilege('authenticated',a.attrelid,a.attnum,'SELECT')) THEN RAISE EXCEPTION 'Column parity failed: %',target_table; END IF;
    SELECT jsonb_agg(to_jsonb(p) ORDER BY policyname) INTO after_policies FROM pg_policies p WHERE schemaname='public' AND tablename=target_table AND NOT (target_table=ANY(widen) AND policyname=target_table || '_public');
    SELECT jsonb_build_object('table',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,privilege_type) FROM information_schema.table_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT')),'columns',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,column_name,privilege_type) FROM information_schema.column_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT'))) INTO after_grants;
    EXECUTE format('SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,''[]'')) FROM public.%I t',target_table) INTO after_data;
    IF before_policies IS DISTINCT FROM after_policies OR before_grants IS DISTINCT FROM after_grants OR before_data IS DISTINCT FROM after_data THEN RAISE EXCEPTION 'Protected policy/grant/data changed: %',target_table; END IF;
  END LOOP;
END;
$change$;

