import type { ClinicalDraft, MaccabiCodeCandidate, Treatment } from "./types";
import { positionFor } from "./teeth";
import { MACCABI_CATALOG as CODES, MACCABI_CATALOG_VERSION, type MaccabiCatalogEntry } from "./data/maccabi-catalog-v2026-07-15";

export const MACCABI_SOURCE_VERSION = MACCABI_CATALOG_VERSION;

const targetFor=(treatment:Treatment)=>treatment.tooth?`שן ${treatment.tooth}`:treatment.jaw==="upper"?"לסת עליונה":treatment.jaw==="lower"?"לסת תחתונה":"לא צוין";
const toothClassFor=(treatment:Treatment):MaccabiCodeCandidate["toothClass"]=>treatment.tooth?(positionFor(treatment.tooth)<=3?"anterior":"posterior"):treatment.kind.includes("implant")||treatment.kind==="multi-unit"?"implant":treatment.jaw?"jaw":"not-applicable";
const restorationClassFor=(treatment:Treatment,code:MaccabiCatalogEntry)=>{
  if(code.shortCode==="סל4")return"Class IV";if(code.shortCode==="סל")return"Class III/V";
  if(["שקא1","שקא2","שקא3"].includes(code.shortCode))return`${new Set(treatment.surfaces??[]).size} surface${new Set(treatment.surfaces??[]).size===1?"":"s"}`;
  return undefined;
};
const eligibilityFor=(draft:ClinicalDraft,code:MaccabiCatalogEntry,verificationStatus:MaccabiCodeCandidate["verificationStatus"]):MaccabiCodeCandidate["eligibilityStatus"]=>{
  if(verificationStatus!=="verified-snapshot"||code.eligibility==="requires-context")return"needs_review";
  const ageRules=code.verifiedAgeGroups;const coverageRules=code.verifiedCoverageCategories;
  const patientSpecificContext=draft.eligibility?.ageGroup!=="unknown"||Boolean(draft.eligibility?.contractCategory);
  if(patientSpecificContext&&!ageRules?.length&&!coverageRules?.length)return"needs_review";
  if((ageRules?.length||coverageRules?.length)&&!draft.eligibility?.verified)return"needs_review";
  if(ageRules?.length&&draft.eligibility.ageGroup!=="unknown"&&!ageRules.includes(draft.eligibility.ageGroup))return"not_eligible";
  if(coverageRules?.length&&(!draft.eligibility.contractCategory||!coverageRules.includes(draft.eligibility.contractCategory)))return"not_eligible";
  return"eligible";
};
const candidate=(draft:ClinicalDraft,treatment:Treatment,code:MaccabiCatalogEntry,verificationStatus:MaccabiCodeCandidate["verificationStatus"]="verified-snapshot",clarification?:string):MaccabiCodeCandidate=>({
  treatmentId:treatment.id,shortCode:code.shortCode,catalogNumber:code.catalogNumber,descriptionHe:code.descriptionHe,sourceVersion:MACCABI_SOURCE_VERSION,
  procedureStatus:treatment.status,providerRole:treatment.provider==="external"?"external":"self",verificationStatus,toothOrJaw:targetFor(treatment),quantity:treatment.quantity??1,
  selected:draft.selectedMaccabiCodes?.[treatment.id]===code.shortCode||(verificationStatus==="verified-snapshot"&&eligibilityFor(draft,code,verificationStatus)==="eligible"&&!draft.selectedMaccabiCodes?.[treatment.id]),
  indication:code.descriptionHe,material:treatment.material,toothClass:toothClassFor(treatment),restorationClass:restorationClassFor(treatment,code),
  ageRestrictions:code.verifiedAgeGroups??[],coverageRestrictions:code.verifiedCoverageCategories??[],eligibilityStatus:eligibilityFor(draft,code,verificationStatus),clarification,
});
const unresolved=(draft:ClinicalDraft,treatment:Treatment,clarification:string):MaccabiCodeCandidate=>candidate(draft,treatment,{shortCode:"UNVERIFIED",catalogNumber:"UNVERIFIED",descriptionHe:"לא נמצא קוד מאומת בספר התעריפים החלקי",eligibility:"requires-context"},"unverified",clarification);

