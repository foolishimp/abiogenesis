# Technical debt walk-through: abg-workers

Commentary, not law. An independent read-only reviewer (Claude Opus 5.5) wrote this for the Executive on 2026-11-12. The subject is the `abiogenesis` working tree on `main` at `002035b8a`. The repository has 738 uncommitted paths, none under `T/code/src/abg/`.

Scope: the 20 files under `T/code/src/abg/` named in the area brief, about 13,058 lines. T is `build_tenants/abiogenesis/typescript`. Unless a path says otherwise, it is relative to `T/code/src/`.

Method: I read the census rows for the area. I outlined every file with its top-level declarations, read the files that carried signals in full, read the others at the lines named in each entry, and followed the leads with `git grep`, `git log -S` and `git merge-base --is-ancestor`. I ran no tests, builds, provider calls or network calls. The coverage table at the end records how I read each file.

Labels used below:

- **F_P**: a probabilistic (LLM worker) C call.
- **C2**: the worksite command execution leaf.
- **L profile / P profile**: the legacy root event contract (`LEGACY_ROOT_EVENT_CONTRACT_DIGEST`) and the current one (`ROOT_EVENT_CONTRACT_DIGEST`). An L store can still take appends until the witness reprice moves it across the L-to-P boundary.
- **Failure class**: the value `classifyWorkerTransportFailure` returns: `contract_failure`, `no_output`, `transport_failure`, or null for success.
- **Package tier, none tier**: the census reachability tiers.

## Answers to the leads

### What invokes each module

| Module | What it is for | What invokes it at runtime | Superseded? |
|---|---|---|---|
| `semantic_stage`, `semantic_job`, `semantic_revision` | ABG-side authenticated projections for the published semantic-stage, semantic-job and semantic-revision GTL modules. These are the D1/D2 requirement lifecycle. | Runtime tier. Reached through `product/builtin_semantics.ts:810-1029` (the product semantics providers), `c_call_outcome.ts` and `instruction_assembly.ts`, for any Program that composes those published modules. The manifest publishes them (`scripts/generate-product-manifest.mjs:1203-1214`). The default library uses only `invocationRootAtPrefix` from `semantic_job.ts:69`. | Not superseded by any decision I found. See the specification lifecycle carriers entry: whether the default library or these modules realize A5-F17 is an open owner question. |
| `witness_admission_operation` | Native admission of the six witness acts. | The Public operation `abg.operation.witness.admit`. Only `reprice` and `run-stopped` are bound (`witness_definition_bindings.ts:378-382`). | No. Four members are implemented natively but not bound. |
| `qualification_proof` | Exact-candidate qualification material, verdicts and self-conformance joins. | `validator/self_conformance*.ts`, `implementation/qualification.ts`, `implementation/release_publication.ts` and `actor_process.ts` (assessor eligibility). | No. It is live on the qualification and release path. |
| `governed_context` (+ `governed_context_client`) | Private GC03 governed lookup for a native Construction actor: a pinned Python adapter, a fixed socket client and stream-json correspondence. | `actor_process.ts:937-1049`, only when `Program.policies["abg.governed_context"]` is set (`governed_context.ts:812, 882`). No shipped Program or library sets that key; only test support does (`test_env/support/t287-governed-context.mjs`). | Not superseded. GOALS lists GC03 as open, and its one bounded native attempt (B07) ended `runtime_failed`. |
| `native_work_reacquisition` | Reacquiring a C2 command source for governance retry. | The default library (`abg/default_library.ts` imports `governanceNativeWorkReacquisitionResultMatches`) and the leaf `implementation/native_work_reacquisition.ts`. | No. |
| `worksite_command_forward` | The forward re-entry relation, which carries a failed C2 command source into a new dispatch. | `c_call_outcome.ts`, `execution_basis.ts`, `invocation_admission.ts`, `worksite_revision.ts` and the leaf `implementation/worksite_command_forward.ts`. It is a published GTL module. The default library does not use it. | Same open question as the semantic modules (T287_C2_FORWARD_REENTRY_DESIGN). |
| `worksite_construction_recovery` | Deterministic recovery of a preserved C1 proposal from a worker the transport classified `no_output`. | `c_call_outcome.ts`, `implementation/worksite_construction.ts` and `hog/ccall_lifecycle.ts`. REQ-R-ABG3-TRANSPORT-003/014/022/029 require it (design `T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md`). | No. This is intentional retention. |

The default library uses these modules from my area:

- `abg/default_library.ts` imports:
  - `invocationRootAtPrefix` (semantic_job);
  - the `native_worksite_execution` projections;
  - `governanceNativeWorkReacquisitionResultMatches`;
  - `readRuntimeFailureDiagnosticSubject`;
  - `nativeWorkUnknownEffectActor`.
- `gtl/default_library.ts` wraps native workspace work, native assessment and C2. It uses none of the semantic, forward, witness, qualification or governed-context modules.

### What each worksite file owns that its namesakes cannot

I checked this by outline and file headers. Each layer has one role, and I found no duplicated rule between the layers:

