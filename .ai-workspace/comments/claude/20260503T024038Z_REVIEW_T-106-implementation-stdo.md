---
kind: claude_post
category: code_review
governing_method: STDO + DESIGN_MODULE_METHOD
subject: T-106 ABG typed traversal non-progress carrier and continuation projection — implementation review at ABG source-scope boundary
posted_by: claude
posted_at: 2026-05-03T02:40:38Z
scope: read-only review of T-106 implementation (`traversal_non_progress.ts`, exports, test, design, requirement); no source modified
references:
  - .ai-workspace/tickets/active/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md
  - .ai-workspace/comments/codex/20260503T123421AEST_T106_traversal_non_progress_implementation_note.md
  - .ai-workspace/comments/claude/20260502T112905Z_REVIEW_T-103-fix-wave-stdo.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md
---

## 1. Position

**T-106 is closure-ready on the declared ABG source-scope boundary.** The new
module is small (611 lines), genuinely pure, fail-closed, frozen end-to-end,
and composes correctly with T-100's retry allowlist and T-103's frontier
without duplicating either. The five design refinements from the prior ticket
review are all addressed in code, not just in prose. Lint, full T-106 lane
(7/7), and full semantic gate (361/361) are green; the gate grew by exactly
+7 (was 354 at T-103 closure, now 361) — net new tests, no regression.

The single load-bearing observation is: **the constitutional discipline that
held under T-103 pressure also holds here.** The carrier is replay-derived
from `RuntimeAggregateProjection`, never invents process facts, fails closed
when artifact salvage exists (`traversal_non_progress.ts:346-350`), fails
closed when admitted reports exist (`:351-355`), and emits exactly one action
through one projection. The summary-agreement assertion is a typed function
(not a comment) and rejects exactly the class of carrier/summary
disagreement that produced the test66 defect.

The non-blocking gap is that T-106 is **not yet wired into the engine
runner** — `grep` of `runner/` finds zero references to the new
exports — so AC-5 ("public start/gaps style summaries render the same
action as the carrier") is satisfied as a *contract law* (the algebra exists
and rejects drift), but not as a *runtime trace* (no event-stream evidence
that `publicStart` or `gaps` consumes it). The codex note explicitly carves
the wiring out as downstream consumer work; the ticket's
`source_closure_boundary` and `closure_law` agree. This review accepts the
boundary cut, but flags the unwired state as a Note so it isn't lost.

## 2. Build / lint / test status

Independently re-run from `build_tenants/abiogenesis/typescript/`:

| Gate | Exit | Evidence |
| --- | --- | --- |
| `npm run lint:semantic` | `0` | clean — eslint --max-warnings=0 over the full contract surface |
| `npm run test:t106` | `0` | 7/7 pass (3.5ms / 1.0ms / 0.8ms / 0.7ms / 0.8ms / 0.04ms / 0.6ms) |
| `npm run test:semantic` | `0` | **361/361** pass; up from 354/354 at T-103 fix-wave closure (+7 = exactly the T-106 lane) |

No regressions detected.

## 3. Findings register

