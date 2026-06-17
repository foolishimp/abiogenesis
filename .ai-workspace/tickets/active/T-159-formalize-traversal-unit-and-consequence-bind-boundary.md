---
id: T-159
title: Formalize TraversalUnit and consequence bind boundary
type: feature
ticket_category: ordinary
status: active
goal: >-
  Formalize `TraversalUnit<A, B>` as the GTL/ABG closeable traversal atom and
  ratify consequence as the bind boundary without creating a new carrier,
  overlay launcher, CLI router, or flat closure enum.
change_intent: >-
  Reprice the product-definition and requirement surface so direct graph
  function calls, optional mutable-workspace overlays, plugin result admission,
  allowed consequence traversal, and runtime replay all compose through one
  typed traversal-unit formalism.
change_class: product_reprice
re_entry_point: product
owner: abiogenesis
priority: critical
triaged_at: 2026-06-17
created_at: 2026-06-17
updated_at: 2026-06-18
intake_source: odd_sdlc T-203/T-204 design pressure exposed that cold start, ticket re-entry, and CLI decommission need one GTL/ABG traversal atom instead of product-local routing doctrine
evaluation_criteria: >-
  Specification, design, compiler projection, and tests prove traversal-unit
  law over existing GTL/ABG carriers, including direct GraphFunction start,
  optional overlay-scoped candidate entry, consequence bind admission, and
  negative rejection of product-local substitutes.
closure_law: >-
  Close only when `TraversalUnit<A, B>` is ratified as notation over existing
  carriers, consequence bind is ABG admission/transition/replay rather than a
  plugin callback, the validator projects typed traversal law, and regression
  tests reject carrier drift, overlay shortcutting, product-local routing, and
  any flat traversal closure enum.
non_closure_conditions:
  - TraversalUnit becomes a new public GTL topology object.
  - TraversalUnit becomes a rival callable carrier to GraphFunction.
  - Bare GraphVector public-start or job targets become lawful.
  - Product-local CLI, replay, overlay, or triage routers claim bind authority.
  - A flat ClosureState enum replaces per-axis traversal disposition carriers.
related_tickets:
  - .ai-workspace/tickets/completed/T-144-align-abg-gtl-event-sourced-monad-and-sdlc-plugin-boundaries.md
  - .ai-workspace/tickets/completed/T-146-generalize-composed-c-stages-as-stage-set-phases.md
  - .ai-workspace/tickets/completed/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md
  - .ai-workspace/tickets/completed/T-155-define-first-class-gtl-graph-function-zoom-plan.md
  - .ai-workspace/tickets/completed/T-156-admit-consequence-allowed-traversal-catalog.md
  - .ai-workspace/tickets/completed/T-157-admit-runtime-start-traversal-strategy-selection.md
  - .ai-workspace/tickets/completed/T-158-admit-gtl-plugin-result-interface-contracts.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-203-factor-code-builder-graph-function-for-uat-test-generation-and-ticket-reentry.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-204-decommission-odd-sdlc-cli-orchestration-surface.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/comments/codex/20260617T113114Z_STRATEGY_traversal-unit-entry-triage.md
governance_scope: STDO Method, GTL, ABG
---

# T-159: Formalize TraversalUnit And Consequence Bind Boundary

## Intake

First missing layer: requirements.

The current ABG/GTL line already says:

- one edge traversal is the bounded unit of probabilistic compute;
- `GraphVector` is the internal invariant traversal boundary;
- `GraphFunction` is the public callable carrier;
- ABG is the event-sourced monad over selected GTL composition;
- `plugin.consequence.C` proposes product read-model and traversal consequence
  values, while ABG admits the projection, derives traversal transition, and
  replays continuation;
- start-time runtime traversal selection and consequence-time allowed
  traversal selection are already admitted surfaces.

The missing law is the named traversal atom that lets downstream ODD products
compose those pieces without rebuilding local command/controller concepts.

## Supersession Posture

T-159 is the unifying traversal-monad formalism for GTL/ABG. It supersedes
older traversal design interpretations by giving them one shared reading:

```text
TraversalUnit<A, B>
  -> admitted output/closure truth
  -> consequence bind boundary
  -> next TraversalUnit, retry, re-entry, reprice, yield, block, or terminal
```

Earlier tickets remain valid as completed substrate proofs, not independent
doctrine:

- T-152 provides program inventory admission through `typecheckGtlProgram(...)`.
- T-155 provides graph-function zoom authority.
- T-156 provides consequence traversal catalog admission.
- T-157 provides runtime-start attempt-envelope selection.
- T-158 provides plugin-result output admission.

Future design must interpret those surfaces as parts of the traversal monad
rather than as separate routing, registry, scheduler, CLI, overlay, or product
controller concepts.

## LLM-First Language Principle

GTL is an LLM-first language. Its compiler and contract law must reduce drift
by making lawful structure explicit, typed, and axiomatic.

The goal is not to make humans or agents remember traversal doctrine from
context. The goal is for graph, overlay, start, plugin, result-interface,
catalog, and carrier declarations to compile into typed law or typed failure.
Every strong typed axiom that the compiler can enforce removes one place where
an LLM, downstream product, CLI helper, or reviewer can invent a parallel
interpretation.

