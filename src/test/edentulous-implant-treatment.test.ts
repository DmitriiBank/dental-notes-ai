import {beforeEach,describe,expect,it} from "vitest";
import {useExamStore} from "@/store/examination-store";
import {validateDraft} from "@/domain/clinical-rules";
describe("implant treatment at edentulous tooth positions",()=>{
 beforeEach(()=>{localStorage.clear();useExamStore.getState().reset()});
 it("allows implant placement without changing missing-tooth status",()=>{
  const store=useExamStore.getState();store.setEdentulous(["upper"]);useExamStore.getState().selectMany([14,16]);useExamStore.getState().addTreatment("implant-placement");
  const d=useExamStore.getState().draft;
  expect(d.teeth[14].missing).toBe(true);expect(d.teeth[16].missing).toBe(true);
  expect(d.teeth[14].treatments.some(t=>t.kind==="implant-placement")).toBe(true);
  expect(d.teeth[16].treatments.some(t=>t.kind==="implant-placement")).toBe(true);
  expect(validateDraft(d).filter(i=>i.id==="missing-14"||i.id==="missing-16")).toEqual([]);
 });
 it("retains implant plan when the jaw is marked edentulous again",()=>{
  useExamStore.getState().selectMany([14]);useExamStore.getState().addTreatment("implant-placement");
  useExamStore.getState().setEdentulous(["upper"]);
  const d=useExamStore.getState().draft;
  expect(d.teeth[14].missing).toBe(true);
  expect(d.teeth[14].treatments.some(t=>t.kind==="implant-placement")).toBe(true);
 });
 it("prevents filling treatment at an absent tooth position",()=>{
  useExamStore.getState().setEdentulous(["lower"]);useExamStore.getState().selectMany([36]);
  useExamStore.getState().addTreatment("filling");
  expect(useExamStore.getState().draft.teeth[36].treatments).toHaveLength(0);
 });
});