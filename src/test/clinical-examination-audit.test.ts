import {describe,expect,it} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {validateDraft} from "@/domain/clinical-rules";
import {FINDINGS,FINDING_GROUPS} from "@/domain/catalog";

describe("clinical examination audit regressions",()=>{
 it("renders structured deep bite without pretending it is normal",()=>{
   const draft=emptyDraft();draft.examination.occlusionFindings=["deep-bite"];
   expect(generateHebrewRecord(draft)).toContain("סגר: סגר עמוק.");
 });
 it("blocks normal occlusion text alongside an abnormal selected bite",()=>{
   const draft=emptyDraft();draft.examination.occlusion="תקין.";draft.examination.occlusionFindings=["deep-bite"];
   expect(validateDraft(draft).map(issue=>issue.id)).toContain("occlusion-conflict");
 });
 it("renders short clinical crown and insufficient ferrule on selected teeth",()=>{
   const draft=emptyDraft();draft.teeth[16].findings=["short-clinical-crown","insufficient-ferrule"];
   const text=generateHebrewRecord(draft);
   expect(text).toContain("כותרת קלינית קצרה");
   expect(text).toContain("Ferrule לא מספק");
 });
 it("does not suppress a missing lower tooth when the upper jaw is edentulous",()=>{
   const draft=emptyDraft();draft.edentulous=["upper"];draft.teeth[36].missing=true;
   const text=generateHebrewRecord(draft);
   expect(text).toContain("חוסר שיניים מלא בלסת העליונה");
   expect(text).toContain("36");
   expect(text).toContain("חסרות");
 });
 it("does not assert potential root canal needs from a deep caries finding",()=>{
   const draft=emptyDraft();draft.teeth[26].findings=["deep-caries"];draft.teeth[26].surfaces=["O"];
   const text=generateHebrewRecord(draft);
   expect(text).not.toContain("ייתכן צורך בטיפול שורש");
 });
 it("disallows mutually exclusive diagnostic results",()=>{
   const draft=emptyDraft();draft.teeth[36].findings=["percussion-positive","percussion-negative","cold-normal","cold-prolonged"];
   const ids=validateDraft(draft).map(issue=>issue.id);
   expect(ids).toContain("test-conflict-percussion-36");
   expect(ids).toContain("test-conflict-cold-36");
 });
 it("categorizes all available clinical findings",()=>{
   for(const [id] of FINDINGS)expect(FINDING_GROUPS.filter(g=>(g.ids as readonly string[]).includes(id)),id).toHaveLength(1);
 });
});
