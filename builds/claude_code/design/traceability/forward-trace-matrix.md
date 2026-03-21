# Forward Trace Matrix

**Date**: 2026-03-21
**Method**: Manual walk per Codex restoration plan
**Scope**: abiogenesis — all 45 REQ keys + 3 unregistered Phase 2 capabilities

---

## Intent → Requirement Families

| Intent | Outcome Clause | REQ Families |
|--------|---------------|--------------|
| INT-001 §1 | Typed asset graph (6 assets, 5 edges) | REQ-F-GRAPH-* |
| INT-001 §2 | Convergence engine (iterate, F_D/F_P/F_H) | REQ-F-CORE-*, REQ-F-GATE-*, REQ-F-BIND-* |
| INT-001 §3 | Event Calculus (5 primes, 2 fluents, 3 models) | REQ-F-EC-* |
| INT-001 §4 | Commands (gen-start, gen-iterate, gen-gaps) | REQ-F-CMD-* |
| INT-001 §5 | Traceability (REQ tags through code to tests) | REQ-F-TAG-*, REQ-F-COV-* |
| INT-001 §6 | Provenance (version, spec_hash) | REQ-F-PROV-*, REQ-F-EVAL-002 |
| INT-001 §7 | Bootstrap compiler (GCC analogy) | REQ-F-BOOT-*, REQ-F-PKG-* |
| INT-001 §8 | Self-hosting gate | REQ-F-TEST-*, REQ-F-WKSP-* |
| INT-001 (implicit) | Evaluator safety, feature lifecycle, docs | REQ-F-EVAL-001/003/004/005, REQ-F-VIS-*, REQ-F-DOCS-* |
| INT-002 | Bootloader docs as graph assets | REQ-F-BOOTDOC-* |
| INT-003 | Spec-build boundary cleanup | (no REQ keys yet — draft intent) |

---

## Full Trace: REQ → Feature → ADR → Code → Impl Tag → Test → Validates Tag

### Hot Path (Codex priority order)

#### REQ-F-GRAPH-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-GRAPH-001 | REQ-F-GRAPH.yml | ADR-001 | commands.py (Package load) | commands.py:5 | test_e2e_domain_blind.py | test_e2e_domain_blind.py:9 |
| REQ-F-GRAPH-002 | REQ-F-GRAPH.yml | ADR-001 | commands.py (markov surfacing) | commands.py:6 | test_e2e_domain_blind.py | test_e2e_domain_blind.py:10 |

**Status**: Full chain intact.

#### REQ-F-CMD-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-CMD-001 | REQ-F-CMD-GAPS.yml | — | commands.py gen_gaps() | commands.py:1 | test_commands.py, test_main.py, test_cli_config.py, test_e2e_*.py | test_commands.py:1, test_main.py:1, etc. |
| REQ-F-CMD-002 | REQ-F-CMD-ITER.yml | — | commands.py gen_iterate() | commands.py:2 | test_commands.py, test_main.py | test_commands.py:2, test_main.py:2 |
| REQ-F-CMD-003 | REQ-F-CMD-START.yml | — | commands.py gen_start() | commands.py:3 | test_commands.py, test_main.py | test_commands.py:3, test_main.py:3 |
| REQ-F-CMD-004 | REQ-F-ENGINE-CORRECTNESS.yml | — | commands.py (feature field on edge_converged) | commands.py:4 | test_commands.py, test_integration_workflows.py | test_commands.py:4, test_integration_workflows.py:10 |

**Status**: Full chain intact. No dedicated ADRs for individual commands — design is implicit in ADR-004 (Scope) and ADR-006 (bootstrap sequence).

#### REQ-F-EVAL-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-EVAL-001 | REQ-F-EVAL.yml | — | __main__.py (command validation) | __main__.py:7 | test_main.py | test_main.py:7 |
| REQ-F-EVAL-002 | REQ-F-EVAL-SNAP.yml | ADR-011 | bind.py (spec_hash), commands.py (hash gate) | bind.py:2, commands.py:7 | test_bind.py, test_schedule.py, test_property_invariants.py | test_bind.py:4, test_schedule.py:6, test_property_invariants.py:6 |
| REQ-F-EVAL-003 | REQ-F-EVAL-COV.yml | ADR-012 | __main__.py (check-impl/validates-coverage) | __main__.py:8 | test_main.py | test_main.py:8 |
| REQ-F-EVAL-004 | REQ-F-ENGINE-CORRECTNESS.yml | — | __main__.py (emit-event validation) | __main__.py:9 | test_integration_workflows.py, test_e2e_sandbox.py | test_integration_workflows.py:7, test_e2e_sandbox.py:13 |
| REQ-F-EVAL-005 | REQ-F-EVAL-005.yml | — | core.py (emit() validation) | core.py:5 | test_core.py | test_core.py:5 |

