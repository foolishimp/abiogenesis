# T-284 - Freeze Donor Lines And Derive The ABIogenesis 5.0 Correction Vector

- id: T-284
- title: Freeze donor lines and derive the complete 4.6-to-5.0 correction vector
- type: analysis
- ticket_category: ordinary
- status: active
- phase_status: bounded_independent_review_repairs_in_progress
- review_status: independent_exact_cut_review_request_changes
- proof_status: replacement_candidate_rejected_vector_repairs_in_progress
- goal: GOAL-035 M2
- priority: critical
- change_intent: >-
    freeze every current donor line, reconcile retained 4.6 semantics and
    accepted 5.0 authority, and establish a no-silence selective-admission
    boundary before replacement design
- change_class: requirement_reprice
- re_entry_point: specification/requirements
- created_at: 2026-07-20
- triaged_at: 2026-07-20
- updated_at: 2026-07-20
- owner: abiogenesis
- pen_holder: codex
- predecessor: T-283
- accepted_product_candidate: afb35def08b2259046830f87c18b45c95c84001c
- accepted_product_aggregate: c85ca7ae34352b91d579fcfae035ca3aa3d9a27428b584ac81c425b0d837d260
- x_freeze_ref: >-
    .ai-workspace/comments/codex/
    20260720T022230Z_CHECKPOINT_t284_x_freeze_manifest.md
- x_source_commit: 1b8b2b0a22ad5dc484e3db5c19fd562cd7935ff8
- x_snapshot_commit: 676766a648066eaa69dce05f636d5ec98fb40dec
- x_snapshot_ref: archive/t284-x-freeze-20260720T022230Z
- final_integration_freeze_ref: >-
    .ai-workspace/comments/codex/
    20260720T032908Z_CHECKPOINT_t284_final_integration_freeze_manifest.md
- final_integration_snapshot_commit: 3c2d86d43d851fda0ce4a08a124beac2d3770f2d
- final_integration_snapshot_ref: archive/t284-final-integration-freeze-20260720T032908Z
- correction_strategy: fresh_zero_inherited_5_successor_with_selective_donor_admission
- selected_migration_strategy: fundamental_re_adoption
- donor_basis: rc5_x_and_final_integration_sideways
- correction_vector_ref: >-
    .ai-workspace/comments/codex/
    20260720T023314Z_STRATEGY_t284_x_to_5_correction_vector.md
- correction_vector_sha256: 1aee805fa502ec233c71ca05b1e26c7c88efa070484942764504d7a59b75946c
- superseded_candidate_commit: 4ac6617c6450234cfb1c20112a89c286f4e6e7ce
- superseded_candidate_tree: 8921125d947428066618b93f140eb306e286a62c
- superseded_constitutional_subject_files: 85
- superseded_constitutional_subject_sha256: bc7db5d0d8a172e2ddaf6469853336109b6960742d3cef30380e41a15c475b00
- superseded_requirement_amendment_sha256: e532304300acfcd127632304bc9373d3d64937428b3ae562e0f9b4ed19ab55a4
- superseded_candidate_manifest_ref: >-
    .ai-workspace/comments/codex/
    20260720T051507Z_CHECKPOINT_t284_repaired_candidate_manifest.md
- superseded_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260720T051041Z_SELF_REVIEW_t284_repaired_candidate.md
- replacement_candidate_commit: 7f69aa83e295f0c391616a3a3a2acfafb8f20156
- replacement_candidate_tree: da12ce31f7ad5dce29d53d0d67750b011ab25f35
- constitutional_subject_files: 86
- constitutional_subject_sha256: 5f1fb2cfcd3223b94a591757dc38a3f5dd7036befc40629e8e5b1b3e8cae7b69
- requirement_amendment_sha256: d7f88193122d015cb0cfbeb8e9d556c4e0c36a85ffdbf9dfe78054283f3163cf
- replacement_candidate_manifest_ref: >-
    .ai-workspace/comments/codex/
    20260720T060344Z_CHECKPOINT_t284_replacement_candidate_manifest.md
- replacement_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260720T060225Z_SELF_REVIEW_t284_replacement_candidate.md
- implementation_hold: active
- implementation_hold_effect: no design acceptance, code, test, generated-manifest, package, qualification, or release changes
- constitutional_refreeze: frozen_independent_review_pending
- x_carrier_membership_ref: >-
    .ai-workspace/comments/codex/
    20260720T055423Z_EVIDENCE_t284_x_carrier_membership.md
