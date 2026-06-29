---
id: T-160
title: Declare ABG recursive executive observer graph for obligation pressure
type: feature
ticket_category: abg_recursive_observer_graph
status: active
goal: >-
  Make ABG own a default recursive executive observer behavior over existing
  workspace overlay, observed-state, replay projection, and traversal-unit
  truth. The minimal product model is an executive graph function whose
  declared environment specifies the target workspace and target work:
  `abg.executive.GraphFunction(environment: target.workspace -> target_work)`.
  That graph function observes the target workspace, carries the workers,
  candidate assets, evidence, and pressure facts around it, maintains
  obligation pressure through admitted F_P evaluation findings, and lets ABG
  continuation route the next lawful action without consumer product-local
  loops, new workspace carriers, or F_D semantic reconstruction.
change_intent: >-
  Ratify at the product layer, then carry into requirements and design, an
  ABG-owned graph-over-graph observer role for pressure preservation:
  `E.observer -> (TargetGraph): { E.pressure | E.bugfix | E.reentry }`. The
  default observer reads existing ABG current-surface, observed-state/workspace
  overlay, replay, `GraphFunction.environment`, workspace `Context` truth,
  asset-surface required contexts, and `TraversalUnit<A, B>` lineage truth
  rather than introducing a new observation ontology. Product plugins may tune
  interpretation through existing hook and result-interface surfaces, but ABG
  owns observer invocation, payload admission, attenuation classification, and
  continuation routing.
change_class: product_reprice
re_entry_point: product
owner: abiogenesis
priority: high
triaged_at: 2026-06-26
created_at: 2026-06-26
updated_at: 2026-06-29
governance_scope: STDO Method, GTL, ABG
build_tenant: typescript
intake_source: >-
  Prior pressure failures showed that some graph executions need an executive
  F_P observer whose role is to maintain obligation pressure across a layered
  manifold, but that role must be ABG-owned and recursive over admitted graph
  state rather than product-local or deterministic F_D semantic compilation.
strategy_dependency: >-
  Originally backlogged on 2026-06-26 to avoid implementing the observer as a
  direct repair for one consumer project. The requirements-algebra/general
  lifecycle strategy is now concrete through T-164, T-165, T-166, and odd_glc
  T-001 through T-007. The next ABI closure gap is recursive pressure
  preservation over residual, continuation, re-entry, and reprice truth without
  downstream product-local controllers.
source_documents:
  - specification/PRODUCT.md
  - specification/INTENT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
related_tickets:
  - .ai-workspace/tickets/completed/T-116-enable-gtl-plugin-traversal-observer-bindings-for-transform-and-eval.md
  - .ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md
  - .ai-workspace/tickets/completed/T-145-realize-evaluate-c-as-evaluation-set-phase-over-read-only-ledgers.md
  - .ai-workspace/tickets/completed/T-146-generalize-composed-c-stages-as-stage-set-phases.md
  - .ai-workspace/tickets/completed/T-148-realize-runtime-continuation-transition-projection.md
  - .ai-workspace/tickets/completed/T-159-formalize-traversal-unit-and-consequence-bind-boundary.md
  - .ai-workspace/comments/codex/20260626T011328Z_STRATEGY_requirements_algebra_edge_spans.md
  - .ai-workspace/tickets/completed/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md
  - .ai-workspace/tickets/completed/T-165-prove-hello-world-live-requirements-route.md
  - .ai-workspace/tickets/completed/T-166-publish-requirements-route-replay-proof-artifact.md
  - .ai-workspace/tickets/active/T-169-ratify-requirement-span-identity-across-recursion.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-001-govern-minimal-odd-glc-requirements-and-graph-design.md
  - /Users/jim/src/apps/odd_glc/.ai-workspace/tickets/active/T-007-interpret-assurance-fold-and-residual-pressure.md
affected_boundary:
  product:
    - specification/PRODUCT.md
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
    - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
    - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
    - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
    - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_RECURSIVE_EXECUTIVE_OBSERVER_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_RECURSIVE_EXECUTIVE_OBSERVER_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_RECURSIVE_EXECUTIVE_OBSERVER_STRUCTURAL_CARRIER_DIAGRAM.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/executive/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    - build_tenants/abiogenesis/typescript/package.json
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t160_recursive_executive_observer.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/live/test_t160_recursive_executive_observer_live.test.mjs
target_truth: >-
  ABG can open an executive observer graph function whose declared environment
  specifies the observed workspace and target work through existing GTL
  surfaces: `GraphFunction.environment`, workspace `Context` locator/digest
  truth, and asset-surface required contexts. The executive graph function
  carries workers, attempts, candidate assets, evidence, payload ledgers,
  assurance/consequence/traversal projections, observed-state refs, and
  `TraversalUnit<A, B>` intent-lineage/obligation-delta refs about the declared
  target workspace. It invokes a default F_P executive evaluator when semantic
  obligation pressure must be maintained, admits the result through existing
  `evaluate.C`/payload admission, derives attenuation or non-attenuation as
  projection truth, and feeds only admitted pressure facts into ABG
  continuation/retry/yield/re-entry. Product plugins tune interpretation; they
  do not own continuation, ledger/event writes, closure, or a separate
  observation/workspace ontology.