- **`abg/worksite_*`** owns the reading of event-log truth: authenticated prefix projections such as `…AtPrefix` and `authenticate…Basis`, and binding-cover and origin derivations over admitted history. Neither `product/` nor `implementation/` reads the log.
- **`product/worksite_*`** owns value contracts, constructors and validators. Two oddities, neither of which is debt here:
  - `product/worksite_command_forward.ts` imports `abg/event_store` and `abg/terminal_result_contracts` for coordinate types.
  - `product/worksite_construction_recovery.ts` re-exports identities from `gtl/worksite_construction_recovery.ts`.
- **`gtl/worksite_*`** owns identities and module publications.
- **`implementation/worksite_*`** owns leaf descriptors and entry points.

### Python adapter path

The Python adapter path is not live. The code is reachable and complete, but no shipped Program selects it, and no accepted native Run has used it.

- The adapter callback `query_artifacts` is wired to `() => null` at `actor_process.ts:1031`.
- `resolve_artifact` is wired to `resolveGc03RetainedArtifact`.
- The cold-verify pair (`reacquireOwnedContextLookupCold` and `coldVerifyGovernedContext`, `governed_context.ts:244, 638`) is called only by `test_env/tests/t287-governed-context.test.mjs:243-275`. The design records it as Root proof (`design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:1601`). It is unwired, not dead.

### The 60 s inactivity lead

This lead is narrowed, not refuted.

- The default is at `actor_process.ts:714`: `ABG_TS_FP_TIMEOUT_MS`, 60,000 ms.
- That one value becomes both `startupMs` and `inactivityMs` of the watchdog (`actor_process.ts:1100`).
- The status-heartbeat repair is on `main`. `313095ecf` and the merge `b99709fa3` make CLI `system/status` rows renew the lease (`worker_transport.ts:310, 350`). The commits `3f605d62d` and `857ae88a8` (the RETRY-008 reprice) are ancestors of `main`; I checked with `git merge-base --is-ancestor`.
- The heartbeat closes the case of silent stretches during compaction.
- The plan written after package H still lists "A working agent can still be ended at the 60 s inactivity default. A first response took 83.5 s in one recorded run" (`.ai-workspace/comments/claude/20261110T232000Z_PLAN_RC12_FEATURES_AND_PLAN_FOR_REVIEW/README.md:384`). The same plan records "the startup timeout is unreachable for real agents" (README:239).
- Whether a status row arrives before the first model response decides the remaining exposure. I did not establish that by reading.

### How many places classify an outcome

There is one rule: `classifyWorkerTransportFailure`, at `transport_contracts.ts:112`. It is called at three sites:

- `worker_transport.ts:838`, which writes the class;
- `actor_process.ts:536`, which verifies the carrier pair;
- `c_call.ts:2131`, which verifies the C-call evidence.

The two verifier calls re-derive a recorded label from recorded facts, which fits the closure "digest-bound prefix projections have owner meanings". The debt is in what the three sites pass in and in the labels outside the rule. See the first entry.

## Candidate entries

### Give the worker failure classifier one set of inputs and one closed label set
- Category: second owner
- Evidence (all by reading):
  - The one rule is `transport_contracts.ts:112-136`. Its three call sites derive the same inputs differently.
  - `processSpawnFailed` is derived three ways:
    - from `launchError !== null` (`worker_transport.ts:844`);
    - from `lifecycle.processTerminalKind === "actor_process_spawn_failed"` (`c_call.ts:2140-2141`);
    - from a heuristic, `!timedOut && !exitObserved && !terminationConfirmed && processStatus < 0` (`actor_process.ts:543-548`).
  - `parser` is hardcoded `"claude_stream_json"` at `actor_process.ts:538`, while `c_call.ts:2136` reads it from the transport binding.
  - A fourth class, `"transport_exception"`, is outside `WORKER_TRANSPORT_FAILURE_CLASS_VALUES` (`transport_contracts.ts:89-93`).
    - It is produced at `actor_process.ts:1687`.
    - It is admitted as its own payload variant at `event_store.ts:698`.
    - It is read at `event_calculus.ts:93`, `runtime_history.ts:715` and `native_work_effect.ts:50`.
  - The rule "accept output despite `transport_failure`" is written twice: `implementation/worksite_construction.ts:232-233` and `implementation/consensus.ts:613-615`.
  - The class is then copied into several payloads: the transport artifact, the actor terminal and artifact payloads, `c_call.ts:578` `transportFailureClass`, `probabilistic_result.ts:100` and `result_evidence_lineage_contracts.ts:22`.
- Retire:
  - One owner, `transport_contracts.ts`, constructs the classifier's observation from the process lifecycle facts, with spawn failure taken from the terminal kind. All three sites call that constructor, and the parser comes from the binding at every site.
  - Put `transport_exception` into the closed value set, or into a named terminal-class type beside it, so the four readers switch over one declared set.
  - Move the salvage rule into the owner as one predicate.
  - Keep the recorded copies. They are admitted history.