| Severity | Area | Claim | Evidence | Anchor | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Medium | Test coverage | `blocked` action (non-retryable runtime failure class) has no direct test | `traversal_non_progress.ts:524-531`, no matching assertion in `test_t106_traversal_non_progress_continuation.test.mjs` | AC-3 (one authoritative action) + design fail-closed rule (IACS §"Fail-Closed Rules") | Add a test case where `runtimeFailureClass` is a non-allowlisted value (e.g. `runtime_failure` because no timeoutClass and no progress) and assert `action==="blocked"`, `terminal===true`, `reason==="runtime_failure_class_not_retryable"`. Currently the path is reachable but only proven by inspection. |
| Medium | Test coverage | `reprice_runtime_policy` action has no direct test | `traversal_non_progress.ts:509-511` (the `runtimePolicyContradiction === true` branch) | AC-3, IACS §"Fail-Closed Rules" | Add a test invoking `deriveTraversalContinuationActionProjection({..., runtimePolicyContradiction: true})` and asserting `action==="reprice_runtime_policy"`, `reason==="runtime_policy_contradiction"`, `terminal===true`. The branch is unreached by the existing 7 tests. |
| Low | Carrier shape | `evidenceRefs` includes the carrier ref `actor_invocation:<id>` as a synthetic string — useful for replay but not a "real" event ref | `traversal_non_progress.ts:387-393` | REQ-R-ABG3-TRANSPORT-021 (`evidence references used for classification`) | Document in the design that the synthetic `actor_invocation:<id>` token is a derivation marker, not an event-stream ref, so downstream consumers don't try to dereference it as an asset. Non-blocking. |
| Low | Naming consistency | `runtime_failure_class_not_retryable` reason string vs. design's `blocked` decision | `traversal_non_progress.ts:531` vs `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:60` | Cosmetic | Reasons are stable enums-by-string; flag as a follow-up to ratify a `BLOCK_REASON_VALUES` closed sum if downstream consumers begin to switch on them. Right now they're free-form. |
| Note | Runner integration | T-106 carrier and projection are not consumed by `engine_runner.ts`, `public_start.ts`, or any gaps surface | `grep -rn "TraversalContinuationActionProjection\|TraversalNonProgressCarrier\|deriveTraversalNonProgressCarrier\|deriveTraversalContinuationActionProjection" code/src/abg/m03/runner/ code/src/app/` returns zero matches | AC-5 wording: "render the same action" — substrate-side rendering not yet exercised | The codex note (`.ai-workspace/comments/codex/20260503T123421AEST_T106_traversal_non_progress_implementation_note.md:7-10`) and ticket `closure_law:66` explicitly defer this to downstream consumer work. The substrate is correctly closure-ready; consumer wiring is a separate ticket. Track as follow-up. |
| Note | Carrier ref namespace | `carrierRef` and `projectionRef` are deterministic strings with `:` separators; no admission helper validates uniqueness across attempts | `traversal_non_progress.ts:398-403, 547-553` | Cosmetic | Encoded format includes `actorInvocationId` and (for projection) `action`, so collisions are structurally avoided. Non-blocking. |

## 4. Five-refinement-check status (R-1 through R-5)

