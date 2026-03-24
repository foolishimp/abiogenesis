# ADR-026: V2 Correction Law — Compensation and Reset

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-CORRECT-001, REQ-F-CORRECT-002, REQ-F-CORRECT-003
**Depends on**: ADR-016 (prime operators / EC), ADR-023 (work identity)
**Derives from**: INT-005 (V2 Kernel Evolution: Run Governance and Leaf Tasks)

## Context

The V1 engine has one corrective mechanism: `revoked` events with an optional wildcard `edge: "*"`. This conflates two semantically distinct operations:

1. **Compensation** — "this specific certification was wrong" — targeted at a single fluent instance
2. **Administrative reset** — "re-evaluate everything under this scope" — a broad re-certification trigger

Wildcard revocation was the only tool for both. This caused:
- No way to correct one evaluator's certification without invalidating all edges
- No way to trigger re-certification without forging N individual revocation events
- The event log conflated administrative convenience with semantic correction

## Decision

### Two distinct corrective operations

| Operation | Mechanism | EC effect |
|-----------|-----------|-----------|
| **Compensation** | `revoked` (Tier 1 prime) | Terminates a specific fluent instance |
| **Reset** | `reset` (Tier 2 control) | Creates a certification boundary — shadows, does not terminate |

### Compensation — lineage-scoped revocation (REQ-F-CORRECT-001)

`revoked` targets a specific fluent instance scoped to a work_key lineage:

```
revoked{kind: fh_approval}  → terminates operative(edge, work_key, wv)
revoked{kind: fp_assessment} → terminates certified(edge, work_key, evaluator, spec_hash, wv)
```

Rules:
- Revocation within one work_key lineage does not affect sibling or parent work_keys (unless parent's fold-back projection changes)
- Corrective work (new attempts on the same work_key) is the normal recovery path
- The event log after correction is truthful: original work, revocation, and corrective work are all visible

**Legacy replay shim (superseded):** Wildcard `edge: "*"` is retained only for replaying existing event streams. Not available for new work.

### Reset — certification boundary (REQ-F-CORRECT-002)

Reset creates a temporal boundary in the event stream. It does not terminate fluents, forge individual revocations, or destroy event history. It forces re-certification after the boundary.

#### Scope granularity

| Scope | Shadows |
|-------|---------|
| **Workspace** | All certifications in the workspace |
| **Work_key** | Certifications for that lineage and all descendants |
| **Edge + work_key** | Certifications for that specific slice only |

#### F_P shadowing rule

`holdsAt(certified(edge, work_key, evaluator, spec_hash, wv), now)` requires the initiating `assessed{kind: fp, result: pass}` event to have `event_time` **after** the latest applicable `reset` event whose scope contains the query.

Certifications before the boundary are shadowed — present in the stream but not counted for convergence.

#### Scope containment

For a query on `(edge, work_key, evaluator, spec_hash, wv)`, the "latest applicable reset" is the most recent `reset` event whose scope contains that query:
- Workspace resets contain everything
- Work_key resets contain that lineage and descendants
- Edge+work_key resets contain that slice only

#### What reset does NOT affect

- **F_H (operative):** Human judgment persists across reset boundaries. Requires explicit `revoked{kind: fh_approval}` to reopen
- **F_D:** Always live — re-runs every iteration regardless of reset
- **Event history:** Append-only. No events deleted or modified

#### Derived records

`edge_converged` certificates and similar derived convergence records that predate the reset boundary remain in the event stream as audit history but do not satisfy live convergence queries after the boundary. New certificates must be earned after re-certification.

### Replayability (REQ-F-CORRECT-003)

Both corrective paths are reconstructable from the event log:
- Compensation: sequence of `revoked` + subsequent `assessed{pass}` events
- Reset: `reset` boundary event + subsequent re-certification events
- No corrective operation destroys event history
- Effective convergence state is derivable by replaying the full event stream

## Implementation

### reset event schema

```python
emit("reset", {
    "scope": "workspace" | "work_key" | "edge",
    "work_key": str | None,    # when scope is work_key or edge
    "edge": str | None,         # when scope is edge
    "actor": str,               # who requested the reset
    "reason": str,              # why
})
```

### delta() boundary check

```python
def delta(job, stream, ..., work_key=None):
    # Find latest applicable reset for this scope
    latest_reset = find_latest_reset(stream, job.edge.name, work_key)

    # For F_P convergence: only count assessed{pass} events AFTER latest_reset
    for ev in find_assessed_events(stream, ...):
        if latest_reset and ev["event_time"] < latest_reset["event_time"]:
            continue  # shadowed by reset boundary
        # ... normal projection
```

### edge_converged boundary check

When computing whether to emit `edge_converged`, check that no applicable reset boundary postdates the existing certificate. If it does, the certificate is stale — a new one must be earned.

### Legacy replay

During replay of pre-V2 event streams:
- `revoked{edge: "*"}` without work_key → interpreted as workspace-scope reset
- Concrete-edge `revoked` without work_key → retains original edge-scoped revocation meaning

## Consequences

- Two semantically distinct corrective operations replace one overloaded mechanism
- Reset is additive, replayable, and non-destructive
- F_H approvals survive reset — human judgment is durable
- Wildcard revocation is fully superseded for new work
- The event log remains truthful through all corrections
- Foundation for distributed saga-style coordination (future INT)
