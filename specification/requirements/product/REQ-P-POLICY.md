# REQ-P-POLICY — Product and Runtime Policy

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-007
**Supersedes**: REQ-F-BOOT (replaced — policy portions), REQ-F-VIS (replaced)
**Wave**: 2

---

## Purpose

Product-level policy (feature closing, human proxy, merge gates, CLI behavior) lives above the GTL/ABG constitutional stack.

## Acceptance Criteria

**REQ-P-POLICY-001**: Product policy (feature closing, visibility rules, human proxy mode, CLI loop behavior) shall be expressed as product-layer requirements, not GTL language law or ABG interpreter law.

**REQ-P-POLICY-002**: Policy may consume GTL tags, evaluator results, and convergence state — but policy logic shall not be embedded in the language or interpreter kernel.