For T-159, this means `TraversalUnit<A, B>` and consequence bind must become
compiler-visible law. The validator should project the traversal shape declared
by a program and report typed non-conformance instead of forcing agents to infer
that shape by scanning implementation files.

## Formal Foundation

GTL/ABG uses algebraic principles to keep LLM-authored systems lawfully
composable.

Category-theoretic structure supplies the composition discipline:

- `GraphFunction<A, B>` is the public morphism-like carrier.
- `GraphVector<A, B>` is the internal traversal boundary beneath that carrier.
- `TraversalUnit<A, B>` is the closeable traversal atom ABG advances inside a
  selected graph-function execution.
- Consequence bind composes closed unit truth with the next lawful traversal
  disposition.

Event calculus supplies the temporal authority discipline:

- runtime facts are event-sourced;
- closure, retry, re-entry, reprice, yield, block, and terminal states are
  replay-derived;
- plugins propose facts and consequences, but ABG admission and replay decide
  what becomes runtime truth;
- no product controller, overlay shortcut, or CLI loop may replace admitted
  event truth with private state.

The point of the algebra is practical: LLM-first graph programs remain
auditable because composition and temporal truth are typed, admitted, and
replay-visible.

## Survey: Existing Substrate Concepts

### `GraphVector`

Existing law:

- `GraphVector` is the internal adjacency record and invariant traversal
  boundary.
- It carries transition-governance declarations, traversal strategy,
  target-carrier contracts, assurance contracts, and selected composition
  bindings.
- It is not a public callable carrier or semantic job target.

Design consequence:

`TraversalUnit<A, B>` must be formal notation over a selected graph-vector
boundary under a parent callable carrier. It must not replace `GraphVector`,
make graph vectors public targets, or create a new GTL topology type.

### `GraphFunction`

Existing law:

- `GraphFunction` is the public named callable workflow carrier.
- Public starts and jobs bind graph functions, then ABG advances internal graph
  vectors beneath that carrier.

Design consequence:

`TraversalUnit<A, B>` is subordinate to a selected `GraphFunction` execution
basis. It is the atom advanced by ABG inside the callable graph-function run,
not a new public callable surface.

### ABG Monad / Bind Chain

Existing law:

The live bind chain is the stage-set form ratified by
`M03_COMPOSED_C_STAGE_SET_DERIVATION.md`; scalar plugin calls are reductions of
this set form, not the constitutional chain itself:

```text
ABG.start(fn<A, B>.C)
  .bind(system.openGraphCall)
  .bind(system.openFrame)
  .bind(system.planTransformSet)
  .bind(plugin.transform.C.task[*])
  .bind(system.admitTransformTaskResult[*])
  .bind(system.writeTransformEventsAndLedgers)
  .bind(system.collectTransformSet)
  .bind(system.planEvaluationSet)
  .bind(plugin.evaluate.C.rule[*])
  .bind(system.admitEvaluationRuleResult[*])
  .bind(system.writeEvaluationLedgers)
  .bind(system.collectEvaluationSet)
  .bind(system.assuranceFold)
  .bind(system.planConsequenceSet)
  .bind(plugin.consequence.C.task[*])
  .bind(system.admitConsequenceTaskResult[*])
  .bind(system.collectConsequenceSet)
  .bind(system.admitConsequenceProjection)
  .bind(system.traversalTransition)
  .bind(system.replayContinuation)
```

Design consequence:

The formal bind boundary is the consequence phase plus ABG admission and
transition. `plugin.consequence.C` computes a proposed projection/action. The
actual bind is closed only when ABG admits the consequence projection and
derives traversal transition / replay continuation. Calling
`plugin.consequence.C` alone "the bind" would contradict existing authority
law because plugins cannot write ledgers, transition traversal, replay, or
close.

### `TraversalAttemptEnvelope`

Existing law:

- ABG already has `TraversalStrategySelection` and `TraversalAttemptEnvelope`.
- Static GTL qualifiers and runtime-start selections lower into the same
  envelope.
- Runtime-start selections are run-scoped start truth and may outrank static
  defaults for the matched vector.

Design consequence:

`TraversalUnit<A, B>` must include an attempt envelope when execution is
attempted. It must not duplicate traversal strategy selection or become a
second scheduling profile.

### Allowed Consequence Traversal Catalog

Existing law:

- T-156 admits `AllowedConsequenceTraversalCatalog` and catalog-gated
  consequence traversal actions.
- Families already include same-edge retry, depth/zoom traversal,
  graph-span re-entry, public-start re-entry, ticket traversal, F_H input,
  escalation/reprice, gap stop, and non-admit.
- Product plugins may select from the catalog, but ABG admits or rejects and
  owns construction projection, traversal transition, events, and replay.
- The T-156 catalog/admission mechanism is baseline GTL/ABG release law, not
  an optional downstream feature. Any conforming ABG release must provide the
  bind-selection surface for consequence traversal.

Design consequence:

