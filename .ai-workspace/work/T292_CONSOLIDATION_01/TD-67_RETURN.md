# TD-67 Return: the module-export predicate of worksite command execution

Writer: Claude Opus 5.5. Branch `claude/td67-retire-module-export-predicate`
from local `main` at `18bfd3f1a`, worktree `/private/tmp/abg-td67`. Change
class: product_reprice (owner rule of 2026-11-12, Executive ruling in the
TD-67 brief: a declared command observed by `process_exit` and `stdout_exact`
states the same check). No push, no tag.

**Status: complete, ruling asked (R1, section 16). The kind is retired with
the helper's in-process module import; every door gives it the outcome of a
kind C2 never knew; the five scenario checks are declared commands; the
refusal lane is red on base (0/4) and green on final (4/4); 44 lane files pass on the final build (316 tests, 301 pass, 0 fail, 15 skip)**

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

The fixtures' `oracle.json` files stay unchanged (deviation D3, section 15).
`scenarios.json` `oracleModuleDigest` (`sha256:f8c914c9…`) is not the oracle
module's digest at base either and nothing reads it; it stays unchanged
(residual, section 16). `support/exact-candidate-qualification.mjs`
`STAND_IN_ENVELOPE` names a recorded js-sdlc-bootstrap Run but is used only by
a driver mode that replaces the recorded value with a fresh measurement; it
needs no change.

### 1.6 Scripts and package metadata

No hit in `T/scripts` or `T/package.json`.

### 1.7 Qualification mirrors

`T/test_env/qualification/inventory.json` and
`T/test_env/qualification/recipe/verification-recipe.json` list members with
digests (for example `verification-recipe.json:3150-3235` for the sandbox
fixtures). They are not edited here; section 14 lists the changed members for
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

The brief counts two recorded native tasks. native42 holds the one attempt;
native44 holds no attempt of its own: its suffix cites native42's result. The
four native42/native44 `live-start.jsonl` logs hold no hit of the kind.

### 2.1 Replay of the logs

The 13 UAT event logs (`resources/events/runtime.events.jsonl`) and the four
native42/native44 `live-start.jsonl` logs were decoded with the base build and
with the final build. Every one is refused at decode before any C2 row is
read, with the same message on both builds: the 13 UAT logs with "event stamp
differs from the exact native profile schedule", the four native logs with
"durable ABG event log contains a noncanonical event". The replay outputs are
byte-identical (`hist/kind-replay-base.jsonl`, `hist/kind-replay-final.jsonl`).

### 2.2 The recorded helper artifacts and tasks

For each of the 14 recorded C2 attempts that declare the kind (the 13 UAT
Runs and native42): the build's task guards by arm, its helper-artifact guard,
its configuration constructor over the recorded declarations, and, for the
observation the Run's log admitted for the same task, the observation guard,
the observed-observation guard (the qualification reader's and judge's first
check), the contract-value guard and the C2 judgment relation. Script:
`/private/tmp/abg-td67w-work/scripts/recorded-reader.mjs`; output
`hist/recorded-base2.jsonl` and `hist/recorded-final.jsonl`.

| Attempts | Base | Final |
|---|---|---|
| 12 (4 js-tenant-test, 3 js-sdlc-bootstrap of 2026-10-06, 10-27 and 10-28T15-49, 4 parallel-js, native42) | every task guard arm refuses; artifact guard refuses; configuration constructs; logged observation refused at every guard (native42: none in the log) | every task guard arm refuses; artifact guard refuses; configuration throws `TypeError: worksite outcome predicate requires exact id and kind`; logged observation refused at every guard |
| js-sdlc-bootstrap 2026-10-28T09-14-27 (`f4239c5a`) and 2026-10-28T12-57-57 (`624419a6`) | observed arm admits; artifact guard admits; configuration constructs; observation guard, observed-observation guard, contract value and judgment all admit | every arm refuses; artifact guard refuses; configuration throws the same `TypeError`; observation guard, observed-observation guard, contract value and judgment all refuse |

Every recorded observation of the kind equals its declared value; none is
`null`.

