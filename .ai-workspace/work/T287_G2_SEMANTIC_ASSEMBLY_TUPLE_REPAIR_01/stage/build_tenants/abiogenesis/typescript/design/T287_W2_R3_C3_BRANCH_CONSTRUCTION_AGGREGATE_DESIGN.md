<a id="w2-r3-c3-branch-construction-aggregate-design"></a>

# T-287 W2-R3-C3 Branch-Construction Aggregate Design

**Status**: proposed decision-complete bounded child; pending independent
design review

**Design selection**: `W2-R3-C3-D`

**Prospective implementation/evidence**: `W2-R3-C3-I/E`, unselected until
independent design acceptance

**Current method route**:
`repo://abiogenesis/stdo_abiogenesis.json#/constitution/stdo/basis`.
The RC6 migration changes this method header only. Historical accepted bytes
are identified by T-287 and the design index; their acceptance hashes remain
unchanged and are not hashes of this metadata successor. Runtime HOW and the
current Wave 2 `HOLD` remain governed by those surfaces. The opening candidate
status and selection lines retain original authoring history, not current work
authority or a reversal of the recorded semantic acceptance.

**Accepted semantic predecessors**:

- `W2-R3-C0` mutable-worksite causality;
- `W2-R3-C1` live-LLM worksite construction; and
- `W2-R3-C2` worksite command-execution design, exact design SHA-256
  `7f69c4c0c5e027f4025c0f3885042c65a668b4089eb139d278c0cdbc78e4f570`.

The C2 semantic/carrier predecessor is independently accepted at package
artifact SHA-256
`7272967ec7bed96612768b3ae7fe5e34382eca1127ce69a3e69a6fba9c119df1`,
manifest-file SHA-256
`c1dca319e995733db0debc68c7fe176433e7747ebbb6c11d9d3396d0d23fbdbd`,
Product-content digest
`a0236266e8c9d8c6654d33b8767ac4c21b1192c42f45b9bda17d6ae58afa3076`,
and C2-publication digest
`f7cb3acd366932f80881c24f6628f9462f0bf127ee726c2c0fedd7490506493b`.
Its exact source/test SHA-256 values are respectively
`f7516e80684158283f2d94aba3fa074e3d9cd1cdb9f45ef84848a78c72f3f555`
and `6728d025ece92decf0b788d5ec985050dedea2afdd9bf5cbf99c88983fc13faa`;
independent final review returned `GO`, P0/P1/P2 all zero for that bounded
semantic/carrier subject. Later live evidence exposed a P1 in its transport
relay. These coordinates therefore remain predecessor evidence but do not
satisfy the C3 pre-I/E relay gate. The relay-repaired predecessor is
independently accepted at artifact SHA-256
`d5278229916565777e4fd3e0c61d6000825ca944998f765dbf112584f36b3726`,
manifest-file SHA-256
`7f3be93f8a9c05ab60219637dcc2e9d7be073ad558dae2278f4a78410eb7c680`,
Product-content digest
`4c7c8509cb98f04a017ae79d2fe1b5500a9fc61bf8bd8c4883557a4a347bdc61`,
and C2-publication digest
`24336ffee58eedc639df04f8a95d6c5fffbf9207737a9026b0e46dc4d8c494bd`.
Independent review returned `GO`, P0/P1/P2 all zero on that exact subject. The
relay pre-I/E gate is therefore satisfied, but it grants no C3 realization
authority by itself.

## 1. Decision

C3 adds one generic public branch-construction aggregate over the existing C1
GraphFunction. One caller-authored aggregate task carries a non-empty ordered
branch vector. Every branch has a stable `branchRef`, an exact `dependsOn`
set, and one already-valid C1 `WorksiteConstructionTask`. Product admission
validates the complete dependency DAG and derives one exact disjoint target
allocation before any branch opens.

The declared computation is:

```text
WorksiteBranchConstructionTask
  -> F_D(resultBearing: false): validate aggregate authority,
       dependency DAG, and target allocation
  -> WorksiteBranchConstructionVector bind output
  -> workflow.C(worksite-branch-application)
       -> C.batch(
            [workflow.C(existing C1 construction root)],
            batch://abiogenesis/worksite/branch-construction/branches@5,
            { input: branchVector, output: branchOutputVector },
          )
       -> complete authenticated WorksiteBranchConstructionOutputVector
       -> workflow.C(worksite-branch-construction-reducer)
            [sole terminal result]
  -> one flat existing WorksiteConstructionResult
  -> ordinary admitted result, closure, and fresh replay
```

HoG traverses branch children serially in the exact admitted branch order.
The dependency DAG describes readiness and suppression; it does not introduce
a scheduler or require concurrent execution. Each entered branch is one
ordinary C1 child with its own candidate, C0 effects, admitted result, child
closure, and replay-visible lineage. The fan-in reducer runs only after every
branch has one authenticated successful result.

C3 adds no Public operation, event kind, host loop, controller, scheduler,
worker actor, prompt engine, filesystem owner, or downstream domain meaning.
It reuses `run.invoke#invoke`, C1, C0, `workflow.C`, `C.batch`, `fan_out`,
`fan_in`, HoG traversal, ABG admission/events, Event Calculus, closure, and
fresh replay.

## 2. Re-entry And Fixed Truth

The lawful re-entry is:

