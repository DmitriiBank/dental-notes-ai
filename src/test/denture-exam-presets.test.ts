import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {validateDraft} from "@/domain/clinical-rules";

describe("existing dentures and general exam presets",()=>{
 it("describes observed fracture and broken clasp only in clinical findings",()=>{
  const d=emptyDraft();d.existingDentures=[{id:"d1",jaw:"lower",kind:"partial",findings:["broken-clasp","base-crack"]}];
  const output=generateHebrewRecord(d);
  expect(output).toContain("תותבת חלקית קיימת בלסת התחתונה");
  expect(output).toContain("שבר בוו התותבת");
  expect(output).toContain("סדק בבסיס התותבת");
  expect(output).not.toContain("טיפול שבוצע:");
 });
 it("documents satisfactory existing denture when explicitly confirmed",()=>{
  const d=emptyDraft();d.existingDentures=[{id:"d2",jaw:"upper",kind:"complete",findings:["serviceable"]}];
  expect(generateHebrewRecord(d)).toContain("התותבת תקינה");
 });
 it("documents selected exam findings without inventing findings in untouched sections",()=>{
  const d=emptyDraft();d.examination.selectedExamPresets={extraoral:["facial-swelling"],softTissues:["erosion"],hygiene:["poor"],periodontal:["recession"]};
  const text=generateHebrewRecord(d);
  expect(text).toContain("EO: נפיחות בפנים.");
  expect(text).toContain("רקמות רכות: ארוזיה ברירית.");
  expect(text).toContain("OH: לקויה.");
  expect(text).toContain('פמ"ר: נסיגת חניכיים.');
  expect(text).not.toContain("סגר:");
 });
 it("keeps existing free text when choosing a preset",()=>{
  const d=emptyDraft();d.examination.extraoral="ממצא נוסף";d.examination.selectedExamPresets={extraoral:["muscle-tenderness"]};
  const text=generateHebrewRecord(d);expect(text).toContain("ממצא נוסף");expect(text).toContain("רגישות במישוש שרירי הלעיסה");
 });
 it("prevents contradictory normal and abnormal descriptions",()=>{
  const d=emptyDraft();d.existingDentures=[{id:"d1",jaw:"upper",kind:"complete",findings:["serviceable","base-fracture"]}];
  d.examination.selectedExamPresets={softTissues:["normal","erosion"]};
  const ids=validateDraft(d).map(i=>i.id);
  expect(ids).toContain("denture-conflict-d1");
  expect(ids).toContain("exam-preset-conflict-softTissues");
 });
});
