# Backward Failure Matrix

**Date**: 2026-03-21
**Method**: Manual walk per Codex restoration plan
**Seed failure**: `test_e2e_sandbox.py::TestSelfHosting::test_engine_evaluates_own_workspace`

---

## 1. Failure → Test Surface

**Failure**: `total_delta=5`, `converged=False`

Five F_P evaluators are failing. All F_D evaluators pass. All F_H evaluators pass. The failure is exclusively in the `certified` fluent — prior `assessed{kind: fp, result: pass}` events no longer match the current `spec_hash`.

| # | Edge | Failing Evaluator | Category | Passing Evaluators |
|---|------|------------------|----------|-------------------|
| 1 | requirements→feature_decomp | `decomp_complete` | F_P | `req_coverage` (F_D), `decomp_approved` (F_H) |
| 2 | feature_decomp→design | `design_coherent` | F_P | `design_approved` (F_H) |
| 3 | design→bootloader_doc | `synthesize_bootloader` | F_P | `gtl_type_consistency` (F_D) |
| 4 | design→code | `code_complete` | F_P | `impl_tags` (F_D), `impl_coverage` (F_D) |
| 5 | code↔unit_tests | `coverage_complete` | F_P | `tests_pass` (F_D), `validates_tags` (F_D), `validates_coverage` (F_D) |

**Test surface**: `test_e2e_sandbox.py:332` — asserts `data["converged"] is True`.

**Note**: `intent→requirements` edge is converged (delta=0). The `intent_approved` (F_H) evaluator passes.

---

## 2. Test Surface → Code Owner

The failure mechanism is `spec_hash` mismatch. The certification identity of each F_P evaluator has changed, invalidating all prior `assessed{kind: fp, result: pass}` events.

| Component | File | Role in Failure |
|-----------|------|----------------|
| **spec_hash computation** | bind.py `job_evaluator_hash()` | Computes hash from evaluator definitions (name, category, command, description) + context digests. This is the LEFT side of the match. |
| **spec_hash comparison** | commands.py `gen_gaps()` / `gen_iterate()` | Passes computed `spec_hash` to `delta()` which passes to `bind_fd()`. The spec_hash must match what's stored in `assessed` events. This is the RIGHT side. |
| **evaluator definitions** | gtl_spec/packages/abiogenesis.py | Source of evaluator descriptions. **This is where the churn happened.** Ad hoc `rebuild 2026-03-21 symmetric-revoke` suffixes were appended to evaluator descriptions, changing the hash. |
| **assessed events** | .ai-workspace/events/events.jsonl | Contains prior `assessed{kind: fp, result: pass}` events with old `spec_hash` values. These no longer match. |

**Root cause code owner**: `gtl_spec/packages/abiogenesis.py` — the evaluator description strings were mutated as ad hoc change markers. The hash mechanism (bind.py) is working correctly — it's the inputs that were changed carelessly.

---

## 3. Code Owner → Design / ADR

| Design Surface | Relevance | Status |
|----------------|-----------|--------|
| ADR-011 (Spec-Snapshot Binding) | Defines `spec_hash` mechanism — assessments carry a hash, stale hashes don't match | **Working as designed** |
| ADR-016 (Prime Operators / EC) | Defines `certified` fluent semantics — `assessed{kind: fp, result: pass}` initiates, spec_hash mismatch terminates | **Working as designed** |
| REQ-F-EVAL-002 | "Changing any evaluator definition invalidates all prior F_P assessments for that job" | **Working as designed** |
| REQ-F-PROV-003 | "job_evaluator_hash replaces req_hash when provenance is present" — includes description in hash | **Working as designed** |

**Classification**: This is NOT a design bug and NOT an implementation bug. The design and implementation are correct. The failure is caused by **operational misuse** — evaluator descriptions were used as ad hoc change markers, which the spec_hash mechanism correctly treats as a spec change.

---

## 4. Design → Feature / REQ

| Broken Area | Feature | REQ Key | Gap Type |
|-------------|---------|---------|----------|
| spec_hash mechanism | REQ-F-EVAL-SNAP.yml | REQ-F-EVAL-002 | **Not broken** — mechanism is correct |
| evaluator hash computation | REQ-F-PROV-001.yml | REQ-F-PROV-003 | **Not broken** — hash correctly includes description |
| evaluator description stability | **NO FEATURE** | **NO REQ** | **Operational gap** — no requirement states that evaluator descriptions must be stable. No F_D check prevents ad hoc description churn. |

**Gap register entry**: The system has no guard against evaluator description churn. The spec_hash mechanism treats description as normative (correct — it IS the F_P contract), but there is no discipline or F_D check preventing casual modifications to descriptions as change markers.

---

## 5. REQ / Feature → Intent

| Intent Clause | Satisfied? | Evidence |
|---------------|-----------|----------|
| INT-001 §2 — Convergence engine | **YES** — engine converges correctly | All F_D pass, all F_H pass. The engine correctly detects stale certifications. |
| INT-001 §6 — Provenance binding | **YES** — provenance invalidates stale assessments | spec_hash mismatch is the designed invalidation mechanism working correctly. |
| INT-001 §8 — Self-hosting gate | **NO** — self-hosting test fails | `test_engine_evaluates_own_workspace` asserts `converged=True` but gets `total_delta=5`. The engine cannot certify itself because its own evaluator descriptions were mutated. |

**Intent gap**: INT-001 §8 (self-hosting gate) is unsatisfied. The engine works correctly but cannot prove it works because the self-hosting workspace has stale certification events caused by evaluator description churn.

**Fix path**: Stabilise evaluator descriptions in `abiogenesis.py`. Remove ad hoc `rebuild` suffixes. This restores hash identity alignment between current spec and existing assessed events. Alternatively, re-certify all F_P edges (the clean-start approach — but unnecessary since the descriptions should simply not have been changed).

---

## Additional Backward Traces (Phase 2 unregistered capabilities)

### EC3 — Context digest in spec_hash

```
Evidence: no test exercises context digest invalidation
  → Code: bind.py:50-73 job_evaluator_hash() includes ctx:{name}:{digest}
    → Design: NONE — no ADR documents this
      → Feature: NONE
        → REQ: NONE — REQ-F-EVAL-002 does not specify context digests
          → Intent: INT-001 §6 (provenance) — context changes SHOULD invalidate, but this isn't specified
```

**Gap classification**: trace-gap (no REQ), design-gap (no ADR), assurance-gap (no test)

### EC1 — Manifest ID + pending fluent

```
Evidence: no test exercises duplicate dispatch prevention
  → Code: commands.py:289-498 _find_pending_dispatch()
    → Design: NONE — no ADR
      → Feature: NONE
        → REQ: NONE
          → Intent: INT-001 §4 (commands) — gen-start should not re-dispatch, but this isn't specified
```

**Gap classification**: trace-gap, design-gap, assurance-gap

### A1 — PackageSnapshot carrier enforcement

```
Evidence: no test validates work events carry package_snapshot_id
  → Code: core.py:105-162 init_snapshot() + emit() injection
    → Design: NONE — no ADR
      → Feature: NONE
        → REQ: NONE — REQ-F-PROV-002 covers workflow_version, not snapshot_id
          → Intent: INT-001 §6 (provenance) — events should carry provenance, but snapshot_id isn't specified
```

**Gap classification**: trace-gap, design-gap, assurance-gap
