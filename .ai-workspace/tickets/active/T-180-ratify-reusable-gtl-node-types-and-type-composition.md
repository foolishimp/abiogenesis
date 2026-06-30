---
id: T-180
title: Ratify reusable GTL node types and type composition for downstream graph-function reuse
type: requirements_design_realization
ticket_category: gtl_node_type_composition
status: active
goal: >-
  Make reusable GTL node types available before odd_glc build-out so downstream
  products can declare lifecycle and domain node contracts once, bind nodes by
  type, compose graph functions by type satisfaction, and avoid duplicate
  inline declarations, product-local conventions, or shadow type registries.
change_intent: >-
  The T-177 runtime registry makes GTL/ABG library entries discoverable and
  selectable through ABG-owned admission and selection truth. Downstream
  products still lack a reusable GTL node-type surface: nodes must repeat
  schema, markov, asset-surface, context, proof, and authority obligations or
  hide type meaning in names, tags, schema strings, prompts, or product-local
  conventions. This ticket ratifies node types as non-callable identity graph
  functions, adds a lawful node-to-type binding surface, and introduces
  type-sensitive composition including composed types so odd_glc can build a
  compressed lifecycle code base without recreating odd_sdlc-style local type
  ledgers or helper registries.
change_class: requirement_reprice
re_entry_point: requirements
owner: abiogenesis
priority: high
triaged_at: 2026-06-30
created_at: 2026-06-30
governance_scope: STDO Method, SPEC_METHOD, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Registry, Conformance
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-176-define-gtl-language-capability-model-ts-how-and-gaps.md
  - .ai-workspace/tickets/completed/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
related_tickets:
  - .ai-workspace/tickets/backlog/T-178-design-event-sourced-registry-entry-retirement-supersession.md
  - .ai-workspace/tickets/backlog/T-179-design-non-graph-registry-entry-runtime-semantics.md
source_documents:
  - .ai-workspace/comments/claude/20260630T104500Z_STRATEGY_node_types_as_identity_graph_functions_v2.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-INTERFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-JOB.md
  - specification/requirements/gtl/REQ-L-GTL3-MODULE.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
target_truth: >-
  GTL has one reusable node-type mechanism. A node type is published through
  GTL as a non-callable identity graph function. Any ratified equivalent must
  use the same `GraphFunction` carrier, the same non-callable identity
  realization, the same `node_type` registry kind, and the same GTL library
  publication path; it shall not introduce a parallel type carrier or forked
  publication path. Nodes bind to node types through a compiler-visible type
  reference. Type conformance and type composition are pure, fail-closed
  language/conformance operations. Graph-function composition can wire
  differently named ports when the provided endpoint type satisfies the
  required endpoint type. ABG may admit, project, and validate type
  satisfaction, but ABG never executes, selects, or invokes a node type as
  traversal work.
superseded_truth: >-
  Downstream products repeat node contracts inline, encode type meaning in
  schema strings, tags, prompt prose, file naming, local helper registries, or
  product-local type ledgers, and graph-function composition succeeds only when
  ports share names and exact node-contract strings.
closure_law: >-
  Close only after the requirement law, design pack, TypeScript realization,
  and proof suite make node types usable by downstream products without
  duplicate declarations: node-to-type binding is compiler-visible; node types
  can be published and imported through the GTL library path; composed types
  preserve or strengthen all constituent obligations; type-sensitive
  composition is proven over differently named ports; and non-callability is
  enforced at job binding, public start, registry lookup/selection, graph-call
  opening, and invocation assertion boundaries.
non_closure_conditions:
  - Node type meaning remains encoded only in `Node.schema`, `tags`, prompt
    prose, file names, downstream convention, or product-local helper code.
  - A node type can be bound by `Job`, public start, runtime registry
    graph-function selection, graph-call opening, or invocation assertion.
  - `node_type` or composed-type registry entries can produce
    `graph_function_selected` or otherwise affect traversal without an ABG
    graph-function selection event over a callable graph-function entry.
  - `selectGraphFunctionFromRegistry` or any successor selection emitter can
    emit `graph_function_selected` for a selected entry whose
    `entryKind !== "graph_function"`, even when a malformed or hostile lookup
    result marks it eligible.
  - Type-sensitive composition is implemented by broadening runtime registry
    lookup into compile-time composition instead of sharing a predicate family
    with phase-specific adapters.
  - Type composition weakens a required schema, context, asset-surface,
    authority slot, proof obligation, output contract, or markov condition.
  - Composed types become mutable registry state, runtime selection truth,
    ABG-owned product policy, or a second structural type beside `Node`.
  - Existing name-coincident exact-contract graph-function composition
    regresses or becomes ambiguous without an explicit compatibility proof.
  - The steel-thread proof uses TypeScript, service, test, review, release, or
    odd_glc lifecycle semantics as GTL/ABG system policy instead of as product
    library proof bindings.
  - odd_glc begins generic lifecycle build-out against repeated inline node
    contracts before this ticket either closes or explicitly records a
    downstream defer accepted under STDO review.
