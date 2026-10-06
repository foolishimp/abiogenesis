# T-287 Registered Graph Selection

Status: accepted S1 HOW under T287_REGISTERED_SELECTION_IMPLEMENT_01 after
independent RS-D01 correction review. Implementation and execution remain open.

## Basis and correction

Source/Product base: `e27f72bc2037130d3261694da40af0148269f142`.
Exact method: `stdo://releases/v2.5.1-rc.2/`, selected by
`stdo_abiogenesis.json` and verified by Executive. Grant:
`.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md#s1-worker-grant-t287_registered_selection_design_01`,
with Executive's RS-D01 correction grant. Frames: Product/Design/Owner and
`ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration`.

WHAT: `PRODUCT.md#graphfunction`, `#framed-evaluation-and-graph-consequence`,
and `REQ-L-GTL3-SELECTION-BOUNDARY-016..019`. Ordinary graph computation chooses
permitted preregistered work; ABG admits the choice; HoG executes that choice.
F_P owns open suitability judgment; F_D requires an explicit total rule. Purpose
grants neither permission nor successful completion.

The original proposal was rejected because it made One Surface's model, gap,
action-evaluation and refresh phases prerequisites for generic selection. Its
exact bytes are preserved in `registered-selection-design-v1.md` beside the
execution record (SHA-256
`4af858bc87682e6134d9e50cf6597108ea12bca589dfe92bbcbf6eb65adf627d`).
Those phases are an optional library pattern. `GtlProgram.constructionComposition`
and its singular semantics remain unchanged. This design requires none of its
action catalogue, obligation ledger, priority projection or closure calculus.

## Existing mechanics and actual gap

Paths below are relative to `build_tenants/abiogenesis/typescript/`.

| Owner | Relevant fact |
|---|---|
| `code/src/gtl/contracts.ts:309`; `product/catalog.ts:20,294` | GraphFunction declarations and input/output/effect contracts travel in the exact catalogue definition/digest. Purpose needs no registry. |
| `code/src/validator/validation.ts:1140` | Existing gate applications bind evaluators to one workflow target; they do not route alternative callees. |
| `code/src/gtl/source_path.ts:859`; `hog/route_proposal.ts:550` | Ordinary continuation has one successor. Current result-dependent routing handles re-entry/no-action, not forward selection among fixed workflow nodes. |
| `code/src/validator/validation.ts:100,1471`; `abg/traversal_route.ts:1532` | ConstructionComposition's eight terms and singleton interaction explain why existing multi-candidate fixtures do not prove two different callees. These owners need no construction-composition change. |
| `code/src/hog/workflow_lifecycle.ts:396`; `hog/child_traversal.ts:141`; `abg/execution_basis.ts:2112` | Existing child preparation joins input, fixed callee, materialization, Program membership and child basis. Reuse those owners. |

The missing semantics is an explicit choice-result-to-workflow-edge relation at
the existing graph application surface. It requires no new C operator, graph
compiler, runtime Frame, catalogue, event family or external Executive loop.

## One declared application and direct execution path

Add one immutable `GraphFunctionApplication` variant, `registered_selection`,
using the existing template application list and canonical application identity:

```text
sourceProgramLocusRef : selector C.of locus
evaluatorRef         : its exact published Evaluator
ruleRef              : explicit published selection policy/Rule
inputContractRef     : selector's registered-choice result contract
outputContractRef    : common input contract of the candidate children
```

This is an explicit derived application relation, not another C generator. Its
selector is a complete `c_of` node. Existing outgoing graph edges enumerate the
alternatives, each ending at a complete fixed `workflow.C(G)` node. There is one
topology source, not a duplicate target list. Each application identifies one
selector node; each target has a distinct callee in both the exact admitted
catalogue view and Program membership. The published evaluator, regime and
binding must match the selector leaf; its policy/criteria must be supplied under
its declared input contract. Empty, duplicate or ambiguous target relations
refuse declaration admission.