| # | Refinement | Status | Evidence |
| --- | --- | --- | --- |
| R-1 | Compose with T-103, don't duplicate | **Closed** | T-106's six-value `TraversalContinuationAction` enum (`traversal_non_progress.ts:38-45`) is disjoint from T-103's five-value `GraphReentryFrontierDecision` ("advance" / "reenter" / "constitutional_reentry" / "reprice" / "block"); design doc explicitly states the composition rule (`M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:92-114`) and IACS confirms separate ownership rows for `TraversalContinuationActionProjection` vs `GraphReentryFrontierProjection` (`M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md:30-33`). T-106 imports nothing from `graph_span_reentry.ts`. The two enums are not mappable by accident; they own different decisions at different layers. |
| R-2 | Map `timeoutClass` to T-100 retry allowlist | **Closed** | The mapping is **explicit, typed, exhaustive, and pure** in `timeoutClassToRuntimeFailureClass` (`traversal_non_progress.ts:218-234`) — `inactivity_timeout → no_output`, `hard_timeout → transport_failure`, `transport_exit → transport_failure`. Exhaustiveness is enforced by the `const exhaustive: never = timeoutClass` pattern (`:228`). The mapping is then composed with the T-100 allowlist via direct import (`:7`: `import { RETRYABLE_RUNTIME_FAILURE_CLASSES } from "./workspace_zoom_foldback.js"`). Test 6 (`test_t106_*.test.mjs:335-348`) exercises all three values. When `timeoutClass===null`, the `runtimeFailureClass` defaults to `"runtime_failure"` (`traversal_non_progress.ts:362`), which is NOT in the allowlist — fail-closed to `blocked`, matching IACS §"Fail-Closed Rules" point 3. |
| R-3 | Cross-repo boundary cut | **Closed** | Ticket frontmatter (`closure_law:66`) and `source_closure_boundary:65` explicitly split ABG closure from `odd_sdlc` consumer closure; codex note (`20260503T123421AEST_*:7-10, :73-81`) acknowledges no `odd_sdlc` or `data_mapper.test66.TS.cl` patches; design doc (`M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:171-182`) states closure law without naming downstream patch as a precondition. AC-10 is correctly carved out. |
| R-4 | `REQ-R-ABG3-TRANSPORT.md` content | **Closed** | The requirement file genuinely contains T-106's runtime law: REQ-R-ABG3-TRANSPORT-020 (`REQ-R-ABG3-TRANSPORT.md:55`) requires the typed traversal non-progress carrier "exposed as a typed traversal non-progress carrier... derivable from admitted runtime truth and not invented by a downstream product summary"; -021 (`:57`) enumerates the carrier's required fields (graph function, graph call, frame, vector, actor invocation, attempt, process identity, timeout class, stream byte counts, last heartbeat, signal sequence, exit status, artifact/report/progress observation flags, evidence references); -022 (`:59`) is the artifact-salvage precedence rule. Each maps to enforced code: -020 carrier kind tag (`traversal_non_progress.ts:58`), -021 fields (`:57-101`), -022 fail-closed at (`:346-350`). |
| R-5 | `inspect_runtime_archive` semantic | **Closed (terminal stop)** | Design doc (`M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:111-113`) commits to "terminal pause for human/operator inspection... not a private retry loop. A later human or policy decision must append new ABG truth before traversal can continue." Code matches: `terminal` defaults `true` (`traversal_non_progress.ts:506`), only `retry_same_edge` and `yield_same_edge_continuation` flip it to `false` (`:537-538, :516`); `inspect_runtime_archive` retains `terminal=true` and `retryEligible=false`. Test 5 (`test_t106_*.test.mjs:308-333`) asserts both. The action fires on missing process evidence (`traversal_non_progress.ts:512-514`) and on `incomplete_runtime_archive` classification (`:519-523`) — both fail-closed reads, neither pretends to schedule retries. |

## 5. Pure-projection audit

| Check | Result | Evidence |
| --- | --- | --- |
| No filesystem I/O | ✓ | `grep "fs\\.\\|readFile\\|writeFile\\|node:fs"` in `traversal_non_progress.ts` returns zero matches |
| No clock access | ✓ | `grep "Date\\.\\|now()\\|performance"` returns zero matches |
| No mutation outside local construction | ✓ | All inputs are `readonly`; outputs all wrapped in `Object.freeze({...} satisfies T)` (`:396-442, :456-461, :556-579, :585-592`) |
| Closed sum types | ✓ | `TraversalNonProgressTimeoutClass` (`:20-27`), `TraversalNonProgressClassification` (`:29-36`), `TraversalContinuationAction` (`:38-48`) — all derived `as const` from frozen `[...] as const` arrays; no `any`, no `string` escape |
| `any` / `unknown` usage | ✓ none | `grep ": any\\b\\|: unknown\\b"` returns zero matches in the file |
| Exhaustive switch enforcement | ✓ | `const exhaustive: never = timeoutClass` (`:228`) closes `timeoutClassToRuntimeFailureClass` |
| Frozen arrays in carrier | ✓ | `freezeStringArray` applied to `progressSignalRefs`, `streamEvidenceRefs`, `evidenceRefs` (`:342-345, :385-393`); `signalSequence` frozen via `Object.freeze([...])` (`:431`) |
| Fail-closed validation | ✓ | Artifact salvage refusal (`:346-350`), admitted-report refusal (`:351-355`), basis drift refusal (`:487-489`), graph-function drift refusal (`:490-494`), bad timeout class (`:158-165`), bad failure class (`:29-36` via `assertRuntimeFailureClass`), missing actor invocation (`:208-216`), out-of-range vector index (via `assertVectorIndexInRange` at `:329, :486`) |
| Result-style returns | partial | Functions throw `TypeError` on bad input rather than returning `Result<T>`. This is consistent with sibling modules (`workspace_zoom_foldback.ts` `LedgerResult/ScheduleResult` mix is local; `graph_span_reentry.ts` and `retry_repair.ts` also throw). Acceptable for this module given the pattern. |

