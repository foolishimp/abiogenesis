# Area findings: product-run

Commentary, not law. Independent read-only reviewer (Claude Opus 5.5) for the Executive, 2026-11-12. These are candidate entries for the second edition of `.ai-workspace/TECHNICAL_DEBT_REGISTER.md`.

The area is 38 files under `T/code/src/product/` (T = `build_tenants/abiogenesis/typescript`). They cover invocation, run operations, worksite operations, semantic work, project reads, results and the product side of the default library. All paths below are relative to `T/code/src/` unless they start with `T/`, `test_env/` or `design/` (both of the latter are under T), or with `specification/` (at the repository root).

## Method and limits

- I read the census outputs in `census/out/`: declarations, compiler-unused, kinds, clones and design. I did not rerun them. I wrote a per-file outline of every declaration in the area (line, size, tier, users, test files) to a scratch file and used it to decide what to read.
- I read files in full where the census or the outline gave a signal. Elsewhere I read targeted ranges or the outline only. The coverage table at the end records which, per file.
- I used `grep` across `code/src`, `test_env/tests`, `test_env/support`, `test_env/qualification`, `test_env/falsifiers`, `test_env/uat/*.mjs` and `scripts`. I did not search the archived run trees under `test_env/test_runs` and `test_env/uat/runs`, which are too large to search.
- I ran no tests, no builds, no provider or model calls and no network. Every negative test proposed below is unrun.
- Several findings reach outside the area: `abg/invocation_admission.ts`, `abg/continuation.ts`, `abg/instruction_assembly.ts`, `product/environment.ts`, `product/catalog.ts`, `implementation/leaf_execution_authority.ts`, `public/binding/*` and `gtl/*`. Each such site is marked "(outside area)". I read only the ranges named there.
- "Inferred" marks a claim I did not establish by reading or running.

## Answers to the leads

**A. Interaction respond has no binding.** Confirmed. Five Public members are declared and published: `interaction respond` with kinds select, approve, reject, assess and answer_escalation. No installed callable exists for any of them, and the transport refuses each call as `installed_binding_unavailable`. A compile-time proof requires this refusal on purpose. The ABG response admission functions behind the operation have no runtime caller. See entry 1.

**B. How work reaches the worksite.** The table below lists each mechanism. "Module" means a module publication in the product manifest (`T/scripts/generate-product-manifest.mjs:1203-1214`). Every module there is installed, so every program in it can be started through Public `run start`. None of these mechanisms is unreachable. Two candidates are unused by any shipped composition (entries 5 and 12).

| Mechanism | Purpose | What invokes it | Superseded? | Used by default library |
|---|---|---|---|---|
| C0 file replace and file parents (`worksite_operations.ts:591` `replaceWorksiteFile`, `createWorksiteFileParents`; `implementation/worksite_file_replace.ts:62,539`) | Deterministic (F_D) replacement of one file under prepared authority | The semantic job plan step (`gtl/semantic_stage_publication.ts`, jobPlan into file-parents input); tests `t287-c0-correction-regressions`, `t287-generic-job-*` | No | No |
| C1 worksite construction (`worksite_construction.ts`, `worksite_construction_identity.ts`, `worksite_construction_recovery.ts`) | The closed construction protocol: an F_P author constructs bounded file content | The construction program in the worksite construction module; tests | No. `design/T287_NATIVE_WORKSPACE_WORK_DESIGN.md:35-36` keeps it: "C1 remains available when its closed construction protocol is selected. It is not compulsory on this path." | No |
| C3 branch construction (`worksite_branch_construction.ts`, `worksite_preparation.ts`) | Branch-scoped construction feeding C2 preparation | Embedded in the worksite construction module; support `serial-branch-worksite-program.mjs` | Not superseded, but its design note (`T287_W2_R3_C3`, 2026-09-23) still reads "proposed … pending independent" review | No |
| C2 command execution (`worksite_command_execution.ts`) | Runs declared commands in the worksite and records outcomes | Default library testing purpose; qualification dispatch (`program://abiogenesis/worksite/command-execution@5`); semantic construction | No | Yes (testing) |
| C2 forward re-entry (`worksite_command_forward.ts`) | Re-enters after a command result (C2 forward design, 2026-09-11) | The worksite command forward module; tests `forward-command-*` | No | No (inferred from `gtl/default_library.ts` imports) |
| Worksite revision (`worksite_revision.ts`) | Revision coordinates for C2 revision and semantic revision | C2 `revision-command-execution` program (`starts: []`, supervised, `gtl/worksite_command_execution.ts:257`); semantic revision | No | No |
| Native workspace work (`native_workspace_work.ts`) | A native agent works in the worksite under declared write roots | Default library purpose wrappers; semantic stage | No | Yes (induction, specification, design, construction) |
| Native workspace assessment (`native_workspace_assessment.ts`) | Read-only native assessment of produced work | Default library review, uat and parent sufficiency; semantic stage assessor | No | Yes |
| Result assessment (`result_assessment_operation.ts`, `result_definition_bindings.ts`) | Public `result.assess`: an external caller admits an assessment of an F_P result as an `assessed` event | Public call only; test `t287-required-operation-bindings.test.mjs:149-212` | No, a different purpose from native assessment. One open question, entry 11 | No |
| Semantic job, stage and revision (`semantic_job.ts`, `semantic_stage.ts`, `semantic_revision.ts`) | Product semantic lifecycle: job intake, stage author and assessor, revision | Semantic stage and semantic revision modules; `d1`/`d2` tests and `d5` fixtures | Not superseded in code. Whether any shipped composition uses them is an owner question, entry 12 | No |
| Requirement handoff (`requirement_handoff.ts`) | Deterministic handoff of requirement terms into a semantic job | Requirement handoff module; semantic job intake; tests `t287-d1-requirement-handoff`, `t287-d1-semantic-stage` | No | No program call. Imports `groundBoundSourceQuote` (`default_library_fulfillment.ts:11`) |

