# GTL 3 M02 Work Publication IACS

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [GTL_3_MODULE_DESIGN.md](./GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](./GTL_3_INTERFACE_CONTRACTS.md), [GTL_3_FIRST_SLICE_IACS.md](./GTL_3_FIRST_SLICE_IACS.md)

## Purpose

Declare the `M02-work-publication` TypeScript implementation slice as an
explicit publication/work carrier set rather than letting code infer the
boundary from package glue, helper wrappers, or open-object publication bags.

This document is the pre-code carrier inventory for the first GTL publication
wave after `T-009`.

## M02 Boundary

The `M02` TypeScript code wave is:

- semantic work declarations
- graph-function-first callable publication boundaries
- authored `Module` publication truth
- replayable discoverability across module publication and import
- published selection-boundary carriers

This wave does **not** include:

- ABG runtime execution carriers
- executable job or worker binding
- package/bootstrap orchestration doctrine
- scenario/sandbox qualification beyond the bounded publication/work proofs

## Upstream Authoritative Carriers Consumed By M02

`M02` builds over already-landed GTL declaration truth from `M01`.

The following carriers remain authoritative upstream inputs and are not
redefined by `M02`:

- `Graph`
- `GraphFunction`
- `Operator`
- `Evaluator`
- `Rule`

`GraphFunction` remains the sole public named callable carrier.
`M02` may publish or reference it.
`M02` must not replace it with a rival public work-entry type.

## Irreducible Architectural Carrier Set

The `M02` code wave is allowed exactly these new prime carriers:

1. `Role`
2. `Job`
3. `RefinementBoundary`
4. `CandidateFamily`
5. `Module`

No other new top-level carrier is prime in this wave.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `Role` | `M02-work-publication` | authoritative | declaration parser | none | `Job`, `Module`, external policy resolution |
| `Job` | `M02-work-publication` | authoritative | declaration parser | none | `Module`, later ABG executable-job binding |
| `RefinementBoundary` | `M02-work-publication` | authoritative | declaration parser | none | `Module`, later discoverability and selection consumers |
| `CandidateFamily` | `M02-work-publication` | authoritative | declaration parser | none | `Module`, later discoverability and selection consumers |
| `Module` | `M02-work-publication` | authoritative | declaration parser | none | import/replay surfaces, later ABG materialization and binding |

`GraphFunction` is an upstream authoritative carrier consumed by `Job`,
`CandidateFamily`, and `Module`.
It remains M01-owned declaration truth and the only callable public carrier.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `ContractRef` | subordinate | nested indirection payload owned by `Job`; no standalone traversal boundary | admitted once by `admitContractRef(...)` |
| `ModuleImport` | subordinate | nested module dependency payload only | admitted once by `admitModuleImport(...)` |
| `Role.policyHooks` | subordinate | nested hook/config payload, not an independent publication carrier | admitted as `SerializedAttrs` within `Role` |
| `CandidateFamily.policyHints` | subordinate | nested visible selection/config payload, not an independent carrier | admitted as `SerializedAttrs` within `CandidateFamily` |
| `RefinementBoundary.hints` | subordinate | nested visible refinement/config payload | admitted as `SerializedAttrs` within `RefinementBoundary` |
| `Module.metadata` | subordinate | nested immutable publication metadata | admitted as `SerializedAttrs` within `Module` |
| published declaration indexes | downstream | replay/discoverability projection, not authority | derived from admitted `Module` truth only |

## M02 Rules

- `GraphFunction` remains the sole public named callable carrier.
  `Job` binds `GraphFunction` by `ContractRef(kind="graph_function", targetId=...)`.
- `Job` must not target `GraphVector` or any other internal realized structure.
- `Module` is the constitutional publication carrier.
  Package manifests, runtime loaders, and npm exports are delivery bindings
  only and must not become rival publication authority.
- `CandidateFamily` and `RefinementBoundary` remain explicit structural
  selection boundaries.
  Their hints are visible and replayable, not executable hidden strategy.
- `Module` publication/replay must preserve ids and admitted declaration truth
  from upstream `Graph`, `GraphFunction`, `Operator`, `Evaluator`, and `Rule`
  carriers without reconstructive wrappers.
- `Role.policyHooks`, `CandidateFamily.policyHints`, `RefinementBoundary.hints`,
  and `Module.metadata` remain admitted serialized attributes, not open objects.

## Promotion Rule

No subordinate payload may be promoted during the `M02` code wave unless:

1. it acquires independent authority,
2. it crosses more than one prime publication boundary unchanged, and
3. the promotion is recorded here and in the guardrail register first.
