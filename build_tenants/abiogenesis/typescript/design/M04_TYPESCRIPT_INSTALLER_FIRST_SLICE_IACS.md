# M04 TypeScript Installer First Slice IACS

**Status**: Active
**Date**: 2026-04-26
**Derived from**: [M04_TYPESCRIPT_INSTALLER_DERIVATION.md](./M04_TYPESCRIPT_INSTALLER_DERIVATION.md), [M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md](./M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md), [REQ-P-QUAL](../../../../specification/requirements/product/REQ-P-QUAL.md), [REQ-P-INSTALL](../../../../specification/requirements/product/REQ-P-INSTALL.md), [T-076](../../../../.ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md), [T-079](../../../../.ai-workspace/tickets/completed/T-079-realize-typescript-installer-standards-reference-copy-and-product-contract-proof.md)

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
- one standards/docs materialization effect boundary
- one CLI runtime binding materialization effect boundary
- one installer manifest
- one install provenance record
- one topology verification read model

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
| `AbgTypescriptInstallerOutcome` | `M04-app-bootstrap` | authoritative installer result | derived from admitted request plus verified delivery | filesystem package, command, docs, standards, CLI runtime binding, manifest, and provenance writes only | M05 qualification, downstream sandbox runners |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `InstallTargetRoot` | subordinate | already owned by install/bootstrap | admitted through installer request |
| `PackageSourceRoot` | subordinate | path detail for the package pack effect | admitted as an absolute or cwd-resolved path by adapter |
| `StandardsSourceRoot` | subordinate | path detail for the standards copy effect | optional absolute request root, otherwise resolved from installed/source context |
| `DocsSourceRoot` | subordinate | path detail for domain-neutral ABG docs copy effect | optional absolute request root, otherwise resolved from installed/source context |
| `TargetMode` | subordinate | target observation nested under one install result | derived before write effects from target project-authority markers |
| `CleanTargetPolicy` | subordinate | clean-target behavior detail, not project authority itself | admitted explicitly or defaulted to `no_scaffold` |
| `PackageIdentity` | subordinate | derived from source package manifest | read after request admission |
| `RuntimeIdentity` | subordinate | installer/runtime read model, not traversal authority | derived from package identity |
| `InstallMode` | subordinate | rerun observation over existing installed substrate, not a separate outcome family | derived before write effects from existing install manifests |
| `CliRuntimeBindingPath` | subordinate | installed ABG CLI adapter artifact, not downstream program authority | derived from target root as `.abiogenesis/cli-runtime.mjs` |
| `PackageTarballRef` | subordinate | effect output, not public authority by itself | derived from `npm pack` output |
| `InstalledPackageRoot` | subordinate | target package location | derived from package identity |
| `CommandBindingRef` | subordinate | nested delivery artifact | derived from installed package bin map |
| `InstalledStandardsRoot` | subordinate | target reference-copy location | derived from target root as `.abiogenesis/docs/standards` |
| `InstalledDocsRoot` | subordinate | target domain-neutral docs location | derived from target root as `.abiogenesis/docs` |
| `InstalledFileEvidence` | subordinate | manifest proof detail | derived after copy from file byte counts and checksums |
| `InstallerManifest` | subordinate | persisted read model over installer outcome | derived from installed outcome |
| `InstallProvenance` | subordinate | persisted event/provenance truth over the install | derived from installed outcome |
| `TopologyVerification` | subordinate | public verification read model, not a second installer result | derived from manifest and target filesystem observation |

## Rules

- the installer must call the existing install/bootstrap carrier boundary
  rather than rewriting target workspace bootstrap rules.
- package identity must come from the package manifest being installed.
- the installer must install a package artifact into the target workspace, not
  create a source-tree symlink as proof.
- command bindings must be present in the target workspace.
- installer proof must include both bootstrap manifest truth and package/command
  manifest truth.
- installer proof must include standards-copy, docs-copy, CLI runtime binding,
  install provenance, and topology verification truth.
- the installer-owned CLI runtime binding must stay domain-neutral and may only
  publish substrate self-test graph-function truth.
- downstream products own any product-specific runtime binding that targets
  their graph catalogs, assets, policy overlays, or acceptance interpretation.
- package source roots admitted through the public API must be absolute paths;
  CLI adapters may resolve relative operator input before request admission.
- optional standards and docs roots admitted through the public API must be
  absolute paths.
- clean targets default to `no_scaffold`; this installs ABG substrate truth
  without claiming project authority.
- imported targets must preserve existing project-owned roots while adding ABG
  substrate-owned surfaces.
- rerunning the installer over the same admitted installed package must classify
  the run as `refresh` and update the package dependency, install manifest,
  installer manifest, provenance, package root, and command bindings coherently.
- rerunning the installer over a mismatched installed package identity must
  remain an explicit rejection rather than an implicit takeover.
- installer proof must preserve runtime identity and archive/postmortem evidence
  under the stable test-run archive root.
- installer rejection must be explicit and must not silently fall back to
  source-local imports.
