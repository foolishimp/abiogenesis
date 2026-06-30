# Strategy: Node Types As Identity Graph Functions

Status: strategy commentary, not ratified specification
Version: 5 (structural selection guard, predicate-family wording)
Date: 2026-06-30
Project: Abiogenesis
Scope: GTL node typing, type-sensitive composition, conformance, publication, GTL/ABG admission

Revision history:
- v1 overclaimed current GTL law (composition as contract-based, asset reuse as field-free, refinement as existing substitution).
- v2 stated current law accurately and named every required change explicitly.
- v3 integrated the T-177 runtime registry but introduced two errors: it made type functions registry entries without a distinct entry kind (reopening callability via `graph_function_selected`), and it overstated predicate reuse as a direct call.
- v4 made the `node_type` entry kind distinct and scoped interchangeability and predicate framing, but left the callability closure dependent on well-formed lookups.
- v5 (this version) makes the closure structural: the selection emitter rejects any selected entry whose `entryKind !== "graph_function"` independent of the lookup. Also tightens wording — predicate *family* (not "same predicate"), and `CandidateFamily` over types is conformance enumeration, not runtime selection.

Filename note: the canonical version is the `Version` field above. The `_v2` filename suffix is historical and should not be treated as the version; future references should cite the `Version` field.

## Position

A node type is an identity graph function: a published `GraphFunction` whose interface declares a typed node contract and whose realization is identity. Transforming work is a non-identity graph function. Both are `GraphFunction` in carrier, and **comparable at the conformance boundary** — a type function's interface and a transforming function's interface can be compared as contracts. They are **not interchangeable in callable slots**: a non-callable type function cannot stand in for a transforming function in a job, public start, registry selection, or invocation. Interchangeability holds for conformance/typing, not for work.

This is leaner than a parallel `NodeTypeProfile` carrier, but it is not free. It requires a precise set of new law, listed below. The largest piece is type-sensitive composition. That capability is not a from-scratch change to the composition core: the contract-matching primitive it needs already exists, in a registry-specific form, as the T-177 runtime registry's eligibility-satisfaction predicate, which matches graph-function string refs name-independently and is differentially proven. Type composition does not call that predicate as-is; it requires extracting it into a predicate family over the common contract representation and generalizing it for subtype satisfaction. A type function is a distinct `node_type` registry entry kind. The catalog is built; this is one layer of abstraction over it, plus a predicate generalization at one site.

## Use Case

Downstream products are moving from interpreting ABG truth to declaring product-library graph functions over lifecycle node types. odd_glc will declare `Requirement`, `Evidence`, `Disposition`, `LifecycleStage`, `ReviewDocument`, `TypescriptServiceModule`. odd_sdlc will specialize them.

Without a reusable published node type, each product must inline the full node contract per node, or carry type meaning in product-local convention. Both accrete weight in the wrong layer. The goal is to declare a node type once in GTL, reference it from many nodes, and compose graph functions over typed endpoints by contract, keeping products thin. Type law belongs in GTL.

## What Current GTL Law Provides

Stated accurately, so the delta is honest.

- One structural type. `Graph`/`Node` is the single structural type. A graph function's interface (`EnvRef.requires/provides/carries`) is nodes. Node types and function interfaces share the node-contract representation. (`REQ-L-GTL3-INTERFACE-001`.)
- Interface is a role over nodes, not a rival type. (`INTERFACE-001`.)
- Interface-equivalent graph functions are interchangeable at the contract boundary. (`INTERFACE-005`.)
- Composition is interface satisfaction, realized as **name-keyed binding**. `requireCompatibleNodes` (algebra/core.ts:494) resolves each required node by `node.name` in the available set, then requires exact `nodeContractKey` equality. `nodeContractKey` (carriers.ts:200) is `{name, schema, markov, assetSurface}` and **includes name**. Consequence: two nodes that satisfy the same type but carry different names do not compose today.
- Substitution preserves the outer contract **exactly**. (`INTERFACE-006`: a realized inline graph preserves the declared outer interface exactly.) There is no subtype/strengthening law.
- `GraphFunction` is `{name, environment, inputs, outputs, template, effects, declarations, tags, id}` — **no `role` field**. `Role` is a separate semantic capability carrier, not a graph-function classifier. (`REQ-L-GTL3-ROLE`.)
- `Node` is `{name, schema, markov, assetSurface, tags, id}` — **no binding surface to a type function**.
- A published graph function bound by a `Job`/`ContractRef` is the callable work-entry surface. (`REQ-L-GTL3-GRAPHFUNCTION`, `REQ-L-GTL3-JOB`, `REQ-R-ABG3-BINDING`.) Nothing currently makes a graph function non-callable.
- The runtime graph-function registry (T-177) already admits library entries and runs an eligibility-satisfaction predicate that matches entries name-independently over interface, source contract, target contract, context, authority, overlay, namespace, version, provenance, readiness, proof, and policy. That predicate is differentially proven (each field rejects independently). It is the contract-matching primitive type composition needs. It currently expresses field matching as equality/presence, not subtype satisfaction.

