# Design Post — GTL Complete Language Catalog (CODE-VERIFIED)

Status: commentary/design post, not ratified specification.
Re-entry class: design documentation.
Scope: GTL syntax, graph functions, graph overlays, graph algebra, publication, conformance, GTL/ABG capability boundaries.
Provenance: supersedes the draft `20260630T020009Z_DESIGN_gtl_complete_language_catalog.md`. Every claim below was matched against the abiogenesis TypeScript source at review time (2026-06-30) via a claim-by-claim verification pass with adversarial re-check of each discrepancy. Citations are `code/src/...:line`. This is the verified reference; it is still commentary, not ratified law.

T-176 update: the ratified WHAT surface is the GTL language capability model:
`specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`.
The current TypeScript HOW and gap analysis live in
`build_tenants/abiogenesis/typescript/design/T176_GTL_LANGUAGE_CAPABILITY_TS_HOW_AND_GAP_ANALYSIS.md`.
Catalog, registry, ledger, library, inventory, projection, overlay, and
selection are subordinate vocabulary inside the GTL language capability model.
`catalogGraphFunctionRefs` is publication inventory only, not a live runtime
lookup catalog. The future live ABG runtime registry lookup design is deferred
to T-177.

---

## Corrections Applied vs The Draft

The draft was ~90% accurate. Confirmed-against-code fixes folded into this version:

1. **Example was non-compiling (two bugs).** `markov: true` and `assetSurface: null` are both type- and runtime-invalid. `NodeInit.markov` is `readonly string[]`; `NodeInit.assetSurface` is a **required** `AssetSurfaceInit` (object with required `kind`). The corrected example uses `markov: []` and a real `assetSurface`.
2. **Node fields.** `markov` is a string **list**, not a boolean flag; `assetSurface` is **required**, not optional; the identity field is `id`.
3. **Evaluator fields.** `binding` is a **required** string (not optional); there is a required `description` field the draft omitted.
4. **Carrier/constructor module split.** Carriers and constructors live in **two** modules: `gtl/m01` (topology + semantic + graph-function layer) and `gtl/m02` (refinement + work + publication layer). The draft presented them as one surface.
5. **Overlay frame "execution basis"** is two scalar fields `basisId` + `graphFunctionId`, not a single field.
6. **`TraversalUnit<A,B>` is a conceptual label, not a code type.** The real type is `GtlProgramTraversalUnitProjectionRow` (non-generic); the row carries graph-vector **identity** (`graphVectorRef`/`graphVectorId`), not a numeric `vectorIndex`.
7. **Material omission added — F_P/F_H cannot close.** Only an `F_D` composition regime binding may carry a closure role/authority; `F_P`/`F_H` bindings are type-restricted to exclude `close`/`closure`.
8. **False alarm rejected.** The flagged `compose` compatibility claim was re-checked and the **draft was right** — no change.

Additional sub-carriers and rows the draft did not enumerate are noted inline (`ModuleImport`, `AssetSurfaceAuthoritySlot`, `HookRef`, `materializedVectors` digest).

---

## Core Definition

GTL is the graph-first contract-law language for declaring ODD programs. It publishes typed graph programs, compute composition contracts, policy/hook boundaries, prompt/asset surfaces, requirement declarations, and public start bindings in a form ABG can admit, interpret, execute, replay, and prove.

ABG is the runtime truth substrate. ABG admits GTL declarations, opens graph calls and frames, invokes plugins/workers through admitted bindings, writes runtime events and payload ledgers, folds assurance, projects residuals, routes continuation/re-entry, and produces replay-derived query truth.

Downstream products own product meaning and interpretation. They may declare GTL modules, graph functions, policy overlays, prompt/asset surfaces, plugin contracts, and domain read models. They do not own traversal truth, event streams, folds, residuals, closure, retry, continuation, or re-entry.

## Syntax Model

Current GTL has no separate authoritative textual DSL. The concrete syntax accepted by the implementation is serialized carrier/API syntax: immutable TypeScript carrier objects built by constructors and admitted by ABG conformance/typecheck surfaces. Host APIs may offer friendlier syntax, but they are valid only when they lower to these carriers and pass ABG conformance admission.

