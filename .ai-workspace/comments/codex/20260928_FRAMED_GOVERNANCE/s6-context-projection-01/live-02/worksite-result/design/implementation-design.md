# Implementation Design: basic-cli Hello World

- Scenario: `SCN-GLC-HELLO-WORLD-CLI-BASIC` (key `basic-cli`, kind `node_cli`)
- Stage realized by this asset: `implementation_design` (`OS:L17-27`)
- Status: authored design. This file does not accept, admit, or claim any
  outcome. Behavior is proved only by admitted command-execution evidence, and
  acceptance belongs to the independent assessment and the parent termination
  rule.

## 1. Authority and basis

The prior `conformance_project` artifact is the governing authority for this
design (`OS:L22`). This design adds structure only. It does not add, narrow or
reinterpret any conformance requirement. If this design and `PC` disagree, `PC`
governs, and the disagreement is a defect in this design. It is not a new
reading of `PC`.

| Short ref | Path | SHA-256 | Role here |
|---|---|---|---|
| `PC` | `specification/project-conformance.md` | `220ed4e30552ccb257def26e481e629f411dffd13480b80083ad249920e19d52` | Governing authority: Intent, Product boundary, R-1..R-15, AC-1..AC-12, conflicts C-1..C-4, unknowns U-1..U-9 |
| `OS` | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` | Complete original task; read directly for stage text |
| `OR` | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` | Independent oracle case and minimum passes |
| `WC` | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` | Witness case law: fixed commands, write territory, revision lineage |

Citation forms: `PC R-3`, `PC AC-1`, `PC §3.3`, `OS:L24`, `OR:cases[0]`,
`WC:L54`.

## 2. Design decisions

The Product is one file with one statement and no dependencies. Every decision
below is the smallest structure that satisfies the cited requirement.

| ID | Decision | Satisfies | Rationale |
|---|---|---|---|
| D-1 | The source surface is one ECMAScript module file at `generated/hello-world.mjs`. There is no other source file, directory, or generated build output. | `PC R-1`, `OS:L12`, `OS:L23`, `OS:L30` | The `.mjs` extension makes Node load the file as a module without a `package.json` `"type"` field, so no manifest is needed (`PC R-2`). |
| D-2 | The only supported entry is `node generated/hello-world.mjs`, run from the project root with no arguments. There is no shebang, `bin` mapping, `package.json`, or wrapper script. | `PC R-1`, `PC R-2`, `WC:L54`, `OR:cases[0].arguments` | The invocation is fixed by `WC:L54`. A shebang or `bin` entry would only serve direct execution, which is not a declared command and would add an unrequired entry path. |
| D-3 | The output operation is exactly one call, `console.log("Hello, world!")`. Nothing else writes to stdout. | `PC R-3`, `OS:L24`, `OS:L34` | With a single string argument, `console.log` writes that string unchanged and appends exactly one `\n` (LF) to `process.stdout`. It appends LF, never CRLF, on every platform. The resulting stdout is the 14 bytes in §3.2. |
| D-4 | The file has no `import` or `require`, not even of `node:` built-ins. | `PC R-2`, `PC AC-2`, `OS:L33` | `console` and `process.stdout` are globals. Nothing needs to be resolved, installed, or fetched. |
| D-5 | The process exits normally: the module finishes and the event loop drains. There is no `process.exit()`, no `process.exitCode` assignment, and no thrown error. | `PC R-4`, `OS:L43` | A normal drain gives exit status `0`. Avoiding `process.exit()` also avoids dropping buffered stdout on platforms where pipe writes are asynchronous. |
| D-6 | There is no argument, stdin, or environment handling. | `PC §3.2`, `PC U-1` | The source and oracle define only the no-argument case. Parsing would add behavior the source does not require. |
| D-7 | Nothing is written to stderr. | `PC U-2` | stderr is not a criterion. D-3 and D-5 produce none, and none has been observed. |

Rejected alternatives:

- `process.stdout.write("Hello, world!\n")` meets the same byte contract.
  It is not preferred, because it moves the newline into the literal where it
  can be dropped or doubled by editing. It is not a defect if a future
  correction uses it.
- A `package.json` with `"type": "module"`, a `bin` entry or npm scripts is
  rejected by `PC R-2` and `OS:L14`.
- An exported `greet()` function plus a runner would create an in-process
  component seam. No source stage asks for one, the supplied verifiers do not
  use one, and it would widen the causal cone.

## 3. Source surface specification

### 3.1 Required program

`generated/hello-world.mjs` MUST be a program whose only observable effects,
when run as in D-2, are the stdout bytes in §3.2 and exit status `0`. The
reference realization is exactly one line terminated by LF:

```js
console.log("Hello, world!");
```

That realization is 30 bytes: hex
`636f6e736f6c652e6c6f67282248656c6c6f2c20776f726c642122293b0a`.

### 3.2 Output contract

| Property | Required value | Source |
|---|---|---|
| stdout text | `Hello, world!` followed by one LF | `OS:L13`, `OS:L24`, `OS:L34`, `OR:cases[0].stdout` |
| stdout bytes | `48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 0a` (14 bytes) | `PC R-3` |
| stdout SHA-256 | `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5` | `PC R-3` |
| Exit status | `0`, with no signal and no timeout | `OS:L43`, `OR:cases[0].exitStatus`, `PC R-4` |
| Arguments | none | `OR:cases[0].arguments` |
| Return value asserted by the plan | `Hello, world!` (stdout without its single trailing LF) | `OS:L76` |

### 3.3 Current realized subject (informative)

When this design was written, `generated/hello-world.mjs` was 30 bytes with
SHA-256 `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef`.
A byte dump matched §3.1 exactly. The current source therefore conforms to
D-1..D-7 by inspection. Inspection is not behavioral proof; behavior is proved
only by `PC AC-1` and `PC AC-3` over admitted observations of the current
digest.

## 4. Correction design and revision lineage

`OS` places the source stage after this design. In the actual lineage, the
supplied CLI was measured and corrected before this design existed (`PC C-3`).
`WC:L43-46` permits that order. This section does not authorize a repair after
the fact. It records the fault, shows that the correction already made is the
bounded change this design requires, and fixes the lineage rules that later
evidence must follow.

### 4.1 Baseline measurement (historical subject)

| Item | Value |
|---|---|
| Subject | Supplied unverified `generated/hello-world.mjs`, `sha256:647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993` |
| Command 1 | Admitted C2 observation `worksite-command-observation://abiogenesis/d7a6c74245d34af7e1d6f52d21443b5bb3266e19588834d6e7cd35912aab07ce`: exit `0`, stdout `Hello world!\n` (13 bytes, `sha256:0ba904eae8773b70c75333db4de2f3ac45a8ad4ddba1b242f0b3cfc199391dd8`), stderr empty |
| Command 2 | Admitted C2 observation `worksite-command-observation://abiogenesis/eb7e0c91488d17d99a2db2273da5e2d6d8f5bb0f9d27a952d3e7ac94be8649d0`: exit `1`, `tests 2`, `pass 0`, `fail 2`. Both tests failed `strictEqual` with actual `'Hello world!\n'` and expected `'Hello, world!\n'`. |
| Material failure | `PC R-3` is violated. The exit status (`PC R-4`), newline and encoding were correct. |

