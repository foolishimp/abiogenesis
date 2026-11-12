# TD-28B Return: the native registered-selection task route

Writer: Claude Opus 5.5. Branch `claude/td28b-retire-native-registered-selection`
from local `main` at `4274cf66f`, worktree `/private/tmp/abg-td28b`. Change
class: product_reprice (TD-28 ruling, 2026-11-12). No push, no tag.

**Status: census committed; work in progress.**

## 1. Census

`T` = `build_tenants/abiogenesis/typescript`. Line numbers are at `4274cf66f`.
Search patterns (whole tree, `test_env/test_runs`, `test_env/downstream` and
`test_env/evidence` excluded): `registered_selection_task`,
`registered_selection_response`, `registered-selection/native`,
`NativeRegistered*`, `registered_selection_native`, `nativeRegisteredSelection*`,
`registeredSelectionNativeRole`, `*RegisteredSelectionInstruction*`,
`NATIVE_SELECTION*`, "native selector", "native selection", `native.mjs`,
`recursive.mjs`, `REGISTERED_GRAPH_SELECTION_NATIVE`.

### 1.1 What the route is

A Program selects a run environment (`abg.run_environment`) whose role row for
an F_P `evaluate` leaf at a `registered_selection` source locus has role
`selector`. That classification is made in two places:
`nativeContextLeafFamily` (`gtl/stdo_run_environment.ts:82-86`, the
registered-selection branch; used by Program validation, HoG and assembly) and
`registeredSelectionNativeRole` (`:190-208`; used by the three dispatch sites).
At such a locus the leaf's input is a `registered_selection_task`, the native
renderer `renderer://abiogenesis/registered-selection/native@5` assembles the
prompt (`abg/instruction_assembly.ts:290-365`), the raw answer is a
`registered_selection_response`, and `materializeNativeRegisteredChoice`
(`product/registered_selection_native.ts`) binds it into the
`registered_graph_choice`; `c_call_outcome` re-derives that binding before
admitting the choice (`abg/instruction_assembly.ts:535-568`).

The `selector` value of the run-environment role schema
(`RUN_ENVIRONMENT_SCHEMA`, `:114`) and `selectorRoleFromBoundDeclarations`
(`:177-189`) stay: framed synthesis (`framedSynthesisAtLocus`,
`framedSynthesisNativeRole`), which the default library uses at
`executive-step`/`select`, reads both.

### 1.2 Specification

No Product sentence or requirement names the route. `PRODUCT.md:1151`
("The selector's stated dependencies remain advisory") and `:1218` speak of the
default library's framed synthesis. `REQ-L-GTL3-SELECTION-BOUNDARY-016..019`
(`requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md:31-63`) state evaluated
preregistered selection, compute regimes and declared purpose; none names the
native task, its renderer or its raw response, and the default library's
framed synthesis and F_D projection deliver them. No specification edit.

### 1.3 Design (kept notes, `T/design/*.md`)

