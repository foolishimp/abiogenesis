---
id: T-184
title: Consolidate canonical installed live Hello World proof over GTL/ABG full stack
type: realization_refactor
ticket_category: live_proof_consolidation
status: active
goal: >-
  Replace scattered ticket-specific Hello World live smoke paths with one
  canonical installed-sandbox proof that installs the latest ABI package,
  consumes product GTL declarations/config, selects the product graph function
  through ABG registry startup, binds node types and overlay refs, renders
  instructions through ABG instruction assembly, calls a live F_P worker, admits
  the response, executes the produced artifact, and proves replay-visible event
  truth.
change_intent: >-
  T-177, T-180, T-182, and T-183 each shipped focused live proofs. The remaining
  risk is proof fragmentation: downstream consumers can pick the wrong Hello
  World proof and miss registry startup, node typing, causal carry, instruction
  assembly, response admission, installed sandbox behavior, or live worker
  execution. This ticket consolidates the live surface into one canonical
  full-stack Hello World proof and prunes redundant script entry points to use
  that proof.
change_class: realization_refactor
re_entry_point: t184_live_proof_surface
owner: abiogenesis
priority: high
triaged_at: 2026-07-01
created_at: 2026-07-01
updated_at: 2026-07-01
governance_scope: STDO Method, DESIGN_MODULE_METHOD, ABG Runtime, GTL, Registry, Node Types, Instruction Assembly, Live Proof
build_tenant: typescript
depends_on:
  - .ai-workspace/tickets/completed/T-177-design-live-abg-runtime-graph-function-registry-lookup.md
  - .ai-workspace/tickets/completed/T-180-ratify-reusable-gtl-node-types-and-type-composition.md
  - .ai-workspace/tickets/completed/T-182-realize-causal-carry-in-abg-instruction-rendering.md
  - .ai-workspace/tickets/completed/T-183-design-and-realize-abg-instruction-assembly-semantic-compiler.md
source_documents:
  - build_tenants/abiogenesis/typescript/test_env/sandbox/test_t180_glc_hello_world_bootstrap_live.test.mjs
  - /Users/jim/src/apps/odd_glc/build_tenants/odd_glc/typescript/test/glc-software-build-overlay-live.test.mjs
  - specification/requirements/abg/REQ-R-ABG3-INSTRUCTION-ASSEMBLY.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
review_status: open
proof_status: pending
target_truth: >-
  ABI has one canonical Hello World live proof for downstream GLC-style build
  confidence. The proof creates a fresh sandbox, cuts/extracts a package
  snapshot, installs ABI into that sandbox, writes product GTL declarations and
  startup config as product input, runs the installed public start command,
  selects a product graph function through ABG registry truth, validates node
  type entries as non-callable, dispatches F_P only through ABG instruction
  assembly manifests, admits worker responses against derived output contracts,
  executes the generated Hello World artifact, and writes a digestable proof
  summary. Ticket-specific live scripts may remain as aliases or focused
  regressions, but the release-facing Hello World proof is this canonical path.
superseded_truth: >-
  Separate Hello World live tests each prove only one narrow subsystem, or build
  worker prompts through product-local prompt helpers, while release or
  downstream review treats any one of them as a full GTL/ABG proof.
closure_law: >-
  Close only when the canonical installed sandbox live proof passes with a real
  LLM call, the package scripts route T-180/T-182/T-183 live aliases to the same
  canonical proof or clearly mark them focused non-release checks, and the proof
  summary records installed package identity, graph-function selection,
  registry/node-type admission, instruction prompt manifests, response
  admissions, actor artifacts, execution stdout, event counts, duration, source
  commit, and dirty status.
non_closure_conditions:
  - The live worker prompt is built by a product-local prompt helper instead of
    using `instructionPromptManifest.renderedPrompt`.
  - The proof bypasses installed sandbox startup and imports source-tree runtime
    code as the execution product.
  - Product GTL declarations, startup config, graph overlays, graph functions,
    or node types are not consumed through ABG startup/registry admission.
  - Node-type entries can be selected or invoked as callable graph functions.
  - Response success is accepted from worker self-report without
    `instruction_response_contract_admitted` replay truth.
  - The generated Hello World artifact is not executed in the sandbox, or stdout
    is not exactly `Hello, world!\n`.
  - The proof summary is missing live worker evidence, event counts, prompt
    manifest counts, response admission counts, source commit, dirty status, or
    duration.
required_work:
  - >-
    Phase 1 - Catalog current live Hello World surfaces and choose the one
    canonical installed-sandbox proof path.
  - >-
    Phase 2 - Remove product-local prompt construction from the canonical proof;
    use ABG instruction assembly manifest rendering as the worker prompt.
  - >-
    Phase 3 - Make the canonical proof cover registry startup, product library
    declarations, node-type entries, graph-function selection, overlay refs,
    instruction manifests, response admission, causal carry, artifact execution,
    and replay-derived event truth.
  - >-
    Phase 4 - Prune package script entry points so T-180/T-182/T-183 live gates
    do not point at divergent Hello World implementations.
  - >-
    Phase 5 - Run focused tests and one live LLM proof; record the digestable
    proof summary and commit.
acceptance_criteria:
  - One package script, `test:hello-world:live`, runs the canonical installed
    sandbox live proof.
  - `test:t180:live`, `test:t182:live`, and `test:t183:live` either invoke the
    canonical proof or are explicitly documented as focused non-release checks.
  - The canonical proof uses `instructionPromptManifest.renderedPrompt` for the
    live worker prompt.
  - The canonical proof observes replay-visible `registry_entry_admitted`,
    `graph_function_selected`, `graph_call_opened`,
    `instruction_prompt_manifest_projected`,
    `instruction_response_contract_admitted`, and actor/result artifact events.
  - The proof writes a summary artifact with source commit, dirty status,
    installed package identity, duration, event counts, prompt manifest count,
    response admission count, live worker transport records, and execution
    stdout.
proof_commands:
  - git diff --check
  - cd build_tenants/abiogenesis/typescript && npm run test:t180
  - cd build_tenants/abiogenesis/typescript && npm run test:t183
  - cd build_tenants/abiogenesis/typescript && npm run test:hello-world:live
notes:
  - The odd_glc Hello World and software-build overlay tests are behavioral
    witnesses. ABI owns only the generic GTL/ABG substrate and proof path here.
---

# T-184: Canonical Installed Live Hello World Proof

This ticket consolidates the release-facing Hello World proof surface. It does
not add product policy to ABI. It uses an odd_glc-shaped product declaration as
a witness that GTL/ABG can run a downstream graph overlay through the installed
ABI product without a product-local prompt shell or duplicate truth surface.
