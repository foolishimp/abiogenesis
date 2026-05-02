---
kind: claude_post
category: code_review
governing_method: STDO + DESIGN_MODULE_METHOD
subject: T-103 ABG graph-span foldback and reentry frontier implementation pre-closure review
posted_by: claude
posted_at: 2026-05-02T11:06:54Z
scope: read-only review; no source modified
---

## 1. Position

T-103 is good algebra in a half-finished integration. The pure functions in
`graph_span_reentry.ts` are clean: typed carriers, closed sums, fail-closed
admission, `Object.freeze` everywhere, no I/O, no `any`/`unknown`,
`assertBasisOwned` enforces basis identity, and the ordering
`block > constitutional_reentry > reprice > retry` matches the design's
projection rules. The 8 unit tests exercise the algebra crisply against AC-4,
8, 9, 10, 11, 12, 13, 14, 16, 17. That part is closure-grade.

The single load-bearing observation is this: **T-103 implements the algebra
but does not connect it to the runner.** `engine_runner.ts` is unmodified and
still calls `deriveAdvancementTransition` — not the new
`deriveAdvancementTransitionWithReentry`. No production code path emits
`graph_span_evaluation_scheduled`, `graph_span_assessed`,
`graph_span_foldback_evaluated`, `graph_reentry_planned`, or
`graph_reentry_applied`. These events are admissible but unreachable through
the runner. The five-row "Code Points" table in the design (`M03_GRAPH_SPAN_…
DERIVATION.md:873-905`) explicitly names `engine_runner.ts` as a required
touchpoint; it is the one row that the implementation skipped.

