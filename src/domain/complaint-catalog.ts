import type { ClinicalDraft, ComplaintSelection } from "./types";
import { hebrewList } from "./hebrew-catalog";

export type ComplaintScope = "tooth" | "region" | "general" | "any";
export type ComplaintCategory = "pain" | "sensitivity" | "swelling" | "periodontal" | "restoration" | "trauma" | "function" | "soft-tissue" | "aesthetic" | "general";
export interface ComplaintCatalogItem { id:string; ru:string; he:string; category:ComplaintCategory; scope:ComplaintScope; frequent?:boolean }

const item=(id:string,ru:string,he:string,category:ComplaintCategory,scope:ComplaintScope,frequent=false):ComplaintCatalogItem=>({id,ru,he,category,scope,frequent});

export const COMPLAINT_CATEGORIES:Record<ComplaintCategory,string>={pain:"Боль",sensitivity:"Чувствительность",swelling:"Отек и воспалительные симптомы",periodontal:"Десны и подвижность",restoration:"Пломбы, коронки и протезы",trauma:"Травма и прорезывание",function:"Функция и ВНЧС","soft-tissue":"Слизистая и мягкие ткани",aesthetic:"Эстетика",general:"Общие и профилактические"};

/** Versioned local patient-reported complaint catalog. Exactly 107 entries. */
export const COMPLAINT_CATALOG:readonly ComplaintCatalogItem[]=[
  item("pain.spontaneous","Самопроизвольная боль","כאב ספונטני","pain","tooth",true),
  item("pain.acute","Острая боль","כאב חד","pain","tooth",true),
  item("pain.dull","Тупая боль","כאב עמום","pain","tooth"),
  item("pain.throbbing","Пульсирующая боль","כאב פועם","pain","tooth",true),
  item("pain.sharp","Резкая простреливающая боль","כאב דוקר","pain","tooth"),
  item("pain.constant","Постоянная боль","כאב קבוע","pain","tooth"),
  item("pain.intermittent","Периодическая боль","כאב לסירוגין","pain","tooth"),
  item("pain.night","Ночная боль","כאב לילי","pain","tooth",true),
  item("pain.biting","Боль при накусывании","כאב בנשיכה","pain","tooth",true),
  item("pain.pressure","Боль при давлении","כאב בלחץ","pain","tooth"),
  item("pain.localized","Локализованная зубная боль","כאב ממוקד בשן","pain","tooth"),
  item("pain.radiating","Иррадиирующая боль","כאב מקרין","pain","region"),
  item("pain.after-treatment","Боль после лечения","כאב לאחר טיפול","pain","tooth"),
  item("pain.post-extraction","Боль после удаления","כאב לאחר עקירה","pain","region"),
  item("pain.under-crown","Боль под коронкой","כאב מתחת לכתר","pain","tooth",true),
  item("pain.under-filling","Боль под пломбой","כאב באזור שחזור","pain","tooth"),
  item("pain.implant","Боль в области импланта","כאב באזור שתל","pain","region"),
  item("pain.jaw","Боль в челюсти","כאב בלסת","pain","region"),

  item("sensitivity.cold","Чувствительность к холодному","רגישות לקור","sensitivity","tooth",true),
  item("sensitivity.hot","Чувствительность к горячему","רגישות לחום","sensitivity","tooth",true),
  item("sensitivity.sweet","Чувствительность к сладкому","רגישות למתוק","sensitivity","tooth"),
  item("sensitivity.sour","Чувствительность к кислому","רגישות לחומצי","sensitivity","tooth"),
  item("sensitivity.air","Чувствительность к воздуху","רגישות לאוויר","sensitivity","tooth"),
  item("sensitivity.touch","Чувствительность при касании","רגישות למגע","sensitivity","tooth"),
  item("sensitivity.brushing","Чувствительность при чистке","רגישות בצחצוח","sensitivity","tooth"),
  item("sensitivity.generalized","Общая чувствительность зубов","רגישות כללית בשיניים","sensitivity","general"),
  item("sensitivity.cervical","Чувствительность у шейки зуба","רגישות באזור צוואר השן","sensitivity","tooth"),
  item("sensitivity.after-whitening","Чувствительность после отбеливания","רגישות לאחר הלבנה","sensitivity","general"),

  item("swelling.local","Локальная припухлость","נפיחות מקומית","swelling","region",true),
  item("swelling.face","Отек лица","נפיחות בפנים","swelling","region",true),
  item("swelling.gum","Отек десны","נפיחות בחניכיים","swelling","region"),
  item("swelling.pus","Выделение гноя","הפרשה מוגלתית","swelling","region"),
  item("swelling.fistula","Свищ на десне","פיסטולה בחניכיים","swelling","region"),
  item("swelling.bad-taste","Неприятный вкус из области зуба","טעם לא נעים מאזור השן","swelling","tooth"),
  item("swelling.fever","Температура вместе с зубными симптомами","חום גוף עם תסמינים דנטליים","swelling","general"),
  item("swelling.lymph-node","Болезненность лимфоузлов","רגישות בבלוטות לימפה","swelling","region"),
  item("swelling.recurrent","Повторяющаяся припухлость","נפיחות חוזרת","swelling","region"),
  item("swelling.after-procedure","Отек после процедуры","נפיחות לאחר טיפול","swelling","region"),

  item("periodontal.bleeding","Кровоточивость десен","דימום מהחניכיים","periodontal","general",true),
  item("periodontal.brushing-bleeding","Кровь при чистке зубов","דימום בצחצוח","periodontal","general"),
  item("periodontal.spontaneous-bleeding","Самопроизвольная кровоточивость десен","דימום ספונטני מהחניכיים","periodontal","general"),
  item("periodontal.gum-pain","Боль в десне","כאב בחניכיים","periodontal","region"),
  item("periodontal.recession","Оголение корня / рецессия со слов пациента","חשיפת שורש לפי דיווח המטופל","periodontal","tooth"),
  item("periodontal.mobility","Подвижность зуба","ניידות בשן","periodontal","tooth",true),
  item("periodontal.spacing","Появление промежутков между зубами","הופעת מרווחים בין השיניים","periodontal","region"),
  item("periodontal.food-trap","Застревание пищи","דחיסת מזון","periodontal","tooth",true),
  item("periodontal.bad-breath","Неприятный запах изо рта","ריח רע מהפה","periodontal","general"),
  item("periodontal.gum-itch","Зуд или дискомфорт в деснах","גרד או אי נוחות בחניכיים","periodontal","region"),

  item("restoration.filling-broken","Скол или поломка пломбы","שבר או סדק בשחזור","restoration","tooth",true),
  item("restoration.filling-lost","Выпала пломба","נפילת שחזור","restoration","tooth",true),
  item("restoration.filling-high","Пломба мешает прикусу","שחזור מפריע בסגר","restoration","tooth"),
  item("restoration.filling-rough","Шероховатая пломба","שחזור מחוספס","restoration","tooth"),
  item("restoration.crown-loose","Коронка подвижна","כתר נייד","restoration","tooth",true),
  item("restoration.crown-off","Коронка расфиксировалась","השתחררות כתר","restoration","tooth",true),
  item("restoration.crown-broken","Скол или поломка коронки","שבר או סדק בכתר","restoration","tooth"),
  item("restoration.bridge-loose","Мост подвижен","גשר נייד","restoration","region",true),
  item("restoration.bridge-off","Мост расфиксировался","השתחררות גשר","restoration","region"),
  item("restoration.denture-pain","Боль под съемным протезом","כאב מתחת לתותבת נשלפת","restoration","region",true),
  item("restoration.denture-rubs","Протез натирает","שפשוף מתותבת","restoration","region"),
  item("restoration.denture-loose","Протез плохо держится","תותבת אינה יציבה","restoration","region"),
  item("restoration.denture-broken","Поломка протеза","שבר בתותבת","restoration","region"),
  item("restoration.implant-crown-loose","Подвижность коронки на импланте","ניידות כתר על גבי שתל","restoration","region"),

  item("trauma.tooth-fracture","Сломался зуб","שבר בשן","trauma","tooth",true),
  item("trauma.tooth-crack","Ощущение трещины в зубе","תחושה של סדק בשן","trauma","tooth"),
  item("trauma.hit","Удар в область зубов","חבלה באזור השיניים","trauma","region"),
  item("trauma.displacement","Смещение зуба после травмы","תזוזת שן לאחר חבלה","trauma","tooth"),
  item("trauma.lip-bite","Травма губы или щеки","פגיעה בשפה או בלחי","trauma","region"),
  item("trauma.wisdom-pain","Боль в области зуба мудрости","כאב באזור שן בינה","trauma","tooth",true),
  item("trauma.eruption","Дискомфорт при прорезывании зуба","אי נוחות בבקיעת שן","trauma","tooth"),
  item("trauma.primary-mobile","Подвижный молочный зуб беспокоит","שן נשירה ניידת מפריעה","trauma","tooth"),
  item("trauma.delayed-eruption","Зуб долго не прорезывается","עיכוב בבקיעת שן לפי דיווח המטופל","trauma","region"),
  item("trauma.sharp-edge","Острый край зуба травмирует слизистую","קצה חד של שן פוצע את הרירית","trauma","tooth"),

  item("function.chewing","Трудно жевать","קושי בלעיסה","function","general",true),
  item("function.biting","Неудобно смыкать зубы","אי נוחות בסגירת השיניים","function","general"),
  item("function.opening","Ограничено открывание рта","הגבלה בפתיחת הפה","function","general"),
  item("function.tmj-pain","Боль в ВНЧС","כאב במפרק הלסת","function","region",true),
  item("function.tmj-click","Щелчки в суставе","קליקים במפרק הלסת","function","region"),
  item("function.tmj-lock","Заклинивание челюсти","נעילת לסת","function","general"),
  item("function.muscle-pain","Боль в жевательных мышцах","כאב בשרירי הלעיסה","function","region"),
  item("function.bruxism","Скрежет или сжатие зубов","חריקת שיניים או הידוק לסתות","function","general"),
  item("function.morning-fatigue","Усталость челюстей утром","עייפות בלסתות בבוקר","function","general"),
  item("function.speech","Протез или зубы мешают речи","הפרעה בדיבור הקשורה לשיניים או לתותבת","function","general"),

  item("soft.ulcer","Язва во рту","כיב בפה","soft-tissue","region",true),
  item("soft.burning","Жжение во рту","תחושת צריבה בפה","soft-tissue","general"),
  item("soft.dry-mouth","Сухость во рту","יובש בפה","soft-tissue","general",true),
  item("soft.white-lesion","Белое пятно на слизистой","כתם לבן ברירית","soft-tissue","region"),
  item("soft.red-lesion","Красное пятно на слизистой","כתם אדום ברירית","soft-tissue","region"),
  item("soft.lump","Уплотнение или образование во рту","גוש או נגע בחלל הפה","soft-tissue","region"),
  item("soft.tongue-pain","Боль или дискомфорт языка","כאב או אי נוחות בלשון","soft-tissue","general"),
  item("soft.taste-change","Изменение вкуса","שינוי בחוש הטעם","soft-tissue","general"),

  item("aesthetic.color","Не устраивает цвет зубов","אי שביעות רצון מצבע השיניים","aesthetic","general",true),
  item("aesthetic.stain","Пятно на зубе","כתם בשן","aesthetic","tooth"),
  item("aesthetic.shape","Не устраивает форма зуба","אי שביעות רצון מצורת השן","aesthetic","tooth"),
  item("aesthetic.spacing","Не устраивают промежутки между зубами","אי שביעות רצון ממרווחים בין השיניים","aesthetic","region"),
  item("aesthetic.alignment","Не устраивает положение зубов","אי שביעות רצון ממנח השיניים","aesthetic","region"),
  item("aesthetic.missing-tooth","Эстетически беспокоит отсутствующий зуб","הפרעה אסתטית עקב שן חסרה","aesthetic","tooth"),
  item("aesthetic.old-restoration","Не устраивает вид старой реставрации","אי שביעות רצון ממראה שחזור קיים","aesthetic","tooth"),

  item("none","Жалоб нет","ללא תלונות","general","any",true),
  item("general.checkup","Профилактический осмотр","בקשה לבדיקה תקופתית","general","general",true),
  item("general.cleaning","Желание провести профессиональную гигиену","בקשה לניקוי מקצועי","general","general"),
  item("general.second-opinion","Второе мнение","בקשה לחוות דעת נוספת","general","general"),
  item("general.treatment-plan","Обсуждение плана лечения","בקשה לדיון בתוכנית טיפול","general","general"),
  item("general.radiograph-review","Обсуждение имеющегося снимка","בקשה לעיון בצילום קיים","general","general"),
  item("general.followup","Контроль после лечения","הגעה לביקורת לאחר טיפול","general","general"),
  item("general.suture-removal","Снятие швов","הגעה להסרת תפרים","general","general"),
  item("general.medical-clearance","Консультация перед медицинским лечением","בקשה להערכה דנטלית לפני טיפול רפואי","general","general"),
  item("general.anxiety","Страх или тревога перед стоматологическим лечением","חרדה מטיפול שיניים","general","general"),
] as const;

