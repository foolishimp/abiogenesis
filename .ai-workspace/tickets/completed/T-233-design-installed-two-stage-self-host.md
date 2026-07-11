# T-233 - Design Installed Two-Stage Self-Host

- id: T-233
- title: Design installed two-stage self-host and equivalence gate
- type: feature
- ticket_category: ordinary
- status: superseded
- closed_at: 2026-07-12
- terminal_disposition: superseded_by_course_correction
- disposition_authority: F_H course-correction ruling 2026-07-12, carried by T-242
- goal: abg-5-0-full-product-delivery
- phase: DS-5
- priority: high
- change_intent: >-
    Freeze the exact installed P4/I4 plus B5 plus S5 to C1/I1/C2 pipeline and
    the equivalence law that permits C1 to become R5.
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: M03 installed self-build execution/equivalence and M05 fixed-point proof/freeze
- dependencies:
  - T-232
  - T-239
  - T-225
- authority_refs:
  - specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md
  - specification/requirements/product/REQ-P-QUAL.md

## Target Truth

Exact installed I4 executes frozen B5 over frozen S5 to produce C1. C1 installs
as I1 without source fallback, admits the unchanged B5 under its 5.0
compatibility leg, and produces C2 from the same S5. A declared comparison over
release-significant identity, exports, compiled behavior, conformance, install
and catalog manifests, runtime binding, and B5 meaning establishes the fixed
point. C1 becomes immutable R5 only after equivalence passes.

## Required Work

1. Define immutable stage inputs, work roots, output manifests, and failure carriers.
2. Define installed-source isolation and same-B5/same-S5 checks.
3. Define deterministic surfaces requiring byte equality and declared
   nondeterministic surfaces requiring semantic equivalence.
4. Define comparison ownership, citable evidence, invalidation, and rerun law.
5. Define the freeze transition `R5 := C1` and prohibit post-freeze patching.
6. Publish the target map, IACS, carrier diagram, run order, and recovery rules.

## Closure Law

Close when T-234 can run both stages from installed products and decide the
fixed point mechanically from declared surfaces, with no mutable source,
private compiler, odd_glc substrate, or manual equivalence judgment.

## Non-Closure Conditions

- Stage two uses a different B5 or S5 identity.
- I1 imports executable runtime/provider/controller code from S5.
- C2 rather than C1 silently becomes the release candidate.
- Equivalence ignores a release-significant difference.
- Byte equality is demanded for admitted nondeterministic metadata without reason.

## Proof Surface

- stage carrier/IACS completeness review
- exact identity and isolation review
- equivalence-surface census
- invalidation/rerun review
- phase-end independent design review against T-218, PRODUCT, and SELFHOSTING

## Course-Correction Closure Record (2026-07-12)

- Disposition: superseded_by_course_correction
- Authority: F_H ruling 2026-07-12 ("run the course correction ... retire anything
  overblown"), carried by T-242; analysis: rev 3 of
  `.ai-workspace/comments/claude/20260711T151500Z_STRATEGY_5_0_course_correction_glc_over_abg_build_environment.md`.
- Reason: Designs the installed two-stage self-host and C1/C2 equivalence gate - a packaging fixed point over frozen source (post S3.1): provable precisely because it certifies nothing about how the software was built.
- Re-entry: The salvageable kernel - pack frozen source on predecessor and candidate installs, compare release-significant digests - re-enters as a single release-discipline gate (post S3.3) on demand.
- No code, specification, design, or release surface changed by this closure.
