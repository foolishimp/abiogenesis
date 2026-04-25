# T-057 Realize TypeScript CLI Binary Binding Over Shared Product Command Grammar

- id: T-057
- title: Realize TypeScript CLI binary binding over shared product command grammar
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: provide a TypeScript package or installed app binary that accepts the same public GTL/ABG operator command suffix as the Python CLI, with only the executable prefix differing by tenant
- change_class: realization_refactor
- re_entry_point: typescript_m04_cli_binding_realization
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - REQ-P-POLICY-017 active
  - B-030-TS completed
  - T-017 completed
  - T-018 completed
  - T-019 completed
  - T-025 completed
- intake_source: operator clarification that Python and TypeScript command lines should differ only by executable/binary invocation
- affected_boundary: `build_tenants/abiogenesis/typescript/package.json`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`, `docs/`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/app/m04/**`
- target_truth: TypeScript exposes a CLI or installed app binary where `start`, `gaps`, `assess-result`, target grammar, control-mode flags, public output, and stop classification bind the same product command grammar as Python
- superseded_truth: TypeScript package APIs are treated as sufficient operator command-line parity without a binary binding
- closure_law: close only when the TypeScript binary or installed wrapper changes only the executable prefix and proves the same command suffix semantics through installed-package tests
- evaluation_criteria:
  - package or installed app exposes a binary binding through package metadata or install bootstrap
  - `start --workspace . --scope workspace --target next --until first_traversal` routes to the completed public callable/control path
  - `start --target graph_function:<handle>` and `start --target asset:<handle>` preserve the same target grammar and fail-closed behavior
  - `--fh-mode` and `--root-mode` remain lawful only with `--until converged`
  - `gaps` and `assess-result` use the shared public command grammar or explicitly fail closed if not supported in the current slice
  - output and exit-code classification match the shared product contract for supported commands
  - no TypeScript-only public flag grammar or rival command language is introduced
- non_closure_conditions:
  - TypeScript only exposes package APIs while claiming command-line parity
  - a TypeScript binary uses different target, `until`, `fh-mode`, or `root-mode` spellings
  - unsupported commands silently degrade instead of failing closed
  - tests prove source imports only and do not prove installed binary behavior

## Acceptance

- TypeScript CLI/binary installed-package tests pass
- relevant M04 package/API tests pass
- docs show the shared grammar with different executable prefixes only
- `git diff --check` passes

## Closure Evidence

Completed on 2026-04-25.

- Added package binary aliases `abiogenesis-ts` and `genesis-ts` over the shared TypeScript CLI adapter.
- Added a strict TypeScript CLI binding for `start`, `gaps`, and `assess-result`.
- Bound `start` to existing M04 public callable/control authority and lowered `next`, `graph_function:<handle>`, and `asset:<handle>` through published module/asset truth.
- Preserved fail-closed law for unsupported `gaps`, missing runtime binding, unlawful control modes, and ambiguous `next`.
- Added installed-package proof for binary metadata, graph-function target, next target, asset target, assess-result ingestion, and gaps fail-closed behavior.
- Updated the human and compressed LLM guides to name the TypeScript binary aliases while preserving the shared command suffix.
- Proof: `npm run test:t057`, `npm run test:b030`, `npm run test:t025`, `npm run test:t017`, `git diff --check`.
