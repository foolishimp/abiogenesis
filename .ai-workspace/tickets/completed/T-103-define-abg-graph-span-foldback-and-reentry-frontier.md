---
id: T-103
title: Define ABG graph-span foldback and reentry frontier
type: feature
ticket_category: runtime_graph_span_reentry
status: completed
review_status: closure_accepted_for_abg_source_scope_downstream_sdlc_proof_deferred
goal: make ABG own graph-span evaluation, constitutional reentry classification, and lawful reentry across composed traversal
change_intent: Define and realize the ABG-owned mechanism that evaluates completed graph spans such as C->D, B->D, and A->D after a terminal edge closes, folds those evaluations into a replay-derived reentry frontier, and routes the next traversal to any lawful earlier graph vector or constitutional reentry layer without downstream products building their own iteration loop.
change_class: requirement_reprice
re_entry_point: requirement
affected_boundary: ABG graph-function iteration, graph-span foldback, runtime event truth, projection, lineage, reentry frontier, constitutional reentry classification, assurance register, T-100 workspace zoom/foldback, downstream odd_sdlc traversal consumption
priority: high
build_tenant: typescript
triaged_at: 2026-05-02
created_at: 2026-05-02
updated_at: 2026-05-02
closed_at: 2026-05-02T21:40:26+10:00
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
dependencies:
  - T-082 completed ABG output instance allocation for input-only graph-function start
  - T-100 completed ABG zoomed workspace-asset obligation schedule and foldback evaluation
  - T-102 completed ABG eval suite projection artifacts and repeatable sandbox runs
  - T-041 completed replay-derived graph-function iteration design
  - T-044 completed replay-derived graph-function iteration realization
  - T-086 completed traversal envelope topology
  - T-090 completed total assurance carrier design
  - T-092-TS completed total assurance projection and closure fold
  - T-098 completed full retry frontier projection
related_tickets:
  - T-100 supplies per-edge ledger/schedule/foldback assets consumed by graph-span foldback
  - odd_sdlc T-109 traversal-ledger parity requires this ABG substrate before odd_sdlc can avoid product-local iteration
related_design:
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md
candidate_requirement_authority:
  - specification/PRODUCT.md
  - specification/INTENT.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-FRAME.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-LINEAGE.md
  - specification/requirements/abg/REQ-R-ABG3-CONVERGENCE.md
  - specification/requirements/abg/REQ-R-ABG3-CORRECTION.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-RECURSE.md
evidence_refs:
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/codex/20260502T022427AEST_test35_test65_edge_parity_gap_analysis.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-109-publish-authoritative-edge-ledger-lineage-chain-for-typescript-traversal-parity.md
  - .ai-workspace/comments/codex/20260326T024802_STRATEGY_intent-governed-homeostatic-self-evolution.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-004-restore-homeostatic-gap-triage-and-intent-renewal.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/completed/T-036-realize-typescript-gap-triage-homeostatic-loop-and-ticket-routing.md
  - /Users/jim/src/apps/odd_sdlc/build_tenants/python/design/TICKET_WORK_ITEM_REENTRY_ROUTING.md
  - .ai-workspace/tickets/active/T-100-define-abg-zoomed-workspace-asset-obligation-schedule-and-foldback-evaluation.md
  - build_tenants/abiogenesis/typescript/design/M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md
