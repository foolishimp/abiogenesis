# T-287 Continued Work And Exact Execution Resumption

**Status**: Accepted HOW with S7-PC01 contraction; bounded retained-work
implementation selected by T287_S7_RETAINED_WORK_IMPLEMENT_01. Replaces the
overbroad pending-consumer implementation plan,
not CONTINUATION-015 or the existing Product foundation.
**Authority**: Product Execution And Context Calculus; CONTINUATION-011/-012/-013/
-014/-015/-016; RUN-002/-005/-008; PROJECTION-002/-004/-025/-026; EVENTS-018/-024/
-027/-031; ITERATION-004/-008/-010. The EC derivation owns the complete phase,
effect and exact-resumption semantics; this file owns source correspondence.
**Source basis**: `b90249e0d18a4c7040711167eabbc676f24b0b59`, core
`1722953b7391e593079e3436b729b13c55457c734fb441d5e08b604edf9c462d`.
Seven later unbuilt drafts were retired by exact preimage match; their preserved
snapshot remains evidence, not accepted realization.

## Governing Distinction

The framework records admitted history and derives traversal state. It does not
own a second persistent application state beside the mutable workspace. Selected
specification/requirements define the ideal; bounded observations and admitted
judgments establish the current relation to it. A fresh Run can make new progress
on the same task/obligations without rebuilding a failed Run's scopes/parents.
An explicitly selected `current_intent` operation is different: it must restore
the exact pending execution under CONTINUATION-015, including its unfinished
returns. Neither operation can impersonate the other.

Product already declares this foundation and optional composition. One Surface's
model/gap/next-action/action authorities and the default library's framed
synthesis/registered selection both run on HoG. No feature aggregate, universal
ConstructionComposition, exhaustive workspace model, new planner or telemetry
implementation is needed. Existing fulfillment declarations bind requirements,
obligation refs, policies and evidence roles; immutable coverage states are
Results/projections, not a cross-Run application database.

## Ordinary Fresh Work And Retained Evidence

The source Result is evidence of prior work, never a workspace snapshot to
restore. Fresh observation binds current physical reality and relevant
intervening actions, admitted obligations and uncertainty. An actual bounded
rollback (for example an already-supported transaction rollback) retains its
existing scope and meaning; this increment adds no Git/transaction recovery.
Restoring versioned file contents or compensation, when selected, is a new
workspace action, not erasure of admitted history.

Normal supplied-work fresh invocation is already proven by S5: files can be
observed/tested/assessed without inventing an author or replaying a prior stack.
That does not prove generic cross-Run reuse of admitted Result evidence.

At the frozen source, `product/default_library.ts:73–78` constructs empty initial
observations/coverage. `abg/default_library.ts:28–42` accepts only that initial
shape, and `result():58–62` restricts Result lookup to the current Run. Those are
real boundary restrictions. Do not bypass them by passing a user-authored populated
state, deleting all source guards or claiming that file equality proves old
Result ownership. Conversely, they are not a reason to construct old parents.

The smallest missing relation for ordinary cross-Run use is **a selected prior
admitted library state Result -> current invocation input/evidence use**. Reuse
the existing Product invocation `sourceResultBasis` admission and retained-input
ownership instead of a new continuation, import ledger or recovery adapter.
`invocation_admission.ts:1324–1367` already requires the selected source Result,
its public projection authority and the exact rederived source basis together.
That is the owning cold ingress. Its public derivation at lines 406–526 requires
a judged/advance Result **and a closed Run** (line 475). A valid intermediate
Result in a later failed Run therefore cannot enter this path today. The existing
internal C2 helper's `requireClosedRun: false` route is not Public permission.
The minimum extension is a declared source-use admission for a successfully
admitted/judged intermediate library state Result from an inactive failed/stopped
Run, with its exact invocation/Result/Judgment and prefix provenance. Preserve
existing closed-Run cases. Refuse active/unknown predecessor execution, malformed
source facts, unbound dependencies or unauthorized use. Run-level failure alone
neither invalidates every earlier Result nor attests absence of later effects;
currentness must include the actual later effect/observation frontier for the
selected dependencies. This follows Product's existing reusable(a), rather than
changing a failed Run into a closed-success source. Reusing this owner is a
design decision implemented by the bounded retained-work increment. Exact
source/input correspondence is admitted once; downstream guards consume that
relation while mutable currentness and independent judgment remain required.

