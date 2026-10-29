import {describe,it,expect} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import {validateDraft} from "@/domain/clinical-rules";
describe("oral cavity status and dental deposits",()=>{
 it("documents an explicitly assessed mouth without pathological findings",()=>{const d=emptyDraft();d.examination.oralCavityNormal=true;expect(generateHebrewRecord(d)).toContain("בבדיקת חלל הפה לא נמצאו ממצאים פתולוגיים")});
 it("documents plaque and supra/subgingival calculus as clinical findings",()=>{const d=emptyDraft();d.examination.oralDeposits=["soft-plaque","supragingival-calculus","subgingival-calculus"];const note=generateHebrewRecord(d);expect(note).toContain("רובד חיידקי רך");expect(note).toContain("אבנית על-חניכית");expect(note).toContain("אבנית תת-חניכית")});
 it("blocks no deposits with documented deposits",()=>{const d=emptyDraft();d.examination.oralDeposits=["no-deposits","soft-plaque"];expect(validateDraft(d).map(i=>i.id)).toContain("oral-deposits-conflict")});
 it("blocks whole-mouth normal status alongside a diseased tooth",()=>{const d=emptyDraft();d.examination.oralCavityNormal=true;d.teeth[36].findings=["primary-caries"];expect(validateDraft(d).map(i=>i.id)).toContain("oral-cavity-normal-conflict")});
 it("does not generate a normal exam for an untouched draft",()=>{expect(generateHebrewRecord(emptyDraft())).not.toContain("בבדיקת חלל הפה לא נמצאו ממצאים פתולוגיים")});
});