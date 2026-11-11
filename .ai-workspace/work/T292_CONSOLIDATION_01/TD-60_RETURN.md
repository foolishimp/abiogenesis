# TD-60 Return: one gate catalogue for the 236 skips (first slice)

Writer: Claude Opus 5.5. Branch `claude/td60-gate-catalogue` from
`72ac59366`, worktree `/private/tmp/abg-td60`. Change class:
realization_refactor, test side only. No push, no tag. Here `T` is
`build_tenants/abiogenesis/typescript`.

**Status: the catalogue is complete. 82 of the 236 suite2 skips now run with
the root set. That is 73 class A skips (69 pass, 4 fail) plus the 9
converted class C skips (all pass). 41 skips sit in 22 rows that fail with
their input present: 4 in class A lanes and 37 in unconverted class C lanes.
74 rows (91 skips) have no usable input.**

Nothing under `T/code`, `T/contracts` or `T/scripts` changed, and neither
did `T/package.json` or `T/product-toolchain-manifest.json`. `git diff --stat
72ac59366` over those paths is empty. The build after the catalogue was added
leaves no tracked change.

| Commit | Content |
| --- | --- |
| `b90eb6ad8` | catalogue `T/test_env/support/evidence-gates.json`; Return skeleton |
| `72d96f97b` | `evidenceGate(name)` and `verifyEvidenceGateCatalogue()` in `evidence-root.mjs` |
| `74cde60cb` | GC03 second skip (ruling 5) |
| `c291125a2` | conversion: `t287-governance-covered-source-use` (3 skips) |
| `97570e30c` | conversion: `t287-stdo-proof-entry` (3 skips) |
| `d90d08fb2` | conversion: `t287-native-runtime-gate` (1 skip) |
| `e21f76af1` | conversion: `t287-qualification-producer-acquisition-reuse` (1 skip) |
| `37567db1c` | conversion: `w2-steel-single-start-closure` (1 skip) |
| `a541ebd86` | catalogue: observed consolidation root-set run |
| this commit | this Return |

## 1. The catalogue and the owner

`T/test_env/support/evidence-gates.json` holds 137 rows. Each row has its
gate name, class, gating `variables`, the `alsoReads` the case body needs,
its cases (file, titles, suite2 skip count), the input in words, the root
`inputs` (path, sha256, bytes) when the input is retained under the root,
the producer, the recorded values with their records, the observed result
and its status. Converted rows carry `conversion: done` and list their
`formerVariables`. Rows for ruling-7 files carry `ruling7: true`.

Every one of the 236 suite2 skips is assigned to exactly one row, and each of
the 167 candidate gate variables (145 in suite2 skip conditions, 22 read only
in the current tree) appears in a row. A scratch generator builds the file
and fails on an unplaced skip or variable.

`evidence-root.mjs` keeps `evidenceInput` unchanged and adds two functions:

- `evidenceGate(name)` returns `{kind: 'present', gate, inputs: {<name>:
  {path, bytes}}}`, each input read through `evidenceInput`. Otherwise it
  returns `{kind: 'absent', reason}`, and the reason starts with `evidence
  gate <name>:`. A row whose status is not `runs_with_root` is absent with
  its status. An unknown name throws.
- `verifyEvidenceGateCatalogue()` checks every pinned input of every row.
  It needs the root set. Run it from `T`:
  `ABI5_EVIDENCE_ROOT=<root> node -e "import('./test_env/support/evidence-root.mjs').then(m=>console.log(m.verifyEvidenceGateCatalogue()))"`.
  At the close it reports `{gates: 137, rowsWithInputs: 21, inputsChecked:
  26}`.

Counts per class:

| Class | Rows | Suite2 skips |
| --- | --- | --- |
| A. Evidence root only | 14 | 73 |
| B. Live provider or opt-in local run | 20 | 19 |
| C. Private variable naming a retained input | 99 | 141 |
| D. Unsatisfiable as recorded | 4 | 3 |
| Total | 137 | 236 |

Counts per class and status:

| Class | Status | Rows | Suite2 skips |
| --- | --- | --- | --- |
| A | runs with root | 11 | 69 |
| A | failing with input present | 3 | 4 |
| B | needs live provider | 7 | 8 |
| B | opt-in run | 13 | 11 |
| C | runs with root (converted) | 6 | 9 |
| C | failing with input present | 19 | 37 |
| C | input not found | 70 | 88 |
| C | input present, needs output root | 1 | 1 |
| C | input present, writes under root | 1 | 2 |
| C | retired since the suite base | 2 | 4 |
| D | input not found | 4 | 3 |

Class D has one row more than its suite2 skips because the GC03 row has no
suite2 skip: at the base that case failed (TD-59).