- Size: M, about 40 lines removed, with three call sites restated.
- Risk: replay digests of recorded Runs. The verifier at `actor_process.ts:536` must keep its current result on historical carriers, so the spawn-failed derivation must agree with the heuristic on every recorded L and P carrier. The test is to run both derivations over the recorded archives before switching.
- Change class: realization_refactor
- Confidence: verified for the three derivations, the hardcoded parser and the four `transport_exception` sites.
  - Investigate (inferred): RETRY-008 now maps inactivity timeouts to `transport_failure`. The salvage predicates at `worksite_construction.ts:233` and `consensus.ts:614` may therefore accept a complete-looking candidate from a worker that timed out. Settle it by reading whether `timedOut` reaches those consumers.

### Separate the F_P actor's timeouts from the C2 command limits, and the startup timeout from inactivity
- Category: design and specification
- Evidence (by reading unless stated):
  - `selectedWorksiteCommandExecutionLimits` (`actor_process.ts:712-715`) is named for, and typed as, C2 worksite command limits. It reads `ABG_TS_FP_TIMEOUT_MS` (default 60,000) and `ABG_TS_FP_ABSOLUTE_TIMEOUT_MS` (default 3,600,000).
  - The same value is:
    - the F_P actor's inactivity timeout (`actor_process.ts:910, 1067`);
    - the actor's startup timeout (`actor_process.ts:1100`);
    - the C2 command limit, re-exported and consumed at `implementation/worksite_command_execution.ts:611, 623` and read per C call at `hog/ccall_lifecycle.ts:472`.
  - `calculus/liveness.ts:102` refuses any recorded binding whose `startupMs` or `inactivityMs` differs from `timeoutMs`, so the equality is enforced on history.
  - A measured case and a ruling: one run waited 83.5 s for its first response, and the startup timeout is unreachable for real agents (plan README:384 and :239).
  - The env census (`census/out/env.json`) misses these keys, together with `ABG_TS_FP_TERMINATION_GRACE_MS` (`actor_process.ts:1071`) and `ABG_TS_CLAUDE_COMMAND` (`:929`), because they are read through `positiveInteger(process.env, "…")` and `environment.…`.
- Retire:
  - One owner for F_P actor limits, with separate startup and inactivity values, beside the liveness policy constructor.
  - C2 keeps its own limits under its own name in `implementation/worksite_command_execution.ts`.
  - `liveness.ts:102` accepts the new binding shape only under a new profile and keeps the equality check for historical bindings.
- Size: M. Two owners, the liveness check and the env census.
- Risk: replay digests of recorded Runs. The `liveness.ts:102` check must keep accepting the recorded equal-value bindings. The watchdog policy digest of new bindings changes.
- Change class: design_reframe. If the owner wants a different default rather than separate knobs, it is a requirement_reprice of TRANSPORT-027 and 028.
- Confidence: verified for the shared knob and the enforced equality. Investigate whether a CLI status row arrives before the first model response; if it does, the startup exposure is smaller than the plan says.

### Decode worker stdout once and stop copying stdout and stderr into transport.json
- Category: performance
- Evidence (structural, by reading, unless stated):
  1. **Each actor invocation decodes the whole stdout at least twice:**
     - incrementally in the actor's observer (`actor_process.ts:1294`), through `classifyStdoutChunk` in the P profile (`:1344-1352`) and per chunk in the L profile (`:1522`);
     - again in one pass at the end, through `observeStructuredOutput(processObservation.resultBearingStdout)` (`worker_transport.ts:806-819`, defined at `:456-460`);
     - a third time when governed context is active (`verifyGovernedContextCorrespondence`, `governed_context.ts:533-594`).
  2. **The transport body copies the stream bytes.** It includes `stdout: processObservation.stdout, stderr: processObservation.stderr` (`worker_transport.ts:879-880`) and is serialized with `canonicalJson` (`:890`). The same bytes already sit in `-stdout.log` and `-stderr.log`, with their digests in `artifacts`. That doubles disk use and adds one canonical serialization of the full output per invocation.
  3. **The finish path re-reads and re-hashes.** It reads both stream files back and hashes them (`:855-856`), then reads `transport.json` back and hashes it (`:904-905`). Each is a write-verify that scales with output size.
  4. **The observer copies the tail per line.** `pending = pending.slice(newline + 1)` runs per line (`worker_transport.ts:422`). This is quadratic in the length of one chunk only if V8 copies on slice. Inferred: V8's sliced strings probably make it linear, so measure before changing it.
  5. **The non-Claude branch is written twice.** `observeWorkerTransportOutput` (`:724-729`) duplicates the inline branch at `:811-819`.
  - **Live reader of the copies:** `worksite_construction_recovery.ts:299` requires `transport.stdout` and `transport.stderr` to equal the archive files, and the transport digest is admitted in events.
  - **Measured context:** the RC6/RC7 operational review (`.ai-workspace/comments/claude/20261106T024745Z_REVIEW_RC6_RC7_OPERATIONAL/README.md`) measured `actor_process_stdout_observed` at 15.5% of the log. That predates stdout windowing, so it is historical for stdout and is no measurement of the costs above.
- Retire:
  - `executeWorkerTransport` takes the final observation from one observer that has consumed every row, instead of decoding a second time.
  - Newly written transport artifacts carry stream digests and byte lengths but not the stream text, behind a profile boundary.
  - The recovery verifier at `worksite_construction_recovery.ts:296-302` accepts both shapes: the old one with text equality for historical archives, the new one with digest and length.
  - The plain branch calls `observeWorkerTransportOutput`.
