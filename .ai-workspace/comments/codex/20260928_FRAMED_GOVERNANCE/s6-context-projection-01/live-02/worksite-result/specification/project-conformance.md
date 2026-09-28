# Project Conformance: basic-cli Hello World

- Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC` (key `basic-cli`, kind `node_cli`)
- Stage realized by this asset: `conformance_project`
- Status: authored specification. This file does not accept, admit, or claim any
  outcome. Acceptance belongs to the independent assessment and the parent
  termination rule.

## 1. Governing sources

This specification restates its sources. It does not replace them. Every
evaluation that needs the complete original source or the oracle must read
those files directly.

| Short ref | Path | SHA-256 | Role |
|---|---|---|---|
| `OS` | `source/original-basic-cli.txt` (4325 bytes) | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` | Complete original task. Its stage plan and instructions are the constitutional Product meaning. |
| `OR` | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` | Independent oracle: case, minimum passes, required artifacts, required stage meanings and assessment rule. |
| `WC` | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` | Witness case contract: authorship, evidence, revision, write-territory and completion law for this Run. |

Citations below use the form `OS:L13` (source line), `OR:field` and `WC:L48`.
Where `OS` and `WC` differ, section 7 records the conflict. This specification
does not resolve a conflict silently.

## 2. Intent

The goal is a minimal Node.js command-line program at
`generated/hello-world.mjs`. When run with `node` and no arguments, it writes
exactly `Hello, world!` followed by one newline to stdout and exits with status
0. The source must also produce a traceable software-build traversal: a
conformance specification, an implementation design, the source, a test design,
component and UAT test sources, a test execution plan, and a truthful
execution result that is accepted only on real observed success
(`OS:L7-86`, `OR:purpose`, `OR:assessment`).

"Software-build traversal" means this SDLC stage sequence and its artifacts.
It does not imply a compile, bundle, transpile or package step; the source
declares none (`OS:L33`). This reading is interpretation U-8 in section 8.

## 3. Product boundary

### 3.1 In scope

| Element | Exact subject | Source |
|---|---|---|
| Product entry | `generated/hello-world.mjs`, invoked as `node generated/hello-world.mjs` from the project root | `OS:L12`, `OS:L23`, `OS:L30`, `OS:L43`, `WC:L54` |
| Input | No command-line arguments. No stdin or environment input is declared. | `OR:cases[0].arguments = []` |
| Output | stdout exactly `Hello, world!\n` | `OS:L13`, `OS:L24`, `OS:L34`, `OR:cases[0].stdout` |
| Exit | Process exit status `0` | `OS:L43`, `OS:L53`, `OR:cases[0].exitStatus`, `WC:L48` |
| Runtime | Node, with no package installation | `OS:L33`, `WC:L48`, `WC:L91` |
| Verifiers | `test/component/hello-cli.test.mjs` and `test/uat/hello-cli.uat.test.mjs`, run by `node --test` | `OS:L47-64`, `OR:requiredTestFiles`, `WC:L55` |
| Traversal artifacts | `specification/project-conformance.md`, `design/implementation-design.md`, `design/test-design.md`, `test-execution-plan.json` | `OS:L8`, `OS:L19`, `OS:L39`, `OS:L69`, `OR:requiredArtifacts`, `WC:L23-32` |

### 3.2 Out of scope

- Package manifests, lockfiles, `node_modules`, and any network or registry
  dependency (`OS:L14`, `OS:L33`, `WC:L91`).
- Behavior when arguments, stdin or environment variations are supplied (U-1).
- Any stderr content requirement (U-2).
- Build, compile or bundle steps, installers, and distribution packaging.
- Changes to the original source, the oracle, the witness contract, or the
  supplied test sources (`WC:L88-93`).

### 3.3 Write territory and protected subjects

| Path | Disposition in this witness | Source |
|---|---|---|
| `generated/hello-world.mjs` | Application write territory. Correction must stay bounded to this file. | `WC:L89-90` |
| `specification/project-conformance.md`, `design/implementation-design.md`, `design/test-design.md`, `test-execution-plan.json` | Application write territory. Each is freshly authored by its own native work. They were absent initially. | `WC:L20-23`, `WC:L89-90` |
| `source/original-basic-cli.txt`, `source/basic-cli.oracle.json`, `source/witness-contract.md` | Protected. Digests must remain as in section 1. | `WC:L88` |
| `test/component/hello-cli.test.mjs` (`sha256:8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613`), `test/uat/hello-cli.uat.test.mjs` (`sha256:5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4`) | Protected supplied verifiers. They may be reused if they are adequate (R-7, R-8). They do not count as newly authored work. | `WC:L17-19`, `WC:L35-36`, `WC:L88` |
| Command evidence | Separately declared runtime territory. The application does not author it. | `WC:L90` |