The catalog is already the post-unit bind-selection authority. `TraversalUnit`
must not duplicate it. The formalism should state that every traversal unit has
an admitted or explicitly empty consequence traversal catalog surface, and that
a closed unit binds to one admitted catalog family, a terminal outcome, or a
blocked/yielded state.

"True by default" means the catalog surface exists by default. It does not mean
every traversal family is authorized by default. Missing or empty rows must
project explicit no-route, non-admit, gap-stop, hold, or blocked truth rather
than falling back to product-local routing or implicit same-edge retry.

### Runtime Start Strategy Selection

Existing law:

- T-157 admits `StartIntent.runtimeTraversalSelections`.
- A runtime-start selection can select schedule refs, dependency windows,
  progress artifacts, vector indexes, edge refs, and retry/yield continuation
  policy.

Design consequence:

Runtime start selection is not the traversal unit. It is one source of
attempt-envelope policy for the unit selected by ABG.

### Plugin Result Interface Contracts

Existing law:

- T-158 admits GTL plugin result interface declarations into
  `AdmittedPluginResultInterfaceCatalog`.
- Runtime plugin outputs are admitted through `AdmittedPluginResultEnvelope`
  against admitted interface contracts before downstream products consume them.
- Replay-visible payload/evidence events carry the admitted envelope identity,
  contract digest, produced carrier refs, and evidence refs.

Design consequence:

Plugin result interfaces are not a traversal unit and do not own bind routing.
They are the unit's output-admission surface for transform/evaluate/consequence
stage results. A traversal unit cannot close, bind, project payload truth, or
advance downstream interpretation from raw plugin result files; it consumes
only ABG-admitted result envelopes and payload/evidence events.

### GTL Program Conformance Inventory

Existing law:

- `typecheckGtlProgram(...)` admits graph functions, graph vectors,
  target-carrier rows, edge-closure rows, overlays, public starts, prompt
  assets, plugin contracts, plugin result interfaces, runtime bindings, and
  active source identity.
- Downstream products can publish graph/overlay/start/plugin inventory without
  creating local substrate law.

Design consequence:

There is already a registry-like inventory surface for standard graph,
overlay, public-start, plugin, and carrier declarations. T-159 should not
create a new registry unless a later proof shows a missing publication
boundary. The minimal design is to define the traversal atom over the existing
module/inventory/catalog surfaces.

Compiler consequence:

The GTL validator/compiler must become the normal way to inspect downstream
graph and overlay law. Reviewers should not manually scan every downstream
graph, overlay, start, plugin, catalog, and carrier path to infer whether a
program is lawful. Downstream products publish inventory; the validator reports
typed conformance, typed gaps, and the traversal-unit/bind projection implied
by that inventory.

The validator should be strengthened to answer these questions directly:

- Which public graph functions can instantiate traversal units?
- Which internal graph vectors are the structural `TraversalUnit<A, B>`
  boundaries under those graph functions?
- Which starts can enter which initial unit?
- Which overlays are policy/catalog declarations and which would be illegal
  execution shortcuts?
- Which plugin result interfaces admit transform/evaluate/consequence outputs
  into unit truth?
- Which consequence traversal families are available, absent, or explicitly
  non-admitted for each unit?
- Which declarations are product-owned interpretation rather than substrate
  traversal authority?

## Survey: Downstream Duplicate Surfaces In odd_sdlc

### Bootstrap / Proportionality Entry

Observed surfaces:

- `Fg_bootstrap_sdlc_entry`
- `SdlcBootstrapPublicStartOptimization`
- `SdlcBootstrapProportionalityReport`
- `triagedPublicStartEntryOverlayRef(...)`
- `overlay://odd-sdlc/bootstrap-entry-optimising`

Current risk:

These surfaces are close to `traverse<bootstrap, conformant>`, but current
public-start code can treat them as a pre-start overlay shortcut. That
duplicates the intended substrate bind shape because the child overlay is
selected before a named traversal unit closes.

Target interpretation:

`Fg_bootstrap_sdlc_entry` is an odd_sdlc product graph-function specialization
of the substrate entry unit:

```text
traverse<bootstrap, conformant>
  -> consequence selects lite/framework/full/current route
```

The bootstrap proportionality report remains product read-model evidence. It
does not own traversal transition or public command routing.

### Ticket Re-entry

Observed surfaces:

- ticket workflow projection and execution contracts;
- `asset:ticket/<id>` public-start handling;
- `ticketContractRequestsCurrentFullTraversal(...)`;
- `overlay://odd-sdlc/ticket-workflow`;
- admitted ticket traversal as a T-156 allowed family.

Current risk:

Ticket start and cold start are both triage problems, but current downstream
code can make them separate local route selectors.

Target interpretation:

Ticket starts are odd_sdlc product entry units:

```text
traverse<ticket, triage>
  -> consequence selects ticket workflow, current-full re-entry, repair route,
     stop/defer, or block
```

Ticket file meaning remains product-owned. ABG owns traversal admission,
transition, replay, and public command control.

### Overlay Catalog

Observed surfaces:

- `constructSdlcTraversalOverlayCatalog(...)`;
- overlay rows, public start targets, default start targets;
- overlay-local allowed consequence traversal declarations derived through
  ABIogenesis `deriveAllowedConsequenceTraversalCatalogFromGtl(...)`.

