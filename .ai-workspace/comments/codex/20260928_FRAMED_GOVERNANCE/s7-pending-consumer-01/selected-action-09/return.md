# Selected-action09 closed Worker return

Work result: **incomplete**. T287_S7_SELECTED_ACTION_INSTALLED_09 stopped at its first material installed proof mismatch. No repair, retry, later Public read, duplicate call, cover, current start or witness stop followed. Root owns disposition and acceptance.

The new installed same-basis selected-action operation returned `result/completed` and closed its existing Run. The proof then asserted that its Public Run coordinate equalled the native opening-scope coordinate (`t287-selected-action.test.mjs:122`). The references agree; the digests intentionally differ. This is a **proof realization mismatch with the existing shared identity projector**, not an established runtime/Product defect. The unexecuted witness-stop caller shares the same collapsed helper and must be included in any successor decision.

## Exact subject and effects

Request `request.txt` SHA256 `df4c5024b447c4cce3b78e3dd8dff0f398f0c12422f62943a1868b14a8f45327`; disposition02 `c12ac2befe1dab8620e1c74114b53cd5facbf267dae69cbb1d125aa2c9977551`; current HOW `e9f17f0235be2f94408c3c3f30325f7540142e5f16137b89a7305be4a67f656e`. STDO v2.5.1-rc.1, inherited Worker frame plus F-end-to-end-interface-integration. Same accepted eight-term fixture and07 occurrence repair; no core, generated, fixture, HOW, authority-test or old native/install changes by09.

`changed-files.json`, `preimages.json`, `proof-changes.patch` and `final-sources/` bind exactly three proof changes:

| File below TypeScript tenant |09 preimage SHA256 | Closed SHA256 |
|---|---|---|
| `test_env/support/t287-selected-action-host.mjs` | `46bbc91ad084bdc701b8c310ff0b09b59ca4852adf07616d756ea9ccd7bc6f83` | `0f8e9ccdaedfad99ea36670bc2ca43b94b8f5c799ee845270cd91aa32fd43787` |
| `test_env/tests/t287-selected-action.test.mjs` | `4dd2bf10a422311a18c9029746fcd2935c0601bc47b013066356ce1ac97c56b4` | `e2d81582549dae9fa0b034cd490a3683206ddcf6b48553ca6752d4f22c03d935` |
| `test_env/support/registered-graph-selection.mjs` | `39af28751dbd3d0b84506e1a4e67a415eef1f7b1d4c1e945be62b837f7a50be5` | `a9ea368be43d6b6d93dff8b1084f653997408185956f0f8a26b422520186d16d` |

The donor adds explicit declared-start parameterization while retaining existing direct/next defaults; the test uses the actual declared start; the observer freezes its parsed snapshot for the existing validated-prefix owner. Pure preflight01 exposed mutable input to that owner; preflight02 passed after this in-grant correction. Both actual Product preparations and the separate invocation observation predicate passed with `start://selected-action/root@5`, supervised/converged, coherent work attribution. These prospective preparations used the retained actual05 environment; they are not evidence of an executed09 Public current start. `construction-walk.md` remains the contemporaneous pre-install walk, with its completeness claim qualified by the Run-coordinate miss below.

One new package/install population and one installed attempt occurred. Core archive SHA256 `c061fca61bc180e45b717527dc45f44dbeedcff69d67916d3801b85edb0c8c23`, 10,370,153 bytes; Product content `sha256:6bb4ff556cd1368da8abca5a436b69a44370a39ae734043d8f699d202c5fbb9c`. `archive-installed.json` compares every archive file to the install: 5,256 files, 67,809,001 unpacked bytes, no mismatches; all733 packaged generated members equal the current retained07 build. The unchanged fixture archive is the04 archive SHA256 `8b9a2a5c2323cb15132d37850309e976bc4470f6e609a527aef3c46261260205`. `protected-correspondence.json` confirms all11 protected preimages. Prior07 build,08 cut and04 same-basis43-record result remain separate exact references in `prior-references.json`; they receive no new qualification here.

## Complete affected coordinate relation

All coordinates below refer to the same actual Run:

`run://abiogenesis/f649cf546c4553fd94c85719d2997cb8196d09d75a405de739df1d20a7e77104`.

- Native digest: `sha256:f649cf546c4553fd94c85719d2997cb8196d09d75a405de739df1d20a7e77104`.
- Public digest: `sha256:8975fd12856c5d62866795a4e33cb972244db0d07b8822eaa0f4dbb2bdb47afa`.
- Opening event: `event://abiogenesis/9878ce0cd896b14239802fea292839283337e61de380ecdcea6c7e90205c7aad`.
- Root basis: `execution-basis://abiogenesis/b4f3d920d048846c6d7fe764d33270289732366af799c282851f2a00caea4c9a`, digest `sha256:b4f3d920d048846c6d7fe764d33270289732366af799c282851f2a00caea4c9a`.

