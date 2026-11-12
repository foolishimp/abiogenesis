# TD-26 P4 Return: the route owner and HoG, write side

**Status:** census only (Return skeleton). The code, tests and results follow
in later commits on this branch.

Base: local `main` at `e77bd3fa4`. Branch `claude/td26-p4-route-write-side`,
worktree `/private/tmp/abg-td26p4`. T is `build_tenants/abiogenesis/typescript`.
Scratch is `/private/tmp/abg-td26p4-work/`; the base build is
`/private/tmp/abg-td26p4-work/base-root` (`git archive e77bd3fa4` of the
sparse paths, with `node_modules` copied in, built).

## Census

Searched at base, whole word, for the write-side symbols listed below, the
refusal codes only they produce (`gap_stop_not_declared`,
`gap_environment_mismatch`, `gap_projection_mismatch`, `gap_semantics_mismatch`,
`observation_basis_mismatch`), and by phrase for `gap_stop`, "no-action",
"construction intent", "next action", "observation snapshot", "action
catalog" and "construction composition". Script:
`/private/tmp/abg-td26p4-work/scripts/residue-p4.sh`; base output
`/private/tmp/abg-td26p4-work/residue-base.txt`.

### Specification

No hit names a removed symbol or code. `specification/PRODUCT.md:416` and
`:442` keep the `gap_stop` route family and disposition ("Publish unresolved
pressure as a typed gap or block without false completion or automatic
retry"). The kept feature set realizes it as the Executive's registered
selection gap, which stops the Run as a blocked stop with its missing support
references (`t287-readable-stops`, case "selection gap reads back as a blocked
stop"). It does not use the `gap_stop` route kind that this package stops
proposing. No specification edit (brief).

### Kept design notes (listed, not edited)

- `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md:40` cites
  `hog/route_proposal.ts:550` and says "Current result-dependent routing
  handles re-entry/no-action". The no-action half is the HoG gap arm this
  package removes.
- `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:1654`,
  `:1692` (`disposition: "held" | "gap_stop"`) and `:1809-1812` (the
  `gap_stop` non-terminal column and the `selected_action` row): the Product
  non-terminal contract, P5's and P7's.
- `ABI5_REALIZATION_CONSTITUTION.md` (not edited, rule 4): `:1437` (`E32`,
  `run.continue/selected_action`), `:1526` (`L19`, lawful-action projection),
  `:1557` (`L50`), `:1558` (`L51`, NextActionProjection to ConstructionIntent
  candidate, cites `traversal_route.ts`), `:1559` (`L52`, ConstructionIntent
  admission in `admitRoute`), `:1697` (`R32`).

### Source (`T/code/src`)

**`abg/traversal_route.ts`, write side (deleted):**

| Declaration | Lines | Callers |
|---|---|---|
| `NEXT_ACTION_PROJECTION_KEYS` | 938-963 | `selectedNextActionProjection` |
| `nonEmptyStringArray`, `stringArray`, `hasExactTargetObligationBindings` | 1017-1045 | the next-action and evaluation helpers below |
| `hasAdmittedActionCandidates`, `selectedNextActionProjection` | 1046-1131 | `constructionIntentForAdvance`, `rehydrateConstructionIntentForCursorAtPrefix` |
| `GAP_STOP_PROJECTION_KEYS`, `noActionNextActionProjection` | 1132-1199 | `noActionProjectionForStopRoute` |
| `nextActionBasis`, `edgeFulfillmentLedger`, `edgeClosureDecision`, `actionEvaluationProjection`, `actionEvaluationBasis`, `convergedNextActionProjection` | 1200-1479 | the intent, delta and closure functions below |
| `constructionIntentForAdvance` | 1480-1752 | `admitRoute` |
| `noActionProjectionForStopRoute` | 1754-2012 | `admitRoute` (`gap_stop` arm) |
| `rehydrateConstructionIntentForCursorAtDurablePrefix` (exported) | 2014-2022 | none in source; `abg/index.ts:401` |
| `constructionIntentAppliesToBasis` | 2024-2032 | `constructionDeltaForAdvance` |
| `rehydrateConstructionIntentForCursorAtPrefix` (exported, 3 signatures) | 2034-2130 | `continuation.ts:121`, `c_call.ts:4107`, `c_call.ts:5771`, `execution_basis.ts:2333`, `deriveGraphFunctionActionEvaluationBasis`; `abg/index.ts:402` |
| `deriveGraphFunctionActionEvaluationBasis` (exported) | 2132-2265 | `hog/workflow_lifecycle.ts:641`; `abg/index.ts:399` |
| `ConstructionDeltaAdmissionCandidate`, local `admittedConstructionComposition`, `constructionAuthority`, `constructionIntentFromEvent` | 2267-2335 | the intent, delta and closure functions |
| `constructionDeltaForAdvance` | 2336-2713 | `admitRoute` |
| `hasResolvedRunConstructionIntentLineage` (exported, not in `abg/index.ts`) | 2715-2770 | `hasGovernedConstructionClosure` |
| `hasGovernedConstructionClosure` | 2772-2925 | `admitRoute` (terminal arm) |
| imports `admittedConstructionComposition as admittedBasisConstructionComposition`, `selectAdmittedConstructionAuthority` | 52, 55 | the functions above |

Possibly left without a user (checked with `tsc --noUnusedLocals` after the
cut): `NO_ACTION_DISPOSITIONS` (282) and the local types `EdgeFulfillmentLedgerRow`,
`EdgeFulfillmentLedger`, `EdgeClosureDecision`, `ActionEvaluationProjection`,
`ConvergedNextActionProjection` (351-421). The exported types
`NoActionDisposition`, `NextActionProjection`, `ConstructionIntent`,
`ConstructionIntentAdmission`, the `gap_stop` member of `TraversalRouteKind`
and the next-action keys of `RouteCandidate` and `AdmittedRoute` are read by
the route projections, replay and the read ports: P5's (ruling 5).

The `RouteAdmissionRefusal` codes `gap_environment_mismatch`,
`gap_projection_mismatch` and `gap_semantics_mismatch` (431-433) are produced
only by `noActionProjectionForStopRoute`.

**`admitRoute` arms (`abg/traversal_route.ts:4141-4902`):**

| Arm | Lines |
|---|---|
| `constructionPrefix` (continued-intent prefix choice) | 4156-4159 |
| `admittedNoActionStop` declaration | 4281-4284 |
| terminal arm: `hasGovernedConstructionClosure` | 4314-4327 |
| `gap_stop` arm | 4533-4580 |
| construction intent and delta selection | 4657-4701 |
| the `construction_intent_selected` and `construction_delta_observed` event batches | 4757-4829 |
| `gap_stop` in the `run_stopped` condition and the no-action `disposition`/`reasonRef` fallbacks | 4833, 4855, 4860 |
| `routeEventIndex` (1 after a delta batch) | 4866 |
| returned `constructionIntentRef`, `constructionIntentDigest`, `constructionIntentAdmissionEventRef` | 4875-4880 |
| `gap_stop` in `runStoppedEventRef` | 4886 |
| the returned next-action spread | 4891-4899 |

`routeDigest = sha256Canonical(body)` (4702) with `body =
routeCandidateBody(candidate)` (4251); the event payload is `{ routeRef,
routeDigest, ...body }`. `isAdmittedRoute` (855) compares the returned object
with `projectAdmittedRouteAtPrefix` (read side, P5) by `canonicalEquals`; the
projection always emits the three intent keys (null when no intent event), so
the returned object keeps them, as `null`.

**`abg/execution_basis.ts` (the helpers P3 left, deleted when their last caller goes):**

| Declaration | Lines | Callers |
|---|---|---|
| `hasExactInvocationObservationBasis` | 1006-1035 | `owner_bindings/run_invocation.ts:921`; `abg/index.ts:109` |
| `admittedConstructionComposition` | 1149-1163 | `traversal_route.ts` (2146, 2276), `c_call.ts:5767`, the two helpers below; `abg/index.ts:107` |
| `selectAdmittedConstructionAuthority` | 1165-1177 | `traversal_route.ts:2292`, `c_call.ts:5772`; `abg/index.ts:125` |
| `isAdmittedConstructionInteractionLocus` | 1179-1188 | `continuation.ts:123`; `abg/index.ts:124` |
| import `rehydrateConstructionIntentForCursorAtPrefix` and the intent read in `prepareWorkflowChildExecutionBasis` | 11, 2333, 2341 (`intent` key) | `hog/child_traversal.ts:145` |

`admitExecutionBasis` (1634) gains the door (ruling 4).

**Shared call paths (plan §3.2):**

| Site | Lines | What goes |
|---|---|---|
| `abg/continuation.ts` `admitFhInteractionOpen` | 120-127, 167-186, 219-221, 279-286; imports 32, 58, 60 | the intent read, `requiresConstructionIntent`, the intent conditions, the intent causation ref and payload keys. The hold identity keeps `constructionIntentRef: null` (digested, 205-208) and the return keeps both intent keys as `null` (306-309) |
| `abg/c_call.ts` `prepareWorkflowChildFoldback` | 4101-4134; import 8 | the intent read and the `invoke_graph_function` branch |
| `abg/c_call.ts` `workflowOutputContractCorresponds` | 5767-5781; imports 41-42 | the composition branch; ordinary workflows keep `closure.resultContractRef === term.outputCarrierRef` |
| `hog/child_traversal.ts` `prepareWorkflowChildTraversalAtCursor` | 141-151 | the `intent` key |
| `hog/workflow_lifecycle.ts` `beginOwnedWorkflowLocus` | 406-432 | the intent-selected input; the input stays `input.value`/`cursor.inputRef`/`cursor.inputDigest` |
| `hog/workflow_lifecycle.ts` `completeOwnedWorkflowLocus` | 637-662, 688; import 51-53 | the action-evaluation basis and `workflow-action-evaluation-basis-absent` |
| `owner_bindings/run_invocation.ts` | 48, 921-936 | the observation-snapshot guard (`observation_basis_mismatch`) |

**HoG gap family:**

| Site | Lines |
|---|---|
| `hog/route_proposal.ts` `proposeGapStopRoute` (exported, 3 signatures) | 523-606; `hog/index.ts:29` |
| `hog/route_proposal.ts` `selectedCCallOutcomeRoute` no-action arm | 723-742 |
| `hog/route_proposal.ts` `deriveSelectedCCallOutcomeTarget` `gap_stop` arm | 779 (and the doc comment 744) |
| `hog/route_proposal.ts` `proposeCCallOutcomeTransition` `gap_stop` arm | 890-894 |
| `hog/route_proposal.ts` `RouteProposalRefusal` code `gap_stop_not_declared`, `GraphRouteExtras` next-action keys | 71, 101-103 |
| `hog/ccall_lifecycle.ts` `gap_stop` completion | 315-321 |
| `hog/traversal_completion.ts` `"gap_stop"` disposition | 59 |
| `abg/c_call_outcome.ts` `gap_stop` completion payloads and route-kind lists (plan: P5; reached by the compiler once HoG stops producing them) | 652-656, 686-690, 1774-1776, 1841 |

Kept read side, not touched (P5): `projectHistoricalTraversalRoute`,
`projectAdmittedRoute` (`traversal_route.ts:600-842`), `abg/replay.ts`,
`abg/project_read_ports.ts`, `abg/invocation_admission.ts` re-entry,
`abg/event_store.ts` value lists, `abg/calculus/axioms.ts`,
`abg/traversal_transition.ts` next-action body keys,
`abg/construction_continuation.ts`, `owner_bindings/run_invocation.ts:1430`,
`product/run_invocation_operation.ts:1129`,
`product/run_operation_contracts.ts:71,270`.

### Kept importers (ruling 7)

| Importer | Imports | Needs after the cut |
|---|---|---|
| `abg/continuation.ts` | `isAdmittedConstructionInteractionLocus`, `rehydrateConstructionIntentForCursorAtPrefix`, `ConstructionIntentAdmission` | nothing |
| `abg/c_call.ts` | `rehydrateConstructionIntentForCursorAtPrefix`, `admittedConstructionComposition`, `selectAdmittedConstructionAuthority` | nothing |
| `abg/execution_basis.ts` | `rehydrateConstructionIntentForCursorAtPrefix` | nothing |
| `hog/workflow_lifecycle.ts` | `deriveGraphFunctionActionEvaluationBasis` | nothing |
| `hog/child_traversal.ts` | `preparation.intent` | nothing |
| `owner_bindings/run_invocation.ts` | `hasExactInvocationObservationBasis` | nothing |
| `abg/index.ts`, `hog/index.ts` | re-exports | the names leave (ruling 6) |

### Scripts and package metadata

No hit in `T/scripts` or `T/package.json`.

### Tests, support and fixtures (`T/test_env`, without `test_runs`, `downstream`, `evidence`)

| File | Use | Plan |
|---|---|---|
| `tests/t287-multi-candidate-admission.test.mjs`, `support/multi-candidate-admission-owner.mjs` | load `traversal_route.js` with `export { constructionIntentForAdvance, noActionProjectionForStopRoute, hasGovernedConstructionClosure }` appended and test those three | subject is the removed functions: delete |
| `tests/t287-rp2-correction-carriers.test.mjs`, `qualification/fixtures/rp2-correction-product.mjs`, `fixtures/t287-selected-action-product/` | installed supervised start of the selected-action Program; asserts `construction_delta_observed`, a `gap_stop` route and a no-action `run_stopped` | delete (brief, ruling 8) |
| `tests/retained-route-cursor-transition.test.mjs:102` | its `./execution_basis.js` stub supplies `admittedConstructionComposition` and `selectAdmittedConstructionAuthority` | remove the two keys |
| `tests/t287-rp2-behavior-carriers.test.mjs:30` | narrows the view to `ids.oneSurfaceGraphFunctionRef` among others; starts only the ticket and asset Programs | run; edit only if needed |
| `tests/t287-st1-installed-cross-owner-hello.test.mjs:2302-2390` | resolves the developer-mini One Surface Program; its direct and `graph_function` starts are refused `invalid_target` `/program` before the basis | listed |
| `fixtures/developer-mini-product/src/index.ts` (`oneSurfaceProgram`, about `:4646-4670`) | the only kept fixture Program carrying `actionCatalog` and `constructionComposition` | P6; vehicle for the door lane |
| `support/t287-s03-automatic.mjs`, `tests/t287-s03-automatic.test.mjs`, `fixtures/t287-s03-automatic-product/` | gated (skips unless `ABI5_S03_EVIDENCE_ROOT` is set); One Surface | P6 |
| `support/single-address-space-consolidation.mjs` | meters read-owner calls; the intent reads removed here are some of them | run `t287-single-address-space-consolidation` base and final |
| `tests/t287-continuation-causation.test.mjs:8` | comment naming the multi-candidate support's technique | listed |
| `support/evidence-gates.json` | no row names a file this package deletes | none |

`t287-exact-construction-intent` and its fixture are already gone (P3).

## Recorded history

Files under the evidence root `/Users/jim/src/apps/abiogenesis/.ai-workspace`,
`T/test_env/proof`, `T/test_env/fixtures` and `T/test_env/uat` (`*.json`,
`*.jsonl`, `*.ndjson`, `*.txt`, `*.log`; no size cap) that carry each value
(`scripts/history-scan.sh`, lists in `/private/tmp/abg-td26p4-work/history/`):

| Value | Files |
|---|---|
| `"construction_intent_selected"` | 800 |
| `"construction_delta_observed"` | 626 |
| `"routeKind": "gap_stop"` | 18 |
| `"disposition": "gap_stop"` | 16 |
| `"kind": "next_action_projection"` | 481 |
| `"kind": "observation_snapshot"` | 0 |
| `"constructionIntentRef": "<string>"` | 390 |

This package removes no reader: recorded logs carrying these values are read
by the kept projections and replay exactly as before (shown in the replay and
artifact-truth sections).
