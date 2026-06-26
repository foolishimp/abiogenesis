---
id: T-162
title: Realize ABG requirements algebra strategy
type: feature
ticket_category: ordinary
status: completed
goal: >-
  Implement the ABG-owned requirements algebra from the strategy post as one
  coherent substrate: requirement identity, traversal spans, staged context
  fragments, destination topology, KAOS-inspired goal relations, edge
  requirement environments, projections, evidence bindings, test relations,
  folds, residuals, attenuation, assurance-case read models, completeness
  gates, workflow graph functions, query functions, and migration bridges. The
  implementation must make obligation, materialization, evidence, fold,
  residual, and re-entry ledgers projections from an event-sourced requirement
  ledger read model rather than peer local ledgers.
change_intent: >-
  Ratify and realize requirements as the typed carrier that preserves WHAT
  pressure through finite GTL/ABG graph-function traversal. A requirement is
  not a flat document row or a product-local string id. It is a stable,
  source-provenanced algebraic term with a traversal span, relations,
  operationalization, evidence policy, fold state, residual pressure, and
  replay-visible projection. ABG owns the carrier grammar, admission, replay,
  deterministic projection gates, fold law, residual attenuation, and query
  surface; GTL exposes wrapper declarations and graph-function bindings; F_P
  maintains semantic pressure; F_H may admit explicit product-owner reprices or
  residual risk; F_D is limited to admitted envelope, identity, relation,
  provenance, span, and replay consistency checks, and must be total over the
  admitted requirements-algebra state space by returning typed structural,
  residual, F_P-required, or F_H-required states for every input state.
change_class: product_reprice
re_entry_point: product
owner: abiogenesis
priority: critical
triaged_at: 2026-06-26
created_at: 2026-06-26
updated_at: 2026-06-26
completed_at: 2026-06-26
governance_scope: STDO Method, GTL, ABG, Requirements, Assurance
build_tenant: typescript
single_ticket_rule: >-
  This is the single ticket for the requirements-algebra strategy implementation wave
  described by the strategy post. Do not split the strategy into sibling
  implementation tickets unless the operator explicitly reprices the work. Use
  the internal coverage matrix and checklist in this ticket for sequencing.
first_slice_scope: >-
  T-162 closes only the additive ABG/GTL requirements-algebra substrate. It
  does not require downstream products to delete existing local ledgers in this
  slice. Existing obligation refs and residual-pressure refs may remain as
  retained compatibility inputs only when they are wrapped into requirement
  projection refs, do not own closure, and cannot outrank the event-sourced
  requirements-algebra projection.
re_entry_guard: >-
  The initial re-entry is product_reprice because INTENT already places GTL/ABG
  as the graph-native language/runtime and ABG as event/projection/fold owner.
  Required Work item 1 must still review INTENT before editing product law; if
  KAOS-derived goal semantics, destination-topology law, assurance-case
  projection, or odd_glc boundary cannot be derived from INTENT, the ticket must
  be repriced to intent_reprice before implementation work continues.
intake_source: >-
  Operator asked for one ticket to implement the requirements algebra from
  `.ai-workspace/comments/codex/20260626T011328Z_STRATEGY_requirements_algebra_edge_spans.md`.
  The strategy states that ledgers should fall out from one requirements
  ledger: requirements ledger -> obligation projection -> materialization target
  projection -> evidence binding projection -> closure fold projection ->
  residual/re-entry projection. It also states that the core belongs in
  GTL/ABG first, with odd_glc and recursive executive-observer work downstream
  of this substrate.
source_documents:
  - /Users/jim/src/apps/specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification/INTENT.md
  - specification/PRODUCT.md
  - specification/GOALS.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_REALIZATION_GUARDRAILS.md
  - .ai-workspace/comments/codex/20260626T011328Z_STRATEGY_requirements_algebra_edge_spans.md
related_tickets:
  - .ai-workspace/tickets/completed/T-145-realize-evaluate-c-as-evaluation-set-phase-over-read-only-ledgers.md
  - .ai-workspace/tickets/completed/T-146-generalize-composed-c-stages-as-stage-set-phases.md
  - .ai-workspace/tickets/completed/T-149-simplify-abg-iteration-state-action-algebra.md
  - .ai-workspace/tickets/completed/T-151-declare-segment-scoped-evaluation-redispatch-substrate.md
  - .ai-workspace/tickets/completed/T-152-admit-gtl-program-conformance-gate-for-downstream-graph-assets.md
  - .ai-workspace/tickets/completed/T-159-formalize-traversal-unit-and-consequence-bind-boundary.md
  - .ai-workspace/tickets/backlog/T-160-declare-abg-recursive-executive-observer-graph-for-obligation-pressure.md
affected_boundary:
  product:
    - specification/PRODUCT.md
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
    - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
    - specification/requirements/gtl/REQ-L-GTL3-CONTEXT.md
    - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
    - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
    - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
    - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
    - specification/requirements/abg/REQ-R-ABG3-ITERATION.md
    - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  design:
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/admission/
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/
    - build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t162_requirements_algebra.test.mjs
target_truth: >-
  ABG/GTL core owns an algebraic requirement kernel. Requirement pressure is
  represented by admitted carriers with stable identity, source provenance,
  typed relations, traversal spans, active edge environments, obligations,
  projections, evidence bindings, folds, residuals, attenuation, and assurance
  read models. The requirements ledger is a replay-derived projection over
  admitted requirement events; it is not an independent writable truth root.
  Existing obligation refs and residual pressure refs become compatibility
  inputs wrapped as requirement projection refs in this first slice, while any
  later deletion or demotion of downstream local ledgers is successor migration
  work. Product-specific meaning enters through context fragments,
  product-authored requirement terms, graph-function refs, evidence refs, F_P
  findings, F_H decisions, and plugins; it does not become ABG-local parsing of
  unknown product syntax. The implementation is preceded by a
  design-module-method-complete design that names the GTL
  extensions, ABG extensions, module decomposition, feature checklists,
  Irreducible Architectural Carrier Set, subordinate payload register,
  structural carrier diagram, and design-method review outcome.
superseded_truth: >-
  Requirements exist primarily as prose documents or local string ids, while
  obligation ledgers, materialization ledgers, test ledgers, evidence ledgers,
  closure folds, residuals, and re-entry decisions are independently invented
  per product and later reconciled by prompt convention, archive parsing, or
  deterministic semantic reconstruction.
