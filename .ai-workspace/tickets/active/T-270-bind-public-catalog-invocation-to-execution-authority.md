# T-270 - Reconcile M5 Product Outcomes

- id: T-270
- title: Reconcile M5 Product outcomes through installed public paths
- type: correction
- ticket_category: design_and_realization_correction
- status: active
- phase_status: m5_s06_selected_under_t281
- review_status: s05_accepted_s06_authoring
- proof_status: s05_accepted_s06_pending
- goal: GOAL-035 M5
- priority: critical
- change_intent: >-
    Preserve accepted S03 and S05 while T-281 closes the product-neutral
    installed SDK, CLI, bounded Codex shell, and independent flavored Product
    path required by ABG5-S06.
- change_class: realization_refactor
- re_entry_point: >-
    T-281 over PRODUCT.md ABG5-S06, REQ-P-SCENARIOS-013,
    REQ-P-POLICY-044..045, and accepted M05 Sections 14.1..14.2
- triaged_at: 2026-07-26T16:51:19+10:00
- created_at: 2026-07-14
- updated_at: 2026-07-28
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- implementation_hold: s04_and_later_outcomes_held
- implementation_hold_effect: >-
    authorize only T-281/S06 and its bounded Prime gate; prohibit S04
    realization, qualification, release, and unrelated refactoring
- design_only_exception: >-
    S04 candidate 4897ead1 is frozen and parked. It does not participate in S06
    and authorizes no S04 design repair or realization.
