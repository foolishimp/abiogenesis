# RC12 package H Return: the CLI status heartbeat renews the lease

Writer Return to the Executive; commentary only. Worktree `/private/tmp/abg-rc12-liveness-20261111`, branch `claude/rc12-heartbeat`, base `1b2163bac`. T = `build_tenants/abiogenesis/typescript`; X = `qualification-scratch/rc12-executive-01/h/` (untracked). Same model family as the reviewer; no other-family reader.

## What changed (commits in order)

| Commit | Files (+/−) |
|---|---|
| `313095ecf` heartbeat | `T/code/src/abg/worker_transport.ts` (+23/−12): status rows counted inside the observer only, `heartbeat` on the chunk segment and class, `qualifying = progress ‖ heartbeat ‖ result`. `T/code/src/abg/actor_process.ts` (+3/−3): the window class carries `heartbeat`. Tests: new `t287-liveness-heartbeat` (172 lines), `m5-worker-transport` (+7/−6), `t287-management-supervision` (+18/−7) with fixture `semantic-worker.mjs` (+12/−1) |
| `3f605d62d` T1 | `specification/requirements/abg/REQ-R-ABG3-RETRY.md` (+1/−1) |
| `a96a78443` T2 | `cut/cut-local-rc12.mjs` (+7/−1): the claim names the stamped sites, says "It is not the built tree of the commit itself", and records generated drift; checked against RV1's scratch record (`X/t2-claim-check.txt`) |
| `c30754e1b` T3 | `T/design/T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md` §4.1 (+6/−4) |

`calculus/liveness.ts` is unchanged: the calculus does not need to tell a heartbeat from progress (O1).

## O1 Activity and progress consumers (two relations, still distinct)

| Consumer | Old reading | New reading |
|---|---|---|
| Transport lease timer, window mode (`worker_transport.ts` `qualifying`) | progress or result renews | progress, heartbeat or result renews |
| Window witness `lastQualifyingElapsedMs` → stdout `activity` probe (`stageNativeStdoutWindow`) | last progress/result capture | also a status-row capture; same source `stdout`, same signal |
| Fold `lastActivity`, lease deadline, `systemActivity`, `activeSystems` (`liveness.ts:752-821`) | admitted probes | unchanged code; fed heartbeat-derived stdout probes. `activeSystems` is read only for frame occurrences (`replay.ts:404`) |
| Labels `startup_expired`/`inactivity_expired`, `no_output`/`progress_without_result` (`liveness.ts:805/810`) | `lastActivity === null` | cannot move: the process start probe already makes `lastActivity` non-null; :810 needs complete coverage, which stream-json never has |
| Legacy profile L, non-window branch (`actor_process.ts:1533-1543`) | progress or result renews the timer | unchanged by design (L stays exact) |
| Model progress `progressEventCount` → transport result → `actor_result_artifact_observed` (pinned keys `event_store.ts:298/729`) → `c_call.ts` | assistant, user, tool_progress, positive thinking_tokens, six content stream_events | unchanged; the heartbeat count is in no snapshot, result or payload |
| `segment.progress`, `apiRetryCount`, failure class (`transport_contracts.ts:112-135`) | — | unchanged |
| Retry accounting: `retry_progress.ts` progressClass; `retry.ts:4130/4480` | judgment lifecycle; post-close disposition by budget | unchanged; neither reads activity |

## O2 Stream rows from the agent CLI

| Row | Renews lease | Progress | Retry | Turn |
|---|---|---|---|---|
| `assistant`, `user` | yes | yes | — | yes |
| `result` | yes (result) | no | — | yes |
| `tool_progress`; `thinking_tokens` delta > 0; `stream_event` message_start, content_block_start/delta/stop, message_delta, message_stop | yes | yes | — | no |
| **`system`/`status` (requesting, compacting, null)** | **yes (new)** | no | no | no |
| `system`/`api_retry`, `api_retry` | no | no | yes | no |
| `system`/`init`, `compact_boundary`, `commands_changed`; `rate_limit_event`; zero-delta `thinking_tokens`; other stream_event types; non-JSON lines; an incomplete line | no | no | no | no |

