# T176 GTL Language Capability - TypeScript HOW And Gap Analysis

**Status**: Active design/read-model artifact
**Date**: 2026-06-30
**Ticket**: T-176
**Constitutional source**: `specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md`

## Purpose

This document records the current TypeScript HOW binding for the GTL language
capability model and identifies gaps between the language-agnostic WHAT and
the current implementation.

This is not a requirement surface. Comparative implementation facts and gap
rows are read-model material. They shall not replace the live requirement
family.

## Source Grounding

- `code/src/gtl/m01/contracts/carriers.ts`
- `code/src/gtl/m01/contracts/constructors.ts`
- `code/src/gtl/m01/algebra/core.ts`
- `code/src/gtl/m02/contracts/carriers.ts`
- `code/src/gtl/m02/contracts/constructors.ts`
- `code/src/gtl/m02/contracts/compute_notation.ts`
- `code/src/gtl/requirements/index.ts`
- `code/src/abg/m03/contracts/gtl_program_conformance.ts`
- `code/src/abg/m03/contracts/overlay_frame.ts`
- `test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs`

## Current TypeScript Language Capability Binding

| GTL capability | Current TypeScript binding | Classification |
| --- | --- | --- |
| declaration syntax | Immutable carrier objects plus constructors in `gtl/m01` and `gtl/m02` | Implemented as TypeScript carrier/API syntax |
| typed attributes and context | `SerializedAttrs`, `SerializedAttrValue`, `HookRef`, `Context`, `SchemaRef` | Implemented and aligned as carrier/API binding |
| graph topology | `Node`, `GraphVector`, `Graph`, `EnvRef`, `TemplateRef`, `GraphFunction` | Implemented and aligned |
| graph algebra | `sameObject`, `edge`, `identity`, `graphFunctionForVector`, `substitute`, zoom plan/apply helpers, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `compose` | Implemented and aligned as TypeScript binding |
| graph functions | `GraphFunction` plus `constructGraphFunction(...)`, inline or symbolic templates, materialization checks | Implemented and aligned |
| publication and work surfaces | `Module`, `ModuleImport`, `ContractRef`, `Role`, `Job`, `RefinementBoundary`, `CandidateFamily` | Implemented and aligned |
| selection/refinement surfaces | `RefinementBoundary`, `CandidateFamily`, selection-boundary conformance rows | Partly implemented; live runtime selection remains separate |
| asset and prompt surfaces | `AssetSurface`, authority slots, prompt asset conformance rows | Implemented for static conformance and prompt asset rows |
| hook and plugin boundaries | plugin contracts, compute stage bindings, hook boundary rows, plugin result-interface rows | Implemented in conformance gate; plugins remain authority-denied |
| compute notation | selected composition notation, F_D/F_P/F_H regime bindings, plugin category bindings | Implemented; F_P/F_H closure authority is type-excluded |
| requirement declarations | GTL requirement wrappers in `gtl/requirements/index.ts` | Implemented and aligned as declaration facade |
| program validation | `admitGtlProgramConformanceInput(...)`, `typecheckGtlProgram(...)`, typed issue rows, inventory digests, traversal-unit projection | Implemented as static ABG-owned conformance gate |
| mapping to runtime | conformance projections, runtime route interfaces, requirements route, overlay frames, replay artifacts | Partly implemented across ABG surfaces; live registry lookup deferred |

## Subordinate Vocabulary Binding

