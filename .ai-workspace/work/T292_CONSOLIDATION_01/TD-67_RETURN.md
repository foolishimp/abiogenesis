# TD-67 Return: the module-export predicate of worksite command execution

Writer: Claude Opus 5.5. Branch `claude/td67-retire-module-export-predicate`
from local `main` at `18bfd3f1a`, worktree `/private/tmp/abg-td67`. Change
class: product_reprice (owner rule of 2026-11-12, Executive ruling in the
TD-67 brief: a declared command observed by `process_exit` and `stdout_exact`
states the same check). No push, no tag.

**Status: census and recorded history committed; the work is in progress.**

`T` = `build_tenants/abiogenesis/typescript`. C2 is worksite command
execution: the Product owner that runs declared commands over a sandbox copy
of selected worksite files and observes the results. The helper is the Node
child process `T/code/src/implementation/worksite_command_helper.ts` that C2
launches to run the commands and publish its result file (the helper
artifact). Scratch, probes and TAP output: `/private/tmp/abg-td67w-work/`.

## 1. Census

Line numbers in this section are at `18bfd3f1a`. Search: the whole-word
pattern `module_export_return_exact` over the worktree (generated `contracts/`,
`build/` and `node_modules/` excluded and checked separately), and the phrases
"module import", "task-module", "module export", "exported behavior" and the
three scenarios' export names (`helloWorld`, `helloPart`, `worldPart`) over
`specification/` and `T/design/*.md`.

### 1.1 What the predicate does

A C2 outcome predicate of kind `module_export_return_exact` declares
`{ path, export, equals }`. The helper imports the module at `path` from the
sandbox into its own process, reads the named export, calls it when it is a
function and awaits the result, and records the JSON copy of the value as the
observation (`undefined` as `null`). A throw at import or call is caught and
recorded as `null`. The import has no deadline, no budget term, the helper's
whole environment and the canonical root as working directory.

### 1.2 Specification

No hit. No requirement, Product definition sentence or scenario text names the
kind, the helper's module import or the scenarios' module checks.
`REQ-P-SCENARIOS-017` (`specification/requirements/product/REQ-P-SCENARIOS.md:241`)
makes a change of a scenario's outcome predicate a Product re-entry; the
Executive took that re-entry under the owner's rule. The scenario registration
that changes is the fixture data listed in 1.5, not specification text. No
specification commit.

### 1.3 Kept design notes

Only `T/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` names the
kind or the helper's module import. No other kept design note,
`ABI5_REALIZATION_CONSTITUTION.md` or the shared design does
(`M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:423`
`module_export_missing` is an unrelated native-occurrence refusal).

| Line | Text | Action |
|---|---|---|
| 299 | "declared cwd/report/module/selector/ port-file paths" | restate without "module" |
| 470 | "Every cwd, report, module, selector, port-file, and write-territory path is" | restate without "module" |
| 488-490 | "…declared command, task-module import, report read, HTTP launch, or probe, the helper must close its own invocation preflight." | restate without the import |
| 603-607 | "…snapshot/result materialization, probe launch, task-module import, or declared-command execution." | restate without the import |
| 609-612 | "All declared command cwd, report reads, module imports, report walks, and HTTP probes resolve…" | restate without the import |
| 704-705 | "…probe launch, task-module import, or declared-command execution." | restate without the import |
| 756-758 | "…materialization, probe launch, task-module import, and declared-command work…" | restate without the import |
| 843 | "- `module_export_return_exact` from one confined snapshot module import/call;" | cut verbatim |
| 866-867 | "…whether exit codes, bodies, exports, counts, or report sets satisfy odd_glc." | restate without "exports" |
| 900 | Snapshot-mapping row "cwd, report, module, selector, port-file, and evidence-write paths" | restate without "module" |
| 950-952 | test item 10 "…snapshot/result materialization, probe launch, or task-module import;" | restate without the import |
| 959 | "module rows" | kept: it names `module_set_exact` rows, which stay |

### 1.4 Source (`T/code/src`)