```text
ordinary selector C.of [F_D or F_P]
        -> admitted choice A -> fixed workflow.C(A) -> ordinary result/foldback
        -> admitted choice B -> fixed workflow.C(B) -> ordinary result/foldback
        -> admitted gap      -> declared unresolved/blocked disposition
```

Candidates preserve one explicit child input/result interface. The selector's
choice carrier is distinct from the child input. This application declares one
exact translation: extract the chosen result's typed `input.value`. Graph-edge
validation recognizes that join only for its declared selection edges; ordinary
carrier equality remains elsewhere. Do not generalize the retained-input edge
relation or introduce arbitrary coercion. Children may be terminal or continue
through ordinary edges. S2 uses a common ordinary result join; no mandatory
assessment, model, refresh or recursive tail exists.

## Compact result and shared target/input resolution

Publish one selected/gap contract through the existing contract owner. It has
no ranking field and is shared by F_D and F_P:

```text
selected = { kind: registered_graph_choice, disposition: selected,
             graphFunctionRef, definitionDigest,
             input: { contractRef, value }, reason, evidenceRefs }
gap      = { kind: registered_graph_choice, disposition: gap,
             reason, missingSupportRefs, evidenceRefs }
```

The schema supplies versioning and exact field/type rules. The source CCall and
admitted result already bind the actual input/context, Program, frame, evaluator
and observation basis; no second selection-basis runtime entity is introduced.
The selector's input/context supplies the relevant exact catalogue/purpose/
contracts, policy, selected frame and observations. Supporting references must
resolve within that basis. Admission does not prove the reason semantically true.

F_D implements its explicit total closed rule. F_P supplies its own choice,
reason and input under the same contract. There is no deterministic semantic
ranking, answer inference, repaired input or fallback. Canonical identities may
be mechanically constructed from admitted bytes; missing semantic fields cannot
be filled by the runtime.

One pure relation at the existing source-path owner computes:

```text
resolveRegisteredSelection(exact application, materialized graph,
  permitted catalogue/Program definitions, source cursor, admitted result)
    -> { fixed workflow path, callee/digest, child input/value/digest/ref }
     | gap | typed refusal
```

First establish declaration applicability: exact Program/graph/application,
source locus and expected C result contract. Only then interpret the result's
choice fields. An unrelated payload with the same `kind`, `disposition` or other
choice-looking fields remains ordinary data; no global shape-triggered dispatch.

The relation joins chosen definition digest, unique declared edge/target, shared
input contract and unchanged input bytes. The child raw-input reference is
canonical over subject kind, contract and value and may recur across Runs; its
value digest hashes `input.value`. The admitted route-use relation separately
binds source result, application, execution and target cursor to that content.
Input recovery selects this current provenance before validating the binding.
This projection does not author replacement input after the selector.

HoG calls this relation after ordinary result/judgment admission and proposes a
target cursor carrying that child-input identity. ABG authenticates the same
relation against its admitted prefix and exact basis before route admission.
Only this declared application overrides ordinary single-successor continuation.
There are not two selection algorithms or process-local selection authority.

Reuse existing result, judgment and `traversal_route_admitted` events. The route
binds application and source-result identity to selected target cursor and child
input. The source result remains owner of actual value and reason. Add neither
`construction_intent_selected` nor a selection ledger for this generic route.
Replay reacquires the binding from those causal facts, never a cached answer.

The existing child-preparation owner reacquires the route-bound input. HoG calls
the fixed reached workflow term and checks selected callee equality plus exact
input identity/value/contract before launch. It cannot substitute another callee
into the term. Keep the existing ConstructionIntent path and guard unchanged;
the generic route supplies its own admitted input binding at the same child
preparation seam. Both use ordinary child materialization, validation, admission,
execution, closure and parent workflow result/judgment. The choice does not
establish successful child work.

