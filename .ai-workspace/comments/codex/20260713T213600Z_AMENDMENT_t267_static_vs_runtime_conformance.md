# T-267 Design Amendment: Static Unit Versus Runtime Admission

**Timestamp**: 2026-07-13T21:36:00Z
**Ticket**: T-267
**Disposition**: bounded correction under delegated F_H authority

## Observation

The live T-252 `submitted_structure` report contains 619 issues. T-267 owns
560 exact TraversalUnit composition, stage, result-interface, and conservation
issues. The remaining 59 are pre-existing C-algebra semantic-realization and
unused graph-node observations. T-252 and T-264 explicitly retained those
observations while declining complete-program or runtime admission.

The accepted T-267 design incorrectly required a zero-issue whole-program
report even for the static unit-closure outcome. That made the T-267 compiler
incapable of reporting its own bounded success without either suppressing
unrelated diagnostics or absorbing work it does not own.

## Correction

T-267 now separates two judgments:

1. static unit closure requires the exact source, bundle, projected unit, and
   absence of any T-267-owned or exact-unit issue; and
2. runtime addressability additionally requires the complete admitted report
   to pass with zero issues.

A new closed outcome,
`static_contracts_admitted_program_blocked`, preserves a valid T-267 bundle
while recording the unchanged blocking report and denying effects. Existing
submitted-structure diagnostics are neither erased nor reclassified.

## Scope

This correction changes no GTL body, source authority, conformance predicate,
runtime atom, capability law, or release claim. It prevents a static compiler
slice from pretending that unrelated complete-program truth has closed.