## Required New Law

The design needs each of these ratified. None is free from current law.

### 1. The `node_type` marker (new declaration, not a role)

A type function is a `GraphFunction` carrying a `node_type` marker in its existing `declarations` surface (`SerializedAttrs`), structurally validated: `inputs === outputs === [N]`, identity template, `effects: []`. It is not a `Role`. This adds a declared marker, not a new carrier and not a `GraphFunction` field; the realization validates the marker against the structural shape.

### 2. Non-callable exclusion, including the registry selection path (new constraint)

A type function shall be **non-job-bindable, non-public-startable, non-selectable, and non-executable**. The exclusion must cover four callable surfaces, not three:

- `Job`/`ContractRef` binding and public-start declaration reject a `node_type` graph function;
- ABG never opens a graph call on a type function;
- the runtime registry never returns a type function as an executable candidate.

The registry surface is the one v3 missed. Because a type function is a registry entry, it would otherwise be eligible for `graph_function_selected` and invocation. A type function is registered under a distinct **`node_type` entry kind**, and executable lookup (`entryKinds: ["graph_function"]`) excludes it through the proven entry-kind filter (entry-kind separation of `graph_function` from `overlay` is already differentially proven).

The lookup filter is necessary but not sufficient. Current selection (`selectGraphFunctionFromRegistry`) trusts `lookupResult.eligibleCandidateRefs` and performs no `entryKind` check before emitting `graph_function_selected`, so a malformed or hostile lookup built for `node_type` could still drive a graph-function selection. The closure must therefore be **structural at the emitter, not lookup-dependent**: `graph_function_selected` emission and invocation selection shall reject any selected entry whose `entryKind !== "graph_function"`, independent of the lookup request. With both the entry-kind lookup filter and the emitter guard, a `node_type` entry can never become a selection or invocation, regardless of how the lookup was built. This makes "not executed" true at the selection path, not only at job binding, and `node_type` is the natural home of the T-179 non-graph-function entry semantics.

### 3. Node-to-type binding surface (new field/declaration)

`Node` gains a lawful way to reference its type function — a `typeRef` field or a reserved declaration — so "a node binds to a type function" is representable in GTL rather than overloaded into `tags`/`schema`/prose. A node either binds a `typeRef` (and materializes its contract from the type) or declares its contract inline and is checked for satisfaction.

### 4. Type-sensitive composition (extract and generalize the eligibility predicate family)

This is the central new capability and the reason the proposal has value. GTL adopts type-function-sensitive composition. It is one layer of abstraction over the registry already built, plus a predicate generalization at one site — not a new composition core.

Phase distinction, kept explicit: composition is a GTL typecheck operation; registry lookup is an ABG runtime selection operation. They run at different phases and must not be merged. What they share is the catalog (publication and admission of entries) and the compatibility primitive (the satisfaction predicate). Composition shares the predicate family and the catalog; it does not become runtime selection.

The predicate is not reusable as-is. The current registry eligibility predicate compares registry **string refs** (`interfaceRef === request.interfaceRef`, then set inclusion for context/authority/etc.). It does not accept `Node`, `AssetSurface`, `typeRef`, wiring declarations, or subtype refinement. So composition cannot call it directly. The design extracts the predicate into a **predicate family** over the common contract representation (registry string refs for runtime lookup; `Node`/`AssetSurface`/`typeRef` contracts for composition) and generalizes it from equality/presence to subtype satisfaction. One predicate family, two contract shapes, two phases.

The design separates wiring from typing and uses the extracted predicate:

- A node in an interface has a **port identity** (its label/role in this graph) and a **type** (its type function or inline contract). Today `name` conflates both; the new law distinguishes them.
- **Compatibility is the extracted satisfaction predicate, applied to endpoint types.** A binding from provided `P` to required `R` is lawful iff `P`'s type satisfies `R`'s type under the predicate — interchangeable (`INTERFACE-005`) or a lawful subtype (section 5). The comparison is name-independent. The predicate is extracted from the registry's eligibility logic and generalized, not invented from scratch.
- **Wiring** binds ports. The default wiring is name-coincidence, which preserves every program that composes today. Differently-named same-type ports compose through an **explicit wire declaration** (`provided_port -> required_port`), checked by the satisfaction predicate. An optional canonical auto-wire may bind when a required type is satisfied by exactly one provided node; ambiguity (multiple ports of one type) requires explicit wiring.
- `nodeContractKey` splits: a **type contract** (`{schema, markov, assetSurface}`, or a type-function ref) governs compatibility through the extracted predicate; **port identity** (`name`) governs wiring. `requireCompatibleNodes` resolves ports, then calls the extracted predicate over the type contract, not string-equal `nodeContractKey`.

