ALTER TABLE public.military_records ALTER COLUMN register_no DROP NOT NULL;
ALTER TABLE public.military_records ALTER COLUMN title_en DROP NOT NULL;
ALTER TABLE public.military_records DROP CONSTRAINT military_records_record_type_check;
ALTER TABLE public.military_records ADD CONSTRAINT military_records_record_type_check CHECK (record_type IN ('battle','war','campaign','siege','naval','air','operation','defensive_action','conflict_phase','other_record','invasion','revolt_resistance','amphibious_landing','raid','needs_classification'));
ALTER TABLE public.military_records ADD CONSTRAINT military_records_title_present CHECK (coalesce(trim(title_ar),'') <> '' OR coalesce(trim(title_en),'') <> '');

-- Placeholder register titles can never be switched on, whatever path writes the row.
CREATE OR REPLACE FUNCTION public.military_records_block_placeholder()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_active AND coalesce(NEW.title_ar,'') LIKE '%سجل عسكري تاريخي رقم%' THEN
    RAISE EXCEPTION 'Placeholder title: replace the title before activating this record';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER military_records_block_placeholder BEFORE INSERT OR UPDATE ON public.military_records
FOR EACH ROW EXECUTE FUNCTION public.military_records_block_placeholder();