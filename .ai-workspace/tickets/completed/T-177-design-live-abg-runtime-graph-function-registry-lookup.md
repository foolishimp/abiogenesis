---
id: T-177
title: Design live ABG runtime graph-function registry lookup
type: design
ticket_category: runtime_registry_lookup
status: completed
goal: >-
  Design the live ABG runtime registry/lookup capability that can discover,
  filter, rank, and select lawfully registered graph functions, overlays,
  public starts, candidate families, and library entries for a runtime edge or
  situation.
change_intent: >-
  The intended ABG-owned "catalog" capability is not the current static
  `catalogGraphFunctionRefs` publication inventory. It is a live registry and
  lookup mechanism available through the ABG system interface, backed by GTL
  declarations, ABG admission, replay-derived registry projection, eligibility
  filtering, and emitted selection truth when traversal is affected.
change_class: design_reframe
re_entry_point: design
owner: abiogenesis
priority: high
triaged_at: 2026-06-30
created_at: 2026-06-30
updated_at: 2026-06-30
closed_at: 2026-06-30
governance_scope: STDO Method, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Registry, Graph Functions, Downstream ODD Consumers
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-176-define-gtl-language-capability-model-ts-how-and-gaps.md
downstream_consumers:
  - /Users/jim/src/apps/odd_glc
source_documents:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - .ai-workspace/tickets/completed/T-176-define-gtl-language-capability-model-ts-how-and-gaps.md
  - .ai-workspace/comments/claude/20260630T093000Z_DESIGN_gtl_complete_language_catalog_verified.md
affected_boundary:
  design:
    - build_tenants/abiogenesis/typescript/design/
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_STRUCTURAL_CARRIER_DIAGRAM.md
    - build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_API_EVENT_PROJECTION_PROOF_PLAN.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/gtl/
    - build_tenants/abiogenesis/typescript/code/src/abg/
target_truth: >-
  ABG exposes a live registry lookup capability that any downstream program can
  call through the ABG system interface to discover lawful graph-function and
  overlay candidates for an edge or situation. The registry is populated by
  admitted GTL declarations from GTL/ABG system libraries and downstream
  product libraries. Lookup is queryable; traversal-affecting selection is
  ABG-owned emitted truth. Product plugins may provide typed advice, ranking,
  or constraints over an ABG-provided candidate view, but ABG admits that
  advice, validates it against registry eligibility, emits selection truth, and
  invokes the selected graph function.
superseded_truth: >-
  Runtime graph-function discovery can be handled by static conformance
  inventory, product-local lists, hand-authored prompt context, or downstream
  catalog files.
closure_law: >-
  Close only after T-176 is closed and a TypeScript HOW design pack defines
  registry admission, projection, public query, internal selection emission,
  eligibility filters, product-plugin-assisted selection, library
  registration, the public GTL declaration surface required to populate the
  registry, ABG-driven startup admission from system/product libraries and
  product-authored startup config, module lifecycle checklists that expose
  ultimate-use ambiguity gaps, and negative proofs under DESIGN_MODULE_METHOD.
