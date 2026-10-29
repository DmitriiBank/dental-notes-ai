import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import type {PerformedAct} from "@/domain/types";

const act=(id:string,tooth:number,withoutWarranty?:boolean):PerformedAct=>({id,category:"restorative",kind:"composite-filling",status:"completed",clinicianConfirmed:true,visitId:"v1",target:{type:"tooth",teeth:[tooth]},withoutWarranty});
describe("no-warranty notation for performed treatment",()=>{
 it("documents no warranty only for the selected completed act",()=>{
  const d=emptyDraft();d.performedActs=[act("a1",16,true),act("a2",17)];
  const text=generateHebrewRecord(d);
  expect(text).toContain("הטיפול בשיניים 16 בוצע ללא אחריות");
  expect(text).not.toContain("הטיפול בשיניים 17 בוצע ללא אחריות");
 });
 it("does not imply no-warranty if no flag is confirmed",()=>{
  const d=emptyDraft();d.performedActs=[act("a1",16)];
  expect(generateHebrewRecord(d)).not.toContain("בוצע ללא אחריות");
 });
});