# TD-28B Return: the native registered-selection task route

Writer: Claude Opus 5.5. Branch `claude/td28b-retire-native-registered-selection`
from local `main` at `4274cf66f`, worktree `/private/tmp/abg-td28b`. Change
class: product_reprice (TD-28 ruling, 2026-11-12). No push, no tag.

**Status: complete.** The native registered-selection task route is retired. 238 source lines are removed and 7 added. The retired shape is refused at every Program door with existing codes. Every lane on kept behaviour is unchanged between base and final. Replay and artifact truth are identical between the builds over 31 logs: rc.12 and 2 of the 19 default-library logs replay fully, and 21 logs refuse decoding identically on both builds. No stop condition. Four items await acceptance (section 15).

`T` = `build_tenants/abiogenesis/typescript`. Scratch, probes and TAP output:
`/private/tmp/abg-td28b-work/`.

## 1. Census

Line numbers in this section are at `4274cf66f`. Search patterns (whole tree,
`test_env/test_runs`, `test_env/downstream` and `test_env/evidence` excluded):
`registered_selection_task`, `registered_selection_response`,
`registered-selection/native`, `NativeRegistered*`, `registered_selection_native`,
`nativeRegisteredSelection*`, `registeredSelectionNativeRole`,
`*RegisteredSelectionInstruction*`, `NATIVE_SELECTION*`, "native selector",
"native selection", `native.mjs`, `recursive.mjs`,
`REGISTERED_GRAPH_SELECTION_NATIVE`.

### 1.1 What the route is

A Program selects a run environment (`abg.run_environment`) whose role row for
an F_P `evaluate` leaf at a `registered_selection` source locus has role
`selector`. Two functions classify that leaf:
`nativeContextLeafFamily` (`gtl/stdo_run_environment.ts:82-86`, the
registered-selection branch; used by Program validation, HoG and assembly) and
`registeredSelectionNativeRole` (`:190-208`; used by the three dispatch sites).
At such a locus the leaf's input is a `registered_selection_task`, the native
renderer `renderer://abiogenesis/registered-selection/native@5` assembles the
prompt (`abg/instruction_assembly.ts:290-365`), the raw answer is a
`registered_selection_response`, and `materializeNativeRegisteredChoice`
(`product/registered_selection_native.ts`) binds it into the
`registered_graph_choice`. `c_call_outcome` re-derives that binding before it
admits the choice (`abg/instruction_assembly.ts:535-568`).

The `selector` value of the run-environment role schema
(`RUN_ENVIRONMENT_SCHEMA`, `:114`) and `selectorRoleFromBoundDeclarations`
(`:177-189`) stay. Framed synthesis (`framedSynthesisAtLocus`,
`framedSynthesisNativeRole`) reads both; the default library uses it at
`executive-step`/`select`.

### 1.2 Specification

No Product sentence or requirement names the route. `PRODUCT.md:1151`
("The selector's stated dependencies remain advisory") and `:1218` speak of the
default library's framed synthesis. `REQ-L-GTL3-SELECTION-BOUNDARY-016..019`
(`requirements/gtl/REQ-L-GTL3-SELECTION-BOUNDARY.md:31-63`) state evaluated
preregistered selection, compute regimes and declared purpose. None of them names
the native task, its renderer or its raw response, and the default library's
framed synthesis and F_D projection deliver them. No specification edit.

### 1.3 Design (kept notes, `T/design/*.md`)

