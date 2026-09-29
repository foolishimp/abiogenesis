# Implementation Design — basic-cli (`SCN-GLC-HELLO-WORLD-CLI-BASIC`)

Stage meaning: `implementation_design` of the original source.

This document defines the structural HOW for the basic-cli Product. It takes its
authority from `specification/project-conformance.md`, following the original
instruction "Use the prior conformance_project artifact as authority." It
creates no Product meaning. Where it seems to differ from the conformance asset,
the original source, the oracle or the witness contract, those inputs govern.
It accepts nothing. Acceptance belongs to an independent assessment of current
admitted evidence.

## 0. Basis

| Input | Path | SHA-256 | Use here |
|---|---|---|---|
| Conformance (authority) | `specification/project-conformance.md` | `9d02e5fb3f2793e187a7afa673594340a8cb311d6e212cd3b77ba1a764eb43ee` | Requirements R-01..R-14 and criteria AC-01..AC-12 |
| Original source | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` | `implementation_design` and `source` stage instructions |
| Oracle | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` | `cases[0]`, `requiredArtifacts`, `requiredTestFiles` |
| Witness contract | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` | Fixed commands, write confinement, lineage rules |
| Component test (supplied) | `test/component/hello-cli.test.mjs` | `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613` | Named verification surface |
| UAT test (supplied) | `test/uat/hello-cli.uat.test.mjs` | `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4` | Named verification surface |
| CLI source (current when this was written) | `generated/hello-world.mjs` | `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef` | Checked against this design in §3 |

This design does not depend on any particular CLI digest. It defines what any
conforming `generated/hello-world.mjs` must be. §3 records whether the current
bytes realize it.

## 1. Original instructions and where they are met

| Original `implementation_design` instruction | Section |
|---|---|
| "Write only design/implementation-design.md." | §7: this is the only file this design stage writes |
| "Use the prior conformance_project artifact as authority." | §0 and the §6 traceability matrix |
| "Define a minimal Node CLI script at generated/hello-world.mjs." | §2 |
| "The script must print exactly \"Hello, world!\" followed by one newline." | §2.2, §2.3 |
| "Name component and UAT test source surfaces that execute the CLI and assert stdout." | §4 |

## 2. CLI source surface: `generated/hello-world.mjs`

### 2.1 Structure

The Product is one file, `generated/hello-world.mjs` (R-01). No other
application source, module, bin shim, wrapper or package file exists.

- **Module kind:** an ECMAScript module. The `.mjs` extension makes Node load it
  as ESM whether or not a `package.json` exists, so no `package.json` or
  `"type"` field is needed (R-02, conformance §2.4).
- **Imports:** none. The script uses only the global `console` provided by the
  Node runtime. If a future revision needs an import, it must be a `node:`
  builtin (R-02).
- **Shebang or executable bit:** not required. The supported entry is always
  `node generated/hello-world.mjs` (R-05), never direct execution.
- **Body:** exactly one statement.

```js
console.log("Hello, world!");
```

The file ends with a single LF after the statement. The trailing newline in the
source file is a formatting convention and does not affect output.

### 2.2 Output mechanism: why `console.log`

`console.log(s)`, where `s` is a single string argument, writes `s` followed by
exactly one `"\n"` to `process.stdout`.

- **No format expansion.** The literal `"Hello, world!"` has no `%` directive,
  so `util.format` passes it through unchanged.
- **Always LF.** Node's `Console` appends `"\n"`, not `os.EOL`, so the line
  terminator is LF on every platform. This meets the R-03 "exactly one LF, no CR"
  rule by construction. (Evidence exists only for one macOS host; conformance
  U-4.)
- **Exact bytes.** The resulting stdout is the 14-byte UTF-8 sequence
  `48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 0a` (SHA-256
  `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`). This is
  exactly R-03 and oracle `cases[0].stdout`. All characters are ASCII, so
  encoding and locale cannot change the bytes.
- **Assertion value.** The greeting text without the newline, `Hello, world!`,
  is the plan's `assertedReturnValue` (conformance C-4). The design keeps the
  distinction: the text is `Hello, world!`, and stdout is that text plus one LF.

**Equivalent alternative:** `process.stdout.write("Hello, world!\n")` produces
the same bytes. It was not selected because the current source already realizes
`console.log`, so switching would be an unjustified change (R-14, no
out-of-band edit).

### 2.3 Exit behavior

- **Normal exit.** The script does not call `process.exit()` and does not set
  `process.exitCode`. After the statement runs, the event loop is empty and Node
  exits normally with status `0` (R-04, oracle `cases[0].exitStatus`).
- **Why not `process.exit()`.** On some platforms, writes to a stdout pipe are
  asynchronous, and an explicit `process.exit()` can truncate pending stdout.
  Exiting naturally lets Node flush stdout first. Both tests read stdout through
  a pipe (`spawnSync`), so this matters.
- **No other outcomes.** There are no timers, listeners, stdin reads or
  unhandled promises, so the process cannot hang, cannot receive a
  self-inflicted signal, and cannot exit non-zero on the supported entry.

### 2.4 Input and environment independence

- The script reads no `process.argv`, no environment variables, no stdin, no
  files, no time and no locale.
- Its output is the same for every environment the fixed commands run in.
- The oracle's only case is the no-argument case (`arguments: []`). Behavior
  with arguments is unspecified (conformance U-3). The design adds no argument
  handling, so extra arguments are ignored rather than given invented meaning.

### 2.5 Things the CLI deliberately does not do

- It writes nothing to stderr. The source does not constrain stderr
  (conformance U-2), but writing nothing keeps stderr empty and recorded
  truthfully.
- No help, version, flags, localization or configuration (conformance §2.4).
- No package installation, network access or dependency (R-02).

## 3. Does the current source realize this design?

| Design element | Current bytes (`fe8f4080…`, 30 bytes) | Status |
|---|---|---|
| Single statement `console.log("Hello, world!");` plus LF | `console.log("Hello, world!");\n` | Realized |
| No imports, no `process.exit`, no argv, env or stdin use | None present | Realized |
| `.mjs` at `generated/hello-world.mjs` | Yes | Realized |

For history, the supplied pre-correction bytes (`647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993`)
were `console.log("Hello world!");`. That is structurally identical but the
greeting literal has no comma. Admitted baseline result
`result://abiogenesis/6514754aa979c64827c955c618e60ece86ef79274b734c3844f2a13243a95d5c`
recorded what those bytes did:

