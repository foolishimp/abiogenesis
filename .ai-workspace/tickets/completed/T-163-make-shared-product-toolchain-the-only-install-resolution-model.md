---
id: T-163
title: Make shared product toolchain the only install and resolution model
type: feature
ticket_category: implementation_migration
status: completed
goal: >-
  Replace the first-slice T-161 compatibility model with one coherent
  developer-only shared product toolchain model. Abiogenesis and downstream
  ODD products resolve immutable versioned product payloads from one selected
  toolchain root, while each observed workspace records an explicit binding
  and explicit mutable state roots. No target workspace should need a local
  full product library install, compatibility shim, legacy environment alias,
  or backwards-compatibility interface.
change_intent: >-
  Reprice and migrate the ABG install model from "shared toolchain as an
  optional compatibility mode" to "shared product toolchain as the only
  authoritative install and runtime resolution model." A developer selects one
  canonical toolchain root, installs any number of product versions beneath it,
  and binds each workspace to selected product versions and mutable roots. The
  implementation must delete or fail closed legacy target-local package-copy
  paths, top-level command shims, implicit target-root defaults, and legacy
  environment aliases rather than carrying them as technical debt.
change_class: product_reprice
re_entry_point: product
owner: abiogenesis
priority: high
triaged_at: 2026-06-27
created_at: 2026-06-27
updated_at: 2026-06-27
governance_scope: Goals, Product, Requirements, Install, Release, GTL, ABG
build_tenant: typescript
source_ticket: .ai-workspace/tickets/completed/T-161-declare-shared-toolchain-install-root-and-version-selector.md
dependencies:
  - .ai-workspace/tickets/completed/T-161-declare-shared-toolchain-install-root-and-version-selector.md
related_tickets:
  - .ai-workspace/tickets/completed/T-162-realize-abg-requirements-algebra-strategy.md
  - .ai-workspace/tickets/completed/T-057-realize-typescript-cli-binary-binding-over-shared-product-command-grammar.md
  - .ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md
  - .ai-workspace/tickets/completed/T-142-create-versioned-release-snapshot-bundle-for-package-first-abg.md
source_documents:
  - specification/GOALS.md
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-QUAL.md
  - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/code/src/app/m04/toolchain_binding/
  - build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/
  - specification_methodology/specification/standards/SPEC_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
affected_boundary:
  goals:
    - specification/GOALS.md
  product:
    - specification/PRODUCT.md
  requirements:
    - specification/requirements/product/REQ-P-INSTALL.md
    - specification/requirements/product/REQ-P-POLICY.md
    - specification/requirements/product/REQ-P-QUAL.md
  design:
    - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M04_SHARED_PRODUCT_TOOLCHAIN_DESIGN_MODULE_REVIEW.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/app/m04/toolchain_binding/
    - build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/
    - build_tenants/abiogenesis/typescript/code/src/cli/
    - build_tenants/abiogenesis/typescript/package.json
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t163_shared_product_toolchain_resolution.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t161_shared_toolchain_install.test.mjs
migration_strategy: >-
  Inside-out replacement. First ratify the single product-toolchain model in
  goals, product, requirements, and design. Then introduce the canonical
  product store, manifest, resolver, workspace binding, and mutable-state-root
  carriers. Then migrate installer, CLI, runtime binding, provenance, tests,
  and release proof to the new carriers. Only after producers and consumers use
  the new carriers may legacy local-copy, alias, shim, and implicit-default
  paths be removed. Closure requires negative regression tests proving the old
  paths are gone or fail closed.
library_usage: none
library_rationale: >-
  This is product-owned ABG install and runtime resolution law. It extends the
  existing TypeScript tenant installer/resolver code and does not introduce an
  external library as governing authority.
intake_source: >-
  Operator wants one Java-like product install folder that can hold many ABG
  and ODD product versions, selected by an environment variable or workspace
  binding, without needing a local abiogenesis/odd_sdlc install in every
  project. Operator explicitly rejects technical debt, backwards compatibility
  interfaces, and shim layers because the only user is the developer.
