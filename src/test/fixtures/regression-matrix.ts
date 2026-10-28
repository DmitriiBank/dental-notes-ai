export type RegressionDomain="exam"|"fillings"|"prosthetics"|"emergency"|"quality"|"codes";
export type PendingCategory="missing-application-functionality"|"missing-test-implementation"|"missing-fixture"|"unresolved-clinical-rules";
export interface RegressionFixture { id:string; domain:RegressionDomain; scenario:string; synthetic:true; invariants:string[]; status:"automated"|"pending"; testRef?:string; pendingReason?:string; pendingCategory?:PendingCategory }

const COMMON=["structured-fdi","section-separation","single-paragraph-plan","deterministic-appointments","no-invented-consent"];
type BaseFixture=Omit<RegressionFixture,"status"|"testRef"|"pendingReason"|"pendingCategory">;
const parse=(domain:RegressionDomain,source:string):BaseFixture[]=>source.trim().split("\n").map(line=>{const [id,scenario,...invariants]=line.split("|");return{id,domain,scenario,synthetic:true,invariants:[...COMMON,...invariants]}});

const BASE_FIXTURES:BaseFixture[]=[
...parse("exam",`
EX01|Осмотр без жалоб и патологии|confirmed-normal-only
EX02|Кариес 26 O, 27 O, 38 O; рекомендован статус|imaging-recommended-not-reviewed
EX03|16 OM, 18 и 28 буккальная дистопия и кариес|position-separate-from-caries
EX04|37 разрушен, 12 и 11 кариес, 45 O|destruction-not-caries
EX05|Генерализованная рецессия и воспаление нижнего фронта|periodontal-referral
EX06|Беременность четыре месяца, чувствительность, рецессия|explicit-medical-flag
EX07|Отказ от панорамного снимка по стоимости|imaging-refused
EX08|Просмотренный статус и сглаженный костный гребень|radiology-not-clinical
EX09|Холод, горячее, накусывание и перкуссия|subjective-objective-separation
EX10|CT сначала рекомендован, затем получен|imaging-state-transition
`),
...parse("fillings",`
FL01|Одна пломба 47 BOD|appointment-30
FL02|Две соседние пломбы 11 и 12|appointment-45
FL03|Три соседние пломбы 11, 12, 13|appointment-60
FL04|Четыре обычные пломбы на одной стороне|max-three-standard
FL05|Четыре B пломбы на разных сторонах|duration-unconfirmed
FL06|Две несоседние пломбы|duration-unconfirmed
FL07|Пломба на две, три, четыре поверхности|code-by-surfaces
FL08|Глубокий кариес 26 MO|conditional-endo-only
FL09|Кариес 11 PM, 12 MPD, 13 PD|independent-surfaces
FL10|Буккальные реставрации верхней и нижней челюсти|buccal-not-palatal-lingual
`),
...parse("prosthetics",`
PR01|15 искусственная коронка подвижна с частью корня|crown-vs-root-caries
PR02|Слепки для флипера 15 A3 выполнены|completed-not-rescheduled
PR03|Немедленный флипер 15 до удаления|impressions-before-extraction
PR04|11 коронка выпала, обломок культи, фиксация Fuji|material-confirmed
PR05|12 расфиксация коронки, Temp-Bond|temporary-not-permanent
PR06|Новый циркониевый мост 15–17, временный сохранен|bridge-units
PR07|Подвижный мост 15–23 с болезненностью|no-mobility-propagation
PR08|Полная адентия обеих челюстей и атрофия|implants-preserved
PR09|Полная адентия, протез с металлической сеткой|mesh-separate-code
PR10|Отказ от имплантов, выбор съемных протезов|alternative-choice
PR11|Верхний протез на имплантах другой клиники, эрозии|no-invented-implant-failure
PR12|Подвижный флипер 23 без вестибулярной пластинки|specific-lab-defect
PR13|Коррекция и перебазировка нижнего частичного протеза|prosthetic-stage-separation
PR14|Съемный протез, пять приемов|denture-sequence
PR15|Сложная работа на мультиюнитах|implant-component-separation
PR16|Мост с двумя промежуточными частями|construction-review
PR17|45 отсутствует, консультация имплантолога и CT|external-work-not-scheduled
PR18|Будущие импланты 32, 42 и протез после интеграции|conditional-timing
PR19|Эндо, מבנה и коронка|endo-before-core
PR20|Верхняя жесткая ночная каппа|unverified-code
`),
...parse("emergency",`
ER01|Острая боль 47, разрушение, временная пломба|performed-temporary-filling
ER02|Боль 27–28, карман, подвижность, холод|no-automatic-pulpitis
ER03|12 коронка выпала, Temp-Bond|confirmed-performed-action
ER04|11 коронка с переломом מבנה, Fuji|confirmed-material
ER05|Абсцесс 32–33, дренирование и промывание|no-invented-antibiotic
ER06|28 дистопирован и травмирует слизистую|panorama-referral
ER07|Отлом старой пломбы 47|defective-restoration-not-primary-caries
ER08|Острый край травмирует язык или щеку|smoothing-not-filling
ER09|Полный протез вызывает эрозии и боль|no-invented-infection
ER10|Только осмотр и рецепт|emergency-diagnostic-code
ER11|Частично ретинированный восьмой зуб и боль|external-surgery
ER12|Отказ от предложенной экстренной помощи|specific-refusal
`),
...parse("quality",`
QA01|Онкотерапия Letrozole и отсутствующие зубы|no-bisphosphonate-assumption
QA02|Остеопороз, препараты неизвестны|medication-clarification
QA03|Разрушение ниже десны|restorability-alternatives
QA04|Периапикальное разрежение 36, выбран контроль|no-automatic-extraction
QA05|Повторное эндо 16 против удаления|two-options-decision
QA06|Неверно заказанная коронка при существующем мосте|tooth-abutment-lab-code-check
QA07|Примерка металла и окклюзионная регистрация|mentor-checklist-unconfirmed
QA08|Нормы общего осмотра по умолчанию|draft-normal-values
QA09|Типографские кавычки|ascii-quotes
QA10|Отказ от удаления, желание пломб|no-invented-extraction-consent
QA11|Несовпадение зуба в находках и лечении|blocking-tooth-mismatch
QA12|Нет идентификаторов, Gmail draft|no-auto-email
QA13|Адентия при существующих естественных зубах|confirm-reversible-preserve-implants
QA14|Два варианта, решение не принято|pending-no-treatment
`),
...parse("codes",`
CD01|Жевательная реставрация 1, 2, 3 поверхности|verified-posterior-codes
CD02|Фронтальные реставрации 11–13|no-posterior-code
CD03|Акриловый флипер до двух зубов|code-13440
CD04|Valplast флипер до двух зубов|code-10104
CD05|Металлическая сетка|code-13425
CD06|Циркониевая коронка|zirconia-clarification
CD07|Мультиюнит|code-10194-review
CD08|Fiber post core|code-10186
CD09|Экстренная помощь|emergency-code-conditions
CD10|Удаление, эндо, имплантация|external-provider-role
CD11|Пустая привязка кода|unverified-not-guessed
CD12|Возрастная или договорная категория|no-unverified-suffix
CD13|Дублирующиеся назначения|deduplicate-codes
CD14|Рекомендовано, выполнено, отказ|procedure-status
CD15|Версия и актуальность прайса|source-version-warning
`),
];

