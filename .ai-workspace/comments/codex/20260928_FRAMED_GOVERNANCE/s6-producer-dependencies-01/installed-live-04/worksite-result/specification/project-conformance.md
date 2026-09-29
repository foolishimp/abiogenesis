# Project Conformance: basic-cli Hello World CLI

- Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC` (key `basic-cli`, kind `node_cli`)
- Stage meaning realized: `conformance_project`
- Asset: `specification/project-conformance.md` (this file only; no source, tests,
  package files or execution plans are written by this vector)
- Status: authored specification. This file is not accepted and it accepts nothing.
  Every criterion below is evaluated by an independent assessment against current
  admitted evidence.

## 1. Authority and basis

| Rank | Basis | Identity | Role |
|---|---|---|---|
| 1 | `source/original-basic-cli.txt` | sha256 `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` | Governing Product source. It defines the complete original outcome and all eight stage meanings. |
| 2 | `source/witness-contract.md` | sha256 `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` | Governs lifecycle, evidence, revision lineage, write territory and how execution-receipt mechanics are realized in this run. It does not change Product meaning. |
| 3 | `source/basic-cli.oracle.json` | sha256 `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` | Independent evaluation data. It corroborates the case (`arguments: []`, stdout `"Hello, world!\n"`, `exitStatus: 0`), `minimumTestPasses: 2`, and the required artifacts and stage meanings. |

Subjects, not authorities: `generated/hello-world.mjs`,
`test/component/hello-cli.test.mjs` and `test/uat/hello-cli.uat.test.mjs` were
supplied without accepted behavior or author provenance. They are evaluated
against this document. They do not define its meaning. Neither the test names, a
predecessor's CLI behavior nor current code may reinterpret any requirement below.

## 2. Intent

Build a minimal Node.js command-line "Hello World" program by a complete,
traceable software-build traversal: conformance, implementation design, source,
test design, component test source, UAT test source, test execution plan and
test execution result. The observable Product outcome is simple: a user runs
the CLI with Node, with no install step, and sees exactly `Hello, world!`
followed by one newline, and the process exits successfully. Real execution of
the CLI and of both tests must prove this. A written claim does not.

## 3. Product boundary

**Inside the Product**

- One application source surface: `generated/hello-world.mjs`, an ES module run
  directly by `node`.
- One supported public entry: `node generated/hello-world.mjs`, run from the
  project root with no arguments.
- Public exits: the bytes written to stdout and the process exit status.

**Inside the traversal but not the runtime Product.** These are the verification
and lifecycle assets that realize the original stage meanings:
`specification/project-conformance.md`, `design/implementation-design.md`,
`design/test-design.md`, `test/component/hello-cli.test.mjs`,
`test/uat/hello-cli.uat.test.mjs`, `test-execution-plan.json` and the admitted
command-execution evidence that carries the `test_execution_result` meaning.

**Outside the Product**

- Command-line arguments, flags, help or version output, stdin, environment-driven
  behavior and localization.
- Any `package.json`, lockfile, `node_modules`, npm scripts, build or transpile
  step, `bin` installation, publishing, or network access.
- Runtimes other than Node.
- The GTL/HoG/ABG library, `.ai-workspace/` and all installed assets. These are
  the Development Product that carries out the traversal. They are not the Hello
  World Product and must not be confused with it or changed by it.

## 4. Traversal declaration

| Stage (original) | Artifact | Realization in this witness run |
|---|---|---|
| `conformance_project` | `specification/project-conformance.md` | Newly authored (this file). |
| `implementation_design` | `design/implementation-design.md` | Must be newly authored. This file is its authority. |
| `source` | `generated/hello-world.mjs` | Supplied CLI. A baseline measurement came first, then a bounded correction (see §7). |
| `test_design` | `design/test-design.md` | Must be newly authored. |
| `component_test_source` | `test/component/hello-cli.test.mjs` | Supplied verifier, protected. It is reused only if it meets AC-05. It is not counted as newly authored work. |
| `uat_test_source` | `test/uat/hello-cli.uat.test.mjs` | Supplied verifier, protected. It is reused only if it meets AC-06. It is not counted as newly authored work. |
| `test_execution_plan` | `test-execution-plan.json` | Must be newly authored. It is a prospective declaration only (see C2 and C3). |
| `test_execution_result` | none (the original says "Produce no files") | Admitted C2 command-execution observations, judged under AC-12 by an independent assessment. |

## 5. Requirements

Each requirement cites its source as *file › stage › instruction*.
"Project root" means the worksite root that contains `generated/`, `test/` and
`source/`.

- **REQ-01 Source surface.** The application source surface is exactly
  `generated/hello-world.mjs`.
  *Original › conformance_project: "The source surface must be
  generated/hello-world.mjs."; implementation_design: "Define a minimal Node CLI
  script at generated/hello-world.mjs."; oracle › requiredArtifacts.*
- **REQ-02 No installation.** The script runs under `node` with no package
  installation, no dependency outside `node:` built-ins, and no network access.
  *Original › source: "The script must execute under node without package
  installation."; contract: "There is no package/network dependency for this
  application."*
- **REQ-03 Exact stdout.** Running `node generated/hello-world.mjs` from the
  project root with no arguments writes exactly `"Hello, world!\n"` to stdout:
  capital `H`, a comma after `Hello`, one space, lowercase `world`, `!`, then
  exactly one LF. Nothing else is written: no leading or trailing whitespace, no
  BOM, no CR and no further lines.
  *Original › conformance_project, implementation_design and source; oracle ›
  cases[0].stdout.*
- **REQ-04 Successful exit.** The same run terminates normally with exit status
  `0`.
  *Original › test_design and component_test_source: "assert status 0"; oracle ›
  cases[0].exitStatus; contract: "exits zero".*
- **REQ-05 Execution proof.** The proof must actually run the CLI and observe
  its stdout. Inspecting the source text does not prove REQ-03 or REQ-04.
  *Original › conformance_project: "The execution proof must run the CLI and
  observe stdout exactly"; contract: "Both supplied tests must actually execute
  the current CLI."*
- **REQ-06 Component verifier.** `test/component/hello-cli.test.mjs` uses
  `node:test`, `node:assert/strict` and `spawnSync` from `node:child_process`. It
  runs `process.execPath` with `["generated/hello-world.mjs"]` from the project
  root and asserts status `0` and stdout exactly `"Hello, world!\n"`.
  *Original › component_test_source.*
- **REQ-07 UAT verifier.** `test/uat/hello-cli.uat.test.mjs` uses the same
  modules and spawn mechanism and asserts that the user-visible CLI output is
  exactly `"Hello, world!\n"`. Under REQ-09 it also asserts status `0`.
  *Original › uat_test_source; test_design.*
- **REQ-08 Implementation design.** `design/implementation-design.md` takes this
  conformance asset as its authority. It defines the minimal Node CLI script at
  `generated/hello-world.mjs` that prints exactly `Hello, world!` followed by one
  newline. It names the component and UAT test source surfaces that execute the
  CLI and assert stdout.
  *Original › implementation_design; contract: "realizable design faithful to the
  original outcome and the conformance asset, including source and verification
  surfaces".*
- **REQ-09 Test design.** `design/test-design.md` specifies component and UAT
  validation of the CLI stdout contract. Both tests spawn
  `node generated/hello-world.mjs` and assert status `0` and stdout exactly
  `"Hello, world!\n"`.
  *Original › test_design; contract: "meaningful component and user-outcome checks
  of the actual CLI".*
- **REQ-10 Execution plan.** `test-execution-plan.json` declares:
  - `command` `"node"` and `args`
    `["--test", "test/component/hello-cli.test.mjs", "test/uat/hello-cli.uat.test.mjs"]`;
  - `expectedTestPassCount` ≥ 2;
  - `expectedStdoutMatch` that includes stable zero-failure evidence such as
    `fail 0`, with no exact pass-count fragment pinned;
  - `assertedReturnValue` `"Hello, world!"`.

  The plan must agree with both fixed prospective commands. It does not control
  execution.
  *Original › test_execution_plan; contract › fixed prospective command
  selection; oracle › minimumTestPasses.*
- **REQ-11 Execution result meaning.** The result is acceptable only if the plan
  command exited `0`, observedTestPassCount is at least expectedTestPassCount,
  and planSatisfied is true. The result must truthfully record the observed
  command, args, integer status, stdout, stderr, cwd and env.
  *Original › test_execution_result and test_execution_plan; contract: "That
  evidence must retain the real command, arguments, environment, working
  directory, exit status, stdout/stderr and resulting test observations."*
- **REQ-12 Coverage floor and pairing.** At least two tests pass and none fail.
  The component file and the UAT file each contribute at least one passing test
  that executes the current CLI. A passing UAT result alone, or a pass total
  reached from one file only, does not meet this requirement.
  *Original › test_execution_plan: "matching the admitted component and UAT
  coverage floor"; oracle › minimumTestPasses, requiredTestFiles; contract:
  "Scalar UAT success cannot replace the required pairing and coverage
  relation."*
- **REQ-13 Revision lineage.** The supplied CLI's actual behavior is measured
  before it is changed. Any material failure stays admitted historical evidence
  about those exact earlier bytes. The correction is bounded to the CLI and
  justified by that failure. Current behavior is proved against the corrected
  current bytes, and the causal link between the two is preserved.
  *Contract › Evidence, correction and final outcome.*
- **REQ-14 Protection and write territory.** The original source, oracle,
  contract, both supplied test sources and all installed assets remain unchanged.
  Application writes are limited to `generated/hello-world.mjs`,
  `specification/project-conformance.md`, `design/implementation-design.md`,
  `design/test-design.md` and `test-execution-plan.json`.
  *Contract › Admitted completion and scope.*

## 6. Acceptance criteria

Every criterion is a checkable predicate over current artifacts or admitted
evidence. Criteria are fixed before results and do not shrink afterwards.

| ID | Requirement | Predicate | How observed |
|---|---|---|---|
| AC-01 | REQ-03, REQ-05 | Executable `node`, args `["generated/hello-world.mjs"]`, cwd = project root, no extra args and no stdin input. The stdout bytes equal hex `48656c6c6f2c20776f726c64210a` (14 bytes, sha256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`). | Admitted C2 observation of fixed command 1 |
| AC-02 | REQ-04 | The same run has exit status `0`, no terminating signal and no timeout. Exit `0` alone is not sufficient; AC-01 must also hold. | Same observation |
| AC-03 | REQ-02 | The CLI imports nothing, or only `node:` built-ins. No `package.json`, lockfile or `node_modules` is needed or present for the application. No install or network step precedes the admitted runs. | Inspect CLI source and inventory; admitted command sequence |
| AC-04 | REQ-01 | `generated/hello-world.mjs` exists, is the only application source, and produces the output without reading or generating other files. | Inspect source |
| AC-05 | REQ-06 | The component test imports `test` from `node:test`, the default export of `node:assert/strict` and `spawnSync` from `node:child_process`. It calls `spawnSync(process.execPath, ['generated/hello-world.mjs'], …)` with no mock or stub of the CLI or the spawn. It strictly asserts `status === 0` and `stdout === 'Hello, world!\n'`. Its digest is still `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613`. | Inspect test source and digest |
| AC-06 | REQ-07, REQ-09 | Same as AC-05 for the UAT test, with digest `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4`. It asserts the user-visible stdout exactly and status `0`. | Inspect test source and digest |
| AC-07 | REQ-12 | Fixed command 2 (`node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`) runs with cwd = project root. It exits `0`. The runner summary shows `pass N` with N ≥ 2 and `fail 0`. The per-test lines show at least one passing test from each file: currently `CLI process satisfies its output contract` (component) and `a user receives the exact promised greeting` (UAT). | Admitted C2 observation of fixed command 2 |
| AC-08 | REQ-05, REQ-13 | Currentness: the evidence for AC-01, AC-02 and AC-07 is bound to the digests of `generated/hello-world.mjs` and both test files as they stand at assessment time. Evidence about any other bytes does not show current behavior. | Compare observation dependency digests with current files |
| AC-09 | REQ-08 | `design/implementation-design.md` cites this document as authority. It places the CLI at `generated/hello-world.mjs` as a dependency-free Node ES module. It specifies output of exactly `Hello, world!` plus one `\n` and exit `0`, using a mechanism that emits exactly one LF (for example, one `console.log` of the literal, or `process.stdout.write` of the literal including `\n`). It names `test/component/hello-cli.test.mjs` and `test/uat/hello-cli.uat.test.mjs` as surfaces that execute the CLI and assert stdout. It is realizable and consistent with the current CLI. It contradicts no REQ. | Independent reading of content |
| AC-10 | REQ-09 | `design/test-design.md` specifies a component check (process contract) and a UAT check (user-visible outcome). Both spawn `node generated/hello-world.mjs` from the project root and strictly assert status `0` and stdout `"Hello, world!\n"`. It names the execution command, the pass/fail criteria and the pairing in REQ-12. It shows the checks are meaningful by identifying the defects exact equality rejects: missing or altered punctuation or case, a missing or extra newline, extra output, and a nonzero exit. | Independent reading of content |
| AC-11 | REQ-10 | `test-execution-plan.json` parses as JSON and meets all of these:<br>• `command === "node"`<br>• `args` deep-equals `["--test","test/component/hello-cli.test.mjs","test/uat/hello-cli.uat.test.mjs"]`<br>• `expectedTestPassCount` is an integer ≥ 2<br>• `expectedStdoutMatch` contains `fail 0` and no exact pass-count fragment such as `pass 2`<br>• `assertedReturnValue === "Hello, world!"`<br>• it states cwd = project root<br>• it agrees with fixed command 1 (see C4)<br>• it records no observed results as if they had already happened | Parse and inspect |
| AC-12 | REQ-11 | For admitted C2 evidence on current subjects:<br>• the plan command exit status is `0`<br>• observedTestPassCount (the `N` in the runner's `pass N` line) ≥ `expectedTestPassCount`<br>• planSatisfied is true<br>Definition: planSatisfied = (exit `0`) ∧ (every `expectedStdoutMatch` fragment is present in the runner stdout) ∧ (observedTestPassCount ≥ `expectedTestPassCount`) ∧ (fail count = 0) ∧ (fixed command 1 stdout = `assertedReturnValue + "\n"` with exit `0`).<br>The evidence records command, args, env, cwd, exit status, stdout and stderr. A handwritten success file or an author's report does not count. | Admitted C2 observations evaluated by an independent assessment |
| AC-13 | REQ-13 | All of the following hold:<br>(a) an admitted baseline observation of the pre-correction CLI digest exists and predates the CLI change;<br>(b) its failure stays attributed to that digest;<br>(c) a native correction changed only `generated/hello-world.mjs` and addresses the observed discrepancy;<br>(d) a later admitted observation on the corrected digest meets AC-01, AC-02 and AC-07;<br>(e) the baseline is neither retargeted to the new bytes nor discarded. | Admitted observation lineage (§7) |
| AC-14 | REQ-14 | Protected digests are unchanged (source `ce602ce2…`, oracle `028073e4…`, contract `f97359de…`, tests per AC-05 and AC-06). No application file outside the REQ-14 territory was written. No `test-execution-result.json` or package file was fabricated. | Digest and inventory comparison |
| AC-15 | Stage meaning | This document gives the Intent, Product boundary, source-grounded requirements and completion criteria. Its vector wrote no source, tests, package files or plans. | Independent reading and native write record |

## 7. Evidence and revision lineage (recorded for AC-08 and AC-13; not an acceptance)

The admitted observations available at authoring time (2026-09-29) are listed
below. Whether they meet the criteria is for independent assessment to decide.

1. **Baseline** (testing, C2 `result://abiogenesis/b63cfd1d…`). CLI subject
   digest `647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993`.
   - Command 1 exited `0` with stdout `"Hello world!\n"` (13 bytes, sha256
     `0ba904ea…`). The comma is missing, so REQ-03 fails even though the exit
     status was `0`.
   - Command 2 exited `1`: tests 2, pass 0, fail 2. Both tests reported
     actual `'Hello world!\n'` against expected `'Hello, world!\n'`.

   This failure stays historical evidence about digest `647697a5…` only.
2. **Correction** (construction, native `result://abiogenesis/50dd6daf…`).
   Changed path: `generated/hello-world.mjs` only. `console.log("Hello world!");`
   became `console.log("Hello, world!");`. The new digest is
   `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef`.
3. **Post-correction** (testing, C2 `result://abiogenesis/b609386b…`). CLI
   subject digest `fe8f4080…`, with test digests unchanged.
   - Command 1 exited `0` with stdout `"Hello, world!\n"` (14 bytes, sha256
     `d9014c46…`).
   - Command 2 exited `0`: tests 2, pass 2, fail 0.
   - stderr was empty for both commands.

Invalidation: any change to the CLI or either test file makes item 3 stale for
AC-01, AC-02, AC-07 and AC-12. The baseline (item 1) stays valid as history in
every case. This document and the other authored assets do not depend on the
CLI bytes, so a CLI change does not invalidate them unless it changes Product
meaning.

## 8. Conflicts and interpretations (preserved, not silently resolved)

- **C1 Stage order.** The original orders the stages conformance → design →
  source. In this lineage the CLI was measured and corrected before this
  conformance or any design existed. The contract permits this ("Do not force
  graph names or a complete schedule"). The correction's authority is the
  original source plus the baseline evidence, not this document. The
  implementation design must still treat this document as its authority (REQ-08)
  and must be checked against the current CLI. Residual: the assessor judges
  whether the non-canonical order leaves any stage meaning unmet.
- **C2 `test-execution-result.json`.** The original `test_execution_plan` stage
  says to write `test-execution-result.json` and have the worker execute
  ("EXECUTION-DEFAULT LAW"). The contract realizes execution-receipt mechanics
  through admitted C2 evidence, keeps that file outside application write
  territory, and says a fabricated success file or an author's report is
  insufficient. The oracle's `requiredArtifacts` omit that file. Interpretation:
  the result meaning is kept (REQ-11 and AC-12), and admitted C2 observations
  carry it. No authored asset may substitute a handwritten result.
- **C3 Who executes.** The original has the plan author run the tests. Under the
  contract, measurement is a separate admitted C2 act. Any run the plan author
  makes themselves is not admitted evidence.
- **C4 One command or two.** The original plan schema has one
  `command`/`args` pair (the test command). The contract fixes two prospective
  commands and says the plan "must agree with these commands".
  Interpretation (an F_P judgment for the assessor):
  - the top-level `command`/`args` must be exactly the test command;
  - the plan must also declare the direct CLI invocation `node`
    `["generated/hello-world.mjs"]` with expected stdout `"Hello, world!\n"` and
    exit `0`, in an additional field that does not change the original fields'
    meaning.
- **C5 `assertedReturnValue` and the newline.** `assertedReturnValue` is
  `"Hello, world!"` with no newline, while stdout is `"Hello, world!\n"`.
  Interpretation: `assertedReturnValue` is the greeting value, and the required
  stdout is that value plus exactly one LF (AC-12). This does not relax REQ-03.
- **C6 UAT status assertion.** The `uat_test_source` instructions require only an
  output assertion. `test_design` requires both tests to assert status `0`. The
  stricter combined reading applies (REQ-07). The supplied UAT test asserts both.
- **C7 "From the project root".** The supplied tests pass the relative path
  `generated/hello-world.mjs` and set no `cwd`, so they depend on being run with
  cwd = project root. Both fixed commands therefore require cwd = project root.
  The admitted observations record `relativeCwd: "."`. Their stack traces show
  execution inside an archived sandbox copy under `.ai-workspace/`, and file
  identity is tied to the worksite by the recorded dependency digests. Residual:
  the assessor judges whether equal digests are enough to treat the sandbox as
  the project root.
- **C8 Pass count without pinning.** `expectedTestPassCount` ≥ 2 is a floor. The
  runner-summary fragments in `expectedStdoutMatch` must not pin `pass 2`,
  because the original anticipates added depth coverage. In this run the test
  sources are protected, so the actual count is 2.

## 9. Unknowns and unspecified behavior

- **U1 Node version.** No minimum is stated in the source, contract or oracle,
  and none is recorded in the admitted observations. The author's local
  `node --version` returned `v24.7.0`; that is not admitted evidence. `node:test`
  needs a Node release that provides it (18 or later).
- **U2 Arguments, stdin and environment.** Only the no-argument case is
  specified (oracle `arguments: []`). Behavior in other cases is unspecified
  and not required.
- **U3 stderr.** No source requirement constrains stderr. Admitted runs observed
  it empty. It is recorded (REQ-11) but is not an acceptance predicate.
- **U4 Plan fields beyond those named.** The original names the required plan
  fields but no full schema. Extra fields are allowed if they do not conflict
  (see C4).
- **U5 Performance and timing.** Unspecified. Admitted runs used a 20000 ms
  timeout and did not time out.

## 10. Frame-family inventory (proposed dispositions for the assessor)

| Family | Disposition | Exact subject |
|---|---|---|
| Product | Material | The outcome in §2 and the boundary in §3 under the original source |
| Public Boundary | Material | The entry `node generated/hello-world.mjs` (no args, project-root cwd); exits: stdout and status |
| Entity | Material | CLI file identity by digest, with pre- and post-correction lineage (§7); protected test-file identities |
| Operator | Material | One effect: write the greeting and a single LF, then exit 0 |
| Effect | Material | An observational stdout write only; no files, network or installs |
| Proof | Material | AC-05 to AC-08 and AC-12, verifier adequacy and the REQ-12 pairing |
| Owner | Material | The authority ranking in §1; assessment is separate from authorship (AC-15) |
| Design | Material | REQ-08 and AC-09 |
| Design Component | Proposed non-material | A single-module CLI with no internal components; this needs confirmation by the design owner |
| Product Composition | Material (as a seam) | The GTL/HoG/ABG Development Product carries out the traversal and must not be confused with the Hello World Product (§3) |
| Install | Proposed non-material | There is no installed Product coordinate; Node on PATH runs the source directly (REQ-02). Installed library assets are protected, not exercised as this Product |
| Reuse/Foundation | Material (trivially) | Use Node built-ins (`console`, `node:test`, `node:assert/strict`, `node:child_process`) instead of any package |

## 11. Completion criteria

The complete original outcome is met only when all of these hold:

- AC-01 to AC-14 all hold on current subjects;
- all four newly authored assets (this file, both design documents and the
  execution plan) meet their content criteria (AC-09, AC-10, AC-11, AC-15);
- the §7 lineage is preserved;
- an independent assessment has evaluated all of the above. Its actor and call
  must differ from every author and from the measurement producer.

This document gives no verdict. Missing or unknown support leaves the parent
outcome open.