closure_law: >-
  Close only when product law, requirements, design, TypeScript realization,
  admission tests, projection tests, fold/residual tests, and semantic regression
  tests prove the first ABG-owned requirements algebra slice. Closure must prove
  that broad and narrow traversal spans project obligations correctly; context
  fragments remain staged unless lawfully promoted; KAOS-inspired relations are
  admitted as typed terms; edge environments carry immediate, prior, and
  overarching pressure; destination-topology constraints are distinct from WHAT
  requirements; graph functions replace phase-flow as the constructive carrier;
  external KAOS, ReqIF, GSN/SACM/CAE, OpenOME/GRL, process-supervision, and
  constitutional-AI lessons are represented as bounded ABG/GTL semantics;
  evidence binding does not equal closure; test source, execution, and semantic
  interpretation remain distinct projections; current admitted evidence
  supersedes empty predecessor replay; F_P rejection can leave semantic
  assurance residual despite admitted execution evidence; folds emit
  replay-visible residuals and attenuation; completeness gates fail closed before
  product materialization when the model lacks required refinement,
  assignment, monitoring, obstacle, conflict, operationalization, test relation,
  span, evidence policy, context routing, destination topology, or retry
  attenuation coverage; and query/read models expose active requirements,
  obligations, materialization targets, execution schedules, evidence, folds,
  residuals, attenuation, and assurance claims without downstream archive
  parsing. Requirement folds, residuals, and re-entry pressure must be
  projections over existing ABG event, assurance fold, continuation, and
  evaluate-next truth, not rival closure or controller surfaces. F_D must be a
  total function over admitted requirements-algebra
  states: malformed, incomplete, stale, contradictory, ambiguous,
  semantically-unassessed, F_P-rejected, F_P-inconclusive, and F_H-required
  states must all map to explicit typed outcomes rather than exceptions,
  fallback success, silent omission, or semantic guessing. F_D admission is
  closed-world: unknown or unclassified states cannot be admitted into F_D and
  must be rejected, structurally classified, or routed to typed F_P/F_H pressure
  before deterministic evaluation. Code closure is not admissible until the
  design passes `DESIGN_MODULE_METHOD.md` review for authority seam closure,
  essential carrier consolidation, enforcement after proof, ingress collapse,
  Prime Law, IACS, subordinate payload discipline, promotion tests, ODD
  execution-authority audit, and module-bounded structural carrier diagrams.
evaluation_criteria:
  - The ticket progresses when the GOALS/INTENT/PRODUCT re-entry decision is
    recorded and product/requirements law establishes requirements algebra as
    an event-sourced ABG/GTL substrate.
  - The ticket progresses when the M03 design artifacts resolve ledger
    event-sourcing, fold/residual status mapping to existing ABG assurance and
    continuation truth, recursive/zoom span identity, IACS consolidation,
    slice-1 blocking gaps, and retained compatibility boundaries.
  - The ticket progresses when implementation is limited to the IACS-approved
    first-slice carriers, admissions, projections, F_D totality outcomes, query
    surfaces, and compatibility wrappers.
  - The ticket progresses when tests prove the first-slice worked trace and
    T-204-derived generic projection/fold fixtures without requiring odd_sdlc or
    odd_glc migration.
  - The ticket is complete only when all proof commands pass and the query
    surface can answer the target-state edge questions from admitted events and
    replay-derived requirement projections.
non_closure_conditions:
  - The work only adds strategy prose, comments, or ticket text.
  - Requirements remain flat strings without stable ids, source refs, spans, and typed relations.
  - Obligation/materialization/evidence/fold/residual ledgers remain
    authoritative peer ledgers for new closure truth rather than retained
    compatibility inputs or replay-derived projections from requirement events.
  - The requirements ledger is implemented or designed as an independent
    writable truth root rather than a projection over admitted requirement
    events.
  - RequirementFold, RequirementResidual, or re-entry pressure becomes a rival
    closure, continuation, retry, or evaluate-next surface instead of a
    projection over existing ABG truth.
  - F_D infers product semantic satisfaction from unknown syntax or path shape.
  - Unknown or unclassified state is admitted into F_D instead of rejected,
    structurally classified, or routed to typed F_P/F_H pressure.
  - F_D is partial over admitted requirements-algebra states, crashes, falls
    through, silently omits pressure, or treats an unhandled state as success.
  - Test source materialization or test execution is treated as requirement closure by itself.
  - F_P semantic rejection cannot preserve a residual over the requirement/test relationship.
  - Current admitted evidence cannot supersede empty or stale predecessor replay.
  - Context fragments are either all exploded into requirement atoms or all left as inert prose.
  - Traversal spans are local string conventions that do not survive graph-function/vector identity.
  - The implementation starts odd_glc, T-160 executive observation, UI, or downstream product policy before ABG/GTL owns the core carriers and folds.
  - No query/read model exists for active requirements, obligations, evidence bindings, folds, residuals, attenuation, and assurance claims.
  - Destination topology is collapsed into requirements or treated as a build-tenant special case.
  - Graph functions are treated as a projection of historical SDLC phases rather than the constructive lifecycle carrier.
  - KAOS, ReqIF, GSN, SACM, GRL, DOT, or editor surfaces become native authority instead of bounded import/export/read-model influences.
  - Completeness gates are prose-only and cannot fail closed deterministically.
  - The T-204-derived materialization and postflight bugs are fixed as local special cases rather than requirement-projection, evidence-binding, fold-precedence, and partial-fold rules.
  - Code implementation begins or closes before the GTL and ABG extension design assets pass design-module-method review.
  - The design lists many peer top-level types without IACS, authority/downstream classification, subordinate payload register, and promotion-test justification.
  - Module decomposition hides graph functions, traversal selection, closure, continuation, or semantic target movement inside deterministic service modules.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t162
  - cd build_tenants/abiogenesis/typescript && npm run test:t145
  - cd build_tenants/abiogenesis/typescript && npm run test:t146
  - cd build_tenants/abiogenesis/typescript && npm run test:t149
  - cd build_tenants/abiogenesis/typescript && npm run test:t151
  - cd build_tenants/abiogenesis/typescript && npm run test:t159
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
proof_surface:
  - specification/PRODUCT.md
  - specification/GOALS.md
  - specification/requirements/abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t162_requirements_algebra.test.mjs
---

# T-162: Realize ABG Requirements Algebra Strategy

## STDO Triage

### First Missing Layer

Product definition, followed by requirements.

The strategy post is commentary, not ratified specification. The work must
first make the product law explicit: ABG/GTL core owns requirement algebra as a
constructive substrate that carries WHAT pressure through HOW traversal and
assurance fold. Only after that product claim is ratified should requirement
surfaces, design modules, carriers, admission, and tests descend.

### Lawful Re-Entry

`product_reprice`.

This changes the product substrate. Requirements are no longer only upstream
constitutional text or downstream-local obligation ids. They become admitted
ABG/GTL carriers that project edge-local work, materialization targets,
evidence bindings, folds, residuals, attenuation, and assurance read models.

