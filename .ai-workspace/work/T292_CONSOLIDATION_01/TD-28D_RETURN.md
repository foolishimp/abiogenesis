# TD-28D Return: command forward (the C2 forward re-entry)

Writer: Claude Opus 5.5. Branch `claude/td28d-retire-command-forward` from
local `main` at `5c9df5056`, worktree `/private/tmp/abg-td28d`. Change class:
product_reprice (TD-28 ruling, 2026-11-12: forward is equivalent and retires).
No push, no tag.

**Status: complete, two rulings asked (R1, R2, section 15).** Command forward
is retired: the five source files, the forward arms and exports, the forward
module publication and its two graph functions, the four
`worksite_command_forward_*` kinds, the design note and the two subject lanes.
`code/src` +27 −873. Every forward door refuses with an existing code or
message (section 7); the declaration key `abg.worksite_command_forward` is
inert, not refused (R2). Helper output is byte-identical for the three kept
task kinds and start-up imports fall from 251 to 247 (section 3). The C2
renderer pin moves to `sha256:d59c28ac…0bb0876`, span unchanged (section 6).
90 lanes on the final build: no case from pass to fail; the only changes are
the deleted forward lanes, the new refusal lane and one moved case (section 10).
Replay and artifact-truth output over 33 recorded logs is byte-identical at
base and final (sections 11, 12). Recorded history: two forward Runs in one odd_glc store, already
unreadable at base (R1).

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
| `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md` | 3, 211, 397, 430, 623, 1076 | Forward as a subordinate binding, in lists of source laws and task owners, and (1076) as a "legacy semantic-stage/forward/preserved-result" path. | Restate. 1076 was missed by the first design commit and restated in a second (section 14). |
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
| `tests/t292-td37b-launch-identity.test.mjs` | 43, 76, 175, 182 | Forward is one of three launch loci; its binding ref is a mutation value. | Two loci; the mutation value becomes the revision binding ref; the forward-locus refusal is asserted in the new lane (section 8). |
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

## 3. Kept behaviour

C2 now accepts the prior-task union `WorksiteExecutionTask` of
`product/worksite_revision.ts` directly: the C2 construction-source task
(`worksite_command_execution_task`), the native and observed tasks, and the
revision task. At base, for each of these tasks, every `executableWorksiteCommand*`
helper returned the matching `worksiteExecution*` helper
(`product/worksite_command_forward.ts:166-181`). The C2 leaf, the helper, the
launch owner and the Product semantics therefore call the same functions on the
same values as before. Only the forward arms leave.

**Helper output.** Script `scripts/helperdiff.mjs` (output
`helperdiff/helperdiff.json`, result copies `helperdiff/*-{base,final}.result.json`)
builds one real worksite and, for each kept task kind, the same task with each
build's constructor. For each build it installs that build's `code/src` as the
toolchain helper at the same path, realizes the task through that build's C2
leaf (`realizeWorksiteCommandExecution`, which writes `task.json` and
`launch.json`), runs the helper process, and reads `result.json` and the
acknowledgment line. Both builds run at the same paths over the same files.
Each task has two commands (one reads a protected file, one writes inside the
allowed territory and exits 3) and two predicates.

| Task kind | Helper artifact | `result.json` sha256 (bytes) | Base = final |
| --- | --- | --- | --- |
| observed (`worksite_command_execution_task`) | `worksite_command_helper_artifact`, success | `e92755f7…2ece4e8` (10,059) | yes: task bytes, `task.json`, `launch.json`, `result.json`, stdout, exit status |
| C2 construction-source (`worksite_command_execution_task`) | `worksite_command_helper_artifact`, success | `6fdea24b…64159b7` (9,861) | yes, all six |
| revision (`worksite_revision_command_execution_task`) | `worksite_revision_command_helper_artifact`, success | `af154a35…fe038e0` (10,083) | yes, all six |

The native task is the observed task's sibling arm of the same union and runs
the same helper path; it is covered by the lanes in section 10
(`t287-native-worksite-execution`, `t287-native-c2-instruction-assembly`).

**Helper start-up imports** (`scripts/startup.mjs`, TD-37b method):

| | Base | Final |
| --- | ---: | ---: |
| static relative modules | 251 | 247 |
| runtime build modules | 251 | 247 |
| runtime package modules | 156 | 156 |
| median wall time | 352.9 ms (15 runs) | 341.3 ms (9 runs) |

The four modules that leave are the forward files the helper imported through
the union helpers: `abg/`, `gtl/`, `product/worksite_command_forward.js` and
`product/worksite_command_forward_identity.js`. None is added. The machine is
shared (load averages 10-13), so the times say only that start-up did not grow.

**Unchanged owners.** No file of C1, the chain, recovery or the construction
GTL changes (`git diff 5c9df5056` names none). `WORKSITE_CONSTRUCTION_GTL_IDS`
has the same 25 uses at base and final.

## 4. Specification