These counts reconcile with the review as follows. The 145 variables in
suite2 skip conditions match the review's 145. My search finds a recorded
value for 85 of them (review: 51) and an existing recorded path under the
root for 59 (review: 39). My pattern also matches escaped JSON and values
inside recorded command strings, and I did not repeat the review's exclusion
of copied review subjects. Across all 167 candidates, 104 have a recorded
value, 63 have none, and 67 have an existing recorded root path.

## 2. Variables with a recorded, existing input under the evidence root

The search covers `*.md`, `*.json`, `*.sh`, `*.log` and `*.txt` under
`work`, `comments` and `tickets` of the evidence root. It matches the shell
form `VAR=value` and the JSON form `"VAR": "value"`, escaped or not. 67
variables have at least one recorded path that exists under the root:

| Variable | Existing root paths | Rows (status) |
| --- | --- | --- |
| `ABG_GOVERNANCE_COVERED_DECLARATION_PAIR` | 1 | `governance-declaration-pair` (runs with root) |
| `ABG_GOVERNANCE_COVERED_FIXTURE` | 1 | `governance-covered-fixture` (runs with root); `governance-covered-fixture-completed-work` (failing with input present) |
| `ABG_GOVERNANCE_COVERED_PROOF_ROOT` | 1 | `governance-covered-proof-root` (opt in run); `governance-c2-material-selectors` (input not found) |
| `ABG_QUALIFICATION_SOURCE_ROOT` | 1 | `qualification-source-release-roots` (input not found) |
| `ABG_QUALIFICATION_STAGE_FIXTURES` | 1 | `qualification-stage-fixtures` (failing with input present) |
| `ABG_T287_C2_PROOF_CONFIG` | 6 | `t287-c2-proof-config` (opt in run) |
| `ABG_TS_CLAUDE_COMMAND` | 10 | `declared-testing-live-command` (needs live provider) |
| `ABI207_NATIVE_IDENTITY` | 1 | `abi207-native-identity` (failing with input present) |
| `ABI207_PROOF_ROOT` | 2 | `abi232-native-identity` (failing with input present); `abi207-native-identity` (failing with input present) |
| `ABI232_ISOLATED_MANIFEST` | 1 | `abi232-native-identity` (failing with input present) |
| `ABI232_NATIVE_IDENTITY` | 1 | `abi232-native-identity` (failing with input present) |
| `ABI5_CONFORMANCE_METADATA` | 2 | `conformance-owner-reuse` (input not found) |
| `ABI5_CONFORMANCE_PROOF_ROOT` | 4 | `conformance-owner-reuse` (input not found) |
| `ABI5_CONTEXT_STDO_CONFIGURATION` | 1 | `context-stdo-configuration` (input not found) |
| `ABI5_D1_ASSESSOR_DOMAIN_EVIDENCE` | 1 | `d1-assessor-domain` (input not found) |
| `ABI5_D1_BUILD_ROOT` | 3 | `d1-retained-native-basis` (input not found) |
| `ABI5_D1_EVIDENCE_ROOT` | 6 | `d1-installed-transfer` (input not found) |
| `ABI5_D1_NATIVE_PROJECTION_EVIDENCE` | 1 | `d1-native-projection-evidence` (failing with input present) |
| `ABI5_D1_POSITIVE_PROOF` | 1 | `d1-positive-proof` (input not found) |
| `ABI5_D1_RETAINED_NATIVE_BASIS` | 1 | `d1-retained-native-basis` (input not found) |
| `ABI5_D1_RUN_ROOT` | 2 | `d1-installed-transfer` (input not found) |
| `ABI5_D2_FRAME_RUN_ROOT` | 4 | `d2-frame-installed-run` (opt in run) |
| `ABI5_DECLARATION_BASELINE_MODULE` | 1 | `declaration-baseline-module` (input present needs output root) |
| `ABI5_DECLARATION_PROOF_ROOT` | 1 | `declaration-baseline-module` (input present needs output root) |
| `ABI5_DESIGN_CONTEXT_OBSERVATIONS` | 1 | `design-context` (input not found) |
| `ABI5_ENV_RUN_ROOT` | 4 | `stdo-proof-entry-run-nine` (runs with root) |
| `ABI5_ENV_SOURCE_EVIDENCE` | 1 | `stdo-proof-entry-install-host` (input not found) |
| `ABI5_F11_CARRIER_FULL_FIXTURE` | 2 | `f11-carrier-full-fixture` (failing with input present) |
| `ABI5_F11_FP_ASSESSMENT_PACKET` | 1 | `f11-fp-assessment-packet` (failing with input present) |
| `ABI5_F11_FP_BASELINE_TENANT` | 1 | `f11-fp-assessment-packet` (failing with input present) |
| `ABI5_FRAME_ENTRY_ROOT` | 1 | `frame-native-controlled-run` (opt in run) |
| `ABI5_FRAME_PACKAGE_ROOT` | 1 | `frame-native-controlled-run` (opt in run) |
| `ABI5_FRAME_PROOF_ROOT` | 2 | `frame-native-controlled-run` (opt in run) |
| `ABI5_HELD_PREFIX_NATIVE_FIXTURE` | 1 | `held-prefix-native-fixture` (failing with input present) |
| `ABI5_INSTALLED_CONSERVATION_ARCHIVE` | 3 | `installed-qualification-conservation` (opt in run) |
| `ABI5_INSTALLED_CONSERVATION_NODE` | 1 | `installed-qualification-conservation` (opt in run) |
| `ABI5_INSTALLED_CONSERVATION_PACKAGE_ROOT` | 3 | `installed-qualification-conservation` (opt in run) |
| `ABI5_INSTALLED_CONSERVATION_ROOT` | 8 | `installed-qualification-conservation` (opt in run) |
| `ABI5_LIVENESS_CUT_HISTORY` | 1 | `liveness-cut-history` (input not found) |
| `ABI5_NATIVE_D2_SELECTOR_PROMPT` | 1 | `native-d2-selector-prompt` (failing with input present) |
| `ABI5_NATIVE_OBSERVATION_CAPTURE` | 1 | `native-observation-capture` (failing with input present) |
| `ABI5_OWNED_JUDGMENT_FIXTURE` | 1 | `owned-judgment-fixture` (failing with input present) |
| `ABI5_OWNED_PROOF_DECLARATION` | 1 | `owned-proof-declaration` (runs with root) |
| `ABI5_OWNER_HISTORY` | 1 | `owner-history-logical-digest` (failing with input present); `owner-history-family` (input not found) |
| `ABI5_PARENT_ALIAS_BINDINGS` | 2 | `parent-alias-bindings` (failing with input present) |
| `ABI5_PREDECESSOR_PRIOR_ROOT` | 1 | `predecessor-context` (input not found) |
| `ABI5_PREDECESSOR_PROOF_ROOT` | 1 | `predecessor-context` (input not found) |
| `ABI5_PREFIX_REUSE_OBSERVATIONS` | 1 | `prefix-reuse-observations-frame` (failing with input present); `prefix-reuse-observations-frame-predecessor` (input not found); `prefix-reuse-observations-ec` (input not found); `prefix-reuse-observations-ordered` (failing with input present); `prefix-reuse-observations-conservation` (failing with input present) |
| `ABI5_PRODUCER_CONTEXT_FIXTURE` | 1 | `producer-acquisition-reuse` (runs with root) |
| `ABI5_PRODUCER_HISTORY_FIXTURE` | 1 | `producer-acquisition-reuse` (runs with root) |
| `ABI5_PRODUCER_OWNER_COPY_FIXTURE` | 1 | `producer-acquisition-reuse` (runs with root) |
| `ABI5_PRODUCER_OWNER_FIXTURE` | 2 | `producer-acquisition-reuse` (runs with root) |
| `ABI5_PRODUCER_OWNER_SOURCE_FIXTURE` | 1 | `producer-acquisition-reuse` (runs with root) |
| `ABI5_QUAL_RAW_BASELINE_TENANT` | 1 | `qual-raw-contract-preimage` (failing with input present) |
| `ABI5_QUAL_RAW_BODY` | 1 | `qual-raw-contract-preimage` (failing with input present) |
| `ABI5_QUAL_RAW_COORDINATES` | 1 | `qual-raw-contract-preimage` (failing with input present) |
| `ABI5_QUAL_RAW_INPUT_PACKET` | 1 | `qual-raw-contract-preimage` (failing with input present) |
| `ABI5_QUAL_RAW_REQUEST` | 1 | `qual-raw-contract-preimage` (failing with input present) |
| `ABI5_RECURSIVE_SELECTION_EVIDENCE_ROOT` | 1 | `recursive-selection-live` (needs live provider) |
| `ABI5_S02_RECURSION_FIXTURE` | 1 | `s02-recursion-fixture` (failing with input present) |
| `ABI5_S03_EVIDENCE_ROOT` | 1 | `s03-evidence-directory` (input present writes under root) |
| `ABI5_SELECTED_CLOSURE_HISTORY_FIXTURE` | 1 | `selected-execution-closure` (input not found) |
| `ABI5_STEEL02_RESOLVER_PROOF_PATH` | 1 | `steel02-resolver-proof` (failing with input present) |
| `ABI5_STEEL03_RETAINED_CALL_PATH` | 1 | `steel03-retained-call` (runs with root) |
| `ABI5_TESTING_INPUT_ROOT` | 1 | `testing-input-root` (retired since suite base) |
| `ABI5_WAVE1_FROZEN_ARTIFACT_PATH` | 34 | `steel02-consumer-declaration-installed` (opt in run); `steel03-single-start-installed` (opt in run); `steel04-serial-branch-installed` (opt in run); `d1-installed-transfer` (input not found) |
| `ABI5_WAVE1_FROZEN_INSTALL_HOST` | 32 | `stdo-proof-entry-install-host` (input not found); `d1-positive-proof` (input not found); `d1-installed-transfer` (input not found) |

