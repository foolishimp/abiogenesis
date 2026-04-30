---
id: T-086
title: Prove ABG generic traversal envelope topology for cumulative pressure and coverage
type: spike
ticket_category: ordinary
status: completed
review_status: external_review_accepted
goal: abg-total-assurance-calculus
goal_status: active
change_intent: Determine and prove the correct ABG-owned generic traversal envelope for cumulative context, obligation pressure, coverage evidence, prior gap state, retry/re-entry, and lawful stop truth so downstream products do not rebuild the same mechanism as local Python-style orchestration.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: GTL graph-vector declarations, ABG iterate primitive, execution basis, traversal frame, cumulative context, obligation-ledger declaration, fulfillment assessment, coverage ledger, retry/gap dossier, attached F_P loop, event/projection truth, downstream plugin handoff manifests
priority: high
triaged_at: 2026-04-28T06:16:37Z
created_at: 2026-04-28T06:16:37Z
updated_at: 2026-04-30T17:57:01+10:00
closure_candidate_at: 2026-04-29T08:04:16Z
completed_at: 2026-04-30T17:57:01+10:00
dependencies:
  - B-013 completed
  - B-014 completed
  - B-031 completed
  - T-072 completed
  - T-084 completed
  - T-085 completed
  - T-087 completed
  - T-089 completed
related_downstream_evidence:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-091-harden-typescript-traversal-closure-against-lossy-obligation-carriers.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/codex/20260428T153000Z_ROOT_CAUSE_lossy_traversal_obligation_carriers.md
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
product_authority:
  - specification/PRODUCT.md Probabilistic Compute Boundary
  - specification/PRODUCT.md Outcome Compute Contract
  - specification/PRODUCT.md ABG product layer
intent_authority:
  - specification/INTENT.md convergence engine and iterate primitive
  - specification/INTENT.md GTL / ABG control boundary
  - specification/INTENT.md ABG outcome compute primitive
candidate_requirement_authority:
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
design_authority:
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md
intake_source: Design-module review of odd_sdlc.TS T-091 showed that downstream traversal-pressure and output-coverage machinery is likely a generic ABG topology need rather than a purely SDLC-specific local pattern. Python-era SDLC had the useful capability through cumulative context, intermediate ledgers, and iterative evaluation, but the capability lived in local orchestration. TypeScript SDLC is currently making the capability explicit as carriers and tests. This ticket decides what belongs in ABG so the solution is correct before implementation is widened.
target_truth: ABG owns one generic traversal-envelope topology for outcome compute. A traversal frame carries current projection, cumulative context, declared obligations or equivalent pressure, evaluator contracts, prior edge evidence, prior gap dossiers, output allocation/binding, and coverage/result truth. Domains supply graph functions, domain-specific obligation constructors, evaluator implementations, and acceptance interpretation. ABG carries and replays the mechanism without absorbing domain HOW.
superseded_truth: It is acceptable for each downstream product to rebuild traversal pressure, coverage, prior-gap carry, and retry handoff shape locally as long as the local tests pass.
non_goal:
  - Do not move SDLC requirement semantics, family-file projection, data_mapper behavior, or domain acceptance rules into ABG.
  - Do not replace GTL graph-vector declarations with ABG-private workflow law.
  - Do not implement a broad runtime rewrite before topology proof and design-method review.
  - Do not reintroduce Python-style monolithic orchestration under a TypeScript name.
closure_law: This ticket may close only after external agent review accepts the topology decision, explicit design/IACS/diagram surfaces, and no-gap proof that the envelope is a read-model over existing M03 runtime carriers. No implementation claim is made by this ticket.
evaluation_criteria:
  - Requirement audit decides whether existing ABG requirements already authorize the generic traversal envelope or whether new requirement law is needed.
  - Design surface defines the minimal ABG-owned carrier set for traversal frame, cumulative context, pressure/obligation refs, coverage/result refs, gap/retry refs, and replay projection.
  - Structural carrier diagram separates GTL declaration, ABG runtime mechanism, plugin handoff, domain evaluator meaning, and downstream projection.
  - Existing B-013 obligation-ledger declarations, B-014 fulfillment assessments, T-084 attached F_P loop, T-087 supervised actor invocation, and T-082 output allocation are reconciled into one topology instead of becoming rival mechanisms.
  - Proof shows at least one generic edge can carry prior pressure into a retry and require coverage evidence without downstream code owning traversal selection or closure.
  - Negative proof shows ABG does not accept a plugin that claims fulfillment without admissible coverage/result truth.
  - Downstream odd_sdlc T-091 can be classified as either consuming the ABG topology or as temporary local pressure logic awaiting migration.
