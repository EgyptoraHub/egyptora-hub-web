# Prompt 57r — Research: official sources for Education data

Research only. No code, database, data, navigation, flags or sitemap was changed. This is the only file created.

- **Accessed:** 18 Nov 2026 (UTC)
- **Method and limits, read this first.**
  - (a) A direct fetch from the research sandbox. Most `.eg` hosts timed out (`000`) or hit a proxy tunnel error from there. `moe.gov.eg` returned `403 Forbidden` (Azure gateway).
  - (b) A web search index, which returns stored page text. Content marked **"via index"** below was read from that stored copy, not from a live load. Re-check it live before anyone relies on it.
  - Only "direct" means I loaded the page myself on the access date.
  - **"HTTPS"** means the URL is published under `https://`. It does not mean I confirmed a live TLS handshake unless the entry says "direct".
- **Page budget:** about 25 pages and search results in total.

## Part A — Postgraduate / research programmes

| Source | URL | HTTPS | Readable | What it lists (quoted) | Fees / duration / admission / accreditation | Accessed |
|---|---|---|---|---|---|---|
| Cairo Univ., Faculty of Archaeology (EN) | http://fa-arch.cu.edu.eg/en/postgraduatePrograms.html | No (http only; https direct fetch failed) | Yes, via index | "4 general diploamtic programs, 10 specialized deplomatic programs, 4 specialized deplomatic programs and 4 techincal programs. Moreover there are 14 master programs and 14 Phd programs" (site spelling). Examples: "Egyptology Diploma (Arabic)", "Archaeological Conservation Diploma (Arabic)", "Architecture Conservation Diploma (Arabic)" | Duration yes (credit hours and semesters); admission yes, via linked "Conditions and Rules" (PDF); fees no; accreditation no | 18 Nov 2026 |
| Cairo Univ., Faculty of Archaeology (AR) | http://fa-arch.cu.edu.eg/postgraduatePrograms.html | No | Yes, via index | "اربعة دبلومات عامة وعشرة دبلومات متخصصة واربعة دبلومات مهنية … اربعة عشر برنامج ماجستير واربعة عشر برنامج دكتوراة" | Duration yes; admission via PDF links; fees no; accreditation no | 18 Nov 2026 |
| Ain Shams Univ., Faculty of Archaeology postgraduate page | https://www.asu.edu.eg/1730/page | Yes | Via index only (direct fetch: "Whoops, looks like something went wrong.") | 6 diplomas, 5 master's, 12 PhD. Examples: "Museums and Archaeological Sites Management", "Master of Archaeology and Excavation", "PhD in Conservation and Restoration of Organic Antiquities" | No on this page (programme sub-pages such as /1744/page state duration and admission) | 18 Nov 2026 |
| Ain Shams faculty site, master's list | https://arch.asu.edu.eg/ar/page/44 | Yes | Yes, via index | 12 specialisations, for example "علوم الآثار والحفائر", "إدارة المتاحف والمواقع الأثرية". The page header shows placeholder contacts ("12345678901", "test@arch.asu.edu.eg") | No | 18 Nov 2026 |
| Sohag Univ., Faculty of Archaeology, postgraduate sector | https://arc.sohag-univ.edu.eg/main/en/postgraduate-studies-and-research-sector/ | Yes | Yes, via index | Section headings only: "Registration for the General Diploma", "Preliminary Master's Registration", "Master's Degree Registration", "Registration for the Doctoral Program". No named programme list in the indexed text | Admission yes (separate conditions page); fees mentioned only as stamp duties on forms; duration no; accreditation no | 18 Nov 2026 |
| Damietta Univ., Faculty of Archaeology, postgraduate | https://arch.du.edu.eg/Unit/Details/1016/1068/ | Yes | Via index (direct: proxy error) | "تمنح الكلية درجة الماجستير والدكتوراه فى الآثار فى 3 تخصصات": "ترميم وصيانة الآثار", "الآثار المصرية القديمة", "الآثار الاسلامية" (3 master's + 3 PhD) | Study system (credit hours) yes; fees no; admission no; accreditation no | 18 Nov 2026 |
| Aswan Univ., humanities postgraduate programmes | https://aswu.edu.eg/education/postgraduate-programs/postgradute-literary-college-programs/ | Yes | Yes, via index | Lists Education, Arts and Law programmes. Arts master's includes "التاريخ اليونانى والرومانى". No archaeology faculty programme appears in the indexed text | No | 18 Nov 2026 |
| Cairo Univ., central graduate programmes (humanities) | https://cu.edu.eg/page.php?SubSectionId=837&pg=contentFront%2FSubSectionData.php | Yes | Yes, via index | Departments offering diploma, master's and PhD, for example "Department of History", "Department of Libraries, Archives, and Information". Archaeology does not appear in the indexed excerpt | No | 18 Nov 2026 |
| Ain Shams doctorate page (Part A.2, other faculties) | https://www.asu.edu.eg/343/page | Yes | **No** (direct: "Whoops, looks like something went wrong."; not in index) | Not readable, so no faculty names or counts were recorded | — | 18 Nov 2026 |
| Study in Egypt, Programs | https://study-in-egypt.gov.eg/en/programs | Yes | Partly (direct) | Category cards only: "Postgraduate Education … Programs +100", "Higher Education … Programs +150", "Arabic Department Services … Programs +10". Individual programmes load by script after selection and were not readable | Duration yes ("2-10 semester" per category); others no | 18 Nov 2026 |
| Study in Egypt, Universities | https://study-in-egypt.gov.eg/en/universities | Yes | Partly (direct) | University cards, for example "Hurghada University — Governmental universities … +4 كليات", with filters "Technology / Governmental / International / National / Private universities". No downloadable listing | No | 18 Nov 2026 |
| Study in Egypt, sitemap.xml | https://study-in-egypt.gov.eg/sitemap.xml | Yes (direct, HTTP 200) | Yes | Only top-level pages (programs, universities, faq, how-to-apply, …). Every `<loc>` points to a non-government host, `sie-frontend.apps.fslabs.net`. No per-programme or per-university URLs and no API URL on the public page | No | 18 Nov 2026 |
| Supreme Council of Universities | https://scu.eg | Yes | Yes (direct) | Home page: service links (for example "منصة الأنشطة الطلابية", "الترقيات") and news about ministerial decree 592 of 11/3/2025. No central programme list found on the page | No | 18 Nov 2026 |

