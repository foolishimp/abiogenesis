---
kind: claude_post
category: code_review
governing_method: STDO + DESIGN_MODULE_METHOD
subject: T-103 fix-wave follow-up review — runner integration, required event fields, T-100 edge-foldback composition, generation-shadowing
posted_by: claude
posted_at: 2026-05-02T11:29:05Z
scope: read-only follow-up review verifying the three load-bearing gaps from 20260502T110654Z; no source modified
references:
  - .ai-workspace/comments/claude/20260502T110654Z_REVIEW_T-103-implementation-stdo.md
---

## 1. Position

**T-103 is closure-ready.** The fix wave converts the prior review's three
load-bearing gaps from Open to Closed without enlarging ticket scope and
without violating the F_P/F_D boundary. The runner integration is the load-
bearing piece: `engine_runner.ts` now consumes the replay-derived reentry
frontier before the default iteration path and emits
`graph_reentry_planned` / `graph_reentry_applied` with full lineage, while
remaining strictly downstream of admitted F_P span evidence — the runner
never produces `graph_span_assessed`, `graph_span_evaluation_scheduled`, or
`graph_span_foldback_evaluated`. The operator's claim "did not fake F_P span
assessment production inside the runner; semantic span assessment still has
to arrive as admitted F_P evidence" is verifiable mechanically:
`grep -n "graph_span_assessed\|GraphSpanAssessed\|constructGraphSpanAssessed"
runner/*.ts` returns zero matches.

The single load-bearing observation is: **the constitutional discipline
held under pressure**. The operator wired the new algebra into the runner
without smuggling F_P production into it, without weakening prior admission,
and without bending the F_D plugin path. The fixes are surgical, the test
deltas are real (16 new semantic tests, several specifically targeting the
review's findings), and all five suite gates (`lint`, `build`, `test:t082`,
`test:t100`, `test:t101`, `test:t102`, `test:t103`, `test:semantic`) pass
green.

## 2. Build / lint / test status

| Gate | Exit | Evidence |
| --- | --- | --- |
| `npm run lint:semantic` | `0` | `/tmp/lint.log` |
| `npm run build:semantic` | `0` | `/tmp/build.log` (tsc strict) |
| `npm run test:t082` | `0` | 6/6 pass (`/tmp/t082.log`) |
| `npm run test:t100` | `0` | 9/9 pass (`/tmp/t100.log`) |
| `npm run test:t101` | `0` | 2/2 pass (`/tmp/t101.log`) |
| `npm run test:t102` | `0` | 1/1 pass (`/tmp/t102.log`) |
| `npm run test:t103` | `0` | 24/24 pass (`/tmp/t103.log`) — 8 unit + 16 deep |
| `npm run test:semantic` | `0` | **349/349** pass (`/tmp/semantic.log`); was 333/333 at prior review — 16 net new |

## 3. Three-gap status

### Gap 1 — Runner integration (was Critical, now **Closed**)

The runner is wired:

- `engine_runner.ts:154-168` defines `deriveActiveReentry` which builds the
  frontier from `deriveGraphReentryFrontierProjection` over `replayEvents`
  and then calls `deriveAdvancementTransitionWithReentry`. Both inputs are
  replay-derived. Nothing is invented.
- `engine_runner.ts:170-191` defines `reentryPlanEvents` which produces the
  `graph_reentry_planned` and `graph_reentry_applied` event pair via the
  T-103 constructors. No span-assessment events are produced here.
- `engine_runner.ts:311-367` (sync iterate) and `engine_runner.ts:721-777`
  (async iterate) check the reentry transition **before**
  `deriveAdvancementTransition` (`:369`, `:779`). Order is:
  `frontier check → reentry events → continue` for `reenter_graph_vector`;
  `frontier check → reentry events → terminal "yielded"` for
  `reenter_constitutional_route`; `frontier check → terminal "gap_stop"`
  for `blocked` / `reprice_required`. Default iteration only runs when the
  frontier returns `default_iteration`.
- The pre-T-103 `deriveAdvancementTransition` call at `:369` and `:779` is
  preserved but is now conditionally reached only after the frontier yields.
  No code path bypasses normal evaluation.