### 4.2 Fault localization

The observed stdout differs from §3.2 by one missing byte: `0x2c` (`,`) at
offset 5. Status, terminator and all other bytes match. The fault is therefore
in the string literal of the D-3 call, and that literal is the whole causal
cone of the correction. Nothing in the observations points to the tests, the
runtime, the invocation or the environment. Editing the tests to expect
`Hello world!` would be an answer repair, which `WC:L92` forbids and
`PC R-14` protects against.

### 4.3 Bounded correction

| Item | Value |
|---|---|
| Change | In `generated/hello-world.mjs` only, the literal `"Hello world!"` becomes `"Hello, world!"` |
| Carrier | Native construction result `result://abiogenesis/a55f6c05d82e61635cb5da84a86e74b336178f6015071e3bfded650abf0aa3f3`, `changedPaths: ["generated/hello-world.mjs"]` |
| Digests | `647697a5…4993` → `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef` |
| Protected digests | The source, oracle, contract and both test sources are unchanged (the dependency records in both C2 observations list identical test-source digests) |
| Residual | The pre-change bytes cannot be read in the worksite. Their content, `console.log("Hello world!");`, is the construction author's report (`PC U-7`). It is consistent with the admitted 13-byte stdout. |

### 4.4 Post-correction observations (current at authoring)

