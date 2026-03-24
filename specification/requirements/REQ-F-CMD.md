# Commands (REQ-F-CMD-*)

**Traces to**: INT-001, INT-004

### REQ-F-CMD-001 — gen gaps reports delta per work instance

`gen-gaps` computes the convergence state of the workspace by running `schedule.delta()` over all work instances (REQ-F-TRAV-002). `bind_fd()` provides evaluator-level detail for reporting but does not determine convergence.

**Acceptance Criteria**:
- AC-1: Returns JSON with `total_delta`, `converged`, `jobs_considered`, and per-work-instance `gaps[]`
- AC-2: Each gap entry contains: `edge`, `work_key` (when present), `delta`, `failing` (evaluator names), `passing`, `delta_summary`
- AC-3: Convergence (`delta`) is computed via `schedule.delta()` — the single convergence function (REQ-F-TRAV-002). `bind_fd()` provides evaluator-level pass/fail detail for the gap report but does not independently compute delta
- AC-4: `converged: true` iff `total_delta == 0.0`
- AC-5: Emits `edge_converged` certificate when a work instance reaches delta=0 and no certificate exists for that `(edge, work_key)` tuple
- AC-6: When no work_keys are active, reports per-edge only (V1 behaviour)

### REQ-F-CMD-002 — gen iterate runs one bind-and-iterate pass

`gen-iterate` selects the first unconverged work instance and executes one F_D→F_P→F_H cycle.

**Acceptance Criteria**:
- AC-1: Selects first unconverged work instance in topological edge order (when work_keys are active, each `(job, work_key)` is a candidate; when absent, each job is a candidate — V1 behaviour)
- AC-2: Calls `bind_fd()` to pre-compute all F_D results, F_H gates, and F_P assessments
- AC-3: Calls `iterate()` which enforces escalation ordering (REQ-F-GATE-002)
- AC-4: On F_D failure with unresolved F_P and no pending dispatch: emits `found{kind: fd_findings}` and `fp_dispatched`, writes manifest with `fd_results`. On F_D failure with pending dispatch: returns `pending`. On F_D failure without F_P or with F_P certified: emits `found{kind: fd_gap}`, exits code 4.
- AC-5: On F_P needed (no F_D failures): emits `fp_dispatched` with failing evaluators and prompt length, writes manifest to `.ai-workspace/fp_manifests/`, exits code 2
- AC-6: On F_H needed: emits `fh_gate_pending` with evaluator criteria, exits code 3
- AC-7: Emits `edge_started{edge, build, target}` before iteration

### REQ-F-CMD-003 — gen start --auto loops until blocked

`gen-start` is the state-machine entry point that loops `gen-iterate` until convergence or a blocking condition.

**Acceptance Criteria**:
- AC-1: Calls `_derive_state()` to determine workspace convergence
- AC-2: If converged: closes completed features (REQ-F-VIS-001), exits code 0
- AC-3: If not converged: dispatches `gen_iterate()` for the next work instance
- AC-4: `--auto` flag loops up to MAX_AUTO (50) iterations, stopping on: convergence, `fp_dispatched` (including escalation from F_D findings), `fh_gate_pending`, `found{kind: fd_gap}` (terminal — no F_P path or F_P certified), `pending` (dispatch in flight), or max iterations
- AC-5: `--human-proxy` requires `--auto`; performs F_H evaluation per proxy protocol (§XIX of bootloader)
- AC-6: Exit codes: 0 (converged), 2 (fp_dispatched), 3 (fh_gate_pending), 4 (fd_gap), 5 (max_iterations)

### REQ-F-CMD-004 — edge_converged certificate scoped by work_key

Convergence certificates are scoped to `(edge, work_key)` tuples. `work_key` subsumes the former `feature` field — a feature is the degenerate case where `work_key` equals the feature ID.

**Acceptance Criteria**:
- AC-1: `edge_converged` event data includes `work_key` field (when present) and `feature` field (retained for V1 compatibility)
- AC-2: Deduplication key is `(edge, work_key)` — same edge can converge separately for different work units. When `work_key` is absent, deduplication falls back to `(edge, feature)`
- AC-3: Work-key-specific projections observe only certificates matching their `work_key`. Child work_keys under the same parent are distinct certificates
- AC-4: Parent `work_key` convergence requires all descendant `work_key` certificates to exist (REQ-F-FRAG-004)