| WHAT term | Current TypeScript binding | Classification |
| --- | --- | --- |
| language capability catalog | This design artifact plus the GTL requirement index and conformance report surfaces | Implemented as review/read-model material, not runtime truth |
| publication inventory | `GtlProgramConformanceInput` rows, including `catalogGraphFunctionRefs`, modules, graph functions, overlays, public starts, plugin contracts, plugin result interfaces, target carriers, edge closures, and requirement declarations | Implemented and aligned as static conformance inventory |
| catalog | Several qualified implementation surfaces: graph-function publication catalog refs, plugin result-interface catalog, allowed consequence traversal catalog, overlay/public-start rows | Implemented as multiple qualified static/catalog surfaces; no single unqualified authority |
| runtime registry | No live replay-derived registry/lookup surface for registered graph-function candidates | Absent and deferred to T-177 |
| system library | Generic graph functions exist in source, including requirements-route functions and semantic compiler review graph function | Partly implemented as source-published generic functions; not yet exposed as admitted runtime registry library entries |
| product library | Downstream GTL modules can publish graph functions and inventories for conformance | Partly implemented through GTL/module/conformance admission; no live registry admission/query yet |
| ledger | ABG runtime code has admitted event/projection truth and payload/requirement projections; conformance report binds digests to supplied inventory | Implemented in several domains; terminology must stay scoped to ABG-owned truth |
| event stream | Runtime-event emission and replay are implemented in ABG runner surfaces and requirements route proofs | Implemented outside the static conformance gate |
| projection | `GtlProgramConformanceReport`, traversal-unit projection, requirements algebra projection, overlay-frame projection, lifecycle queries | Implemented as replay/static projections depending on surface |
| read model | Public query/report surfaces render admitted or static projection truth | Implemented; no write authority |
| overlay row | `GtlProgramOverlayRow` and `GtlProgramPublicStartRow` in conformance input | Implemented as static conformance/catalog metadata |
| overlay frame | `OverlayFrameContract`, declared/evaluated events, and `deriveOverlayFrameProjection` | Implemented as ABG runtime observation/foldback contract |
| selection event | Runtime-start selection and consequence traversal selection exist in narrower surfaces; no general graph-function candidate selection event | Partly implemented; general registry selection deferred to T-177 |

`catalogGraphFunctionRefs` is publication inventory only. It is a static
typecheck/conformance catalog of expected published graph-function refs. It is
not a live runtime lookup registry and not traversal-affecting selection truth.

## Semantic Compiler Capability Map

The current TypeScript semantic compiler capability is located inside
`gtl_program_conformance.ts`.

| Capability | Current behavior | WHAT alignment | Gap |
| --- | --- | --- | --- |
| Review package identity | `constructAbgSemanticCompilerFpReviewPackageIdentity(...)` builds a package identity carrying subject, deterministic report digest, authority packet, objective, target artifact, tool boundaries, stop condition, F_D grammars, admission FSM, output enum, derivation rule, and forbidden interpretation ref | Aligns with WHAT as a HOW binding over admitted package identity | No live registry role |
| Review graph function | `constructAbgSemanticCompilerFpReviewGraphFunction()` publishes `abg.semanticCompiler.fpReview` as a graph function with one F_P operator and one F_P admission evaluator | Aligns with WHAT as a system graph-function binding | Not registered in a live system-library registry |
| Review result | `constructAbgSemanticCompilerFpReviewResult(...)` builds an admitted review result with source package digest, producer graph-function digest, runtime identity, status, finding count, and evidence refs | Aligns with WHAT as admitted semantic review result shape | Not event-sourced as a general registry fact |
| Review execution helper | `runAbgSemanticCompilerFpReviewGraphFunction(...)` validates graph-function shape and admits a result | Implemented proof helper for the graph-function carrier | Helper is not a full ABG runtime invocation path |
| Result admission | `admitAbgSemanticCompilerFpReviewResult(...)` validates review result shape and package/digest consistency | Aligns with WHAT admission boundary | Does not create runtime registry entry |
| Semantic review gate | `GtlProgramSemanticReviewGateRow` plus `checkSemanticReviewGates(...)` require admitted T-162 semantic compiler review result and producer graph-function digest | Aligns with WHAT as conformance gate over semantic review evidence | Static conformance gate only |
| Conformance integration | `typecheckGtlProgram(...)` admits semantic review gates and includes their digest in inventory identity | Aligns with WHAT publication/conformance inventory | Not a runtime lookup catalog |

## Conformance Capability Map

