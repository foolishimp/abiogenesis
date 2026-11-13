# Product Frame

ABIogenesis 5.0 retains the fifteen families (F01–F07, F09–F11, F13–F17), GOAL-035/T-287, and the existing single-runtime boundary. This slice covers RC7 preflight, launch, maintained SDK construction, history and fresh result/replay cost observed while RC6 builds RC7. Product/requirements own the outcome; accepted HOW and existing owners implement it; ABG owns admission and truth; SDK/CLI invoke and project. Evidence files remain observations. No new cache authority, store, event stream, service, runtime or framework is selected.

STDO 3.0.4 verified through `stdo status --definition …/abiogenesis-rc6-local-cut/stdo_abiogenesis.json --verify`: installed and valid, no failures, manifest `102817a3f4bea4dca1d6fa0fc634b94404dd2ba82ba6d8c38b273402dda9f95b`. Work/review skills were loaded from that exact installation. The host permits unrestricted filesystem access; named acquisition and metadata limits were followed, but this is not a technical read sandbox.

# Closed readiness

**One small source relation is ready for implementation: preserve the authenticated prefix through run-read population.** The current reuse claim is falsified by both installed RC6 and frozen RC7 code. The wall-time contribution remains unmeasured. This is a closed architecture/readiness return, not a source fix or a performance acceptance.

Assignment SHA `033f4afe0bd3301c39b085d7c7cb8182dd271c9c24af3cfa89d06321df1de7bf`; selected source SUBJECT SHA `94c038bd5f3bbb96ba8bc749097473d9adfcce4693ccbdc9520523763e9c1d74`; actual D5 close SHA `6ca141a406721beb702b64706ba867d8af58488b067f5fbe203b3582f0a20929`. Full paths, bytes, hashes, installed counterparts and verified source membership are in READINESS.json. The live Product, Definition and frame bytes match the frozen members. GOALS and the projection requirement were separately acquired live authority.

## What the timing establishes

| Wall interval | N2 | N3 |
|---|---:|---:|
| Preflight | 46.45 s | 59.54 s |
| Host start to dispatch | 42.47 s | 55.00 s |
| Dispatch to native actor | 46.68 s | 58.98 s |
| Native actor work | 101m16.02s | 13m07.72s |
| Native exit to host/fresh close | 9m54.17s | 8m37.50s |
| `run_result` subprocess | 85.71 s | 63.95 s |
| `run_replay` subprocess | 86.36 s | 65.65 s |
| Outcome to first read subprocess | 214.96 s | 217.18 s |
| Result subprocess exit to replay start | 161.62 s | 154.49 s |

Setup was reused and is unmeasured, not zero. N2 has about 172 seconds in the two read subprocesses and 377 seconds in the pre-call/between-call intervals; N3 has about 130 seconds and 372 seconds respectively. These intervals include parsing, recording, physical hashing and construction; they are not function or CPU attribution. N3 outcome time comes from the retained outcome summary, not a polling record's capture time. Nested intervals must not be added to their enclosing interval.

N2 history grew from 716,470,691 to 914,514,036 bytes; N3 began there and ended at 1,016,286,093 bytes. Native tasks and histories differ. **No matched speedup follows.** The predecessor-close-to-next-launch intervals (N2 41m45s; N3 27m53s) contain Root review, controls and preparation and are not runtime between-task latency.

## Additional actual P3 sample

Root supplied immutable `d5-proof-03/preflight-attempt-02/PREPARE_PHASE_TIMING.json` during this evaluation (SHA `ca2653214fde0497df09b89e3162cba9af0a434e152c9f5bb7647ec30f481b6b`). Host preflight took 65.270 seconds and exited 1; its timed module body was 65.147 seconds. `environment_refresh` took **62.319 seconds**; installed-content verification 1.215 seconds, physical prefix read/hash 0.658 seconds, source identity/hash 0.149 seconds, and worksite observation 0.257 seconds.

