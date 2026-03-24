# Event Calculus Foundation (REQ-F-EC-*)

**Traces to**: INT-001, INT-004

### REQ-F-EC-001 — Five prime operators as the basis set

The engine uses exactly five prime event types. All other events are derived.

**Acceptance Criteria**:
- AC-1: Exactly five prime types: `found`, `approved`, `assessed`, `revoked`, `intent_raised`
- AC-2: All other event types are **Tier 2 control events** — they do not initiate or terminate fluents. The control-event registry includes (illustrative, not exhaustive):
  - **Scheduler control:** `edge_started`, `fp_dispatched`, `fh_gate_pending`, `edge_converged`
  - **Correction control:** `reset` — creates a certification boundary that shadows prior F_P certifications (REQ-F-CORRECT-002)
  - **Refinement control:** `work_spawned`, `zoomed` — topology provenance (REQ-F-REFINE-001, REQ-F-REFINE-002)
  - **Run lifecycle:** `run_queued`, `run_started`, `run_dispatched`, `run_pending`, `run_assessed`, `run_failed`, `run_timed_out`, `run_superseded` — inform retry, timeout, and observability (REQ-F-RUN-001). These are strictly observational — they never initiate or terminate fluents
  - **Leaf task lifecycle:** `leaf_task_started`, `leaf_task_completed`, `leaf_task_failed` — subordinate to run lifecycle (REQ-F-LEAF-002)
  - New Tier 2 event types may be added without changing the EC foundation — they remain control-only by definition
- AC-3: Each prime type has a `kind` discriminator that determines its EC role

| Prime | Kind discriminator | EC role |
|-------|-------------------|---------|
| `found` | `fd_findings`, `fd_gap` | `happensAt` only — `fd_findings`: F_D findings carried into F_P escalation; `fd_gap`: terminal deterministic gap (no F_P path or F_P certified) |
| `approved` | `fh_review`, `fh_intent` | `initiates operative(edge, wk, wv)` |
| `assessed` | `fp` (pass/fail), `fh_review` (reject) | `initiates certified(edge, wk, ev, spec_hash, wv)` or `happensAt` |
| `revoked` | `fh_approval`, `fp_assessment` | `terminates operative(edge, wk, wv)` or `terminates certified(edge, wk, ev, spec_hash, wv)` |
| `intent_raised` | — | `happensAt` only — homeostatic signal |

`wk` = `work_key`. **Degenerate case:** when `work_key` is absent, fluents are scoped by `(edge, wv)` alone (REQ-F-WK-003 AC-4).

### REQ-F-EC-002 — Two fluents: operative and certified

Convergence state is modelled as two Event Calculus fluents. Both fluents have symmetric initiation and termination operations.

**Acceptance Criteria**:
- AC-1: `operative(edge, work_key, wv)` — initiated by `approved{fh_review|fh_intent}`, terminated by `revoked{fh_approval}`
- AC-2: `certified(edge, work_key, evaluator, spec_hash, wv)` — initiated by `assessed{fp, result: pass}`, terminated by `revoked{fp_assessment}` or spec_hash mismatch. Additionally shadowed (not terminated) by `reset` boundaries (REQ-F-CORRECT-002 AC-3)
- AC-3: Both fluents are parameterised by workflow_version — approvals from one version do not satisfy another (unless carry-forward, REQ-F-PROV-004)
- AC-4: Both fluents support explicit event-calculus termination — the F_ algebra requires symmetric `{initiate, terminate, query}` operations across all functor types
- AC-5: **Degenerate case:** when `work_key` is absent, fluents are scoped by `(edge, wv)` alone. A pass/approval without `work_key` satisfies only global queries, not work-key-scoped queries (REQ-F-WK-003)

### REQ-F-EC-003 — Three convergence models

Each evaluator type has a distinct convergence test.

**Acceptance Criteria**:
- AC-1: F_D: live execution — re-runs every iteration, stateless
- AC-2: F_H: fluent projection — `holdsAt(operative(edge, work_key, wv), now)`
- AC-3: F_P: fluent projection — `holdsAt(certified(edge, work_key, evaluator, spec_hash, wv), now)`. Projection observes both termination (`revoked`) and shadowing (`reset` boundary) — a certified fluent that predates an applicable reset boundary does not hold (REQ-F-CORRECT-002 AC-3)
- AC-4: **Degenerate case:** when `work_key` is absent, projection queries match events without `work_key` only

### REQ-F-EC-004 — Revocation terminates fluents symmetrically

Revocation withdraws prior convergence authority. Both fluents (`operative` and `certified`) support explicit termination via `revoked` events, preserving the F_ algebra symmetry.

**Acceptance Criteria**:
- AC-1: `revoked{kind: fh_approval}` terminates the `operative` fluent — does not reference a specific `approved` event
- AC-2: `revoked{kind: fp_assessment}` terminates the `certified` fluent — does not reference a specific `assessed` event
- AC-3: Both are scoped by `edge`, `work_key` (when present), and `workflow_version`
- AC-4: **Legacy replay shim (superseded):** Wildcard edge (`"*"`) terminates the target fluent for all edges. Retained only for replaying existing V1 event streams. Not available for new work — V2 uses lineage-scoped revocation (REQ-F-CORRECT-001)
- AC-5: **Degenerate case:** when `workflow_version == "unknown"`, revocations match by `(edge, work_key)` — workflow_version scoping is dropped but work_key scoping is preserved. When both `work_key` and `workflow_version` are absent, matching falls back to edge alone
- AC-6: A revocation that predates all initiating events for its edge has no effect
- AC-7: `revoked{kind: fh_approval}` and `revoked{kind: fp_assessment}` are independent — revoking one does not affect the other

### REQ-F-EC-005 — Rejection is judgment, not revocation

Rejection and revocation are distinct operations with different EC semantics.

**Acceptance Criteria**:
- AC-1: Rejection (`assessed{kind: fh_review, result: reject}`) is `happensAt` only — no fluent terminated
- AC-2: Proxy rejection halts the auto-loop for that work instance (edge + work_key) in the current session
- AC-3: Revocation (`revoked{kind: fh_approval}`) terminates `operative(edge, work_key, wv)` — the gate reopens

### REQ-F-EC-006 — assessed{kind: fp} result values

F_P assessment results have defined semantics.

**Acceptance Criteria**:
- AC-1: `result: "pass"` — evaluator satisfied, `certified` fluent initiated
- AC-2: `result: "fail"` — evaluator not satisfied, no fluent change, F_P may be re-dispatched
- AC-3: For `assessed{kind: fh_review}`: `result: "reject"` — human judgment that work is insufficient (see REQ-F-EC-005)
