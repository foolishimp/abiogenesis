# T-041 Design TypeScript M03 Replay-Derived Graph-Function Iteration And Aggregate Projection

- id: T-041
- title: Design TypeScript M03 replay-derived graph-function iteration and aggregate projection
- type: feature
- ticket_category: ordinary
- status: completed
- goal: typescript-rc-authority-closure
- change_intent: declare the TypeScript M03 design authority for replay-derived graph-function iteration and aggregate projection before implementation or proof tickets open
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies: T-039 completed, T-043 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `.ai-workspace/tickets/backlog/`
- intake_source: `T-039` requirement-to-TypeScript-design audit
- target_truth: TypeScript M03 has one concrete design authority for replay-derived graph-function iteration and aggregate projection over graph call, frame, traversal, evaluation, proof, and closure truth
- superseded_truth: TypeScript M03 states replay-derived iteration law but lacks concrete tenant IACS, structural carrier, and proof-lane design authority for composed graph-function progression
- closure_law: this ticket closes only when the design assets make the carrier set, projection boundary, and required downstream proof lanes explicit, and any implementation/test work is carried by successor tickets rather than hidden in this design ticket
- evaluation_criteria:
  - a derivation asset declares the M03 replay-derived iteration boundary
  - a first-slice IACS names irreducible carriers and subordinate payloads
  - a structural carrier diagram shows graph-call, frame, vector-local event, replay projection, and next-edge planning relationships
  - required implementation and proof lanes are named as successor work if not already covered
- non_closure_conditions:
  - the ticket implements code or tests as part of its own closure
  - public `start` or an M04 control loop is treated as the internal iteration engine
  - next-edge choice is allowed to rely on private controller memory or local loop indexes
  - successor implementation/proof scope remains ambiguous
- proof_surface:
  - design assets under `build_tenants/abiogenesis/typescript/design/`
  - successor implementation/proof ticket list or explicit no-op justification
  - `git diff --check`

## Walkthrough Gate

`T-043` completed the walkthrough and found no missing requirement authority
blocking this ticket. This ticket may open as design work only; implementation
or proof remains successor work unless already covered by an admitted ticket.

## Context

`T-039` found that the TypeScript design line now states the right law:

- public start/resume is ignition only
- ABG owns internal graph-function iteration
- next-edge selection must derive from replay-visible graph-call, frame,
  traversal, evaluation, proof, and closure truth

But the tenant does not yet have the concrete M03 design assets that make that
law implementable and provable.

The current TypeScript steel thread still reads as one admitted basis plus one
advancement transition. That is not enough to prove execution parity for a
composed `GraphFunction`.

## Governing Requirements

- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-GRAPHCALL.md`
- `specification/requirements/abg/REQ-R-ABG3-FRAME.md`
- `specification/requirements/abg/REQ-R-ABG3-LINEAGE.md`
- `specification/requirements/abg/REQ-R-ABG3-BINDING.md`
- `specification/requirements/abg/REQ-R-ABG3-SELECTION-APPLICATION.md`
- `specification/requirements/abg/REQ-R-ABG3-PROVENANCE.md`

## Scope

Design the TypeScript M03 surface for:

- graph-call lifecycle truth
- frame lifecycle truth
- replay-derived next-edge planning
- vector-local traversal event truth
- aggregate projection for run, graph call, frame, and continuation inputs
- invocation-local binding and carried environment truth needed to traverse
  internal graph vectors lawfully
- proof lanes that will show a composed graph function advancing beyond
  `graph.vectors[0]` through replay-derived state rather than harness-local
  sequencing

## Acceptance

- One derivation asset declares the M03 replay-derived iteration boundary.
- One first-slice IACS names the irreducible carriers and subordinate payloads.
- One structural carrier diagram shows graph-call, frame, vector-local event,
  replay projection, and next-edge planning relationships.
- The design requires code to consume those carriers rather than package-local
  counters or fixed first-vector shortcuts.
- The design declares a sandbox proof lane that constructs and executes a
  multi-stage graph function whose next edge is selected from replay-derived
  runtime truth.
- The design declares a negative proof lane that rejects a realization that
  only dispatches the first vector of a composed graph.
- Successor implementation/proof tickets are created or confirmed if code or
  test work remains.

## Non-Closure Conditions

- Public `start` or an M04 control loop is treated as the internal iteration
  engine.
- Next-edge choice is inferred from private controller memory or local loop
  indexes.
- Graph-call or frame truth is hidden inside run projection alone.
- The design claims closure by proof only, without declaring replay-derived
  progression across the internal graph boundary.
- Implementation or test work is hidden inside this design ticket.

## Proof Surface

- Design assets under `build_tenants/abiogenesis/typescript/design/`
- Successor implementation/proof ticket list or explicit no-op justification.
- `git diff --check`

## Closure Evidence

- Derivation asset:
  `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- First-slice IACS:
  `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- Structural carrier diagram:
  `build_tenants/abiogenesis/typescript/design/M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- Tenant design index updated:
  `build_tenants/abiogenesis/typescript/design/README.md`
- ABG module design now points at the concrete TypeScript `M03` iteration
  design pack:
  `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- Successor implementation/proof ticket created:
  `.ai-workspace/tickets/backlog/T-044-realize-typescript-m03-replay-derived-graph-function-iteration-and-aggregate-projection.md`
