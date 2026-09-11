# T-287 Native Event-Contract Compatibility

**Status:** Accepted bounded HOW. Source implementation, package, installed execution and qualification are separate subjects and grants. Fixed16, GOAL-035/T287 and F12/S04 at5.1 remain unchanged.
**Owner:** Existing ABG event-resource, witness, evidence/admission and replay owners.
**Acceptance and exact source basis:** [Executive disposition and application](../../../../.ai-workspace/comments/codex/20260911_ABG5_EXECUTIVE_CHECKPOINT_11/accepted-subjects-and-reviews.md).

This refines [C2 forward re-entry](T287_C2_FORWARD_REENTRY_DESIGN.md) sections7 and9. Its forward-source, currentness, failure and effect limits remain binding. [Interrupted resource recovery](T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md) separately owns abandoned acquisition; compatibility does not acquire or recover a resource.

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

Let P be the one current profile, named
`abg.event-contract.root/p3-undispatched-owner-refusal@1`. Its immutable
descriptor binds L, the unchanged aggregate census, the exact current event-kind
census including those two liveness kinds, the exact current payload table and
the current envelope stamp declaration. Compute
its digest D from the exact implemented canonical descriptor; D must differ
from L. D is not allocated by this prose and is never a placeholder runtime
value. Source/package freeze must publish the computed full D, exact
descriptor and native typed locator before installed preparation.

P conserves every old payload arm and introduces the closed
`undispatched_owner_refusal` arm, the two liveness kinds and the envelope stamp
described below. The exact current payload table binds the native probe/policy
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

The exact witness owner performs one expected-prefix transaction: its ordinary
Public admission and the profile reprice are L-valid, with the reprice last.
All ordinary actor/authority/owner checks precede commitment. The native
transaction accepts the transition only at the exact current prefix, once,
with no in-flight effectful CCall/actor or concurrent acquired owner. A
quiescent stopped or failed Run is not thereby resumed, completed or retried.
A live/incomplete dispatch returns to its existing stop/continuation owner;
compatibility cannot settle it by absence of a PID.

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
that active profile. A legacy-held store may admit only L-valid facts through
its existing authorized owners; it can never admit the P3 arm or P envelope
without this boundary. No in-memory boolean supplied by a caller can promote it.

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
qualification includes the forward owner and preserved-construction recovery
owner. If `abg/worksite_construction_recovery.ts` or another additional owner
requires a production change, its exact need returns for a bounded grant;
structural digest carriage is not native ancestry proof.

## 6. P3 owner observation and failure admission

Preserve accepted forward HOW7. The native LeafPort captures the actual first
failing stage before losing it: authority verification; worker-contract
resolution; implementation load/export; preparation/shape validation.
Closed stage-specific reasons distinguish negative returns, missing
contracts/exports, thrown errors and malformed preparation. Allowlist safe
error classes and system error codes; unrecognized errors remain
stage-qualified unknowns. Do not retain arbitrary message/stack, prompt,
environment/credential value, path-derived secret or a digest of those values.

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

## 7. Readiness and separate activation order

The [accepted P3 source/test owner plan](../../../../.ai-workspace/comments/codex/20260911_P3_NATIVE_CONTRACT_COMPATIBILITY_HOW_22/source-test-plan.md)
and [accepted liveness source/test owner plan](../../../../.ai-workspace/comments/codex/20260911_D4_NATIVE_LIVENESS_CONSERVATION_HOW_24/source-test-plan.md)
jointly pin the finite cone and decisive tests. The liveness plan supplies the
actor-supervision and Event Calculus changes that the original P3-only plan
excluded. Preserve every P3 no-actor/success gate and exact profile/resource
constraint. Implementation first freezes L, computes/publishes D and proves
old-only replay byte equality, exact boundary admission, fresh P genesis,
cross-profile source ancestry, P3 first-stage failures and the declared liveness
admission/consumer/replay discriminators. No runtime closure follows from pure
or synthetic stores.

After independent source review, later package/install preparation must
freeze the exact new profile descriptor/catalog/ABI owner cut, real grants,
old current handoff/physical state, new installs/W and required separate
binding-cover witness. It must also resolve any interrupted acquisition under
its own accepted owner law. Profile compatibility does not make the observed
D2 abandoned tail safely reopenable.

Only a separate native grant may admit the profile witness or invoke work.
Before live forward effects, accepted HOW9 requires genuine P3 undispatched
negatives and fresh result/replay preserving the specific cause with zero
actor execution. Worker20's source sequencing exclusion is not a waiver.
No package/native preparation is authorized by this design alone. Any
separately accepted required native-kind additions selected for the same
current Product must be composed into the one current profile before its
publication. This design does not grant those additions or authorize a third
accidental migration to compensate for omitted required kinds.

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