### Governance Expansion

- `S`: specification must distinguish product meaning, staged constraints,
  algebraic requirements, graph-function HOW, evidence, fold, and residual.
- `T`: this single ticket is the durable implementation record for the first
  slice.
- `D`: design must declare carrier roles, IACS, effect edges, projection edges,
  and replay precedence before code.
- `O`: the result must remain graph-native and ABG-owned. It must not become
  a document parser, product-local ledger framework, or downstream lifecycle
  policy.

## Product Shape

The intended algebra is:

```text
requirements ledger
  -> obligation projection
  -> materialization target projection
  -> evidence binding projection
  -> closure fold projection
  -> residual/re-entry projection
```

`RequirementLedger` is a replay-derived projection over admitted requirement
events. It is not a second writable event store, a side ledger, or a rival ABG
runtime truth root. Folds, residuals, attenuation, and re-entry pressure are
requirement-scoped projections over ABG event, assurance fold, continuation, and
evaluate-next truth.

Requirements are the carrier preserving finite computation from `A -> Z`:

```text
Req.what_i =
  <meaning_i, span_i, asset_projection_i, assurance_projection_i,
   evidence_policy_i>

H(Req.what_i) ->
  <P.asset_i, P.assurance_i, Fold_i, Residual_i>
```

The first slice must implement enough algebra to prove this preservation rule
for edge spans, test relations, evidence binding, fold, and residual. It does
not need full import/export, UI, odd_glc, or recursive executive observation.

## Full Strategy Coverage Contract

T-162 covers every major section of the strategy post. Coverage may be direct
implementation, deterministic gate, read-model projection, compatibility
bridge, or explicit downstream boundary.

| Strategy area | T-162 treatment |
| --- | --- |
| Claim and existing ABG direction | Implement requirements ledger as the event-sourced read model that projects obligation, materialization, evidence, fold, residual, and re-entry pressure. |
| Layering | Keep ODD methodology, KAOS rigor, GTL wrapper language, and ABG algebra distinct. ABG/GTL owns the substrate; downstream frameworks consume it. |
| Product composition | Model `P = W.H`, `P = W(W.H)`, and `A(P.asset, P.assurance)` decomposition through `Req.what`, spans, asset projection, assurance projection, fold, and residual. |
| Requirements as carrier/lax mapping | Preserve WHAT morphisms into HOW and assurance or emit residual/re-entry pressure when preservation fails. |
| Context and constraint staging | Admit homeostatic-gap, problem, solution-space, intent, product, requirements, destination-topology, instruction-set, runtime, and assurance fragments with stage-specific routing. |
| Destination topology | Add first-class HOW constraint framework declarations rather than treating build tenants or technology stacks as ad hoc local convention. |
| Graph functions replace SDLC flow | Treat graph-function traversal, edge environments, folds, residuals, and read models as the lifecycle carrier; phase documents are projections. |
| KAOS additive rigor | Keep the semantic kernel available as typed relations or subordinate/deferred payloads; promote goal/refinement/assumption/obstacle/conflict/agent/operation/domain-object carriers only when IACS proves they are first-slice prime. |
| External lessons | Incorporate stable ids and relations from requirements tools, assurance-case projection from GSN/SACM/CAE, step-wise supervision, compressed constitutional fragments, attempt history, and attenuation metrics. |
| Reviewed KAOS implementations | Steal the semantic kernel, not the GUI/editor workflow; DOT/diagram output is read-model only. |
| Two authority categories | Keep `AuthorityContextFragment` separate from closeable `RequirementTerm`. |
| Algebraic requirements | Implement the first-slice algebraic terms, relations, spans, projections, evidence bindings, fold projections, residual projections, and attenuation needed by the worked trace. |
| Edge requirement environment | Build edge-local environments from staged context, active spans, prior folds, carried residuals, and projected obligations. |
| Requirement ledger domain model | Project durable identity, imports, context fragments, requirements, relations, projections, evidence bindings, folds, and residuals from admitted requirement events. |
| Requirement relationship to test | Preserve asset projection, test-source projection, test-execution projection, and test-interpretation projection as separate fold surfaces. |
| Core functions | Implement the deterministic API set required by the first-slice worked trace over admitted carriers. |
| Cohesive capability modules | Cover identity, context, model, span, projection, fold, assurance, metrics, and interop boundaries. |
| Native graph functions | Expose the requirements capability as replayable ABG graph functions over the algebraic kernel. |
| Capability workflows | Cover first-slice intake/identity, runtime projection, evidence fold, assurance, and query; classify goal construction, analysis, responsibility, and operationalization as first-slice gates or deferred successor work. |
| Completeness gates | Add first-slice deterministic gates for span, evidence-policy, context-routing, destination-topology, test-relation, and attenuation coverage; classify broader refinement/assignment/assumption/obstacle/conflict/operationalization/operation-agent gates before implementation. |
| Workflow 1-7 | Implement the worked-trace workflow: author pressure, build edge environment, project obligations, bind evidence, project fold/residual/attenuation, and query; keep retry/re-entry authority projected from existing ABG truth. |
| T-204 interpretation | Convert the six observed failure patterns into generic requirement-projection/fold regression fixtures, not downstream-specific closure work. |
| F_D/F_P boundary | Keep deterministic checks on envelopes, ids, spans, policies, evidence, and replay; leave semantic source/design/test satisfaction to F_P and product-owner decisions to F_H. |
| Product boundary | ABG/GTL owns carriers, spans, environments, folds, replay, residual law, query, and GTL typecheck support; products own domain terms and domain evidence interpretation. |
| odd_glc split | T-162 delivers the ABG/GTL substrate that odd_glc may later consume; T-162 does not implement odd_glc policy. |
| Gaps in current thinking | Turn all fourteen gaps into design decisions, explicit deferred non-goals, or deterministic first-slice gates. |
| Minimal implementation slice | Implement first slice and define compatibility hooks for second/third/fourth slices without opening new sibling tickets. |
| Target state | ABG can answer the strategy's edge questions from admitted carriers and replay truth. |

## First-Slice Boundary

T-162 is additive. It creates the ABG/GTL requirements-algebra substrate and
retained-compatibility wrappers. It does not close downstream migration from
local product ledgers to the new substrate.

Slice-1 blocking decisions:

- requirement ledger as event-sourced projection, not writable truth root;
- `RequirementFold` and `RequirementResidual` as projections over existing ABG
  assurance, continuation, and evaluate-next truth;
- stable `TraversalSpan` identity across graph function, graph vector,
  recursive frame, zoom, and foldback boundaries;
