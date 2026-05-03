---
kind: claude_post
category: code_review
governing_method: STDO + DESIGN_MODULE_METHOD
subject: T-106 follow-up wave incremental review — runner integration, branch coverage, requirement extension
posted_by: claude
posted_at: 2026-05-03T03:22:31Z
scope: incremental delta review against the 2026-05-03T02:40:38Z baseline; read-only; focuses on the runner integration, the +7 new tests, the three modified requirement files, and the index/README/package.json deltas
references:
  - .ai-workspace/comments/claude/20260503T024038Z_REVIEW_T-106-implementation-stdo.md
  - .ai-workspace/tickets/active/T-106-define-abg-typed-traversal-non-progress-continuation-and-summary-agreement.md
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/engine_runner.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/traversal_non_progress.ts
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t106_traversal_non_progress_continuation.test.mjs
  - specification/requirements/abg/REQ-R-ABG3-PROJECTION.md
  - specification/requirements/abg/REQ-R-ABG3-RETRY.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
---

## 1. Position

**The follow-up wave is closure-clean and the runner integration holds the
constitutional line.** Every prior-review finding is closed in code: the two
Medium branch-coverage gaps are now exercised by direct tests
(`test_t106_*.test.mjs:628-664`); the runner consumes the T-106 carrier and
projection at exactly one site — the FP-dispatch `outcome.status === "blocked"`
arm — and routes through `deriveRetryRepairDecision` for the
`retry_same_edge` branch and through `terminalTransition(...,"yielded"|"gap_stop"...)`
for the others. Lint, T-106 lane (14/14, +7 net), full semantic gate
(368/368, +7 net), and all spot-checked legacy lanes are green. No
regression.

The single load-bearing observation is: **the runner does not invent the
continuation; it derives it.** The new helper
`deriveBlockedFpNoArtifactContinuation`
(`engine_runner.ts:310-379`) is a pure adapter — it constructs the carrier
via `deriveTraversalNonProgressCarrier`, hands it to
`deriveTraversalContinuationActionProjection`, requires
`assertTraversalContinuationSummaryAgreement` to pass, and then *only*
chooses between two pre-existing event-emission paths (T-100/T-103-shaped
retry-repair events vs. terminal-transition gap_stop/yielded). The runner
performs no semantic content evaluation, no local retryability
classification, and no parallel allowlist read. T-100's allowlist is reached
through T-106's projection only, never directly. T-103's reentry algebra is
untouched: the FP-dispatch blocked arm has always been a different code path
from `deriveAdvancementTransitionWithReentry`, and the new code is composed
inside that arm without bleeding outward. The constitutional discipline that
held under T-103 pressure also holds under T-106 wiring.

## 2. Build / lint / test status

Independently re-run from `build_tenants/abiogenesis/typescript/`:

| Gate | Exit | Evidence |
| --- | --- | --- |
| `npm run lint:semantic` | `0` | clean |
| `npm run test:t106` | `0` | **14/14** (was 7/7 at prior review; +7 net) |
| `npm run test:t087` | `0` | no regression |
| `npm run test:t098` | `0` | no regression |
| `npm run test:t100:unit` | `0` | no regression — T-100 allowlist algebra unchanged |
| `npm run test:t103` | `0` | **24/24** — reentry frontier algebra unchanged |
| `npm run test:semantic` | `0` | **368/368** (was 361/361 at prior closure; +7 = exactly the new T-106 cases) |

No regression detected.

## 3. Prior-finding closure

| Prior finding | Status | Evidence |
| --- | --- | --- |
| Medium A1: `blocked` action has no direct test | **Closed** | `test_t106_*.test.mjs:643-649, :660-661`: `retryableRuntimeFailureClasses: []` forces an empty allowlist, asserts `action==="blocked"`, `reason==="runtime_failure_class_not_retryable"`. |
| Medium A2: `reprice_runtime_policy` action has no direct test | **Closed** | `test_t106_*.test.mjs:636-642, :658-659`: passes `runtimePolicyContradiction: true`, asserts `action==="reprice_runtime_policy"`, `retryEligible===false`. |
| Low: `evidenceRefs` synthetic `actor_invocation:<id>` documentation | **Open (cosmetic)** | No diff in design doc to document the synthetic ref; non-blocking. |
| Low: `runtime_failure_class_not_retryable` reason vs design's `blocked` decision (cosmetic naming) | **Open (cosmetic)** | Reason strings still free-form; no `BLOCK_REASON_VALUES` closed sum landed. Non-blocking. |
| Note: T-106 not consumed by `engine_runner.ts` / `public_start.ts` / gaps surface | **Closed (substrate-internal half) for `engine_runner.ts`** | `engine_runner.ts:60-70` imports the four T-106 entry points; the FP-dispatch blocked arm at `:729-753` (sync) and `:1142-1166` (async) consumes them through `deriveBlockedFpNoArtifactContinuation` (`:310-379`); two new runner-path tests assert the live trace (`test_t106_*.test.mjs:666-718, :720-745`). Public-start and gaps wiring are still pending — see new finding N-1. |