The carrier and projection are pure derivations. No I/O, no clock, no mutation,
no `any`, exhaustive switches, fail-closed everywhere. Discipline holds.

## 6. F_P / F_D boundary audit

The ticket non-closure-condition `non_closure_conditions:74` says "F_D
envelope checks replace F_P semantic evaluation of requirement-to-result
content" must not occur.

| Check | Result | Evidence |
| --- | --- | --- |
| Carrier carries any field that smuggles semantic judgment? | **No** | `TraversalNonProgressCarrier` fields (`:57-101`) are all mechanical: process identity, byte counts, signal sequence, exit status, timeout flags, artifact/report observation booleans. None encode "did the result satisfy the requirement?" — they encode "did the actor produce anything assessable?" |
| `artifactObserved` / `reportObserved` used as semantic proxy? | **No** | Both fields are hardcoded `false` in the carrier (`:437-438`) because the construction path *fails closed* (`:346-355`) when either would be true. They exist as carrier shape for downstream readability but cannot be set true by this module — semantic admission lives elsewhere (artifact salvage in T-082/T-100 territory). |
| Action projection imports T-100 semantic territory beyond the allowlist constant? | **No** | The only import from `workspace_zoom_foldback.js` is `RETRYABLE_RUNTIME_FAILURE_CLASSES` (`:7`). No imports from `assurance.ts`, `payload_ledger.ts`, `assurance_register.ts`, `fp_stages.ts`, `graph_span_reentry.ts`. T-106 reads runtime mechanical truth and emits a runtime mechanical decision; it does not pattern-match on F_P assessment fields. |
| Classification logic crosses into semantic content? | **No** | `deriveClassification` (`:302-323`) reads only: process presence, stream byte counts, progress signal ref count. No content inspection, no payload parsing, no domain shape check. |
| `runtimeFailureClass` derived from runtime facts not from F_P content? | ✓ | `:356-364`: derived from `timeoutClass` via the typed mapping; defaults to `"runtime_failure"` (mechanical) when timeout is unknown |

The F_P/F_D boundary holds. T-106 is unambiguously F_D-runtime territory:
"the actor process didn't produce anything assessable" is a mechanical
observation about *evidence existence*, not about *evidence quality*. Quality
is downstream F_P territory and is correctly untouched.

## 7. Composition audit with prior wave

| Carrier | Status | Evidence |
| --- | --- | --- |
| T-082 (output allocation) | Untouched | No imports from `output_allocation.ts`; `npm run test:t082`-equivalent rolled into `test:semantic` (361/361) |
| T-100 (retry allowlist + zoom foldback) | **Composed via single import** | `:7` imports `RETRYABLE_RUNTIME_FAILURE_CLASSES`; used at `:495-497` as the default retry-eligibility set. T-100 source is unchanged — verified via `grep -L` and the `test:t100:unit` 8/8 pass result the operator reports |
| T-103 (graph-span foldback) | Untouched, decision-disjoint | No imports from `graph_span_reentry.ts`; design doc explicitly carves the boundary (`M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md:92-104`); `test:t103` 24/24 pass |
| T-104 (cross-workspace allocation) | Untouched | No imports from `output_allocation.ts` cross-workspace surface |
| Full semantic gate | 361/361 | up from 354/354 at T-103 closure (+7 net new T-106 tests) |

