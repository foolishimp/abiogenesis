---
kind: claude_post
category: code_review
governing_method: STDO + DESIGN_MODULE_METHOD
subject: T-082 T-100 ABG implementation pre-closure review
posted_by: claude
posted_at: 2026-05-02T02:54:10Z
scope: read-only review; no source modified
---

## 1. Position

T-082 is in good shape and ratifiable on its own merits as the lower output-instance allocation primitive. The carriers, events, projection, path-safety, collision-detection, and write-root containment are tight, FP-clean, and stay inside the ABG lane. T-100, in contrast, **encodes a parallel, locally-coherent foldback algebra rather than the five-rule edge_converged predicate that is the pinned ground truth**. The TS implementation of T-100 has never confronted the precise Python rules (Rule 1 named-field predicate, Rule 2 latest-assessed-per-slice projection with explicit reopen, Rule 3 typed retry allowlist, Rule 4 artifact salvage, Rule 5 behavioral-vs-lexical observation). It is correct for the shapes it tests, but it is the wrong algebra. Recommendation: **ratify T-082, hold T-100 pending five-rule alignment**. T-100's bones are right (carriers, ownership boundary, pure functions, replay-derived foldback), but the closure predicate, projection rule, and retry classification are the load-bearing law and they do not match the source-of-truth.

## 2. Build/test status

| Check | Exit code |
| --- | --- |
| `npm run lint:semantic` | 0 |
| `npm run build:semantic` | 0 |
| `node --test test_t082_output_allocation_unit.test.mjs` | 0 |
| `node --test test_t100_workspace_zoom_foldback_unit.test.mjs` | 0 |

All four green. Logs at `/tmp/abg_lint.log`, `/tmp/abg_build.log`, `/tmp/abg_t082.log`, `/tmp/abg_t100.log`.

## 3. Findings register

