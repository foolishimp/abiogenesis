# T-287 pending-consumer continuation — HOW proposal

Proposal only, 2026-09-29. `T287_S7_PENDING_CONSUMER_HOW_01`; Astra/xhigh;
Product/Owner, Continuation and End-To-End Interface Integration under selected
STDO `v2.5.1-rc.1`. Subject: core
`1722953b7391e593079e3436b729b13c55457c734fb441d5e08b604edf9c462d`,
the closed S7-R01 entry finding, and Product recovery/reuse law. This neither
changes S6 nor claims recovery of any earlier Run. Exact source identities and
the closed return are in
`../../../../.ai-workspace/comments/codex/20260928_FRAMED_GOVERNANCE/s7-pending-consumer-01/design-return.md`.

## Outcome and cause

After a producer succeeds and its consumer cannot start, a cold installed
`abg.operation.run.continue#current_intent` must reach that pending consumer
with its actual progressed input. It preserves the producer's original
Result/call/actor, existing assessment status and unresolved obligations;
reacquires mutable dependencies; and lets HoG execute, fold and close through
the existing graph. Recovery is not another initial `start`.

This is a **missing framework realization**, not provider tuning, prompt size,
or task complexity. S7-R01's missing export is the first symptom. Three actual
downstream restrictions prevent an export-only repair:

* `abg/fh_continuation_projection.ts:39` admits only `fh_interaction`;
  `abg/continuation.ts:1227,1350` requires that projection and a responded
  interaction for `run.continue`. An undispatched F_D consumer is neither.
* `abg/event_calculus.ts:1257` terminates Run/graph-call/frame activity on a
  run-level `runtime_failure_observed`; a failed route may also stop the Run.
  `hog/entry.ts:310`'s `resume` member is not authority to reactivate it.
* `abg/default_library.ts:30–61,116–130` binds original state and reusable
  Results to their admitted invocation/Run. A replacement cannot transplant
  those identities or merely supply a populated state as ordinary root input.

Product:816–835 and CONTINUATION-004/-011/-013/-014/-015/-016 already prescribe
the outcome. No new Product family or semantic selection rule is needed.
Existing F_H and declared-retry HOWs establish narrower relations; their retired
vector/interpreter descriptions are not an implementation route. The event
resource recovery HOW only reacquires durable ownership, not execution.

## Complete owner relation

| Boundary | Reuse and minimum necessary extension |
|---|---|
| Public declaration to installed callable | Keep `product/run_operation_contracts.ts`'s five-reference current-intent request and its existing operation identity. Add `RUN_DEFINITION_BINDINGS.continue.current_intent` in `owner_bindings/run_invocation.ts`, using the existing exact-prefix transition/resource close protocol. `shared/owner_contract_source_set.ts` and installed transport already carry that member path. This binding must call the complete owner relation below, never `start` with reconstructed input. |
| Cold acquisition | Acquire the exact durable prefix/reopen handoff and installed Product/Program/catalog/lock/WorkspaceBinding through current owners. Reconstruct the predecessor invocation and admitted execution bases once at acquisition. Resolve declarations from the exact installed publications; materialize against their original admission coordinates and compare admitted identities. Do not persist another full graph snapshot or reauthenticate definitions at each subsequent handoff. |
| Pending position | Extend the existing ABG Continuation projection/admission with a non-F_H pending-consumer case derived from the actual failed/undispatched consumer frontier. Its opening cause is the admitted failure/evidence/route, not diagnostic prose or wall time. The projection names the exact source Run, invocation, execution basis, graph call/frame, cursor, input origin and unresolved parent chain. Existing `projectOpenedCCallTraversalInputAtPrefix` / `projectTraversalInputAtPrefix` recover the progressed value, including retained and registered-selection origins. A caller does not author a cursor or input value. |
| Public request correspondence | `run` matches the predecessor Run; `continuation` matches that projected open obligation; `continuationInput` matches its exact input ref/digest; `expectedBasis` matches its admitted execution authority. `currentIntent` binds the already-admitted ConstructionIntent where applicable, otherwise the root invocation's existing work authorization, with the actual selected child relation retained. This is explicit correspondence for the currently unrealized request field, not a fabricated ConstructionIntent or mandatory ConstructionComposition. Replay must expose these exact request coordinates. |
| Admission and lifecycle | Extend `abg/continuation.ts`'s operation admission to accept the pending-consumer variant without pretending it has a human response. Match the existing actor/grant/policy/current invocation request; enforce one consumption at the selected prefix. A still-active, unconsumed cursor may continue within its Run. A failed/stopped Run uses a new Run and run-local continuation with explicit predecessor linkage; it is never reopened as active. Use the existing continuation terminal/reentry-link, invocation/basis/scope and cursor/route owners. The new pending variant and its opening/resolution/consumption projection must be defined together in existing Event Calculus/replay. No second continuation ledger, controller or event store. |
| Replacement execution correspondence | The missing generic extension is an **admitted pending-consumer reentry binding**, subordinate to invocation/execution admission. It relates the old exact frontier and its retained input to newly admitted Run/scope/cursor coordinates under the same immutable definitions. Reuse the existing `InvocationReentryBasis` ownership, adding a tagged pending-consumer case; its current case is gap/next-action-specific and cannot be relabelled. Extend `open_call` / traversal-cursor admission to establish the selected position and input origin on the replacement, rather than admitting only the graph entry. Persist exact causal refs in those existing admissions, not an opaque process-local resume object. |
| Producer reuse | Extend existing source-origin applicability at that admitted reentry boundary. The old Result/call/actor remain old facts; the new consumer receives a proven use relation, not copied events or a new producer Result. Existing library/native/C2/assessment guards must consume that exact relation where they currently require same Run/invocation. Ordinary invocations keep their current strict rules. `sourceResultBasis` alone is insufficient: it does not restore pending position or parent obligations. No general “any prior Result with equal bytes” lookup is permitted. |
| HoG and parents | Feed the admitted continuation projection into the existing `executeGraphTraversalEffect`, preserving separate graph-entry and progressed inputs. Reuse `traverseFromCursor`, `enterTraversal`, declared retry resume when its actual retry frontier exists, and workflow/recursion fold owners. `parent_rehydration.ts` validates supplied held parent frames today; cold pending recovery additionally must derive the exact parent chain from admitted execution-parent/call/route relations. For a replacement, establish new parent scopes linked to those old facts before traversing; copying old suspension identities does not suffice. The runtime machine, not Public ingress, completes the consumer and parent reevaluations. |
| Readback and close | Use the existing owner finish/close handoff and Public result/replay source coordinates. Replay projects the old failed Run, exact predecessor/successor relation, newly admitted consumer and actual parent closure. No terminal Result exists until normal graph/Run closure. Duplicate continuation must not launch a second consumer. |

