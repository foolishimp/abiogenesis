# T-270 - Reconcile M5 Product Outcomes

- id: T-270
- title: Reconcile M5 Product outcomes through installed public paths
- type: correction
- ticket_category: product_delivery
- status: active
- phase_status: m5_s06_exact_candidate_under_review
- review_status: s03_s05_accepted_s06_candidate_pending_independent_review
- proof_status: s06_mechanical_proof_complete_semantic_acceptance_pending
- goal: GOAL-035 M5
- priority: critical
- change_intent: >-
    Preserve accepted S03 and S05 while T-281 closes the Product-neutral
    installed SDK, CLI, bounded Codex shell, and independent flavored Product
    path required by ABG5-S06. After S06 acceptance, freeze one unified M5
    candidate over the 16 selected 5.0 Product families.
- change_class: product_reprice
- re_entry_point: >-
    specification/PRODUCT.md selected feature family, required scenario, and
    completion-predicate surfaces, with matching GOALS and release
    applicability requirements
- triaged_at: 2026-07-28
- created_at: 2026-07-14
- updated_at: 2026-07-29
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- current_product_outcome: ABG5-S06
- implementation_hold: exact_s06_candidate_review_only
- implementation_hold_effect: >-
    hold exact S06 candidate 4c3bb239 immutable for independent review and
    direct disposition under T-281; prohibit further realization, design
    re-entry, planned 5.1 observer/tuner realization, unified M5 freeze, M6
    qualification, M7 release, and unrelated refactoring
- selected_5_0_feature_families: A5-F01..A5-F11,A5-F13..A5-F17
- selected_5_0_pre_rc_scenarios: ABG5-S01,ABG5-S02,ABG5-S03,ABG5-S05,ABG5-S06
- release_scenario: ABG5-S07
- deferred_5_1_feature: A5-F12
- deferred_5_1_scenario: ABG5-S04
- deferred_5_1_ticket: >-
    .ai-workspace/tickets/backlog/
    T-268-publish-abg-5-tenant-conformance-manifest-consensus-coverage.md
- current_s06_owner: T-281
- returned_s06_candidate: 516643930d0f909afa2d35f4243fc0231f9b4cdd
- current_s06_candidate: 4c3bb239cbdcfeb2587ff06ca736c77ce84af18f
- current_s06_candidate_tree: fa2adf47e2bf047af3778603562b0ee71890dcb6
- current_s06_package_sha256: ce1fa42b10d41dbb797f72932abe16b53f4916205b8377c862fefc520ead4785
- current_s06_package_inventory_sha256: a9298643c3445f094c09e161a4e5f99a221b91b23f54a1d8b3efda5ebb8e5c9b
- current_s06_handoff: >-
    .ai-workspace/comments/codex/
    20260729T045022Z_HANDOFF_t281_s06_native_verifier_repair_candidate.md
- returned_s06_design_candidate: b645595c16d23e98c7f65b958fcdf3e206ad3893
- returned_s06_design_candidate_tree: 130af56655ec46ec26ff66dd6a4f2bbe99d8bed8
- returned_s06_design_sha256: 815369932469eb6c833417116c63d130b0e9629b9721a0f8d429e693e0e69507
- current_s06_design_candidate: 4f80f84a826de86b4cfb4d9fec3baff428dcb44a
- current_s06_design_candidate_tree: 7070dca7d0f2ca90374b525faa60d5b810488763
- current_s06_design_sha256: ab44417157853490f4a3d8f9055b5eca8c295fd16f9615020b70e327f57c09fe
- accepted_s06_native_contract_design_commit: 4f80f84a826de86b4cfb4d9fec3baff428dcb44a
- current_s06_design_subject: >-
    build_tenants/abiogenesis/typescript/design/
    M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md
- returned_s06_design_handoff: >-
    .ai-workspace/comments/codex/
    20260728T161212Z_HANDOFF_t281_s06_native_contract_design_candidate.md
- current_s06_design_handoff: >-
    .ai-workspace/comments/codex/
    20260728T165447Z_HANDOFF_t281_s06_native_contract_design_repair.md
- selected_pre_m5_entropy_reduction: prime_compression_equivalence_classes
- selected_entropy_reduction_selection_class: goal_reprice
- selected_entropy_reduction_realization_class: realization_refactor
- selected_entropy_reduction_review: >-
    .ai-workspace/comments/claude/
    20260729T060000Z_REVIEW_prime_compression_equivalence_classes.md
- selected_entropy_reduction_state: blocked_by_s06_acceptance
- accepted_s03_candidate: 8865ccff844d06f4f97765f014ae2b59c1e7d84b
- accepted_s05_candidate: 1ddc802d3003a3d0782398f7ec7c74cfa81ab127
- selected_method_release: STDO v2.2.0
- selected_method_commit: 5326562f075d60052806d0d2c79d3db49671a8ea
- selected_method_member_set_digest: ca6dc3d5094fc5473380df45d76da3c52263c5c21c52a3af62f542c97db2f86c

## Purpose

T-270 is the sole active M5 parent. It coordinates one remaining 5.0 Product
outcome:

```text
accepted S03 + accepted S05
  -> exact ABG5-S06 installed portability subject
  -> independent review and direct acceptance
  -> one unified M5 freeze
  -> M6 qualification
  -> M7 release
```

The 2026-07-28 Product reprice removes `A5-F12` and `ABG5-S04` from 5.0 and
preserves them as planned 5.1 work under backlogged T-268. It changes no S06
meaning, design, code, acceptance predicate, candidate bytes, or evidence.
The frozen S04 design remains non-operative future input.

Historical candidates, rejected findings, and prior milestone narratives
remain in repository history and commentary. They do not occupy this active
execution surface.