## 4. Traversal declaration

This traversal is minimal. Each original stage maps to one artifact or one
evidence carrier. No extra documents or stages are required (`WC:L36-37`).
Stage order is the original's meaning order. The witness does not require a
fixed execution schedule (`WC:L43-44`, `WC:L58-61`), but a stage that names a
predecessor as authority must be authored after that predecessor exists.

| # | Original stage | Artifact or carrier | Carrier in this witness | Governing requirements |
|---|---|---|---|---|
| 1 | `conformance_project` | `specification/project-conformance.md` | Native authorship (this file) | R-1..R-15 |
| 2 | `implementation_design` | `design/implementation-design.md` | Native authorship. Must cite this file as authority (`OS:L22`). | R-5 |
| 3 | `source` | `generated/hello-world.mjs` | Supplied unverified. Baseline measured, then corrected in the same lineage. | R-1..R-4, R-13 |
| 4 | `test_design` | `design/test-design.md` | Native authorship | R-6 |
| 5 | `component_test_source` | `test/component/hello-cli.test.mjs` | Supplied and reused if adequate | R-7 |
| 6 | `uat_test_source` | `test/uat/hello-cli.uat.test.mjs` | Supplied and reused if adequate | R-8 |
| 7 | `test_execution_plan` | `test-execution-plan.json` | Native authorship | R-9 |
| 7' | `test_execution_plan`, result part | `test-execution-result.json` in `OS` | Not authored. Admitted C2 command-execution observations carry the meaning (C-1). | R-10 |
| 8 | `test_execution_result` | No files (`OS:L84`) | Independent assessment over admitted C2 evidence and the plan | R-11, R-12 |

## 5. Requirements

Each requirement uses MUST in the source's strict sense. None adds to or
narrows the cited source. Items marked *interpretation* are this
specification's reading of an open point and are open to independent
assessment.

- **R-1 Source surface.** The CLI source MUST be the single file
  `generated/hello-world.mjs` (`OS:L12`, `OS:L23`, `OS:L30`,
  `OR:requiredArtifacts`).
- **R-2 Runtime independence.** `node generated/hello-world.mjs` MUST run
  without package installation. The CLI MUST NOT import anything except Node
  built-ins, and it needs no package manifest, lockfile or `node_modules`. No
  package or network dependency is allowed (`OS:L14`, `OS:L33`, `WC:L48`,
  `WC:L91`).
- **R-3 Exact stdout.** With no arguments, stdout MUST be exactly the 14 bytes
  `Hello, world!\n`: hex `48656c6c6f2c20776f726c64210a`, SHA-256
  `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`. That is
  one comma, one space, one `!`, one LF, no CR, and no leading or extra
  trailing bytes (`OS:L13`, `OS:L24`, `OS:L34`, `OR:cases[0].stdout`).
- **R-4 Successful exit.** The CLI process MUST exit with status `0`, without
  timing out or being terminated by a signal (`OS:L43`, `OS:L53`,
  `OR:cases[0].exitStatus`, `WC:L48`).
- **R-5 Implementation design content.** `design/implementation-design.md` MUST:
  (a) cite this conformance asset as its authority (`OS:L22`);
  (b) define a minimal Node CLI script at `generated/hello-world.mjs`
  (`OS:L23`);
  (c) specify that it prints exactly `Hello, world!` followed by one newline
  (`OS:L24`);
  (d) name the component and UAT test source surfaces
  `test/component/hello-cli.test.mjs` and `test/uat/hello-cli.uat.test.mjs`,
  which execute the CLI and assert stdout (`OS:L25`);
  (e) be realizable and faithful to this specification, covering both source
  and verification surfaces (`WC:L27-28`).
- **R-6 Test design content.** `design/test-design.md` MUST specify component
  and UAT validation of the CLI stdout contract (`OS:L42`). Both tests MUST
  spawn `node generated/hello-world.mjs` and assert status `0` and stdout
  exactly `Hello, world!\n` (`OS:L43`). The checks MUST exercise the actual
  CLI process, not a stub, import or copied string (`WC:L29-30`).
- **R-7 Component verifier adequacy.** `test/component/hello-cli.test.mjs`
  MUST use `node:test`, `node:assert/strict` and `spawnSync` from
  `node:child_process` (`OS:L51`). It MUST run `process.execPath` with
  `["generated/hello-world.mjs"]` from the project root (`OS:L52`). It MUST
  assert status `0` and stdout exactly `Hello, world!\n` (`OS:L53`).
