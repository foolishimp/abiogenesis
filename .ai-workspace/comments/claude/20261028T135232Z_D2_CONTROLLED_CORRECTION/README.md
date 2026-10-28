# D2: the mechanical lifecycle specimen on cut fd38e8227

T-287 Phase D, package D2. Worker: Claude Opus 5.5, 2026-10-29 (UTC 2026-10-28). This is commentary. It is not specification or design. The admitted event log is the only source of facts; every figure below is a fold over it or a digest of an archived file.

## Outcome

No. Claims 1, 2, 3 and 5 are satisfied. Claim 4 is not satisfied as the activation states it. The Run stopped `blocked` at the selector gap that the specimen source predicts, so there is no terminal result: `run_result` is a `not_found` refusal and `run_replay` reports `blocked`, not `closed`. The fresh reads, the cold reads and TD-18's trace conserve the held stop with no gap. No activation stop fired: no `BoundaryFailure`, the failing observation is present and retained, the reads agree with the held state, the trace is complete, and the provider stayed within budget. The harness's `summary.json` records `failed`, as the activation anticipated for a Run that ends with `terminal` false.

## Run

| Field | Value |
|---|---|
| Archive | `build_tenants/abiogenesis/typescript/test_env/test_runs/sandbox-uat/d2-specimen/2026-10-28T14-04-05-074Z-6ff30dc1-bb3a-43f4-8412-1aac43a4bd7d/` (git-ignored, retained) |
| Fresh target root | that archive's `sandbox/` and `bootstrap/` |
| Run | `run://abiogenesis/5df74f453abce58b98f6e74ad0e74e004b3b10443404d198b2fa01f84fa86fb0`, digest `sha256:26042b3d5e03dccf210fb404786afd048c6ec458005ea74590075d8864b2871f` (the `run_segment_opened` payload digest) |
| Pack | `sha256:550b48cc9a0d81af85ff89f61f89cfe28951c829c6d5d24a251768887b743df6`, installed fresh by the harness |
| Owners | 9 actor invocations: 5 `executive-step@5` selectors, 2 `native-work@5`, 2 `command-execution@5` |
| Turns | 24 in total (selectors 2 each; workers 4, 4, 3, 3) |
| Cost | 2.599031 USD over 9 transports, each `success`, model `claude-opus-5-5` |
| Elapsed | 791 s (14:04:05Z to 14:17:16Z); `lifecycle-start` wall 508.2 s, exit 0 |
| Load (1, 5, 15 min) | before 6.17 7.42 7.94; after 12.08 9.50 8.91 |
| Harness `summary.json` | status `failed`, `uatPass` false, `runtimeDisposition` `result`, `terminalAvailable` false, `independentOracle` `unsatisfied` (the run-time oracle; see Corrections), reason "Original application obligations or terminal evidence remain incomplete" |
| Event log | `resources/events/runtime.events.jsonl`, 6,218 events, 26,187,674 bytes, device 16777231, inode 646390318, `sha256:f40ef7636fa7d3d3309951e29f9af4974e78a92021ddd40ee7e96bee2175d19d` |
| Stop | `run_stopped` `event://abiogenesis/998c344a9f26cf5baf3be665ea74bf47e25fee68333159ed56a0a03158d3eea7` (ordinal 6218), disposition `blocked`, reason `reason://abiogenesis/default-library/gap@5` |

