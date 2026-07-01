---
id: T-182
title: Realize causal carry in ABG instruction rendering from admitted payload and evidence truth
type: realization
ticket_category: instruction_rendering_causal_carry
status: active
goal: >-
  Make ABG-rendered F_P dispatch prompts carry the prior-stage artifacts and
  evidence required by the selected edge's source/target node type and asset
  surface obligations, using existing admitted runtime truth rather than
  product-local prompt construction.
change_intent: >-
  The odd_glc framework-smoke software-build traversal proved real ABG startup,
  registry selection, graph-call opening, vector traversal, payload
  observation, evidence admission, and live F_P dispatch. The proof also
  exposed a prompt-causality gap: later vectors did not receive prior-stage
  artifact content even when their source node type semantically depended on
  it. This ticket closes the first shippable slice by resolving already
  admitted payload/evidence/artifact truth into the current instruction
  envelope before F_P dispatch. It does not introduce a new prompt carrier,
  semantic compiler, registry selection surface, or product-local shell.
change_class: realization_refactor
re_entry_point: abg_runtime_binding_and_prompt_rendering
owner: abiogenesis
priority: high
triaged_at: 2026-07-01
created_at: 2026-07-01
updated_at: 2026-07-01
activated_at: 2026-07-01
governance_scope: STDO Method, SPEC_METHOD, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Binding, Payload, Evidence, Node Types
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
  - .ai-workspace/tickets/completed/T-180-ratify-reusable-gtl-node-types-and-type-composition.md
related_tickets:
  - .ai-workspace/tickets/backlog/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md
source_documents:
  - .ai-workspace/comments/codex/20260701T083917Z_STRATEGY_gtl_abg_instruction_prompt_algebra.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
review_status: open
proof_status: partial
target_truth: >-
  ABG runtime binding resolves the selected edge's required causal inputs from
  admitted payload, evidence, materialized artifact, node type, and
  asset-surface truth before dispatch. When the current vector's source or
  target obligations require prior artifact content, the rendered instruction
  envelope includes that artifact by admitted ref, digest, role, path, and a
  declared excerpt/full-content policy. Later vectors in a staged traversal
  therefore causally depend on earlier ABG-observed outputs without odd_glc or
  any downstream product hand-building prompt context.
superseded_truth: >-
  Product-local prompt builders count or mention prior artifacts without
  resolving admitted payload/evidence refs, omit required prior-stage content,
  or rely on the worker to infer causal carry from stage names, file names,
  generic node labels, or scenario prose.
closure_law: >-
  Close only when the TypeScript ABG runtime can render or bind a current
  instruction envelope that includes required prior artifacts from admitted
  payload/evidence truth, proves the included content is caused by runtime
  refs rather than fixture prose, and fails or blocks when required causal
  evidence is absent. This ticket may close without implementing the full
  T-183 instruction assembly/semantic compiler surface, but it must not create
  a duplicate prompt carrier or product-local shell as a shortcut.
non_closure_conditions:
  - Prior-stage artifacts are read from filesystem paths, product-local arrays,
    fixture literals, or scenario names instead of admitted ABG payload/evidence
    refs and digests.
  - A later vector can dispatch while a source or target node/asset obligation
    requires prior artifact content that is absent from the bound instruction
    envelope.
  - The implementation introduces a broad `InstructionComposition`,
    `PromptPlan`, prompt ledger, product-local prompt shell, or new carrier
    that redeclares node type, asset surface, response contract, proof,
    authority, renderer, or compute-regime truth.
  - The worker prompt receives generic lifecycle node labels but not the
    effective current source/target type obligations and admitted prior
    artifact refs required for the edge.
  - The proof passes by asserting on a hand-built prompt fixture rather than
    on ABG runtime-emitted dispatch/rendering truth.
  - A mutation that removes required prior artifact evidence still allows the
    same edge proof to pass.
  - Product code controls final prompt rendering or injects hidden content
    outside ABG runtime binding.
required_work:
  - >-
    Phase 0 - Design check: Identify the existing ABG runtime binding,
    payload, evidence, materialization, and prompt/transport surfaces that
    already hold the data needed for causal carry. Record why no new prime
    carrier is needed for this slice under DESIGN_MODULE_METHOD.
  - >-
    Phase 1 - Dependency resolution: Implement or refine a deterministic
    resolver that derives current-edge causal input requirements from the
    selected graph function, selected graph vector, source/target `Node.typeRef`,
    source/target `AssetSurface`, and admitted payload/evidence projections.
  - >-
    Phase 2 - Instruction binding: Bind required prior artifacts into the
    current instruction envelope or prompt manifest by admitted ref, digest,
    role, path, and excerpt/full-content policy. The resolver shall preserve
    which values came from vector source obligations and which came from
    target asset-surface obligations.
  - >-
    Phase 3 - Fail-closed behavior: When a required causal artifact or evidence
    ref is missing, stale, malformed, or digest-mismatched, emit typed
    non-conformance, block, or gap truth before dispatch instead of sending a
    weakened prompt.
  - >-
    Phase 4 - Runtime proof: Update the framework-smoke or equivalent
    software-build traversal so vectors after the first receive the prior-stage
    artifact content they need. The proof must assert on ABG runtime-bound
    prompt/envelope/manifest truth, not product-local fixtures.
  - >-
    Phase 5 - Differential proof: Add a mutation or fixture variant that
    removes or corrupts a required prior artifact ref and proves the affected
    vector fails, blocks, or records a named gap before F_P dispatch or before
    closure.
  - >-
    Phase 6 - Boundary proof: Prove no new duplicate prompt carrier, local
    product prompt shell, local admission path, local closure path, or
    product-owned renderer authority was introduced.
  - >-
    Phase 7 - Proof lane wiring: Add focused package scripts `test:t182` and
    `test:t182:live` or ratified equivalent commands so the closure proof
    commands are executable release gates rather than aspirational names.