- closed-world total F_D outcomes over admitted algebraic states;
- compatibility wrapping of existing obligation and residual refs without
  preserving them as closure authorities;
- one worked trace from GTL requirement declaration through edge environment,
  obligation projection, evidence binding, fold projection, residual/attenuation,
  and query.

Deferred beyond slice 1 unless the IACS gate promotes them:

- full KAOS goal-model authoring UI or graph editor behavior;
- ReqIF, GRL, GSN, SACM, CAE import/export;
- product-specific materialization policy migration;
- odd_glc lifecycle framework semantics;
- downstream odd_sdlc ledger deletion or migration;
- rich obstacle/conflict/agent/operation taxonomy beyond the first-slice
  structural relation payloads required by tests.

## Embedded Detailed Design Requirement

T-162 must embed a detailed design before implementation. The embedded design is
not only a list of files to create; it is a closure gate. The design must be
reviewable under `DESIGN_MODULE_METHOD.md` and must preserve ODD/GTL/ABG
boundaries.

This embedded section is a checklist for the required M03 design artifacts. It
does not replace those artifacts as the normative design surface.

### GTL Extension Design

The design must explicitly define the GTL language extensions required to expose
the requirements algebra to human-agent authoring without creating a second
requirements language beside GTL.

Required GTL extension surfaces:

- requirement declaration surfaces inside a GTL `Module`.
- `RequirementTerm` declaration surface for goals, atoms, assumptions,
  soft-goals, obstacles, conflicts, agents, operations, domain objects, and
  requirement test relations.
- `RequirementRelation` declaration surface for refinement, dependency,
  conflict, obstruction, mitigation, assignment, operationalization, test,
  assurance, evidence, contribution, weakening, restoration, and supersession.
- `TraversalSpan` declaration surface over existing `GraphFunction` and
  internal `GraphVector` identity; spans must not become a new topology anchor
  or public execution target.
- `AuthorityContextFragment` references through `Context` or a justified GTL
  wrapper that preserves origin stage, constraint scope, digest, promotion
  policy, and routing outcome.
- `DestinationTopology` declaration as a HOW constraint framework, not as a
  WHAT requirement and not as a build-tenant-only special case.
- `RequirementOperation` binding from requirement terms to existing
  `GraphFunction`, `Role`, `Job`, and evidence-kind refs.
- `RequirementTestRelation` binding from `Req.what` to asset projection,
  test-source projection, execution projection, interpretation projection,
  oracle, and evidence policy.
- Typecheck and conformance support in the GTL program conformance gate for
  malformed requirement graphs, dangling refs, invalid spans, duplicate stable
  ids, unresolved graph-function/vector refs, forbidden topology promotion, and
  product-local command-router drift.

GTL feature checklist:

- [ ] Module publication preserves requirement graph declarations.
- [ ] Requirement declarations carry stable ids, aliases, source refs, and
      digests.
- [ ] Requirement spans bind to existing graph-function/vector identity.
- [ ] Context fragments remain context unless promotion policy admits a
      requirement term.
- [ ] Destination topology is authored as a HOW constraint framework.
- [ ] Requirement operations bind to GTL graph functions without creating
      service-method workflow authority.
- [ ] Test relations preserve source, execution, and interpretation as distinct
      assurance projections.
- [ ] GTL conformance rejects duplicate ids, dangling refs, invalid spans,
      unknown relation kinds, open payloads, and authority-smuggling fields.
- [ ] DOT, diagrams, editor exports, and natural-language extraction are read
      models or candidates, not GTL authority.
- [ ] The extensions do not add a new public topology object, public start
      family, or graph-vector rival.

### ABG Extension Design

The design must explicitly define the ABG runtime/projection extensions that
admit, project, fold, query, and replay requirement pressure.

ABG capability modules:

- `abg.requirements.identity`: stable ids, aliases, import refs, source
  digests, versioning, supersession, relation ids.
- `abg.requirements.events`: emitted requirement-event payloads that are the
  only write path for requirement-algebra truth.
- `abg.requirements.context`: staged authority fragments, compression refs,
  promotion policy, routing outcome, context coverage.
- `abg.requirements.model`: goals, requirements, assumptions, soft goals,
  obstacles, conflicts, agents, operations, domain objects, and relations.
- `abg.requirements.span`: traversal spans, frame/zoom mapping, coverage
  predicates, recursive span stability.
- `abg.requirements.projection`: edge environments, active requirements,
  obligation projection, materialization target projection, execution schedule
  projection, evidence expectations.
- `abg.requirements.fold`: evidence binding, F_D envelope findings, F_P
  semantic findings, F_H decisions, folds, residuals, attenuation, replay
  precedence, and status mapping to existing ABG assurance/continuation truth.
- `abg.requirements.assurance`: claim/strategy/evidence/context projection over
  folds and residuals.
- `abg.requirements.metrics`: model completeness, complexity, coverage,
  conflict, obstacle, operationalization, and attenuation gates.
- `abg.requirements.interop`: future ReqIF/GRL/GSN/SACM import/export adapters
  as non-authoritative adapters.

ABG feature checklist:

- [ ] Admit requirement-event payloads and requirement projection inputs, then
      fail closed on open objects, unknown fields, duplicate ids, dangling
      relation refs, invalid spans, invalid stage routing, and
      authority-smuggling fields.
- [ ] Derive `RequirementLedger` from emitted requirement events; no independent
      writable requirement ledger is admitted.
- [ ] Build `EdgeRequirementEnvironment` from staged context, active spans,
      prior folds, carried residuals, and edge obligations.
- [ ] Project materialization targets from active obligations, not separate
      local target tables.
- [ ] Project execution schedules from execution obligations and admitted
      schedule rows.
- [ ] Bind evidence as admitted, rejected, or non-closing without turning
      evidence binding into closure.
- [ ] Fold requirement state into satisfied, partial, blocked, deferred,
      repriced, or no-close-preserved states.
- [ ] Map every requirement fold/residual state to existing ABG assurance,
      continuation, and evaluate-next truth before introducing a public carrier.
- [ ] Preserve residual pressure with remaining span and pressure class.
- [ ] Classify attenuation as unchanged, narrowed, transformed,
      moved-to-prerequisite, escalated, or cleared.
- [ ] Project assurance claims from folds and residuals without duplicating the
      residual ledger.
- [ ] Expose query/read models for active requirements, obligations,
      materialization targets, execution schedules, evidence bindings, folds,
      residuals, attenuation, assurance claims, obstacles, conflicts,
      operations, agents, and spans.
- [ ] Bridge current carried obligation refs and residual pressure refs into
      requirement projections without changing downstream behavior in the first
      implementation wave.

### F_D Totality Design

