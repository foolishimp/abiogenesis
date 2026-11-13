# Independent classification of the remaining owner relation

Returned by `/root/rc5_scope_review`, max, on 2026-11-03 UTC. Root records the
reviewer's completed read-only diagnostic. This is not review or acceptance of
the moving native-02 implementation.

## Product frame and exact subject

Fixed ABIogenesis 5 feature set, GOAL-035/T-287 whole-path consolidation under
STDO 3.0.4. Reuse established owner facts during ordinary execution, preserving
admission, currentness, effects, refusals and cold reconstruction. Product
819-848 and PROJECTION-002/025 distinguish these uses. No new cache, store,
authority or Public meaning is needed.

The reviewer verified subject
`remaining-owner-triage-001/SUBJECT.json`, SHA256
`e588601011c7c5ba57e11246f52495b7874ad320e3b09420b35dbcf8468d2fcc`,
all five frozen source hashes and both diagnostic hashes. Source routes below
are from f49e7533ebedff0946383cb0c5380a6ecac7889d, not active native-02.
`S` means `build_tenants/abiogenesis/typescript/code/src/`.

## Completed classification

The remaining scope is three connected migrations: artifact/environment
acquisition; invocation/F_H fact selection; ordinary Run completion/read
projection. Retry-budget selection is a smaller affected query in that cone.

| Owner under S | Required information | Redundant work and existing mechanism |
|---|---|---|
| abg/artifact_truth.ts:851-882 | Complete artifact rows, uniqueness/availability, exact coordinate and projection digest; not a complete event-vector output | exact projection at854 obtains a complete array; owned projection859-862 already invokes the same derivation through the existing owned reader. Artifact facts619-629 already advance from relevant Calculus effects. |
| abg/effectful_invocation_truth.ts:119-274 | Availability/duplicate result and global malformed-pair/duplicate validity across artifact, Run, F_H and construction facts | Coordinate branch144-152 reads all history and separately reacquires exact artifact truth. Owned-input scans212/231 visit all bodies to select basis/public-operation rows. Existing kind/ID/payload indexes and exact execution/invocation projectors supply the relation. Preserve global checks186-206/240-256; requested-invocation-only checks would weaken behavior. |
| abg/fh_continuation_projection.ts:826-1131 | Relevant public/owner pairs, exact historical boundary, basis/invocation/grant correspondence and complete pair coverage; output facts or refusal refs | filter838, find914/1005/1008 and exactPublicOperation126 can use kind/aggregate/ID selection. Historical cuts already preserve owner support. Resume validation386/439 scans/slices bodies; existing runtimeEventPhysicalPrefix(RuntimeHistorySelection) at event_store1394-1405 preserves complete physical predecessor validation. |
| abg/replay.ts:2199-2328 | Complete selected-Run atoms/relations/owner facts, evidence coordinates, replay identity and declared full-history digest | fullEvents.map2230 visits every body just for ID membership; consumers1731-1795/2144-2155 use only .has. Existing indexed envelopes/ID membership suffice. Keep selected-Run processing and runtimeEventPrefixDigest2309; event_prefix805-820 already maintains its incremental canonical checkpoints. |
| abg/calculus/liveness.ts:797-828 | Exact CCall opening, prior retry/progress, budget/digest checks and absent/many/invalid behavior | Already related/basis-indexed, not unscoped readAll. indexedRuntimeEvents nevertheless materializes each bucket before filtering. Select envelope kind/scope/ordinal before exact body reads, retaining budget-cut invalidation, resolveExactMatch and record checks. |

Correction to the initial diagnostic routing hypothesis: creating
RuntimeEventBodyView or passing it to selectValidatedRuntimeEventPrefix does
not itself expand history. event_prefix469-472 recovers the authenticated owner
and scopes it without materialization. effectful180-182 and F_H880-885 are not
expansion sites on that input. The later filter/map/find/slice operations acquire
bodies at runtime_history652-682. The correction supersedes that initial
interpretation, not the retained observation of repeated body visits.

## Finite ordinary caller relation

Artifact/environment acquisition:

- abg/environment_admission.ts489: exact workspace environment to artifact truth.
- Same owner790/862/876/1238: install/artifact/workspace admission and duplicate checks.
- owner_bindings/run_invocation.ts1144: setup truth; consumers1262/1938/2016/2095/2215.
- abg/invocation_admission.ts897/923-934: environment, held predecessor, duplicates.
- product/materialization_definition_bindings.ts362/382: pre-effect duplicates and admitted scope.
- product/release_snapshot_definition_bindings.ts50/54-55/119/123-124: environment, fresh invocation, artifact conflicts.
- product/project_read_ports.ts786: release artifact read.
- abg/qualification_proof.ts138-149: acquired source facts and graph-owner reconstruction.

Effectful invocation facts:

- environment_admission876; invocation_admission932; continuation960;
  construction_continuation1673; owner_bindings/run_invocation1942/2020/2099;
  materialization_definition_bindings362; release_snapshot_definition_bindings55/124.
- These reach effectful_invocation_truth, invocation_execution_truth557-634,
  fh_continuation_projection826-1131 and construction-operation validation.

Ordinary completion/read:

- owner_bindings/run_invocation1653/1709/1733/1990/2064/2147 ->
  abg/project_read_ports949-964 -> canonicalRunContext835 -> runContext737 ->
  replay.projectOwnedRunReplayContext2190 -> projectRunSemanticReplay2199.

The environment wrapper is the central adoption point. Its existing execution-
basis, declaration, worksite, recovery and read consumers keep the same output
checks without duplicating artifact acquisition. Direct consumers above also
belong to the continuation. Earlier write lists do not exempt materialization
or release. qualification_proof138-149 is a real array consumer; preserve its
pairing, competitor and provenance checks while separating those from a complete
source-vector handoff. Genuine external proof acquisition remains.

## Boundaries and retirement

Cold authentication and complete-body expansion are distinct. event_prefix81-87
separates pure owned projection from explicit read/currentness. event_store
3558-3592 reuses authentic selection where permitted; unbound/copied inputs
retain physical identity, extent, digest and decode checks. Durable currentness
at2082, held-store, transaction and generation checks remain. A historically
valid cut is not necessarily current; copied receipts and stale worksite
observations cannot borrow valid lifetime facts.

F_H prepared APIs in continuation240-245/276-282 declare complete projectedPrefix
outputs, constructed1034-1054/1541-1563. Successful committed response285-289/
1635-1638 returns a durable successor, but its union291-293 permits duplicate or
invalid-history output carrying a supplied complete validated prefix. Preserve
both output contracts. Neither requires complete-prefix output from the ordinary
projectFhEffectfulPublicInvocationFacts facts/refusal query.

Retirement candidates after actual consumer migration:

- artifact_truth841-844 runtimePrefixFromArtifactTruth has one production
  consumer, qualification_proof141; remove if its consumer becomes owned based.
- environment_admission787-790 is one forwarding wrapper consumed862; do not
  retain a second acquisition route after adoption.
- replay119-128 projectRuntimePrefixesAtDurablePrefix feeds
  hog/operator_support40 and owner_bindings/run_invocation1578/1940/2018/2097/2218.
  These need prefixes, not arrays. Its complete-output wrapper131 has no
  production invocation beyond export found. Retention needs a concrete contract.
- projectExactPrefixArtifactTruth is not automatically dead: copied projection
  validation at916 remains a reconstruction consumer.

The sufficient write cone is the fact/replay owners and central acquisition/read
consumers above, plus operator_support/exports for obsolete adapter retirement.
Existing event_prefix, runtime_history, event_store and derivation facilities
already supply the relations. No missing foundational library was identified.

## Proportional proof and limits

Continue the installed meter through setup, invocation, traversal/continuation
and terminal projection. Separate unrelated growth from prior-invocation growth;
retain work/bytes and baseline. The former one-expansion threshold is not Product
law. Compare exact results/refusal refs at identical cuts, including malformed
pairs or duplicates elsewhere while requesting a fresh invocation, and orphan/
mixed-arm F_H/construction operations. Preserve selected-Run semantic output,
canonical/full-history digest and out-of-scope-versus-missing behavior.

Reuse focused t287-exact-prefix-projection-reuse and t287-ordered-reconstruction
proof for cold reopen, changed identity/bytes, explicit currentness and rollback.
Exercise actual setup and affected materialization/release acquisition; mocks
alone cannot establish migration. Do not rerun whole qualification.

Classification is complete for this frozen named owner/caller cone. It does not
assess native-02, establish whole-path efficiency, assign CPU shares or accept
source. No edits/tests/builds/provider calls. Same-family reviewer and unrestricted
host; no clean-family independence claim.