**C. A graph_function start target skips `resolveProgramStart`.** Confirmed in Product and, independently, in ABG admission. The program's root-mode policy is never checked for that target kind, and nothing downstream reads root mode. See entry 2.

**D. Run invocation declarations and contract schema.**
- `populateProductRunInvocation` and its intent and population types (`run_invocation_operation.ts:839-1077`, package tier) are not dead. `public/installed_public_definition_call.ts:528` `constructInstalledStartCall` uses them as an SDK helper, and 32 test files use that helper. They repeat the preparation sequence, though: entry 9.
- `observeRunPreparationSubjects` (`:590`, tier none) is an observation-only probe read by `test_env/support/owned-call-reference.mjs`: entry 13.
- `RunInvocationPort` and `RunContinuationPort` (`run_operation_contracts.ts:331,336`) are implemented by nothing: entry 6.
- `run_operation_contracts.ts` does not repeat a schema another owner defines. It imports `ABG_TYPED_TERMINAL_RESULT_SCHEMA` and the shared atoms. It does list the target-kind domain twice by hand: `publicTargetSchema` (`:31-36`) and `closedDomains.targetKind` (`:116`). It also defaults `rootMode` to `"supervised"` (`:111,163`), which feeds entry 2.

**E. Project reads.**
- Every product project read that is bound is reachable from the CLI, because `public/cli.ts` is a generic transport, and each has test callers.
- The default library calls none of them (inferred from imports).
- `ticket_consensus` is tested only on its not-issued refusal path (`test_env/tests/t287-w2-05-install-catalog-owner-chain.test.mjs:1144-1215`): entry 14.
- Dead project-read residue is in entry 6. The read envelope has a second owner: entry 7. Catalog reads cost a deep compare on every call: entry 8.

**F. Compiler-unused and preparation-contract `none` tiers.** The two compiler-unused sites are entry 10. The `none`-tier declarations in `worksite_preparation_contracts.ts:78-119` are refuted as dead. They are compile-time agreement checks: `Assert<Equal<…>>` types that tsc evaluates to prove that the contract-node descriptions equal the TypeScript input types (read, lines 74-122). Deleting them would remove a check.

## Candidate entries

The entries are ordered by value.

### 1. Retire the interaction-respond Public members and the ABG response admission no runtime path reaches
- Category: failed or superseded feature
- Evidence:
  - The packets are declared in `product/interaction_operation_contracts.ts:24-142`, read in full. Five members (`INTERACTION_RESPONSE_KINDS`) each carry metadata `effectClass: "fh_response_event"`, `sdkCoordinate: "sdk.interaction.respond"` and `cliCoordinate: "interaction respond <kind>"`. The packet table is `INTERACTION_OPERATION_CONTRACTS` at `:134`.
  - The owner-source row names `INTERACTION_DEFINITION_BINDINGS` (`public/binding/owner_contract_source_set.ts:186-190`, outside area, read). No declaration of that name exists (census; `grep`).
  - The members carry the type `OwnerUnavailableDefinitionBinding { kind: "installed_binding_unavailable" }`, commented "A declared member without an installed callable; transport refuses it." The transport refuses such calls with "manifest-bound installed definition export is unavailable" (`public/installed_definition_call_transport.ts:240-298`, outside area, read).
  - `test_env/types/framework-handoff.compile.ts:103-129` proves, at compile time, that exactly nine members are unavailable: the five interaction.respond members and four witness.admit members.
  - Other surfaces still list the operation: the capability rows `shared/capability_contracts.ts:87-88`, `shared/public_invocation.ts:191`, and the invocation operation list in `product/invocation.ts:941-946`.
  - The ABG response path is reachable only through the package export (census). That covers `prepareFhInteractionResponse` (`abg/continuation.ts:1469`, 94 lines, 1 test file), `commitFhInteractionResponseAtExpectedPrefix` (`:1564`, 75 lines, 0 test files), `deriveFhResumeSuccessorInput` (`:1640`), `deriveFhResumeSuccessorInputAtPrefix` (`:1658`) and `admitFhInteractionHold` (`:1693`), all exported at `abg/index.ts:302,306` (outside area).
  - `abg/fh_continuation_projection.ts:82,117,628,831-837,987-1028` reads interaction.respond events that no runtime path produces (outside area, read at those lines).
  - `specification/PRODUCT.md:93-94,373,415` reserves native human response and response-driven resumption for 5.1.
