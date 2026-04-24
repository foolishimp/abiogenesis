# M04 Install Bootstrap Structural Carrier Diagram

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M04_INSTALL_BOOTSTRAP_DERIVATION.md](./M04_INSTALL_BOOTSTRAP_DERIVATION.md), [M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md](./M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [T-019](../../.ai-workspace/tickets/completed/T-019-realize-typescript-m04-install-bootstrap-under-package-first-installed-runtime-law.md)

## Purpose

Render the next `M04-app-bootstrap` install/bootstrap boundary as one
module-bounded Mermaid UML carrier topology so Prime Rule, visibility, and
deferred-family discipline are inspectable before implementation starts.

## Diagram

```mermaid
classDiagram

class PublicInstallBootstrapRequest {
  <<prime>>
  <<authoritative>>
}

class PublicInstallBootstrapOutcome {
  <<prime>>
  <<authoritative>>
  +kind: "installed" | "rejected"
}

class InstallTargetRoot {
  <<subordinate>>
}

class InstalledRuntimePackageContract {
  <<subordinate>>
}

class InstallBootstrapPlan {
  <<subordinate>>
}

class InstalledFileRef {
  <<subordinate>>
}

class InstalledDirectoryRef {
  <<subordinate>>
}

class InstallVerification {
  <<subordinate>>
}

class PublicInstallBootstrapInstalled {
  <<prime family variant>>
}

class PublicInstallBootstrapRejected {
  <<prime family variant>>
}

class BootloaderPayload {
  <<deferred>>
}

class PackageManagerExecution {
  <<deferred>>
}

class InstalledSandboxExecution {
  <<deferred>>
}

PublicInstallBootstrapRequest *-- InstallTargetRoot
PublicInstallBootstrapRequest --> InstalledRuntimePackageContract : consumes admitted
PublicInstallBootstrapRequest *-- InstallBootstrapPlan : derives

PublicInstallBootstrapInstalled --|> PublicInstallBootstrapOutcome
PublicInstallBootstrapRejected --|> PublicInstallBootstrapOutcome

PublicInstallBootstrapInstalled *-- InstalledFileRef
PublicInstallBootstrapInstalled *-- InstalledDirectoryRef
PublicInstallBootstrapInstalled *-- InstallVerification

PublicInstallBootstrapOutcome ..> BootloaderPayload : deferred later
PublicInstallBootstrapOutcome ..> PackageManagerExecution : deferred later
PublicInstallBootstrapOutcome ..> InstalledSandboxExecution : deferred later
```

## Reading Rules

- `PublicInstallBootstrapRequest` and `PublicInstallBootstrapOutcome` are the
  only prime outer carriers in this slice.
- install target, package contract, pure plan, and verification detail stay
  subordinate and nested.
- bootloader, package-manager execution, and installed sandbox families remain
  deferred.

## Sign-Off Claim

This install/bootstrap diagram is lawful only if the future TypeScript code:

- admits one closed public install/bootstrap request family,
- derives one pure delivery plan from admitted request and package contract,
- materializes only the planned installed artifacts at the named effect
  boundary, and
- rejects mismatched installed roots rather than normalizing them.
