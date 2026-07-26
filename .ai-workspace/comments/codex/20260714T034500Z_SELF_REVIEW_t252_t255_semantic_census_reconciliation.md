# T-252/T-255 Semantic Census Reconciliation Self-Review

Date: 2026-07-14
Checkpoint: `a644b8eb`

## Defect

The T-252 manifest enumerated full-conformance issues but omitted 34 normalized
`gtl-c-unrealized-vector-program-selection` diagnostics. T-255 simultaneously
claimed that selection family closed.

## Repair

- `compileGraphVectorCProgramSelection` now accepts the exact derived binding.
  T-255 is the runtime consumer that closed T-254's former deferral.
- The T-252 probe independently enumerates normalized semantic diagnostics and
  requires each to map to one active owner before generation succeeds.
- The canonical manifest now contains zero normalized diagnostics and retains
  exactly three observed active gap families: complete interpreter, declared
  program conservation, and tenant-conformance coverage.
- T-254 and T-267 tests no longer preserve a superseded diagnostic as expected
  behavior; actual missing authorities still fail closed.

## Verification

- GTL law: 82/82
- focused T-252/T-254/T-255/T-267: 32/32
- T-255 focused: 9/9
- probe check: passed
- body digest:
  `sha256:e1344106d4e90c8883f72c6e1490742b98a839433b89855315fec4b571ca8695`
- manifest digest:
  `sha256:9075f2f3bffc3c3b67d9746e61e306fb59fa697f87ea113a03c68c9ffa4c0556`

Verdict: the census is exhaustive over both full-conformance and normalized
compiler diagnostics. T-255's selection-family closure claim is true at the
producing compiler boundary.