- Retire: The ABG prepare, commit and derive functions with no runtime caller. If the owner rules the members out of 5.0, also retire the five interaction packets, the capability rows, the operation-list entry, the owner-source row and the projection branches that read response events. If the owner keeps the declared-unavailable members as the truthful 5.0 disposition (the compile proof and the 56-member check suggest that was deliberate), retire only the unreached ABG code. Then record the retention under "intentional retention" so the next walk-through does not raise it again. Either way, the result-assessment packet that shares the file (`:144-261`) stays.
- Size: L, about 150 lines of packets and rows plus about 300 lines of ABG response admission and projection.
- Risk: Public contract, and manifest or digest pins. `owner_contract_source_set.ts` checks `operationCount !== 18 || OWNER_CONTRACT_SOURCES.length !== 56` and digests the owner contract key set. Removing members changes generated contracts and the manifest. Inferred: no recorded Run carries an interaction.respond event, because nothing at runtime produces one. This has not been checked against archived evidence.
- Change class: requirement_reprice to remove the members from the Public family. Removing only the unreached ABG code is a realization_refactor.
- Confidence: verified for "declared, refused, unreached". Settle the disposition with the owner: either declared-unavailable is the 5.0 contract, or the members belong to 5.1.

### 2. Make `resolveProgramStart` the only owner of start law; the graph_function target bypasses root-mode policy in Product and ABG
- Category: second owner
- Evidence:
  - `product/execution_resolution.ts:561-569` (read): a `start` selection carrying `graphFunctionHandle` only looks the handle up in the CatalogView. Only the other start selections reach `resolveProgramStart` (`:570`).
  - `abg/invocation_admission.ts:1290-1360` (outside area, read earlier in this review): for a graph_function target, admission builds the public start identity from the request's `rootMode` without calling `resolveProgramStart`.
  - `gtl/public_start.ts:41-80` (read) is the law. A supervised start requires `until: converged`, request `rootMode: supervised`, a startRef equal to the target, and program policy `abg.root_mode: supervised`. A direct start requires `rootMode: direct`, no startRef, and program policy direct.
  - The Public start request defaults `rootMode` to `"supervised"` (`product/run_operation_contracts.ts:111,163`, read), while every published program except two declares `abg.root_mode: "direct"` (`grep`: `gtl/default_library.ts:318`, `gtl/native_workspace_work.ts:40`, `gtl/worksite_c0.ts:199`, and others). The two supervised programs are `gtl/consensus.ts:4910` and `gtl/worksite_command_execution.ts:257`.
  - Nothing in `abg`, `hog` or `gtl` reads root mode after admission (`grep "root_mode\|rootMode"`). The only reader is the projection at `abg/instruction_assembly.ts:443`.
  - Consequence, inferred from reading and not run: a graph_function start of a direct program without an explicit `rootMode` is admitted and records `rootMode: supervised`, contradicting the program's policy. A supervised program (Consensus, C2 revision) can be started through a graph_function target in direct mode. Its supervised constraints are skipped.
  - Structure: `resolveProductExecution` (`execution_resolution.ts:440`) is 709 lines. The start-law branch is buried in it, which is why the second owner went unnoticed.
- Retire: Route every start target, graph_function included, through `gtl/public_start.ts` `resolveProgramStart`, or through one named Product function that calls it. Do this in both `execution_resolution.ts` and `abg/invocation_admission.ts`, and delete the two local branches. If the owner rules graph_function targets exempt from root mode, refuse a `rootMode` on that target instead of recording it.
- Size: M, about 40 lines removed across two owners plus negative tests.
- Risk: Public contract. A request that is admitted today would be refused. The bytes of recorded Runs that took this path stay as admitted history. Replay reads recorded admission fields and does not re-run admission (inferred, as in entry 3).
- Change class: design_reframe. It becomes a requirement_reprice if the owner decides the graph_function target is exempt.
- Confidence: likely. Settle with two negative tests: a graph_function start of `revision-command-execution` with `rootMode: direct`, and a graph_function start of a direct program with the default `rootMode`. Both should refuse under `resolveProgramStart` law.

### 3. Retire the legacy root-public run request family
- Category: failed or superseded feature
- Evidence:
  - `product/invocation.ts:1234-1322` (read) holds `constructDirectInvocation` and `constructStartInvocation` (package tier). Both check `rawRequest.contractRef !== "contract://abiogenesis/public/run-invoke-request@5"`.
  - Their replacements, `constructExactDirectInvocation` and `constructExactStartInvocation` (`:1324-1432`), say they do "not manufacture or translate a legacy Public request carrier".
  - The ABG side is `abg/invocation_admission.ts:150` (`family: "legacy_root_public"`), the branches at `:1037-1040,1241-1253,1588-1593`, and `admitInvocation` at `:1733-1744` (package tier, 5 test files). The runtime calls only `admitExactInvocation` (`:1751`) (outside area, read).
  - Only tests produce the legacy request: `test_env/tests/t287-c2-child-program.test.mjs`, `t287-post-binding-worksite-write.test.mjs`, `r5-invocation-admission.test.mjs` and `test_env/support/root-installed-environment.mjs` (`grep`).
  - Historical evidence carrying the legacy request: `test_env/proof/abi5-root-r10.events.jsonl`, `test_env/evidence/abi5-root-r1.json`, `abi5-root-r2.json`.
- Retire: Delete the two legacy constructors, `admitInvocation`, the `legacy_root_public` family variant and its three branches. Move the four test-side producers to the exact constructors. Keep the `publicRequestAdmissionRef` and `publicRequestDigest` event fields and their schema rows (`abg/event_store.ts:387,397`). Keep the historical evidence files.
- Size: M, about 150 lines in source plus four test files.
- Risk: none for recorded Runs' replay (inferred). Replay reads `publicRequestAdmissionRef` from the event (`abg/invocation_execution_truth.ts:372`), and I found nothing that re-runs admission on replay. The SDK package export loses two constructors.
- Change class: realization_refactor.
- Confidence: verified for "superseded, tests-only producers". Settle the replay claim by confirming that no replay or qualification reader calls `admitInvocation`.