intake_source: Operator diagnosis on 2026-05-02 that ABG's original single-hop separation is insufficient for SDLC-style traversal and for the older intent/homeostasis loop: after A->B->C->D reaches D, ABG must be able to evaluate C->D, B->D, and A->D, detect content gaps or constitutional intent gaps, update a replay-derived register, and force reentry at the graph point or constitutional layer implicated by the gap.
target_truth: ABG owns graph-span evaluation, constitutional reentry classification admission, and reentry frontier truth. After an edge closes, ABG can schedule endpoint span evaluations over the completed path, admit domain/F_P span assessments, fold them with edge foldbacks and assurance truth, project an active reentry frontier, and route subsequent traversal to the earliest lawful implicated vector or declared constitutional reentry layer while preserving prior closure events as history.
superseded_truth: ABG iterates only by first-unclosed vector and downstream products such as odd_sdlc must run their own controller to decide that an end-to-end A->D evaluation should push traversal back to A->B, B->C, C->D, or a constitutional layer such as intent.
closure_law: Close only when requirements are sufficient or updated, the M03 design defines graph-span carriers and replay law, implementation exposes pure schedule/fold/frontier/reentry functions with isolated effects, and proof shows an A->B->C->D graph can evaluate C->D, B->D, and A->D, update the replay-derived register, and reenter the correct vector or constitutional layer without product-local iteration.
non_closure_conditions:
  - reentry target is selected by a product-local controller, CLI loop, plugin prompt, or test harness instead of ABG replay projection
  - span evaluation is represented only as report prose and not as admitted runtime/event truth
  - the register is a mutable ledger that can outrank replay-derived event projection
  - prior vector closure is erased rather than shadowed by a fresh reentry generation
  - F_D deterministic checks replace domain/F_P semantic evaluation of source obligations against terminal artifacts
  - T-100 per-edge foldback and T-082 output allocation are bypassed by a separate span runner
  - `change_class` is collapsed into a graph vector name instead of retained as lawful constitutional reentry classification
  - `intent_reprice` is treated as arbitrary retry/reprice prose instead of a typed route to an intent-layer reentry surface
---

# T-103: ABG Graph-Span Foldback And Reentry Frontier

## STDO Triage

### First Missing Layer

Requirement.

The existing ABG product definition says ABG owns replayable control truth,
projection, lineage, correction, and lawful re-entry. T-100 gives ABG a
workspace-visible ledger and foldback mechanism for one outer A->B boundary.
The missing law is the composed graph case:

```text
A -> B -> C -> D
```

After `C->D` closes, ABG must not simply mark the next vector complete and
converge. It must be able to ask:

```text
Eval(C, D)
Eval(B, D)
Eval(A, D)
```

Those evaluations detect whether the terminal artifact `D` still satisfies the
source obligations that entered at `C`, `B`, and `A`. If a gap is found, ABG
must project the graph point where traversal should re-enter.

### Lawful Re-Entry

`requirement_reprice`.

This ticket's own change class is `requirement_reprice` because the missing
ABG law is runtime requirement law: graph-span foldback and reentry-frontier
projection are not yet first-class ABG requirements.

That is separate from the change classes carried by the frontier. `change_intent`
is the operator's stated direction for the work. `change_class` is the lawful
constitutional re-entry classification for that direction. A graph-span
evaluation can therefore produce a frontier row whose reentry class is
`intent_reprice` without making this ticket itself an `intent_reprice` ticket.

This work expands ABG's runtime requirement from single-edge advancement to
graph-span foldback, constitutional reentry classification, and reentry-frontier
projection. It does not move domain meaning into ABG. Domain evaluators still
judge whether `A.req_i` is semantically satisfied by `D.result_i`; ABG owns
admission, folding, lineage, register projection, and reentry routing.

## Mechanism

For a completed path:

```text
v0 = A -> B
v1 = B -> C
v2 = C -> D
```

When `v2` reaches terminal candidate `D`, ABG derives an endpoint span schedule:

```text
s2 = C -> D  covers vectors [v2]
s1 = B -> D  covers vectors [v1, v2]
s0 = A -> D  covers vectors [v0, v1, v2]
```

Each span evaluation is a typed runtime boundary:

1. ABG derives the span from graph topology, current output allocations, and
   closed vector lineage.
2. ABG constructs an evaluator handoff over source asset, terminal asset,
   source obligation ledger, path evidence, and existing T-100 edge foldbacks.
3. A domain/F_P evaluator assesses each source obligation against the terminal
   artifact and may provide carry-path observations.
4. ABG admits the assessment only as typed evidence. The evaluator does not
   select the next vector.