**Status**: Full chain intact. REQ-F-EVAL-001 lacks a dedicated ADR but behaviour is tested.

#### REQ-F-CORE-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-CORE-001 | REQ-F-CORE.yml, REQ-F-ENGINE-CORRECTNESS.yml | ADR-005 | core.py project(), schedule.py delta() | core.py:1, schedule.py:1 | test_core.py, test_schedule.py, test_e2e_*.py | test_core.py:1, test_schedule.py:1, test_e2e_sandbox.py:1 |
| REQ-F-CORE-002 | REQ-F-CORE.yml | ADR-005 | core.py project() | core.py:2 | test_core.py, test_property_invariants.py, test_e2e_*.py | test_core.py:2, test_property_invariants.py:3, test_e2e_domain_blind.py:2 |
| REQ-F-CORE-003 | REQ-F-CORE.yml | ADR-005 | core.py EventStream | core.py:3 | test_core.py, test_property_invariants.py, test_e2e_*.py | test_core.py:3, test_property_invariants.py:4, test_e2e_domain_blind.py:3 |
| REQ-F-CORE-004 | REQ-F-BIND.yml | ADR-002, ADR-003 | bind.py bind_fd(), manifest.py | bind.py:1, manifest.py:1 | test_bind.py, test_e2e_sandbox.py | test_bind.py:1, test_e2e_sandbox.py:4 |
| REQ-F-CORE-005 | REQ-F-CORE.yml | ADR-005 | core.py ContextResolver, schedule.py | core.py:4, schedule.py:2 | test_core.py, test_e2e_domain_blind.py | test_core.py:4, test_e2e_domain_blind.py:5 |
| REQ-F-CORE-006 | REQ-F-WKSP.yml | — | schedule.py schedule() | schedule.py:3 | test_schedule.py, test_e2e_*.py | test_schedule.py:3, test_e2e_sandbox.py:6 |

**Status**: Full chain intact.

#### REQ-F-TEST-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-TEST-001 | REQ-F-TEST.yml | ADR-015 | (architecture, not code) | N/A | test_integration_workflows.py | test_integration_workflows.py:2 |
| REQ-F-TEST-002 | REQ-F-TEST.yml | ADR-015 | (architecture, not code) | N/A | test_property_invariants.py | test_property_invariants.py:2 |

**Status**: Full chain intact. These are architectural requirements — no code owner needed.

#### REQ-F-PROV-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-PROV-001 | REQ-F-PROV-001.yml | — | commands.py (Scope.workflow_version) | commands.py:9 | test_provenance_integration.py | test_provenance_integration.py:2 |
| REQ-F-PROV-002 | REQ-F-PROV-001.yml | — | core.py (emit annotation), __main__.py | core.py:6, __main__.py:11 | test_provenance_integration.py | test_provenance_integration.py:3 |
| REQ-F-PROV-003 | REQ-F-PROV-001.yml | — | bind.py job_evaluator_hash(), commands.py (hash gate) | bind.py:4, commands.py:10 | test_provenance_integration.py, test_bind.py, test_commands.py | test_provenance_integration.py:4, test_bind.py:2, test_commands.py:7 |
| REQ-F-PROV-004 | REQ-F-PROV-001.yml | — | bind.py bind_fh(), schedule.py delta() | bind.py:5, schedule.py:8 | test_provenance_integration.py, test_bind.py, test_schedule.py | test_provenance_integration.py:5, test_bind.py:3, test_schedule.py:8 |
| REQ-F-PROV-005 | REQ-F-PROV-001.yml | — | (structural — orphan tolerance) | **MISSING** (comment only, no tag) | test_provenance_integration.py | test_provenance_integration.py:6 |

