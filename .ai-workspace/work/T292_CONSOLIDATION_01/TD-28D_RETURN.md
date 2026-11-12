# TD-28D Return: command forward (the C2 forward re-entry)

Writer: Claude Opus 5.5. Branch `claude/td28d-retire-command-forward` from
local `main` at `5c9df5056`, worktree `/private/tmp/abg-td28d`. Change class:
product_reprice (TD-28 ruling, 2026-11-12: forward is equivalent and retires).
No push, no tag.

**Status: in progress.** Census and recorded history only.

`T` = `build_tenants/abiogenesis/typescript`. Scratch, probes and TAP output:
`/private/tmp/abg-td28d-work/`.

## 1. Census

Line numbers in this section are at `5c9df5056`. Search patterns (whole tree;
`test_env/test_runs`, `test_env/downstream` and `test_env/evidence` excluded):
`command-forward`, `command_forward`, `CommandForward`, `commandForward`,
`COMMAND_FORWARD`, `forward-command`, `forward-owner`, `forward-observation`,
`ExecutableWorksite*`, `executableWorksite*`, `retained_construction`,
`ClosedConstructionRetainedVector`, `forwardIds`, `forwardClaim`, and "forward"
in `T/design` and the specification.

### 1.1 What forward is

Forward is the module `module://abiogenesis/worksite/command-forward@5`
(`gtl/worksite_command_forward.ts`): one Program `program://…/command-forward@5`
over two graph functions. The root graph function
`graph-function://…/command-forward@5` has an F_D `prepare` leaf, which turns a
`worksite_command_forward_request` into a `worksite_command_forward_task`, and
a call to the child `graph-function://…/command-forward/execute@5`, whose
F_P leaf runs C2 on that task. The request names a C1 construction whose C2
attempt failed before dispatch (`WorksiteCommandForwardSource`,
`product/worksite_command_forward.ts:24-36`). The task carries the original
C2 task and the retained snapshot rows, each with source kind
`retained_construction` (`:48-54`). C2's implementation and helper accept the
union `ExecutableWorksiteCommandTask = PriorTask | WorksiteCommandForwardTask`.
For a prior task each `executableWorksiteCommand*` helper returns the
`worksiteExecution*` helper of `product/worksite_revision.ts` (`:166-181`), so
after the change C2 imports those directly. No shipped Program composes the
module.

### 1.2 Specification

No Product sentence or requirement names forward. `REQ-R-ABG3-EVENTS-028`
("forward-only") and the re-entry phrases of the requirements are generic.
No specification edit.

### 1.3 Design (kept notes, `T/design/*.md`)

