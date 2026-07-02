# Strategy: ABG Traversal Monad Domain And State Model

**Status**: strategy commentary, not ratified specification  
**Date**: 2026-07-02  
**Author**: Codex  
**Project**: Abiogenesis  
**Scope**: GTL configuration, ABG startup, registry selection, graph-call opening, graph-vector traversal, instruction assembly, regime effects, admission, fold, continuation, replay, and downstream interpretation

## Correction

The monad is the **ABG traversal monad**, not an execution monad.

Execution is one possible effect inside traversal. Traversal is the governing
state transition model that binds graph-function selection, graph-call opening,
vector movement, frame/span lineage, instruction assembly, worker/tool effects,
admission, fold, continuation, re-entry, replay, and downstream interpretation.

The earlier "execution monad" phrasing is too broad and misleading. It makes
process execution sound like the primary carrier. The primary carrier is
traversal over admitted GTL graph structure.

## Programming Abstraction Correction

The current design language had inverted ordinary programming abstractions.
The corrected mapping is:

| Programming abstraction | GTL/ABG surface | Meaning |
| --- | --- | --- |
| library function | `GraphFunction` | reusable, published, bindable workflow function with an outer contract |
| program | graph overlay / GTL program composition | composition that binds graph functions, vectors, node types, starts, roles, security, policies, proof obligations, and plugin/result contracts |
| program instance | admitted startup binding | selected program plus version, library, policy, plugin, and workspace refs |
| mutable program surface | workspace | files, inputs, observed state, generated artifacts, local config, and run archive |
| runtime | ABG traversal | event-sourced bind over admitted program and workspace truth |

This does not weaken `GraphFunction`. It makes its role more precise.
`GraphFunction` is the reusable library-function abstraction. A graph overlay
or GTL program composition is the program that uses those functions. The
workspace supplies bootstrap config and mutable state, but it does not own
program authority, traversal state, function selection, or closure truth.

## Claim

ABG is the event-sourced traversal monad over admitted GTL program
composition.

It takes GTL declarations and product startup configuration, then produces
governed traversal truth:

```text
GTL graph-function libraries and graph overlay/program declarations
  -> ABG startup admission
  -> registry projection and graph-function selection
  -> graph call opening
  -> frame/span/vector traversal
  -> instruction assembly
  -> F_D/F_P/F_H effects where required
  -> payload/evidence admission
  -> assurance fold/residual/disposition
  -> continuation/re-entry/block/terminal transition
  -> replay-derived projection
```

The monadic unit is:

```text
TraversalUnit<A, B>
```

where `A` and `B` are not arbitrary code inputs and outputs. They are admitted
carrier sets at the selected graph-vector boundary.

The bind is:

```text
bind(traversal_unit_result, admitted_consequence)
  -> next_lawful_traversal_state
```

not:

```text
plugin returns next step
test harness calls next vector
product shell loops until done
```

ABG owns the bind. Plugins, workers, products, and test harnesses may provide
declared inputs, effects, or admitted evidence, but they do not own traversal
state.

## Why This Matters

The odd_glc slot-map confusion exposed this gap.

odd_glc already has the right primitives:

- GTL graph overlay as the program;
- named graph functions as library entries;
- named graph vectors;
- node types;
- product library entries;
- startup config;
- ABG registry, selection, graph-call, traversal, replay.

A separate lifecycle slot map appeared because the traversal monad was not
explicit enough. It was unclear where lifecycle role, source/target type,
policy, proof obligation, response contract, read projection, and execution
evidence attach.

They attach to the traversal structure:

```text
graph overlay/program / GraphFunction / GraphVector / Node.typeRef / AssetSurface
```

and are admitted/projected by ABG during traversal.

A product-local slot map is at most a derived index over those declarations and
replay facts. It is not a monadic state surface.

## What "Traversal Monad" Means Here

In this project, "traversal monad" means:

1. a governed traversal unit;
2. explicit traversal state threaded through each step;
3. controlled effects inside traversal;
4. lawful bind points between traversal units;
5. replayable event truth for accepted transitions;
6. no product-local traversal loop or side-channel truth.

The traversal unit is one closeable graph-vector boundary under a selected
published graph function:

```text
TraversalUnit<A, B> = {
  selectedGraphFunction,
  selectedGraphVector<A, B>,
  sourceCarrierSet: A,
  targetCarrierContract: B,
  regimeBindingSet,
  instructionEnvelope,
  admittedAttemptTruth,
  assuranceFold,
  residualPressure,
  disposition,
  continuation
}
```

That is the unit ABG binds, re-enters, repeats, blocks, yields, or closes.