required_work:
  - >-
    Phase 0 - Intake and requirement reprice: Reprice the live GTL/ABG
    requirement surface before code. Decide the constitutional home for
    node-type law and update the affected requirement families rather than
    treating the strategy post or TypeScript code as authority.
  - >-
    Phase 1 - Callable-safety hardening: Add law and tests for the structural
    selection-emitter guard: graph function selection shall reject any selected
    registry projection entry whose entry kind is not `graph_function`,
    independent of the lookup request or `eligibleCandidateRefs`.
  - >-
    Phase 2 - Reusable node-type declaration law: Ratify node types as
    non-callable identity graph functions. Any justified equivalent must use
    the same `GraphFunction` carrier, same non-callable identity realization,
    same `node_type` registry kind, and same publication path. Define the
    `node_type` marker or entry kind, structural validation, identity
    realization, effects prohibition, import/publication behavior, and
    registry/library relationship.
  - >-
    Phase 3 - Node-to-type binding: Add a compiler-visible node-to-type
    binding surface, expected to be an explicit `Node.typeRef` unless design
    proves a safer reserved declaration. Define how a node materializes a type
    contract and how inline nodes are checked against named types.
  - >-
    Phase 4 - Type conformance API: Define pure fail-closed
    `materialize(typeRef, localRefinements)` and `satisfies(node, typeRef)` or
    equivalent operations. Specify rejection taxonomy for unknown type, digest
    drift, weakened obligation, unresolved context, authority-slot weakening,
    proof/output obligation loss, and incompatible markov/schema/asset surface.
  - >-
    Phase 5 - Type composition and composed types: Ratify composed node types
    as language-level contract composition over reusable node-type refs. A
    composed type shall preserve or strengthen every constituent contract and
    shall not become a runtime selection surface. Decide whether composed types
    are expressed as intersection, refinement chain, explicit composition
    declaration, or another GTL surface, and prove that composed type
    satisfaction is deterministic, replayable, and fail-closed.
  - >-
    Phase 6 - Type-sensitive graph-function composition: Split port identity
    from endpoint type contract. Keep default name-coincident wiring for
    migration safety, add explicit wiring for differently named same-type or
    subtype-compatible ports, and decide whether unambiguous auto-wiring is
    allowed. Rewrite compatibility so composition checks endpoint type
    satisfaction rather than exact name-including `nodeContractKey` equality.
  - >-
    Phase 7 - Predicate-family extraction: Extract the T-177 eligibility logic
    into a shared compatibility predicate family with phase-specific adapters:
    runtime registry lookup over string refs and GTL composition/conformance
    over `Node`, `AssetSurface`, `typeRef`, and composed-type contracts.
    Generalize equality/presence to lawful satisfaction where required without
    weakening runtime eligibility.
  - >-
    Phase 8 - ABG interpretation and admission: Define how ABG admits and
    projects type satisfaction and how traversal close validates an output
    claiming a target type. ABG shall interpret and admit type-conformance truth
    but shall not execute type functions or invent type law at runtime.
  - >-
    Phase 9 - TypeScript realization: Implement the chosen HOW binding in the
    TypeScript tenant: carrier/API changes, constructors/admission/
    serialization, registry entry kind and selection guard,
    conformance/typecheck integration, composition compatibility, and
    regression guards for existing composition and registry lookup. Add the
    package scripts `test:t180` and `test:t180:live` so the ticket closure
    proof commands become executable release gates.
  - >-
    Phase 10 - Downstream steel thread: Prove downstream usability with
    product-library node types needed by odd_glc-style build-out. At minimum
    include one installed GLC Hello World bootstrap graph with product GTL
    library declarations, product registry startup config, product node-type
    entries, one callable graph-function entry, a transforming graph function
    over differently named typed ports, one composed lifecycle/executable type,
    one weakening rejection, and one non-callability negative proof at each
    callable surface. Review/service proof bindings may remain diagnostic, but
    the odd_glc readiness proof is the GLC bootstrap binding.
  - >-
    Phase 11 - odd_glc readiness artifact: Publish a short downstream readiness
    note or design row identifying the reusable node-type and composed-type
    capabilities odd_glc may consume, the exact ABI/GTL version or commit that
    provides them, the installed snapshot/bootstrap proof artifact, and the
    remaining non-blocking gaps if any.
acceptance_criteria:
  - GTL requirement law explicitly defines reusable node types, type refs,
    composed types, type conformance, and type-sensitive composition.
  - Requirement law explicitly states that node types are comparable at the
    conformance boundary but are not callable work entries.
  - The TypeScript `Node` surface or its ratified equivalent carries a
    compiler-visible type binding that does not depend on tags, prose, or local
    convention.
  - `node_type` is represented in registry/library semantics without becoming
    eligible for graph-function invocation.
  - `selectGraphFunctionFromRegistry` rejects non-`graph_function` entries
    structurally before emitting `graph_function_selected`.
  - `Job` and public-start binding reject node-type graph functions.
  - `GraphCall` opening and invocation assertion reject node-type graph
    functions even if caller-supplied data attempts to smuggle them in.
  - Type conformance proves both positive satisfaction and negative weakening.
  - Composed type conformance proves that every constituent obligation is
    preserved or strengthened.
  - Graph-function composition proves same-type differently named ports compose
    only through lawful explicit wiring or a ratified unambiguous auto-wire.
  - Existing exact-name, exact-contract composition remains valid.
  - Existing T-177 graph-function registry lookup behavior remains valid.
  - The steel thread demonstrates a downstream product can reuse node types and
    composed types without duplicating full inline node contracts.
  - The odd_glc readiness steel thread runs from an installed sandbox instance
    created from a release snapshot, with product GTL declarations and product
    registry startup config consumed by ABG startup. It shall not run by direct
    in-process harness injection alone.
  - `test:t180` and `test:t180:live` package scripts exist and run the focused
    synthetic and live proof lanes for this ticket.
