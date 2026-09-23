# T-287 Event-Resource Ownership Reconciliation

**Status:** Accepted RECOVERY-HOW01 with OWNED-MODULE-CONTINUATION01 lifecycle reframe; exact STDO 2.5.1 RC1, fixed fifteen-family GOAL-035/T-287 Product. Implementation and installed use require exact subjects and effect grants. Run stop/retry/resumption remains outside this relation.

**Owner:** Existing ABG event store and resource-maintenance boundary. Product/Proof/Owner/Effect/Reuse frames of `ABI5_PROJECT_REFERENCE_FRAME_BASIS.md` apply.

## Product and authority

EVENTS-001/002/006/014/024 conserve append-only history and truthful native failure/lifecycle evidence. BINDING-006 keeps authentication and authority resolution external; WITNESS-006/009/014 retain the existing independent operator lifecycle authority. ABI5_REALIZATION_CONSTITUTION's held-resource law excludes outside edits during active ownership on the trusted developer desktop and retains complete cold validation when ownership ends.

Every supported interruption leaving valid conserved history and established selected initial origin or genuine predecessor ancestry retains a path to the next lawful resource boundary: its genuine live owner, or explicitly authorized quiescent owner reconciliation followed by a genuine current handoff. Missing delivered knowledge or absent abandoned lock alone cannot strand that domain. Reconciliation never changes history, repeats an effect, closes/resumes a Run, grants execution permission or fabricates a historical receipt.

## One lifecycle, four distinct dimensions

- **D — durable history:** physical identity/bytes and their validated event/profile meaning. Commit changes D; delivery does not.
- **O — physical ownership:** genuine live held owner, exact abandoned residue, confirmed unheld resource, or unresolved ownership. Lock presence is not process liveness; absence is not proof of valid history or delivered closure.
- **K — delivered knowledge:** no handoff, a genuine historical handoff, or a genuine current handoff. Lost delivery does not undo commit or release.
- **A — authorization:** externally resolved exact execution/maintenance scope and trusted operator/actor basis. D, O and K do not supply A.

Ordinary order is `acquire -> zero or more admitted durable commits -> close/release -> receipt delivery -> next acquisition`. Close constructs its handoff before releasing ownership; that value may never be delivered. A no-op/refusal can close without append. Interruption between these cuts preserves whatever D/O actually remain, not a guessed transition outcome.

| Reachable state | Existing owner disposition |
|---|---|
| Original explicit new selection, target absent, no K | Ordinary new acquisition; unexpected contents do not become an empty origin. |
| First/later genuine live owner, before/after commits, K absent/current/historical | Continue or close through that owner under A; another acquisition refuses busy. |
| Dead owner, exact abandoned lock, valid empty/unchanged/extended D, K absent/historical | Authorized reconciliation adopts exact residue using selected initial origin or genuine predecessor ancestry. |
| Released unchanged D and genuine K still current | Ordinary exact reopen; former process need not exit after relinquishing ownership. |
| First close before delivery, or successor commit/release before delivery; valid D, no lock, K absent/historical | Authorized reconciliation acquires ordinary exclusive ownership, selecting initial origin or predecessor ancestry respectively. |
| Released D and delivered genuine current K | Ordinary exact reopen under the next operation's authority. |
| Delivery/ownership/quiescence unresolved | Wait outside the operation or explicit refusal; no concurrent takeover. |
| Interrupted append, D not yet validated | Authorized cold inspection; valid complete conserved history follows the rows above, partial/malformed/invalid history refuses unchanged. |
| Wrong/replaced identity, changed predecessor, unknown origin/ownership, unsupported profile or missing/wrong A | Explicit refusal with residue; no guessing, truncation, transplant, manufactured authority or silent retry. |

This total disposition is composition of ordinary new/live/reopen/maintenance owners, not a new controller. A validated resource can contain an incomplete Run. Existing admitted events and semantic owners alone determine what completed and what later operation is lawful.

## Closed installed maintenance entry and selected evidence

`recoverInterruptedAbgEventResource(request, resolvedAuthority)` is exported through the verified package's existing `./abg` surface. It is a native maintenance operation, not a new Public family/entity/catalog/permission system. `AbgEventResourceAssertion` and ordinary new/reopen remain unchanged.

The request independently selects provenance and ownership:

1. **Provenance:** either the complete genuine `lastCloseHandoff`, or `initialOrigin` containing the original validated `new_abg_event_resource` request, trusted operator-selected present device/inode and an origin-evidence coordinate. The existing request retains exact path/locator identity. Available caller/interruption evidence and the operator's selection establish the original absent-target acquisition; there is no claimed historical return. The physical owner receives the existing `new_empty_append_sink_request` projection of that same path, not a fabricated handoff. New origin selects the current profile used by ordinary new acquisition. Missing origin evidence refuses rather than inventing a birth record.
2. **Ownership:** either exact `abandonedLock` path/device/inode/base64 bytes/digest, or explicit `recoveryCase: lock_absent` and exact identity-scoped lock path. These are observed premises, not consequences inferred from K.
3. **Current D and A:** exact current byte length/digest, selected former owner PID, interruption/quiescence evidence, explicit single-operator exclusive-maintenance premise, and exact Product verification request/verified executing artifact. Existing current handoff remains the ordinary reopen route; quiescent maintenance does not displace a live owner.

