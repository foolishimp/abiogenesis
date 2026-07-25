# M05 Direct GTL Traversal Expansion Design

**Status**: M5 base accepted at `d6da4269`; the T-270 Section 12
reconciliation candidate is implemented and awaits exact-cut review and
acceptance. Section 12 retains completed T-272 design and decision evidence.
T-272 has no continuing growth authority. Only the S03 boundary selected by
GOALS and T-270 may change; later Product outcomes remain held.
**Date**: 2026-07-22
**Section 12 updated**: 2026-07-25
**Historical accepted parent design**:
`M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md`, accepted SHA-256
`9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
**Current parent projection**: same direct-GTL architecture with STDO `v2.2.0`
qualification identity propagated, SHA-256
`12334d2d814c47a954f55cd9664c006fd331fdafaa3fb043b95a35e8832e285f`
**Product boundary**: `A5-F02`, `A5-F03`, `A5-F04`, `A5-F09`, `A5-F10`,
`A5-F14`; enables later `A5-F07`, `A5-F08`, `A5-F12`, and `A5-F17`
**Scenario boundary**: completed `ABG5-S02`; Section 12 advances `ABG5-S03`
**Work owner**: T-270; completed T-272 is historical Section 12 evidence
**Sequencing**: co-evolution inside the decisions fixed here; a newly exposed
material authority or lifecycle ambiguity returns to design before promotion

## 1. Decision

M5 extends the installed M4 root into a generic direct traversal without a
compiled execution carrier.

```text
admitted GTL Program and materialized Graph
  -> non-lowering validation of graph and C terms
  -> ABG-admitted invocation, executable-resolution set, and F_H contract set
  -> HoG cursor derived from the original GTL value plus replay
  -> direct traversal of graph relations and seven C constructors
  -> declared implementation port at each F_D/F_P leaf or admitted F_H interaction boundary
  -> ABG evidence, result, judgment, route, continuation, and closure admission
  -> replay-derived state and public outcome
```

The accepted M3 authority split remains unchanged:

- GTL owns graph topology, C terms, callable relations, contracts, and routes.
- The validator owns closed static judgments and never lowers GTL.
- Product projection proposes exact implementation matches from the admitted
  catalog.
- ABG admits invocation, executable matches, F_H contract rows, runtime facts,
  and closure.
- HoG traverses the original admitted GTL and applies only ABG-admitted routes.
- Implementations own F_D/F_P leaf interiors only.
- Public SDK and CLI transport public operations and project replay truth.

No generated program, compiled C plan, normalized executable declaration,
feature runner, implementation selector, scheduler, or controller is added.

## 2. Scope And Non-Scope

### In scope

1. The seven-constructor C declaration family:
   `C.of`, `C.id`, `C.compose`, `C.edge`, `workflow.C`, `C.batch`, and
   `C.retry`.
2. Graph traversal over declared nodes and vectors, including child
   GraphFunction traversal and declared GraphFunction applications.
3. A complete per-invocation executable-resolution set and a distinct complete
   F_H interaction-contract set admitted before HoG enters the graph.
4. General C-call locus identity across source path, task ordinal, attempt,
   retry path, and graph-call lineage. Compute fibre remains selected interior
   truth and never enters C-call identity.
5. Deterministic and probabilistic leaf ports plus a distinct typed external
   human-hold boundary that invokes no implementation.
6. Durable event-log reopening sufficient for same-run continuation.
7. Data-driven traversal and fibre-substitution proof rows.
8. Removal of the current GTL and validator dependency on Product utility
   modules.

### Deferred to existing owners

| Boundary | Owner |
|---|---|
| One Surface semantic program and F_H interaction policy | T-270; completed T-272 is retained evidence |
| Consensus declarations and result semantics | T-274, T-275, T-276 |
| complete public projection and downstream flavored catalog | T-281 |
| observer and tuner | T-268 |
| qualification and release | T-247, T-248 |

The generic carriers and lifecycle required by those slices are in scope.
Their domain programs are not.

### Requirement trace for this delta

| Boundary | Governing requirement or accepted design |
|---|---|
| transparent workflow parent call | `REQ-L-GTL3-C-ALGEBRA-006`; `REQ-R-ABG3-CCALL-013` |
| executable versus F_H leaf identity | `REQ-L-GTL3-C-ALGEBRA-010`; `REQ-R-ABG3-CCALL-003` |
| authoritative durable continuation | `REQ-R-ABG3-CONTINUATION-001..014`; `REQ-P-POLICY-024`, `-031..033` |
| ordered batch and fan-out | `REQ-L-GTL3-C-ALGEBRA-007`; `REQ-L-GTL3-HOF-009..012` |
| durable append-context reopening | `REQ-R-ABG3-EVENTS-024`, `-027`, `-028` |
| fan-out completion and partial stop | `REQ-L-GTL3-HOF-010`; `REQ-R-ABG3-EVENTS-002`, `-011` |
| continuation ingress authority | `REQ-P-POLICY-024`; `REQ-R-ABG3-EVENTS-031` |
| child module topology | accepted M3 design Section 8 dependency law and Section 9.2 operation composition |
| event and replay closure | `REQ-R-ABG3-EVENTS-002`, `-004`, `-011`, `-018`, `-024`, `-029` |

## 3. Ontology Delta

This is an affected slice of the accepted M3 Ontology. The M3 Prime families
remain authoritative. M5 adds variants and relations inside those families; it
does not add a peer authority.

### 3.1 Entities And Relationships

| Identity | M3 family | Authority | Relationship |
|---|---|---|---|
| `CProgramTerm` | `GtlDeclarationFamily` | GTL | One closed discriminated term built from exactly seven constructors. |
| `CLeafTerm` | `GtlDeclarationFamily` | GTL | One `C.of` locus with role, fibre, arm, carriers, and judgment refs. An F_D/F_P leaf carries an executable requirement; an F_H leaf carries an interaction requirement. |
| `ExecutableLeafRequirement` | `GtlDeclarationFamily` | GTL | Stable F_D/F_P requirement key over the locus, binding, and executable seam contracts. |
| `InteractionLeafRequirement` | `GtlDeclarationFamily` | GTL | Stable F_H requirement key over the locus, interaction kind, actor-capability, request, response, and continuation contracts; it has no implementation binding. |
| `GraphTemplate` | `GtlDeclarationFamily` | GTL | Complete immutable graph with boundary nodes, nodes, vectors, contexts, rules, effects, tags, and one C term at each compute locus. |
| `GraphFunctionApplication` | `GtlDeclarationFamily` | GTL | One declared graph relation for composition, substitution, recursion, fan-out, fan-in, gate, promote, identity, or same-object identity. |
| `ValidatedTraversalDeclaration` | `ValidationFamily` | validator | Exact static judgment over Program, GraphFunction, materialized Graph, C terms, contracts, and implementation declarations. |
| `AdmittedImplementationSet` | `InvocationBasis` | ABG | Complete one-to-one admitted resolution for every statically reachable F_D/F_P leaf key under the validated root; child bases consume exact graph-local subsets. |
| `AdmittedInteractionSet` | `InvocationBasis` | ABG | Complete admitted F_H interaction-contract rows for every statically reachable F_H key; no row is executable. |
| `ChildTraversalPreparationPort` | `InvocationBasis` | stateless operation composition over GTL, validator, and ABG owner ports | Total preparation of one GTL-declared child into validated Graph, exact admitted child subsets, ExecutionBasis, and opened scope; it neither selects the child nor re-resolves Product catalog truth. |
| `TraversalCursor` | `TraversalAggregateFamily` | HoG under admitted scope | Subordinate position derived from original GTL plus replay; never authored or published as a program. |
| `TraversalStep` | `TraversalAggregateFamily` | HoG proposal | One derived structural step: pass identity, enter term, open leaf, enter child, start task, retry, advance graph, hold, or terminal. |
| `LeafExecutionPort` | `LeafRealizationBoundary` | admitted implementation seam | Exact `F_D` or `F_P` function addressed by one admitted resolution; no event or transition authority. |
| `HumanInteractionBoundary` | external actor, outside the IACS | direct or lawfully proxied F_H | Receives an attributed request and returns a response candidate; it is not an implementation binding or executable port. |
| `RouteCandidate` | `TraversalAggregateFamily` | declared implementation or HoG proposal | Candidate consequence constrained to GTL-declared routes. |
| `AdmittedRoute` | `RuntimeEventFamily` | ABG | Canonical event truth accepting one route on current replay and authority basis. |
| `FanOutCompletion` | `RuntimeEventFamily` | ABG | Frame-local authoritative completion truth with disjoint `complete_vector` and `partial_stop` variants; Vector is never an aggregate. |
| `Continuation` | `TraversalAggregateFamily` | ABG | Authoritative run-local open obligation. The complete target algebra names open, resolved, superseded, and abandoned; the selected S03 realization proves only open, responded, and resolved, with superseded and abandoned deferred. |
| `ContinuationBasis` | `ReplayProjectionFamily` | ABG replay | Downstream held cursor, response contract, authority, and event-log identity derived from admitted events. |
| `ReopenedEventStoreContext` | `RuntimeEventFamily` | ABG event-store boundary | One exclusive live append context seeded from a verified existing durable log without restamping historical events. |
| `ReplayState` | `ReplayProjectionFamily` | downstream | Complete state derived only from admitted events. |

### 3.2 Invariants And Cardinality

1. A `CProgramTerm` has exactly one constructor discriminant.
2. A `C.of` has one C-call spine. `C.id` has none. Structural constructors do
   not fabricate C calls.
3. `C.compose` is canonically flat: construction flattens nested composition
   syntax into one ordered non-empty term family while preserving each original
   leaf. `C.compose` and `C.edge` preserve exact carrier continuity.
4. `workflow.C` names one admitted child GraphFunction and is one transparent
   parent C call. ABG opens and selects that parent C call before child
   preparation. The child GraphCall and Frame remain under the same run. Child
   completion, block, failure, refusal, or hold becomes `sub_traversal`
   evidence followed by exactly one parent result and judgment for that
   attempt. Preparation rejection totalizes the already-open parent C call.
5. `C.batch` contains a non-empty ordered task family with equal outer carrier
   and per-task result cardinality. Each task retains its own C-call, result,
   and judgment. The batch ref groups ordered per-task rows; it is not a
   synthetic aggregate call or result.
6. `C.retry` has a positive budget and repeats the same declared term with a
   fresh positive attempt coordinate. Retry is not graph recursion.
7. Every reachable `F_D` or `F_P` effectful leaf has exactly one admitted
   implementation resolution before HoG entry. Zero or multiple matches
   refuse. An `F_H` leaf instead has one declared interaction and response
   contract and no implementation resolution.
8. An executable requirement key is the stable digest of Program,
   GraphFunction, GraphFunction digest, program locus, role, fibre, arm,
   binding, and executable seam contract refs. An interaction requirement key
   replaces binding and executable contracts with interaction kind,
   actor-capability, request, response, and continuation contract refs. The
   key families are disjoint and exhaustive.
9. The validated transitive root declares complete executable and interaction
   key sets. Child validation declares exact graph-local subsets of both.
   Child basis admission requires equality against matching rows already
   admitted in the corresponding root set. Missing, extra, cross-family,
   drifted, or ambiguous rows refuse before child HoG entry.
10. Fibre substitution changes only the leaf interior, evidence class, and the
    applicable executable or interaction requirement. Topology, source path,
    C-call spine order, and continuation law remain unchanged.
11. A HoG cursor is reproducible from `(admitted GTL, opened scope, replay)`.
   Ambient process memory cannot be required for continuation.
12. A route is applicable only when declared by the current GTL boundary and
    admitted by ABG against current replay.
13. Once a C call opens, every success, failure, malformed result, admission
    rejection, child outcome, or hold completes the inherited M3 spine for that
    attempt through one result-admitted row and one judged row. Only pre-call
    refusal may terminate without a C call. A resumed child or F_H obligation
    uses a fresh attempt coordinate and cannot append a second result to the
    completed pending attempt.
14. Public outcome is replay projection. A worker, test, CLI, or implementation
    cannot author result, continuation, or closure truth.
15. Durable reopening preserves every historical canonical envelope byte,
    `eventId`, payload digest, and admission ordinal. Historical ordinals are the
    unique gap-free sequence `1..n`; the reopened live context owns the same
    sink and stamps its first new event at `maxOrdinal + 1`. Reopening never
    truncates, rewrites, reorders, or re-admits historical truth.
16. Fan-out completion is exactly one discriminated ABG admission. A complete
    variant contains every task exactly once in input ordinal order and one
    contract-valid output vector. A partial-stop variant partitions the input
    tasks into completed rows, exactly one stopping task/ordinal, and exact
    unstarted rows, and contains no output vector.

### 3.3 Lifecycle Completeness

| Entity | Initial | Lawful next states | Terminal or refusal |
|---|---|---|---|
| authored GTL | authored | raw admitted, invalid | invalid |
| admitted GTL | admitted | validated, semantic gap | invalid or unresolved |
| invocation basis | raw input and Program validated | invocation admitted, Graph materialized and validated, executable and interaction sets admitted, exact basis admitted | `invocation_refused` after invocation admission; typed refusal before it |
| traversal | opened | at term, at leaf, child, retry, next node, held | blocked, failed, closed |
| C call | atomically opened and fibre selected | evidenced, result admitted, judged | judged success, failure, refusal, pending, blocked, or escalation; never stranded |
| child traversal | opened | traversing, folded back | blocked, held, failed, closed |
| fan-out completion | declared ordered tasks | task truth accumulating | complete vector admitted or partial stop admitted |
| continuation | opened from admitted hold | open, responded, resume admitted | resolved in the selected S03 realization; superseded and abandoned remain explicit target-only gaps |
| durable event store | absent or verified historical log | exclusive append context open | append context closed or reopen refused |
| run | active | active, held, blocked, failed | closed or stopped with an admitted terminal disposition |

The affected entity closure is explicit below. Immutable declaration and
judgment carriers retire by supersession or invocation completion, not mutation.

| Entity | Create / admit | Read / project | Transition / execute | Retire / terminal |
|---|---|---|---|---|
| `CProgramTerm` | GTL constructor or raw admission | validator and HoG read original term | HoG folds without rewriting | declaration version supersedes |
| `CLeafTerm` | `C.of` or raw admission | validator derives one executable or interaction key | exact admitted port or F_H hold | owning term supersedes |
| `ExecutableLeafRequirement` | GTL declaration and validation | Product resolves and ABG admits matching row | exact admitted implementation only | invocation terminal or declaration supersession |
| `InteractionLeafRequirement` | GTL declaration and validation | ABG admits exact non-executable contract row | F_H request and response admission only | continuation terminal or declaration supersession |
| `GraphTemplate` | GraphFunction publication | materialization and validation | pure materialization only | GraphFunction version supersedes |
| `GraphFunctionApplication` | GTL graph algebra | validator and HoG read relation | HoG proposes only declared child/route work | owning declaration supersedes |
| `ValidatedTraversalDeclaration` | validator closed judgment | Product, ABG, and audit read exact digest | never executes | invocation ends or subject digest changes |
| `AdmittedImplementationSet` | ABG admits exact validated root set | root and child basis admission read keyed rows | never selects or executes | invocation terminates |
| `AdmittedInteractionSet` | ABG admits exact validated root interaction set | root and child basis admission read keyed rows | never invokes a human or HoG | invocation terminates |
| `ChildTraversalPreparationPort` | operation application binds owner functions once | HoG calls it with a GTL-selected child and admitted parent sets | GTL materializes, validator judges, ABG admits; Product is not called | returns one prepared child or typed refusal |
| `TraversalCursor` | HoG derives from GTL, scope, and replay | HoG reads current derived position | replaced only after an admitted event/route | next cursor or terminal event supersedes |
| `TraversalStep` | HoG derives one total step | ABG evaluates candidate against scope | HoG executes only after required admission | accepted, refused, or superseded by newer replay |
| `LeafExecutionPort` | package plus implementation binding admission | HoG addresses exact admitted port | implementation realizes F_D/F_P interior | call or invocation terminates |
| `HumanInteractionBoundary` | GTL declares callout and ABG admits hold | public projection renders pending interaction | attributed external actor returns candidate | response admitted or rejected in this cut; abandonment and supersession remain target-only gaps |
| `RouteCandidate` | HoG or declared implementation proposes within GTL route set | ABG evaluates against replay | never applies itself | admitted, refused, or superseded |
| `AdmittedRoute` | ABG admits canonical route event | replay projects route truth | HoG deterministically applies exact admitted route | next admitted route or terminal event supersedes it |
| `FanOutCompletion` | ABG admits one closed completion variant | replay projects ordered vector or partial-stop facts | only a later declared route may consume it | owning frame or run terminal |
| `Continuation` | ABG admits an opening lifecycle event | replay projects exactly one run-local member | only separate response and continuation operations may advance it | resolved in this cut; superseded and abandoned are deferred with T-270 re-entry |
| `ContinuationBasis` | replay derives open obligation | public read and `run.continue` consume exact basis | never invokes HoG itself | resolved or run terminal in this cut; superseded and abandoned are deferred |
| `ReopenedEventStoreContext` | ABG validates an existing log and acquires exclusive append ownership | replay and event admission read the exact seeded prefix | new events append at the next ordinal only | context closes; historical log remains immutable truth |
| `ReplayState` | pure fold of admitted event log | HoG and public projections read | never writes events or executes work | superseded by a longer valid prefix |

### 3.4 Authority Matrix

| Function | Proposer | Evaluator | Verifier | Executor | Projector | Admitter / truth owner | Retirement |
|---|---|---|---|---|---|---|---|
| construct C or graph relation | GTL author | TypeScript and validator | validator | pure GTL constructor | validation report | raw admission and closed static judgment | declaration supersession |
| resolve leaf implementation | Product catalog projection | validator | ABG basis checks | none | invocation replay | ABG; F_D and F_P only | invocation terminal |
| admit F_H interaction contracts | GTL plus validator | validator | ABG basis checks | none | invocation replay | ABG; F_H only | invocation terminal |
| prepare child traversal | HoG supplies only GTL-declared child ref and input | fixed operation-bound port invokes GTL and validator owners | ABG checks parent scope and exact root-set subsets | stateless port composition | prepared-child result | ABG owns admitted child basis and scope | child terminal or parent invocation terminal |
| derive next structural cursor | HoG | GTL relation plus replay | ABG scope identity | HoG after required admission | replay cursor | no new truth until route admission | next admitted event |
| realize leaf interior | admitted F_D or F_P implementation | result contract | ABG result checks | exact implementation port | replayed C-call | ABG | judged C call or invocation terminal |
| request or answer human work | HoG proposes declared hold; attributed human answers | declared interaction and response contracts | F_H authority and replay basis | external human only | continuation and public interaction views | ABG | resolved or rejected in this cut; abandonment and supersession remain deferred |
| choose consequence candidate | declared implementation or HoG from declared relation | GTL route set | ABG current replay | none | route diagnostic | ABG | admission, refusal, or newer replay |
| apply transition | admitted route | GTL cursor relation | replay | HoG | replay cursor | ABG event is prior truth | next cursor or terminal event |
| admit fan-out completion | HoG submits task-result census | declared vector and task contracts | ABG checks exact ordinal partition and current replay | none | ordered vector or partial-stop projection | ABG | owning frame or run terminal |
| totalize post-open rejection | actual contract rejection | refusal and rejection contracts | current C-call spine | ABG appends only missing suffix | replayed rejected C-call | ABG | judged rejection |
| respond to hold | attributed F_H actor | declared response and capability contracts | ABG verifies open continuation and replay basis | `interaction.respond` only admits response truth | responded interaction view | ABG | response consumed, rejected, or continuation terminal |
| reopen durable truth | caller supplies existing sink and expected digest | canonical log grammar and event union | ABG validates immutable stamps, ordinal order, causation, scope, and exclusive append ownership | event store seeds one live context without emitting | replay prefix and next ordinal | ABG event-store boundary | context closes or reopen refuses |
| continue held run | admitted `run.continue` ingress names existing run/continuation, actor, capability, and input | declared continuation contract | ABG uses the reopened context to verify exact durable scope and public authority | `run.continue` explicitly re-enters HoG after resume admission | continuation and replay views | ABG | resolved or run terminal in this cut; superseded and abandoned remain deferred |
| close | HoG submits current judged terminal | closure predicate | replay and exact contracts | ABG appends closure transaction | replay and PublicOutcome | ABG | immutable terminal run |

## 4. Function And Composition Derivation

### 4.1 Atomic function families

| Family | Input -> output | Owner |
|---|---|---|
| `constructC` | typed constructor arguments -> canonical `CProgramTerm` | GTL |
| `rawAdmitProgram` | erased Program, GraphFunction, Graph, and C data -> admitted declarations or typed refusal | raw admission |
| `validateProgram` | admitted whole root -> Program validation or typed gap | validator |
| `materializeGraph` | admitted GraphFunction plus admitted input -> original GTL Graph candidate | GTL |
| `validateTraversal` | materialized Graph plus Program validation -> static Graph/C validation or typed gap | validator |
| `resolveImplementations` | catalog view plus reachable executable keys -> candidate set or typed gap | Product projection |
| `admitImplementationSet` | candidate set plus invocation basis -> admitted set or refusal | ABG |
| `admitInteractionSet` | validated reachable F_H contract rows plus invocation basis -> admitted non-executable set or refusal | ABG |
| `prepareChildTraversal` | GTL-declared child ref, admitted child input, parent scope, root executable set, and root interaction set -> prepared child with original Graph, validation, exact admitted subsets, ExecutionBasis, and opened scope, or typed refusal | stateless operation-bound port over GTL, validator, and ABG owner functions |
| `reopenEventStore` | existing durable log path, expected log digest, and immutable event-contract basis -> exclusive `ReopenedEventStoreContext` seeded with exact historical envelopes and next ordinal, or typed refusal | ABG |
| `deriveTraversalStep` | GTL plus scope plus replay -> structural step | HoG |
| `invokeLeafPort` | admitted F_D/F_P leaf input -> evidence and result candidates | implementation seam |
| `admitHumanHold` | declared F_H locus plus replay -> admitted hold event and continuation projection | ABG |
| `admitInteractionResponse` | public `interaction.respond` candidate plus open continuation -> actor-attributed response truth or refusal; never invokes HoG | ABG |
| `rehydrateContinuation` | reopened event-store context plus immutable Product/workspace/catalog/declaration basis and continuation identity -> owner-validated replay, ExecutionBasis, opened scope, cursor, and input, or typed basis-fork/refusal | ABG |
| `continueExecution` | admitted public `run.continue` operation, acting operator/capability, declared input, rehydrated scope, and admitted response when required -> resume admission and explicit HoG re-entry | public operation over ABG and HoG ports |
| `admitLeafTruth` | candidates plus contracts -> admitted C-call truth or rejection | ABG |
| `admitFanOutCompletion` | declared fan-out application, ordered task census, current replay, and candidate complete vector or partial stop -> authoritative discriminated completion event or typed refusal | ABG |
| `completeRejectedCCall` | opened C call plus current spine position plus actual admission rejection -> only the missing suffix: rejection evidence and typed refusal result before result admission, then rejection judgment; judgment only after result admission | ABG |
| `admitRoute` | route candidate plus current replay -> admitted route or refusal | ABG |
| `applyRoute` | admitted route plus GTL cursor -> next cursor | HoG |
| `rehydrateReplay` | reopened event-store context with verified historical prefix -> replay state | ABG |

### 4.2 Higher-order composition

`traverseC` is the direct fold over the original `CProgramTerm`. It composes
the atomic families above and is parameterized by admitted ports. It does not
produce or consume another program value.

`traverseGraph` composes `traverseC` with declared graph vectors and admitted
routes. `workflow.C`, recursion, fan-out, and fan-in reuse `traverseGraph` at a
child scope prepared through `ChildTraversalPreparationPort`. Batch and retry
reuse `traverseC` with task and attempt coordinates. None owns a parallel
runtime.

### 4.3 Whole-family Prime contraction

Candidate alternatives were:

1. one interpreter or runner per C constructor;
2. a lowered normalized execution plan;
3. one generic direct fold over the original GTL term;
4. feature-owned controllers for workflow, batch, retry, and recursion.

Only option 3 preserves one program identity and one traversal authority. The
M3 Prime set therefore remains eight families. This delta adds subordinate
variants to `GtlDeclarationFamily`, `InvocationBasis`, and
`TraversalAggregateFamily`; it adds no ninth authority family and no second
authoring surface.

## 5. Irreducible Architectural Carrier Set Delta

The accepted M3 IACS remains the complete eight-family carrier set. This table
classifies only M5 members and payloads inside those families; no row is a ninth
Prime family.

| Carrier | Parent M3 IACS family | Classification | Module | Purpose |
|---|---|---|---|---|
| `CProgramTerm` | `GtlDeclarationFamily` | `<<subordinate>> <<authoritative>>` | `src/gtl` | Original seven-constructor program data. |
| `GraphFunctionApplication` | `GtlDeclarationFamily` | `<<subordinate>> <<authoritative>>` | `src/gtl` | Original graph-algebra relation data. |
| `TraversalValidation` | `ValidationFamily` | `<<subordinate>> <<authoritative>>` | `src/validator` | Static closed judgment; never executable. |
| `AdmittedImplementationSet` | `InvocationBasis` | `<<authoritative>>` | `src/abg` | Invocation-bound complete executable-leaf realization basis. |
| `AdmittedInteractionSet` | `InvocationBasis` | `<<authoritative>>` | `src/abg` | Invocation-bound F_H request, response, capability, and continuation contract basis; never executable. |
| `ChildTraversalPreparationPort` | `InvocationBasis` | `<<effect-edge>>` | operation application over `src/gtl`, `src/validator`, and `src/abg` owner ports | Total child preparation without HoG-to-Product or HoG-to-validator dependency. |
| `TraversalCursor` | `TraversalAggregateFamily` | `<<subordinate>>` | `src/hog` | Derived, invocation-local position. |
| `TraversalStep` | `TraversalAggregateFamily` | `<<subordinate>>` | `src/hog` | Exhaustive direct-fold result. |
| `LeafExecutionPort` | `LeafRealizationBoundary` | `<<effect-edge>>` | `src/implementation` | Bound F_D or F_P leaf effect interior. |
| `HumanInteractionBoundary` | external actor, not IACS | `<<effect-edge>>` | external plus `src/abg` admission | F_H request and attributed response candidate; never an implementation port. |
| `AdmittedRoute` | `RuntimeEventFamily` | `<<authoritative>>` | `src/abg` | Accepted runtime transition event. |
| `FanOutCompletion` | `RuntimeEventFamily` | `<<subordinate>> <<authoritative>>` | `src/abg` | Frame-local complete-vector or partial-stop truth; never a Vector aggregate. |
| `Continuation` | `TraversalAggregateFamily` | `<<authoritative>>` | `src/abg` | Run-local open obligation and exact terminal lifecycle truth. |
| `ContinuationBasis` | `ReplayProjectionFamily` | `<<downstream>>` | `src/abg` | Events-only hold and resume projection. |
| `ReopenedEventStoreContext` | `RuntimeEventFamily` | `<<effect-edge>>` | `src/abg` | Exclusive append context over one verified durable event prefix; no new authority family. |
| `ReplayState` | `ReplayProjectionFamily` | `<<downstream>>` | `src/abg` | Events-only runtime projection. |

Canonical JSON, digest, immutable-value, and opaque-ref utilities move to
`src/shared`. They are pure implementation primitives, not Ontology carriers,
program meaning, or admission authority. `gtl` and `validator` may depend on
`shared`; `product` consumes them rather than owning them.

## 6. Direct Traversal Semantics

| Constructor | HoG relation | ABG truth |
|---|---|---|
| `C.of` | derive one leaf stop at exact term path and invoke exact admitted port | uniform C-call spine |
| `C.id` | pass admitted input unchanged | no C-call and no fabricated gate pass |
| `C.compose` | traverse the canonical flat term family in order, binding each admitted output into the next term | each child retains its own truth |
| `C.edge` | traverse transform, evaluate, consequence in declared order | ordinary child C calls; no edge runner |
| `workflow.C` | open one transparent parent C call, prepare/open/traverse the named child, then complete the parent attempt | child lineage plus `sub_traversal` evidence, one parent result and judgment, and admitted foldback; preparation rejection totalizes the parent spine |
| `C.batch` | traverse the declared non-empty task family in stable ordinal order; concurrency is optional realization | one C-call, result, and judgment per task plus a non-authoritative grouping ref and ordered per-task result projection; no synthetic aggregate result |
| `C.retry` | traverse wrapped term until success, non-retry disposition, or budget | fresh attempt identity, admitted retry route, retained prior evidence |

An `F_H` `C.of` follows the same C-call locus and selected-fibre event shape but
does not call `LeafExecutionPort`. Its request invocation completes the uniform
spine with a typed pending result and pending judgment, from which ABG event
truth opens the authoritative `Continuation` aggregate. A later
`interaction.respond` operation admits an attributed response against that
exact continuation and response contract but does not invoke HoG. A separate
`run.continue` operation rehydrates the durable scope, admits resume truth, and
then explicitly re-enters HoG. It does not append a second result or judgment
to the completed request C call. T-270 owns the current domain interaction
policy and exact continued GTL locus; completed T-272 records the retained
behavioral basis.

`workflow.C` follows the same parent-level law. It first opens a transparent
parent C call, then traverses its prepared child. A terminal child produces
`sub_traversal` evidence and the one parent result and judgment. A rejected
child preparation totalizes the parent call from the actual rejection. A held
child completes that parent attempt with pending evidence, result, and
judgment, and opens a continuation. Resumption uses a fresh positive parent
attempt coordinate, consumes the replay-derived child completion, and never
re-executes a closed child or appends to the prior pending C call.

The source path is a stable sequence of segments rooted at the graph node:

```text
node/<node-ref>/c
  /terms/<zero-based-ordinal>
  /transform | /evaluate | /consequence
  /tasks/<zero-based-ordinal>
  /term