**Status**: Partial — REQ-F-PROV-005 lacks an Implements tag (implementation is a comment, not code). No dedicated ADR — the feature YAML (REQ-F-PROV-001.yml) is unusually detailed and serves as both feature vector and design document.

#### REQ-F-EC-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-EC-001 | REQ-F-EC-001.yml | ADR-016 | __main__.py (emit-event), core.py (emit validation) | **MISSING** (no EC-001 tag — __main__.py:9 is EVAL-004) | **MISSING** (no EC-001 validates tag) | — |
| REQ-F-EC-002 | REQ-F-EC-001.yml | ADR-016 | bind.py (bind_fh, _passes) | bind.py:6 | test_bind.py | test_bind.py:4 |
| REQ-F-EC-003 | REQ-F-EC-001.yml | ADR-016 | bind.py (_passes), schedule.py (delta) | — (no tag) | — (no targeted test) | — |
| REQ-F-EC-004 | REQ-F-EC-001.yml | ADR-016 | bind.py (bind_fp_certified) | bind.py:7 | test_bind.py, test_integration_workflows.py | test_bind.py:5, test_integration_workflows.py:12 |
| REQ-F-EC-005 | REQ-F-EC-001.yml | ADR-016 | bind.py (fh_review kind isolation) | — (no tag) | — (no targeted test) | — |
| REQ-F-EC-006 | REQ-F-EC-001.yml | ADR-016 | core.py (emit validation), __main__.py | — (no tag) | test_core.py (partial) | — |

**Status**: Partial. EC-001, EC-003, EC-005, EC-006 all lack both Implements and Validates tags. Only EC-002 and EC-004 have full chains. EC-001 is structurally distributed — no single code owner.

#### REQ-F-BOOTDOC-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-BOOTDOC-001 | REQ-F-BOOTDOC.yml | — | __main__.py (graph asset definition) | __main__.py:12 | test_main.py | test_main.py:9 |
| REQ-F-BOOTDOC-002 | REQ-F-BOOTDOC.yml | — | __main__.py:307 (check-bootloader-consistency) | __main__.py:13, __main__.py:307 | test_main.py | test_main.py:10 |
| REQ-F-BOOTDOC-003 | REQ-F-BOOTDOC.yml | — | (convergence ordering — structural) | __main__.py:14 | test_main.py | test_main.py:11 |

**Status**: Full chain intact. Feature status is `iterating` (not yet completed).

### Remaining Families

#### REQ-F-BOOT-*, REQ-F-PKG-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-BOOT-001 | REQ-F-BOOT.yml | ADR-007 | gen-install.py | gen-install.py:3 | test_cli_config.py | test_cli_config.py:4 |
| REQ-F-BOOT-002 | REQ-F-BOOT.yml | ADR-007 | gen-install.py | gen-install.py:4 | test_cli_config.py | test_cli_config.py:5 |
| REQ-F-PKG-001 | **NONE** | — | gen-install.py:59 | gen-install.py:59 | — | — |

**Status**: REQ-F-PKG-001 has no feature carrier and no test.

#### REQ-F-GATE-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-GATE-001 | REQ-F-GATE.yml | ADR-008 | schedule.py iterate() | schedule.py:5 | test_schedule.py | test_schedule.py:5 |
| REQ-F-GATE-002 | REQ-F-ENGINE-CORRECTNESS.yml | ADR-014 | schedule.py iterate() | schedule.py:6 | test_commands.py, test_integration_workflows.py, test_e2e_sandbox.py | test_commands.py:5, test_integration_workflows.py:6, test_e2e_sandbox.py:12 |

**Status**: Full chain intact.

#### REQ-F-TAG-*, REQ-F-COV-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-TAG-001 | REQ-F-TRACE.yml | ADR-009 | __main__.py (check-tags) | __main__.py:4 | test_main.py | test_main.py:4 |
| REQ-F-TAG-002 | REQ-F-TRACE.yml | ADR-009 | __main__.py (check-tags) | __main__.py:5 | test_main.py | test_main.py:5 |
| REQ-F-COV-001 | REQ-F-TRACE.yml | ADR-009 | __main__.py (check-req-coverage) | __main__.py:6 | test_main.py | test_main.py:6 |