Combined with three required-field omissions (`runId`, `workKey`,
`frameLineageId`, `causationEventRefs`, `correlationId` listed at design
:412-419), one inert composition seam (`edgeFoldbacks` parameter accepted by
`foldGraphSpanAssessments` but never read), and the operator's claim that
"no new tickets were needed" — this implementation closes the algebra ACs but
leaves runner integration, T-100 edge-foldback composition, and the
required-field event shape as unfinished work that should be tracked
explicitly. Recommendation: **ratify the algebra surface; hold T-103 closure
pending runner integration, edge-foldback composition, and required-field
event extension**, OR (operator's call) split runner integration into a
follow-up ticket and close T-103 on the algebra alone with explicit
non-closure carve-outs.

## 2. Build/lint/test status

| Check | Exit code |
| --- | --- |
| `npm run test:t103` | 0 (8/8 pass) |
| `npm run test:semantic` | 0 (333/333 pass) |
| `npm run lint:semantic` | 0 |
| `git diff --check` | 0 |

Independently re-run from `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript`.

## 3. Findings register

| Sev | Area | Claim | Evidence | Anchor | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Critical | Runner integration | `deriveAdvancementTransitionWithReentry` is exported but never called by the runner. The runner still uses `deriveAdvancementTransition` from the pre-T-103 path. No production emit-site for `graph_span_evaluation_scheduled` / `graph_span_assessed` / `graph_span_foldback_evaluated` / `graph_reentry_planned` / `graph_reentry_applied`. | `code/src/abg/m03/runner/engine_runner.ts:266` and `:619` (`deriveAdvancementTransition`); `git grep deriveAdvancementTransitionWithReentry` returns only `graph_span_reentry.ts:1197` and the t103 test | Design §"Current Code Points" :873 (engine_runner row); AC-4 satisfied; AC-15/AC-18 not exercised end-to-end | Either modify `engine_runner.ts` to consume reentry-aware transition + emit T-103 events, or open a follow-up ticket explicitly carving runner integration out of T-103. The "no new ticket" claim cannot stand if runner integration is supposed to be inside T-103. |
| Critical | Required-event-field gap | Design :412-419 lists required event fields including `runId`, `workKey`, `frameLineageId`, `causationEventRefs`, `correlationId`. None of the five new T-103 events carry any of these. | `carriers.ts:1043-1166` (the five new event interfaces have only `basisId/graphCallId/frameId/graphFunctionId/...`). Compare T-082 events at `carriers.ts:809-825` which carry `runId/workKey`. | AC-5 ("runtime events preserve graph function, run, graph call, frame, vector, span, source node, terminal node, attempt/generation, causation, and source assessment refs") is partially open — `causation` and `runId` not carried | Add `runId`, `workKey`, `frameLineageId`, `causationEventRefs`, `correlationId` to the five event types and to `event_admission.ts` field rules. Or update the design and AC-5 to drop them deliberately, with rationale. |
| High | T-100 edge foldback inert | `foldGraphSpanAssessments` accepts `edgeFoldbacks?: readonly ZoomFoldbackEvaluation[]` but never reads it inside the function body. The composition seam exists in the type signature only. | `graph_span_reentry.ts:683` (parameter), :706-788 (body never references `edgeFoldbacks`); also `:1262-1280` for `…FromEvents` variant which threads it but lands in the same dead seam | Design :535 ("T-100 edge foldback plus T-103 endpoint span evaluation"); the `edgeFoldbackRefs` *string array* is carried on assessments but the *evaluation objects* are not folded | Either remove the unused parameter (and document that T-100 composition is via `edgeFoldbackRefs` strings only), or wire it into the foldback decision (e.g. an `edge_blocked` edge foldback should force a `blocked` span foldback). The current shape lies about composition. |
| High | Span schedule has no policy hook | `deriveEndpointSpanSchedule` is exhaustive over `[0..terminalVectorIndex]`. There is no `policy` parameter, no `maxSpans`, no opt-out. For a 50-vector graph this is 50 span evaluations, each an F_P call. | `graph_span_reentry.ts:551-597` | Prior design-review concern #2 (span explosion) | Add a `policy?: { maxSpans?: number; sources?: readonly number[] }` parameter, default exhaustive. Even a marker parameter taking the default values closes the operator's stated concern. |
| High | Span evaluation treated as deterministic | `GraphSpanAssessment` carries `attemptIndex` and `assessmentRegime: "F_P"` is required for non-fulfilled rows (good — F_P/F_D boundary), but there is no integration with T-102 `EvalTrial`/`EvalOutcome` carriers. A single F_P assessment is treated as ground truth. No `passAtK` / multi-trial aggregation. | `graph_span_reentry.ts:599-651` (`admitGraphSpanAssessment`); index.ts re-exports `EvalTrial`, `EvalOutcome` from T-102 but `graph_span_reentry.ts` does not import them | Prior design-review concern #4 (pass@k integration) | Add an explicit comment in `admitGraphSpanAssessment` deferring T-102 multi-trial aggregation to a follow-up; OR accept a `evalTrialRefs?: readonly string[]` field on the assessment now and resolve it later. Right now the file is silent on the question, which is the failure mode the operator flagged. |
| High | F_P regime guard is location-specific | `admitGraphSpanAssessment` rejects non-fulfilled rows under `F_D` (`graph_span_reentry.ts:627-632`), which is correct. But the `event_admission.ts` admitter for `graph_span_assessed` does not enforce the same rule on raw event records — it only validates that `assessmentRegime` is one of `F_D/F_P/F_H`. A hand-crafted event with `F_D` + a `semantic_gap` row would pass admission. | `event_admission.ts:376-405` (no F_P/non-fulfilled check); contrast with the in-code constructor path at `graph_span_reentry.ts:627` | F_P/F_D boundary rule (memory `feedback_fp_fd_boundary.md`); `INTENT.md:92,:96`; `PRODUCT.md:97,:105` | Add a same-shape guard inside the `graph_span_assessed` admitter: if any obligation row has `status !== "fulfilled"` and `status !== "constitutional_gap"`, then `assessmentRegime` must be `F_P`. |
| Medium | `graph_reentry_applied` in projection mutates closure state | The projection treats `graph_reentry_applied` by deleting from `closed/closedBy/planned/evaluated` for `index >= targetVectorIndex` (`projection.ts:380-396`). This is correct in spirit because projection is fully replay-derived and the events themselves remain visible, but: (1) the deletion is silent — there is no separate generation field on `RuntimeAggregateProjection` to expose "this index closed at gen N then was shadowed at gen N+1"; (2) the projection has no `activeGeneration` / `shadowedClosures` carrier. | `projection.ts:380-396`; `RuntimeAggregateProjection` (no generation field exposed) | AC-7 ("prior vector closures remain in the event stream; reentry shadows them through a new generation or frontier identity rather than erasing history") | The events do remain (good). But the projection erases the *closed status* without exposing a "shadowed by generation N" view. Add a `shadowedClosures: ReadonlyMap<number, number>` (vectorIndex -> shadowing generation) to `RuntimeAggregateProjection`, or document that shadowing is observable only via the frontier projection and not via the runtime aggregate. |
| Medium | Frontier `clear` semantics on `close` | When `graph_span_foldback_evaluated` arrives with `decision: "close"`, the projection sets `clearedByGeneration` on every row with the same `terminalVectorIndex`. But two foldbacks at the same `terminalVectorIndex` and different `generation` values can interleave; the `close` from generation N should only clear rows in generation `<= N`, not later rows that haven't yet been re-closed. Today the loop clears everything regardless of generation. | `graph_span_reentry.ts:1035-1044` (`if row.terminalVectorIndex === event.terminalVectorIndex && clearedByGeneration === null`) | Design "A later close in a higher generation clears rows" — but not a *lower* generation close clearing *higher* generation rows | Tighten: also require `row.generation <= event.generation`. Currently a stale `close` event (which shouldn't normally appear, but in replay could) wipes new frontier rows. |
| Medium | `frontierRef` not collision-stable for empty frontier | `frontierRef` JSON-stringifies the active row IDs. For an empty active frontier, it produces a constant string regardless of generation — except generation is included. OK. But `planRefFor` uses `frontier.projectionRef` which already encodes generation — fine. The concern is JSON.stringify ordering: the `activeRows` field uses iteration order, not sorted. Today rows come out of `sortRows` so it's stable, but the contract is implicit. | `graph_span_reentry.ts:482-492` (`frontierRef`) and `:506-549` (`sortRows`) | replay-stable derivation | Add an explicit comment that `rows` must be passed `sortRows`-ordered, or sort inside `frontierRef`. Defensive. |
| Medium | `causingFrontierRowRefs` collapses by severity, not by row identity | `deriveGraphReentryPlan` builds `causingFrontierRowRefs` from `activeRows.filter(row => row.severity === activeRow.severity)`. If multiple constitutional reentry rows exist with different `changeClass`/`reEntryPoint`, they all flow into the same plan. | `graph_span_reentry.ts:1117-1121` | AC-16, AC-17 | Document that the active *first* row is what populates the plan's `targetVectorIndex/changeClass/reEntryPoint`, and the others are listed only as contributing causes. The current test at `:410-473` only exercises one constitutional row, so this is untested. |
| Medium | No oscillation detection; no constitutional reentry budget | The frontier projection has no concept of "v2 reentered N times" or "intent_reprice issued M times in this run". Repeated reentries are admissible without bound. | `graph_span_reentry.ts:1024-1096` (`deriveGraphReentryFrontierProjection` does not count) | Prior design-review concerns #6 and #7 (homeostatic loop termination, oscillation) | Document explicitly in the design that loop termination and oscillation detection are out of scope for T-103 and deferred to F_H or product-layer. Or surface a count on the frontier (`reentryCountByTarget`) without acting on it. The operator's concern is real — accept and defer with a comment. |
| Medium | Span schedule allows source > terminal pre-validation but requires all covered closed | `deriveEndpointSpanSchedule` requires every vector `0..terminalVectorIndex` to be in `closedVectorIndexes` (`:560-564`). After a reentry has shadowed `[targetVectorIndex..end]`, the runtime projection's `closedVectorIndexes` will reflect only the unshadowed ones. So calling `deriveEndpointSpanSchedule` after a reentry but before re-closure will throw. This is correct behavior, but is not tested. | `graph_span_reentry.ts:560-564` | AC-4 | Add a negative test: post-reentry, calling `deriveEndpointSpanSchedule` against a partially-reclosed projection raises `TypeError`. |
| Low | `index.ts` re-exports T-100 carriers from T-103 boundary | The T-103 ticket touches `index.ts:+145`, but several of those exports are T-100 / T-082 types (`OutputBindingAdmittedEvent`, `ZoomFrameOpenedRuntimeEvent`, `ScheduledSliceAssessedRuntimeEvent`, etc.). This is housekeeping debt rolled into the T-103 patch, not a T-103 surface. | `index.ts` diff lines (`StartInputAssetBinding`, `OutputBindingAdmittedEvent`, etc.) | scope discipline | Acceptable — these were missing exports — but mention in the ticket closure note that the diff blends T-082/T-100 export-surface fixes with T-103 work. |
| Low | Carrier diff blends T-100 carriers into the +381 line count | Of the +381 lines in `carriers.ts`, ~188 lines are T-100 / T-082 carriers (`output_instance_allocated`, `zoom_frame_opened`, `scheduled_slice_*`, `zoom_foldback_evaluated`, etc.) that were supposed to land with T-082/T-100 but apparently did not until this patch. The T-103-specific carriers begin at `GRAPH_CHANGE_CLASS_VALUES`. | `carriers.ts` diff lines 808-996 (T-100), 996-1166 (T-103) | scope discipline | Same comment as above — note the rollup explicitly. The size of the carrier diff is misleading as a measure of T-103 scope. |
| Low | `assertCarryObservation` allows zero-length range | A carry observation with `fromVectorIndex == toVectorIndex` is admissible (the comparison is `>` not `>=`). For `span.sourceVectorIndex == span.terminalVectorIndex` (single-edge span like C->D), this is correct. For multi-vector spans, a `(2,2)` observation inside an `[1,2]` span is structurally legal but semantically odd ("carry from 2 to 2"). | `graph_span_reentry.ts:332-351` | semantic clarity | Acceptable — keep behavior, document. |
| Note | Inconsistent event naming | T-103 events end in `…Event` (no `Runtime` infix): `GraphSpanAssessedEvent`, `GraphReentryAppliedEvent`. T-100 events end in `…RuntimeEvent`: `ZoomFoldbackEvaluatedRuntimeEvent`, `ScheduledSliceAssessedRuntimeEvent`. | `carriers.ts` everywhere | style | Same finding as the T-100 review (`20260502T025410Z` post §3 last row). Pick one. |
| Note | Test fixture is `buildThreeStageBasis` only | All 8 tests build over a 3-stage basis (vectors `[v0,v1,v2]`). No 4-stage `A->B->C->D` test, no 1-vector test, no large graph stress. | `test_t103_graph_span_reentry_unit.test.mjs:107-114` | AC-8 nominally satisfied — but the ticket text reads "A->B->C->D" which is 4 nodes / 3 vectors. The 3-vector basis matches the algebra. | Either rename the fixture call site or add a 4-vector test for parity with the ticket prose. Cosmetic. |