This identifies the dominant measured phase as the existing `caller.refresh` owner chain. It does **not** attribute that time internally to history decoding/validation, body materialization, artifact folding or environment construction, and it does not show that the later LATENCY-01 population defect caused this first refresh. First cold acquisition remains a genuine information boundary. The current instrumentation places the marker immediately before `dry.refresh`; its current source hash is retained without claiming a complete executed-script identity.

The subsequent capacity guard refused: the initial projection was 1,257,382 bytes against a 1,048,576-byte cap, with 131,072 reserve; provider calls and Run admissions were zero. This is a failed preflight observation, not completed preparation. Root's reduction of incidental original-source carriage is a control change preserving source/protected/assessment assets; this evaluation neither changes nor bypasses the runtime limit. No sample was awaited and no execution was activated.

## RC7-LATENCY-01: the existing acquisition is lost

In frozen `abg/project_read_definition_bindings.ts:660–695`, `populateRunReadAtDurablePrefix` calls `projectOwnedPrefixArtifactTruth(input.prefix)`. The artifact owner (`artifact_truth.ts:859–877`) captures the raw coordinate, authenticates its history, and returns an owner projection whose `prefix` is that captured object **A**. `DurableHistoryDerivation.capture` (`event_store.ts:1738–1746`) registers A, leaving the original raw input unregistered.

Population then calls `prepareRunReadAtDurablePrefix(input.prefix, …, environment.artifactTruth)`. Preparation captures the original raw prefix again (`project_read_ports.ts:1017–1027`), producing **B**. Its existing reuse branch requires `acquired.prefix === packet.prefix` (`:698–707`). A and B differ, so it calls `readOwnedRuntimeEventPrefixAtDurablePrefix(B)` and repeats the cold history acquisition. Both implementations were checked: installed `project_read_definition_bindings.js:436–447` has the same handoff, and installed ports/artifact/history code has the same capture and equality behavior.

This is a deterministic construction/pure projection over the same established prefix. The second acquisition supplies no new information about an intervening effect. Product's Live State/Valid Reuse law and REQ-R-ABG3-PROJECTION-002/-025 already select owner reuse. The actual read kernel's acquired `resource.entryPrefix` is a different case: it retains its owner identity and should remain so.

**Smallest source change:** pass the acquired `artifactTruth.prefix` into the existing preparation, or capture once at population entry and thread that exact value through both calls. Keep the raw input admission, source/binding/authority checks, refusal identities and existing prepared projection closure. No new cache key, trusted flag or reader is needed. The static causal confidence is high; its time and allocation savings are unknown until the focused discriminator runs.

## Complete owner map and bounded consolidation

| Phase | Existing owner and information gained | Bounded action |
|---|---|---|
| Preflight | N3 `prepare-r1.mjs:11–60` verifies controls, source, predecessor, installs and current worksite. Its initial/final log hashes prove preparation did not write the prefix. | Preserve those boundaries. N3 preflight is this script, not generic `runner.preflight`. Separate its costs with existing timers. |
| Host start and launch | `dispatch.mjs:13–38` rechecks the worksite after preparation; `runner.mjs:332–354` checks installed content before and after execution. A fresh CLI then acquires and dispatches through ABG. | Mutable state and separate processes make these real observations. No evidence supports removing them or selecting an auth/bootstrap rewrite. |
| Parent refresh and read construction | `public-setup.mjs:126–133` retains an owner environment, but `runner.mjs:267–279` constructs each read from `caller.reopen()` and the deserialized close handoff. | Fix LATENCY-01 first; then thread the exact authenticated `environment.prefix` into read construction while it equals the current handoff. Preserve actual invalidation. Do not reconstruct authority from evidence files. |
| Fresh read subprocesses | `definition_event_resource`, `exact_prefix_bindings` and the read kernel own cold physical acquisition, source/authority admission, unchanged-prefix receipts and replay projection. | Keep both genuinely fresh processes for this proof. Their acquisition supplies independent cold evidence. Retain each child's already acquired coordinate and prepared closure internally. |
| History and projections | `DurableHistoryDerivation`, `RuntimeHistorySelection`, `RuntimeDerivationSource`, `runtimePrefixComputation`, artifact truth and environment owners already hold disposable owner derivations. Run replay uses the selected Run. | Use this implemented chain. Do not add a digest-global cache, service, replacement index or persistent truth surface. |
| Evidence recording | `commandRecorder`, `invokeColdInstalledEntry`, `freshReadbacks` and dispatch repeatedly serialize complete output into evidence artifacts. | Retain one complete output body and use identity/metadata references from existing summaries where their consumers permit. Keep complete evidence custody and readback comparison. This is separate operator evidence work. |

