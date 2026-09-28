# Project Conformance: basic-cli (`SCN-GLC-HELLO-WORLD-CLI-BASIC`)

Stage meaning: `conformance_project`. This asset declares the Intent, Product
boundary, source-grounded requirements and completion criteria for the minimal
CLI Hello World software-build traversal. It writes no source, tests, package
files or execution plans. It is a realization for independent assessment. It is
not acceptance.

## 0. Governing sources and precedence

| Role | Path | SHA-256 |
|---|---|---|
| Original task (Product and requirement authority) | `source/original-basic-cli.txt` | `ce602ce2cc0fcefaba288623a675a770d11bc14d224b90045aebbe031330172f` |
| Independent oracle (evaluation authority) | `source/basic-cli.oracle.json` | `028073e4cb24bd7444dd15d48b0e16d37df236edf7a003cb3ca26286aca6c585` |
| Witness contract (selected case authority: mechanism, lineage, scope) | `source/witness-contract.md` | `f97359de0fe6181e44c334496993b20b82b49cdbbf0b8b66ee18de7eac34a63b` |
| Supplied component verifier (reused, not authored in this Run) | `test/component/hello-cli.test.mjs` | `8b55bf3f6324da565a1de9a5186444e36c43f450484463aafc84b65fd9da4613` |
| Supplied UAT verifier (reused, not authored in this Run) | `test/uat/hello-cli.uat.test.mjs` | `5449c227c7173bb1b812e46e06d3341b1624e832a2a74105f9a109ee201134d4` |
| Source surface (current subject at authoring time) | `generated/hello-world.mjs` | `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef` |

Precedence:

- The original task owns what the Product means and what counts as acceptance.
- The oracle is the independent evaluation of that unchanged original.
- The witness contract governs how this Run realizes and evidences the original.
  It governs execution evidence, stage ordering, write territory and revision
  lineage. It does not remove or weaken any original obligation (§8 C-1..C-4).
- If this document disagrees with any of those three sources, this document is
  wrong. Such a disagreement is a specification re-entry. It is not a licence to
  change the source, the oracle or the tests.

## 1. Intent

Deliver the smallest complete, verifiable Node command-line program. When a user
runs it with no arguments, it prints the greeting `Hello, world!` followed by
exactly one newline and exits successfully. The Run must show this outcome through
an honest software-build traversal: specification, implementation design, source,
test design, component and UAT verification, an execution plan and a truthful
execution result. Each stage carries its own meaning, and the delivered CLI and
tests are executed for real.

## 2. Product boundary

**Product.** One executable ECMAScript-module script at `generated/hello-world.mjs`.
It is run directly by the Node runtime with `node generated/hello-world.mjs` from
the project root.

**Public interface (the complete boundary):**

| Aspect | Contract |
|---|---|
| Invocation | `node generated/hello-world.mjs`, with no arguments (oracle case `"arguments": []`) and the project root as working directory. |
| stdout | Exactly the 14 bytes `48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 0a`, which is `"Hello, world!\n"` in UTF-8 (sha256 `d9014c4624844aa5bac314773d6b689ad467fa4e1d1a50a1b8a99d5a95f72ff5`). There is one newline, no leading or trailing whitespace, no carriage return and no second line. |
| Exit status | Integer `0`, with normal termination and no signal. |
| Runtime dependencies | The Node runtime and its built-in modules only. No `package.json`, no `node_modules`, no install step, no network access. |

**In scope:** the CLI source surface; the component and UAT verification of its
stdout and exit status; the four authored assets
(`specification/project-conformance.md`, `design/implementation-design.md`,
`design/test-design.md`, `test-execution-plan.json`); and the execution-result
meaning (§3, §4.6).

**Out of scope, and not required:**

- Command-line options, arguments, help text or localisation.
- Configuration, input from stdin, files or environment variables.
- Packaging, publishing, bundling, TypeScript or build tooling.
- Any third-party library.
- Behavior under alternative runtimes such as Deno or Bun.

Adding any of these would widen the Product and is not authorized (§8 U-3).

**Protected, never written by application work:**