```text
goal_reprice: select proposed W2-R3-C3-D
  -> design_reframe: decide the bounded aggregate HOW
  -> independent design review
  -> Executive acceptance or return
```

No realization or evidence increment is selected by this design candidate.
Intent, Product meaning, requirements, Public operation families, event-kind
census, feature membership, scenarios, and release subjects remain fixed.
No concrete mismatch was found in Product or requirements.

The material existing laws are:

- Product `A5-F03`, `A5-F04`, `A5-F10`, and bounded `A5-F17` portability;
- `REQ-L-GTL3-C-ALGEBRA-006`, `-007`, `-011`, and `-016`;
- `REQ-L-GTL3-HOF-009..012` pointwise batch, complete-vector, partial-stop,
  fan-in, and runtime-authority law;
- `REQ-L-GTL3-GRAPHFUNCTION-004`, `-006`, `-011`, `-014`, and `-025`;
- `REQ-L-GTL3-SUBWORK-001..004`;
- `REQ-R-ABG3-FN-COMP-001..024`, lineage, event, run, projection, and Program
  traversal requirements;
- `REQ-R-ABG3-SAGA-FRONTIER-001`, `-002`, `-004`, `-005`, `-007`, `-010`,
  `-011`, `-013`, and `-014`, which keep stable branch identity, declared
  topology, serial realization, output visibility, fan-in, and replay with
  their existing owners; and
- the accepted C0/C1/C2 designs without widening their owned relations.

The project reference-frame basis already covers the ABIogenesis, GTL, HoG,
ABG, Proof, and mutable-worksite causal seams. C3 introduces no new frame
family or local realization axiom, so neither the project frame basis nor the
realization constitution requires amendment.

## 3. Public Aggregate Task

Product owns these new closed carrier families:

| Carrier | Closed meaning |
|---|---|
| `WorksiteConstructionBranch` | One stable branch identity, exact dependency refs, Product-derived topological level, and one complete existing C1 task. |
| `WorksiteConstructionTargetAllocation` | Product-derived branch/target attribution projected exactly from the branch's C1 targets; it is not a second caller-authored target list. |
| `WorksiteBranchConstructionTask` | Exact `WorkspaceBinding`, exact sole direct invocation grant, non-empty ordered branch vector, complete derived allocation, and canonical ref/digest. |
| `WorksiteBranchConstructionVector` | Root `F_D` result and branch-application raw input; each member ref is the stable `branchRef` and each member value is the exact C1 task. |
| `WorksiteBranchConstructionOutputVector` | Existing authenticated `gtl_fan_out_vector` shape whose members preserve branch ref, ordinal, output-member ref, and C1 result value; the owning ABG completion admission preserves the exact result, judgment, C-call, and foldback coordinates. |
| `WorksiteConstructionResult` | The existing C1 result contract, produced by deterministic row-major flattening of the complete authenticated branch-result vector. |

The proposed exact contract identities are:

```text
contract://abiogenesis/worksite/branch-construction-task@5
contract://abiogenesis/worksite/branch-construction-vector@5
contract://abiogenesis/worksite/branch-construction-output-vector@5
contract://abiogenesis/worksite/construction-result@5   existing C1 output
```

The exact lifecycle contract identities are:

```text
contract://abiogenesis/worksite/branch-construction-failure@5
contract://abiogenesis/worksite/branch-construction-refusal@5
contract://abiogenesis/worksite/branch-construction-evidence@5
contract://abiogenesis/worksite/branch-construction-judgment@5
contract://abiogenesis/worksite/branch-construction-transition@5
contract://abiogenesis/worksite/branch-construction-closure@5
contract://abiogenesis/worksite/branch-construction/branch-application-child-closure@5
contract://abiogenesis/worksite/branch-construction/branch-application-failure@5
contract://abiogenesis/worksite/branch-construction/reducer-child-closure@5
contract://abiogenesis/worksite/construction-child-closure@5   added to C1 root for nested C3 use
```

The root uses its run closure, evidence, judgment, transition, and failure
contracts. The zero-binding branch application uses its declared pure-child
closure and failure contracts. The reducer uses its child closure and the
common branch-construction failure family. All are ordinary published
declarations under the existing C-call lifecycle; none introduces an event.
The existing C1 root retains
`contract://abiogenesis/worksite/construction-closure@5` under
`abg.closure_contract` with `closureScope: run` for direct invocation. During
C3 I/E it additionally publishes
`contract://abiogenesis/worksite/construction-child-closure@5` and declares it
under `abg.child_closure_contract` with `closureScope: graph_call`, using the
existing C1 root judgment predicate and lifecycle contract family. The two
closure declarations are scope-distinct; neither substitutes for the other.
The new published `ContractDeclaration` is kind `closure` with value kind
`worksite_construction_child_closure`. Its `ClosureContract` uses
`predicate://abiogenesis/worksite/construction-result@5`, the existing C1
evidence/result/refusal/judgment/transition contracts, and exactly
`terminal_reached -> frame_closed -> graph_call_closed`; it cannot publish or
consume `run_closed` at graph-call scope.

The public input shape is conceptually:

```text
WorksiteBranchConstructionTask {
  taskRef
  taskDigest
  workspaceBinding
  capabilityGrant
  branches: [{
    ordinal
    branchRef
    branchDigest
    dependsOn: [branchRef, ...]
    topologicalLevel
    constructionTask: WorksiteConstructionTask
  }, ...]
  targetAllocation: {
    allocationRef
    allocationDigest
    members: [{
      ordinal
      branchOrdinal
      branchRef
      branchTargetOrdinal
      targetRef
      subjectRef
      subjectDigest
      relativePath
      territoryRef
      territoryDigest
      predecessorObservationRef
      predecessorObservationDigest
    }, ...]
  }
}
```