F_D is lawful only as a total deterministic function over admitted
requirements-algebra state. It may manage every state in the algebra, but it
must not assess ambiguous content that has no admitted grammar.

F_D totality is closed-world. Raw, unknown, or unclassified state is not an
admitted F_D state. Ingress must collapse raw input into a known algebraic
variant, reject it, or route it to typed F_P/F_H pressure before deterministic
evaluation.

Required F_D totality outcomes:

- `admitted_valid`: structural state is complete enough for projection or fold.
- `unknown_state_rejected`: raw, unknown, or unclassified state failed closed
  before F_D evaluation.
- `rejected_malformed`: carrier shape, unknown field, duplicate id, dangling
  ref, invalid span, invalid stage routing, or authority-smuggling field fails
  admission.
- `incomplete_structural_pressure`: required algebraic coverage is missing and
  must remain open.
- `stale_or_superseded`: replay evidence is invalidated or outranked by current
  admitted evidence.
- `contradictory_authority`: admitted algebra carries incompatible relations,
  policies, stage routes, or evidence bindings.
- `semantic_assessment_required`: content has no admitted grammar and must be
  assessed by F_P before semantic closure.
- `semantic_residual_preserved`: admitted F_P finding rejects or cannot confirm
  the semantic relationship, so residual pressure remains.
- `human_decision_required`: an owner decision, reprice, or explicit residual
  risk admission is required from F_H.
- `non_closing_preserved`: evidence exists but is byproduct, wrong role, wrong
  span, wrong policy, or otherwise non-closing.

No F_D branch may return implicit success for an unrecognized state. Unknown
content is managed by routing to `semantic_assessment_required`, not by
deterministic semantic inference.

### Fold And Residual Projection Mapping

`RequirementFold` and `RequirementResidual` are requirement-scoped projection
carriers. They do not own closure, retry, continuation, re-entry, or
evaluate-next authority.

The design must include a status mapping table before any fold/residual carrier
is implemented. The minimum admissible mapping is:

| Requirement projection state | Source ABG truth | Closure authority |
| --- | --- | --- |
| `satisfied` | Existing ABG assurance fold admits the scoped requirement projection as fulfilled under current authority. | May contribute to ABG close only through the existing assurance fold. |
| `partial` | Existing ABG assurance/continuation truth shows at least one scoped projection satisfied and at least one scoped projection still open. | Non-closing; must carry residual or continuation refs. |
| `blocked` | Existing ABG closure/evaluate-next truth selects block or blocked prerequisite pressure. | Non-closing; ABG block/evaluate-next remains authoritative. |
| `deferred` | Existing ABG qualified-defer, yield, or continuation truth preserves pressure outside the current bounded step. | Non-closing; ABG continuation remains authoritative. |
| `repriced` | Existing ABG or F_H-admitted reprice truth names the owning re-entry surface. | Non-closing; product/intent/requirement reprice remains authoritative. |
| `no_close_preserved` | Existing ABG assurance fold rejects closure while preserving admitted evidence or context. | Non-closing; residual pressure remains queryable. |

The table may be refined in design, but it may not introduce a second closure
decision family or a second retry/re-entry controller.

### Module Decomposition

The design module must decompose the work into module boundaries that are
realization cuts inside GTL/ABG graph law, not replacement graph functions or
deterministic controllers.

Required module boundaries:

- `abg.requirements.events`: requirement-event payload declarations that feed
  ABG event emission and replay.
- `gtl.requirements.declarations`: GTL declaration carriers and module
  publication integration.
- `gtl.requirements.conformance`: GTL program typecheck/conformance rules for
  requirement graphs, spans, relations, operations, and destination topology.
- `abg.requirements.carriers`: ABG carrier definitions and constructor helpers.
- `abg.requirements.admission`: ingress collapse from raw/dynamic input into
  admitted carriers.
- `abg.requirements.environment`: edge environment construction and active span
  selection.
- `abg.requirements.projection`: obligation, materialization, execution, and
  evidence expectation projections.
- `abg.requirements.evidence`: evidence binding and rejection/non-closing
  classification.
- `abg.requirements.fold`: fold, residual, attenuation, replay precedence, and
  re-entry projection.
- `abg.requirements.assurance`: assurance-case read model.
- `abg.requirements.metrics`: completeness gates and model measurements.
- `abg.requirements.query`: read-model APIs.
- `abg.requirements.compat`: bridge from existing obligation/residual refs to
  requirement projection refs.

Each module must state:

- governing requirement/design refs;
- owned prime carrier families;
- consumed upstream carriers;
- emitted downstream projections;
- effect boundaries, if any;
- admission functions;
- semantic transforms;
- unit and semantic tests.

### Prime-Only Design Gate

Before implementation starts, `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md`
must declare the Irreducible Architectural Carrier Set and subordinate payload
register for both GTL and ABG.

Candidate GTL IACS to validate or consolidate:

- `RequirementTermDeclaration`
- `RequirementRelationDeclaration`
- `TraversalSpanDeclaration`
- `AuthorityContextFragmentDeclaration`
- `DestinationTopologyDeclaration`
- `RequirementTestRelationDeclaration`

Candidate ABG IACS to validate or consolidate:

- `RequirementEventPayload`
- `RequirementTerm`
- `RequirementRelation`
- `TraversalSpan`
- `EdgeRequirementEnvironment`
- `RequirementProjection`
- `RequirementEvidenceBinding`
- `RequirementFoldProjection`
- `RequirementResidualProjection`
- `RequirementAssuranceClaim`

`RequirementLedger`, `RequirementGraph`, `RequirementGraphState`,
`RequirementGoal`, `RequirementAssumption`, `RequirementSoftGoal`,
`RequirementAgent`, `RequirementOperation`, `RequirementDomainObject`,
`DestinationTopology`, and `RequirementCompletenessReport` must begin as
projection, subordinate payload, or deferred families unless the IACS document
promotes them with explicit Promotion Test justification.

The design-method review must classify every other proposed shape as one of:

- subordinate and nested/private;
- promoted with explicit Promotion Test justification;
- effect-edge-only payload;
- downstream-only projection;
- deferred outside the active slice.

No carrier may become public or top-level because it is convenient for typing,
serialization, branch-local payload detail, or code layout. The design must
prefer fewer sharper carrier families and must reconcile the implementation to
the IACS before closure.

### Design Module Method Review Gate

Add `M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md` before implementation
closure. It must explicitly evaluate:

- Authority Seam Closure: one authoritative carrier or contract at each
  semantic boundary; no controller-side reconstruction; no raw payload trusted
  after ingress.
- Essential Carrier Consolidation: the IACS is the smallest lawful top-level
  carrier set; subordinate payloads stay subordinate unless promoted by test.
