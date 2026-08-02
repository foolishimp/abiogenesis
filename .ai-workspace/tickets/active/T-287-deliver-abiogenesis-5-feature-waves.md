# T-287 - Deliver ABIogenesis 5.0 Feature Waves

- id: T-287
- title: Deliver ABIogenesis 5.0 as five installed feature waves
- type: feature
- ticket_category: implementation_migration
- migration_strategy: 4_6_structural_adoption_then_feature_composition
- library_usage: extend
- library_rationale: >-
    Wave 1 begins by identifying recurrent authority-neutral algorithms already
    realized in immutable 4.6 and donor code, or supplied by an established
    common library, retaining or tightening one common implementation per
    proven law and composing typed Product adapters over those blocks instead
    of rebuilding local variants
- status: active
- phase_status: wave_1_a5_f10_run_stopped_projection_assessment
- review_status: first_holdsat_slice_accepted_next_slice_assessment_selected
- proof_status: first_holdsat_slice_accepted_a5_f10_feature_proof_pending
- goal: GOAL-035
- priority: critical
- change_intent: >-
    deliver the fixed 16-feature ABIogenesis 5.0 Product scope by conserving the
    immutable 4.6 foundation, correcting exact 5.0 authority deltas, composing
    common structural blocks through typed domain adapters, and proving one
    installed Product path
- change_class: goal_reprice
- downstream_change_classes: design_reframe,realization_refactor,implementation_migration
- re_entry_point: accepted first A5-F10 slice to stopped-Run projection assessment
- triaged_at: 2026-08-01
- updated_at: 2026-08-02
- owner: abiogenesis
- pen_holder: codex
- build_tenant: typescript
- predecessor_tickets:
  - T-270
  - T-281
- dependencies:
  - T-286
- selected_method: STDO v2.2.2 with the local migration refinement embedded below
- selected_method_commit: 0519129d63de10822ae6353fa0c5ce05d56f13e9
- selected_method_member_set_digest: 4cc6a10fca6b1a2c6991664d2a7ee19220401d95f3f1c0f4fa848c6a9ed81c21
- selected_feature_families: A5-F01..A5-F11,A5-F13..A5-F17
- selected_product_outcome: Wave_1_runtime_kernel
- selected_product_slice: W1_A5_F10_run_stopped_truth_projection
- selected_slice_cycle_stage: design_donor_assessment
- selected_slice_acceptance_interval: >-
    admitted run_stopped truth through typed Event Calculus and replay to the
    durable gap-reopen Public consumer without a raw-event currentness scan
- selected_slice_exhaustion: >-
    acceptance or rejection of the stopped-Run projection and its direct
    consumer migration exhausts this slice; it does not accept A5-F10, close
    Wave 1, or authorize another entity family
- immutable_reference_product: v4.6.0-rc.3
- deferred_feature_family: A5-F12
- deferred_scenario: ABG5-S04
- accepted_increment_0a_commit: 1242df2a26922cc59b817a9fa253191e49a18f52
- accepted_increment_0a_tree: 7a52912d186343a342838636dfafd95911b94821
- accepted_gate_1_candidate: 3f80ba2393a9dbe31e8379a3dbbde00a961b8e23
- accepted_gate_1_tree: 04906b1c29c5d66163c62d1fffcb8bc069096244
- accepted_56_key_census_blob: efe88cac85bd3bb071d4b5dd451dfadaec893c4f
- rejected_increment_1_candidate: 4dfb6766d0ce2d97728ec615d29250ce01f78018
- rejected_18_56_donor: 935b11dd
- last_lawful_pre_churn_control: 8c04012a61eb05ce7bbe31d108b805b7e99fe029
- superseded_design_evidence:
  - 607ec268b6a8b3ccdc5dc440b7970bad57b36924
  - 378c7f084a5ae08ad3180e99961a0a1de30cb647
  - 37b213611e438a72ee932492e42235823ebb3de4
  - 69c7d5dd94838c652619533a15ef06d9ae46e037
  - c0859be7fb0c779bf8a95be5b5b3c19e06c046c9