Current risk:

Low. The overlay catalog is product registry/read-model truth over GTL/ABG
declarations. It is not duplicate substrate law as long as it keeps deriving
allowed consequence traversal declarations from ABG and does not execute.

Target interpretation:

Keep the overlay catalog. Use it as product policy and route vocabulary
consumed by traversal-unit consequence bind, not as an imperative traversal
controller.

### Spec Method / CLI Start Replay Helpers

Observed surfaces:

- `odd-sdlc-ts` bin;
- `cli/main.ts` process launcher;
- `spec_method/entry.ts` command parsing for `start`, `gaps`, `query-domain`,
  `--graph-overlay`, runtime traversal selections, replay-next-action handling,
  and archive-derived next target reconstruction;
- `startOutcomeForObservedReplay(...)` and related replay target selection.

Current risk:

This is the highest duplicate surface. It has accumulated ABG-like command
control and replay routing because downstream product code lacks one strict
formal traversal atom and because the SDLC CLI is available as a drift target.

Target interpretation:

This is downstream migration work for odd_sdlc T-204. T-159 should give it
substrate law to delete or demote these command/replay helpers without a shim:
ODD products publish graph functions, overlays, plugins, carriers, and proof
surfaces; ABG CLI owns start/resume/replay/result-ingress command control.

### Surface Output Path Maps

Observed surfaces:

- `operator/product_materialization/surface_paths.ts` now owns
  `TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS`,
  `WORKSPACE_LOCAL_SDLC_SURFACE_OUTPUT_PATHS`, and
  `MATERIALIZED_PRODUCT_FILE_ROLES`.
- `test_t197_product_gtl_gate` rejects duplicate owners.

Current risk:

The duplicate path-map issue has already been addressed in odd_sdlc. It is not
part of the GTL/ABG traversal formalism except as an example of the correct
shape: one carrier owner, product gate against local duplicates.

## Target Truth

Define `TraversalUnit<A, B>` as the closeable graph-vector traversal atom under
selected GTL/ABG execution truth.

It is formal notation over existing carriers:

```text
TraversalUnit<A, B> =
  selected parent GraphFunction execution
  + selected internal GraphVector<A, B>
  + selected abg.fn_composition C
  + ExecutionBasis / GraphCall / Frame identity
  + TraversalAttemptEnvelope when attempted
  + admitted transform.C outputs through plugin result envelopes
  + admitted evaluate.C rule outputs through plugin result envelopes
  + admitted consequence.C result envelope when the phase produces output
  + assurance fold / closure projection
  + admitted consequence projection
  + ABG traversal transition / replay continuation disposition
```

`TraversalUnit<A, B>` is not:

- a new public GTL topology object;
- a rival to `GraphVector`;
- a rival to `GraphFunction`;
- a runtime controller;
- a CLI command;
- a product overlay;
- a plugin callback;
- a filesystem artifact;
- a new registry.

The consequence bind boundary is:

```text
plugin.consequence.C
  -> system.admitConsequenceProjection
  -> system.traversalTransition
  -> system.replayContinuation
```

The plugin proposes consequence projection and optional traversal action.
ABG admits, rejects, blocks, transitions, or replays. That combined phase is
the bind boundary for traversal-unit composition.

## Minimal Design

### Definition

Ratify `TraversalUnit<A, B>` in product/requirements as a formal atom, not a
new carrier. Use it to state what ABG advances and closes when executing a
published graph function.

### Disposition Axes

A traversal unit closes, continues, yields, blocks, or terminates only through
ABG-owned runtime truth. These names are explanatory projections over existing
axes, not a new flat `ClosureState` enum:

- `close` projects through target-carrier admission, assurance fold, and vector
  closure/runtime event truth;
- `retry`, `repair`, `reenter`, and `reprice` project through allowed
  consequence traversal families, construction action kinds, and runtime
  continuation transition disposition;
- `yield` projects through construction action / terminal continuation carriers;
- `block` projects through gap-stop, non-admit, or blocked continuation
  carriers;
- `terminal` projects through existing terminal-kind and public control
  carriers.

T-159 forbids ratifying a single eight-member closure enum for these names. If a
future proof gap requires a new carrier, it must be introduced as a separate
ticket with axis ownership and migration proof, not by normalizing a local
traversal-state enum.

### Bind Law

For traversal-unit composition:

```text
bind(TraversalUnit<A, B>, next<B, C>) =
  admitted consequence result
    -> admitted traversal family or terminal state
    -> replay-derived next unit, same-unit retry, re-entry, reprice, yield,
       block, or terminal projection
```

The bind law consumes the T-156 allowed traversal catalog for nonlocal routes.
It consumes T-157 runtime-start selections only as attempt-envelope input for
the selected unit.

The T-156 catalog surface is present for every conforming GTL/ABG release and
for every traversal unit. Per-edge declarations decide which families are
available for that unit; absence of a family is negative authority, not an
invitation for a product controller to choose a local substitute.

### Product Entry Units

Downstream ODD products may define product entry units as graph functions or
graph-function specializations.

For odd_sdlc:

```text
start(next)   = traverse<bootstrap, conformant>
start(ticket) = traverse<ticket, triage>
```

The route after those entry units is consequence-bound, not preselected by a
scenario launcher or SDLC CLI. Product overlays remain product policy/catalog
inputs to consequence bind.

### Registry Position

Do not add a new graph/overlay registry in this ticket.

Existing registry/publication layers are sufficient for this formalism:

- tenant registry for build-tenant realization roots;
- GTL `Module` for graph/function/job declaration publication;
- `typecheckGtlProgram(...)` inventory for downstream graph, overlay, public
  start, plugin, target-carrier, result-interface, and source identity rows;
- product overlay catalogs as downstream read-model/policy surfaces.

If a later use case needs reusable standard graph packages across products,
file that as a separate publication-profile ticket over `Module` and
`typecheckGtlProgram(...)`, not as part of `TraversalUnit`.

### Compiler / Validator Position

Strengthen `typecheckGtlProgram(...)`; do not replace it with manual downstream
review practice or a new product-local scanner.

The compiler should project a traversal-unit view over admitted program
inventory. That projection may be report-only at first, but it should carry
typed issue rows sufficient to fail closed when downstream inventory attempts
to use:

- a bare graph vector as public start/job authority;
- an overlay as execution shortcut rather than policy/catalog input;
- plugin output files as result contract authority;
- consequence traversal not present in the admitted catalog;
- runtime-start schedule selection as topology;
- product-local CLI/replay route selection as bind law;
- ambiguous entry units or ambiguous consequence bind candidates.

This is the strong-typing payoff of GTL contract law: the compiler tells the
reviewer what traversal shape the product declares, what is missing, and what
is illegal. Human review should focus on product meaning and requirement fit,
not reconstructing substrate validity by scanning implementation files.

## Impacted Surfaces

### Specification

- `specification/PRODUCT.md`: name `TraversalUnit<A, B>` and consequence bind.
- `specification/INTENT.md`: tighten "one edge traversal" into closeable unit
  wording.
- `REQ-L-GTL3-LANGUAGE`: state strong typed compiler-visible contract law as
  GTL's anti-drift mechanism for LLM-authored programs.
- `REQ-L-GTL3-CONTRACT-LAW-API`: state the compiler/validator traversal-unit
  projection and typed bind non-conformance surface.
- `REQ-L-GTL3-GRAPHVECTOR`: state graph vectors are the structural boundary of
  a traversal unit without becoming public targets.
- `REQ-L-GTL3-COMPUTE-NOTATION`: state consequence phase is the bind boundary
  only through ABG admission/transition/replay.
- `REQ-R-ABG3-FN-COMPOSITION`: connect the existing event-sourced bind chain to
  traversal-unit composition.
- `REQ-R-ABG3-INTERPRET`: state ABG advances graph functions by closing or
  binding traversal units.
- `REQ-R-ABG3-PAYLOAD`: ensure stage outputs remain proposed until admitted
  into the unit's runtime truth.

### Design

- `M03_ABG_PROBABILISTIC_MONAD_PLUGIN_BOUNDARY_DERIVATION.md`: add the
  traversal-unit atom and bind terminology.
- `M03_CONSEQUENCE_ALLOWED_TRAVERSAL_CATALOG_DERIVATION.md`: state the catalog
  is the post-unit bind-selection surface, not the unit itself.
- `M03_PLUGIN_RESULT_INTERFACE_CONTRACT_DERIVATION.md`: state admitted plugin
  result envelopes are the unit's output-admission surface, not a separate bind
  controller.
- `M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`: align iteration decisions with
  unit open/attempt/close/bind progression.
- `M04_PUBLIC_START_DERIVATION.md`: state public start ignites/resumes graph
  function execution and may select an entry unit, but does not replace unit
  bind law.
- `M03_GTL_PROGRAM_CONFORMANCE_GATE_FIRST_SLICE_IACS.md`: state
  `typecheckGtlProgram(...)` projects traversal-unit law from inventory and
  reports typed unit/bind non-conformance.

### Realization

No runtime engine code change is required to start T-159. Compiler/reporting
proof is the realization path:

- add exported type aliases or documentation carriers only if they prevent
  drift;
- extend `typecheckGtlProgram(...)` with a traversal-unit projection over
  graph/function/vector/target/plugin/overlay/start/result/catalog inventory;
- emit typed issues for missing, ambiguous, or illegal traversal-unit and bind
  declarations;
- add conformance/report text proving a downstream program declares enough
  inventory to instantiate traversal units;
- add negative tests that reject product-local traversal-unit substitutes.

## Downstream Adoption Notes For odd_sdlc

T-159 should unblock odd_sdlc without moving SDLC meaning into ABG.

Expected downstream changes belong in odd_sdlc tickets:

- T-203: reinterpret bootstrap entry and ticket re-entry as product entry units
  over GTL/ABG bind law.
- T-204: remove the SDLC CLI orchestration surface directly, with no shim,
  because public command/control belongs to ABG CLI and product composition
  belongs in graph functions, overlays, plugins, carriers, and proofs.

