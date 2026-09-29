# Test Design: basic-cli Hello World CLI

- Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC` (key `basic-cli`, kind `node_cli`)
- Stage meaning realized: `test_design`
- Asset: `design/test-design.md`
- Status: authored test design. It is not accepted and it accepts nothing. Whether
  it satisfies AC-10 of the conformance asset is for independent assessment.
- Authorship note: this file was written in the same native vector as
  `design/implementation-design.md` and `test-execution-plan.json`. It writes no
  test source. The two test files are supplied, protected verifiers; this design
  specifies their meaning and evaluates their adequacy without changing them.

## 1. Authority, subject and verifiers

| Basis | Identity | Use |
|---|---|---|
| `specification/project-conformance.md` | sha256 `a74a75b6c83d4daf1eeb0e6a7517827869c7520094940873c4b645d680ac993c` | Governing authority. Applies REQ-05, REQ-06, REQ-07, REQ-09, REQ-11, REQ-12, REQ-13 and AC-01, AC-02, AC-05 to AC-08, AC-10, AC-12, AC-13. |
| `design/implementation-design.md` | sha256 `801f3ab5d524256ba91a1325f640dc2d77851b5c6fe2cdcd46c8a67afe838d0f` | Source specification (§3), failure boundaries (§4) and verification surfaces and seams (§5). |
| `source/original-basic-cli.txt` | sha256 `ce602ce2…` | `test_design`: "Specify component and UAT validation of the CLI stdout contract. Both tests must spawn node generated/hello-world.mjs and assert status 0 and stdout exactly \"Hello, world!\\n\"." |
| `source/basic-cli.oracle.json` | sha256 `028073e4…` | Case `arguments: []`, stdout `"Hello, world!\n"`, `exitStatus: 0`; `minimumTestPasses: 2`; `requiredTestFiles`. |

- **Subject under test:** `generated/hello-world.mjs`, meaning whatever bytes are
  current when a run happens. At authoring time the digest is
  `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef`.
- **Verifier artifacts (reused, not newly authored):**
  - `test/component/hello-cli.test.mjs` (sha256 `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613`)
  - `test/uat/hello-cli.uat.test.mjs` (sha256 `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4`)

## 2. Contract under test (the oracle)

| Exit | Expected | Source |
|---|---|---|
| stdout | exactly `"Hello, world!\n"`: hex `48656c6c6f2c20776f726c64210a`, 14 bytes, sha256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5` | original `conformance_project`, `source`, `test_design`; oracle `cases[0].stdout` |
| exit status | `0` (normal termination, no signal) | original `test_design` and `component_test_source`; oracle `cases[0].exitStatus` |
| stderr | not constrained (conformance U3); recorded only | none |

The expected values come from the original source and the oracle. They are
written as literals in each verifier and are not derived from the CLI source.

## 3. Test cases

### TD-01 Component check: the CLI process contract

| Field | Value |
|---|---|
| File and test | `test/component/hello-cli.test.mjs` › `CLI process satisfies its output contract` |
| Modules | `test` from `node:test`, the default export of `node:assert/strict`, `spawnSync` from `node:child_process` |
| Setup | none; no fixtures, mocks, stubs or environment changes |
| Action | `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })`, which starts a real child Node process on the real file with cwd inherited from the runner (must be the project root) |
| Assertions | `assert.equal(result.status, 0)`, then `assert.equal(result.stdout, 'Hello, world!\n')`, both strict (`Object.is`) |
| Passes when | both assertions hold |
| Claim | the CLI, treated as a process component, meets its interface contract: exit status and exact stdout |
| Traces | REQ-06, REQ-09; AC-05, AC-10 |

### TD-02 UAT check: the user-visible outcome

| Field | Value |
|---|---|
| File and test | `test/uat/hello-cli.uat.test.mjs` › `a user receives the exact promised greeting` |
| Modules, setup, action | same as TD-01 |
| Assertions | `assert.equal(result.status, 0)`, then `assert.equal(result.stdout, 'Hello, world!\n')` |
| Passes when | both assertions hold |
| Claim | a user who runs the CLI sees exactly the promised greeting and the command succeeds. The original `uat_test_source` requires the output assertion; `test_design` also requires the status assertion (conformance C6). The file has both. |
| Traces | REQ-07, REQ-09; AC-06, AC-10 |

