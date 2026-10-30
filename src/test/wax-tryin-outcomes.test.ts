import {describe,it,expect} from "vitest";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";
import type {PerformedAct} from "@/domain/types";
const wax=(outcome?:"approved"|"rearrangement"):PerformedAct=>({id:"wax",category:"removable",kind:"wax-try-in",target:{type:"jaw",jaw:"upper"},visitId:"current",status:"completed",clinicianConfirmed:true,waxTryInOutcome:outcome});
describe("wax try in approval and rearrangement",()=>{
 it("records full positive consent only when explicitly selected",()=>{const d=emptyDraft();d.performedActs=[wax("approved")];const n=generateHebrewRecord(d);expect(n).toContain("נבדקו סידור השיניים, צורתן, צבען והאסתטיקה");expect(n).toContain("המטופל נתן את הסכמתו");expect(n).not.toContain("סידור מחדש")});
 it("records rejected wax try-in and laboratory rearrangement without falsely documenting consent",()=>{const d=emptyDraft();d.performedActs=[wax("rearrangement")];const n=generateHebrewRecord(d);expect(n).toContain("השיניים נשלחו למעבדה לצורך סידור מחדש");expect(n).toContain("לא ניתן אישור להמשך");expect(n).not.toContain("המטופל נתן את הסכמתו")});
 it("does not infer either outcome if not chosen",()=>{const d=emptyDraft();d.performedActs=[wax()];const n=generateHebrewRecord(d);expect(n).toContain("בוצעה מדידת שיניים בשעווה");expect(n).not.toContain("המטופל נתן את הסכמתו");expect(n).not.toContain("נשלחו למעבדה")});
});