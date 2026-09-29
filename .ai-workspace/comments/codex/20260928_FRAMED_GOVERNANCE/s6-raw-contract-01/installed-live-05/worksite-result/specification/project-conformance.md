# Project Conformance — basic-cli (`SCN-GLC-HELLO-WORLD-CLI-BASIC`)

Stage meaning: `conformance_project` of the original source.
Scenario kind: `node_cli`. Scenario key: `basic-cli`.

This document states the Intent, Product boundary, source-grounded requirements,
and completion criteria for the basic-cli task. It is the authority that
`design/implementation-design.md` must use (original `implementation_design`
stage: "Use the prior conformance_project artifact as authority."). It does not
accept any artifact or behavior. Acceptance belongs to an independent assessment
of current admitted evidence.

## 0. Governing basis

| Input | Path | SHA-256 | Role |
|---|---|---|---|
| Original source | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` | Product meaning. Every stage instruction is preserved. |
| Independent oracle | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` | Evaluation cases, minimum passes, required artifacts |
| Witness contract | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` | Case obligations, selected mechanisms, and scope |
| Supplied component test | `test/component/hello-cli.test.mjs` | `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613` | Reused verifier, not newly authored |
| Supplied UAT test | `test/uat/hello-cli.uat.test.mjs` | `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4` | Reused verifier, not newly authored |

Where this document and those inputs disagree, the inputs govern. This document
only makes their meaning explicit. The conflicts I found are listed in §6. They
are kept visible, not resolved silently.

## 1. Intent

Declare and complete a minimal CLI Hello World software-build traversal. The
traversal runs from specification, through design, source and tests, to an
actual execution proof. Its result is a Node command-line program. When a user
runs it with no arguments, it prints exactly `Hello, world!` followed by one
newline and exits successfully. The software-build claim is established by
actually running the CLI and its tests and observing the result. The existence
of files or a self-reported receipt does not establish it.

## 2. Product boundary

### 2.1 Product subject

- **CLI source surface:** `generated/hello-world.mjs`, an ECMAScript module run
  directly by Node. This is the only application source file.
- **Supported entry:** `node generated/hello-world.mjs`, run with the project
  root as the working directory and no arguments (oracle `cases[0].arguments: []`).
- **Observable exit behavior:**
  - The process writes exactly `Hello, world!\n` to stdout.
  - It terminates normally with exit status `0`.

### 2.2 Verification surfaces

- `test/component/hello-cli.test.mjs`: component check of the CLI process's
  output contract.
- `test/uat/hello-cli.uat.test.mjs`: user-acceptance check of the greeting the
  user sees.
- The test command: `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`,
  run from the project root.

### 2.3 Authored traversal assets

| Stage meaning (original) | Artifact | Realization in this witness lineage |
|---|---|---|
| `conformance_project` | `specification/project-conformance.md` | Newly authored (this document) |
| `implementation_design` | `design/implementation-design.md` | Must be newly authored. It uses this document as authority. |
| `source` | `generated/hello-world.mjs` | Supplied unverified. The baseline measurement showed a defect, and a bounded correction followed (§7). |
| `test_design` | `design/test-design.md` | Must be newly authored |
| `component_test_source` | `test/component/hello-cli.test.mjs` | Supplied and reused unchanged. Not counted as new authorship. |
| `uat_test_source` | `test/uat/hello-cli.uat.test.mjs` | Supplied and reused unchanged. Not counted as new authorship. |
| `test_execution_plan` | `test-execution-plan.json` | Must be newly authored. See §6 C-1 for the original `test-execution-result.json`. |
| `test_execution_result` | none (the original says "Produce no files") | An acceptance predicate evaluated over admitted command-execution evidence |

The original lists these stages in order. Only the following dependencies
between stage meanings are required:

- The implementation design takes its authority from this document.
- The test design, the execution plan and the tests must agree with this
  document.
- The execution result must be observed on the current CLI bytes.
- The CLI's actual behavior must be measured before the CLI is changed (witness
  contract).

No other schedule is imposed.

### 2.4 Exclusions (outside the Product boundary)

- Package files and installation. This includes `package.json`, lockfiles,
  `node_modules`, any third-party dependency, and any network access. The
  sources are the `source` stage ("without package installation") and the
  witness contract ("no package/network dependency").
- Command-line arguments, stdin, flags, help or version output, localization,
  and configuration. The oracle defines only the no-argument case.
- Any output other than the specified stdout.
- Any alternative entry point, such as a bin shim or wrapper script.
- A handwritten execution-result or receipt file used as proof (see §6 C-1 and
  C-2).

### 2.5 Protected inputs

The following must remain byte-identical to their §0 digests:

- `source/original-basic-cli.txt`
- `source/basic-cli.oracle.json`
- `source/witness-contract.md`
- `test/component/hello-cli.test.mjs`
- `test/uat/hello-cli.uat.test.mjs`

Application writes are confined to five paths:

- `generated/hello-world.mjs`
- `specification/project-conformance.md`
- `design/implementation-design.md`
- `design/test-design.md`
- `test-execution-plan.json`

Command evidence keeps its own separately declared territory.

## 3. Requirements

Each requirement cites its grounding in the original source (by stage), the
oracle, or the witness contract (WC).

**R-01 Source surface.** The CLI source surface is exactly
`generated/hello-world.mjs`.
Grounding:
- original `conformance_project`: "The source surface must be generated/hello-world.mjs."
- `implementation_design`: "Define a minimal Node CLI script at generated/hello-world.mjs."
- `source`: `filesToProduce`
- oracle: `requiredArtifacts`

**R-02 No installation.** The script runs under `node` with no package
installation. It depends on nothing outside the Node runtime. It currently
imports nothing; any future import is limited to `node:` builtins.
Grounding:
- original `source`: "The script must execute under node without package installation."
- WC: "runs under Node without package installation", "no package/network dependency"

**R-03 Exact stdout.** With no arguments, stdout is exactly the 14-byte UTF-8
string `Hello, world!\n`:
- hex `48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 0a`
- SHA-256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`

