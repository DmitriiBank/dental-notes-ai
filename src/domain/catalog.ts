export const FINDINGS = [
  ["percussion-positive", "Перкуссия болезненна"],   ["percussion-negative", "Перкуссия безболезненна"],   ["palpation-positive", "Пальпация болезненна"],   ["palpation-negative", "Пальпация безболезненна"],   ["cold-normal", "Холод: кратковременная реакция"],   ["cold-negative", "Холод: нет реакции"],   ["cold-prolonged", "Холод: длительная реакция"],   ["short-clinical-crown", "Низкая клиническая коронка"],   ["insufficient-ferrule", "Недостаточный феррул"],   ["insufficient-retention", "Недостаточная ретенция для коронки"],   ["insufficient-tooth-structure", "Недостаточный объём тканей коронки"],   ["insufficient-prosthetic-space", "Недостаточное место для реставрации"],   ["deep-subgingival-margin", "Глубокая поддесневая граница"],
  ["primary-caries", "Первичный кариес"], ["secondary-caries", "Вторичный кариес"], ["deep-caries", "Глубокий кариес"],
  ["cervical-caries", "Пришеечный кариес"], ["root-caries", "Кариес корня"], ["crown-destruction", "Разрушение анатомической коронки"], ["subgingival-destruction", "Разрушение ниже десны"], ["residual-root", "Остаточный корень"],
  ["fracture", "Перелом зуба"], ["crack", "Трещина"], ["chip", "Скол"], ["cervical-lesion", "Некариозное пришеечное поражение"], ["wear", "Стираемость"], ["filling", "Существующая пломба"],
  ["defective-filling", "Дефектная пломба"], ["artificial-crown", "Искусственная коронка"], ["defective-crown", "Дефектная коронка"],
  ["fractured-filling", "Сломанная пломба"], ["loose-crown", "Подвижная коронка"], ["crown-with-root", "Коронка подвижна вместе с тканями корня"], ["temporary-crown-existing", "Существующая временная коронка"], ["bridge-abutment", "Опора моста"], ["bridge-pontic", "Промежуточная часть моста"], ["post-core", "Штифтовая культевая вкладка"], ["fiber-post", "Стекловолоконный штифт"],
  ["dental-splint", "Шинирование зубов (קיבוע)"], ["orthodontic-wire", "Ортодонтическая дуга"], ["ortho-brackets", "Ортодонтические брекеты"], ["supraeruption", "Супраэррупция: выдвижение зуба к антагонистам"],
  ["mobility", "Подвижность зуба"], ["no-mobility", "Зуб неподвижен"], ["recession", "Рецессия десны"], ["pocket", "Пародонтальный карман"], ["no-pockets", "Пародонтальные карманы отсутствуют"],
  ["inflammation", "Воспаление десны"], ["bleeding", "Кровоточивость"], ["bone-loss", "Убыль кости"],
  ["furcation", "Вовлечение фуркации"], ["treated-canals", "Ранее леченные каналы"], ["incomplete-rct", "Неполная обтурация каналов"], ["suspected-endo", "Подозрение на эндодонтическую патологию"],
  ["periapical", "Периапикальное просветление"], ["lateral-radiolucency", "Латеральное просветление"], ["furcation-radiolucency", "Просветление в фуркации"], ["fistula", "Свищ"], ["swelling", "Отек"],
  ["impacted", "Ретинированный зуб"], ["partially-impacted", "Частично ретинированный"], ["dystopic", "Дистопия"], ["buccal", "Щечное положение"], ["soft-tissue-trauma", "Травма мягких тканей зубом"]
  ,["intact", "Клинически интактный зуб"], ["short-roots", "Короткие корни"], ["deep-cervical-lesion", "Глубокое пришеечное поражение"], ["poor-prognosis", "Неблагоприятный прогноз (подтвержден врачом)"]
] as const;

