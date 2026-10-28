import { describe, expect, it } from "vitest";
import { appointmentLines, scheduleAppointments } from "@/domain/appointment-rules";
import { caseA, caseB, caseC, caseD, caseE, caseF, caseG, emptyDraft } from "@/domain/fixtures";

describe("appointment scheduling",()=>{
  it("groups three adjacent same-side fillings into 60 minutes",()=>expect(scheduleAppointments(caseA()).map(x=>x.duration)).toEqual([60]));
  it("does not schedule extraction, implant consultation, or completed impressions",()=>expect(scheduleAppointments(caseA())).toHaveLength(1));
  it("does not invent an endodontic appointment for deep caries",()=>expect(scheduleAppointments(caseB()).map(x=>x.duration)).toEqual([30]));
  it("schedules approved five-stage complete denture sequence",()=>expect(scheduleAppointments(caseD()).map(x=>x.duration)).toEqual([30,30,60,30,30]));
  it("does not schedule clinical alternatives alone",()=>expect(scheduleAppointments(caseC())).toHaveLength(0));
  it("does not reschedule completed crown fixation",()=>expect(scheduleAppointments(caseF())).toHaveLength(0));
  it("does not schedule unsupported work for implant denture pain or pregnancy",()=>{expect(scheduleAppointments(caseE())).toHaveLength(0);expect(scheduleAppointments(caseG())).toHaveLength(0)});
  it("requires manual duration for two non-adjacent fillings",()=>{const d=emptyDraft();[11,13].forEach(n=>d.teeth[n].treatments.push({id:String(n),kind:"filling",status:"planned",tooth:n}));expect(scheduleAppointments(d)[0].duration).toBeNull()});
  it("requires confirmation instead of inventing an unapproved prosthetic duration",()=>{const d=emptyDraft();d.teeth[12].treatments.push({id:"crown",kind:"zirconia-crown",status:"planned",tooth:12});expect(scheduleAppointments(d)).toEqual([{id:"unconfigured-crown",duration:null,source:"zirconia-crown",editable:true}])});
  it("never places an externally provided procedure in the dentist schedule",()=>{const d=emptyDraft();d.generalTreatments.push({id:"external-adjustment",kind:"denture-adjustment",status:"recommended",provider:"external"});expect(scheduleAppointments(d)).toHaveLength(0)});
  it("appointment output contains only numbered durations",()=>expect(appointmentLines(scheduleAppointments(caseD()))).toBe("תור 1: 30 דקות\nתור 2: 30 דקות\nתור 3: 60 דקות\nתור 4: 30 דקות\nתור 5: 30 דקות"));
});