- current_product_outcome: ABG5-S06
- accepted_s03_candidate_commit: 8865ccff844d06f4f97765f014ae2b59c1e7d84b
- accepted_s03_candidate_tree: f1a66a2c79f01972f063189bf7668fdb762ce2e6
- accepted_s03_m03_digest: 39b396c7d58b0e9e2a4c288baedb78462657210d1dac892bcf2a7045c63c1a85
- accepted_s03_m05_digest: b385ce64745cdb531d8002719d0a3a6f36995c6b8f2418e76eaecdaf46ef15a5
- accepted_s03_package_digest: e4345ce38807abd4a988aeff76c3d83274e88ed6e0926adfb635d07fe933732b
- accepted_s03_evidence: .ai-workspace/comments/codex/20260725T200436Z_CHECKPOINT_t270_s03_product_sealed_semantics_exact_candidate.md
- accepted_s03_review: .ai-workspace/comments/codex/20260725T211207Z_REVIEW_t270_s03_product_sealed_exact_candidate.md
- accepted_s03_decision: .ai-workspace/comments/codex/20260725T211500Z_DECISION_delegated_accept_s03_and_select_s05.md
- current_s05_basis_commit: 1ddc802d3003a3d0782398f7ec7c74cfa81ab127
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
- rejected_s05_candidate: 48103ed936aa9326d546f4dcd667b16a5c803f9c
- rejected_s05_candidate_tree: e954654fe57eff416808ca7370f43b8327a9f04d
- rejected_s05_candidate_disposition: retained_behavioral_stock_only
- rejected_s05_functional_stock: 425993da5894b78b6c88b939736dead3fd2e7f98
- rejected_s05_functional_stock_tree: e997884f14a05fe71f06e2c4a73bd924125fd7db
- rejected_s05_requirement_digest: 8f945dbb6b2e715e8a70a0643f69d469e68e258a6d2703ece921e54492374f44
- retained_s05_package_digest: 85ca145e7d6755285f9c18f999f840888f8637c3e9788e35dd702a476f16d733
- retained_s05_package_inventory_digest: 112d8cb84308315cf58c9e1e3f596423f219f4564247d9b326cbdbc6f8dd4ec3
- retained_s05_clean_checkout_proof: fresh_git_archive_without_generated_asset_directories
- retained_s05_evidence: .ai-workspace/comments/codex/20260726T073212Z_CHECKPOINT_t270_s05_clean_checkout_repaired_exact_candidate.md
- retained_s05_design_index_digest: ff5fcfbf4acd7179647e39a5b67dac44aa5d10aa8d04e72a82ebfe7ad119458b
- superseded_s05_submitter_response_candidate: 9f13d85e1088b50c88ec2529024408326ea9d98c
- superseded_s05_submitter_response_candidate_tree: e40fed0b94016250c2435f2d3af3ac29f433ce52
- superseded_s05_realization_candidate: 3a10bd562193e4028c38a37208cd6d8175be2609
- superseded_s05_realization_candidate_tree: 1a89378f3027443b37953e08a64520a39abf8d44
- superseded_s05_realization_candidate_evidence: .ai-workspace/comments/codex/20260726T204820Z_HANDOFF_t270_s05_realization_candidate_review.md
- superseded_s05_catalog_candidate: 5ceb940123dee9d64332d6a744a35194a171007d
- superseded_s05_catalog_candidate_tree: df8ba907cf0f1191b9984664605ad424eca9c960
- superseded_s05_catalog_candidate_evidence: .ai-workspace/comments/codex/20260727T041213Z_HANDOFF_t270_s05_catalog_prime_contracted_candidate.md
- superseded_s05_catalog_application_candidate: 8fde581d97dff06439c7de358e531f4f0d1525d9
- superseded_s05_catalog_application_candidate_tree: 2c9887db1b395501d78e7037dd89fb452f7cbf1d
- superseded_s05_catalog_application_candidate_evidence: .ai-workspace/comments/codex/20260727T054308Z_HANDOFF_t270_s05_policy_catalog_schema_repair_candidate.md
- superseded_s05_catalog_authority_candidate: c33ba46c4b9fdc49aca179fd3f111eb4357b1ce5
- superseded_s05_catalog_authority_candidate_tree: 8206b6846421725d2d6692b7b46d7d6c4f940e82
- superseded_s05_catalog_authority_candidate_evidence: .ai-workspace/comments/codex/20260727T074428Z_HANDOFF_t270_s05_catalog_application_authority_candidate.md
- superseded_s05_catalog_scope_timeout_candidate: 17c6444a39a4542f4bf7015d222ec0c383f4e2a8
- superseded_s05_catalog_scope_timeout_candidate_tree: b060bdee43f6882c7e4c832d1fbd4c727808accf
- superseded_s05_catalog_scope_timeout_candidate_evidence: .ai-workspace/comments/codex/20260727T103744Z_HANDOFF_t270_s05_catalog_scope_timeout_candidate.md
- current_s05_candidate: 1ddc802d3003a3d0782398f7ec7c74cfa81ab127
- current_s05_candidate_tree: b50684077f95867a079b8f5435db10d61384b881
- current_s05_candidate_package_digest: 7f5bbad797b85c5aff678aba225f409bfd168639a7c34a167af8fa08e1162376
- current_s05_candidate_package_inventory_digest: f41cc8cd0cada9a456925e7c9ac03b11a01ddd3697b0ff2a24f193215c804e58
- current_s05_candidate_product_content_digest: e40e6fe1e72e7fa6561da31118421831f912d889eff1203227bfb5d3b3301822
- current_s05_candidate_manifest_digest: 00a1f4cc3179bbab0b301f2222b152103ce266cb5212d518ca1f4a892fc9637c
- current_s05_candidate_evidence: .ai-workspace/comments/codex/20260727T151414Z_HANDOFF_t270_s05_direct_exit_timeout_candidate.md
- accepted_s05_candidate: 1ddc802d3003a3d0782398f7ec7c74cfa81ab127
- accepted_s05_decision: .ai-workspace/comments/codex/20260727T174956Z_DECISION_accept_s05_select_s06_park_s04.md
- superseded_s05_design_subject_aggregate: 6a809f94d011962d9888cfa8fa2f59dfd63c1163404db851d9c2eb6880ca2be1
- superseded_s05_design_handoff: .ai-workspace/comments/codex/20260726T165744Z_HANDOFF_t270_s05_global_to_local_design_review.md
- current_s05_design_subject:
  - specification/requirements/product/REQ-P-CONSENSUS.md
  - build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-045-global-design-constraints-survive-local-projection.md
- current_s05_design_requirement_digest: 12bab5c07ca0f9a0fe0075f1df8a766f4333cf43f8e347c03799b20f280eed89
- current_s05_design_delta_digest: f5d9d4445a66eda58fc8d8fcc4abd0d772913f40937a8d192e31d25044f1d2b5
- current_s05_design_adr_digest: de6301adfa25185d5eace74124530a852d9cebe4ce784263dd638bba03896755
- current_s05_design_subject_aggregate: 5d01783b843481fc60a3a947a65522bc53620dd01cc87350fe2e0441015567cb
- current_s05_design_mermaid_count: 3
- current_s05_design_handoff: .ai-workspace/comments/codex/20260726T175027Z_HANDOFF_t270_s05_consolidated_design_repair_review.md
- accepted_s05_design_commit: 283325aa082844ad4691ca07bb39882fda7152dc
- accepted_s05_design_tree: 96759ce55322bee5dc98d1ab926e8c60ef56f951
- accepted_s05_design_subject_aggregate: 5d01783b843481fc60a3a947a65522bc53620dd01cc87350fe2e0441015567cb
- accepted_s05_design_decision: .ai-workspace/comments/codex/20260726T182458Z_DECISION_direct_accept_s05_design_and_resume_realization.md
- current_s05_design_amendment_subject:
  - build_tenants/abiogenesis/typescript/design/M04_PUBLIC_OPERATION_DEFINITION_FAMILY_BEHAVIOR_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/adrs/ADR-046-catalog-application-binds-concrete-values-without-runtime-events.md