superseded_truth: >-
  Consumer products maintain obligation pressure through local control loops,
  prompt recipes, deterministic semantic compilers, consequence-stage semantic
  judgment, retry prose, product-local replay/continuation adapters, or new
  carrier vocabularies introduced before existing graph-function environment,
  context, and observation surfaces are proven insufficient.
closure_law: >-
  Close only when product law, requirements, design, TypeScript realization,
  runner admission, default behavior, plugin tuning, and regression tests prove
  a stratified ABG graph-over-graph observer over existing overlay/projection
  surfaces that maintains obligation pressure without mutating the observed
  graph, without making `consequence.C` the F_P executive, without inventing a
  parallel observation/workspace ontology unless proven necessary, and without
  moving product semantic judgment into F_D. The final closure proof must
  include a live F_P worker run that invokes a live LLM through the governed
  worker process; synthetic or installed replay-only proof is necessary for
  regression but is not sufficient for closure.
non_closure_conditions:
  - The executive observer is implemented only in a consumer product.
  - `consequence.C` becomes the F_P executive or owns semantic pressure judgment.
  - F_D derives product semantic rows, obligation maps, or bugfix meaning from unknown syntax.
  - The upper observer graph mutates lower graph call/frame/traversal state directly.
  - The observer emits runtime events, ledger truth, traversal transitions, or replay truth before ABG admission.
  - Product plugin tuning can bypass ABG payload admission or continuation fold.
  - The work introduces new workspace or observation carrier vocabulary before product and requirements prove an existing-surface gap.
  - The default behavior exists only as prompt prose and not as admitted evaluation findings plus replay-visible pressure facts.
  - Non-attenuating same-pressure retry is not detectable as typed pressure.
  - The observer claims recursive or any-scale pressure preservation across
    frame, zoom, child-frame, sibling graph-call, foldback, or re-entry
    boundaries before span identity across those boundaries is ratified and
    proven by T-169 or explicitly deferred from this slice.
  - The proof does not include a live F_P worker run with replayed observer
    pressure facts, admitted evaluation findings, continuation truth, and a
    digest-pinned artifact.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - cd build_tenants/abiogenesis/typescript && npm run test:t160
  - cd build_tenants/abiogenesis/typescript && npm run test:t160:live
  - cd build_tenants/abiogenesis/typescript && npm run test:t145
  - cd build_tenants/abiogenesis/typescript && npm run test:t146
  - cd build_tenants/abiogenesis/typescript && npm run test:t148
  - cd build_tenants/abiogenesis/typescript && npm run test:t159
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - git diff --check
---

# T-160: Declare ABG Recursive Executive Observer Graph For Obligation Pressure

## STDO Triage

### First Missing Layer

Product definition.

The product already names the core ingredients:

- `current_surface_projection` is replay-derived runtime truth, not private
  mutable controller state.
- Shared workspace mutation is already an effect edge guarded by
  observed-state, write-territory/output-allocation, staging, publication, and
  admission truth.
- `GraphFunction.environment` is the explicit immutable cumulative environment
  reference for graph-function execution.
- `Context` carries `locator` and `digest` truth, and implementation already
  admits `workspace://` locators.
- Asset surfaces already declare required contexts such as `workspace`.
- `TraversalUnit<A, B>` is the monadic traversal atom.
- `plugin.evaluate.C.rule[*]` may produce semantic findings, residual pressure,
  continuation refs, and proposed dispositions.
- `plugin.consequence.C` is projection over ABG-admitted state, not runtime
  mutation or closure authority.
- ABG admits plugin payloads, writes ledgers/events, folds assurance, derives
  traversal transition, and replays continuation.
- `traverse<A, B>(intent_lineage, context, A) -> (B, obligation_delta)` must
  conserve carried obligations and residual pressure.