The original prior-handoff/abandoned-lock request remains accepted unchanged. Strict request alternatives prevent crossed provenance/ownership fields. Exact request/effect approval binds the selected alternative and all evidence; an approval for a different selection does not apply.

Existing `RESOLVED_ADMISSION_AUTHORITY_SCHEMA` supplies the externally resolved trusted-developer actor and allow decision. Existing `verifyProduct` revalidates the artifact against requested and executing manifest/export identities. Fixed `ABG_EVENT_RESOURCE_RECOVERY` identifies the symbol and finite descriptor/acquisition/adoption/close effects. `abgEventRecoveryScope` derives the complete request/effect scope for external approval. Actor, authority/approval digests and exact descriptor/request/scope correspondence are checked before resource access. Computing a digest or validating a schema does not grant permission.

## Physical sequence and supported premise

One trusted operator reserves the maintenance interval, establishes origin/interruption/quiescence and starts no competing writer/recovery. For abandoned-lock adoption the selected owner PID must be absent; live (including reuse), inaccessible or unknown PID status refuses adoption. For confirmed-unheld reconciliation, exact external quiescence/exclusive-maintenance approval and successful normal exclusive acquisition govern: the former process may remain alive after releasing ownership. Neither lock absence nor a PID alone establishes quiescence. Pending delivery, unresolved ownership or competing ownership must wait/refuse rather than assert the unheld premise. This does not restrict ordinary live-owner continuation or genuine current-handoff reopen. No process kill, PID-start database, recovery journal, fence, quarantine or adversarial concurrent-recovery protocol is selected.

1. Validate selection, approval and installed owner. Select exact current path/device/inode from genuine predecessor or explicit initial origin. Require the existing identity-scoped lock namespace. Open the selected log without replacement/content write and check regular path/descriptor identity.
2. If O is abandoned, open and verify exact selected lock bytes/identity/PID and keep its path present. If O is confirmed unheld, use existing ordinary exclusive lock acquisition; an existing/appearing lock refuses without removal or adoption. The operation owns only the lock it actually acquired/adopted.
3. Read selected D once. Check current length/digest and, when K provides a predecessor, its exact byte-prefix/digest/boundary. Use the existing complete cold decoder once: canonical rows, causal references, ordinals, event/payload identity, physical references and profile law remain. Prior-cut recovery preserves the same active profile at predecessor/current boundaries; initial-origin recovery requires the ordinary new-owner current profile from the first event (or empty history). No upgrade/restamping is authorized.
4. Recheck ordinary descriptor/path identities and extents. Seed the same private durable-history correspondence used by reopen from these validated bytes/events and the selected ownership. Do not reacquire/redecode or author a caller reopen authority.
5. Immediately invoke existing held-store close. Exact-prefix release produces the genuine current `EventStoreCloseHandoff`; only successful close returns `recovered`. Delivery may itself fail again, leaving a state governed by this same relation. No log byte, Run result or application fact changes.

## Refusal, residue and proof

Before adoption, refusal closes temporary descriptors and leaves an abandoned lock untouched; for ordinary acquisition it releases only this operation's acquired lock. Primary validation cause and cleanup errors remain truthful. After seeding, failed close returns `recovery_fault` with original cause and observed descriptor/lock residue. Cleanup never overwrites/restores another lock, manufactures a handoff or retries. A later action requires exact current residue and authority selection.

The receipt binds complete request/approval, executing artifact/export, selected physical origin or predecessor, validated history count and actual close/refusal/fault. It is mechanical evidence, not an ABG event or inferred Run closure. Fresh reads, witnessed stop, profile upgrade, continuation and application effects retain their separate owner decisions.

Focused proof uses genuine disposable owners at first acquisition before append, first commit, and first close before any delivery, plus historical handoff/successor release. Both abandoned and absent ownership converge to unchanged bytes/inode and ordinary next acquisition. New-origin mismatch, existing lock, invalid successor, exact approval and cleanup residue are decisive negatives. Reuse existing malformed-history/profile/live-owner coverage; do not multiply its matrix. Component-supplied artifact verification is explicitly not installed verification. No original-resource operation or semantic retry is implied.

Finite production cone: `abg/event_store.ts`, `abg/definition_event_resource.ts`, existing `abg/index.ts` exports if needed, this HOW and focused fixture/generated inventory. No witness binding, event schema or semantic lifecycle change is selected.
