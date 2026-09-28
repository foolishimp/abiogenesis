# T-287 Registered Graph Selection

Status: proposed HOW, closed S1 Worker return; pending Executive disposition and
independent review. No implementation or execution acceptance is claimed.

## Basis and bounded outcome

Exact source/Product base: `e27f72bc2037130d3261694da40af0148269f142`.
Method: `stdo://releases/v2.5.1-rc.1/`, selected by `stdo_abiogenesis.json`;
Executive verified that immutable installation. Grant:
`.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/execution.md#s1-worker-grant-t287_registered_selection_design_01`.
Frames: accepted Product/Design/Owner and
`ABI5_PROJECT_REFERENCE_FRAME_BASIS.md#f-end-to-end-interface-integration`.

Owning WHAT: `specification/PRODUCT.md#graphfunction`,
`#framed-evaluation-and-graph-consequence`, and
`REQ-L-GTL3-SELECTION-BOUNDARY-016..019`. This increment makes a declared
evaluation choose between two already published GraphFunctions, admits that
choice, executes the chosen definition and returns its result to its parent.
Purpose supports suitability judgment; it grants no permission or satisfaction.
There is no external Executive loop, graph generation, new C generator,
catalogue authority, event writer or release claim. PC05-11 remains open.

## Current construction and the actual missing relation

Paths below are relative to `build_tenants/abiogenesis/typescript/`.

| Existing owner | Current behavior and implication |
|---|---|
| `code/src/gtl/contracts.ts:309` and `code/src/product/catalog.ts:20,294` | GraphFunction already has `declarations`, inputs, outputs and effects. Each catalogue entry retains the exact definition and digest. Purpose needs no parallel registry or catalogue schema. |
| `code/src/gtl/contracts.ts:393` and `code/src/validator/validation.ts:1590` | Program action rows already name a GraphFunction, Program, target and obligations; callable membership and target existence are checked. Rows can name different GraphFunctions. |
| `code/src/validator/validation.ts:100,1471` | Construction composition currently admits exactly one node with eight ordered terms and one `interactionProgramLocusRef`. This is a real singleton restriction. |
| `code/src/validator/validation.ts:1140` | A gate attaches its declared evaluator leaves to exactly one workflow target. It does not select among branch targets. |
| `code/src/gtl/source_path.ts:859` | Ordinary graph continuation requires exactly one outgoing edge. Adding two edges alone cannot execute a choice. |
| `code/src/hog/route_proposal.ts:550` | Outcome-dependent routes currently recognize graph-span re-entry and no-action stop. A selected `next_action_projection` takes ordinary continuation. |
| `code/src/abg/traversal_route.ts:1405,1532` | Admission joins the chosen row and actual target cursor, but additionally requires the one composition target to equal the workflow callee. Multiple rows do not establish multiple executable choices. |
| `code/src/hog/workflow_lifecycle.ts:396` | The exact selected input and fixed callee guard conserves an admitted choice at the reached workflow locus. Keep this guard. |
| `code/src/validator/validation.ts:1202` | Re-entry is a bounded earlier `c_of` locus in the same static span. It is not a forward branch to another workflow. |

The source-owner test `test_env/tests/t287-multi-candidate-admission.test.mjs`
uses controlled predecessor premises; its workflow candidates share one callee
and positive cases choose action A. It is useful refusal coverage, not installed
two-GraphFunction execution evidence. The installed consensus test near line
1955 supplies the useful single-choice causal chain through actual child result,
action evaluation and refreshed closure.

## One declared selection relation

Reuse `GtlConstructionComposition`, its four semantic authorities,
`GtlActionCatalog`, and existing graph edges. Add one narrowly bounded plural
form of the composition: `interactionProgramLocusRefs: readonly string[]`,
mutually exclusive with its existing singular `interactionProgramLocusRef`.
The plural form is nonempty, unique, canonically ordered and restricted to
`invoke_graph_function` rows. Its entries retain the existing convention:
each is the exact registered GraphFunction reference. It declares permitted
boundary targets, not a new catalogue. Existing singular F_H/workflow definitions
retain their existing validation and meaning.