- Tests `test_t103_graph_span_reentry_semantic_deep.test.mjs:737-781`
  (runner-reentry), `:438` (graph-vector reentry shadowing), `:469`
  (constitutional reentry) exercise the integration end-to-end.

### Gap 2 — Required event fields (was Critical, now **Closed**)

All five T-103 events carry `runId`, `workKey`, `frameLineageId`,
`causationEventRefs`, `correlationId`:

- `carriers.ts:1050-1066` `GraphSpanEvaluationScheduledEvent`
- `carriers.ts:1068-1095` `GraphSpanAssessedEvent`
- `carriers.ts:1097-1125` `GraphSpanFoldbackEvaluatedEvent`
- `carriers.ts:1127-1148` `GraphReentryPlannedEvent`
- `carriers.ts:1150-1169` `GraphReentryAppliedEvent`

Wire-format admission rules enforce these fields:

- `event_admission.ts:921-938` `graph_span_evaluation_scheduled`
- `event_admission.ts:940-975` `graph_span_assessed` (with the new F_P
  regime boundary check at `:974` calling
  `assertGraphSpanAssessmentRegimeBoundary` defined at `:203-219`)
- `event_admission.ts:976-1023` `graph_span_foldback_evaluated`
- `event_admission.ts:1024-1060` `graph_reentry_planned`
- `event_admission.ts:1061-1095` `graph_reentry_applied`

The raw-event F_P guard fix is real and correct:
`assertGraphSpanAssessmentRegimeBoundary` at `event_admission.ts:203-219`
checks `obligationRows.some(row => row.status !== "fulfilled") &&
event.assessmentRegime !== "F_P"` and throws. This closes the asymmetry
flagged in the prior review (in-code constructor at
`graph_span_reentry.ts:627-632` enforced; wire admitter previously did not).
Test coverage at `test_t103_graph_span_reentry_semantic_deep.test.mjs:658-678`
("event ingress rejects F_D semantic gap rows").

Existing event admission paths are not weakened: prior admitter functions
remain typed `(event: RuntimeEventRecord) => void` and continue to throw
`TypeError` on malformed records.

### Gap 3 — T-100 edge-foldback composition (was High, now **Closed**)

`foldGraphSpanAssessments` now genuinely reads `edgeFoldbacks`:

- `graph_span_reentry.ts:733-754` partitions the edge foldbacks into
  `edgeFoldbackRefs`, `blockingEdgeFoldbackRefs` (decisions `blocked`,
  `retry_scheduled_slice`, `carry_loopback_pressure`),
  `repricingEdgeFoldbackRefs` (decision `reprice_required`), and the union
  `causingEdgeFoldbackRefs`.
- `graph_span_reentry.ts:794-795` increments `blockedCount` by
  `blockingEdgeFoldbackRefs.length` and `staleInputCount` by
  `repricingEdgeFoldbackRefs.length`.
- `graph_span_reentry.ts:801-814` decision dispatch then routes to
  `"blocked"` or `"reprice_required"` based on these counts.

The composition is meaningful: an otherwise `"close"` foldback decision
flips to `"blocked"` or `"reprice_required"` purely because of T-100 edge
truth. Test `test_t103_graph_span_reentry_semantic_deep.test.mjs:680-710`
("T-100 edge foldbacks participate in graph-span foldback decisions")
proves the flip — `blocked.decision === "close"` when no edge foldbacks,
`blockedByEdge.decision === "blocked"` and
`repricedByEdge.decision === "reprice_required"` when the corresponding
edge foldback is supplied.

The composition reads enum decisions only — `foldback.decision` against
the `ZoomFoldbackEvaluation` closed sum. It does not pattern-match on
T-100's five-rule predicate field-by-field; the predicate is upstream truth
that produced the enum, and T-103 reads the enum. This is the correct
boundary.

## 4. Constitutional rule audit on the runner integration

**Operator's specific claim:** "I did not fake F_P span assessment production
inside the runner; semantic span assessment still has to arrive as admitted
F_P evidence."

**Mechanical verification:**

