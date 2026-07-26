# REQ-R-ABG3-SUPERVISOR-WITNESS — Supervisor As Admitted Actor

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-07-11
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [TICKET_METHOD.md](../../../.genesis/docs/standards/TICKET_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md) (the reflective boundary), [REQ-R-ABG3-EVENTS.md](./REQ-R-ABG3-EVENTS.md), [REQ-R-ABG3-PROJECTION.md](./REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-PROVENANCE.md](./REQ-R-ABG3-PROVENANCE.md), [REQ-R-ABG3-FP-CONSCIOUSNESS.md](./REQ-R-ABG3-FP-CONSCIOUSNESS.md), [T-217](../../../.ai-workspace/tickets/completed/T-217-consciousness-wave-higher-order-regulation.md) (absorbing [T-215](../../../.ai-workspace/tickets/completed/T-215-supervisor-as-admitted-actor.md))

---

## Purpose

Every supervisor or operator act over a run is a typed, actor-attributed,
replay-visible, admitted event. The monitor seat is a framework actor:
halt diagnosis, defect triage, mid-run law amendment, run lifecycle, and
evidence handling leave replay truth, and run citability is a mechanical
replay predicate rather than judgment. Witness truth is registrations
into the existing closed event universe plus replay-derived read models;
it introduces no new runtime store and no supervisor node kind.

## Acceptance Criteria

**REQ-R-ABG3-WITNESS-001**: ABG shall derive a typed halt-diagnosis projection for any halted or gap-stopped run: the implicated frontier, rejection or failure evidence refs, and attempt history, replay-derived without private diagnostic state.

**REQ-R-ABG3-WITNESS-002**: Defect intake from a halt shall be a typed triage record admitted as an event, carrying owner, change_class, and re-entry point per TICKET_METHOD. Ticket drafts shall be generated FROM admitted intake records; intake is the gap-to-intent seam of the reflective loop, and solutioning proceeds up to — never into — action.

**REQ-R-ABG3-WITNESS-003**: Resuming or continuing a run whose declaration, binding, or policy truth changed since the prior segment shall admit a `declaration_reprice_admitted` event carrying before/after digests, change_class, and the owning ticket ref. A substrate change without an admitted reprice event shall be a typed block, not a silent continuation.

**REQ-R-ABG3-WITNESS-004**: Frozen-law classification shall be a replay predicate: a run span is frozen-law exactly when it contains zero admitted reprice events. Frozen-law status shall not rest on operator assertion or post-hoc judgment.

**REQ-R-ABG3-WITNESS-005**: Each resumed segment shall stamp substrate identity (package/artifact identity and governing declaration digests) so mixed-substrate runs decompose per segment under replay.

**REQ-R-ABG3-WITNESS-006**: Operator run lifecycle shall be actor-attributed F_H events: at minimum `run_resumed` and `run_stopped` with a typed reason. Lifecycle acts that bypass event admission shall not exist on the operator path.

**REQ-R-ABG3-WITNESS-007**: ABG shall witness workspace hygiene over evidence surfaces: kernel digests at segment boundaries, detection and typed classification of foreign writes, and a copy-out diagnosis rule — diagnosis operates on copied-out artifacts, and foreign-written evidence is inadmissible for closure until re-measured.

**REQ-R-ABG3-WITNESS-008**: Citability shall be a replay predicate: converged AND zero reprice events AND hygiene clean. The citability projection shall expose which conjunct fails when a run is not citable.

**REQ-R-ABG3-WITNESS-009**: There shall be ONE operator-command/event grammar projected from the accepted public function-definition relation. Every operator interaction is a typed variant of exactly one derived public identity: workspace creation/opening map to `abg.operation.workspace.create` and `abg.operation.workspace.open`; pure catalog/status/result/evidence/replay/gap/action/observer/tuner reads map to `abg.operation.project.read`; product verification, resolution, installation, workspace binding, contribution admission, catalog narrowing, and declaration application map respectively to `abg.operation.product.verify`, `abg.operation.product.resolve`, `abg.operation.product.install`, `abg.operation.workspace.bind`, `abg.operation.catalog.admit`, `abg.operation.catalog.view`, and `abg.operation.catalog.apply`; invoke/start and continuation map to `abg.operation.run.invoke` and `abg.operation.run.continue`; typed F_H response and assessed-result admission map to `abg.operation.interaction.respond` and `abg.operation.result.assess`; witness acts and run lifecycle attestations map to `abg.operation.witness.admit`; tuner propose/ratify/reject map to `abg.operation.tuning.transition`; public GTL-program conformance, product-asset materialization, and qualified release materialization map to `abg.operation.conformance.evaluate`, `abg.operation.product.materialize`, and `abg.operation.release.snapshot`. Pure reads admit no events. Literal CLI spellings are ergonomic variant bindings, not operation identities. The abg CLI is the grammar's reference adapter, not the grammar itself: alternative operator surfaces are lawful only as adapters over the same typed admission and projection relations. A surface that bypasses the grammar is not an operator surface; tests driving a harness in-process are not operators.

