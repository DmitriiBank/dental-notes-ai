import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {validateDraft} from "@/domain/clinical-rules";

describe("normal clinical findings",()=>{
  it("renders intact, stable and no pathological pockets only when selected",()=>{
    const d=emptyDraft();
    d.teeth[36].findings=["intact","no-mobility","no-pockets"];
    const text=generateHebrewRecord(d);
    expect(text).toContain("ללא ממצא פתולוגי בבדיקה הקלינית");
    expect(text).toContain("ללא ניידות");
    expect(text).toContain("ללא כיסים פריודונטליים פתולוגיים");
    expect(validateDraft(d).some(i=>i.id==="intact-conflict-36")).toBe(false);
  });
  it("blocks contradictory mobility and periodontal findings",()=>{
    const d=emptyDraft();
    d.teeth[36].findings=["mobility","no-mobility","pocket","no-pockets"];
    const ids=validateDraft(d).map(i=>i.id);
    expect(ids).toContain("mobility-conflict-36");
    expect(ids).toContain("pockets-conflict-36");
  });
  it("does not invent normal findings",()=>{
    const text=generateHebrewRecord(emptyDraft());
    expect(text).not.toContain("ללא ניידות");
    expect(text).not.toContain("ללא כיסים פריודונטליים פתולוגיים");
  });
});