Canonical identity preimages are exact:

```text
branchDigest
  = sha256Canonical({
      ordinal, branchRef, dependsOn, topologicalLevel, constructionTask
    })

allocationDigest
  = sha256Canonical({ members })
allocationRef
  = worksite-branch-target-allocation://abiogenesis/<allocationDigest>

taskDigest
  = sha256Canonical({
      workspaceBinding, capabilityGrant, branches, targetAllocation
    })
taskRef
  = worksite-branch-construction-task://abiogenesis/<taskDigest>

vectorDigest
  = sha256Canonical({
      sourceTaskRef, sourceTaskDigest,
      members: [{ ordinal, memberRef: branchRef, value: constructionTask }]
    })
vectorRef
  = worksite-branch-construction-vector://abiogenesis/<vectorDigest>
```

`<digest>` denotes the lowercase SHA-256 payload without the `sha256:` prefix,
matching existing ABI identity constructors. Every guard recomputes the full
preimage; refs or digests are never trusted independently.

The caller supplies the aggregate `WorkspaceBinding` and grant plus
`branchRef`, `dependsOn`, and the complete C1 task for each branch. Product
stamps ordinal, level, branch digest, allocation rows, allocation identity, and
aggregate identity. No field may override a C1 task, target, prompt, Worker
tuple, territory, observation, grant, or workspace.

`branchRef` is an opaque stable non-empty ref selected by the caller's Product
adapter. It is not generated from array position. The ordered branch vector is
authority: Product does not sort, infer, discover, or repair it. Dependency
refs are a set represented in the exact order of their referenced branch
ordinals, so equal DAGs have one admitted serialization.
`branchRef` is the logical branch identity; ABG graph-call, C-call, scope, and
invocation refs remain execution-instance identities and never replace it.
C3 selects no retry or new attempt carrier.

## 4. Admission And Readiness Law

Task construction and raw invocation admission must prove all of these before
the root `F_D` result is admitted and before any child graph is prepared:

1. The aggregate is a direct construction invocation with
   `sourceResultBasis == null`; the caller cannot use a prior result to replace
   any nested task or predecessor observation.
2. The aggregate task, every branch, and every nested C1 task are closed,
   canonical, and digest-valid.
3. Every nested C1 task carries the same exact `WorkspaceBinding` and
   capability grant as the aggregate and admitted public invocation basis.
4. Branch refs are non-empty and unique. Dependencies are unique, known, and
   never self-referential.
5. The dependency graph is acyclic.
6. The authored order is already topological: every dependency of branch
   ordinal `k` occurs in the strict prefix `[0, k)`. Product never reorders a
   valid task or repairs an invalid one.
7. `topologicalLevel(branch) = 0` for an empty dependency set and otherwise
   `1 + max(topologicalLevel(dependency))`. Product derives the value; a caller
   cannot assert it.
8. Every branch target ref, subject ref/digest, and canonical relative path is
   unique across the whole aggregate. Exact-path duplicates and component-wise
   ancestor/descendant target pairs refuse, because every C1 target is one file.
   Noncanonical lexical aliases are already invalid C1 subjects; physical
   symlink/alias currentness remains the existing C0 owner check. Overlapping
   territory roots do not by themselves overlap targets.
9. The derived allocation is the row-major projection of branch order then C1
   target order. Its rows equal the nested C1 targets byte-for-byte at their
   authority coordinates.
10. Every C1 target remains inside its own C1 territory and carries its exact
    predecessor observation. C3 neither re-observes nor substitutes it.
11. Public invocation-basis validation admits only the exact aggregate task as
    the new C3 entry carrier, with a null source-result basis and exact W. It
    rejects a branch vector or branch output vector as a Public raw input for
    any source basis. Those two carriers may cross only through the existing
    admitted parent-result and child-basis relations inside traversal. Existing
    direct C1 invocation remains unchanged and is not a second C3 aggregate
    API.

These checks establish static topological readiness. Runtime readiness is
then the conjunction of the admitted task law and the existing serial batch
prefix: branch `k` may open only after all earlier entered branches have
returned `advance`. Since every declared dependency is in that prefix, no
branch can open before a dependency succeeds.

The design deliberately does not infer dependencies from prompts, imports,
paths, module names, test names, or filesystem state.

## 5. GTL Publication And Direct HoG Traversal

C3 extends the existing composite worksite-construction module rather than
publishing a second copy of C1. Proposed identities are:

```text
program://abiogenesis/worksite/branch-construction@5
start://abiogenesis/worksite/branch-construction@5
graph-function://abiogenesis/worksite/branch-construction@5
graph-function://abiogenesis/worksite/branch-construction/branch-application@5
graph-function://abiogenesis/worksite/branch-construction/reduce@5
batch://abiogenesis/worksite/branch-construction/branches@5
implementation://abiogenesis/worksite/branch-construction/plan-fd@5
implementation-binding://abiogenesis/worksite/branch-construction/plan-fd@5
implementation://abiogenesis/worksite/branch-construction/reduce-fd@5
implementation-binding://abiogenesis/worksite/branch-construction/reduce-fd@5
```

