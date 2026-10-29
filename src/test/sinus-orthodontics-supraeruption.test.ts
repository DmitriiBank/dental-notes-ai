import {describe,it,expect} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {RADIOGRAPHIC_FINDINGS} from "@/domain/radiographic-catalog";
import {FINDINGS,findingGroupFor} from "@/domain/catalog";

describe("sinus imaging and orthodontic clinical findings",()=>{
 it("exposes all findings in the correct clinical categories",()=>{
  for(const id of ["dental-splint","orthodontic-wire","ortho-brackets","supraeruption"]){expect(FINDINGS.some(([key])=>key===id)).toBe(true);expect(findingGroupFor(id)).not.toBe("Другие находки");}
  expect(RADIOGRAPHIC_FINDINGS.filter(f=>f.group==="sinus")).toHaveLength(5);
 });
 it("documents existing splint, wire and supraeruption on selected teeth",()=>{
  const d=emptyDraft();d.teeth[11].findings=["dental-splint","orthodontic-wire","supraeruption"];
  const note=generateHebrewRecord(d);
  expect(note).toContain("קיבוע שיניים קיים");expect(note).toContain("קשת אורתודונטית קיימת");expect(note).toContain("בקיעת יתר");
 });
 it("records a discolored restoration without diagnosing secondary caries",()=>{
  const d=emptyDraft();d.teeth[21].findings=["discolored-filling","marginal-staining"];
  const text=generateHebrewRecord(d);
  expect(text).toContain("שינוי צבע של שחזור קיים");
  expect(text).toContain("צביעה בשולי השחזור");
  expect(text).not.toContain("עששת משנית");
 });
 it("does not confuse radiographic sinus opacity with periapical pathology",()=>{
  const d=emptyDraft();
  d.imaging=[{id:"sinus1",kind:"panoramic",status:"reviewed",findings:["sinus-floor-opacity","sinus-mucosal-thickening"]}];
  const note=generateHebrewRecord(d);
  expect(note).toContain("הצללה באזור רצפת הסינוס המקסילרי");
  expect(note).toContain("עיבוי רירית בסינוס המקסילרי");
  expect(note).not.toContain("הצללה רדיולוצנטית פריאפיקלית");
 });
 it("keeps hygienist recommendation concise",()=>{
  const d=emptyDraft();d.generalTreatments=[{id:"h1",kind:"hygienist",status:"recommended"}];
  expect(generateHebrewRecord(d)).toContain("הומלץ שיננית");
 });
 it("does not mention caries surfaces or surgeon in extraction recommendation",()=>{
  const d=emptyDraft();d.teeth[26].treatments=[{id:"e1",kind:"extraction",status:"recommended",tooth:26,surfaces:["M","O","D"]}];
  const output=generateHebrewRecord(d);
  expect(output).toContain("הומלץ עקירת שן 26");
  expect(output).not.toContain("משטחים MOD");
  expect(output).not.toContain("כירורג");
  expect(output).not.toContain("אצל רופא אחר");
 });

});