## O3 Old instances

- Recorded Runs: replay folds admitted probes. Nothing in `code/src` re-classifies archived stdout (`coldStdoutWindowArchive` checks bytes and digests only). No recorded fact, digest or replay changes.
- E5: the HS03 oracle in `t287-calculus-fold` passes unedited, 25/25 before and after, pin `2c9328e4…`. It does not discriminate this change: it replays recorded qualifying instants through its own classifier over synthesized lines.
- Recorded streams: E3.

## O4 Identities, pins, fixtures

- None changed; the HS03 pin is unchanged; the two build-regenerated files are uncommitted. New fixture mode `heartbeat` in `semantic-worker.mjs`.
- Not regenerated, outside the grant: T's frozen qualification copy `T/contracts/qualification/sources/REQ-R-ABG3-RETRY.md` (digest in `authority-inputs.json`/`law-basis.json`, spans in `rule-catalog.json`) still holds the old RETRY-008; re-staging is the explicit `--stage-authorities` action. `t287-qualification-law` stays green because it reads only frozen inputs.
- The qualification recipe/inventory lists neither `t287-liveness-heartbeat` nor L2's `t287-liveness-inactivity`.

## O5 Test files

| File | Change | On the old build | After |
|---|---|---|---|
| `t287-liveness-heartbeat` (new) | 6 cases | 2 pass / 4 fail. Red: the status row is a heartbeat; heartbeats renew a working actor; the window carries the heartbeat instant; the lease runs from the status row, not the retries. Guards pass: silent containment; nothing renews after exit | 6/6 |
| `t287-management-supervision` | installed case adds a `heartbeat` worker (status row every 1 s for 7 s, lease 3000 ms, cap 30000 ms): no timeout, blocked like `blocked`, each actor's stdout activity ≥ 7000 ms. Three retry cases unedited | 4/5: `timeouts.length` 1 !== 0 | 5/5 |
| `m5-worker-transport` | HS03 noise row: synthetic `system/status` → `rate_limit_event`; segment literals gain `heartbeat:false`. The one inversion R1 requires: a status row is no longer noise | — | 39/39 |

## E3 The 24 recorded RC6 actors (HS03 oracle; inactivity was 1,800,000 ms)

Longest admitted-activity gap per actor in seconds, before → after; bold is 60 s or more.

| Scopes | Gap before → after (s) |
|---|---|
| 0–5 | 15.7→13.6, 42.8→33.0, **84.6→83.5**, 14.7→13.5, 16.1→14.9, 13.3→12.2 |
| 6–11 | 14.3→13.2, 10.2→10.2, 18.7→16.6, **111.9→30.0**, 19.0→16.9, **126.0→30.0** |
| 12–17 | 1.4→1.4, 30.0→30.0, 17.9→16.2, 30.0→30.0, 14.6→13.6, 30.0→30.0 |
| 18–23 | 14.9→12.9, 30.0→30.0, 17.8→16.7, **89.0→30.0**, **129.4→30.0**, 30.0→30.0 |

