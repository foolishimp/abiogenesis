# ABIogenesis TypeScript Design

## Current Boundary

The ABIogenesis 5.0 Product and direct-GTL M3 architecture are accepted.
GOALS selects the current S03 reconciliation under T-270. M05 Sections 1
through 11 are the accepted expansion basis; Section 12 is retained evidence
under current T-270 reconciliation.

The current design basis is:

- [M03 Direct GTL Traversal Behavior Design](./M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md)
- [M05 Direct GTL Traversal Expansion Design](./M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md)

The historical accepted M03 SHA-256
`9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`
remains immutable provenance. The current M03 projection, changed only to
propagate the selected STDO `v2.2.0` qualification identity, is
`12334d2d814c47a954f55cd9664c006fd331fdafaa3fb043b95a35e8832e285f`.
Completed T-272 and T-286 are evidence only and select no further work.

## Governing Truth

Read in this order:

1. specification/GOALS.md
2. specification/INTENT.md
3. specification/PRODUCT.md
4. specification/requirements/
5. the current design basis above
6. .ai-workspace/tickets/active/T-270-bind-public-catalog-invocation-to-execution-authority.md

Specification defines WHAT. The current design basis defines HOW within the
S03 boundary selected by GOALS and T-270.

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

The M3 hold is released. T-286 may promote only work that advances exact
`ABI5-ROOT-001` under the accepted design. Donor code, tests, package exports,
generated manifests, and runtime paths remain inadmissible unless T-286 names
their T-284 disposition and proof.

No horizontal feature work precedes that installed steel thread.
