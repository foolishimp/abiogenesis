# REQ-R-ABG2-TRANSPORT — Agent Transport

**Status**: Active
**Category**: Capability
**Date**: 2026-03-24
**Derives from**: INT-GTL2-010
**Supersedes**: ADR-022 (implementation decision, now grounded in 2.x requirement)
**Wave**: 1

---

## Purpose

ABG dispatches F_P actors through a transport layer. The transport must isolate the agent process, sanitize inherited environment, and return structured results that preserve substrate truth separately from payload-contract truth.

## Acceptance Criteria

**REQ-R-ABG2-TRANSPORT-001**: F_P dispatch shall use subprocess transport. The agent process shall not inherit the caller's full environment — only explicitly allowed variables are forwarded.

**REQ-R-ABG2-TRANSPORT-002**: The transport shall return structured output (exit code, stdout, stderr) sufficient for `classify_failure()` to determine substrate failure or payload-contract failure without parsing agent internals as domain truth.

**REQ-R-ABG2-TRANSPORT-003**: Transport timeout shall be configurable per dispatch. Timeout expiry shall produce a classifiable failure (transport_failure), not an unhandled exception.

**REQ-R-ABG2-TRANSPORT-004**: Nonzero exit, timeout, crash, or equivalent subprocess failure shall remain `transport_failure` even if a result artifact exists. Artifact presence shall not erase subprocess truth.

**REQ-R-ABG2-TRANSPORT-005**: Missing or empty result artifacts shall classify as `no_output`. Malformed or payload-contract-invalid result artifacts shall classify as `contract_failure`. When the caller supplies a schema validator at the transport boundary, schema-invalid artifacts are payload-contract-invalid.

**REQ-R-ABG2-TRANSPORT-006**: Certification failure is not a transport classification. It is projected downstream from evaluator facts and shall remain distinct from substrate and payload-contract failure.
