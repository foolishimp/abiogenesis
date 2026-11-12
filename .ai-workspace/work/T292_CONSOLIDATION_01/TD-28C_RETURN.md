# TD-28c Return: governed context (GC03) and its Python adapter

Writer: Claude Opus 5.5. Branch `claude/td28c-retire-governed-context` from
local `main` at `0dea269ae`, worktree `/private/tmp/abg-td28c`. Change class:
product_reprice (owner decision of 2026-11-12, register "Decisions for the
owner", item 1). No push, no tag.

**Status: done. Governed context (GC03), its fixed client and its Python
adapter are retired. A Program naming `abg.governed_context` or
`abg.governed_context.activation` is refused with existing codes at every
Program-validating door. +436 / −3,171 lines (net −2,735). Lanes, replay,
artifact truth and capability rows are unchanged apart from the deleted lane
and the new refusal lane. Seven items for the Executive (section 12).**

T = `build_tenants/abiogenesis/typescript`. Line numbers are at `0dea269ae`.

## 1. Census

Search: `governed[_ -]?context`, `GovernedContext`, `gc03`, `host_adapter`
(case-insensitive) over `specification/`, `T/design` (not `history`),
`T/code`, `T/scripts`, `T/test_env` (without `test_runs`, `downstream`,
`evidence`), `T/package.json` and the repository root files.

### 1.1 Specification

| File | Finding |
| --- | --- |
| `specification/PRODUCT.md` | No hit for governed context, GC03 or `abg.governed_context`. `:1233` says "host adapter" for the Public host projection (SDK/CLI), not GC03. |
| `specification/requirements/**` | No hit. `REQ-P-POLICY-063` (`product/REQ-P-POLICY.md:513`) says "host adapter" in the same Public-projection sense. |
| `specification/GOALS.md` | Lines 11, 19, 31, 33, 45, 47, 291, 312, 322 name GC03 or governed context in dated status blocks written by another agent. Not edited (brief). |
| other files under `specification/` | No hit. |

### 1.2 Kept design notes

| Note | Lines | Kind |
| --- | --- | --- |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | `:878`, one sentence in row E-E ("The governed-context transcript still joins the per-chunk captured text.") | mixed row |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | `:552`, one sentence ("The native host and the pinned GC03 supplement own host binding, …") | mixed paragraph |
| same | `:1505-1669`, section "Verified short-stream completeness and owner-bound governed lookup (RC3 Increment B)": `:1507-1519` is the live short-stream rule (`product/default_library.ts` `planningStream`); `:1521-1669` is governed context | mixed section |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md` | `:941-1031`, section "Governed Context Endpoint, Fixed Client, Adapter And Correspondence (RC3 Increment B)" | whole subject |
| `ABI5_REALIZATION_CONSTITUTION.md` | no passage | |
| `design/README.md` | no line | |

`design/history/T287_EFFECT_FUNCTIONAL_REFACTOR_PLAN.md` and
`design/history/M02_M04_INSTALLED_CATALOG_SDK_CLI_PUBLIC_OPERATION_REGISTER.md`
also name it; they are history and stay.

### 1.3 Source (`T/code`)

| File | Sites | Disposition |
| --- | --- | --- |
| `abg/governed_context.ts` (987 lines) | the whole module: policy key `GOVERNED_CONTEXT_POLICY_KEY` (`:812`), activation key (`:814`), policy parser, owner selection `selectOwnedGovernedContext` (`:876`), execution gate, endpoint, host reader, GC03 derivation, correspondence and cold proof | delete |
| `abg/governed_context_client.ts` (58) | the fixed installed client; no source importer; its build output is a payload member named by the generator | delete |
| `abg/actor_process.ts` | imports `:7-10`; lifecycle variables `:845-854`; the policy-selected branch `:937-1049`; the environment and args ternaries `:1052`, `:1054-1060`, `:1076`; the parser check `:1078-1079`; lookup bind `:1207-1220`; stdout capture `:1346`, `:1528`; correspondence and transcript `:1380-1392`; interruption `:1477-1478`; activation `:1499`; close state `:1665`, `:1710` | remove; the ordinary invocation keeps every other line |
| `abg/default_library.ts` | `projectGovernedContextTestingAtPrefix` and its comment (`:600-645`); callers: `actor_process.ts:955` (inside the branch) and the test | delete, with the imports it alone uses |
| `support/governed-context/host_adapter.py` (199) | the pinned Python adapter, copied by the generator | delete |
| `gtl/stdo_run_environment.ts` | `runEnvironmentForProgram` (`:169`) and `selectorRoleFromBoundDeclarations` (`:177`) already refuse the retired policy `abg.stdo_run_environment` by name | the retired keys are refused here (section 6) |

Kept code that imports from a file this package deletes or reduces: only
`abg/actor_process.ts` imports `governed_context.ts`, and only for the branch.
`governed_context.ts` itself imports `runEnvironmentForProgram`, which stays.
No barrel (`abg/index.ts`, `gtl/index.ts`, `public/*`) exports a
governed-context name.

The default library: its one Program (`gtl/default_library.ts:316-318`,
`program://abiogenesis/default-library/default@5`) declares the policies
`abg.root_mode`, `abg.compute_regime`, `abg.default_start_ref` and
`abg.run_environment`. No source constructor of the ten shipped publications
sets `abg.governed_context`, and the built manifest carries no Program
policy key of that name. For a native Construction task the actor runtime
calls `selectOwnedGovernedContext`, which returns
`governed_context_not_selected` when the key is absent
(`governed_context.ts:882-884`) before projecting role evidence; no endpoint,
prompt or environment change follows. The support block in
`abg/default_library.ts` is called only from that branch. The default library
therefore uses no governed-context behaviour.

### 1.4 Scripts and generated files

| File | Sites |
| --- | --- |
| `scripts/generate-product-manifest.mjs` | `:3` import of `GC03_SELECTED_RELEASE`; `:385-402` copy of the adapter and the generated `selection.json`; `:422-424` the check that the payload holds the three members |
| `scripts/product-payload.mjs` | no hit (the rule selects `contracts/**` and `build/**` from disk) |
| `contracts/governed-context/host_adapter.py`, `contracts/governed-context/selection.json` | tracked generated files; `scripts/clean.mjs` does not remove them, so the payload rule keeps reading them until they are deleted from the tree |

Payload members that name governed context at base (`node scripts/product-payload.mjs members`):
`build/code/src/abg/governed_context.{d.ts,js}`,
`build/code/src/abg/governed_context_client.{d.ts,js}`,
`contracts/governed-context/host_adapter.py`,
`contracts/governed-context/selection.json`: six, not the brief's three.

### 1.5 Tests, support and fixtures (`T/test_env`)

| File | Sites | Disposition |
| --- | --- | --- |
| `tests/t287-governed-context.test.mjs` (1,062 lines, 15 tests) | subject is governed context | delete |
| `support/t287-governed-context.mjs` (129) | imported only by the test above | delete |
| `tests/r1-packed-artifact.test.mjs` | `:56-68`, the packed cut carries the client, adapter and selection | remove the block; the packed-artifact claim stays |
| `support/evidence-gates.json` | gate row `gc03-native-profile-basis` (`:1899-1916`); no other row names the file | delete the row (69 rows to 68) |
| `tests/t292-td60b-evidence-gate-catalogue.test.mjs` | checks every row's case file exists | must pass |
| `test_env/proof`, `test_env/fixtures` | no hit | |

No test or script walks `build/code/src/abg` by directory listing or pins a
payload or locator count.

### 1.6 Package metadata

`T/package.json` declares no Python requirement and names no governed-context
member. The root `pyproject.toml` belongs to the Python tenant
(`genesis`, `gtl`). Nothing to remove.

### 1.7 Qualification mirrors

`T/test_env/qualification/inventory.json` lists `code/src/abg/actor_process.ts`,
`code/src/abg/default_library.ts`, `code/src/gtl/stdo_run_environment.ts`,
`scripts/generate-product-manifest.mjs`,
`test_env/tests/r1-packed-artifact.test.mjs` and the three design notes. It
does not list `abg/governed_context.ts`, the client, the adapter, the
governed-context test or its support module. The recipe names none of them.
Not edited (rule 8).

## 2. Recorded history

Governed context adds no event kind, payload field or store. Its only durable
trace is a Program policy value carried inside an
`actor_transport_binding_admitted` payload, the owner prompt in the recorded
args, and a side file `*-governed-context.json` written beside the Run.

Scan: `rg -uuu` over every `.json`, `.jsonl` and `.ndjson` file under
`/Users/jim/src/apps/abiogenesis/.ai-workspace` (242,367 files), the live
rc.12 store, `T/test_env/proof` and `T/test_env/fixtures` (worktree and main
checkout). Not scanned: compressed archives and non-JSON files.

| Finding | Count | Reading |
| --- | --- | --- |
| files with the broad pattern | 2,715 | source paths in read roots, worker prose, review text |
| files with a narrow signal (policy key, endpoint, transcript kind) | 179 | |
| event logs with a match | 21 | 18 carry only data (source paths such as `governed_context.ts`, worker prose) |
| event logs that used the capability | 3 | `rc3-dogfood-01/witness-001-prep/runtime-b09-002`, `runtime-b10-003`, `runtime-b11-004`: the policy keys in the Program policies of `actor_transport_binding_admitted`, Program `program://abi5-tests/sandbox-uat/lifecycle@5` (an operator consumer Program), Runs `run://abiogenesis/462dca6c…`, `8ddffa7b…`, `12abfe7b…` |
| transcripts `*-governed-context.json` | 6 + 4 | 6 in `witness-001-prep`; 4 in `rc8-close-proof-01` are copies of the deleted test's fixture |
| `test_env/proof`, `test_env/fixtures`, live rc.12 store | 0 | |

The base build already refuses the three witness logs at decode ("event stamp
differs from the exact native profile schedule"), and the final build refuses
them identically (section 10). No retired code is needed to read any log the
kept feature set produces, and none of the 11 replay logs carries a
governed-context value. No stop.

## 3. Specification edits

None. No requirement, Product Definition passage or scenario names governed
context or GC03 (section 1.1). `specification/GOALS.md` lines 11, 19, 31, 33,
45, 47, 291, 312 and 322 still name GC03 or governed context; not edited
(brief). They are for the owner of that surface.

## 4. Design

Commit `06d685de8`. Every removed passage is appended verbatim to a history
file under a header naming the source note, the commit it was cut at
(`7d30e7a0f`) and the line ranges.

| Note | Change | History file |
| --- | --- | --- |
| `T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md` | `:941-1031` cut (whole subject) | `history/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN__RETIRED_SECTIONS.md` (existing; the note already pointed to it) |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | `:878` row E-E: the sentence "The governed-context transcript still joins the per-chunk captured text." removed | `history/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN__RETIRED_SECTIONS.md` (existing; original row appended) |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | `:548-554` restated: host binding is owned by the native worker transport (`abg/transport_contracts.ts` `constructKnownWorkerTransportContract`) and the run-environment acquisition owner (`product/stdo_environment.ts` `observeRunEnvironment`); `:1505-1519` restated as "Verified short-stream completeness (RC3 Increment B)" citing `product/default_library.ts` `planningStream` and `t287-default-library`; `:1520-1669` cut | new `history/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN__RETIRED_SECTIONS.md`; pointer line added under the note's title; entry added to `history/README.md` |

The restated short-stream section drops one sentence: "A1–A5 and the native
A02 blocked/UAT indeterminate standing are unchanged." It reported a
qualification standing at RC3 time, not a design rule (ruling item 5).

`ABI5_REALIZATION_CONSTITUTION.md` and `design/README.md`: no change.

## 5. Source

| Commit | File | Change |
| --- | --- | --- |
| `8c087244f` | `abg/governed_context.ts` | deleted (987 lines) |
| | `abg/governed_context_client.ts` | deleted (58) |
| | `code/support/governed-context/host_adapter.py` | deleted (199) |
| | `contracts/governed-context/host_adapter.py`, `selection.json` | deleted (tracked generated files, 200) |
| | `abg/actor_process.ts` | +6 −173: the policy-selected Native Construction branch, the governed lifecycle variables, lookup bind, stdout capture, correspondence and transcript write, interruption and close, the parser check, and the imports only they used (`governed_context.js`, `projectGovernedContextTestingAtPrefix`, `projectRunEnvironmentRoleEvidenceAtPrefix`, the event-prefix digest/extent and invocation-truth imports, `writeFileSync`). The transport contract and the native `--tools` argument are built as before; command and environment stay per-occurrence inputs |
| | `abg/default_library.ts` | +2 −49: `projectGovernedContextTestingAtPrefix` and its comment, and the imports it alone used |
| | `scripts/generate-product-manifest.mjs` | −23: the `GC03_SELECTED_RELEASE` import, the adapter copy and `selection.json` write, and the payload check for the governed members |
| `c459ab160` | `gtl/stdo_run_environment.ts` | +6 −2: `REFUSED_PROGRAM_POLICIES` (`:32`) holds `abg.stdo_run_environment`, `abg.governed_context` and `abg.governed_context.activation`; `runEnvironmentForProgram` (`:174`) and `selectorRoleFromBoundDeclarations` (`:186`) return `false` for a Program that names any of them |

The refusal reuses the existing path of the retired `abg.stdo_run_environment`
key (TD-31): no new refusal code or message. An actor invocation whose Program
names no governed key takes the same path as before; at base
`selectOwnedGovernedContext` returned `governed_context_not_selected` for it
before any effect.

`npm run build`, `lint:imports`, `lint:lifecycle` and `lint:calculus` pass on
each code commit and on the final tree. `tsc --noUnusedLocals` reports the
same 13 findings as base.

Size, `git diff --numstat 0dea269ae` by area:

| Area | Added | Removed |
| --- | --- | --- |
| `T/code/src` | 14 | 1,269 |
| `T/code/support` | 0 | 199 |
| `T/scripts` | 0 | 23 |
| `T/contracts` (tracked generated) | 0 | 200 |
| `T/test_env` | 127 | 1,223 |
| `T/design` (text moved to `history/` counts on both sides) | 295 | 257 |
| `specification` | 0 | 0 |
| total | 436 | 3,171 |

## 6. Door table

Probe: a semantic-stage publication whose first Program carries the key, run
through each door on the base and final builds
(`/private/tmp/abg-td28c-work/doors-base.json`, `doors-finalroot.json`). 30
outcomes; the 10 that change are exactly the two governed subjects at the five
Program-validating doors.

| Door | Base | Final |
| --- | --- | --- |
| `gtl/m02 admitModule` | `raw_admitted_value` | unchanged (policies are a structural string record) |
| `validatePublication` | `publication_validation` | `static_validation_refusal` stage `publication`, `invalid_reference $.runEnvironments` |
| catalog `admit` | admitted | `catalog_validation_refusal` / the same publication refusal |
| conformance `evaluate` (`gtl_program`) | `gtl_program_conformance_result` | `gtl_program_conformance_refusal validation_failed`, `invalid_reference $.runEnvironments` |
| Product resolution `validateProgram` (run door) | `program_validation` | `static_validation_refusal` stage `program`, `invalid_reference $.runEnvironments` |
| `observeRunEnvironment` (run.invoke preparation) | `run_environment_observed`, evidence `null` | `run_environment_refusal unsupported_declaration /program/runEnvironment` (mapped to `invalid_program` by `run_invocation_operation.ts`) |

The same holds for `abg.governed_context` and for
`abg.governed_context.activation` alone. Unchanged at every door: the clean
publication, the retired `abg.stdo_run_environment` (already refused at
base) and an unknown key `abg.td28c_unknown` (admitted at base and final).

## 7. Tests and fixtures

Commit `8de6b8558`.

| File | Change |
| --- | --- |
| `tests/t287-governed-context.test.mjs` | deleted (1,062 lines, 15 tests) |
| `support/t287-governed-context.mjs` | deleted (129) |
| `tests/r1-packed-artifact.test.mjs` | −14: the RC3 Increment B block that required the client, adapter and selection in the packed cut |
| `support/evidence-gates.json` | −18: gate row `gc03-native-profile-basis` (69 rows to 68) |
| `tests/t292-td28c-governed-context-policy.test.mjs` | new (127 lines, 3 tests): a Program naming either key is refused at every door of section 6 with the existing codes; a clean Program and one with an unknown key are admitted at the same doors; the default-library Program names no governed key and validates, and adding one is refused |

The new lane run against the base build (a scratch copy pointed at
`base-root` with `ABI5_ENV_TEST_PACKAGE_ROOT`): 3 tests, 1 pass, 2 fail
(`runEnvironmentForProgram` is `null`, not `false`; the default-library
publication with the key validates). On the final build: 3/3 pass.

Qualification inventory members changed (digests now stale; inventory and
recipe not edited): `code/src/abg/actor_process.ts`,
`code/src/abg/default_library.ts`, `code/src/gtl/stdo_run_environment.ts`,
`scripts/generate-product-manifest.mjs`,
`test_env/tests/r1-packed-artifact.test.mjs`,
`design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md`,
`design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`,
`design/T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md`. No deleted file is an
inventory member. New files not in the inventory: the refusal lane and
`design/history/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN__RETIRED_SECTIONS.md`.

## 8. Generated contracts and identity

Final build on a copy of the final tree (`final-root`, rsync without `.git`).
Generated files are not committed.

| Identity | Base | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:b3b89acc1adcbbef1e5b04e3f0669382cc257d1450fd432c588ed0797d4b54f4` | `sha256:1063c1a286c4e023cb0db7acbc1b7734aaae776823e727be00575928cc5e96d4` |
| `contributionManifestDigest` | `sha256:b3e65b46088b250900e1ffea76ad58a984ef8a525ab106ed95b6dd2297c5f5bc` | `sha256:38639ebc988ba4cb602033f0efe6a3f0c0bf17b579579b38ec39e3113741cba7` |
| public contract `catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | unchanged |
| capability `graphDigest` | `sha256:8a7486def91432c08f3763e4c10d08fdc30e7276de50ed3a96ee28671e51277e` | `sha256:b62cb024947e146c57973cb1744a468e4c96bddd858a4f5ecbf903896325d4af` |

Content of the changes:

- `contracts/`: `governed-context/` is gone; `capabilities/capability-definition-graph.json`
  is the only other changed file.
- Payload (`scripts/product-payload.mjs members`): 5,329 to 5,323 members,
  5,327 to 5,321 `productRelativeLocators`; members and locators agree. The
  six removed members are the four `build/code/src/abg/governed_context*`
  outputs and the two `contracts/governed-context/*` files. Nothing added.
- Manifest: the content digest and everything derived from it
  (`descriptorRef`, `provenanceRef`, `contributionManifestRef`,
  `contributionManifestDigest`, the capability graph reference) change. The 49
  contribution rows are equal once the content digest is normalised. The ten
  `publicationBindings` keep their module refs; their `publicationDigest`s
  change because each publication is constructed under the Product identity.
  All eleven publication constructors give byte-equal publications on the base
  and final builds under one identity.

## 9. Lanes

Each lane alone, from T, with `TMPDIR` and `ABI5_EVIDENCE_ROOT` set; base on
`base-root` (`0dea269ae`), final on `final-root` (`8de6b8558`), each with its
own build. tests/pass/fail/skip.

| Lane | Base | Final |
| --- | --- | --- |
| `t287-governed-context` | 15/14/0/1 | deleted |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 |
| `t292-td60b-evidence-gate-catalogue` | 3/3/0/0 | 3/3/0/0 |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 |
| `t287-native-workspace-work` | 43/43/0/0 | 43/43/0/0 |
| `t287-management-supervision` | 5/5/0/0 | 5/5/0/0 |
| `t287-qualification-scopes` | 24/24/0/0 | 24/24/0/0 |
| `t288-instruction-assembly-owner` | 4/4/0/0 | 4/4/0/0 |
| `t287-lifecycle-failure-carrier` | 7/7/0/0 | 7/7/0/0 |
| `t287-management-context` | 13/12/0/1 | 13/12/0/1 |
| `t292-td31-stdo-run-environment-shape` | 3/3/0/0 | 3/3/0/0 |
| `t287-c2-child-program` | 4/4/0/0 | 4/4/0/0 |
| `t287-c2-core-environment` | 7/7/0/0 | 7/7/0/0 |
| `t287-native-selection-profile-scope` | 4/4/0/0 | 4/4/0/0 |
| `t287-stdo3-run-environment` | 5/5/0/0 | 5/5/0/0 |
| `t287-gtl-serialization-publication` | 9/9/0/0 | 9/9/0/0 |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 |
| `t287-cross-cut-public-read` | 5/4/1/0 | 5/4/1/0 |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 |
| `t292-td28c-governed-context-policy` | not on base (new lane; scratch copy 3/1/2/0) | 3/3/0/0 |

Per-case results (`ok`/`not ok`/skip per case name) are identical on base and
final for all 22 lanes run on both. The one red is the registered read-count
case of `t287-cross-cut-public-read` (case 1, "different-cut native Definition
reads keep blocked absence and exact historical child result/replay"), red on
both. The `t287-selected-action-authority` skip is case 3
(`ABI5_SELECTED_ACTION_OWNER_SUBJECT` unset), on both. Outputs:
`/private/tmp/abg-td28c-work/lanes-before/`, `lanes-before-at/`, `lanes-after/`.

## 10. Replay

`scripts/replay-log.mjs` (from TD-25R) over the 11 logs of the earlier
packages and the 3 RC3 witness logs, on the base and final builds. Outputs
are byte-identical (`replay-base.jsonl` = `replay-final.jsonl`,
`replay-witness-base.jsonl` = `replay-witness-final.jsonl`).

| Log | Rows | Base and final |
| --- | --- | --- |
| live rc.12 `abi5-root-env-hRgyFy` | 1,695 | `sha256:3800fb11…` |
| rc7 `blocked-testing-diagnostic-001` | 44 | `sha256:40028725…` |
| rc11 `native-assessment` `abi5-root-env-MdmivN` | 27 | `sha256:6dbf5586…` |
| rc11 `selected-action` `abi5-root-env-gjgeWi` | 216 | `sha256:0d3923da…` |
| rc8 `registered-selection-whole-001` | 282 | whole-log refusal (run_stopped), 7 Runs |
| rc11 `native-02/runtime-001` | 421 | `sha256:bc4a919e…` |
| rc4 `hc2-current-intent/continue-events` | 166 | whole-log refusal (more than one execution), 2 Runs |
| `test_env/proof/abi5-root-r10.events.jsonl` | | decode refusal (no admitted event contract) |
| RC1 `s02-installed-continuation-19`, `-18` | | decode refusal (noncanonical event) |
| RC1 `s02-installed-continuation-04` | | decode refusal (native profile stamp) |
| RC3 witness `runtime-b09-002`, `b10-003`, `b11-004` | | decode refusal (native profile stamp) |

## Artifact truth over recorded stores

Nothing changes.

- Artifact-truth projection over a copy of the live rc.12 store
  (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`,
  checksum equal to the original): 1,695 rows, 3 artifact admissions,
  `artifact_truth_projection` with digest
  `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` on
  base and final; the probe outputs are byte-identical. Lock probe: the
  resolved Product lock (`product://abiogenesis/typescript-tenant@5.0.0-rc.12`,
  `product://default-library-witness/consumer@5`) reads as a resolved lock
  with no capability identity mismatch on both builds; outputs byte-identical.
- Capability definition graph rows: 16 on base and final, capability ids in
  the same order, owning public contract ids, versions, contract digests and
  selectors equal, dependent capabilities, effect refs and proof refs equal.
  The rows carry no projected-contract member. The only differing leaves are
  the contract catalog's `productContentDigest` (241) and the capability
  definition digests and refs derived from it (16 rows, 18 dependents) and
  the graph digest.
- The five lanes (`t287-historical-source-resource`, `r10-child-proof`,
  `t287-cross-cut-public-read`, `t287-selected-action-authority`,
  `t287-native-assessment-evidence`): section 9. No case goes from pass to fail; the
  only red is the registered read-count case of `t287-cross-cut-public-read`,
  red on base and final.

## 11. Deviations

1. Six payload members are removed, not the brief's three: the client and the
   module each have a `.js` and a `.d.ts` output (section 1.4).
2. `contracts/governed-context/host_adapter.py` and `selection.json` are
   tracked generated files that `scripts/clean.mjs` does not remove. The
   payload rule reads `contracts/**` from disk, so a build leaves them in the
   Product cut unless they leave the tree. They are deleted with `git rm` in
   `8c087244f`, against the rule that generated files are not mine to commit.
3. The new lane is named `t292-td28c-governed-context-policy` after the TD-31
   lane, not after the deleted T-287 lane.

## 12. Residuals and rulings

For the Executive:

1. `abg.governed_context.activation` is refused by name as well as
   `abg.governed_context`: at base a Program carrying only the activation key
   was admitted at every door, and the key has no meaning without the
   retired module.
2. The `git rm` of the two tracked generated `contracts/governed-context/*`
   files (deviation 2).
3. Six payload members rather than three (deviation 1).
4. Search after the change, case-insensitive and without word boundaries (so
   compound identifiers such as `GC03_SELECTED_RELEASE` and
   `selectOwnedGovernedContext` are seen): `rg -i -e gc03 -e
   'governed.?context' -e host_adapter` over `build_tenants`,
   `specification` and the root files, excluding `history`, `test_runs`,
   `downstream`, `evidence`, `node_modules` and `build`. Hits: the refusal
   site `code/src/gtl/stdo_run_environment.ts:32` (the key strings, kept as
   the TD-31 precedent keeps `abg.stdo_run_environment`), the refusal lane and
   `specification/GOALS.md`. Outside that scope: `design/history/*` and
   `.ai-workspace` commentary. The freshly built final `build/`,
   `contracts/` and `product-toolchain-manifest.json` hold no hit except the
   compiled refusal site `build/code/src/gtl/stdo_run_environment.js`. The
   tracked, gitignored `product-toolchain-manifest.json` in the tree still
   names the governed members; it is stale at base and every build rewrites
   it. `GC03_SELECTED_RELEASE` was defined only in the deleted
   `abg/governed_context.ts`; no kept module exports a GC03 constant.
5. The dropped sentence "A1–A5 and the native A02 blocked/UAT indeterminate
   standing are unchanged." (section 4).
6. Three RC3 witness Runs used the capability (section 2); base and final
   both refuse those logs at decode, so retirement changes nothing about
   reading them.
7. `specification/GOALS.md` lines 11, 19, 31, 33, 45, 47, 291, 312 and 322
   still describe GC03 as live or pending work.

No residual defect.
