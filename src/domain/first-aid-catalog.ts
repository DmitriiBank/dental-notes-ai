import type { FirstAidSelection, TemplateVariables } from "./types";

export type TemplateSection = "complaint" | "clinical" | "radiology" | "completed" | "recommendation" | "counseling";
export interface ClinicalPhrase { id: string; ru: string; he: string; section: TemplateSection; requiresConfirmation?: boolean }
export interface FirstAidPreset { id: string; ru: string; complaint: string[]; findings: string[]; performed: string[]; recommendations: string[]; checks: string[] }

export const clinicalPhrases: ClinicalPhrase[] = [
  { id:"complaint.post_extraction_pain", ru:"Боль в области лунки после удаления", he:"המטופל מתלונן על כאב באזור מכתשית העקירה {region}.", section:"complaint" },
  { id:"complaint.bad_taste", ru:"Неприятный вкус / запах после удаления", he:"המטופל מדווח על טעם או ריח לא נעים לאחר העקירה באזור {region}.", section:"complaint" },
  { id:"finding.empty_socket", ru:"В лунке отсутствует кровяной сгусток", he:"במכתשית העקירה באזור {region} לא נצפה קריש דם.", section:"clinical" },
  { id:"finding.exposed_socket_bone", ru:"Обнажена костная поверхность лунки", he:"נצפתה עצם חשופה במכתשית העקירה באזור {region}.", section:"clinical" },
  { id:"finding.socket_tenderness", ru:"Лунка болезненна при пальпации", he:"קיימת רגישות במישוש באזור מכתשית העקירה {region}.", section:"clinical" },
  { id:"finding.alveolitis_confirmed", ru:"Альвеолит подтверждён врачом", he:"אובחנה דלקת מכתשית לאחר עקירה באזור {region}.", section:"clinical", requiresConfirmation:true },
  { id:"done.socket_saline_irrigation", ru:"Осторожное промывание лунки стерильным физиологическим раствором", he:"בוצעה שטיפה עדינה של מכתשית העקירה באזור {region} בתמיסת סליין סטרילית.", section:"completed", requiresConfirmation:true },
  { id:"done.socket_dressing", ru:"В лунку помещена лечебная повязка", he:"הונחה חבישה טיפולית במכתשית העקירה באזור {region}.", section:"completed", requiresConfirmation:true },
  { id:"rec.alveolitis_review", ru:"Рекомендован повторный осмотр лунки", he:"הומלצה ביקורת של מכתשית העקירה בהתאם למהלך הקליני.", section:"recommendation" },
  { id:"rec.analgesic_assessment", ru:"Рекомендовано обезболивание с учётом противопоказаний", he:"הומלץ על טיפול לשיכוך כאב בהתאם למצב הרפואי ולהתוויות הנגד.", section:"recommendation" },
  { id:"complaint.pain", ru:"Боль в области зуба", he:"המטופל מתלונן על כאב באזור שן {tooth}.", section:"complaint" },
  { id:"complaint.mobility", ru:"Подвижность зуба", he:"המטופל מתלונן על ניידות בשן {tooth}.", section:"complaint" },
  { id:"complaint.crown_off", ru:"Расфиксация коронки", he:"המטופל הגיע עקב השתחררות כתר בשן {tooth}.", section:"complaint" },
  { id:"complaint.filling_broken", ru:"Скол старой пломбы", he:"המטופל הגיע עקב שבר בשחזור ישן בשן {tooth}.", section:"complaint" },
  { id:"complaint.denture_pain", ru:"Боль под съемным протезом", he:"המטופל מתלונן על כאב מתחת לתותבת נשלפת.", section:"complaint" },
  { id:"complaint.bridge_loose", ru:"Мост подвижен", he:"המטופל מתלונן על התרופפות גשר באזור {region}.", section:"complaint" },
  { id:"complaint.swelling", ru:"Припухлость", he:"המטופל מתלונן על נפיחות באזור {region}.", section:"complaint" },
  { id:"finding.caries", ru:"Кариес с поверхностями", he:"עששת בשן {tooth} במשטחים {surfaces}.", section:"clinical" },
  { id:"finding.artificial_crown", ru:"Искусственная коронка", he:"שן {tooth} משוקמת באמצעות כתר.", section:"clinical" },
  { id:"finding.crown_mobile_with_root", ru:"Коронка подвижна с частью корня", he:"בשן {tooth} קיימת ניידות של הכתר יחד עם חלק מהשורש.", section:"clinical" },
  { id:"finding.palpation_positive", ru:"Болезненность пальпации", he:"קיימת רגישות במישוש באזור חודי שורשי שן {tooth}.", section:"clinical" },
  { id:"finding.denture_erosion", ru:"Эрозии под протезом", he:"נצפו אזורי ארוזיה ברירית מתחת לתותבת.", section:"clinical" },
  { id:"finding.denture_unstable", ru:"Нестабильный протез", he:"התותבת אינה יציבה.", section:"clinical" },
  { id:"done.tempbond_crown", ru:"Коронка временно фиксирована Temp-Bond", he:"בוצעה הדבקה זמנית של הכתר בשן {tooth} באמצעות Temp-Bond.", section:"completed", requiresConfirmation:true },
  { id:"done.temporary_filling", ru:"Временная пломба", he:"בוצעה סתימה זמנית בשן {tooth}.", section:"completed", requiresConfirmation:true },
  { id:"done.sharp_edge_smoothed", ru:"Сглажен острый край", he:"בוצעו השחזה והחלקה של קצה חד באזור {region}.", section:"completed", requiresConfirmation:true },
  { id:"done.abscess_drainage", ru:"Выполнено дренирование абсцесса", he:"בוצע ניקוז מורסה באזור {region}.", section:"completed", requiresConfirmation:true },
  { id:"done.irrigation", ru:"Промывание", he:"בוצעה שטיפה באזור {region}.", section:"completed", requiresConfirmation:true },
  { id:"rec.status", ru:"Направить на статус", he:"הומלץ על ביצוע צילום סטטוס לצורך השלמת האבחנה.", section:"recommendation" },
  { id:"rec.panorama", ru:"Направить на панорамный снимок", he:"הומלץ על ביצוע צילום פנורמי לצורך השלמת האבחנה.", section:"recommendation" },
  { id:"rec.followup", ru:"Контрольный осмотр", he:"הומלץ על בדיקת מעקב בהתאם לממצאים.", section:"recommendation" },
  { id:"rec.original_clinic_denture", ru:"Обратиться в изготовившую протез клинику", he:"הומלץ לפנות למרפאה שבה הוכנה התותבת לצורך בדיקה והתאמה.", section:"recommendation" },
  { id:"rec.definitive_crown_assessment", ru:"Оценка перед постоянной фиксацией", he:"הומלץ על בדיקה והערכת מצב השן והכתר לצורך החלטה על המשך הטיפול.", section:"recommendation" },
  { id:"counsel.temporary_cement", ru:"Объяснено, что фиксация временная", he:"הוסבר למטופל כי מדובר בהדבקה זמנית בלבד.", section:"counseling", requiresConfirmation:true },
];