export const COMPLAINT_REGIONS=["Верхняя челюсть","Нижняя челюсть","Справа","Слева","Передний отдел","Область ВНЧС справа","Область ВНЧС слева","Слизистая полости рта"] as const;
export const REGION_HEBREW:Record<string,string>={"Верхняя челюсть":"הלסת העליונה","Нижняя челюсть":"הלסת התחתונה","Справа":"הצד הימני","Слева":"הצד השמאלי","Передний отдел":"האזור הקדמי","Область ВНЧС справа":"מפרק הלסת הימני","Область ВНЧС слева":"מפרק הלסת השמאלי","Слизистая полости рта":"רירית חלל הפה"};

const onsetHe:Record<NonNullable<ComplaintSelection["onset"]>,string>={today:"החל היום",days:"החל לפני מספר ימים",weeks:"קיים מספר שבועות",months:"קיים מספר חודשים",longstanding:"קיים זמן ממושך"};
const triggerHe:Record<NonNullable<ComplaintSelection["trigger"]>,string>={spontaneous:"מופיע ספונטנית",cold:"מוחמר בקור",hot:"מוחמר בחום",biting:"מוחמר בנשיכה",sweet:"מוחמר במתוק",touch:"מוחמר במגע",night:"מוחמר בלילה"};
const severityHe:Record<NonNullable<ComplaintSelection["severity"]>,string>={mild:"בעוצמה קלה",moderate:"בעוצמה בינונית",severe:"בעוצמה חזקה"};
const details=(selection:ComplaintSelection)=>[selection.onset?onsetHe[selection.onset]:"",selection.trigger?triggerHe[selection.trigger]:"",selection.severity?severityHe[selection.severity]:""].filter(Boolean).join(", ");
const sentence=(value:string)=>`${value.replace(/[.;]+$/u,"")}.`;

