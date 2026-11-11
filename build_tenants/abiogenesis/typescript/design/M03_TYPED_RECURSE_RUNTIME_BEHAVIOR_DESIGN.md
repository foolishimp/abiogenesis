# M03 Typed Recurse Policy And Runtime Behavior Design

**Status**: Accepted under delegated F_H authority after bounded self-review
**Date**: 2026-07-13
**Ticket**: `T-262`
**Method authority**: `stdo://releases/v2.5.0-rc.6/standards/DESIGN_MODULE_METHOD.md` section 5E
**Tenant authority**: [ABI5_REALIZATION_CONSTITUTION.md](./ABI5_REALIZATION_CONSTITUTION.md)

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

Before the child GraphFunction runs, HoG prepares the child traversal
(`prepareChildTraversal`, `hog/child_traversal.ts`). ABG admits a child
execution basis bound to the parent execution basis and traversal scope, the
parent CCall, the declared child GraphFunction and the parent's admitted result
as the child input (`admitChildExecutionBasis`, `abg/execution_basis.ts`), and
opens the child traversal scope with its own GraphCall and frame
(`openTraversalScope`, `abg/open_call.ts`).

The child adapter owns only the GraphFunction interior and must be idempotent
for the prepared child GraphCall ref.

The child returns its traversal completion (`ExecutableTraversalCompletion`,
`hog/traversal_completion.ts`). The recursion accepts the dispositions
`closed`, `held`, `blocked` and `failed` (`completeRecursionChildUsing`,
`hog/recursion_lifecycle.ts`). The child neither admits its own foldback nor
opens the parent's next attempt: HoG proposes the foldback and ABG admits it
(`admitChildFoldback`, `abg/graph_application.ts`), and the next attempt opens
only through an ABG-admitted recursion route (`applyRecursionRoute`,
`hog/traversal.ts`). The child's completion does not decide the parent's
termination, which reads only the parent locus's result
(`recursionTerminationDecision`, `gtl/graph_applications.ts`).

An admitted child-local failed return can leave the enclosing Run active
(`completeRecursionChildUsing`). HoG authenticates that return against the
prepared child execution basis and scope at the child's successor prefix,
through the ABG child lifecycle projection (`projectFailedRecursionChildTruth`,
`hog/recursion_lifecycle.ts`; `projectChildFoldbackTruth`,
`abg/child_lifecycle.ts`). The failed route, Result, Judgment, C_Call, value
digest and original diagnostic must agree (`projectFailedRecursionChildTruth`).
This return is a truthful failure, not a malformed completed-child foldback
(`completeRecursionChildUsing`).

HoG stops the active enclosing Run through the ABG runtime-failure owner
(`admitRuntimeFailure`, `abg/runtime_failure.ts`). Its cause is the admitted
failed child route (`causationEventRefs`, `completeRecursionChildUsing`). For an
opaque diagnostic, the failure subject names the original child C_Call, Result
and Judgment and the parent evaluator/input coordinates
(`completeRecursionChildUsing`). For a canonical retained-JSON diagnostic, HoG
uses the diagnostic owner to preserve its exact decoded subject, including JSON
`null`; replacing that subject would violate the diagnostic's digest relation
(`readRuntimeFailureDiagnosticSubject`, `constructRuntimeFailureDiagnosticRef`,
`abg/runtime_failure.ts`). The admitted parent scope and failed-child route
causation retain the enclosing and child coordinates in either case
(`completeRecursionChildUsing`). The returned failed completion preserves the
child value and diagnostic (`completeRecursionChildUsing`).
Prior admitted parent work and unresolved input remain unchanged.
No successful child foldback, termination evaluation, rebind or retry follows
(`completeRecursionChildUsing` returns after the failure admission).
An already-failed Run propagates its existing failure without a second failure
admission (`completeRecursionChildUsing`). Missing, crossed or stale child
truth fails the recursion with `application-foldback-mismatch`
(`recursionFailure`, `hog/recursion_lifecycle.ts`).

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

