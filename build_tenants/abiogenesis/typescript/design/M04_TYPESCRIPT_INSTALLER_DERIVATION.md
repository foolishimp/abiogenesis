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
- [REQ-P-QUAL.md](../../../../specification/requirements/product/REQ-P-QUAL.md)
- [REQ-P-INSTALL.md](../../../../specification/requirements/product/REQ-P-INSTALL.md)
- [T-076](../../../../.ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md)
- [T-079](../../../../.ai-workspace/tickets/completed/T-079-realize-typescript-installer-standards-reference-copy-and-product-contract-proof.md)
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
- install domain-neutral ABG docs under `.abiogenesis/docs/`
- install the full method standards tree under `.abiogenesis/docs/standards/`
- distinguish imported targets from clean targets and publish the selected
  clean-target policy
- write one installer manifest with package, command, standards, docs,
  provenance, runtime-identity, and runtime-root truth
- classify installer execution as either `fresh` or `refresh`, and refresh
  same-package file dependency/manifests deterministically on admitted reruns
- write one domain-neutral fallback CLI runtime binding under `.abiogenesis/`
  so installed `genesis-ts` and `abiogenesis-ts` can run direct ABG
  observation and advancement commands without private test fixtures
- publish a public topology verifier over the installed substrate
- leave graph execution, domain HOW, and downstream acceptance interpretation
  outside the installer

## Preserved Boundary Truth

The TypeScript installer preserves these truths from the Python line:

- install proof is not the same as source-tree import proof
- the target workspace contains the runtime substrate used by later sandbox
  execution
- command binding is installer truth, not a private test fixture
- installed runtime identity is inspectable through manifest files
- installed method standards are target-workspace reference copies, not hidden
  source-workspace assumptions
- installed provenance and topology verification are installer truth, not later
  sandbox harness reconstruction
- direct installed ABG CLI commands require installed runtime binding truth, not
  source-tree test-created runtime files
- installer qualification preserves archive/postmortem evidence under
  `test_env/test_runs/`
- repeat installer execution over the same admitted ABG package refreshes the
  file dependency and manifest truth instead of rejecting a stale prior pack
  path
- downstream products may consume the installer but do not define it

## Demoted Delivery Detail

The TypeScript installer does not copy the Python `.genesis` layout. The
TypeScript delivery shape is package-first:

- `.abiogenesis/install-manifest.json` remains the bootstrap manifest
- `.abiogenesis/typescript-installer-manifest.json` records package and command
  delivery truth, including whether the install was `fresh` or a `refresh`
- `.abiogenesis/install-provenance.json` records the installer provenance
  truth used by archive and sandbox lanes
- `.abiogenesis/cli-runtime.mjs` records the domain-neutral fallback runtime
  binding consumed by direct installed ABG CLI commands
- `.abiogenesis/docs/standards/` holds method reference copies for cold-agent
  workspace references
- `.abiogenesis/docs/` holds domain-neutral ABG reference docs
- `node_modules/@abiogenesis/typescript-tenant` is the installed package root
- `node_modules/.bin/abiogenesis-ts` and `node_modules/.bin/genesis-ts` are the
  command bindings

The clean-target default is `no_scaffold`: the installer creates an ABG
substrate without asserting project authority. Starter project scaffolding is a
future explicit policy, not an implied side effect of installing ABG.

The fallback runtime binding is not a downstream product catalog. It publishes a
single substrate self-test graph function so direct ABG commands can observe and
exercise the installed substrate. Downstream products that own graph functions,
assets, or acceptance semantics must publish their own product-owned runtime
binding instead of treating the ABG fallback as domain authority.

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
