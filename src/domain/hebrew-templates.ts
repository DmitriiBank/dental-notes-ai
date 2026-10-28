import type { Alternative, ClinicalDraft, Imaging, Treatment } from "./types";
import {
  HEBREW_FINDINGS,
  HEBREW_TREATMENTS,
  IMAGING_LABELS,
  IMAGING_STATUS,
  TREATMENT_STATUS,
  hebrewList,
  phrase,
} from "./hebrew-catalog";
import { groupFirstAidSelections } from "./first-aid-catalog";
import { completedLabStageText, dependencyText, labConstructionText, labOrderInstructionText, labOrderRemakeText, medicationSafetyText, medicationText, patientDecisionText } from "./structured-clinical-text";
import { complaintSentences } from "./complaint-catalog";
import { consultationText } from "./consultation-catalog";
import { aggregateClinicalFindings, toothSpecificClinicalDetails } from "./clinical-presentation";
import { discussionText, groupedPerformedTexts } from "./performed-treatment";

const unique = <T,>(items: T[]) => [...new Set(items)];
const sentence = (value: string) => `${value.trim().replace(/[.;]+$/u, "")}.`;
const cleanOutput = (value: string) => value.replace(/[“”]/gu, '"').replace(/[ \t]+\n/gu, "\n").trim();

function imagingSentence(imaging: Imaging): string {
  const label = IMAGING_LABELS[imaging.kind] ?? imaging.kind;
  const target = imaging.target ? ` עבור ${imaging.target}` : "";
  if (imaging.status === "refused") return sentence(`${IMAGING_STATUS[imaging.status]} ${label}${target}`);
  if (imaging.status !== "reviewed") return sentence(`${IMAGING_STATUS[imaging.status]} ${label}${target}`);
  const findingText = unique(imaging.findings).map(key => phrase(HEBREW_FINDINGS, key));
  const fractureDetails=imaging.findings.some(key=>key==="root-fracture-suspected"||key==="root-fracture-observed")
    ? [imaging.rootFractureLocation&&imaging.rootFractureLocation!=="unknown"?`מיקום ${imaging.rootFractureLocation}`:"",imaging.rootFractureOrientation&&imaging.rootFractureOrientation!=="undetermined"?`כיוון ${imaging.rootFractureOrientation}`:""].filter(Boolean).join(", ")
    : "";
  const details = [hebrewList(findingText),fractureDetails, imaging.notes].filter(Boolean).join("; ");
  return sentence(`${label}${target} נבדק${details ? `: ${details}` : ""}`);
}

function treatmentText(treatment: Treatment): string {
  const target = treatment.tooth ? `בשן ${treatment.tooth} ` : treatment.jaw === "upper" ? "ללסת העליונה " : treatment.jaw === "lower" ? "ללסת התחתונה " : "";
  const details = [treatment.surfaces?.length?`משטחים ${unique(treatment.surfaces).join("")}`:"",treatment.material ? `חומר ${treatment.material}` : "", treatment.shade ? `גוון ${treatment.shade}` : "",treatment.followUpDays?`בעוד ${treatment.followUpDays} ימים`:""].filter(Boolean);
  return `${target}${phrase(HEBREW_TREATMENTS, treatment.kind)}${details.length ? `, ${details.join(", ")}` : ""}`;
}

const BRIDGE_TREATMENTS = new Set(["bridge", "bridge-replacement", "implant-bridge"]);
const treatmentGroupKey = (treatment: Treatment) => JSON.stringify({
  kind: treatment.kind,
  status: treatment.status,
  material: treatment.material ?? "",
  shade: treatment.shade ?? "",
  provider: treatment.provider ?? "self",
  jaw: treatment.jaw ?? "",
  stage: treatment.stage ?? null,
  buccalOnly:treatment.buccalOnly??false,
  followUpDays:treatment.followUpDays??null,
});

const DENTURE_TREATMENTS=new Set(["complete-denture","partial-denture","immediate-denture","overdenture"]);

function groupTreatments(treatments: Treatment[]): Treatment[][] {
  const groups = new Map<string, Treatment[]>();
  const standalone: Treatment[][] = [];
  treatments.forEach(treatment => {
    if (treatment.tooth === undefined && !DENTURE_TREATMENTS.has(treatment.kind)) {
      standalone.push([treatment]);
      return;
    }
    const key = DENTURE_TREATMENTS.has(treatment.kind)?treatmentGroupKey({...treatment,jaw:undefined}):treatmentGroupKey(treatment);
    groups.set(key, [...(groups.get(key) ?? []), treatment]);
  });
  return [...groups.values(), ...standalone];
}

