# T-076 Realize TypeScript ABG Installer For Downstream Sandbox Population

- id: T-076
- title: Realize TypeScript ABG installer for downstream sandbox population
- type: feature
- ticket_category: substrate_dependency
- status: completed
- build_tenant: typescript
- goal: provide-abg-owned-typescript-installer-for-installed-sandbox-population
- change_intent: Promote the TypeScript ABG install/bootstrap and package delivery surfaces into one public downstream-consumable ABG TypeScript installer.
- change_class: design_reframe
- re_entry_point: design
- triaged_at: 2026-04-26
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- dependencies:
  - T-019
  - T-022
  - T-030
  - T-072
  - T-075
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/**`, `build_tenants/abiogenesis/typescript/code/src/cli/**`, `build_tenants/abiogenesis/typescript/code/src/qualification/m05/**`, TypeScript package exports, TypeScript CLI bindings, downstream sandbox fixtures
- intake_source: odd_sdlc.TS sandbox review found that current sandbox tests are harnessed/in-process and must be repopulated by ABG install before they can qualify installed sandbox behavior.
- target_truth: ABG TypeScript publishes and proves one public installer that downstream products can call or invoke to create a fresh installed workspace, record install manifest truth, expose installed package/CLI bindings, and archive runtime/projection evidence without importing private ABG test helpers.
- superseded_truth: ABG TypeScript install/bootstrap internals and M05 test helpers are enough for downstream products to claim ABG-populated sandbox proof.

## Problem

ABG TypeScript already has bounded install/bootstrap law and M05 sandbox/archive
qualification surfaces.

That is not yet the downstream contract needed by products such as
`odd_sdlc.TS`.

The missing public substrate is an ABG TypeScript installer:

- create or verify a fresh target workspace
- populate it through ABG TypeScript install law
- install the ABG TypeScript package into the target workspace
- write `.abiogenesis` install manifest/runtime identity truth
- expose installed package or CLI command bindings
- provide a reusable archive-compatible manifest of what was installed
- let downstream tests run from installed workspace truth without private ABG
  source/test helper imports

Without that surface, downstream sandboxes can pass as source-local harnesses
while install, public command binding, or installed runtime projection is broken.

## Python Precedent

The Python ABG sandbox line already uses the stronger install-first boundary.

`install_real_sandbox(...)` invokes `gen-install.py --target <workspace>`,
captures install evidence, sets installed runtime execution to
`PYTHONPATH=<workspace>/.genesis`, and then executes `python -m genesis` from
inside the target workspace. Sandbox install tests assert that the full engine
runtime was copied into `.genesis/genesis` and that the `.ai-workspace`
runtime skeleton exists before runtime bootstrap.

The TypeScript gap is therefore not a new product ambition. It is a regression
against the installed-sandbox proof class already established by the Python
ABG line.

## Scope

Design and realize a public TypeScript ABG installer.

The installer must sit above the existing bounded install/bootstrap primitives
without collapsing downstream domain HOW into ABG.

It owns substrate installation and runtime-truth population only:

- package identity
- install manifest
- public command bindings
- runtime identity
- ABG event/projection/archive framework hooks
- installed workspace reset or fresh-root semantics

It must not own downstream domain asset meaning, downstream graph-function
catalog policy, or downstream acceptance interpretation.

## Evaluation Criteria

- Add or ratify a design surface for the TypeScript installer.
- Export the installer through the public TypeScript package surface.
- Provide a package/CLI binding suitable for downstream sandbox runners.
- Prove a fresh workspace is populated through ABG install and contains
  install-manifest/runtime identity evidence.
- Prove a downstream-style consumer can run against the installed boundary
  without importing private ABG test helpers.
- Archive evidence includes install manifest, package identity, command path,
  runtime identity, event/projection evidence, and postmortem output.
- Update downstream-facing docs so products know this is the lawful sandbox
  population surface.

## Non-Closure Conditions

- downstream tests must import ABG private `test_env` helpers.
- sandbox proof is source-local only.
- the installer writes domain-specific odd_sdlc files or downstream HOW.
- package version identity is inferred from a local symlink without manifest
  evidence.
- archive proof omits installed runtime identity or public command path.

## Downstream Consumer

The first known downstream consumer is:

- `/Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/backlog/T-052-require-abg-populated-installed-workspaces-for-all-typescript-sandboxes.md`

ABG closes this ticket first. `odd_sdlc.TS` then reprices its sandbox lane to
consume the released/public ABG TypeScript installer and reruns all sandbox
tests from installed workspace truth.

## Implementation Notes

The implemented public installer is `installAbiogenesisTypescript(...)` under
the existing public `./app/m04/install-bootstrap` package subpath.

The installer now:

- admits a public TypeScript installer request
- invokes the existing `PublicInstallBootstrapRequest` boundary
- packs the TypeScript tenant with `npm pack`
- installs the package into `node_modules/@abiogenesis/typescript-tenant`
- links package dependencies from the source or nearest parent installed
  `node_modules`
- writes target-local command bindings:
  `node_modules/.bin/abiogenesis-ts` and `node_modules/.bin/genesis-ts`
- writes `.abiogenesis/typescript-installer-manifest.json`
- supports `genesis-ts install --target <path>` without requiring
  `--package-source`, matching the Python installer expectation that the
  installer can locate its own package root

M05 installed sandbox fixtures now provision through the public installer before
bootloader and scenario proof. `installPackedTenantPackage(...)` remains as a
compatibility helper but returns the installer-created package binding when the
installer manifest is present.

## Closure Evidence

Design surfaces:

- `build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_STRUCTURAL_CARRIER_DIAGRAM.md`

Code surfaces:

- `build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/typescript_installer*.ts`
- `build_tenants/abiogenesis/typescript/code/src/cli/command.ts`
- `build_tenants/abiogenesis/typescript/test_env/tests/support/m05-installed-fixtures.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m04_typescript_installer_integration.test.mjs`

Verification:

- `npm run test:t076` — 2 tests passed
- `npm run test:t022` — 6 tests passed
- `npm run test:t057` — 8 tests passed
- `npm run test:semantic` — 241 tests passed
- `npm run lint:semantic` — passed
- `CODEX_LIVE_FP=1 npm run test:live:uat` — 2 live tests passed
- `CODEX_LIVE_FP=1 npm run test:live` — 1 live portfolio test passed

## STDO Self Review

- Spec authority: no new domain HOW moved into ABG. The installer owns package
  and command delivery only.
- Ticket authority: this ticket now closes the public TypeScript installer gap
  that downstream sandbox tickets depend on.
- Design authority: installer carriers are prime and bounded; package identity,
  tarball refs, command bindings, and manifests stay subordinate.
- ODD authority: traversal, graph-function policy, runtime iteration, and
  downstream acceptance interpretation remain outside the installer.
