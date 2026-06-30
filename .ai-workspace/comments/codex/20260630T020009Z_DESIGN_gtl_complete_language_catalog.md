# Design Post - GTL Complete Language Catalog

Superseded by:
`.ai-workspace/comments/claude/20260630T093000Z_DESIGN_gtl_complete_language_catalog_verified.md`.

This draft is retained as commentary history. Use the code-verified Claude post
as the current commentary reference unless and until the catalog is promoted to
a ratified design or specification surface.

Status: commentary/design post, not ratified specification.
Re-entry class: design documentation.
Scope: GTL syntax, graph functions, graph overlays, graph algebra, publication, conformance, and GTL/ABG capability boundaries.

## Source Surfaces Read

- `README.md`
- `specification/GOALS.md`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md`
- `docs/LLM_GTL_APP_BUILDER_GUIDE.md`
- `build_tenants/abiogenesis/typescript/design/README.md`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/carriers.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/constructors.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m01/algebra/core.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/carriers.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/constructors.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts`
- `build_tenants/abiogenesis/typescript/code/src/gtl/requirements/index.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts`
- `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/overlay_frame.ts`

## Core Definition

GTL is the graph-first contract-law language for declaring ODD programs. Its job is to publish typed graph programs, compute composition contracts, policy/hook boundaries, prompt/asset surfaces, requirement declarations, and public start bindings in a form ABG can admit, interpret, execute, replay, and prove.

ABG is the runtime truth substrate. ABG admits GTL declarations, opens graph calls and frames, invokes plugins/workers through admitted bindings, writes runtime events and payload ledgers, folds assurance, projects residuals, routes continuation/re-entry, and produces replay-derived query truth.

Downstream products own product meaning and interpretation. They may declare GTL modules, graph functions, policy overlays, prompt/asset surfaces, plugin contracts, and domain read models. They do not own traversal truth, event streams, folds, residuals, closure, retry, continuation, or re-entry.

## Syntax Model

Current GTL has no separate authoritative textual DSL. The concrete syntax accepted by the implementation is serialized carrier/API syntax: immutable TypeScript carrier objects built by constructors and admitted by ABG conformance/typecheck surfaces.

The syntax families are:

- primitive serialized values: `string`, `number`, `boolean`, `null`, arrays, and JSON objects.
- serialized attributes: scalar values, string lists, hook refs, and JSON blobs.
- schema refs: symbolic schema names or runtime refs.
- topology declarations: `Node`, `GraphVector`, `Graph`, `GraphFunction`.
- semantic declarations: `Context`, `Operator`, `Evaluator`, `Rule`.
- publication declarations: `Module`, `Job`, `Role`, `ContractRef`.
- refinement declarations: `RefinementBoundary`, `CandidateFamily`.
- compute notation declarations: selected `abg.fn_composition` and stage/plugin bindings.
- requirement declarations: requirement terms, relations, bundles, traversal spans, lifecycle compositions.
- conformance inventory rows: overlays, public starts, target carriers, edge closures, prompt assets, plugin contracts, plugin result interfaces, hook boundaries, runtime bindings, re-entry routes, traversal bind conservation.

Host APIs may offer friendlier syntax, but they are valid only when they lower to these carriers and pass ABG conformance admission.

## GTL Core Ontology

`Context`
: A named authority or source context with locator and digest. Contexts constrain interpretation and must be carried by graph programs that depend on them.

`SchemaRef`
: A symbolic or runtime reference to the shape of a node, carrier, prompt asset, payload, or output surface.

`AssetSurface`
: A typed asset/prompt/product surface associated with a node. It names required contexts, standards refs, output contracts, constructor/rendering refs, authority slots, and proof obligations. It may expose bounded fallback only when explicit fallback preconditions exist.

`Node`
: A typed locus of graph meaning. A node has a name, schema, Markov flag, optional asset surface, tags, and stable identity.

`Operator`
: A constructive operation declaration under a regime (`F_D`, `F_P`, or `F_H`). Operators declare binding, not runtime authority.

