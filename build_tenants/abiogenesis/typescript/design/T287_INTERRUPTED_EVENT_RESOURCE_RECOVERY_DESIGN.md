# T-287 Interrupted Event-Resource Recovery

**Status:** Accepted bounded HOW. Implementation, installation, native recovery and witnessed stop require separate subjects and grants. Fixed16 GOAL-035/T287 D2 and F12/S04 at5.1 remain unchanged.
**Owner:** Existing ABG event-resource maintenance and witness authority/admission owners.
**Acceptance and exact source basis:** [Executive disposition and application](../../../../.ai-workspace/comments/codex/20260911_ABG5_EXECUTIVE_CHECKPOINT_11/accepted-subjects-and-reviews.md).

## Product frame and selected relation

ABG owns durable event admission, native resource identity and Event Calculus/replay. Product owns immutable install, lock and WorkspaceBinding identity. External authority resolution stays external. A copied log, process observation, timeout, digest or reconstructed coordinate is evidence, not a current resource capability or Run closure.

EVENTS-001/002/006/014/024 require append-only, reconstructable, truthful durable runtime facts; WITNESS-006/009/014 select actor-attributed lifecycle acts through existing `witness.admit`; BINDING-006 preserves external authority. Operative ABI5_REALIZATION_CONSTITUTION **5.6.2C** retains statically bound exact owner calls/resources/receipts; **5.6.4** owns the existing `run-stopped` and `run-resumed` expressions. Superseded5.6.2A/B resource algebra is not implementation authority.

An interrupted native acquisition can leave a valid durable tail and an
abandoned append lock after the last returned owner-issued close handoff. The
old handoff remains authentic historical evidence, not a current capability
for the grown log. Ordinary exact reopen does not recover it. The [frozen
incident and owner basis](../../../../.ai-workspace/comments/codex/20260911_D2_INTERRUPTED_CONTEXT_RECOVERY_HOW_41/basis.json)
retain actual tail, handoff, lock, process and failure identities; their
specific counts and paths are not global design constants.

## One native recovery relation

A closed interrupted-acquisition relation is owned by `abg/event_store.ts`, with an exact typed resource/receipt projection in `abg/definition_event_resource.ts`. Keep ordinary new/reopen assertion schemas, exact prefix equality and existing callers unchanged. Recovery is never a permissive branch inside ordinary reopen and never selected from a stale-handoff failure automatically.

The relation consumes:

- the complete last legitimate owner-issued close handoff and its original identity, not a newly hashed replacement;
- the selected canonical log path/device/inode, its expected complete observed tail bytes/length/digest, and the last handoff's preserved prefix relation;
- the exact lock namespace, regular-file path/device/inode/bytes/digest and complete old lock preimage;
- the attributable interrupted acquisition/invocation, root Run/basis, CLI process PID **and start identity**, supervisor identity and immutable transport/interruption/quiescence evidence; a numeric PID alone cannot establish abandonment;
- the resolved external actor/authority/approval, exact requested recovery effect, immutable executing owner artifact and event-contract profile, and narrowly declared quarantine/output territory. Approval covers these complete identities, observations and permitted mechanics; it is not inferred from the filesystem or a valid digest.

These are subordinate resource/evidence carriers, not an event, runtime entity, writable ledger, currentness registry, process controller or new Public member. The caller supplies expected observations. Only the native owner authenticates the old prefix, validates the whole current tail, acquires exact physical ownership and derives the current resource/handoff.

The old handoff must validate under its exact declared event contract. Its complete bytes must remain a prefix of the current file; its path/device/inode must still name the same regular file. The complete tail must validate canonical envelopes, causal refs, contiguous admission ordinals, event/payload identities and the selected contract. Reject partial last rows, gaps, restamping, changed historical bytes, foreign/cross-contract rows, unexplained replacement or concurrent drift. Never truncate, restamp, migrate into another log or let a snapshot become the live store.

## Physical exclusion, quarantine and failure

The event-store owner performs one finite identity-checked maintenance acquisition. It uses one owner-local exclusive recovery fence in the same resolved lock namespace. This is physical mutual exclusion only. Ordinary append acquisition checks that fence both before and after its own exclusive lock acquisition, and refuses/relinquishes its own exact lease before append if recovery has begun. No alternate TMPDIR or lock namespace may evade exclusion.

Legacy acquisitions do not know this fence. Their exact process identities must therefore be proven quiescent under the externally granted maintenance exclusion before quarantine; an active, unknown, reused-PID, unobservable or concurrently launchable legacy owner refuses recovery. The provider/trusted-desktop boundary is explicit: this protocol is not a hostile-same-user sandbox. It cannot claim atomic compare-and-unlink against an uncooperative foreign writer.

