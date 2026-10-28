export type Jaw = "upper" | "lower";
export type Surface = "M" | "D" | "O" | "B" | "P" | "L" | "I" | "C";
export type ProcedureStatus = "recommended" | "planned" | "completed" | "cancelled" | "refused";
export type ImagingStatus = "recommended" | "performed" | "reviewed" | "refused";
export type Severity = "blocking" | "review" | "info";
export type LabStageKind = "impressions" | "bite-registration" | "shade-selection" | "metal-try-in" | "framework-try-in" | "pfz-framework-try-in" | "osseointegration-check" | "delivery" | "adjustment";

export interface ToothState {
  number: number;
  missing: boolean;
  findings: string[];
  surfaces: Surface[];
  symptoms: string[];
  complaints?: ComplaintSelection[];
  treatments: Treatment[];
  notes?: string;
}

export type ComplaintOnset = "today" | "days" | "weeks" | "months" | "longstanding";
export type ComplaintTrigger = "spontaneous" | "cold" | "hot" | "biting" | "sweet" | "touch" | "night";
export type ComplaintSeverity = "mild" | "moderate" | "severe";
export interface ComplaintSelection {
  complaintId: string;
  onset?: ComplaintOnset | string;
  trigger?: ComplaintTrigger | string;
  severity?: ComplaintSeverity | string;
  intensity?: string;
  pattern?: string;
  triggers?: string[];
  patientGoal?: string;
  region?: string;
}

export type ConsultationType="prosthodontic-consultant"|"restorative-dentist"|"implantologist"|"periodontist"|"endodontist"|"oral-maxillofacial-surgeon"|"oral-medicine-specialist"|"orthodontist"|"hygienist";
export type ConsultationReason="implant-planning"|"questionable-restorability"|"endodontic-pathology"|"periodontal-evaluation"|"complex-prosthetic-rehabilitation"|"second-opinion";
export type ConsultationTarget={kind:"teeth";teeth:number[]}|{kind:"jaw";jaw:Jaw}|{kind:"plan"};
export interface ConsultationReferral {id:string;type:ConsultationType;target:ConsultationTarget;reasons:ConsultationReason[];status:"recommended"|"scheduled"|"completed"|"refused";completionConfirmed:boolean}

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
  constructionId?: string;
  includeReplacedTeethInText?: boolean;
  replacedTeeth?: number[];
  followUpDays?: 3 | 7 | 14 | 30;
  canalCount?: 1 | 2 | 3 | 4;
  crownMaterial?: "pfm" | "other";
  removalMethod?: "adapt-old-as-temporary" | "cut-crown-or-bridge";
  sinusLiftMethod?: "open" | "closed";
  relineKind?: "soft-chairside" | "soft-laboratory" | "hard-chairside" | "hard-laboratory";
  overdentureAttachment?: "ball" | "bar";
  implantCount?: 2 | 3 | 4;

}

export interface Alternative {
  id: string;
  tooth?: number;
  label: string;
  offered: boolean;
  feasible: boolean;
  risksExplained: boolean;
  prognosisDiscussed: boolean;
  decision: "selected" | "refused" | "pending" | "deferred";
  discussionConfirmed?: boolean;
}

interface PatientDecisionBase {
  id: string;
  offeredProcedureId: string;
  label: string;
  documentedExplanation: boolean;
  risksExplained: boolean;
  alternativesExplained: boolean;
  decisionDate?: string;
}
export type PatientDecision =
  | (PatientDecisionBase & { status: "accepted" })
  | (PatientDecisionBase & { status: "refused"; refusalReason?: string })
  | (PatientDecisionBase & { status: "pending"; treatmentDeferred: boolean });

export interface MedicationRecord {
  id: string;
  presetId?: "augmentin-500-125" | "augmentin-875-125" | "azithromycin-penicillin-allergy" | "corsodyl-gel" | "ibuprofen-prn";
  name: string;
  concentration?: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  allergyCheck: "not-checked" | "no-known-allergy" | "allergy-present";
  status: "prescribed" | "administered" | "recommended";
  unknownDetails?: boolean;
  notes?: string;
  penicillinAllergyAlternative?: boolean;
  clinicianSelectionConfirmed?: boolean;
}

export interface BridgeAbutment {
  toothPosition: number;
  mobility: "unknown" | "stable" | "mobile";
}

export interface DentalBridge {
  kind: "bridge";
  constructionId: string;
  treatmentPlanId: string;
  toothPositions: number[];
  abutments: BridgeAbutment[];
  pontics: number[];
  supportType: "tooth-supported" | "implant-supported" | "mixed" | "unknown";
  material: string;
  permanence: "temporary" | "permanent";
  constructionMobility: "unknown" | "stable" | "mobile";
  shade?: string;
  status: "proposed" | "ordered" | "in-progress" | "completed" | "remake" | "deferred";
  notes?: string;
}