non_closure_conditions:
  - T-176 is not closed or the live GTL language capability model remains
    ambiguous.
  - The design treats `catalogGraphFunctionRefs` as the runtime registry.
  - Registry state is product-local, manually scanned, prompt-only, or not
    replay-derived.
  - Lookup bypasses GTL declaration or ABG admission.
  - Product libraries can shadow system-library functions without explicit
    refinement/override law and eligibility proof.
  - Candidate lookup omits entry kind, interface, source/target, context,
    authority, overlay, namespace, version, provenance, proof-readiness, or
    ownership filtering.
  - F_P or F_H ranking can select traversal behavior without ABG F_D guard and
    emitted selection truth.
  - A product plugin, including a consequence plugin, can call the next graph
    function, mutate registry state, bypass registry eligibility, or cause
    traversal without admitted plugin output and ABG-emitted selection truth.
  - Product-plugin advice is treated as registry truth instead of proposed
    payload/advice that ABG must admit and validate before selection.
  - The runtime registry owns odd_glc, odd_sdlc, software test, build, release,
    JavaScript, Rust, HTTP, service, or product-domain policy.
  - The GTL definition for registry-eligible library entries remains only an
    ABG-internal TypeScript carrier or helper instead of a public GTL
    declaration surface.
  - Static GTL publication surfaces such as `GraphFunction`, `Module`,
    overlays, public starts, plugin result interfaces, or
    `catalogGraphFunctionRefs` are treated as runtime registry entries without
    explicit GTL library declaration and ABG admission.
  - Downstream product graph functions, including odd_glc bootstrap or
    deployment functions, require a product-local registry, product-local
    lookup controller, or direct plugin invocation path instead of GTL product
    library declaration plus ABG registry admission.
  - Startup registry activation is driven by odd_glc, another downstream
    product, a product-local loader, or a product-local controller instead of
    ABG startup consuming product-authored config and GTL declarations as
    inert inputs.
  - A downstream app injects its own startup shell, file scanner, registry
    loader, event appender, selected-function dispatcher, or product-local
    projection so its graph functions, overlays, or GTL bindings are "picked
    up" outside the canonical ABG startup path.
  - Product-authored startup config is treated as registry truth, eligibility
    truth, selection truth, invocation authority, or policy law without ABG
    admission/projection.
  - Registry startup bypasses the existing ABG public-start / `runEngineStart`
    / `start -> iterate` ownership pattern instead of extending it under ABG
    control.
  - Public GTL registry/library declarations import ABG runtime modules or
    expose ABG admission, event emission, selection, or invocation authority.
  - Pure declaration/proposal constructors are moved wholesale by naming
    pattern instead of classified by authority, causing lookup requests,
    product plugin advice, and library declarations to land on the wrong side
    of the GTL/ABG boundary.
  - A GTL-facing declaration or product proposal type carries a dependency on
    `RuntimeEvent`, ABG admission validation, event emission, registry
    projection, selection, or invocation implementation types.
  - Any designed module, function surface, app surface, registry surface,
    plugin surface, or lookup surface lacks an explicit lifecycle checklist
    against the canonical `SPEC_METHOD.md` operational lifecycle chain.
  - The lifecycle checklist omits unanswered ambiguity gaps about how the
    surface will be released, deployed, used live, observed, governed, retired,
    or constrained by downstream product policy.
  - The registry design claims replaced, stale, revoked, retired, or
    superseded entries remain visible as historical truth without defining an
    event-sourced retirement, revocation, or supersession path.
  - A lifecycle checklist is present only as a heading or phase list and does
    not answer each phase or record a named `Gap:` / `Unanswered:` item per
    unresolved phase.
  - A graph function can be invoked on a traversal path without a prior
    ABG-emitted `graph_function_selected` event for that invocation basis.
  - Registry startup loads entries but the runner never consults the
    replay-derived registry projection to emit `graph_function_selected` before
    traversal effects.
  - Public-start / `runEngineStart` integration proves registry admission only,
    without proving selection truth is emitted before the first traversal
    invocation/effect.
  - Runtime registry projection cannot be torn down and rebuilt from the event
    log with identity-equivalent lookup results.
  - Product-plugin advice becomes de-facto selection authority because ABG
    cannot decline an admitted, eligible advice payload and select a different
    eligible candidate under deterministic guard.
  - Override/refinement law is only proven on the rejection branch; no proof
    shows a lawful `refinementOfEntryRef` or `overrideOfEntryRef` admits and
    becomes eligible.
  - The structural carrier diagram is ASCII flow only or otherwise fails
    DESIGN_MODULE_METHOD §5E by omitting Mermaid `classDiagram`, stereotypes,
    visibility, prime carriers, subordinate payloads, downstream projections,
    deferred families, and authoritative/downstream roles.
