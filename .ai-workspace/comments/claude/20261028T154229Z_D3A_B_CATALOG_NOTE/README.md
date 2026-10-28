# D3-a-b: the sandbox UAT catalog's decidability note stands alone

Worker, Opus 5.5, 2026-10-29; base `f8030abec153cea9a958737583c7a16fcdbbbb6f`.
Test territory only: the seven `request.json`, `scenarios.json` and
`README.md` under `build_tenants/abiogenesis/typescript/test_env/fixtures/sandbox-uat/`.
The pack `sha256:550b48cc9a0d81af85ff89f61f89cfe28951c829c6d5d24a251768887b743df6`
is unchanged.

## The change

In each task, D3-a's header line `Adaptation notes (the test owner's
interpretation of the legacy mechanisms; governing for this workload):`, its
four entry lines (five for `data-mapper-full` and `rust-service`) and its
`- decidability: ` line are removed. The paragraph below takes their place,
with one blank line before and after it. Each task now equals its pre-D3-a
task (`638127c0e`) with `"\n\n" + paragraph` inserted after the anchor
sentence "The adaptation notes govern interpretation of legacy mechanisms, not
weakening of original application outcomes." Both derivations (deletion from
D3-a's task, insertion into the pre-D3-a task) agree byte for byte. The
trailing `INTERPRETATION` block is kept, once per task, and equals the
request's `legacyInterpretation` (`JSON.stringify(object, null, 2)`).

The paragraph, 1,972 bytes,
`sha256:847cccec07da43047e367689472a35d958f39468bef63c173bed15dc283a6c7f`,
once in each of the seven tasks at task byte 349:

    Decidability note (the test owner's interpretation of the legacy mechanisms, governing for this workload; the INTERPRETATION block at the end of this task carries the adaptation notes): The donor's witness block (its source project, run path, duration, traversal shape and parity rule), any executeFromPlan flag and the donor harness's result fields (executionStatus, planSatisfied, observedTestPassCount and the stdout digest) are provenance and historical meaning of the donor run. They are satisfied for this workload by being preserved unchanged in the original source; they are not criteria of this run and are not reported as unresolved. Under the installed lifecycle the execution-result stage is judged from the admitted command observation: its exit status, its stream bytes and digests, its observed pass and fail lines against the plan's command, args, cwd, expected exit code, expected stdout fragments and pass floor, and the admitted predicate observations. Stage meanings are satisfied by the artifacts' content, by each stage's write-only rule read as a content rule (a stage's file holds only that stage's content) and by the declared dependency order between the artifacts; separate vectors, invocations or graph calls per stage are not required, and their absence is not a gap. The host toolchain's version, environment rows beyond those the plan declares, and the absence of writes outside the worksite are not criteria of this workload unless the original source or the rubric names them; the recorded executable path, arguments, cwd, exit status and streams are the execution evidence, and the installed Product's worksite law owns write confinement. The original application outcomes, every required artifact, test file and test role, the pass floor, zero failures and plan satisfaction remain mandatory: an unmet one is unmet, never indeterminate, and indeterminate is reserved for one of these criteria that the admitted observations do not carry.

`scenarios.json`: only the seven `<key>/request.json` digest and byte-count
pairs changed. `README.md`: D3-a's four-line sentence removed; the
activation's sentence (304 bytes, `sha256:a464a0c7…f38e`) added as its own
paragraph after the `legacyInterpretation` paragraph, wrapped at 79 columns.

## Pins (full values in `pins.json`)

| Request | Before sha256 | Before bytes | After sha256 | After bytes | Task bytes before → after |
|---|---|---:|---|---:|---|
| `basic-cli/request.json` | `017d3ce2…025e` | 23,776 | `340c8a33…0219` | 23,299 | 8,089 → 7,616 |
| `data-mapper-full/request.json` | `0fa6938f…ad9f` | 80,320 | `98ff95ba…593a` | 79,624 | 45,363 → 44,672 |
| `js-sdlc-bootstrap/request.json` | `21790825…d6b9` | 27,462 | `3eb6ebb6…b2c3` | 26,985 | 9,884 → 9,411 |
| `js-tenant-test/request.json` | `2d4ac5ac…7a2e` | 24,093 | `9d66f966…0f24` | 23,616 | 7,419 → 6,946 |
| `parallel-js/request.json` | `118623a7…11b0` | 26,515 | `766a1b4c…dbc8` | 26,038 | 8,049 → 7,576 |
| `rust-cli/request.json` | `321c2541…0ace` | 25,293 | `942e7711…6d5b` | 24,816 | 7,580 → 7,107 |
| `rust-service/request.json` | `a6e06dbb…5eb2` | 25,596 | `65e24341…7116` | 24,889 | 8,402 → 7,700 |
| `scenarios.json` | `223d6a8b…149b` | 34,763 | `666afea3…a843` | 34,763 | |
| `README.md` | `f7494b29…6023` | 3,965 | `8fe134f0…dbba` | 4,028 | |

## The prepare

One prepare, `js-sdlc-bootstrap`, `node scripts/sandbox-uat.mjs prepare`,
provider disabled, D3-a's configuration with the paths moved to this
package's scratch, the pack copied from D3-a's scratch and verified
`550b48cc…3df6`.

- Status `prepared`, preflight `ready` (no issues), no `failure.json`;
  rc 0, 273 s; load 1-min 5.96 → 4.08.
- Archived manifest `666afea3…a843`, request pin `3eb6ebb6…b2c3` (26,985
  bytes): the after values.
- `prepared-definition-call.json` `sha256:0f15bb1d910c2c89dfae169a06181cc2a569e7d16a6efec92302d9c8caa0f851`,
  29,681,748 bytes. The paragraph is in both `original.task` copies
  (`input_contract` slot and request input), each 9,411 bytes, equal to the
  edited request's task, with the blank line before and after and one
  `INTERPRETATION` block. D3-a's header and the `- decidability: ` line are
  absent from the call.

## The lanes

Each lane alone, `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace
node --experimental-vm-modules --test --test-concurrency=1
--test-timeout=600000 <path>`, `uptime` before and after. The before column is
D3-a's after column (the same tree as this package's base). The ordered result
lines, durations stripped, have equal sha256 per lane against D3-a's after
logs. No red, no rerun. The highest 1-minute load across the lane readings
was 5.22, and across all readings 5.96 (before the prepare).

| Lane | Before (D3-a after) tests/pass/fail/skipped | Before load 1-min start → end | After tests/pass/fail/skipped | After load 1-min start → end | Equal |
|---|---|---|---|---|---|
| `uat-harness` | 34/31/0/3 (rc 0, 977 ms) | 4.66 → 4.66 | 34/31/0/3 (rc 0, 1,054 ms) | 4.28 → 4.98 | yes |
| `t287-default-library` | 25/22/0/3 (rc 0, 2,987 ms) | 4.66 → 5.81 | 25/22/0/3 (rc 0, 3,072 ms) | 4.98 → 4.98 | yes |
| `t287-observed-worksite-command` | 8/8/0/0 (rc 0, 1,462 ms) | 5.81 → 5.81 | 8/8/0/0 (rc 0, 1,515 ms) | 4.98 → 5.22 | yes |
| `t287-governance-covered-source-use` | 9/3/0/6 (rc 0, 364 ms) | 5.81 → 5.81 | 9/3/0/6 (rc 0, 380 ms) | 5.22 → 5.22 | yes |
