import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {validateDraft} from "@/domain/clinical-rules";

describe("per-tooth diagnostic tests",()=>{
  it("renders independently confirmed percussion, palpation and cold findings",()=>{
    const d=emptyDraft();
    d.teeth[36].findings=["percussion-positive","palpation-negative","cold-positive"];
    const text=generateHebrewRecord(d);
    expect(text).toContain("רגישות לניקוש");
    expect(text).toContain("מישוש ללא רגישות");
    expect(text).toContain("תגובה לקור");
  });
  it("does not fabricate unperformed tests",()=>{
    const text=generateHebrewRecord(emptyDraft());
    expect(text).not.toContain("ניקוש ללא רגישות");
    expect(text).not.toContain("ללא תגובה לקור");
  });
  it("blocks incompatible results for the same test and tooth",()=>{
    const d=emptyDraft();
    d.teeth[36].findings=["percussion-positive","percussion-negative","palpation-positive","palpation-negative","cold-positive","cold-negative"];
    const ids=validateDraft(d).map(i=>i.id);
    expect(ids).toContain("percussion-conflict-36");
    expect(ids).toContain("palpation-conflict-36");
    expect(ids).toContain("cold-conflict-36");
  });
});