## 3. Conversions

Method. Before converting a lane, I ran it unconverted with the root unset
and its private variables set to the recorded root paths. A preload traced
every read and refused every write under the evidence root; no write was
attempted. A lane that passed was converted and then run with the root unset
and set. A lane that failed was left unconverted, so nothing was reverted.

| File | Variables removed | Suite2 skips | Run now with the root set | Result |
| --- | --- | --- | --- | --- |
| `t287-governance-covered-source-use` | `ABG_GOVERNANCE_COVERED_DECLARATION_PAIR`; `ABG_GOVERNANCE_COVERED_FIXTURE` from 2 of its 3 cases | 6 | 3 | pass |
| `t287-stdo-proof-entry` | `ABI5_ENV_RUN_ROOT` | 5 | 3 | pass |
| `t287-native-runtime-gate` | `ABI5_OWNED_PROOF_DECLARATION` | 1 | 1 | pass |
| `t287-qualification-producer-acquisition-reuse` | `ABI5_PRODUCER_HISTORY_FIXTURE`, `_CONTEXT_FIXTURE`, `_OWNER_FIXTURE`, `_OWNER_SOURCE_FIXTURE`, `_OWNER_COPY_FIXTURE` | 1 | 1 (3 cases) | pass |
| `w2-steel-single-start-closure` | `ABI5_STEEL03_RETAINED_CALL_PATH` | 8 | 1 | pass |