Not checked within the page budget: Alexandria, Minia, Fayoum (the only indexed hit was a 2019/2020 guide **PDF**, which is not allowed), Luxor, South Valley, Suez Canal, Helwan and Tanta faculty pages; the Ministry of Higher Education programme pages.

## Part B — Platforms directory gaps

| Source | URL | HTTPS | Readable | What it lists / states (quoted) | Fees / duration / admission / accreditation | Accessed |
|---|---|---|---|---|---|---|
| MoE "Educational platforms" (EN) | https://moe.gov.eg/en/educationalplatform | Yes | Via index only (direct: 403 Forbidden) | 6 items: "hesas", "High School Concepts Folder", "E-Learning Portal", "Streaming", "Egyptian portal for technical education", "منصة تعلم معنا". The index text does not show target URLs | No | 18 Nov 2026 |
| MoE "المنصات التعليمية" (AR) | https://moe.gov.eg/ar/educationalplatform/ | Yes | Via index only (direct: 403) | 6 items: "منصة مدرستنا", "بوابة التعليم الإلكترونى", "منصة البث المباشر", "بوابة التعليم الفني", "منصة تعلم معنا", "المنصة الإلكترونية للتدريب والتطوير المهني للمعلمين". Target URLs not shown | No | 18 Nov 2026 |
| MoE e-learning entry page | https://moe.gov.eg/elearningenterypage | Yes | Via index only (direct: 403) | "أهلا بك.. فى منصة التعليم الإلكترونى": stages from KG to secondary plus "ذوي الإحتياجات الخاصة (بث تجريبى)". Contact: elearning@moe.gov.eg | No | 18 Nov 2026 |
| Hessas Misr | https://www.hesas.eg | Yes | **No** (direct timed out; no official indexed page) | — | — | 18 Nov 2026 |
| MoE streaming | https://stream.moe.gov.eg | Yes | **No** (direct timed out) | — | — | 18 Nov 2026 |
| MoE EduHub | https://eduhub.moe.gov.eg | Yes | **No** (direct timed out) | — | — | 18 Nov 2026 |
| Future Scholars, home | https://futurescholars.mohesr.gov.eg/ | Yes | Via index (direct: proxy error) | "الجنسية : أن يحمل الطالب الجنسية المصرية." / "التقدم: أن يكون الطالب من المستفيدين من مبادرة تكافل وكرامة أو الطلاب الذين تم إعفائهم من المصروفات من قبل وزارة التربية والتعليم ." / "المؤهل الدراسي: الحصول على الثانوية العامة من إحدى المدارس الحكومية." Fields: "الطب … الهندسة … الآثار". Bank details on the page are deliberately not copied | Admission yes; fees: coverage statement only ("تغطية كاملة للمصروفات الدراسية والإعاشة"); duration "حتى التخرج"; accreditation no | 18 Nov 2026 |
| Future Scholars, FAQ | https://futurescholars.mohesr.gov.eg/faqs | Yes | Via index | "الحاصلين على الثانوية العامة من إحدى المدارس الحكومية"; lists 31 participating national (أهلية) universities, for example "جامعة النيل الأهلية", "جامعة القاهرة الأهلية". Stage stated: secondary-school graduates entering university (undergraduate) | Admission yes; others no | 18 Nov 2026 |
| ASRT | https://asrt.sci.eg and https://www.asrt.sci.eg | Published as https by third parties | **No** (both timed out or proxy error directly; no official indexed page) | Subdomains found in the index over **http only**: http://submission.asrt.sci.eg/ ("Welcome to ASRT electronic submission system"), http://eforms.asrt.sci.eg/ | — | 18 Nov 2026 |
| SIS, ASRT profile | https://beta.sis.gov.eg/en/egypt/society/education/academy-of-scientific-research-and-technology/ | Yes | Via index | "established by Presidential Decree No. 2405 of September 1971 … affiliated … to the Minister of State for Scientific Research" | No | 18 Nov 2026 |
| SIS, Egyptian Knowledge Bank | https://sis.gov.eg/en/egypt/society/education/egyptian-knowledge-bank/ | Yes | Via index | "Negotiations took place in this regard between the Specialist Council for Education and Scientific Research, and several publishers". It does not name a current operating body | No | 18 Nov 2026 |
| EKB own site | https://www.ekb.eg | Yes | **No** (direct returned empty content) | — | — | 18 Nov 2026 |
| Industrial Training Council | https://www.itc.gov.eg / https://itc.gov.eg | — | **No** (DNS resolution failed for www.itc.gov.eg) | No official page found that names its operating body | — | 18 Nov 2026 |

