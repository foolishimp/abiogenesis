# T-287 Native Event-Contract Compatibility

**Status:** Accepted bounded HOW. Source implementation, package, installed execution and qualification are separate subjects and grants. Fixed16, GOAL-035/T287 and F12/S04 at5.1 remain unchanged.
**Owner:** Existing ABG event-resource, witness, evidence/admission and replay owners.
**Acceptance and exact source basis:** [Executive disposition and application](../../../../.ai-workspace/comments/codex/20260911_ABG5_EXECUTIVE_CHECKPOINT_11/accepted-subjects-and-reviews.md).

Retired sections: [history/T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN__RETIRED_SECTIONS.md](history/T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN__RETIRED_SECTIONS.md).

Section 6 states the shared P3 undispatched owner refusal of every F_P leaf. [Interrupted resource recovery](T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md) separately owns abandoned acquisition; compatibility does not acquire or recover a resource.

## 1. Product frame and scope

Fixed16/GOAL-035/T287 retain F10 event-sourced truth and F17/S06 conservation of
unaffected work through correction. F04 retains result integrity; F05/F06 retain
one published contract and thin Public. F12/S04 remains5.1. GTL owns declared
work, HoG traversal, Implementation leaf realization, ABG admission and
replay-derived runtime truth. A profile is not a Program, work selector, grant,
WorkspaceBinding, actor, runtime controller or second ledger.

Requirements EVENTS001/002/003/010/014/024/027–029 require append-only native
truth, exact canonical identity, typed failure, durable acceptance and the
published versioned census. WITNESS003/005/009/014/017 and BINDING018 already
require exact admitted reprice and substrate identity across a causal-spine
change. The operative static owner algebra is Constitution5.6.2C, not its
superseded resource models. No requirement reprice occurs: this is an
explicit versioned realization of those requirements.

This supplement selects exactly two event-contract profiles and one forward
transition. The current P census adds exactly runtime_activity_probe_observed
and runtime_external_interruption_observed with strict source/elapsed/owner
payloads and declared Event Calculus effects. It adds no aggregate type or
Public operation/member. It also adds the declared, store-assigned stamp to
the **new** canonical event envelope, in addition to the P3 evidence payload arm. That additional envelope change is
part of this design, not an implicit consequence of P3. Old envelopes remain
exact historical data; there is one current profile for new runtime work.

## 2. Exact immutable profiles

Let L be the retained legacy profile:

- digest `sha256:fc3a635040a6e3d763740ae54b6390944c7ea8cedfa060de110cb36e31ca6e3c`;
- exact [legacy source basis](../../../../.ai-workspace/comments/codex/20260911_P3_NATIVE_CONTRACT_COMPATIBILITY_HOW_22/basis.json) event-store table, envelope, canonical serialization,
  event-ID/payload-digest/ordinal reconstruction and old CCall evidence guards;
- digest preimage remains exactly `{schemaVersion:"5.0.0",aggregateTypes,
  eventKinds,eventContracts}`. Do not insert a new field and call the result L.

Let P be the one current profile, W, named
`abg.event-contract.root/p6-stdout-window-witness@1`
(`abg/event_contract_profiles.ts`, `ROOT_WINDOW_EVENT_PROFILE_REF`). Its
immutable descriptor, built only by `constructRootStampedEventContractDescriptor`
in that owner (which also builds the retained RC6 and S2 descriptors, both named
`abg.event-contract.root/p5-run-environment-role-context@1`,
`ROOT_RUN_ENVIRONMENT_EVENT_PROFILE_REF`), binds the profile ref, L, the unchanged aggregate census, the
exact current event-kind census including those two liveness kinds, the exact
current payload table and the current envelope stamp declaration. Compute
its digest D from the exact implemented canonical descriptor; D must differ
from L. D is not allocated by this prose and is never a placeholder runtime
value. Source/package freeze must publish the computed full D, exact
descriptor and native typed locator before installed preparation.