Sweep of the converted files (pass / skip / fail). "Before" is the
unconverted file at `72ac59366`; suite2 gives the same unset picture at
`34aafb2c6`.

| File | Before, unset | Before, set | After, unset | After, set |
| --- | --- | --- | --- | --- |
| `t287-governance-covered-source-use` | 3 / 6 / 0 | 3 / 6 / 0 | 3 / 6 / 0 | 6 / 3 / 0 |
| `t287-stdo-proof-entry` | 0 / 5 / 0 | 0 / 5 / 0 | 0 / 5 / 0 | 3 / 2 / 0 |
| `t287-native-runtime-gate` | 6 / 1 / 0 | 6 / 1 / 0 | 6 / 1 / 0 | 7 / 0 / 0 |
| `t287-qualification-producer-acquisition-reuse` | 0 / 1 / 0 | 0 / 1 / 0 | 0 / 1 / 0 | 3 / 0 / 0 |
| `w2-steel-single-start-closure` | 0 / 8 / 0 | 0 / 8 / 0 | 0 / 8 / 0 | 1 / 7 / 0 |

No case that passed before fails after. Each converted skip reason begins
with `evidence gate <row>:`. No file under `T/test_env` reads a removed
variable; `rg` finds the names only in the catalogue's `formerVariables` and
`recorded` fields.

Points per conversion:

- `t287-governance-covered-source-use`: the completed-work case fails over
  the same fixture bytes, so it keeps `ABG_GOVERNANCE_COVERED_FIXTURE` under
  its own row (`governance-covered-fixture-completed-work`). The split is
  per case.
- `t287-stdo-proof-entry`: three cases read only run nine and now gate on
  the catalogue. The SDK case and the source-evidence case keep
  `ABI5_WAVE1_FROZEN_INSTALL_HOST`, because the recorded install host
  (`comments/codex/20260915_ABG5_RC7_TASK_1A/install`) no longer holds the
  installed package. The pairing of install host, run root and source
  evidence comes from
  `comments/codex/20260915_ABG5_RC7_SOURCE_CONTINUATION/continuation-plan.json`.
- `t287-qualification-producer-acquisition-reuse`: the trace shows 476 root
  reads. The five catalogued inputs name all of them (archive, materialized
  package, pinned sources), and the lane checks each one against its own
  pin.

## 4. Lanes failing with their input present

The readings come from the failure code and message. I did not trace them
further. No lane was retired, weakened or repaired.

Class A lanes. These gate on `evidenceInput`, so they run, and fail,
whenever the root is set:

| Row | File and case | Failure | Reading |
| --- | --- | --- | --- |
| `d2-continuation-09-store-cross-cut-reads` | `t287-cross-cut-public-read`: "different-cut native Definition reads…" | read-count assertion at :121 (bounded chunks, each body once by location) | stale operational expectation, not decided |
| same row | `t287-cross-cut-public-read`: "late child proof preserves only the exact acquired prefix…" | after one byte of the scratch copy changes, a prepared historical read projects (`abg_project_read_projection`) where the case expects `abg_project_read_refusal` (:207) | apparent Product defect, unless the held-read design now lets a prepared read keep its acquired facts; owner ruling needed |
| `d2-continuation-09-store-borrowed-ancestry` | `t287-historical-source-resource`: "actual R10 ancestry, declaration and leaf proof owners…" | "exact existing basis body is borrowed" (:72) | stale test or regression, not decided |
| `s01-program-selection-store-malformed-liveness` | `r10-projection-contracts`: "a prefix holding a malformed liveness event…" | expected refusal `invalid_history`, actual undefined (:111) | the case injects rows through a private-owner stub of `./event_store.js`. Either the owner no longer reads its rows from that import (stale test), or it admits a malformed liveness event (apparent Product defect). Not decided |

Unconverted class C lanes:

| Row | File | Skips | Failure | Reading |
| --- | --- | --- | --- | --- |
| `governance-covered-fixture-completed-work` | `t287-governance-covered-source-use` | 1 | CCall `c-call://covered-source` violates the atomic open/fibre pair or exact phase cardinality (`replay.js` `projectCCallPhase`) | not decided: the other two cases pass over the same bytes |
| `steel02-resolver-proof` | `m5-c-algebra-validation` | 3 | `exact_prefix_workspace_environment_refusal`, `artifact_truth_invalid`, `event_envelope_invalid` | superseded cut |
| `abi232-native-identity` | `t287-installed-dependency-lock` | 1 | `product_verification_refusal` | superseded cut (rc.1 artifact) |
| `abi207-native-identity` | `t287-installed-dependency-lock` | 1 | `product_verification_refusal` | superseded cut (rc.1 artifact) |
| `d1-native-projection-evidence` | `t287-d1-semantic-stage` | 1 | "ABG durable prefix coordinate is invalid" | superseded cut (event contract digest) |
| `prefix-reuse-observations-frame` | `t287-native-frame-observation` | 2 | the same, code `event_contract_digest_mismatch` | superseded cut |
| `f11-carrier-full-fixture` | `t287-qualification-carrier-resource` | 7 | "qualification resource material/scope correspondence differs" (both recorded fixtures) | superseded cut |
| `f11-fp-assessment-packet` | `t287-qualification-fp-proof-delivery` | 1 | the same message | superseded cut |
| `native-d2-selector-prompt` | `t288-instruction-assembly-owner` | 1 | `native_instruction_assembly_refusal` | superseded cut |
| `native-observation-capture` | `t287-default-library` | 1 | SyntaxError: the vm-linked module expects export `governanceVerdict` from `../product/default_library.js` | stale test |
| `owner-history-logical-digest` | `t288-logical-prefix-digest` | 2 | "unknown native profile" | superseded cut |
| `qual-raw-contract-preimage` | `t287-qualification-raw-contract-preimage` | 1 | deepEqual "F_D/F_H and unrelated graph bodies remain exact" | superseded cut |
| `s02-recursion-fixture` | `t287-deferred-application-restoration` | 2 | `event_store_reopen_refusal` | superseded cut |
| `parent-alias-bindings` | `t287-qualification-parent-alias` | 1 | the binding's own pin fails: 27727 !== 22485 bytes | stale binding: both recorded bindings pin the main checkout's tracked `test_env/support/malformed-gtl-native-fixture.mjs` at 22,485 bytes; it is now 27,727 |
| `qualification-stage-fixtures` | `t287-qualification-law` | 3 | the retainedRC1 staging case fails; the selectedRC2 and crossed-release cases pass | superseded cut for the failing case; not convertible anyway, because the fixtures name STDO release directories outside the root |

The four ruling-7 rows that fail are listed in section 7.

## 5. Gates with no usable input

74 rows (91 suite2 skips) have status `input not found`. For each one the
catalogue says what the input is. The groups:

**A producer exists without a live provider.** Either the input exists
outside the root, so a copy under the root would make it a root input, or a
retained artifact under the root could be installed. Both are Executive
choices; I did neither.

