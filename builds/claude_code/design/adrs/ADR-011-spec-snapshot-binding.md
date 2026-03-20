# ADR-011 — Spec-Snapshot Binding for F_P Assessment Events

**REQ**: REQ-F-EVAL-002
**Status**: Accepted

## Decision

`assessed{kind: fp}` events carry a `spec_hash` field — a 16-hex-char SHA-256 digest. `bind_fd()` and `delta()` in `bind.py` and `schedule.py` accept a `spec_hash` parameter and reject F_P assessment events whose stored hash differs from the current value. Assessments without a `spec_hash` are also rejected (treated as stale).

## Problem

Prior to this ADR, F_P assessment events were eternal: once `code_complete` emitted `pass`, it remained valid regardless of subsequent spec evolution. Adding a REQ key did not invalidate existing assessments, so the engine reported convergence even when new requirements had no implementation.

## Solution

Two hash functions in `bind.py`, gated on `scope.workflow_version`:

**When `workflow_version == "unknown"` (legacy/no provenance):**
`req_hash(requirements)` — SHA-256 of `sorted(Package.requirements)`:
```python
hashlib.sha256(json.dumps(sorted(requirements)).encode()).hexdigest()[:16]
```

**When `workflow_version != "unknown"` (provenance-aware):**
`job_evaluator_hash(job)` — SHA-256 of all evaluator definitions (name, category, command, description):
```python
lines = sorted(f"{ev.name}:{ev.category.__name__}:{ev.command}:{ev.description}" for ev in job.evaluators)
raw = "\n".join(re.sub(r'\s+', ' ', line.strip()) for line in lines)
hashlib.sha256(raw.encode()).hexdigest()[:16]
```

`commands.py` selects the hash function based on `scope.workflow_version` and threads the result into every `bind_fd()` and `delta()` call. The manifest written to disk includes `spec_hash` so the skill can embed it in emitted `assessed{kind: fp}` events.

## Consequences

- Changing any evaluator (name, description, command, category) invalidates all prior F_P assessments → engine re-dispatches F_P on the next run.
- `spec_hash=None` in `bind_fd`/`delta` opts out of snapshot checking (used in unit tests).
- `req_hash()` is retained (deprecated) as fallback for workspaces without active-workflow.json.
- Activating provenance (installing `active-workflow.json`) triggers a one-time F_P re-assessment as hash format changes.