- `source/original-basic-cli.txt`
- `source/basic-cli.oracle.json`
- `source/witness-contract.md`
- `test/component/hello-cli.test.mjs`
- `test/uat/hello-cli.uat.test.mjs`
- Installed library and runtime assets.

**Application write territory:** `generated/hello-world.mjs` plus the four authored
asset paths above. Command evidence has its own separately declared territory.

## 3. Minimal software-build traversal

This section declares the stage meanings and dependencies required by the original
`stagePlan`. It is a dependency relation, not a mandatory schedule (§8 C-3).

| # | Stage meaning (original) | Surface | Meaning that must hold | Depends on | Realization in this Run |
|---|---|---|---|---|---|
| 1 | `conformance_project` | `specification/project-conformance.md` | Minimal CLI Hello World traversal. The source surface is `generated/hello-world.mjs`. The execution proof runs the CLI and observes stdout exactly `"Hello, world!\n"`. | original, oracle, witness contract | Authored fresh (this asset). |
| 2 | `implementation_design` | `design/implementation-design.md` | A minimal Node CLI at `generated/hello-world.mjs` that prints `Hello, world!` plus one newline. Names the component and UAT test surfaces that run the CLI and assert stdout. Uses stage 1 as its authority. | stage 1 | Must be authored fresh (absent at authoring time). |
| 3 | `source` | `generated/hello-world.mjs` | Runs under `node` without package installation and writes exactly `"Hello, world!\n"` to stdout. | stages 1–2 (meaning); baseline evidence (correction) | Supplied unverified. The measured baseline failed and one bounded correction was made (§7). |
| 4 | `test_design` | `design/test-design.md` | Component and UAT validation of the stdout contract. Both tests spawn `node generated/hello-world.mjs` and assert status `0` and stdout exactly `"Hello, world!\n"`. | stages 1–2 | Must be authored fresh (absent at authoring time). |
| 5 | `component_test_source` | `test/component/hello-cli.test.mjs` | Uses `node:test`, `node:assert/strict` and `node:child_process` `spawnSync`. Runs `process.execPath` with `["generated/hello-world.mjs"]` from the project root. Asserts status 0 and exact stdout. | stage 4 | Supplied verifier, reused. Its adequacy is assessed, and it is not counted as authored work. |
| 6 | `uat_test_source` | `test/uat/hello-cli.uat.test.mjs` | Same imports and invocation. Asserts that the user-visible CLI output is exactly `"Hello, world!\n"`. | stage 4 | Supplied verifier, reused. Its adequacy is assessed, and it is not counted as authored work. |
| 7 | `test_execution_plan` | `test-execution-plan.json` | Declares the command, args, expected pass floor, zero-failure match and asserted return value (§4.5). | stages 3, 5, 6 | Plan must be authored fresh. The handwritten `test-execution-result.json` is replaced by admitted C2 evidence (§8 C-1, C-2). |
| 8 | `test_execution_result` | none (produces no files) | Accept only if the planned command exited 0, the observed pass count is at least `expectedTestPassCount`, and `planSatisfied` is true (§4.6). | stage 7 plus admitted execution evidence | Carried by admitted C2 command observations and a distinct independent assessment. |

## 4. Requirements

Every requirement is traced to its source. "MUST" statements are obligations.
Anything this document interprets is marked as such and listed in §8.

### 4.1 Source surface (stage `source`; oracle `cases`)

- **R-SRC-1**: The CLI source surface MUST be the file `generated/hello-world.mjs`.
  *(conformance_project: "The source surface must be generated/hello-world.mjs"; implementation_design; source.)*
- **R-SRC-2**: `node generated/hello-world.mjs` MUST run with no package
  installation. The script MUST NOT import anything except Node built-ins, and it
  MUST NOT require a `package.json`, `node_modules` or network access.
  *(source: "must execute under node without package installation"; witness contract: "no package/network dependency".)*
- **R-SRC-3**: When invoked with no arguments from the project root, the CLI MUST
  write exactly `"Hello, world!\n"` to stdout: the 14 bytes in §2, with no
  additional output on stdout.
  *(conformance_project, implementation_design, source; oracle `cases[0].stdout`.)*
