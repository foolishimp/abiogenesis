# T-149 ABG iteration-outcome-algebra — deep STDO code review (evidence log)

- author: claude
- date: 2026-06-05
- scope: T-149 implementation as shipped in abiogenesis `3.9.0-rc.10`/`rc.11` — `iteration_state_action.ts` fold + the 14 migrated transition deciders + the runner + the structural guard + the t149 proof suite.
- method: STDO. Adversarial multi-agent review — 32 subagents (14 surfaces × classify+refute, plus fold/runner/tests/STDO dimensions, plus synthesis), ~2.7M tokens, 642 tool calls. Per-surface migration claims were checked by **reachability proof against the real code**, not presence-grep.
- governance: STDO. Findings anchor to DESIGN_MODULE §10 (no semantic center) / §11C (migration-and-remove), the ODD F_P/F_D boundary, and T-149's own `closure_law` + `non_closure_conditions`.
- status: **commentary / review evidence surface.** This is the proof surface for the T-149 review: T-149 is **not closure-ready** per the findings below. Raw per-agent forensics archived (see Provenance).

This review both found a blocker the lead's inline pass missed and **refuted two of the lead's own inline findings** — recorded honestly below.

---

## Verdict: NOT closure-ready — the one-truth-surface does not fully hold

`oneTruthSurfaceHolds = false`, `migrationComplete = false`. **13 of 14 migrated surfaces are verified clean** (demoted fold-callers / row-producers, with reachability proofs), but **one residual rival survives, one latent fold hole exists, and neither is covered by the structural guard or the proof suite** — so the CI gate is green over exactly the two unverified behaviors.

---

## 🔴 BLOCKING — `attached_fp_worker` retry-budget→terminal is a residual rival

The attached-F_P blocked-artifact path selects a terminal **without the fold**:

- `engine_runner.ts:3407` → `deriveAttachedFpResultDecision` (`attached_fp_worker.ts:505-598`) maps a `RetryRepairDecision` straight to `terminalKind`: `retry_stopped → "gap_stop"` (`:574`), `retry_escalated → "yielded"` (`:588`), driven purely by retry-budget exhaustion (`retry_repair.ts:128`: `observedAttemptCount >= maxAttempts || stationary`).
- `engine_runner.ts:4215-4220` emits `terminalTransition(...) + constructTerminalReachedEvent(...)` with **no `deriveIterationOutcome*` call**. Same defect at `:4193-4209` and `:4258-4271` (`boundedAttemptExitTransition` fired from `envelope.mustExitAfterBoundedAttempt`, not the fold).
- **Reachable & live** (not dead code): `attached_fp_worker.ts:468` passes `maxAttempts:0` when `retryable===false`, deterministically forcing `retry_stopped`/`retry_escalated`. Exercised under t107.
- **The convicting asymmetry:** the *sibling* no-artifact path (`deriveBlockedFpNoArtifactContinuation`, `engine_runner.ts:4239`) routes the **identical** retry-vs-terminal decision **through the fold** (`deriveRuntimeContinuationTransitionProjection → deriveIterationOutcomeProjection`) and **throws if `retry_repair` disagrees** with the fold (`engine_runner.ts:776-778`, `"drifted from retry repair decision"`). Two adjacent terminalization paths — one fold-routed, one not — that can drift: the budget selector can `gap_stop` a slice the fold would route to `redispatch`/`block` with a different `reEntryPoint`.
- The fold already encodes this exact mapping (`retry_exhausted` runtime row → `terminate("blocked")` at `iteration_state_action.ts:530-539`; `handoff` → `suspend`), and `attached_fp_worker`'s own header comment (`:172-177`) asserts "convergence remains guarded by the ABG assurance fold" — which the budget→`gap_stop`/`yielded` path contradicts.

**Fix:** build satisfaction/runtime rows from the blocked artifact (the blocking-reason / runtime-failure class already computed in `blockedResultFromIngestOutcome`) → `deriveIterationOutcomeFromRows` (mirror the no-artifact path); keep `deriveRetryRepairDecision` strictly as the **event** producer and assert-on-drift exactly like `engine_runner.ts:776-778`; treat `mustExitAfterBoundedAttempt` as a **row input** (terminalFallback / non-retryable runtime row), not an independent terminal selector.

## 🔴 HIGH / latent — `edgeCanClose` bypass in the fold (`iteration_state_action.ts:633-638`)

`|| input.edgeCanClose` short-circuits the satisfaction check: a type-valid **unsatisfied** satisfaction row with an uncaught reason (e.g. `runtime_failure`) plus `edgeCanClose:true` folds to **converged** (empirically reproduced against the compiled fold). Latent only because no live producer currently sets `edgeCanClose=true` — but it is a converge-on-unsatisfied hole.

**Fix:** `edgeCanClose` must encode the full satisfaction conjunction, not bypass it. Regression: `unsatisfied(reason=runtime_failure) + edgeCanClose ⇒ must NOT converge`.

## 🟡 MEDIUM — the guard and tests don't cover the two bugs above (which is *why* the gate is green)

