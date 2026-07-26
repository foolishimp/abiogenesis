# F_H Decision - Accept T-270 Reconciled run.invoke Design

Accept the independently reviewed final T-270 design at digest
`71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430`
for runtime reconciliation.

The accepted boundary exposes only `abg.operation.run.invoke`; keeps the GTL
program as the program and GraphFunction as its callable member; requires AF-13
selection and AF-14 intent admission before T-270; confines T-270 to the exact
AF-15 authority join, non-effect start-admission witness, sole
effect-authorizing execution basis, and T-271 entry; and returns evidence to
AF-16 or held truth to T-272.

No legacy `catalog.invoke`, direct selection, GraphFunction-as-program,
profile-free fallback, caller-authored runtime authority, T-267 mutation,
Consensus branch, second session/basis, or direct raw-result closure is
authorized.
