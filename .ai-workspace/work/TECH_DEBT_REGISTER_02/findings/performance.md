# Performance: measured costs of the RC12 head

Commentary, not law. Area: performance measurement. Reviewer: Claude Opus 5.5, for the Executive. Written 2026-11-12. No tracked file was changed, nothing was committed, and no provider, model or network call was made.

## Subject and conditions

- Built copy T = `/private/tmp/abg-rc12-consensus-20261111/build_tenants/abiogenesis/typescript`, head `34aafb2c6`. Every scripted Run packs T, then verifies and installs the result in a scratch root. All Run numbers below come from that scratch install of the T build.
- Installed candidate: `~/Library/Application Support/ABIogenesis/installs/5.0.0-rc.12/...`. Release archive `abiogenesis-typescript-tenant-5.0.0-rc.12.tgz`, 11,062,933 B, cut from `95da94e72`. Both were used read-only, for measurement 4 and for the refused-call baseline.
- Live Run evidence: `rc12-executive-01-evidence/live-01/` (`events.json`, `measures.json`). It is the logical event list as the reader returns it, not the physical log.
- Load: a whole-suite test run shared the machine, with a load average of 14 to 27 on 16 cores. **Every wall-clock time here was taken under that load.** CPU-profile milliseconds, counters, bytes and ratios are the numbers to rely on. Each measurement was run at least twice unless stated otherwise.
- Labels on numbers:
  - **(m)**: measured by me in this review.
  - **(e: …)**: measured earlier, with the source cited.
  - **(r)**: read from source or records.
  - **(d)**: derived arithmetic from measured values.
- Profile attribution:
  - Self time is by leaf frame, weighted by the following sample delta.
  - Inclusive time counts each function once per stack.
  - "Nearest Product owner" is the first `build/code/src` frame above the leaf that lies outside the `shared/` helpers.
  - V8 often folds built-in `JSON.parse`/`stringify` time into the caller's self time, so the JSON bucket is a lower bound.
  - Work on the libuv thread pool (async `lstat`, `readFile`, `open`) does not appear in CPU profiles. It lands under idle. Where it matters I cite process system time and the counters.

### Summaries kept under `/private/tmp/abg-perf/` (raw profiles sit beside them)

| Measurement | Summary files |
|---|---|
| M1 | `m1-summary.txt` (CPU by process role, both W1 runs), `m1-w1-run1.txt/.json`, `m1-w1-run2.txt/.json` (all processes), `m1-cli-r1.txt`, `m1-cli-r2.txt` (start CLI only), `m1-w1-run1-cli-owners.txt`, `m1-cli-r2-owners.txt` (owner attribution), `cnt-w1/cli-67626.json` (counters of the start CLI) |
| M2 | `m2/prof-run_status-1/agg.txt`, `owners.txt`, `m2/prof-run_replay-1/agg.txt`, `owners.txt`, `m2/prof-refuse/agg.txt`, `m2/cnt-fs/*.json`, `m2-intake/cnt/*.json` |
| M3 | `m3-cold/cold-rows.json`, `m3-cold/cold-run_status-steady.owners.txt`, `m3-held/held-rows.json`, `m3-held/held-run_status-steady.owners.txt` |
| M4 | `m4-none/m4-none.json` (with `m4-none.log`, the GC trace, and `m4-none.time`), `m4-alloc/m4-alloc.json`, `m4-live/m4-live.json`, `m4-cpu.time`, `m4-cpu/m4-none.json`, `m4-cpu/agg.txt`, `m4-cpu/owners.txt`, `m4-alloc/heap-alloc.txt`, `m4-live/heap-live.txt` |
| M5 | `m5-live-census.json`, `m5-live-breakdown.txt`, `m5-w1-store-census.json` (physical log), `m5-w1-logical-census.json`, `m5-w1-logical-breakdown.txt` |
| M6 | `m6-w1-run2-timeline.txt` |

Scripts: `/private/tmp/abg-perf/scripts/`. These are the driver (`drive-witness.mjs`, which calls the harness `runWitness` with `keep:true`), `counters-preload.mjs`, `m3-reads.mjs`, `m4-verify-install.mjs`, and the Python aggregators. The kept W1 store is `/private/tmp/abg-perf-tmp/abi5-root-env-keUcLZ/runtime/events.jsonl` (2,198 rows, 17,401,923 B). It is described by `/private/tmp/abg-perf/w1-store/summary.json`.

## Status of earlier findings at this head

