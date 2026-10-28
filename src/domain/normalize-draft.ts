import type { ClinicalDraft } from "./types";

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
  Object.values(draft.teeth).forEach(tooth=>{tooth.complaints??=[]});
  return draft;
}