| Note | Lines | Content | Action |
| --- | --- | --- | --- |
| `T287_C2_FORWARD_REENTRY_DESIGN.md` | 1-339 | The whole subject is forward. Section 7 (`:234-270`, shared P3 undispatched refusal) and the P3 bullet of section 9 (`:333-335`) state kept design for every F_P leaf. | Kept content is restated in `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md` section 6, then `git mv` to `history/`. |
| `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md` | 9 | "This refines C2 forward re-entry sections 7 and 9 ..." | Restate. |
| same | 255-256 | "The source qualification includes the forward owner and preserved-construction recovery owner." | Restate without the forward owner. |
| same | 262 | "Preserve accepted forward HOW7." | Restate with the kept content of forward section 7. |
| `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` | 3, 211, 397, 430, 623 | Forward as a subordinate binding and in lists of source laws and task owners. | Restate. |
| `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md` | 103 | "Revision/forward/recovery and other leaf classes are not newly supported." | Restate. |
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md` | 755 | "C2 forwarding" in a list of other owners' rematerializations. | Restate. |
| `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md` | 635 | O-TYPE row: "the forward task's cover vector compares through `canonicalEquals` ..." and "`product/worksite_command_forward.ts` realizes this ...; the class beyond that module is TD-14". | Restate the two sentences; the rule stays. |
| same | 651 | The "worksite command forwarding, whose historical source is a pure projection ..." clause. | Cut the clause. |
| `README.md` | 49 | Index line of the forward note. | Removed; a row is added to `history/README.md`. |

`T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md:28` ("one forward
transition") names the L-to-P profile transition, not forward. The other
"forward" hits in `T/design` (`ABI5_STDO3_COMPUTATIONAL_BINDING.md:261`,
`M03_…:59`, `M05_…:2137`, `T289_…:37/62/92/240/263`, the D1/D2/C0 notes,
`T287_REGISTERED_GRAPH_SELECTION_DESIGN.md:41`) mean a forward reference or
forwarding a value. `ABI5_REALIZATION_CONSTITUTION.md`: no passage names
forward (`:2856-2859` "forward repair" is generic).

### 1.4 Source (`T/code/src`)

Whole files, 655 lines:

| File | Lines | Exports |
| --- | ---: | --- |
| `abg/worksite_command_forward.ts` | 317 | the source and relation projections, entry disposition, native basis, child source and result match |
| `gtl/worksite_command_forward.ts` | 85 | `worksiteCommandForwardGraphFunctions`, `isWorksiteCommandForwardGraphFunction`, `constructWorksiteCommandForwardModulePublication` |
| `implementation/worksite_command_forward.ts` | 48 | the two descriptors, `prepareWorksiteCommandForward`, `realizeWorksiteCommandForward` |
| `product/worksite_command_forward.ts` | 187 | request, task and snapshot-source types, constructors, guards, the `executableWorksiteCommand*` union helpers, `isWorksiteCommandForwardWorkerResult` |
| `product/worksite_command_forward_identity.ts` | 18 | `WORKSITE_COMMAND_FORWARD_IDS` |

Cut sites in kept files:

| File | Lines | What leaves |
| --- | --- | --- |
| `abg/c_call_outcome.ts` | 12-13, 1266-1269 | Imports; the forward result-match clause of the F_P result guard. |
| `abg/execution_basis.ts` | 16-18, 549 (two terms), 2527-2530 | Imports; the forward request and task terms of the worksite authority carrier; the forward child refusal. |
| `abg/invocation_admission.ts` | 16, 1293-1296 | Import; the forward entry refusal. |
| `abg/worksite_revision.ts` | 36, 636-687 | Type import; `ClosedConstructionRetainedVector` and `projectClosedConstructionRetainedVector` (forward is the only caller). |
| `abg/index.ts`, `gtl/index.ts`, `implementation/index.ts`, `product/index.ts` | 537-540, 324-325, 112-113, 571-572 | Barrel exports. |
| `hog/ccall_lifecycle.ts` | 4, 477-479, 500 | Import; construction of `worksiteCommandForwardBasis` and its spread into the occurrence. |
| `implementation/contracts.ts` | 108 | The `worksiteCommandForwardBasis?` field of the leaf occurrence. |
| `implementation/leaf_invocation_port.ts` | 41-42, 678-681 | Imports; the forward authority clause. |
| `implementation/worksite_command_execution.ts` | 2-5 | Aliased imports from the forward module, re-sourced to `product/worksite_revision.js`. |
| `implementation/worksite_command_helper.ts` | 15-20, 509-510 | Aliased imports, re-sourced; the forward snapshot arm of `materializeSnapshot`. |
| `product/builtin_semantics.ts` | 13-16, 108-110, 192-195, 253, 267-269, 312-315, 393-395, 408-419 | Forward admission, value, judgment-relation, worker-contract and invocation-basis arms; `ABI5_WORKSITE_COMMAND_FORWARD_PRODUCT_SEMANTICS`. |
| `product/declaration_closure.ts` | 36-37, 607-615 | Imports; the forward-claim refusal. |
| `product/worksite_command_execution.ts` (pinned) | 62-71, 1972, 1990, 2046, 2174, 2188, 2367-2375, 2385-2386, 2421-2423 | Aliased imports re-sourced; the forward ternaries of the helper artifact, worker result and observation; the forward snapshot-member arms; `isWorksiteCommandForwardObservation`. |
| `product/worksite_command_launch.ts` | 6, 51, 85 | Import; the forward locus of `COMMAND_LOCI`; the forward branch of `worksiteCommandLaunchImplementation`. |
| `scripts/generate-product-manifest.mjs` | 64, 1074 | Import and module-list entry (ten publications become nine). |

`WORKSITE_CONSTRUCTION_GTL_IDS` and recovery are untouched.

### 1.5 Tests, support, fixtures (`T/test_env`)

| File | Lines | Use | Action |
| --- | ---: | --- | --- |
| `tests/forward-command-contracts.test.mjs` | 162 | Subject (`test:unit`). | Delete. |
| `tests/forward-command-owners.test.mjs` | 71 | Subject (`test:unit`). | Delete. |
| `support/forward-owner-lookups.mjs` | 121 | Subject only. | Delete. |
| `support/forward-command-harness.mjs` | 40 | Subject, and the vehicle `componentSource()` for the C2 case below. | Delete; the kept part moves (section 8). |
| `support/forward-observation-carrier.mjs` | 48 | `observationFor`: C2/revision observation carrier with a forward arm. Vehicle for two kept tests. | Rehomed without the forward arm (section 8). |
| `fixtures/forward-command/input.mjs` | 67 | Builds the original C2 task, then the forward request, coordinate and basis. | Rehomed; only the original C2 task stays. |
| `tests/t287-worksite-command-execution.test.mjs` | 1241-1300 | Case "C2 helper failure subject ..." takes its original C2 task from the harness and uses `executableWorksiteCommand*`. | Re-pointed; every assertion stays. |
| `tests/t287-native-semantic-revision.test.mjs` | 67, 215 | `observationFor` vehicle. | Import re-pointed. |
| `tests/t287-native-work-currentness-consumers.test.mjs` | 372, 547 | `observationFor` vehicle. | Import re-pointed. |
| `tests/t287-native-semantic-job.test.mjs` | 370-371 | Loads `product/worksite_command_forward` for `executableWorksiteCommandSources`. | Re-pointed to `worksiteExecutionSources`. |
| `tests/t287-owned-process-lifetime.test.mjs` | 663-664 | Import stub on `/worksite_command_forward.js`. | Retargeted to the module C2 now imports. |
| `tests/t292-td37b-launch-identity.test.mjs` | 43, 76 | Forward is one of three launch loci. | Two loci; the forward locus becomes a refusal check. |
| `tests/t292-td37a-worksite-subject.test.mjs` | 246 | A forward-task-shaped value in a subject case. | Restated on a kept task kind (section 8). |
| `tests/t287-c2-child-program.test.mjs` | 17 | Publication list. | Entry removed. |
| `tests/t287-w2-05-install-catalog-owner-chain.test.mjs` | 690 | Publication list. | Entry removed. |
| `tests/steel-basic-cli-public.test.mjs` | 633 | Publication list. | Entry removed. |
| `uat/public-setup.mjs` | 10 | Publication constructor list. | Entry removed. |
| `support/installed-qualification-conservation.mjs` | 142, 354 | Publication constructor lists. | Entries removed. |
| `support/d2-frame-fixture.mjs` | 42 | Publication list. | Entry removed. |

`T/package.json:126` (`test:unit`) names the two subject tests. No other
test, support module or script under `T/test_env` names forward.
`T/test_env/proof` and `T/test_env/fixtures` hold no recorded forward value.

### 1.6 Qualification mirrors

Not edited; listed. No lane reads them.

| File | References |
| --- | --- |
| `test_env/qualification/inventory.json` | 2 each: `forward-command-contracts`, `forward-command-owners`, `forward-command-harness`, `forward-observation-carrier`, `forward-owner-lookups`, `forward-command/input`, `T287_C2_FORWARD_REENTRY_DESIGN`; 10 `worksite_command_forward` (the five source files, two each). |
| `test_env/qualification/recipe/verification-recipe.json` | The same. |
| `test_env/qualification/recipe/expected-output-inventory.json` | 10: `build/code/src/*/worksite_command_forward*.{js,d.ts}`. |
| `test_env/qualification/recipe/declared-commands.json` | None. |

The members this package changes, moves or deletes are listed in section 8.

### 1.7 Generated

`T/contracts` has no forward row. `product-toolchain-manifest.json` at base
carries forward in 188 declaration-inventory paths (47 Catalog rows times four
forward `.d.ts`), 10 product-relative locators, 2 contribution-manifest rows
and 1 publication binding (section 9).

## 2. Recorded history

**No: the map's finding ("no recorded execution of forward") does not hold.**
One recorded store carries two forward Runs. It sits outside the evidence root
and outside the map's replay set, which is why the map did not find it. No
default-library log and no log of the replay set carries a forward Run.

Searches (`rg -uu`, no size cap):

| Root | Pattern | Files |
| --- | --- | ---: |
| evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace` (154 GB), `*.json`/`*.jsonl` | `command-forward\|command_forward` | 8,513 |
| same | `retained_construction` | 3,034 |
| evidence root, `odd_glc`, `abiogenesis/build_tenants` (all files) | forward values: `worksite-command-forward-(task\|request\|helper-artifact\|execution-observation\|snapshot)://abiogenesis/<64 hex>`, or `"kind":"worksite_command_forward_(task\|request\|observation\|snapshot_member\|helper_artifact)"`, or `"kind":"retained_construction"` | 20 |
| evidence root and `odd_glc`, `*.json`/`*.jsonl` | a forward Program start (`public_operation_admitted`, `invocation_admitted` or `run_segment_opened` naming `program://abiogenesis/worksite/command-forward@5`) | 1 |

- Of the 8,513 broad hits: 624 are installed
  `product-toolchain-manifest.json` copies, 206 Catalog files, 398 inventories,
  42 locks, 73 transport files, 1,655 `*.jsonl` and 5,501 other records
  (workload, grant, acquisition, freeze and similar packets). They carry the
  forward module as installed-artifact content: Catalog rows, declaration
  inventories and `.d.ts` source text. The 3,034 `retained_construction` hits
  are that `.d.ts` text (`product/worksite_command_forward.d.ts`) and quoted
  source in transport prompts. The value-level search confirms it: no
  recorded value has kind `retained_construction` outside the 20 files below.
- The 20 value-level files:
  - 19 under `comments/codex/20260913_ABG5_PLAN_EXECUTION/`
    (`native-prep-01/native-02/` with `start-02/`, `resume-native-01/`,
    `resume-native-02/`, `fresh-ordinary-prep-01/inputs/`,
    `forward-consumption-01/proof/`): transport requests (`call-9.jsonl`,
    `call-10.jsonl`) that reopen one store, the forward input-identity
    records, one F_P transport archive (`fp-1ce2c5dbe79b16ab-*`) and one helper
    archive (`archives/worksite-command-execution/55d6e8b0…/3cfccb40…/`:
    a `worksite_command_forward_task`, its launch manifest at
    `5.0.0-dev.286`, and a `worksite_command_forward_helper_artifact` with
    disposition `success` and forward snapshot members);
  - the store they all name:
    `/Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test_runs/generic-live-workflow/data-mapper-full/20260908T154515Z_full-suite-01/epochs/d1-semantic-lifecycle-04/events-01/runtime.events.jsonl`
    (2,588 rows, 144,180,564 bytes, sha256 `4bb0676f…27c00`; copied to
    `/private/tmp/abg-td28d-work/hist/odd-glc-d1-04-forward.events.jsonl`).

The store's rows by index:

| Rows | Content |
| --- | --- |
| 0-2468 | The data-mapper-full D1 semantic lifecycle (kept features), September 8-11. |
| 2469 | `public_operation_artifact_admitted` whose Catalog names the forward module. |
| 2470-2471 | An artifact admission and a witness `reprice` admission. |
| 2472 | `declaration_reprice_admitted`: the L-to-P event-profile boundary; its content names the forward module. |
| 2473-2474 | A second witness `reprice` admission and a second `declaration_reprice_admitted`. No forward ref. |
| 2475-2521 | Forward Run `run://abiogenesis/a257568d…` (31 rows) with its Public, invocation, implementation and basis admissions: two graph calls, three C_Calls, ends `runtime_failure_observed` (`hog/child-completion-incomplete@5`). |
| 2522-2587 | Forward Run `run://abiogenesis/822cb207…` (66 rows): the F_P C2 actor ran (`actor_invocation_closed`), the child reached `terminal_reached` and folded back, and the Run ends `runtime_failure_observed` (`hog/runtime_basis_mismatch@5`). |

The forward rows were appended on September 13 by `5.0.0-dev.286`.

**Whether this is a stop: no.** The base build already refuses to decode the
whole store, at row 2474. Bisection with `validateHistoricalEvents` on the base
build (`scripts/bisect-decode.mjs`) shows:
- the first 2,474 rows decode;
- adding row 2474, the second `declaration_reprice_admitted`, refuses with
  "profile transition is not the one exact native witnessed L-to-P boundary";
- the refusal comes from `abg/event_store.ts:3940`
  (`assertRootEventProfileBoundary`). That check is generic: a store may carry
  only one profile boundary, and this one carries two. Nothing in it is
  forward's.

Row 2474 comes before the first forward Run row, so no kept path reads the
forward rows today. The retired code cannot be what reading them needs.
Nothing in `T/test_env`, `T/scripts` or `T/package.json` reads the store or the
19 files. `d1-preserved-result-mechanics.test.mjs:63-73` records that the
three cases which read this store were retired under T-290 C-18b.

The 2,474-row readable prefix
(`/private/tmp/abg-td28d-work/hist/odd-glc-d1-04-readable.events.jsonl`)
carries the forward module as Catalog and declaration-reprice content (rows
2469 and 2472). No other recorded store has a declaration reprice that names
forward. It therefore joins the replay, artifact-truth and lock comparison
(sections 11 and 12), and the bisection is repeated on the final build. Base
results for the prefix:
- replay: 2,474 rows decode;
- artifact truth: `artifact_truth_projection`
  `sha256:7cdcccd7c6c26ea42d99010848867c1cdad45977c2cb1086e5433c33980c5f71`
  over 13 artifact admissions;
- locks: nine, every one `isResolvedProductLock: true` with no capability
  mismatch.

The replay set (33 logs, section 11) names forward only as installed-artifact
content:
- `public_operation_artifact_admitted` rows in 31 logs, 3 module, 4 graph
  function and 4 Program refs per admission;
- the two FRAMED_GOVERNANCE final logs, which also name it in two
  `basis_admitted` rows and one `actor_transport_binding_admitted` row. The
  base build refuses both logs at decode.

`T/test_env/proof` and `T/test_env/fixtures` have none.
