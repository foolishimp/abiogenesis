---
id: T-161
title: Declare ABG-owned shared toolchain install contract and version selector
type: feature
ticket_category: shared_toolchain_install
status: active
goal: >-
  Stop requiring every downstream workspace to install full abiogenesis and
  odd_sdlc package payloads. Solve shared toolchain installation once inside
  abiogenesis by declaring a Java-like install contract, resolver, manifest
  schema, and target-workspace binding pattern that downstream consumers reuse.
  Binaries, libraries, docs, and versioned product payloads live under a
  selected install root, while each target workspace carries only configured
  mutable state roots, project-local config, and admitted binding/provenance
  truth.
change_intent: >-
  Reprice the installed substrate contract so abiogenesis owns the generic
  shared-toolchain install and resolution pattern. A released ABG product and
  any downstream ODD consumer product can be installed into a versioned
  toolchain root, selected by environment variable or explicit command binding,
  and reused across many target workspaces through the same ABG-defined
  resolver, manifest shape, target binding file, and provenance law. The target
  workspace remains the observed worksite by default; runtime/event/projection
  mutable state roots are explicit bindings and may be separate for observer,
  executor, and observed workspace roles. The shared install root is the
  immutable product/toolchain payload. This must preserve release identity,
  provenance, cold-agent inspectability, command bindings, mutable-state
  separation, and clean downstream proofs without copying package libraries
  into every project or forcing each downstream consumer to invent its own
  installer.
change_class: product_reprice
re_entry_point: product
owner: abiogenesis
priority: high
triaged_at: 2026-06-26
created_at: 2026-06-26
updated_at: 2026-06-26
governance_scope: Product, Install, Release, GTL, ABG
build_tenant: typescript
intake_source: >-
  Operator wants a Java-style installed toolchain: one install folder for
  abiogenesis/odd_sdlc binaries and libraries, with an environment variable
  selecting the version, instead of installing full ABG/ODD payloads into every
  downstream project. The solution must be solved once within abiogenesis, and
  downstream consumers such as odd_sdlc must use the same exported pattern.
source_documents:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-QUAL.md
  - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md
related_tickets:
  - .ai-workspace/tickets/completed/T-057-realize-typescript-cli-binary-binding-over-shared-product-command-grammar.md
  - .ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md
  - .ai-workspace/tickets/completed/T-078-make-typescript-installer-repeat-install-idempotent-over-existing-package-state.md
  - .ai-workspace/tickets/completed/T-079-realize-typescript-installer-standards-reference-copy-and-product-contract-proof.md
  - .ai-workspace/tickets/completed/T-080-review-typescript-installer-against-python-installer-capability-baseline-under-install-product-law.md
  - .ai-workspace/tickets/completed/T-081-realize-typescript-installer-cli-runtime-binding-for-direct-abg-commands.md
  - .ai-workspace/tickets/completed/T-083-preserve-runtime-event-log-on-typescript-installer-refresh.md
  - .ai-workspace/tickets/completed/T-142-create-versioned-release-snapshot-bundle-for-package-first-abg.md
affected_boundary:
  product:
    - specification/PRODUCT.md
  requirements:
    - specification/requirements/product/REQ-P-INSTALL.md
    - specification/requirements/product/REQ-P-POLICY.md
    - specification/requirements/product/REQ-P-QUAL.md
  design:
    - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M04_TYPESCRIPT_INSTALLER_FIRST_SLICE_IACS.md
    - build_tenants/abiogenesis/typescript/design/M04_SHARED_TOOLCHAIN_INSTALL_DERIVATION.md
    - build_tenants/abiogenesis/typescript/design/M04_SHARED_TOOLCHAIN_INSTALL_FIRST_SLICE_IACS.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/cli/
    - build_tenants/abiogenesis/typescript/code/src/m04/
    - build_tenants/abiogenesis/typescript/code/src/install/
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t161_shared_toolchain_install.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/sandbox/
target_truth: >-
  Abiogenesis supports and exports one generic shared-toolchain install
  contract. A shared toolchain install stores immutable released product
  payloads under a versioned install root selected by environment variable or
  explicit command binding. A target workspace binding stores project-local
  config, local policy overlays, selected shared toolchain product versions,
  and explicit mutable state roots for observer/control state, executor state,
  and observed-workspace state. ABG command binaries and libraries run from the
  shared install root while resolving the current target workspace as the
  observed worksite unless explicitly configured otherwise. Downstream products
  such as odd_sdlc publish product manifests and command bindings conforming to
  the ABG toolchain contract; they do not copy full product payloads into every
  project and do not fork the resolver/install pattern.
