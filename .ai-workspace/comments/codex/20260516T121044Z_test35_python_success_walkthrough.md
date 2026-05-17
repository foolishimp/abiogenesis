# Test35 Python Success Walkthrough

Created: 2026-05-16T12:10:44Z  
Author: Codex  
Status: Commentary, not specification  
Scope: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35`

## Purpose

This post records how the successful `data_mapper.test35` run worked in the installed Python line. It traces both:

- SDLC Python: `.genesis/odd_sdlc/python/code/odd_sdlc/*`
- GTL/ABG Python: `.genesis/gtl/*` and `.genesis/genesis/*`

The important point is that `test35` did not close because a formatting carrier said the work looked right. It closed because the Python runtime repeatedly observed workspace/register truth, constructed the next F_P step, admitted F_P results into ABG events and ledgers, reprojected pressure, and finally admitted execution evidence.

## Anchor Evidence

| Evidence surface | Observed signal | Meaning |
|---|---:|---|
| `.ai-workspace/events/events.jsonl` | 4662 events | The run is event-rich, not a one-shot worker assertion. |
| Event type counts | 3152 `assessed`, 79 `edge_converged`, 79 `proof_passed`, 79 `closure_passed`, 79 `graph_call_closed` | Closure came through repeated assessment and convergence events. |
| `.ai-workspace/fp_ledgers/derive_code_surface_20260419T121644750776Z.json` | `expected_count: 77`, `fulfilled_count: 77`, `missing_count: 0`, `edge_converged: true` | Code surface converged against requirement-derived obligations. |
| `.ai-workspace/fp_ledgers/derive_test_execution_result_surface_20260418T225115194587Z.json` | `expected_count: 1`, `fulfilled_count: 1`, `edge_converged: true` | Execution-result surface converged through admitted evidence. |
| `build_tenants/scala_spark/test_env/50-generated-run-archive.md:22` | `sbt test` passed | Runtime execution happened, not just test design generation. |
| `build_tenants/scala_spark/test_env/50-generated-run-archive.md:26-34` | 77/77 requirements with execution evidence, 80/80 test cases passed, 181/181 ScalaTest methods passed | Completion was execution-backed. |
| `build_tenants/scala_spark/release/60-generated-release-surface.md:127-129` | `construction_complete`; no blocking gaps remain | Release closure summarized the admitted design, code, test, and execution evidence. |

## End-To-End Walkthrough

| Step | Stateful reality read or written | SDLC Python surface | GTL/ABG Python surface | Durable proof surface | Why it mattered |
|---:|---|---|---|---|---|
| 1 | Workspace readiness, runtime contexts, ambiguity register, requirement closure register, workspace state | `odd_sdlc.analysis.refresh_analysis`, especially `.genesis/odd_sdlc/python/code/odd_sdlc/analysis.py:245-297` | ABG event and projection surfaces are later consumed from the same workspace root | `.ai-workspace/runtime/*`, `.ai-workspace/analysis/*` | This made the mutable workspace an explicit observed reality before selecting work. |
| 2 | Current gap state plus declared obligation-ledger gaps | `odd_sdlc.app.gaps` and `gap_snapshot`, `.genesis/odd_sdlc/python/code/odd_sdlc/app.py:224-312` | ABG/GTL gap projection plus declared obligation ledgers | Published gap snapshots and canonical gap payloads | Gap truth was composed from graph state and obligation ledgers; it was not only graph topology. |
| 3 | Graph/current edge selection | `odd_sdlc.app.start` is invoked by operational dispatch; `operational_dispatch._current_operational_dispatch_step` starts at `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:152-181` | ABG traversal emits `vector_started`, `run_started`, `graph_call_opened`, and related events through `genesis.interpret` | Event stream has 86 `run_started`, 86 `run_bound`, 86 `graph_call_opened`, 82 `vector_started` | The system kept selecting the next lawful vector from current projected truth. |
| 4 | F_P manifest for the selected edge | SDLC calls `construct_manifest(...)` inside operational dispatch, `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:164-165` and `196-197` | GTL declarations include obligation-ledger contracts through `.genesis/gtl/obligation_ledger.py:47-84` and `95-232` | `.ai-workspace/fp_manifests/*` | The worker brief was tied to declared obligations, target asset, policy, provenance, and manifest identity. |
| 5 | Worker/content result | SDLC constructor result is passed into ABG result ingest; see `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:196-207` and `248-263` | `genesis.result_ingest.ingest_fp_result` validates result shape and identity, `.genesis/genesis/result_ingest.py:731-766` | `.ai-workspace/fp_results/*` | F_P produced content, but ABG owned admission into the event and ledger spine. |
| 6 | Per-obligation fulfillment ledger | SDLC delegates the result to ABG; it does not decide ledger convergence itself | `genesis.result_ingest._build_published_fulfillment_ledger`, `.genesis/genesis/result_ingest.py:325-518` | `.ai-workspace/fp_ledgers/*` | The ledger computed expected, fulfilled, missing, extra, carry convergence, fulfillment convergence, admission, and edge convergence. |
| 7 | Assessed events | SDLC calls `ingest_fp_result(...)` | ABG writes `assessed{kind: fp}` through `genesis.result_ingest`, `.genesis/genesis/result_ingest.py:859-907`; event writing goes through `genesis.events.emit`, `.genesis/genesis/events.py:311-379` | 3152 `assessed` events | Each admitted obligation assessment became event-spine truth. |
| 8 | Edge convergence from ledger truth | SDLC observes the next gap/start state after refresh | `genesis.interpret._project_fulfillment_edge_converged`, `.genesis/genesis/interpret.py:96-130`; `genesis.fulfillment_ledger.resolve_published_fulfillment_ledger`, `.genesis/genesis/fulfillment_ledger.py:177-248` | 79 `edge_converged` events | F_P-managed edges converged only after the published fulfillment ledger had `edge_converged: true`. |
| 9 | Re-entry after each admitted result | SDLC calls `refresh_analysis(...)`, then `start(...)` again; see `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:175-176`, `207-210`, `264-267` | ABG event stream is append-only and projection-derived; `.genesis/genesis/events.py:1-10`, `139-144`, `146-231` | Updated runtime registers, event stream, gap snapshots | The loop behavior came from re-observing admitted truth after each mutation, not from assuming completion. |
| 10 | Projection-only followups | `odd_sdlc.operational_dispatch._current_operational_dispatch_step` drains `_PROJECTION_ONLY_EDGES`, `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:38-42` and `160-176` | ABG result ingest still emits assessed events and ledgers for those projection steps | F_P ledgers and events for projection-only edges | Deterministic/projection edges were advanced without waiting for a human operator to manually poke each step. |
| 11 | Build/test/deploy operational lane | `dispatch_operational` maps prepare edges to result edges, `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:23-37`; it executes declared shell contracts at `108-149` and ingests the result at `242-263` | ABG admits the operational result as a normal F_P result plus ledger/evidence events | Operational dispatch register, stdout/stderr logs, execution-result ledger | Execution was a first-class phase in the same observe -> construct -> admit -> project cycle. |
| 12 | Test execution evidence | SDLC local lane ran the declared test command and created the run archive | ABG result ingest and fulfillment ledgers admitted the execution result | `build_tenants/scala_spark/test_env/50-generated-run-archive.md:22-38` and `.ai-workspace/fp_ledgers/derive_test_execution_result_surface_20260418T225115194587Z.json` | Closure included actual `sbt test` evidence: 181/181 ScalaTest methods passed. |
| 13 | Constitutional/homeostatic repair | `homeostatic_loop.apply_constitutional_proposal` writes proposal application and refreshes analysis, `.genesis/odd_sdlc/python/code/odd_sdlc/homeostatic_loop.py:77-106`; `loopback_homeostatic_gap` reopens, retires, or carries gap pressure, `118-209` | ABG event spine records proposal/gap events as runtime truth | Runtime events plus updated gap snapshots | Repair was re-observed as state. A fix either retired the gap or carried pressure forward. |
| 14 | Release closure | SDLC release surface reads the accumulated design, code, test, and execution evidence | ABG ledgers/events carry the closure facts consumed by downstream surfaces | `build_tenants/scala_spark/release/60-generated-release-surface.md:127-129` | The final statement had execution-backed evidence, not only agent assertion. |

## Python Loop Grains

| Loop grain | Python carrier | What it did in test35 | ABG/GTL participation | Why this matters for ABG TS |
|---|---|---|---|---|
| Lane loop | `odd_sdlc.operational_dispatch.dispatch_operational`, `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:184-276` | Prepared an operational lane, ran the declared local command, ingested the result, refreshed projections, then captured final gaps | ABG result ingest and ledgers admitted the lane result as event truth | This is an overlay-shaped loop over a lane. It should become declarative selection/re-entry, not app-local imperative authority. |
| Deterministic/projection drain | `odd_sdlc.operational_dispatch._current_operational_dispatch_step`, `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:152-181` | While the current edge was projection-only, constructed and ingested it, refreshed analysis, and selected again | ABG accepted each result through the same event/ledger path | This is per-vector regime behavior: F_D/projection-only work should auto-advance under ABG, not through SDLC controller loops. |
| Homeostatic repair loop | `odd_sdlc.homeostatic_loop`, `.genesis/odd_sdlc/python/code/odd_sdlc/homeostatic_loop.py:77-209` | Applied a proposal, refreshed analysis, reopened the edge, then emitted either `gap_retired` or `gap_event` | ABG event spine made proposal and gap events durable | This is a register-observation/re-entry pattern. The state lives in registers/events; the scheduling rule should be declarative. |
| Event admission loop | `genesis.events.EventStream` and `emit`, `.genesis/genesis/events.py:1-10`, `139-144`, `146-231`, `311-379` | Made events append-only and system-timed; callers could not directly mutate projected truth | GTL/ABG runtime consumed event truth for replay/projection | The event spine is the one source of runtime truth. Controller state is only a consumer. |
| Fulfillment closure loop | `genesis.result_ingest`, `genesis.fulfillment_ledger`, `genesis.interpret` | Converted F_P results into ledgers, assessed events, proof/closure lifecycle, and `edge_converged` | GTL obligation declarations supplied the expected obligation set | This is the core test35 behavior: pressure clears only when declared obligations are fulfilled and admitted. |

## Critical Code Responsibilities

| Responsibility | Owner in Python test35 | Concrete surface |
|---|---|---|
| Declare fulfillment obligation shape | GTL Python | `.genesis/gtl/obligation_ledger.py:47-84`, `95-232` |
| Normalize and validate F_P result payload | ABG Python | `.genesis/genesis/result_ingest.py:95-157`, `731-766` |
| Build published fulfillment ledger | ABG Python | `.genesis/genesis/result_ingest.py:325-518` |
| Admit assessed events | ABG Python | `.genesis/genesis/result_ingest.py:859-907`; `.genesis/genesis/events.py:311-379` |
| Resolve ledgers for closure | ABG Python | `.genesis/genesis/fulfillment_ledger.py:177-248` |
| Emit edge convergence from fulfilled ledger | ABG Python | `.genesis/genesis/interpret.py:96-130`, `2080-2130` |
| Refresh SDLC workspace/register read models | SDLC Python | `.genesis/odd_sdlc/python/code/odd_sdlc/analysis.py:245-297` |
| Compose gap truth from graph and declared ledgers | SDLC Python | `.genesis/odd_sdlc/python/code/odd_sdlc/app.py:224-312` |
| Run operational command and admit result | SDLC Python + ABG ingest | `.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:108-149`, `242-263` |
| Apply repair and preserve/retire pressure | SDLC Python | `.genesis/odd_sdlc/python/code/odd_sdlc/homeostatic_loop.py:77-209` |

## What Made Test35 Successful

| Success property | Evidence in test35 | Mechanism |
|---|---|---|
| Current evaluated gaps survived across attempts | Multiple ledgers and repeated `derive_code_surface` convergence attempts remained visible in `.ai-workspace/fp_ledgers/*` and the event stream | SDLC repeatedly refreshed analysis and gap snapshots after ABG admission. |
| Obligations were explicit and counted | Final code ledger had 77 expected, 77 fulfilled, 0 missing, 0 extra | GTL obligation declarations plus ABG fulfillment-ledger projection. |
| F_P owned content judgment | Fulfillment details and evidence refs came from F_P assessments | ABG admitted the F_P result but did not replace content judgment with shape-only closure. |
| F_D owned event, schema, identity, and ledger mechanics | `ingest_fp_result` rejected malformed payloads, required `spec_hash`, matched expected obligations, and wrote assessed events | ABG performed mechanical admission and lineage. |
| Execution evidence was required for the execution-result surface | Run archive recorded `sbt test` passed and 181/181 methods passed | Operational lane executed the declared contract, then admitted the result. |
| Release closure used combined evidence | Release surface recorded design, implementation code, testcase authority, and realized execution evidence | Closure was downstream of the evidence spine. |

## Translation Implication For ABG

The Python outer behavior should not be copied as a second SDLC controller loop. Its state was already visible in durable surfaces:

| Python fact | Correct ABG-level interpretation |
|---|---|
| `refresh_analysis(...)` was called after each admission | Projection freshness should be admission-time or replay-derived, not controller-polling authority. |
| `_current_operational_dispatch_step` drained projection-only edges | Per-vector regime resolution should let ABG auto-advance F_D/projection edges under the same runtime loop. |
| `dispatch_operational` kept returning to a lane until result plus followups were admitted | Overlay frames should declare observed state, fire conditions, termination conditions, and foldback. |
| `loopback_homeostatic_gap` carried `gap_event` or emitted `gap_retired` | Residual pressure must be a first-class carrier with an explicit clearing predicate. |
| Published fulfillment ledgers controlled `edge_converged` | Closure must remain F_P evidence/ledger driven, not target-carrier shape driven. |

## Bottom Line

The successful `test35` shape was:

`observe workspace/register/event truth -> select next graph edge -> construct F_P package -> admit result into ABG events -> publish fulfillment ledger -> reproject gaps -> repeat -> run declared execution -> admit execution evidence -> close`

The SDLC Python layer supplied scheduling behavior that the ABG TypeScript substrate must now own declaratively. The behaviors to preserve are not the Python procedures themselves; they are the replayable runtime facts: observed state, selected vector, obligation pressure, F_P fulfillment evidence, execution evidence, and pressure clearing only when those facts justify it.

## Deep Comparison Ledger

This section is append-only. Each entry compares one successful `test35` Python traversal or asset path against the current TypeScript GTL/ABG/SDLC run. The comparison tracks events created, ledgers used, and artifacts consumed or written by both systems.

### Full Edge Map Before Edge-by-Edge Comparison

Evidence basis:

- `test35` edge list is taken from first-observed `.ai-workspace/fp_manifests/*.json` order in `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35`.
- `test72` edge list is taken from `odd-sdlc-ts analyze-run --workspace /Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl --format json` on 2026-05-17.
- `missing` means no observed equivalent has appeared in the current TS run.
- `partial` means the TS run appears to cover part of the function, but not as the same traversal contract.
- `unmapped` means the edge exists on one side without a clean counterpart on the other side.

| # | `test35` Python edge | Python role in successful run | Nearest `test72.TS.cl` edge(s) | Mapping status | Current TS evidence | Comparison implication |
|---:|---|---|---|---|---|---|
| 1 | `derive_intent_surface` | Builds/repairs intent surface as its own F_P traversal. | `Fg_conform_project`, `Fg_conform_project_authority` | partial | Intent files are handled inside bootstrap/conformance authority, not as a standalone observed TS edge. | TS collapses early product-authority surfaces into bootstrap. That is not like-for-like with Python's explicit intent traversal. |
| 2 | `derive_product_surface` | Builds/repairs product definition as its own F_P traversal. | `Fg_conform_project`, `Fg_conform_project_authority` | partial | Product authority is included in bootstrap/conformance package flow. | Same collapse as intent: product meaning is not currently proven by a product-surface traversal. |
| 3 | `derive_goal_surface` | Builds/repairs goal surface as its own F_P traversal. | `Fg_conform_project`, `Fg_conform_project_authority` | partial | Goal authority is included in bootstrap/conformance package flow. | TS may have goal files, but not a same-contract goal traversal with its own fulfillment ledger. |
| 4 | `derive_requirement_surface` | Builds/repairs requirement surface from intent/product/goals/imported sources and requirement gaps. | `Fg_conform_project`, `Fg_conform_project_authority` | partial | Four `Fg_conform_project_authority` archives observed; final one closed with `admitted_with_open_obligations`. Requirement-family files exist before later design edges. | TS currently treats requirements as conformance/bootstrap authority rather than a dedicated requirement-content construction edge. |
| 5 | `derive_feature_decomp_surface` | Builds feature decomposition surface. | `derive_feature_decomp_surface` | mapped | One TS attempt, closed. Analyzer still records worker-status tension: `worker_invoked` despite close. | Same-name edge exists, but the closure/status semantics still need deeper comparison. |
| 6 | `derive_uat_testcases_surface` | Builds UAT testcase surface before later design/code/test work. | none clean; nearest later surfaces are `derive_scenario_surface` and `derive_test_design_surface` | missing | No same-name TS edge observed. | This is a major behavioral gap. Python has an explicit UAT construction step; TS currently has no observed equivalent. |
| 7 | `derive_design_surface` | Builds design surface. | `derive_design_surface` | mapped | Two TS attempts: first repair, second close. | Same-name edge exists, but TS needed retry/repair where Python's comparison must inspect gap cause and closure pressure. |
| 8 | `derive_scenario_surface` | Builds scenario surface. | `derive_scenario_surface` | mapped | One TS attempt, closed. | Same-name edge exists; compare artifact function, not just closure. |
| 9 | `derive_implementation_design_surface` | Builds implementation design surface. | `derive_implementation_design_surface` | mapped | Three TS attempts: block, retry, close. | Same-name edge exists, but retry/block pressure is larger in TS and must be compared to Python's obligation-ledger behavior. |
| 10 | `select_implementation_stack_profile` | Selects implementation stack profile as explicit traversal state. | none clean; implicit in TS product materialization, traversal intent, execution shards, and Scala/SBT tenant selection | missing | No TS edge with this contract observed. | Stack selection is currently embedded in packages/config rather than produced by an explicit graph edge. |
| 11 | `derive_implementation_module_surface` | Builds implementation module surface before code realization. | none clean; nearest TS split is `derive_component_code_surface`, `qualify_component_realization_surface`, `derive_code_surface` | partial | TS materializes component code directly, then qualifies realization, then rolls up `code_surface`. | TS decomposes this area differently. It may be stronger structurally, but the Python module-design traversal is not directly present. |
| 12 | `derive_code_surface` | Builds full code surface against declared obligations. | `derive_component_code_surface`, `qualify_component_realization_surface`, `derive_code_surface` | split/partial | Component code had yield, repair, close; qualification had two repairs then close; `derive_code_surface` had repair then close. | TS splits code into component generation, qualification, and rollup. The rollup has same name but is not the same work unit as Python's code edge. |
| 13 | `derive_test_design_surface` | Builds test design surface. | `derive_test_design_surface` | mapped | Two TS attempts observed: one blocked/incomplete, second closed. | Same-name edge exists, but first-attempt block and prompt bundle behavior must be compared. |
| 14 | `select_test_stack_profile` | Selects test stack profile as explicit traversal state. | none clean; implicit in TS execution shards and SBT test contract | missing | No TS edge with this contract observed. | Test stack selection is currently package/config truth, not a graph traversal product. |
| 15 | `derive_test_module_surface` | Builds test module surface. | `derive_component_test_surface` | partial/current | TS has one repaired `derive_component_test_surface` attempt and a current in-flight retry. | TS uses a component-test edge rather than Python's test-module surface. This is not yet closed in the live run. |
| 16 | `derive_test_run_archive_surface` | Builds test run archive/evidence surface after test execution. | none observed yet | missing | No TS test-run archive edge observed so far. | Python's execution-evidence path has no current TS counterpart in the observed run yet. |
| 17 | `qualify_testcase_authority` | Qualifies testcase authority before execution/release. | none observed yet | missing | No TS testcase-authority edge observed so far. | TS may encode authority in test design/component test packages, but the explicit qualification traversal is absent. |
| 18 | `prepare_release_surface` | Prepares release surface from accumulated evidence. | none observed yet | missing | No TS release-prep edge observed so far. | Current TS run has not reached release-surface behavior. |
| 19 | `prepare_test_execution_surface` | Prepares test execution surface/lane. | none observed yet | missing | No TS execution-prep edge observed so far. | Current TS run has materialized tests, but no observed execution-preparation traversal. |
| 20 | `derive_test_execution_result_surface` | Admits actual execution result evidence. | none observed yet | missing | No TS execution-result edge observed so far. | This is the final high-value test35 behavior. Until TS runs/admit tests, comparison remains incomplete. |

TS observed edges without a clean same-name Python edge:

| # | `test72.TS.cl` edge | TS role in current run | Nearest `test35` counterpart | Mapping status | Current evidence | Comparison implication |
|---:|---|---|---|---|---|---|
| A | `Fg_conform_project` | Deterministic project conformance/bootstrap file generation. | `derive_intent_surface`, `derive_product_surface`, `derive_goal_surface`, `derive_requirement_surface` | TS-only/collapsed | Referenced in prior comparison as the deterministic pre-authority phase; not present as an operator-run graph edge in current analyzer sequence. | This is a TS startup/conformance construct. It can create authority files before the comparable Python content edges would run. |
| B | `Fg_conform_project_authority` | F_P authority/bootstrap pass over conformed project. | Early Python authority surfaces listed above | TS-only/collapsed | Four observed TS archives; final closed. | Broad bootstrap edge replaces several explicit Python content edges and weakens edge-by-edge equivalence. |
| C | `derive_component_code_surface` | Materializes component/source files before `code_surface` rollup. | `derive_code_surface`, partially `derive_implementation_module_surface` | TS-only split | Three attempts: yield, repair, close; product files were written here. | This is where most TS code construction happens, not in the later same-name `derive_code_surface` rollup. |
| D | `qualify_component_realization_surface` | Qualifies component realization before code rollup. | none clean; partial assurance layer around Python `derive_code_surface` | TS-only split | Three attempts: repair, repair, close. | TS adds an intermediate qualification layer that Python test35 did not expose as a separate edge. |
| E | `derive_component_test_surface` | Materializes component test files from test design and component code. | `derive_test_module_surface`, partially future test execution surfaces | TS-only split/current | Prior attempt repaired; newest attempt is in-flight with active worker. | This is the current TS cursor and not yet evidence-equivalent to Python's completed test module plus test execution path. |

### Traversal Comparison 1: Requirement Surface Construction

Comparison anchor:
- Python reference workspace: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35`
- Current TypeScript comparison workspace: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl`
- Python traversal: `derive_requirement_surface`
- TypeScript traversals observed so far: `Fg_conform_project` followed by `Fg_conform_project_authority`

Conclusion: these are not yet equivalent. In `test35`, requirement generation is a dedicated F_P `derive_requirement_surface` traversal with deterministic gap feedback and a published fulfillment ledger. In the TypeScript run, requirement-family files are first created by the deterministic `Fg_conform_project` conformance traversal, then read/touched as authority by the F_P `Fg_conform_project_authority` bootstrap traversal. That moves content construction earlier into conformance and weakens the like-for-like comparison to `test35`.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Target meaning | Build or repair the `requirement_surface` from current intent, product, goals, imported sources, and F_D requirement gaps. | Conform the project layout and bootstrap authority, including generated requirement-family files. | Python treats requirements as the target of a content traversal. TypeScript treats many requirement files as conformance/bootstrap artifacts before the design traversal begins. |
| Edge or graph function | `derive_requirement_surface` | `Fg_conform_project`, then `Fg_conform_project_authority` | The TS path is split across two broader startup functions rather than one requirement-surface traversal. |
| Runtime regime | F_P construction informed by F_D failures. | `Fg_conform_project` is F_D; `Fg_conform_project_authority` is F_P. | TS now has richer process telemetry, but the first materialization of requirement-family content is F_D conformance, not F_P requirement repair. |
| Source inputs | `input_set`, `intent_surface`, `product_surface`, `goal_surface`; deterministic failures such as `requirement_scope_complete`; declared obligation policy. | Existing workspace authority, `.ai-workspace/context/project_bootstrap.md`, specification files, generated requirement family files, and target bootstrap carrier contract. | Python manifest made the missing requirement IDs explicit in the worker brief. TS F_P authority pass receives already-materialized requirement files. |
| Target artifacts | `specification/requirements/10-generated-bootstrap.md`, plus requirement inventory updates. | `specification/requirements/00-imported-sources.md`, `01-acc.md` through `16-typ.md`, `specification/requirements/README.md`, `specification/INTENT.md`. | TS has more granular files, but the graph path does not yet prove those files were produced by a requirement-surface fulfillment traversal. |
| Closure basis | Published fulfillment ledger for `derive_requirement_surface`: expected 1, fulfilled 1, missing 0, admitted true, edge converged true. | `Fg_conform_project` managed traversal/conformance ledger; `Fg_conform_project_authority` assurance and SDLC edge fulfillment ledgers for `project_bootstrap_surface`. | TS closure is for project conformance/bootstrap authority, not for requirement-surface content completeness. |
| Gap pressure | F_D failure explicitly named missing IDs `REQ-ENG-001` through `REQ-ENG-006`; F_P result carried them into `10-generated-bootstrap.md`. | No equivalent requirement-scope gap pressure was observed on the conformance file generation. The current run later advanced to `derive_design_surface` with unresolved requirements still present. | Python preserved requirement-specific pressure until the requirement surface repaired it. TS currently risks treating generated files as enough authority without the same requirement content proof. |
| Downstream use | Later design, code, test, execution, and release surfaces cite the generated bootstrap requirements and the 77-requirement inventory. | Handoff manifests and authority snapshots include the requirement-family files as upstream evidence for later edges. | TS uses the artifacts downstream, but the artifact-producing traversal is not yet the same semantic unit as Python `derive_requirement_surface`. |

#### Events Created

Python `derive_requirement_surface` emitted a full traversal and closure lifecycle. Exact per-edge counts from `.ai-workspace/events/events.jsonl`:

| Event type | Count |
|---|---:|
| `run_bound` | 6 |
| `run_started` | 6 |
| `graph_call_opened` | 6 |
| `vector_started` | 6 |
| `found` | 3 |
| `fp_dispatched` | 4 |
| `worker_turn_started` | 6 |
| `worker_turn_progress` | 15 |
| `worker_turn_salvage_candidate` | 6 |
| `worker_turn_salvaged` | 6 |
| `result_artifact_observed` | 12 |
| `assessed` | 6 |
| `proof_passed` | 6 |
| `closure_passed` | 6 |
| `edge_converged` | 6 |
| `graph_call_closed` | 6 |
| `run_completed` | 6 |

The latest successful requirement repair was:
- Manifest: `.ai-workspace/fp_manifests/derive_requirement_surface_20260419T103015576845Z.json`
- Result: `.ai-workspace/fp_results/derive_requirement_surface_20260419T103015576845Z.json`
- Ledger: `.ai-workspace/fp_ledgers/derive_requirement_surface_20260419T103015576845Z.json`

That manifest carried:
- `edge: derive_requirement_surface`
- `target_asset: requirement_surface`
- failing evaluator: `requirement_scope_complete`
- suggested repair: carry the missing `REQ-ENG-*` IDs into the generated requirement surface instead of silently narrowing scope

The result then recorded:
- actor: `claude-sonnet-4-6`
- fulfillment status: `fulfilled`
- evidence refs: `specification/requirements/10-generated-bootstrap.md`, `specification/REQUIREMENTS.md#REQ-ENG-001-through-REQ-ENG-006`

The ledger then recorded:
- admitted: `true`
- expected count: `1`
- fulfilled count: `1`
- missing count: `0`
- edge converged: `true`
- target asset: `requirement_surface`

TypeScript `Fg_conform_project` emitted a narrow F_D lifecycle in:

`/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260516T122120502Z_pid78287`

| Event type | Count |
|---|---:|
| `graph_call_opened` | 1 |
| `frame_opened` | 1 |
| `vector_traversal_planned` | 1 |
| `vector_evaluated` | 1 |
| `vector_closed` | 1 |

Its `postmortem.md` reports:
- status: `converged`
- graph function: `Fg_conform_project`
- managed traversal: `satisfied`
- conformance: `passed`
- event sequence: `graph_call_opened -> frame_opened -> vector_traversal_planned -> vector_evaluated -> vector_closed`

TypeScript `Fg_conform_project_authority` emitted a larger F_P process/admission lifecycle in:

`/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260516T122856814Z_pid86360`

| Event type | Count |
|---|---:|
| `basis_admitted` | 1 |
| `graph_call_opened` | 1 |
| `frame_opened` | 1 |
| `vector_traversal_planned` | 1 |
| `fp_dispatch_requested` | 1 |
| `traversal_modulation_resolved` | 1 |
| `traversal_attempt_envelope_derived` | 1 |
| `actor_invocation_started` | 1 |
| `traversal_attempt_dispatched` | 1 |
| `actor_process_started` | 1 |
| `runtime_activity_probe_observed` | 74 |
| `actor_process_stream_observed` | 62 |
| `actor_process_heartbeat` | 11 |
| `actor_process_exited` | 1 |
| `authority_snapshot_admitted` | 2 |
| `payload_observed` | 15 |
| `payload_validated` | 15 |
| `evidence_admitted` | 15 |
| `actor_result_artifact_observed` | 1 |
| `actor_invocation_closed` | 1 |
| `vector_evaluated` | 1 |
| `vector_closed` | 1 |
| `terminal_reached` | 1 |

Its `postmortem.md` reports:
- status: `converged`
- graph function: `Fg_conform_project_authority`
- worker status: `0`
- postflight: `passed`
- assurance: `close_allowed`

This TS event shape is stronger than earlier TS attempts at process telemetry and replay evidence. The issue is semantic placement: the F_P authority traversal is closing `project_bootstrap_surface`, while the generated requirement files already exist from `Fg_conform_project`.

#### Ledgers Used

| Ledger family | Python `test35` | TypeScript `test72.TS.cl` |
|---|---|---|
| Construction manifest | `.ai-workspace/fp_manifests/derive_requirement_surface_*.json` declares source assets, target asset, deterministic failures, prompt, output contract, and obligation ledger policy. | `managed_traversal_manifest.json`, `worker_invocation_package.json`, `handoff_manifest.json`, and `sdlc_construction_intent.json` split this information across conformance and authority runs. |
| Fulfillment result | `.ai-workspace/fp_results/derive_requirement_surface_*.json` records actor fulfillment, detail, and evidence refs for requirement repair. | `constructor_result.json`, `fp_transform_result.json`, `fp_evaluate_result.json`, and `worker_result_report.json` record the authority/bootstrap worker result. |
| Fulfillment ledger | `.ai-workspace/fp_ledgers/derive_requirement_surface_*.json` is the direct ledger for requirement-surface convergence. | `sdlc_edge_fulfillment_ledger.json` exists for `Fg_conform_project_authority`, but the target surface is bootstrap authority rather than requirement-surface convergence. |
| Assurance ledger | Python route creates assessed/proof/closure/edge events from the published fulfillment ledger. | `assurance_ledgers.json`, `assurance_satisfaction.json`, `sdlc_edge_closure_decision.json`, `sdlc_edge_gain.json`, and `sdlc_edge_residual_pressure.json` exist for the authority traversal. |
| Managed traversal ledger | Requirement traversal is not only conformance; it is an F_P edge with fulfillment ledger closure. | `managed_traversal_ledger.json` for `Fg_conform_project` lists generated requirement file refs as deterministic conformance outputs. |

#### Artifacts Used And Written

Python `test35` requirement artifacts:
- `specification/requirements/00-imported-sources.md`
- `specification/requirements/00-starter.md`
- `specification/requirements/README.md`
- `specification/requirements/10-generated-bootstrap.md`
- `specification/REQUIREMENTS.md`

The key generated artifact is `specification/requirements/10-generated-bootstrap.md`. It records:
- project: Categorical Data Mapping & Computation Engine
- platform: Scala / Apache Spark
- status: specified
- authority sources: `specification/mapper_requirements.md`, `specification/REQUIREMENTS.md`
- 77 active requirements across 13 families

TypeScript `test72.TS.cl` requirement artifacts:
- `specification/requirements/00-imported-sources.md`
- `specification/requirements/01-acc.md`
- `specification/requirements/02-adj.md`
- `specification/requirements/03-api.md`
- `specification/requirements/04-cli.md`
- `specification/requirements/05-cmp.md`
- `specification/requirements/06-col.md`
- `specification/requirements/07-conf.md`
- `specification/requirements/08-csv.md`
- `specification/requirements/09-eng.md`
- `specification/requirements/10-err.md`
- `specification/requirements/11-map.md`
- `specification/requirements/12-obs.md`
- `specification/requirements/13-perf.md`
- `specification/requirements/14-spark.md`
- `specification/requirements/15-test.md`
- `specification/requirements/16-typ.md`
- `specification/requirements/README.md`
- `specification/INTENT.md`

The family files have headers indicating deterministic projection from `Fg_conform_project`; `README.md` and `INTENT.md` were later produced or updated under `Fg_conform_project_authority`.

#### Root Cause Hypothesis For This Divergence

The TS substrate now has more ABG-shaped event and assurance machinery than earlier attempts, but the graph path for requirements is not yet the same as `test35`.

`test35` order:

`observe requirement gap -> construct F_P requirement surface -> admit result -> publish requirement fulfillment ledger -> close requirement edge -> downstream design consumes requirement surface`

Current TS order observed:

`deterministically conform workspace and emit requirement-family files -> run F_P bootstrap authority pass over those files -> downstream design consumes requirement-family authority`

That is a real semantic shift. It may be intentional if the TypeScript design declares requirement-family files as conformance outputs. If not intentional, it is the same failure class recorded in the master reference: the framework creates authoritative-looking artifacts before the corresponding content traversal has proven them.

#### Parity Requirements Before Calling This Equivalent To Test35

To recover `test35` behavior for this path, the TypeScript run needs one of these explicit graph truths:

1. A dedicated `derive_requirement_surface` traversal that owns requirement content construction, accepts deterministic requirement gaps as input pressure, writes the requirement surface assets, and closes through an edge fulfillment ledger.
2. Or an explicit design decision that `Fg_conform_project` owns requirement-family projection as a deterministic source-induction step, plus a separate F_P requirement-content traversal that evaluates and repairs those family files before design construction consumes them.

Without one of those, TS may continue using requirement files downstream, but it has not reproduced the `test35` requirement-surface behavior.

### Comparison Sequence Rule

Use the successful Python `test35` edge order as the reference sequence. For each reference edge:

1. Compare to the TypeScript traversal with the same graph function name when one exists.
2. If no same-name traversal exists, compare to the TypeScript traversal that serves the same function.
3. If TypeScript split one Python edge across multiple traversals, compare the whole TS cluster.
4. If TypeScript merged several Python edges, compare the merged traversal against each Python reference edge it subsumes.
5. If TypeScript skipped or reordered a reference edge, still record the traversal analysis and classify it as `missing`, `moved`, `merged`, `split`, or `extra`.
6. Treat artifact creation before the corresponding traversal as a finding, not as proof of equivalence.
7. Include timing for every compared traversal. Timing is evidence, not decoration: repeated attempts, retries, and missing timing carriers are part of the behavioral comparison.

Observed sequence crosswalk so far:

| Python `test35` reference order | TypeScript `test72.TS.cl` observed path | Classification | Next analysis state |
|---:|---|---|---|
| 1. `derive_intent_surface` | `Fg_conform_project_authority` touches `specification/INTENT.md` during bootstrap authority | moved/merged into bootstrap authority | pending |
| 2. `derive_product_surface` | Not yet isolated in observed TS archives | pending/missing until proven | pending |
| 3. `derive_goal_surface` | Not yet isolated in observed TS archives | pending/missing until proven | pending |
| 4. `derive_requirement_surface` | `Fg_conform_project` + `Fg_conform_project_authority` | split/moved; analyzed above | complete initial pass |
| 5. `derive_feature_decomp_surface` | `derive_feature_decomp_surface` | same-name, different closure semantics | analyzed below |
| 6. `derive_uat_testcases_surface` | No same-name TS archive observed; `derive_scenario_surface` is a later partial analog, not equivalent | missing/moved | complete initial pass |
| 7. `derive_design_surface` | `derive_design_surface` | same-name; TS run includes blocked first attempt plus retry close | complete initial pass |
| 8. `derive_scenario_surface` | `derive_scenario_surface` | same-name; TS run closes ledger but terminates with non-progress marker | complete initial pass |

### Timing Method

Timing must be captured for every traversal comparison.

Python `test35` timing basis:
- Source: `.ai-workspace/events/events.jsonl`
- Measurement: per-edge `run_started` to latest `run_completed`, grouped by run id.
- `total_active` means the sum of active attempt durations, not wall-clock span between attempts.
- Duplicate `run_completed` events on one run id are treated as one attempt ending at the latest completion timestamp.

TypeScript `test72.TS.cl` timing basis:
- Source for F_P worker time: `worker_process_summary.json.elapsedMs` / `worker_run.json.elapsedMs`
- Measurement: worker process elapsed time for the operator archive.
- This does not include all possible pre-worker deterministic setup or post-worker projection time unless those are included by the installed operator's worker summary.
- The TypeScript `runtime_events.json` projection currently records event order and event kind, but not per-event timestamps. That is a timing instrumentation gap.
- Deterministic `Fg_conform_project` has no `elapsedMs` in the observed archive; only archive timestamp/mtime are available, so it is not treated as a ledger-grade duration.

Current timing crosswalk:

| Python reference traversal | Python attempts | Python total active | Python average attempt | Python last attempt | TypeScript observed traversal | TypeScript worker elapsed | Timing comparison |
|---|---:|---:|---:|---:|---|---:|---|
| `derive_requirement_surface` | 6 | 12m 19s | 2m 03s | 1m 03s | `Fg_conform_project` + `Fg_conform_project_authority` | `Fg_conform_project`: not captured; `Fg_conform_project_authority`: 5m 59s | TS authority pass alone is longer than Python's average requirement attempt, and TS also lacks duration for the deterministic file-generation part. |
| `derive_feature_decomp_surface` | 4 | 12m 11s | 3m 03s | 2m 44s | `derive_feature_decomp_surface` | 7m 07s | Same-name TS traversal is more than 2x Python average attempt time and still records non-progress classification. |
| `derive_uat_testcases_surface` | 4 | 13m 58s | 3m 30s | 4m 12s | No same-name TS traversal; nearest partial analog is `derive_scenario_surface` | `derive_scenario_surface`: 5m 59s | Not equivalent. TS spends time later on scenarios, but the UAT-before-design traversal is absent. |
| `derive_design_surface` | 5 | 22m 11s | 4m 26s | 7m 31s | `derive_design_surface` | 7m 16s cluster: 4m 20s blocked attempt + 2m 57s retry close | Same-name TS traversal is roughly 1.6x Python average and required same-edge retry for missing `REQ-DQ-003` trace. |
| `derive_scenario_surface` | 4 | 15m 30s | 3m 53s | 2m 46s | `derive_scenario_surface` | 5m 59s | Same-name TS traversal is ~1.5x Python average and ~2.2x Python last attempt. It has no retry, but the archive records non-progress classification after close. |

Current TS F_P worker elapsed details:

| TypeScript archive | Traversal | Elapsed | Timed out | Tool calls | API retries |
|---|---|---:|---|---:|---:|
| `20260516T122856814Z_pid86360` | `Fg_conform_project_authority` | 5m 59s | false | 20 | 0 |
| `20260516T123455662Z_pid86360` | `derive_feature_decomp_surface` | 7m 07s | false | 19 | 0 |
| `20260516T124202552Z_pid86360` | `derive_design_surface` first attempt | 4m 20s | false | 15 | 0 |
| `20260516T124622257Z_pid86360` | `derive_design_surface` | 2m 57s | false | 17 | 0 |
| `20260516T124919294Z_pid86360` | `derive_scenario_surface` | 5m 59s | false | 16 | 0 |

Current TS live cursor, updated from `odd-sdlc-ts analyze-run`:

| TypeScript archive | Traversal | Target | Analyzer state | Closure | Notes |
|---|---|---|---|---|---|
| `20260516T143041411Z_pid86360` | `derive_code_surface` | `code_surface` | completed | close | Rollup edge only; 0 product files, 445 obligations, worker elapsed 452.0s. The actual Scala source/test files were generated earlier by `derive_component_code_surface`. |
| `20260516T143814148Z_pid86360` | `derive_test_design_surface` | `test_design_surface` | active/in-flight | none yet | Worker PID 23020 alive; productive signal `progressing`; last event at 1440043ms; archive growth about 10.35MiB/min. Missing `worker_run.json`, `fp_evaluate_result.json`, fulfillment ledger, closure decision, and next-action projection because the edge has not completed. |

Analyzer interpretation note: `analyze-run` currently emits `aborted_run_observed` for the active `derive_test_design_surface` archive because close-time artifacts are missing while the worker is still alive. For this case that diagnostic should be read as `active_pending_artifacts`, not a completed abort.

### Prompt Construction Comparison: Python test35 vs TypeScript test72

Prompt construction is not just presentation. It decides which facts the worker experiences as authority, which gaps remain visible, which output contract is foregrounded, and how much effort is spent decoding framework scaffolding before product construction begins. For this comparison, prompt sourcing is part of the behavior being tested, not a cosmetic wrapper around the behavior.

#### Python test35 prompt sourcing

In test35, the prompt is assembled as one manifest-owned transport payload.

Primary code surfaces:

| Surface | Role |
| --- | --- |
| `data_mapper.test35/.genesis/genesis/binding.py:1324-1350` | `bind_fp` resolves workspace asset bindings, target binding, runtime context, and calls `_assemble_prompt`. |
| `data_mapper.test35/.genesis/genesis/binding.py:1369-1690` | `_assemble_prompt` renders the actual worker prompt sections. |
| `data_mapper.test35/.genesis/genesis/interpret.py:1570-1960` | Computes failing F_D/F_P/F_H evaluator state, builds the F_P manifest, embeds the prompt, and writes `.ai-workspace/fp_manifests/<edge>_<timestamp>.json`. |
| `data_mapper.test35/.genesis/genesis/dispatch_runtime.py:320-420` | Reads `manifest["prompt"]` and sends that string as the direct worker transport payload. |
| `data_mapper.test35/.genesis/odd_sdlc/python/code/odd_sdlc/operational_dispatch.py:164,196,251` | Calls `construct_manifest(...)` for projection, prepare, and operational dispatch edges. |

The construction chain is:

1. Runtime projection determines the current edge, source asset, target asset, status, and failing evaluator set.
2. `bind_fp` binds the current workspace facts into an F_P manifest.
3. `_assemble_prompt` renders a single readable prompt.
4. The manifest stores both the prompt and the structured authority used to make it.
5. Dispatch sends `manifest["prompt"]` directly.
6. The worker writes the declared result path.
7. The ABG/Python loop re-observes workspace state and evaluator state on the next pass.

The prompt sections are consistent across traversals:

| Section | Source | Function in construction |
| --- | --- | --- |
| `[PRECONDITIONS]` | Source markov conditions and current edge basis | Tells the worker what must already be true. |
| `[CURRENT STATE]` | Edge/source/target/status/projection state | Puts the worker in the active traversal state. |
| `[WORKING METHOD]` | Binding policy plus target binding | Gives current-state-first instructions and target-write orientation. |
| `[GAP]` | Failing evaluators and F_D result details | Makes the evaluated deficit visible. |
| `[DETERMINISTIC FAILURES]` | F_D failures, when present | Keeps deterministic blockers visible without letting them become product closure. |
| `[CONTEXT]` | Relevant contexts selected by binding | Supplies curated supporting text. |
| `[SOURCE ASSET SNAPSHOT]` | Current upstream workspace asset snapshots | Shows what exists now before asking for the next asset. |
| `[ENVIRONMENT]` | Runtime environment contract | Names operational assumptions. |
| `[REQUIRED BOUNDARY]` | Effective required context merge | Defines minimum input boundary. |
| `[ASSET SURFACE]` | Source and target asset descriptors | States artifact identities and paths. |
| `[TARGET BINDING]` | Target binding | Names where and how the worker must write. |
| `[OUTPUT CONTRACT]` | Fulfillment obligations and result path | Describes the expected artifact and close-facing obligations. |
| `[DECLARED OBLIGATION LEDGER POLICY]` | Obligation ledger adapter/policy | Tells the worker how obligations will be assessed. |
| `[EXECUTION RULES]` | Runtime dispatch policy | Gives final worker execution constraints. |

The important property is locality: the prompt is the worker-facing source of truth, and the manifest is the durable source of how that prompt was constructed. The worker does not have to discover the real task by reading several sidecar packages and mentally joining them. The manifest still carries structured facts, but the transport prompt is the coherent construction surface.

Observed latest test35 prompt sizes:

| Edge | Prompt chars | Lines | Sections | F_D failures | Obligations | Contexts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `derive_requirement_surface` | 8,019 | 102 | 11 | 1 | 1 | 2 |
| `derive_feature_decomp_surface` | 7,248 | 95 | 11 | 0 | 1 | 1 |
| `derive_uat_testcases_surface` | 7,207 | 95 | 11 | 0 | 1 | 1 |
| `derive_design_surface` | 12,186 | 152 | 11 | 1 | 1 | 2 |
| `derive_scenario_surface` | 7,306 | 96 | 11 | 0 | 1 | 1 |
| `derive_implementation_design_surface` | 27,802 | 174 | 12 | 1 | 81 | 2 |
| `derive_code_surface` | 26,982 | 152 | 12 | 1 | 77 | 3 |
| `derive_test_design_surface` | 26,891 | 155 | 12 | 1 | 77 | 2 |

The size grows when the product obligation set grows. That is the right pressure direction: more product obligation, more prompt content. The prompt remains one readable object.

#### TypeScript test72 prompt sourcing

In test72, the worker prompt is a launcher over a multi-carrier prompt bundle. The `worker_prompt.md` file is not the whole prompt. It tells the worker what to read and which package fields are authoritative.

Primary code surfaces:

| Surface | Role |
| --- | --- |
| `odd_sdlc/build_tenants/typescript/code/src/operator/handoff.ts:5201-5213` | `transformAxiomsForWorker` defines the terse worker axioms and tells the worker to use packages as schema authority. |
| `odd_sdlc/build_tenants/typescript/code/src/operator/handoff.ts:5247-5305` | Carrier-specific directives for test design, design depth, and execution evidence. |
| `odd_sdlc/build_tenants/typescript/code/src/operator/handoff.ts:5316-5341` | `retryDefectDirectivesForWorker` renders prior gap dossier defects into retry prompts. |
| `odd_sdlc/build_tenants/typescript/code/src/operator/handoff.ts:5344-5412` | `outcomeDirectivesForWorker` renders target artifact, carrier contract, digest, materialization policy, output path, and edge-specific instructions. |
| `odd_sdlc/build_tenants/typescript/code/src/operator/handoff.ts:5978-6039` | `currentEvaluatedGapPromptLines` renders the current evaluated gap dossier into the prompt. |
| `odd_sdlc/build_tenants/typescript/code/src/operator/handoff.ts:6041-6095` | `promptForHandoff` builds the final `worker_prompt.md` launch contract. |
| `odd_sdlc/build_tenants/typescript/code/src/operator/handoff.ts:6097-6140` | `writeHandoffFiles` writes `handoff_manifest.json`, `worker_invocation_package.json`, `worker_brief.json`, `worker_prompt.md`, `conformed_project.json`, and `traversal_intent_package.json`. |

The construction chain is:

1. The operator projects traversal state and target-carrier state.
2. It materializes a handoff archive for the edge attempt.
3. It writes typed sidecars: `worker_brief.json`, `worker_invocation_package.json`, `traversal_intent_package.json`, `handoff_manifest.json`, and sometimes `gap_dossier.json`.
4. It writes `worker_prompt.md` as a small launch contract.
5. The prompt tells the worker to read the sidecars in order.
6. The worker must join the launch prompt, package fields, target-carrier identity, gap dossier content, and artifact paths.
7. The framework writes reports, evidence, ledgers, and closure after the worker exits.

The prompt structure is typically:

| Prompt part | Source | Function in construction |
| --- | --- | --- |
| Launch contract header | `promptForHandoff` | Names `F_P.transform`, edge, target, materialization, and output. |
| Read order | `promptForHandoff` | Points to brief, invocation package, traversal package, and forensic manifest. |
| Terse axioms | `transformAxiomsForWorker` | Tells the worker not to write framework reports and to use package fields as authority. |
| Outcome directives | `outcomeDirectivesForWorker` | Names output path, target carrier contract, digest, fixed fields, template, materialization policy, and edge-specific rules. |
| Retry directives | `retryDefectDirectivesForWorker` | Lists prior defects and says this is a retry/re-entry attempt. |
| Current evaluated gaps | `currentEvaluatedGapPromptLines` | Lists gap dossier refs, blocked requirements, evidence refs, and evaluator reasons. |
| Package field map | `promptForHandoff` | Tells the worker which JSON fields to apply. |
| Framework responsibility boundary | `promptForHandoff` | Says the framework writes reports/evidence/ledgers/closure after process exit. |

The good property is explicit identity: target carrier contract refs, digests, write roots, materialization flags, and invocation package fields are replayable and inspectable. The weak property is fragmentation: the worker-facing constructive meaning is spread across multiple files, and the prompt is often a pointer document rather than the construction document itself.

Observed test72 prompt bundle sizes:

| Edge attempt | `worker_prompt.md` bytes | Total prompt bundle bytes | Notes |
| --- | ---: | ---: | --- |
| `Fg_conform_project_authority` | 3,888 | 907,091 | Conformance launch with large sidecar authority. |
| `derive_feature_decomp_surface` | 2,860 | 1,114,984 | Small visible prompt, large package surface. |
| `derive_design_surface` first | 2,942 | 1,933,546 | Includes 816,262-byte gap dossier. |
| `derive_design_surface` retry | 7,796 | 5,581,871 | Retry pressure expands prompt and bundle. |
| `derive_scenario_surface` | 2,794 | 1,118,599 | Small visible prompt, large package surface. |
| `derive_implementation_design_surface` first | 5,261 | 3,672,613 | Includes 2,411,640-byte gap dossier. |
| `derive_implementation_design_surface` retry 1 | 15,290 | 10,447,189 | Large retry pressure. |
| `derive_implementation_design_surface` retry 2 | 10,589 | 10,080,542 | Large bundle remains. |
| `derive_component_code_surface` first | 12,890 | 1,181,690 | Gap dossier small in this attempt. |
| `derive_component_code_surface` retry 1 | 16,177 | 5,252,482 | Gap dossier 3,792,032 bytes. |
| `derive_component_code_surface` retry 2 | 25,483 | 12,028,806 | Very large retry package. |
| `qualify_component_realization_surface` first | 3,623 | 1,147,056 | Qualification launch. |
| `qualify_component_realization_surface` retry 1 | 5,076 | 2,266,468 | Retry pressure grows. |
| `qualify_component_realization_surface` retry 2 | 8,621 | 5,967,791 | Retry pressure grows again. |
| `derive_code_surface` first | 2,896 | 5,162,888 | Small visible prompt over 4,032,812-byte gap dossier. |
| `derive_code_surface` retry | 17,480 | 12,147,592 | Large current evaluated gap set. |
| `derive_test_design_surface` active | 5,136 | 1,214,650 | Active at previous observation point. |
| `derive_test_design_surface` later attempt | 7,417 | 1,262,673 | Later attempt observed after active cursor moved. |

The visible prompt is often smaller than Python's, but the real worker read surface is much larger. That distinction matters. If the worker follows the read order, the constructive prompt is not 2-7 KB; it is the prompt plus hundreds of KB or multiple MB of JSON sidecars. If the worker does not follow the read order, the typed authority exists but does not shape construction.

#### Quality comparison

| Dimension | Python test35 | TypeScript test72 | Assessment |
| --- | --- | --- | --- |
| Prompt locality | One manifest prompt is the dispatch payload. | Prompt is a launcher over several package files. | Python is stronger for worker cognition and audit readability. |
| Structured identity | Structured facts exist in the manifest but are looser. | Target carrier ref/digest/schema, write roots, materialization, and package fields are explicit. | TS is stronger for replay and identity typing. |
| Current-state-first behavior | Current asset and source snapshots are rendered directly into prompt sections. | Axioms say current-state-first, but current state is mostly in sidecars unless explicitly summarized. | Python better expresses the construction posture. |
| Gap pressure | Failing evaluator state is rendered as a bounded prompt section. | Current evaluated gaps and retry defects are explicit, but can become large and repetitive. | TS is stronger mechanically but risks bloat and string-repair behavior. |
| Worker effort before product work | Low: read one prompt. | Higher: read prompt, brief, invocation package, traversal intent package, sometimes manifest and gap dossier. | TS spends more worker cognition on framework decoding. |
| Content orientation | Product asset construction remains central. | Contract, carrier, trace, and retry pressure can dominate the visible task. | TS can over-foreground framework conformance over product content. |
| Replay/audit | Manifest stores prompt and construction inputs. | Package set provides detailed typed audit trail. | TS has more audit material, but also more places for drift. |
| Failure mode | Prompt can be under-typed or too narrative. | Prompt can be fragmented, bloated, or sidecar-dependent. | The systems fail differently; TS has better typing but weaker prompt locality. |

#### The key behavioral gap

Python test35 made the construction prompt the primary surface. TypeScript test72 made the typed carrier package the primary surface and made `worker_prompt.md` a dispatcher into that package set.

That is not automatically wrong. It becomes wrong when the worker's actual construction context is no longer a coherent current-state-first brief. A typed sidecar is authority, but it is not necessarily cognition. The worker still needs a compact, ordered, content-bearing view of the work:

1. What exists now.
2. Which artifact is being constructed.
3. What source artifacts and digests are authoritative.
4. What content goal the F_P step is trying to satisfy.
5. Which evaluated gaps are still live.
6. Which requirements are blocked by this edge.
7. Which output path and materialization policy apply.
8. Which target carrier identity applies.
9. What counts as success for this attempt.
10. What the worker must not write because the framework owns it.

Today TS has all or most of those facts, but they are distributed. The prompt often tells the worker where truth is rather than presenting a constructed view of truth.

#### Required correction direction

Keep the TS typed carriers. They are valuable. The correction is to add a generated compact construction brief as the worker-facing primary prompt body, with sidecars as authority refs.

The construction brief should be generated from the same packages and include:

| Brief section | Required content |
| --- | --- |
| Current workspace state | Source artifact paths, target path status, existing output digest/absence, relevant current snapshots. |
| Edge construction goal | Edge id, target asset id, product-facing purpose, materialization requirement. |
| Source authority | Requirement/design/source artifact refs and digests that this edge must consume. |
| Current evaluated gaps | Bounded gap dossier summary, blocked requirement ids, evaluator reason classes, retry count. |
| Output contract | Target carrier ref/digest/kind, required worker-fillable fields, fixed framework fields, output path. |
| Execution/verification signal | Declared command or validation surface that will evaluate this artifact. |
| Framework boundary | Files the worker must not write because reports, ledgers, events, and closure are framework-owned. |
| Sidecar index | Exact sidecar paths for full authority, with a reason to open each. |

This keeps the single truth surface: packages remain the structured authority, but the construction brief becomes the single worker-facing projection of that authority. It should be derived, not handwritten, and analyzable as its own artifact.

#### Analyzer addition needed

`analyze-run` should add a prompt-bundle view so future comparisons do not require ad hoc file inspection.

Minimum fields:

| Field | Purpose |
| --- | --- |
| `renderedPromptBytes` | Size of `worker_prompt.md`. |
| `constructionBriefBytes` | Size of generated construction brief, once added. |
| `bundleBytes` | Sum of worker prompt, brief, invocation package, traversal intent package, handoff manifest, and gap dossier. |
| `handoffManifestBytes` | Detects giant manifest drift. |
| `gapDossierBytes` | Detects retry/gap bloat. |
| `sectionMap` | Shows which prompt/brief sections are present. |
| `currentStatePresent` | Verifies the worker sees current asset state directly. |
| `sourceSnapshotPresent` | Verifies source artifact state is visible. |
| `gapPressurePresent` | Verifies current evaluated gaps are visible. |
| `targetCarrierIdentityPresent` | Verifies ref/digest/kind are visible. |
| `obligationCount` | Measures product pressure in the prompt. |
| `retryReasonCount` | Measures retry pressure. |
| `sourceLocalityScore` | Estimates whether the worker can act from the rendered prompt/brief or must join many files. |
| `cognitiveBloatRatio` | `bundleBytes / renderedPromptBytes`, to catch small visible prompts hiding huge sidecar surfaces. |

This is a first-class test35 comparison metric. A framework can have correct carriers and still fail the test35 behavior if the worker-facing construction surface is fragmented or dominated by framework scaffolding.

Timing findings so far:

1. Python attempts are usually 1-5 minutes for the early design/test surfaces, with the exception of later design attempts reaching 7m 31s.
2. TS individual worker traversals are often 6-7 minutes even before code/test execution.
3. TS has no observed first-class UAT traversal, so its later scenario time cannot be used as a clean substitute.
4. TS timing needs better event-spine timestamps. `elapsedMs` is useful worker evidence, but not enough to decompose deterministic setup, actor runtime, postflight, ledger projection, and continuation scheduling.

### Traversal Comparison 2: Feature Decomposition Surface

Comparison anchor:
- Python reference traversal: `derive_feature_decomp_surface`
- Python artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35/build_tenants/scala_spark/design/20-generated-feature-decomp.md`
- TypeScript traversal archive: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260516T123455662Z_pid86360`
- TypeScript artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/build_tenants/scala_spark/design/feature_decomp_surface.md`

Conclusion: this is a same-name traversal, but not a same-behavior traversal. Both systems produce a feature decomposition surface and both ledgers assert convergence. The difference is closure shape and artifact semantics. Python closes one F_P semantic obligation for `feature_decomp_surface` against 71 requirements and 10 features. TypeScript assesses 445 obligations, admits the target carrier, and closes the edge, but the run is still recorded as `worker_invoked` and emits `traversal_attempt_non_progress_classified`. That tension must be explained before treating the TS traversal as test35-equivalent.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Source asset | `requirement_surface` | `requirement_surface` | Same declared source asset. |
| Target asset | `feature_decomp_surface` | `feature_decomp_surface` | Same declared target asset. |
| Target artifact | `build_tenants/scala_spark/design/20-generated-feature-decomp.md` | `build_tenants/scala_spark/design/feature_decomp_surface.md` | Same functional artifact family, different filename convention. |
| Content shape | 10 feature rows (`FTR-01` through `FTR-10`) decomposing 71 requirements across 12 families. | 7 modules and 43 module-level feature entries, plus a requirement trace register. | TS decomposes into implementation modules earlier and more deeply than Python's feature inventory. This may be useful, but it is not the same abstraction grain. |
| Closure obligation | One declared F_P obligation: `feature_decomp_surface_semantically_converged`. | 445 assessed obligations: target asset, F_D evaluators, generic constructor evaluator, and requirement trace obligations. | TS has much finer obligation accounting, but this also changes the closure surface. |
| Python closure result | Ledger: expected 1, fulfilled 1, missing 0, admitted true, edge converged true. | Ledger: expected 445, fulfilled 445, missing 0, admitted true, edge converged true, target carrier admitted. | Both ledgers converge, but the counted object is different. |
| Runtime disposition | Full edge lifecycle closes: assessed, proof passed, closure passed, edge converged, graph call closed, run completed. | Closure decision says `disposition: close`; residual pressure says `clear: true`; postmortem status is `worker_invoked`; event stream includes `traversal_attempt_non_progress_classified`. | TS contains contradictory-looking signals: closure surfaces say close, but traversal status/non-progress says the attempt did not finish cleanly as a normal convergence lifecycle. |
| Execution evidence | Not applicable at feature-decomp stage; closure is semantic F_P evidence over requirements. | `executionEvidenceStatus: null`; not applicable at feature-decomp stage. | No issue by itself for this edge; execution becomes mandatory later. |
| Materialization ledger | Artifact path is named in the F_P fulfillment evidence. | `worker_result_report.outputFile` names the artifact and digest, but `product_materialization_manifest.files` is empty and `materializedFiles` is empty. | TS wrote or observed the design artifact, but product materialization tracking does not list it as a materialized file. That is worth preserving as a finding. |

#### Events Created

Python `derive_feature_decomp_surface` emitted this per-edge event profile:

| Event type | Count |
|---|---:|
| `run_bound` | 4 |
| `run_started` | 4 |
| `graph_call_opened` | 4 |
| `vector_started` | 4 |
| `fp_dispatched` | 4 |
| `worker_turn_started` | 4 |
| `worker_turn_progress` | 11 |
| `worker_turn_salvage_candidate` | 4 |
| `worker_turn_salvaged` | 4 |
| `result_artifact_observed` | 8 |
| `assessed` | 4 |
| `proof_passed` | 4 |
| `closure_passed` | 4 |
| `edge_converged` | 4 |
| `graph_call_closed` | 4 |
| `run_completed` | 4 |

The latest Python feature-decomp proof surfaces:
- Manifest: `.ai-workspace/fp_manifests/derive_feature_decomp_surface_20260418T205025887892Z.json`
- Result: `.ai-workspace/fp_results/derive_feature_decomp_surface_20260418T205025887892Z.json`
- Ledger: `.ai-workspace/fp_ledgers/derive_feature_decomp_surface_20260418T205025887892Z.json`

The result states that all 71 requirements from 12 families are assigned to exactly one of 10 features; all 6 goals are covered; the feature dependency DAG is acyclic; and no requirement is unassigned.

TypeScript `derive_feature_decomp_surface` emitted this event profile:

| Event type | Count |
|---|---:|
| `basis_admitted` | 1 |
| `graph_call_opened` | 1 |
| `frame_opened` | 1 |
| `vector_traversal_planned` | 1 |
| `fp_dispatch_requested` | 1 |
| `traversal_modulation_resolved` | 1 |
| `traversal_attempt_envelope_derived` | 1 |
| `actor_invocation_started` | 1 |
| `traversal_attempt_dispatched` | 1 |
| `actor_process_started` | 1 |
| `runtime_activity_probe_observed` | 75 |
| `actor_process_stream_observed` | 60 |
| `actor_process_heartbeat` | 14 |
| `actor_process_exited` | 1 |
| `authority_snapshot_admitted` | 1 |
| `payload_observed` | 6 |
| `payload_validated` | 6 |
| `evidence_admitted` | 6 |
| `actor_invocation_closed` | 1 |
| `traversal_attempt_non_progress_classified` | 1 |
| `terminal_reached` | 1 |

Notable absence in this event archive: no `vector_evaluated` or `vector_closed` event is present in the counted event kinds for this feature-decomp run, even though the fulfillment and closure decision files say the edge converged and closed.

#### Ledgers Used

Python:
- Manifest declares source `requirement_surface`, target `feature_decomp_surface`, and the single F_P obligation `feature_decomp_surface_semantically_converged`.
- Result records `fulfillment_status: fulfilled` with evidence refs including `build_tenants/scala_spark/design/20-generated-feature-decomp.md`, `specification/GOALS.md`, and `specification/requirements/10-generated-bootstrap.md`.
- Ledger records `admitted: true`, `expected_count: 1`, `fulfilled_count: 1`, `missing_count: 0`, `edge_converged: true`, `fulfillment_converged: true`.

TypeScript:
- `worker_invocation_package.json` carries `targetAssetType: feature_decomp_surface` and a target-carrier projection for `gtl://target-carrier-contract/odd-sdlc/derive_feature_decomp_surface/feature_decomp_surface`.
- `worker_result_report.json` records `outputFile: build_tenants/scala_spark/design/feature_decomp_surface.md`, digest `sha256:2f1613148d49027a63dde7337c1364fef3095aa313002360b819a4ee2db245fe`, and 445 obligation assessments.
- `fp_evaluate_result.json` records `status: passed`, `postflightStatus: passed`, `executionEvidenceStatus: null`, and 445/445 fulfilled obligation assessments.
- `sdlc_edge_fulfillment_ledger.json` records `admitted: true`, `edgeConverged: true`, `fulfillmentConverged: true`, `targetCarrierAdmissionStatus: admitted`, and counts `expected: 445`, `fulfilled: 445`, `missing: 0`.
- `sdlc_edge_closure_decision.json` records `disposition: close` and no reason refs.
- `sdlc_edge_residual_pressure.json` records `clear: true`, with no required or informational pressure refs.
- `product_materialization_manifest.json` records `files: []`, despite the worker result report naming a concrete output file.

#### Artifact Comparison

Python feature decomposition:
- Opens with project/platform/wave/status authority headers.
- Declares 71 requirements across 12 families decomposed into 10 features.
- Uses feature IDs `FTR-01` through `FTR-10`.
- Carries a goal coverage matrix, component inventory, dependency order, requirement coverage, and closure state.
- Keeps the feature abstraction above implementation modules; component targets are design-facing declarations.

TypeScript feature decomposition:
- Opens with an execution plan that names read authority and bounded steps.
- Declares 7 implementation modules: `cdme-compiler`, `cdme-assurance`, `cdme-executor`, `cdme-adjoint`, `cdme-accounting`, `cdme-fidelity`, `cdme-engine`.
- Declares 43 module-local features.
- Carries module dependency graph, cross-cutting concerns, and requirement trace register.
- Moves closer to implementation architecture during feature decomposition.

#### Findings For This Edge

1. Same-name traversal exists, so this is a direct comparison candidate.
2. TS has stronger typed runtime telemetry than Python for actor process, payload validation, evidence admission, target-carrier identity, and target-carrier closure admission.
3. Python has a cleaner closure lifecycle for the edge: result -> assessed/proof/closure -> edge converged -> graph call closed -> run completed.
4. TS has an internal status inconsistency to investigate: ledger and closure say closed, but postmortem says `status: worker_invoked` and events include `traversal_attempt_non_progress_classified`.
5. TS feature-decomp content is deeper and more implementation-shaped than Python's feature-decomp content. If intentional, the graph should declare that feature decomposition includes module architecture. If not, TS is collapsing feature decomposition and implementation design too early.
6. TS materialization tracking is incomplete for this edge: the output file is named and digested in `worker_result_report.json`, but `product_materialization_manifest.json` lists no files.

#### Parity Requirements Before Calling This Equivalent To Test35

This edge can be called behaviorally equivalent only if the TS graph intentionally declares:

1. Feature decomposition may include module architecture and 43 module-local features, not just a product feature inventory.
2. The closure lifecycle contradiction is resolved or explained: a closed edge should not also be classified as non-progress without a clear semantic reason.
3. Materialization tracking must name the output file in the product materialization or equivalent artifact ledger, or the absence must be an explicit non-product-materialization rule for design surfaces.
4. The requirement obligation count expansion from Python `1 semantic obligation over 71 requirements` to TS `445 assessed obligations` must be traceable to the requirement register and not to duplicated authority intake.

### Traversal Comparison 3: UAT Testcases Surface

Comparison anchor:
- Python reference traversal: `derive_uat_testcases_surface`
- Python artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35/specification/scenarios/20-generated-uat-testcases.md`
- TypeScript same-name traversal: not observed in the current `test72.TS.cl` operator archives
- Nearest TypeScript partial analog: `derive_scenario_surface`
- TypeScript partial-analog archive: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260516T124919294Z_pid86360`
- TypeScript partial-analog artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/build_tenants/scala_spark/design/scenario_surface.md`

Conclusion: `derive_uat_testcases_surface` is missing or moved in the observed TS run. The later TS `derive_scenario_surface` is not equivalent: it reads both requirement and design surfaces, writes a `scenario_surface`, and occurs after `derive_design_surface`. Python `derive_uat_testcases_surface` reads the requirement surface directly, writes UAT testcase authority under `specification/scenarios`, and occurs before design. That ordering matters because test35 lets UAT testcases co-shape downstream design; the current TS path does not show that same test-first pressure.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Reference order | After `derive_feature_decomp_surface`, before `derive_design_surface`. | No same-name traversal before `derive_design_surface`; TS later runs `derive_scenario_surface`. | TS does not preserve the Python UAT-before-design sequence. |
| Source asset | `requirement_surface` | No UAT traversal observed. Nearest partial analog `derive_scenario_surface` reads `requirement_surface, design_surface`. | Python derives UAT directly from requirements; TS scenarios are design-informed. |
| Target asset | `uat_testcases_surface` | No `uat_testcases_surface` observed. Nearest partial analog targets `scenario_surface`. | Different target asset, not only a filename difference. |
| Target artifact | `specification/scenarios/20-generated-uat-testcases.md` | No TS `specification/scenarios/20-generated-uat-testcases.md`; only observed related artifact is `build_tenants/scala_spark/design/scenario_surface.md`. | Python writes test authority under specification scenarios. TS writes design-lane scenarios under build tenant. |
| Content purpose | 72 UAT test cases covering 71 active requirements across 12 families, with explicit requirement trace IDs and goal coverage. | BDD-style scenario surface over modules and design decisions; 77 scenario/headings observed, with requirement traces. | TS scenario content is useful but not the same UAT testcase surface. |
| Closure obligation | One declared F_P obligation: `uat_testcases_surface_semantically_converged`. | No same-name closure ledger. Nearest scenario ledger assesses 445 obligations and closes `scenario_surface`. | UAT closure is absent as a first-class edge in observed TS. |
| Downstream implication | Design and later implementation can consume UAT testcase pressure before design is finalized. | Design completed before scenarios in the observed TS sequence. | TS reverses the test35 pressure direction for this slice. |

#### Events Created

Python `derive_uat_testcases_surface` emitted this per-edge event profile:

| Event type | Count |
|---|---:|
| `run_bound` | 4 |
| `run_started` | 4 |
| `graph_call_opened` | 4 |
| `vector_started` | 4 |
| `fp_dispatched` | 4 |
| `worker_turn_started` | 5 |
| `worker_turn_progress` | 12 |
| `worker_turn_salvage_candidate` | 5 |
| `worker_turn_salvaged` | 5 |
| `result_artifact_observed` | 10 |
| `assessed` | 5 |
| `proof_passed` | 5 |
| `closure_passed` | 5 |
| `edge_converged` | 5 |
| `graph_call_closed` | 5 |
| `run_completed` | 5 |

The latest Python UAT proof surfaces:
- Manifest: `.ai-workspace/fp_manifests/derive_uat_testcases_surface_20260418T205404886711Z.json`
- Result: `.ai-workspace/fp_results/derive_uat_testcases_surface_20260418T205404886711Z.json`
- Ledger: `.ai-workspace/fp_ledgers/derive_uat_testcases_surface_20260418T205404886711Z.json`

The result states that the UAT testcase surface:
- exists at `specification/scenarios/20-generated-uat-testcases.md`
- is 1606 lines
- contains 72 test cases
- covers all 71 active requirements across 12 families
- gives every requirement at least one UAT case
- gives critical requirements 2 or more cases
- includes goal coverage for G-001 through G-006
- documents regulatory compliance coverage

No TypeScript `derive_uat_testcases_surface` event archive was observed in `test72.TS.cl`.

Nearest TypeScript partial analog, `derive_scenario_surface`, emitted:

| Event type | Count |
|---|---:|
| `basis_admitted` | 1 |
| `graph_call_opened` | 1 |
| `frame_opened` | 1 |
| `vector_traversal_planned` | 1 |
| `fp_dispatch_requested` | 1 |
| `traversal_modulation_resolved` | 1 |
| `traversal_attempt_envelope_derived` | 1 |
| `actor_invocation_started` | 1 |
| `traversal_attempt_dispatched` | 1 |
| `actor_process_started` | 1 |
| `runtime_activity_probe_observed` | 65 |
| `actor_process_stream_observed` | 53 |
| `actor_process_heartbeat` | 11 |
| `actor_process_exited` | 1 |
| `authority_snapshot_admitted` | 1 |
| `payload_observed` | 6 |
| `payload_validated` | 6 |
| `evidence_admitted` | 6 |
| `actor_invocation_closed` | 1 |
| `traversal_attempt_non_progress_classified` | 1 |
| `terminal_reached` | 1 |

As with feature decomposition, the nearest TS partial analog has closure files that say the edge closed, while the postmortem status remains `worker_invoked` and the event stream includes `traversal_attempt_non_progress_classified`.

#### Ledgers Used

Python:
- Manifest declares source `requirement_surface`, target `uat_testcases_surface`, and the F_P obligation `uat_testcases_surface_semantically_converged`.
- Result records `fulfillment_status: fulfilled` for `uat_testcases_surface_semantically_converged`.
- Ledger records `admitted: true`, `expected_count: 1`, `fulfilled_count: 1`, `missing_count: 0`, `edge_converged: true`, `fulfillment_converged: true`.
- Later Python edges include `qualify_testcase_authority`, which writes and closes `specification/scenarios/30-generated-testcase-authority.md`.

TypeScript:
- No same-name UAT ledger exists in the observed operator archives.
- No TS `specification/scenarios/20-generated-uat-testcases.md` or `30-generated-testcase-authority.md` was observed.
- Nearest scenario ledger records `targetCarrierAdmissionStatus: admitted`, `edgeConverged: true`, `fulfillmentConverged: true`, and counts `expected: 445`, `fulfilled: 445`, `missing: 0` for `scenario_surface`.
- Nearest scenario `fp_evaluate_result.json` records `status: passed`, `postflightStatus: passed`, and `executionEvidenceStatus: null`.

#### Artifact Comparison

Python UAT artifact:
- Lives under `specification/scenarios`.
- Is explicitly a UAT testcase surface.
- Is requirement-first: authority is `specification/requirements/10-generated-bootstrap.md`, `specification/REQUIREMENTS.md`, and `specification/mapper_requirements.md`.
- Includes preconditions, steps, expected results, requirement traces, and goal coverage.
- Produces acceptance/test pressure before design and implementation.

TypeScript nearest scenario artifact:
- Lives under `build_tenants/scala_spark/design`.
- Is explicitly a scenario surface, not a UAT testcase surface.
- Is design-informed: read authority includes `ADR-001-design-surface.md` and `feature_decomp_surface.md`.
- Contains module-oriented BDD scenarios and cross-cutting scenarios.
- Produces scenario/test pressure after design has already been created.

#### Findings For This Edge

1. `derive_uat_testcases_surface` is not reproduced as a first-class TS traversal in the observed run.
2. The nearest TS `derive_scenario_surface` should not be treated as equivalent because it has a different source set, target asset, output root, and sequence position.
3. This is a major test35 parity gap: Python puts UAT testcase construction before design, so tests help constrain design. TS currently appears to put scenarios after design, so scenarios validate or elaborate design rather than co-shaping it.
4. The absence of `specification/scenarios/20-generated-uat-testcases.md` and `30-generated-testcase-authority.md` in TS means the test authority lane is not present in the same form.
5. If TS intentionally merges UAT and scenario construction, the graph must declare that merge and preserve both functions: requirement-first UAT testcase coverage and design-informed scenario detail. The observed artifact only proves the latter.

#### Parity Requirements Before Calling This Equivalent To Test35

The TS path needs one of these explicit graph truths:

1. Restore a first-class `derive_uat_testcases_surface` traversal before `derive_design_surface`, with target `uat_testcases_surface`, artifact under `specification/scenarios`, and closure by UAT testcase fulfillment ledger.
2. Or explicitly declare that `derive_scenario_surface` subsumes UAT testcase construction, move it before design or split its outputs, and prove it still creates requirement-first UAT coverage before design consumes it.
3. Add or surface a testcase authority traversal equivalent to Python `qualify_testcase_authority`, because test35 has a separate authority surface after UAT generation.

### Traversal Comparison 4: Design Surface

Comparison anchor:
- Python reference traversal: `derive_design_surface`
- Python Scala Spark artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35/build_tenants/scala_spark/design/30-generated-odd-design.md`
- Python Scala Spark proof surfaces used here: `.ai-workspace/fp_manifests/results/ledgers/derive_design_surface_20260418T205912466651Z.json`
- TypeScript first design attempt archive: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260516T124202552Z_pid86360`
- TypeScript retry/close archive: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260516T124622257Z_pid86360`
- TypeScript artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/build_tenants/scala_spark/design/adrs/ADR-001-design-surface.md`

Conclusion: this is a same-name traversal with broadly equivalent target function, but the TS behavior is weaker on sequencing and retry semantics. Python design comes after requirement, feature decomposition, and UAT testcase construction. TS design comes after requirement/bootstrap and feature decomposition but before any observed UAT testcase surface. The TS design edge also needed a same-edge retry because `REQ-DQ-003` was not traced in the first attempt. The retry closed successfully, but the runtime still records `traversal_attempt_non_progress_classified` and `terminal_reached: missing_process_evidence`.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Reference order | After `derive_uat_testcases_surface`, before `derive_scenario_surface`. | After feature decomposition, before scenario surface; no observed UAT testcase traversal before it. | TS design lacks the Python UAT-before-design constraint pressure. |
| Source assets | `requirement_surface × feature_decomp_surface`; effective upstream also includes UAT testcase pressure by sequence. | `requirement_surface × feature_decomp_surface`; worker prompt also reads product/goals/intent and generated requirement files. | Same declared source pair, but different upstream sequence state. |
| Target asset | `design_surface` | `design_surface` | Same declared target asset. |
| Target artifact | `build_tenants/scala_spark/design/30-generated-odd-design.md` | `build_tenants/scala_spark/design/adrs/ADR-001-design-surface.md` | Same functional surface, different packaging: generated design markdown vs ADR-style design surface. |
| Content shape | 5 sbt modules, 24 components, 8 key design decisions, component-to-requirement traceability, coverage state. | 7 sbt modules, 10 ADR decisions, requirement trace register. | TS design is more ADR/module-bound and includes `cdme-assurance` and `cdme-engine` as first-class modules earlier. |
| Closure obligation | One F_P semantic obligation: `design_surface_semantically_converged`. | 445 assessed obligations: target asset, F_D evaluators, generic constructor evaluator, and requirement trace obligations. | TS closure has finer-grain accounting but changed the closure object. |
| Retry behavior | Python had 5 design attempts across the full run, with one `run_superseded`; the Scala Spark design ultimately converged through normal assessed/proof/closure events. | First TS attempt blocked on missing `REQ-DQ-003` traces; retry closed after same-edge repair. | TS retry is legitimate but is a framework fragility signal: design output initially missed a repeated requirement-trace obligation. |
| Timing | Python average: 4m 26s; last attempt: 7m 31s; total active: 22m 11s. | TS design cluster: 4m 20s blocked attempt + 2m 57s retry close = 7m 16s active worker time. | TS final close is quick, but the edge needed retry; cluster time is close to Python's longest design attempt. |
| Materialization ledger | F_P result evidence names the design artifact. | `worker_result_report.outputFile` names ADR-001 and digest, but `product_materialization_manifest.files` is empty. | Same materialization tracking gap as prior TS design surfaces. |

#### Events Created

Python `derive_design_surface` emitted this per-edge event profile:

| Event type | Count |
|---|---:|
| `run_bound` | 5 |
| `run_started` | 5 |
| `graph_call_opened` | 5 |
| `vector_started` | 5 |
| `found` | 3 |
| `fp_dispatched` | 3 |
| `worker_turn_started` | 6 |
| `worker_turn_progress` | 13 |
| `worker_turn_salvage_candidate` | 6 |
| `worker_turn_salvaged` | 6 |
| `result_artifact_observed` | 12 |
| `assessed` | 6 |
| `proof_passed` | 6 |
| `closure_passed` | 6 |
| `edge_converged` | 6 |
| `graph_call_closed` | 6 |
| `run_completed` | 6 |
| `run_superseded` | 1 |

The Scala Spark Python design proof used for like-for-like comparison records:
- Manifest/result/ledger stem: `derive_design_surface_20260418T205912466651Z`
- Result detail: design surface is semantically converged against requirement and feature decomposition surfaces; all 71 requirements across 12 families have named design target components; 24 components across 5 sbt modules; all 10 features have design coverage.
- Ledger: `admitted: true`, `expected_count: 1`, `fulfilled_count: 1`, `missing_count: 0`, `edge_converged: true`, `fulfillment_converged: true`.

TypeScript `derive_design_surface` retry/close archive emitted:

| Event type | Count |
|---|---:|
| `basis_admitted` | 1 |
| `graph_call_opened` | 2 |
| `frame_opened` | 2 |
| `vector_traversal_planned` | 2 |
| `fp_dispatch_requested` | 2 |
| `traversal_modulation_resolved` | 2 |
| `traversal_attempt_envelope_derived` | 2 |
| `actor_invocation_started` | 2 |
| `traversal_attempt_dispatched` | 2 |
| `actor_process_started` | 2 |
| `runtime_activity_probe_observed` | 119 |
| `actor_process_stream_observed` | 104 |
| `actor_process_heartbeat` | 13 |
| `actor_process_exited` | 2 |
| `authority_snapshot_admitted` | 2 |
| `payload_observed` | 12 |
| `payload_validated` | 12 |
| `evidence_admitted` | 12 |
| `actor_result_artifact_observed` | 1 |
| `actor_invocation_closed` | 2 |
| `vector_evaluated` | 1 |
| `retry_repair_planned` | 1 |
| `retry_attempt_opened` | 1 |
| `continuation_terminated` | 1 |
| `continuation_reopened` | 1 |
| `retry_progress_recorded` | 1 |
| `traversal_attempt_non_progress_classified` | 1 |
| `terminal_reached` | 1 |

The TS event sequence explicitly shows:
- first actor invocation started and exited
- `vector_evaluated: blocked`
- `retry_repair_planned`
- `retry_attempt_opened`
- `continuation_terminated`
- `continuation_reopened`
- `retry_progress_recorded`
- second actor invocation started and exited
- final `traversal_attempt_non_progress_classified`
- `terminal_reached` with reason `traversal_continuation:inspect_runtime_archive:missing_process_evidence`

#### Ledgers Used

Python:
- Manifest declares source assets `requirement_surface` and `feature_decomp_surface`, target `design_surface`, and the F_P obligation `design_surface_semantically_converged`.
- The Scala Spark result records fulfillment of the semantic design obligation with evidence refs including `build_tenants/scala_spark/design/30-generated-odd-design.md`, `build_tenants/scala_spark/design/20-generated-feature-decomp.md`, `specification/REQUIREMENTS.md`, `specification/mapper_requirements.md`, and `specification/requirements/10-generated-bootstrap.md`.
- Ledger records one expected obligation, one fulfilled, admitted, edge converged.

TypeScript first attempt:
- `worker_result_report.json` writes `ADR-001-design-surface.md` and assesses 445 obligations.
- `fp_evaluate_result.json` records `status: blocked`, `postflightStatus: blocked`, total 445, fulfilled 441, blocked 4.
- Blocking reasons are all `REQ-DQ-003` trace failures across repeated requirement authorities: `requirements`, `stage_07_dq_requirements`, `stage_11_int_requirements`, and `stage_16_typ_requirements`.
- `gap_dossier.json` records lawful re-entry point `same_edge_retry`.
- Worker elapsed: 4m 20s, timed out false, tool calls 15, API retries 0.

TypeScript retry/close:
- `worker_result_report.json` records target `design_surface`, output file `ADR-001-design-surface.md`, digest `sha256:024a2351da3af6e8a2062312185e6bb4f7f1a115667efef1dbe36741a46f2677`, and 445 obligation assessments.
- `fp_evaluate_result.json` records `status: passed`, `postflightStatus: passed`, total 445, fulfilled 445, blocked 0.
- `sdlc_edge_fulfillment_ledger.json` records `admitted: true`, `edgeConverged: true`, `fulfillmentConverged: true`, `targetCarrierAdmissionStatus: admitted`, and counts `expected: 445`, `fulfilled: 445`, `missing: 0`.
- `sdlc_edge_closure_decision.json` records `disposition: close` and no reason refs.
- `sdlc_edge_residual_pressure.json` records `clear: true`, with no required or informational pressure refs.
- `product_materialization_manifest.json` records `files: []` despite the output file being named and digested.

#### Artifact Comparison

Python design artifact:
- Header: `# Generated odd_sdlc Design`
- 5 sbt modules: `cdme-compiler`, `cdme-executor`, `cdme-adjoint`, `cdme-accounting`, `cdme-fidelity`
- 24 components
- 8 key design decisions
- 66 unique `REQ-*` references found in the artifact
- Includes module architecture, core type axioms, component signatures, component-to-requirement traceability, and coverage state

TypeScript design artifact:
- Header: `# ADR-001: CDME Design Surface`
- 7 sbt modules: `cdme-compiler`, `cdme-assurance`, `cdme-executor`, `cdme-adjoint`, `cdme-accounting`, `cdme-fidelity`, `cdme-engine`
- 10 ADR decisions
- 64 unique `REQ-*` references found in the artifact
- Includes product identity, context, module dependency graph, module design decisions, consequences, and requirement trace register

The TS design is more explicitly packaged as an ADR and includes broader module topology. The Python design is a direct generated design surface with concrete component/interface detail and component traceability. Both are plausible design surfaces; the sequencing and retry behavior are the primary behavioral differences.

#### Findings For This Edge

1. Same-name traversal exists and writes a credible design surface.
2. TS design skipped the Python UAT-before-design pressure because no UAT testcase traversal was observed before design.
3. TS required a same-edge retry for missed `REQ-DQ-003` traces. That is a content completeness miss, not a harmless formatting issue.
4. The retry mechanism worked in the narrow sense: the blocked 441/445 ledger became 445/445 and closure allowed.
5. The final TS archive still ends with `traversal_attempt_non_progress_classified` and `terminal_reached: missing_process_evidence`, even though closure files say `disposition: close`. That is the same status inconsistency seen in prior TS edges.
6. TS materialization tracking still does not list the design output in `product_materialization_manifest.files`.

#### Parity Requirements Before Calling This Equivalent To Test35

This edge can be called behaviorally equivalent only if:

1. The graph explicitly declares that UAT testcase pressure is not required before design, or the missing UAT traversal is restored before design.
2. Same-edge retry is preserved as evidence of initial failure, not collapsed into a clean close narrative.
3. The final terminal/non-progress classification is corrected or explicitly typed as a post-close archive inspection issue that does not contradict closure.
4. Materialization tracking either records design artifacts in a ledger or declares why design surfaces are intentionally excluded from product materialization manifests.

### Traversal Comparison 5: Scenario Surface

Comparison anchor:
- Python reference traversal: `derive_scenario_surface`
- Python artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test35/specification/scenarios/40-generated-scenarios.md`
- TypeScript traversal: `derive_scenario_surface`
- TypeScript archive: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/.ai-workspace/runtime/odd_sdlc/operator-runs/20260516T124919294Z_pid86360`
- TypeScript artifact: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test72.TS.cl/build_tenants/scala_spark/design/scenario_surface.md`

Conclusion: this is a same-name traversal and is closer than the missing UAT comparison, but it is not yet a clean behavioral match. Python closes a scenario authority surface under `specification/scenarios` with one semantic F_P convergence obligation and normal `assessed -> proof_passed -> closure_passed -> edge_converged` lifecycle events. TypeScript writes a credible scenario surface under the tenant design tree and closes a 445-obligation ledger, but the operator archive ends with `traversal_attempt_non_progress_classified -> terminal_reached` and does not emit `vector_evaluated` or `vector_closed` in that archive.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Reference order | After `derive_design_surface`, before `derive_implementation_design_surface`. | After `derive_design_surface`; next observed TS same-lane archive is `derive_implementation_design_surface`. | Sequence placement matches the Python scenario/design transition, unlike the missing UAT-before-design edge. |
| Source assets | `requirement_surface`, `design_surface`. | `requirement_surface`, `design_surface`; worker brief names ADR-001, feature decomposition, intent, and requirement files as read authority. | Functional source set matches at the graph level. TS also carries more bootstrap/authority packaging. |
| Target artifact | `specification/scenarios/40-generated-scenarios.md`. | `build_tenants/scala_spark/design/scenario_surface.md`. | Both are scenario surfaces, but Python publishes under specification scenarios while TS keeps the output in tenant design. That placement changes downstream authority semantics. |
| Content shape | 74 scenarios across 5 scenario groups; 71 unique `REQ-*` refs. | 77 scenario headings across 7 modules; 82 unique `REQ-*` refs. | TS produces comparable breadth and more requirement refs, but follows the newer 7-module design shape rather than Python's 5-module scenario grouping. |
| Closure obligation | One F_P obligation: `scenario_surface_semantically_converged`. | 445 obligations: target asset, F_D evaluators, generic constructor evaluator, and requirement trace obligations. | TS has finer-grain closure accounting, but the closure object is no longer the same one-obligation semantic convergence proof. |
| Runtime status | Python lifecycle reaches assessed/proof/closure/edge-converged events. | `postflight: passed`, `assurance: close_allowed`, ledger close, then `traversal_attempt_non_progress_classified -> terminal_reached`. | TS closure files say close while the runtime terminal marker says non-progress. That contradiction remains a framework signal. |
| Timing | 4 attempts, 15m 30s active, 3m 53s average, 2m 46s last attempt. | 5m 59s worker elapsed; timeout false, 16 tool calls, 0 API retries. | TS has no retry here, but the single worker run is slower than the Python average and much slower than Python's final converged scenario pass. |
| Materialization ledger | F_P result evidence names the scenario artifact. | `worker_result_report.outputFile` names and digests `scenario_surface.md`, but `product_materialization_manifest.files` is empty. | Same materialization tracking gap persists. The output exists, but product-materialization evidence does not enumerate it. |

#### Events Created

Python `derive_scenario_surface` emitted this per-edge event profile:

| Event type | Count |
|---|---:|
| `run_bound` | 4 |
| `run_started` | 4 |
| `graph_call_opened` | 4 |
| `vector_started` | 4 |
| `found` | 2 |
| `fp_dispatched` | 3 |
| `worker_turn_started` | 5 |
| `worker_turn_progress` | 13 |
| `worker_turn_salvage_candidate` | 5 |
| `worker_turn_salvaged` | 5 |
| `result_artifact_observed` | 10 |
| `assessed` | 5 |
| `proof_passed` | 5 |
| `closure_passed` | 5 |
| `edge_converged` | 5 |
| `graph_call_closed` | 5 |
| `run_completed` | 5 |
| `run_superseded` | 1 |

The latest Python proof used for like-for-like comparison records:
- Manifest/result/ledger stem: `derive_scenario_surface_20260418T210347019986Z`
- Manifest source assets: `requirement_surface`, `design_surface`
- Manifest target asset: `scenario_surface`
- Failing evaluator: `scenario_surface_semantically_converged`
- Result actor: `claude-sonnet-4-6`
- Result evidence: `specification/scenarios/40-generated-scenarios.md`, `specification/requirements/10-generated-bootstrap.md`, `build_tenants/scala_spark/design/30-generated-odd-design.md`
- Ledger: `admitted: true`, `expected_count: 1`, `fulfilled_count: 1`, `missing_count: 0`, `edge_converged: true`, `fulfillment_converged: true`

TypeScript `derive_scenario_surface` emitted this runtime event profile:

| Event type | Count |
|---|---:|
| `basis_admitted` | 1 |
| `graph_call_opened` | 1 |
| `frame_opened` | 1 |
| `vector_traversal_planned` | 1 |
| `fp_dispatch_requested` | 1 |
| `traversal_modulation_resolved` | 1 |
| `traversal_attempt_envelope_derived` | 1 |
| `actor_invocation_started` | 1 |
| `traversal_attempt_dispatched` | 1 |
| `actor_process_started` | 1 |
| `runtime_activity_probe_observed` | 65 |
| `actor_process_stream_observed` | 53 |
| `actor_process_heartbeat` | 11 |
| `actor_process_exited` | 1 |
| `authority_snapshot_admitted` | 1 |
| `payload_observed` | 6 |
| `payload_validated` | 6 |
| `evidence_admitted` | 6 |
| `actor_invocation_closed` | 1 |
| `traversal_attempt_non_progress_classified` | 1 |
| `terminal_reached` | 1 |

The TS archive reports:
- `status: worker_invoked`
- `graph_function: derive_scenario_surface`
- `worker_status: 0`
- `postflight: passed`
- `assurance: close_allowed`
- event tail: `authority_snapshot_admitted -> payload_observed/payload_validated/evidence_admitted x6 -> actor_invocation_closed -> traversal_attempt_non_progress_classified -> terminal_reached`

The missing events are as important as the emitted events: this archive has no `vector_evaluated` and no `vector_closed`, even though the closure artifacts say the edge closed.

#### Ledgers Used

Python:
- Manifest declares the source assets, target asset, current-state-first working method, and one F_P convergence obligation.
- Result records semantic fulfillment detail: 74 scenarios, 71 requirement coverage, 25 critical requirements covered, 5 scenario groups, and no detected gaps.
- Fulfillment ledger records one expected obligation, one fulfilled, admitted, edge converged.
- Event spine records repeated assessed/proof/closure/edge convergence events for scenario attempts.

TypeScript:
- `worker_result_report.json` records `targetAssetType: scenario_surface`, output file `build_tenants/scala_spark/design/scenario_surface.md`, digest `sha256:329b33717052bdc145118c5ae7e89d1dd55d20865c8faaffbaa71c1559ef3a9f`, and no execution evidence.
- `fp_evaluate_result.json` records `status: passed`, `postflightStatus: passed`, `executionEvidenceStatus: null`, total 445 obligations, fulfilled 445, blocked 0.
- `sdlc_edge_fulfillment_ledger.json` records `admitted: true`, `edgeConverged: true`, `fulfillmentConverged: true`, counts `expected: 445`, `fulfilled: 445`, `missing: 0`, `targetCarrierAdmissionStatus: admitted`, and target-carrier digest `sha256:bf36c526efb63b4a9ae8735bb2db806ee070fd0509e36b84c6a58ed87aa3015a`.
- `sdlc_edge_closure_decision.json` records `disposition: close`, no reason refs, target carrier admitted, and no residual pressure refs.
- `sdlc_edge_residual_pressure.json` records `clear: true`, with no required or informational pressure refs.
- `product_materialization_manifest.json` records `files: []`.

#### Artifact Comparison

Python scenario artifact:
- Header: `# Generated Scenarios`
- Declares `Status: Converged - derive_scenario_surface`
- Declares requirement authority `specification/requirements/10-generated-bootstrap.md`
- Declares design authority `build_tenants/scala_spark/design/30-generated-odd-design.md`
- Declares feature authority `build_tenants/scala_spark/design/20-generated-feature-decomp.md`
- Declares `Total scenarios: 74`
- States that these are system-level technical scenarios distinct from UAT test cases
- Groups scenarios under `SCN-COMP`, `SCN-EXEC`, `SCN-ADJ`, `SCN-ACC`, and `SCN-FID`

TypeScript scenario artifact:
- Header: `# Scenario Surface`
- Declares product, version, tenant, edge, strategy, source asset types, target asset type, build contract, and test contract
- Writes to `build_tenants/scala_spark/design/scenario_surface.md`
- Organizes scenarios by 7 modules: `cdme-compiler`, `cdme-assurance`, `cdme-executor`, `cdme-adjoint`, `cdme-accounting`, `cdme-fidelity`, and `cdme-engine`
- Carries 77 scenario headings and 82 unique `REQ-*` refs
- Includes requirement trace register pressure from the TS obligation set

The content is plausible and broadly comparable. The mismatch is runtime-law and authority placement, not obvious scenario quality.

#### Findings For This Edge

1. Same-name traversal exists and produces a credible scenario surface.
2. Sequence placement after design matches Python, but TS still lacks the earlier UAT testcase traversal, so the scenario edge cannot retroactively prove UAT-before-design behavior.
3. TS closure is much more granular at the obligation-accounting layer: 445/445 fulfilled vs Python's one semantic convergence obligation.
4. The TS runtime archive closes the ledger but terminates with a non-progress classification and no vector closure event. That is not equivalent to Python's assessed/proof/closure/edge-converged lifecycle.
5. TS materialization tracking again omits the written artifact from `product_materialization_manifest.files`.
6. TS took 5m 59s for a single scenario traversal with no retries. That is slower than Python's average scenario attempt and more than double Python's final scenario attempt.

#### Parity Requirements Before Calling This Equivalent To Test35

This edge can be called behaviorally equivalent only if:

1. The runtime terminal state is reconciled: either emit normal `vector_evaluated`/`vector_closed` events for a closed edge, or type the non-progress marker as a separate post-close archive-inspection status that cannot contradict closure.
2. Scenario authority placement is declared: if TS scenario surfaces live under tenant design rather than `specification/scenarios`, downstream consumers must bind to that location explicitly.
3. Materialization tracking records the scenario output file or explicitly classifies design/scenario surfaces outside product-materialization manifests.
4. UAT testcase authority remains separate. This scenario edge cannot be used as the missing proof for Python `derive_uat_testcases_surface` unless the graph explicitly merges those contracts and preserves UAT-before-design pressure somewhere else.

### Traversal Comparison 6: Implementation Design Surface

Comparison anchor:
- Python traversal: `derive_implementation_design_surface`
- Python converged ledger used for parity: `.ai-workspace/fp_ledgers/derive_implementation_design_surface_20260419T103335367453.json`
- Python artifact: `build_tenants/scala_spark/design/40-generated-implementation-design.md`
- TypeScript traversal cluster: `derive_implementation_design_surface`
- TypeScript archives: `20260516T125518977Z_pid86360`, `20260516T130334637Z_pid86360`, `20260516T131517296Z_pid86360`
- TypeScript artifact: `build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md`

Conclusion: this is a same-name traversal with different pressure behavior. Python reached a 77/77 converged implementation-design ledger and then used that surface as the source for stack selection and implementation module derivation. TS required three attempts before close, with prompt context and handoff size expanding materially during retry. The TS edge eventually closes, but the retry shape shows the framework is spending significant effort repairing trace/obligation pressure before downstream code construction begins.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Source basis | `design_surface, scenario_surface` | `design_surface`, `scenario_surface`, TS authority snapshots, target carrier contract | Same broad source basis, but TS carries a larger typed authority bundle. |
| Target artifact | `build_tenants/scala_spark/design/40-generated-implementation-design.md` | `build_tenants/scala_spark/design/adrs/ADR-002-implementation-design-surface.md` | Both produce implementation-design content, but TS locates it as an ADR-style design artifact. |
| Python closure | 77 expected, 77 fulfilled, 0 missing, admitted, edge converged | n/a | Python closure is per-requirement F_P fulfillment. |
| TS attempts | n/a | block -> retry -> close | TS needed three attempts and over 41 minutes of worker time across the cluster. |
| TS final closure | n/a | attempt 10: `passed/passed/close`, worker `converged`, 445 obligations | TS closes more granularly but with much heavier obligation/accounting pressure. |
| Product materialization | Design artifact is the product of the traversal. | `productFilesWritten: 0`; design artifact tracked as a design surface, not materialized product file. | Same design-vs-product-file ambiguity seen in earlier TS edges remains. |

#### Events And Timing

Python event spine for `derive_implementation_design_surface`:

| Event type | Count |
|---|---:|
| `run_started` / `run_bound` / `vector_started` | 4 each |
| `graph_call_opened` | 4 |
| `fp_dispatched` | 2 |
| `assessed` | 300 |
| `proof_passed` / `closure_passed` / `edge_converged` | 3 each |
| `graph_call_failed` / `proof_failed` / `run_failed` | 1 each |

TypeScript attempts:

| Attempt | Archive | Worker elapsed | F_P status | Postflight | Closure | Prompt context bytes | Handoff bytes | Event bytes |
|---:|---|---:|---|---|---|---:|---:|---:|
| 8 | `20260516T125518977Z_pid86360` | 8m 15s | blocked | passed | block | 201,535 | 1,056,358 | 5,657,654 |
| 9 | `20260516T130334637Z_pid86360` | 11m 42s | blocked | passed | retry | 2,468,620 | 6,579,659 | 10,828,889 |
| 10 | `20260516T131517296Z_pid86360` | 21m 55s | passed | passed | close | 1,646,123 | 8,431,338 | 18,262,802 |

#### Ledgers Used

Python:
- Manifest `derive_implementation_design_surface_20260419T103335367453.json` uses source assets `design_surface,scenario_surface`.
- Manifest declares 77 fulfillment obligations and one failing evaluator.
- Fulfillment ledger records 77 expected, 77 fulfilled, 0 missing, admitted, edge converged.
- Result assessments cite `build_tenants/scala_spark/design/40-generated-implementation-design.md#req-*`.

TypeScript:
- `sdlc_edge_fulfillment_ledger.json` for final attempt records target carrier admission and 445 requirement obligations.
- `sdlc_edge_closure_decision.json` for final attempt records `close`.
- The retry attempts carry large gap dossier and prompt context pressure, culminating in a final close.
- Worker process telemetry on the final close includes 211 `actor_process_stream_observed`, 43 heartbeats, 255 runtime activity probes, and normal actor process exit.

#### Artifact Comparison

Python implementation design:
- Focuses on modules and implementation responsibilities tied directly to requirement IDs.
- Feeds explicit downstream stack selection and implementation module derivation.
- The same requirement obligation inventory carries forward into module and code ledgers.

TypeScript implementation design:
- Lives as ADR `ADR-002-implementation-design-surface.md`.
- Feeds the later `derive_component_code_surface`, `qualify_component_realization_surface`, and `derive_code_surface` split.
- Carries enough authority to continue, but it did not avoid later code/test repair churn.

#### Findings For This Edge

1. Same-name traversal exists and eventually closes.
2. TS took three attempts and much larger package surfaces to reach a close.
3. Python's implementation design immediately supports explicit stack and module traversals; TS proceeds into component code generation without an observed stack-profile edge.
4. TS typed closure is stronger mechanically, but the prompt/sidecar bloat suggests the worker is repairing framework trace pressure as much as constructing implementation design.
5. The TS final close is usable for continuing the comparison, but not yet evidence that the TS graph has recovered test35's lean implementation-design behavior.

### Traversal Comparison 7: Implementation Stack And Module Surface

Comparison anchor:
- Python traversals: `select_implementation_stack_profile`, `derive_implementation_module_surface`
- Python artifacts: `build_tenants/scala_spark/design/40-generated-implementation-stack.md`, `build_tenants/scala_spark/design/40-generated-implementation-modules.md`
- TypeScript nearest edges: none for stack selection; partial coverage across `derive_component_code_surface`, `qualify_component_realization_surface`, and `derive_code_surface`

Conclusion: Python has explicit stack and module traversals. TS has no observed same-contract stack selection or implementation module surface. The corresponding decisions are embedded in product materialization policy, traversal intent, execution shards, declared modules, and worker prompt directives. That is a real mapping gap, not just a naming difference.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Stack selection edge | `select_implementation_stack_profile` | none observed | TS makes Scala/SBT tenant selection through package/config state, not through a graph edge with its own fulfillment ledger. |
| Stack closure | 1 expected, 1 fulfilled, edge converged | n/a | Python records stack choice as an explicit admitted artifact. |
| Module derivation edge | `derive_implementation_module_surface` | none clean; partially implicit in component code and qualification edges | TS skips a direct implementation module surface and proceeds to component code materialization. |
| Module closure | 77 expected, 77 fulfilled, edge converged | n/a | Python carries one requirement-obligation ledger through the module design. |
| TS substitute | n/a | declared modules: `cdme-compiler`, `cdme-assurance`, `cdme-executor`, `cdme-adjoint`, `cdme-accounting`, `cdme-fidelity`, `cdme-engine` | The module set exists, but not as an admitted module-surface traversal. |

#### Events And Ledgers

Python `select_implementation_stack_profile`:
- 2 runs, 2 graph calls, 2 proof/closure/edge convergence events.
- Ledger: 1 expected, 1 fulfilled, admitted, edge converged.
- Evidence refs include implementation stack and implementation design artifacts.

Python `derive_implementation_module_surface`:
- 3 runs, 3 graph calls, 219 assessed events, 3 proof/closure/edge convergence events.
- Ledger: 77 expected, 77 fulfilled, 0 missing, admitted, edge converged.
- Evidence refs include `40-generated-implementation-modules.md` and concrete Scala module/source paths.

TypeScript:
- No direct operator archive for either edge.
- Module and stack truth is visible inside `worker_prompt.md`, `worker_invocation_package.json`, `traversal_intent_package.json`, and product file targets.
- Because it is embedded, downstream comparison must treat TS code construction as a split replacement for Python stack/module/code, not as a single same-edge equivalent.

#### Findings For This Edge

1. TS currently lacks an explicit stack-profile traversal.
2. TS currently lacks an explicit implementation-module traversal.
3. The module set exists in TS, but as package truth rather than an artifact with its own admitted fulfillment ledger.
4. This may reduce graph edges, but it also removes two places where Python test35 preserved construction state before code generation.
5. If TS intentionally consolidates these stages, the consolidation needs an explicit graph/overlay contract stating where stack and module selection pressure is preserved.

### Traversal Comparison 8: Code Surface And Component Realization Split

Comparison anchor:
- Python traversal: `derive_code_surface`
- Python converged ledger: `.ai-workspace/fp_ledgers/derive_code_surface_20260419T121644750776Z.json`
- Python source artifacts: implementation module surface and implementation stack profile
- TypeScript split: `derive_component_code_surface`, `qualify_component_realization_surface`, `derive_code_surface`
- TypeScript archives: `20260516T133713285Z_pid86360` through `20260516T143041411Z_pid86360`

Conclusion: this is not a same-edge comparison. Python's `derive_code_surface` is the primary code construction traversal and closes 77 requirement obligations against generated Scala files. TS does most code construction in `derive_component_code_surface`, repairs/qualifies through `qualify_component_realization_surface`, then closes a same-name `derive_code_surface` rollup with zero product files written. The same-name TS edge is a rollup/closure surface, not the code-construction surface.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Code construction edge | `derive_code_surface` | `derive_component_code_surface` | TS moved the constructive work to a component edge. |
| Intermediate qualification | none as separate edge | `qualify_component_realization_surface` | TS adds a separate qualification stage with two repairs before close. |
| Rollup edge | same `derive_code_surface` edge is constructive | `derive_code_surface` rollup writes 0 product files | Same name, different function. |
| Python closure | 77 expected, 77 fulfilled, edge converged | n/a | Python code ledger maps requirements to concrete Scala source evidence. |
| TS component closure | n/a | 453 obligations; yield -> repair -> close; 20 product files | More granular, but more fragile and slower. |
| TS rollup closure | n/a | 445 obligations; repair -> close; 0 product files | Rollup closes after product files were already generated elsewhere. |

#### Events And Timing

Python `derive_code_surface`:
- 16 runs, 16 graph-call openings, 14 closures, 14 `edge_converged` events.
- 1066 assessed events.
- One graph call and one run failed, but pressure survived and later attempts closed.
- Final converged ledger records 77 expected, 77 fulfilled, 0 missing, admitted, edge converged.

TypeScript code cluster:

| Attempt | Edge | Archive | Worker elapsed | F_P status | Postflight | Closure | Product files | Prompt context bytes | Handoff bytes |
|---:|---|---|---:|---|---|---|---:|---:|---:|
| 11 | `derive_component_code_surface` | `20260516T133713285Z_pid86360` | 20m 34s | blocked | blocked | yield | 20 | 164,220 | 1,002,434 |
| 12 | `derive_component_code_surface` | `20260516T135747788Z_pid86360` | 8m 18s | blocked | passed | repair | 20 | 200,288 | 1,257,161 |
| 13 | `derive_component_code_surface` | `20260516T140607347Z_pid86360` | 6m 52s | passed | passed | close | 20 | 3,574,928 | 8,450,876 |
| 14 | `qualify_component_realization_surface` | `20260516T141301721Z_pid86360` | 5m 38s | blocked | blocked | repair | 49 | 136,579 | 995,480 |
| 15 | `qualify_component_realization_surface` | `20260516T141840316Z_pid86360` | 4m 05s | blocked | passed | repair | 0 | 155,447 | 1,286,388 |
| 16 | `qualify_component_realization_surface` | `20260516T142246041Z_pid86360` | 3m 26s | passed | passed | close | 0 | 889,978 | 5,074,664 |
| 17 | `derive_code_surface` | `20260516T142612433Z_pid86360` | 4m 29s | blocked | passed | repair | 0 | 132,055 | 995,018 |
| 18 | `derive_code_surface` | `20260516T143041411Z_pid86360` | 7m 32s | passed | passed | close | 0 | 3,947,710 | 8,196,878 |

#### Product File Comparison

Python code surface produces a broad Scala implementation across accounting, adjoint, assurance, compiler, engine, executor, and fidelity modules. Examples from the final fulfillment assessments:
- `cdme-accounting/src/main/scala/cdme/accounting/AccountingVerifier.scala`
- `cdme-accounting/src/main/scala/cdme/accounting/LedgerWriter.scala`
- `cdme-adjoint/src/main/scala/cdme/adjoint/AdjointRegistry.scala`
- `cdme-adjoint/src/main/scala/cdme/adjoint/AdjointCompiler.scala`
- `cdme-executor/src/main/scala/cdme/executor/ResidueCollector.scala`
- `cdme-engine/src/main/scala/cdme/engine/domain/DomainTypes.scala`

TS component code final close writes 20 declared product files:
- `build.sbt`
- `project/build.properties`
- `project/plugins.sbt`
- `cdme-accounting/src/main/scala/cdme/accounting/AccountingInvariant.scala`
- `cdme-adjoint/src/main/scala/cdme/adjoint/AdjointEngine.scala`
- `cdme-assurance/src/main/scala/cdme/assurance/AssuranceGate.scala`
- `cdme-compiler/src/main/scala/cdme/compiler/TopologicalCompiler.scala`
- `cdme-engine/src/main/scala/cdme/engine/CdmeEngine.scala`
- `cdme-executor/src/main/scala/cdme/executor/MorphismExecutor.scala`
- `cdme-fidelity/src/main/scala/cdme/fidelity/FidelityService.scala`
- plus first-pass test files that later get expanded by `derive_component_test_surface`.

The current TS implementation is much smaller than Python test35:
- Python has dozens of source files and test files across module subpackages and domain subdirectories.
- TS currently has a compact implementation set, with many concepts represented in fewer files.
- That may be acceptable for a different product cut, but it is not yet test35-equivalent behavior.

#### Ledgers Used

Python:
- The final `derive_code_surface` ledger records 77/77 fulfilled and edge converged.
- Each fulfillment assessment names a requirement id and concrete Scala file evidence.
- Execution evidence comes later, but code closure already ties content to requirement obligations.

TypeScript:
- `derive_component_code_surface` closes with 453 obligations and 20 product files.
- `qualify_component_realization_surface` closes with 445 obligations after two repairs.
- `derive_code_surface` closes with 445 obligations and 0 product files, functioning as a rollup.
- Product materialization and closure are split across multiple ledgers, so the comparison must follow the split rather than only the same-name edge.

#### Findings For This Edge

1. TS code construction is materially split, while Python code construction is concentrated in `derive_code_surface`.
2. TS generated usable Scala/SBT product files, but at smaller breadth than Python test35.
3. TS needed yield/repair/qualification stages before code rollup closed.
4. The same-name `derive_code_surface` is not the constructive equivalent of Python `derive_code_surface`.
5. The strongest TS evidence for code construction is attempt 13, not attempt 18.
6. Any future analyzer view must report "constructive edge" separately from "rollup edge"; otherwise the edge map hides where code actually came from.

### Traversal Comparison 9: Test Design And Component Test Surface

Comparison anchor:
- Python traversals: `derive_test_design_surface`, `select_test_stack_profile`, `derive_test_module_surface`
- Python artifacts: `build_tenants/scala_spark/design/40-generated-test-design.md`, `build_tenants/scala_spark/test_env/40-generated-test-stack.md`, `build_tenants/scala_spark/test_env/tests/40-generated-test-modules.md`
- TypeScript traversals: `derive_test_design_surface`, `derive_component_test_surface`
- TypeScript archives: `20260516T143814148Z_pid86360`, `20260516T150712014Z_pid86360`, `20260516T151730348Z_pid86360`, `20260516T154056100Z_pid86360`

Conclusion: TS has a same-name test design edge and a component test materialization edge, but it lacks Python's explicit test stack selection and test module traversal names. The current TS component test surface closed after a repair and wrote 14 test files. That is real progress toward test35, but it is still not the same path as Python's test design -> test stack -> test module -> test run archive -> execution result sequence.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Test design | `derive_test_design_surface`, 77/77 fulfilled | `derive_test_design_surface`, block then close | Same-name edge exists, but TS had a failed/blocked first attempt before close. |
| Test stack | `select_test_stack_profile`, 1/1 fulfilled | none observed | TS encodes SBT/test contract in packages rather than a graph edge. |
| Test module | `derive_test_module_surface`, 77/77 fulfilled | `derive_component_test_surface`, repair then close | TS materializes component tests directly. |
| Python test run archive | `derive_test_run_archive_surface` | none yet | TS has not yet reached test archive behavior in the observed run. |
| Python execution result | `derive_test_execution_result_surface` | none yet | TS is currently preparing test execution, not admitting execution result. |

#### Events And Timing

Python:
- `derive_test_design_surface`: 219 assessed events, 3 closures, 3 edge convergences, 77/77 final ledger.
- `select_test_stack_profile`: 2 assessed events, 2 closures, 1/1 final ledger.
- `derive_test_module_surface`: 219 assessed events, 3 closures, 3 edge convergences, 77/77 final ledger.

TypeScript:

| Attempt | Edge | Archive | Worker elapsed | F_P status | Postflight | Closure | Product files | Prompt context bytes | Handoff bytes |
|---:|---|---|---:|---|---|---|---:|---:|---:|
| 19 | `derive_test_design_surface` | `20260516T143814148Z_pid86360` | 28m 58s | n/a | n/a | block | 0 | 167,433 | 1,037,225 |
| 20 | `derive_test_design_surface` | `20260516T150712014Z_pid86360` | 10m 18s | passed | passed | close | 0 | 183,703 | 1,075,903 |
| 21 | `derive_component_test_surface` | `20260516T151730348Z_pid86360` | 23m 22s | blocked | passed | repair | 14 | 135,174 | 1,012,680 |
| 22 | `derive_component_test_surface` | `20260516T154056100Z_pid86360` | 10m 33s | passed | passed | close | 14 | 2,760,524 | 7,157,157 |

#### Product Test Files

TS `derive_component_test_surface` final close writes 14 test files:
- `cdme-accounting/src/test/scala/cdme/accounting/AccountingInvariantSpec.scala`
- `cdme-adjoint/src/test/scala/cdme/adjoint/AdjointLawsSpec.scala`
- `cdme-adjoint/src/test/scala/cdme/adjoint/BackwardTraversalEngineSpec.scala`
- `cdme-adjoint/src/test/scala/cdme/adjoint/ReconciliationAndImpactSpec.scala`
- `cdme-assurance/src/test/scala/cdme/assurance/AssuranceGateSpec.scala`
- `cdme-compiler/src/test/scala/cdme/compiler/AdjointAndCostSpec.scala`
- `cdme-compiler/src/test/scala/cdme/compiler/GrainAndAccessSpec.scala`
- `cdme-compiler/src/test/scala/cdme/compiler/PathVerifierSpec.scala`
- `cdme-compiler/src/test/scala/cdme/compiler/SheafManagerSpec.scala`
- `cdme-compiler/src/test/scala/cdme/compiler/TypeUnifierSpec.scala`
- `cdme-engine/src/test/scala/cdme/engine/CdmeEngineIntegrationSpec.scala`
- `cdme-engine/src/test/scala/cdme/engine/CdmeEngineUATSpec.scala`
- `cdme-executor/src/test/scala/cdme/executor/MorphismExecutorSpec.scala`
- `cdme-fidelity/src/test/scala/cdme/fidelity/FidelityAndDQSpec.scala`

Python test module surface eventually leads to a much broader executed suite:
- `build_tenants/scala_spark/test_env/50-generated-run-archive.md` records `sbt test` passed.
- The run archive records 80/80 test cases and 181/181 ScalaTest methods passed.
- Target test reports exist under module `target/test-reports/TEST-*.xml`.

TS has test files but no admitted execution result yet. Therefore this edge proves test materialization, not test success.

#### Ledgers Used

Python:
- `derive_test_design_surface`: 77 expected, 77 fulfilled, edge converged.
- `select_test_stack_profile`: 1 expected, 1 fulfilled, edge converged.
- `derive_test_module_surface`: 77 expected, 77 fulfilled, edge converged.
- Later test archive and execution result ledgers provide the execution-backed closure that makes test35 the gold standard.

TypeScript:
- `derive_test_design_surface` final close records 445 obligations and no product files.
- `derive_component_test_surface` first attempt records 454 obligations, 441 fulfilled, repair.
- `derive_component_test_surface` final close records 454 fulfilled and 14 product files.
- The final component test close is real test materialization evidence but not execution evidence.

#### Findings For This Edge

1. TS has now generated test files; the earlier "no test files" concern is no longer true for this run state.
2. TS component test materialization required repair, so the first construction pass was not sufficient.
3. TS lacks explicit test stack selection as a graph traversal.
4. TS lacks Python's `derive_test_module_surface` name but has a partial functional replacement in `derive_component_test_surface`.
5. Until TS runs the tests and admits execution evidence, it remains behind test35's closure standard.

### Traversal Comparison 10: Test Execution Preparation Surface

Comparison anchor:
- Python traversal: `prepare_test_execution_surface`
- Python follow-on: `derive_test_execution_result_surface`
- Python artifacts: `docs/47-generated-test-execution.md`, `docs/48-generated-test-execution-result.md`, `build_tenants/scala_spark/test_env/50-generated-run-archive.md`
- TypeScript traversal: `prepare_test_execution_surface`
- TypeScript archives: `20260516T155133215Z_pid86360`, `20260516T160014195Z_pid86360`, `20260516T160450822Z_pid86360`
- Current TS cursor at snapshot time: `20260516T160450822Z_pid86360`, in-flight retry

Conclusion: TS has reached the execution-preparation lane but has not closed it. Python test35 used this stage to prepare execution and then admitted actual `sbt test` evidence through `derive_test_execution_result_surface`. TS is currently retrying because execution preparation still has blocked requirement trace and assurance pressure, especially around `REQ-COV-007`, `REQ-DQ-002`, and `REQ-DQ-003` variants.

| Dimension | Python `test35` | TypeScript `test72.TS.cl` | Comparison finding |
|---|---|---|---|
| Execution prep edge | `prepare_test_execution_surface` | `prepare_test_execution_surface` | Same-name/nearest functional edge exists. |
| Python prep closure | 1 expected, 1 fulfilled, edge converged | n/a | Python prep is a compact execution-lane admission. |
| TS prep attempts | n/a | retry -> repair -> in-flight retry | TS has not yet closed execution prep. |
| Execution result | `derive_test_execution_result_surface`, 1/1 fulfilled, edge converged | none observed yet | TS has not admitted actual execution result evidence. |
| Runtime command evidence | `sbt test` passed in run archive | not yet observed as admitted execution result | This is the key remaining gap to test35 behavior. |

#### Events And Timing

Python:
- `prepare_test_execution_surface`: 1 run, 1 graph call, 1 assessment, 1 proof/closure/edge convergence.
- `derive_test_execution_result_surface`: 1 run, 1 graph call, 1 assessment, 1 proof/closure/edge convergence.
- The run archive records `sbt test` passed, 80/80 test cases, and 181/181 ScalaTest methods.

TypeScript:

| Attempt | Archive | Worker elapsed | F_P status | Postflight | Closure | Prompt context bytes | Handoff bytes | Current meaning |
|---:|---|---:|---|---|---|---:|---:|---|
| 23 | `20260516T155133215Z_pid86360` | 8m 41s | blocked | blocked | retry | 139,922 | 1,000,480 | First execution-prep attempt failed both F_P evaluation and postflight. |
| 24 | `20260516T160014195Z_pid86360` | 4m 36s | blocked | passed | repair | 154,903 | 1,051,378 | Worker exited and postflight passed, but fulfillment did not converge. |
| 25 | `20260516T160450822Z_pid86360` | in-flight at snapshot | n/a | n/a | none yet | 2,526,037 | 6,666,132 | Active retry with 39 current evaluated gap reasons. |

Current active TS worker prompt states:
- edge: `prepare_test_execution_surface`
- target: `test_execution_surface`
- materialization: `not_required`
- output: `.ai-workspace/runtime/odd_sdlc/assets/20260516T160450822Z_pid86360/test_execution_surface.md`
- prior defect count omitted: 33
- current evaluated gap reason count: 39
- product materialization not required
- do not write product source/test files

#### Current TS Gap Pressure

The in-flight retry prompt cites current evaluated gaps from `20260516T160014195Z_pid86360/gap_dossier.json`. The visible blockers include:

| Gap family | Visible reason |
|---|---|
| `REQ-COV-007` | obligation blocked; requirement trace not observed |
| `REQ-DQ-002` | obligation blocked; requirement trace not observed |
| `REQ-DQ-003` | obligation blocked; requirement trace not observed |
| Stage-specific duplicates | same blockers repeated for stage 05 coverage, stage 07 DQ, stage 11 integration, stage 12 LDM, stage 15 traversal, and stage 16 typing requirement aliases |
| Re-entry class | mix of `same_edge_retry` and `repair_worker_output` |

Attempt 24 ledger/closure state:
- `sdlc_edge_fulfillment_ledger.json`: admitted true, target carrier admitted, edge converged false, fulfillment converged false.
- `sdlc_edge_closure_decision.json`: disposition `repair`, target carrier admitted, 707 reason refs.
- `worker_run.json`: status 0, elapsed 276,326 ms.
- `worker_result_report.json`: framework-generated post-transform report for `prepare_test_execution_surface`.

That is useful pressure preservation: TS did not falsely close execution prep. It carried the gap into the next retry prompt. The concern is cost and duplication: the retry prompt has a 2.5 MB prompt context and a 6.6 MB handoff bundle before actual execution-result admission has happened.

#### Ledgers Used

Python:
- `prepare_test_execution_surface_20260418T224751026594Z.json`: 1 expected, 1 fulfilled, edge converged.
- `derive_test_execution_result_surface_20260418T225115194587Z.json`: 1 expected, 1 fulfilled, edge converged.
- Execution evidence is concrete and product-relevant: run archive plus test pass counts.

TypeScript:
- Attempt 23: 445 obligations, 432 fulfilled, retry.
- Attempt 24: 445 obligations, 432 fulfilled, repair.
- Attempt 25: in-flight, no close artifacts at snapshot.
- No TS `derive_test_execution_result_surface` edge has been observed yet.

#### Findings For This Edge

1. TS has reached the execution-preparation phase, which is the correct next comparison point after test materialization.
2. TS is not yet at test35 execution evidence. It is still preparing or repairing the execution surface.
3. The current retry is framework-induced pressure around requirement trace observability, not product ambiguity about how to run SBT.
4. The system correctly avoided false close on attempts 23 and 24.
5. The retry pressure is expensive and duplicated across requirement alias families.
6. The next decisive comparison is whether TS actually runs the declared `sbt test` contract and admits the result as execution evidence, not merely whether `prepare_test_execution_surface` closes.

#### Parity Requirements Before Calling This Equivalent To Test35

This part of the run can be called test35-equivalent only after:

1. `prepare_test_execution_surface` closes without residual requirement-trace pressure.
2. A TS execution-result edge or equivalent admitted event records the actual command run.
3. The evidence surface records pass/fail, test counts, and log/archive paths.
4. The fulfillment ledger ties execution evidence back to requirement obligations.
5. The release or final closure surface consumes that execution evidence rather than only design/test-file materialization.

### Refactor Priority Order: Test35 Features To Bring Into Test72

This is a value-ordered list. Highest value means the feature most directly restores the behavior that made `test35` trustworthy: execution-backed F_P closure over durable ledgers, with pressure preserved across attempts. Some lower rows are prerequisites for efficient implementation, but they do not outrank execution-backed closure in product value.

| Priority | Test35 feature | Why it is high value | Current `test72.TS.cl` gap | Refactor direction for test72 | Acceptance signal |
|---:|---|---|---|---|---|
| 1 | Execution evidence as closure authority | `test35` only becomes gold-standard because `sbt test` is actually run and admitted into the evidence chain. Design/code/test-file generation is not enough. | TS has generated test files and reached `prepare_test_execution_surface`, but no observed `derive_test_execution_result_surface` or equivalent admitted execution result exists yet. | Add/repair the execution lane so TS runs the declared build/test contract, captures logs/archive/test counts, admits the result, and makes final closure consume that evidence. | A TS run archive records command, exit status, test counts, log paths, and the fulfillment ledger ties execution evidence to requirement obligations. |
| 2 | F_P fulfillment ledger owns close | In `test35`, content closure is driven by expected/fulfilled/missing obligation ledgers, not by carrier shape alone. This protects content from being replaced by formatting conformance. | TS ledgers exist, but several closures are dominated by target-carrier admission, requirement-trace mechanics, or rollup surfaces. Some same-name edges close without being the constructive edge. | Make every close-capable edge declare its F_P obligation source, expected set, fulfilled set, missing set, and evidence refs as the close authority. Target-carrier admission remains evidence admission, not content closure. | Close decisions name the F_P fulfillment ledger as the decisive predicate; target-carrier status is necessary but insufficient. |
| 3 | Residual pressure preservation and clearing predicate | `test35` repeatedly re-observes gaps and only clears pressure when the next admitted result justifies it. That is why failed attempts still converge later. | TS currently preserves pressure in retries, but the pressure is noisy, duplicated across aliases, and expensive; prior runs also showed pressure disappearing behind close projections. | Define one residual-pressure carrier with an explicit clearing predicate: pressure clears only when admitted evidence satisfies the implicated obligation. | A retry reduces or transforms pressure; it does not duplicate aliases indefinitely and does not clear without evidence. |
| 4 | Prompt construction as a coherent construction surface | `test35` uses one manifest-owned prompt as the worker's construction surface. The prompt carries current state, gap, source snapshots, output contract, and obligation policy together. | TS `worker_prompt.md` is a launcher over large sidecars. The worker must join many packages; prompt context can exceed MBs before product work begins. | Generate a compact construction brief from typed packages and make it the worker-facing primary prompt body. Sidecars remain authority refs, not the cognitive starting point. | `worker_prompt.md` or `construction_brief.md` includes current state, source snapshots, current gaps, output contract, success predicate, and sidecar index in one readable surface. |
| 5 | Explicit execution-test pipeline | `test35` has a sequence: UAT testcase surface -> test design -> test stack -> test module -> test run archive -> execution result. This is how tests and implementation co-affirm design interpretation. | TS has `derive_test_design_surface` and `derive_component_test_surface`, but no observed UAT edge, test stack edge, test run archive edge, or execution-result edge. | Refactor the TS graph so UAT/test design/test materialization/execution evidence are explicit graph products or are explicitly consolidated with preserved pressure and artifacts. | Analyzer shows a complete test pipeline from design-derived test cases through executed test evidence. |
| 6 | Early authority surfaces as F_P products | `test35` constructs intent/product/goal/requirement surfaces as explicit F_P traversals with ledgers. That prevents bootstrap conformance from silently creating content truth. | TS collapses early authority generation into `Fg_conform_project` and `Fg_conform_project_authority`; requirement files exist before a same-contract requirement traversal is proven. | Move content-bearing early authority construction out of conformance, or declare a consolidation edge that preserves the same F_P obligation and gap pressure. | Intent/product/goal/requirement content has explicit edge evidence, obligation ledger, and gap lineage before downstream design consumes it. |
| 7 | Canonical requirement identity and alias collapse | `test35` pressure works because obligations are stable enough to carry across attempts. TS retry pressure is inflated by duplicate canonical/stage aliases. | `prepare_test_execution_surface` retry shows 39 visible gap reasons around three requirement families, repeated across stage-specific aliases. | Normalize requirement identity before assurance/gap projection, and preserve alias provenance as metadata rather than duplicated pressure. | A single underlying requirement gap appears once with alias refs attached; retry prompts shrink without losing traceability. |
| 8 | Constructive edge vs rollup edge separation | `test35` `derive_code_surface` is the constructive code edge. In TS, `derive_component_code_surface` constructs files while `derive_code_surface` later closes as a rollup. | Same-name comparison is misleading: the TS code was produced earlier than the `derive_code_surface` close. | Teach graph declarations and analyzer output to distinguish constructive materialization edges from rollup/qualification edges. | Edge maps identify the constructive source of each product file and do not present rollup close as file construction. |
| 9 | Stack/profile and module surfaces as first-class state | `test35` explicitly selects implementation/test stack and derives implementation/test modules. These surfaces stabilize later code and test construction. | TS embeds stack/module choices in package config, execution shards, declared modules, and prompts. No same-contract graph edge exists. | Either restore stack/profile/module graph edges or define a consolidation contract that records the same decisions and closure evidence. | Stack and module decisions are queryable as admitted artifacts with refs, digests, and downstream consumers. |
| 10 | Runtime event lifecycle parity | `test35` emits assessed/proof/closure/edge-converged events repeatedly. The event spine shows exactly why a traversal closed. | TS archives sometimes show close artifacts plus non-progress classification, and some expected vector lifecycle events are absent from archive-level evidence. | Align TS event lifecycle names and projections so close, retry, repair, yield, and non-progress cannot contradict each other. | A closed TS edge has coherent event/projection truth: evaluated, admitted, closure decision, next action, and no contradictory terminal non-progress status. |
| 11 | Product materialization tracking for all artifact classes | `test35` makes design, code, test, run archive, and release artifacts visible as durable proof surfaces. | TS product materialization manifests often show `files: []` for design/rollup edges even when artifacts exist. | Define artifact classes explicitly: design artifact, product source, product test, execution archive, release surface. Track each in the right materialization/evidence surface. | Analyzer can list which edge wrote or admitted every important artifact, including design files and execution archives. |
| 12 | Timing and prompt-bundle observability | `test35` behavior can be explained by edge attempts, ledgers, and run archive evidence. TS currently needs ad hoc inspection to separate worker time, prompt bloat, postflight, and closure work. | Current comparisons require manual `analyze-run`, archive reads, prompt bundle size checks, and process checks. | Extend `analyze-run` with per-edge timing decomposition, prompt-bundle metrics, source-locality score, closure predicate, and constructive artifact lineage. | One analyzer report shows wall time, worker time, postflight time, prompt bundle size, gap count, closure basis, and artifact lineage per edge. |
| 13 | Breadth of generated implementation/test product | `test35` generated a broad Scala/SBT implementation and executed a broad ScalaTest suite. This is product capability, not only framework behavior. | TS currently has a smaller implementation and 14 materialized test files; that may be a valid smaller cut, but it is not test35-equivalent breadth. | After closure mechanics are correct, use execution feedback to expand or refine product breadth where real test failures or missing obligations require it. | Product breadth grows from execution-driven obligation pressure, not from preemptive file-count chasing. |

Recommended refactor sequence:

1. Land execution evidence admission first, even if the first execution fails. A failing executed test is higher value than another closed design surface because it creates the right pressure.
2. Tighten F_P fulfillment-ledger closure and residual pressure semantics around that execution lane.
3. Replace prompt launcher behavior with a generated construction brief so retries repair the actual gap instead of decoding package sprawl.
4. Restore or explicitly consolidate the missing graph products: UAT, stack/profile, modules, test archive, execution result.
5. Add analyzer views so every later comparison is derived mechanically instead of reconstructed by hand.

### Current Documentation Boundary

This comparison is now documented up to the TS in-flight edge observed at the snapshot:

`prepare_test_execution_surface` attempt `20260516T160450822Z_pid86360`.

The next update should start from whichever edge follows this retry:

1. If `prepare_test_execution_surface` closes, document its final ledger and whether it selected an execution-result edge.
2. If it retries again, document whether the same 39 gap reasons were reduced, duplicated, or transformed.
3. If TS reaches execution, compare the resulting run archive directly against Python `build_tenants/scala_spark/test_env/50-generated-run-archive.md`.
