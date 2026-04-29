# T-080 Review: TypeScript Installer Against Python Baseline

## Verdict

The TypeScript installer is no longer missing the main Python installer
capabilities by accident. The remaining differences are mostly deliberate
product-shape changes:

- Python installs a copied `.genesis/` runtime.
- TypeScript installs a package-backed `.abiogenesis/` substrate.
- Python seeds starter project scaffolding by default.
- TypeScript clean targets use explicit `no_scaffold` substrate-only behavior.
- Python appends a GTL bootloader into root instruction files.
- TypeScript keeps ABG substrate instructions domain-neutral and lets
  downstream product installers own root `AGENTS.md` / `CLAUDE.md` sections.

The real remaining gap is not another installer file. It is whether downstream
products need a stable public ABG sandbox/archive API instead of product-local
archive logic. That remains owned by `T-077`.

## Feature Classification

### 1. Substrate Root Topology

Classification: replaced by TypeScript-specific product mechanism.

Python installs under `.genesis/`. TypeScript installs under `.abiogenesis/`.
This is the correct product line for the package-first TypeScript installer.
Downstream products may install under `.abiogenesis/<product>/<build_tenant>/`
but must not redefine the ABG substrate root.

Status: implemented.

Evidence:

- `REQ-P-INSTALL-003`
- `M04_TYPESCRIPT_INSTALLER_DERIVATION.md`
- `test_m04_typescript_installer_integration.test.mjs`

### 2. Package And Runtime Materialization

Classification: replaced by TypeScript-specific product mechanism.

Python copies engine and GTL modules into `.genesis/`. TypeScript packs the
tenant package, extracts it under target `node_modules`, binds package
commands, and records package identity.

Status: implemented.

### 3. GTL / ABG Runtime Binding

Classification: adopted through TypeScript mechanism.

Python seeds `.genesis/genesis.yml`. TypeScript writes
`.abiogenesis/cli-runtime.mjs` as a domain-neutral installed runtime binding
and records it in installer manifest, provenance, and topology verification.

Status: implemented by `T-081`.

### 4. Install Manifests

Classification: adopted and strengthened.

Python returns install payload and writes bootstrap config. TypeScript writes:

- `.abiogenesis/install-manifest.json`
- `.abiogenesis/typescript-installer-manifest.json`
- `.abiogenesis/install-provenance.json`

Status: implemented.

### 5. Full Standards Tree And Templates

Classification: adopted into TypeScript product law.

TypeScript installs the full standards tree under
`.abiogenesis/docs/standards/` and records file evidence.

Status: implemented by `T-079`.

### 6. Installed Docs And Bootloader Docs

Classification: partially adopted, partially rejected as Python-specific.

Adopted:

- domain-neutral ABG docs under `.abiogenesis/docs/`
- compressed LLM guide and human guide docs required for cold-agent operation

Rejected as mandatory for TypeScript:

- copying the Python-era `GTL_BOOTLOADER.md` as a root installer requirement

Reason: TypeScript direct CLI readiness is proven by package exports,
`.abiogenesis/cli-runtime.mjs`, manifest truth, and topology verification.
Downstream product bootstraps own product HOW in their own instruction
sections.

Status: implemented for current TypeScript installer.

### 7. Marker-Governed Root Instruction Files

Classification: downstream-owned, not ABG substrate-owned.

Python appends bootloader content to `AGENTS.md` and `CLAUDE.md`. TypeScript
ABG does not make root instruction sections an ABG substrate requirement.
That is deliberate under `REQ-P-INSTALL-031`: substrate bootstrap instructions
stay domain-neutral, while product-specific instruction sections belong to
downstream installers.

Status: ABG publishes docs/manifests; downstream `odd_sdlc` writes root
instruction sections under its installer contract.

### 8. `.ai-workspace` Skeleton

Classification: adopted.

Python creates events, runtime, context, comments, agents, reviews, and feature
directories. TypeScript creates event and runtime roots required by installed
ABG execution and records them in topology/provenance surfaces.

Status: implemented for ABG-owned roots. Product-specific work queues remain
downstream product-owned.

### 9. Clean-Target Scaffold Mode

Classification: rejected as default ABG substrate behavior; replaced by
`no_scaffold`.

Python seeds starter project authority surfaces. TypeScript ABG clean install
does not assert project authority. It records `targetMode:
"clean_no_project_authority"` and `cleanTargetPolicy: "no_scaffold"`.

Status: implemented.

### 10. Imported-Target Preservation Mode

Classification: adopted.

TypeScript detects imported targets and preserves project-owned roots while
adding ABG substrate-owned surfaces.

Status: implemented.

### 11. Install Event / Provenance

Classification: replaced by stronger TypeScript provenance mechanism.

Python emits a `genesis_installed` event. TypeScript persists
`.abiogenesis/install-provenance.json` with package, command, runtime,
standards, docs, event root, runtime root, and install result.

Status: implemented.

### 12. Public Verification / Doctor Behavior

Classification: replaced by public typed topology verification.

Python has `--verify`. TypeScript exposes
`verifyAbiogenesisTypescriptInstallTopology(...)` through
`@abiogenesis/typescript-tenant/app/m04/install-bootstrap`. The verification
surface is package-consumable, typed, and used by installer tests.

Status: implemented. A CLI `verify` alias is not required by current product
law.

### 13. Rerun / Idempotency Behavior

Classification: adopted.

TypeScript reruns over the same admitted package classify `installMode:
"refresh"` and update package dependency, manifests, provenance, command
bindings, package root, and topology coherently.

Status: implemented by `T-078`.

### 14. Sandbox Archive / Postmortem Proof

Classification: adopted for ABG installer qualification; deferred for
downstream public API.

Implemented:

- ABG installer test writes persistent archive/postmortem proof under
  `test_env/test_runs/typescript_installer/public_installer/`
- proof includes install manifest, installer manifest, package identity,
  command paths, runtime identity, runtime binding, standards/docs inventory,
  events, projection, and postmortem

Deferred:

- a reusable public downstream archive API

Owner: `T-077`.

### 15. Downstream Consumption Boundaries

Classification: adopted.

ABG owns installed substrate truth. Downstream products own domain graph
catalogs, policy overlays, product-specific bootstrap text, acceptance
interpretation, and product-owned archives unless or until they consume a
public ABG archive API.

Status: implemented in requirements/design; downstream proof exists in
`odd_sdlc` T-064/T-065.

## Remaining Work

Required before claiming a reusable downstream archive substrate:

- `T-077`: decide and, if still required, export a public TypeScript M05
  sandbox/archive API.

Not required for current ABG TypeScript installer RC:

- Python-style root project scaffolding by default.
- Python `.genesis` layout.
- Python `GTL_BOOTLOADER.md` as mandatory TypeScript install artifact.
- CLI `--verify` spelling when the typed topology verifier is public and
  documented as the verification surface.

## Closure Assessment

`T-080` can close as a review ticket. It produced the required feature map,
classified each Python capability, identified the one remaining reusable API
question under `T-077`, and confirmed that the rest are implemented,
deliberately replaced, or rejected as Python-specific precedent.
