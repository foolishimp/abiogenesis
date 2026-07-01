---
id: T-183
title: Design and realize ABG instruction assembly law with semantic compiler assurance
type: requirements_design_realization
ticket_category: instruction_assembly_semantic_compiler
status: active
goal: >-
  Define and realize the ABG/GTL instruction assembly surface that compiles
  edge-bound prompt plans from existing GTL/ABG carriers, deterministically
  sanity-checks, compresses, validates, and admits them before runtime, and
  lets ABG bind live refs into immutable instruction envelopes for F_P worker
  dispatch.
change_intent: >-
  GTL/ABG now has graph functions, node types, asset surfaces, compute
  notation, startup registry admission, runtime traversal, payload/evidence
  ledgers, and response admission. The remaining gap is the instruction
  assembly layer: product-local prompt builders can still assemble confusing,
  over-broad, under-carried, answer-carrying, or authority-leaking prompts.
  This ticket defines the narrow assembly law, semantic compiler proof, startup
  admission, runtime binding, renderer boundary, and proof gates needed to
  make prompts typed, compressed, relevant, proportional, replayable, and
  assurable without duplicating existing carrier truth.
change_class: requirement_reprice
re_entry_point: abg_instruction_assembly_requirement
owner: abiogenesis
priority: high
triaged_at: 2026-07-01
created_at: 2026-07-01
updated_at: 2026-07-01
activated_at: 2026-07-01
governance_scope: STDO Method, SPEC_METHOD, DESIGN_MODULE_METHOD, GTL, ABG Runtime, Semantic Compiler, Binding, Transport, Payload
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
  - .ai-workspace/tickets/completed/T-180-ratify-reusable-gtl-node-types-and-type-composition.md
  - .ai-workspace/tickets/completed/T-182-realize-causal-carry-in-abg-instruction-rendering.md
related_tickets:
  - .ai-workspace/tickets/completed/T-182-realize-causal-carry-in-abg-instruction-rendering.md
source_documents:
  - .ai-workspace/comments/codex/20260701T083917Z_STRATEGY_gtl_abg_instruction_prompt_algebra.md
  - specification/requirements/gtl/REQ-L-GTL3-CONTRACT-LAW-API.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
  - specification/requirements/gtl/REQ-L-GTL3-ASSET-SURFACE.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - specification/requirements/abg/REQ-R-ABG3-TRANSPORT.md
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md
  - specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
design_surfaces:
  - build_tenants/abiogenesis/typescript/design/M03_INSTRUCTION_ASSEMBLY_DERIVATION.md
review_status: open
proof_status: pending
target_truth: >-
  ABG instruction assembly law is a narrow edge-bound surface over existing
  GTL/ABG carriers. It binds graph-function/vector refs to section rules,
  F_D relevance rules, compression policy, proportionality policy, and runtime
  binding slot classes. It does not redeclare node types, response contracts,
  proof obligations, authority slots, renderer refs, active regime, or carrier
  classes. The semantic compiler produces a digest-pinned `CompiledPromptPlan`
  that deterministically proves source trace, type coverage, derived response
  contracts, derived authority/proof/renderer coverage, relevance,
  compression, proportionality, non-duplication, and non-tautology before ABG
  admits the plan at startup. At runtime, ABG binds live refs into an immutable
  `InstructionEnvelope`, renders through ABG-owned or authority-denied
  governed rendering, dispatches the worker, and admits or rejects the
  response.
superseded_truth: >-
  Prompt content is assembled by product-local templates, plugin shells,
  scenario-specific helper code, broad prompt carriers, hidden renderer code,
  or runtime LLM judgment about what evidence is relevant. Prompt correctness
  is reviewed manually instead of being compiled, F_D-proved, admitted,
  replayed, and negatively tested.
closure_law: >-
  Close only when requirement/design law, TypeScript realization, compiler
  proof, startup admission, runtime binding, renderer boundary, and focused
  synthetic/live proofs demonstrate that F_P prompts are compiled carrier
  aggregates: no duplicate carrier truth, no product shell, no F_P-owned
  relevance/compression decision, no prompt-carried answer, deterministic P0
  no-dispatch, replayable prompt manifest/digest, and live odd_glc-style
  framework-smoke proof over compiled prompt plans.
