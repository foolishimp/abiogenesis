# REQ-R-ABG3-FP-CONSCIOUSNESS - Generic F_P Construction Consciousness Loop

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-05-07
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-R-ABG3-PROJECTION.md](./REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-RETRY.md](./REQ-R-ABG3-RETRY.md), [REQ-R-ABG3-SAGA-FRONTIER.md](./REQ-R-ABG3-SAGA-FRONTIER.md), [REQ-L-GTL3-HOOKS.md](../gtl/REQ-L-GTL3-HOOKS.md), [T-127](../../../.ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md)

---

## Purpose

Define the ABG substrate law for a generic `F_P` construction consciousness
loop: an event-sourced tail-recursive construction episode where a product
evaluator observes linked asset state, ranks admissible graph/action outcomes,
and returns construction intent candidates that ABG admits, invokes, records,
and projects.

## Acceptance Criteria

**REQ-R-ABG3-FPC-001**: ABG shall support a generic construction episode as tail recursion over replay-derived linked asset state, admitted evaluator intent, graph-function invocation, runtime events, asset deltas, progress ledgers, and construction projection.

**REQ-R-ABG3-FPC-002**: The construction episode shall preserve one graph function or graph-vector traversal invocation as the bounded runtime unit of probabilistic compute. The higher-order loop composes lawful invocations; it does not make one unbounded hidden runtime call into the ABG primitive.

**REQ-R-ABG3-FPC-003**: Construction observation shall be a typed snapshot over current passed input, replay-derived runtime aggregates, linked asset refs, obligation ledgers, gap/retry/reentry projections, evaluator results, F_H input, prior construction intents, and available graph/action catalog entries.

**REQ-R-ABG3-FPC-004**: The graph/action catalog consumed by the evaluator shall be projected from declared GTL module, job, role, graph-function, graph-vector, hook, and policy truth plus ABG runtime eligibility. It shall not be prompt prose or CLI/harness-local configuration.

**REQ-R-ABG3-FPC-004A**: Construction action catalog rows that target internal traversal boundaries shall preserve the lawful published traversal target authority required by binding law. At minimum that means a graph-function ref plus the resolved graph-vector ref and its `RefinementBoundary` or `CandidateFamily` publication ref, or an explicit proof that the action targets only an already-published public graph-function carrier.

**REQ-R-ABG3-FPC-004B**: ABG shall derive an observation-to-action binding projection before construction evaluator ranking. The projection shall map observation pressure rows such as open ledger obligations, admitted error facts, gap rows, retry/reentry frontier rows, and workspace asset digests to lawful action catalog rows with typed match reasons and missing-binding reasons. Affect-only rows shall not bind to constructive graph actions; they may only adjust existing lawful bindings or bind to declared review, F_H, escalation, or terminal-route rows under visible affect policy.

**REQ-R-ABG3-FPC-004C**: Public gap projection shall be a read-only evaluator interface over current construction observation truth. A gaps surface may derive typed asset gaps, blocking asset obligations, missing proof/input/output truth, candidate completion actions, read-only evaluator ranking, and ranking reasons from the same construction evaluator surface used for action selection, but it shall not append construction events, admit an intent, dispatch graph work, or own a retry loop.

**REQ-R-ABG3-FPC-004D**: Typed asset gaps shall bind to lawful graph/action catalog rows that can complete or induce the missing typed asset truth. The binding shall preserve asset ref, asset kind, required-by ref, missing truth refs, blocking reason refs, eligible action refs, best graph/action refs, admission blockers, priority rank, and ranking reason refs when available.

**REQ-R-ABG3-FPC-004E**: Bootstrap shall enter the same construction episode law from sparse replay state. When typed asset inventory or publication truth is missing, asset induction may rank as the highest-value or blocking next action, but asset induction shall be a published graph function or action catalog row admitted by ABG, not a CLI/setup-script special case.