- rejected_replacement_review_ref: >-
    .ai-workspace/comments/codex/
    20260720T065243Z_REVIEW_t284_replacement_candidate_independent_agent.md
- rejected_replacement_review_verdict: request_changes

## Purpose

Establish immutable observation bases for RC5, X, and final-integration and
derive the smallest complete correction vector from the immutable 4.6 RC5
semantic origin and all frozen implementation donor lines to the accepted
ABIogenesis 5.0 Product.

This ticket performs classification. It does not accept X, design the
replacement, or implement a correction.

Its ticket category is `ordinary` because T-284 changes requirements and
selects the successor migration strategy but moves no implementation. The
later realization carrier must declare `ticket_category:
implementation_migration`, `migration_strategy: fundamental_re_adoption`, and
the complete ticket-method migration contract. The selected strategy and donor
basis above are T-284 outputs, not a locally invented migration-strategy value.

The successor realization begins with no inherited TypeScript implementation.
RC5, X, and final-integration are immutable donor and evidence lines, not
successor merge bases. No donor commit, subtree, dirty snapshot, stash, or
active-ticket queue may be migrated wholesale. Each retained behavior must
cross a target-obligation and authority admission before entering the fresh
successor.

Independent review found Product/requirement authority contradictions in
direct invocation and saga scheduling. This ticket therefore re-enters at
requirements before M3. Product and Intent remain stable unless the bounded
repair exposes a contradiction that cannot be resolved at requirement level.

## Inputs

1. the exact 4.6 RC5 semantic origin and conservation law in accepted
   `PRODUCT.md`;
2. accepted 5.0 candidate `afb35def`;
3. the complete 40-row traversal inventory and separate fibre-substitution
   differential;
4. the 17 Product outcomes, seven scenarios, root `ABI5-ROOT-001`, exclusions,
   and release subjects;
5. the exact RC5 implementation inventory;
6. the exact X commit, dirty patch, staged state, untracked inventory, and
   current held tickets and designs;
7. the exact final-integration planning and transport commits, dirty snapshot,
   and rejected-stash archive; and
8. predecessor release claims and practical repairs that must not disappear by
   silence.

## Three Independent Dimensions

Every semantic row shall carry:

| Dimension | Values |
|---|---|
| 4.6 semantic disposition | `conserved` · `superseded` · `intentionally_removed` · `not_applicable` · `unresolved` |
| accepted-5.0 target coverage in X | `satisfied` · `partial` · `missing` · `contradictory` |
| X carrier action | `retain` · `refactor` · `replace` · `create` · `delete` · `archive` |

Semantic disposition, target coverage, and carrier action shall not imply one
another. Naming similarity is not conservation. Patch absence is not semantic
loss where successor-native behavior proves the claim. A carrier is not
deleted merely because its current authority is invalid; useful validation,
diagnostic, contract, event, replay, or implementation behavior may be retained
under the accepted owner split.

## Required Outputs

1. reproducible X and final-integration freeze manifests;
2. one complete RC5 implementation disposition under Fundamental Re-Adoption;
3. one no-silence correction vector binding every row to source evidence,
   accepted target authority, current X evidence, all three dimensions,
   rationale, confidence, and unresolved decision;
4. one carrier census at semantic module/capability altitude plus an exact
   first-match membership partition over every frozen X tenant path, with no
   generic fallback that can imply an archive disposition;
5. bounded requirement amendments restoring the Product owner split;
6. one disposition for each held active ticket;
7. one explicit deletion set limited to carriers with no retained semantic or
   evidential value; and
8. one refrozen constitutional/vector subject for independent review before M3.

The vector is commentary and review evidence. It is not accepted design.

## Closure

T-284 may close only when:

- RC5, X, and final-integration identities and inventories reproduce;
- every 4.6 baseline obligation and accepted 5.0 outcome is represented without
  silence or conflation;
- every RC5 implementation family and relevant X/final-integration carrier has
  one explicit method class, action, destination, admission order, and proof;
- the X first-match predicates classify every frozen tenant path into an
  explicit reviewed family without a generic fallback and reproduce the
  recorded path count, per-family counts, and membership digest;
- contradictions and unresolved semantic decisions are visible;
- direct invocation and saga-frontier requirements agree with Product's
  GTL/HoG/ABG/catalog authority split;
- ticket dispositions derive from the vector rather than precede it;
- independent review finds no missing baseline claim, substituted property, or
  carrier-action inference; and
- the refrozen exact subject is independently accepted before M3 receives one
  bounded direct-GTL design input.

Runtime implementation remains held throughout T-284.
