# REVIEW: ABIogenesis 5.0 C2, CLI, And odd_glc Breakdown

**Author**: codex
**Date**: 2026-09-03T01:13:22Z
**Current as of**: 2026-09-03 Australia/Sydney
**Addresses**: ABIogenesis 5.0 C0-C3 status, the C2 Worker/helper boundary, CLI terminology, and the retained odd_glc fifth basic-cli failure
**Exact C2 design subject**: SHA-256 `f7075c286d33e6b95ae5a3481e5900e45052f65f8d434f6ee09039d29d7a12fe`
**Status**: Open
**Classification**: Commentary/read model; not specification, requirement, design, ticket, implementation, or release authority

## Summary

ABIogenesis 5.0 has a substantial working GTL/HoG/ABG/Public substrate. C0, C1, and C3 are implemented; C3 is independently qualified. The existing C2 also works mechanically, but live odd_glc evidence exposed a helper-path authority bug. The corrected C2 design is now independently reviewed GO; its implementation has not yet been selected. Consequently, odd_glc remains at 0/7 accepted scenarios on the new chain.

This is a read-only design and delivery report from the current authority and evidence surfaces.

## 1. Design state versus implementation state

The amended C2 subject is frozen at SHA-256 `f7075c286d33e6b95ae5a3481e5900e45052f65f8d434f6ee09039d29d7a12fe`. Independent review of those exact bytes returned GO with P0/P1/P2 all zero. Its implementation and evidence work remain unselected pending Executive acceptance and an explicit I/E selection.

The frozen authority text literally says “pending independent review” because that wording is part of the exact bytes the Reviewer assessed; the later Reviewer return is evidence about that frozen subject, not permission to rewrite it in place. [GOALS.md](/Users/jim/src/apps/abiogenesis/specification/GOALS.md:105), [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:3), [T-287](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md:178)

The source tree still realizes the prior accepted, relay-repaired C2 design:

- It gives the Worker three path flags: `--task`, `--artifact`, and `--sandbox`. [product implementation](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/worksite_command_execution.ts:434)
- `task.json` is currently the bare Product task, not the amended attempt-bound launch envelope. [execution implementation](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_execution.ts:203)
- The helper accepts those three independently supplied paths and immediately reads/uses them. [helper](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_helper.ts:968)
- The Worker prompt also exposes the expected helper artifact path in prose. [prompt renderer](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/product/worksite_command_execution.ts:1605)
- `exactExchange` checks the observed tool call only after the Worker returns. [execution implementation](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/code/src/implementation/worksite_command_execution.ts:79)

That implementation is accepted predecessor evidence, but it does not satisfy the amended helper-locus design. The new design exists precisely because downstream evidence showed that the late `exactExchange` gate could reject a changed command only after the changed command had already caused helper effects.

C3 is different: its design and I/E are completed and independently qualified. Its frozen design document still contains pre-review header wording, but the higher current authority records the accepted and qualified disposition. [GOALS.md](/Users/jim/src/apps/abiogenesis/specification/GOALS.md:127), [design index](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/README.md:115)

## 2. C0, C1, C2, and C3 are not a simple numbered pipeline

The actual composition is:

```text
single construction:
C1
  -> C0 × target count
  -> one WorksiteConstructionResult
  -> C2 execution observation

branched construction:
C3
  -> C1 × branch count
       -> C0 × each branch's target count
  -> one flattened WorksiteConstructionResult
  -> C2 execution observation
```

| Child | Meaning | Current state |
|---|---|---|
| C0 | The deterministic physical-effect atom: revalidate `O0`, atomically replace one authorized file, produce receipt and `O1`, admit the effect through ABG, then reconstruct `O1` by replay. | Accepted and implemented/evidenced. |
| C1 | One live probabilistic construction. A Worker supplies replacement bytes only; deterministic Product code binds them to caller-owned targets; C0 performs the actual writes; a reducer returns one `WorksiteConstructionResult`. | Implemented bounded predecessor. |
| C2 | A sibling execution-observation GraphFunction. It consumes the exact admitted C1-root or C3-reducer result, snapshots the constructed files, executes owner-authored validation commands/probes, and admits mechanical observations. It does not write the Product worksite or decide downstream success. | Prior realization accepted; helper-locus amendment currently design-only. |
| C3 | A generic branch aggregate over C1. It validates an ordered dependency DAG and disjoint targets, traverses C1 branches serially, preserves partial-stop truth, authenticates fan-in, and flattens successful branch results into the existing C1 result contract. | Implemented and independently qualified. |