- Size: M, about 30 lines changed, plus the profile gate and recovery's two-shape check.
- Risk: replay digests of recorded Runs. Historical transport artifacts keep their bytes and digests, and the recovery reader must keep the old-shape check. New artifact digests differ by design.
- Change class: design_reframe
- Confidence: verified for the second decode, the embedded copy, the re-reads and the duplicate branch. Their cost share is not measured; measure output size against finish time on a recorded large run.

### Decide GC03 governed context: activate it or retire it from the package
- Category: failed or superseded feature (unfinished)
- Evidence:
  - The header of `governed_context.ts` (987 lines) reads "Private native Construction governed lookup (RC3 Increment B)… No Public operation, event schema, store…".
  - It is selected only by `Program.policies["abg.governed_context"]` (`governed_context.ts:812, 882`; `actor_process.ts:949`). By `git grep`, no source or shipped Program sets it; only test support does.
  - The governed block in `actor_process.ts:937-1049` is about 110 lines. Besides the activation path it carries `governedStdout` capture (`:1346, 1528`) and the correspondence gate.
  - Packaging: the manifest copies `host_adapter.py` (199 lines) and writes `contracts/governed-context/selection.json` (`scripts/generate-product-manifest.mjs:465-482`). The client (`governed_context_client.ts`) is a build member. These appear in `test_env/qualification/recipe/expected-output-inventory.json`.
  - Test weight: `test_env/tests/t287-governed-context.test.mjs` (1,035 lines) and support (129 lines).
  - `query_artifacts` always answers null (`actor_process.ts:1031`).
  - The cold-verify pair is test-only (see the leads). `decodeGovernedContextTranscript` and `DecodedTranscript` (`governed_context.ts:605-607`) are none tier with no test hit, used only by that pair.
  - GOALS says "Cold recovery, repeatability, GC03 and whole-Product qualification and release acceptance remain open" (`specification/GOALS.md:309`). The bounded GC03 Construction ended `runtime_failed` at its provider turn limit (`:319-323`).
- Retire: this is an owner decision with two outcomes.
  - **Activate:** a selected Program declares the policy, `query_artifacts` gets an owner or leaves the adapter protocol, and the cold-verify pair gets a runtime caller.
  - **Retire:** remove `governed_context.ts`, the client, the adapter and selection packaging, the governed block in `actor_process.ts` and its test. That is about 1,350 source lines and 1,160 test lines.
- Size: L
- Risk: manifest or digest pins and qualification mirrors.
  - The adapter, client and selection are packaged and inventoried, so retirement changes the package inventory and the qualification recipe.
  - It does not touch recorded Runs. No accepted Run carries governed-context evidence, but that is inferred from GOALS, not from scanning stores.
- Change class: design_reframe. PRODUCT.md and `specification/requirements/` never name governed context or GC03 (`git grep`), and the module header says it adds no Public operation. GC03 is a design-level increment.
- Confidence: verified that nothing selects it at runtime. Investigate whether any retained store holds a governed-context transcript before choosing retirement.

### Close the witness gap: four Public witness members are implemented but unbound
- Category: design and specification
- Evidence:
  - **The specification requires six members.** REQ-P-PUBLIC-CONTRACTS:220 and the capability row at `shared/capability_contracts.ts:88` require `reprice, attest, hygiene-stamp, intake, run-resumed, run-stopped`.
  - **Two are bound.** `witness_definition_bindings.ts:378-382` binds only `reprice` and `run-stopped` ("Only the two selected, already-declared members; no wildcard witness grant").
  - **The Public contract advertises the four unbound members.** The generated refusal schema (`T/contracts/schemas/operations/witness/admit/refusal.schema.json`) defines `attest` and the others. The owner source set registers the binding export as `WITNESS_DEFINITION_BINDINGS` over the full contract root (`public/binding/owner_contract_source_set.ts:202-206`).
  - **I did not establish what an approved Public call to an unbound member returns,** whether a typed refusal or an exception. `witness-reprice-definition-binding.test.mjs:87-89` rejects them with the same approval-scope error it gives the bound `run-stopped`, so it does not show this.
  - **The native code handles all six:**
    - `witness-reprice-definition-binding.test.mjs:193-213` drives all six through the native `admitWitnessedAct`.
    - The native preparation for the four lives in `witness_admission_operation.ts:727-1111`.
  - **Matching evidence from the event log:** the RC6/RC7 review found `workspace_hygiene_stamped`, `run_resumed`, `replay_log_attested` and `defect_intake_admitted` never admitted.
  - **The witness module has residue:**
    - The refusal code `provenance_invalid` (`witness_admission_operation.ts:134`) is never produced. Packet coordinate failures, including `exactCoordinateSet(admitted.provenance)`, return `content_invalid` (`:486-502`). The mapping `provenance_invalid -> provenance_mismatch` (`witness_definition_bindings.ts:177`) is therefore unreachable, although `provenance_mismatch` is in the generated Public refusal schema (`T/contracts/schemas/operations/witness/admit/refusal.schema.json`).
    - The `WitnessAdmissionPort` interface (`witness_operation_contracts.ts:163`) is none tier with no test hit.
    - The `WitnessAdmissionPort` const and a second `WITNESS_OPERATION_CONTRACTS` map of functions (`witness_admission_operation.ts:1217-1230`) have no importer. The barrel exports the other map (`abg/index.ts:559`), and the one test that imports the module namespace uses only `WITNESS_CONTENT_CONTRACTS`. The duplicate also shadows the name of the live declaration map.
    - `WORKSPACE_HYGIENE_CLASSIFICATION_VALUES` (`:205`) is none tier with no test hit.
  - **Second owner:** the hygiene digest-pair rule (missing / untracked / clean / foreign_write) is computed at `witness_admission_operation.ts:897-906` and again in the admission check at `event_store.ts:3231-3239`.
  - **Stale design:** `design/ABI5_REALIZATION_CONSTITUTION.md:3050` names `WitnessAdmissionPort.admit` as the binding for all six members.
  - Compiler-unused `packet` at `witness_admission_operation.ts:677`, listed in the compiler-unused entry.