export const firstAidPresets: FirstAidPreset[] = [
  {id:"er.alveolitis",ru:"Альвеолит после удаления",complaint:["complaint.post_extraction_pain","complaint.bad_taste"],findings:["finding.empty_socket","finding.exposed_socket_bone","finding.socket_tenderness","finding.alveolitis_confirmed"],performed:["done.socket_saline_irrigation","done.socket_dressing"],recommendations:["rec.alveolitis_review","rec.analgesic_assessment"],checks:["Уточнить дату удаления, участок и характер боли","Оценить кровяной сгусток, обнажение кости, отёк и выделения","Исключить признаки инфекции и другие причины боли","Подтвердить фактически выполненные обработку и повязку","Лекарства указать только если действительно рекомендованы или назначены"]},
  {id:"er.crown_decemented",ru:"Расфиксация коронки",complaint:["complaint.crown_off"],findings:["finding.artificial_crown"],performed:["done.tempbond_crown"],recommendations:["counsel.temporary_cement","rec.definitive_crown_assessment"],checks:["Номер зуба","Оценена посадка коронки?","Temp-Bond действительно использован?","Есть кариес, перелом или подвижность?"]},
  {id:"er.bridge_loose",ru:"Подвижность / расфиксация моста",complaint:["complaint.bridge_loose"],findings:[],performed:[],recommendations:["rec.definitive_crown_assessment"],checks:["Единицы моста и опоры","Что действительно выполнено?","Есть острые края?","Нужен снимок?"]},
  {id:"er.filling_broken",ru:"Скол пломбы / открытая полость",complaint:["complaint.filling_broken"],findings:[],performed:["done.temporary_filling"],recommendations:["rec.status","rec.definitive_crown_assessment"],checks:["Зуб и поверхности","Временная пломба действительно поставлена?","Есть подозрение на вовлечение пульпы?"]},
  {id:"er.pain_caries",ru:"Острая боль из-за кариеса",complaint:["complaint.pain"],findings:["finding.caries"],performed:[],recommendations:["rec.status","rec.followup"],checks:["Температурная реакция","Перкуссия и пальпация","Статус снимка","Эндодонтическое направление по показаниям"]},
  {id:"er.pain_under_crown",ru:"Боль под коронкой",complaint:["complaint.pain"],findings:["finding.artificial_crown","finding.palpation_positive"],performed:[],recommendations:["rec.status"],checks:["Симптомы подтверждены","Снимок просмотрен или только рекомендован?","Нужна эндодонтическая оценка?"]},
  {id:"er.abscess",ru:"Абсцесс / припухлость",complaint:["complaint.swelling"],findings:[],performed:["done.abscess_drainage","done.irrigation"],recommendations:["rec.followup"],checks:["Дренирование — только если выполнено","Анамнез и системные симптомы","Красные флаги","Лекарства — только если назначены"]},
  {id:"er.sharp_edge",ru:"Острый край и травма слизистой",complaint:[],findings:[],performed:["done.sharp_edge_smoothed"],recommendations:["rec.followup"],checks:["Локализация","Травма слизистой?","Процедура действительно выполнена?"]},
  {id:"er.denture_sore",ru:"Боль и эрозии под протезом",complaint:["complaint.denture_pain"],findings:["finding.denture_erosion"],performed:[],recommendations:["rec.original_clinic_denture"],checks:["Тип и локализация протеза","Коррекция действительно выполнена?","Нужно направление?"]},
  {id:"er.denture_broken",ru:"Поломка протеза или кламмера",complaint:[],findings:["finding.denture_unstable"],performed:[],recommendations:["rec.followup"],checks:["Верх / низ","Место поломки","Ремонт или переделка","Лабораторный заказ"]},
  {id:"er.tooth_mobility",ru:"Подвижность зуба / коронки с корнем",complaint:["complaint.mobility"],findings:["finding.crown_mobile_with_root"],performed:[],recommendations:["rec.status","rec.followup"],checks:["Степень и локализация подвижности","Восстановимость","Удаление только по клиническим показаниям"]},
  {id:"er.trauma",ru:"Травма зуба и мягких тканей",complaint:[],findings:[],performed:[],recommendations:["rec.followup"],checks:["Время и механизм травмы","Смещение / перелом","Кровотечение и мягкие ткани","Срочное направление при необходимости"]},
  {id:"er.wisdom_tooth",ru:"Зуб мудрости, боль и травма слизистой",complaint:["complaint.pain"],findings:[],performed:[],recommendations:["rec.panorama"],checks:["Положение и прорезывание","Травма мягких тканей","Интерпретация снимка","Направление на удаление по показаниям"]},
];