`Evaluator`
: An evaluation declaration under a regime (`F_D`, `F_P`, or `F_H`) with consumed fields and optional binding. Evaluators judge candidate/state surfaces; ABG admits the resulting truth.

`Rule`
: A typed rule declaration with config and tags. Rules govern gates, closure checks, selection constraints, and policy conditions.

`GraphVector`
: A typed transition boundary from one or more source nodes to one target node. It may name operators, evaluators, contexts, a rule, subwork allowance, declarations, and tags. A vector is not the public callable program; it is an internal traversal unit candidate inside a graph/function.

`Graph`
: A named topology of nodes and graph vectors. It has declared inputs, outputs, contexts, rules, effects, and tags.

`EnvRef`
: The outer interface contract for a graph function: `requires`, `provides`, and `carries`. Construction requires `carries` to include every required and provided node contract.

`TemplateRef`
: Either an inline materializable graph or a symbolic graph template ref.

`GraphFunction`
: The primary published reusable workflow/program carrier. It has a name, outer environment, inputs, outputs, template, effects, declarations, tags, and identity.

`RefinementBoundary`
: A typed interface over which candidate graph functions may refine or replace an abstract vector/program region.

`CandidateFamily`
: A declared family of graph-function candidates with shared inputs/outputs and policy hints.

`ContractRef`
: A reference to a published graph function. In GTL 3 semantic work, `ContractRef.kind` is `graph_function`.

`Role`
: A role/policy binding for jobs or modules.

`Job`
: A durable semantic work contract over graph-function contracts and roles. A job is the work surface; it is not a bare graph vector.

`Module`
: The publication boundary. A module publishes graphs, graph functions, refinement boundaries, candidate families, jobs, roles, operators, evaluators, rules, imports, policy hooks, and metadata.

## Graph Function Definition

A graph function is GTL's primary constructive program carrier.

A valid graph function must:

- expose an outer interface through `EnvRef`.
- have inputs equal to `environment.requires`.
- have outputs represented in `environment.provides`.
- carry every required and provided node contract through `environment.carries`.
- use either an inline materializable graph template or a symbolic template ref.
- if inline, preserve the graph-function input/output interface exactly.
- be publishable through a `Module`.
- be referenceable by `ContractRef` and `Job`.
- be executable only through ABG graph call/frame/runtime machinery.
- be replayable and provable through admitted ABG events and projections.

A graph function is not:

- a product-local service method.
- a script loop.
- a plugin implementation.
- a graph vector exposed as a public start.
- a query/read model.
- a runtime event emitter.
- a retry or continuation controller.

## Minimal Carrier Syntax Example

The current canonical syntax is carrier/constructor syntax. This is illustrative, not a new DSL:

```ts
const source = constructNode({
  name: "Source",
  schema: { kind: "symbolic", ref: "schema://source" },
  markov: true,
  assetSurface: null,
  tags: []
});

const target = constructNode({
  name: "Target",
  schema: { kind: "symbolic", ref: "schema://target" },
  markov: true,
  assetSurface: null,
  tags: []
});

const transformGraph = edge([source], target, {
  name: "source_to_target",
  operators: [],
  evaluators: [],
  contexts: [],
  rule: null
});

const transform = constructGraphFunction({
  name: "fn.source_to_target",
  environment: constructEnvRef({
    requires: [source],
    provides: [target],
    carries: [source, target]
  }),
  inputs: [source],
  outputs: [target],
  template: {
    kind: "inline_graph",
    ref: "inline:fn.source_to_target",
    graph: transformGraph,
    version: null
  },
  effects: [],
  declarations: emptySerializedAttrs(),
  tags: []
});

const module = constructModule({
  name: "example",
  graphs: [transformGraph],
  graphFunctions: [transform],
  refinementBoundaries: [],
  candidateFamilies: [],
  jobs: [
    constructJob({
      name: "job.example",
      contracts: [constructContractRef({ kind: "graph_function", targetId: transform.id })],
      roles: [],
      tags: [],
      policyHooks: emptySerializedAttrs()
    })
  ],
  roles: [],
  operators: [],
  evaluators: [],
  rules: [],
  imports: [],
  policyHooks: emptySerializedAttrs(),
  metadata: emptySerializedAttrs()
});
```

