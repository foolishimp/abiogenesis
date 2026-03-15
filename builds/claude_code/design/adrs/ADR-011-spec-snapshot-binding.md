# ADR-011 — Spec-Snapshot Binding for F_P Assessment Events

**REQ**: REQ-F-EVAL-002
**Status**: Accepted

## Decision

`fp_assessment` events carry a `spec_hash` field — a 16-hex-char SHA-256 of `sorted(Package.requirements)`. `bind_fd()` and `delta()` in `bind.py` and `schedule.py` accept a `spec_hash` parameter and reject F_P assessment events whose stored hash differs from the current value. Assessments without a `spec_hash` are also rejected (treated as stale).

## Problem

Prior to this ADR, F_P assessment events were eternal: once `code_complete` emitted `pass`, it remained valid regardless of subsequent spec evolution. Adding a REQ key did not invalidate existing assessments, so the engine reported convergence even when new requirements had no implementation.

## Solution

`req_hash(requirements)` in `bind.py`:
```python
hashlib.sha256(json.dumps(sorted(requirements)).encode()).hexdigest()[:16]
```

`commands.py` computes `spec_hash = req_hash(scope.package.requirements)` and threads it into every `bind_fd()` and `delta()` call. The manifest written to disk includes `spec_hash` so the skill can embed it in emitted `fp_assessment` events.

## Consequences

- Adding any REQ key immediately invalidates all prior F_P assessments → engine re-dispatches F_P on the next run. This is the intended bootstrap behavior.
- `spec_hash=None` in `bind_fd`/`delta` opts out of snapshot checking (used in unit tests).
- The hash is of `sorted(requirements)` — order-independent, stable across Python versions.