const AUTOMATED:Record<string,string>={
  EX01:"clinical-rules.test.ts",EX02:"regression-clinical-scenarios.test.ts",EX03:"regression-clinical-scenarios.test.ts",EX04:"regression-clinical-scenarios.test.ts",EX05:"regression-clinical-scenarios.test.ts",EX06:"regression-clinical-scenarios.test.ts",EX07:"regression-clinical-scenarios.test.ts",EX08:"regression-clinical-scenarios.test.ts",EX09:"hebrew-templates.test.ts",EX10:"hebrew-templates.test.ts",
  FL01:"regression-clinical-scenarios.test.ts",FL02:"regression-clinical-scenarios.test.ts",FL03:"appointment-rules.test.ts",FL04:"regression-clinical-scenarios.test.ts",FL05:"regression-clinical-scenarios.test.ts",FL06:"appointment-rules.test.ts",FL07:"regression-clinical-scenarios.test.ts",FL08:"clinical-rules.test.ts",FL09:"regression-clinical-scenarios.test.ts",FL10:"regression-clinical-scenarios.test.ts",
  PR01:"regression-clinical-scenarios.test.ts",PR02:"appointment-rules.test.ts",PR03:"structured-domain.test.ts",PR04:"regression-clinical-scenarios.test.ts",PR05:"first-aid-catalog.test.ts",PR06:"structured-domain.test.ts",PR07:"structured-domain.test.ts",PR08:"appointment-rules.test.ts",PR09:"regression-clinical-scenarios.test.ts",PR10:"regression-clinical-scenarios.test.ts",PR11:"appointment-rules.test.ts",PR12:"structured-domain.test.ts",PR13:"regression-clinical-scenarios.test.ts",PR14:"appointment-rules.test.ts",PR15:"regression-clinical-scenarios.test.ts",PR16:"structured-domain.test.ts",PR17:"appointment-rules.test.ts",PR18:"structured-domain.test.ts",PR19:"clinical-rules.test.ts",PR20:"maccabi-codes.test.ts",
  ER01:"regression-clinical-scenarios.test.ts",ER02:"regression-clinical-scenarios.test.ts",ER03:"first-aid-catalog.test.ts",ER04:"regression-clinical-scenarios.test.ts",ER05:"first-aid-catalog.test.ts",ER06:"regression-clinical-scenarios.test.ts",ER07:"regression-clinical-scenarios.test.ts",ER08:"regression-clinical-scenarios.test.ts",ER09:"regression-clinical-scenarios.test.ts",ER10:"maccabi-codes.test.ts",ER11:"regression-clinical-scenarios.test.ts",ER12:"structured-domain.test.ts",
  QA01:"regression-clinical-scenarios.test.ts",QA02:"structured-domain.test.ts",QA03:"regression-clinical-scenarios.test.ts",QA04:"hebrew-templates.test.ts",QA05:"regression-clinical-scenarios.test.ts",QA06:"structured-domain.test.ts",QA07:"structured-domain.test.ts",QA08:"clinical-rules.test.ts",QA09:"hebrew-templates.test.ts",QA10:"regression-clinical-scenarios.test.ts",QA11:"clinical-rules.test.ts",QA12:"regression-clinical-scenarios.test.ts",QA13:"regression-clinical-scenarios.test.ts",QA14:"hebrew-templates.test.ts",
  CD01:"maccabi-codes.test.ts",CD02:"maccabi-codes.test.ts",CD03:"maccabi-codes.test.ts",CD04:"maccabi-codes.test.ts",CD05:"maccabi-codes.test.ts",CD06:"maccabi-codes.test.ts",CD07:"maccabi-codes.test.ts",CD08:"maccabi-codes.test.ts",CD09:"maccabi-codes.test.ts",CD10:"maccabi-codes.test.ts",CD11:"maccabi-codes.test.ts",CD12:"structured-domain.test.ts",CD13:"maccabi-codes.test.ts",CD14:"maccabi-codes.test.ts",CD15:"maccabi-codes.test.ts",
};

const PENDING:Record<string,{category:PendingCategory;reason:string}>={};

export const REGRESSION_FIXTURES:RegressionFixture[]=BASE_FIXTURES.map(fixture=>AUTOMATED[fixture.id]
  ?{...fixture,status:"automated",testRef:AUTOMATED[fixture.id]}
  :{...fixture,status:"pending",pendingCategory:PENDING[fixture.id]?.category??"missing-test-implementation",pendingReason:PENDING[fixture.id]?.reason??"Нет полного семантического теста; наличие ID не считается прохождением."});
