# TD-26 P3 Return: the continuation operations, write side

**Status:** complete; no stop condition holds, on the reading in "Needs a
ruling", item 1. `run.continue#selected_action` stays declared with its
contracts published and is refused `installed_binding_unavailable`; a
construction-intent body of `current_intent` is refused
`invalid_definition_call`. A pending-execution continuation of a
registered-selection Run and of two Executive Runs is admitted by the same
owner and appends events of the same kinds, order and keys; their values
differ from base only in product identity values, the moved `current_intent`
definition digest (item 1) and, in one case, the timing-dependent byte
lengths of a recorded command output. The final build reads
continuations recorded on base exactly as the base build does. The pins move
to 56 declared, 45 callable, 11 unavailable. The 23 replays and artifact truth
over 25 stores are identical on base and final; the capability graph rows are
identical apart from digests and the digest-sorted order of owning contracts
in 4 rows. No kept lane goes from pass to fail. 797 source lines go net (98
added, 895 removed). Three items need a ruling (last section).

Commits on `claude/td26-p3-continuation-write-side`, in order:
- `b573e3857`: census (Return skeleton);
- `425807461`: code;
- `60baa0389`: tests;
- this Return.

Generated files are not committed.

Base: local `main` at `c02abccb8`. Branch `claude/td26-p3-continuation-write-side`,
worktree `/private/tmp/abg-td26p3`. T is `build_tenants/abiogenesis/typescript`.
Scratch is `/private/tmp/abg-td26p3-work/`.

## Census

Searched at base, whole word, for: `selected_action`, `selectedAction`,
`current_intent`, `currentIntent`, the write-side symbols listed below,
`constructionResume`, `continuedFrom`, and the four refusal codes
`stale_action`, `action_mismatch`, `reprice_mismatch`, `intent_mismatch`.
`current_intent` is the kept member key; a hit on it is a census row only when
it names the construction-intent alternative.

### Specification

No file under `specification/` names the `selected_action` member, the
construction-intent alternative or the four codes. No specification edit.

### Kept design notes (listed, not edited)

| Note | Lines | What the sentence states |
|---|---|---|
| `T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md` | `:29`, `:213`, `:346` | the explicitly selected `current_intent` (construction-intent) operation |
| same | `:372-374` | the pending alternative is "a second, exclusive request arm" of `current_intent`; closed domain `["current_intent", "pending_execution"]` |
| same | `:405` | `stale_action` is not produced (pending alternative) |
| same | `:458`, `:535` | `memberKey: "current_intent"` payloads; no `current_intent` widening |
| same | `:552` | change-ledger row: "One request arm; one `continuationKind` value; refusal unchanged" |
| `T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md` | `:655` | `current_intent` and `selected_action` gain one optional field |
| `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md` | `:258` | `constructInstalledPendingCall` builds a `current_intent` call |
| `M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md` | `:236` | `run.continue` `current_intent`/`selected_action` and F_H continuations |
| `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md` | `:294`, `:637`, `:1663-1684`, `:1811-1812`, `:2273` | both members, the `currentIntent` request field, the selected-action request and outcome, the CLI mode list |
| `M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md` | `:2222`, `:2380` | both members' ports; `current_intent` relation |
| `ABI5_REALIZATION_CONSTITUTION.md` (not edited, listed) | `:1290`, `:1422-1423`, `:1682-1683`, `:1932-1933`, `:3082` | both members, E31/E32, R31/R32, the port rows, the continuation decision |

### Source (`T/code/src`)

Write side to delete:

| File | Declarations | Callers |
|---|---|---|
| `abg/construction_continuation.ts` | `admitPendingConstructionIntentContinuation` `:140-153`; `preparedRelations`, `prepareConstructionIntentContinuation`, `PreparedConstructionIntentContinuation` `:373-476`; `ConstructionContinuationOperationResult`, `preparedOperations`, `prepareConstructionContinuationOperation`, `PreparedConstructionContinuationOperation`, `isPreparedConstructionContinuationOperation` `:519-557`; `admitConstructionContinuationReentry` `:564-616`; `selectedPreparations`, `prepareSelectedActionContinuation`, `PreparedSelectedActionContinuation`, `admitSelectedActionContinuationOperation` `:786-855` | `hog/graph_execute.ts:1131`; `hog/entry.ts:356-435`; `owner_bindings/run_invocation.ts:1343-1349`; `abg/execution_basis.ts` (the prepared-operation guard) |
| `abg/execution_basis.ts` | `admitConstructionContinuationExecutionBasis` `:2855-2897` | `hog/entry.ts:376` only |
| `abg/traversal_cursor.ts` | `admitContinuedTraversalCursor` `:848-856`; the `continuedFrom` parameter of `admitTraversalFrameCursor` `:673`, `:706-713`, the `source?.` fallbacks `:728-742`, the payload spread `:794` | `hog/entry.ts:380`, `:411` |
| `hog/entry.ts` | `prepareConstructionContinuationTraversal` and its imports `:356-435` | `run_invocation.ts:1546` only |
| `hog/traversal_contract.ts` | `InteractionResumeTraversalEntryInput` `:75-97` (TD-25 residue; its only reader is the deleted entry function), `ResumeConstructionIntentInput` `:99-103`; the arm of `ExecuteGraphTraversalRequest` `:116-119` | `hog/entry.ts:25`, `hog/graph_execute.ts:80` |
| `hog/graph_execute.ts` | the import `:1`, `:80`; `ParentReturnsPreflight`, `preflightParentReturns`, `exactParentReturns` `:859-923`; the `constructionResume` branch of `traversalProgram` `:1105-1111`; the post-traversal `admitPendingConstructionIntentContinuation` call in `executeOwnedGraphTraversalEffect` `:1126-1134` | |
| `owner_bindings/run_invocation.ts` | `SelectedActionPacket` `:139`; `selectConstructionIntentAtPrefix` `:1406-1437`; `selectSelectedActionAtPrefix` `:1468-1496`; `runCurrentIntentOwner` (its construction arm; the pending dispatch moves to the binding) `:1498-1571`; `runSelectedActionOwner` `:1573-1642`; the `selected_action` binding `:1897-1899` | |

Kept code to edit:

| File | Site | Edit |
|---|---|---|
| `owner_bindings/run_invocation.ts` | `RunPacket` `:140`; imports `:1343-1349`; `continuationOutcome` `:1644-1659`; `RunContinuationSelectionIntent` `:1741-1748`; `RunContinuationPopulationRefusal` `:1750-1755`; `PopulatedRunContinuation.memberKey` `:1759`; `populateRunContinuationAtDurablePrefix` `:1778-1868`; `RUN_DEFINITION_BINDINGS` `:1901-1904` | narrow to the pending-execution alternative; population refuses any other selection kind with `missing_continuation` |
| `product/run_operation_contracts.ts` | the `currentIntent` request object `:201-207`; `continueRefusalSchema` `:177-187`; `RunContinuationPort.selected_action` `:335` | `current_intent` keeps the `pendingCursor` request only and a five-code refusal list; `selected_action` keeps its definition byte-identical |
| `product/run_invocation_operation.ts` | `RunOperationKey` `:381`; the `selected_action` invocation type and arm of `runOperationAuthorityMatches` `:446`, `:473` | `current_intent` only |
| `public/installed_public_definition_call.ts` | `InstalledPendingCallSelection` `:411-424`; `constructInstalledPendingCall` `:591-654` | pending execution only |

Kept importers of what goes (ruling 7):

| Importer | What it imports | After |
|---|---|---|
| `hog/graph_execute.ts:1-2` | `projectPendingCursorInputAtPrefix`, `projectPendingExecutionContinuations`, `rematerializeAdmittedBasisGraph` | stay in `abg/construction_continuation.ts` (pending part) |
| `hog/graph_execute.ts` pending path | `resumeEntryRefusal`, `rehydrateParentReturnFrames`, `machineWorkflowReturn` | stay in `hog/graph_execute.ts` |
| `owner_bindings/run_invocation.ts` | `selectPendingExecutionUse`, `preparePendingExecutionContinuation`, `projectPendingExecutionInputAtPrefix`, `admitPendingExecutionContinuationOperation`, `PendingExecutionUseRequest`, `projectPendingExecutionContinuations`, `projectPendingExecutionUseRequest` | stay in `abg/construction_continuation.ts` |
| `abg/construction_continuation.ts` pending admission | `constructionContinuationOperationCandidate`, `continuationOperationWorkspaceCorresponds` | stay (shared with the kept pending admission) |
| `abg/construction_continuation.ts` read side | `selectPendingActionUse`, `pendingSelectedOccurrence` (used by `projectSelectedActionOperation`) | stay until P5 |
| `abg/traversal_cursor.ts` read side | `continuedCursorOrigin` (used by `projectCursorAncestry`) | stays until P5 |
| `abg/index.ts:169` | `admitInitialTraversalCursor` | stays; keeps refusing a ninth (continuation-origin) argument with `cursor_mismatch` |
| `hog/index.ts` | `ExecuteGraphTraversalRequest`, `HeldWorkflowSuspension` | names stay; the request type loses the construction-resume arm |

