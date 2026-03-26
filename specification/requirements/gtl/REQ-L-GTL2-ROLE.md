# REQ-L-GTL2-ROLE — Semantic Capability Roles

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-012
**Supersedes**: (new — retroactive V2 semantic correction)
**Wave**: 2

---

## Purpose

`Role` is a first-class GTL declaration of semantic capability class.

A role states what kind of actor may perform, supervise, or approve a job or graph contract. It is not a concrete actor identity, not a run, and not an authentication artifact.

## Acceptance Criteria

**REQ-L-GTL2-ROLE-001**: `Role` shall be a first-class GTL declaration type.

**REQ-L-GTL2-ROLE-002**: A role shall express a semantic capability class required to perform, supervise, or approve a GTL job or graph contract.

**REQ-L-GTL2-ROLE-003**: `Role` is distinct from `Worker`. Role is language-owned semantic capability; Worker is engine-owned concrete identity.

**REQ-L-GTL2-ROLE-004**: GTL shall allow roles to be attached to semantic jobs and, where lawful, to graph contracts such as `GraphVector` or `GraphFunction`.

**REQ-L-GTL2-ROLE-005**: A role may carry opaque policy, authority, or approval hooks as declarative metadata. These hooks are inputs to external policy resolution, not an in-language security model.

**REQ-L-GTL2-ROLE-006**: GTL shall not implement authentication or authority resolution. Those remain external concerns.