The twelve keep their verdict: refused before and after. The two observed-arm
tasks change verdict: admitted on base, refused on final. Ruling 6 of the
brief asks for the same verdict on base and final, and also calls the refusal
of a recorded task admitted anew intended. These two are recorded tasks that
the base build still admits, so both statements cannot hold for them; R1
(section 16) asks for the ruling. Facts that bound the change:

- their event logs are refused at decode on base and on final (2.1), so no
  replay or projection reaches their C2 rows on either build;
- no kept code, script or lane names either Run (`rg` over `T/test_env`,
  `T/scripts` and `T/code` for both Run ids and for the two event excerpts:
  the only hits are two comments in retired branches of
  `t288-instruction-assembly-owner` (:282) and
  `t287-native-semantic-revision` (:514) that name the native38 excerpt);
- `STAND_IN_ENVELOPE` names the js-sdlc-bootstrap Run of 2026-10-28T15-49,
  which base refuses too;
- the stop condition of ruling 6 (a kept lane on kept behaviour re-admits such
  a task and fails) does not hold: no kept lane reads them (section 10).

## 3. Specification edits

None. No specification file changes (1.2). The scenario registration that
changes under `REQ-P-SCENARIOS-017` is fixture data, listed in section 8:

- the three `request.json` files: each module check becomes a declared check
  command and two predicates;
- `scenarios.json`: the acquisition pins of the three requests and of
  `independent-oracle.mjs`, and the `toolchainObligations.commands` of the
  three rows.

The scenarios' meaning does not change: the same module export must return the
same value.

## 4. Design

`T/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` (+16 −11):

- the kinds-list bullet at 843 is cut verbatim to
  `T/design/history/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN__RETIRED_SECTIONS.md`
  (one new block of 26 lines with its provenance and the reason);
- the sentences at 299, 470, 488-490, 603-607, 609-612, 704-705, 756-758,
  866-867, 900 and 950-952 that list the helper's in-process operations or
  declared paths are restated without the module import, the module path or
  "exports";
- one paragraph follows the kinds list:

  > A check of a module's exported value is a declared command that imports
  > the module, calls the export and prints the value as canonical JSON;
  > `process_exit` and `stdout_exact` observe it. The command runs under its
  > own deadline, budget term, declared environment and snapshot working
  > directory. The helper imports no worksite module into its own process.

## 5. Source lines removed by file

| File | + | − | What leaves |
|---|---|---|---|
| `T/code/src/product/worksite_command_execution.ts` | 2 | 15 | the declaration arm, the `predicatePaths` arm, the schema `anyOf` arm, the description phrase, `modulePredicatesAreProtected` and its use |
| `T/code/src/implementation/worksite_command_helper.ts` | 1 | 33 | the module import branch; `pathToFileURL` from the `node:url` import |
| `T/code/src/validator/qualification.ts` | 0 | 5 | the reader's comparison case |
| `T/code/src/gtl/worksite_command_execution.ts` | 3 | 3 | the renderer pin (digest, byte count, span) follows the built product file; the span digest is unchanged |
| total `T/code/src` | 6 | 56 | |

The schema description now reads "…Referenced commands must exist. Report
counts…". No stub, no alias, no new refusal code.

## 6. Door table

"Unknown kind" is `td67_never_known_predicate_kind`, a kind C2 never knew; on
final the retired kind gets exactly its outcome at every door. Lane:
`T/test_env/tests/t292-td67-module-export-predicate-refused.test.mjs`
(cases 1-4).

