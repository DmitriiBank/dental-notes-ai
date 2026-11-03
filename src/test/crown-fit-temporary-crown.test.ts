import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {validateDraft} from "@/domain/clinical-rules";
import {PERFORMED_CATALOG,performedActText} from "@/domain/performed-treatment";
import {performedActSchema} from "@/domain/structured-validation";
import type {FixedPerformedAct} from "@/domain/types";

const fixed=(kind:FixedPerformedAct["kind"],cement?:FixedPerformedAct["cement"]):FixedPerformedAct=>({
 id:kind,kind,category:"fixed",target:{type:"tooth",teeth:[26]},visitId:"visit-1",
 status:"completed",clinicianConfirmed:true,...(cement?{cement}:{})
});

describe("crown-fit X-ray and temporary crown clinical actions",()=>{
 it("recommends an X-ray to evaluate crown fit without asserting its result",()=>{
  const d=emptyDraft();
  d.imaging=[{id:"i1",kind:"periapical",purpose:"crown-fit-check",target:"שן 26",status:"recommended",findings:[]}];
  const note=generateHebrewRecord(d);
  expect(note).toContain("הומלץ צילום פריאפיקלי עבור שן 26 לצורך בדיקת התאמת הכתר");
  expect(note).not.toContain("התאמה שולית תקינה");
  expect(validateDraft(d).some(i=>i.severity==="blocking")).toBe(false);
 });
 it("records crown fit results only when image is reviewed",()=>{
  const d=emptyDraft();
  d.imaging=[{id:"i2",kind:"periapical",purpose:"crown-fit-check",target:"שן 26",status:"reviewed",findings:["crown-margin-adapted"]}];
  expect(generateHebrewRecord(d)).toContain("התאמה שולית תקינה של הכתר");
  d.imaging[0].findings=["crown-margin-gap"];
  expect(generateHebrewRecord(d)).toContain("אי-התאמה שולית של הכתר");
 });
 it("keeps crown removal and temporary cementation distinct with optional cement",()=>{
  const removal=fixed("temporary-crown-removal");
  const cementation=fixed("temporary-crown-cementation","Temp-Bond");
  expect(PERFORMED_CATALOG.some(item=>item.kind==="temporary-crown-removal")).toBe(true);
  expect(PERFORMED_CATALOG.some(item=>item.kind==="temporary-crown-cementation")).toBe(true);
  expect(performedActSchema.safeParse(removal).success).toBe(true);
  expect(performedActSchema.safeParse(cementation).success).toBe(true);
  expect(performedActText(removal)).toContain("הוסר כתר זמני בשן 26");
  expect(performedActText(cementation)).toContain("בוצעה הדבקה זמנית של כתר זמני בשן 26");
  const d=emptyDraft();d.performedActs=[removal,cementation];
  const note=generateHebrewRecord(d);
  expect(note).toContain("Temp-Bond");
  expect(note).toContain("הוסר כתר זמני");
  expect(note).toContain("בוצעה הדבקה זמנית");
 });
});
