# REQ-R-ABG3-PROJECTION — Replay And Projection

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define replay-derived fluents and projections as the sole lawful current-state
surface over ABG runtime truth.

## Acceptance Criteria

**REQ-R-ABG3-PROJECTION-001**: Projection shall be deterministic. The same event stream and declared inputs shall always yield the same projection result.

**REQ-R-ABG3-PROJECTION-002**: Durable runtime truth shall be derived by replay. ABG shall not write fluent state as a rival authority surface.

**REQ-R-ABG3-PROJECTION-003**: ABG shall provide explicit projections for at minimum `run`, `graph_call`, `frame`, and `continuation`.

**REQ-R-ABG3-PROJECTION-004**: If replay cannot determine what currently holds from event truth alone, the event/projection model is constitutionally incomplete.

**REQ-R-ABG3-PROJECTION-005**: Snapshot, checkpoint, or state-summary surfaces may exist as replay aids, but they shall not override replay-derived truth.

**REQ-R-ABG3-PROJECTION-006**: Callable truth, frame truth, and continuation truth shall not be hidden as implicit side effects inside run projection alone.

**REQ-R-ABG3-PROJECTION-007**: ABG shall provide replay-derived projection over actor/process supervision events when process-boundary dispatch is used. The projection shall expose process identity when available, stream evidence references, latest heartbeat or liveness observation, timeout state, signal sequence, exit status, exit signal, runtime error, and final observed actor result.

**REQ-R-ABG3-PROJECTION-008**: Process liveness, timeout, and stream-observation state shall be projected from admitted actor/process events. A downstream product shall not infer child-process state from terminal transcript text, polling side effects, or product-local mutable controller state.

**REQ-R-ABG3-PROJECTION-009**: Retry-frontier projection shall preserve the full retry attempt frontier for the active traversal boundary, including prior attempt identities, reason classes, owner surfaces, source event kinds, and attempt coverage. A latest-only dossier or product-local summary shall not satisfy full-frontier projection.

**REQ-R-ABG3-PROJECTION-010**: A structural assertion that a supplied projection is full shall validate row shape, deterministic identity, reason-class coverage, and retry-attempt coverage. Closure-critical consumers should prefer replay-derived projections or compare supplied projections against replay-derived truth.

**REQ-R-ABG3-PROJECTION-011**: Public runtime summaries, CLI surfaces, and downstream consumer projections that describe traversal non-progress shall render the same ABG-derived continuation action. A carrier may record process facts and a projection may decide the next action, but there shall be one authoritative action truth for a given event stream.

**REQ-R-ABG3-PROJECTION-012**: Traversal modulation projection shall be deterministic over GTL qualifier truth, current basis, admitted schedule refs, admitted progress rows, backend progress classification, forced-review gates, and existing non-progress/foldback/reentry projections. Public summaries and downstream consumers shall not publish a rival next action for the same event stream.

**REQ-R-ABG3-PROJECTION-013**: `HoldsAt` truth shall be derived by replay over admitted runtime events, declared Event Calculus effects, initial fluent truth, clipping, and derived-fluent rules. Projection modules may present read models over those fluents, but shall not own untraceable rival transition law.

**REQ-R-ABG3-PROJECTION-014**: Temporal projection shall be a replay-derived read model over admitted timer, deadline-breach, and scheduled-continuation events. It may change eligibility, deadline-breach pressure, and drift observations, but it shall not select graph advancement, close vectors, or outrank ABG aggregate projection.

**REQ-R-ABG3-PROJECTION-015**: Schedule, SLA, and temporal drift shall feed a homeostatic projection/evaluation surface separate from traversal-completeness projection. Edge closure remains governed by existing ABG traversal and evaluator law.

**REQ-R-ABG3-PROJECTION-016**: ABG shall provide one replay-derived runtime liveness observer projection over admitted probe activity, actor/process lifecycle events, runtime asset observations, artifact observations, structured traversal observations, inactivity policy, external interruption evidence, and retry budget inputs. Runtime asset observations include event log append, ledger append/update, manifest creation/update, projection/report/dossier creation, archive/sidecar writes, and PTY or stream capture updates when they are used as activity evidence. Public runtime summaries, watchdog logic, and downstream consumers shall read liveness and disposition from that projection rather than recomputing it from local process state, file polling, transcript text, or harness timers.

**REQ-R-ABG3-PROJECTION-017**: The runtime liveness observer projection shall expose probe coverage, active systems, inactive systems, interrupted systems, last activity, last artifact observation, current lease state, hard-safety-cap state, and one runtime invocation disposition. The disposition shall distinguish continue waiting, controlled termination, retry, yield continuation, block, inspect archive, escalate, and policy reprice.

**REQ-R-ABG3-PROJECTION-018**: Overlay-frame projection shall be replay-derived from overlay-frame declaration and evaluation events plus admitted observed-state truth. A projection shall reject predicate evaluations whose satisfied or missing-ref state cannot be derived from the observed-state projection, and overlay completion shall not clear pressure unless declared clearing evidence is admitted or a declared no-close policy preserves the pressure.

**REQ-R-ABG3-PROJECTION-019**: ABG shall provide one replay-derived continuation-transition projection for the active traversal boundary when continuation, retry, liveness, assurance, or terminal fallback facts may affect the next runtime action. Typed admitted runtime facts and assurance fold outcomes outrank terminal retry fallback refs. Terminal retry refs are evidence and may select retry only when no higher-priority typed transition fact exists. Unknown or unsupported mixed states shall fail closed with provenance refs rather than dispatching a new worker attempt.

**REQ-R-ABG3-PROJECTION-020**: Evaluation scope refs used by evaluation, assurance, iteration, or progress read models shall be replay-derived or admitted facts bound to the current graph call, frame, graph function, graph vector, vector index, selected composition, and declared scope topology. Projection shall not synthesize scoped current-state truth from rendered prompts, diagnostic text, filenames, or product-local controller memory.

**REQ-R-ABG3-PROJECTION-021**: ABG shall provide a replay-derived executive
observation projection over existing graph-function environment, workspace
context, replay event refs, payload ledger refs, evidence refs, requirement
refs, residual pressure refs, continuation refs, and span-lineage refs. This
projection is a read model for the executive evaluator; it shall not emit
runtime events, write ledgers, mutate the observed graph/workspace, or create a
parallel observation/workspace ontology.