The missing product law is not a new workspace type. It is the rule that an ABG
executive graph function declares the target workspace and target work through
the existing graph-function environment/context path, then carries workers,
assets, evidence, and obligation pressure around that declared target without
becoming a product-local controller.

### Lawful Re-Entry

`product_reprice`.

This is not a local TypeScript refactor. The product definition must first
state the graph-function workspace declaration model and the executive graph
function role. Requirements, design, and realization then descend from that
product shape.

### Governance Expansion

- `S`: requirements must preserve authority flow from GTL declarations to ABG
  admission and replay.
- `T`: the ticket must name closure, non-closure, proof commands, and
  dependency surfaces.
- `D`: design must define carrier roles, IACS, effect edges, and structural
  diagrams before code.
- `O`: the observer remains graph-native, outcome-first, and ABG-owned; it does
  not collapse into imperative orchestration.

## Problem

Some ODD-shaped graph executions need an executive worker whose role is to
maintain obligation pressure. In current practice that role often appears as a
human or agentic reviewer looking at a target run:

```text
E.observer -> (SDLC): { E.bugfix }
```

That role is lawful and load-bearing. It observes the current graph/traversal
state, preserves the obligation/gap/evidence mapping, identifies pressure
collapse, proposes a repair or re-entry, and proves whether the next iteration
attenuated the pressure.

The defect is ownership. If this role lives in a consumer product, it becomes a
second controller. If it is implemented by deterministic F_D parsing over
unknown product syntax, it becomes a hidden semantic compiler. If it is moved
into `consequence.C`, semantic judgment happens after the evaluation admission
boundary and destabilizes bind.

ABG needs to own the recursive executive observer behavior.

## Minimal Workspace Model

The target product work remains one ordinary workspace declared by a graph
function's environment and context truth:

```text
target.workspace -> { target_work }
```

The ABG executive role is a graph function over that declared workspace:

```text
abg.executive.GraphFunction(
  environment: target.workspace -> target_work
)
```

The executive graph function carries the worker/assets view as existing ABG
projection truth around the target workspace:

```text
E(GraphFunction.environment + workspace Context + target asset/work binding)
  -> admitted evaluate.C finding(s)
  -> pressure/attenuation projection
  -> ABG continuation transition
  -> retry / repair / yield / re-entry / reprice / block / close-candidate
```

The recursion is stratified but does not require a new observation carrier:

```text
target.workspace holds the product work and product-owned meaning
abg.executive GraphFunction declares that workspace and target work
ABG projections carry workers/assets/evidence/pressure about it
E observes that declared environment and replay-derived projection truth
E may propose pressure findings about the target workspace/work
ABG admits and folds those findings
Only ABG continuation applies action back through admitted traversal
E cannot mutate the target workspace directly
```

The implementation posture is minimal:

- use existing current-surface, observed-state, replay, payload-ledger,
  assurance, consequence, traversal, and continuation projections;
- use existing `plugin.evaluate.C.rule[*]` result shape for semantic findings,
  residual pressure, evidence, diagnostics, continuation refs, and proposed
  dispositions;
- use existing hook/config/result-interface surfaces for product tuning where
  possible;
- add only the smallest adapter, projection row, or typed finding field needed
  after product and requirements prove an existing-surface gap.

## Default Behavior

ABG ships a default executive observer behavior that is conservative:

1. Observe the previous and current lower traversal attempt.
2. Preserve carried obligation refs, residual pressure refs, and target-carrier
   refs unless an admitted evaluation finding clears, refines, reroutes,
   blocks, reprices, or terminally projects them.
3. Invoke the F_P executive worker when semantic pressure cannot be reduced by
   deterministic carrier/admission facts.
4. Treat exact same-pressure retry as `non_attenuating_retry` unless new
   evidence, narrower scope, or changed lawful route is admitted.
5. Propose same-unit retry only when the repair surface is current-edge local.
6. Propose yield/re-entry when product tuning or the F_P executive identifies
   a nonlocal repair surface.
7. Propose reprice/block when owner, authority layer, or admissible repair
   surface is ambiguous.
8. Preserve all finding, payload, and projection refs for replay explanation.

F_D in this primitive may validate envelope shape, identity, provenance,
freshness, selected composition, payload contract, and declared pressure-delta
consistency. F_D must not derive product semantic rows, obligation maps, bugfix
meaning, or domain intent from unknown syntax.

## Plugin Tuning

Prefer existing hook/config and result-interface truth:

```text
abg.fp_consciousness
abg.fn_composition
plugin.evaluate.C.rule[*]
```

Default interpretation precedence:

