# T-285 - Accept Direct-GTL Traversal Realization Design

- id: T-285
- title: Accept the bounded direct-GTL traversal realization design
- type: design
- ticket_category: ordinary
- status: active
- phase_status: m3_design_candidate_frozen_independent_review_pending
- review_status: independent_exact_design_review_pending
- proof_status: self_review_and_mechanical_gates_green
- goal: GOAL-035 M3
- priority: critical
- change_intent: >-
    derive one natively constructable realization boundary for direct traversal
    of admitted GTL.TypeScript through HoG with ABG-owned runtime truth
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- created_at: 2026-07-20
- triaged_at: 2026-07-20
- updated_at: 2026-07-20
- owner: abiogenesis
- pen_holder: codex
- predecessor: T-284
- m2_decision_ref: >-
    .ai-workspace/comments/codex/
    20260720T094323Z_DECISION_fh_accept_t284_and_authorize_m3.md
- accepted_constitutional_aggregate: f2a4c6970f6240ef52bdb04693a38b8430fe29027a2f8f10ed5c9f70ba32b72a
- accepted_requirement_aggregate: c0dcdc264db854f5a4d4f429a35a96e8bd8b4f9481a05cdf532cdfee60722473
- correction_vector_ref: >-
    .ai-workspace/comments/codex/
    20260720T023314Z_STRATEGY_t284_x_to_5_correction_vector.md
- correction_vector_sha256: 048a9fbca17736a544b4f3af9aabdbdf00a13ce41dd003d8cb29a015556466f4
- selected_migration_strategy: fundamental_re_adoption
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md
- design_subject_boundary: immutable_design_file_only
- design_index_ref: build_tenants/abiogenesis/typescript/design/README.md
- design_candidate_commit: c832515cadbd41c6089cc248dc65f38f15cb748f
- design_candidate_tree: 5876805a25009768acb28bd416e81c71a3c69a3b
- design_subject_blob: 7a3679d7f29c474635c57c318934803044db4a5c
- design_subject_sha256: d845c58952ba15d564467680f4e01649b8439a2dc2b1bacd7f5500328717b9e4
- design_subject_lines: 826
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260720T101336Z_SELF_REVIEW_t285_direct_gtl_design_candidate.md
- design_manifest_ref: >-
    .ai-workspace/comments/codex/
    20260720T101336Z_CHECKPOINT_t285_direct_gtl_design_candidate_manifest.md
- implementation_hold: active_until_m3_design_acceptance
- implementation_hold_effect: no mergeable successor implementation or donor carry-forward

## Purpose

Produce the smallest accepted `HOW` that can realize the constitutional
ABIogenesis 5.0 execution chain without recreating the compiled-plan,
generated-program, SDK-controller, plugin-controller, or private-event paths
retired by Product and T-284.

This ticket designs one boundary. It does not design all 17 Product outcomes,
implement the runtime, or reclassify donor code. It uses `ABI5-ROOT-001` as the
first executable slice while preserving extension points required by the
accepted traversal matrix.

## Governing Boundary

```text
GTL.TypeScript program or GraphFunction
  -> TypeScript local type check
  -> raw contract admission
  -> non-lowering GTL whole-program validation
  -> ABG invocation and binding admission
  -> direct HoG traversal of the admitted GTL graph
  -> host realization of declared F_D leaf seams
  -> ABG event, result, transition, and closure admission
  -> replay-derived SDK or CLI projection
```

The design must preserve these distinct owners:

- GTL owns topology, scope, contracts, routes, and composition;
- the GTL validator owns static whole-program judgment without lowering;
- HoG owns traversal mechanics and applies admitted transitions;
- host bindings realize declared leaf effects only;
- ABG owns admitted runtime truth, events, frames, evidence, results,
  transitions, replay, continuation, correction, and closure;
- catalog, SDK, and CLI are publication, invocation, or projection surfaces,
  never controllers.

## Required Design Evidence

1. one boundary-bounded Ontology slice derived from accepted Product and
   requirements;
2. entity/lifecycle completeness and authority matrices;
3. atomic-function and higher-order-composition derivation with whole-family
   Prime contraction;
4. one Irreducible Architectural Carrier Set, with subordinate payloads kept
   subordinate;
5. Mermaid domain, sequence, and lifecycle views over the same Ontology;
6. native-constructability evaluation against GTL.TypeScript, HoG, and ABG;
7. an executable absence-proof contract for compiled-plan and controller
   rivals, paired with positive supported-path proof;
8. a module ownership and dependency map for the fresh successor line;
9. an `ABI5-ROOT-001` implementation handoff identifying the first red
   frontier and exact proof lane; and
10. explicit deferred scope for F_P workers, Consensus, recursive One Surface,
    qualification, and release without losing their accepted identities.

## Non-Negotiable Design Laws

- GTL.TypeScript remains the only program language.
- The validator may lint and validate; it may not lower or author execution.
- HoG traverses the admitted GTL graph directly.
- GraphFunction always publishes a replayable constructive GTL graph template;
  an implementation binding may realize only a declared leaf seam.
- F_D functions emit typed candidate values; ABG admission creates runtime
  truth.
- No module outside ABG authors events, closure, replay, or invocation truth.
- No SDK, CLI, catalog, installer, worker, plugin, or feature runner owns a
  scheduler, selector, topology, execution basis, or continuation controller.
- The design must be realizable on the current selected substrate. Missing
  native capability is a named blocker, not an adapter fiction.

## Closure

T-285 may close only when:

- the design pack contains the required Ontology and all three behavioral
  views;
- every design element traces to accepted Product or requirement authority;
- Prime and native-constructability gates pass;
- the positive root path and rival-authority absence proofs are both defined;
- no unresolved Product or requirement contradiction remains;
- an independent exact-design review accepts the frozen design subject; and
- direct `F_H` accepts that exact subject before successor code is promoted.

The first implementation ticket must establish `ABI5-ROOT-001` before any
horizontal feature wave.
