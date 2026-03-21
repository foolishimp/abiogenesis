# Manual Assurance Statement

**Date**: 2026-03-21
**Method**: Derived from forward trace matrix, backward failure matrix, and trace gap register
**Test baseline**: 343 passed, 1 failed (self-hosting e2e)

---

## What Is Supported by Evidence

The following claims are supported by a complete chain from intent through requirements, features, design, code, and passing tests:

### Core Engine (37/45 REQ keys — full chain, verified by automated tag scan)

1. **Graph topology**: 6-asset SDLC graph with typed edges, markov stability conditions, evaluator assignment. (REQ-F-GRAPH-001, -002)

2. **Convergence engine**: `iterate()` drives candidates toward stability. `project()` derives state from event stream deterministically. `emit()` appends events with validation. `schedule()` partitions workers by write territory. (REQ-F-CORE-001 through -006)

3. **Three evaluator types**: F_D (live execution), F_P (certified fluent projection), F_H (operative fluent projection). Gate ordering enforced: F_D → F_P → F_H. (REQ-F-GATE-001, -002)

4. **Commands**: `gen-gaps`, `gen-iterate`, `gen-start` work correctly. Edge convergence certificates carry feature field. Auto-loop halts on all specified conditions. (REQ-F-CMD-001 through -004)

5. **Event Calculus foundation**: Five prime operators with kind discriminator. Two fluents (operative, certified). Revocation terminates fluents symmetrically. Write-primitive validation enforces schema. (REQ-F-EC-001, -002, -004)

6. **Provenance**: Workflow version read at startup, annotated on events, gates spec_hash computation. Carry-forward preserves approvals across versions. Orphan tolerance for graph evolution. (REQ-F-PROV-001 through -005)

7. **Traceability**: Implements/Validates tag enforcement. REQ key coverage checks. Per-REQ-key impl and validates coverage evaluators. (REQ-F-TAG-001, -002, REQ-F-COV-001, REQ-F-EVAL-003)

8. **Bootstrap**: gen-install bootstraps .genesis/. Config resolves Package/Worker. Evaluator commands validated for safety. Feature lifecycle closure. (REQ-F-BOOT-001, -002, REQ-F-EVAL-001, -004, -005, REQ-F-VIS-001)

9. **Spec-snapshot binding**: assessed events carry spec_hash. Stale hashes rejected. Hash computation is version-aware (job_evaluator_hash vs req_hash). (REQ-F-EVAL-002, REQ-F-PROV-003)

10. **Test architecture**: Integration-primary surface with property invariant tests. (REQ-F-TEST-001, -002)

### Design Surfaces (19 ADRs)

All 19 ADRs are accepted and have corresponding code. The design layer is complete for the registered requirements.

### Feature Vectors (21 completed, 1 iterating)

All 45 REQ keys are covered by at least one feature vector except REQ-F-PKG-001 (starter spec generation).

---

## What Is Still Unproven

### Self-Hosting Gate (INT-001 §8) — BLOCKED

The self-hosting test (`test_engine_evaluates_own_workspace`) fails with `total_delta=5`. All five failing evaluators are F_P — their prior `assessed` events carry stale `spec_hash` values caused by ad hoc evaluator description churn.

**This means**: We cannot prove the engine can build itself. The engine works correctly (all F_D pass, mechanism is sound), but the certification evidence is invalid.

**Unblock**: Stabilise evaluator descriptions → re-run e2e → green.

### Three Unregistered Capabilities — NO TRACEABILITY

| Capability | Code exists | REQ | Feature | ADR | Test |
|------------|------------|-----|---------|-----|------|
| EC3 — Context digest in spec_hash | Yes | No | No | No | No |
| EC1 — Manifest ID + pending fluent | Yes | No | No | No | No |
| A1 — PackageSnapshot carrier | Yes | No | No | No | No |

These capabilities are functional but completely invisible to the traceability system. If they broke silently, no test would detect it. If someone asked "what does the engine guarantee about context invalidation?" — the spec has no answer.

### 8 Partial REQ Keys (verified)

| REQ | Missing | Risk |
|-----|---------|------|
| REQ-F-EC-001 | no-impl-tag, no-val-tag | Structural — five primes distributed across files. Low risk but untagged. |
| REQ-F-EC-003 | no-impl-tag, no-val-tag | Three convergence models — exercised indirectly but no targeted test. |
| REQ-F-EC-005 | no-impl-tag, no-val-tag | Rejection ≠ revocation — if kind isolation broke, nothing catches it. Medium risk. |
| REQ-F-EC-006 | no-impl-tag, no-val-tag | Assessed result values — indirect coverage only. |
| REQ-F-PKG-001 | no-feature, no-val-tag | Starter spec generation — code exists, no test. |
| REQ-F-PROV-005 | no-impl-tag | Orphan tolerance — structural guarantee, comment only, tested via provenance integration. |
| REQ-F-TEST-001 | no-impl-tag | Architecture req — no code to tag (debatable). Has Validates tag. |
| REQ-F-TEST-002 | no-impl-tag | Architecture req — no code to tag (debatable). Has Validates tag. |

### One False-Green

`test_bind.py` claims `Validates: REQ-F-EVAL-002` but does not test the context digest extension added by EC3. The tag overstates the actual coverage.

---

## Assurance Level Summary

| Claim | Level | Evidence |
|-------|-------|----------|
| Engine convergence logic is correct | **High** | 343 passing tests, all F_D pass in self-hosting, mechanism works as designed |
| Engine is self-hosting | **NOT PROVEN** | e2e test fails due to evaluator hash churn |
| Phase 2 hardening (EC3, EC1, A1) works | **Low** | Code exists, no tests, no spec backing |
| Provenance binding works | **High** | Dedicated integration tests pass |
| Event Calculus model is complete | **Moderate** | EC-001, -002, -004 tested; EC-003, -005, -006 only indirectly |
| Full traceability chain is intact | **Moderate** | 37/45 REQ keys have full chain; 8 partial, 3 unregistered |

---

## Recommended Sequence to Restore Full Assurance

1. **Stabilise evaluator descriptions** → restore e2e green → self-hosting gate passes
2. **Backfill REQ keys** for EC3, EC1, A1 → spec leads, code follows (retroactively)
3. **Write targeted tests** for EC3, EC1, A1, EC-005 → assurance gaps closed
4. **Fix tags** — add Implements tags for EC-003, EC-005, EC-006; fix false Validates on test_bind.py
5. **Create feature vector** for REQ-F-PKG-001
6. **Complete REQ-F-BOOTDOC** feature (unit tests)

After steps 1-4, the self-hosting gate passes and all Phase 2 code has full traceability.