The selected source is one actual admitted `GovernanceWorkState` Result after
producer fold (or a lawful later state), not a reconstructed whole history. It
already names original task/obligations, additions, observations and source
Results. At cold admission, derive the current input from that exact source:

1. Conserve original task, source identities, required/admitted obligations and
   their declarations. Retain exact source Result/call/actor/evidence identities.
   Reject altered originals, missing/foreign Result references or ungrounded
   caller-supplied coverage. Prior semantic judgments remain attributed history.
2. Establish the new invocation's actual work authority and its permitted use of
   the prior evidence under the same immutable basis or required explicit cover.
   An old invoke grant is provenance, not the new operation's permission.
3. Acquire only required current mutable observations. Apply existing
   `reusable(a)` to the selected claim/dependencies and current use. Unchanged
   producer dependencies remain valid when an unrelated assessment document is
   supplied; that document is separately acquired/bound for assessment. Unknown
   or stale dependent support stays open. Preserve historic adverse evidence as
   historic, never retarget it to current output proof.
4. Enter the new graph normally with a nonterminal current projection. Retained
   synthesis is prior judgment, not a current next-choice instruction; current
   framed evaluation selects graph work. Reuse eligible old assessment support
   only where its declared scope/currentness/independence remains sufficient.
   No old terminal flag grants new closure and no reset discards admitted new
   obligations. Current parent evaluation applies its declared completion rule.

Extend the existing authenticated input-origin/source-use projection to carry
this established admission internally, not a copied evidence packet. Library
source/fulfillment/native/C2/assessment guards consume that same relation only
when its declaration applies; ordinary fresh input retains current strictness.
`abg/default_library.ts` joins are `owner`, `result`, `subjectEvidence`,
`projectGovernanceFold`, and `projectGovernanceParent`. Their current-Run checks
must become current-owned-or-explicit-admitted-source-use checks, preserving
exact call/actor/contract/subject and independence checks. The unchanged result,
route, child and parent owners still produce all new runtime facts. Warm calls
must not rederive the history or rehash established declarations.

Carry the selected source basis through the existing invocation/input admission;
no new event kind is proposed for ordinary evidence use. The actual extension
must preserve its published payload contract/validation and source projection
correspondence. The event's current Run scope and payload references remain distinct. Selecting a prior Result for evidence does
not reopen its Run or consume a `current_intent` continuation. New admission is
idempotent under the existing operation/invocation key; deliberate later Runs
remain separate bounded attempts. Applicable lineage/policy limits still apply;
a caller cannot relabel an exact retry as fresh work merely to reset a bound.

## Exact ConstructionIntent Continuation: Selected Bounded Realization

`T287_S7_EXACT_INTENT_IMPLEMENT_01` selects the existing five-reference
`run.continue/current_intent` contract. It neither admits another intent nor
turns a fresh invocation into recovery. The original `construction_intent_selected`
Result/route and immutable invocation/work authority remain authoritative. A new
continue operation has its own exact definition, actor, workspace and capability
grant. Possession of the old invoke grant alone is insufficient.

The first supported frontier is a sequential action GraphFunction under the
One Surface root's fixed workflow call. An earlier producer has an admitted
successful Result and advancing route; the later F_P consumer has an admitted
`undispatched_owner_observation` and totalized failed Result. Its owning leaf port
explicitly records `effectDisposition = not_dispatched`. A diagnostic, F_D throw,
failed Result, absence of success, or graph/locus name is not this fact. The
continuation owns the consumer obligation, not another invocation of the producer.
Nested retry, fanout, recursion, dispatched/unknown effects, and producer support
whose current applicability cannot be established are refused by this bounded
realization. This is not a general safe-to-repeat rule.

The continuation projection binds the original Run/failure event, original
ConstructionIntent admission, pending CCall/cursor and exact progressed input.
The existing event prefix and declaration/cursor owners establish every join;
there is no saved runtime stack, graph snapshot or second evidence store. A
failed Run remains failed. Cold acquisition reconstructs the selected relation
once; established immutable relations pass through ordinary warm handoffs.

