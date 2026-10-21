# M04 Shared Product Toolchain Derivation

**Status**: Active
**Date**: 2026-06-27
**Derived from**: [PRODUCT.md](../../../../specification/PRODUCT.md), [REQ-P-INSTALL](../../../../specification/requirements/product/REQ-P-INSTALL.md), [M04_TYPESCRIPT_INSTALLER_DERIVATION.md](./M04_TYPESCRIPT_INSTALLER_DERIVATION.md), [T-163](../../../../.ai-workspace/tickets/completed/T-163-make-shared-product-toolchain-the-only-install-resolution-model.md)

## Position

The shared product toolchain is the only install-resolution model. It separates
two products:

- the immutable released product payload under a selected toolchain root
- the mutable target workspace that records binding, provenance, config, events,
  runtime state, projections, and archives

The target workspace is not the package install root. The toolchain root is not
the workspace state owner unless the workspace binding explicitly chooses that
mutable root.

## Resolution Law

Resolution is ordered and finite:

1. explicit command/API `toolchainRoot`
2. admitted workspace binding truth
3. `ABG_TOOLCHAIN_ROOT`
4. fail closed

There is no `ABIOGENESIS_HOME` alias, no `ODD_SDLC_HOME` alias, no target-root
product fallback, and no configured default. A resolver that reaches state 4
returns a typed resolution error before package, command, docs, or runtime
roots are selected.

## Product Payload Layout

ABG TypeScript product payloads resolve under:

`<toolchainRoot>/products/abiogenesis/<packageVersion>/`

That product root owns:

- `product-toolchain-manifest.json`
- `lib/node_modules/@abiogenesis/typescript-tenant`
- `bin/abiogenesis-ts`
- `bin/genesis-ts`
- `docs/`
- `docs/standards/`

The product manifest records package identity, package root, command paths,
docs root, standards root, tarball path, and a digest of the manifest content.
The workspace binding records the selected product root, manifest path, and
manifest digest so a cold agent can inspect the product selection without
searching local project state.

## Workspace Binding Layout

The target `.abiogenesis/` surface owns:

- `toolchain-binding.json`
- `typescript-installer-manifest.json`
- `install-provenance.json`
- `install-manifest.json`
- `cli-runtime.mjs`
- domain-neutral config

It does not own a full product package copy and it does not publish top-level
toolchain shims. Command paths are product-version-scoped paths recorded in the
binding and product manifest.

## Runtime Use

Installed runtime commands that need workspace context load the admitted
workspace binding before selecting event, runtime, projection, or archive roots.
Missing or malformed binding truth is a runtime-resolution error. It is not a
request to fall back to `<workspace>/.ai-workspace`.

## Regression Law

Spec Method regression law is applied by deleting old compatibility interfaces
rather than preserving shims:

- legacy environment aliases are not selectors
- missing selectors fail closed
- target-local `node_modules/@abiogenesis/typescript-tenant` is not required
- product docs and standards are not required target-local copies
- command shims are not generated at the toolchain root
- downstream products consume the same product manifest and workspace binding
  shape instead of defining product-specific install models
