create table public.emergency_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  color text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.emergency_numbers (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.emergency_categories(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  number text not null,
  dial_string text not null,
  availability text,
  status text not null default 'needs_check' check (status in ('verified','needs_check')),
  source_url text,
  notes text,
  is_primary boolean not null default false,
  is_active boolean not null default false,
  sort_order int not null default 0,
  last_verified_at date not null default date '2026-10-04',
  governance_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.emergency_reports (
  id uuid primary key default gen_random_uuid(),
  number_id uuid references public.emergency_numbers(id) on delete set null,
  message text not null check (char_length(message) between 5 and 500),
  contact_email text,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

GRANT SELECT ON public.emergency_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.emergency_categories TO authenticated;
GRANT ALL ON public.emergency_categories TO service_role;
GRANT SELECT ON public.emergency_numbers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.emergency_numbers TO authenticated;
GRANT ALL ON public.emergency_numbers TO service_role;
GRANT INSERT ON public.emergency_reports TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.emergency_reports TO authenticated;
GRANT ALL ON public.emergency_reports TO service_role;

ALTER TABLE public.emergency_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active emergency categories" ON public.emergency_categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins read all emergency categories" ON public.emergency_categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write emergency categories" ON public.emergency_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public reads active verified emergency numbers" ON public.emergency_numbers FOR SELECT TO anon, authenticated USING (is_active = true AND status = 'verified');
CREATE POLICY "Admins read all emergency numbers" ON public.emergency_numbers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write emergency numbers" ON public.emergency_numbers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can report a wrong number" ON public.emergency_reports FOR INSERT TO anon, authenticated WITH CHECK (handled = false AND (contact_email IS NULL OR char_length(contact_email) <= 254));
CREATE POLICY "Admins read emergency reports" ON public.emergency_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update emergency reports" ON public.emergency_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete emergency reports" ON public.emergency_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER emergency_numbers_touch BEFORE UPDATE ON public.emergency_numbers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.emergency_reports_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.emergency_reports WHERE created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'Too many reports, please try again shortly';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER emergency_reports_rate_limit BEFORE INSERT ON public.emergency_reports FOR EACH ROW EXECUTE FUNCTION public.emergency_reports_rate_limit();

insert into public.emergency_categories (slug, name_ar, name_en, color, sort_order) values
  ('emergency', 'الطوارئ', 'Emergency', '#C62828', 1),
  ('tourism', 'السياحة', 'Tourism', '#B8860B', 2),
  ('transport', 'المواصلات', 'Transport', '#1565C0', 3),
  ('utilities', 'المرافق', 'Utilities', '#E65100', 4),
  ('health', 'الصحة', 'Health', '#2E7D32', 5),
  ('government_services', 'خدمات حكومية', 'Government Services', '#4527A0', 6),
  ('consumer_protection', 'حماية المستهلك', 'Consumer Protection', '#00695C', 7),
  ('telecom', 'الاتصالات', 'Telecom', '#00838F', 8),
  ('finance_banking', 'المال والبنوك', 'Finance & Banking', '#37474F', 9),
  ('social_family', 'الأسرة والمجتمع', 'Family & Social', '#AD1457', 10);

with c as (select id, slug from public.emergency_categories)
insert into public.emergency_numbers
 (category_id, name_ar, name_en, number, dial_string, availability, status, source_url, notes, is_primary, is_active, sort_order)
select c.id, v.name_ar, v.name_en, v.number, v.dial_string, v.availability, v.status, v.source_url, v.notes, v.is_primary, v.is_active, v.sort_order
from (values
  ('emergency', 'شرطة النجدة', 'Emergency Police', '122', '122', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', NULL, true, true, 1),
  ('emergency', 'الإسعاف', 'Ambulance', '123', '123', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', NULL, true, true, 2),
  ('emergency', 'الحماية المدنية / المطافئ', 'Fire Department / Civil Defense', '180', '180', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', NULL, true, true, 3),
  ('emergency', 'رقم الطوارئ الموحد (GSM)', 'General emergency (GSM)', '112', '112', '24/7', 'needs_check', 'https://www.elwatannews.com/news/details/6969595', 'مصدر واحد؛ لا يُعرض كرقم أساسي', false, false, 4),
  ('tourism', 'شرطة السياحة', 'Tourist Police', '126', '126', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', NULL, false, true, 5),
  ('tourism', 'وزارة السياحة والآثار - الخط الساخن', 'Ministry of Tourism & Antiquities Hotline', '19654', '19654', '9:00-17:00 يوميًا', 'verified', 'https://egymonuments.gov.eg/ar/news/hot-line-service-19654/', 'الساعات من إعلان 2020 - راجعها', false, true, 6),
  ('transport', 'شرطة المرور', 'Traffic Police', '128', '128', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', NULL, false, true, 7),
  ('transport', 'نجدة الطرق السريعة', 'Highway Emergency Assistance', '01221110000', '01221110000', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', 'رقم موبايل', false, true, 8),
  ('transport', 'السكة الحديد', 'Egyptian National Railways', '15047', '15047', NULL, 'verified', 'https://www.elbalad.news/5863341', 'راجع mobtada.com/egypt/836444 قبل النشر', false, true, 9),
  ('transport', 'مترو الأنفاق', 'Cairo Metro', '16048', '16048', '24/7', 'verified', 'https://www.albawabhnews.com/4400261', 'واتساب 01221116048', false, true, 10),
  ('transport', 'مصر للطيران - خدمة العملاء', 'EgyptAir Call Center', '1717', '1717', NULL, 'verified', 'https://x.com/EGYPTAIR/status/1783507444548661664', 'من الموبايل داخل مصر', false, true, 11),
  ('transport', 'شكاوى وزارة النقل', 'Ministry of Transport Complaints', '19487', '19487', NULL, 'needs_check', 'cbcsofra.com', 'مصدر واحد', false, false, 12),
  ('transport', 'خدمات مرور القاهرة', 'Cairo Traffic Administration Services', '136', '136', NULL, 'needs_check', 'https://www.elwatannews.com/news/details/6969595', 'مصدر واحد', false, false, 13),
  ('utilities', 'طوارئ الكهرباء', 'Electricity Emergency', '121', '121', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', NULL, false, true, 14),
  ('utilities', 'طوارئ الغاز الطبيعي', 'Natural Gas Emergency', '129', '129', '24/7', 'verified', 'https://www.orange.eg/ar/help/emergency-numbers', NULL, false, true, 15),
  ('utilities', 'المياه والصرف الصحي', 'Water & Sewage Hotline', '125', '125', '24/7', 'verified', 'https://www.hcww.com.eg/%D8%A3%D8%AA%D8%B5%D9%84-%D8%A8%D9%86%D8%A7/', '175 للصرف في القاهرة والإسكندرية', false, true, 16),
  ('health', 'الخط الساخن لوزارة الصحة', 'Ministry of Health Hotline', '105', '105', NULL, 'verified', 'https://www.elwatannews.com/news/details/7015333', 'الوصف يختلف بين المصادر', false, true, 17),
  ('health', 'خدمات وزارة الصحة', 'Ministry of Health Services Line', '15335', '15335', NULL, 'verified', 'https://www.elwatannews.com/news/details/7015333', NULL, false, true, 18),
  ('health', 'الدعم النفسي', 'Mental Health Support', '16328', '16328', NULL, 'verified', 'https://directory.malafaat.com/2024/11/05/emergency-and-public-services-numbers-in-egypt/', 'مصدران', false, true, 19),
  ('health', 'غرف طوارئ وزارة الصحة', 'MoH Emergency Rooms Line', '137', '137', NULL, 'needs_check', 'cbcsofra.com', 'مصدر واحد', false, false, 20),
  ('health', 'التأمين الصحي الشامل', 'Universal Health Insurance', '15344', '15344', NULL, 'needs_check', 'https://www.elwatannews.com/news/details/7015333', 'مصدر واحد', false, false, 21),
  ('health', 'الهيئة العامة للتأمين الصحي', 'General Health Insurance Authority', '106', '106', NULL, 'needs_check', 'https://inmisr.com/emergency', 'مصدر واحد', false, false, 22),
  ('health', 'علاج الإدمان', 'Addiction Treatment Hotline', '16023', '16023', NULL, 'needs_check', 'cbcsofra.com', 'مصدر واحد', false, false, 23),
  ('health', 'مركز السموم', 'Poison Control (Cairo landline)', '0223640402', '0223640402', NULL, 'needs_check', 'https://directory.malafaat.com/2024/11/05/emergency-and-public-services-numbers-in-egypt/', 'تحقق من قصر العيني', false, false, 24),
  ('government_services', 'منظومة الشكاوى الحكومية الموحدة', 'Unified Government Complaints', '16528', '16528', NULL, 'verified', 'https://www.elwatannews.com/news/details/6549173', 'واتساب 01555516528', false, true, 25),
  ('government_services', 'هيئة الرقابة الإدارية', 'Administrative Control Authority', '16100', '16100', NULL, 'verified', 'https://aca.gov.eg/News/1647.aspx', NULL, false, true, 26),
  ('government_services', 'الهيئة القومية للتأمين الاجتماعي', 'National Organization for Social Insurance', '16217', '16217', 'الأحد-الخميس 9-17', 'verified', 'https://www.elwatannews.com/news/details/7337599', '16217 ليس رقم الخارجية', false, true, 27),
  ('government_services', 'مصلحة الضرائب المصرية', 'Egyptian Tax Authority', '16395', '16395', NULL, 'verified', 'https://www.eta.gov.eg/en/content/call-us', NULL, false, true, 28),
  ('government_services', 'هيئة البريد المصري', 'Egypt Post', '16789', '16789', 'السبت-الخميس 8:30-17', 'verified', 'https://www.elwatannews.com/news/details/6918118', NULL, false, true, 29),
  ('government_services', 'دار الإفتاء المصرية', 'Dar Al-Ifta', '107', '107', NULL, 'verified', 'https://inmisr.com/emergency', NULL, false, true, 30),
  ('government_services', 'الخارجية - الشؤون القنصلية (واتساب فقط)', 'Foreign Ministry Consular (WhatsApp only)', '+201226858000', '+201226858000', NULL, 'verified', 'https://www.elbalad.news/6725201', 'للمصريين بالخارج؛ لا يوجد كود قصير', false, true, 31),
  ('government_services', 'خدمة وثائق الأحوال المدنية للمنازل', 'Civil Status Home Service', '15341', '15341', NULL, 'needs_check', 'https://www.elwatannews.com/news/details/6643520', 'مصدر واحد', false, false, 32),
  ('government_services', 'وزارة الداخلية', 'Ministry of Interior', '138', '138', NULL, 'needs_check', 'https://inmisr.com/emergency', 'مصدر واحد', false, false, 33),
  ('government_services', 'الأمن العام', 'General Security', '115', '115', NULL, 'needs_check', 'https://inmisr.com/emergency', 'مصدر واحد', false, false, 34),
  ('government_services', 'وزارة التعليم', 'Ministry of Education', '19151', '19151', NULL, 'needs_check', 'https://inmisr.com/emergency', 'مصدر واحد', false, false, 35),
  ('consumer_protection', 'جهاز حماية المستهلك', 'Consumer Protection Agency', '19588', '19588', NULL, 'verified', 'https://cpa.gov.eg/ar-EG/%D8%A7%D8%AA%D8%B5%D9%84-%D8%A8%D9%86%D8%A7', 'واتساب 01577779999', false, true, 36),
  ('telecom', 'الجهاز القومي لتنظيم الاتصالات', 'NTRA Complaints', '155', '155', 'يوميًا 8-22', 'verified', 'https://www.elwatannews.com/news/details/5563106', NULL, false, true, 37),
  ('telecom', 'شكاوى الخطوط الأرضية', 'Landline Complaints (TE)', '16', '16', NULL, 'needs_check', 'https://www.orange.eg/ar/help/emergency-numbers', 'مصدر واحد', false, false, 38),
  ('finance_banking', 'الرقابة المالية - شكاوى', 'Financial Regulatory Authority', '0235345350', '0235345350', 'الأحد-الخميس 9-15', 'verified', 'https://fra.gov.eg/complains/', 'خط أرضي (داخلي 2001)؛ لا يوجد كود قصير', false, true, 39),
  ('finance_banking', 'البنك المركزي (خدمة العملاء)', 'Central Bank of Egypt', '16777', '16777', NULL, 'needs_check', 'https://140.tel/Hotline/16777-m', 'دليل فقط', false, false, 40),
  ('social_family', 'نجدة الطفل', 'Child Helpline', '16000', '16000', '24/7', 'verified', 'https://www.elwatannews.com/news/details/8292333', 'واتساب 01102121600', false, true, 41),
  ('social_family', 'المجلس القومي للمرأة', 'National Council for Women', '15115', '15115', 'الأحد-الخميس 9-16', 'verified', 'https://www.elwatannews.com/news/details/8065545', NULL, false, true, 42),
  ('social_family', 'تكافل وكرامة', 'Takaful & Karama', '19680', '19680', NULL, 'needs_check', 'cbcsofra.com', 'مصدر واحد', false, false, 43)
) as v(slug, name_ar, name_en, number, dial_string, availability, status, source_url, notes, is_primary, is_active, sort_order)
join c on c.slug = v.slug;