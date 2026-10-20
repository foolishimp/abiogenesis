# M02 To M03 Lookup Authority IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [M02_M03_LOOKUP_AUTHORITY_DERIVATION.md](./M02_M03_LOOKUP_AUTHORITY_DERIVATION.md), [GTL_3_M02_WORK_PUBLICATION_IACS.md](./GTL_3_M02_WORK_PUBLICATION_IACS.md), [ABG_3_FIRST_SLICE_IACS.md](./ABG_3_FIRST_SLICE_IACS.md), [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [T-014](../../.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md)

## Purpose

Declare the `M02-work-publication` to `M03-engine-kernel` lookup boundary as
an explicit carrier inventory so callable and semantic-job resolution stay
module-owned publication law instead of hidden runtime-helper policy.

## Boundary

The `T-014` wave is:

- one explicit lookup-authority surface derived from admitted `Module` truth
- one explicit published graph-function handle resolution rule
- one explicit semantic-job resolution rule over published callable truth
- one canonical `ExecutionBasis` construction path that consumes the lookup
  authority rather than scanning publication arrays directly

This wave does **not** include:

- new public callable carriers
- new public execution carriers
- runtime caching or mutable registries
- package export widening for lookup detail
- app/bootstrap or qualification work

## Upstream Authoritative Carriers Consumed By This Boundary

This slice does not redefine existing `M02` or `M03` prime carriers.

The following carriers remain authoritative upstream truth and are consumed
unchanged:

- `Module`
- `GraphFunction`
- `Job`
- `ExecutionBasis`

The lookup boundary may derive subordinate lookup detail from `Module`.
It must not create rival public publication or execution carriers.

## Irreducible Architectural Carrier Set

This wave introduces exactly one new subordinate authority family:

1. `ModuleLookupAuthority`

This family is subordinate, module-bounded, and non-public.
It exists to make callable lookup authority explicit between `M02` and `M03`.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `Module` | `M02-work-publication` | authoritative publication carrier | declaration parser | none | lookup-authority construction, serialization, later app/runtime consumers |
| `ModuleLookupAuthority` | `M02-work-publication` | authoritative lookup surface derived from admitted `Module` truth | constructed once from admitted `Module` | none | `M03` execution-basis admission only |
| `ExecutionBasis` | `M03-engine-kernel` | authoritative runtime basis carrier | execution-basis admission | canonical event shell | transition derivation, event derivation, public-start/control-loop consumers |

`ModuleLookupAuthority` is the only new authority surface in this slice.
It remains subordinate to `Module` and is consumed by `M03` only.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `GraphFunctionHandleBinding` | subordinate | lookup bucket only; no standalone public or persisted authority | derived once from admitted `Module.graphFunctions` |
| `SemanticJobBinding` | subordinate | lookup bucket only; no standalone public or persisted authority | derived once from admitted `Module.jobs` |
| `GraphFunctionHandleResolution` | subordinate | local resolution outcome over one lookup call, not a durable carrier family | derived only inside `M02 -> M03` lookup helpers |
| `SemanticJobResolution` | subordinate | local resolution outcome over one lookup call, not a durable carrier family | derived only inside `M02 -> M03` lookup helpers |
| exported package-level lookup API | promoted by T-222/T-223 | ABG 5.0 publishes the Module-owned lookup contracts through `abg.contract.gtl.m02` | `REQ-P-PUBLIC-CONTRACTS-005` and the DS-1 native contract inventory |
| runtime caching policy | deferred | outside current lookup-authority repricing | separate ticket only |

## Lookup Rules

- `ModuleLookupAuthority` derives from admitted `Module` truth only.
- `ModuleLookupAuthority` remains subordinate to `Module`.
  It does not become a rival publication carrier.
- handle resolution must preserve current callable semantics:
  - a handle may resolve by published `GraphFunction.id`
  - a handle may resolve by published `GraphFunction.name`
  - if those rules produce more than one match, resolution fails closed
  - if those rules produce no match, resolution fails closed
- semantic-job resolution must preserve current binding semantics:
  - `Job.contracts(kind="graph_function", targetId=...)` remains the sole job-binding truth
  - if more than one published job targets the resolved graph function, resolution fails closed
  - if no published job targets the resolved graph function, resolution fails closed
- `M03` execution-basis construction must consume the lookup authority rather
  than directly scanning `module.graphFunctions` or `module.jobs`.
- T-014 added only the internal source-level exports needed for `M03` to consume
  lookup authority. The approved T-222/T-223 successor wave publishes those
  Module-owned contracts through the versioned `abg.contract.gtl.m02` group;
  that promotion does not make lookup authority a rival publication carrier.

## Promotion Rule

No subordinate lookup payload may be promoted during `T-014` unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-014` before code lands.

DS-1 records the successor disposition here: `REQ-P-PUBLIC-CONTRACTS-005`
provides the independent versioned public-contract authority, the lookup
contracts cross the M02 publication and M03 execution boundary unchanged, and
T-222/T-223 bind their exact package-export symbols in the native contract
inventory. The original T-014 non-export assertion is therefore superseded for
the 5.0 product line.
