# REQ-R-ABG3-FP-CONSCIOUSNESS - Generic F_P Construction Consciousness Loop

**Status**: Active
**Category**: Capability / Constraint
**Date**: 2026-05-07
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-R-ABG3-PROJECTION.md](./REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-RETRY.md](./REQ-R-ABG3-RETRY.md), [REQ-R-ABG3-SAGA-FRONTIER.md](./REQ-R-ABG3-SAGA-FRONTIER.md), [REQ-L-GTL3-HOOKS.md](../gtl/REQ-L-GTL3-HOOKS.md), [T-127](../../../.ai-workspace/tickets/completed/T-127-define-generic-fp-consciousness-loop-with-gtl-plugin-overrides.md), [T-217](../../../.ai-workspace/tickets/completed/T-217-consciousness-wave-higher-order-regulation.md) (FPC-018/-019 observer-tier refinement)

---

## Purpose

Define the ABG substrate law for the admitted GTL One Surface construction
composition: an event-sourced tail-recursive episode that keeps product-model
synthesis, gap evaluation, next-action evaluation, and action-result evaluation
as distinct authorities while ABG admits intent, invokes published
GraphFunctions, records evidence, continues, and projects.

## Acceptance Criteria

**REQ-R-ABG3-FPC-001**: An admitted GTL program shall declare the One Surface
construction episode as tail recursion over `synthesizeModel -> evalGap ->
evaluateNext -> admitConstructionIntent -> invokeGraphFunction |
continueExecution -> admit evidence -> evaluateAction -> exact next basis ->
refresh model -> fresh evalGap -> evaluateNext -> projection`. HoG shall
traverse that admitted composition and ABG shall admit its runtime facts;
public ingress, an adapter, a plugin, or an ABG helper shall not own or reorder
it.

**REQ-R-ABG3-FPC-002**: The construction episode shall preserve one program-bound GraphFunction or internal graph-vector traversal invocation as the bounded runtime unit of probabilistic compute. The higher-order GTL composition composes lawful invocations; it does not make one unbounded hidden runtime call into the ABG primitive or turn a GraphFunction into the whole program.

**REQ-R-ABG3-FPC-002A**: `synthesizeModel` shall consume admitted intent lineage, the prior `ProductAssetModel` when present, and admitted product truth and shall emit one versioned `ProductAssetModel`. Model synthesis owns desired and known typed product-asset truth; it shall not observe mutable worksite state, evaluate gaps, rank actions, admit intent, invoke work, or decide closure.

**REQ-R-ABG3-FPC-003**: `evalGap` shall admit one typed `ObservationSnapshot` over an immutable `WorkspaceBinding`, current `ProductAssetModel`, replay-derived runtime aggregates and cursor, linked worksite and asset observations, obligation ledgers, retry/reentry projections, evaluator results, F_H input, and prior construction intents. Mutable observation digests and refs belong to the snapshot, never the workspace authority basis or binding; a new observation under unchanged authority shall not create a basis fork.

**REQ-R-ABG3-FPC-004**: `ActionCatalog` shall be a read-only exact-basis projection of actions published by the admitted GTL program and narrowed catalog view, derived from module, job, role, graph-function, graph-vector, hook, and policy truth. It shall contain no current eligibility, ranking, or selected-action decision; those belong exclusively to `evaluateNext`. It shall not be prompt prose or CLI/harness-local configuration.

**REQ-R-ABG3-FPC-004A**: Construction action catalog rows that target internal traversal boundaries shall preserve the lawful published traversal target authority required by binding law. At minimum that means the admitted program ref, a graph-function ref published by that program, the resolved graph-vector ref and its `RefinementBoundary` or `CandidateFamily` publication ref, or an explicit proof that the action targets only an already-published public graph-function callable in that program.

**REQ-R-ABG3-FPC-004B**: `evalGap` shall derive typed pressure rows from the exact observation snapshot, and `evaluateNext` shall bind those rows to exact target obligations and lawful action-catalog rows before ranking. `TargetObligationBinding` shall preserve typed match and missing-binding reasons. Affect-only rows shall not bind to constructive graph actions; they may only adjust existing lawful bindings or bind to declared review, F_H, escalation, or terminal-route rows under visible affect policy.

