# REVIEW: Response to Pluggable Graph Synthesis, Selection, and Evaluator IoC Strategy

**Author**: claude (incorporating jim's comments)
**Date**: 2026-03-26T17:19:36+11:00
**Responds to**: `codex/20260326T161806_STRATEGY_pluggable-graph-synthesis-selection-and-evaluator-ioc.md`
**Status**: Review complete — framing accepted with corrections and reframing

---

## Jim's Position: Competitors Are Targets, Not Just Rivals

Workflow orchestration tools (Temporal, Camunda, LangGraph, CrewAI, Step Functions, etc.) are not only competitors. They are **target deployment substrates** for ABG in the cloud.

When you study how Temporal builds dynamic graphs through child workflows, signals, retries, and durable state, you're answering two questions simultaneously:

1. **Engine question**: What must ABG know how to realize robustly?
2. **Language question**: What shape must GTL have to project onto engines like these without collapsing its semantics?

This means research on these systems is **constitutional input** — empirical pressure on both ABG runtime law and GTL abstraction quality. Not a market scan.

The goal is best-of-breed robust solutions. These systems reveal:
- Where graph growth belongs (language vs. runtime)
- What must be first-class in GTL
- What must be explicit rather than hidden in engine code
- Future mapping targets for GTL → cloud-native engines
- Proof that the language is not overfit to the first engine

---

## Competitive Landscape Findings

### The field (18 products across 5 categories)

| Category | Products |
|----------|----------|
| Traditional orchestration | Airflow, Temporal, Prefect, Dagster, Argo, Control-M |
| AI agent frameworks | LangGraph, CrewAI, AutoGen/AG2, DSPy |
| ML pipelines | Kubeflow, MLflow, Metaflow |
| Process/BPM | Camunda, Netflix Conductor |
| Emerging | Flyte, Windmill, Inngest |

### Best-in-class per capability

| Capability | Best-in-class | Mechanism |
|---|---|---|
| Graph composition | Dagster (`@graph`), Camunda (BPMN Call Activity) | Declarative typed graph, not Python imports |
| Runtime graph synthesis | Flyte (`@dynamic`) | Generates new DAGs at runtime from code |
| Evaluator IoC | Camunda (External Task / Job Worker) | Process says WHAT, worker says HOW |
| Event-sourced replay | Temporal | Full event history *is* the execution mechanism |
| Evaluator taxonomy | Nobody | All competitors treat checks as one kind |
| Convergence/gradient | Nobody | Pass/fail per step, no iterative convergence |

### The gap nobody fills

No competitor combines all four of:
1. Consumer-pluggable graph topology selection (not just code branching)
2. Evaluator regime taxonomy with escalation (F_D → F_P → F_H)
3. Event-sourced domain provenance (not just execution logs)
4. Convergence-driven iteration (delta → 0, not run-once-succeed-or-fail)

Each exists in isolation somewhere. The composition is novel.

### Closest architectural peers

1. **Temporal** — event-sourced, durable, typed interfaces. No evaluator taxonomy, no graph-as-data, no convergence.
2. **Camunda** — BPMN graph semantics, Job Worker evaluator IoC, DMN decisions. No event sourcing, no convergence, no F_P regime.
3. **LangGraph** — graph-as-data, routing function IoC, human-in-the-loop. No evaluator taxonomy, snapshot-based.
4. **Flyte** — `@dynamic` runtime graph synthesis, typed contracts, content-addressable cache. No evaluator IoC, no convergence.
5. **Dagster** — `@graph` composition, `@asset_check`, append-only event log. No dynamic selection, no human gates.

---

## Technical Review of the Codex Strategy Post

### Accepted

- The IoC framing (GTL = language, ABG = host loop, consumer = hooks) is correct
- The four-part surface (synthesis hook, lawful application, evaluator attestation, replayable provenance) is well-bounded
- The "what this is not" section correctly prohibits contamination
- "Do not jump straight to code" — correct process

### Corrections needed

1. **Overclaims existing capability**: Lines 137-138 list `recurse` and "higher-order graph operators" as existing. They don't exist. Live algebra: `edge`, `compose`, `substitute`, `identity`, `same_object`. Already corrected in bootloader v2.1.0.

2. **Undersells what already exists**: ABG already has two consumer callback hooks:
   - `on_fp_dispatch(bound_job) → None` — pluggable F_P actor dispatch
   - `on_leaf_dispatch(task, input) → (output, failure)` — pluggable leaf task dispatch
   - Plus dynamic Module loading via `genesis.yml` runtime contract
   The post should build on these, not write as if nothing exists.

3. **"Mostly a closure/proof gap" undersells the work**: Today's selection is deterministic single-match pattern matching. Consumer-pluggable synthesis with multi-candidate choice and evaluator attestation is new capability.

### Reframing via competitive analysis

The Codex proposal maps directly onto competitive gaps:

- **Graph synthesis/selection hook** — only Flyte `@dynamic` does runtime graph synthesis, and it's code-generated not registry-selected. ABG's profile mechanism is already a topology selector no competitor offers.
- **Lawful application surface** — Camunda's Job Worker is the reference model for "engine hosts, consumer decides."
- **Evaluator attestation hook** — nobody has this with a formal taxonomy.
- **Replayable provenance** — only Temporal does event-sourced replay, and only for execution events.

### 1.0 gate recommendation

Accept the framing. The four-part surface is the right architecture.

The 1.0 gate question: does ABG need to prove full multi-consumer IoC end-to-end, or can 1.0 ship with hook points defined and tested, GSDLC as the single consumer proof, and full IoC proven in 1.1? That is a product decision.

---

## Disposition

- **Codex strategy framing**: Accepted with corrections above
- **Recommended next step**: Intent delta + requirement wording (per Codex recommendation)
- **Competitive research**: Treat as constitutional input, not market scan — these systems reveal what GTL must express and what ABG must realize

---

## Verbatim Exchange (jim + codex)

> **jim**: workflow tools are targets to build more robust ABG in the cloud for example, in answering how temporal allows the build of dynamic graphs, gives us an insight in the shape and functions of GTL

> **codex**: Exactly.
>
> Those systems are not only competitors. They are also reference engines that reveal what a real execution substrate needs in practice.
>
> So when you study Temporal, CrewAI, LangGraph, Camunda, Step Functions, you are really asking two different questions:
>
> - **engine question**: what must ABG know how to realize robustly?
> - **language question**: what shape must GTL have to project onto engines like these without collapsing its semantics?
>
> If Temporal can realize dynamic graph growth through child workflows, signals, retries, durable state, then that tells you something about the runtime shape ABG needs — but it also tells you something about GTL:
> - where graph growth belongs
> - what must be first-class in the language
> - what must be explicit rather than hidden in engine code
>
> So the competitors/targets give you:
> - empirical pressure on ABG runtime law
> - empirical pressure on GTL abstraction quality
> - future mapping targets
> - proof that the language is not overfit to your first engine
>
> That is a very strong framing. It means research on these systems is not "market scan" only. It is constitutional input.

> **jim**: yeah i'm looking for best of breed robust solns

---

## GTL Delta Table: Capabilities Missing vs Competitive Best-of-Breed

GTL-focused. ABG picks up whatever GTL defines — the language leads.

### GTL has today

| Surface | What exists |
|---------|-------------|
| **Types** | Graph, Node, GraphVector, Context, Operator, Evaluator, Rule, GraphFunction, Job, Role, ContractRef, Module, ModuleImport |
| **Algebra** | `edge`, `compose`, `substitute`, `identity`, `same_object` |
| **Regime taxonomy** | F_D, F_P, F_H (marker classes) |
| **Interface contracts** | GraphFunction.inputs/outputs, Graph.inputs/outputs |
| **Binding** | Operator.binding, Evaluator.binding (URI strings) |
| **Identity** | Auto-minted uuid4, compare=False, id-based reference |
| **Multi-input** | GraphVector.source accepts tuple[Node, ...] (join) |

### Hard deltas — what GTL cannot express

| # | Capability | Best-of-breed reference | GTL today | Delta to GTL | Priority |
|---|-----------|------------------------|-----------|-------------|----------|
| **D1** | **Conditional routing** — a vector that activates based on a predicate over state | LangGraph `add_conditional_edges(routing_fn, path_map)`, Camunda XOR/OR gateways with FEEL expressions | GraphVector is unconditional — every vector from a node is always admissible | Add `guard` field to GraphVector (predicate declaration) or a `ConditionalVector` variant. The guard is a *declaration* — ABG evaluates it. GTL just says "this transition has a condition." | **High** — without this, every graph is a fixed pipeline. No branching. |
| **D2** | **Dynamic fan-out** — one node produces N parallel work items at runtime based on data | Flyte `@dynamic`, Conductor `FORK_JOIN_DYNAMIC`, Kubeflow `ParallelFor`, Dagster `DynamicOutput` | GraphVector supports multi-input join (tuple source) but no fan-out. Graph topology is static at definition time. | Add `fan_out(node, item_schema) → GraphVector` algebra op or a `multiplicity` field on GraphVector declaring "this vector spawns N instances." Fan-in exists (tuple source). Fan-out is missing. | **High** — every real workflow has "for each item, do X." GTL can't express it. |
| **D3** | **Runtime graph synthesis** — a consumer-provided function builds or selects a sub-graph at execution time | Flyte `@dynamic` (generates new DAGs from code), Camunda DMN-driven routing | `substitute()` replaces a vector with a known inner graph at *definition time*. No mechanism for "resolve this at runtime." | Add a `DeferredGraph` or `SynthesisPoint` declaration — a node/vector that declares "a consumer function will produce the sub-graph here, subject to these interface constraints." ABG realizes the synthesis; GTL declares where it's allowed and what the contract is. | **High** — this is the core of the Codex proposal. Without it, GSDLC is monolithic. |
| **D4** | **Consumer-pluggable selection** — when multiple graph functions match a contract, a consumer-provided function chooses | LangGraph `routing_fn`, AutoGen `selector_func`, Camunda DMN decision tables | `enumerate_candidates()` returns matches; ABG auto-selects if exactly 1. No multi-candidate selection contract. | Add `SelectionPolicy` declaration on GraphVector or Module — declares how to choose among multiple candidates (first-match, scored, consumer-function, DMN-like table). GTL declares the policy shape; ABG and consumers realize it. | **High** — profiles (standard/poc/hotfix) are a primitive version of this. Needs to be first-class. |
| **D5** | **Evaluator composition** — AND/OR/sequence combinators over evaluators | AutoGen composable `TerminationCondition` with `\|` and `&` operators | Evaluators are a flat tuple on GraphVector. No declared composition order or logic. ABG runs them sequentially (F_D first, then F_P, then F_H). | Add `EvaluatorGroup` or composition operators: `all_of(ev1, ev2)`, `any_of(ev1, ev2)`, `sequence(ev1, then: ev2)`. Or declare evaluation strategy on the vector: `evaluation: {strategy: "all", order: "regime-ascending"}`. | **Medium** — current flat-list + regime ordering works for GSDLC. Matters when contracts have complex acceptance criteria. |
| **D6** | **Recursion / fixed-point** — a graph function that invokes itself with a termination condition | Temporal child workflows calling themselves, LangGraph cycles via conditional edges | Bootloader says "recursion-capable" but `recurse` does not exist. `compose` is strictly sequential. No self-reference. | Add `recurse(gf, termination) → GraphFunction` that declares "apply gf repeatedly until termination evaluator passes." The termination condition is an Evaluator (fits F_D/F_P/F_H taxonomy). GTL declares the recursion; ABG bounds and realizes it. | **Medium** — needed for iterative refinement workflows (the iterate loop itself is recursive, but GTL can't express that as a graph). |
| **D7** | **Signals / event-wait** — a vector that blocks until an external event arrives | Temporal `workflow.await(signal)`, Inngest `step.waitForEvent()`, Camunda intermediate catch events | Context is snapshot-bound (read at bind time). No mechanism for "wait for a future event." | Add `Signal` type or an `await` field on GraphVector declaring "this transition requires an external event matching this schema before proceeding." Distinct from F_H (human judgment) — signals are data arrival, not approval. | **Medium** — needed for event-driven workflows. Current GSDLC is request-driven so not blocking, but cloud deployment will need it. |
| **D8** | **Timeout / deadline declarations** — time bounds on vectors, jobs, or graphs | Temporal activity/workflow timeouts, Camunda timer boundary events, Control-M SLA management | No time declarations anywhere in GTL. ABG has hardcoded 120s timeout in subprocess dispatch. | Add optional `timeout` / `deadline` fields on GraphVector, Job, or Operator. GTL declares the time contract; ABG enforces it. Distinct from retry (which is ABG policy). | **Medium** — needed for SLA-driven workflows. Currently hardcoded in ABG. |
| **D9** | **Structured human gate input** — declaring what information F_H collects | Camunda User Tasks with BPMN form definitions, Windmill approval steps with typed inputs | F_H Evaluator declares regime but not *what* the human provides. No form schema, no structured input contract. | Add `input_schema` field to Evaluator (or specifically to F_H evaluators) declaring the structured data the human gate collects. E.g., `{"decision": "approve\|reject", "rationale": "string", "conditions": "list[string]"}`. | **Low** — current F_H works via event stream (emit approved/rejected). Structured input becomes important when multiple humans or audit is required. |
| **D10** | **Cross-module invocation** — a graph function in module A invokes a function from module B at runtime | Camunda Call Activity (by process ID), Conductor SUB_WORKFLOW, Argo `templateRef` | ModuleImport declares cross-module references but no runtime invocation mechanism. ContractRef binds to a single target_id. | Add `ModuleRef` or extend ContractRef to support `kind: "graph_function"` with `module: "other_module"`. GTL declares the cross-module dependency; ABG resolves and invokes it. | **Low** — single-module GSDLC doesn't need this yet. Matters when multiple domain packages compose. |
| **D11** | **Graph/function versioning** — explicit version identity on reusable artifacts | Argo WorkflowTemplate versioning, MLflow model stages/aliases, Conductor task definition versions | Module.metadata is an untyped dict. No version field on GraphFunction. ModuleImport has `version` but it's a string with no semantics. | Add `version` field to GraphFunction and Module (semantic versioning). Add version constraint to ModuleImport (e.g., `>=1.0, <2.0`). GTL declares version contracts; ABG enforces compatibility at bind time. | **Low** — matters for multi-consumer ecosystems. Single-consumer GSDLC can defer. |
| **D12** | **Retry policy declarations** — how many times and under what conditions to retry a failed vector | Temporal retry policies (max attempts, backoff, non-retryable errors), Metaflow `@retry`, Argo `retryStrategy` | No retry declaration in GTL. ABG's iterate loop is the retry mechanism but it's not declared in the graph. | Add optional `retry` field on GraphVector or Operator: `{max_attempts: N, backoff: "exponential", retryable_failures: ["transport", "timeout"]}`. Or keep as ABG-only policy — retry may be purely runtime. | **Low** — arguably ABG territory. But declaring retry *eligibility* in the graph (this vector is retryable vs. this one is not) belongs in GTL. |

### Priority summary

| Priority | Deltas | Theme |
|----------|--------|-------|
| **High** | D1 (conditional routing), D2 (fan-out), D3 (runtime synthesis), D4 (selection policy) | GTL cannot express non-linear, dynamic, or consumer-driven graphs |
| **Medium** | D5 (evaluator composition), D6 (recursion), D7 (signals), D8 (timeouts) | GTL cannot express iteration, event-driven, or time-bounded contracts |
| **Low** | D9 (structured F_H input), D10 (cross-module), D11 (versioning), D12 (retry) | Multi-consumer and operational maturity |

### Reading the table

- **High = GTL is overfit to the first engine without these.** Every competitor has conditional routing and fan-out. If GTL can't express them, it collapses to a fixed pipeline language.
- **Medium = GTL works for GSDLC without these, but can't project onto Temporal/Camunda/LangGraph.** These are the mapping-target deltas.
- **Low = ecosystem maturity.** Needed when multiple consumers or production SLAs exist.

---

## Codex Addendum: Hard Delta Function Legend

Use this legend when repricing the GTL delta table above.

### GTL delta scale

- `ΔG0` — already present in GTL; no language change, only proof/trace/cleanup
- `ΔG1` — wording / ownership / constraint clarification; no new GTL types
- `ΔG2` — extend GTL declaration surface (fields, contract refs, interfaces, metadata, hook contracts)
- `ΔG3` — add first-class GTL algebra or semantic law
- `ΔG4` — add a new GTL semantic subsystem

### ABG delta scale

- `ΔA0` — already present in ABG; no runtime change, only proof/trace/cleanup
- `ΔA1` — policy / provenance / trace / verification change
- `ΔA2` — extend an existing runtime module or service surface
- `ΔA3` — add a substantive runtime subsystem or cross-module execution capability
- `ΔA4` — major runtime architecture change

Short reading:

- most of the interesting near-term pressure is `ΔG2` to `ΔG4`
- ABG should pick up the runtime consequences of what GTL makes explicit
- if a capability is primarily `ΔA3+` and only `ΔG0/1`, it is runtime robustness work, not a GTL blocker

For the fuller codex-oriented matrix with explicit GTL/ABG deltas per capability, see:

- `codex/20260326T161806_STRATEGY_pluggable-graph-synthesis-selection-and-evaluator-ioc.md`