The two application identities remain the existing content-addressed
`graph-function-application://abiogenesis/<sha256Canonical(body)>` form. Their
canonical bodies are exactly:

```text
fan_out {
  kind: graph_function_application
  relationKind: fan_out
  inputContractRef: contract://abiogenesis/worksite/branch-construction-vector@5
  outputContractRef: contract://abiogenesis/worksite/branch-construction-output-vector@5
  batchRef: batch://abiogenesis/worksite/branch-construction/branches@5
  elementGraphFunctionRef: graph-function://abiogenesis/worksite/construction@5
  inputVectorRef: contract://abiogenesis/worksite/branch-construction-vector@5
  outputVectorRef: contract://abiogenesis/worksite/branch-construction-output-vector@5
  inputMemberContractRef: contract://abiogenesis/worksite/construction-task@5
  outputMemberContractRef: contract://abiogenesis/worksite/construction-result@5
}
fan_in {
  kind: graph_function_application
  relationKind: fan_in
  inputContractRef: contract://abiogenesis/worksite/branch-construction-output-vector@5
  outputContractRef: contract://abiogenesis/worksite/construction-result@5
  reducerGraphFunctionRef: graph-function://abiogenesis/worksite/branch-construction/reduce@5
  inputVectorRef: contract://abiogenesis/worksite/branch-construction-output-vector@5
}
```

Those exact bodies produce:

```text
fan_out applicationRef:
  graph-function-application://abiogenesis/b879a5519b642b358d3116fb46ec04a7f99806c2bad82923197c2a530c0817bf
fan_in applicationRef:
  graph-function-application://abiogenesis/b1251894aef3bb60ea93e9a98ef5d317d9517a00dbb5833ece4bc65d24473dd7
```

The existing C1 module ref, C1 Program identity, C0 GraphFunction, contracts,
and implementation bindings remain exact. The containing module publication
gains the C3 Program and three C3 GraphFunctions. The C3 Program's callable
membership is exactly the three C3 functions plus the four existing C1
callable functions required by nested traversal. Catalog contributions are
unique; C1 is not copied into another module or admitted under a second handle.
The one existing contribution for each reused C1/C0 handle gains the C3
Program membership alongside its retained memberships. A second contribution
for any reused handle is forbidden.

One bounded reused-definition delta is mandatory: the existing C1 root
GraphFunction gains its graph-call-scoped `abg.child_closure_contract`, and the
singular publication gains the matching published contract declaration and
closure contract. That declaration changes the canonical C1 root
GraphFunction bytes/digest and the containing ModulePublication digest. It
does not change the C1 ref, Program identity, direct-input/output meaning,
implementation rows, effects, or run-scoped closure. The new exact digests are
I/E outputs and must be frozen from the realized subject; this design does not
invent them.

The new binding census is `1/0/1`:

| New GraphFunction | Local leaf rows | Meaning |
|---|---:|---|
| branch-construction root | `1` | `F_D` aggregate validation and exact branch-vector construction |
| branch application | `0` | pure `C.batch` plus `workflow.C`; declared pure-child failure contract |
| branch reducer | `1` | `F_D` complete-vector authentication and deterministic flattening |

The root term is:

```text
C.compose(
  C.of({
    fibre: "F_D",
    stageRole: "aggregate_authority_and_readiness",
    input: task,
    output: branchVector,
    resultBearing: false,
  }),
  workflow.C(worksite-branch-application),
)
```

The branch-application term is:

```text
C.compose(
  C.batch(
    [workflow.C(existing worksite-construction root)],
    batch://abiogenesis/worksite/branch-construction/branches@5,
    { input: branchVector, output: branchOutputVector },
  ),
  workflow.C(worksite-branch-construction-reducer),
)
```

Here `task: WorksiteBranchConstructionTask`,
`branchVector: WorksiteBranchConstructionVector`, and
`branchOutputVector: WorksiteBranchConstructionOutputVector` are the exact
outer carrier values; the two outer carriers are not inferred from the
application declarations.

The reducer term is:

```text
C.of({
  fibre: "F_D",
  stageRole: "reducer",
  input: branchOutputVector,
  output: result,
  resultBearing: true,
})
```

Its `fan_out` application binds the branch vector and existing C1 task/result
contracts. Its `fan_in` application binds the complete branch output vector to
the new reducer. The branch-application child has an explicit published
failure contract because it has zero local bindings. Existing workflow-child
materialization, Program validation, child-basis admission, C-call lifecycle,
fan-out completion admission, and foldback are reused unchanged.

The root planning `F_D` row is explicitly `resultBearing: false`. Let `J` be
its admitted branch-vector bind output. The workflow parent opens with
`J.resultRef` and `J.valueDigest`; pure child graph materialization and
validation consume `J.value` unchanged; and child-basis admission requires
exact equality of raw-input ref, digest, and canonical value before the branch
scope opens. No adapter, reconstruction, or filesystem read may occur between
`J` and branch-application materialization. The existing
`workflow-selected-input-mismatch`, `parent_basis_mismatch`, and
`child_input_mismatch` refusal owners remain unchanged.

The branch reducer is the sole authored `resultBearing: true` terminal locus
of the C3 aggregate. Its admitted flat `WorksiteConstructionResult` folds
through the terminal branch-application workflow and supplies the root's one
outer result. Marking the planning row result-bearing would combine it with the
terminal workflow result, derive cardinality `many`, and fail Program
validation.

