# M04 TypeScript Installer Derivation

**Status**: Active
**Date**: 2026-04-26
**Purpose**: Promote the deferred TypeScript package and command installation
boundary into a public ABG installer comparable to the Python `gen-install.py`
surface, without moving runtime semantics or downstream domain policy into the
installer.

## Source Material

This boundary derives from:

- [M04_INSTALL_BOOTSTRAP_DERIVATION.md](./M04_INSTALL_BOOTSTRAP_DERIVATION.md)
- [M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md](./M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md)
- [M05_INSTALLED_SANDBOX_DERIVATION.md](./M05_INSTALLED_SANDBOX_DERIVATION.md)
- [M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md](./M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md)
- [T-076](../../.ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md)
- `build_tenants/abiogenesis/python/code/gen-install.py`
- `build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py`
- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_install.py`

## Position

The TypeScript line already owns a bounded install/bootstrap carrier. That
carrier writes the target workspace shell and install manifest, but it does not
materialize a usable installed ABG TypeScript package or command binding.

That is not enough for sandbox qualification or downstream products. A lawful
sandbox must start from an installed ABG runtime, not from private test helpers
or source-tree imports.

The installer wave therefore promotes the previously deferred package and
command delivery concern into one public installer surface:

- admit an explicit install request
- create the bootstrap workspace through `PublicInstallBootstrapRequest`
- pack and install the ABG TypeScript package into the target workspace
- expose `abiogenesis-ts` and `genesis-ts` command bindings
- write one installer manifest with package, command, and runtime-root truth
- leave graph execution, domain HOW, and downstream acceptance interpretation
  outside the installer

## Preserved Boundary Truth

The TypeScript installer preserves these truths from the Python line:

- install proof is not the same as source-tree import proof
- the target workspace contains the runtime substrate used by later sandbox
  execution
- command binding is installer truth, not a private test fixture
- installed runtime identity is inspectable through manifest files
- downstream products may consume the installer but do not define it

## Demoted Delivery Detail

The TypeScript installer does not copy the Python `.genesis` layout. The
TypeScript delivery shape is package-first:

- `.abiogenesis/install-manifest.json` remains the bootstrap manifest
- `.abiogenesis/typescript-installer-manifest.json` records package and command
  delivery truth
- `node_modules/@abiogenesis/typescript-tenant` is the installed package root
- `node_modules/.bin/abiogenesis-ts` and `node_modules/.bin/genesis-ts` are the
  command bindings

## Installer Non-Authority

The installer does not own:

- graph-function selection
- runtime traversal or iteration semantics
- F_D, F_P, or F_H evaluator interpretation
- downstream catalog policy
- downstream asset meaning
- live sandbox pass/fail interpretation

Those remain owned by GTL/ABG runtime carriers, product policy, or downstream
domain products.
