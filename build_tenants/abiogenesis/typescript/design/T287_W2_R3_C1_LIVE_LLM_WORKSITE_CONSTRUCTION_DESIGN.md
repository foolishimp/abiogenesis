<a id="w2-r3-c1-live-llm-worksite-construction-design"></a>

# T-287 W2-R3-C1 Live-LLM Worksite Construction Design

**Status**: Accepted bounded C1 text-output design amendment

**Design candidate**: `C1-TEXT-OUTPUT-D`

**Work and evidence selection**:
[T-287 current C1 selection](../../../../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#c1-text-output-current-activation)

**Change route**: bounded `design_reframe`; the linked T-287 selection owns
current operation grants

**Reframed predecessor**:
[`T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md`](./T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md)

The accepted C1 worksite-root relation, topology, pure-child failure law,
static publication, and downstream return remain conserved. This amendment
changes only the raw replacement representation, its deterministic wrapping,
and the response-schema claim identified by `W2-BL-C1-P3`.

## Decision

C1 composes the existing ABIogenesis surfaces into one generic construction
Program:

```text
exact caller-authored WorksiteConstructionTask carrying A + W
  -> F_P: one governed live worker dispatch
  -> validate raw WorksiteConstructionWorkerResult
  -> deterministically bind the raw result to exact task authority
  -> admitted WorksiteCandidateBundle
  -> F_D: exact candidate-to-authority join
  -> admitted WorksiteFileReplaceVector V
  -> open workflow parent with V result ref and digest
  -> prepare worksite-vector-application child
  -> purely materialize child graph from exact V
  -> validate child graph against exact V ref, digest, and value
  -> admit child basis binding that graph and exact V raw input
  -> open and traverse child scope
  -> traverse child C.batch([workflow.C(existing Worksite C0)])
  -> child admitted C0 result vector
  -> child workflow.C(F_D reducer)
  -> admitted WorksiteConstructionResult
  -> existing result and replay projections
```

The standalone ABI Program ends at the replayable construction result. Its
original proof uses a separate C2 invocation for commands or mechanical
probes. Under [the accepted single-start HOW](T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md), the unchanged C1 root may instead be a child of an independently authored
consumer Program: the declared retention/preparation edge supplies C2 within
that same Run, preserving the original exact root `#start` grant.
ABI C2, through its `worker_executes` Worker/helper and ordinary ABG
admission, alone executes those commands/probes and admits their mechanical
observations. After replay, odd_glc may only interpret the already-admitted
observations against its scenario policy, freeze evidence references, obtain
an independent Reviewer return, and ask its Executive to advance or issue a
new task from a freshly observed `O0`. odd_glc does not execute the declared
commands/probes or synthesize their observations. The standalone sequence and the separately selected single-start graph
introduce no ABI prompt, review, or retry engine.

The task carries an exact pre-rendered prompt and exact authority target rows.
ABI passes the prompt bytes unchanged. The worker supplies replacement bytes
only. It does not select a path, subject, territory, capability, actor,
workspace authority basis, workspace binding, predecessor observation, effect,
traversal, continuation, or closure.

The Program, GraphFunctions, C terms, implementation bindings, HoG traversal,
ABG actor invocation, C-call admissions, Event Calculus, C0 owner effects, and
replay remain the framework. C1 adds no prompt engine, Public operation, event
kind, controller, scheduler, registry, runtime, scenario identity, or odd_glc
semantics.

## Worksite-Root Propagation And Admission

C1 carries the existing admitted authority pair, not a new workspace concept:

```text
A = exact WorkspaceAuthorityBasis
W = exact WorkspaceBinding
E = ExactPrefixWorkspaceEnvironment at the invoking/child predecessor prefix
```

`WorksiteConstructionTask` adds the exact closed field
`workspaceAuthorityBasis: A` alongside its existing
`workspaceBinding: W` field.
Root invocation-basis admission projects `E` from the exact prefix and requires
canonical equality of task `A` with `E.workspaceAuthorityBasis` and task `W`
with `E.workspaceBinding`, plus the existing grant, actor, Program, and
GraphFunction checks. It also requires the authority/binding joins already
carried by `W`:

```text
A.workspaceId == W.workspaceId
A.authorityBasisId == W.authorityBasisId
A.authorityBasisDigest == W.authorityBasisDigest
W.roots.productRoot == I_P.installedRoot
```

`I_P` is the unique admitted Program-owner installation. The actual C1
GraphFunction and each selected implementation independently resolve to their
exact dependency installations `I_G` and `I_L`; equality of these owners is
required only where the declarations select the same installation. Missing, ambiguous, crossed,
or tampered `A`, `W`, owner, install, prefix, or grant refuses before worker
dispatch.

Every `WorksiteConstructionTarget`, subject, territory, and `O0` is bound to
the same full `A` and `W`. Their root-relative paths resolve under
`A.canonicalRoot`; no target derives from `W.roots.productRoot`. The protected
root and canonical no-alias/no-symlink law is exactly C0's
`R_protected` relation and applies during task construction, invocation-basis
admission, deterministic join, child-basis admission, and C0 owner
re-observation.

The deterministic `F_D` join copies full `A` byte-for-byte from the admitted
task projection into every `WorksiteFileReplaceRequest` and derives that
request's existing W identity/digest only from the task's full `W`. The raw
Worker result carries neither. Candidate bytes cannot select, omit,
reconstruct, or change the basis. Each pure child basis reprojects its own
exact predecessor prefix, authenticates copied full `A`, and joins the request's
W coordinates to the parent's full `W` before its scope or C0 effect opens.

C3 changes no meaning under this reframe. Its existing closed branches remain
exact C1 tasks and therefore inherit `A`. C3 aggregate admission must require
every branch's full `A` and full `W` to be canonically equal to the aggregate
invocation environment and to every other branch before planning, branch
dispatch, or effect. A mixed-basis, same-ref/different-body, crossed-root, or
mixed-binding branch vector refuses as a whole. A lawful C3 reducer and replay
retain that single unchanged `A`/`W` pair into the resulting construction
result and later C2 source join.

No authority-basis field is added to the C3 aggregate carrier. Its existing
non-empty ordered branch vector already contains each complete C1 task. The C3
constructor/validator derives the sole full `A` from that vector, requires
canonical equality across every nested task plus agreement with the existing
top-level `W` and grant, and retains the exact tasks unchanged. At C3 root
`admitExecutionBasis`, ABG projects `E` and requires the derived sole `A` and
top-level `W` to equal `E` before the planning `F_D` or first branch opens.
This is inherited validation of the amended closed C1 carrier, not a C3
topology, contract, Program, GraphFunction, result, or effect change.

The installed Product remains the Program owner and must have zero byte/path/
topology delta across C1. Within this selected C1 protocol, only C0 may alter worksite bytes beneath
`A.canonicalRoot`; the live Worker remains `closed_prompt_proof` with zero tool
calls. This is not a prerequisite for every native work GraphFunction. The
separately declared [native workspace-work boundary](T287_NATIVE_WORKSPACE_WORK_DESIGN.md)
admits ordinary host read/edit/test work as its own effect, without a C1 envelope
or replacement-text response. Selecting that boundary does not change C1.

## Product Frame And Authority

Product and requirements remain unchanged. C1 realizes existing `A5-F03`,
`A5-F04`, `A5-F10`, and the bounded live-`F_P` relation of `A5-F14`; it does
not claim any feature or scenario closed.

Material source routes are:

- `repo://abiogenesis/specification/PRODUCT.md#definition-tool-and-runtime-authority`
- `repo://abiogenesis/specification/PRODUCT.md#compute-and-authority`
- `repo://abiogenesis/specification/PRODUCT.md#hog-and-abg-runtime-contract`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md`
  requirements `REQ-R-ABG3-TRANSPORT-001..019`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-WORKER.md`
  requirements `REQ-R-ABG3-WORKER-001..008`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`
  requirements `REQ-R-ABG3-FN-COMP-001..024`
- `repo://abiogenesis/specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
  requirements `REQ-R-ABG3-PAYLOAD-012`, `-019`, `-024`, and `-028`
- `repo://abiogenesis/specification/requirements/gtl/REQ-L-GTL3-COMPOSE.md`
- `repo://abiogenesis/specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md`
- `repo://abiogenesis/specification/requirements/gtl/REQ-L-GTL3-SUBWORK.md`
- `repo://abiogenesis/build_tenants/abiogenesis/typescript/design/ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-worksite-causality`

GTL owns the declared composition. HoG traverses it. The selected `F_P`
implementation constructs a candidate. Product-owned deterministic functions
validate and join carriers. C0 alone owns physical file replacement. ABG alone
admits runtime truth. Event Calculus and replay derive current state. Public is
ingress and projection only.

## Future Predecessor Gate

No realization is selected. A future `W2-R3-C1-I` cannot start until
independent review and Executive acceptance freeze the reframed C0/C1/C2
design set and a newly selected C0 evidence subject proves:

- public/installed traversal reaches the C0 owner;
- `worksite_file_replace` evidence and its ordinary result are admitted;
- `O0` is current before the owner and only `O1` is current after admission;
- fresh reopen/replay reconstructs the receipt, result, and `O1`; and
- post-commit append failure exposes `unadmitted_physical_commit` without
  fabricating runtime `O1`.

C1 would consume that newly accepted atom. The prior C0 evidence remains
predecessor evidence but cannot prove the corrected root relation. C1 does not
weaken, duplicate, or repair C0 inside a construction-specific path.

<a id="c1-text-output-amendment"></a>

## Closed Product And GTL Carriers

`code/src/product/worksite_construction.ts` owns these immutable values. The
GTL publication binds the two vector values as closed fan-out/fan-in carriers;
their members remain the exact Product/C0 carriers named here.

| Carrier | Closed meaning |
|---|---|
| `WorksiteConstructionTarget` | One stable target ref plus exact `A`/`W`-bound C0 `WorksiteSubject`, `WorksiteTerritory`, and predecessor `WorksiteObservation O0`. |
| `WorksiteConstructionTask` | Exact `workspaceAuthorityBasis: WorkspaceAuthorityBasis`, exact `workspaceBinding: WorkspaceBinding`, exact direct-`run.invoke` capability grant, the fixed Product-owned worker tuple, fixed `closed_prompt_proof` lane, exact pre-rendered prompt and digest, and one non-empty ordered target vector. |
| `WorksiteCandidateFile` | One target ref fixed by the task and canonical base64 replacement bytes. No path or authority coordinate. |
| `WorksiteConstructionWorkerFile` | The same file identity fields with exactly one scalar-valid `replacementText` string or canonical `replacementBase64` string. Product wrapping alone encodes text into the candidate file. |
| `WorksiteConstructionWorkerResult` | Raw actor-result value containing only one `WorksiteConstructionWorkerFile` for every requested target, in exact task order. It contains no task, workspace, grant, subject, territory, observation, effect, owner, or traversal authority. |
| `WorksiteCandidateBundle` | Product-wrapped `F_P` result constructed from the exact admitted task projection plus one validated raw `WorksiteConstructionWorkerResult`; it is not the actor's raw result shape. |
| `WorksiteFileReplaceVector` | Admitted root `F_D` result and exact vector-application child raw input; its ordered member values are exact C0 `WorksiteFileReplaceRequest` values. |
| `WorksiteFileReplaceOutputVector` | Existing GTL fan-out output shape whose ordered member values are exact admitted C0 outputs and whose member lineage is runtime-authenticated. |
| `WorksiteConstructionResult` | Deterministic reduction of the complete admitted C0 output vector, preserving ordered input-member refs, receipts, and `O1` values. |

The compose-seam contract identities are exact:

```text
WorksiteConstructionTask
  contract://abiogenesis/worksite/construction-task@5
WorksiteConstructionWorkerResult
  contract://abiogenesis/worksite/construction-worker-result@5
WorksiteCandidateBundle
  contract://abiogenesis/worksite/construction-candidate-bundle@5
WorksiteFileReplaceVector
  contract://abiogenesis/worksite/construction/file-replace-vector@5
WorksiteFileReplaceOutputVector
  contract://abiogenesis/worksite/construction/file-replace-output-vector@5
WorksiteConstructionResult
  contract://abiogenesis/worksite/construction-result@5
```

The raw worker-result declaration is exact:

```text
contractVersion: 5.0.0
contractKind: output
valueKind: worksite_construction_worker_result

{
  kind: "worksite_construction_worker_result",
  schemaVersion: "5.0.0",
  files: [{
    kind: "worksite_candidate_file",
    schemaVersion: "5.0.0",
    targetRef: <the exact target ref at this ordinal>,
    replacementText: <Unicode scalar text>
  }, ...]
}
```

The existing raw alternative replaces `replacementText` with canonical
`replacementBase64`; a file contains exactly one of them. All objects are
closed to additional properties. Text contains Unicode scalar values only;
unpaired UTF-16 surrogates refuse. The existing canonical-base64 alternative
continues to represent arbitrary bytes, including non-UTF-8 binary content.
Both payload fields, neither field, a non-string payload or an extra field
refuses before candidate/result admission and before C0.

The task-derived response schema uses object/properties/required,
closed-object, array/items/minItems, const-or-enum and canonical-base64-pattern
forms. It requires the existing file identity fields and declares the two
optional string payload properties. It uses no tuple schema, exact maximum,
`oneOf`/`anyOf` or conditional schema. The schema constrains shape and the
target-ref set; Product raw admission additionally proves payload exclusivity,
complete cardinality, ordinal correspondence and scalar/base64 validity before
wrapping. Schema generation does not claim those exact raw-admission
constraints are enforced by the transport.

The root GraphFunction declares the raw transport contract independently of
its Product output contract:

```text
"abg.raw_result_contract"
  = "contract://abiogenesis/worksite/construction-worker-result@5"
```

The root `F_P` leaf still outputs
`contract://abiogenesis/worksite/construction-candidate-bundle@5`.
Declaration-closure resolution must retain the raw contract so the installed
Product semantics owner can validate it before wrapping; the declaration does
not make the raw value an admitted GraphFunction output.

The root join output and vector-application input both use the exact
`WorksiteFileReplaceVector` contract ref. The child batch outer input uses that
same ref; its outer output and the reducer input both use the exact
`WorksiteFileReplaceOutputVector` ref. The reducer, vector application, and
root all output the exact `WorksiteConstructionResult` ref.

The Product API is:

```text
constructWorksiteConstructionTask
isWorksiteConstructionTask
constructWorksiteConstructionWorkerResult
isWorksiteConstructionWorkerResult
constructWorksiteCandidateBundle
isWorksiteCandidateBundle
constructWorksiteFileReplaceVector
isWorksiteFileReplaceVector
isWorksiteFileReplaceOutputVector
reduceWorksiteFileReplaceResults
isWorksiteConstructionResult
```

`constructWorksiteConstructionWorkerResult(task, rawValue)` validates the exact
task-derived closed raw relation, including constraints beyond the response
schema. `constructWorksiteCandidateBundle(task, workerResult)` is the only
raw-to-Product wrapping and text-encoding relation.

Every ref/digest covers its complete canonical body. Task construction requires
one exact valid full `WorkspaceAuthorityBasis`, one exact valid full
`WorkspaceBinding`, their exact authority/workspace join, the exact direct
invocation grant for its fixed Product-owned worker actor/binding, unique
target refs and subjects, targets beneath `A.canonicalRoot` and outside every
protected root, target-within-territory, and observations bound to the
corresponding `A`/`W` subjects.
The constructor stamps the worker tuple below; no caller field selects or
widens it. Target order is authority; neither worker output nor filesystem
enumeration may change it.

The root invocation input admission must project the exact-prefix environment
and prove that the task's complete authority basis, workspace binding, and
capability grant equal the invocation's admitted authority basis, workspace
binding, and sole capability grant before worker dispatch. This is a bounded
admission relation over existing invocation, environment, and execution-basis
carriers, not a Public semantic branch, new basis, or new grant.

## Prompt And Candidate Boundary

The caller supplies `WorksiteConstructionTask.prompt` as complete text. ABI:

- passes that string unchanged to the existing `ProbabilisticWorkerRequest`;
- adds no governance prose, role text, frame selection, action, repair advice,
  context synthesis, or prompt section;
- does not parse the prompt to discover targets or authority; and
- supplies only a deterministic JSON result schema derived from the ordered
  target refs and the fixed `WorksiteConstructionWorkerFile` carrier.

The prepared `ProbabilisticWorkerRequest` tuple is exact and Product-owned:

```text
materializationPlanRef
  prompt-plan://abiogenesis/worksite/construction@5
rendererRef
  renderer://abiogenesis/worksite/construction@5
instructionContractRef
  contract://abiogenesis/worksite/construction-task@5
resultContractRef
  contract://abiogenesis/worksite/construction-worker-result@5
actorRef
  actor://abiogenesis/worksite/construction-worker@5
workerBindingRef
  worker-binding://abiogenesis/worksite/construction-worker@5
transportLane
  closed_prompt_proof
```

Task admission, Product semantics, prepared request, actor-process request, and
transport observation must preserve that tuple exactly. General actor,
binding, renderer, plan, instruction, result-contract, or lane selection
remains outside C1.

The response schema follows the shape/raw-admission division specified with
the closed carriers above. The raw result cannot contain, project or override
task authority, and it does not satisfy `isWorksiteCandidateBundle`.

Transport success is not result admission. The `F_P` completion parses and
validates one raw `WorksiteConstructionWorkerResult`, then applies the exact
deterministic semantic relation:

```text
wrapCandidate(task, rawWorkerResult)
  = WorksiteCandidateBundle(
      taskProjection = exact admitted task authority rows,
      files = rawWorkerResult.files.map(encodeCandidateFile),
      binding = ordered target-ref bijection,
    )
```

`encodeCandidateFile` preserves the exact file identity fields and existing
base64 payload, or replaces the text field with canonical base64 of its exact
UTF-8 bytes. Its output is always the unchanged `WorksiteCandidateFile` shape.
Encoding preserves the decoded JSON string exactly, including CR/LF, NUL and
a supplied BOM; it performs no Unicode normalization, trimming or newline
conversion and adds no BOM. Empty text yields zero bytes. The existing raw
base64 alternative reproduces the prior candidate body, digest, ref and C0
bytes exactly. The task, contract refs and downstream carrier shapes are
unchanged; new publication/artifact digests bind the amended installed
semantics. Previously admitted raw output and results retain their exact
identities and remain replayable without conversion or relabelling.

Only the resulting Product-wrapped `WorksiteCandidateBundle` may be the
ordinary admitted `F_P` result. A raw result with missing, extra, duplicate,
reordered, or unknown target refs, invalid scalar text or canonical base64,
both/neither payload fields, or any authority field refuses before
candidate-bundle construction and before C-call result admission.

The existing ABG actor invocation retains the raw `finalOutput`, transport
facts, process identity, prompt digest, tool-call count, and result-artifact
digests. The ordinary `F_P` C-call evidence and result admission retain the
validated candidate. Private reasoning and worker self-assessment are not
admitted Product truth.

`closed_prompt_proof` is mandatory for C1. Its admitted transport contract must
prove zero tool calls. `worker_executes` is outside C1 because it could mutate
the worksite outside C0.

## GTL Publication And Topology

`code/src/gtl/worksite_construction.ts` publishes one composite module and two
Programs:

```text
module://abiogenesis/worksite/construction@5
program://abiogenesis/worksite/construction@5
program://abiogenesis/worksite/file-replace@5    existing C0 identity
graph-function://abiogenesis/worksite/construction@5
graph-function://abiogenesis/worksite/construction/vector-application@5
graph-function://abiogenesis/worksite/file-replace@5       existing C0
graph-function://abiogenesis/worksite/construction/reduce@5
batch://abiogenesis/worksite/construction/targets@5
contract://abiogenesis/worksite/construction-closure@5
contract://abiogenesis/worksite/construction-failure@5
contract://abiogenesis/worksite/construction/vector-application-child-closure@5
contract://abiogenesis/worksite/construction/vector-application-failure@5
contract://abiogenesis/worksite/file-replace-child-closure@5
contract://abiogenesis/worksite/construction/reducer-child-closure@5
```

The GTL entrypoint is `constructWorksiteConstructionModulePublication`. The
packaged symbols in `code/src/implementation/worksite_construction.ts` are:

| Symbol | Regime | Exact join |
|---|---|---|
| `realizeWorksiteConstructionCandidate` | `F_P` | task -> governed worker request -> raw worker-result validation -> Product-wrapped candidate bundle |
| `realizeWorksiteFileReplaceVector` | `F_D` | admitted candidate bundle -> exact ordered C0 request vector |
| `reduceWorksiteConstructionResults` | `F_D` | complete admitted C0 output vector -> construction result |

The static Product set contains one composite construction publication, not a
construction publication beside a standalone C0 publication. It owns both the
existing C0 Program identity and the construction Program. Both Programs bind
the composite module ref. The C0 Program's callable membership remains exactly
C0; the construction Program's membership is the four functions below. The
single C0 contribution names both Program memberships, so the Catalog admits
one C0 handle, definition, and binding authority row.

All four GraphFunctions, their exact contracts and closure contracts, and the
four selected leaf implementation bindings occur once in that composite
`ModulePublication`. The binding census is exact:

| GraphFunction | Local executable leaf rows | Binding ownership |
|---|---:|---|
| root construction | `2` | `F_P` candidate plus `F_D` authority join |
| vector application | `0` | pure `C.batch` plus `workflow.C`; no dummy leaf |
| C0 file replace | `1` | existing C0 `F_D` owner binding |
| reducer | `1` | construction-result `F_D` reducer binding |

The exact census is therefore `2/0/1/1`: four callable GraphFunctions and four
real leaf bindings. The vector application adds no implementation binding;
HoG realizes its declared `C.batch` and `workflow.C` terms. The root
GraphFunction ends at the vector-application child boundary:

```text
C.compose(
  C.of(F_P construction-candidate),
  C.compose(
    C.of(F_D candidate-authority-join),
    workflow.C(worksite-vector-application),
  ),
)
```

The `worksite-vector-application` GraphFunction admits
`WorksiteFileReplaceVector` as its raw input. Only that child declares the
existing `fan_out` application and contains:

```text
C.compose(
  C.batch(
    [workflow.C(worksite-file-replace)],
    batch://abiogenesis/worksite/construction/targets@5,
    { input: WorksiteFileReplaceVector,
      output: WorksiteFileReplaceOutputVector },
  ),
  workflow.C(worksite-construction-reducer),
)
```

Its existing `fan_out` application maps the input vector to the C0 member
carrier under the named batch. Its existing `fan_in` application maps the
authenticated C0 output vector to the reducer. No new application kind is
added.

The Program's callable membership is exactly root, vector application, C0,
and reducer. The root is mixed-regime; vector application, C0, and reducer are
`F_D`. The root carries the existing
`effect://abiogenesis/worksite/file.replace/v1`; no new effect is declared.

The closure inventory is exact:

| GraphFunction | Closure declaration |
|---|---|
| root construction | `contract://abiogenesis/worksite/construction-closure@5` under `abg.closure_contract`, `closureScope: run` |
| vector application | `contract://abiogenesis/worksite/construction/vector-application-child-closure@5` under `abg.child_closure_contract`, `closureScope: graph_call` |
| C0 file replace | existing `contract://abiogenesis/worksite/file-replace-closure@5` under `abg.closure_contract` at `run` plus added `contract://abiogenesis/worksite/file-replace-child-closure@5` under `abg.child_closure_contract` at `graph_call` |
| reducer | `contract://abiogenesis/worksite/construction/reducer-child-closure@5` under `abg.child_closure_contract`, `closureScope: graph_call`, plus `contract://abiogenesis/worksite/construction-failure@5` under `abg.failure_contract` agreeing with its one local row |

### Pure-Child Failure Contract

The vector-application GraphFunction has no local implementation row from
which HoG or ABG can infer a workflow C-call failure contract. It therefore
declares:

```text
"abg.failure_contract"
  = "contract://abiogenesis/worksite/construction/vector-application-failure@5"
```

That contract is a published `failure` `ContractDeclaration` with value kind
`worksite_construction_vector_application_failure`. It describes the ordinary
failed outcome of the pure child; it does not create an implementation owner,
effect, event kind, or failure controller.

Workflow failure-contract resolution is one exact generic relation over the
selected child GraphFunction and its admitted local implementation rows:

1. If `abg.failure_contract` is present and there are zero local rows, use the
   declared published failure contract.
2. If the declaration is absent and the rows expose exactly one distinct
   failure contract, use that contract as the legacy-row fallback.
3. If both declaration and rows exist, every local row must agree with the
   declaration; use the declaration only on exact agreement.
4. An absent declaration with zero rows, multiple row contracts, an
   unpublished/non-`failure` declaration, or any declaration/row disagreement
   refuses as `workflow-failure-contract-ambiguous` before the workflow C-call
   opens.

`workflow_lifecycle.ts` resolves the child GraphFunction from the exact
installed child-traversal basis and proposes only that result. The
workflow-specific `openCCall` input also carries that exact child
GraphFunction and the admitted `ProgramValidation`; `abg/c_call.ts` requires
the child's canonical digest in that validation, exact callable membership,
and the same declaration/row result before admitting the workflow C-call.
Program validation and declaration-closure resolution bind
`abg.failure_contract` as a published failure-contract reference and
`abg.raw_result_contract` as a published output-contract reference. Existing
row-backed GraphFunctions retain their legacy behavior; this law does not add
a fifth binding to C1.

The parent join is result-bearing. Let `J` be its admitted successful C-call
result, `Gv` the purely materialized and validated vector-application child
graph, and `Bv` the subsequently admitted child basis. The workflow parent
opens using `J.resultRef` and `J.valueDigest`. Child preparation passes those
coordinates and `J.value` unchanged into graph materialization and validation.
Basis admission then binds `Gv` and proves:

```text
Bv.rawInputAdmissionRef == J.resultRef
Bv.rawInputDigest == J.valueDigest == sha256Canonical(J.value)
canonicalJson(Bv.rawInputValue) == canonicalJson(J.value)
```

`J.value` must satisfy `isWorksiteFileReplaceVector`. No adapter, projection,
reconstruction, fan-out, or filesystem read may occur between that admitted
parent `F_D` result and pure child materialization. The exact refusal is
seam-owned:

- a missing, malformed, digest-mismatched, or wrong-target selected result is
  `workflow-selected-input-mismatch` before child preparation;
- a non-current or crossed workflow parent call, scope, execution basis, or
  root admitted set is `parent_basis_mismatch` at child-basis admission; and
- a materialized/validated graph or raw-input ref, digest, or value that does
  not preserve `J` is `child_input_mismatch` at child-basis admission.

The existing `prepareChildTraversal` relation performs pure
`materializeGraph`, `validateGraph`, and then `admitChildExecutionBasis` in
that order. Only after basis admission may it open the child traversal scope;
only after that scope opens may HoG traverse the child or open a C0 member.
C1 adds no ABG adapter or input-translation implementation.

`code/src/gtl/worksite_c0.ts` factors exact reusable C0 publication parts and
adds one declared child-closure contract with `closureScope: graph_call` and
`abg.child_closure_contract`; its root closure remains unchanged. The
standalone constructor remains an isolated C0 proof helper. The installed C1
subject uses only the composite construction publication, which incorporates
those exact parts once and re-homes the existing C0 Program under the composite
module. The static generator replaces the standalone C0 publication entry with
the composite entry; it never admits both together.

The added declaration changes the C0 GraphFunction digest, so the accepted C0
subject remains predecessor evidence rather than byte-identical C1 evidence.
C1 must re-admit the amended definition and rerun affected C0 behavior. Its
effect identity, owner, implementation binding, request/result meaning,
Program identity, and root-closure behavior do not change.

The original standalone C1 proof uses `abg.operation.run.invoke#invoke`
targeting its root GraphFunction. The selected single-start HOW additionally
uses this unchanged root as a child under the original admitted consumer
`#start` invocation; it mints no child invocation or replacement grant.
Reentry, continuation, SDK/CLI convenience and new Public definitions remain
outside this C1 extension.

## Deterministic Join And Ordered Effects

`realizeWorksiteFileReplaceVector` consumes only the admitted candidate bundle.
It requires an exact ordered bijection between task targets and candidate
files, decodes bytes canonically, and constructs each request through
`constructWorksiteFileReplaceRequest`. It refuses before child traversal on:

- missing, extra, duplicate, reordered, or unknown target refs;
- invalid base64 or byte/digest mismatch;
- crossed authority basis, workspace binding, canonical root, grant, subject,
  territory, or O0;
- duplicate subjects; or
- any candidate field outside the fixed carrier.

The candidate supplies no request authority. Each request receives the exact
full authority basis, full workspace binding, grant, subject, territory, and
O0 only from the admitted task projection. Specifically, every request's
`workspaceAuthorityBasis` is canonical-equal to
`task.workspaceAuthorityBasis`. No field is reconstructed from a
digest, ambient root, Worker output, or containing C3 branch.

Ordinary parent C-call admission first admits the join's complete
`WorksiteFileReplaceVector`. HoG then enters the vector-application
GraphFunction through `workflow.C` using that result ref, digest, and value as
the child's exact raw-input coordinates. Preparation purely materializes the
child graph, including its declared `fan_out`, from that value and validates
the graph before child-basis admission. Basis admission then binds the exact
materialized graph and raw input. Only after that basis has reprojected and
authenticated full `A` and `W` against its exact-prefix environment and its
child scope is open may HoG traverse `C.batch` in stable member order. C1
claims no parallel execution and requires no new concurrency policy. Each
member enters the exact C0 GraphFunction through `workflow.C`; its graph is
materialized and validated before its child basis is admitted, and only then
does basis admission make exact O0 current. Only after that may the C0 scope
open and its owner perform one independently atomic replacement.

The vector is not a multi-file transaction. If member `k` refuses, members
before `k` remain individually admitted, later members are not invoked, the
reducer is not invoked, and replay exposes the exact partial prefix. C1 never
rolls back or reports aggregate success for a partial vector.

The reducer child runs through `workflow.C` only after a complete admitted
output vector. It consumes no filesystem state and accepts exactly one valid
C0 output per input-member ref in order. It returns receipts and `O1` values;
ABG admits the reducer result, closes the vector-application child, and then
admits the root result and existing terminal relation.

## Future Realization Surface (Unselected)

No C1 implementation or evidence is selected. If a later Executive selection
follows independent acceptance of the reframed C0/C1/C2 design set,
`W2-R3-C1-I` may change only:

- new `code/src/product/worksite_construction.ts`;
- new `code/src/implementation/worksite_construction.ts`;
- new `code/src/gtl/worksite_construction.ts`;
- existing `code/src/gtl/worksite_c0.ts` only to factor exact publication parts
  and declare its child closure;
- existing `code/src/product/builtin_semantics.ts`, `code/src/product/index.ts`,
  `code/src/gtl/index.ts`, and `code/src/implementation/index.ts` for the new
  exact carriers, contracts, implementations, judgment relations, and
  publication;
- existing `code/src/abg/execution_basis.ts` only for the bounded admission
  check proving the root task's full authority basis, workspace binding, and
  grant equal the exact-prefix environment, admitted invocation binding, and
  sole capability grant, plus the C3 root's derived all-nested-C1-basis check
  before planning;
- existing `code/src/product/worksite_branch_construction.ts` only for the
  inherited validator relation deriving one full `A` from the unchanged nested
  C1 tasks and refusing a mixed-basis vector before branch materialization;
- existing `code/src/product/declaration_closure.ts` and
  `code/src/validator/validation.ts` only to bind and validate the declared
  pure-child `abg.failure_contract` as one published failure contract and the
  root `abg.raw_result_contract` as one published output contract;
- existing `code/src/hog/workflow_lifecycle.ts` and `code/src/abg/c_call.ts`
  only for the exact child-GraphFunction/ProgramValidation-bound declaration
  and legacy-row agreement relation above;
- existing `scripts/generate-product-manifest.mjs` and generated
  `product-toolchain-manifest.json` only to replace the standalone C0 static
  entry with the composite C1 module, its two Programs, bindings, and unique
  Catalog contributions; and
- the two C1 tests named below.

No change is selected under `code/src/public/`, the root event-kind census,
actor-process transport semantics, worksite filesystem owner semantics, C0
evidence/result meaning, odd_glc, or any specification/requirement.

## Required Root Proofs And Future Evidence (Unselected)

The shared proof matrix in C0 is normative. C1 adds these mandatory cases:

| Case | Required result |
|---|---|
| Direct C1 | With `A.canonicalRoot != W.roots.productRoot`, a task targeting `package.json` changes only `A.canonicalRoot/package.json`; every admitted C0 request contains the exact original full `A` and W identity/digest derived only from the task's full `W`. |
| Pre-dispatch tamper | A task with an altered, alias-equivalent, ref-only-equal, crossed, or stale authority basis refuses against the exact-prefix environment before the live Worker dispatch. |
| Child propagation | Parent join value, vector child raw input, each C0 child request/basis, reducer input/result, close, and fresh replay preserve full `A` plus the one exact admitted `W`; the C0 request carries W identity/digest and the child authority carries full `W`. |
| C3 inheritance | Same-basis branches preserve C1 behavior and replay; any branch with a different full `A`, `W`, canonical root, or authority/body join makes aggregate admission refuse before the first branch. |
| Product conservation | The unique Program-owner installed payload is byte/path/topology exact before and after both direct C1 and nested C3 construction. |

If later selected, `W2-R3-C1-E` owns:

- `test_env/tests/t287-worksite-construction.test.mjs`; and
- `test_env/tests/t287-live-worksite-construction.test.mjs`.

The first uses an exact deterministic transport double through the existing
actor-process boundary and proves:

1. the publication validates with exactly two Programs, the construction
   Program's exact four-member callable set, the C0 Program's exact one-member
   callable set, exact `2/0/1/1` executable-row census, four real
   implementation bindings, and the exact root/vector/C0/reducer closure
   inventory;
2. the amended C0 definition and binding are admitted exactly once, their one
   Catalog contribution names both Programs, isolated standalone C0 behavior
   and affected C0 evidence still pass, and C1 incorporates those exact bytes;
3. the static Product manifest contains the exact C1 module publication
   coordinate and GraphFunction contributions, and its publication digest
   commits to the exact four binding rows;
4. the raw-result declaration is present in the exact execution closure and is
   one published `output` contract; missing, unpublished, wrong-kind, or
   candidate-bundle aliases refuse. One worker dispatch retains raw output,
   validates exactly one
   `WorksiteConstructionWorkerResult`, deterministically wraps exact task
   authority into one distinct `WorksiteCandidateBundle`, and admits only that
   Product-wrapped bundle; the raw contract is present in the exact execution
   declaration closure but is not the root leaf output contract;
5. the prompt bytes are unchanged and tool-call count is zero;
6. the zero-row vector child opens from its published
   `abg.failure_contract`; legacy single-contract row fallback opens C0; the
   reducer opens when its declaration agrees with its one row; and absent,
   ambiguous, unpublished, or disagreeing contracts refuse before child
   opening;
7. the workflow parent opens with the admitted `F_D` result ref/digest, pure
   child materialization and validation use its exact canonical value, child
   basis admission binds that exact graph/ref/digest/value, and the admitted
   event prefix places child-basis admission before child-scope or C0 opening;
8. one target creates one vector-application child basis, one C0 child basis
   whose raw input equals the exact C0 request, and one reducer child basis,
   then admits receipt, O1, reducer result, root terminal truth, and fresh
   replay;
9. three targets preserve order, use one vector-application basis plus three C0
   child bases plus one reducer basis, and reduce only the complete admitted
   output vector;
10. tampering remains pre-mutation and is attributed exactly: raw-result,
   candidate, or join target, authority, encoding, order, or cardinality
   tampering produces the
   raw-wrapper/join-owned typed refusal or prevents `F_P`/`F_D` result
   admission before child preparation; parent/child ref, digest, or
   value-coordinate tampering is
   `workflow-selected-input-mismatch`, `parent_basis_mismatch`, or
   `child_input_mismatch` at its owning seam; and child-graph reproduction or
   validation tampering is `graph_validation`;
11. stale O0 or a C0 refusal yields a replay-visible partial stop and never
   invokes the reducer; and
12. no Worker or non-C0 implementation writes the canonical worksite, only C0
    writes a declared target beneath `A.canonicalRoot`, and no actor changes any
    Product/toolchain/event/runtime-state/projection/archive root.

The live test performs the same one-target path through the configured known
worker transport. It proves one real process, zero tool calls, retained raw
output, admitted candidate, C0-only mutation, admitted terminal result, close,
fresh reopen, and replay equality. Live-worker availability failure is a typed
environment/transport result, not a green substitute.

odd_glc Hello World and Data Mapper may pass different prompts, targets, and
bytes through the same ABI Program identity as downstream dogfood. After fresh
C1 replay proves the resulting `O1` values, a separate ABI C2
`worker_executes` Worker/helper invocation alone executes every declared
command and probe; ordinary ABG admission alone records the corresponding
mechanical observations. After fresh C2 replay, odd_glc may interpret those
admitted observations, freeze evidence references, activate an independent
Reviewer, and ask its Executive to assign priority and either advance or issue
a new `WorksiteConstructionTask` from current observations. odd_glc and the
ABI host neither execute those commands/probes nor synthesize observations. No
scenario-specific branch, module, Program, GraphFunction, carrier, prompt,
Reviewer, Executive, or iteration loop is added to ABI, and odd_glc results do
not qualify ABIogenesis.

## Downstream Reacquisition Gate (Prospective And Unselected)

Only after this exact design is independently accepted, its separately
selected realization/evidence is accepted, and one exact installed artifact is
accepted may a later Executive select downstream reacquisition. That gate is
strictly ordered:

1. rerun the unchanged `basic-cli` subject first; and
2. only after its complete admitted result and fresh replay pass, run the
   frozen `js-tenant-test` subject.

Each invocation projects full `A` and `W` from its exact-prefix environment
and admits their exact join before C1/C2 dispatch. Authored targets, including
`package.json`, resolve beneath `A.canonicalRoot`, with
`A.canonicalRoot != W.roots.productRoot == I_P.installedRoot`. The complete
installed Product tree must be path-, topology-, and byte-exact before and
after each invocation. ABI C2's `worker_executes` Worker/helper plus ABG
admission is the sole declared-command/probe execution and mechanical-
observation path. A fixture root, odd-specific shim, scenario-specific ABI
branch, host command/probe execution, or synthesized observation refuses the
gate. Historical `basic-cli` evidence earns no `1/7` scenario credit; credit
can begin only with the unchanged reacquisition run. This gate selects no I/E,
artifact, model/live use, or downstream run now.

## Falsifiers

C1 is falsified if:

- ABI constructs, appends to, interprets, or selects sections of the caller's
  prompt;
- raw `WorksiteConstructionWorkerResult` bytes are admitted directly as a
  `WorksiteCandidateBundle`, or raw output can supply any task authority;
- `abg.raw_result_contract` is absent from the root GraphFunction or exact
  declaration closure, names a non-output contract, or equals the Product-
  wrapped candidate-bundle output contract;
- the worker chooses or widens a path, target, territory, grant, W, O0, effect,
  owner, traversal, or closure;
- the task or any C0 child omits full `A`, carries a basis different from the
  exact-prefix environment, reconstructs `A` from a ref/digest, or resolves an
  authored target beneath `W.roots.productRoot`;
- C1 dispatches the Worker before full `A`/`W` admission authentication, or a
  C0 child opens before authenticating the propagated pair at its own prefix;
- a C3 aggregate accepts mixed authority bases or bindings, dispatches one
  branch before whole-vector equality is proven, or changes C3 meaning beyond
  inheriting the closed C1 carrier;
- any target equals or descends beneath a Product, toolchain, event,
  runtime-state, projection, or archive root, a territory itself lies in one,
  or the installed Program-owner Product has a non-zero delta;
- the caller selects or changes the worker actor, binding, materialization plan,
  renderer, instruction/result contracts, or transport lane;
- worker tools or a non-C0 leaf mutate the worksite;
- the root contains `fan_out`, `C.batch`, C0 member traversal, or reducer
  traversal instead of ending at `workflow.C(worksite-vector-application)`;
- the vector application is absent from callable membership, lacks its exact
  child closure, is prepared before the workflow parent opens on the admitted
  result coordinates, or is materialized from any projection or reconstruction
  instead of the admitted parent `F_D` result;
- the pure vector child gains a dummy implementation row, its declared failure
  contract is absent from the Product declaration closure, or a missing,
  ambiguous, unpublished, or declaration/row-mismatched failure contract opens
  a workflow C-call;
- the vector child scope, `C.batch`, or any C0 member opens before pure graph
  materialization, graph validation, and exact child-basis admission complete;
- parent result ref/digest/value and vector-child raw-input ref/digest/value are
  not pairwise equal;
- C0 is inlined instead of entered through `workflow.C` and a child basis;
- C0 GraphFunction structure is copied into a second authority surface;
- standalone C0 and composite C1 publications coexist in the static Product
  set, or C0 resolves to more than one handle, definition, or binding row;
- candidate or transport success bypasses ordinary C-call admission;
- a reducer reads ambient files, consumes an incomplete vector, or erases a
  partial stop;
- a vector is described as an atomic multi-file transaction;
- Public selects topology or gains a construction-specific operation;
- a new event kind, controller, scheduler, prompt engine, runtime, registry,
  scenario identity, or odd_glc semantic appears;
- declared commands/probes execute outside the ABI C2 `worker_executes`
  Worker/helper, their mechanical observations are synthesized or admitted
  outside ordinary ABG admission, or odd_glc performs anything beyond
  post-replay interpretation, Reviewer return, and Executive disposition;
- the generated Product manifest omits or disagrees with the C1 static
  publication; or
- evidence is reported as `run.invoke#start`, complete lifecycle, broad R3/R4,
  scenario, qualification, version, RC, tap, or release closure.

## Residuals And Stop

C1 does not close pre-binding admission, URI typing, Catalog declaration
application, overlay hierarchy, `run.invoke#start`, continuation/reentry,
parallel-write safety admission, general worker-transport selection, multi-file
atomicity/compensation, separately selected C2 command/probe execution and
observation admission, downstream domain interpretation, Reviewer evaluation,
Executive priority/disposition, complete odd_glc, S1/P0, E00, qualification,
or release.

This Worker stops at the frozen design/docs candidate for independent review.
I/E, builds, tests, package/manifests, model/live use, and odd_glc remain
unselected. A need for new Product meaning, Public/event authority, prompt
construction, Worker tool mutation, scenario-specific behavior, parallel
scheduling, compensation, or a broader transport abstraction returns to the
Executive at its owning re-entry.
