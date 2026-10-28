import type { ClinicalDraft } from "./types";

const legacyConsultations:Record<string,NonNullable<ClinicalDraft["consultations"]>[number]["type"]>={"endo-consult":"endodontist","implant-consult":"implantologist","periodontal-consult":"periodontist",hygienist:"hygienist"};

/** Adds fields introduced after the first local-storage schema without altering clinical data. */
export function normalizeDraft(input: ClinicalDraft): ClinicalDraft {
  const draft = structuredClone(input);
  draft.firstAidSelections ??= [];
  draft.selectedMaccabiCodes ??= {};
  draft.eligibility ??= { ageGroup: "unknown", verified: false };
  draft.labConstructions ??= [];
  draft.labOrders ??= [];
  draft.externalProcedureDependencies ??= [];
  draft.patientDecisions ??= [];
  draft.medications ??= [];
  draft.medicationSafetyReviews ??= [];
  draft.mentorChecklists ??= [];
  draft.regionalComplaints ??= [];
  draft.generalComplaints ??= [];
  draft.consultations ??= [];
  draft.regionalClinicalFindings ??= [];
  const migrateTreatment=(treatment:ClinicalDraft["generalTreatments"][number])=>{const type=legacyConsultations[treatment.kind];if(!type)return false;if(!draft.consultations!.some(item=>item.id===treatment.id))draft.consultations!.push({id:treatment.id,type,target:treatment.tooth?{kind:"teeth",teeth:[treatment.tooth]}:treatment.jaw?{kind:"jaw",jaw:treatment.jaw}:{kind:"plan"},reasons:[],status:treatment.status==="planned"?"scheduled":treatment.status==="completed"?"completed":treatment.status==="refused"||treatment.status==="cancelled"?"refused":"recommended",completionConfirmed:treatment.status==="completed"});return true};
  Object.values(draft.teeth).forEach(tooth=>{tooth.treatments=tooth.treatments.filter(treatment=>!migrateTreatment(treatment))});
  draft.generalTreatments=draft.generalTreatments.filter(treatment=>!migrateTreatment(treatment));
  const complaintAliases:Record<string,string>={"none":"no-complaints","pain.biting":"bite-pain","pain.spontaneous":"spontaneous-pain","pain.night":"night-pain","pain.jaw":"jaw-pain","sensitivity.cold":"cold","sensitivity.hot":"heat","sensitivity.sweet":"sweet","swelling.local":"gum-swelling","periodontal.bleeding":"bleeding-gum","periodontal.food-trap":"food-trap","restoration.filling-broken":"filling-chipped","restoration.filling-lost":"filling-lost","restoration.crown-loose":"crown-loose","restoration.crown-off":"crown-off","restoration.bridge-loose":"bridge-loose","restoration.denture-pain":"denture-pain","trauma.wisdom-pain":"wisdom-area-pain","function.chewing":"chewing-difficult","soft.dry-mouth":"dry-mouth","aesthetic.color":"tooth-color","general.checkup":"checkup","general.second-opinion":"second-opinion","general.treatment-plan":"treatment-plan","general.followup":"follow-up"};
  const migrate=(items:NonNullable<ClinicalDraft["generalComplaints"]>)=>items.forEach(item=>{item.complaintId=complaintAliases[item.complaintId]??item.complaintId;if(item.region){const regions:Record<string,string>={"Верхняя челюсть":"upper","Нижняя челюсть":"lower","Справа":"upper-right","Слева":"upper-left","Передний отдел":"general","Область ВНЧС справа":"upper-right","Область ВНЧС слева":"upper-left","Слизистая полости рта":"general"};item.region=regions[item.region]??item.region}if(item.trigger&&!item.triggers)item.triggers=[item.trigger==="hot"?"heat":item.trigger];if(item.severity&&!item.intensity)item.intensity=item.severity});
  Object.values(draft.teeth).forEach(tooth=>{tooth.complaints??=[];migrate(tooth.complaints)});
  migrate(draft.regionalComplaints);migrate(draft.generalComplaints);
  return draft;
}
