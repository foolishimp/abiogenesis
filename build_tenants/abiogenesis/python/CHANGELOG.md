# Changelog

## [3.2.0-rc.1] — 2026-04-21

Release-candidate line for the B-027 ABG runtime-carrier migration.

This line keeps the public `gen-start` / `gen-gaps` operator contract, but
moves runtime law under typed carrier and event authority. Controller-local
state, open result dictionaries, legacy evaluator partitions, and
`runtime_config` side channels no longer serve as normal-execution semantic
centers.

### Runtime Boundary

- Runtime advancement consumes `ExecutionBasis`, `AdvancementTransition`, and
  `IterationAdvanceDecision` carrier truth.
- Regime truth consumes `RegimeBindingSet`; `F_D`, `F_P`, and `F_H` are no
  longer independently reinterpreted from legacy evaluator lists.
- `PrecomputedManifest` construction without regime algebra fails closed.
- Feature completion is event-owned and active-work state is replay-derived.
- Dispatch, result ingest, proof-hold, live-status, and asset-binding contract
  paths consume admitted carrier truth or fail closed.
- `runtime_config` remains adapter/bootstrap ingress only.

### Documentation And Bootloader

- Active version surfaces moved to `3.2.0`.
- GTL bootloader updated to carry the 3.2.0 carrier/event-owned runtime law.
- Root `AGENTS.md` and `CLAUDE.md` injected bootloader sections refreshed.
- Live docs under `docs/` updated to the 3.2.0 boundary.
- Superseded vision drafts and rendered PDFs moved to `docs/old/`.

### Qualification

- `check-req-coverage` passes for `gtl_spec.packages.abiogenesis:module`
- `check-req-coverage` passes for `gtl_spec.packages.project_package:module`
- `check-impl-coverage` passes for `gtl_spec.packages.abiogenesis:module`
- `check-validates-coverage` passes for `gtl_spec.packages.abiogenesis:module`
- Bootloader consistency passes for `gtl` against `GTL_BOOTLOADER.md`
- Focused bootloader consistency tests: `2 passed, 110 deselected`
- Sandbox install tests: `15 passed`
- Full tenant suite: `317 passed, 19 deselected`
- Live F_P qualification: `5 passed` from authenticated Claude harness

## [2.0.0] — 2026-04-02

First full prior kernel release. This line completes the recursive runtime rewrite:
stable outer module publication, invocation-local recursive frames, explicit fold-back
law, tail-loop recursive machine control, compressed install-time GTL bootstrap, and
present-state consistency across requirements, design, code, installer, and tests.

### Highlights

- GTL recursion is now declared with explicit termination and fold-back contract.
- ABG recursive execution is invocation-local and frame-contained; recursive selection
  no longer rewrites the published module.
- Parent convergence now requires lawful rebind and parent re-evaluation; child closure
  no longer auto-certifies the parent.
- Recursive machine control now uses explicit continuation/frontier state and
  current-frame cursor ownership for next-action truth.
- Frame-local publication and materialization are fail-closed and no longer rely on
  synthetic traversal boundaries or globalized recursion law.
- Reset/reopen now mints fresh frame-attempt identity and treats checkpoints as
  resumability aids rather than authoritative truth.
- Installer ships a compressed precreated GTL bootstrap into `CLAUDE.md` and verifies
  self-hosting consistency against the live GTL export surface.

### Qualification

- Full suite: `115 passed, 5 deselected`
- Clean install/UAT verified in `build_tenants/abiogenesis/python/test_env/test_install`
- Bootloader self-hosting checks pass

### Active Release Surfaces

- `pyproject.toml`
- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/code/genesis/__init__.py`
- `build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md`
- `build_tenants/abiogenesis/python/design/GTL_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/GTL_3_INTERFACE_CONTRACTS.md`
- `specification/requirements/gtl/REQ-L-GTL3-RECURSE.md`
- `specification/requirements/abg/REQ-R-ABG3-INTERPRET.md`

## [1.0.0-beta] — 2026-03-21

First kernel-qualified release. ABG is the GTL engine kernel — 6 modules, 45 REQ keys,
55 qualification tests proving the installed runtime works.

### Engine (build_tenants/abiogenesis/python/code/)

**Event Calculus foundation** (REQ-F-EC-*)
- Five prime operators: `assessed`, `approved`, `revoked`, `vector_started`, `edge_converged`
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

### GTL Type System (build_tenants/abiogenesis/python/code/gtl/)

- `Package`, `Asset`, `Edge`, `Job`, `Worker`, `Evaluator`, `Operator`, `Rule`, `Context` — complete GTL core types
- `instantiate()` pattern for GTL spec packages

### Specification (specification/)

- 45 REQ keys across 13 groups: CORE, BIND, EC, PROV, PKG, BOOT, BOOTDOC, WKSP, TEST, CMD, COV, EVAL, GATE, GRAPH, TAG, VIS, DOCS
- Requirements-first development — spec leads, code follows

### Test Suites (build_tenants/abiogenesis/python/test_env/tests/)

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