| File | Lines | What | Action |
|---|---|---|---|
| `product/worksite_command_execution.ts` | 1077-1079 | `validPredicateDeclaration` arm for the kind | delete |
| same | 1302-1304 | `predicatePaths` arm returning the module path (consumer: `declaredPathsEnterProtectedRoots`, :1502) | delete the arm; the function stays for report paths |
| same | 1376 | `worksiteCommandConfigurationInputSchema` `anyOf` arm `{ equals, export, path }` | delete |
| same | 1397 | schema description phrase "module paths must be protected targets." | delete the phrase |
| same | 1445-1450, 1531 | `modulePredicatesAreProtected` (local) and its use in the configuration refusal | delete both |
| `implementation/worksite_command_helper.ts` | 1220-1251 | the module import branch of the predicate observer | delete |
| same | 32 | `pathToFileURL` import from `node:url` (its only use is :1232) | delete `pathToFileURL`; `fileURLToPath` (:379) stays |
| `validator/qualification.ts` | 207-211 | reader comparison case and its comment | delete |
| `gtl/worksite_command_execution.ts` | 36-61 | renderer pin (digest, byte count, span of the built product file) | re-pin after the build; span digest must not change |

No exported symbol is removed. No kept file imports anything that leaves.
`confinedExistingPath`, `worksiteExecutionSources` and `safeRelativePath` stay
in use elsewhere. Kept code that reaches the configuration constructor
(`abg/semantic_job.ts:256`, `abg/native_work_reacquisition.ts:199`,
`product/worksite_preparation.ts:73`, `product/worksite_revision.ts:143`,
`product/worksite_command_execution.ts:381, 444, 493, 950, 1595`) and the
schema embedding (`product/semantic_job.ts:693`, the semantic-job design
response schema) needs no change: each gives a declaration of the kind the
outcome of any unknown kind. Nothing outside the predicate branch uses the
helper's module import.

### 1.5 Tests, support and fixtures (`T/test_env`)

| File | Lines | Role | Action |
|---|---|---|---|
| `fixtures/sandbox-uat/js-tenant-test/request.json` | 229-237 | scenario check: `src/hello.mjs` export `helloWorld` returns `"Hello, world!"` | restate as command + `process_exit` + `stdout_exact` |
| `fixtures/sandbox-uat/js-sdlc-bootstrap/request.json` | 229-237 | the same check | the same |
| `fixtures/sandbox-uat/parallel-js/request.json` | 241-267 | three checks: `src/hello.mjs` `helloPart` → `"Hello"`, `src/world.mjs` `worldPart` → `"world"`, `src/index.mjs` `helloWorld` → `"Hello, world!"` | the same |
| `fixtures/sandbox-uat/independent-oracle.mjs` | 228-233 | the scenarios' independent oracle reads the module observations | read the `stdout_exact` observations of the check commands |
| `fixtures/sandbox-uat/scenarios.json` | rows of the three scenarios; all seven rows | `acquisitionDigests` pins of `request.json` (three rows) and of `independent-oracle.mjs` (seven rows); `toolchainObligations.commands` | re-pin; mirror the new commands |
| `uat/harness.test.mjs` | 296-317 | builds synthetic observations from the module predicates | build them from the `stdout_exact` rows |
| `tests/t287-qual056-material.test.mjs` | 120, 141 | uses the kind as an incomplete predicate (observed `null`) | vehicle: use a kept kind with a `null` observation |
| `tests/t288-instruction-assembly-owner.test.mjs` | 71, 74 | uses the kind as an opaque predicate label | vehicle: use a kept kind |

The fixtures' `oracle.json` files hold no module observation that code reads:
their `cases` are read by no code and the README keeps their original bytes.
They stay unchanged. `scenarios.json` `oracleModuleDigest`
(`sha256:f8c914c9…`) is not the oracle module's digest and nothing reads it; it
stays unchanged. `support/exact-candidate-qualification.mjs` `STAND_IN_ENVELOPE`
names a recorded js-sdlc-bootstrap Run but is used only by a driver mode that
replaces the recorded value with a fresh measurement; it needs no change.

### 1.6 Scripts and package metadata