| Note | Lines | Content | Action |
| --- | --- | --- | --- |
| `T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md` | 1-306 | The whole subject is the route. Four passages state kept design: `:124-131` (shared target projection), `:149-191` (framed-synthesis active binding), `:193-197` (declaration-first dispatcher) and `:277-306` (canonical installed test support). | Restate the kept passages in their owning notes, then `git mv` to `history/`. |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` | 160-174 | "Existing instruction assembly supplies the native selector's declared Executive frame ..." | Restate; the replaced text goes to `history/T287_REGISTERED_GRAPH_SELECTION_DESIGN__RETIRED_SECTIONS.md`. |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 629 | Executive row: "S3 `registered_selection_task`/raw binder + S4 declared recursion". This is stale: the library uses framed synthesis. | Restate the cell. |
| `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md` | 726 | `participant S as Native selector` | This is the framed-synthesis actor; it stays. |
| `README.md` | 47 | Index line of the native note. | Removed; a row is added to `history/README.md`. |

`ABI5_REALIZATION_CONSTITUTION.md`: no passage names the route.

### 1.4 Source (`T/code/src`)

| File | Lines | What leaves |
| --- | --- | --- |
| `product/registered_selection_native.ts` | 1-74 | The whole file: `NativeRegisteredSelectionTask`, `NativeRegisteredSelectionTarget`, `isNativeRegisteredSelectionTask`, `isNativeRegisteredSelectionResponse`, `nativeRegisteredSelectionResponseSchema` and `materializeNativeRegisteredChoice`. |
| `product/index.ts` | 3-5 | The `./product` export of the six names above. |
| `abg/instruction_assembly.ts` | 34 (one name), 36-37 | Imports of `registeredSelectionNativeRole` and of the native profile. |
| `abg/instruction_assembly.ts` | 290-365 | `evaluateRegisteredSelectionInstructionAssembly`. |
| `abg/instruction_assembly.ts` | 512-515, 524-528 | The registered-selection branch of `constructDeclaredNativeInstructionAssembly` and of `requireDeclaredNativeInstructionAssembly`. |
| `abg/instruction_assembly.ts` | 535-568 | `registeredSelectionInstructionResultMatches`. |
| `gtl/stdo_run_environment.ts` | 74-76 (comment), 82-86 | The registered-selection branch of `nativeContextLeafFamily`. |
| `gtl/stdo_run_environment.ts` | 190-208 | `registeredSelectionNativeRole`. |
| `abg/c_call_outcome.ts` | 5 (one name), 16 (one name), 1257-1262 | The registered-selection result guard. |
| `hog/ccall_lifecycle.ts` | 7 (one name), 483-485 | `selectorRole` and its term in `nativeAssemblyRequired`. |

Kept code that imports from a reduced file must keep working. Each of these
helpers stays in place and nothing becomes dead:
- `selectorRunEnvironmentIdentity` (`instruction_assembly.ts:284`, also used by
  framed synthesis at `:472`);
- `exactOrNull` (`:382`) and `registeredSelectionTargets` (`:379`);
- `indexedRuntimeEvents` and `reidentifyHistoricalDurablePrefixCoordinate`
  (the semantic branches at `:1225-1268`);
- `admitJson` (`:163`);
- in `stdo_run_environment.ts`, `registeredSelectionAtSource` and
  `rootCSourcePath` (`framedSynthesisAtLocus`, `:225-226`).

The refusal cause `stale_basis` stays: the semantic branches and
`abg/semantic_revision.ts:173` use it. No barrel other than `product/index.ts`
names the route, and `scripts/generate-product-manifest.mjs` imports none of it.

### 1.5 Tests, support, fixtures (`T/test_env`)

| File | Lines | Use | Action |
| --- | --- | --- | --- |
| `tests/t287-native-registered-selection.test.mjs` | 151 | Subject (live-gated `ABI5_NATIVE_SELECTION_LIVE`). | Delete. |
| `tests/t287-native-selection-profile-scope.test.mjs` | 66 | Subject (imports the three route functions from the build). | Delete. |
| `fixtures/registered-selection-product/native.mjs` | 64 | Subject: the native fixture Product, which imports the three `./product` route exports. | Delete. |
| `tests/t287-recursive-registered-selection.test.mjs` | 601 | Cases `:43` and `:296` name the native selector. `:26`, `:55`, `:163`, `:406` and `:505` use the fixture as a vehicle. | `:296` goes and `:43` is restated (section 8). The rest keep every assertion. |
| `fixtures/registered-selection-product/recursive.mjs` | 108 | Imports `native.mjs` and two route exports; its selector is the native one. | Selector rewritten to the kept F_D kind. |
| `tests/t287-recursive-failure-foldback.test.mjs` | 321 | Vehicle: loads `recursive.mjs`, packs `native.mjs` (`fixtureFiles`, `:116`) and pins the parent GraphFunction digest. | The native setup and `'native'` leave. |
| `tests/t287-readable-stops-foldback.test.mjs` | 202 | Vehicle: loads `recursive.mjs` and packs `native.mjs` (`:68`). | The native setup and `'native'` leave. |
| `tests/t287-stdo3-run-environment.test.mjs` | 210 | Vehicle: imports `declarations` and `NATIVE_SELECTION_STDO3_ROLE` from `native.mjs`. Case `:122` checks the native role data; case `:172` observes the run environment over the native-selector Program. | `:122` keeps its default-role claims; `:172` is restated on a kept Program (section 8). |
| `support/stdo3-run-environment.mjs` | 74 | Builds the STDO 3.0.2 selector declaration used above. Its `selectorRole` option serves only the native role data. | The option and its three role asserts leave. |
| `support/evidence-gates.json` | 935-1011 | Rows `native-selection-live` and `recursive-selection-live`. | Both rows go; `t292-td60b-evidence-gate-catalogue` reads the file. |

`ABI5_NATIVE_SELECTION_PROVIDER` stays: the default-library and
amendment-witness live gates read it (`t287-default-library.test.mjs:1807`,
`t287-amendment-witness.test.mjs:437`, `evidence-gates.json:620`, `:691`).

Unrelated hits:
- `d2-frame-installed.mjs:617` (semantic revision selection);
- `t287-retained-installed-consumer.test.mjs:149` (qualification);
- `t287-default-library-recoverable-failure.test.mjs:191` (the framed-synthesis
  "native selector exchange mismatch").

### 1.6 Package metadata and qualification mirrors

`T/package.json` has no entry. The qualification mirrors are not edited; they
are listed here. No lane reads them: only
`test_env/support/exact-candidate-qualification.mjs` and the qualification
runner do.

| File | References to changed or deleted members |
| --- | --- |
| `test_env/qualification/inventory.json` | 2 each: `registered_selection_native`, `REGISTERED_GRAPH_SELECTION_NATIVE`, `registered-selection-product/native`, `registered-selection-product/recursive`, `t287-native-registered-selection`, `t287-native-selection-profile-scope`, `t287-recursive-registered-selection`, `t287-stdo3-run-environment`, `stdo3-run-environment`. |
| `test_env/qualification/recipe/verification-recipe.json` | The same names (4 for `t287-native-selection-profile-scope`). |
| `test_env/qualification/recipe/expected-output-inventory.json` | 2: `build/code/src/product/registered_selection_native.{d.ts,js}`. |
| `test_env/qualification/recipe/declared-commands.json` | 3: `t287-native-selection-profile-scope`. |

Intersecting `git diff --name-status 4274cf66f HEAD` with the mirrors gives the
following members that this package changes, moves or deletes.
- `inventory.json` and `verification-recipe.json` each name 18:
  - the six source files of section 6;
  - `design/M03_INSTRUCTION_ASSEMBLY_DERIVATION.md`, `design/README.md`,
    `design/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`,
    `design/T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` and the moved
    `design/T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md`;
  - `native.mjs` and `recursive.mjs`, `support/stdo3-run-environment.mjs`, and
    the tests `t287-native-registered-selection`,
    `t287-native-selection-profile-scope`, `t287-recursive-registered-selection`
    and `t287-stdo3-run-environment`.
- `declared-commands.json` names 1: `t287-native-selection-profile-scope`.
- `expected-output-inventory.json` names the two build outputs above.

None of them names the foldback tests or `evidence-gates.json`.

### 1.7 Generated

The route has no row in `T/contracts`. `product-toolchain-manifest.json`
lists `build/code/src/product/registered_selection_native.{js,d.ts}` in the
file inventory and lists the `.d.ts` in the declaration rows.

## 2. Recorded history

`rg -uu -l -g '*.json' -g '*.jsonl'` over the evidence root
`/Users/jim/src/apps/abiogenesis/.ai-workspace` (154 GB, no size cap):

| Pattern | Files |
| --- | ---: |
| `registered_selection_task` | 1,747 |
| `registered-selection/native@5` (the renderer) | 19 |
| `"variant":"registered-selection"` (a persisted native assembly) | 2 |

- Installed-artifact bodies dominate the 1,747 files. These are catalog
  readiness and request packets that carry the installed `.d.ts` source text
  (`build/code/src/product/registered_selection_native.d.ts`), and F_P
  transport archives whose prompts quote source.
- Of the 19 renderer files:
  - 4 are F_P transport archives under `rc3-dogfood-01` and
    `rc4-native-recovery-01`; their prompts quote the source of
    `instruction_assembly.ts`;
  - 15 are under
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

All are test runs of the fixture Product. None of the following names the kind
or the renderer:
- the 19 default-library logs;
- the rc.12 Run (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`);
- the eleven TD-25R logs.