proof_surface:
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md
  - .ai-workspace/comments/codex/20260429T180416AEST_T086_traversal_envelope_closure.md
  - T-090 remains responsible for total assurance carrier design
  - T-091 remains responsible for row-by-row negative proof
non_closure_conditions:
  - ticket closes because odd_sdlc local tests pass
  - ABG adopts SDLC requirement meaning or family projection as substrate law
  - downstream product code still owns next-vector selection, traversal closure, retry truth, or event emission for attached worker execution
  - generic traversal pressure remains represented only by IDs and prompt prose
  - coverage evidence is only a worker claim without admitted output/result truth
  - topology proof ignores existing B-013, B-014, T-084, T-087, or T-082 surfaces
---

# T-086: ABG Generic Traversal Envelope Topology

## Closure Candidate

T-086 is closed after external agent review accepted the topology decision.

ABG already has the generic traversal-envelope shape across current M03
carriers. The correct design is not a new `TraversalEnvelope` aggregate. The
correct design is a derived `TraversalEnvelopeView` over admitted runtime
truth:

```text
current projection
+ cumulative context
+ obligation or pressure refs
+ evaluator/plugin contracts
+ prior gap truth
+ output/result coverage refs
-> continue | retry | reprice | block | close
```

The view is useful for diagnostics, archive/report projections, downstream
adapter proof, and T-090 assurance projection. It is not controller state and
cannot close work.

## Requirement Audit Result

Existing ABG requirements already authorize the envelope mechanics after the
T-089 requirement amendment:

| Envelope need | Requirement authority |
|---|---|
| interpretation over GTL declarations | `REQ-R-ABG3-INTERPRET.md` |
| runtime binding and identity | `REQ-R-ABG3-BINDING.md`, `REQ-R-ABG3-TRANSPORT.md` |
| replay-derived current projection | `REQ-R-ABG3-EVENTS.md`, `REQ-R-ABG3-PROJECTION.md` |
| convergence and next action | `REQ-R-ABG3-CONVERGENCE.md` |
| provenance and lineage | `REQ-R-ABG3-PROVENANCE.md`, `REQ-R-ABG3-LINEAGE.md` |
| retry and prior-gap carry | `REQ-R-ABG3-RETRY.md` |
| total closure fold over the envelope | `REQ-R-ABG3-ASSURANCE.md` |

No new requirement family is needed for the traversal envelope itself. T-089
already supplied the missing assurance requirement layer needed to prevent the
envelope from closing by worker claim or nullable state.

## Carrier Mapping

| Envelope surface | ABG carrier |
|---|---|
| graph/function/vector/job/policy identity | `ExecutionBasis` |
| current traversal truth | `RuntimeAggregateProjection` |
| event truth | `RuntimeEvent` |
| continue/converge decision | `IterationAdvanceDecision` |
| evaluator/plugin contract | `EnginePluginContract`, `EnginePluginInput` |
| effect result | `EnginePluginOutcome` |
| admitted evidence | `ResultArtifact`, `ResultIngestOutcome` |
| attached worker result control | `AttachedFpResultDecision` |
| prior gap/retry truth | retry/progress events and `RetryRepairDecision` |
| actor observation truth | supervised actor runtime events |
| subordinate bounded work | `LeafTaskEnvelope` and leaf-task events |
| output allocation/binding | deferred T-082 refs when present |

## T-082 Disposition

T-082 remains open for output instance allocation. That does not block T-086.
The traversal envelope can consume output-binding refs when present, and T-090
or downstream policy must classify absence as a visible ambiguity row or lawful
defer state. Absence is not success.

## Downstream Classification

Downstream `odd_sdlc` traversal-pressure work should be classified as a
temporary local adapter/quality-gate pressure fix until it consumes ABG's
generic envelope plus T-090/T-091 total assurance projection. It should not be
treated as the substrate mechanism.

## Follow-On State

This ticket is ready for external review and unblocks T-090 only as a
review-pending dependency.

T-090 must design the assurance projection and closure fold over the envelope.
T-091 must prove totality and negative premature-closure guards. Tenant
implementation remains in T-092-PY and T-092-TS.