**REQ-R-ABG3-FPC-004C**: Public gap and lawful-action reads shall be pure projections of admitted `ObservationSnapshot`, gap-pressure, target-binding, priority, and `NextActionProjection` truth produced by `evalGap` and `evaluateNext`. A read may render typed asset gaps, blocking obligations, missing proof/input/output truth, candidate completion actions, current ranking, and reasons; it shall not evaluate gaps, rank or select actions, append events, admit intent, dispatch work, continue execution, evaluate action results, or own retry.

**REQ-R-ABG3-FPC-004D**: Typed asset gaps shall bind to lawful graph/action catalog rows that can complete or induce the missing typed asset truth. The binding shall preserve asset ref, asset kind, required-by ref, missing truth refs, blocking reason refs, eligible action refs, best graph/action refs, admission blockers, priority rank, and ranking reason refs when available.

**REQ-R-ABG3-FPC-004E**: Bootstrap shall enter the same construction episode law from sparse replay state. When typed asset inventory or publication truth is missing, asset induction may rank as the highest-value or blocking next action, but asset induction shall be a published graph function or action catalog row admitted by ABG, not a CLI/setup-script special case.

**REQ-R-ABG3-FPC-005**: `evaluateNext` shall consume one exact next-action basis, fresh gap truth, target obligations, the admitted program's action catalog, runtime frontier, and declared policy. It shall emit exact `TargetObligationBinding` rows, one deterministic `PriorityProjection`, and one total `NextActionProjection` containing either the selected lawful action or typed no-action disposition. The projection shall preserve target outcome, action kind, program and graph-function or reentry target, input/output asset refs, implicated gap/progress refs, value, lawful basis, expected delta, progress and stop conditions, and rejected-alternative rationale when available.

**REQ-R-ABG3-FPC-005A**: `evaluateNext` ranking shall consume a visible `ConstructionPriorityScheme`. The scheme may encode configured strategy priorities such as steel-thread, full-breadth, gap-repair, danger-first, operator-requested, deadline-sensitive, release-blocking pressure, or workspace-risk pressure, but those labels are product-owned policy metadata. ABG shall admit and project the evaluator result without turning the scheme into interpreter-owned selection policy.

**REQ-R-ABG3-FPC-005B**: Affect priority policy shall be visible declared configuration, not emitted adjustment truth. `AffectPriorityPolicy` may define how admitted affect signals such as concern, urgency, danger, fear, operator distress, risk, or confidence are interpreted for boost, attenuation, forced review, F_H input, or escalation pressure.

**REQ-R-ABG3-FPC-005C**: `AffectPriorityAdjustment` shall be an ABG replay-derived projection row over admitted affect signal, visible `AffectPriorityPolicy`, current observation pressure, and lawful action bindings. Affect shall not make an otherwise inadmissible graph action admissible, shall not bypass graph-call/frame/continuation law, and shall remain replay-visible. Affect-only pressure shall not bind directly to constructive graph actions; `evaluateNext` may consume it under declared policy to adjust existing lawful bindings or select review, F_H, escalation, or terminal-route pressure.

**REQ-R-ABG3-FPC-005D**: `evaluateNext` shall produce deterministic priority and next-action projections with stable rank ordinals and tie-break keys. Terminal affect dispositions such as forced review, F_H input, or escalation shall block graph invocation when selected by policy even if a lawful constructive action exists. A projector shall render, never recompute, those decisions.

**REQ-R-ABG3-FPC-005E**: Construction evaluator selection may declare a steel-thread plan or dependency fan-out plan when the product owns that dependency meaning. The declared plan shall preserve admitted module/test dependency maps, declared source/test/build/output targets, write territory or output allocation, evidence expectations, fan-in expectations, and product-owned dependency meaning. ABG shall consume that declaration as dependency-frontier input under `REQ-R-ABG3-SAGA-FRONTIER`; it shall not treat the declaration as a mandatory concurrent-dispatch command. System parallelism shall keep immutable semantic carriers and replay-derived projections at the center while treating shared workspace mutation as an effect edge governed by observed-state and publication truth.

