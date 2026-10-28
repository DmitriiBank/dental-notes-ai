import type { ClinicalDraft, ValidationIssue } from "./types";
import { scheduleAppointments } from "./appointment-rules";

export function validateDraft(d: ClinicalDraft): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (id: string, severity: ValidationIssue["severity"], message: string) => issues.push({ id, severity, message });
  Object.values(d.teeth).forEach(t => {
    if (t.missing && (t.findings.length || t.treatments.some(x => !["implant-consult"].includes(x.kind)))) add(`missing-${t.number}`, "blocking", `Зуб ${t.number}: отсутствующий естественный зуб содержит несовместимые данные.`);
    if (t.findings.some(f => f.includes("caries")) && !t.surfaces.length) add(`surface-${t.number}`, "review", `Зуб ${t.number}: для кариеса не выбраны поверхности.`);
    const crown = t.treatments.find(x => x.kind.includes("crown") && ["planned", "recommended"].includes(x.status));
    const rct = t.treatments.find(x => ["rct", "retreatment"].includes(x.kind) && x.status !== "completed");
    if (crown && rct) add(`sequence-${t.number}`, "blocking", `Зуб ${t.number}: до коронки требуется завершить эндодонтический этап и повторно оценить восстановимость.`);
  });
  if (!d.examination.normalsConfirmed && [d.examination.extraoral, d.examination.softTissues, d.examination.occlusion, d.examination.periodontal].some(Boolean)) add("normals", "review", "Нормальные значения требуют подтверждения врача.");
  d.imaging.forEach(x => { if (x.findings.length && x.status !== "reviewed") add(`image-${x.id}`, "blocking", "Рентгенологическое заключение допустимо только после просмотра исследования."); });
  d.alternatives.filter(a => a.decision === "selected" && !a.offered).forEach(a => add(`alt-${a.id}`, "blocking", "Выбранный пациентом вариант не отмечен как предложенный."));
  scheduleAppointments(d).filter(a => a.duration === null).forEach(a => add(`duration-${a.id}`, "review", "Длительность одного из приемов не утверждена — укажите ее вручную."));
  return issues;
}