This requires, in order:
- A capital `H`.
- A comma directly after `Hello`.
- One space.
- A lowercase `world`.
- A `!`.
- Exactly one LF.

It also rules out:
- Leading or trailing whitespace.
- A CR.
- Any additional line.

Grounding:
- original `conformance_project` ("observe stdout exactly \"Hello, world!\\n\"")
- `implementation_design` ("exactly \"Hello, world!\" followed by one newline")
- `source` ("write exactly \"Hello, world!\\n\" to stdout")
- `test_design`, `component_test_source`, `uat_test_source`
- oracle `cases[0].stdout`
- WC

**R-04 Successful exit.** The CLI exits with status `0`. It is not terminated by
a signal and does not time out.
Grounding:
- original `test_design` and `component_test_source` ("assert status 0")
- oracle `cases[0].exitStatus: 0`
- WC ("exits zero")

**R-05 Invocation.** The canonical invocation is `node generated/hello-world.mjs`
with the project root as the working directory and no arguments. The path is
relative, so conformance is defined only for that working directory.
Grounding:
- oracle `cases[0].arguments: []`
- original component and UAT stages ("from the project root")
- WC fixed command 1

**R-06 Component verifier.** `test/component/hello-cli.test.mjs` must meet all
of the following:
- It uses `node:test`, `node:assert/strict`, and `spawnSync` from
  `node:child_process`.
- It spawns `process.execPath` with `["generated/hello-world.mjs"]` from the
  project root, meaning the inherited working directory with no `cwd` override.
- It asserts status `0`.
- It asserts that stdout is strictly equal to `Hello, world!\n`.
- It must execute the real CLI. It must not stub, mock, or inline the greeting
  in place of the process output.

Grounding: original `component_test_source`, `test_design`; oracle
`requiredTestFiles`.

**R-07 UAT verifier.** `test/uat/hello-cli.uat.test.mjs` meets the same
requirements as R-06, stated from the user's view: the user-visible CLI output
is exactly `Hello, world!\n`. The `test_design` stage also requires status `0`
for both tests.
Grounding: original `uat_test_source`, `test_design`; oracle `requiredTestFiles`.

**R-08 Test execution.** `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`,
run from the project root, must satisfy all of the following:
- The run exits with status `0`.
- It reports zero failures.
- It reports at least 2 passing tests.
- Both test files actually spawn the current CLI.
- At least one passing test comes from each file. A scalar pass count reached
  by only one file does not satisfy the component/UAT pairing.

Grounding:
- original `test_execution_plan` and `test_execution_result`
- oracle `minimumTestPasses: 2`, `assessment`
- WC fixed command 2 ("at least two passes and zero failures"; "Scalar UAT success cannot replace the required pairing and coverage relation")

