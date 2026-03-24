# REQ-R-ABG2-TRANSPORT — Agent Transport

**Status**: Active
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: ADR-022 (implementation decision, now grounded in 2.x requirement)
**Wave**: 1

---

## Purpose

ABG dispatches F_P actors through a transport layer. The transport must isolate the agent process, sanitize inherited environment, and return structured results.

## Acceptance Criteria

**REQ-R-ABG2-TRANSPORT-001**: F_P dispatch shall use subprocess transport. The agent process shall not inherit the caller's full environment — only explicitly allowed variables are forwarded.

**REQ-R-ABG2-TRANSPORT-002**: The transport shall return structured output (exit code, stdout, stderr) sufficient for `classify_failure()` to determine the failure class without parsing agent internals.

**REQ-R-ABG2-TRANSPORT-003**: Transport timeout shall be configurable per dispatch. Timeout expiry shall produce a classifiable failure (transport_failure), not an unhandled exception.