| Door | Owner | Base, retired kind | Final, retired kind = unknown kind | Evidence |
|---|---|---|---|---|
| configuration input schema | `worksiteCommandConfigurationInputSchema` under Ajv | admitted (its own `anyOf` arm) | refused: no `anyOf` arm matches | case 1 |
| configuration | `constructWorksiteCommandConfiguration` | constructs | `TypeError: worksite outcome predicate requires exact id and kind` | case 2 |
| task construction | `constructWorksiteCommandExecutionTask` (the observed, native and revision constructors call the same configuration) | constructs | the same `TypeError` | case 2 |
| task guards | `isWorksiteCommandExecutionTask`, `isC2WorksiteCommandExecutionTask`, `isWorksiteExecutionTask` (re-construct the task) | `true` for a task with the owner's identity | `false` | case 3 |
| C2 task contract | `ABI5_PRODUCT_SEMANTICS.admitInput(taskContractRef)` | admits | `null` | case 3 |
| parent | `realizeWorksiteCommandExecution` | proceeds | `TypeError: command execution requires one exact admitted task` | case 3 |
| helper plan, artifact and observation owners | `worksiteCommandExecutionHelperPlan` first | construct | `TypeError: command helper plan requires one exact task, attempt identity, and absolute executable` | case 3 |
| helper's own task guard | `worksite_command_helper.ts` :338 (task manifest) and :1378 (launch manifest), both `isWorksiteExecutionTask` | the base helper runs the old js-tenant-test task: exit 0, artifact written, disposition success | the final helper over the same staged task: exit 1, stderr `TypeError: helper task manifest does not retain one exact Product task`, no artifact | guard: case 3; helper process: `scripts/helper-door.mjs`, `door-helper.jsonl` |
| qualification reader | `constructQualificationVerificationMaterial`, first check `isObservedWorksiteCommandExecutionObservation` | returns material for an observation with the owners' identities (predicate outcome `passed`) | returns `null` (no material) | case 4 |
| qualification judge | `resolveQualificationExecutionMaterial` (`abg/qualification_proof.ts:967`) | constructs verification material | does not throw: its condition calls `isObservedWorksiteCommandExecutionObservation` before the reader, the check is `false`, so `verification` stays `null` and the execution entry is recorded without verification material | guard: case 4; the judge itself runs in no lane (no qualification proof fixture carries a C2 observation) |

Case 4 builds an observed C2 observation through the owners (the
`t287-qual056-material` fixture, reduced) and replaces its one predicate,
recomputing every identity of the chain (task, helper plan, helper artifact,
provenance, observation) as the owners compute it. Control: a kept kind
(`stdout_exact`) swapped in the same way passes the observed-observation guard
and gives material on both builds, so the recomputation is exact. On base the
retired kind passes the guard and the reader gives material (disposition
`failed` only through the fixture recipe's predicate digest; the predicate
outcome is `passed`); on final both the retired and the unknown kind give
`null`.

Lane on base: 0/4 (each case fails at its first retired-kind assertion:
admitted where it must be refused). On final: 4/4.

## 7. Equivalence without a provider

Ruling 5. Each of the five checks, in four variants of the sandbox module, is
driven through the installed helper and the parent's completion: the old form
on base, the new form on final, with the scenario's task, the expected module
(or its variant) and the scenario's tests. Script:
`scripts/equivalence.mjs`; output `equiv/base.jsonl`, `equiv/final.jsonl`
(20 rows each). Variants: `correct` (the expected value), `other` (returns
`"Goodbye"`), `throw_import` (throws when imported), `throw_call` (the export
throws).

| Variant | Old form, base: recorded value | Old form: reader | Old form: oracle check | New form, final: exit / stdout | New form: reader | New form: oracle `execution:…/module-N` / `…/module-N` |
|---|---|---|---|---|---|---|
| correct | the expected value (`"Hello, world!"`, `"Hello"`, `"world"`) | `passed` | satisfied | 0 / canonical JSON of the value, e.g. `"Hello, world!"` with its quotes | `passed` | satisfied / satisfied |
| other | `"Goodbye"` | `failed` | unmet | 0 / `"Goodbye"` | `failed` | satisfied / unmet |
| throw_import | `null` | `incomplete` (`blocked_incomplete`) | unmet | 1 / empty | `failed` | unmet / unmet |
| throw_call | `null` | `incomplete` (`blocked_incomplete`) | unmet | 1 / empty | `failed` | unmet / unmet |

In all 40 runs the helper exits 0, the artifact guard admits the artifact, the
completion disposition is `success`, the observation guard admits the
observation, the completion's observations equal the artifact's, and the C2
judgment relation holds. The scenario tests command gives the same result in
both forms (satisfied for `correct`, unmet for the other variants, whose tests
also check the value).

