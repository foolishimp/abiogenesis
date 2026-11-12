# TD-67 trace: the module-export predicate

Analyst trace for the T-292 Executive. Commentary, not specification or design.

- **Register entry:** `.ai-workspace/TECHNICAL_DEBT_REGISTER.md:800-808` (row `:185`). Source finding: `.ai-workspace/work/TECH_DEBT_REGISTER_02/findings/implementation-public.md:363`.
- **Commit:** main head `164e570d8` (2026-11-13 00:43:55 +1100). Every file and line below is at that head.
  - I ran my experiments on a copy archived from main at `9258d7949`.
  - Between the two, main removed the Consensus module (code, tests, one fixture, `REQ-P-CONSENSUS.md`), updated the register and the ticket, and added a TD-80 review.
  - The register is cited here and did change: TD-67's entry moved down one line. I re-read its row `:185` and entry `:800-808` at head (run).
  - No traced code, design, fixture, lane or requirement path changed: `git diff 9258d7949 164e570d8` over those paths is empty (run).
- **Marks:** each statement ends with (run) when I executed it and saw the result, or (read) when I read the code or text.
- **Paths:** T = `build_tenants/abiogenesis/typescript`. Code paths are relative to `T/code/src` unless stated.

## Answer

1. Today the helper imports the declared module into its own process and awaits the export with no deadline, no budget term and no process boundary, and it records a throw as `null`, the same bytes as a module that returns `null` (read: `implementation/worksite_command_helper.ts:1220-1251`; run: cases c and d).
2. A module that hangs with a live timer or loops holds the helper until the actor's inactivity limit (60 s by default) kills it, a module that exits or prints breaks the helper's acknowledgment, module code sees the helper's whole environment and its working directory (the canonical root, not the sandbox), nothing recorded names the module, and the UAT oracle passes a throwing export whose declaration expects `null` (run: cases e2, k2, f, g, h, h2, j, q1, dn).
3. I recommend option (a), the register's own condition for retiring the entry: run the import and call in a child process launched and bounded as a declared command is, with its deadline in the budget and a typed outcome for a throw, timeout or missing value; it costs about 27 ms per module predicate on this host, changes no recorded observation (all are returned values), and touches no budget rule bytes that any recorded log or replay path rebuilds (run; read).

## Terms

- **C2:** the worksite command execution step of a Run. It runs the task's declared commands and computes one observation per declared predicate. **C1** is the construction step that writes worksite files; my probes used it to write the module.
- **Predicate:** a declared check over the execution, such as an exit code. `module_export_return_exact` imports a module, calls one export and records its return value. A reader later compares that value with the declared `equals`.
- **Observation:** the helper's record of what one predicate saw: `observedValue` plus evidence references.
- **Helper:** the Node process `worksite_command_helper.js`.
  - The native agent starts it with one Bash call.
  - It runs the declared commands in a snapshot copy of the worksite, called the sandbox.
  - It publishes one result file (the artifact, `result.json`) and prints one JSON line (the acknowledgment).
- **Parent:** the ABG-side owner in `implementation/worksite_command_execution.ts`. It prepares the helper's task and launch manifest. In `complete()` it checks the agent's reply and the artifact, then admits or refuses the result.
- **Actor:** the native agent process that ABG starts and supervises. In live Runs it is the Claude Code CLI; in my runs it is a relay script.
- **Owned process lifetime:** the mechanism that runs a child process for the helper (`shared/owned_process_lifetime.ts:144`).
  - The child gets its own process group.
  - On a deadline the group gets TERM (the stop request, SIGTERM), then a grace period, then KILL (the forced stop, SIGKILL).
  - Termination counts as confirmed only when the group is gone.
- **Budget:** the sum the product computes from a task's declared timeouts (`product/worksite_command_execution.ts:162-181`). The actor's limits must exceed it.
- **Typed outcome:** a record that says what happened (returned, threw, timed out, exited without a value) instead of a bare value.
- **Qualification reader:** `validator/qualification.ts:182-218`, which turns observations into passed, failed or blocked.
- **Sandbox UAT oracle:** the independent checker of the sandbox UAT scenarios, `T/test_env/fixtures/sandbox-uat/independent-oracle.mjs`.
- **I-JSON:** JSON restricted to values every parser reads alike. For example, integers beyond 2^53 are excluded.
- **Terms in quotes:**
  - `L` is the Run's event log.
  - `O1` is the owner's first observation of a protected file.
  - `A.canonicalRoot` is the canonical workspace root.
  - F_D is the deterministic judgment that admits a result.
- **Full path:** my probes through the installed Public `run.invoke` call with the lane's controlled transport (`T/test_env/tests/t287-worksite-command-execution.test.mjs:935-976`). A relay script stands in for Claude Code. It runs the helper's command with `spawnSync` and no timeout, then returns the helper's stdout as the agent's answer.
- **Owner-local path:** three steps:
  - `realizeWorksiteCommandExecution` prepares the task;
  - I run the installed helper in its own process group under my 20 s cap;
  - `complete()` checks the lane's hand-built exchange (`:545-604`), carrying the helper's stdout.
- **Common setup for both paths:**
  - the packed, installed product, as the lane uses it;
  - a C1 construction that writes the probe module to `c2-source/service.mjs`;
  - one succeeding command, `node -e "process.stdout.write('ok\n')"`, with predicates `process_exit` 0, the module predicate, and `stdout_exact` `"ok\n"`;
  - `ABG_TS_FP_TIMEOUT_MS=25000` and `ABG_TS_FP_ABSOLUTE_TIMEOUT_MS=40000`, against defaults of 60,000 and 3,600,000 (`abg/actor_process.ts:706-707`);
  - a scrubbed environment carrying one sentinel variable, `ABG_TD67_SENTINEL`.

## Q1. What the predicate does today

### Code path

