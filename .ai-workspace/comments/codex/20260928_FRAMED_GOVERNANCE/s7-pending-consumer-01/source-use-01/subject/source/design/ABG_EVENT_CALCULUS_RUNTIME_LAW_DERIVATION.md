# ABG Event Calculus Runtime Law Derivation

**Status**: Active
**Date**: 2026-05-06
**Tickets**: T-120, T-119

## Claim

ABG runtime truth is declared as Event Calculus law over admitted events.
Projection read models consume that law; they do not own separate semantic
transition authority.

## Boundary

- `Happens(e)` is an admitted `RuntimeEvent`.
- `Initiates`, `Terminates`, clipping, and declipping are declared in the M03
  Event Calculus axiom table.
- `HoldsAt(f)` is derived by replay.
- Projection modules may sort, summarize, and expose read models over derived
  fluents.
- Product policy and provider state do not create runtime truth unless ABG
  admits an event.

## First Slice

The first declared event set covers basis, graph call, frame, vector plan,
vector evaluation, vector closure, retry repair, continuation repair, reset,
and the temporal timer/scheduled-continuation extension needed by T-119.

The aggregate projection now checks vector closure through the declared EC
effect for `vector_closed` before applying its existing ordering law.

## Non-Authority

The EC layer is not a controller. It derives fluent truth from event truth.
ABG iteration still decides traversal advancement and closure through the
existing runtime decision path.


## Task, Workspace And Run Correspondence

This derivation uses Product's existing `T/P/B/S/W/L` subjects. The selected
specification/requirements own the ideal outcome. `W` owns mutable application
state; ABG history owns admitted attempts, observations, judgments and provenance.
`S` is an immutable successor projection over the admitted prefix (maintained
incrementally while live), not another persistent application authority. A
bounded graph traversal observes and affects a dependency-selected part of an
open-ended workspace through its declared overlays, frames and effect owners.
No complete world model, FeatureVector aggregate or global feature lifecycle is
introduced. A feature/obligation may be pursued through arbitrarily many bounded
Runs; that does not make one Run or its retry/recursion allowance unbounded.

The existing default-library fulfillment specialization supplies obligation refs,
requirement bindings, source-grounded additions and coverage. Its
`eligible/open/stale` projection is not identical to a semantic
`satisfied/falsified/indeterminate` judgment. Applicability, dependency validity
and declared policy completeness constrain reliance; F_P supplies semantic
sufficiency wherever no total rule is declared. Failure of a Run and satisfaction
of its selected outcome are independent. A later admitted judgment can establish
current satisfaction without rewriting any failed historical Run.

## Two Operations, One History

| Selected operation | Existing law | Execution consequence |
|---|---|---|
| New graph work toward the same outcome | CONTINUATION-012/-013, Product framed evaluation, One Surface or the actually selected library composition | New bounded invocation/Run, current observations and applicable retained evidence; fresh declared evaluation selects work. New calls have their own parents and normal HoG foldback. Old call-stack restoration is unnecessary. |
| Resume an exact admitted pending execution | CONTINUATION-011/-015/-016 | Preserve the selected position, progressed input, remaining return obligations, original work authority and consumed allowances. A terminal predecessor stays terminal; any linked replacement needs the explicit use/restoration relation below. |

`evaluateNext -> admitConstructionIntent -> invokeGraphFunction` is the existing
One Surface relation. Its construction-specific carriers apply where that
composition is selected; they are not silently imposed on the default library
or every GTL Program. The latter use their admitted evaluation, registered-choice
and call owners under Product. Public ingress never substitutes for semantic
next-work selection. Reuse of the same obligation ref is not a request to resume
an earlier execution, and a fresh start cannot impersonate that request.

CONTINUATION-015 is not weakened: it governs the second row. The earlier HOW
mistakenly made that row the universal prerequisite for continued progress.
Neither row authorizes a caller to copy old runtime events, claim old success as
new execution, reset applicable bounds or erase an unresolved obligation.

## Complete Phase Projection

At each committed prefix, derive the following from existing admissions, calls,
Results/Judgments, routes, cursor/input origins, child/parent bindings, effect
facts, Run/Continuation lifecycle and their declarations. These are relations,
not a new serialized state carrier or private stack.