- Enforcement After Proof: parsing/admission constructs local carrier truth
  first; TypeScript types enforce the proved shape afterward.
- Ingress Collapse: raw JSON or dynamic input is admitted once, then semantic
  kernels consume admitted carriers only.
- Prime Law: every new top-level module, function, class, carrier, and schema
  record introduces an irreducible semantic, admission, projection, or effect
  boundary.
- Structural Carrier Diagram: the diagram shows prime carriers, subordinate
  payloads, effect-edge payloads, downstream projections, deferred families,
  authority/downstream roles, public/private visibility, containment, and
  variant families.
- ODD Alignment: module boundaries remain realization cuts beneath graph
  functions; they do not own traversal selection, target movement, closure,
  continuation, or semantic product meaning.
- ODD Execution-Authority Audit: traversal selection, event emission, replay,
  projection, assurance fold, retry, continuation, and re-entry remain ABG-owned
  or are explicitly justified as ABG core changes under `ODD_METHOD.md` 11.5B.

## Required Work

1. Product and requirements reprice
   - Review `specification/INTENT.md` and record whether the work remains a
     product reprice or must be repriced to intent reprice before implementation.
   - Reprice `specification/GOALS.md` with a current requirements-algebra wave
     or record why the active goal surface already authorizes the wave.
   - Ratify in `PRODUCT.md` that ABG/GTL core owns requirement algebra as the
     event-sourced substrate for obligation, evidence, fold, residual, and
     assurance projections.
   - Ratify the `P = W.H`, `P = W(W.H)`, and `A(P.asset, P.assurance)` framing
     only to the degree needed to define requirements as the carrier between
     WHAT, HOW, and assurance.
   - Add or update ABG/GTL requirement law for requirement identity, traversal
     spans, staged authority fragments, typed relations, edge environments,
     evidence bindings, folds, residuals, attenuation, and query/read models.
   - Add law for homeostatic-gap, problem, solution-space, intent, product,
     requirements, destination-topology, instruction-set, runtime, and
     assurance constraint stages.
   - Add law for destination topology as an introduced HOW constraint
     framework: tenant family, technology stack, runtime model, packaging,
     deployment, proof topology, regulatory frame, or other conformance
     surface.
   - State that F_D may validate carriers and replay consistency but must not
     infer product semantic satisfaction from unknown syntax.
   - State that F_D is total over admitted requirements-algebra states and must
     route ungrammatized or ambiguous content to typed F_P-required pressure
     rather than treating it as success, failure, or deterministic semantics.
   - State that unknown or unclassified state is not admissible F_D input; it
     must be rejected, structurally classified, or routed to typed F_P/F_H
     pressure before deterministic evaluation.
   - State that F_P and F_H are the lawful semantic and owner-decision pressure
     surfaces.

2. Design module
   - Add `M03_REQUIREMENTS_ALGEBRA_DERIVATION.md`.
   - Add `M03_REQUIREMENTS_ALGEBRA_FIRST_SLICE_IACS.md`.
   - Add `M03_REQUIREMENTS_ALGEBRA_STRUCTURAL_CARRIER_DIAGRAM.md`.
   - Add `M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md`.
   - Embed explicit GTL extension design, GTL feature checklist, ABG extension
     design, ABG module decomposition, ABG feature checklist, IACS,
     subordinate payload register, promotion-test outcomes, and prime-only
     design review.
   - Define how existing edge assurance, evaluation-set, stage-set,
     continuation, payload, and traversal-unit law consume or project the new
     requirement carriers without replacing them abruptly.
   - Define `RequirementLedger` as a replay-derived projection over emitted
     requirement events, not as a writable truth root.
   - Include a worked trace from GTL requirement declaration through edge
     environment, obligation projection, evidence binding, fold projection,
     residual/attenuation, and query.
   - Include the fold/residual status mapping table to existing ABG assurance,
     continuation, and evaluate-next truth before any fold carrier is
     implemented.
   - Resolve recursive and zoomed `TraversalSpan` identity across graph
     functions, internal graph vectors, child frames, foldback, and aliases.
   - Partition the fourteen strategy gaps into slice-1-blocking,
     first-slice-gate, retained-compatibility, and deferred-successor work.
   - Address the fourteen strategy gaps: span identity, fragment compression
     policy, requirement identity/versioning, refinement semantics, projection
     ownership, replay precedence, residual attenuation, edge-assurance
     bridge, query surface, migration discipline, round-trip identity,
     assurance-case projection, obstacle/conflict analysis, and
     operationalization boundary.

3. Core carriers and admission
   - Add requirement-event payloads that can be emitted through ABG event truth
     and replayed into requirement projections.
   - Add `AuthorityContextFragment` staging fields: origin stage, constraint
     scope, promotion policy, applies-to refs, and routing outcome.
   - Add `TraversalSpan` and `covers(span, edge)`.
   - Add first-slice `RequirementTerm` variants only for the IACS-approved
     carrier set: atom/composition, relation refs, projection refs, test
     relation refs, evidence binding refs, fold projection refs, and residual
     projection refs.
   - Add `RequirementRelation`, `RequirementAttribute`, and
     `RequirementImportRef` for stable identity, source metadata, aliases, and
     typed relations.
   - Keep `RequirementGoal`, `RequirementAssumption`, `RequirementSoftGoal`,
     `RequirementAgent`, `RequirementOperation`, `RequirementDomainObject`,
     `RequirementGraph`, `RequirementGraphState`, `DestinationTopology`, and
     `RequirementCompletenessReport` subordinate or deferred unless the IACS
     gate promotes them with explicit Promotion Test justification.
   - Add admission for all first-slice carriers. Unknown fields must fail
     closed.
   - Add total F_D outcome carriers for admitted-valid, rejected-malformed,
     unknown-state-rejected, incomplete, stale/superseded,
     contradictory-authority, semantic-assessment-required,
     semantic-residual-preserved, human-decision-required, and
     non-closing-preserved states.

4. Edge environment and projection functions
   - Add `RequirementLedger` as a replay-derived projection/read model over
     admitted requirement events.
   - Add `EdgeRequirementEnvironment`.
   - Add `activeRequirements(ledger, edge)`.
   - Add `buildEdgeRequirementEnvironment(ledger, edge, priorEvents)`.
   - Add `projectRequirements(environment, edge)`.
   - Add `projectMaterializationTargets(environment, obligations)`.
   - Add `routeContextConstraint(fragment, state)`.
   - Add destination-topology projection before materialization or execution
     target projection.
   - Add execution schedule projection from active execution obligations and
     admitted schedule rows.