| Earlier finding | Where measured | Status at this head | Evidence |
|---|---|---|---|
| About eleven whole-log passes per Run | RC6 operational review (`20261106T024745Z…`), 1 GB log | **Repaired on the Run path; still present on reads** | Start CLI of one W1 Run: 1 history decode (of the 3 setup rows), 1 reopen, 2,198 body reads totalling 17.4 MB, which is each row once (m). Every cold read still decodes the whole log, twice per in-process read (next row). |
| The same prefix decoded and folded twice per read construction | RC6 review: 27.5 + 26.8 s decode, 40.1 + 37.0 s fold, 142 s | **Still present on the reopen path. On the held path the decode is gone, but bodies are re-read instead.** | In-process reopen read on the W1 store: construction makes 1 full decode plus 7,057 body reads (90.8 MB); the call makes 1 full decode plus 7,113 body reads (92.2 MB); about 11 s of CPU per read, the same on calls 2 to 6 (m). Held read: 0 decodes, but 2,845 body reads (43.9 MB) in construction and the same again in the call, 3.8 s of CPU (m). |
| Canonical JSON plus SHA-256 over half of cold-read CPU | RC6 review: 52–55% | **Still present: 64–68%.** The work moved into the per-body reader. | Cold CLI `run_status`/`run_replay`: 64.5% and 67.6% of busy time (m). Start CLI: 54.4% and 57.7% (m). |
| Six context copies per Run | RC6 review: 14.7 MB context × 6 | **Partly repaired** | The `before ≡ task.context` duplicate is gone, and the task is a separate result kind (m). In the live Run each worksite snapshot of 8–10 KB still appears 8–13 times, across `basis_admitted.rawInputValue.context`, `c_call_result.value.context/after` and `traversal_route.boundInput.value.source.after`. `runEnvironment.contexts` is 402 KB, once, in `invocation_admitted` (m). The worksite here is small, so the scale-up to a 14.7 MB worksite is not shown. |
| Probes a third of the log | RC6 review: 85,005 rows, 35.4% | **Still present (28–30%). The cause has changed.** | Live Run: 931 probes and 3.69 MB (29.1%) against 113 stdout rows (m). W1: 1,225 probes, 4.82 MB (30.4% logical, 27.7% physical) (m). Now one probe per enclosing scope per progress event: 219 events emit 3 probes each and 21 actor lifecycles emit 8 each. The full probe contract is inlined in every probe: 39% of probe bytes, 565 distinct contracts across 1,225 probes (m). |
| Whole-call `structuredClone` in the definition-call transport | RC7 transport review | **Repaired** | `structuredClone` self time is 33–34 ms per W1 run (m). Counters: CLI `detaches 1` (the raw CLI candidate, lawful) (m); in-process reads `establishedCarries 1`, `detaches 0` (m). |
| Installation verification hashing all members three times per call | RC9 review F3: 3 verifications and 15,969 hashes per SDK call | **Still present and larger per Run** | One W1 Run (one Public start) makes 139 content verifications, 378,415 file hashes, 420,080 `lstat` and 41,526 directory lists (m, counters). That splits as 71 full root-product verifications of 5,325 files and 68.5 MB each, plus 68 of the 5-file fixture (d). That is about 4.9 GB read and hashed per Run (d). |
| Cold CLI launch grows with log size (120 s → 487 s on a 2 GB log) | RC7 build-cycle diagnosis | **Still present (proportional to rows)**; not re-measured at GB scale | Cold CLI `run_status` takes 1.08 s on a 50-row, 3.9 MB store and 5.8–6.3 s on a 2,198-row, 17.4 MB store (m, ×2 each). Held acquisition takes 0.66 s at 17.4 MB (m). The refused call with no work takes 0.34–0.38 s and 201 MB RSS (m, ×3). I do not extrapolate to GB logs, because row composition differs from RC6. |
| One cold read 142 s on 1 GB (in-process) and 68.8 s (CLI) | RC6 review | Not re-measured at that size | See the previous row. |
| Each installed test case peaks at about 0.93 GB of heap | `rc12-executive-01/M_RETURN.md` | **Confirmed** | The live heap after a full GC during `verifyProduct` reaches 889.8 MB (m, GC trace). heapUsed before GC reaches 1.15–2.42 GB depending on GC timing and the profiler. Peak RSS is 1.9–3.6 GB without the allocation profiler and 5.4 GB with it (m, 4 runs). |
| Each loaded Product graph retains about 50 MB, 11 MB of it `.d.ts` text | `M_RETURN.md` | Not re-measured as such | The verified artifact's `nativeDeclarationEvidence` is 11,006,206 B of JSON (m), so the 11 MB figure agrees. |
| "About 2.4 ms per status read" | `M_RETURN.md` (300 reads) | **Correct only for the near-empty operator-stop fixture** | On a real W1 Run store, a held `run_status` takes 3.7–3.9 s of CPU at steady state, and a reopen read about 11 s (m). |

## Measurements

### M1. Where a scripted governed Run spends CPU

I ran W1 twice. Run 1 was the test file under `node --test` with `--test-name-pattern W1`. Run 2 was the same call through the driver, which keeps the store. Both used `NODE_OPTIONS=--cpu-prof` in every process. Run 1: pass, 185 s of wall time under load, 31 processes. Run 2: completed, 128 s, 29 processes (m).

CPU by process role, run 1 / run 2 (m):

| Role | Busy CPU | Largest shares |
|---|---|---|
| Start CLI: the governed Run itself, one process | 59.9 s / 51.9 s busy, of 117.8 s / 82.1 s wall | canonical JSON + digests 54.4% / 57.7%; file I/O 13.0% / 10.4%; event store 5.8% / 6.7%; JSON admission and freeze 3.5%; canonical equality 2.4% / 2.9%; GC 2.8% / 2.4%; event calculus 1.5%; schema validation 1.3% / 1.2%; compression 0; `structuredClone` < 0.1%. Module loading is within the 0.35 s fixed start-up (M2). |
| Test process: harness setup, verify, lock, install and imports | 41.2 s / 31.6 s | declaration analysis (`build/toolchain/typescript.cjs` called from `verifyProduct`): 51.5%, plus about 17% in `product/declaration_exports.js`; canonical + digests 9.6% / 11.3%; module loading 4.4% / 2.7% |
| npm (pack ×2, install ×2) | 15.4 s / 7.2 s | gzip in `npm pack` 40% / 38% |
| 21 stand-in actors and 2 worksite command helpers | 3.1 s / 2.8 s | stand-in logic and module loading |

The start CLI also used 23.9 s of **system** CPU against 52.3 s user (run 2, `process.resourceUsage`) (m). Its peak RSS was 709 MiB (m). Most of the system time is likely the thread-pool file work of install verification, which the profile cannot see (inferred from the counters; see P2).