non_closure_conditions:
  - The ticket introduces a broad GTL prompt carrier or `InstructionComposition`
    that redeclares source/target node types, response contracts, proof
    obligations, authority slots, renderer refs, active regime, or carrier
    classes.
  - Relevance, compression, proportionality, type coverage, or authority
    coverage is decided by F_P rather than F_D compiler checks.
  - F_P compiler traversal is treated as runtime truth, evidence admission,
    closure, graph-function selection, or response admission.
  - ABG runtime invents instruction meaning that was not present in the
    admitted compiled prompt plan and existing carrier truth.
  - Product code executes final prompt rendering, injects hidden prompt text,
    or owns a prompt shell through `rendererRefs`.
  - Product templates are executable authority instead of admitted data or
    governed authority-denied renderer input.
  - A deterministic P0 edge still dispatches an F_P worker.
  - A prompt can carry the expected answer or classifying marker and still
    satisfy the proof gate.
  - Prompt manifest replay cannot reproduce the rendered prompt digest from
    admitted declarations and ABG events.
  - Missing required prior artifact/evidence truth results in a weakened prompt
    instead of a typed gap, block, or pre-dispatch rejection.
  - Runtime binding accepts stale, forged, unadmitted, or digest-mismatched
    payload/evidence refs.
  - Instruction assembly rules, compiled prompt plans, renderer bindings,
    prompt policies, or runtime binding policies are selected through a
    parallel prompt-loader, product-local shell, local registry, file scan, or
    duplicate selection path instead of the canonical ABG startup and
    registry/admission path.
  - The live proof uses hand-built prompt fixtures instead of ABG startup
    admission and runtime-bound instruction envelopes.
required_work:
  - >-
    Phase -1 - Requirement anchor: Ratify the ABG instruction assembly
    requirement family before realization. The requirement shall define
    dispatch-assurance obligations for compiled prompt plans, F_D compiler
    checks as total functions over known algebras, F_P validation traversal as
    evidence-only review, runtime-bound instruction envelopes, prompt
    manifests, P0 no-dispatch, renderer authority, non-tautology, response
    admission, and canonical startup/registry pickup.
  - >-
    Phase 0 - Re-entry and carrier cut: Ratify the field-cut decision in the
    design pack before code. Existing `GraphFunction`, `GraphVector`,
    `Node.typeRef`, `AssetSurface`, compute notation, payload/evidence
    ledgers, policy refs, and renderer refs remain source truth. The new
    assembly surface shall only bind graph-function/vector refs to section
    rules, relevance rules, compression policy, proportionality policy, and
    runtime binding slot classes.
  - >-
    Phase 1 - Requirement/design law: Decide the minimal requirement home for
    ABG instruction assembly law and policy overlay interaction. Update
    requirement/design surfaces only as needed to state the narrow assembly
    surface, F_D ownership only where decisions are total functions over known
    algebras, relevance/compression/proportionality, renderer ownership, P0
    no-dispatch, non-tautology, and no-duplicate-carrier-truth law.
  - >-
    Phase 2 - IACS and structural carrier diagram: Produce a DESIGN_MODULE_METHOD
    pack for `InstructionAssemblyRule`, `CompiledPromptPlan`,
    `RuntimeBindingSlot`, `InstructionEnvelope`, `PromptManifest`, governed
    renderer binding, and response admission. The diagram shall show which
    facts are derived from existing carriers and which are new subordinate
    payload/projection shapes.
  - >-
    Phase 3 - Semantic compiler: Implement compiler support that turns existing
    GTL declarations, assembly rules, and product policy/task overlays into a
    digest-pinned `CompiledPromptPlan`. The compiler must F_D-prove source
    trace, type coverage, response-contract derivation, proof/authority/renderer
    derivation, relevance, compression, proportionality, no future-stage bleed,
    no duplicate carrier truth, and no prompt-carried answer only as total
    functions over known algebras and admitted inputs. The compiler slice shall
    include the F_P validation/review traversal over a candidate plan when
    policy requires semantic sanity checking; F_P may only propose or review
    wording/rubric/policy clarity, and its output remains admitted evidence
    until F_D validates or rejects the plan. This phase shall reuse the existing
    ABG semantic compiler F_P review graph function, semantic review gate, and
    `promptAssets` conformance law where they apply; it shall not create a
    second compiler path, prompt asset carrier, semantic review gate, or
    product-local prompt shell.
  - >-
    Phase 4 - Startup admission: Admit compiled prompt plans through the same
    canonical startup path used for product GTL declarations, registry/library
    entries, graph overlays, node types, callable graph functions, and policy
    overlays. Reject stale, partial, unregistered, digest-drifted, or
    carrier-shadowing plans.
  - >-
    Phase 5 - Runtime binding: Bind only declared runtime slots from admitted
    or replay-derived ABG truth: graph call, frame, vector, selected graph
    function, source/target node refs, payload/evidence ledgers, prior artifacts,
    residual/continuation/re-entry refs, current policy/admission state, worker
    invocation identity, and event/log refs.
  - >-
    Phase 6 - Renderer ownership: Implement ABG-owned renderer execution or a
    governed authority-denied renderer plugin over immutable envelopes.
    Product-supplied templates or grammar are admitted data only. Renderer
    execution shall not select graph functions, omit required sections, add
    hidden instructions, bind runtime refs, admit response truth, or decide
    closure.
  - >-
    Phase 7 - P0 deterministic dispatch avoidance: Make proportionality affect
    dispatch. Deterministic edges that can close through schema, digest,
    command-result, replay, or other F_D truth shall close without rendering
    an F_P prompt or emitting `fp_dispatch_requested`.
  - >-
    Phase 8 - Response admission: Ensure worker responses are parsed and
    admitted against the response contract derived from target asset-surface
    truth. Worker success, transport success, prompt self-report, and output
    shape alone shall not become closure truth.
  - >-
    Phase 9 - Prompt manifest and replay: Emit or project prompt manifests
    containing compiled plan ref, bound runtime refs, included/omitted/ref-only/
    diagnostic/forbidden/gap carriers, renderer identity, prompt digest, and
    response contract. Replaying admitted declarations and event truth shall
    reproduce the manifest and rendered digest.
  - >-
    Phase 10 - Negative proof suite: Add differential tests for future-stage
    boilerplate injection, missing prior evidence, forbidden authority verbs,
    loosened response schema, unadmitted runtime refs, product renderer shell
    injection, duplicate carrier declaration, P0 accidental F_P dispatch, and
    expected-answer/classifier injection.
  - >-
    Phase 11 - Live framework-smoke proof: Rerun the odd_glc-style
    framework-smoke software-build traversal with compiled prompt plans and
    ABG-bound envelopes. Prove each vector receives only its current task, the
    required prior artifacts, and effective source/target node obligations;
    prove prompt manifest replay; prove no product-local prompt shell or
    renderer authority exists.
  - >-
    Phase 12 - Proof lane wiring: Add focused package scripts `test:t183` and
    `test:t183:live` or ratified equivalent commands so the closure proof
    commands are executable release gates rather than aspirational names.