```

The path is identity input, not a compiled node. HoG reads the term at that
path from the admitted materialized Graph each time it derives a step.

### 6.1 Graph algebra projection

The complete `GraphTemplate` preserves the constitutional Graph fields. Graph
algebra operations remain GTL constructors. Runtime traverses their resulting
declared relation; it does not infer or reconstruct the operation.

| Relation | GTL construction truth | Direct runtime meaning |
|---|---|---|
| `edge` | one explicit GraphVector between typed boundary nodes | traverse source locus, declared vector relation, then target locus |
| `identity` | graph or GraphFunction preserving one interface | pass admitted value with no fabricated check or effect |
| `compose` | one application relation and materialized composed graph with exact interface wiring | traverse declared left then right child relation |
| `substitute` | outer graph with one exact vector replaced by visible interface-compatible inner graph | traverse the resulting graph; provenance retains outer vector and inner graph refs |
| `recurse` | callable relation with termination, foldback, and positive bound | open child graph calls until admitted termination; foldback rebinds and re-evaluates parent |
| `fan_out` | element GraphFunction plus explicit ordered input/output vector relation | pure GTL materialization projects one `C.batch` task per admitted input member before child HoG entry; each task retains ordinal, member lineage, child GraphFunction, contracts, and enclosing C authority; ABG admits exactly one complete-vector or partial-stop event after task traversal |
| `fan_in` | reducer GraphFunction plus complete vector contract | invoke one child reducer only after complete vector admission |
| `gate` | target, rule, and evaluator refs | admit block or advance from evaluator truth; never select a candidate |
| `promote` | explicit representation-boundary relation | apply the declared typed relation without changing semantic identity |
| `same_object` | exact identity witness | no runtime work; validator proves identity |

Composition, substitution, promotion, identity, and same-object are normally
resolved by typed construction and validation into the materialized original
GTL value. Recursion, fan-out, fan-in, and gate retain explicit runtime-visible
application declarations because they govern child traversal or admission.
Every child GraphFunction reachable through those declarations is included in
whole-root validation and the transitive executable and interaction censuses
before root HoG entry. Dynamic selection may choose only among that statically admitted
reachable set. A selected child is materialized and its exact call/frame basis
is admitted before child HoG entry; the root set is not a substitute for that
child invocation-local admission.

The mapping is decidable:

```text
keys(rootExecutableSet.rows) == rootValidation.transitiveReachableExecutableLeafKeys
keys(rootInteractionSet.rows) == rootValidation.transitiveReachableInteractionLeafKeys
childExecutableKeys == childValidation.reachableExecutableLeafKeys
childInteractionKeys == childValidation.reachableInteractionLeafKeys
childExecutableRows == rootExecutableSet.rows filtered by childExecutableKeys
childInteractionRows == rootInteractionSet.rows filtered by childInteractionKeys
keys(childExecutableRows) == childExecutableKeys
keys(childInteractionRows) == childInteractionKeys
```

Every filtered row retains its owning root-set ref and digest plus its typed
key. The child `ExecutionBasis` binds both root-set refs/digests, both exact
child-set digests, the child GraphFunction and materialization digests, and the
child validation ref. F_H rows never enter an implementation set. This is
invocation-local admission of already resolved declarations, not ambient
selection or a second implementation-resolution authority.

Child preparation preserves the accepted M3 topology. The stateless operation
application binds `ChildTraversalPreparationPort` once from the GTL
materializer, validator judgment, and ABG admission functions and supplies the
total port to HoG. HoG sends only the GTL-declared child ref, admitted child
input, parent scope, and admitted root sets. It receives one
`PreparedChildTraversal` or typed refusal. HoG never imports or invokes Product
or validator, Product never re-resolves the admitted root set during traversal,
and the port cannot select a child or author topology.

For fan-out, the ordered task declarations are fixed before the first task
enters HoG. After traversal, `admitFanOutCompletion` compares the declared input
cardinality against the full replayed task census. The `complete_vector` variant
requires one judged task row and one contract-valid output member at every
ordinal and admits the canonical ordered output vector. The `partial_stop`
variant requires exact completed, stopping, and unstarted partitions and
forbids an output-vector field. Either admission precedes any fan-in or graph
success route; only `complete_vector` can make those routes applicable.

### 6.2 Preserved M3 admission staging

M5 widens cardinality without collapsing the accepted M3 stages:

```text
raw input and complete Program root admitted
  -> ProgramValidation
  -> InvocationAdmission
  -> GraphFunction materialization from admitted input
  -> GraphValidation over the original materialized Graph and C terms
  -> Product proposes the complete reachable F_D/F_P implementation set
  -> validator checks declaration, package, and contract relations
  -> validator emits the complete reachable F_H interaction-contract set
  -> ABG admits both disjoint sets and the exact ExecutionBasis
  -> ABG opens Run, GraphCall, and Frame
  -> HoG enters the original GTL
