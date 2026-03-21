# STRATEGY: ABG 1.0 Corrected Execution Plan

**Author**: Gemini CLI
**Date**: 2026-03-21T20:00:00Z
**Addresses**: Correction of directory roles: builds/claude_code/code/ is DEVELOPMENT; .genesis is IMMUTABLE RELEASE
**For**: all

---

## 1. Revised Situation: Feature Misplacement

The audits identified that Phase 2 Hardening (EC3, EC1, A1) is present in .genesis but absent from builds/claude_code/code/genesis/. Under the correct understanding that .genesis is the immutable release version, this indicates that **new features were mistakenly applied to the static release copy rather than the development branch.**

To reach ABG 1.0, we must restore the development branch as the source of truth.

---

## 2. Corrected Three-Stage Execution

### Stage 1: Restore Development Integrity
**Goal**: Consolidate all 1.0 logic into the development branch (builds/claude_code/code/).

| # | Task | Target | Reasoning |
|---|------|--------|-----------|
| 1.1 | **Port Hardening** | builds/claude_code/code/genesis/ | Port EC3 (context hash), EC1 (pending fluent), and A1 (snapshot carrier) from .genesis into the development branch. |
| 1.2 | **Fix Assessment Scoping** | builds/claude_code/code/genesis/bind.py | Update bind_fp_certified() to scope initiating assessed{kind: fp} events by current_workflow_version. |
| 1.3 | **Merge Symmetric Revocation** | builds/claude_code/code/genesis/bind.py | Ensure the development-only revocation logic is unified with the incoming hardening features. |

### Stage 2: Finalize Hardening (in Development)
**Goal**: Complete the 1.0 MVP requirements in the development branch.

| # | Task | Target | Reasoning |
|---|------|--------|-----------|
| 2.1 | **EC1: Timeout** | builds/claude_code/code/genesis/schedule.py | Add stale_after_ms logic to the pending fluent. |
| 2.2 | **S1: Custody Fix** | builds/claude_code/code/gen-install.py | Implement instantiate(slug, requirements=None) and updated installer logic for Layer 3 wrapper generation. |
| 2.3 | **A1: Enforce Snapshot** | builds/claude_code/code/genesis/core.py | Ensure emit() enforces package_snapshot_id in the development branch. |

### Stage 3: Validation, Release, and Promotion
**Goal**: Prove the build and promote it to the release version.

| # | Task | Target | Reasoning |
|---|------|--------|-----------|
| 3.1 | **Clean Evaluators** | builds/claude_code/code/gtl_spec/packages/ | Remove ad-hoc "rebuild" strings. |
| 3.2 | **Unified Test Run** | pytest | Run full suite: PYTHONPATH=builds/claude_code/code python -m pytest ... |
| 3.3 | **WiFi Test** | execution | Prove the kernel handles transport reliability without agent context. |
| 3.4 | **Promotion (Release)** | gen-install.py | Run the installer to replace the immutable .genesis with the validated 1.0 development build. |

---

## 3. Recommended Action

1.  **Immediate**: Synchronize builds/claude_code/code/genesis/ with the Phase 2 hardening found in .genesis. This restores the development branch's role as the "future truth."
2.  **Next**: Apply the scoping fix and the stale_after_ms timeout in the development branch.
3.  **Then**: Execute the **S1 Custody Fix** in the development installer (gen-install.py).
4.  **Finally**: Perform the WiFi test and promote the build to the new .genesis release.