# Dental Notes AI regression status

Specification: reconstructed QA matrix v1.0, October 2026. All fixtures are synthetic. An ID is marked **automated** only when it is linked to a semantic unit or browser test. Merely appearing in `regression-matrix.ts` is not considered a pass.

## Summary

- Total represented: **81**
- Automated with linked semantic tests: **70**
- Pending full scenario implementation: **11**

## Automated

- General examination: EX01–EX10
- Fillings: FL01–FL10
- Prosthetics: PR01, PR02, PR04, PR05, PR08–PR11, PR13–PR15, PR17, PR19, PR20
- Emergency: ER01–ER11
- Quality: QA01, QA03–QA05, QA08–QA14
- MaccabiDent codes: CD01–CD11, CD13–CD15

## Pending

Pending cases are registered as skipped tests, not passing assertions. No remaining case is pending solely because a test or fixture was omitted.

| ID | Classification | Reason |
| --- | --- | --- |
| PR03 | Missing application functionality | There is no dependency model requiring confirmed immediate-flipper impressions before an external extraction. |
| PR06 | Missing application functionality | There is no typed bridge model for span, abutments, pontics, temporary construction, and removal of prior work. |
| PR07 | Missing application functionality | There is no bridge entity to assign mobility to the construction without propagating it to every abutment. |
| PR12 | Missing application functionality | There is no laboratory-order model for a mobile flipper and a missing vestibular plate. |
| PR16 | Unresolved clinical rules | Verified construction constraints and coding rules for a bridge with two pontics were not supplied; a code cannot be inferred safely. |
| PR18 | Missing application functionality | There is no osseointegration dependency or conditional timing model for prosthetics after external implant placement. |
| ER12 | Missing application functionality | There is no refusal object linking the exact emergency action offered, the refusal, and post-refusal recommendations. |
| QA02 | Missing application functionality | There are no structured unknown-medication fields or an invasive-treatment review gate for osteoporosis. |
| QA06 | Missing application functionality | There is no lab-order cross-check across tooth, abutment type, construction, and ordered product. |
| QA07 | Missing application functionality | There is no unconfirmed mentor checklist for metal try-in and occlusal registration. |
| CD12 | Unresolved clinical rules | The authoritative reference excludes age, benefit, and contract variants; reliable rules for -18/-75/-80 suffixes are not available. |

Classification totals:

- Missing application functionality: **9**
- Missing test implementation: **0**
- Missing fixtures: **0**
- Unresolved clinical rules: **2**

## Constraints that remain uncovered

- Full lab-order model for bridge units, pontics, abutments, metal try-in, occlusal registration, and remake defects.
- Medication clarification workflow and safety gating for osteoporosis scenarios.
- Dedicated refusal object linking a declined emergency action to the exact offered procedure.
- Verified eligibility rules for age/contract suffixes and several specialist-only tariff variants.
- Imported price/eligibility rules beyond the exact mappings enumerated in the provided QA specification.