Under the fence, recheck log, old prefix, full tail, old lock and process identities. Create an exclusive owner-controlled quarantine directory on the same filesystem, with no symlink or protected/app overlap. Move only the exact selected old lock into that empty directory; verify its device/inode/bytes after the move. Acquire a new ordinary append lease without overwriting any competing path; retain the old lock as evidence. Re-read log identity/bytes through the held descriptor and require equality with the validated tail before exposing a current context. Only then remove the recovery owner's exact fence. No broad cleanup is permitted.

The implementation must make the participating native acquisition/release protocol exclude the check/move race, not merely place an `lstat` before an unconditional rename/unlink. A failed identity check or unexpected contender never authorizes deleting or replacing that contender. Native ownership/fencing correctness is a decisive test gate, not presumed from this sequence.

Return closed outcomes:

1. `refused_no_recovery`: typed cause plus actual no-effect/temporary-claim receipt; no log append or changed old lock.
2. `recovered`: exact before/after log identity, preserved handoff-prefix relation, validated current prefix, quarantined old-lock identity, new lease/release facts and native current resource or owner-issued close handoff. Recovery creates no runtime event or lifecycle fact.
3. `recovery_fault`: primary cause and ordered completed mechanics, actual current log/lock/fence/quarantine identities and any secondary release/restore fault. If the original lock can be restored without overwriting or crossing an identity, the owner records that restoration. Otherwise leave exact blocking residue and stop. No success handoff is fabricated, and no caller cleanup or automatic retry follows. A later explicit recovery grant must bind that precise residue.

Each receipt is native mechanical evidence. Quiescence is observed absence of the bound process identities, not semantic closure. A new owner that later fails to admit the requested stop must still return its actual recovered-resource close receipt when safely available; a semantic refusal does not erase physical recovery.

## Existing witnessed stop

The installed binding publishes only the already-declared `WITNESS_DEFINITION_BINDINGS.admit["run-stopped"]` alongside conserved reprice. Reuse the existing fixed packet, content descriptor and native `admitWitnessedAct`; do not alias its lower three-argument port as a DefinitionCall binding. Do not add run-resumed, other witness members or another operator operation in this increment.

Use `bindExactPrefixTransition` with a closed owner-specific resource assertion/receipt. Extend the exact external-admission whitelist only for `run-stopped`; reconstruct its actual actor, request/resources, required grants, immutable owner contract/catalog, A/W/ProductSet/lock and required execution-basis slot. Preserve strict `{ref,digest}` contract coordinates. The approval excludes no resource effect and is not proof of native Run currentness.

The native witness owner authenticates the Run and root execution basis from the recovered prefix. The authentic root Run-open execution basis supplies the stop context; a pending nested CCall's child basis does not. Require active Run currentness through the existing Event Calculus owner. Preserve the actual host interruption and output evidence as the reason/provenance; do not fabricate a CCall result, actor invocation, application failure, terminal closure or successful repair.

`admitWitnessedAct` remains the single lifecycle owner and atomically admits its existing Public operation and `run_stopped` events. Return its typed result/refusal plus exact successor resource receipt. Fresh replay must derive stopped truth and the exact external-interruption reason/evidence; it must not infer stop from dead processes. Existing `run-resumed/external_recovery` remains a distinct later act and is not authorization to restart a child or invent a Continuation. Subsequent D2 work requires separate Executive selection through existing native owners.

## Selected native maintenance bootstrap

A changed recovery/stop package is not the old immutable installed owner. The Product invocation owner selects capability ownership from the bound environment's admitted installs and exact Product content/catalog; the witness binding checks that contract against the actual invocation catalog. Changed code never claims the old package identity.

This design selects a separately authorized **native event-resource maintenance entry** owned by the actual verified installed ABG artifact and its catalog/native export. This is physical resource acquisition under an exact externally resolved recovery grant, not Public semantic work, old W1 capability ownership or a fixture bootstrap. It validates the grant and all selected identities, performs the closed native recovery relation, and returns the actual owner-issued close handoff or partial-effect receipt with zero lifecycle/runtime events. No source/stage/C0 work is repeated.

Publication, loading from the exact immutable installed artifact, and rejection of missing/crossed/excess external recovery grants are implementation proof gates. An exported function alone establishes none of them. This adds no Public member, generic resource controller, runtime entity or fourth owner-binding combinator.

