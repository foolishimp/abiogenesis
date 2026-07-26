# T-270 Runtime Schema Topology Amendment Decision

## Decision

Accept exact design digest
`2df86cb900cf263383b552a9a81459cac11889f5bc2ee4e8dd094f4ff3079471`
under the delegated F_H authority for ABIogenesis 5.0. Runtime implementation
may continue only within this bounded correction.

## Amendment

The prior design incorrectly grouped duplicate metadata tuples and repeated
flat contract keys under one refusal rule. The corrected relation is:

- each `graphFunctionId + nodeRef + symbolicSchemaRef` tuple is unique and must
  name an exact contained Node of a GraphFunction in the carried Module;
- the contained set is the exact-identity union of inputs, outputs, environment
  requires/provides/carries, and inline-graph nodes; equal Node ids deduplicate
  only when their complete Node values agree;
- a mismatched GraphFunction, Node, or symbolic schema ref refuses in M04;
- repeated `contractId + contractVersion` keys are lawful references from many
  metadata rows to one exact asserted native definition; and
- duplicate asserted definitions for one distinct key still refuse.

This is a design correction, not a product or requirement reprice. It preserves
the full-Module join before selected-GraphFunction projection, the neutral
M03/M04 boundary, the identity-free callable envelope, and the prohibition on
callables in stable carriers.

## Authority Conservation

The amendment changes no public identity, schema identity, registry, store,
event, capability owner, or callable owner. It removes an over-strong refusal
that contradicted Prime contraction and closes one missing Module-topology
admission check.