Gap follows the existing declared blocked/unresolved C outcome route, never a
success or implicit alternative. Failure/hold retain ordinary propagation.
Parent success follows its own result/closure contract. Later recursive selection
is ordinary invocation of this graph with a new admitted input and existing
recursion bounds/foldback; one-decision selection does not require recursion.

## Purpose and actual F_P context

Selected definitions declare nonempty
`declarations["abg.functional_purpose"]` and
`declarations["abg.conditions_for_use"]`; their containing exact definitions
link that text to published input/result/effect contracts. Reuse catalogue lookup
and definition digests. Check presence without interpreting prose as a predicate.
Missing suitable capability or required support produces a gap.

Existing instruction assembly supplies the native selector's declared Executive
frame, task, exact permitted purposes/contracts, observations, policy/criteria,
evidence, response schema and access envelope. Assembly cannot choose an answer
or invent a frame. Retain actual prompt/manifest, input and raw response. S2's
finite F_D rule proves mechanics; S3 separately proves real F_P context usability
and admission. No future library or prompt implementation is designed here.

## Exact change owners

| Owner | Bounded change |
|---|---|
| `gtl/contracts.ts`, `gtl/graph_applications.ts`, `gtl/declaration_references.ts`, applicable canonical/raw schema owner and `validator/validation.ts` | Add the application and exact source/evaluator/policy/edge/interface checks. ConstructionComposition, Gate and C terms retain meaning. |
| `gtl/source_path.ts`, `hog/route_proposal.ts`, `hog/ccall_lifecycle.ts` | One target/input-resolution relation and proposal plumbing; ordinary continuation remains outside its declared source/result contract. |
| `abg/traversal_route.ts` and existing route projection/rehydration consumers | Authenticate and persist the minimal binding in the existing route, including source result and child input. No separate event/state family. |
| `hog/workflow_lifecycle.ts`, `hog/child_traversal.ts`, `abg/execution_basis.ts` where current input handoff requires it | Reacquire admitted generic binding, retain exact callee/input guards and use ordinary child preparation. Preserve construction-specific semantics. |
| Existing publication/result-contract owner and small external fixture | Shared choice/gap contract, declared finite selector policy, purpose and distinct A/B definitions. No One Surface prerequisites. |

The implementation grant must name required generated schema/manifest outputs.
Any new Product semantics, C algebra, event lifecycle or arbitrary contract
coercion returns to Executive. There is no unresolved Product question required
to start this bounded realization after acceptance.

## Installed discriminator

One tiny external Product publishes selector, A and B with common interfaces and
different result markers. Its total F_D rule selects A or B from a finite mode
and returns gap for missing support. Its root has no ConstructionComposition,
action catalogue, obligation ledger or model/gap/refresh nodes. That absence is
part of the discriminator, not a documentation-only claim.

Reuse external publication/readiness from
`test_env/support/developer-mini-product.mjs`, installed Public execution from
`test_env/support/root-cli-environment.mjs`, and ordinary child-result/readback
joins from the installed external Product/consensus tests. Build once/pack once
under the next grant; use `candidateBasisSource: "packed_artifact"` and frozen
artifact/install support. Direct HoG/private owner hooks prove only integration.

Fresh A and B runs of the same frozen Program must admit the choice before
opening exactly the selected child, bind actual definition/input, return the
correct marker through ordinary workflow foldback, close under the parent
contract and agree with fresh-process Public result/replay. Installed refusal
cases propose registered but nonpermitted C and a wrong definition/input contract;
neither may open its child. Explicit gap remains unresolved without an alternative
launch. Focused owner cases cover ambiguous target, stale identity/input, missing
support, altered basis and callee substitution. Include the negative applicability
case: choice-looking data at an undeclared locus remains ordinary data.

Retain source/archive/install identities, transcripts, event bytes/hashes, first
refusals and fresh readbacks before scratch cleanup. These claims do not close
semantic suitability, changed-evidence recursion, PC05-11, qualification or RC.
No source, test, build, install or provider effects occurred in this correction.
