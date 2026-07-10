# REQ-P-INSTALL — Installed Substrate Contract

**Status**: Active
**Category**: Capability
**Date**: 2026-04-27
**Derives from**: [PRODUCT.md](../../PRODUCT.md), [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md)
**Wave**: Shared product toolchain install-resolution reprice

---

## Purpose

The ABG installer is product behavior. It creates the installed substrate that
downstream products use as a development product.

This requirement family defines what an installed ABG substrate must contain so
build tenants do not infer installer behavior from Python precedent, local
scripts, source-tree imports, or ticket commentary.

## Product Boundary

**REQ-P-INSTALL-001**: Abiogenesis shall publish a public installer surface for
each released build tenant that claims installed substrate behavior.

**REQ-P-INSTALL-002**: The installer shall create a target workspace binding to
an immutable released ABG product payload without treating the mutable
abiogenesis source project or the target workspace as the installed product.

**REQ-P-INSTALL-003**: The installed substrate root shall be `.abiogenesis/`.
Downstream products may install product-owned payload beneath
`.abiogenesis/<product>/<build_tenant>/`, but they shall not redefine the ABG
substrate root.

**REQ-P-INSTALL-004**: The installer shall not encode downstream domain HOW.
Downstream products own domain meaning, graph catalogs, policy overlays,
acceptance interpretation, and product-specific instruction sections.

## Shared Toolchain Binding

**REQ-P-INSTALL-005**: Abiogenesis shall publish one shared product toolchain
binding contract that separates immutable released product payloads from target
workspace mutable runtime state.

**REQ-P-INSTALL-006**: A target workspace `.abiogenesis/` root shall act as the
binding, provenance, runtime binding, and configuration root for a selected
shared product toolchain. Package libraries, command binaries, reference docs,
and standards shall resolve through the selected versioned product manifest
under the toolchain root, not through a target-local product package copy.

**REQ-P-INSTALL-007**: The shared product toolchain resolver shall make
product/version selection inspectable. Explicit command input outranks
workspace binding truth, and workspace binding truth outranks
`ABG_TOOLCHAIN_ROOT` environment selection. If none of those selectors is
present and valid, resolution shall fail closed. No configured default,
target-root fallback, or legacy environment alias is a lawful selector.

**REQ-P-INSTALL-008**: A workspace binding shall record the observed workspace
root, observer/control state root, executor state root, event log path, runtime
state root, projection root, archive root, selected toolchain root, selected
product payloads, product root, package root, command paths, product manifest
path, and product manifest digest.

**REQ-P-INSTALL-009**: The shared toolchain root shall not become the mutable
event/projection/archive owner for a target workspace run unless explicitly
bound as such. A workspace may bind mutable roots under
`<workspace>/.ai-workspace`, but that placement is recorded binding truth, not
an implicit product-payload fallback. Observer/control state and executor state
must be separable from the observed workspace.

**REQ-P-INSTALL-009A**: `ABG_TOOLCHAIN_ROOT` is the only lawful environment
selector for shared product toolchain resolution. `ABIOGENESIS_HOME`,
`ODD_SDLC_HOME`, and product-specific home aliases shall fail to select ABG
toolchain payloads.

**REQ-P-INSTALL-009B**: A selected product payload shall be versioned under the
toolchain root and shall resolve below
`<toolchainRoot>/products/<product>/<packageVersion>/`. Reference-tenant
example: the released TypeScript tenant's ABG product payload resolves below
`<toolchainRoot>/products/abiogenesis/<packageVersion>/`.

**REQ-P-INSTALL-009C**: The toolchain root shall not publish top-level command
shims. Command paths are product-version-scoped payload paths recorded in the
workspace binding and product manifest.

## Installed Runtime Truth

**REQ-P-INSTALL-010**: The installer shall write inspectable install truth in
the target workspace, including install manifest path, installer manifest path,
package identity, package root, command binding paths, runtime identity, event
root, projection or runtime state root, bootstrap entry path, and any selected
shared toolchain binding.

**REQ-P-INSTALL-011**: Installed command bindings shall resolve to the installed
ABG package, not to source-tree private paths or test harness helpers.

**REQ-P-INSTALL-012**: The installed runtime identity shall remain structured
and shall not be overwritten by reporting projections such as build labels or
test-run names.

**REQ-P-INSTALL-013**: Re-running the installer against an already populated
target workspace shall either refresh admitted installed state
deterministically or return a precise stale-install remediation result.

**REQ-P-INSTALL-014**: The installer shall emit or persist an install
provenance record into the installed runtime truth. The record shall identify
the installed package, installer build, target workspace, command bindings,
manifest refs, standards-copy refs, runtime identity, and install result.

**REQ-P-INSTALL-015**: The installer shall publish an operator-facing
verification surface that can distinguish a complete installed substrate from
an incomplete or stale substrate. If a build tenant replaces a command-line
`verify` mode with manifest or archive verification, that replacement shall be
public, typed, and documented as the verification surface.

**REQ-P-INSTALL-015A**: Topology verification shall validate the selected
toolchain binding and configured mutable state roots when a workspace is bound
to a shared toolchain. Verification shall fail closed when the binding file,
selected product root, command path, event log path, runtime root, projection
root, or archive root is missing.

**REQ-P-INSTALL-015B**: Runtime commands that require installed workspace
context shall load an admitted workspace toolchain binding before selecting
event, runtime, projection, or archive roots. Missing or malformed binding truth
is a runtime-resolution error, not a reason to fall back to target-root
defaults.

## Target Project Scaffold

**REQ-P-INSTALL-016**: The installer shall distinguish an imported target from
a clean target.

