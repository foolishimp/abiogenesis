# REQ-L-GTL2-MODULE — Module and Library Structure

**Status**: Active
**Category**: Capability
**Date**: 2026-03-25
**Derives from**: INT-GTL2-004, INT-GTL2-009, INT-GTL2-012
**Supersedes**: REQ-F-GRAPH (replaced — Package portions)
**Wave**: 2

---

## Purpose

Module is the top-level organizational unit. Modules may be published as reusable workflow libraries.

## Acceptance Criteria

**REQ-L-GTL2-MODULE-001**: `Module` shall own: graphs, graph functions, jobs, roles, operators, evaluators, rules, imports, and metadata visible to policy/evaluator layers.

**REQ-L-GTL2-MODULE-002**: Modules may be published as reusable workflow libraries. Imported graph functions, jobs, and roles must preserve interface truth, declared role semantics, and module provenance.

**REQ-L-GTL2-MODULE-003**: The current `Package` concept is subsumed by `Module` as the graph/module carrier.

**REQ-L-GTL2-MODULE-004**: When a module publishes graph functions, their identities, outer contracts, and materialization-visible metadata shall remain inspectable to importing consumers rather than collapsing into anonymous realized graphs.
