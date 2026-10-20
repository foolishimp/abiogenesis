# T-289 Immutable Installation Event Bodies

## Authority and outcome

Executive accepted this bounded `design_reframe` on 2026-09-20 under T-289,
Product ABG admission/replay, REQ-R-ABG3-PAYLOAD-001..006 and
REQ-R-ABG3-EVENTS-024/025/032. It changes installation event representation,
not Product meaning, install admission, physical currentness, or publication
ordering. STDO RC7 and ABI5_PROJECT_REFERENCE_FRAME_BASIS remain the basis.

## Representation and owners

`environment_admission.ts::admitArtifact` uses its already validated predecessor
artifact projection to encode a valid Product install candidate as the closed
body `{kind: "product_install_lock_row", schemaVersion: "5.0.0", productId,
installId, installedRoot}`. Every other candidate field is exactly derivable
from the selected complete lock row, fixed candidate kind/disposition/schema,
and lock id/digest. This is an event body encoding, not a Product candidate or
an admission carrier. The unchanged candidate predicate and full candidate
canonical digest establish equivalence before publication.

The first installation for a lock embeds `resolvedLock`. Later distinct install
admissions with that exact lock use the same `resolvedLock` slot for a closed
`{kind: "resolved_product_lock_reference", schemaVersion: "5.0.0",
admissionEventRef, admissionEventDigest, lockId, lockDigest}` body. The tag
is disjoint from the inline `resolved_product_lock` shape. The event-contract
field table, native profile digest, and historical stamps remain unchanged;
Executive accepted this carrier adjustment after the existing closed event
contract refused a new top-level key during the first focused discriminator. The source is an earlier valid install admission in this same
stream which physically embeds the lock. The source digest is its admitted
payload digest. That source is the later event's sole causation reference.
No body event, sidecar, catalog, process cache, or new runtime authority exists.

`artifact_truth.ts` folds each event in admitted order. It accepts exactly one
inline or reference lock form for the compact representation. A reference must
match an earlier validated, physically embedded source's event identity/digest
and lock identity/digest; chains, cycles, missing, forward, wrong, malformed,
and mixed sources refuse. The selected product row must exist exactly once.
The reader reconstructs the full candidate, checks the unchanged Product raw
predicate and full artifact digest, and only then exposes the install fact.

Historical complete candidate plus embedded lock events retain their original
zero-cause branch. They may supply an exact embedded lock to a later compact
admission. Workspace binding continues to cite each actual install admission;
a body reference never stands in for the distinct target install admission.
Complete candidate/lock projection rows remain derived values, preserving
`rehydrateProductInstallRowFromRows` and its downstream contracts.

## Ordering and evidence

Existing predecessor physical checks, exact invocation/scope guards, successor
semantic projection before append, durable append, and effect/publication
ordering stay in force. Compaction eligibility and encoding preserve the same
structured `artifact_truth_conflict` refusal as successor projection when raw
candidate validation throws; the supplied predecessor remains unchanged and no
bytes append. This error boundary does not broaden Product validation or change
valid candidate encoding. Serialization does not erase the install's own
invocation, scope, identity, digest, event identity or availability effect.

Focused tests cover real owner production, cold reconstruction in a fresh
process, historical/new mixed bodies, full candidate equality, malformed and
missing/wrong/forward references, reference chains, wrong product selection,
wrong candidate identity/digest, mixed forms, and unchanged physical-byte
refusal. Mutation histories are isolated refusal probes, never accepted runtime
evidence. Executive owns the one deterministic installed Hello composition,
independent assessment, canonical application and delivery disposition.

## Native basis-input and CCall-result physical bodies (T-287 / RC1)

The T-287 body-projection increment applies the same earlier-inline-body reuse
principle under the selected STDO v2.5.1-rc.1 basis. Installation representation
above is unchanged. `event_store.ts` owns exactly two native slots:
`basis_admitted.payload.rawInputValue` and `c_call_result_admitted.payload.value`.
It retains complete logical RuntimeEvents and all original event, payload,
input, basis and result digests. Each admission and causal/runtime lineage
remains distinct. Reusing bytes grants no source, currentness, effect, judgment
or continuation authority.

The first whole body is physically inline in an ordinary event row. A later
identical body may be represented by the closed JSONL record
`{kind: "abg_admitted_body_reference_record", codecVersion: 1, event,
bodyReference}`. `event` is the original logical event with only its selected
body field absent; its kind fixes that field. `bodyReference` contains exactly
`sourceEventRef`, `sourcePayloadDigest`, `sourceSlot` (`basis_input` or
`c_call_result_value`) and `bodyDigest`. Both selected slots may reference either
source slot. The wrapper is physical storage vocabulary, not a RuntimeEvent
kind or a reserved marker inside arbitrary Product JSON. A reference is used
only when its encoded row is smaller than the inline row.

The source must be an earlier validated row in this stream that physically
contains the body. The codec restores that value before unchanged logical event
validation. Missing, forward, foreign, crossed, wrong-digest/slot, chained and
mixed inline/reference forms refuse. Body references do not add semantic
causation edges. Legacy inline histories and mixed histories remain readable;
old readers are not claimed to support the new physical record.

The existing store owns a disposable lookup of first physically inline sources
and exact per-event physical prefix correspondence. Cold reconstruction derives
both from actual bytes. Append stages new eligibility and offsets; successful
write/fsync publishes them with the history and SHA continuation. Rollback
cannot publish tentative sources. No sidecar, extra event, independent store,
configurable path registry or Public codec operation is introduced.

Physical lengths and prefix digests always describe encoded bytes. Existing
C1/C3 source-cut construction in `execution_basis.ts` obtains its coordinate
from `event_store.ts::durableRuntimeEventPrefixThroughEvent`; F_H predecessor
checks in `fh_continuation_projection.ts` consume the same owner's
`runtimeEventPhysicalPrefix` correspondence. In-memory histories without a
physical resource retain ordinary inline serialization. Historical ancestry,
close/reopen, and `event_log.ts::persistEventLog` must not infer physical bytes
by serializing expanded values. Public/replay/domain consumers receive only
full logical events; physical source correspondence does not confer append or
currentness authority.
