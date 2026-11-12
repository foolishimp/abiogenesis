# TD-26 P3 Return: the continuation operations, write side

**Status:** in progress (census skeleton).

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