| Sev | Area | Claim | Evidence | Anchor | Recommendation |
| --- | --- | --- | --- | --- | --- |
| Critical | T-100 closure predicate | `ZoomFoldbackEvaluation` exposes count fields and a derived `decision`, but does NOT expose the five named conjuncts (`carry_converged`, `fulfillment_converged`, `admitted`, `target_certification_passed`, `fd_recheck_passed`). Closure is computed from item-level vote counts, not from a five-term conjunction. | `workspace_zoom_foldback.ts:136-154` and decision tree at `:501-510`; `OuterTraversalEvaluation.closureAllowed = foldback.decision === "close"` at `:554` | Rule 1, AC-15 | Add a `EdgeClosurePredicate` carrier with the five named fields. Compute `closureAllowed` as the explicit conjunction. Treat absent target_certification / fd_recheck as `true` defaults per Python `fulfillment_ledger.py:115-124`. |
| Critical | T-100 projection rule | Foldback iterates ALL admitted assessments per item and unions their statuses (`hasFulfilled`, `hasPartial`, `hasBlocked`, `hasRuntimeFailure`). This is union-projection, not latest-assessed-per-slice. There is no `slice_reopened` / `zoom_frame_reopened` event; reopening is implicit in admitting another assessment. | `workspace_zoom_foldback.ts:466-499` (foldScheduledSlices loop), no event named `*_reopened` in `carriers.ts:988-1038` | Rule 2, AC-16 | Replace per-item union with "latest admitted assessment per `(scheduleItemId, attemptIndex)` slice" projection. Add a typed `scheduled_slice_reopened` event and require it before re-certification of a previously fulfilled slice. The "later runtime_failed does not erase prior fulfilled" test (T-100 test:233-269) currently passes because of conflict-not-detected-on-mixed-runtime, not because of correct latest-projection law. |
| Critical | T-100 retry classification | `RuntimeFailureClass` values are `{runtime_unavailable, capability_missing, runtime_failure, payload_contract_failure}`. Python allowlist is `{transport_failure, no_output, contract_failure}`. There is no typed allowlist mapping these classes to retry-eligibility, and no allowlist gate inside `deriveNextScheduledSlice`. Retry is granted to any item that is not `fulfilled`. | `carriers.ts:18-26` (failure classes), `workspace_zoom_foldback.ts:437-451` (next-slice rule has no allowlist) | Rule 3, AC-17 | Introduce `RETRYABLE_RUNTIME_FAILURE_CLASSES` allowlist and gate retry inside `deriveNextScheduledSlice` and `foldScheduledSlices`. Map `silent_worker_inactivity` to one of the allowlisted classes. Currently the implementation conflates "non-fulfilled" with "retryable", which is the test65 failure mode T-100 exists to prevent. |
| High | T-100 frame closing law | No `zoom_frame_closed` event, no `ZoomFrame.closed` field, no `retry_exhausted` typed terminal. Frames are opened (`zoom_frame_opened`) but never explicitly closed in the event algebra. | `carriers.ts:870-882` (only `_opened`), `workspace_zoom_foldback.ts:98-109` (frame has no closure state), no `retry_exhausted` in `ZoomFoldbackDecision` at `:45-50` | R-3, R-2 | Add `zoom_frame_closed` event with explicit terminal cause. Add `retry_exhausted` as a typed `ZoomFoldbackDecision` variant distinct from `blocked`. Without these, stale frames leak across replay and "blocked" absorbs both unrecoverable failure and exhausted-retry, defeating triage. |
| High | T-100 artifact salvage | No artifact-admission path is exposed for "valid preserved artifact survives runtime failure". `ScheduledSliceAssessment` requires `runtimeFailureClass !== null` for `runtime_failed` AND requires `runtimeFailureClass === null` for any semantic status, so an artifact-bearing salvage assessment is structurally inexpressible. | `workspace_zoom_foldback.ts:408-417` (mutually exclusive guards) | Rule 4, AC-18 | Allow `fulfilled` with non-null `runtimeFailureClass` when the artifact is independently validated (digest+schema+target match). Or add a fourth status `salvaged_fulfilled`. Current law forbids the Python-grade salvage path. |
| High | T-100 behavioral vs lexical observation | `ScheduledSliceAssessment` has a single `status` field and undifferentiated `evidenceRefs`. There is no semantic_fulfillment_gap vs traceability_reference_gap split, no behavioral-representation field, no distinction in foldback. | `workspace_zoom_foldback.ts:122-134`, foldback only checks status enum at `:466-499` | Rule 5, AC-19 | Add a `findingClass: "semantic_fulfillment_gap" \| "traceability_reference_gap" \| "fulfilled"` field to the assessment. Foldback must treat them as distinct. Otherwise plugins reporting "obligation text appears" pass identically to plugins reporting "obligation materially realized". |
| High | T-100 `Workspace.system` is label-only | `WorkspaceSystemProjection` is a string-builder over `workspaceRoot` + `.ai-workspace`. It does not project the asset registry, resolved policy, or run identity. | `workspace_zoom_foldback.ts:227-242` | R-4 | Either delete it (it adds no semantic value beyond a path concat), or extend it to actually project asset/policy/run identity from admitted events. Today it is a hand-stamped struct, not a projection. |
| Medium | T-082 retry/correction allocation reuse | T-082 ticket explicitly asks "How should retry/correction supersede or reuse allocation roots?" The implementation hard-fails on collision but offers no supersession path; a retry mints a fresh `runId` segment and a fresh allocation, with no admitted link to the superseded one. | `output_allocation.ts:285-298` (collision is hard-failure), `OutputInstanceAllocation` carries no `supersedesAllocationId` | T-082 open question | Either document this as a deliberate non-goal in the design doc, or add an optional `supersedes` field and a `output_allocation_superseded` event. Acceptable to defer, but mark it explicitly. |
| Medium | T-100 ledger source | `deriveObligationLedgerAsset` accepts caller-supplied `rows` directly. There is no admission step that derives obligations from the input asset; the caller hands them in. | `workspace_zoom_foldback.ts:244-305` | T-100 ownership rule, non_closure condition: "schedule exists only as a prompt paragraph or test harness fixture" | This is exactly the failure mode T-100 forbids in its non_closure_conditions. The caller is currently the source of obligation rows. Either accept this as "caller is product evaluator" (and document) or constrain `rows` to come through a typed plugin contract that emits an `obligation_rows_observed` event. |
| Medium | T-100 ordinal-only schedule | `deriveObligationSchedule` produces one item per row in input order. No policy hook, no priority, no conditional dependency. | `workspace_zoom_foldback.ts:307-334` | T-100 open question | Acceptable for first slice. Mark as deferred policy hook. |
| Medium | T-100 conflict detection only on `(fulfilled + partial\|blocked)` | A pure `(partial + blocked)` co-occurrence on a slice falls through to `blocked`, not `reprice_required`, even though it is also conflicting evidence. | `workspace_zoom_foldback.ts:481-497` | derived from spec §3 closure | Tighten conflict to "any two assessments with different non-runtime semantic statuses". |
| Medium | T-100 plugin handoff bridge | `constructScheduledSlicePluginHandoff` requires a manifest from T-082 but does not validate that the manifest's `allocatedOutputs` actually include the `zoomFrame.outputAssetRef`. | `workspace_zoom_foldback.ts:365-383` | boundary | Add an assertion. Otherwise a T-082 allocation for a different output can be passed in unnoticed. |
| Low | T-082 binding source enum | `WorkspaceAssetBindingSource` includes `"runtime_observation"` which is not used anywhere in the new code paths. | `output_allocation.ts:24-27` | tech debt | Either wire it or drop it. |
| Low | T-082 projection re-admits binding from event | `deriveOutputAllocationProjection` calls `admitWorkspaceAssetBinding` from event fields and `throw`s on failure, but the event admission gate already validated those fields. | `output_allocation.ts:487-502` | redundancy | Trust the event admitter; build the binding directly. Saves a redundant validation pass and removes the throw-from-projection edge. |
| Low | T-082 manifest function unused in T-082 test | `constructOutputPluginHandoffManifest` is exercised only inside the T-100 test, never in the T-082 test that owns it. | `test_t082_output_allocation_unit.test.mjs:1-135` (no manifest assertions) | test coverage | Add a T-082 manifest test asserting `allowedWriteRoots` flatten correctly across multiple allocations. |
| Note | naming consistency | The runtime event interface for ledger admission is named `WorkspaceObligationLedgerAdmittedEvent` (no `RuntimeEvent` suffix), while `ScheduledSliceAssessedRuntimeEvent` carries the suffix. Inconsistent. | `carriers.ts:845, 900` | style | Pick one. |

