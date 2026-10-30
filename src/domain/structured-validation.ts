import { z } from "zod";
import type { ClinicalDraft } from "./types";

const id=z.string().trim().min(1);
const tooth=z.number().int().min(11).max(48);
const performedTargetSchema=z.discriminatedUnion("type",[z.object({type:z.literal("tooth"),teeth:z.array(tooth).min(1),surfacesByTooth:z.record(z.string(),z.array(z.enum(["M","D","O","B","P","L","I","C"]))).optional()}),z.object({type:z.literal("jaw"),jaw:z.enum(["upper","lower"])}),z.object({type:z.literal("construction"),constructionId:id,jaw:z.enum(["upper","lower"])}),z.object({type:z.literal("region"),regionId:id})]);
const performedBase={id,target:performedTargetSchema,visitId:id,performedAt:z.string().optional(),status:z.literal("completed"),clinicianConfirmed:z.literal(true),sourceTreatmentIds:z.array(id).optional(),sourceLabStageIds:z.array(id).optional(),sourceFirstAidIds:z.array(id).optional()};
export const performedActSchema=z.discriminatedUnion("category",[
  z.object({...performedBase,category:z.literal("restorative"),kind:z.enum(["caries-removal","old-filling-removal","composite-filling","temporary-filling","cavity-liner","occlusal-adjustment","finishing-polishing","anesthesia"]),material:z.enum(["Filtek","Profil","IRM","Ledermix","other"]).optional(),shade:z.enum(["A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4","other"]).optional(),cariesType:z.enum(["primary","secondary"]).optional(),deepCaries:z.boolean().optional(),oldFillingRemoved:z.boolean().optional(),anesthesia:z.object({used:z.literal(true),agent:z.string().optional(),amount:z.string().optional()}).optional()}),
  z.object({...performedBase,category:z.literal("fixed"),kind:z.enum(["direct-core","fiber-post-core","cast-core","crown-preparation","crown-impression","temporary-crown-placement","crown-recementation","framework-try-in","pfz-try-in","seat-check","occlusion-contact-check","permanent-cementation"]),material:z.string().optional(),shade:z.enum(["A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4","other"]).optional(),cement:z.enum(["Temp-Bond","Fuji","Ketac","U200","other"]).optional(),impressionTechnique:z.enum(["alginate","silicone","scan"]).optional()}),
  z.object({...performedBase,category:z.literal("removable"),kind:z.enum(["primary-alginate-impression","custom-tray-impression","centric-relation","shade-selection","wax-try-in","denture-delivery","pressure-adjustment","soft-reline","hard-reline","flipper-impression","flipper-delivery","flipper-adjustment"]),material:z.string().optional(),shade:z.enum(["A1","A2","A3","A3.5","A4","B1","B2","B3","B4","C1","C2","C3","C4","D2","D3","D4","other"]).optional(),prosthesisType:z.enum(["flipper","partial-acrylic","partial-cast","complete","immediate-partial","immediate-complete","implant-supported"]).optional(),replacedTeeth:z.array(tooth).optional(),waxTryInOutcome:z.enum(["approved","rearrangement"]).optional(),waxTryInRearrangementReason:z.string().optional()}),
  z.object({...performedBase,category:z.literal("emergency"),kind:z.enum(["pulp-dressing","cavity-opening","sharp-edge-smoothing","drainage","irrigation","denture-adjustment","interim-analgesic-care"]),material:z.enum(["IRM","Ledermix","Temp-Bond","Fuji","other"]).optional()}),
]);
export const clinicalDiscussionSchema=z.object({id,relatedActIds:z.array(id),kind:z.enum(["post-operative-pain","possible-rct","other"]),explicitlyExplained:z.literal(true),clinicianConfirmed:z.literal(true)});
const stageSchema=z.object({id,kind:z.enum(["impressions","bite-registration","shade-selection","metal-try-in","framework-try-in","pfz-framework-try-in","osseointegration-check","delivery","adjustment"]),status:z.enum(["planned","completed","deferred"]),clinicianConfirmed:z.boolean(),completedAt:z.string().optional(),notes:z.string().optional()}).strict();

export const dentalBridgeSchema=z.object({kind:z.literal("bridge"),constructionId:id,treatmentPlanId:id,toothPositions:z.array(tooth).min(1),abutments:z.array(z.object({toothPosition:tooth,mobility:z.enum(["unknown","stable","mobile"])}).strict()).min(1),pontics:z.array(tooth),supportType:z.enum(["tooth-supported","implant-supported","mixed","unknown"]),material:z.string(),permanence:z.enum(["temporary","permanent"]),constructionMobility:z.enum(["unknown","stable","mobile"]),shade:z.string().optional(),status:z.enum(["proposed","ordered","in-progress","completed","remake","deferred"]),notes:z.string().optional()}).strict();
export const removableProsthesisSchema=z.object({kind:z.literal("removable-prosthesis"),constructionId:id,treatmentPlanId:id,prosthesisType:z.enum(["flipper","partial-acrylic","partial-cast","complete","implant-supported"]),jaw:z.enum(["upper","lower"]),replacedTeeth:z.array(tooth),immediate:z.boolean(),material:z.string(),shade:z.string().optional(),impressions:z.object({status:z.enum(["not-taken","planned","completed"]),clinicianConfirmed:z.boolean(),completedAt:z.string().optional()}).strict(),extractionDependencies:z.array(id),deliveryStage:z.enum(["not-planned","planned","completed","deferred"]),adjustmentStages:z.array(stageSchema),status:z.enum(["proposed","ordered","in-progress","completed","remake","deferred"]),includeReplacedTeethInText:z.boolean().optional()}).strict();
export const labConstructionSchema=z.discriminatedUnion("kind",[dentalBridgeSchema,removableProsthesisSchema]);

export const labOrderSchema=z.object({id,treatmentPlanId:id,constructionId:id,toothPositions:z.array(tooth),abutments:z.array(tooth),supportType:z.enum(["tooth-supported","implant-supported","mixed","removable","unknown"]),shade:z.string().optional(),material:z.string(),stage:z.enum(["draft","sent","returned","try-in","accepted","remake"]),status:z.enum(["draft","sent","returned","accepted","remake"]),stages:z.array(stageSchema),remakeReason:z.string().optional(),defects:z.array(z.enum(["missing-vestibular-plate","fit","shade","occlusion","fracture","other"])),selectedCode:z.string().optional(),notes:z.string().optional(),omitPalatalPorcelain:z.boolean().optional()}).strict();

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
    ["performed act",performedActSchema,draft.performedActs??[]],
    ["clinical discussion",clinicalDiscussionSchema,draft.clinicalDiscussions??[]],
  ];
  return groups.flatMap(([label,schema,items])=>items.flatMap((item,index)=>{const result=schema.safeParse(item);return result.success?[]:[`${label} ${index+1}: ${result.error.issues.map(issue=>issue.message).join(", ")}`]}));
}