T-106 is composition-clean. The single composition point with T-100 is the
allowlist constant — read as data, not as algebra. The single composition
point with T-103 is the IACS boundary contract — they share the runner-level
dispatch surface (when wired) but never interleave their decision algebras.

## 8. Anti-pattern audit

The historical bug class is private retry loops, local retryability
classification, and multiple-source-of-truth on next action.

| Anti-pattern | Result | Evidence |
| --- | --- | --- |
| Private retry loop inside the module | **Absent** | The module is pure derivation. No `for`/`while` loop wraps any call to `deriveTraversalContinuationActionProjection`. The retry budget is a single read of `countRetryAttemptsForVector` (`:451-455`), not a counter the module manages |
| Local retryability classification bypassing the T-100 allowlist | **Absent** | `runtimeFailureIsRetryable` (`:464-471`) checks membership in the caller-supplied or T-100-defaulted allowlist; no hardcoded `if (failureClass === "x") retry = true` shortcut |
| Hidden chunking / batching state | **Absent** | No accumulator, no batch buffer, no per-vector cache. Each derivation is one call returning one frozen projection |
| Multiple-source-of-truth on next action | **Absent** | `TraversalContinuationActionProjection.action` is the single field; `publicSummaryAction` is set from `action` at construction (`:571`), and `assertTraversalContinuationSummaryAgreement` (`:595-611`) refuses any divergence on action / retryEligible / terminal / reason. Test 7 (`test_t106_*.test.mjs:350-381`) drives the negative case — a summary built with `action: "blocked"` against an `action: "retry_same_edge"` projection throws `summary action drift`. |
| Test 3 anti-pattern coverage (downstream-style local classification cannot be admitted as ABG truth) | **Present in spirit** | Test 3 (`test_t106_*.test.mjs:242-262`) proves an admitted artifact precludes no-progress classification entirely — the carrier *cannot* be constructed when downstream-style "I have a result, retry me" facts exist. This is the structural form of refusing local retryability. Test 7 covers the dual: even when the carrier exists, no downstream may publish a different action. |

The five anti-patterns the test66 / B-013 / B-014 / B-016 / B-017 class
collapses into are all structurally blocked. Discipline holds.

## 9. Test coverage matrix (AC → test)

| AC | Test exercising it | File:line |
| --- | --- | --- |
| AC-1 (requirement names typed traversal non-progress) | spec-level — confirmed in `REQ-R-ABG3-TRANSPORT-020/021/022` | `specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md:55-59` |
| AC-2 (typed carrier with process/attempt/lineage/timeout/stream/artifact-report/evidence) | Test 1 asserts every field shape | `test_t106_*.test.mjs:115-125` |
| AC-3 (one authoritative action) | Test 1 (retry_same_edge), Test 2 (retry_exhausted), Test 4 (yield), Test 5 (inspect_runtime_archive) | `:135, :235, :303, :330` |
| AC-4 (retry eligibility from ABG policy/frontier, not downstream local) | Test 2 (uses `retry_repair_planned` events to drive `observedAttemptCount`); Test 6 (timeout-class mapping is in code, not in caller config) | `:151-240, :335-348` |
| AC-5 (public summary == carrier action) | Test 1 + Test 7 (drift assertion) | `:140-148, :350-381` |
| AC-6 (artifact salvage preserved before retry) | Test 3 | `:242-262` |
| AC-7 (repeated no-progress exhausts via replay-visible truth, no private loop) | Test 2 (constructs two `retry_repair_planned` events, derives exhausted) | `:151-240` |
| AC-8 (odd_sdlc consumes ABG truth) | Out of substrate scope; ticket carve-out | n/a |
| AC-9 (T-082/T-100/T-103/T-104 lanes remain green) | Full semantic gate 361/361 | `npm run test:semantic` |
| AC-10 (test66 patched in place + resumed) | Out of substrate scope; ticket carve-out | n/a |

**Gaps flagged in §3:**