**REQ-R-ABG3-FPC-006**: ABG shall admit one `ConstructionIntent` from the selected `NextActionProjection` before invocation. Admission shall bind exact lineage, admitted program, selected action, target obligations, immutable workspace binding, invocation authority, and program membership, and shall reject malformed lineage, unavailable graph/action refs, contradictory authority, hidden plugin config, missing target outcome, missing source asset authority, or attempts to bypass GTL/ABG graph invocation.

**REQ-R-ABG3-FPC-007**: `evaluateNext` shall select at most one lawful action; ABG shall admit at most one corresponding new construction intent. If no action or intent is admitted, the total next-action result shall be typed block, F_H input request, ticket/reprice proposal, escalation, or another declared no-action disposition rather than silent same-edge retry.

**REQ-R-ABG3-FPC-008**: A new admitted construction intent shall invoke work only through ABG-owned program-membership, graph-call, frame, event, lineage, and execution mechanics. Continuation of the current intent shall instead consume its replay-derived `Continuation` through `continueExecution`. CLI surfaces, harnesses, downstream adapters, worker prompts, and projectors shall not own either path or the construction composition.

**REQ-R-ABG3-FPC-009**: Every construction iteration shall append or derive replay-visible truth sufficient to reconstruct the exact admitted program and workspace binding, model synthesis, observation snapshot and gap evaluation, action-catalog basis, target binding, next-action evaluation, intent admission or current-intent continuation, selected graph invocation, evidence admission, action evaluation, output delta, exact next-action basis, refreshed model/gap/selection, progress classification, and terminal projection without private mutable controller state.

**REQ-R-ABG3-FPC-010**: ABG shall derive a `ConstructionProgressLedger` that distinguishes progress from stagnation. A new artifact digest, newly admitted progress row, narrowed blocker, fulfilled obligation row, accepted F_H decision, or lawful reentry movement may count as progress. The same blocker with the same material artifact digest shall not count as progress. The ledger is admitted evidence and gap/selection input; it shall not select or close an action by itself.

**REQ-R-ABG3-FPC-011**: F_D evidence shall remain mechanical or domain-owned optimization truth. When source authority does not disambiguate product meaning, F_D shall not force canonical semantic output or fail the construction episode. It shall admit ambiguity evidence that `evalGap` may project as pressure and `evaluateNext` may consume; it shall not select or close an action directly.

**REQ-R-ABG3-FPC-011A**: F_D outcomes shall carry admitted authority-placement severity when they do not accept. The closed severity classes are `protocol_invalid`, `construction_context_invalid`, `diagnostic_shape_invalid`, and `content_unproven`.

**REQ-R-ABG3-FPC-011B**: ABG shall derive F_D pressure routing from severity plus evaluator-declared `consumedFieldRefs`. `protocol_invalid` and `construction_context_invalid` block. `diagnostic_shape_invalid` blocks only when the malformed field is consumed by downstream routing, execution construction, pressure projection, or closure; otherwise it preserves pressure and allows lawful construction to continue. `content_unproven` routes to F_P/content pressure rather than deterministic closure.

**REQ-R-ABG3-FPC-011C**: F_D authority-placement decisions shall be replay-visible runtime truth. The event spine shall preserve status, severity class, routing decision, affected field refs, consumed field refs, pressure refs, diagnostics, and evidence refs sufficient to replay the runner's block, continue, pressure-preserve, or F_P-route behavior.

**REQ-R-ABG3-FPC-011D**: Plugins may report deterministic evidence and affected fields, but they shall not own pressure-routing authority. If a plugin supplies a routing decision, ABG shall admit it only when it matches the routing derived from admitted severity and consumed-field truth.

**REQ-R-ABG3-FPC-011E**: `evaluateAction` shall consume one admitted construction intent, that action's complete admitted evidence set, the immutable workspace binding, and declared closure policy and shall emit one immutable `EdgeFulfillmentLedger` plus one closed `EdgeClosureDecision`. Only this complete governed F_D fold may create `close | yield | retry | repair | re-enter | reprice | block` action truth. F_P output, F_H response, process success, liveness, or any single evidence row shall not close work directly.

**REQ-R-ABG3-FPC-012**: The public construction read shall expose the one admitted `NextActionProjection` and terminal/action-evaluation truth without recomputation. Minimum rendered states are `construction_closed`, `construction_progressing_yield`, `construction_blocked`, `construction_stalled`, `construction_review_required`, `construction_escalated`, `fh_input_required`, `ticket_created`, and `reprice_required`.