**REQ-R-ABG3-FPC-005**: The `F_P` construction evaluator may return a ranked set of `ConstructionIntentCandidate` records. Each candidate shall bind the target outcome, selected action kind, graph function or reentry target, input asset refs, expected output asset refs, implicated gap/progress refs, value score, lawful basis, expected delta, progress condition, stop or escalation condition, and rejected-alternative rationale when available.

**REQ-R-ABG3-FPC-005A**: Candidate ranking shall consume a visible `ConstructionPriorityScheme`. The scheme may encode configured strategy priorities such as steel-thread, full-breadth, gap-repair, danger-first, operator-requested, deadline-sensitive, release-blocking pressure, or workspace-risk pressure, but those labels are product-owned policy metadata. ABG shall use the scheme only as declared ranking/admissibility pressure over lawful catalog actions.

**REQ-R-ABG3-FPC-005B**: Affect priority policy shall be visible declared configuration, not emitted adjustment truth. `AffectPriorityPolicy` may define how admitted affect signals such as concern, urgency, danger, fear, operator distress, risk, or confidence are interpreted for boost, attenuation, forced review, F_H input, or escalation pressure.

**REQ-R-ABG3-FPC-005C**: `AffectPriorityAdjustment` shall be an ABG replay-derived projection row over admitted affect signal, visible `AffectPriorityPolicy`, current observation pressure, and lawful action bindings. Affect shall not make an otherwise inadmissible graph action admissible, shall not bypass graph-call/frame/continuation law, and shall remain replay-visible. Affect-only pressure shall not bind directly to constructive graph actions; it may adjust existing lawful bindings or select review, F_H, escalation, or terminal-route pressure under declared policy.

**REQ-R-ABG3-FPC-005D**: Construction priority projection shall be deterministic. It shall carry a stable rank ordinal and tie-break key, and terminal affect dispositions such as forced review, F_H input, or escalation shall block graph invocation when selected by policy even if a lawful constructive action exists.

**REQ-R-ABG3-FPC-005E**: Construction evaluator selection may declare a steel-thread plan or dependency fan-out plan when the product owns that dependency meaning. The declared plan shall preserve admitted module/test dependency maps, declared source/test/build/output targets, write territory or output allocation, evidence expectations, fan-in expectations, and product-owned dependency meaning. ABG shall consume that declaration as dependency-frontier input under `REQ-R-ABG3-SAGA-FRONTIER`; it shall not treat the declaration as a mandatory concurrent-dispatch command. System parallelism shall keep immutable semantic carriers and replay-derived projections at the center while treating shared workspace mutation as an effect edge governed by observed-state and publication truth.

**REQ-R-ABG3-FPC-006**: ABG shall admit construction intent candidates before invocation. Admission shall reject malformed lineage, unavailable graph/action refs, contradictory authority, hidden plugin config, missing target outcome, missing source asset authority, or attempts to bypass GTL/ABG graph invocation.

**REQ-R-ABG3-FPC-007**: ABG shall select at most one admitted construction intent for the next invocation under declared policy. If no candidate is admitted, ABG shall project a typed block, F_H input request, ticket/reprice proposal, or escalation rather than silently falling back to same-edge retry.

**REQ-R-ABG3-FPC-008**: An admitted construction intent shall invoke work only through ABG-owned graph-call, frame, continuation, event, lineage, and projection mechanics. CLI surfaces, harnesses, downstream adapters, and worker prompts shall not own the construction iteration loop.

**REQ-R-ABG3-FPC-009**: Every construction iteration shall append or derive replay-visible truth sufficient to reconstruct observation, evaluator invocation, action catalog resolution, candidate admission/rejection, selected graph invocation, output delta, progress classification, and terminal projection without private mutable controller state.

**REQ-R-ABG3-FPC-010**: ABG shall derive a `ConstructionProgressLedger` that distinguishes progress from stagnation. A new artifact digest, newly admitted progress row, narrowed blocker, fulfilled obligation row, accepted F_H decision, or lawful reentry movement may count as progress. The same blocker with the same material artifact digest shall not count as progress.

