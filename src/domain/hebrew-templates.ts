import type { Alternative, ClinicalDraft, Imaging, ToothState, Treatment } from "./types";
import {
  HEBREW_FINDINGS,
  HEBREW_TREATMENTS,
  IMAGING_LABELS,
  IMAGING_STATUS,
  SYMPTOM_HEBREW,
  TREATMENT_STATUS,
  hebrewList,
  phrase,
} from "./hebrew-catalog";
import { groupFirstAidSelections } from "./first-aid-catalog";
import { completedLabStageText, dependencyText, labConstructionText, labOrderRemakeText, medicationSafetyText, medicationText, patientDecisionText } from "./structured-clinical-text";

const unique = <T,>(items: T[]) => [...new Set(items)];
const sentence = (value: string) => `${value.trim().replace(/[.;]+$/u, "")}.`;
const cleanOutput = (value: string) => value.replace(/[“”]/gu, '"').replace(/[ \t]+\n/gu, "\n").trim();

function toothFindingSentence(tooth: ToothState): string | null {
  if (tooth.missing) return null;
  const findings = unique(tooth.findings).map(key => phrase(HEBREW_FINDINGS, key));
  const symptoms = unique(tooth.symptoms).map(key => SYMPTOM_HEBREW[key] ?? key);
  if (!findings.length && !symptoms.length && !tooth.notes) return null;

  const parts: string[] = [];
  if (findings.length) parts.push(hebrewList(findings));
  if (tooth.surfaces.length && tooth.findings.some(key => key.includes("caries"))) {
    parts.push(`במשטחים ${unique(tooth.surfaces).join(",")}`);
  }
  if (symptoms.length) parts.push(`לפי דיווח המטופל: ${hebrewList(symptoms)}`);
  if (tooth.notes) parts.push(tooth.notes);

  let result = `שן ${tooth.number}: ${parts.join("; ")}`;
  if (tooth.findings.includes("deep-caries")) {
    result += "; ייתכן צורך בטיפול שורש בהתאם למצב המוך ולממצאים במהלך הטיפול, ללא אבחנה אנדודונטית סופית בשלב זה";
  }
  return sentence(result);
}

function imagingSentence(imaging: Imaging): string {
  const label = IMAGING_LABELS[imaging.kind] ?? imaging.kind;
  const target = imaging.target ? ` עבור ${imaging.target}` : "";
  if (imaging.status === "refused") return sentence(`${IMAGING_STATUS[imaging.status]} ${label}${target}; הוסבר כי ללא הבדיקה יכולת האבחון מוגבלת`);
  if (imaging.status !== "reviewed") return sentence(`${IMAGING_STATUS[imaging.status]} ${label}${target}`);
  const findingText = unique(imaging.findings).map(key => phrase(HEBREW_FINDINGS, key));
  const details = [hebrewList(findingText), imaging.notes].filter(Boolean).join("; ");
  return sentence(`${label}${target} נבדק${details ? `: ${details}` : ""}`);
}