superseded_truth: >-
  Every target workspace must install full abiogenesis or odd_sdlc package
  libraries under local project state before ABG/ODD commands can run, and
  `.abiogenesis/` is the only lawful home for binaries, libraries, installed
  docs, and runtime binding.
closure_law: >-
  Close only when product law, requirements, design, installer/CLI realization,
  and clean sandbox proofs distinguish shared immutable toolchain payload from
  target-workspace runtime state; prove version selection by environment
  variable and explicit command override; prove multiple target workspaces can
  run against one selected shared install; prove release/version/provenance
  coherence; prove no target workspace needs copied ABG/ODD libraries to
  execute public commands; prove observer and executor mutable state roots can
  be configured away from the observed workspace; and prove an odd_sdlc-shaped
  downstream consumer, followed by the real odd_sdlc source workspace, uses the
  same ABG-owned toolchain contract without bespoke installer or resolver
  semantics.
non_closure_conditions:
  - The solution only adds PATH shims without product/install law.
  - The shared install root becomes mutable runtime state for target workspaces.
  - Configured mutable state roots lose event/projection/archive ownership to the shared install root or ambient process state.
  - Version selection is implicit ambient path order with no admitted provenance.
  - The installer still requires full per-project package/library installation.
  - Executor runtime state is forced into the observed workspace `.ai-workspace`.
  - Observer/control state and executor state cannot be separated.
  - Mutable state roots are implicit path conventions rather than admitted binding truth.
  - The design breaks clean sandbox install proofs or cold-agent inspectability.
  - odd_sdlc support is hard-coded into ABG instead of expressed as downstream product/toolchain binding law.
  - A downstream consumer must implement a separate resolver, manifest shape, or target binding pattern.
  - odd_sdlc cannot be migrated to the selected ABG toolchain version through the shared resolver.
  - Only synthetic ABG tests pass while real odd_sdlc hello-world and data-mapper regressions remain unproven.
proof_commands:
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t161
  - cd build_tenants/abiogenesis/typescript && npm run test:t076
  - cd build_tenants/abiogenesis/typescript && npm run test:t079
  - cd build_tenants/abiogenesis/typescript && npm run test:t081
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
---

# T-161: Declare ABG-Owned Shared Toolchain Install Contract And Version Selector

## STDO Triage

### First Missing Layer

Product definition.

The current product law treats the installed substrate as living inside each
target workspace. That was useful for early clean sandbox proofs and cold-agent
inspectability, but it now over-couples product payload with project runtime
state.

The missing product split is:

- shared toolchain install: immutable released binaries, libraries, docs,
  standards, manifests, and version metadata;
- target workspace binding: project-local config, overlays, admitted pointer to
  selected toolchain versions, and explicit mutable state roots;
- mutable state-root roles: observed workspace/worksite, observer/control state,
  executor state, event/projection roots, and archives must be bindable rather
  than hard-coded to one `.ai-workspace` directory;
- downstream product consumption: product-specific payloads and commands
  conform to the ABG toolchain manifest/resolver contract instead of inventing
  their own installer or copying full libraries into every workspace.

### Lawful Re-Entry

`product_reprice`.

This changes the meaning of "installed substrate" and "target workspace
install." Requirements, design, CLI, installer, and downstream proof lanes must
descend from that product split. ABG owns the generic installation contract;
downstream products consume it.

## Problem

Today downstream projects behave as if they must install full abiogenesis and
odd_sdlc package payloads into every workspace. That creates repeated local
state, version drift, slow clean proofs, and unclear distinction between:

- the product/toolchain being used;
- the project workspace being operated on;
- the configured runtime event/projection/archive state for a run.
- the executor's private runtime state versus the observed workspace's mutable
  product assets.

The desired model is closer to Java:

```text
ABIOGENESIS_HOME=/opt/abiogenesis/3.0.x
ODD_SDLC_HOME=/opt/odd_sdlc/3.0.x
PATH=$ABIOGENESIS_HOME/bin:$ODD_SDLC_HOME/bin:$PATH
```

The exact environment variable names are product design choices, not settled by
this ticket. The governing requirement is that the selected version is explicit,
inspectable, and admitted into runtime/provenance truth.

The important structural point is that abiogenesis solves this once:

```text
ABG toolchain contract
  -> shared install root layout
  -> product manifest schema
  -> version resolver
  -> target workspace binding manifest
  -> runtime provenance admission
  -> downstream product consumption pattern
```

Downstream consumers such as odd_sdlc publish conforming manifests and binaries.
They do not define a separate install root law, resolver law, or per-workspace
library-copy pattern.

## Target Model

Shared install root:

```text
<toolchain_root>/
  products/
    abiogenesis/<version>/
      product-toolchain-manifest.json
      bin/
      lib/
      docs/
      standards/
      release-manifest.json
      install-manifest.json
    odd_sdlc/<version>/
      product-toolchain-manifest.json
      bin/
      lib/
      docs/
      release-manifest.json
      install-manifest.json
  indexes/
    products.json
    aliases.json
```

The same layout also supports an implementation-local physical layout if the
manifest resolves product payloads elsewhere. The public contract is the
manifest/resolver behavior, not a hard-coded directory walk.

Target workspace:

```text
<project>/
  .abiogenesis/
    toolchain-binding.json
    config/
```

Mutable state roots are explicit, not assumed:

```text
<observer_state_root>/
  .ai-workspace/
    events/
    runtime/
    archives/

<executor_state_root>/
  .ai-workspace/
    events/
    runtime/
    archives/

<observed_workspace_root>/
  product assets and optional project-local .ai-workspace if configured
```

Target binding records a product stack:

```json
{
  "toolchainRoot": "<toolchain_root>",
  "products": [
    { "product": "abiogenesis", "version": "3.0.x" },
    { "product": "odd_sdlc", "version": "3.0.x" }
  ],
  "stateRoots": {
    "observedWorkspaceRoot": "<project>",
    "observerStateRoot": "<observer_state_root>",
    "executorStateRoot": "<executor_state_root>",
    "eventRoot": "<observer_state_root>/.ai-workspace/events",
    "projectionRoot": "<observer_state_root>/.ai-workspace/runtime",
    "archiveRoot": "<observer_state_root>/.ai-workspace/archives"
  }
}
```

The default may still be `<project>/.ai-workspace` for simple local runs. That
default is a compatibility binding, not law that forces executor or observer
state into the observed workspace.

Each product version is resolved by the same ABG-owned resolver against one
toolchain contract:

```text
product selection = explicit CLI flag
                 > project binding
                 > environment variable
                 > configured default

target workspace = explicit --workspace
                > cwd
```

The target workspace never becomes the source of the shared product payload.
The shared install root never becomes the event/projection/archive owner for a
target workspace run. The observed workspace does not automatically become the
executor or observer state owner.

Product payload example:

```text
abiogenesis/<version>/
    bin/
    lib/
    docs/
    standards/
    release-manifest.json
    install-manifest.json

odd_sdlc/<version>/
    bin/
    lib/
    docs/
    release-manifest.json
    install-manifest.json
```

Those product payloads are examples of products conforming to the same
contract. odd_sdlc does not receive custom install semantics.

## Required Work

1. Product reprice
   - Split installed substrate law into shared toolchain payload and target
     workspace runtime binding.
   - State that abiogenesis owns the generic toolchain contract, resolver,
     manifest schema, version-selection semantics, and target binding pattern.
   - State that downstream consumers publish conforming product manifests and
     command bindings against that contract.
   - State that per-workspace installation of full binaries/libraries is not
     required for command execution.
   - State that `.ai-workspace` mutable roots are configurable binding truth,
     with separate observed workspace, observer/control, executor,
     event/projection, and archive roots.
   - Preserve cold-agent inspectability through local binding/provenance files
     and stable docs/standards resolution.

2. Requirements reprice
   - Add shared toolchain root/version-selection law to `REQ-P-INSTALL`.
   - Add product stack binding law so one workspace can bind abiogenesis/ABG
     and downstream products such as odd_sdlc through the same manifest.
   - Add manifest schema law for downstream product payloads without ABG
     hard-coding downstream semantics.
   - Add precedence law for explicit command override, project binding,
     environment variable, and configured default.
   - Add provenance law requiring the selected toolchain version, release
     identity, and source path to be admitted for each run.
   - Add mutable-state-root binding law for observer/control, executor,
     observed workspace, events, projections, and archives.
   - Preserve target workspace ownership of product assets and local overlays
     without forcing executor or observer runtime state into the observed
     workspace.

3. Design module
   - Define shared install root layout, target workspace binding layout,
     mutable-state-root layout, selection precedence, provenance rows, and
     failure taxonomy.
   - Define one reusable resolver API/CLI surface consumed by ABG and
     downstream products.
   - Derive how existing `.abiogenesis/cli-runtime.mjs` and install manifests
     become a lightweight binding to shared toolchain payload instead of a full
     local package installation.
   - State how downstream product toolchains such as odd_sdlc compose without
     ABG hard-coding product semantics.

4. TypeScript realization
   - Add shared toolchain install and verification commands or options.
   - Add exported resolver/admission helpers for downstream product bindings.
   - Add runtime resolution from explicit flag, project binding, environment
     variable, and default.
   - Keep `--workspace` as the target runtime scope.
   - Add explicit state-root resolution and admission for observer/control,
     executor, event, projection, and archive roots.
   - Record selected toolchain identity in runtime/provenance truth.
   - Record selected mutable state roots in runtime/provenance truth.

