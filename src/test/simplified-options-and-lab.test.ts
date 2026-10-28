import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";

describe("simplified prosthodontic lab letters and alternatives",()=>{
  it("records confirmed two treatment options and patient choice",()=>{
    const draft=emptyDraft();
    draft.treatmentOptions={first:"כתר בשן 15",second:"עקירה ושתל בשן 15",decision:"second",confirmed:true};
    const text=generateHebrewRecord(draft);
    expect(text).toContain("אפשרות טיפול ראשונה");
    expect(text).toContain("אפשרות טיפול שנייה");
    expect(text).toContain("המטופל בחר באפשרות הטיפול השנייה");
  });
  it("never asserts a choice without clinician confirmation",()=>{
    const draft=emptyDraft();
    draft.treatmentOptions={first:"כתר בשן 15",second:"עקירה ושתל בשן 15",decision:"second",confirmed:false};
    expect(generateHebrewRecord(draft)).not.toContain("המטופל בחר באפשרות הטיפול השנייה");
  });
  it("produces separate lab instructions, not completed care",()=>{
    const draft=emptyDraft();
    draft.labLetters=[{id:"lab-1",teeth:[26],text:"נא לא לצפות את המשטח הפלטינלי בחרסינה"}];
    const text=generateHebrewRecord(draft);
    expect(text).toContain("הוראות למעבדה");
    expect(text).toContain("שיניים 26");
    expect(text).toContain("נא לא לצפות");
    expect(text).not.toContain("טיפול שבוצע");
  });
  it("retains existing laboratory structures for older drafts",()=>{
    const draft=emptyDraft();
    draft.labLetters=[{id:"new",teeth:[],text:"עבודה במעבדה"}];
    expect(generateHebrewRecord(draft)).toContain("עבודה במעבדה");
  });
});
