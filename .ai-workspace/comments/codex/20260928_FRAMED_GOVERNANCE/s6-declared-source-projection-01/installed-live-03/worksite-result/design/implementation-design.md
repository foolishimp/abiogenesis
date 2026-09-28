# Implementation Design: basic-cli (`SCN-GLC-HELLO-WORLD-CLI-BASIC`)

Stage meaning: `implementation_design`. This asset defines the structural HOW
for the Product declared in `specification/project-conformance.md`. It covers
the source surface, its runtime behavior, and the verification and execution
surfaces that prove it. It contains design only. The CLI source, test sources
and execution plan are separate surfaces. It is a realization for independent
assessment, not acceptance.

## 0. Authority and basis

| Role | Path | SHA-256 |
|---|---|---|
| Design authority (predecessor `conformance_project`) | `specification/project-conformance.md` | `13c5d91da001aae2836e4baa0bf91a5f734a3e9580aeb63dfe707b103fe26470` |
| Original task | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` |
| Independent oracle | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` |
| Witness contract | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` |

Rules:

- The conformance asset is the authority for this design, as the original
  `implementation_design` stage requires. This design adds no Product meaning
  (R-DES-2). If this design and the conformance asset disagree, that is a
  specification re-entry. It is not a design decision.
- Conformance interpretations used here: I-1 (greeting versus line), I-3
  (project-root working directory) and U-5 (minimality).
- **Invalidation.** A change to any basis digest above invalidates this design.
  A change to the CLI bytes does not. It makes only §5 stale, because §5 names
  the current CLI digest. §1–§4 still hold for any bytes that satisfy D-1..D-6.

## 1. Design summary

The Product is one file with one statement. `generated/hello-world.mjs` contains:

```js
console.log("Hello, world!");
```

It is run as `node generated/hello-world.mjs` from the project root. It has no
imports, no manifest, no argument handling and no explicit exit. The two supplied
verifiers each spawn it with the running Node binary and strictly assert exit
status `0` and stdout `"Hello, world!\n"`. The two fixed prospective commands
(§4) exercise the Product and the verifiers, and admitted C2 command observations
carry the execution result.

## 2. Source surface design

- **D-1 Location and module kind** (R-SRC-1, R-SRC-2).
  - The file is `generated/hello-world.mjs`.
  - The `.mjs` extension makes Node load it as an ES module whatever any
    `package.json` `"type"` says. No `package.json` is needed, and none exists.
  - There is no shebang and no executable-bit requirement. The Product is invoked
    through `node`, so direct execution is out of scope.
- **D-2 Greeting emission** (R-SRC-3, R-DES-1). A single
  `console.log("Hello, world!")` call.
  - Node's global `console.log` writes to `process.stdout` and appends one `"\n"`
    (LF). It does not use `os.EOL`, so the terminator is LF on every platform.
  - `console.log` formats its arguments with `util.format`. The only argument is
    a string literal with no `%` character, so no format specifier can change it.
    **Constraint:** if the literal is ever changed, it must still contain no `%`,
    or it must be written with `process.stdout.write`.
  - The result is the 13 greeting bytes plus `0x0a`: the 14 bytes in conformance
    §2 (sha256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`).
  - Equivalent alternative: `process.stdout.write("Hello, world!\n")`. It produces
    the same bytes. It was not chosen because it has no advantage, and replacing
    the current conforming realization would be a CLI edit with no admitted
    failure behind it (R-REV-2).
- **D-3 Termination and exit status** (R-SRC-4).
  - The script does not call `process.exit` and does not set `process.exitCode`.
    After the one statement the event loop is empty, so Node terminates normally
    with status `0` and no signal.
  - `process.exit()` is deliberately avoided. Node documents that it forces exit
    even while asynchronous writes to `process.stdout` are still pending, so it
    could truncate output on some stdout kinds.
  - The single statement has no failure path under the contracted invocation.
    A reader closing stdout early is outside the Product boundary.