## GTL Core Ontology (verified, with module location)

**Layer 1 — `code/src/gtl/m01/contracts/carriers.ts`:**

- `Context` (`:61`) — `{ name; locator; digest }`, three strings. Constrains interpretation; must be carried by dependent programs.
- `SchemaRef` (`:67`) — union `{ kind:"symbolic"; ref } | { kind:"runtime_ref"; ref }`.
- `AssetSurface` (`:77`) — typed asset/prompt/product surface. Fields: `kind`, `requiredContexts`, `standardsRefs`, `outputContractRefs`, `constructorRefs`, `constructorInputAssetKinds`, `rendererRefs`, `renderedViewDigestPolicyRef`, `sectionKindRefs`, `clauseKindRefs`, `authoritySlots`, `proofObligationRefs`. Authority-slot disposition ∈ `{ normal, bounded_fallback, forbidden_routine }`; bounded fallback is gated by `fallbackPreconditionRefs`.
- `AssetSurfaceAuthoritySlot` (`:101`) — `{ authorityKindRef; disposition; fallbackPreconditionRefs }`. *(sub-carrier; not in draft)*
- `HookRef` (`:29`) — `{ ref; config }`. *(sub-carrier; not in draft)*
- `Node` (`:107`) — `{ name; schema; markov: readonly string[]; assetSurface: AssetSurface (required); tags; id }`. **`markov` is a string list, not a boolean; `assetSurface` is required; identity is `id`.**
- `Operator` (`:116`) — `{ name; regime: Regime; binding; tags }`, `Regime = "F_D"|"F_P"|"F_H"`. Declares binding, not runtime authority.
- `Evaluator` (`:125`) — `{ name; description (required); regime; binding (required string); consumedFieldRefs; tags }`. Judges candidate/state surfaces; ABG admits the resulting truth.
- `Rule` (`:134`) — `{ name; kind; config: SerializedAttrs; tags }`.
- `GraphVector` (`:141`) — `{ name; source: readonly Node[] (one+); target: Node (single); operators; evaluators; contexts; rule: Rule|null; allowsSubwork: boolean; declarations; tags; id }`. Internal traversal-unit candidate, not the public callable program.
- `Graph` (`:155`) — `{ name; inputs; outputs; nodes; vectors; contexts; rules; effects; tags; id }`.
- `EnvRef` (`:168`) — `{ requires; provides; carries: readonly Node[] }`. `constructEnvRef` throws if `carries` omits any required or provided contract (`constructors.ts:530`).
- `TemplateRef` (`:174`) — union `{ kind:"inline_graph"; graph: Graph; version:null } | { kind:"symbolic"; graph:null; version:string|null }`; `materializeTemplateRef` throws for symbolic (`:220`).
- `GraphFunction` (`:188`) — `{ name; environment: EnvRef; inputs; outputs; template: TemplateRef; effects; declarations; tags; id }`. Primary published reusable program carrier.

**Layer 2 — `code/src/gtl/m02/contracts/carriers.ts`:**

- `RefinementBoundary` (`:39`) — `{ name; inputs; outputs; hints: SerializedAttrs; tags; id }`. Typed interface for candidate refinement/replacement of a vector/region.
- `CandidateFamily` (`:48`) — `{ name; inputs; outputs; candidates: readonly GraphFunction[]; policyHints; tags; id }`.
- `ContractRef` (`:18`) — `{ kind:"graph_function"; targetId }`. `kind` is a literal type fixed to `"graph_function"`.
- `Role` (`:23`) — `{ name; tags; policyHooks: SerializedAttrs; id }`.
- `Job` (`:30`) — `{ name; contracts: readonly ContractRef[]; roles: readonly Role[]; tags; policyHooks; id }`. Work surface, not a bare graph vector.
- `Module` (`:64`) — publication boundary; enumerates exactly `graphs, graphFunctions, refinementBoundaries, candidateFamilies, jobs, roles, operators, evaluators, rules, imports, policyHooks, metadata` (+ `name`).
- `ModuleImport` (`:58`) — `{ source; names; version }`, element type of `Module.imports`. *(sub-carrier; not in draft)*

