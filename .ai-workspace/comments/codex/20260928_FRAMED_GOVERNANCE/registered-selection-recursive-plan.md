# T287_REGISTERED_SELECTION_RECURSIVE_DESIGN_01

Proposal only; no implementation or native execution selected. Authority is
execution.md#s3-frozen-review-and-s4-next-seam-design, current Product's Framed
Evaluation And Graph Consequence and Recursive Programs, RECURSE-001–008 and
GRAPHFUNCTION-REFINEMENT-003, under Product/Design/Owner/end-to-end integration.
S3 remains frozen under independent review. This proposal adds no Product law.

Select a fixture-only composition. One Public start enters a parent acceptance
evaluator with a declared `recurse(selectionStep, termination, foldback)`.
`selectionStep` is the existing native registered-selection graph with one
ordinary F_D input projection before its F_P selector. Its two fixed workflow
children render and actually check a receiver's response contract. A measured
rejection returns as counterevidence; the parent evaluates it, remains unresolved,
and invokes the same selection graph again with that evidence. The second native
choice may change to B. Only a subsequent parent evaluation can close the run.

```text
Public start -> parent evaluate #1 (not terminal)
  -> selectionStep: project current state -> native choice A
     -> A render + receiver check -> closed measured rejection
  -> recursive foldback -> parent evaluate #2 (still not terminal)
  -> selectionStep: project changed state -> native choice B
     -> B render + receiver check -> closed accepted output
  -> recursive foldback -> parent evaluate #3 -> parent closure
```

This sequence is the prospective oracle, never a declared A-then-B schedule.
Both native calls retain the same permitted A/B domain, purpose contracts and
raw-choice/result conservation. HoG decides traversal from admitted results;
the caller issues one start and later read-only result/replay requests.

## Concrete fixture and state

Use an effect-free, prospectively fixed in-memory receiver decoder. The original
task requires delivery of the supplied record in a representation that this
receiver accepts without changing fields or values. A qualified initial
observation says the receiver's documentation advertises JSON, but no actual
acceptance has yet been measured. A renders compact JSON and checks it; B renders
labelled lines and checks them. The independent receiver implementation accepts
labelled lines and rejects JSON with an actual parse/format diagnostic. The
first native choice is expected to follow the provisional JSON evidence; after
A's real rejection, the next choice is expected to use B's relevant purpose.
Neither the input nor prompt contains expected graph identity, next-choice hints
or an attempt-number-to-graph rule. An unexpected native choice stops the proof;
the fixture/oracle is not rewritten around it.

The receiver is a small controlled software fixture, not an external service or
workspace-currentness claim. The probe actually consumes the rendered bytes;
its rejection is not a hardcoded fabricated transcript. Define its decoder,
expected record and initial documentation discrepancy before running the case.

Publish one `recursive_selection_state` input/output contract containing the
unchanged original task and record, its identity, required-support references,
qualified observations, retained attempt measurements, unresolved support and
`terminal`. The state is ordinary declared data, not a new obligation calculus.
Every renderer's result relation preserves original task/support and prior
measurements, appends only its actual render/check outcome and leaves
`terminal:false` and parent obligations intact. Parent evaluation validates that
measurement, preserves the original task, and sets terminal only when the
explicit receiver acceptance and exact record-equality requirements hold.
A successful measurement computation with `accepted:false` may close its child
contract; it does not satisfy the user's task. A runtime failure, malformed
return or genuinely blocked child retains the current failure/block route.

The new F_D `prepareSelectionTask` leaf copies current state into the existing
strict S3 task profile: original task, qualified current/returned observations,
requiredSupportRefs and one unchanged common childInput of the state contract.
It neither selects a graph nor ranks suitability. Each observation reference
names its bounded measurement; the task's existing admitted input reference/
digest and preceding child-result/foldback/parent-result chain establish origin.
Do not invent ABG event references inside a result produced before admission.
No full event history or catalogue readiness body enters native context.
Missing required state, measurement or support identity refuses at the declared
input/projection relation before another actor; absent suitable capability is
still the native gap arm.

## Existing owning relations and exact declarations

| Owner | Reuse and fixture declaration |
|---|---|
| `gtl/graph_applications.ts:126,156` | Existing recurse constructor and boolean termination-field projection. Publish one F_D evaluator/rule over `$.terminal`; foldback `{mode:"rebind",binding:"$",requiresParentEvaluation:true}`. Both application contracts are the state contract. |
| `gtl/recursion.ts` | Reuse its declaration pattern, not its specialized remaining-counter type or implementation. Bound **3** means at most two recursive selectionStep children and three parent evaluations: `attempt >= bound` blocks before another child. |
| `hog/recursion_lifecycle.ts:547,683` | Existing child preparation uses the admitted parent evaluator result; completed child supplies whole-state rebind. A closed child creates a next-attempt cursor at the same parent evaluator. |
| `abg/graph_application.ts:769` and `abg/traversal_route.ts:3919` | Admit exact application, parent/child basis, result, judgment and causal foldback; reentry consumes childResultRef/outputDigest and increments the bounded parent attempt. |
| `abg/execution_basis.ts:198` | Native assembly authenticates the **current cursor input**, allowing an ordinary preceding F_D projection rather than requiring graph-entry native-task input. |
| S3 target/assembly/actor/result owners | Reuse unchanged at the declared selector locus; its source need not be the graph's start node. Same strict binder, child input and exact fixed-callee guard. |

