# GTL 3 Implementation Plan

**Status**: Active
**Date**: 2026-04-05
**Derived from**: [GTL_3_CONSTITUTIONAL_DESIGN.md](../../../../specification/GTL_3_CONSTITUTIONAL_DESIGN.md), [README.md](../../../../specification/requirements/gtl/README.md), [TESTCASE_AUTHORITY.md](../../../../specification/scenarios/TESTCASE_AUTHORITY.md), [GTL_3_MODULE_DESIGN.md](./GTL_3_MODULE_DESIGN.md), [GTL_3_INTERFACE_CONTRACTS.md](./GTL_3_INTERFACE_CONTRACTS.md)

## Purpose

Record the left-to-right delivery order for the GTL 3 rewrite and the design
constraints that govern the current implementation wave.

## Delivery Order

1. GTL 3 constitution
   Status: complete
2. GTL 3 requirements
   Status: complete
3. GTL 3 testcase authority
   Status: complete in `specification/scenarios/`
4. GTL 3 design surfaces
   Status: complete in this design root
5. GTL implementation rewrite
   Status: active current wave
6. ABG engine changes to consume GTL 3 more fully
   Status: deferred until the GTL line is explicit and shipped

## Current GTL 3 Rewrite Scope

- add `GraphVector.declarations` to the GTL core type model
- reprice semantic work entry from bare `GraphVector` contracts to published
  `GraphFunction` contracts
- preserve graph-vector declarations through graph and frame serialization
- retarget GTL implementation trace tags from GTL 2 families to GTL 3 families
- retarget GTL design and qualification trace surfaces away from deleted GTL 2
  authority
- update authored GTL package metadata to the GTL 3 requirement line

## Rejected Shapes

- do not introduce a standalone policy semantic language into GTL
- do not publish raw Python callables as constitutional hook truth
- do not defer `GraphVector.declarations` to product-local overlays
- do not preserve `GraphVector` as a public callable or semantic job target
- do not move ABG stage 6 runtime behavior into GTL stage 5 as ad hoc
  implementation shortcuts