acceptance_criteria:
  - The design explicitly cuts duplicate fields and derives node types,
    response contracts, proof obligations, authority slots, renderer refs, and
    active regime from existing carriers.
  - `InstructionAssemblyRule` or ratified equivalent is narrow: graph-function/
    vector binding plus section, relevance, compression, proportionality, and
    runtime slot rules only.
  - `CompiledPromptPlan` or ratified equivalent is digest-pinned, admitted at
    startup, and proves no duplicate carrier truth.
  - The semantic compiler validates relevance, compression, proportionality,
    type coverage, authority coverage, source trace, and response-contract
    derivation as total functions over known algebras and admitted inputs.
  - Existing semantic-compiler/conformance surfaces are reconciled before new
    code: the T-150/T-162 F_P review graph, semantic review gates, and
    `promptAssets` law are reused or explicitly narrowed, not duplicated.
  - Any F_P validation traversal in the compiler path is admitted as evidence
    only and cannot approve a compiled prompt plan without F_D validation.
  - F_P is never authoritative for relevance, compression, proportionality,
    runtime truth, selection, admission, closure, or response admission.
  - Renderer execution is ABG-owned or delegated only to an authority-denied
    governed renderer plugin over immutable envelopes.
  - Runtime binding accepts only admitted or replay-derived refs and rejects
    stale, forged, unknown, or digest-mismatched refs.
  - Prompt manifests are replayable and reproduce rendered prompt digests.
  - P0 deterministic edges do not dispatch F_P workers.
  - Non-tautology is differentially proven by injecting an expected answer or
    classifier and observing proof failure.
  - The live framework-smoke proof uses ABG startup admission and runtime-bound
    instruction envelopes, not hand-built prompt fixtures.
  - Instruction assembly, renderer, prompt policy, and runtime binding
    selections use the same admitted registry/startup truth as graph-function
    selection and do not create a second selection surface.
  - Focused `test:t183` and live `test:t183:live` commands exist or the ticket
    records their exact ratified equivalent.