No edit (section 1.2).

## 5. Design

Commits `35cb0e67d` and `d43809aa1`.

- `T287_C2_FORWARD_REENTRY_DESIGN.md` moves to `design/history/` (100 %
  rename). Its kept content, the shared P3 undispatched owner refusal of every
  F_P leaf (forward sections 7 and 9), is restated in
  `T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md` section 6 with its
  realization sites (`implementation/leaf_invocation_port.ts`
  `closedUndispatchedProbabilisticOwnerReceipt`; `abg/c_call_outcome.ts` and
  `abg/c_call.ts` `undispatched_owner_refusal_evidence_candidate`,
  `undispatchedOwnerEvidenceMatches`; `abg/runtime_failure.ts`
  `undispatched_owner_failure_evidence`). The note's opening line and the
  source-qualification sentence drop forward.
- `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md`: lines 3, 211-212,
  397-398, 429-430, 622-623 and 1076 drop forward.
- `T287_DECLARED_TESTING_CAPABILITY_DESIGN.md:103`,
  `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md:755`: forward leaves the lists.
- `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:635`: the O-TYPE row
  loses the forward cover-vector example; its realization sentence now reads
  "Its realization across the constructors is TD-14 of the debt register
  (`T-290`)." `:651` loses the forward clause.
- `design/README.md` loses the index line; `design/history/README.md` gains the
  row and names the new `…__RETIRED_SECTIONS.md` file.
- Each cut passage is appended verbatim to the note's
  `history/…__RETIRED_SECTIONS.md` file, with its source commit and lines.

`ABI5_REALIZATION_CONSTITUTION.md` is not edited (no passage names forward).

## 6. Source lines removed

Code and scripts: commit `8febe4b06`; design `35cb0e67d`, `d43809aa1`; tests
`a6d10ca3a`. `git diff --numstat 5c9df5056 a6d10ca3a`:

| Area | Files | + | − |
| --- | ---: | ---: | ---: |
| `T/code/src` | 23 | 27 | 873 |
| `T/scripts` | 1 | 0 | 2 |
| `T/design` (two commits; retired text appended to `history/` counts as added) | 13 | 89 | 21 |
| `T/test_env` (section 8) | 20 | 145 | 443 |
| `T/package.json` (section 8) | 1 | 1 | 1 |
| `specification` | 0 | 0 | 0 |

`T/code/src`: the five forward files (655 lines) and 218 lines in 18 kept
files, of which 27 lines are rewritten imports and single-arm ternaries. The
largest kept-file cuts: `abg/worksite_revision.ts` −73 (the forward-only
retained vector `ClosedConstructionRetainedVector` /
`projectClosedConstructionRetainedVector`, its `RetainedOriginSession`
interface and session parameters), `product/builtin_semantics.ts` −37,
`product/worksite_command_execution.ts` −35 (+9),
`product/declaration_closure.ts` −11.

Checks on the final build: `npm run build` (generator pin check included),
`lint:imports`, `lint:lifecycle`, `lint:calculus` all exit 0. `tsc
--noUnusedLocals --noUnusedParameters`: 30 findings at base, 29 at final, none
new. Exports with no consumer: the same five names at base and final.

**C2 renderer pin** (`gtl/worksite_command_execution.ts`, member
`product/worksite_command_execution.js`):

| | Base | Final |
| --- | --- | --- |
| member digest | `sha256:b7dfeb2c3c287e5bd4a17fc25570911276cb330215e734b704a01d90c798657f` | `sha256:d59c28acaaadf3009550cdcc00ebe71084c33de9272fade3e419a08637bb0876` |
| byte length | 116,268 | 114,139 |
| span (`renderWorksiteCommandExecutionPrompt`) | 106,183-108,615 | 105,408-107,840 |
| span content digest | `sha256:1fcd71846ed7a57571a96bf3bb6475aeaba3d4f89eafb121969c157904a896bf` | unchanged |

The span is 2,432 bytes and occurs once in the file. The renderer's text did not
change; only bytes before it did.

## 7. Door table

Probes: `scripts/door-values.mjs` captures, on the base build, a real forward
request, task, worker result and observation, the forward module publication
and its Program, a kept C2 task and observation, and a forward and a C2
occurrence (`doors/values.json`). `scripts/door-probe.mjs` presents them at
each door on the base and the final build (`doors/probe-{base,final}.txt`,
comparison `doors/compare.txt`: 43 rows, 22 change). The refusal lane
`t292-td28d-command-forward-refused` asserts the final column (section 8).

**A forward task or request value:**