A successful continue admission consumes that exact pending frontier before
traversal. The existing continuation reentry owner records the old/new Run link
and current operation, with historical coordinates in checked payload bindings,
never cross-Run envelope causation. Duplicate operation or already-consumed
frontier returns its actual disposition without another dispatch. The replacement
has new Run-local scope/call/cursor identities, retains the original invocation
and work grant, and explicitly binds its use of the original intent. No new
`InvocationAuthority` alternative or `construction_intent_selected` event is
created. The old continuation is superseded; the new Run's unresolved remainder
has its own identity and ordinary completion/failure disposition. The new operation and execution-basis claim are admitted together before scopes are opened; that claim prevents a partial setup from being consumed again. Transfer of the old opening to the new continuation is one event-owner transaction after current scopes exist. The new continuation resolves only when the current action evaluation admits its construction delta; required refresh and ordinary Run closure still follow.

For this selected shape there is one actual workflow parent. Existing basis and
scope owners admit its current counterpart; cursor admission binds its original
selected workflow coordinate and input; ordinary `openCCall` establishes a
current waiting parent. The child basis retains its graph-entry input but its
resume cursor uses the exact progressed producer Result/input. These values are
distinct. HoG resumes the child there, uses the normal child fold, evaluates the
One Surface action and remaining declared parent stages, and closes only under
those current predicates. Original intent provenance is joined to current use;
no historical evaluator Result is relabelled as a new CCall Result.

The fixed child's GraphCall closure remains bound to its actual output contract.
For the declared One Surface workflow locus, the parent's output is instead the
existing owner-derived action-evaluation basis. One shared opening relation checks
this distinction at HoG and ABG: exact declared composition and admitted intent,
fixed callee, actual child closure/output, and the immediately following declared
action evaluator's input. Absent that declaration/intent relation, ordinary
workflows require child-output/parent-output equality. Existing foldback and
action-basis derivation bind the actual admitted child Result, judgment and closure;
no child result is relabelled. Replay conserves the existing separate
`childOutputDigest` and parent `outputDigest` evidence fields against their own
foldback and Result, respectively. Workflow output lookup and validation consume
the exact declared contract by reference; the leaf-only implementation-output
slot restriction remains on leaf outcomes, since no leaf emits the derived basis.

The current admitted delta resolves the continued obligation by terminating its
existing `continuation_open` fluent; no extra persistent resolved fluent is
introduced. Run semantic replay keeps current-Run event atoms and envelope
causation scoped. Only the delta's exact historical original-intent reference,
authenticated by the already-admitted continuation use and its current parent,
is retained as an external owner fact. It is neither imported as a local event
nor accepted as cross-Run envelope causation. Other historical typed references
still refuse. Closure and cold Public reads consume this same replay relation.

The same immutable Program/catalog/workspace authority is required. Current
preparation reacquires its own required mutable inputs. Producer support must
remain admitted and applicable; immutable pure support is conserved unchanged,
while stale or unsupported mutable support refuses before dispatch. The selected
finite discriminator uses the existing typed undispatched boundary, not the
default library's distinct F_D missing-document mechanism. Attempt/term/retry
coordinates and consumed allowances are conserved; unsupported bounded-composite
phases refuse rather than reset their budget.

The Public adapter acquires the exact existing installed declarations and event
resource, authenticates the five references and current-operation grant, then
uses the owning continuation admission and HoG entry. It cannot select graph
work, reconstruct authority from prompt fields, skip the pending consumer, or
substitute initial input. Fresh cold Result/replay use the admitted link and
normal closure facts. This HOW specifies the selected correspondence; mechanical
and installed proof remain separate qualification obligations.

## Scope, Contraction And Evidence

The strongest contraction is to remove pending preparation declarations, new
Continuation lifecycle, replacement cursors, retained evaluator use and parent
rehydration from **ordinary fresh-work** implementation scope. These are neither
normal feature progress nor generic evidence reuse. The selected implementation
restores the five tracked draft paths to the exact pre-draft basis and removes
only the two named draft-only modules after matching the preserved snapshot.
Their evidence remains immutable; none is a foundation to complete by momentum.

