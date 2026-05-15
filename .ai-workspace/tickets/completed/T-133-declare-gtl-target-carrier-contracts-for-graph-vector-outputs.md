---
id: T-133
title: Declare mandatory GTL target carrier contracts for graph-vector outputs
type: feature
ticket_category: gtl_target_carrier_contract
status: completed
goal: graph-vector-output-shape-is-declared-gtl-law
change_intent: Make target/output carrier shape a first-class GTL transition-governance contract so ABG, prompts, admission, replay, downstream tests, and closure consume one declared graph-vector surface.
change_class: design_reframe
re_entry_point: design
affected_boundary:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - specification/requirements/gtl/REQ-L-GTL3-JOB.md
  - specification/requirements/gtl/REQ-L-GTL3-MODULE.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - docs/LLM_GTL_APP_BUILDER_GUIDE.md
  - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/GTL_3_INTERFACE_CONTRACTS.md
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/admission/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/serialization/carriers.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/edge_assurance_contract.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/payload_ledger.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/plugins.ts
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
  - build_tenants/abiogenesis/typescript/test_env/tests/
priority: high
build_tenant: typescript
release_scope: post-3.5.0-rc.2 GTL/ABG output carrier contract hardening
triaged_at: 2026-05-15T00:00:00+10:00
created_at: 2026-05-15T00:00:00+10:00
updated_at: 2026-05-15T00:00:00+10:00
activated_at: 2026-05-15T00:00:00+10:00
completed_at: 2026-05-15T00:00:00+10:00
owning_repo: abiogenesis
governance_scope: STDO Method
source_documents:
  - specification/PRODUCT.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md
  - specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md
  - docs/LLM_GTL_APP_BUILDER_GUIDE.md
  - .ai-workspace/tickets/completed/T-131-declare-gtl-edge-assurance-contract-for-fp-gain-and-close.md
  - .ai-workspace/tickets/completed/T-132-prove-runner-consumed-edge-assurance-eval-replay.md
  - ../odd_sdlc/.ai-workspace/tickets/completed/T-164-declare-per-edge-gain-and-closure-functions-for-sdlc-traversals.md
  - ../odd_sdlc/.ai-workspace/comments/codex/20260515_gtl_edge_carrier_contract_strategy.md
parent_tickets:
  - .ai-workspace/tickets/completed/T-131-declare-gtl-edge-assurance-contract-for-fp-gain-and-close.md
  - .ai-workspace/tickets/completed/T-132-prove-runner-consumed-edge-assurance-eval-replay.md
related_downstream:
  - odd_sdlc/.ai-workspace/tickets/completed/T-164-declare-per-edge-gain-and-closure-functions-for-sdlc-traversals.md
  - odd_sdlc/.ai-workspace/tickets/active/T-168-build-design-consumer-test-pipeline-for-co-affirming-implementation.md
  - odd_sdlc/.ai-workspace/comments/codex/20260515_gtl_edge_carrier_contract_strategy.md
  - odd_sdlc/build_tenants/typescript/test_env/test_runs/scenario_t132_hello_world_js_live/20260515T065518532Z_pid39681
current_evidence:
  - REQ-L-GTL3-GRAPHVECTOR says GraphVector.declarations is the canonical transition-governance declaration surface for one invariant traversal boundary.
  - REQ-L-GTL3-GRAPHVECTOR-012 allows GraphVector.declarations["abg.edge_assurance_contract"] to carry target outcome, evidence policy, gain, metric, closure, residual, continuation, composition, cheap structural checks, and policy refs.
  - T-131 defined the GTL edge assurance contract for F_P gain and close.
  - T-132 proved ABG can consume declared edge assurance contracts through runner, replay, hook finding admission, projection, read models, and compound composition.
  - The odd_sdlc T-164 carry-across made per-edge gain and closure explicit downstream, but a live hello-world lane exposed the next missing contract: the exact output carrier shape was still split across graph rows, prompt text, parser predicates, and closure folds.
  - The gap is generic. GTL declares the graph-vector output contract; ABG admits, records, replays, and projects it; downstream products instantiate domain-specific carrier content.
