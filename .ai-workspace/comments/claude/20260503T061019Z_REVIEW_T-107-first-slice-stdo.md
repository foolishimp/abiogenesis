---
date: 2026-05-03
author: claude
kind: review
subject: T-107 first-slice ABG substrate implementation
scope: code/src/abg/m03/contracts/traversal_modulation.ts and runner integration
ticket: T-107
status: commentary
verdict: ratify substrate-ready (live/sandbox proof gates remain)
---

# T-107 First-Slice STDO Review

## 1. Position

**Net verdict**: ratify substrate-ready. The first slice is structurally sound,
the GTL-qualifier opt-in safety property holds mechanically, and constitutional
discipline is preserved. Closure for the wave still requires the live/sandbox
proof lanes operator named (live Claude/Codex backend parity, downstream
odd_sdlc consumption).

**Single load-bearing observation**: the runner integration at
`engine_runner.ts:706` always invokes `deriveModulatedFpAttempt`, which returns
`null` when no GTL qualifier is present
(`traversal_modulation.ts:326`). Every T-107 emission downstream is gated on
`modulatedAttempt !== null` (`engine_runner.ts:723, 738, 871, 884`). The plugin
contract field is required-with-`null`-default
(`plugins.ts:136, 460`). This is the load-bearing safety property and it holds
mechanically.

## 2. Build/lint/test status

| Suite | Exit | Note |
|---|---|---|
| `npm run lint:semantic` | 0 | clean |
| `npm run test:t082` | 0 | no regression |
| `npm run test:t100:unit` | 0 | no regression |
| `npm run test:t100:sandbox` | 0 | no regression |
| `npm run test:t101` | 0 | no regression |
| `npm run test:t102` | 0 | no regression |
| `npm run test:t103` | 0 | no regression |
| `npm run test:t104` | 0 | no regression |
| `npm run test:t106` | 0 | no regression |
| `npm run test:t107` | 0 | 13/13 pass |
| `npm run test:semantic` | 0 | full suite green |

No regressions introduced.

## 3. Six design-phase concern status

| ID | Status | Evidence |
|---|---|---|
| D-1 T-100 carrier shape | **Closed** | `traversal_modulation.ts` does not import or extend `ObligationScheduleAsset` / `ObligationScheduleItem`. `obligationScheduleRefs` is `readonly string[]` throughout (lines 149, 200, 227, 1133-1136). Schedule items are referenced by ref only. T-100 carrier files in `code/src/abg/m03/contracts/workspace_zoom_foldback.ts` and `payload_ledger.ts` show no T-107 modifications. |
| D-2 agent-proposed admission predicate | **Partial** | The mechanical check is present and tested (`traversal_modulation.ts:817-834`): requires non-empty `proposedScheduleItemRefs` AND non-empty `proposedSliceAdmissionEvidenceRefs` AND that proposals be a subset of `obligationScheduleRefs`. The test (`test_t107_traversal_modulation_unit.test.mjs:444-484`) asserts both throw-without-evidence and accept-with-evidence. **Gap**: the design doc `M03_TRAVERSAL_MODULATION_DERIVATION.md` does not name *which* admission regime (F_H / F_P plugin / mechanical carrier admission) issues those evidence refs. Substrate-clean; downstream owner identity not pinned. |
| D-3 `allowedProgressArtifactKinds` taxonomy | **Open (advisory)** | Field is still `readonly string[]` at `traversal_modulation.ts:200`, populated through `freezeOptionalUniqueStrings` at line 734-737. The recommendation to tighten to a closed sum or admitted-by-reference taxonomy was not adopted. The field is currently advisory configuration only — it is not consumed by `deriveTraversalModulationAssuranceProjection` to validate progress-row artifact kinds (see lines 1494-1502, where artifacts are aggregated into `evidenceRefs` regardless of kind). The "backend ambiguity" test does not exercise progress-artifact-kind validation. Non-blocking at substrate scope; flag for AC-2 follow-up. |
| D-4 affect / backend coupling | **Partial** | `TraversalAffect` is a closed discriminated union (`traversal_modulation.ts:131-136`) and `assertAffect` (line 611-627) enforces level vocabularies. **Gap**: affects are stored on the profile (line 230) but never consumed — there is no path where affect modifies `progressSignalRequiredBeforeInactivityMs`, `targetItemCount`, or any backend profile field. The design doc does not pin the coupling. No test exercises affect-vs-backend interaction. Substrate-clean as pass-through metadata; semantically inert until pinned. |
| D-5 backend extensibility | **Closed** | `AGENTIC_BACKEND_KIND_VALUES` is a closed sum at `traversal_modulation.ts:48-52`: `"claude" | "codex" | "generic_process"`. `assertBackendKind` (line 393-395) enforces membership via `assertAllowed`. No admission helper for new backends — extension requires a substrate-level change, which is the constitutionally correct outcome for a closed sum. |
| D-6 worker-emitted vs synthesized rows | **Closed** | `admitTraversalAttemptProgressRow` (`traversal_modulation.ts:1388-1430`) requires explicit `scheduleItemRef` and `declaredOutcome`; rows are not synthesized. `deriveTraversalModulationAssuranceProjection` (lines 1504-1539) iterates `selectedRefs`, and missing rows are pushed to `missingProgressRowRefs` (line 1509) and projected as a `missing_progress_row` forced-review trigger (lines 1542-1551), not synthesized as `not_attempted`. Test at line 486-523 verifies missing-row-only case projects to `forced_review` with trigger `missing_progress_row`. |