```

A refusal after `InvocationAdmission` is admitted as `invocation_refused` and
projects through replay. A refusal before it returns the typed pre-invocation
result. Neither path can enter HoG. After a C call opens, an actual contract or
candidate rejection is totalized by `completeRejectedCCall`; direct transition
to `Blocked` or `Failed` without `result_admitted -> judged` is prohibited.

### 6.3 Durable continuation reconstruction

Durability belongs to the admitted event log and immutable declaration basis,
not to process-local brands, closures, weak sets, or object identity. Reopening
first constructs the event append context; continuation carriers are rebuilt
only inside that context.

`reopenEventStore` consumes an existing durable path, the expected complete-log
digest projected by the current `ContinuationBasis`, and the immutable
event-contract basis. A caller may echo that digest but cannot select another
one. The function:

1. opens the existing sink without create or truncate and acquires exclusive
   append ownership for the context lifetime;
2. reads the complete canonical JSON-lines prefix, requiring a terminal newline
   and rejecting a partial or non-canonical record;
3. validates every preserved envelope against the selected event union,
   recomputes its payload digest and event id using its preserved ordinal, and
   requires unique event ids plus the exact gap-free ordinal sequence `1..n`;
4. validates every historical causation ref against an earlier event in the
   same prefix and re-applies the canonical scope and cross-run rules;
5. compares the canonical prefix digest and file identity/length with the
   requested basis, then seeds one `ReopenedEventStoreContext` with those exact
   frozen historical envelopes and the same durable path; and
6. sets the live admission cursor to `maxOrdinal` (`0` for an empty existing
   log). The next candidate is store-stamped at `maxOrdinal + 1`, appended with
   append-only semantics, durably synchronized, and only then made visible to
   replay. Each append rechecks the owned file identity and expected prior
   length so a second writer or replaced sink fails closed.

No historical event passes through live admission, receives another stamp, or
is written again. Reopening itself emits no runtime event. It changes no fluent;
it validates and resumes the one canonical emitter context required to append
new truth. The context is operation-scoped and closes after its atomic admission
batch; a later public operation lawfully reopens the same verified prefix rather
than sharing ambient process state.

Initial invocation and later reopening are disjoint operations. Initial
invocation may create one absent sink with exclusive-create semantics. A
response or continuation operation must call `reopenEventStore` on that existing
sink and is forbidden from invoking the create-empty path.

An admitted `run.continue` public operation then supplies that reopened context,
the public-operation admission ref, continuation identity, expected run, acting
operator and capability, selected immutable Product/install/workspace/catalog
basis, and any declared continuation input. `rehydrateContinuation`:

1. replays exactly one run-local open `Continuation` with no resolved,
   superseded, or abandoned terminal event;
2. verifies its Product, workspace binding, catalog view, Program,
   GraphFunction, materialization, validation, executable-set,
   interaction-set, ExecutionBasis, Run, GraphCall, Frame, C-call, cursor,
   input, request, and response-contract refs and digests against the selected
   immutable declarations;
3. requires exactly one matching admitted response when the continuation kind
   requires F_H input;
4. verifies the `run.continue` public-operation event, acting operator,
   capability, continuation identity, and declared input against the open
   member and policy;
5. reconstructs fresh owner-issued `ExecutionBasis`, `OpenedTraversalScope`,
   cursor, and input carriers only after canonical body and digest equality;
   process-local branding is renewed evidence, never durable authority; and
6. appends `fh_interaction_resume_admitted` for F_H or
   `continuation_resume_admitted` for another declared continuation kind before
   `run.continue` explicitly re-enters HoG.

Missing bodies, log replacement, ordinal or stamp drift, stale or multiple open
members, wrong public operation, actor, capability, response contract, cross-run
identity, changed workspace/product/catalog authority, or another basis fork
refuses before HoG and appends no resume event. The `interaction.respond`
operation may obtain its own reopened append context, but its semantic admission
only appends actor-attributed response truth; it cannot reconstruct execution
carriers or perform continuation steps 1-6.

## 7. Three-View Projection

### 7.1 Domain view

```mermaid
classDiagram
  class GtlDeclarationFamily {
    <<prime>>
    <<authoritative>>
    +Program
    +GraphFunction
    +Graph
  }
  class CProgramTerm {
    <<subordinate>>
    <<authoritative>>
    +constructorKind
    +inputCarrierRef
    +outputCarrierRef
  }
  class CLeafTerm {
    <<subordinate>>
    <<authoritative>>
    +executableOrInteractionKey
    +programLocusRef
  }
  class ExecutableLeafRequirement {
    <<subordinate>>
    <<authoritative>>
    +bindingRef
    +seamContractRefs
  }
  class InteractionLeafRequirement {
    <<subordinate>>
    <<authoritative>>
    +interactionKind
    +responseContractRef
  }
  class GraphTemplate {
    <<subordinate>>
    <<authoritative>>
    +nodes
    +vectors
    +boundaryInterface
  }
  class GraphFunctionApplication {
    <<subordinate>>
    <<authoritative>>
    +relationKind
    +operandRefs
  }
  class ValidationFamily {
    <<prime>>
    <<authoritative>>
    +TraversalValidation
  }
  class ValidatedTraversalDeclaration {
    <<subordinate>>
    <<authoritative>>
    +validationRef
    +reachableExecutableLeafKeys
    +reachableInteractionLeafKeys
  }
  class EnvironmentBasis {
    <<prime>>
    <<authoritative>>
    +CatalogView
    +ImplementationBindings
  }
  class InvocationBasis {
    <<prime>>
    <<authoritative>>
    +InvocationAdmission
    +ExecutionBasis
  }
  class AdmittedImplementationSet {
    <<authoritative>>
    +invocationRef
    +leafResolutionRefs
  }
  class AdmittedInteractionSet {
    <<authoritative>>
    +invocationRef
    +interactionContractRefs
  }
  class ChildTraversalPreparationPort {
    <<effect-edge>>
    -prepareDeclaredChild
  }
  class TraversalAggregateFamily {
    <<prime>>
    <<authoritative>>
    +Run
    +GraphCall
    +Frame
    +CCall
    +Continuation
  }
  class TraversalCursor {
    <<subordinate>>
    -termPath
    -taskOrdinal
    -attempt
  }
  class TraversalStep {
    <<subordinate>>
    -stepKind
    -sourceCursor
  }
  class LeafExecutionPort {
    <<effect-edge>>
    -invoke
  }
  class LeafRealizationBoundary {
    <<prime>>
    <<authoritative>>
    +F_D bindings
    +F_P bindings
  }
  class HumanInteractionBoundary {
    <<effect-edge>>
    -request
    -respond
  }
  class RuntimeEventFamily {
    <<prime>>
    <<authoritative>>
    +RuntimeEvent
  }
  class AdmittedRoute {
    <<subordinate>>
    <<authoritative>>
    +routeKind
    +sourceCursor
    +targetCursor
  }
  class FanOutCompletion {
    <<subordinate>>
    <<authoritative>>
    +completionKind
    +orderedTaskRefs
    +outputVectorOrStop
  }
  class RouteCandidate {
    <<subordinate>>
    <<effect-edge>>
    -routeKind
    -basisRef
  }
  class ContinuationBasis {
    <<downstream>>
    +heldCursor
    +responseContractRef
  }
  class Continuation {
    <<subordinate>>
    <<authoritative>>
    +continuationId
    +continuationKind
    +runId
    +causedByEventRef
  }
  class ReopenedEventStoreContext {
    <<effect-edge>>
    -durablePath
    -verifiedPrefixDigest
    -lastAdmissionOrdinal
  }
  class ReplayProjectionFamily {
    <<prime>>
    <<downstream>>
    +ReplayState
    +PublicOutcome
  }
  class ReplayState {
    <<downstream>>
    +runtimeStatus
    +currentCursor
  }
  class DeferredM5DomainPrograms {
    <<deferred>>
    +OneSurface
    +Consensus
    +ObserverTuner
    +PublicBreadth
  }
  GtlDeclarationFamily *-- CProgramTerm
  CProgramTerm *-- CLeafTerm : constructC
  CLeafTerm *-- ExecutableLeafRequirement : F_D or F_P
  CLeafTerm *-- InteractionLeafRequirement : F_H
  GtlDeclarationFamily *-- GraphTemplate : materializeGraph
  GtlDeclarationFamily *-- GraphFunctionApplication
  ValidationFamily --> GtlDeclarationFamily : validates
  ValidationFamily *-- ValidatedTraversalDeclaration : validateTraversal
  EnvironmentBasis --> GtlDeclarationFamily : supplies catalog truth
  InvocationBasis *-- AdmittedImplementationSet
  InvocationBasis *-- AdmittedInteractionSet
  InvocationBasis *-- ChildTraversalPreparationPort
  ChildTraversalPreparationPort --> GtlDeclarationFamily : materializes declared child
  ChildTraversalPreparationPort --> ValidationFamily : consumes child judgment
  ChildTraversalPreparationPort --> InvocationBasis : requests ABG admission
  AdmittedImplementationSet --> ExecutableLeafRequirement : resolves exact keys
  AdmittedInteractionSet --> InteractionLeafRequirement : admits exact keys
  TraversalAggregateFamily *-- TraversalCursor
  TraversalAggregateFamily *-- TraversalStep : deriveTraversalStep
  TraversalAggregateFamily *-- Continuation
  TraversalAggregateFamily --> InvocationBasis : consumes exact basis
  LeafRealizationBoundary *-- LeafExecutionPort
  TraversalCursor --> LeafExecutionPort : invokeLeafPort
  TraversalCursor --> HumanInteractionBoundary : emits declared F_H hold
  RuntimeEventFamily *-- AdmittedRoute
  RuntimeEventFamily *-- FanOutCompletion
  RuntimeEventFamily *-- ReopenedEventStoreContext
  RuntimeEventFamily --> Continuation : records lifecycle
  TraversalAggregateFamily *-- RouteCandidate
  RouteCandidate --> AdmittedRoute : admitRoute
  ContinuationBasis --> TraversalCursor : preserves held position
  Continuation --> ContinuationBasis : replay projects
  ReopenedEventStoreContext --> ReplayState : seeds exact historical prefix
  FanOutCompletion --> AdmittedRoute : enables declared route
  ReplayProjectionFamily *-- ContinuationBasis
  ReplayProjectionFamily *-- ReplayState
  ReplayState --> RuntimeEventFamily : rehydrateReplay
  DeferredM5DomainPrograms ..> GtlDeclarationFamily : later domain declarations
```

### 7.2 Sequence view

| Participant | Domain identity or boundary |
|---|---|
| Caller | explicitly external actor |
| Attributed F_H Actor | explicitly external actor |
| Public | stateless public operation transport; no semantic carrier or state |
| Child Preparation Port | stateless operation-bound composition of GTL, validator, and ABG owner functions; no selection or state |
| GTL | `GtlDeclarationFamily`; materializes the published GraphFunction template |
| Validator | `ValidationFamily` |
| Product | `EnvironmentBasis` catalog projection; proposes implementation matches |
| ABG | `InvocationBasis`, `TraversalAggregateFamily`, `RuntimeEventFamily`, and `ReplayProjectionFamily` |
| HoG | subordinate `TraversalCursor` and `TraversalStep` under `TraversalAggregateFamily` |
| LeafExecutionPort | effect edge under `LeafRealizationBoundary` |

```mermaid
sequenceDiagram
  participant Caller
  participant Human as Attributed F_H Actor
  participant Public
  participant Prep as Child Preparation Port
  participant GTL
  participant Validator
  participant Product
  participant ABG
  participant HoG
  participant Port as LeafExecutionPort
  Caller->>Public: invoke exact Product, workspace, catalog, Program, and GraphFunction
  Public->>Validator: raw-admit input and validate complete Program root
  Validator-->>Public: ProgramValidation or typed refusal
  Public->>ABG: admit input, Program, function, environment, policy, and authority
  ABG-->>Public: InvocationAdmission or typed refusal
  Public->>GTL: materialize original Graph from admitted input
  GTL-->>Public: original GTL Graph candidate
  Public->>Validator: validate Graph plus C terms against ProgramValidation
  Validator-->>Public: TraversalValidation or typed gap
  alt Graph validation gap after InvocationAdmission
    Public->>ABG: admitInvocationRefusal with exact gap and stage
    ABG-->>Public: replay-derived invocation refusal
    Public-->>Caller: typed refused outcome
  else Graph validation admitted
    Public->>Product: resolve complete transitive executable-key set
    Product-->>Public: exact implementation candidates or typed gap
    Public->>Validator: validate executable matches and exact F_H contract-key set
    Validator-->>Public: validated disjoint executable and interaction sets or typed gap
    alt Resolution or candidate-validation gap
      Public->>ABG: admitInvocationRefusal with exact rejected stage
      ABG-->>Public: replay-derived invocation refusal
      Public-->>Caller: typed refused outcome
    else Candidate set validated
      Public->>ABG: admit executable set, interaction set, and exact ExecutionBasis
      ABG-->>Public: ExecutionBasis or replay-derived invocation refusal
      alt ABG basis admission refused
        Public-->>Caller: typed refused outcome
      else Exact root basis admitted
        Public->>ABG: open Run, GraphCall, and Frame
        ABG-->>Public: OpenedTraversalScope
        Public->>HoG: traverse original GTL with admitted ports
        HoG->>ABG: admit initial traversal_cursor_entered from original GTL and scope
        ABG-->>HoG: replay-derived active initial locus
        loop direct fold over GTL and current replay
        HoG->>HoG: derive TraversalStep from term and cursor
        alt F_D or F_P C.of
          HoG->>ABG: open exact CCall
          HoG->>Port: invoke admitted leaf interior
          Port-->>HoG: evidence and result candidates
          HoG->>ABG: admit evidence, result, and judgment
          ABG-->>HoG: replay-derived CCall truth or totalized missing suffix
        else F_H C.of
          HoG->>ABG: open exact CCall and submit pending suffix, GTL hold route, and Continuation
          ABG->>ABG: atomically append judgment, hold route, then caused continuation opening
          ABG-->>HoG: replay-derived held truth
          HoG-->>Public: typed held traversal stop
          Public-->>Caller: typed held outcome, current operation stops
          Human->>Public: later interaction.respond with attributed response candidate
          Public->>ABG: reopen existing durable sink without restamping
          ABG-->>Public: ReopenedEventStoreContext or typed refusal
          Public->>ABG: admit interaction.respond ingress with actor and capability
          ABG-->>Public: public-operation admission event
          Public->>ABG: admit response against exact open Continuation
          ABG-->>Public: actor-attributed response truth only
          Public-->>Human: typed response-admitted outcome
          Caller->>Public: later run.continue naming run, Continuation, actor, capability, and input
          Public->>ABG: reopen existing durable sink and preserve exact historical prefix
          ABG-->>Public: ReopenedEventStoreContext or typed refusal
          Public->>ABG: admit run.continue ingress with actor, capability, and input
          ABG-->>Public: public-operation admission event
          Public->>ABG: rehydrate replay and exact immutable authority basis in reopened context
          ABG->>ABG: reconstruct owner-issued basis, scope, cursor, and input and admit resume
          ABG-->>Public: RehydratedContinuationScope or typed basis-fork refusal
          Public->>HoG: explicitly re-enter exact cursor with admitted continued input
        else workflow.C
          HoG->>ABG: open transparent parent CCall with declared parent fibre and arm
          HoG->>Prep: prepare GTL-declared child using parent scope and admitted root sets
          Prep->>GTL: materialize original child Graph
          GTL-->>Prep: original child GTL value
          Prep->>Validator: validate child Graph and both exact child key subsets
          Validator-->>Prep: child TraversalValidation or typed gap
          Prep->>ABG: admit child subsets, ExecutionBasis, GraphCall, and Frame
          ABG-->>Prep: PreparedChildTraversal or admitted child refusal
          Prep-->>HoG: prepared child or typed refusal
          alt child preparation refused
            HoG->>ABG: totalize parent CCall from actual preparation rejection
          else child prepared
            HoG->>HoG: traverse named child GTL
            HoG->>ABG: admit sub_traversal evidence, parent result, and parent judgment
            ABG-->>HoG: complete transparent parent CCall truth
          end
        else recurse, fan_out, or fan_in child relation
          HoG->>Prep: prepare exact GTL-declared child application
          Prep-->>HoG: PreparedChildTraversal or typed refusal
          alt child preparation refused
            Prep->>ABG: admit child_preparation_refused under parent frame
            ABG-->>HoG: replay-derived refusal available to declared route evaluation
          else child prepared
            HoG->>HoG: traverse named child GTL or projected fan-out C.batch
            HoG->>ABG: admit child foldback candidate
            opt fan_out application completed or stopped
              HoG->>ABG: submit exact ordered task census and completion variant
              ABG-->>HoG: fan_out_completion_admitted or typed refusal
            end
          end
        else batch or retry
          HoG->>HoG: derive task or attempt cursor from declared term
        end
        opt branch has not already consumed an admitted hold or terminal route
          HoG->>ABG: propose declared consequence route when current replay permits
          ABG-->>HoG: admitted route or typed refusal
          HoG->>HoG: apply admitted route
        end
        end
        alt terminal
          HoG->>ABG: submit current closure candidate
          ABG-->>Public: admitted closure and replay
        else F_H hold or gap
          ABG-->>Public: replay-derived ContinuationBasis
        end
        Public-->>Caller: typed replay-derived outcome
      end
    end
  end
```

### 7.3 Lifecycle view

```mermaid
stateDiagram-v2
  [*] --> Authored
  Authored --> Invalid: raw admission or Program validation refuses
  Authored --> ProgramValidated: validator admits complete Program root
  ProgramValidated --> InvocationAdmitted: ABG admits exact invocation
  InvocationAdmitted --> InvocationRefused: ABG admits Graph validation gap
  InvocationAdmitted --> GraphValidated: validator admits original Graph and C terms
  GraphValidated --> InvocationRefused: ABG admits resolution or basis gap
  GraphValidated --> BasisAdmitted: ABG admits executable set, interaction set, and ExecutionBasis
  BasisAdmitted --> Opened: ABG opens Run, GraphCall, and Frame
  Opened --> AtTerm: HoG derives and ABG admits initial cursor from GTL plus replay
  AtTerm --> AtTerm: HoG applies admitted identity, compose, edge, or advance route
  AtTerm --> RetryAttemptActive: ABG opens declared retry attempt
  RetryAttemptActive --> RetryProgressAvailable: ABG records judged attempt and terminates active attempt
  RetryProgressAvailable --> AtTerm: admitted retry or advance route consumes progress
  RetryProgressAvailable --> HoldRouteAdmitted: admitted hold route consumes progress
  RetryProgressAvailable --> Blocked: admitted blocked route consumes progress and run stops
  RetryProgressAvailable --> Failed: admitted failed route consumes progress and run stops
  AtTerm --> WorkflowParentOpen: ABG opens transparent workflow CCall
  WorkflowParentOpen --> ChildPreparing: HoG invokes admitted preparation port
  AtTerm --> ChildPreparing: HoG derives recurse, fan-out, or fan-in child request
  ChildPreparing --> ParentRejectedBeforeResult: workflow child preparation refuses after parent open
  ChildPreparing --> ChildPreparationRefused: ABG admits non-workflow preparation refusal
  ChildPreparationRefused --> HoldRouteAdmitted: declared hold route admitted
  ChildPreparationRefused --> Blocked: declared blocked route admitted and run stops
  ChildPreparationRefused --> Failed: declared failed route admitted and run stops
  ChildPreparing --> ChildBasisAdmitted: port returns exact child subsets, basis, and scope
  ChildBasisAdmitted --> ChildActive: ABG opens child GraphCall and Frame
  ChildActive --> WorkflowParentResult: workflow child reaches terminal, held, blocked, failed, or refused truth
  WorkflowParentResult --> CCallJudged: ABG admits sub-traversal evidence, parent result, and judgment
  ChildActive --> ChildFoldbackAvailable: ABG admits non-workflow foldback truth
  ChildFoldbackAvailable --> AtTerm: admitted route consumes foldback and HoG applies it
  ChildActive --> FanOutCompletionPending: fan-out task family completes or stops
  FanOutCompletionPending --> FanOutVectorAdmitted: ABG admits exact ordered output vector
  FanOutCompletionPending --> FanOutPartialStopped: ABG admits completed, stopping, and unstarted partition
  FanOutVectorAdmitted --> AtTerm: declared graph-success route consumes vector
  FanOutPartialStopped --> HoldRouteAdmitted: declared hold route consumes partial stop
  FanOutPartialStopped --> Blocked: declared blocked route consumes partial stop and run stops
  FanOutPartialStopped --> Failed: declared failed route consumes partial stop and run stops
  ParentRejectedBeforeResult --> ResultAdmitted: ABG admits rejection evidence and typed refusal result
  AtTerm --> CCallOpen: ABG atomically opens and selects fibre
  CCallOpen --> EvidenceAdmitted: ABG admits evidence
  CCallOpen --> ResultAdmitted: ABG admits result with zero evidence rows
  EvidenceAdmitted --> EvidenceAdmitted: ABG admits another evidence row
  EvidenceAdmitted --> ResultAdmitted: ABG admits result
  CCallOpen --> RejectedBeforeResult: evidence or result contract rejects
  EvidenceAdmitted --> RejectedBeforeResult: later evidence or result contract rejects
  RejectedBeforeResult --> ResultAdmitted: ABG admits rejection evidence and typed refusal result
  ResultAdmitted --> CCallJudged: ABG admits judgment
  ResultAdmitted --> JudgmentRejected: judgment candidate rejects
  JudgmentRejected --> CCallJudged: ABG admits rejection judgment only
  CCallJudged --> AtTerm: ABG admits advance route and HoG applies it
  CCallJudged --> HoldRouteAdmitted: ABG admits hold route from pending F_H, child, or yield truth
  HoldRouteAdmitted --> Held: ABG opens Continuation and consumes hold-route availability
  CCallJudged --> Blocked: admitted blocked route and run stop
  Held --> ResponseAdmitted: separate interaction.respond admits attributed F_H response
  Held --> ReplayRehydrated: run.continue rehydrates a non-F_H current input
  ResponseAdmitted --> ReplayRehydrated: later run.continue rehydrates exact durable scope
  ReplayRehydrated --> ResumeAdmitted: ABG admits resume and resolves Continuation
  ResumeAdmitted --> AtTerm: public operation explicitly re-enters HoG
  AtTerm --> Closed: ABG admits terminal predicate and closure events
  Opened --> Failed: pre-call or closure runtime_failure_observed admitted
  Closed --> [*]
  Invalid --> [*]
  InvocationRefused --> [*]
  Blocked --> [*]
  Failed --> [*]
```

The lifecycle view above projects the complete target continuation algebra.
Edges marked `deferred` are not part of the selected S03 realization or proof:

```mermaid
stateDiagram-v2
  [*] --> Open: fh_interaction_opened or continuation_opened
  Open --> Responded: fh_interaction_responded
  Open --> Resolved: continuation_resume_admitted
  Responded --> Resolved: fh_interaction_resume_admitted
  Open --> Superseded: deferred continuation_superseded
  Responded --> Superseded: deferred continuation_superseded
  Open --> Abandoned: deferred continuation_abandoned
  Responded --> Abandoned: deferred continuation_abandoned
  Resolved --> [*]
  Superseded --> [*]
  Abandoned --> [*]