function forTreatment(draft:ClinicalDraft,treatment:Treatment):MaccabiCodeCandidate[]{
  if(["filling","filling-replacement"].includes(treatment.kind)){
    if(!treatment.tooth)return[unresolved(draft,treatment,"Требуется номер зуба и число поверхностей.")];
    if(positionFor(treatment.tooth)<=3)return[
      candidate(draft,treatment,CODES.anteriorComposite,"needs-review","Уточните тип фронтальной реставрации."),
      candidate(draft,treatment,CODES.anteriorClass4,"needs-review","Выберите только для Class IV."),
      candidate(draft,treatment,CODES.anteriorClass35,"needs-review","Выберите только для Class III или V."),
    ];
    const count=new Set(treatment.surfaces??[]).size;
    if(count===1)return[candidate(draft,treatment,CODES.posterior1)];if(count===2)return[candidate(draft,treatment,CODES.posterior2)];if(count===3)return[candidate(draft,treatment,CODES.posterior3)];
    return[unresolved(draft,treatment,count>3?"Покрытие более трех поверхностей требует уточнения тарифа.":"Укажите поверхности реставрации.")];
  }
  if(treatment.kind==="flipper"){
    if(treatment.material?.toLowerCase().includes("valplast"))return[candidate(draft,treatment,CODES.valplastFlipper)];
    if(treatment.material?.toLowerCase().includes("acryl"))return[candidate(draft,treatment,CODES.acrylicFlipper)];
    return[candidate(draft,treatment,CODES.acrylicFlipper,"needs-review","Уточните акрил или Valplast."),candidate(draft,treatment,CODES.valplastFlipper,"needs-review","Уточните акрил или Valplast.")];
  }
  if(treatment.kind==="reinforced-denture")return[candidate(draft,treatment,CODES.mesh)];
  if(treatment.kind==="temporary-crown"){
    if(treatment.material==="chairside-acrylic")return[candidate(draft,treatment,CODES.temporaryCrownChairside)];
    if(treatment.material==="laboratory-acrylic")return[candidate(draft,treatment,CODES.temporaryCrownLaboratory)];
    return [candidate(draft,treatment,CODES.temporaryCrownChairside,"needs-review","Укажите способ изготовления: в кресле или лабораторный."),candidate(draft,treatment,CODES.temporaryCrownLaboratory,"needs-review","Укажите способ изготовления: в кресле или лабораторный.")];
  }
  if(treatment.kind==="temporary-filling")return[candidate(draft,treatment,CODES.temporaryFilling)];
  if(treatment.kind==="zirconia-crown"){
    if(treatment.material?.toLowerCase().includes("monolithic"))return[candidate(draft,treatment,CODES.monolithic)];
    return[candidate(draft,treatment,CODES.zirconia,"needs-review","Уточните: монолитная или другая безметалловая циркониевая коронка."),candidate(draft,treatment,CODES.monolithic,"needs-review","Уточните: монолитная или другая безметалловая циркониевая коронка.")];
  }
  if(treatment.kind==="multi-unit")return[candidate(draft,treatment,CODES.multiUnit,"needs-review","Проверьте контекст конкретной имплантной конструкции.")];
  if(treatment.kind==="fiber-core")return[candidate(draft,treatment,CODES.fiberCore)];
  if(treatment.kind==="core")return[candidate(draft,treatment,CODES.immediateCore,"needs-review","Уточните тип מבנה."),candidate(draft,treatment,CODES.immediateCorePin,"needs-review","Уточните наличие пина."),candidate(draft,treatment,CODES.castCore,"needs-review","Выберите только для литого металлического מבנה.")];
  if(treatment.kind==="crown-recement")return[candidate(draft,treatment,CODES.crownRecement,"needs-review","Проверьте условия первой помощи и количество опорных единиц до трех.")];
  if(treatment.kind==="night-guard")return[candidate(draft,treatment,CODES.nightGuard)];
  if(treatment.kind==="partial-denture")return[candidate(draft,treatment,CODES.castPartial,"needs-review","Уточните конструкцию: литая или временная акриловая."),candidate(draft,treatment,CODES.acrylicPartial,"needs-review","Уточните конструкцию: литая или временная акриловая.")];
  if(treatment.kind==="immediate-denture")return[candidate(draft,treatment,CODES.immediateFull,"needs-review","Проверьте, что это именно полный немедленный переходный протез.")];
  if(treatment.kind==="complete-denture")return[candidate(draft,treatment,CODES.completeDenture)];
  if(treatment.kind==="implant-crown")return[candidate(draft,treatment,CODES.implantCrown)];
  if(treatment.kind==="implant-core")return[candidate(draft,treatment,CODES.implantCore)];
  if(treatment.kind==="implant-placement")return[candidate(draft,{...treatment,provider:"external"},CODES.implant)];
  if(treatment.kind==="surgical-extraction"&&treatment.tooth&&positionFor(treatment.tooth)===8)return[candidate(draft,{...treatment,provider:"external"},CODES.wisdomExtraction)];
  if(treatment.kind==="abscess-drainage")return[candidate(draft,treatment,CODES.abscess,"needs-review","Код допустим только по факту выполнения и с проверкой исполнителя.")];
  return[unresolved(draft,treatment,"Для этой процедуры нет подтвержденного соответствия в частичном тарифном снимке.")];
}

export function selectMaccabiCodeCandidates(draft:ClinicalDraft):MaccabiCodeCandidate[]{
  const treatments=[...Object.values(draft.teeth).flatMap(tooth=>tooth.treatments),...draft.generalTreatments];
  const result=treatments.flatMap(treatment=>forTreatment(draft,treatment));
  const aid=draft.firstAidSelections??[];const hasDone=aid.some(selection=>selection.phraseId.startsWith("done.")&&selection.confirmed);
  if(aid.length){const pseudo:Treatment={id:"first-aid",kind:"first-aid",status:hasDone?"completed":"recommended",provider:"self"};result.push(candidate(draft,pseudo,hasDone?CODES.emergencyTreatment:CODES.emergencyExam,"needs-review",hasDone?"Проверьте длительность до 20 минут и отсутствие отдельного процедурного кода.":"Проверьте, что прием ограничился диагностикой и назначением рецепта."));}
  const deduplicated=new Map<string,MaccabiCodeCandidate>();
  result.forEach(item=>{const treatment=treatments.find(value=>value.id===item.treatmentId);const signature=`${treatment?.kind??item.treatmentId}:${item.toothOrJaw}:${item.procedureStatus}:${item.shortCode}`;if(!deduplicated.has(signature))deduplicated.set(signature,item)});
  return [...deduplicated.values()];
}
