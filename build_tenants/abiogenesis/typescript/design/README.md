# ABIogenesis TypeScript Design

## Current Boundary

The ABIogenesis 5.0 Product and direct-GTL M3 architecture are accepted.
GOALS selects the current S05 reconciliation under T-270. M05 Sections 1
through 12 are accepted at S03. The current S05 boundary is a separate
design-only delta pending exact review and direct human acceptance.

The current design basis is:

- accepted M03 and M05 Sections 1 through 12 at S03 candidate `8865ccff`;
- [M05 S05 Consensus Global-To-Local Design](./M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md);
  and
- [ADR-045 Global Design Constraints Survive Local Projection](./adrs/ADR-045-global-design-constraints-survive-local-projection.md)
  as rationale.

Current M03/M05 working-tree material after the accepted S03 cut is retained
design-discovery evidence. It is not accepted S05 design and is not part of
the current review subject unless the S05 delta incorporates it explicitly.
Completed T-272 and T-286 remain evidence only.

## Governing Truth

Read in this order:

1. specification/GOALS.md
2. specification/INTENT.md
3. specification/PRODUCT.md
4. specification/requirements/
5. the current design basis above
6. .ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md

Specification defines WHAT. The current design basis defines HOW within the
S05 boundary selected by GOALS and T-270.

## Historical Evidence

Other files in this directory and `build_tenants/common/design` are donor or
historical evidence unless GOALS, the active ticket, or the current design
basis explicitly consumes them. They may supply retained behavior, test ideas,
and native-carrier evidence only through an active owner.

They do not define current modules, interfaces, sequencing, public operations,
or implementation authority. A maintained historical file list is
intentionally omitted because it would create a second stale design-status
projection; Git and the T-284 correction vector preserve that inventory.

## Implementation Gate

T-270 permits only mechanical readiness work on the exact S05 design subject.
Implementation, S06, observer/tuner, complete conservation, qualification, and
release remain held. Freeze the design once, hand it to independent reviewers,
and stop editing until their findings are consolidated or F_H directs the next
step.
