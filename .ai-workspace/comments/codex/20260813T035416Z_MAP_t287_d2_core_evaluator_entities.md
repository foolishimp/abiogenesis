# T-287 D2 Core Evaluator Entity Map

**Recorded:** 2026-08-13 13:54 AEST  
**Checkpoint:** `39a714d4375b9f8ba40cdb4792c13da2a721042b`  
**Checkpoint tree:** `1bfb35a0ac85e8a8132d4cca47149efe66b57acb`  
**Status:** Moving D2 checkpoint; not an accepted candidate  
**Classification:** Commentary map; not Product, requirement, design, ticket, or implementation authority

## Purpose

This post expands the plan row:

> D2 Core evaluator — In progress — Main locus loop and structural descent now use stack-safe `Effect.suspend`; build/typecheck and focused HoG tests 5/5.

It identifies the functional entities involved, their owners, their roles in the direct evaluator, their current realization state, and the D2 boundary. It does not authorize new functionality or change the accepted realization.

## D2 functional boundary

D2 establishes one stack-safe direct evaluator:

```text
admitted GTL Program
+ exact execution basis
+ admitted runtime prefix
        |
        v
resolve current GTL term
        |
        v
descend structural terms
        |
        v
select exact owner at compute locus
        |
        v
owner proposes result or transition
        |
        v
ABG admits runtime facts
        |
        v
derive next cursor
        |
        v
recurse, hold, refuse, or close
```

The evaluator does not own GTL topology, Product selection, implementation meaning, runtime admission, Event Calculus truth, or replay. It composes their exact owner relations.

## 1. GTL entities being evaluated

| Entity | Functional meaning | Evaluator normal form | Current state |
|---|---|---|---|
| `C.of` | One executable or interactive leaf | `Leaf(ownerPort)` | Established |
| `C.id` | Return the input unchanged | `Identity` | Established |
| `C.compose` | Evaluate ordered terms, feeding each result into the next | `Bind` | Established |
| `C.edge` | Transform, evaluate, then consequence | Derived `Bind` of three leaves | Established; later contraction |
| `workflow.C` | Invoke another named GraphFunction | Recursive `Call` | Established |
| `C.batch` | Evaluate an ordered task collection | Derived collection traversal plus ABG fan-out/join | Established; later contraction |
| `C.retry` | Re-evaluate one term within its declared budget | Suspended bounded evaluation | Established; later contraction |
| `F_D` | Deterministic executable leaf | Exact admitted implementation owner | Established |
| `F_P` | Probabilistic executable leaf | Exact implementation plus actor/process evidence | Established |
| `F_H` | Human or interactive locus | Durable hold and later resume; never locally executed | Established |

Source: `build_tenants/abiogenesis/typescript/code/src/gtl/c_algebra.ts`.

The seven declared constructors reduce to four primitive evaluator relations:

```text
Identity
Leaf
Bind
Recursive Call
```

`edge`, `batch`, `retry`, graph recursion, fan-out, consensus, hold, resume, continuation and foldback are compositions over those relations. Their remaining special-purpose machinery is contraction work, not permission to add evaluator primitives.

### 1.1 GTL carrier entities

| Entity | Role |
|---|---|
| `ComputeRegime` | Declares `F_D`, `F_P`, or `F_H`; Effect does not select the regime |
| `ExecutableLeafRequirement` | Declares the exact binding and input/output/evidence/failure/refusal/judgment contracts |
| `InteractionLeafRequirement` | Declares the exact interaction kind, actor capability and request/response/continuation contracts |
| `CProgramNode` | Recursive seven-way GTL term union |
| `CProgramTerm` | Typed construction witness over a `CProgramNode` |
| `CCarrier` | Typed input or output carrier declaration |
| `CGraphFunctionRef` | Typed reference to another GraphFunction |
| `CSourcePath` / `CProgramLocus` | Exact coordinate into the admitted recursive term |
| `CSourceContinuation` | Exact GTL-owned successor relation after a completed locus |
| `CContinuationTarget` | Terminal or exact next locus/input/retry coordinate |

### 1.2 GTL owner relations consumed by HoG

| Relation | Function |
|---|---|
| `resolveCProgramTermAtSourcePath` | Resolve the exact term at a source coordinate |
| `resolveCProgramLocus` | Resolve declared locus identity and contracts |
| `deriveCSourceContinuation` | Derive continuation from the completed source locus |
| `deriveCContinuationTarget` | Produce the exact next locus and input relation |
| `deriveCBatchTaskInput` | Select the exact declared input for one batch member |
| `resolveEnclosingCRetryContexts` | Recover declared nested retry contexts |
| `deriveCEnclosingRetryTopology` | Derive retry topology from admitted GTL |
| `recursionTerminationDecision` | Decide graph-recursion termination from the declared application |