`code/src/abg/open_call.ts:503–515` constructs the native body digest from the exact admitted root basis/invocation/workspace/Program/graph relation. `replay.ts:1712` is the existing authoritative join: `projectRunIdentityAtPrefix` validates the unique opening and its causal root basis, returning `{run, nativeRun, executionBasis, runOpenEventRef}`. `run` hashes the opening semantic payload; `nativeRun` uses the admitted `payload.runDigest`. Neither is inferred from the URI. `coordinate-diagnosis.json` records this actual installed pure projection against the frozen final prefix.

| Consumer | Required representation and owner | Actual09 relation / remaining effect |
|---|---|---|
| Selected-action source `request.run` | Native source Run. HOW:258–260; `construction_continuation.ts:518–519` compares opening scope `runDigest`. | Native helper at test:108 is correct; actual same-basis request passed and continued. Covered source must retain this identity even when current Run differs. |
| Returned `resources.run` and `ownerOutput.value.run` | Public **current** Run. `project_read_ports.ts:765,818` consumes shared `identity.run`; `run_invocation.ts:1910–1927` uses it in output, and `resourceReceipt:1211` carries the same truth. | Both actual returns equal shared Public identity. Test:122 incorrectly compares to native current scope; this is the earliest failed executed assertion after successful resource completion. |
| Cold result/replay `source`, projection `subject`, semantic oracle | Public current Run. `prepareRunReadAtDurablePrefix` supplies `truth.run`; `project_read_definition_bindings.ts:697–707` authenticates its digest. Producer Run refs and native occurrence joins remain their own owner fields. | Draft `coldOracle` passes actual receipt Public Run and compares both subjects to it; this coordinate is correct. Neither cold CLI call nor the whole semantic oracle executed. Do not replace its input with native digest. |
| Public witness stop `subject`, `context.run`, projected basis | Public Run plus exact admitted basis; S06 design:818–831. `witness_definition_bindings.ts:242–270` requires `identity.run`, then maps internally to `identity.nativeRun`. Native admission's own Run-open predicate uses native digest. | Draft test:157 supplies the native helper for both Public fields (and its evidence entry). Conditional on preceding authority succeeding, existing wrapper would return `context_mismatch` at:295–299 before native stop. This is source analysis, not an executed refusal. Approval/grants bind the Public request and must be constructed from that exact representation. |
| Duplicate source and duplicate-current requests | Native source/current Run according to the selected-action request owner, not Public receipt identity. | Test:123 preserves original request for duplicate and uses native current scope for duplicate-current. Both are unexecuted. Do not globally redefine `runCoordinate` to Public. |

The design already distinguishes these identities. The proof helper `runCoordinate(opened)` collapses a native scope into an unqualified `{ref,digest}` reused across a Public output assertion and planned Public witness request. The preflight assembled upstream owners but did not compare every downstream coordinate consumer to its real owner. No new authority, alias, Public field or runtime repair follows. A bounded successor discriminator is to use the existing shared projector/owned Public read at each current prefix, check each listed consumer independently, and then resume only the outstanding effects under a successor grant. This return does not implement that change or claim the remaining composition passes.

## Established execution and refusal bounds

The initial same-basis host ran the existing installed acquisition/traversal path, reached two actual selections, then its test-only fsync observer killed host38672 at216 events. Native recovery used the preserved initial origin and exact abandoned lock; it returned a genuine handoff. The corrected Public current-start launcher/observer path remains unexecuted. `same-basis/prepared-relation.json` binds the pending second selection, held cursor, current input, original admitted intent and exact Program validation.

Four installed Public negatives passed, preserving the same216-event boundary without admission/use:

| Negative | Actual owner stage/code/path | Credit |
|---|---|---|
| Valid alternate catalog view | selected-action preparation `basis_mismatch`, `/continuation` | Existing transitive Program-validation identity discriminates; no earlier authority masking. |
| Crossed current basis | selected-action request selection `stale_action`, `/request` | Current basis mismatch. |
| Crossed selected action | selected-action request selection `stale_action`, `/request` | Selected-action coordinate mismatch. |
| Crossed source Run digest | selected-action source-scope comparison `basis_mismatch`, `/request` | Native source Run digest mismatch. |

The positive operation admitted once, consumed continuation `continuation://abiogenesis/282701d97dae937770ae4196ac92cedcc65a9554b5132178e61161da1f1c8939`, and conserved intent `construction-intent://abiogenesis/792d6d4d91c5b60ef3d763e71140e331f89df90c49f63b2734268e982655c42f`. Actual native evidence contains the child value `{kind:fixture_consumed,schemaVersion:5.0.0,payload:"selected second action"}`, its evaluation/delta, one matching refresh, terminal `next_action_projection/converged`, current parent closure and Run closure. Read-only closeout projects that occurrence `resolved` and Run `closed`. `coordinate-diagnosis.json` binds those events and actual typed terminal producer/value to the final boundary. It is not the required pair of cold Public reads; one observed use is not a duplicate-refusal proof.

