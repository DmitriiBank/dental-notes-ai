import { describe, expect, it } from "vitest";
import { FINDINGS, FINDING_GROUPS, findingGroupFor } from "@/domain/catalog";

describe("clinical finding groups",()=>{
  it("assigns each current finding to exactly one category",()=>{
    for(const [id] of FINDINGS){
      const matching=FINDING_GROUPS.filter(group=>(group.ids as readonly string[]).includes(id));
      expect(matching, id).toHaveLength(1);
      expect(findingGroupFor(id)).toBe(matching[0].label);
    }
  });
  it("keeps future additions discoverable",()=>{expect(findingGroupFor("new-clinical-finding")).toBe("Другие находки")});
  it("places common findings and future diagnostic tests in recognizable categories",()=>{
    expect(findingGroupFor("intact")).toBe("Норма и статус зуба");
    expect(findingGroupFor("mobility")).toBe("Пародонт и подвижность");
    expect(findingGroupFor("percussion-positive")).toBe("Диагностические пробы");
  });
});