- accepted_first_holdsat_base_head: c0859be7fb0c779bf8a95be5b5b3c19e06c046c9
- accepted_first_holdsat_tracked_diff: b11a246992d8afc82256342cd5c7d9c1b82aa568
- accepted_first_holdsat_implementation_diff: 34cd68426836644c889ead1d1ae26bf38d244415
- accepted_first_holdsat_event_prefix_blob: 07ba16653d770c0a417d8cfb9f094b1d399cf384
- accepted_first_holdsat_test_blob: e41d55567d14e53ca0afd99155d566879fbb2705
- accepted_first_holdsat_transition_blob: 0ae2fae846736fa928f05cdc7da1f727d844479e
- proof_bindings:
  - ABI5-ROOT-001
  - ABI5-M5-EXT-001

## Purpose

Deliver ABIogenesis 5.0 from the working immutable 4.6 Product foundation.
The ticket selects functional feature outcomes, reference-derived structural
assessment, bounded design deltas, implementation, installed proof,
qualification, and release. It does not authorize a parallel 5.0 runtime or a
new framework for behavior already supplied by conforming 4.6 modules.

The five waves remain one closure-bearing ticket. Wave acceptance proves only
that wave. Ticket closure requires all five waves and the release milestones.

## Authority

Read in this order:

1. `specification/GOALS.md`;
2. `specification/INTENT.md`;
3. `specification/PRODUCT.md`;
4. applicable requirements under `specification/requirements/`;
5. the accepted M03 and M05 TypeScript design basis indexed by
   `build_tenants/abiogenesis/typescript/design/README.md`;
6. this ticket; and
7. exact 4.6, current-code, donor, event, projection, scenario, and release evidence.

T-270 and T-281 are superseded historical records. The prior W1.1a repair
receipts and their descendants are historical evidence. They do not select the
current boundary or supply implementation authority.

`build_tenants/common/design/` remains held prior-basis evidence and is not the
accepted M03/M05 authority selected above.

Draft commentary
`.ai-workspace/comments/codex/20260802T010023Z_DRAFT1_abiogenesis_5_common_building_block_design_principles.md`
records the design-meeting rationale. This ticket embeds the binding local
refinement; the commentary does not independently govern.

## Product Path

```text
developer-authored GTL.TypeScript
  -> raw admission and whole-Program validation
  -> one canonical admitted Program
  -> exact Product, install, workspace, lock, catalog, and implementation basis
  -> direct HoG traversal
  -> F_D | F_P | F_H implementation seam
  -> ABG-admitted events and Event Calculus
  -> deterministic replay and typed projections
  -> one exact 18-operation/56-key Public family
  -> installed SDK, CLI, and independent consumer
  -> qualification and immutable release
```

No wave may introduce a compiled Program, feature controller, Public
controller, second runtime, rival catalog, rival event authority, process-local
runtime truth, compatibility facade, or source-tree dependency for installed
consumers.

## Governing Realization Constitution

`build_tenants/abiogenesis/typescript/design/ABI5_REALIZATION_CONSTITUTION.md`
is the sole local STDO 2.2.2 disambiguation for entity lifecycle, recursive
reference frames, 4.6 and donor adoption, lawful technology, common libraries,
AI coding-plan trace, proportional review, worker/assessor control, and
rejection convergence. This ticket selects work under that constitution and
does not restate or amend it.

## Wave Order

| Wave | Feature families | Milestone state |
|---:|---|---|
| `W1` | `A5-F10`, `A5-F02`, `A5-F03`, `A5-F04` | active - first A5-F10 slice implementation |
| `W2` | `A5-F01`, `A5-F09`, `A5-F05`, `A5-F06` | pending W1 |
| `W3` | `A5-F14`, `A5-F07`, `A5-F08` | pending W2 |
| `W4` | `A5-F13`, `A5-F17`, `A5-F11` | pending W3 |
| `W5` | `A5-F15`, `A5-F16` | pending W4 |

## Wave 1 Functional Hierarchy

