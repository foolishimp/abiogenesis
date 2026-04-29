---
id: T-081
title: Realize TypeScript installer CLI runtime binding for direct ABG commands
type: bug
ticket_category: installer_product_contract
status: completed
goal: abg-typescript-installed-substrate-contract
change_intent: Make an installed TypeScript ABG substrate directly consumable by the installed `genesis-ts` and `abiogenesis-ts` command bindings after public installer population.
change_class: design_reframe
re_entry_point: design
affected_boundary: TypeScript installer manifest, installed runtime binding, direct ABG CLI start/gaps commands, topology verification, installed sandbox proof
priority: high
triaged_at: 2026-04-27T04:10:20Z
created_at: 2026-04-27T04:10:20Z
updated_at: 2026-04-27T04:20:34Z
completed_at: 2026-04-27T04:20:34Z
dependencies:
  - REQ-P-INSTALL active
  - T-076 completed
  - T-079 completed
  - T-080 backlog
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
requirement_authority:
  - specification/PRODUCT.md Installed Substrate Contract
  - specification/requirements/product/REQ-P-INSTALL.md
design_authority:
  - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_STRUCTURAL_CARRIER_DIAGRAM.md
intake_source: Rebuilt downstream `data_mapper.test46.ts` proved `odd-sdlc-ts` commands work after install, but direct installed `genesis-ts gaps --workspace . --scope workspace` and `abiogenesis-ts gaps --workspace . --scope workspace` failed because the public ABG CLI requires an app-owned runtime binding at `.abiogenesis/typescript-runtime.mjs` or `.abiogenesis/cli-runtime.mjs`.
target_truth: The TypeScript ABG installer publishes a domain-neutral installed CLI runtime binding artifact recorded in manifest and topology proof, so installed `genesis-ts` and `abiogenesis-ts` can run direct `gaps` and `start` commands from a freshly installed workspace without source-tree private fixtures.
superseded_truth: Installing the ABG package and command binaries alone is sufficient direct ABG CLI readiness.
closure_law: close only when the installer writes the runtime binding, the manifest and topology verifier require it, tests prove both installed binary aliases can run direct `gaps` from a public install, and `start` can execute the installed binding without requiring private test-created runtime files.
non_closure_conditions:
  - runtime binding is created only by a test fixture
  - runtime binding encodes downstream domain HOW
  - direct command proof imports source-tree private files
  - topology verification can pass without the runtime binding artifact
---

# T-081: Installed CLI Runtime Binding

## Problem

The TypeScript installer publishes the package and binaries, but the installed
ABG CLI cannot run `gaps` or `start` from the target workspace because the CLI
loads runtime truth from `.abiogenesis/typescript-runtime.mjs` or
`.abiogenesis/cli-runtime.mjs`.

That makes the binary binding only partially useful. The installed command is
present, but the installed workspace lacks the runtime binding needed for direct
ABG observation and advancement.

## Triage

The missing layer is design, not new product law. `REQ-P-INSTALL` already
requires installed command bindings, runtime identity, cold-agent readability,
and public verification. The TypeScript installer design already owns package,
command, manifest, provenance, docs, standards, and topology proof. The missing
piece is the installer carrier inventory for the CLI runtime binding artifact.

## Implementation Rule

The ABG installer may publish only a domain-neutral fallback CLI runtime
binding. It must not encode downstream project graph catalogs, domain assets,
or acceptance interpretation.

Downstream products remain free to publish a product-owned runtime binding for
their own graph functions. The ABG-installed binding proves substrate readiness,
not downstream program readiness.

## Implementation Evidence

Completed for the ABG TypeScript installer:

- `M04_TYPESCRIPT_INSTALLER_DERIVATION.md`,
  `M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md`, and
  `M04_TYPESCRIPT_INSTALLER_STRUCTURAL_CARRIER_DIAGRAM.md` now include the
  installed CLI runtime binding artifact and topology proof boundary.
- `installAbiogenesisTypescript(...)` writes a domain-neutral fallback runtime
  binding at `.abiogenesis/cli-runtime.mjs`.
- The binding publishes only the installed-substrate self-test module
  `abiogenesis_installed_substrate` and graph function
  `installed_cli_runtime_binding_self_test`.
- `.abiogenesis/typescript-installer-manifest.json` and
  `.abiogenesis/install-provenance.json` record the runtime binding path.
- `verifyAbiogenesisTypescriptInstallTopology(...)` fails if the runtime
  binding path is missing.
- Installed direct aliases `genesis-ts` and `abiogenesis-ts` can now execute
  direct ABG `gaps` from a clean public install without test-created runtime
  files.
- Installed direct `genesis-ts start --target
  graph_function:installed_cli_runtime_binding_self_test --until converged`
  resolves the package-backed runtime identity and converges.

Verification run on 2026-04-27:

- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript`:
  `npm run test:t076` passed: 3 tests.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript`:
  `npm run test:t057` passed: 8 tests.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript`:
  `npm run test:t058` passed: 4 tests.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript`:
  `npm run lint:semantic` passed.
- `/Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/typescript`:
  `npm run test:semantic` passed: 242 tests.

Persistent archive proof:

- `build_tenants/abiogenesis/typescript/test_env/test_runs/typescript_installer/public_installer/2026-04-27T041800868Z/`

Downstream rebuild proof:

- Rebuilt `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper/data_mapper.test46.ts`
  from `data_mapper.template` using the odd_sdlc TypeScript installer and ABG
  package source.
- Installed topology verification reports `complete: true` and
  `runtimeBindingPresent: true`.
- From the rebuilt sandbox, `node_modules/.bin/genesis-ts gaps --workspace .
  --scope workspace` succeeds against package
  `abiogenesis_installed_substrate`.
- From the rebuilt sandbox, `node_modules/.bin/abiogenesis-ts gaps --workspace
  . --scope workspace` succeeds against package
  `abiogenesis_installed_substrate`.
- From the rebuilt sandbox, `node_modules/.bin/genesis-ts start --workspace .
  --scope workspace --target
  graph_function:installed_cli_runtime_binding_self_test --until converged`
  returns `status: converged` with runtime identity
  `package:@abiogenesis/typescript-tenant@3.4.0-rc.2`.
- From the rebuilt sandbox, `node_modules/.bin/odd-sdlc-ts gaps --workspace .`
  succeeds and reports the expected blocked SDLC state
  `fp_worker_unattached`.
- From the rebuilt sandbox, `node_modules/.bin/odd-sdlc-ts start --workspace .
  --target next --until blocked` succeeds and reports
  `sdlc_public_start_blocked` with `blockingReason: fp_worker_unattached`.

Closure conclusion:

- The ABG TypeScript installer now installs command binaries and the runtime
  binding required to make those binaries directly useful from a fresh
  installed workspace.
- The fallback runtime binding is ABG-owned substrate proof only. Downstream
  product graph functions remain owned by downstream product runtime bindings
  and commands.
