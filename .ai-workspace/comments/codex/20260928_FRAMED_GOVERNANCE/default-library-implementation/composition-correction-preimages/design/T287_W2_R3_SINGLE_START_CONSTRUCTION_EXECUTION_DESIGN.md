# T-287 W2-R3 Single-Start Construction And Execution

Status: `W2-STEEL-03-D/correction-01`, proposed HOW successor, frozen for Executive-owned review.
This candidate selects no implementation or live run and changes no existing
C0/C1/C2/C3 HOW. Executive `/root` consumes the
[frozen subject](../../../../.ai-workspace/comments/codex/20260908_W2_STEEL_SEQUENCE/thread-03-design/correction-01/subject.json).

## Basis and outcome

The fixed 16-family [Product](../../../../specification/PRODUCT.md), RC6
manifest `bed7535a5feddc5e874993ff96d1f5f27e2a0fff63f366fc3b1fec3e301dd9e0`,
and [project frame](./ABI5_PROJECT_REFERENCE_FRAME_BASIS.md) govern. Apply the
released Derived Worker, Design Component, Owner, Effect and Proof relations
to `F-WORKSITE-CAUSALITY`. The subject binds the exact source/preimage cut;
concurrent R2 implementation is not part of that frozen source. R2 producer
HOW `193cdb1863486cac10387c5f3c6ac2c50af9d9cb363e2c64e1c21b5a81e27051`
is separately Executive-accepted, with implementation/proof pending. Its
installed producer path is a prerequisite to this thread's installed witness.
Exact sources govern while the local a_c map is stale. Wave 2 remains HOLD.

Existing WHAT is sufficient: `REQ-L-GTL3-GRAPHFUNCTION-002/006/016..018`,
`REQ-L-GTL3-COMPOSE-007..012`, `REQ-L-GTL3-C-ALGEBRA-001/004/006/010/016`,
`REQ-R-ABG3-BINDING-003..005/010/011/016..018`, `REQ-R-ABG3-GRAPHCALL`,
`REQ-R-ABG3-CCALL-001/013/014`, `REQ-R-ABG3-FN-COMP-015/021..024`,
`REQ-P-INSTALL-049..055`, `REQ-P-CATALOG-014..018`, and
`REQ-M-GTL3-PROGRAM-TRAVERSAL-004..014`. This HOW realizes existing child
composition, cumulative binding and exact installed ownership laws. It adds
no Product family, Public operation, executor, scheduler or event family.

A separately owned consumer authors and publishes the actual GTL Program,
its root GraphFunction, contracts, starts, membership and expected outcome.
It selects ordinary ABI-owned library declarations and implementation bindings
through the admitted dependency closure. One installed `run.invoke#start`
enters this declared graph; the host supplies input only before that start:

```text
consumer root input: { constructionTask, commands, outcomePredicates,
                       allowedWriteTerritories }
  -> authored F_D input selection -> unchanged C1 task
  -> workflow.C(C1 root) -> admitted ConstructionResult
  -> declared graph-edge binding of original root input + that result
  -> authored F_D C2 task preparation -> existing C2 task
  -> workflow.C(C2) -> admitted command observation
  -> declared root judgment/closure -> fresh installed result and replay
```

Both F_D leaves are ordinary published pure ABI implementation seams used by
the consumer's authored C stages. They do not select traversal. C1 alone
constructs candidate bytes, guarded C0 owns physical writes, C2's Worker alone
executes the subject commands/probes, and ABG owns all admitted truth. The
consumer declares its configuration and interprets the resulting observation;
no host C1-then-C2 invocation sequence qualifies. A copied ABI Program or
hardcoded Hello publication cannot replace the independently authored Program.

## 1. Typed retention at the graph edge

Keep all seven C generators and every existing `workflow.C` input/output pair
unchanged. In particular, C1 remains `Task -> ConstructionResult` and C2
remains `Task -> Observation`. Retention belongs to an explicit edge between
nodes of the enclosing materialized Graph, not to a retyped child callable or
a new `C.compose` mode. Ordinary `composeGraphFunctions` retains its current
one exact left-output/right-input scope.

Refine the existing `GtlEdge` with one optional closed subordinate
`inputBinding` declaration:

```typescript
{ kind: 'retain_graph_input',
  entryContractRef: E,
  sourceContractRef: S,
  targetContractRef: T }
```