The verdicts agree for `correct` and `other`. For a throw the old form records
`null` and the qualification reader classifies the check `incomplete`; the new
form fails: the check command exits 1 and prints nothing, so `process_exit`
and `stdout_exact` are both `failed`. That is the change ruling 5 asks for;
the reader's classification of a throw moves from `incomplete` to `failed`.

What the new observations record:

- `…/module-N-exit` (`process_exit`): the check command's exit status, 0 or 1;
- `…/module-N` (`stdout_exact`): the command's whole stdout as text: the
  canonical JSON of the value, or the empty string after a throw;
- the evidence of both is the check command's observation coordinate, not the
  module file's source observation coordinate the old form cited;
- the throw itself is in the command's stderr, which the command result keeps
  (for example the import error with its file URL).

## 8. Tests and fixtures

### 8.1 Scenarios

Each check becomes one declared command placed before the tests command (the
oracle's test floor reads the last matched command) and two predicates. The
command is

`{ commandId: "command://abiogenesis-sandbox-uat/<scenario>/module-N", executable: "node", args: ["--input-type=module", "-e", LOADER, <path>, <export>], relativeCwd: ".", environment: {}, timeoutMs: 120000, terminationGraceMs: 5000, expectedReports: [] }`

with the timeout and grace of the fixtures' other commands. `LOADER` is one
line, byte-identical in all five commands: it imports `./<path>`, reads the
export, calls it when it is a function and awaits it, and writes the value as
canonical JSON (keys sorted, `undefined` as `null`, no newline). The old
predicate id `…/module-N` becomes `…/module-N-exit` (`process_exit`, equals 0)
and `…/module-N` (`stdout_exact`, equals the JSON text).

| Scenario | Check | Path | Export | `stdout_exact` equals | Budget before → after (ms) | `request.json` pin before → after |
|---|---|---|---|---|---|---|
| js-tenant-test | module-0 | `src/hello.mjs` | `helloWorld` | `"Hello, world!"` | 135,250 → 265,500 | `9d66f966…` 23616 → `c23853a6…` 24842 |
| js-sdlc-bootstrap | module-0 | `src/hello.mjs` | `helloWorld` | `"Hello, world!"` | 135,250 → 265,500 | `3eb6ebb6…` 26985 → `917d399e…` 28223 |
| parallel-js | module-0 | `src/hello.mjs` | `helloPart` | `"Hello"` | 135,250 → 526,000 | `766a1b4c…` 26038 → `e9a46f08…` 29680 |
| parallel-js | module-1 | `src/world.mjs` | `worldPart` | `"world"` | (same task) | (same file) |
| parallel-js | module-2 | `src/index.mjs` | `helloWorld` | `"Hello, world!"` | (same task) | (same file) |

The budget is the closed helper execution budget C2 computes
(`projectWorksiteCommandExecutionBudget`: per command timeout + 2 × grace +
min(grace, 250), plus 5,000); each check command adds 130,250 ms. The UAT
example configuration's actor limits are 18,030,000 ms (inactivity) and
18,040,000 ms (absolute) and it sets no `commandTimeoutOverrides`; no recorded
UAT Run of the three scenarios used one. `workOrders`, the task text,
`oracle.json` and `oracleModuleDigest` are unchanged.

`scenarios.json`: the `independent-oracle.mjs` pin in all seven rows moves
from `sha256:a0887ed7…` (26966 bytes) to
`sha256:6b1fd7a41fe0e03708d6dbebeec171f6cef7ac36af8d3baef8bfdc8451515407`
(27124 bytes); the three request pins move as above;
`toolchainObligations.commands` of the three rows mirror the new request
commands.

`independent-oracle.mjs`: the module-observation loop becomes the branch for
scenarios other than basic-cli and rust-cli. It reads each `stdout_exact`
predicate's declared check command from the admitted command results and
compares its decoded stdout with the declared text; the check command's exit
is the `execution:<commandId>` criterion the oracle already derives for every
declared command.

### 8.2 Tests

| File | Change | Reason |
|---|---|---|
| `uat/harness.test.mjs` (+6 −3) | synthetic predicate observations come from the `stdout_exact` rows; a check command's synthetic stdout is its predicate's declared text | the harness builds its observations from the fixture requests |
| `tests/t287-qual056-material.test.mjs` (+2 −2) | the `unknown` case and the F11 case use `process_exit` with a `null` observation | vehicle: the kind was a stand-in for an incomplete predicate |
| `tests/t288-instruction-assembly-owner.test.mjs` (+2 −2) | `stdout_exact` with `{ validationCommandId: "command://value", equals }` | vehicle: the kind was an opaque predicate label |
| `tests/t292-td67-module-export-predicate-refused.test.mjs` (new, 206 lines) | four cases: schema; configuration and task constructor; task guards, task contract, parent, helper plan and artifact owners; observed-observation guard and qualification reader | the door table (section 6), red on base |

No test is deleted.

## 9. Generated contracts and identity digests

Generated by `npm run build` on final; not committed (restored before each
commit). The build is reproducible: a second build gives byte-identical
generated files.

| Identity | Base | Final |
|---|---|---|
| `productContentDigest` | `sha256:d752b07f3e8a50296840cfa0835920c04bf9a146c6dffe0b22eff1ff17ec4b33` | `sha256:45ed2735b2f331d979bae63ec9c4a4d50e9af022cce7da4052ef2218ac25dc5c` |
| `contributionManifestDigest` | `sha256:e2eed8b24787ca93831e62f04916890d6b22ec46f0e1225be4e13d7d544d7df2` | `sha256:ca429d7db565ce2edf026c9f92dc17be6b923efcfb9fb348b79b7f17053da47a` |
| capability `graphDigest` | `sha256:08ca7e5a59019e8bb50cfac7fb8f8842210f8366f9d0af2e82bbed9c01fed12c` | `sha256:9f0d1c50aec3b8058d944f15841744bf8b5a1972aa788e9c101e702d0359c957` |
| `catalogDigest` | `sha256:3dba155c2c0ae2f70f51410f1b46dd3d5a64c2d0d9988794a93f716f57dfccd4` | unchanged |

- `product-toolchain-manifest.json`: 51 differing values, all identity
  following: refs derived from `productContentDigest`, the eight publication
  digests, and the capability graph's locator and digest.
- `contracts/capabilities/capability-definition-graph.json`: 16 rows; only
  `capabilityDefinitionDigest`/`Ref` and `productContentDigest` differ.
- `contracts/worksite/command-execution-context.inventory.json`: only the
  member digest of the renderer pin.
- Publications (`scripts/pubcmp.mjs`): only
  `module://abiogenesis/worksite/command-execution@5` differs, in its renderer
  pin fields.
- `test_env/fixtures/abi5-root-candidate-basis.json`: unchanged by the build.

No contract file carries the C2 configuration input schema; it reaches only
the runtime (Ajv in the configuration path and the semantic-job design
response schema, `product/semantic_job.ts:693`). The brief expected contract
and catalogue digests to move; the catalogue digest does not (D5). No
Public-family count pin and no owner-contract key-set digest changes:
`r10-projection-contracts` and `t287-framework-handoff-types` pass on both
builds (section 10). Ruling 9's stop does not apply.

## 10. Lanes before and after

The Writer's run ended at its model's usage limit before this table was written. The Executive totalled the TAP files the Writer left in `/private/tmp/abg-td67w-work/lanes-base/` and `lanes-final/`:

| Build | Files | Tests | Pass | Fail | Skip |
|---|---:|---:|---:|---:|---:|
| base (`18bfd3f1a`) | 46 | 333 | 306 | 12 | 15 |
| final | 44 | 316 | 301 | 0 | 15 |

The 12 failures on the base are the new and edited cases, which assert the retired kind refused; the two files that run only on the base are tests the package removed. No file fails on the final build.

## 11. Replay comparison

The replay set: 33 recorded event logs (`hist/replay-set.txt`): a copy of the
rc.12 log (`truth/rc12-events.jsonl`), the base build's r10 proof log, and 31
logs under the evidence root (RC1 qualification continuations, the framed
governance and registered-selection attempts, and the rc4, rc6, rc8 and rc11
release-resumption runtimes, one of them inside a C2 attempt archive). Each was decoded and
projected with the base build and with the final build
(`scripts/replay-log.mjs`; `replay/base.jsonl`, `replay/final.jsonl`).
11 decode and project; 22 are refused at decode with the same message on both
builds. The two outputs are byte-identical. The 17 logs of section 2.1 give
byte-identical outputs too.

## 12. Artifact truth over recorded stores

`projectArtifactTruth` (`abg/artifact_truth.ts`) re-validates each recorded
`product.install` lock, capability graph and artifact row against the
reader's current definitions. Over the 33 logs of section 11 and the 17 kind
logs (`scripts/probe-artifact-truth.mjs`; `truth/base.jsonl`,
`truth/final.jsonl`, `hist/kind-truth-*.jsonl`) the outputs are
byte-identical on base and final. The rc.12 projection digest is
`sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` on
both. The lock probe (`scripts/probe-lock.mjs`) gives the same rows:
`isResolvedProductLock` true, no capability identity mismatch.

## 13. What leaves the helper: start-up and artifact identity

The module import was a dynamic `import()` inside the predicate branch, so it
never ran at helper start-up. Start-up of the built helper module
(`scripts/startup.mjs`, 25 runs each, load average about 7):

| Build | Static relative modules | Runtime build modules | Runtime package modules | Median (ms) | Min-max (ms) |
|---|---|---|---|---|---|
| base (first run) | 247 | 247 | 156 | 336.6 | 316.5-507.4 |
| base (second run) | 247 | 247 | 156 | 324.0 | 316.7-446.3 |
| final | 247 | 247 | 156 | 324.0 | 311.5-430.1 |

A task without the kind gives a byte-identical helper result on base and
final (`scripts/helperdiff.mjs`, `helperdiff/helperdiff.json`, actor limits
18,030,000/18,040,000 ms):

| Task arm | Result sha256 | Bytes | Disposition | Command exits |
|---|---|---|---|---|
| observed | `6c6ef5872ac92…` | 10049 | success | [0, 3] |
| construction_source | `2cc1ea1112123…` | 9849 | success | [0, 3] |
| revision | `74b608ffc05c3…` | 10069 | success | [0, 3] |

## 14. Qualification members

`T/test_env/qualification/inventory.json` (a complete claim) lists every
changed tracked file by its `build_tenants/abiogenesis/typescript/…` path.
Changed members for the Executive's restaging:

| Member (under `T/`) | inventory | recipe | `declared-commands.json` |
|---|---|---|---|
| `code/src/gtl/worksite_command_execution.ts` | yes | yes | |
| `code/src/implementation/worksite_command_helper.ts` | yes | yes | |
| `code/src/product/worksite_command_execution.ts` | yes | yes | |
| `code/src/validator/qualification.ts` | yes | yes | |
| `design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` | yes | yes | |
| `test_env/fixtures/sandbox-uat/independent-oracle.mjs` | yes | yes | |
| `test_env/fixtures/sandbox-uat/js-sdlc-bootstrap/request.json` | yes | yes | |
| `test_env/fixtures/sandbox-uat/js-tenant-test/request.json` | yes | yes | |
| `test_env/fixtures/sandbox-uat/parallel-js/request.json` | yes | yes | |
| `test_env/fixtures/sandbox-uat/scenarios.json` | yes | yes | |
| `test_env/tests/t287-qual056-material.test.mjs` | yes | yes | yes |
| `test_env/tests/t288-instruction-assembly-owner.test.mjs` | yes | yes | |
| `test_env/uat/harness.test.mjs` | yes | yes | yes |
| `contracts/capabilities/capability-definition-graph.json` (generated) | yes | yes | |
| `contracts/worksite/command-execution-context.inventory.json` (generated) | yes | yes | |
| `product-toolchain-manifest.json` (generated) | yes | | yes |

New files, not members: the refusal lane
`test_env/tests/t292-td67-module-export-predicate-refused.test.mjs` (no
`t292-*` lane is a member) and the retired-sections file
`design/history/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN__RETIRED_SECTIONS.md`
(other `design/history/` files are members). Whether they enter the inventory
is the Executive's at restaging.

Whole-word search for `module_export_return_exact` on final, outside
`node_modules` and `test_runs`: the refusal lane (it names the retired kind to
refuse it) and the retired-sections file (retired text kept by design). No
kept code, design note, fixture or generated file names it.

## 15. Deviations

- **D1.** The commits carry the session's attribution trailer (Claude Opus
  5.5); the brief named another model.