Top 25 self functions of the start CLI, run 2, as a share of its busy time (m). Run 1 has the same top two and every share within 2.2 points (`m1-cli-r1.txt`):
`hash update` 29.9%; `writeCanonicalJson` 24.5%; `(program)` 4.2%; `canonicalEquals` inner 2.6%; GC 2.4%; `RuntimeHistory…event` (`runtime_history`) 1.7%; `openFileHandle` 1.3%; `lstat` 1.3%; `fsync` 1.3%; `close` 1.1%; `canonicalJson` 1.0%; `sha256Canonical` closure 0.9%; `defineMember` (admit) 0.9%; `canonicalizeAuthoredGtlCarrier` 0.8%; `readFileHandle` 0.8%; `read` 0.8%; `open` 0.7%; `admitRecord` 0.7%; `deepFreeze` 0.7%; `history.event` 0.7%; `admitAt` 0.7%; `extends` (`runtime_history`) 0.6%; `Hash` 0.6%; `fstat` 0.6%; `path.normalize` 0.5%.

Top owners of the start CLI by inclusive time, run 1, 59.9 s busy (m):

| Owner | Inclusive |
|---|---|
| `runRuntimeEventTransaction` (`abg/event_store.ts:4446`) | 20.7 s |
| `deriveReplayPrefixFacts` via `projectRuntimeReplayGuard` (`abg/replay.ts:127, 939`) | 13.7 s, of which `digestReplayBody` 10.8 s |
| `projectValidatedPrefixArtifactTruth` (`abg/artifact_truth.ts:767`), 5.8 s of it reached through `constructNativeInstructionAssemblyBasis` (`abg/execution_basis.ts:247`) | 6.9 s |
| `projectRetainedWorksiteInputAtPrefix` (`abg/worksite_input_provenance.ts:279`) | 5.3 s |
| `installedPayloadMatchesGraphCarrier` plus `installedProductContentMatches` (`product/install_product.ts`), CPU only | 4.5 s + 2.1 s |
| `modulePublicationSemanticDigest` (`product/publication.ts:5`), mostly from the leaf invocation port | 3.2 s |
| `admitNativeRuntimeLivenessEvent` (`abg/event_store.ts:4317`) | 2.1 s |
| `hasAdmittedProductInstall` (`abg/environment_admission.ts:689`) | 2.0 s |

All processes combined (m): canonical JSON + digests 30.7% / 36.0%; declaration analysis about 25% / 23%; file I/O 9.9% / 8.3%; compression (npm pack gzip) 5.2% / 3.0%; module loading 3.5% / 2.5%; GC 3.4% / 3.1%; event store 3.0% / 4.0%.

### M2. What one installed Public call costs before it does any work

| Call | Wall (under load) | CPU | Peak RSS | Work |
|---|---|---|---|---|
| Refused call (no arguments), release install, ×3 | 0.34–0.38 s | 0.43 s | 201 MB | 50% module loading; 19% canonical JSON and digests at import (`projectionAsset`, `schemaDigest` in `public/binding/`) (m) |
| Cold `run_status`, small store (50 rows, 3.9 MB), ×2 | 1.08 s | 1.23 s | 318 MB | 1 decode of 50 rows; 120 body reads, 5.0 MB (m) |
| Cold `run_status`, W1 store (2,198 rows, 17.4 MB), ×2 plus ×2 profiled | 5.8–6.3 s | 6.2–6.6 s | 431–473 MB | 1 decode of 2,198 rows; 7,113 body reads, 92.2 MB (5.3× the log); 7,811 `readSync` calls, 118 MB; 14,230 `stat` calls; 432 opens (m) |
| Cold `run_replay`, W1 store, ×2 profiled | 6.0–6.2 s | 6.4 s | 467–470 MB | same work; 36.8 KB of output (m) |

No read call verifies installed content (`contentVerifications 0`) (m). Every read call reads the 3,276,114-byte `product-toolchain-manifest.json` once with `readFileSync`, admits it and canonical-digests it in `readExecutingToolchainIdentity` (`product/declaration_exports.ts:519`) (m, file counting + profile). That costs about 30 ms. The 14,230 `stat` calls are about two per body read: `readRuntimeHistoryRowBytes` (`abg/event_store.ts:3670`) checks `fstat` and `durableIdentity` (the path `stat`) before and after each body read (r). In the cold read profile, canonical JSON + hashing is 64.5% (status) and 67.6% (replay) (m). The largest owners are:

- the per-body reader in `constructRuntimeHistory` (`abg/event_store.ts:3698`), 2.6 s. Per body it computes `sha256(bytes)` against the location digest, `JSON.parse`, and `canonicalJson` re-serialization with a byte compare (r).
- `projectOwnedRunReplayContext` (`abg/replay.ts:2195`), 2.8 s.
- the artifact-truth fold, 1.6 s.
- the liveness relation fold `nativeLivenessRelationHolds`, 1.1 s (17.3%). It is driven by the 1,225 probe rows.

### M3. The read path, repeated in one process

These were run on the W1 store with `m3-reads.mjs` (m):

| Path | Call 1 | Calls 2–6, each | Work per read |
|---|---|---|---|
| Reopen: `constructInstalledRunReadCall` + `runInstalledDefinitionCallTransport`, `run_status` | construct 5.7 s + call 5.9 s, 11.9 s CPU | 10.9–11.4 s CPU | 2 full decodes; 14,170 body reads, 183 MB (10.5× the log) |
| Reopen, `run_replay` | 11.3 s CPU | 10.6–11.2 s CPU | same |
| Held: acquire once (0.66 s, 1 decode), then construct + `runInstalledDefinitionCallWithResource`, `run_status` | 4.6 s + 2.2 s | 1.7 s + 2.0 s, 3.8 s CPU | 0 decodes; 2 × 2,845 body reads, 88 MB |
| Held, `run_replay` | 3.8 s | 3.7–3.9 s | same |