Before an outer batch member may fold back, `workflow.C(existing C1 root)`
must resolve the C1 root's published graph-call child-closure contract. C3 I/E
therefore adds the exact C1 root declaration and publication row named above;
a missing, run-scoped-only, unpublished, crossed, or wrong-predicate child
closure refuses nested C1 closure and cannot be inferred from the direct C1
run closure.

The root declares only the existing
`effect://abiogenesis/worksite/file.replace/v1`. The branch-application and
reducer GraphFunctions each declare `effects: []`. Every physical Product
effect still occurs inside an existing C1 -> C0 child; no C3 implementation
binding becomes an effect owner.

### 5.1 Foundation And Reuse Disposition

The frame-independent capability is: validate one immutable finite dependency
DAG, traverse its already-topologically-ordered homogeneous task vector, retain
an exact partial prefix, and reduce only a complete authenticated result
vector. Existing ABI foundations already supply every generic execution
mechanic:

| Candidate | Disposition |
|---|---|
| Existing `workflow.C` + `C.batch` + `fan_out`/`fan_in` + HoG/ABG completion/replay | Selected. It already owns homogeneous serial traversal, member lineage, complete-vector authentication, partial-stop truth, and replay. |
| Product-local immutable DAG validation plus flat-result reduction | Selected irreducible remainder. Dependency and target-allocation meaning belong to the task Product; the reducer preserves the existing result contract. |
| odd_glc or Public host loop over repeated C1 calls | Rejected. It moves declared topology and partial-stop authority outside the GTL Program and cannot produce one aggregate admitted result. |
| New scheduler, queue, DAG engine, or workflow library | Rejected. C3 requires no concurrency, work stealing, retry, persistence, or scheduling capability beyond the existing serial batch; another runtime would duplicate HoG/ABG authority and add package/proof cost. |
| Scenario-specific static five- or nine-branch GraphFunctions | Rejected. They copy downstream topology into ABI and do not provide the generic carrier. |

The local addition is therefore limited to Product-owned carrier validation,
one pure branch-vector projection, one pure flat reducer, and their GTL
declarations. It does not reproduce generic traversal mechanics.

## 6. Branch Execution And Partial Failure

The batch is serial and prefix-preserving. For branch ordinal `k`:

1. HoG selects the exact materialized member whose `memberRef == branchRef` and
   whose value is the admitted nested C1 task.
2. `workflow.C` enters the existing C1 root through its ordinary child basis.
3. C1 validates its raw Worker result, admits its candidate and authority
   join, traverses its own ordered C0 target batch, and admits its reducer
   result exactly as before.
4. ABG admits and folds back that C1 result under the aggregate batch member.
5. Only then may HoG advance to ordinal `k + 1`.

Each successful branch therefore has an independently admitted C1 result and
closed child scope. The aggregate is not a multi-file, branch-level, or DAG-
level transaction. Every C0 file replacement retains its own atomicity and
residue law.

If branch `k` blocks or fails:

- successful branches `[0, k)` remain admitted and replayable;
- the stopping row records branch `k` and its exact C-call/judgment evidence;
- branches `(k, n)` remain unstarted under the existing `partial_stop` fan-out
  completion;
- every direct or transitive dependent of branch `k` is therefore suppressed;
- an independent branch in the suffix is truthfully `serially_unstarted`, not
  falsely described as dependency-suppressed;
- the fan-in reducer never opens;
- no aggregate `WorksiteConstructionResult` is admitted;
- no C2 source-result basis may be derived from the failed aggregate; and
- no rollback, compensation, retry, branch skipping, or host resumption is
  inferred.

If C1 fails after admitting a prefix of its own C0 target batch, replay retains
both nested truths: the inner C1 target prefix and the outer C3 completed-branch
prefix. C3 does not collapse them into one success or one undifferentiated
failure.

Dependency-suppression and independent-unstarted projections are pure reads
over the exact admitted aggregate task plus existing fan-out partial-stop
rows. They add no event kind or runtime authority.

## 7. Deterministic Fan-In And Flat Result

The branch output vector uses the existing authenticated fan-out result shape:

```text
{
  kind: "gtl_fan_out_vector"
  schemaVersion: "5.0.0"
  applicationRef: <exact C3 branch fan-out application>
  members: [{
    ordinal
    inputMemberRef: <exact branchRef>
    outputMemberRef
    value: WorksiteConstructionResult
  }, ...]
}
```

Existing ABG fan-out completion law proves exact source-vector basis,
cardinality, order, input-member ref/digest, child C-call result ref/digest,
judgment, foldback, application, and complete-vector identity. The reducer is
reachable only through the matching admitted `fan_in` relation. A caller-held
lookalike vector has no authority to invoke the reducer as aggregate truth.

The reducer additionally validates:

- exact C3 application identity and zero-based member order;
- unique branch input refs and output refs;
- one valid existing C1 `WorksiteConstructionResult` per member; and
- global uniqueness of nested C0 input refs, output refs, and successor subject
  refs across all branch results.