proof_commands:
  - git diff --check
  - rg -n "node_type|typeRef|composed type|type-sensitive composition|non-callable" specification/requirements/gtl specification/requirements/abg
  - rg -n "entryKind !== \"graph_function\"|entry\\.entryKind.*graph_function|selected.*entryKind" build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts build_tenants/abiogenesis/typescript/code/src/abg/m03/runner
  - npm run build:semantic
  - npm run test:semantic
  - npm run test:t177
  - npm run test:t180
  - CODEX_LIVE_FP=1 npm run test:t180:live
notes:
  - The source strategy post is commentary. It may guide this ticket, but it
    does not ratify node-type law by itself.
  - T-179 remains the broader non-graph registry entry-kind semantics ticket.
    T-180 defines the `node_type` entry kind needed for reusable node types and
    records that entry-kind law as input to T-179. T-179 generalizes the
    remaining non-graph entry-kind taxonomy later; T-180 shall not silently
    close overlay, public-start, candidate-family, plugin, or retirement
    semantics outside its own scope.
  - TypeScript service and review-document examples are proof bindings for
    downstream usability. They shall not promote TypeScript, review workflow,
    software test, deployment, release, or odd_glc lifecycle policy into
    GTL/ABG system law.
---

# T-180: Reusable GTL Node Types And Type Composition

This ticket turns the node-types-as-identity-graph-functions strategy into
ratified ABI/GTL work before odd_glc build-out resumes.

The purpose is compression and drift prevention. Downstream products need to
declare domain and lifecycle node contracts once, compose graph functions over
those types, refine or compose types lawfully, and let the compiler reject
weakened or mismatched contracts. odd_glc should consume this substrate rather
than repeat node contracts or create a product-local type ledger.

The critical design distinction is:

```text
GTL typecheck / conformance:
  node type declaration -> typeRef -> composed type -> satisfies/materialize
  -> type-sensitive graph-function composition

ABG runtime:
  admitted GTL declarations -> registry projection -> graph-function selection
  -> traversal events and replay truth
```

These phases may share a compatibility predicate family, but they do not share
runtime authority. Composition is typecheck/conformance. Registry selection is
ABG runtime truth.

## Phase Goals

| Phase | Goal | Closure Signal |
| --- | --- | --- |
| 0. Intake and requirement reprice | Move the strategy from commentary into live requirement authority. | Affected GTL/ABG requirement families name node types, type refs, composed types, and type-sensitive composition. |
| 1. Callable-safety hardening | Close the registry selection hole before adding non-callable entry kinds. | Selection emission rejects any selected entry whose kind is not `graph_function`, regardless of lookup shape. |
| 2. Reusable node-type declaration law | Define node types as reusable published contracts without minting a rival structural type. | `node_type` is ratified as non-callable identity graph-function publication; any equivalent keeps the same carrier, realization, entry kind, and publication path. |
| 3. Node-to-type binding | Make type use compiler-visible for nodes. | Nodes bind to type contracts through `typeRef` or a ratified equivalent, not tags/prose/schema convention. |
| 4. Type conformance API | Make type satisfaction a pure, fail-closed operation. | `materialize`/`satisfies` or equivalents reject unknown, drifted, weakened, or unresolved contracts. |
| 5. Type composition and composed types | Allow reuse through composed types while preserving all obligations. | A composed type preserves or strengthens every constituent schema, context, asset, authority, proof, output, and markov obligation. |
| 6. Type-sensitive graph-function composition | Let graph functions compose by endpoint type satisfaction rather than duplicated node names. | Differently named compatible ports compose through explicit wiring or ratified unambiguous auto-wire. |
| 7. Predicate-family extraction | Share compatibility law without merging GTL typecheck and ABG runtime selection phases. | Runtime registry eligibility and GTL type compatibility use one law family with separate adapters. |
| 8. ABG interpretation and admission | Let ABG admit/project type satisfaction without owning type law or executing types. | Traversal close can validate an output against target type obligations from admitted declarations. |
| 9. TypeScript realization | Bind the law to the current primary tenant. | TS carriers, constructors, admission, serialization, typecheck, registry, and composition tests pass. |
| 10. Downstream steel thread | Prove the substrate is usable for odd_glc-style reuse. | Product-library node types, a composed type, and a transforming function over typed ports prove without duplicated inline contracts. |
| 11. odd_glc readiness artifact | Give downstream work a clean consumption reference. | A readiness note names the ABI/GTL commit or release and the capabilities odd_glc may consume. |

## Reviewable Implementation Plan

The work shall proceed through reviewable slices. A later slice shall not start
until the previous slice has passed STDO/DMM review or has an explicit
recorded defer. Each slice has one purpose, one authority boundary, and one
proof surface.

### Slice 1 - Existing Registry Selection Guard

**Purpose**: Close the already-present T-177 selection-emitter hole before
adding `node_type`.