const phraseMap = new Map(clinicalPhrases.map(item => [item.id, item]));
export const getClinicalPhrase = (id: string) => phraseMap.get(id);
export const requiredVariables = (id: string) => [...(getClinicalPhrase(id)?.he.matchAll(/\{([a-z]+)\}/gu) ?? [])].map(match => match[1] as keyof TemplateVariables);

export function renderClinicalPhrase(selection: FirstAidSelection): string | null {
  const item = getClinicalPhrase(selection.phraseId);
  if (!item || (item.requiresConfirmation && !selection.confirmed)) return null;
  let output = item.he;
  for (const variable of requiredVariables(item.id)) {
    const value = selection.vars[variable];
    if (value === undefined || value === null || (Array.isArray(value) && !value.length)) return null;
    output = output.replaceAll(`{${variable}}`, Array.isArray(value) ? value.join(",") : String(value));
  }
  return output.replace(/[“”]/gu, '"');
}

export function groupFirstAidSelections(selections: FirstAidSelection[]): Map<TemplateSection, string[]> {
  const grouped = new Map<TemplateSection, string[]>();
  selections.forEach(selection => {
    const item = getClinicalPhrase(selection.phraseId);
    const rendered = renderClinicalPhrase(selection);
    if (!item || !rendered) return;
    grouped.set(item.section, [...new Set([...(grouped.get(item.section) ?? []), rendered])]);
  });
  return grouped;
}