## 4. Constitutional discipline audit

| ID | Status | Evidence |
|---|---|---|
| C-1 strategy-label discipline | **Closed** | grep across `traversal_modulation.ts` and `engine_runner.ts` for `steel_thread`, `waterfall`, `layered_build`, `by_feature`, `by_obligation` returns no hits in switch/branch positions. The only matches are: (a) the enum primitive `gap_repair_slice` (line 41, 839) which is a `TraversalSchedulingPrimitive` value not a strategy label, and (b) the config key string `"strategy_label"` (lines 78, 553) used to read the GTL hook config field. Test at line 413-442 ("strategy labels are descriptive...") proves identical primitives produce identical envelope selections regardless of label (`steel_thread` vs `waterfall` selections compared via `assert.deepEqual`). ABG switches only on `TraversalSchedulingPrimitive` enum values via `hasPrimitive` (lines 818, 839, 855, 864, 865, 1227). |
| C-2 opt-in via GTL qualifier | **Closed** | The runner gate is `tryResolveTraversalStrategyDirectiveFromGtl` (`traversal_modulation.ts:974-991`) returning `null` when no qualifier is present. `deriveModulatedFpAttempt` (`engine_runner.ts:312-347`) returns `null` propagating that absence. Plugin input passes `modulatedAttempt?.envelope ?? null` (line 720). All T-107 event emissions guarded on `modulatedAttempt !== null` (lines 723, 738, 871, 884). Test 13 ("runner leaves unqualified F_P vectors on the legacy path", lines 830-868) mechanically asserts: (i) `pluginInputs[0].traversalAttemptEnvelope === null`, (ii) NO `traversal_attempt*` events emitted, (iii) NO `traversal_modulation_resolved` event emitted. Test 12 (lines 765-828) is the qualified counterfactual emitting the expected event sequence. |
| C-3 F_P/F_D boundary | **Closed** | `deriveTraversalModulationAssuranceProjection` (lines 1476-1644) performs only mechanical operations: ref-set membership (`selectedRefs.includes`, line 1498), array length comparisons (lines 1508, 1512), enum equality (line 1522, 1528), and presence of refs (lines 1521-1525). No artifact parsing, no semantic interpretation of evidence content, no per-obligation count expectations. `firstForcedReviewGate` (lines 873-904) records triggers without judging meaning. The progress contract field `progressArtifactRequired` is declared but is not enforced as a semantic check in projection — only as a config flag. |
| C-4 replay-derived projection | **Closed** | All exported functions are pure: take inputs, return frozen carriers. No module-scope mutable state (verified: only `const` exports). All carriers exit through `Object.freeze` (lines 530, 888, 928, 1059, 1115, 1165, 1234, 1282, 1322, 1369, 1404, 1452, 1619, 1672, 1710, 1755, 1800, 1822). Closed sum value lists (`TRAVERSAL_*_VALUES`) all `Object.freeze`-d (lines 35, 48, 56, 62, 69, 75, 88, 98, 112, 121). No `any` escape hatches found via TypeScript strict gate (lint passes). |
| C-5 composition with T-106 | **Closed** | T-107 does NOT redefine non-progress action. The runner's blocked-output path at `engine_runner.ts:859-902` calls `deriveBlockedFpNoArtifactContinuation` (T-106 owned, line 403-466) unconditionally; T-107 only ADDS a `traversal_attempt_non_progress_classified` event when `modulatedAttempt !== null` (lines 871-880, 884-893). The T-106 retry/terminal flow (`continuation.retryEvents`, line 881; `constructTerminalReachedEvent(continuation.transition)`, line 894) runs on both paths unchanged. The progress contract `noProgressClass` is hard-restricted to `"runtime_non_progress"` (lines 728-731) — T-107 cannot redefine T-106's class. |
| C-6 composition with T-100/T-103/T-104 | **Closed** | (T-100) Schedule items referenced by `readonly string[]` only — no carrier extension; verified by grep. (T-103) `graph_span_reentry.ts` was not modified by T-107. (T-104) Cross-workspace refs flow through envelope `gapPressureRefs` / `affectRefs` as opaque strings (lines 253-254). Projection (`projection.ts:362-373`) and retry-frontier (`retry_frontier.ts:662-669`) both extend their exhaustive event switches to recognize T-107 event kinds via pass-through cases — exhaustiveness preserved, no semantic reinterpretation. |

