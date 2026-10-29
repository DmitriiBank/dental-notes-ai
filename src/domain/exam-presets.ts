export const EXAM_PRESETS = {
 extraoral: [
  {id:"normal",ru:"Без особенностей",he:'במ"פ.'},
  {id:"facial-asymmetry",ru:"Асимметрия лица",he:"אסימטריה של הפנים"},
  {id:"facial-swelling",ru:"Отёк лица",he:"נפיחות בפנים"},
  {id:"muscle-tenderness",ru:"Болезненность жевательных мышц",he:"רגישות במישוש שרירי הלעיסה"},
  {id:"tmj-tenderness",ru:"Болезненность ВНЧС",he:"רגישות במפרק הלסת"},
  {id:"tmj-clicking",ru:"Щелчки ВНЧС",he:"קליקים במפרק הלסת"},
  {id:"limited-opening",ru:"Ограниченное открывание рта",he:"הגבלה בפתיחת הפה"}
 ],
 softTissues: [
  {id:"normal",ru:"Без особенностей",he:'במ"פ.'},
  {id:"erythema",ru:"Гиперемия слизистой",he:"אודם ברירית"},
  {id:"erosion",ru:"Эрозия слизистой",he:"ארוזיה ברירית"},
  {id:"ulcer",ru:"Язва слизистой",he:"כיב ברירית"},
  {id:"hyperplasia",ru:"Гиперплазия мягких тканей",he:"היפרפלזיה של רקמה רכה"},
  {id:"denture-trauma",ru:"Травматизация протезом",he:"פגיעה ברירית עקב תותבת"},
  {id:"mucosal-swelling",ru:"Отёк слизистой",he:"נפיחות ברירית"}
 ],
 occlusion: [
  {id:"normal",ru:"Нормальный прикус",he:"תקין."},
  {id:"deep-bite",ru:"Глубокий прикус",he:"סגר עמוק"},
  {id:"open-bite",ru:"Открытый прикус",he:"מנשך פתוח"},
  {id:"cross-bite",ru:"Перекрёстный прикус",he:"מנשך צלבי"},
  {id:"edge-to-edge",ru:"Прямой прикус",he:"מנשך קצה לקצה"},
  {id:"increased-overjet",ru:"Увеличенный overjet",he:"מרווח אופקי מוגדל"},
  {id:"reduced-vertical-dimension",ru:"Снижение высоты прикуса",he:"ירידה בגובה הסגר"}
 ],
 hygiene: [
  {id:"good",ru:"Хорошая гигиена",he:"טובה."},
  {id:"fair",ru:"Удовлетворительная гигиена",he:"בינונית."},
  {id:"poor",ru:"Неудовлетворительная гигиена",he:"לקויה."},
  {id:"plaque",ru:"Зубной налёт",he:"רובד חיידקי"},
  {id:"calculus",ru:"Зубной камень",he:"אבנית"},
  {id:"heavy-plaque",ru:"Выраженный зубной налёт",he:"רובד חיידקי בכמות רבה"}
 ],
 periodontal: [
  {id:"normal",ru:"Без патологических карманов",he:"ללא כיסים חריגים."},
  {id:"gingivitis",ru:"Воспаление десны",he:"דלקת חניכיים"},
  {id:"bleeding",ru:"Кровоточивость десны",he:"דימום מהחניכיים"},
  {id:"recession",ru:"Рецессия десны",he:"נסיגת חניכיים"},
  {id:"pockets",ru:"Патологические карманы",he:"כיסים פריודונטליים פתולוגיים"},
  {id:"generalized-recession",ru:"Генерализованная рецессия",he:"נסיגת חניכיים כללית"}
 ]
} as const;
export type ExamPresetField = keyof typeof EXAM_PRESETS;
export const DENTURE_FINDINGS = [
 {id:"serviceable",ru:"Протез состоятельный",he:"התותבת תקינה"},
 {id:"unsatisfactory",ru:"Протез несостоятельный",he:"התותבת אינה תקינה"},
 {id:"broken-clasp",ru:"Отлом кламмера",he:"שבר בוו התותבת"},
 {id:"base-crack",ru:"Трещина базиса",he:"סדק בבסיס התותבת"},
 {id:"base-fracture",ru:"Перелом базиса",he:"שבר בבסיס התותבת"},
 {id:"artificial-tooth-fracture",ru:"Сломан искусственный зуб",he:"שבר בשן מלאכותית בתותבת"},
 {id:"poor-retention",ru:"Недостаточная ретенция",he:"אחיזה לקויה של התותבת"},
 {id:"poor-stability",ru:"Недостаточная стабильность",he:"יציבות לקויה של התותבת"},
 {id:"mucosal-trauma",ru:"Травмирует слизистую",he:"התותבת גורמת לפגיעה ברירית"},
 {id:"poor-fit",ru:"Неудовлетворительное прилегание",he:"התאמה לקויה של התותבת"},
 {id:"worn-teeth",ru:"Стираемость искусственных зубов",he:"שחיקה של השיניים המלאכותיות"},
 {id:"missing-tooth",ru:"Отсутствует искусственный зуб",he:"חסרה שן מלאכותית בתותבת"}
] as const;
export const dentureHasDefect=(findings:readonly string[])=>findings.some(id=>id!=="serviceable");