```

## 8. Cross-View Axiom Evaluation

| Axiom | Ontology evidence | Authority | Domain | Sequence | State | Native enforcement | Admission enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|---|
| original GTL is sole program | C term and application relations | GTL | declaration family | direct fold | authored to validated | discriminated unions | validation digest and basis | pass | none |
| no compiled execution carrier | Prime contraction | GTL and HoG | no plan carrier | original term consumed | no plan state | import and type boundary | rival-authority mutation | pass | none |
| seven constructors exhaustive | C invariant | GTL | `CProgramTerm` | exhaustive fold | structural loop | `never` exhaustiveness | raw admission and validator | pass | none |
| C-call identity is fibre-free | C-call locus invariant | ABG | `CLeafTerm` plus traversal aggregate | fibre selected only after open | one locus through every fibre | identity tuple omits regime | C-call open/select admission | pass | none |
| executable selection and F_H contract admission precede traversal | disjoint requirement and set relations | Product proposes executable matches; validator declares F_H rows; ABG admits both | executable and interaction sets | both admitted before HoG | basis refused or opened | disjoint key unions | exact transitive equality for both sets | pass | none |
| child basis is exact and local without topology drift | preparation-port and child-set equality laws | stateless port invokes GTL, validator, and ABG owners | root sets plus child validation | HoG calls one admitted preparation port | ChildPreparing to ChildActive | typed total port | child ExecutionBasis binds both root and child set digests | pass | none |
| post-invocation gaps are runtime truth | preserved M3 staging | ABG | InvocationBasis and RuntimeEventFamily | public submits typed gap to ABG | InvocationAdmitted to InvocationRefused | no validator event writer | `admitInvocationRefusal` | pass | none |
| uniform C-call spine | lifecycle matrix | ABG | traversal aggregate | leaf admission | open to judged | shared CCall API | replay-order checks | pass | none |
| workflow.C has one transparent parent spine | workflow invariant and lifecycle | ABG | parent CCall plus child scope | parent opens before preparation and completes after child outcome | WorkflowParentOpen through CCallJudged | parent attempt identity | sub_traversal evidence and exactly one parent result/judgment | pass | none |
| post-open rejection adds only missing suffix | rejection lifecycle and authority row | ABG | rejection candidate under C call | stage-sensitive totalizer | rejected-before-result or judgment-rejected to judged | spine-position union | exactly one result and judgment | pass | none |
| batch and fan-out preserve task cardinality | C.batch and fan-out laws | GTL, HoG, ABG | ordered task declarations plus `FanOutCompletion` | GTL projects batch, HoG traverses tasks, ABG admits complete or partial census | one task spine each then one completion variant | stable ordinal task union | exact complete-vector or completed/stopping/unstarted partition; no vector on partial stop | pass | none |
| fibre substitution preserves shape | fibre invariant | GTL declaration | same term topology | same fold | same lifecycle | generic leaf variant | differential proof | pass | T-270 proof |
| worker cannot mint truth | authority matrix | ABG | effect-edge port | candidates returned | no direct closed edge | port lacks event methods | candidate admission | pass | none |
| F_H is not an implementation or ABG callback | disjoint key sets and authority matrices | human, separate public operations, and ABG | interaction requirement plus Continuation | invoke stops, interaction.respond admits only response, run.continue rehydrates and re-enters HoG | Held through Responded, ReplayRehydrated, and ResumeAdmitted | no F_H implementation port and no ABG-to-HoG call | attributed response and resume admissions | pass | retained T-272 evidence under T-270 |
| child traversal is transparent | relationship inventory | HoG plus ABG | child lineage | child scope and foldback | ChildActive | typed child relation | child basis and replay | pass | T-270 implementation |
| continuation is authoritative and replay-constructible | Continuation aggregate, reopened store, and basis relation | ABG | open obligation plus downstream basis and exact historical prefix | reopen without restamp, verify public ingress, reconstruct, then separate resume and HoG re-entry | open/responded/resolved proven; superseded/abandoned target-only | preserved ordinals and owner constructors renewed only after equality | existing sink, max-plus-one append, immutable authority basis, and basis-fork refusal | pass for selected S03 path; two target transitions deferred | T-270 re-entry if Product selects supersede or abandon |
| continuation resume is actor-authorized | public-operation and continuation relations | public ingress plus ABG | `run.continue` admission, actor, capability, and input | public admission precedes same-run resume event | reopened through ResumeAdmitted | typed operation and capability refs | exact ingress event is causal input to resume | pass | retained T-272 evidence under T-270 |
| every new runtime fact has one event/effect law | RuntimeEventFamily delta | ABG | fixed event kinds and closed payload variants | append precedes downstream effect | every initiated active fluent has an explicit terminal consumer | closed event union | declared Event Calculus effect table and mutation proof | pass | none |
| public layer is not controller | unchanged M3 law | Product/ABG/HoG | no public Prime | one invoke call | no public private state | stateless operation types | public-controller mutation | pass | T-281 breadth |

## 9. Runtime Event And Replay Delta

M5 retains the accepted opening and closure kinds. The table below is the
complete target event delta and repeats existing opening kinds where their
fluent effects participate in the expanded lifecycle. Rows explicitly marked
`deferred` are not members of the selected S03 realization or proof and do not
claim current `RUNTIME_EVENT_KIND_VALUES` membership. The realized rows add no
second envelope or event family. Every realized row carries
the canonical envelope, a store-assigned admission ordinal, `basisId`, `runId`,
`graphFunctionRef`, `materializationRef`, `graphCallId`, `frameId`,
`frameLineageId`, unique admitted `causationEventRefs`, and `correlationId`
where the aggregate exists. Event-sink acceptance durably appends the event
before the next effectful step observes it.

| Event kind | Aggregate and required closed payload | Required causal basis | Declared Event Calculus effects |
|---|---|---|---|
| `run_segment_opened` | existing `run` payload plus exact ExecutionBasis and opening public-operation refs | admitted basis and invocation | initiates `run_active(runId)` |
| `graph_call_opened` | existing `graph_call` payload plus child relation, parent frame, and parent cursor refs when this is a child | active run plus admitted GraphFunction/materialization basis | initiates `graph_call_active(graphCallId)`; the child variant also initiates `parent_waiting_on_child(childGraphCallId)` |
| `frame_opened` | existing `frame` payload plus exact GraphCall and frame-lineage refs | active GraphCall | initiates `frame_active(frameId)` |
| `traversal_cursor_entered` | `frame`; initial cursor ref/digest, original GTL declaration and materialization refs/digests, term path, input ref/digest, and opened scope refs | active frame plus validated original GTL | initiates `locus_active(cursorRef)` |
| `traversal_route_admitted` | `frame`; route ref/digest, route kind from `advance`, `retry`, `hold`, `blocked`, `failed`, or `terminal`, declaration ref/digest, source and optional target cursor refs/digests, applicable CCall/judgment and consumed-availability refs | current opened scope plus the judgment, child refusal/foldback, fan-out completion, gate result, retry progress, or structural declaration that permits the route | every variant terminates `locus_active(sourceCursorRef)` and any named consumed-availability fluent; `advance` and `retry` initiate `locus_active(targetCursorRef)`; `hold` terminates `frame_active` and initiates `hold_route_admitted(routeRef)`; `blocked` and `failed` terminate `frame_active` plus exact active retry/hold fluents and initiate `frame_blocked(frameId)` or `frame_failed(frameId)`; `terminal` initiates `terminal_route_available(routeRef)` |
| `child_preparation_refused` | parent `frame`; application and child GraphFunction refs/digests, admitted child input ref/digest, preparation stage, exact validation gap or ABG refusal, source cursor ref/digest, and parent workflow CCall ref when present | active parent frame plus the exact preparation candidate and owner-produced gap/refusal | the non-workflow variant initiates `child_preparation_refusal_available(applicationRef)` for a later declared route; the workflow-parent variant initiates no free availability and instead becomes the direct cause of rejection evidence that totalizes the already-open parent CCall |
| `child_foldback_admitted` | parent `frame`; parent and child basis/GraphCall/Frame refs, closed child lifecycle disposition, child result/judgment/closure-or-stop refs, parent workflow CCall ref when present, foldback contract, source and candidate target cursor refs/digests | child close or stop event plus `parent_waiting_on_child` or parent CCall-open truth | terminates `parent_waiting_on_child(childGraphCallId)`; the non-workflow variant initiates `child_foldback_available(childGraphCallId)` for a later route or fan-out completion, while the workflow-parent variant becomes the direct cause of `sub_traversal` CCall evidence and initiates no free availability; the `stopped` variant also terminates still-active child GraphCall/Frame fluents, while the `closed` variant requires canonical close events already terminated them |
| `retry_attempt_opened` | `frame`; term path, task ordinal, positive attempt, retry path, declared budget and allowlist, prior judgment/route refs when present | initial term entry or admitted retry route | initiates `retry_attempt_active(attemptRef)` |
| `retry_progress_recorded` | `frame`; attempt ref, admitted result/judgment refs, retryability class, completed-attempt set, remaining budget | judged CCall for the exact attempt | terminates `retry_attempt_active(attemptRef)` and initiates `retry_progress_available(attemptRef)`; the next declared route consumes that fluent |
| `fan_out_completion_admitted` | parent `frame`; application, batch, input vector, contract and task refs; closed `completionKind`; `complete_vector` carries every ordered task CCall/result/judgment/output row plus canonical output vector ref/digest/body; `partial_stop` carries exact completed rows, one stopping ordinal/task/disposition/event, exact unstarted rows, and no output vector | all cited task judgments/foldbacks under the exact declared fan-out application and current replay | terminates every cited task `child_foldback_available` fluent; `complete_vector` initiates `fan_out_vector_available(applicationRef)`; `partial_stop` initiates `fan_out_partial_stop_available(applicationRef)`; a later declared route consumes the exact completion fluent, and no partial variant initiates vector truth |
| `continuation_opened` | `continuation`; continuation id, closed kind of `child_traversal`, `yield`, `retry`, or `external_input`, caused-by event, admitted hold-route ref, optional workspace reentry-link ref, held cursor ref/digest, remaining schedule or child refs, continuation-input contract, and complete Section 6.3 reconstruction basis | admitted hold route plus pending child/retry/yield truth in the same run; a replacement-run opening also cites the admitted workspace link | terminates `hold_route_admitted(routeRef)` and the cited `continuation_reentry_link_available` fluent when present; initiates `continuation_open(continuationId,runId)` and `frame_held(frameId)` |
| `fh_interaction_opened` | `continuation`; continuation id, kind `fh_interaction`, caused-by event, admitted hold-route ref, request and response contract refs, actor-capability ref, held cursor ref/digest, input ref/digest/body, executable and interaction set refs/digests, ExecutionBasis, Run, GraphCall, Frame, CCall, Program, GraphFunction, materialization, validation, Product, install, workspace, and catalog refs/digests | pending CCall judgment plus admitted hold route in the same run | terminates `hold_route_admitted(routeRef)`; initiates `continuation_open(continuationId,runId)`, `interaction_pending(continuationId)`, and `frame_held(frameId)` |
| `fh_interaction_responded` | `continuation`; actor and capability refs, response contract, response ref/digest and canonical admitted value, `interaction.respond` public-operation admission ref | exact open interaction plus admitted `interaction.respond` ingress in the same reopened store | initiates `continuation_response_available(continuationId)`; changes no traversal or terminal fluent |
| `continuation_resume_admitted` | `continuation`; durable prefix/replay digests, opened-event ref, `run.continue` public-operation admission ref, acting operator and capability refs, declared input ref/digest/body, verified reconstructed scope refs/digests, successor cursor and input refs/digests | exact open non-F_H member, admitted same-run `run.continue` ingress, valid current basis, and declared current input | terminates `continuation_open` and `frame_held`; initiates `continuation_terminated(continuationId,resolved)`, `frame_active(frameId)`, and `locus_active(successorCursorRef)` |
| `fh_interaction_resume_admitted` | `continuation`; durable prefix/replay digests, opened/responded-event refs, `run.continue` public-operation admission ref, acting operator and capability refs, declared input ref/digest/body, verified reconstructed scope refs/digests, successor cursor and input refs/digests | exact open member, admitted same-run `run.continue` ingress, valid current basis, and required admitted response truth | terminates `continuation_open`, `interaction_pending`, `continuation_response_available`, and `frame_held`; initiates `continuation_terminated(continuationId,resolved)`, `frame_active(frameId)`, and `locus_active(successorCursorRef)` |
| `continuation_superseded` (deferred) | target-only `continuation`; old member, response-state discriminant, accepted correction or reprice ref, and reason ref | unselected; requires a Product-authorized supersession operation | target-only effect; no current realization claim |
| `continuation_abandoned` (deferred) | target-only `continuation`; member, response-state discriminant, abandoning actor when present, prior terminal-cause event ref, and reason ref | unselected; requires a Product-authorized abandonment operation | target-only effect; no current realization claim |
| `continuation_reentry_link_admitted` (deferred) | target-only workspace link between an admitted supersession and replacement basis | unselected; depends on the deferred supersession transition | target-only effect; no current realization claim |
| `run_stopped` | `run`; closed disposition of `blocked`, `failed`, `operator_abort`, or `campaign_close`, exact still-open aggregate, cursor, retry, hold, parent-wait, availability, continuation-terminal, frame-state, CCall/judgment/route refs, and reason ref | admitted blocked/failed route or attributed operator stop in the same run; `runtime_failure_observed` remains its own accepted terminal path | terminates `run_active`, `graph_call_active`, every listed `frame_active`, `frame_held`, `frame_blocked`, `frame_failed`, `locus_active`, `retry_attempt_active`, `retry_progress_available`, `hold_route_admitted`, `parent_waiting_on_child`, child-refusal/foldback, and fan-out availability fluent; initiates `run_terminal(runId,disposition)` |
| `terminal_reached` | existing `frame` payload plus terminal-route ref and exact terminal predicate evidence | admitted `terminal` route under current replay | terminates `terminal_route_available(routeRef)` and initiates `terminal_admitted(frameId)` |
| `frame_closed` | existing `frame` closure payload | `terminal_reached` | terminates `frame_active(frameId)` and initiates `frame_closed(frameId)` |
| `graph_call_closed` | existing `graph_call` closure payload | final frame close | terminates `graph_call_active(graphCallId)` and initiates `graph_call_closed(graphCallId)` |
| `run_closed` | existing `run` closure payload | final GraphCall close | terminates `run_active(runId)` and initiates `run_closed(runId)` |

The effect declaration is a total function of the event kind and its closed
payload variant. Payload values parameterize fluent identities; they do not
select an undeclared effect family. Unknown kinds, unknown route or stop
variants, missing scope, missing causal predecessors, or an effect row absent
from this table refuse at event admission.

The pending C-call judgment, hold `traversal_route_admitted`, and matching
continuation-open event are one ordered atomic admission batch. The hold route
is constructed first and is therefore a valid cause of the continuation event;
neither becomes replay-visible unless the full batch is durably accepted. The
same atomicity rule applies to an admitted blocked/failed route and the
following `run_stopped`. A future path that selects abandonment must re-enter
this design and add its required atomic transition before claiming that target
behavior. This removes intermediate unowned hold or terminal states without
pretending the deferred event exists.

Child preparation reuses `basis_admitted`, `graph_call_opened`, and
`frame_opened` with the child refs and both exact child-set digests. Parent and
child leaf work reuses the canonical C-call spine. Successful aggregate closure
reuses `terminal_reached`, `frame_closed`, `graph_call_closed`, and
`run_closed`; their accepted M4 effects terminate their matching active
fluents. A blocked or failed selected S03 path emits `run_stopped` only after
its active continuation has resolved or the path has otherwise totalized that
continuation under currently admitted truth. General open-continuation
abandonment remains deferred. No terminal state is inferred from missing close
events.

The target cross-run supersession relation is retained as design history, not
current realization authority. If selected later, it must use workspace-scoped
payload linkage rather than forbidden cross-run event causation and must
re-enter T-270's boundary before implementation.

Replay validates the complete event union, canonical envelope, admission
ordinal, scope, causation, and declared effect relation before folding. It then
derives cursor, retry frontier, child foldback, open continuation, response,
run status, and public outcome only from admitted events plus immutable GTL and
Product declarations. A projector, worker, HoG cursor, or public operation
cannot write or repair these facts.

## 10. Implementation Projection

Implementation proceeds as one current-line evolution, not a donor merge:

1. move canonical JSON, digest, immutable-value, and opaque-ref primitives to
   `src/shared`; preserve M4 behavior;
2. add the typed C and GraphFunction-application declarations and constructors
   to `src/gtl`;
3. add raw admission and whole-root validation for those declarations;
4. generalize implementation resolution and `ExecutionBasis` from one root
   leaf to the complete executable set plus the disjoint F_H interaction set;
5. generalize C-call identity, transparent workflow parent spines, evidence
   classes, ordered batch task truth, and stage-total rejection;
6. bind `ChildTraversalPreparationPort` and replace root-only traversal with
   the exhaustive direct fold while retaining the M4 root as an ordinary
   one-leaf case;
7. extend the canonical ABG event union, Event Calculus, replay, fan-out
   completion admission, and existing-log append context with the exact Section
   9 delta;
8. add data-driven installed traversal and fibre-substitution proofs;
9. add live F_P only after RC5 B-001 transport behavior is re-adopted; and
10. expose separate response, operation-scoped durable reopen, and continuation
    ports as retained T-272 evidence for T-270's current S03 reconciliation,
    without moving One Surface authority into traversal infrastructure.

Implementation may refine private function decomposition and TypeScript
generic spelling. It may not change the entities, authority, lifecycle,
cross-module topology, effect ownership, or absence rules above without design
re-entry.

## 11. Acceptance Conditions

This design delta is acceptable when review confirms:

1. all seven C constructors are direct GTL data and have one exhaustive HoG
   interpretation;
2. complete executable resolution and disjoint F_H contract admission precede
   HoG and no public or HoG selector exists;
3. retry, ordered batch tasks, transparent workflow parent spines, recursion,
   and graph transitions preserve exact lineage and ABG truth;
4. child preparation preserves M3 module topology and never re-resolves the
   admitted Product set during traversal;
5. an existing durable sink reopens without truncation or restamping, preserves
   historical ordinals, and stamps the next event at `maxOrdinal + 1`;
6. the authoritative Continuation lifecycle is replay-constructible,
   `interaction.respond` remains separate from `run.continue`, and every resume
   binds admitted public ingress, actor, capability, and declared input;
7. fan-out admits either one exact ordered output vector or one exact
   completed/stopping/unstarted partition and never projects partial success;
8. every added runtime fact has one canonical event, causal payload, and Event
   Calculus effect relation with no unconsumed active fluent;
9. shared primitives carry no semantic authority;
10. the three views project the same Ontology delta;
11. the M3 Prime family is contracted rather than expanded; and
12. no compiled plan, generated program, feature controller, or rival event
    path is constructible.

## 12. S03 One Surface Governed Evidence Fold

This bounded S03 delta retains T-272's completed evidence under T-270's current
authority. It co-evolves the deferred One Surface boundary without changing
the accepted authority split or adding a rival event family.

### 12.0 Boundary Reconciliation

This subsection is the design-reconciliation subject for T-270. Sections 1
through 11 remain the accepted traversal basis. The remaining Section 12
material is candidate evidence and is retained only where it agrees with this
derivation. Sections 13 and 14 remain outside the selected outcome.

The governing requirements are `REQ-P-POLICY-013`, `-023`, `-024`, and
`-029..033`; `REQ-R-ABG3-CONTINUATION-001..014`; and the construction,
event, replay, and closure requirements causally reached by the supported S03
path.

#### Ontology slice

Sections 12.1 through 12.10 are one selected S03 boundary. Their active
families are included here even where their detailed laws remain in the later
subsection. Earlier Sections 1 through 11 rows that name `superseded` or
`abandoned` continuation transitions describe the complete target algebra.
Neither transition is realized or claimed as proof in this S03 cut.

Subordinate payloads inherit the identity, lifecycle, and authority of the
family named below.

| Entity | Identity | Authority owner | Declare/create | Read/project | Update/transition | Delete/retire |
|---|---|---|---|---|---|---|
| Program semantic authority family: `GtlProgram`, `ConstructionComposition`, `ActionCatalog`, starts, public targets, and closure policy | Exact Program ref and canonical Program digest; one composition, one catalog, and a finite unique start/target set per Program version | Product owns semantic meaning; GTL carries it | Product publishes; validator admits static coherence | Program inspection and admitted `ExecutionBasis` | New immutable Program version only | Superseded by a separately admitted Program version; history retained |
| Environment basis: install, lock, ProductSet, WorkspaceBinding, catalog, and publication | Existing M3 immutable identities and digests; one exact ordered lock/ProductSet for one WorkspaceBinding | Product proposes; ABG admits runtime use | Existing verification, install, workspace, and catalog admissions | Public and replay project exact refs; Product and ABG consume exact values | New admitted basis, never in-place mutation | Existing release/install retirement law; not changed by S03 |
| Invocation policy and grant family | One policy binds trusted-developer authority, exact workspace authority basis, WorkspaceBinding, Program digest, compute fibres, and all validated F_H requirement rows; grants are the exact closed operation/capability projection | Product constructs policy and grants; ABG independently verifies and admits them | `constructRootInvocationPolicy`, `constructCapabilityGrant`, then root invocation admission | ABG resolves the exact admitted grant for each public operation | Immutable for one admitted root invocation | Exhausted with the invocation; no caller-minted surplus grant is admissible |
| Observation and next-action family: snapshot, gap, basis, and projection | Immutable canonical values causally bound to one Program composition, workspace, obligations, catalog, frontier, and policy | Product functions own meaning; ABG owns runtime admission | Product `synthesizeModel`, `evalGap`, and `evaluateNext`; ordinary C-call admission | Product refresh and replay-derived public reads | Causally later admitted refresh value | Consumed by route, intent, stop, or terminal truth; historical values retained |
| Construction evaluation family: intent, evaluation basis, ledger, closure decision, and delta | One intent per admitted selected action and cursor; one fold/delta per intent | Product evaluates semantic candidates; ABG alone admits intent, fold, and delta truth | `construction_intent_selected`; ABG basis derivation; Product `evaluateAction`; ABG fold/delta admission | Replay, refresh, and public projection | Intent resolves only through matching delta or truthful stop | Retained as event history after run terminal |
| Traversal aggregate family: Run, GraphCall, Frame, C-call, and cursor | Existing M3/M5 aggregate identities; finite causal membership | HoG owns traversal; ABG owns aggregate and event truth | Existing open/admission functions | HoG consumes admitted scope; replay projects truth | Declared route and admitted transition only | Existing close/stop/failure law |
| Continuation and continuation-operation family | One run-local continuation plus unique public-operation invocation identities | ABG event truth | Atomic hold opens continuation; ABG admits each respond/continue operation before Product or traversal effects | Replay and explicit public carrier | This cut realizes open -> responded -> resolved and replacement authority after post-resume failure | Resolved exhausts append authority; `superseded` and `abandoned` are named deferred gaps owned by T-270 if a Product path selects them |
| `PublicContinuationAuthority` and public read family | Self-digested carrier over exact install, workspace, catalog, Program, graph, invocation, continuation, and event prefix; one closed read variant | Downstream Public projection only | Projected from ABG/replay truth on hold and after each append | `status`, `interaction`, `result`, `replay`, `lawful-actions`, and `gaps` | Replaced by the carrier for the longer admitted prefix | Append authority exhausts at resolution; immutable read authority remains |
| Product semantics provider | One publication binding and exact installed Product bytes; operation-local provider value | Product module owns semantic invocation; published Product code owns domain meaning | `product.loadInstalledProductSemantics` after exact install admission | Fixed Public composition and leaf-port construction consume it | Reloaded from a newly admitted install only | Operation-local provider is released after the call; publication binding retires with install/Product version |
| F_D/F_P leaf invocation port | One opaque install/publication/implementation-set bound port | HoG owns traversal use; implementation realizes declared leaf effect; ABG admits effect truth | `hog.bindInstalledLeafInvocationPort` from exact admitted basis | HoG invokes only the admitted resolved leaf | No mutation; a new basis creates a new port | Operation-local port released after traversal |
| F_H response candidate | One attributed candidate for one open interaction and construction intent | F_H proposes; Product evaluates; ABG admits | Public transports candidate after operation admission | Product response evaluation and ABG continuation admission | Admitted response advances continuation once | Refusal creates no response truth; admitted value remains history |
| Route and disposition family: hold, gap, block, yield, re-entry, retry, correction, escalation, reprice, and terminal | Existing typed route identity bound to exact C-call judgment, cursor, and basis | Product selects semantic disposition where required; HoG proposes traversal route; ABG admits/applies runtime truth | Existing route constructors and admissions in Sections 1 through 11 plus 12.5 through 12.10 | Replay and public projections | One admitted route transition per consumed availability | Consumed by application or terminal run truth; event history retained |
| Gap/public re-entry family | Exact stopped gap authority plus one source-consumption basis | Product owns changed observation; ABG admits single successor invocation | `gap_stop` then a later `run.invoke(start)` with exact durable basis | `project.read(gaps)` and invocation rehydration | Source gap may be consumed exactly once | Consumed source remains historical and cannot authorize another successor |
| Runtime event and replay family | Existing canonical event refs, ordinals, causal refs, aggregate ids, and deterministic replay digest | ABG owns append truth; replay is downstream | Existing event admissions only; no S03 event family is added | Replay and public projection | Append-only longer prefix | Release/archive retention law; no in-place deletion |

Cardinality and authority invariants:

1. The admitted grant set is exactly one `run.invoke` grant plus one
   `interaction.respond` and one `run.continue` grant for each distinct
   Program-declared F_H capability. An all-F_D Program admits no F_H grant.
2. Actor identity, a capability string, a carrier digest, or possession of an
   old prefix is not authority. ABG independently verifies the exact policy,
   grant set, Program requirements, actor, operation, workspace, and durable
   event basis.
3. ABG admits a continuation public operation before Product response
   evaluation or resumed traversal. Refused authority therefore executes no
   installed Product or leaf code.
4. F_H response and Product contract semantics are not leaf realization.
   Their installed provider is loaded and invoked through `src/product`.
   Program-declared F_D/F_P semantic functions remain executable leaves and
   HoG reaches them only through the opaque `LeafInvocationPort`.
5. A public read, response, continuation, or re-entry has one explicit durable
   authority carrier. Process state and caller knowledge do not change
   admissibility.
6. Both `root_mode = direct` and `root_mode = supervised` require
   `until = converged`. Public performs no repetition or semantic selection.

#### Functions, authority, and composition

The complete active S03 boundary-crossing authority model is:

| Function or transition | Proposer | Evaluator | Verifier | Admitter | Executor | Projector | Retirement owner |
|---|---|---|---|---|---|---|---|
| Publish and validate Program semantics | Product author | Product law | GTL validator | ABG admits exact Program basis for invocation | Product semantic functions | Program/catalog views | Product version authority |
| Construct root policy and grants | Fixed Public composition supplies admitted values | Product policy constructor | ABG compares with exact workspace and ProgramValidation | ABG root invocation admission | not_applicable: authority construction has no external effect | Invocation/replay refs | Root invocation terminal |
| Admit public start/invocation | Public request | Product start relation | Validator and ABG basis checks | ABG | HoG after admission | Public outcome/replay | Run terminal |
| Load installed Product semantics | Fixed Public composition | Product publication binding | Exact install admission and installed-byte verification | Existing install/publication admission | Product semantic provider | not_applicable: provider is not public truth | Operation return or install retirement |
| Bind and invoke F_D/F_P leaf port | HoG from admitted resolution | Product-declared contract/judgment | Exact install, publication, implementation set, and bytes | ABG admits implementation basis before port construction | Implementation leaf under HoG traversal | ABG evidence/events/replay | Traversal return or install retirement |
| Synthesize observation and gap | Product Program | Product functions | Contract and exact basis checks | Ordinary ABG C-call admission | Installed Product leaf through HoG's admitted port | Replay/public read | Superseded by admitted refresh |
| Select next action or no-action stop | Product `evaluateNext` | Product policy | Exact basis, catalog, and Program checks | ABG result/judgment and route/intent admission | HoG applies admitted route | Replay/public lawful-actions or gaps | Consumed by intent/stop/terminal |
| Open F_H hold and continuation | HoG hold proposal | Declared route/interaction law | ABG cursor and intent checks | ABG atomic hold batch | not_applicable: hold is admitted state | Public continuation carrier | Resolution or named deferred transition |
| Admit respond/continue operation | Developer request | Product invocation policy | ABG exact grant and durable duplicate checks | ABG before Product or HoG effect | not_applicable: admission is event truth | Replay and refreshed carrier | Invocation terminal |
| Evaluate F_H response | Attributed F_H candidate | Installed Product semantic function | Product request/response contract and pending basis | ABG response admission after Product validity | Product semantic provider | Replay/public interaction | Continuation resolution |
| Resume held traversal | Developer request carrying admitted response | Declared continuation law | ABG exact cursor, operation, and grant | ABG resume admission | HoG | Replay/refreshed carrier | Run terminal |
| Evaluate evidence fold and refresh | Product Program | Product `evaluateAction`, then the same model/gap/next authorities | Exact intent, evidence, workspace, catalog, policy, and causal events | ABG action fold, delta, route, and closure admissions | Installed Product leaves through HoG's admitted port | Replay/public result and lawful actions | Run terminal |
| Admit gap stop and public re-entry | Product no-action projection or changed observation | Product `evaluateNext` and start relation | ABG exact stopped basis, ProductSet/lock, and single-consumption check | ABG | HoG only after successor invocation admission | Public gap/status/replay | Source gap exhausted after one successor |
| Apply retry or graph-span re-entry | Product-declared selector result | Product route meaning | HoG scope plus ABG C-call/judgment/bound checks | ABG | HoG | Replay route projection | Bound exhaustion or run terminal |
| Apply correction, escalation, yield, block, or reprice stop | Product semantic projection | Product policy | ABG exact evidence and route-basis checks | ABG | HoG applies admitted route where traversal continues | Replay/public stop projection | Run terminal or lawful successor |
| Project immutable reads | Public read request | Closed read variant | Exact carrier and event-prefix rehydration | not_applicable: reads append no truth | Public projector | Public outcome | Carrier supersession by longer prefix |
| Supersede or abandon continuation | Future Product operation | Unselected | Unselected | Unselected | Unselected | Replay if later selected | `Gap: T-270 re-entry when Product selects either transition` |

The complete discovered atomic-function family is dispositioned below.
Subordinate helpers inherit the row's owner.

| Discovered functionality | Entity | Atomic function or template | Higher-order composition | Effect class | Required authority | Disposition |
|---|---|---|---|---|---|---|
| Resolve public start | `GtlProgram` | `resolveProgramStart` | public-start validation | pure | admitted Program plus Product-declared target policy | derived; retain in `src/gtl` |
| Construct root policy | `InvocationPolicyBasis` | `constructRootInvocationPolicy(workspace, Program, validatedInteractionRows, fibres)` | root invocation construction | pure | admitted workspace and exact validated Program | derived; retain in `src/product` |
| Construct actor-operation authority | `CapabilityGrant` | `constructCapabilityGrant(policy, actor, operation, capability)` | closed grant-set construction | pure | exact Product policy and one Program requirement row for F_H operations | derived; retain in `src/product` |
| Verify and admit root invocation and grants | `InvocationAdmission` | `validateInvocationCapabilityBasis` then `admitInvocation` | invocation admission fold | event admission | exact Product, workspace, catalog, ProgramValidation, policy, start, and complete non-surplus grants | derived; retain in `src/abg` |
| Project or refresh public authority | `PublicContinuationAuthority` | `construct/updatePublicContinuationAuthority` | replay projection | downstream | exact continuation and event-prefix identities | derived; retain in `src/public` |
| Parse and reopen durable authority | `Continuation` | `parsePublicContinuationAuthority` plus `rehydrateFhContinuation` | reopen verification | read plus append-open effect | exact carrier, event prefix, Product basis, and continuation lineage | composed; Public parses, ABG rehydrates |
| Admit a public continuation operation once | `ContinuationPublicOperationAdmission` | `resolveContinuationPublicOperationGrant` then `admitContinuationPublicOperation` | durable idempotency fold | pure authority resolution then event admission | one admitted actor-operation capability grant, exact lifecycle state, and no prior event with the same invocation identity | derived; retain in `src/abg` |
| Project pending Product meaning | `FhInteractionSemanticBasis` | `projectFhInteractionSemanticBasis` | replay projection | downstream | open continuation and admitted construction lineage | derived; retain in `src/abg` |
| Bind installed Product semantics | Product semantics provider | `loadInstalledProductSemantics` | installed Product semantic application | effect edge, no runtime truth | exact admitted install, publication binding, and installed bytes | derived; retain in `src/product`; not a HoG or leaf authority |
| Evaluate an F_H response | `InteractionResponseCandidate` | `evaluateInstalledInteractionResponse` | installed Product semantic application | Product effect edge, no runtime truth | prior admitted public operation plus exact pending basis and Product contract | derived; retain in `src/product` |
| Admit response truth | `FhInteractionResponseAdmission` | `admitFhInteractionResponse` | continuation transition | event admission | admitted public operation, grant, Product-valid response, open continuation, and exact basis | derived; retain in `src/abg` |
| Derive resume input | `FhResumeSuccessorInput` | `deriveFhResumeSuccessorInput` | continuation transition | pure | responded continuation and admitted response | derived; retain in `src/abg` |
| Admit resume truth | `FhInteractionResumeAdmission` | `admitFhInteractionResume` | continuation transition | event admission | admitted `run.continue` operation and responded continuation | derived; retain in `src/abg` |
| Bind installed executable leaf | F_D/F_P leaf port | `leafInvocationBindingMatches` then `bindInstalledLeafInvocationPort` | HoG leaf invocation | pure authority relation then implementation effect edge | exact install, publication, leaf-only contract/judgment adapter projected from the Product provider, and admitted implementation set | derived; retain in `src/hog`; no F_H semantic evaluation or full Product-provider dependency |
| Traverse or resume | Run, GraphCall, Frame, C-call, Continuation | existing HoG direct traversal functions | GTL sequential/recursive composition | traversal effect through ABG ports | admitted execution basis and opened traversal scope | consume accepted Sections 1-11 |
| Totalize post-resume failure | Run and Continuation | existing runtime-failure admission plus authority refresh | failure composition | event admission and projection | reopened append context and resumed Run | composed; every post-append refusal returns the refreshed carrier |
| Construct observation and gap | `ObservationSnapshot`, gap | Product `synthesizeModel` and `evalGap` | One Surface composition | Product semantic C calls | admitted Program composition and input basis | consume retained Product functions |
| Select action or stop | `NextActionBasis`, `NextActionProjection` | Product `evaluateNext` | One Surface composition | Product semantic C call | admitted snapshot, obligations, catalog, priority, frontier, and policy | consume retained Product function |
| Admit intent and hold | `ConstructionIntent`, Continuation | existing intent, hold, and continuation admissions | atomic hold batch | event admission | admitted selected action and exact cursor | consume retained ABG family |
| Evaluate evidence fold | `ActionEvaluationBasis`, ledger, decision | Product `evaluateAction` | One Surface composition | Product semantic C call | admitted intent, complete evidence, workspace, catalog, and policy | consume retained Product function |
| Admit delta and convergence | construction fold plus refreshed projections | existing fold/delta admissions and same Product functions | evidence fold then refresh | event admission plus Product C calls | exact composition and run-causal intent lineage | consume retained ABG/Product families |
| Read status, result, replay, and lawful actions | replay projections | one typed read projection family parameterized by read variant | projection | downstream | valid immutable public authority and replay truth | contracted; no peer read authorities |
| Stop for gap or reprice | no-action projection | one typed no-action admission parameterized by disposition | Product selection then ABG route admission | Product semantic plus event admission | exact NextActionBasis and admitted judgment | derived; retain existing route/event family |
| Re-enter from a gap | source gap basis and successor invocation | one invocation admission variant carrying `reentryBasis` | public start composition | event admission | exact unconsumed source, unchanged lock/ProductSet/workspace/Program, and changed Product observation | derived; retain in root invocation family |
| Re-enter a graph span | route and cursor | one graph-span route variant | bounded HoG traversal | event admission plus traversal | Product selector judgment, exact target, and remaining bound | derived; retain existing route family |
| Apply correction or escalation | correction projection | one no-progress route family parameterized by disposition | governed evidence fold then stop | Product semantic plus event admission | exact action evaluation, archive/evidence basis, and Product policy | derived; retain existing route/event family |
| Supersede or abandon a continuation | Continuation | no selected atomic transition in this S03 path | none | deferred event transition | future Product operation and ABG admission law | deferred; re-enter Section 12 when a selected Product path requires either transition |
| Process-local duplicate or continuation registry | none | none | none | prohibited | none | excluded; process state cannot alter durable admissibility |
| Public semantic evaluator or controller | none | none | none | prohibited | none | excluded; Public composes ports only |
| New S03 event family | none | none | none | prohibited | none | excluded; existing ABG event family is complete for this slice |

The governing higher-order algebra is:

```text
unit(admitted start and execution basis)
  ; traverse(Program-declared C)
  ; admit(intent + hold + continuation)
  ; project(explicit durable authority)
  ; admit(public operation and exact grant)
  ; evaluate(Product response)
  ; admit(response)
  ; admit(public continue operation and resume)
  ; traverse(exact successor cursor)
  ; evaluate(Product evidence fold)
  ; admit(fold + delta)
  ; traverse(Product refresh)
  ; admit(convergence | gap | correction | re-entry | stop)
  ; project(replay-derived public outcome)