- Retire:
  - The owner decides between two paths:
    - bind the four members through `WITNESS_DEFINITION_BINDINGS`, which is realization;
    - reserve them for 5.1 in REQ-P-PUBLIC-CONTRACTS and the capability row, which is requirement_reprice.
  - On either path:
    - delete the dead interface, const and duplicate map (about 20 lines);
    - make one pure hygiene classifier typed by `WORKSPACE_HYGIENE_CLASSIFICATION_VALUES`, called from both sites;
    - either produce `provenance_invalid` from the provenance coordinate check or remove the mapping and the Public code;
    - correct the constitution row.
- Size: L, for the decision. The residue alone is S.
- Risk: Public contract. Removing `provenance_mismatch` or reserving members changes generated schemas and the capability projection. The hygiene consolidation must give identical results on recorded hygiene rows, which is a check of the replay digests of recorded Runs.
- Change class: requirement_reprice (reserve) or realization_refactor (bind). The residue is realization_refactor.
- Confidence: verified

### Agent profiles the actor runtime cannot dispatch
- Category: failed or superseded feature (unfinished)
- Evidence (by reading):
  - `transport_contracts.ts` declares `codex`, `gemini` and `generic` contracts, their model-selection grammar and their argument tables (`:87, 193, 306-308, 459-500`).
  - The only runtime constructor call is `constructKnownWorkerTransportContract("claude", …)` at `actor_process.ts:1050`. Only `ABG_TS_CLAUDE_COMMAND` (`:929`) can replace the command.
  - `validator/qualification_contracts.ts:127-133` declares a Codex `gpt-6-astra` peer assessor profile with `transportAgentKey: "codex"`, and a family relation where a different family "permits_remaining_conditions". The runtime has no path that dispatches that profile.
  - The non-Claude contracts are exercised only by tests (`test_env/tests/m5-worker-transport.test.mjs` and four others).
  - This matches the plan's ranked issue 3, "Assessment is not independent while one model family serves every role" (README:385).
- Retire: an owner decision.
  - **Wire it:** select the transport contract from the worker binding's declared agent key, which is the path to independent assessment.
  - **Retire it:** remove the three unused contracts and grammar rows and narrow `QUALIFICATION_ROLE_POLICY` to the profiles the runtime dispatches.
- Size: M, about 120 lines either way.
- Risk:
  - Qualification mirrors: the role policy is qualification law, and narrowing it changes what independence qualification can claim.
  - Manifest or digest pins, if the contracts are in the packaged contract inventory. I did not check that.
- Change class: design_reframe (wire it) or requirement_reprice (retire it and record same-family assessment as the 5.0 limit).
- Confidence: verified that only "claude" is constructed at runtime. Investigate whether a qualification run ever selected the Codex profile through another route.

### Choose the carrier for A5-F17: the semantic lifecycle modules or the default library
- Category: design and specification
- Evidence:
  - PRODUCT A5-F17 requires a "Specification-driven downstream lifecycle".
  - PRODUCT "Default Governance And Lifecycle Library" (`specification/PRODUCT.md:1117-1170`) says the default library publishes "reusable GraphFunctions for induction, specification, design, testing, framed review and UAT".
  - Separately, the D1/D2 lifecycle is realized as published GTL modules plus ABG projections: semantic stage, job and revision (2,125 lines in this area), `worksite_command_forward` (317), `requirement_handoff` (outside this area) and their providers in `product/builtin_semantics.ts`. The design notes are `T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md`, `T287_D2_…` and `T287_C2_FORWARD_REENTRY_DESIGN.md`.
  - The default library uses none of those modules except `invocationRootAtPrefix`.
  - GOALS:886 says "final semantic consumption and native forward execution remain unqualified" and that F17/S06 is mandatory.
  - `specification/` never names these modules; `git grep` gives 0 files.
  - Tests: semantic_stage in 40 files, semantic_job in 27, semantic_revision in 22, forward in 9.
  - `invocationRootAtPrefix`, a generic invocation-root projection, lives in `semantic_job.ts:69`, and the default library imports it from there.