A non-terminating decision continues the recursion only while the parent
cursor's attempt is below the declared `bound` (`beginRecursionApplicationUsing`,
`hog/recursion_lifecycle.ts`); ABG refuses a recursion advance route at the
bound (`recursionRouteCausation`, `abg/traversal_route.ts`). At the bound, HoG
proposes and ABG admits a blocked route with reason `bound-exhausted` before any
child preparation or foldback (`blockRecursion`, `hog/recursion_lifecycle.ts`;
`recursionRouteCausation` admits a blocked route without a foldback or a
preparation refusal only at the bound).

A held F_H child and a blocked child never re-enter the parent, so neither
reaches a termination decision: a held child completion returns as child truth,
and a blocked child folds back into a blocked route
(`completeRecursionChildUsing`). In Consensus the round state's `terminal`
field is the declared termination field (`terminationFieldRef: "$.terminal"`,
`constructConsensusModulePublication`, `gtl/consensus.ts`): `closed_done`
terminates, and only `recurse_next_round` continues the recursion
(`reduceConsensusRound`, `gtl/consensus.ts`).

### D8. Foldback is an exact B to A admission boundary

The foldback is an ABG admission: HoG proposes the child's completion and ABG
admits `child_foldback_admitted` (`admitChildFoldback`,
`admitRecursiveApplicationChildFoldback`, `abg/graph_application.ts`). Its body
binds the declared foldback (`applicationFoldbackRef`), the exact child output
(`childResultRef`, `outputDigest`), the parent CCall, judgment and source
cursor, and the child execution basis, GraphCall and frame; its `foldbackRef`
is derived from the digest of that body (`admitRecursiveApplicationChildFoldback`).

ABG refuses a foldback whose application or declared foldback differs
(`application_mismatch`), whose parent CCall, judgment or source cursor is not
the admitted evaluated parent (`parent_truth_mismatch`), or whose child basis,
scope, Result, Judgment or route is not exact admitted causal child truth
(`child_truth_mismatch`) (`admitRecursiveApplicationChildFoldback`). The
recursion route refuses a target whose input or cursor lineage differs from the
foldback and the source cursor (`recursionRouteCausation`,
`abg/traversal_route.ts`). Generic or unrelated evidence cannot authorize the
next input: the advance route consumes exactly the parent judgment and the
foldback (`consumedAvailabilityRefs`), and its target input is the foldback's
child output (`recursionRouteCausation`).
A refused foldback is admitted as runtime failure truth (`recursionFailure`,
`hog/recursion_lifecycle.ts`).
An admitted foldback is necessary but not sufficient to continue the
recursion: an admitted recursion advance route must consume it
(`recursionRouteCausation`; `applyRecursionRoute`, `hog/traversal.ts`).

### D9. Parent rebind evaluation is mandatory

Every recurse declaration carries `requiresParentEvaluation: true`
(`FOLDBACK_DECLARATION_SCHEMA`, `gtl/serialization_contracts.ts`;
`recurseApplication`, `gtl/graph_applications.ts`). It is realized by
re-entering the parent locus: a closed child's output re-enters the same parent
term at the next attempt (`deriveRecursionReentryCursor`, `hog/traversal.ts`).
The rebind admission is the deterministic ABG recursion route admission, not a
product callback (`recursionRouteCausation`, `abg/traversal_route.ts`). It
checks the admitted foldback of this application, parent CCall, judgment and
source cursor; the next cursor's input against the foldback's child output; the
same cursor lineage, node, term path and task ordinal at the next attempt; and
the bound (`recursionRouteCausation`). It re-derives the foldback from admitted
event truth (`isAdmittedApplicationChildFoldbackAtPrefix`,
`abg/graph_application.ts`).

Only an ABG-admitted recursion advance route moves the parent to its next
attempt (`applyRecursionRoute`, `hog/traversal.ts`). The next attempt consumes
exactly the foldback's child output as its input
(`deriveRecursionReentryCursor`; checked by `recursionRouteCausation`). The
parent locus evaluates again at that attempt, and that evaluation is the
semantic re-evaluation of the parent (`beginRecursionApplicationUsing` decides
termination over its new result). Child closure and foldback alone never
terminate the recursion: termination reads only the parent locus's result
(`recursionTerminationDecision`, `gtl/graph_applications.ts`). A held F_H child
completion remains child runtime truth and is returned unchanged
(`completeRecursionChildUsing`); the recursion route admits only `advance` and
`blocked` routes (`recursionRouteCausation`).

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