function treatmentText(treatment: Treatment): string {
  const target = treatment.tooth ? `בשן ${treatment.tooth} ` : treatment.jaw === "upper" ? "ללסת העליונה " : treatment.jaw === "lower" ? "ללסת התחתונה " : "";
  const details = [treatment.material ? `חומר ${treatment.material}` : "", treatment.shade ? `גוון ${treatment.shade}` : ""].filter(Boolean);
  return `${target}${phrase(HEBREW_TREATMENTS, treatment.kind)}${details.length ? `, ${details.join(", ")}` : ""}`;
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

  const complaints = [examination.complaint.trim() ? sentence(examination.complaint) : "", ...(firstAid.get("complaint") ?? [])].filter(Boolean);
  if (complaints.length) sections.push(`סיבת הביקור:\n${unique(complaints).join(" ")}`);
  if (examination.extraoral.trim()) sections.push(`EO: ${sentence(examination.extraoral)}`);
  if (examination.softTissues.trim()) sections.push(`רקמות רכות: ${sentence(examination.softTissues)}`);
  if (examination.occlusion.trim()) sections.push(`סגר: ${sentence(examination.occlusion)}`);
  if (examination.hygiene.trim()) sections.push(`OH: ${sentence(examination.hygiene)}`);
  if (examination.periodontal.trim()) sections.push(`פמ"ר: ${sentence(examination.periodontal)}`);
  if (examination.medicalFlags.length) sections.push(`אנמנזה רפואית:\n${sentence(hebrewList(unique(examination.medicalFlags)))}`);
  const medicationLines = (draft.medications ?? []).map(medicationText).filter((value): value is string => Boolean(value));
  (draft.medicationSafetyReviews ?? []).map(medicationSafetyText).forEach(value=>medicationLines.push(value));
  if (medicationLines.length) sections.push(`תיעוד תרופתי:\n${medicationLines.join(" ")}`);

  const clinicalFindings: string[] = [];
  if (draft.edentulous.includes("upper")) clinicalFindings.push("חוסר שיניים מלא בלסת העליונה.");
  if (draft.edentulous.includes("lower")) clinicalFindings.push("חוסר שיניים מלא בלסת התחתונה.");
  Object.values(draft.teeth).map(toothFindingSentence).filter((value): value is string => Boolean(value)).forEach(value => clinicalFindings.push(value));
  const missing = Object.values(draft.teeth).filter(tooth => tooth.missing).map(tooth => String(tooth.number));
  if (missing.length && !draft.edentulous.length) clinicalFindings.push(sentence(`שיניים ${hebrewList(missing)} חסרות`));
  examination.details.forEach(detail => clinicalFindings.push(sentence(detail)));
  draft.implants.forEach(implant => {
    const implantFindings = unique(implant.findings).map(key => phrase(HEBREW_FINDINGS, key));
    clinicalFindings.push(sentence(`שתל באזור ${implant.region}${implantFindings.length ? `: ${hebrewList(implantFindings)}` : " קיים"}`));
  });
  clinicalFindings.push(...(firstAid.get("clinical") ?? []));
  if (clinicalFindings.length) sections.push(`ממצאים קליניים:\n${clinicalFindings.join(" ")}`);

  const radiology = [...draft.imaging.map(imagingSentence), ...(firstAid.get("radiology") ?? [])];
  if (radiology.length) sections.push(`ממצאים רדיולוגיים:\n${unique(radiology).join(" ")}`);

  const allTreatments = [...Object.values(draft.teeth).flatMap(tooth => tooth.treatments), ...draft.generalTreatments];
  const completed = allTreatments.filter(treatment => treatment.status === "completed");
  const completedText = [...completed.map(treatmentText).map(sentence), ...(firstAid.get("completed") ?? [])];
  (draft.labOrders ?? []).flatMap(order => order.stages).map(completedLabStageText).filter((value): value is string => Boolean(value)).forEach(value => completedText.push(value));
  if (completedText.length) sections.push(`טיפול שבוצע:\n${unique(completedText).join(" ")}`);

  const plan: string[] = [];
  allTreatments.filter(treatment => treatment.status !== "completed" && treatment.status !== "cancelled").forEach(treatment => {
    plan.push(`${TREATMENT_STATUS[treatment.status]} ${treatmentText(treatment)}`);
  });
  draft.alternatives.map(alternativeText).filter((value): value is string => Boolean(value)).forEach(value => plan.push(value));
  (draft.labConstructions ?? []).map(labConstructionText).forEach(value => plan.push(value));
  (draft.labOrders ?? []).map(labOrderRemakeText).filter((value): value is string => Boolean(value)).forEach(value=>plan.push(value));
  (draft.externalProcedureDependencies ?? []).map(dependencyText).forEach(value=>plan.push(value));
  (draft.patientDecisions ?? []).map(patientDecisionText).filter((value): value is string => Boolean(value)).forEach(value => plan.push(value));
  plan.push(...(firstAid.get("recommendation") ?? []), ...(firstAid.get("counseling") ?? []));
  if (plan.length) sections.push(`תוכנית טיפול והמלצות:\n${sentence(unique(plan).join("; "))}`);

  return cleanOutput(sections.join("\n\n"));
}