```

Composition laws:

- **Identity/unit**: the admitted start and `ExecutionBasis` are the only unit;
  a helper, carrier, actor label, or capability string cannot create a second
  entry authority.
- **Closure**: every composed result is either an admitted next basis, an
  admitted route/transition, a downstream projection, or a typed refusal.
- **Associativity**: regrouping pure Product projections or downstream reads
  does not change causal order; eventful admission, Product evaluation, and
  HoG traversal retain their declared order and cannot commute.
- **Cardinality**: one root policy, one exact grant set, one consumed operation
  identity, at most one response and resume per continuation, at most one
  successor per source gap, and one terminal disposition per Run.
- **Effects**: Product semantic invocation and leaf invocation are distinct
  effect edges; event append is ABG's sole truth-writing effect; Public
  projection is read-only.
- **Authority conservation**: composition carries the intersection of admitted
  input authorities. It never widens policy, grant, Program, install,
  workspace, route, or continuation authority.

Whole-family Prime contraction covers every changed row:

| Candidate family | Contraction relation | Retained meaning | Authority before -> after | Accepted loss | Falsification condition | M3 IACS disposition |
|---|---|---|---|---|---|---|
| start request, declared start, public target, and target resolution | closed target variant -> one typed GTL start relation | Product-declared entry meaning | Product + GTL -> unchanged | no independent endpoint selector | Public or HoG chooses a target absent from Program | retain in `GtlDeclarationFamily` |
| policy, operation grants, and root admission | many capability strings -> one policy plus exact closed grant set and one admission | actor-operation authority under exact Program/workspace | caller + Product + ABG ambiguity -> Product proposal, ABG verification/admission | surplus or undeclared grants | all-F_D Program admits F_H grant or actor string alone authorizes | retain in `InvocationBasis` |
| carrier construction, update, parse, reopen, and read variants | carrier helpers -> one durable carrier plus parameterized projection family | exact-prefix continuation access | Public/process ambiguity -> ABG truth then downstream Public projection | process-local lookup authority | fresh and retained contexts differ, or read appends truth | contract into `ReplayProjectionFamily` |
| operation, response, resume, failure, and replacement transitions | endpoint helpers -> typed lifecycle transitions over one continuation | durable single-use continuation law | mixed endpoint state -> ABG singular admission | no private mutable current state | Product/HoG effect precedes operation admission or failure strands Run | retain in `TraversalAggregateFamily` and `RuntimeEventFamily` |
| Product input and F_H semantic evaluation | implementation/HoG ambiguity -> one Product-owned provider bound to publication/install | Product contract and F_H response meaning | HoG/implementation candidate -> Product module effect edge, ABG later admission | no HoG F_H semantic export | HoG exports/evaluates F_H semantics or Product bytes are unbound | subordinate effect edge of `GtlDeclarationFamily`; no ninth Prime family |
| executable leaf binding and invocation | leaf helpers -> one opaque install-bound port | exact F_D/F_P effect seam | implementation candidate -> HoG traversal through admitted port, ABG truth | no direct Public leaf invocation | execution occurs outside admitted port | retain `LeafRealizationBoundary` |
| observation, gap, next action, intent, evaluation, and refresh | stage helpers -> four Program-declared semantic authorities plus subordinate values | One Surface Product meaning | role-string/controller ambiguity -> Product functions, ABG admission, HoG traversal | role labels carry no authority | renaming a role changes semantics or closure | retain `GtlDeclarationFamily`, `InvocationBasis`, and aggregate families |
| gap, graph-span, correction, escalation, reprice, yield, and terminal routes | route-specific helpers -> one typed route family with closed variants | distinct Product disposition and traversal consequence | mixed route handling -> Product semantic selection, HoG proposal, ABG admission | no generic success collapse | one disposition can masquerade as another or bypass basis | retain `TraversalAggregateFamily` and `RuntimeEventFamily` |
| status, interaction, result, replay, lawful-action, and gap reads | peer readers -> one parameterized read projection | immutable replay-derived public meaning | endpoint-owned summaries -> downstream replay projection | no mutable projection store | read changes events or invents semantic truth | contract into `ReplayProjectionFamily` |
| process registry, Public evaluator/controller, rival events, compiled carrier | remove candidate family | none | rival sources -> absent | all rival convenience | any becomes necessary for accepted path | reject; no IACS membership |
| supersede and abandon transitions | no contraction selected | requirement-level lifecycle alternatives | unselected -> unselected | no current realization claim | S03 Product selects either without design re-entry | defer under `TraversalAggregateFamily`, owner T-270 |

The accepted M3 eight-family IACS remains complete. S03 introduces no ninth
Prime family:

| S03 member | M3 IACS family | Classification | Module and visibility |
|---|---|---|---|
| `ConstructionComposition`, `ActionCatalog`, Product semantic contracts, and start relation | `GtlDeclarationFamily` | `<<prime>> <<authoritative>>` | `src/gtl`; declarations public, constructors module-local |
| whole-Program checks | `ValidationFamily` | `<<prime>> <<authoritative>>` | `src/validator`; diagnostics public, checks module-local |
| exact install, workspace, catalog, and Program basis | `EnvironmentBasis` | `<<prime>> <<authoritative>>` | `src/product`; immutable values public |
| grants, invocation, start, intent, response, evaluation, and resume bases | `InvocationBasis` | `<<prime>> <<subordinate>> <<authoritative>>` | `src/product` and `src/abg`; refs public, bodies module-local |
| Run, Frame, C-call, and Continuation | `TraversalAggregateFamily` | `<<prime>> <<authoritative>>` | `src/abg`; replay-visible |
| installed Product semantic provider | subordinate realization of `GtlDeclarationFamily` | `<<subordinate>> <<effect-edge>>` | `src/product`; Product-owned provider loaded from exact admitted publication/install; no HoG export |
| installed F_D/F_P leaf function | `LeafRealizationBoundary` | `<<prime>> <<effect-edge>>` | `src/implementation`; reachable only through HoG's exact installed leaf port |
| construction, response, resume, route, failure, and closure events | `RuntimeEventFamily` | `<<prime>> <<authoritative>>` | `src/abg`; append-only and replay-readable |
| public authority plus status, interaction, result, and replay views | `ReplayProjectionFamily` | `<<prime>> <<downstream>>` | `src/public`; public carrier and reads |

The Product's declared contracts and GTL functions own semantic meaning.
`src/product/semantics.ts` owns loading and invoking the exact installed Product
contract and F_H response provider; ABIogenesis's own provider resides in
`src/product/builtin_semantics.ts`. The fixed Public composition may invoke its F_H response
function only after ABG admits the corresponding actor-operation grant. HoG
does not export or evaluate F_H Product semantics.
`src/hog/installed_product.ts` binds only the F_D/F_P leaf invocation port
consumed by traversal. Its `LeafContractSemanticsPort` exposes only contract
validation and judgment resolution, not input or F_H response evaluation.
Those executable leaves realize the Product-declared GTL functions. Public
imports no implementation module, and neither adapter gains Product-selection
or runtime-truth authority.

#### Three views

```mermaid
classDiagram
  class GtlDeclarationFamily {
    <<prime>>
    <<authoritative>>
    +GtlProgram
    +ConstructionComposition
    +ActionCatalog
    -resolveProgramStart()
  }
  class ValidationFamily {
    <<prime>>
    <<authoritative>>
    -validateProgram()
  }
  class EnvironmentBasis {
    <<prime>>
    <<authoritative>>
    +ProductInstall
    +WorkspaceBinding
    +CatalogView
  }
  class InvocationBasis {
    <<prime>>
    <<subordinate>>
    <<authoritative>>
    +CapabilityGrant
    +InvocationAdmission
    +ConstructionIntent
    +ActionEvaluationBasis
  }
  class TraversalAggregateFamily {
    <<prime>>
    <<authoritative>>
    +Run
    +GraphCall
    +Frame
    +CCall
    +Continuation
  }
  class ProductSemanticBoundary {
    <<subordinate>>
    <<effect-edge>>
    -loadExactProvider()
    -admitProductInput()
    -evaluateInteractionResponse()
  }
  class LeafRealizationBoundary {
    <<prime>>
    <<effect-edge>>
    -invokeLeaf()
  }
  class RuntimeEventFamily {
    <<prime>>
    <<authoritative>>
    -admitPublicOperation()
    -admitResponse()
    -admitResume()
    -admitFailure()
  }
  class ReplayProjectionFamily {
    <<prime>>
    <<downstream>>
    +PublicContinuationAuthority
    +PublicOutcome
    +ReplayState
    -projectRead()
  }
  class HoGLeafPort {
    <<subordinate>>
    <<effect-edge>>
    -bindInstalledLeaf()
    -executeTraversal()
  }
  class GtlFunctions {
    <<subordinate>>
    -resolveProgramStart()
  }
  class AbgAdmissionFunctions {
    <<subordinate>>
    <<authoritative>>
    -admitInvocation()
    -admitPublicOperation()
    -admitResponse()
    -admitResume()
  }
  class HoGTraversalFunctions {
    <<subordinate>>
    -execute()
    -resume()
  }
  class InstalledProductFunctions {
    <<effect-edge>>
    -evaluateInteractionResponse()
  }
  class InstalledLeafFunctions {
    <<effect-edge>>
    -invokeDeclaredFunction()
  }
  class PublicAdapter {
    <<downstream>>
    +start()
    +read()
    +respond()
    +continue()
  }
  class DeferredContinuationTransition {
    <<deferred>>
    +supersede
    +abandon
  }
  GtlDeclarationFamily "1" --> "1" ValidationFamily
  GtlDeclarationFamily "1" *-- "1" GtlFunctions
  GtlDeclarationFamily "1" *-- "1" ProductSemanticBoundary
  ProductSemanticBoundary "1" *-- "1" InstalledProductFunctions
  EnvironmentBasis "1" *-- "1" InvocationBasis
  GtlDeclarationFamily "1" *-- "1" InvocationBasis
  InvocationBasis "1" *-- "1" AbgAdmissionFunctions
  InvocationBasis "1" --> "1" TraversalAggregateFamily
  TraversalAggregateFamily "1" *-- "1" HoGTraversalFunctions
  TraversalAggregateFamily "1" --> "1" HoGLeafPort
  HoGLeafPort "1" --> "1" LeafRealizationBoundary
  LeafRealizationBoundary "1" *-- "1" InstalledLeafFunctions
  TraversalAggregateFamily "1" --> "1..*" RuntimeEventFamily
  RuntimeEventFamily "1..*" --> "1" ReplayProjectionFamily
  PublicAdapter "1" --> "1" ReplayProjectionFamily
  PublicAdapter "1" --> "1" ProductSemanticBoundary
  PublicAdapter "1" --> "1" HoGLeafPort
  TraversalAggregateFamily "1" --> "0..*" DeferredContinuationTransition