## Domain Model

### 1. GTL Declaration Domain

GTL declares traversal shape.

| Surface | Traversal role |
| --- | --- |
| `Module` | publication boundary |
| `Graph` | named topology of nodes and vectors |
| `Node` | typed local locus of meaning |
| `Node.typeRef` | reusable type identity and contract binding |
| `GraphVector` | internal transition contract from source carrier set to target carrier set |
| `GraphFunction` | published reusable traversal library function / callable work contract |
| `Graph overlay` | program composition that binds graph functions, vectors, node types, starts, roles, security, policies, proof obligations, and plugin/result contracts |
| `AssetSurface` | output contract, proof obligation, renderer, authority, and context surface |
| `Operator` | declared effect capability |
| `Evaluator` | declared convergence or attestation capability |
| `Rule` | declared deterministic or policy constraint |
| `Role` / `Job` | public work contract over published graph functions |
| startup config | product-declared library, overlay/program, plugin, policy, workspace, and public-start refs |
| workspace binding | mutable instance surface: bootstrap config, files, data, observed state, artifacts, and run archive |

In ordinary programming terms, graph functions are the library functions, the
overlay is the program, and the workspace is the mutable program instance
surface. Graph vectors are internal program edges. A downstream product should
not introduce a second naming surface for those positions.

### 2. ABG Admission And Registry Domain

ABG admits declarations into runtime-eligible traversal truth.

| Surface | Traversal role |
| --- | --- |
| `registry_entry_admitted` | GTL library entry becomes admitted registry truth |
| `registry_lookup_result` | eligible candidates projected from admitted registry truth |
| `registry_plugin_advice_admitted` | product/plugin advice admitted as advisory input |
| `graph_function_selected` | ABG-owned selected library-function binding |
| `graph_call_opened` | ABG-owned runtime call over selected graph function |

Selection is traversal truth. It is not a product/plugin choice.

### 3. Traversal Basis Domain

Once ABG opens a graph call, traversal proceeds over a basis.

| Surface | Meaning |
| --- | --- |
| `ExecutionBasis` | selected graph-function materialization basis |
| `GraphCall` | runtime attempt to traverse selected graph function |
| frame / zoom / span | scoped traversal and recursive lineage truth |
| vector cursor | current graph-vector boundary |
| carried context | admitted context, requirement, payload, evidence, and lineage refs |
| `RegimeBindingSet` | selected `F_D`/`F_P`/`F_H` composition bindings |
| instruction envelope | compiled and bound prompt/work envelope for the current vector |

This basis is the state carrier that prevents tests or products from calling
individual vectors directly and mistaking that for traversal.

### 4. Effect Domain Inside Traversal

Effects are inside traversal. They do not define traversal.

| Effect | Role |
| --- | --- |
| deterministic check | `F_D` total function over known algebra/admitted inputs |
| LLM/agent construction or judgment | `F_P` effect producing candidate/evidence until admitted |
| human decision | `F_H` effect admitted through governed decision boundary |
| process/tool execution | actor/operator effect admitted as payload/evidence |
| renderer execution | ABG-owned or governed rendering effect over immutable envelope |

`F_D` is valid only over a known algebra or total function. If semantic
ambiguity exists, `F_P` may produce evidence that later feeds an `F_D`
conformance check, but `F_D` does not become semantic judgment by name alone.

This is why the semantic compiler can itself be a traversal:

```text
F_P may propose or review task wording and policy content
F_D validates relevance, compression, proportionality, type coverage,
    authority coverage, non-tautology, renderer safety, and response contract
ABG admits the compiled instruction plan
```

The compiler traversal produces admitted instruction-plan truth. Runtime
traversal then binds live refs into that plan.

### 5. Admission, Fold, And Continuation Domain

ABG-owned bind effects after a vector effect returns:

| Surface | Traversal role |
| --- | --- |
| payload admission | worker/tool output becomes admitted or rejected payload truth |
| evidence admission | execution/proof evidence becomes admitted or rejected evidence truth |
| requirement binding | admitted evidence binds to declared obligations |
| assurance fold | ABG folds admitted evidence against selected obligations |
| residual projection | unclosed pressure remains visible |
| disposition projection | close / continuation / re-entry / block / reprice truth |
| traversal transition | next vector, same-vector retry, child frame, re-entry, block, or terminal |

No product plugin writes these surfaces.

### 6. Replay And Interpretation Domain

Replay is the read side of traversal.