function groupedTreatmentText(group: Treatment[]): string {
  const treatment = group[0];
  if(DENTURE_TREATMENTS.has(treatment.kind)){
    const jaws=unique(group.map(item=>item.jaw).filter((jaw):jaw is "upper"|"lower"=>Boolean(jaw)));
    const label=phrase(HEBREW_TREATMENTS,treatment.kind);
    const target=jaws.length===2&&treatment.kind==="complete-denture"?"תותבות שלמות נשלפות ללסת העליונה וללסת התחתונה":`${label} ${jaws[0]==="upper"?"ללסת העליונה":jaws[0]==="lower"?"ללסת התחתונה":""}`.trim();
    const replacements=treatment.kind==="partial-denture"&&treatment.includeReplacedTeethInText&&treatment.replacedTeeth?.length?`שיניים להשלמה ${hebrewList(treatment.replacedTeeth.map(String))}`:"";
    return [target,replacements,treatment.material?`חומר ${treatment.material}`:""].filter(Boolean).join(", ");
  }
  const teeth = unique(group.map(item => item.tooth).filter((tooth): tooth is number => tooth !== undefined)).sort((a, b) => a - b);
  if (teeth.length <= 1) return treatmentText(treatment);
  const surfaceTargets=group.map(item=>item.tooth===undefined?"":`${item.tooth}${item.surfaces?.length?` (${unique(item.surfaces).join("")})`:""}`).filter(Boolean);
  const details = [treatment.material ? `חומר ${treatment.material}` : "", treatment.shade ? `גוון ${treatment.shade}` : "",treatment.followUpDays?`בעוד ${treatment.followUpDays} ימים`:""].filter(Boolean);
  const procedure = phrase(HEBREW_TREATMENTS, treatment.kind);
  const target = BRIDGE_TREATMENTS.has(treatment.kind)
    ? `${procedure} משן ${teeth[0]} עד שן ${teeth.at(-1)}`
    : `${procedure} בשיניים ${hebrewList(surfaceTargets)}`;
  return `${target}${details.length ? `, ${details.join(", ")}` : ""}`;
}

function alternativeText(alternative: Alternative): string | null {
  if (!alternative.offered || !alternative.label.trim()) return null;
  const target = alternative.tooth ? `לשן ${alternative.tooth} ` : "";
  const clauses = [`${target}הוצגה האפשרות: ${alternative.label.trim()}`];
  if (!alternative.feasible) clauses.push("האפשרות אינה נחשבת ישימה קלינית בשלב זה");
  if (alternative.risksExplained) clauses.push("הסיכונים הוסברו");
  if (alternative.prognosisDiscussed) clauses.push("הפרוגנוזה נדונה");
  if (alternative.decision === "selected") clauses.push("המטופל בחר באפשרות זו");
  if (alternative.decision === "refused") clauses.push("המטופל דחה אפשרות זו");
  if (alternative.decision === "pending") clauses.push("החלטת המטופל ממתינה");
  return clauses.join(", ");
}