| Step | Where | What happens | Mark |
|---|---|---|---|
| Declaration rule | `product/worksite_command_execution.ts:1077-1079` | Keys exactly `equals`, `export`, `path`. `path` must be a safe relative path and `export` non-empty. `equals` may be any JSON value, `null` included. | read |
| Protection rule | `product/worksite_command_execution.ts:1445-1450` | The module path must be one of the task's protected subjects: files the owner re-observes before it makes the snapshot, and which must stay byte-exact in the snapshot (design `:480-486`, `:614-615`). | read |
| Author schema | `product/worksite_command_execution.ts:1376`, `:1397` | The C2 configuration schema offers the kind to semantic-job design authors ("module paths must be protected targets"). | read |
| Budget | `product/worksite_command_execution.ts:162-181` | Only commands and `http_response_exact` add terms. A module predicate adds 0. | read; run: one 5 s command plus one module predicate gives 12,250 ms; two commands plus two module predicates give 19,500 ms |
| Launch | `product/worksite_command_execution.ts:749-801`, prompt `:2272-2303` | The agent runs `node <install>/…/worksite_command_helper.js --task <attemptRoot>/launch.json` in one Bash call. | read; run |
| Order | `worksite_command_helper.ts:1440-1464` | All commands run first, then the predicates in declaration order. | read |
| Module path | `worksite_command_helper.ts:1226-1230`, `:155-169` | `confinedExistingPath(sandboxRoot, path, "file")` sits outside the `try`. A missing module (an `lstat` error) or a symlinked one (a `TypeError`, `:168`) is not a `WorksiteHelperFailure`, so it escapes `main` (`:1466`): no artifact, no acknowledgment, exit 1. | read |
| Import and call | `worksite_command_helper.ts:1232-1234` | `await import(<file URL>?abi=<taskDigest>&p=<ordinal>)`. If the export is a function, it is called with no arguments and awaited. | read; run |
| Record | `worksite_command_helper.ts:1235-1240` | `observedValue = result === undefined ? null : JSON.parse(JSON.stringify(result))`. Any throw sets `null`. | read; run (c, d, l) |
| Evidence | `worksite_command_helper.ts:1241-1251` | The pre-run observation of the protected source, which binds the module's bytes. | read; run |
| Other errors | `worksite_command_helper.ts:1466` | Only `WorksiteHelperFailure` is caught. Anything else escapes `main`: no artifact, no acknowledgment, exit 1. | read; run (l2) |

The recorded observation has eight keys (`product/worksite_command_execution.ts:1769-1780`). Case a recorded these bytes (run):

```json
{"evidence":[{"digest":"sha256:c85f…632d","kind":"worksite_observation_coordinate","ref":"worksite-observation://abiogenesis/c85f…632d","schemaVersion":"5.0.0"}],"evidenceRefs":["worksite-observation://abiogenesis/c85f…632d"],"kind":"worksite_predicate_observation","observedValue":42,"ordinal":1,"predicateId":"predicate://td67/module-0","predicateKind":"module_export_return_exact","schemaVersion":"5.0.0"}
```

Case c (a throw at import) recorded the same record with `"observedValue":null` (run). The parent admits the observation inline in `c_call_result_admitted` (run, full path).

The register's evidence (`TECHNICAL_DEBT_REGISTER.md:804`) cites `worksite_command_helper.ts:1392-1412`. At head those lines are `runHelperProgram`, `acknowledge` and the start of `main`; the import is at `:1220-1251` (read).

### What the module runs with

| Property | Module code at predicate time | A declared command | Mark |
|---|---|---|---|
| Process | The helper process itself. In case q1 the module's pid equals the helper's: pid 76741 in its own group (owner-local); pid 76680 in the relay's group (full path). | Its own child in its own process group (`worksite_command_helper.ts:715-720`). | run; read |
| Working directory | The helper's working directory: the actor's, which is the canonical workspace root, not the sandbox. | The declared `relativeCwd` inside the sandbox. | run (q1); read `abg/actor_process.ts:932` |
| Environment | The helper's whole environment: 20 variables owner-local and 21 on the full path, sentinel visible. | Only its declared rows: HOME, LANG, PATH, TMPDIR in my runs. It reported 5 variables and no sentinel. The fifth is `__CF_USER_TEXT_ENCODING`, which macOS adds to a Node process given only those four rows (run separately). | run (j) |
| Environment in live Runs | The helper inherits the agent's environment: the ABG process environment (`abg/actor_process.ts:892`) minus four `CLAUDE_CODE_*` prefixes (`abg/transport_contracts.ts:453-458`, `:553-570`). The provider support names `ANTHROPIC_API_KEY` and `CLAUDE_CODE_OAUTH_TOKEN` as its credential keys (`T/test_env/support/exact-candidate-qualification.mjs:72`); neither matches a removed prefix. | Declared rows only. | read; no credential read |
| File system | The same user's access. The module found `launch.json` by walking up from its own directory and read it (h), and rewrote it (i4). It rewrote and deleted files outside every root, and added a file in the canonical root (i). | The same reach by absolute path. | run |
| Network | Not restricted. | Not restricted. | read |
| Open descriptors | fd 0-2, where fd 1 is the acknowledgment channel. Also Node's own kqueues and pipes, `/dev/null`, the root directory, and three more Unix sockets (fd 17, 19, 21) whose peers I did not identify. No regular file is open. | Separate. | run (q1) |
| Standard output | The helper's own stdout, which carries the acknowledgment. | Captured into the command result. | run (h, h2) |
| Memory | The helper's task, command results and effect runtime, with shared globals. | Separate process. | read |

## Q2. What bounds it

