export const FINDINGS = [
  ["primary-caries", "Первичный кариес"], ["secondary-caries", "Вторичный кариес"], ["deep-caries", "Глубокий кариес"],
  ["cervical-caries", "Пришеечный кариес"], ["root-caries", "Кариес корня"], ["crown-destruction", "Разрушение анатомической коронки"], ["subgingival-destruction", "Разрушение ниже десны"], ["residual-root", "Остаточный корень"],
  ["fracture", "Перелом зуба"], ["crack", "Трещина"], ["chip", "Скол"], ["cervical-lesion", "Некариозное пришеечное поражение"], ["wear", "Стираемость"], ["filling", "Существующая пломба"],
  ["defective-filling", "Дефектная пломба"], ["artificial-crown", "Искусственная коронка"], ["defective-crown", "Дефектная коронка"],
  ["fractured-filling", "Сломанная пломба"], ["loose-crown", "Подвижная коронка"], ["crown-with-root", "Коронка подвижна вместе с тканями корня"], ["temporary-crown-existing", "Существующая временная коронка"], ["bridge-abutment", "Опора моста"], ["bridge-pontic", "Промежуточная часть моста"], ["post-core", "Штифтовая культевая вкладка"], ["fiber-post", "Стекловолоконный штифт"],
  ["mobility", "Подвижность зуба"], ["recession", "Рецессия десны"], ["pocket", "Пародонтальный карман"],
  ["inflammation", "Воспаление десны"], ["bleeding", "Кровоточивость"], ["bone-loss", "Убыль кости"],
  ["furcation", "Вовлечение фуркации"], ["treated-canals", "Ранее леченные каналы"], ["incomplete-rct", "Неполная обтурация каналов"], ["suspected-endo", "Подозрение на эндодонтическую патологию"],
  ["periapical", "Периапикальное просветление"], ["lateral-radiolucency", "Латеральное просветление"], ["furcation-radiolucency", "Просветление в фуркации"], ["fistula", "Свищ"], ["swelling", "Отек"],
  ["impacted", "Ретинированный зуб"], ["partially-impacted", "Частично ретинированный"], ["dystopic", "Дистопия"], ["buccal", "Щечное положение"], ["soft-tissue-trauma", "Травма мягких тканей зубом"]
] as const;

export const TREATMENTS = [
  ["filling", "Пломба"], ["filling-replacement", "Замена пломбы"], ["temporary-filling", "Временная пломба"],
  ["observation", "Наблюдение"], ["rct", "Лечение каналов"], ["retreatment", "Перелечивание каналов"],
  ["endo-consult", "Консультация эндодонтиста"], ["core", "מבנה"], ["fiber-core", "Стекловолоконный штифт и מבנה"],
  ["temporary-crown", "Временная коронка"], ["zirconia-crown", "Циркониевая коронка"], ["permanent-crown", "Другая постоянная коронка"], ["crown-recement", "Фиксация коронки"], ["crown-removal", "Снятие коронки"],
  ["bridge", "Мост"], ["bridge-replacement", "Замена моста"], ["implant-crown", "Коронка на импланте"], ["implant-bridge", "Мост на имплантах"], ["flipper", "Временный флиппер"],
  ["extraction", "Удаление другим врачом"], ["surgical-extraction", "Хирургическое удаление"], ["implant-consult", "Консультация по имплантации"],
  ["implant-placement", "Установка импланта"], ["bone-augmentation", "Костная пластика"], ["sinus-lift", "Синус-лифтинг"], ["periodontal-consult", "Консультация пародонтолога"], ["hygienist", "Гигиенист"], ["complete-denture", "Полный съемный протез"],
  ["partial-denture", "Частичный съемный протез"], ["immediate-denture", "Иммедиат-протез"], ["reinforced-denture", "Протез с металлической сеткой"], ["overdenture", "Покрывной протез на имплантах"], ["relining", "Перебазировка"], ["denture-adjustment", "Коррекция протеза"], ["denture-remake", "Переделка протеза"]
] as const;

export const SYMPTOMS = ["Холод", "Тепло", "Самопроизвольная боль", "Боль при жевании", "Чувствительность к перкуссии", "Чувствительность к пальпации", "Постоянная боль", "Отек", "Свищ", "Подвижность", "Жалоб нет"];