- **Structural guard is presence-only and omits `attached_fp_worker.ts`/`retry_repair.ts`.** `test_t149_iteration_state_action_algebra.test.mjs:313-378` lists only index/constructors/graph_span_reentry/traversal_structure_probe/engine_runner, `assert.match`es that `deriveIterationOutcomeFromRows` *appears* in each, and does not ban direct `terminalKind` selection. A presence-grep cannot detect a residual rival path — so the BLOCKING rival passes the gate. Extend the guard to enumerate `attached_fp_worker`/`retry_repair` and forbid non-fold `terminalKind` selection on an iteration boundary.
- **The t149 suite never exercises the runner path, the two-attempt lifecycle, `terminalFallbackRefs`, or `edgeCanClose`** — violating T-149's own non-closure condition ("tests only call helpers and do not prove the runner path"). The rival and the `edgeCanClose` hole both sit in these coverage holes.
- **Row-family miscategorization** at `assurance.ts:829-832` forces a post-fold source re-read at `:931-952`.

## Refuted and dropped (adversarial pass — including two of the lead's own inline findings)

- **"terminal-fallback steals convergence" — REFUTED.** Empirical reproduction: `satisfied + fallbackRef ⇒ converged`; on-disk, the `converged`/`deferred` branches sit **above** the fallback branch. The lead cited stale line numbers (the file moved under active editing). **Retracted.**
- **"`deriveAdvancementTransition` is a second converged-producer" — REFUTED.** Its converged terminal is fold-anchored via the assurance gate → `deriveAssuranceClosureDecision` → the fold. **Retracted.**

(Note: `attached_fp_worker`'s own dedicated verification chain dropped mid-run — `pipeline[9]` completed without structured output — yet the runner and fold dimension agents caught its rival cross-cuttingly. The fan-out earned its cost precisely there.)

## Migration map: 13 of 14 surfaces verified clean

Each was checked by reachability proof, not name-grep. Representative proofs:

- **`continuation_transition.ts` (still 770 lines) — `demoted_fold_caller`, low risk.** The 770 lines are row-machinery (`rowsForAssuranceDecision`/`rowsForTraversalAction`/`satisfactionRow`/`runtimeRow`/`redispatchTargetRow`, `~295-591`) plus a label adapter. The sole outcome decision is `:730-731` → `deriveIterationOutcomeProjection` (the fold). `transitionForIterationOutcome` (`:593-708`) gates **every** disposition literal on a fold-set field (`outcome.kind/disposition/reEntryPoint`); a `disposition:` grep confirms no disposition literal exists outside this post-fold mapper. The one non-fold seam (`:683`, `inspect_runtime_archive` label) is a label refinement inside a fold-decided `blocked` region and collapses to `gap_stop`.
- **`traversal_non_progress.ts` — `demoted_fold_caller`, low risk.** `:677` is the sole fold call; `:595-676` is a pure row-producer; the action axis (terminal/retry/suspend) is a pure function of the fold's `outcome.kind` (`:686/690` gate on `outcome.kind === "suspend"/"redispatch"` first), and local label flags only pick terminal sub-labels.
- **`assurance.ts:deriveAssuranceClosureDecision`** and **`engine_runner.ts:fdAuthorityTerminalTransition`** route through `deriveIterationOutcomeFromRows` (verified inline). Old `contracts/iteration.ts` is **deleted**.

The single exception is the BLOCKING `attached_fp_worker` rival above.

## Genuine positives (verified, not asserted)

- Fold **purity**: no event reads / no projection calls inside the decision (`deriveOutcomeFromRows`).
- **Totality** with a fail-closed default (`terminate("blocked","unsupported_state")`); reason→re-entry table is exhaustive (`never` default).
- **Complete `iteration.ts` removal**; orphan modeled as a binding **guard** (not a lifecycle/satisfaction category); superseded filtered before the fold; `preserved_rebased` has a test.
- **Fold-anchoring across emitters** (fdAuthority / assurance / no-artifact / graph-reentry) and a clean ODD/ABG boundary — no `odd_sdlc`/`data_mapper`/JVM/SBT/JavaScript/hello-world vocabulary in the m03 generic surfaces.

## To close T-149 (4 items)

1. Route the `attached_fp_worker` terminal/retry outcome through the fold (assert-on-drift like `engine_runner.ts:776-778`; treat `mustExitAfterBoundedAttempt` as a row).
2. Fix the `edgeCanClose` converge-on-unsatisfied bypass (`iteration_state_action.ts:633-638`).
3. Extend the structural guard to `attached_fp_worker` + `retry_repair` and ban direct `terminalKind` selection.
4. Add runner-integration + `edgeCanClose` + `terminalFallbackRefs` + two-attempt-lifecycle regression tests.

The consolidation is genuinely strong — the algebra, the purity, and 13/14 surfaces are right. It is one live rival, one latent fold hole, and the coverage that would have caught both, away from done.

## Provenance

- Review workflow run: `wf_3812d943-efa` (task `w9tz3atfo`) — 32 agents, ~2.7M subagent tokens, 642 tool calls, ~44 min wall.
- Two surface chains dropped without structured output: `pipeline[0]` (assurance.ts — covered by the lead's inline read, confirmed demoted) and `pipeline[9]` (attached_fp_worker.ts — its rival was caught by the runner/fold dimension agents anyway, and is the BLOCKING finding).
- Raw per-agent forensics (140 KB, full reachability proofs for all surfaces + dimensions): `/private/tmp/claude-501/-Users-jim-src-apps/05048af6-bf92-4df7-9bc7-5915ef9f0f59/tasks/w9tz3atfo.output` — transient; copy into the ticket proof or a durable archive if the seven-day window matters.