It then performs row-major flattening by branch ordinal and nested C1 member
ordinal. It reassigns only the outer flat ordinal and preserves every nested
input-member ref, output-member ref, receipt, and successor observation. The
flat value stamps the exact existing C1
`WORKSITE_CONSTRUCTION_IDS.fanOutApplicationRef`, because every retained member
was admitted from that one shared C1 fan-out declaration. The C3 fan-out
application and branch instances remain separately explicit in ABG lineage;
the flat value does not pretend they are one C1 application instance. With
that exact existing `sourceApplicationRef`, canonical body, digest, and ref
law, the value satisfies the existing
`contract://abiogenesis/worksite/construction-result@5` without an adapter or
second result family.

The reducer does not inspect files, prompts, dependency meaning, or downstream
success. ABG-authenticated fan-out lineage preserves branch attribution;
fresh replay retains the complete branch vector even though the C2-facing
value is intentionally flat.

## 8. C2 Source Join

In the original standalone path, C2 is a separate public invocation. Its task carries the exact flat
construction result. Its public invocation carries the ordinary non-null
owner-derived `ProductInvocationSourceResultBasis` from the completed C3 run.
The C3 and C2 invocations use one shared admitted `CatalogView`: its allowlist
contains the complete C3/C1/C0 declaration closure and the C2 publication and
GraphFunction handle. `deriveInvocationSourceResultBasisAtPrefix` therefore
preserves the exact source `catalogViewDigest`; a target-only second view may
not replace it.

The Product semantics source check must accept C3 only when:

```text
sourceGraphFunctionRef
  == graph-function://abiogenesis/worksite/branch-construction/reduce@5
sourceResultContractRef
  == contract://abiogenesis/worksite/construction-result@5
sourceResultValue
  == exact flat result carried by the C2 task
sourceResultValueDigest
  == canonical digest of that exact value
source W / binding / run / graph-call / C-call / result admission /
judgment / replay coordinates
  == the owner-derived completed C3 chain
```

The direct-C1 path selects the exact C1 root GraphFunction, as required by
the accepted C2 source law. C2 must reject the C3 root ref, branch-application
ref, C1 reducer ref, any other result-producing child, a partial-stop prefix, or a
caller-authored source coordinate. This is a closed explicit source-function
set, not ambient inference.

For the selected enclosing-Run form, [the accepted single-start HOW](T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md) preserves the original entry A/W, root grant and declared command
configuration through the fixed branch retention/preparation relation. C2
receives the flattened original targets in declared branch/target order and
an ABG-derived same-Run source only after the complete aggregate and exact
reducer have closed and folded back. Partial branch history cannot authorize
C2. This source support does not claim a current C3 execution witness.

## 9. Replay And Closure

Standalone execution uses the existing run lifecycle. When selected as a
consumer child, the aggregate instead uses its declared `graph_call` child
closure; its reducer closure stays unchanged and the enclosing consumer root
alone closes the Run. Program, GraphFunction and implementation installations
remain independently exact, with full A/W and the original root grant. The
standalone trace is:

```text
public run.invoke#invoke
  -> aggregate invocation and basis admission
  -> root F_D result admission
  -> branch-application child basis and scope
  -> ordered C1 child bases/scopes/results/foldbacks
  -> fan_out_completion_admitted(complete_vector)
  -> reducer child basis/result/foldback
  -> root result and judgment
  -> one run_closed
  -> PublicRunProjectionAuthority
  -> fresh project.read / replay equality
```

Replay must expose the same aggregate input, branch-vector identity, per-branch
C1 results, fan-out completion, flat reducer result, root terminal result, and
projection authority without process-local state. Failure replay exposes the
exact completed prefix, stopping row, unstarted rows, and nested C1 partial
truth where applicable, with no flat result.

No new event kind is selected. Existing invocation, basis, graph-call, C-call,
fan-out completion, judgment, foldback, closure, and replay carriers own the
runtime truth.

## 10. Prospective Realization Boundary

Only after independent design acceptance and Executive selection may
`W2-R3-C3-I/E` change. The exact relay-repaired C2 predecessor gate is already
satisfied by the accepted coordinates in the header.

- new `code/src/product/worksite_branch_construction.ts` for the aggregate
  task, allocation, branch vector, output-vector guard, and flat reducer;
- new `code/src/gtl/worksite_branch_construction.ts` for the three C3
  GraphFunction parts, composed by the existing
  `code/src/gtl/worksite_construction.ts` publication constructor into its
  singular ModulePublication; no second worksite ModulePublication is admitted;
- new `code/src/implementation/worksite_branch_construction.ts` for the two
  `F_D` bindings;
- existing Product/GTL/implementation indexes and the C1 composite
  publication only to add the C3 Program, exact callable membership,
  contracts, bindings, and unique contributions, and to add the exact
  graph-call-scoped C1 root child-closure declaration and published contract;
  this changes the C1 root GraphFunction and containing publication digests as
  bounded above;
- existing `code/src/product/builtin_semantics.ts` only to admit the exact C3
  direct task basis and the explicit C3 reducer source GraphFunction for C2;
- `scripts/generate-product-manifest.mjs` and the generated Product manifest
  only for the exact added publication/export relations; and
- one focused deterministic installed lane at
  `test_env/tests/t287-worksite-branch-construction.test.mjs` plus exact
  affected regressions. The evidence set must include a direct C1 regression
  proving its retained run-scoped result/closure/replay and nested C3 proof
  proving the new C1 graph-call child closure before branch foldback.

No change is selected now. A later coding plan must name exact paths and prove
the shared publication shape before mutation. No edit is permitted to Public
operation definitions, event-kind census, C0/C1/C2 carrier meaning, worker
transport, odd_glc, Product, requirements, or release/version surfaces.