For the plural form, validate this finite graph shape instead of pretending it
is the existing eight-term linear composition:

```text
synthesizeModel -> evalGap -> evaluateNext
                                | admitted action A -> workflow.C(A) |
                                | admitted action B -> workflow.C(B) |
                                +-----------------------------------+
                                                |
                                         evaluateAction
                                                |
                       refreshModel -> refreshGap -> refreshEvaluateNext
                                                |
                                  converged | explicit gap/stop
```

The two workflow nodes are separate fixed terms. `evaluateNext` is a complete
node, not an interior point in a compose/batch/retry term. Every selection edge
ends at one workflow node; every permitted row joins exactly one such target;
every target rejoins the same action-evaluation tail. The permitted rows, plural
target declaration, outgoing workflow targets and Program membership must agree.
Duplicate workflow loci for one selectable GraphFunction are refused in this
bounded form. This avoids inventing a separate callee-to-cursor identity scheme.
All nonselection nodes keep ordinary single-successor/terminal law.

All choices share the explicit outer workflow input/output contract. As in the
existing consensus composition, the workflow boundary carries the admitted
next-action projection and action-evaluation basis; its child receives the
digest-bound `targetInput` through existing construction-intent preparation.
The child must independently accept that input against its own published input
contract. The selected two-choice fixture uses the same child input contract
for both choices. It does not coerce different interfaces to fit.

One pure relation at the existing GTL source-path owner resolves:

```text
resolveRegisteredTarget(exact graph, exact composition, exact action rows,
                        source cursor, selected projection)
  -> one declared workflow source path and fixed GraphFunction | typed refusal
```

It verifies the source is the declared selection boundary, row/Program/target
identity, unique corresponding edge and workflow, and carrier joins. It does
not rank, infer applicability, create topology or read ambient state. HoG uses
this relation to propose the target after result and judgment admission. ABG
uses the same relation under its exact admitted basis to authenticate the
proposed target; two owners do not maintain two definitions of selection.
The returned target is transient derived data, not another runtime object.

Use existing `advance`, `construction_intent_selected` and
`traversal_route_admitted` truth. Route admission distinguishes this explicitly
declared selected continuation from ordinary continuation; it must not relax
`isDeclaredContinuationTarget` globally. The existing intent binds chosen row,
projection/basis digests, target cursor, target input, obligations and causal
result/judgment. The cursor continues to carry the admitted projection identity;
workflow preparation extracts the exact child input from the authenticated
intent. No branch can launch before intent/route admission.

This is a HOW extension realizing already required adaptive registered choice.
If review finds it needs a new Product route meaning, runtime family or wider
callable authority, return for constitutional re-entry instead of implementing
that interpretation.

## Purpose, frame, context and evaluator

The selected registered definitions declare nonempty
`declarations["abg.functional_purpose"]` and
`declarations["abg.conditions_for_use"]`. Their exact containing definition
links that text to its published inputs, outputs and effects. The catalogue
already exposes and hashes all those bytes. Validate presence and linkage for
the selected boundary; do not interpret arbitrary purpose prose as a predicate.
A wider library inventory is later S5 work, not permission to rewrite all
existing GraphFunctions in S2.

The declared preparation graph constructs one exact `next_action_basis` from:
the original outcome and outstanding obligations; current observations and
applicable admitted results; exact Program/action rows/catalogue-view identity;
each permitted definition digest, purpose, contracts and effect envelope;
selected frame/source/version, criteria and evidence; explicit policy and the
shared candidate input. This is a bounded projection of existing declarations
and admitted material. A missing required source/body/access relation produces
a gap. Catalogue presence is not permission; K(P) is the intersection of exact
view, Program membership and this declared boundary.

