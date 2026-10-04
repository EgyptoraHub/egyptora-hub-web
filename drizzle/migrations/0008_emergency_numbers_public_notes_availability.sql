ALTER TABLE public.emergency_numbers
  ADD COLUMN IF NOT EXISTS public_note_ar text,
  ADD COLUMN IF NOT EXISTS public_note_en text,
  ADD COLUMN IF NOT EXISTS availability_ar text,
  ADD COLUMN IF NOT EXISTS availability_en text;
UPDATE public.emergency_numbers SET availability_ar = availability WHERE availability_ar IS NULL AND availability IS NOT NULL AND availability <> '';
COMMENT ON COLUMN public.emergency_numbers.availability IS 'DEPRECATED: replaced by availability_ar / availability_en';
COMMENT ON COLUMN public.emergency_numbers.notes IS 'Internal admin-only notes; never shown publicly';