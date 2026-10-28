import type { ClinicalDraft, ValidationIssue } from "./types";
import { scheduleAppointments } from "./appointment-rules";
import { selectMaccabiCodeCandidates } from "./maccabi-codes";
import { validateStructuredEntities } from "./structured-validation";
import { PERIAPICAL_NORMAL_FINDING, PERIAPICAL_PATHOLOGY_FINDINGS } from "./radiographic-catalog";

export function validateDraft(d: ClinicalDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (id: string, severity: ValidationIssue["severity"], message: string) => issues.push({ id, severity, message });
  validateStructuredEntities(d).forEach((message,index)=>add(`structured-schema-${index}`,"blocking",`Некорректная структурированная запись: ${message}`));
  Object.values(d.teeth).forEach(t => {
    if (t.missing && (t.findings.length || t.treatments.some(x => !["implant-consult"].includes(x.kind)))) add(`missing-${t.number}`, "blocking", `Зуб ${t.number}: отсутствующий естественный зуб содержит несовместимые данные.`);
    if (t.findings.some(f => f.includes("caries")) && !t.surfaces.length) add(`surface-${t.number}`, "review", `Зуб ${t.number}: для кариеса не выбраны поверхности.`);
    if(t.findings.includes("intact")&&t.findings.some(f=>f!=="intact"))add(`intact-conflict-${t.number}`,"blocking",`Зуб ${t.number}: клиническая норма несовместима с выбранной патологической находкой.`);
    const crown = t.treatments.find(x => x.kind.includes("crown") && ["planned", "recommended"].includes(x.status));
    const rct = t.treatments.find(x => ["rct", "retreatment"].includes(x.kind) && x.status !== "completed");
    if (crown && rct) add(`sequence-${t.number}`, "blocking", `Зуб ${t.number}: до коронки требуется завершить эндодонтический этап и повторно оценить восстановимость.`);
    t.treatments.filter(treatment=>treatment.tooth!==undefined&&treatment.tooth!==t.number).forEach(treatment=>add(`tooth-mismatch-${t.number}-${treatment.id}`,"blocking",`Лечение сохранено у зуба ${t.number}, но внутри назначения указан зуб ${treatment.tooth}.`));
  });
  if (!d.examination.normalsConfirmed && [d.examination.extraoral, d.examination.softTissues, d.examination.occlusion, d.examination.periodontal].some(Boolean)) add("normals", "review", "Нормальные значения требуют подтверждения врача.");
  d.imaging.forEach(x => {
    if (x.findings.length && x.status !== "reviewed") add(`image-${x.id}`, "blocking", "Рентгенологическое заключение допустимо только после просмотра исследования.");
    if(x.findings.includes(PERIAPICAL_NORMAL_FINDING)&&x.findings.some(finding=>PERIAPICAL_PATHOLOGY_FINDINGS.has(finding)))add(`image-periapical-conflict-${x.id}`,"blocking","Нельзя одновременно указать отсутствие изменений и патологическую находку в периапикальных тканях.");
  });
  d.alternatives.filter(a => a.decision === "selected" && !a.offered).forEach(a => add(`alt-${a.id}`, "blocking", "Выбранный пациентом вариант не отмечен как предложенный."));
  (d.patientDecisions ?? []).forEach(decision=>{
    const linked=treatmentsFor(d).some(item=>item.id===decision.offeredProcedureId)||d.imaging.some(item=>item.id===decision.offeredProcedureId)||d.firstAidSelections.some(item=>item.phraseId===decision.offeredProcedureId);
    if(!linked)add(`decision-link-${decision.id}`,"blocking","Решение пациента не связано с конкретной предложенной процедурой или диагностикой.");
    if(!decision.documentedExplanation&&(decision.risksExplained||decision.alternativesExplained))add(`decision-explanation-${decision.id}`,"blocking","Риски или альтернативы нельзя отметить без подтвержденного документированного объяснения.");
  });
  (d.medications ?? []).forEach(medication => {
    if (!medication.name.trim()) add(`medication-name-${medication.id}`, "blocking", "Для лекарственной записи необходимо явно указать название препарата.");
    if (medication.allergyCheck === "not-checked") add(`medication-allergy-${medication.id}`, "review", "Проверка лекарственной аллергии не подтверждена.");
    if (medication.penicillinAllergyAlternative && !medication.clinicianSelectionConfirmed) add(`medication-alternative-${medication.id}`, "blocking", "Антибиотик при аллергии на пенициллин требует явного подтверждения выбора врачом.");
  });
  (d.consultations??[]).forEach(item=>{if(item.target.kind==="teeth"&&!item.target.teeth.length)add(`consultation-target-${item.id}`,"blocking","Для консультации необходимо выбрать хотя бы один зуб или другой объект направления.");if(item.status==="completed"&&!item.completionConfirmed)add(`consultation-completion-${item.id}`,"blocking","Завершенная консультация требует явного подтверждения врача.");});
  const performed=d.performedActs??[];const performedIds=new Set(performed.map(item=>item.id));if(performedIds.size!==performed.length)add("performed-duplicate-id","blocking","В выполненном лечении обнаружены повторяющиеся идентификаторы записей.");
  performed.forEach(item=>{if(item.category==="restorative"&&item.target.type!=="tooth")add(`performed-target-${item.id}`,"blocking","Терапевтический этап требует точной привязки к зубу.");if(item.category==="fixed"&&item.target.type!=="tooth"&&item.target.type!=="construction")add(`performed-target-${item.id}`,"blocking","Фиксированный этап требует привязки к зубу или лабораторной конструкции.");if(item.category==="removable"&&!['flipper-impression','flipper-delivery','flipper-adjustment'].includes(item.kind)&&item.target.type!=="jaw"&&item.target.type!=="construction")add(`performed-jaw-${item.id}`,"blocking","Этап съемного протезирования требует челюсть или конструкцию.");});
  (d.clinicalDiscussions??[]).forEach(item=>item.relatedActIds.filter(id=>!performedIds.has(id)).forEach(id=>add(`discussion-link-${item.id}-${id}`,"review","Обсуждение связано с отсутствующей записью выполненного лечения.")));
  const treatments=treatmentsFor(d);
  treatments.filter(item=>["complete-denture","partial-denture","immediate-denture","overdenture"].includes(item.kind)&&!item.jaw).forEach(item=>add(`denture-jaw-${item.id}`,"blocking","Для съемного протеза необходимо явно выбрать верхнюю или нижнюю челюсть."));
  const invasiveKinds=new Set(["extraction","surgical-extraction","implant-placement","bone-augmentation","sinus-lift"]);
  const invasive=treatments.some(treatment=>["planned","recommended"].includes(treatment.status)&&invasiveKinds.has(treatment.kind));
  const osteoporosis=d.examination.medicalFlags.some(flag=>/osteoporosis|אוסטאופורוזיס|остеопороз/ui.test(flag))||(d.medicationSafetyReviews??[]).some(review=>review.riskFlags.includes("osteoporosis"));
  const safetyReview=(d.medicationSafetyReviews??[]).find(review=>review.riskFlags.includes("osteoporosis"));
  if(osteoporosis&&(!safetyReview||safetyReview.medicationsStatus!=="known"||safetyReview.completionStatus!=="completed"||!safetyReview.clinicianConfirmed))add("medication-review-osteoporosis",invasive?"blocking":"review",invasive?"Перед инвазивным лечением при остеопорозе требуется выяснить препараты и завершить подтвержденную клиническую проверку.":"При остеопорозе требуется уточнить лекарственный анамнез; конкретный препарат или противопоказание не предполагаются.");
  const constructions=d.labConstructions??[];const orders=d.labOrders??[];
  const constructionById=new Map(constructions.map(item=>[item.constructionId,item]));
  orders.forEach(order=>{
    const construction=constructionById.get(order.constructionId);
    if(!construction){add(`lab-order-construction-${order.id}`,"blocking","Лабораторный заказ не связан с существующей конструкцией.");return;}
    const plan=treatments.find(item=>item.id===order.treatmentPlanId);
    if(!plan||construction.treatmentPlanId!==order.treatmentPlanId)add(`lab-order-plan-${order.id}`,"blocking","Лабораторный заказ не совпадает со связанным планом лечения.");
    const positions=construction.kind==="bridge"?construction.toothPositions:construction.replacedTeeth;
    const abutments=construction.kind==="bridge"?construction.abutments.map(value=>value.toothPosition):[];
    const support=construction.kind==="bridge"?construction.supportType:"removable";
    if(!sameNumbers(order.toothPositions,positions))add(`lab-order-positions-${order.id}`,"blocking","Позиции зубов в лабораторном заказе не совпадают с конструкцией.");
    if(!sameNumbers(order.abutments,abutments))add(`lab-order-abutments-${order.id}`,"blocking","Опоры в лабораторном заказе не совпадают с конструкцией.");
    if(order.supportType!==support)add(`lab-order-support-${order.id}`,"blocking","Тип опоры в лабораторном заказе не совпадает с конструкцией.");
    if(order.material.trim()!==construction.material.trim())add(`lab-order-material-${order.id}`,"blocking","Материал в лабораторном заказе не совпадает с конструкцией.");
    if(order.selectedCode){const candidates=selectMaccabiCodeCandidates(d).filter(item=>item.treatmentId===order.treatmentPlanId);if(!candidates.some(item=>item.shortCode===order.selectedCode&&item.selected))add(`lab-order-code-${order.id}`,"blocking","Код в лабораторном заказе не совпадает с выбранным кодом плана лечения.");}
    order.stages.filter(stage=>stage.status==="completed"&&!stage.clinicianConfirmed).forEach(stage=>add(`lab-stage-confirmation-${stage.id}`,"blocking","Завершенный лабораторный этап требует явного подтверждения врача."));
  });
  constructions.filter(item=>item.kind==="bridge"&&item.pontics.length>=2).forEach(item=>add(`bridge-two-pontics-${item.constructionId}`,"review","Конструкция с двумя или более понтиками требует ручной клинической и тарифной проверки; код автоматически не выбирается."));
  const dependencies=d.externalProcedureDependencies??[];
  constructions.forEach(item=>{if(item.kind!=="removable-prosthesis"||!item.immediate||!item.extractionDependencies.length||!["ordered","in-progress","completed"].includes(item.status))return;const refs=item.extractionDependencies.map(id=>dependencies.find(value=>value.id===id));const validRefs=refs.every(value=>value?.procedureType==="extraction");if(!validRefs)add(`extraction-dependency-${item.constructionId}`,"blocking","Немедленный протез содержит некорректную зависимость от удаления.");if(item.impressions.status!=="completed"||!item.impressions.clinicianConfirmed)add(`impressions-before-extraction-${item.constructionId}`,"blocking","Для выбранной последовательности немедленного протеза слепки должны быть выполнены и подтверждены до внешнего удаления.");});
  constructions.filter(item=>item.kind==="removable-prosthesis"&&item.prosthesisType==="implant-supported"&&!["proposed","deferred"].includes(item.status)).forEach(item=>{const clearance=dependencies.find(value=>value.linkedTreatmentPlanId===item.treatmentPlanId&&value.procedureType==="prosthetic-clearance"&&value.status==="completed"&&value.verification==="clinician-confirmed");if(!clearance)add(`prosthetic-clearance-${item.constructionId}`,"blocking","Протезирование на имплантах требует отдельного подтвержденного врачом допуска после заживления; прошедшее время не считается подтверждением.");});
  (d.mentorChecklists??[]).forEach(checklist=>{if(checklist.items.some(item=>item.completed&&!item.clinicianConfirmed))add(`mentor-confirmation-${checklist.id}`,"review","Отмеченный пункт mentor checklist требует подтверждения врача.");if(checklist.approvalStatus==="not-reviewed")add(`mentor-source-${checklist.id}`,"info","Mentor checklist основан на локально сообщенных правилах и не подтвержден учреждением.");});
  scheduleAppointments(d).filter(a => a.duration === null).forEach(a => add(`duration-${a.id}`, "review", "Длительность одного из приемов не утверждена — укажите ее вручную."));
  const codes=selectMaccabiCodeCandidates(d);const byTreatment=new Map<string,typeof codes>();codes.forEach(code=>byTreatment.set(code.treatmentId,[...(byTreatment.get(code.treatmentId)??[]),code]));
  byTreatment.forEach((items,treatmentId)=>{if(items.some(item=>item.shortCode==="UNVERIFIED"))add(`code-unverified-${treatmentId}`,"review","Для процедуры нет подтвержденного кода MaccabiDent.");if(items.some(item=>item.eligibilityStatus==="needs_review"))add(`code-eligibility-${treatmentId}`,"review","Eligibility или договорная применимость кода не подтверждена — требуется ручная проверка.");if(items.length>1&&!items.some(item=>item.selected))add(`code-choice-${treatmentId}`,"review","Для процедуры найдено несколько кодов MaccabiDent — требуется выбор врача.");});
  return issues;
}

const treatmentsFor=(d:ClinicalDraft)=>[...Object.values(d.teeth).flatMap(tooth=>tooth.treatments),...d.generalTreatments];
const sameNumbers=(left:number[],right:number[])=>JSON.stringify([...left].sort((a,b)=>a-b))===JSON.stringify([...right].sort((a,b)=>a-b));