### 4. One strict owner for the workspace-binding and admitted-implementation-row checks; the copies have diverged and the weaker one guards live callers
- Category: second owner
- Evidence (all read):
  - The workspace-binding identity rule is a body of nine fields, a canonical digest and the identity `workspace-binding://abiogenesis/<hex>`. It is constructed in `product/environment.ts:1109-1178` (outside area), which also owns the type `WorkspaceBinding` at `:146`, and is checked strictly in `environment.ts:1199-1288`.
  - The rule is copied as `isExactWorkspaceBinding` in `worksite_command_execution.ts:835-870` and `worksite_construction.ts:201-264`. Those copies are textually identical and strict: `isRecord`, exact top-level keys, `admitJson` before digesting.
  - It is copied again, weaker, as the exported `exactWorkspaceBinding` in `worksite_effect.ts:445-487`. That copy checks no `isRecord`, no exact top-level keys and no `admitJson`. Inferred: it accepts a binding with extra fields. This weaker copy guards `native_workspace_work.ts:33`, `semantic_revision.ts:73` and `worksite_effect.ts:493,1253`.
  - `exactWorkspaceAuthorityJoin` is copied at `worksite_command_execution.ts:872`, `worksite_construction.ts:266` and `worksite_effect.ts:489`.
  - `isExactDirectGrant` is copied at `worksite_command_execution.ts:884` and `worksite_construction.ts:278`.
  - The clone census reports the same family: `environment.ts:1270` against both, and `worksite_construction.ts:224/247` against `worksite_effect.ts:449/472`.
  - The admitted implementation resolution row is constructed in `abg/execution_basis.ts:1927` (outside area). Its check is copied in `implementation/leaf_execution_authority.ts:56-175` (outside area; field table plus `admitJson`) and `worksite_effect.ts:610-695` (inline keys, no `admitJson`). The clone census pairs these at 30, 26 and 14 lines.
- Retire: Export one strict `isExactWorkspaceBinding` and `exactWorkspaceAuthorityJoin` from `product/environment.ts`, which owns the type and the identity. Export one strict admitted-row check from `abg/execution_basis.ts`, the constructor. Delete the four local copies. Move `isExactDirectGrant` to the run-invocation grant owner. The consolidated form must be the strictest existing copy, because the brief forbids weakening a check.
- Size: M, about 250 lines removed across four files.
- Risk: none. The checks write no bytes. Adopting the strict form may refuse a value that `worksite_effect.ts` accepts today. That tightens a check; it does not weaken one.
- Change class: realization_refactor.
- Confidence: verified for the copies and their differences. That the weaker copy admits extra fields is inferred; a test passing a binding with one extra key to `native_workspace_work` input admission would settle it.

### 5. Retire the native registered-selection task route that the default library replaced with framed synthesis, and correct the design row that still names it
- Category: failed or superseded feature; also design and specification
- Evidence:
  - The route is `product/registered_selection_native.ts`, all 74 lines, read in full; it was added 2026-09-28 in commit `3359b36aa` "Add native registered selection with declared profile scope". It is consumed only by `abg/instruction_assembly.ts:35-36,298-345,547-565` (outside area, read at those lines), which takes it when the input contract's `valueKind` is `registered_selection_task` (`:320`).
  - Nothing in source, scripts or generated contracts produces or declares that value kind (census `kinds-never-produced`; `grep`).
  - The only producers are tests and support: `t287-native-registered-selection`, `t287-recursive-registered-selection`, `t287-native-selection-profile-scope` and `test_env/support/stdo3-run-environment.mjs:45`.
  - The shipped selector, the default library executive-step `select` node with role `selector` (`gtl/default_library.ts:283`), declares `framed_synthesis_task` (`:306`). It is served by `abg/default_library.ts:254` and `abg/instruction_assembly.ts:389`.
  - `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:629` still names "S3 `registered_selection_task`/raw binder" as the Executive's actual invocation. Line 665 of the same note gives `framed_synthesis_task` as the application contract.
- Retire: If the owner confirms that `registered_selection_task` is not a supported authoring surface for consumer graphs, delete `registered_selection_native.ts`, its exports at `product/index.ts:3-5` and the `instruction_assembly` branches. Retire the three tests or move them to framed synthesis. In either case, correct the design row at `:629`.
- Size: M, about 74 lines in the area plus about 80 in `instruction_assembly` and three tests.
- Risk: replay digests of recorded Runs, if any recorded Run used this route. Native result admission at `instruction_assembly.ts:547-565` would no longer recognize such a Run. Inferred that only test runs did; the archived run trees were not searched.
- Change class: design_reframe. It becomes a product_reprice if registered-selection tasks were meant to stay a consumer capability.
- Confidence: likely. Settle with the owner's ruling on the consumer surface and a search of qualification evidence for `registered_selection_task`.

