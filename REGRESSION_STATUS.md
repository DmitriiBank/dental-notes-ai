# Dental Notes AI regression status

Specification: reconstructed QA matrix v1.0, October 2026. All fixtures are synthetic. An ID is marked **automated** only when it is linked to a semantic unit or browser test. Merely appearing in `regression-matrix.ts` is not considered a pass.

## Summary

- Total represented: **81**
- Automated with linked semantic tests: **81**
- Pending full scenario implementation: **0**

## Automated

- General examination: EX01–EX10
- Fillings: FL01–FL10
- Prosthetics: PR01–PR20
- Emergency: ER01–ER12
- Quality: QA01–QA14
- MaccabiDent codes: CD01–CD15

## Pending

No scenario remains pending. PR16 and CD12 are automated as safe-review behaviors: their underlying clinical and contractual rules remain unverified, so the application returns `needs_review` and never invents or auto-selects a code.

## Constraints that remain uncovered

- Verified eligibility rules for age/contract suffixes and several specialist-only tariff variants.
- Imported price/eligibility rules beyond the exact mappings enumerated in the provided QA specification.
- Institution-wide verification of the optional mentor checklist; current checklist items are explicitly marked locally reported.

## Verified application behavior

- Immediate removable-prosthesis workflows block progression until impressions are explicitly completed and clinician-confirmed when an extraction dependency is selected.
- External extraction, endodontic, implant, healing, and prosthetic-clearance dependencies remain outside the dentist's appointment schedule.
- Bridges preserve separate tooth positions, abutments, pontics, support type, material, permanence, construction mobility, and individual abutment mobility.
- Lab orders are cross-checked against their treatment plan, construction, support type, positions, material, and explicitly selected code.
- Patient refusal is linked to a specific offered procedure; explanation, risks, alternatives, and date are emitted only when explicitly documented.
- Unknown medications plus an osteoporosis risk flag trigger review without inferring a drug, dose, diagnosis, contraindication, or prescription.
- Implant prosthetics require a completed, clinician-confirmed prosthetic-clearance dependency; elapsed time alone does not clear treatment.

## Intentionally unverified business rules

- Clinical construction limits and tariff coding for a bridge with two pontics are not supplied. The configuration is stored, but clinical and code review are mandatory.
- Age, coverage, and contractual suffix policies are absent from the supplied catalog. Patient-specific eligibility returns `needs_review`; no suffix is generated.
- Mentor checklist content is configurable and locally reported, not institutionally verified.
- Medication safety completion remains a clinician decision; the application records and blocks/reviews but does not infer a safety conclusion.
