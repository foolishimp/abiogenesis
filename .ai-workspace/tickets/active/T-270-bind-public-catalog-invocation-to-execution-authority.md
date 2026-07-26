# T-270 - Reconcile M5 Product Outcomes

- id: T-270
- title: Reconcile M5 Product outcomes through installed public paths
- type: correction
- ticket_category: design_and_realization_correction
- status: active
- phase_status: m5_s05_bounded_review_repair_exact_candidate
- review_status: s05_independent_exact_cut_pending
- proof_status: s05_bounded_review_repair_gates_green
- goal: GOAL-035 M5
- priority: critical
- change_intent: >-
    Preserve the accepted direct-GTL and S03 realization while reconciling the
    exact Consensus design, module, installed-public-path, result, replay, and
    negative evidence needed to accept ABG5-S05.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md Section 13 and its realized
    Product-owned Consensus boundary
- triaged_at: 2026-07-25
- created_at: 2026-07-14
- updated_at: 2026-07-26
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- implementation_hold: held_for_s05_exact_cut_review
- implementation_hold_effect: >-
    Only review or a bounded repair proved by review of the exact S05 candidate
    may proceed; S06, observer/tuner, complete conservation, qualification, and
    release remain held
- current_product_outcome: ABG5-S05
- accepted_s03_candidate_commit: 8865ccff844d06f4f97765f014ae2b59c1e7d84b
- accepted_s03_candidate_tree: f1a66a2c79f01972f063189bf7668fdb762ce2e6
- accepted_s03_m03_digest: 39b396c7d58b0e9e2a4c288baedb78462657210d1dac892bcf2a7045c63c1a85
- accepted_s03_m05_digest: b385ce64745cdb531d8002719d0a3a6f36995c6b8f2418e76eaecdaf46ef15a5
- current_m03_status_projection_digest: ccd8f79d333c4c681f5643acafac59458b661c7d1916eb929f9c7f065dd0cfaf
- current_m05_status_projection_digest: 8eefe639bbec51e82206da0df7b3d42954d798c2289a96f506a4b0a3775284e9
- accepted_s03_package_digest: e4345ce38807abd4a988aeff76c3d83274e88ed6e0926adfb635d07fe933732b
- accepted_s03_evidence: .ai-workspace/comments/codex/20260725T200436Z_CHECKPOINT_t270_s03_product_sealed_semantics_exact_candidate.md
- accepted_s03_review: .ai-workspace/comments/codex/20260725T211207Z_REVIEW_t270_s03_product_sealed_exact_candidate.md
- accepted_s03_decision: .ai-workspace/comments/codex/20260725T211500Z_DECISION_delegated_accept_s03_and_select_s05.md
- current_s05_basis_commit: 8865ccff844d06f4f97765f014ae2b59c1e7d84b
- superseded_s05_candidate: c4a0f42dd55a9dec963e514579fbfa81ea286786
- superseded_s05_candidate_tree: 6046a66a04de125b4639a32d022b87f9b64fac04
- superseded_s05_evidence: .ai-workspace/comments/codex/20260725T234029Z_CHECKPOINT_t270_s05_ordinary_path_consensus_exact_candidate.md
- superseded_s05_source_truth_candidate: 65b9cd542cda50adc072ed46be0d3ca270818b20
- superseded_s05_source_truth_candidate_tree: 62953f27cf7e1655139e9994e4c79b7e3c9808a5
- superseded_s05_source_truth_evidence: .ai-workspace/comments/codex/20260726T011331Z_CHECKPOINT_t270_s05_source_truth_repaired_exact_candidate.md
- superseded_s05_authority_candidate: cd94165699a6a73b1a9d8ffbd0e1ffa78f5a3624
- superseded_s05_authority_candidate_tree: 2a8d2319b1019dd6bdadfe65de85901b47b71480
- superseded_s05_authority_evidence: .ai-workspace/comments/codex/20260726T020457Z_CHECKPOINT_t270_s05_authority_relations_repaired_exact_candidate.md
- superseded_s05_review_candidate: 0de994eb030452a2835b44ae564e75443c119de2
- superseded_s05_review_candidate_tree: 6b5458a6d045af7f9fff4f867599412f75a27363
- superseded_s05_review_candidate_package_digest: 4ef65c896ab23b5b16343ccb590095c0354f7b8d95762b78ffe777a7d5b6f68a
- superseded_s05_product_path_candidate: 6a380544df8bdbd68db427aa80c278e37275c9bb
- superseded_s05_product_path_candidate_tree: 6f853a0db7f1b53b9b4e8e805b179f1552e1212f
- superseded_s05_product_path_evidence: .ai-workspace/comments/codex/20260726T041753Z_CHECKPOINT_t270_s05_product_path_repaired_exact_candidate.md
- current_s05_candidate: 3a955d6938856d09a0d8ef19af0bb629e20cd8a3
- current_s05_candidate_tree: 6acb6c81f22bafe4f3b4806826e5488cefe86b76
- current_s05_package_digest: 52b56666d2ebc0773204bcbf2298477a3f2414904a35190d866bc909ee2cc3cf
- current_s05_evidence: .ai-workspace/comments/codex/20260726T053300Z_CHECKPOINT_t270_s05_bounded_review_repair_exact_candidate.md
- retained_behavioral_stock: bcd8769a8163a222e2e59400c904994b3de161fd
- regression_bindings:
  - ABI5-ROOT-001
  - ABI5-M5-EXT-001
  - ABI5-S03-ACCEPTED-001
