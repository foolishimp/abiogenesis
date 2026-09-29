# Continuation causation recurrence — stopped, boundary unproved

**Invariant/owner:** `event_store.ts` forbids workspace envelope causes from a Run. Pending Run facts must instead be authenticated through continuation payload coordinates and their predecessor projection. The event guard is unchanged.

**Recurrence:** selected-action admission added Run selection events as workspace causes, and its cold projector required those illegal causes. This repeated the current-intent defect already repaired in exact-intent-02. The defect was source-traced; no successful selected-action execution existed.

**Changed premise:** both variants now use one existing-owner workspace operation constructor in `abg/construction_continuation.ts`. Cold truth shares `continuationOperationWorkspaceCorresponds`; selected-action still authenticates its pending source/current payload relation and exact cover independently. Its Run-scoped supersession retains its own Run source plus the workspace operation. Source/HOW delta is +69/−45 lines across two owners and the owning continuation HOW, plus the focused test/fixture. No new event, controller or weaker guard.

**Actual result:** one coherent build passed in20.771s. Boundary verification remains **unproved**. Attempt01 failed before admission because the test imported the internal owner before the supported Product entry. Executive selected that fixture-only load-order correction. Attempt02 loaded successfully, admitted six controlled seed events, then correctly refused ordinal65: it is a liveness probe requiring its dedicated ingress. The fixture wrongly assumed ordinal65 was the selection's route. Neither attempt reached the changed-constructor assertions or cold check. Both failures are retained; no further retry occurred.

**Remaining setup:** `test_env/fixtures/continuation-causation.json` must select the actual route through `construction_intent_selected.causationEventRefs`, with complete controlled predecessor correspondence checked before another selected run of `test_env/tests/t287-continuation-causation.test.mjs`. No further correction is authorized by this return.

**Preserved evidence/limits:** all39 members of the earlier selected-action freeze remain byte-identical. Accepted exact-intent installed evidence retains its original scope; these controlled predecessor carriers are not a new native execution. No provider, package/install, HoG traversal or changed-authority qualification occurred. Normal emission includes the prior incomplete draft, so the build is not delivery readiness.

Exact paths/hashes: `source-generated.json` SHA256 `6effa6b56d81b42e4bc14af74cb45c8af77e972643fba1c18047140d42daf648`; `source-delta.json`, `preimages.json`, and both test logs identify the bounded subject. Source/tests are held for Executive inspection. Next action is the selected complete fixture intake, not another patch loop.