- **R-8 UAT verifier adequacy.** `test/uat/hello-cli.uat.test.mjs` MUST meet
  the same three conditions (`OS:L61-62`). It MUST assert that the
  user-visible output is exactly `Hello, world!\n` (`OS:L63`). Its additional
  status-`0` assertion is consistent with `OS:L43` and is allowed.
- **R-9 Execution plan content.** `test-execution-plan.json` MUST be valid
  JSON with these fields:
  - `command` equal to `"node"` (`OS:L72`).
  - `args` exactly
    `["--test", "test/component/hello-cli.test.mjs", "test/uat/hello-cli.uat.test.mjs"]`
    (`OS:L73`).
  - `expectedTestPassCount` an integer `>= 2` (`OS:L74`, `OR:minimumTestPasses`).
  - `expectedStdoutMatch` containing stable zero-failure evidence such as
    `fail 0`, and no exact pass-count fragment such as `pass 2` (`OS:L75`).
  - `assertedReturnValue` equal to `"Hello, world!"`, with no newline
    (`OS:L76`).

  The plan MUST agree with the fixed command selection `node
  generated/hello-world.mjs` and `node --test
  test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`
  (`WC:L52-57`). *Interpretation:* the test command fills the original
  `command` and `args` fields. The plan SHOULD also declare the direct CLI
  command with expected stdout `Hello, world!\n` and status `0`, because
  `WC:L31` requires "the declared commands" plural. It MUST NOT declare any
  command that contradicts either selection. The plan declares expectations
  only; it is not the runtime source of the commands (`WC:L57-58`).
- **R-10 Truthful execution-result meaning.** The observed command, args,
  integer status, stdout, stderr, cwd and env, plus the resulting test
  observations (`OS:L78`), MUST come from actual admitted C2
  command-execution observations of the fixed commands. They MUST NOT come
  from a handwritten, fabricated or native-author-reported file
  (`WC:L58-63`, `OR:assessment`). `expectedTestPassCount`,
  `expectedStdoutMatch` and `assertedReturnValue` stay plan-declared
  expectations that the assessment compares against those observations.
- **R-11 Result acceptance rule.** The `test_execution_result` meaning MUST
  accept only if all three conditions hold (`OS:L85`):
  1. The admitted observation of the test command has exit status `0`.
  2. `observedTestPassCount >= expectedTestPassCount` from the plan.
  3. `planSatisfied` is true.

  *Interpretation:* `observedTestPassCount` is the integer `N` in the test
  reporter's `pass N` summary in the admitted stdout. `planSatisfied` means
  all of the following: the test command exited `0`; the reported fail count
  is `0`; every `expectedStdoutMatch` fragment appears in the admitted stdout;
  and the admitted direct CLI observation has status `0` and stdout equal to
  `assertedReturnValue + "\n"`.
- **R-12 Coverage and pairing.** Both required test files MUST actually
  execute the current CLI in the admitted run (`OR:requiredTestFiles`,
  `WC:L49-50`). The run MUST report at least 2 passes and 0 failures
  (`OR:minimumTestPasses`). The component test (`CLI process satisfies its
  output contract`) and the UAT test (`a user receives the exact promised
  greeting`) MUST each be reported passing. A scalar success, such as exit 0
  alone or UAT alone, MUST NOT replace this component-and-UAT pairing
  (`WC:L78-79`).
- **R-13 Revision lineage.** The following MUST hold (`WC:L41-46`,
  `WC:L65-69`):
  - The supplied CLI's actual behavior is measured before any change.
  - Its material failure remains admitted historical evidence bound to that
    exact earlier subject.
  - The correction is a bounded edit to `generated/hello-world.mjs`, justified
    by that failure.
  - Current behavior is proved by fresh admitted observation of the corrected
    subject.
  - The old failure is never retargeted to the new bytes and never discarded
    because the bytes changed.
- **R-14 Protection.** The protected digests in sections 1 and 3.3 MUST be
  unchanged at completion. No test-source edit, oracle change, answer repair,
  out-of-band application edit or caller-owned retry loop is allowed
  (`WC:L88-94`).
- **R-15 Non-shrinking criteria.** These requirements and criteria MUST NOT be
  narrowed after results are observed (`WC:L94`). An observed result that
  falls short stays a failure. It is not a reason to relax an expectation.

## 6. Acceptance criteria

Each criterion is a checkable predicate over exact subjects. The CLI and test
criteria are evaluated only against admitted C2 observations whose recorded
file digests identify the current subject. A native author's local run does
not satisfy them (`WC:L62-63`).