| Bound | Where | Covers | Value | Ends a module predicate? | Mark |
|---|---|---|---|---|---|
| Command deadline | `worksite_command_helper.ts:711`, `:754`, `:771` | each declared command | declared `timeoutMs`, then exit 124 | No | read |
| Command group cleanup | `shared/owned_process_lifetime.ts:144-158`; `worksite_command_helper.ts:720` | each command's process group | TERM, `terminationGraceMs`, KILL; drain `min(grace, 250)`; probe `min(grace, 10)` | No | read |
| HTTP launch and request deadlines | `worksite_command_helper.ts:1065-1082` (in `runHttpProbe`, `:1027-1178`) | `http_response_exact` | declared | No | read |
| Task budget | `product/worksite_command_execution.ts:153-181` | commands, HTTP probes, 5,000 ms owner allowance | 7,250 ms per 5 s command with 1 s grace | No term for module predicates | read; run |
| Budget gate | `implementation/worksite_command_execution.ts:500-508` | C2 preparation | inactivity > budget, absolute > budget, absolute > inactivity | A check, not a timer | read |
| Helper signal handlers | `worksite_command_helper.ts:554-559` | the helper | on SIGTERM or SIGINT: SIGKILL to the active command's group, then exit 143 or 130 | Only while the event loop runs | read; run (e2, k2 yes; f no) |
| Node's unsettled-await exit | Node runtime, through the helper's `await main()` (`:1525`) | the helper | exit 13 when no handle keeps the loop alive | Yes, for e and k | run |
| Actor inactivity limit | `abg/actor_process.ts:706-707`; `abg/worker_transport.ts:462-560` (process group `:505`, lifetime `:512`) | the actor and its process group | 60,000 ms default | Yes, when the helper is in the actor's group | run (25 s in my runs) |
| Actor absolute limit | same | same | 3,600,000 ms default | Backstop | read |
| Actor termination grace | `abg/actor_process.ts:79` | actor group | 1,000 ms from TERM to KILL | Yes | read; run (f) |
| Claude Code Bash tool timeout | recorded at `T/test_env/support/exact-candidate-qualification.mjs:60-62`; the C2 prompt forbids a timeout field (`product/worksite_command_execution.ts:2283`) | the helper's Bash call in live Runs | 120,000 ms default, 600,000 ms maximum | Not checked | read |

Nothing in the helper bounds the predicate itself, and the budget has no term for it (read). The register's statement holds.

How each hang ends, and what the parent records (run):

| Hang | What ends it | Parent records |
|---|---|---|
| Never finishes importing or never settles, with no live handle (e, k) | Node ends the helper with exit 13 once nothing else is pending, about 1 s into its run. Its warning: "Detected unsettled top-level await at …worksite_command_helper.js:1304 `await main();`", which is source `:1525`. | Owner-local: `helper_artifact_absent`. Full path: the relay fails on the exit. The actor records a `transport_failure` with process status 1, the C2 result is `transport_identity_mismatch`, and the Run stops. |
| Same, with a live interval timer (e2, k2) | Nothing in the helper. In the full path the actor's inactivity limit (25 s here) sends TERM to the actor's group, which includes the helper. The actor then requested no KILL, so its group was empty after the grace. That means the helper left on TERM, which I infer from this and the owner-local run; the relay's own record of the helper is absent. In the owner-local path my TERM at 20 s ran the helper's handler, and it exited 143. | Full path, in order: `actor_process_timeout_observed {timeoutClass: "inactivity"}`; one `actor_process_signal_requested` (SIGTERM); `actor_result_artifact_observed` (failure, `processSignal: SIGTERM`); `actor_invocation_failed`; `c_call_result_admitted` with `transport_identity_mismatch`; `run_stopped`. Owner-local: `helper_artifact_absent`. |
| Synchronous loop in the export (f) | Nothing in the helper. TERM is ignored, because the handler cannot run while the loop holds the thread. Only KILL ends it: the actor lifetime's KILL to its group after the 1 s grace (full path), or my KILL at 23 s (owner-local). | Full path: as e2, plus a second `actor_process_signal_requested` with SIGKILL. The relay itself died of the TERM, so `processSignal` still reads SIGTERM. Owner-local: `helper_artifact_absent`. |

A synchronous loop at the module's top level would behave as f. I did not run it (read).

No typed field names the module or the predicate in any of these records (run). On the full path the only trace of the cause is Node's warning text, which has three limits:

- it sits in the archived actor stderr log;
- the stderr event binds that log only by digest;
- it is there only because the lane's relay rethrows the helper's stderr (run, case e).

## Q3. Probe results

All 21 cases ran on the owner-local path. 18 of them also ran on the full path; i2, i3 and i4 ran owner-local only (run).

- Times are wall-clock.
- A full-path time covers the whole Public call, of which the helper itself took 1.0 to 2.0 s.
- Each case's module source, records and attempt copies are in `/private/tmp/abg-td67-work/probes/<case>/`.