- Retire: none until the owner states which carrier realizes F17.
  - If the default library does, the semantic modules and forward become a second lifecycle carrier, retired with their providers and tests.
  - If they do, the default library's specification and design functions must compose them.
  - On either path, move `invocationRootAtPrefix` to the invocation owner.
- Size: L. No lines are claimed until the decision.
- Risk: manifest or digest pins (the manifest publishes these modules), Public contract (catalog contents), and replay digests of recorded Runs (D1/D2 Runs bind these publications).
- Change class: product_reprice
- Confidence: investigate. Settle it from the owner's F17 statement and the T-287 readiness section.

### Retire the L-profile writer branches once L stores must reprice before appending
- Category: failed or superseded feature (compatibility path)
- Evidence (by reading): `actor_process.ts` branches on `currentProfile` or `ROOT_EVENT_CONTRACT_DIGEST`:
  - `:1084, 1095, 1266, 1300, 1434, 1451, 1456, 1464, 1500, 1506, 1558, 1648`;
  - the per-chunk legacy stdout path at `:1509-1544`.

  Related code:
  - `worker_transport.ts:801-803` keeps the "legacy transports" exception contract.
  - `transport_contracts.ts:78-82` reads both artifact shapes, through `RETIRED_ACTOR_LIFECYCLE_COPY_KEYS`.

  These branches are live by design: an L store can take appends until the witness reprice moves it across the L-to-P boundary (`witness_definition_bindings.ts:335-338`).
- Retire: a requirement that an L store reprice to P before any new F_P dispatch. The writer branches then go. The readers (`transport_contracts.ts:78-82` and the verifiers) stay for history.
- Size: L, for the decision. About 60 writer lines.
- Risk: replay digests of recorded Runs. Readers of L artifacts must stay. An L Run continued after the change would need the reprice first.
- Change class: requirement_reprice
- Confidence: likely. Settle it by listing the retained L stores the owner still means to continue.

### Remove package-only wrappers whose only consumers are tests
- Category: dead code (with test debt)
- Evidence (census plus `git grep` over `code/src`, `test_env` and `scripts`):
  - `projectWorksiteCommandForwardSource` (`worksite_command_forward.ts:79`): package tier, no test or source consumer.
  - `projectNativeWorkReacquisitionTask` (`native_work_reacquisition.ts:105`): package tier. Its only consumer is `test_env/tests/t287-native-work-reacquisition.test.mjs:393-426`; the runtime goes through `prepareGovernanceNativeWorkReacquisition` to the same `deriveNativeWorkReacquisitionTask`.
  - `resolveQualificationExecutionEvidence` (`qualification_proof.ts:933`): a one-line projection of `resolveQualificationExecutionMaterial`. Only `t287-qualification-contraction.test.mjs:34-37` uses it.
  - `runWorkerTransport` (`worker_transport.ts:1124`): used only by `m5-worker-transport.test.mjs` and a fixture.
  - `observeWorkerTransportOutput` (`:724`): tests only, and it duplicates the inline branch.
  - Retain `observeWorkerTransportCopyWork` (`:970`). It is the copy-count proof surface for "references, not copies".
  - Precedent: closure C-17 removed "five `./abg` producer exports with no caller outside".
- Retire: delete the first two (about 16 lines). Point the tests of the next three at the runtime entry, then delete or inline them. `observeWorkerTransportOutput` becomes the one owner of the plain branch from the performance entry rather than a test-only export.
- Size: S
- Risk: Public contract, in the weak sense. `package.json` exports `./abg`, so this changes the package API. No ABG Public operation changes.
- Change class: realization_refactor
- Confidence: verified

### Compiler-unused locals and parameters in this area
- Category: dead code
- Evidence (`census/out/compiler-unused.json`, confirmed by reading):
  - `semantic_revision.ts:44`: unused import `runtimeEventsFromValidatedPrefix`.
  - `semantic_stage.ts:82`: unused parameter `events` of `projectSemanticPredecessorAtPrefix`. It is carried through two overloads and passed by 16 call sites in `semantic_job.ts`, `semantic_revision.ts`, `semantic_stage.ts` and `test_env/tests/t287-generic-job-parent-foldback.test.mjs`.
  - `witness_admission_operation.ts:677`: `packet` in `publicOperationCandidate`.
  - `worksite_revision.ts:337`: `work` in `invalidatedAcrossBindings`.
- Retire: drop the four, and the `events` parameter from both overloads and all 16 call sites.
- Size: S, about 25 lines touched.
- Risk: none. These are signature-only changes.
- Change class: realization_refactor
- Confidence: verified

### Remove the never-produced runtime failure stage `c_call_open`
- Category: dead code
- Evidence: `runtime_failure.ts:61` is in the `stage` union of `RuntimeFailureAdmission`.
  - No source produces it. The literal producers are `route` (`hog/recursion_lifecycle.ts:300, 887`), `hog_traversal` (`hog/traversal_failure.ts:78`, `hog/workflow_lifecycle.ts:200`), and `implementation_load` / `output_contract` / `operation_application` (`owner_bindings/run_invocation.ts:1691-1697`).
  - No schema or validator lists the stages (`git grep` over `code/src` and `contracts`), and no test names it.
  - `git log -S'stage: "c_call_open"'` shows its producer was deleted with the rejected HoG service reducer (`ded0ab19a`, 2026-08-16).
