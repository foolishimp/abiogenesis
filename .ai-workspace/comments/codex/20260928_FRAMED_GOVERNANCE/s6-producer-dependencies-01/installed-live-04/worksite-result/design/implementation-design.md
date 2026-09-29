# Implementation Design: basic-cli Hello World CLI

- Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC` (key `basic-cli`, kind `node_cli`)
- Stage meaning realized: `implementation_design`
- Asset: `design/implementation-design.md`
- Status: authored design. It is not accepted and it accepts nothing. Whether it
  satisfies AC-09 of the conformance asset is for independent assessment.
- Authorship note: this file was written in the same native vector as
  `design/test-design.md` and `test-execution-plan.json`. Each of those assets
  carries only its own stage meaning. This vector wrote no source, test, package
  or result file.

## 1. Authority

| Basis | Identity | Use in this design |
|---|---|---|
| `specification/project-conformance.md` | sha256 `a74a75b6c83d4daf1eeb0e6a7517827869c7520094940873c4b645d680ac993c` | **Governing authority for this design** (original `implementation_design`: "Use the prior conformance_project artifact as authority"). Applies REQ-01 to REQ-05, REQ-08, REQ-13, REQ-14 and AC-01 to AC-04, AC-09. |
| `source/original-basic-cli.txt` | sha256 `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` | Governing Product source above the conformance asset. Nothing here departs from it. |
| `source/witness-contract.md` | sha256 `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` | Lifecycle, evidence and write-territory rules. |
| `source/basic-cli.oracle.json` | sha256 `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` | Independent evaluation data. Not a design input beyond corroboration. |

This design decides structure only. It adds no Product meaning. Where the source
leaves behavior unspecified (conformance U2 and U3), the choices below are design
choices inside the conformance §3 boundary, not new requirements.

## 2. Design decision

| Element | Decision | Traces to |
|---|---|---|
| Source surface | `generated/hello-world.mjs` is the only application file. No second module, wrapper or generated intermediate exists. | REQ-01, AC-04 |
| Module format | ECMAScript module, selected by the `.mjs` extension. No `package.json` `type` field is needed. | REQ-02 |
| Dependencies | None. The file has no `import` and no `require`. It uses only the global `console`. | REQ-02, AC-03 |
| Operation | One statement: `console.log("Hello, world!");` | REQ-03 |
| Output channel | stdout only. The design writes nothing to stderr. | REQ-03, U3 |
| Termination | The process exits naturally once the event loop is empty, so the status is `0`. There is no `process.exit(...)`, no `process.exitCode` assignment and no asynchronous work. | REQ-04 |
| Inputs | None are read. argv, stdin, the environment and the file system are ignored, so output does not depend on them. | §3 boundary, U2 |
| Invocation | `node generated/hello-world.mjs`, run from the project root with no arguments. No shebang, executable bit, `bin` entry, npm script or build step. | REQ-02, conformance §3 |

## 3. Source specification

Exact file content (30 bytes, ASCII/UTF-8, no BOM, one trailing LF):

```js
console.log("Hello, world!");
```

Byte form: `636f6e736f6c652e6c6f67282248656c6c6f2c20776f726c642122293b0a`.

Why this produces exactly the required stdout, `48656c6c6f2c20776f726c64210a`
(14 bytes, sha256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`):

1. `console.log` with a single string argument writes `util.format(arg)` followed
   by `"\n"` to `process.stdout`. With no further arguments and no `%` in the
   literal, `util.format` returns the literal unchanged.
2. Node's `Console` always appends LF (`\n`), not `os.EOL`, so no CR is emitted on
   any platform.
3. The literal is pure ASCII (capital `H`, comma, one space, lowercase `world`,
   `!`), so its UTF-8 encoding equals the expected 13 bytes. With the LF that
   makes 14 bytes. No BOM is emitted.
4. Nothing else writes to stdout. Nothing is imported, and Node's own warnings go
   to stderr.
5. After the synchronous call there is no pending work. Node flushes stdout and
   exits with status `0`.

**Permitted equivalent, not selected:** `process.stdout.write("Hello, world!\n");`
emits the same bytes. It is not selected because the current file already
realizes the `console.log` form (see §7). Switching would change the subject
digest without changing behavior, and the current evidence would become stale for
no gain.

