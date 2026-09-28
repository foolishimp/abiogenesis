# Test Design: basic-cli Hello World

- Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC` (key `basic-cli`, kind `node_cli`)
- Stage realized by this asset: `test_design` (`OS:L37-45`)
- Status: authored test design. This file does not execute anything, and it
  does not accept, admit, or claim any outcome. Test results come only from
  admitted command-execution observations. Acceptance belongs to the
  independent assessment and the parent termination rule.

## 1. Authority and basis

| Short ref | Path | SHA-256 | Role here |
|---|---|---|---|
| `PC` | `specification/project-conformance.md` | `220ed4e30552ccb257def26e481e629f411dffd13480b80083ad249920e19d52` | Governing requirements R-6, R-7, R-8, R-10, R-11, R-12, R-13 and criteria AC-1, AC-3, AC-4, AC-9, AC-10 |
| `ID` | `design/implementation-design.md` | `355e130dac58e3b9186632aeb6bea8e98f57983ab4ee9b01ba4240724c1de27f` | Subject structure (D-1..D-7), output contract (§3.2), verification surfaces (§5), lineage (§4) |
| `OS` | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` | Stage text for `test_design`, `component_test_source`, `uat_test_source` and `test_execution_result` |
| `OR` | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` | Oracle case and `minimumTestPasses` |
| `WC` | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` | Fixed commands, evidence admissibility, pairing rule |

## 2. Contract under test

**Subject.** The current `generated/hello-world.mjs`, run as a real child
process with no arguments and with cwd set to the project root. The subject is
identified by the CLI digest recorded in the admitted observation, never by
path alone.

**Oracle.** The oracle comes only from `OS` and `OR`, never from the CLI's
output or an earlier run:

| Case | Arguments | Expected stdout | Expected exit | Source |
|---|---|---|---|---|
| `OR:cases[0]` | `[]` | `Hello, world!\n` (14 bytes, hex `48656c6c6f2c20776f726c64210a`) | `0` | `OS:L13`, `OS:L34`, `OS:L43`, `OR:cases[0]` |

**Predicates.** Both test cases apply exactly these two predicates:

- **P-EXIT:** `result.status` strictly equals `0`. A signal kill or spawn
  failure yields `status === null` and fails.
- **P-OUT:** `result.stdout` strictly equals `'Hello, world!\n'`. The stdout
  is decoded as UTF-8. Because the expected value is pure ASCII, and decoding
  maps any invalid byte to U+FFFD and keeps a BOM as U+FEFF, string equality
  here means byte equality with the 14 oracle bytes.

## 3. Test cases

### TC-COMP-1: Component, `CLI process satisfies its output contract`

| Field | Specification |
|---|---|
| File | `test/component/hello-cli.test.mjs` (`sha256:8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613`) |
| Level and boundary | Component. The component is the single CLI script (`ID` D-1). It exposes no importable API (`ID` D-4 and rejected alternatives), so its component boundary is the process interface: argv in, stdout and exit status out. |
| Framework | `test` from `node:test`; default export of `node:assert/strict`; `spawnSync` from `node:child_process` (`OS:L51`) |
| Procedure | `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })`. cwd is inherited, and the test command runs from the project root (`OS:L52`). |
| Assertions | `assert.equal(result.status, 0)` (P-EXIT), then `assert.equal(result.stdout, 'Hello, world!\n')` (P-OUT). In strict mode `equal` is `strictEqual`. |
| Traces to | `OS:L43`, `OS:L53`; `PC R-3`, `R-4`, `R-6`, `R-7` |
| Pass condition | Both assertions hold, and the reporter marks the test passed |

### TC-UAT-1: User acceptance, `a user receives the exact promised greeting`

