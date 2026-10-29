import { EXTRACTION_SOCKET_FINDINGS } from "./extraction-socket-catalog";
import type { Alternative, ClinicalDraft, Imaging, Treatment } from "./types";
import {ORAL_DEPOSITS} from "./oral-status";
import {EXAM_PRESETS,DENTURE_FINDINGS} from "./exam-presets";
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
import {generateLabLetter} from "./lab-letter";

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
  if(treatment.kind==="hygienist")return "שיננית";
  if(treatment.kind==="extraction"||treatment.kind==="surgical-extraction")return `עקירת שן${treatment.tooth?` ${treatment.tooth}`:""}`;
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
  if(treatment.kind==="hygienist")return "שיננית";
  const teeth = unique(group.map(item => item.tooth).filter((tooth): tooth is number => tooth !== undefined)).sort((a, b) => a - b);
  if (teeth.length <= 1) return treatmentText(treatment);
  const surfaceTargets=group.map(item=>item.tooth===undefined?"":`${item.tooth}${!["extraction","surgical-extraction"].includes(treatment.kind)&&item.surfaces?.length?` (${unique(item.surfaces).join("")})`:""}`).filter(Boolean);
  const details = [treatment.material ? `חומר ${treatment.material}` : "", treatment.shade ? `גוון ${treatment.shade}` : "",treatment.followUpDays?`בעוד ${treatment.followUpDays} ימים`:""].filter(Boolean);
  const procedure = ["extraction","surgical-extraction"].includes(treatment.kind)?"עקירה":phrase(HEBREW_TREATMENTS, treatment.kind);
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
  const selected=(field:keyof typeof EXAM_PRESETS)=>{const ids=examination.selectedExamPresets?.[field]??[];return EXAM_PRESETS[field].filter(item=>ids.includes(item.id)).map(item=>item.he.replace(/[.;]+$/u,""))};
  const section=(label:string,field:keyof typeof EXAM_PRESETS,typed:string,extra:string[]=[])=>{const parts=[typed.trim().replace(/[.;]+$/u,""),...selected(field),...extra].filter(Boolean);const normalized=[...new Set(parts)];if(normalized.length)sections.push(`${label}: ${sentence(normalized.join("; "))}`)};
  section("EO","extraoral",examination.extraoral);
  section("רקמות רכות","softTissues",examination.softTissues);
  const occlusionMeasurements=[examination.overbiteMm!==undefined?`חפיפה אנכית: ${examination.overbiteMm} מ"מ`:"",examination.overjetMm!==undefined?`מרווח אופקי: ${examination.overjetMm} מ"מ`:""].filter(Boolean);
  const occlusionLabels={"deep-bite":"סגר עמוק","open-bite":"מנשך פתוח","cross-bite":"מנשך צלבי","edge-to-edge":"מנשך קצה לקצה","increased-overjet":"מרווח אופקי מוגדל","reduced-vertical-dimension":"ירידה בגובה הסגר","premature-contact":"מגע סגרי מוקדם"} as Record<string,string>;
  const occlusionDetails=(examination.occlusionFindings??[]).map(id=>occlusionLabels[id]).filter(Boolean);
  section("סגר","occlusion",examination.occlusion,[...occlusionDetails,...occlusionMeasurements]);
  section("OH","hygiene",examination.hygiene);
  section('פמ"ר',"periodontal",examination.periodontal);
  if (examination.medicalFlags.length) sections.push(`אנמנזה רפואית:\n${sentence(hebrewList(unique(examination.medicalFlags)))}`);
  const medicationLines = (draft.medications ?? []).filter(medication=>medication.status!=="recommended").map(medicationText).filter((value): value is string => Boolean(value));
  const recommendedMedicationLines = (draft.medications ?? []).filter(medication=>medication.status==="recommended").map(medicationText).filter((value): value is string => Boolean(value));
  (draft.medicationSafetyReviews ?? []).map(medicationSafetyText).forEach(value=>medicationLines.push(value));
  if (medicationLines.length) sections.push(`תיעוד תרופתי:\n${medicationLines.join(" ")}`);

  const clinicalFindings: string[] = [];
  (draft.extractionSites??[]).filter(site=>site.region.trim()&&site.findings.length).forEach(site=>{
    const observations=EXTRACTION_SOCKET_FINDINGS.filter(item=>site.findings.includes(item.id)).map(item=>item.he);
    if(observations.length)clinicalFindings.push(sentence(`באזור מכתשית עקירה ${site.region.trim()}: ${observations.join("; ")}`));
  });
  if(examination.oralCavityNormal)clinicalFindings.push("בבדיקת חלל הפה לא נמצאו ממצאים פתולוגיים.");
  const deposits=ORAL_DEPOSITS.filter(item=>(examination.oralDeposits??[]).includes(item.id)).map(item=>item.he);
  if(deposits.length)clinicalFindings.push(sentence(deposits.join("; ")));
  if (draft.edentulous.includes("upper")) clinicalFindings.push("חוסר שיניים מלא בלסת העליונה.");
  if (draft.edentulous.includes("lower")) clinicalFindings.push("חוסר שיניים מלא בלסת התחתונה.");
  aggregateClinicalFindings(draft).forEach(group=>clinicalFindings.push(group.text));
  clinicalFindings.push(...toothSpecificClinicalDetails(draft));
  const dentureKinds={complete:"תותבת שלמה",partial:"תותבת חלקית",flipper:"פליפר","implant-supported":"תותבת נתמכת שתלים"} as const;
  (draft.existingDentures??[]).forEach(item=>{const region=item.jaw==="upper"?"בלסת העליונה":"בלסת התחתונה";const findings:string[]=DENTURE_FINDINGS.filter(f=>item.findings.includes(f.id)).map(f=>f.he);if(item.notes?.trim())findings.push(item.notes.trim());if(findings.length)clinicalFindings.push(sentence(`${dentureKinds[item.kind]} קיימת ${region}: ${[...new Set(findings)].join("; ")}`))});

  (draft.regionalClinicalFindings??[]).filter(item=>item.clinicianConfirmed).forEach(item=>clinicalFindings.push(sentence(`${item.region==="lower-left"?"באזור הרטרומולרי השמאלי התחתון":item.region==="lower-right"?"באזור הרטרומולרי הימני התחתון":item.region==="upper-left"?"באזור הרטרומולרי השמאלי העליון":"באזור הרטרומולרי הימני העליון"}: ${item.id==="retromolar-tender-fold"?"קפל רירית רגיש במישוש":"לא נצפו סימני דלקת"}`)));
  const missing = Object.values(draft.teeth).filter(tooth => tooth.missing && !draft.edentulous.includes(tooth.number<30?"upper":"lower")).map(tooth => String(tooth.number));
  if (missing.length) clinicalFindings.push(sentence(`שיניים ${hebrewList(missing)} חסרות`));
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
  const firstPlan=groupTreatments(allTreatments.filter(treatment => treatment.status !== "completed" && treatment.status !== "cancelled")).map(group=>`${TREATMENT_STATUS[group[0].status]} ${groupedTreatmentText(group)}`);
  const secondPlan=groupTreatments((draft.alternativeTreatments??[]).filter(treatment=>treatment.status!=="cancelled")).map(group=>groupedTreatmentText(group));
  if(secondPlan.length){if(firstPlan.length)plan.push(`תוכנית טיפול 1: ${firstPlan.join("; ")}`);plan.push(`תוכנית טיפול 2: ${secondPlan.join("; ")}`)}else plan.push(...firstPlan);
  if(draft.treatmentOptions?.confirmed){const o=draft.treatmentOptions;if(!secondPlan.length&&o.first.trim())plan.push(`אפשרות טיפול ראשונה: ${o.first.trim()}`);if(!secondPlan.length&&o.second.trim())plan.push(`אפשרות טיפול שנייה: ${o.second.trim()}`);if(o.decision==="no-treatment")plan.push("המטופל אינו מעוניין בטיפול בשלב זה");if(o.decision==="first"&&o.first.trim())plan.push("המטופל בחר באפשרות הטיפול הראשונה");if(o.decision==="second"&&(secondPlan.length||o.second.trim()))plan.push("המטופל בחר באפשרות הטיפול השנייה");}
  else draft.alternatives.map(alternativeText).filter((value): value is string => Boolean(value)).forEach(value => plan.push(value));
  (draft.labConstructions ?? []).map(labConstructionText).forEach(value => plan.push(value));
  (draft.labOrders ?? []).map(labOrderRemakeText).filter((value): value is string => Boolean(value)).forEach(value=>plan.push(value));
  (draft.labOrders ?? []).map(labOrderInstructionText).filter((value): value is string => Boolean(value)).forEach(value=>plan.push(value));
  (draft.externalProcedureDependencies ?? []).map(dependencyText).forEach(value=>plan.push(value));
  (draft.patientDecisions ?? []).map(patientDecisionText).filter((value): value is string => Boolean(value)).forEach(value => plan.push(value));
  plan.push(...(firstAid.get("recommendation") ?? []), ...(firstAid.get("counseling") ?? []));
  if (plan.length) sections.push(`תוכנית טיפול והמלצות:\n${sentence(unique(plan).map(value=>value.trim().replace(/[.;]+$/u,"")).join("; "))}`);

  const letters=(draft.labLetters??[]).map(letter=>generateLabLetter(draft,letter.teeth,letter.text)).filter(Boolean);
  if(letters.length)sections.push(`הוראות למעבדה:\n${letters.join("\n")}`);
  return cleanOutput(sections.join("\n\n"));
}