The evidence-carriage repetition is concrete: N3 result stdout is 44,169,481 bytes, command result 44,206,570 bytes and parsed outcome 44,448,592 bytes; replay has a similar trio. `fresh-reads.json` is 177,677,375 bytes because the returned rows retain both `projection` and `ownerOutput` containing the projection (`runner.mjs:282`). `execution.json` is 198,486,895 bytes. File sizes and source construction establish repeated carriage, not its seconds of cost. Consolidation should use the existing recorder and retained files; it creates no Product store or authority.

The separate N2 body observations also establish 43,147,626 compact Result-value bytes, `task.context == before`, and 12,660,520 unchanged entry bytes. Those are inputs to the existing body-encoding/native-work owners. They can reduce bytes encountered by necessary cold work, but this latency frame does not select a rival codec or infer wall savings from byte counts.

## Nearest proof and invalidation

1. **One actual prefix, one population:** feed an ordinary deserialized close handoff to the maintained installed constructor. Instrument the existing cold acquisition boundary in focused proof; demonstrate the duplicated baseline and single successor acquisition across environment/source preparation, with equal call/request/source/authority results. The baseline count here is a static diagnosis, not an executed test.
2. **Same-process reuse and refusal:** cover acquired identity, equal copied and separately deserialized coordinates; changed/currently stale prefixes, missing/replaced/truncated/changed cold bytes, wrong contract, WorkspaceBinding and source. Copies must not impersonate an owner receipt. Pure construction must append nothing and preserve exact refusals.
3. **Cold installed composition:** on one frozen successor, retain separate fresh `run_result`/`run_replay`, terminal ref/digest/producer/value agreement, truthful absence after incomplete work, and unchanged physical prefix identity/length/digest. Cover the affected six Run/GraphCall read members and common construction routes; retain unrelated qualification evidence.
4. **Matched phase timing:** hold history bytes, event contract, Run, selectors, installed payload/environment and evidence policy fixed. Measure parent refresh, full-file identity hashing, constructor, child wall, parse/serialization/write and final agreement separately. Label warm/cold host conditions. The supplied P3 failed-preflight sample localizes refresh; deeper refresh and fresh-read attribution remain unknown. This evaluation did not wait for or activate samples.
5. **Workflow claims:** separately measure setup, preflight, launch, native work, closure and operator preparation on the declared actual workload. Readback improvement alone cannot qualify worker-launch or complete-workflow performance.

Changing these source paths invalidates their dependent read-population/reuse and performance claims, and any changed evidence-carrier consumers need reproof. Immutable N2/N3 observations, D5's exact bounded source/close evidence and unrelated accepted cuts remain retained. There is no test/build/runtime execution, source fix, internally attributed CPU cost, matched comparison or release acceptance in this return. The new P3 sample was an already-retained failed-preflight observation supplied by Root.

The genuine missing inputs are the focused before/after acquisition result, attribution within the now-measured refresh phase, and the remaining fresh-read/launch phase costs. They do not prevent implementing the demonstrated owner handoff. Root owns the next increment and any operator territory; this evaluator stops here.