The four `abg/execution_basis.ts` exports of `./abg` and `./abg/m03`
(`admittedConstructionComposition`, `hasExactInvocationObservationBasis`,
`isAdmittedConstructionInteractionLocus`, `selectAdmittedConstructionAuthority`)
are §3.2 guards of P4 and stay. `admitConstructionContinuationExecutionBasis`
is on no export path.

### Scripts and package metadata

`T/scripts` and `T/package.json` name none of these items.

### Tests, support and fixtures (`T/test_env`, without `test_runs`, `downstream`, `evidence`)

| Path | Action | Reason |
|---|---|---|
| `tests/t287-selected-action.test.mjs` | delete | subject is the `selected_action` continuation |
| `tests/t287-selected-action-authority.test.mjs` | delete | subject is `selected_action` population authority |
| `support/t287-selected-action-host.mjs` | delete | importer is `t287-selected-action` only |
| `fixtures/t287-current-owner/selected-action/` and its README rows | delete | read only by `t287-selected-action-authority` |
| `support/evidence-gates.json` rows `selected-action-owner-subject`, `selected-action-evidence-root` | delete | their files go |
| `tests/t287-exact-construction-intent.test.mjs`, `fixtures/exact-intent-product/` | delete (plan: P4) | subject is the `current_intent` construction-intent door this package removes |
| `fixtures/t287-selected-action-product/` | keep (plan: P3) | `t287-rp2-correction-carriers` (P4) imports it at `:8`, `:16` |
| `tests/t287-recursive-registered-selection.test.mjs:26-41` | edit | asserts the `currentIntent` request arm |
| `tests/t287-installed-product-coordinate.test.mjs:39`, `:79` | edit | loops over `selected_action` as a callable member |
| `tests/t287-wave2-owner-contract-source-set.test.mjs:199-205` | edit | D09 uses a `currentIntent` body |
| `support/single-address-space-consolidation.mjs:35`; `tests/t287-single-address-space-consolidation.test.mjs:588`, `:636` | edit | meter `admitPendingConstructionIntentContinuation` |
| `types/framework-handoff.compile.ts`; `tests/t287-framework-handoff-types.test.mjs` | edit | count pins and the unavailable table |
| `tests/t287-continuation-causation.test.mjs` | keep | uses the shared operation candidate and the read side (`projectSelectedActionContinuations`, `selectPendingActionUse`, `projectSelectedActionOperation`) and the kept `selected_action` contract; nothing it imports goes |
| `tests/t287-multi-candidate-admission.test.mjs` | keep | tests `traversal_route.ts` (P4) |
| `tests/t287-single-address-space-consolidation.test.mjs:71`, `:343`, `:824`, `:857`, `:894-895` | keep | read-side selector keys over recorded operations (P5) |
| `fixtures/developer-mini-product/src/index.ts` | keep | its `selectedAction` is the One Surface program's own field (P6) |
| `qualification/inventory.json`, `recipe/verification-recipe.json`, `recipe/declared-commands.json` | list only | name the deleted tests |

The whole-word search at head (section "Whole-word search") found one more
kept design sentence: `ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:600`
says the construction resume (`hog/entry.ts`) is "the one ingress that builds a
suspension" and names `preflightParentReturns`. Both are removed by this
package. Listed, not edited.

## Recorded history

Scanned with `rg -uu -l` over `/Users/jim/src/apps/abiogenesis/.ai-workspace`
and the main checkout's `T/test_env/proof`, `fixtures` and `uat`, files
`*.json`, `*.jsonl`, `*.ndjson`, `*.txt`, `*.log` (script
`/private/tmp/abg-td26p3-work/scripts/history-scan.sh`, lists
`/private/tmp/abg-td26p3-work/history/files-<n>.txt`). Files that record each
value the removed write side produced:

| Value | Files |
|---|---|
| `"construction_continuation_opened"` | 532 |
| `"continuationKind": "construction_intent"` | 652 |
| `"continuationKind": "selected_action"` | 542 |
| `"memberKey": "selected_action"` | 7,810 |
| `"continuation_reentry_link_admitted"` | 554 |
| `"constructionContinuationUse": {` | 14 |
| `"continuedFrom": {` | 13 |

`memberKey: "selected_action"` is mostly the published definition inside
recorded install artifacts; the definition stays published, so those reads do
not change. The other values are recorded continuation events and Public
operation payloads. Their readers (the projections of
`abg/construction_continuation.ts`, `continuedCursorOrigin` for
`projectCursorAncestry`, replay and the calculus) stay until P5. The 14 and 13
files of the last two rows are the `s7-pending-consumer-01/exact-intent-02`
attempts, one `rc3-dogfood-01` store and five `rc4-native-recovery-01` sandbox
copies; one of these, `hc2-current-intent/continue-events.jsonl`, is a replay
subject and reads the same on base and final (section "Replay comparison").

## Specification and design edits

None. No file under `specification/` names what this package removes, and the
design notes are another package's (census "Kept design notes").

## Source lines removed by file

Commit `425807461`. `git diff --numstat c02abccb8 425807461` over `T/code/src`:

| Layer | File | + | - | What goes |
|---|---|---|---|---|
| ABG | `abg/construction_continuation.ts` | 1 | 282 | the construction-intent preparation, operation, re-entry and post-traversal admission; the selected-action preparation and admission; seven imports only they used |
| ABG | `abg/execution_basis.ts` | 0 | 43 | `admitConstructionContinuationExecutionBasis` and its import |
| ABG | `abg/traversal_cursor.ts` | 16 | 31 | `admitContinuedTraversalCursor`; the `continuedFrom` parameter of the private `admitTraversalFrameCursor`, its origin check, its `source?.` fallbacks (now the initial values) and its `continuedFrom` payload field |
| HoG | `hog/entry.ts` | 0 | 85 | `prepareConstructionContinuationTraversal` and the imports only it used |
| HoG | `hog/graph_execute.ts` | 2 | 66 | the `constructionResume` branch, the parent-return preflight and the post-traversal construction-intent admission |
| HoG | `hog/traversal_contract.ts` | 0 | 31 | `InteractionResumeTraversalEntryInput`, `ResumeConstructionIntentInput` and the request arm |
| owner bindings | `owner_bindings/run_invocation.ts` | 39 | 299 | `SelectedActionPacket`, the construction-intent and selected-action population selectors, `runCurrentIntentOwner`, `runSelectedActionOwner` and the `selected_action` binding |
| Product | `product/run_operation_contracts.ts` | 23 | 22 | the `currentIntent` request alternative; `current_intent` gets its own five-code refusal list; `RunContinuationPort.selected_action` |
| Product | `product/run_invocation_operation.ts` | 3 | 5 | the `selected_action` authority arm |
| Public | `public/installed_public_definition_call.ts` | 14 | 31 | the `selected_action` and construction-intent arms of the pending-call constructor |
| | **total, 10 files** | **98** | **895** | |

By layer: ABG 17 added, 356 removed; HoG 2 added, 182 removed; owner bindings
39 added, 299 removed; Product 26 added, 27 removed; Public 14 added, 31
removed.

What stays and changes shape:

- `run.continue#current_intent` is bound straight to `runPendingExecutionOwner`.
  At base, `runCurrentIntentOwner` sent every request with a `pendingCursor` to
  that owner in its first statement, so a pending request runs the same owner
  with the same arguments.
- `continuationOutcome` builds only the `pending_execution` output; at base the
  pending owner already passed `admittedIntent: null`.
- `populateRunContinuationAtDurablePrefix` refuses any selection kind other than
  `pending_execution` with `missing_continuation` (`/continuation`) before it
  reads the prefix. Its pending branch is the base branch, unchanged.
- `admitInitialTraversalCursor` keeps its name and its export path and still
  refuses a ninth argument with `cursor_mismatch`; its parameter list now names
  that argument itself instead of inheriting it from the private function.
