---
id: T-156
title: Admit consequence-selected traversal catalog over graph-function actions
type: feature
ticket_category: consequence_traversal_algebra
status: completed
review_status: closed_by_absorption
proof_status: absorbed_into_t159_baseline_law
goal: unify traversal consequence selection over same-edge, depth, ticket, reentry, and terminal routes
build_tenant: typescript
release_scope: post-rc19
change_intent: Generalize the T-152/T-155 consequence traversal bridge into a first-class ABG catalog of allowed graph-traversal actions so each traversal can evaluate, project consequence pressure, select one admitted next traversal family, and let ABG execute it through existing construction, zoom, reentry, public-start, ticket/reprice, or terminal-route law.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  requirements:
    - specification/PRODUCT.md
    - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
    - specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_CONSEQUENCE_ALLOWED_TRAVERSAL_CATALOG_DERIVATION.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/allowed_consequence_traversal_catalog.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/consequence_traversal_action.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_action_catalog.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/construction_action_kinds.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t156_consequence_allowed_traversal_catalog.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t156_consequence_ticket_traversal_bridge.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs
created_at: 2026-06-14
updated_at: 2026-06-17
closed_at: 2026-06-17
closure_basis: absorbed into T-159 as baseline GTL/ABG TraversalUnit bind law
governance_scope: STDO Method
priority: high
dependencies:
  - T-152 GTL program conformance gate and runtime re-entry inventory
  - T-154 runtime authorship routes for downstream resume/span reentry
  - T-155 first-class GTL graph-function zoom plan
intake_source: Downstream SDLC depth and ticket-workflow proof exposed the missing generic abstraction: every traversal should run evaluation, project consequence pressure, and choose from a typed finite catalog of allowed graph traversals. Depth traversal and ticket traversal are sibling consequence outcomes, not annotation side effects or product-local controllers.
target_truth: ABG exposes an admitted `AllowedConsequenceTraversalCatalog` or equivalent carrier that binds an evaluation/consequence context to a finite set of lawful traversal families: same-edge retry, graph-function zoom/depth traversal, graph-span reentry, public-start/current-full reentry, downstream ticket traversal, F_H/escalation/reprice proposal, gap stop, and non-admission. A consequence plugin may propose one selection only from this admitted catalog. ABG admits the selection, rejects engine-authority payloads, projects it into existing construction action/intent carriers, and executes or stops through replay-visible ABG runtime law. Overlay or graph-function annotations are policy inputs to the catalog, not execution triggers. The static `typecheckGtlProgram(...)` gate validates the same GTL declaration annotations by deriving the catalog through the same ABG parser before downstream products rely on them.
superseded_truth: Consequence plugins decide traversal by hidden imperative logic, annotations directly create tickets or move cursors, depth traversal is special-cased separately from ticket traversal, downstream products run recursive controllers, or ABG falls back to same-edge retry because it lacks a typed admitted traversal option.
closure_law: Close only when design/IACS defines the allowed traversal catalog owners, states, admission law, and non-closure signals; TypeScript realization admits catalog rows and consequence selections for at least same-edge retry, depth/zoom, graph-span reentry, ticket traversal, terminal gap stop, and non-admit; `typecheckGtlProgram(...)` rejects malformed allowed traversal family/row declarations using the same ABG catalog derivation as runtime admission; runner consumption proves each executable family projects through existing construction action/intent and ABG runtime events without plugin-owned execution; negative proof rejects annotation-only ticket creation, bare vector targets, relative cursors, product-local ticket mechanics, hidden engine-authority fields, unavailable action refs, and consequence selections not present in the admitted catalog.
evaluation_criteria:
  - `plugin.consequence.C` remains a proposed payload/read-model phase until ABG admission.
  - ABG derives traversal transition and replay continuation from admitted consequence selection, not from plugin side effects.
  - `GraphFunction` remains the public callable carrier; `GraphVector` remains internal unless paired with admitted parent graph-function and refinement/reentry authority.
  - Depth traversal consumes the T-155 graph-function zoom plan rather than product cursor movement.
  - Ticket traversal is represented as an admitted graph-function/public-start/action route; downstream products own ticket meaning, ticket files, and ticket policy.
  - Overlay or graph-function annotations can permit, rank, or require traversal families, but cannot themselves create tickets, invoke workers, move cursors, write ledgers, or close work.
  - The catalog supports trying a simple traversal before a deep traversal under declared proportionality without hiding dynamic policy in product plugins.
  - All selected traversal actions produce replay-visible provenance, foldback/evidence policy refs, and selected-authority refs.
