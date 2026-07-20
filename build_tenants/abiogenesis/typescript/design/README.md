# ABIogenesis TypeScript Design

## Current Boundary

The ABIogenesis 5.0 Product, M2 correction vector, and direct-GTL M3 design are
accepted. Existing design files other than the exact accepted design remain
historical donor evidence and are not ABIogenesis 5.0 realization authority.

The sole accepted current design is:

- [M03 Direct GTL Traversal Behavior Design](./M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md)

Its exact SHA-256 is
`9faeb41ddac839edc9cd2ccb83ae11b05bb54d32168fc35e74a1a9cfb97e92f0`.
Direct human F_H accepted it under T-285; T-286 consumes it for M4.

## Governing Truth

Read in this order:

1. specification/GOALS.md
2. specification/INTENT.md
3. specification/PRODUCT.md
4. specification/requirements/
5. the accepted design above
6. .ai-workspace/tickets/active/T-286-establish-installed-abi5-root.md

Specification defines WHAT. The accepted design defines the M4 HOW.

## Historical Evidence

All other files in this directory and build_tenants/common/design are frozen
donor or historical evidence. They may supply retained behavior, test ideas,
and native-carrier evidence only through the accepted T-284 selective-admission
process.

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