C0’s exact causal relation is stated at [C0 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md:16). C1’s composition through C0 is at [C1 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md:21). C3’s branch topology is at [C3 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md:50). C2 explicitly declares itself a sibling that consumes either the C1 root or C3 reducer at [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:26).

Key authority separation:

- C1 constructs bytes.
- C0 alone mutates the worksite.
- C3 aggregates multiple C1 constructions.
- C2 observes execution against a snapshot.
- odd_glc decides whether those observations satisfy its scenario.
- ABG admits and replays what happened; neither the Worker nor odd_glc invents runtime truth.

## 3. “CLI” refers to five distinct surfaces

| Surface | Exact meaning |
|---|---|
| Public `abg.cli` | The installed JSONL command shell over the same SDK and Public operations. It may parse, invoke, and render those contracts, but may not call Workers directly, emit events, manage retry, or decide closure. [PRODUCT.md](/Users/jim/src/apps/abiogenesis/specification/PRODUCT.md:599), [REQ-P-POLICY](/Users/jim/src/apps/abiogenesis/specification/requirements/product/REQ-P-POLICY.md:311) |
| `abg.codex` | A bounded host compatibility delegator to the exact installed `abg.cli`. It owns no copied Product semantics, runtime, or Worker authority. |
| Claude CLI | The external process transport used for a governed `F_P` Worker invocation. ABG supervises and records it; Claude does not become the Program, traversal, event, or closure owner. |
| C2 helper invocation | The private, Worker-visible one-Bash validation call into the installed ABI helper. This is the surface being redesigned. |
| odd_glc `basic-cli` | The downstream generated Node CLI subject: a dependency-free Hello World program plus component and user-acceptance tests. |

The current redesign concerns only the C2 helper invocation. It does not redesign public `abg.cli`, `abg.codex`, Claude transport, or the generated odd_glc command-line Product.

The amended helper invocation is:

```text
node <installed ABI helper> --task <launch-manifest>
```

## 4. odd_glc repository structure

odd_glc is the downstream Product and interpretation owner. Its relevant structure is:

| Surface | Role |
|---|---|
| [`specification/`](/Users/jim/src/apps/odd_glc/specification/) | Product WHAT. |
| [`build_tenants/common/design/`](/Users/jim/src/apps/odd_glc/build_tenants/common/design/) | T-043 realization HOW. |
| [`build_tenants/odd_glc/typescript/product/`](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/product/) | Zero-code Product manifest and contracts. |
| [`build_tenants/odd_glc/typescript/src/`](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/src/) | Retained ABI 4.6 route-one declarations and read/query predecessor; it is not the current ABI 5.0 delivery-status authority. |
| [`build_tenants/odd_glc/typescript/test/fixtures/`](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/fixtures/) | Declarative generic workflow scenarios. |
| [`generic-live-workflow-support.mjs`](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/generic-live-workflow-support.mjs) | ABI 5.0 install, bind, catalog, C1, C2, and fresh-replay integration support. |
| [`test_runs/generic-live-workflow/`](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/) | Retained live evidence and postmortem roots. |

odd_glc owns domain interpretation. It never owns ABI execution, admission, replay, or C3 fan-in.

## 5. odd_glc live path and seven-scenario matrix

The intended live path is:

```text
scenario declaration
  -> verify and install exact ABI artifact
  -> WorkspaceBinding
  -> CatalogView
  -> public C1 construction
  -> fresh replay
  -> owner-derived source-result basis
  -> public C2 execution observation
  -> fresh replay
  -> odd_glc interpretation
  -> independent Reviewer
  -> Executive disposition
```