The two Medium gaps are now structurally closed, and `test_t106_*.test.mjs:628-664`
is one composite test that covers all three previously-untested action
branches in one shot (`reprice_runtime_policy`, `blocked`, `stationary
retry_exhausted`). Action-enum branch coverage is now 6/6.

## 4. Engine_runner.ts integration audit (B1–B8)

### B1. Diff shape

`+177 / −16` (`git diff --stat`). Three additions:

- New imports (`:60-76`): retry-repair and T-106 carriers, plus
  `DEFAULT_ATTACHED_FP_MAX_RETRY_ATTEMPTS` from `attached_fp_worker.js`.
- Three new helpers (`:267-379`):
  `candidateNoProgressRetryManifestId`, `noProgressContinuationRepair`,
  `deriveBlockedFpNoArtifactContinuation`.
- Two replacement sites: the FP-dispatch blocked arm in `runEngineIterate`
  (`:729-753`) and the parallel arm in `runEngineIterateAsync` (`:1142-1166`).

### B2. Carrier/projection consumption

Yes. `deriveTraversalNonProgressCarrier`, `deriveTraversalContinuationActionProjection`,
`deriveTraversalContinuationSummary`, and
`assertTraversalContinuationSummaryAgreement` are all called inside
`deriveBlockedFpNoArtifactContinuation` (`:318-334`). Carrier construction
uses only replay-derived inputs (basis, projection, vectorIndex,
actorInvocationId) — no caller-supplied content.

### B3. New event kinds

No new event kinds emitted from the runner. The retry path emits
`runtimeEventsForRetryRepairDecision(retryDecision)` which produces the
existing `retry_repair_planned` family (proven by
`test_t106_*.test.mjs:709-711, :712-717`). The terminal path emits the
existing `constructTerminalReachedEvent`. T-106 is wired through the
existing event vocabulary; no parallel event surface introduced.

### B4. Action-enum routing

The runner only branches on `summary.action`:

- `retry_same_edge` → routes through `deriveRetryRepairDecision`
  (`:336-365`); guards `retryDecision.kind !== "retry_planned"` with a
  `TypeError` (`:356-360`) so a downstream drift between T-106 retry
  eligibility and T-100/retry-repair retry permission is fail-closed.
- `yield_same_edge_continuation` → terminal `"yielded"`.
- everything else (`retry_exhausted` / `inspect_runtime_archive` /
  `reprice_runtime_policy` / `blocked`) → terminal `"gap_stop"`.

The terminal `reason` string preserves both the action and the projection
reason (`traversal_continuation:${summary.action}:${summary.reason}`) which
is what `test_t106_*.test.mjs:743-744` asserts.

### B5. Composition with T-103 reentry-aware advancement

**Preserved.** `deriveAdvancementTransitionWithReentry` is called at
`engine_runner.ts:178` (within `loadReentryTransition`); the reentry
decision is consumed at `:497-541` and yields `runtimeEventsForIterationDecision(decision)`.
The T-106 hook is strictly inside `case "fp_dispatch"` of the iteration
switch (`:617`+), and only on the inner `outcome.status === "blocked"` arm
(`:729`). T-106 cannot fire when the iteration decision routed to
`fd_advance`, `fh_escalation`, or `terminal`. The reentry frontier still
owns the cross-vector decision; T-106 only owns the same-vector
no-artifact decision after a blocked FP dispatch.

### B6. F_P / F_D boundary

**Preserved.** The runner imports T-106 carriers but never reads
content-shaped fields (no `artifactObserved` proxy, no result-content
inspection, no payload parsing). The carrier is constructed from
mechanical truth (`actorProcessRefs`, `retryAttemptRefs`, exit status,
byte counts) and consumed by name only. The runner reads
`outcome.resultRef ?? input.actorInvocation.resultRef` only as a stable
identifier for `priorManifestId` (`:341`) — not as semantic content. The
synthesized `candidateManifestId` (`:267-281`) is derived from
`{basisId, vectorIndex, attemptIndex}` and is purely structural.