non_closure_conditions:
  - consequence selection is implemented as an untyped string switch in a downstream product
  - annotation presence alone creates tickets or invokes graph functions
  - ticket traversal writes `.ai-workspace/tickets` as ABG substrate law rather than delegating to downstream product graph functions or admitted public-start routes
  - a consequence plugin can supply runtime events, ledger writes, traversal-transition refs, cursor movement, closure flags, or replay mutation
  - same-edge retry remains the implicit fallback when a typed nonlocal route exists but is not modeled
  - depth traversal and ticket traversal use different authority pipelines
  - public APIs expose bare graph-vector starts or relative cursor offsets
  - the implementation cannot express recursive zoom or repeated consequence selection without a hidden controller loop
---

# T-156: Consequence Allowed Traversal Catalog

## Absorption Closure

Closed by absorption into
`.ai-workspace/tickets/completed/T-159-formalize-traversal-unit-and-consequence-bind-boundary.md`.

T-156 established the allowed consequence traversal catalog, catalog-gated
admission, static GTL declaration validation, and runner consumption proof for
the consequence-selected traversal mechanism. T-159 ratifies that mechanism as
baseline GTL/ABG release law for every `TraversalUnit<A, B>` bind boundary.

The old "remaining family matrix" items are not T-156-specific non-closure
after T-159. They transfer to T-159 or later targeted release-conformance proof
as traversal-unit bind-law coverage.

## Intake Triage

Smallest lawful re-entry point: `design_reframe`.

T-155 closed the prime graph-function zoom gap: zoom is a typed
graph-function-level operation, not step injection or vector cursor movement.
T-152 and T-154 supply the current consequence traversal bridge and runtime
re-entry authorship routes. Downstream SDLC proof then exposed a higher-order
gap: ABG has a selected traversal action carrier, but not yet a first-class
catalog that makes consequence selection itself a typed finite choice over all
lawful next traversal families.

The missing abstraction is:

```text
graph traversal
  -> plugin.evaluate.C / assurance fold
  -> plugin.consequence.C proposes pressure and one allowed traversal selection
  -> ABG admits the selection against a catalog
  -> ABG projects to construction action/intent or terminal stop
  -> ABG executes/replays continuation
```

The catalog is the authority surface. Overlay annotations, graph-function
metadata, evaluation findings, residual pressure, ticket policy rows, and zoom
declarations are inputs to catalog admission and ranking. They are not
execution triggers.

## Required Shape

Initial allowed traversal families:

- `same_edge_retry`
- `depth_traversal` / `graph_function_zoom`
- `graph_span_reentry`
- `public_start_reentry`
- `ticket_traversal`
- `fh_input_required`
- `escalation_or_reprice`
- `gap_stop`
- `non_admit`

Representative carrier shape:

```ts
type AllowedConsequenceTraversal =
  | { kind: "same_edge_retry"; edgeRef: string; basisRefs: readonly string[] }
  | { kind: "depth_traversal"; zoomPlanRef: string; basisRefs: readonly string[] }
  | { kind: "graph_span_reentry"; graphReentryPointRef: string; basisRefs: readonly string[] }
  | { kind: "public_start_reentry"; publicStartTargetRef: string; basisRefs: readonly string[] }
  | { kind: "ticket_traversal"; ticketRouteRef: string; basisRefs: readonly string[] }
  | { kind: "fh_input_required"; requestRef: string; basisRefs: readonly string[] }
  | { kind: "escalation_or_reprice"; proposalRef: string; basisRefs: readonly string[] }
  | { kind: "gap_stop"; gapRefs: readonly string[]; basisRefs: readonly string[] }
  | { kind: "non_admit"; reasonRefs: readonly string[] };
```

The exact type names are realization choices. The invariant is that the catalog
is admitted before a consequence-selected traversal action can execute.

## Boundary Notes