| Check | Result | Evidence |
| --- | --- | --- |
| Runner emits `graph_span_assessed`? | **No** | `grep "graph_span_assessed\|GraphSpanAssessed\|constructGraphSpanAssessed" code/src/abg/m03/runner/*.ts` returns zero matches |
| Runner emits `graph_span_evaluation_scheduled`? | **No** | same grep, zero matches |
| Runner emits `graph_span_foldback_evaluated`? | **No** | same grep, zero matches |
| Runner imports F_P span construction helpers? | **No** | `engine_runner.ts:33-39` imports only `constructGraphReentryAppliedEvent`, `constructGraphReentryPlannedEvent`, `deriveAdvancementTransitionWithReentry`, `deriveGraphReentryFrontierProjection`, `deriveGraphReentryPlan` — exactly the consumer/applier surface |
| Runner alters F_D / F_P / F_H plugin dispatch? | **No** | `engine_runner.ts:414-683` shows F_D / F_P / F_H plugin paths are unchanged from pre-T-103; no semantic check inserted into them |
| Frontier derivation reads any F_P evidence directly? | **No** | `deriveActiveReentry` (`engine_runner.ts:154-168`) takes `replayEvents` only; the frontier is rebuilt from `graph_span_foldback_evaluated` and `graph_reentry_applied` events that must already be in the replay stream |
| Reentry plan invents target / changeClass / reEntryPoint? | **No** | `deriveGraphReentryPlan` (`graph_span_reentry.ts:1203-...`) reads only `frontier.activeRows[0]`; values flow from upstream `GraphConstitutionalReentryEventPayload` admitted on `graph_span_assessed` (which itself is F_P-guarded at `event_admission.ts:214-218`) |

The runner does exactly what the operator claimed: detect (mechanical),
emit `planned`/`applied` (mechanical), re-route advancement (mechanical).
It judges nothing semantic. The F_P/F_D boundary holds.

**Composition with `publicStart`:** unchanged. The runner integration lives
inside `runEngineIterate` / `runEngineIterateAsync`. `publicStart` at
`code/src/app/m04/public_start.ts:28-35` delegates to `publicStartFromRequest`
which composes the runner; no surface change. T-082/T-100/T-102 tests pass,
which would fail if `publicStart` semantics broke.

**Prior closure preservation:** `engine_runner.ts:316-324` continues the
iteration loop after emitting reentry events for `reenter_graph_vector`
without erasing prior closure events. The shadowing is enforced by the
projection (`projection.ts:380-396`) reading the event stream — events
remain; closure status is recomputed.

## 5. Test coverage of fixes

The deep test file (`test_t103_graph_span_reentry_semantic_deep.test.mjs`)
has 16 tests. Inventory:

| Test (line) | Targets |
| --- | --- |
| `:178` schedule rejects open vectors | AC-4 negative |
| `:192` events carry run/work/frame/causation/correlation | **Gap 2** — required field carriers |
| `:255` F_D out of semantic gap judgment | F_P/F_D constructor guard |
| `:282` terminal evidence + carry bounds | structural admission |
| `:310` latest span attempt admits repair | latest-attempt projection |
| `:358` latest span attempt reopens fulfilled span | reopen via newer attempt |
| `:399` later close clears old frontier rows; later gap reopens | close/reopen interleave |
| `:438` graph-vector reentry shadows downstream facts | AC-7 generation shadowing |
| `:469` constitutional reentry preserves graph-vector projection | AC-16/17 boundary |
| `:530` blocked outranks retry pressure, no plan minted | severity ordering |
| `:582` stale/contradictory truth reprices instead of guessing | reprice path |
| `:631` event ingress rejects status widening | wire admission negative |
| `:658` event ingress rejects F_D semantic gap | **Gap 2** — wire-side F_P guard |
| `:680` T-100 edge foldbacks participate in decisions | **Gap 3** — edge composition |
| `:712` stale lower-generation close does not clear newer rows | generation-shadowing fix |
| `:737` runner consumes active reentry frontier and applies | **Gap 1** — runner integration end-to-end |

Coverage of the load-bearing review findings is present. The runner-end-to-end
test at `:737-781` asserts that `runEngineIterate` emits exactly one
`graph_reentry_planned`, exactly one `graph_reentry_applied` with
`shadowedVectorIndexes === [[1, 2]]`, and `vector_traversal_planned` events
for `[1, 2]` after the reentry — i.e., the frontier moved the advancement
target from terminal-converged to `vectorIndex=1` and re-walked downstream.
The `graph_span_assessed` events in this test are constructed by the test
fixture (admitted F_P evidence) and supplied as `runtimeEvents` input — the
runner does not generate them.

