import type { ClinicalDraft, Surface, ToothState } from "./types";
import { HEBREW_FINDINGS, SYMPTOM_HEBREW, hebrewList, phrase } from "./hebrew-catalog";

export interface FindingGroup {
  findingId: string;
  teeth: number[];
  surfacesByTooth: Record<number, Surface[]>;
  text: string;
}

const sentence=(value:string)=>`${value.trim().replace(/[.;]+$/u,"")}.`;
const unique=<T,>(values:T[])=>[...new Set(values)];

/** Presentation-only semantic consolidation. The draft is never mutated. */
export function aggregateClinicalFindings(draft:ClinicalDraft):FindingGroup[]{
  const groups=new Map<string,{findingId:string;teeth:ToothState[]}>();
  Object.values(draft.teeth).filter(tooth=>!tooth.missing).forEach(tooth=>{
    unique(tooth.findings).forEach(findingId=>{
      const key=findingId;
      const current=groups.get(key)??{findingId,teeth:[]};
      current.teeth.push(tooth);
      groups.set(key,current);
    });
  });
  const raw=[...groups.values()].map(({findingId,teeth})=>{
    const sorted=[...teeth].sort((a,b)=>a.number-b.number);
    const surfacesByTooth=Object.fromEntries(sorted.map(tooth=>[tooth.number,unique(tooth.surfaces)]));
    const targets=sorted.map(tooth=>{
      const surfaces=surfacesByTooth[tooth.number];
      return `${tooth.number}${findingId.includes("caries")&&surfaces.length?` (${surfaces.join("")})`:""}`;
    });
    const label=phrase(HEBREW_FINDINGS,findingId);
    const text=findingId==="intact"
      ? sentence(`שיניים ${hebrewList(sorted.map(tooth=>String(tooth.number)))} ללא ממצא פתולוגי בבדיקה הקלינית`)
      : sentence(`${label} ${sorted.length===1?`בשן ${targets[0]}`:`בשיניים ${hebrewList(targets)}`}`);
    return {findingId,teeth:sorted.map(tooth=>tooth.number),surfacesByTooth,text};
  });
  const merged=new Map<string,FindingGroup[]>();
  raw.forEach(group=>{const key=JSON.stringify([group.teeth,group.surfacesByTooth]);merged.set(key,[...(merged.get(key)??[]),group])});
  return [...merged.values()].map(items=>{
    if(items.length===1)return items[0];
    const base=items[0];
    const labels=items.map(item=>phrase(HEBREW_FINDINGS,item.findingId));
    const single=base.teeth.length===1;
    const surfaces=base.surfacesByTooth[base.teeth[0]];
    const text=single
      ? sentence(`שן ${base.teeth[0]}: ${hebrewList(labels)}${surfaces.length?`; במשטחים ${surfaces.join(",")}`:""}`)
      : sentence(`שיניים ${hebrewList(base.teeth.map(String))}: ${hebrewList(labels)}`);
    return {...base,findingId:items.map(item=>item.findingId).join("+"),text};
  }).sort((a,b)=>a.teeth[0]-b.teeth[0]||a.findingId.localeCompare(b.findingId));
}

export function toothSpecificClinicalDetails(draft:ClinicalDraft):string[]{
  const result:string[]=[];
  Object.values(draft.teeth).filter(tooth=>!tooth.missing).sort((a,b)=>a.number-b.number).forEach(tooth=>{
    unique(tooth.symptoms).forEach(symptom=>result.push(sentence(`שן ${tooth.number}, לפי דיווח המטופל: ${SYMPTOM_HEBREW[symptom]??symptom}`)));
    const metrics:string[]=[];
    if(tooth.clinicalCrownHeightMm!==undefined)metrics.push(`גובה כותרת קלינית ${tooth.clinicalCrownHeightMm} מ"מ`);
    if(tooth.recessionMm!==undefined)metrics.push(`נסיגת חניכיים ${tooth.recessionMm} מ"מ`);
    if(tooth.mobilityGrade!==undefined)metrics.push(`ניידות דרגה ${tooth.mobilityGrade}`);
    if(tooth.furcationGrade!==undefined)metrics.push(`מעורבות פורקציה דרגה ${tooth.furcationGrade}`);
    if(tooth.bleedingOnProbing!==undefined)metrics.push(tooth.bleedingOnProbing?"דימום בבדיקת כיסים":"ללא דימום בבדיקת כיסים");
    const depths=Object.entries(tooth.probingDepthsMm??{}).filter(([,value])=>value!==undefined).map(([site,value])=>`${site}: ${value} מ"מ`);
    if(depths.length)metrics.push(`עומקי כיסים: ${depths.join(", ")}`);
    if(metrics.length)result.push(sentence(`שן ${tooth.number}: ${metrics.join("; ")}`));
    if(tooth.notes?.trim())result.push(sentence(`שן ${tooth.number}: ${tooth.notes.trim()}`));

  });
  return result;
}