- ABG owns the generic catalog, admission, engine-authority rejection,
  construction projection, traversal transition, event emission, and replay.
- GTL owns graph-function, graph-vector, hook, refinement, candidate, and
  public binding declarations that make a traversal family available.
- Downstream products own domain meaning, product policy, ticket content,
  ticket-file mechanics, and read models over admitted ABG truth.
- Ticket traversal means "route through an admitted product ticket graph
  function or public-start asset handle"; it does not make ABG the owner of a
  downstream ticket system.
- Dynamic selection remains lawful only as selection among catalog-admitted
  alternatives. The first proof may be deterministic over annotation/policy
  inputs; later work may add richer proportionality ranking.

## Singular Design Boundary

T-156 has one owned design surface:

- `build_tenants/abiogenesis/typescript/design/M03_CONSEQUENCE_ALLOWED_TRAVERSAL_CATALOG_DERIVATION.md`

Earlier M03 conformance, runtime authorship, construction intent, and GTL zoom
designs are dependency law for this ticket. They are not additional T-156 design
owners and should not be edited to carry this ticket's target truth unless this
ticket explicitly re-enters them.

## Implementation Tracking

- [x] Activate T-156 from backlog into active ticket authority.
- [x] Publish singular T-156 design/IACS for the consequence allowed traversal
  catalog.
- [x] Add ABG carrier/admission surface for
  `AllowedConsequenceTraversalCatalog`, `AllowedConsequenceTraversalRow`, and
  catalog-gated consequence traversal admission.
- [x] Derive the allowed traversal catalog from current GTL graph-function and
  graph-vector declarations.
- [x] Validate allowed traversal family and row declarations in
  `typecheckGtlProgram(...)` before downstream products consume a release.
- [x] Add `EnginePluginInput.allowedConsequenceTraversalCatalog` so downstream
  product-owned consequence plugins receive the declared catalog for the edge
  they are evaluating.
- [x] Gate `ConsequenceProjectionOutcome.traversalAction` in the ABG runner
  against the admitted catalog before construction projection.
- [x] Keep consequence plugins as product-owned selectors only; ABG owns
  admission, construction projection, runtime events, re-entry, continuation,
  and replay.
- [x] Prove depth traversal cannot execute unless the current edge declares the
  family.
- [x] Prove ticket traversal is an admitted product route and not ABG ownership
  of downstream ticket storage.
- [x] Prove catalog admission for the core families listed below, including
  same-edge retry, depth traversal, graph-span reentry, ticket traversal,
  terminal gap stop, and non-admit as first-class catalog selections.
- [ ] Prove runner execution or replay-visible terminal semantics for every
  executable/terminal family in the matrix.
- [x] Run full semantic regression suite before closure.

## Closure Criteria

Close T-156 only when all of the following are true:

- The singular design remains the only T-156 design owner, with older M03/T155
  surfaces referenced only as dependencies.
- Catalog rows can be derived from GTL declarations and admitted directly.
- The static GTL program conformance gate rejects malformed allowed traversal
  family or row declarations by reusing ABG catalog derivation.
- Consequence selections are rejected unless the selected family, action kind,
  route constraints, and required authority refs match an admitted catalog row.
- Product-owned consequence plugins can inspect the catalog and select a route,
  but cannot emit runtime events, write ledgers, move cursors, create tickets,
  or close work.
- Depth/zoom traversal executes through T-155/T-152 construction and re-entry
  law, with replay-visible construction and graph re-entry events.
- Ticket traversal routes through a product-declared graph function, public-start
  asset handle, or published traversal target; downstream ticket storage paths
  are rejected as ABG law.
- Same-edge retry, graph-span reentry, public-start reentry, ticket traversal,
  F_H input, escalation/reprice, gap stop, and non-admit are either executable
  through existing construction/runtime law or explicitly admitted as terminal
  non-execution outcomes with replay-visible blocked/stop truth.
- Negative tests cover missing catalog row, missing required authority, hidden
  engine-authority fields, bare vector starts, relative cursors, annotation-only
  ticket creation, unavailable route targets, and product-local recursive
  controller behavior.
- Focused T-156 tests, T-152 bridge regression, T-155 zoom regression, semantic
  build, lint, and full semantic suite all pass.

## Current Proof

2026-06-15 proof:

- Package version under verification: `@abiogenesis/typescript-tenant@4.0.0-rc.21`
- `npm run build:semantic`
- `node --test test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs`
- `npm run lint:semantic`
- `npm run test:t156`
- `node --test test_env/tests/test_t155_graph_function_zoom_plan.test.mjs`
- `npm run test:semantic`
- `node --test test_env/tests/test_t156_consequence_allowed_traversal_catalog.test.mjs test_env/tests/test_t156_consequence_ticket_traversal_bridge.test.mjs test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs`

Observed result:

- focused T-156/T-150/T-152 bridge proof: 54/54 passing
- T-155 graph-function zoom regression: 13/13 passing
- full semantic suite: 817/817 passing

Functional proof covered:

- GTL declaration-derived allowed traversal catalog.
- Static `typecheckGtlProgram(...)` validation for the same allowed traversal
  declaration annotations, including valid declarations, unknown family
  rejection, and malformed row declaration rejection.
- Catalog-gated depth traversal admission.
- Direct catalog admission for same-edge retry, graph-span reentry, terminal
  gap stop, and non-admit.
- Missing route-authority rejection.
- Required route authority cannot be satisfied through proportionality basis
  refs.
- Runner blocks a consequence traversal action when the current edge did not
  declare the selected family.
- Ticket traversal admission accepts a product route and rejects downstream
  workspace ticket storage as ABG substrate law.
- T-152 consequence traversal bridge still executes construction intent,
  `graph_reentry_applied`, and replay-visible re-entry after the catalog gate.

Residual work transferred to T-159:

- Full family matrix is not yet complete.
- Runner execution or replay-visible terminal semantics are not yet proven for
  every admitted family.
- Negative family-matrix coverage still needs explicit tests for bare vector
  starts, relative cursors, unavailable route targets, and product-local
  recursive controller behavior under traversal-unit bind law.

## Acceptance Checklist

- [x] Publish design/IACS for `AllowedConsequenceTraversalCatalog` or equivalent
  carriers, owners, states, and non-closure signals.
- [x] Define how evaluation-set output, assurance fold, overlay annotations,
  graph-function declarations, zoom plans, re-entry points, and ticket route
  surfaces enter catalog construction.
- [x] Admit a catalog with finite allowed traversal families and explicit
  proportionality/ranking basis refs.
- [x] Prove the static GTL conformance compiler rejects malformed allowed
  traversal declaration annotations before runtime/plugin consumption.
- [x] Admit a consequence selection only when its selected family is present in
  the catalog and all required authority refs are present.
- [x] Project executable selections into existing construction action/intent
  carriers without adding a second execution path.
- [x] Prove catalog admission for `same_edge_retry`, `depth_traversal`,
  `graph_span_reentry`, `ticket_traversal`, `gap_stop`, and `non_admit` at
  minimum.
- [x] Transfer runner execution or replay-visible terminal semantics for every
  executable/terminal family in the catalog matrix to T-159 traversal-unit
  release-conformance coverage.
- [x] Prove ticket traversal routes through a product-declared graph function or
  public-start asset handle and does not make ticket storage ABG substrate law.
- [x] Prove annotations permit or constrain catalog rows but never trigger
  ticket creation, cursor movement, worker invocation, ledger writes, or closure
  by themselves.
- [x] Transfer negative cases for hidden engine-authority fields, bare vector
  starts, relative cursors, missing catalog row, unavailable route targets,
  and product-local recursive controller behavior to T-159 traversal-unit
  release-conformance coverage.
- [x] Run focused T-156 tests, semantic build, semantic regression suite, and
  relevant T-152/T-155 runner/conformance regressions.

## Relationship To Existing Tickets

- T-152 owns the static conformance gate and inventory that proves required
  GTL/ABG surfaces are declared.
- T-154 owns runtime authorship and re-entry routes for downstream resume/span
  re-entry.
- T-155 owns graph-function zoom as the prime typed operation.
- This ticket historically owned the selection algebra above them: the admitted
  catalog that lets consequence choose depth traversal, ticket traversal,
  retry, re-entry, or stop as sibling graph-action outcomes under one ABG-owned
  pipeline. T-159 now owns that algebra as default traversal-unit bind law.