- `RUN_OPERATION_CONTRACTS.continue.selected_action` keeps its request, result,
  non-terminal and refusal schemas (the nine codes, in their order).
  `CURRENT_EXECUTION_KINDS` stays `["current_intent", "pending_execution"]`, so
  the `current_intent` result and non-terminal contracts are unchanged (section
  "Needs a ruling", item 2).

`tsc --noEmit` is clean. `tsc --noEmit --noUnusedLocals` gives the same 12
findings on base and final; the only one in a touched file,
`abg/execution_basis.ts:126`, is there at base. `npm run lint:imports`,
`lint:lifecycle` and `lint:calculus` pass.

### Refusal codes only the removed paths produced (ruling 4)

| Code | Producers at base | Producers at final |
|---|---|---|
| `intent_mismatch` | the construction-intent arm of `runCurrentIntentOwner` (removed) | none |
| `stale_action`, `action_mismatch`, `reprice_mismatch` | `runSelectedActionOwner` (removed) and `selectPendingActionUse` | `selectPendingActionUse` only; its one kept caller, `projectSelectedActionOperation` (read side), maps every refusal to `null`, so none reaches an output |

The kept `current_intent` owner (`runPendingExecutionOwner` through
`selectPendingExecutionUse`) produces exactly `missing_continuation`,
`resolved_continuation`, `response_mismatch`, `basis_mismatch` and
`replay_mismatch` (`PendingExecutionUseRefusal`). The four codes therefore
leave the `current_intent` refusal contract and the population refusal type.
They stay in the `selected_action` refusal contract, which is published
unchanged (ruling 2), and in the read-side type `SelectedActionUseRefusal`
(P5). Removing them from `current_intent` changes its refusal schemaRef
(section "Generated contracts").

### Kept importers (ruling 7)

| Kept importer | What it needs | Where it is now |
|---|---|---|
| `hog/graph_execute.ts` | `projectPendingCursorInputAtPrefix`, `projectPendingExecutionContinuations`, `rematerializeAdmittedBasisGraph` | unchanged, `abg/construction_continuation.ts` (pending part) |
| `hog/graph_execute.ts` pending resume | `resumeEntryRefusal`, `rehydrateParentReturnFrames`, `machineWorkflowReturn` | unchanged, same file and `hog/parent_rehydration.ts` |
| `owner_bindings/run_invocation.ts` | `selectPendingExecutionUse`, `preparePendingExecutionContinuation`, `projectPendingExecutionInputAtPrefix`, `admitPendingExecutionContinuationOperation`, `PendingExecutionUseRequest`, `projectPendingExecutionContinuations`, `projectPendingExecutionUseRequest` | unchanged, `abg/construction_continuation.ts` |
| the kept pending admission in `abg/construction_continuation.ts` | `constructionContinuationOperationCandidate`, `continuationOperationWorkspaceCorresponds` | unchanged, same file |
| the read side (`projectSelectedActionOperation`) | `selectPendingActionUse`, `pendingSelectedOccurrence` | unchanged, same file (P5) |
| `projectCursorAncestry` | `continuedCursorOrigin` | unchanged, `abg/traversal_cursor.ts` (P5) |
| `abg/index.ts` | `admitInitialTraversalCursor` | unchanged path; see above |
| `hog/index.ts` | `ExecuteGraphTraversalRequest`, `HeldWorkflowSuspension` | names unchanged; the request type loses the construction-resume arm |

Nothing moved. No stub, shell or re-export remains. No kept code needed
behaviour of what was removed. The four §3.2 guards in `abg/execution_basis.ts`
(`admittedConstructionComposition`, `hasExactInvocationObservationBasis`,
`isAdmittedConstructionInteractionLocus`, `selectAdmittedConstructionAuthority`)
stay for P4.

### Exports (ruling 8)

`/private/tmp/abg-td26p3-work/scripts/export-names.mjs` lists every exported
name (values and types) of every package export path with the TypeScript
checker over `build/` declarations. Base and final each give 4,594 names, and
the lists are identical (`exports-base.txt`, `exports-final.txt`). No name
leaves `./abg`, `./abg/m03` or any other path. The removed functions and
types were not exported from any package path. These exported names keep
their name and change their type:

| Name | Paths | Change |
|---|---|---|
| `admitInitialTraversalCursor` | `.`, `./abg`, `./abg/m03` | parameter list (above) |
| `ExecuteGraphTraversalRequest` | `.`, `./hog` | `ExecuteGraphTraversalInput \| ResumePendingExecutionInput` |
| `RunContinuationSelectionIntent`, `RunContinuationPopulationRefusal`, `PopulatedRunContinuation` | `.`, `./product` | the pending-execution alternative only; five refusal codes; `memberKey: "current_intent"` |
| `RunContinuationPort` | `.`, `./product`, `./app/m04` | no `selected_action` port |
| `RUN_OPERATION_CONTRACTS` | `.`, `./product`, `./app/m04` | the `current_intent` request schema type is the pending arm; its refusal schema type has five codes |
| `RUN_DEFINITION_BINDINGS` | `.`, `./product` | `continue` holds `current_intent` only |
| `InstalledPendingCallSelection`, `constructInstalledPendingCall` | `.`, `./public`, `./app/m04` | no longer generic; the `current_intent` pending call only |

Manifest pins that move: the declaration inventories of 47 of the 50 catalog
rows (`nativeTypedLocator.declarationInventory`) change the digests of nine
`.d.ts` files: `abg/construction_continuation`, `abg/execution_basis`,
`abg/traversal_cursor`, `hog/traversal_contract`, `owner_bindings/run_invocation`,
`product/run_invocation_operation`, `product/run_operation_contracts`,
`public/installed_public_definition_call` and
`public/binding/owner_contract_source_set` (its inferred types spell out the
`current_intent` request schema). No inventory path is added or removed.

## Door table (ruling 6)

The held One Surface Run is the Run of the selected-action fixture
(`run://abiogenesis/5c3cf5883d52a61ffce85796ca244f37bd2cc3911b7325db8f657e69912dc206`
in `t287-current-owner/selected-action/events.jsonl.gz`, copied to
`/private/tmp/abg-td26p3-work/truth/fixture-selected-action.jsonl`; the rc11
`selected-action` replay subject holds the same Run). Its root basis carries a
construction composition, it has one open selected-action continuation and no
pending execution.

Probes, each run on the base build (`/private/tmp/abg-td26p3-work/base-root`,
`c02abccb8`) and the final build; outputs under `/private/tmp/abg-td26p3-work/door/`:

- `scripts/continue-probe.mjs` (with `continue-calls.mjs`): one schema-exact call
  per member and body, built with `constructInstalledPublicDefinitionCall` from
  the member's own verified coordinates and declared slots; the request
  schema, the installed transport (eventless acquisition), `abg.cli --jsonl`,
  `constructInstalledPendingCall` and `populateRunContinuationAtDurablePrefix`
  with each retired selection kind. Outputs `continue-base.txt`, `continue-final.txt`.
- `scripts/door-pending.mjs`: reopens a copy of each held store and calls the
  pending-execution projection and `selectPendingExecutionUse` with a
  pending-cursor request naming the held Run and its open continuation.
  Outputs `pending-base.txt`, `pending-final.txt` (byte-identical).
- `scripts/hog-probe.mjs`: `executeGraphTraversal` with the retired
  `constructionResume` request shape.

The transport checks, in order: one canonical call, the acquisition against
the call's event resource, the definition (`admitExactDefinitionCall`, refusal
`invalid_definition_call`), then the binding (refusal
`installed_binding_unavailable`), and only then runs the owner. Both final
refusals below therefore come before any event store is opened, read or
appended, whatever Run the call names.