### B7. Pre-T-106 path preservation

The pre-T-106 path was a single `terminalTransition(... "gap_stop"
... reason ?? "fp dispatch plugin blocked traversal")` (visible in the
prior version's diff hunk header at sync `:729`, async `:1142`). The
new code **replaces** this in place — there is no unreachable old
branch left behind. This is in-place replacement, not additive
composition. The new path subsumes the old: if T-106 derives action
`"blocked"` or any non-`retry_same_edge`/`yield` action, the runner
still routes to `terminalTransition(... "gap_stop" ...)` with a
strictly more informative reason. The behavior change is: cases that
were previously always `gap_stop` may now route to retry or yield when
T-106 says so.

This is **not** the T-109 anti-pattern (parallel paths). It is a
disciplined replacement where the new derivation strictly refines the
prior decision space. The risk surface is the inverse: any case where
T-106 says "retry" but the system is *not* actually safe to retry would
be a new defect. The fail-closed gate at `:356-360`
(`if (retryDecision.kind !== "retry_planned") throw`) is the structural
guard against that — T-106 retry intent is composed with T-100
retry-repair safety, and any disagreement throws rather than silently
proceeds.

### B8. Lines added vs deleted

`+177 / −16`. Of the 16 deleted, all 16 are the two old `terminal`/
`emitRunnerEvents`/`return constructResult` blocks (8 lines × 2 sites)
that are now replaced by the new continuation-router blocks. Of the
177 added, ~110 are the three helper functions (one-shot, reusable in
both sync and async paths) and the rest are the two replacement
blocks. The integration is dense but additive in spirit: prior
sibling FP-dispatch outcomes (`completed`, `dispatched`) and prior
non-FP arms (`fd_advance`, `fh_escalation`, `terminal`) are untouched.

## 5. Spec file modification audit (C1–C5)

### C1. REQ-R-ABG3-PROJECTION.md

One new clause: **REQ-R-ABG3-PROJECTION-011**
(`REQ-R-ABG3-PROJECTION.md:37`):

> "Public runtime summaries, CLI surfaces, and downstream consumer projections
> that describe traversal non-progress shall render the same ABG-derived
> continuation action."

This is the projection-side counterpart of REQ-R-ABG3-TRANSPORT-020:
transport guarantees the carrier is replay-derived; projection guarantees
the action is single-source. Anchored by the implementation at
`traversal_non_progress.ts:678-694` (`assertTraversalContinuationSummaryAgreement`)
and exercised by `test_t106_*.test.mjs:436-467` (drift rejection). The
clause is present-tense, no migration narration, no comparative framing.
Consistent with SPEC_METHOD discipline.

### C2. REQ-R-ABG3-RETRY.md

Two new clauses:

- **REQ-R-ABG3-RETRY-007** (`:29`): retry eligibility is ABG-projected from
  replay-derived runtime truth + retry policy + T-100 allowlist; downstream
  product cannot compute retry eligibility from a product-local dossier or
  private loop state.
- **REQ-R-ABG3-RETRY-008** (`:31`): timeout-class mapping rule —
  `inactivity_timeout → no_output`, `hard_timeout / transport_exit →
  transport_failure`, payload/report contract defects → `contract_failure`
  only after deterministic admission rejects them.

Both are anchored:

- 007 → `traversal_non_progress.ts:464-471` (`runtimeFailureIsRetryable`),
  imports `RETRYABLE_RUNTIME_FAILURE_CLASSES` from T-100 (`:7`).
- 008 → `traversal_non_progress.ts:218-234`
  (`timeoutClassToRuntimeFailureClass`), with the `const exhaustive: never =
  timeoutClass` exhaustiveness guard at `:228`. Test
  `test_t106_*.test.mjs:545-626` exercises all three timeout-class branches
  with real process-exited events.

Both clauses are present-tense; no historical framing.

### C3. REQ-R-ABG3-TRANSPORT.md

No new clauses. The diff shows the file is **unchanged in semantic
content** — the prior review at `2026-05-03T02:40:38Z` already verified
REQ-020/021/022 were present. The `git diff` operator-reported
modification is `+6` lines, but those are the three existing T-106
clauses; the file's body is at 51+ lines. **Re-checked**: the current
diff against HEAD shows three clauses (-020/-021/-022) added to the
file — meaning those clauses were NOT yet in the committed version of
the file at HEAD; the prior review was reading the working tree, not
HEAD. They are the same clauses the prior review verified
(`:53-59`). No drift.

### C4. SPEC_METHOD compliance

All three modified files use present-tense active voice ("ABG shall
expose", "ABG shall not classify", "Retry eligibility shall be
projected", "Public runtime summaries... shall render"). No phrases
like "now supports", "previously was", "extended for rc.6". Live
constitutional surface, not migration narration. ✓

### C5. Implementation anchoring

All five new clauses across the three files map one-to-one to live
typed implementation:

| Clause | Anchor |
| --- | --- |
| TRANSPORT-020 | `traversal_non_progress.ts:58` (carrier kind tag) + `:325-443` |
| TRANSPORT-021 | `traversal_non_progress.ts:57-101` (interface fields) |
| TRANSPORT-022 | `traversal_non_progress.ts:346-355` (fail-closed) |
| RETRY-007 | `traversal_non_progress.ts:464-471, :7` |
| RETRY-008 | `traversal_non_progress.ts:218-234, :228` (exhaustiveness) |
| PROJECTION-011 | `traversal_non_progress.ts:678-694` |

Specs are anchored. ✓

## 6. Other delta audits

### D. index.ts re-modification

The index diff is `+27` lines and split into two stanzas:

- New event-factory exports (`:215-220`, +6 lines):
  `constructActorProcessExitedEvent`, `constructActorProcessHeartbeatEvent`,
  `constructActorProcessSignalSentEvent`, `constructActorProcessStartedEvent`,
  `constructActorProcessStreamObservedEvent`, `constructActorProcessTimeoutEvent`.
  These are the **process-evidence event factories** the T-106 tests need to
  build replay events. The factories themselves already existed in
  `event_factories.ts:216-358`; this diff merely surfaces them through the
  contracts barrel. Non-substrate-changing.
- T-106 surface exports (`:240-260`, +21 lines): same as previously verified
  — eight value exports (8) + nine type exports (9) from
  `traversal_non_progress.js`.

No removals. No re-export rewiring. Additive.

### E. design/README.md

Two-line additive insertion of `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md`
and `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md` at
`:109-110`. The two design docs are now in the design index. ✓

### F. package.json

Single new line: `test:t106` script (`:160`) wired to `npm run
build:semantic && node --test test_env/tests/test_t106_traversal_non_progress_continuation.test.mjs`.
No dependency additions. No version change. No other modifications.

## 7. Constitutional re-verification (G1–G5)

| Check | Result | Note |
| --- | --- | --- |
| G1. F_P/F_D boundary preserved | ✓ | Runner reads only mechanical fields from carrier; no semantic content judgment |
| G2. Replay-derived projection preserved | ✓ | Both helpers (`candidateNoProgressRetryManifestId`, `noProgressContinuationRepair`) read only `projection.retryAttemptRefs`; no mutable state added |
| G3. Closed sum types still closed | ✓ | `BlockedFpNoArtifactContinuation` is a discriminated union with `kind: "retry" \| "terminal"`; `summary.action` switch handles 6 enum values via discriminated branches; no `any` introduced |
| G4. T-100 / T-103 / T-104 composition still clean | ✓ | T-100 reached via T-106 only; T-103 reentry path untouched; T-104 cross-workspace not in scope; all three lanes green |
| G5. Pure-projection module still pure | ✓ | Module unchanged in I/O footprint (no fs / Date / now); `engine_runner.ts` does not pull I/O into the new helpers — they are pure projection adapters over the existing aggregate projection |

## 8. New findings

| Severity | Area | Claim | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| Note | Public-start / gaps surface | T-106 is wired into `engine_runner.ts` but not yet into `public_start.ts` or any gaps surface | `grep -rn "TraversalContinuation\|TraversalNonProgress" code/src/abg/m03/` shows references only in `contracts/` and `runner/engine_runner.ts`; no hits in `code/src/app/` or `public_start.ts` | This is the second half of the Note from the prior review — the substrate-internal-runner half has now closed; the consumer-surface half is still open. Track as follow-up. AC-5 is now satisfied as runtime trace at the runner boundary (proven by `test_t106_*.test.mjs:666-718`); the `publicStart` boundary is still contract-law only. |
| Note | Three new helpers in `engine_runner.ts` | `candidateNoProgressRetryManifestId`, `noProgressContinuationRepair`, `deriveBlockedFpNoArtifactContinuation` are runner-local | `engine_runner.ts:267-379` | The first two encode synthesizing manifest/continuation IDs from `{basisId, vectorIndex, attemptIndex}`. They are deterministic and structurally collision-free, but they live in the runner rather than the carrier module. If a future surface (gaps, public_start) wants the same IDs, it will have to re-derive them or duplicate. Consider promoting `candidateNoProgressRetryManifestId` and `noProgressContinuationRepair` into `traversal_non_progress.ts` if a second consumer needs them. Non-blocking. |
| Note | Synchronous and asynchronous runner paths each call `deriveBlockedFpNoArtifactContinuation` separately | `engine_runner.ts:729-753` (sync) and `:1142-1166` (async) are textually parallel | The two are intended to mirror each other — both runner entry points exist for transport-style differences. The duplication is two callers of one helper, which is fine; the helper is not duplicated. Audit confirms the bodies of the two arms are now identical modulo `runEngineIterate` vs `runEngineIterateAsync` framing. ✓ |
| Note | `runtime_failure_class_not_retryable` reason still free-form | `traversal_non_progress.ts:531` | Carrying this forward from the prior review; non-blocking. The new test (`test_t106_*.test.mjs:660-661`) asserts the exact string, which means a future rename would break the test contract — the reason is now stable enough that ratifying a `BLOCK_REASON_VALUES` const would be cheap. |

No new Medium / High issues introduced by the follow-up wave.

## 9. Closure recommendation

**T-106 closes on the declared ABG source-scope boundary AND on the
substrate-internal runner boundary.**

The follow-up wave delivered exactly what the prior review's
non-blocking advisories asked for:

- two new direct tests for the previously-untested `blocked` and
  `reprice_runtime_policy` action branches (composite at
  `test_t106_*.test.mjs:628-664`);
- substrate-internal runner integration at the FP-dispatch blocked arm
  (`engine_runner.ts:729-753, :1142-1166`) with two new runner-path
  tests proving the live trace (`test_t106_*.test.mjs:666-745`);
- three new spec clauses anchoring the projection (PROJECTION-011) and
  retry (RETRY-007, RETRY-008) law to the implementation;
- design index updated; index.ts surfaces the process-evidence event
  factories the runner-path tests rely on.

Per-AC delta against prior review:

| AC | Prior verdict | Now |
| --- | --- | --- |
| AC-1 | ✓ | ✓ |
| AC-2 | ✓ | ✓ |
| AC-3 | ✓ (4/6 branches by inference) | ✓ (6/6 branches by direct test) |
| AC-4 | ✓ | ✓ + REQ-R-ABG3-RETRY-007 anchored |
| AC-5 | ✓ on substrate (contract law only) | ✓ as runtime trace at runner boundary; consumer surfaces still pending |
| AC-6 | ✓ | ✓ |
| AC-7 | ✓ | ✓ |
| AC-8 | n/a (downstream) | n/a |
| AC-9 | ✓ 361/361 | ✓ 368/368 |
| AC-10 | n/a (downstream) | n/a |

Outstanding gates after this wave:

1. **Public-start / gaps consumer wiring** (Note finding above). When
   `publicStart(...)` and any gaps rendering surfaces consume
   `deriveTraversalContinuationSummary`, AC-5 closes at every public
   surface, not just the runner. This is the substrate-internal half
   the prior codex note named; the cross-repo `odd_sdlc` half is still
   separately carved out.
2. **`BLOCK_REASON_VALUES` / `CONTINUATION_REASON_VALUES` ratification**
   (cosmetic, but increasingly worth doing as test contracts begin to
   pin specific reason strings).
3. **Integration test combining T-106 retries with T-103 reentry events
   on the same basis** (composition under live runner conditions, prior
   review's advisory #5).

None of these block T-106 substrate closure. The constitutional line
held under the runner integration; the discipline that survived the
T-103 reentry frontier survives the T-106 same-vector continuation
hook. Recommend close on T-106.

---

The follow-up wave is the cleanest possible answer to the prior review:
two Medium gaps closed by direct tests, the substrate-internal half of
the Note closed by a fail-closed runner adapter, and three spec clauses
anchoring the closure law. No new defects introduced. Discipline holds.
