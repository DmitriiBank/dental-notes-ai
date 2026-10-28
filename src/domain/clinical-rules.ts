import type { ClinicalDraft, ValidationIssue } from "./types";
import { scheduleAppointments } from "./appointment-rules";
import { selectMaccabiCodeCandidates } from "./maccabi-codes";

export function validateDraft(d: ClinicalDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (id: string, severity: ValidationIssue["severity"], message: string) => issues.push({ id, severity, message });
  Object.values(d.teeth).forEach(t => {
    if (t.missing && (t.findings.length || t.treatments.some(x => !["implant-consult"].includes(x.kind)))) add(`missing-${t.number}`, "blocking", `Зуб ${t.number}: отсутствующий естественный зуб содержит несовместимые данные.`);
    if (t.findings.some(f => f.includes("caries")) && !t.surfaces.length) add(`surface-${t.number}`, "review", `Зуб ${t.number}: для кариеса не выбраны поверхности.`);
    const crown = t.treatments.find(x => x.kind.includes("crown") && ["planned", "recommended"].includes(x.status));
    const rct = t.treatments.find(x => ["rct", "retreatment"].includes(x.kind) && x.status !== "completed");
    if (crown && rct) add(`sequence-${t.number}`, "blocking", `Зуб ${t.number}: до коронки требуется завершить эндодонтический этап и повторно оценить восстановимость.`);
    t.treatments.filter(treatment=>treatment.tooth!==undefined&&treatment.tooth!==t.number).forEach(treatment=>add(`tooth-mismatch-${t.number}-${treatment.id}`,"blocking",`Лечение сохранено у зуба ${t.number}, но внутри назначения указан зуб ${treatment.tooth}.`));
  });
  if (!d.examination.normalsConfirmed && [d.examination.extraoral, d.examination.softTissues, d.examination.occlusion, d.examination.periodontal].some(Boolean)) add("normals", "review", "Нормальные значения требуют подтверждения врача.");
  d.imaging.forEach(x => { if (x.findings.length && x.status !== "reviewed") add(`image-${x.id}`, "blocking", "Рентгенологическое заключение допустимо только после просмотра исследования."); });
  d.alternatives.filter(a => a.decision === "selected" && !a.offered).forEach(a => add(`alt-${a.id}`, "blocking", "Выбранный пациентом вариант не отмечен как предложенный."));
  scheduleAppointments(d).filter(a => a.duration === null).forEach(a => add(`duration-${a.id}`, "review", "Длительность одного из приемов не утверждена — укажите ее вручную."));
  const codes=selectMaccabiCodeCandidates(d);const byTreatment=new Map<string,typeof codes>();codes.forEach(code=>byTreatment.set(code.treatmentId,[...(byTreatment.get(code.treatmentId)??[]),code]));
  byTreatment.forEach((items,treatmentId)=>{if(items.some(item=>item.shortCode==="UNVERIFIED"))add(`code-unverified-${treatmentId}`,"review","Для процедуры нет подтвержденного кода MaccabiDent.");else if(items.length>1&&!items.some(item=>item.selected))add(`code-choice-${treatmentId}`,"review","Для процедуры найдено несколько кодов MaccabiDent — требуется выбор врача.");});
  return issues;
}