| Scenario | Territories / files | Product slice and status |
|---|---:|---|
| `basic-cli` | 2 / 3 | Node CLI plus two tests. Latest retained run passed semantically, but ABI admission correctly refused the moved helper locus; not accepted. |
| `js-tenant-test` | 2 / 4 | JavaScript tenant test slice; not yet run through the accepted chain. |
| `js-sdlc-bootstrap` | 2 / 4 | JavaScript SDLC bootstrap slice; not yet run through the accepted chain. |
| `rust-cli` | 2 / 4 | Rust command-line slice; not yet run through the accepted chain. |
| `rust-service` | 2 / 3 | Rust service slice; not yet run through the accepted chain. |
| `parallel-js` | 5 / 6 | Topology-dependent branch construction; requires C3 projection into the odd_glc integration. |
| `data-mapper-full` | 9 / 22 | SBT build, eight reports, and at least 20 tests; requires C3 projection into the odd_glc integration. |

Current acceptance is 0/7. Historical host-validation accepts do not count as acceptance under the new installed public C1→C2/C3→C2 chain.

C3 is necessary for the last two scenarios because the current support flattens branch targets into paths. A flat path list cannot prove branch identity, dependency order, disjoint branch authority, independently admitted per-branch results, authenticated fan-in, or exact partial-stop behavior.

## 6. What the C2 helper path does

The complete intended relation is:

| Stage | Carrier/owner | Purpose |
|---|---|---|
| Source | Owner-derived `ProductInvocationSourceResultBasis` | Proves C2 is causally consuming the exact admitted C1 root or C3 reducer result, including its run, graph call, result admission, replay identity, workspace, and binding. |
| Product task | `WorksiteCommandExecutionTask` | Carries protected constructed files, exact owner-authored commands, environment, timeouts, predicates, and allowed evidence-write territories. |
| ABI plan | `WorksiteCommandExecutionHelperPlan` | Privately derives the attempt root, launch manifest, `result.json`, sandbox, helper/package coordinates, and exact expected tool-input digest. |
| Launch envelope | private canonical `task.json` | Binds the Product task to the exact leaf occurrence, attempt ref/digest, installed helper/package, and canonical archive locus. |
| Worker | one `worker_executes` `F_P` actor | Makes exactly one Bash call with the exact helper and launch-manifest path. It does not author paths, commands, predicates, or success meaning. |
| Helper preflight | installed ABI helper | Strictly validates argv, envelope bytes/schema/ref/digest, embedded task, occurrence, attempt, helper/package, actual canonical path, no symlink/alias/escape, and absent derived siblings before any protected-file read or command effect. |
| Sandbox | helper-derived sibling directory | Contains an immutable snapshot of the protected C1/C3 result. Declared commands and probes execute here, not in the original Product tree. |
| Helper artifact | helper-derived `result.json` | Full canonical mechanical record: commands, streams, exit/timeout/signal truth, reports, predicates, snapshot members, protected before/after observations, worksite delta, and Product delta. |
| Worker result | bounded projection | Echoes only helper-produced command and predicate rows. It does not replace the full helper artifact. |
| `exactExchange` | Product completion gate | Confirms the Worker made exactly the planned Bash call with the correct identity/cardinality. Altered or composite Bash input refuses. |
| Product observation | `WorksiteCommandExecutionObservation` | Joins the exact exchange, full helper artifact, Worker projection, protected observations, source result, and private plan. |
| ABG | existing C-call/run lifecycle | Admits result and judgment, closes or stops the run, and makes the same observation reconstructable from fresh replay. |

The launch-envelope/path law is detailed at [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:99). The exact Worker/helper join is at [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:184). The lifecycle/replay relation is at [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:296).

There are four different “results” that should not be blurred:

- the C1/C3 `WorksiteConstructionResult`, which is C2’s source;
- the small `WorksiteCommandExecutionWorkerResult`, which is the Worker’s relay;
- the full helper artifact at `result.json`;
- the admitted C2 `WorksiteCommandExecutionObservation`, carried inside the ordinary ABG result/replay lifecycle.

C2 intentionally admits observation, not odd_glc success. A non-zero subject-command exit is still valid observation truth. The downstream Product interprets it. [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:251), [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:292)

