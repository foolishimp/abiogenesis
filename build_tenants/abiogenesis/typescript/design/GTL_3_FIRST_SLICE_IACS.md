# GTL 3 First Slice IACS

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [GTL_3_MODULE_DESIGN.md](./GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](./GTL_3_INTERFACE_CONTRACTS.md)

## Purpose

Declare the first GTL TypeScript implementation slice as an explicit
irreducible architectural carrier set rather than letting code discover that
boundary by drift.

This document is the pre-code carrier inventory for the first GTL code wave.

## First Slice Boundary

The first GTL TypeScript code wave is:

- `M01-gtl-core` declaration carriers only
- publication and replay preservation for those carriers only
- ingress/admission for declaration payloads used by those carriers only

This wave does **not** include:

- `M02-work-publication` semantic work carriers
- `M03-engine-kernel` runtime interpretation
- package/bootstrap adapters
- scenario or qualification harness code

## Irreducible Architectural Carrier Set

The first GTL code wave is allowed exactly these prime carriers:

1. `Context`
2. `Node`
3. `Graph`
4. `GraphVector`
5. `GraphFunction`

No other top-level carrier is prime in this wave.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `Context` | `M01-gtl-core` | authoritative | declaration parser | none | `Node`, `GraphVector`, `Graph`, `GraphFunction` |
| `Node` | `M01-gtl-core` | authoritative | declaration parser | none | `Graph`, `GraphVector`, `GraphFunction` |
| `Graph` | `M01-gtl-core` | authoritative | declaration parser | none | publication/replay, materialization input |
| `GraphVector` | `M01-gtl-core` | authoritative | declaration parser | none | `Graph`, `GraphFunction`, runtime materialization input |
| `GraphFunction` | `M01-gtl-core` | authoritative | declaration parser | none | `M02-work-publication`, ABG materialization input |

The first GTL wave has no downstream projection carrier families of its own.
It produces authoritative declaration truth only.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `SchemaRef` | subordinate | nested node declaration payload; not an independently traversed boundary | admitted once by `admitSchemaRef(...)` |
| `AssetSurface` | subordinate | nested node declaration payload; not an independently traversed boundary | admitted once by `admitAssetSurface(...)` |
| `SerializedAttrs` | subordinate | declaration payload detail; not identity-bearing | admitted once by `admitSerializedAttrs(...)` |
| `SerializedAttrEntry` | subordinate | nested entry detail only | admitted only as part of `SerializedAttrs` |
| `SerializedJsonValue` | subordinate | serialized ingress payload only | parsed once, never inspected directly in semantic kernels |
| `HookRef` | subordinate | nested declaration payload; no independent boundary | admitted once by `admitHookRef(...)` |
| `Operator` | subordinate | first-class GTL declaration, but not a prime outer carrier in the first slice | admitted once by `admitOperator(...)` |
| `Evaluator` | subordinate | first-class GTL declaration, but not a prime outer carrier in the first slice | admitted once by `admitEvaluator(...)` |
| `Rule` | subordinate | first-class GTL declaration, but not a prime outer carrier in the first slice | admitted once by `admitRule(...)` |
| `EnvRef` | subordinate | nested graph-function declaration payload | admitted once by `admitEnvRef(...)` |
| `TemplateRef` | subordinate | nested graph-function publication payload, not a standalone prime boundary | admitted once by `admitTemplateRef(...)` |
| effect refs | subordinate | nested graph or graph-function declaration detail | admitted as part of `Graph` and `GraphFunction` |
| tags | subordinate | metadata only | carried as immutable list |
| `ContractRef` | deferred | belongs to `M02-work-publication` | not in first GTL wave |
| `Role` | deferred | belongs to `M02-work-publication` | not in first GTL wave |
| `Job` | deferred | belongs to `M02-work-publication` | not in first GTL wave |
| `Module` | deferred | belongs to `M02-work-publication` | not in first GTL wave |
| `CandidateFamily` | deferred | outside first-wave GTL carrier closure | later GTL wave |
| `RefinementBoundary` | deferred | outside first-wave GTL carrier closure | later GTL wave |

## First Slice Rules

- `GraphVector.source` is `readonly Node[]`. Single-source vectors use a
  one-element array. No singular/plural convenience union is lawful in this
  wave.
- `Node.schema` is carried through one closed subordinate `SchemaRef`
  representation in the TypeScript line. The TypeScript tenant may choose how
  to represent concrete versus symbolic schema references, but it must preserve
  both without semantic loss.
- First-wave GTL carriers use explicit defaults or explicit nullability. They
  do not use optional-field shells as a stand-in for a closed carrier family.
- No prime carrier in this wave may carry `unknown`, `Record<string, unknown>`,
  or an index-signature bag as semantic truth.
- `GraphFunction.environment`, `GraphFunction.template`, and
  `Node.assetSurface` are required subordinate declaration surfaces in this
  wave. They are not optional implementation detail.
- `Operator`, `Evaluator`, and `Rule` are real first-class GTL declaration
  surfaces in this wave, but they remain subordinate to the five prime outer
  carriers rather than becoming peer prime carriers themselves.
- Serialized declaration payloads are publication/replay inputs only. Semantic
  consumers must admit them once before using them.

## Promotion Rule

No subordinate payload may be promoted during the first GTL code wave unless:

1. it acquires independent authority,
2. it is consumed across more than one prime boundary unchanged, and
3. the promotion is recorded by updating this document and the guardrail
   register first.