5. Evidence, fold, residual, and assurance
   - Add `RequirementEvidenceBinding`.
   - Add `RequirementTestRelation` with distinct asset, test-source,
     test-execution, and test-interpretation projections.
   - Add `foldRequirementEvidence(environment, bindings)`.
   - Add `residualizeRequirementFolds(environment, folds)`.
   - Add `classifyRequirementAttenuation(priorResiduals, folds, residuals)`.
   - Add `RequirementAssuranceClaim` and `projectAssuranceCase(...)`.
   - Add qualitative/quantitative soft-goal contribution fold states.
   - Add obstacle, conflict, mitigation, monitoring, accepted residual risk,
     reprice, and owning-stage re-entry residual classes.

6. Query/read models and compatibility bridge
   - Add a read model that exposes active requirements, edge obligations,
     materialization targets, evidence bindings, folds, residuals, attenuation,
     and assurance claims.
   - Wrap current carried obligation refs and residual pressure refs as
     `RequirementProjection` records without changing existing downstream
     behavior in the first slice.
   - Make the query surface explicit enough that products do not need to parse
     archives to recover requirement pressure.
   - Preserve stable ids, relation ids, aliases, source digests, and source
     version metadata so future ReqIF-style round trips are possible without
     making ReqIF native authority.

7. Completeness gates and metrics
   - Classify deterministic gates as first-slice implementation, first-slice
     design-only, or deferred-successor work before writing gate code.
   - Add first-slice deterministic gates for `span_coverage`,
     `evidence_policy_coverage`, `context_routing_coverage`,
     `destination_topology_coverage`, `test_relation_coverage`, and
     `fold_attenuation_coverage`.
   - Keep `goal_refinement_coverage`, `leaf_assignment_coverage`,
     `assumption_monitoring_coverage`, `obstacle_resolution_coverage`,
     `conflict_resolution_coverage`, `operationalization_coverage`, and
     `operation_agent_coverage` design-only or deferred unless the IACS and
     first-slice tests promote them.
   - Ensure obstacle and conflict gates are F_D-only over already-admitted
     obstacles/conflicts; F_P owns plausibility/admission of ambiguous obstacles
     and conflicts.

8. Native ABG requirements graph functions
   - Add or expose the first-slice graph-function surfaces required for the
     worked trace: context ingestion/routing, requirement declaration admission,
     edge-environment compilation, edge-obligation projection, evidence binding,
     requirement fold projection, residual/attenuation projection, assurance
     read-model projection, and query.
   - Catalog broader goal refinement, obstacle analysis, conflict analysis,
     responsibility assignment, operationalization, and model measurement as
     deferred graph functions unless the IACS and first-slice tests promote
     them.
   - Each first-slice function must be independently replayable and operate over
     admitted carriers.

9. Strategy-derived materialization and postflight regression fixtures
   - Prove stronger active role policy wins when two authorities address the
     same requirement projection and target path.
   - Prove current admitted evidence for projection `P` supersedes empty replay
     for `P`.
   - Prove byproducts not admitted for projection `P` bind as non-closing.
   - Prove declared test root plus active test-source projection classifies the
     materialization as test evidence without generic path-only closure.
   - Prove active execution projection plus admitted schedule row outranks
     fallback execution command.
   - Prove materialized tests can partially fold test-source satisfied while
     execution and product release remain open.

10. Downstream and later-slice boundaries
   - Define how edge assurance findings reference requirement projection ids.
   - Define how ABG assurance fold emits requirement fold refs and residual refs.
   - Define how existing residual-pressure refs become projections from
     requirement residuals.
   - Define the migration path for product-local materialization/postflight
     joins onto requirement projections without making a downstream product a
     T-162 proof dependency.
   - State that deleting or demoting downstream product-local peer ledgers is
     successor migration work, not T-162 closure, unless the operator explicitly
     reprices the ticket.
   - Define the gate by which odd_glc may later consume the admitted GTL/ABG
     requirements algebra, without implementing odd_glc in this ticket.

11. Tests
   - Add `test:t162`.
   - Prove broad `A -> X` spans cover an interior edge.
   - Prove narrow `F -> J` spans do not cover earlier unrelated edges.
   - Prove current admitted evidence supersedes empty predecessor replay for
     the same projection.
   - Prove partial fold can satisfy test-source projection while execution
     projection remains residual.
   - Prove admitted execution evidence can still leave semantic
     test-interpretation residual when F_P rejects the relationship to
     `Req.what`.
   - Prove `A(P.asset, P.assurance)` decomposes into `Req.what` terms and folds
     back without scalar edge success erasing open assurance residuals.
   - Prove a HOW instruction-set constraint can reframe instruction policy
     without silently changing WHAT.
   - Prove a destination-topology constraint selects or reframes the introduced
     HOW constraint framework before materialization targets are projected.
   - Prove a product-stage constraint that changes meaning routes to product
     reprice rather than local materialization compensation.
   - Prove a runtime constraint routes to residual, obstacle, or owning-stage
     re-entry with the origin stage preserved.
   - Prove compressed context fragments constrain the edge but are not all
     active obligations.
   - Prove obstacle pressure blocks or redirects without pretending the
     requirement itself is semantically satisfied.
   - Prove stable ids and relation ids survive a read/write round trip.
   - Prove retry attenuation is classified as unchanged, narrowed,
     transformed, moved, escalated, or cleared.
   - Prove F_D rejects malformed carriers, duplicate ids, dangling relations,
     span drift, unknown fields, and authority-smuggling fields.
   - Prove F_D is total over malformed, incomplete, stale, contradictory,
     ambiguous, semantically unassessed, F_P-rejected, F_P-inconclusive, and
     F_H-required states without implicit success or semantic guessing.
   - Prove unknown or unclassified state cannot be admitted into F_D and instead
     fails closed or routes to typed F_P/F_H pressure before deterministic
     evaluation.
   - Prove read models expose folds, residuals, attenuation, and assurance
     claims without losing stable ids.
   - Prove every new `REQ-R-ABG3-REQUIREMENTS-ALGEBRA` clause has a testcase
     authority ref or an explicit deferred-successor rationale.

## Acceptance Criteria

- [x] Product law states that ABG/GTL core owns requirement algebra as the
      event-sourced substrate for obligation, evidence, fold, residual, and assurance
      projections.
- [x] INTENT and GOALS re-entry are resolved before implementation starts.
- [x] Requirements define stable requirement identity, source provenance,
      traversal spans, staged context fragments, KAOS-inspired typed relations,
      edge environments, evidence bindings, folds, residuals, attenuation, and
      query/read models.
- [x] Requirements state that `RequirementLedger` is a replay-derived projection
      over admitted requirement events and not an independent writable truth
      root.
- [x] Requirements define the context staging chain from homeostatic gap through
      runtime/evidence, and destination topology as a HOW constraint framework
      distinct from WHAT requirements.
