import type { ClinicalDraft, Treatment } from "./types";
import { emptyTeeth } from "./teeth";

export function emptyDraft(): ClinicalDraft {
  return {
    examination: { complaint:"", extraoral:"", softTissues:"", occlusion:"", hygiene:"", periodontal:"", details:[], normalsConfirmed:false, medicalFlags:[] },
    teeth: emptyTeeth(), implants:[], imaging:[], alternatives:[], generalTreatments:[], edentulous:[], customDurations:{}, firstAidSelections:[], selectedMaccabiCodes:{}, eligibility:{ageGroup:"unknown",verified:false},
    labConstructions:[], labOrders:[], externalProcedureDependencies:[], patientDecisions:[], medications:[], medicationSafetyReviews:[], mentorChecklists:[]
  };
}
const tr = (id:string, kind:string, status:Treatment["status"], tooth?:number, surfaces?:Treatment["surfaces"]):Treatment => ({id,kind,status,tooth,surfaces});

export function caseA(): ClinicalDraft {
  const d=emptyDraft(); d.examination.complaint="ניידות באזור שן 15";
  Object.assign(d.teeth[15], {findings:["artificial-crown","crown-with-root","root-caries"],surfaces:["C"], treatments:[tr("a-ex","extraction","recommended",15),tr("a-flip","immediate-denture","recommended",15)]});
  [[13,["P","D"]],[12,["M","P","D"]],[11,["P","M"]]].forEach(([n,s],i)=>Object.assign(d.teeth[n as number],{findings:["primary-caries"],surfaces:s,treatments:[tr(`a-f${i}`,"filling","planned",n as number,s as Treatment["surfaces"])]}));
  d.teeth[45].missing=true; d.generalTreatments=[tr("a-imp15","implant-consult","recommended",15),tr("a-imp45","implant-consult","recommended",45),{...tr("a-impr","immediate-denture","completed",15),stage:1,shade:"A3"}]; return d;
}
export function caseB(): ClinicalDraft { const d=emptyDraft(); Object.assign(d.teeth[26],{findings:["deep-caries"],surfaces:["O","M"],treatments:[tr("b-f","filling","planned",26,["O","M"])]}); return d; }
export function caseC(): ClinicalDraft { const d=emptyDraft(); d.imaging=[{id:"c-img",kind:"periapical",status:"reviewed",target:"שן 27",findings:["periapical"]}]; d.alternatives=[{id:"c1",tooth:27,label:"בירור אנדודונטי ושיקום השן במידת האפשר",offered:true,feasible:true,risksExplained:true,prognosisDiscussed:true,decision:"selected"},{id:"c2",tooth:27,label:"עקירה והשלמת השן החסרה",offered:true,feasible:true,risksExplained:true,prognosisDiscussed:true,decision:"pending"}]; return d; }
export function caseD(): ClinicalDraft { const d=emptyDraft(); d.edentulous=["upper","lower"]; Object.values(d.teeth).forEach(t=>t.missing=true); d.examination.details=["אטרופיה משמעותית של הרכסים"]; d.generalTreatments=[tr("d-den","complete-denture","planned"),tr("d-imp","implant-placement","refused")]; return d; }
export function caseE(): ClinicalDraft { const d=emptyDraft(); d.examination.complaint="כאבים מתחת לתותבת נתמכת שתלים בלסת העליונה"; d.implants=[{id:"e-i",region:"לסת עליונה",findings:["תותבת נתמכת שתלים קיימת ממרפאה אחרת"]}]; d.examination.details=["ארוזיות ברקמות הרכות מתחת לתותבת"]; d.generalTreatments=[{...tr("e-adj","denture-adjustment","recommended"),provider:"external"}]; return d; }
export function caseF(): ClinicalDraft { const d=emptyDraft(); Object.assign(d.teeth[12],{findings:["loose-crown"],treatments:[{...tr("f-rec","crown-recement","completed",12),material:"Temp-Bond"},tr("f-obs","observation","recommended",12)]}); return d; }
export function caseG(): ClinicalDraft { const d=emptyDraft(); d.examination.medicalFlags=["הריון בחודש הרביעי"]; Object.assign(d.teeth[12],{findings:["recession"],symptoms:["Холод"]}); d.examination.details=["הומלץ על מברשת רכה ומשחת שיניים להפחתת רגישות","הומלץ בירור פריודונטלי נוסף"]; return d; }
export const SAMPLE_CASES = [{id:"a",name:"A — пломбы и коронка",load:caseA},{id:"b",name:"B — глубокий кариес",load:caseB},{id:"c",name:"C — периапикальный очаг",load:caseC},{id:"d",name:"D — полная адентия",load:caseD},{id:"e",name:"E — протез на имплантах",load:caseE},{id:"f",name:"F — подвижная коронка",load:caseF},{id:"g",name:"G — беременность",load:caseG}];