### 6. Delete the function-map `*_CONTRACTS` exports and unimplemented `*Port` interfaces left from the pre-packet owner tables
- Category: dead code
- Evidence (all read; tiers from the census):
  - `project_read_ports.ts:896-903`: `PRODUCT_PROJECT_READ_CONTRACTS`, a map of functions. Nothing uses it and no test names it. The census tiers it `runtime` only because its name matches a named root.
  - The real packet table of that name is `project_read_operation_contracts.ts:288`, which the barrel exports as `PRODUCT_PROJECT_READ_SOURCE_DECLARATIONS` (`product/index.ts:534`).
  - `workspace_operations.ts:679-686`: a function-map `WORKSPACE_OPERATION_CONTRACTS` over the `WorkspaceOperationPort` const, exported by `product/index.ts:260-283`. The const itself is live: `workspace_definition_bindings.ts:224,284` call it (`grep`). The packet table also named `WORKSPACE_OPERATION_CONTRACTS` (`workspace_operation_contracts.ts:157`, used by `workspace_definition_bindings.ts:18-327`) is exported as `WORKSPACE_OPERATION_SOURCE_DECLARATIONS` (`index.ts:529`). One name therefore means two different things. The interface `WorkspaceOperationPort` at `workspace_operation_contracts.ts:162` collides with the live const.
  - `result_assessment_operation.ts:756-762`: a `ResultAssessmentPort` const whose only user is the function-map `RESULT_OPERATION_CONTRACTS` beside it (`:761`), which has no user (`grep -w`). The map shadows the packet table of the same name at `interaction_operation_contracts.ts:261`, which `result_definition_bindings.ts:61` uses.
  - The five projection Port consts at `project_read_ports.ts:875-894` are live: `project_read_definition_bindings.ts:535,615,715,815,972` call them. Only the map at `:896` is dead.
  - These `*Port` interfaces over `ExactOwnerOperationPort` (`shared/public_function_contracts.ts:515`) have no implementer: `run_operation_contracts.ts:331,336`, `interaction_operation_contracts.ts:263,270`, `project_read_operation_contracts.ts:297-314` (five, tier none) and `workspace_operation_contracts.ts:162`.
  - `project_read_ports.ts:162` `ProjectReadPacket` is tier none with 0 test files. `project_read_definition_bindings.ts:78` declares its own `ProjectReadPacket`. The read-case union is written twice: `project_read_ports.ts:48` and `project_read_operation_contracts.ts:21`.
  - The same pattern exists outside the area: `product/environment_operations.ts:56-64` `PRODUCT_ENVIRONMENT_CONTRACTS`, and the barrel aliases for verification, install and catalog near `product/index.ts:529-534`.
- Retire: Make the packet tables and `*_DEFINITION_BINDINGS` the only owners of these names. Delete the function maps, the `ResultAssessmentPort` const (used only by its dead map), the unimplemented `*Port` interfaces and the duplicate case union and packet alias. Keep the live `WorkspaceOperationPort` const and projection Port consts, and give the colliding interface a distinct name or delete it. Export each packet table under one name. The feature they belonged to is the earlier "owner contract = table of owner functions" surface that the packet tables and definition bindings replaced. Keep `ExactOwnerOperationPort` only if something still implements it.
- Size: M, about 70 lines in the area. A cross-area sweep of the same pattern is needed.
- Risk: Public contract. The package barrel exports `WORKSPACE_OPERATION_CONTRACTS` and `WorkspaceOperationPort`, so an SDK consumer could import them. The packet `exportName` metadata names the packet tables, so they must keep their module-level names.
- Change class: realization_refactor.
- Confidence: verified for the sites in this area. Settle the cross-area sites in their own area reviews.

### 7. Build the project.read request and result envelope in one place
- Category: second owner
- Evidence: `product/project_read_operation_contracts.ts:129-209` `productReadContract` (read) and `abg/project_read_operation_contracts.ts:294` `abgReadContract` (outside area, read) build the same envelope: request, result, refusal and metadata shape around a per-case selector and payload. The clone census pairs `abg/…:314` with `product/…:145` (18 lines).
- Retire: Move one envelope builder into `shared/public_function_contracts.ts`, beside `ownerContractPacket`, and have both read-contract owners supply only their case tables.
- Size: S to M, about 60 lines.
- Risk: manifest or digest pins. Generated contract bytes must stay byte-equal, so the shared builder must produce the same canonical packets.
- Change class: realization_refactor.
- Confidence: likely. Settle by diffing the generated contracts before and after.

### 8. Catalog project reads deep-compare an identical catalog on every call
- Category: performance (structural)
- Evidence (all read):
  - `product/project_read_definition_bindings.ts:278-310` `reconstructCatalogSelection` re-admits the Catalog through `CatalogOperationPort.admit` and compares it with `sameJson(reconstructed, readyCandidate)`. It does the same for the view (`:308`).
  - The admission is cached by `readinessBasis` identity (`product/catalog.ts:446-449` `readyCatalogs`, outside area), so when the packet carries the admitted catalog, `reconstructed` is the same object.
  - `sameJson` (`public/binding/definition_binding_mechanics.ts:47-52`, outside area) has no identity guard. It runs `admitJson` over both sides (`shared/admit/json.ts:332`, which walks every root-to-leaf path) and then `canonicalEquals`, which serializes the left side in full and streams the right (`shared/value/equality.ts:16-26`). So each `catalog_list` and `catalog_describe` call walks the whole catalog four times even on a cache hit.
  - The same helper compares locks and installs per install at `:253,342-343` and selectors at `:689,946-947`.
  - Contrast `execution_resolution.ts:450-491`, which checks identity first (`reconstructedCatalog !== input.catalog`) and pays the deep compare only on a miss.
- Retire: Add the identity fast path to `sameJson`, or at these call sites, before the deep compare. If a copy defeats the identity, which happens when the transport clones the packet, pass the owner-established catalog by reference instead.
- Size: S, a few lines.
- Risk: none. Equality semantics do not change.
- Change class: realization_refactor.
- Confidence: likely (structural, unmeasured). Settle with the `catalogWork` and `executionResolutionWork` counters and one timing of a catalog read on a full installed catalog.