| Call on the held Run | Door | Base | Final |
|---|---|---|---|
| `selected_action` | `constructInstalledPendingCall`, selection kind `selected_action` | populates the call (base lane `t287-selected-action`) | `run_continuation_population_refusal`, `missing_continuation`, `/continuation`; no prefix read |
| `selected_action` | installed transport and `abg.cli --jsonl`, schema-exact call | bound to `runSelectedActionOwner`: result, `continuationKind: selected_action`, disposition `completed`, exit 0, for the same-basis and the covered case; its crossed calls are refused `stale_action`, `reprice_mismatch`, `basis_mismatch`, `missing_continuation` and `resolved_continuation` (base lane `t287-selected-action`, receipts in `/private/tmp/abg-td26p3-work/selected-action-proof/`) | `installed_definition_call_transport_refusal`, `installed_binding_unavailable`; CLI exit 2 |
| `current_intent` with a construction intent | `constructInstalledPendingCall`, selection kind `current_intent` | populates the call (base lane `t287-exact-construction-intent`) | `missing_continuation`, `/continuation`; no prefix read |
| `current_intent` with a construction intent | request schema | admits | refuses |
| `current_intent` with a construction intent | installed transport and `abg.cli --jsonl` | bound to `runCurrentIntentOwner`; the owner admits one `current_intent` Public operation and the Run completes (base lane `t287-exact-construction-intent`) | `installed_definition_call_transport_refusal`, `invalid_definition_call`; CLI exit 2 |
| `current_intent` with a pending cursor | `constructInstalledPendingCall` and population, kind `pending_execution` | `missing_continuation`, `/continuation` (the Run has no pending execution: `derivePendingExecutionContinuations` returns none for a root basis with a composition) | same |
| `current_intent` with a pending cursor | the owner's selector, `selectPendingExecutionUse` | `refused`, `missing_continuation`, `/continuation` | same, byte-identical probe output |
| retired construction resume | HoG `executeGraphTraversal({constructionResume: true, continuation, root})` | the construction-resume branch | no such arm: the object is read as a fresh traversal input and fails on its missing top-level fields (the probe's junk input throws `DurablePrefixReadError`); HoG is not a Public door and its only callers are kept owners |

Eventless controls (`continue-*.txt`): at base, all three schema-exact calls
reach their owner, which refuses the empty resource assertion
(`typed_execution_fault`, `resource_admission/invalid_resource_assertion`,
exit 70). At final, only the pending-cursor call does; the other two are
refused at the transport as above.

No refusal code is new. `installed_binding_unavailable` is the code the ten
members without a binding already get; `invalid_definition_call` is the code
the transport gives any body its contract does not admit; `missing_continuation`
is a code of the population and owner refusal lists at base.

`tests/t292-td26-p3-continuation-refused.test.mjs` asserts the final-column
rows for the request schema, the transport (both refusals, with the
pending-cursor call as the positive control) and population with both retired
kinds, plus the two published refusal lists. `t287-framework-handoff-types`
asserts the `selected_action` transport refusal over the packed package.
`t287-recursive-registered-selection` asserts the pending-execution owner's
refusals and its continuation. The held-Run rows come from the probes.

## Kept continuation events (ruling 3)

Three kept tests continue a held pending execution through
`run.continue#current_intent`:

- `t287-recursive-registered-selection`: a registered-selection Run, once
  through the owner and once through the cold Public CLI;
- `t287-default-library`, case "default-library Run interrupted at the durable
  entered Testing cursor resumes once in the same Run through the cold Public
  pending_execution arm": an Executive Run (`executive`, recursing over
  `executive-step`, bound 8), through the cold Public arm;
- `t287-default-library`, case "retained-source B continued cold after its
  Testing entry …": a second Executive Run, through the cold Public arm.

No other test file under `T/test_env/tests` continues a pending execution.

Scratch copies of the two files (`scripts/make-capture-variant.py`,
`scripts/make-capture-variant-dl.py`) write the whole event store after each
continuation. Each ran on base twice and on final once, one at a time (the
`t287-default-library` copy with `--test-name-pattern` for the two cases); every
run passes its cases. The second base run is the noise floor: event times,
temporary paths and the ids and digests derived from them differ between any
two runs. Outputs `/private/tmp/abg-td26p3-work/events/`; comparison
`scripts/event-diff-floor.py`, outputs `events/beyond-floor*.txt`.

| Store | Events (base, base 2, final) | Kind sequence | Leaves that differ base/final and not base/base 2 |
|---|---|---|---|
| registered selection, owner path | 177, 177, 177 | identical | 2,118 |
| registered selection, Public path | 155, 155, 155 | identical | 2,119 |
| Executive Run, first case | 627, 627, 627 | identical | 2,209 |
| Executive Runs, second case | 724, 724, 724 | identical | 2,265 |

Every leaf beyond the noise floor is one of these:

| Leaves | What they are |
|---|---|
| the install event (`public_operation_artifact_admitted`, event 0): 2,104 under `payload/resolvedLock`, plus `authorityScopeDigest` | the resolved install lock, which embeds the product identity and the whole capability graph: `productContentDigest`, the archive digest, the graph digest, each capability definition digest and each owning contract's `contractDigest`. 120 of these leaves are present on one side only; all are `definitionKey` fields of owning contracts in the four graph rows whose order changes (section "Artifact truth") |
| `capabilityGrant` / `capabilityGrants[]` identity coordinates wherever a grant is recorded (`invocation_admitted`, `public_operation_admitted`, and in the Executive Runs `basis_admitted`, `c_call_result_admitted`, `traversal_route_admitted` values that carry the grant) | the grant's capability definition digest and ref, graph digest, catalog digest, `productContentDigest` and the operation contract's `contractDigest` (every operation contract embeds the family digest) |
| publication digests (`publicationDigest`, `graphFunctionPublicationDigest`, `implementationPublicationDigest`, `inputContractOwner`/`outputContractOwner.publicationDigest`) | the product's publications, whose digests include the product content |
| `payload.definitionDigest` and `payload.capabilityGrant.definitionDigest` of the continuation's `public_operation_admitted` (`run.continue#current_intent`, `continuationKind: pending_execution`) | the `current_intent` definition digest: `sha256:27296132…` on base, `sha256:7dbbca0e…` on final (section "Definition digests that move"). On the owner path the payload's `definitionDigest` is the synthetic value the test helper `publicOperationBasis` supplies and is the same on base and final |
| second Executive case only: `stdout/byteLength`, `displayedByteCount`, `excerpts[].endByte`, `promptByteCount`, `helperArtifactByteLength` | the byte lengths of a recorded `node --test` command output that prints timings (`68.270541ms` on base, `25.1025ms` on final); the two base runs happened to print timings of equal length. Not a product value |

The request is the same, it is admitted by the same owner
(`runPendingExecutionOwner`), and events of the same kinds are appended in the
same order with the same keys. The values that differ are the product
identity, which moves with any source change, and the `current_intent`
definition digest that ruling 3 asks this package to report.

**Recorded continuations read the same.** None of the 25 artifact-truth
stores holds a pending-execution `current_intent` operation, so the base-run
captures above are used as recorded history: each was written as an event log
(`scripts/json-to-jsonl.mjs`, `events/recorded-base.*.jsonl`) and read with the
base build and the final build. All outputs are byte-identical between the two
builds:

| Read | Registered selection (owner, Public) | Executive (first, second case) |
|---|---|---|
| whole-log replay (`replay-log.mjs`) | both replay to a digest | first replays to a digest; second refused with the same message on both builds ("replay run_stopped history has contradictory route, causation, disposition, or terminal truth") |
| artifact truth (`probe-artifact-truth.mjs`) | `artifact_truth_projection`, same digest | `artifact_truth_projection`, same digest |
| kept Public reads (`kept-reads-pair.mjs`: `run_status`, `run_result`, `run_replay`, `run_evidence`) | identical per Run | the durable reopen of the rewritten log is refused `invalid_event_history` on both builds, identically |
| `projectPendingExecutionOperation` on the recorded operation, which carries the base digest `27296132…` (`pending-recorded.mjs`) | projects, same digest | projects, same digest (read as recorded history) |
| `selectPendingExecutionUse` with that operation's request | `refused`, `resolved_continuation`, `/continuation` | same |
| pending executions per Run after the use | none | none |

`projectPendingExecutionOperation` does not compare the recorded definition
digest with the current one, so a continuation recorded under the base digest
folds as before. This is listed under "Needs a ruling", item 1.

## Tests and fixtures

Commit ``60baa0389``.