/** Pure deterministic clinical-text generator with no scheduling or I/O. */
export function generateHebrewRecord(draft: ClinicalDraft): string {
  const sections: string[] = [];
  const examination = draft.examination;
  const firstAid = groupFirstAidSelections(draft.firstAidSelections ?? []);

  const complaints = [...complaintSentences(draft), examination.complaint.trim() ? sentence(examination.complaint) : "", ...(firstAid.get("complaint") ?? [])].filter(Boolean);
  if (complaints.length) sections.push(`סיבת הביקור:\n${unique(complaints).join(" ")}`);
  if (examination.extraoral.trim()) sections.push(`EO: ${sentence(examination.extraoral)}`);
  if (examination.softTissues.trim()) sections.push(`רקמות רכות: ${sentence(examination.softTissues)}`);
  if (examination.occlusion.trim()) sections.push(`סגר: ${sentence(examination.occlusion)}`);
  if (examination.hygiene.trim()) sections.push(`OH: ${sentence(examination.hygiene)}`);
  if (examination.periodontal.trim()) sections.push(`פמ"ר: ${sentence(examination.periodontal)}`);
  if (examination.medicalFlags.length) sections.push(`אנמנזה רפואית:\n${sentence(hebrewList(unique(examination.medicalFlags)))}`);
  const medicationLines = (draft.medications ?? []).filter(medication=>medication.status!=="recommended").map(medicationText).filter((value): value is string => Boolean(value));
  const recommendedMedicationLines = (draft.medications ?? []).filter(medication=>medication.status==="recommended").map(medicationText).filter((value): value is string => Boolean(value));
  (draft.medicationSafetyReviews ?? []).map(medicationSafetyText).forEach(value=>medicationLines.push(value));
  if (medicationLines.length) sections.push(`תיעוד תרופתי:\n${medicationLines.join(" ")}`);

  const clinicalFindings: string[] = [];
  if (draft.edentulous.includes("upper")) clinicalFindings.push("חוסר שיניים מלא בלסת העליונה.");
  if (draft.edentulous.includes("lower")) clinicalFindings.push("חוסר שיניים מלא בלסת התחתונה.");
  aggregateClinicalFindings(draft).forEach(group=>clinicalFindings.push(group.text));
  clinicalFindings.push(...toothSpecificClinicalDetails(draft));
  (draft.regionalClinicalFindings??[]).filter(item=>item.clinicianConfirmed).forEach(item=>clinicalFindings.push(sentence(`${item.region==="lower-left"?"באזור הרטרומולרי השמאלי התחתון":item.region==="lower-right"?"באזור הרטרומולרי הימני התחתון":item.region==="upper-left"?"באזור הרטרומולרי השמאלי העליון":"באזור הרטרומולרי הימני העליון"}: ${item.id==="retromolar-tender-fold"?"קפל רירית רגיש במישוש":"לא נצפו סימני דלקת"}`)));
  const missing = Object.values(draft.teeth).filter(tooth => tooth.missing).map(tooth => String(tooth.number));
  if (missing.length && !draft.edentulous.length) clinicalFindings.push(sentence(`שיניים ${hebrewList(missing)} חסרות`));
  const recommendedDetails=examination.details.filter(detail=>/^הומלץ/u.test(detail.trim()));
  examination.details.filter(detail=>!recommendedDetails.includes(detail)).forEach(detail => clinicalFindings.push(sentence(detail)));
  draft.implants.forEach(implant => {
    const implantFindings = unique(implant.findings).map(key => phrase(HEBREW_FINDINGS, key));
    clinicalFindings.push(sentence(`שתל באזור ${implant.region}${implantFindings.length ? `: ${hebrewList(implantFindings)}` : " קיים"}`));
  });
  clinicalFindings.push(...(firstAid.get("clinical") ?? []));
  if (clinicalFindings.length) sections.push(`ממצאים קליניים:\n${clinicalFindings.join(" ")}`);

  const radiology = [...draft.imaging.filter(imaging=>imaging.status!=="recommended").map(imagingSentence), ...(firstAid.get("radiology") ?? [])];
  if (radiology.length) sections.push(`ממצאים רדיולוגיים:\n${unique(radiology).join(" ")}`);

  const allTreatments = [...Object.values(draft.teeth).flatMap(tooth => tooth.treatments), ...draft.generalTreatments];
  const completed = allTreatments.filter(treatment => treatment.status === "completed");
  const completedText = [...groupTreatments(completed).map(groupedTreatmentText).map(sentence), ...(firstAid.get("completed") ?? [])];
  completedText.push(...groupedPerformedTexts(draft.performedActs??[]));
  completedText.push(...(draft.clinicalDiscussions??[]).filter(item=>item.explicitlyExplained&&item.clinicianConfirmed).map(discussionText));
  (draft.labOrders ?? []).flatMap(order => order.stages).map(completedLabStageText).filter((value): value is string => Boolean(value)).forEach(value => completedText.push(value));
  if (completedText.length) sections.push(`טיפול שבוצע:\n${unique(completedText).join(" ")}`);

  const plan: string[] = [];
  draft.imaging.filter(imaging=>imaging.status==="recommended").map(imagingSentence).forEach(value=>plan.push(value));
  recommendedDetails.map(sentence).forEach(value=>plan.push(value));
  recommendedMedicationLines.forEach(value=>plan.push(value));
  (draft.consultations??[]).map(consultationText).filter((value):value is string=>Boolean(value)).forEach(value=>plan.push(value));
  groupTreatments(allTreatments.filter(treatment => treatment.status !== "completed" && treatment.status !== "cancelled")).forEach(group => {
    plan.push(`${TREATMENT_STATUS[group[0].status]} ${groupedTreatmentText(group)}`);
  });
  draft.alternatives.map(alternativeText).filter((value): value is string => Boolean(value)).forEach(value => plan.push(value));
  (draft.labConstructions ?? []).map(labConstructionText).forEach(value => plan.push(value));
  (draft.labOrders ?? []).map(labOrderRemakeText).filter((value): value is string => Boolean(value)).forEach(value=>plan.push(value));
  (draft.labOrders ?? []).map(labOrderInstructionText).filter((value): value is string => Boolean(value)).forEach(value=>plan.push(value));
  (draft.externalProcedureDependencies ?? []).map(dependencyText).forEach(value=>plan.push(value));
  (draft.patientDecisions ?? []).map(patientDecisionText).filter((value): value is string => Boolean(value)).forEach(value => plan.push(value));
  plan.push(...(firstAid.get("recommendation") ?? []), ...(firstAid.get("counseling") ?? []));
  if (plan.length) sections.push(`תוכנית טיפול והמלצות:\n${sentence(unique(plan).map(value=>value.trim().replace(/[.;]+$/u,"")).join("; "))}`);

  return cleanOutput(sections.join("\n\n"));
}