## 5. Implementation audits

### Audit A — `engine_runner.ts:312-347` and `:706-902` integration

The integration entry is `deriveModulatedFpAttempt` (lines 312-347). It performs:

1. `vector` lookup at `basis.graph.vectors[transition.vectorIndex]` (line 317)
2. `tryResolveTraversalStrategyDirectiveFromGtl({ vector, graphFunction, roles })` (lines 321-325)
3. **Early return `null` on resolution===null** (line 326-328) — load-bearing
4. Profile + envelope derivation only on the qualified branch (lines 329-345)

The runner block at line 706-721 always calls `deriveModulatedFpAttempt`, then
constructs the plugin input passing the envelope or `null`. This is a pleasant
property: the helper's `null`-returning contract centralizes the qualifier
gate, so there is no parallel control flow.

No T-082/T-100/T-103/T-106 logic was removed. The `deriveBlockedFpNoArtifactContinuation`
call at line 860 runs on every blocked outcome regardless of qualifier
presence.

### Audit B — `plugins.ts` `traversalAttemptEnvelope` field

- Carrier interface field at `plugins.ts:136`:
  `readonly traversalAttemptEnvelope: TraversalAttemptEnvelope | null;` —
  REQUIRED on the live carrier.
- Constructor input field at `plugins.ts:460`:
  `readonly traversalAttemptEnvelope?: TraversalAttemptEnvelope | null | undefined;` —
  OPTIONAL.
- Constructor default at `plugins.ts:523`: `?? null`.

This means: existing F_P plugin call sites that omit the field continue to
work, receiving `null`. New F_P plugins that consume the envelope read
`input.traversalAttemptEnvelope` directly. The shape is forward-compatible.

### Audit C — Test 13 (legacy path preservation)

`test_env/tests/test_t107_traversal_modulation_unit.test.mjs:830-868`:

- Builds an `F_P` basis with NO vector declarations
  (`buildThreeStageBasis({ defaultRegime: "F_P" })`) — no qualifier
- Drives the runner via `runEngineIterate` with a stub `fpDispatch` plugin
- Asserts `pluginInputs[0].traversalAttemptEnvelope === null` (line 859)
- Asserts no `traversal_attempt*` events emitted (lines 860-863)
- Asserts no `traversal_modulation_resolved` event emitted (lines 864-867)

This is a mechanical proof of the C-2 safety property and the strongest
single guarantee in the test suite.

### Audit D — Carrier-shape closed-sum verification

| Type | Location | Cardinality | Closed sum? |
|---|---|---|---|
| `TraversalSchedulingPrimitive` | line 35-46 | 7 | Yes — frozen const + indexed-access type |
| `AgenticBackendKind` | line 48-54 | 3 | Yes |
| `TraversalAffect` | line 131-136 | 5 dimensions × {3 levels (most) / 3 incl. urgency normal} | Yes — closed discriminated union |
| `TraversalForcedReviewTrigger` | line 98-110 | 8 | Yes |
| `TraversalAttemptProgressOutcome` | line 88-96 | 4 (`fulfilled`, `partial`, `blocked`, `not_attempted`) | Yes |
| `TraversalModulationAction` | line 112-119 | 3 (`continue_same_edge`, `forced_review`, `foldback_ready`) | Yes |
| `TraversalModulationGtlQualifierSource` | line 138-141 | 3 | Yes |

