import type { ExternalProcedureDependency, LabConstruction, LabOrder, LabStage, MedicationRecord, MedicationSafetyReview, PatientDecision } from "./types";

const sentence=(value:string)=>`${value.trim().replace(/[.;]+$/u,"")}.`;
const list=(values:Array<string|number>)=>new Intl.ListFormat("he",{style:"long",type:"conjunction"}).format(values.map(String));
const statusHe={proposed:"הוצע",ordered:"הוזמן מהמעבדה","in-progress":"נמצא בביצוע במעבדה",completed:"הושלם",remake:"נשלח לביצוע מחדש",deferred:"נדחה"} as const;
const stageHe:Record<LabStage["kind"],string>={impressions:"לקיחת מטבעים","bite-registration":"רישום סגר","shade-selection":"בחירת גוון","metal-try-in":"מדידת מתכת","framework-try-in":"מדידת שלד","pfz-framework-try-in":"מדידת שלד PFZ","osseointegration-check":"בדיקת אוסאואינטגרציה",delivery:"מסירה",adjustment:"התאמה"};

export function labConstructionText(item:LabConstruction):string{
  if(item.kind==="bridge"){
    const abutments=item.abutments.map(value=>`שן ${value.toothPosition} מאחזת${value.mobility==="mobile"?" ניידת":value.mobility==="stable"?" יציבה":""}`);
    const details=[`עמדות ${list(item.toothPositions)}`,abutments.length?list(abutments):"",item.pontics.length?`יחידות ביניים ${list(item.pontics)}`:"",`סוג תמיכה ${item.supportType}`,`חומר ${item.material}`,item.shade?`גוון ${item.shade}`:"",item.permanence==="temporary"?"מבנה זמני":"מבנה קבוע",item.constructionMobility==="mobile"?"ניידות של הגשר כולו":item.constructionMobility==="stable"?"הגשר יציב":""].filter(Boolean);
    return sentence(`${statusHe[item.status]} גשר: ${details.join("; ")}`);
  }
  const impressions=item.impressions.status==="completed"&&item.impressions.clinicianConfirmed?"המטבעים בוצעו ואושרו":item.impressions.status==="planned"?"המטבעים מתוכננים":"המטבעים טרם בוצעו";
  const prosthesisLabel=item.prosthesisType==="complete"?"תותבת שלמה נשלפת":item.prosthesisType==="implant-supported"?"תותבת על נתמכת שתלים":item.immediate?"תותבת מיידית":item.prosthesisType.startsWith("partial")?"תותבת חלקית נשלפת":"פליפר זמני";
  const details=[`${prosthesisLabel} ללסת ${item.jaw==="upper"?"העליונה":"התחתונה"}`,item.includeReplacedTeethInText&&item.prosthesisType.startsWith("partial")&&item.replacedTeeth.length?`שיניים להשלמה ${list(item.replacedTeeth)}`:"",`חומר ${item.material}`,item.shade?`גוון ${item.shade}`:"",impressions].filter(Boolean);
  return sentence(`${statusHe[item.status]} שיקום נשלף: ${details.join("; ")}`);
}

export function completedLabStageText(stage:LabStage):string|null{return stage.status==="completed"&&stage.clinicianConfirmed?sentence(`שלב מעבדתי שבוצע ואושר: ${stageHe[stage.kind]}${stage.notes?`; ${stage.notes}`:""}`):null}

const defectHe:Record<LabOrder["defects"][number],string>={"missing-vestibular-plate":"חסרה פלטה וסטיבולרית",fit:"אי התאמה",shade:"אי התאמת גוון",occlusion:"אי התאמת סגר",fracture:"שבר",other:"פגם אחר"};
export function labOrderRemakeText(order:LabOrder):string|null{if(order.stage!=="remake"&&order.status!=="remake")return null;const details=[order.remakeReason?.trim()??"",...order.defects.map(defect=>defectHe[defect])].filter(Boolean);return sentence(`הזמנת מעבדה ${order.id} נשלחה לביצוע מחדש${details.length?`: ${details.join("; ")}`:""}`)}

export function labOrderInstructionText(order:LabOrder):string|null{return order.omitPalatalPorcelain?"נא לא לצפות את המשטח הפלטינלי בחרסינה.":null}