There is one fixed value relation. The edge's target receives exactly
`{ kind: T.valueKind, schemaVersion: '5.0.0', entry: e, source: s }`, where
`e` is this GraphCall's admitted graph-entry value under E and `s` is this
edge's exact successful source-node result under S. T is the selected
published target contract; its ordinary owner validator must accept this
closed four-field record. This is a subordinate input binding, without an
independent identity, public carrier family, selector language or arbitrary
object merge. No arbitrary field paths, default values, ambient input,
replacement environment, fan-in, rebinding or inferred source are supported.

`ContractDeclaration` metadata and `valueKind` do not prove this nested
shape. The sole structural source is the ABI-owned preparation contract
source in `product/worksite_preparation_contracts.ts`, shared by the typed
constructor, raw Validator and concrete preparation validator. It defines E
(the closed preparation input in §2) and T together with their ordinary
contract declarations; S references the existing C1 construction-result
contract declaration and owner validator, without redefining that result.
For this C1 path their exact refs are:

- E: `contract://abiogenesis/worksite/command-execution-preparation-input@5`;
- S: `contract://abiogenesis/worksite/construction-result@5`;
- T: `contract://abiogenesis/worksite/command-execution-preparation-bound-input@5`.

T's module-local closed record schema has exactly four required properties:
`kind` is the literal from its declaration, `schemaVersion` is literal
`5.0.0`, `entry` is a contract-value node referencing E's exact declaration
and schema, and `source` is a contract-value node referencing S's exact
declaration and existing owner validator. Additional properties are refused.
The native T type and concrete T validator derive from these same field
nodes. The static retention relation is a projection of this schema's two
contract-value nodes, including the complete E/S/T declarations; it is not a
separately maintained tuple table. This fixed module-local schema description
adds no consumer schema language, registration API or general schema registry.
The later C3 preparation form uses its corresponding exact owner-declared
source/schema relation under §2, never a match on a shared `valueKind`.

Both the native edge constructor and raw `validateProgram` call the same pure
static relation check. It compares the supplied E/S/T raw declarations with
the source-derived declarations in full (`contractRef`, `contractVersion`,
`contractKind`, `valueKind` and their canonical digests), and requires the schema's exact E/S/T tuple.
It also checks E equals the enclosing GraphFunction's sole input, S equals
the source node's output and T equals the target node's input. Unknown or
crossed tuples refuse during Program validation, even if their valueKinds
coincide. No native type assertion, runtime value sample, caller-supplied
schema or claimed relation is accepted as this proof. The schema/source is
module-static in the installed Validator; existing `ProgramValidationInput`
continues to carry declarations, not a new schema authority.

Before any C1 dispatch, the existing installed declaration/basis admission
must additionally join each of E/S/T to its unique `contractOwners` coordinate
(`productId`, `installId`, `moduleRef`, `publicationDigest`) and exact declaration
in that admitted publication. E/T and the preparation leaf definitions,
implementation bindings and semantic cases must resolve to the ABI C2
publication that owns this schema source; S must resolve to the ABI C1
construction-result owner. The actual installed artifact/module identities
must bind the same source-derived declarations and validators used by the
static check. A consumer declaration reusing those refs or valueKinds, an
unknown owner, or a crossed definition/install refuses at this pre-effect
gate. Raw static success establishes the bounded shape relation; it does not
itself establish an installed owner or authorize execution. Both checks are
required, using the existing selected closure rather than a new resolver.

Serialization/raw readmission preserves the complete edge value and digest.
Include the optional binding in the existing `graphEdgeRef` canonical body
when present; unbound edges retain their original identity algorithm.
Changing the binding cannot retain the same edge identity. The enclosing
`environment` declares E preserved in `carries` and S as a provided/carried
binding. Missing, conflicting or narrowed-away E/S, an undeclared binding or
an ambiguous source edge is a typed validation refusal before effects.
Concrete values still undergo the owner validation below; a malformed value
is not confused with the static contract-shape proof. Nodes on either side
retain their exact C signatures. Without this explicit binding, ordinary
carrier equality is still mandatory; wrapping `workflow.C(C1)` as a different
A/B is a falsifier.

At the reached edge, ABG reconstructs `e` from this exact ExecutionBasis's
`rawInputAdmissionRef/rawInputDigest/rawInputValue`, and `s` from the actual
source C-call result and `advance` judgment. A workflow source also requires
its authenticated completed child foldback. The source cursor, edge,
materialized graph, Program, B, frame, retry path and GraphCall must agree.
HoG's cached `graphEntryInput` is usable only after equality with that admitted
value; it is not an input authority. Multiple calls with equal bytes remain
distinct through their call/cursor/causation identities.