## Graph Function Definition

A valid graph function must: expose its outer interface through `EnvRef`; have `inputs == environment.requires` and outputs represented in `environment.provides`; carry every required/provided node contract via `environment.carries`; use an inline materializable graph template or a symbolic template ref (inline preserves the I/O interface exactly); be publishable through a `Module`; be referenceable by `ContractRef`/`Job`; be executable only through ABG graph call/frame machinery; be replayable/provable through admitted ABG events and projections.

A graph function is **not**: a product-local service method, a script loop, a plugin implementation, a graph vector exposed as a public start, a query/read model, a runtime event emitter, or a retry/continuation controller.

## Minimal Carrier Syntax Example (corrected — compiles)

```ts
const source = constructNode({                          // gtl/m01/contracts/constructors.ts:419
  name: "Source",
  schema: { kind: "symbolic", ref: "schema://source" },
  markov: [],                                            // string[], NOT a boolean
  assetSurface: { kind: "schema_only" },                // required AssetSurfaceInit (kind required)
  tags: []
});

const target = constructNode({
  name: "Target",
  schema: { kind: "symbolic", ref: "schema://target" },
  markov: [],
  assetSurface: { kind: "schema_only" },
  tags: []
});

const transformGraph = edge([source], target, {         // gtl/m01/algebra/core.ts:607
  name: "source_to_target",
  operators: [], evaluators: [], contexts: [], rule: null
});

const transform = constructGraphFunction({              // gtl/m01/contracts/constructors.ts:530
  name: "fn.source_to_target",
  environment: constructEnvRef({                         // gtl/m01/contracts/constructors.ts:573
    requires: [source], provides: [target], carries: [source, target]
  }),
  inputs: [source],
  outputs: [target],
  template: { kind: "inline_graph", ref: "inline:fn.source_to_target", graph: transformGraph, version: null },
  effects: [],
  declarations: emptySerializedAttrs(),                  // gtl/m01/contracts/constructors.ts:415
  tags: []
});

const module = constructModule({                         // gtl/m02/contracts/constructors.ts:332
  name: "example",
  graphs: [transformGraph],
  graphFunctions: [transform],
  refinementBoundaries: [], candidateFamilies: [],
  jobs: [
    constructJob({                                       // gtl/m02/contracts/constructors.ts:209
      name: "job.example",
      contracts: [constructContractRef({ kind: "graph_function", targetId: transform.id })], // m02 constructors.ts:179
      roles: [], tags: [], policyHooks: emptySerializedAttrs()
    })
  ],
  roles: [], operators: [], evaluators: [], rules: [], imports: [],
  policyHooks: emptySerializedAttrs(), metadata: emptySerializedAttrs()
});
```

Constructor locations: `constructNode`, `constructGraphFunction`, `constructEnvRef`, `emptySerializedAttrs` → `gtl/m01/contracts/constructors.ts`; `edge` → `gtl/m01/algebra/core.ts`; `constructModule`, `constructJob`, `constructContractRef` → `gtl/m02/contracts/constructors.ts`.

## Graph Algebra Catalog (all 14 verified — `code/src/gtl/m01/algebra/core.ts`)