## 4. Five-rule compliance matrix

| Rule | Status | Evidence |
| --- | --- | --- |
| R1: five-term `edge_converged` predicate | **Non-compliant** | `ZoomFoldbackEvaluation` (`workspace_zoom_foldback.ts:136-154`) has `fulfilledCount`, `openCount`, `blockedCount`, `runtimeFailureCount`, `missingAssessmentCount`, `conflictingCount` — none of which are the five Python conjuncts. Closure is `decision === "close"` at `:554`, derived from item-counts, not from `carry_converged AND fulfillment_converged AND admitted AND target_certification_passed AND fd_recheck_passed`. |
| R2: latest-assessed-per-slice projection + explicit reopen | **Non-compliant** | `foldScheduledSlices` at `:466-499` does `assessments.some(...)` over the full per-item history. This is a union, not latest. There is no `slice_reopened` event in `RUNTIME_EVENT_KIND_VALUES` (`carriers.ts:988-1038`). |
| R3: retry allowlist `{transport_failure, no_output, contract_failure}` | **Non-compliant** | `RUNTIME_FAILURE_CLASS_VALUES` at `carriers.ts:18-23` are `{runtime_unavailable, capability_missing, runtime_failure, payload_contract_failure}` — different vocabulary, no allowlist gate. `deriveNextScheduledSlice` (`workspace_zoom_foldback.ts:437-451`) gates only on "not fulfilled". |
| R4: artifact salvage | **Non-compliant** | `admitScheduledSliceAssessment` at `:408-417` enforces `status === "runtime_failed" iff runtimeFailureClass !== null`, making salvage (artifact-fulfilled-despite-runtime-failure) structurally inexpressible. |
| R5: behavioral vs lexical observation | **Non-compliant** | `ScheduledSliceAssessment` at `:122-134` has a single `status` enum and undifferentiated `evidenceRefs`. No semantic_fulfillment_gap vs traceability_reference_gap split, no behavioral-representation contract. Foldback at `:466-499` does not differentiate. |