**REQ-R-ABG3-FPC-011**: F_D evidence shall remain mechanical or domain-owned optimization truth. When source authority does not disambiguate product meaning, F_D shall not force canonical semantic output or fail the construction episode. It shall project ambiguity pressure that can trigger the `F_P` construction evaluator.

**REQ-R-ABG3-FPC-011A**: F_D outcomes shall carry admitted authority-placement severity when they do not accept. The closed severity classes are `protocol_invalid`, `construction_context_invalid`, `diagnostic_shape_invalid`, and `content_unproven`.

**REQ-R-ABG3-FPC-011B**: ABG shall derive F_D pressure routing from severity plus evaluator-declared `consumedFieldRefs`. `protocol_invalid` and `construction_context_invalid` block. `diagnostic_shape_invalid` blocks only when the malformed field is consumed by downstream routing, execution construction, pressure projection, or closure; otherwise it preserves pressure and allows lawful construction to continue. `content_unproven` routes to F_P/content pressure rather than deterministic closure.

**REQ-R-ABG3-FPC-011C**: F_D authority-placement decisions shall be replay-visible runtime truth. The event spine shall preserve status, severity class, routing decision, affected field refs, consumed field refs, pressure refs, diagnostics, and evidence refs sufficient to replay the runner's block, continue, pressure-preserve, or F_P-route behavior.

**REQ-R-ABG3-FPC-011D**: Plugins may report deterministic evidence and affected fields, but they shall not own pressure-routing authority. If a plugin supplies a routing decision, ABG shall admit it only when it matches the routing derived from admitted severity and consumed-field truth.

**REQ-R-ABG3-FPC-012**: The public construction projection shall expose one authoritative next-action state for a construction episode. Minimum states are `construction_closed`, `construction_progressing_yield`, `construction_blocked`, `construction_stalled`, `construction_review_required`, `construction_escalated`, `fh_input_required`, `ticket_created`, and `reprice_required`.

**REQ-R-ABG3-FPC-013**: GTL/product overrides for observation, action catalog, admissibility, value, progress, escalation, and intent rendering shall resolve from declared hook/policy surfaces with visible fallback behavior. Hidden runtime config shall not satisfy override authority.

**REQ-R-ABG3-FPC-014**: The construction loop shall compose with graph-span foldback and lawful reentry. A construction evaluator may select same-edge repair, graph-span reentry, earlier/later graph-function invocation, F_H gate, ticket creation, or constitutional reprice only through admitted construction intent and existing reentry/change-class law.

**REQ-R-ABG3-FPC-015**: Downstream products shall consume construction progress and next action through ABG public projection or event replay. They shall not implement private retry/reentry loops to compensate for missing construction episode semantics.

**REQ-R-ABG3-FPC-016**: Deterministic tests shall cover construction-episode gap pressure invoking evaluator selection, public gaps rendering the same evaluator ranking in read-only mode, typed-asset-to-action binding, highest-value or blocking-asset ranking, bootstrap asset induction through published graph/action rows, observation-to-action binding, configured priority ranking, deterministic tie-break law, affect boost/attenuation/review/F_H/escalation behavior, terminal affect blocking, F_D ambiguity escalation, candidate admission/rejection, hook precedence, same-edge incremental progress, arbitrary lawful graph reentry, stagnation, public summary agreement, no-mutation gaps behavior, and adapter non-authority before runtime/live closure can be claimed.

**REQ-R-ABG3-FPC-017**: Construction event kinds that initiate, terminate, clip, or declip runtime fluent truth shall declare Event Calculus effects before implementation closure. Progress, stall, and summary states that are derivable from admitted events, material deltas, and policy shall be modeled as `RuntimeDerivedFluentRule` truth rather than primary event authority.