required_work:
  - Reconcile the existing GTL static publication surfaces already present in
    TypeScript (`GraphFunction`, `Module`, overlays, public starts, plugin
    result interfaces, candidate families, and `catalogGraphFunctionRefs`) with
    the live registry model, explicitly classifying each as declaration,
    publication inventory, registry input, registry projection, or selection
    truth.
  - Define the public GTL library/registry declaration surface for
    registry-eligible system-library and product-library entries. The surface
    must let downstream products declare specialized graph functions, overlays,
    public starts, candidate families, plugin result interfaces, and
    refinement/override claims without importing ABG runtime code.
  - Ensure `GtlLibraryEntryDeclaration`, or its successor spelling, is a GTL
    declaration or conformance-projected GTL declaration rather than only an
    ABG-internal runtime carrier. ABG may consume it for admission; GTL shall
    not own registry admission or selection.
  - Classify the current pure constructor helpers by authority before moving
    code. `constructGtlLibraryEntryDeclaration` belongs to the GTL declaration
    surface. `constructProductPluginSelectionAdvice` belongs to the product
    proposal/advice surface that ABG later admits. `constructRegistryLookupRequest`
    is a runtime query input and may remain ABG-owned or neutral, but it shall
    not be mislabeled as a GTL declaration.
  - Extract GTL-facing declaration/proposal types only when their fields and
    constructors are free of ABG runtime imports and do not depend on
    `RuntimeEvent`, admission validation, event emission, registry projection,
    selection, or invocation implementation types.
  - Design the startup admission flow that loads the GTL/ABG system library
    and downstream product libraries, typechecks/conforms the declarations,
    admits eligible entries through ABG, emits registry admission/rejection
    events, replay-projects the registry, and makes lookup/selection available
    to the runner.
  - Define the ABG-owned registry startup input boundary. Downstream products
    such as odd_glc may create product startup config and GTL product-library
    definitions, but ABG startup consumes them; downstream startup code shall
    not admit, project, select, invoke, or mutate registry truth.
  - Mirror and extend ABG's existing startup path. Registry startup shall be
    modeled as an ABG extension of public-start / `runEngineStart` /
    `start -> iterate`, with registry admission events emitted through the same
    runtime event discipline before registry lookup affects traversal.
  - Define the canonical downstream pickup path. A downstream product such as
    odd_glc gets its graph functions, overlays, plugin result interfaces,
    public starts, candidate families, and GTL bindings picked up only by
    publishing GTL declarations and startup config that ABG consumes during
    startup. Any product-local shell, registry scan, event append, projection,
    or direct invocation path is non-lawful duplicate truth.
  - Design and prove traversal invocation gating. A traversal-affecting graph
    function invocation shall require a matching ABG-emitted
    `graph_function_selected` event; invocation without selection truth shall
    fail closed.
  - Wire registry lookup/selection into the real ABG runner path. When registry
    startup is present, ABG shall project the admitted registry from replay,
    lookup the current traversal graph-function candidate for the basis/edge
    situation, emit `graph_function_selected` through `emit()`, and only then
    continue into traversal effects.
  - Design registry admission for GTL/ABG system-library entries and downstream
    product-library entries.
  - Design replay-derived registry projection and public lookup query surface.
  - Add a replay-roundtrip identity proof for the registry projection. The
    proof shall rebuild the runtime registry projection from the event log and
    assert identity-equivalent lookup results.
  - Design candidate eligibility filtering by entry kind, edge, graph
    function, graph vector, overlay, public start, source/target contract, context,
    requirement pressure, authority regime, namespace, version, provenance,
    proof readiness, and policy refs.
  - Design deterministic F_D filtering, optional F_P ranking, optional F_H
    policy choice, and ABG-owned traversal-affecting selection emission.
  - Design product-plugin-assisted selection, including the consequence-plugin
    case where a downstream product plugin advises ABG over an ABG-provided
    candidate view but never calls the next graph function or owns selection.
  - Add an ABG-declines-advice proof. The proof shall admit eligible product
    plugin advice, then show ABG can lawfully select a different eligible
    candidate under deterministic guard so advice does not become selection
    authority.
  - Design selection event shape and rejection/exclusion diagnostics for
    non-selected candidates where proof requires them.
  - Design system-library registration and downstream product-library
    registration without allowing product-local controllers or shadow catalogs.
  - Add an accept-branch override/refinement proof. The proof shall show a
    product-library entry with lawful `refinementOfEntryRef` or
    `overrideOfEntryRef` is admitted and becomes eligible, not only that
    unlawful shadowing is rejected.
  - Include a concrete usage trace where a downstream product such as odd_glc
    publishes an overlay graph plus four custom bootstrap/deployment graph
    functions as GTL product-library entries; ABG admits them, filters them
    against generic system-library entries, accepts plugin advice only as
    admitted advice, emits selection truth, and invokes the selected graph
    function.
  - Add a module lifecycle checklist to the design pack for every designed
    module, function surface, app surface, registry surface, plugin surface,
    and lookup surface. The checklist shall use the canonical `SPEC_METHOD.md`
    operational lifecycle chain and shall cover owner, source truth, authority
    boundary, and open ambiguity gaps about ultimate intended use.
  - Record the registry entry lifecycle as the first checklist finding. The
    current design admits/rejects entries and selects functions, and the proof
    plan discusses replaced, stale, revoked, or superseded entries, but no
    `registry_entry_retired`, `registry_entry_revoked`, or
    `registry_entry_superseded` event path is defined. The design must either
    define that event-sourced path or record the missing path as a named
    lifecycle ambiguity gap.
  - Strengthen the lifecycle checklist proof standard so each designed surface
    either answers every lifecycle phase or records a named `Gap:` or
    `Unanswered:` item for each unresolved phase. A header-only checklist shall
    not satisfy this gate.
  - Record the checklist as a local T-177 design gate that conforms to
    `SPEC_METHOD.md` Operational Lifecycle Sufficiency Rule and
    `DESIGN_MODULE_METHOD.md` Module Lifecycle Confirmation Rule.
  - Produce DESIGN_MODULE_METHOD derivation, first-slice IACS, structural
    carrier diagram, API boundary, event/projection plan, and proof plan. The
    structural carrier diagram shall satisfy DESIGN_MODULE_METHOD §5E with a
    Mermaid `classDiagram`, standard stereotypes, visibility, prime carriers,
    subordinate payloads, effect-edge-only payloads, downstream projections,
    deferred families, and authoritative/downstream roles.
