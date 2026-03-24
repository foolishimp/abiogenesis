# Bounded Leaf Tasks (REQ-F-LEAF-*)

**Traces to**: INT-005
**Derived from**: V2 Roadmap Phase 5, OpenClaw lessons

Leaf tasks are bounded, schema-driven sub-work units that execute within a graph traversal without flattening the engine. They are subordinate to graph traversal — not a substitute for it. The pattern provides disciplined agent sub-work for narrow transforms and structured queries.

### REQ-F-LEAF-001 — Leaf task surface is bounded and schema-driven

Leaf tasks have explicit input/output schemas, bounded execution, and constrained capabilities.

**Acceptance Criteria**:
- AC-1: A leaf task has a declared input schema (JSON) and output schema (JSON) — structurally validated before dispatch and after return
- AC-2: Leaf tasks have an explicit timeout — no unbounded execution
- AC-3: Leaf tasks are toolless by default — they receive context and produce structured output without filesystem access, network access, or subprocess invocation unless explicitly granted
- AC-4: Leaf task execution is atomic from the caller's perspective — it either produces a valid output or fails

### REQ-F-LEAF-002 — Leaf tasks integrate with run governance

Leaf task execution follows the same run lifecycle as F_P dispatch.

**Acceptance Criteria**:
- AC-1: Each leaf task execution gets a `run_id` — attempt identity is preserved
- AC-2: Leaf task state transitions (queued, started, completed, failed, timed_out) are recorded in the event stream
- AC-3: Leaf task failures are classified using the same taxonomy as run governance (transport, no_output, bad_output)
- AC-4: Leaf tasks are retryable — transient failures trigger retry under the same rules as REQ-F-RUN-004

### REQ-F-LEAF-003 — Leaf tasks are subordinate to graph traversal

Leaf tasks exist within the iterate loop — they do not replace graph edges or bypass the convergence model.

**Acceptance Criteria**:
- AC-1: A leaf task is dispatched WITHIN an iterate() call, not as a separate graph edge
- AC-2: Leaf task output contributes to the parent edge's convergence — it does not produce its own convergence state
- AC-3: The number of leaf tasks per iterate() call is bounded — no unbounded task spawning within a single iteration
- AC-4: V1 compatibility: engines without leaf task support continue to use direct F_P dispatch — leaf tasks are additive
