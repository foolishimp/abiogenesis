# M03 Typed Recurse Policy And Runtime Behavior Design

**Status**: Accepted under delegated F_H authority after bounded self-review
**Date**: 2026-07-13
**Ticket**: `T-262`
**Method authority**: `stdo://releases/v2.5.0-rc.6/standards/DESIGN_MODULE_METHOD.md` section 5E
**Tenant authority**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./history/TYPESCRIPT_REALIZATION_GUARDRAILS.md)

Retired sections: [history/M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN__RETIRED_SECTIONS.md](history/M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN__RETIRED_SECTIONS.md).

## Boundary

### Requirements

- `REQ-L-GTL3-RECURSE-001..008`
- `REQ-L-GTL3-LAWS-009`
- `REQ-L-GTL3-CONTRACT-LAW-API-002/-006`
- `REQ-R-ABG3-FRAME-001..006`
- `REQ-R-ABG3-LINEAGE-001..005`
- `REQ-R-ABG3-PROVENANCE-001..006`
- `REQ-R-ABG3-CORRECTION-002`
- `REQ-R-ABG3-REQUIREMENT-PROOF-CARRY-THROUGH-029/-031`
- `T-262` gap family `typed_recurse_policy_and_runtime`

### Explicit Exclusions

- a Consensus controller, round service, prompt loop, or product-specific
  interpreter;
- any use of `C.retry` to represent a semantic round;
- an interpreter-owned default budget, termination predicate, foldback map, or
  parent convergence judgment;
- caller-authored application ordinal, remaining budget, child call identity,
  frame identity, lineage, continuation status, or closure truth;
- recursion over an unselected catalog search result or a helper publication;
- foldback inferred from names, tags, prose, nulls, or output shape;
- child success certifying parent convergence without termination evaluation;
- foldback success certifying another application without parent rebind
  evaluation;
- arbitrary nested recurse chains, mutual recursion, non-tail recursion,
  parallel recursion, scheduling, leases, timers, or graph rewrite;
- publication of module-local child frames as peer public GraphFunctions;
- top-level `TraversalUnit`, result-interface conservation, or effect release
  owned by T-267; and
- tenant conformance publication owned by T-268.

## Design Decisions

### D6. ABG prepares child identity before the effect edge

Before invoking the operand GraphFunction, ABG derives a
`TypedRecurseChildRequest` with:

- plan and binding refs;
- selected Module and operand GraphFunction identity;
- stable parent locus and frame-lineage ref;
- replay-derived application ordinal;
- fresh child GraphCall and frame-attempt refs;
- exact A input carrier and payload refs; and
- the positive maximum application count.

The child adapter owns only the GraphFunction interior and must be idempotent
for the prepared child GraphCall ref. It returns one closed candidate:

```text
completed(B payload, response contract, evidence)
held(reason, evidence)
blocked(reason, evidence)
runtime_failed(reason, evidence)
```

It cannot select foldback, change policy, advance the ordinal, emit runtime
events, or certify the parent. Malformed or thrown output becomes a truthful
blocked runtime resolution; recursion does not retry it.

For the direct HoG realization, an admitted child-local failed return can leave
the enclosing Run active. HoG authenticates that return against the prepared
child execution basis and scope at its exact successor prefix, using the
existing ABG child lifecycle projection. The failed route, Result, Judgment,
C_Call, value digest and original diagnostic must agree. This return is a
truthful failure, not a malformed completed-child foldback.

HoG stops the active enclosing Run through the existing ABG runtime-failure
owner. Its cause is the admitted failed child route. For an opaque diagnostic,
the failure subject names the original child C_Call, Result and Judgment and
the parent evaluator/input coordinates. For a canonical retained-JSON
diagnostic, HoG uses the existing diagnostic owner to preserve its exact
decoded subject, including JSON `null`; replacing that subject would violate
the diagnostic's digest relation. The admitted parent scope and failed-child
route causation retain the enclosing and child coordinates in either case.
The returned failed completion preserves the child value and diagnostic.
Prior admitted parent work and unresolved input remain unchanged.
No successful child foldback, termination evaluation, rebind or retry follows.
An already-failed Run propagates its existing failure without a second failure
admission. Missing, crossed or stale child truth retains the existing refusal.

```mermaid
sequenceDiagram
    participant Child as Declared child
    participant HoG as HoG recursion
    participant ABG as ABG owners
    Child->>HoG: Failed completion with exact child refs
    HoG->>ABG: Project admitted child basis, scope and failed route
    ABG-->>HoG: Exact Result/Judgment/value/diagnostic correspondence
    HoG->>ABG: Admit failure with exact diagnostic subject and child route cause
    ABG-->>HoG: Non-green successor prefix and replay
    HoG->>HoG: Return failed; no foldback or retry
```

### D7. Termination is evaluated over admitted B

Only an admitted exact-contract `completed` child result reaches the declared
termination evaluator. The evaluator request contains the declaration's
exact binding and consumed field refs, current ordinal, policy projection,
admitted B payload, and prior foldback evidence. Its closed candidate is:

```text
terminate(reason, evidence)
foldback(reason, evidence)
blocked(reason, evidence)
```

ABG validates the echo and admits one termination event. `terminate` returns
the exact B payload. `blocked` stops. `foldback` may continue only when the
current ordinal is below the admitted maximum. At the maximum, ABG records a
budget stop before any foldback or next child effect.

For T-252, held F_H and blocked paths never produce a completed round
disposition and therefore never reach this evaluator. `closed_done` terminates;
only the structurally admitted post-submitter `recurse_next_round` disposition
may select foldback.

