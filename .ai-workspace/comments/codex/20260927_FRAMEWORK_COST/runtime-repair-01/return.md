# T-287 framework cost correction — bounded Worker return

Implemented the three authorized existing-owner contractions. Source is frozen against HEAD `a045517364171df7f85b4606337a25a1d115ad75`; exact source, compiled-module, and test hashes are in `measurement-subject.json`. No Product/HOW, public schema, body encoding, event/stamp identity, digest algorithm, package, installation, provider, or retained Run history changed. No reviewer was launched. This return supersedes no diagnostic facts from accepted report SHA `d21a8510dea8d8addb1b7d2779737e4d9b5a51608c7498a10f0f8c7f9dc07780`.

## Changes and owning relations

1. `project_read_ports.ts`: remove the unused eager workspace calculus from `PreparedRead`, `prepareRead`, and historical GraphCall source preparation. `projectWorkspaceReplay` still explicitly derives the complete calculus. Named Run/GraphCall reads retain their `runContext` causal-scope derivation. This includes the Executive's explicit scope correction: unrelated historical liveness is no longer a blanket prerequisite for a named Run read. Full physical/payload/stamp admission and selected target/source liveness/provenance remain. Authority is REQ-R-ABG3-PROJECTION-002/-023/-025 and realization E08/E09/E10/E14/E15; workspace-wide E13 remains separate. No replacement global validation pass was added.
2. `event_store.ts:3186`: cold decoding retains physical canonical framing, body decoding, exact key/shape/profile checks, payload admission, causation, and reconstructed eventId/admissionOrdinal/payloadDigest equality. Reconstruction receives every candidate field unchanged; only the already-checked profile and these stamps are added. The additional canonical equality of both complete logical events therefore establishes no new fact and is deleted. At 128,721 events this removes exactly **257,442 whole-logical-event serializations**, a source-derived count rather than a sampled invocation count.
3. `replay.ts:676`: retain the route/type guard, then consume the raw-admitted input returned by `projectRetainedWorksiteInputAtPrefix`. That owner already reconstructs the exact entry/source/foldback join, raw-admits it, and compares the complete asserted carrier. Replay no longer raw-admits and hashes that large value again. Malformed retained inputs still refuse. A tampered raw carrier may now report the existing generic provenance TypeError instead of the former earlier raw-identity TypeError; no typed Public refusal code changes.

The end-to-end relation stays declaration/input admission → immutable journal event → validated cold prefix → selected causal replay → Public truth. Immutable source definitions embedded in runtime values remain byte-for-byte part of the retained history; this repair does not reinterpret or repack them. No cache acquires new authority.

## Verification

`./node_modules/.bin/tsc -p tsconfig.json` passed. The affected decoder, body encoding, retained-route, and projection tests passed: **19 pass, 0 fail, 1 deliberately skipped material-history fixture** (`affected-checks-final.log`). The authorized frozen-history run below supplies the one material read; no additional historical campaign ran. `git diff --check` passed for the six changed source/test files.

Added focused controls preserve changed-payload/envelope/stamp/unknown-key refusal, malformed retained raw identity/contract/source refusal, and target-liveness refusal. The liveness discriminator also proves unrelated malformed liveness does not block a selected Run, while workspace replay still refuses it. Its immutable-event premise uses existing fixture injection; decoder/codec tests separately exercise physical admission. This is module-owned evidence, not installed Product qualification.

The retained-route fixture's stale continuation override initially failed with both the frozen predecessor and candidate. The fixture now supplies that same declared continuation through its actual traversal-cursor owner. Both versions pass with the corrected fixture. Logs retain the initial failure and exact-predecessor control; no production change was needed for that fixture issue.

## Single frozen-history measurement

Exactly one repaired cold acquisition used exported APIs: `reopenEventStore` → `projectRunTruthAtDurablePrefix` (which enters changed `prepareRead`) → an additional `projectRunSemanticReplayProjection` over the held validated prefix → close. The transient existing-owner lock was released; there was no append. `profile-read.mjs`, `owner-read-result.json`, `owner-read.cpuprofile`, `cpu-summary.json`, and `comparison.json` retain the evidence.

| Scope | Baseline retained diagnostic | Repaired diagnostic |
|---|---:|---:|
| Cold prefix authentication + Run selection helper | 36.884 s | different entry below |
| Existing-owner cold reopen | not separately measured | 24.433 s |
| First selected semantic helper / Public Run truth | helper 21.907 s | Public truth 20.457 s |
| Additional held semantic identity verification | absent | 1.789 s |
| Cold decode inclusive CPU samples | 31.639 s | 21.975 s |
| Cold-phase canonical encoding inclusive samples | 22.196 s | 13.021 s |
| Decoder-direct canonical encoding samples | 11.631 s | 2.793 s |

The baseline helper bypassed `prepareRead`; the repaired Public API includes it and additional truth assembly. These are disclosed timing scopes, **not equivalent full CLI timings or an isolated timing estimate for deletion 1**. Repaired cold acquisition plus Public truth was 44.891 s; the complete instrumented sequence including extra identity verification was 46.680 s. Imports, file setup, source snapshots, compilation, and post-profile body statistics (1.503 s) are outside those phase times. No history copy was made. CPU samples are approximate inclusive attribution; phase cuts can straddle the profiler-start offset by approximately 25 ms. Common whole-profile cold-decode totals avoid that cut ambiguity.

The discriminator supports the mechanism: decoder-direct canonical work falls sharply while required reconstructed-event hashing remains approximately stable (10.852 s baseline versus 10.660 s repaired cold-phase `sha256Canonical` under reconstruction). The replay-local raw admission is absent from repaired source and samples; the provenance-owner admission remains (~0.466 s inclusive). `prepareRead` contains no full calculus call; the named replay calculus remains (~3.879 s). No claim is made that sampling measures exact invocation counts.

All retained identities match:

- 991,116,806 physical bytes; 128,721 historical events; 134 selected Run events and 235,804,871 logical JSON bytes.
- Semantic view `sha256:dc7123652132ba8002776ef46f9ea438f2fa2f2f40a0ca21077fd7c6bf759be0`.
- Native replay `sha256:4f2300312f2a2fd4a493a37bd72edb09fb39f8f783b75d400f803607d00ccffb`.
- Same failed Run and null terminal/result, same exact owner close coordinate and physical prefix digest. Journal size, inode, and mtime match before/after. The reopen/close path authenticates the same physical prefix digest.
- Zero actors and zero event writes. The original 250.771 s execution and 91 s CLI receipts were not rerun or relabeled as repaired performance.

## Residual work above ten seconds

Both 24.433 s cold recovery and 20.457 s Public truth exceed the investigation trigger. The profile attributes cold recovery to required decoding, canonical physical/payload/event validation of the retained 991 MB journal, and allocation/GC; disk read is not the dominant cause. Public truth still spends ~6.458 s on liveness's runtime-event-prefix digest, ~3.879 s in selected calculus, and substantial canonical work in exact execution-basis recovery, provenance equality, and semantic payload digests. These inclusive numbers overlap and must not be added. RSS samples were 3.917 GB after reopen, 3.172 GB after Public truth, and 4.560 GB after the extra identity check; they are not peak measurements or memory-improvement claims.

The original large immutable declaration envelopes still cross runtime boundaries as values: entry → reacquisition request → reacquired task → retained prepare join. This grant removes redundant establishment of facts at three owners; it does not remove those retained bytes or redesign digest/liveness ownership. Parent's separate GLC shared-basis contraction addresses repeated consumer classification. Further framework work requires a new concrete owner/scope decision; this Worker makes no broader repair or PC05 readiness claim.
