export interface RadiographicFindingOption {
  id: string;
  ru: string;
  group: "periapical" | "endodontic" | "restorative" | "periodontal" | "implant" | "sinus" | "other";
}

export const RADIOGRAPHIC_FINDINGS: RadiographicFindingOption[] = [
  { id:"periapical-normal", ru:"Без изменений в периапикальных тканях", group:"periapical" },
  { id:"periapical", ru:"Периапикальное просветление", group:"periapical" },
  { id:"widened-pdl", ru:"Расширение периодонтальной щели", group:"periapical" },
  { id:"lamina-dura-loss", ru:"Нарушение целостности lamina dura", group:"periapical" },
  { id:"lateral-radiolucency", ru:"Латеральное просветление корня", group:"periapical" },
  { id:"furcation-radiolucency", ru:"Просветление в области фуркации", group:"periapical" },
  { id:"apical-root-resorption", ru:"Апикальная резорбция корня", group:"periapical" },
  { id:"root-fracture-suspected", ru:"Подозрение на перелом корня по снимку", group:"other" },
  { id:"root-fracture-observed", ru:"Рентгенологические признаки перелома корня", group:"other" },
  { id:"no-radiographic-pathology-seen", ru:"На просмотренном снимке патологии не выявлено", group:"other" },
  { id:"treated-canals", ru:"Ранее леченные каналы", group:"endodontic" },
  { id:"root-filling-adequate", ru:"Каналы запломбированы удовлетворительно по длине и плотности", group:"endodontic" },
  { id:"root-filling-poor-density", ru:"Неоднородная обтурация каналов / недостаточная плотность пломбирования", group:"endodontic" },
  { id:"root-filling-voids", ru:"Пустоты в пломбировочном материале каналов", group:"endodontic" },
  { id:"root-filling-short-apex", ru:"Пломбирование каналов не доходит до верхушки корня", group:"endodontic" },
  { id:"root-filling-extruded", ru:"Выведение пломбировочного материала за верхушку корня", group:"endodontic" },
  { id:"incomplete-rct", ru:"Неполное пломбирование каналов", group:"endodontic" },
  { id:"underfilled-canals", ru:"Пломбирование каналов короче апекса", group:"endodontic" },
  { id:"overfilled-canals", ru:"Выведение материала за апекс", group:"endodontic" },
  { id:"separated-instrument", ru:"Фрагмент инструмента в канале", group:"endodontic" },
  { id:"post-core", ru:"Внутрикорневой штифт или культевая вкладка", group:"endodontic" },
  { id:"deep-caries", ru:"Глубокий кариес", group:"restorative" },
  { id:"root-caries", ru:"Кариес корня", group:"restorative" },
  { id:"secondary-caries", ru:"Вторичный кариес", group:"restorative" },
  { id:"defective-restoration-margin", ru:"Нарушение краевого прилегания реставрации", group:"restorative" },
  { id:"bone-loss", ru:"Убыль кости", group:"periodontal" },
  { id:"horizontal-bone-loss", ru:"Горизонтальная убыль кости", group:"periodontal" },
  { id:"vertical-bone-loss", ru:"Вертикальная убыль кости", group:"periodontal" },
  { id:"furcation", ru:"Вовлечение фуркации", group:"periodontal" },
  { id:"implant-existing", ru:"Существующий имплант", group:"implant" },
  { id:"peri-implant-bone-loss", ru:"Убыль кости вокруг импланта", group:"implant" },
  { id:"impacted", ru:"Ретинированный зуб", group:"other" },
  { id:"partially-impacted", ru:"Частично ретинированный зуб", group:"other" },
  { id:"residual-root", ru:"Остаточный корень", group:"other" },
  { id:"sinus-mucosal-thickening", ru:"Утолщение слизистой верхнечелюстной пазухи", group:"sinus" },
  { id:"sinus-floor-opacity", ru:"Затемнение дна верхнечелюстной пазухи в проекции верхушек корней", group:"sinus" },
  { id:"sinus-opacity", ru:"Затемнение верхнечелюстной пазухи", group:"sinus" },
  { id:"sinus-cyst-like-dome", ru:"Куполообразное затемнение в пазухе (без указания диагноза)", group:"sinus" },
  { id:"sinus-normal-visible", ru:"Без особенностей в видимой части верхнечелюстной пазухи", group:"sinus" },
] as const;

export const PERIAPICAL_NORMAL_FINDING = "periapical-normal";
// Only findings explicitly describing abnormal periapical tissues contradict a normal periapical assessment.
// Root resorption, lateral/furcation defects and endodontic filling quality are independently documentable.
export const PERIAPICAL_PATHOLOGY_FINDINGS = new Set([
  "periapical",
  "widened-pdl",
  "lamina-dura-loss",
]);

export const RADIOGRAPHIC_GROUP_LABELS: Record<RadiographicFindingOption["group"], string> = {
  periapical:"Периапикальные ткани",
  endodontic:"Эндодонтия",
  restorative:"Кариес и реставрации",
  periodontal:"Пародонт",
  implant:"Импланты",
  sinus:"Верхнечелюстная пазуха",
  other:"Другие находки",
};
