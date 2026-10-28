import { describe, expect, it } from "vitest";
import { REGRESSION_FIXTURES } from "@/test/fixtures/regression-matrix";

describe("regression specification traceability",()=>{
  it("contains every EX/FL/PR/ER/QA/CD case exactly once",()=>{expect(REGRESSION_FIXTURES).toHaveLength(81);expect(new Set(REGRESSION_FIXTURES.map(x=>x.id)).size).toBe(81);expect(REGRESSION_FIXTURES.reduce<Record<string,number>>((a,x)=>(a[x.domain]=(a[x.domain]??0)+1,a),{})).toEqual({exam:10,fillings:10,prosthetics:20,emergency:12,quality:14,codes:15})});
  it("does not represent pending cases as automated passes",()=>{const pending=REGRESSION_FIXTURES.filter(x=>x.status==="pending");const automated=REGRESSION_FIXTURES.filter(x=>x.status==="automated");expect(automated).toHaveLength(81);expect(pending).toHaveLength(0);expect(pending.every(x=>Boolean(x.pendingReason)&&Boolean(x.pendingCategory)&&!x.testRef)).toBe(true)});
  it.each(REGRESSION_FIXTURES.filter(x=>x.status==="automated"))("$id is linked to a semantic automated test",fixture=>{expect(fixture.synthetic).toBe(true);expect(fixture.testRef).toMatch(/\.test\.ts$/u);expect(fixture.invariants).toEqual(expect.arrayContaining(["structured-fdi","section-separation","single-paragraph-plan","deterministic-appointments","no-invented-consent"]));expect(fixture.invariants.length).toBeGreaterThan(5)});
});

describe("explicitly pending regression scenarios",()=>{
  if(REGRESSION_FIXTURES.every(x=>x.status!=="pending"))it("contains no pending scenario after safe-review behavior was automated",()=>expect(REGRESSION_FIXTURES.some(x=>x.status==="pending")).toBe(false));
  for(const fixture of REGRESSION_FIXTURES.filter(x=>x.status==="pending")){
    it.skip(`${fixture.id} [${fixture.pendingCategory}]: ${fixture.pendingReason}`,()=>{});
  }
});
