# T-252/T-272 Schema-Ownership, Event-Basis, And Continuation Design Self-Review

**Date**: 2026-07-18
**Scope**: paired T-252/T-272 design and current projections only
**Verdict**: `candidate_pending_independent_fh_review`

## Correction To Prior Checkpoint

The earlier `b7c5f519` revision overclaimed constructability by saying
`run_stopped` could directly derive one terminated fluent per clipped member,
although that event carries no continuation ids and the axiom context has no
pre-clip hold set. It also placed same-run supersession inside T-272 contrary
to CONTINUATION-004. Both claims are withdrawn below.

The subsequent `5e9866ff` repair still scoped the abandonment rule to F_H,
although `run_stopped` clips every `continuation_open`, including retry-reopened
members. It also promoted that algorithm as an eighteenth authority and called
effect rows ordered without mechanically binding replay order. Those claims
are also withdrawn: the algorithm is generic and subordinate, authority stays
`17 -> 17`, and strict ordinal replay admission precedes calculus.

## Repaired Findings

1. **Dependency-leaf replay basis**: `FhHeldExecutionCheckpointBasis` is now a
   contracts-owned readonly value made only from primitive coordinate fields,
   frozen node/schema/carrier/admission rows, and canonical `IJsonValue`
   bodies. It imports no runner or declared-execution-context type.
2. **One seal, no checkpoint identity**: the nested basis has no checkpoint ref
   or checkpoint digest. Existing plan, cursor, receipt, carrier, and value-
   environment digests remain constituent authority evidence. The opened
   event's existing `interactionBasisDigest` is the sole checkpoint seal. The
   full body remains event/replay truth; the public interaction projection adds
   no checkpoint field and retains its existing interaction ref/digest.
3. **Verify before reconstruction**: `run.continue` must select the exact
   opened-event projection, validate canonical row order and constituent
   digests, and recompute the interaction-basis seal before reconstructing any
   runtime value.
4. **Executable singular lifecycle**: existing effects derive open and resolved
   truth. `run_stopped` only clips opens by run. One subordinate
   `ContinuationAbandonmentDerivedRule` inside Event Calculus folds every open
   produced by the closed F_H-open/retry-reopen mapping, subtracts all terminal
   effects, and derives abandoned truth for unresolved ids with the canonical
   stop event as cause. The lifecycle projection emits exact status/cause rows
   from the same trace.
5. **No retry-event semantic widening**: `continuation_terminated` and
   `continuation_reopened` events remain retry-repair-specific. They cannot
   represent same-run F_H continuation because their required retry-run fields
   and reason would be false.
6. **Exact replacement truth**: the resume event names continuation id/kind,
   run, cause, old receipt ref/digest, and the complete contracts projection of
   the successor receipt. Admission and replay both prove equality with the
   sealed T-271 receipt.
7. **Schema ownership conserved**: T-270 owns the private checkpoint-basis
   shape/admission; T-252 owns the reachable graph-schema source/key family;
   T-274B derives its asserted definitions; T-275 owns binding semantics only;
   T-272 owns no graph-private or public schema.
8. **Current projections corrected**: T-252 remains active and linked to its
   amended three-view design; GOALS reopens only the bounded DS-1 F_H-target and
   recurse delta; T-268 waits for its regenerated digest/census; T-274A remains
   closed while T-274B waits for the repaired Module.
9. **Supersession kept on its lawful boundary**: T-272 emits only resolved or
   abandoned terminal status. Generic supersession remains on the required
   terminate-old/open-new-run law outside this same-locus slice.
10. **Replay order mechanically bound**: canonical events pass
    `sortReplayByAdmissionOrdinalFailClosed` before Event Calculus. Missing or
    colliding ordinals fail before effect rows, and physical array order cannot
    change the derived lifecycle.
11. **Prime count corrected**: the generic abandonment algorithm and kind map
    are subordinate to existing Event Calculus authority. Neither is IACS or a
    promoted carrier; authority and authoring counts remain `17 -> 17`.
12. **Reachable schema ownership closed**: T-252 owns one Prime extension and
    keyed projection of `CONSENSUS_DOMAIN_SCHEMAS` over the repaired fifteen
    reachable boundaries: thirteen direct schemas plus two native Vector
    schemas. The exact split is three reused public identities and twelve
    engine-private keys.
13. **Module metadata remains neutral**: the one
    `abg.runtime_schema_admission_bindings` entry contains only strict flat
    `{graphFunctionId,nodeRef,symbolicSchemaRef,contractId,contractVersion}`
    rows. No M04 coordinate, projected schema identity/digest, locator, native
    symbol, projection witness, callable, or admission result flows upstream.
14. **Downstream join is total and bounded**: T-274B must amend its own accepted
    design before implementation to derive the exact fifteen-definition runtime
    join input. Every row resolves one asserted definition; repeated rows may
    share a definition; every join-input definition is used. The other six
    standing public assets remain outside the runtime join.
15. **Public/private and profile ownership stay separate**: T-274A remains
    closed over nine public assets and two vocabularies. Private definition
    keys never enter the public catalog. T-275 supplies subject, policy,
    response, result, profile, and projection bindings but owns no schema key,
    source, definition, or Module metadata row.

## Drift Review

- No runtime, event, schema, catalog, SDK, or CLI code changed.
- The GTL program still owns graph order and recurse; T-272 resumes one held
  T-271 coordinate and selects no action or GraphFunction.
- No checkpoint store, resolver, controller, aggregate, event family, public
  operation, compatibility alias, or second checkpoint seal was added.
- No retry event changed; the generic rule consumes its existing reopen effect.
- The domain model, sequence, and state machine agree on the one event basis,
  verify-before-reconstruct ordering, direct resolved effect, and ordered-row
  abandonment derivation.
- T-252 body work, the required T-274B private-delivery amendment, and T-272
  runtime work remain blocked until independent F_H acceptance.

## Gates

- T-272 design digest: `1ea155c6a50a35f7d59f6448dab48cbefe7f0f8ec69c4e21a6b20ec8647688e6`
- T-252 amended design digest: `f1e119d5f38209409310c7f3631c3b3ee10663c02464b218cdae80e2e8e25444`
- design Mermaid: `32` files, `96` diagrams, renderer `11.3.0`, source-set
  digest `sha256:48918ef50daf92af0b851301d42fddc133b7f259b3d36771631ad9f95ce7184e`
- Prime contraction: `9` tickets, `8` accepted, `1` pending, `12` checked refs
- governance: `19` tickets, root `T-252`, `76` commentary refs, passed
- `git diff --check`: passed

## Remaining Gates

Independent review must accept the repaired T-252 declaration delta and T-272
event-basis/lifecycle boundary. Only then may T-252 regenerate its body
digest/census or T-272 implementation begin.