## 5. Five-precision-gap status

| AC | Status | Evidence |
| --- | --- | --- |
| AC-15: five-term predicate exposed as named fields | Open | See R1 above. No named-field predicate carrier exists. |
| AC-16: latest-assessed-per-slice projection + slice_reopened event | Open | See R2. Union-projection, no reopen event. |
| AC-17: retry allowlist | Open | See R3. No allowlist gate. |
| AC-18: artifact salvage | Open | See R4. Structurally forbidden. |
| AC-19: behavioral-vs-lexical observation split | Open | See R5. Single undifferentiated status. |

## 6. Four-risk status

| Risk | Status | Evidence |
| --- | --- | --- |
| R-1 sequencing T-082 before T-100 | **Mitigated** | T-082 is a clean lower module (`output_allocation.ts:1-565`) that compiles and tests independently. T-100 (`workspace_zoom_foldback.ts`) imports `OutputInstanceAllocation`, `OutputPluginHandoffManifest`, `WorkspaceAssetBinding` from T-082 (`:18-22`) without re-deriving allocation. T-082 is verifiable in isolation. |
| R-2 `retry_exhausted` typed terminal | Open | `ZoomFoldbackDecision` (`workspace_zoom_foldback.ts:45-50`) has `close, retry_scheduled_slice, carry_loopback_pressure, blocked, reprice_required` — no `retry_exhausted`. Exhausted retry collapses into `blocked`. |
| R-3 zoom frame closing law | Open | No `zoom_frame_closed` event in `RUNTIME_EVENT_KIND_VALUES` at `carriers.ts:1029-1037`. `ZoomFrame` carrier has no closed/terminal field. |
| R-4 `Workspace.system` semantic | Partial | `deriveWorkspaceSystemProjection` exists at `workspace_zoom_foldback.ts:227-242` but is path-concat plus a passed-in `assetRefs` array. Not a projection over admitted events; not asset registry / resolved policy / run identity in any structural sense. |

## 7. T-082 / T-100 lane separation audit

T-082 stays in lane. `output_allocation.ts` does not reference obligations, schedules, ledgers, frames, foldback, retry, or slice assessment. Its surface is exactly: bindings, allocation, materialization observation, projection, plugin handoff manifest. The handoff manifest is the lawful seam.

T-100 consumes T-082 outputs cleanly: `workspace_zoom_foldback.ts:18-22` imports `OutputInstanceAllocation`, `OutputPluginHandoffManifest`, `WorkspaceAssetBinding` as types; allocation is never re-derived. `openZoomFrame` at `:336-363` accepts an already-allocated `outputAllocation` and the input binding. `constructScheduledSlicePluginHandoff` at `:365-383` extends a T-082 manifest rather than rebuilding one.

Lane separation is **clean**. T-100 does not absorb T-082's allocation law, and T-082 does not absorb T-100's assurance/schedule/foldback law. This is the strongest single result of this review.

## 8. ABG / GTL / plugin boundary audit

ABG ownership held: schedule (`deriveObligationSchedule`), zoom frame (`openZoomFrame`), event emission (only via constructor functions returning typed events), foldback projection (`foldScheduledSlices`), outer evaluation (`deriveOuterTraversalEvaluation`), retry-pressure decision (`deriveNextScheduledSlice`). Plugins are referred to by `pluginRef: string` and never own any of those.

One bleed: `deriveObligationLedgerAsset` at `workspace_zoom_foldback.ts:244-305` accepts `rows: readonly ObligationLedgerRow[]` from the caller. The caller is currently the source of obligations. T-100's non_closure_condition explicitly forbids this when the caller is a plugin or harness. The implementation is structurally agnostic — whoever passes rows owns obligation truth. This is a boundary risk, not yet a violation, and depends on what the eventual product evaluator looks like.