**REQ-R-ABG3-FPC-013**: GTL/product bindings for `synthesizeModel`, `evalGap`, `evaluateNext`, `evaluateAction`, action-catalog publication, progress, escalation, and rendering shall resolve from the admitted program's declared graph-function, hook, and policy surfaces with visible fallback behavior. Hidden runtime config shall not satisfy override authority, and a shared helper shall not merge the four semantic authorities.

**REQ-R-ABG3-FPC-014**: One Surface shall compose with graph-span foldback, lawful reentry, and published refinement. `evaluateNext` may select same-edge repair, graph-span reentry, earlier/later graph-function invocation, F_H gate, ticket creation, or constitutional reprice only through a typed next-action result and existing reentry/change-class law. Every published inner refinement shall receive the same visible `synthesizeModel -> evalGap -> evaluateNext -> invoke|continue -> evaluateAction` chain; opaque worker-internal decomposition remains inside one bounded action.

**REQ-R-ABG3-FPC-015**: Downstream products shall consume construction progress, gaps, and next action through pure public projection or event replay. They shall not implement private model/gap/selection/evaluation, retry, continuation, or reentry loops to compensate for missing One Surface semantics.

**REQ-R-ABG3-FPC-016**: Deterministic tests shall cover distinct model/gap/next/action-evaluation authority, stable workspace binding across newer observations, public reads rendering admitted gap and ranking truth without evaluation, typed-asset-to-action binding, highest-value or blocking-asset ranking, bootstrap induction through published program rows, configured priority and tie-break law, affect review/F_H/escalation behavior, F_D ambiguity pressure, intent admission/rejection, current-intent continuation versus new-action admission, hook precedence, same-edge progress, published-refinement recursion, lawful reentry, stagnation, summary agreement, no-mutation reads, and adapter non-authority before runtime/live closure can be claimed.

**REQ-R-ABG3-FPC-017**: Construction event kinds that initiate, terminate, clip, or declip runtime fluent truth shall declare Event Calculus effects before implementation closure. Progress, stall, and summary states that are derivable from admitted events, material deltas, and policy shall be modeled as `RuntimeDerivedFluentRule` truth rather than primary event authority.

**REQ-R-ABG3-FPC-018**: When a construction episode is instantiated as the observer tier (the same episode law pointed at the system's own telemetry), the FPC-003 observation snapshot shall be over the declared observer observable set: replay event streams, gap_stop and halt-diagnosis projections, fold and terminal outcomes, retry and reentry histories, progress/stagnation ledgers, per-configuration cost rows, witness truth (reprice admissions, operator lifecycle events, hygiene stamps, the citability predicate), and constitutional-versus-projected drift facts. The observer's internal model is the constitutional surface itself.

**REQ-R-ABG3-FPC-019**: The observer tier's action catalog shall contain no constructive actions. Its lawful outcomes are the FPC-007 non-constructive set — typed block, F_H input, ticket or reprice proposal (triaged ticket drafts behind F_H ratification), escalation — plus lawful drill: view restriction to a narrower scope through published refinement boundaries. Recursion terminates at the human F_H seat reading the top layer's replay; the tier holds no downward control path. Observer and tuner shall remain separate judgment programs: an observer episode diagnoses and drafts tickets and shall not emit optimisation terms; diagnosis and policy rewrite never share one judgment.

**REQ-R-ABG3-FPC-020**: Type-mismatch glue shall be a declared carrier: a typed projection or a published graph function. When composition types fail to unify, the joint is a TYPED ADAPTER GAP that binds to catalog rows able to complete it per FPC-004D; undeclared inline coercion inside a worker turn, handler, or harness is inadmissible. Admission shall reject ill-typed composition plans before execution — the joint stays in the algebra or it does not exist.

**REQ-R-ABG3-FPC-021**: Narrative labels — ambiguity, confidence, entropy, adequacy, drift, danger, and their kin — shall bear on admission, selection authority, ratification, mode promotion or demotion, or closure only after resolving to admitted rows or typed gaps carried by ref. Unresolved labels are at most affect-class pressure under FPC-005B/-005C: they may adjust existing lawful bindings, never authorize. A tier decision citing a label without admitted-truth refs is inadmissible.
