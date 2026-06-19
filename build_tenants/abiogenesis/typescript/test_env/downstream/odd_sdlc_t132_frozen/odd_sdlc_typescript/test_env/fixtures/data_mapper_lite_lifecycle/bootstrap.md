# Data Mapper Lite Lifecycle Bootstrap

This fixture is a narrow data_mapper bootstrap for T-188. It is not a toy
product brief. It selects a small requirement subset from the canonical
data_mapper requirements document so the SDLC lifecycle can prove depth without
running the full data_mapper workload.

Canonical source:

```text
build_tenants/typescript/test_env/fixtures/data_mapper_reference/data_mapper.template/specification/REQUIREMENTS.md
```

Selected requirements:

- REQ-LDM-01
- REQ-LDM-02
- REQ-LDM-03

## Intent

Build a small data-mapper topology compiler that proves the SDLC can derive
design, implementation, generated tests, execution evidence, and release
pressure from real data_mapper requirements.

## Product Definition

Product name: `data_mapper_lite_lifecycle`

Active tenant: `data_mapper_lite_javascript`

Selected output root:

```text
build_tenants/data_mapper_lite_javascript
```

The generated product is a JavaScript package with no runtime dependency on
odd_sdlc, GTL, ABG, or the scenario harness.

The generated product must provide:

- `build_tenants/data_mapper_lite_javascript/package.json`
- `build_tenants/data_mapper_lite_javascript/src/topology.js`
- `build_tenants/data_mapper_lite_javascript/test/topology.test.js`

The implementation must expose a public API that can:

- construct a directed multigraph of entities and morphisms;
- validate morphism cardinality metadata;
- validate symbolic dot paths against graph composition constraints;
- return clear validation errors for invalid graph, cardinality, or path
  definitions.

## Requirement Subset

### REQ-LDM-01 Strict Graph Structure

The Logical Data Model must be defined as a directed multigraph where entities
are Objects (nodes) and relationships are Morphisms (edges).

Acceptance criteria:

- LDM can represent multiple edges between the same pair of entities.
- Each entity is a valid Object with identity morphism.
- All relationships are directed edges with explicit source and target.
- The graph structure is queryable and traversable programmatically.

### REQ-LDM-02 Cardinality Types

Every edge (morphism) in the LDM must declare its categorical type to enable
proper context lifting and type safety.

Acceptance criteria:

- Every morphism has exactly one cardinality type from `1:1`, `N:1`, `1:N`.
- Invalid or missing cardinality values are rejected with clear errors.
- Cardinality metadata is queryable at runtime.

### REQ-LDM-03 Strict Dot Hierarchy And Composition Validity

A path must be expressed using symbolic dot notation. A path is valid only when
all composition rules are satisfied.

Acceptance criteria:

- Each referenced morphism is defined in the LDM topology.
- The codomain of each morphism equals the domain of the next.
- Invalid paths are rejected with clear error messages.
- Error messages identify which composition constraint failed.

## Technology Stack

The tenant-local stack definition is authoritative for implementation details.
It is declared under:

```text
build_tenants/data_mapper_lite_javascript/spec/TECH_STACK.json
build_tenants/data_mapper_lite_javascript/spec/TESTING_TECH_STACK.json
```

## Generated File Contract

The fixture must not contain generated implementation or test files before
traversal:

```text
build_tenants/data_mapper_lite_javascript/package.json
build_tenants/data_mapper_lite_javascript/src/topology.js
build_tenants/data_mapper_lite_javascript/test/topology.test.js
```

## Proof Shape

The lifecycle proof must traverse through generated test execution evidence.
External harness process checks are not enough. Closure requires the installed
operator to admit test execution evidence from the generated product tests.

