# GTL 3 Implementation Plan

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [README.md](../../../../specification/requirements/gtl/README.md), [TESTCASE_AUTHORITY.md](../../../../specification/scenarios/TESTCASE_AUTHORITY.md), [GTL_3_MODULE_DESIGN.md](./GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](./GTL_3_INTERFACE_CONTRACTS.md)

## Purpose

Record the left-to-right delivery order for the TypeScript GTL 3 line and the
design constraints that govern the current implementation wave.

## Delivery Order

1. GTL 3 requirement authority
   Status: complete
2. GTL 3 requirements
   Status: complete
3. GTL 3 testcase authority
   Status: complete in `specification/scenarios/`
4. TypeScript tenant design surfaces
   Status: active governing wave
5. GTL TypeScript first code slice (`M01-gtl-core` only)
   Status: completed by `T-009`
6. GTL TypeScript publication slice (`M02-work-publication`)
   Status: completed by `T-010`
7. ABG TypeScript first runtime slice
   Status: completed by `T-011`

## Current GTL 3 Rewrite Scope

- define TypeScript carrier shapes for first-slice GTL declaration truth
- preserve `GraphVector.declarations` through graph and frame serialization
- keep semantic work entry on published `GraphFunction` contracts
- preserve hook references as data, not executable publication truth
- land the first pure algebra layer over admitted `M01` carriers without
  widening into publication or runtime scopes
- establish package-first TypeScript build posture without coupling GTL law to
  one runtime
- keep the TypeScript tenant inside one explicit typing discipline from the
  start

The first code slice boundary is:

- `M01-gtl-core` only
- carriers named in `GTL_3_FIRST_SLICE_IACS.md`
- strict lane pinned in `TYPESCRIPT_STRICT_LANE.md`

This plan authorized `M02` code only under:

- `GTL_3_M02_WORK_PUBLICATION_IACS.md`
- `TYPESCRIPT_STRICT_LANE.md`
- completed ticket `T-010`

`T-009` completed the GTL `M01` slice only.
`T-010` completed the GTL `M02` publication/work slice.
Later delivery steps in this plan are future design direction until successor
tickets activate them explicitly.

No later runtime/bootstrap successor is active yet.
Later runtime projections, app/bootstrap waves, and scenario qualification
still require successor tickets before code may widen into them.

## Pre-Code Gates

Before the first TypeScript GTL code slice starts, the tenant must satisfy
`TYPESCRIPT_REALIZATION_GUARDRAILS.md`.

That means the slice must already name:

1. its irreducible architectural carrier set
2. its authoritative/downstream carrier role matrix
3. its subordinate payload register
4. its bounded strict typing lane
5. its governance-versus-builder boundary
6. its package/runtime boundary
7. one negative-proof fixture for fail-closed ingress

If those are absent, implementation is starting too early.

## TypeScript Realization Rules

- `strict` typing is mandatory
- published semantic carriers use readonly data shapes
- ingress validation happens once before semantic code trusts a payload
- `any` is not lawful in semantic carriers
- unchecked `as` casts are not lawful at the semantic center
- runtime-specific wrappers belong at the shell, not in GTL publication law

## Rejected Shapes

- do not introduce a standalone policy semantic language into GTL
- do not publish raw runtime callables as requirement-authoritative hook truth
- do not defer `GraphVector.declarations` to product-local overlays
- do not preserve `GraphVector` as a public callable or semantic job target
- do not replace one open JSON bag with many fragment classes that do not carry
  real authority
- do not bind GTL publication law directly to Node-only, Bun-only, or Deno-only
  assumptions in this first design wave