export function patientDecisionText(decision:PatientDecision):string|null{
  if(!decision.label.trim())return null;
  const base=decision.status==="accepted"?`המטופל בחר: ${decision.label.trim()}`:decision.status==="refused"?`המטופל סירב: ${decision.label.trim()}`:`החלטת המטופל ממתינה: ${decision.label.trim()}`;
  const details=[base,decision.documentedExplanation?"תועד הסבר למטופל":"",decision.risksExplained?"הסיכונים הוסברו":"",decision.alternativesExplained?"החלופות הוסברו":"",decision.status==="refused"&&decision.refusalReason?.trim()?`סיבת הסירוב: ${decision.refusalReason.trim()}`:"",decision.status==="pending"&&decision.treatmentDeferred?"הטיפול נדחה עד לקבלת החלטה":"",decision.decisionDate?`תאריך החלטה ${decision.decisionDate}`:""].filter(Boolean);
  return details.join(", ");
}

const medicationStatus:Record<MedicationRecord["status"],string>={prescribed:"נרשם מרשם",administered:"ניתנה תרופה",recommended:"הומלץ טיפול תרופתי"};
const allergy:Record<MedicationRecord["allergyCheck"],string>={"not-checked":"מצב אלרגיות לא נבדק","no-known-allergy":"נבדק: ללא אלרגיה ידועה לתרופה","allergy-present":"קיימת אלרגיה מתועדת"};
export function medicationText(item:MedicationRecord):string|null{if(!item.name.trim())return null;const alternative=item.penicillinAllergyAlternative?(item.clinicianSelectionConfirmed?"נבחרה חלופה עקב אלרגיה מתועדת לפניצילין":"הבחירה כחלופה לאלרגיה לפניצילין טרם אושרה על ידי רופא"):"";const details=[item.concentration?`ריכוז ${item.concentration}`:"",item.dose?`מנה ${item.dose}`:"",item.route?`דרך מתן ${item.route}`:"",item.frequency?`תדירות ${item.frequency}`:"",item.duration?`משך ${item.duration}`:"",allergy[item.allergyCheck],alternative,item.unknownDetails?"פרטי הטיפול התרופתי אינם ידועים במלואם":"",item.notes??""].filter(Boolean);return sentence(`${medicationStatus[item.status]}: ${item.name.trim()}${details.length?`; ${details.join("; ")}`:""}`)}

const medicationRiskHe:Record<MedicationSafetyReview["riskFlags"][number],string>={osteoporosis:"אוסטאופורוזיס","antiresorptive-therapy":"טיפול אנטי-רסורפטיבי",anticoagulation:"טיפול נוגד קרישה",allergy:"אלרגיה",oncology:"רקע אונקולוגי",pregnancy:"הריון",other:"גורם סיכון אחר"};
export function medicationSafetyText(review:MedicationSafetyReview):string{const state=review.medicationsStatus==="known"?"הטיפול התרופתי ידוע ותועד":review.medicationsStatus==="unknown"?"היסטוריית הטיפול התרופתי אינה ידועה":"היסטוריית הטיפול התרופתי טרם נבדקה";const risks=review.riskFlags.length?`; גורמי סיכון מתועדים: ${list(review.riskFlags.map(flag=>medicationRiskHe[flag]))}`:"";const action=review.requiredClinicalReview?(review.completionStatus==="completed"&&review.clinicianConfirmed?"; הבדיקה הקלינית הנדרשת הושלמה ואושרה":"; נדרשת בדיקה קלינית לפני המשך טיפול רלוונטי"):"";return sentence(`${state}${risks}${action}`)}

const dependencyHe:Record<ExternalProcedureDependency["procedureType"],string>={extraction:"עקירה",endodontics:"טיפול אנדודונטי","implant-placement":"השתלה",healing:"ריפוי ואוסאואינטגרציה","prosthetic-clearance":"אישור לשלב השיקומי"};
export function dependencyText(item:ExternalProcedureDependency):string{const confirmed=item.verification==="clinician-confirmed"?"מאומת על ידי רופא":"טרם אומת";return sentence(`תלות בטיפול חיצוני: ${dependencyHe[item.procedureType]}, סטטוס ${item.status}, ${confirmed}`)}
