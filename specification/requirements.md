# Genesis V1 — Requirements

**Derived from**: `spec/packages/genesis_core.py` (the GTL Package IS the spec)
**Traces to**: INT-001
**Status**: Approved
**Date**: 2026-03-15

These REQ keys are the traceability thread. Every design ADR, every code file, every test must tag back to these keys. The GTL Package in `genesis_core.py` is authoritative — these keys are derived from it, not independent of it.

---

## Core Functions (REQ-F-CORE-*)

### REQ-F-CORE-001 — iterate()
The engine provides `iterate(job) → events`.

**What**: Given a Job (edge + evaluators + context), execute one convergence cycle: invoke the constructor (F_P or F_D), run all evaluators, compute delta, emit events. Return the events produced.

**Acceptance Criteria**:
- AC-1: `iterate(job)` invokes the constructor defined in `job.edge.using`
- AC-2: After construction, all evaluators in `job.evaluators` are run
- AC-3: At least one event is emitted per iterate() call (iteration_started, iteration_completed, or convergence_achieved)
- AC-4: `iterate()` never writes to the event log directly — it calls `emit()`
- AC-5: If all evaluators pass (delta = 0), emits `convergence_achieved`

### REQ-F-CORE-002 — project()
The engine provides `project(stream, asset_type, instance_id) → Asset`.

**What**: Derive the current state of an asset from the event stream. Assets are projections, never stored objects. Same stream + same args = same asset (determinism invariant).

**Acceptance Criteria**:
- AC-1: Given an event stream, `project()` returns the current candidate for the specified asset and instance
- AC-2: Projection is deterministic — same inputs always produce the same output
- AC-3: Projection for instance I never reads events of instance J (isolation invariant)
- AC-4: `project()` is a pure read — no writes, no side effects

### REQ-F-CORE-003 — emit()
The engine provides `emit(event_type, data)` — the F_D-controlled event log write.

**What**: The only admissible write path to `events.jsonl`. Assigns `event_time` from system clock. Appends atomically. F_P constructs content; emit() writes the log entry.

**Acceptance Criteria**:
- AC-1: `emit()` assigns `event_time` from system clock — no caller can override it
- AC-2: `emit()` appends atomically to `events.jsonl` — no partial writes
- AC-3: `emit()` enforces the event schema (event_type, event_time, project, data fields required)
- AC-4: `emit()` never modifies or deletes existing entries

### REQ-F-CORE-004 — bind_fd()
The engine provides `bind_fd(job, stream) → PrecomputedManifest`.

**What**: F_D pre-computation phase. Before any F_P invocation, run all F_D evaluators, select relevant contexts, compute delta. Produces a PrecomputedManifest that minimises F_P attention loading: only failing evaluators and relevant contexts are included.