**Component and UAT use the same mechanism, and this is intended.** The original
prescribes the same spawn for both tests. For a single-module CLI the component
boundary *is* the public boundary (implementation design §8, Design Component
non-material). The two checks differ in the claim they bear, not in mechanism:
TD-01 is the process interface contract and TD-02 is user acceptance. Both are
required for the REQ-12 pairing. A pass in one file never counts for the other.
Whether identical mechanics are enough for a distinct UAT claim is an F_P judgment
left to the assessor.

### TD-03 Direct execution proof: fixed command 1

| Field | Value |
|---|---|
| Command | `node generated/hello-world.mjs`, cwd = project root, no arguments, no stdin input |
| Observed by | the admitted C2 measurement, not a test file |
| Passes when | stdout bytes equal §2 exactly, exit status `0`, no signal, no timeout |
| Why it is needed | It is the original's "execution proof must run the CLI and observe stdout". It runs the Product entry outside `node:test`, so a CLI that behaved differently under the test runner (for example, by detecting test-runner environment variables) would be exposed. It also gives the `assertedReturnValue` correspondence: stdout must equal `"Hello, world!"` plus one LF. |
| Traces | REQ-03, REQ-04, REQ-05; AC-01, AC-02, AC-12 |

### TD-04 Suite run and pairing: fixed command 2

| Field | Value |
|---|---|
| Command | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`, cwd = project root |
| Passes when | exit status `0`; runner summary `pass N` with N ≥ 2; `fail 0`; at least one passing test from each file (pairing) |
| Pairing identification | By test name. The protected sources define exactly one test per file, and the names are unique: `CLI process satisfies its output contract` belongs to the component file and `a user receives the exact promised greeting` to the UAT file. The spec reporter prints `✔ <name>` for each passing test; the TAP reporter prints `ok <n> - <name>`. |
| Traces | REQ-11, REQ-12; AC-07, AC-12 |

## 4. Why the checks are meaningful (verifier adequacy)

**Not tautological.**
- The expected literal is fixed in each test, independent of the CLI source.
- The tests do not import the CLI, and they mock neither the CLI nor the spawn.
- A real child process runs the real file from disk.

**Exact at the byte level.**
- `assert.equal` from `node:assert/strict` is `Object.is` equality.
- With `encoding: 'utf8'`, stdout is decoded by `Buffer#toString`. That decoding
  keeps a leading BOM (checked locally) and turns invalid bytes into U+FFFD.
- So for this pure-ASCII expected value, string equality is equivalent to byte
  equality with the 14 bytes in §2.

**Defects rejected.** Each row is a candidate CLI defect and what TD-01 and TD-02
observe (TD-03 observes the same through its byte comparison):

| Candidate CLI defect | Observed | Failing assertion |
|---|---|---|
| `Hello world!\n` (missing comma: the actual baseline defect) | stdout differs | stdout |
| `hello, world!\n` or `Hello, World!\n` (case) | stdout differs | stdout |
| `Hello, world!` (no newline) | stdout differs | stdout |
| `Hello, world!\n\n` (extra newline) | stdout differs | stdout |
| `Hello, world!\r\n` (CRLF) | stdout differs | stdout |
| ` Hello, world!\n` or trailing spaces | stdout differs | stdout |
| BOM before the greeting | stdout differs (BOM kept by decoding) | stdout |
| Extra stdout line (banner or debug) | stdout differs | stdout |
| Greeting written to stderr instead of stdout | stdout `''` | stdout |
| Correct output, then `process.exitCode = 1` | status `1` | status |
| Syntax or runtime error, or missing file | status `1`, stdout `''` | status |
| Killed by a signal | status `null` | status |
| Wrong cwd (entry not found) | status `1` | status (safe failure; cannot pass falsely) |

**Observed discrimination (admitted evidence, kept on its own subjects).**
- The admitted baseline `result://abiogenesis/b63cfd1d…` on CLI digest
  `647697a5…`: both TD-01 and TD-02 failed with actual `'Hello world!\n'` against
  expected `'Hello, world!\n'`, and the runner exited `1` with pass 0 and fail 2.
- The admitted post-correction observation `result://abiogenesis/b609386b…` on
  CLI digest `fe8f4080…` with both test digests unchanged: both passed and the
  runner exited `0` with pass 2 and fail 0.
- The unchanged verifiers were therefore observed failing on the real defect and
  passing on the corrected bytes. This shows the verifiers discriminate. Each
  result stays bound to its own CLI digest. The baseline failure is not retargeted
  and does not show anything about current behavior.

**Limits (what these checks do not detect):**