ABG validates the fixed record against T, then uses existing `rawAdmitValue`
for its canonical input ref/digest. Record that complete `RawAdmittedValue`
as optional subordinate `boundInput` in the existing
`traversal_route_admitted` payload for this declared edge. Its route causation
includes the exact entry-basis and source result/judgment/foldback evidence;
its target cursor names the raw admission ref and subject digest. The owning
route verifier independently recomputes the value and coordinates. There is
no new input event or ref algorithm. Raw admission alone is not runtime
admission: only the accepted route makes this input available at the target.

HoG consumes only the admitted bound value at the next declared node. Resume
and fresh replay reconstruct the same record from the bound route and exact
source prefix, revalidate its provenance and preserve the same target input
identity. Tampered/crossed `boundInput`, a copied raw admission or a mismatched
route refuses. No global carry store, process-local registry or new fluent
family is introduced; the existing cursor/route availability owns the bind.
Replay reference normalization binds its admission ref as this route's raw
input; it cannot drop the ref or treat it as an unbound literal. Target Run
event and fluent scope remain unchanged.

## 2. Actual C2 task construction and start authority

Publish the two pure seams in the existing C2 worksite declaration/implementation
owners, with ordinary input/output/evidence/failure/refusal/judgment contracts.
The preparation declarations and T validator consume the single contract
source specified in §1; they do not restate its nested shape independently.
They require no new Program, Public endpoint, worker or semantic provider.
The consumer publication explicitly selects the existing installed ABI
semantics binding and dependency; extend that owner with these declared
contract/relational cases rather than copying ABI semantics into the consumer.

The root input is a closed ordinary C2 preparation contract containing exactly
`kind`, `schemaVersion`, `constructionTask`, `commands`, `outcomePredicates` and
`allowedWriteTerritories`. The last three use existing C2 input types and are
explicit arrays. The construction task is the existing C1 task; the later C3
form uses its existing aggregate task and the same serial relation. It retains
full A/W, the actual capability grant and all original target subjects (C3
reproduces full A from its canonically equal branch tasks, without a new
aggregate field). It
contains no purported result, ABG source basis, event ref or continuation.

The first F_D seam validates that input and projects the unchanged construction
task. It reuses the existing pure command/predicate/territory checks, including
unique identities, declared command references, allowed/protected paths and
source-target coverage, so malformed initial configuration fails before C1
Worker dispatch. Factor those checks without constructing a fictitious source
result or observation. Its judgment requires exact equality with the input's
construction task; this authored stage remains visible in the C-call spine.

The second F_D seam consumes T's exact `{entry, source}` pair. It validates the
original task and the existing ConstructionResult, matches every ordered
member to the original target subject and O1, and forms protected-observation
inputs from those exact pairs. C3 uses the existing branch-order/target-order
flattening; it does not merge branch results independently. It calls
`constructWorksiteCommandExecutionTask` with the original task's full A/W and
grant, source internal ref/digest/value, unchanged commands/predicates/write
territories and those protected observations. Its output is the **existing**
closed C2 task. Its deterministic judgment reconstructs this same constructor
result from the same admitted input; no guessed subject, source or command is
accepted. Both seams are pure and cannot read files, launch a tool, admit
events or choose a next node.

The task/request grant is canonically the actual grant in the root
InvocationAdmission, for its exact `run.invoke#start` or standalone `#invoke`
definition, actor, capability, W scope and declaration authority. Permit those
two existing member variants in C0/C1/C2 structural task guards; at root/child
basis admission and guarded C0 dispatch rehydrate the actual root invocation
and require exact grant membership and selected-definition equality. Merely
allowing either member name is insufficient. All children preserve that grant;
none mint an internal public invocation or relabel `#start` as `#invoke`.
Full A/W and this grant are checked before the first worksite Worker/effect.
The initial preparation input requires a null external source-result basis;
the source is produced only by the declared child and admitted bind chain.

## 3. Independently exact installed owners

| Identity | Required owning relation |
|---|---|
| Program owner `I_P` | Exact admitted closure `programPublication`, module/publication digest, declared Product, manifest Program row and causal ProductInstall. `W.roots.productRoot == I_P.installedRoot`. Implementation rows do not infer this owner. |
| Called GraphFunction owner `I_G` | Unique admitted `graphFunctionOwners` coordinate, original module/publication/template/contracts, manifest contribution, installed Product and exact dependency/callable membership relation to the selected consumer Program. |
| Selected implementation owner `I_L` | Unique `implementationBindingOwners` coordinate plus exact admitted resolution row, binding/descriptor/publication digest, package/version/module/symbol, installed content and dependency compatibility. |