export function complaintSentences(draft:ClinicalDraft):string[]{
  const byId=new Map(COMPLAINT_CATALOG.map(entry=>[entry.id,entry]));
  const grouped=new Map<string,{entry:ComplaintCatalogItem;selection:ComplaintSelection;teeth:number[]}>();
  Object.values(draft.teeth).forEach(tooth=>(tooth.complaints??[]).forEach(selection=>{const entry=byId.get(selection.complaintId);if(!entry)return;const key=JSON.stringify([selection.complaintId,selection.onset,selection.trigger,selection.severity]);const group=grouped.get(key)??{entry,selection,teeth:[]};group.teeth.push(tooth.number);grouped.set(key,group)}));
  const result=[...grouped.values()].map(({entry,selection,teeth})=>{const sorted=[...new Set(teeth)].sort((a,b)=>a-b);if(entry.id==="none")return sentence(sorted.length===1?`אין תלונות הקשורות לשן ${sorted[0]}`:`אין תלונות הקשורות לשיניים ${hebrewList(sorted.map(String))}`);const target=sorted.length===1?`בשן ${sorted[0]}`:`בשיניים ${hebrewList(sorted.map(String))}`;return sentence(`המטופל מדווח על ${entry.he} ${target}${details(selection)?`, ${details(selection)}`:""}`)});
  (draft.regionalComplaints??[]).forEach(selection=>{const entry=byId.get(selection.complaintId);if(!entry)return;const region=REGION_HEBREW[selection.region??""]??selection.region??"אזור לא מוגדר";result.push(sentence(entry.id==="none"?`אין תלונות באזור ${region}`:`המטופל מדווח על ${entry.he} באזור ${region}${details(selection)?`, ${details(selection)}`:""}`))});
  (draft.generalComplaints??[]).forEach(selection=>{const entry=byId.get(selection.complaintId);if(!entry)return;result.push(sentence(entry.id==="none"?"המטופל אינו מדווח על תלונות":`המטופל מדווח על ${entry.he}${details(selection)?`, ${details(selection)}`:""}`))});
  return [...new Set(result)];
}
