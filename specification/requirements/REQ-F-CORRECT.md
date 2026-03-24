# Corrective Operations (REQ-F-CORRECT-*)

**Traces to**: INT-005
**Derived from**: V2 Roadmap — Saga compensation notes (semantic correction, not rollback)

Corrective operations are semantically distinct, scoped to work lineage, and replayable. Compensation (targeted revocation within a work_key lineage) and administrative reset (scope-wide re-evaluation) are separate mechanisms — they are never conflated. The event log remains truthful and distributed recovery is lawful.

### REQ-F-CORRECT-001 — Compensation is scoped to work lineage, not global rollback

Semantic correction of prior work operates within a work_key lineage — it does not globally invalidate unrelated convergence.

**Acceptance Criteria**:
- AC-1: A `revoked` event targets a specific fluent instance scoped to a work_key lineage — not a blanket edge invalidation. The target shape matches the EC fluent being terminated: `operative(edge, work_key, wv)` for F_H revocation, `certified(edge, work_key, evaluator, spec_hash, wv)` for F_P revocation (REQ-F-EC-004)
- AC-2: Revocation within one work_key lineage does not affect convergence of sibling or parent work_keys unless the parent's fold-back projection changes as a result
- AC-3: Corrective work (new attempts on the same work_key after revocation) is the normal recovery path — not deletion of history
- AC-4: The event log after correction is truthful: original work, revocation, and corrective work are all visible

### REQ-F-CORRECT-002 — Administrative reset is a distinct control operator

Resetting a workspace or work_key to re-evaluate from scratch is a different operation from revoking a specific certification. The event model must distinguish them.

**Acceptance Criteria**:
- AC-1: `reset` is a Tier 2 control event distinct from `revoked` — it signals "re-evaluate everything under this scope" rather than "this specific certification was wrong"
- AC-2: Reset targets a scope (work_key, edge, or workspace) — it does not forge individual revocation events for each certification
- AC-3: After a reset, delta() recomputes from the current state — prior certifications are not destroyed, but the system re-evaluates whether they still hold
- AC-4: Reset is auditable: the event log records who requested it, what scope, and when

### REQ-F-CORRECT-003 — Compensation and reset are replayable and semantically distinct

Both corrective paths must be reconstructable from the event log with clear semantic intent.

**Acceptance Criteria**:
- AC-1: Replay of the event stream correctly distinguishes compensation (targeted revocation + corrective work) from reset (scope-wide re-evaluation)
- AC-2: No corrective operation destroys event history — the log is append-only through all corrections
- AC-3: The effective convergence state after any sequence of corrections is derivable by replaying the full event stream — no hidden out-of-band state
- AC-4: **Legacy replay shim:** existing `revoked{edge: "*"}` events without work_key scoping are interpreted as workspace-scope reset during replay. Concrete-edge `revoked` events without work_key retain their original edge-scoped revocation meaning — they are not promoted to reset. Neither form is available for new work
