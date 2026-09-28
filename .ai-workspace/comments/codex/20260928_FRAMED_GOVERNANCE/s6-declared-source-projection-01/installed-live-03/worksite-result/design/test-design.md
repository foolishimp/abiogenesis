# Test Design: basic-cli (`SCN-GLC-HELLO-WORLD-CLI-BASIC`)

Stage meaning: `test_design`. This asset specifies the component and UAT
validation of the CLI stdout contract. It also specifies the executable proof
plan that turns the fixed commands into decidable observations. The supplied
test sources are reused as realizations of this design; they are protected and
not authored here. This asset is a realization for independent assessment, not
acceptance.

## 0. Authority and basis

| Role | Path | SHA-256 |
|---|---|---|
| Requirement authority | `specification/project-conformance.md` | `13c5d91da001aae2836e4baa0bf91a5f734a3e9580aeb63dfe707b103fe26470` |
| Design authority | `design/implementation-design.md` | `79257416e08f63d99b4885560bae3cd276c509ebde711a391d1609ff46ac3dfc` |
| Original task | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` |
| Independent oracle | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` |
| Witness contract | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` |
| Component verifier (supplied) | `test/component/hello-cli.test.mjs` | `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613` |
| UAT verifier (supplied) | `test/uat/hello-cli.uat.test.mjs` | `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4` |

A change to any digest above invalidates this design. A change to the CLI bytes
does not, because the tests and predicates are defined over behavior, not over
the CLI's bytes. It does make stale any evidence bound to the old CLI digest
(§6.4).

## 1. Contract under test

This comes from conformance §2 and implementation design §3.

- **Invocation:** `node generated/hello-world.mjs`, with no arguments and the
  project root as working directory.
- **stdout:** exactly `"Hello, world!\n"`. That is 14 bytes
  (`48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 0a`), sha256
  `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`.
- **Exit:** status `0`, no signal.

**Not under test:** stderr content (U-2), behavior with arguments, another
working directory or another runtime (U-3), and performance.

## 2. Test cases

### T-COMP-1: component, the CLI process output contract

- **Claim.** Running the Product file with the running Node binary produces
  exactly the contracted process result: exit status `0` and the 14 stdout
  bytes.
- **Surface.** `test/component/hello-cli.test.mjs`, test name
  `CLI process satisfies its output contract`.
- **Precondition.** The working directory is the project root. The test passes
  the relative path `generated/hello-world.mjs` to `spawnSync` with no `cwd`
  option, so it resolves against the working directory that `node --test`
  inherits (conformance I-3).
- **Action.**
  `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })`.
  `process.execPath` is the same Node binary as the test runner, so the child
  process does not depend on `PATH`.
- **Oracle.** `assert.equal` from `node:assert/strict`, which is strict equality
  with no type coercion:
  - `result.status === 0`;
  - `result.stdout === 'Hello, world!\n'`.

  There is no trimming, substring or regex comparison.
- **Verdict.** Pass if and only if both assertions hold. A spawn error or a
  signal leaves `status` as `null`, so the status assertion fails.

### T-UAT-1: user outcome, the promised greeting

- **Claim.** A user who runs the documented command sees exactly the promised
  greeting on stdout, and the command reports success. This is the original
  `uat_test_source` meaning: "the user-visible CLI output is exactly
  `"Hello, world!\n"`". Status `0` is also required, because `test_design`
  requires both tests to assert it.
- **Surface.** `test/uat/hello-cli.uat.test.mjs`, test name
  `a user receives the exact promised greeting`.
- **Precondition, action and oracle.** The same as T-COMP-1.
- **Why the checks are the same.** The Product's whole user-visible surface is
  one argument-free invocation. At the process boundary, the user outcome and
  the component contract are the same observable.
- **What distinguishes the two tests** is the claim each carries and the pairing
  rule (§5), under which each must pass on its own:
  - T-COMP-1 is the component-level claim;
  - T-UAT-1 is the user-level acceptance claim.
- **Consequence (conformance U-4).** The two tests give no separate diagnosis. A
  single defect fails both, as happened in the baseline. This design judges that
  adequate for a one-statement Product. The judgment is for the independent
  assessment to confirm.

### X-CLI-1: exact-byte check of the direct invocation (carried by command E-1, not by a test file)

The test files do not record byte length, digest, signal or stderr. The admitted
C2 observation of `node generated/hello-world.mjs` does. From it:

- `exitStatus === 0`, `processSignal === null`, `timedOut === false`;
- `stdout.text === "Hello, world!\n"`, which is `assertedReturnValue` plus one
  `"\n"` (conformance I-1);
- `stdout.byteLength === 14`;
- `stdout.digest === "sha256:d9014c46…72ff5"`;
- stderr is recorded. It is expected to be empty, but it is not a pass/fail
  criterion (U-2).

## 3. Adequacy of the supplied verifiers (static review)

| Conformance element | Component file | UAT file |
|---|---|---|
| `import { test } from 'node:test'` | yes | yes |
| `import assert from 'node:assert/strict'` | yes | yes |
| `import { spawnSync } from 'node:child_process'` | yes | yes |
| Spawns `process.execPath` with exactly `['generated/hello-world.mjs']` | yes | yes |
| Runs from the project root (inherited cwd; no `cwd` override) | yes | yes |
| `{ encoding: 'utf8' }`, so `stdout` is a string that a string strict-equality can match | yes | yes |
| Strict `status === 0` | yes | yes |
| Strict `stdout === 'Hello, world!\n'` | yes | yes |
| Runs the real file in a real child process, with no stub, mock, fixture or cached output (R-VER-3) | yes | yes |
| Exactly one test, with a name unique across the two files | yes | yes |

Limitations. None of these violates a source requirement.

- The status is asserted before stdout. If both are wrong, only the status
  failure is reported. This affects diagnosis only.
- `spawnSync` has no `timeout`. A hanging CLI would hang its test. The C2
  command timeout bounds this externally; the admitted observations show
  `timeoutMs` 20000.
- stderr is not asserted, which is consistent with U-2.
- The tests cannot be changed in this Run (R-VER-5). Any extra depth would need
  the owner of the test sources.

## 4. Falsification power

**Empirical (admitted).** Baseline observation
`result://abiogenesis/7d8d7f5fb42032f75ae9dc9e25aa3ca1583a3d2977bb54dece7f63130970ab02`
was made on the CLI at `647697a5…`, which printed `"Hello world!\n"`.