Keep S3's selector GraphFunction identity/role binding as `root`, add an outer
`recursive-parent`, and change this new fixture Program's sole start to that
parent. The existing Public helper resolves the Program start; it does not choose
a subsequent graph. Membership contains only parent, selectionStep/root, A and B.
The selector graph now accepts/returns state, while its internal projection
outputs the native-task contract and its F_P leaf outputs the choice contract.
A/B workflow loci and callees accept/return state. Give selector/A/B graph-call
closure contracts and the parent the run closure contract. Ordinary templates,
implementation bindings, output predicates and exact native run-environment
resources remain published through the existing fixture loader.

## Small implementation territory and proof

No production change is presently indicated. Missing relations are consumer
contracts and leaves: parent acceptance evaluation, state-to-native-task
projection, actual receiver measurements and preservation predicates. Implement
these in a new small recursive fixture and focused test, parameterizing the
existing fixture loader only if necessary. Reuse current
`root-installed-environment.mjs` and registered-selection Public support; the
historical `m5-installed-recursion.test.mjs` supplies useful assertions but its
obsolete Public harness must not be restored. Do not edit frozen S3 fixture or
proof bytes in a later implementation without a separately selected successor.

Prospective positive proof: one frozen installed archive/consumer, one Public
start, two real Opus 5.5/xhigh calls. Retain A's actual rejection in the second
owned prompt, raw/admitted A then B choices, exact unchanged task/support and
parent authority lineage, two workflow and two recursive foldbacks, parent
attempts 1/2/3 in one parent frame, and run closure only after evaluator #3.
Retain fresh installed Public result/replay agreement and timings/context sizes.
Controlled mechanical negatives cover malformed/missing counterevidence,
branch-inappropriate or out-of-domain choice, exhausted recursion bound, and
attempted parent closure before its reevaluation. Reuse S2/S3 checks where the
owner relation is unchanged; do not add a provider reliability campaign.

The current source supports the structural path, but native context inheritance
into the recursive child and the non-entry projection-to-selector composition
remain installation discriminators, not already executed proof. Any missing
owner relation exposed there returns to Executive before production edits.
No further Product decision is required for this bounded fixture proposal;
S4 implementation/live authority and S3 disposition remain Executive decisions.
No default-library expansion, generic Executive competence or recursion release
qualification is claimed.

Read-subject SHA-256 identities (no tests/builds/providers were run):

- `specification/PRODUCT.md`: `179ee0e82b4617e4bb40bba0fb91200ada684e94592bf9dc61812fab365aa7a1`
- `specification/requirements/gtl/REQ-L-GTL3-RECURSE.md`: `448addbc9f1b94f9b19be063c7068a59ed6b1f2d7fa3c222413ee450d371883c`
- `specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION-REFINEMENT.md`: `212283db05bab5ecf94f5bd92eb2ff81c478476a62228c07771b3eb865ba4606`
- `build_tenants/abiogenesis/typescript/code/src/gtl/graph_applications.ts`: `bb578aa145aee5f0a43823d0b6271392c5750bd3d53adde4aeb8bb6eb0dc874b`
- `build_tenants/abiogenesis/typescript/code/src/hog/recursion_lifecycle.ts`: `7fb2656e927ade4159c4dc18eed6d6e4139e48d4791f85177912b7879fb697c2`
- `build_tenants/abiogenesis/typescript/code/src/abg/graph_application.ts`: `a85834c84e94aff4092c6228a341c6ec56134eb210433e0d2c40b6778bd1f460`
- `build_tenants/abiogenesis/typescript/code/src/abg/traversal_route.ts`: `9b9244ddabba8a6c805a6fd46cbfa7515855efb7c5d56a1f3e359a4e904e709b`
- `build_tenants/abiogenesis/typescript/code/src/abg/execution_basis.ts`: `daef2ec655bb7f2cbf6b174c0342a43030daf65a325205f5cdd0b95ab0c2dae5`
- `build_tenants/abiogenesis/typescript/code/src/gtl/registered_selection.ts`: `32f44f7aba5d77ab5255f29b2300cafcae202fed3eb27f5ad46ff6dbc2e6fdbd`
- `build_tenants/abiogenesis/typescript/code/src/product/registered_selection_native.ts`: `2e4413c1431f1abdd6d19e267364196b0a0986628976829e00aab04da987f280`
- `build_tenants/abiogenesis/typescript/test_env/support/registered-graph-selection.mjs`: `702ce6f5b2468ed5daccdaa6f2730bca65d4279a996783bbf47ce1a59a53efc2`
- `build_tenants/abiogenesis/typescript/test_env/support/native-registered-selection.mjs`: `c2deb44c845503ea893c6803c2c7d7bc1079e8dbcd05d215a0f2fa9f85901195`
