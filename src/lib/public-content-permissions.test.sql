-- Preview-data counts from 2026-11-21; manual check only.
-- Run by hand with a privileged session after permission changes, never inside a migration.
-- Update expected counts to match the data of the database being checked.
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