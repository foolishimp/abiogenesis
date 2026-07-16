# T-280 - Realize One Surface Authority Functions

- id: T-280
- title: Realize the four One Surface authority functions and construction-intent admission
- type: feature
- ticket_category: implementation_prerequisite
- status: active
- phase_status: repaired_design_accepted_implementation_authorized
- review_status: repaired_design_fh_accepted_independent_implementation_review_pending
- proof_status: bounded_implementation_pending
- delivery_phase: DS-2 integration prerequisite
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Realize AF-11 synthesizeModel, AF-12 evalGap, AF-13 evaluateNext, and
    AF-16 evaluateAction as four distinct program-declared semantic authorities
    interpreted and admitted by ABG; lower their exact program-level typed
    application through existing C interiors and T-262 recurse/foldback; and
    supply the exact AF-14 selection/admission union consumed by T-270 without
    adding a public operation, C constructor, controller, selector, or
    Consensus-specific runtime branch.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design M03/M04 One Surface semantic
    authority and program-interpretation boundary
- triaged_at: 2026-07-16
- created_at: 2026-07-16
- updated_at: 2026-07-16
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- migration_strategy: reconcile_precursors_then_hard_break
- library_usage: commonize
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts One Surface
    authority family and existing construction observation, catalog, priority,
    intent, evidence, and replay carriers
- dependencies:
  - ratified T-278 Ontology digest f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8
  - accepted T-270 reconciled run.invoke design digest 71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430
  - accepted T-272 reconciled continuation design digest 1b879535201080f5ed7da4bc781bd447fa46c72ad5f500c71e73e0b0ed62b0b2
  - completed T-257 F_P result-contract admission
  - completed T-267 whole-program conservation
  - completed T-271 complete C-program interpreter
  - completed T-262 typed recurse and foldback runtime
- downstream_dependencies:
  - T-270 consumes AF-13 selection and AF-14 ConstructionIntent at AF-15
  - T-272 consumes AF-16 post-response evidence truth and preserves AF-17 separately
  - T-276 proves the installed primary operator loop
- authority_refs:
  - specification/GOALS.md lines 148..151 and 175..180
  - specification/PRODUCT.md Outcome Compute Contract and One Surface
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md One Surface runtime operation family
  - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md 001..017
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md 001..026
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md 029..030
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md 001..006, 008, 014
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md 001..009
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md 021, 030
  - specification/requirements/product/REQ-P-POLICY.md 054
  - specification/requirements/product/REQ-P-SCENARIOS.md 003, 012
- ontology_ref: >-
    build_tenants/abiogenesis/typescript/design/
    ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md
- ontology_commit: 59e9dce4f47c1a2b6e7cb9ef140dbae39ea4143c
- ontology_digest: f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8
- prime_contraction_refs:
  - PC-007
  - PC-011
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_ONE_SURFACE_AUTHORITY_BEHAVIOR_DESIGN.md
- superseded_independently_reviewed_candidate_digest: e507773cc41a86f25df0f2625620258a07701b0ea6575154616cdd1f39f69214
- superseded_accepted_design_digest: 411ab4e3bbd978a45b7c136b5f0c17e55508a9c8cad5a7b1e5fdf45fe6733758
- superseded_independent_design_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T084027Z_REVIEW_t280_one_surface_authority_design.md
- superseded_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T084027Z_DECISION_fh_accept_t280_one_surface_authority_design.md
- rejected_first_event_binding_candidate_digest: >-
    9bf1577056bb5dc2a111d6cdc95ca7626864179868f99023ddfb50d6d84efa18
- repaired_candidate_digest: >-
    de845b3c31f1d1255ab99ce07503078f7b890b09029ad3b847d3f1762051a81a
- accepted_repaired_gate_complete_design_digest: >-
    952c57d2340d05a299a147d55bfc2f8154494d3394ece75064ee5d6f8f17242e
- event_binding_implementation_audit_ref: >-
    .ai-workspace/comments/codex/
    20260716T095513Z_REVIEW_t280_event_binding_implementation_audit.md
- repaired_independent_design_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T102558Z_REVIEW_t280_event_binding_repair.md
- repaired_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T102558Z_DECISION_fh_accept_t280_event_binding_repair.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T102558Z_DECISION_fh_accept_t280_event_binding_repair.md