| Note | Lines | Content | Action |
| --- | --- | --- | --- |
| `T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md` | 1-306 | whole subject is the route, but `:124-131` (shared target projection), `:149-191` (framed-synthesis active binding), `:193-197` (declaration-first dispatcher) and `:277-306` (canonical installed test support) state kept design | restate the kept passages in their owning notes, then `git mv` to `history/` |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` | 169-174 | "Existing instruction assembly supplies the native selector's declared Executive frame ..." | restate; replaced text to `history/T287_REGISTERED_GRAPH_SELECTION_DESIGN__RETIRED_SECTIONS.md` |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 629 | Executive row: "S3 `registered_selection_task`/raw binder + S4 declared recursion" (stale: the library uses framed synthesis) | restate the cell |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 726 | `participant S as Native selector` | framed-synthesis actor; stays |
| `README.md` | 47 | index line of the native note | removed; row added to `history/README.md` |

`ABI5_REALIZATION_CONSTITUTION.md`: no passage names the route.

### 1.4 Source (`T/code/src`)

| File | Lines | What leaves |
| --- | --- | --- |
| `product/registered_selection_native.ts` | 1-74 | whole file: `NativeRegisteredSelectionTask`, `NativeRegisteredSelectionTarget`, `isNativeRegisteredSelectionTask`, `isNativeRegisteredSelectionResponse`, `nativeRegisteredSelectionResponseSchema`, `materializeNativeRegisteredChoice` |
| `product/index.ts` | 3-5 | the `./product` export of the six names above |
| `abg/instruction_assembly.ts` | 34 (one name), 36-37 | imports of `registeredSelectionNativeRole` and of the native profile |
| `abg/instruction_assembly.ts` | 290-365 | `evaluateRegisteredSelectionInstructionAssembly` |
| `abg/instruction_assembly.ts` | 512-515, 524-528 | the registered-selection branch of `constructDeclaredNativeInstructionAssembly` and `requireDeclaredNativeInstructionAssembly` |
| `abg/instruction_assembly.ts` | 535-568 | `registeredSelectionInstructionResultMatches` |
| `gtl/stdo_run_environment.ts` | 74-76 (comment), 82-86 | the registered-selection branch of `nativeContextLeafFamily` |
| `gtl/stdo_run_environment.ts` | 190-208 | `registeredSelectionNativeRole` |
| `abg/c_call_outcome.ts` | 5 (one name), 16 (one name), 1257-1262 | the registered-selection result guard |
| `hog/ccall_lifecycle.ts` | 7 (one name), 483-485 | `selectorRole` and its term in `nativeAssemblyRequired` |

Kept code that imports from a reduced file and must keep working:
`selectorRunEnvironmentIdentity` (`instruction_assembly.ts:284`, also used by
framed synthesis at `:472`), `exactOrNull` (`:382`), `registeredSelectionTargets`
(`:379`), `indexedRuntimeEvents` and `reidentifyHistoricalDurablePrefixCoordinate`
(semantic branches `:1225-1268`), `admitJson` (`:163`); in
`stdo_run_environment.ts`, `registeredSelectionAtSource` and `rootCSourcePath`
(`framedSynthesisAtLocus`, `:225-226`). All stay in place; nothing becomes dead.
The refusal cause `stale_basis` stays (semantic branches and
`abg/semantic_revision.ts:173`). No barrel other than `product/index.ts` names
the route; `scripts/generate-product-manifest.mjs` imports none of it.

### 1.5 Tests, support, fixtures (`T/test_env`)

| File | Lines | Use | Action |
| --- | --- | --- | --- |
| `tests/t287-native-registered-selection.test.mjs` | 151 | subject (live-gated `ABI5_NATIVE_SELECTION_LIVE`) | delete |
| `tests/t287-native-selection-profile-scope.test.mjs` | 66 | subject (imports the three route functions from the build) | delete |
| `fixtures/registered-selection-product/native.mjs` | 64 | subject: the native fixture Product (imports the three `./product` route exports) | delete |
| `tests/t287-recursive-registered-selection.test.mjs` | 601 | cases `:43` and `:296` name the native selector; `:26`, `:55`, `:163`, `:406`, `:505` use the fixture as a vehicle | `:296` goes; `:43` see section 6; the rest keep every assertion |
| `fixtures/registered-selection-product/recursive.mjs` | 108 | imports `native.mjs` and two route exports; its selector is the native one | selector rewritten to the kept F_D kind |
| `tests/t287-recursive-failure-foldback.test.mjs` | 321 | vehicle: loads `recursive.mjs`; packs `native.mjs` (`fixtureFiles`, `:116`); pins the parent GraphFunction digest | `'native'` leaves the packed file list |
| `tests/t287-readable-stops-foldback.test.mjs` | 202 | vehicle: loads `recursive.mjs`; packs `native.mjs` (`:68`) | `'native'` leaves the packed file list |
| `tests/t287-stdo3-run-environment.test.mjs` | 210 | vehicle: imports `declarations` and `NATIVE_SELECTION_STDO3_ROLE` from `native.mjs`; case `:172` observes the run environment over the native-selector Program | role constant moves into the test; `:172` restated on a kept Program |
| `support/stdo3-run-environment.mjs` | 74 | builds the STDO 3.0.2 selector declaration used by the above | kept; see section 6 |
| `support/evidence-gates.json` | 935-1007 | rows `native-selection-live` and `recursive-selection-live` | both rows go (`t292-td60b-evidence-gate-catalogue` reads the file) |

`ABI5_NATIVE_SELECTION_PROVIDER` stays: the default-library and
amendment-witness live gates read it (`t287-default-library.test.mjs:1807`,
`t287-amendment-witness.test.mjs:437`, `evidence-gates.json:620`, `:691`).
Unrelated hits: `d2-frame-installed.mjs:617` (semantic revision selection),
`t287-retained-installed-consumer.test.mjs:149` (qualification),
`t287-default-library-recoverable-failure.test.mjs:191` (framed-synthesis
"native selector exchange mismatch").

### 1.6 Package metadata and qualification mirrors

`T/package.json`: no entry. Qualification mirrors (not edited; listed):

| File | References |
| --- | --- |
| `test_env/qualification/inventory.json` | 2 each: `registered_selection_native`, `REGISTERED_GRAPH_SELECTION_NATIVE`, `registered-selection-product/native`, `registered-selection-product/recursive`, `t287-native-registered-selection`, `t287-native-selection-profile-scope`, `t287-recursive-registered-selection`, `t287-stdo3-run-environment`, `stdo3-run-environment` |
| `test_env/qualification/recipe/verification-recipe.json` | the same names (4 for `t287-native-selection-profile-scope`) |
| `test_env/qualification/recipe/expected-output-inventory.json` | 2: `build/code/src/product/registered_selection_native.{d.ts,js}` |
| `test_env/qualification/recipe/declared-commands.json` | 3: `t287-native-selection-profile-scope` |

### 1.7 Generated

The route has no row in `T/contracts`. `product-toolchain-manifest.json`
lists `build/code/src/product/registered_selection_native.{js,d.ts}` in the
file inventory and the `.d.ts` in declaration rows.

## 2. Recorded history

`rg -uu -l -g '*.json' -g '*.jsonl'` over the evidence root
`/Users/jim/src/apps/abiogenesis/.ai-workspace` (154 GB, no size cap):

| Pattern | Files |
| --- | ---: |
| `registered_selection_task` | 1,747 |
| `registered-selection/native@5` (the renderer) | 19 |
| `"variant":"registered-selection"` (a persisted native assembly) | 2 |

- The 1,747 are dominated by installed-artifact bodies: catalog readiness and
  request packets that carry the installed `.d.ts` source text
  (`build/code/src/product/registered_selection_native.d.ts`), and F_P
  transport archives whose prompts quote source.
- Of the 19 renderer files, 4 are F_P transport archives under `rc3-dogfood-01`
  and `rc4-native-recovery-01` whose prompt quotes the source of
  `instruction_assembly.ts`; 15 are under
  `comments/codex/20260928_FRAMED_GOVERNANCE/registered-selection-native/`
  (attempts 02-04) and `registered-selection-recursive/attempt-01`.
- Event logs that carry the native assembly at run time (parsed):

| Log | Rows | Runs | Native assemblies | Kind |
| --- | ---: | ---: | ---: | --- |
| `registered-selection-native/attempt-04/events.jsonl` | 407 | 3 | 3 | whole log |
| `registered-selection-recursive/attempt-01/events.jsonl` | 522 | 1 | 2 | whole log |
| `registered-selection-native/attempt-04/events-{machine,human,unsupported}.json` | 208, 126, 70 | 1 each | 1 each | slices of the whole log |
| `registered-selection-recursive/attempt-01/events.json` | 519 | 1 | 2 | slice |
| `registered-selection-native/attempt-02/events-machine.json`, `attempt-03/events-machine.json` | 41 each | 1 each | 1 each | slices of failed attempts; no whole log retained |

All are test runs of the fixture Product. None of the 19 default-library
logs, the rc.12 Run (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`)
or the eleven TD-25R logs names the kind or the renderer. `T/test_env/proof`:
none; `T/test_env/fixtures`: only the two fixture modules above (code). No stop
condition.