The reentry binding is an admitted source/use relation within existing runtime
owners. Its cold projection is discardable. It is not a new graph, planner,
cache, recovery language or external work queue. References to historic scopes
are preserved; newly executed scopes have new identities. The failure record
and original assessment status stay unchanged.

## Mutable facts and preserved work

Before consumer effect, reacquire its actual declared mutable dependencies through
the existing worksite observation/preparation owners. Default-library
`currentContext` already observes current roots; native/C2/assessment preparation
already distinguishes producer dependencies from separately acquired assessment
inputs. Keep those relations. An unrelated newly supplied assessment document
does not invalidate unchanged measured output. A changed measured dependency
invalidates its applicable support; unknown affectedness remains an explicit
gap. Historic adverse evidence remains evidence of its historic claim.

If the pending consumer's current input is a preparation result whose mutable
observations are stale, the owning preparation must run again from its admitted
entry/source relation and admit a new task. This does not repeat the successful
producer. Do not edit an old task in place or silently replace its input digest.
If fresh facts invalidate a semantic selection, resume the graph's declared
evaluation/correction boundary with the preserved state and unresolved
obligations. F_D checks correspondence and declared transition applicability;
F_P makes any new adequacy, choice or assessment judgment. No Public adapter
chooses a graph or routes around a failed judgment.

## Boundaries and refusal

The first positive qualification uses an unchanged installed candidate for both
failure and continuation. Changed Program/GraphFunction/implementation/Product/
lock/WorkspaceBinding authority is a different relation: CONTINUATION-014
requires the exact crossed-pair reprice and applicable new binding before
execution. Current-intent must refuse absent cover; it cannot invent cover from
equal worksite bytes. The current Public refusal vocabulary has `basis_mismatch`;
preserve `basis_fork_detected` as the precise cause rather than silently claiming
the request already carries an implemented changed-authority path. The declared
`selected_action` contract and narrower existing reprice/gap owners do not prove
that generic path implemented. Earlier live02–04 recovery remains unproved.

Reject wrong/stale prefix, resolved/consumed continuation, foreign cursor or
origin, initial-input substitution, altered explicit input, wrong parent chain,
changed authority without cover, changed producer dependency without affected
support invalidation, and missing independently required judgment. A terminal
successful Run is not a pending consumer. A malformed provider answer is not
retroactively repaired by this operation. Native-human response remains the
separately deferred F_H path; no human prompt or fabricated response is needed
for this automatic pending-consumer case.

## Finite proof and implementation re-entry

After acceptance of this HOW, qualify one installed ordinary graph using the
default-library/native/C2/assessment ownership joins, not a retired retry fixture:

1. A producer succeeds once with distinguishable output. Its selected consumer's
   real preparation refuses because one declared assessment input is absent.
   Retain the exact progressed state, producer evidence, pending position,
   assessment absence and unresolved obligations; close the host resource.
2. Supply only that declared missing mutable input through the permitted fixture
   effect. Use the same archive, definitions and WorkspaceBinding; launch one
   fresh Public current-intent call, with no source/definition repair and no
   caller-side selector. The owner restores the pending consumer, reacquires
   observations, preserves the producer's refs and performs the required actual
   independent assessment and parent evaluation.
3. Both cold Public reads must agree on predecessor failure, successor linkage,
   no repeated producer, progressed input, fresh assessment/support and truthful
   closure or remaining gap. Freeze raw commands/events/effects first. Stop on
   the first unexpected failure; no paid discovery loop.

Use controlled actual-owner checks for malformed/currentness/duplicate/authority
negatives and the active-prefix versus failed-Run split. Reuse accepted S2 input
origin, S6 producer-dependency, assessment independence and basis-fork evidence
where still applicable; these do not replace the installed positive. No full
Hello/lifecycle replay or qualification roster expansion is necessary.

The implementation territory necessarily exceeds an export: existing Public
binding, Continuation/Event Calculus/replay, invocation/execution/open-scope/input
origin admission, HoG entry/parent rehydration, and the affected retained-source
guards need the same causal relation. Their exact edits and finite fixture must
be selected together before implementation. This proposal identifies that
missing relation; it does **not** claim these generic replacement APIs already
exist or that current F_H/retry helpers can be wired unchanged. No tests, build,
install, provider, source repair or runtime recovery was performed for this HOW.