```

```mermaid
sequenceDiagram
  actor Developer
  participant PublicAdapter
  participant GtlFunctions
  participant AbgAdmissionFunctions
  participant HoGTraversalFunctions
  participant ProductSemanticBoundary
  participant LeafRealizationBoundary
  Developer->>PublicAdapter: start(target, until=converged, root_mode)
  PublicAdapter->>GtlFunctions: resolveProgramStart(admitted Program, request)
  GtlFunctions-->>PublicAdapter: declared start or refusal
  PublicAdapter->>AbgAdmissionFunctions: admit invocation, start, and capability grants
  AbgAdmissionFunctions-->>PublicAdapter: admitted invocation basis
  PublicAdapter->>HoGTraversalFunctions: execute(admitted basis, installed port)
  HoGTraversalFunctions->>LeafRealizationBoundary: invoke declared Product semantic C calls
  LeafRealizationBoundary-->>HoGTraversalFunctions: typed Product candidates
  HoGTraversalFunctions->>AbgAdmissionFunctions: propose intent and hold
  AbgAdmissionFunctions-->>PublicAdapter: held plus explicit continuation authority
  Developer->>PublicAdapter: interaction.respond(authority, candidate)
  PublicAdapter->>AbgAdmissionFunctions: reopen, admit public operation, project pending basis
  AbgAdmissionFunctions-->>PublicAdapter: admitted grant plus exact interaction basis
  PublicAdapter->>ProductSemanticBoundary: evaluateInteractionResponse(admitted operation, basis, candidate)
  ProductSemanticBoundary-->>PublicAdapter: canonical response or refusal
  PublicAdapter->>AbgAdmissionFunctions: admit attributed response
  AbgAdmissionFunctions-->>PublicAdapter: responded authority
  Developer->>PublicAdapter: run.continue(responded authority)
  PublicAdapter->>AbgAdmissionFunctions: reopen, admit continue operation, admit resume
  AbgAdmissionFunctions-->>PublicAdapter: exact successor cursor
  PublicAdapter->>HoGTraversalFunctions: resume(admitted cursor, installed port)
  HoGTraversalFunctions->>LeafRealizationBoundary: evaluate evidence and refresh
  LeafRealizationBoundary-->>HoGTraversalFunctions: convergence or lawful stop
  opt other F_D or F_P leaf
    HoGTraversalFunctions->>LeafRealizationBoundary: invoke admitted leaf port
    LeafRealizationBoundary-->>HoGTraversalFunctions: leaf candidate
  end
  HoGTraversalFunctions->>AbgAdmissionFunctions: propose route
  AbgAdmissionFunctions-->>PublicAdapter: admitted route and replay truth
  PublicAdapter-->>Developer: outcome plus next authority
```

```mermaid
stateDiagram-v2
  [*] --> Active: admitInvocation / ABG
  Active --> Held: admitFhInteractionOpen atomic hold / ABG
  Held --> Held: project read with immutable authority / Public
  Held --> Held: refuse Product-invalid response / Product plus ABG
  Held --> Responded: admitContinuationPublicOperation plus admitFhInteractionResponse / ABG
  Responded --> Active: admitContinuationPublicOperation plus admitFhInteractionResume / ABG
  Active --> Held: admit replacement continuation / ABG
  Active --> Blocked: admit block or runtime failure / ABG
  Active --> Stopped: admit gap or correction disposition / ABG
  Active --> Closed: admit delta, refreshed convergence, and closure / ABG
  Active --> Failed: totalize post-resume failure after resume / ABG
  Failed --> Readable: refresh public authority / Public projection
  Closed --> Readable: exhaust append and retain immutable read authority
  Blocked --> [*]
  Stopped --> [*]
  Readable --> [*]
```

#### Cross-view axioms and module proof

| Axiom | Ontology evidence | Authority | Domain evidence | Sequence evidence | State evidence | Native enforcement | Admission/compiler enforcement | Verdict | Gap owner |
|---|---|---|---|---|---|---|---|---|---|
| continuation authority is explicit and process-independent | one carrier and one ABG continuation aggregate | ABG event truth precedes projection | carrier is downstream of events | every reopen supplies the carrier | same and fresh contexts reach the same event-derived state | carrier parser and event-store reopen | ABG rehydration and durable operation-identity scan | pass, focused installed proof green | none |
| F_H capability is admitted provenance, not string equality | policy and exact closed grant set belong to `InvocationBasis` | Product proposes from exact Program/workspace; ABG independently verifies and admits | no grant exists without matching Program F_H requirement | response/continue admission precedes Product/HoG effect | no transition without exact grant admission | Product constructors reject undeclared grant | ABG rejects missing, surplus, reordered, wrong-actor, wrong-policy, and wrong-capability sets | pass, module-owned and installed negatives green | none |
| Product meaning is not a Public, HoG, or implementation authority | contracts/functions remain in `GtlDeclarationFamily`; Product provider is subordinate effect edge; leaf boundary is separate | Product declaration owns meaning; Product module invokes provider; ABG admits truth | Product and leaf boundaries are distinct | Public admits operation then calls Product; HoG traverses and invokes only leaves | Product refusal leaves runtime state unchanged | `src/product/semantics.ts`; no HoG semantic export or Public implementation import | exact install/publication binding plus ABG admission | pass, module-owned topology proof and installed zero-call negatives green | none |
| public operation identity is durable and context-independent | operation admission is one RuntimeEvent variant | ABG is singular admitter | no process-registry entity exists | duplicate check reads event truth | retained and fresh contexts refuse identically | no continuation operation uses `RootOperationState` admission | existing `public_operation_admitted` event identity | pass, focused installed proof green | none |
| post-resume failure is total and publicly reopenable | failure transition plus refreshed carrier | ABG admits failure; Public projects authority | failure remains runtime truth, carrier remains downstream | every post-append catch replays and returns next authority | Responded reaches Active, Failed, then Readable | public refusal outcome carries event and continuation metadata | runtime failure event and exact-prefix refresh | pass, focused installed-byte mutation green | none |
| direct and supervised start share one convergence law | one GTL start relation with closed root-mode variant | Product policy plus GTL relation | both variants remain in declaration family | both reject `first_traversal`; direct positive traverses six C calls | admitted start enters Active only with converged | `src/gtl/public_start.ts` | validator and invocation admission | pass, focused installed proof green | none |
| S03 closure is evidence-fold and replay governed | intent, evaluation, delta, refresh, and terminal entities are complete | Product evaluates; ABG admits; HoG traverses | no role-label authority exists | terminal route follows delta and refreshed convergence | Closed reachable only from admitted converged state | Product contracts and HoG traversal | ABG run-causal intent fold | pass, retained installed mutations and M5 127/127 green | none |
| gap/public re-entry is single-use and basis-preserving | source gap and successor basis are one lifecycle family | Product supplies changed observation; ABG admits successor once | no peer re-entry controller | read is side-effect-free; successor admission precedes Run open | Stopped reaches one new Active Run or refusal | exact lock/ProductSet/workspace/Program restoration | durable source-consumption scan | pass, retained installed mutations green | none |
| graph-span, correction, escalation, reprice, yield, block, and non-admission remain distinct | one closed route/disposition family | Product owns semantic choice; HoG proposes; ABG admits | route variants share no generic success identity | each route follows its exact judgment/basis | each reaches its declared active, stopped, blocked, or failed state | typed route constructors | ABG basis and event admission | pass for realized S03 paths; qualification-wide conservation remains deferred | T-270 final M5 conservation gate |
| no rival controller, runtime, or event authority | whole-family contraction retains eight M3 families | existing four semantic authorities unchanged | Public and HoG helpers are subordinate | Public never selects Product action or calls implementation directly | lifecycle is event-derived | module import census and M4 rivals | M4 and M5 gates | pass, M4 26/26 and M5 127/127 green | none |
| superseded and abandoned continuation transitions are not falsely claimed | explicit deferred functionality row | no selected Product operation authorizes either transition | deferred class is outside realized associations | no message claims either transition | active state diagram omits both realized transitions | no implementation path | no admission event selected | not_applicable to selected S03 path; deferred | T-270 re-entry if Product selects replacement or abandonment |

The canonical module-owned proof is `test:m5:s03-unit`. It derives from the
`InvocationBasis`, Product semantic boundary, and leaf-boundary ownership
above. It proves exact Program-derived grant construction, independent ABG
grant-set verification, all-F_D surplus-F_H refusal, exact continuation
lifecycle/grant resolution, exact HoG leaf-binding agreement, Product ownership
of the installed semantic evaluator, and absence of that evaluator from HoG's
public port. The packed external Product scenario remains downstream integration
proof; it cannot replace the module lane. It proves admission-before-effect
with instrumented zero-evaluator-call wrong-actor and wrong-capability
negatives, durable duplicate admission across retained and fresh contexts,
fresh-context continuation, and the complete S03 route behavior.

Operational lifecycle confirmation:

| Phase | Surface and current posture | Owner and source truth |
|---|---|---|
| upstream authority | Product S03, applicable requirements, accepted M03, M05 Sections 1-11, and this provisional Section 12 | Product/requirement authority; T-270 owns the selected correction |
| realization | TypeScript `src/product`, `src/abg`, `src/hog`, `src/public`, and exact external Product fixture | module design and code under T-270 |
| assurance | `test:m5:s03-unit` is canonical module proof; external, M5, M4, Mermaid, and mutation lanes are downstream assurance | module owners; test results are evidence, not authority |
| package/release | two clean package builds must be byte-identical; no 5.0 release claim yet | Product packaging law; M7/T-248 owns release |
| deploy/install | clean consumer directory installs packed ABIogenesis and separately packed Product; exact installs are admitted | Product install/workspace/catalog law and ABG admission |
| live invocation | SDK/CLI uses exact public operations; Product semantics, HoG traversal, implementation leaves, and ABG truth retain distinct ownership | Product, HoG, implementation, and ABG boundaries above |
| telemetry/projection | append-only ABG events and deterministic replay feed immutable public reads | ABG event truth; Public downstream projection |
| retirement/decommission | operation-local providers/ports retire on return; grants and append authority exhaust at terminal state; immutable history remains; Product/install retirement stays with release/install law | ABG for runtime authority; Product/release authority for versions and installs |

The exact design and implementation cut remains pending full gate rerun,
package reproduction, freeze, independent review, and direct acceptance. It
cannot self-accept.

```text
Program-published ConstructionComposition
  (exact synthesizeModel + evalGap + evaluateNext + evaluateAction authorities
   + exact initial/refresh loci + interaction locus + closure policy)
  + Program-published ActionCatalog
  + ABG-admitted ObservationSnapshot
  -> Product-owned model synthesis
  -> Product-owned evalGap emits one typed NextActionBasis
       (snapshot + gap + obligations + ActionCatalog
        + priority + runtime frontier + policy)
  -> Product-owned evaluateNext emits one typed NextActionProjection
  -> ordinary C-call evidence, result, and judgment admission
  -> traversal_route_admitted advances to the declared F_H cursor
  -> construction_intent_selected binds the basis, selected row, and cursor
  -> F_H hold -> project.read -> interaction.respond -> run.continue
  -> ABG derives one ActionEvaluationBasis
       (intent + complete admitted evidence + workspace
        + ActionCatalog identity + closure policy + runtime event refs)
  -> Product-owned evaluateAction emits:
       ActionEvaluationProjection
       + EdgeFulfillmentLedger
       + EdgeClosureDecision(close_candidate)
  -> ordinary C-call evidence, result, and judgment admission
  -> ABG admits the candidate ledger and closure decision under the exact
       ConstructionComposition
  -> construction_delta_observed binds that admission and the complete
       runtime evidence fold
  -> Product-owned refreshed ObservationSnapshot
  -> Product-owned refreshed NextActionBasis with converged frontier
  -> Product-owned evaluateNext emits converged NextActionProjection
  -> ABG admits terminal route and ordinary run closure