| Surface | Meaning |
| --- | --- |
| event log | append-only admitted traversal truth |
| replay projection | ABG-owned projection over event truth |
| query facade | downstream-public read-only query surface |
| downstream interpretation | product meaning over admitted ABG traversal truth |

Downstream products own interpretation, not traversal state.

## Traversal State Model

The traversal state can be modeled as:

```text
ABGTraversalState = {
  gtlDeclarationState,
  startupAdmissionState,
  registryProjectionState,
  selectionState,
  graphCallState,
  traversalBasisState,
  frameSpanState,
  vectorCursorState,
  carriedCarrierState,
  instructionAssemblyState,
  effectInvocationState,
  payloadEvidenceState,
  assuranceState,
  continuationState,
  replayProjectionState
}
```

Each row has one owner:

| State | Owner | Source truth |
| --- | --- | --- |
| `gtlDeclarationState` | GTL/product declaration | GTL module, graph, node, vector, graph-function library, overlay/program, startup declarations |
| `startupAdmissionState` | ABG | startup admission events |
| `registryProjectionState` | ABG | replay-derived registry entries |
| `selectionState` | ABG | selected library-function binding through `graph_function_selected` / rejected selection events |
| `graphCallState` | ABG | `graph_call_opened` |
| `traversalBasisState` | ABG | selected overlay/program, graph-call, and graph-function/vector basis |
| `frameSpanState` | ABG | frame, zoom, span, foldback, lineage events |
| `vectorCursorState` | ABG | vector planned/evaluated/closed events |
| `carriedCarrierState` | ABG | admitted context, payload, evidence, requirement, and lineage refs |
| `instructionAssemblyState` | ABG semantic compiler | compiled plan, manifest, digest, bound envelope |
| `effectInvocationState` | ABG transport/runtime | dispatch and actor invocation events |
| `payloadEvidenceState` | ABG | payload/evidence admission events |
| `assuranceState` | ABG | fold, residual, disposition events |
| `continuationState` | ABG | continuation, re-entry, block, terminal events |
| `replayProjectionState` | ABG query/projection | replay over event log |

If a downstream product owns a local state object that duplicates one of these
rows, it is probably crossing the traversal boundary.

## Traversal Transition Chain

| Step | Input | ABG transition | Output |
| --- | --- | --- | --- |
| 1 | product GTL declarations | admit startup/library declarations | admitted registry entries |
| 2 | registry entries + lookup request | filter traversal eligibility | lookup result |
| 3 | lookup result + admitted advice | select callable graph function | `graph_function_selected` |
| 4 | selected graph function | open graph call | `graph_call_opened` |
| 5 | graph call + traversal basis | plan vector traversal | `vector_traversal_planned` |
| 6 | selected vector + carrier state | compile/bind instruction envelope | prompt manifest or P0 no-dispatch |
| 7 | instruction/effect contract | invoke `F_D`, `F_P`, `F_H`, actor, or tool if needed | raw effect result |
| 8 | raw effect result | admit payload/evidence | admitted payload/evidence refs |
| 9 | admitted truth | fold assurance and residual | fold/residual/disposition |
| 10 | disposition | derive traversal transition | next vector, retry, re-entry, block, terminal |
| 11 | event log | replay projection | query/read model |
| 12 | query/read model | downstream interpretation | product/lifecycle meaning |

Only step 12 is downstream-owned. Steps 1 through 11 are GTL/ABG-owned or
ABG-admitted.

## Traversal Monad Laws

These are candidate requirement/design laws.

### Law 1: Declaration Before Traversal

ABG shall not traverse a graph function, graph vector, worker dispatch, or
plugin binding that is not rooted in admitted GTL configuration or ABG system
law.

### Law 2: Selection Before Graph Call

A graph call requires ABG-emitted selection truth. A product-local call path,
test-harness vector call, or direct plugin invocation is not traversal truth.

### Law 3: Vector Before Effect

Effects occur inside a selected vector boundary. A worker/tool run without
selected graph-function, graph-call, frame, vector, and carried-carrier truth is
not a traversal proof.

### Law 4: Instruction Before F_P Dispatch

F_P dispatch requires an admitted or runtime-bound instruction envelope whose
source trace, relevance, compression, proportionality, authority coverage,
response contract, and non-tautology checks have passed.

### Law 5: Admission Before Projection

Worker/tool output is not traversal truth until ABG admits it. Projection and
fold operate over admitted payload/evidence truth, not raw worker text.

### Law 6: Fold Before Closure

Closure is a fold/disposition result over admitted evidence and carried
obligation truth. Command success, worker success, response shape, or prompt
claim cannot close by itself.

### Law 7: Consequence Bind Is ABG-Owned

