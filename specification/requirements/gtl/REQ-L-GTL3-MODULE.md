# REQ-L-GTL3-MODULE — Module And Library Structure

**Status**: Active
**Category**: Capability
**Date**: 2026-04-05
**Derives from**: [SPEC_METHOD.md](../../../.genesis/docs/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](../../../.genesis/docs/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md)

---

## Purpose

Define `Module` as the publication boundary for GTL 3 declarations.

## Acceptance Criteria

**REQ-L-GTL3-MODULE-001**: `Module` shall own graphs, graph functions, refinement boundaries, candidate families, jobs, roles, operators, evaluators, rules, imports, and metadata.

**REQ-L-GTL3-MODULE-002**: Modules may be published as reusable GTL workflow libraries.

**REQ-L-GTL3-MODULE-003**: `Module` is the constitutional publication carrier. `Package` is not a distinct constitutional carrier.

**REQ-L-GTL3-MODULE-004**: Published graph functions, refinement boundaries, candidate families, jobs, and roles shall remain inspectable to importing consumers rather than collapsing into anonymous realized surfaces.

**REQ-L-GTL3-MODULE-005**: Module metadata shall be an immutable declaration surface visible to consumers, policy resolution, and replay.

**REQ-L-GTL3-MODULE-006**: A module may declare module-level `policy_hooks` as visible publication defaults for imported graph functions, jobs, roles, and runtime policy resolution. Module policy hooks shall not override more specific declared hook truth unless the hook family explicitly names that precedence.
