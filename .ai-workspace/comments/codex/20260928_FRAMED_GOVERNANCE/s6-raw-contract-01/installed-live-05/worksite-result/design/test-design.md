# Test Design — basic-cli (`SCN-GLC-HELLO-WORLD-CLI-BASIC`)

Stage meaning: `test_design` of the original source.

This document specifies component and UAT validation of the CLI stdout contract
and how that validation is executed and judged. Its authorities are
`specification/project-conformance.md` (R-03..R-10, R-12, AC-01..AC-08, AC-10)
and `design/implementation-design.md` §4. It creates no Product meaning and
accepts nothing.

## 0. Basis

| Input | Path | SHA-256 |
|---|---|---|
| Conformance (authority) | `specification/project-conformance.md` | `9d02e5fb3f2793e187a7afa673594340a8cb311d6e212cd3b77ba1a764eb43ee` |
| Implementation design | `design/implementation-design.md` | (the sibling asset written in the same contribution) |
| Original source | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` |
| Oracle | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` |
| Witness contract | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` |
| Component test (supplied, protected) | `test/component/hello-cli.test.mjs` | `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613` |
| UAT test (supplied, protected) | `test/uat/hello-cli.uat.test.mjs` | `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4` |

The original `test_design` stage requires:

- "Specify component and UAT validation of the CLI stdout contract."
- "Both tests must spawn node generated/hello-world.mjs and assert status 0 and
  stdout exactly \"Hello, world!\\n\"."

## 1. Contract under test

When the CLI is run as `node generated/hello-world.mjs`, from the project root
with no arguments, it must meet the following (oracle `cases[0]`, R-03, R-04,
R-05):

| # | Observable | Required value |
|---|---|---|
| T1 | Exit status | Integer `0`. Not `null`, so not killed by a signal and no spawn error. |
| T2 | stdout | Exactly the string `"Hello, world!\n"`: 14 UTF-8 bytes, `48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 0a`, SHA-256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5` |

stderr is not part of the contract (conformance U-2). It is recorded, but no test
asserts on it.

## 2. Test surfaces

Both surfaces are the supplied sources. They are reused unchanged and not
counted as new authorship (conformance §2.3, C-3). Both are protected, so this
design adds no test source.

- **Why none are added:** the supplied sources already satisfy every clause of
  the original `test_design`, `component_test_source` and `uat_test_source`
  stages (§3).
- **Adding one would need:** a write grant this contribution does not hold.

### 2.1 Component check: process output contract

- **Path:** `test/component/hello-cli.test.mjs`
- **Test name:** `CLI process satisfies its output contract`
- **Level:** Component. The subject is the CLI process as a unit: one spawned
  process with its exit status and stdout stream.
- **Procedure:** spawn a new Node process on the real CLI file, wait for it to
  exit, then assert T1 and T2 on the process's own outputs.

### 2.2 UAT check: user-visible outcome

- **Path:** `test/uat/hello-cli.uat.test.mjs`
- **Test name:** `a user receives the exact promised greeting`
- **Level:** User acceptance. The subject is the outcome a user gets from the
  supported invocation: the command succeeds and the exact greeting appears.
- **Procedure:** the same black-box spawn as §2.1, with T1 and T2 read as the
  user's acceptance condition. It meets the `uat_test_source` requirement
  ("user-visible CLI output is exactly …"). It also meets the stricter
  `test_design` requirement that both tests assert status `0` (conformance C-5).

## 3. Static check of the supplied sources against the requirements

Both files have the same structure. Line numbers refer to both files.

| Requirement | Component (`8b55bf3f…`) | UAT (`5449c227…`) |
|---|---|---|
| Uses `node:test` | L1 `import { test } from 'node:test';` | L1, identical |
| Uses `node:assert/strict` | L2 `import assert from 'node:assert/strict';` | L2, identical |
| Uses `spawnSync` from `node:child_process` | L3 | L3, identical |
| Runs `process.execPath` with `["generated/hello-world.mjs"]` | L6 `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })` | L6, identical |
| Runs from the project root | No `cwd` option, so the child inherits the test process cwd. `node --test` starts each test file with the runner's cwd, so running command 2 from `.` gives project-root resolution. | Same |
| Asserts status `0` | L7 `assert.equal(result.status, 0);` | L7, identical |
| Asserts stdout exactly `Hello, world!\n` | L8 `assert.equal(result.stdout, 'Hello, world!\n');` | L8, identical |
| Executes the real CLI (no stub, mock or inline greeting) | Yes. The only greeting in the file is the expected value. | Yes |