- `sameObject(left, right)` (`:600`) — identity predicate; true only when both share the same stable `id`.
- `edge(source[], target, options)` (`:607`) — one-vector graph from non-empty sources to one target; sources become inputs, target the output, single `GraphVector`.
- `identity(inputs)` (`:654`) — identity graph function carrying inputs to themselves, no internal vectors.
- `graphFunctionForVector(vector)` (`:697`) — lifts one graph vector into a graph function with matching outer interface.
- `substitute(outer, contractVectorId, inner)` (`:741`) — replaces a vector with an inner graph; inner inputs ⊆ target vector source contracts; the vector target contract must appear in inner outputs. The lawful graph-refinement primitive.
- `constructGraphFunctionZoomPlan` (`:801`) / `applyGraphFunctionZoomPlan` (`:859`) / `zoomGraphFunction` (`:942`) — substitution at graph-function level under explicit authority; the refinement graph function must preserve the parent outer interface.
- `recurse(graphFunction, termination, foldback)` (`:967`) — declares recursion; foldback mode must be `rebind`, must have a binding, and must require parent evaluation. ABG interprets recursion; GTL creates no hidden recursive controller.
- `fan_out(graphFunction, over)` (`:1020`) — fan-out over a node representing a `Vector[...]` boundary; preserves the vector-boundary node.
- `fan_in(reducer, over)` (`:1046`) — fan-in/reduction over a `Vector[...]` boundary; the reducer's provided outputs become the fan-in outputs.
- `gate(target, rule, evaluators)` (`:1072`) — wraps a graph function with a gate declaration; requires ≥1 evaluator; records rule/evaluator as gate metadata; does not itself close traversal.
- `promote(source, to)` (`:1106`) — symbolic promotion carrier between node contracts; not evidence of runtime success.
- `compose(first, second, ...rest)` (`:1170`) — sequential composition; right's `requires` must be compatible with left's carried/provided (guard checks against `left.environment.carries`, which is a superset of `provides` by the `EnvRef` invariant); merges templates/contexts/effects/declarations/environments; rejects conflicting provided bindings.

## Graph Overlay Definition

The phrase "graph overlay" has several lawful meanings. It must not become a second graph runtime.

**1. GTL Program Overlay Row** (conformance/catalog metadata) — `{ overlayRef; graphFunctionRefs[]; graphVectorRefs[]; publicStartTargets[]; defaultStartTarget }`. ABG conformance checks every named graph function/vector resolves and is published, every public-start target is published, the default start is published, and attaching public starts are scope-compatible. Catalog metadata only — does not execute, emit, admit, fold, or route.

**2. Public Start Binding** — `GtlProgramPublicStartRow { name; graphFunctionRef; overlayRefs[]; defaultForOverlayRefs[] }`. The product-visible start handle. ABG still owns graph-call/frame opening, runtime binding, and traversal events.

**3. ABG Overlay Frame Contract** — runtime machinery, **not** GTL topology. `interface OverlayFrameContract` (`code/src/abg/m03/contracts/carriers.ts:147`) scopes runtime pressure/observation over module/job/graph-function/vector/span/rule anchors. Fields: `overlayFrameRef`, `contractRef`, `basisId` + `graphFunctionId` (the "execution basis" is these **two scalar fields**), `scopeRefs`, `fireWhen`, `terminateWhen`, `pressureRefs`, `foldbackTargetRef` (string|null), `reentryTargetVectorIndex` (number|null), `noClosePolicyRef`. ABG emits `overlay_frame_declared` (`overlay_frame.ts:398`) and `overlay_frame_evaluated` (`:443`) and derives `OverlayFrameProjection` via `deriveOverlayFrameProjection` (`:572`) on replay; predicate satisfaction must derive from admitted observed state. A runtime observation/foldback surface — not a graph-function catalog, not a downstream controller.

**4. Zoom/Refinement Overlay** — not a new carrier; it is graph algebra (`substitute` / zoom plan): parent graph function + refinement graph function + authority over a target vector + substitution plan + result preserving parent I/O.

**5. Downstream Product Overlay** — a read/label/policy interpretation over admitted GTL/ABG truth (lifecycle stages, risk appetite, prompt templates, domain views, specialization slots). May **not** mint graph functions, emit events, admit evidence, fold assurance, select continuation, or create re-entry truth.

## Compute Notation And F_D/F_P/F_H (`code/src/gtl/m02/contracts/compute_notation.ts`)

GTL names selected compute composition with `abg.fn_composition` notation. Documentation shorthand: `fn<A,B>.C` (selected composition A→B), `transform.C`, `evaluate.C`, `consequence.C`, `evaluate.C.F_D.register_rule[*]`, `evaluate.C.F_P.semantic_judgment_rule[*]`, `F_H` external callout admitted through ABG response admission.

