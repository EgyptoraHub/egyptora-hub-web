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
  original_role text := current_user;
  gap_count bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id='00000000-0000-4000-8000-000000000061'::uuid) THEN RAISE EXCEPTION 'Test subject has assigned roles'; END IF;
  FOREACH target_table IN ARRAY widen || ARRAY['real_estate_platforms','research_programs','health_facilities','military_media'] LOOP
    SELECT string_agg(quote_ident(a.attname),', ' ORDER BY a.attnum),string_agg(quote_ident(a.attname),', ' ORDER BY a.attnum) FILTER (WHERE has_column_privilege('anon',a.attrelid,a.attnum,'SELECT')) INTO all_columns,public_columns FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attnum>0 AND NOT a.attisdropped;
    IF public_columns IS NULL THEN RAISE EXCEPTION 'No anon columns: %',target_table; END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attname='internal_notes' AND has_column_privilege('anon',a.attrelid,a.attnum,'SELECT')) THEN RAISE EXCEPTION 'Anon notes exposed: %',target_table; END IF;
    IF EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attnum>0 AND NOT a.attisdropped AND has_column_privilege('anon',a.attrelid,a.attnum,'SELECT') AND NOT EXISTS (SELECT 1 FROM information_schema.column_privileges p WHERE p.table_schema='public' AND p.table_name=target_table AND p.column_name=a.attname AND p.grantee='anon' AND p.privilege_type='SELECT')) THEN RAISE EXCEPTION 'information_schema/catalog mismatch: %',target_table; END IF;
    SELECT jsonb_agg(to_jsonb(p) ORDER BY policyname) INTO before_policies FROM pg_policies p WHERE schemaname='public' AND tablename=target_table AND NOT (target_table=ANY(widen) AND cmd='SELECT' AND roles=ARRAY['anon']::name[]);
    SELECT jsonb_build_object('table',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,privilege_type) FROM information_schema.table_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT')),'columns',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,column_name,privilege_type) FROM information_schema.column_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT'))) INTO before_grants;
    EXECUTE format('SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,''[]'')) FROM public.%I t',target_table) INTO before_data;
    IF target_table=ANY(widen) THEN
      SELECT * INTO STRICT policy_row FROM pg_policies WHERE schemaname='public' AND tablename=target_table AND cmd='SELECT' AND roles=ARRAY['anon']::name[];
      PERFORM set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000061',true);
      PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000061","role":"authenticated"}',true);
      PERFORM set_config('role','authenticated',true);
      EXECUTE format('SELECT count(id) FROM public.%I',target_table) INTO gap_count;
      IF gap_count<>0 THEN RAISE EXCEPTION 'Unexpected before authenticated count: %',target_table; END IF;
      PERFORM set_config('role',original_role,true);
      EXECUTE format('ALTER POLICY %I ON public.%I TO anon, authenticated',policy_row.policyname,target_table);
      IF NOT EXISTS (SELECT 1 FROM pg_policies p WHERE schemaname='public' AND tablename=target_table AND policyname=policy_row.policyname AND qual IS NOT DISTINCT FROM policy_row.qual AND with_check IS NOT DISTINCT FROM policy_row.with_check AND roles=ARRAY['anon','authenticated']::name[]) THEN RAISE EXCEPTION 'Public predicate changed: %',target_table; END IF;
    END IF;
    EXECUTE format('REVOKE SELECT ON public.%I FROM authenticated',target_table);
    EXECUTE format('REVOKE SELECT (%s) ON public.%I FROM authenticated',all_columns,target_table);
    EXECUTE format('GRANT SELECT (%s) ON public.%I TO authenticated',public_columns,target_table);
    IF has_table_privilege('authenticated',format('public.%I',target_table),'SELECT') OR EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid=format('public.%I',target_table)::regclass AND a.attnum>0 AND NOT a.attisdropped AND has_column_privilege('anon',a.attrelid,a.attnum,'SELECT') IS DISTINCT FROM has_column_privilege('authenticated',a.attrelid,a.attnum,'SELECT')) THEN RAISE EXCEPTION 'Column parity failed: %',target_table; END IF;
    SELECT jsonb_agg(to_jsonb(p) ORDER BY policyname) INTO after_policies FROM pg_policies p WHERE schemaname='public' AND tablename=target_table AND NOT (target_table=ANY(widen) AND cmd='SELECT' AND 'anon'=ANY(roles));
    SELECT jsonb_build_object('table',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,privilege_type) FROM information_schema.table_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT')),'columns',(SELECT jsonb_agg(to_jsonb(p) ORDER BY grantee,column_name,privilege_type) FROM information_schema.column_privileges p WHERE table_schema='public' AND p.table_name=target_table AND (grantee<>'authenticated' OR privilege_type<>'SELECT'))) INTO after_grants;
    EXECUTE format('SELECT md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY id)::text,''[]'')) FROM public.%I t',target_table) INTO after_data;
    IF before_policies IS DISTINCT FROM after_policies OR before_grants IS DISTINCT FROM after_grants OR before_data IS DISTINCT FROM after_data THEN RAISE EXCEPTION 'Protected policy/grant/data changed: %',target_table; END IF;
  END LOOP;
  PERFORM set_config('request.jwt.claims','',true);
  PERFORM set_config('request.jwt.claim.sub','',true);
