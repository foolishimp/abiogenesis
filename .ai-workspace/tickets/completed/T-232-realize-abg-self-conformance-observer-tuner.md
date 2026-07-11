# T-232 - Realize ABG Self-Conformance And Observer/Tuner Proof

- id: T-232
- title: Realize ABG self-conformance and observer/tuner proof
- type: feature
- ticket_category: ordinary
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_course_correction
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- goal: abg-5-0-full-product-delivery
- phase: DS-4
- priority: high
- change_intent: >-
    Implement the approved conformance manifest, self-subject compiler gate,
    and observer/tuner proof before the self-host candidate is frozen.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-231
- build_tenant: typescript
- admission_condition: T-231 is completed and its design is current
- affected_boundary: existing semantic compiler/rule catalog and M05 exact-cut self-subject/observer proof
- module_owners: M03 semantic compiler/rule and observer/tuner runtime consumption plus M05 proof
- dependencies:
  - T-231
- authority_refs:
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md
  - specification/requirements/product/REQ-P-SELF-CONFORMANCE.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
  - specification/requirements/abg/REQ-R-ABG3-TUNER.md
  - specification/requirements/abg/REQ-R-ABG3-SUPERVISOR-WITNESS.md
  - .ai-workspace/tickets/backlog/T-231-design-abg-self-conformance-observer-tuner.md

## Target Truth

The development candidate publishes its exact tenant-conformance manifest,
passes the existing compiler/rule path over its own complete builder surface,
fails the seeded negatives with typed findings, and proves truthful current
observer/tuner behavior on the self-build path. No mandatory ABG code-bearing
work remains after this phase.

## Required Work

1. Publish and admit the versioned conformance manifest over the exact
   public-contract-catalog identity, version, digest, contract rows, and capabilities.
2. Extend the existing compiler/rule path for the exact approved inventory and diagnostics.
3. Add complete real-tree and seeded-negative fixtures.
4. Wire the exact-cut gate without unconditional release bypass.
5. Exercise observer/tuner halt, draft, attribution, ratification, replay, and injected-negative paths.
6. Run all product and regression gates and record the frozen input identities for DS-5.

## Closure Law

Close when the real ABG tree passes, every seeded defect fails at the expected
typed rule, the observer/tuner proof is truthful and replay-visible, and an
authority-first code review confirms no second checker, controller, or GF2
scope entered the product.

## Non-Closure Conditions

- A release-grade bypass can report green over a red mandatory result.
- The proof relies on ticket prose or design history absent from the published manifest.
- Observer/tuner output becomes authority without attributed admitted action.
- Any mandatory code-bearing issue is deferred past the R5 freeze.

## Proof Surface

- conformance-manifest type/admission tests
- real-tree self-conformance run
- seeded-negative matrix
- exact-cut bypass-refusal test
- observer/tuner positive and injected-negative runs
- full deterministic gates and phase-end code review against T-231, T-218, and PRODUCT

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_course_correction
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: Realization half of T-231.
- Re-entry: Same as T-231.
- No code, specification, design, or release surface changed by this closure.

### Review Amendment (2026-07-12, codex governance review of 34d7f56)

- Correction (review finding 5): same as T-231 — the self-conformance
  requirement claim is live and owned by T-247 pending T-249; this record
  retires the realization shape only.