- current_s05_design_m04_digest: 9c689f8033dc5fe1fb2767d4b20f97445efb93eafd0c38807477dd53d0d845c2
- current_s05_design_m05_digest: 2f67fd2a29e59a22a33693096ce296aed885dce0752bcb95a76ec533c2071aeb
- current_s05_design_amendment_s05_digest: ee57d2b20bf9cbd382a8a804f1e84b553d8744da28fb6173d47f6d4e779f9387
- current_s05_design_adr046_digest: b5ed970eee8deb1e60673c1c338cb88d9a2d3d117f553dcd35eff705e2c0ca15
- current_s05_design_amendment_aggregate: 015a158a8a636502e76b88fe87866633757deca597832e1010099ba371e13c2d
- current_s05_design_amendment_status: pending_exact_candidate_review
- latest_s05_reviewed_candidate: 48103ed936aa9326d546f4dcd667b16a5c803f9c
- latest_s05_review: .ai-workspace/comments/codex/20260726T081217Z_REVIEW_t270_s05_provenance_repaired_exact_candidate.md
- latest_s05_review_disposition: rejected_by_requirement_reprice
- retained_behavioral_stock: bcd8769a8163a222e2e59400c904994b3de161fd
- retained_s05_rejected_stock: 48103ed936aa9326d546f4dcd667b16a5c803f9c
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
  -> reviewer findings -> exact attributed F_P submitter response
  -> ABG response admission -> next reviewer round binding
  -> through catalog, HoG, ABG, replay, project.read, and thin CLI
  -> without a Consensus-specific runner, controller, event family, or result authority
