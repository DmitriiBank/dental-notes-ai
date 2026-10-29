import {describe,it,expect} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {validateDraft} from "@/domain/clinical-rules";
import {medicationFromPreset} from "@/domain/medication-catalog";
import {CONSULTATION_TYPES,consultationText} from "@/domain/consultation-catalog";

describe("pediatric tablet option and pediatric dentist referral",()=>{
 it("never prepopulates pediatric Augmentin dose or strength",()=>{
  const item=medicationFromPreset("augmentin-pediatric-tablets","a1");
  expect(item.name).toBe("Augmentin");
  expect(item.concentration).toBeUndefined();
  expect(item.dose).toBeUndefined();
  expect(item.clinicianSelectionConfirmed).toBe(false);
  const d=emptyDraft();d.medications=[item];
  const ids=validateDraft(d).map(i=>i.id);
  expect(ids).toContain("pediatric-augmentin-weight-a1");
  expect(ids).toContain("pediatric-augmentin-confirmation-a1");
  expect(ids).toContain("pediatric-augmentin-dose-a1");
 });
 it("permits clinician-confirmed tablet details with allergy review",()=>{
  const d=emptyDraft();const item=medicationFromPreset("augmentin-pediatric-tablets","a2");
  Object.assign(item,{patientWeightKg:35,tabletSuitabilityConfirmed:true,clinicianSelectionConfirmed:true,concentration:"clinician-verified tablets",dose:"clinician-documented",frequency:"clinician-documented",duration:"clinician-documented",allergyCheck:"no-known-allergy"});
  d.medications=[item];
  expect(validateDraft(d).filter(i=>i.id.startsWith("pediatric-augmentin-"))).toHaveLength(0);
 });
 it("offers pediatric dentistry referral in Hebrew",()=>{
  expect(CONSULTATION_TYPES["pediatric-dentist"].he).toBe("רופא שיניים לילדים");
  const text=consultationText({id:"r1",type:"pediatric-dentist",target:{kind:"plan"},reasons:[],status:"recommended",completionConfirmed:false});
  expect(text).toContain("הומלץ ייעוץ אצל רופא שיניים לילדים");
 });
});