## Boundary

The admitted `GtlProgram` declares the One Surface composition. ABG interprets
that declaration and admits the results of four distinct semantic authorities:

```text
AF-11 synthesizeModel
-> AF-12 evalGap
-> AF-13 evaluateNext
-> AF-14 admitConstructionIntent when one new action is selected
-> AF-15 T-270 execution admission and invocation
-> AF-16 evaluateAction over complete admitted evidence
-> exact next basis and declared recursion
```

T-280 owns AF-11, AF-12, AF-13, AF-16, and the AF-14 admission boundary. It
does not own AF-15, public invocation, F_H response, current-intent
continuation, public projection, or the surrounding program order. T-270
starts only from an admitted AF-14 result.

One closed native definition/admission family may author the four authority
variants. Their inputs, outputs, result identities, admission rules, event
truth, and semantic owners remain distinct. Shared code cannot transfer model,
gap, selection, or closure authority.

## Proportional Scope

The supported environment is one trusted developer desktop. Defend the
foreign and likely-failure boundaries:

- malformed or incomplete GTL declarations;
- missing, duplicate, reordered, cross-program, or type-incompatible authority
  bindings;
- stale or mismatched refs and digests at admission;
- malformed, incomplete, contradictory, or unattributed F_P output; and
- incomplete evidence offered as closure truth.

Do not add hostile in-process forgery defense, filesystem tamper resistance,
cryptographic session machinery, a second replay store, or adversarial local
plugin hardening.

## Prime And Lawful Construction

- Four semantic authorities remain four; Prime does not merge their meaning.
- One closed discriminated definition/admission family authors their common
  identity, host, input/output, effect, and admission fields.
- Existing construction observation, action-catalog, priority, intent,
  evidence, and replay carriers are reconciled or derived. They are not copied
  into a parallel One Surface codebase.
- `ActionCatalog` is a program/view-derived candidate projection. AF-13 alone
  owns current eligibility, ranking, and selected-or-no-action truth.
- AF-14 validates and admits the AF-13 selection; it does not choose again.
- The admitted GTL composition owns ordering. One compiled application binding
  proves its exact joins; T-271 owns only each member's C interior and T-262
  owns recurse/foldback. No service method, loop, SDK, CLI, ingress, plugin, or
  test harness becomes the controller.
- No new public operation identity is added. `run.invoke`, `run.continue`, and
  `project.read` remain the applicable public projections.

## Implementation Sequence

1. Reconcile the current construction precursors into one closed
   `OneSurfaceAuthorityDefinition<K>` and function-specific input/output family.
2. Add exact native constructors/admitters and program-membership checks for
   AF-11, AF-12, AF-13, AF-16, and AF-14.
3. Bind each AF-11/12/13/16 member's exact result-bearing C-call through the
   existing locus-only open, fibre selection, authority snapshot, observed and
   validated payload, admitted evidence, evidence enclosure, result admission,
   and judgment facts. Derive success/refusal truth through one total replay
   projection and application-bound `RuntimeDerivedFluentRule`; add no event
   kind or field and register empty replay-aid effects only.
4. Extend static/semantic compilation to reject missing, duplicate, reordered,
   type-incompatible, cross-program, and refinement-incomplete One Surface
   bindings with typed gaps.
5. Lower the admitted program-level application through existing composition,
   per-function T-271 C interiors, AF-14/T-270/AF-16 joins, and T-262
   recurse/foldback; do not add a C constructor or controller loop.
6. Prove a non-Consensus Scenario-09 lab program through the same atoms.
7. Prove malformed F_P and incomplete evidence cannot reach AF-16 close truth.
8. Hand only the admitted AF-14 `ConstructionIntent` to T-270; retain AF-15 as
   that ticket's boundary.

## Exit

1. AF-11, AF-12, AF-13, and AF-16 have distinct nominal inputs, outputs,
   authority identities, admission events, and tests while deriving common
   definition shape from one authoring source.
2. One admitted `GtlProgram` declares their composition and nested refinement;
   one Prime application relation proves AF-11/12/13/14/T-270-AF-15/AF-16 and
   T-262 joins before T-271 enters any member interior.