| Field | Specification |
|---|---|
| File | `test/uat/hello-cli.uat.test.mjs` (`sha256:5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4`) |
| Level and user outcome | User acceptance. A user runs the CLI with Node and no arguments, sees exactly the greeting `Hello, world!` on one line, and gets a successful exit. |
| Framework | Same as TC-COMP-1 (`OS:L61`) |
| Procedure | Same real-process spawn as TC-COMP-1 (`OS:L62`) |
| Assertions | P-EXIT, then P-OUT on the user-visible stdout (`OS:L63`) |
| Traces to | `OS:L43`, `OS:L63`; `PC R-3`, `R-4`, `R-6`, `R-8` |
| Pass condition | Both assertions hold, and the reporter marks the test passed |

### CHK-CLI-1: Direct CLI execution proof

| Field | Specification |
|---|---|
| Command | `node generated/hello-world.mjs`, cwd `.` (`WC:L54`) |
| Expectations | exit `0`; no timeout or signal; stdout is exactly the 14 oracle bytes (SHA-256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`) |
| Purpose | The execution proof that runs the CLI and observes stdout (`OS:L13`). Stdout without its single trailing LF equals the plan's `assertedReturnValue`, `Hello, world!` (`OS:L76`). |
| Counting | This is not a `node:test` case and does not count toward the pass count. |

### Component and UAT distinction and pairing

The two test cases use the same mechanics on purpose. `OS:L43` requires
*both* tests to spawn the CLI and assert status `0` and exact stdout, and the
CLI has no in-process seam (`ID` D-4). What differs is the role and the
source of the oracle:

- TC-COMP-1 checks the source stage's process contract (`OS:L34`, `OS:L53`).
- TC-UAT-1 checks the user-visible promise (`OS:L63`).

Pairing rule (`PC R-12`, `WC:L78-79`): in one run of the test command, both
named tests MUST be reported passing. Neither replaces the other. Exit `0`
alone, UAT alone, or an aggregate pass count without both named tests is not
sufficient.

## 4. Adequacy review of the supplied verifiers

Both files are supplied, protected and reused (`PC C-4`). They are not authored
here. Each original stage instruction is checked against the actual file text:

| Original instruction | Component file | UAT file | Verdict |
|---|---|---|---|
| Use `node:test` (`OS:L51`, `OS:L61`) | L1 `import { test } from 'node:test'` | L1, same | Met |
| Use `node:assert/strict` | L2 `import assert from 'node:assert/strict'` | L2, same | Met |
| Use `spawnSync` from `node:child_process` | L3 `import { spawnSync } from 'node:child_process'` | L3, same | Met |
| Run `process.execPath` with `["generated/hello-world.mjs"]` from the project root (`OS:L52`, `OS:L62`) | L6 `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })`, cwd inherited | L6, same | Met when the test command runs from the root (§8, `PC U-4`) |
| Assert status 0 (`OS:L43`, `OS:L53`) | L7 `assert.equal(result.status, 0)` | L7, same | Met (for UAT, required by `OS:L43`) |
| Assert stdout exactly `Hello, world!\n` (`OS:L43`, `OS:L53`, `OS:L63`) | L8 `assert.equal(result.stdout, 'Hello, world!\n')` | L8, same | Met |
| Executes the real CLI, not a stub, import or copied string (`PC R-6`) | Child process of the actual file | Same | Met; see §5.1 for observed confirmation |

Conclusion: both verifiers meet `PC R-7` and `PC R-8` as written. This review
applies only while both files keep the digests above.

## 5. Discriminating power

### 5.1 Observed (admitted evidence)

| Subject CLI digest | Admitted C2 observation (test command) | Test-source digests in the record | Result |
|---|---|---|---|
| `647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993` (baseline, historical) | `worksite-command-observation://abiogenesis/eb7e0c91488d17d99a2db2273da5e2d6d8f5bb0f9d27a952d3e7ac94be8649d0` | `8b55bf3f…4613`, `5449c227…34d4` | exit `1`, `pass 0`, `fail 2`. Both tests failed P-OUT with actual `'Hello world!\n'`. |
| `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef` (corrected) | `worksite-command-observation://abiogenesis/69ff716ab6ec3b1cc96c7f49309dca4c1372a918d2809759ec500ec485a2a9ab` | Same two digests | exit `0`, `pass 2`, `fail 0`. Both named tests passed. |

