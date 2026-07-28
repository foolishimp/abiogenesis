# T-270 - Reconcile M5 Product Outcomes

- id: T-270
- title: Reconcile M5 Product outcomes through installed public paths
- type: correction
- ticket_category: product_delivery
- status: active
- phase_status: m5_s06_candidate_frozen_under_t281
- review_status: s03_s05_accepted_s06_independent_review_pending
- proof_status: s06_mechanical_evidence_green
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
- updated_at: 2026-07-28
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- current_product_outcome: ABG5-S06
- implementation_hold: later_outcomes_held
- implementation_hold_effect: >-
    authorize only exact S06 review and disposition under T-281; prohibit
    planned 5.1 observer/tuner realization, M6 qualification, M7 release, and
    unrelated refactoring until the current gate closes
- selected_5_0_feature_families: A5-F01..A5-F11,A5-F13..A5-F17
- selected_5_0_pre_rc_scenarios: ABG5-S01,ABG5-S02,ABG5-S03,ABG5-S05,ABG5-S06
- release_scenario: ABG5-S07
- deferred_5_1_feature: A5-F12
- deferred_5_1_scenario: ABG5-S04
- deferred_5_1_ticket: >-
    .ai-workspace/tickets/backlog/
    T-268-publish-abg-5-tenant-conformance-manifest-consensus-coverage.md
- current_s06_owner: T-281
- current_s06_candidate: 33ab384b14f7feb1bbab42f16c03f1724270eafd
- current_s06_candidate_tree: a5b86b5441666d679a86a6bc61da892883eab1ab
- current_s06_package_digest: 6005326e627cc57ccf4a72f2bb85f1ccc7306f6b7e5a7dc6f965f5fb6f85afd3
- current_s06_package_inventory_digest: b5ef43c73b4adf827bcee2ba214678543564e7e424808e0b8d50c5a8305a3fec
- current_s06_evidence: >-
    .ai-workspace/comments/codex/
    20260728T102300Z_HANDOFF_t281_s06_readiness_contract_candidate.md
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

T-281 owns the exact S06 review subject. S06 closes only when:

- native SDK and native CLI invoke one installed public operation contract;
- `abg.codex` is a convenience process shell over the exact installed CLI and
  provides no alternate Product or runtime functionality;
- one independently packed flavored Product uses declared installed exports,
  owns its Product meaning, and reaches the ordinary catalog, HoG, and ABG
  path;
- Product dependencies derive from verified Product declarations rather than
  caller-authored authority;
- the flavored Product consumes the accepted shared GTL constructors without
  rebuilding a third local declaration family;
- exact CLI substitution, missing-path, dependency, deep-import, and
  product-specific branch negatives fail closed;
- accepted S03/S05 behavior, M4, the external Product, and package
  reproducibility remain green; and
- independent review and direct F_H acceptance bind the exact candidate.

The accepted S06 design and T-281 own detailed realization and proof
conditions. This parent ticket does not restate or expand them.

## Delivery After S06

1. Record direct S06 acceptance without moving its immutable candidate.
2. Freeze one unified M5 candidate covering all 16 selected 5.0 Product
   families and the five selected pre-RC scenarios.
3. Activate T-247 and T-282 for exact-candidate self-conformance,
   qualification, released-STDO materialization, and conservation.
4. Activate T-248 only after M6 closes, then publish RC and stable 5.0 through
   `ABG5-S07`.
5. Leave T-268 in backlog until stable 5.0 and an explicit 5.1 Product re-entry.

## Non-Closure

T-270 remains open if:

- S06 is accepted from a moving or different subject;
- the SDK, CLI, Codex shell, or flavored Product introduces alternate
  functionality, authority, catalog, traversal, runtime, or closure;
- code or review expands S06 into observer/tuner, qualification, release, or
  broad recurrence cleanup;
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
