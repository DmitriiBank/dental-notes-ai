import { describe, expect, it } from "vitest";
import { clinicalPhrases, firstAidPresets, getClinicalPhrase, groupFirstAidSelections, renderClinicalPhrase, requiredVariables } from "@/domain/first-aid-catalog";
import { emptyDraft } from "@/domain/fixtures";
import { generateHebrewRecord } from "@/domain/hebrew-templates";

describe("first-aid clinical template catalog", () => {
  it("contains all twelve specified scenarios and resolvable phrase references", () => {
    expect(firstAidPresets).toHaveLength(12);
    const ids = new Set(clinicalPhrases.map(phrase => phrase.id));
    firstAidPresets.forEach(preset => {
      [...preset.complaint, ...preset.findings, ...preset.performed, ...preset.recommendations].forEach(id => expect(ids.has(id), `${preset.id}: ${id}`).toBe(true));
    });
  });

  it("renders required tooth and surface variables deterministically", () => {
    expect(requiredVariables("finding.caries")).toEqual(["tooth", "surfaces"]);
    expect(renderClinicalPhrase({ phraseId:"finding.caries", vars:{tooth:26,surfaces:["O","M"]}, confirmed:true })).toBe("עששת בשן 26 במשטחים O,M.");
    expect(renderClinicalPhrase({ phraseId:"finding.caries", vars:{tooth:26}, confirmed:true })).toBeNull();
  });

  it("never outputs a confirmation-required performed action without confirmation", () => {
    const selection = { phraseId:"done.tempbond_crown", vars:{tooth:12}, confirmed:false };
    expect(getClinicalPhrase(selection.phraseId)?.requiresConfirmation).toBe(true);
    expect(renderClinicalPhrase(selection)).toBeNull();
    expect(renderClinicalPhrase({...selection,confirmed:true})).toContain("Temp-Bond");
  });

  it("groups sections without duplicate text", () => {
    const selection = { phraseId:"rec.followup", vars:{}, confirmed:true };
    const grouped = groupFirstAidSelections([selection,selection]);
    expect(grouped.get("recommendation")).toHaveLength(1);
  });

  it("adds only explicitly selected first-aid phrases to the live record", () => {
    const draft = emptyDraft();
    expect(generateHebrewRecord(draft)).toBe("");
    draft.firstAidSelections = [
      { phraseId:"complaint.crown_off", vars:{tooth:12}, confirmed:true },
      { phraseId:"finding.artificial_crown", vars:{tooth:12}, confirmed:true },
      { phraseId:"done.tempbond_crown", vars:{tooth:12}, confirmed:true },
      { phraseId:"counsel.temporary_cement", vars:{}, confirmed:true },
      { phraseId:"rec.definitive_crown_assessment", vars:{}, confirmed:true },
    ];
    const note = generateHebrewRecord(draft);
    expect(note).toContain("סיבת הביקור:\nהמטופל הגיע עקב השתחררות כתר בשן 12.");
    expect(note).toContain("טיפול שבוצע:\nבוצעה הדבקה זמנית");
    expect(note).toContain("תוכנית טיפול והמלצות:\n");
    expect(note).toContain("הוסבר למטופל כי מדובר בהדבקה זמנית בלבד");
  });
});
