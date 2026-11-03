import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {PERFORMED_CATALOG,performedActText,performedEditorGroup} from "@/domain/performed-treatment";
import {performedActSchema} from "@/domain/structured-validation";
import type {RemovablePerformedAct} from "@/domain/types";

const makeAct=(kind:RemovablePerformedAct["kind"],jaw:"upper"|"lower"):RemovablePerformedAct=>({
 id:kind,category:"removable",kind,status:"completed",clinicianConfirmed:true,visitId:"visit-current",target:{type:"jaw",jaw}
});

describe("hard night guard removable treatment stages",()=>{
 it("shows hard night guard impression and delivery with adjustment in removable section",()=>{
  for(const kind of ["night-guard-impression","night-guard-delivery-adjustment"] as const){
   const item=PERFORMED_CATALOG.find(x=>x.kind===kind);
   expect(item).toBeDefined();
   expect(item?.target).toBe("jaw");
   expect(performedEditorGroup(item!)).toBe("removable");
  }
 });
 it("documents verified impression for a hard upper night guard",()=>{
  const act=makeAct("night-guard-impression","upper");
  expect(performedActSchema.safeParse(act).success).toBe(true);
  expect(performedActText(act)).toContain("נלקחו מטבעים להכנת סד לילה קשיח ללסת העליונה");
  const draft=emptyDraft();draft.performedActs=[act];
  expect(generateHebrewRecord(draft)).toContain("נלקחו מטבעים להכנת סד לילה קשיח ללסת העליונה");
 });
 it("documents separately confirmed lower night guard delivery and adjustment",()=>{
  const act=makeAct("night-guard-delivery-adjustment","lower");
  expect(performedActSchema.safeParse(act).success).toBe(true);
  const result=performedActText(act);
  expect(result).toContain("נמסר סד לילה קשיח ללסת התחתונה");
  expect(result).toContain("בוצעו תיקונים והתאמות");
  const draft=emptyDraft();draft.performedActs=[act];
  expect(generateHebrewRecord(draft)).toContain("נמסר סד לילה קשיח");
 });
 it("does not claim that delivery or adjustment took place if only an impression was confirmed",()=>{
  const draft=emptyDraft();draft.performedActs=[makeAct("night-guard-impression","upper")];
  expect(generateHebrewRecord(draft)).not.toContain("נמסר סד לילה קשיח");
 });
});