export const TREATMENTS = [
  ["filling", "Пломба"], ["filling-replacement", "Замена пломбы"], ["temporary-filling", "Временная пломба"],
  ["observation", "Наблюдение"], ["rct", "Лечение каналов"], ["retreatment", "Перелечивание каналов"],
  ["core", "מבנה"], ["fiber-core", "Стекловолоконный штифт и מבנה"],
  ["temporary-crown", "Временная коронка"], ["zirconia-crown", "Циркониевая коронка"], ["permanent-crown", "Другая постоянная коронка"], ["crown-recement", "Фиксация коронки"], ["crown-removal", "Снятие коронки"],
  ["bridge", "Мост"], ["bridge-replacement", "Замена моста"], ["implant-crown", "Коронка на импланте"], ["implant-core", "מבנה на импланте"], ["implant-bridge", "Мост на имплантах"], ["multi-unit", "Multi-Unit"], ["night-guard", "Жесткая ночная каппа"], ["flipper", "Временный флиппер"],
  ["extraction", "Удаление другим врачом"], ["surgical-extraction", "Хирургическое удаление"],
  ["implant-placement", "Установка импланта"], ["bone-augmentation", "Костная пластика"], ["sinus-lift", "Синус-лифтинг"], ["complete-denture", "Полный съемный протез"],
  ["partial-denture", "Частичный съемный протез"], ["immediate-denture", "Иммедиат-протез"], ["reinforced-denture", "Протез с металлической сеткой"], ["overdenture", "Покрывной протез на имплантах"], ["relining", "Перебазировка"], ["denture-adjustment", "Коррекция протеза"], ["denture-remake", "Переделка протеза"]
] as const;

export const SYMPTOMS = ["Холод", "Тепло", "Самопроизвольная боль", "Боль при жевании", "Чувствительность к перкуссии", "Чувствительность к пальпации", "Постоянная боль", "Отек", "Свищ", "Подвижность", "Жалоб нет"];

export const FINDING_GROUPS = [
  {
    "label": "Норма и статус зуба",
    "ids": [
      "intact",
      "no-mobility",
      "no-pockets"
    ]
  },
  {
    "label": "Диагностические пробы",
    "ids": [
      "percussion-positive",
      "percussion-negative",
      "palpation-positive",
      "palpation-negative",
      "cold-normal",
      "cold-prolonged",
      "cold-negative"
    ]
  },
  {
    "label": "Кариес и дефекты тканей",
    "ids": [
      "primary-caries",
      "secondary-caries",
      "deep-caries",
      "cervical-caries",
      "root-caries",
      "deep-cervical-lesion",
      "cervical-lesion",
      "wear",
      "crown-destruction",
      "subgingival-destruction",
      "residual-root",
      "fracture",
      "crack",
      "chip",
      "short-roots",
      "poor-prognosis"
    ]
  },
  {
    "label": "Пломбы и ортопедические конструкции",
    "ids": [
      "filling",
      "defective-filling",
      "fractured-filling",
      "artificial-crown",
      "defective-crown",
      "loose-crown",
      "crown-with-root",
      "temporary-crown-existing",
      "bridge-abutment",
      "bridge-pontic",
      "post-core",
      "fiber-post",
      "dental-splint",
      "orthodontic-wire",
      "ortho-brackets"
    ]
  },
  {
    "label": "Ортопедическая оценка зуба",
    "ids": [
      "short-clinical-crown",
      "insufficient-ferrule",
      "insufficient-retention",
      "insufficient-tooth-structure",
      "insufficient-prosthetic-space",
      "deep-subgingival-margin"
    ]
  },
  {
    "label": "Пародонт и подвижность",
    "ids": [
      "mobility",
      "recession",
      "pocket",
      "inflammation",
      "bleeding",
      "bone-loss",
      "furcation"
    ]
  },
  {
    "label": "Эндодонтия и периапикальные изменения",
    "ids": [
      "treated-canals",
      "incomplete-rct",
      "suspected-endo",
      "periapical",
      "lateral-radiolucency",
      "furcation-radiolucency",
      "fistula",
      "swelling"
    ]
  },
  {
    "label": "Положение зубов и мягкие ткани",
    "ids": [
      "impacted",
      "partially-impacted",
      "dystopic",
      "buccal",
      "supraeruption",
      "soft-tissue-trauma"
    ]
  }
] as const;
export const findingGroupFor = (id:string):string => FINDING_GROUPS.find(group=>(group.ids as readonly string[]).includes(id))?.label??"Другие находки";

export const OCCLUSION_FINDINGS = [{"id":"deep-bite","ru":"Глубокий прикус","he":"סגר עמוק"},{"id":"open-bite","ru":"Открытый прикус","he":"מנשך פתוח"},{"id":"cross-bite","ru":"Перекрёстный прикус","he":"מנשך צלבי"},{"id":"edge-to-edge","ru":"Прямой прикус","he":"מנשך קצה לקצה"},{"id":"increased-overjet","ru":"Увеличенное горизонтальное перекрытие","he":"מרווח אופקי מוגדל"},{"id":"reduced-vertical-dimension","ru":"Снижение высоты прикуса","he":"ירידה בגובה הסגר"},{"id":"premature-contact","ru":"Преждевременный контакт","he":"מגע סגרי מוקדם"}] as const;