## Governing Authority

Read this ticket through:

1. `specification/GOALS.md`;
2. `specification/PRODUCT.md`;
3. `specification/requirements/README.md`;
4. applicable live requirement families;
5. accepted M03 and M05 design;
6. accepted S05 design; and
7. active T-281 for the exact S06 boundary.

Higher authority governs any contradiction. Frozen candidates, comments,
reviews, completed tickets, and backlogged 5.1 design do not select work.

## Current Boundary

T-281 owns the exact S06 boundary. Native declaration closure is governed by
accepted `M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md`. Its realization is frozen
at candidate `4c3bb239`, tree `fa2adf47`, and is the sole review subject. S06
closes only when:

- native SDK and native CLI invoke one installed public operation contract;
- `abg.codex` is a convenience process shell over the exact installed CLI and
  provides no alternate Product or runtime functionality;
- one independently packed flavored Product uses declared installed exports,
  owns its Product meaning, and reaches the ordinary catalog, HoG, and ABG
  path;
- Product dependencies derive from verified Product declarations rather than
  caller-authored authority;
- exact native declaration meaning derives from packed export roots, complete
  local inventories, publisher-proposal/local-verification/linked-resolution
  separation, sole named-symbol contract authority, per-symbol namespace/star
  coverage, cross-Product augmentation refusal, owner-relative direct
  dependencies, final linked compiler truth, and one closure digest inside the
  resolved lock;
- the flavored Product consumes the accepted shared GTL constructors without
  rebuilding a third local declaration family;
- exact CLI substitution, missing-path, dependency, deep-import, and
  product-specific branch negatives fail closed;
- accepted S03/S05 behavior, M4, the external Product, and package
  reproducibility remain green; and
- independent review and direct F_H acceptance bind the exact candidate.

The accepted S06 design and T-281 own detailed realization and proof
conditions. This parent ticket does not restate or expand them.

## Prime Entropy Reduction Gate

Direct F_H instruction on 2026-07-29 selects one bounded Prime entropy
reduction after S06 acceptance and before the unified M5 freeze. The frozen
S06 candidate remains an immutable review subject; this gate does not amend or
expand S06.

This is algebraic normalization, not defect remediation. Code is a projection
of the accepted atomic design. One irreducible relation has one canonical code
definition; typed specializations, call sites, and compositions apply that
atom rather than reproduce it. A current behavioral divergence may reveal a
missing contraction, but finding or removing a defect is not the acceptance
criterion.

The selected review register identifies six claimed equivalence classes:

1. Product, Program, and GraphFunction coordinate identity;
2. canonical URI/reference construction;
3. the `Sha256Digest -> Identity` eliminator;
4. ordered sequence equality;
5. duplicate detection; and
6. common structural-guard composition.

Apply the Design Module Method before realization:

- inventory every definition and inline spelling in each candidate class;
- derive the smallest complete basis of irreducible typed relations,
  preconditions, authority neutrality, and lawful owner modules;
- place each existing spelling as a definition, typed application,
  composition, or non-member of that basis;
- prove that every member of one equivalence class is the same atom and that
  every genuinely different relation has a separately named atom;
- prove that contraction preserves Product meaning and module authority;
- resolve coordinate identity and sequence-equality semantics before coding;
- pause after the complete atomic design for independent review and direct
  acceptance; and
- realize the accepted algebra once, with focused projection and
  non-reproduction checks plus the retained M5/M4/package gates.

This gate adds no Product function, Prime family, catalog, runtime, controller,
event, or public operation. Each class must end with one accepted definition
for each genuinely irreducible relation. A claimed equivalence class may be
split only when the design proves materially different semantics; local
duplication may not survive merely because contraction is inconvenient.

## Delivery After S06

1. Record direct S06 acceptance without moving its immutable candidate.
2. Complete and directly accept one atomic design for the six selected Prime
   entropy-reduction classes.
3. Realize that accepted contraction once and run its focused equivalence
   projections and non-reproduction checks plus retained M5, M4, and
   reproducible-package gates.
4. Freeze one unified M5 candidate covering all 16 selected 5.0 Product
   families and the five selected pre-RC scenarios.
5. Activate T-247 and T-282 for exact-candidate self-conformance,
   qualification, released-STDO materialization, and conservation.
6. Activate T-248 only after M6 closes, then publish RC and stable 5.0 through
   `ABG5-S07`.
7. Leave T-268 in backlog until stable 5.0 and an explicit 5.1 Product re-entry.

## Non-Closure

T-270 remains open if:

- S06 realization resumes before its native-contract Ontology and design are
  independently accepted;
- S06 is accepted from a moving or different subject;
- the SDK, CLI, Codex shell, or flavored Product introduces alternate
  functionality, authority, catalog, traversal, runtime, or closure;
- code or review expands S06 into observer/tuner, qualification, release, or
  broad recurrence cleanup;
- unified M5 freezes before the selected six-class Prime entropy reduction is
  designed, independently accepted, realized, and mechanically verified;
- contraction merges semantically different coordinate, sequence, identity,
  reference, duplicate, or guard relations without a Design Module Method
  proof;
- the unified M5 freeze includes `A5-F12` or `ABG5-S04`;
- 5.0 qualification silently depends on the deferred observer/tuner Product;
  or
- history or commentary is treated as active authority.

## Exclusions

This ticket does not authorize:

- `A5-F12` or `ABG5-S04` design repair, realization, or qualification;
- S04 review as a 5.0 gate;
- complete RC5 conservation reconciliation before M6;
- qualification or release before their selected tickets activate;
- a Product rewrite, new ticket hierarchy, new catalog, compiler, lowered
  plan, controller, runtime, or event authority; or
- speculative refactoring outside the exact S06 boundary.