- **R-SRC-4**: The CLI MUST exit with status `0`.
  *(test_design and component_test_source: "assert status 0"; oracle `cases[0].exitStatus: 0`; witness contract: "exits zero".)*
- **R-SRC-5**: The script MUST remain minimal. It MUST implement only the greeting.
  It MUST NOT parse arguments, branch on the environment, or contain logic that
  could produce a different output under the tested invocation.
  *(implementation_design: "Define a minimal Node CLI script"; interpretation of "minimal" in §8 U-5.)*

### 4.2 Verification surfaces (stages `component_test_source`, `uat_test_source`)

- **R-VER-1**: `test/component/hello-cli.test.mjs` MUST do all of the following:
  - use `node:test`, `node:assert/strict` and `spawnSync` from `node:child_process`;
  - spawn `process.execPath` with exactly `["generated/hello-world.mjs"]`, resolved
    from the project root;
  - assert `status === 0` and `stdout === "Hello, world!\n"` with strict equality.
- **R-VER-2**: `test/uat/hello-cli.uat.test.mjs` MUST use the same imports and
  invocation. It MUST assert, from the user's point of view, that the CLI output is
  exactly `"Hello, world!\n"`. It MUST also assert status `0`, because test_design
  requires this of both tests.
- **R-VER-3**: Both tests MUST execute the real current CLI file through a real
  child process. A stub, mock, inline string, fixture or cached output MUST NOT
  stand in for the CLI.
  *(witness contract: "Both supplied tests must actually execute the current CLI"; oracle `assessment`.)*
- **R-VER-4**: Component and UAT coverage are a required pair. Each file MUST
  contribute at least one executed, passing test. A single aggregate success, or two
  passes from one file, does not satisfy the pair.
  *(oracle `requiredTestFiles`, `minimumTestPasses: 2`; witness contract: "Scalar UAT success cannot replace the required pairing and coverage relation".)*
- **R-VER-5**: Application work MUST NOT change the supplied test sources. They
  stay protected at the digests in §0.

### 4.3 Implementation design asset (stage `implementation_design`)

- **R-DES-1**: `design/implementation-design.md` MUST:
  - cite this conformance asset as its authority;
  - define a minimal Node ESM CLI at `generated/hello-world.mjs` that prints
    exactly `Hello, world!` followed by one newline (for example, one
    `console.log("Hello, world!")` call, or an equivalent single stdout write
    that ends in `"\n"`);
  - rely on default successful termination (exit 0) with no dependencies;
  - name `test/component/hello-cli.test.mjs` and `test/uat/hello-cli.uat.test.mjs`
    as the verification surfaces that run the CLI and assert stdout.
- **R-DES-2**: The design MUST be realizable by the current source surface without
  widening the Product (§2). It MUST NOT introduce any Product meaning that §1–§4
  do not contain.

### 4.4 Test design asset (stage `test_design`)

- **R-TD-1**: `design/test-design.md` MUST specify both component and UAT
  validation of the stdout contract. Both tests MUST spawn
  `node generated/hello-world.mjs` and assert status `0` and stdout exactly
  `"Hello, world!\n"`.
- **R-TD-2**: The test design MUST state:
  - the oracle for each test: the exact bytes, and strict equality rather than
    substring or trimmed comparison;
  - the working-directory precondition (the project root, §8 I-3);
  - the component-versus-user-outcome purpose of each test;
  - the pairing and floor rule in R-VER-4;
  - the fact that these tests can falsify a wrong greeting, as shown by the
    admitted baseline failure (§7).

### 4.5 Execution plan asset (stage `test_execution_plan`)

- **R-PLAN-1**: `test-execution-plan.json` MUST be valid JSON with
  `"command": "node"`.
- **R-PLAN-2**: `"args"` MUST equal
  `["--test", "test/component/hello-cli.test.mjs", "test/uat/hello-cli.uat.test.mjs"]`
  exactly and in this order.
- **R-PLAN-3**: `"expectedTestPassCount"` MUST be an integer of at least `2`.
- **R-PLAN-4**: `"expectedStdoutMatch"` MUST include the stable zero-failure
  fragment `fail 0`. It MUST NOT pin an exact pass-count fragment such as `pass 2`.