target_truth: >-
  ABG publishes one canonical shared product toolchain model. A toolchain root
  stores immutable product payloads under
  `products/<product_id>/<product_version>/`. Each product payload owns its
  product manifest, package/lib root, command/bin root, docs/standards refs,
  release identity, and dependency requirements. A workspace binding records
  selected products and versions, the observed workspace root, observer state
  root, executor state root, event log path, runtime root, projection root, and
  archive root. Runtime commands resolve through this binding or through the
  canonical `ABG_TOOLCHAIN_ROOT` selection path. The selected product command
  path belongs to the selected product version; there is no separate
  compatibility shim or legacy alias surface.
superseded_truth: >-
  T-161 allowed the shared toolchain as a first-slice compatibility mode while
  retaining local target-root package installation, default target-root
  fallback, legacy environment aliases, and "compatibility local install" as
  closure-tolerated surfaces. T-163 supersedes that tolerance. Those paths are
  migration debt and must be removed or made fail-closed by this ticket.
closure_law: >-
  Close only when goals/product/requirements/design/code/tests all agree that
  the shared product toolchain is the single authoritative install and runtime
  resolution model. Closure requires: one canonical environment selector;
  versioned product payloads under one toolchain root; workspace bindings that
  pin product versions and mutable roots; ABG commands running from selected
  product-version command paths; no target-local full package/library copy
  requirement; no top-level command shim; no legacy environment alias; no
  implicit target-root default; no accepted backwards-compatibility interface;
  and negative regression tests proving old paths are rejected. No technical
  debt, TODO closure, or deferred compatibility paydown may remain.
evaluation_criteria:
  - The ticket opens or updates the active goal wave before implementation
    claims closure.
  - Product law states the single install model in present tense and removes
    compatibility wording that makes target-local package copies closure-valid.
  - Requirements state the canonical product store, product manifest,
    workspace binding, version selection, mutable state roots, and failure
    modes as admitted product/install law.
  - Design identifies every exported carrier as prime, subordinate, or
    deferred and passes Design Module Method review.
  - The resolver has one closed precedence model and no hidden path-order or
    ambient cwd fallback.
  - Runtime and installer code consume the same resolver and binding carriers.
  - Spec method regression law is applied: any old interface touched by this
    migration is either deleted or covered by a negative regression proving it
    cannot be used as a compatibility path.
  - The proof lane demonstrates multiple versions and multiple workspaces
    without local full product library installs.
non_closure_conditions:
  - `ABIOGENESIS_HOME`, `ODD_SDLC_HOME`, or any other legacy alias remains a
    runtime selection path for ABG product resolution.
  - A top-level `toolchainRoot/bin` command shim dispatches to versions by
    ambient state instead of the selected product-version command path being
    explicit.
  - The installer silently falls back to using the target workspace as the
    product payload root when no toolchain root or binding exists.
  - A target workspace must install or retain a full
    `node_modules/@abiogenesis/typescript-tenant` package copy to execute ABG
    public commands.
  - Product docs/standards/library payloads are copied into every target
    workspace as a required runtime dependency instead of resolved through the
    selected product manifest.
  - The shared product root receives mutable events, runtime state,
    projections, or archives for a target workspace run.
  - Observer and executor mutable state roots cannot be separated.
  - Workspace binding omits selected product version, command path, product
    manifest ref, or mutable-state-root refs.
  - Version selection is implicit PATH order, cwd probing, package-manager
    lookup, or hidden source-checkout discovery.
  - Backwards compatibility is used as a reason to preserve a superseded
    interface, alias, or local-copy path.
  - A TODO, compatibility paydown note, or deferred migration debt is accepted
    as closure evidence.
  - Downstream support is implemented with product-specific odd_sdlc special
    cases instead of a generic product manifest/resolver contract.
  - Proof depends on the mutable abiogenesis source checkout as the installed
    product payload.
