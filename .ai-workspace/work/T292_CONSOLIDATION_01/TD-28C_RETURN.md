# TD-28c Return: governed context (GC03) and its Python adapter

Writer: Claude Opus 5.5. Branch `claude/td28c-retire-governed-context` from
local `main` at `0dea269ae`, worktree `/private/tmp/abg-td28c`. Change class:
product_reprice (owner decision of 2026-11-12, register "Decisions for the
owner", item 1). No push, no tag.

**Status: census committed; work in progress.**

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
`code/src/abg/default_library.ts`, `scripts/generate-product-manifest.mjs`,
`test_env/tests/r1-packed-artifact.test.mjs` and the three design notes. It
does not list `abg/governed_context.ts`, the client, the adapter, the
governed-context test or its support module. The recipe names none of them.
Not edited (rule 8).

## 2. Recorded history

Pending.

## 3. Specification edits

Pending.

## 4. Design

Pending.

## 5. Source

Pending.

## 6. Door table

Pending.

## 7. Tests and fixtures

Pending.

## 8. Generated contracts and identity

Pending.

## 9. Lanes

Pending.

## 10. Replay

Pending.

## 11. Deviations

Pending.

## 12. Residuals and rulings

Pending.
