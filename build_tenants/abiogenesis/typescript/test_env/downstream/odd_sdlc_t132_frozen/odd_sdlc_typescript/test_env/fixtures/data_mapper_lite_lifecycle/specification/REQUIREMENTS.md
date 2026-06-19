# Data Mapper Lite Requirements

**Derived From**:
`build_tenants/typescript/test_env/fixtures/data_mapper_reference/data_mapper.template/specification/REQUIREMENTS.md`

**Selected Requirement IDs**:

- REQ-LDM-01
- REQ-LDM-02
- REQ-LDM-03

## REQ-LDM-01 Strict Graph Structure

The Logical Data Model must be defined as a directed multigraph where entities
are Objects and relationships are Morphisms.

Acceptance criteria:

- Multiple edges between the same pair of entities are representable.
- Each entity has an identity morphism.
- Every relationship has explicit source and target.
- Graph structure is queryable and traversable programmatically.

## REQ-LDM-02 Cardinality Types

Every morphism must declare exactly one categorical cardinality type from
`1:1`, `N:1`, or `1:N`.

Acceptance criteria:

- Missing cardinality is rejected.
- Unknown cardinality is rejected.
- Cardinality metadata is queryable at runtime.

## REQ-LDM-03 Strict Dot Hierarchy And Composition Validity

Symbolic dot paths are valid only when each referenced morphism exists and each
codomain composes into the next domain.

Acceptance criteria:

- Valid paths are accepted.
- Missing morphisms are rejected.
- Domain/codomain mismatch is rejected.
- Error messages identify the failed composition constraint.