5. ABG folds span assessments into `GraphSpanFoldbackEvaluation`.
6. ABG projects `GraphReentryFrontierProjection`.
7. ABG derives a `GraphReentryPlan` from the frontier.
8. ABG emits a reentry event that shadows stale downstream closures with a new
   generation and routes traversal to the chosen vector or constitutional layer.

### Reentry Target Rule

For each failed obligation row, ABG derives `firstBadVectorIndex` from
carry-path evidence:

- if `Eval(C, D)` fails, reenter `C->D`
- if `Eval(C, D)` closes but `Eval(B, D)` fails because a `B` obligation is
  absent or corrupted at `C`, reenter `B->C`
- if `Eval(B, D)` closes but `Eval(A, D)` fails because an `A` obligation is
  absent or corrupted at `B`, reenter `A->B`
- if the evaluator cannot locate the first bad boundary, ABG emits
  `reprice_required` or `blocked`, not an arbitrary retry
- if multiple rows fail, ABG chooses the earliest implicated vector in graph
  order, because upstream source truth outranks downstream derived work

The register is not directly written. ABG appends span/foldback/reentry events;
the active register is replay-derived from those events.

## Intent Loop Impact

The prior ABIogenesis strategy note names the intent/homeostasis loop as:

```text
self-model -> intent -> action -> feedback -> model revision -> renewed intent
```

The prior `odd_sdlc` homeostatic loop names the operational path as:

```text
current surface -> observed mismatch -> semantic triage -> lawful re-entry -> renewed forward derivation
```

T-103 is where those two lines become one ABG mechanism. Graph-span foldback is
the feedback surface. The reentry frontier is the lawful routing surface. The
frontier must be able to say either:

- reenter a graph vector, such as `B->C`, because an obligation was dropped
  during that transform
- reenter a constitutional layer, such as `intent`, because endpoint feedback
  shows the governing intent or target condition is insufficient

ABG owns the replay-derived event and projection mechanics. ABG does not own the
domain interpretation of the operator's intent, ticket semantics, or
odd_sdlc-specific route contract. Products publish those meanings as admitted
assets or F_P assessments; ABG carries the resulting `change_class`,
`re_entry_point`, route contract refs, and lineage through the frontier.

## Design Surface

Canonical design for this ticket:

`build_tenants/abiogenesis/typescript/design/M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md`

That design includes the STDO method analysis, current code-point landing map,
and UML/state flows required for review.

The design must define at minimum:

- `GraphSpanRef`
- `GraphSpanEvaluationSchedule`
- `GraphSpanAssessment`
- `GraphSpanFoldbackEvaluation`
- `GraphChangeClass`
- `GraphConstitutionalReentry`
- `GraphReentryFrontierRow`
- `GraphReentryFrontierProjection`
- `GraphReentryPlan`
- graph-span runtime events
- pure derivation functions for span schedule, span foldback, frontier
  projection, and reentry planning
- runner integration law for applying reentry without deleting historical
  closure events

## Boundary Rules

ABG owns:

- graph-span identity
- span schedule derivation
- runtime event admission
- foldback projection
- active reentry frontier projection
- constitutional reentry carrier admission
- reentry generation identity
- advancement transition routing after reentry

GTL owns:

- graph topology
- vector contracts
- graph-function publication
- declared refinement/foldback hooks when present

Downstream products own:

- domain requirement meaning
- source obligation declaration
- domain/F_P semantic evaluation plugins
- intent, ticket, and route-contract meaning
- product release interpretation above ABG proof truth

Plugins may provide semantic observations and carry-path evidence. Plugins may
not emit runtime events, mutate the register, choose a vector, close a span, or
own reentry.

## Acceptance Criteria

- AC-1: requirements are updated or explicitly judged sufficient for ABG-owned
  graph-span foldback and reentry-frontier projection.
- AC-2: the TypeScript M03 design defines graph-span carriers, event law,
  projection law, plugin boundary, and relationship to T-100.
- AC-3: module/IACS proof assigns graph-span foldback and reentry-frontier
  ownership to M03-engine-kernel and rejects product-local iteration.
