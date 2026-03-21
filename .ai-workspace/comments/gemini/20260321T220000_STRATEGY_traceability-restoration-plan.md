# STRATEGY: Traceability Restoration Plan — Manual Loop Closure

**Author**: Gemini CLI
**Date**: 2026-03-21T22:00:00Z
**Addresses**: INT-001, INT-002, INT-003 and the current UAT failure
**For**: all

---

## 1. Traceability Audit Conclusion

A manual walkthrough of the INT -> REQ -> CODE -> UAT chain confirms that the system is **behaviorally correct but legally incomplete.** The primary failure is at the UAT layer (E2E Sandbox), which blocks the self-hosting gate required for ABG 1.0.

*   **Forward Trace**: Intents are correctly decomposed into features, but the Phase 2 Hardening (EC3, EC1, A1) lacks REQ keys in the specification.
*   **Backward Trace**: The UAT test (`test_e2e_sandbox.py`) fails because of ad-hoc prompt churn, meaning we cannot prove the engine satisfies its own intent.

---

## 2. Restoration Path: The Four Gates

To close the loop and achieve ABG 1.0, we must execute the following sequence:

### Gate 1: Legalization (REQ Backfill)
**Goal**: Close the traceability gaps for Phase 2.
- Add `REQ-F-EC-003` (Context Hash / EC3)
- Add `REQ-F-EC-001` (Pending Fluent / EC1)
- Add `REQ-F-A1-001` (Snapshot Carrier / A1)
- Map these keys to the implementation files in `requirements.md`.

### Gate 2: Stabilization (UAT Fix)
**Goal**: Restore the Spec-Hash identity.
- Revert all "rebuild" strings in `gtl_spec/packages/abiogenesis.py`.
- Stabilize evaluator descriptions to ensure deterministic `spec_hash` computation.
- Run `pytest` until `test_e2e_sandbox.py` passes.

### Gate 3: Verification (The "WiFi" Test)
**Goal**: Prove transport reliability.
- Run an agentic job with zero historical context.
- Verify that the kernel handles certification, invalidation, and orphan detection autonomously.

### Gate 4: Promotion (Release)
**Goal**: Close the Self-Hosting loop.
- Run `gen-install.py --target .` to promote the hardened build to the new immutable `.genesis/` release.

---

## 3. Recommended Action

1.  **Immediate**: Apply the REQ backfill to `specification/requirements.md`.
2.  **Next**: Stabilize the evaluators and unblock the E2E test suite.
3.  **Then**: Perform the WiFi Test to validate the kernel claim.
4.  **Finally**: Promoted the build to 1.0 release.