Plugins may propose consequence. ABG owns admission, transition derivation,
continuation, re-entry, block, and terminal replay.

### Law 8: Replay Is The Read Side

Queries and downstream interpretations shall read from replay/projection truth.
They shall not invent fold, residual, disposition, or traversal state.

### Law 9: Derived Indexes Are Not Traversal State

Catalog views, slot maps, lifecycle maps, dashboards, and parity matrices may
exist as derived indexes. They shall not become rival traversal state,
selection authority, or source truth.

## Why This Resolves The Slot-Map Confusion

If graph functions are reusable library functions, and the graph overlay is
the program that binds them, then role meaning belongs on the admitted
overlay/program plus the GTL graph-function/vector declarations it references.

```text
graph-function://odd_glc/software-build/sdlc-software-build
  source type: lifecycle context
  target type: test execution evidence
  internal graph vectors:
    conformance -> design -> source -> test design -> test source
    -> execution plan -> execution result
  policy refs
  proof obligation refs
  output contract refs
```

The graph overlay is the program. It composes and binds those library
functions and named vectors into a governed route. ABG admits the program
declarations, selects callable graph functions, opens graph calls, traverses
vectors, and emits replay truth. odd_glc interprets those facts as lifecycle
state.

A lifecycle slot map can be useful only as:

```text
derived index = project(overlay graph + graph-function/vector declarations)
```

It should not be authored as a separate source authority.

## Implications For odd_glc

odd_glc should express lifecycle and software-build/data-mapper meaning
through:

- GTL node-type declarations;
- GTL graph-function library declarations;
- GTL graph overlay/program declarations;
- product library entries;
- startup config consumed by ABG;
- data-only policy refs;
- read-only interpretation over ABG replay/query truth.

odd_glc should not define a local lifecycle slot registry that competes with
graph-function/vector identity. If a local index remains for ergonomics, it
must be generated from or mechanically checked against the overlay and
graph-function declarations.

## Gaps This Post Surfaces

1. **Traversal monad documentation gap**  
   PRODUCT and INTENT contain the monad statement, but the practical traversal
   domain/state model is not yet one focused design surface.

2. **Derived-index law gap**  
   The method should distinguish generated indexes over GTL/ABG traversal truth
   from source authority. This is the slot-map failure mode.

3. **Library/program/workspace abstraction gap**  
   GTL and ABG should make it explicit that graph functions are reusable
   library functions, overlays are programs, workspaces are mutable instance
   surfaces, and ABG traversal is the runtime bind over the admitted program
   and workspace. Lifecycle/domain role refs, policy refs, proof refs, output
   contracts, and read-model refs attach to the overlay/program and its
   referenced graph functions, graph vectors, node types, and asset surfaces,
   not to a product-local parallel registry.

4. **Traversal-state naming gap**  
   ABG needs a compact domain/state diagram that names each state row above and
   its owner. This would make local shells, direct vector calls, and duplicate
   ledgers easier to spot.

5. **Event-time and duration projection gap**  
   Runtime events should carry creation time as event truth. Vector duration
   and dispatch duration should be replay-derived from event time and actor
   invocation facts, not inferred from test harness wall-clock labels.

## Proposed Successor Work

Open a focused ABG/GTL ticket to ratify and implement the traversal monad
domain/state model.

Suggested scope:

1. Add a requirement anchor for the ABG traversal monad state model.
2. Add a design document with the domain model, state tuple, state transition
   table, owner matrix, and event kinds.
3. Update GTL/ABG docs so graph functions are library functions, graph overlays
   are programs, workspaces are mutable instance surfaces, and slot maps or
   catalogs are either published GTL declarations or replay-derived indexes.
4. Add negative tests that a product-local slot map, prompt shell, direct
   vector call, local selection, or local ledger cannot masquerade as ABG
   traversal truth.
5. Add a positive proof through installed startup:

   ```text
   product GTL config
     -> ABG registry
     -> selection
     -> graph call
     -> vector traversal
     -> instruction assembly
     -> worker/effect dispatch
     -> admission
     -> fold/disposition
     -> replay
   ```

6. Require replay-derived timing for vector traversal and worker/effect
   dispatch.

## Bottom Line

The monad is the ABG traversal monad over admitted GTL program composition.

Execution is an effect inside traversal. Graph functions are reusable library
functions. The graph overlay is the program. The workspace is the mutable
program instance surface. The missing artifact is a clear domain/state model
showing how GTL program configuration and workspace binding become ABG
traversal state, how ABG bind points admit effects into event truth, and how
downstream products interpret replay without owning traversal state.