- **R-PLAN-5**: `"assertedReturnValue"` MUST be `"Hello, world!"` (§8 I-1).
- **R-PLAN-6**: The plan MUST agree with both fixed prospective commands:
  `node generated/hello-world.mjs` and the command in R-PLAN-1/2. It SHOULD also
  declare the direct CLI invocation, with expected stdout `"Hello, world!\n"` and
  exit status `0`, as a supplementary entry. That entry MUST NOT alter the
  source-mandated top-level fields (§8 I-4).
- **R-PLAN-7**: The plan is a declaration of expectations. It is not the runtime
  source of commands, and it MUST NOT contain or claim observed results.

### 4.6 Execution-result meaning (stages `test_execution_plan` result, `test_execution_result`)

- **R-RES-1**: The execution result MUST be carried by actually admitted C2
  command observations. The observation MUST record, truthfully:
  - the command and args;
  - the environment;
  - the working directory;
  - the integer exit status;
  - stdout and stderr;
  - the resulting test observations.

  A handwritten or native-author success report MUST NOT substitute for this
  observation.
  *(original stage 7 field list; witness contract §"Evidence, correction and final outcome"; oracle `assessment`.)*
- **R-RES-2**: The result is acceptable only if all of the following hold for the
  **current** subject:
  - (a) the planned `node --test …` command exited `0`;
  - (b) the observed pass count, taken from the reporter summary `pass N`, is at
    least `expectedTestPassCount`;
  - (c) `planSatisfied` is true. This document interprets it (§8 I-2) as the
    conjunction of (a), (b), every `expectedStdoutMatch` fragment appearing in
    stdout, an observed fail count of `0`, and the direct CLI invocation's stdout
    equalling `assertedReturnValue + "\n"` with exit `0`.
- **R-RES-3**: Current-subject binding. Evidence used for acceptance MUST bind the
  CLI digest and both test digests that were current when it was admitted. It
  supports the claim only while those digests remain current.

### 4.7 Revision lineage and protection (witness contract)

- **R-REV-1**: The supplied CLI's actual behavior MUST be measured before it is
  changed. That baseline stays admitted historical evidence about its exact subject
  bytes.
- **R-REV-2**: Any CLI change MUST be a bounded correction justified by admitted
  failure evidence. The old failure MUST NOT be retargeted to the new bytes, and
  it MUST NOT be discarded because the bytes changed.
- **R-REV-3**: Only a claim that depends on the old bytes being current becomes
  stale. Work that does not depend on them, including this asset, survives a CLI
  byte change.
- **R-SCOPE-1**: The protected files in §2 MUST keep their §0 digests. Other
  requirements forbid:
  - package or network dependencies;
  - caller-owned loops;
  - out-of-band application edits;
  - answer repair;
  - oracle changes.

  The first unexpected failure MUST be preserved and returned. Scope and criteria
  do not shrink after results are known.

## 5. Acceptance criteria (testable)

All commands run from the project root (the worksite root) with the `node` found
on `PATH`. Each criterion names the observation that decides it.

