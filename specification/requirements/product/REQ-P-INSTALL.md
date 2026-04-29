# REQ-P-INSTALL — Installed Substrate Contract

**Status**: Active
**Category**: Capability
**Date**: 2026-04-27
**Derives from**: [PRODUCT.md](../../PRODUCT.md), [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md)
**Wave**: TypeScript installer contract reprice

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

**REQ-P-INSTALL-002**: The installer shall create an installed ABG substrate
inside the target workspace without treating the mutable abiogenesis source
project as the installed product.

**REQ-P-INSTALL-003**: The installed substrate root shall be `.abiogenesis/`.
Downstream products may install product-owned payload beneath
`.abiogenesis/<product>/<build_tenant>/`, but they shall not redefine the ABG
substrate root.

**REQ-P-INSTALL-004**: The installer shall not encode downstream domain HOW.
Downstream products own domain meaning, graph catalogs, policy overlays,
acceptance interpretation, and product-specific instruction sections.

## Installed Runtime Truth

**REQ-P-INSTALL-010**: The installer shall write inspectable install truth in
the target workspace, including install manifest path, installer manifest path,
package identity, package root, command binding paths, runtime identity, event
root, projection or runtime state root, and bootstrap entry path.

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

## Method Reference Copies

**REQ-P-INSTALL-020**: The installer shall install method reference copies under
`.abiogenesis/docs/standards/` so a cold agent can resolve
`workspace://.abiogenesis/docs/standards/...` without knowing the source
workspace layout.

**REQ-P-INSTALL-021**: The installed standards copy shall include the full
standards tree from the source methodology distribution, including templates
and secondary method surfaces. Tests may assert a representative minimum set
such as `SPEC_METHOD.md`, `TICKET_METHOD.md`, `DESIGN_MODULE_METHOD.md`,
`ODD_METHOD.md`, `RELEASE_METHOD.md`, `WRITING_GUIDE.md`, `POSTING_GUIDE.md`,
`GLOSSARY_GUIDE.md`, the standards `README.md`, and `templates/`.

**REQ-P-INSTALL-022**: The installer manifest shall record the standards source
root, installed standards root, and copied file inventory or checksums.

**REQ-P-INSTALL-023**: Installed standards are target-workspace reference
copies. They do not outrank upstream `specification_methodology` when editing
shared method law.

**REQ-P-INSTALL-024**: The installer shall install domain-neutral ABG reference
docs or bootstrap docs required for cold-agent operation. The docs surface shall
be recorded in the manifest and shall not include downstream product HOW.

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

The TypeScript installer is not release-candidate complete until a clean target
workspace proves:

- `.abiogenesis/` substrate root exists
- installed package and command bindings resolve from target `node_modules`
- install and installer manifests record runtime and package truth
- `.abiogenesis/docs/standards/` contains the full installed standards tree
- manifest proof records standards-copy evidence
- install provenance/event truth records package, command, standards, and
  runtime identity
- clean-target versus imported-target behavior is explicit
- public verification can classify the installed substrate
- cold-agent bootstrap surfaces are discoverable
- repeat install behavior is deterministic or fails with precise remediation
- sandbox/archive proof is persistent and target-workspace inspectable