With the genuine handoff, ordinary verify/resolve/install/bind and required covering reprices establish the genuine stop owner/environment. The existing witness authority owner must validate current W against the authenticated historical root Run/basis; do not substitute a new basis or assert that a reprice alone is sufficient if its actual join refuses. Any additional required source owner or missing authority relation is an exact re-entry request before editing, not an ambient relaxation. This design selects the native placement, not its implementation or execution. Source qualification and exact runtime grants remain separate.

## Event-contract coordination and exclusions

The [native event-contract compatibility design](T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md)
owns exact legacy L and current P profiles. Recovery validates the genuine
handoff and entire selected history under their authenticated profile schedule.
Read compatibility does not grant append compatibility, lock takeover or a new
close handoff. The recovery/stop candidate selects an owning append-compatible
profile explicitly; no default-current digest, wildcard legacy validator or
changed historical stamp is permitted. An absent or unaccepted required profile
blocks composition. A genuine empty handoff needs its exact owner/profile
origin; matching empty hashes alone prove neither.

The L-to-P boundary requires no active effectful CCall/actor. The applicable
order is physical recovery under L, separately authorized genuine
install/bind/W-cover steps using L-valid owners, existing witnessed stop under L,
and only then a separately selected L-to-P profile witness. Compatibility cannot
pass a still-active interrupted frontier. Stop and profile transitions remain
distinct existing owner acts and grants.

No new runtime event kind is selected here. The specifically required EVENTS022/023 probe events/fluents remain a separate residual; existing operator-stop truth is not their full implementation. Pure-query duplication is a separate performance hypothesis, not a reason to waive any acquisition, prefix, authority or lifecycle guard. The observed host timeout is retained evidence, not native time or closure authority.

## Owning cone and decisive checks

The bounded owning realization cone is `abg/event_store.ts`, `abg/definition_event_resource.ts`, `abg/witness_definition_bindings.ts`, `product/admission_authority.ts`, and necessary `abg/index.ts` exports, plus derived contract/publication output and focused tests. Existing witness packet/lifecycle, Event Calculus/replay and Product capability-owner algorithms remain owners and are preserved. Exact selected preimages and integrated dependencies are pinned at each source entry; the [frozen motivating basis](../../../../.ai-workspace/comments/codex/20260911_D2_INTERRUPTED_CONTEXT_RECOVERY_HOW_41/basis.json) preserves the earlier barrel difference. An old barrel overlay never replaces the actual composed owner. An additional production owner is a precise re-entry, not an ambient repair.

Decisive implementation and separately granted installed proof gates:

| Boundary | Positive and falsifiers |
|---|---|
| Exact history | Authentic retained handoff-to-current-tail native validation and unchanged physical identity; changed old prefix, truncated/newline-missing tail, ordinal gap, forged/cross-contract event, foreign log or same-byte/new-inode replacement refuses. |
| Abandonment | Actual disposable interrupted native owner plus exact PID/start evidence; live owner, PID reuse, ambiguous observation, missing approval, changed lock inode/bytes or wrong namespace refuses before takeover. |
| Exclusion | Two recovery contenders; ordinary append before/during fence; path substitution between checks; foreign lease appearing after quarantine. No recovery removes another owner's lock or permits concurrent append. |
| Partial mechanics | Inject failure at fence, quarantine, new-lease acquisition, tail revalidation and final release. Preserve the primary cause and exact residue; restore only exact safe identities; never manufacture a close handoff. |
| Installed maintenance entry | Verify the actual artifact/catalog/native export and exact external grant before resource effects. Wrong owner/version/catalog, old W1 capability substitution, absent/foreign/overbroad approval or fixture-only loading refuses. Return only an actual owner-issued close handoff or truthful partial-effect receipt; zero runtime events. |
| Stop identity/authority | Exact root Run/basis and actor/current owner succeed; a nested child basis, wrong Run/W/install/catalog/request/grant, missing/duplicate evidence, closed or already-stopped Run refuse through their owning gates. Separate zero-lifecycle-event semantic refusal from any already completed mechanical recovery. |
| Native proof | One recovered-resource owner receipt; one existing witness transaction; fresh-process stopped projection/replay with exact interruption evidence, no actor/C0/C1/C2/app effects or fabricated terminal result. Preserve every selected historical prefix and the complete protected app/installed inventory. |
| Conservation | Ordinary exact new/reopen/read/append/close and stale-prefix refusal; existing reprice; old lifecycle contracts, D2 owners and integrated D1/R10 exports. No wildcard profile or grant. |

The first same-instance installed discriminator, after reviewed source/package/preparation and separately selected exact effect grants, recovers the original store and admits witnessed stop through its genuine current owner. Any prerequisite ordinary installation/binding/reprice is explicitly granted, not inferred from physical recovery. The discriminator stops for review; repair restart, run-resumed or further D2 effects do not follow automatically.