## Graph Algebra Catalog

`sameObject(left, right)`
: Identity predicate. Returns true only when both objects have the same stable `id`.

`edge(source[], target, options)`
: Constructs a one-vector graph from non-empty source nodes to one target node. The resulting graph has the source nodes as inputs, the target as output, and a single `GraphVector`.

`identity(inputs)`
: Constructs an identity graph function over a set of input nodes. It carries inputs to themselves with no internal vectors.

`graphFunctionForVector(vector)`
: Lifts one graph vector into a graph function with a matching outer interface.

`compose(first, second, ...rest)`
: Sequentially composes graph functions. The right function's requirements must be compatible with the left function's carried/provided contracts. Composition merges templates, contexts, effects, declarations, and carried/provided environments. It rejects conflicting provided bindings.

`substitute(outer, contractVectorId, inner)`
: Replaces a vector in an outer graph with an inner graph. The inner graph's inputs must be a subset of the target vector source contracts, and the vector target contract must appear in the inner graph outputs. This is the lawful graph-refinement primitive.

`constructGraphFunctionZoomPlan(...)` / `applyGraphFunctionZoomPlan(...)` / `zoomGraphFunction(...)`
: Applies substitution at graph-function level under explicit authority. The refinement graph function must preserve the parent graph-function outer interface after substitution.

`recurse(graphFunction, termination, foldback)`
: Declares recursion over an existing graph function. The foldback mode must be `rebind`, must have a binding, and must require parent evaluation. ABG interprets recursion; GTL does not create a hidden recursive controller.

`fan_out(graphFunction, over)`
: Declares fan-out over a node that explicitly represents a `Vector[...]` boundary. It preserves the vector-boundary node as input/output.

`fan_in(reducer, over)`
: Declares fan-in/reduction over a `Vector[...]` boundary. The reducer's provided outputs become the fan-in outputs.

`gate(target, rule, evaluators)`
: Wraps a graph function with a gate declaration. It requires at least one evaluator and records rule/evaluator declarations as gate metadata. It does not itself close traversal.

`promote(source, to)`
: Declares a symbolic promotion graph function from one node contract to another. It is a typed carrier promotion, not evidence of runtime success.

## Graph Overlay Definition

The phrase "graph overlay" has several lawful meanings. It must not become a second graph runtime.

### 1. GTL Program Overlay Row

A GTL program overlay row is a conformance/catalog declaration:

```ts
interface GtlProgramOverlayRow {
  overlayRef: string;
  graphFunctionRefs: readonly string[];
  graphVectorRefs: readonly string[];
  publicStartTargets: readonly string[];
  defaultStartTarget: string;
}
```

It declares which published graph functions and graph vectors an overlay names, which public starts it targets, and which graph function is the default start. ABG conformance checks that:

- every named graph function is published.
- every named graph vector resolves.
- every public start target is published.
- the default start target is published.
- public starts that attach overlays are compatible with the overlay's graph-function scope.

This overlay is catalog metadata. It does not execute, emit, admit, fold, or route.

### 2. Public Start Binding

A public start row binds a callable entry surface to a graph function and optional overlays:

```ts
interface GtlProgramPublicStartRow {
  name: string;
  graphFunctionRef: string;
  overlayRefs: readonly string[];
  defaultForOverlayRefs: readonly string[];
}
```

The public start is the product-visible start handle. ABG still owns graph-call opening, frame opening, runtime binding, and traversal events.

### 3. ABG Overlay Frame Contract

An overlay frame is ABG runtime machinery, not GTL topology. It scopes runtime pressure/observation over module, job, graph function, graph vector, graph span, or rule anchors. It has:

- `overlayFrameRef`
- `contractRef`
- execution basis
- scope refs
- `fireWhen` and `terminateWhen` predicate bindings
- pressure refs
- optional foldback target
- optional re-entry target vector index
- optional no-close policy ref