closure_evidence:
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHVECTOR.md declares effective target carrier contract bindings mandatory and config-backed.
  - specification/requirements/gtl/REQ-L-GTL3-HOOKS.md declares gtl.target_carrier_contract precedence and fail-closed defaults behavior.
  - specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md declares payload ledger closure dependence on selected target carrier contract ref and digest.
  - build_tenants/abiogenesis/typescript/config/gtl.target-carrier-defaults.json supplies the visible generic target-carrier defaults config.
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/target_carrier_contract.ts resolves vector-local bindings first and config defaults second without code-defined default carrier values, and rejects vector-local bindings whose target node or schema identity does not match the hosting vector.
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/target_carrier_contract.ts uses one normalized digest strategy for loaded and directly admitted defaults bundles.
  - build_tenants/abiogenesis/typescript/code/src/gtl/m01/contracts/target_carrier_contract.ts exposes generic envelope validation for required fields, nested payload path, literal kind, and fixed protocol fields without taking over downstream semantic validation.
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/payload_ledger.ts records selected target carrier contract truth and exposes digest-bound admission/closure guards.
  - build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/assurance_gate.ts blocks assurance closure unless the selected target carrier contract ref and digest have admitted payload truth.
  - build_tenants/abiogenesis/typescript/code/src/app/m04/install_bootstrap/typescript_installer.ts installs the editable GTL target-carrier defaults config.
  - build_tenants/abiogenesis/typescript/test_env/tests/test_t133_target_carrier_contract.test.mjs proves config default resolution, product-specific override, vector target/schema identity rejection, normalized bundle digest identity, malformed declaration rejection, generic envelope negative cases, digest-bound replay admission, and assurance-gate target-carrier closure blocking.
  - npm run lint:semantic, npm run lint:test-harness, and npm run test:semantic pass after post-review hardening.
target_truth: Every GTL GraphVector output surface must have an effective target carrier contract binding. The effective binding is mandatory and must not be null. A vector-local product-specific declaration wins; when it is absent, the generic binding is read from visible GTL defaults config, not from code constants. The contract names the output carrier family, target node or asset surface, envelope, nested payload path, required fields, fixed protocol fields, worker-fillable fields, literal or enum domains, schema/admission refs, hook or prompt projection refs, write-root and materialization policy, payload-ledger binding, replay digest policy, closure preconditions, and test-case generation obligations. ABG consumes the selected contract for admission, payload ledger truth, replay, projection, and closure gating. Downstream products own domain meaning and concrete field values, but they do not invent the carrier contract outside GTL.
closure_law: Close only when GTL requirements/design define target carrier contracts as mandatory effective transition-governance bindings, TypeScript resolution fails closed on malformed vector declarations or missing/malformed defaults config, ABG payload admission consumes the selected binding without side-door prompt shape, runner/replay tests prove accepted and rejected target carriers, and odd_sdlc can bind its release-depth-parity carrier through the GTL contract rather than product-local prompt/parser convention.
non_closure_conditions:
  - Output carrier shape remains prompt prose, example lore, parser-only code, or downstream product-local convention.
  - A graph vector output has no effective target carrier contract because both vector declaration and visible config default are absent or malformed.
  - A graph vector can declare gain and closure law while the produced target carrier shape remains undeclared or only defaulted outside GTL.
  - ABG closure can pass because a file or payload exists without admitted satisfaction of the graph-vector target carrier contract.
  - Parser admission accepts a target payload that is not bound to the selected GTL contract ref and digest.
  - Replay reconstructs payload truth without checking the same carrier contract identity.
  - Downstream odd_sdlc still needs a product-local meta-contract to tell workers what carrier shape an edge output must take.
  - The test proof only covers happy-path payload existence and does not reject missing nested carrier, wrong kind literal, missing required field, or illegal mutation of fixed protocol fields.
---

# T-133: Declare Mandatory GTL Target Carrier Contracts For Graph-Vector Outputs

## Entry

Smallest lawful re-entry: `design_reframe`.

The missing law belongs to GTL. A downstream product can instantiate a concrete
carrier such as `release_depth_parity_surface`, but the generic contract that
says "this graph-vector output must have this admitted carrier shape" is part of
the GTL transition-governance surface.

The contract binding is mandatory for graph-vector outputs. A vector may bind a
product-specific contract. When it does not, the generic binding is read from
visible GTL defaults config. The effective binding may not be absent or null,
and code may not manufacture default carrier values outside the config.

