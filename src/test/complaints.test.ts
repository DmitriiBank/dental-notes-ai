import { beforeEach, describe, expect, it } from "vitest";
import { COMPLAINT_CATALOG, complaintSentences, validateComplaintSelections } from "@/domain/complaint-catalog";
import { emptyDraft } from "@/domain/fixtures";
import { generateHebrewRecord } from "@/domain/hebrew-templates";
import { useExamStore } from "@/store/examination-store";

describe("versioned complaint catalog with the 107 supplied entries and the added return-after-imaging reason",()=>{
  beforeEach(()=>{localStorage.clear();useExamStore.getState().reset()});

  it("contains exactly 108 unique deterministic entries",()=>{
    expect(COMPLAINT_CATALOG).toHaveLength(108);
    expect(new Set(COMPLAINT_CATALOG.map(item=>item.id)).size).toBe(108);
    expect(COMPLAINT_CATALOG.every(item=>item.ru&&item.he&&item.category&&item.scope)).toBe(true);
  });

  it("preserves supplied emergency, removable and implant catalog entries",()=>{const ids=new Set(COMPLAINT_CATALOG.map(item=>item.id));expect(ids.has("denture-pain")).toBe(true);expect(ids.has("bleeding-after-extraction")).toBe(true);expect(ids.has("implant-crown-loose")).toBe(true)});

  it("does not turn a complaint into treatment, imaging or diagnosis",()=>{const draft=emptyDraft();draft.teeth[12].complaints=[{complaintId:"crown-off"}];const text=generateHebrewRecord(draft);expect(text).toContain("השתחררות של כתר");expect(text).toContain("בשן 12");expect(text).not.toMatch(/בוצע|הודבק|אובחנה|צילום|אנטיביוטיקה/u)});

  it("validates unknown IDs and the no-complaints conflict",()=>{expect(validateComplaintSelections([{complaintId:"unknown"}])).toHaveLength(1);expect(validateComplaintSelections([{complaintId:"no-complaints"},{complaintId:"tooth-pain"}])).toHaveLength(1)});

  it("keeps complaints isolated by tooth and supports bulk assignment",()=>{
    const store=useExamStore.getState();
    store.selectMany([11,12]);store.toggleComplaint("bite-pain");
    let draft=useExamStore.getState().draft;
    expect(draft.teeth[11].complaints?.map(item=>item.complaintId)).toEqual(["bite-pain"]);
    expect(draft.teeth[12].complaints?.map(item=>item.complaintId)).toEqual(["bite-pain"]);
    useExamStore.getState().selectMany([11]);useExamStore.getState().toggleComplaint("bite-pain");
    draft=useExamStore.getState().draft;
    expect(draft.teeth[11].complaints).toEqual([]);
    expect(draft.teeth[12].complaints?.map(item=>item.complaintId)).toEqual(["bite-pain"]);
  });

  it("makes no-complaint mutually exclusive within each tooth scope",()=>{
    const store=useExamStore.getState();store.selectMany([26]);store.toggleComplaint("spontaneous-pain");store.toggleComplaint("cold");store.toggleComplaint("no-complaints");
    expect(useExamStore.getState().draft.teeth[26].complaints).toEqual([{complaintId:"no-complaints"}]);
    useExamStore.getState().toggleComplaint("night-pain");
    expect(useExamStore.getState().draft.teeth[26].complaints).toEqual([{complaintId:"night-pain"}]);
  });

  it("deduplicates an identical complaint while retaining all tooth locations",()=>{
    const draft=emptyDraft();draft.teeth[11].complaints=[{complaintId:"cold",intensity:"moderate"}];draft.teeth[12].complaints=[{complaintId:"cold",intensity:"moderate"}];
    const sentences=complaintSentences(draft);
    expect(sentences).toEqual(["לדברי המטופל/ת, רגישות לקור, בשיניים 11 ו12, בעוצמה בינונית."]);
    const record=generateHebrewRecord(draft);
    expect(record).toContain("סיבת הביקור:\nלדברי המטופל/ת, רגישות לקור, בשיניים 11 ו12");
    expect(record.match(/רגישות לקור/gu)).toHaveLength(1);
  });

  it("keeps region-level and general complaints outside tooth findings",()=>{
    const draft=emptyDraft();draft.regionalComplaints=[{complaintId:"gum-swelling",region:"upper-right"}];draft.generalComplaints=[{complaintId:"chewing-difficult"}];
    const record=generateHebrewRecord(draft);
    const reason=record.split("סיבת הביקור:\n")[1].split("\n\n")[0];
    expect(reason).toContain("נפיחות בחניכיים, בלסת העליונה מימין");
    expect(reason).toContain("קושי בלעיסה");
    expect(record).not.toContain("ממצאים קליניים");
  });

  it("persists tooth, region and general complaints in local browser storage",()=>{
    const store=useExamStore.getState();store.selectMany([36]);store.toggleComplaint("bite-pain");
    useExamStore.getState().update(draft=>{draft.regionalComplaints=[{complaintId:"jaw-pain",region:"upper-left"}];draft.generalComplaints=[{complaintId:"checkup"}]});
    useExamStore.getState().saveLocal();useExamStore.getState().reset();useExamStore.getState().loadLocal();
    const restored=useExamStore.getState().draft;
    expect(restored.teeth[36].complaints).toEqual([{complaintId:"bite-pain"}]);
    expect(restored.regionalComplaints).toEqual([{complaintId:"jaw-pain",region:"upper-left"}]);
    expect(restored.generalComplaints).toEqual([{complaintId:"checkup"}]);
  });

  it("places imaging, treatment and consultation recommendations in the final section",()=>{
    const draft=emptyDraft();draft.teeth[26].findings=["primary-caries"];draft.imaging=[{id:"image",kind:"periapical",status:"recommended",target:"שן 26",findings:[]}];draft.teeth[26].treatments=[{id:"fill",kind:"filling",status:"recommended",tooth:26}];draft.consultations=[{id:"consult",type:"endodontist",target:{kind:"plan"},reasons:["endodontic-pathology"],status:"recommended",completionConfirmed:false}];draft.medications=[{id:"med",name:"Test medication",allergyCheck:"no-known-allergy",status:"recommended"}];
    const record=generateHebrewRecord(draft);const planIndex=record.indexOf("תוכנית טיפול והמלצות:");
    expect(planIndex).toBeGreaterThan(record.indexOf("ממצאים קליניים:"));
    expect(record.slice(0,planIndex)).not.toContain("הומלץ צילום");
    expect(record.slice(planIndex)).toContain("הומלץ צילום פריאפיקלי");
    expect(record.slice(planIndex)).toContain("ביצוע שחזור");
    expect(record.slice(planIndex)).toContain("מומחה לטיפולי שורש");
    expect(record.slice(0,planIndex)).not.toContain("Test medication");
    expect(record.slice(planIndex)).toContain("Test medication");
    expect(record.slice(planIndex)).not.toContain("\n\n");
  });
});