All installs belong to the same exact admitted ProductSet and resolved lock.
Reuse the existing declaration closure and installed leaf-port owner resolution.
Keep root and child Program/catalog/actor/full A/W/validation identities and
all exact local-leaf subset joins: requirement, GF digest, locus, fibre,
contracts and binding. An absent, ambiguous, incompatible, crossed or
non-admitted owner refuses before dispatch. Manifest membership is checked
against each owner's actual declaration plus the admitted consumer dependency
relation, not by requiring an ABI publication to claim the consumer Program.

At C0, retain the complete current-prefix, B, C-call-phase, exact raw request,
C0 callable/contracts/effect/handler, grant, subject, territory and O0 guards.
Only the conflation of `I_P`, `I_G` and `I_L` is removed. Protect the six W
roots and every installed Product root in that exact ProductSet; pure path
constructors retain their W checks and the effect boundary checks the complete
admitted set. Every mutable target stays beneath A.canonicalRoot. Inventory
the Program and all exercised declaration/implementation installs before and
after the run. C2's toolchain helper must join the exact admitted ABI owner
install; preserve its recorded executable, task/launch and exact `{command}`
input. No owner install is patched or used as the mutable worksite.

The ABI-only case remains the equality case `I_P == I_G == I_L`. Changed
ProductSet/lock/roots require a new W and fresh work, without migration.
C0's publication/first-cause/receipt/compensation/residue/currentness law and
its distinct syscall-window P3, and C2's same-user task/launch P3, stay exact.

## 4. Completed source child and leaf admission

Keep the standalone C2 public path and its closed source Run requirement.
For an internal C2 child, ABG derives the source from the actual target cursor:
its input is the admitted result of the declared task-preparation F_D stage;
that stage's input is the admitted retention edge's exact bound input. Trace
that edge to its authenticated source workflow foldback. Do not search for the
latest C1 result, a same-valued result or a caller-supplied source coordinate.

At the actual pre-child prefix require all of these joins:

1. One original public invocation, selected consumer Program, Run, root B
   ancestry, full A/W and Catalog/View; exact graph, edge, cursor, C-call,
   frame/retry and input-admission causation throughout the preparation chain.
2. The source is a completed C1 **root** GraphCall with its exact task, or the
   C3 reducer within a fully completed aggregate child with its complete
   ordered branch/output/reducer lineage. Reject C1 reducer, partial/sibling
   branches, C3 root in place of its reducer and other producers.
3. Exact successful result admission, `advance` judgment, terminal/child
   closure and `graph_call_closed`, followed by authenticated parent workflow
   foldback/result/judgment. The enclosing Run may still be open. Rehydrate
   the actual source child B; do not require the builtin standalone Program
   identity when the admitted enclosing Program is the consumer's.
4. The carried source is that exact result. Match its internal construction
   ref/digest/value separately from its enclosing ABG result identity. Match
   source targets, receipts, ordered O1s and current protected observations;
   completed history alone does not establish current source bytes.
5. Reconstruct the target task from the bound preparation input and compare it
   canonically with the C2 child input and selected occurrence. The actual
   root grant, A/W and every independently exact owner remain unchanged.

Derive the existing source-result basis shape internally at this exact cut;
keep the public closed-Run derivation unchanged. No new public source token or
child invocation is needed. Existing B/input/route/foldback events retain all
preimages. The child B admission event identifies the derivation cut, so later
replay reconstructs its source replay ref/digest there instead of substituting
a later Run replay. C2 basis admission rejects before launch/archive creation,
source snapshot reads or Worker dispatch. The existing leaf-admission seam
rechecks this exact child basis/task/source and current O1 before dispatch;
root-only validation cannot authorize a bypassing child path.

Publish an ordinary `graph_call` child closure for C2 and its existing
`abg.child_closure_contract` declaration, as C1 already does. Preserve C2's
standalone `run` closure. The consumer root alone closes this Run. The later
C3 aggregate requires the analogous declared child closure; its reducer's
existing identity, complete-vector gate and serial suppression remain intact.

## 5. Failure and decisive proof

