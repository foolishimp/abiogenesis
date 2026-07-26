# REQ-R-ABG3-SAGA-FRONTIER — Event-Sourced Saga Frontier And Runtime Realization Transparency

**Status**: Active
**Lineage**: T-283 Product basis; T-284 bounded owner repair
**Category**: Constraint / Guarantee
**Date**: 2026-07-11
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [DESIGN_MODULE_METHOD.md](../../../.genesis/docs/standards/DESIGN_MODULE_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [GOALS.md](../../GOALS.md) GOAL-035, [PRODUCT.md](../../PRODUCT.md), [REQ-R-ABG3-EVENTS.md](./REQ-R-ABG3-EVENTS.md), [REQ-R-ABG3-PROJECTION.md](./REQ-R-ABG3-PROJECTION.md), [REQ-R-ABG3-WORKER.md](./REQ-R-ABG3-WORKER.md), [REQ-R-ABG3-POLICY.md](./REQ-R-ABG3-POLICY.md), [REQ-R-ABG3-FP-CONSCIOUSNESS.md](./REQ-R-ABG3-FP-CONSCIOUSNESS.md)

---

## Purpose

Define the ABG law for dependency-ready branch frontier realization without
changing product meaning when the same declared work runs serially, bounded
parallel, paused, retried, blocked, compensated, or escalated.

## Acceptance Criteria

**REQ-R-ABG3-SAGA-FRONTIER-001**: Product and GTL declarations shall identify lawful work, dependency meaning, steel-thread choice, fan-out opportunities, declared source/test/build/output targets, write territory or output allocation, evidence expectations, and fan-in meaning. The validator shall check those static relations, HoG shall traverse that declared topology, selected implementation bindings shall realize declared leaf effects, and ABG shall admit and replay the resulting runtime facts. ABG shall not own a scheduler or substitute an execution plan for the GTL topology.

**REQ-R-ABG3-SAGA-FRONTIER-002**: A product-declared dependency fan-out shall be an admitted traversal opportunity, not a command that forces concurrent dispatch. Serial execution of the same admitted fan-out shall preserve product meaning when closure expectations, dependency declarations, and evidence expectations are unchanged.

**REQ-R-ABG3-SAGA-FRONTIER-003**: A selected implementation binding may propose concurrent realization of GTL-declared branches only when replay-derived frontier truth, observed-state freshness, idempotency identity, branch lease truth, write-territory disjointness, and admitted runtime policy prove the batch safe. ABG shall admit or reject that proposal and its safety basis; HoG shall apply only the admitted traversal disposition, and selected implementation bindings shall realize only its leaf effects. Neither ABG nor an implementation selects undeclared branches or owns scheduling topology.

**REQ-R-ABG3-SAGA-FRONTIER-004**: If dependency isolation, observed-state freshness, idempotency, branch lease, write territory, fan-in, or policy truth is missing or underdeclared, ABG shall reject a concurrent-transition proposal. A selected implementation binding may return only a typed serialize, yield, block, or escalation proposal declared by GTL and policy; ABG shall admit or reject it, HoG shall apply only an admitted disposition, and selected implementation bindings shall realize only the resulting leaf effects. ABG and implementations shall not choose a route by applicability or infer product topology from filenames, prompt text, worker prose, wall-clock completion order, or local promise state.

**REQ-R-ABG3-SAGA-FRONTIER-005**: Branch identity shall distinguish stable logical branch identity from attempt identity. Retry, cancellation, lease expiry, or compensation shall open or supersede attempts without creating a new logical branch unless admitted correction or re-entry truth changes the logical work.

**REQ-R-ABG3-SAGA-FRONTIER-006**: Branch command and result admission shall be idempotent. Duplicate delivery of the same idempotency key and same payload digest shall not create a second logical fact. The same idempotency key with a different payload digest shall fail closed as an idempotency conflict. A new attempt for the same logical branch may admit a different payload under retry or supersession law.

**REQ-R-ABG3-SAGA-FRONTIER-007**: Dependency-frontier, branch-liveness, write-territory conflict, fan-in, and public progress surfaces shall be replay-derived projections over admitted runtime truth and existing ABG Event Calculus law. They shall not introduce a rival saga calculus, scheduler calculus, or runner-local state authority.

**REQ-R-ABG3-SAGA-FRONTIER-008**: A selected implementation binding shall realize branch effects with its native asynchronous primitives. The law is observational equivalence between serial and parallel realization of the same admitted frontier, not an implementation-owned topology or scheduling choice; the semantic runtime model shall not require a new orchestration framework.

**REQ-R-ABG3-SAGA-FRONTIER-009**: Runtime concurrency caps, transport limits, worker limits, resource caps, queueing behavior, timeout policy, cancellation policy, lease policy, and retry behavior shall be resolved from visible system-level configuration, runtime policy/default surfaces, liveness/watchdog policy, and admitted ABG runtime truth. The declared transition relation consumes that policy when producing a proposal; ABG admits or rejects the proposal, HoG applies an admitted traversal disposition, and selected implementation bindings realize its leaf effects. Hidden constants, product-local knobs, new config authorities, and an ABG-owned queue or scheduler shall not govern branch parallelism.

**REQ-R-ABG3-SAGA-FRONTIER-010**: Fan-in projection shall be deterministic and independent of branch wall-clock completion order unless a declared ordering law explicitly makes completion order meaningful.

**REQ-R-ABG3-SAGA-FRONTIER-011**: Branch output shall become visible to downstream branches only after admitted publication or merge under declared output allocation. Partial staging writes from cancelled, failed, or superseded attempts shall not become downstream input without admitted evidence and publication truth.

**REQ-R-ABG3-SAGA-FRONTIER-012**: Public construction progress shall be a read-only projection over admitted frontier, lease, dispatch, liveness, retry, compensation, closure, block, escalation, and fan-in truth. It shall not become a controller.

**REQ-R-ABG3-SAGA-FRONTIER-013**: System-level parallelism shall satisfy `DESIGN_MODULE_METHOD.md` Prime Law and functional-realization review. Frontier selection, fan-in, progress, and runner semantic state shall be immutable carriers/projections returned as new values. Native async tasks may operate over the shared mutable workspace only as explicit effect edges guarded by observed-state freshness, write territory or output allocation, staging/publication, idempotent admission, and replay truth. Shared mutable workspace state shall not become scheduler truth.

**REQ-R-ABG3-SAGA-FRONTIER-014**: GTL owns declared branch topology, traversal scope, dependency order, available consequence routes, and fan-in relations. The validator owns static checks over those declarations. HoG owns traversal and applies only ABG-admitted transition proposals. Selected implementation bindings own native leaf-effect realization. ABG owns admission of transition, branch, evidence, result, continuation, and replay truth. No one of those owners shall collapse the others into a rival scheduler, compiled plan, private queue authority, or controller-local state machine.