The odd_sdlc overlay catalog remains valid product policy. The bootstrap
optimization/proportionality carrier remains product evidence. The direct
public-start overlay chooser and CLI replay helpers are the drift surfaces to
retire or demote after the upstream law is ratified.

## Non-Closure Conditions

- `TraversalUnit` is implemented as a new public GTL topology object.
- `TraversalUnit` becomes a rival callable carrier to `GraphFunction`.
- `TraversalUnit` makes bare `GraphVector` public-start or job targets lawful.
- `plugin.consequence.C` is described as owning traversal transition without
  ABG admission.
- A downstream product keeps a local command loop or replay router and claims
  it is a traversal-unit implementation.
- A new registry is created for graphs/overlays while the existing
  `Module` / `typecheckGtlProgram(...)` / product catalog surfaces remain
  sufficient.
- Start strategy selection, allowed consequence traversal catalog, bootstrap
  proportionality, and ticket triage are collapsed into one ambiguous local
  "triage router" abstraction.

## Closure Criteria

- Product and requirements define `TraversalUnit<A, B>` as the closeable
  graph-vector traversal atom over existing carriers.
- Requirements state that consequence bind means `plugin.consequence.C` plus
  ABG admission, traversal transition, and replay continuation.
- The GTL validator/compiler is specified as the normal inspection surface for
  downstream traversal law, so product graph/overlay/start/plugin inventories
  do not require manual substrate scanning.
- Requirements state that GTL is LLM-first and that strong typed axioms in the
  compiler/validator are an anti-drift mechanism, not optional documentation.
- Requirements state the formal foundation: category-theoretic composition for
  graph/traversal/bind structure and event calculus for replay-derived runtime
  truth.
- The design surfaces name which existing carrier owns each part of the unit:
  graph function, graph vector, selected composition, attempt envelope,
  admitted plugin result envelopes, admitted stage outputs, assurance fold,
  consequence projection, transition, and replay.
- `typecheckGtlProgram(...)` has a defined traversal-unit projection or a
  ratified report shape that can name lawful units, entry units, catalog-bound
  bind options, and typed non-conformance rows.
- The survey above remains in the ticket or is moved to a reviewed design note
  before code work starts.
- Negative proof exists that a product-local overlay preselector, CLI replay
  helper, or command loop cannot satisfy traversal-unit bind law.
- Downstream odd_sdlc adoption can cite this ticket for
  `traverse<bootstrap, conformant>` and `traverse<ticket, triage>` without
  inventing an SDLC-local traversal monad.

## Release-Blocking Compiler Boundary Tests

T-159 is not release-complete for a `4.1.0-rc.1` cut until the GTL compiler
boundary is exercised beyond the first projection smoke tests.

Release test bar:

- Every release-significant compiler feature introduced or reinterpreted by
  T-159 must have at least three boundary tests and at least three negative
  tests.
- Boundary tests prove lawful edge behavior, not only the happy path.
- Negative tests prove typed failure for drift, missing authority, ambiguous
  authority, malformed declarations, and product-local substitutes.
- Test names must make the feature and boundary class visible enough that a
  reviewer can audit the matrix without reading the implementation first.

Current state:

- `typecheckGtlProgram(...)` projects `traversalUnitProjection`.
- T-159 now has thirty-six named tests across
  `test_t150_gtl_program_conformance_tool.test.mjs`,
  `test_t152_consequence_traversal_action_bridge.test.mjs`, and
  `test_t156_consequence_allowed_traversal_catalog.test.mjs` covering
  projection, multi-vector determinism, public-start id resolution, overlay
  isolation, direct graph-function start without overlay, overlay-scoped
  candidate entry units, incompatible overlay rejection, empty/no-bind
  consequence catalog truth, runtime command authority, closeability
  prerequisites, consequence proposal admission as data before replay,
  ABG replay-visible re-entry, public API rejection of a flat traversal closure
  enum,
  engine-authority rejection, report digest, public declarations, CLI JSON
  output, and synthetic bootstrap/ticket entry fixtures.
- The release test matrix below is satisfied by the T-159-named tests plus
  direct inherited T-150/T-152/T-156/T-158 tests where those tests already
  exercise the same typed compiler/runtime contract.

Feature coverage matrix required before release:

| Feature | Minimum boundary tests | Minimum negative tests |
| --- | ---: | ---: |
| `TraversalUnit<A, B>` projection over graph-function/vector inventory | 3 | 3 |
| Public-start entry-unit projection | 3 | 3 |
| Overlay isolation and proportional entry interpretation | 3 | 3 |
| Closeable-unit prerequisite coverage: target carrier, edge closure, compute composition, stage binding, plugin result interface | 3 | 3 |
| Consequence bind boundary: plugin proposal plus ABG admission, transition, and replay continuation | 3 | 3 |
| Consequence traversal catalog interaction with traversal units | 3 | 3 |
| Runtime binding command authority and product-local router rejection | 3 | 3 |
| CLI/report/export contract for `traversalUnitProjection` | 3 | 3 |

Release matrix audit evidence:

| Feature | Boundary evidence | Negative evidence |
| --- | --- | --- |
| `TraversalUnit<A, B>` projection | Single-vector projection, multi-vector deterministic projection, synthetic bootstrap/ticket projection | Stray overlay vector does not create a unit, inherited unsatisfied graph dependency rejection, inherited opaque vector identity rejection |
| Public-start entry projection | Name entry, graph-function id entry, synthetic bootstrap/ticket entries | Missing graph function, graph-vector id masquerade, overlay-ref masquerade |
| Overlay/proportional entry interpretation | Base overlay entry, graph-function id overlay entry, direct graph-function start without overlay, overlay-scoped candidate entry fixture, synthetic two-overlay entry fixture | Stray overlay vector, overlay public-start target by vector id, overlay default start by vector id, unrelated overlay attached to public start |
| Closeable-unit prerequisites | Complete single-vector unit, complete multi-vector units, complete synthetic downstream units | Missing target carrier, missing edge closure, missing compute/stage/plugin/consequence result-interface truth |
| Consequence bind boundary | Proposal admitted as data, ABG replay-visible re-entry, inherited T-152 construction re-entry consumption | Missing consequence result-interface truth, plugin-owned engine authority before replay, inherited engine-authority/out-of-range re-entry rejection, public API rejection of a flat traversal closure enum |
| Consequence catalog interaction | Catalog declaration admission, sibling-family admission, empty/no-bind projection | Unknown or malformed declarations, missing route authority/proportionality-as-authority rejection, runner blocks undeclared catalog row |
| Runtime command authority | ABG-owned command refs, bare ABG start command, graph-function id target command | Product-local command router, token table for SDLC/overlay/replay helpers, inherited product-local wrapper rejection |
| CLI/report/export contract | CLI JSON projection, report digest sensitivity, public `.d.ts` exports | Typed traversal-unit issue rows, CLI invalid public-start projection, inherited malformed raw/invalid CLI report failure |

Required before release:

- [x] Multi-vector graph function projects multiple deterministic
      `TraversalUnit` rows.
- [x] Public-start entry projection is tested for graph-function name and id
      resolution, plus non-function negative refs for missing graph functions,
      graph-vector ids, and overlay refs.
- [x] Overlay rows cannot imply traversal units for graph vectors outside the
      selected graph function.
- [x] Direct GraphFunction start without an overlay remains legal; overlay is
      an optional mutable-workspace lens, not a required public callable
      carrier.
- [x] Explicit overlay graph-vector scope narrows candidate entry units without
      selecting the runtime unit; proportionality/triage remains responsible
      for selected entry.
- [x] A public start cannot attach an explicit overlay that belongs to another
      graph function.
- [x] Missing target-carrier truth is reported as an incomplete closeable
      traversal unit.
- [x] Missing edge-closure truth is reported as an incomplete closeable
      traversal unit.
- [x] Missing compute composition or selected stage binding is reported as an
      incomplete closeable traversal unit.
- [x] Missing plugin result-interface truth is reported as an incomplete
      closeable traversal unit.
- [x] Consequence bind cannot be satisfied by `plugin.consequence.C` alone;
      the test must require ABG admission, transition, and replay-visible
      continuation authority.
      Static coverage rejects a unit whose consequence result-interface truth is
      missing; runtime coverage admits a plugin proposal as data before replay,
      admits the proposal only through ABG replay-visible graph re-entry, and
      rejects plugin proposals that attempt to own engine runtime authority
      before replay.
- [x] Missing or empty consequence traversal catalog behavior is explicitly
      tested as either lawful terminal/no-bind truth or typed non-conformance.
- [x] Closure, retry, re-entry, reprice, yield, block, and terminal names remain
      projections over existing carrier axes; the public contract surface does
      not publish a flat traversal closure enum.
- [x] Runtime binding allowlist proves legitimate ABG command refs pass.
- [x] Runtime binding denylist is table-driven across SDLC/product-local router
      tokens such as `odd-sdlc`, `odd_sdlc`, `sdlc`, `overlay:`,
      `--graph-overlay`, replay helpers, and observed-replay helpers.
- [x] CLI `typecheck-gtl-program --format json` emits
      `traversalUnitProjection`.
- [x] Report digest changes when traversal-unit-significant inventory changes.
- [x] Public package `.d.ts` exports include the traversal-unit projection
      report types.
- [x] A synthetic downstream-like fixture proves
      `traverse<bootstrap, conformant>` and `traverse<ticket, triage>` without
      depending on odd_sdlc implementation code.
- [x] Final release matrix audit maps each T-159 compiler/runtime feature to
      its boundary and negative tests and proves every release-significant row
      satisfies the 3/3 minimum.
      Audit result: `TraversalUnit` projection, public-start entry projection,
      overlay/proportional entry interpretation, closeable-unit prerequisites,
      consequence bind, consequence catalog interaction, runtime command
      authority, and CLI/report/export contracts each have at least three
      boundary cases and at least three negative cases across the named suite.

Release non-closure:

- A release snapshot is cut from a dirty tree or before T-159 is present in a
  clean release cut.
- A downstream product claims `traversalUnitProjection` release consumption
  before these boundary tests pass in the released ABI package.

## Implementation Ledger