So the realization change is bounded: `requireCompatibleNodes` swaps name-keyed exact-match for a call to the extracted-and-generalized predicate, and `nodeContractKey` splits port identity from type contract. The predicate's logic comes from the registry's eligibility filter; it is extracted into a shared family over the common contract representation and generalized for subtype, not invented and not called as-is.

Migration safety: a program whose composed ports already share names and exact contracts is the special case where name-coincidence wiring plus the satisfaction predicate succeeds exactly as today. The change is additive at the binding layer. The new capability is differently-named, same-type composition.

### 5. Subtype / refinement variance (new requirement language)

Current substitution preserves the outer contract exactly (`INTERFACE-006`); it is not a subtype rule. The registry eligibility predicate currently matches by field equality/presence, not subtype satisfaction. Reusable types need a variance law: a refined node type is a lawful subtype iff it preserves or strengthens the obligation contract and never weakens it — it may add a required context, tighten a proof obligation, or narrow an asset kind; it may not drop a required context, weaken an authority slot, or remove a proof obligation.

This is the soundness condition for type-sensitive composition, and it has one realization home: generalize the eligibility-satisfaction predicate from equality/presence to satisfaction (a candidate satisfies a requirement when its obligation set is a superset, not only an exact match). That generalization is small and lives in the one predicate already shared by registry lookup and composition. It is new law adjacent to substitution, not a reuse of it; exact-preservation substitution remains the law for non-type graph functions.

## Conformance

Two pure, fail-closed operations (new API):

- `materialize(typeRef, localRefinements) -> NodeContract`: a node declared by type reference adopts the type's contract plus lawful subtype refinements.
- `satisfies(node, typeRef) -> ConformanceResult`: a node declared inline is proven a subtype of the named type.

Conformance is interface satisfaction over the type contract: schema/markov compatible; required contexts resolvable and digest-stable; asset kind and obligations preserved or strengthened; standards/output/proof/constructor/renderer refs present where required; authority slots not weakened. Both fail closed on unresolved context, digest drift without declared version/re-entry authority, dropped or weakened obligation, or unresolvable type identity.

## ABG Interpretation Boundary

GTL declares type functions and conformance; ABG interprets and admits.

- Type functions are not executed (section 2). Identity realization is a conformance assertion, not a program. ABG checks conformance; it never runs a type.
- Conformance projection is admission-derived: admitted type satisfaction is a projection over admitted declarations, not a runtime invention.
- At traversal close, a `TraversalUnit<A, B>` output claiming to be `B` is admitted or rejected against the realized `B` type contract — context, asset, output, and proof obligations — reusing existing target-carrier certification, enriched by the type's obligations, not a name match.

### Typecheck versus admission split

- GTL typecheck (build time): type-function well-formed; node-to-type satisfaction; composition wiring and type compatibility; subtype lawfulness. GTL conformance failures.
- ABG admission (traversal time): output-claims-to-be-`B` certified against the realized `B` contract. ABG admission failures.

## Higher-Order Reuse

Because a type function is a `GraphFunction` (minus callability), node types inherit, subject to the non-callable exclusion:

- typing reference through a node `typeRef` (not `Job`/`ContractRef`, which §2 rejects for type functions);
- refinement through the new subtype law;
- type-alternative enumeration through `CandidateFamily` over compatible types (conformance enumeration, not runtime selection — type functions are non-callable);
- publication, admission, and conformance lookup through the runtime registry as a distinct `node_type` entry kind (excluded from executable lookup), and import through `Module`.

A type function is a registry library entry. This unifies the two threads: node types and program functions share one catalog, one admission path, and one compatibility predicate **family** (registry lookup at runtime over string refs, composition at typecheck over contract objects — same family, two contract shapes). A product declares its lifecycle types once and composes lifecycle programs over them through that one law and one path.

## Functional Purity

- Type functions are pure declarations, no effects, identity realization.
- `materialize`, `satisfies`, and type-compatibility are pure functions over immutable contracts, fail-closed.
- Composition remains a pure predicate over declared wiring and types.
- No mutable type registry; publication and conformance are admission and replay derived.
- ABG interprets; the declaration layer carries no execution authority. The non-callable exclusion keeps type functions out of the work surface entirely.

## Build Plan