**Design for review**:
- Governing surface: ABG runtime registry selection.
- Inputs: `RegistryLookupResult`, `RuntimeRegistryProjection`, selected
  candidate ref from ABG selection/admitted advice/fallback/singleton
  eligibility.
- Decision: selection may emit `graph_function_selected` only when the selected
  projection entry exists, has an eligibility decision, and has
  `entryKind === "graph_function"`.
- Rejection: non-graph entries produce `graph_function_selection_rejected` with
  a stable rejection reason such as `selected_candidate_not_graph_function`.
- Authority: the guard lives in the emitter, not in caller discipline, runner
  lookup shape, or plugin advice validation.
- Scope: no node-type carrier, conformance API, or composition change belongs
  in this slice.

**Work**:
- Add the structural guard in `selectGraphFunctionFromRegistry`.
- Reject any selected entry whose `entryKind !== "graph_function"` before
  emitting `graph_function_selected`.
- Add a negative proof where a malformed lookup marks a non-graph entry
  eligible and selection still rejects it.
- Keep current runner lookup behavior unchanged for graph-function entries.

**Review gate**:
- No node-type feature work is included in this slice.
- The guard is enforced at the emitter, not only at runner lookup.
- Existing `test:t177` remains green.

### Slice 2 - Constitutional WHAT Law

**Purpose**: Ratify reusable node types and type composition before changing
the composition core.

**Design for review**:
- Governing surface: live GTL/ABG requirement law.
- Type carrier: node types are non-callable identity `GraphFunction`
  publications. Any equivalent must keep the same `GraphFunction` carrier,
  same identity realization, same `node_type` registry kind, and same GTL
  library publication path.
- Node binding: node type use is compiler-visible through `typeRef` or a
  ratified equivalent that is not tags, prose, schema-string convention, or
  product-local lookup.
- Composed types: a composed type is language contract composition over named
  type refs; it preserves or strengthens all constituent obligations and is not
  runtime selection truth.
- Composition law: port identity and endpoint type contract are separate.
  Wiring binds ports; type satisfaction validates compatibility.
- Boundary: GTL declares and typechecks. ABG admits, projects, and validates.
  ABG does not invent type law or execute node types.

**Work**:
- Update GTL requirement families for node types, `typeRef`, composed types,
  non-callability, type conformance, and type-sensitive composition.
- Define the no-duplicate-surface rule: no parallel node-type carrier, no
  product-local type registry, no forked publication path.
- Define composed-type variance: every constituent obligation is preserved or
  strengthened.
- Define the typecheck/runtime split: GTL typecheck composes; ABG admits and
  projects; ABG does not execute node types.

**Review gate**:
- Requirements are present-tense law, not implementation notes.
- The carrier decision is narrowed to the existing `GraphFunction` carrier,
  identity realization, `node_type` registry kind, and GTL library path.
- No TypeScript source changes except proof scaffolding or greps.

### Slice 3 - DMM Design Pack

**Purpose**: Disambiguate HOW before carrier/API edits.

**Design for review**:
- Required design artifacts: derivation, first-slice IACS, structural carrier
  diagram, worked trace, and proof plan.
- Carrier inventory: list every new or changed TS carrier/API surface, assign
  each to Existing, Subordinate, Projection, or Prime under DMM, and prove that
  no duplicate node-type ontology is introduced.
- Visibility model: GTL declaration surfaces are public authoring inputs; ABG
  admission/projection is runtime-internal; conformance/typecheck reports are
  read/query surfaces; node types are never callable runtime entries.
- Entry-kind model: T-180 defines `node_type` for this capability and records
  it as input to T-179. T-179 remains owner of broader non-graph entry-kind
  taxonomy.
- Wiring model: design must choose explicit wiring only, or optional
  unambiguous auto-wire with fail-closed ambiguity proof.
- Predicate model: one compatibility predicate family, with separate adapters
  for runtime registry refs and GTL node/type contracts.

**Work**:
- Produce derivation, first-slice IACS, structural carrier diagram, and worked
  trace for node type declaration, typeRef binding, composed type, and
  type-sensitive composition.
- Decide exact TS binding for `Node.typeRef`, `node_type` declarations,
  composed-type declaration form, explicit wiring, and optional auto-wire.
- Define the compatibility predicate family with separate phase adapters:
  runtime registry eligibility over refs, and GTL conformance/composition over
  node/type contracts.
- Define non-callability checks at job, public-start, selection, graph-call,
  and invocation assertion boundaries.

**Review gate**:
- DMM proves prime status for any new carrier or rejects it.
- Structural diagram shows visibility and ownership for GTL declaration,
  ABG admission/projection, and runtime selection.
- Design contains no duplicate type ontology beside `Node` and
  `GraphFunction`.

### Slice 4 - Carrier And API Realization

**Purpose**: Add the minimal TS surfaces needed for node type declaration and
type binding without changing composition semantics yet.

**Design for review**:
- `Node` surface: add the ratified type binding in the TS carrier,
  constructor, admission, and serialization path while preserving backward
  compatibility for nodes without a type ref.
- Registry surface: extend `GtlRegistryEntryKind` with `node_type` and prove it
  is accepted as declaration/projection truth but rejected by graph-function
  selection.
- Node-type declaration surface: define the minimal structural shape for an
  identity type function: one input node, one output node, matching contract,
  identity realization, no effects, and non-callable marker.
