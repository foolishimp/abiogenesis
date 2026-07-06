---
id: T-200-composed-arm-dispatch-gating
status: backlog
opened: 2026-07-06
source: T-195 review P1-8
---

typed dispatch-candidate event for stage-task batches so gate formulas gain an antecedent on composed arms

FINDING #11 (data-mapper campaign, run-15 replay audit, user-driven):
evaluate.C.F_P executions are real (47 codex sessions vs 30 worker
dispatches; 17 evaluator sessions archived with model/effort headers) but
emit NO fp_dispatch_requested / actor_invocation_* events — replay
undercounts F_P execution ~36%, evaluator cost is unauditable from truth,
and dispatch-point temporal gates are vacuous on the evaluate arm. The
T-200 realization must make evaluate-arm (and composed-arm) worker
executions replay-visible as typed dispatch/invocation truth — same
mechanism that gives gate formulas their antecedent.

CONSTITUTIONAL FRAMING (user, 2026-07-06): C.F_P is ONE ontology. The
envelope is currently bound to the dispatch EFFECT, not to F_P work as
such — "plugin.C.F_P" must not look different system-wise from
"dispatch.C.F_P". Realization: every F_P-work-bearing effect resolution
(evaluate, composed batch) gets the same engine-owned envelope keyed by
the T-190 armId census (dispatch-requested -> invocation -> payload/
response admission), with outcomes carrying transport evidence refs.
One fix collapses: finding #11 (invisible evaluator cost), vacuous
dispatch gates on non-transform arms, and evaluator transport failures
bypassing the retry allowlist.

GOVERNING ALGEBRA (user recap, 2026-07-06): traversal A->B carries compute
C as a tuple over {F_D, F_P, F_H}; the engine is the traversal monad and
each edge internally makes THREE C calls (transform, evaluate,
consequence), each regime-substitutable via plugins — all-F_D degenerates
to a workflow engine, all-F_H to a human process. The functor property
demands SHAPE-PRESERVING truth under regime substitution: one C-call
envelope parameterized by (stage-role, regime), same replay skeleton in
every fiber, regime-specific only in evidence class. Today only
transform.C satisfies this. T-200 realizes the uniform envelope — not
"F_P visibility for the evaluate arm" but envelope-uniformity over C,
of which finding #11 is one symptom. Ratification home for the algebra
statement itself: user's decision (ODD/PRODUCT candidate).