The target surface is `GraphVector.declarations`, with participation from the
existing `abg.edge_assurance_contract` contract family. ABG interprets that
declaration; it does not invent the carrier shape from prompt prose, runtime
adapter state, parser conditionals, or downstream orchestration code.

## Problem

T-131 put edge gain and closure into GTL as an edge assurance contract. T-132
proved ABG could consume that contract through runner and replay.

The downstream odd_sdlc T-164 carry-across exposed the next missing component:
edge assurance can declare the target outcome and close function while the
actual output carrier shape still lives in separate conventions:

- graph catalog output labels
- edge assurance rows
- worker prompt field lists
- parser admission predicates
- payload or closure folds
- downstream tests

Those surfaces need one GTL contract.

## Target Contract

Introduce a mandatory GTL target carrier contract binding for graph-vector
outputs.

The first stable shape should cover:

```text
TargetCarrierContractBinding {
  graphVectorRef
  contractRef
  templateRef
  targetNodeRef
  outputSurfaceRef
  outputCarrierFamilyRef
  outputCarrierKind

  envelopeContractRef
  nestedPayloadPath
  requiredFieldRefs
  optionalFieldRefs
  fixedProtocolFieldRefs
  workerFillableFieldRefs
  literalDomainRefs
  enumDomainRefs

  schemaRef
  admissionRef
  payloadLedgerBindingRef
  edgeAssuranceBindingRef
  handoffProjectionRef
  constructionTemplateRef
  replayDigestPolicyRef
  materializationPolicyRef
  closurePreconditionRef
  testCaseGenerationRef
}
```

The exact carrier names are design work. The required semantics are not
optional:

- GTL declares the output carrier contract binding for every graph-vector
  output.
- A missing or null effective contract binding fails admission.
- A generic output contract is read from visible GTL defaults config, not from
  code constants or absence.
- ABG resolves and consumes it.
- F_D can admit or reject the carrier envelope and fixed fields.
- F_P may fill semantic content only inside worker-fillable fields.
- Closure cannot treat target existence as target satisfaction.
- Replay must preserve the contract identity used to admit the target.
- Tests must derive positive and negative carrier cases from the same contract.

## Missing Contract Register

### GraphVector Declaration

Current contract:

- source and target nodes
- operators and evaluators
- local rule
- transition-governance declarations
- optional `abg.edge_assurance_contract`

Missing components:

- mandatory output carrier contract declaration key or nested section
- generic template reference for outputs that do not yet need a product-specific
  contract
- target node/output surface binding
- carrier family and kind identity
- payload envelope and nested payload path
- fixed protocol fields and worker-fillable fields
- schema/admission refs
- payload-ledger and replay digest refs

### Edge Assurance Contract

Current contract:

- target outcome
- authority surfaces
- obligation bindings
- evidence policy
- gain report
- metric
- closure decision
- residual pressure
- continuation
- composition law
- cheap structural checks

Missing components:

- mandatory target carrier contract binding
- admitted target carrier precondition for closure
- target-carrier rejection residual category
- separation between semantic close findings and structural carrier admission
- proof that malformed target carriers cannot close the edge

### ABG Payload Admission

Current contract:

- runtime facts and payload ledgers can admit observed payloads
- assurance projection can consume admitted findings

Missing components:

- admission keyed to selected GTL target carrier contract ref
- rejection for missing, null, or unknown target carrier contract binding
- diagnostics for missing carrier, wrong kind, missing field, wrong literal, and
  illegal protocol-field mutation
- accepted contract ref and digest stored with admitted payload truth
- replay check against the same contract identity

### Worker/Handoff Projection

Current contract:

- plugins or downstream products can project contract context into worker prompts

Missing components:

- prompt/hook projection generated from GTL target carrier contract
- fixed protocol fields prefilled or marked immutable
- worker-fillable fields separated from protocol fields
- retry repair instructions derived from the same contract
- no independent prompt-only carrier shape

### Test Pipeline Consumption

Current contract:

- downstream tests can exercise parser, closure, and live-lane behavior

Missing components:

- design/test generator consumes GTL target carrier contract
- positive fixture generation from the contract
- negative fixture generation for malformed carrier cases
- closure proof that admitted target carrier satisfaction is required
- downstream co-affirmation that implementation and tests read the same design
  contract

