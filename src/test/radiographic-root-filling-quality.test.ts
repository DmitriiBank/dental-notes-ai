import {describe,it,expect} from "vitest";
import {RADIOGRAPHIC_FINDINGS} from "@/domain/radiographic-catalog";
import {HEBREW_FINDINGS} from "@/domain/hebrew-catalog";
import {emptyDraft} from "@/domain/fixtures";
import {generateHebrewRecord} from "@/domain/hebrew-templates";

describe("radiographic root canal filling quality",()=>{
 const ids=["root-filling-adequate","root-filling-poor-density","root-filling-voids","root-filling-short-apex","root-filling-extruded"];
 it("offers the findings in the endodontics imaging group",()=>{for(const id of ids){expect(RADIOGRAPHIC_FINDINGS.find(item=>item.id===id)?.group).toBe("endodontic");expect(HEBREW_FINDINGS[id]?.label).toBeTruthy()}});
 it("documents a void and extrusion without assuming a clinical diagnosis",()=>{const d=emptyDraft();d.imaging=[{id:"img-1",kind:"periapical",status:"reviewed",target:"36",findings:["root-filling-voids","root-filling-extruded"]}];const output=generateHebrewRecord(d);expect(output).toContain("חללים בחומר מילוי");expect(output).toContain("מעבר לחוד השורש");expect(output).not.toContain("אובחנה דלקת")});
 it("does not assert good filling quality without explicit selection",()=>{const d=emptyDraft();d.imaging=[{id:"img-1",kind:"periapical",status:"reviewed",target:"36",findings:["treated-canals"]}];expect(generateHebrewRecord(d)).not.toContain("אטומות באופן תקין")});
});