# D3-a: sandbox UAT catalog, legacy interpretation and decidability note

Package D3-a of T-287 Phase D. Base `638127c0ef0bbc22408aa4ce3373d81d629db1fa`.
Commentary and evidence pointers; digests and paths, no evidence copies (TD-19).

## The defect, read from the failed run

1. Run `js-sdlc-bootstrap/2026-10-28T12-57-57-253Z-624419a6-…` (archive under the tenant's `test_env/test_runs/sandbox-uat/`, git-ignored). At ordinal 10095 the uat assessment (`c_call_result_admitted`, native-work observation, result `a403b5e0…`) returned `indeterminate` with nine `unresolvedCriteria`. At ordinal 10863 the executive actor's registered choice was `gap`, missing `support://abiogenesis-sandbox-uat/js-sdlc-bootstrap/complete-original-outcome`. At ordinal 10876 `run_stopped` blocked with `reason://abiogenesis/default-library/gap@5`. The mechanical oracle was `satisfied`.
2. Criteria 1–6 are the donor's material. Criterion 1 is the witness's eight-vector traversal and parity rule (unproven). Criterion 2 is the per-stage write-only rules (not separately observed). Criteria 3–6 are the legacy harness's `executeFromPlan`, `executionStatus`, stdout digest algorithm and `planSatisfied` (unknown). The decidability note decides these six.
3. Criteria 7–9 are not donor material:
   - criterion 7: the Node.js version is neither pinned by the source nor recorded in the admitted observation;
   - criterion 8: the declared empty environment differs from the observed `HOME`, `LANG`, `PATH` and `TMPDIR`;
   - criterion 9: no observation establishes the absence of writes outside the worksite.
   The note does not name them. Criterion 7 is a fact the admitted observations do not carry, so it remains eligible for `indeterminate` under the note's own last clause.
4. The interpretation was already delivered, contrary to the activation's reading. Every one of the seven tasks already ends with an `INTERPRETATION` JSON block that parses equal to that request's `legacyInterpretation`. Each assessor's prompt carries that block:
   - the failed run's assessor: `fp-2231c5f1623cc9e0-prompt.txt`, frame §10, 86,838 bytes, the block at byte 49,661;
   - the two passing runs' assessors (2026-10-06 and 2026-10-27): `fp-294892292c68d1ff` and `fp-f2c33b0020f7eaa0`, both `satisfied` with zero unresolved criteria over the same block.
   The file the activation names, `fp-362830887d446612`, is an executive selector prompt (frame §8, a contribution set), not the assessor's. The runs did not differ in delivery. The text that was absent is the decidability note, together with the label that ties "the adaptation notes" to the entries.
5. The fault is in test-owned material: the catalog's interpretation did not say which donor mechanisms are provenance rather than criteria. The Product's route was lawful: the registered choice is actor-authored and only validated, and the uat framing makes the original sources govern.

## The change

In each of the seven `test_env/fixtures/sandbox-uat/<key>/request.json`, the `task` string carries an insertion directly after the sentence "The adaptation notes govern interpretation of legacy mechanisms, not weakening of original application outcomes.":

- one `\n`;
- the header line;
- that request's `legacyInterpretation` entries in file order, one line each as `- <key>: <text>`;
- the decidability note.

`\n` separates the parts. The existing `\n\n` before the original declaration is unchanged. No other field changes.

Because the trailing `INTERPRETATION` block stays, the entries now appear twice in each task.

`scenarios.json`: the seven `<key>/request.json` pins take the new digest and byte count. `README.md`: one sentence after the `legacyInterpretation` paragraph, on new lines within it.

The inserted text, once. The header (105 bytes, sha256 `8f3e94aa…4b67`) is:

    Adaptation notes (the test owner's interpretation of the legacy mechanisms; governing for this workload):

The note (1,411 bytes, sha256 `916747b5480c7aa33b9a00a5d6ce818be16e3acf09201af47b932b8e53315af6`, byte-identical in all seven):

    - decidability: The donor's witness block (its source project, run path, duration, traversal shape and parity rule), any executeFromPlan flag and the donor harness's result fields (executionStatus, planSatisfied, observedTestPassCount and the stdout digest) are provenance and historical meaning of the donor run. They are satisfied for this workload by being preserved unchanged in the original source; they are not criteria of this run and are not reported as unresolved. Under the installed lifecycle the execution-result stage is judged from the admitted command observation: its exit status, its stream bytes and digests, its observed pass and fail lines against the plan's command, args, cwd, expected exit code, expected stdout fragments and pass floor, and the admitted predicate observations. Stage meanings are satisfied by the artifacts' content, by each stage's write-only rule read as a content rule (a stage's file holds only that stage's content) and by the declared dependency order between the artifacts; separate vectors, invocations or graph calls per stage are not required, and their absence is not a gap. The original application outcomes, every required artifact, test file and test role, the pass floor, zero failures and plan satisfaction remain mandatory: an unmet one is unmet, never indeterminate, and indeterminate is reserved for a criterion the admitted observations do not carry.

The README sentence (added after the paragraph's last line, inside the paragraph):

    Its entries are delivered to the actors through each request's task text, as the adaptation notes the task names, because the installed governance input carries no separate key; the harness records the object itself in `workload-source.json`.

## Pins (sha256 prefix…suffix; full values in `pins.json`)

| Request | Before sha256 | Before bytes | After sha256 | After bytes | Task bytes before → after |
|---|---|---:|---|---:|---|
| `basic-cli/request.json` | `481aad19…980f` | 21,323 | `017d3ce2…025e` | 23,776 | 5,642 → 8,089 |
| `data-mapper-full/request.json` | `d583deda…9f43` | 77,648 | `0fa6938f…ad9f` | 80,320 | 42,698 → 45,363 |
| `js-sdlc-bootstrap/request.json` | `3e16c502…e983` | 25,009 | `21790825…d6b9` | 27,462 | 7,437 → 9,884 |
| `js-tenant-test/request.json` | `8a80cd9e…91be` | 21,640 | `2d4ac5ac…7a2e` | 24,093 | 4,972 → 7,419 |
| `parallel-js/request.json` | `ad8880aa…73f1` | 24,062 | `118623a7…11b0` | 26,515 | 5,602 → 8,049 |
| `rust-cli/request.json` | `f132ab8b…b8c1` | 22,840 | `321c2541…0ace` | 25,293 | 5,133 → 7,580 |
| `rust-service/request.json` | `068fccd2…40da` | 22,913 | `a6e06dbb…5eb2` | 25,596 | 5,726 → 8,402 |
| `scenarios.json` | `2c506450…e3e8` | 34,763 | `223d6a8b…149b` | 34,763 | |

`README.md` of the fixture directory: `73b884a2…5ef9`, 3,722 bytes, before; `f7494b29…6023`, 3,965 bytes, after.

## Admission: seven prepares, provider disabled

The command was `node scripts/sandbox-uat.mjs prepare --case <key>`. It ran under `env -u ANTHROPIC_API_KEY -u CLAUDE_CODE_OAUTH_TOKEN` with `TMPDIR` set to the Worker scratch. The configuration had `provider.enabled` false.

The pack was `npm pack --ignore-scripts` of the base after the one `npm run build`. Its sha256 is `550b48cc9a0d81af85ff89f61f89cfe28951c829c6d5d24a251768887b743df6`, equal to the pack of `fd38e8227`.

Archive root: Worker scratch `d3a/prepare/runs/`. "Note in call" means the call's JSON was walked for strings that contain the note's exact bytes. Both hits are the installed owner's admitted `original.task`; each holds the header directly after the anchor.

| Case | Status | Preflight | Request pin at acquisition | Note in `prepared-definition-call.json` | Call sha256, bytes | Wall s | Load 1-min before → after |
|---|---|---|---|---|---|---:|---|
| basic-cli | prepared | ready | after pin `017d3ce2…025e` | 2 (both `original.task` copies), header adjacent | `a78b59a9…dedd`, 29,675,558 | 274 | 15.65 → 5.47 |
| data-mapper-full | prepared | ready | after pin `0fa6938f…ad9f` | 2 (both `original.task` copies), header adjacent | `588c2e00…ac71`, 29,793,400 | 267 | 5.47 → 4.14 |
| js-sdlc-bootstrap | prepared | ready | after pin `21790825…d6b9` | 2 (both `original.task` copies), header adjacent | `bfd4f983…4d7b`, 29,682,682 | 266 | 4.14 → 5.57 |
| js-tenant-test | prepared | ready | after pin `2d4ac5ac…7a2e` | 2 (both `original.task` copies), header adjacent | `b85c05fc…bac3`, 29,675,908 | 267 | 5.57 → 4.82 |
| parallel-js | prepared | ready | after pin `118623a7…11b0` | 2 (both `original.task` copies), header adjacent | `a84f8e20…60bc`, 29,681,376 | 265 | 4.82 → 3.82 |
| rust-cli | prepared | ready | after pin `321c2541…0ace` | 2 (both `original.task` copies), header adjacent | `dd1ab84c…a35c`, 29,678,918 | 265 | 3.82 → 4.22 |
| rust-service | prepared | ready | after pin `a6e06dbb…5eb2` | 2 (both `original.task` copies), header adjacent | `8d2553a7…c91b`, 29,678,088 | 268 | 4.22 → 5.36 |

## Lanes

Each lane ran alone. The command was `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace node --experimental-vm-modules --test --test-concurrency=1 --test-timeout=600000 <path>`. `uptime` was read immediately before and after each lane.

The before pass ran on the base tree after the one `npm run build`. The after pass ran on the edited tree after the seven prepares. Test names and statuses are identical before and after.

| Lane | Before tests/pass/fail/skipped | Before load 1-min start → end | After tests/pass/fail/skipped | After load 1-min start → end | Equal |
|---|---|---|---|---|---|
| `uat-harness` | 34/31/0/3 (rc 0, 1027 ms) | 8.91 → 10.76 | 34/31/0/3 (rc 0, 977 ms) | 4.66 → 4.66 | yes |
| `t287-default-library` | 25/22/0/3 (rc 0, 3164 ms) | 10.76 → 10.76 | 25/22/0/3 (rc 0, 2987 ms) | 4.66 → 5.81 | yes |
| `t287-observed-worksite-command` | 8/8/0/0 (rc 0, 1629 ms) | 10.76 → 12.06 | 8/8/0/0 (rc 0, 1462 ms) | 5.81 → 5.81 | yes |
| `t287-governance-covered-source-use` | 9/3/0/6 (rc 0, 392 ms) | 12.06 → 12.06 | 9/3/0/6 (rc 0, 364 ms) | 5.81 → 5.81 | yes |

Skips, the same twelve before and after:

- `uat-harness`, 3 bare `# SKIP`: "One authentic cold read supplies caller artifact/environment/read preparation without another physical decode", "Terminal-null admitted Run retains genuine C2 partial evidence and refuses foreign, invalid or fabricated observations", "Owned XML acquisition consumes authentic C2 reports outside the application without earning full UAT".
- `t287-default-library`, 3: `ABI5_PLANNING_PROJECTION_CAPTURE` unset, `ABI5_NATIVE_OBSERVATION_CAPTURE` unset, `ABI5_DEFAULT_LIBRARY_LIVE` not `1`.
- `t287-governance-covered-source-use`, 6:
  - `ABG_GOVERNANCE_COVERED_PROOF_ROOT` unset;
  - `ABG_GOVERNANCE_COVERED_DECLARATION_PAIR` unset;
  - `ABG_GOVERNANCE_COVERED_C2_MATERIAL_SELECTORS` unset;
  - `ABG_GOVERNANCE_COVERED_FIXTURE` unset (three tests).

No red occurred, so no rerun was needed. The highest 1-minute load across the lane readings was 12.06. The highest across all readings was 15.65, read before the first prepare. The one `npm run build` ran at 5.62 → 7.88 (31 s, rc 0), and the tree was clean by path afterwards.