There is no steady-state saving on the reopen path. Every call repeats the decode and both folds. On the held path, everything except the decode is recomputed per read. In the held steady-state profile (19.0 s over 5 reads), the costs that recur per read are:

- `canonicalRunContext` 89.8% inclusive, through `projectOwnedRunReplayContext` 89.6%. Below that, `deriveReplayPrefixFacts` is 72.6%;
- `projectReplayRouteAtPrefix` 68.2% → `projectRetainedWorksiteInputAtPrefix` 65.8% → `successfulResult` 60.6% → `resolveExactMatch` 60.4%;
- `digestReplayBody`, 29.2%;
- the per-body reader (`event_store.js:2652`), 72.0% inclusive. By nearest owner of canonical, hash and equality leaf time, it holds 24.7%, `inlineEventBody` 8.2% and `decodeEventBody` 7.6%. `projectRetainedWorksiteInputAtPrefix` holds only 0.8% (m).

These shares nest and overlap, so they do not sum. The worksite-input chain has little leaf time of its own, so most of its 65.8% is likely the body reads triggered beneath it (inferred from the nesting; not traced call by call).

Per the retention rule in `RuntimeHistory.event` (`abg/runtime_history.ts:316–341`), a body is retained only while an open scope holds its basis's invocation (r). From that rule and the counters, the 2,845 body reads per phase are likely the basis bodies plus the earlier inline sources their body-reference records resolve to, re-read from disk with full re-authentication (inferred, not instrumented).

### M4. Verify and install the release archive once

`m4-verify-install.mjs` loads the product from the read-only release install, then runs `verifyProduct`, `constructResolvedProductLock`, `installProduct` into scratch, `installedProductContentMatches` and the harness's seven imports. Four runs: plain, with the CPU profiler, with the allocation profiler and with the live heap profiler (m). CPU ranges are from the plain and CPU-profiled runs. The two heap-profiled runs took 26.4 s (verify) and 8.1–8.3 s (lock).

| Phase | Wall (load) | CPU | Notes |
|---|---|---|---|
| `verifyProduct` | 19.6–21.7 s | 23.9–24.8 s | `resolveNativeDeclarationClosures` is 18.1 s of 18.5 s inclusive. It builds a TypeScript program over the declaration closures and runs `getSemanticDiagnostics` (`product/declaration_exports.ts:1485`, program at `:1733`) (m, r). |
| `constructResolvedProductLock` | 4.4–5.6 s | 6.1–7.3 s | `resolveProductArtifacts` → `linkNativeContractSet` (`declaration_exports.ts:2068`) builds a **second** TypeScript program over the declaration evidence source texts and runs semantic diagnostics again (program at `:2530`) (m, r) |
| `installProduct` | 2.8–3.2 s | 0.7 s in-process | `npm install --offline` subprocess |
| `installedProductContentMatches` | 0.48–0.54 s | 0.55–0.61 s | 5,325 files, 68.5 MB (m) |
| Seven installed imports | 0.27–0.31 s | 0.33–0.38 s | about +100 MB heapUsed before GC |

Memory (m):

- Live heap after a full GC peaks at 889.8 MB during `verifyProduct`. That is the number comparable to `M_RETURN`'s 0.93 GB. That the peak falls inside the TypeScript phase is inferred from the timing.
- heapUsed before GC peaks at 1.15–2.42 GB, depending on GC timing and the profiler.
- Peak RSS (in-process `maxRSS`): 1,876 MiB plain, 3,084 MiB with the CPU profiler, 2,976 MiB with the live heap profiler, 5,357 MiB with the allocation profiler. `/usr/bin/time` reports 1.97 GB and 3.59 GB for the plain and CPU-profiled runs.
- External memory after `verifyProduct` is 227 MB, of which 225 MB is ArrayBuffers. These are likely the decompression buffers of `gunzipArchive` (`verify_product.ts:1806, 1916`) (inferred).
- Retained after the final GC: 119–125 MB.
- Allocation profile (collected objects included): 21.4 GB allocated over verify, lock and install. `typescript.cjs` accounts for 41.6% and `declaration_exports.js` for 22.0%, so declaration analysis is about 80% with the `node:path.normalize` calls it makes (3.6 GB). By nearest owner: `resolveNativeDeclarationClosures` 21.6%, `visit` 19.5%, `linkNativeContractSet` 16.3%, `physicalRelationRefsForNode` 11.3%; tar header parsing (`parseUstarHeader`) is 386 MB.
- The live-at-peak heap profile was captured after the synchronous TypeScript phase, so it shows only 86 MB live. 17 MB of that is my script parsing `verification.json`.

Carried sizes (m): verified artifact 14,332,982 B of JSON, of which `nativeDeclarationEvidence` is 11,006,206 B; resolved lock 3,181,489 B; install candidate 3,181,715 B. In the harness these phases took (m, `setupAccounting`, W1 driver, under load): pack 4.2 s, verify 24.8 s, install 3.9 s, the additional fixture product 5.3 s, and about 43 s for the whole setup. The live Run recorded verify at 23.8 s (e: `measures.json`).

### M5. What the event log holds

Live Run (logical, 1,692 events, 12,675,210 B canonical; 7 Executive steps, 14 actor calls) (m):