| Door | Base | Final |
| --- | --- | --- |
| Product input admission (`admitInput`) at the forward request and task contracts | admitted | `null`; at `run.invoke` this is the existing `invalid_input` `/input` refusal (`product/run_invocation_operation.ts:980-983`) |
| `admitInput` at the C2 and revision task contracts | `null` | same |
| `validateContractValue`, the four `worksite_command_forward_*` kinds | `true` | `false` |
| `validateContractValue`, C2 task, worker-result and observation kinds | `false` | same |
| `resolveJudgmentRelation`, the three forward predicates | a relation | `null` |
| C2 judgment over (forward task, forward observation) | `false` | same |
| C2 leaf `realizeWorksiteCommandExecution`, forward task at the forward locus | admitted; stops at the workspace check (`ENOENT` on the fixture root), as the kept-task control does | `TypeError` "command execution requires one exact admitted task" |
| same, forward task at the C2 locus | "C2 occurrence crosses task arm" | "command execution requires one exact admitted task" |
| Helper task-manifest rule (`helper:338`: base `isExecutableWorksiteCommandTask`, final `isWorksiteExecutionTask`) | `true` | `false`: "helper task manifest does not retain one exact Product task" (by reading) |

Two Product-semantics doors give the same answer only after input admission,
which now refuses first: `validateInvocationBasis` (`true` at both; the
default arm at final) and `resolveProbabilisticWorkerContracts` (base: the
forward worker-result contract; final: the generic default pair, as for any
F_P leaf).

**A start of the forward Program, or a Catalog or publication that names the
forward module or its graph functions:**