| Command | Admitted C2 observation on `fe8f4080…e9ef` | Result |
|---|---|---|
| 1 | `worksite-command-observation://abiogenesis/46f72954f7121f69cb8bc5ce27292b51d689fbcf1b2f04fc9ee17952219c0ba4` | exit `0`, stdout 14 bytes `sha256:d9014c46…2ff5`, stderr empty |
| 2 | `worksite-command-observation://abiogenesis/69ff716ab6ec3b1cc96c7f49309dca4c1372a918d2809759ec500ec485a2a9ab` | exit `0`, `tests 2`, `pass 2`, `fail 0`; both named tests passed |

### 4.5 Lineage rules

1. The baseline observations stay bound to `647697a5…` as historical
   counterevidence. They are never retargeted to later bytes and never
   discarded because the bytes changed (`WC:L65-69`, `PC R-13`).
2. A claim about current behavior uses only admitted observations whose file
   records carry the CLI digest current at the time of the claim.
3. If the CLI changes again, the §4.4 observations become historical in the
   same way, and commands 1 and 2 must be observed again.
4. The causal chain is baseline failure (§4.1) → localization (§4.2) → bounded
   edit (§4.3) → fresh observation of the new subject (§4.4). Each link is a
   separate admitted record, and none replaces another.
5. This design depends on the CLI bytes only in §3.3, §4.3 and §4.4, which are
   informative. D-1..D-7 and §3.1-§3.2 survive any CLI change that still
   satisfies them.

## 5. Verification surfaces

Both test sources are supplied, protected verifiers. They are reused because
they are adequate (`PC C-4`, `PC R-7`, `PC R-8`) and are not authored by this
design. `design/test-design.md` owns the test cases, adequacy review and
acceptance evaluation.