- Command 1 exited `0` with stdout `Hello world!\n`.
- Command 2 exited `1` with tests 2, pass 0, fail 2.

**Correction.** The only change between those bytes and this design is the
literal `"Hello world!"` → `"Hello, world!"`. Native construction result
`result://abiogenesis/e897db2208fad8afe99c5a184cddd24cb96421de5bb7df496a193774769cc41c`
made that change, touching only `generated/hello-world.mjs`.

- The correction was justified by the baseline failure, not by this design.
  This design was written afterwards and is consistent with it. It does not
  retroactively authorize the correction.
- The baseline failure stays attached to `647697a5…`. It is not a statement
  about `fe8f4080…`.
- Current behavior must be proved by admitted command-execution evidence on the
  current digest. Admitted result
  `result://abiogenesis/db34d3cf4111de970877f4698262cc2802f4878a7e5ada89145a02c7abf0e4c4`
  records that evidence for `fe8f4080…`: command 1 printed `Hello, world!\n`
  and exited `0`; command 2 had pass 2, fail 0 and exited `0`.
- Currentness and pairing of that evidence are computed by the runtime. This
  document does not establish them.

## 4. Verification surfaces

The source-stage outcome is verified by these surfaces. All run from the
project root, which is the working directory for every relative path below.
`design/test-design.md` holds the detailed test design.

