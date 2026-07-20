# T-284 - Freeze X And Derive The ABIogenesis 5.0 Correction Vector

- id: T-284
- title: Freeze current X and derive the complete 4.6-to-5.0 correction vector
- type: analysis
- ticket_category: realization_correction
- status: active
- phase_status: x_freeze_pending
- review_status: pending
- proof_status: pending
- goal: GOAL-035 M2
- priority: critical
- change_class: design_reframe
- re_entry_point: build_tenants/common/design
- created_at: 2026-07-20
- triaged_at: 2026-07-20
- updated_at: 2026-07-20
- owner: abiogenesis
- pen_holder: codex
- predecessor: T-283
- accepted_product_candidate: afb35def08b2259046830f87c18b45c95c84001c
- accepted_product_aggregate: c85ca7ae34352b91d579fcfae035ca3aa3d9a27428b584ac81c425b0d837d260
- implementation_hold: active
- implementation_hold_effect: no design acceptance, code, test, generated-manifest, package, qualification, or release changes

## Purpose

Establish one immutable observation basis for the current realization `X` and
derive the smallest complete correction vector from the immutable 4.6 RC5
semantic origin through X to the accepted ABIogenesis 5.0 Product.

This ticket performs classification. It does not accept X, design the
replacement, or implement a correction.

## Inputs

1. the exact 4.6 RC5 semantic origin and conservation law in accepted
   `PRODUCT.md`;
2. accepted 5.0 candidate `afb35def`;
3. the complete 40-row traversal inventory and separate fibre-substitution
   differential;
4. the 17 Product outcomes, seven scenarios, root `ABI5-ROOT-001`, exclusions,
   and release subjects;
5. the exact X commit, dirty patch, staged state, untracked inventory, and
   current held tickets and designs; and
6. predecessor release claims and practical repairs that must not disappear by
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

1. one reproducible X freeze manifest;
2. one no-silence correction vector binding every row to source evidence,
   accepted target authority, current X evidence, all three dimensions,
   rationale, confidence, and unresolved decision;
3. one carrier census at semantic module/capability altitude rather than a
   file-count ontology;
4. one disposition for each held active ticket;
5. one explicit deletion set limited to carriers with no retained semantic or
   evidential value; and
6. one bounded input contract for M3 replacement design.

The vector is commentary and review evidence. It is not accepted design.

## Closure

T-284 may close only when:

- X identity, dirty patch, staged state, and untracked inventory reproduce;
- every 4.6 baseline obligation and accepted 5.0 outcome is represented without
  silence or conflation;
- every relevant X carrier has one explicit action and rationale;
- contradictions and unresolved semantic decisions are visible;
- ticket dispositions derive from the vector rather than precede it;
- independent review finds no missing baseline claim, substituted property, or
  carrier-action inference; and
- M3 receives one bounded direct-GTL design input.

Runtime implementation remains held throughout T-284.
