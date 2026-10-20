# M04 Public Asset Addressing First Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md](./M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [M04_FIRST_SLICE_IACS.md](./M04_FIRST_SLICE_IACS.md), [M02_M03_LOOKUP_AUTHORITY_IACS.md](./M02_M03_LOOKUP_AUTHORITY_IACS.md), [ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md](./ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md), [T-025](../../.ai-workspace/tickets/completed/T-025-realize-typescript-m04-public-asset-addressing-through-a-published-operator-asset-registry.md)

## Purpose

Declare the next TypeScript `M04-app-bootstrap` slice as an explicit
public-asset-addressing carrier inventory so app-facing asset targeting
consumes one published operator asset registry rather than helper-owned string
interpretation or local path inference.

## M04 Public Asset-Addressing First Slice Boundary

The first TypeScript public asset-addressing wave is:

- one admitted public asset-addressing request carrier
- one admitted operator asset query contract carrier
- one closed public asset-addressing outcome family
- one bounded route that resolves a published asset handle to one governing
  graph-function carrier through explicit registry truth

This wave does **not** include:

- direct `asset` support in `M03 StartIntent`
- bind-time `asset_binding_contract`
- bootloader or install/bootstrap delivery
- live sandbox/archive proof

## Upstream Authoritative Carriers Consumed By Public Asset Addressing

This slice does not redefine GTL publication or runtime traversal truth.

The following remain authoritative upstream truth and are consumed unchanged:

- `ModuleLookupAuthority`
- published graph-function handle/target-id truth under `M02`
- `PublicStartRequest` as the downstream public-start boundary that later
  consumes the resolved owner handle

## Irreducible Architectural Carrier Set

The first TypeScript public asset-addressing wave is allowed exactly these
prime carrier families:

1. `PublicAssetAddressingRequest`
2. `PublicAssetAddressingOutcome`

Explicit variants of `PublicAssetAddressingOutcome` are members of that one
prime outcome family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicAssetAddressingRequest` | `M04-app-bootstrap` | authoritative public asset-target ingress | package/asset-addressing parser | none | registry-resolution route |
| `PublicAssetAddressingOutcome` | `M04-app-bootstrap` | authoritative public asset-addressing outcome family | derived from admitted request plus registry resolution | registry query runner only | later public-start binding, later bootloader/install/qualification consumers |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `OperatorAssetTarget` | subordinate | nested public target detail, not an outer carrier | admitted once into `PublicAssetAddressingRequest` |
| `OperatorAssetQueryContract` | subordinate | runtime/app config contract, not a public outer carrier | admitted once at named contract ingress |
| `OperatorAssetRegistryEntry` | subordinate | registry row detail, not an outer carrier | derived only from query payload |
| `ResolvedAssetTargetProjection` | subordinate | public metadata projection over the governing graph-function owner, not a second targeting authority | derived once from one registry entry |
| `PublicAssetAddressingResolved` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicAssetAddressingOutcome` |
| `PublicAssetAddressingRejected` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicAssetAddressingOutcome` |
| bind-time asset binding contracts | deferred | materialization/binding family, not public asset-addressing truth | successor ticket only |
| direct `M03` asset target kind | deferred | runtime boundary repricing, not this `M04` first slice | successor ticket only |
| bootloader/install/sandbox delivery payloads | deferred | later delivery/qualification families | successor ticket only |

## M04 Public Asset-Addressing First Slice Rules

- `PublicAssetAddressingRequest` is the only lawful public ingress carrier for
  first-slice asset-addressing.
- `PublicAssetAddressingRequest` does not accept open string routing beyond the
  admitted `asset` target family.
- `OperatorAssetQueryContract` is explicit subordinate config truth. Registry
  resolution must not infer command or key paths from ambient helpers.
- first-slice ownership kind is `graph_function` only.
- `PublicAssetAddressingOutcome` is a closed discriminated family. Callers must
  pattern-match the outcome family rather than probe open registry objects.
- a resolved outcome may expose asset metadata and governing owner truth, but
  it must not create a rival traversal authority beside the governing
  graph-function handle/target-id.
- unknown, malformed, missing-owner, and ambiguous asset targets fail closed.
- first-slice proof must demonstrate that resolved asset ownership can drive
  the existing public-start chain without widening `M03`.

## Promotion Rule

No subordinate payload may be promoted during the first public
asset-addressing wave unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-025` before code lands.