- In both tests the status assertion held (exit 0). Both then failed the strict
  stdout assertion on the missing comma.
- E-2 exited `1` with `pass 0, fail 2`.

This shows that both verifiers detect the actual historical defect. It is
evidence about `647697a5…` only.

**Analytic (predicted, not executed in this Run).** Running these mutants would
require edits to the CLI, which is outside this asset's write territory, so the
outcomes below are reasoned from the assertions:

| CLI mutant | Predicted verifier outcome |
|---|---|
| Missing comma (observed in the baseline) | Both fail on stdout |
| No trailing newline (`process.stdout.write("Hello, world!")`) | Both fail on stdout |
| Extra newline, trailing space, CRLF or different case | Both fail on stdout |
| Greeting written to stderr (`console.error`) | Both fail: stdout is `''` |
| `process.exit(1)` after printing | Both fail on status |
| Syntax error, missing file or throw at load | Both fail on status (non-zero), and stdout is `''` |
| Extra output on stderr only | Both pass. stderr is unconstrained (U-2). |
| Behavior that depends on arguments | Not exercised, because no arguments are passed. Out of scope (U-3). |

The only mutants that survive are those that change unconstrained or
out-of-scope relations.

## 5. Pairing and coverage rule (R-VER-4)

- **Required files.** Both `test/component/hello-cli.test.mjs` and
  `test/uat/hello-cli.uat.test.mjs` (oracle `requiredTestFiles`).
- **Per-file pass.** Each file must contribute at least one executed, passing
  test.
  - The default reporter lists passing tests by name, not by file.
  - Each expected name is unique to one file, so a per-file pass is decided by
    each name appearing as passing:
    - `✔ CLI process satisfies its output contract` (component);
    - `✔ a user receives the exact promised greeting` (UAT).
  - Under the TAP reporter the equivalent is an `ok N - <name>` line.
- **Aggregate floor.** The observed pass count must be at least 2 (oracle
  `minimumTestPasses`; plan `expectedTestPassCount`). The fail count must be `0`
  and the cancelled count `0`.
- **Why the aggregate alone is not enough.** Two passes could come from one file.
  A single scalar success also cannot stand in for the pair (witness contract).
