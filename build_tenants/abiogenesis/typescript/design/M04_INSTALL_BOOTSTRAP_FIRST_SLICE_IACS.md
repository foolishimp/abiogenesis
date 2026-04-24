# M04 Install Bootstrap First Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M04_INSTALL_BOOTSTRAP_DERIVATION.md](./M04_INSTALL_BOOTSTRAP_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [M04_LIVE_STATUS_FIRST_SLICE_IACS.md](./M04_LIVE_STATUS_FIRST_SLICE_IACS.md), [T-019](../../.ai-workspace/tickets/completed/T-019-realize-typescript-m04-install-bootstrap-under-package-first-installed-runtime-law.md)

## Purpose

Declare the next TypeScript `M04-app-bootstrap` slice as an explicit
install/bootstrap carrier inventory so installed delivery truth stays below
kernel semantics and cannot be reintroduced as helper-owned script doctrine.

## M04 Install/Bootstrap First Slice Boundary

The first TypeScript install/bootstrap wave is:

- one admitted public install/bootstrap request carrier
- one admitted installed-runtime package contract carrier
- one pure install/bootstrap plan over explicit delivery truth
- one bounded install/bootstrap effect shell
- one closed public install/bootstrap outcome family

This wave does **not** include:

- bootloader CLI or project-facing operations
- package-manager execution
- archive or proof-log copying
- installed sandbox execution
- kernel/runtime semantic closure

## Upstream Authoritative Carriers Consumed By Install/Bootstrap

This slice does not redefine runtime or app semantic truth.

The following remain authoritative upstream truth and are consumed unchanged:

- the tenant package export surface
- completed `M04` public carrier families
- install target root input truth supplied at ingress

## Irreducible Architectural Carrier Set

The first TypeScript install/bootstrap wave is allowed exactly these prime
carrier families:

1. `PublicInstallBootstrapRequest`
2. `PublicInstallBootstrapOutcome`

Explicit variants of `PublicInstallBootstrapOutcome` are members of that one
prime outcome family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicInstallBootstrapRequest` | `M04-app-bootstrap` | authoritative public install/bootstrap ingress | package/install-bootstrap parser | none | plan derivation, effect shell |
| `PublicInstallBootstrapOutcome` | `M04-app-bootstrap` | authoritative public install/bootstrap outcome family | derived from admitted request plus canonical delivery materialization/verification | filesystem write boundary only | later bootloader and installed sandbox waves |

`PublicInstallBootstrapRequest` and `PublicInstallBootstrapOutcome` are the
only prime outer carriers in this slice.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `InstalledRuntimePackageContract` | subordinate | delivery contract consumed by install/bootstrap, not an outer public carrier | admitted once at the install/bootstrap boundary |
| `InstallTargetRoot` | subordinate | nested target-root detail, not a prime carrier | admitted once into `PublicInstallBootstrapRequest` |
| `InstallBootstrapPlan` | subordinate | pure internal delivery plan, not a public prime carrier | derived once from admitted request and package contract |
| `InstalledFileRef` | subordinate | nested delivery artifact detail | derived from the plan and verification result |
| `InstalledDirectoryRef` | subordinate | nested delivery artifact detail | derived from the plan and verification result |
| `InstallVerification` | subordinate | nested verification detail, not a separate public carrier family | derived from materialized delivery truth only |
| `PublicInstallBootstrapInstalled` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicInstallBootstrapOutcome` |
| `PublicInstallBootstrapRejected` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicInstallBootstrapOutcome` |
| bootloader command payloads | deferred | later delivery family | successor ticket only |
| package-manager execution payloads | deferred | later delivery family | successor ticket only |
| sandbox/archive delivery payloads | deferred | later qualification family | successor ticket only |

## M04 Install/Bootstrap First Slice Rules

- `PublicInstallBootstrapRequest` is the only lawful public ingress carrier
  for the first install/bootstrap slice.
- `PublicInstallBootstrapRequest` carries explicit target-root and installed
  package identity truth. It does not accept ambient current-working-directory
  defaults.
- the installed-runtime package contract is explicit and admitted. The effect
  shell must not read ambient `package.json` as hidden authority.
- the install/bootstrap plan is pure. File and directory writes happen only at
  the named effect boundary.
- the first slice may materialize installed delivery artifacts only:
  `package.json`, one bootstrap entry, one install manifest, and the bounded
  workspace roots declared by the plan.
- the first slice must reject mismatched existing installed roots rather than
  silently normalizing them.
- the first slice remains below kernel semantics. It does not execute runtime
  operations or append runtime facts.

## Promotion Rule

No subordinate payload may be promoted during the first install/bootstrap wave
unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-019` before code lands.