- **D-4 Dependencies** (R-SRC-2).
  - The only dependency is the Node runtime and its global `console`. The script
    has no `import` statements.
  - There is no `package.json`, no `node_modules`, no install step and no network
    access.
  - Required runtime capability: `.mjs` ES-module loading for the Product. The
    verifiers also need the `node:test` module and the `--test` flag. No Node
    version is pinned (conformance U-1).
- **D-5 Minimality** (R-SRC-5, conformance U-5).
  - The script does not parse arguments, branch on the environment, read stdin,
    or do any I/O other than the one stdout write.
  - Extra arguments are ignored, not rejected. Behavior with arguments is outside
    the Product boundary (U-3), and this design adds no argument handling.
- **D-6 Encoding** (R-SRC-3).
  - The source file and the greeting are pure ASCII.
  - The stdout bytes are therefore the same under any UTF-8 or ASCII-compatible
    locale. The admitted C2 environment sets `LANG`/`LC_ALL` to `C.UTF-8`.

## 3. Runtime interaction (public boundary)

1. A caller starts `node` with argv `["generated/hello-world.mjs"]` and the project
   root as working directory. The caller is a user, the component test, the UAT
   test or the C2 executor.
2. Node resolves the relative path against the working directory and loads the
   file as an ES module. This is why the project-root precondition (I-3) is part
   of the command contract.
3. The script writes the 14 bytes to fd 1.
4. The event loop drains. The process exits with status `0` and no signal.

The observable contract is the pair (stdout bytes, exit status). stderr is not
constrained (U-2). This design writes nothing to it, so stderr is expected to be
empty, but non-empty stderr alone does not violate the contract.

## 4. Verification and execution surfaces (R-DES-1, last bullet)

### 4.1 Verifier sources (supplied, protected, reused; not authored in this Run)

| Surface | SHA-256 | Role | Executes | Asserts |
|---|---|---|---|---|
| `test/component/hello-cli.test.mjs` | `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613` | Component: the CLI process satisfies its interface contract | `spawnSync(process.execPath, ['generated/hello-world.mjs'], { encoding: 'utf8' })` | `status` strictly equals `0`; `stdout` strictly equals `'Hello, world!\n'` |
| `test/uat/hello-cli.uat.test.mjs` | `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4` | User outcome: a user receives the exact promised greeting | same call | same assertions |

Both use `node:test`, `node:assert/strict` and `spawnSync` from
`node:child_process`, as the original component and UAT test-source stages
require. Their detailed test design, adequacy review and pairing rule are in
`design/test-design.md`.

### 4.2 Execution surfaces (fixed prospective commands, witness contract)

| ID | Command (cwd = project root) | Proves | Carried by |
|---|---|---|---|
| E-1 | `node generated/hello-world.mjs` | The Product's exact stdout bytes (text, byte length, digest), exit status, signal and stderr (conformance AC-1) | Admitted C2 command observation |
| E-2 | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs` | Both verifiers run against the current CLI: exit status, pass count of at least 2, `fail 0`, and a pass from each file (AC-2, AC-3) | Admitted C2 command observation |

- `test-execution-plan.json` declares both commands and their expected results.
  It records expectations only. It is not the runtime source of the commands and
  contains no observed results (R-PLAN-7).
- Evidence carrier: C2 observations under
  `contract://abiogenesis/worksite/command-execution-observation@5`. Each records
  executable, args, environment, relative cwd, exit status, signal, stdout,
  stderr and the digests of the files it depends on.
- The admitted observations ran in a sandbox copy of the worksite with
  `relativeCwd "."`; the stack traces in the baseline show paths under
  `.ai-workspace/archive/worksite-command-execution/…/sandbox/`. Subject identity
  is therefore carried by the recorded file digests, not by filesystem location.
- A handwritten `test-execution-result.json` is not part of this design
  (conformance §8 C-1).

## 5. Realization check against the actual worksite (informative; bound to digests)

- **Current CLI.** `generated/hello-world.mjs` is the 30 bytes
  `console.log("Hello, world!");\n`, sha256
  `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef`. It matches
  D-1..D-6 exactly. This design requires and authorizes no further CLI change.
