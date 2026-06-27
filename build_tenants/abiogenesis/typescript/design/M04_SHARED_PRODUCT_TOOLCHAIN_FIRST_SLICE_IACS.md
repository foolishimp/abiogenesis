# M04 Shared Product Toolchain First Slice IACS

**Status**: Active
**Date**: 2026-06-27
**Derived from**: [M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md](./M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md), [M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md](./M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md), [REQ-P-INSTALL](../../../../specification/requirements/product/REQ-P-INSTALL.md), [T-163](../../../../.ai-workspace/tickets/completed/T-163-make-shared-product-toolchain-the-only-install-resolution-model.md)

## Purpose

Declare the install-resolution carrier set for the single shared product
toolchain model.

## Prime Carrier Families

No new prime carrier family is introduced. T-163 tightens subordinate payloads
owned by the existing TypeScript installer and toolchain binding modules.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `ToolchainSelectionSource` | subordinate enum | selector provenance nested under workspace binding | one of `explicit`, `workspace_binding`, `environment` |
| `ToolchainProductBinding` | subordinate payload | selected product detail under one workspace binding | admitted only with absolute product, package, bin, lib, docs, standards, manifest paths and manifest digest |
| `ToolchainWorkspaceBinding` | subordinate payload | target binding/provenance pointer, not downstream domain authority | schema `2`; admitted from `.abiogenesis/toolchain-binding.json` |
| `ToolchainMutableStateRoots` | subordinate payload | runtime-state placement, not traversal semantics | absolute observed, observer, executor, event, runtime, projection, and archive roots |
| `ProductToolchainManifest` | subordinate read model | replayable manifest for one immutable product payload | materialized under versioned product root and digested |

## Consolidation Rules

- `ToolchainSelectionSource` does not include `default`.
- `ABG_TOOLCHAIN_ROOT` is the only environment selector.
- `ToolchainWorkspaceBinding.schemaVersion` is `2`; v1 binding truth is
  superseded rather than shimmed.
- product package, command, docs, and standards roots are all descendants of
  the selected versioned product root.
- mutable roots are recorded binding truth and may be under the workspace, but
  they never imply product payload fallback.
- runtime commands that need workspace context require an admitted workspace
  binding before reading replay or appending events.

## Fail-Closed Cases

The first slice must prove these old interfaces are gone:

- no selector present
- only `ABIOGENESIS_HOME` present
- only `ODD_SDLC_HOME` present
- target-local product package expected as a runtime dependency
- target-local docs/standards expected as a runtime dependency
- top-level toolchain command shim expected
- malformed or missing workspace binding for installed runtime commands