### 9. The SDK start helper runs the run-preparation sequence twice; give it one owner
- Category: second owner; also performance (structural)
- Evidence (read in full):
  - `product/run_invocation_operation.ts:916-1077` `populateProductRunInvocation` repeats the sequence in `prepareProductRunInvocation` (`:606-835`). The sequence: select start, `ProductExecutionResolutionPort.resolve`, check view and input, `admitInstalledProductInput`, build policy, construct grants and authority, check expected authority slots.
  - `public/installed_public_definition_call.ts:528` `constructInstalledStartCall` (outside area) calls population to build the call. The installed binding then calls `prepareProductRunInvocation` on that call.
  - So an SDK start resolves execution twice. That means two `resolveProductExecution` calls (709 lines each, including the per-install O(n²) canonical comparisons at `execution_resolution.ts:492-517`) and two input admissions.
- Retire: Make `prepareProductRunInvocation` the one owner of the sequence. Population returns the request fields only and leaves resolution to the binding, or it returns the prepared result for the binding to reuse by identity.
- Size: M, about 120 lines.
- Risk: none for recorded Runs. SDK-built calls must stay byte-equal.
- Change class: realization_refactor.
- Confidence: likely. Settle by counting `resolveProductExecution` calls for one `constructInstalledStartCall` plus binding call. The O(n²) install comparison is low priority because n is the number of installed products.

### 10. Compiler-unused declarations in product-run
- Category: dead code
- Evidence: census `compiler-unused.json`. The first is `product/result_assessment_operation.ts:34`: "'T' is declared but its value is never read", in `type RefDigest<T = unknown>`. Line 57 and others pass `RefDigest<RuntimeResult>`, so the parameter is a phantom type that documents the referent. The second is `product/worksite_operations.ts:17`: the `sha256Canonical` import is unused.
- Retire: Remove the unused import. For `RefDigest<T>`, either remove the parameter and every type argument, or keep it as a documented phantom type and suppress the warning. Do not delete `T` alone.
- Size: S, a few lines.
- Risk: none.
- Change class: realization_refactor.
- Confidence: verified.

### 11. Decide what admitting a result assessment should change; its fluent is initiated and read by nothing
- Category: failed or superseded feature (investigate)
- Evidence:
  - Public `result.assess` is bound (`result_definition_bindings.ts`, `assessOwner` at `:178`) and appends an `assessed` event (`result_assessment_operation.ts:676-727`, read in part).
  - `abg/calculus/liveness.ts:262` counts `assessed` as evaluator progress (outside area).
  - `abg/calculus/axioms.ts:1121-1128` initiates the fluent `result_assessment_admitted`, which no source reads (`grep`; one test names it, `t287-runtime-activity-quiescence`).
  - No shipped graph calls `result.assess`; the default library assesses through native workspace assessment.
  - The contract design note `T287_M04_RESULT_ASSESSMENT` (2026-04-30) is mentioned by no source or test (census `design.json`).
- Retire: Undecided. If `result.assess` is the external admission path for an F_P result, name the consumer of `result_assessment_admitted` (closure, run status) or drop the fluent. If native assessment superseded it, retire the operation through a requirement_reprice.
- Size: M if retired, about 1,100 lines across the operation, the bindings and the packet, plus tests. S if only the fluent is settled.
- Risk: Public contract, and replay digests of recorded Runs that contain `assessed` events. Those events stay.
- Change class: requirement_reprice if retired; realization_refactor for the fluent alone.
- Confidence: investigate. Settle with the owner's statement of what an admitted external assessment changes.

### 12. Decide which worksite and semantic capabilities 5.0 ships for use, since no shipped composition uses them
- Category: design and specification (investigate)
- Evidence: the table under lead B.
  - The default library uses only native workspace work, native workspace assessment and C2.
  - Semantic job, stage and revision, requirement handoff, C0, C1, C3, forward re-entry and revision are installed, startable and tested, but no shipped program composes them, except semantic stage and revision composing each other with native work and C2.
  - Design keeps C1 on purpose. The C3 note is still marked pending review.
  - The UAT "invokes one native default-library composition" (`test_env/uat/README.md:85`).
- Retire: Nothing yet. This is an owner question, not a finding of dead code. For each capability, the owner should say whether it is a supported building block for consumer graphs or residue of the pre-default-library staged lifecycle. Residue then gets its own retire entry.
- Size: L if any capability is retired. These are the largest files in the area: `worksite_command_execution.ts` 2,498 lines, `worksite_effect.ts` 2,041, `semantic_job.ts` 1,041.
- Risk: Public contract and manifest pins. Every module is in the product manifest.
- Change class: product_reprice.
- Confidence: investigate.

### 13. Observation-only work probes inside production modules (cross-area family)
- Category: test debt
- Evidence:
  - `run_invocation_operation.ts:580-604` keeps the last preparation subjects in a `WeakRef` for `observeRunPreparationSubjects` (`:590`, tier none). `execution_resolution.ts:428-438` keeps counters for `observeExecutionResolutionWork` (`:431`, tier none, `@internal`). Both are read only by `test_env/support/owned-call-reference.mjs`.
  - `product/catalog.ts:438-444` `observeCatalogWork` is the same pattern (outside area).
  - The pattern is documented as "§10.11 observation-only" and spans `product/semantics.ts`, `install_product.ts`, `abg/environment_admission.ts`, `event_store.ts`, `worker_transport.ts`, `calculus/execution_basis_record.ts` and `public/binding/*` (grep, not read).