### D8. Foldback is an exact B to A admission boundary

The foldback adapter receives the admitted B payload, exact declaration,
current policy, frame lineage, and prior-round evidence. It returns:

```text
bindingRef exact declaration binding
sourceOutputCarrierRef exact B
sourceOutputPayloadRef exact admitted child result
targetInputCarrierRef exact A
targetInputPayloadRef next A
policyRef and policyDigest unchanged
budgetSourceFieldRef unchanged
preservedEvidenceRefs non-empty superset of prior round evidence
foldbackEvidenceRefs include a content-derived parent-rebind witness
```

ABG rejects a changed binding, carrier pair, source payload, policy identity,
budget-source ref, missing prior evidence, malformed target, or stale lineage.
The witness binds the exact child output, proposed next input, foldback
declaration digest, policy, budget, lineage, and preserved evidence. Generic or
unrelated evidence cannot authorize the proposed next input.
Rejection is itself admitted as terminal recurse truth, so replay cannot invoke
the rejected foldback adapter again.
An admitted foldback event is necessary but not sufficient to open the next
child application.

### D9. Parent rebind evaluation is mandatory

The declared `requiresParentEvaluation: true` is realized by a separate
`TypedRecurseParentRebindEvaluation`. This is a deterministic ABG admission
projection, not another product callback. It checks the exact foldback event,
next A carrier and payload, unchanged policy ref/digest and budget-source ref,
stable lineage, preserved evidence, and the declaration's mandatory
parent-evaluation flag. It independently re-derives the parent-rebind witness
from admitted event truth; an absent or stale witness produces `blocked`
before another child effect. Its closed result is `admitted` or `blocked`.

Only an admitted parent-rebind event can advance replay to the next ordinal.
The next child request consumes exactly the event's A payload and preserved
evidence. The next operand invocation performs the actual semantic
re-evaluation of the parent contract. Child closure and foldback alone never
certify parent convergence. A held F_H state remains child runtime truth and
does not arise from structural rebind admission.

### D11. Declared failed-child foldback

Owner: `REQ-L-GTL3-RECURSE-009`; route R of the RC12 B1 trace
(`.ai-workspace/work/T287_RELEASE_RESUMPTION_01/rc12-executive-01/B1_TRACE.md`).
This note narrows D6 for declared classes only.

- **Path and outcome.** A failed recursion child whose failure class the
  `recurse` foldback declares in `failedChildDiagnosticClassRefs` folds back
  with the existing `failed` child disposition. The parent locus is re-entered
  at the next attempt over its prior admitted input and evaluates again under
  the same bound. An undeclared class, a recursion without the member, and a
  Run already failed by `runtime_failure_observed` keep D6 unchanged.
- **Typed handoffs.** HoG authenticates the failed child return
  (`projectFailedRecursionChildTruth`) and proposes; ABG admits
  `child_foldback_admitted` with `childDisposition: "failed"`, then the
  recursion `advance` route whose target cursor is the source cursor's term at
  `attempt + 1` with the source cursor's `inputRef` and `inputDigest`. Cold
  cursor ancestry reads the same relation from the consumed foldback.
  `FOLDBACK_DECLARATION_SCHEMA` is the one foldback definition: GraphFunction
  admission and the Public `run.invoke` request schema (module publications and
  catalog entries) both consume it.
- **Declared computations.** The failure class is the failed child's judgment
  `reasonRef`, which every lift preserves from the first failure-class Result;
  a retained diagnostic contributes its subject's `diagnosticClassRef`. Foldback
  and route admission each check that class against the declaration.
- **Preserved invariants.** No new event kind, payload class, failure class or
  continuation. Failure Results stay failure-class; no Result is lifted to
  success. A parent's own failure never reaches the recursion
  (`application_ready` requires a success Result). The bound counts parent
  evaluations as before and stops with `bound-exhausted`. Retry and recursion
  remain different sorts: the child is not repeated; the parent is re-evaluated.
- **Run quiescence.** A child frame ends at its admitted stopped (`blocked` or
  `failed`) foldback. Run quiescence (`projectRunQuiescence`, the closure gate)
  reads that frame's `runtime_invocation_active` probe as historical, at every
  depth. The axioms are unchanged: the derived probe fluent still holds, so
  replay digests and the derived liveness of recorded Runs stay the same. The
  Public reads consume the same owner, `projectEndedChildFrames` in
  `replay.ts`: `run_status` omits an ended frame's probe from `holdsAt`, the
  `nativeLiveness` that the status, replay, gaps and lawful-actions reads carry
  omits its frame invocation, and the frame's graph-call status, when that
  graph call is neither closed nor active, reads as its stopped disposition. A
  frame without an admitted stopped foldback keeps blocking quiescence.
- **Effect grant.** None. The relation admits runtime truth only.
- **Exit proof.** `t287-recursive-failure-foldback.test.mjs`: a declared class
  fails once and the Run closes; each folded frame probe blocks quiescence until
  its foldback is admitted; a declared class that always fails stops at the
  bound; an undeclared class fails the Run; a parent failure does not fold back;
  the declaration survives Public module publication, catalog parsing and a
  Public start that completes; cold reopen replays the same projection.
  `t287-recursive-registered-selection` keeps its undeclared failure assertion
  unedited.

```mermaid
sequenceDiagram
    participant HoG as HoG recursion
    participant ABG as ABG owners
    HoG->>ABG: Authenticated failed child with declared class
    ABG-->>HoG: child_foldback_admitted, childDisposition failed
    HoG->>ABG: advance route to the parent term, attempt + 1, prior input
    ABG-->>HoG: Admitted route; parent evaluates again under the bound
```