`T/test_env/proof` has none. In `T/test_env/fixtures`, only the two fixture
modules above (code) name them. No stop condition. Replay of the two whole logs
on both builds: section 11.

## 3. Kept behaviour

**No shipped Program reaches the route.** Probe:
`/private/tmp/abg-td28b-work/scripts/shipped-route-probe.mjs`, output
`shipped-route-probe.txt`. On the base build, it calls the base
`registeredSelectionNativeRole` for every C leaf locus of every callable
GraphFunction of every Program. It covers all ten shipped
`construct*ModulePublication` constructors (22 Programs). The result is `null`
everywhere: the native route is selected nowhere. The default library has one
registered-selection source leaf. It is the F_D `project-choice` leaf at the
projection locus, and the function returns `null` for an F_D leaf. The library's
one F_P leaf, `select` in `executive-step`, is not a registered-selection source;
framed synthesis owns it. The rc.12 Run executes
`program://default-library-witness/witness@5`, a default-library Program, and
section 2 shows it carries no native assembly.

**The three dispatch sites, for a kept input.** For every kept input, the base
`registeredSelectionNativeRole` returns `null` (probe above). The removed terms
therefore evaluated to the value the code now has without them.

| Site | Base, kept input | Final, kept input |
| --- | --- | --- |
| Assembly dispatchers `constructDeclaredNativeInstructionAssembly` and `requireDeclaredNativeInstructionAssembly` (`abg/instruction_assembly.ts`) | Native role `null`: falls through to the framed-synthesis check (`framedSynthesisNativeRole`), then to the worksite owner. | Goes straight to the framed-synthesis check, then to the worksite owner. Same assembly. |
| Result guard in `abg/c_call_outcome.ts` | `regime !== "F_P" \|\| role === null \|\| ...` is true. | The clause is gone; the remaining clauses are unchanged. Same admission. |
| `nativeAssemblyRequired` in `hog/ccall_lifecycle.ts:483` | `selectorRole` is `null` (F_D leaf, or F_P leaf at no registered-selection source), so the term is false. | The term is gone. Same dispatch. |

Edge case at the third and second sites, for a caller without
`programPublication`:
- **Base.** For an F_P leaf at a registered-selection source with no
  `programPublication`, `selectorRoleFromBoundDeclarations` returns `false` for
  an undefined publication. That made `selectorRole` non-null and required
  native assembly, whose basis is `null` without a publication. The C-call
  failed with `diagnostic://abiogenesis/instruction-assembly/stale-native-basis@5`.
- **Final.** The leaf dispatches like any other F_P leaf.
- **Reach.** `programPublication` is optional only on the HoG input
  (`hog/ccall_lifecycle.ts:89`). Every Public path supplies it:
  - `owner_bindings/run_invocation.ts:956, 1076, 1183, 1628, 1724` pass
    `resolution.programPublication`, which `ProductExecutionResolution` requires
    (`product/execution_resolution.ts:160`);
  - child traversal and construction continuation carry it on
    (`hog/child_traversal.ts:235`, `hog/entry.ts:399, 425`).

  Only direct HoG callers can omit it.
- **What changes.** No kept Public operation's observation changes. The Program
  in this case declares no selector role, so no retired shape is present.

The framed-synthesis branch keeps its own fail-closed check for a missing
publication: the default library's implementation refs require native assembly
(`GOVERNANCE_IMPLEMENTATION_REFS`).

**What stays.**
- The registered-selection application and its validation in `validateProgram`.
- `registeredSelectionTargets`, `resolveRegisteredSelection`,
  `isRegisteredGraphChoice` and `registeredSelectionAtSource`
  (`gtl/registered_selection.ts`).
- The projected `registeredSelectionDefinitionDigests`.
- Framed synthesis with `projectGovernanceChoice`.
- Recursion, child-failure foldback and pending resume.

Lanes: section 10.

## 4. Specification

No edit (section 1.2).

## 5. Design

Commit `08da4d68c`.

- **`T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN.md`** moves unchanged to
  `design/history/` (`git mv`). Its index line leaves `design/README.md`, and
  `design/history/README.md` gains a row (class `stale`). Before the move, its
  four kept passages are restated against head code in the notes that own them:
  - **Shared target projection (`:124-131`).**
    `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md`, "Purpose and actual F_P
    context", restates it: `registeredSelectionTargets` is the one
    permitted-target projection, read by `resolveRegisteredSelection` and by
    `synthesisContext`.
  - **Framed-synthesis active binding (`:149-191`).**
    `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`, new subsection "Current execution
    binding in selector context", restates it: the `currentExecutionBinding`
    owners, fields, recursion bound, `bindingDigest`, the `unknown_dependency`
    refusal, the section order and `maxPromptBytes`.
  - **Declaration-first dispatcher (`:193-197`).**
    `M03_INSTRUCTION_ASSEMBLY_DERIVATION.md` gains one paragraph:
    `constructDeclaredNativeInstructionAssembly` and
    `requireDeclaredNativeInstructionAssembly` are the one dispatcher, used by
    `prepareActorProcessInvocation` and `invokeActorProcessWithAssembly`.
  - **Installed test support (`:277-306`).**
    `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` gains "Installed test support":
    `constructInstalledStartCall` and `constructInstalledPendingCall` in
    `test_env/support/registered-graph-selection.mjs`.