- Retire: drop the union member.
- Size: S, 1 line.
- Risk: none for bytes. Inferred: Runs recorded before 2026-08-16 may carry the stage. No reader switches on it, but any future typed reader of historical payloads must accept it.
- Change class: realization_refactor
- Confidence: verified for current code; inferred for history.

### Small schema and helper duplicates
- Category: second owner
- Evidence (clone census, then reading):
  - `ActorProcessRequest` (`actor_process.ts:94-107`) and `ProbabilisticWorkerRequest` (`implementation/contracts.ts:63-76`) declare the same worker request field by field.
  - `ActorProcessObservation` (`actor_process.ts:108-150`) and the C-call transport evidence fields (`c_call.ts:572-595`) repeat one field list.
  - `hasExactDataFields` is written three times: `witness_admission_operation.ts:282`, `validator/conformance_operation.ts:84` and `probabilistic_result.ts:146`.
  - The run-scope event envelope is built inline at `runtime_failure.ts:314-330` and `c_call.ts:5382, 5402`.
  - The overload block of `projectObservedWorksiteCommandChildAtPrefix` repeats its full return type three times (`worksite_input_provenance.ts:367-416`).
  - The local `record`, `hash`, `exactOrNull` and `same` consts are re-declared in nearly every file of the area. PRODUCT assigns that kind of pure-helper contraction to 5.1 realization compression, so it is listed only for completeness.
- Retire:
  - one request type, with `ActorProcessRequest` as an alias of `ProbabilisticWorkerRequest`;
  - one observation field type, which the C-call evidence extends;
  - one `hasExactDataFields` in `shared/admit`;
  - one named return type for the overloads.
- Size: S, about 60 lines.
- Risk: none. These are type-level and pure-helper changes.
- Change class: realization_refactor
- Confidence: verified

### Per-chunk stderr rows each recount the process's stream rows and admit a probe
- Category: performance
- Evidence (structural, by reading):
  - In the P profile, each stderr chunk appends one `actor_process_stderr_observed` row and one runtime activity probe (`actor_process.ts:1545-1566`).
  - Each chunk also recomputes its ordinal with `nextNativeProcessStreamOrdinal(selectRuntimeEventPrefixFromStore(store), processRef)`. That function filters every stream row of the process (`runtime_liveness.ts:375-378`), so cost is quadratic in one process's row count.
  - Stdout is windowed (30 s, §10.10); stderr is not.
  - Measured context: probe rows were 35.4% of the log in the RC6/RC7 review (85,005 rows, 359.7 MB). That predates windowing, and the current share is unmeasured.
  - Refuted lead, by reading and for the durable-log path only: `nativeContext()` per probe (`actor_process.ts:1297`) does not re-fold. On the in-memory path, `selectRuntimeEventPrefixFromStore` calls `store.readAll()` (`event_prefix.ts:78`), and I did not check whether the cache key survives a fresh prefix object. `livenessReconstruction` (`calculus/liveness.ts:572-578`) is a per-prefix computation that forks from its base and advances incrementally.
- Retire: window stderr under the same window owner as stdout, or carry the ordinal from the last admitted row. The log stays the source, because the ordinal is read back from the row admitted last.
- Size: S, or M if stderr gets windows.
- Risk: replay digests of recorded Runs, if windowing changes the rows written. That needs a profile boundary. The ordinal change alone writes identical rows.
- Change class: realization_refactor (ordinal) or design_reframe (windowing)
- Confidence: likely. The cost depends on stderr volume, which is unmeasured.

## Named checks

1. **Dead declarations.** Each `none` and `package` row is confirmed or refuted, grouped by feature:
   - **Witness residue (confirmed dead):** `WitnessAdmissionPort` interface, `WORKSPACE_HYGIENE_CLASSIFICATION_VALUES`, and the runtime-tier but unimported const and map at `witness_admission_operation.ts:1217-1230`.
   - **Governed context cold path (unwired, not dead):** `reacquireOwnedContextLookupCold` and `coldVerifyGovernedContext` have a design reference and a test. `decodeGovernedContextTranscript` and `DecodedTranscript` serve only them.
   - **`witnessRepriceResourcesCorrespond`:** refuted as dead. It is a test hook (`witness-reprice-definition-binding.test.mjs`).
   - **Package-only wrappers:** see their entry.
   - **`observeWorkerTransportCopyWork`:** refuted. It is a proof surface.
2. **Compiler-unused.** Four sites, in one entry.
3. **Kinds never produced or never read.**
   - `c_call_open`: residue of the rejected HoG service reducer.
   - `provenance_invalid`: an unfinished witness refusal, wired to a Public code that is never produced.
   - `selected_prefix`: the `attest` scope, residue of an unbound witness member.
   - `query_artifacts` and `resolve_artifact`: external input from the GC03 adapter, with `query_artifacts` stubbed.
   - `api_retry`, `stream_event`, `thinking_tokens`, `tool_use`, `tool_result` and `status`: external input from Claude stream-json.
   - The kinds never read in this area are refusal and diagnostic codes, which are normal output.
