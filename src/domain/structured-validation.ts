import { z } from "zod";
import type { ClinicalDraft } from "./types";

const id=z.string().trim().min(1);
const tooth=z.number().int().min(11).max(48);
const stageSchema=z.object({id,kind:z.enum(["impressions","bite-registration","shade-selection","metal-try-in","framework-try-in","osseointegration-check","delivery","adjustment"]),status:z.enum(["planned","completed","deferred"]),clinicianConfirmed:z.boolean(),completedAt:z.string().optional(),notes:z.string().optional()}).strict();

export const dentalBridgeSchema=z.object({kind:z.literal("bridge"),constructionId:id,treatmentPlanId:id,toothPositions:z.array(tooth).min(1),abutments:z.array(z.object({toothPosition:tooth,mobility:z.enum(["unknown","stable","mobile"])}).strict()).min(1),pontics:z.array(tooth),supportType:z.enum(["tooth-supported","implant-supported","mixed","unknown"]),material:z.string(),permanence:z.enum(["temporary","permanent"]),constructionMobility:z.enum(["unknown","stable","mobile"]),shade:z.string().optional(),status:z.enum(["proposed","ordered","in-progress","completed","remake","deferred"]),notes:z.string().optional()}).strict();
export const removableProsthesisSchema=z.object({kind:z.literal("removable-prosthesis"),constructionId:id,treatmentPlanId:id,prosthesisType:z.enum(["flipper","partial-acrylic","partial-cast","complete","implant-supported"]),jaw:z.enum(["upper","lower"]),replacedTeeth:z.array(tooth),immediate:z.boolean(),material:z.string(),shade:z.string().optional(),impressions:z.object({status:z.enum(["not-taken","planned","completed"]),clinicianConfirmed:z.boolean(),completedAt:z.string().optional()}).strict(),extractionDependencies:z.array(id),deliveryStage:z.enum(["not-planned","planned","completed","deferred"]),adjustmentStages:z.array(stageSchema),status:z.enum(["proposed","ordered","in-progress","completed","remake","deferred"])}).strict();
export const labConstructionSchema=z.discriminatedUnion("kind",[dentalBridgeSchema,removableProsthesisSchema]);

export const labOrderSchema=z.object({id,treatmentPlanId:id,constructionId:id,toothPositions:z.array(tooth),abutments:z.array(tooth),supportType:z.enum(["tooth-supported","implant-supported","mixed","removable","unknown"]),shade:z.string().optional(),material:z.string(),stage:z.enum(["draft","sent","returned","try-in","accepted","remake"]),status:z.enum(["draft","sent","returned","accepted","remake"]),stages:z.array(stageSchema),remakeReason:z.string().optional(),defects:z.array(z.enum(["missing-vestibular-plate","fit","shade","occlusion","fracture","other"])),selectedCode:z.string().optional(),notes:z.string().optional()}).strict();

const dependencyBase={id,linkedTreatmentPlanId:id,provider:z.literal("external"),status:z.enum(["recommended","scheduled","completed"]),verification:z.enum(["unverified","clinician-confirmed"]),completedAt:z.string().optional()};
export const externalProcedureDependencySchema=z.discriminatedUnion("procedureType",[
  z.object({...dependencyBase,procedureType:z.literal("extraction"),tooth}).strict(),
  z.object({...dependencyBase,procedureType:z.literal("endodontics"),tooth}).strict(),
  z.object({...dependencyBase,procedureType:z.literal("implant-placement"),region:id}).strict(),
  z.object({...dependencyBase,procedureType:z.literal("healing"),region:id}).strict(),
  z.object({...dependencyBase,procedureType:z.literal("prosthetic-clearance"),region:id}).strict(),
]);

const decisionBase={id,offeredProcedureId:id,label:id,documentedExplanation:z.boolean(),risksExplained:z.boolean(),alternativesExplained:z.boolean(),decisionDate:z.string().optional()};
export const patientDecisionSchema=z.discriminatedUnion("status",[
  z.object({...decisionBase,status:z.literal("accepted")}).strict(),
  z.object({...decisionBase,status:z.literal("refused"),refusalReason:z.string().optional()}).strict(),
  z.object({...decisionBase,status:z.literal("pending"),treatmentDeferred:z.boolean()}).strict(),
]);

const safetyBase={id,riskFlags:z.array(z.enum(["osteoporosis","antiresorptive-therapy","anticoagulation","allergy","oncology","pregnancy","other"])),requiredClinicalReview:z.boolean(),completionStatus:z.enum(["pending","completed"]),clinicianConfirmed:z.boolean(),notes:z.string().optional()};
export const medicationSafetyReviewSchema=z.discriminatedUnion("medicationsStatus",[
  z.object({...safetyBase,medicationsStatus:z.literal("known"),medicationIds:z.array(id)}).strict(),
  z.object({...safetyBase,medicationsStatus:z.literal("unknown")}).strict(),
  z.object({...safetyBase,medicationsStatus:z.literal("not-assessed")}).strict(),
]);

export const mentorChecklistSchema=z.object({id,context:id,items:z.array(z.object({id,label:id,completed:z.boolean(),clinicianConfirmed:z.boolean()}).strict()),source:z.literal("locally-reported"),institutionallyVerified:z.literal(false),approvalStatus:z.enum(["not-reviewed","mentor-approved","clinician-overridden"])}).strict();

export function validateStructuredEntities(draft:ClinicalDraft):string[]{
  const groups:[[string,z.ZodType,unknown[]]]|Array<[string,z.ZodType,unknown[]]>=[
    ["lab construction",labConstructionSchema,draft.labConstructions??[]],
    ["lab order",labOrderSchema,draft.labOrders??[]],
    ["external dependency",externalProcedureDependencySchema,draft.externalProcedureDependencies??[]],
    ["patient decision",patientDecisionSchema,draft.patientDecisions??[]],
    ["medication safety review",medicationSafetyReviewSchema,draft.medicationSafetyReviews??[]],
    ["mentor checklist",mentorChecklistSchema,draft.mentorChecklists??[]],
  ];
  return groups.flatMap(([label,schema,items])=>items.flatMap((item,index)=>{const result=schema.safeParse(item);return result.success?[]:[`${label} ${index+1}: ${result.error.issues.map(issue=>issue.message).join(", ")}`]}));
}