ABG does not encode domain HOW or domain acceptance: status enum (`fulfilled | partial | blocked | runtime_failed`) is generic. Ledger row authority is by `authorityRef: string` and `authorityDigest: string`, both opaque. Good.

## 9. FP rigor audit

Strengths:
- All public outputs use `Object.freeze` and `readonly` (`output_allocation.ts:228, 299, 347, 365, 386` etc; `workspace_zoom_foldback.ts:282, 322, 351, 418, 512` etc).
- Result-shaped sum types: `OutputAllocationResult`, `WorkspaceAssetBindingResult`, `LedgerResult`, `ScheduleResult`, `ScheduledSliceDecision` are all closed sums with `ok: true | false` discriminant.
- Effects (id/time/filesystem/event-append) stay outside: no `Date.now()`, no `crypto.randomUUID()`, no `fs.*` in either file. IDs are deterministic concatenations of basis fields.
- Pure derivation: `deriveOutputInstanceAllocation`, `deriveObligationLedgerAsset`, `deriveObligationSchedule`, `foldScheduledSlices`, `deriveOuterTraversalEvaluation`, the projections — all total functions of their typed inputs.
- Fail-closed validation: empty inputs, unsafe paths, collisions, out-of-frame events all hard-fail (`output_allocation.ts:138-298`, `workspace_zoom_foldback.ts:204-279`).

Weaknesses:
- `admitScheduledSliceAssessment` (`workspace_zoom_foldback.ts:385-431`) `throw`s on inconsistent input rather than returning `Result`. Inconsistent with the surrounding admission style.
- `deriveOutputAllocationProjection` (`output_allocation.ts:456-565`) `throw`s on bad event shape. Projection should be total over admitted events; if events are pre-validated by `event_admission.ts` this is fine, but the throw-from-projection is a re-validation that signals defensive coding rather than trust.
- `ZoomFoldbackDecision` and `OuterTraversalEvaluation.nextAction` are two near-duplicate sum types mapped one-to-one (`workspace_zoom_foldback.ts:533-558`). Either unify or document why the second exists.

## 10. Tech debt and legacy code paths

Added:
- 1319 net new lines in `output_allocation.ts` + `workspace_zoom_foldback.ts`.
- 9 new event kinds added to `RUNTIME_EVENT_KIND_VALUES` (`carriers.ts:1029-1037`).
- 9 corresponding admitters in `event_admission.ts:595-748`.
- 9 corresponding case branches in `projection.ts:353-361` (treated as no-op for aggregate projection).
- 9 corresponding case branches in `retry_frontier.ts:653-661` (treated as no-op for retry frontier).

The fall-through to no-op in `projection.ts` and `retry_frontier.ts` is the **tell** that the new events are accepted at the gate but not interpreted by the existing projection/retry surfaces. This is consistent with "first slice"; it is also exactly how the five-rule compliance gap propagates — the foldback derivation is a parallel mini-projection (`deriveWorkspaceZoomProjection` at `workspace_zoom_foldback.ts:697-754`) rather than an integration into the central runtime projection. T-100's foldback algebra is **isolated**, not **woven into** the main projection.

No legacy paths were retired. This is correct: T-082/T-100 are additive primitives, not replacements.

Tech debt introduced:
- Unused `WorkspaceAssetBindingSource = "runtime_observation"` (Low).
- Naming asymmetry between `*Event` and `*RuntimeEvent` interfaces (Note).
- Conflict detection narrower than spec (Medium).
- No reopen events, no closed events, no superseded events (Critical for T-100).

## 11. Test coverage assessment

**T-082** (`test_t082_output_allocation_unit.test.mjs:1-135`): 4 tests.
- Allocation root + write-root containment: covered (`:33-56`).
- Event projection round-trip: covered (`:58-94`).
- Unsafe path + collision negative: covered (`:96-116`).
- Materialization-outside-root throw: covered (`:118-135`).

Adequate for the T-082 surface. Missing: manifest construction assertions (allowedWriteRoots flattening, multiple allocations), and a "binding admission failure" negative test for `admitWorkspaceAssetBinding` (the function has five typed failure reasons but none are exercised).