Lawful re-entry above code, extending existing requirements and adding the named new law.

1. `requirement_reprice`:
   - `REQ-L-GTL3-INTERFACE`: type-sensitive composition (wiring vs typing; compatibility by type satisfaction); subtype variance as the soundness condition.
   - `REQ-L-GTL3-NODE`: the `typeRef` binding surface.
   - `REQ-L-GTL3-ASSET-SURFACE`: asset obligations as the conformance content of a node type.
   - `REQ-L-GTL3-GRAPHFUNCTION`: the `node_type` declaration marker; identity realization; the non-callable exclusion.
   - `REQ-L-GTL3-JOB`: jobs and public starts reject `node_type` graph functions.
   - `REQ-L-GTL3-MODULE`: type functions publish through the graph-function surface; one path.
   - `REQ-L-GTL3-CONTRACT-LAW-API`: `materialize`/`satisfies` and the failure taxonomy.
   - registry/eligibility (the T-177 capability-model and selection-boundary requirements): a type function is a distinct `node_type` library entry; the selection emitter structurally rejects any selected entry whose `entryKind !== "graph_function"` independent of the lookup; the eligibility-satisfaction predicate is the shared compatibility primitive and is generalized from equality to subtype satisfaction.
2. Design: the `node_type` marker and structural validation; the `typeRef` binding; the wiring/typing split in composition; `nodeContractKey` split (type contract vs port identity); the eligibility-predicate generalization to subtype satisfaction; type functions as registry library entries; conformance projection; the typecheck/admission split.
3. Realization: the marker and validation; the `Node.typeRef` surface; add the `node_type` registry entry kind, exclude it from executable lookup, and add the structural selection-emitter guard that rejects `entryKind !== "graph_function"` before emitting `graph_function_selected`; extract the eligibility predicate into a family over the common contract representation and generalize it from equality to subtype satisfaction (the one shared site); rewrite `requireCompatibleNodes` to wire ports and call the extracted predicate; split `nodeContractKey`; pure `satisfies`/`materialize`; publish type functions as `node_type` entries; wire into `typecheckGtlProgram`; tests including differently-named same-type composition, a weakening-refinement rejection, a job-binding rejection, a `graph_function` lookup that does not return a `node_type` entry, and a `node_type` entry forced into a lookup result that is rejected at selection.
4. Steel thread: `ReviewDocument` and `TypescriptServiceModule` as identity type functions, and a transforming function `implement_reviewed_module` composing over them with differently-named ports. The proof shows a generic code node cannot satisfy `TypescriptServiceModule`, that same-type different-name endpoints compose, and that ABG admits the closing output against the realized target contract.

## Non-Goals And Risks

- Not a rival structural type. Node types reuse the node contract and interface law.
- Not callable. The non-callable exclusion is required law, not an assertion.
- No mutable type registry. Publication and conformance are admission and replay derived.
- No forked publication. Type functions and program functions share one path.
- Composition change is bounded, not a core rewrite. It extracts and generalizes the registry eligibility predicate family and splits `nodeContractKey`. It is migration-safe (name-coincidence wiring plus the satisfaction predicate subsumes today's exact-match), but it touches every composition path and the registry predicate. The realization must prove existing programs still compose and existing registry lookups still match.
- Subtyping is new law, realized as one generalization of the eligibility predicate (equality to satisfaction). It does not weaken; it is adjacent to substitution, which keeps exact-preservation for non-type functions.
- Do not let composition collapse into runtime selection. They share the catalog and the predicate, not the phase. Composition is typecheck; registry lookup is runtime.

## Acceptance Questions

- Is the node-to-type binding a `Node.typeRef` field or a reserved declaration?
- Does composition support optional type-based auto-wiring when unambiguous, or is non-coincident wiring always explicit?
- Does a node satisfy exactly one type, or several as an intersection?
- Are required contexts referenced by name, URI/digest pair, or a dedicated `ContextRef`?
- How does type-function versioning interact with digest changes and lawful re-entry?
- A type function is a distinct `node_type` registry entry kind (decided; required to close callability at the selection path). Residual: how does `node_type` entry semantics align with the T-179 non-graph-function entry-semantics work, and do they share one entry-kind taxonomy?

## Recommended Next Step

Open a requirement and design tranche that ratifies node types as identity graph functions with type-sensitive composition. The tranche extends the interface, node, asset-surface, graph-function, job, module, and contract-law requirements, adds the non-callable exclusion and the subtype variance law, and proves the `ReviewDocument -> TypescriptServiceModule` steel thread including differently-named same-type composition. The result is one type-and-function surface, functionally pure, that lets downstream products declare lifecycle types once and compose lifecycle programs over them by contract.