| Limit | Status |
|---|---|
| stderr content | Not constrained by the source (U3). Recorded in evidence, not asserted. |
| Behavior with arguments, stdin or environment | Unspecified (U2). Not tested. |
| A hanging CLI | `spawnSync` has no timeout here, and the `node --test` default is none. Only the executor's own timeout bounds it; a timeout is recorded as failure. |
| Node-version portability | Only the executing Node is exercised (U1). |
| Test-runner-aware CLI behavior | Covered by TD-03, which runs outside the runner, plus AC-04 source inspection. |

## 5. Execution design

- **Environment.**
  - cwd = project root for both fixed commands.
  - No package installation, no `package.json`, no network.
  - No application-specific environment variables. The executor records its
    actual environment.
  - `node` is resolved from PATH (TD-03). The tests spawn `process.execPath`
    (implementation design §5, interpreter seam).
- **Commands.** TD-03 and TD-04 are independent and may run in either order. Both
  must observe the same CLI and test-file digests (same-subject rule).
- **Parsing the runner summary.**
  - `observedTestPassCount` is the integer N in the summary line `pass N`
    (spec reporter `ℹ pass N`; TAP reporter `# pass N`). `observedFailCount`
    comes from `fail N` the same way.
  - The plan's `expectedStdoutMatch` fragment `fail 0` is present under both
    reporters and pins no pass count (conformance C8).
- **Acceptance of the execution result** (original `test_execution_result`): the
  plan command exited `0`, `observedTestPassCount ≥ expectedTestPassCount` (2),
  and `planSatisfied` is true. `planSatisfied` is defined in conformance AC-12:
  - exit `0`;
  - every `expectedStdoutMatch` fragment is present in runner stdout;
  - `observedTestPassCount ≥ expectedTestPassCount`;
  - fail count `0`;
  - fixed command 1 stdout equals `assertedReturnValue + "\n"` with exit `0`.

  The REQ-12 pairing (TD-04) must also hold.
- **Recorded diagnostics (not extra predicates).** `tests`, `suites`,
  `cancelled`, `skipped`, `todo` and `duration_ms` from the runner summary. The
  protected sources contain no skip or todo, so any nonzero `cancelled`,
  `skipped` or `todo` is a discrepancy to report.
- **Evidence carrier.**
  - Admitted C2 command-execution observations must record, for each command:
    command, args, cwd, environment, integer exit status, signal, timeout flag,
    stdout, stderr, and the dependency digests of the CLI and both test files.
  - No handwritten `test-execution-result.json` is authored (conformance C2).
  - Runs made by an author, including this one, are not evidence.
- **Currentness and invalidation.**
  - Evidence is current only when its recorded digests for
    `generated/hello-world.mjs`, `test/component/hello-cli.test.mjs` and
    `test/uat/hello-cli.uat.test.mjs` equal the files under assessment.
  - A CLI change requires fresh runs of both commands. Evidence on earlier bytes
    stays historical.
  - The test files are protected. If one changed, that would invalidate the
    verifier-artifact basis of this design as well as the evidence.

## 6. Traceability

| Requirement / criterion | Covered by |
|---|---|
| REQ-03 exact stdout, AC-01 | TD-01, TD-02, TD-03 |
| REQ-04 exit 0, AC-02 | TD-01, TD-02, TD-03 |
| REQ-05 execution proof | TD-03, TD-04 (real processes only) |
| REQ-06, AC-05 component verifier | TD-01 |
| REQ-07, AC-06 UAT verifier | TD-02 |
| REQ-09, AC-10 test design | this document |
| REQ-11, AC-12 result meaning | §5 acceptance and evidence carrier |
| REQ-12, AC-07 coverage floor and pairing | TD-04 |
| REQ-13, AC-08, AC-13 currentness and lineage | §4 observed discrimination; §5 currentness |

## 7. Not added, and residuals

- **No new tests.** The test sources are protected and outside this vector's
  write territory, and the source requires no further depth. Possible depth
  checks would belong to the test-source owner and would not lower the
  `expectedTestPassCount` floor. Examples: stderr empty, a byte-level `Buffer`
  comparison, a spawn timeout.
- **Residuals for the assessor:**
  - Whether identical component and UAT mechanics satisfy distinct stage meanings
    (§3).
  - C7: sandbox cwd identity is established only by matching digests.
  - U1: Node version not recorded.
  - Pairing by test name depends on the current protected sources having exactly
    one uniquely named test per file.