- The `blocked` action path (non-retryable runtime failure class, e.g.
  `runtime_failure` / `payload_contract_failure` / `runtime_unavailable`) has
  **no direct test**. It's reachable via the `timeoutClass===null` →
  `runtimeFailureClass="runtime_failure"` path which lands in `blocked` per
  `:524-531`. AC-3 covers this branch by inference only.
- The `reprice_runtime_policy` path (`runtimePolicyContradiction === true`)
  has **no direct test**. The branch is unreached. AC-3 covers this by
  inference only.

Both gaps are **Medium**, not blocking, but should be added in a small
follow-up to harden the projection's branch coverage from 4/6 to 6/6 action
values.

## 10. Index.ts integration

The diff against the prior wave's exports is purely additive. Verified by
reading `index.ts`:

- New exports at `code/src/abg/m03/contracts/index.ts:240-260` (the +27 lines):
  - value exports: `TRAVERSAL_CONTINUATION_ACTION_VALUES`,
    `TRAVERSAL_NON_PROGRESS_CLASSIFICATION_VALUES`,
    `TRAVERSAL_NON_PROGRESS_TIMEOUT_CLASS_VALUES`,
    `assertTraversalContinuationSummaryAgreement`,
    `deriveTraversalContinuationActionProjection`,
    `deriveTraversalContinuationSummary`,
    `deriveTraversalNonProgressCarrier`,
    `runtimeFailureClassForTraversalTimeout`
  - type exports: `TraversalContinuationAction`,
    `TraversalContinuationActionDerivationInput`,
    `TraversalContinuationActionProjection`,
    `TraversalContinuationRetryBudget`,
    `TraversalContinuationSummary`, `TraversalNonProgressCarrier`,
    `TraversalNonProgressClassification`,
    `TraversalNonProgressDerivationInput`, `TraversalNonProgressTimeoutClass`
- No prior exports removed. T-082 (`output_allocation`), T-100
  (`workspace_zoom_foldback`), T-103 (`graph_span_reentry`), retry_frontier,
  retry_repair, eval_suite, fp_stages, assurance, payload_ledger, plugins
  exports remain present at `:111-156, :235-249, :260-291, :292-331, :332-359,
  :365-398`.
- No re-export changes that affect prior carriers.

The integration is clean. +27 additive lines, zero subtractive.

## 11. REQ-R-ABG3-TRANSPORT content audit

The requirement file is **substantive, not generic placeholder**. T-106
adds three acceptance criteria mapped one-to-one to the implementation:

- **REQ-R-ABG3-TRANSPORT-020** (`REQ-R-ABG3-TRANSPORT.md:55`): "When a
  supervised `F_P` actor invocation terminates, times out, or becomes
  non-progressing without an admitted result artifact, admitted report,
  stream evidence, or declared progress signal, ABG shall expose that fact
  as a typed traversal non-progress carrier. The carrier shall be derivable
  from admitted runtime truth and shall not be invented by a downstream
  product summary." — realized by the carrier kind tag and replay-derived
  construction at `traversal_non_progress.ts:58, :325-443`.
- **REQ-R-ABG3-TRANSPORT-021** (`:57`): enumerates the carrier's required
  fields. Every named field exists on the `TraversalNonProgressCarrier`
  interface (`:57-101`): graph function (`graphFunctionId`), graph call
  (`graphCallId`), frame (`frameId`), vector (`vectorIndex`), actor
  invocation (`actorInvocationId`), attempt (`attemptIndex`), process
  identity (`pid`), timeout class (`timeoutClass`), stream byte counts
  (`stdoutBytes`/`stderrBytes`), last heartbeat (`latestHeartbeatIndex`,
  `latestHeartbeatElapsedMs`), signal sequence (`signalSequence`), exit
  status (`status`/`signal`/`timedOut`), artifact/report/progress
  observation flags (`artifactObserved`/`reportObserved`/
  `progressSignalRefs`), evidence references (`evidenceRefs`).
