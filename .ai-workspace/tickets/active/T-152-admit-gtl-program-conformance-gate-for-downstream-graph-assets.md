---
id: T-152
title: Admit GTL program conformance gate for downstream graph assets
type: feature
ticket_category: ordinary
status: active
proof_status: pending
goal: provide one ABG-owned static GTL program admission/typecheck function that downstream products can call before ABG runtime execution to prove graph functions, graph vectors, target-carrier rows, closure rows, prompt assets, plugin contracts, public starts, overlays, and active ABG identity surfaces are lawful
change_class: requirement_reprice
change_intent: Make GTL program conformance a deterministic ABG API function with a thin CLI wrapper instead of downstream-local lint rules, MCP-shaped prompt schema, or agent-memory checks.
re_entry_point: requirements
created_at: 2026-06-08
updated_at: 2026-06-08
owning_repo: abiogenesis
governance_scope: STDO Method
priority: high
build_tenant: typescript
source_documents:
  - /Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPH.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - .ai-workspace/tickets/completed/T-150-promote-prompt-assets-into-gtl-typed-asset-interface.md
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-194-migrate-typescript-tenant-to-abg-4-0-0-rc-1.md
related_tickets:
  - T-150
  - T-151
  - /Users/jim/src/apps/odd_sdlc/.ai-workspace/tickets/active/T-194-migrate-typescript-tenant-to-abg-4-0-0-rc-1.md
affected_boundary:
  requirements:
    - specification/requirements/gtl/REQ-L-GTL3-LAWS.md
    - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
    - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
    - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
    - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  design:
    - build_tenants/abiogenesis/typescript/design/README.md
  realization:
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/gtl_program_conformance.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/index.ts
    - build_tenants/abiogenesis/typescript/code/src/cli/command.ts
    - build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/compute_notation.ts
    - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
    - build_tenants/abiogenesis/typescript/code/src/shared/engine_authority_fields.ts
  proof:
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t150_gtl_program_conformance_tool.test.mjs
    - build_tenants/abiogenesis/typescript/test_env/tests/test_t152_contract_fulfillment_binding_api.test.mjs
target_truth: Downstream GTL/ABG programs are admitted through one ABG-owned programmatic API, `typecheckGtlProgram(...)`, with `admitGtlProgramConformanceInput(...)` as its raw-input gate and `abiogenesis-ts typecheck-gtl-program` as a thin CLI wrapper. The function evaluates the supplied GTL program inventory against GTL graph interface law, graph-vector identity law, target-carrier row law, closure row law, prompt AssetSurface view law where the downstream row declares a prompt invocation asset, plugin boundary law, public-start/overlay law, active source identity law, and expected coverage. Report identity is evidence-bound to the normalized audited inventory.
superseded_truth: Downstream products can prove GTL/ABG graph conformance by local scans, prompt prose, method-in-context, or partial inventories that pass when omitted.
closure_law: This ticket closes only when the TypeScript source is tracked, exported, buildable, callable programmatically, callable through the CLI wrapper, and tested against empty/partial inventories, malformed raw input, unsatisfied graph dependencies, duplicate target/closure rows, duplicate display labels with distinct opaque vector identity, current ABG engine-authority flag bypasses, prompt asset row completeness, plugin admission, exact ABI package version, stale active ABG identity, evidence-bound report identity, and the odd_sdlc T-194 graph-asset inventory gate.
non_closure_conditions:
  - the function is only present in build output, a temporary package, or an untracked source file
  - the CLI owns rules that the programmatic function does not own
  - downstream products maintain local GTL conformance rules instead of calling the ABG function
  - empty, partial, or caller-selected coverage can pass
  - graph vectors are keyed by display name rather than graphFunctionId, graphId, and graphVectorId
  - duplicate target-carrier or closure rows for one graph-vector identity can pass
  - raw malformed JSON can throw uncaught instead of producing deterministic issue rows
  - engine-authority fields are hand-copied across guards or silently stripped
  - prompt asset row completeness is claimed as GTL AssetSurface constitutional law without an explicit requirement home or scoped row policy
  - proof depends on a local `/tmp` package instead of the source under review or a recut release snapshot
  - odd_sdlc T-194 passes by excluding current TypeScript graph assets, prompt construction assets, plugin contracts, or active source identity surfaces
review_gate: high-bar code review and downstream T-194 proof required before release
---

# T-152: Admit GTL Program Conformance Gate For Downstream Graph Assets

## Intake Triage

Smallest lawful re-entry point: `requirement_reprice`.

Reason: T-150 promoted prompt `AssetSurface` into a GTL typed asset interface.
odd_sdlc T-194 then exposed a broader single-control-point requirement: a
downstream ODD product needs a deterministic ABG function that checks its GTL
program inventory before ABG runtime execution.

This is a hard admission/typecheck boundary for current GTL/ABG program shape.

## Scope

- Provide `admitGtlProgramConformanceInput(raw)` for raw JSON/API input.
- Provide `typecheckGtlProgram(raw)` as the programmatic gate.
- Provide `formatGtlProgramConformanceIssues(issues)` for human-readable output.
- Provide `abiogenesis-ts typecheck-gtl-program --input <json>` as a thin CLI
  wrapper over the programmatic function.
- Single-source engine-authority field vocabulary for GTL binding rows, ABG
  plugin contracts, provider outputs, and hook findings.
- Use odd_sdlc T-194 as the downstream proving domain.

## Audit Checklist

- [ ] Source file is tracked and exported from the TypeScript tenant package.
- [ ] CLI wrapper delegates to `typecheckGtlProgram(...)`; it does not own
  separate conformance rules.
- [ ] Raw malformed input returns deterministic issue rows.
- [ ] Expected coverage requires every coverage key and nonzero counts.
- [ ] Empty or partial inventories fail closed.
- [ ] Graph function interfaces match environment requires/provides.
- [ ] Graph traversal derives every graph output from graph inputs and prior
  vector outputs.
- [ ] Vector source and target nodes are declared in the graph.
- [ ] Target-carrier rows are keyed by graphFunctionId, graphId, and
  graphVectorId.
- [ ] Edge-closure rows are keyed by graphFunctionId, graphId, and graphVectorId.
- [ ] Exactly one target-carrier row exists for every graph-vector identity.
- [ ] Exactly one edge-closure row exists for every graph-vector identity.
- [ ] Duplicate display labels with distinct opaque identities are lawful.
- [ ] Prompt invocation asset rows are admitted AssetSurface rows with row-local
  rendered-view, constructor, output-contract, authority-slot, proof, node, and
  evidence bindings.
- [ ] Plugin contracts are admitted through ABG plugin admission.
- [ ] Current engine-authority flags such as `mayWriteLedgers` and
  `maySelectTraversal` are rejected.
- [ ] Unknown GTL fulfillment-binding fields fail instead of being stripped.
- [ ] Active source identity rows reject stale ABG 3.x and pre-RC1 labels.
- [ ] Report identity includes normalized inventory digests.
- [ ] odd_sdlc T-194 consumes this ABG function and no SDLC-local replacement.
- [ ] A clean odd_sdlc live hello-world run passes after the graph inventory gate.

## Non-Closure Carried Open

The first closure target is a static program gate for the current GTL/ABG
published program inventory. Full algebra-trace checking for every GTL algebra
operation (`compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, and
`promote`) may require a later normalized algebra AST carrier if the current
published carriers cannot reconstruct the trace without adding caller-owned
truth. This ticket must not claim more than it proves.