| Actual admitted frontier | Derived pending relation and state effect | Admissible consequence under existing owners |
|---|---|---|
| Declared handoff/selected position, no consumer call | Consumer position with its causal current input; retain separate graph-entry input | Open/prepare the declared call under current authority, or gap/refuse if required material is unavailable |
| Preparation attempted, no admitted consumer task | Preparation remains unfinished; retain actual failed Result if one was admitted and the exact source/cursor | No blanket retry. Only an explicitly selected continuation with changed failed support or an applicable declared correction/allowance may reprepare; otherwise new semantic work, block or unknown |
| Admitted task, consumer proven undispatched | Consumer dispatch pending; task/effect dependencies remain relevant | Refresh changed required mutable inputs through the owner; then only an eligible authorized dispatch |
| Effect active, interrupted, or completion uncertain | Retain actual dispatch/effect evidence; activity and dependent currentness are known or explicitly unknown | Existing liveness wait/block/observation authority; no duplicate dispatch inferred from absence of Result |
| Raw/effect facts exist, Result not admitted | Admission pending, with exact available material and provenance | Existing result owner admits or refuses that material; no invented answer or automatic repeated effect |
| Result admitted, judgment or transfer pending | Preserve Result/call/actor and its actual class; required judgment/route remains unfinished | Existing judgment/route owners; a failed Result follows declared failure/correction rather than a success transfer |
| Child complete, fold not admitted | Parent return still due, naming the actual child Result/closure and binding | Existing fold owner performs only that remaining return if selected and eligible; do not execute the child again to rebuild a stack |
| Fold admitted, parent evaluation pending | Exact post-fold input and required evaluation remain due | Ordinary parent reevaluation/route before parent closure |
| Local remainder discharged | That pending position is complete; other declared obligations may remain | Resolve only the discharged continuation/return; normal Run closure still uses its complete declared condition |
| Missing or conflicting causal/phase/effect facts | Unknown/invalid relation with preserved known facts | Refuse/block or obtain the declared evidence/judgment; do not infer a missing phase from prose, file presence or elapsed time |

An F_D throw can be totalized by `leaf_invocation_port.ts` to a failed candidate;
its subsequently admitted Result is part of the frontier. Existing F_P-only
undispatched-owner evidence does not attest an F_D execution. A preparation
locus/fixed-child declaration can establish applicability and topology only.
The actual owner must establish phase and effects. Default-library names, a
failure diagnostic, or deterministic compute means do not establish safety to
repeat an operation.

## Event Effects, Inertia And Validity

- Existing call/selection/transfer and child-basis admissions establish the
  derived pending position/parent return. Their exact completion events advance
  it. Successful child admission alone leaves a parent return unresolved.
- Run failure/stop terminates its existing activity fluents, not historical
  Result truth or the unmet outcome. Closed resource ownership has no effect on
  obligation satisfaction. Reopening reconstructs once at the admitted prefix;
  ordinary internal hops use established projections.
- Workspace changes become evidence only through their admitted observations.
  The existing dependency relation controls current reliance; do not terminate
  the historical event or reinterpret a historic adverse claim as current
  behavior. Unknown affectedness withdraws only dependent currentness.
- Original and newly admitted obligation identities remain referenced by their
  declarations and admitted Results. A later Run does not mutate a global
  coverage store. Its current coverage is a checked projection over its selected
  evidence and observations, with unknown/open obligations retained.
- No new clipping/de-clipping convention is needed. Keep existing event effects
  and validity projection; do not force old transient availability fluents to
  become active in a new Run. A new use is established by its current admission.

Fresh work needs no new Continuation event merely because its task/obligations
were seen before. Its current invocation's source-use binding names any reused
historical Result with the old identity. New events retain their own Run scope.
The event store's prohibition on cross-Run envelope causation remains unchanged:
historical refs go in checked payload bindings and applicable workspace links,
not in a foreign Run's `causationEventRef`.

## Exact Execution Resumption: Separate Unproved Obligation

CONTINUATION-011/-015/-016 still require exact resumption to conserve the actual
pending position and progressed input, original work authority, parent return
obligations, admitted Result/call/actor provenance, applicable consumed bounds,
effect uncertainty and current dependency validity. The current operation's
authority is distinct from authorization of the underlying work. An active
consumer cannot be duplicated and a failed/stopped Run cannot be relabelled as
active. Exact resumption must preserve Run-local identities and causal linkage;
completion must include its required fold and parent evaluation. Duplicate or
partial progression needs a truthful disposition rather than invented success.

These are conserved relations, not selection of future event kinds, evaluator
variants, parent reconstruction structures or a transaction design. Their
complete realization and installed qualification remain unproved and outside
the ordinary retained-work increment. Fresh invocation success does not supply
that proof or alter existing F_H and Continuation meanings. Any later selected
implementation must establish this relation through the existing owners before
exposing the operation. No particular new carrier or algorithm is ratified here.

## Totality And Selection

Existing ITERATION-004/-008/-010 govern precedence and the constructors
`terminate`, `redispatch`, and `suspend`. The table is total for derived state and
admissible dispositions, not an F_D semantic next-action controller. Unknown
support/effects require the declared evidence or judgment; an exhausted bound
cannot be silently refreshed; wrong authority refuses before effect; active
work cannot be duplicated; a completed remainder does not imply the task is
satisfied. HoG traverses the admitted Program. F_P remains the owner of open
semantic sufficiency and work selection. No event calculus, projection or Public
adapter introduces another loop.