- API shape: add conformance APIs as pure fail-closed skeletons with explicit
  rejection kinds before composition consumes them.
- Package shape: add `test:t180` and `test:t180:live` scripts as real scripts,
  even if the live lane initially skips without its environment gate.

**Work**:
- Add `Node.typeRef` or the ratified equivalent.
- Add `node_type` to the registry entry-kind surface.
- Add node-type constructors/admission/serialization.
- Add pure conformance API skeletons and rejection taxonomy.
- Add `test:t180` and `test:t180:live` scripts as real package commands.

**Review gate**:
- Type declarations compile and serialize/admit round-trip.
- No graph-function composition behavior changes yet.
- `node_type` entries remain non-callable and non-selectable.

### Slice 5 - Type Conformance And Composed Types

**Purpose**: Make reusable and composed types meaningful before using them in
graph-function composition.

**Design for review**:
- `materialize`: input is a type ref plus local refinements; output is the
  realized node contract or a typed rejection. It resolves only admitted or
  typecheck-visible declaration truth.
- `satisfies`: input is a node contract plus a type ref; output is a
  conformance result with accepted/rejected status and field-level reasons.
- Composed type contract: constituent type refs are resolved in stable order,
  merged by preserve-or-strengthen rules, and rejected on conflict or
  weakening.
- Variance law: adding obligations can satisfy a broader type only when it does
  not remove or weaken schema, markov, asset surface, context, authority,
  proof, standards, output-contract, or renderer/constructor obligations.
- Rejection taxonomy: unknown type, unresolved source declaration, digest
  drift, incompatible schema, weakened markov, missing context, asset mismatch,
  authority weakening, proof/output loss, and ambiguous composition.
- Phase boundary: this slice proves type truth only; it does not alter
  graph-function composition.

**Work**:
- Implement `materialize(typeRef, localRefinements)` and
  `satisfies(node, typeRef)` or ratified equivalents.
- Implement composed-type satisfaction.
- Prove positive type satisfaction, unknown type rejection, weakened
  obligation rejection, digest/context drift rejection, and composed-type
  preserve-or-strengthen behavior.

**Review gate**:
- Composed types cannot weaken schema, markov, asset-surface, context,
  authority, proof, or output obligations.
- Type conformance is pure and fail-closed.
- No runtime selection authority is introduced.

### Slice 6 - Type-Sensitive Composition

**Purpose**: Enable graph-function reuse through typed endpoints.

**Design for review**:
- Contract split: `nodeContractKey` or successor logic separates `portKey`
  from `typeContractKey`. `name` identifies the port; schema/markov/asset
  surface/typeRef/composed-type truth identifies the type contract.
- Default behavior: existing same-name exact-contract composition is preserved
  as the migration-safe base case.
- Explicit wiring: a wiring declaration maps `provided_port -> required_port`.
  The mapping is accepted only when the provided endpoint type satisfies the
  required endpoint type.
- Auto-wire: if ratified, auto-wire may bind only when exactly one provided
  endpoint satisfies exactly one required endpoint. Any multiple match or
  missing match fails closed.
- Composition result: composed graph functions preserve carries/provides in
  stable order and do not erase source type refs or wiring provenance.
- Regression scope: all existing graph algebra paths that call
  `requireCompatibleNodes` or compare node contracts must be audited.

**Work**:
- Split port identity from endpoint type contract.
- Preserve name-coincident exact-contract composition as the migration-safe
  base case.
- Add explicit wiring for differently named same-type or subtype-compatible
  ports.
- Implement optional auto-wire only if ratified and unambiguous.
- Route composition compatibility through the type satisfaction adapter.

**Review gate**:
- Existing exact-name composition tests pass unchanged.
- Differently named same-type ports compose only through lawful wiring.
- Ambiguous type matches fail closed.
- Full `npm run test:semantic` is green.

### Slice 7 - ABG Admission And Traversal-Close Interpretation

**Purpose**: Let ABG validate outputs against reusable type obligations without
owning type law.

**Design for review**:
- Source truth: ABG consumes admitted GTL declarations, type refs,
  composed-type declarations, and conformance results. It does not synthesize
  type contracts from runtime observations.
- Admission: ABG may admit type-satisfaction facts when they are derived from
  declared type law and observed output truth. Any runtime fact uses the normal
  event/admission path.
- Traversal close: an output claiming target type `B` is checked against the
  realized `B` obligations before closure-dependent projection may treat it as
  satisfying the target.
- Reuse: target-carrier certification, payload admission, asset surface, and
  proof obligations are reused where possible instead of inventing a new ABG
  type ledger.
- Query shape: downstream may read admitted/projected type satisfaction, but
  cannot emit, select, close, or continue through that read model.
- Negative boundary: type functions are never run as actor invocations,
  operators, public starts, graph calls, or graph-function selections.

**Work**:
- Admit/project type satisfaction from GTL declarations.
- Validate traversal-close output claims against realized target type
  obligations.
- Reuse existing target-carrier and admission surfaces where possible.
- Add negative proofs that ABG does not invent type law at runtime.

**Review gate**:
- ABG admission is replay-derived from declarations.
- Runtime facts are emitted/admitted through normal event paths when runtime
  truth is needed.
- Type functions are never executed.

### Slice 8 - Downstream Reuse Steel Thread