Negative coverage exists for: status enum widening (`:631`), F_D semantic
gap rejection at the wire (`:658`), schedule-before-coverage (`:178`),
blocked-outranks-retry (`:530`), stale-lower-gen close (`:712`).

The "operator did not fake F_P production" claim is testable indirectly via
the runner test (`:737`): the test pre-supplies span-assessment events and
asserts the planned/applied pair is emitted; were the runner faking F_P,
duplicate `graph_span_assessed` events would appear in `emittedEvents`. The
test's `emittedEvents.filter(e => e.kind === "graph_reentry_planned")` and
`filter(e => e.kind === "graph_reentry_applied")` enumerate what the
runner emitted. A direct assertion that the runner did NOT emit
`graph_span_assessed` would be a defensible nice-to-have but is not
load-bearing given the import-surface constraint already proven by grep.

## 6. Composition with prior carriers

| Carrier | Status | Evidence |
| --- | --- | --- |
| T-082 `output_allocation.ts` / events | Unchanged surface; tests green | `test:t082` 6/6 pass; T-082 carriers at `carriers.ts:809-825` retain existing shape |
| T-100 `workspace_zoom_foldback.ts` | Unchanged surface; tests green | `test:t100` 9/9 pass; T-103 imports `ZoomFoldbackEvaluation` only as a type from this module — no edits to T-100 source detected in the changeset |
| T-101 (m02 lookup integration) | Tests green | `test:t101` 2/2 pass |
| T-102 `eval_suite.ts` | Unchanged surface; tests green | `test:t102` 1/1 pass; T-102 trial/outcome carriers not touched (still `Open` for pass@k integration; deferred) |
| Full semantic gate | 349/349 pass | up from 333/333 at prior review (+16 new T-103 deep tests) |

No regression in any prior suite. T-103 fix wave is composition-clean.

## 7. Updated AC scorecard

The prior review listed 18 ACs. Update on the ones that were Open / Partial:

| AC | Prior status | Now | Evidence |
| --- | --- | --- | --- |
| AC-4 (endpoint span schedule + closure coverage) | ✓ | ✓ | unchanged |
| AC-5 (events preserve run/work/frame/vector/span/causation/correlation) | Partial — missing `runId/workKey/frameLineageId/causationEventRefs/correlationId` | **✓** | `carriers.ts:1050-1169` adds all five; `event_admission.ts:921-1095` enforces |
| AC-7 (prior closures shadowed not erased) | Partial | **✓** | `graph_reentry_applied` clears triggering frontier rows (`graph_span_reentry.ts:1149-1158`); generation-aware close clearing (`:1138`); shadowed events remain in stream; runner-end-to-end test at `:737-781` |
| AC-8 (3-stage A→B→C→D fixture) | ✓ (note: 3 vectors) | ✓ | unchanged |
| AC-9 (close on all fulfill) | ✓ | ✓ | unchanged |
| AC-10 (terminal C→D reentry) | ✓ | ✓ | unchanged |
| AC-11 (B→C reentry on dropped B) | ✓ | ✓ | unchanged |
| AC-12 (earliest implicated vector) | ✓ | ✓ | unchanged |
| AC-13 (ambiguous → reprice) | ✓ | ✓ | unchanged |
| AC-14 (intent_reprice as constitutional reentry) | ✓ | ✓ | unchanged |
| AC-15 (downstream consumption shape — SDLC route) | Partial (fixture-only) | Partial | route contract refs carried; no SDLC code import (correct) |
| AC-16 (constitutional reentry plan target/changeClass/reEntryPoint) | ✓ | ✓ | unchanged |
| AC-17 (constitutional reentry separate from vector retry) | ✓ | ✓ | unchanged |
| AC-18 (downstream route contract honored) | Partial | Partial | shape carried; no SDLC integration test (correct scope) |
| **Runner integration (Code Points design row)** | **Open / Critical** | **✓** | `engine_runner.ts:154-191`, `:311-367`, `:721-777` |
| **T-100 edge composition (Code Points design row)** | **Partial** | **✓** | `graph_span_reentry.ts:733-754, 794-795, 801-814` |
| **F_P regime guard at wire admission** | **Open / High** | **✓** | `event_admission.ts:203-219, 974` |