Compute composition rows bind a host surface (`graph_function` | `graph_vector` | `operator` | `evaluator` | `rule`) to ordered regime bindings. Regime binding base (`:83`) declares `role`, `order`, `inputCarrierRefs`, `outputCarrierRefs`, `evidenceRefs`, and an `authority` field (typed; the draft's "authority class" is the `authority` field).

**Closure is F_D-exclusive by type (`:73`-`102`).** `GtlNonFdCompositionRegimeBinding` restricts `F_P`/`F_H` bindings to `GtlNonClosureCompositionRegimeRole` (`Exclude<…,"close">`) and `GtlNonClosureCompositionRegimeAuthority` (`Exclude<…,"closure">`). Only an `F_D` binding can carry a closure role/authority. This encodes "deterministic truth closes first" at the type level.

Plugin category bindings (transform/evaluate/consequence/human-callout) carry four **literal-`false`** authority denials (`:157`-`160`): `mayWriteLedgers: false`, `mayEmitRuntimeEvents: false`, `maySelectTraversal: false`, `mayCloseTraversal: false`. These are `false` *types*, not default values — authority-denied by construction. Plugins compute proposed values; ABG admits/rejects and writes truth.

## Requirements Algebra Declarations (`code/src/gtl/requirements/index.ts`)

Public GTL declaration wrappers, exported as aliases over the `m01` constructors:

- `declareRequirement` = `constructGtlRequirementDeclaration`
- `declareRequirementRelation` = `constructGtlRequirementRelationDeclaration`
- `declareBundle` = `constructGtlRequirementsAlgebraDeclarationBundle`
- `declareLifecycleComposition` = `constructGtlRequirementsLifecycleComposition`
- `declareTraversalSpan` = `constructGtlTraversalSpanDeclaration`

(all re-exported from `../m01/contracts/requirements_algebra.js`). These are GTL authoring wrappers over ABG requirements algebra — they create no product-local requirement compiler, fold ledger, residual ledger, evidence admission path, retry loop, or re-entry controller.

> Naming note: the exported `GtlRequirementTestRelationDeclaration` carrier (`testSourceProjectionRef` / `testExecutionProjectionRef` / `componentTestRootRefs`) uses software-"test" spelling. Per `REQ-L-GTL3-REQUIREMENTS-ALGEBRA-006`, these are **generic proof-role spellings only** (subject-artifact / verifier-source / verifier-execution); GTL defines no product test policy. The boundary is closed by law; a generic rename remains optional cleanup.

## Program Conformance Surface (`code/src/abg/m03/contracts/gtl_program_conformance.ts`)

`admitGtlProgramConformanceInput(...)` (`:6970`) admits/normalizes raw input. `typecheckGtlProgram(...)` (`:12475`) produces inventory digests, an admitted plugin result-interface catalog, a requirements-algebra projection, a traversal-unit projection, pass/fail status, typed conformance issues, and coverage counts.

Inventory rows include: subject identity + ABI package version; expected/feature coverage manifest; **published graph-function catalog refs** (`catalogGraphFunctionRefs`, with `catalogGraphFunctionCount`/`publishedGraphFunctionCount`; conformance enforces published ⊆ catalog — this is a *typecheck-time* catalog, not a runtime discovery/query surface); graph functions and modules; a `materializedVectors` digest (`:851`); target carrier contracts; edge closure contracts; overlays + public start targets; prompt assets; plugin contracts; plugin result interfaces; source identity + authority policies; semantic review gates; same-object proofs; operator/evaluator/rule declarations; compute compositions + stage bindings; hook + selection boundaries; job/role bindings; external tool gates; runtime bindings; runtime re-entry routes; traversal bind conservation rows; requirements-algebra declaration bundles.

Conformance fails closed on unresolved graph functions, vectors, overlays, public starts, plugin contracts, runtime bindings, target carriers, edge closures, compute compositions, plugin result interfaces, conservation basis, and related closure predicates.

## Traversal Unit Definition

`TraversalUnit<A,B>` is a **conceptual** label (it appears only in prose/issue messages); the real projected type is `GtlProgramTraversalUnitProjectionRow` (`:879`, non-generic). The row binds: graph function; graph-vector **identity** (`graphVectorRef` `:886` + `graphVectorId`, **not** a numeric `vectorIndex` — that field lives on the internal `GraphVectorProjection`); source asset types; target asset type; target carrier contract; edge closure contract; selected compute composition; compute stage bindings; plugin result interfaces; consequence plugin result interfaces; conservation basis; intent lineage; materialization bindings; staged authority refs; requirement refs/spans/test relations/evidence policies; allowed consequence traversal catalog rows. A row is closeable only when target carrier, edge closure, compute composition, stage bindings, plugin result interfaces, consequence result interface, and conservation basis all resolve.

## Capability Catalog

GTL **can** declare: typed graph topology; graph vectors as typed transition boundaries; graph functions as reusable program carriers; sequential composition; substitution/refinement; recursion with explicit termination/foldback; fan-out/fan-in over explicit vector boundaries; gates over graph functions; symbolic carrier promotion; module publication; job/role work contracts; refinement boundaries + candidate families; selected compute composition; F_D/F_P/F_H role + authority bindings; prompt/asset surfaces; hook + plugin boundaries; plugin result interfaces; public start surfaces; graph overlay catalog rows; runtime binding rows; runtime re-entry route rows; traversal bind conservation rows; source identity + authority-policy rows; requirement terms/relations/spans/bundles/lifecycle compositions; program conformance inventories.

GTL **cannot**: execute programs; emit runtime events; admit payload/evidence truth; write ledgers; fold assurance; project residual truth as runtime authority; route continuation/re-entry; invoke F_P/F_H workers directly as product authority; make graph vectors public starts without graph-function/job/module publication; treat overlay rows as controllers; treat plugin outputs as admitted truth before ABG admission; treat query/read-model success as closure.

## Boundary Rules

1. GTL declares graph-program law. 2. ABG admits, executes, records, folds, projects, routes. 3. Products interpret admitted truth. 4. Graph functions are constructive carriers; read models/overlays are not substitute graph functions. 5. Public starts bind to graph functions, not bare vectors. 6. `C` notation is selected composition, not a runtime API. 7. Overlay rows are catalog/start metadata; overlay frames are ABG runtime contracts. 8. Plugin contracts are authority-denied by construction (literal-`false` types). 9. Requirement declarations are GTL authoring wrappers over ABG requirements algebra. 10. Closure is F_D-exclusive at the type level; F_P/F_H bindings cannot carry closure role/authority. 11. Downstream capability claims must pass `typecheckGtlProgram(...)` or an equivalent ABG admission path.

## Discoverability Note (open design question, not a code claim)

The conformance surface has a `catalogGraphFunctionRefs` inventory + a published⊆catalog check — but this is **typecheck-time** conformance, not a runtime-discoverable, queryable published-function catalog projected to consumers. The replay projection emits lifecycle/route/pressure/branch facts and a construction-time `construction_action_catalog_projected` event, but no published-graph-function inventory for downstream discovery. Distinguish: a downstream product **creating** graph functions (forbidden — no native `glc.*` carrier) vs the **system being discoverable** in a catalog the product can enumerate and compose over (legitimate, and required for lawful "GTL composition"). The latter discovery+compose surface is not currently exposed to consumers — flag as a design gap, not an implemented capability.

## Current Design Consequence

A complete GTL documentation surface should not define a separate textual grammar unless ratified and lowered to the carrier/API syntax above. The current complete definition is the carrier syntax plus ABG conformance/typecheck admission. Normalize "graph overlay" into four distinct terms — `program overlay row` (GTL conformance catalog/start metadata), `overlay frame` (ABG runtime observation/foldback contract), `zoom/refinement plan` (GTL graph substitution), `product overlay` (downstream read/policy interpretation) — to prevent the common failure mode where an overlay becomes a second traversal controller.