- **The pass count is a floor, not a pinned value.** Later depth tests are
  allowed (original `test_execution_plan`: "do not pin an exact pass-count
  fragment").

## 6. Execution design (proof plan)

### 6.1 Commands

These are the fixed prospective commands from the witness contract. Both run
with the project root as working directory, `node` resolved through `PATH`, no
required environment variables, no install and no network.

| ID | Command | Test cases exercised |
|---|---|---|
| E-1 | `node generated/hello-world.mjs` | X-CLI-1 |
| E-2 | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs` | T-COMP-1, T-UAT-1 |

- `test-execution-plan.json` declares these expectations. It does not control
  execution.
- The execution result is carried by an admitted C2 command-execution
  observation. It is not carried by a handwritten `test-execution-result.json`
  or by an author's report (conformance §8 C-1, C-2).
- E-1 and E-2 are independent and may run in either order. Both must bind the
  same subject digests.

### 6.2 Observed-result predicates

These are evaluated over the C2 `commandResults` entries. Counts are read from
the reporter summary text, because admitted observations carry `reports: []`
(conformance I-5).

| ID | Predicate |
|---|---|
| P-1 | E-1 `exitStatus === 0`, `processSignal === null` and `timedOut === false`. |
| P-2 | E-1 `stdout.text === assertedReturnValue + "\n"`, which is `"Hello, world!\n"`, with byteLength 14. |
| P-3 | E-2 `exitStatus === 0` and `timedOut === false`. |
| P-4 | `observedTestPassCount` is N from the first E-2 stdout line matching `^(ℹ\|#) pass (\d+)$`. It holds when N ≥ `expectedTestPassCount` (2). |
| P-5 | E-2 stdout contains `expectedStdoutMatch` (`fail 0`), and the observed fail count from `^(ℹ\|#) fail (\d+)$` equals `0`. |
| P-6 | Pairing (§5): both expected test names appear as passing in E-2 stdout, and the cancelled count from `^(ℹ\|#) cancelled (\d+)$` is `0`. |
| P-7 | Currentness: the observation's recorded digests for `generated/hello-world.mjs` and both test files equal the worksite digests at assessment. The protected-file digests equal those in §0. |

- **`planSatisfied`** is P-1 ∧ P-2 ∧ P-3 ∧ P-4 ∧ P-5. This follows conformance
  R-RES-2(c) and interpretation I-2.
- **`test_execution_result` acceptance** requires `planSatisfied` ∧ P-6 ∧ P-7,
  together with a distinct independent semantic assessment (conformance AC-10).
  No predicate can be satisfied by the plan file itself.

### 6.3 Why `fail 0` is the stable match fragment

- The same summary appears under the spec reporter (`ℹ fail 0`) and the TAP
  reporter (`# fail 0`).
- Which reporter Node uses by default depends on the Node version and on whether
  stdout is a TTY. The admitted C2 output uses spec format.
- `fail 0` stays true when depth tests are added.
- `pass 2` is deliberately not used, because it would pin the pass count.

### 6.4 Current versus historical evidence

- **Current subject.** Acceptance evidence must bind CLI `fe8f4080…` (or whatever
  CLI digest is current at assessment) and the §0 test digests (P-7).
  - Admitted observation
    `result://abiogenesis/56805fe3c08b6090c1bd5f5732dae0052e14fdabf28488db3725f1ab2277704b`
    binds exactly that set. None of P-1..P-7 depends on the design assets or the
    plan beyond the values fixed by the original source (2, `fail 0`,
    `"Hello, world!"`).
  - Whether the parent requires a new C2 observation after these assets exist is
    a policy decision for the parent. It is not decided here.
- **Historical subject.** Baseline `7d8d7f5f…` on `647697a5…` fails P-2..P-6. It
  is retained as the adverse evidence for the revision obligation: the declared
  adverse command E-2 was non-zero.
  - It must not be evaluated against the current subject.
  - It must not be discarded because the bytes changed.

## 7. Static correspondence check of the execution plan (assessor aid; not a fixed command)

This check is read-only and writes nothing. Run from the project root, it
decides R-PLAN-1..6 mechanically. Whether the plan's meaning is sufficient
remains a judgment for the assessment.

```sh
node --input-type=module -e '
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const p = JSON.parse(readFileSync("test-execution-plan.json", "utf8"));
const testArgs = ["--test", "test/component/hello-cli.test.mjs", "test/uat/hello-cli.uat.test.mjs"];
assert.equal(p.command, "node");
assert.deepEqual(p.args, testArgs);
assert.ok(Number.isInteger(p.expectedTestPassCount) && p.expectedTestPassCount >= 2);
const m = [].concat(p.expectedStdoutMatch);
assert.ok(m.some((s) => s.includes("fail 0")));
assert.ok(!m.some((s) => /pass \d/.test(s)));
assert.equal(p.assertedReturnValue, "Hello, world!");
const find = (a) => p.commands.find((c) => c.command === "node" && JSON.stringify(c.args) === JSON.stringify(a));
assert.equal(find(["generated/hello-world.mjs"]).expected.stdout, p.assertedReturnValue + "\n");
assert.equal(find(["generated/hello-world.mjs"]).expected.exitStatus, 0);
assert.equal(find(testArgs).expected.exitStatus, 0);
console.log("plan corresponds to fixed commands and original expectations");
'
```

## 8. Residuals

- **U-4.** The component and UAT tests are logically identical. The pairing is
  satisfied by claim and by file, not by independent diagnosis.
- The mutant outcomes in §4 are predictions. Only the missing-comma mutant has
  admitted evidence.
- **U-1.** No Node version is recorded. Reporter format and `node:test`
  availability depend on it, and `fail 0` is chosen to be robust across that
  variation.
- **I-5.** Counts are parsed from reporter text. No structured test report is
  admitted.
- `spawnSync` has no per-test timeout. Only the C2 command timeout bounds a hang.