- **`T287_REGISTERED_GRAPH_SELECTION_DESIGN.md`.**
  - "Purpose and actual F_P context" is restated against head code
    (`validator/validation.ts`, `product/execution_resolution.ts`,
    `gtl/registered_selection.ts`, `abg/instruction_assembly.ts`,
    `gtl/default_library.ts`, `abg/default_library.ts`). Its previous text
    (`:160-174`) is cut verbatim to
    `history/T287_REGISTERED_GRAPH_SELECTION_DESIGN__RETIRED_SECTIONS.md`.
  - A pointer line follows the status block.
  - `design/README.md` adds `gtl/registered_selection.ts` to its line.
- **`T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md`.**
  - The Executive row's last cell (`:629`) now states framed synthesis: the F_P
    `select` leaf (`selectGovernanceWork`) and the F_D `project-choice` leaf
    (`projectGovernanceChoice`) declared in `gtl/default_library.ts`, plus the
    declared executive recursion.
  - The old line is cut verbatim to
    `history/T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN__RETIRED_SECTIONS.md`.
  - A pointer line is added.
- `ABI5_REALIZATION_CONSTITUTION.md` is not edited and names nothing retired.

## 6. Source lines removed

Commit `a4be7c33a`. `git diff --numstat 4274cf66f -- T/code/src`:

| File | Added | Removed |
| --- | ---: | ---: |
| `abg/c_call_outcome.ts` | 2 | 8 |
| `abg/instruction_assembly.ts` | 1 | 123 |
| `gtl/stdo_run_environment.ts` | 2 | 26 |
| `hog/ccall_lifecycle.ts` | 2 | 4 |
| `product/index.ts` | 0 | 3 |
| `product/registered_selection_native.ts` (deleted) | 0 | 74 |
| **Total** | **7** | **238** |

The added lines are the shortened import lists, the rewritten comment on
`nativeContextLeafFamily` and the shortened `nativeAssemblyRequired` expression.
No stub, wrapper or dead branch remains. The build and `lint:imports`,
`lint:lifecycle` and `lint:calculus` pass.

Whole size, `git diff --numstat 4274cf66f`:

| Area | Files | Added | Removed |
| --- | ---: | ---: | ---: |
| `T/code/src` | 6 | 7 | 238 |
| `T/test_env` | 10 | 132 | 513 |
| `T/design` | 8 | 141 | 16 |
| `specification` | 0 | 0 | 0 |

## 7. Door table

Probes:
- `scripts/door-probe.mjs` (output `door-probe.txt`) builds the fixture Program
  with an F_P registered-selection source, the request contract of kind
  `registered_selection_task`, a raw result contract of kind
  `registered_selection_response`, and optionally a run environment with a
  `selector` role at that source.
- `scripts/value-probe.mjs` (output `value-probe.txt`) presents the two values at
  the kept registered-selection owners.

Each probe ran on the base and the final build. The refusal lane
(`t287-recursive-registered-selection`, case `:73`) asserts the final column.

**A Program, or its run-environment declaration, with a `selector` role at an
F_P registered-selection source:**

| Door | Base | Final |
| --- | --- | --- |
| Publication admission (`validatePublishedDeclarations`, `validRunEnvironmentPublication`) | Admitted | Admitted. The check covers declarations only; a run-environment declaration is admissible data. |
| `validator.validateProgram` | `program_validation` | `static_validation_refusal`, `invalid_reference` at `$.runEnvironments` (observed) |
| Conformance (`typecheckGtlProgram`) | `passed` | `failed`, code `validation_failed`, with the same diagnostic (observed) |
| Execution resolution (`product/execution_resolution.ts:776-785`), reached by Public `run.start` | Passes this gate | `incompatible_or_unproven` at stage `declaration_closure`, "whole-Program declaration inventory failed static validation" (by reading; it calls the same `validateProgram`) |
| Qualification Program check (`validator/qualification.ts:308-312`) | `accepted` (by reading) | `refused` at boundary `program_validation`, with the same diagnostic (by reading) |
| `product.observeRunEnvironment` | Proceeds to acquisition; without resources, `missing_binding` at `/runEnvironmentResources` (observed) | `unsupported_declaration` at `/program/runEnvironment` (observed) |
| `./product` exports `isNativeRegisteredSelectionTask`, `isNativeRegisteredSelectionResponse`, `nativeRegisteredSelectionResponseSchema` and `materializeNativeRegisteredChoice` | Present | Absent (observed) |

The same Program without the role validates on both builds: `program_validation`
with one F_P row, conformance `passed`, and `run_environment_observed` with
evidence `null`. An F_P registered selection stays a valid Program.

**A `registered_selection_task` value:**

| Door | Base | Final |
| --- | --- | --- |
| Native assembly at a role-declared source (`evaluateRegisteredSelectionInstructionAssembly`) | Admitted by `isNativeRegisteredSelectionTask` and rendered with the native renderer, or refused `unavailable_required_content` | No such door: a role-declared Program is refused at the Program doors above. |
| Input of an F_P leaf without the role | A Product value under its declared input contract; only the Product's `validateContractValue` checks it | Same |
| Result at a registered-selection source: `resolveRegisteredSelection` | Throws "registered selection result does not conform" (observed) | Same (observed) |
| Result admission (`admitResult`, `abg/c_call.ts:6977-7007`; `candidate.kind !== valueKind`) | `diagnostic://abiogenesis/c-call/result-contract-mismatch@5` | Same |
| `isRegisteredGraphChoice` | `false` (observed) | `false` (observed) |

