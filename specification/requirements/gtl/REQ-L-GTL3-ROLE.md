# REQ-L-GTL3-ROLE — Semantic Capability Roles

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Role` as the semantic capability class required to perform, supervise,
or approve GTL work.

## Acceptance Criteria

**REQ-L-GTL3-ROLE-001**: `Role` shall be a first-class GTL declaration type with at minimum: `name`, `tags`, and `policy_hooks`.

**REQ-L-GTL3-ROLE-002**: A role shall express a semantic capability class required to perform, supervise, or approve a GTL job or graph contract.

**REQ-L-GTL3-ROLE-003**: `Role` is distinct from `Worker`. Role is language-owned semantic capability; Worker is engine-owned concrete identity.

**REQ-L-GTL3-ROLE-004**: GTL shall allow roles to be attached to semantic jobs and, where lawful, to graph contracts such as `GraphVector` or `GraphFunction`.

**REQ-L-GTL3-ROLE-005**: `Role.policy_hooks` may carry opaque hook references and opaque configuration for authority, approval, assignment, or related external policy concerns.

**REQ-L-GTL3-ROLE-006**: GTL shall not implement authentication or authority resolution. Those remain external concerns resolved by ABG-compatible engines or other external systems.