## 4. F_P / F_D boundary audit

The recurring B-003 → B-017 bug class (F_D smuggling semantic judgment) is
the operator's primary concern. I checked every site that reads or judges
in the new code.

**Site-by-site F_P/F_D evidence:**

| File:Line | Check | Regime | Verdict |
| --- | --- | --- | --- |
| `graph_span_reentry.ts:294-330` `assertAssessmentRow` | structural validation: obligationId non-empty, status enum, evidence-refs-required-for-fulfilled, constitutional-reentry-required-for-constitutional-gap | F_D-only check on shape, not content | Clean. No content judgment. |
| `graph_span_reentry.ts:332-351` `assertCarryObservation` | structural: vector indexes within span | F_D-only | Clean. |
| `graph_span_reentry.ts:353-385` `assertConstitutionalReentry` | structural: kind/changeClass/reEntryPoint enum, refs non-empty, rationale non-empty | F_D-only | Clean. No semantic interpretation of `rationale`. |
| `graph_span_reentry.ts:551-597` `deriveEndpointSpanSchedule` | derives `[source -> terminal]` ranges from graph topology + closed set | F_D-only | Clean. No content. |
| `graph_span_reentry.ts:599-651` `admitGraphSpanAssessment` | F_P regime guard: **line 627-632** `if rows.some(row => row.status !== "fulfilled") && input.assessmentRegime !== "F_P"` throws. Semantic gaps require F_P. | F_D admits the typed boundary; the *semantic judgment* it admits comes from F_P upstream. | **Correct boundary preservation.** This is the load-bearing line for the operator's concern. |
| `graph_span_reentry.ts:653-676` `deriveFirstBadVector` | reads `row.carryObservations` and finds first non-`carried` observation. Status enum dispatch: `dropped/mutated/unknown` are the bad statuses, `carried` is the good one. | F_D-only — pattern matches typed enum, no content reading | Clean. The semantic judgment that produced `dropped` came from F_P upstream; `deriveFirstBadVector` only reads the typed result. |
| `graph_span_reentry.ts:678-789` `foldGraphSpanAssessments` | counts statuses, derives reentry candidates, picks decision | F_D-only — pattern matches typed enums, no content | Clean. |
| `graph_span_reentry.ts:902-1022` `rowsForFoldbackEvent` | dispatches on `event.decision` enum | F_D-only | Clean. |
| `graph_span_reentry.ts:1024-1096` `deriveGraphReentryFrontierProjection` | replay over typed events, projection rebuild | F_D-only | Clean. |
| `graph_span_reentry.ts:1098-1150` `deriveGraphReentryPlan` | reads frontier decision enum, picks first row, builds plan | F_D-only | Clean. |
| `graph_span_reentry.ts:1197-1256` `deriveAdvancementTransitionWithReentry` | dispatches on frontier decision enum | F_D-only | Clean. |
| `event_admission.ts:376-405` `graph_span_assessed` admitter | structural validation only — `assessmentRegime` constrained to enum, no F_P-required-for-non-fulfilled cross-check | F_D-only on shape | **Gap (Finding High §3 row 6):** the in-code constructor path enforces F_P-for-non-fulfilled (`graph_span_reentry.ts:627`) but the wire-format admitter does not. A hand-crafted `F_D` event with `semantic_gap` rows would pass `event_admission.ts` but fail `admitGraphSpanAssessment`. Asymmetric. |
| `event_admission.ts:56-79` `assertGraphConstitutionalReentry` | structural validation of constitutional reentry payload | F_D-only | Clean. |