Note on urgency: `urgency.level` is `"low" | "normal" | "high"` (line 132)
versus other affects' `"low" | "medium" | "high"`. Intentional asymmetry per
the discriminated union.

### Audit E — Test coverage matrix

13 tests for ~16 substrate-scope ACs (AC-12/13/14/18 are explicitly delegated
to live/sandbox proof lanes per IACS). Mapping:

| AC area | Test(s) | Coverage |
|---|---|---|
| GTL qualifier precedence (vector > graph-function > role) | T1, T2, T3 | Direct |
| Fail-closed on malformed/duplicate/absent | T4 | Direct |
| Strategy-label descriptive (no ABG switching) | T5 | Direct |
| Agent-proposed admission predicate | T6 | Direct |
| Forced-review on incomplete progress (missing rows, partial w/o remaining work, evidence missing) | T7 | Direct |
| Same-edge continuation projects with typed remaining work | T8 | Direct |
| Backend ambiguity → forced review (no semantic closure) | T9 | Direct |
| Event family admission with lineage; drift assertions | T10 | Direct |
| Transport dispatch carries envelope primitives | T11 | Direct |
| Runner derives envelope and passes to plugin (qualified) | T12 | Direct |
| Runner leaves unqualified vectors on legacy path (load-bearing safety) | T13 | Direct |
| Modulation summary/projection agreement | T8 (asserts `assertTraversalModulationSummaryAgreement` and drift throw) | Direct |
| Composition with T-106 non-progress at runner level | T12 (emits `traversal_attempt_non_progress_classified`) | Indirect (no integration test that combines T-107 modulation with full T-106 retry/terminal classification — relies on the qualified-blocked plugin path returning blocked) |

**Gaps**:

- No unit test exercises `progressContract.allowedProgressArtifactKinds`
  validation (D-3 follow-up).
- No unit test exercises affect levels modulating profile/envelope output
  (D-4 follow-up). `affects` is currently inert metadata.
- No test combines a populated T-100 obligation schedule projection with a
  T-107 envelope round-trip (composition with T-100 is covered in regression
  via `test:semantic`, but no T-107-specific T-100 composition test exists).
- `traversal_modulation_exhausted` event is constructed in T10 but no
  end-to-end test exercises retry-budget exhaustion driving the runner to
  emit it.

## 6. Findings register

| Severity | Area | Claim | File:line | Anchor | Recommendation |
|---|---|---|---|---|---|
| Medium | D-2 | Design doc does not name which admission regime issues `proposedSliceAdmissionEvidenceRefs` | `M03_TRAVERSAL_MODULATION_DERIVATION.md:60-91`, `traversal_modulation.ts:826-828` | AC-2 follow-up | Pin admission owner (F_H gate, F_P admission plugin, or typed event family) in the derivation doc. |
| Medium | D-4 | `TraversalAffect` is stored on profile but never consumed; coupling unspecified | `traversal_modulation.ts:230, 1143-1146`, derivation doc has no affect section | semantic inertness | Either remove from substrate first slice OR add a `deriveBackendProfileAffectAdjustment` pure function and a test that proves which profile fields affect modulates. |
| Medium | D-3 | `allowedProgressArtifactKinds` is `readonly string[]` and not consumed by assurance projection | `traversal_modulation.ts:200, 734-737, 1494-1502` | non-closure on AC-2 advisory | Either tighten to closed sum / admitted-by-reference, or drop from the substrate first slice if not load-bearing. |
| Low | C-5 | Runner emits T-107 non-progress event AFTER T-106 carrier derivation but before T-106 retry events; ordering is correct but encoding is duplicated across retry/terminal branches | `engine_runner.ts:870-893` | code hygiene | Extract a single `emitT107NonProgressIfModulated(...)` helper to remove the duplicated `if (modulatedAttempt !== null)` block. |
| Low | C-2 | `agenticBackendKindForBasis` infers backend kind from string-substring match on `runtimeIdentity.backendId / workerId / resolvedRuntimeRef` | `engine_runner.ts:282-294` | string-shape coupling | Acceptable at first slice; later, derive `AgenticBackendKind` from a typed runtime-identity field set by resolved-runtime admission rather than substring match (`.includes("claude")`). |
| Low | testing | No end-to-end test exercises `traversal_modulation_exhausted` emission via the runner | T10 constructs the event but no runner-driven path | retry-budget exhaustion | Add a runner test that drives `retryBudgetRemaining === 0 && remainingScheduleItemRefs > 0` to a forced-review gate and proves the exhausted event lineage. |
| Note | C-3 | `progressContract.progressArtifactRequired` is declared but not enforced in `deriveTraversalModulationAssuranceProjection` | `traversal_modulation.ts:199, 733`, projection at lines 1494-1502 | future tightening | Document that this flag is plugin-side advisory until a typed enforcement path exists, or wire it to a missing-artifact forced-review trigger. |
| Note | hygiene | `T-107` files (traversal_modulation.ts, design docs, test) are present on disk but not yet `git add`-ed in the working tree | `git ls-files --error-unmatch` reports unmatched | release control | Stage and commit the T-107 files before cutting the next release tarball. |