4. **Second owners.**
   - The classifier's inputs and the salvage rule.
   - The hygiene digest-pair rule (`witness_admission_operation.ts:897` and `event_store.ts:3231`).
   - The F_P and C2 timeout knob.
   - The duplicated request and observation types, `hasExactDataFields`, and the run-scope envelope.
5. **Failed, unfinished or superseded features.**
   - GC03 governed context.
   - The four unbound witness members.
   - The non-Claude agent profiles, including the Codex peer assessor.
   - The open F17 carrier question.
   - The L-profile writer branches.
   - No module in this area is named after a milestone. The `m5-worker-transport` test is the only milestone-named consumer.
6. **Structure.** Only where it blocks consolidation:
   - `invokeActorProcessWithAssembly` (`actor_process.ts:832-1712`, about 880 lines) holds:
     - governed-context activation (937-1049);
     - qualification eligibility;
     - transport plan;
     - liveness binding;
     - probes;
     - stdout windows;
     - the terminal writes.

     Each consolidation above (the classifier, timeouts, GC03, L branches) edits it. Splitting it by those responsibilities should follow the decisions, not precede them.
   - `prepareSemanticEvent` (`witness_admission_operation.ts:727-1111`, about 385 lines) holds four members' preparation and splits naturally per member once the witness decision is made.
   - `transport_contracts.ts` holds agent contracts, the model grammar, the classifier, artifact readers and archive helpers. The classifier and the artifact readers would separate cleanly from the agent tables.
7. **Performance.**
   - Two to three full stdout decodes per invocation.
   - Stdout and stderr copied into `transport.json`.
   - Write-verify re-reads.
   - Per-chunk stderr rows with an ordinal recount.
   - Process spawning: one CLI process per F_P attempt (`worker_transport.ts:504`), nothing more in the worker path. GC03, when active, spawns one Python per host page request and re-hashes the Python executable and the adapter on every start (`governed_context.ts:445-459`). That cost scales with pages read, and it is conditional on activation.
   - All are structural. The only measurement cited is the historical RC6/RC7 log share, which predates windowing.
   - Refuted: the per-probe liveness context is incremental. `runtimeEventBodiesAtPrefix` in the semantic modules is a lazy view (`event_prefix.ts:196-200`), not an eager decode.
8. **Coverage.** See the table.

## Coverage

| File | Lines | How read | Findings |
|---|---:|---|---|
| `abg/actor_process.ts` | 1,712 | full | classifier inputs, timeouts, GC03 block, L branches, stderr probes, request type duplicate |
| `abg/worker_transport.ts` | 1,129 | full | double decode, transport.json copies, re-reads, test-only wrappers |
| `abg/transport_contracts.ts` | 609 | full | classifier owner, `transport_exception` outside the set, unused agent profiles |
| `abg/governed_context.ts` | 987 | full | GC03 unactivated, cold path unwired, `query_artifacts` stub |
| `abg/governed_context_client.ts` | 58 | outline and census | packaged with GC03 |
| `abg/native_work_reacquisition.ts` | 417 | outline, lines 100-118 | test-only wrapper |
| `abg/native_work_effect.ts` | 178 | outline, line 50 | `transport_exception` reader |
| `abg/native_worksite_execution.ts` | 284 | outline | none |
| `abg/worksite_revision.ts` | 865 | outline, line 337 | compiler-unused `work` |
| `abg/worksite_input_provenance.ts` | 626 | outline, lines 367-416 | repeated overload return type |
| `abg/worksite_construction_recovery.ts` | 456 | outline, lines 224-343 | live reader of `transport.json` stdout and stderr; intentional retention |
| `abg/worksite_command_forward.ts` | 317 | outline, lines 76-90 | dead `projectWorksiteCommandForwardSource`; F17 carrier question |
| `abg/semantic_revision.ts` | 1,060 | outline and census | compiler-unused import; F17 carrier question |
| `abg/semantic_job.ts` | 666 | outline and census | misplaced `invocationRootAtPrefix`; F17 carrier question |
| `abg/semantic_stage.ts` | 399 | lines 1-145, outline | unused `events` parameter; F17 carrier question |
| `abg/witness_admission_operation.ts` | 1,230 | parts: 125-215, 278-300, 385-504, 677, 727-1111 (selectively), 892-915, 1113-1230 | witness gap, dead exports, hygiene second owner, `provenance_invalid` |
| `abg/witness_definition_bindings.ts` | 384 | full | two of six members bound; unreachable mapping |
| `abg/witness_operation_contracts.ts` | 172 | full | dead interface |
| `abg/qualification_proof.ts` | 1,149 | outline, lines 925-945 | test-only wrapper; otherwise live |
| `abg/runtime_failure.ts` | 360 | lines 40-150, 230-340 | `c_call_open` dead; run-scope envelope clone |

Not checked:

- I did not scan retained event stores, so the statements about what recorded Runs carry are inferred where marked.
- I did not check whether the non-Claude contracts are in the packaged contract inventory.
- I did not measure stdout decode cost, finish cost or the current probe share.
