# Constitutional Refinement Provenance (REQ-F-REFINE-*)

**Traces to**: INT-004
**Derived from**: V2 Roadmap Phase 3

Refinement operations (zoom, spawn, fold-back) must be constitutional — recorded automatically through the normal event path, not left to caller-side "remember to emit provenance." Topology refinement history must be reconstructable entirely from the event log.

### REQ-F-REFINE-001 — Zoom provenance is automatic

When an edge is expanded via zoom(), the provenance event is emitted through the normal event path without caller intervention.

**Acceptance Criteria**:
- AC-1: `zoom()` or its integration point emits a `zoomed` event recording edge name, fragment name, and internal edge names
- AC-2: The `zoomed` event is a Tier 2 control event (same tier as `edge_started`, `work_spawned`)
- AC-3: The graph topology at any point in time is reconstructable by replaying `zoomed` events
- AC-4: Calling `zoom()` without emitting provenance is a kernel violation, not a caller responsibility to remember

### REQ-F-REFINE-002 — Spawn provenance is automatic

When child work is created via spawn(), the `work_spawned` event is emitted through the normal event path as part of the operation.

**Acceptance Criteria**:
- AC-1: `spawn()` or its integration point emits a `work_spawned` event recording parent_key, child_key, and fragment name
- AC-2: The `work_spawned` event is emitted by the engine's normal event path — not manually appended by tests or callers
- AC-3: Child lineage is reconstructable entirely from `work_spawned` events in the stream
- AC-4: The scheduler's `active_work_keys()` discovers spawned children from `work_spawned` events as a normal input, not a utility function that happens to exist

### REQ-F-REFINE-003 — Refinement is replayable over ordinary reusable structure

The complete refinement history — what was zoomed, when, what children were spawned, what topology existed at each point — is derivable from the event log. Refinement operates over ordinary reusable Fragments with interfaces, not exotic one-off graph mutations.

**Acceptance Criteria**:
- AC-1: Replay of the event stream produces the same refinement history — all zoom and spawn operations are deterministically recoverable
- AC-2: No refinement state exists outside the event stream — no hidden imperative state in the command layer
- AC-3: The effective graph topology at event N is derivable by replaying events [0..N] and applying `zoomed` operations to the base Package
- AC-4: Zoom operations reference named Fragments with validated interfaces — refinement is structural, not arbitrary graph mutation
- AC-5: The same Fragment can be zoomed into multiple edges — reuse is ordinary, not exotic
- AC-6: V1 compatibility: when no refinement events exist, the base Package topology is the effective topology (degenerate case)
