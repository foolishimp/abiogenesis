# M02 To M03 Lookup Authority Derivation

**Status**: Active
**Date**: 2026-04-24
**Purpose**: Derive the TypeScript `M02-work-publication` to
`M03-engine-kernel` lookup-authority boundary from the released Python design
and delivery evidence without promoting runtime-local caches or repricing
public carrier truth.

## 1. Source Material

This boundary derives from:

- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/GTL_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-030-job-role-worker-run-binding.md`
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
- `build_tenants/common/design/modules/M02-work-publication.yml`
- `build_tenants/common/design/modules/M03-engine-kernel.yml`
- `build_tenants/abiogenesis/typescript/design/GTL_3_M02_WORK_PUBLICATION_IACS.md`
- `build_tenants/abiogenesis/typescript/design/ABG_3_FIRST_SLICE_IACS.md`
- `.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md`
- `.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md`

## 2. Position

The TypeScript line does not start this wave from a generic performance
optimization desire.

It starts from an architectural defect:

- `M03` execution-basis admission still keeps callable lookup policy implicit
  inside runtime constructors
- `M02` publication truth already owns the relevant callable and job bindings
- the lookup seam should therefore become one explicit authority boundary
  between published module truth and execution-basis derivation

The target is not hidden caching.
The target is explicit lookup authority with the same fail-closed behavior as
the current line.

## 3. Preserved Boundary Truth

This wave preserves these truths from the released line:

- published `GraphFunction` remains the sole callable public carrier
- `Job` binds published `GraphFunction` truth by explicit contract
- `ExecutionBasis` still derives from admitted `Module` publication truth
- ambiguity and absence remain fail-closed
- public GTL and ABG carriers do not widen merely to support lookup

## 4. Demoted Current TypeScript Detail

The TypeScript line intentionally demotes these current details from
architecture:

- repeated linear scans over `module.graphFunctions`
- repeated linear scans over `module.jobs`
- runtime-constructor ownership of callable resolution policy

Those are current implementation mechanics, not the intended `M02 -> M03`
module law.

## 5. Next TypeScript Target

This wave should realize only:

- one explicit subordinate lookup-authority surface derived from admitted
  `Module` publication truth
- one explicit handle-resolution rule for published `GraphFunction`
- one explicit semantic-job resolution rule for published callable truth
- one canonical `M03` execution-basis path that consumes that lookup authority

This wave should **not** widen into:

- new public GTL callable carriers
- new public ABG execution carriers
- app/bootstrap orchestration
- runtime caches or mutable registries
- package export widening for internal lookup detail

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| public semantic work binds published graph functions by explicit job contract | explicit `M02` callable lookup authority | runtime no longer infers callable resolution policy ad hoc inside `M03` |
| executable job materialization resolves against module publication truth | explicit graph-function and job resolution over admitted `Module` | `ExecutionBasis` remains publication-owned rather than cache-owned |
| ambiguity around published callable resolution must fail closed | closed lookup-resolution outcomes or fail-closed resolvers | lookup authority cannot silently pick one match |
| runtime materializes published graph function after lawful resolution | `M03` consumes lookup authority, then materializes one resolved callable | callable lookup and callable materialization stay distinct |

## 7. Required Next Assets

Before lookup code starts, this derivation must be followed by:

- the `M02 -> M03` lookup-authority IACS
- the lookup authority matrix and subordinate payload register
- the lookup authority structural carrier diagram in Mermaid UML
- the bounded strict-lane expansion
- the module-derived proof lanes for this boundary

Only then is `T-014` ready for implementation.