Selection is an ordinary `C.of` evaluation. S2 declares the total closed rule
`mode=A -> actionA; mode=B -> actionB; unsupported/missing support -> gap` over
an explicit finite input domain. Its Rule, Evaluator, binding and result contract
identify F_D. This tests routing; it does not prove semantic graph suitability.

For S3, bind the same selection locus to a real F_P evaluator. Its actual
instruction-assembly envelope supplies the selected Executive frame, task,
permitted catalogue purposes/contracts, observations, constraints, explicit
unknowns, reason/evidence requirements and output schema. Preserve the existing
startup/access, native response, admission and archive owners. Required
independent judgments and owner rulings remain separate graph work. Prompt
assembly cannot invent a frame, widen the catalogue or choose the answer.

S2 keeps the existing selected projection. Its `lawfulBasisRefs` identify the
exact prepared basis and closed rule: that basis includes published definition
digests, purpose, frame, observations, rule/criteria and the explicit reason
for each finite case. Thus its admitted result and chosen row are evidence of
which closed rule applied, without adding a second result family for this proof.

S3 must resolve the actual F_P result contract before native execution: selection
must carry its own reason and supporting evidence, exact definition/frame/subject
basis, criteria and residuals. Current admission requires
`deterministic_priority_projection`; F_P must not be disguised with that label.
Use the existing declared result-contract/ABG owners to bind an honest regime
and evidence carrier to the validated evaluator. Its precise schema is S3 work,
not selected S2 implementation. ABG checks eligible membership and obligations;
it never chooses the ranked head or establishes semantic correctness by shape.
The actor supplies its own choice and reason. Only declared mechanical
serialization/digest construction may follow; no response repair, invented
evidence or fallback to A is permitted. The target-resolution relation remains
the same for an admitted F_D or F_P choice.

## Child execution, foldback and changed evidence

HoG reaches `workflow.C(A)` or `workflow.C(B)` and retains the existing exact
callee/input guard. Reuse child declaration lookup, materialization, validation,
implementation resolution, child admission, ordinary HoG traversal, child
closure and workflow result/judgment. Reuse
`deriveGraphFunctionActionEvaluationBasis` to bind that actual child's admitted
result and closure to the selected intent. The common `evaluateAction` graph
evaluates those results, then refreshes model, gap and selection. Parent closure
still requires its declared evidence, obligations and post-evidence refresh;
child success does not imply parent success. Failure/hold/unresolved values keep
their normal parent propagation and cannot trigger the unchosen branch.

S2 proves A and B in separate fresh runs of the same immutable Program. S4's
changed-evidence case must subsequently prove a changed choice through ordinary
declared recursive invocation: preserve parent outcome/obligations and valid
results, pass an admitted changed observation into a fresh selection invocation,
then return its child result through existing recursion foldback and parent
evaluation. A finite declared bound/termination judgment still applies. This
design does not make the current post-evidence refresh silently jump backward
or claim that two separate S2 runs prove adaptive recursion. Existing recursion
declarations/owners remain the starting point; any failure of their actual
composition returns to the Executive before repair.

## Proposed owner changes and conserved checks

| Territory | Smallest selected change |
|---|---|
| `code/src/gtl/contracts.ts`, `gtl/canonicalization.ts`, `validator/validation.ts` and applicable raw-admission/schema owner | Exact plural composition arm and finite branch/join validation; purpose presence; existing action rows remain the permitted catalogue. Raw and generated contracts must agree. No C algebra change. |
| `code/src/gtl/source_path.ts`, `hog/route_proposal.ts`, `hog/ccall_lifecycle.ts` | One pure registered-target relation and plumbing of its exact immutable inputs; derive the selected successor instead of ordinary linear continuation only at the declared boundary. |
| `code/src/abg/traversal_route.ts` | Admit that same target relation; preserve all current basis, workspace, input, obligations, row, source result/judgment and cursor checks. Replace singleton equality only inside the new plural arm. S2 retains the F_D result carrier; S3 owns its later F_P evidence/regime adaptation. |
| Existing declaration/result-contract owner for the registered fixture/library | Publish purpose, finite policy, selector/child/assessment contracts and implementations. Reuse existing contract publication and native evaluator seams, never a runtime registry of purposes. |
| `code/src/abg/execution_basis.ts` if its typed singular access requires adaptation | Conserve exact composition serialization/rehydration and distinction between the unchanged F_H locus and the new plural workflow relation. No wider child scope. |
| `test_env/` selected owner/installed test and small external Product fixture | Distinct fixed A/B declarations and decisive installed assertions below. Reuse harness/readiness/readback support. |

