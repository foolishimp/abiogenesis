# Workflow Provenance (REQ-F-PROV-*)

**Traces to**: INT-001

### REQ-F-PROV-001 — Workflow version read from active-workflow.json

The engine tracks which workflow version is active for provenance binding.

**Acceptance Criteria**:
- AC-1: Reads `active-workflow.json` at Scope construction: (1) explicit `active_workflow_path` from genesis.yml, (2) `.ai-workspace/runtime/active-workflow.json`. Pure read — no side effects, no fallback to `.genesis/`
- AC-2: Returns `"{workflow}@{version}"` when file is valid (e.g., `"genesis_sdlc.standard@0.3.0"`)
- AC-3: Returns `"unknown"` on any failure (missing file, invalid JSON, non-string values)
- AC-4: Engine never fails to start due to this file's state
- AC-5: Installer (gen-install.py) creates `.ai-workspace/runtime/` and migrates legacy `.genesis/active-workflow.json` on reinstall

### REQ-F-PROV-002 — Events annotated with workflow_version

Every event carries provenance metadata linking it to the active workflow version.

**Acceptance Criteria**:
- AC-1: `EventStream.append()` injects `workflow_version` into event data when not `"unknown"`
- AC-2: Injection uses set-default — never overwrites an explicit value from the caller
- AC-3: The `emit-event` CLI path also annotates workflow_version independently (pre-stack, no Scope)
- AC-4: Events emitted when workflow_version is `"unknown"` carry no version annotation

### REQ-F-PROV-003 — job_evaluator_hash replaces req_hash when provenance is present

Spec hash computation is version-aware.

**Acceptance Criteria**:
- AC-1: When `workflow_version != "unknown"`: `spec_hash = job_evaluator_hash(job)` — hash of all evaluator definitions (name, category, command, description)
- AC-2: When `workflow_version == "unknown"`: `spec_hash = req_hash(Package.requirements)` — hash of sorted requirement keys (fallback)
- AC-3: Changing any evaluator definition changes the hash, invalidating prior F_P assessments
- AC-4: Whitespace differences in evaluator descriptions do not change the hash (normalisation applied)

### REQ-F-PROV-004 — Carry-forward preserves approvals across version upgrades

When a workflow version changes, explicitly listed approvals carry forward without re-approval.

**Acceptance Criteria**:
- AC-1: Carry-forward list read from `{workflow_root}/{pkg}/{variant}/{version_dir}/manifest.json` (workflow_root defaults to `.genesis/workflows`, configurable via genesis.yml)
- AC-2: Each entry specifies `{edge, work_key, from_version}` — the approval from `from_version` is accepted under the current version. **Degenerate case:** when `work_key` is absent, carry-forward matches by `(edge, from_version)` alone
- AC-3: Revocations are scoped by workflow_version — a revocation from one version cannot cancel approvals from another
- AC-4: **Degenerate case:** when `workflow_version == "unknown"`, no version-based carry-forward. Approvals are matched directly — by `(edge, work_key)` when work_key is present, by edge alone when both are absent

### REQ-F-PROV-005 — Orphan tolerance for graph evolution

Events referencing edges not in the current graph are silently ignored, enabling graph evolution without event stream migration.

**Acceptance Criteria**:
- AC-1: `bind_fh()` and `delta()` skip events referencing edges not in the current job set
- AC-2: No error or warning emitted for orphan events
- AC-3: Adding or removing edges from the Package does not require event stream modification