| File | Change | Reason |
|---|---|---|
| `tests/t287-selected-action.test.mjs` (250 lines), `support/t287-selected-action-host.mjs` (109) | deleted | the `selected_action` continuation through the Public door, which no longer exists; the host's only importer is that test |
| `tests/t287-selected-action-authority.test.mjs` (72) | deleted (plan: P3) | its gated case is `selected_action` population over the recorded fixture; its two ungated cases call the read-side occurrence selector `pendingSelectedOccurrence` with occurrences seeded from that fixture (residual below) |
| `fixtures/t287-current-owner/selected-action/` (`events.jsonl.gz`, `fixture.json`), its rows in `fixtures/t287-current-owner/README.md` | deleted | read only by `t287-selected-action-authority`. The log stays in the artifact-truth and door probes as a scratch copy |
| `support/evidence-gates.json` rows `selected-action-owner-subject`, `selected-action-evidence-root` | deleted (68 to 66 gates) | their files are gone; `t292-td60b-evidence-gate-catalogue` checks the catalogue |
| `support/t287-current-owner-evidence.mjs` | the population allowlist is `native-assessment` only | the other population's fixture is gone |
| `tests/t287-exact-construction-intent.test.mjs` (213), `fixtures/exact-intent-product/index.mjs` (59) | deleted (plan: P4) | the test continues a held One Surface Run through `current_intent` with a construction intent, the door this package removes; it cannot pass after P3. The fixture's only importer is that test. Deviation below |
| `tests/t287-recursive-registered-selection.test.mjs:26-29` | title and one assertion: a construction-intent body is refused by the `current_intent` request schema | the alternative is gone; the closed `continuationKind` domain assertions (`:35`, `:413`) stay, because the result contract is unchanged |
| `tests/t287-installed-product-coordinate.test.mjs:39`, `:79` | loops over `start`, `invoke`, `current_intent` (11 to 10 tests) | `selected_action` has no callable binding to resolve |
| `tests/t287-wave2-owner-contract-source-set.test.mjs` D09 | the accepted `current_intent` body uses `pendingCursor` | the `currentIntent` body is no longer an admitted request |
| `support/single-address-space-consolidation.mjs:35`; `tests/t287-single-address-space-consolidation.test.mjs` | `admitPendingConstructionIntentContinuation` leaves the metered owner list; the per-invocation measurements of that owner (`construction_continuation_no_pending_*`, `replaced_continuation_expansion_*`), their growth-row and unrelated-work fields and their assertions are removed; the cursor assertion keeps `admitTraversalFrameCursor > 0` | the metered function no longer exists; the measurement it fed was the post-traversal check this package removes. The reference expansion and its assertion stay |
| `types/framework-handoff.compile.ts` | `UNAVAILABLE` gains `abg.operation.run.continue#selected_action` (11; `56 - 11 = 45`); the `current_intent` selection must equal its pending alternative and has no `currentIntent` alternative; a `selected_action` call candidate's transport outcome is the transport refusal; the `selected_action` result assertion, call and declarations go; the pending constructor is checked without type arguments. Negatives: `current-intent-member-refuses-selected-action`, `selected-action-member-refuses-current-intent`, `current-intent-and-pending-are-exclusive`, `hc2-pending-execution-is-not-current-intent` and `hc2-selected-action-is-not-current-intent` are replaced by `selected-action-member-has-no-callable-call`, `current-intent-refuses-construction-intent-body` (codes 2322 2345 2353 2769), `hc2-pending-call-is-not-selected-action`, `hc2-pending-constructor-refuses-selected-action-selection` and `hc2-pending-constructor-refuses-construction-intent-selection` | ruling 2 and the narrowed types. 30 negatives in all, 12 of them `hc2-`; base has 30 and 11 |
| `tests/t287-framework-handoff-types.test.mjs` | `:146` 11 unavailable; `:197` title "56 declared, 45 callable and 11 unavailable"; `:215` 45; the unavailable request table gains the `selected_action` request; the slot table gains values for `catalog_scope`, `execution_program`, `graph_function`, `input_contract`, `session_policy` and `transport_steering`, which `selected_action` requires; `:284` 11 | ruling 2 |
| `tests/t292-td26-p3-continuation-refused.test.mjs` | new, 4 tests | the door rows (section "Door table") |

