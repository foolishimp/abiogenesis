# Strategy: Node Types As Identity Graph Functions

Status: strategy commentary, not ratified specification
Date: 2026-06-30
Project: Abiogenesis
Scope: GTL node typing, conformance, composition, publication, and the GTL/ABG admission boundary

## Position

A node type is an identity graph function.

GTL needs reusable, published node types so downstream products declare type law once and compose over typed endpoints. The correct mechanism is the one GTL already has: the graph-function carrier and the interface law. A node type is the identity morphism on its own contract — a graph function whose interface declares the typed node contract and whose realization is identity. Transforming work is a non-identity graph function. Both are `GraphFunction`. They are interchangeable at the contract boundary and distinct only in realization content.

This adds a publication boundary, not a second type theory.

## Use Case

Downstream products are about to move from interpreting ABG truth to declaring product-library graph functions over lifecycle node types. odd_glc will declare `Requirement`, `Evidence`, `Disposition`, `LifecycleStage`, `ReviewDocument`, `TypescriptServiceModule`, and similar typed loci. odd_sdlc will specialize them.

Without a reusable published node type, each product has two unlawful options:

- inline the full node contract (schema, markov, asset surface, required contexts, standards, output contracts, proof obligations) on every node — non-reusable duplication that grows with scale;
- carry the type meaning in product-local convention, prompt prose, or parser tables — type law outside GTL, which the boundary forbids.

Both accrete weight that must later be refactored out of the wrong layer. The leanness goal is direct: declare a node type once in GTL, reference it from many nodes, compose graph functions over typed endpoints with contract-level handoff, and keep products thin. Type law belongs in GTL; products stay implementations of it.

## Justification For The Mechanism

GTL has already drawn the boundary this design needs.

- One structural type. `Graph`/`Node` is the single first-class structural type. A graph function's interface (`EnvRef.requires/provides/carries`) is expressed in nodes. Node types and function interfaces share one representation: the node contract.
- Interface is a role, not a rival type. `REQ-L-GTL3-INTERFACE-001`: inputs and outputs are graph roles over nodes, not a rival structural type. A new node-type carrier with its own vocabulary would violate this.
- Interface-equivalence is interchangeability. `REQ-L-GTL3-INTERFACE-005`: interface-equivalent graph functions are interchangeable at the contract boundary. This is the interchangeability of types and functions, already ratified, scoped to the contract boundary.
- Composition is interface satisfaction. `REQ-L-GTL3-INTERFACE-002`: composition is lawful only when the outputs of the first boundary satisfy the inputs of the second. Type composition and function composition are one law.
- Identity is already realized. `identity(...)` and `graphFunctionForVector(...)` construct the identity and lifting morphisms. The object-as-identity-morphism bridge exists.
- Node contract identity already includes the asset surface. `nodeContractKey` is `{schema, markov, assetSurface}`, and `AssetSurface` already carries `requiredContexts`, `standardsRefs`, `outputContractRefs`, `constructorRefs`, `rendererRefs`, `sectionKindRefs`, `clauseKindRefs`, `authoritySlots`, `proofObligationRefs`.

So the type structure exists. The missing element is a publication boundary for it. Expressing a node type as an identity graph function supplies that boundary while inheriting interface satisfaction, composition, interchangeability, refinement, and module publication unchanged.

## The Category

The model is a category, and the design names its parts in the existing carriers.

- Objects are node contracts.
- Morphisms are graph functions `A -> B`.
- Identity morphisms are node types: identity graph functions that carry a contract to itself.
- Composition is interface satisfaction at the shared endpoint (`INTERFACE-002`).
- Interchangeability holds at the contract boundary (`INTERFACE-005`).

Type and function are one notion at the interface layer and diverge only in realization content. A node type has no transformation content; a transforming function does. The boundary between them is identity versus transformation. Crossing it — making a type executable, or admitting a function as a type without going through its interface — collapses the constraint/transform distinction and reintroduces a rival type. The design holds the line by keeping node types in the identity sub-category.

## Design

### 1. The type function

A node type is published as a `GraphFunction` with:

- `inputs === outputs === [N]`, the typed node;
- `template`: identity over `N`;
- `effects: []`;
- a declared role marking conformance intent (`role: node_type`), so tooling recognizes a type function without relying only on structural inference;
- `environment` (`EnvRef`) whose carried node carries the full conformance contract through its `AssetSurface`.

No new fields and no new carrier. The typed node's existing contract is the type. A type function named `ReviewDocument` is the identity graph function on a node whose `schema` is `schema://review/document` and whose `assetSurface` binds the review template, rubric, posting-guide, section/clause model, output contract, and proof obligations as digest-addressed context.

### 2. Conformance

Two pure, fail-closed operations:

- `materialize(typeFunctionRef, localRefinements) -> NodeContract`: a node declared concisely by type reference adopts the type's contract plus lawful local refinements.
- `satisfies(node, typeFunctionRef) -> ConformanceResult`: a node declared inline is proven to satisfy a named type function.

Conformance is interface satisfaction (`INTERFACE-002`, `INTERFACE-004`): schema/markov compatible; required contexts resolvable and digest-stable; asset kind and obligations preserved; standards, output, proof, constructor, renderer refs present where required; authority slots not weakened. Both operations fail closed on unresolved context, digest drift without declared version/re-entry authority, dropped obligation, weakened authority, or unresolvable type identity.

### 3. Typed boundary and composition

A vector `A -> B` is typed when the `A` and `B` node contracts satisfy their type functions and the vector operators, evaluators, contexts, and rule are compatible with those contracts.

`compose(F: A -> B, G: B -> C)` is lawful when `F`'s provided `B` contract satisfies `G`'s required `B` contract: the same type function at `B`, or a declared lawful refinement. Composition compares contracts (type functions), never node names. The type function gives the algebra a reusable contract object to compare, materialize, and project. This is where type composition becomes operational: the intermediate type is the only lawful handoff between composed vectors.

### 4. Refinement and variance

Type refinement reuses graph-function substitution (`INTERFACE-003`: a refined inner graph preserves the declared outer contract). The soundness condition for type composition is subtype variance: a refined node type shall preserve or strengthen the obligation contract and never weaken it. A refinement may add required contexts, tighten proof obligations, or narrow asset kinds; it may not drop a required context, weaken an authority slot, or remove a proof obligation. This makes refinement a lawful subtype and keeps composition sound.

### 5. Higher-order reuse

Because a type function is a graph function, node types inherit the full function-side machinery with no new carriers:

- referenceable through `ContractRef` (a node or job references its type);
- refinable through `RefinementBoundary` (lawful type refinement);
- selectable through `CandidateFamily` (a family of compatible types);
- publishable and importable through `Module`.

This is the leanness payoff. A product declares its lifecycle types as identity functions and composes its lifecycle programs over them through one law, reusing one publication path.

### 6. Publication

Type functions publish through the existing `Module` graph-function surface — one publication boundary, not two. A derived type view may project the identity-role functions for discovery, but the carrier and the publication path are the graph-function carrier and path. Type law is never hidden in prompt prose, product-local parser tables, test-only inventory, renderer templates, or runtime-local config.

If the runtime graph-function registry admits library entries, a type function is a candidate library entry kind, so node types and program functions share one declaration-to-admission path rather than forking a parallel mechanism.

### 7. ABG interpretation boundary

GTL declares type functions and conformance; ABG interprets and admits.

- Type functions are not executed. Identity realization is a conformance assertion, not a program. ABG never runs a type; it checks conformance.
- Conformance projection is admission-derived: admitted type satisfaction is a projection over admitted declarations, not a runtime invention.
- At traversal close, a `TraversalUnit<A, B>` output claiming to be `B` is admitted or rejected against the realized `B` node contract — the type function's interface, including its context, asset, output, and proof obligations — not a name match. This reuses existing target-carrier certification, enriched by the type's obligations.

### 8. Typecheck versus admission split

- GTL typecheck, at build time: type-function publication well-formed; node-to-type satisfaction; composition compatibility; refinement subtype lawfulness. These are GTL conformance failures.
- ABG admission, at traversal time: output-claims-to-be-`B` certified against the realized `B` contract. These are ABG admission failures.