proof_commands:
  - git diff --check
  - test -f build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_DERIVATION.md
  - test -f build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_FIRST_SLICE_IACS.md
  - test -f build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_STRUCTURAL_CARRIER_DIAGRAM.md
  - test -f build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_API_EVENT_PROJECTION_PROOF_PLAN.md
  - rg -n "classDiagram|<<prime>>|<<subordinate>>|<<effect-edge>>|<<downstream>>|<<authoritative>>" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_STRUCTURAL_CARRIER_DIAGRAM.md
  - rg -n "product-plugin-assisted selection|consequence plugin|ABG-emitted selection truth|shall not call the next graph function" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "public GTL library|product-library entries|system-library entries|startup admission|catalogGraphFunctionRefs.*publication inventory|GtlLibraryEntryDeclaration" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "constructGtlLibraryEntryDeclaration.*GTL declaration|constructProductPluginSelectionAdvice.*product proposal|constructRegistryLookupRequest.*runtime query input|RuntimeEvent.*shall not" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "GraphFunction|Module|overlays|public starts|plugin result interfaces|candidate families|publication inventory|registry input|selection truth" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "odd_glc|four custom|bootstrap|deployment|product-library entries|ABG admits|emits selection truth" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "canonical downstream pickup path|product-local startup shell|registry loader|file scanner|duplicate parallel truth|GTL bindings" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "Module Lifecycle Checklist|SPEC_METHOD.md.*operational lifecycle chain|ultimate intended use|ambiguity gaps" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "Lifecycle Checklist Finding|registry_entry_retired|registry_entry_revoked|registry_entry_superseded|Gap:|Unanswered:" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - rg -n "invocation.*graph_function_selected|without selection.*fail closed|replay-roundtrip identity|ABG.*decline.*advice|select.*different eligible candidate|accept-branch override|overrideOfEntryRef.*eligible|refinementOfEntryRef.*eligible" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_*.md
  - for field in "candidate identity" "entry kind" "interface" "source contract" "target contract" "context" "authority" "overlay" "namespace" "version" "provenance" "readiness" "proof" "policy constraints"; do rg -n "$field" build_tenants/abiogenesis/typescript/design/M03_RUNTIME_GRAPH_FUNCTION_REGISTRY_API_EVENT_PROJECTION_PROOF_PLAN.md >/dev/null || exit 1; done
  - cd build_tenants/abiogenesis/typescript && npm run test:t177
  - cd build_tenants/abiogenesis/typescript && npm run test:t177:live
---

# T-177: Live ABG Runtime Graph-Function Registry Lookup

## Active Position

This ticket is active after T-176 closed the GTL language capability model.

T-176 must first define the language-agnostic GTL language capability model,
subordinate vocabulary, and methodology signal. T-177 then owns the HOW design
for the live registry/lookup capability.

The current TypeScript GTL surface already defines static construction and
publication pieces: `GraphFunction`, `Module`, overlays, public starts,
candidate families, plugin result interfaces, and `catalogGraphFunctionRefs`.
Those pieces are necessary, but they are not sufficient for live runtime
lookup. This ticket must add the missing public GTL declaration story for
registry-eligible system and product library entries, then show how ABG admits
those declarations into runtime registry truth.