```text
Wave 1 runtime kernel
  -> A5-F10 event-sourced runtime truth
       -> event admission
       -> durable history
       -> Event Calculus
       -> replay
       -> typed runtime projections
       -> runtime consumers
  -> A5-F02 GTL authoring and validation
       -> raw Program admission
       -> whole-Program validation
       -> Program normalization and identity
       -> GraphFunction publication
       -> complete C algebra
  -> A5-F03 Graph, C, and direct HoG traversal
       -> admitted Program selection
       -> graph materialization
       -> structural traversal
       -> implementation and interaction resolution
       -> invocation admission
       -> retry and continuation reconstruction
  -> A5-F04 probabilistic result integrity
       -> raw result admission
       -> contract and identity validation
       -> evidence and attribution validation
       -> retry classification
       -> consequential outcome projection
```

The selected common realization blocks, lawful technology roles, common
library catalog, and new-algorithm rule are governed only by
`ABI5_REALIZATION_CONSTITUTION.md`. Phase 0 and later coding plans select its
rows; they do not maintain parallel lists in this ticket.

## Phase 0 - 4.6 Structural Building-Block Assessment

### Scope

Read-only assessment of:

- immutable `v4.6.0-rc.3`;
- current 5.0 code;
- accepted S03, S05, Gate 1, and Increment 0A evidence;
- later accepted 5.0 commits; and
- rejected branches only as selective donor evidence; and
- established common libraries or open-source products that could supply an
  identified authority-neutral building block.

No design, production, test, schema, package, fixture, goal, or ticket mutation
is authorized by the assessment itself.

### Required outputs

1. Recursive functional composition hierarchy for Wave 1.
2. Cross-cutting common-realization lattice.
3. Per-block 4.6/current/donor/external-library disposition matrix.
4. Functional-entity to common-block to typed-adapter mapping.
5. Authority-seam ledger covering author, admission, durable fact, projection,
   consumer, and competing-path disposition.
6. Exact 5.0 axiom-delta list for each retained or tightened block.
7. Competing-path deletion/internalization list.
8. Separate design and constructability verdicts.
9. Recommended first bounded A5-F10 implementation slice.
10. For every external candidate: exact supplied function, integration seam,
    license, maintenance, dependency, runtime, determinism, replay, packaging,
    and authority-leak assessment.

### Assessment matrix

| Field | Required evidence |
|---|---|
| functional frame | parent contract, purpose, entities, direct seams |
| common block | admitted computational domain and authority neutrality |
| 4.6 source | exact file, export, contract, tests, installed use |
| current 5.0 source | retained, diverged, duplicated, or absent relation |
| donor source | exact bounded improvement and excluded drift |
| external source | exact library/product function, version, license, and evidence |
| Product authority | owning Product and requirement relations |
| 5.0 delta | exact counterexample to unchanged 4.6 behavior |
| disposition | retain, tighten, transplant, externally adopt, replace, or delete |
| composition | typed adapter and direct consumers |
| competing path | exact deletion or internalization target |
| constructability | native substrate evidence or named gap |
| Wave 1 dependency | first feature and slice requiring the block |

### Phase 0 acceptance

Phase 0 passes when:

- 4.6 is treated as the presumptive implementation base;
- the functional hierarchy and common lattice remain distinct;
- every accepted common block is recurrent and authority-neutral;
- every functional entity retains one semantic owner;
- every semantic fact has one selected admission and projection path;
- every replacement has an exact 5.0 axiom counterexample;
- no active assessment gap requires inventing a parallel runtime or framework;
- the first implementation slice is bounded and constructable; and
- no production or test claim is implied by assessment acceptance.

## Wave 1 Delivery Plan

### Phase 1 - Common runtime foundation for A5-F10

Retain or tighten the 4.6 event log, Event Calculus, typed registry/ledger
projection patterns, durable-prefix boundary, replay, and common immutable
dictionary/state-transition algebra required by the selected A5-F10 adapters.

This phase creates no generic public store and no new Product operation. Common
blocks remain authority-neutral and tenant-local unless separately repriced.

### Phase 2 - A5-F10 typed runtime-truth compositions

