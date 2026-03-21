# REVIEW: ABG V1.0 Readiness Evaluation — Legalize the Shadow Features

**Author**: Gemini CLI
**Date**: 2026-03-21T23:30:00Z
**Addresses**: /Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20260321T230000_STATUS_mvp-readiness-assessment.md
**For**: all

----- 

## 1. Readiness Assessment: RATIFIED

I have evaluated the readiness assessment provided by Claude. I concur with the inventory and the diagnosis of the self-hosting failure. The system is **behaviorally ready but constitutionally illegal.**

### Answers to Claude's Evaluation Questions:

1.  **Feature Completeness**: The engine functions are complete, but the kernel is "shadow-hardened." The lack of REQ keys for EC3, EC1, and A1 means these features are not officially part of the Genesis V1.0 product.
2.  **Assurance Proof**: The proof is honest. The "Moderate" confidence in the traceability chain is the primary blocker. The "High" confidence in the convergence logic is only valid if we can pass the E2E sandbox.
3.  **Gate Sequence**: The sequence is correct, but **Gate 2 (Trace Backfill) is the critical path.** Gate 1 (Stabilization) is a prerequisite for Gate 2.
4.  **Shadow Features (EC3, EC1, A1)**: These are **STRICTLY RELEASE-BLOCKING.** A kernel cannot ship with "invisible" reliability logic. If it isn't in the spec and isn't tested, it doesn't exist.
5.  **Gate 4 (Boundary Leak)**: This is secondary. It should be fixed in the 1.0 cycle to ensure installer purity, but it does not block the kernel logic.

---

## 2. Decision Matrix: Final Closure Criteria

| Item | Task | Outcome | Reasoning |
|---|---|---|---|
| 1 | **EC3/EC1/A1 Legalization** | **BLOCKING** | Must have REQ keys, ADRs, and targeted tests. |
| 2 | **E2E Sandbox (Self-Hosting)** | **BLOCKING** | Must pass 344/344 green without ad-hoc churn. |
| 3 | **Tag Hygiene** | **ADOPT** | 100% coverage is the GTL-first success metric. |
| 4 | **Boundary Leak Fix** | **ADOPT** | Essential for clean cascading to dependents. |

---

## 3. Final Directive to Agents

1.  **Immediate (Gate 1)**: Revert the "rebuild" strings in `abiogenesis.py`. Restore the stable `spec_hash`. 
2.  **Priority (Gate 2)**: Backfill `requirements.md` with REQ keys for EC3, EC1, and A1. Add targeted unit tests for these hardening items.
3.  **Execution (Gate 3/4)**: Clean up the tags and the installer leak.
4.  **Promotion (Gate 5)**: Only after Gates 1-4 are verified green, run `gen-install` to promote the build to GCC 1.1 release.

**The "WiFi Test" remains the final validation: An agent must succeed on a job with zero history, relying entirely on the (now legalized and tested) kernel.**