- [x] Design modules derive the first slice from product and requirement law,
      including carrier roles, IACS, structural carrier diagram, replay
      precedence, effect boundaries, and compatibility with existing edge
      assurance law.
- [x] Design modules explicitly define GTL extensions, GTL feature checklist,
      ABG extensions, ABG module decomposition, ABG feature checklist,
      candidate IACS, subordinate payload register, and promotion-test outcomes
      before implementation.
- [x] `M03_REQUIREMENTS_ALGEBRA_DESIGN_MODULE_REVIEW.md` applies
      `DESIGN_MODULE_METHOD.md` and passes authority seam closure, essential
      carrier consolidation, enforcement after proof, ingress collapse, Prime
      Law, structural carrier diagram, ODD alignment review, and ODD
      execution-authority audit.
- [x] Design addresses all fourteen strategy gaps by classifying each as
      slice-1-blocking, first-slice-gate, retained-compatibility, or
      deferred-successor work.
- [x] Design includes a worked trace from GTL requirement declaration through
      edge environment, obligation projection, evidence binding, fold
      projection, residual/attenuation, and query.
- [x] Design includes an explicit status-mapping table from requirement
      fold/residual projection states to existing ABG assurance, continuation,
      and evaluate-next truth.
- [x] TypeScript carriers and admission cover the IACS-approved first-slice
      carrier set, including requirement-event payloads, `TraversalSpan`,
      `RequirementTerm`, `RequirementRelation`, `RequirementProjection`,
      `EdgeRequirementEnvironment`, `RequirementEvidenceBinding`,
      `RequirementTestRelation`, requirement fold projection, requirement
      residual projection, and `RequirementAssuranceClaim` when promoted by
      design.
- [x] Goal types, assumptions, soft-goal contributions, agents, operations,
      domain objects, requirement graphs, graph states, destination topology,
      import refs, attributes, and stable relation ids are either represented as
      IACS-approved carriers, subordinate payloads, projections, or deferred
      successor work before implementation closes.
- [x] `activeRequirements`, `buildEdgeRequirementEnvironment`,
      `projectRequirements`, `projectMaterializationTargets`,
      `routeContextConstraint`, `foldRequirementEvidence`,
      `residualizeRequirementFolds`, `classifyRequirementAttenuation`, and
      `projectAssuranceCase` are implemented as deterministic APIs over
      admitted carriers.
- [x] First-slice native requirements graph-function surfaces exist for the
      worked trace: context ingestion/routing, requirement admission,
      edge-environment compilation, edge-obligation projection, evidence
      binding, requirement fold projection, residual/attenuation projection,
      assurance read-model projection, and query.
- [x] First-slice completeness gates fail closed deterministically for missing
      span coverage, evidence policy, context routing, destination topology,
      test relation, and retry attenuation coverage; broader refinement,
      assignment, assumption monitoring, obstacle resolution, conflict
      resolution, operationalization, and operation-agent gates are implemented
      only if promoted by design or explicitly deferred with rationale.
- [x] Existing carried obligation refs and residual pressure refs can be
      wrapped as retained compatibility requirement projections without changing
      downstream behavior or retaining closure authority.
- [x] Test-source materialization, execution evidence, and semantic
      requirement assurance are distinct projections and cannot close each
      other by path shape or pass status alone.
- [x] Current admitted evidence supersedes empty or stale predecessor replay
      for the same projection.
- [x] F_D rejects malformed carriers and authority drift, while F_P/F_H remain
      the semantic and owner-decision pressure surfaces.
- [x] F_D is implemented as a total function over admitted
      requirements-algebra state, with typed outcomes for valid, malformed,
      unknown-state-rejected, incomplete, stale/superseded, contradictory,
      semantic-assessment-required, semantic-residual-preserved,
      human-decision-required, and non-closing states.
- [x] Unknown or unclassified state is not admissible F_D input and is rejected,
      structurally classified, or routed to typed F_P/F_H pressure before
      deterministic evaluation.
- [x] Query/read models expose active requirements, obligations,
      materialization targets, evidence bindings, folds, residuals,
      attenuation, and assurance claims.
- [x] Strategy-derived materialization/postflight fixture tests prove stronger
      active authority policy, current evidence over empty replay, byproduct
      non-closing evidence, declared test-root role projection, admitted
      schedule command precedence, and partial test-source fold.
- [x] Obstacle and conflict gates only check structural resolution of admitted
      obstacles/conflicts; F_P owns ambiguous plausibility and admission.
- [x] Target-state query can answer, for an edge, which context fragments
      constrain it, which requirement terms span it, which prior folds and
      residuals enter it, which obligations are active, which evidence was
      admitted, which folds closed or stayed partial/blocked/deferred/residual,
      and which residual pressure remains with its owning span.
- [x] `build:semantic`, `lint:semantic`, `test:t162`, relevant regression
      suites, full `test:semantic`, and diff checks pass.

## Non-Goals

- Do not implement `odd_glc`.
- Do not implement T-160 recursive executive observation.
- Do not build a GUI/editor workflow.
- Do not implement ReqIF, GRL, GSN, SACM, or KAOS import/export as native
  authority in the first slice.
- Do not make DOT, diagrams, or visual editors authoritative.
- Do not itemize every compressed authority fragment into atomic requirements.
- Do not make ABG parse unknown product syntax to infer requirement meaning.
- Do not replace existing edge assurance contracts abruptly; bridge them
  through requirement projection refs.
- Do not allow scalar edge close, materialized files, test success, or report
  shape to erase a vector of active requirement pressure.
- Do not implement before the design-module-method gate is written and passed.
- Do not split this first implementation wave into additional tickets without
  explicit operator reprice.

## Closure Note

Closed 2026-06-26.

T-162 implemented the first ABG/GTL requirements-algebra slice:

- GOAL-009 and product law ratify requirements algebra as an event-sourced
  ABG/GTL substrate.
- `REQ-R-ABG3-REQUIREMENTS-ALGEBRA` and
  `REQ-L-GTL3-REQUIREMENTS-ALGEBRA` define ABG admission/projection law and
  GTL wrapper law.
- M03 design assets define derivation, IACS, structural carrier diagram, and
  design-module-method/ODD execution-authority review.
- TypeScript realization adds GTL wrapper declarations and ABG requirement
  event payloads, replay-derived ledger projection, edge environments,
  materialization/execution/evidence projections, fold/residual projection,
  completeness gates, query read models, and retained-compatibility wrappers.
- Proofs passed: `build:semantic`, `lint:semantic`, `test:t162`, `test:t145`,
  `test:t146`, `test:t149`, `test:t151`, `test:t159`, and full
  `test:semantic`.