| Surface | Path or command | Digest | Stage | What it does | What it asserts |
|---|---|---|---|---|---|
| Component test source | `test/component/hello-cli.test.mjs`, test `CLI process satisfies its output contract` | `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613` | `component_test_source` (`OS:L46-55`) | `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })` from the inherited cwd | `status === 0`; `stdout === 'Hello, world!\n'` |
| UAT test source | `test/uat/hello-cli.uat.test.mjs`, test `a user receives the exact promised greeting` | `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4` | `uat_test_source` (`OS:L56-65`) | Same spawn of the real CLI | `status === 0`; user-visible stdout `=== 'Hello, world!\n'` |
| Direct CLI command | `node generated/hello-world.mjs`, cwd `.` | — | Execution proof (`OS:L13`), `WC:L54` | Runs the CLI | stdout and exit per §3.2 |
| Test command | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs`, cwd `.` | — | `test_execution_plan` (`OS:L72-73`), `WC:L55` | Runs both verifiers against the current CLI | exit `0`, `pass >= 2`, `fail 0`, both named tests pass |
| Execution plan | `test-execution-plan.json` | — | `test_execution_plan` | Declares the two commands and the expectations | — |
| Execution-result carrier | Admitted C2 command-execution observations | — | `test_execution_plan` result part and `test_execution_result` (`PC C-1`, `PC C-2`) | Records the real command, args, env, cwd, status, stdout and stderr | — |

`process.execPath` is the absolute path of the Node binary running the test
runner. Spawning it with `["generated/hello-world.mjs"]` is the
`node generated/hello-world.mjs` invocation that `OS:L43` requires, pinned to
the same Node binary.

## 6. Requirement trace

| PC requirement | Design element | Verified by |
|---|---|---|
| R-1 source surface | D-1, D-2, §3.1 | Inspection; commands 1 and 2 name the path |
| R-2 no package installation | D-1, D-2, D-4 | Inspection (`PC AC-2`); command 1 runs with no manifest |
| R-3 exact stdout | D-3, §3.2 | Command 1 bytes (`PC AC-1`); both tests' stdout assertion (`PC AC-3`) |
| R-4 exit 0 | D-5 | Command 1 status; both tests' status assertion |
| R-5 this design | This file: §1 authority, D-1 script, §3.2 output, §5 test surfaces, §6-§7 realizability | Independent assessment (`PC AC-5`) |
| R-6 test design | Delegated to `design/test-design.md` | `PC AC-6` |
| R-7, R-8 verifier adequacy | §5 | `design/test-design.md` §4; `PC AC-4` |
| R-9 plan | §5 execution plan row | `test-execution-plan.json`; `PC AC-7` |
| R-10 truthful result | §5 carrier row; §4.5 | Admitted C2 records (`PC AC-8`) |
| R-11 acceptance rule | Delegated to test design and plan | `PC AC-9` |
| R-12 coverage and pairing | §5 both test rows | Command 2 (`PC AC-3`) |
| R-13 revision lineage | §4 | `PC AC-10` |
| R-14 protection | D-4, §4.2, §4.3, §8 | Digest comparison (`PC AC-11`) |
| R-15 non-shrinking | §4.2 rejects test edits; §9 | Assessment |

## 7. Realizability and dependencies

- **Runtime.** The CLI needs only a Node with ES module support. The
  verifiers need `node:test` and `node:assert/strict`, which are built in to
  current Node releases. No package manager, registry, network or build step
  is involved.
- **Node binary.** The admitted C2 records carry `PATH` but not the resolved
  `node` executable or its version (`PC U-3`). On this host,
  `/usr/local/bin/node` (the first `PATH` entry) does not exist. The
  interactive shell at design time resolved `node` to `/opt/homebrew/bin/node`
  `v24.7.0`. That is an informative local observation, not admitted
  evidence.
- **Working directory.** Both the CLI path and the tests' spawn argument are
  relative, so both commands must run with cwd equal to the project root. The
  admitted records show relative cwd `.` (`PC U-4`).
- **Failure boundaries.** A missing `node` binary makes both commands fail at
  spawn. A hung CLI is ended by the C2 runner's 20000 ms timeout. A throwing
  CLI exits non-zero. Each is reported as a failure and never treated as
  success.

## 8. Write territory

This design writes only `design/implementation-design.md`. No change to any
other file follows from it now: the current CLI already matches §3.1. If a
later admitted observation shows the CLI deviating from §3.2, the correction
goes to the construction owner of `generated/hello-world.mjs`, bounded as in
§4.2. The test sources, oracle, original source and contract are never
correction targets (`PC §3.3`).

## 9. Invalidation

- A change to `PC` invalidates the design decisions that cite the changed
  requirements.
- A change to `OS`, `OR` or `WC` invalidates this design.
- A change to either test source invalidates §5 and the test-design adequacy
  review.
- A CLI change affects only the informative §3.3, §4.3 and §4.4. D-1..D-7 stay
  valid, and the new bytes must be inspected and observed again.
- Observed results never narrow §3.2 (`PC R-15`).

## 10. Open points inherited from PC

- `PC U-3`: Node version and binary are unrecorded in admitted evidence.
- `PC U-4`: the verifiers depend on cwd.
- `PC U-7`: the baseline source bytes are known only by digest, output and
  author report.
- `PC C-1`..`C-4`: resolved by the case authority. This design applies those
  resolutions (§5) but does not own them.