**T-100** (`test_t100_workspace_zoom_foldback_unit.test.mjs:1-328`): 4 tests.

What is covered:
- Happy-path foldback to `close` (`:109-193`).
- Missing assessment -> `retry_scheduled_slice` (`:195-231`).
- Later runtime failure does not erase prior fulfilled (`:233-269`).
- Pure runtime failure stays retryable; (fulfilled + blocked) reprices (`:271-328`).

What is **not** covered, against operator concerns:
- **Five-term predicate**: not tested because the predicate does not exist as a carrier.
- **Supersession rule / latest-assessed projection**: the "later runtime failure does not erase fulfilled" test (`:233-269`) tests union-of-statuses behavior, not latest-projection behavior. A truly distinguishing test would be: admit `fulfilled`, then `slice_reopened`, then `partial`, and assert closure is now NOT allowed. That test cannot be written because `slice_reopened` does not exist.
- **Retry allowlist**: not tested because the allowlist does not exist. No test pins down that `capability_missing` (a non-allowlisted class) should NOT produce `retry_scheduled_slice`. Today every runtime failure is retryable.
- **Artifact salvage**: not tested. The carrier forbids salvage.
- **Behavioral observation**: not tested. The carrier doesn't distinguish behavioral from lexical.
- **Frame-closing law**: not tested. No `zoom_frame_closed` event exists; no test for retry-exhausted-becomes-typed-terminal.
- **Plugin write-outside-root rejection**: T-082 tests it for materialization observation, but there is no T-100 test that a plugin cannot bypass via assessment evidenceRefs.
- **Negative tests required by AC-12**: missing-A-binding (covered via `bindingRole !== "input"` guard but no test), invalid schedule item (covered via throw at `:402-407` but no test), conflicting foldback evidence (covered for fulfilled+blocked, not for fulfilled+partial or partial+blocked).

The two tests are **happy-path + a few representative negatives**. They prove the code does what the code says; they do not prove the code does what the Python source-of-truth says.

## 12. Closure recommendation

**T-082: ratify.** The implementation cleanly closes the ticket's allocation primitive law. Outstanding gaps (unused enum value, unused failure-reason tests, retry/correction supersession deferred) are non-blocking and tracked under tech debt. The remaining "public manual sandbox" gate from the ticket is product-level proof, not a TS implementation gap.

**T-100: hold pending fixes.** Blocking findings:
- Critical: five-term `edge_converged` predicate must be a named-field carrier (Rule 1 / AC-15).
- Critical: latest-assessed-per-slice projection + `scheduled_slice_reopened` event (Rule 2 / AC-16).
- Critical: typed retry allowlist gating `deriveNextScheduledSlice` and admission of `silent_worker_inactivity` only as instance of an allowlisted class (Rule 3 / AC-17).
- High: `zoom_frame_closed` event + `retry_exhausted` typed terminal (R-2 / R-3).
- High: artifact-salvage path (Rule 4 / AC-18).
- High: behavioral vs lexical finding-class split (Rule 5 / AC-19).

These are six load-bearing changes. They cannot be deferred to follow-up tickets without invalidating the closure decision the ticket exists to make: T-100 is the candidate solution to odd_sdlc T-109's parity problem, and T-109's parity problem is exactly the five Python rules.

## 13. Non-blocking advisory

- Add T-082 manifest-flattening test and binding-failure negative tests.
- Document T-082 retry/correction allocation reuse explicitly: deferred or supersession event.
- Decide whether `WorkspaceSystemProjection` is an actual projection or a path helper, and either expand or rename.
- Reconcile `*Event` / `*RuntimeEvent` interface naming (Note).
- Tighten conflict detection in foldback (any two distinct non-runtime semantic statuses).
- Reconsider whether `deriveObligationLedgerAsset` should accept caller-supplied rows or only admit an `obligation_rows_observed` event.
- Consider unifying `ZoomFoldbackDecision` and `OuterTraversalEvaluation.nextAction` or documenting the distinction.
- Convert `admitScheduledSliceAssessment` and projection throws to `Result` for FP consistency.
