import data from "./data/complaints-v1.json";
import type { ClinicalDraft, ComplaintSelection } from "./types";
import { hebrewList } from "./hebrew-catalog";

export type ComplaintScope="tooth"|"region"|"general"|"any";
export type ComplaintCategory=keyof typeof data.categories;
export interface ComplaintCatalogItem {id:string;ru:string;he:string;category:ComplaintCategory;scope:ComplaintScope;frequent:boolean;patientReported:true}
export interface ComplaintModifier {id:string;labelRu:string;phraseHe:string}

export const COMPLAINT_CATEGORIES=data.categories;
export const COMPLAINT_MODIFIERS=data.modifiers;
export const FREQUENT_COMPLAINT_IDS=new Set(["tooth-pain","spontaneous-pain","cold","bite-pain","filling-chipped","crown-off","denture-pain","wisdom-area-pain","gum-swelling","no-complaints","checkup","follow-up","second-opinion"]);
const generalIds=new Set(["generalized-sensitivity","bleeding-gum","recession","burning-mouth","dry-mouth","bad-breath","bad-taste","jaw-lock","mouth-opening","bite-change","chewing-difficult","bruxism","jaw-fatigue","speech-denture","aesthetic-front","tooth-color","gap","missing-replace","implant-interest","denture-interest","checkup","second-opinion","treatment-plan","follow-up","after-imaging","referral","urgent-request"]);
const regionIds=new Set(["jaw-pain","gum-pain","pain-under-denture","implant-area-pain","pain-on-opening","bridge-loose","bridge-off","bridge-fracture","gum-swelling","face-swelling","pus","fistula","mouth-ulcer","trauma-cheek","trauma-tongue","denture-pain","denture-loose","denture-broken","denture-clasp","denture-pressure","denture-sore","denture-chew","denture-adjust","denture-remake","implant-denture-loose","implant-crown-loose","implant-prosthesis-loose","implant-area-swelling","implant-bleeding","implant-food","implant-followup","jaw-click","tooth-impact","bleeding-after-extraction","pain-after-extraction","swelling-after-extraction"]);
const scopeFor=(id:string):ComplaintScope=>id==="no-complaints"?"any":generalIds.has(id)?"general":regionIds.has(id)?"region":"tooth";
export const COMPLAINT_CATALOG:readonly ComplaintCatalogItem[]=data.complaints.map(item=>({...item,category:item.category as ComplaintCategory,ru:item.labelRu,he:item.phraseHe,scope:scopeFor(item.id),frequent:FREQUENT_COMPLAINT_IDS.has(item.id),patientReported:true as const}));
export const COMPLAINT_REGIONS=COMPLAINT_MODIFIERS.location.filter(item=>item.id!=="tooth"&&item.id!=="region");

const byId=new Map(COMPLAINT_CATALOG.map(item=>[item.id,item]));
const modifier=(kind:keyof typeof COMPLAINT_MODIFIERS,id?:string)=>id?(COMPLAINT_MODIFIERS[kind] as ComplaintModifier[]).find(item=>item.id===id)?.phraseHe??"":"";
const sentence=(value:string)=>`${value.trim().replace(/[.;]+$/u,"")}.`;
const detailParts=(selection:ComplaintSelection)=>[
  modifier("onset",selection.onset),
  modifier("intensity",selection.intensity??selection.severity),
  modifier("pattern",selection.pattern),
  ...[...new Set(selection.triggers??(selection.trigger?[selection.trigger]:[]))].map(id=>modifier("trigger",id)),
  modifier("patient_goal",selection.patientGoal),
].filter(Boolean);

export function complaintSentences(draft:ClinicalDraft):string[]{
  const grouped=new Map<string,{entry:ComplaintCatalogItem;selection:ComplaintSelection;teeth:number[]}>();
  Object.values(draft.teeth).forEach(tooth=>(tooth.complaints??[]).forEach(selection=>{const entry=byId.get(selection.complaintId);if(!entry)return;const key=JSON.stringify([selection.complaintId,selection.onset,selection.intensity??selection.severity,selection.pattern,selection.triggers??selection.trigger,selection.patientGoal]);const group=grouped.get(key)??{entry,selection,teeth:[]};group.teeth.push(tooth.number);grouped.set(key,group)}));
  const result=[...grouped.values()].map(({entry,selection,teeth})=>{const sorted=[...new Set(teeth)].sort((a,b)=>a-b);const target=sorted.length===1?`בשן ${sorted[0]}`:`בשיניים ${hebrewList(sorted.map(String))}`;if(entry.id==="no-complaints")return sentence(sorted.length===1?`לדברי המטופל/ת, אין תלונות הקשורות לשן ${sorted[0]}`:`לדברי המטופל/ת, אין תלונות הקשורות לשיניים ${hebrewList(sorted.map(String))}`);return sentence(`לדברי המטופל/ת, ${[entry.he,target,...detailParts(selection)].join(", ")}`)});
  (draft.regionalComplaints??[]).forEach(selection=>{const entry=byId.get(selection.complaintId);if(!entry)return;const location=modifier("location",selection.region);result.push(sentence(entry.id==="no-complaints"?`לדברי המטופל/ת, אין תלונות${location?` ${location}`:""}`:`לדברי המטופל/ת, ${[entry.he,location,...detailParts(selection)].filter(Boolean).join(", ")}`))});
  (draft.generalComplaints??[]).forEach(selection=>{const entry=byId.get(selection.complaintId);if(!entry)return;result.push(sentence(entry.id==="no-complaints"?"לדברי המטופל/ת, אין תלונות":`לדברי המטופל/ת, ${[entry.he,...detailParts(selection)].filter(Boolean).join(", ")}`))});
  return [...new Set(result)];
}

export function validateComplaintSelections(selections:ComplaintSelection[]):string[]{
  const errors:string[]=[];
  selections.forEach(selection=>{if(!byId.has(selection.complaintId))errors.push(`Неизвестная жалоба: ${selection.complaintId}`)});
  if(selections.some(item=>item.complaintId==="no-complaints")&&selections.some(item=>item.complaintId!=="no-complaints"))errors.push("«Жалоб нет» несовместимо с выбранными жалобами.");
  return errors;
}