C1/C0 failure, unadmitted physical publication, rejected/blocked foldback,
invalid retention or preparation, or a stale/crossed source suppresses C2.
Preserve the first causal diagnostic and every admitted effect/result; no
rollback or successful successor is inferred. C2 failure retains completed C1
and follows the declared parent failure/blocked route. Only an authored retry
may retry; this design selects no retry or concurrency expansion. Root closure
requires the declared final result and judgment, never a child terminal alone.

| Required case | Decisive evidence |
|---|---|
| Installed consumer positive | Consumer-owned Program and root GF, actual generic start, distinct consumer/ABI installs, one invocation/Run, both authored F_D stages and exact C1/C0/C2 lineage. Two different configurations exclude identity-selected fixture behavior. |
| Raw retention positive | Serialize the independently authored Program and its exact E/S/T declarations, discard native constructor/type state, and raw-admit/validate through the installed Validator. The source-derived tuple passes static validation and exact owner admission before any dispatch; the installed witness reaches the same bound input. |
| Same-valueKind crossed target | In that raw publication substitute a distinct otherwise valid target contract T′ with the same valueKind, update the target node/edge refs and recompute their normal identities so ordinary wire equality holds. Raw Validator refuses the unknown/crossed E/S/T′ tuple before dispatch, without relying on a concrete value failing later. |
| Retention/type boundary | Original entry preserved byte-for-byte; exact child A/B unchanged; bound route/raw input reconstructs from its causes. Missing/narrowed binding, wrong contract, altered entry/source, copied route/admission or ambiguous source refuses before the dependent leaf. |
| Open parent source | C1 child closes and folds before C2; root Run remains open. Exact prepared task and source basis rehydrate at the same cut. Wrong producer, missing closure/judgment, sibling/retry/crossed W/B/invocation or stale O1 refuses before C2 effects. |
| Owner and authority controls | Wrong/duplicate Program/GF/implementation install, dependency/publication/module/contract/subset crossing, wrong start/invoke grant, or installed-root target refuses at the owning pre-effect gate. |
| Failure conservation | C1/C0 failure suppresses C2; C2 failure retains C1; typed source-bound failed replay remains valid; append refusal retains physical facts and exact durable prefix. |
| Fresh final reads | Actual admitted command/probe outcomes, one root terminal, fresh installed run_result/run_replay equality and complete before/after install equality. No host execution of generated code. |
| Conservation | Existing standalone closed-Run C2 remains valid; historical C0 correction/prompt/executable controls remain true. Later serial C3 proof uses the same bind after complete aggregate/reducer closure, without current C3 execution credit. |

Use the R2 installed producer/resource path and one independently owned
consumer publication, with source unavailable at execution. Deterministic
binding/source/owner negatives precede a separately selected real live scout.
A builtin-only Program, host-created post-C1 task, synthetic event/receipt,
private import, current source fallback or only model-free leaf calls does not
establish the installed one-start outcome. No all-scenario campaign is implied.

## Owning amendments and small realization frontier

| Owner | Required amendment / existing source seam |
|---|---|
| C0 HOW root-authority and Owner Effect | Separate Program/GF/implementation installs, complete protected-install set and exact root start/invoke grant. Preserve the accepted B04 failure and guarded internal writer laws. `product/worksite_effect.ts`, `implementation/worksite_file_replace.ts` and existing ABG authority joins. |
| C1 HOW Decision/root authority | Preserve standalone C1; allow its existing root as a child under the consumer Program and actual root grant. No C1 task/result redesign. `product/worksite_construction.ts` guards and existing child closure. |
| C2 HOW §3, root authority and realization boundary | Add the two pure preparation leaves/contracts, typed source retention, child closure, same-Run source gate and actual root grant. Existing task/observation/helper carriers stay unchanged. `product/worksite_preparation_contracts.ts` (the bounded declaration/schema source shared with typed construction and raw Validator), `product/worksite_command_execution.ts`, `product/builtin_semantics.ts`, `gtl/worksite_command_execution.ts`, `implementation/worksite_command_execution.ts` and normal exports/publication assembly. |
| C3 HOW §8/§9 | Separate standalone from enclosing-Run source use; retain complete aggregate/reducer closure. Reconcile its stale C1-reducer sentence with the already accepted C2 C1-root law. The same input/preparation relation flattens original targets in declared order. |
| GTL/Validator/HoG typed edge | `gtl/contracts.ts`, `gtl/graph_applications.ts`, canonical/raw admission and `validator/validation.ts`; `gtl/source_path.ts`, `hog/traversal.ts`, `hog/graph_execute.ts` and workflow completion. Preserve ordinary compose and every workflow.C A/B. The fixed edge relation is the only new binding form. |
| ABG binding/causation | `abg/traversal_route.ts` and its cursor/transition joins, the existing event-store payload arm and replay/rehydration; `abg/invocation_admission.ts`, `abg/execution_basis.ts`, child lifecycle and existing leaf-admission seam. One subordinate boundInput, no new event or ref family. |
| Installed owner reuse | `product/declaration_closure.ts`, `product/execution_resolution.ts`, `implementation/leaf_invocation_port.ts` supply exact owners and dynamic modules. Join the source-derived E/S/T declarations and preparation definitions to their exact contract/publication/install owners before dispatch; reuse their selected closure rather than introduce a resolver. |
| Proof | Existing installed start/child/fresh-read support plus one focused single-start consumer case and directly affected carrier/binding negatives. Main-tenant build stays untouched; exact successor packaging is coordinated after accepted source. |