Between the two runs, only the CLI digest changed. The test-source digests
were identical. The change in outcome is therefore caused by the CLI bytes,
which shows that both verifiers execute the real current CLI and detect a
one-byte deviation. This is the verifier-adequacy evidence that the witness
requires. The baseline row stays bound to `647697a5…` (`PC R-13`).

### 5.2 Analytical mutation table

Each row is a plausible faulty CLI and the result it would produce under
P-EXIT and P-OUT. The stdout and status predicates were checked in memory with
`node:assert/strict` on the listed values. No CLI file was mutated.

| Mutant | stdout / status | P-EXIT | P-OUT | Detected |
|---|---|---|---|---|
| Missing comma (the actual baseline) | `Hello world!\n` / 0 | pass | fail | Yes (also observed, §5.1) |
| No newline (`process.stdout.write("Hello, world!")`) | `Hello, world!` / 0 | pass | fail | Yes |
| Extra newline | `Hello, world!\n\n` / 0 | pass | fail | Yes |
| CRLF terminator | `Hello, world!\r\n` / 0 | pass | fail | Yes |
| Trailing space | `Hello, world! \n` / 0 | pass | fail | Yes |
| UTF-8 BOM prefix | `﻿Hello, world!\n` / 0 | pass | fail | Yes |
| Wrong case | `hello, world!\n` / 0 | pass | fail | Yes |
| Invalid byte in output | `H�ello, world!\n` / 0 | pass | fail | Yes |
| Greeting written to stderr only | `` / 0 | pass | fail | Yes |
| Correct output, then `process.exit(1)` or a thrown error | `Hello, world!\n` / 1 | fail | pass | Yes |
| Killed by a signal | any / `null` | fail | — | Yes |
| Never exits | spawn blocks | — | — | Yes. The C2 runner's 20000 ms timeout fails the test command. No assertion is involved. |
| Correct stdout plus extra stderr | `Hello, world!\n` / 0 | pass | pass | No. stderr is not constrained (`PC U-2`); this is intentionally out of scope. |
| Different behavior when given arguments | not exercised | — | — | No. Out of scope (`PC U-1`). |

## 6. Execution design

| Item | Specification |
|---|---|
| Test command | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs` (`OS:L72-73`, `WC:L55`) |
| cwd | Project root (relative `.`) |
| File selection | Both required files are named explicitly (`OR:requiredTestFiles`). The command does not rely on glob discovery. |
| Expected exit | `0` |
| Expected summary | `tests >= 2`, `pass >= 2`, `fail 0` |
| Required named passes | `CLI process satisfies its output contract` (component) and `a user receives the exact promised greeting` (UAT) |
| Pass-count floor | `expectedTestPassCount = 2`: one component plus one UAT (`OS:L74`, `OR:minimumTestPasses`). The exact count is not pinned, so added depth tests still satisfy the plan (`OS:L75`). |
| Stable zero-failure fragment | `fail 0`. It matches both the spec reporter line `ℹ fail 0` and the TAP line `# fail 0` (`PC U-3`). It contains no pass-count fragment. |
| Direct CLI command | `node generated/hello-world.mjs`, cwd `.`, per CHK-CLI-1 |

Reading the reporter output. This parsing is used only to evaluate the
results; it does not define what the result means.

- `observedTestPassCount` is `N` from the summary line matching
  `^(?:ℹ|#) pass (\d+)$` (multiline).
- `observedTestFailCount` is `N` from `^(?:ℹ|#) fail (\d+)$`.
- A named test counts as passing when the stdout contains a line starting with
  `✔ <name>` (spec reporter) or `ok <n> - <name>` (TAP) at top level. No line
  starting with `✖ <name>` or `not ok <n> - <name>` may appear for that name.