**Purpose**: Prove this actually reduces odd_glc declaration duplication.

**Design for review**:
- Proof role: the steel thread is a product-library proof binding, not ABI
  policy. Names such as `ReviewDocument` and `TypescriptServiceModule` prove
  diagnostic downstream usability but do not become system-library semantics
  unless a separate genericity proof ratifies them. The odd_glc readiness
  binding uses generic lifecycle roles: bootstrap context, lifecycle artifact,
  executable artifact, composed Hello World program artifact, and execution
  evidence.
- Startup shape: deploy a per-run release snapshot into a sandbox instance and
  run the installed `genesis-ts start` command. The product supplies GTL
  library declarations and product registry startup config through the
  installed bootstrap binding; ABG startup admits the declarations and ABG
  traversal selects callable graph functions. A product-local shell shall not
  inject registry truth, graph-call truth, or invocation truth.
- Declaration shape: define reusable GLC node types, one composed lifecycle +
  executable program type, and one callable GLC bootstrap graph function entry
  without repeating full inline contracts.
- Composition shape: the GLC bootstrap graph uses differently named ports
  (`GeneratedHelloWorldProgram` to `RunnableHelloWorldProgram`) and composes
  only because the shared composed type satisfies the required endpoint type.
- Negative shape: a generic node fails to satisfy the specialized node type,
  and a weakened composed type fails to satisfy its parent.
- Non-callability shape: node-type graph functions fail at job binding,
  public start, registry selection, graph-call opening, and invocation
  assertion.
- Measurement: the proof records that ABG admitted product `node_type` entries,
  selected only the callable `graph_function` entry before graph-call opening,
  and executed a live F_P-backed Hello World proof from the installed sandbox
  instance.

**Work**:
- Define proof-binding product-library node types for GLC Hello World bootstrap:
  bootstrap context, lifecycle artifact, executable artifact, composed Hello
  World program artifact, and execution evidence.
- Define one composed type.
- Define one transforming graph function over differently named typed ports.
- Prove a generic node cannot satisfy the specialized type.
- Prove non-callability at job, public-start, selection, graph-call, and
  invocation assertion boundaries.
- Prove the startup path by creating a release snapshot, installing it into a
  sandbox instance, writing only product bootstrap declarations/config, and
  running installed `genesis-ts start`.

**Review gate**:
- The example remains a product-library proof binding, not GTL/ABG system
  policy.
- Startup is ABG-driven: product GTL declarations/config are consumed by ABG;
  no downstream shell emits registry, selection, graph-call, or invocation
  truth.
- The proof shows reduced repeated inline node contracts.
- No odd_glc code is required to pass the proof.

### Slice 9 - Live Proof And Readiness Publication

**Purpose**: Make the capability consumable by odd_glc.

**Design for review**:
- Proof lanes: `test:t180` is the focused non-live regression lane;
  `test:t180:live` is the LLM-backed installed sandbox/bootstrap lane;
  `test:t180:live:direct` is a diagnostic direct-harness lane only; and
  `test:semantic` is the full regression gate for composition-core changes.
- Live definition: live means a real LLM worker call, with model, session id,
  duration, API duration where available, cost, and output artifact recorded.
- Bootstrap definition: closure live proof means an installed product instance
  is created from a release snapshot and started with installed
  `genesis-ts start`. The runtime binding may supply product declarations,
  product registry startup config, and plugins; ABG owns admission, selection,
  traversal, graph-call opening, invocation assertion, and event emission.
- Artifact shape: readiness publication names the exact ABI/GTL source commit
  or release, proof commands, proof artifacts, and capabilities proven.
- Downstream contract: odd_glc may consume reusable node types, composed types,
  type-sensitive composition, and ABG type-admission/query truth only through
  the published ABI/GTL surfaces named in the readiness note.
- Honesty gate: any unproven capability is named as deferred. A defer cannot
  require odd_glc to duplicate node declarations or create a product-local type
  registry.

**Work**:
- Run `test:t180`.
- Run `CODEX_LIVE_FP=1 npm run test:t180:live`.
- Run `npm run test:semantic`.
- Publish an odd_glc readiness note naming the exact ABI/GTL commit or release
  and the node-type/type-composition capabilities available to downstream
  work.

**Review gate**:
- Live means an LLM worker was called, with model/session/duration/cost
  recorded.
- Readiness claims are limited to what the tests prove.
- Any deferred gaps are named and do not force odd_glc back into duplicate
  node declarations or product-local type registries.

## Execution Record

### Slice 1 - Existing Registry Selection Guard

Status: implemented for review.

Change:
- `selectGraphFunctionFromRegistry` now rejects any selected projection entry
  whose `entryKind` is not `graph_function` before it can emit
  `graph_function_selected`.
- Added a focused regression where lookup marks an `overlay` entry eligible and
  ABG selection still emits `graph_function_selection_rejected` with
  `selected_candidate_not_graph_function`.

Verification:
- `npm run build:semantic`
- `npm run test:t177`

Closure note:
- This closes the already-shipped selection-emitter hole for existing
  non-callable registry kinds. Later slices may add `node_type`, but that kind
  will enter an already-guarded selection path.

### Slice 2 - Constitutional WHAT Law

Status: implemented for review.