The split attributes each failure to the right authority.

## Functional Purity

The design preserves GTL's established functional foundation.

- Type functions are pure declarations with no effects and identity realization.
- `materialize` and `satisfies` are pure functions over immutable contracts, contract in and contract or result out, fail-closed.
- Conformance is a pure predicate; refinement is a pure subtype relation.
- There is no mutable type registry. Publication and conformance projection are admission and replay derived, consistent with runtime registry law.
- ABG interprets; the declaration layer carries no execution authority.

Nothing here introduces imperative orchestration, hidden state, or a second evaluation surface. Node typing remains declaration plus pure conformance.

## Build Plan

Lawful re-entry begins above code because this ratifies a GTL language commitment, then extends existing requirements rather than inventing new type law.

1. `requirement_reprice`: ratify that node types are identity graph functions and conformance is interface satisfaction. Extend:
   - `REQ-L-GTL3-INTERFACE`: a published identity interface is a node type; conformance is interface satisfaction; `INTERFACE-005` governs type interchangeability; refinement subtype variance is a soundness condition.
   - `REQ-L-GTL3-NODE`: a node may bind to a type function or satisfy one inline.
   - `REQ-L-GTL3-ASSET-SURFACE`: asset obligations are the conformance content of a node type.
   - `REQ-L-GTL3-GRAPHFUNCTION`: the `node_type` role and identity realization; a type function is not executed.
   - `REQ-L-GTL3-MODULE`: type functions publish through the graph-function surface; one path.
   - `REQ-L-GTL3-CONTRACT-LAW-API`: the `materialize` and `satisfies` operations and their failure taxonomy.
2. Design: the `node_type` role marker and its structural validation; `materialize`/`satisfies` semantics; composition compatibility; refinement subtype check; conformance projection; the typecheck/admission split; the registry-entry relationship.
3. Realization: the `node_type` role on `GraphFunction`; a constructor that builds a type function from a node contract; pure `satisfies`/`materialize`; conformance wired into `typecheckGtlProgram`; composition compatibility in the algebra; focused tests including negative conformance and a weakening-refinement rejection.
4. Steel thread: `ReviewDocument` and `TypescriptServiceModule` as identity type functions, and a transforming graph function `implement_reviewed_module` composing over them. The proof shows a generic code node cannot satisfy `TypescriptServiceModule` when its profile requires a declared stack, standard, package surface, test regime, and proof contract, and that ABG admits the closing output against the realized target contract. The purpose is generic lifecycle composition at arbitrary scale, not a hello-world scenario.

## Non-Goals And Risks

- Not a rival structural type. Node types reuse the node contract and interface law.
- Not executable. Identity realization is conformance, not a program.
- No second composition law. Composition is `INTERFACE-002` over type functions.
- No mutable type registry. Publication and conformance are admission and replay derived.
- No forked publication. Type functions and program functions share one path.
- No renderer or template outranking a typed declaration. Rendered output is a view.
- No weakening refinement. A refined node type is a subtype that preserves or strengthens obligations.

## Acceptance Questions

- Is the `node_type` role a declared marker validated structurally (`inputs === outputs`, identity template, no effects), or inferred structurally alone? Recommend a declared marker, structurally validated.
- Does a node satisfy exactly one type function, or several as an intersection of contracts?
- Are required contexts referenced by `Context.name`, URI/digest pair, or a dedicated `ContextRef` carrier?
- How does type-function versioning interact with digest changes and lawful re-entry?
- Is a type function a runtime registry library entry, unifying with the graph-function registry, or `Module`-only for now?
- Are conformance failures partitioned cleanly between GTL typecheck and ABG admission as specified?

## Recommended Next Step

Open a small requirement and design tranche that ratifies node types as identity graph functions and proves the `ReviewDocument -> TypescriptServiceModule` steel thread. The tranche extends the interface, node, asset-surface, graph-function, module, and contract-law requirements; it does not invent a parallel type system. The result is one type-and-function surface, functionally pure, that lets downstream products declare lifecycle types once and compose lifecycle programs over them without product-local convention.