## 7. Coverage matrix

| Requirement | TC-COMP-1 | TC-UAT-1 | CHK-CLI-1 | Plan and assessment |
|---|---|---|---|---|
| `PC R-3` exact stdout | P-OUT | P-OUT | bytes and digest | `assertedReturnValue` |
| `PC R-4` exit 0 | P-EXIT | P-EXIT | status | `expectedExitStatus` |
| `PC R-2` no install | runs with no manifest | same | same | Static inspection (`PC AC-2`) |
| `PC R-6` spawn the real CLI | yes | yes | yes | §4, §5.1 |
| `PC R-7`, `R-8` verifier adequacy | §4 | §4 | — | `PC AC-4` digests |
| `PC R-11` acceptance rule | contributes pass | contributes pass | contributes `planSatisfied` | §8 |
| `PC R-12` pairing and coverage | named pass | named pass | — | both named, `pass >= 2`, `fail 0` |
| `PC R-13` revision | baseline fail, corrected pass | same | baseline 13 bytes, corrected 14 bytes | §5.1 lineage |

## 8. Result acceptance (`test_execution_result`)

`OS:L82-86` produces no files. The independent assessment decides the result
from admitted C2 observations and `test-execution-plan.json` (`PC R-10`,
`PC R-11`). Accept only if all of the following hold for one current subject:

1. The admitted test-command observation has `exitStatus === 0`.
2. `observedTestPassCount >= expectedTestPassCount` (2).
3. `planSatisfied` is true. That means all of the following:
   - The fail count is `0`.
   - The stdout contains `expectedStdoutMatch` (`fail 0`).
   - Both named tests pass (§6).
   - The admitted CHK-CLI-1 observation has `exitStatus === 0` and stdout
     exactly `assertedReturnValue + "\n"`.
   - Neither observation timed out or was ended by a signal.
   - Both observations were taken on the same current CLI digest and the
     protected test-source digests.

Otherwise the result is rejected. A rejection is kept as evidence. It is never
a reason to change an expectation, a test source or the oracle (`PC R-15`).

## 9. Evidence admissibility

- Only admitted C2 command-execution observations count. Each must record the
  executable, args, environment, relative cwd, exit status, stdout, stderr,
  and file digests (`WC:L61-63`, `PC AC-8`).
- A local run by an author or designer is informative only. No authored
  `test-execution-result.json` stands in for the admitted evidence
  (`PC C-1`).
- Observations of an earlier CLI digest are historical. They can show the
  revision lineage (`PC AC-10`), but they never prove current behavior.

## 10. Known limitations and residuals

- **cwd dependence (`PC U-4`).** The tests pass a relative path and do not set
  `cwd`. Run from another directory, they fail for a reason unrelated to the
  CLI. The declared commands fix cwd to the project root.
- **No per-test timeout.** `spawnSync` has no `timeout` option in either test,
  so a hung CLI is caught by the runner timeout rather than by an assertion.
- **stderr and arguments** are unconstrained (`PC U-1`, `PC U-2`).
- **Node binary and version** are not recorded in the admitted observations
  (`PC U-3`). The `fail 0` fragment and the §6 regular expressions cover both
  reporter formats.
- **Same mechanics** in both tests are required by `OS:L43`. A mechanically
  independent component check would need an importable seam, which `ID`
  rejects.
- **Supplied, not authored.** The verifiers are reused. Their adequacy (§4)
  is this design's judgment and is subject to independent assessment.

## 11. Invalidation

- A change to either test-source digest invalidates §4, §5.1 and every
  admitted pass that depends on those files.
- A change to the CLI digest makes all current-behavior observations stale.
  The test design itself stays valid.
- A change to `PC`, `ID`, `OS`, `OR` or `WC` invalidates the sections that
  cite the changed text.