- AC-4: implementation exposes pure functions for endpoint span schedule,
  span assessment admission, span foldback, reentry-frontier projection, and
  reentry-plan derivation.
- AC-5: runtime events preserve graph function, run, graph call, frame,
  vector, span, source node, terminal node, attempt/generation, causation, and
  source assessment refs.
- AC-6: the reentry register is a replay-derived projection, not a mutable
  authority ledger.
- AC-7: prior vector closures remain in the event stream; reentry shadows them
  through a new generation or frontier identity rather than erasing history.
- AC-8: proof covers `A->B->C->D` with successful `C->D`, `B->D`, and `A->D`
  close.
- AC-9: proof covers `Eval(C,D)` failing and deriving reentry at `C->D`.
- AC-10: proof covers `Eval(C,D)` closing while `Eval(B,D)` fails because
  `B` obligation truth is lost at `B->C`, deriving reentry at `B->C`.
- AC-11: proof covers `Eval(B,D)` closing while `Eval(A,D)` fails because
  `A` obligation truth is lost at `A->B`, deriving reentry at `A->B`.
- AC-12: proof covers multiple span gaps and chooses the earliest implicated
  vector by deterministic graph order.
- AC-13: proof covers ambiguous first-bad-boundary evidence and yields
  `reprice_required` or `blocked`, not arbitrary retry.
- AC-14: proof covers replay reconstruction of the active reentry frontier
  from events alone.
- AC-15: proof covers downstream `odd_sdlc` consumption shape without adding an
  SDLC-local controller loop.
- AC-16: proof covers a span assessment that carries `intent_reprice` as a
  constitutional reentry class separately from the graph target vector.
- AC-17: proof covers the frontier routing an `intent_reprice` row to an
  intent-layer reentry surface such as `derive_intent_surface` or a published
  downstream equivalent.
- AC-18: proof covers a downstream ticket/work-item route contract carrying
  `change_class` and `re_entry_point` into ABG reentry lineage without ABG
  owning ticket-process semantics.

## Initial Proof Plan

Use a small TypeScript sandbox graph:

```text
A(requirements) -> B(design) -> C(implementation) -> D(validation)
```

The fixture should write per-edge T-100 ledgers and foldbacks, then trigger the
span evaluator after `D` materializes. It should persist:

- edge foldbacks
- span assessment events
- graph-span foldback projection
- constitutional reentry assessment event for an `intent_reprice` fixture case
- reentry frontier projection
- chosen reentry plan
- postmortem explaining which span caused the reentry

The fixture must be runnable from the command line and must not require the
full `odd_sdlc` product.

## Closure Position

This ticket is not closed by T-100. T-100 proves one edge's ledger/schedule and
foldback. T-103 closes only when ABG can evaluate a composed path endpoint and
lawfully push traversal back to any implicated vector or constitutional layer by
replay-derived frontier truth.

## Closure Disposition: 2026-05-02

T-103 is closed for the ABIogenesis TypeScript source scope.

Closure evidence:

- The graph-span algebra exposes pure schedule, assessment admission, foldback,
  frontier projection, and reentry-plan derivation functions.
- Runtime event carriers preserve run/work/frame lineage, causation refs, and
  correlation ids.
- Admission rejects non-fulfilled graph-span rows under non-F_P regimes.
- `engine_runner.ts` consumes replay-derived reentry frontier truth before
  default advancement and emits `graph_reentry_planned` /
  `graph_reentry_applied` without constructing F_P span assessments.
- T-100 edge foldbacks now participate in graph-span foldback decisions.
- Reentry applies generation-aware shadowing without erasing prior event
  history.

Verification rerun:

- `npm run test:t103` passed, 24/24.
- `npm run test:t100:test35-parity` passed, 15/15.
- `npm run test:semantic` passed, 349/349.
- `npm run lint:semantic` passed.

Downstream boundary:

- AC-15 and AC-18 remain downstream `odd_sdlc` consumption proof, not
  ABIogenesis source-layer implementation work. This closure does not re-open
  product-local SDLC traversal; it supplies the ABG substrate needed by that
  downstream line.
