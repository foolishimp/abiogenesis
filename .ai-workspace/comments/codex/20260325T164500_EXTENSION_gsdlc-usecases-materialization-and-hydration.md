## Extension Proposal Addendum — Parameterized Materialization, Policy Provenance, and Runtime Hydration

This note is an addendum to the GSDLC use-case work in `/Users/jim/src/apps/genesis_sdlc/.ai-workspace/comments/codex/20260325T005115_REQUIREMENT_gsdlc-ranking-profile.md`.

It captures two related extensions that emerged from review:

1. parameterized graph-function materialization and policy provenance
2. native ABG implementation plus explicit environment hydration/integration

The intent is to preserve a clean architectural split:

- `GTL` defines portable structure, interfaces, graph functions, and explicit policy/materialization surfaces
- `ABG` defines native execution semantics, lineage, convergence, correction, replay, and provenance
- hydration binds an ABG-capable graph/runtime to a concrete environment and service set

---

## Extension Proposal — Parameterized Materialization and Policy Provenance

### Purpose

Preserve the real-world GSDLC use cases without letting business strategy, review policy, discovery configuration, or harvest choice collapse into hidden engine behavior.

The missing constitutional layer is:

- explicit materialization parameters
- explicit policy parameters
- replayable provenance for both
- tighter boundaries on what evaluators and reviewers are allowed to see and decide

### Proposed Extension

GTL 2.x should explicitly support graph functions whose materialization is parameterized by durable, policy-visible inputs.

These inputs are part of the lawful declared surface of graph application.

They are not implicit engine heuristics.

Representative examples include:

- ranked decomposition `profile = steelthread | optimal | mvp`
- discovery `tool_profile = jupyternotebook`
- review `consensus_policy = ...`
- harvest `harvest_policy = winner_take_all | cherry_pick | runoff | ensemble | best_score | consensus_merge`

### Constitutional Clarifications

1. Materialization parameters shall be explicit inputs to graph-function realization. The chosen parameter values are part of the graph application contract, not hidden runtime state.
2. Materialization parameters shall be replayable provenance. Event history must preserve enough information to reconstruct not only which graph function was chosen, but how it was materialized.
3. Selection and policy remain external to hidden engine behavior. ABG-compatible engines may enumerate lawful candidates and apply chosen structure, but shall not infer delivery profile, discovery tool profile, review policy, or harvest policy unless those are explicitly provided by lawful selection logic above the interpreter.
4. Review and harvest policies shall be first-class, explicit, and durable. Consensus and harvest strategies are not ambient conventions. They are governed choices over graph application and must remain visible in provenance.
5. Artifact and context boundaries shall remain explicit. Review-gate judges the presented artifact plus explicit attached context. Discovery produces governed outputs, including durable artifact truth and reusable context truth. Harvest operates over explicit candidate outputs from an explicit worker set.

### Provenance Extension

Selection/materialization provenance should be extended beyond simple workflow identity.

A replayable control event should preserve at minimum:

```python
workflow_selected{
  contract,
  work_key,
  graph_function,
  selected_by,
  selection_mode,
  rationale?,
  materialization_params?,
  policy_params?,
}
```

Where:

- `materialization_params` captures values such as `profile="steelthread"` or `tool_profile="jupyternotebook"`
- `policy_params` captures values such as `consensus_policy=...` or `harvest_policy="runoff"`

This is necessary to preserve honest replay for all four GSDLC use cases.

### Use-Case Consequences

For ranked decomposition:

- one reusable graph function is sufficient
- ranking profile must remain explicit and replayable
- engines must not infer `steelthread`, `optimal`, or `mvp`

For gap-triggered schema discovery:

- child discovery lineage must preserve dataset/tool-profile provenance
- `discovered_schema` and `discovery_context_bundle` must be governed outputs
- folded-back truth must remain replayable, not agent-transient

For consensus-gated review:

- consensus policy must be explicit and replayable
- reviewer visibility should be constrained to the presented artifact and explicit attached context
- judge outputs should remain durable and auditable

For parallel worker harvest:

- worker set, candidate outputs, and harvest policy must all be explicit
- final selection or merge must be replayable provenance
- harvest must not collapse into implicit engine ranking

### Design Implication

This extension does not require a change in the graph-first direction.

It sharpens it.

The correct interpretation is:

- `GTL` owns structural possibility, graph-function interfaces, and explicit materialization/policy surfaces
- `ABG` owns lawful application, lineage, convergence, replay, and provenance recording
- business strategy and evaluator-driven choice remain externalized, explicit, and auditable