**Acceptance Criteria**:
- AC-1: `bind_fd()` runs all F_D evaluators in `job.evaluators` and records pass/fail
- AC-2: Passing evaluators are excluded from the manifest (F_P doesn't need to see them)
- AC-3: Relevant context files are selected by tag-matching against the failing evaluators
- AC-4: Returns `PrecomputedManifest` with: `current_asset`, `failing_evaluators`, `fd_results`, `relevant_contexts`, `delta_summary`
- AC-5: If all F_D evaluators pass, manifest signals `fd_gate_passed = True`

### REQ-F-CORE-005 — delta()
The engine provides `delta(candidate, evaluators) → float`.

**What**: Measure convergence. Returns 0.0 when all evaluators pass, >0 when gaps remain. Used by the iterate() loop to decide whether to continue or stop.

**Acceptance Criteria**:
- AC-1: `delta()` returns 0.0 iff all evaluators in the list pass
- AC-2: `delta()` returns a value proportional to the fraction of failing evaluators
- AC-3: `delta()` is pure — no side effects, no event writes

### REQ-F-CORE-006 — schedule()
The engine provides `schedule(workspace) → (feature, edge) | None`.

**What**: Select the next (feature, edge) to iterate, using the priority tiers: time-box expiring → closest-to-complete → explicit priority → recently touched. Returns None when all features are converged.

**Acceptance Criteria**:
- AC-1: `schedule()` reads feature vectors from `.ai-workspace/features/active/`
- AC-2: Priority tier 1: features with expiring time-boxes first
- AC-3: Priority tier 2: features with fewest unconverged edges remaining
- AC-4: Priority tier 3: explicit `priority` field in feature vector
- AC-5: Returns `None` when no unconverged edges exist
- AC-6: For the selected feature, returns the first unconverged edge in topological order

---

## Commands (REQ-F-CMD-*)

### REQ-F-CMD-001 — gen-start
The engine provides `gen-start` — state-driven routing entry point.

**What**: Detect workspace state (8 states), route to the correct action. For IN_PROGRESS state, call schedule() then dispatch to gen-iterate. The engine owns all logic and events; gen-start owns only the MCP handoff.

**Acceptance Criteria**:
- AC-1: Detects 8 states: UNINITIALISED, NEEDS_CONSTRAINTS, NEEDS_INTENT, NO_FEATURES, IN_PROGRESS, ALL_CONVERGED, ALL_BLOCKED, STUCK
- AC-2: State is derived from workspace artifacts — never stored
- AC-3: IN_PROGRESS → calls schedule(), then emits exit code 2 (fp_dispatched) with manifest path
- AC-4: ALL_CONVERGED → exits 0 with status message
- AC-5: F_H required → exits 3 with gate criteria
- AC-6: `--auto` flag loops until converged or blocked
- AC-7: `--human-proxy` requires `--auto`; performs F_H evaluation per §XIX protocol

### REQ-F-CMD-002 — gen-iterate
The engine provides `gen-iterate` — universal iteration function.

**What**: One edge, one iteration. Load context, run bind_fd, invoke constructor (F_P via MCP or F_D subprocess), run evaluators, emit events. Works for any edge in the graph.

**Acceptance Criteria**:
- AC-1: `--feature` and `--edge` select the work unit
- AC-2: Calls `bind_fd()` before any F_P invocation
- AC-3: For F_P edges: writes manifest to `builds/claude_code/.workspace/manifests/`, exits 2
- AC-4: For F_D edges: runs the deterministic operator directly
- AC-5: Emits `iteration_completed` event with delta, evaluator results, and artifact hashes
- AC-6: Emits `convergence_achieved` when delta = 0

### REQ-F-CMD-003 — gen-gaps
The engine provides `gen-gaps` — traceability validation.

**What**: Three-layer validation: Layer 1 (REQ tag coverage in code/tests), Layer 2 (test gap analysis — every REQ key has ≥1 test), Layer 3 (telemetry gaps — advisory). Emits `gaps_validated` event.

**Acceptance Criteria**:
- AC-1: Layer 1: scans `builds/claude_code/code/` for `Implements: REQ-*` tags
- AC-2: Layer 1: scans `builds/claude_code/tests/` for `Validates: REQ-*` tags
- AC-3: Layer 2: every REQ-* key in this requirements doc has ≥1 test tagging it
- AC-4: Reports pass/fail per layer with gap list
- AC-5: Emits `gaps_validated` event to `.ai-workspace/events/events.jsonl`

---

## Workspace (REQ-F-WKSP-*)

### REQ-F-WKSP-001 — Workspace state projection
Workspace state is derived from the event stream on every invocation — never stored.

**Acceptance Criteria**:
- AC-1: Feature convergence status computed by projecting events — no cached state file
- AC-2: `genesis context` command prints current project state derived from events
- AC-3: Project state includes: features in-progress, converged features, last events, blocked features

### REQ-F-WKSP-002 — Feature vector management
Feature vectors tracked in `.ai-workspace/features/active/*.yml` and `completed/*.yml`.

**Acceptance Criteria**:
- AC-1: Active feature vectors have: feature, title, requirements, trajectory (per-edge status), status
- AC-2: On full convergence (all edges pass), feature is moved to `completed/`
- AC-3: Feature vector `trajectory` section records evaluator results per edge

---

## Quality (REQ-NFR-*)

### REQ-NFR-TEST-001 — Test coverage
Unit test coverage ≥ 80%; all tests pass.

**Acceptance Criteria**:
- AC-1: `pytest builds/claude_code/tests/ -q` → 0 failures, 0 errors
- AC-2: Coverage report shows ≥ 80% for all modules under `builds/claude_code/code/`

### REQ-NFR-E2E-001 — Sandbox E2E
Fresh sandbox run creates working code+tests.

**Acceptance Criteria**:
- AC-1: From a clean directory, install genesis + run gen-start → produces code + tests
- AC-2: Tests produced in the sandbox pass
- AC-3: Sandbox run produces correct events in events.jsonl

### REQ-NFR-SELF-001 — Self-hosting gate (Phase 4+)
Abiogenesis uses genesis to build its next iteration.

**Acceptance Criteria**:
- AC-1: Running `gen-start` in abiogenesis with the engine from `builds/claude_code/code/` (not `.genesis/`) produces valid output
- AC-2: The output engine passes all unit tests and sandbox E2E

---

## Key Counts

| Category | REQ Keys |
|----------|----------|
| Core functions | REQ-F-CORE-001 through REQ-F-CORE-006 (6) |
| Commands | REQ-F-CMD-001 through REQ-F-CMD-003 (3) |
| Workspace | REQ-F-WKSP-001, REQ-F-WKSP-002 (2) |
| Quality | REQ-NFR-TEST-001, REQ-NFR-E2E-001, REQ-NFR-SELF-001 (3) |
| **Total** | **14 REQ keys** |