proof_surface:
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t163_shared_product_toolchain_resolution.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t161_shared_toolchain_install.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t152*.test.mjs
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:semantic
  - cd build_tenants/abiogenesis/typescript && npm run lint:test-harness
  - cd build_tenants/abiogenesis/typescript && npm run test:t163
  - cd build_tenants/abiogenesis/typescript && npm run test:t161
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
---

# T-163: Make Shared Product Toolchain The Only Install And Resolution Model

## STDO Triage

### First Missing Layer

Product definition.

T-161 established the first slice: shared toolchain root, workspace binding,
and mutable-state-root separation. It intentionally retained compatibility
language around local per-workspace package installation and default
target-root behavior.

That is now the wrong product truth. The operator is the only user and does not
need backwards compatibility. The product must use one install model:

```text
selected product toolchain root
  -> immutable versioned product payloads
  -> product manifests and command paths
  -> workspace binding
  -> explicit mutable state roots
  -> runtime/provenance truth
```

No local-copy fallback, command shim, legacy alias, or compatibility interface
is closure-valid.

### Lawful Re-Entry

`product_reprice`.

The product meaning of "install" changes from "target workspace may contain a
full local product payload or may bind to a shared payload" to "target
workspace binds to selected immutable product payloads." Requirements, design,
installer code, CLI code, runtime provenance, tests, docs, and release proof
must descend from that product truth.

### STDO Ordering

1. Goals: open a work-wave entry for the single shared product toolchain model.
2. Product: ratify the single install model and remove compatibility wording.
3. Requirements: make product store, manifest, binding, resolver, mutable
   roots, and failure modes constitutional.
4. Design: define the prime carriers, resolver algebra, layout, and migration.
5. Tests: add negative regression tests for old paths before or with code
   removal.
6. Code: migrate installer, CLI, runtime binding, provenance, package exports,
   and proof harness.
7. Operate: prove clean sandbox installs, multi-version selection, multi
   workspace binding, and absence of local package-copy dependencies.

## Domain Model

### Toolchain Root

One selected root stores immutable product payloads:

```text
<toolchain_root>/
  products/
    abiogenesis/
      <version>/
        product-toolchain-manifest.json
        bin/
        lib/
        docs/
        standards/
        release-manifest.json
    odd_sdlc/
      <version>/
        product-toolchain-manifest.json
        bin/
        lib/
        plugins/
```

The root is a product store. It is not a runtime state root.

### Product Manifest

Each product version publishes one manifest:

```json
{
  "kind": "abg_product_toolchain_manifest",
  "productId": "abiogenesis",
  "packageName": "@abiogenesis/typescript-tenant",
  "packageVersion": "4.1.0-rc.12",
  "productRoot": "<toolchain_root>/products/abiogenesis/4.1.0-rc.12",
  "packageRoot": "<productRoot>/lib/node_modules/@abiogenesis/typescript-tenant",
  "binRoot": "<productRoot>/bin",
  "commandPaths": ["<productRoot>/bin/genesis-ts"],
  "docsRoot": "<productRoot>/docs",
  "standardsRoot": "<productRoot>/docs/standards",
  "requires": []
}
```

For downstream products, the same shape applies:

```json
{
  "kind": "abg_product_toolchain_manifest",
  "productId": "odd_sdlc",
  "packageVersion": "3.0.17",
  "requires": [
    { "productId": "abiogenesis", "version": "4.1.0-rc.12" }
  ]
}
```

No downstream-specific resolver path is allowed.

### Workspace Binding

Each observed workspace records selected product versions and mutable roots:

```json
{
  "kind": "abg_toolchain_workspace_binding",
  "schemaVersion": "2",
  "targetRoot": "<observed_workspace>",
  "toolchainRoot": "<toolchain_root>",
  "products": [
    {
      "productId": "abiogenesis",
      "packageVersion": "4.1.0-rc.12",
      "manifestPath": "<toolchain_root>/products/abiogenesis/4.1.0-rc.12/product-toolchain-manifest.json",
      "binRoot": "<toolchain_root>/products/abiogenesis/4.1.0-rc.12/bin",
      "packageRoot": "<toolchain_root>/products/abiogenesis/4.1.0-rc.12/lib/node_modules/@abiogenesis/typescript-tenant",
      "manifestDigest": "sha256..."
    }
  ],
  "mutableStateRoots": {
    "observedWorkspaceRoot": "<observed_workspace>",
    "observerStateRoot": "<observer_state_root>",
    "executorStateRoot": "<executor_state_root>",
    "eventRoot": "<observer_state_root>/events",
    "eventLogPath": "<observer_state_root>/events/events.jsonl",
    "runtimeRoot": "<observer_state_root>/runtime",
    "projectionRoot": "<observer_state_root>/projections",
    "archiveRoot": "<observer_state_root>/archives"
  }
}
```

The binding is provenance and resolution truth. It is not a compatibility shim.

### Canonical Selection

Closed precedence:

```text
explicit command product selection
  > workspace binding
  > ABG_TOOLCHAIN_ROOT plus explicit product/version request
  > fail closed
```

No `ABIOGENESIS_HOME` alias. No `ODD_SDLC_HOME` alias. No implicit
target-root product payload. No PATH-order version inference. No source
checkout discovery.

### Commands

The command path belongs to the selected product version:

```text
<toolchain_root>/products/abiogenesis/<version>/bin/genesis-ts
```

There is no required top-level shim such as:

```text
<toolchain_root>/bin/genesis-ts
```

If a developer wants a command on PATH, the selected product-version `bin/`
directory is placed on PATH directly.

## Required Work

1. Goal and product reprice
   - Add a GOALS entry for the single shared product toolchain migration.
   - Update PRODUCT.md so shared product toolchain is the only install model.
   - Remove product wording that treats target-local package copies,
     compatibility local installs, legacy aliases, or shims as closure-valid.

2. Requirement reprice
   - Update `REQ-P-INSTALL` with schema v2 workspace binding law.
   - Ratify canonical `ABG_TOOLCHAIN_ROOT` as the only environment selector.
   - Remove `ABIOGENESIS_HOME` and `ODD_SDLC_HOME` as lawful selectors.
   - Require fail-closed behavior when no explicit toolchain root or workspace
     binding exists.
   - Require product manifests for each installed product version.
   - Require product dependency declarations for downstream products.
   - Require mutable-state-root separation and provenance admission.
   - Require negative regression law for every deleted legacy path.

3. Design module
   - Add `M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION.md`.
   - Add `M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS.md`.
   - Classify prime carriers: `ToolchainRoot`, `ProductToolchainManifest`,
     `ProductVersionSelection`, `WorkspaceToolchainBinding`,
     `ToolchainMutableStateRoots`, `ResolvedProductCommand`, and
     `ToolchainResolutionFailure`.
   - Classify subordinate/read-model carriers explicitly.
   - Define resolver algebra and failure taxonomy.
   - State that no shim, alias, or compatibility local-copy carrier is prime,
     subordinate, or retained.
   - Run Design Module Method review with execution-authority audit.

4. TypeScript realization
   - Migrate `toolchain_binding` carriers to schema v2.
   - Remove legacy env constants and resolver branches.
   - Remove installer default that uses target root as product root.
   - Make installer fail closed without explicit toolchain root or valid
     workspace binding.
   - Make package materialization always write to
     `products/<productId>/<version>/`.
   - Make target install write only binding/provenance/config surfaces needed
     to resolve the selected product.
   - Make CLI `start`, `gaps`, and `assess-result` consume the same workspace
     binding and mutable-state-root resolution.
   - Record selected product version, product manifest digest, command path,
     and mutable roots in runtime/provenance output.
   - Export only the canonical resolver and admission APIs.

5. Spec method regression law
   - For every old public or semi-public path removed, add a negative
     regression proving it no longer works.
   - Negative regressions must cover:
     `ABIOGENESIS_HOME`, `ODD_SDLC_HOME`, target-root default install,
     target-local `node_modules/@abiogenesis/typescript-tenant` requirement,
     top-level shim dispatch, source-checkout discovery, and PATH-order
     selection.
   - A deleted path with no negative regression is non-closing.