## Authority Split

| Layer | Owns |
| --- | --- |
| GTL | Requires target carrier contract bindings on graph-vector output surfaces, provides generic templates, and makes product-specific contracts publishable through graph functions/modules/jobs. |
| ABG | Resolves selected contracts, admits or rejects payloads, records events, stores payload-ledger truth, replays contract-bound payload state, and gates closure. |
| F_D | Performs structural carrier admission: schema, field, literal, digest, path, provenance, write-root, and envelope checks. |
| F_P | Constructs or evaluates semantic content inside the declared worker-fillable boundary. |
| Downstream product | Owns domain meaning, concrete target asset names, field values, and product-specific acceptance interpretation. |

## Required Work

- Extend GTL requirements/design to name target carrier contracts as part of
  `GraphVector.declarations` transition-governance law.
- Make the target carrier contract binding mandatory for every graph-vector
  output and define the canonical generic template refs used when no
  product-specific carrier shape is supplied.
- Define the relationship between `abg.edge_assurance_contract` and target
  carrier contracts. Edge assurance may reference or embed the target carrier
  contract, but it must not leave target shape outside GTL.
- Define how `GraphFunction`, `Job`, and `Module` publication preserve target
  carrier contract identity.
- Extend TypeScript GTL carriers/admission/serialization so the declaration is
  inspectable, serializable, and rejectable when malformed.
- Extend ABG edge assurance and payload-ledger admission so closure depends on
  admitted target carrier satisfaction.
- Add runner/replay tests proving accepted and rejected target carriers.
- Add downstream odd_sdlc proof that `release_depth_parity_surface` binds to the
  GTL contract instead of a product-local handoff/parser convention.

## Downstream Carry-Across

The downstream first consumer is odd_sdlc:

```text
derive_release_depth_parity_surface
-> release_depth_parity_surface
-> sdlc_component_depth_register.releaseDepthParity
-> sdlc_release_depth_parity_assessment
```

odd_sdlc owns the domain-specific target shape. GTL owns the generic contract
slot and publication/admission law that makes this shape a declared graph-vector
output contract.

T-168 should consume this contract through the design-consumer test pipeline:

- generate valid target carrier fixtures
- generate malformed target carrier fixtures
- execute admission/closure tests
- verify results against the same contract identity used by implementation

## Proof Surface

Expected source proof:

- `build_tenants/abiogenesis/typescript/test_env/tests/test_t133_target_carrier_contract.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t131_edge_assurance_contract.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_t132_edge_assurance_installed_sandbox.test.mjs`
- `npm run test:semantic`

Expected downstream proof:

- odd_sdlc T-168 design-consumer test pipeline consumes the target carrier
  contract.
- odd_sdlc release-depth-parity live lane no longer relies on independent
  prompt/parser shape conventions.

## Post-Review Closure Delta

The review pass found that the first implementation declared the target carrier
contract but did not yet bind every closure path to that selected contract.

Closed deltas:

- vector-local `gtl.target_carrier_contract` declarations are now checked
  against the hosting vector target node and target schema before they can win
  over defaults
- payload-ledger projection now requires an already admitted defaults bundle
  from its caller and no longer performs lazy filesystem lookup from replay
  projection
- loaded defaults and directly admitted defaults now share the same normalized
  bundle digest
- payload validated/rejected events carry `contractDigest`, and target-carrier
  admission filters by selected `contractRef` plus selected digest
- assurance closure now blocks before close when the selected target-carrier
  contract has no admitted payload truth
- generic target-carrier candidate validation covers the F_D boundary only:
  nested payload presence, required fields, literal kind, and fixed protocol
  fields; downstream semantic content remains product/F_P-owned
- T-093, T-099, and T-132 fixtures now carry target-carrier admission events
  where tests need to reach assurance behavior beyond the carrier gate

## Closure

This ticket closes when GTL can say, for one graph-vector output:

```text
This edge produces this target carrier.
This carrier has this envelope, path, fields, literals, schema, and admission.
ABG admitted this payload under that contract.
Replay proves the same contract-bound payload truth.
Closure used that admitted target carrier, not file existence or worker prose.
Tests generated from the same contract reject malformed carriers.
```