## 7. The fifth retained run and the exact defect

The planned helper command placed all three files under the exact attempt directory:

```text
.../<taskDigest>/<attemptDigest>/task.json
.../<taskDigest>/<attemptDigest>/result.json
.../<taskDigest>/<attemptDigest>/sandbox
```

The actual Worker preserved `--task` but moved `--artifact` and `--sandbox` one directory upward. The raw tool call shows that exact change. [retained Worker stream](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/basic-cli/20260902T102307822Z_pid92983/abi-authority/archive/fp-d968c009e06fc28b-stdout.log:3)

Because the existing helper trusted those two flags:

- it built the snapshot;
- the generated CLI printed `Hello, world!`;
- both tests passed;
- all four mechanical predicates matched;
- `worksiteDelta` and `productDelta` were empty;
- it wrote the helper artifact at the moved location.

That evidence is in the retained [helper artifact](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/basic-cli/20260902T102307822Z_pid92983/abi-authority/archive/worksite-command-execution/9fdddba1ed3c833eda562da184d6a4e554f70a5cfd541989b663c0e1ca0564b7/result.json:1).

Only afterward did `exactExchange` compare the observed Bash input with the planned input and refuse it as `transport_identity_mismatch`; ABG admitted the failure and then `run_stopped`. [runtime events](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/basic-cli/20260902T102307822Z_pid92983/abi-authority/events/runtime.events.jsonl:167), [runtime events](/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/basic-cli/20260902T102307822Z_pid92983/abi-authority/events/runtime.events.jsonl:170)

So the downstream CLI itself was good. The run was correctly not accepted because the helper effect locus differed from the admitted plan. The bug was temporal: exact path identity was enforced after helper execution rather than before it.

## 8. Exact amended fix

The design removes both mutable output coordinates from Worker control:

```text
current:
node helper --task task.json --artifact result.json --sandbox sandbox

amended:
node helper --task task.json
```

The `task.json` target becomes a canonical, attempt-bound private launch envelope. The helper:

1. admits only the exact `--task <value>` argv grammar;
2. validates the envelope and its actual canonical path;
3. derives `result.json` and `sandbox` as siblings;
4. requires both absent;
5. only then re-observes protected files, builds the snapshot, imports modules, launches probes, or runs declared commands.

This does not weaken `exactExchange`; it moves the critical output-path check to a pre-effect boundary and retains `exactExchange` as the later proof that the Worker’s sole tool input was exact.

## 9. The five planned implementation/evidence paths

If the design is independently accepted and the Executive selects C2 I/E, only these paths may change:

| Path | Planned change |
|---|---|
| `code/src/product/worksite_command_execution.ts` | New private envelope/plan identities, one-argument tool command and prompt, retained private result/sandbox coordinates, completion envelope/artifact join. |
| `code/src/implementation/worksite_command_execution.ts` | Create-only publication and re-observation of the canonical envelope before Worker dispatch. |
| `code/src/implementation/worksite_command_helper.ts` | Strict argv grammar, envelope/locus validation, helper-derived siblings, and pre-effect absence checks. |
| `test_env/tests/t287-worksite-command-execution.test.mjs` | Direct installed-helper success and all malformed/crossed/path/argv/pre-existing-output falsifiers, plus retained C1/C3 closure and replay. |
| `test_env/tests/t287-worksite-branch-construction.test.mjs` | Remove only the stale expectation that the prompt exposes the helper artifact path; retain the full accepted C3→C2 regression. |

Authority and exact territory are at [T-287](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-287-deliver-abiogenesis-5-feature-waves.md:309) and [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:378).

## 10. Implemented ABIogenesis and ABG technical substrate

The implementation is already broad. The current development Product includes:

| Layer | Implemented substrate |
|---|---|
| GTL.TypeScript | Typed declarations and contracts, canonical identity and serialization, raw admission, whole-Program validation, C algebra, fan-out, recursion, workflow, retry, Consensus, Hello World, and worksite GraphFunctions. |
| Product | Product verify/resolve/install, immutable `WorkspaceBinding`, catalog admit/apply/view, publication and implementation resolution, and invocation semantics. |
| HoG | Direct traversal of admitted GTL, uniform C-call and fibre execution, child traversal and foldback, workflow, recursion, interaction, retry, and completion. |
| ABG | Event log/store/prefix handling, invocation admission, execution basis, actor-process and Worker transport, probabilistic-result admission, C-call and child lifecycle, fan-out, retry, `F_H` continuation, typed failure and closure, Event Calculus, replay, and fresh reconstruction. |
| Public | One contract authority, projection authorities, typed SDK operations, installed `abg.cli`, and bounded `abg.codex`. |
| Worksite | Accepted C0 atomic mutation, retained C1 construction, prior accepted C2 mechanical command observation and relay repair, and completed/qualified C3 branch aggregation. |

The current `5.0.0-dev.286` development manifest has 43 rows and four publications: Consensus, Hello World, worksite construction C1/C3, and worksite command execution. This is a development Product subject, not an allocated RC or stable release.

## 11. Feature-wave status

| Wave | Feature families | Current state |
|---:|---|---|
| 1 | `A5-F02`, `A5-F03`, `A5-F04`, `A5-F10` | Accepted functional substrate. |
| 2 | `A5-F01`, `A5-F05`, `A5-F06`, `A5-F09`, bounded early `A5-F17` | Active. C0 and C3 are accepted; C1 is retained; the C2 amendment has independent design GO but awaits Executive acceptance and explicit I/E selection. |
| 3 | `A5-F14`, `A5-F07`, `A5-F08` | Pending integrated closure despite existing partial code and tests. |
| 4 | `A5-F13`, full `A5-F17`, `A5-F11` | Pending Wave 3. |
| 5 | `A5-F15`, `A5-F16` | Pending Wave 4. |
| 5.1 | `A5-F12` | Planned observer/tuner Product; explicitly outside 5.0. |

The authoritative wave table is in [GOALS.md](/Users/jim/src/apps/abiogenesis/specification/GOALS.md:213); the 16 selected 5.0 outcomes are defined in [PRODUCT.md](/Users/jim/src/apps/abiogenesis/specification/PRODUCT.md:733).

## 12. Explicit nonclaims and P3

The amendment does not claim:

- hostile-code or OS-sandbox containment;
- prevention or undo of arbitrary shell effects before a later `exactExchange` refusal;
- authentication against a same-user actor who replaces the entire envelope with a newly recomputed, internally coherent substitute and corresponding derived siblings;
- downstream odd_glc validation, review, corrective iteration, or closure;
- pre-binding Product/install/catalog/workspace authority;
- any new Public operation, event kind, controller, scheduler, retry path, or C3 semantic;
- implementation, packaging, live rerun, qualification, RC, tap, or release.

The coherent same-user substitution is explicitly P3/nonclaim for the trusted-developer-desktop boundary. [C2 design](/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:407)

## 13. Immediate path forward

The dependency-ordered path is:

1. The Executive accepts the independent GO on exact design SHA `f7075c28…` and explicitly selects amended C2 I/E.
2. A bounded Worker changes exactly the five named paths.
3. Model-free installed-package evidence proves the exact argv, envelope, path, sibling-absence, closure, replay, timeout, non-zero-exit, residue, and retained C1/C3 regression matrix.
4. Produce a reproducible package, freeze its exact identities, and stop mutation.
5. Independent source/evidence and exact-artifact review returns to the Executive.
6. odd_glc requalifies its integration against that exact artifact without a model call.
7. Run one fresh `basic-cli` C1→C2 process.
8. If accepted, advance one at a time through `js-tenant-test`, `js-sdlc-bootstrap`, `rust-cli`, and `rust-service`, each followed by independent review and Executive disposition.
9. Project accepted C3 into the odd_glc integration, then run `parallel-js` and `data-mapper-full` with the same freeze/review/disposition discipline.

No version, RC, tag, final tap, or release is allocated by this design or review. `5.0.0-dev.288` remains an unallocated floor. [GOALS.md](/Users/jim/src/apps/abiogenesis/specification/GOALS.md:232)