6. Proof
   - Install two ABIogenesis versions under one toolchain root.
   - Bind two clean observed workspaces to the same selected version.
   - Bind one workspace to the older version and one to the newer version.
   - Run public ABG commands from selected product-version command paths.
   - Prove event/projection/archive writes go only to configured mutable roots.
   - Prove observer state and executor state can be separate.
   - Prove target workspaces do not contain copied full ABG libraries.
   - Prove synthetic downstream product manifests can declare dependency on an
     installed ABG version without product-specific resolver code.
   - Prove full semantic regression.

## Acceptance Criteria

- [x] GOALS opens the shared product toolchain migration wave.
- [x] PRODUCT.md states one install model and removes compatibility local-copy
      install as product-valid closure.
- [x] Requirements define canonical product store, product manifest, workspace
      binding, version selection, mutable roots, and fail-closed conditions.
- [x] Requirements remove legacy environment aliases and implicit target-root
      fallback as lawful selection paths.
- [x] Design derives the full model through IACS and Design Module Method
      review.
- [x] The resolver has exactly one closed selection algebra.
- [x] `ABG_TOOLCHAIN_ROOT` is the only environment selector.
- [x] Workspace binding schema records selected product versions and mutable
      state roots.
- [x] Product payloads install only under
      `<toolchain_root>/products/<product_id>/<product_version>/`.
- [x] Product-version `bin/` command paths are used directly; no top-level
      shim dispatch is required or generated.
- [x] Target workspaces do not require copied full ABG libraries.
- [x] CLI start/gaps/assess-result use the same binding and state-root
      resolution.
- [x] Runtime/provenance output records selected product, version, manifest,
      command path, and mutable roots.
- [x] Negative regressions prove legacy aliases, local-copy paths, source
      checkout discovery, and PATH-order selection fail closed.
- [x] Tests prove multiple product versions under one root.
- [x] Tests prove multiple workspaces bound to the same product version.
- [x] Tests prove separate observer and executor state roots.
- [x] Tests prove synthetic downstream product manifest dependency without
      product-specific resolver code.
- [x] `build:semantic`, `lint:semantic`, `lint:test-harness`, focused T-163
      tests, T-161 regression tests, and full `test:semantic` pass.
- [x] `git diff --check` passes.

## Closure Evidence

Completed on 2026-06-27.

Implementation surfaces:

- `specification/GOALS.md` adds `GOAL-010`.
- `specification/PRODUCT.md` and `REQ-P-INSTALL` make shared product toolchain
  the only install-resolution model.
- `M04_SHARED_PRODUCT_TOOLCHAIN_DERIVATION`,
  `M04_SHARED_PRODUCT_TOOLCHAIN_FIRST_SLICE_IACS`, and
  `M04_SHARED_PRODUCT_TOOLCHAIN_DESIGN_MODULE_REVIEW` define and review the
  design.
- TypeScript toolchain binding schema is `2`; selection source is closed to
  `explicit`, `workspace_binding`, and `environment`.
- Installer payloads always materialize under
  `<toolchainRoot>/products/abiogenesis/<packageVersion>/`.
- Product manifests record `requires`; ABG emits `requires: []`.
- CLI `start`, `gaps`, and `assess-result` require admitted workspace binding
  truth for replay/append roots.
- Installed bootstrap and runtime test bindings import from selected product
  package roots rather than target-local package shims.

Proof:

- `npm run test:t163` passed.
- `npm run lint:semantic` passed.
- `npm run lint:test-harness` passed.
- `npm run test:semantic` passed: 913 tests, 913 passing.
- `git diff --check` passed.

## Non-Goals

- Do not implement odd_sdlc-specific install behavior in ABG.
- Do not create odd_glc.
- Do not create a compatibility wrapper for old command names.
- Do not preserve local per-workspace library installs for user convenience.
- Do not add migration prompts, deprecation windows, or legacy aliases.
- Do not move mutable runtime state into the shared product root.