## 7. Test coverage matrix (AC -> test)

(Operator-mapped: AC-12 / AC-13 / AC-14 / AC-18 delegated to live/sandbox proof
lanes per `M03_TRAVERSAL_MODULATION_FIRST_SLICE_IACS.md`.)

| AC group (substrate) | Test name | Status |
|---|---|---|
| GTL precedence (vector top) | T1 | Direct |
| GTL precedence (graph-function middle) | T2 | Direct |
| GTL precedence (role bottom) | T3 | Direct |
| Fail-closed on bad qualifier | T4 | Direct |
| Strategy label is descriptive | T5 | Direct |
| Agent-proposed admission requires evidence | T6 | Direct |
| Forced-review on incomplete progress rows | T7 | Direct |
| Same-edge continuation requires typed remaining work + summary agreement | T8 | Direct |
| Backend ambiguity → forced review | T9 | Direct |
| Event family with lineage and admission drift | T10 | Direct |
| Transport dispatch envelope primitives | T11 | Direct |
| Runner qualified path | T12 | Direct |
| Runner unqualified legacy path (load-bearing) | T13 | Direct |
| `allowedProgressArtifactKinds` validation | — | **Gap** |
| Affect-vs-backend coupling | — | **Gap** |
| `traversal_modulation_exhausted` runner emission | — | **Gap** |
| T-100 schedule + T-107 envelope round-trip | regression-covered only | Indirect |

## 8. Closure recommendation

Substrate-ready ACs (ratify on this slice):

- AC-1, AC-3..AC-11, AC-15, AC-16, AC-17, AC-19, AC-20: substrate-clean,
  unit-tested, lint-clean.

Conditionally substrate-ready (ratify with note):

- AC-2: agent-proposed admission predicate is mechanically present; pin
  downstream admission owner before consumer ticket lands.

Live/sandbox-gated ACs (do not close on this slice):

- AC-12 (live Claude backend parity)
- AC-13 (live Codex backend parity)
- AC-14 (mini data-mapper sandbox proof)
- AC-18 (downstream odd_sdlc consumption gate)

Do-not-close holds (advisory):

- D-3 `allowedProgressArtifactKinds` taxonomy: tighten or drop.
- D-4 affect coupling: pin or remove from substrate.

## 9. Non-blocking advisory

- The runner integration is clean but accumulates eight T-107 emit blocks in
  `engine_runner.ts:723-749, 871-880, 884-893`. A small `emitT107(...)`
  helper would reduce duplication and make it obvious at a glance that all
  emissions are gated.
- `agenticBackendKindForBasis` (`engine_runner.ts:282-294`) does substring
  matching on backend identity strings. Workable for the first slice; a
  typed `runtimeIdentity.backendKind: AgenticBackendKind` field on
  `ExecutionBasis` would remove the inference.
- The `affects` field is currently a passive metadata carrier. Either make it
  load-bearing (with a test) or remove it from the first slice carrier shape
  to avoid carrying unowned surface area.
- Stage and commit the T-107 implementation files (`traversal_modulation.ts`,
  the test, the two design docs) before the next release cut — they are
  presently working-tree-only.
- Consider a regression test that combines a populated T-100 obligation
  schedule with a T-107 envelope to lock the ref-only composition contract
  against accidental future extension.

---

**Reviewer**: Claude Opus 4.7
**Method anchors**: STDO (SPEC + TICKET + DESIGN_MODULE + ODD), `M03_TRAVERSAL_MODULATION_DERIVATION.md`, `M03_TRAVERSAL_MODULATION_FIRST_SLICE_IACS.md`
