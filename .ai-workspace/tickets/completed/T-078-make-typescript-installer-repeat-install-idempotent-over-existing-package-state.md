---
id: T-078
title: Make TypeScript installer repeat install idempotent over existing package state
type: defect
ticket_category: installer_corrective
status: completed
goal: abg-typescript-rc-stabilization
change_intent: Reprice the ABG TypeScript installer so rerunning install against a previously populated target either refreshes admitted package state deterministically or returns a precise stale-install remediation result.
change_class: requirement_reprice
re_entry_point: requirements
affected_boundary: TypeScript installer, installed package manifest, file dependency refresh, downstream sandbox population
priority: high
triaged_at: 2026-04-27T01:30:12Z
created_at: 2026-04-27T01:30:12Z
updated_at: 2026-04-27T18:20:36Z
completed_at: 2026-04-27T18:20:36Z
dependencies:
  - REQ-P-INSTALL active
  - T-076 completed
  - T-080 backlog full installer capability review
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
intake_source: odd_sdlc data_mapper.test46.ts reinstall after topology repair rejected with "existing package.json runtime dependency does not match the admitted runtime package contract" because the target still referenced an earlier `.abiogenesis/package-pack/...tgz`.
requirement_authority:
  - specification/PRODUCT.md Installed Substrate Contract
  - specification/requirements/product/REQ-P-INSTALL.md
target_truth: ABG TypeScript install is deterministic over clean targets and reruns; repeated install over a previously installed target updates the admitted file dependency and manifests coherently.
superseded_truth: clean-install success alone is enough downstream sandbox population proof.
closure_law: close only when a repeat-install test proves the public installer behavior over an already installed target and downstream consumers can distinguish refreshed install from non-admitted stale state.
---

# T-078: Idempotent TypeScript Installer Reruns

## Problem

A clean `odd_sdlc.TS` install into `data_mapper.test46.ts` succeeds after the
tenant payload is moved under `.abiogenesis/odd_sdlc/typescript/`.

The first rerun against the previously installed target failed because
`package.json` still referenced an older ABG tarball under
`.abiogenesis/package-pack/...`. The installer rejected the mismatch instead of
refreshing the installed dependency or returning a remediation-specific stale
install result.

## Resolution

Repeat install over the same admitted installed package now refreshes in place.
The installer classifies the run as `fresh` or `refresh` before write effects
and records that `installMode` in the installer manifest, install provenance,
and installed outcome.

The bootstrap mismatch check no longer rejects an obsolete dependencyRef when
the installed package identity and runtime package identity remain admitted.
Mismatched installed package names and mismatched runtime package names still
reject.

## Implementation Evidence

- `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/install.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/typescript_installer.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/typescript_installer_carriers.ts`
- `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/typescript_installer_constructors.ts`
- `build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_STRUCTURAL_CARRIER_DIAGRAM.md`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_typescript_installer_integration.test.mjs`

## Verification

Passed:

```text
npm run test:t076
```

The new `T-078 public TypeScript installer refreshes repeated installs over
admitted package state` test installs ABG TypeScript twice into the same target,
proves the second tarball path differs, proves `package.json` and
`.abiogenesis/install-manifest.json` point at the second tarball, proves the
installer manifest and provenance record `installMode: "refresh"`, and runs the
installed `genesis-ts gaps` command after refresh.

## Closure Review

- Spec: `REQ-P-INSTALL-013` already owns repeat install determinism.
- Ticket: the failure was correctly triaged as an installer requirements/product
  contract defect, not an odd_sdlc downstream workaround.
- Design: `InstallMode` is subordinate installer truth, not a new outcome
  family or runtime traversal authority.
- ODD: no downstream domain HOW moved into ABG; this only repairs installed
  substrate delivery semantics.