**REQ-P-INSTALL-017**: For an imported target, the installer shall preserve
project-owned specification, source, docs, and realization roots. It may add
substrate-owned surfaces but shall not rewrite imported project truth into ABG
project identity.

**REQ-P-INSTALL-018**: For a clean target, the installer shall either scaffold
starter project authority surfaces or return a typed condition stating that no
project authority exists yet. The selected behavior shall be explicit in the
installer request, manifest, and verification result.

**REQ-P-INSTALL-019**: If clean-target scaffolding is enabled, scaffolded
project surfaces shall remain project-owned starter surfaces. They shall not be
treated as ABG substrate truth after installation.

## Method Reference Payloads

**REQ-P-INSTALL-020**: The installer shall materialize method reference
payloads under the selected versioned product root so a cold agent can resolve
method standards through the workspace binding and product manifest without
knowing the source workspace layout.

**REQ-P-INSTALL-021**: The product standards payload shall include the full
standards tree from the source methodology distribution, including templates
and secondary method surfaces. Tests may assert a representative minimum set
such as `SPEC_METHOD.md`, `TICKET_METHOD.md`, `DESIGN_MODULE_METHOD.md`,
`ODD_METHOD.md`, `RELEASE_METHOD.md`, `WRITING_GUIDE.md`, `POSTING_GUIDE.md`,
`GLOSSARY_GUIDE.md`, the standards `README.md`, and `templates/`.

**REQ-P-INSTALL-022**: The installer manifest shall record the standards source
root, product standards root, and copied file inventory or checksums.

**REQ-P-INSTALL-023**: Installed standards are product reference payloads. They
do not outrank upstream `specification_methodology` when editing shared method
law.

**REQ-P-INSTALL-024**: The installer shall materialize domain-neutral ABG
reference docs or bootstrap docs required for cold-agent operation under the
selected product root. The docs surface shall be recorded in the product
manifest and installer manifest and shall not include downstream product HOW.

## Cold-Agent Bootstrap

**REQ-P-INSTALL-030**: The installer shall leave the target workspace
cold-agent-readable. A cold agent must be able to discover the installed ABG
substrate, the installed command bindings, the method reference copies, and the
workspace ownership boundary without prior session memory.

**REQ-P-INSTALL-031**: Substrate bootstrap instructions shall stay
domain-neutral. Product-specific instruction sections belong to downstream
installers and must remain visibly separate.

**REQ-P-INSTALL-032**: Installer-owned instruction delivery shall be
marker-governed or otherwise idempotent so refresh does not delete unrelated
project guidance.

**REQ-P-INSTALL-033**: The installer shall materialize a versioned ABG/GTL
context compression under the target `.abiogenesis/` surface. The context
content is owned by the selected ABG/GTL product version and shall be recorded
in installer manifest or provenance truth.

**REQ-P-INSTALL-034**: The installer shall refresh installer-owned ABG/GTL
context sections in cold-agent instruction files such as `AGENTS.md` and
`CLAUDE.md` on fresh install and upgrade/refresh. Refresh shall be
marker-governed, idempotent, and shall preserve unrelated project-owned
guidance.

**REQ-P-INSTALL-035**: Downstream projects shall not be required to hand-edit
ABG/GTL compression to track current GTL/ABG semantics. A stale installed
context section shall be replaced by the selected product version during
installer refresh, and malformed paired markers shall fail closed.

**REQ-P-INSTALL-036**: Target-workspace bootstrap shall bind the workspace to a
selected shared product version through `.abiogenesis/` binding truth and shall
not install the GTL/ABG product payload inside each downstream project. Product
payload materialization belongs to the shared product toolchain root; workspace
bootstrap is a convenience for local reference, context refresh, and mutable
state initialization.

## Sandbox And Archive Proof

**REQ-P-INSTALL-040**: Any downstream sandbox or qualification lane that claims
installed ABG substrate truth shall populate the target workspace through the
public ABG installer.

**REQ-P-INSTALL-041**: Installer qualification shall preserve a persistent
archive or postmortem that includes install manifest evidence, installer
manifest evidence, package identity, command binding evidence, standards-copy
evidence, runtime identity, event/projection roots, and an operator-facing
summary.

**REQ-P-INSTALL-042**: Source-tree imports, private test helpers,
harness-created runtime files, or manually copied `.abiogenesis` folders are
not sufficient proof of installed substrate behavior.

## Acceptance

A released tenant's installer is not release-candidate complete until a clean
target workspace proves:

- `.abiogenesis/` substrate root exists
- installed package, command bindings, reference docs, and standards resolve
  from an admitted shared product toolchain binding, with the product payload
  resolving below `<toolchainRoot>/products/<product>/<packageVersion>/`
- install and installer manifests record runtime and package truth
- the workspace toolchain binding records selected products, product manifest
  refs and digests, and mutable state roots
- the target workspace does not require a full local product dependency copy
  (reference-tenant example: no local
  `node_modules/@abiogenesis/typescript-tenant` copy)
- legacy environment aliases and missing toolchain selectors fail closed
- product-version command paths are recorded, and no top-level toolchain shim is
  generated
- the selected product root contains the full standards tree
- manifest proof records standards-copy evidence
- install provenance/event truth records package, command, standards, and
  runtime identity
- clean-target versus imported-target behavior is explicit
- public verification can classify the installed substrate
- cold-agent bootstrap surfaces are discoverable
- installed ABG/GTL context compression is versioned, manifest-recorded, and
  marker-refreshed in cold-agent instruction files
- repeat install behavior is deterministic or fails with precise remediation
- sandbox/archive proof is persistent and target-workspace inspectable