P conserves the old payload arms apart from the lifecycle copies below and
introduces the closed `undispatched_owner_refusal` arm, the two liveness kinds
and the envelope stamp described below; other current arm extensions belong to
their owning designs. Two P arms omit the lifecycle copies
`terminationConfirmed`, `exitObserved`, `timedOut` and `signalSequence`, which
the fold derives from the primary process events: the `probabilistic_transport`
arm of `c_call_evidenced` and `actor_result_artifact_observed`. A reinserted
copy refuses (D5, [common library
design](ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md)). The L arms keep
them. The omission changes the exact P table and so D; a store stamped with a
predecessor D is not a known profile for this cut, stays with its original owner
and is not restamped. A fresh successor store carries the current D. D, not the
ref, identifies the profile. Acceptance of this descriptor as a released
successor profile, and any successor ref, belong to the release cut, not to
this source change. The exact current payload table binds the native probe/policy
declaration coordinates and the closed actor_process_timeout_observed
threshold-coordinate extension governed by [native liveness conservation](T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md#3-one-replay-derived-relation-and-one-elapsed-basis).
Existing actor/process binding payloads use their strict P forms for these
declarations; L forms remain exact and unknown current fields refuse.

The current contract publication declares the exact liveness carrier/normalizer,
Event Calculus effects and strict current status/replay projection arm.
Existing read operation identities and cases remain unchanged. Uniform-L output
shape and digest remain exact; missing L observations are never backfilled.
The descriptor declares the stamp as a store-assigned SHA256 profile
coordinate, not a literal D inside D's own hash preimage. Runtime equality to
the computed D is mandatory. Thus there is no self-referential hash equation.

The released implementation contains the two immutable, statically imported
descriptors/validators. There is no extensible registry, version-range match,
caller-selected validator, plugin profile, network resolution, table union
under L, unknown-profile fallback or transitive compatibility inference.
The current contract catalog/native declaration inventory identifies both
profiles and their exact roles: L historical/bridge validation; P current
execution. Existing Product/package/install identities remain immutable;
the new manifest claim belongs only to the new cut.

## 3. Canonical stamps and read compatibility

Legacy events keep their original envelope, eventId, admissionOrdinal,
payloadDigest and canonical line bytes. P events add exactly one store-assigned
`eventContractDigest: D` field. It participates in that event's canonical
identity. It is not a caller input, permission, timestamp or event effect.
The native live emitter refuses any caller-prestamped event. Historical
reconstruction verifies its original stamp and digest without writing or
restamping it. Existing workflowVersion remains5.0.0.

A newly created empty store is created only by the ordinary native create-only
owner. Its empty prefix/handoff names P. Its first event, if any, has the P stamp
at ordinal1; every following event remains P. An empty coordinate is not proof
of an old history. Reopen still requires the exact owned path/device/inode,
length, byte digest and handoff. A nonempty old log cannot be relabeled as
P genesis: its first unstamped legacy event requires L, followed by the
authenticated boundary in section4 before any P event.

A legacy-origin stream parses under L until that boundary, including the
boundary event itself. Only subsequent events parse under P and carry D.
An unstamped event after the boundary, a P stamp before it, an unknown stamp,
a second boundary or a downgrade refuses. P genesis requires no artificial
reprice, dummy Run or legacy bootstrap execution. Zero-event stores contain no
invented profile-transition event.

Historical read acceptance is not append authority. The read owner first
selects the exact profile schedule from the selected durable coordinate and
canonical history, verifies all original event/causal/ordinal/digest relations,
and authenticates the selected bytes against their original physical file.
An L coordinate ending before the boundary remains L and its coordinateDigest
remains unchanged even after lawful append. A coordinate naming L but including
the boundary's switched successor, or naming P for a legacy prefix without its
boundary, refuses. The boundary-containing successor coordinate names P; the
boundary event itself was still validated and stamped under L.

No independent contract header exists in the inspected JSONL implementation.
This design neither inserts nor rewrites a header in old logs. Existing
prefixes, close handoffs, resource receipts and any other retained header or
inventory bytes remain verbatim. Their currentness can expire; their historical
meaning does not change. A purported empty legacy handoff requires its exact
genuine owner-issued identity and approved origin; equal empty hashes alone
cannot prove which profile owns it.

## 4. One native L-to-P append boundary

Use the existing `abg.operation.witness.admit#reprice` with its existing
typed six-field content and existing `declaration_reprice_admitted` event.
Reserve one declaration identity:
`declaration://abiogenesis/runtime/root-event-contract-profile@1`.

The content names that identity, beforeDigest=L, afterDigest=D,
changeClass=`design_reframe`, the actual owning ticket and a fixed profile
upgrade reason. The subject/context remains an **actual admitted authority
basis**, never a fabricated profile-as-execution-basis. The existing resolved
actor, exact grant, current WorkspaceBinding/ProductSet/lock, installed
definition, witness content contract and provenance checks remain mandatory.

The special owner also authenticates the current installed profile descriptor
and exactly one L entry close handoff. Its existing evidence/provenance vector
binds that entry coordinate/handoff and the current immutable descriptor by
exact refs/digests. Replay reconstructs the entry cut immediately before the
owning Public admission and verifies these coordinates. Neither an ordinary
WorkspaceBinding reprice nor a naked before/after digest pair is a profile
boundary. Normal binding/Program reprices remain separately required when
their identities change; a profile witness does not cover those pairs.

Acquisition uses the unchanged old handoff and actual L validation, under the
ordinary exclusive native append ownership. Reopening L never returns a P
entry prefix. The held native store records L as its active append contract;
upgrading the executable alone does not switch it. Read support or an
accepted new descriptor does not grant any operation on that store.

The witness owner (`admitWitnessedAct`, `abg/witness_admission_operation.ts`)
performs one expected-prefix transaction, `admitRootEventProfileUpgrade`
(`abg/event_store.ts`): its ordinary Public admission (`public_operation_admitted`
for `abg.operation.witness.admit`, member `reprice`) and the boundary
(`declaration_reprice_admitted` naming the profile declaration) are both L
rows, the boundary last. The ordinary actor, authority and owner checks precede
commitment. `assertRootEventProfileBoundary` accepts the transition only at the
exact current prefix and only once, and refuses it while an actor invocation
has no terminal row or a leaf CCall has neither its judgment nor a
`run_stopped` of its Run. A quiescent stopped or failed Run is not thereby
resumed, completed or retried. A store with a live or incomplete dispatch is
not repriced, and its stop or continuation is an append that the door below
refuses, so such a store is read and replayed and takes no append. A dispatch
is not settled by the absence of a PID.

Once the entire batch is durable, the same native owner changes the active
append profile to P and derives a **new successor** coordinate and close
handoff naming D. It does not alter the entry handoff. Staging uses L through
the marker; projected following events use P. In-memory profile state is
committed only with the durable batch; rollback before durable acceptance
retains L. After a durable boundary but lost return, the old handoff is stale
and ordinary reopen refuses. This supplement grants no crash-tail recovery,
truncation, receipt reconstruction, lock takeover or automatic retry.

Subsequent acquisition authenticates the returned P handoff against the full
unchanged physical stream and its unique boundary. New P3 execution requires
that active profile. A store whose durable prefix is on L admits no append
other than this reprice: `appendDurablyBatch` (`abg/event_store.ts`), through
which every durable append passes, refuses any other batch before writing a
byte and admits only the two-row batch of `admitRootEventProfileUpgrade`. The
refusal is a thrown error that the appending owner reports through its existing
refusal; the witness owner and `appendCheckedArtifactEvent` report
`sink_unavailable`. No in-memory boolean supplied by a caller can promote a
store.

## 5. Resource algebra, scope and replay

The ordinary exact-prefix read and transition combinators keep their same-store
and same-contract checks. Do not globally replace digest equality by "one of
two supported values." The singular reprice binding uses the already accepted
`bindStaticOwner` with one owner-authored strict closed receipt contract:
ordinary same-profile reprice receipt, or profile-transition receipt carrying
the exact native boundary proof. Its native owner performs/validates the same
expected-prefix transition; the common shell remains structural. This is not
a fourth combinator, new Public member, second reprice handler or bypass.

The boundary proof identifies entry/successor coordinates, descriptor L/D,
owning Public invocation and admitted witness event, actor/authority/basis and
exact changed profile. Derived proof is not another event or standalone
permission. Ordinary resource assertions retain exact closeHandoff and
handoffDigest; no caller "compatibility mode" is added. Other bindings receive
same-profile entry/successor coordinates and are unchanged.

Native prefix selection retains the authenticated profile schedule on the
immutable nominal prefix, including when selecting a scope or historical cut.
Do not validate every old event under the current superset merely because
structural fields overlap. Profile parsing is a native structural/history
dependency of semantic projection, not a semantic callback/host interpreter.

Replay uses the profile of each original event, not the importing module's
ROOT_EVENT_CONTRACT_DIGEST. A uniform L run projection at its original prefix
must reproduce its old shape and digest exactly. A uniform P projection uses D.
A genuinely mixed span uses a distinct closed profiled-relation projection:
the existing common event/relation/outcome fields plus ordered L/P spans and
the exact boundary witness; it must not squeeze two profiles into one false
eventContractDigest. Profile spans use existing normalized event-atom
coordinates in semantic identity and preserve admission ordinals/physical
coordinates in the physical projection. The current native contract declares
this new projection arm; historical legacy projection identity stays unchanged.

Profile transition itself grants no Run/GraphCall/CCall, callable membership,
retry, success, stop or resume. Existing BINDING018/WITNESS003/005/017 still
govern any changed execution segment, including exact substrate stamps and
covering reprices. No oldRun event reference becomes a newRun causation ref.
Existing failed histories stay failed; per-event profile provenance is not
qualification credit or an Event Calculus completion effect.

Every profile-sensitive historical source consumer preserves full store
identity while deriving profile compatibility through the same exact native
ancestry proof:
same original eventLogRef/device/inode; source prefix fully contained in the
current bytes; original source events equal their prefix positions; either
same profile or the one admitted L-to-P boundary after that source. Preserve
all current W/reprice/vector/origin/actor/producer/consume-uniqueness checks.
A generic two-digest allowlist is insufficient and is not selected. The source
qualification includes the preserved-construction recovery owner. If `abg/worksite_construction_recovery.ts` or another additional owner
requires a production change, its exact need returns for a bounded grant;
structural digest carriage is not native ancestry proof.

## 6. P3 owner observation and failure admission

The refusal is one repair of the shared native LeafPort owner seam for every
F_P leaf, not a change to any leaf's success schema. It is valid only before
any actor dispatch, invocation or evidence exists, and it is bound to the
actually selected native owner and the current CCall phase. The native
LeafPort captures the actual first failing stage before losing it: authority verification; worker-contract
resolution; implementation load/export; preparation/shape validation.
Closed stage-specific reasons distinguish negative returns, missing
contracts/exports, thrown errors and malformed preparation. Allowlist safe
error classes and system error codes; unrecognized errors remain
stage-qualified unknowns. In the existing trusted single-owner scope, a caught
native Error retains its small message and original stack through the existing
canonical JSON diagnostic URI owner. The retained body also binds the fixed
diagnostic class, stage, reason and safe class/code. It contains no prompt,
environment object, complete input or additional exception properties. Read only
native Error data and its built-in lazy stack accessor, never arbitrary thrown
object getters. Bound message/stack to 8192/32768 characters and disclose any
truncation. Uninspectable errors retain the stage-qualified fixed locator.
The existing failure value/output digest and owner evidence digest bind the
opaque URI; no new event kind, event payload field or profile is introduced.
Readers accept historical fixed locators unchanged; their erased causes remain
unavailable. Diagnostic text is retrievable evidence, never admission authority.
The existing `run_evidence` diagnostic projection exposes this retained subject
with its actual CCall/evidence/input/output/event/scope bindings and an explicit
`undispatched_owner_failure_evidence` kind. It validates those digests on cold
projection; a substituted diagnostic refuses. This does not create a
`runtime_failure_observed` event or change the typed non-advancing judgment.

The closed candidate binds the selected owner/resolution, exact occurrence,
CCall, inputDigest, selected failure contract and exact failure outputDigest,
stage/reason and safe nullable error class/code. The native owner validates
these coordinates at the current immutable prefix. Only an F_P leaf before
actor dispatch may use it. Actor-absence checks follow actual native linkage:
actor transport/invocation belongs to its CCall; process/stream children
belong through actor invocation. Checking payload.cCallRef alone is insufficient.

The new evidence is `undispatched_owner_refusal` in the existing
c_call_evidenced family, not probabilistic transport or deterministic work.
It is one actually admitted native owner observation. Its exact declared
failure value is implementation_exception or malformed_return, with the safe
stage-specific diagnosticRef; result admission then produces the ordinary
non-advancing judgment. Preserve admitResult's nonempty exact evidence gate,
same CCall/phase and output digest. Success, post-dispatch, another owner,
wrong input/attempt/occurrence, missing or extra fields, or conflicting
evidence refuse. No fallback to fabricated actor evidence, empty exchange,
synthetic deterministic execution or admission_rejection to hide the cause.

Native occurrence, staging, CCall reconstruction, evidence/result/judgment
projection and fresh replay use this same arm. Legacy failure values/events
and their erased initiating exceptions are not repaired retroactively.
"No dispatch" does not assert zero preparation filesystem activity: preserve
all actual task/launch/archive residue and normal ownership/cleanup exclusions.

Evaluation exercises every undispatched first-stage code with zero actors,
refuses a forged owner, phase or occurrence and use after dispatch, and replays
cause equality and the secret-safe classification; the existing success and
failure gates stay. Realized by `implementation/leaf_invocation_port.ts`
(`closedUndispatchedProbabilisticOwnerReceipt`), `abg/c_call_outcome.ts` and
`abg/c_call.ts` (the `undispatched_owner_refusal_evidence_candidate`,
`undispatchedOwnerEvidenceMatches`) and `abg/runtime_failure.ts`
(`undispatched_owner_failure_evidence`).

## 8. Conserved boundaries

Original masked failures and unknown initiating exceptions remain immutable
history in the [accepted proposal and evidence](../../../../.ai-workspace/comments/codex/20260911_P3_NATIVE_CONTRACT_COMPATIBILITY_HOW_22/proposal.md#8-explicit-residuals).
Current implementation/proof status belongs to [T-287](../../../../.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md#readiness-and-next-re-entry), not this HOW.
The final semantic consumer, D1–D6/S06 and same-subject qualification/release
remain distinct obligations. EVENTS022/023 liveness/interruption is included
in this combined current profile and governed by the liveness HOW; its actual
source and installed proof remain required. It is active 5.0 law, not F12
deferral or an excluded P3 implementation residual. This HOW does not
supply global recovery, arbitrary profile migration, archived-log import,
mutable schema selection or a shortcut to those obligations.