No hit in `T/scripts` or `T/package.json`.

### 1.7 Qualification mirrors

`T/test_env/qualification/inventory.json` and
`T/test_env/qualification/recipe/verification-recipe.json` list members with
digests (for example `verification-recipe.json:3150-3235` for the sandbox
fixtures). They are not edited here; section 16 lists the changed members for
the Executive's restaging.

### 1.8 Generated files

`T/contracts`, `T/product-toolchain-manifest.json` and
`T/test_env/fixtures/abi5-root-candidate-basis.json` hold no whole-word hit at
base; the schema is published by digest. The build output `T/build` holds the
three compiled source files.

## 2. Recorded history

Search: `rg -uu -w -l module_export_return_exact` over
`/Users/jim/src/apps/abiogenesis/.ai-workspace` for `*.json` and `*.jsonl`, no
size cap (26 s); `T/test_env/proof`; `T/test_env/fixtures`; and once
`T/test_env/test_runs/sandbox-uat` in the main checkout.

| Place | Files with a hit | What they are |
|---|---|---|
| evidence root | 312 | 258 copies of the three fixture requests inside sandboxes and frozen sources; two `prepared-request.json` files of the genuine assessments (`work/T287_GENUINE_CONTEXT_ASSESSMENT_04`, `work/T287_GENUINE_REFERENCE_ASSESSMENT_03`); native42's C2 attempt (`comments/codex/20260926_CALCULUS_CROSSCUT/native42/preparation/invocation/archives/worksite-command-execution/3f90ed65…/8f3cecb2…/task.json` and `result.json`); two event excerpts (`native42-events-109400-109464.jsonl`, a native38 `87788-c_call_result_admitted.jsonl`); 48 other files (transports, prompts, schemas, selected events, the TD census `kinds.json`) |
| `T/test_env/proof` | 0 | |
| `T/test_env/fixtures` | 4 | the three `request.json` files and `independent-oracle.mjs` |
| `T/test_env/test_runs/sandbox-uat` | 13 Runs | four js-tenant-test, five js-sdlc-bootstrap, four parallel-js, 2026-10-06 to 2026-10-28 |

native44 holds no attempt of its own: its suffix cites native42's result. The
four native42/native44 `live-start.jsonl` logs hold no hit of the kind.

### 2.1 Replay of the logs at base

The 13 UAT event logs (`resources/events/runtime.events.jsonl`) and the four
native42/native44 `live-start.jsonl` logs were decoded with the base build.
Every one is refused at decode before any C2 row is read: the 13 UAT logs with
"event stamp differs from the exact native profile schedule", the four native
logs with "durable ABG event log contains a noncanonical event". No kept read
reopens them at base.

### 2.2 The recorded helper artifacts and tasks at base

For each of the 14 recorded C2 attempts that declare the kind (the 13 UAT
Runs and native42), the base build's task guards, its helper-artifact guard,
its configuration constructor over the recorded declarations, and, for the
observation the Run's log admitted for the same task, the observation guard,
the contract-value guard and the C2 judgment relation. Script:
`/private/tmp/abg-td67w-work/scripts/recorded-reader.mjs`; output
`hist/recorded-base.jsonl`.

| Attempts | Task guards | Artifact guard | Configuration | Logged observation |
|---|---|---|---|---|
| 12 (4 js-tenant-test, 3 js-sdlc-bootstrap of 2026-10-06, 10-27 and 10-28T15-49, 4 parallel-js, native42) | every arm refuses | refused | constructs | refused (native42: none in the log) |
| js-sdlc-bootstrap 2026-10-28T09-14-27 (`f4239c5a`) and 2026-10-28T12-57-57 (`624419a6`) | observed arm admits | admitted | constructs | observation guard, contract value and judgment all admit |

Every recorded observation of the kind equals its declared value; none is
`null`. The two observed-arm tasks are the only recorded tasks with the kind
that the base build admits. Their event logs are refused at decode (2.1), so
no kept read reaches them; their re-admission on the final build is refused,
which ruling 6 of the brief calls intended. Final results: section 13.
