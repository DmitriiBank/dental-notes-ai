import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {validateDraft} from "@/domain/clinical-rules";
import {generateHebrewRecord} from "@/domain/hebrew-templates";

const check=(findings:string[])=>{
 const draft=emptyDraft();
 draft.imaging=[{id:"image-1",kind:"periapical",status:"reviewed",target:"26",findings}];
 return {draft,blocking:validateDraft(draft).filter(issue=>issue.severity==="blocking")};
};

describe("periapical normal compatibility",()=>{
 it.each(["root-filling-poor-density","root-filling-voids","root-filling-short-apex","root-filling-extruded","incomplete-rct","underfilled-canals","overfilled-canals","separated-instrument","treated-canals"])("allows normal periapical tissues and independent endodontic finding %s",(finding)=>{
  const {draft,blocking}=check(["periapical-normal",finding]);
  expect(blocking.some(issue=>issue.id==="image-periapical-conflict-image-1")).toBe(false);
  const note=generateHebrewRecord(draft);
  expect(note).toBeTruthy();
 });
 it.each(["lateral-radiolucency","furcation-radiolucency","apical-root-resorption"])("does not automatically conflate other region finding %s with periapical status",(finding)=>{
  expect(check(["periapical-normal",finding]).blocking.some(issue=>issue.id==="image-periapical-conflict-image-1")).toBe(false);
 });
 it.each(["periapical","widened-pdl","lamina-dura-loss"])("blocks directly conflicting periapical finding %s",(finding)=>{
  expect(check(["periapical-normal",finding]).blocking.map(issue=>issue.id)).toContain("image-periapical-conflict-image-1");
 });
});