export interface LabStage {
  id: string;
  kind: LabStageKind;
  status: "planned" | "completed" | "deferred";
  clinicianConfirmed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface RemovableProsthesis {
  kind: "removable-prosthesis";
  constructionId: string;
  treatmentPlanId: string;
  prosthesisType: "flipper" | "partial-acrylic" | "partial-cast" | "complete" | "implant-supported";
  jaw: Jaw;
  replacedTeeth: number[];
  immediate: boolean;
  material: string;
  shade?: string;
  impressions: { status: "not-taken" | "planned" | "completed"; clinicianConfirmed: boolean; completedAt?: string };
  extractionDependencies: string[];
  deliveryStage: "not-planned" | "planned" | "completed" | "deferred";
  adjustmentStages: LabStage[];
  status: "proposed" | "ordered" | "in-progress" | "completed" | "remake" | "deferred";
  includeReplacedTeethInText?: boolean;
}

export type LabConstruction = DentalBridge | RemovableProsthesis;

export interface LabOrder {
  id: string;
  treatmentPlanId: string;
  constructionId: string;
  toothPositions: number[];
  abutments: number[];
  supportType: "tooth-supported" | "implant-supported" | "mixed" | "removable" | "unknown";
  shade?: string;
  material: string;
  stage: "draft" | "sent" | "returned" | "try-in" | "accepted" | "remake";
  status: "draft" | "sent" | "returned" | "accepted" | "remake";
  stages: LabStage[];
  remakeReason?: string;
  defects: Array<"missing-vestibular-plate" | "fit" | "shade" | "occlusion" | "fracture" | "other">;
  selectedCode?: string;
  notes?: string;
  omitPalatalPorcelain?: boolean;
}

interface ExternalDependencyBase {
  id: string;
  linkedTreatmentPlanId: string;
  provider: "external";
  status: "recommended" | "scheduled" | "completed";
  verification: "unverified" | "clinician-confirmed";
  completedAt?: string;
}
export type ExternalProcedureDependency =
  | (ExternalDependencyBase & { procedureType: "extraction"; tooth: number })
  | (ExternalDependencyBase & { procedureType: "endodontics"; tooth: number })
  | (ExternalDependencyBase & { procedureType: "implant-placement"; region: string })
  | (ExternalDependencyBase & { procedureType: "healing"; region: string })
  | (ExternalDependencyBase & { procedureType: "prosthetic-clearance"; region: string });

interface MedicationSafetyBase {
  id: string;
  riskFlags: Array<"osteoporosis" | "antiresorptive-therapy" | "anticoagulation" | "allergy" | "oncology" | "pregnancy" | "other">;
  requiredClinicalReview: boolean;
  completionStatus: "pending" | "completed";
  clinicianConfirmed: boolean;
  notes?: string;
}
export type MedicationSafetyReview =
  | (MedicationSafetyBase & { medicationsStatus: "known"; medicationIds: string[] })
  | (MedicationSafetyBase & { medicationsStatus: "unknown"; medicationIds?: never })
  | (MedicationSafetyBase & { medicationsStatus: "not-assessed"; medicationIds?: never });

export interface MentorChecklistItem { id: string; label: string; completed: boolean; clinicianConfirmed: boolean }
export interface MentorChecklist {
  id: string;
  context: string;
  items: MentorChecklistItem[];
  source: "locally-reported";
  institutionallyVerified: false;
  approvalStatus: "not-reviewed" | "mentor-approved" | "clinician-overridden";
}

export interface Imaging {
  id: string;
  kind: string;
  status: ImagingStatus;
  target?: string;
  findings: string[];
  notes?: string;
  rootFractureLocation?: "cervical" | "middle" | "apical" | "unknown";
  rootFractureOrientation?: "horizontal" | "vertical" | "oblique" | "undetermined";
}

export interface RegionalClinicalFinding {
  id: "retromolar-tender-fold" | "retromolar-no-inflammation";
  region: "upper-right" | "upper-left" | "lower-right" | "lower-left";
  clinicianConfirmed: boolean;
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
  treatmentOptions?: {first:string;second:string;decision?:"no-treatment"|"first"|"second";confirmed:boolean};
  alternativeTreatments?: Treatment[];
  labLetters?: Array<{id:string;teeth:number[];text:string}>;
  generalTreatments: Treatment[];
  edentulous: Jaw[];
  customDurations: Record<string, number>;
  firstAidSelections: FirstAidSelection[];
  selectedMaccabiCodes: Record<string, string>;
  eligibility: { ageGroup: "unknown" | "under18" | "adult" | "over75" | "over80"; contractCategory?: string; verified: boolean };
  labConstructions?: LabConstruction[];
  labOrders?: LabOrder[];
  externalProcedureDependencies?: ExternalProcedureDependency[];
  patientDecisions?: PatientDecision[];
  medications?: MedicationRecord[];
  medicationSafetyReviews?: MedicationSafetyReview[];
  mentorChecklists?: MentorChecklist[];
  regionalComplaints?: ComplaintSelection[];
  generalComplaints?: ComplaintSelection[];
  consultations?: ConsultationReferral[];
  regionalClinicalFindings?: RegionalClinicalFinding[];
  performedActs?: PerformedAct[];
  clinicalDiscussions?: ClinicalDiscussion[];
  legacyPerformedSources?: LegacyPerformedSource[];
  revision?: number;
  updatedAt?: string;
}

export interface SectionOverride {
  sectionId: string;
  text: string;
  basedOnRevision: number;
  originalGeneratedText: string;
  reviewed: boolean;
}

export type PerformedTarget=
  |{type:"tooth";teeth:number[];surfacesByTooth?:Record<number,Surface[]>}
  |{type:"jaw";jaw:Jaw}
  |{type:"construction";constructionId:string;jaw:Jaw}
  |{type:"region";regionId:string};
interface PerformedActBase {id:string;target:PerformedTarget;visitId:string;performedAt?:string;status:"completed";clinicianConfirmed:true;sourceTreatmentIds?:string[];sourceLabStageIds?:string[];sourceFirstAidIds?:string[]}
export type RestorativePerformedKind="caries-removal"|"old-filling-removal"|"composite-filling"|"temporary-filling"|"cavity-liner"|"occlusal-adjustment"|"finishing-polishing"|"anesthesia";
export interface RestorativePerformedAct extends PerformedActBase {category:"restorative";kind:RestorativePerformedKind;material?:"Filtek"|"Profil"|"IRM"|"Ledermix"|"other";shade?:"A1"|"A2"|"A3"|"A3.5"|"A4"|"B1"|"B2"|"B3"|"B4"|"C1"|"C2"|"C3"|"C4"|"D2"|"D3"|"D4"|"other";cariesType?:"primary"|"secondary";deepCaries?:boolean;oldFillingRemoved?:boolean;anesthesia?:{used:true;agent?:string;amount?:string}}
export type FixedPerformedKind="direct-core"|"fiber-post-core"|"cast-core"|"crown-preparation"|"crown-impression"|"temporary-crown-placement"|"crown-recementation"|"framework-try-in"|"pfz-try-in"|"seat-check"|"occlusion-contact-check"|"permanent-cementation";
export interface FixedPerformedAct extends PerformedActBase {category:"fixed";kind:FixedPerformedKind;material?:string;shade?:"A1"|"A2"|"A3"|"A3.5"|"A4"|"B1"|"B2"|"B3"|"B4"|"C1"|"C2"|"C3"|"C4"|"D2"|"D3"|"D4"|"other";cement?:"Temp-Bond"|"Fuji"|"Ketac"|"U200"|"other";impressionTechnique?:"alginate"|"silicone"|"scan"}
export type RemovablePerformedKind="primary-alginate-impression"|"custom-tray-impression"|"centric-relation"|"shade-selection"|"wax-try-in"|"denture-delivery"|"pressure-adjustment"|"soft-reline"|"hard-reline"|"flipper-impression"|"flipper-delivery"|"flipper-adjustment";
export interface RemovablePerformedAct extends PerformedActBase {category:"removable";kind:RemovablePerformedKind;material?:string;shade?:"A1"|"A2"|"A3"|"A3.5"|"A4"|"B1"|"B2"|"B3"|"B4"|"C1"|"C2"|"C3"|"C4"|"D2"|"D3"|"D4"|"other";prosthesisType?:"flipper"|"partial-acrylic"|"partial-cast"|"complete"|"immediate-partial"|"immediate-complete"|"implant-supported";replacedTeeth?:number[]}
export type EmergencyPerformedKind="pulp-dressing"|"cavity-opening"|"sharp-edge-smoothing"|"drainage"|"irrigation"|"denture-adjustment"|"interim-analgesic-care";
export interface EmergencyPerformedAct extends PerformedActBase {category:"emergency";kind:EmergencyPerformedKind;material?:"IRM"|"Ledermix"|"Temp-Bond"|"Fuji"|"other"}
export type PerformedAct=RestorativePerformedAct|FixedPerformedAct|RemovablePerformedAct|EmergencyPerformedAct;
export interface ClinicalDiscussion {id:string;relatedActIds:string[];kind:"post-operative-pain"|"possible-rct"|"other";explicitlyExplained:true;clinicianConfirmed:true}
export interface LegacyPerformedSource {id:string;sourceType:"treatment"|"first-aid"|"lab-stage";sourceId:string}

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
export type CodeEligibilityStatus = "eligible" | "not_eligible" | "needs_review";

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
  indication: string;
  material?: string;
  toothClass: "anterior" | "posterior" | "jaw" | "implant" | "not-applicable" | "unknown";
  restorationClass?: string;
  ageRestrictions: string[];
  coverageRestrictions: string[];
  eligibilityStatus: CodeEligibilityStatus;
  clarification?: string;
}