| Claim | RFM status | Bound |
|---|---|---|
| Declared-start representation, current acquisition and both prospective preparations | satisfied | Pure actual owners; no actual current start/attribution handoff yet. |
| New package/install exactness and unchanged core/fixture/HOW | satisfied | Full archive/install comparison and protected correspondence. |
| Same-basis selected operation through child/evaluation/refresh/closure | satisfied | Actual receipt plus admitted native history, bounded above. |
| Public Run equals native scope digest | falsified | Existing shared identity projector establishes distinct values. |
| Draft Public witness-stop representation | falsified | Existing Public guard requires `identity.run`; draft passes native. No stop executed. |
| Four finite same-basis negatives | satisfied | Exact owner codes/paths and no-append boundaries above. |
| Cold Public result/replay semantic agreement; duplicate once-only refusal | indeterminate | Calls not executed. |
| Real cover, source supersession, equal-value abandoned prior/current successor, covered continuation and cover negatives | indeterminate |09 population never started. |
| Earlier05 inherited work authority as lawful current continuation authority | invalid_basis | Earlier closed cuts retain their existing bounds;09 pure acquisition prepares fresh attribution, without importing earlier continuation credit. |
| S03/release readiness or independent acceptance | out_of_frame | Not claimed. |

## Safe boundary, preservation and minimal resume dependencies

Native resource: `selected-action-09/disposable/abi5-root-env-QKFbH0/runtime/events.jsonl`, device16777230/inode463748325. Final328 events, 3,760,917 bytes, SHA256 `3c20f5806b6201ff462daf1285fbd390d4f75a87f7369d442213f3c341c6001b`; durable coordinate `sha256:432c6bbdb38b3d5564be4530fbc1ad16408159675e4b836feeb66334eb5a4dad`. `latest-handoff.json` is the actual successful CLI completion handoff, also retained in the receipt and failure capture; reopen-authority digest `sha256:0054015ef1f947998c5139a24951dee39b0e766495806003e8a867794494b2cd`.

`same-basis/interrupted-prefix.jsonl` preserves216 events/3,319,376 bytes/SHA256 `bff1c95ccf43a221f2fdae5971b39411eb2957d7ca8a0a7e04ddd097aaabcc9e`; it is an exact byte prefix of the final native resource. Initial-origin, interruption, recovery-selection and recovery files bind the predecessor and physical acquisition. The original lock device16777230/inode463748327 was recovered; its exact path and bytes remain in recovery-selection. At close it is absent. Host38672 is dead; installed CLI exit0; test exit1; no operation remains in flight. `closed-native-state.json` records read-only observation. No unknown held resource, reconstruction, truncation or cleanup occurred.

A successor can preserve/reuse this successful closed boundary after exact handoff/native/package verification. Minimal dependencies are: the retained09 installedRoot and archives in `same-basis/setup.json`; current native resource plus `latest-handoff.json`; `same-basis/environment.json`, `opened.json`, `prepared-relation.json`, `continue-call.json` and completed receipt for original work attribution/current basis/cursor/intent; interruption/recovery predecessor records; the frozen proof sources and existing identity-owner contracts. The completed occurrence cannot become pending again. Cold reads/duplicate refusals can address it at its closed boundary, while the covered case still needs its own lawful unconsumed source and distinct actual prior/fresh current starts on owner-appended history. No reinstall, rerun of the successful continuation, new package or reconstitution of its pending prefix is required by the observed mismatch. Such effects await Root's new grant.

`boundary-and-costs.json` separates costs: setup22,029.876ms (pack3,311.359, verification12,346.773, install2,670.293ms); initial host22,759.490ms including setup (difference729.613ms is approximate traversal/host overhead); continuation1,677.804ms; four negatives1,284.847/648.380/635.541/638.035ms; installed test31,387.145ms. Passed pure preflight body4,375.136ms. Cold/covered costs absent, not zero. No build09.

HEAD remains `55a8a452141caf180ea6cee6365d2a1bfb9da34e`; cached diff and unmerged entries empty. Index binary changed from preimage `ec46bac8e76e787d61fb13c2b4e7239643dcd42b699801c3ab79b705309801ae` to `2b0e5154a5b9145385b027bc82b54bb9da07ba740c86e01d5816dd261f38ae88`. Root reported its independent `git status` without `GIT_OPTIONAL_LOCKS=0` refreshed the stat cache; Worker confirms the resulting hash and has not reset/restored or otherwise mutated the index. All closeout Git reads used `GIT_OPTIONAL_LOCKS=0`.

The remaining cold/read/stop/current-host/covered relations are uncertain until exercised under the corrected per-owner coordinate mapping. Freeze records bind this return, exact proof changes, unchanged owner/design basis, package/install inventory, successful bounded history, failure and resume dependencies. No acceptance or continuation beyond this closed return.
