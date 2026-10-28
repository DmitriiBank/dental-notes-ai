import { beforeEach, describe, expect, it } from "vitest";
import { COMPLAINT_CATALOG, complaintSentences } from "@/domain/complaint-catalog";
import { emptyDraft } from "@/domain/fixtures";
import { generateHebrewRecord } from "@/domain/hebrew-templates";
import { useExamStore } from "@/store/examination-store";

describe("107-item complaint catalog",()=>{
  beforeEach(()=>{localStorage.clear();useExamStore.getState().reset()});

  it("contains exactly 107 unique deterministic entries",()=>{
    expect(COMPLAINT_CATALOG).toHaveLength(107);
    expect(new Set(COMPLAINT_CATALOG.map(item=>item.id)).size).toBe(107);
    expect(COMPLAINT_CATALOG.every(item=>item.ru&&item.he&&item.category&&item.scope)).toBe(true);
  });

  it("keeps complaints isolated by tooth and supports bulk assignment",()=>{
    const store=useExamStore.getState();
    store.selectMany([11,12]);store.toggleComplaint("pain.biting");
    let draft=useExamStore.getState().draft;
    expect(draft.teeth[11].complaints?.map(item=>item.complaintId)).toEqual(["pain.biting"]);
    expect(draft.teeth[12].complaints?.map(item=>item.complaintId)).toEqual(["pain.biting"]);
    useExamStore.getState().selectMany([11]);useExamStore.getState().toggleComplaint("pain.biting");
    draft=useExamStore.getState().draft;
    expect(draft.teeth[11].complaints).toEqual([]);
    expect(draft.teeth[12].complaints?.map(item=>item.complaintId)).toEqual(["pain.biting"]);
  });

  it("makes no-complaint mutually exclusive within each tooth scope",()=>{
    const store=useExamStore.getState();store.selectMany([26]);store.toggleComplaint("pain.spontaneous");store.toggleComplaint("sensitivity.cold");store.toggleComplaint("none");
    expect(useExamStore.getState().draft.teeth[26].complaints).toEqual([{complaintId:"none"}]);
    useExamStore.getState().toggleComplaint("pain.night");
    expect(useExamStore.getState().draft.teeth[26].complaints).toEqual([{complaintId:"pain.night"}]);
  });

  it("deduplicates an identical complaint while retaining all tooth locations",()=>{
    const draft=emptyDraft();draft.teeth[11].complaints=[{complaintId:"sensitivity.cold",severity:"moderate"}];draft.teeth[12].complaints=[{complaintId:"sensitivity.cold",severity:"moderate"}];
    const sentences=complaintSentences(draft);
    expect(sentences).toEqual(["המטופל מדווח על רגישות לקור בשיניים 11 ו12, בעוצמה בינונית."]);
    const record=generateHebrewRecord(draft);
    expect(record).toContain("סיבת הביקור:\nהמטופל מדווח על רגישות לקור בשיניים 11 ו12");
    expect(record.match(/רגישות לקור/gu)).toHaveLength(1);
  });

  it("keeps region-level and general complaints outside tooth findings",()=>{
    const draft=emptyDraft();draft.regionalComplaints=[{complaintId:"swelling.local",region:"Справа"}];draft.generalComplaints=[{complaintId:"function.chewing"}];
    const record=generateHebrewRecord(draft);
    const reason=record.split("סיבת הביקור:\n")[1].split("\n\n")[0];
    expect(reason).toContain("נפיחות מקומית באזור הצד הימני");
    expect(reason).toContain("קושי בלעיסה");
    expect(record).not.toContain("ממצאים קליניים");
  });

  it("persists tooth, region and general complaints in local browser storage",()=>{
    const store=useExamStore.getState();store.selectMany([36]);store.toggleComplaint("pain.biting");
    useExamStore.getState().update(draft=>{draft.regionalComplaints=[{complaintId:"pain.jaw",region:"Слева"}];draft.generalComplaints=[{complaintId:"general.checkup"}]});
    useExamStore.getState().saveLocal();useExamStore.getState().reset();useExamStore.getState().loadLocal();
    const restored=useExamStore.getState().draft;
    expect(restored.teeth[36].complaints).toEqual([{complaintId:"pain.biting"}]);
    expect(restored.regionalComplaints).toEqual([{complaintId:"pain.jaw",region:"Слева"}]);
    expect(restored.generalComplaints).toEqual([{complaintId:"general.checkup"}]);
  });

  it("places imaging, treatment and consultation recommendations in the final section",()=>{
    const draft=emptyDraft();draft.teeth[26].findings=["primary-caries"];draft.imaging=[{id:"image",kind:"periapical",status:"recommended",target:"שן 26",findings:[]}];draft.teeth[26].treatments=[{id:"fill",kind:"filling",status:"recommended",tooth:26}];draft.generalTreatments=[{id:"consult",kind:"endo-consult",status:"recommended",provider:"external"}];draft.medications=[{id:"med",name:"Test medication",allergyCheck:"no-known-allergy",status:"recommended"}];
    const record=generateHebrewRecord(draft);const planIndex=record.indexOf("תוכנית טיפול והמלצות:");
    expect(planIndex).toBeGreaterThan(record.indexOf("ממצאים קליניים:"));
    expect(record.slice(0,planIndex)).not.toContain("הומלץ צילום");
    expect(record.slice(planIndex)).toContain("הומלץ צילום פריאפיקלי");
    expect(record.slice(planIndex)).toContain("ביצוע שחזור");
    expect(record.slice(planIndex)).toContain("ייעוץ אנדודונטי");
    expect(record.slice(0,planIndex)).not.toContain("Test medication");
    expect(record.slice(planIndex)).toContain("Test medication");
    expect(record.slice(planIndex)).not.toContain("\n\n");
  });
});
