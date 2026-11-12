# TD-26 P4 Return: the route owner and HoG, write side

**Status:** done. The write side is gone, the door refuses, kept Runs write
the same events, the read side reads the same. One item needs a ruling (the
permissive-Product case below).

Base: local `main` at `e77bd3fa4`. Branch `claude/td26-p4-route-write-side`,
worktree `/private/tmp/abg-td26p4`. T is `build_tenants/abiogenesis/typescript`.
Scratch: `/private/tmp/abg-td26p4-work/` (base build in `base-root`,
instrumented base build in `probe-root`). Change class: realization_refactor.

## Commits

| Commit | Content |
|---|---|
| `b8062db1c` | census (Return skeleton) |
| `a33159ee0` | code |
| `06d095b65` | tests |
| `d6a4b1801` | tests: the door lane also checks conformance |
| (this commit) | Return |

## Size (`git diff --diff-algorithm=histogram --numstat e77bd3fa4`)

| Layer | Added | Removed |
|---|---|---|
| ABG (`code/src/abg`) | 29 | 2,425 |
| HoG (`code/src/hog`) | 24 | 171 |
| Owner bindings | 0 | 20 |
| Tests (`test_env/tests`) | 87 | 239 |
| Support and fixtures | 0 | 498 |

`abg/traversal_route.ts` goes from 5,531 to 3,301 lines.

## What left

- `abg/traversal_route.ts`: the next-action, edge-ledger, action-evaluation,
  construction-intent and construction-delta functions (base lines 938-964,
  1017-2926), their local types (`EdgeFulfillmentLedgerRow`,
  `EdgeFulfillmentLedger`, `EdgeClosureDecision`, `ActionEvaluationProjection`,
  `ConvergedNextActionProjection`), `NO_ACTION_DISPOSITIONS`, and the refusal
  codes `gap_environment_mismatch`, `gap_projection_mismatch`,
  `gap_semantics_mismatch`. In `admitRoute`: the continued-intent prefix, the
  governed-closure terminal check, the `gap_stop` arm (a `gap_stop` candidate
  now gets the existing `route_kind_not_supported`), intent and delta
  selection with their two event batches, and the no-action fallbacks. The
  returned route keeps the three intent keys as `null`, because
  `isAdmittedRoute` compares it with the P5 projection, which always emits
  them.
- `abg/execution_basis.ts`: `hasExactInvocationObservationBasis`,
  `admittedConstructionComposition`, `selectAdmittedConstructionAuthority`,
  `isAdmittedConstructionInteractionLocus`, and the intent read in
  `prepareWorkflowChildExecutionBasis`.
- `abg/continuation.ts` (`admitFhInteractionOpen`): the intent read, its
  conditions, its causation ref and its payload keys. The hold identity and
  the return keep `constructionIntentRef: null` (digested).
- `abg/c_call.ts`: the intent read in `prepareWorkflowChildFoldback`; the
  composition branch of `workflowOutputContractCorresponds`.
- `hog/route_proposal.ts`: `proposeGapStopRoute`, the no-action arm of
  `selectedCCallOutcomeRoute`, the `gap_stop` arms of
  `deriveSelectedCCallOutcomeTarget` and `proposeCCallOutcomeTransition`, the
  code `gap_stop_not_declared`, the next-action keys of `GraphRouteExtras`.
- `hog/workflow_lifecycle.ts`, `hog/child_traversal.ts`: the intent-selected
  workflow input, the action-evaluation basis and the diagnostic
  `workflow-action-evaluation-basis-absent`.
- `owner_bindings/run_invocation.ts`: the observation-snapshot guard
  (`observation_basis_mismatch`).

**The door:** `admitExecutionBasis` adds
`input.program.actionCatalog !== undefined || input.program.constructionComposition !== undefined`
to its existing Program/closure check, which rejects with
`diagnostic://abiogenesis/execution-basis/closure-mismatch@5`. No new code.