- **D2.** Ruling 4 asks to update the fixtures' oracle files. The three
  `oracle.json` files stay unchanged: each `scenarios.json` acquisition pin of
  an `oracle.json` equals `provenance.oracleAcquisition.wholeFileDigest`, the
  digest of the donor file at odd_glc commit `36d40d55` (for parallel-js both
  are `sha256:82a35700…`). Editing the file breaks that provenance, and no
  code reads its `cases`. The oracle that reads observations is
  `independent-oracle.mjs`, which is updated (8.1).
- **D3.** The qualification reader classifies a throwing module `incomplete`
  in the old form and `failed` in the new form (section 7).
- **D4.** `scenarios.json` `oracleModuleDigest` stays at its base value; it is
  not the oracle module's digest at base either, and nothing reads it.
- **D5.** The brief expected contract and catalogue digests to move. The
  catalogue digest does not move and no contract file carries the schema; the
  contribution manifest digest, the product content digest, the capability
  graph and the C2 publication's renderer pin move (section 9).
- **D6.** The lanes ran one file at a time from a sequential script
  (`scripts/lane.sh`), started in the background with the session waiting for
  it, not from an interactive foreground shell. Base and final never ran at
  the same time.

## 16. Residuals and ruling asked

- **R1 (ruling).** The two recorded js-sdlc-bootstrap tasks of
  2026-10-28T09-14-27 (`f4239c5a`) and 2026-10-28T12-57-57 (`624419a6`) are
  admitted on base and refused on final (2.2). Ruling 6 expects the same
  verdict for recorded history and calls the refusal of a recorded task
  admitted anew intended; for these two the statements conflict. Facts: their
  logs are refused at decode on both builds, no kept code or lane reads them,
  no stop condition holds. The Writer's reading: the refusal is the intended
  re-admission refusal, and nothing recorded is re-read through them. The
  Executive rules whether that reading stands.