**Assertion semantics.** In `node:assert/strict`, `assert.equal` is
`strictEqual`, which compares with `Object.is`. With `encoding: 'utf8'`,
`result.stdout` is a JavaScript string, so the L8 check is an exact comparison
of the full captured stdout.

- Any extra, missing or changed character fails, including whitespace, CR and
  a second newline.
- If the spawn fails or the child is killed by a signal, `result.status` is
  `null`, so L7 fails. A missing or broken CLI cannot pass silently.

## 4. What the tests detect

| Fault in the CLI | Detected by | Evidence |
|---|---|---|
| Wrong greeting text, for example the missing comma `Hello world!` | L8 in both files | **Observed.** Baseline result `result://abiogenesis/6514754aa979c64827c955c618e60ece86ef79274b734c3844f2a13243a95d5c` on CLI `647697a5…`: both tests failed `strictEqual`, actual `'Hello world!\n'` vs expected `'Hello, world!\n'`; command 2 exited `1` with pass 0, fail 2. |
| Missing, doubled or CRLF line ending; leading or trailing whitespace; extra output line | L8 | By strict string equality (§3) |
| Non-zero exit, signal, or spawn failure | L7 | `status !== 0` or `status === null` |
| CLI file missing, or cwd not the project root | L7 and L8 | Node prints `Cannot find module` and exits `1` with empty stdout |
| Extra text on stderr only | Not detected | Out of contract (U-2). Recorded in C2 evidence for the assessor. |
| CLI hangs forever | Not by an assertion | `spawnSync` has no `timeout` and the test runner's default per-test timeout is unbounded. The execution harness bound applies instead: the admitted C2 runs used `timeoutMs 20000`. See §8 R-T2. |

**Non-vacuity.** The baseline evidence is an actual adverse observation: on a
CLI that violated T2, both tests failed. That shows the verifiers discriminate
the property they claim, not merely that they pass.

The baseline observation stays attached to its exact subject, `647697a5…`. It
is kept as historical counterevidence. It is not a claim about the current
bytes.

## 5. Execution design

Two commands are selected by the witness contract. `test-execution-plan.json`
declares matching expectations. The plan states expectations only; it is not
the source that decides which commands run.

### 5.1 Command 1: direct CLI observation (AC-01)

| Field | Value |
|---|---|
| executable, args | `node`, `["generated/hello-world.mjs"]` |
| cwd | `.` (project root) |
| Expected | exit `0`, not timed out, no signal; stdout text `=== "Hello, world!\n"`, `byteLength === 14`, digest `d9014c46…72ff5` |
| stderr | Recorded, not constrained |

This observes T1 and T2 without the test runner in between. It is the direct
Product evidence behind `assertedReturnValue: "Hello, world!"`: stdout with its
single trailing LF removed equals `Hello, world!` (conformance C-4).

### 5.2 Command 2: component and UAT test run (AC-04)

| Field | Value |
|---|---|
| executable, args | `node`, `["--test", "test/component/hello-cli.test.mjs", "test/uat/hello-cli.uat.test.mjs"]` |
| cwd | `.` (project root) |
| Expected exit | `0` |
| Expected summary | `fail 0`, with pass ≥ `expectedTestPassCount` (= 2) |
| Required passing tests (pairing) | `CLI process satisfies its output contract` from the component file and `a user receives the exact promised greeting` from the UAT file |

**Reading the counts.** Pass and fail counts come from the runner's summary.

| Reporter | Pass count line | Fail count line |
|---|---|---|
| spec (as in the admitted evidence) | `ℹ pass N` | `ℹ fail N` |
| TAP | `# pass N` | `# fail N` |

- The substring `fail 0` appears in both reporter formats. Checked locally on
  Node `v24.7.0` (informative only).
- `expectedStdoutMatch` therefore uses `fail 0` and does not pin the reporter
  prefix or an exact pass-count fragment. This follows the original rule: "do
  not pin an exact pass-count fragment when the generated tests add depth
  coverage."

