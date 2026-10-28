export type Jaw = "upper" | "lower";
export type Surface = "M" | "D" | "O" | "B" | "P" | "L" | "I" | "C";
export type ProcedureStatus = "recommended" | "planned" | "completed" | "cancelled" | "refused";
export type ImagingStatus = "recommended" | "performed" | "reviewed" | "refused";
export type Severity = "blocking" | "review" | "info";

export interface ToothState {
  number: number;
  missing: boolean;
  findings: string[];
  surfaces: Surface[];
  symptoms: string[];
  treatments: Treatment[];
  notes?: string;
}

export interface ImplantState {
  id: string;
  region: string;
  findings: string[];
}

export interface Treatment {
  id: string;
  kind: string;
  status: ProcedureStatus;
  tooth?: number;
  surfaces?: Surface[];
  buccalOnly?: boolean;
  stage?: number;
  material?: string;
  shade?: string;
  provider?: "self" | "external";
  jaw?: Jaw;
  quantity?: number;
}

export interface Alternative {
  id: string;
  tooth?: number;
  label: string;
  offered: boolean;
  feasible: boolean;
  risksExplained: boolean;
  prognosisDiscussed: boolean;
  decision: "selected" | "refused" | "pending";
}

export interface Imaging {
  id: string;
  kind: string;
  status: ImagingStatus;
  target?: string;
  findings: string[];
  notes?: string;
}

export interface Examination {
  complaint: string;
  extraoral: string;
  softTissues: string;
  occlusion: string;
  hygiene: string;
  periodontal: string;
  details: string[];
  normalsConfirmed: boolean;
  medicalFlags: string[];
}

export interface ClinicalDraft {
  examination: Examination;
  teeth: Record<number, ToothState>;
  implants: ImplantState[];
  imaging: Imaging[];
  alternatives: Alternative[];
  generalTreatments: Treatment[];
  edentulous: Jaw[];
  customDurations: Record<string, number>;
  firstAidSelections: FirstAidSelection[];
  selectedMaccabiCodes: Record<string, string>;
  eligibility: { ageGroup: "unknown" | "under18" | "adult" | "over75" | "over80"; contractCategory?: string; verified: boolean };
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  duration: number | null;
  source: string;
  editable: boolean;
}

export interface ValidationIssue {
  id: string;
  severity: Severity;
  message: string;
}

export interface TemplateVariables {
  tooth?: number;
  surfaces?: Surface[];
  region?: string;
  shade?: string;
  material?: string;
}

export interface FirstAidSelection {
  phraseId: string;
  vars: TemplateVariables;
  confirmed: boolean;
}

export type CodeVerificationStatus = "verified-snapshot" | "needs-review" | "unverified";

export interface MaccabiCodeCandidate {
  treatmentId: string;
  shortCode: string;
  catalogNumber: string;
  descriptionHe: string;
  sourceVersion: string;
  procedureStatus: ProcedureStatus;
  providerRole: "self" | "external";
  verificationStatus: CodeVerificationStatus;
  toothOrJaw: string;
  quantity: number;
  selected: boolean;
  clarification?: string;
}