The current first realization slice also proves a concrete extraction seam.
`GtlLibraryEntryDeclaration`, `constructGtlLibraryEntryDeclaration`,
`constructProductPluginSelectionAdvice`, and `constructRegistryLookupRequest`
are pure helpers co-located in the ABG runtime registry module. They shall not
be moved as one group. The split is by authority:

- `GtlLibraryEntryDeclaration` / `constructGtlLibraryEntryDeclaration`: GTL
  declaration surface.
- `constructProductPluginSelectionAdvice`: product proposal/advice surface;
  ABG admits the proposal before it can affect selection.
- `constructRegistryLookupRequest`: runtime query input, not a GTL
  declaration.

Any extracted GTL-facing type must remain free of ABG runtime imports,
`RuntimeEvent` dependencies, event admission, registry projection, selection,
or invocation authority.

The current `retry_frontier.ts` change is intentional only as exhaustive event
handling. Registry entry/advice/selection events are added as ignored
non-retry events. That change shall not be used to make retry frontier own
registry lookup, selection, invocation, or registry lifecycle policy.

## Intended Capability

At runtime, ABG should be able to answer:

Given this edge or situation, with these source/target contracts, context refs,
requirements pressure, overlays, public starts, policies, and proof state, what
registered graph functions or overlays are lawful candidates?

A query may list candidates. Any selected candidate that affects traversal must
be admitted and emitted by ABG as runtime truth.

## Product-Plugin-Assisted Selection

A downstream product may publish specialized graph functions and plugins
through GTL product-library declarations. Those declarations are not runtime
truth until ABG admits them into the registry projection.

A product plugin may participate in selection only as an admitted advice
producer. The lawful flow is:

```text
ABG registry lookup
  -> deterministic eligibility filter
  -> ABG invokes product plugin with immutable candidate view when policy asks
  -> plugin returns typed advice, ranking, constraints, or rationale
  -> ABG admits the plugin output as payload/advice
  -> ABG validates advice against registry eligibility and override law
  -> ABG emits traversal-affecting selection truth
  -> ABG invokes the selected graph function
```

A consequence plugin built for odd_glc is the motivating downstream case. It
may interpret lifecycle consequence pressure and advise ABG which registered
graph function best fits the situation. It shall not call the graph function,
mutate the registry, bypass eligibility, create continuation truth, or select
traversal by itself.

## Startup Usage Shape

A lawful startup shape is:

```text
M04 public start / ABG runEngineStart
  -> ABG consumes GTL/ABG system library declarations
  -> ABG consumes downstream product startup config
  -> ABG consumes downstream GTL product library declarations
  -> ABG runs GTL conformance/typecheck
  -> ABG registry admission
  -> registry_entry_admitted / registry_entry_rejected events
  -> replay-derived registry projection
  -> ABG start -> iterate runner has registry lookup available
  -> runtime lookup over edge/situation pressure
  -> optional admitted product-plugin advice
  -> ABG graph_function_selected event
  -> ABG invokes selected graph function
```

For odd_glc, this means an overlay graph and custom bootstrap/deployment graph
functions are declared as product-library entries, while odd_glc-created
startup config may identify enabled libraries, product namespace, version pins,
overlay refs, plugin refs, proof/readiness refs, and policy refs. Both the
config and the GTL definitions are inputs consumed by ABG startup. Generic
lifecycle and requirements-algebra functions remain system-library entries.
ABG owns conformance, admission, lookup, eligibility, selection truth,
invocation, events, and projection. odd_glc owns only the specialized lifecycle
meaning, declaration content, and proposal/advice content before ABG admits it.

This is the canonical pickup method for downstream apps. odd_glc shall not add
its own startup shell, registry loader, file scanner, local event stream,
product-local registry projection, or dispatcher to make its graph functions,
overlays, or GTL bindings visible. Those surfaces become visible only when ABG
startup consumes their GTL declarations and product config, emits registry
truth, replays the projection, and selects through ABG-owned lookup/selection.

## Module Lifecycle Checklist

This ticket exposes a method gap between SPEC_METHOD and DESIGN_MODULE_METHOD:
every designed module, function surface, app surface, registry surface, plugin
surface, and lookup surface has a lifecycle beyond construction.

For T-177, each designed surface must answer against the canonical operational
lifecycle chain defined by `SPEC_METHOD.md`.

The checklist is not a release plan. It is an ambiguity detector. If the design
cannot answer how a surface is intended to be released, deployed, invoked live,
observed, governed, retired, or constrained by product policy, the design must
record the unanswered gap before implementation claims closure.