The sequence: the selector chose Construction, which wrote `broken\n`; Testing measured exit 1 through C2; the selector chose the repair; Construction wrote `fixed\n`; Testing measured exit 0; the final selector returned no contribution and a gap (UAT is outside the specimen's obligation; close and restart belong to the runtime). No UAT ran, so there is no native assessor verdict.

An admission check ran first, with no provider dispatch: archive `.../d2-specimen/2026-10-28T13-58-58-223Z-c99d2351-a27d-45b6-88e4-a64a4474ffa8/`, status `prepared`, 266.9 s. Its `c2-configuration-check.json` (`sha256:172fcb06f1a723409f364b0f330fe66c824f23bc4d1e1f96783f219d73e5a71a`) is the evidence for the request repair below.

## The five claims

**1. The failing C2, retained: satisfied.** Admitted at `event://abiogenesis/3bf6799bb89f44903ebb04631ef313ea6a35abae0028463f450bfb10a91ced8e`, ordinal 2506, producer `graph-function://abiogenesis/worksite/command-execution@5`, result `result://abiogenesis/ae52222321408ffa87888ab04d9f39bb50e9d398ce6cfa8c8eb4d9b6b6ff77e7`. The observation is `worksite-command-execution-observation://abiogenesis/5175b793160c4a4bd1c958791cff9bf9ce8336af80edceaf9e32cb43837ee3a9`, with `observationDigest` of the same hex. Its command is the declaration: `command://abiogenesis-d2/specimen/checker`, `node fixture/checker.mjs`, cwd `.`, 60,000 ms, grace 10,000 ms. Exit 1; stdout `FIXTURE_VALUE_BAD expected=fixed actual="broken\n"\n`; not timed out; termination confirmed. The diagnostic rides in the admitted observation as `commandResults[0].stdout`. The handoff: the command-execution actor invocation `actor-invocation://abiogenesis/4e21fdd1dfd7a692c5ac1ad5bfe6593a9bde885c4b5b6f3794b12e92be28f4f8` ran the helper (`worksite-command-helper-artifact://abiogenesis/c247cd6eff1ee01c7fe4578fc517420643b5b0e53010c5250b5410f8f5265d55`), which relayed the subject's stdout. The subject's exit 1 arrives as a success-class C2 observation with `exitStatus` 1, not as a `helper_failure` (`worksite_command_execution.ts:2347`). The parent retains it in `observations[1].resultRef` and `observations[1].value.commandResults[0]` of two governance work states: the first after that cycle, `testing@5` result `result://abiogenesis/e5b0c5f1e2a0aaa90f9b325734d5cd6d37a0c18e0febd6d6123bc20faf92120b` (`event://abiogenesis/4ba0fb9d77f598a73f9420ce1954dc398223c9c7616fc83628659efbd20a5cc2`, ordinal 2536); and the state at the stop, the non-terminal state the stop c-call admitted, `executive@5` result `result://abiogenesis/b7ab6790f6743852322fb260e38852489861a6a10047ca8c8be793c9ab01e92e` (`event://abiogenesis/e2c2eaf647ae091ccffc24aaeada82e2292dada1625bcc61cc1deb5af93a6570`, ordinal 5286). No terminal `governance_work_state` exists.

**2. One native repair, `fixture/value.txt` only: satisfied.** Exactly one native work observation lies between the two measurements: `native-work-observation://abiogenesis/4e411a08a46ba80b6921542baba0896dbabfaf4ef761dd5981d5a4c5bfc2cb9c`, admitted at the leaf `native-work@5` (`event://abiogenesis/97b14ac9fa0ee5778c1b00ab245b310ba7d9bcec173ad7ca3760f2043034c27e`, ordinal 3997, result `936d21a6…`) and again as the Construction child's result (ordinal 4010). Its actor invocation is `actor-invocation://abiogenesis/86091d0b5934df3b57ddf39e56302e724058a2aab0e570fc822aeae49c448f67`. `writeRoots` is `[fixture/value.txt]` and `changedPaths` is `[fixture/value.txt]`. The candidate goes from `sha256:cdd6c109503d4e19cad782eef4d9ba162af0d84727445edbb9d300df1adc6048` (`broken\n`) to `sha256:0c3071418e6356e614898c84ed064ca95e88551bc0811b534bdf1952ecdae534` (`fixed\n`). The observation's before and after digests hold the three originals unchanged, and `source-conservation.json` agrees. Method: the native work observation's own before and after rows over the selected worksite files. The prior write of `broken\n` is result `f4e69578…` (ordinal 964).

**3. The same checker, green: satisfied.** Admitted at `event://abiogenesis/c525c1b2691a1fb1cb51852bd119414d24aef4d50b867ac763112b4ed1b5016e`, ordinal 5215, result `result://abiogenesis/2c793351b55e1f5c30281f86e84bef2bb10c58c6bb06746bff479ee6c66fadcc`. The observation is `worksite-command-execution-observation://abiogenesis/2c6ac989c335509233b7f7787abfe00f6e4d8cf239fee2a82025a35e4112aae9`. It carries the same command identity, executable, arguments, cwd, environment rows and limits as claim 1. Exit 0; stdout `FIXTURE_VALUE_FIXED\n`. `fixture/checker.mjs` keeps `sha256:5a39eff7d6082835ebc49bc9deeaf4ff1d7e01e55314bfec749cf3d018cced22`. The two observation digests differ. The producers are actor invocations `4e21fdd1…` (failing) and `464f3a99d52aa15868114725b3212b95d04f3b1fddddd7677dc5d76f6dc62f11` (green), both `command-execution@5`.

**4. Close, reopen, fresh reads conserve: not satisfied as stated.** The activation requires a result with the held terminal and `run_replay` `closed`. Neither exists:
- `fresh-readback.json`: `run_result` is a refusal `not_found`; `run_replay` is a result with status `blocked`, the Run as its subject, and `terminalResult` null.
- `cold-reads.json`: a second node process (pid 43689, 14:21:13Z to 14:21:45Z, cold root in the Worker scratch) invoked the same two reads through the installed CLI with the archived close handoff. Owner outputs and projections are equal to `fresh-readback.json`'s; the event resource identity is unchanged.
- `trace.json`: the fold over `readRuntimeEventsAtDurablePrefix` at the archived prefix recovers every held field, 21 rows, all equal, no gap. The rows cover the absent terminal result, the stop and its disposition, the stop producer (c-call `460091fe…`, judgment `564b7947…`), the state at the stop (admission `sha256:82436e85…`, value `sha256:63ef8ef4ca2154660f6953bfcd09c11046971c09153546c7e11cd4275506840d`), the 6,215 receipt evidence rows, the Run, the root graph call, both observations, the repair write, parent retention, the close handoff's prefix, and the log's device and inode.
`claims.json` records `heldStateConserved` true, `literalClosed` false, and the gap.

**5. No Run migration: satisfied.** The driver source names no historical record. No command or call record, and no event payload, carries `attempt-07`, `continuation-16` or `continuation-17`. One `run_segment_opened` (ordinal 8) opens the new Run. The event log lies under the fresh archive; its first event (ordinal 1) is at 14:06:03.594Z. The specimen bytes equal the activation's digests.

## Request repair

`testing.allowedWriteTerritories` is `[]`, not the activation's `[{pathKind:'file', relativePath:'fixture/value.txt'}]`. The C2 law (`constructWorksiteCommandConfiguration`, `worksite_command_execution.ts:1576-1591`, clause `:1588`) refuses a protected subject inside an allowed write territory. Testing's protected subjects are `testing.selectedPaths` (`abg/default_library.ts:279`), and the activation requires `fixture/value.txt` among them. The admission check constructed `[]` and refused the literal ("worksite command and predicate identities must be unique", the guard's one message). The construction grant comes from the Construction work order's `writeRoots`, not from the territory, which bounds command-execution writes only. Each outcome predicate also carries a `predicateId` (`predicate://abiogenesis-d2/specimen/checker-exit`).

## Omissions from `runScenario` (`runner.mjs:340-413`)

- The catalog acquisition (`acquireScenario`): replaced by `acquireSpecimen` against the activation's pins.
- The oracle snapshot (`oracle-acquisition.json`): replaced by `specimen-acquisition.json`.
- The archived re-acquisition (`acquireArchivedScenario`): replaced by a digest check of the oracle and the request.
- The catalog oracle (`independent-oracle.mjs::evaluate`): replaced by `specimen-oracle.mjs::evaluate`, which writes `specimen-judgment.json`.
- The resume path does not apply.

`setupEnvironment` and `redactedConfig` are module-private, so they are inlined verbatim. Every other step imports the harness's exports by absolute path.

## Corrections after the run

- **Oracle.** The run-time oracle, `sha256:fd05e5214dd90f3d7d172754ff07a3c49c8a98acf88b9b35ca58e0ce59837f61` (31,991 bytes), counted native work admissions, not observations. It counted the one repair twice (leaf and Construction child) and judged claim 2 unsatisfied. That figure is in the archive's `specimen-judgment.json` and `summary.json`. The committed oracle, `sha256:d64b3530af50b81468922ff8573ea8e5df239df938b75e204c8cc5b096df236f` (38,948 bytes), keeps one row per `observationRef` and adds the `claims` fold. It records both judgments in `claims.json` (`inRunJudgment`, `modules`). Claim 5's specimen row shows the run-time oracle digest, the one the driver checked.
- **Driver.** The run-time driver is `sha256:233409e96addb6a61fdde3a00b5e1237166bb21bed5654c6a30c43c904867fd0` (20,619 bytes). The committed driver, `sha256:22d0b57bce33494f13673569f0afa758af387a67a921c53fb120049b7c39bd11` (20,969 bytes), differs only in `coldReads`: `projection ?? null` for a refused read, and the owner output compared. The change was made before the cold-reads process ran.

## Files

| File | sha256 | Bytes |
|---|---|---:|
| `run-specimen.mjs` | `22d0b57bce33494f13673569f0afa758af387a67a921c53fb120049b7c39bd11` | 20,969 |
| `specimen-oracle.mjs` | `d64b3530af50b81468922ff8573ea8e5df239df938b75e204c8cc5b096df236f` | 38,948 |
| `specimen/request.json` | `e1c049abda12f08d8191ab8b5f3a33adc17c223175c39e6349baf5ab6dcf3327` | 11,958 |
| `specimen/source.md` | `9a28aa248b2fbab7493ff91456331aeb1a8287de363b65fcd59f2ba0dbd3f328` | 1,107 |
| `specimen/checker.mjs` | `5a39eff7d6082835ebc49bc9deeaf4ff1d7e01e55314bfec749cf3d018cced22` | 335 |
| `specimen/rubric.md` | `d5efa802ff34c2847871df8b2bf81f21b05abfca70c1c4c33281ba977f54ea42` | 634 |
| `claims.json` | `c78dcb66b578e8118a82c16b0bc55a818a06381e322790a7132729d774940c38` | 33,415 |
| `trace.json` | `6a2ba65be0bff411e167c9603af9b53ed38d8e6f23d5f6ea04bf1e744be1c8d3` | 18,529 |
| `cold-reads.json` | `3280adec5b938e12797dd6d2160c8b16bcd78a44ffd1e3990d201b6c9f5b76ec` | 4,069 |
| `archive.json` | `13e9ddffe7671aca07cc983d270cc81496ea29d826eb98f787004c2faad3a698` | 2,746 |
| `cost.json` | `64395acfc2c58fb2956d4463ed70310d166f26b2bd4e2432210e768b073d6902` | 9,992 |

The three specimen files are byte copies of the activation's `continuation-09/fixture/` files. Their digests are checked against the activation's. The archive stays under `test_runs/` and is not copied here (TD-19). The wrapper is not committed.