| Capability | Current behavior | WHAT alignment | Gap |
| --- | --- | --- | --- |
| Raw input admission | `admitGtlProgramConformanceInput(...)` collapses raw input into normalized rows and typed issues | Aligned; source truth is one admitted input boundary | None for static conformance |
| Typecheck report | `typecheckGtlProgram(...)` returns `GtlProgramConformanceReport` with inventory digests, pass/fail, issues, coverage, plugin result-interface catalog, requirements algebra projection, and traversal-unit projection | Aligned as static admission/typecheck projection | No live registry query |
| Publication inventory | `catalogGraphFunctionRefs`, `graphFunctions`, and `modules` prove declared publication scope | Aligned with publication inventory WHAT | Must not be used as runtime registry |
| Overlay/public starts | `GtlProgramOverlayRow` and `GtlProgramPublicStartRow` resolve graph functions, graph vectors, overlay refs, default starts, and public-start compatibility | Aligned as overlay rows/public-start conformance metadata | No runtime selection over overlay candidates |
| Plugin contracts | Plugin contracts are admitted and checked against stage/runtime bindings | Aligned with plugin boundary inventory | No registry admission of plugin-backed library entries |
| Plugin result interfaces | The admitted plugin result-interface catalog is constructed from supplied interfaces | Aligned with conformance catalog | Catalog is static report output, not lookup registry |
| Traversal-unit projection | `constructTraversalUnitProjection(...)` projects unit rows and entry-unit rows from supplied inventory | Aligned as static projection over inventory | Projection rows are not runtime registry candidates |
| Requirements algebra projection | Requirement bundles project to requirement edge rows with spans, context fragments, destinations, tests, and evidence policies | Aligned as static projection over GTL requirement declarations | Runtime requirements route exists elsewhere; not registry lookup |

## Gap Table

| Gap | Category | Severity | Current state | Target state | Owner | Successor |
| --- | --- | --- | --- | --- | --- | --- |
| Runtime graph-function registry lookup | implementation/design gap | high | Static conformance inventories and source-published graph functions exist; no live registry lookup query over admitted entries | ABG-owned runtime registry projection and lookup query over admitted system/product library entries | ABG runtime + GTL mapping | T-177 |
| Runtime selection event for graph-function candidates | design gap | high | Narrow selection/event surfaces exist, but no general candidate selection event for registry lookup | ABG-emitted selection truth when candidate choice affects traversal | ABG runtime | T-177 |
| System library registration | design gap | medium | Generic functions exist in source and exported surfaces; not admitted as system-library registry entries | System library entries declared, admitted, versioned, proven, and queryable | GTL/ABG | T-177 |
| Product library registration | design gap | medium | Downstream modules can publish graph functions for conformance | Product library entries admitted into runtime registry with namespace, owner, provenance, proof readiness, and override constraints | GTL/ABG + downstream products | T-177 |
| System/product shadow prevention | requirement/design gap | medium | WHAT now requires refinement/override law; implementation has no registry-level check | Registry admission rejects unlawful shadowing and records explicit override/refinement eligibility | ABG runtime | T-177 |
| Qualified catalog terminology in docs | documentation gap | medium | Older commentary and design docs may say catalog without qualification | Docs use language capability catalog, publication inventory, conformance catalog, consequence catalog, library index, runtime registry query, or another qualified term | Documentation/design | T-176 follow-up edits |
| Semantic compiler runtime proof status | proof gap | low-medium | Semantic compiler review helper validates graph-function shape and admitted result in tests | If needed for runtime registry, semantic compiler graph function is admitted as system-library entry with proof/readiness state | ABG runtime | T-177 or later |
| TypeScript HOW to WHAT trace | design gap | low | Current implementation is source-grounded but spread across files and historical tickets | One current HOW account maps implementation to the GTL language capability model and states gaps | TypeScript tenant design | This document |

## Non-Goals

- Do not implement the live runtime registry here.
- Do not rename current carriers as part of this ticket.
- Do not treat the semantic compiler review graph function as a runtime
  registry entry until T-177 or a successor admits it.
- Do not move the gap table into requirements.
- Do not promote downstream software/test/build/release semantics into
  GTL/ABG system-library law.

## Closure Checks

For T-176 closure, this document is the HOW/gap read model. The live WHAT
truth is the GTL language capability model requirement family. The future
runtime lookup design is T-177.