| ID | Predicate | Checks | Evidence carrier |
|---|---|---|---|
| AC-1 | Command `node`, args `["generated/hello-world.mjs"]`, relative cwd `.`: `exitStatus === 0`, `timedOut === false`, no process signal, and stdout bytes equal hex `48656c6c6f2c20776f726c64210a` (digest `d9014c46…2ff5`, `byteLength` 14) | R-1, R-3, R-4 | Admitted C2 observation of command 1 on the current CLI digest |
| AC-2 | The current CLI source imports only `node:`-scheme built-ins or nothing. No package manifest or installed dependency is needed for AC-1 to hold. | R-2 | Inspection of current CLI bytes plus AC-1 |
| AC-3 | Command `node`, args `["--test","test/component/hello-cli.test.mjs","test/uat/hello-cli.uat.test.mjs"]`, relative cwd `.`: `exitStatus === 0`, reporter `pass N` with `N >= 2`, reporter `fail 0`, and both named tests reported passing | R-12, R-11 | Admitted C2 observation of command 2 on the current CLI and test digests |
| AC-4 | The test-source digests equal the section 3.3 values, and their content meets R-7 and R-8 | R-7, R-8, R-14 | Digest comparison plus content inspection |
| AC-5 | `design/implementation-design.md` exists and meets R-5 (a) to (e) | R-5 | Independent content assessment |
| AC-6 | `design/test-design.md` exists and meets R-6, naming both actual test surfaces | R-6 | Independent content assessment |
| AC-7 | `test-execution-plan.json` parses, and all of these hold: `command === "node"`; `args` deep-equals the R-9 array; `Number.isInteger(expectedTestPassCount) && expectedTestPassCount >= 2`; `expectedStdoutMatch` contains `fail 0` and no fragment matching `/pass \d+/`; `assertedReturnValue === "Hello, world!"`; no declared command contradicts `WC:L54-55` | R-9 | Parse plus predicate check and correspondence assessment |
| AC-8 | The execution-result meaning is taken from admitted C2 records that carry executable, args, relative cwd, environment, exit status, stdout and stderr. No authored `test-execution-result.json` stands in for them. | R-10 | Admitted C2 records |
| AC-9 | The R-11 rule evaluates to *accept*, with plan expectations from AC-7 and observations from AC-1 and AC-3 | R-11 | Independent assessment |
| AC-10 | Both of these exist: (a) an admitted baseline observation on the pre-change CLI digest with a material failure, recorded as historical; and (b) an admitted observation on the corrected current digest meeting AC-1 and AC-3. There is an explicit causal link from (a) to the bounded correction to (b). | R-13 | Admitted C2 observations plus the construction observation |
| AC-11 | The section 1 and 3.3 protected digests are unchanged. The only application-territory writes are to the paths in section 3.3. | R-14 | Digest comparison over admitted file records |
| AC-12 | An independent assessment, by an actor or call distinct from the author and the measurement producer, consumed current evidence and examined AC-1 to AC-11 | `WC:L81-86` | Assessment observation |

Completion of the original outcome requires every criterion AC-1 to AC-12 to
hold at the same time over one consistent set of current subject digests. If
any criterion is missing, unknown or stale, the parent stays open
(`WC:L77-78`).

## 7. Conflicts preserved

| ID | Conflict | Sources | Disposition |
|---|---|---|---|
| C-1 | `OS` requires the plan stage to also write `test-execution-result.json` with the recorded observation (`OS:L69`, `OS:L71`, `OS:L78`). `WC` limits application writes to the CLI and four assets, and says that meaning comes from admitted C2 evidence, not a handwritten receipt (`WC:L58-63`, `WC:L89-90`). `OR` omits that file from `requiredArtifacts` and assigns the meaning to admitted C2 evidence (`OR:assessment`). | `OS` vs `WC`, `OR` | The case authority (`WC`, `OR`) resolves this: the meaning is kept and only the carrier changes (R-10). This specification applies that resolution but does not own it. |
| C-2 | `OS:L68` and `OS:L77` say the worker runs the tests itself and "the framework executes nothing". `WC` requires actual admitted C2 execution and rules a native author's report insufficient (`WC:L61-63`). | `OS` vs `WC` | Resolved by `WC` in the same way as C-1. Truthfulness of the observation is preserved; the executor changes. |
| C-3 | `OS` orders the stages source-after-conformance. In the actual lineage, the CLI was measured and corrected before this conformance existed. | `OS` order vs actual lineage | Permitted by `WC:L43-46`. The CLI's conformance to this specification is not inferred from the order. It must be shown by AC-1, AC-2 and AC-10 over current evidence. |
| C-4 | `OS` has stages that author the component and UAT test sources (`OS:L47-64`). `WC` supplies them unchanged and protected (`WC:L17-19`, `WC:L88`). | `OS` vs `WC` | Resolved by `WC:L35-36`: reuse is allowed if they are adequate. Adequacy is judged against the original stage text through R-7, R-8 and AC-4. They do not count as new authorship. |