**Status**: Full chain intact.

#### REQ-F-DOCS-*, REQ-F-VIS-*, REQ-F-WKSP-*, REQ-F-BIND-*

| REQ | Feature | ADR | Code Owner | Impl Tag | Test | Validates Tag |
|-----|---------|-----|-----------|----------|------|---------------|
| REQ-F-DOCS-001 | REQ-F-DOCS.yml | ADR-010 | README.md | __main__.py:10 | test_docs.py | test_docs.py:1 |
| REQ-F-VIS-001 | REQ-F-VIS.yml | ADR-013 | commands.py _close_completed_features() | commands.py:8 | test_vis.py, test_integration_workflows.py | test_vis.py:1, test_integration_workflows.py:11 |
| REQ-F-WKSP-001 | REQ-F-WKSP.yml | — | schedule.py, core.py, gen-install.py | schedule.py:4, gen-install.py:2 | test_schedule.py, test_e2e_sandbox.py | test_schedule.py:4, test_e2e_sandbox.py:7 |
| REQ-F-BIND-001 | REQ-F-ENGINE-CORRECTNESS.yml | — | bind.py (exception handling) | bind.py:3 | test_bind.py, test_integration_workflows.py, test_e2e_sandbox.py | test_bind.py:1 (partial), test_integration_workflows.py:8, test_e2e_sandbox.py:14 |

**Status**: Full chain intact.

---

## Unregistered Capabilities (Phase 2 — code exists, no REQ key)

| Capability | Code Location | What It Does | REQ Key | Feature | ADR | Tests |
|------------|--------------|--------------|---------|---------|-----|-------|
| **EC3 — Context digest in spec_hash** | bind.py:50-73 | `job_evaluator_hash()` includes `ctx:{name}:{digest}` lines. Context content changes invalidate F_P certifications. | **NONE** | **NONE** | **NONE** | **NONE** |
| **EC1 — Manifest ID + pending fluent** | commands.py:289-498, manifest.py:63, schedule.py:136-137 | `manifest_id` generated per dispatch. `_find_pending_dispatch()` checks EC fluent. Auto-loop halts on `"pending"`. | **NONE** | **NONE** | **NONE** | **NONE** |
| **A1 — PackageSnapshot carrier** | core.py:105-162, __main__.py:629-632 | `init_snapshot()` sets module-level ID. `emit()` injects `package_snapshot_id` into work events. | **NONE** | **NONE** | **NONE** | **NONE** |

**Status**: All three have code but zero traceability at every other node. The `Implements: REQ-F-EVAL-002` tag on bind.py is a false trace for EC3 — REQ-F-EVAL-002 does not specify context digest behaviour.

---

## Summary Counts (verified by automated tag scan)

| Metric | Count |
|--------|-------|
| REQ keys with full chain (feature + impl tag + validates tag) | 37 |
| REQ keys with partial chain | 8 |
| Unregistered capabilities (code, no REQ) | 3 (EC3, EC1, A1) |
| Total REQ keys in requirements.md | 45 |
| Feature vectors (completed/iterating) | 22 |
| REQ keys with no feature carrier | 1 (REQ-F-PKG-001) |
| ADRs | 19 |

### Partial Chain Details

| REQ | Has Feature | Has Impl Tag | Has Val Tag | Note |
|-----|------------|-------------|------------|------|
| REQ-F-EC-001 | Yes | **No** | **No** | Five prime operators — structural, distributed across files |
| REQ-F-EC-003 | Yes | **No** | **No** | Three convergence models — structural |
| REQ-F-EC-005 | Yes | **No** | **No** | Rejection ≠ revocation — kind isolation untested |
| REQ-F-EC-006 | Yes | **No** | **No** | assessed result values — indirect coverage only |
| REQ-F-PKG-001 | **No** | Yes | **No** | Starter spec generation — no feature, no test |
| REQ-F-PROV-005 | Yes | **No** | Yes | Orphan tolerance — comment-only impl, no tag |
| REQ-F-TEST-001 | Yes | **No** | Yes | Architecture req — no code to tag (debatable) |
| REQ-F-TEST-002 | Yes | **No** | Yes | Architecture req — no code to tag (debatable) |