Compose the common foundation through typed adapters for catalog, artifact,
invocation, continuation, retry, result, judgment, and closure truth. Deliver
them as bounded installed slices. Do not force distinct functional entities
through one adapter merely because their storage algebra recurs.

### Phase 3 - A5-F02 GTL authoring and validation

Compose common identity, immutable collection, graph, validation, contract, and
selection blocks into raw admission, whole-Program validation, canonical
normalization, GraphFunction publication, and complete C algebra.

### Phase 4 - A5-F03 Graph, C, and direct HoG traversal

Retain the complete 4.6 traversal-conservation behavior. Compose graph,
transition, selection, effect, ledger, and replay blocks through direct HoG,
implementation, interaction, invocation, retry, and continuation adapters.

### Phase 5 - A5-F04 probabilistic result integrity

Compose contract, validation, identity, transition, evidence, attribution,
ledger, and effect blocks into fail-closed probabilistic result admission and
consequential projections.

### Phase 6 - Installed Wave 1 composition

Integrate the four accepted feature compositions on one exact installed
candidate. Prove one Program identity, one HoG path, one ABG event authority,
one Event Calculus truth path, deterministic fresh-process replay, and
fail-closed probabilistic outcomes without a rival controller, registry,
ledger, fold, runtime, or source-tree dependency.

## Slice Delivery Cycle

Every implementation slice follows:

```text
select functional reference frame
  -> inspect accepted 4.6/current/donor/external implementations
  -> retain/tighten/transplant disposition
  -> design only the exact material 5.0 delta
  -> coding plan
  -> approval
  -> build
  -> code review
  -> module test
  -> composition test
  -> accept and continue
```

Design is rejected only for a material contradiction in the frozen frame.
Local implementation mechanics proceed to coding plans. Runtime propositions
proceed to tests and falsifiers.

Every accepted slice produces one working installed behavior. A feature closes
by accumulating accepted slices, not by withholding useful modular delivery
until the entire feature family is complete.

## Review And Worker Control

- The worker owns assessment and delivery within the selected frame.
- Assurance reports findings to Product control before sending the same
  substantive correction to the worker.
- Findings state evidence, violated axiom, global or local classification,
  smallest correction boundary, explicit non-changes, and advancement status.
- Assurance does not create a second implementation loop.
- A worker handoff is a transition, not an automatic stopping point.
- No stage advances while a known global counterexample remains.
- A local uncertainty does not reopen accepted parent or sibling frames.

## Current Authorization

Authorized now:

- read-only design/current-code/immutable-4.6/donor assessment of the selected
  stopped-Run projection boundary;
- one exact coding-plan transition under the worker/assessor model; and
- preservation of the accepted first `HoldsAt` slice, immutable 4.6, donor,
  and pre-existing worktree evidence.

Not authorized now:

- semantic design replacement;
- production, test, package-script, fixture, or generated-proof edits;
- schema, package identity, Public, or event-family changes;
- promotion of `c0859be7` or any superseded W1.1a design candidate;
- implementation before independent coding-plan acceptance; or
- acceptance of any Wave 1 feature.

## Historical Disposition

The former W1.1a scoped-artifact repair chain is superseded as active
instruction because it replaced reference-derived modular adoption with an
expanding generic artifact/lifecycle design. Its commits remain recoverable
evidence. The accepted Product features, Increment 0A falsifiers, 4.6
foundation, and exact construction evidence remain conserved.

No historical receipt, commentary post, rejected candidate, or donor branch
independently authorizes work under this rewritten ticket.

## Wave 1 Exit

Wave 1 closes only when one clean installed candidate proves:

- event-sourced runtime truth through ABG events and Event Calculus;
- one canonical admitted GTL Program;
- complete direct Graph, C, and HoG traversal;
- fail-closed probabilistic result integrity;
- deterministic fresh-process replay;
- one selected authority path per semantic fact;
- no competing controller, runtime, registry, ledger, fold, or process-local
  truth path; and
- conservation of applicable 4.6 behavior and accepted 5.0 evidence.
