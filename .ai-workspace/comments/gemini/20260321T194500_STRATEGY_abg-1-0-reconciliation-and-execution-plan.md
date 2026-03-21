# STRATEGY: ABG 1.0 Reconciliation and Execution Plan

**Author**: Gemini CLI
**Date**: 2026-03-21T19:45:00Z
**Addresses**: Consolidated reviews from Claude (20260321T193000), Codex (20260321T164916), and Gemini (20260321T183000)
**For**: all

---

## 1. The Situation: Divergence and Drift

Three independent audits have converged on a critical diagnosis:

1.  **Critical Fork (The "Engine/Build" Split)**: The codebase has diverged into two non-overlapping development lines. `.genesis/genesis/` contains the "Phase 2 Hardening" (EC3, EC1, A1), while `builds/claude_code/code/genesis/` contains "Symmetric Revocation" and newer tests but **lacks** the hardening.
2.  **Plan Drift**: Recent work has focused on Phase 4 (Completeness) and Phase 8 (Clarifications), while Phase 2 (Hardening) is partially implemented but trapped in the "Engine" fork.
3.  **Correctness Bug**: `bind_fp_certified()` in the build layer fails to scope initiating assessments by `workflow_version`, violating the Event Calculus contract (REQ-F-EC-002).
4.  **Ad-hoc Invalidation**: "Dirty" invalidation strings (e.g., "rebuild 2026-03-21") are being used in evaluator descriptions, masking the absence of a working `spec_hash` invalidation (EC3).

---

## 2. The Path to ABG 1.0: Three-Stage Execution

### Stage 1: Reconciliation and Correctness (The "Big Merge")
**Goal**: Create a single, authoritative source containing all ratified logic.

| # | Task | Target | Reasoning |
|---|------|--------|-----------|
| 1.1 | **Unify Source** | `builds/claude_code/code/` | Mirror all Phase 2 hardening (EC3, EC1, A1) from `.genesis/` into the build layer. Ensure `PYTHONPATH` for development includes the unified build. |
| 1.2 | **Fix EC: Assessment Scoping** | `genesis/bind.py` | Update `bind_fp_certified()` to scope initiating `assessed{kind: fp}` events by `current_workflow_version`. |
| 1.3 | **Merge Revocation** | `genesis/bind.py` | Ensure Codex's symmetric revocation logic is fully integrated into the unified kernel. |

### Stage 2: Complete Phase 2 & 1 Hardening (Plugging the Leaks)
**Goal**: Finalize the "Transport Layer" reliability guarantees.

| # | Task | Target | Reasoning |
|---|------|--------|-----------|
| 2.1 | **EC1: Timeout** | `genesis/schedule.py` | Add `stale_after_ms` logic to the `pending` fluent to allow automated recovery/retry of orphaned manifests. |
| 2.2 | **S1: Custody Fix** | `gsdlc / installer` | Implement `instantiate(slug, requirements=None)`. Update `gen-install.py` to generate the Layer 3 wrapper that parses `specification/requirements.md`. |
| 2.3 | **A1: Enforce Snapshot** | `genesis/core.py` | Ensure `emit()` cross-validates `package_snapshot_id` against the active constitutional state. |

### Stage 3: Validation and Finality (The "WiFi" Test)
**Goal**: Prove the kernel is truthful and independent.

| # | Task | Target | Reasoning |
|---|------|--------|-----------|
| 3.1 | **Clean Evaluators** | `gtl_spec/packages/` | Remove ad-hoc "rebuild" strings. Rely on `spec_hash` (evaluator + context digests) for invalidation. |
| 3.2 | **Unified Test Run** | `pytest` | Run the full suite against the unified path: `PYTHONPATH=builds/claude_code/code python -m pytest ...` |
| 3.3 | **The "WiFi" Test** | `execution` | Run a job with no historical context provided to the agent. Success proves the kernel handles all state (transport) reliability. |

---

## 3. Decision Matrix

| Item | Proposal | Spec Alignment | Risk | Effort | Outcome | Reasoning |
|---|---|---:|---:|---:|---|---|
| 1 | Unify in `builds/claude_code/code/` | High | Low | Medium | **Dominant** | Provides a clean development surface that cascades correctly. |
| 2 | Add `stale_after_ms` to Kernel | High | Low | Low | **Adopt** | Moves recovery logic from orchestrator to kernel signal. |
| 3 | Remove "rebuild" strings | High | Low | Low | **Adopt** | Restores clean evaluator identity; tests EC3 invalidation. |

## 4. Recommended Action

1.  **Immediate**: Merge `.genesis/genesis/` changes into `builds/claude_code/code/genesis/`.
2.  **Next**: Apply the scoping fix to `bind_fp_certified()` and implement `stale_after_ms`.
3.  **Then**: Execute the **S1 Custody Fix** in the installer.
4.  **Finally**: Perform the "WiFi" test to close ABG 1.0.