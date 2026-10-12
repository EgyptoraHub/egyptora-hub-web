/**
 * Prompt 36 Stage 3: page texts added by Prompts 31–35 that were missing in the extra languages.
 * Machine-translated draft — NOT reviewed by native speakers. Exported for review with
 * `bun scripts/i18n-export.ts` (every key here is listed as machine_translated).
 * Existing dictionary entries take precedence over these.
 */
import type { Dict } from "./dictionary";

type Row = [ar: string, fr: string, de: string, es: string, it: string, ru: string, zh: string, hi: string];

const ROWS: Record<string, Row> = {
  "Key moments": ["لحظات رئيسية", "Moments clés", "Schlüsselmomente", "Momentos clave", "Momenti chiave", "Ключевые моменты", "关键时刻", "मुख्य क्षण"],
  "Call police 122": ["اتصل بالشرطة 122", "Appeler la police 122", "Polizei anrufen 122", "Llamar a la policía 122", "Chiama la polizia 122", "Вызвать полицию 122", "拨打警察电话 122", "पुलिस को कॉल करें 122"],
  "Call ambulance 123": ["اتصل بالإسعاف 123", "Appeler une ambulance 123", "Krankenwagen rufen 123", "Llamar a una ambulancia 123", "Chiama l'ambulanza 123", "Вызвать скорую 123", "拨打急救电话 123", "एम्बुलेंस को कॉल करें 123"],
  "results": ["نتائج", "résultats", "Ergebnisse", "resultados", "risultati", "результатов", "条结果", "परिणाम"],
  "Linked records": ["السجلات المرتبطة", "Fiches liées", "Verknüpfte Einträge", "Registros vinculados", "Schede collegate", "Связанные записи", "关联记录", "जुड़े हुए रिकॉर्ड"],
  "flag": ["علم", "drapeau", "Flagge", "bandera", "bandiera", "флаг", "旗帜", "ध्वज"],
  "Protected Areas": ["المحميات الطبيعية", "Aires protégées", "Schutzgebiete", "Áreas protegidas", "Aree protette", "Охраняемые территории", "自然保护区", "संरक्षित क्षेत्र"],
  "Egypt's declared protected areas, each with its official source.": ["المحميات الطبيعية المعلنة في مصر، لكل منها مصدرها الرسمي.", "Les aires protégées déclarées d'Égypte, chacune avec sa source officielle.", "Ägyptens ausgewiesene Schutzgebiete, jeweils mit offizieller Quelle.", "Las áreas protegidas declaradas de Egipto, cada una con su fuente oficial.", "Le aree protette dichiarate dell'Egitto, ciascuna con la sua fonte ufficiale.", "Объявленные охраняемые территории Египта, каждая с официальным источником.", "埃及已宣布的自然保护区，均附官方来源。", "मिस्र के घोषित संरक्षित क्षेत्र, प्रत्येक अपने आधिकारिक स्रोत के साथ।"],
  "Declared": ["سنة الإعلان", "Déclarée", "Ausgewiesen", "Declarada", "Dichiarata", "Объявлена", "宣布年份", "घोषित"],
  "Source": ["المصدر", "Source", "Quelle", "Fuente", "Fonte", "Источник", "来源", "स्रोत"],
  "destinations": ["وجهات", "destinations", "Reiseziele", "destinos", "destinazioni", "направлений", "个目的地", "गंतव्य"],
  "Police": ["الشرطة", "Police", "Polizei", "Policía", "Polizia", "Полиция", "警察", "पुलिस"],
  "Ambulance": ["الإسعاف", "Ambulance", "Krankenwagen", "Ambulancia", "Ambulanza", "Скорая помощь", "救护车", "एम्बुलेंस"],
  "opportunities": ["فرص", "opportunités", "Chancen", "oportunidades", "opportunità", "возможностей", "个机会", "अवसर"],
  "sectors": ["قطاعات", "secteurs", "Sektoren", "sectores", "settori", "секторов", "个行业", "क्षेत्र"],
  "Zone type": ["نوع المنطقة", "Type de zone", "Zonentyp", "Tipo de zona", "Tipo di zona", "Тип зоны", "区域类型", "क्षेत्र का प्रकार"],
  "All zone types": ["كل أنواع المناطق", "Tous les types de zones", "Alle Zonentypen", "Todos los tipos de zona", "Tutti i tipi di zona", "Все типы зон", "所有区域类型", "सभी क्षेत्र प्रकार"],
  "No zones match these filters.": ["لا توجد مناطق تطابق هذه الفلاتر.", "Aucune zone ne correspond à ces filtres.", "Keine Zonen entsprechen diesen Filtern.", "Ninguna zona coincide con estos filtros.", "Nessuna zona corrisponde a questi filtri.", "Нет зон, соответствующих этим фильтрам.", "没有符合这些筛选条件的区域。", "इन फ़िल्टरों से कोई क्षेत्र मेल नहीं खाता।"],
  "Listed under": ["مدرجة ضمن", "Classée sous", "Geführt unter", "Incluida en", "Elencata sotto", "Относится к", "隶属于", "के अंतर्गत सूचीबद्ध"],
  "Managing body": ["الجهة المديرة", "Organisme gestionnaire", "Verwaltende Stelle", "Organismo gestor", "Ente gestore", "Управляющий орган", "管理机构", "प्रबंधन निकाय"],
  "Facts": ["حقائق", "Faits", "Fakten", "Datos", "Fatti", "Факты", "事实", "तथ्य"],
  "Public free zone": ["منطقة حرة عامة", "Zone franche publique", "Öffentliche Freizone", "Zona franca pública", "Zona franca pubblica", "Государственная свободная зона", "公共自由区", "सार्वजनिक मुक्त क्षेत्र"],
  "SCZone industrial zone": ["منطقة صناعية بالمنطقة الاقتصادية لقناة السويس", "Zone industrielle SCZone", "SCZone-Industriezone", "Zona industrial SCZone", "Zona industriale SCZone", "Промышленная зона SCZone", "苏伊士运河经济区工业区", "SCZone औद्योगिक क्षेत्र"],
  "Industrial zone": ["منطقة صناعية", "Zone industrielle", "Industriezone", "Zona industrial", "Zona industriale", "Промышленная зона", "工业区", "औद्योगिक क्षेत्र"],
};

const pick = (i: number): Dict => Object.fromEntries(Object.entries(ROWS).map(([k, r]) => [k, r[i]!]));
export const phase36 = { ar: pick(0), fr: pick(1), de: pick(2), es: pick(3), it: pick(4), ru: pick(5), zh: pick(6), hi: pick(7) };
/** Keys machine-translated in Prompt 36 (all languages listed above). */
export const PHASE36_KEYS = Object.keys(ROWS);