- Exists outside the root:
  - `context-stdo-configuration` (`t287-management-context`): the ODD
    declarations module, in odd_glc.
  - `d1-retained-native-basis` and `d1-installed-transfer`
    (`t287-d1-requirement-handoff`): the D1 source fixture, in odd_glc.
  - `native-execution-retained-log` (`t287-native-worksite-execution`, 2
    skips) and `owned-proof-native-request` (`t287-owned-native-proof`):
    in odd_glc.
  - `conformance-owner-reuse` (`t287-conformance-owner-reuse`): the
    predecessor work tree, under `~/Library/Application
    Support/ABIogenesis/candidates`.
  - `prefix-reuse-observations-frame-predecessor`
    (`t287-native-frame-observation`, 2 skips) and the ruling-7 row
    `prefix-reuse-observations-ec`: a predecessor clone under
    `~/Library/Application Support/ABIogenesis/evidence`.
  - `qualification-source-release-roots` (`t287-qualification-law`): the
    checkout and `~/Library/Application Support/STDO/releases/v2.5.1-rc.1`.
  - `selected-execution-closure` (`t287-selected-execution-closure`): the
    evidence is in odd_glc and the installed root is the main checkout.
  - `rc5-route-sample` (`t287-event-body-encoding`): the recorded path is
    gone. A same-named `CAPTURED_ROUTE_SAMPLE.json` is retained under the
    root at `work/T287_RELEASE_RESUMPTION_01/rc5-performance-01/f4-01/`, but
    no record names it as this variable's value.
  - The four `uat-*` rows (`uat/continuation.test.mjs`, outside the suite
    glob): unit roots under the main checkout's `test_env/test_runs`.
- An install of a retained artifact:
  - `stdo-proof-entry-install-host` (2 skips): the RC7 task 1A artifact is
    under the root.
  - `d1-positive-proof`: a D1 native-implementation artifact; the case also
    writes `ABI5_D1_NEGATIVE_ROOT`.
  - `predecessor-context` (3 skips): the RC7 combined-qualification
    artifact.

  A fresh install is a new install, not the retained one.

**A live or native run.** Every recorded value is gone, and the input is the
output of a native Run:

- `generic-job-revision-prefix` and `generic-job-revision-evidence-prefix`
  (class D, `t287-generic-job-revision`);
- `static-closure-frozen81` (class D, `t287-static-declaration-closure`);
- `preparation-resolve-call` (`t287-w2-05-static-binding-algebra`, 2
  skips);
- `selected-action-owner-subject` (`t287-selected-action-authority`).

**Recorded value gone, producer not established.**

- `d1-assessor-domain` (`t287-d1-semantic-stage`) and `design-context`
  (`t287-stdo-run-environment`): the observations exist under the root, but
  the predecessor packages were `/tmp` roots and no record names their
  source commit.
- The ruling-7 row `liveness-cut-history`: its predecessor was a
  main-checkout `test_runs` directory that is gone.

**Nothing recorded.** 47 rows (63 skips) have no recorded path value for
their gating variables, or for a companion the case needs:

- `steel-basic-cli-c2` (6), `steel-basic-cli-projection`,
  `steel-basic-cli-source-replay` (2), `steel-consumer-authority`;
- `t287-authenticated-owner-values`;
- `t287-authenticated-owner-family` (companion `ABI5_OWNER_PREDECESSOR`);
- `t287-default-library` (planning projection),
  `t287-environment-projection-conservation`,
  `t287-event-calculus-owner-continuation`,
  `t287-exact-prefix-projection-reuse`;
- the generic-job intake, meaning (2), parent-audit, parent-foldback and
  read-dependency lanes;
- `t287-governance-covered-source-use` (C2 selectors),
  `t287-management-stream-drain` (4), `t287-native-assembly-retained-input`,
  `t287-native-event-time` (3), `t287-native-frame-observation` (frame
  history), `t287-native-owner-reuse` (3), `t287-native-semantic-evidence`,
  `t287-native-work-reacquisition-normalization`,
  `t287-native-work-reacquisition` (3), `t287-native-worksite-execution`
  (source-ready catalog), `t287-native-workspace-work`;
- `t287-public-terminal-projection` (4), `t287-reacquisition-root-contract`,
  `t287-release-publication`, `t287-retained-installed-consumer`,
  `t287-route-reconstruction` (2), `t287-selected-action`,
  `t287-stdo-environment-citation` (prior events),
  `t288-instruction-assembly-owner` (D07 scratch);
- seven `w2-steel-single-start-closure` cases, `w2-steel-single-start`;
- the ruling-7 row `historical-liveness-log`.

Most of these inputs are retained native Run outputs, so regenerating them
would need a native run.

The GC03 row (`gc03-native-profile-basis`, class D, ruling 5) stands apart.
It needs a GC03 release that defines a native profile for the Product
definition's STDO basis, `stdo://releases/v3.0.4/`. The case now skips with
a reason naming both bases and the row.

## 6. Output-root variables

These were left unchanged (ruling 6).

Read and confirmed during this package:

- `ABG_GOVERNANCE_COVERED_PROOF_ROOT`;
- `ABI5_DECLARATION_PROOF_ROOT` (writes `focused.json`; the
  baseline-module case passes with a fresh directory);
- the eight `ABI5_STEEL03_*_PROOF_PATH` variables (C0_WITNESS, CLOSURE,
  CONTINUATION, FANOUT, OUTPUT, OWNER, RESOURCE, SOURCE_REPLAY);