Kept and not edited: `fixtures/t287-selected-action-product/` (imported by
`t287-rp2-correction-carriers`, P4's), `t287-continuation-causation`,
`t287-multi-candidate-admission`, the read-side selector keys in
`t287-single-address-space-consolidation` and the One Surface program of
`fixtures/developer-mini-product` (P6).

The other count pins of the plan's common rules do not move:
`r10-projection-contracts.test.mjs:50-52` and
`t287-w2-05-generator-package-reproducibility.test.mjs:136-137` pin 18
operations and 56 declared definitions; the wave2 source set,
`EXACT_OWNER_CONTRACT_KEY_SET_DIGEST`, `t287-pfc-f08a` and `t287-st2a-g` pin
the declared key set and the register's rows, which are unchanged.

## Generated contracts and identity digests

Final build at ``60baa0389`` (the code of `425807461` with the tests of this
package). Not committed; the Executive regenerates the identity at merge.
The build is reproducible: three builds of the final source (two in the
worktree, one in `/private/tmp/abg-td26p3-work/final-root`, a clean
`git archive` of `60baa0389`) give byte-identical `contracts/` and
`product-toolchain-manifest.json` (scratch copy `/private/tmp/abg-td26p3-work/gen-final/`).

| Digest | Base (`c02abccb8`) | Final |
|---|---|---|
| `productContentDigest` | `sha256:7a97b9f699986ed3d8727e01a0120bead67466136ae49340f6a8e344608f2ae9` | `sha256:034eb00072d21e0bd3753505b3d03c954440e2ec84756705ef907c1260b0ca68` |
| `contributionManifestDigest` | `sha256:b7b50dc487a6c07d2940fd8916888e45677e269f7378c365a14961b5131ff649` | `sha256:abc5ce95c763f2357c725c00cfcd1eec740a68806b82d60f04fd78366cd39ded` |
| `publicContractCatalog.catalogDigest` | `sha256:3dba155c2c0ae2f70f51410f1b46dd3d5a64c2d0d9988794a93f716f57dfccd4` | `sha256:50b657a3d50b23dead061a46a350d0ffc0ef01d9137b1297aa21141a663091c0` |
| capability `graphDigest` | `sha256:0cd0fd442d9199ff2a9a5993a05904e608b6bc69d58037f4d7ee5bfa5685280c` | `sha256:d018f814a52a76fd840dadaf0c283933d9886651753874302807c2d7e61e2459` |

### Definition digests that move (ruling 3)

Only the two `run.continue` members' definitions change. The definitions of
the other 54 members, including `run.invoke#start` and `#invoke`, are
byte-identical.

| Member | Field | Base | Final |
|---|---|---|---|
| `current_intent` | `definitionDigest` | `sha256:27296132fd825ed83377231b742fbb95a1d5fc08bb6c98db2bb9b23f91561818` | `sha256:7dbbca0eb08e657618275973da7b4279155c402c9fdd33dbf22739f0b44b80e0` |
| `current_intent` | `callableContractDigest` | `sha256:8875d11b03fe58db41da341fddf884039021fcaedb97afa183a68bfde1521d5c` | `sha256:92e4221bf11de57100f3628e055fb252c8749d45f0df0ed9919c72e308a56734` |
| `current_intent` | request `schemaRef` | `native-schema://abiogenesis/dca22f31a4db6cac14a6c718bbfa90d0f2c60fafda58103b1236…` | `native-schema://abiogenesis/814cb896283ef9722f4f76e82d7efcfb9b78d20c7f4d71e4f174…` |
| `current_intent` | refusal `schemaRef` | `…/edb4020e5837239142815ff0d0cc266a84cf0761831b6041a6f5…` | `…/08a6cc5c39e9f82b6a5c73521e3aa65dcb612d36a81934660417…` |
| `current_intent` | result and non-terminal `schemaRef` | unchanged | unchanged |
| `current_intent` | `ownerMember.memberDigest` (all four slots) | `sha256:6095d5cffaad96a1c5a07da85a39f29d2fc54450124b89e10b00858b27c6c901` | `sha256:fd620b5f85b95920d25af62667cadb26d7fbb4eda073aac52c50e7735359ebca` |
| both | `ownerMember.sourceModuleDigest` (all four slots) | `sha256:9dbb4d9e9d529001efd48cb0a025cc150229611101f45728f112b3a30da1528f` | `sha256:566bd2ce5ccb50e2603a66d101ffa2fd33f4daee770a3ca4a58789baf3eacc34` |
| `selected_action` | `definitionDigest` | `sha256:cf3ffda507ab86afedf2b4c9575f7981a49d5f0ebb90e667dce6e1c91f7338d5` | `sha256:bfba0d89af57382c87d81614cc8a98475c87ccd5cafdaf431f911be7fc128e4b` |

The `selected_action` definition moves only through `sourceModuleDigest`, the
digest of the Product module that owns both members' contracts
(`product/run_operation_contracts.ts`). Its member digest, callable contract
digest, binding locator and all four schemaRefs are unchanged; its request,
result, non-terminal and refusal schemas are byte-identical. Any edit to that
module moves this digest, so the `selected_action` definition digest could
not stay fixed while `current_intent` loses its alternative in the same
module.

Pins that move with them, all generated: the `run.continue` operation
contract; the family digest and row digest embedded in all 18 operation
contracts (so each operation contract's file digest, the capability graph's
`contractDigest` coordinates and the four identity digests above move); the
`definitionDigest` constants of the two members in
`schemas/public-operation.schema.json` (`PublicInvocation`, `PublicOutcome`,
`IndexedInvocationAdmissionRefusal`); the two `documentationInventory` rows of
`public-functions/adapter-projection.json`; and the declaration inventory
digests listed under "Exports". No test pins either definition digest. A
`run.continue#current_intent` Public operation admitted after this package
records the new definition digest (`payload.definitionDigest` and
`payload.capabilityGrant.definitionDigest`); section "Kept continuation
events".

Content changes by file under `T/contracts`:

- `schemas/operations/run/continue/request.schema.json`: `$defs.current_intent`
  is the one strict pending-cursor object (base: `anyOf` of the construction-intent
  and pending-cursor objects). `$defs.selected_action` is byte-identical.
- `schemas/operations/run/continue/refusal.schema.json`: the `current_intent`
  code enum is `missing_continuation`, `resolved_continuation`,
  `response_mismatch`, `replay_mismatch`, `basis_mismatch` (base: the nine
  codes it shared with `selected_action`). `$defs.selected_action` is
  byte-identical, nine codes.
- `schemas/operations/run/continue/result.schema.json`, `non-terminal.schema.json`:
  byte-identical (the `continuationKind` domain stays `current_intent`,
  `pending_execution`).
- `public-operations/run/continue/operation-contract.json`: the definition
  fields in the table above, the family and row digests.
- The other 17 `public-operations/*/operation-contract.json`: only
  `family.familyDigest`, `family.familyRef`, `rowDigest`, `rowRef`.
- `schemas/public-operation.schema.json`: the request schema of
  `current_intent` inside `PublicInvocation`, the digests above.
- `public-functions/adapter-projection.json`: the family digest and the two
  continue members' `documentationInventory` definition digests.
- `capabilities/capability-definition-graph.json`: see "Artifact truth over
  recorded stores".
- Every other file under `contracts/`: byte-identical.

`product-toolchain-manifest.json` (`/private/tmp/abg-td26p3-work/scripts/manifest-cmp.mjs`,
`inventory-cmp.mjs`; outputs `manifest-cmp.json`, `inventory-cmp.json`): 72
Public contract rows, 8 publication bindings, 32 contribution rows and 5,299
product-relative locators on base and final, none added, removed or changed
beyond identity values; the declaration inventories as under "Exports". The
candidate-basis fixture is not changed by the build.

## Lanes before and after

Each file was run alone with `node --experimental-vm-modules --test
--test-concurrency=1 --test-reporter=tap`, TMPDIR `/private/tmp/abg-td26p3-tmp`,
`ABI5_EVIDENCE_ROOT=/Users/jim/src/apps/abiogenesis/.ai-workspace`. TAP output
is in `/private/tmp/abg-td26p3-work/lanes-{base,final,refreshed,baseedited}/`.

- **Base:** `/private/tmp/abg-td26p3-work/base-root` (`c02abccb8`, built).
- **Final:** the worktree at `425807461` with the tests of `60baa0389`, built,
  with the generated files present while the lanes ran and restored
  afterwards.
- **Refreshed:** `/private/tmp/abg-td26p3-work/final-root`, the tree of
  `60baa0389` built, with the candidate-basis fixture refreshed by
  `node scripts/refresh-candidate-basis.mjs`. It equals `git archive 60baa0389`
  apart from the generated files and the sparse `.ai-workspace` (the same
  1,066 files as base-root).
- **Edited file on base:** the final version of a changed test file (or of
  the support file it reads), run on the base build in place and then restored
  to the base bytes (checked with `cmp` against `c02abccb8`).

| Lane | Base pass/fail/skip | Final pass/fail/skip |
|---|---|---|
| `t287-framework-handoff-types` | 6/0/0; edited file on base 2/4/0 | 6/0/0 |
| `t287-recursive-registered-selection` | 7/0/0; edited file on base 6/1/0 | 7/0/0 |
| `t287-installed-product-coordinate` | 11/0/0; edited file on base 10/0/0 | 10/0/0 |
| `t287-wave2-owner-contract-source-set` | 15/0/0; edited file on base 15/0/0 | 15/0/0 |
| `t287-continuation-causation` | 1/0/0 | 1/0/0 |
| `t287-multi-candidate-admission` | 75/0/0 | 75/0/0 |
| `t287-native-assessment-evidence` | 4/0/0; edited support on base 4/0/0 | 4/0/0 |
| `r10-projection-contracts` | 11/0/0 | 11/0/0 |
| `t287-pfc-f08a-product-verification-boundary` | 1/0/0 | 1/0/0 |
| `t287-st2a-g-capability-definition-graph` | 4/0/0 | 4/0/0 |
| `t292-td60b-evidence-gate-catalogue` | 3/0/0; edited support on base 3/0/0 | 3/0/0 |
| `t292-td26-ps-default-root-mode` | 4/0/0 | 4/0/0 |
| `t292-td26-p2-module-refused` | 4/0/0 | 4/0/0 |
| `t292-td26-p3-continuation-refused` | new file on base 0/4/0 | 4/0/0 |
| `t292-td34a-run-invocation-schema-owner` | 4/0/0 | 4/0/0 |
| `t288-initial-cursor-entry` | 1/0/0 | 1/0/0 |
| `m5-event-calculus-runtime` | 18/0/0 | 18/0/0 |
| `r9-causal-result-closure` | 2/0/0 | 2/0/0 |
| `t287-retry-run-prefix` | 3/0/0 | 3/0/0 |
| `m5-event-store-reopen` | 27/0/0 | 27/0/0 |
| `t287-f09-frontier-handoff` | 1/0/0 | 1/0/0 |
| `t292-td36r-admitted-binding-owner` | 1/0/0 | 0/1/0; refreshed 1/0/0 |
| `t292-td36r-bind-door-strings` | 6/0/0 | 0/1/0; refreshed 6/0/0 |
| `t292-td36r-remaining-owners` | 6/0/0 | 6/0/0; refreshed 6/0/0 |
| `t292-td36s-bind-string-rule` | 7/0/0 | 7/0/0; refreshed 7/0/0 |
| `w2-steel-serial-branch-installed` | 0/0/2 | 0/0/2 |
| `w2-steel-single-start-installed` | 0/0/1 | 0/0/1 |
| `w2-steel-single-start` | 7/0/0 | 7/0/0 |
| `w2-steel-single-start-closure` | 1/0/1 | 1/0/1 |
| `t287-registered-graph-selection` | 1/0/0 | 1/0/0 |
| `t287-recursive-failure-foldback` | 8/0/0 | 8/0/0 |
| `t287-rp2-correction-carriers` | 1/0/0 | 1/0/0 |
| `t287-single-address-space-consolidation` | 17/0/0 | 17/0/0 |
| `r1-packed-artifact` | 1/0/0 | 1/0/0 |
| `r2-clean-install` | 1/0/0 | 1/0/0 |
| `r3-workspace-binding` | 1/0/0 | 1/0/0 |
| `r4-catalog-admission` | 8/0/0 | 8/0/0 |
| `t287-historical-source-resource` | 4/0/0 | 4/0/0 |
| `r10-child-proof` | 10/0/0 | 10/0/0 |
| `t287-cross-cut-public-read` | 5/0/0 | 5/0/0 |
| `t287-default-library-fulfillment` | 7/0/0 | 7/0/0 |
| `t287-default-library-prerequisites` | 7/0/0 | 7/0/0 |
| `t287-default-library-recoverable-failure` | 5/0/0 | 5/0/0 |
| `t287-default-library-reviews` | 10/0/0 | 10/0/0 |
| `t287-default-library` | 34/0/1 | 34/0/1 |
| `t287-w2-05-install-catalog-owner-chain` | 3/0/0 | 3/0/0 |
| `t287-w2-05-generator-package-reproducibility` | 2/0/0 | 2/0/0 |
| `steel-basic-cli-public` | 1/0/0 | 1/0/0 |
| `t287-selected-action-authority` | 2/0/1 | deleted |
| `t287-exact-construction-intent` | 1/0/0 | deleted |
| `t287-selected-action` | 1/0/0 | deleted |

Notes:

- The edited files fail on base exactly where they assert what this package
  removes: `t287-recursive-registered-selection` case 1 (a construction-intent
  body is refused), `t287-framework-handoff-types` cases 2 to 5 (the 45/11
  pins and the type proof over the narrowed declarations), and all four cases
  of the new lane. The edited files on kept behaviour
  (`t287-installed-product-coordinate`, `t287-wave2-owner-contract-source-set`,
  the two lanes over the edited evidence support) pass on base, so their edits
  do not depend on the change. `t287-single-address-space-consolidation` was not
  run as an edited file on base (533 s); its edit only removes measurements of
  the removed owner (section "Tests and fixtures").
- `t287-installed-product-coordinate` goes from 11 to 10 cases because the
  member loop no longer contains `selected_action`.
- The three deleted files pass on base: `t287-selected-action` (224 s),
  `t287-exact-construction-intent` and `t287-selected-action-authority` (its
  third case is gated by `ABI5_SELECTED_ACTION_OWNER_SUBJECT`).
- `t292-td36r-admitted-binding-owner` and `t292-td36r-bind-door-strings` fail in
  the worktree with `artifact_digest_mismatch` against the committed
  candidate-basis fixture, as the brief expects, and pass with the fixture
  refreshed. The packed archive is byte-identical in the worktree and in
  `final-root` (`sha256:029b5256…`; base `sha256:489a5b94…`, the committed
  fixture's value).
- Base reruns: the first base run of `t287-default-library-fulfillment` (0/7/0)
  and `t287-default-library-reviews` (9/1/0) failed with ENOENT on
  `.ai-workspace` files missing from base-root. After the 655 missing files
  were added from `c02abccb8`, both pass (rows above).
- One final run was discarded: it started while the worktree's generated
  files had been restored but `build/` held the final code, so the packed
  payload check refused with `product_content_mismatch`. After `npm run build`
  (output byte-identical to the first final build) the whole final sequence
  was run again; the table shows that run.
- The `w2-steel-*` skips and one `t287-default-library` skip are the same on base
  and final; each is gated on environment variables that name a frozen
  artifact, retained evidence or a live run.
- `npm run build`, `lint:imports`, `lint:lifecycle` and `lint:calculus` pass on
  the final tree.

## Replay comparison

Script `/private/tmp/abg-td26p3-work/scripts/replay-log.mjs` (the TD-25R
method, as P2 used it) over the plan's 23 logs (list
`/private/tmp/abg-td26p3-work/replay/replay-logs.txt`), base build then final
build; outputs `replay/replay-base.jsonl` and `replay/replay-final.jsonl`. The
two files are byte-identical (23 lines), and equal to P2's final output after
normalising the scratch path. For each log the script records the prefix
digest, the whole-log replay digest or refusal, the F_H continuations and
facts, and each Run's owner facts.

| Outcome (base = final) | Logs |
|---|---|
| replayed to a digest | 5: the rc.12 store copy, `blocked-testing-diagnostic-001`, rc11 `native-assessment`, rc11 `selected-action` (One Surface subject), rc11 `native-02` |
| replay refused, same message | 2: `registered-selection-whole-001` ("replay run_stopped event and run_terminal HoldsAt truth disagree"), `hc2-current-intent` (One Surface subject; "replay requires zero or one exact run_stopped event") |
| decode refused, same message | 16: the r10 proof fixture and the 15 RC1 `s02-*` logs |

Both One Surface subjects read exactly as before (ruling 5). The rc11
`selected-action` subject records two `construction_intent_selected` events
(the held Run's selected actions). The `hc2-current-intent` subject records
what the removed write side appended: two `construction_continuation_opened`,
one `continuation_reentry_link_admitted`, one `continuation_superseded`, a
`construction_intent` Public operation and two cursor admissions with
`continuedFrom`.

## Artifact truth over recorded stores

On the base and final builds:

- **Lanes.** `t287-historical-source-resource`, `r10-child-proof`,
  `t287-cross-cut-public-read` and `t287-native-assessment-evidence`: same
  counts on base and final (lane table). `t287-selected-action-authority` runs
  on base only (2 pass, 1 skip); the plan deletes it in this package. Its
  fixture log stays in the probes below as a scratch copy.
- **Projection.** `/private/tmp/abg-td26p3-work/scripts/probe-artifact-truth.mjs`
  runs `projectArtifactTruth` over 25 stores: a copy of the live rc.12 store
  (`/private/tmp/abg-demo-tmp/abi5-root-env-hRgyFy/runtime/events.jsonl`,
  copied to `truth/rc12-events.jsonl`), the 22 other replay logs and the two
  `t287-current-owner` fixture logs (`truth/fixture-native-assessment.jsonl`,
  `truth/fixture-selected-action.jsonl`; list `truth/truth-set.txt`). Outputs
  `truth/truth-base.jsonl` and `truth/truth-final.jsonl` are byte-identical: 9
  stores give `artifact_truth_projection` with the same digest, 16 refuse at
  decode with the same message. rc.12: `artifact_truth_projection`,
  `sha256:895b6a682046e0ec8a9bcdb3a4f4d25f912ca6f5f2bd1b061c7b4e08dc26b91f`,
  on both.
- **Locks.** `probe-lock.mjs` re-validates the inline `product.install` locks of
  the rc.12 store and the two fixtures: `isResolvedProductLock` is true and the
  capability identity check finds no mismatch, on both builds (outputs
  `truth/lock-base.jsonl`, `truth/lock-final.jsonl`, byte-identical).
- **Kept reads.** `kept-reads-pair.mjs` reopens one scratch copy of each of the
  9 decodable stores with the base build and then the final build and calls
  `run_status`, `run_result`, `run_replay` and `run_evidence` for every Run (13
  Runs). Every output is identical (`truth/kept-reads-pair.jsonl`).
- **Capability graph rows.** 16 rows on base and final. Capability ids,
  versions, dependent capability ids, effect refs, bounded proof refs and the
  set of owning contracts of each row (contract id, version, selector kind,
  definition key, slot) are identical (`scripts/capgraph-cmp.py` and a set
  comparison). What differs: the identity fields
  (`capabilityDefinitionDigest`, `capabilityDefinitionRef`, `catalogDigest`,
  `productContentDigest`), each owning contract's `contractDigest` (every
  operation contract embeds the family digest, which moves) and the
  `definitionRef` of the selectors whose definition moved; and, as a result,
  the order of the owning contracts in 4 of the 16 rows
  (`install.bind-products`, `operator.public-contract`,
  `qualification.self-conformance`, `runtime.replay-continuation`), because
  the generator orders a row's owning contracts by `contractDigest`. Base and
  final are each sorted by that digest. The register
  (`shared/capability_contracts.ts`) is unchanged.

No case goes from pass to fail, no projection is refused that was not refused
before, no truth digest changes and no graph row changes its capability,
contracts or definition keys.

## Whole-word search

Script `/private/tmp/abg-td26p3-work/scripts/residue-p3.sh` over
`specification/`, `T/design` (without `history/`), `T/code/src`, `T/scripts`,
`T/test_env` (without `test_runs`, `downstream`, `evidence`, `fixtures`,
`proof`, `qualification`) and `T/package.json`. It searches whole-word for the
29 removed identifiers (the 27 removed functions and types, `constructionResume`,
and the request field `currentIntent`). Output
`/private/tmp/abg-td26p3-work/residue-final.txt`.

| Where | Hits | Why they stay |
|---|---|---|
| `tests/t292-td26-p3-continuation-refused.test.mjs` | 2 (`currentIntent`) | the refusal lane |
| `tests/t287-recursive-registered-selection.test.mjs:29`, `:31` | 2 (`currentIntent`) | refusal assertions |
| `types/framework-handoff.compile.ts:197`, `:339` | 2 (`currentIntent`) | the type-level refusal and its negative |
| `code/src/product/run_operation_contracts.ts:319`, `:325`, `:336` | 3 (`currentIntent`) | the local name of the kept `current_intent` member contract, not the request field |
| `design/M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:1666` | 1 (`currentIntent`) | kept design note, listed in the census |
| `design/ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md:600` | 1 (`preflightParentReturns`) | kept design note, listed above |

Recorded data and mirrors under `T/test_env/fixtures`, `proof` and
`qualification` name none of the 29 identifiers.

## Size

`git diff --numstat c02abccb8 60baa0389`:

| Area | Files | + | - |
|---|---|---|---|
| `T/code/src` | 10 | 98 | 895 |
| `T/test_env` | 18 (one binary: the deleted `selected-action/events.jsonl.gz`) | 165 | 1,076 |
| `specification/`, `T/design`, `T/scripts`, `T/package.json` | 0 | 0 | 0 |

`T/code/src` goes from 156,130 to 155,333 lines (281 `.ts` files on both).
The new lane is 97 lines.

## Qualification members (listed, not edited)

- `test_env/qualification/inventory.json` and `recipe/verification-recipe.json`
  name the deleted files `tests/t287-selected-action.test.mjs` (`:4282-4283`,
  `:4845`, `:4949`), `tests/t287-selected-action-authority.test.mjs`
  (`:4278-4279`), `tests/t287-exact-construction-intent.test.mjs`
  (`:3910-3911`), `support/t287-selected-action-host.mjs` (`:3586-3587`) and
  `fixtures/exact-intent-product/index.mjs` (`:3034-3035`); the ten changed
  source files (`:58`, `:114`, `:278`, `:478`, `:486`, `:534`, `:630`, `:814`,
  `:818`, `:966`); and the changed tests `t287-installed-product-coordinate`
  (`:3986`), `t287-recursive-registered-selection` (`:4202`) and
  `t287-wave2-owner-contract-source-set` (`:4366`). The new lane is not a
  member.
- `recipe/declared-commands.json:205`, `:537`, `:641`: `t287-selected-action`
  in declared test commands.

## Deviations

- **Commit trailers.** The brief names `Co-Authored-By: Claude Fable 5.2`. A
  later attribution notice in this session replaced it with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and a
  `Claude-Session` line; every commit of this branch carries those (P2 did the
  same).
- **Lane runs in the background.** The tool moves a command longer than 180 s
  to the background, so each lane sequence ran as one background shell command
  (`/private/tmp/abg-td26p3-work/scripts/lane.sh`) that runs one test file at a
  time and waits for it. No two test files ran at the same time. Probes
  (replay, artifact truth, doors, exports, `tsc`) ran while a base lane was
  running (CPU only, separate tree), as in P1 and P2.
- **`t287-exact-construction-intent` and `fixtures/exact-intent-product/` are
  deleted here, not in P4.** The test continues a held One Surface Run through
  the `current_intent` construction-intent door; after this package its call is
  refused `invalid_definition_call`, so it cannot pass in P3.
- **`fixtures/t287-selected-action-product/` is kept.** The plan deletes it in
  P3 with the host, but `t287-rp2-correction-carriers` (P4) imports it
  (`:8`, `:16`). It goes with that test.
- **`t287-single-address-space-consolidation`.** The plan names only
  `support/single-address-space-consolidation.mjs:35`. The test also measured
  and asserted the removed owner per invocation (the "no pending" check and
  the replaced-expansion comparison); those measurements and assertions are
  removed, the rest of the test is unchanged and passes (17 of 17).
- **`t287-selected-action-authority` runs on base only.** The rules list it
  among the artifact-truth lanes; the plan deletes it in this package. Its
  fixture log is kept in the artifact-truth, lock, kept-read and door probes as
  a scratch copy.
- **Test commit staged by path.** The rules restore the generated files
  before each commit. The final lanes were running in the worktree when the
  tests were committed and needed the generated files to match `build/`, so
  `60baa0389` was made by staging only `T/test_env`; the generated files were
  restored after the lanes. No commit of this branch contains a generated file
  (`contracts/`, `product-toolchain-manifest.json`, the candidate-basis
  fixture).
- **Edited files run on base in place.** Seven `test_env` files of the final
  tree were copied over base-root for the "edited file on base" runs and then
  restored; each restored file was checked with `cmp` against `c02abccb8`.
- **Ruling 8: none of the four `abg/execution_basis.ts` exports leaves.** The
  plan lists `hasExactInvocationObservationBasis`,
  `admittedConstructionComposition`, `selectAdmittedConstructionAuthority` and
  `isAdmittedConstructionInteractionLocus` (the four `./abg` and `./abg/m03`
  exports) in the write-side table of §2.4 for P3 and P4, and its P3 scope
  names only `admitConstructionContinuationExecutionBasis` of that file; P4's
  scope takes "the `execution_basis.ts` helpers" and its risks name the
  `./abg`, `./abg/m03` pins. All four still have kept callers at final
  (`owner_bindings/run_invocation.ts`, `abg/traversal_route.ts`,
  `abg/c_call.ts`, `abg/continuation.ts`), so under ruling 7 they stay, and no
  exported name leaves any package path in this package (section "Exports").
- **`t287-framework-handoff-types` slot table.** `selected_action` declares six
  slots the unavailable table had no scenario value for; the table gains those
  six values. No existing row changes.

## Residuals

- **Identity regeneration at merge (the Executive's).** The generated
  contracts, `product-toolchain-manifest.json`, the candidate-basis fixture
  and the qualification members listed above. Until then
  `t292-td36r-admitted-binding-owner` and `t292-td36r-bind-door-strings` fail
  in the worktree against the committed fixture (`artifact_digest_mismatch`);
  they and the other two identity lanes pass with it refreshed (section "Lanes
  before and after").
- **Design sentences** listed in the census and under "Whole-word search"
  belong to the retirement's design package.
- **P4:** `t287-rp2-correction-carriers` and
  `fixtures/t287-selected-action-product/`; the four §3.2 guards of
  `abg/execution_basis.ts`; `traversal_route.ts` and
  `t287-multi-candidate-admission`.
- **P5 (read side):** the projections of `abg/construction_continuation.ts`,
  `selectPendingActionUse` with `SelectedActionUseRefusal` (where
  `stale_action`, `action_mismatch` and `reprice_mismatch` still occur, mapped
  to `null` by their one caller), `pendingSelectedOccurrence`,
  `projectSelectedActionOperation`, `continuedCursorOrigin` and the read-side
  selector keys in `t287-single-address-space-consolidation`. With
  `t287-selected-action-authority` gone, `pendingSelectedOccurrence`'s
  abandoned, ambiguous and crossed-basis cases have no direct test;
  `t287-continuation-causation` still exercises `selectPendingActionUse` and
  `projectSelectedActionOperation` over a live selected-action occurrence.
- **P6:** the One Surface program of `fixtures/developer-mini-product`.
- **Published `selected_action` contracts** keep the nine refusal codes,
  four of which no kept owner produces; ruling 2 keeps the contracts
  published until the register package.
- **Lane registration.** `package.json` registers no `t292-*` lane in a
  script, so the new refusal lane is not registered in one either (as P2).

## Needs a ruling

1. **A kept continuation's events record the new `current_intent` definition
   digest.** The pending-execution continuations of one registered-selection
   Run and two Executive Runs are admitted by the same owner with the same
   request and append events of the same kinds, order and keys. Beyond the
   noise floor of two base runs, the values that differ are product identity
   values (which move with any source change), the timing-dependent byte
   lengths of one recorded command output, and the `current_intent`
   definition digest (`27296132…` to `7dbbca0e…`) in the continuation's
   `public_operation_admitted` (`payload.definitionDigest` on the Public path,
   `capabilityGrant.definitionDigest` on all). Continuations recorded on base
   read the same with the final build. I read this as the digest move ruling 3
   asks me to report, not as "appends different events". If the Executive
   reads the stop condition strictly: the request schema and the refusal list
   are part of the definition, so the digest could stay fixed only if the
   `currentIntent` alternative and the four codes stayed, which is what this
   package removes.
2. **`continuationKind: "current_intent"` stays in the closed result domain.**
   `CURRENT_EXECUTION_KINDS` stays `["current_intent", "pending_execution"]`, so
   the `current_intent` result and non-terminal contracts are byte-identical and
   `t287-recursive-registered-selection:35`, `:413` still pin the two values.
   After this package no kept path produces a `current_intent`-kind outcome.
   Removing the value would move the result and non-terminal schemaRefs of
   `current_intent` and those two pins. Left as is; it can go with the read
   side (P5) or now, by the Executive's choice.
3. **The `selected_action` definition digest moves** (`cf3ffda5…` to
   `bfba0d89…`) only through `sourceModuleDigest`, because its contracts and
   those of `current_intent` live in one Product module
   (`product/run_operation_contracts.ts`). Its schemas, member digest,
   callable digest and binding locator are unchanged (ruling 2). Keeping the
   digest fixed would need the two members' contracts in separate modules,
   which is a design change outside this package.