| Kind | Rows | Bytes | Share |
|---|---|---|---|
| `runtime_activity_probe_observed` | 931 | 3,694,697 | 29.1% |
| `actor_transport_binding_admitted` | 14 | 3,053,066 | 24.1% |
| `c_call_result_admitted` | 64 | 2,207,993 | 17.4% |
| `basis_admitted` | 22 | 863,771 | 6.8% |
| `traversal_route_admitted` | 64 | 786,149 | 6.2% |
| `invocation_admitted` | 1 | 439,440 | 3.5% |
| `actor_process_stdout_observed` | 113 | 235,240 | 1.9% |
| all others (20 kinds) | 483 | 1,394,854 | 11.0% |

- **Liveness and probes:** 29.1% of bytes and 55% of rows. Every probe carries its full probe contract, which is 39% of probe bytes. The envelope is 37% of each probe row.
- **Route and context carriage:**
  - Bindings average 218 KB. Of their bytes, the rendered prompt is 39.5%, `instructionAssembly.envelope.nativeBasis` 17.5%, with the 40 KB publication carried twice in assessment bindings and 10 times across the Run, `envelope.sections` 24.3%, and `plan.role` source content 10.0%.
  - Traversal routes carry `boundInput.value`, which is 76% of route bytes.
  - `invocation_admitted` carries `runEnvironment.contexts`, 402 KB.
- **Repeated values:**
  - The governance work state is copied 72 times, 2.40 MB. It grows from 14.6 KB to 46.3 KB over 7 steps and is carried in `c_call_result.value` (22), `basis_admitted.rawInputValue` (15), `value.state` (14), `input.value` (7) and the route's `boundInput` (7).
  - The work state's unchanging `original` block (14.1 KB) appears 72 times, 1.0 MB of excess.
  - The run-environment declaration (21.8 KB) appears 11 times.
  - Stage report summaries appear about 60 times each.
- **Bytes per Executive step** (a stage plus the next selection): 1.27–1.86 MB and 171–249 rows. Probes are about 533 KB per step and roughly constant; work state, bindings, results and routes grow with the step number (m).
- The largest single event is `invocation_admitted`, 439 KB. Next come the bindings, 162–264 KB each.

W1 physical log (my kept store, 2,198 rows, 17,401,923 B) (m):

- Setup is 3 `public_operation_artifact_admitted` rows, 3,197,003 B. The verified artifact row alone is 3,189,373 B.
- The Run is 2,195 rows and 14,204,920 B over 10 Executive steps, 0.93–1.65 MB physical and 157–279 rows per step.
- 65 rows are `abg_admitted_body_reference_record`, the physical encoding of events whose body references an earlier inline body. They make the physical Run about 10% smaller than the logical view (15.8 MB).
- Probes are 27.7% physical.

### M6. How the log and the reads scale

- **Per step:** about 209 rows and 1.2–1.65 MB physical in W1, rising with the step number. About 460 KB per step is probes, which do not grow (m). The work state copied per step grows linearly with the steps taken, so its carriage grows quadratically with the length of the Run (d from M5).
- **Per transaction inside the Run:** CPU in the start CLI between consecutive actor processes. Profiles share V8's monotonic clock, so the actor processes split the CLI timeline; `m6-w1-run2-timeline.txt` (m):

| Interval | 1 | 3 | 5 | 9 | 13 | 17 | 21 |
|---|---|---|---|---|---|---|---|
| log at interval end (MB) | 4.6 | 5.8 | 6.9 | 9.5 | 12.2 | 14.9 | 17.4 |
| busy CLI CPU (ms) | 2,203 | 2,026 | 780 | 1,846 | 2,095 | 2,675 | 3,329 |
| `digestReplayBody` inclusive (ms) | 26 | 63 | 119 | 445 | 737 | 1,100 | 1,680 |
| artifact-truth projection (ms) | 265 | 267 | 198 | 280 | 264 | 289 | 162 |

  The replay-digest cost per interval rises about 65× while the log grows 3.8×. That is superlinear; I do not fit an exponent from one Run. Artifact-truth cost is flat at about 265 ms per actor launch, a constant repeated per call. Busy CPU per interval rises from about 1.2–2.2 s to about 3.0–3.3 s over the Run.
- **Per read:** cold `run_status` costs 1.08 s at 50 rows and 5.8–6.3 s at 2,198 rows (m). Body reads per read are about 3.2× the row count on the cold path and 2 × 1.3× on the held path. Both grow with the log on every call (m, counters).

## Candidate register entries

### P1. Re-derive and re-digest the Run's replay guard on every transaction: consolidate into one incremental replay fold held by the active transaction owner
- Category: performance
- Evidence:
  - M1: `deriveReplayPrefixFacts` 13.7 s and `digestReplayBody` 10.8 s, 18–23% of the start CLI's busy time (m, run 1).
  - M6: per-interval replay-digest cost rises from 26 ms to 1,680 ms as the log grows from 4.6 to 17.4 MB (m).
  - The call path runs from `projectOwnedActiveRuntimeTransaction` (`abg/replay.ts:189`), 6.7 s, to `projectRuntimeReplayGuard` (`abg/replay.ts:127`), which calls `deriveReplayPrefixFacts(…, true)` (`:939`). That computes the full logical digest of the Run prefix through `digestReplayBody` (`:2339`) (r).
  - Callers, by profile:
    - `admitOwnedCCallResult` (`abg/c_call_outcome.ts:1424`), 3.6 s;
    - `admitOwnedCCallJudgment` (`:1528`), 3.1 s;
    - `admitTraversalTransitionInActiveTransaction` (`abg/traversal_route.ts:5323`), 3.2 s;
    - `admitOwnedScopeClosure` (`abg/closure.ts:349`), 1.2 s;
    - `projectOwnedRuntimeTruthAtDurablePrefix`, 1.0 s (m).
  - What scales it: each admission re-walks the whole Run prefix, so the cost per transaction grows with Run length and the Run total grows superlinearly. Held reads pay the same derivation per read (M3: `deriveReplayPrefixFacts` 72.6% of the held steady state).