| Surface | Path or command | What it does | Authorship |
|---|---|---|---|
| Component test | `test/component/hello-cli.test.mjs` | Spawns the real CLI with `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })`, inheriting the cwd. Asserts `status === 0` and `stdout === 'Hello, world!\n'` with `node:assert/strict`. Test name: `CLI process satisfies its output contract`. | Supplied and reused unchanged (protected) |
| UAT test | `test/uat/hello-cli.uat.test.mjs` | Same real-CLI spawn and the same two strict assertions, framed as the user-visible outcome. Test name: `a user receives the exact promised greeting`. | Supplied and reused unchanged (protected) |
| Fixed command 1 | `node generated/hello-world.mjs` | Runs the CLI directly. The evidence must show exit `0`, stdout exactly `Hello, world!\n` (14 bytes), and the stderr as recorded. | Selected by the witness contract |
| Fixed command 2 | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs` | Runs both tests. The evidence must show exit `0`, `fail 0`, pass ≥ 2, and a passing test from each file. | Selected by the witness contract. `test-execution-plan.json` declares matching expectations. |

- **Both tests execute the CLI.** Each test spawns a new Node process on
  `generated/hello-world.mjs` and asserts on that process's actual exit status
  and captured stdout. Neither stubs, mocks or inlines the greeting (R-06, R-07,
  AC-03).
- **Which Node runs.** Both tests use `process.execPath`, the same Node binary
  that runs `node --test`, so no second lookup on `PATH` happens.
- **Proof comes from admitted evidence.** Only admitted command-execution (C2)
  evidence for the two fixed commands counts as proof (R-10, AC-07). It must
  bind the current CLI and test digests. No handwritten
  `test-execution-result.json` is part of this design (conformance C-1, C-2).

## 5. Failure boundaries

| Condition | Resulting behavior | Disposition |
|---|---|---|
| Working directory is not the project root | `Error: Cannot find module …` (`MODULE_NOT_FOUND`), exit `1` (observed locally on Node `v24.7.0`; informative) | Outside the supported entry (R-05, U-3). The fixed commands use cwd `.`. |
| Greeting literal altered, for example the baseline's missing comma | Stdout differs from R-03, and both tests fail on strict equality | Detected. The baseline evidence shows this (AC-05). |
| Newline missing or doubled, or a CR added | Stdout differs from R-03 | Detected by strict equality. `console.log` prevents this by construction. |
| Explicit non-zero exit or signal added | `status !== 0` (a signal makes `status` `null`) | Detected by `assert.equal(result.status, 0)` |
| Node missing or lacking the built-in test runner | Command cannot run | Host capability gap, not a Product defect (U-1). Local host observed Node `v24.7.0` (informative, not admitted). |

## 6. Traceability to the conformance authority

| Conformance requirement | Design element |
|---|---|
| R-01 Source surface | §2.1: one file at `generated/hello-world.mjs` |
| R-02 No installation | §2.1: no imports, `.mjs` without `package.json`; §2.5 |
| R-03 Exact stdout | §2.2: `console.log` with one literal, LF by construction, 14 bytes |
| R-04 Successful exit | §2.3: natural exit, status `0`, no `process.exit` |
| R-05 Invocation | §2.1, §4: `node generated/hello-world.mjs` from the project root, no arguments |
| R-06, R-07 Component and UAT verifiers | §4: both named, both spawn the real CLI and assert status and stdout |
| R-08 Test execution | §4: fixed command 2 and the pairing requirement |
| R-09 Execution plan | §4: plan expectations match fixed commands 1 and 2; the plan does not drive execution |
| R-10 Execution-result meaning | §4: carried by admitted C2 evidence |
| R-11 Implementation design content | This document |
| R-12 Test design content | Delegated to `design/test-design.md` |
| R-13 Revision lineage | §3: baseline, correction and post-correction evidence, each bound to its digest |
| R-14 Scope protection | §7 |

## 7. Change territory and invalidation

- **Write territory.** Application writes are limited to the five paths in
  conformance §2.5.
  - This design allows no change to the protected inputs: the original source,
    the oracle, the witness contract and both test sources.
  - It needs no further change to `generated/hello-world.mjs`, because the
    current bytes realize it (§3).
- **This design becomes stale if:** the conformance asset, original source,
  oracle or witness contract changes; or a new CLI revision departs from §2.
- **A CLI byte change by itself** does not invalidate this design. It does make
  any behavior evidence bound to the previous digest non-current, so that
  evidence needs a fresh admitted run.

## 8. Residuals

These unknowns carry over from conformance and are not resolved here:

- U-1: Node version. Not recorded in the admitted evidence.
- U-2: stderr. Unconstrained by the source.
- U-3: other invocations.
- U-4: behavior on non-macOS platforms. Not evidenced.
- U-6: the internal mechanics of the library.

This design does not claim acceptance.
