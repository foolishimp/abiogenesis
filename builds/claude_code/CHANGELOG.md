# Changelog

## [1.0.0-beta] — 2026-03-21

First kernel-qualified release. ABG is the GTL engine kernel — 6 modules, 45 REQ keys,
55 qualification tests proving the installed runtime works.

### Engine (builds/claude_code/code/)

**Event Calculus foundation** (REQ-F-EC-*)
- Five prime operators: `assessed`, `approved`, `revoked`, `edge_started`, `edge_converged`
- Two fluents: `convergence_status`, `approval_status` — derived from event stream projection
- `emit()` validates prime operator schemas at the write primitive (spec_hash on assessed/fp, kind on approved/revoked)
- Fail-closed context resolution — missing context raises FileNotFoundError, never silently degrades

**Provenance** (REQ-F-PROV-*)
- `workflow_version` annotation on all emitted events via CLI
- Version-aware F_H gate — `bind_fh` rejects stale approvals from prior workflow versions
- `carry_forward` — re-emits valid approvals from prior versions into current workflow
- `req_hash` / `job_evaluator_hash` — content-addressable spec hashing for F_P assessment binding

**Bind subsystem** (REQ-F-BIND-*)
- `bind_fd` — deterministic evaluator dispatch with subprocess runner and FD_TIMEOUT_SECONDS wall-clock limit
- `bind_fp` — F_P manifest generation with INVARIANTS/STATE/GAP/CONTEXT/OUTPUT CONTRACT prompt sections
- `bind_fh` — F_H gate assembly with workflow_version matching and carry_forward

**Schedule + Commands** (REQ-F-CORE-*)
- `delta()` — computes convergence gap across all evaluators for a job
- `schedule()` — selects next job by priority ordering
- `gen_start` — state machine with exit codes 0-5 (converged, error, fp_dispatched, fh_gate, fd_gap, max_iterations)
- `gen_iterate` — single iteration cycle
- `gen_gaps` — full traceability report

**Installer** (REQ-F-PKG-*, REQ-F-BOOT-*, REQ-F-WKSP-*)
- Starter GTL Package generation for new projects
- Idempotent reinstall — engine/gtl always replaced, gtl_spec preserved
- CLAUDE.md bootloader injection with marker-based idempotency
- `workspace_bootstrap` — creates .ai-workspace/ directory structure

### GTL Type System (builds/claude_code/code/gtl/)

- `Package`, `Asset`, `Edge`, `Job`, `Worker`, `Evaluator`, `Operator`, `Rule`, `Context` — complete GTL core types
- `instantiate()` pattern for GTL spec packages

### Specification (specification/)

- 45 REQ keys across 13 groups: CORE, BIND, EC, PROV, PKG, BOOT, BOOTDOC, WKSP, TEST, CMD, COV, EVAL, GATE, GRAPH, TAG, VIS, DOCS
- Requirements-first development — spec leads, code follows

### Test Suites (builds/claude_code/tests/)

- **Unit tests**: test_core, test_bind, test_schedule + others — 329 tests covering all 6 modules
- **Integration workflows**: test_integration_workflows — multi-edge convergence scenarios
- **Property invariants**: test_property_invariants — determinism, isolation, completeness
- **E2E sandbox**: test_e2e_sandbox — 15 tests (10 PQ install, 5 self-hosting via .genesis/)
- **Product Qualification (PQ)**: 30 install-first sandbox tests proving the installed runtime works
  - PQ-001–005: Fresh install, idempotent reinstall, starter package, bootloader injection, workspace bootstrap
  - PQ-101–105: CLI exit codes match skill contract routing table
  - PQ-201–205: Manifest round-trip (structure, prompt, result_path, spec_hash)
  - PQ-301–305: F_H gate contract (approval format, proxy actor, workflow_version)
  - PQ-601–604: Provenance (workflow_version annotation, version mismatch detection, carry_forward, req_hash)
- **Skill Contract Qualification (SC)**: 25 tests proving ABG↔skill contract surface
  - SC-001–003: Bootloader injection contract
  - SC-101–106: Exit code contract (all 6 codes)
  - SC-201–205: Manifest structure contract
  - SC-301–303: Result→emit pipeline contract
  - SC-401–403: F_H gate contract
  - SC-501–505: Malformed input fails closed

### Architecture

- 6 modules: `core`, `bind`, `manifest`, `schedule`, `commands`, `__main__`
- ABG is the kernel. GSDLC is the distribution. `.genesis/` is GSDLC's territory.
- Cascade chain: abg → gsdlc → dependents