proof_commands:
  - git diff --check
  - rg -n "REQ-R-ABG3-INSTRUCTION-ASSEMBLY-(004A|005|007|011|012|014|015)" specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
  - rg -n "Existing Compiler Reuse And Gaps|constructAbgSemanticCompilerFpReviewGraphFunction|semanticReviewGates|promptAssets|CompiledPromptPlan" build_tenants/abiogenesis/typescript/design/M03_INSTRUCTION_ASSEMBLY_DERIVATION.md
  - rg -n "InstructionAssemblyRule|CompiledPromptPlan|RuntimeBindingSlot|PromptManifest|non-tautology|P0" specification build_tenants/abiogenesis/typescript/design
  - "! rg -n \"InstructionComposition|PromptPlan|sourceNodeTypeRefs|targetNodeTypeRefs|responseContractRef|requiredCarrierClasses\" build_tenants/abiogenesis/typescript/code/src"
  - cd build_tenants/abiogenesis/typescript && npm run build:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:semantic
  - cd build_tenants/abiogenesis/typescript && npm run test:t183
  - cd build_tenants/abiogenesis/typescript && CODEX_LIVE_FP=1 npm run test:t183:live
notes:
  - T-182 may land first and should not wait for this full ticket.
  - The strategy source is commentary, not law. This ticket must ratify any
    reusable requirement/design law before realization.
  - The ticket intentionally resolves the review fork toward ABG instruction
    assembly law plus admitted policy refs, not a broad GTL prompt carrier.
---

# T-183: ABG Instruction Assembly And Semantic Compiler Assurance

This ticket turns the prompt/instruction strategy into governed ABI work after
the causal-carry slice.

The central rule is that prompts are not authored directly. Existing GTL/ABG
carriers hold the facts; ABG instruction assembly law determines which facts
belong to the current edge; the semantic compiler sanity-checks, compresses,
validates, and admits a `CompiledPromptPlan`; ABG runtime binds live refs; the
worker receives an immutable envelope; ABG admits or rejects the response.

The purpose is not better prose. The purpose is to make prompt construction
provable: relevant, compressed, proportional, typed, replayable, non-tautological,
and unable to become a product-local authority surface.

## Execution Record

### 2026-07-01 Activation And Phase 0/1 Design Start

Activated after T-182 closed the first causal-carry slice. Started with the
M03 instruction assembly derivation rather than code, because this ticket
changes the prompt/instruction design surface.

Initial design decisions recorded:

- The new assembly law is an ABG runtime/design surface over existing GTL/ABG
  carriers, not a broad GTL prompt carrier.
- Added `REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md` as the constitutional anchor for
  the semantic compiler and dispatch-assurance obligations before locking the
  design further.
- `InstructionAssemblyRule` is narrow: it binds graph-function/vector refs to
  section rules, relevance rules, compression policy, proportionality policy,
  and runtime binding slot classes only.
- Node types, response contracts, proof obligations, authority slots,
  renderer refs, active regime, and carrier classes are derived from existing
  carriers.
- Relevance and compression are F_D compiler decisions; F_P may propose
  wording or clarity but cannot own inclusion/minimality.
- Any decision claimed as F_D must be a total function over a known algebra and
  admitted inputs. Deterministic-looking code without a declared algebra,
  output domain, and typed rejection/gap cases is not sufficient.
- The compiler slice includes an F_P validation/review traversal as semantic
  sanity-check evidence. That traversal cannot approve the plan without F_D
  validation and admission.
- Renderer execution is ABG-owned or delegated only to an authority-denied
  governed renderer over immutable envelopes.
- P0 deterministic edges are no-dispatch edges.
- Instruction assembly, renderer, prompt policy, and runtime binding selection
  must use the same canonical ABG startup and registry/admission path as
  graph-function selection. A parallel prompt-loader or product-local
  instruction-selection path is non-closure.

No realization code is started in this activation step.

### 2026-07-01 Existing Compiler Audit

Verified the current TypeScript semantic compiler path before starting T-183
realization:

- Existing: `constructAbgSemanticCompilerFpReviewGraphFunction` builds a
  one-vector F_P review graph with constrained worker-control and finite F_D
  surface declarations.
- Existing: `runAbgSemanticCompilerFpReviewGraphFunction` runs that graph and
  admits the result through `admitAbgSemanticCompilerFpReviewResult`.
- Existing: semantic review gates in GTL program conformance verify admitted
  review rows, ABG producer provenance, digest refs, finite F_D surface refs,
  passed status, and no open findings.
- Existing: `promptAssets` conformance verifies prompt asset surfaces, renderer
  refs, digest policy, constructor refs, proof obligations, output contracts,
  authority slots, GTL node preservation, rendered digest, and evidence refs.
- Gap: those surfaces are scoped to the T-150/T-162 semantic review package and
  prompt asset law. They do not yet provide T-183 instruction assembly rules,
  compiled prompt plans, runtime instruction envelopes, prompt manifests, P0
  no-dispatch, response-contract-bound admission, or same-registry-path
  compiled-plan startup selection.

Decision: T-183 realization shall adapt and extend the existing compiler and
conformance surfaces. It shall not fork a second semantic compiler or prompt
asset truth surface.