| ID | Predicate | Decided by | Traces |
|---|---|---|---|
| AC-1 | `node generated/hello-world.mjs` exits `0`, not by signal. Its stdout is byte-equal to `"Hello, world!\n"` (byteLength 14, sha256 `d9014c46…72ff5`). | Admitted C2 observation of command 1 bound to the current CLI digest | R-SRC-1..4 |
| AC-2 | `node --test test/component/hello-cli.test.mjs test/uat/hello-cli.uat.test.mjs` exits `0`. Stdout contains `fail 0` and a `pass N` summary with N ≥ 2, and reports no cancelled tests. | Admitted C2 observation of command 2 bound to the current CLI and test digests | R-VER-3, R-PLAN-3/4, R-RES-2 |
| AC-3 | The command-2 stdout shows a passing test from each file: the component test ("CLI process satisfies its output contract") and the UAT test ("a user receives the exact promised greeting"). | Same observation (reporter lines) | R-VER-4 |
| AC-4 | The CLI source imports nothing outside Node built-ins, needs no manifest or install step, and contains only the greeting write. | Static inspection of the current `generated/hello-world.mjs` | R-SRC-2, R-SRC-5 |
| AC-5 | Each test file imports `node:test`, `node:assert/strict` and `spawnSync`. Each spawns `process.execPath` with `["generated/hello-world.mjs"]` and strictly asserts status `0` and stdout `"Hello, world!\n"`. | Static inspection of the supplied test sources at the §0 digests | R-VER-1, R-VER-2, R-VER-5 |
| AC-6 | `design/implementation-design.md` satisfies R-DES-1..2, and `design/test-design.md` satisfies R-TD-1..2. | Independent semantic assessment of current asset content | R-DES-*, R-TD-* |
| AC-7 | `test-execution-plan.json` parses as JSON and satisfies R-PLAN-1..7. | Parse plus field check plus assessment of the correspondence with both fixed commands | R-PLAN-* |
| AC-8 | The protected files still hash to their §0 digests, and application writes are limited to the territory in §2. | Digest comparison over admitted file observations | R-VER-5, R-SCOPE-1 |
| AC-9 | Lineage holds. A baseline observation exists on the pre-change CLI bytes, with command 2 nonzero (the adverse disposition). A bounded correction to `generated/hello-world.mjs` follows it. A later observation on the corrected digest satisfies AC-1..3. The baseline remains retained and attributed to the old digest. | Admitted observation chain (§7) | R-REV-1..3 |
| AC-10 | An independent semantic assessment covers AC-1..9, including verifier adequacy and execution-plan correspondence. Its actor or call is distinct from the author and the measurement producer, and it consumes the current admitted evidence. | Assessment observation identity and inputs | R-RES-1, witness contract |

**Completion rule.** The original outcome is complete only if AC-1..AC-10 all hold
together, against the same current subject digests. A missing, stale or
unassessed criterion leaves the parent outcome open. Green tests count as evidence
only for the relations they actually exercise: the exit status and exact stdout of
one argument-free invocation.

## 6. Non-requirements (explicitly unconstrained by source)

- **stderr content.** The source does not constrain it. Observed stderr has been
  empty, but a non-empty stderr is not by itself a failure (§8 U-2).
- **Test names, the number of tests beyond the floor, and reporter format.** These
  are not fixed. Additional depth tests are allowed, which is why R-PLAN-4 forbids
  pinning the pass count.
- **Node version.** The source does not pin one (§8 U-1).

## 7. Evidence known at authoring time (informative; not acceptance)

These admitted observations predate this asset. None of the requirements above
depends on them. They are listed so that the causal lineage stays explicit.

1. **Baseline, on the supplied bytes.** Observation result
   `result://abiogenesis/7d8d7f5fb42032f75ae9dc9e25aa3ca1583a3d2977bb54dece7f63130970ab02`
   was made on the CLI at sha256
   `647697a5fb5d141a2b1163363170a7a845b61a36096ff52f7a369f1736cd4993`, whose
   content was `console.log("Hello world!");\n`.
   - Command 1 exited `0`, but stdout was `"Hello world!\n"` (13 bytes, no comma).
     This violates R-SRC-3.
   - Command 2 exited `1`, with `tests 2, pass 0, fail 2`. Both strict-equality
     assertions failed on the missing comma.

   This is the material failure. It also shows that both supplied verifiers can
   falsify a wrong greeting. It remains historical evidence about `647697a5…`
   only.
2. **Bounded correction.** Native construction result
   `result://abiogenesis/1f11cf4c619b59bf0b318df4eb5484ed751e9fae66e612c16ce8f9c2b252ec83`
   changed only `generated/hello-world.mjs`, from `console.log("Hello world!");`
   to `console.log("Hello, world!");`. The new digest is sha256
   `fe8f40803a256b5b65c97f5f4cae862fd55b37cb81f2a803c56c3f654c22e9ef`.
3. **Post-correction, on the current bytes.** Observation result
   `result://abiogenesis/56805fe3c08b6090c1bd5f5732dae0052e14fdabf28488db3725f1ab2277704b`
   binds CLI `fe8f4080…` and the unchanged test, source, oracle and contract
   digests, with `relativeCwd "."`.
   - Command 1 exited `0` with stdout `"Hello, world!\n"` (14 bytes, sha256
     `d9014c46…`) and empty stderr.
   - Command 2 exited `0` with `tests 2, pass 2, fail 0` and both named tests
     passing.

   This bears on AC-1..3 and AC-9 for the current subject. The judgment belongs to
   the independent assessment (AC-10), not to this asset.