| Case | Module does | Helper (owner-local) | Parent: owner-local `complete()` | Full path: time and C2 result | Recorded result true? |
|---|---|---|---|---|---|
| a | returns 42 (expected) | exit 0, 1.4 s, artifact `success`, value 42 | success | 7.7 s, success, value 42 | Yes |
| b | returns 41 | exit 0, 1.5 s, value 41 | success; the reader rule gives failed | 8.4 s, success, value 41 | Yes |
| c | throws at import | exit 0, 1.5 s, artifact `success`, value `null` | success | 7.2 s, success, value `null` | No: records `null`, the module threw. The reader gives `blocked_incomplete`; the oracle gives unmet. |
| d | throws in the export | exit 0, 1.3 s, value `null` | success | 8.3 s, success, value `null` | No: as c |
| dn | throws; the declaration expects `null` | exit 0, 1.4 s, value `null` | success | 7.7 s, success, value `null` | No: the oracle gives **satisfied**, a false pass. The reader gives `blocked_incomplete`. |
| e | top-level await never settles, no live handle | exit 13 after 1.1 s, no output, no artifact | `helper_artifact_absent` | 7.5 s, `transport_identity_mismatch`, Run stopped | A failure is recorded; its cause is not |
| e2 | as e, with a live timer | hung; my TERM at 20 s, exit 143 | `helper_artifact_absent` | 32.0 s, actor inactivity timeout, `transport_identity_mismatch` | A failure and an actor timeout are recorded; the module is not named |
| k | export returns a never-settling promise, no live handle | exit 13 after 0.9 s | `helper_artifact_absent` | 7.0 s, `transport_identity_mismatch` | As e |
| k2 | as k, with a live timer | hung; my TERM at 20 s, exit 143 | `helper_artifact_absent` | 31.9 s, actor inactivity timeout, `transport_identity_mismatch` | As e2 |
| f | synchronous loop | hung; TERM at 20 s ignored, my KILL at 23 s | `helper_artifact_absent` | 33.1 s, actor inactivity timeout, `transport_identity_mismatch` | As e2 |
| g | `process.exit(0)` | exit 0 after 1.0 s, no output, no artifact | `helper_artifact_absent` | 7.3 s, `transport_identity_mismatch` | A failure is recorded; exit 0 hides the cause |
| h | prints an acknowledgment-shaped line: the real task and attempt identities, read from `launch.json`, and a forged artifact digest | exit 0, two acknowledgment lines (forged first), artifact `success` | both lines together: `result_contract_failure`; forged line alone: `result_contract_failure`; real line alone: success | 7.9 s, the relay could not parse two lines, `transport_identity_mismatch` | No false success. The outcome depends on which line the worker returns. |
| h2 | `console.log` at import | exit 0, two lines (debug line first) | both lines: `result_contract_failure`; last line: success | 8.1 s, `transport_identity_mismatch` | An ordinary debug line fails the call under the lane's relay |
| i | rewrites and deletes files outside every root, and adds a file in the canonical root, all in my scratch | exit 0, artifact `success`, value 42 | success | 8.2 s, success | The value is true. The rewrite, the deletion and the new canonical-root file are not recorded. |
| i2 | rewrites its own protected canonical source | exit 0, artifact `protected_mismatch` | `protected_observation_mismatch` | not run | Detected |
| i3 | adds a file under the product root | exit 0, artifact `product_mismatch` | `product_inventory_mismatch` | not run | Detected |
| i4 | rewrites `launch.json` in the attempt root | exit 0, artifact `success` | `helper_manifest_mismatch` | not run | Detected |
| j | two module predicates: one returns `process.env.ABG_TD67_SENTINEL`, the other the variable count | values `"helper-env-visible"` and 20; the declared command saw `"absent"` and 5 | success | 9.0 s, success, `"helper-env-visible"` and 21 | The values are true. They show the module reads the helper's environment. |
| q1 | returns pid, cwd, argv, environment size and descriptors | exit 0 | success | 8.0 s, success | True (the context in Q1) |
| l | returns `{missing: undefined, nan: NaN, map: new Map([[1, 2]]), negativeZero: -0, date: new Date(0)}` | value `{"date":"1970-01-01T00:00:00.000Z","map":{},"nan":null,"negativeZero":0}` | success | 7.9 s, success | Only up to JSON conversion: `missing` is dropped, NaN reads as `null`, the Map as `{}`, -0 as 0 and the Date as a string |
| l2 | returns 2^64 | exit 1, 1.4 s. The artifact constructor throws "command helper artifact requires exact task-bound commands and protected observations" (`product/worksite_command_execution.ts:1941`). | `helper_artifact_absent` | 7.7 s, `transport_identity_mismatch` | A failure is recorded; its cause is not |

Further notes on the probes:

- Full-path exit classification (run):
  - e, k, g, h, h2 and l2: the actor recorded `transport_failure` with process status 1, which is the relay's own exit;
  - e2, k2 and f: `timeoutClass: "inactivity"` with `processSignal: SIGTERM`;
  - the other cases: success with status 0.
- The reader and oracle columns apply the reader's rule (`validator/qualification.ts:207-211`) and the oracle's rule (`fixtures/sandbox-uat/independent-oracle.mjs:228-233`) to each recorded value (run). The rules themselves I read; I did not run the two shipped readers.
- The full path used the lane's relay, not Claude Code. For h, h2, e, g and l2, a native agent might return something different from what the relay returned.
- The parent's artifact join still refuses any acknowledgment that does not match the published artifact (run, h owner-local).

## Q4. Who uses the predicate