END;
$change$;

-- Read-only regression checks, run by migration 0039 under a privileged session.
-- No auth account is created. The synthetic JWT subject has no admin role.
DO $permissions_test$
DECLARE
  original_role text := current_user;
  original_claims text := current_setting('request.jwt.claims', true);
  original_sub text := current_setting('request.jwt.claim.sub', true);
  subject text := '00000000-0000-4000-8000-000000000061';
  target record;
  visitor_role text;
  private_column text;
  public_predicate text;
  anon_ids text[];
  visitor_ids text[];
  hidden_ids text[];
  found_count bigint;
  refused boolean;
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = subject::uuid) THEN
    RAISE EXCEPTION 'Permission test subject must have no assigned roles';
  END IF;
  FOR target IN SELECT * FROM (VALUES
    ('trade_sectors',15), ('trade_country_profiles',0), ('trade_country_commodities',0),
    ('procedure_guides',10), ('procedure_steps',23), ('procedure_documents',29),
    ('complaint_sectors',6), ('complaint_channels',12), ('education_platforms',13),
    ('real_estate_platforms',3), ('research_programs',12), ('health_facilities',14),
    ('health_specialties',14), ('health_facility_specialties',0), ('military_media',0)
  ) AS expected(table_name,row_count) LOOP
    SELECT qual INTO public_predicate FROM pg_policies
      WHERE schemaname='public' AND tablename=target.table_name AND cmd='SELECT'
        AND 'anon'=ANY(roles);
    IF public_predicate IS NULL THEN RAISE EXCEPTION 'Missing public policy: %',target.table_name; END IF;
    EXECUTE format('SELECT coalesce(array_agg(id::text ORDER BY id::text),ARRAY[]::text[]) FROM public.%I WHERE NOT (%s)', target.table_name,public_predicate) INTO hidden_ids;
    anon_ids := NULL;
    FOREACH visitor_role IN ARRAY ARRAY['anon','authenticated'] LOOP
      PERFORM set_config('request.jwt.claim.sub',CASE WHEN visitor_role='authenticated' THEN subject ELSE '' END,true);
      PERFORM set_config('request.jwt.claims',json_build_object('sub',CASE WHEN visitor_role='authenticated' THEN subject ELSE NULL END,'role',visitor_role)::text,true);
      PERFORM set_config('role',visitor_role,true);
      IF visitor_role='authenticated' THEN
        IF public.has_role(auth.uid(),'admin') THEN
          RAISE EXCEPTION 'Test must run as non-admin';
        END IF;
      END IF;
      EXECUTE format('SELECT coalesce(array_agg(id::text ORDER BY id::text),ARRAY[]::text[]) FROM public.%I',target.table_name) INTO visitor_ids;
      IF cardinality(visitor_ids) <> target.row_count THEN
        RAISE EXCEPTION '% %: expected %, got %',visitor_role,target.table_name,target.row_count,cardinality(visitor_ids);
      END IF;
      IF visitor_role='anon' THEN anon_ids := visitor_ids;
      ELSIF visitor_ids IS DISTINCT FROM anon_ids THEN RAISE EXCEPTION 'Visitor row IDs differ: %',target.table_name;
      END IF;
      EXECUTE format('SELECT count(id) FROM public.%I WHERE id::text=ANY($1)',target.table_name) INTO found_count USING hidden_ids;
      IF found_count <> 0 THEN RAISE EXCEPTION 'Hidden rows exposed: % %',visitor_role,target.table_name; END IF;
      FOR private_column IN SELECT a.attname FROM pg_attribute a
        WHERE a.attrelid=format('public.%I',target.table_name)::regclass AND a.attnum>0 AND NOT a.attisdropped
          AND NOT has_column_privilege('anon',a.attrelid,a.attnum,'SELECT') LOOP
        refused := false;
        BEGIN
          EXECUTE format('SELECT %I FROM public.%I LIMIT 1',private_column,target.table_name);
        EXCEPTION WHEN insufficient_privilege THEN refused := true;
        END;
        IF NOT refused THEN RAISE EXCEPTION 'Private column exposed: % %.%',visitor_role,target.table_name,private_column; END IF;
      END LOOP;
      PERFORM set_config('role',original_role,true);
    END LOOP;
    RAISE NOTICE 'PASS %: anon=authenticated=%; hidden IDs excluded=%; private columns refused',target.table_name,target.row_count,cardinality(hidden_ids);
  END LOOP;
  PERFORM set_config('request.jwt.claims',coalesce(original_claims,''),true);
  PERFORM set_config('request.jwt.claim.sub',coalesce(original_sub,''),true);
END;
$permissions_test$;