- [x] 2026-06-17: Surveyed existing GTL/ABG and odd_sdlc surfaces for duplicate
  concepts before implementation.
- [x] 2026-06-17: Captured minimalist design direction in this ticket.
- [x] 2026-06-18: Ratified Phase 1 product, intent, and requirement wording for
  `TraversalUnit<A, B>`, consequence bind, compiler-visible traversal law, and
  GTL's LLM-first typed anti-drift principle.
- [x] 2026-06-18: Updated singular design surfaces for traversal-unit atom,
  consequence bind, output admission, iteration progression, public-start entry
  boundary, and compiler traversal projection.
- [x] 2026-06-18: Added `typecheckGtlProgram(...)` traversal-unit projection
  over existing graph function, graph vector, target carrier, edge closure,
  compute composition, plugin result interface, consequence catalog, and public
  start inventory.
- [x] 2026-06-18: Added T-159 executable proof that the validator reports
  lawful units, entry units, catalog-bound bind families, and a typed
  non-conformance row for a public start with no traversal unit.
- [x] 2026-06-18: Added T-159 negative proof that an SDLC-style
  product-local CLI/replay/overlay command router cannot satisfy runtime bind
  law through `GtlProgramRuntimeBindingRow.commandRef`.
- [x] 2026-06-18: Verification passed:
  `npm run build:semantic`,
  `node --test test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs`,
  `npm run lint:semantic`, `npm run test:t156` (60 tests), and
  `git diff --check`.
- [x] 2026-06-18: Release preflight was checked without build/pack using
  `release-snapshot --build false` against a temporary snapshot root. The
  actual ABI release command rejected with `dirty_source_tree`, so no downstream
  product may claim to consume `traversalUnitProjection` from a released
  ABIogenesis package until T-159 lands in a clean release snapshot.
- [x] 2026-06-18: Added the first T-159 compiler boundary-test tranche:
  multi-vector deterministic traversal-unit projection, graph-function id entry
  resolution, overlay isolation, target-carrier / edge-closure / composition /
  stage-binding / plugin-result-interface closeability negatives, consequence
  result-interface negative, runtime command allowlist, table-driven
  product-local router denylist, report digest sensitivity, public declaration
  export proof, and CLI JSON projection proof. Verification passed:
  `npm run build:semantic`, `node --test
  test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs`,
  `npm run lint:semantic`, and `npm run test:t156` (73 tests).
- [x] 2026-06-18: Added the second T-159 test tranche: missing and explicit
  empty consequence-catalog projection as lawful no-bind truth, synthetic
  downstream `traverse<bootstrap, conformant>` and `traverse<ticket, triage>`
  entry units, ABG replay-visible consequence traversal admission, rejection of
  plugin-owned engine runtime authority, and empty-catalog runtime no-bind
  failure before graph re-entry. Verification passed:
  `npm run build:semantic && node --test
  test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs` (65 tests),
  `npm run test:t156` (79 tests), `npm run lint:semantic`, and
  `git diff --check`.
- [x] 2026-06-18: Added T-159 public-start entry negative coverage for
  graph-vector ids and overlay refs masquerading as graph-function entry
  targets. Verification passed:
  `node --test test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs`
  (67 tests).
- [x] 2026-06-18: Added T-159 consequence bind boundary coverage proving a
  plugin traversal proposal is admitted as data before ABG replay, preserving
  graph-function selection, traversal family, and proportionality basis.
  Verification passed:
  `node --test
  test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs`
  (6 tests).
- [x] 2026-06-18: Added the third T-159 release-matrix tranche: overlay entry
  target acceptance by graph-function id, overlay target/default-start
  rejections for graph-vector ids, additional ABG runtime command positive
  authority cases, typed traversal-unit report issue rows, and CLI invalid
  public-start projection. Verification passed:
  `node --test test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs`
  (74 tests).
- [x] 2026-06-18: Refined the overlay/direct-call invariant so prior graph
  function start and mutable-workspace overlay work are not weakened by the
  traversal monad formalism. Added regression tests proving direct graph
  function start without overlay, overlay-scoped candidate entry units, and
  rejection of public starts attached to unrelated overlays. Verification
  passed:
  `npm run build:semantic && node --test
  test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs` (77 tests).
- [x] 2026-06-18: Applied review fixes from the T-159 deep review: updated
  ticket frontmatter to STDO required fields, reclassified the work as
  `product_reprice` / `product`, added T-155 to related tickets, replaced the
  stale scalar bind-chain survey with the live composed stage-set bind chain,
  clarified that closure/retry/re-entry/reprice/yield/block/terminal names
  project over existing carrier axes, and added a public declaration regression
  test rejecting a flat traversal closure enum. Verification passed:
  `npm run build:semantic && node --test
  test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs` (78 tests).
- [x] 2026-06-18: Full current verification passed after the latest T-159
  boundary-test additions: `npm run build:semantic`, `node --test
  test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs` (78 tests),
  `node --test
  test_env/tests/test_t152_consequence_traversal_action_bridge.test.mjs`
  (6 tests), `npm run test:t156` (93 tests), `npm run lint:semantic`, and
  `git diff --check`.