At authoring time, `design/implementation-design.md`, `design/test-design.md` and
`test-execution-plan.json` do not exist. AC-6, AC-7 and AC-10 are therefore
unsatisfied.

## 8. Conflicts, interpretations and unknowns (preserved)

**Conflicts between sources.** Each is resolved by the selected authority, with
the original meaning kept:

- **C-1**: The original stage 7 tells the worker to write `test-execution-result.json`.
  The witness contract says handwritten execution-receipt mechanics are realized
  by the declared graph and admitted C2 evidence, and a fabricated success file is
  insufficient. The oracle's `requiredArtifacts` omits that file.
  *Resolution:* no worker-authored result file is required or trusted. Every field
  the original lists (command, args, integer status, stdout, stderr, cwd, env,
  expected counts and matches, asserted value) MUST still be recoverable from the
  admitted observation plus the plan (R-RES-1). The meaning is kept and only the
  carrier changes.
- **C-2**: The original's "EXECUTION-DEFAULT LAW" says the worker runs the tests
  itself and "the framework executes nothing". The witness contract says
  execution proof is admitted C2 evidence and a native author's own runs are
  insufficient.
  *Resolution:* the C2 observation is the execution proof. A native author's local
  runs are at most self-checks.
- **C-3**: The original `stagePlan` lists conformance → design → source → test
  design → tests → plan → result. In this Run, the baseline measurement and CLI
  correction came before this conformance asset. The witness contract allows this:
  there is no forced schedule, earlier specification is allowed, and the correction
  must be justified by admitted failure.
  *Resolution:* the correction's authority is the original source, the oracle and
  the admitted baseline failure, not this document. This document is now the
  authority for the implementation design. If the design or this document ever
  required different CLI bytes, that would be a re-entry, not a silent retarget.
- **C-4**: The original has stages that author the component and UAT test sources.
  In this Run those files are supplied and protected.
  *Resolution:* reuse them after their adequacy is assessed (AC-5, AC-10). They are
  not counted as newly authored work.

**Interpretations.** These are F_P judgments of this specification, open to
assessment:

- **I-1**: `assertedReturnValue` `"Hello, world!"` names the greeting text without
  its line terminator. It is consistent with stdout `"Hello, world!\n"`, which is
  the greeting plus exactly one `\n`.
- **I-2**: The source uses `planSatisfied` without defining it. §4.6 R-RES-2(c)
  gives the interpretation used here.
- **I-3**: "From the project root": both tests pass the relative path
  `generated/hello-world.mjs` to `spawnSync` without a `cwd` option. They are
  therefore correct only when `node --test` runs with the project root as working
  directory. That precondition is part of the command contract.
- **I-4**: The witness contract's plural "declared commands" and "agree with these
  commands" are read as R-PLAN-6. The source-mandated top-level `command`/`args`
  describe the test command, and the direct CLI invocation is declared alongside it
  without replacing it.
- **I-5**: The pass count and fail count are read from the text of the test
  reporter's summary. Admitted observations carry no structured test report
  (`reports: []`). `fail 0` appears in both the spec summary (`ℹ fail 0`) and the
  TAP summary (`# fail 0`), which is why it is the stable match fragment.

**Unknowns and residuals.** These are left open, not assumed:

- **U-1**: Neither the source nor the admitted evidence records a Node version.
  `node:test` and `--test` need a Node release that provides them. The executable
  is found through `PATH`.
- **U-2**: stderr is unconstrained (§6).
- **U-3**: Behavior with arguments, a different working directory or an
  alternative runtime is unspecified and out of the Product boundary.
- **U-4**: The two supplied tests are logically identical apart from their names.
  They meet the literal source instructions and the pair floor. Whether they give
  meaningfully distinct component and user-outcome coverage is left to the test
  design and the independent assessment.
- **U-5**: The original source says "minimal" without a measurable bound. R-SRC-5 reads it
  as a single-purpose script with no dependencies, arguments or branches.
