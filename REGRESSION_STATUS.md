# Dental Notes AI regression status

Specification: reconstructed QA matrix v1.0, October 2026. All fixtures are synthetic. An ID is marked **automated** only when it is linked to a semantic unit or browser test. Merely appearing in `regression-matrix.ts` is not considered a pass.

## Summary

- Total represented: **81**
- Automated with linked semantic tests: **36**
- Pending full scenario implementation: **45**

## Automated

- General examination: EX01, EX09, EX10
- Fillings: FL03, FL06, FL08
- Prosthetics: PR02, PR05, PR08, PR11, PR14, PR17, PR19, PR20
- Emergency: ER03, ER05, ER10
- Quality: QA04, QA08, QA09, QA11, QA14
- MaccabiDent codes: CD01–CD11, CD13–CD15

## Pending

Pending means the requirement is represented in the fixture catalog but does not yet have a complete structured setup plus all semantic assertions required by its acceptance criterion.

- General examination: EX02, EX03, EX04, EX05, EX06, EX07, EX08
- Fillings: FL01, FL02, FL04, FL05, FL07, FL09, FL10
- Prosthetics: PR01, PR03, PR04, PR06, PR07, PR09, PR10, PR12, PR13, PR15, PR16, PR18
- Emergency: ER01, ER02, ER04, ER06, ER07, ER08, ER09, ER11, ER12
- Quality: QA01, QA02, QA03, QA05, QA06, QA07, QA10, QA12, QA13
- Codes: CD12 — age/benefit/contract suffixes remain unverified because the supplied partial tariff snapshot does not define reliable eligibility mappings.

## Constraints that remain uncovered

- Full lab-order model for bridge units, pontics, abutments, metal try-in, occlusal registration, and remake defects.
- Medication clarification workflow and safety gating for oncology/osteoporosis scenarios.
- Dedicated refusal object linking a declined emergency action to the exact offered procedure.
- Full reversible edentulism history restoration when pre-existing natural-tooth data are overwritten; current undo is session-history based.
- Verified eligibility rules for age/contract suffixes and several specialist-only tariff variants.
- Imported price/eligibility rules beyond the exact mappings enumerated in the provided QA specification.