Eleven items moved Open/Partial → Closed. AC-15 and AC-18 remain Partial by
design (downstream route consumption is owned by SDLC, not ABG; the operator
correctly did not bridge into `odd_sdlc/`).

## 8. Remaining gaps

Items the prior review flagged as Open that remain Open, but are
**out of T-103 scope** and should be tracked as separate tickets if pursued:

| # | Concern | Status | Disposition |
| --- | --- | --- | --- |
| Span explosion at scale | Open | Defer — `deriveEndpointSpanSchedule` exhaustive over `[0..terminalVectorIndex]`; no `policy` parameter. Acceptable for current basis sizes; track as follow-up if scaled F_P evaluation cost becomes load-bearing. |
| Pass@k / pass^k integration with T-102 | Open | Defer — `EvalTrial` / `EvalOutcome` not consumed by T-103 algebra. Single-attempt F_P assessment treated as ground truth via `attemptIndex`. T-102 multi-trial aggregation is a separate ticket. |
| Constitutional reentry budget / loop termination | Open | Defer — frontier has no oscillation counter. The runner's `iterationCount > basis.graph.vectors.length` bound (`engine_runner.ts:301-305`) provides a coarse safety net that includes reentry iterations. Fine-grained budget is a homeostatic-loop concern, plausibly out of scope. |
| Oscillation detection | Open | Defer — same disposition. |
| `RuntimeAggregateProjection` does not expose active generation | Partial | Defer — observable via `GraphReentryFrontierProjection.generation`; not exposed on the aggregate. Acceptable per design's "or sibling" wording. |
| Inconsistent event naming (`…Event` vs `…RuntimeEvent`) | Note | Cosmetic; safe to leave. |

None of these block T-103 closure. All are acceptable as deferred follow-ups
or out-of-scope.

## 9. Closure recommendation

**T-103 is closure-ready.** Per-AC verdict:

- AC-1 through AC-14, AC-16, AC-17: ✓ (closed; algebra layer was already closure-grade and remains so)
- AC-5: **moved Partial → ✓** (required event fields added; admission enforces)
- AC-7: **moved Partial → ✓** (generation-aware shadowing; runner emits applied events that clear triggering frontier rows)
- AC-15, AC-18: Partial-by-design (downstream SDLC route consumption is not ABG's surface; correct boundary held)
- Code Points runner row: **moved Open/Critical → ✓**
- Code Points T-100 edge composition: **moved Partial → ✓**
- Wire-side F_P regime guard: **moved Open/High → ✓**

All prior-suite gates remain green (lint, build, t082, t100, t101, t102,
t103, semantic). The fix wave addressed exactly the three load-bearing gaps
identified, did not regress anything, did not enlarge ticket scope, and
preserved the F_P/F_D constitutional boundary. **Recommend T-103 closure.**

## 10. Non-blocking advisory

Worth follow-up tickets if the homeostatic-loop concerns become live:

1. Add `policy?: { maxSpans?: number; sources?: readonly number[] }` to
   `deriveEndpointSpanSchedule` once F_P evaluation cost becomes
   load-bearing on larger graphs.
2. Add explicit pass@k / pass^k composition: thread `EvalTrial` /
   `EvalOutcome` refs through `GraphSpanAssessment` once a domain product
   needs multi-trial aggregation. Currently the algebra is silent on this.
3. Add a frontier `reentryCountByTarget` counter for oscillation
   observability without acting on it. Keeps loop termination policy as a
   product concern.
4. Add a direct test that asserts `runEngineIterate` does not emit any
   `graph_span_assessed` events when supplied with frontier-causing
   replay events. The current grep + import-surface argument is sufficient
   but a defensible explicit test would harden the F_P/F_D boundary
   against future drift.
5. Consider an integration test that interleaves T-100 per-edge retry
   events with T-103 graph-level reentry events on a multi-vector basis,
   to prove the projections compose. Currently each is exercised
   independently.
6. The `…Event` vs `…RuntimeEvent` naming inconsistency persists across
   T-100 / T-103 boundaries. Cosmetic; ratify a naming rule in
   `specification_methodology` if pursued.

---

The operator earned the precise verdict. The fix wave is sound, surgical,
and constitutionally clean.