**A `registered_selection_response` value (raw answer, with or without a
`kind`):**

| Door | Base | Final |
| --- | --- | --- |
| Native result admission at a role-declared source (`registeredSelectionInstructionResultMatches`) | `materializeNativeRegisteredChoice` binds it into a `registered_graph_choice` (observed), and admission requires the admitted choice to equal it; otherwise `result-contract-mismatch` | No such door (Program doors above) |
| Result at a registered-selection source: `resolveRegisteredSelection` | Throws "registered selection result does not conform" (observed) | Same (observed) |
| Result admission (`admitResult`) | `result-contract-mismatch` | Same |
| `isRegisteredGraphChoice` | `false` (observed) | `false` (observed) |

No new refusal code or message. Once the role is refused, no kept owner gives
either value a meaning. At every remaining door it is refused as a
registered-selection result, with the same code as on base, and is otherwise an
opaque Product value.

## 8. Tests and fixtures

Commit `a74071fa5`.

**Deleted (subject is the route):**
- `tests/t287-native-registered-selection.test.mjs` (151 lines; one live-gated
  case);
- `tests/t287-native-selection-profile-scope.test.mjs` (66 lines; four cases on
  native profile applicability);
- `fixtures/registered-selection-product/native.mjs` (64 lines; no importer
  remains);
- the evidence-gate rows `native-selection-live` and `recursive-selection-live`
  (`support/evidence-gates.json`, 78 lines).

**`fixtures/registered-selection-product/recursive.mjs`.** The selector becomes
an F_D registered selection, the kind the default library uses at its
registered-selection source (`project-choice`) and the kind the index fixture
uses.
- `select` admits a `recursive_selection_request`. This is the request the
  `prepare` leaf builds from the state: task, observations, required support,
  child input and the permitted catalogue.
- `select` applies one closed rule (`first_unrejected_renderer`): the first
  catalogue renderer without a rejected receiver measurement. Without one, it
  returns a gap with `missingSupportRefs` equal to the unresolved support and the
  rejected measurements as evidence.
- The catalogue (graph function, representation, admitted definition digest) is
  an optional `catalog` member of the state. A state without it selects nothing.
- `initialState()` is unchanged. The A, B and parent GraphFunctions and their
  bindings keep their bytes.

`scripts/fixture-compare.mjs` compares base `declarations(gtl, environment)` plus
the native strip against final `declarations(gtl)`:

| Item | Result |
| --- | --- |
| Parent digest `sha256:b784f663…` | Unchanged |
| Admitted parent digest `0e991ec0…` | Unchanged |
| `foldbackRef` `e7df59cd…` | Unchanged |
| `applicationRef` `bab45946…` | Unchanged |
| A, B, the four bindings and `initialState` | Unchanged |

What differs:
- the root, in its declarations;
- the Program;
- the select binding, now F_D;
- the value kinds of the request and child-input contracts, now
  `recursive_selection_request` and the index fixture's `selection_child_input`;
- the `native-response` contract and the empty `runEnvironments`, which leave.

In the foldback vehicles (root replaced by `call-A`), the GraphFunctions differ
only in the root's declarations. A, the parent, their bindings, the evaluator and
the rule are identical (outputs `fixture-base.json` and `fixture-final.json`).

**`tests/t287-recursive-registered-selection.test.mjs`.** How each claim is
kept:

| Case (base line → final line) | Claim | Final |
| --- | --- | --- |
| `:26` → `:26` run.continue arms | Exclusive request alternatives | Unchanged. |
| `:43` → `:43` "valid bounded Program with one native selector" | The Program validates. It has one F_P row. The recursion has bound 3 and `requiresParentEvaluation`. The termination decision is `false` on the initial state and `null` on a missing state. | Retitled "... with one registered F_D selector". Every recursion assertion is kept. The F_P row count (=1) is replaced by two assertions: the root declares exactly one `registered_selection` application at `select`, and the Program has 0 F_P rows. |
| — → `:73` (new) | Refusal lane: the retired shape is refused at each program door; section 7, first table. | New. |
| `:55` → `:102` Counterevidence | A rejected measurement, the unresolved task and the task digest survive child returns until parent evaluation. The child cannot certify completion. Tampered states are refused. | Unchanged: every assertion, the same inputs. `selectionTask` now returns the F_D request, and the asserted members `childInput.value` and `observations.at(-1).value` are identical. |
| `:163` → `:209` Child failure | An authenticated child failure keeps its diagnostic, prior work and cold failed truth. | Unchanged. `failureDeclarations` no longer strips the native setup, and `native.mjs` leaves the packed files. Its Program never reaches `select`: the root is replaced by `call-A`. |
| `:296` Live native revision | A native choice revised from child evidence through installed Public. | Deleted; its subject is the native selector. |
| `:406` → `:376` Same-Run resume | An interrupted recursive workflow resumes its exact pending execution once. | Unchanged, apart from the fixture packing above. |
| `:505` → `:475` Cold resume | Resumes once through cold Public `run.continue` `pending_execution`. | Unchanged, apart from the fixture packing above. |

Result: base 7 tests, 6 pass, 1 skip (the live case); final 7 tests, 7 pass.

**Foldback vehicles.** `t287-recursive-failure-foldback.test.mjs` and
`t287-readable-stops-foldback.test.mjs` change in four ways:
- the native `environmentDeclaration` helper and its argument go;
- the native strip lines go, and `callableMembership` stays;
- `'native'` leaves `fixtureFiles`;
- `readable-stops` drops its now-unused `gtl` import.

Every pinned value holds: parent `b784f663…`, round trip `0e991ec0…`, executive
`8b4b06c8…` and library `40a2a777…`. Results: 8/8 and 5/5.