**Carrier shape audit for boundary smuggling:**

- `GraphSpanObligationAssessmentRow.detail: string | null` — free-form
  string. **Ad hoc concern:** `detail` is not a constitutional carrier; it is
  observation prose. No projection function reads it. No event admitter
  pattern-matches on it. It cannot smuggle a judgment.
- `GraphConstitutionalReentryEventPayload.rationale: string` — same shape.
  Required non-empty by admission, but never pattern-matched.
- `GraphSpanFoldbackEvaluation.causingObligationRefs: readonly string[]` —
  references, not content.
- The `evidenceRefs` and `terminalEvidenceRefs` arrays are URI strings, never
  read for content.

**Verdict:** F_P/F_D boundary is preserved everywhere except the asymmetry
between `admitGraphSpanAssessment` (in-code constructor, enforces) and the
`graph_span_assessed` event admitter (wire format, does not). Fix is small
and identified above.

## 5. Pure-projection audit

| Property | Status | Evidence |
| --- | --- | --- |
| No filesystem I/O | Closed | `graph_span_reentry.ts` has no `fs`, `path`, `process`, `console` references (`grep -n` confirms zero matches for `import.*fs`, `process\.`, `console`). |
| No mutable state | Closed | All exported state is constructed inside the function and returned `Object.freeze`d. No module-level `let`. The only `let` are local-scope counters (`fulfilledCount`, `gapCount`, etc.) inside `foldGraphSpanAssessments` (`:709-713`). |
| No silent input mutation | Closed | Every output is a fresh object via `Object.freeze({ ... })` and arrays via `freezeNumberArray` / `freezeStringArray`. The inputs are read but not mutated. `assessmentsBySpan` (`:692`) is a local `Map`. |
| Closed sums (no string escape hatches) | Closed | `GraphSpanFoldbackDecision`, `GraphReentryFrontierDecision`, `GraphChangeClass`, `GraphReentryPoint`, `GraphSpanObligationAssessmentStatus`, `GraphSpanCarryObservationStatus` are all `as const` arrays exported as `(typeof X)[number]`. The `severity` discriminant in `GraphReentryFrontierRow` is a literal union `"retry" \| "constitutional_reentry" \| "reprice" \| "block"` (`:134`). |
| No `any` / `unknown` | Closed | `grep -n "any\\\|unknown"` in `graph_span_reentry.ts` returns zero matches. |
| Fail-closed on malformed input | Closed | All asserts are `TypeError` with named-field labels. `event_admission.ts` rejects malformed records with `TypeError` and the per-event admitter functions are typed `(event: RuntimeEventRecord) => void`. |
| Frozen carriers | Closed | Every public return is `Object.freeze({...})`. Nested arrays use `freezeStringArray` / `freezeNumberArray` from `runtime_support`. Nested rows in `assessmentEventRows` and `assertAssessmentRow` are frozen per-row (`:392-407`, `:315-329`). |
| Pure dispatch (no plugin/effect) | Closed | No imports from `runner/`, `plugins.ts`, or any I/O module. Imports are `carriers.js`, `iteration.js`, `runtime_support.js`, and a *type-only* `ZoomFoldbackEvaluation` from `workspace_zoom_foldback.js` (`:39`). |
| Replay reconstructibility | Mostly closed | `deriveGraphSpanAssessmentsFromEvents` (`:876-900`) and `deriveGraphSpanFoldbackEvaluationFromEvents` (`:1258-1281`) reconstruct from events. Tested at `test_t103…test.mjs:172-177`. |

**One concern under the heading:** `deriveAdvancementTransitionWithReentry`
calls `deriveIterationAdvanceDecision` from the iteration module
(`:1254`). That call is pure, but it is only reached on the
`default_iteration` branch — which means the public algebra surface depends
on a runtime-projection input even when the frontier alone determines the
answer. Acceptable; flagged as nuance not gap.

## 6. Five-concern checklist (prior design review)

| # | Concern | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Span-vs-edge slice identity | **Closed** | T-103 carriers use `spanId` of the form `graph-span:${basisId}:${source}->${terminal}` (`:260`). T-100 carriers use `(edge, work_key, spec_hash, run_id, call_id)` for slice identity. Distinct keys. No collision. |
| 2 | Span explosion at scale | **Open** | `deriveEndpointSpanSchedule` is exhaustive with no policy parameter. See Finding High §3 row 4. |
| 3 | Reentry vs same-edge retry overlap | **Partial** | `retry_terminal_edge` produces a graph-level `graph_reentry_planned/applied` event with `targetVectorIndex == terminalVectorIndex`. The projection at `projection.ts:380-396` shadows downstream closures by deletion in the projection rebuild. Generation field is present on every event. The composition with T-100's per-edge retry is *not exercised* — no test mixes T-100 retry events with T-103 graph reentry events. The algebra is structurally compatible (different slice keys, both append-only) but unproven in interleaving. |
| 4 | Pass@k / pass^k integration with T-102 | **Open** | No reference to `EvalTrial` / `EvalOutcome` in `graph_span_reentry.ts`. No comment deferring multi-trial. See Finding High §3 row 5. |
| 5 | Domain F_P evaluator dispatch shape | **Open (but acceptable as deferred)** | Neither `FpSpanEvaluatorPlugin` nor any use of `FpDispatchPlugin` from T-103 module. The algebra accepts an admitted `GraphSpanAssessment` and does not own dispatch. This is consistent with "algebra is pure, dispatch is deferred to runner integration which is itself missing" (Critical finding). The implicit answer is "the existing `FpDispatchPlugin` shape will be used" but it is never wired and never declared in code or comment. |