- **Budget under a timeout override.** With a five-hour
  `commandTimeoutOverrides` entry on a scenario's tests command (18,000,000
  ms), the old form's budget was 18,015,250 ms, under the 18,030,000 ms actor
  limit; the new form's is 18,145,500 ms (js-tenant-test, js-sdlc-bootstrap)
  and 18,406,000 ms (parallel-js), over it, and the parent refuses the task.
  No configuration or recorded Run of these scenarios sets such an override;
  an operator who sets one also overrides the check commands' timeouts.
- **Generated identity.** The `t292-td36r-*` and `t292-td36s-bind-string-rule`
  lanes compare the packed archive with the committed candidate basis fixture;
  they pass on final only with the fixture refreshed in scratch. The Executive
  regenerates the identity at merge.
- **Qualification mirrors.** Restaging of the members in section 14 is the
  Executive's.

## 17. Size

`git diff --numstat 18bfd3f1a` over the package's commits, by layer:

| Layer | + | − |
|---|---|---|
| `specification/` | 0 | 0 |
| `T/design/` (note + history) | 42 | 11 |
| `T/code/src` | 6 | 56 |
| `T/test_env` | 460 | 53 |

Commits, in order:

| Commit | Subject |
|---|---|
| `1d0752a1c` | TD-67 Return skeleton: census and recorded history |
| `77d33c5b1` | TD-67 design: C2 states a module export check as a declared command |
| `3b18d02b9` | TD-67 code: retire the module-export predicate and the helper's module import |
| `3c3c4a26f` | TD-67 tests: three scenarios state their module checks as declared commands |
| `7f934403c` | TD-67 tests: the qualification reader refuses an observation carrying the retired kind |
| (this commit) | TD-67 Return |