These functions own topology and continuation meaning. HoG must not reproduce them as control tables or hidden plans.

## 2. Immutable evaluator inputs

The current common input is `ExecuteGraphTraversalCommonInput` in `hog/graph_execute.ts`.

| Entity | Owner | Purpose |
|---|---|---|
| `GtlProgram` | GTL | Complete admitted Program |
| `GraphFunction` | GTL/Product selection | Exact callable definition |
| `GtlGraph` | GTL | Materialized topology being traversed |
| `GraphValidation` | Validator | Proof that the exact graph is lawful |
| `ExecutionBasis` | ABG | Immutable binding between invocation, input, graph, contracts and implementation sets |
| `AdmittedImplementationSet` | ABG | Exact available `F_D` and `F_P` implementations |
| `AdmittedInteractionSet` | ABG | Exact available `F_H` interaction contracts |
| `OpenedTraversalScope` | ABG | Run, GraphCall and Frame lineage |
| `ContinuationProductBasis` | Product | Exact Product basis needed to validate catalog or continuation relations |
| `LeafInvocationPort` | Implementation owner | Exact leaf invocation and contract-validation capability |
| `ChildTraversalPreparationPort` | Product/ABG seam | Prepare an admitted child GraphFunction invocation |
| `ClosureContract` | Product/ABG | Govern lawful terminal closure |
| `ActorRuntimeBinding` | Product/implementation | Exact `F_P` actor/process binding |
| Durable event store and prefix | ABG | Runtime admission authority |
| Event time and correlation ID | Transport metadata | Event causation coordinates, not semantic state |

No evaluator-owned registry, mutable state service, catalog or topology is permitted.

## 3. Entry entities

The same evaluator accepts several entry coordinates without becoming several engines.

| Entry | Meaning | Current carrier |
|---|---|---|
| Initial | Begin at the admitted graph root | Input plus exact digest |
| Non-retry resume | Continue from an admitted cursor | Cursor plus exact input and digest |
| Projected retry resume | Reconstruct a durable retry frontier after restart | ABG-projected retry carrier |
| Held workflow resume | Fold a completed child workflow into its parent | Workflow suspension plus child completion |
| Held recursion resume | Fold a completed recursive child into its parent | Recursion suspension plus child completion |

The initial and projected-retry carriers begin at `hog/graph_execute.ts:740`. Held resume dispatch is centralized through `traversalProgram` near `hog/graph_execute.ts:2231`.

These are different coordinates into one fold, not different runtimes.

## 4. Evaluator-position entities

| Entity | Function | Authority classification |
|---|---|---|
| `TraversalCursorCandidate` | Exact current Program locus, input, attempt, retry path and lineage | ABG-owned candidate |
| `TraversalCursor` | HoG alias of the ABG cursor carrier | No second cursor type |
| `ExecutableTraversalStopRef` | Current `F_D` or `F_P` compute locus | HoG structural projection |
| `InteractionTraversalStopRef` | Current `F_H` compute locus | HoG structural projection |
| `TraversalRefusal` | Typed structural invalidity | HoG outcome, not exception-driven control |
| `RouteCandidate` | Proposed cursor transition | HoG proposal |
| `AdmittedRoute` | Accepted runtime movement | ABG durable truth |
| `ConstructionIntent` | Exact declared target and input relation | ABG-rehydrated coordinate |
| `ExecutableTraversalCompletion` | Current outward result of one evaluation episode | Projection, not runtime authority |

The cursor, stop and refusal family is in `hog/traversal.ts`. The broad completion carrier is in `hog/execute.ts` and currently distinguishes:

- `advanced`
- `application_ready`
- `blocked`
- `closed`
- `failed`
- `gap_stop`
- `held`
- `refused`

Later contraction may simplify its internal variants. ABG events, not this object, remain runtime truth.

## 5. Core evaluator functions

