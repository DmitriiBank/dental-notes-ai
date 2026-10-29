import {describe,it,expect} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {firstAidPresets,groupFirstAidSelections} from "@/domain/first-aid-catalog";
import {COMPLAINT_CATALOG} from "@/domain/complaint-catalog";

describe("post extraction symptoms, socket examination and alveolitis",()=>{
 it("offers post-extraction complaint choices",()=>{
  expect(COMPLAINT_CATALOG.some(c=>c.id==="post-extraction-check"&&c.scope==="region")).toBe(true);
  expect(COMPLAINT_CATALOG.some(c=>c.id==="post-extraction-bad-odor"&&c.scope==="region")).toBe(true);
 });
 it("provides an alveolitis preset but never automatically marks performed care",()=>{
  const preset=firstAidPresets.find(p=>p.id==="er.alveolitis");
  expect(preset?.performed).toContain("done.socket_saline_irrigation");
  expect(preset?.findings).toContain("finding.alveolitis_confirmed");
  const selections=[{phraseId:"done.socket_saline_irrigation",vars:{region:"38"},confirmed:false}];
  expect(groupFirstAidSelections(selections).get("completed")).toBeUndefined();
 });
 it("describes socket status without implicitly diagnosing alveolitis",()=>{
  const d=emptyDraft();d.extractionSites=[{id:"x",region:"38",findings:["clot-absent","socket-tender"]}];
  const note=generateHebrewRecord(d);
  expect(note).toContain("לא נצפה קריש דם");
  expect(note).toContain("רגישות באזור מכתשית העקירה");
  expect(note).not.toContain("אובחנה דלקת מכתשית");
 });
 it("records explicitly observed normal socket healing",()=>{
  const d=emptyDraft();d.extractionSites=[{id:"x",region:"16",findings:["healing-normal"]}];
  expect(generateHebrewRecord(d)).toContain("ריפוי תקין של מכתשית העקירה");
 });
});