```

Completed T-274, T-275, and T-276 are implementation and proof evidence. They
do not independently select work or preserve old X authority.

T-268 produced exact design candidate `4897ead1`; independent review is now the
only selected S04 activity. T-270 remains the sole M5 realization owner, and
all S04 implementation remains held.

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
8. accepted `M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md`, with ADR-045 as
   rationale.

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
7. publish one canonical submitter F_P contract and response schema, bind one
   exact subject-attributed submitter profile per invocation,
   carry the complete admitted reviewer findings vector into its F_P task, and
   bind the exact response to the invocation and source round;
8. make every next reviewer round, including round two, impossible before
   Product validation and ABG admission of that exact submitter response;
9. reject missing response, wrong submitter, wrong prior round, forged
   response, and response unbound from the admitted findings vector without
   admitting any next-round runtime fact;
10. generate digest-bound serialized Consensus schema and vocabulary assets
   from the Product-owned source without adding a schema runtime or independent
   JSON authority;
11. expose agreement, dissent, unresolved, and typed `contract_failure`
   results plus replay through ordinary `project.read` and the thin CLI;
12. preserve unresolved F_H escalation only as a hold, response, and
    continuation inside the same admitted Run and causal ABG episode, pending
    direct human affirmation that no direct support invocation or rival result,
    continuation, or closure authority exists;
13. prove agreement, dispute recursion, and unresolved escalation across the
   existing, alternate, and temporary workspace applications, all through One
   Surface; and
14. retain S03, the external Product, M4, package reproducibility, and all
   causally applicable negative behavior.

Existing implementation may be retained wherever the derivation proves exact
agreement. Only a concrete S05 defect authorizes a bounded code change.

## Design Closure And Review Boundary

S05 design is a global-to-local constraint network. Before implementation
resumes it shall:

- resolve the complete Product function and its irreducible semantic
  relations;
- standardize identity, authority, lineage, authoritative events, Event
  Calculus, replay, refusal, retry, closure, persistence, and public projection
  once for the Product;
- project each global decision into an abstract module, interface, local
  obligation, and falsification condition;
- leave concrete helpers and equivalent algorithms to realization without
  leaving Product meaning, topology, lifecycle, or failure semantics open; and
- make a semantic choice discovered during coding a design re-entry, not a
  local implementation repair.

The worker may revise privately while authoring. It then runs mechanical checks
only, freezes one exact implementation subject, produces one handoff, and
stops. The accepted design is not recursively reviewed during realization. A
semantic contradiction returns to F_H rather than starting an autonomous
patch-review loop.

## Accepted S05 Boundary

S05 closed at exact candidate `1ddc802d`. Its enduring guarantees are:

- the complete S05 causal requirement and accepted-design path is satisfied;
- the current S05 design delta and module proof are directly accepted at one
  exact subject before implementation;
- `npm run test:m5:consensus` passes serially;
- `npm run test:m5:external` passes serially;
- `npm run test:m5` passes serially;
- `npm run test:m4` passes serially;
- two clean package builds have identical archive bytes, inventory, and
  digest;
- each catalog-application candidate is bound to one exact originating ABG
  operation context, is consumable once, and refuses cross-store,
  repeated, or post-close admission;
- contributor attribution is derived from the exact authorized workspace
  actor or an exact installed-Product attestation rather than from an
  unverified caller label;
- agreement, recursive dispute, and unresolved F_H escalation agree with
  replay in all three workspace applications;
- exact ticket bytes and resolved profile instructions reach every attributed
  reviewer through the declared F_P request;
- each complete admitted reviewer findings vector reaches the canonical
  attributed submitter F_P task, and its exact response is Product-valid and
  ABG-admitted against the source invocation and round before any successor
  round is bound;
- missing response, wrong submitter, wrong prior round, forged response, and
  response unbound from the admitted findings vector all refuse before a
  round-two GraphCall, Frame, reviewer task, C-call, or event is admitted;
- malformed attributed reviewer output produces a typed replay-visible
  `contract_failure` readable through the public Product but ineligible for
  F_H escalation;
- a valid reviewer candidate observed before timeout or non-zero process exit
  remains admissible while the exact failed process evidence remains
  replay-visible;
- output emitted only after timeout signaling or direct-process exit remains
  diagnostic process output and cannot become an admitted reviewer or
  submitter semantic result;
- transport failure without a valid preserved candidate and no-output failures
  remain ordinary failed/stopped ABG truth;
- schema and vocabulary identities resolve to generated digest-bound
  serialized assets and the matching native Product meaning;
- no special Consensus public verb, runner, scheduler, controller, event
  writer, result store, continuation, or closure path participates;
- the same-Run F_H topology receives direct human affirmation; and
- the exact implementation/design/evidence subject receives independent
  review and direct human acceptance.

## S06 Non-Closure Conditions

S06 remains open if:

- implementation resumes before direct acceptance of the exact design subject;
- code or code review must choose an unresolved semantic atom, authority,
  topology, interface direction, lifecycle, failure route, or closure relation;
- the canonical Consensus callable bypasses Program-owned One Surface
  selection or the existing `run.invoke(start)` path;
- host-language orchestration owns panel selection, rounds, reduction,
  recursion, escalation, or closure;
- Product candidates become ABG truth without ordinary admission;
- a catalog-application candidate can cross stores, be consumed more than
  once, survive origin closure, or attribute a Product contribution without
  exact Product attestation;
- worker output observed only after timeout signaling or direct-process exit
  can become an admitted semantic result;
- agreement, dissent, or `contract_failure` can enter the F_H support Program;
- a successor reviewer round can be constructed, bound, opened, or executed
  before the exact attributed submitter response is Product-valid and
  ABG-admitted against the complete source-round findings vector;
- a missing, wrong-submitter, wrong-prior-round, forged, or unbound submitter
  response can append next-round truth;
- the same-Run F_H topology is treated as accepted without direct human
  affirmation, or a direct support invocation or second Run is retained;
- schema validation and the native reviewer parser disagree;
- public result or ticket projection depends on mutable caller memory rather
  than replay;
- installed tests bypass the public path or substitute fixtures for Product
  behavior;
- integration tests substitute for missing module/design proof; or
- S04, conservation qualification, qualification, or release work enters the
  promoted subject.

## Exclusions

This ticket does not authorize:

- observer or tuner implementation;
- complete RC5 conservation reconciliation;
- qualification or release;
- a Product rewrite;
- a new ticket hierarchy;
- a Consensus-specific runtime, controller, event family, or public command;
- restoration of X or another rebuild; or
- speculative refactoring outside the four bounded S06 recurrence families.

## S06 Prime Gate

S06 is selected. Before its portability realization is promoted, one bounded
`realization_refactor` must consume, extend, or record a reasoned refusal to
commonize these recurrence families:

1. exact zero/one/many catalog coordinate lookup;
2. Product-local verified installed-module loading;
3. Product dependency topology; and
4. GTL declaration/publication construction.

These are the recurrence families S06 will exercise. The gate does not
authorize a repository-wide cleanup or changes to EventStore, Event Calculus,
replay, HoG traversal, ABG admission, or any authority boundary without a
demonstrated semantic divergence.
