ALTER TABLE public.military_records
  ADD COLUMN IF NOT EXISTS merged_into_record_id uuid REFERENCES public.military_records(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS merge_status text CHECK (merge_status IN ('proposed','confirmed')),
  ADD COLUMN IF NOT EXISTS merge_confidence text CHECK (merge_confidence IN ('medium','low'));
ALTER TABLE public.military_records ADD CONSTRAINT military_records_not_self_merge CHECK (merged_into_record_id IS NULL OR merged_into_record_id <> id);
CREATE INDEX IF NOT EXISTS military_records_merged_into_idx ON public.military_records(merged_into_record_id);

CREATE OR REPLACE FUNCTION public.military_records_merge_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.merged_into_record_id IS NULL THEN
    NEW.merge_status := NULL; NEW.merge_confidence := NULL;
    RETURN NEW;
  END IF;
  IF NEW.merge_status IS NULL THEN NEW.merge_status := 'proposed'; END IF;
  IF EXISTS (SELECT 1 FROM public.military_records p WHERE p.id = NEW.merged_into_record_id AND p.merged_into_record_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Merge target is itself merged into another record';
  END IF;
  IF EXISTS (SELECT 1 FROM public.military_records c WHERE c.merged_into_record_id = NEW.id) THEN
    RAISE EXCEPTION 'This record has merged children and cannot be merged into another record';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER military_records_merge_guard BEFORE INSERT OR UPDATE OF merged_into_record_id, merge_status, merge_confidence ON public.military_records
  FOR EACH ROW EXECUTE FUNCTION public.military_records_merge_guard();

-- Public pages need to know whether a record is merged (to hide it / redirect) and which children are confirmed.
GRANT SELECT (merged_into_record_id, merge_status) ON public.military_records TO anon, authenticated;