| User | Declares | Executed | Mark |
|---|---|---|---|
| Shipped Programs and graph functions | None declares it. The C2 graph function accepts it in its input. | — | read |
| Default library | It passes the request's `testing.outcomePredicates` to C2 (`product/default_library.ts:71`, `:156-161`). The C2 configuration schema offers the kind to semantic-job design authors (`product/worksite_command_execution.ts:1376`; `product/semantic_job.ts:693-698`). | — | read |
| Fixtures | Three sandbox UAT requests with five declarations, registered as scenarios at `scenarios.json:111`, `:200`, `:488`:<br>`js-tenant-test/request.json:229-237` and `js-sdlc-bootstrap/request.json:229-237` (`src/hello.mjs`, `helloWorld`, `"Hello, world!"`);<br>`parallel-js/request.json:241-267` (`helloPart`, `worldPart`, `helloWorld`). | — | read |
| Lanes | None declares it in a task. Three lanes use synthetic observations only:<br>`test_env/uat/harness.test.mjs:307`;<br>`test_env/tests/t287-qual056-material.test.mjs:120`, `:141`;<br>`test_env/tests/t288-instruction-assembly-owner.test.mjs:71`, `:74`. | — | read |
| Readers | `validator/qualification.ts:207-211`; `fixtures/sandbox-uat/independent-oracle.mjs:228-233`. | — | read |
| `test_env/downstream`, `test_env/evidence` | No hit. | — | run (text search) |
| Recorded Runs under the evidence root | Native semantic-job evidence: designs authored in native37 and native38 (`comments/codex/20260924_WORKSPACE_RESOURCE_LIFETIME/…`), prompts only in native40, and native42 and native44 (`comments/codex/20260926_CALCULUS_CROSSCUT/…`). The pc05 triage keeps a copy. 258 of the 290 data-form files with a hit are copies of the fixture requests inside sandboxes and frozen sources. | One execution: native42's C2 attempt (`comments/codex/20260926_CALCULUS_CROSSCUT/native42/preparation/invocation/archives/worksite-command-execution/3f90ed65…/8f3cecb2…/result.json`), observation `"Hello, world!"`. native44's suffix carries the same observation reference, so it reuses native42's result. native37, 38 and 40 have no C2 attempt. No null observation. | run (text search) |
| Recorded default-library UAT Runs (`T/test_env/test_runs/sandbox-uat`, outside the brief's search scope; checked once) | 13 Runs from 2026-10-06 to 2026-10-28: four js-tenant-test, five js-sdlc-bootstrap, four parallel-js. | All 13 executed it. Every observed value equals the declared one (`"Hello, world!"`, `"Hello"`, `"world"`). No null observation of any kind. | run (text search) |

The search errors came from three plain-text files named `.tgz`. The 17 zip archives under the evidence root, read with `unzip -p`, had no hit (run).

The default library's Runs do use the predicate, through two routes (run; read):

- the three UAT fixtures;
- semantic-job designs that choose it.

## Q5. What the design and the requirements say

There is no live design sentence on the predicate's deadline or budget, and no requirement names the predicate (read). The live sentences that apply:

| File:line | Sentence | Topic |
|---|---|---|
| `T/design/T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:7` | "accepted C2 helper-acknowledgment design with the bounded common-lifetime failure-handoff amendment below; its source/proof completion remains open." | status |
| same `:843` | "`module_export_return_exact` from one confined snapshot module import/call;" | the predicate |
| same `:838-839` | "The helper, not the Worker or downstream caller, produces one ordered typed observation for every declared predicate ID." | the predicate |
| same `:609-612` | "All declared command cwd, report reads, module imports, report walks, and HTTP probes resolve their canonical-root-relative coordinates inside that snapshot mirror through canonical, no-symlink confinement." | in-process execution |
| same `:488-490` | "Before that first re-observation, snapshot/result materialization, declared command, task-module import, report read, HTTP launch, or probe, the helper must close its own invocation preflight." | in-process execution |
| same `:474-476` | "The task records every inherited allowlisted environment value; no undeclared process environment crosses the helper boundary." | in-process execution |
| same `:636-639` | "This is a trusted-developer-desktop boundary, not hostile-code containment. … C2 does not claim to observe permissions, ownership, timestamps, xattrs, or effects outside the governed roots." | in-process execution |
| same `:629-634` | "The helper separately inventories the admitted Program-owner install … and requires zero path/content/node-kind/symlink-target delta. … It also re-observes every original `O1` under `A.canonicalRoot` after the Worker returns" | in-process execution |
| same `:795-808` | "The configured actor inactivity timeout must exceed the closed sum of command and probe budgets plus the separate 5,000ms owner allowance. Each declared command and HTTP launch contributes its timeout, two termination-grace terms (TERM waiting and KILL confirmation), and its own bounded drain … The owner allowance does not hide per-operation cleanup. … Helper and command processes use process-group termination on supported hosts." | budget and lifetime |
| same `:778-781` | "Each command result distinguishes an ordinary integer exit status from timeout, process signal, signal sequence, and confirmed termination. A non-zero command exit is a truthful admitted observation, not transport failure." | lifetime |
| same `:820-834` | "if a command or HTTP probe cannot confirm its owned physical scope absent within the declared bounds, the helper stops … Outer actor termination does not certify the inner owned group." | lifetime |
| same `:54-58` | "A command or HTTP failure after launch (`command_failed`, `command_cleanup_unresolved`, `http_probe_failed`, `http_cleanup_unresolved`) is one `WorksiteHelperFailure` whose subject carries `processFacts`, encoded once at its throw site. `main` catches only that class at its command/predicate loop" | throws |
| same `:45-47` | "Preserve the original first Error or thrown value through every later finalizer/diagnostic failure; absence of a throw is distinct from a thrown null/undefined." | throws, written for lifetime facts |
| same `:866-867` | "F_D judgment admits a well-formed execution observation without interpreting whether exit codes, bodies, exports, counts, or report sets satisfy odd_glc." | observation |
| `T/design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:226` | "`createOwnedProcessLifetime` and `OwnedProcessFacts` are the existing physical mechanism for worker, command and HTTP progression, probing, bounded confirmation and drain." | lifetime |
| same `:261` | "Absolute or inactivity deadline, or cancellation … Timeout or a signal request does not prove termination, rollback or nonperformance." | lifetime |
| same `:583` | "Helper-run processes, the command and HTTP processes of `implementation/worksite_command_helper.ts`, run inside the helper child … A thrown error alone never reaches `L`." | throws |
| `specification/requirements/abg/REQ-R-ABG3-HANDLERS.md:50-53` (005) | "Globals, undeclared environment, filesystem discovery, current working directory, hidden defaults, and adapter-local configuration are not authority." | environment and cwd |
| same `:55-58` (006) | "A handler throw, transport failure, timeout, or malformed interior result shall become a typed blocked or non-admitted outcome at the ABG boundary. It shall not kill the run, become success, or bypass the declared retry and continuation law." | throws |
| same `:64-66` (008) | "A handler shall honor the admitted timeout, attempt, capability, write-root, and effect envelope. Overrun or unsupported effect is typed non-success, never an unbounded wait or silent fallback." | budget |
| `specification/requirements/product/REQ-P-QUAL.md:62-64` (010) | "Selected test, command, native actor and caller supervision bounds shall be explicit and proportional to the declared ask, with each applicable layer identified." | budget |
| same `:67-70` (011) | "Enclosing supervision shall allow the selected lower owner to report its terminal result and preserve failure evidence. A deadline or process termination shall identify the layer and bound" | budget and lifetime |
| `specification/requirements/abg/REQ-R-ABG3-EVENTS.md:42` (014) | "Spawn failure, unavailable command, path drift, sandbox/runtime denial, timeout, signal termination, and nonzero exit shall be emitted as typed runtime facts. Such failures shall not … be represented only as absent result artifacts." | lifetime |
| `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md:21` (003) | "Timeout, crash, nonzero exit, or equivalent subprocess failure shall remain substrate/runtime failure truth unless ABG can deterministically validate and ingest a preserved authoritative result artifact for the same boundary." | lifetime |
| `specification/requirements/gtl/REQ-L-GTL3-C-ALGEBRA.md:202-206` | "The current product is a single-developer desktop tool. … This requirement does not require tamper-proofing against hostile in-process code" | trust boundary |
| `specification/requirements/product/REQ-P-SCENARIOS.md:241-244` (017) | "Changing a scenario identity, exact subject, root binding, supported public path, outcome predicate, … requires lawful Product re-entry." | retirement |

Reading of these against today's behaviour (read):

- `:609-612` is met for the import path, but the module runs with the canonical root as its working directory.
- `:474-476` is met for commands, but not for module code, which sees the helper's environment.
- HANDLERS-006 and -008, QUAL-011 and EVENTS-014 are met only at the actor layer. A hang ends as an actor timeout, and the C2 class is `transport_identity_mismatch` or an absent artifact. A throw is not typed at all.

## Q6. Options

### Measurements

Node v24.7.0, darwin-arm64. 30 runs each, after three warm-up starts of a bare child (run, `/private/tmp/abg-td67-work/measure/results.json`):

| Start | Median ms | p90 ms |
|---|---|---|
| bare child `node -e ""` | 23.5 | 24.4 |
| child that imports the module and prints one JSON record | 26.3 | 27.7 |
| the same child under `createOwnedProcessLifetime` (own group, 3 s deadline) | 26.9 | 27.8 |
| the same child with `--permission --allow-fs-read=<module dir>` | 26.3 | 26.9 |
| worker thread that imports, calls and posts the result | 12.6 | 13.0 |
| in-process import and call (today) | 0.1 | 0.1 |

A helper call took 0.9 to 2.0 s in my runs (run). Option (a) adds about 27 ms per module predicate. parallel-js declares three, so it would add about 81 ms per call.

### Prototype outcomes

These are prototypes in my scratch, not product code (run).

- (a) child: given PATH only, with a 3 s deadline and 1 s grace.
- (b) in-process deadline: 1.5 s, with my 5 s guard around the whole process.
- (b′) worker deadline: 1.5 s.

| Case | (a) owned child | (a) with `--permission` | (b) in-process deadline | (b′) worker thread |
|---|---|---|---|---|
| a returns 42 | `returned` 42 | `returned` 42 | `returned` 42 | `returned` 42 |
| c throws at import | `threw`, stage import, exit 1 | not run | `threw`, stage import | not run |
| d throws in the export | `threw`, stage call, exit 1 | not run | `threw`, stage call | `threw`, stage call |
| e top-level await, no live handle | exit 13 after 24 ms, no record | not run | `deadline_expired` at 1.5 s, then exit 0 | not run |
| k never-settling promise, no live handle | exit 13 after 25 ms, no record | not run | `deadline_expired` at 1.5 s, then exit 0 | worker ends after 14 ms without a message |
| e2 top-level await, live timer | deadline at 3 s, TERM, exit by SIGTERM, group confirmed absent | not run | `deadline_expired` at 1.5 s; the process stays alive until my KILL at 5 s | `terminate()` at 1.5 s |
| f synchronous loop | deadline at 3 s, TERM, exit by SIGTERM, group confirmed absent | not run | no result; my KILL at 5 s | `terminate()` at 1.5 s |
| g `process.exit(0)` | exit 0, no record; the parent process continues | not run | the process exits 0 with no result | worker ends without a message; the process continues |
| h line through `process.stdout` | in the child's stdout, before its record | not run | on the process's stdout, before the result | in the worker's captured stdout |
| hw line through `fs.writeSync(1)` | in the child's stdout, before its record | not run | not run | reached the process's real stdout (separate run) |
| j reads the sentinel | `"absent"` | not run | `"helper-env-visible"` | `"absent"` with `env: {}`; `"helper-env-visible"` by default |
| i writes outside | file rewritten | typed throw "Access to this API has been restricted. Use --allow-fs-write to manage permissions." | not run (today's helper writes it: case i) | not run |

Under `--permission`, starting a child process failed with `ERR_ACCESS_DENIED`, and a connection to a listener on 127.0.0.1 succeeded (run). I ran no spawn or connect probe for the other variants. Those prototypes set no restriction (read).

### The options

**(a) Owned child process, same lifetime and deadline rules as a command, throw recorded as a throw.**

- Changes:
  - In `worksite_command_helper.ts:1220-1251`, launch the call the way `runHttpProbe` already launches an owned process for a predicate (`:1065` spawn, `:1080` deadlines, `:1082` lifetime), following the command launcher (`:697-788`):
    - argv: `process.execPath --input-type=module -e <fixed loader> <module URL> <export>`;
    - working directory: the sandbox root;
    - environment: a fixed row set;
    - detached group, owned lifetime, deadline, TERM, grace, KILL;
    - one result record read from the child.
  - Add the module term to the budget rule (`product/worksite_command_execution.ts:153-181`). This changes design `:795-808`, which lists command and HTTP terms only.
  - Add a typed outcome for throw, timeout, signal, no value, and a value that is not I-JSON. The observation guard is `:1769-1780` and `:2172-2263`.
  - Unconfirmed cleanup takes the existing failure route (design `:820-834`), with a new class next to `product/worksite_command_execution.ts:640` and `:1820-1823`.
  - The reader (`validator/qualification.ts:207-211`) can then accept a genuine `null`. The oracle (`independent-oracle.mjs:228-233`) must read the typed throw as unmet.
- Protects, in the prototype (run):
  - c and d become typed throws;
  - e and k end within 25 ms with exit 13 and no record;
  - e2 and f end at the 3 s deadline, with the group confirmed absent;
  - g ends the child, not the parent;
  - h's line and a direct `fs.writeSync(1)` stay in the child's output;
  - j sees only PATH.
- Not run separately: k2, dn and h2 use the same mechanisms.
- l2 needs an I-JSON check on the returned value. That check belongs to the typed outcome, not to the process boundary.
- It does not protect i, and neither do commands (design `:636-641`).
- Recorded bytes, observations:
  - If a returned value keeps today's `observedValue` and evidence, only a throwing, hanging or exiting module gets new observation bytes. This matches the register's Boundary line (`TECHNICAL_DEBT_REGISTER.md:808`).
  - No recorded Run has such a module. Every recorded observation of the kind is a returned value, in the 13 UAT Runs and in native42/44 (run).
- Recorded bytes, the budget rule:
  - In the code: the rule object is embedded in each semantic-job actor contract (`executionCapacity`, `product/semantic_job.ts:341`, `:357-361`) and rendered into the actor's prompt (`:887`, `:901`). A new module term therefore changes the contract digest and the prompt bytes of every semantic-job stage built afterwards (read).
  - In the 13 UAT Runs: no record of the rule. The event logs (`resources/events/runtime.events.jsonl`) and other records hold none; the only hits are copies of the package's source and type text (run).
  - In native42 and native44: four archived actor prompts (`…/preparation/invocation/archives/fp-*-prompt.txt`) hold the 2026-09-26 rule, with one grace term per command and no drain term. Head's rule already differs: two grace terms plus the drain, since `400d763d1` (2026-10-21) (run).
- Replay of the rule (read, by search):
  - The prompt digest is compared only in the live `complete()`, against an assembly built in the same Run (`implementation/semantic_stage.ts:72-73`; `implementation/semantic_revision.ts:68`, `:105`).
  - Assembly and completion run on the live invocation path (`abg/actor_process.ts:792`; `implementation/leaf_invocation_port.ts:781`), which `abg/replay.ts` and `abg/project_read_ports.ts` do not import.
  - The contract's own `contractDigest` (`product/semantic_job.ts:361`) is compared nowhere.
- Task bytes: design `:474-476` requires the task to record every inherited environment value. If the child's environment rows are recorded there, every module-predicate task built afterwards gets new bytes and a new digest (read). Recorded tasks keep theirs, and head's guard already refuses the three recorded tasks I checked (run).
- Cost: about 27 ms per module predicate (run), plus one budget term per module predicate.
- Class: design text changes (`:795-808`, `:843`), so in my reading this is `design_reframe`.
  - The register says `realization_refactor`; the source finding says `design_reframe` (`implementation-public.md:374`).
  - The requirements already require the bound (HANDLERS-006 and -008, QUAL-011), so no requirement changes.

**(b) In the helper process, with a deadline and a typed record of a throw.**

- Changes:
  - race `worksite_command_helper.ts:1231-1240` against `createMonotonicDeadline`;
  - add the same typed outcome and budget term as (a);
  - after a timeout, publish and exit explicitly, because the module's handles keep running.
- Protects, in the prototype (run):
  - c and d become typed throws;
  - e and k end with a typed timeout at 1.5 s.
- What stays open (run):
  - e2 records the timeout at 1.5 s, but the module's timer keeps the process alive until something kills it;
  - f never yields to the deadline;
  - g ends the process;
  - h's line shares the acknowledgment channel;
  - j sees the sentinel.
- It changes nothing for i or the working directory (read).
- Recorded bytes: as (a), for observations, the budget rule and task bytes.
- Cost: about 0 ms start-up.
- Class: as (a).

**(b′) Worker-thread variant of (b).**

- At 12.6 ms per start (run), it:
  - bounds e2 and f with `terminate()` at 1.5 s;
  - ends only the worker on `process.exit` (g);
  - captures `process.stdout` (h);
  - hides the sentinel with `env: {}` (j).
- A direct `fs.writeSync(1)` from the worker still reached the process's real stdout, which is the acknowledgment channel (run).
- The worker runs in the helper's working directory: a worker saw its parent's `process.cwd()`, and `process.chdir` in it threw `ERR_WORKER_UNSUPPORTED_OPERATION` (run).

**(c) Retired.**

- Its condition is not met: kept fixtures and the default library's Runs use the predicate (Q4).
- The current feature set can state the same check, as a declared command plus existing predicates (read):
  - command: `node --input-type=module -e "const m = await import('./src/hello.mjs'); process.stdout.write(JSON.stringify(await m.helloWorld()))"` with `relativeCwd "."` and a declared timeout and grace;
  - predicates: `process_exit` equal to 0 and `stdout_exact` equal to `"\"Hello, world!\""`, both naming the command through `validationCommandId` (`product/worksite_command_execution.ts:1373-1374`).
  - This gets the command lifetime, a budget term, the declared environment, the sandbox working directory and captured streams. A throw shows as exit 1 with stderr.
- Differences:
  - byte equality of the printed JSON replaces canonical JSON equality, so key order matters unless the command prints canonical JSON;
  - the evidence cites the command observation, not the module's protected observation. The module bytes stay bound by the protected before and after observations.
- Changes:
  - the rule, path and schema lines `product/worksite_command_execution.ts:1077-1079`, `:1302`, `:1376`, `:1397`, `:1445-1450`;
  - the configuration input schema (`:1358-1400`), which is also the design response schema that native semantic-job authors fill (`product/semantic_job.ts:693-698`);
  - the helper `:1220-1251`, the reader, the oracle, and design `:843`;
  - three fixture requests and their oracle files.
- Re-entry: the three fixtures are registered scenarios, and REQ-P-SCENARIOS-017 makes a change of outcome predicate a Product re-entry.
- Recorded tasks (run):
  - At head, the task guard already refuses the three recorded tasks I checked: native42, and js-tenant-test and parallel-js from 2026-10-28.
  - The reason is that their native-work source observation (`isNativeWorkspaceWorkObservation`) does not validate.
  - Retiring the kind adds a second refusal at configuration construction: "worksite outcome predicate requires exact id and kind" (run on a patched copy of the build).

### Recommendation

Option (a), with these choices:

- a returned value keeps today's observation bytes;
- a throw, timeout, signal, missing record or value that is not I-JSON is recorded as a typed outcome of the predicate;
- the child's deadline and grace enter the budget as a published term;
- the child's working directory is the sandbox root and its environment is a fixed row set.

The reasons:

- In the prototype it typed or bounded every case it was run on: c, d, e, e2, k, f, g, h, hw and j (run). dn, h2 and k2 use the same mechanisms.
- It is the register's own condition for retiring the entry: "The predicate runs inside an owned process with its own deadline, and a throw is recorded as a throw." (`.ai-workspace/TECHNICAL_DEBT_REGISTER.md:805`) (read).
- The replay risk the register names (row `:185`, Boundary `:808`) does not reach recorded Runs. No recorded observation comes from a throwing module, and no replay or read path rebuilds the budget rule (run; read).
- It reuses the bounded, confirmed group lifetime the design already uses for commands and HTTP launches (read).
- It costs about 27 ms per predicate against a helper call of about 1.4 s (run).
- It changes no recorded observation (run).

The other options fall short:

- Option (b) leaves f, g, h and j open, and in e2 it leaves a live process behind.
- Option (b′) adds a second isolation mechanism that still lets `fs.writeSync(1)` reach the acknowledgment channel.
- Option (c) needs Product re-entry for three scenarios that 13 recorded default-library Runs exercise.

Unsure:

1. **Where the typed outcome lives.** One choice is inside the observation, as the register's closure says ("with a typed observation", `TECHNICAL_DEBT_REGISTER.md:807`), for example as an evidence row with `observedValue: null`. The other is the helper failure route that the HTTP classes use, which fails the whole C2 call.
2. **Where the deadline comes from.**
   - A published constant keeps declarations unchanged.
   - A declared field changes the exact keys at `:1078` and the author schema at `:1376`.
   - Either way the budget rule object changes, and with it the semantic-job contracts and prompts built afterwards. My search found no replay path that rebuilds them. That is a search result; I did not run a replay to confirm it.
3. **The child's environment.**
   - PATH only, or the ambient rows that commands receive (HOME, TMPDIR, LANG, LC_ALL, PATH), which the predicate does not declare today.
   - Whichever set is chosen must be recorded in the task (design `:474-476`), which changes the bytes of module-predicate tasks built afterwards.
4. **Whether to add Node's permission flag.** It turns i into a typed throw at no measured cost and blocks child processes, but not network access. That goes beyond command parity and the stated trust boundary.
5. **How a native agent behaves today,** which decides the live bound (see below).

## What I did not check

- **Claude Code itself.** My full path used the lane's relay. I did not check:
  - whether Claude Code's Bash tool keeps the helper in the actor's process group;
  - what its 120 s default timeout does to the helper;
  - which environment it passes to the helper;
  - which line it returns when two acknowledgment-shaped lines appear (h, h2);
  - what it returns when the helper prints nothing (e, g, k, l2).
- **Credentials.** I did not check which credentials a live helper's environment holds, and I read none.
- **Replay.** I did not run a replay of any recorded log at head. The finding that no replay path rebuilds the budget rule comes from a search of the code. I did not establish why the head's native-work guard refuses the recorded tasks, only that it does.
- **Prototype gaps:**
  - k2 under (a) and (b);
  - c and e under the worker;
  - every case except a and i under `--permission`;
  - spawn and connect outside `--permission`;
  - a synchronous loop at a module's top level.
- **Other searches and platforms:**
  - the odd_glc repository named as the oracle source at `scenarios.json:187`;
  - Windows;
  - a missing or symlinked module path, read only (`worksite_command_helper.ts:1226-1230`).
- **Hostile-code cases, read only:**
  - a module that patches helper globals to change other observations;
  - a module that writes the event log root.
- **Scope of the copied tenant.** I checked `T/test_env/test_runs` only for the 13 recorded sandbox UAT Runs of the three fixtures, not the rest of its 45 GB.

## Processes I ended

| What | Ended by | Mark |
|---|---|---|
| e2, k2 owner-local helpers | my SIGTERM to the helper's process group at 20 s | run |
| f owner-local helper | my SIGTERM at 20 s (ignored), then SIGKILL at 23 s | run |
| e2, k2 full-path relays and helpers | the actor transport's TERM to its group at the 25 s inactivity limit | run |
| f full-path relay and helper | the actor transport's TERM at 25 s, then its KILL to the group after the 1 s grace | run |
| (b) prototypes e2 and f | my measuring script's SIGKILL after 5 s | run |
| pid 84615, during case l2 | my leftover check's SIGKILL. It was my own concurrent tool shell, whose command line contained the scratch path. No other process was signalled. I then limited kills to descendants of the probe harness. | run |

The watchdog around each probe run never fired. At 00:57 AEDT no process matching the scratch paths was running (run).

## Scratch

Nothing was deleted. Evidence lives in:

- `/private/tmp/abg-td67-work/probes/<case>/record.json`, plus the `attempts/` copies and `full-events.jsonl`;
- `/private/tmp/abg-td67-work/measure/results.json`;
- `/private/tmp/abg-td67-work/option-c/`;
- `/private/tmp/abg-td67-work/census/`.

The probe harness is `/private/tmp/abg-td67-work/build_tenants/abiogenesis/typescript/test_env/tests/td67-probe.test.mjs`.

| Directory | Size at 00:57 AEDT 2026-11-13 |
|---|---|
| `/private/tmp/abg-td67-work` | 239 MB |
| `/private/tmp/abg-td67-tmp` | 799 MB |
