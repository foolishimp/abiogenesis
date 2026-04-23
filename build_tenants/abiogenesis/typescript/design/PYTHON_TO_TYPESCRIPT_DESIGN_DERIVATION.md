# Python To TypeScript Design Derivation

**Status**: Active
**Date**: 2026-04-23
**Purpose**: Declare how the TypeScript tenant derives its module and carrier
design from the shipping Python design without turning Python code shape into
constitutional authority for the TypeScript line.

## 1. Position

The derivation order for this tenant is:

1. `specification/` constitutional `WHAT`
2. shipping Python design as released reference `HOW`
3. TypeScript tenant design mapping
4. TypeScript module-bounded carrier assets
5. TypeScript implementation tickets
6. TypeScript code

The TypeScript line does **not** port by file mirroring.

It derives target module boundaries from the released Python design and then
binds those boundaries to TypeScript-specific carrier, package, runtime, and
strict-lane choices.

## 2. Reference Surfaces

The released Python design surfaces used as source material are:

- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/GTL_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-034-runtime-execution-law-is-carrier-and-event-owned.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-035-deterministic-handling-must-not-structurally-block-governed-fp.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-036-abg-runtime-advancement-uses-execution-basis-and-advancement-transition.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`

## 3. Derivation Rules

The TypeScript tenant preserves these Python design truths:

- GTL remains declaration law and ABG remains runtime law
- `GraphFunction` remains the sole public named callable carrier
- runtime truth remains carrier-and-event owned
- `ExecutionBasis` plus `AdvancementTransition` remain the runtime advancement
  center
- package/bootstrap stays below kernel semantics
- worker/runtime identity remains explicit input truth rather than helper-owned
  fallback

The TypeScript tenant intentionally reshapes these delivery details:

- Python CLI/bootstrap surfaces become package-first TypeScript entry surfaces
- Python dataclass or class shaping becomes readonly TypeScript carrier
  interfaces and discriminated unions
- Python strict typing law becomes TypeScript strict compiler and lint law
- Python test-harness spellings become tenant-local TypeScript module and proof
  lanes

The TypeScript tenant intentionally rejects these Python-shaped drift risks:

- file-for-file porting as architecture
- controller-owned semantic centers
- runtime law hidden in bootstrap helpers
- open-object carrier truth at the semantic center
- public wrappers that reconstruct kernel meaning

## 4. Module Derivation Matrix

| Module | Python reference design | TypeScript target design | TypeScript consequence | Current status |
| --- | --- | --- | --- | --- |
| `M01-gtl-core` | `python/design/GTL_3_MODULE_DESIGN.md`, Python GTL interface/design surfaces | `GTL_3_MODULE_DESIGN.md`, `GTL_3_FIRST_SLICE_IACS.md`, `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | readonly declaration carriers, admitted serialized payloads, structural GTL algebra, no runtime-owned publication meaning | completed via `T-009` |
| `M02-work-publication` | Python GTL publication/work design and module schedule | `GTL_3_M02_WORK_PUBLICATION_IACS.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | `Module`, `Job`, `Role`, `RefinementBoundary`, and `CandidateFamily` as explicit publication carriers over M01 truth | completed via `T-010` |
| `M03-engine-kernel` | `python/design/ABG_3_MODULE_DESIGN.md`, `ADR-034`, `ADR-035`, `ADR-036` | `ABG_3_MODULE_DESIGN.md`, `ABG_3_FIRST_SLICE_IACS.md`, `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md` | one steel-thread runtime over `StartIntent`, `ExecutionBasis`, `AdvancementTransition`, and `RuntimeEvent`; no package-owned runtime law | completed via `T-011` |
| `M04-app-bootstrap` | Python delivery-boundary and identity-projection design, `ADR-033`, shared `M04-app-bootstrap.yml` | `ABG_3_MODULE_DESIGN.md`, `M04_FIRST_SLICE_IACS.md`, `M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md`, `M04_CONTROL_LOOP_FIRST_SLICE_IACS.md`, `M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md` | package-first public-start boundary and bounded control-loop realization over completed kernel truth; no direct event append, no bootstrap-owned kernel meaning | completed through `T-012` and `T-013`; later ingress/install/bootstrap families deferred |
| `M05-qualification-scenarios` | Python testcase authority, sandbox/archive proof, public `gen-start` proof lanes | future TypeScript qualification/test design surfaces | TypeScript qualification remains downstream of completed `M04`; sandbox must not replace module-owned proof lanes | deferred |
| `M06-mapping-deferred` | Python mapping/deferred design | future TypeScript mapping surfaces only if alternate runtime mapping becomes active | no active TypeScript scope | deferred |

## 5. Structural Sign-Off Rule For This Tenant

For each active TypeScript module boundary, the tenant must publish:

- the target module design surface
- the target Irreducible Architectural Carrier Set
- the module-bounded structural carrier diagram
- the strict lane covering the active module files
- the implementation ticket for that module wave

The implementation sequence is therefore:

1. target design
2. target module carrier asset
3. implementation ticket
4. code

This tenant does not allow code-first discovery of module boundaries.

## 6. Sign-Off Consequence

When a reviewer asks whether a TypeScript module is lawful, the review should
be able to answer:

- which Python design surface informed it
- which TypeScript design surface replaced or bound that reference
- which carriers are prime
- which shapes stayed subordinate
- which package/runtime details were demoted to delivery binding

If that chain is missing, the module is not ready for implementation or
closure.