---

## Extension Proposal — Native ABG Implementation and Explicit Runtime Hydration

### Purpose

Support industrial and cloud-native deployments without contaminating the GTL language layer with vendor-specific runtime details.

This is especially important for:

- cloud-native execution across multiple providers
- use of orchestration services such as AWS Step Functions
- use of model providers such as AWS Bedrock
- use of deterministic external calculation engines
- local partial hydration for development or GSDLC self-hosting
- large enterprise integration work, where environment binding is often half the delivery cost

The architectural rule is:

- `GTL` stays portable
- `ABG` stays the semantic execution engine
- environment binding is explicit hydration/integration, not hidden implementation glue

### Proposed Extension

ABG should be understood as having:

1. a native implementation surface
2. a capability-binding layer
3. an explicit hydration step into a target environment

Hydration is the process of binding an ABG-capable graph/runtime to concrete services and infrastructure.

Examples:

- local development runtime
- AWS Bedrock for model transport
- AWS Step Functions for orchestration
- a prebuilt tax or liquidity calculation engine
- queue, artifact, event, and approval services in a regulated production stack

### Constitutional Clarifications

1. GTL shall not encode cloud-vendor or service-vendor specifics as language semantics. Provider choice is a hydration concern, not a graph-language concern.
2. ABG shall remain the semantic source of truth for run identity, lineage, convergence, correction, supersession, and replayable provenance, even when execution is delegated to external orchestration services.
3. Environment binding shall be explicit and auditable. A hydrated runtime must record which abstract capabilities were bound to which concrete services, versions, and policies.
4. Integration is first-class work, not incidental deployment. Binding a workflow/runtime to real services, data contracts, auth, schedules, queues, stores, and calc engines is part of the modeled system.
5. Hydration is an optimization and deployment concern, but it must remain replayable provenance so the same logical runtime can be reconstructed in another environment.

### Concept Additions

Recommended first-class concepts:

- `ExecutionProfile`
  Declares environment/runtime choices such as provider family, orchestration mode, storage mode, and approval topology.

- `CapabilityBinding`
  Maps an abstract ABG capability to a concrete service.
  Examples:
  - `transport -> bedrock.claude-sonnet`
  - `orchestration -> aws.step_functions`
  - `calc_engine -> tax_engine_v3`
  - `artifact_store -> s3://...`
  - `event_store -> dynamodb://...`

- `HydratedRuntime`
  The result of applying an execution profile and capability bindings to an ABG-capable runtime.

- `HydrationProvenance`
  Durable record of the selected execution profile, service bindings, versions, validation results, and effective configuration.

### Provenance Extension

Hydration should produce explicit, replayable provenance at least equivalent to:

```python
runtime_hydrated{
  runtime,
  execution_profile,
  capability_bindings,
  environment,
  versions,
  validation_result,
}
```

For regulated domains, the provenance should also allow reconstruction of:

- which model/provider profile was used
- which calculation engine and version was used
- which orchestration backend executed the work
- which storage/event/approval services were bound
- which environment policy profile was in effect

### Use-Case Consequences

For GSDLC self-hosting and local bootstrap:

- partially built ABG can be hydrated into a local environment
- local hydration becomes a governed integration step, not ad hoc setup
- the same logical engine can later be rehydrated into cloud production

For enterprise off-the-shelf integration:

- the expensive integration phase becomes explicit system work
- bindings to auth, queues, storage, schedulers, calc engines, and approval services are modeled rather than hidden
- integration choices become reviewable and replayable instead of tribal knowledge

For resilient regulatory reporting:

- jurisdiction/profile/rule-specific execution can remain explicit
- deterministic calc engines can participate without becoming language semantics
- amendment/restatement and audit replay can reconstruct not only the workflow, but the environment that executed it

### Design Implication

This extension does not replace GTL/ABG separation.

It operationalizes it:

- `GTL` declares portable structure and explicit policy/materialization surfaces
- `ABG` provides native semantic execution
- hydration binds that semantic runtime to an environment for local, cloud, or regulated deployment

This makes environment rehydration a controlled optimization rather than a hidden rewrite of the system.

### Recommended Follow-on

These clarifications should feed into:

- GTL requirement additions for explicit execution-profile and materialization surfaces
- ABG requirements for capability binding, hydration provenance, and environment replay
- product scenarios proving a single logical workflow can be hydrated into:
  - local development
  - cloud-native production
  - regulated reporting environments with deterministic external engines

