# ADR-029: Workflow Provenance

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-PROV-001, REQ-F-PROV-002, REQ-F-PROV-003, REQ-F-PROV-004, REQ-F-PROV-005
**Derives from**: INT-001

## Context

The engine must bind events to their originating workflow version so that assessments, approvals, and certifications carry provenance. Without this, a workflow upgrade silently invalidates prior F_P assessments (the spec changed but old events look identical), and carry-forward across versions is impossible.

## Decision

### Workflow version source (REQ-F-PROV-001)

`active-workflow.json` is the sole source of truth for the active workflow version. Read at Scope construction from: (1) explicit `active_workflow_path` in genesis.yml, (2) `.ai-workspace/runtime/active-workflow.json`. Returns `"{workflow}@{version}"` when valid, `"unknown"` on any failure. The engine never fails to start due to this file's state.

The installer creates `.ai-workspace/runtime/` and migrates any legacy `.genesis/active-workflow.json` on reinstall.

### Event annotation (REQ-F-PROV-002)

`EventStream.append()` auto-injects `workflow_version` into event data when the version is not `"unknown"`. Injection uses set-default — never overwrites an explicit value from the caller. The `emit-event` CLI path annotates independently (no Scope exists in that code path — it reads active-workflow.json directly).

### Spec hash computation (REQ-F-PROV-003)

Spec identity is version-aware:

| Condition | Hash function | Input |
|-----------|--------------|-------|
| `workflow_version != "unknown"` | `job_evaluator_hash(job)` | SHA-256 of sorted evaluator definitions (name, category, command, description) |
| `workflow_version == "unknown"` | `req_hash(Package.requirements)` | SHA-256 of sorted requirement keys (fallback) |

Changing any evaluator definition changes the hash, invalidating prior F_P assessments for that job. Whitespace differences in evaluator descriptions do not change the hash (normalisation applied).

The fallback to `req_hash` is the **degenerate case** for workspaces without workflow version management — it preserves V1 behavior where spec_hash was derived from requirement keys.

### Carry-forward (REQ-F-PROV-004)

When a workflow version changes, explicitly listed approvals carry forward without re-approval. The carry-forward list is read from `{workflow_root}/{pkg}/{variant}/{version_dir}/manifest.json`.

Each entry specifies `{edge, work_key, from_version}` — the approval from `from_version` is accepted under the current version. Revocations are scoped by workflow_version — a revocation from one version cannot cancel approvals from another.

**Degenerate case:** when `work_key` is absent, carry-forward matches by `(edge, from_version)` alone. When `workflow_version == "unknown"`, no version-based carry-forward — approvals are matched directly by `(edge, work_key)` when work_key is present, by edge alone when both are absent.

### Orphan tolerance (REQ-F-PROV-005)

Events referencing edges not in the current graph are silently ignored. `bind_fh()` and `delta()` skip events referencing edges not in the current job set. No error or warning for orphan events. Adding or removing edges from the Package does not require event stream modification.

This enables graph evolution — the Package topology can change between versions without migrating the event stream.

## Consequences

- Every event carries provenance linking it to the workflow version that produced it
- Workflow upgrades invalidate prior F_P assessments unless explicitly carried forward
- Carry-forward is opt-in (manifest.json), not automatic — the workflow author decides what survives version transitions
- Graph evolution is non-destructive — orphan events are inert, not errors
- The `emit-event` CLI and `EventStream.append()` both enforce annotation — no unannotated events when workflow version is known
