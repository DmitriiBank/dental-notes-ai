export interface RadiographicFindingOption {
  id: string;
  ru: string;
  group: "periapical" | "endodontic" | "restorative" | "periodontal" | "implant" | "other";
}

export const RADIOGRAPHIC_FINDINGS: RadiographicFindingOption[] = [
  { id:"periapical-normal", ru:"Без изменений в периапикальных тканях", group:"periapical" },
  { id:"periapical", ru:"Периапикальное просветление", group:"periapical" },
  { id:"widened-pdl", ru:"Расширение периодонтальной щели", group:"periapical" },
  { id:"lamina-dura-loss", ru:"Нарушение целостности lamina dura", group:"periapical" },
  { id:"lateral-radiolucency", ru:"Латеральное просветление корня", group:"periapical" },
  { id:"furcation-radiolucency", ru:"Просветление в области фуркации", group:"periapical" },
  { id:"apical-root-resorption", ru:"Апикальная резорбция корня", group:"periapical" },
  { id:"treated-canals", ru:"Ранее леченные каналы", group:"endodontic" },
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
] as const;

export const PERIAPICAL_NORMAL_FINDING = "periapical-normal";
export const PERIAPICAL_PATHOLOGY_FINDINGS = new Set([
  "periapical",
  "widened-pdl",
  "lamina-dura-loss",
  "lateral-radiolucency",
  "furcation-radiolucency",
  "apical-root-resorption",
]);

export const RADIOGRAPHIC_GROUP_LABELS: Record<RadiographicFindingOption["group"], string> = {
  periapical:"Периапикальные ткани",
  endodontic:"Эндодонтия",
  restorative:"Кариес и реставрации",
  periodontal:"Пародонт",
  implant:"Импланты",
  other:"Другие находки",
};
