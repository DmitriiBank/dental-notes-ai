import { describe, expect, it } from "vitest";
import { validateDraft } from "@/domain/clinical-rules";
import { caseB, emptyDraft } from "@/domain/fixtures";
import { generateHebrewRecord } from "@/domain/hebrew-templates";

describe("clinical validation",()=>{
  it("blocks findings attached to missing natural tooth",()=>{const d=emptyDraft();d.teeth[11].missing=true;d.teeth[11].findings=["primary-caries"];expect(validateDraft(d).some(x=>x.severity==="blocking")).toBe(true)});
  it("requires reviewed imaging before radiological findings",()=>{const d=emptyDraft();d.imaging=[{id:"x",kind:"periapical",status:"recommended",findings:["periapical"]}];expect(validateDraft(d).some(x=>x.id==="image-x")).toBe(true)});
  it("flags unconfirmed normal presets",()=>{const d=emptyDraft();d.examination.extraoral='במ"פ.';expect(validateDraft(d).some(x=>x.id==="normals")).toBe(true)});
  it("deep caries text is conditional and does not assert pulpitis",()=>{const text=generateHebrewRecord(caseB());expect(text).toContain("ייתכן צורך בטיפול שורש");expect(text).toContain("ללא אבחנה אנדודונטית סופית")});
  it("uses straight quotation marks",()=>expect(generateHebrewRecord(emptyDraft())).not.toMatch(/[“”]/));
  it("blocks a treatment whose embedded tooth does not match its chart location",()=>{const d=emptyDraft();d.teeth[11].treatments=[{id:"wrong",kind:"filling",status:"planned",tooth:12,surfaces:["M"]}];expect(validateDraft(d)).toEqual(expect.arrayContaining([expect.objectContaining({id:"tooth-mismatch-11-wrong",severity:"blocking"})]))});
  it("requires clinician review for ambiguous or unverified codes",()=>{const d=emptyDraft();d.teeth[12].treatments=[{id:"z",kind:"zirconia-crown",status:"planned",tooth:12}];expect(validateDraft(d).some(x=>x.id==="code-choice-z")).toBe(true);d.selectedMaccabiCodes.z="כחלז";expect(validateDraft(d).some(x=>x.id==="code-choice-z")).toBe(false)});
});