Contained at 60/120/180 s: **before 5/2/0, after 1/0/0** (scope 2's first-request wait). `X/e3.py` reads only the pinned oracle (`X/e3-status-family.txt`).
- Row identity (D1): the oracle has no row content, so a noise row counts as a status row when its length is in {157, 176, 182, 185, 186}. In 196 tracked archives every row of these lengths is `system/status` (243 rows) and `api_retry` rows are 226–229 bytes (`X/e3-length-overlap.txt`); 182/185/186/176 occur only inside the seven compactions at a 30 s cadence, matching RV1's line-by-line read.
- Sensitivity: {182,185,186} alone gives 1/0/0; {185,186} alone gives 2/0/0 (scope 9's first heartbeat is 182 bytes). Heartbeat instants map from wall time with an offset spread ≤ 126.6 ms.

## Evidence

- E1: `npm run build` in T (clean, `tsc -p`, manifest generation) completes, 31 s (`X/build-after.txt`). Lints (`X/lint-*.log`): `lint -- test_env/qualification/recipe/verification-recipe.json` `"passed":true`, 72 files; `lint:imports`, `lint:lifecycle`, `lint:calculus` green ("no offender"); `lint:evidence` exit 1 with the same five pre-existing offenders as K_RETURN.
- E4/E5: each file alone via `X/run-set.sh`, i.e. `ABI5_HS03_STREAM_METADATA=X/oracle/hs03-metadata.json TMPDIR=/private/tmp/abg-heartbeat-tmp node --experimental-vm-modules --test --test-concurrency=1 test_env/tests/<f>.test.mjs` in T. Pass/fail/skip, baseline = after: liveness-inactivity 3/0/0, owned-process-lifetime 34/0/0, native-frame-observation 1/0/6, management-stream-drain 4/0/4, lifecycle-failure-carrier 7/0/0, qualification-law 7/0/4, calculus-fold 25/0/0, m5-worker-transport 39/0/0, d5-authentic-preserved-result 1/0/0, management-supervision 5/0/0 (103 s → 150 s). Skips pre-existing. No timing red, so no rerun. Outputs in `X/{baseline,head-new,after-new,after}/`.
- The oracle copy (`2c9328e4…`, 46,684,229 bytes) is a read-only copy of L2's `l2/oracle`.

## RETRY-008 (T1)

- Old: "`inactivity_timeout` maps to `no_output`; `hard_timeout` and `transport_exit` map to `transport_failure`; …"
- New: "`inactivity_timeout` maps to `transport_failure` carrying the inactivity timeout class, and `no_output` is classified only when probe coverage establishes it; `hard_timeout` and `transport_exit` map to `transport_failure`; …"
- Identifier and the rest unchanged. `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:73` still maps `inactivity_timeout` to `no_output`; outside the grant.

## What a host must declare now

An inactivity longer than the longest interval with neither model progress nor a status row. Recorded maximum: 83.5 s, scope 2's wait for a first API response (`requesting` at +1.1 s, first stream event at +84.6 s); compactions now peak at 30.0 s. 60 s still contains 1/24, so the 60 s fallback (`actor_process.ts:714`) is not safe and F1(3) stays open; 120 s holds with a 1.44× margin.

## Deviations, stops, residual risks

- D1: E3 row identity is by length, not content; the RC6 archives are in the main checkout, outside the grant.
- D2: the installed native discriminator required a new fixture mode in `semantic-worker.mjs`, read as within "the test files that own these claims".
- D3: legacy L non-window branch unchanged; an L-profile actor's physical lease still ignores status rows.
- D4: new case 1 first expected 2 retries; the text has 3; fixed before the green run (its old-build failure is earlier, at the missing `heartbeat` key).
- Stops: none hit. R4 holds through the declared `stdout` source; declaring `worker_heartbeat` would change the digested binding `sources` (`liveness.ts:104`) and refuse recorded Runs. E5 unchanged. A status row is textually distinct from `api_retry` in recorded and tracked streams.
- Risk: the 60 s fallback still contains a 1/24 first-request wait (F1(3)); refusing a stream-json launch below a declared floor needs an owner decision and a requirement.
- Risk: tracked retry archives show `init | status/requesting | api_retry ×10` with no status row between retries; a CLI that emitted one per retry would let a retry loop renew. No sample has long backoff; the hard cap still bounds it.
- Risk: F4 is likelier (a status row inside the TERM grace flips the as-of read); no consumer acts on it.
- Risk: `progress_without_result` (`liveness.ts:810`) conflates activity with progress; pre-existing and unreachable for actors.
- Risk: compaction row shape not verified by content here (rests on RV1); the live CLI was not exercised (no provider calls).