## 11. Exact Proof Fixtures

The downstream fixture is evidence input only, not ABI Product authority:

```text
/Users/jim/src/apps/odd_glc/
  build_tenants/odd_glc/typescript/test/fixtures/
  generic-workflow-scenarios.json
sha256:97c776e184610bfbbf60b65738defa0c3835ddf786c95041154361e5cc80682f
```

### 11.1 Parallel JS

The neutral installed proof projects these exact five branch refs and six
disjoint target paths into five ordinary C1 tasks:

| Ordinal | Branch ref | Depends on | Paths |
|---:|---|---|---|
| 0 | `territory://odd-glc/parallel-js/package` | none | `package.json` |
| 1 | `territory://odd-glc/parallel-js/hello-branch` | package | `src/hello.mjs` |
| 2 | `territory://odd-glc/parallel-js/world-branch` | package | `src/world.mjs` |
| 3 | `territory://odd-glc/parallel-js/fan-in` | hello-branch, world-branch | `src/index.mjs` |
| 4 | `territory://odd-glc/parallel-js/proof` | fan-in | `test/component/parallel-branches.test.mjs`, `test/uat/parallel-fanin.uat.test.mjs` |

The fixture has five dependency edges and four derived topological levels.
The evidence proves stable serial traversal `0..4`, not concurrent execution.

### 11.2 Data Mapper Full

The neutral installed proof projects these exact nine branch refs, 22 unique
target paths, 21 declared dependency edges, and four derived levels:

| Ordinal | Branch ref | Targets | Depends on |
|---:|---|---:|---|
| 0 | `territory://odd-glc/data-mapper-full/config` | 3 | none |
| 1 | `territory://odd-glc/data-mapper-full/cdme-core` | 2 | config |
| 2 | `territory://odd-glc/data-mapper-full/cdme-compiler` | 3 | config, cdme-core |
| 3 | `territory://odd-glc/data-mapper-full/cdme-executor` | 3 | config, cdme-core |
| 4 | `territory://odd-glc/data-mapper-full/cdme-adjoint` | 2 | config, cdme-core |
| 5 | `territory://odd-glc/data-mapper-full/cdme-accounting` | 2 | config, cdme-core |
| 6 | `territory://odd-glc/data-mapper-full/cdme-assurance` | 2 | config, cdme-core |
| 7 | `territory://odd-glc/data-mapper-full/cdme-fidelity` | 2 | config, cdme-core |
| 8 | `territory://odd-glc/data-mapper-full/cdme-engine` | 3 | config, cdme-core, and all six module branches |

The four levels are exactly:

```text
0: config
1: cdme-core
2: cdme-compiler, cdme-executor, cdme-adjoint,
   cdme-accounting, cdme-assurance, cdme-fidelity
3: cdme-engine
```

The exact row-major 22-path vector is:

```text
config:
  build_tenants/scala_spark/build.sbt
  build_tenants/scala_spark/project/plugins.sbt
  build_tenants/scala_spark/project/build.properties
cdme-core:
  build_tenants/scala_spark/cdme-core/src/main/scala/com/cdme/core/package.scala
  build_tenants/scala_spark/cdme-core/src/test/scala/com/cdme/core/CoreContractsSpec.scala
cdme-compiler:
  build_tenants/scala_spark/cdme-compiler/src/main/scala/com/cdme/compiler/TopologyCompiler.scala
  build_tenants/scala_spark/cdme-compiler/src/main/scala/com/cdme/compiler/package.scala
  build_tenants/scala_spark/cdme-compiler/src/test/scala/com/cdme/compiler/TopologyCompilerSpec.scala
cdme-executor:
  build_tenants/scala_spark/cdme-executor/src/main/scala/com/cdme/executor/DataFrameExecutor.scala
  build_tenants/scala_spark/cdme-executor/src/main/scala/com/cdme/executor/ErrorSink.scala
  build_tenants/scala_spark/cdme-executor/src/test/scala/com/cdme/executor/DataFrameExecutorSpec.scala
cdme-adjoint:
  build_tenants/scala_spark/cdme-adjoint/src/main/scala/com/cdme/adjoint/AdjointRegistry.scala
  build_tenants/scala_spark/cdme-adjoint/src/test/scala/com/cdme/adjoint/AdjointRegistrySpec.scala
cdme-accounting:
  build_tenants/scala_spark/cdme-accounting/src/main/scala/com/cdme/accounting/AccountingVerifier.scala
  build_tenants/scala_spark/cdme-accounting/src/test/scala/com/cdme/accounting/AccountingVerifierSpec.scala
cdme-assurance:
  build_tenants/scala_spark/cdme-assurance/src/main/scala/com/cdme/assurance/AssuranceService.scala
  build_tenants/scala_spark/cdme-assurance/src/test/scala/com/cdme/assurance/AssuranceServiceSpec.scala
cdme-fidelity:
  build_tenants/scala_spark/cdme-fidelity/src/main/scala/com/cdme/fidelity/FidelityService.scala
  build_tenants/scala_spark/cdme-fidelity/src/test/scala/com/cdme/fidelity/FidelityServiceSpec.scala
cdme-engine:
  build_tenants/scala_spark/cdme-engine/src/main/scala/com/cdme/engine/CdmeEngineImpl.scala
  build_tenants/scala_spark/cdme-engine/src/main/scala/com/cdme/engine/CdmeEngineRunner.scala
  build_tenants/scala_spark/cdme-engine/src/test/scala/com/cdme/engine/CdmeEngineIntegrationSpec.scala
```