## 7. Three homeostatic-loop concerns

| # | Concern | Status | Evidence |
| --- | --- | --- | --- |
| 6 | Constitutional reentry budget / loop termination | **Open** | No budget hook. No counter on the frontier. Repeated `intent_reprice` rows admitted without bound. See Finding Medium §3 row 11. |
| 7 | Oscillation detection | **Open** | The frontier projection rebuilds from events and does not count "v2 reentered N times" or expose a `reentryHistory` carrier. Out of scope is plausible but not stated. |
| 8 | Goal-reprice case | **Closed** | `GRAPH_CHANGE_CLASS_VALUES` (`carriers.ts` diff line for `GRAPH_CHANGE_CLASS_VALUES`) includes all six STDO classes: `goal_reprice, intent_reprice, product_reprice, requirement_reprice, design_reframe, realization_refactor`. Complete. |

## 8. Composition with T-100's five Python rules

| Rule | Status | Evidence |
| --- | --- | --- |
| R1: five-term `edge_converged` predicate | **Read-only** (T-103 does not redefine) | `GraphSpanAssessment.edgeFoldbackRefs: readonly string[]` (`:95`) carries references to T-100 foldbacks but does not re-derive them. T-103 reads at the reference level. |
| R2: latest-`assessed{kind:fp}`-per-slice projection | **Partial** | T-103 introduces `graph_span_assessed` with its own latest-per-`(spanId, attemptIndex)` rule at `:692-700` (`if assessment.attemptIndex >= previous.attemptIndex` keeps the latest). But T-103's projection composition with T-100's per-slice projection is *not* validated: `deriveRuntimeAggregateProjection` (`projection.ts`) handles both event families but no test crosses them. The two projection rules are independent (different slice keys), so they should compose, but the composition is unproven. |
| R3: retry allowlist `{transport_failure, no_output, contract_failure}` | **Inherited** | T-103 does not define a retry allowlist. The `GraphSpanFoldbackDecision` includes `retry_terminal_edge` and `reenter_at_vector` — these are *graph-level* retries, not per-edge runtime retries. Per-edge retry remains owned by T-100 via the `RUNTIME_FAILURE_CLASS_VALUES` array (which now correctly includes `transport_failure, no_output, contract_failure` per the T-100 review's R3 finding being addressed in this same patch — see `carriers.ts` diff for the new values prepended to `RUNTIME_FAILURE_CLASS_VALUES`). |
| R4: artifact salvage on transport failure | **Inherited / out of T-103 scope** | Salvage is T-100's concern. T-103 does not regress it. |
| R5: behavioral vs lexical observation split | **Independent taxonomy, non-colliding** | T-100 carries `findingClass: "fulfilled" \| "semantic_fulfillment_gap" \| "traceability_reference_gap" \| null` on `ScheduledSliceAssessedRuntimeEvent`. T-103 carries `GraphSpanObligationAssessmentStatus = "fulfilled" \| "semantic_gap" \| "traceability_gap" \| "constitutional_gap" \| "stale_input" \| "contradictory_evidence" \| "blocked"`. T-103's `semantic_gap`/`traceability_gap` are the span-level analog of T-100's edge-level `semantic_fulfillment_gap`/`traceability_reference_gap`. **The vocabularies do not collide because they live on different event kinds.** They are *not unified* — a downstream consumer that wants to walk both surfaces has to do its own translation. Acceptable, but should be documented. |

## 9. Code Points table compliance (design :873-905)

| Code point | T-103 implication | Status |
| --- | --- | --- |
| `carriers.ts` `AdvancementTransition` | Add reentry-capable transition shape | **Closed** — `GraphReentryAdvanceDecision` at `graph_span_reentry.ts:168-201` provides the new shape with `reenter_graph_vector` / `reenter_constitutional_route` / `reprice_required` / `blocked` / `default_iteration` variants. |
| `carriers.ts` `RunProjection` and `FrameProjection` | Add generation/frontier visibility or sibling projection | **Partial** — `GraphReentryFrontierProjection` is the sibling. `RunProjection` / `FrameProjection` are not extended with generation visibility. Acceptable per the design's "or sibling" wording, but `RuntimeAggregateProjection` does not expose the active generation either. |
| `projection.ts` `closeVectorFromReplay` | Preserve historical closure, generation-aware shadowing | **Partial** — `graph_reentry_applied` deletes from in-memory `closed/closedBy/planned/evaluated` for `index >= targetVectorIndex` (`projection.ts:380-396`). Events remain in stream (good). But there is no `generation` field on `RuntimeAggregateProjection` to expose "which generation is active." See Finding Medium §3 row 7. |
| `projection.ts` `nextVectorIndex` derivation | Reentry frontier checked before default first-unclosed | **Open** — `deriveAdvancementTransitionWithReentry` does this, but the runtime aggregate projection's `nextVectorIndex` field still derives from first-unclosed only. The runner is what would compose the two; runner is not wired. |
| `iteration.ts` `deriveIterationAdvanceDecision` | Add reentry-aware decision wrapper | **Closed** — `deriveAdvancementTransitionWithReentry` is the wrapper. Falls through to `deriveIterationAdvanceDecision` on the default branch (`:1252-1255`). |
| `workspace_zoom_foldback.ts` | Reuse edge foldback refs as evidence inputs | **Partial** — `edgeFoldbackRefs: readonly string[]` is carried on `GraphSpanAssessment` (`:95`) but the typed `ZoomFoldbackEvaluation` parameter is inert (Finding High §3 row 3). |
| `assurance_register.ts` | Frontier may consume assurance-register hop decisions | **Open** — no integration. Probably out of scope; not stated. |
| `event_admission.ts` | Add graph-span event rules | **Closed** with one gap: missing F_P/non-fulfilled cross-check (Finding High §3 row 6). |
| `engine_runner.ts` | Runner uses reentry-aware transition | **Open / Critical** — runner is unmodified. |
| `index.ts` | Export new module | **Closed** |
| `test_t100…unit.test.mjs` | Keep as lower proof; add T-103 tests | **Closed** — T-103 tests added; T-100 tests still pass (333/333 in `test:semantic`). |
| `odd_sdlc/work_item_routing.py` | Consume as shape evidence only | **Closed by design** — ABG does not import SDLC. AC-15 (downstream consumption shape) and AC-18 (downstream route contract) are not exercised by the T-103 unit test. The constitutional-reentry test at `:410-473` builds a route contract ref string that *resembles* an SDLC route, but this is fixture-only. |

## 10. Carrier shape audit

| Carrier | Frozen | Fail-closed admission | Replay-reconstructible |
| --- | --- | --- | --- |
| `GraphSpanRef` | Yes (`:258-272`) | `assertSpanMatchesBasis` (`:274-292`) | Yes — derivable from `(basis, sourceVectorIndex, terminalVectorIndex)`. |
| `GraphSpanEvaluationSchedule` | Yes (`:588-596`) | `assertVectorIndexInRange` + closed-coverage check (`:558-564`) | Yes — emitted as `graph_span_evaluation_scheduled` event with all fields. |
| `GraphSpanAssessment` | Yes (`:633-650`) | `admitGraphSpanAssessment` enforces shape, F_P regime for non-fulfilled, evidence-required-for-fulfilled, constitutional-reentry-required-for-constitutional-gap | Yes — `assessmentFromEvent` (`:411-446`) reconstructs from `GraphSpanAssessedEvent`. |
| `GraphSpanFoldbackEvaluation` | Yes (`:765-788`) | Constructed from typed inputs only; does not admit external records directly | Yes — `deriveGraphSpanFoldbackEvaluationFromEvents` (`:1258-1281`) rebuilds from events. |
| `GraphReentryFrontierRow` | Yes (`:919-937` etc., per-decision branch) | Constructed inside `rowsForFoldbackEvent` from typed events only | Yes — frontier projection rebuilds from event stream. |
| `GraphReentryFrontierProjection` | Yes (`:1088-1095`) | Pure derivation | Yes — `deriveGraphReentryFrontierProjection` (`:1024-1096`). |
| `GraphReentryPlan` | Yes (`:1142-1149`) | Constructed from typed frontier; no external admission | Yes (no event for the plan itself; `graph_reentry_planned` carries the plan fields). |
| `GraphConstitutionalReentryEventPayload` | Yes (`:375-384`) | `assertConstitutionalReentry` (`:353-385`) — non-empty rationale, refs, enum changeClass and reEntryPoint | Yes — admitted as field on `GraphSpanAssessedEvent`. |
| `GraphSpanCarryObservationEventRow` | Yes (per-row freeze in `assertAssessmentRow` `:320-326`) | `assertCarryObservation` (`:332-351`) | Yes — replayed via `assessmentFromEvent`. |
| `GraphSpanAssessmentEventRow` | Yes | `assertAssessmentRow` (`:294-330`) | Yes. |

All carriers are frozen, fail-closed-admitted, and replay-reconstructible.

## 11. Event admission audit

Required-field comparison against design :405-419:

| Field | Required | `graph_span_evaluation_scheduled` | `graph_span_assessed` | `graph_span_foldback_evaluated` | `graph_reentry_planned` | `graph_reentry_applied` |
| --- | --- | --- | --- | --- | --- | --- |
| `basisId` | Yes | Yes | Yes | Yes | Yes | Yes |
| `graphFunctionId` | Yes | Yes | Yes | Yes | Yes | Yes |
| `runId` | **Yes** | **Missing** | **Missing** | **Missing** | **Missing** | **Missing** |
| `workKey` | **Yes** | **Missing** | **Missing** | **Missing** | **Missing** | **Missing** |
| `graphCallId` | Yes | Yes | Yes | Yes | Yes | Yes |
| `frameId` | Yes | Yes | Yes | Yes | Yes | Yes |
| `frameLineageId` | **Yes** | **Missing** | **Missing** | **Missing** | **Missing** | **Missing** |
| `terminalVectorIndex` | Yes | Yes | Yes | Yes | n/a (uses `fromTerminalVectorIndex`) | n/a |
| `sourceVectorIndex` | where applicable | n/a | Yes | n/a | n/a | n/a |
| `coveredVectorIndexes` | Yes | n/a (carried in `spanIds`) | Yes | n/a | n/a | n/a |
| `spanId` / `assessmentId` / `foldbackRef` / `planRef` | Yes (per kind) | `scheduleRef` + `spanIds` | `spanId` + `assessmentId` | `foldbackRef` | `planRef` | `planRef` |
| `changeClass` / `reEntryPoint` (when constitutional) | Yes | n/a | Yes (nullable on payload) | Yes (in `constitutionalReentries`) | Yes (nullable) | Yes (nullable) |
| `routeContractRefs` | when applies | n/a | Yes (on payload) | Yes (on payload) | Yes | Yes |
| `generation` | Yes | Yes | Yes | Yes | Yes | Yes |
| `causationEventRefs` | **Yes** | **Missing** | **Missing** | **Missing** (`causingObligationRefs` is similar but not the same) | **Missing** (`causingFrontierRowRefs` is similar) | **Missing** |
| `correlationId` | **Yes** | **Missing** | **Missing** | **Missing** | **Missing** | **Missing** |

The five missing fields (`runId`, `workKey`, `frameLineageId`,
`causationEventRefs`, `correlationId`) are uniformly missing across all five
new event kinds. This is the load-bearing High finding (§3 row 2) for AC-5
compliance.

Validation otherwise is fail-closed:

- `non_empty_string`, `non_negative_integer`, enum membership, nested
  object validation via `assertGraphSpanAssessmentRows` and
  `assertGraphConstitutionalReentry` — all reject malformed inputs as typed
  `TypeError`.
- The cross-status invariants on `scheduled_slice_assessed` (e.g.
  `runtime_failed iff runtimeFailureClass !== null`) are present
  (`event_admission.ts:312-336`). T-103 has an analogous cross-status
  invariant in `admitGraphSpanAssessment` but not in the wire admitter
  (Finding High §3 row 6).

## 12. Test coverage assessment

What the 8 tests exercise (verified by reading each):

| Test | Verifies |
| --- | --- |
| "derives endpoint span schedule C->D, B->D, A->D" | AC-4 schedule derivation. Confirms span order `[2,1,0]` and covered `[[2],[1,2],[0,1,2]]`. |
| "closes graph-span foldback when … all fulfill" | AC-8 happy path. Replay reconstruction also tested (`replayedAssessments.length === 3`, `replayedFoldback.decision === "close"`). |
| "derives terminal C->D reentry from terminal span failure" | AC-9. `foldback.decision === "retry_terminal_edge"`, plan target `2`. |
| "derives B->C reentry when B obligation is dropped" | AC-10. `dropped(1,2)` carry observation. `foldback.decision === "reenter_at_vector"`. Tests transition via applied event. |
| "applied reentry shadows prior downstream closures by replay" | AC-7 + AC-14. Verifies projection deletes `[1,2]` after applied. |
| "chooses earliest implicated vector when root A is dropped" | AC-11 + AC-12. `dropped(0,1)` outranks the `dropped(1,2)`. `earliestReentryVectorIndex === 0`. |
| "ambiguous upstream span gap reprices" | AC-13. `gapRow("A-REQ-1")` with no carry observations → no `firstBadVector` derivable → `reprice_required`. |
| "carries intent_reprice as constitutional reentry" | AC-16 + AC-17. `changeClass: intent_reprice`, `reEntryPoint: intent`, `targetVectorIndex: null`. Transition kind `reenter_constitutional_route`. |

What is **under-covered**:

- **AC-3** (module/IACS proof): no automated check that
  `graph_span_reentry.ts` belongs to M03-engine-kernel and not to a
  product-local module. Review-time only.
- **AC-15** (odd_sdlc consumption shape): no test at all. The constitutional
  reentry test fakes a route contract URL but does not validate the shape
  against any odd_sdlc-published contract.
- **AC-18** (downstream route contract carries change_class / re_entry_point
  through ABG lineage): partially covered by the constitutional reentry
  test, but the test does not assert that route contract refs round-trip
  through the planned/applied events.

What **negative cases are missing**:

- No test that `admitGraphSpanAssessment` rejects an `F_D` regime with
  semantic gaps. The check exists at `:627-632` but is not exercised.
- No test that `event_admission` rejects malformed events for the five new
  event kinds. T-100 has analogous coverage; T-103 should match.
- No test that mixes T-100 retry events with T-103 graph reentry events
  (concern #3 from the prior design review).
- No test that calls `deriveEndpointSpanSchedule` post-reentry against a
  partially-reclosed projection (Finding Medium §3 row 12).
- No test of replay across a `close` event clearing rows
  (`graph_span_reentry.ts:1035-1044`) when the close has a *lower* generation
  than the rows (Finding Medium §3 row 8).
- No test of multiple constitutional reentry rows with different change
  classes (Finding Medium §3 row 10).
- No test of large (>3-vector) graphs.

## 13. Tech debt and follow-up

The operator's claim "Implemented T-103 without adding new tickets" cannot
stand as written. The following items should either be added inside T-103
before closure, or carved out as named follow-up tickets:

| Item | Recommendation |
| --- | --- |
| Runner integration (`engine_runner.ts` consuming `deriveAdvancementTransitionWithReentry` and emitting the five T-103 events) | New ticket or inside T-103. Without it, the algebra is inert. |
| Required-field event extension (`runId`, `workKey`, `frameLineageId`, `causationEventRefs`, `correlationId`) | New ticket or inside T-103. AC-5 reads as requiring `causation`. |
| T-100 edge foldback composition (typed `ZoomFoldbackEvaluation` consumed inside `foldGraphSpanAssessments`, not just refs) | New ticket. Operator concern #5. |
| T-102 `EvalTrial` integration on span assessments (or explicit deferral comment) | Decision: defer with comment, or new ticket. Operator concern #4. |
| Span schedule policy parameter (default exhaustive) | New ticket or one-line addition inside T-103. Operator concern #2. |
| Constitutional reentry budget / oscillation observation | New ticket or explicit non-closure carve-out in T-103 closure note. |
| `RuntimeAggregateProjection` exposing `activeGeneration` and `shadowedClosures` | New ticket. AC-7's "or frontier identity" wording lets T-103 close on the frontier projection alone. |
| F_P/non-fulfilled invariant in `graph_span_assessed` event admitter | One-line fix inside T-103. |
| 4-vector `A->B->C->D` test (parity with ticket prose) | One-line fix inside T-103. |
| Negative-path event admission tests | New tests inside T-103. |
| odd_sdlc consumption shape proof (AC-15) | Likely a new ticket against odd_sdlc, not against ABG. T-103 closure law (line 69) says proof must show ABG can route — does not require odd_sdlc to consume. Acceptable to defer with carve-out. |
| AC-18 round-trip proof | Inside T-103 or new test. |

Estimated minimum to close T-103 cleanly *as written in the ticket*:
**runner integration + required fields + F_P/non-fulfilled wire admitter +
explicit carve-out post in the comments stream for budget/oscillation/policy
hook**. Everything else is acceptable to defer with named follow-ups.

## 14. STDO conformance

| Check | Status |
| --- | --- |
| `change_class: requirement_reprice` declared in ticket frontmatter | Yes (`T-103…md:9`) |
| `re_entry_point: requirement` declared | Yes (`T-103…md:10`) |
| Implementation does not introduce surface that requires a *different* change_class | **Caveat**: introducing `engine_runner.ts` modifications would still be `requirement_reprice` (runtime requirement law). The current absence does not violate STDO. |
| No new tickets created | True for the diff. But three to five legitimate follow-ups should be tracked. The operator's claim is technically accurate but practically incomplete. |
| Constitutional surface (`PRODUCT.md`, `INTENT.md`, `requirements/`) not modified | Confirmed — only `code/`, `test_env/`, `design/`, `tickets/` touched. |
| Realization choices in tenant-local design ADR rather than constitutional surface | Not directly applicable (no new ADR was written for T-103-specific tenant choices), but the design doc at `M03_GRAPH_SPAN…DERIVATION.md` is a tenant-local design surface, which is the right place. |
| Authority chain `Goals -> Intent -> Product Definition -> Requirements -> Design -> Code` traceability | Implementation file header carries `Implements: T-103`, `Implements: REQ-R-ABG3-EVENTS`, etc. (`graph_span_reentry.ts:1-5`). Test file likewise (`test_t103…test.mjs:1-5`). Clean. |

No constitutional boundary is invented. STDO conformance is good.

## 15. Closure recommendation per AC

| AC | Met? | Evidence / Outstanding |
| --- | --- | --- |
| AC-1 (requirements updated or judged sufficient) | **Open** — REQ-R-ABG3-EVENTS / PROJECTION / LINEAGE / CORRECTION are referenced in `Implements:` headers but no requirements file was modified or annotated as updated by T-103. |
| AC-2 (design defines carriers, event law, projection law, plugin boundary, T-100 relation) | Met. `M03_GRAPH_SPAN…DERIVATION.md` exists with these sections. |
| AC-3 (module/IACS proof assigns ownership to M03-engine-kernel) | **Open** — no automated module-boundary check. Review-time only. |
| AC-4 (pure functions for schedule, admission, foldback, frontier, plan) | Met. All five exist in `graph_span_reentry.ts`. Test 1 verifies schedule. |
| AC-5 (events preserve graph function, run, graph call, frame, vector, span, source/terminal node, attempt/generation, causation, source assessment refs) | **Partial** — `runId`, `workKey`, `frameLineageId`, `causationEventRefs`, `correlationId` missing. See §11. |
| AC-6 (replay-derived projection, not mutable ledger) | Met. `deriveGraphReentryFrontierProjection` rebuilds from events. |
| AC-7 (prior closures remain in event stream; reentry shadows by new generation) | Met. Events stay in stream; projection deletes shadowed closures from in-memory state on rebuild. Test 5 verifies. |
| AC-8 (proof: A->B->C->D with all-close) | Met. Test 2. |
| AC-9 (proof: Eval(C,D) fails → reenter C->D) | Met. Test 3. |
| AC-10 (proof: Eval(B,D) fails because B obligation lost at B->C → reenter B->C) | Met. Test 4. |
| AC-11 (proof: Eval(A,D) fails because A obligation lost at A->B → reenter A->B) | Met. Test 6 (`dropped(0,1)` is exactly this). |
| AC-12 (proof: multiple span gaps → earliest implicated wins) | Met. Test 6 (`reentryCandidateVectorIndexes: [0,1]` → `earliestReentryVectorIndex: 0`). |
| AC-13 (proof: ambiguous evidence → `reprice_required` or `blocked`, not arbitrary retry) | Met. Test 7. |
| AC-14 (proof: replay reconstruction of active frontier from events alone) | Met. Test 2 (`replayedFoldback`) and Test 5 (frontier rebuilt from events). |
| AC-15 (proof: downstream odd_sdlc consumption shape without SDLC-local controller) | **Open** — no test exists. T-103 should explicitly carve this out as deferred to odd_sdlc T-109 or write a shape-only test. |
| AC-16 (proof: span assessment carries `intent_reprice` as constitutional reentry separately from graph target) | Met. Test 8. |
| AC-17 (proof: frontier routes `intent_reprice` to intent-layer reentry surface) | Met. Test 8 (`transition.kind === "reenter_constitutional_route"`, `routeContractRefs: [route-contract://odd-sdlc/intent-reentry]`). |
| AC-18 (proof: downstream route contract carrying change_class/re_entry_point through ABG reentry lineage without ABG owning ticket semantics) | **Partial** — Test 8 carries the route contract refs through plan and transition. It does not test admission of an externally-published route contract or admission of an SDLC-published change_class derivation event. |

**Summary:** 13 of 18 ACs fully met. Five partial/open: AC-1, AC-3, AC-5,
AC-15, AC-18. Of those five:

- AC-1 and AC-3 are process artifacts (requirements update + IACS proof
  module assignment). Cheap to close.
- AC-5 is a real implementation gap (5 missing event fields). Should be
  closed before ticket close.
- AC-15 and AC-18 cross the ABG/odd_sdlc boundary. Acceptable to carve out
  to odd_sdlc T-109.

**Recommendation:** Close T-103 only after AC-5 is closed (event fields
added) and AC-1 / AC-3 are closed by post (one-paragraph requirements
sufficiency note + module-ownership note). Carve out AC-15 and AC-18 to
odd_sdlc T-109 with an explicit note.

## 16. Non-blocking advisory

- The `index.ts` re-exports include both T-103 and T-100 / T-082 surface
  fixes. Keep an eye on this rolling-up of unrelated export-surface fixes
  into feature patches; a future `git blame` will not be accurate to the
  T-103 ticket.
- The design's "Current Code Points" table is unusually concrete and good.
  Future tickets that reference it should treat it as a checklist (this
  review did). The fact that one row was missed is exactly the failure mode
  it was designed to prevent.
- The test fixture `buildThreeStageBasis` builds a 3-vector graph
  (`v0, v1, v2`) which the ticket calls `A->B->C->D` (4 nodes, 3 vectors).
  The naming is a slight off-by-one against the ticket prose. Cosmetic.
- The T-100 review (`20260502T025410Z…`) flagged the `…RuntimeEvent` vs
  `…Event` naming inconsistency. T-103 chose the shorter `…Event` form,
  re-introducing the inconsistency. Pick one across the codebase before
  RC-5.