3. AF-11 cannot observe the mutable worksite; AF-12 cannot select; AF-13 cannot
   invoke or close; AF-16 cannot select the next action; AF-14 cannot re-rank.
4. AF-13 is total over the closed existing action union. AF-14 admits at most
   one matching new intent only for callable, internal-vector, reentry, or
   repair variants; continuation, F_H, ticket, reprice, terminal, and no-action
   results never cross T-270.
5. Malformed F_P output fails through T-257 before admitted evidence. AF-16
   consumes only a complete admitted evidence set and is the sole creator of
   `EdgeFulfillmentLedger` and `EdgeClosureDecision` truth.
6. A newer observation under the same `WorkspaceBinding` creates a fresh
   snapshot, not an authority fork. Cross-basis or cross-program values refuse.
7. The non-Consensus lab fixture compiles with the same family and contains no
   Consensus vocabulary or private runtime path.
8. Static and semantic compiler mutation tests cover missing, duplicate,
   reordered, wrong-type, wrong-program, stale-basis, hidden-config, malformed
   output, incomplete evidence, and incomplete nested-refinement cases.
9. The 19 public operations remain unchanged; hard-break scans find no new
   operation, controller, selector, compatibility path, or duplicate registry.
10. Focused semantic, GTL, packed, publication, governance, Prime, and direct
    three-view design gates pass from one tree, followed by independent
    implementation review.
11. Existing C-call and payload-ledger shapes remain unchanged. One total
    replay projection and application-bound derived rule admit outcome bindings
    and fluents only for exact ordered call/basis/definition/application/GTL-program/
    member/C-program/locus/composition/regime/arm/input/payload/contract/evidence/judgment
    relations. Exact non-advance refusal contracts remain typed without a
    success read model. The sole `one_surface_authority_outcome` fluent name
    indexes exact success/refusal bindings using the existing carrier shape.
    Replay-aid registrations add no direct effects;
    `construction_evaluator_invoked` remains awaiting truth only; any invalid
    relation remains typed with zero success result.

## Independent Design-Review Repair

This candidate supersedes the first T-280 draft and repairs five findings:

1. `OneSurfaceProgramApplicationBinding` is now an exact program-level typed
   lowering from the admitted GTL program and selected
   `abg.fn_composition` contracts. T-271 compiles only each authority
   function's C interior. T-262 alone owns recurse/foldback.
2. `GapPressureRow` and `TargetObligationBinding` remain Prime carriers with
   independent identity, admission, and projection lifecycles.
3. Every authority definition binds a closed host kind, exact program
   membership, selected composition ref/digest, and visible hook/policy
   resolution.
4. Every authority maps to existing runtime event kinds and exact payload
   relations. Missing event payload sufficiency is
   `one_surface_event_binding_semantic_not_realized`; no event kind is added.
5. AF-13/AF-14 use one closed action union. Only callable-member, internal
   vector/refinement/reentry, and repair variants may admit a new intent and
   cross AF-14 to T-270. Continuation, F_H, ticket, reprice, terminal, and
   no-action variants remain typed non-AF-15 outcomes.

T-280 may close its atomic authority and compiler/admission proof before
T-270's AF-15 integration closes. It must not claim the end-to-end public
operator loop until T-270, T-272, and installed T-276 proof are complete.

## Bounded Re-review Repair

The second review rejected phase-overloading
`construction_evaluator_invoked` as four-function result authority. The prior
accepted replacement then embedded semantic bindings in the closed C-call
event shapes, contrary to CCALL-002 and the realized admission boundary. The
accepted repair preserves locus-only open and every existing event field.
It joins the exact result-bearing C-call with existing authority-snapshot,
payload, evidence, result, and judgment truth through one total replay
projection and application-bound `RuntimeDerivedFluentRule`. Existing
construction observation, catalog, evaluator-awaiting, intent, graph-action,
delta, and terminal events retain their current roles, and all semantic read
models remain derived. No event kind, field, direct effect, or external
resolver is added. The superseded acceptance remains recorded as history but
does not authorize implementation of the repaired candidate. The exact
repaired candidate above passed independent review and now authorizes only the
bounded T-280 implementation sequence; independent implementation review is
still required before closure.
