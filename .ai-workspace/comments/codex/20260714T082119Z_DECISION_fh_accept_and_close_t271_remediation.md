# F_H Decision: Accept And Close T-271 Remediation

- ticket: T-271
- decision: accepted and closed
- accepted implementation checkpoint: `3e726aa1`
- evidence checkpoint: `89f30002`
- authority: explicit user F_H ruling, "approval given continue"
- date: 2026-07-14

## Basis

The accepted repair closes the five post-implementation findings: canonical
retry coordination and receipts, exact complete-program C-call locus identity,
result-cardinality and batch-result conservation, deterministic replay-owned
batch projection, and rederived T-254 selected-program authority.

The remediation self-review additionally rejects forged retry-policy evidence
and resealed altered batch projections before effects. Final verification is
`1717/1717` semantic tests, `56/56` focused integration tests, `82/82` GTL
tests, packed API `1/1`, and green census, schema, publication, governance,
Mermaid, lint, pack, and diff gates.

## Boundary

This ruling closes T-271 only. It authorizes T-267 to re-enter design over the
sealed complete-program plan. It does not accept the superseded T-267 design,
authorize public invocation, admit tenant capability, permit Consensus
effects, or close DS-3.
