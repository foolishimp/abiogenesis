# Proposed finite change and proof map

All rows are preparation for selection, not permission to edit or execute. Paths below are relative to `build_tenants/abiogenesis/typescript/`. Exact current bytes are in `input-pins.json` and match the closed candidate for all seven inspected production files.

| Proposed file | Exact responsibility to change or retire |
|---|---|
| `code/src/abg/worker_transport.ts` | Replace semantic `onProcessExited`/`onTerminationUnconfirmed` forwarding with one final canonical-facts observer; preserve private raw capture cut; explicit pre-spawn no-child boundary; first-error precedence |
| `code/src/abg/actor_process.ts` | Consume final facts; append confirmed semantic Process terminal only from required physical relation; retire early flag/negative-status/absent-start inference; keep actual admitted witness and original exception; lifecycle current-uncertainty projection |
| `code/src/abg/replay.ts` | Existing confirmed Process event determines confirmation; historical unconfirmed row does not defeat later genuine confirmation |
| `code/src/abg/runtime_liveness.ts` | Process remains live until existing confirmed terminal; retire historical-unconfirmed veto after confirmation |
| `code/src/abg/event_calculus.ts` | Retire `unconfirmedFacts`, iterator/fork reconstruction, `unconfirmedProcesses` and exit veto; confirmed terminal clears cleanup-live; Actor cleanup consumes pending; preserve U1 historical withdrawal |
| `design/T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN.md` | Add explicit direct-exit capture versus confirmed owned-scope terminal mapping and exception/final-facts obligation; four accepted comment bytes remain immutable |
| `test_env/support/fresh-process-runtime-proof.mjs` | Delete legacy runner/selector; single installed common lifetime path, optional retention, actual owned PID equality; unchanged existing public test helper argument shape |
| `test_env/tests/m5-worker-transport.test.mjs` | Migrate the two early observer uses; add final handback/error-order assertions using existing exposure/fixtures; preserve original capture, finite EPIPE and failed-launch oracles |
| `test_env/tests/t287-owned-process-lifetime.test.mjs` | Use existing controlled child/clock to establish final canonical facts and first-error/suppressed ordinary-callback premises; no new physical scheduler or parallel harness |
| `test_env/tests/m5-terminal-quiescence-owner.test.mjs` | Retire the leader-exit-as-semantic-terminal fixture at149–171 and contradictory owned/cold history174–204; replace with unconfirmed-without-exited then actual confirmed-terminal sequence; keep unrelated-history, nominal owner, cardinality and digest-tamper oracles |
| `test_env/tests/t287-native-workspace-work.test.mjs` | Reuse existing actual actor-owner VM/lower-premise fixture for final-facts handoff and error admission; retain explicit controlled lower-auth scope and post-effect channel-conflict case |
| `test_env/tests/t287-native-work-unknown-effect.test.mjs` | Clarify fixture `exit()` as confirmed owned absence; after uncertainty assert cleanup-live clears, pending persists, historical unknown-effect withdrawal is unchanged at warm/full/cold prefixes |
| `test_env/tests/t287-management-stream-drain.test.mjs` | Migrate existing `onProcessExited` ordering observer to final-facts observer; preserve drain/result-capture assertions |
| `test_env/tests/m5-fresh-process-reconstruction.test.mjs` | Use its existing default caller as the no-retention regression; retain projection/digest/identity oracles; add only narrowly necessary assertions if selected |

Read-only dependencies: canonical `shared/owned_process_lifetime.ts`, `abg/native_work_effect.ts`, `runtime-retained-projections-worker.mjs`, all other direct callers below, prior freezes and generated outputs. An unforeseen requirement to edit another file returns before expansion.

## Focused existing-owner proof predicates

| Case | Required observation, before any dependent work |
|---|---|
| Direct exit, no error, cleanup still pending | Raw capture has ended; no `actor_process_exited`, replay confirmation or Process-live extinction yet. Later absent scope permits exactly one semantic terminal. |
| Exit then stream error; final scope present / unknown | Two controlled values: exact original Error identity, final facts delivered despite ordinary-callback suppression, existing unconfirmed admission, zero confirmed Process/Actor terminal or Result; process/cleanup live remain. |
| Exit then stream error; final scope absent | Same Error identity; final facts delivered; exactly one confirmed Process terminal and permitted existing transport-exception Actor terminal, no fabricated exchange. |
| Stream/observer error before exit | Raw final direct-exit fact survives suppressed ordinary callback; first Error unchanged; absent and unknown outcomes follow the same final-fact law, never missing-callback inference. |
| Final-facts observer/admission error | Original earlier Error wins; absent earlier error propagates observer Error; failed admission cannot manufacture a confirmed witness or Actor terminal. |
| Explicit pre-launch failure / actual no-PID failure | Existing spawn-failed route only from positive no-child premise, distinct from exit. A physically launched child with failed start admission never becomes no-child. Preserve the prior actual ENOENT evidence without relabelling it as new proof. |
| U1 unknown then genuine physical confirmation | Historical scoped observation withdrawal unchanged; physical live clears, pending awaits Actor terminal. Warm/indexed/full/cold agree; no currentness restoration from cleanup. |
| Fresh runtime proof with and without optional retention | One common lifetime path, both actual spawned PID/self-report equalities, exact independent fresh projections; first worker failure/unknown blocks second; no legacy timer/kill branch reachable. |

Use existing actor-owner fixture in `t287-native-workspace-work.test.mjs` and lifetime/worker controlled exposure rather than authoring another parallel admission harness. For true physical evidence select only finite existing child fixtures under a later grant. Never infer physical scope absence from synthetic event rows. Cold serialized/closed-prefix proof and an actual fresh-process read must be distinguished; the latter uses the consolidated existing helper and explicit installed root under a later finite effect grant.

The handoff spans production and tests atomically: no intermediate candidate may pair a delayed producer with stale negative projection rules, or preserve fixtures that call direct exit confirmed terminality. Keep existing invalid duplicate/Actor-before-confirmation and preterminal confirmed-exit positive controls. No broader native/U1/C2/C0/E04 campaign is selected by this proposal.

## Direct fresh-runtime proof callers (12 calls, nine files)

| Existing file in `test_env/tests/` | Current call lines | Current retention |
|---|---|---|
| `m5-fresh-process-reconstruction.test.mjs` |83| none |
| `t287-live-worksite-construction.test.mjs` |267| none |
| `t287-worksite-branch-construction.test.mjs` |556,751| none |
| `r9-causal-result-closure.test.mjs` |390| none |
| `t287-worksite-construction.test.mjs` |651,964| none |
| `t287-c0-post-publication-failure.test.mjs` |689| optional `ownedProcessProof` |
| `t287-post-binding-worksite-write.test.mjs` |878,971| none |
| `t287-c0-correction-regressions.test.mjs` |110| none |
| `t287-worksite-command-execution.test.mjs` |780| optional `ownedProcessProof` |

All already pass explicit `installedPackageRoot`. Their argument and projection contracts stay intact; optional retention does not remain an ownership selector. Pinning this affected call graph is not a grant to rerun all nine files. The original P5 file and old proof subjects remain unchanged by this preparation.