```text
GraphVector.declarations
> GraphFunction.declarations
> Job.policy_hooks
> Role.policy_hooks
> Module.policy_hooks
> visible installed fallback
```

Plugin tuning may provide:

- domain obligation taxonomy;
- evidence reader refs;
- pressure severity policy;
- attenuation metric;
- lawful re-entry preferences;
- product-specific F_P executive prompt refs;
- result carrier constraints.

Plugin tuning must not provide:

- ABG runtime continuation authority;
- replay truth;
- event authorship;
- ledger writes;
- closure fold authority;
- deterministic semantic reconstruction over product syntax;
- a product-local loop.

A new hook key such as `abg.executive_observer_lens` is not part of the
minimal design. It is lawful only if the product and requirement reprices prove
that existing `abg.fp_consciousness`, `abg.fn_composition`, and
`evaluate.C`/result-interface surfaces cannot express the executive layer.

## Relationship To Existing Tickets

T-127 supplied the generic F_P construction loop and hook overrides. T-160 is
not a replacement for that loop. It generalizes the executive observer role from
construction priority selection to recursive pressure preservation over any
admitted traversal graph.

T-145 and T-146 supplied evaluation-set and composed-stage law. T-160 must use
that law: the executive observer emits evaluation findings/residual pressure
through existing result admission. It does not create a second ledger writer.

T-148 supplied the runtime continuation transition projection. T-160 feeds that
projection with admitted executive pressure; it does not replace it.

T-159 supplied the traversal-unit and consequence bind boundary. T-160 consumes
`TraversalUnit<A, B>` truth through the declared graph-function workspace
environment and replay projection, then preserves obligation pressure across
bind. It does not make `TraversalUnit` a new public topology object or make
consequence the executive.

## Required Work

1. Product reprice
   - Extend the product definition to state that the executive observer is a
     graph function over a declared target workspace and target work:
     `abg.executive.GraphFunction(environment: target.workspace ->
     target_work)`.
   - State that the target workspace is specified through existing
     `GraphFunction.environment`, `Context` locator/digest, and asset-surface
     required-context truth.
   - State that ABG projections carry workers, attempts, assets, evidence,
     payload-ledger, assurance, consequence, traversal, continuation, and
     obligation-delta truth about that declared target workspace.
   - State that the executive layer emits admitted `evaluate.C` findings and
     residual-pressure facts, not direct engine authority.
   - State that consequence bind remains deterministic admission/projection over
     admitted pressure and does not become the F_P executive.

2. Requirements reprice
   - Add only the minimal requirement law needed to preserve the product-level
     graph-function workspace declaration model.
   - First prove whether existing `GraphFunction.environment`, `Context`, and
     `AssetSurface.requiredContexts` law already expresses the model.
   - Add continuation/projection clauses for attenuation and non-attenuation
     where current requirements do not already cover them.
   - Reuse existing hook/config/result-interface law unless a specific
     expressiveness gap is proven.

3. Design module
   - Add derivation, IACS, and structural carrier diagram for the recursive
     executive observer.
   - Define graph-function environment workspace binding, target work binding,
     executive observation, effect edges, replay edges, admitted finding
     inputs, and ABG-owned projection outputs.

4. TypeScript realization
   - Reuse existing current-surface, observed-state, runtime replay,
     payload-ledger, evaluation-result, continuation, and traversal projection
     types where possible.
   - Reuse existing graph-function environment, context, and asset-surface
     carrier types for workspace binding.
   - Add only adapter/projection helpers needed to present the declared target
     workspace and replay-derived ABG projections to the executive evaluator.
   - Add admission helpers that reject engine-authority fields and mismatched
     selected composition identity on executive findings.

5. Runner/projection integration
   - Resolve the executive observer's target workspace from graph-function
     environment/context truth.
   - Materialize the executive observation view from replay-derived target
     workspace truth.
   - Open the executive observer as an upper frame or graph call with explicit
     graph-function workspace/context observation refs.
   - Admit executive findings before continuation.
   - Feed attenuation/non-attenuation into runtime continuation transition.

6. Default behavior
   - Implement the conservative default executive interpretation.
   - Implement non-attenuating retry detection over carried pressure refs, new
     evidence refs, narrowed scope refs, and route refs.
   - Ensure absence of product tuning falls back to the visible default rather
     than hidden code convention.