```

### 12.1 Product And Static Authority

The admitted `GtlProgram` publishes one immutable `ActionCatalog`. Each row
owns the action identity, kind, Program, GraphFunction, target locus,
obligations, input and output assets, expected delta, progress condition, and
stop condition. Whole-Program validation checks canonical catalog identity,
unique action membership, and exact Program, callable, and locus membership.
The catalog is Product declaration truth; it is not a runtime selector.

The same Program publishes one immutable `ConstructionComposition` containing
exactly four semantic-authority bindings: `synthesizeModel`, `evalGap`,
`evaluateNext`, and `evaluateAction`. Each binding owns one stable authority
identity and its declared initial and, where applicable, refresh locus. The
composition also names the F_H interaction locus and the exact Product closure
policy. Whole-Program validation proves that every locus is a member of the
same callable graph and that the initial and refresh passes use the same
authority identities. The admitted `ExecutionBasis` preserves the exact
composition identity and body. `stageRole` remains descriptive metadata and
never selects a semantic authority.

`evaluateNext` owns the semantic selection. ABG admits its
`NextActionProjection` only when the selected action resolves to exactly one
row in the admitted Program catalog and every row field equals the projection.

The public start input is one Product-owned `ObservationSnapshot` bound to the
exact admitted WorkspaceBinding and Program `ActionCatalog`. Product model and
gap evaluation derives the unresolved pressure and one `NextActionBasis`
containing that snapshot, target-obligation references, admitted catalog,
priority scheme, factual runtime frontier, and declared policy. The basis is
ordinary typed GTL data, not an ABG selection algorithm. `evaluateNext`
constructs the target-obligation bindings, applies the declared priority
scheme, and emits the total selected-action or no-action projection. ABG
verifies the basis, projection, and admitted environment; Product owns their
semantic contents and the selection.

The resulting `ConstructionIntent` binds the `NextActionBasis`, selected row,
projection, `ConstructionComposition`, and `evaluateNext` authority to the
workspace, invocation, Program, GraphFunction, ExecutionBasis, Run, GraphCall,
Frame, source C-call/result/judgment, and successor cursor. Public and HoG
choose none of those values.

### 12.2 Canonical Intent And Continuation

`traversal_route_admitted` remains traversal truth only. The existing
construction-event family supplies `construction_intent_selected` as the
canonical intent boundary, causally after the admitted route. It initiates the
exact intent-availability fluent. `fh_interaction_opened` consumes that fluent,
and durable continuation truth preserves its identity. Replay joins the intent
to the route for `project.read`; Public performs no selection or recomputation.
Before runtime admission, ABG projects the exact pending request,
`NextActionBasis`, and `ConstructionIntent` from that lineage. After ABG admits
the exact actor-operation grant, the Product-owned installed semantics provider
evaluates the response candidate against that basis and returns either one
canonical Product-valid response or refusal. Public invokes the Product module
adapter but does not import or invoke an implementation module. HoG does not
participate in F_H response evaluation. A response naming another intent or a
choice outside the Product-owned pending choice therefore refuses before
`fh_interaction_responded`.

The root invocation admits actor-operation `CapabilityGrant` values for
`interaction.respond` and `run.continue`. Each later public-operation admission
must resolve one exact grant by actor, operation, capability, grant identity,
and grant digest from that admitted root invocation. A caller-supplied
capability string, actor label, or matching response contract is not authority.
The public-operation event records the admitted grant reference and becomes the
durable idempotency fact for its invocation identity. Process-local duplicate
state does not participate in continuation-operation admission.

The F_H response is evidence input only. It cannot directly close the Run.
For a continuation carrying an admitted construction intent, ABG derives one
`ActionEvaluationBasis` from replay-visible truth before `run.continue`
re-enters HoG. The basis contains the exact intent, preceding
`NextActionBasis`, actual semantic evidence assets admitted from the Product
response, WorkspaceBinding, selected ActionCatalog identity, the exact
Program-declared closure policy, and causal runtime event references. Expected
output assets remain obligations and cannot be copied into evidence. The
Product-owned `evaluateAction` function consumes this complete basis. A raw
F_H response, unobserved expected output, substituted workspace or policy, or
otherwise incomplete basis cannot enter or complete that C-call.
Ordinary F_H continuations without a construction intent continue to receive
their declared Product response value.

`fh_interaction_resume_admitted` consumes the prior continuation and
reactivates the held frame. Every later refusal or failure is therefore
totalized in ABG truth before the public operation returns: the Run either
advances, opens a replacement continuation, blocks, or admits
`runtime_failure_observed`. A consumed continuation cannot leave an active
unreachable Run. Every path that appended truth returns a carrier refreshed
against the resulting event prefix, including refusal. Once the continuation
is resolved, that carrier cannot append, respond, or continue, but it remains
valid for immutable status, result, replay, and lawful-action reads.

This selected S03 path realizes `open -> responded -> resolved`.
`superseded` and `abandoned` remain requirement-level lifecycle variants with
no selected Product operation or runtime transition in this cut. They are
explicitly deferred and are not included in the S03 proof claim.

### 12.3 Evidence Fold And Closure

The Product-owned `ActionEvaluationProjection` carries one canonical
`EdgeFulfillmentLedger` and one canonical
`EdgeClosureDecision(close_candidate)`. Those values remain candidates until
ABG admits one exact action-evaluation fold under the admitted
`ConstructionComposition`. `construction_delta_observed` records that
admission identity and is admitted only when:

1. the projection, ledger, and decision share the admitted intent, composition,
   action-evaluation basis, and target;
2. ledger obligations equal the selected `ActionCatalog` row while its
   evidence references and assets equal the actual complete admitted evidence;
3. the observation, workspace, catalog, obligation, policy, and intent chain
   equals the preceding `NextActionBasis` and admitted `ExecutionBasis`;
4. the intent selection, F_H open, response, and resume events exist in the
   same Run and Frame;
5. the `evaluateAction` C-call has admitted evidence, result, and judgment; and
6. the action-evaluation admission and delta bind all of those event and
   carrier identities to the exact successor refresh cursor.

`construction_delta_observed` is durable admitted truth with no independent
active fluent. Product-owned model, gap, and next-action refreshes then execute
as ordinary declared C-calls. They produce a refreshed `ObservationSnapshot`,
a refreshed `NextActionBasis` whose runtime frontier is `converged`, and a
final converged `NextActionProjection`.

Closure is state-governed, not label-governed. If an exact Run contains any
`construction_intent_selected`, no terminal route is admissible unless every
intent in every GraphCall and Frame has its matching later
`construction_delta_observed` with an admitted action-evaluation fold. The
terminal frame must also contain the post-delta refreshed basis and converged
projection citing its admitted intent, closure decision, and refreshed gap.
The refreshed calls must use the same three declared semantic-authority
identities as the initial model, gap, and next-action calls. A terminal route
immediately after `evaluateAction`, directly from F_H resume, or under any
renamed or omitted stage role cannot bypass that invariant.

Model, gap, basis, ledger, decision, and next-action values remain Product
semantics. ABG admits and replays them but does not calculate them.

### 12.4 Prohibitions And Evidence

- No F_H response, pending result, or individual evidence row is closure
  truth.
- No expected output asset is semantic evidence until Product output and ABG
  admission establish it.
- No scalar approval value substitutes for `ActionEvaluationBasis`.
- No action absent from the admitted Program catalog may open an intent or F_H
  interaction.
- No substituted policy, observation, workspace, catalog, obligation, or
  semantic-authority identity may enter the governed fold.
- No route event doubles as construction-intent authority.
- No Public, HoG, implementation, or projector selects an action or creates a
  ledger, decision, delta, or terminal truth.
- No model, gap, or projection-specific event family is introduced; ordinary
  C-call truth plus the published construction events remains sufficient.

The installed external Product proves the complete sequence through fresh
public contexts and the same durable Run. It also proves that a canonical
Program whose catalog omits the proposed action refuses before intent or F_H
admission, and that an otherwise Product-valid response naming another intent
refuses before response admission. Installed mutation negatives additionally
prove refusal of:

1. terminal closure immediately after `evaluateAction`;
2. terminal closure directly from the F_H resume;
3. the old scalar approval input in place of `ActionEvaluationBasis`;
4. a canonical ledger and decision that omit the admitted evidence;
5. a Product-valid substituted closure policy;
6. a Product-valid action absent from the admitted catalog;
7. expected but unobserved output assets;
8. a self-consistent substituted WorkspaceBinding;
9. an unresolved construction intent in another Frame; and
10. an installed-byte failure after continuation resume.

A complete converged path with every descriptive stage role renamed remains
green, proving that the admitted `ConstructionComposition` and replay-visible
lineage, not magic strings, own construction semantics and closure.

This delta repairs the selected-action, governed evidence-fold, and
post-evidence refresh boundary. It does not close S03 or disposition the
remaining consequence, runtime-disposition, and public-control obligations.

### 12.5 Typed Gap Stop And Public Re-entry

The next S03 vertical extends the same externally packed Product without
adding another operation, controller, continuation kind, or event family:

```text
Product-owned ObservationSnapshot reports one unavailable action basis
  -> Product-owned evalGap emits the typed unresolved pressure
  -> Product-owned evaluateNext emits one no-action gap_stop projection
  -> ordinary C-call evidence, result, and judgment admission
  -> ABG admits gap_stop against the exact evaluateNext authority and basis
  -> traversal_route_admitted(gap_stop) + run_stopped(gap_stop)
  -> project.read(gaps) replays the stopped frontier without appending truth
  -> an external Product observation changes
  -> repeated run.invoke(start) presents the exact stopped-run authority
  -> ABG admits public_start_reentry under the same immutable Product,
       WorkspaceBinding, CatalogView, Program, composition, and event history
  -> the ordinary One Surface path selects the now-lawful action
  -> governed evidence fold, refresh, and convergence
```

`NextActionProjection` is total. Its selected form names one admitted
`ActionCatalog` row. Its no-action form names `gap_stop`, the exact
`NextActionBasis`, gap, target obligations, missing assets, reason, rejected
action rows, Product Program, and lawful basis refs. The no-action form creates
no `ConstructionIntent`, target cursor, F_H interaction, retry, delta, or
closure truth.

ABG admits `gap_stop` only at the declared initial `evaluateNext` authority and
only when the Product result, admitted C-call judgment, observation,
WorkspaceBinding, ActionCatalog, construction policy, runtime frontier, and
gap identity agree. The admitted route consumes the judgment and current
locus, stops the Run with disposition `gap_stop`, and remains distinct from a
generic block or failure. The existing traversal-route and run-stop event
families are sufficient.

The public gap authority is a serialized, self-digested projection of existing
truth: durable event-log prefix, stopped Run and route, admitted no-action
projection, ProductInstall, exact ResolvedProductLock and ProductSet,
WorkspaceBinding, AdmittedCatalog, CatalogView, original public start identity,
and the original public setup references. It owns no new runtime state.
`project.read(gaps)` reopens that exact prefix, verifies all named admissions,
projects the stopped frontier, and closes the sink without appending an event.

Repeated `run.invoke(start)` may carry that authority and a fresh
Product-owned `ObservationSnapshot`. ABG admits re-entry only when:

1. the source route and `run_stopped` event are the exact admitted
   `gap_stop`;
2. the source gap has not already appeared as the consumed re-entry basis of
   another admitted invocation;
3. the new observation cites that gap and changes no ResolvedProductLock,
   ProductSet, workspace, catalog, Program, composition, or public start
   authority;
4. the same append-only event log is reopened at an exact prefix that contains
   the complete stopped source;
5. the new invocation admission records the source gap basis before a fresh
   Run opens; and
6. the Product, not Public, HoG, or ABG, determines whether the changed
   observation now permits a selected action.

Stale event-log prefixes refuse by append integrity, but prefix freshness is
not the single-transition authority. Even if a caller rebinds the historical
gap to the latest lawful reopen prefix, ABG rejects a second transition when
an existing `invocation_admitted.reentryBasis` has consumed the same source
invocation, Run, route, stop, projection, and gap. Re-entry does not cross-link
run-scoped event causation; the new workspace-scoped invocation admission
carries and validates that exact source basis.

Installed evidence shall prove:

- a no-action Product result becomes typed `gap_stop`, never generic success,
  retry, hold, or closure;
- the stopped trace contains no target cursor, `ConstructionIntent`, F_H
  interaction, construction delta, terminal route, or run closure;
- `project.read(gaps)` returns the replayed gap and lawful no-action basis
  without changing event count or digest;
- a fresh public context re-enters from the exact serialized gap authority and
  a changed Product observation, then converges through the ordinary four
  semantic authorities and evidence fold;
- missing, stale, wrong-workspace, wrong-Program, wrong-gap, non-gap,
  reduced-ProductSet, and already-consumed re-entry bases refuse before a new
  Run opens;
- Public and HoG neither select the post-gap action nor manufacture the changed
  observation.

### 12.6 Resolved Run Projection

The accepted F_H continuation authority remains a durable read basis after its
continuation resolves. `run.continue` returns the same self-digested authority
updated to the exact appended event-log prefix. It does not create a second
run identity, projection store, or mutable current-run pointer.

From a fresh public context, `project.read` may consume that exact authority to
render:

- `status`: the replay-derived runtime and construction status;
- `result`: the admitted result contract, value, closure eligibility, and
  replay basis;
- `replay`: the ordered admitted event rows and replay identity for the exact
  Run; and
- `lawful-actions`: the admitted `NextActionProjection` at the current
  frontier, including the selected F_H action while held and the converged
  projection after the governed evidence fold.

All four variants reopen and verify the same ProductInstall,
WorkspaceBinding, CatalogView, Program, GraphFunction, invocation admission,
Run, continuation, and event-log prefix. They append no event and invoke no
Product evaluator, HoG traversal, implementation, or action-selection logic.
The projector may classify already-admitted truth for display, but it may not
create a gap, action, result, closure, or continuation.

Installed evidence shall prove open, responded, and resolved status reads;
selected and converged lawful-action reads; resolved result and ordered replay
reads; fresh-context operation; no event-count or event-digest change; and
refusal of stale, substituted-Run, or unresolved-result authority.

### 12.7 Typed Reprice-Required Stop

The external Product may determine that its current observation admits no
construction action and requires constitutional reprice. The observation
carries the factual change-authority state, `evalGap` derives constitutional
pressure, and `evaluateNext` alone maps that pressure to the typed no-action
disposition `reprice_required`. The caller does not supply a desired
disposition. The decision uses the same admitted observation, gap, obligation,
action-catalog, priority, runtime, policy, and Program basis as every other
next-action projection.

This result proposes no reprice and changes no constitutional authority. ABG
admits the exact Product result and judgment, then uses the existing
`gap_stop` route to stop unresolved traversal. The route is the no-action stop
carrier; it does not erase the Product semantic disposition. The admitted
`run_stopped` event, replay state, and public outcome preserve
`reprice_required` exactly.

This slice does not claim the `escalation_or_reprice` consequence route or the
`reprice` runtime action. Applying a reprice remains subject to the existing
change-class and human-authority law and must establish a new lawful Product
basis.

`project.read(gaps)` may reopen the exact durable stop and render its gap,
basis, and `reprice_required` projection without appending truth. The existing
serialized gap authority remains a read authority because the Product still
stopped over unresolved gap pressure. It is not a transition authority:
public-start re-entry is admissible only when the source projection's exact
no-action disposition is `gap_stop`. A caller cannot relabel
`reprice_required` as `gap_stop` or use the reprice stop to open a successor
Run.

Installed evidence shall prove:

- the Product-owned reprice decision reaches ABG as a valid no-action
  projection under the exact admitted basis;
- replay and the public outcome preserve `reprice_required` rather than
  generic success, failure, block, or `gap_stop`;
- no target cursor, construction intent, F_H interaction, delta, terminal
  route, or run closure follows that stop;
- a fresh-context read is side-effect free and renders the exact disposition;
- an unsupported observation authority state refuses before a Run opens; and
- attempted ordinary gap re-entry refuses without changing the event log.

### 12.8 Product-Selected Graph-Span Re-entry

Graph-span re-entry remains ordinary direct GTL traversal. The Product owns a
bounded `re_enter` application between two exact loci of one admitted
GraphFunction and emits a `graph_span_selection` result when its domain
semantics require that application. The validator checks the application's
static structure. HoG traverses the admitted application. ABG alone admits the
runtime route and resulting truth.

The admitted `re_enter` application shall bind:

- one Product-owned selector GraphFunction;
- exact source and target `CProgramLocus` values in the same graph;
- an earlier target locus on the same declared node;
- exact selector input and output contracts; and
- a positive maximum application count.

The source locus may select either `re_enter` or ordinary continuation through
one stable `graph_span_selection` result family. A re-entry result names the
exact target locus, target input value and digest, application reference,
source judgment, and current traversal cursor. A continuation result names no
re-entry target. Product code owns that semantic choice; Public, HoG, and ABG
may not infer it from graph shape or current state.

ABG admits `re_enter` only when the Product result, admitted application,
current replay projection, source C-call result and judgment, exact loci,
contracts, target input, and remaining application budget agree. HoG derives
the target cursor from the admitted route. The existing cursor `attempt`
coordinate records the bounded visit ordinal; it does not create another
program, graph, execution plan, controller, or runtime.

The existing `traversal_route_admitted` event and replay projection preserve
the admitted re-entry. No new public operation or event family is required.
Ordinary traversal after the target preserves the visit ordinal until another
declared retry changes retry scope, so repeated selection cannot evade the
application bound.

Installed evidence shall prove:

- one separately packed external Product selects one backward graph-span
  re-entry and then converges through the ordinary installed SDK and CLI path;
- replay records exactly one `re_enter` route caused by the selector C-call
  judgment before the second target visit;
- the Product observes the second visit and selects ordinary continuation;
- a forward, cross-node, missing, or ambiguous target refuses during static
  admission; and
- a second Product selection beyond the admitted bound is refused as runtime
  failure without closure truth.

### 12.9 Product-Owned Public Next And Asset Targets

The public `start` variant preserves the request relation
`scope + target + until` without introducing a public traversal controller.
This slice admits two direct, bounded target forms:

```text
scope = program
target = next | asset:<Product handle>
until = converged
rootMode = direct
```

The Program owns the default start used by `next`. It may also publish an exact
asset-target registry whose rows bind one public handle and asset identity to
one of its declared starts. The selected start owns the callable
GraphFunction. The asset remains non-callable.

Target resolution is one total lookup over the admitted Program. Public
transports the request and resolved declaration into ordinary invocation
construction. ABG independently admits the raw request against that exact
Program start and GraphFunction. HoG then performs one ordinary direct
GraphFunction traversal to its declared convergence. Direct convergence does
not add the One Surface overlay, install an SDK loop, select an internal C
cursor, or imply traversal of another Program entry.

The supervised `until = converged` start and durable gap re-entry remain
unchanged. A direct request cannot carry gap re-entry authority, and the two
root modes cannot be exchanged without matching the admitted Program policy.

Installed evidence shall prove:

- `target = next` resolves the Program's declared default start and returns its
  replay-agreeing typed result;
- `target = asset:<handle>` resolves the Product-published asset row to the
  same owning start and GraphFunction without calling the asset;
- the admitted invocation event preserves the exact request and resolved
  callable identity; and
- `until = first_traversal` refuses for both root modes before a Run opens; and
- missing default, unknown asset, duplicate asset ownership, mismatched
  start, or unsupported mode/until combinations refuse before a Run opens.

### 12.10 Governed Correction And Escalation

The final S03 vertical extends the accepted One Surface path after admitted
F_H evidence. It does not add a correction controller, a second continuation
kind, or a new event family:

```text
Product observation identifies one correction pressure
  -> Product evaluateNext selects the existing declared F_H action
  -> ABG admits ConstructionIntent and opens the exact continuation
  -> interaction.respond(answer_escalation) admits one attributed choice
  -> run.continue reconstructs the exact ActionEvaluationBasis
  -> Product evaluateAction consumes the intent, evidence, workspace,
       policy, and runtime archive refs
  -> ABG admits the action evaluation and construction delta
  -> the same Product authorities refresh model, gap, and next action
  -> Product emits repair | inspect_runtime_archive | reprice | escalate
  -> ABG admits one non-progress route and stops the Run with that exact
       semantic disposition
  -> replay and fresh-context public read preserve the decision and basis