**R-09 Execution plan.** `test-execution-plan.json` is a JSON document with the
following fields:
- `command` is `"node"`.
- `args` is exactly `["--test", "test/component/hello-cli.test.mjs", "test/uat/hello-cli.uat.test.mjs"]`.
- `expectedTestPassCount` is an integer `>= 2`, matching the component-plus-UAT
  coverage floor.
- `expectedStdoutMatch` includes stable zero-failure evidence such as `fail 0`.
  It must not pin an exact pass-count fragment (for example `pass 2`).
- `assertedReturnValue` is `"Hello, world!"`.

The plan must also agree with fixed command 1 (`node generated/hello-world.mjs`,
expected stdout `Hello, world!\n`, exit `0`) and must not contradict it. The plan
declares expectations. It is not the runtime source of the commands.
Grounding: original `test_execution_plan`; oracle `requiredArtifacts`; WC.

**R-10 Execution-result meaning.** Each execution result records the truthful
observed values of:
- command
- args
- integer exit status
- stdout
- stderr
- expectedTestPassCount
- expectedStdoutMatch
- assertedReturnValue
- working directory
- environment

It also records the resulting test observations: tests, pass and fail counts,
and test names. This meaning is carried by admitted command-execution (C2)
evidence produced by an actual run. It is not carried by a handwritten file or
by an author's report (§6 C-1 and C-2).
Grounding: original `test_execution_plan` and `test_execution_result`; oracle
`assessment`; WC.

**R-11 Implementation design content.** `design/implementation-design.md` must:
- use this document as authority;
- define a minimal Node CLI script at `generated/hello-world.mjs` that prints
  exactly `Hello, world!` followed by one newline, needs no packages, and exits
  `0`;
- name both test source surfaces and state that they execute the CLI and
  assert stdout;
- be realizable by the actual current source.

Grounding: original `implementation_design`; WC.

**R-12 Test design content.** `design/test-design.md` must specify component and
UAT validation of the CLI stdout contract. Both tests must:
- spawn `node generated/hello-world.mjs` (`process.execPath` with
  `["generated/hello-world.mjs"]`) from the project root;
- assert status `0`;
- assert stdout exactly `Hello, world!\n`.

