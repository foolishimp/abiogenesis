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

## Exact Pending-Execution Resumption

Exact current_intent remains a distinct unimplemented and unqualified operation.
CONTINUATION-011/-015/-016 and the EC derivation retain its conservation
obligations: exact causal input/position, original work versus current operation
authority, consumed limits, phase/effect uncertainty, original producer identity,
required parent returns/evaluation, duplicate and partial progression. A terminal
predecessor stays terminal; resource acquisition alone grants no traversal.
A completed child must not be rerun solely to recreate a missing return boundary.

This HOW selects no future Continuation event family, currentIntent reference
alternative, retained-evaluator/child variant, parent-restoration construction or
transaction arrangement. Those earlier prescriptive candidates are removed under
S7-PC01. They are not prerequisites for fresh workspace work. No export, source
basis or held parent object alone qualifies exact resumption, and the fresh-work
increment supplies no acceptance credit for that remaining operation.

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
Exact execution resumption remains unimplemented and unqualified.