Change:
- Added GTL requirement law for reusable node types, `typeRef`, composed
  types, type conformance, non-callable node-type graph functions, and
  type-sensitive composition.
- Updated `REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL`,
  `REQ-L-GTL3-NODE`, `REQ-L-GTL3-GRAPHFUNCTION`, and
  `REQ-L-GTL3-COMPOSE`.
- The law narrows node types to non-callable identity `GraphFunction`
  publications with a `node_type` registry kind and no duplicate type carrier
  or product-local type registry.

Verification:
- `rg -n "node_type|typeRef|composed type|type-sensitive composition|non-callable" specification/requirements/gtl specification/requirements/abg`

Closure note:
- The WHAT law is live requirement text. The source strategy remains
  commentary.

### Slice 3 - DMM Design Pack

Status: local ticket design implemented for review; standalone design-pack
files remain to publish before ticket closure if STDO review requires separate
artifacts.

Change:
- Added a reviewable implementation plan with per-slice design sections,
  ownership, visibility, carrier, wiring, predicate, and proof gates.
- The plan records that T-180 defines only the `node_type` part of the broader
  non-graph registry taxonomy and leaves T-179 open.
- The plan chooses explicit type wiring only. It does not introduce
  unqualified auto-wiring.

Verification:
- The ticket contains design sections for slices 1-9.

Remaining:
- If closure review requires separate files, publish derivation, IACS,
  structural carrier diagram, worked trace, and proof plan under the design
  surface instead of relying on this ticket section alone.

### Slice 4 - Carrier And API Realization

Status: implemented for review.

Change:
- Added `Node.typeRef` as nullable GTL carrier truth with constructor,
  admission, serialization, and contract-key preservation. Untyped nodes keep
  the prior migration-safe contract shape.
- Added `node_type` to GTL runtime-library entry kinds and ABG registry
  admitted/rejected event validation.
- Moved the node-type graph-function marker to the GTL contract surface so
  ABG conformance/runtime guards do not import GTL algebra implementation.
- Added `test:t180` package script.

Verification:
- `npm run test:t180`
- `npm run test:t177`
- `git diff --check`

Closure note:
- Type refs and `node_type` publication are available without introducing a
  second node-type carrier.

### Slice 5 - Type Conformance And Composed Types

Status: implemented for review.

Change:
- Added `constructNodeTypeGraphFunction`, `materializeNodeType`,
  `satisfiesNodeType`, and `composeNodeTypes` in the GTL algebra surface.
- A node type is recognized only as an existing `GraphFunction` carrier with
  the `gtl:node_type` marker, one input/output node, no effects, and identity
  environment semantics.
- Satisfaction is pure and fail-closed over type-ref mismatch, unknown type,
  non-identity graph-function publication, weakened schema, weakened markov,
  and weakened asset-surface obligations.
- Composition unions constituent markov and asset-surface obligations,
  preserves one `GraphFunction` publication path, and rejects empty
  composition, unknown constituents, schema conflicts, and asset-surface
  conflicts.

Verification:
- `npm run test:t180`

Closure note:
- Composed types are GTL contract truth. They do not become mutable registry
  state, runtime selection truth, or an ABG-owned product-policy surface.

### Slice 6 - Type-Sensitive Graph-Function Composition

Status: implemented for review.

Change:
- Added `composeWithTypeWiring` as an explicit-wiring composition API.
- Existing `compose()` remains exact-name/exact-contract and continues to
  reject differently named ports.
- `composeWithTypeWiring` rewrites the downstream required endpoint only when
  a caller supplies typed wiring and both the provided and required endpoints
  satisfy the named node-type graph function.
- Adapted graph functions now derive fresh identity from the changed endpoint
  structure rather than preserving the pre-adaptation graph-function id.
- No unqualified auto-wiring is introduced.

Verification:
- `npm run test:t180`
- `npm run test:semantic`

Closure note:
- This slice enables downstream reuse through typed endpoints while preserving
  migration-safe exact composition.
- Predicate-family clarification: this implementation does not extract one
  literal shared helper for runtime registry lookup and GTL composition.
  Registry lookup remains exact over admitted string refs; GTL composition uses
  subtype satisfaction over node contracts. The shared law is the compatibility
  family with phase-specific adapters, not merged runtime/typecheck authority.

### Slice 7 - ABG Admission, Traversal-Close Interpretation, And Non-Callability Guards

Status: implemented for review.

Change:
- Added replay-visible `node_type_satisfaction_projected` runtime event truth.
- Added `projectNodeTypeSatisfaction` so ABG can project type satisfaction
  from GTL node-type graph functions and a concrete node without executing or
  selecting node types.
- Added `assertTraversalCloseNodeTypeSatisfied` so a traversal-close output
  claim can fail closed when the output node does not satisfy the target type.
- Added runtime admission validation for the node-type satisfaction projection
  payload and digest.
- Public-start conformance rejects node-type graph functions as callable work.
- Job-binding conformance rejects node-type graph functions in contract target
  and public-callable graph-function refs.
- Graph-call opening rejects a basis whose graph function carries the
  `gtl:node_type` marker, including the exported
  `constructGraphCallOpenedEvent` factory.
- `graph_function_selected` now carries `selectedEntryKind: "graph_function"`;
  event admission and `assertGraphFunctionInvocationSelected` reject
  caller-supplied `node_type` selected events.