It must also bind to the actual supplied test sources and the test command.
Grounding: original `test_design`; WC ("meaningful component and user-outcome
checks of the actual CLI").

**R-13 Revision lineage.** Before the CLI is changed, its actual behavior must be
measured with both fixed commands. The following must then hold:
- A material failure remains admitted evidence about the exact earlier bytes.
- Any correction is bounded, justified by that failure, and made in the same
  witness lineage.
- Current behavior is proved on the corrected bytes.
- The old failure is not retargeted to the new bytes. It is not discarded
  either.
- Only support whose claim depends on the old bytes remaining current becomes
  stale.

Grounding: WC ("Evidence, correction and final outcome").

**R-14 Scope protection.** The protected inputs (§2.5) stay unchanged. Writes
stay within §2.5. There is no oracle change, no answer repair, no out-of-band
application edit, and no automatic retry. The first unexpected failure is kept
and returned.
Grounding: WC ("Admitted completion and scope"); original `conformance_project`
("Do not write source, tests, package files, or execution plans in this vector").

## 4. Acceptance criteria

Each criterion is a check with a decidable predicate. A criterion that depends
on execution is met only by admitted command-execution evidence on the current
subject. My own local run does not count.

| ID | Req | Check | Pass predicate |
|---|---|---|---|
| AC-01 | R-01, R-03, R-04, R-05 | Run `node generated/hello-world.mjs` with cwd `.` and no arguments. | `exitStatus === 0`, no signal, `timedOut === false`, stdout `byteLength === 14`, and stdout text `=== "Hello, world!\n"` (SHA-256 `d9014c46…72ff5`). The evidence must bind the current `generated/hello-world.mjs` digest. |
| AC-02 | R-02 | Inspect the CLI source and the worksite. | The CLI imports no non-`node:` module. No package file or dependency installation is required or created by application work. AC-01 runs with no install step. |
| AC-03 | R-06, R-07 | Read both test sources statically. | Each file imports `node:test`, `node:assert/strict`, and `spawnSync` from `node:child_process`. Each calls `spawnSync(process.execPath, ['generated/hello-world.mjs'], …)` with no `cwd` override. Each strictly asserts `status === 0` and `stdout === 'Hello, world!\n'`. Neither contains a stub or mock of the CLI. Both digests equal §0. |
| AC-04 | R-08 | Run `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs` with cwd `.`. | `exitStatus === 0`, stdout contains `fail 0`, the reported pass count is `>= 2` and `>= expectedTestPassCount`, and the reported fail count is `0`. At least one passing test comes from each file. For the current supplied sources, both `CLI process satisfies its output contract` and `a user receives the exact promised greeting` are reported as passing. The evidence must bind the current CLI and test digests. |
| AC-05 | R-06, R-07, R-13 | Check the verifiers' ability to discriminate, using admitted baseline evidence. | On a CLI whose stdout differs from R-03, both tests failed. This shows the tests exercise the real process output and do not pass vacuously. |
| AC-06 | R-09 | Parse `test-execution-plan.json`. | `command === "node"`. `args` deep-equals the R-09 array. `Number.isInteger(expectedTestPassCount) && expectedTestPassCount >= 2`. `expectedStdoutMatch` contains `fail 0` and no exact pass-count fragment. `assertedReturnValue === "Hello, world!"`. Nothing in the plan contradicts fixed command 1 or R-03/R-04. Every `expectedStdoutMatch` fragment appears in the admitted AC-04 stdout. |
| AC-07 | R-10 | Inspect the admitted C2 evidence for AC-01 and AC-04. | The evidence records the executable, args, environment, relative cwd, integer exit status, stdout and stderr (text, length, digest), and input file digests. It was produced by an actual command-execution observation, not by a native author's report or a handwritten file. |
| AC-08 | `test_execution_result` | Evaluate over AC-04 evidence and the AC-06 plan. | The plan command exited `0`, `observedTestPassCount >= expectedTestPassCount`, and `planSatisfied` is true. `planSatisfied` means every plan expectation holds against the admitted observation. |
| AC-09 | R-11 | Assess `design/implementation-design.md`. | It meets every R-11 clause and is consistent with this document and the current CLI. |
| AC-10 | R-12 | Assess `design/test-design.md`. | It meets every R-12 clause and matches the actual test sources and the test command. |
| AC-11 | R-13 | Inspect the lineage. | Admitted baseline evidence exists on the pre-change CLI digest. A bounded correction exists whose changed path is only `generated/hello-world.mjs`. Admitted post-correction evidence exists on the new digest. The causal link between these is explicit. The baseline is still attributed to its original bytes. |
| AC-12 | R-14 | Recompute digests and review changed paths. | The §2.5 protected inputs match §0 and all changed paths fall within §2.5. Any disclosed out-of-scope action is recorded for assessment. |

**Completion.** The complete original outcome is complete only when all of the
following hold:

- AC-01 through AC-12 hold on the current subject.
- The four authored assets (this document, the two design documents, and the
  execution plan) are substantively present, not merely present as files.
- An independent semantic assessment accepts the result. It must consume current
  admitted evidence and be performed by an actor/call distinct from the authors
  and the measurement producer.

If any required support is missing, unknown, or stale, the outcome stays open.
Criteria do not shrink after results are observed.

## 5. Traceability to the oracle

| Oracle field | Requirement / criterion |
|---|---|
| `cases[0]` (`arguments: []`, `stdout: "Hello, world!\n"`, `exitStatus: 0`) | R-03, R-04, R-05 / AC-01 |
| `minimumTestPasses: 2` | R-08, R-09 / AC-04, AC-06, AC-08 |
| `requiredArtifacts` (7 paths) | §2.3 / AC-03, AC-06, AC-09, AC-10, and this document |
| `requiredTestFiles` | R-06, R-07 / AC-03, AC-04 |
| `requiredStageMeanings` (8 stages) | §2.3 (every stage is dispositioned) |
| `assessment` | R-08, R-10 / AC-04, AC-07, Completion |

## 6. Preserved conflicts and their dispositions

- **C-1 `test-execution-result.json`.**
  - The original `test_execution_plan` stage produces both
    `test-execution-plan.json` and `test-execution-result.json`.
  - The oracle's `requiredArtifacts` omits the result file.
  - The WC confines application writes to the CLI and four assets. It states
    that the predecessor's handwritten execution-receipt mechanics are realized
    by the declared graph and admitted C2 evidence.
  - Disposition: the result file's *meaning* is kept in full (R-10, AC-07,
    AC-08) and carried by admitted C2 evidence. No handwritten result file is
    authored. This substitutes a different mechanism. It does not drop the
    requirement.
- **C-2 Execution-default law.**
  - The original says: "run node --test … yourself inside this turn; the
    framework executes nothing."
  - The WC says: "A fabricated success file or a native author's report is
    insufficient"; execution is actual admitted C2 evidence.
  - Disposition: the selected mechanism is C2 command execution. Checks run
    locally by an author are informative only.