**Codes that leave:** `gap_stop_not_declared`, `gap_projection_mismatch` (both
on the plan's list), and beyond it `gap_environment_mismatch`,
`gap_semantics_mismatch`, `observation_basis_mismatch` and the diagnostic
`workflow-action-evaluation-basis-absent`. None appears in `T/contracts`,
`T/scripts`, the specification or `T/test_env` at base, apart from the
deleted multi-candidate lane (`gap_semantics_mismatch`). The regenerated
`contracts/` differ from base only in the capability graph digests (ruling 1).

## Cut arms (ruling 2)

Reading: probes on an instrumented copy of the base build (`probe-root`,
`scripts/instrument.py`), one log per lane, over 20 kept lanes:
`m5-event-calculus-runtime`, `r9-causal-result-closure`,
`retained-route-cursor-transition`, `t287-continuation-causation`,
`t287-default-library`, `-prerequisites`, `-reviews`,
`-recoverable-failure` (stopped part way by the amendment),
`t287-f09-frontier-handoff`, `t287-native-assessment-evidence`,
`t287-readable-stops`, `t287-recursive-failure-foldback`,
`t287-recursive-registered-selection`, `t287-registered-graph-selection`,
`t287-retry-run-prefix`, `t287-route-reconstruction`,
`t287-rp2-behavior-carriers`, `w2-steel-single-start`,
`w2-steel-single-start-closure`. (`t287-default-library-fulfillment` read no
probe: the probe tree lacked one evidence file at that moment.) The two One
Surface lanes deleted here (`t287-multi-candidate-admission`,
`t287-rp2-correction-carriers`) are the only ones that reach any arm.

| Arm | Guard on a kept Run | Reading on kept lanes |
|---|---|---|
| `admitRoute` terminal: `hasGovernedConstructionClosure` | basis `constructionComposition === null` returns true | 168 calls, all `true`, all with composition null (10 lanes). Settled (plan "likely") |
| `admitRoute` `gap_stop` arm | HoG proposes `gap_stop` only for a `next_action_projection` with disposition `no_action` | 0 hits; 530 routes admitted: advance 308, terminal 168, failed 30, retry 13, blocked 10, hold 1 |
| `constructionIntentForAdvance` | no ActionCatalog on the basis, no intent event | 241 calls, all `null` (plus 2 `null` from the `retained-route` stub basis) |
| `constructionDeltaForAdvance` | same | 532 calls, all `null` (plus 2 stub) |
| `noActionProjectionForStopRoute`, `hasResolvedRunConstructionIntentLineage`, `deriveGraphFunctionActionEvaluationBasis` | reached only from the arms above | 0 calls |
| `rehydrateConstructionIntentForCursorAtPrefix` | no `construction_intent_selected` event | 228 calls, all `null` |
| `admittedConstructionComposition` / `selectAdmittedConstructionAuthority` | composition null | 3,054 / 941 calls, all `null` |
| F_H hold: `admitFhInteractionOpen` intent; `isAdmittedConstructionInteractionLocus` | composition null | 1 hold (`t287-f09-frontier-handoff`): intent `null`, locus `false` |
| Workflow child basis, foldback, begin, complete (intent reads) | no intent event | 115 / 112 / 115 / 112 calls, intent `null` |
| `workflowOutputContractCorresponds` composition branch | composition null | 230 entries, composition null; branch 0 |
| `selectedCCallOutcomeRoute` no-action arm; `proposeGapStopRoute` | value kind `next_action_projection` + `no_action` | 717 outcomes, all `null` (value kinds: Executive, native work, selection, greeting; 6 are `registered_graph_choice`/`gap`, the Executive's blocked stop); `proposeGapStopRoute` 0 |
| Observation guard `hasExactInvocationObservationBasis` | returns true unless input kind is `observation_snapshot` | 26 calls, all `true` (kinds `governance_work_state`, `selection_request`, `recursive_selection_state`, `developer_ticket_work_input`, `developer_greeting_input`). Settled by running: an `observation_snapshot` input to a kept Program is refused `invalid_input` at `/input` by the Product's input contract, on base and final (`t292-td26-p4-basis-door-refused`, case 2) |
| Door (new): Program fields at `admitExecutionBasis` | kept Programs carry neither key | 49 admissions, `actionCatalog` and `constructionComposition` absent in all |

`ccall_lifecycle`'s `gap_stop` completion arm and `c_call_outcome`'s
`gap_stop` dispositions stay (P5, plan §2.4 read-side table): the completion
type is shared with the fold. They are unreachable on the write side now,
because `admitRoute` admits no `gap_stop` route.

## Event comparison (ruling 3)

Built-in implementations only, no provider. Capture variants write the whole
event store (`scripts/make-capture-variant*.py`, files in
`/private/tmp/abg-td26p4-work/events/`). Base ×1, final ×2; the noise floor is
final against final.

| Subject | Events | Kinds in order | Leaves differing beyond the floor |
|---|---|---|---|
| Registered selection with recursion (`t287-recursive-registered-selection`, owner path) | 177 / 177 / 177 | equal | 1,108, all product identity: 1,098 in `public_operation_artifact_admitted`, 5 in `invocation_admitted`, 5 in `public_operation_admitted` |
| Same, cold Public path | 155 / 155 / 155 | equal | 1,108, the same identity leaves |
| Default library (`t287-default-library`), whole store at the first pending-execution case | 627 / 627 / 627 | equal | 1,189, all product identity: the artifact admission (1,098) and the capability-grant and publication digests carried inside `invocation_admitted`, `implementation_admitted`, `basis_admitted`, `c_call_result_admitted`, `c_call_evidenced`, `actor_result_artifact_observed`, `public_operation_admitted` and one route's `boundInput` |
| Same, at the second pending-execution case | 724 / 724 / 724 | equal | 1,221: the same identity leaves, plus one `predecessorPrefix.prefixLength` of an `actor_transport_binding_admitted` (3,798,020 → 3,798,022). That is noise: the two final runs agree there by chance and differ at the other six transport bindings (byte lengths vary by tens of bytes run to run) |
| Registered selection (`t287-registered-graph-selection`), seven cases: A, B, nonpermitted, stale, wrong-contract, wrong-input, gap. Base is the probe tree's run (base plus probe writes) | 75, 75, 25, 25, 25, 27, 27 (equal per case) | equal | 5 per case, all the capability identity in `invocation_admitted`. The `gap` case is the Executive's blocked stop: one `blocked` route and `run_stopped` `blocked` on both |

Identity leaves: `declarationDigest`, `productContentDigest`, `catalogDigest`,
`capabilityDefinitionDigest`/`Ref`, `provenanceRef`, `contractDigest`,
`publicationDigest`, `graphDigest`, `artifactDigest` and the digests built from
them. They follow the product content, which changes with any source change.
Noise fields (differ between two runs of one build): event ids, times,
temporary paths, Run, call, frame and cursor ids and every ref and digest
built from them, `routeRef`/`routeDigest` among them.

Beyond the floor, route, basis, call, result, judgment, closure and stop
events differ only in identity values carried inside admitted input and
result values (capability grants, publication digests). The route payload key
sets are equal. Neither compared Run holds. The only kept hold is
`t287-f09-frontier-handoff` (one F_H hold; probe: intent `null`, locus
`false`); its identity keeps `constructionIntentRef: null`, so its digest
inputs are unchanged, and the lane passes on final (run for ruling 2's hold
arm, beyond the amended list).

**routeDigest inputs.** `routeDigest = sha256Canonical(routeCandidateBody(candidate))`
(`traversal_transition.ts:186`, not edited). Recomputed from every recorded
`traversal_route_admitted` payload minus `routeRef`/`routeDigest`, with each
build's own digest function (`scripts/route-digest-inputs.mjs`). Recursive
selection: 7 of 7 routes match on base and on final, for both paths; the body keys on both are
`cCallRef, consumedAvailabilityRefs, contractRef, declarationDigest,
declarationRef, judgmentRef, replayStateDigest, routeKind, sourceCursorDigest,
sourceCursorRef, targetCursorDigest, targetCursorRef`. Default library: 28 and 32 routes (advance, terminal, blocked), all match on both builds, with the same three body key sets; the one `run_stopped` is `blocked` on both.

## Door table (ruling 4)

Subject: the registered-selection Product with one valid
`invoke_graph_function` ActionCatalog row on its Program (lane
`t292-td26-p4-basis-door-refused`, case 1).

| Door | Base | Final |
|---|---|---|
| Publication validation | admitted | admitted (the schema arm leaves in P6) |
| `catalog.admit` | admitted | admitted |
| Conformance (`evaluateGtlProgramConformance`) | passed | passed |
| Product resolution | resolves; `actionCatalog` carried | same |
| Run start | the Run completes (`result`, `completed`) | refusal `invalid_graph_function` at `/execution_basis` (`closure-mismatch@5`); no `basis_admitted`, `graph_call_opened`, route or `run_closed` written |
| Run continuation (`run.continue#current_intent`, pending execution) | a recorded catalog Run continues from its recorded basis | same; the continuation reuses the recorded basis and does not call `admitExecutionBasis` (read: `run_invocation.ts` `runPendingExecutionOwner`). No such Run is recorded: 326 files carry a `catalogRef`; their `basis_admitted` events with a catalog and no composition number 0 (357 with both) (`scripts/catalog-basis-scan.py`) |
| Run continuation of a recorded composition Run | `missing_continuation` (`construction_continuation.ts:232` lists no pending position when the root basis has a composition) | same |

The One Surface Program itself (catalog and composition), started supervised
by the deleted `t287-rp2-correction-carriers` lane, run once on final from
scratch copies: base reaches the typed correction stop (Public
`runtime_failed`, `run_stopped` `inspect_runtime_archive`); final refuses
`invalid_graph_function` at `/execution_basis` with `closure-mismatch@5`. The
developer-mini One Surface Program's direct and `graph_function` starts are
refused `invalid_target` at `/program` before the basis on both builds
(`t287-st1-installed-cross-owner-hello.test.mjs:2302-2390`, read, not run).

The lane is red on base (case 1: `actual: 'result'`, the Run completed) and
green on final.

## Read side (ruling 5)

| Check | Base | Final |
|---|---|---|
| Replay census, 23 logs (`scripts/replay-log.mjs`) | `replay/replay-base.jsonl` | byte-identical |
| Artifact truth, 25 logs (`scripts/probe-artifact-truth.mjs`) | `truth/truth-base.jsonl` | byte-identical |
| Resolved-lock reading, 18 rows (`scripts/probe-lock.mjs`) | `truth/lock-base2.jsonl` | byte-identical |
| Kept read ports on one store copy per log, 25 logs (`scripts/kept-reads-pair.mjs`) | | 25 of 25 identical |

## Exports (ruling 6)

23 (subpath, name) pairs leave; none is added.

| Subpath | Names |
|---|---|
| `.` (8), `./abg` (7), `./abg/m03` (7) | `admittedConstructionComposition`, `deriveGraphFunctionActionEvaluationBasis`, `hasExactInvocationObservationBasis`, `isAdmittedConstructionInteractionLocus`, `rehydrateConstructionIntentForCursorAtDurablePrefix`, `rehydrateConstructionIntentForCursorAtPrefix`, `selectAdmittedConstructionAuthority` |
| `.` and `./hog` | `proposeGapStopRoute` |

Manifest pins (`scripts/manifest-cmp.mjs`, `inventory-cmp.mjs`): the Public
contract catalog (72 rows), the publication bindings (8) and the contribution
rows (32) are equal apart from identity values; no inventory path is added or
removed. Declaration inventories change for the edited modules' `.d.ts` and
for three that only reorder one union literal (`"unbound" | "stale"`) in
TypeScript's output: `product/workspace_definition_bindings.d.ts`,
`product/workspace_operation_contracts.d.ts`,
`public/binding/owner_contract_source_set.d.ts`.

Capability graph (ruling 1): 16 rows on both, no difference beyond
`capabilityDefinitionDigest`/`Ref`, `catalogDigest`, `productContentDigest`.
`graphDigest` `sha256:9250588f…` → `sha256:77dc5593…`; asset `contentDigest`
`sha256:a376666f…` → `sha256:5ff9082d…`. Generated files are restored before
each commit (not committed here).

## Kept importers (ruling 7)

| Importer | Imported at base | Needs now |
|---|---|---|
| `abg/continuation.ts` | `isAdmittedConstructionInteractionLocus`, `rehydrateConstructionIntentForCursorAtPrefix`, `ConstructionIntentAdmission` | nothing |
| `abg/c_call.ts` | `rehydrateConstructionIntentForCursorAtPrefix`, `admittedConstructionComposition`, `selectAdmittedConstructionAuthority`, `deriveCSourceContinuation` | nothing |
| `abg/execution_basis.ts` | `rehydrateConstructionIntentForCursorAtPrefix`, `projectOwnedRuntimeEventPrefixAtDurablePrefix` | nothing |
| `hog/workflow_lifecycle.ts` | `deriveGraphFunctionActionEvaluationBasis` | nothing; calls `workflowOutputContractCorresponds({graph, cursor, childGraphFunction, childClosureContract})` |
| `hog/child_traversal.ts` | `preparation.intent` | nothing; `prepareWorkflowChildTraversalAtCursor(store, basis, prefix, cursor)` is now `prepareWorkflowChildTraversalAtPrefix(store, basis, prefix)` (not exported from `./hog`) |
| `owner_bindings/run_invocation.ts` | `hasExactInvocationObservationBasis` | nothing |

No stub. `tsc --noUnusedLocals` gives the same 12 findings as base.

## Tests (ruling 8)

| File | Action |
|---|---|
| `tests/t287-rp2-correction-carriers.test.mjs`, `qualification/fixtures/rp2-correction-product.mjs`, `fixtures/t287-selected-action-product/` | deleted. Every assertion is One Surface (`construction_delta_observed`, a typed no-action stop, an unmet closure); the stopped-Run reading it also checked is covered by `t287-readable-stops` |
| `tests/t287-multi-candidate-admission.test.mjs`, `support/multi-candidate-admission-owner.mjs` | deleted (deviation): they load the route owner and test only `constructionIntentForAdvance`, `noActionProjectionForStopRoute`, `hasGovernedConstructionClosure`, which are gone; every case has a composition basis |
| `tests/retained-route-cursor-transition.test.mjs:102` | stub drops `admittedConstructionComposition`, `selectAdmittedConstructionAuthority` |
| `tests/t287-held-prefix.test.mjs:141`, `tests/t287-runtime-failure-diagnostic.test.mjs:626` | stub of `prepareWorkflowChildFoldback` drops `intent: null` (deviation: not in the plan) |
| `tests/t287-continuation-causation.test.mjs:8` | the comment no longer names the deleted support |
| `tests/t292-td26-p4-basis-door-refused.test.mjs` | new: the door (case 1) and the observation input (case 2) |

**Qualification members naming deleted files (listed, not edited):**
`qualification/inventory.json`: `test_env/fixtures/t287-selected-action-product/index.mjs`,
`test_env/support/multi-candidate-admission-owner.mjs`,
`test_env/tests/t287-multi-candidate-admission.test.mjs`.
`qualification/recipe/verification-recipe.json` (`:3262`, `:3302`, `:3470`,
`:4026`, `:4246`, `:4645`, `:4853`, `:4869`, `:4905`, `:4951`) and
`qualification/recipe/declared-commands.json` (`:96`, `:207`, `:337`, `:545`,
`:561`, `:597`, `:643`) name the two deleted lanes,
`rp2-correction-product.mjs`, the selected-action fixture and the
multi-candidate support.

## Lanes (final build only, by the Executive's amendment)

| Lane | Final |
|---|---|
| `t292-td26-p4-basis-door-refused` | 2/2 (base: case 1 fails, `actual: 'result'`; case 2 passes) |
| `retained-route-cursor-transition` | 1/1 |
| `t287-continuation-causation` | 1/1 |
| `t287-held-prefix` | 3 pass, 2 skip (`ABI5_HELD_PREFIX_NATIVE_FIXTURE` unset) |
| `t287-runtime-failure-diagnostic` | 21/21 |
| `t287-default-library` | 34 pass, 1 skip (`ABI5_DEFAULT_LIBRARY_LIVE` unset) |
| `t287-registered-graph-selection` | 1/1 |
| `t287-recursive-registered-selection` | 7/7 |
| `t287-route-reconstruction` | 11 pass, 1 skip (`P0_RETAINED_NATIVE_SCRATCH` unset) |
| `t287-readable-stops` | 5/5 |
| `m5-event-calculus-runtime` | 18/18 |
| `t287-framework-handoff-types` | 6/6 |
| `t287-f09-frontier-handoff` (the hold arm) | 1/1 |
| `t287-single-address-space-consolidation` (beyond the list; the probe run had not reached it) | 17/17. A first run failed 5 with `product_content_mismatch`: the generated files were back at base while `build/` held final; rerun with the final generated files in place |
| `r1-packed-artifact` | 1/1 |
| `r2-clean-install` | 1/1 |

Also run on final for the comparisons: the two capture variants (×2 each), `t287-registered-graph-selection` once more with saved evidence, and the deleted `t287-rp2-correction-carriers` once from scratch copies (fails on final at the door, as the door table says). Not run, by the amendment: the base lane list, `td36r`/`td36s`.

No failure. `npm run build`, `lint:imports`, `lint:lifecycle` and
`lint:calculus` pass on final. TAP files: `/private/tmp/abg-td26p4-work/lanes-final/`.

## Residue

`scripts/residue-p4.sh` on final: no removed identifier or code remains in
`code/src`, `scripts` or `package.json`. Remaining hits are recorded payload
field names read by P5's owners (`event_store.ts:934`, `:940`,
`replay.ts:241-1155`), the gated S03 support (`t287-s03-automatic.mjs`, P6),
recorded fixtures (2 files each for `nextActionBasis`,
`edgeFulfillmentLedger`, `edgeClosureDecision`) and one design line below.

## Kept design sentences that describe what left (listed, not edited)

- `T287_REGISTERED_GRAPH_SELECTION_DESIGN.md:40`: "Current result-dependent
  routing handles re-entry/no-action" (`hog/route_proposal.ts:550`); the
  no-action half is gone.
- `ABI5_REALIZATION_CONSTITUTION.md:1558` (`L51`, NextActionProjection to
  ConstructionIntent candidate, cites `traversal_route.ts`) and `:1559`
  (`L52`, ConstructionIntent admission in `admitRoute`); also `:1557` (`L50`).
- `M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md:1654`,
  `:1692`, `:1809-1812`: the `gap_stop` non-terminal disposition (P5, P7).

Specification: `PRODUCT.md:416`, `:442` keep the `gap_stop` route family; the
kept feature set realizes it as the Executive's registered-selection gap, a
blocked stop (`t287-readable-stops`). No specification edit.

## Recorded history

Files under the evidence root and `T/test_env/{proof,fixtures,uat}` carrying
each value: `construction_intent_selected` 800, `construction_delta_observed`
626, `"routeKind": "gap_stop"` 18, `"disposition": "gap_stop"` 16,
`next_action_projection` 481, `observation_snapshot` 0, a string
`constructionIntentRef` 390. No reader changes here; the read-side checks
above are identical.

## Deviations

- Commit trailer names Claude Opus 5.5 (the model that ran), not Fable 5.2.
- The arm probes ran in the background, one lane at a time, on an
  instrumented copy of base; the amendment stopped the run before
  `t287-default-library-recoverable-failure` finished and before
  `steel-basic-cli-public` and `t287-single-address-space-consolidation`
  (the latter then run on final only, green).
- `t287-multi-candidate-admission` and its support deleted (not in the plan).
- Stubs edited in `t287-held-prefix` and `t287-runtime-failure-diagnostic`.
- `workflowOutputContractCorresponds` has one signature, and
  `prepareWorkflowChildTraversalAtCursor` became
  `prepareWorkflowChildTraversalAtPrefix` without the cursor.
- Unused after the cut and removed with their last user: the five local
  types and `NO_ACTION_DISPOSITIONS` in `traversal_route.ts`, and four
  imports. The plan puts the types in P5; they had no reader left.
- The `gap_stop` completion arm in `hog/ccall_lifecycle.ts` and the
  `"gap_stop"` member of `hog/traversal_completion.ts` stay: they narrow
  `c_call_outcome`'s completion union, which the plan gives to P5.
- The event comparison takes base ×1 and final ×2 (floor from final), per the
  amendment.

## Needs a ruling

1. **Permissive Product.** Two refusals left with their arms and no kept Run
   reaches either. A Product whose input contract admits an
   `observation_snapshot` for a Program without an ActionCatalog was refused
   `invalid_input` at `/observation` (`observation_basis_mismatch`) at base;
   now its Run proceeds. A Product whose leaf returns a
   `next_action_projection` with disposition `no_action` failed the call at
   base (`gap_stop_not_declared` at stage `leaf-route-N`, or
   `gap_projection_mismatch` at `leaf-completion-N`); now the outcome routes
   as an ordinary result. No shipped or fixture Product other than the One
   Surface ones admits either value kind. The plan lists both codes as
   leaving (§4); P6's schema change removes the One Surface Program shapes,
   not these value kinds.
