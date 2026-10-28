import type { Appointment, ClinicalDraft, Treatment } from "./types";
import { areAdjacent, sameSide } from "./teeth";

const EXTERNAL = new Set(["extraction", "surgical-extraction", "rct", "retreatment", "endo-consult", "implant-consult", "implant-placement", "bone-augmentation", "sinus-lift", "periodontal-consult", "hygienist"]);
const DENTURES = new Set(["complete-denture", "partial-denture"]);

export function scheduleAppointments(draft: ClinicalDraft): Appointment[] {
  const all = [...Object.values(draft.teeth).flatMap(t => t.treatments), ...draft.generalTreatments]
    .filter(t => ["recommended", "planned"].includes(t.status) && t.provider !== "external" && !EXTERNAL.has(t.kind));
  const result: Appointment[] = [];
  const scheduledTreatmentIds = new Set<string>();
  const fillings = all.filter(t => ["filling", "filling-replacement"].includes(t.kind) && t.tooth) as (Treatment & {tooth:number})[];
  fillings.forEach(t => scheduledTreatmentIds.add(t.id));
  const buccal = fillings.filter(f => f.buccalOnly || (f.surfaces?.length === 1 && f.surfaces[0] === "B"));
  const standard = fillings.filter(f => !buccal.includes(f));

  for (let i = 0; i < standard.length; i += 3) {
    const group = standard.slice(i, i + 3);
    let duration: number | null = 30;
    if (group.length === 2) duration = areAdjacent(group[0].tooth, group[1].tooth) ? 45 : null;
    if (group.length === 3) duration = sameSide(group.map(x => x.tooth)) ? 60 : null;
    result.push({ id: `fillings-${i}`, duration, source: "fillings", editable: duration === null });
  }
  for (let i = 0; i < buccal.length; i += 4) {
    const group = buccal.slice(i, i + 4);
    const duration = group.length === 4 ? null : group.length === 1 ? 30 : null;
    result.push({ id: `buccal-${i}`, duration, source: "buccal-fillings", editable: true });
  }

  all.filter(t => t.kind === "core").forEach((t, i) => { scheduledTreatmentIds.add(t.id); result.push({ id: `core-${i}`, duration: 30, source: "core", editable: false }); });
  const dentureTreatments = all.filter(t => DENTURES.has(t.kind));
  dentureTreatments.forEach(t => scheduledTreatmentIds.add(t.id));
  const dentureCount = dentureTreatments.length;
  if (dentureCount) [30,30,60,30,30].forEach((duration, i) => result.push({ id: `denture-${i}`, duration, source: "denture", editable: false }));
  all.filter(t => t.kind === "immediate-denture").forEach((t, i) => {
    scheduledTreatmentIds.add(t.id);
    if (t.stage && t.stage > 1) result.push({ id: `immediate-${i}`, duration: null, source: t.kind, editable: true });
  });
  all.filter(t => !scheduledTreatmentIds.has(t.id) && t.kind !== "observation").forEach(t => {
    result.push({ id: `unconfigured-${t.id}`, duration: null, source: t.kind, editable: true });
  });
  return result.map(a => ({ ...a, duration: draft.customDurations[a.id] ?? a.duration }));
}

export const appointmentLines = (appointments: Appointment[]) => appointments
  .filter(a => a.duration !== null)
  .map((a, i) => `תור ${i + 1}: ${a.duration} דקות`).join("\n");
