# REQ-R-ABG3-EVENTS — Event Truth And Emission

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define the ABG 3 event substrate as the only written runtime truth surface.

## Acceptance Criteria

**REQ-R-ABG3-EVENTS-001**: `emit()` shall remain the only lawful write path. The event stream shall be append-only.

**REQ-R-ABG3-EVENTS-002**: Event truth shall be rich enough that runtime truth is reconstructable by replay from events plus declared GTL surfaces alone.

**REQ-R-ABG3-EVENTS-003**: The canonical event envelope shall carry immutable engine-assigned `event_id`, immutable system-assigned `event_time`, aggregate identity, causal/correlation identity, and explicit runtime references sufficient for replay.

**REQ-R-ABG3-EVENTS-004**: Canonical aggregate types shall include at minimum `run`, `graph_call`, `frame`, and `continuation`.

**REQ-R-ABG3-EVENTS-005**: Vector-local traversal facts shall attach to the nearest enclosing runtime aggregate. Vector shall never be its own runtime aggregate.

**REQ-R-ABG3-EVENTS-006**: Lifecycle open/close/fail/rebound events shall remain authoritative truth. Snapshot or checkpoint events may assist replay but shall not replace authoritative lifecycle facts.

**REQ-R-ABG3-EVENTS-007**: ABG shall observe process-boundary runtime facts only. It shall not constitutionalize internal chain-of-thought, hidden tactic steps, or private decomposition inside probabilistic workers.

**REQ-R-ABG3-EVENTS-008**: When ABG yields on unresolved non-blocking post-transform observer truth, the yielded handoff and its causing observer facts shall be emitted as authoritative event truth rather than inferred from absence of terminal failure.

**REQ-R-ABG3-EVENTS-009**: Long-running supervised dispatch shall emit enough progress, artifact-observation, stall, salvage, and terminal facts that operator-grade live status can be replay-projected without hidden controller memory.

**REQ-R-ABG3-EVENTS-010**: The canonical event envelope shall preserve at minimum event identity, event time, event type, aggregate type, aggregate identity, parent aggregate identity when present, causation identity, correlation identity, workflow version, work key, run identity, semantic job identity, graph-function identity, materialization identity, frame attempt identity, frame lineage identity, vector identity when present, and closed event data.

**REQ-R-ABG3-EVENTS-011**: Authoritative event truth shall cover at minimum run lifecycle, graph-call lifecycle, frame lifecycle, vector-local traversal and dispatch facts, proof and closure facts, continuation lifecycle, correction, and supersession.

**REQ-R-ABG3-EVENTS-012**: Actor/process supervision facts shall be authoritative ABG event truth when a traversal dispatch crosses a local or external process boundary. Product-local transcripts, terminal logs, or controller memory shall not replace these events.

**REQ-R-ABG3-EVENTS-013**: The actor/process event family shall preserve enough source facts to replay at minimum actor invocation start, process start or spawn failure, stdout chunk observation, stderr chunk observation, heartbeat or liveness observation, timeout observation, termination signal request, process exit, result-artifact observation, and actor invocation closure or failure.

**REQ-R-ABG3-EVENTS-014**: Spawn failure, unavailable command, path drift, sandbox/runtime denial, timeout, signal termination, and nonzero exit shall be emitted as typed runtime facts. Such failures shall not crash admission, disappear into stderr text, or be represented only as absent result artifacts.

**REQ-R-ABG3-EVENTS-015**: Actor/process events shall carry the run, graph function, graph call, frame, vector, actor invocation, worker binding, causation, and correlation identities needed to connect process evidence back to the active traversal boundary by replay.

**REQ-R-ABG3-EVENTS-016**: Traversal modulation runtime truth shall be admitted as replay-visible event truth. The minimum event family shall include modulation resolution, attempt-envelope derivation, attempt dispatch, progress observation, non-progress classification, forced-review projection, same-edge continuation planning, and modulation exhaustion.

**REQ-R-ABG3-EVENTS-017**: Traversal modulation events shall preserve basis, graph function, run, work key, graph call, frame, frame lineage, vector, edge, causation refs, and correlation id sufficient to replay the modulation projection without runner-local state.

**REQ-R-ABG3-EVENTS-018**: ABG event kinds that change runtime fluent truth shall have declared Event Calculus effects. The declaration shall identify the fluents initiated, terminated, clipped, and declipped by the admitted event kind.

**REQ-R-ABG3-EVENTS-019**: Temporal provider effects shall become ABG runtime truth only through admitted temporal events. Timer intent, timer outcome, deadline-breach, and scheduled-continuation events shall preserve basis, graph function, graph call, frame, vector, edge, policy, provider, causation, and correlation identity. Deadline-breach events shall also preserve the deadline ref and policy-selected breach action.

**REQ-R-ABG3-EVENTS-020**: Traversal strategy selection shall use one canonical GTL declaration surface: `GraphVector.declarations["abg.traversal_strategy"]`, `GraphFunction.declarations["abg.default_traversal_strategy"]`, and `Role.policyHooks["abg.traversal_strategy"]`. Legacy or alternate traversal-modulation key spellings shall not be admitted as compatibility surfaces.