**REQ-R-ABG3-WITNESS-010**: Campaign lifecycle shall join the operator grammar: run/resume/stop scenario commands replace raw harness invocation, environment and sandbox capabilities are declared command arguments, each command admits the operator lifecycle events, and a run is reproducible from its admitted operator-command line.

**REQ-R-ABG3-WITNESS-011**: Tier read surfaces shall be projections rendered through operator-grammar commands (in the reference adapter: CLI verbs): at minimum an observe-report command (gaps, drift, halts, citability) and draft review/ratify commands where ratification is itself an admitted F_H event. No tier surface may own a second truth store.

**REQ-R-ABG3-WITNESS-012**: Witness truth shall audit the supervisor role separation. A constructive act performed outside admitted work (bypassing the ticket effector) shall surface as a reprice or hygiene violation in replay; witness events record the separation, they do not substitute for it.

**REQ-R-ABG3-WITNESS-013**: Deterministic tests shall cover halt-diagnosis derivation, defect-intake admission and ticket-draft generation from it, reprice admission on changed substrate with block-on-missing-reprice, the frozen-law predicate over spans with and without reprice events, per-segment substrate stamps, operator lifecycle attribution, foreign-write detection with copy-out classification, the citability predicate and its failing-conjunct exposure, and operator-command-to-admitted-event conformance (for the reference adapter and for any alternative operator surface) before runtime/live closure can be claimed.

**REQ-R-ABG3-WITNESS-014**: Witness event kinds that initiate, terminate, clip, or declip runtime fluent truth shall declare Event Calculus effects before implementation closure. Frozen-law and citability states are replay-derived predicate truth, never primary event authority.

**REQ-R-ABG3-WITNESS-015**: The session's allowed graph-function set shall be an ADMITTED initial condition of the root frame, supplied through the operator grammar: a view restriction over the declared catalog (which remains declared module truth per FPC-004 — never harness-local configuration), enforced at selection/admission, inherited down recursive frames as narrowing only, with violations failing closed as typed selection rejections. Recursive graph-function execution inside the session is bounded by exactly this admitted view.

**REQ-R-ABG3-WITNESS-016**: Replay-log attestation shall be witness truth: the attestation digest shall chain over the full canonical event content of the attested span in admission-ordinal order, so that insertion, removal, or reorder inside an attested span is tamper-evident under cross-process re-derivation from the log alone. Attestation is admitted via the witness event family (`replay_log_attested`); a digest over event ids, counts, or partial fields shall not satisfy attestation.

**REQ-R-ABG3-WITNESS-017**: Admission of a changed execution-authority basis or immutable workspace binding onto a spine previously run under another such identity shall fail closed as a typed block (`basis_fork_detected`) unless a covering declaration reprice names the exact identity pair being crossed. A newer `ObservationSnapshot`, replay cursor, readiness result, worksite digest, or projection under the same authority basis is ordinary progress and shall not trigger this guard. At the runner the authority-fork block is a typed fail-closed startup result; the guard applies at the runner and at every operator route; no operator surface may continue a run across an authority fork without the covering admitted reprice.

Gap: typed basis-fork results at operator routes are unrealized — the routes refuse the fork but fail untyped (a raw thrown error carrying the `basis_fork_detected` reason) rather than returning typed blocked truth. Owner: T-244 routing; implementation requires a singular realization leaf.

**REQ-R-ABG3-WITNESS-018**: A route-grade basis reconstructable from replay may act on an existing run's spine without traversing it, carrying only admitted identity fields. Full traversal requires an execution basis carrying graph, module, and intent. Operator routes that only read, diagnose, attest, or route shall not be forced to reconstruct an execution basis, and a route-grade basis shall never advance, close, or materialize traversal truth.