**Pairing rule.** Pass ≥ 2 on its own is not enough (conformance R-08, witness
contract "Scalar UAT success cannot replace the required pairing and coverage
relation"). Each named test must be reported as passing:

- spec reporter: `✔ <name>`
- TAP reporter: `ok N - <name>`

Each file contains exactly one test, so pass ≥ 2 with fail 0 and both names
passing means both files ran the current CLI and passed.

If the supplied tests later gain more depth, pass may exceed 2. That still
meets the ≥ 2 floor without changing the plan.

### 5.3 Acceptance predicate (original `test_execution_result`, AC-08)

Accept only when all of the following hold:

```
command2.exitStatus === 0
∧ observedTestPassCount >= plan.expectedTestPassCount
∧ planSatisfied
```

`planSatisfied` is true only when all of these hold against admitted
observations of the current subject:

1. `command2.stdout` contains every `expectedStdoutMatch` fragment.
2. The observed fail count is `0`.
3. Both paired test names are reported as passing.
4. `command1.exitStatus === 0` and `command1.stdout === "Hello, world!\n"`.
5. `command1.stdout` with its single trailing `"\n"` removed equals
   `plan.assertedReturnValue`.
6. The evidence binds the current digests of `generated/hello-world.mjs` and
   both test files. The test digests must equal §0.

### 5.4 Evidence carrier

Execution-result meaning comes only from admitted command-execution (C2)
observations produced by an actual run. For each command, the observation
records:

- executable and args
- environment
- relative cwd
- integer exit status
- signal and timeout
- stdout and stderr: text, byte length and digest
- digests of the input files

No handwritten `test-execution-result.json`, fabricated success file or author
report counts (conformance C-1, C-2, R-10, AC-07). Local runs by authors,
including the ones cited in this document, are informative only.

## 6. Revision lineage validation (R-13, AC-05, AC-11)

| Step | Subject (CLI SHA-256) | Admitted result | Expected / observed |
|---|---|---|---|
| Baseline, before any change | `647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993` | `6514754a…` | Command 1: exit 0, stdout `Hello world!\n` (violates T2). Command 2: exit `1` (adverse, `nonzero`), pass 0, fail 2. |
| Bounded correction | `647697a5…` → `fe8f4080…` | `e897db22…` (native) | Only `generated/hello-world.mjs` changed: `"Hello world!"` → `"Hello, world!"` |
| Post-correction | `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef` | `db34d3cf…` | Command 1: exit 0, stdout `Hello, world!\n`. Command 2: exit 0, pass 2, fail 0. |

**Rules for using this lineage:**

- The baseline row is permanent counterevidence about `647697a5…`. It must not
  be read as describing `fe8f4080…`, and it must not be dropped.
- Evidence only counts for "current behavior" if it binds the current CLI
  digest.
- If the CLI bytes change again, the post-correction row becomes historical in
  the same way. A new admitted run on the new digest is then required.
- None of this is invalidated by a CLI change: this design, the test sources
  and the plan's expectations. Their meaning does not depend on specific CLI
  bytes.

## 7. Mapping to `test-execution-plan.json`

| Plan field | Test design source |
|---|---|
| `command: "node"`, `args` | §5.2 |
| `expectedTestPassCount: 2` | §5.2; oracle `minimumTestPasses` |
| `expectedStdoutMatch: "fail 0"` | §5.2 |
| `assertedReturnValue: "Hello, world!"` | §5.1; conformance C-4 |
| `cliCheck` | §5.1 |
| `requiredPassingTests` | §5.2 pairing rule |
| `acceptance` | §5.3 |
| `evidence` | §5.4 |
| `lineage` | §6 |

## 8. Verifier adequacy residuals (disclosed, not resolved)

- **R-T1: the two tests are identical in mechanics.** Both use the same spawn
  and the same two assertions. The UAT test differs only in its user framing
  and name.
  - The pairing relation is met: two files, each running the real CLI, each
    passing.
  - The UAT test adds no observation the component test lacks.
  - The original source asks no more, and the test sources are protected.
    Stronger UAT depth would need a new owner decision.
- **R-T2: no hang bound in the tests.** Hang protection depends on the C2
  harness timeout, not on the tests (§4).
- **R-T3: different Node binary lookup.**
  - The tests run the CLI with `process.execPath`, the runner's own Node.
  - Command 1 resolves `node` through `PATH`.
  - In the admitted runs both commands used the same `PATH`, and the Node
    version was not recorded (U-1).
- **R-T4: stderr and other invocations are untested.** stderr, arguments, stdin
  and non-root cwd are not covered (U-2, U-3). The only non-macOS or CRLF
  protection is L8's strict equality; no run on another platform is evidenced
  (U-4).