These are proposed HOW/source frontiers, not a code grant. No Product WHAT
change or unresolved structural decision remains in this bounded candidate.
Material declaration/basis/install/AW/effect/capability/proof-scope changes
invalidate affected conclusions. Executive owns acceptance and any next
activation; this Writer's design grant exhausts on its frozen return.

## D2-Only Preparation Tuple

The [D2 HOW](T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md#d2-narrow-repair-and-retained-snapshot-dependencies)
and [C2 addendum](T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md#12-d2-only-mixed-source-snapshot-arm)
add the exact E_D/S/T_D schema tuple to the existing owner-declared preparation
source. The graph-edge relation remains retain_graph_input with its exact
four-field bound value, ordinary E/S/T declaration/owner checks, same admitted
entry and actual source result, and existing route causation/replay.
There is no new binding kind, fan-in, ambient context store or C generator.

The source workflow remains unchanged C1 Task -> ConstructionResult over only
the admitted selected writes. Two separately declared pure D2 preparation
bindings project that task and then construct the distinct dependency-aware C2
task from the bound pair. Dependencies are retained inside the exact E_D entry;
they are not additional C1 outputs or inputs collected by a controller.
The D2 C2 child has its own exact task/observation, raw acknowledgment, judgment
and graph_call closure declarations; raw F_P result and constructive output
contracts remain distinct. Existing old root/child closure and all C1/C3
preparation/public invocation contracts remain unchanged.

Use the existing ABG route/source projection owner for both schema tuples.
The D2 case additionally authenticates revision and dependency origins and
reconstructs the D2 C2 input with the same pure derivation used at bridge,
admission, dispatch and replay. The parent Run alone closes; a failed C1 or
invalidated dependency suppresses C2. No new event, fluent, source-result
Public token or private lifecycle controller is added.

## Generic fixed pair for bounded consumer continuation

The existing retain_graph_input relation also admits one ABI-owned structural
contract, `contract://abiogenesis/worksite/retained-graph-input@5`: exactly
`{kind:"retained_graph_input",schemaVersion:"5.0.0",entry,source}`. Entry and
source are JSON records, preserving the enclosing graph entry and successful
workflow result without rewriting either. This contract belongs to the existing
ABI command-execution publication. The three preparation tuples above retain
their exact declaration and interpretation.

Existing E/S binding refs, graph endpoints and environment carries select the
actual source and target. Static validation requires the fixed T declaration;
installed resolution authenticates its ABI publication/install, exact E/S
owners and the enclosing consumer's entry, target and semantics owner. T does
not assert a particular consumer's E/S subtypes: the dependent pure consumer
must narrow both and their relationship before an actor or effect is selected.
There is no consumer-authored shape metadata or additional contract inventory.

ABG constructs the pair only after the existing successful Result, advancing
judgment and closed-child foldback. Cold projection uses the actual entry basis,
source cursor input digest, child basis/output contract, result/judgment and
closure/causation. It must not infer fields absent from physical c_call_opened.
Altered entry/source, crossed basis/cursor/contract, missing or ambiguous proof
refuses. boundInput remains ordinary RawAdmittedValue; event schemas, profiles,
route identity and invocation resource schemas do not change.

The selected consumer retains E plus the C2 observation once, then its workflow
judgment receives that exact pair and independent assessor output. No second
retention, identity branch, Completion carrier or trailing interpreter is needed.
Qualification covers actual emitted route plus close/reopen readback and the
consumer's narrower two-job/negative component relation, with their different
evidence limits explicit.
