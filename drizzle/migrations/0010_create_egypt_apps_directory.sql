create table public.app_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text not null,
  name_en text not null,
  icon text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.egypt_apps (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.app_categories(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  publisher text,
  app_type text not null check (app_type in ('government','service','private')),
  description_ar text,
  description_en text,
  google_play_url text,
  app_store_url text,
  website_url text,
  is_featured boolean not null default false,
  status text not null default 'needs_check' check (status in ('verified','needs_check')),
  last_verified_at date not null default date '2026-10-04',
  last_link_check date,
  internal_notes text,
  is_active boolean not null default false,
  sort_order int not null default 0,
  governance_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_reports (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.egypt_apps(id) on delete set null,
  message text not null check (char_length(message) between 5 and 500),
  contact_email text,
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

GRANT SELECT ON public.app_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_categories TO authenticated;
GRANT ALL ON public.app_categories TO service_role;
GRANT SELECT (id, category_id, name_ar, name_en, publisher, app_type, description_ar, description_en, google_play_url, app_store_url, website_url, is_featured, status, last_verified_at, last_link_check, is_active, sort_order, governance_status, created_at, updated_at) ON public.egypt_apps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.egypt_apps TO authenticated;
GRANT ALL ON public.egypt_apps TO service_role;
GRANT INSERT ON public.app_reports TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.app_reports TO authenticated;
GRANT ALL ON public.app_reports TO service_role;

ALTER TABLE public.app_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.egypt_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active app categories" ON public.app_categories FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins read all app categories" ON public.app_categories FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write app categories" ON public.app_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public reads active apps" ON public.egypt_apps FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins read all apps" ON public.egypt_apps FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write apps" ON public.egypt_apps FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can report an app" ON public.app_reports FOR INSERT TO anon, authenticated WITH CHECK (handled = false);
CREATE POLICY "Admins read app reports" ON public.app_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update app reports" ON public.app_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete app reports" ON public.app_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER egypt_apps_touch BEFORE UPDATE ON public.egypt_apps FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.app_reports_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.app_reports WHERE created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'Too many reports, please try again shortly';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER app_reports_rate_limit BEFORE INSERT ON public.app_reports FOR EACH ROW EXECUTE FUNCTION public.app_reports_rate_limit();

insert into public.app_categories (slug, name_ar, name_en, icon, sort_order) values
  ('government_services', 'الخدمات الحكومية', 'Government Services', 'landmark', 1),
  ('transport', 'النقل والمواصلات', 'Transport', 'bus', 2),
  ('health', 'الصحة', 'Health', 'heart-pulse', 3),
  ('banking_payments', 'البنوك والمدفوعات', 'Banking & Payments', 'wallet', 4),
  ('telecom', 'الاتصالات', 'Telecom', 'smartphone', 5),
  ('social_insurance_tax', 'التأمينات والضرائب', 'Insurance & Tax', 'file-text', 6),
  ('justice_legal', 'العدل والقانون', 'Justice & Legal', 'scale', 7),
  ('utilities', 'المرافق', 'Utilities', 'zap', 8),
  ('education', 'التعليم', 'Education', 'graduation-cap', 9),
  ('tourism', 'السياحة والترفيه', 'Tourism & Leisure', 'map', 10),
  ('shopping_delivery', 'التوصيل والتسوق اليومي', 'Delivery & Daily Shopping', 'shopping-bag', 11),
  ('ecommerce_marketplace', 'التجارة الإلكترونية', 'E-commerce & Marketplaces', 'store', 12),
  ('real_estate', 'العقارات', 'Real Estate', 'home', 13),
  ('jobs', 'الوظائف', 'Jobs', 'briefcase', 14),
  ('news_media', 'الأخبار والإعلام', 'News & Media', 'newspaper', 15);

with c as (select id, slug from public.app_categories)
insert into public.egypt_apps
 (category_id, name_ar, name_en, publisher, app_type, google_play_url, app_store_url, website_url, status, is_active, sort_order)
select c.id, v.name_ar, v.name_en, v.publisher, v.app_type, v.gp, v.ap, v.web, v.status, v.is_active, v.sort_order
from (values
  ('government_services', 'مصر الرقمية', 'Digital Egypt', 'MCIT', 'government', 'https://play.google.com/store/apps/details?id=gov.ministryofcommunicationsandinformationtechnology.digitalegypt', 'https://apps.apple.com/eg/app/id1512178806', 'https://mcit.gov.eg/en/Digital_Egypt', 'verified', true, 1),
  ('government_services', 'الهوية الرقمية', 'Digital Identity (Egypass)', 'MCIT', 'government', 'https://play.google.com/store/apps/details?id=gov.mcit.Egypass', NULL, NULL, 'needs_check', false, 2),
  ('government_services', 'مجلس الوزراء المصري', 'The Egyptian Cabinet', 'Egyptian Cabinet', 'government', 'https://play.google.com/store/apps/details?id=cabinet.gov.eg', NULL, NULL, 'needs_check', false, 3),
  ('government_services', 'في خدمتك', 'Fi Khedmetak (Citizen Complaints)', 'Egyptian Cabinet (IDSC)', 'government', 'https://play.google.com/store/apps/details?id=idsc.shakwa', NULL, NULL, 'needs_check', false, 4),
  ('government_services', 'وزارة الداخلية المصرية', 'Ministry of Interior Egypt', 'Ministry of Interior', 'government', 'https://play.google.com/store/apps/details?id=moi.com.excel.moi', 'https://apps.apple.com/ae/app/id1459563811', NULL, 'verified', true, 5),
  ('government_services', 'MOIEG-PASS', 'MOIEG-PASS', 'Unconfirmed (MOI?)', 'government', 'https://play.google.com/store/apps/details?id=moi.gov.eg', NULL, NULL, 'needs_check', false, 6),
  ('government_services', 'البريد المصري', 'Egypt Post', 'Unconfirmed', 'government', 'https://play.google.com/store/apps/details?id=org.egyptpost.postapp', NULL, NULL, 'needs_check', false, 7),
  ('transport', 'السكة الحديد المصرية', 'Egyptian National Railways', 'ENR', 'government', 'https://play.google.com/store/apps/details?id=enr.transit.maf', NULL, 'https://www.enr.gov.eg', 'verified', true, 8),
  ('transport', 'مصر للطيران', 'EGYPTAIR', 'EGYPTAIR Airlines', 'service', 'https://play.google.com/store/apps/details?id=com.linkdev.egyptair.app', 'https://apps.apple.com/us/app/id591656508', 'https://www.egyptair.com', 'verified', true, 9),
  ('transport', 'أوبر', 'Uber', 'Uber Technologies', 'private', 'https://play.google.com/store/apps/details?id=com.ubercab', NULL, 'https://www.uber.com', 'verified', true, 10),
  ('transport', 'كريم', 'Careem', 'Careem', 'private', 'https://play.google.com/store/apps/details?id=com.careem.acma', NULL, NULL, 'verified', true, 11),
  ('transport', 'إن درايف', 'inDrive', 'inDrive', 'private', 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver', 'https://apps.apple.com/eg/app/id780125801', NULL, 'verified', true, 12),
  ('health', 'صحة مصر', 'Sehet Masr', 'Ministry of Health and Population', 'government', 'https://play.google.com/store/apps/details?id=com.gov.moh.MOHMobile', 'https://apps.apple.com/eg/app/id1506794318', 'https://mohpegypt.com/', 'verified', true, 13),
  ('health', 'جواز الصحة', 'Egypt Health Passport', 'Unconfirmed', 'government', 'https://play.google.com/store/apps/details?id=get.pid.egypt.health.passport', NULL, NULL, 'needs_check', false, 14),
  ('health', 'فيزيتا', 'Vezeeta', 'Vezeeta', 'private', 'https://play.google.com/store/apps/details?id=com.ionicframework.vezeetapatientsmobile694843', 'https://apps.apple.com/us/app/id1010281314', 'https://www.vezeeta.com/en', 'verified', true, 15),
  ('health', 'العزبي', 'Elezaby Pharmacy', 'Elezaby', 'private', 'https://play.google.com/store/apps/details?id=com.awfar.elezaby', 'https://apps.apple.com/us/app/id1528993866', 'https://elezabypharmacy.com/', 'verified', true, 16),
  ('banking_payments', 'إنستاباي', 'InstaPay Egypt', 'Egyptian Banks Company', 'service', 'https://play.google.com/store/apps/details?id=com.egyptianbanks.instapay', 'https://apps.apple.com/us/app/id1592108795', NULL, 'verified', true, 17),
  ('banking_payments', 'فوري', 'myfawry', 'Fawry', 'private', NULL, 'https://apps.apple.com/eg/app/id1462911630', 'https://www.fawry.com/consumer/myfawry-app/', 'verified', true, 18),
  ('banking_payments', 'فوري+', 'Fawry+', 'Unconfirmed', 'private', 'https://play.google.com/store/apps/details?id=com.nymcard.fib', NULL, NULL, 'needs_check', false, 19),
  ('banking_payments', 'البنك الأهلي المصري', 'NBE Mobile', 'National Bank of Egypt', 'private', 'https://play.google.com/store/apps/details?id=com.ofss.obdx.and.nbe.com.eg', 'https://apps.apple.com/us/app/id1596302687', NULL, 'verified', true, 20),
  ('banking_payments', 'بنك مصر', 'BM Online', 'Banque Misr', 'private', 'https://play.google.com/store/apps/details?id=com.BanqueMisr.MobileBanking', NULL, 'https://www.banquemisr.com/en/Home/Pages/BM-Online---Internet-and-Mobile-banking', 'verified', true, 21),
  ('banking_payments', 'البنك التجاري الدولي', 'CIB Mobile Banking', 'CIB', 'private', 'https://play.google.com/store/apps/details?id=com.cibeg.ddc1.digitalbanking.live', 'https://apps.apple.com/us/app/id6618151705', 'https://www.cibeg.com/en/mycib', 'verified', true, 22),
  ('banking_payments', 'ميزة', 'Meeza', 'Meeza', 'service', 'https://play.google.com/store/apps/details?id=com.meeza.app', NULL, 'https://meeza-eg.com/', 'needs_check', false, 23),
  ('banking_payments', 'إي آند موني', 'e& money - EG', 'e& Egypt', 'private', 'https://play.google.com/store/apps/details?id=com.etisalat.flous', 'https://apps.apple.com/eg/app/id1123428821', NULL, 'verified', true, 24),
  ('telecom', 'أنا فودافون', 'Ana Vodafone', 'Vodafone Egypt', 'private', 'https://play.google.com/store/apps/details?id=com.emeint.android.myservices', 'https://apps.apple.com/eg/app/id437564823', NULL, 'verified', true, 25),
  ('telecom', 'ماي أورنج', 'My Orange Egypt', 'Orange Egypt', 'private', 'https://play.google.com/store/apps/details?id=com.orange.mobinilandme', 'https://apps.apple.com/at/app/id942568333', 'https://www.orange.eg/en/entertainment/orange-apps/my-orange', 'verified', true, 26),
  ('telecom', 'ماي وي', 'My WE', 'Telecom Egypt', 'private', 'https://play.google.com/store/apps/details?id=com.ucare.we', 'https://apps.apple.com/us/app/id1413151505', 'https://te.eg/en/web/guest/w/my-we-app', 'verified', true, 27),
  ('telecom', 'ماي اتصالات', 'My e& EG', 'e& Egypt', 'private', 'https://play.google.com/store/apps/details?id=com.etisalat', 'https://apps.apple.com/mw/app/id558287646', NULL, 'verified', true, 28),
  ('social_insurance_tax', 'تأميناتي', 'Ta''aminaty', 'MCIT / NOSI?', 'government', 'https://play.google.com/store/apps/details?id=gov.mcit.digitalegypt.nosi', NULL, NULL, 'needs_check', false, 29),
  ('social_insurance_tax', 'الفاتورة الإلكترونية', 'Egyptian eInvoicing', 'Egyptian Tax Authority', 'government', 'https://play.google.com/store/apps/details?id=eg.gov.eta.einvoicing', NULL, 'https://eta.gov.eg/en/home', 'verified', true, 30),
  ('social_insurance_tax', 'الضرائب العقارية', 'Egyptian Real Estate Taxes', 'Unconfirmed', 'government', 'https://play.google.com/store/apps/details?id=com.etax.realestatetaxes', NULL, NULL, 'needs_check', false, 31),
  ('utilities', 'خدمات الكهرباء الذكية', 'Smart Electricity Services', 'Unconfirmed', 'government', 'https://play.google.com/store/apps/details?id=com.fixedmea.eehc', NULL, NULL, 'needs_check', false, 32),
  ('education', 'بنك المعرفة المصري', 'EKB Search', 'Egyptian Knowledge Bank', 'government', NULL, 'https://apps.apple.com/eg/app/id1570792123', NULL, 'needs_check', false, 33),
  ('tourism', 'زوروا مصر', 'Visit Egypt', 'Unconfirmed', 'government', 'https://play.google.com/store/apps/details?id=com.egypt.visitegypt.app', NULL, NULL, 'needs_check', false, 34),
  ('tourism', 'احجزلي', 'E7GEZLY', 'E7GEZLY', 'private', 'https://play.google.com/store/apps/details?id=com.app.e7gezly', NULL, 'https://ehgezly.app/', 'verified', true, 35),
  ('shopping_delivery', 'طلبات', 'talabat', 'Delivery Hero', 'private', 'https://play.google.com/store/apps/details?id=com.talabat', 'https://apps.apple.com/us/app/id451001072', 'https://www.talabat.com/egypt', 'verified', true, 36),
  ('shopping_delivery', 'مرسول', 'Mrsool', 'Mrsool', 'private', 'https://play.google.com/store/apps/details?id=com.mrsool', 'https://apps.apple.com/us/app/id1040038773', NULL, 'needs_check', false, 37),
  ('shopping_delivery', 'بريد فاست', 'Breadfast', 'Breadfast', 'private', 'https://play.google.com/store/apps/details?id=com.breadfast', 'https://apps.apple.com/us/app/id1288436997', 'https://www.breadfast.com/', 'verified', true, 38),
  ('ecommerce_marketplace', 'نون', 'noon', 'noon', 'private', 'https://play.google.com/store/apps/details?id=com.noon.buyerapp', 'https://apps.apple.com/eg/app/id1269038866', 'https://www.noon.com/egypt-en/', 'verified', true, 39),
  ('ecommerce_marketplace', 'جوميا', 'Jumia', 'Jumia', 'private', 'https://play.google.com/store/apps/details?id=com.jumia.android', 'https://apps.apple.com/eg/app/id925015459', 'https://www.jumia.com.eg/sp-mobile-apps/', 'verified', true, 40),
  ('ecommerce_marketplace', 'دوبيزل مصر', 'dubizzle EG', 'dubizzle', 'private', 'https://play.google.com/store/apps/details?id=com.olxmena.horizontal', 'https://apps.apple.com/eg/app/id1582817937', 'https://www.dubizzle.com.eg/en/', 'verified', true, 41),
  ('real_estate', 'عقار ماب', 'Aqarmap', 'Aqarmap', 'private', 'https://play.google.com/store/apps/details?id=com.aqarmap.android', 'https://apps.apple.com/eg/app/id642633889', NULL, 'verified', true, 42),
  ('real_estate', 'بروبرتي فايندر', 'Property Finder EG', 'Property Finder', 'private', 'https://play.google.com/store/apps/details?id=ae.propertyfinder.propertyfinder', NULL, 'https://www.propertyfinder.eg/en', 'verified', true, 43),
  ('real_estate', 'بيوت مصر', 'Bayut Egypt', 'Bayut', 'private', 'https://play.google.com/store/apps/details?id=com.bayut.bayuteg', NULL, NULL, 'verified', true, 44),
  ('jobs', 'وظف', 'WUZZUF', 'WUZZUF', 'private', 'https://play.google.com/store/apps/details?id=com.wuzzuf.app', NULL, 'https://wuzzuf.net', 'verified', true, 45),
  ('news_media', 'مصراوي', 'Masrawy', 'Masrawy', 'private', 'https://play.google.com/store/apps/details?id=com.gemini.masrawyapp', NULL, NULL, 'verified', true, 46),
  ('news_media', 'اليوم السابع', 'Youm7', 'Youm7', 'private', 'https://play.google.com/store/apps/details?id=com.youm7.news', NULL, NULL, 'verified', true, 47),
  ('news_media', 'بوابة الأهرام', 'Al-Ahram Gate', 'Unconfirmed', 'private', 'https://play.google.com/store/apps/details?id=com.Amac.ahram_app', NULL, NULL, 'needs_check', false, 48),
  ('news_media', 'المصري اليوم', 'Al-Masry Al-Youm', 'Al-Masry Al-Youm', 'private', 'https://play.google.com/store/apps/details?id=net.sarmady.almasryalyoum', NULL, NULL, 'verified', true, 49)
) as v(slug, name_ar, name_en, publisher, app_type, gp, ap, web, status, is_active, sort_order)
join c on c.slug = v.slug;