- `ABI5_D1_NEGATIVE_ROOT` and `ABI5_D1_RETAINED_NATIVE_PROOF`;
- `ABI5_S03_EVIDENCE_ROOT` (input and output: Phase A writes
  `pure-preflight.json` into it);
- `ABI207_PROOF_ROOT`.

From a static scan, where the variable or a direct alias appears on a line
with a file-write call (not each one read in full):

- `ABG_C0_PROOF_ROOT`, `ABG_RESULT_LINEAGE_TYPE_PROOF_DIR`,
  `ABG_T287_HELPER_FACTS`, `ABG_U1_EVIDENCE_DIR`;
- `ABI5_AMENDMENT_ACTOR_LOG`, `ABI5_AMENDMENT_WITNESS_DUMP`,
  `ABI5_AMENDMENT_WITNESS_EVIDENCE_ROOT`;
- `ABI5_CAUSATION_EVIDENCE_ROOT`, `ABI5_CONFORMANCE_PROOF_ROOT`,
  `ABI5_CONTEXT_PROOF_ROOT`, `ABI5_D1_EVIDENCE_ROOT`, `ABI5_D1_RUN_ROOT`,
  `ABI5_D2_FRAME_RUN_ROOT`;
- `ABI5_DEFAULT_LIBRARY_EVIDENCE_ROOT`, `ABI5_EVENT_TIME_PROOF_ROOT`,
  `ABI5_EXACT_INTENT_EVIDENCE_ROOT`;
- `ABI5_F11_CARRIER_REPORT`, `ABI5_F11_FP_PROOF_REPORT`,
  `ABI5_F16_PROOF_ROOT`, `ABI5_FRAME_PROOF_ROOT`;
- `ABI5_GENERIC_JOB_EVIDENCE_ROOT`, `ABI5_HISTORICAL_SOURCE_EVIDENCE`,
  `ABI5_INSTALL_BODY_PROOF_ROOT`, `ABI5_INSTALLED_CONSERVATION_ROOT`;
- `ABI5_NATIVE_MATERIAL_SCRATCH`, `ABI5_NATIVE_SELECTION_EVIDENCE_ROOT`,
  `ABI5_NATIVE_WORK_OWNER_PROOF_PATH`;
- `ABI5_PARENT_ALIAS_REPORT`, `ABI5_PENDING_TESTING_EVIDENCE_ROOT`,
  `ABI5_PREDECESSOR_PROOF_ROOT`, `ABI5_PREFIX_PROOF_ROOT`,
  `ABI5_QUAL_RAW_REPORT`;
- `ABI5_RECURSIVE_SELECTION_EVIDENCE_ROOT`, `ABI5_RELEASE_PROOF_ROOT`,
  `ABI5_RESULT_LINEAGE_REPORT`, `ABI5_RETAINED_SOURCE_EVIDENCE_ROOT`;
- `ABI5_REVIEW_ACTOR_LOG`, `ABI5_REVIEW_ACTOR_TOUCH`;
- `ABI5_RP2_BEHAVIOR_EVIDENCE_ROOT`, `ABI5_RP2_CORRECTION_EVIDENCE_ROOT`,
  `ABI5_RP2_FIBRE_EVIDENCE_ROOT`;
- `ABI5_SCRIPTED_ACTOR_LOG`, `ABI5_SCRIPTED_ACTOR_PROMPTS`,
  `ABI5_SCRIPTED_ACTOR_W_OUTSIDE_R`;
- `ABI5_SELECTED_ACTION_EVIDENCE_ROOT`, `ABI5_SELECTION_EVIDENCE_ROOT`;
- `ABI5_STEEL02_EVIDENCE_PATH`, `ABI5_STEEL03_EVIDENCE_PATH`,
  `ABI5_STEEL03_RUN_ROOT`, `ABI5_STEEL04_EVIDENCE_PATH`,
  `ABI5_STEEL04_RUN_ROOT`;
- `ABI5_STEEL_PROJECTION_EVIDENCE_PATH`, `ABI5_STEEL_PUBLIC_EVIDENCE_PATH`,
  `ABI5_STEEL_REPLAY_EVIDENCE_PATH`;
- `ABI5_STOP_ACTOR_LOG`, `ABI5_TEST_EVIDENCE_DIR`, `ABI5_UAT_UNIT_ROOT`.

## 7. Ruling-7 rows

These files were not edited. Each has rows only. I observed them by running
the files read-only, and wrote nothing under the root.