The test must assert these exact strings, not only their count. ABI fixture
code may use neutral aliases while the installed downstream adapter proves the
exact projection; ABI runtime code contains no Data Mapper, Scala, SBT, or
odd_glc branch names.

### 11.3 Positive Evidence

The focused installed lane must prove without a live model:

1. task construction derives exact refs/digests, branch levels, allocation,
   counts, and stable member order for both fixtures;
2. one public aggregate invocation and its later C2 consumer use one shared
   CatalogView containing the exact C3, reused C1/C0, and C2 handles;
3. HoG enters exactly five and nine C1 children respectively, serially and in
   task order, with each child receiving its exact nested C1 task;
4. every branch has an independently admitted C1 result and closure;
5. complete fan-out authentication precedes the reducer;
6. the flat result has exactly six and 22 members respectively, in row-major
   branch/target order, with unmodified receipts and O1 values;
7. one `run_closed`, Public result, Public projection authority, and fresh
   replay are canonically equal;
8. a C2 task accepts the Data Mapper flat result only from the exact C3 reducer
   source basis; and
9. no host loop, new Public branch, private event writer, model call, or
   process-local runtime authority participates.

### 11.4 Negative Evidence

The focused lane must refuse:

- empty branches; duplicate/blank branch refs; duplicate, unknown, self, or
  reordered dependency refs; a cycle; and an authored order that is not
  topologically ready;
- a caller-authored or wrong topological level, allocation row, allocation
  digest, branch digest, task digest, workspace, or grant;
- duplicate target refs, subject refs, equal paths, or path-component ancestor
  targets across branches, and any allocation row whose territory or
  predecessor observation is crossed from another target;
- malformed C1 tasks or a branch vector whose count, order, member ref, value,
  source task, or digest differs from the admitted aggregate;
- any Public direct attempt to invoke the branch application or reducer with a
  caller-authored branch vector/output vector, even when its local ref and
  digest are internally self-consistent;
- fan-in over a missing, partial, reordered, duplicate, crossed-application,
  wrong-contract, or caller-fabricated output vector;
- a nested C1 result with crossed receipt/O1, duplicate global member identity,
  or invalid canonical result identity;
- C2 source basis naming any GraphFunction other than the exact C1 root for
  direct C1 or exact C3 reducer for aggregate C3;
- C2 source ref/digest/value/W/replay coordinates crossed from another run;
  and
- fresh replay with a missing/duplicate branch result, reducer result, or
  `run_closed` event.

One failure fixture must stop a middle branch. It asserts the exact successful
prefix, stopping row, all unstarted rows, transitive dependent suppression,
independent suffix classification, absent reducer call, absent flat result,
and absent C2 source basis. A second fixture must fail inside a multi-target
C1 branch after a C0 prefix and prove both nested partial prefixes survive.

## 12. Falsifiers And Nonclaims

C3 is falsified if:

- ABI discovers branches, dependencies, targets, or order from prompts,
  imports, directories, or model output;
- branch order is sorted, repaired, or chosen by HoG, ABG, Public, or a host;
- a branch opens before all declared dependencies occur in its successful
  prefix;
- C1 is copied, inlined, widened, or reached outside `workflow.C`;
- C1 or C0 results cross without ordinary child result admission and foldback;
- nested C1 closes or folds back without resolving its exact published
  graph-call-scoped `abg.child_closure_contract`, or direct C1 is made to use
  that contract in place of its retained run closure;
- a partial vector reaches fan-in or becomes a flat construction result;
- completed effects are rolled back or aggregate success is claimed after a
  partial stop;
- independent suffix branches are mislabeled as dependency failures;
- the reducer reads the worksite or recreates target/dependency authority;
- the flat result changes receipt, O1, input-member, or output-member identity;
- C2 accepts the aggregate root, branch application, or an inferred producer
  instead of the exact C3 reducer source GraphFunction;
- a second C1 publication, Catalog handle, controller, scheduler, public
  operation, event kind, runtime, or host orchestration loop appears; or
- `parallel-js` is reported as concurrent execution rather than a declared
  dependency shape traversed serially.

C3 does not select parallel execution, branch retry, branch skipping,
compensation, multi-file atomicity, continuation/reentry, a standalone
`run.invoke#start` campaign, pre-binding admission, Product install/resolve/verify, Catalog/View admission,
odd_glc semantics, downstream validation, C2 repair, live model evidence,
version allocation, qualification, RC, tap, or release.

## 13. Stop And Review Return

The Design Worker stops after this design, GOALS/T-287/design-index selection,
source/count checks, and exact digest production. No code, test, manifest,
odd_glc, C2, version, Git staging, commit, tag, push, or live-model effect is
authorized.

Independent review must return separate design and constructability verdicts.
Implementation remains unselected until:

1. this exact C3 design subject is independently accepted;
2. the Executive selects an exact `W2-R3-C3-I/E` mutation/evidence surface.

The accepted C2 semantic/carrier coordinates in the header identify the
predecessor that exposed the bounded relay defect. The separately listed
relay-repaired coordinates are the independently accepted current predecessor;
they close the relay gate but grant no C3 realization authority by themselves.