- **Baseline relation (R-REV-1..3).**
  - The supplied bytes (sha256 `647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993`,
    `console.log("Hello world!");`) violated D-2: the comma after `Hello` is
    missing.
  - Admitted baseline observation `result://abiogenesis/7d8d7f5f…` recorded it.
    E-1 exited 0 with stdout `"Hello world!\n"` (13 bytes). E-2 exited 1 with
    pass 0 and fail 2.
  - Construction result `result://abiogenesis/1f11cf4c…` inserted one character
    (`,`) and changed nothing else. That is the smallest change that makes the
    bytes conform to D-2.
  - Admitted observation `result://abiogenesis/56805fe3…` binds the corrected
    digest `fe8f4080…`.
  - The baseline failure stays attributed to `647697a5…`. This design does not
    re-interpret it or move it onto the new bytes.
- **Staleness.** If the CLI bytes change again, this section becomes stale and
  must be re-checked. §1–§4 remain valid unless the conformance asset changes.

## 6. Traceability

| Conformance requirement | Design element |
|---|---|
| R-SRC-1 | D-1 |
| R-SRC-2 | D-1, D-4 |
| R-SRC-3 | D-2, D-6, §3 |
| R-SRC-4 | D-3, §3 |
| R-SRC-5 | D-5 |
| R-VER-1..5 | §4.1; detail in `design/test-design.md` |
| R-DES-1 | §0 (authority), §1, D-2, D-3, D-4, §4.1 |
| R-DES-2 | D-5, §5, §7 |
| R-PLAN-1..7, R-RES-1..3 | §4.2; `test-execution-plan.json`; `design/test-design.md` §6 |
| R-REV-1..3 | §5 |
| R-SCOPE-1 | §7 |

## 7. Change territory of this design

- `generated/hello-world.mjs`: only the one-character correction, which has
  already been made and admitted (§5). Nothing further.
- Authored alongside this design: `design/test-design.md` and
  `test-execution-plan.json`.
- Not touched:
  - the original source, the oracle and the witness contract;
  - both test sources;
  - the conformance asset;
  - installed assets.
- The design adds no files: no `package.json`, no helper module, no new test file.

## 8. Evaluation frame coverage

This section records how the design treats each generic frame family. It is a
design-level judgment for the assessor to confirm or overturn, not a
materiality determination.

| Family | Treatment |
|---|---|
| Product | Material. Owned by conformance §1–§2. This design adds no Product meaning. |
| Product Composition | No Product-to-Product relation is involved. Node is the execution platform (see Install), and the verifiers are development surfaces, not composed Products. Proposed as non-material. |
| Design | Material: this document. |
| Design Component | One component, the script. Its only seams are the Node runtime (§3) and the verifiers (§4.1). |
| Public Boundary | Material: the §3 invocation and its (stdout, exit status) contract. |
| Entity | The CLI file, identified by path plus digest. Evidence binds the digest (§4.2, §5). |
| Operator | One operation: write the greeting, then terminate normally (D-2, D-3). |
| Owner | Conformance owns meaning, the oracle owns evaluation, the supplied seed owns the protected test sources, and C2 owns execution evidence. The independent assessment owns the verdict. |
| Effect | One observable output effect (the stdout write) plus process exit. No artifact or runtime state is mutated. |
| Reuse/Foundation | Node's built-in `console` and `node:test` are used. Nothing is reimplemented locally. |
| Install | The source forbids an install step. The subject is the file run by `node`, resolved through `PATH` in the C2 environment. The Node version is not recorded (residual U-1). |
| Proof | `design/test-design.md` and `test-execution-plan.json` describe the proof. C2 carries the evidence. The independent assessment makes the judgment. |

## 9. Residuals carried forward

- **U-1.** No Node version is pinned or recorded in admitted evidence. The C2
  `PATH` starts with `/usr/local/bin`, so which `node` it resolves is not
  recorded.
- **U-2.** stderr is unconstrained.
- **U-3.** Behavior with arguments, another working directory or another runtime
  is outside the Product boundary.
- **D-2 constraint.** D-2 relies on the greeting literal containing no `%`. Any
  future change to the literal must re-check this.