| File | Row | Status | Observation |
| --- | --- | --- | --- |
| `t287-single-address-space-consolidation` | `single-address-space-native-02` (A) | runs with root | root set: 12/12 pass (525 s) |
| `m5-event-calculus-runtime` | `prefix-reuse-observations-ec` | input not found | stops on "explicit frozen predecessor required" |
| `t287-ordered-reconstruction` | `prefix-reuse-observations-ordered` | failing with input present | "ABG durable prefix coordinate is invalid" |
| `t287-ordered-reconstruction` | `historical-liveness-log` | input not found | nothing recorded |
| `t287-ordered-reconstruction` | `liveness-cut-history` | input not found | not run; the recorded predecessor is a main-checkout `test_runs` directory that is gone |
| `t287-reconstruction-conservation` | `prefix-reuse-observations-conservation` | failing with input present | one "durable prefix coordinate is invalid"; one ENOENT on a deleted temp log the record names |
| `t287-held-prefix` | `held-prefix-native-fixture` | failing with input present | 5 cases fail; first failure is the read-count assertion 45 !== 0 (:31) |
| `t287-held-prefix` | `owned-judgment-fixture` | failing with input present | assertion 1 !== 0 |

`generic-input-retention`, `t287-undispatched-diagnostic`,
`m5-fresh-process-reconstruction`, `t287-retry-run-prefix`,
`m5-retry-lifecycle-authority`, `t287-r4-aba-retry`,
`t287-r6-retry-success-exit` and the `t292-*` files have no gate, so they
have no rows.

## 8. Inventory members whose bytes changed

`T/test_env/qualification/inventory.json` and the recipe are unchanged. Six
members changed bytes:

| Member | Bytes at base | Bytes now | Inventory digest at base |
| --- | --- | --- | --- |
| `test_env/support/evidence-root.mjs` | 2,031 | 5,153 | matched |
| `test_env/tests/t287-governance-covered-source-use.test.mjs` | 53,135 | 53,853 | matched |
| `test_env/tests/t287-native-runtime-gate.test.mjs` | 14,816 | 14,998 | matched |
| `test_env/tests/t287-qualification-producer-acquisition-reuse.test.mjs` | 21,136 | 20,877 | already different at base |
| `test_env/tests/t287-stdo-proof-entry.test.mjs` | 5,167 | 5,210 | matched |
| `test_env/tests/w2-steel-single-start-closure.test.mjs` | 46,928 | 47,171 | matched |

`t287-governed-context.test.mjs` changed but is not an inventory member. The
new `test_env/support/evidence-gates.json` is not a member. The inventory
claims `complete_claim` coverage of the tenant root, and `evidence-root.mjs`
now reads this file.

## 9. Deviations

- **Status values beyond the brief's four.** Four more statuses mark cases
  the four do not fit. Each is defined in the catalogue's `statuses`:
  - `opt_in_run`: class B with no missing input, such as a mode selector, a
    packed-candidate run or an output directory.
  - `input_present_needs_output_root`: the declaration baseline module.
  - `input_present_writes_under_root`: the S03 evidence directory.
  - `retired_since_suite_base`: `ABI5_TESTING_INPUT_ROOT` and
    `ABI5_ENV_PROOF_ROOT`, which TD-31 removed after the suite base.
- **Pre-check instead of convert-then-revert.** For a lane that failed with
  its input present, the traced pre-check stands in for converting and
  reverting. The observation is the same.
- **Per-case splits.** Rows split per case where the cases of one gate
  differ in outcome: the governance fixture, `t287-stdo-proof-entry`, the
  class A D2 continuation-09 and S01 stores, and frame-observation prefix
  reuse. Two rows can therefore pin the same input.
- **No-input groups.** Section 5 has four groups, not three. "Exists
  outside the root" and "deleted temporary build" did not fit "a producer
  exists / a live run / nothing recorded" without overstating.
- **GC03 row class.** It is class D: no installed GC03 release defines a
  profile for the current basis. Its skip reason begins `gate
  gc03-native-profile-basis:`, not `evidence gate`, because it is not an
  evidence-root input.
- **Ruling-7 runs.** I ran the ruling-7 files read-only so that their row
  statuses are observed, not inferred.

## 10. Residuals

- Four class A cases fail whenever the root is set (section 4). The
  hand-run suite does not set the root, so suite2 shows them as skips. They need an owner reading; the changed-bytes case in
  `t287-cross-cut-public-read` reads as a Product defect unless the
  held-read design accounts for it.
- `evidence-gates.json` is new and is not an inventory member, while
  `evidence-root.mjs`, a member, reads it (section 8).
- Records under the root name further root files by absolute path. Examples
  are the producer lane's owner-copy record and the consolidation records.
  An evidence root at another location satisfies the catalogue pins, but
  those lanes would still read the original absolute paths.
- The catalogue is 230 KB, mostly recorded values with their records,
  capped at six per variable. A scratch generator produced it; later edits
  are by hand.
- Class A lanes keep calling `evidenceInput` directly (ruling 2). Their
  rows describe them, but their skip reasons do not name the row.