- Retire: Not in this area alone. Name one owner for observation-only counters, such as a single instrumentation module the tests read, or confirm that §10.11 requires them in place. Then record the decision under intentional retention.
- Size: M across areas, about 30 lines here.
- Risk: none. They select and change nothing, as their comments state.
- Change class: realization_refactor.
- Confidence: investigate. It depends on the §10.11 requirement text, which I did not read.

### 14. The `ticket_consensus` project read has no positive test
- Category: test debt
- Evidence: `project_read_definition_bindings.ts:868` binding (128 lines, read in part). Three test files name it, and the only exercised path is the not-issued refusal (`test_env/tests/t287-w2-05-install-catalog-owner-chain.test.mjs:1144-1215`). The Product reserves Consensus F08/S05 qualification for 5.1 and preserves the Consensus code.
- Retire: Nothing to delete. Add one positive read over an issued ticket, or record the 5.1 reservation as intentional retention for this read.
- Size: S.
- Risk: none.
- Change class: realization_refactor.
- Confidence: verified for the coverage gap.

## Named checks

1. **Dead declarations.**
   - Confirmed dead, grouped by feature:
     - The legacy root-public request family (entry 3): `invocation.ts:1234,1279`.
     - The pre-packet owner function tables and Port declarations (entry 6): `project_read_ports.ts:162,896`; `project_read_operation_contracts.ts:297-314`; `run_operation_contracts.ts:331,336`; `interaction_operation_contracts.ts:263,270`; `workspace_operation_contracts.ts:162`; `workspace_operations.ts:679-686` (map only); `result_assessment_operation.ts:756-762`. The `WorkspaceOperationPort` const and the projection Port consts are live (refuted by `grep`).
     - The native registered-selection task route (entry 5), likely dead: `registered_selection_native.ts`.
   - Refuted:
     - `worksite_preparation_contracts.ts:78-119` and `interaction_operation_contracts.ts:154-159` (`Assert`, `SameShape`, `_TypedResidualSchemaIsNative`) are compile-time agreement checks.
     - `populateProductRunInvocation` and its types (`run_invocation_operation.ts:839-916`) are an SDK helper used by `public/installed_public_definition_call.ts:528`.
     - These are SDK input constructors exported by the package barrel and used by tests and fixtures: `constructRequirementHandoffInput` (`requirement_handoff.ts:78`, 8 files), `constructWorksiteBranchCommandPreparationInput` (`worksite_preparation.ts:112`, support `serial-branch-worksite-program.mjs`), `constructSemanticStageEnvelope` (`semantic_stage.ts:355`), `constructSemanticJobInput` (`semantic_job.ts:96`).
     - `governanceFulfillmentAssessmentJsonSchema` (`default_library_fulfillment.ts:158`) is a consumer helper for authoring the assessment output schema (`test_env/support/default-library-fulfillment.mjs:9`).
     - `nativeWorkspaceAssessmentBasisDigest` (`native_workspace_work.ts:69`) is a package export used by `t287-native-workspace-work.test.mjs`.
     - `DEFAULT_LIBRARY_POLICY` (`default_library.ts:32`) is used by `gtl/default_library.ts` and `T/scripts/generate-product-manifest.mjs`.
     - `observeRunPreparationSubjects` and `observeExecutionResolutionWork` are observation probes (entry 13).
2. **Compiler-unused.** Two sites, one entry: entry 10.
3. **Kinds.**
   - Handled but never produced:
     - `product_project_read_resource_assertion` (`project_read_definition_bindings.ts:89,125`) is external input. The caller of the Public read supplies it.
     - `registered_selection_task` (`registered_selection_native.ts:12,29`; `abg/instruction_assembly.ts:320`) is residue of the native registered-selection feature (entry 5).
   - Produced but never read in source:
     - Residue of the unbound interaction feature (entry 1): `fh_response_event`, `fh_interaction_projection`, `missing_interaction`, `resolved_interaction`, `choice_mismatch` in `interaction_operation_contracts.ts`.
     - External output vocabulary, not dead: `result_assessment_event` and the effect classes `abg_traversal`, `abg_continuation`, `workspace_admission`, `workspace_filesystem` and `pure_projection` are Public metadata that generated contracts and callers read.
     - The remaining codes are refusal and gap codes, and recorded rule names, written into outputs for callers and replay. They are external output, not dead branches. The refusal and gap codes are in `worksite_effect.ts`, `workspace_operation_contracts.ts`, `default_library_fulfillment.ts`, `requirement_handoff.ts`, `project_read_*` and `result_definition_bindings.ts`. The rule names are in `semantic_job.ts`, about 30 of them, such as `exact_unique_original_source_substring` and `readiness_is_not_fulfillment`. I did not trace each code to a reader.
4. **Second owners.**
   - Start law (entry 2), the workspace-binding and admitted-row checks (entry 4), the read envelope (entry 7) and the run-preparation sequence (entry 9).
   - Low value, no entry: the clones inside `invocation.ts` at 1235/1280 (16 lines) and 1331/1384 (12) disappear with entry 3. The target-kind domain is listed by hand in `run_operation_contracts.ts:31-36,116`, `run_invocation_operation.ts:224-281,839-850` and ABG admission. The pair `materialization_definition_bindings.ts:26` / `result_definition_bindings.ts:20` (22 lines, binding scaffold) was not examined. Neither was the pair `worksite_branch_construction` / `worksite_construction` (10 lines).
   - Closed item respected: TD-01 (`worksite_command_forward.ts` `canonicalEquals`) was not reopened.
   - Not compared: `product/worksite_construction_recovery.ts` (158 lines) and the same-named `abg/worksite_construction_recovery.ts` (456 lines, outside area, which imports from this area). TD-23's retained recovery loop (`:166-173`) is in the ABG file.
