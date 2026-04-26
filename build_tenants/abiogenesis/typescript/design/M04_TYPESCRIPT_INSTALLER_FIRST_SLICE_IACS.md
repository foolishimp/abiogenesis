# M04 TypeScript Installer First Slice IACS

**Status**: Active
**Date**: 2026-04-26
**Derived from**: [M04_TYPESCRIPT_INSTALLER_DERIVATION.md](./M04_TYPESCRIPT_INSTALLER_DERIVATION.md), [M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md](./M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md), [REQ-P-QUAL](../../../../specification/requirements/product/REQ-P-QUAL.md), [T-076](../../../../.ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md)

## Purpose

Declare the TypeScript installer carrier inventory so ABG TS installs are
public, manifest-backed, and consumable by downstream sandbox runners without
importing private test support.

## Boundary

The first TypeScript installer wave is:

- one admitted installer request carrier
- one public installer outcome family
- one package materialization effect boundary
- one command-binding materialization effect boundary
- one installer manifest

This wave consumes the existing `PublicInstallBootstrapRequest` and
`PublicInstallBootstrapOutcome` carriers. It does not replace them.

## Irreducible Architectural Carrier Set

The TypeScript installer wave is allowed exactly these new prime carrier
families:

1. `AbgTypescriptInstallerRequest`
2. `AbgTypescriptInstallerOutcome`

Explicit installed and rejected variants are members of the installer outcome
family.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `AbgTypescriptInstallerRequest` | `M04-app-bootstrap` | authoritative TypeScript installer ingress | CLI/package installer parser | none | install/bootstrap, package materialization |
| `AbgTypescriptInstallerOutcome` | `M04-app-bootstrap` | authoritative installer result | derived from admitted request plus verified delivery | filesystem package and command writes only | M05 qualification, downstream sandbox runners |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `InstallTargetRoot` | subordinate | already owned by install/bootstrap | admitted through installer request |
| `PackageSourceRoot` | subordinate | path detail for the package pack effect | admitted as an absolute or cwd-resolved path by adapter |
| `PackageIdentity` | subordinate | derived from source package manifest | read after request admission |
| `RuntimeIdentity` | subordinate | installer/runtime read model, not traversal authority | derived from package identity |
| `PackageTarballRef` | subordinate | effect output, not public authority by itself | derived from `npm pack` output |
| `InstalledPackageRoot` | subordinate | target package location | derived from package identity |
| `CommandBindingRef` | subordinate | nested delivery artifact | derived from installed package bin map |
| `InstallerManifest` | subordinate | persisted read model over installer outcome | derived from installed outcome |

## Rules

- the installer must call the existing install/bootstrap carrier boundary
  rather than rewriting target workspace bootstrap rules.
- package identity must come from the package manifest being installed.
- the installer must install a package artifact into the target workspace, not
  create a source-tree symlink as proof.
- command bindings must be present in the target workspace.
- installer proof must include both bootstrap manifest truth and package/command
  manifest truth.
- package source roots admitted through the public API must be absolute paths;
  CLI adapters may resolve relative operator input before request admission.
- installer proof must preserve runtime identity and archive/postmortem evidence
  under the stable test-run archive root.
- installer rejection must be explicit and must not silently fall back to
  source-local imports.
