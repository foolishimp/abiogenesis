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

### REQ-F-CORRECT-002 — Reset is a certification boundary, not a revocation

Reset creates a temporal boundary in the event stream that shadows prior F_P certifications within scope. It does not terminate fluents, forge individual revocations, or destroy event history. It forces re-certification after the boundary.

**Acceptance Criteria**:
- AC-1: `reset` is a Tier 2 control event distinct from `revoked`. It carries a scope and creates a certification boundary — not a fluent termination
- AC-2: Reset targets a scope at one of three granularities:
  - **Workspace:** shadows all certifications in the workspace
  - **Work_key:** shadows certifications for that work_key lineage and all descendants
  - **Edge + work_key:** shadows certifications for that specific slice only
- AC-3: **F_P shadowing rule:** `holdsAt(certified(edge, work_key, evaluator, spec_hash, wv), now)` requires the initiating `assessed{kind: fp, result: pass}` event to have `event_time` **after** the latest applicable `reset` event whose scope contains the query. Certifications before the boundary are shadowed — present in the stream but not counted for convergence
- AC-4: **Scope containment:** for a query on `(edge, work_key, evaluator, spec_hash, wv)`, the "latest applicable reset" is the most recent `reset` event whose scope contains that query: workspace resets contain everything, work_key resets contain that lineage and descendants, edge+work_key resets contain that slice only
- AC-5: **F_H unaffected:** `operative(edge, work_key, wv)` is NOT shadowed by reset. Human judgment persists across reset boundaries and requires explicit `revoked{kind: fh_approval}` to reopen
- AC-6: **F_D unaffected:** F_D evaluators are always live (re-run every iteration) — reset does not change their behavior
- AC-7: **Derived records shadowed:** `edge_converged` certificates and similar derived convergence records that predate the reset boundary remain in the event stream as audit history but do not satisfy live convergence queries after the boundary. New `edge_converged` certificates must be earned after re-certification
- AC-8: Reset is auditable: the event log records who requested it, what scope, and when
- AC-9: Reset does not forge individual revocation events for each certification — it is a single boundary event, not N termination events

### REQ-F-CORRECT-003 — Compensation and reset are replayable and semantically distinct

Both corrective paths must be reconstructable from the event log with clear semantic intent.

**Acceptance Criteria**:
- AC-1: Replay of the event stream correctly distinguishes compensation (targeted fluent termination + corrective work) from reset (certification boundary — shadowing, not termination)
- AC-2: No corrective operation destroys event history — the log is append-only through all corrections
- AC-3: The effective convergence state after any sequence of corrections is derivable by replaying the full event stream — no hidden out-of-band state
- AC-4: **Legacy replay shim:** existing `revoked{edge: "*"}` events without work_key scoping are interpreted as workspace-scope reset during replay. Concrete-edge `revoked` events without work_key retain their original edge-scoped revocation meaning — they are not promoted to reset. Neither form is available for new work
