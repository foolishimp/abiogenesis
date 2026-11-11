# TD-60 Return: one gate catalogue for the 236 skips (first slice)

Writer: Claude Opus 5.5. Branch `claude/td60-gate-catalogue` from
`72ac59366`, worktree `/private/tmp/abg-td60`. Change class:
realization_refactor, test side only. No push, no tag. Here `T` is
`build_tenants/abiogenesis/typescript`.

**Status: skeleton. The catalogue is committed; the owner function, the GC03
skip and the conversions follow, and this Return is completed last.**

## 1. The catalogue

`T/test_env/support/evidence-gates.json` holds one row per gate: 137 rows.
Every one of the 236 suite2 skips (base `34aafb2c6`, root unset) is assigned
to exactly one row, and every one of the 167 candidate gate variables sits in
a row's `variables` (the skip condition) or `alsoReads` (inputs the case body
reads). The generator fails when a skip or a variable is unplaced.

Counts per class (rows, suite2 skips):

| Class | Rows | Suite2 skips |
| --- | --- | --- |
| A. Evidence root only | 14 | 73 |
| B. Live provider or opt-in local run | 21 | 19 |
| C. Private variable naming a retained input | 99 | 141 |
| D. Unsatisfiable as recorded | 3 | 3 |
| Total | 137 | 236 |

Counts per class and status (rows / suite2 skips):

| Class | Runs with root | Failing with input present | Input not found | Needs live provider | Opt-in run | Other |
| --- | --- | --- | --- | --- | --- | --- |
| A | 11 / 69 | 3 / 4 | | | | |
| B | | | 1 / 0 (GC03, ruling 5) | 7 / 8 | 13 / 11 | |
| C | 6 / 9 (conversion pending) | 19 / 37 | 70 / 88 | | | 4 / 7 (see the status list) |
| D | | | 3 / 3 | | | |

The C "other" rows are one `input_present_needs_output_root` (1 skip), one
`input_present_writes_under_root` (2 skips) and two
`retired_since_suite_base` (4 skips).

## 2. Variables with a recorded, existing input under the evidence root

The search covers `*.md`, `*.json`, `*.sh`, `*.log` and `*.txt` under
`work`, `comments` and `tickets` of the evidence root, in shell form
(`VAR=value`) and JSON form (`"VAR": "value"`, escaped or not). 104 of the
167 variables have a recorded value, 63 have none. 67 variables have at least
one recorded path that exists under the root:

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
| `ABI5_ENV_RUN_ROOT` | 4 | `stdo-proof-entry-run-nine` (runs with root); `stdo-proof-entry-install-host` (input not found) |
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

Filled at the close.

## 4. Lanes failing with their input present

Filled at the close.

## 5. Gates with no usable input

Filled at the close.

## 6. Output-root variables

Filled at the close.

## 7. Ruling-7 rows

Filled at the close.

## 8. Inventory members whose bytes changed

Filled at the close.

## 9. Deviations

Filled at the close.

## 10. Residuals

Filled at the close.
