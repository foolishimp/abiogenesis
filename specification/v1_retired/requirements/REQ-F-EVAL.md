# Evaluator Safety (REQ-F-EVAL-*)

**Traces to**: INT-001

### REQ-F-EVAL-001 — F_D evaluator commands validated at spec load

F_D evaluators with `command` fields are validated for safety before execution.

**Acceptance Criteria**:
- AC-1: Non-empty command string required
- AC-2: Command must not invoke orchestration subcommands (`start`, `iterate`, `gaps`, `emit-event`) — no control-loop re-entry. Deterministic `check-*` leaf predicates are permitted.
- AC-3: Test-runner commands must exclude long-running or end-to-end suites to prevent unbounded execution

### REQ-F-EVAL-002 — assessed{kind: fp} events are snapshot-bound via spec_hash

F_P assessments carry a hash of the evaluator specification at the time of assessment. When the spec changes, prior assessments are invalidated.

**Acceptance Criteria**:
- AC-1: `assessed{kind: fp}` events carry a `spec_hash` field (16-char hex SHA-256)
- AC-2: `bind_fd()` computes the current spec_hash and compares it against assessed events in the stream
- AC-3: An assessed event with a non-matching spec_hash does not satisfy F_P convergence
- AC-4: When `scope.workflow_version == "unknown"`: `spec_hash = req_hash(Package.requirements)` — SHA-256 of sorted requirement keys
- AC-5: When `scope.workflow_version != "unknown"`: `spec_hash = job_evaluator_hash(job)` — SHA-256 of sorted evaluator definitions (name, category, command, description)
- AC-6: Changing any evaluator definition invalidates all prior F_P assessments for that job

### REQ-F-EVAL-003 — impl_coverage and validates_coverage enforce per-REQ-key presence

Per-REQ-key traceability from spec through code to tests.

**Acceptance Criteria**:
- AC-1: `check-impl-coverage` verifies every REQ key appears in ≥1 source file as an `Implements: {key}` traceability marker
- AC-2: `check-validates-coverage` verifies every REQ key appears in ≥1 test file as a `Validates: {key}` traceability marker
- AC-3: Both exit 0 on full coverage, exit 1 with gap list

### REQ-F-EVAL-004 — emit-event rejects assessed{kind: fp} without spec_hash

The event emission governance layer validates prime operator payloads before appending.

**Acceptance Criteria**:
- AC-1: `emit-event --type assessed` with `kind: fp` and missing `spec_hash` → rejected with error
- AC-2: `emit-event --type assessed` with `kind: fp` and `result` not in `{pass, fail}` → rejected
- AC-3: `emit-event --type approved` without `kind` field → rejected
- AC-4: `gen emit-event --type revoked` without `kind`, `edge`, `actor`, or `reason` → rejected
- AC-6: `gen emit-event --type revoked` with `kind` not in `{fh_approval, fp_assessment}` → rejected
- AC-5: `gen emit-event --type assessed` with `kind: fh_review` requires `actor` and `reason`

### REQ-F-EVAL-005 — EventStream append validates prime operator payloads

The event stream write primitive enforces the same prime operator validation as the CLI.

**Acceptance Criteria**:
- AC-1: Appending `assessed{kind: fp}` without `spec_hash` → error
- AC-2: Appending `approved` without `kind` → error
- AC-3: Appending `revoked` without `kind` → error
- AC-4: Valid payloads pass through without error