**`tests/t287-stdo3-run-environment.test.mjs` and
`support/stdo3-run-environment.mjs`.**
- **Case `:122`** checked two things:
  1. that the native role data (`NATIVE_SELECTION_STDO3_ROLE`) binds the
     complete Executive section (`[84076,89633]`, "## 8. Derived Executive
     frame");
  2. that the P4 default role stays exact.

  Claim 1 is about the native route's role data and goes, together with the
  support's `selectorRole` option and its three role asserts. Claim 2 is kept
  with every assertion: equal re-construction, both span pins, the policy digest
  pin and the missing-`sourceRoot` rejection. The case is retitled "the P4
  default selector role remains exact and the exact source root is explicit".
- **Case `:172`** observed the run environment over the native-selector Program.
  It now observes it over a kept Program: the default library's `executive-step`,
  whose one F_P leaf is the framed-synthesis `select`.
  - The exact STDO 3.0.2 declaration is retargeted to that locus with
    `structuredClone`; its dependency, context, policy and spans are unchanged.
  - The permission's `environmentDigest` binds the retargeted declaration.
  - Every assertion is kept: observed evidence, no corpus or accesses, both span
    checks, no inference from an unselected file, the crossed authority, the
    Python path, `identity_mismatch` for a wrong span and for changed bytes, and
    `access_unavailable`.
  - The Program is a minimal row (`programRef`, `callableMembership`, `policies`),
    as in `support/t287-governed-context.mjs:123`. `observeRunEnvironment` reads
    only those fields.
- Result: 5/5 on both builds.

## 9. Generated contracts and identity digests

Final build (`npm run build` on the final tree; generated files restored before
each commit):

| Digest | Base (`4274cf66f`) | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:3e8bcd0e40399a9be74fa8ef1dde04afcc443e1c2846f392b439b6f31dec411a` | `sha256:ec70757a6a30007e041095ddbec10d037dbc2007e108c67da6a74393c5181dbb` |
| `contributionManifestDigest` | `sha256:d9ecb08705a35fd188b52635ea893a602240a22bb1333bea99d0a6a28100349d` | `sha256:fd35c15eb888aaa6e2b1e38de18d171feae4b56cbfe49becc219b55e194904ff` |
| `publicContractCatalog.catalogDigest` | `sha256:8c5f262f2e7b9fcdef40a80d18b262aa90e4ea3cee854b1f01d52b67773c1733` | `sha256:3159218ed501391ea0b13535bf5139ab11effd6312c49789f6b830b12a25d086` |
| capability `graphDigest` | `sha256:7079ed7b04d89ac089d1d03cf4b679b02c18d79c5d041c3ed5b4abd833341fbb` | `sha256:2105f631283dd83f19aa35dd48246b5eedc51abfce976ddaab27f1eef530c9d2` |

Content by file:
- **`T/contracts`.** Only `capabilities/capability-definition-graph.json`
  changes, and only in digests. Each of its 16 rows changes
  `capabilityDefinitionDigest` and `capabilityDefinitionRef` and the owning
  contracts' `catalogDigest` and `productContentDigest`. Capability ids, versions,
  owning and projected contract ids and `contractDigest`s, dependents, effects and
  proofs are identical. No schema, contract row, member or schema property
  changes. The kinds `registered_selection_task` and
  `registered_selection_response` and the renderer never had a row or schema arm
  in `T/contracts` (searched on both builds).
- **`T/product-toolchain-manifest.json`** (not under `contracts`):
  - `productRelativeLocators` goes from 5,327 to 5,325: the
    `build/code/src/product/registered_selection_native.{d.ts,js}` entries leave;
  - in 47 of the 50 `publicContractCatalog` rows that carry a
    `nativeTypedLocator`, the `declarationInventory` loses
    `build/code/src/product/registered_selection_native.d.ts`;
  - the declaration digests of `abg/instruction_assembly.d.ts`,
    `gtl/stdo_run_environment.d.ts` and `product/index.d.ts` change, because
    their exports changed;
  - each row's `contractDigest` follows;
  - the 75 catalog rows are otherwise identical;
  - every other changed field is a digest or a digest-derived reference.

## 10. Lanes before and after

One file at a time, with `TMPDIR` under `/private/tmp/abg-td28b-tmp-{base,final}`
and `ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace`, through
`scripts/lane.sh` (TAP in `lanes-base/` and `lanes-final/`). Base is the
`4274cf66f` checkout at `/private/tmp/abg-td28b-work/base-root`; final is this
branch with its generated files in place. The lanes are the census tests, every
map 6.4 lane, the `test:m4` files (`r1`-`r9`, `rival-authority-mutations`,
`runtime-scope-regressions`), `test:public-groups`, `test:installed:language`,
`test:uat:harness`, and `t287-gtl-graph-law`, which reads the registered-selection
index fixture. The build's generator pin check passes in `npm run build`.

| Lane | Base (tests/pass/fail/skip) | Final | Change |
| --- | --- | --- | --- |
| `t287-recursive-registered-selection` | 7/6/0/1 | 7/7/0/0 | The skipped live case `:296` is deleted; the new refusal lane `:73` passes |
| `t287-recursive-failure-foldback` | 8/8/0/0 | 8/8/0/0 | none |
| `t287-readable-stops-foldback` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-stdo3-run-environment` | 5/5/0/0 | 5/5/0/0 | none |
| `t292-td60b-evidence-gate-catalogue` | 3/3/0/0 | 3/3/0/0 | none |
| `t287-native-selection-profile-scope` | 4/4/0/0 | deleted | Subject retired |
| `t287-native-registered-selection` | 1/0/0/1 | deleted | Subject retired (the live case skipped on base) |
| `t287-registered-graph-selection` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-gtl-graph-law` | 9/9/0/0 | 9/9/0/0 | none |
| `t287-default-library` | 35/34/0/1 | 35/34/0/1 | none |
| `t287-default-library-fulfillment` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-default-library-prerequisites` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-default-library-reviews` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-default-library-recoverable-failure` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-native-workspace-work` | 43/43/0/0 | 43/43/0/0 | none |
| `t287-native-worksite-execution` | 6/4/0/2 | 6/4/0/2 | none |
| `t287-native-work-reacquisition` | 8/7/0/1 | 8/7/0/1 | none |
| `t287-native-work-reacquisition-normalization` | 2/1/0/1 | 2/1/0/1 | none |
| `t287-reacquisition-root-contract` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-native-work-unknown-effect` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-native-work-currentness-consumers` | 6/6/0/0 | 6/6/0/0 | none |
| `t287-governance-covered-source-use` | 9/7/0/2 | 9/7/0/2 | none |
| `t287-worksite-command-execution` | 12/12/0/0 | 12/12/0/0 | none |
| `t287-c2-core-environment` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-c2-child-program` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-native-c2-instruction-assembly` | 1/1/0/0 | 1/1/0/0 | none |
| `steel-basic-cli-public` | 1/1/0/0 | 1/1/0/0 | none |
| `steel-basic-cli-c2` | 6/0/0/6 | 6/0/0/6 | none |
| `t287-amendment-witness` | 13/12/0/1 | 13/12/0/1 | none |
| `t287-w2-05-release-snapshot-definition-bindings` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-release-publication` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-release-acceptance` | 6/6/0/0 | 6/6/0/0 | none |
| `t287-w2-05-install-catalog-owner-chain` | 3/3/0/0 | 3/3/0/0 | none |
| `r1-packed-artifact` | 1/1/0/0 | 1/1/0/0 | none |
| `r2-clean-install` | 1/1/0/0 | 1/1/0/0 | none |
| `r3-workspace-binding` | 1/1/0/0 | 1/1/0/0 | none |
| `r4-catalog-admission` | 8/8/0/0 | 8/8/0/0 | none |
| `r5-invocation-admission` | 2/2/0/0 | 2/2/0/0 | none |
| `r6-implementation-resolution` | 1/1/0/0 | 1/1/0/0 | none |
| `r7-graph-validation-basis` | 1/1/0/0 | 1/1/0/0 | none |
| `r8-direct-hog-entry` | 1/1/0/0 | 1/1/0/0 | none |
| `r9-causal-result-closure` | 2/2/0/0 | 2/2/0/0 | none |
| `rival-authority-mutations` | 3/3/0/0 | 3/3/0/0 | none |
| `runtime-scope-regressions` | 2/2/0/0 | 2/2/0/0 | none |
| `t287-public-groups` | 3/3/0/0 | 3/3/0/0 | none |
| `installed-language-smoke` | 1/1/0/0 | 1/1/0/0 | none |
| `uat/harness` | 33/33/0/0 | 33/33/0/0 | none |

No lane on kept behaviour changes from pass to fail, and no case times out. Every
skip is the same environment gate on both builds.

## 11. Replay comparison

`scripts/replay-log.mjs`, copied from the TD-25R Writer, was run with the base
build (`/private/tmp/abg-td28b-work/base-root`, built at `4274cf66f`) and the
final build. It covers 31 logs (`replay-set.txt`):
- the 19 default-library logs of map 6.4;
- the rc.12 Run;
- the two logs that used the route;
- nine further logs of earlier packages' replay sets: the TD-25R logs and
  `test_env/proof/abi5-root-r10.events.jsonl`.

Outputs: `replay-base.jsonl` and `replay-final.jsonl`. **All 31 lines are
identical between the builds**, covering every whole-log replay digest, state
digest, F_H continuation and fact digest, per-Run replay and refusal message.

| Set | Logs | Outcome on both builds |
| --- | ---: | --- |
| rc.12 Run (`abi5-root-env-hRgyFy`, 1,695 rows) | 1 | Decoded and replayed; prefix `sha256:2cb94ae2…`, replay `sha256:3800fb11…`, state `sha256:842d1565…` |
| Default-library logs | 19 | 2 decoded and replayed; 3 decoded with one Run replay refused (`run_stopped` checks); 14 decode refusals, "event stamp differs from the exact native profile schedule" |
| The two logs that used the route | 2 | Decode refusal on both builds, "event stamp differs from the exact native profile schedule" |
| Other logs | 9 | 3 decoded and replayed; 2 decoded with a Run replay refused; 4 decode refusals (1 "matches no admitted event-contract variant", 2 "noncanonical event", 1 stamp schedule) |

Recorded history, observed: the two logs that used the route
(`registered-selection-native/attempt-04/events.jsonl` and
`registered-selection-recursive/attempt-01/events.jsonl`) do not decode with the
base build either. The refusal comes from the event-stamp profile, before any
native-selection owner reads them, and is the same on both builds. This package
does not make them non-replayable; they already are not replayable at
`4274cf66f`. Their slices (`events*.json`, section 2) are of the same runs.

## 12. Artifact truth over recorded stores

**Direct probe.** `projectArtifactTruth` (`abg/artifact_truth.ts`) ran over a
copy of the live rc.12 store (`truth/rc12-events.jsonl`, sha256
`440994c0…76511`, 1,695 rows, 3 artifact admissions). The TD-25M Writer's
`probe-artifact-truth.mjs` and `probe-lock.mjs` were copied to `scripts/`.

| Build | Outcome | Digest | `isResolvedProductLock` on the inline `product.install` lock | Capability identity mismatches |
| --- | --- | --- | --- | --- |
| base | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true | 0 |
| final | `artifact_truth_projection` | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | true | 0 |

The same projection over the other 30 logs of the replay set is identical on
both builds, 31 of 31 lines (`truth/truth-{base,final}.jsonl`): 11 projections
with equal digests and the same 20 decode refusals. The lock probe output
(`truth/lock-{base,final}.jsonl`) is identical byte for byte.

**Capability graph rows**, base build against final build
(`contracts/capabilities/capability-definition-graph.json`): 16 rows each. The
following are identical, in the same order:
- capability ids and versions;
- owning contract ids, flat rows and `contractDigest`s;
- nested selectors, dependents, effects and bounded proofs.

Only `capabilityDefinitionDigest`, `capabilityDefinitionRef` and the owning
catalog's `catalogDigest` and `productContentDigest` differ; they follow the
product identity. This package does not change the register
(`shared/capability_contracts.ts`).

**Lanes over recorded stores**, one file at a time with `ABI5_EVIDENCE_ROOT` set:

| Lane | Base (tests/pass/fail/skip) | Final | Per-test change |
| --- | --- | --- | --- |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 | none |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-cross-cut-public-read` | 5/5/0/0 | 5/5/0/0 | none. The read-count case known red on main passes on both builds in these runs (586 s base, 612 s final). |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 | none; case 3 skips on both builds (`ABI5_SELECTED_ACTION_OWNER_SUBJECT` unset) |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 | none |

No case goes from pass to fail. On the final build, the projection of the rc.12
store neither refuses nor changes digest, and no capability graph row changes.
No stop condition.

## 13. Whole-word search

A whole-word search after the change covers specification, kept design, source,
scripts, tests, support, fixtures, `package.json` and the UAT harness. It looks
for `registered_selection_task`, `registered_selection_response`,
`NativeRegisteredSelectionTask`, `NativeRegisteredSelectionTarget`,
`isNativeRegisteredSelectionTask`, `isNativeRegisteredSelectionResponse`,
`nativeRegisteredSelectionResponseSchema`, `materializeNativeRegisteredChoice`,
`registered_selection_native`, `registeredSelectionNativeRole`,
`evaluateRegisteredSelectionInstructionAssembly`,
`registeredSelectionInstructionResultMatches`, `NATIVE_SELECTION_STDO3_ROLE`,
`T287_REGISTERED_GRAPH_SELECTION_NATIVE_DESIGN`, `registered-selection/native`
and `native.mjs`.

It finds only the refusal lane (`t287-recursive-registered-selection.test.mjs`,
`:65-66` and `:97-99`). Outside it:
- `design/history/` holds the moved note and the cut text;
- the qualification mirrors are listed in 1.6;
- the remaining "native selector" and "native selection" phrases name framed
  synthesis or qualification (`implementation/default_library.ts:117`,
  `abg/definition_event_resource.ts`, `T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md:728`).

## 14. Deviations

- **The fixture's selector kind.** The map (3.1 d) says the fixture's selector is
  rewritten "to the default F_P registered selection". The brief names the kept
  kind and the selection binding the default library uses. That binding's leaf at
  the registered-selection source is the F_D `project-choice`. The fixture's
  selector is therefore F_D, a declared total rule. An F_P registered selection
  without a role stays a valid Program (refusal lane, first half).
- **Case `:43` is kept and restated, not deleted.** The map lists it with
  `:296`. Its recursion claims are kept claims, so only its F_P row count is
  replaced (section 8).
- **`t287-stdo3-run-environment`.** Case `:122` loses its native role-data claim,
  and case `:172` runs on the default library's `executive-step` (section 8). The
  census row in 1.5 at the skeleton commit said the role constant would move into
  the test. It does not, because its only subject is the native route.
- **Lane runs.** A lane runs as a background command, waited on to its exit
  before the next file starts, whenever it can exceed the 600-second foreground
  limit. Files still run one at a time.

## 15. Residuals and rulings

No stop condition holds:
- no kept requirement depends on the route;
- no kept code needs its behaviour;
- no recorded store the kept feature set produces needs it;
- no kept Public observation changes.

For the Executive to accept or rule:
1. **The fixture's selector kind.** It is F_D (section 14, first item), where the
   map says F_P.
2. **Case `:43` of `t287-recursive-registered-selection`.** It is restated
   rather than deleted. The F_P row count is replaced by an assertion on the
   registered-selection application and 0 F_P rows (section 8).
3. **`t287-stdo3-run-environment`.**
   - Case `:122` drops its claim on the native role data.
   - Case `:172` observes the run environment over the default library's
     `executive-step` instead of the native-selector Program (section 8).
4. **Replay coverage of the default-library logs.**
   - Of the 19 default-library logs:
     - 2 replay fully and are identical;
     - 3 decode, with one Run replay refused identically;
     - 14 refuse decoding on both builds at the event-stamp profile ("event
       stamp differs from the exact native profile schedule"). So do both route
       logs.
   - For those 14 logs, the comparison shows only that the refusal is
     unchanged. The kept-path proof therefore rests on the rc.12 Run, those 2
     logs and the lanes of section 10.
   - The refusal precedes this package. The logs come from `5.0.0-rc.1`-era
     builds (`20260928_FRAMED_GOVERNANCE`), and TD-25M, TD-27 and TD-28C record
     the same base refusal for logs of those builds (for example TD-27 section 2
     and TD-28C section 2).

Residuals:
- **Qualification mirrors.** `inventory.json`, `verification-recipe.json`,
  `expected-output-inventory.json` and `declared-commands.json` still name the
  deleted files, the deleted `t287-native-selection-profile-scope` command and
  the native `.d.ts`/`.js` outputs (section 1.6). They are not edited; the next
  qualification regenerates them.
- **Line numbers in map 6.4.** The map lists the recursive test's kept cases as
  `:26, 55, 163, 406, 505`. At head they are at `:26, 102, 209, 376, 475`, and the
  new refusal lane is at `:73`.
- **Direct HoG callers without `programPublication`** (section 3). An F_P leaf
  at a registered-selection source now dispatches generically instead of failing
  `stale-native-basis`. No Public path reaches this. Recorded for information.

## 16. Commits

| Commit | Step |
| --- | --- |
| `c22430c34` | Census and recorded history (Return skeleton) |
| `08da4d68c` | Design: native note to history, kept passages restated |
| `a4be7c33a` | Code: route removed |
| `a74071fa5` | Tests: recursive fixture on the kept F_D selector, refusal lane, vehicles |
| `327a419e7` | This Return |
| (this commit) | Return: status line states replay coverage; replay coverage moves to the rulings |