- Retire: the per-call re-derivation. The owner is the replay fold in `abg/replay.ts`. It keeps the guard facts and the running digest state for the active transaction's prefix and extends them by the appended rows. The admitting owners take the extended guard instead of calling `projectRuntimeReplayGuard` on the whole prefix. A held read takes the same facts for its prefix.
- Size: M (one owner, five admitting callers, the held-read consumers and their proofs).
- Risk: replay digests of recorded Runs. The incremental digest must be shown byte-equal to the cold `deriveReplayPrefixFacts` digest on recorded Runs, and the cold path stays as the oracle.
- Change class: realization_refactor (design_reframe if the guard's streaming digest needs a resumable state that the design does not name).
- Confidence: verified for cost and call path. Whether `writeReplayBody` can be made resumable without changing digest bytes is to be investigated: a test that compares incremental and cold digests on the W1 and live stores would settle it.

### P2. Verify installed content once per process per install: consolidate the per-leaf verifications into one owner fact
- Category: performance
- Evidence:
  - The counters of one W1 start CLI show `contentVerifications 139`, `fileHashes 378,415`, `lstats 420,080`, `lists 41,526`, `graphCarrierReads 139` (m).
  - That splits as 71 verifications of the 5,325-file, 68.5 MB root product plus 68 of the 5-file fixture. 71 × 5,325 + 68 × 5 = 378,415 reproduces the counter exactly (verified). That is about 4.9 GB read and hashed per Run (d).
  - Each verification also reads the `product-toolchain-manifest.json` of the install it checks, parses it and runs `sha256Canonical` on it (`installedProductContentMatches`, `product/install_product.ts:181`) (r). The root manifest is 3.28 MB, so the 71 root verifications parse and canonicalize about 233 MB of manifest per Run (d).
  - Profile: 4.5 s + 2.1 s of on-thread CPU (m). The thread-pool file work does not show in the profile. The start CLI used 23.9 s of system CPU against 52.3 s user (m), and most of that system time is likely this verification (inferred from the counters, not attributed).
  - Call sites (r):
    - `prepareInstalledProductModules` (`product/installed_module.ts:28`), reached from `loadInstalledProductSemantics` (`product/semantics.ts:395`), from `execution_resolution.ts:879` (cached only within one resolution) and from `implementation_resolution.ts:179`;
    - `verifyInstalledContent` (`product/semantics.ts:714`), called at leaf-port construction (`implementation/leaf_invocation_port.ts:973`) and at every leaf authorization (`:1649`).
  - About three verifications per leaf invocation (inferred: 71 ≈ 3 × 23 leaf invocations + 2).
  - `hasAdmittedProductInstall` (`abg/environment_admission.ts:689`) adds 2.0 s per Run of canonical re-derivation (m).
  - What scales it: leaf invocations per Run × installed payload size.
- Retire: the repeated physical walks. The owner is `install_product.ts`. It keeps one verified-content fact per `installId` per process, with a cheap per-boundary guard such as a `stat` walk of size, mtime and inode, or a manifest digest check. All five call sites consult that fact. The toolchain manifest is read and digested once per process in `readExecutingToolchainIdentity` (`declaration_exports.ts:519`), and `installedProductContentMatches` uses that result.
- Size: L. RC9's O3 was withdrawn for want of a resolved reuse lifetime, and the review named a contract decision: does "verified" promise byte identity at each boundary, or unchanged since verified? If the owner decides on byte identity, the three per leaf can still become one per leaf: Size M. That saves about 3.2 GB of hashing per Run (2/3 × 71 × 68.5 MB) and about 4.4 s of on-thread CPU (2/3 × 6.6 s), plus a matching share of the thread-pool system time (d).
- Risk: Public contract. The verification guarantee at each consumer boundary is a stated product property.
- Change class: requirement_reprice (lifetime of the verification guarantee), then realization_refactor.
- Confidence: verified for counts and call sites. That three verifications fall per leaf is inferred and should be settled by per-call-site counters.

### P3. Each read re-reads and re-authenticates row bodies from disk, and the reopen path decodes twice: hold one authenticated view per prefix and project reads from it
- Category: performance
- Evidence:
  - M2: cold CLI `run_status` on the 17.4 MB store makes 7,113 body reads (92.2 MB, 5.3× the log) and 14,230 `stat` calls. Canonical + hash is 64–68% of CPU. 5.8–6.3 s, against 1.08 s at 3.9 MB (m).
  - M3: in-process reopen reads cost about 11 s of CPU each, with 2 full decodes and 14,170 body reads. Held reads cost 3.8 s each, with 2 × 2,845 body reads and no decode. Neither path gets cheaper on later calls (m).
  - Per-body work in `constructRuntimeHistory`'s reader (`abg/event_store.ts:3698`, `readRuntimeHistoryRowBytes` `:3670`): `fstat` + `durableIdentity` before and after, `sha256(bytes)` against the location digest, `JSON.parse`, `canonicalJson` re-serialization with a byte compare, then `decodeEventBody` (r).
  - The double decode on the reopen path comes from two owners:
    - construction, `populateRunReadAtDurablePrefix` (`abg/project_read_definition_bindings.ts:680`) → `prepareRunRead` / `canonicalRunContext` (`abg/project_read_ports.ts:1008, 833`);
    - the call's own reopen inside `runInstalledDefinitionCallTransport` (m, counters per phase).
  - Recurring folds per held read (m, profile):
    - `projectOwnedRunReplayContext` (`abg/replay.ts:2195`);
    - `projectRetainedWorksiteInputAtPrefix` → `successfulResult` → `resolveExactMatch` (`abg/worksite_input_provenance.ts:279, 75`; `shared/select/exact_match.ts:49`), 2.3 s inclusive per read, most of it likely the body reads beneath it (inferred);
    - the liveness relation fold over 1,225 probe rows, 17% of a cold read.
  - What scales it: rows in the log × body reads per row (3.2 cold, 2.6 held) × the per-body re-authentication.
- Retire:
  - Per-row re-canonicalization on bodies this process has already authenticated. The prefix digest and the physical digest already prove the bytes (RC6 F2 stands).
  - The second decode on the reopen path. Construction and the call share one acquisition.
  - The per-read re-derivation of the Run read context. The owner is the read port (`abg/project_read_ports.ts`), holding the derived run-read context per prefix coordinate for the life of the held resource.
  - Do not re-retain basis bodies. RC10 released them at the operation lifetime to discharge RC9 F1, so the held fact must be the derived projection, bounded by open prefixes, not the bodies.
- Size: L. It spans the event store reader, the read port and the transport, needs a retention-lifetime decision, and touches the cold path that is the qualification oracle.
- Risk: replay digests of recorded Runs. Read projections must stay byte-equal to cold reads, and cold re-authentication must remain for copied or foreign bytes.
- Change class: design_reframe.
- Confidence: verified for counts and costs. That the 2,845 held re-reads are basis bodies is likely (inferred from the retention rule at `abg/runtime_history.ts:330–341`). A per-kind body-read counter would settle it.

### P4. Artifact truth is re-projected and re-digested at every new prefix, about 265 ms per native call: key the fact by the dependency extent of the artifact rows, not by the cut
- Category: performance
- Evidence:
  - M1: `projectValidatedPrefixArtifactTruth` (`abg/artifact_truth.ts:767`) costs 6.9 s per W1 Run, 6.6 s of it canonical and hash leaf time (m).
  - 5.8 s of that is reached through `constructNativeInstructionAssemblyBasis` → `deriveOwnedNativeInstructionAssemblyBasis` (`abg/execution_basis.ts:247, 172`), once per actor launch. Another 0.8 s is from `projectExactPrefixWorkspaceEnvironment` (`abg/environment_admission.ts`) (m).
  - M6: a flat 198–289 ms per interval (m).
  - `deriveExactPrefixArtifactTruth` (`:859`) caches by `coordinateDigest`, so every append misses. The body it digests includes each row's `artifact` and `resolvedLock`: the 3.19 MB verified artifact row with 11 MB of declaration evidence in object form (r, m).
  - Cold reads pay the fold too: 1.6 s of a 6.2 s cold read (m).
  - What scales it: native calls per Run × size of the admitted artifact rows. This is the same class as RC9 F3's "artifact truth re-projection", which is still open.
- Retire: the per-cut recomputation. The owner is `abg/artifact_truth.ts`. It keeps the projection keyed by the ordered admission digests of the artifact rows, as O2 does for the environment, and wraps it per cut. Consumers take the digest from the row admission digests instead of re-canonicalizing artifact bodies.
- Size: S to M (one owner, three consumers).
- Risk: replay digests of recorded Runs if `projectionDigest` changes; none if the digest is kept and only memoized.
- Change class: realization_refactor.
- Confidence: verified.

### P5. Declaration analysis is done twice, once in verify and again in the lock, and its 11 MB of evidence rides inside every verified artifact
- Category: performance; second owner
- Evidence:
  - M4: `verifyProduct` → `resolveNativeDeclarationClosures` builds a TypeScript program and runs semantic diagnostics (`product/declaration_exports.ts:1485`, `:1733`): 18.1 s CPU (m).
  - `constructResolvedProductLock` (`product/environment.ts:503`) → `linkNativeContractSet` (`declaration_exports.ts:2068`) builds a second program from `evidence.sources[].sourceText` and runs semantic diagnostics again (`:2530`): 4.4–5.6 s wall, 6.1–7.3 s CPU (m, r).
  - Together they are about 80% of the 21.4 GB allocated per verify-and-install, they hold the live peak of about 890 MB, and they account for about 25% of all CPU in a scripted W1 test case (m).
  - `nativeDeclarationEvidence` is 11,006,206 B of the 14.3 MB verified artifact. It is carried into the resolved lock and the install candidate (3.18 MB each), into the setup event row (3.19 MB), and into every artifact-truth digest (P4) (m).
  - Earlier findings: RC6 F7, 9.58 MB of `.d.ts` texts per verified artifact (e: RC6 review); `M_RETURN`, 11 MB retained per loaded graph (e).
  - What scales it: declaration files in the package and Products in the lock.
- Retire:
  - The second type check. `linkNativeContractSet` should consume the closure facts `verifyProduct` established for the same artifact digest. It should link across Products only, not re-check each Product's sources.
  - Carriage of source text by value. Evidence carries source digests plus locations; the texts stay in the archive and are read on demand.
  - The owner is `product/declaration_exports.ts`, with `verify_product.ts` producing the fact once.
- Size: L (contract shape of the verified artifact and the lock; a qualification recipe).
- Risk: manifest or digest pins. `verificationDigest`, lock digests and the setup row bytes change if the evidence shape changes, and qualification mirrors pin these.
- Change class: design_reframe.
- Confidence: verified that both programs run and what they cost. Whether the lock can reuse verify's diagnostics without weakening the cross-Product check needs a reading of `linkNativeContractSet`'s filters (`isZeroOwnerPhysicalRelationDiagnostic`) by the area reviewer.

### P6. Log carriage: the probe contract is inlined in every probe, one probe is written per enclosing scope, and the work state is copied about seven to ten times per step
- Category: performance
- Evidence:
  - M5: probes are 29.1% of the live Run (931 rows against 113 stdout rows) and 30.4% / 27.7% of W1 (m).
  - Per progress event, probes are written once per scope: 219 events emit 3 each and 21 lifecycles emit 8 each (m).
  - Each probe carries its whole contract (`probeContract`, 39% of probe bytes; 565 distinct contracts in 1,225 probes, declared by 126 declaration events) (m). The envelope is 37% of a probe row (m).
  - Writing probes costs `admitNativeRuntimeLivenessEvent` 2.1 s per W1 Run (m). Reading them costs the liveness fold, 17% of a cold read (m).
  - The governance work state is copied 72 times (live) and 105 times (W1). Its `original` block never changes but is carried in every copy, 1.0 MB of excess in the live Run (m).
  - The 40 KB publication is carried 10 times in bindings, twice in assessment bindings (m).
  - Owners (r):
    - `abg/runtime_liveness.ts`, `abg/runtime_liveness_contracts.ts` (`constructRuntimeSystemProbeContract`), `abg/actor_process.ts` (probe emission);
    - the work-state carriage in `basis_admitted.rawInputValue`, `c_call_result.value`/`value.state`, `traversal_route.boundInput`;
    - `abg/instruction_assembly.ts` (`nativeBasis.publication`/`assessmentPublication`).
  - What scales it: probes scale with progress events × scopes; work-state bytes grow with steps², because each step copies a state that holds every prior observation.
- Retire:
  - Probes reference their admitted contract by `probeRef` and digest. The declaration event already holds the contract.
  - One probe per progress event, with its scope set, instead of one per scope.
  - The work state is carried once per step by reference to its admitting result. `original` is referenced by digest.
  - Bindings reference the publication by digest.
  - Owner: the event body encoder (`abg/event_body_encoding.ts`) already de-duplicates whole bodies through body-reference records. Sub-body references belong in the same owner.
- Size: L (event contracts and body encoding).
- Risk: replay digests of recorded Runs. New event shapes need a contract version, recorded Runs keep replaying under their own contract, and probe semantics are qualification mirrors.
- Change class: design_reframe.
- Confidence: verified for bytes and counts. The per-scope probe rule is read from the data, not from the source.

### P7. The harness packs, verifies, locks and installs an identical archive in every installed test case
- Category: test debt
- Evidence:
  - M1 and M4: per case about 43 s of setup (m, W1 driver under load). That is npm pack 4.2 s (gzip 2.4–5.8 s CPU), verify 24.8 s, install 3.9 s, the fixture product 5.3 s, a live heap peak of about 0.89 GB, and about 21 GB allocated (m).
  - `test_env/support/root-installed-environment.mjs:168–354` repeats this for every case of every installed test file (r).
  - In W1 that is 25–28 s of test-process CPU plus 7–15 s of npm CPU, against 52–60 s for the Run itself (m).
  - `M_RETURN` records that the 31-case file enters case 31 with 3.14–3.16 GB of heap and dies at the default limit, with about 0.93 GB peak per case (e). Per-case setup is where that peak falls.
- Retire: per-case re-provisioning. The owner is the harness. It verifies, locks and installs once per archive digest per test process (or per suite) and hands each case a fresh store and worksite. Cases that test verify or install themselves keep their own path.
- Size: M (one support module and its consumers).
- Risk: qualification mirrors. `root-installed-environment.mjs` is a member of `inventory.json` and `verification-recipe.json`, and each case's independence from the others is a proof claim.
- Change class: realization_refactor (test side only).
- Confidence: verified for cost; the share of cases that could reuse setup is to be investigated.

### P8. Minor, recorded together: per-call module-load digests and toolchain manifest
- Category: performance
- Evidence:
  - A refused CLI call costs 0.34–0.38 s and 201 MB. 19% of it is canonical digests computed at import (`public/binding/public_function_projections.ts` `projectionAsset`, `owner_contract_source_set.ts` `schemaDigest`) (m).
  - Every Public read re-reads the 3.28 MB toolchain manifest in `readExecutingToolchainIdentity` (`product/declaration_exports.ts:519`): `readFileSync` + `admitJson` + `sha256Canonical`, about 30 ms (m).
  - What scales it: calls, not log length.
- Retire: memoize `readExecutingToolchainIdentity` per process (the manifest is part of the installed bytes P2 already guards); leave the import-time digests alone unless start-up becomes the bound.
- Size: S.
- Risk: none.
- Change class: realization_refactor.
- Confidence: verified.

## What I did not do

- I did not run any test file other than `t287-amendment-witness.test.mjs` W1 under the test runner. W1 was repeated once through the driver, and the intake-refusal case was run through the driver for a small store.
- No measurement on a GB-scale log. The scaling statements are from 3.9 MB to 17.4 MB stores and one Run timeline.
- No CPU attribution of thread-pool file work beyond process system time and counters.
- No heap snapshot at the moment of the verify peak, so the attribution of the 890 MB live peak to the TypeScript phase is inferred from timing.
- Body reads were not split by event kind (P3's basis-body inference).
- I did not read the source in the areas other reviewers own beyond the call paths cited.
- The live Run's physical log was not available. Its numbers are the logical view, about 10% larger than physical by the W1 comparison.
