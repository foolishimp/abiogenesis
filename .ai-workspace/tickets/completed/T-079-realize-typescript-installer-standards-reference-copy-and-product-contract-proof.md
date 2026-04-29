---
id: T-079
title: Realize TypeScript installer standards reference copy and product contract proof
type: defect
ticket_category: installer_product_contract
status: completed
goal: abg-typescript-installed-substrate-contract
change_intent: Realize the newly elevated installed substrate product contract for the TypeScript installer where it is currently missing standards reference copies and manifest proof.
change_class: design_reframe
re_entry_point: design
affected_boundary: TypeScript installer, installed `.abiogenesis/docs/standards`, installer manifest, cold-agent substrate reference surface, downstream sandbox population
priority: high
triaged_at: 2026-04-27T02:12:00Z
created_at: 2026-04-27T02:12:00Z
updated_at: 2026-04-27T03:18:00Z
completed_at: 2026-04-27T03:18:00Z
dependencies:
  - REQ-P-INSTALL active
  - T-076 completed
  - T-080 backlog full installer capability review
  - T-077 backlog for public sandbox archive API
  - T-078 backlog for repeat install idempotency
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
intake_source: odd_sdlc installer review found `.abiogenesis/docs/standards` absent from `data_mapper.test46.ts`; operator clarified installed standards are an intentional tactical solution for cold-agent workspace references.
requirement_authority:
  - specification/PRODUCT.md Installed Substrate Contract
  - specification/requirements/product/REQ-P-INSTALL.md
target_truth: ABG TypeScript installer installs the full method standards tree under `.abiogenesis/docs/standards/`, records standards source/root/file proof in the installer manifest, and proves the installed substrate contract from a clean target workspace.
superseded_truth: downstream installers or cold-agent instruction files may rely on absolute source-workspace standards paths, or manually copy method standards outside the ABG installer.
closure_law: close only when design/module surfaces are updated under Design Module Method, installer implementation writes the standards copy through the public TypeScript installer, tests prove installed files and manifest proof, and downstream odd_sdlc can reference `workspace://.abiogenesis/docs/standards/...` without local copying.
---

# T-079: Installer Standards Reference Copy

## Problem

The TypeScript ABG installer currently creates package, bootstrap, command, and
runtime manifest surfaces, but it does not install method standards into the
target workspace.

That leaves cold-agent references dependent on source-workspace paths such as
`/Users/jim/src/apps/specification_methodology/...`. Those paths are useful for
source development, but they are not the installed workspace contract.

## Required Direction

1. Update TypeScript installer design/module surfaces for
   `REQ-P-INSTALL-020` through `REQ-P-INSTALL-024`.
2. Add an admitted standards-source/install-root carrier or equivalent
   installer-owned manifest field.
3. Install the full standards tree into `.abiogenesis/docs/standards/`.
4. Record standards source root, installed standards root, and copied file
   inventory or checksums in `.abiogenesis/typescript-installer-manifest.json`.
5. Add tests proving a clean install contains the standards files and manifest
   proof.
6. Re-run one downstream `odd_sdlc` install sanity check after the ABG fix.

## Minimum Smoke-Asserted Standards

- `README.md`
- `SPEC_METHOD.md`
- `TICKET_METHOD.md`
- `DESIGN_MODULE_METHOD.md`
- `ODD_METHOD.md`
- `RELEASE_METHOD.md`
- `WRITING_GUIDE.md`
- `POSTING_GUIDE.md`
- `GLOSSARY_GUIDE.md`
- `templates/`

## Non-Closure Conditions

- copying standards in odd_sdlc instead of ABG
- relying on absolute source-workspace standards paths in cold-agent guidance
- installing files without manifest proof
- using private test helpers or manual filesystem setup as the installer proof

## ABG-First Implementation Evidence

Completed for the ABG TypeScript installer:

- `M04_TYPESCRIPT_INSTALLER_DERIVATION.md`,
  `M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md`, and
  `M04_TYPESCRIPT_INSTALLER_STRUCTURAL_CARRIER_DIAGRAM.md` now name the
  standards/docs/provenance/topology surfaces.
- `installAbiogenesisTypescript(...)` installs domain-neutral ABG docs under
  `.abiogenesis/docs/` and the full standards tree under
  `.abiogenesis/docs/standards/`.
- `.abiogenesis/typescript-installer-manifest.json` records target mode,
  clean-target policy, docs roots/files, standards roots/files, provenance
  path, package identity, commands, runtime identity, and runtime roots.
- `.abiogenesis/install-provenance.json` is persisted as install truth.
- `verifyAbiogenesisTypescriptInstallTopology(...)` is a public typed
  topology verifier over the installed target.
- `test_m04_typescript_installer_integration.test.mjs` validates topology
  before probing the installed package and archives manifest/provenance/docs/
  standards evidence.

Verification run on 2026-04-27:

- `npm run test:t076` passed: 3 tests.
- `npm run test:t022` passed: 6 installed-sandbox tests.
- `npm run test:t036` passed: 2 sandbox behavior tests.
- `npm run test:t064` passed: 3 data-mapper ingress sandbox tests.
- `npm run test:semantic` passed: 242 tests.
- `npm run lint:semantic` passed.

Persistent archive proof:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_installer/public_installer/2026-04-27T031109449Z/`

Downstream closure evidence:

- `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript`: `npm run test:t059`
  passed: 4 install/release adapter tests.
- `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript`: `npm run test:sandbox`
  passed: 6 ABG-populated sandbox tests.
- `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript`: `npm run test:semantic`
  passed: 73 tests.
- `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript`: `npm run lint:semantic`
  passed.
- `/Users/jim/src/apps/odd_sdlc/build_tenants/typescript`:
  `ODD_SDLC_TS_LIVE_FP=1 npm run test:live` passed: 1 live data_mapper
  worker test in 205256 ms.

Closure conclusion:

- ABG TypeScript installs now provide the standards/docs/provenance/topology
  substrate required by downstream odd_sdlc tests.
- The downstream install and sandbox lanes consume the public ABG installer
  path rather than manual `.abiogenesis` population.