## Not readable / blocked
- asu.edu.eg/343/page: the server shows an error page ("Whoops…") and there is no indexed copy.
- moe.gov.eg (all pages): 403 Forbidden from the Azure Application Gateway to the research fetcher. The content above comes only from the search index.
- hesas.eg, stream.moe.gov.eg, eduhub.moe.gov.eg: the connection timed out.
- asrt.sci.eg / www.asrt.sci.eg: timeout or proxy tunnel error. Subdomains are indexed over http only.
- ekb.eg: an empty response.
- itc.gov.eg: DNS does not resolve.
- futurescholars.mohesr.gov.eg, fa-arch.cu.edu.eg, arch.du.edu.eg: proxy tunnel error on direct fetch. These were read via the index only.
- Study in Egypt programme and university details: they load by script, and there is no public API or detailed sitemap.

## Looks usable
- Cairo Univ. Faculty of Archaeology postgraduate tables: an official page with named programmes. It is http only.
- ASU asu.edu.eg/1730/page: an official HTTPS page with 23 named programmes. Re-check it live, because it errored on a direct load.
- Damietta Univ. Faculty of Archaeology: an official HTTPS page naming 3 master's + 3 PhD specialisations.
- Future Scholars home and FAQ: official MoHESR pages that state eligibility and the undergraduate stage.
- SIS ASRT profile: an official government page about ASRT's status.

## Not usable
- Study in Egypt programmes/universities: no readable per-programme data, and the sitemap points to a non-government host.
- SCU home page: no programme list.
- Sohag Faculty of Archaeology: headings only, with no named programmes in the readable text.
- Aswan / Cairo central humanities lists: no archaeology programmes in the readable text.
- Fayoum postgraduate guide: PDF only, which is disallowed.
- arch.asu.edu.eg/ar/page/44: shows placeholder contact data, so its reliability is unclear.
- MoE platform pages: blocked directly, and the indexed text has no target links.
- Hessas, streaming, EduHub, ASRT, EKB, ITC: not readable from here.