The prior one producer -> missing assessment-only input -> supply that input
case can distinguish the two operations without rerunning a full lifecycle:
for normal progress, close the first failed Run, then perform a newly authorized
fresh invocation with the exact selected retained state/evidence and current
workspace. F_P selects lawful needed work; same producer Result/call/actor remain
historical support, no author replay, and new consumer/current parents close
normally with two cold Public reads. This is **fresh continued-work evidence**,
not execution-recovery credit. If Executive instead selects exact current_intent,
the same physical case must resume the pending position and discharge its old
return obligations through its complete conserved relation. Fresh success cannot qualify it.

Finite affected owner checks are phase distinctions (including totalized F_D
failure), exact source/input/authority refusal, changed producer dependencies
versus new assessment inputs, required independence, duplicate/partial admission
and normal fold/closure. Reuse accepted S5 supplied-work and S6 actual fulfillment
proof. No new provider campaign, generic reliability claim or broad test roster
is selected. The current grant covers local retained-work implementation and
mechanical readiness only; installed/native execution remains separately selected.
Exact execution resumption is selected for the bounded realization above; it remains unqualified until its actual-owner and installed evidence close.


## Selected Action At An Unconsumed Durable Boundary

The selected_action member consumes an actual admitted AF-14 selection, not a
catalogue label or lawful-actions read. Its run-local continuation identity binds
the selected route, original intent, exact target cursor and selected basis. A
pending occurrence has an active Run, that current cursor and no workflow CCall
consuming it. Cold acquisition proves this event relation; process interruption
only explains availability of the resource and does not establish pending truth.
Same-basis continuation keeps the current Run and its existing parents. A separately
admitted continue-operation grant consumes the occurrence once before ordinary
HoG enters the selected workflow. The already-admitted intent is conserved; its
actual child, evaluation and delta resolve the obligation. Ordinary in-process
traversal remains unchanged and can consume the same selection without Public
continuation. Completed, stopped, crossed or already consumed occurrences refuse.

Request-field correspondence is exact:

- run and continuation identify the originating unconsumed occurrence and native
  Run identity; selectedAction identifies the admitted NextActionProjection.
- For same_basis the selected occurrence is the originating occurrence. Current
  authority slots bind its ExecutionBasis, installed Program/catalog, original
  InvocationAdmission work authority and exact cursor input; a new selected_action
  operation capability authorizes this use.
- For authority_changed, selectedAction identifies a separately admitted *current*
  occurrence under its own current InvocationAdmission/work authority. The
  execution_basis/input/actor and other authority slots bind that current occurrence.
  coveringReprice is the actual witnessedAct ref/digest returned by the existing
  witness owner, covering the old ExecutionBasis and old/current WorkspaceBinding
  pair. The current selection follows the covering witness and explicitly names
  both the predecessor continuation and covering witness in its existing
  lawfulBasisRefs. It retains the same target outcome and all predecessor target
  obligations. Current GTL model/gap/evaluateNext have already established this
  selection under current authority; no semantic old-selection transfer occurs.
  A cover without that current applicable selection is a truthful refusal.
- Admission atomically records the current operation and consumes both the source
  occurrence and (if different) current occurrence. The source is superseded only
  by that admitted use; current HoG execution and evaluation resolve the current
  occurrence. No events, input values, old parent scopes or work grant are copied.

Reprice matching extracts the existing exact witnessed binding-cover predicate;
D2 keeps its additional same-WorkspaceAuthorityBasis restriction. Selected-action
use independently requires already admitted current work/operation authority and
fresh semantic selection, so a witnessed cover alone is never permission. No
request-domain, authority variant, event family, pause port or controller is added.
Post-disposition selection may use the existing declared bounded graph-span reentry
back through model/gap/evaluateNext; the eight-term construction stays unchanged.
The installed discriminator interrupts only its fixture host after the actual
selection/cursor transaction is durable, retains the complete prefix, then uses
existing physical resource recovery and cold Public continuation. Fixture injection
must not truncate history, invent failure truth or alter the model's answer.