```

The correction choice is not a caller-selected runtime route. The initial
Product observation declares the factual pressure. The Product response
contract admits only a choice allowed for that pressure. `evaluateAction`
emits the candidate fulfillment ledger, decision, and runtime-archive
inspection projection. ABG verifies those values against the exact admitted
F_H response, action-catalog row, evidence set, workspace, policy, and causal
event refs before admitting the construction delta.

`evaluateAction` emits `close_candidate` only for the existing fulfilled
approval path. A governed correction emits `continue_candidate`; it cannot
authorize closure. The post-evidence `evaluateNext` authority then emits one
typed no-action projection carrying the selected correction disposition.
HoG proposes only the existing non-progress route. ABG records the route and
`run_stopped` atomically and preserves the Product disposition rather than
collapsing it into generic success, failure, or `gap_stop`.

The four dispositions have bounded meaning:

- `repair` admits a Product correction decision. Applying a source edit
  remains owned by the developer or a separately admitted Product action.
- `inspect_runtime_archive` exposes a typed projection over the exact causal
  runtime-event refs supplied by ABG. It does not create another truth store.
- `reprice` records an attributed proposal under F_H authority. It does not
  mutate Product, requirement, design, or ticket authority.
- `escalate` records an attributed unresolved-authority escalation. It does
  not grant the responding actor new authority.

`reprice` or `escalate` satisfies the retained
`escalation_or_reprice` consequence family because the action is declared by
the Product, selected under Product policy, attributed to F_H, admitted by
ABG, and replay-visible. Applying a reprice remains outside runtime and
requires the ordinary constitutional re-entry path.

Installed evidence shall prove:

- each correction pressure selects the same declared F_H action before the
  Product evaluates the human response;
- `answer_escalation` with the wrong choice, actor, capability, intent,
  workspace, evidence, policy, or archive basis refuses without a correction
  stop;
- the action evaluation and construction delta precede the refreshed
  no-action projection and stopped Run;
- `repair`, `inspect_runtime_archive`, `reprice`, and `escalate` remain
  distinct in Product result, route basis, `run_stopped`, replay, and
  fresh-context status/replay reads;
- no correction path emits terminal, frame-close, GraphCall-close, or
  Run-close truth; and
- no compiler, lowering carrier, Public loop, feature-specific HoG runner, or
  alternate runtime is introduced.

## 13. S05 Ordinary-Path Consensus

S05 adds one ABIogenesis-owned standard-library publication to the already
accepted Product-neutral extension path. It does not add a Consensus runtime,
public command, event family, controller, scheduler, or ticket writer.

```text
packed ABIogenesis Product
  -> SYSTEM-owned Consensus ModulePublication
  -> ordinary catalog admission and view
  -> admitted Program and canonical Consensus GraphFunction
  -> HoG fan-out / fan-in / bounded recursion over declared GTL
  -> ordinary F_P reviewer leaves and F_D reduction
  -> typed closed_done | recurse_next_round | escalate_fh outcome
  -> ordinary F_H hold/respond/continue only for escalate_fh
  -> ABG result, events, replay, and public projection
```

### 13.1 Product-owned domain

One closed domain family owns:

- `ConsensusSubject`, including exact subject and optional ticket identity;
- `ConsensusReviewerProfile` and a non-empty, duplicate-free panel;
- `ConsensusRoundPolicy` with positive budget and declared convergence,
  disagreement, escalation, and foldback rules;
- attributed reviewer task and finding-set values;
- ordered round state, ruling rows, dissent, evidence, and lineage;
- `ConsensusRoundOutcome` with exactly
  `closed_done | recurse_next_round | escalate_fh`;
- `ConsensusResult`; and
- `TicketConsensusProjection`.

The nine public contract identities and two closed vocabularies are projections
of that family. `ModulePublication.contracts` is their installed addressable
catalog in this slice. Native admission and serialized values have the same
meaning. No JSON schema, generated registry, or second decoder is required.

### 13.2 Published GTL

The canonical public identities remain:

- handle `gtl://abg/consensus/submitter-reviewer-rounds`;
- GraphFunction
  `graph-function://abg/consensus/submitter-reviewer-rounds`; and
- owner `owner://abg/substrate`.

The same Program publishes subordinate reviewer, reducer, round, and
escalation GraphFunctions. Only the canonical GraphFunction is the public
Consensus callable. Subordinate functions are callable members needed by
`workflow.C`, fan-out, reduction, recursion, and F_H continuation; they are
not additional Consensus products.

The canonical body is direct GTL:

```text
bounded recursion evaluator
  -> declared recurse application
  -> child round GraphFunction
       -> C.batch(workflow.C(reviewer))
       -> declared fan-out materialization
       -> workflow.C(reducer)
       -> declared fan-in reduction
  -> admitted foldback to the parent evaluator
  -> terminal ConsensusRoundOutcome
```

The initial state is non-terminal so the first round uses the same child path
as every later round. Reducer output alone determines agreement,
`recurse_next_round`, or budget exhaustion. The recursion bound and policy
budget must agree. Missing, duplicate, misattributed, malformed, or
out-of-policy values refuse before foldback or closure.

### 13.3 Compute and authority

Reviewer leaves are `F_P`. Each task binds exact profile, configuration,
subject, panel, policy, round, instruction, result contract, capability,
workspace, and invocation identity. ABG owns worker/process truth and evidence
admission. Completion order never determines profile attribution or reducer
order.

Reduction, envelope checks, panel membership, exact agreement, round-budget
checks, ruling vocabulary, and ticket projection are `F_D`. Deterministic
code cannot manufacture semantic findings.

`escalate_fh` is typed Product data, not an open interaction. The Program
publishes one escalation GraphFunction whose ordinary `F_H` leaf consumes the
exact unresolved result basis. `interaction.respond` and `run.continue`
produce one attributed human decision before a finalizer emits the terminal
Consensus result. Agreement and bounded dispute resolution never enter that
F_H function.

The public scenario driver may invoke the Product-declared escalation start
only when the canonical result is exactly `escalate_fh`. It transports the
typed Product result; it does not select reviewers, run rounds, reduce
findings, construct events, or decide closure.

### 13.4 One Surface admission

Consensus is a callable inside one admitted Program, not the Program itself.
The Program shall publish its start, action membership, and callable
dependencies so the standard One Surface can select the canonical function
through Product-owned `evaluateNext` truth before target invocation. This
selection uses the existing construction-intent authority; Public transports
the admitted target and HoG traverses it.

The first implementation cut may prove the canonical callable and escalation
path directly through ordinary `run.invoke`. S05 does not close until the same
callable is reached from the Program-owned One Surface selection without a
feature-specific Public or HoG branch.

### 13.5 Replay and public result

ABG events remain the only runtime truth. The final public result and
`ticket_consensus` projection are read-only folds over admitted result and
replay state. They bind subject, ticket, panel, policy, ordered rounds,
finding sets, rulings, agreement/dissent classification, outcome, evidence,
lineage, result, and replay identities. They never mutate a ticket.

No Consensus-specific event kind is permitted. Existing invocation, C-call,
actor/process, evidence, result, judgment, route, child-foldback,
continuation, terminal, and closure events must be sufficient.

### 13.6 Installed scenario

One source-blind driver runs the same Product contract against three explicit
workspace bindings:

- the selected existing workspace;
- an independently bound alternate workspace; and
- a caller-created temporary workspace.

For each workspace the driver proves:

1. agreement closes in one round;
2. material dispute admits at least one recurse/foldback and then closes; and
3. unresolved dispute reaches the declared round limit, returns
   `escalate_fh`, enters the ordinary F_H continuation, and closes only after
   an attributed response.

At least two differently attributed profiles participate. The CLI and SDK
return the same typed result as two replay folds. Malformed subject, profile,
panel, policy, finding, ruling, outcome, actor attribution, or cross-basis
reuse remains typed non-close truth.

### 13.7 Semantic-view and authority delta

The accepted M03/M05 module topology is unchanged. This section adds one
Product domain and one publication inside existing ownership:

**Domain view**

```text
ConsensusDomainFamily
  -> ConsensusModulePublication
  -> ConsensusProgram
  -> canonical Consensus GraphFunction
  -> reviewer / reducer / round / escalation GraphFunctions
```

**Interaction view**

```text
Public invoke
  -> ABG invocation admission
  -> HoG canonical traversal
  -> reviewer fan-out
  -> ABG F_P evidence and result admission
  -> Product reduction
  -> ABG foldback and recursion
  -> result or ordinary F_H continuation
  -> replay-derived public projection
```

**Lifecycle view**

```text
admitted
  -> round_open
  -> findings_admitted
  -> closed_done
     | recurse_next_round -> round_open
     | escalate_fh -> held -> responded -> continued -> closed
```

These labels describe projections over existing ABG event truth. They do not
add event kinds or a second state machine.

IACS remains singular:

| Authority | Owns | Does not own |
|---|---|---|
| Consensus domain family | contracts, profile/panel/policy meaning, findings, rulings, outcomes, result | traversal, events, continuation |
| GTL publication | Program topology, canonical and subordinate GraphFunctions, applications, contracts, bindings | runtime selection or truth |
| validator | raw and whole-Program static admission | lowering or execution |
| HoG | direct traversal of admitted GTL | Product semantics or result admission |
| implementations | declared F_D/F_P leaf interiors | graph topology, events, closure |
| ABG | invocation, worker, evidence, result, route, foldback, continuation, replay, closure truth | domain findings or ruling meaning |
| Public | typed invocation and replay projection | panel loop, recursion, reduction, closure |

Prime contraction is:

```text
one domain authoring family
  + one GTL publication
  + one ABG runtime authority
```

Historical X schema registries, native-definition joins, special handlers,
operation rosters, runners, and ticket projectors are neither imported nor
recreated. A second decoder, panel loop, result store, event writer,
continuation, or closure path fails the promotion gate.

### 13.8 Promotion boundary

Promotion requires:

- one package-owned publication with the exact canonical identity;
- raw admission and whole-Program validation of the original GTL;
- ordinary catalog, implementation resolution, HoG, ABG, SDK, and CLI paths;
- all three outcome families over all three workspace applications through
  one driver;
- replay-derived result and ticket projection;
- One Surface selection of the canonical callable;
- no special runtime or public branch;
- `test:m4` and the complete prior `test:m5` gate remaining green; and
- deterministic package reproduction.

Micro-level contract and implementation details may co-evolve inside these
fixed identities and authority boundaries. A change to Product meaning,
runtime authority, event ownership, or public operation identity returns to
design before promotion.

## 14. S06 Portability And Reflective Product Content

S06 closes one developer-visible portability path and realizes the reflective
Product content required before qualification. It preserves the accepted
direct-GTL architecture:

```text
independently packed flavored Product
  -> installed ProductSet and non-empty lock
  -> caller-owned ModulePublication
  -> catalog.admit -> catalog.view -> catalog.apply
  -> run.invoke through native SDK and CLI
  -> the same invocation through a bounded Codex delegate
  -> direct HoG traversal
  -> ABG events and replay-derived result

ABG replay
  -> Product-owned observer GraphFunction
  -> attributed diagnostic projection
  -> Product-owned tuner GraphFunction
  -> attributed declaration draft
  -> tuning.transition propose -> ratify | reject
  -> replay-visible draft disposition
```

No host, fixture, observer, or tuner may own traversal, invoke a worker
directly, emit an event directly, construct a continuation, or decide runtime
closure.

### 14.1 Independent flavored Product

One separately packed fixture represents the public contract class needed by
a graph-language consumer such as odd_glc without making odd_glc itself a 5.0
dependency. The fixture owns:

- a distinct Product, namespace, Module, and Program;
- one node-type declaration contribution;
- one overlay declaration contribution;
- one callable GraphFunction with its own input, output, judgment, and refusal
  contracts;
- one implementation binding; and
- its own product semantics provider.

The workspace binds ABIogenesis and this Product through a non-empty exact
dependency lock. The fixture is admitted from installed bytes and public
exports only. ABIogenesis core contains no fixture Product ID, contract switch,
validator, judgment relation, implementation import, or result branch.

`catalog.apply` consumes one exact admitted CatalogView row. Only `node_type`
and `overlay` rows are applicable. Product code constructs the application
candidate; ABG admits it as an ordinary public-operation artifact caused by the
CatalogView admission. The result preserves the row identity, declaration or
contract reference, owning Product, Program memberships, compatibility, and
provenance. Applying a GraphFunction refuses because callability remains owned
by `run.invoke`.

The installed scenario applies both independent declarations, invokes the
fixture's GraphFunction, and derives the same typed result from the native SDK,
native CLI, and ABG replay.

### 14.2 Bounded Codex projection

The Codex projection is a transport adapter over the installed `abg.cli`
contract. It accepts only:

- the exact installed `abg.cli` executable path; and
- one explicit JSONL public-invocation transcript path.

It invokes `abg.cli --jsonl <transcript>`, forwards stdout, stderr, and exit
status, and adds no interpretation. It imports no GTL, validator, HoG, ABG,
Product, implementation, or Public runtime module. It carries no Program,
catalog, event, continuation, worker, retry, or closure type.

The prior Python Codex build tenant is an alternate implementation and runtime,
not this projection. It is retired transactionally when the bounded delegate
lands. The native SDK and CLI remain independently executable with no Codex or
marketplace dependency.

Projection proof compares one fixed-result invocation through native SDK,
native CLI, and the Codex delegate. Native and delegated CLI output must match
byte-for-byte for the deterministic fixture. A source scan proves the delegate
contains only process transport and no copied Product or runtime semantics.

### 14.3 Observer and tuner Product domain

ABIogenesis publishes one executive Module containing:

- `gtl://abg/observer/default`;
- `gtl://abg/tuner/default`;
- one observer GraphFunction;
- one tuner GraphFunction;
- exact replay-snapshot, observer-report, tuning-signal, declaration-draft,
  transition, and refusal contracts; and
- declared implementations behind those GraphFunctions.

The observer input is an ABG-derived replay snapshot, not a caller-authored
summary. It binds the exact workspace, invocation or qualification subject,
event-store digest, ordered event refs, terminal or halt state, evidence refs,
result refs, route refs, continuation refs, and applicable policy refs. The
observer emits attributed findings and a truthful halt classification. It may
not carry a write, event-emission, traversal, continuation, or closure field.

The tuner input binds the admitted observer report plus replay-derived signal
rows. The tuner emits one declaration-draft candidate preserving:

- draft and proposer identity;
- affected declaration refs;
- replay, observation, and signal bases;
- proposal kind;
- before and proposed-after digests;
- an equivalence-contract ref when the proposal anneals an `F_P` interior to
  an `F_D` interior; and
- a summary that is evidence, not authority.

The deterministic default fixture may emit a bounded draft from a declared
signal. Open semantic interpretation remains `F_P`. Neither form mutates live
declarations, specification, configuration, tickets, workspace assets, or
runtime state.

### 14.4 Public reads and tuning transition

`project.read(observer_report)` and `project.read(tuning_report)` are
side-effect-free replay projections. They reopen the exact durable event log,
derive their output from admitted events and Product results, and append
nothing.

`tuning.transition` owns exactly three variants:

- `propose` admits one authentic tuner output as
  `tuner_draft_admitted`;
- `ratify` admits `tuner_draft_ratified` under an exact actor or visible policy
  authority; and
- `reject` admits `tuner_draft_rejected` under the same authority class.

The events are workspace-scoped ABG truth and preserve draft ref and digest,
workspace binding, proposal kind, proposer, replay and signal bases, affected
declarations, before/after digests, decision actor or policy, and causation.
Ratify and reject require the exact open admitted draft and are mutually
exclusive. Repeated, cross-workspace, substituted, unattributed, or
non-tuner-authored transitions refuse.

Event Calculus initiates `tuner_draft_open(draftRef)` on admission and
terminates it on ratification or rejection. Replay projects the exact draft
state and decision event. Ratification records authority only; applying the
draft requires later ordinary intake, change classification, and work under
the affected Product owner.

### 14.5 Qualification readiness

M5 does not issue the S04 qualification verdict. It makes S04 runnable by
proving the installed behavior over a bounded candidate-like replay fixture:

1. a truthful halted replay produces an attributed observer report;
2. an injected contradictory replay produces the expected non-green finding;
3. the tuner emits a grounded declaration draft from admitted signal truth;
4. proposal, ratification, and rejection are replay-visible;
5. a draft lacking signal or replay basis refuses;
6. neither observer nor tuner mutates live authority or source; and
7. all reads are side-effect free.

M6 repeats this behavior over the exact frozen `pre_rc_candidate`, selected
STDO basis, complete inventory, and qualification subject.

### 14.6 Semantic views and authority

**Domain view**

```text
FlavoredCatalogProduct
  -> node_type + overlay + GraphFunction

ExecutiveDomain
  -> ReplaySnapshot
  -> ObserverReport
  -> TuningSignal
  -> DeclarationDraft
  -> DraftDisposition
```

**Interaction view**

```text
native SDK | native CLI | Codex delegate
  -> one Public contract
  -> catalog/apply/invoke
  -> HoG
  -> ABG
  -> replay projection

project.read(replay)
  -> observer GTL
  -> tuner GTL
  -> tuning.transition
  -> ABG replay
```

**Lifecycle view**

```text
declaration: admitted -> applied
draft: candidate -> admitted -> ratified | rejected
```

These states project existing Product and ABG truth. They do not create a
controller or independent workflow.

IACS remains singular:

| Authority | Owns | Does not own |
|---|---|---|
| flavored Product | declarations, contracts, Program, GraphFunction, judgment, implementation | ABIogenesis runtime or public semantics |
| Codex delegate | process transport to installed CLI | Product, traversal, event, continuation, closure |
| observer Product content | attributed diagnostics over replay | mutation or runtime truth |
| tuner Product content | signals and declaration-draft candidates | ratification or live mutation |
| human or declared policy | ratify or reject decision | retroactive draft authorship |
| GTL publication | observer/tuner topology and contracts | runtime admission |
| validator | static program and contract law | lowering or execution |
| HoG | direct traversal | Product semantics |
| ABG | declaration application, draft transition, events, replay | diagnosis or proposal meaning |
| Public | typed invocation and projection | fixture, observer, or tuner orchestration |

Prime contraction is:

```text
one public invocation family
  + one direct traversal runtime
  + Product-owned semantics
  + ABG-owned admitted truth
```

The old Codex runtime, observer runner, tuner state store, manifest-only
capability roster, host-owned Product switch, and source-tree fixture import
are prohibited rival authorities.

### 14.7 Promotion boundary

Promotion requires:

- native SDK, CLI, and bounded Codex projection agreement;
- one source-independent flavored Product applying node-type and overlay rows
  and invoking its GraphFunction through installed public contracts;
- observer and tuner execution as ordinary admitted GTL;
- side-effect-free observer and tuning reads;
- authentic proposal plus mutually exclusive ratification and rejection;
- injected-negative, cross-basis, duplicate-transition, and direct-mutation
  refusals;
- deletion of the alternate Python Codex runtime;
- no fixture-specific core branch, compiler, lowering carrier, controller,
  second runtime, or second truth store;
- `test:m4`, complete prior `test:m5`, and deterministic package reproduction
  remaining green.

Micro implementation details may co-evolve inside these fixed identities.
Changing Product meaning, public operation identity, event ownership, or the
GTL/HoG/ABG authority split requires renewed design review.