`workflow_lifecycle.ts` is a conserved guard/foldback owner, not the proposed
selector repair. Child basis, catalogue, Public/SDK/CLI, event calculus and
recursion need no new semantic authority. If implementation discovers required
changes there, identify the exact failed relation before enlarging its grant.
Build-generated manifest/schema changes must be named in the implementation
grant and reviewed with the same source cut.

## Smallest installed discriminator

Create one tiny external Product with a root selection GraphFunction, distinct
published A/B children, shared input/result contracts, closed F_D selector and
ordinary action assessment/refresh. Each child returns a distinct admitted
marker; the initial outcome and obligations are independently fixed. Neither
runtime code nor a built-in Hello declaration contains the fixture's answer.

Reuse `test_env/support/developer-mini-product.mjs` for external publication,
descriptor/install/readiness construction, and
`test_env/support/root-cli-environment.mjs` for installed Public invocation and
fresh projection reads. `setupInstalledCliHarness` with
`candidateBasisSource: "packed_artifact"` supports one frozen artifact/install;
its frozen-artifact option avoids repeated packing. The existing external
Product test demonstrates the external owner chain; installed consensus near
lines 1955–2015 demonstrates intent -> selected child -> delta -> refresh ->
closure assertions. Direct `admitted-graph-execution.mjs` is integration-only
and cannot replace this Public entry proof.

After authorized implementation: build once, freeze source/generated outputs,
pack once, retain archive SHA-256 and installed file identities, and create the
two fresh A/B runs through the actual installed Public start. Reopen from each
closed authority in a fresh process for result/replay. Retain transcripts,
event bytes and hashes durably before harness cleanup; scratch-only assertions
are not the return artifact. No source import/private-owner export hook may
serve as the installed subject.

The finite test population is:

1. A and B: same Program/catalogue, differing declared observation; each has
   exactly its selected child opened, actual selected definition/input joined,
   returned marker, ordinary child/workflow foldback, action evaluation,
   refreshed parent closure, and agreeing fresh Public result/replay.
2. Out-of-scope choice: fixture's evaluator proposes registered C, which is
   absent from the boundary (and separately absent from Program/view as
   applicable). Admission refuses before C opens; purpose text cannot grant it.
3. Contract/identity failure: mismatched selected GraphFunction/row or bad
   target-input digest/child contract refuses before child execution; retain the
   first owner diagnostic and existing truthful failed/blocked result.
4. Missing suitability/support: explicit no-action gap; no child open and no
   success closure. Nonempty rankings or unbound obligations remain refusals.

Owner tests should cover the target-relation counterexamples cheaply; installed
cases must still exercise both lawful choices and at least scope and contract
refusal through the real boundary. Do not expand this into a full campaign.
No native actor, install, build, test or provider call occurred in S1.

## Executive decisions and stops

Approve or reprice the proposed plural composition before source work. Exact
exported helper names and placement remain Worker
choices; target, input, provenance and refusal laws above do not. S3 must bind
the actual frame/policy/model/access set and independent suitability oracle;
S4 must prospectively bind its changed observation and recursion stop. Those
later subjects are intentionally unselected here. Stop on changed Product
meaning, any need for a new C term or external selector, ambiguous target/input
join, or inability of either branch to reach ordinary parent foldback.
