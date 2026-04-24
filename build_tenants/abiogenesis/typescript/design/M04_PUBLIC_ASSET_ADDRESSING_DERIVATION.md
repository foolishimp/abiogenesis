# M04 Public Asset Addressing Derivation

**Status**: Completed
**Date**: 2026-04-24
**Purpose**: Derive the next TypeScript `M04-app-bootstrap`
public-asset-addressing boundary from the released Python design and installed
proof line without promoting runtime binding helpers or local path inference
into the wrong TypeScript module boundary.

## 1. Source Material

This boundary derives from:

- `build_tenants/abiogenesis/python/design/OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md`
- `build_tenants/abiogenesis/python/design/adrs/ADR-033-primary-public-gen-start-execution-chain-proof.md`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `build_tenants/abiogenesis/python/code/genesis/services.py`
- `build_tenants/abiogenesis/python/code/genesis/binding.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_cli_adapter_auto.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`
- `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/typescript/design/M04_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M02_M03_LOOKUP_AUTHORITY_IACS.md`
- `.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md`
- `.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md`
- `.ai-workspace/tickets/completed/T-027-realize-a-tenant-local-abg-common-realization-library-for-expectation-derivation-contract-carriers-and-module-derived-proof-helpers.md`

## 2. Position

The next TypeScript `M04` wave does not start from Python CLI spellings,
bootstrap scans, or local filesystem heuristics.

It starts from the released Python design truths:

- `asset:<published_handle>` is an operator-facing target family above the
  runtime
- one published operator asset registry resolves the handle to one governing
  graph-function boundary
- operator asset ownership is separate from bind-time asset materialization
- unknown, malformed, or ambiguous asset targets fail closed
- asset addressing projects operator-facing asset metadata without creating a
  second traversal authority beside the governing graph-function carrier

## 3. Preserved Boundary Truth

The next TypeScript `M04` slice preserves these truths from the Python line:

- public asset targeting is app/bootstrap-owned and stays above `M03`
- registry truth is explicit, published, and queried through a declared
  contract
- the only lawful first-slice owner kind is `graph_function`
- asset addressing resolves to already-published GTL/M03 truth rather than
  inventing new callable carriers
- a resolved asset target can drive the existing public-start chain without
  restating runtime law

## 4. Demoted Python Delivery Detail

The TypeScript line intentionally demotes these Python-shaped details to
delivery binding or deferred concern:

- CLI flag spellings and argparse decomposition
- shell environment patching conventions
- installed-line stdout formatting
- bind-time `asset_binding_contract`
- later bootloader/install/sandbox delivery surfaces

Those may reappear later as delivery or qualification bindings, but they do
not define the first TypeScript public-asset-addressing slice.

## 5. First TypeScript M04 Public Asset-Addressing Target

The first TypeScript public asset-addressing slice should realize only:

- one admitted public asset-addressing request carrier
- one admitted operator asset query contract carrier
- one closed public asset-addressing outcome family
- one bounded registry resolution route that resolves an asset handle to one
  governing published graph-function carrier

This first slice should **not** widen into:

- direct `M03` support for `asset` as a runtime target kind
- bind-time asset materialization contracts
- bootloader/install ownership
- live sandbox/archive proof

## 6. Python-To-TypeScript Mapping

| Python design truth | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| `operator_asset_contract` is explicit runtime/app config | admitted subordinate query contract carrier | no helper-owned ambient contract lookup |
| `published_operator_asset_target_catalog(...)` resolves one handle through one published registry | bounded `M04` registry-resolution route | public asset resolution stays above runtime and fails closed |
| ownership kind is `graph_function` only in the current cut | closed owner-kind rule in first slice | resolved target must point to an already-published graph-function boundary |
| resolved asset target preserves operator metadata and owner identity | subordinate resolved asset-target projection | app-facing callers can inspect asset metadata without inventing new targeting authority |
| installed proof shows asset targeting changes the selected execution chain | integration proof composes resolved asset truth into the existing `publicStart` chain | first-slice proof demonstrates deeper downstream effect without repricing `M03` |

## 7. Required Next Assets

Before public asset-addressing implementation starts, this derivation must be
followed by:

- the `M04` public asset-addressing first-slice IACS
- the `M04` public asset-addressing structural carrier diagram in Mermaid UML
- the bounded `M04` strict-lane expansion

Only then is the next `M04` public asset-addressing wave ready for
implementation.