7. Tests
   - Prove the stratified recursion law: upper graph observes lower graph and
     cannot mutate it.
   - Prove default pressure preservation and attenuation classification.
   - Prove non-attenuating retry emits typed pressure.
   - Prove product tuning changes interpretation but not ABG continuation
     ownership.
   - Prove consequence cannot own F_P executive semantics.
   - Prove F_D envelope checks cannot satisfy semantic pressure.
   - Add a generic product-shaped fixture where
     `E.observer -> (TargetGraph): { E.bugfix }` produces admitted executive
     pressure findings without importing consumer product code.

## Acceptance Criteria

- [x] Product law describes the minimal graph-function workspace model:
      `abg.executive.GraphFunction(environment: target.workspace ->
      target_work)`.
- [x] Requirements define only the recursive executive observer law needed to
      preserve the product model and GTL/ABG ownership boundaries.
- [x] The design proves existing `GraphFunction.environment`, `Context`, and
      `AssetSurface.requiredContexts` law is either sufficient or identifies the
      smallest missing expressiveness gap.
- [x] The executive observation view is replay-derived, immutable to the
      executive observer, and bound to selected graph/function/vector/
      composition, workspace context, worker, attempt, asset, evidence,
      payload, continuation, and obligation-delta truth.
- [x] Executive output uses existing F_P/evaluate result admission where
      possible, is replayable, and is denied direct runtime authority fields.
- [x] Product tuning reuses existing hook/config/result-interface surfaces where
      possible and has visible default behavior.
- [x] Default behavior preserves pressure, detects exact same-pressure retry,
      and classifies attenuation, non-attenuation, local repair, nonlocal
      re-entry/yield, reprice, and block.
- [ ] The runner can open the executive layer over the declared workspace
      environment without circular mutation or hidden controller state.
- [ ] ABG continuation consumes only admitted executive findings and remains the
      owner of retry/yield/re-entry/reprice/block/terminal routing.
- [x] `consequence.C` remains projection over admitted state and does not become
      the F_P executive.
- [x] F_D is limited to envelope/admission/delta consistency checks and cannot
      synthesize product semantic pressure.
- [ ] Focused `test:t160`, relevant regression tests, full semantic suite, and
      diff checks pass.

## Non-Goals

- Do not add a new public GTL topology object.
- Do not make bare graph vectors public starts or job targets.
- Do not replace `TraversalUnit<A, B>`.
- Do not replace `plugin.evaluate.C` or `plugin.consequence.C`.
- Do not move consumer product semantics into ABG.
- Do not import a consumer product into abiogenesis.
- Do not create a product-local executive loop in a consumer repo.
- Do not use deterministic F_D syntax parsing as the pressure maintainer.

## Resolved Design Questions

1. The default observer is a named ABG system graph function with a visible
   built-in default binding. It does not introduce a new GTL topology object.
2. Executive disposition is projected from admitted `evaluate.C` findings into
   pressure facts and continuation input. It does not introduce a separate
   `evaluate_next` authority carrier.
3. The first slice opens the observer as a stratified graph/function projection
   linked by existing graph-function environment, context, replay, and
   projection refs. It does not mutate or own a child workspace frame.
4. Non-attenuation is deterministic over residual-pressure refs and admitted
   deltas when possible. F_P is used for semantic ambiguity and admitted as
   ordinary evaluation findings.
5. Recursive span identity is consumed from completed T-169 span-lineage law and
   proof. T-160 preserves those refs in its observation and pressure facts
   instead of maintaining a product-local span map.

## Closure Note

2026-06-29 reopened after STDO/DESIGN_MODULE_METHOD review.

The prior closure is not earned. The product, requirements, and design surfaces
remain useful, and pressure facts are emitted when a caller supplies
`request.executiveObserver`, but the production `start -> iterate` path does
not supply that observer by default. The runtime therefore has no production
executive observer caller.

The prior live proof also injected disposition-driving refs from test code and
classified pressure from substring-shaped refs rather than admitted F_P
assessment disposition truth. The projected `continuationInput` did not feed
ABG continuation/routing, so recursive control was inert.

This ticket remains active until:

- the observer is invoked on a production ABG runtime path without a
  test-only request field being the sole activation mechanism;
- admitted live F_P assessment disposition drives pressure classification;
- emitted executive pressure facts remain replay-visible runtime truth; and
- the resulting continuation input affects ABG continuation/routing.

The refuted closure artifact was:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/t160_recursive_executive_observer_live/20260629T025541939Z_pid48947/executive-observer-manifest.json`
- artifact digest:
  `sha256:892fa34495f9477ab98338fe13f387a9212bd59c34e2578e596156bbfd2731f5`
- live result: `yield_reentry`

Closure depends on active T-169 span identity across recursion and does not
authorize downstream products to create local executive loops, local span maps,
or local continuation controllers.
