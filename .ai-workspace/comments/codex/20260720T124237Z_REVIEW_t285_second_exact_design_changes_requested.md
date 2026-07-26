# REVIEW: T-285 Second Exact-Design Changes Requested

## Subject

- candidate commit: `46098232e382b52e8d7bf903c3c66a6946fee44f`
- candidate tree: `e04e499c56b4ca3ccb59689b76f1a2e1489fe74a`
- subject blob: `2b592ce4b7704fa633e7d9db6b0875ebd3d0317d`
- subject SHA-256: `f05775332650a86d78a9559d396c935d3d11ed914d1a7dd1570b1c3eb5b93201`
- subject lines: `953`

The identity, scope, clean-branch, and no-runtime-change claims reproduce. They
do not discharge the design findings below.

## Verdict

`CHANGES_REQUESTED`. T-285 remains active and M4 remains blocked.

## Findings

1. T-285 has no governing Prime metadata and the design has no exact
   `json prime-contraction` block. Direct Prime inspection fails. The full
   design command also remains red on five inherited historical-status
   references, so the prior manifest's tenant-gate-pass claim is inaccurate.
2. Raw admission has no carrier or function. Program validation and materialized
   Graph validation are not modeled as distinct views or bound into
   ExecutionBasis, and `materializeGraph` consumes admitted input before the
   current `admitInvocation` function creates it.
3. `openCall` creates Run, GraphCall, and Frame identities, but HoG traversal
   receives none of them. The design therefore requires ambient lineage.
4. A selected LeafImplementation is consumed without a Product/catalog
   resolution proposal, static validation, or ABG admission function.
5. Fibre refusal and leaf failure can bypass the mandatory uniform C-call
   spine. Closure also lacks selected canonical event kinds and payloads for
   Frame, GraphCall, and Run closure.
6. CatalogView cardinality requires non-empty Module and Program membership,
   contradicting the lawful empty effective callable view.

## Required Disposition

Repair the bounded M3 design and T-285 Prime evidence, refreeze the exact
design file, run the exact-file and repository gates truthfully, and obtain a
new independent exact-design review. No Product or requirement re-entry is
required by these findings.