| Door | Base | Final |
| --- | --- | --- |
| Shipped publications (`gtl` constructors, the generator's list) | 10 with the forward module | 9; `gtl` and `./product` export no forward name |
| Catalog lookup of `command-forward@5` and `command-forward/execute@5` in Program `command-forward@5` | `graph_function_definition_lookup_exact` | `graph_function_definition_lookup_absent` |
| CatalogView allowlist naming a forward graph function (`narrowGraphFunctionCatalog`) | view | `catalog_construction_refusal` `unknown_allowlist_entry` |
| Program declaration closure for `program://…/command-forward@5` (the `run.start` path, `product/execution_resolution.ts:542-548`) | resolved | `execution_declaration_closure_refusal` `absent` "Program does not resolve to one exact publication"; `run.start` maps it to `absent` (`closureRefusal`) |
| A caller-built Catalog over the captured forward publication | admitted; lookup exact | same: the Catalog and the Validator are generic and admit any well-formed publication |
| Static validation of the captured forward Program (`validator.validateProgram`) | `program_validation`, 2 leaf rows | same |
| Execution of that Program at `run.start` (by reading) | runs | refused: the shipped install's `publicationBindings` no longer list the forward module, so `exactInstallForPublication` fails ("Program or selected GraphFunction lacks one exact admitted owner install", `wrong_owner` at `dependency`); a Product that republishes the module under its own install reaches implementation resolution, where no packaged LeafImplementation of this package matches the forward bindings (`implementation_absent`) |

**A C2 call whose task is a forward task:** the C2 task contract refuses it at
input admission on both builds (`admitInput` `null`, `invalid_input`). Inside
the leaf the final build refuses it with "command execution requires one exact
admitted task" (base: "C2 occurrence crosses task arm"). A C2 occurrence at the
forward locus is refused by the parent ("command execution requires one exact
authority-free C2 occurrence"; base "C2 occurrence crosses task arm") and by
the helper launch rule (`isAuthorityFreeWorksiteCommandOccurrence`: base
`true`, final `false`, so "helper received an invalid command-execution launch
manifest").

No new refusal code or message: every final refusal above existed at base.

**Not refused: the declaration key `abg.worksite_command_forward`.** At base a
GraphFunction carrying the key outside the exact forward Program was refused
by the declaration closure (`wrong_owner`, "forward C2 must retain its exact
finite no-construction Program and historical-proof marker"). At final the key
is treated as any unknown `abg.*` declaration key: the closure resolves and the
Validator returns `program_validation` with no diagnostic, exactly as for the
control key `abg.probe_unknown_key` (admitted at base and final). No owner
reads the key, so it has no effect. Refusing it would need either a
forward-named arm in the closure or a whitelist of declaration keys; this is
raised as ruling R2 (section 15).

## 8. Tests and fixtures

Commit `a6d10ca3a` (`T/test_env` 20 files +145 −443, `T/package.json` +1 −1).

| File | Change |
| --- | --- |
| `tests/forward-command-contracts.test.mjs` | deleted (162 lines, 10 tests). Its one kept-behaviour claim (an explicit zero write territory survives the C2 task constructor and a cold round-trip; an absent or non-array territory throws) moves to `t287-worksite-command-execution` |
| `tests/forward-command-owners.test.mjs` | deleted (71, 6 tests); every claim is about a forward owner |
| `support/forward-command-harness.mjs` | deleted (40) |
| `support/forward-owner-lookups.mjs` | deleted (121) |
| `support/forward-observation-carrier.mjs` → `support/c2-observation-carrier.mjs` | moved; the forward arm leaves; it now owns `product`, `hash` and `componentTask()` (previously in the harness) and calls `worksiteExecution*` |
| `fixtures/forward-command/input.mjs` → `fixtures/c2-component/input.mjs` | moved; `constructC2ComponentTask(product)` returns only the original C2 task. Its bytes are unchanged, including the `/component/forward` scratch paths (data, not a name) |
| `tests/t287-worksite-command-execution.test.mjs` | the helper-failure-subject case takes its task from the carrier and calls `worksiteExecution*`; every assertion stays. New case: the zero-write-territory claim above |
| `tests/t287-native-semantic-revision.test.mjs`, `tests/t287-native-work-currentness-consumers.test.mjs` | import `observationFor` from the moved carrier |
| `tests/t287-native-semantic-job.test.mjs` | `worksiteExecutionSources` from `product/worksite_revision` |
| `tests/t287-owned-process-lifetime.test.mjs` | the control stub targets `/worksite_revision.js` and the names the helper now imports |
| `tests/t292-td37b-launch-identity.test.mjs` | two launch loci; the mutation value is the revision binding ref |
| `tests/t292-td37a-worksite-subject.test.mjs` | the snapshot case uses a C2 task shape (`protectedObservations`) |
| `tests/t287-c2-child-program`, `t287-w2-05-install-catalog-owner-chain`, `steel-basic-cli-public`; `uat/public-setup.mjs`; `support/installed-qualification-conservation.mjs` (two lists); `support/d2-frame-fixture.mjs` | the forward constructor leaves each publication list |
| `T/package.json` | the two subject tests leave `test:unit` |
| `tests/t292-td28d-command-forward-refused.test.mjs` | new refusal lane, 3 tests: a forward-shaped task and request are admitted by no Product owner and refused by the C2 leaf and the helper task rule; the forward locus is refused by the parent and the helper launch rule; the shipped publications carry no forward module, `gtl` and `./product` export no forward name, and the Catalog refuses the forward Program and graph functions (`lookup_absent`, `unknown_allowlist_entry`, closure `absent`), with controls |

The refusal lane fails on base. Copied with the moved carrier and fixture into
the base tree (removed after; TAP `lanes-refusal-base/refused-on-base.tap`) it
gives 3 tests, 0 pass, 3 fail: test 1 at the first forward predicate
(`resolveJudgmentRelation` returns the forward step relation; the forward-shaped
values are not exact forward values, so the base `admitInput` and
`validateContractValue` lines already hold), test 2 at the launch rule (`true`
at the forward locus), test 3 at the `gtl` forward exports
(`constructWorksiteCommandForwardModulePublication`,
`isWorksiteCommandForwardGraphFunction`, `worksiteCommandForwardGraphFunctions`).
On the final build it passes 3 of 3.

Qualification members this package changes (the mirrors are not edited):
- deleted: the five `code/src/*/worksite_command_forward*.ts`,
  `design/T287_C2_FORWARD_REENTRY_DESIGN.md` (moved), the two subject tests,
  `support/forward-command-harness.mjs`, `support/forward-owner-lookups.mjs`;
- moved: `support/forward-observation-carrier.mjs`,
  `fixtures/forward-command/input.mjs`;
- added: `tests/t292-td28d-command-forward-refused.test.mjs`,
  `design/history/T287_PENDING_CONSUMER_CONTINUATION_DESIGN__RETIRED_SECTIONS.md`;
- changed: the 18 kept `code/src` files and `scripts/generate-product-manifest.mjs`
  (section 6), the design notes of section 5, `package.json`, the test and
  support files above;
- generated (not committed): `product-toolchain-manifest.json`,
  `contracts/capabilities/capability-definition-graph.json`,
  `contracts/worksite/command-execution-context.inventory.json`, and the ten
  `build/code/src/*/worksite_command_forward*.{js,d.ts}` outputs of
  `expected-output-inventory.json`.

## 9. Generated contracts and identity digests

Final build (`build-final-4.log`, the tree of the tests commit) against base build (`gen-base/`, `gen-final2/`, `capgraph-base.json`, `capgraph-final2.json`). `package.json` is Product content (`files` plus the package file itself), so its `test:unit` edit moves `productContentDigest` too; a build of the code commit alone (`gen-final/`) has the same rows, locators, Catalog and capability rows, with `productContentDigest` `sha256:50855ca2…`.

**What leaves the manifest:**
- the publication binding of `module://abiogenesis/worksite/command-forward@5`
  (`sha256:dd88263a…16a040`); 10 bindings become 9;
- the two contribution rows (`graph-function://…/command-forward@5` and
  `…/command-forward/execute@5`); 49 rows become 47; no row is added and no
  other row changes beyond identity-following fields;
- 10 product-relative locators (the five forward files, `.js` and `.d.ts`);
  5,316 become 5,306; no locator changes;
- in the public contract catalog, the four forward `.d.ts` paths leave the
  declaration inventory of each of 47 rows (188 entries). Six `.d.ts` entries
  change digest in those rows because the forward exports leave them
  (`abg/index`, `gtl/index`, `product/index`, `product/builtin_semantics`,
  `product/worksite_command_execution`, `implementation/contracts`). 21 row
  contract digests follow the inventory. The 75 rows differ in nothing else.

No Catalog entry, contract row or schema arm of the shipped Catalog carried the
forward kinds except through the forward publication itself; its contracts and
graph functions leave with it. Public operations, members and event kinds are
unchanged.

**Identity digests:**

| | Base | Final |
| --- | --- | --- |
| `productContentDigest` | `sha256:cf8787da8f1b268f7816f9c62754630dacbc6c919b469f4718310f25ab999eb2` | `sha256:fafa2db25c2a0a0049b12bd33470accf9205ab1b2a21ad9b3f28704d529b6f46` |
| `contributionManifestDigest` | `sha256:da6c0bc7b41a4ade9ece3dfbdae54b6befe28586594cfd70acef5cbe608979a9` | `sha256:023fd72e4218acd2bd13854112dcb30314359fd4930fdac7fa1d50121e050aad` |
| public contract `catalogDigest` | `sha256:4e60f0f1aa43c187e6e8534131f4a8cd36c20682c4153d177a92ced3b420ab75` | `sha256:0cb13d31dcbec21fd320a3c27802985bceb983197a733f933edf0cc5801ab10d` |
| capability `graphDigest` | `sha256:4afda51db02375d4d58b1a86dde5b29d153cddc37133a0fd81e86fac41c6a98b` | `sha256:5ab72534e106e76dc228d58f46883d8892d398f761f142803a81128fc562d315` |

The other nine publication digests change in the manifest only because the
publication basis carries `productContentDigest`. Under one fixed artifact
basis (`scripts/pubcmp.mjs`) eight of them are equal at base and final; the
C2 publication differs only in its renderer pin (member digest, byte count,
span offsets and the inventory and record digests over them;
`scripts/c2pubdiff.mjs`).

**Capability graph rows:** 16 at base and final; compared with the
identity-following fields (`capabilityDefinitionDigest`/`Ref`, `catalogDigest`,
`productContentDigest`) set aside, no row differs (`scripts/capgraph-cmp.py`).
`contracts/worksite/command-execution-context.inventory.json` changes only in
the member digest of the pin.

**Event kinds:** forward declared no event kind and appended none (its
`abg/` file only read admitted results, judgments and Run events). No event
kind loses its producer.

**Public `.d.ts`:** `./product` no longer exports `WORKSITE_COMMAND_FORWARD_IDS`,
the forward request/task/observation types, constructors and guards,
`isWorksiteCommandForwardObservation`, the `executableWorksiteCommand*`
helpers and `isExecutableWorksiteCommandTask`; `gtl` no longer exports the
three forward GTL functions; `abg` and `implementation` lose the forward
owners. Their kept equivalents (`worksiteExecution*`, `isWorksiteExecutionTask`)
were already exported.

## 10. Lanes before and after

Each test file ran alone through `scripts/lane.sh` (`node --test
--test-concurrency=1`, one file at a time, each waited for), base in
`base-root` (a checkout of `5c9df5056` with its own build), final in the
worktree on the rebuilt final build. TAP and summaries: `lanes-base/`,
`lanes-final/`; table: `lane-table-final.md` (`scripts/lane-table.py`).

| | Lanes | Tests | Pass | Fail | Skip | Cancelled |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Base | 91 | 679 | 652 | 0 | 27 | 0 |
| Final | 90 | 667 | 640 | 0 | 27 | 0 |

The difference is the package's own test change: the two forward subject
lanes leave (`forward-command-contracts` 10/10 and `forward-command-owners`
6/6 at base, deleted), the refusal lane `t292-td28d-command-forward-refused`
comes (3/3), and `t287-worksite-command-execution` gains the moved
zero-write-territory case (12/12 → 13/13). Every other lane has the same
tests, pass, fail and skip counts at base and final. No case went from pass to
fail; no case timed out, so no rerun was needed. The five artifact-truth lanes
of the rules (`t287-historical-source-resource`, `r10-child-proof`,
`t287-cross-cut-public-read`, `t287-selected-action-authority`,
`t287-native-assessment-evidence`) are the last five rows and are unchanged.

Known reds of the rules: `t287-cross-cut-public-read` passed 5/5 on both
builds in this run; `witness-reprice-definition-binding` is not in this
package's lane list and was not run.

**Skips (27, the same cases at base and final).** Six need a live provider and
are skipped for that reason (no model call): `t287-declared-testing-capability`
×2 (`ABG_TS_CLAUDE_COMMAND`), `t287-amendment-witness` live case
(`ABI5_AMENDMENT_WITNESS_LIVE`), `t287-default-library` installed Public
invocation (`ABI5_DEFAULT_LIBRARY_LIVE`), `t287-generic-job-lifecycle` full
native traversal (`ABI5_GENERIC_JOB_FULL_NATIVE`), `t287-generic-job-revision`
native correction (`ABI5_GENERIC_JOB_CORRECTION_NATIVE`). The other 21 need
retained evidence, frozen artifacts or fixture paths that are not selected on
this machine: `steel-basic-cli-c2` ×6 (`ABI5_C2_CARRIER_FIXTURE_PATH`),
`w2-steel-serial-branch-installed` ×2 and `w2-steel-single-start-installed`
(frozen Wave 1 artifact), `t287-native-frame-observation` ×2,
`t287-native-worksite-execution` ×2, `t287-governance-covered-source-use` ×2,
`t287-native-work-reacquisition`, `t287-native-work-reacquisition-normalization`,
`t287-predecessor-context`, `t287-management-context` (Public-start proof
selector), `t287-selected-action-authority` (selected-action owner subject),
`t287-installed-qualification-conservation`.

| Lane | Base (tests/pass/fail/skip) | Final | Change |
| --- | --- | --- | --- |
| `forward-command-contracts` | 10/10/0/0 | (deleted) | subject lane of the retired module |
| `forward-command-owners` | 6/6/0/0 | (deleted) | subject lane of the retired module |
| `t292-td28d-command-forward-refused` | (new) | 3/3/0/0 | new refusal lane |
| `t292-td37b-launch-identity` | 4/4/0/0 | 4/4/0/0 | none |
| `t292-td37a-worksite-subject` | 16/16/0/0 | 16/16/0/0 | none |
| `t292-td37a-path-relation` | 6/6/0/0 | 6/6/0/0 | none |
| `t287-owned-process-lifetime` | 34/34/0/0 | 34/34/0/0 | none |
| `t287-c2-child-program` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-native-semantic-job` | 9/9/0/0 | 9/9/0/0 | none |
| `t287-native-semantic-revision` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-native-work-currentness-consumers` | 6/6/0/0 | 6/6/0/0 | none |
| `t287-w2-05-install-catalog-owner-chain` | 3/3/0/0 | 3/3/0/0 | none |
| `steel-basic-cli-public` | 1/1/0/0 | 1/1/0/0 | none |
| `steel-basic-cli-c2` | 6/0/0/6 | 6/0/0/6 | none |
| `t287-installed-qualification-conservation` | 1/0/0/1 | 1/0/0/1 | none |
| `d2-bounded-repair` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-generic-job-intake` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-generic-job-lifecycle` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-generic-job-revision` | 2/1/0/1 | 2/1/0/1 | none |
| `t287-generic-job-read-dependency` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-generic-job-meaning` | 3/3/0/0 | 3/3/0/0 | none |
| `t287-management-context` | 13/12/0/1 | 13/12/0/1 | none |
| `t287-management-supervision` | 5/5/0/0 | 5/5/0/0 | none |
| `t292-td34a-run-invocation-schema-owner` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-rp2-behavior-carriers` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-st1-installed-cross-owner-hello` | 3/3/0/0 | 3/3/0/0 | none |
| `t287-worksite-command-execution` | 12/12/0/0 | 13/13/0/0 | +1: the moved zero-write-territory case |
| `t287-observed-worksite-command` | 8/8/0/0 | 8/8/0/0 | none |
| `t287-native-c2-instruction-assembly` | 1/1/0/0 | 1/1/0/0 | none |
| `t288-instruction-assembly-owner` | 4/4/0/0 | 4/4/0/0 | none |
| `t287-native-assembly-retained-input` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-c2-core-environment` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-worksite-branch-construction` | 2/2/0/0 | 2/2/0/0 | none |
| `m5-worker-transport` | 39/39/0/0 | 39/39/0/0 | none |
| `t287-declared-testing-capability` | 5/3/0/2 | 5/3/0/2 | none |
| `t287-lifecycle-failure-carrier` | 8/8/0/0 | 8/8/0/0 | none |
| `w2-steel-serial-branch-installed` | 2/0/0/2 | 2/0/0/2 | none |
| `w2-steel-single-start-installed` | 1/0/0/1 | 1/0/0/1 | none |
| `t287-d1-semantic-stage` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-event-body-encoding` | 25/25/0/0 | 25/25/0/0 | none |
| `t287-predecessor-context` | 1/0/0/1 | 1/0/0/1 | none |
| `d2-acknowledgment` | 3/3/0/0 | 3/3/0/0 | none |
| `m5-event-calculus-runtime` | 18/18/0/0 | 18/18/0/0 | none |
| `m5-retry-lifecycle-authority` | 8/8/0/0 | 8/8/0/0 | none |
| `t287-calculus-fold` | 25/25/0/0 | 25/25/0/0 | none |
| `t287-native-frame-observation` | 3/1/0/2 | 3/1/0/2 | none |
| `t287-qual056-material` | 8/8/0/0 | 8/8/0/0 | none |
| `t287-retry-run-prefix` | 3/3/0/0 | 3/3/0/0 | none |
| `t287-runtime-failure-diagnostic` | 21/21/0/0 | 21/21/0/0 | none |
| `d2-binding-transition` | 10/10/0/0 | 10/10/0/0 | none |
| `d2-workflow-step` | 8/8/0/0 | 8/8/0/0 | none |
| `t287-authenticated-owner-values` | 2/2/0/0 | 2/2/0/0 | none |
| `t287-recursive-registered-selection` | 7/7/0/0 | 7/7/0/0 | none |
| `t287-recursive-failure-foldback` | 8/8/0/0 | 8/8/0/0 | none |
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
| `t287-governance-covered-source-use` | 9/7/0/2 | 9/7/0/2 | none |
| `t287-amendment-witness` | 13/12/0/1 | 13/12/0/1 | none |
| `t287-w2-05-release-snapshot-definition-bindings` | 1/1/0/0 | 1/1/0/0 | none |
| `t287-release-publication` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-release-acceptance` | 6/6/0/0 | 6/6/0/0 | none |
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
| `t287-single-address-space-consolidation` | 17/17/0/0 | 17/17/0/0 | none |
| `harness` | 33/33/0/0 | 33/33/0/0 | none |
| `t287-historical-source-resource` | 4/4/0/0 | 4/4/0/0 | none |
| `r10-child-proof` | 10/10/0/0 | 10/10/0/0 | none |
| `t287-cross-cut-public-read` | 5/5/0/0 | 5/5/0/0 | none |
| `t287-selected-action-authority` | 3/2/0/1 | 3/2/0/1 | none |
| `t287-native-assessment-evidence` | 4/4/0/0 | 4/4/0/0 | none |

## 11. Replay comparison

`scripts/replay-log.mjs` (the TD-25R/TD-28b script) over the 33 logs of
`replay-set.txt`: TD-28b's 31 (the 19 default-library logs of map 6.4, the
rc.12 Run store, two registered-selection logs and nine logs of earlier replay
sets, `test_env/proof/abi5-root-r10.events.jsonl` among them) and the two
FRAMED_GOVERNANCE final logs that name forward in basis and transport rows
(section 2). Per log: the whole-log replay digest, event-kind counts, owner
facts and the per-Run replay against full authority.

| | Base | Final |
| --- | --- | --- |
| logs that decode | 11 (17,899 rows) | 11 (17,899 rows) |
| logs refused at decode | 22: 19 "event stamp differs from the exact native profile schedule", 2 "durable ABG event log contains a noncanonical event", 1 "runtime event payload matches no admitted event-contract variant" | the same 22, same messages |
| output (`replay-base.jsonl`, `replay-final.jsonl`) | | byte-identical (`cmp`) |

The odd_glc store of section 2:
- the 2,474-row readable prefix replays to byte-identical output on both
  builds (`hist/replay-readable-{base,final}.jsonl`);
- the whole store is refused at decode on both builds with the same generic
  message; the bisection on the final build gives the same first refusing row
  (index 2474, `declaration_reprice_admitted`, "profile transition is not the
  one exact native witnessed L-to-P boundary"). The forward rows (2475-2587)
  are unreadable on base and final alike.

## 12. Artifact truth over recorded stores

`scripts/probe-artifact-truth.mjs` over the 33 logs of `truth/truth-set.txt`
(the rc.12 store and the replay set): 11 project `artifact_truth_projection`
and 22 are refused at decode (the same 22 as section 11), on both builds;
`truth/truth-base.jsonl` and `truth/truth-final.jsonl` are byte-identical.

| Store | Base | Final |
| --- | --- | --- |
| rc.12 Run store (1,695 rows, 3 artifact admissions; row 0 names the forward module 11 times) | `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f` | same |
| rc.12 locks (`scripts/probe-lock.mjs`): one inline lock (rows `typescript-tenant@5.0.0-rc.12`, `default-library-witness/consumer@5`) and one lock reference | `isResolvedProductLock: true`, no capability mismatch | same (byte-identical output) |
| odd_glc readable prefix (13 artifact admissions; rows 2469 and 2472 name the forward module) | `sha256:7cdcccd7c6c26ea42d99010848867c1cdad45977c2cb1086e5433c33980c5f71`; 9 locks resolved, 0 mismatches | same (byte-identical outputs) |

Recorded install records that list the forward module keep resolving: the lock
and truth owners compare a recorded lock with the recorded manifest it names,
not with the current Product's module list. Capability graph rows: section 9.
The five artifact-truth lanes are in section 10.

## 13. Whole-word search

After the change, over `T` (without `build/`, `node_modules/`,
`test_env/test_runs`, `test_env/downstream`, `test_env/evidence`) and
`specification`, for `command[-_]forward`, `CommandForward`, `forward[-_]command`,
`forward-observation`, `forward-owner`, `executableWorksiteCommand`,
`retained_construction`, `ClosedConstructionRetainedVector`,
`RetainedOriginSession`, `C2_FORWARD_REENTRY`, `forward re-entry`, `forwardIds`
and `FWD` (case-insensitive). Files found:
- `test_env/tests/t292-td28d-command-forward-refused.test.mjs` (the refusal lane);
- `design/history/`: the moved note, `README.md` and three
  `…__RETIRED_SECTIONS.md` files (retired text, by design);
- the three qualification mirrors (not edited, section 1.6).

No file of `code/src`, `scripts`, live `design` or `specification` names
forward. The remaining "forward" words in `code/src` and live `design` mean a
forward reference or forwarding a value (section 1.3).

## 14. Deviations

1. **Lanes ran in a background runner.** Each test file ran alone, in order,
   through `scripts/lane.sh` (one `node --test` per file, waited for before the
   next). The base list ran under `nohup` in `base-root` and the final list in a
   background Bash, each while no other test ran; I did not end a turn while
   either was running. The working rule asks for foreground runs; the tool
   moves a foreground command to the background after 180 s, and the lists take
   about an hour each.
2. **A second design commit after the code commit.** The first design commit
   (`35cb0e67d`) missed `T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md:1076`
   ("Legacy semantic-stage/forward/preserved-result paths …"); the whole-word
   check before the tests commit found it, and `d43809aa1` restates it. The
   commit order is therefore design, code, design, tests, Return.
3. **The refusal lane presents forward-shaped values, not recorded ones.** The
   final build has no forward constructor, so the lane builds a forward-shaped
   task (the kept C2 task under the retired kind) and request. The door probe of
   section 7 presents the real values captured from the base build.
4. **Two support files are moved, not edited in place.** The carrier and the
   fixture were named after forward but serve kept C2 cases; they move to C2
   names (`support/c2-observation-carrier.mjs`, `fixtures/c2-component/input.mjs`)
   so the whole-word search finds no retired name outside the refusal lane.
5. **The first final lane run used a stale manifest and was discarded.** The
   final build was made before the tests step edited `package.json`
   (`test:unit`), which is Product content. Four installed lanes refused with
   `product_content_mismatch` ("packed payload digest differs from the
   manifest"). I stopped the run after 23 lanes, rebuilt (`build-final-4.log`),
   re-ran the door, helper, start-up, replay, truth and lock probes on the new
   build (all unchanged) and ran the whole final list again from the start.
   The discarded TAP is kept in `lanes-final-stale-build/`.

## 15. Residuals and rulings

No residual defect. Two points need a ruling.

**R1. Recorded history: the map's finding does not hold.** Map 4.5 f says
forward has no recorded execution. One store holds two forward Runs (section
2): the odd_glc data-mapper-full D1 store, rows 2475-2587, appended on
September 13 by `5.0.0-dev.286`, with 19 Codex evidence files under
`comments/codex/20260913_ABG5_PLAN_EXECUTION/` that point at it. It is not a
stop: base already refuses to decode the store at row 2474 under the generic
one-profile-boundary rule, so no kept owner reads the forward rows before or
after this package, and nothing in `T` reads the store. Ruling asked:
accept that these two forward Runs stay unreadable as they already are, and
correct map 4.5 f. My reading: accept; the retirement changes nothing a reader
can reach.

**R2. The declaration key `abg.worksite_command_forward` is now inert, not
refused** (section 7). At base the declaration closure refused it on any
GraphFunction outside the exact forward Program. At final it is an unknown
`abg.*` key: admitted at every door, read by no owner, exactly as the control
key. Refusing it needs either a forward-named arm in `product/declaration_closure.ts`
(the retired name kept in kept code) or a whitelist of declaration keys (a
design change that refuses every unknown key). TD-28c's retired keys sat in
run-environment policies, where an existing Validator rule refused them
(`invalid_reference $.runEnvironments`); no owner lists the admissible
GraphFunction declaration keys, which is why the control key is admitted at
base and final. My reading: accept the key as
inert. If the rule "retired shape refused, not ignored" is meant to cover
declaration keys, the closed key set is the lawful form, and it is a
`design_reframe` of declaration admission, outside this package.

## 16. Commits

On `claude/td28d-retire-command-forward`, in order, none pushed:

| Commit | Step |
| --- | --- |
| `048e3e78f` | Return skeleton |
| `35cb0e67d` | design: the forward note moves to `design/history/`, live notes restated |
| `8febe4b06` | source: the five forward files, the forward arms and exports in 18 kept files, the generator's list |
| `d43809aa1` | design follow-up: C2 design line 1076 (deviation 2) |
| `a6d10ca3a` | tests: two subject lanes deleted, carrier and fixture moved, refusal lane added, kept lanes adjusted |
| (this commit) | Return |

Generated files (`product-toolchain-manifest.json`,
`contracts/capabilities/capability-definition-graph.json`,
`contracts/worksite/command-execution-context.inventory.json`) are rebuilt in
the worktree and not committed.
