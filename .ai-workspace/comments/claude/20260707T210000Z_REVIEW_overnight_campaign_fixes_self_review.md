# Review: Self Code Review Of The Overnight Campaign Fixes (#13–#21b, #10b)

**Status**: review commentary (skeptical pass over my own overnight work)
**Date**: 2026-07-07
**Scope**: every fix landed during the run-18/run-19 campaign, re-read at
the code level. Findings ranked most-severe first. Nothing applied —
findings await the owner's ruling, except where marked already-ledgered.

## F1 — HIGH (regression I introduced): #21b dropped #21's never-crash guard
`odd_glc test/glc-software-build-overlay-live.test.mjs:~4338` — the #21b
rewrite replaced the guarded target-resolution block with bare
`stageRows[REPAIR_REENTRY_TARGET_VECTOR_INDEX].sourceName` concatenations.
If the index ever drifts (stage plan edit), `.sourceName` of undefined
THROWS inside the consequence plugin — and the ABI hardening gap (F5)
means that throw becomes a host `cli:start` failure, the exact class #21
existed to prevent. FIX: wrap the action construction in try/catch
falling through to the no-action projection, and derive the index by
stage name (`stageRows.findIndex(s => s.stage === "derive_code_surface")`)
instead of the hardcoded 12.

## F2 — HIGH (unproven-surface class): the live-only binding logic has no offline proof lane
#14 (nested plan), #10b (expansion regex), #18/#18b (attribution),
#21/#21b (consequence plugin) all live inside the generated-binding
template and execute ONLY in live campaign runs. The odd_glc 54-suite
parses and generates but never drives `executePlannedScenario`,
`deterministicExecutionAssessmentFor`, or the consequence plugin — every
"Suite 54/0" on those commits proved only non-breakage of other lanes.
The escape-discipline class alone has bitten three times (#15, #10b, my
catalog splice). FIX: a binding unit lane — generate the binding source,
`node --check` it, import it in-process, and drive the plan
reader/assessment/attribution/consequence functions with fixtures
(including mangled-template greps: `value.replace(/${`, bare `${PATH}`).
This is the highest-leverage single test file the campaign can add.

## F3 — HIGH (safety hole I built): resume mode does not verify scenario identity
`ODD_GLC_LIVE_RESUME` asserts `sandbox-identity.json` exists but never
compares its `scenarioId` with the currently selected scenario. Resuming
a data-mapper workspace while `ODD_GLC_LIVE_SCENARIO` selects another
scenario would regenerate the binding FOR THE WRONG SCENARIO into the
reused workspace (binding-regen-on-resume is unconditional). FIX: read
sandbox-identity, assert `scenarioId === scenario.scenarioId`, abort with
a typed message otherwise.

## F4 — MEDIUM-HIGH (over-broad fix): #13's second inspect-gate exception
`abi contracts/traversal_non_progress.ts` — the `incomplete_runtime_archive`
branch now skips archive inspection for ANY retryable
`runtimeFailureClass`, not just the pre-spawn class I diagnosed. A REAL
process that died mid-archive with a transport_failure class previously
went to inspection; now it retries without inspecting. Retry-first may
be defensible, but it is a broader behavior change than the diagnosis
justified and no differential pins the mid-archive-death case. FIX:
require the pre-spawn signature (`process === undefined`) in the second
gate's exception too, or pin the broader behavior deliberately with a
differential.

## F5 — MEDIUM (ledgered, unfixed): consequence-plugin throws are host failures
Observed live (#21's crash surfaced as `cli:start runtime_failure`, not a
typed blocked outcome). The P4 guard covers dispatch/evaluator arms; the
consequence-projection effect path lacks the same conversion. ABI rc.4
item — already in the ledger; restated here because F1 makes it live
again if the guard isn't restored.

## F6 — MEDIUM (convention-not-carrier): #13 classifies by parsing prose
`preSpawnDispatchFailureClass` string-matches `"(contract_failure)"` etc.
inside the human-readable closure detail. It works because P4's
`blockedReasonForPluginThrow` appends those markers, but the convention
is not a typed carrier — worker prose containing the marker (with a
process-less deterministic close) could misclassify. FIX (rc.4): a typed
`closureFailureClass` field on `actor_invocation_closed`, populated at
the executor; the detail stays prose.

## F7 — MEDIUM (unproven on multi-invocation vectors): #16 attempt counting
`actorAttemptIndexForProjection` now counts ALL invocation rows at the
vector. Composed-batch vectors run one invocation PER TASK — a
subsequent retry would number attemptIndex past the task count
(previously retry-ref-based). No suite lane asserts batch attemptIndex
continuity, so green proves nothing here. FIX: one differential — batch
vector, then a retry, assert invocation numbering; adjust to count
per-(vector, taskOrdinal-equivalent) if it inflates.

## F8 — LOW-MEDIUM: re-entry budget consumed before admission
The plugin increments `repairReentryCount` before the engine
admits/applies the action; a rejected action (family/ref mismatch) burns
budget without a re-entry. Move the increment after emission is not
possible from the plugin (it cannot see admission) — acceptable, but
worth one line of comment plus a slightly larger budget.

## F9 — LOW: assorted
- `REPAIR_REENTRY_TARGET_VECTOR_INDEX = 12` hardcoded (covered by F1's fix).
- The `allowed_traversal_families` declaration is function-level, so the
  depth_traversal family is permitted on every vector; scoping to the
  repaired-result vector row would be tighter law.
- #18b attributes trailing scalac summary lines ("one error found") to
  the last-seen file — harmless, semantically sloppy.
- #17 tolerates the null-basis event at read; the design alternative (a
  separate observability channel instead of the basis log) deserves an
  rc.4 note.
- Stage-22 evaluator criteria still demand passing while stage-21 now
  routes — consistent with the intended design (re-entry fires at 21's
  consequence before 22 ever sees failure) but ONLY once F1/pressure
  derivation make the re-entry reliable; otherwise 22 is a wall by
  construction.

## What held up well under re-reading
#15 and #10b are correct and were verified against the regenerated
binding in the live workspace; #17's tolerance is narrow (kind + null
only); #20's criteria reshape kept the malformed-evidence rejection arm;
the routing reshape at stage 21's F_D gate is the strict-F_D law applied
correctly; resume/binding-regen achieved exactly the patch-and-continue
economics ordered, with all six run-19 resumes costing one stage each.

## Recommended order of application
1. F1 (guard + name-derived index) — one edit, prevents a live host-crash class.
2. F3 (resume identity check) — one edit, prevents workspace corruption.
3. F2 (the binding unit lane) — the structural payoff; kills the
   escape-discipline class and gives #14/#18/#21 real differentials.
4. F4 narrowing + F7 differential — ABI battery items for rc.4.
5. F5/F6 — rc.4 ledger (typed closure class + consequence-throw guard).
