export const FINDINGS = [
  ["primary-caries", "Первичный кариес"], ["secondary-caries", "Вторичный кариес"], ["deep-caries", "Глубокий кариес"],
  ["root-caries", "Кариес корня"], ["crown-destruction", "Разрушение анатомической коронки"], ["residual-root", "Остаточный корень"],
  ["fracture", "Перелом зуба"], ["crack", "Трещина"], ["wear", "Стираемость"], ["filling", "Существующая пломба"],
  ["defective-filling", "Дефектная пломба"], ["artificial-crown", "Искусственная коронка"], ["defective-crown", "Дефектная коронка"],
  ["loose-crown", "Подвижная коронка"], ["crown-with-root", "Коронка подвижна вместе с тканями корня"],
  ["mobility", "Подвижность зуба"], ["recession", "Рецессия десны"], ["pocket", "Пародонтальный карман"],
  ["inflammation", "Воспаление десны"], ["bleeding", "Кровоточивость"], ["bone-loss", "Убыль кости"],
  ["treated-canals", "Ранее леченные каналы"], ["incomplete-rct", "Неполная обтурация каналов"],
  ["periapical", "Периапикальное просветление"], ["fistula", "Свищ"], ["swelling", "Отек"],
  ["impacted", "Ретинированный зуб"], ["partially-impacted", "Частично ретинированный"], ["dystopic", "Дистопия"]
] as const;

export const TREATMENTS = [
  ["filling", "Пломба"], ["filling-replacement", "Замена пломбы"], ["temporary-filling", "Временная пломба"],
  ["observation", "Наблюдение"], ["rct", "Лечение каналов"], ["retreatment", "Перелечивание каналов"],
  ["endo-consult", "Консультация эндодонтиста"], ["core", "מבנה"], ["fiber-core", "Стекловолоконный штифт и מבנה"],
  ["temporary-crown", "Временная коронка"], ["zirconia-crown", "Циркониевая коронка"], ["crown-recement", "Фиксация коронки"],
  ["extraction", "Удаление другим врачом"], ["surgical-extraction", "Хирургическое удаление"], ["implant-consult", "Консультация по имплантации"],
  ["implant-placement", "Установка импланта"], ["hygienist", "Гигиенист"], ["complete-denture", "Полный съемный протез"],
  ["partial-denture", "Частичный съемный протез"], ["immediate-denture", "Иммедиат-протез"], ["denture-adjustment", "Коррекция протеза"]
] as const;

export const SYMPTOMS = ["Холод", "Тепло", "Самопроизвольная боль", "Боль при жевании", "Чувствительность к перкуссии", "Чувствительность к пальпации", "Постоянная боль", "Отек", "Свищ", "Подвижность", "Жалоб нет"];