ABG emits `overlay_frame_declared` and `overlay_frame_evaluated` events and derives `OverlayFrameProjection` by replay. Predicate satisfaction must derive from admitted observed state. This is a runtime observation/foldback surface; it is not a GTL graph-function catalog and not a downstream controller.

### 4. Zoom/Refinement Overlay

Some teams may call graph-function zoom or vector substitution an overlay. The lawful GTL shape is not a new overlay carrier; it is:

- parent graph function.
- refinement graph function.
- authority over a target vector.
- substitution plan.
- resulting graph function preserving parent inputs/outputs.

This is graph algebra (`substitute` / zoom plan), not runtime overlay-frame truth.

### 5. Downstream Product Overlay

A downstream product overlay is a read/label/policy interpretation over admitted GTL/ABG truth. It may name lifecycle stages, risk appetite, prompt templates, domain views, or specialization slots. It may not mint graph functions, emit runtime events, admit evidence, fold assurance, select continuation, or create re-entry truth.

## Compute Notation And F_D/F_P/F_H

GTL names selected compute composition with `abg.fn_composition` notation. The documentation shorthand is:

- `fn<A,B>.C`: a selected composition for a graph function from input carrier A to output carrier B.
- `transform.C`: candidate construction stage.
- `evaluate.C`: candidate evaluation stage.
- `consequence.C`: consequence projection stage.
- `evaluate.C.F_D.register_rule[*]`: deterministic rule registration/validation.
- `evaluate.C.F_P.semantic_judgment_rule[*]`: probabilistic/semantic judgment.
- `F_H`: external human callout, admitted through ABG response admission.

Compute composition rows bind a host surface (`graph_function`, `graph_vector`, `operator`, `evaluator`, or `rule`) to ordered regime bindings. Regime bindings declare role, order, input carrier refs, output carrier refs, evidence refs, and authority class.

Plugin category bindings may exist for transform, evaluate, consequence, and human callout stages. Every plugin binding carries explicit authority denials:

- `mayWriteLedgers: false`
- `mayEmitRuntimeEvents: false`
- `maySelectTraversal: false`
- `mayCloseTraversal: false`

Plugins compute proposed values. ABG admits or rejects the results and writes truth.

## Requirements Algebra Declarations

GTL exposes requirements algebra as declaration wrappers:

- `declareRequirement`
- `declareRequirementRelation`
- `declareBundle`
- `declareLifecycleComposition`
- `declareTraversalSpan`

These are GTL declarations over ABG requirements algebra. They do not create a product-local requirement compiler, fold ledger, residual ledger, evidence admission path, retry loop, or re-entry controller.

## Program Conformance Surface

The ABG GTL conformance input is the full inventory that proves a GTL program is not just a set of names. Its rows include:

- subject identity and ABI package version.
- expected coverage and feature coverage manifest.
- published graph-function catalog refs.
- graph functions and modules.
- target carrier contracts.
- edge closure contracts.
- overlays and public start targets.
- prompt assets.
- plugin contracts.
- plugin result interfaces.
- source identity surfaces.
- source authority policies.
- semantic review gates.
- same-object proofs.
- operator/evaluator/rule declarations.
- compute compositions.
- compute stage bindings.
- hook boundaries.
- selection boundaries.
- job and role bindings.
- external tool gates.
- runtime bindings.
- runtime re-entry routes.
- traversal bind conservation rows.
- requirements algebra declaration bundles.

`admitGtlProgramConformanceInput(...)` admits and normalizes raw input. `typecheckGtlProgram(...)` produces:

- inventory digests.
- admitted plugin result-interface catalog.
- requirements algebra projection.
- traversal unit projection.
- passed/failed status.
- typed conformance issues.
- coverage counts.

Conformance fails closed for unresolved graph functions, graph vectors, overlays, public starts, plugin contracts, runtime bindings, target carriers, edge closures, compute compositions, plugin result interfaces, conservation basis, and related closure predicates.

## Traversal Unit Definition

`TraversalUnit<A,B>` is a projection over selected execution, not a new GTL topology anchor. It binds:

- graph function.
- graph/vector identity.
- vector index.
- source asset types.
- target asset type.
- target carrier contract.
- edge closure contract.
- selected compute composition.
- compute stage bindings.
- plugin result interfaces.
- consequence plugin result interfaces.
- conservation basis.
- intent lineage.
- materialization bindings.
- staged authority refs.
- requirement refs, spans, test relations, and evidence policies.
- allowed consequence traversal catalog rows.

A traversal unit is closeable only when the target carrier, edge closure, compute composition, stage bindings, plugin result interfaces, consequence result interface, and conservation basis resolve.

## Capability Catalog

GTL can declare:

- typed graph topology.
- graph vectors as typed transition boundaries.
- graph functions as reusable program carriers.
- sequential composition.
- substitution/refinement.
- recursion with explicit termination/foldback declaration.
- fan-out and fan-in over explicit vector boundaries.
- gates over graph functions.
- symbolic carrier promotion.
- module publication.
- job and role work contracts.
- refinement boundaries and candidate families.
- selected compute composition.
- F_D/F_P/F_H role and authority bindings.
- prompt and asset surfaces.
- hook and plugin boundaries.
- plugin result interfaces.
- public start surfaces.
- graph overlay catalog rows.
- runtime binding rows.
- runtime re-entry route rows.
- traversal bind conservation rows.
- source identity and authority-policy rows.
- requirement terms, relations, spans, bundles, and lifecycle compositions.
- program conformance inventories.

GTL cannot:

- execute programs.
- emit runtime events.
- admit payload/evidence truth.
- write ledgers.
- fold assurance.
- project residual truth as runtime authority.
- route continuation or re-entry.
- invoke F_P/F_H workers directly as product authority.
- make graph vectors public starts without graph-function/job/module publication.
- treat overlay rows as controllers.
- treat plugin outputs as admitted truth before ABG admission.
- treat query/read-model success as closure.

## Boundary Rules

1. GTL declares graph-program law.
2. ABG admits, executes, records, folds, projects, and routes.
3. Products interpret admitted truth.
4. Graph functions are constructive carriers; read models and overlays are not substitute graph functions.
5. Public starts bind to graph functions, not bare vectors.
6. `C` notation is selected composition, not a runtime API.
7. Overlay rows are catalog/start metadata; overlay frames are ABG runtime contracts.
8. Plugin contracts are authority-denied by construction.
9. Requirement declarations are GTL authoring wrappers over ABG requirements algebra, not product-local requirement ledgers.
10. Downstream capability claims must pass `typecheckGtlProgram(...)` or an equivalent ABG admission path.

## Review Checklist For A GTL Program

- Does every public capability lower to a `GraphFunction` published by a `Module`?
- Does every work surface bind through a `Job` or public start row?
- Does every public start resolve to a published graph function?
- Do overlay rows resolve to published graph functions and graph vectors?
- Is every graph vector internal to a graph/function traversal?
- Are target carriers and edge closures declared for every closeable traversal unit?
- Is selected compute composition present for every traversable edge?
- Are plugin contracts bound to compute stages and runtime bindings?
- Do plugin result interfaces name stage, output carrier, selector, and runtime result shape?
- Does traversal bind conservation cover target carrier, materialization, staged authority, admission strength, and obligation-delta basis?
- Are F_D/F_P/F_H roles declared as data and admitted by ABG?
- Are runtime events and closure truth absent from GTL/product declarations?
- Does `typecheckGtlProgram(...)` pass with expected coverage?

## Current Design Consequence

A complete GTL documentation surface should not define a separate textual grammar unless that grammar is ratified and lowered to the carrier/API syntax above. The current complete definition is the carrier syntax plus ABG conformance/typecheck admission.

The phrase "graph overlay" should be normalized in future docs into four separate terms:

- `program overlay row`: GTL conformance catalog/start metadata.
- `overlay frame`: ABG runtime observation/foldback contract.
- `zoom/refinement plan`: GTL graph substitution over a graph function.
- `product overlay`: downstream read/policy interpretation over admitted truth.

Keeping those four meanings separate prevents the common failure mode: an overlay becoming a second traversal controller.