5. **Failed, unfinished or superseded features.**
   - Interaction respond (entry 1), the legacy request family (entry 3), the native registered-selection task (entry 5), the result-assessment fluent (entry 11) and the unused capabilities question (entry 12).
   - No module in the area is named after a milestone or ticket. The `T287_M04_RESULT_ASSESSMENT` design note is unmentioned (entry 11).
6. **Structure.**
   - `resolveProductExecution` (709 lines) hides the start-law second owner (entry 2). `prepareProductRunInvocation` (230) and `populateProductRunInvocation` (162) repeat each other (entry 9).
   - `replaceWorksiteFile` (`worksite_operations.ts:591`, 354 lines) and `assessResult` (`result_assessment_operation.ts:491`, 264 lines) are long but block no consolidation I found.
   - `worksite_command_execution.ts` (2,498 lines) and `worksite_effect.ts` (2,041) hold the copied helpers of entry 4. Apart from that, nothing found at outline depth.
7. **Performance.**
   - Catalog reads deep-compare an identical catalog (entry 8, structural). SDK start resolves execution twice (entry 9, structural).
   - Execution resolution's catalog and view re-admission is cheap on the identity fast path. It is cached by basis identity (lookup `catalog.ts:446-449`, insertion `:726-727` for a deeply frozen basis; views `:940-942`), so it is not a finding.
   - Per-install O(n²) canonical comparisons (`execution_resolution.ts:492-517`) are structural and low priority.
   - Nothing measured.
8. **Coverage.** The table below.

## Coverage

"Full" means read end to end. "Partial" means the named ranges were read and the rest outlined. "Outline" means only the per-declaration outline (tiers, users, tests) and targeted `grep` were used; findings are "none at this depth" there.

| File | Lines | How read | Findings |
|---|---|---|---|
| invocation.ts | 1,432 | partial (40-240, 880-1433) | 1, 3 |
| execution_resolution.ts | 1,167 | partial (224-663) | 2, 9, 13 |
| run_invocation_operation.ts | 1,184 | full | 9, 13 |
| run_operation_contracts.ts | 339 | full | 2, 6 |
| interaction_operation_contracts.ts | 272 | full | 1, 6 |
| worksite_command_execution.ts | 2,498 | partial (830-900) plus outline | 4 |
| worksite_effect.ts | 2,041 | partial (440-500, 610-700) plus outline | 4 |
| worksite_operations.ts | 1,219 | partial (1-40) plus outline and caller grep | 10 |
| worksite_construction.ts | 1,162 | partial (196-295) plus outline | 4 |
| worksite_branch_construction.ts | 758 | outline | none at this depth |
| worksite_preparation.ts | 257 | outline | none at this depth (package constructor refuted, check 1) |
| worksite_preparation_contracts.ts | 191 | partial (74-122) | none (agreement checks refuted as dead) |
| worksite_command_forward.ts | 187 | outline | none at this depth (TD-01 closed) |
| worksite_revision.ts | 174 | outline | none at this depth |
| worksite_construction_recovery.ts | 158 | outline | none at this depth |
| worksite_construction_identity.ts | 114 | outline | none at this depth |
| worksite_command_execution_identity.ts | 47 | outline | none at this depth |
| worksite_command_forward_identity.ts | 18 | outline | none at this depth |
| worksite_revision_identity.ts | 15 | outline | none at this depth |
| workspace_operations.ts | 687 | partial (674-687) plus outline | 6 |
| workspace_definition_bindings.ts | 328 | outline plus grep of packet use | none at this depth |
| workspace_operation_contracts.ts | 165 | outline plus grep (`:157,162`) | 6 |
| semantic_job.ts | 1,041 | outline plus kinds census | 12 (question only) |
| semantic_stage.ts | 451 | outline | 12 (question only) |
| semantic_revision.ts | 439 | outline plus grep (`:73`) | 4 (consumer of weaker copy), 12 |
| project_read_definition_bindings.ts | 1,026 | partial (1-500) | 6, 8, 14 |
| project_read_ports.ts | 903 | partial (44-56, 158-172, 296-904) | 6 |
| project_read_operation_contracts.ts | 316 | full | 6, 7 |
| result_assessment_operation.ts | 762 | partial (1-60, 480-500, 756-762) plus grep (645-727) | 6, 10, 11 |
| result_definition_bindings.ts | 312 | outline plus grep (`:61,171`) | 11 |
| native_workspace_work.ts | 311 | outline plus grep (`:9,33,69`) | 4 (consumer of weaker copy) |
| native_workspace_assessment.ts | 161 | outline | none at this depth |
| native_workspace_work_identity.ts | 24 | outline | none |
| default_library.ts | 550 | partial (1-260) | none (lead B input) |
| default_library_fulfillment.ts | 231 | partial (150-175) | none (export refuted, check 1) |
| default_library_identity.ts | 3 | census only | none |
| registered_selection_native.ts | 74 | full | 5 |
| requirement_handoff.ts | 122 | outline plus grep | none at this depth |
