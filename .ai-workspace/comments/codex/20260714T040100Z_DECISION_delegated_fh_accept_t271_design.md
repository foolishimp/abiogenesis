# Decision: Accept T-271 Complete C-Program Interpreter Design

**Date**: 2026-07-14
**Ticket**: `T-271`
**Decision**: `accepted`
**Authority**: explicit standing F_H delegation for section-by-section work,
self-review, remediation, and continuation until owner return

## Decision

Accept
`build_tenants/abiogenesis/typescript/design/M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md`
as the implementation authority for T-271.

The accepted boundary is:

- compile canonical admitted C syntax once into a path-indexed structural plan;
- preserve all seven constructors without adding recurse to the C family;
- delegate stage/workflow effects to existing atoms;
- factor batch/retry coordination so nested wrappers do not create synthetic
  C-call spines;
- derive runtime position from plan plus replay; and
- keep public routing, whole-program conservation, graph recurse, and tenant
  capability publication with T-270, T-267/T-262, and T-268 respectively.

This decision authorizes T-271 implementation and focused proof. It does not
accept implementation, close the ticket, or restore a DS-3 completion claim.