- **REQ-R-ABG3-TRANSPORT-022** (`:59`): artifact-salvage precedence —
  realized at `traversal_non_progress.ts:346-355` (fails closed before
  classification when an admitted artifact or report exists).

The requirement is real runtime law, not generic verbiage. R-4 closed.

## 12. Closure recommendation

**Recommend T-106 closure on the declared ABG source-scope boundary.**

Per-AC verdict:

| AC | Verdict | Note |
| --- | --- | --- |
| AC-1 | ✓ | Requirement authority real and enforced |
| AC-2 | ✓ | Carrier covers every REQ-R-ABG3-TRANSPORT-021 field; frozen, typed, replay-derived |
| AC-3 | ✓ | One projection, one action enum, summary agreement asserted |
| AC-4 | ✓ | Retry eligibility derived from `retryAttemptRefs` projection + T-100 allowlist; no caller-supplied retryability shortcut |
| AC-5 | ✓ on substrate | Algebra prevents drift; runner/gaps wiring is downstream consumer work per ticket carve-out |
| AC-6 | ✓ | Test 3 + line :346-350 fail-closed |
| AC-7 | ✓ | Test 2 proves replay-visible exhaustion; no private loop |
| AC-8 | n/a | Downstream `odd_sdlc` consumer ticket; correctly carved out |
| AC-9 | ✓ | 361/361 semantic, no regression |
| AC-10 | n/a | Downstream consumer + live-resume work; correctly carved out |

The boundary cut is constitutionally clean: substrate first, downstream
consumer second. Codex declared it explicitly; ticket frontmatter ratifies
it; this review accepts it.

## 13. Non-blocking advisory

Worth a small follow-up if branch coverage matters:

1. **Add direct tests for `blocked` and `reprice_runtime_policy` action
   paths.** Two test cases would lift action-enum branch coverage from 4/6
   to 6/6. Suggested cases:
   (a) construct a carrier where `timeoutClass===null` and the process is
       not running and has no progress signals — derives `runtimeFailureClass
       === "runtime_failure"` which fails the allowlist → assert
       `action==="blocked"`, `reason==="runtime_failure_class_not_retryable"`;
   (b) call `deriveTraversalContinuationActionProjection({...,
       runtimePolicyContradiction: true})` → assert
       `action==="reprice_runtime_policy"`,
       `reason==="runtime_policy_contradiction"`.
2. **Consider ratifying a `BLOCK_REASON_VALUES` / `CONTINUATION_REASON_VALUES`
   closed sum** if/when downstream consumers begin to switch on `reason`.
   Right now the strings are stable but free-form.
3. **Document the synthetic `actor_invocation:<id>` token in `evidenceRefs`**
   as a derivation marker, not an event-stream ref, so consumers don't try
   to dereference it.
4. **Schedule a follow-up ticket for runner/gaps wiring of T-106**: when
   `engine_runner.ts` consumes `TraversalContinuationActionProjection` and
   when `publicStart` / `gaps` rendering surfaces use
   `deriveTraversalContinuationSummary`, AC-5 moves from "satisfied as
   contract law" to "satisfied as runtime trace". This is the
   substrate-internal half of the consumer work codex called out; the
   `odd_sdlc` half is the cross-repo half. Both are correctly out of T-106
   scope.
5. **Track an integration test combining T-106 retry events with T-103
   reentry events** on the same basis once the wiring lands, to prove
   composition under live runner conditions. Currently each algebra is
   exercised independently.

---

The substrate is sound. The discipline that held under T-103 pressure holds
here too: pure projection, fail-closed everywhere, frozen end-to-end, single
authoritative action, summary agreement enforced, F_P/F_D boundary clean,
T-100/T-103 composition by single-import-of-allowlist and IACS-row-disjoint
respectively. T-106 closes ABG substrate scope. Downstream consumer work
remains a separate ticket, exactly as the operator and codex declared.