| Function | Responsibility | D2 state |
|---|---|---|
| `traverse` | Derive the initial cursor or compute stop | Direct cursor/GTL based |
| `traverseFromCursor` | Re-enter at an exact cursor | Direct cursor/GTL based |
| `resolveTraversalTerm` | Resolve the exact `CProgramNode` at the cursor | Established |
| `deriveStructuralTargetCursor` | Derive the next structural coordinate | Established |
| `advanceStructuralTraversal` | Descend identity, compose, edge, batch and retry structure | Stack-safe `Effect.suspend` |
| `graphTraversalEffect` | Own the single recursive evaluation program | Stack-safe `Effect.suspend` |
| `evaluateLocus` | Evaluate one compute locus and recurse to its successor | Stack-safe `Effect.suspend` |
| `selectAdmittedImplementationResolution` | Select the exact `F_D` or `F_P` implementation | ABG owner call |
| `selectAdmittedInteractionContract` | Select the exact `F_H` contract | ABG owner call |
| `completeExecutableTraversal` | Invoke leaf and admit evidence, result and judgment | Existing owner mechanics lifted into Effect |
| `completeInteractionTraversal` | Admit the `F_H` open and hold relation | Existing owner mechanics |
| `completeWorkflowTraversal` | Fold a child workflow outcome into its parent | Existing mechanics; contraction candidate |
| `resumeProjectedRetry` | Reconstruct a retry frontier and next attempt | Existing durable relation |
| Recursion termination and foldback | Evaluate a recursive child and fold its result back | Existing mechanics; contraction candidate |
| `runGraphTraversalProgram` | Cross from Effect into the Promise-facing host | Singular HoG membrane |
| `runEffectProgram` | Sole package `Effect.runPromiseExit` call | Singular shared membrane |

Primary loci:

- `build_tenants/abiogenesis/typescript/code/src/hog/graph_execute.ts:1089`
- `build_tenants/abiogenesis/typescript/code/src/hog/structural_execute.ts:89`
- `build_tenants/abiogenesis/typescript/code/src/shared/effect_definition.ts:71`

## 6. Exact branch behaviour inside the evaluator

### 6.1 `F_D` and `F_P` executable leaf

1. Select the exact admitted implementation row.
2. Resolve the input, output, failure and judgment contracts.
3. Open the CCall through ABG.
4. Invoke the concrete implementation port.
5. For `F_P`, admit actor/process observations.
6. Admit evidence, result and judgment.
7. Propose the successor route.
8. ABG admits or refuses that route.
9. Recurse at the admitted successor.

### 6.2 `F_H` interaction

1. Select the exact admitted interaction contract.
2. Open the interaction CCall.
3. Admit pending interaction truth.
4. Return `held`.
5. On a later admitted response, rehydrate the frontier.
6. Resume through the same evaluator.

No executable `F_H` implementation is introduced.

### 6.3 Workflow call

1. Open the parent workflow CCall.
2. Prepare the child Product/ABG basis through the exact child port.
3. Recursively call `graphTraversalEffect`.
4. Return held state if the child holds.
5. Otherwise admit child foldback.
6. Continue the parent through its admitted successor.

### 6.4 Retry

1. Reconstruct the declared retry context from GTL.
2. Project the complete durable retry frontier from ABG events.
3. Validate the verified executable-input preimage.
4. Admit the next attempt.
5. Recursively evaluate the same term.
6. Admit progress and retry exit.
7. Continue from the admitted successor.

Effect `Schedule` or generic retry operators are deliberately not used because GTL and ABG own retry meaning.

### 6.5 Graph recursion

1. Resolve the declared recursive graph application.
2. Evaluate its termination relation.
3. Prepare and open the child scope if recursion continues.
4. Recursively call the same evaluator.
5. Admit foldback into the parent.
6. Continue from the exact admitted re-entry cursor.

## 7. Exact owner ports invoked by D2

### 7.1 GTL owner

- source-path and locus resolution;
- continuation and successor derivation;
- batch-member input selection;
- retry-context and retry-topology derivation;
- graph-recursion termination;
- declared workflow, fan-out, recursion and re-entry applications.

### 7.2 Product owner

- exact GraphFunction catalog lookup;
- direct/start invocation construction before D2;
- exact catalog/Program/GraphFunction consistency basis;
- deterministic child preparation inputs.

### 7.3 Validator owner

- admitted raw Program and publication carriers;
- whole-Program validation;
- exact materialized-graph validation;
- canonical admitted values after semantically set-like inventory normalization.

### 7.4 Implementation owner

`LeafInvocationPort` supplies:

- contract value-kind lookup;
- contract value validation;
- judgment-relation resolution;
- result-evidence lineage validation;
- probabilistic worker-contract resolution;
- concrete `invoke`.

### 7.5 ABG owner

- invocation and `ExecutionBasis` admission;
- Run, GraphCall and Frame opening;
- initial cursor admission;
- CCall and fibre opening;
- evidence, result and judgment admission;
- retry attempt and progress admission;
- `F_H` pending interaction and resume admission;
- child preparation, closure and foldback;
- route admission;
- runtime failure and terminal closure;
- expected-prefix transactions;
- Event Calculus projection;
- replay and semantic Run projection.

D2 composes these existing owner capabilities. It must not reproduce their rules inside HoG or Effect services.

## 8. Durable ABG entities and projections

The durable evaluator outcome is not `ExecutableTraversalCompletion`. Runtime truth consists of the admitted ABG prefix and its entities:

- `TraversalCursorAdmission`;
- `CCall`;
- admitted implementation/fibre selection;
- evidence;
- result;
- judgment;
- retry attempt and retry progress;
- traversal route;
- `F_H` continuation, response and resume;
- child foldback or preparation refusal;
- closure and terminal events.

The Event Calculus derives currentness and lifecycle truth. Replay deterministically reconstructs that truth and its projections.

## 9. Effect mechanics

| Mechanic | Current use | State |
|---|---|---|
| `Effect.suspend` | Stack-safe graph-locus recursion | Established |
| `Effect.suspend` | Stack-safe structural descent | Established |
| `Effect.gen` | Sequential composition of owner calls and recursive evaluation | Established |
| `Effect.promise` | Lift existing Promise-shaped owner ports at the boundary | Lawful boundary membrane |
| `Exit` and `Cause` | Cross the single host membrane | Established |
| `runEffectProgram` | Sole `Effect.runPromiseExit` host | Established |

Forbidden semantic mechanisms remain absent from the evaluator design:

- `Ref`
- `FiberRef`
- semantic `Fiber` state
- `Queue`
- `Stream`
- `STM`
- semantic `Clock`
- Effect retry/Schedule semantics
- semantic currentness in `Context` services
- a nested Effect runtime

## 10. Audit-only entities

`CTraversalCoordinate` and `DirectCTraversalStep` remain in `hog/direct_fold.ts`.

Their only lawful relation is:

```text
admitted GTL entry
    -> inert exact audit projection
    -> persisted invocation evidence
```

They no longer drive evaluation. Production evaluator modules do not import or branch on them. Reintroducing them as an intermediate representation, plan or instruction stream would reopen the prohibited compiler design.

## 11. D2 progress inventory

| D2 item | State |
|---|---|
| Seven-way GTL algebra is the evaluator source | Complete |
| Direct cursor/GTL traversal replaces `DirectCTraversalStep` execution | Complete |
| Main graph-locus recursion uses `Effect.suspend` | Complete |
| Structural descent uses `Effect.suspend` | Complete |
| Workflow, recursion and retry recurse inside the same Effect program | Complete |
| Initial and held-resume paths enter the same evaluator | Complete |
| Exactly one outward Promise entry | Complete |
| Exactly one `Effect.runPromiseExit` host membrane | Complete |
| Zero HoG `while` loops | Complete |
| Prototype evaluators deleted | Complete |
| Focused HoG tests | 5/5 passed at checkpoint |
| Installed retry-wrapped workflow through the evaluator | 1/1 passed after checkpoint in 331.1 seconds |
| Final D2 mechanical census and close checkpoint | In progress |

The current post-checkpoint test edit replaces stale authored pre-admission Program values with the Validator-returned canonical admitted publication, Program and GraphFunction. This repaired an exact `validation_mismatch`; it does not alter production semantics or authority.

## 12. D2 closure work

The remaining D2 work is proof and checkpointing, not evaluator construction:

1. Finish the focused direct-fold and R8 installed-path run.
2. Run TypeScript no-emit.
3. Run the deterministic build.
4. Re-run the one-runner census.
5. Re-run the zero-HoG-`while` census.
6. Re-run the zero-evaluator-use census for `DirectCTraversalStep`.
7. Run `git diff --check`.
8. Preserve the exact D2 closure checkpoint.

## 13. Work deliberately left after D2

These are contraction and deletion targets. They are not additional evaluator primitives:

- repeated route-candidate builders;
- workflow, retry, recursion and fan-out-specific completion coordinators;
- the broad internal completion and suspension carrier family;
- special projected-retry orchestration that can be expressed through common re-entry;
- case-specific foldback helpers;
- unnecessary exports from `hog/index.ts`;
- inert legacy helpers proven unreachable;
- Promise-shaped owner boundaries that may remain lawful membranes or later become Effect-native.

The boundary is:

```text
D2: close one direct stack-safe evaluator
    -> D3: collapse derived patterns over its algebra
    -> D4: delete displaced and unreachable imperative debt
```

D2 must not grow while D3 and D4 perform that contraction.

## Executive drift sentinels

Stop the cut if any of the following appears:

- another evaluator or runner;
- executable `DirectCTraversalStep` or another intermediate instruction language;
- HoG reimplementation of GTL topology or continuation law;
- HoG reimplementation of Product catalog or invocation selection;
- Effect `Ref`, `FiberRef`, queue, stream, STM, schedule or service state carrying semantic truth;
- retry meaning delegated to Effect retry mechanics;
- process-local cursor, retry, hold, resume, lifecycle or terminal authority;
- ABG admission replaced by an Effect-local transition;
- completion projections treated as runtime truth;
- a new Public operation, controller, catalog, plan or compatibility path;
- D3 contraction used to change Product behaviour rather than translate existing mechanics.

