# M04 Shared Product Toolchain Design Module Review

**Status**: Active
**Date**: 2026-06-27
**Derived from**: [M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md](./M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md), [M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS.md](./M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS.md), [REQ-P-INSTALL](../../../../specification/requirements/product/REQ-P-INSTALL.md), [T-163](../../../../.ai-workspace/tickets/completed/T-163-make-shared-product-toolchain-the-only-install-resolution-model.md)

## Review Result

Conformant for the T-163 first slice.

## Gate Findings

1. Prime carrier discipline: no new prime carrier family is introduced.
   `ToolchainWorkspaceBinding`, `ToolchainProductBinding`,
   `ToolchainMutableStateRoots`, `ToolchainSelectionSource`, and the product
   manifest are subordinate install-resolution payloads under the existing M04
   installer boundary.
2. Authority ownership: the target workspace binding is provenance and
   resolution truth only. It does not own runtime traversal, graph selection,
   downstream domain meaning, or mutable event semantics.
3. Carrier consolidation: the old target-local package root, default selector,
   legacy env aliases, top-level command shim, and local docs/standards copy
   are not retained as carriers.
4. F_D/F_P boundary: resolution is deterministic over declared selectors and
   admitted binding JSON. No semantic judgment is added to deterministic
   resolution.
5. Event/projection boundary: mutable events, runtime state, projections, and
   archives remain workspace mutable roots recorded in the binding. The shared
   product toolchain root is immutable product payload space.
6. Execution authority: CLI `start`, `gaps`, and `assess-result` require
   admitted workspace binding truth before choosing replay or append roots.
   They do not infer runtime roots from cwd, PATH, or package-manager lookup.
7. Regression law: deleted compatibility paths are covered by T-163 negative
   proof for missing selector, legacy aliases, target-local package/doc
   expectation, and top-level command shim absence.

## Residuals

None for the first slice. Downstream products may publish their own product
manifests with `requires` entries using the same generic product binding shape.