**Competing paths disposed (must not be introduced):**

- `process.exit(0)` after the write. It is unnecessary and can truncate stdout
  when stdout is asynchronous (for example, pipes on Windows).
- `process.stdout.write("Hello, world!")` without `\n` (no newline), or
  `console.log("Hello, world!\n")` (two newlines).
- A greeting that is computed, templated, localized, or read from a file, argv or
  the environment.
- `package.json`, lockfile, `node_modules`, npm scripts, `bin` installation,
  TypeScript or any transpile or build step.
- Any extra stdout output: banners, debug lines, trailing whitespace.

## 4. Public boundary and failure boundaries

- **Entry:** `node generated/hello-world.mjs` with cwd = project root (the
  directory containing `generated/`, `test/` and `source/`), no arguments and no
  stdin. Node resolves the path relative to cwd. From any other cwd the entry is
  not found: Node exits `1` with `ERR_MODULE_NOT_FOUND` on stderr and empty stdout.
  That is outside the supported entry and is not a Product behavior.
- **Exits:** stdout bytes (§3) and exit status `0`. stderr is not a Product exit
  (U3). The design emits none, but no requirement constrains it.
- **Failure modes and how they surface:**

| Failure | Effect at the exits | Detected by |
|---|---|---|
| Wrong literal (for example, the baseline's missing comma) | stdout differs | both verifiers; fixed command 1 |
| Missing or duplicated newline | stdout differs | both verifiers; fixed command 1 |
| Syntax or runtime error | status `1`, stdout empty | both verifiers; fixed command 1 |
| Killed by a signal | status `null` | both verifiers (`null !== 0`) |
| `node` not on PATH | fixed command 1 cannot start | executor records the spawn failure |
| stdout closed early (EPIPE) | out of scope | none required |

## 5. Verification surfaces

The original `implementation_design` stage requires naming the component and UAT
test source surfaces that execute the CLI and assert stdout. Both are supplied,
protected verifiers. They are reused, not authored here.

| Surface | Identity | What it does | Role |
|---|---|---|---|
| `test/component/hello-cli.test.mjs` | sha256 `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613`; test `CLI process satisfies its output contract` | `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })`, then `assert.equal(result.status, 0)` and `assert.equal(result.stdout, 'Hello, world!\n')` from `node:assert/strict` | Component: the CLI process meets its interface contract (REQ-06, AC-05) |
| `test/uat/hello-cli.uat.test.mjs` | sha256 `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4`; test `a user receives the exact promised greeting` | Same spawn and the same two strict assertions | UAT: the user-visible outcome (REQ-07, AC-06) |
| Fixed command 1 | `node generated/hello-world.mjs`, cwd `.` | Direct run of the Product entry, outside any test harness | Execution proof of stdout and status (REQ-05, AC-01, AC-02) |
| Fixed command 2 | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`, cwd `.` | Runs both verifiers against the current CLI | Coverage and pairing (REQ-12, AC-07) |
| `design/test-design.md` | authored with this file | Test meaning, adequacy analysis and pass criteria | REQ-09, AC-10 |
| `test-execution-plan.json` | authored with this file | Prospective declaration of both commands and the result criteria. It does not control execution. | REQ-10, AC-11 |
| Admitted C2 command-execution observations | produced by the measurement owner | Carry the `test_execution_result` meaning. No handwritten `test-execution-result.json` exists (conformance C2). | REQ-11, AC-12 |

**Seams the verification depends on:**

- **cwd seam.** Both tests pass a relative path and set no `cwd`, so the spawned
  CLI inherits the test process's cwd. `node --test` runs each test file in a
  child process that inherits the runner's cwd. Fixed command 2 must therefore run
  at the project root. A wrong cwd makes both tests fail (status `1`, empty
  stdout); it cannot make them pass falsely.
- **Interpreter seam.** The tests spawn `process.execPath`, the Node binary that
  runs the test file. Fixed command 1 resolves `node` from PATH. In one environment
  with one PATH, both resolve to the same binary. The admitted observations
  record PATH, but no Node version is recorded (U1).
- **Currentness seam.** The verifiers spawn the file rather than importing it, so
  each run exercises whatever bytes are on disk at that moment. Evidence is
  current only when its recorded digest for `generated/hello-world.mjs` equals the
  file under assessment (AC-08).

## 6. Correspondence with the conformance asset (AC-09)

| AC-09 element | Where this design meets it |
|---|---|
| Cites the conformance asset as authority | §1 |
| CLI at `generated/hello-world.mjs` as a dependency-free Node ES module | §2, §3 |
| Output exactly `Hello, world!` plus one `\n`, exit `0` | §3 steps 1–5; §2 termination |
| Mechanism emits exactly one LF | §3 step 2; disposed alternatives |
| Names component and UAT surfaces that execute the CLI and assert stdout | §5 |
| Realizable | Needs only a Node runtime with `node:test` (18 or later; U1). No install, no network. |
| Consistent with the current CLI | §7 |
| Contradicts no REQ | REQ-01 to REQ-05 are realized in §2–§4, REQ-06/07 in §5, REQ-10 to REQ-12 are delegated to the plan and test design, and §7 respects REQ-13/14. |

## 7. Revision lineage and consistency with the current CLI

- **Baseline (historical).** The admitted testing observation
  `result://abiogenesis/b63cfd1d…` measured CLI digest
  `647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993`. Command 1
  exited `0` with stdout `"Hello world!\n"` (13 bytes). Command 2 exited `1` with
  pass 0 and fail 2.
  - Design classification: the defect is in the **literal**, a missing comma. It
    is not in the **mechanism**: exit status and the single LF were already
    correct.
  - This failure stays attached to digest `647697a5…`. It is not retargeted.
- **Correction.** The native construction `result://abiogenesis/50dd6daf…`
  changed only `generated/hello-world.mjs`: `console.log("Hello world!");` became
  `console.log("Hello, world!");`, giving digest
  `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef`. That change
  fixes the literal and keeps the mechanism, which is what §3 prescribes.
  - The correction preceded this design (conformance C1). This design does not
    authorize it after the fact. It records that the corrected bytes and the
    design agree.
- **Current subject.** The file at authoring time is 30 bytes with the exact
  byte form given in §3, and its digest is `fe8f4080…`. **No further change to the
  CLI is required by this design.** Any future change must stay inside
  `generated/hello-world.mjs` and match §3. It would make evidence about
  `fe8f4080…` stale but leave the baseline valid as history.
- **Invalidation of this design.** It depends on Product meaning (the original
  source and the conformance asset at `a74a75b6…`), not on the CLI bytes. A change
  to the conformance asset, the original source or the contract invalidates it. A
  CLI change that departs from §3 makes the CLI non-conforming; it does not change
  this design.

## 8. Frame-family dispositions (design owner's proposal)

The conformance §10 asks the design owner to confirm two proposed
non-materiality dispositions. The confirmations below are proposals for the
assessor, not acceptance.

- **Design Component: non-material.** The CLI is one statement with no internal
  components, sibling seams or composition. Its parent contract is the public
  boundary in §4.
- **Install: non-material for the Hello World Product.** No installed Product
  coordinate exists. Node executes the source file directly (REQ-02). The
  installed GTL/HoG/ABG assets belong to the Development Product, stay protected
  and are not exercised as this Product.
- **Reuse/Foundation.** Node built-ins only: `console`, and `node:test`,
  `node:assert/strict` and `node:child_process` in the verifiers. No package was
  considered because any package would violate REQ-02.
- **Effect.** One observational stdout write. No file, network or process-state
  effects.

## 9. Residuals for the assessor

- **C1.** The stage order differs from the original: the CLI was corrected before
  conformance and design existed.
- **C4.** One plan command versus two fixed commands. The plan keeps the original
  top-level `command`/`args` as the test command and adds the CLI invocation in a
  separate field.
- **C7.** The admitted runs executed in an archived sandbox copy, tied to the
  worksite only by matching digests.
- **U1.** Node version. The author's local `node --version` returned `v24.7.0`;
  that is not admitted evidence.
- The design's consistency with the current CLI was checked by reading the file's
  bytes, not by an admitted run. The behavior claim rests on the admitted C2
  observations and their independent assessment.
