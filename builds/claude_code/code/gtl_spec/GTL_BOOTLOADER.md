# GTL Bootloader: Universal Constraint Context

**Version**: 2.0.0
**Domain-agnostic.** Domain packages (SDLC, data pipeline, etc.) extend this — they do not replace it.

---

## Primitives

| Primitive | What it is |
|-----------|-----------|
| **Graph** | Topology of typed nodes with admissible vector transitions |
| **Iterate** | `iterate(bound_job) → WorkSurface` — the only operation |
| **Evaluators** | Convergence tests: F_D (deterministic), F_P (agent), F_H (human) |
| **Spec + Context** | Constraint surface — what bounds construction |

GTL types: Module, Graph, Node, GraphVector, Context, Evaluator, Operator, Rule, GraphFunction, Job, Role, ContractRef. Everything else is parameterisation.

## Type Surface

| Type | Module | What it is |
|------|--------|-----------|
| **Graph** | `gtl.graph` | Named topology of nodes and vectors |
| **Node** | `gtl.graph` | Typed locus with markov conditions |
| **GraphVector** | `gtl.graph` | Admissible transition between nodes, carries evaluators |
| **Context** | `gtl.graph` | Externally-located, snapshot-bound constraint dimension |
| **Module** | `gtl.module_model` | Publication boundary — graphs + functions + jobs + roles + metadata |
| **GraphFunction** | `gtl.function_model` | Reusable graph template with typed ports |
| **Job** | `gtl.work_model` | Durable semantic work contract |
| **Role** | `gtl.work_model` | Semantic capability class for execution/approval |
| **ContractRef** | `gtl.work_model` | Indirection from Job to a GTL contract (e.g. GraphVector) |
| **Evaluator** | `gtl.operator_model` | Convergence test (F_D, F_P, or F_H regime) |
| **Operator** | `gtl.operator_model` | Named capability with regime and binding |
| **Rule** | `gtl.operator_model` | Declarative constraint with kind + config |
| **ExecutableJob** | `genesis.binding` | ABG runtime resolution of a GTL Job to a GraphVector |
| **Worker** | `genesis.binding` | ABG concrete actor identity with role binding |

## Evaluators and Escalation

| Evaluator | Regime | What it does |
|-----------|--------|-------------|
| **F_D** | Zero ambiguity | Pass/fail — tests, schema checks, tag verification |
| **F_P** | Bounded ambiguity | Agent disambiguates — gap analysis, code generation |
| **F_H** | Persistent ambiguity | Human judgment — approval, rejection |

Escalation: F_D → F_P (deterministic blocked). F_P → F_H (agent stuck). F_H → F_D (approved → deploy).

## Event Stream

- Nodes are projections: `project(EventStream[0..n], node_type, instance_id)`
- **Determinism**: `project(S, T, I) = project(S, T, I)` always.
- **emit() is the only write path.** event_time is system-assigned at append.
- **F_P does NOT call the event logger.** F_P produces artifacts; F_D reads them and emits events.
- Recovery is replay. No state lost beyond current iterate() call.

## Gradient

`delta(state, constraints) → work`. When delta = 0, system is at rest. Same computation at every scale — single iteration, vector convergence, feature traversal, production.

## Territories

| Territory | What | Rule |
|-----------|------|------|
| `.genesis/` | ABG engine (installed) | **Never edit directly.** Updated only by ABG installer. |
| `<domain>/release/` | Domain package (installed) | **Never edit directly.** Updated only by domain installer. |
| `specification/` | Authored spec | Editable — intent, requirements, standards. |
| `builds/` | Authored source | Editable — implementation, tests, design. |
| `.ai-workspace/` | Runtime state | Events, features, comments — territory-partitioned by agent. |

## Cascade Chain

Source → installer → installed territory. Order: **ABG → domain package → dependents** (never ABG direct to dependents).

## F_P Dispatch Contract

The manifest JSON at `fp_manifest_path` is the authoritative dispatch contract. It carries structured fields (source/target nodes, markov conditions, evaluators, contexts, delta). The prompt field is a human-readable render. CLAUDE.md is transport convenience — the manifest must be sufficient alone.

## Invariants

| Invariant | What breaks if absent |
|-----------|----------------------|
| Graph with typed vector transitions | No structure — ad hoc work |
| Iterate loop producing events | No quality signal — one-shot |
| At least one evaluator per vector | No stopping condition |
| Spec + Context bounds construction | Degeneracy, hallucination |
| Event stream — append-only, no timestamp override | No replay, no recovery |
| Completeness visibility before downstream | Silent convergence — untrusted |