Verification:
- `npm run test:t180`
- `npm run test:t177`
- `npm run test:semantic`

Closure note:
- Node types are comparable at conformance/type boundaries, rejected at
  callable slots, and ABG now has a replay-admitted projection for close-time
  type satisfaction. This does not add a runner-wide automatic close hook; the
  validation surface is the ABG close-path check for outputs that claim a
  target type.

### Slice 8 - Downstream Reuse Steel Thread

Status: implemented for review.

Change:
- Focused tests define odd_glc-style proof-binding types such as
  `ReviewDocument` and `TypescriptServiceModule` without promoting those names
  into GTL/ABG system policy.
- The synthetic lane proves a composed type, a weakened-node rejection,
  differently named typed-port composition, and non-callability guards.
- The live lane file defines the same downstream reuse shape and feeds the
  live worker-selected shape through the GTL node-type APIs.
- The closure live lane is retargeted to a GLC Hello World bootstrap sandbox:
  it creates a per-run release snapshot, installs that snapshot into a sandbox
  instance, writes product GTL node-type/library declarations and product
  registry startup config into the installed bootstrap binding, and runs
  installed `genesis-ts start` so ABG startup and traversal consume the
  declarations.

Verification:
- `npm run test:t180`
- Direct skip-mode check:
  `node --test test_env/live/test_t180_gtl_node_types_live.test.mjs`
- `CODEX_LIVE_FP=1 npm run test:t180:live`

Closure note:
- The earlier direct LLM-backed lane passed and wrote an artifact under
  `build_tenants/abiogenesis/typescript/test_env/test_runs/t180_gtl_node_types_live/20260630T135956760Z_pid46211/t180-live-readiness-artifact.json`.
  That artifact remains useful diagnostic evidence, but it is not the closure
  live lane after the startup/bootstrap clarification.

### Slice 9 - Live Proof And Readiness Publication

Status: live proof implemented; readiness publication not closed.

Change:
- Added `test:t180:live` package script.
- Added `test_env/live/test_t180_gtl_node_types_live.test.mjs`, an
  LLM-backed proof lane that records agent key, command, executor profile,
  duration, retry count, trace path, output path, and the worker-selected
  downstream reuse shape.
- Added `test_env/sandbox/test_t180_glc_hello_world_bootstrap_live.test.mjs`,
  the closure live lane: release snapshot -> installed sandbox instance ->
  product bootstrap declarations/config -> installed `genesis-ts start` ->
  live F_P worker -> ABG registry startup/selection and typed traversal
  assertions.
- Added CLI runtime binding support for `runtimeRegistryStartup` so installed
  product bootstrap config can flow into ABG start instead of a downstream
  shell.

Verification completed:
- Direct diagnostic lane:
  `CODEX_LIVE_FP=1 npm run test:t180:live:direct`
  - test body duration: 80924.868209ms
  - artifact durationMs: 80890
  - agentKey: `claude`
  - structuredEventCount: 15
  - apiRetryCount: 0
  - artifact:
    `build_tenants/abiogenesis/typescript/test_env/test_runs/t180_gtl_node_types_live/20260630T135956760Z_pid46211/t180-live-readiness-artifact.json`
- Installed sandbox/bootstrap closure lane:
  `ABG_TS_LIVE_AGENT=claude CODEX_LIVE_FP=1 ABG_TS_T180_GLC_BOOTSTRAP_LIVE=1 npm run test:t180:live`
  - node test duration: 130510.384666ms
  - artifact durationMs: 121337
  - sourceCommit: `c640814518ca029089f81fa1fc3db1ff87696e63`
  - sourceDirty: true
  - snapshotTarballSha256:
    `954e040f91134f3eff903947eca0dc16f9675ae5752ae43dec76d55e30c0f3c6`
  - admitted registry entries: 5 `node_type`, 1 `graph_function`
  - selected graph functions: 2 `graph_function_selected`, zero
    `node_type` selections
  - traversal proof: 2 `graph_call_opened`, 2 `vector_closed`,
    `terminal_reached`, start status `converged`
  - live proof artifact:
    `build_tenants/abiogenesis/typescript/test_env/test_runs/t180_glc_hello_world_bootstrap_live/20260630T155826332Z_pid20388/t180-glc-hello-world-bootstrap-live-proof.json`

Remaining before closure:
- Publish odd_glc readiness note naming the exact ABI/GTL commit or release,
  installed bootstrap proof artifact, and the reusable node-type/type-
  composition capabilities available to downstream work.
- The tree is currently an uncommitted working tree over `c640814`; readiness
  publication must wait for a stable commit or release identity.

### Current Verification Summary

Completed in this pass:
- `npm run test:t180` - 9 passing tests.
- `npm run test:t177` - 16 passing tests.
- `npm run test:semantic` - 977 passing tests.
- `node --test test_env/live/test_t180_gtl_node_types_live.test.mjs` -
  1 skipped test without live environment.
- `ABG_TS_LIVE_AGENT=claude CODEX_LIVE_FP=1 ABG_TS_T180_GLC_BOOTSTRAP_LIVE=1 npm run test:t180:live` -
  1 passing installed sandbox/bootstrap live LLM test.
- `git diff --check`.

Not completed in this pass:
- Standalone odd_glc readiness publication.