- selected_method_release: STDO v2.2.0
- selected_method_commit: 5326562f075d60052806d0d2c79d3db49671a8ea
- selected_method_member_set_digest: ca6dc3d5094fc5473380df45d76da3c52263c5c21c52a3af62f542c97db2f86c
- selected_method_adoption_receipt: .ai-workspace/comments/codex/20260725T060521Z_DECISION_adopt_stdo_2_2_for_abiogenesis_5.md

## Purpose

T-270 remains the sole active M5 parent execution contract. Its one selected
Product outcome is now:

```text
reconcile and reclose ABG5-S05
  -> through the packed ordinary GTL Consensus publication
  -> through catalog, HoG, ABG, replay, project.read, and thin CLI
  -> without a Consensus-specific runner, controller, event family, or result authority
```

Completed T-274, T-275, and T-276 are implementation and proof evidence. They
do not independently select work or preserve old X authority.

## Accepted S03 Basis

ABG5-S03 is accepted at exact candidate
`8865ccff844d06f4f97765f014ae2b59c1e7d84b`. The independent review found no
P0, P1, or P2 issue after reproducing S03 4/4, the external Product 36/36, M5
127/127, M4 26/26, and the exact 176-entry package.

The accepted S03 witnesses remain required regression evidence. Repeating or
expanding them is not current Product progress.

## Governing Authority

Read this ticket through:

1. `specification/GOALS.md`;
2. `specification/PRODUCT.md` `ABG5-S05`;
3. `specification/requirements/product/REQ-P-CONSENSUS.md`;
4. `specification/requirements/product/REQ-P-SCENARIOS.md`;
5. applicable GTL, ABG, public-contract, catalog, policy, replay, and
   continuation requirements;
6. accepted M03 direct-GTL design;
7. accepted M05 Sections 1 through 12; and
8. provisional M05 Section 13 plus completed T-274/T-275/T-276 evidence.

Higher authority governs any contradiction. Historical designs, tickets,
comments, and tests cannot silently reprice Product or requirements.

## Current Boundary

The S05 reconciliation shall:

1. derive the materially affected Consensus ontology and complete changed
   atomic/composed function family;
2. perform whole-family Prime contraction without assuming fewer functions or
   files is correct;
3. reconcile IACS, module ownership, public versus module-local visibility,
   domain, sequence, lifecycle, operational lifecycle, and applicable axioms;
4. bind the canonical SYSTEM-owned Consensus GraphFunction to the ordinary
   installed catalog, admitted One Surface Program, and exact Product-selected
   action/ConstructionIntent;
5. preserve ordinary HoG traversal and ABG admission for fan-out, fan-in,
   bounded recursion, F_P review, F_D reduction, F_H escalation, result,
   replay, and closure;
6. carry exact selected ticket bytes and resolved profile instruction
   bodies/schemas into every attributed reviewer task;
7. publish canonical digest-bound serialized Consensus schema and vocabulary
   assets without adding a schema runtime;
8. expose agreement, dissent, unresolved, and typed `contract_failure`
   results plus replay through ordinary `project.read` and the thin CLI;
9. prove agreement, dispute recursion, and unresolved escalation across the
   existing, alternate, and temporary workspace applications, all through One
   Surface; and
10. retain S03, the external Product, M4, package reproducibility, and all
   causally applicable negative behavior.

Existing implementation may be retained wherever the derivation proves exact
agreement. Only a concrete S05 defect authorizes a bounded code change.

## Acceptance

S05 closes only when:

- the complete S05 causal requirement and accepted-design path is satisfied;
- M05 Section 13 and module-owned proof are accepted at one exact subject;
- `npm run test:m5:consensus` passes serially;
- `npm run test:m5:external` passes serially;
- `npm run test:m5` passes serially;
- `npm run test:m4` passes serially;
- two clean package builds have identical archive bytes, inventory, and
  digest;
- agreement, recursive dispute, and unresolved F_H escalation agree with
  replay in all three workspace applications;
- exact ticket bytes and resolved profile instructions reach every attributed
  reviewer through the declared F_P request;
- malformed attributed reviewer output produces a typed replay-visible
  `contract_failure` readable through the public Product;
- schema and vocabulary identities resolve to canonical digest-bound
  serialized assets and the matching native Product meaning;
- no special Consensus public verb, runner, scheduler, controller, event
  writer, result store, continuation, or closure path participates; and
- the exact implementation/design/evidence subject receives independent
  review and direct human acceptance.

## Non-Closure Conditions

S05 remains open if:

- the canonical Consensus callable bypasses Program-owned One Surface
  selection or ordinary `run.invoke`;
- host-language orchestration owns panel selection, rounds, reduction,
  recursion, escalation, or closure;
- Product candidates become ABG truth without ordinary admission;
- public result or ticket projection depends on mutable caller memory rather
  than replay;
- installed tests bypass the public path or substitute fixtures for Product
  behavior;
- integration tests substitute for missing module/design proof; or
- S06, observer/tuner, conservation qualification, qualification, or release
  work enters the promoted subject.

## Exclusions

This ticket does not authorize:

- S06 portability repair;
- observer or tuner implementation;
- complete RC5 conservation reconciliation;
- qualification or release;
- a Product rewrite;
- a new ticket hierarchy;
- a Consensus-specific runtime, controller, event family, or public command;
- restoration of X or another rebuild; or
- speculative refactoring without a proved S05 defect.