## 8. Unknowns and interpretations

- **U-1 Arguments, stdin and environment.** The source and oracle define only
  the no-argument case. Behavior with other inputs is unspecified and not
  required.
- **U-2 stderr.** No source constrains stderr. Admitted runs observed empty
  stderr. This is recorded as an observation, not added as a criterion.
- **U-3 Node version and reporter format.** The source pins no Node version.
  The admitted C2 records give `PATH` but not the resolved `node` executable
  or its version, so that coordinate is unrecorded. The summary format varies
  by Node version and reporter: spec reporter `ℹ fail 0` versus TAP
  `# fail 0`. The substring `fail 0` matches both, which is why R-9 uses it.
- **U-4 Working-directory dependence.** Both tests pass the relative path
  `generated/hello-world.mjs` without setting `cwd`. They satisfy "from the
  project root" (`OS:L52`, `OS:L62`) only when invoked from the root. The
  admitted runs record relative cwd `.`. Running from another directory is
  outside the declared commands.
- **U-5 `planSatisfied` and `observedTestPassCount`.** `OS:L85` uses both terms
  without defining them. R-11 gives this specification's interpretation.
- **U-6 Direct CLI command in the plan.** Whether the plan must declare
  command 1 alongside the original `command`/`args` fields is not settled by
  `OS`. R-9 treats it as SHOULD, based on `WC:L31` and `WC:L57`.
- **U-7 Baseline source bytes.** The pre-change CLI's bytes are not in the
  readable worksite; only its digest and admitted outputs are. The
  construction author reported the earlier content as
  `console.log("Hello world!");`. That is an attributed author report, not C2
  evidence.
- **U-8 "Software-build".** This is read as the SDLC traversal in section 4,
  with no compile or package step.
- **U-9 Platform.** `console.log` emits LF on every platform. The admitted
  runs are on macOS only, so other platforms are unobserved.

## 9. Evidence lineage known at authoring (informative, not acceptance)

This section records the admitted observations this specification's author
could see. It does not decide any criterion. It becomes stale as soon as the
cited digests stop being current.

| Subject | CLI digest | Observation | Result |
|---|---|---|---|
| Baseline, supplied unverified CLI | `sha256:647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993` | C2 `worksite-command-observation://abiogenesis/d7a6c742…07ce` (command 1) | exit `0`, stdout `Hello world!\n` (13 bytes, `0ba904ea…91dd8`), comma missing, so R-3 fails |
| Baseline | same | C2 `…/eb7e0c91…49d0` (command 2) | exit `1`, `tests 2`, `pass 0`, `fail 2`. Both tests failed on stdout `'Hello world!\n'` versus expected `'Hello, world!\n'`. This is the adverse `nonzero` disposition selected for revision. |
| Correction | `647697a5…` → `sha256:fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef` | Native construction `result://abiogenesis/a55f6c05…a3f3` | `changedPaths: ["generated/hello-world.mjs"]` only. Protected digests unchanged. |
| Corrected, current at authoring | `fe8f4080…e9ef` | C2 `…/46f72954…c0ba4` (command 1) | exit `0`, stdout `Hello, world!\n` (14 bytes, `d9014c46…2ff5`), stderr empty |
| Corrected, current at authoring | same | C2 `…/69ff716a…a9ab` (command 2) | exit `0`, `tests 2`, `pass 2`, `fail 0`. Both named tests passed. |

The baseline failure stays evidence about `647697a5…` only (R-13). Observations
on `fe8f4080…` bear on AC-1, AC-3 and AC-10 only while that digest is current.
At the time of authoring, `design/implementation-design.md`,
`design/test-design.md` and `test-execution-plan.json` are absent. AC-5, AC-6,
AC-7 and AC-9 are therefore unmet, and AC-12 has not been performed.

## 10. Invalidation

- Any change to the CLI bytes makes CLI and test observations of the earlier
  bytes stale for current-behavior claims. The history they record is kept.
- A change to either test source invalidates AC-3, AC-4 and R-7/R-8 adequacy.
- A change to `OS`, `OR` or `WC` invalidates this specification.
- A material change to this specification invalidates any design or plan that
  cites it as authority, for the affected requirements only.