acceptance_criteria:
  - The runtime resolver derives required prior artifacts from selected edge
    type and asset obligations rather than scenario-specific file lists.
  - Bound prompt/envelope/manifests include admitted prior artifact refs,
    digests, roles, paths, and content excerpts/full content according to a
    deterministic policy.
  - A staged traversal's later vectors demonstrably depend on earlier
    ABG-observed outputs.
  - Required prior artifact omission or digest drift fails or blocks
    deterministically.
  - The proof includes a negative mutation for missing prior artifact evidence.
  - The implementation reuses existing payload/evidence/materialization/node
    type/asset-surface truth and does not mint a broad prompt carrier.
  - Product-local code does not execute rendering authority or inject final
    prompt content outside ABG runtime binding.
  - The focused test lane passes and the relevant live/software-build proof
    demonstrates the causal-carry behavior over a real F_P traversal.
  - Focused `test:t182` and live `test:t182:live` commands exist or the ticket
    records their exact ratified equivalent.
proof_commands:
  - git diff --check
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t182
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t182:live
  - "! rg -n \"InstructionComposition|PromptLedger|product-local prompt shell|local prompt shell\" build_tenants/abiogenesis/typescript/code/src"
notes:
  - This is the first shippable slice identified in
    `20260701T083917Z_STRATEGY_gtl_abg_instruction_prompt_algebra.md`.
  - This ticket intentionally does not decide the full instruction assembly
    carrier/API. T-183 owns that broader design.
  - The expected proof target is the odd_glc-style framework-smoke
    software-build traversal: implementation design -> source -> test design
    -> test source -> test execution plan -> test execution result.
---

# T-182: Realize Causal Carry In ABG Instruction Rendering

This ticket closes the immediate prompt-causality defect exposed by the live
odd_glc framework-smoke traversal.

The ABG event stream already contains the data needed for this slice:
payload observations, payload validations, evidence admissions, selected graph
function/vector truth, graph-call/frame truth, and node type/asset-surface
obligations. The defect is that later F_P dispatches did not receive the
prior-stage artifacts required to make the staged traversal causally strong.

The intended result is narrow: ABG binds existing admitted prior artifact truth
into the current instruction envelope. It does not create the full instruction
assembly algebra, a prompt ledger, or a product-owned prompt shell.

## Execution Record

### 2026-07-01 Start Slice

Implemented the first causal-carry runtime slice:

- Added `InstructionCausalInputBinding` and
  `InstructionCausalContextProjection` as subordinate payload-ledger read
  projections over existing admitted output-authority truth.
- Added `deriveInstructionCausalContextProjection(...)`, deriving prior-vector
  causal inputs from replay-derived closed vectors and target-carrier
  payload/evidence admission.
- Tightened admitted-output authority projection so observed/validated digest
  drift is not treated as admitted output.
- Threaded causal context into `EnginePluginInput` and `FpTransformRequest`.
- Added `instruction_causal_context_bound` as replay-visible runtime truth
  emitted by the runner before actor invocation on F_P dispatch.
- Added runner fail-closed behavior: blocked causal context emits causal
  context truth and terminates before actor invocation or F_P plugin dispatch.
  This start slice blocks explicit rejected or digest-drifted prior target
  truth; required-omission blocking remains gated on the declared binding
  policy below.
- Added focused synthetic proof lane script `test:t182`.

Focused proof result:

```text
cd build_tenants/abiogenesis/typescript && npm run test:t182
pass: 4/4
```

Regression proof results for the start slice:

```text
git diff --check
pass

cd build_tenants/abiogenesis/typescript && npm run build:semantic
pass

cd build_tenants/abiogenesis/typescript && node --test \
  test_env/tests/test_t182_instruction_causal_carry.test.mjs \
  test_env/tests/test_m04_engine_start_integration.test.mjs \
  test_env/tests/test_t084_attached_fp_worker_loop.test.mjs
pass: 16/16

cd build_tenants/abiogenesis/typescript && npm run test:t177
pass: 16/16

cd build_tenants/abiogenesis/typescript && npm run test:t180
pass: 9/9

cd build_tenants/abiogenesis/typescript && npm run test:semantic
pass: 982/982

rg -n "InstructionComposition|PromptLedger|product-local prompt shell|local prompt shell" \
  build_tenants/abiogenesis/typescript/code/src
no matches
```

Current remaining work before closure:

- Extend from refs/digests to the declared excerpt/full-content binding policy.
- Add the declared required-input policy that distinguishes optional absent
  prior artifacts from required omissions that must fail closed.
- Prove the behavior on a real framework-smoke/software-build traversal with
  live F_P dispatch.
- Add a true live `test:t182:live` scenario that calls the F_P worker.
- Re-run the full semantic suite and boundary greps after the live proof lands.
