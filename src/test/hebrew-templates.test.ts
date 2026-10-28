import { describe, expect, it } from "vitest";
import { hebrewList } from "@/domain/hebrew-catalog";
import { generateHebrewRecord } from "@/domain/hebrew-templates";
import { caseC, emptyDraft } from "@/domain/fixtures";

describe("Hebrew grammar and deterministic clinical composition", () => {
  it("joins Hebrew lists naturally and removes duplicate phrases", () => {
    expect(hebrewList(["עששת"])).toBe("עששת");
    expect(hebrewList(["עששת", "ניידות"])).toBe("עששת וניידות");
    expect(hebrewList(["עששת", "ניידות", "עששת"])).toBe("עששת וניידות");
    expect(hebrewList(["א", "ב", "ג"])).toBe("א, ב וג");
  });

  it("combines related tooth findings and surfaces without duplication", () => {
    const draft = emptyDraft();
    draft.teeth[26].findings = ["primary-caries", "deep-caries", "primary-caries"];
    draft.teeth[26].surfaces = ["O", "M", "O"];
    const output = generateHebrewRecord(draft);
    expect(output).toContain("שן 26: עששת ראשונית ועששת עמוקה; במשטחים O,M");
    expect(output.match(/עששת ראשונית/gu)).toHaveLength(1);
    expect(output).not.toContain("O,M,O");
  });

  it("keeps patient-reported symptoms distinct from objective findings", () => {
    const draft = emptyDraft();
    draft.teeth[12].findings = ["recession"];
    draft.teeth[12].symptoms = ["Холод"];
    const output = generateHebrewRecord(draft);
    expect(output).toContain("נסיגת חניכיים; לפי דיווח המטופל: רגישות לקור");
  });

  it("separates completed procedures from proposed treatment", () => {
    const draft = emptyDraft();
    draft.teeth[12].treatments = [
      { id: "done", kind: "crown-recement", status: "completed", tooth: 12, material: "Temp-Bond" },
      { id: "plan", kind: "observation", status: "recommended", tooth: 12 },
    ];
    const output = generateHebrewRecord(draft);
    const completed = output.split("טיפול שבוצע:\n")[1].split("\n\n")[0];
    const plan = output.split("תוכנית טיפול והמלצות:\n")[1];
    expect(completed).toContain("הדבקת כתר מחדש");
    expect(completed).not.toContain("מעקב");
    expect(plan).toContain("הומלץ בשן 12 מעקב");
    expect(plan).not.toContain("הדבקת כתר מחדש");
  });

  it("does not turn referred or performed imaging into a confirmed result", () => {
    const draft = emptyDraft();
    draft.imaging = [{ id: "x", kind: "periapical", status: "recommended", target: "שן 27", findings: ["periapical"] }];
    const recommended = generateHebrewRecord(draft);
    expect(recommended).toContain("הומלץ צילום פריאפיקלי עבור שן 27");
    expect(recommended).not.toContain("הצללה רדיולוצנטית");
    draft.imaging[0].status = "reviewed";
    expect(generateHebrewRecord(draft)).toContain("הצללה רדיולוצנטית פריאפיקלית");
  });

  it("documents explicitly confirmed absence of periapical tissue changes",()=>{const draft=emptyDraft();draft.imaging=[{id:"normal-pa",kind:"periapical",status:"reviewed",target:"שן 26",findings:["periapical-normal"]}];const text=generateHebrewRecord(draft);expect(text).toContain("צילום פריאפיקלי עבור שן 26 נבדק");expect(text).toContain("לא הודגמו שינויים ברקמות הפריאפיקליות")});

  it("documents only alternatives that were actually offered", () => {
    const draft = caseC();
    draft.alternatives.push({ id: "hidden", tooth: 27, label: "אפשרות שלא הוצגה", offered: false, feasible: true, risksExplained: false, prognosisDiscussed: false, decision: "pending" });
    const output = generateHebrewRecord(draft);
    expect(output).toContain("המטופל בחר באפשרות זו");
    expect(output).toContain("החלטת המטופל ממתינה");
    expect(output).not.toContain("אפשרות שלא הוצגה");
  });

  it("does not claim risk or prognosis discussions unless selected", () => {
    const draft = emptyDraft();
    draft.alternatives = [{ id: "a", label: "מעקב", offered: true, feasible: true, risksExplained: false, prognosisDiscussed: false, decision: "pending" }];
    const output = generateHebrewRecord(draft);
    expect(output).not.toContain("הסיכונים הוסברו");
    expect(output).not.toContain("הפרוגנוזה נדונה");
  });

  it("keeps the treatment plan as one continuous paragraph", () => {
    const draft = caseC();
    draft.generalTreatments.push({ id: "consult", kind: "endo-consult", status: "recommended" });
    const plan = generateHebrewRecord(draft).split("תוכנית טיפול והמלצות:\n")[1];
    expect(plan).toBeTruthy();
    expect(plan).not.toContain("\n");
    expect(plan).not.toMatch(/^\s*[-•\d]+[.)]/u);
  });

  it("does not include appointment scheduling in clinical text generation", () => {
    const draft = emptyDraft();
    draft.generalTreatments.push({ id: "d", kind: "complete-denture", status: "planned" });
    const output = generateHebrewRecord(draft);
    expect(output).not.toContain("תור 1");
    expect(output).not.toContain("30 דקות");
  });
  it("groups identical procedures into one treatment phrase with a tooth list",()=>{const draft=emptyDraft();[14,15,16].forEach(tooth=>draft.teeth[tooth].treatments=[{id:`extract-${tooth}`,kind:"extraction",status:"recommended",tooth,provider:"external"}]);const plan=generateHebrewRecord(draft).split("תוכנית טיפול והמלצות:\n")[1];expect(plan).toContain("עקירה אצל רופא אחר בשיניים 14, 15 ו16");expect(plan.match(/עקירה/gu)).toHaveLength(1)});
  it("groups endodontic treatment without implying it was completed",()=>{const draft=emptyDraft();[36,37].forEach(tooth=>draft.teeth[tooth].treatments=[{id:`rct-${tooth}`,kind:"rct",status:"recommended",tooth,provider:"external"}]);const text=generateHebrewRecord(draft);expect(text).toContain("הומלץ טיפול שורש בשיניים 36 ו37");expect(text).not.toContain("טיפול שבוצע")});
  it("renders one bridge span instead of repeating a bridge for every tooth",()=>{const draft=emptyDraft();[15,16,17].forEach(tooth=>draft.teeth[tooth].treatments=[{id:`bridge-${tooth}`,kind:"bridge",status:"planned",tooth,material:"zirconia"}]);const plan=generateHebrewRecord(draft).split("תוכנית טיפול והמלצות:\n")[1];expect(plan).toContain("גשר משן 15 עד שן 17, חומר zirconia");expect(plan.match(/גשר/gu)).toHaveLength(1)});

  it("uses only straight quotation marks", () => {
    const draft = emptyDraft();
    draft.examination.periodontal = 'ללא כיסים חריגים';
    const output = generateHebrewRecord(draft);
    expect(output).toContain('פמ"ר');
    expect(output).not.toMatch(/[“”]/u);
  });
});