5. Proof
   - Build one shared ABG toolchain install.
   - Install an odd_sdlc-shaped downstream product into the same toolchain
     contract.
   - Migrate the real odd_sdlc source workspace to bind to the selected ABG
     toolchain version through the shared resolver.
   - Run public ABG commands from two clean target workspaces without local full
     package/library installation.
   - Run an odd_sdlc-shaped command from the same target workspaces through the
     same resolver/binding pattern.
   - Run real odd_sdlc public smoke lanes through the shared ABG binding,
     including JS hello world and Rust hello service.
   - Run the Data Mapper proof lane through the shared ABG binding before
     claiming closure.
   - Prove version selection changes when the environment variable changes.
   - Prove explicit command selection overrides the environment.
   - Prove event/projection/archive roots stay under the configured mutable
     state roots and not under the shared install root or ambient executor cwd.
   - Prove an executor can write its own state outside the observed workspace.
   - Prove observer/control state can be separated from executor state.
   - Prove compatibility default still uses `<workspace>/.ai-workspace` for a
     simple local run when no split state roots are configured.
   - Prove the odd_sdlc-shaped fixture uses product manifest/binding truth and
     not hard-coded ABG knowledge of odd_sdlc.

## Acceptance Criteria

- [ ] Product law distinguishes shared immutable toolchain payload from target
      workspace runtime/binding state.
- [ ] Product law states that abiogenesis owns the generic toolchain
      install/resolution contract and downstream consumers reuse it.
- [ ] Requirements define version selection by explicit command binding,
      project binding, environment variable, and configured default.
- [ ] Requirements define a product stack binding and manifest schema that can
      bind both abiogenesis and downstream products such as odd_sdlc.
- [ ] Requirements define mutable-state-root bindings for observed workspace,
      observer/control state, executor state, event roots, projection roots, and
      archive roots.
- [ ] The selected toolchain version, release identity, and install root are
      admitted into runtime/provenance truth for each run.
- [ ] The selected mutable state roots are admitted into runtime/provenance
      truth for each run.
- [ ] Target workspaces retain ownership of product assets and local
      policy/config overlays without being forced to own executor or observer
      runtime state.
- [ ] Executor state can be configured outside the observed workspace.
- [ ] Observer/control state can be configured separately from executor state.
- [ ] Public command binaries can run from the shared install root against clean
      target workspaces that do not contain copied ABG libraries.
- [ ] The model supports downstream product toolchains such as odd_sdlc without
      ABG hard-coding downstream semantics.
- [ ] The odd_sdlc-shaped proof consumes the exported ABG toolchain
      manifest/resolver/binding pattern, not a separate downstream installer.
- [ ] The real odd_sdlc source workspace binds to the selected ABG toolchain
      version through the same resolver.
- [ ] Exhaustive regression covers ABG installer/toolchain unit tests, ABG
      semantic tests, odd_sdlc JS hello world, odd_sdlc Rust hello service, and
      the Data Mapper proof lane through the shared ABG binding.
- [ ] Clean sandbox tests prove two separate target projects can use the same
      shared install root and selected version.
- [ ] Existing per-workspace install behavior either remains as a compatibility
      mode or is deliberately repriced with migration guidance.
- [ ] Focused `test:t161`, relevant installer regressions, full semantic suite,
      and diff checks pass.

## Non-Goals

- Do not move target workspace event/projection/archive truth into the shared
  install root.
- Do not force executor runtime state into the observed workspace.
- Do not force observer/control state and executor state into the same
  `.ai-workspace` tree.
- Do not make ambient `PATH` order the only source of selected version truth.
- Do not hard-code odd_sdlc semantics into abiogenesis.
- Do not remove clean sandbox proof requirements.
- Do not require every downstream project to carry full package libraries after
  this product law lands.

## Open Questions

1. What are the final environment variable names: `ABIOGENESIS_HOME`,
   `ABG_HOME`, `ODD_SDLC_HOME`, or a shared `ODD_TOOLCHAIN_HOME` selector?
2. Should target workspaces store only a binding manifest, or also a small local
   command shim for cold-agent convenience?
3. Should installed standards/docs stay copied into each workspace, move fully
   to shared toolchain, or be available through both with explicit precedence?
4. How should multiple installed downstream products compose when ABG and
   odd_sdlc versions are independently selected?

## Closure Note

Open. This ticket declares the work item for shared, versioned toolchain
installation. It does not implement the installer or CLI changes.