Each checklist must answer every phase or record a named `Gap:` or
`Unanswered:` marker for the unresolved phase. A phase list without answers or
named gaps does not satisfy this ticket.

First checklist finding for T-177: registry entry retirement is not yet
defined. The current event vocabulary admits and rejects registry entries and
emits selection truth, while the proof plan speaks about replaced, stale,
revoked, or superseded entries remaining visible as historical truth. Unless
the design adds an event-sourced retirement, revocation, or supersession path,
such as `registry_entry_retired`, `registry_entry_revoked`, or
`registry_entry_superseded`, the design must record that retirement path as an
open `Gap:`.

This ticket applies the shared-method checklist locally to the live registry
design. The chain is owned by `SPEC_METHOD.md`; T-177 only applies it to the
registry boundary.

## Closure Note

Completed after reopening the runner-selection gate. STDO/DESIGN_MODULE_METHOD
closure is scoped to the T-177 slice: ABG-owned startup pickup, public
GTL/product declaration inputs, replay-derived registry admission/projection,
public read-only lookup, runner-integrated graph-function selection, plugin
advice as admitted non-authority payload, invocation gated by
`graph_function_selected`, and negative proof against downstream startup shells
or product-local registries creating parallel truth.

## Implementation Progress

First realization slice started:

- Runtime event variants added for registry entry admission/rejection, plugin
  advice admission/rejection, graph-function selection, and selection rejection.
- Internal M03 registry algebra added for declaration admission, replay-derived
  registry projection, 13-field eligibility lookup, plugin advice admission,
  and ABG-owned selection event construction.
- Public GTL declaration/proposal surface extracted:
  `GtlLibraryEntryDeclaration`, `constructGtlLibraryEntryDeclaration`, and
  `constructProductPluginSelectionAdvice` now live on the GTL M02 declaration
  side without ABG runtime imports. `constructRegistryLookupRequest` remains
  ABG runtime query input.
- Focused `test:t177` proof added and strengthened. It now proves replay
  projection, startup admission ordering, the required eligibility fields plus
  entry-kind separation, public-surface denial for ABG runtime
  emitters/selectors, lawful override/refinement accept branches,
  replay-roundtrip identity, invocation gating by prior
  `graph_function_selected`, ABG declining admitted eligible advice to select
  a different eligible candidate, and rejection of product-local startup shell
  / local projection attempts as registry or invocation truth.
- ABG-owned startup binding implemented. `ProductRegistryStartupConfig` is a
  public GTL/product input surface, but `runEngineStart` consumes the registry
  startup input, emits registry admission truth through ABG, and only then
  proceeds into traversal. The focused proof shows M04 public start carrying
  product config and GTL declarations to ABG without a product-local startup
  shell.
- Runner-selection gate implemented. When runtime registry startup is present,
  the runner replay-projects the admitted registry, selects the registered
  graph-function entry for the execution basis, emits
  `graph_function_selected` before `graph_call_opened`, and fails closed before
  traversal when no admitted graph-function entry matches the basis.
- Live Hello World proof adapted to T-177. `test:t177:live` reuses the T-165
  live F_P Hello World route, enters through ABG `runEngineStartAsync`, supplies
  ABG runtime registry startup with a GTL product-library entry for the actual
  traversed graph function, executes the live-generated program, and asserts
  registry admission precedes
  `graph_function_selected`, which precedes `graph_call_opened`.
- The runtime-internal functions are not exported through the public package
  surface in this slice.

Closure record:

- `npm run test:t177`: passed 15/15.
- `npm run test:t177:live`: passed 2/2 in 13.812s. Artifact:
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t165_hello_world_requirements_route_live/20260630T095759752Z_pid59992/requirements-route-replay-artifact.json`;
  artifact sha256:
  `sha256:bdce675ab387c22796372fb87ef061f03e981e352e9ad196a68f7e01b7009c6d`.
- `npm run test:t072`: passed 15/15.
- `npm run lint:semantic`: passed.
- `npm run lint:test-harness`: passed.
- `git diff --check`: passed.
- T-177 design proof greps: passed.

Out-of-scope follow-on work is intentionally backlogged and does not block this
closure:

- `T-178`: event-sourced registry entry retirement, revocation, and
  supersession.
- `T-179`: non-graph registry entry runtime semantics for overlays, public
  starts, candidate families, plugin contracts, and GTL bindings.