- **C-3 Stage order vs. supplied inputs.**
  - The original orders `source` before test design and has the tests authored.
  - In this witness, the CLI and both tests are supplied beforehand. The
    baseline measurement must precede any CLI change. No schedule is forced.
  - Disposition: stage *meanings* are kept (§2.3) and temporal order is not.
    The supplied tests are reused verifiers and do not count as new authorship.
- **C-4 `assertedReturnValue` vs. stdout.**
  - `assertedReturnValue` is `"Hello, world!"`, with no newline.
  - The stdout contract is `"Hello, world!\n"`.
  - These do not contradict each other. The first is the greeting text and the
    second is that text plus exactly one LF. Neither may be "normalized" into
    the other.
- **C-5 Scope of the UAT assertion.**
  - The `uat_test_source` stage asks only for an output assertion.
  - `test_design` requires both tests to assert status `0`.
  - The stricter test-design meaning governs. The supplied UAT source asserts
    both.
- **C-6 Stdout-only wording in `conformance_project`.**
  - That stage names only the stdout observation.
  - Exit `0` comes from `test_design`, the component stage, the oracle, and the
    WC.
  - Both are required (R-03 and R-04).
- **C-7 Supplied CLI vs. R-03.** The supplied CLI (sha256 `647697a5…`) did not
  conform. See §7.

## 7. Recorded subject history (informative, bound to digests)

These are admitted observations cited for traceability. They are not acceptance
and not a substitute for the independent assessment.

1. **Baseline**, before any CLI change. Result
   `result://abiogenesis/6514754aa979c64827c955c618e60ece86ef79274b734c3844f2a13243a95d5c`
   on CLI sha256
   `647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993`:
   - `node generated/hello-world.mjs` exited `0` and printed `Hello world!\n`
     (13 bytes, sha256 `0ba904ea…91dd8`, no comma). This violates R-03.
   - `node --test …` exited `1`: tests 2, pass 0, fail 2. Both tests failed
     `strictEqual` with actual `'Hello world!\n'` and expected
     `'Hello, world!\n'`.
   - This failure remains evidence about those exact bytes only.
2. **Bounded correction.** Native construction result
   `result://abiogenesis/e897db2208fad8afe99c5a184cddd24cb96421de5bb7df496a193774769cc41c`
   changed only `generated/hello-world.mjs`. It replaced
   `console.log("Hello world!");` with `console.log("Hello, world!");`. The new
   sha256 is
   `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef`.
3. **Post-correction measurement.** Result
   `result://abiogenesis/db34d3cf4111de970877f4698262cc2802f4878a7e5ada89145a02c7abf0e4c4`
   on CLI sha256 `fe8f4080…`:
   - Command 1 exited `0`. Stdout was `Hello, world!\n` (14 bytes, sha256
     `d9014c46…72ff5`) and stderr was empty.
   - Command 2 exited `0`: tests 2, pass 2, fail 0.
   - When this document was written, the current CLI digest was still
     `fe8f4080…`.

## 8. Unknowns (not resolved by the source)

- **U-1 Node version.** Not specified by the source, oracle, or WC, and not
  recorded in the admitted evidence.
  - `node --test` and `node:test` require a Node version that has the built-in
    test runner.
  - The reporter's summary format varies by version and reporter (for example
    `ℹ fail 0` in the spec reporter and `# fail 0` in TAP). The substring
    `fail 0` is stable across both, which is why R-09 does not pin the prefix.
- **U-2 stderr.** The source does not constrain stderr, and no requirement is
  added here. The observed stderr was empty. It must still be recorded
  truthfully (R-10) and is available to the assessment.
- **U-3 Other invocations.** Behavior is unspecified for arguments, stdin, other
  environment settings, or a working directory other than the project root. Only
  the no-argument case run from the project root is in the oracle.
- **U-4 Platform line endings.** The source requires an LF (`\n`). The admitted
  evidence comes from one macOS host. Other platforms are not evidenced.
- **U-5 Plan encoding of command 1.** The original gives field names only for
  the test command. How `test-execution-plan.json` represents the direct CLI
  invocation is an open design choice for the plan author, bounded by R-09.
- **U-6 Library mechanics.** The internals of the installed GTL/HoG/ABG library,
  the Public result, and replay are outside this document's Product boundary.
  They are governed by their own owners.
