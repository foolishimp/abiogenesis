# ABIogenesis TypeScript Design

## Current Boundary

The ABIogenesis 5.0 Product and direct-GTL M3 architecture are accepted.
GOALS retains S05 as the current unresolved Product outcome and selects one
bounded S04 design-only reframe while the exact S05 candidate awaits
acceptance. M05 Sections 1 through 12 are accepted at S03. S04 realization
remains held.

The current design basis is:

- accepted M03 and M05 Sections 1 through 12 at S03 candidate `8865ccff`;
- [M05 S05 Consensus Global-To-Local Design](./M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md);
  the accepted S05 realization basis;
- [M05 S04 Observer And Tuner Global-To-Local Design](./M05_S04_OBSERVER_TUNER_GLOBAL_TO_LOCAL_DESIGN.md),
  the current candidate design-only boundary resolving exact overlay-relative
  workspace evaluation and immutable catalog derivation `A -> A1`;
- [ADR-045 Global Design Constraints Survive Local Projection](./adrs/ADR-045-global-design-constraints-survive-local-projection.md)
  as global-to-local rationale; and
- [ADR-047 Reflective Optimization Is GTL Over Replay](./adrs/ADR-047-reflective-optimization-is-gtl-over-replay.md)
  as the current CLI/replay decision.

M05 Section 13 remains superseded by the accepted S05 design. M05 Sections
14.3 through 14.7 are superseded for S04 by the candidate design above and are
design-discovery evidence only. Sections 14.1 and 14.2 remain provisional S06
material. Completed T-272 and T-286 remain evidence only.

## Governing Truth

Read in this order:

1. specification/GOALS.md
2. specification/INTENT.md
3. specification/PRODUCT.md
4. specification/requirements/
5. the current design basis above
6. .ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md
7. .ai-workspace/tickets/active/T-268-publish-abg-5-tenant-conformance-manifest-consensus-coverage.md

Specification defines WHAT. Accepted design defines HOW for S05. The S04
candidate defines no implementation authority until independently reviewed and
directly accepted.

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

T-270 retains the frozen S05 candidate. T-268 permits S04 design and mechanical
readiness work only. S06 and S04 implementation, complete conservation,
qualification, and release remain held. Freeze the S04 design once, hand it to
independent reviewers, and stop editing until findings are consolidated or F_H
directs the next step.
