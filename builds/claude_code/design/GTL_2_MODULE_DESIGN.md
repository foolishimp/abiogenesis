# GTL 2.x / ABG Module Design

**Status**: Accepted
**Date**: 2026-03-26
**Purpose**: Translate GTL 2.x constitutional law into concrete module boundaries, detailed domain model, dependency rules, and an implementation-ready module plan for the Claude build.

**Derived from**:
- [GTL_2_CONSTITUTIONAL_DESIGN.md](../../specification/GTL_2_CONSTITUTIONAL_DESIGN.md)
- [specification/requirements/](../../specification/requirements/)
- [ADR-022](adrs/ADR-022-subprocess-transport-with-env-sanitization.md)
- [ADR-030](adrs/ADR-030-job-role-worker-run-binding.md)

---

## 1. Position

This document is the intermediate step between design and code.

It does not create new constitutional law. It answers:

- given the GTL 2.x constitution and the ABG target engine contract,
- what are the concrete module boundaries,
- what are the detailed types,
- and how should the current codebase be decomposed?

In this Claude build, the conceptual `abg.*` runtime layer is implemented under the `genesis/*` namespace.

---

## 2. Design Rules

1. GTL modules must not import ABG modules.
2. ABG core may import GTL declarations, but GTL may not depend on ABG runtime types.
3. Product policy and CLI behavior must not leak into GTL core modules.
4. Transport is replaceable behind an ABG runtime boundary.
5. `Graph` is public ontology; `GraphVector` is implementation structure.
6. `Role` and `Job` are GTL declaration types. `Worker`, `ExecutableJob`, `WorkSurface`, `RunState`, and `LeafTask` are ABG runtime types. `WorkInstance` is a helper view over work identity in this build.
7. Provenance recording is an engine obligation even when the language requires provenance-carrying structure.
8. Higher-order operations belong to GTL semantics, but their realization belongs to ABG.
9. `Worker.can_execute` remains the executable capability and scheduling surface in this build; roles are additive, not a replacement.
10. Evaluator/convergence truth remains on GTL graph contracts. GTL `Job` does not create a second evaluator surface.
11. If two runtime structures differ only by lifecycle phase, they collapse into one type plus `RunState.state` and immutable `WorkSurface` unless they introduce distinct semantics.
12. If two public concepts are directly isomorphic, the build keeps one canonical concept and expresses the other as sugar, configuration, or helper structure.
13. `work_key` is the canonical ABG work identity. `feature` is application-facing sugar over `work_key`.
14. `vector_id` is the canonical runtime contract handle. `edge` or `vector_name` are readability fields only.
15. `PrecomputedManifest`, `WorkInstance`, `SelectionResult`, and `AgentResult` are helper shapes unless a requirement explicitly promotes them to public runtime ontology.

---

## 3. Target Module Stack

### 3.1 GTL language layer

| Target module | Owns | Primary types / functions | Requirement families |
| --- | --- | --- | --- |
| `gtl.graph` | Graph structure | `Graph`, `Node`, `GraphVector`, `Context` | REQ-L-GTL2-GRAPH, REQ-L-GTL2-NODE, REQ-L-GTL2-INTERFACE |
| `gtl.operator_model` | Effect and convergence declarations | `Operator`, `Evaluator`, `Rule`, `Regime` (F_D/F_P/F_H) | REQ-L-GTL2-OPERATOR, REQ-L-GTL2-EVALUATOR, REQ-L-GTL2-RULE |
| `gtl.function_model` | Reusable workflow programs | `GraphFunction`, `GraphTemplate` | REQ-L-GTL2-GRAPHFUNCTION |
| `gtl.work_model` | Semantic work declarations | `ContractRef`, `Role`, `Job` | REQ-L-GTL2-ROLE, REQ-L-GTL2-JOB, REQ-L-GTL2-IDENTITY |
| `gtl.algebra` | Graph algebra | `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `identity` | REQ-L-GTL2-COMPOSE, REQ-L-GTL2-SUBSTITUTE, REQ-L-GTL2-RECURSE, REQ-L-GTL2-HOF, REQ-L-GTL2-LAWS |
| `gtl.module_model` | Publication and imports | `Module`, `ModuleImport` | REQ-L-GTL2-MODULE, REQ-L-GTL2-SELECTION-BOUNDARY, REQ-L-GTL2-ENGINE-INDEPENDENCE |

### 3.2 ABG engine kernel

| Target module | Owns | Primary types / functions | Requirement families |
| --- | --- | --- | --- |
| `abg.events` | Append-only event substrate | `EventStream`, `emit()`, event schema helpers | REQ-R-ABG2-EVENTS |
| `abg.projection` | Pure replay | `project()`, derived truth folds | REQ-R-ABG2-PROJECTION |
| `abg.binding` | Executable job resolution, deterministic precomputation, worker capability, role binding, immutable execution surfaces | `ExecutableJob`, `WorkSurface`, `Worker`, preparation helpers, `bind_fd()`, `bind_fp()`, `bind_fh()`, executable-job hashes | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-WORKER, REQ-R-ABG2-BINDING, REQ-R-ABG2-PROVENANCE |
| `abg.lineage` | Work identity and parent/child | `spawn()`, `fold_back()`, `_discover_children()`, lineage queries, work-identity helpers | REQ-R-ABG2-LINEAGE |
| `abg.run` | Execution attempts | `RunState`, `run_state()`, `find_pending_run()`, `supersede_run()` | REQ-R-ABG2-RUN |
| `abg.convergence` | Delta and convergence | `delta()`, `parent_converged()`, convergence visibility | REQ-R-ABG2-CONVERGENCE |
| `abg.selection` | Candidate enumeration and validation | `SelectionDecision`, candidate discovery, selection validation | REQ-R-ABG2-SELECTION-APPLICATION |
| `abg.provenance` | Spec/workflow/selection provenance | `req_hash()`, `executable_job_hash()`, workflow version reads, carry-forward | REQ-R-ABG2-PROVENANCE |
| `abg.correction` | Correction and reset | `find_latest_reset()`, certification shadowing | REQ-R-ABG2-CORRECTION |
| `abg.subwork` | Bounded sub-work realization | `LeafTask`, `validate_leaf_schema()`, `dispatch_leaf()` | REQ-R-ABG2-LEAFTASK |
| `abg.transport` | Agent transport surface | `AgentTransportError`, `dispatch_agent()`, `classify_failure()`, transport-local result helpers | REQ-R-ABG2-TRANSPORT, ADR-022 |
| `abg.interpret` | Graph interpretation loop | graph materialization, traversal, next-action, substitution orchestration, event emission for delegated modules | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-SELECTION-APPLICATION (apply + emit) |
| `abg.selfhosting` | Derived artifact governance | bootloader consistency checks, drift detection | REQ-R-ABG2-SELFHOSTING |

### 3.3 ABG application surface

| Target module | Owns | Primary types / functions | Notes |
| --- | --- | --- | --- |
| `abg.services` | Named app services | `Scope`, `gen_gaps()`, `gen_iterate()`, `gen_start()` | Orchestrates kernel modules |
| `abg.cli` | CLI adapter | `_build_parser()`, command wiring, traceability checks | Implementation surface only |
| `abg.install` | Bootstrap/install | Installer, workspace scaffolding, `workspace_bootstrap()` | Implementation surface only |

### 3.4 Engine mapping layer

| Target module | Owns | Primary types / functions | Requirement families |
| --- | --- | --- | --- |
| `mapping.capability` | Capability profiles | Engine capability descriptions | REQ-M-GTL2-CAPABILITY |
| `mapping.adapter` | Alternate engine mappings | ABG, Temporal, Prefect adapters | REQ-M-GTL2-MAPPING |
| `mapping.provenance` | Mapping provenance | Engine identity/version/capability tags | REQ-M-GTL2-PROVENANCE |

---

## 4. GTL Domain Model

### 4.1 Types

```python
# gtl.graph

@dataclass(frozen=True)
class Node(Generic[T]):
    name: str
    schema: type[T] | str    # concrete type or URI; Vector[T] expressed here
    markov: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)

@dataclass(frozen=True)
class GraphVector:
    """Internal adjacency record. Not public ontology."""
    name: str
    source: Node
    target: Node
    id: str = field(default_factory=_mint_id, compare=False)
    operators: tuple[Operator, ...] = ()
    evaluators: tuple[Evaluator, ...] = ()
    contexts: tuple[Context, ...] = ()
    rule: Rule | None = None
    allows_subwork: bool = False
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class Context:
    name: str
    locator: str             # scheme://path
    digest: str              # content hash for snapshot binding

@dataclass(frozen=True)
class Graph:
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    nodes: tuple[Node, ...]
    vectors: tuple[GraphVector, ...]
    id: str = field(default_factory=_mint_id, compare=False)
    contexts: tuple[Context, ...] = ()
    rules: tuple[Rule, ...] = ()
    effects: tuple[Regime, ...] = ()
    tags: tuple[str, ...] = ()
```

```python
# gtl.operator_model

class Regime:
    """Base for F_D, F_P, F_H."""

class F_D(Regime): ...      # deterministic
class F_P(Regime): ...      # probabilistic
class F_H(Regime): ...      # human/judgment

@dataclass(frozen=True)
class Operator:
    name: str
    regime: type[Regime]
    binding: str             # plugin URI
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class Evaluator:
    name: str
    regime: type[Regime]
    description: str = ""
    binding: str
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class Rule:
    name: str
    kind: str                # "consensus", "coverage", "policy", etc.
    config: dict = field(default_factory=dict)
    tags: tuple[str, ...] = ()
```

```python
# gtl.function_model

@dataclass(frozen=True)
class GraphFunction:
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    template: Callable[..., Graph] | str  # callable DSL or serializable graph-template reference
    id: str = field(default_factory=_mint_id, compare=False)
    effects: tuple[type[Regime], ...] = ()
    tags: tuple[str, ...] = ()
```

```python
# gtl.work_model

@dataclass(frozen=True)
class ContractRef:
    kind: str                  # current build: "graph_vector"
    target_id: str

@dataclass(frozen=True)
class Role:
    name: str
    tags: tuple[str, ...] = ()
    policy_hooks: dict = field(default_factory=dict)
    id: str = field(default_factory=_mint_id, compare=False)

@dataclass(frozen=True)
class Job:
    name: str
    contracts: tuple[ContractRef, ...]
    roles: tuple[Role, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

```python
# gtl.module_model

@dataclass(frozen=True)
class ModuleImport:
    source: str              # module name
    names: tuple[str, ...]   # imported declaration names
    version: str = ""

@dataclass(frozen=True)
class Module:
    name: str
    graphs: tuple[Graph, ...] = ()
    graph_functions: tuple[GraphFunction, ...] = ()
    jobs: tuple[Job, ...] = ()
    roles: tuple[Role, ...] = ()
    operators: tuple[Operator, ...] = ()
    evaluators: tuple[Evaluator, ...] = ()
    rules: tuple[Rule, ...] = ()
    imports: tuple[ModuleImport, ...] = ()
    metadata: dict = field(default_factory=dict)
```

### 4.2 DSL sugar

```python
# gtl.algebra (public convenience)

def edge(source: Node, target: Node, *, operators=(), evaluators=(), **kw) -> Graph:
    """Construct a minimal one-vector graph."""

def compose(f: GraphFunction, g: GraphFunction) -> GraphFunction:
    """Sequential composition when f.outputs satisfy g.inputs."""

def substitute(outer: Graph, contract_vector: str, inner: Graph) -> Graph:
    """Replace a coarse contract step with an interface-compatible inner graph."""

def recurse(graph: Graph, lineage: str) -> Graph:
    """Express that graph application may induce child graph applications."""

def fan_out(f: GraphFunction) -> GraphFunction:
    """Apply f across a Vector[T] input."""

def fan_in(reducer: GraphFunction) -> GraphFunction:
    """Reduce branch outputs into one synthesized result."""

def gate(rule: Rule, evaluator: Evaluator | None = None) -> GraphFunction:
    """Block continuation until rule/evaluator is satisfied."""

def promote(source_schema: str, target_schema: str) -> GraphFunction:
    """Lift one representation into another."""

def identity(interface: tuple[Node, ...]) -> GraphFunction:
    """Identity graph function preserving interface."""
```

### 4.3 Notes

- `Node[T]` preserves `Generic[T]` parameterization. `Vector[T]` is expressed as `Node[Vector[T]]` via the schema parameter. No separate structural type.
- `GraphFunction.template` accepts both `Callable[..., Graph]` (Python DSL convenience) and serializable `str` references. The semantic contract is "materializable graph template."
- `gtl.work_model.Job` is the durable semantic work contract. In this build, `ContractRef(kind=\"graph_vector\")` is the supported steady-state target.
- Roles are declared on jobs in this build. Direct role attachment on graph contracts is deferred until precedence semantics are ratified.
- `edge()` returns `Graph`. `GraphVector` remains the internal contract-step record.
- `GraphVector` is internal — not exported from `gtl.graph.__init__` unless needed by engine internals.
- `Consensus` is not a GTL type. Consensus thresholds are expressed inline in `Rule.config`.
- `work_key` is the canonical runtime work identity. `feature` is an application alias over the same identity.
- `vector_id` is the canonical runtime handle for a contract step. `edge` and `vector_name` are additive readability fields only.
- `PrecomputedManifest`, `WorkInstance`, `SelectionResult`, and `AgentResult` are helper shapes, not prime public ontology.

### 4.4 Event delegation pattern

`abg.selection` and `abg.subwork` are pure kernel modules — they return structured values but do not emit events themselves. Event emission is the responsibility of `abg.interpret`, which has access to `abg.events` via its `abg.*` import rule.

`abg.services` does not emit events directly — it orchestrates through `abg.interpret`, which owns the event emission path.

This follows the same principle as the F_P contract: "F_P does not call the event logger. F_P produces artifacts; F_D reads them and emits events."

Concretely:
- `abg.selection` returns `SelectionDecision` → `abg.interpret` emits `workflow_selected` event
- `abg.subwork.dispatch_leaf()` returns `(output, failure_class)` → `abg.interpret` emits `leaf_task_started`/`completed`/`failed`

**Selection responsibility split**: `abg.selection` owns candidate enumeration and interface validation (REQ-R-ABG2-SELECTION-APPLICATION-001, -003, -004). `abg.interpret` owns lawful application — performing the substitution and emitting the selection provenance event (REQ-R-ABG2-SELECTION-APPLICATION-002).

---

## 5. ABG Runtime Model

### 5.1 Types

```python
# abg.events
class EventStream:
    path: Path
    workflow_version: str
    work_key: str
    run_id: str

# abg.binding
@dataclass
class PrecomputedManifest:
    executable_job: ExecutableJob
    current_state: dict
    failing_evaluators: list[Evaluator]
    passing_evaluators: list[Evaluator]
    fd_results: dict
    relevant_contexts: dict
    missing_contexts: list[str]
    delta_summary: str

@dataclass
class ExecutableJob:
    job: gtl.work_model.Job
    vector: GraphVector

    @property
    def evaluators(self) -> tuple[Evaluator, ...]:
        return self.vector.evaluators

    @property
    def source_type(self) -> Node | tuple[Node, ...]:
        return self.vector.source

    @property
    def target_type(self) -> Node:
        return self.vector.target

@dataclass(frozen=True)
class WorkSurface:
    surface_id: str
    run_id: str | None
    job_id: str | None
    worker_id: str | None
    role_id: str | None
    stage: str               # prepared|dispatched|pending|assessed|approved|failed|timed_out|superseded
    context_consumed: tuple[Context, ...] = ()
    context_emitted: tuple[Context, ...] = ()
    artifacts: tuple[str, ...] = ()
    findings: tuple[dict, ...] = ()
    attestations: tuple[dict, ...] = ()
    metadata: dict = field(default_factory=dict)

@dataclass
class Worker:
    id: str
    can_execute: list[ExecutableJob]
    role_ids: tuple[str, ...] = ()
    authority_ref: str | None = None

# abg.lineage
@dataclass(frozen=True)
class WorkInstance:
    """Helper view over one work identity before/alongside run realization."""
    executable_job: ExecutableJob
    work_key: str
    run_id: str

# abg.run
@dataclass(frozen=True)
class RunState:
    work_key: str
    run_id: str
    job_id: str
    vector_id: str
    worker_id: str | None
    role_id: str | None
    authority_ref: str | None
    state: str               # queued|started|dispatched|pending|assessed|failed|timed_out|superseded
    failure_class: str
    attempt_number: int
    superseded_by: str

# abg.subwork
@dataclass(frozen=True)
class LeafTask:
    name: str
    input_schema: dict
    output_schema: dict
    timeout_ms: int = 30_000
    tools_allowed: bool = False

# abg.transport
@dataclass
class AgentResult:
    """Transport-local helper result — not prime runtime ontology."""
    stdout: str
    stderr: str
    returncode: int
    agent: str
    timed_out: bool

class AgentTransportError(Exception): ...

# abg.selection
@dataclass(frozen=True)
class SelectionDecision:
    contract_id: str
    work_key: str
    graph_function: str
    selected_by: str
    selection_mode: str
    rationale: str

# abg.services
@dataclass
class Scope:
    module_ref: str
    workspace_root: Path
    work_key: str
    vector_id: str
    build: str
    worker_ref: str
    workflow_version: str
    run_id: str
```

### 5.2 Canonical ABG runtime types

| Runtime type | Module | Rationale |
| --- | --- | --- |
| `ExecutableJob` | `abg.binding` | Executable resolution of one GTL job to one graph-vector contract |
| `Worker` | `abg.binding` | Concrete actor identity with executable capability, role ids, and authority hook |
| `WorkSurface` | `abg.binding` | Immutable execution dossier, elastic context carrier, and audit surface |
| `RunState` | `abg.run` | Execution-attempt lifecycle truth |
| `SelectionDecision` | `abg.selection` | Lawful selection/application decision |
| `LeafTask` | `abg.subwork` | Bounded delegated sub-work |
| `Scope` | `abg.services` | Named application/service boundary |

### 5.3 Canonical GTL declaration interpretations

| Concept | GTL surface | Module | Note |
| --- | --- | --- | --- |
| Structural locus | `Node` | `gtl.graph` | Typed graph-local semantic locus |
| Minimal contract step | `GraphVector` | `gtl.graph` | Internal adjacency contract; not rival public ontology |
| Publication boundary | `Module` | `gtl.module_model` | Named, composable declaration boundary |
| Semantic capability | `Role` | `gtl.work_model` | Language-owned capability class |
| Semantic work contract | `Job` | `gtl.work_model` | Durable work declaration that binds to GTL contracts |

---

## 6. Canonical Claude Build File Ownership

### 6.1 GTL language files

| Concrete file | Conceptual module | Owns |
| --- | --- | --- |
| `gtl/graph.py` | `gtl.graph` | `Graph`, `Node`, `GraphVector`, `Context` |
| `gtl/operator_model.py` | `gtl.operator_model` | `Operator`, `Evaluator`, `Rule`, `Regime` |
| `gtl/function_model.py` | `gtl.function_model` | `GraphFunction`, graph templates |
| `gtl/work_model.py` | `gtl.work_model` | `ContractRef`, `Role`, `Job` |
| `gtl/algebra.py` | `gtl.algebra` | compose/substitute/recurse/fan-out/fan-in/gate/promote |
| `gtl/module_model.py` | `gtl.module_model` | `Module`, `ModuleImport` |
| `gtl/__init__.py` | public GTL surface | GTL-only exports |

### 6.2 ABG kernel files

| Concrete file | Conceptual module | Owns |
| --- | --- | --- |
| `genesis/binding.py` | `abg.binding` | `ExecutableJob`, `Worker`, `WorkSurface`, `PrecomputedManifest`, precomputation, prompt assembly |
| `genesis/run.py` | `abg.run` | `RunState`, reducers, pending detection, supersession |
| `genesis/convergence.py` | `abg.convergence` | delta and parent-convergence truth |
| `genesis/selection.py` | `abg.selection` | `SelectionDecision`, candidate enumeration, validation |
| `genesis/provenance.py` | `abg.provenance` | `req_hash()`, `executable_job_hash()`, workflow version reads, carry-forward |
| `genesis/correction.py` | `abg.correction` | correction and reset helpers |
| `genesis/subwork.py` | `abg.subwork` | `LeafTask`, schema validation, bounded dispatch |
| `genesis/fp_dispatch.py` | `abg.transport` | agent dispatch, transport classification, environment sanitization |
| `genesis/interpret.py` | `abg.interpret` | iterate, schedule, apply-selection, delegated-module event emission |

### 6.3 ABG application and bootstrap files

| Concrete file | Conceptual module | Owns |
| --- | --- | --- |
| `genesis/services.py` | `abg.services` | `Scope`, orchestration, service-level command flows |
| `genesis/cli_adapter.py` | `abg.cli` | parser, command wiring, traceability command adapters |
| `genesis/selfhosting.py` | `abg.selfhosting` | bootloader consistency and drift checks |
| `gen-install.py` | `abg.install` | workspace bootstrap and installer surface |
| `genesis/__init__.py` | public ABG surface | runtime identity and exported engine surface |

### 6.4 Authored module and bootloader surfaces

| Concrete file | Owns |
| --- | --- |
| `gtl_spec/packages/*.py` | authored `Module` declarations with explicit graphs, jobs, roles, operators, evaluators, and rules |
| `gtl_spec/GTL_BOOTLOADER.md` | bootloader-visible V2 type surface and self-hosting expectations |

---

## 7. Dependency Rules

### 7.1 Allowed dependencies (→ = "may import")

```
gtl.graph           → (stdlib only)
gtl.operator_model  → (stdlib only)
gtl.function_model  → gtl.graph, gtl.operator_model
gtl.work_model      → gtl.graph
gtl.algebra         → gtl.graph, gtl.operator_model, gtl.function_model
gtl.module_model    → gtl.graph, gtl.operator_model, gtl.function_model, gtl.work_model

abg.events          → (stdlib only)
abg.projection      → abg.events
abg.provenance      → abg.events
abg.correction      → abg.events
abg.binding         → abg.events, abg.projection, abg.provenance, gtl.graph, gtl.operator_model, gtl.work_model
abg.lineage         → abg.events
abg.run             → abg.events
abg.convergence     → abg.events, abg.binding, abg.lineage, abg.run, abg.correction
abg.selection       → gtl.graph, gtl.function_model, gtl.module_model  # returns SelectionDecision; caller emits events
abg.subwork         → abg.transport                                   # returns (output, failure_class); caller emits events
abg.transport       → (stdlib + subprocess only)
abg.interpret       → abg.*, gtl.*, (except abg.services, abg.cli, abg.install)
abg.selfhosting     → abg.events, abg.binding, gtl.graph

abg.services        → abg.interpret, abg.convergence, abg.provenance
abg.cli             → abg.services, abg.install
abg.install         → abg.events, gtl.module_model
```

### 7.2 Forbidden dependencies

- `gtl.*` must not import `abg.*`
- `abg.events` must not import `abg.services`
- `abg.transport` must not import CLI, product policy, or convergence logic
- `abg.cli` must not implement convergence, selection, or provenance logic
- No circular dependencies within `abg.*`

---

## 8. Module Boundaries by Requirement Ownership

| Module area | Owning requirement families |
| --- | --- |
| GTL graph kernel | REQ-L-GTL2-GRAPH, REQ-L-GTL2-NODE, REQ-L-GTL2-INTERFACE, REQ-L-GTL2-LAWS |
| GTL control/effect declarations | REQ-L-GTL2-OPERATOR, REQ-L-GTL2-EVALUATOR, REQ-L-GTL2-RULE |
| GTL graph programming | REQ-L-GTL2-GRAPHFUNCTION, REQ-L-GTL2-COMPOSE, REQ-L-GTL2-SUBSTITUTE, REQ-L-GTL2-RECURSE, REQ-L-GTL2-HOF, REQ-L-GTL2-SUBWORK |
| GTL work declarations | REQ-L-GTL2-JOB, REQ-L-GTL2-ROLE, REQ-L-GTL2-IDENTITY |
| GTL publication boundary | REQ-L-GTL2-MODULE, REQ-L-GTL2-SELECTION-BOUNDARY, REQ-L-GTL2-ENGINE-INDEPENDENCE |
| ABG event and replay kernel | REQ-R-ABG2-EVENTS, REQ-R-ABG2-PROJECTION |
| ABG interpretation kernel | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-CONVERGENCE, REQ-R-ABG2-SELECTION-APPLICATION (apply + emit) |
| ABG identity and attempt governance | REQ-R-ABG2-LINEAGE, REQ-R-ABG2-RUN, REQ-R-ABG2-WORKER, REQ-R-ABG2-BINDING |
| ABG provenance and correction | REQ-R-ABG2-PROVENANCE, REQ-R-ABG2-CORRECTION |
| ABG selection and subwork | REQ-R-ABG2-SELECTION-APPLICATION (enumerate + validate), REQ-R-ABG2-LEAFTASK |
| ABG transport | REQ-R-ABG2-TRANSPORT |
| ABG self-hosting | REQ-R-ABG2-SELFHOSTING |
| Mapping layer | REQ-M-GTL2-MAPPING, REQ-M-GTL2-CAPABILITY, REQ-M-GTL2-PROVENANCE |
| Product layer | REQ-P-POLICY, REQ-P-SCENARIOS, REQ-P-QUAL |

---

## 9. Claude Build Alignment Order

### Phase 1: GTL declaration kernel

- establish `gtl.graph` as the structural kernel
- establish `gtl.operator_model` as the effect/convergence declaration surface
- establish `gtl.function_model` as the reusable workflow-program surface
- establish `gtl.work_model` as the semantic work-declaration surface
- establish `gtl.module_model` as the publication/import boundary

**Outcome**: GTL is a pure declaration layer with no runtime ownership leakage.

### Phase 2: ABG execution kernel

- establish `abg.events` and `abg.projection` as append-only replay truth
- establish `abg.binding`, `abg.run`, `abg.lineage`, and `abg.convergence` as execution-attempt governance
- establish `abg.provenance` and `abg.correction` as runtime truth-maintenance modules

**Outcome**: the ABG kernel is explicit and testable by responsibility.

### Phase 3: Interpretation, selection, and transport

- establish `abg.selection` as lawful candidate enumeration and validation
- establish `abg.subwork` as bounded delegated work
- establish `abg.transport` as replaceable agent transport
- establish `abg.interpret` as the graph-interpretation loop

**Outcome**: engine traversal and delegated realization match the GTL contract.

### Phase 4: Application, self-hosting, and mapping

- establish `abg.services` as the service/application orchestration layer
- establish `abg.cli` as the command adapter only
- establish `abg.install` as the bootstrap/install surface
- establish `abg.selfhosting` as the bootloader/drift governance layer
- establish `mapping.*` as alternate-engine mapping surfaces

**Outcome**: runtime interfaces and alternate engine mappings remain separated from the kernel.

---

## 10. Claude Build Conformance

For the Claude build to conform to this module design:

1. `gtl.work_model` defines `ContractRef`, `Role`, and GTL `Job`.
2. `gtl.module_model.Module` owns explicit `jobs` and `roles`, and `ModuleImport.names` refers to declaration names.
3. `ExecutableJob` is the only runtime job wrapper; phase-only wrappers do not define runtime ontology.
4. `Worker` retains `can_execute` and adds `role_ids` plus `authority_ref`.
5. `Module.jobs` resolve to executable jobs by `GraphVector.id`; unsupported or unresolved contract kinds fail closed.
6. `WorkSurface` is immutable and carries consumed context, emitted context, artifacts, findings, attestations, and stage-local metadata.
7. `run_bound` and id-first binding provenance preserve `job_id`, `worker_id`, `role_id`, `authority_ref`, and `vector_id` where useful.
8. executable-job hashing incorporates GTL job semantics, role semantics, resolved contract identity, evaluator definitions, and bound context digests using a stable serialization.
9. domain packages publish explicit jobs and roles as part of the authored `Module` surface.

---

## 11. QA Proof Obligations

The minimum proof lane for this correction is:

1. GTL contract tests for `ContractRef`, `Role`, and `Job`:
   - frozen
   - id-bearing
   - structural equality ignores id
2. Module tests:
   - `Module` owns jobs and roles
   - imported jobs and roles preserve declaration identity and provenance
3. Resolution tests:
   - explicit GTL jobs resolve to executable jobs by `GraphVector.id`
   - unsupported contract kinds fail closed
   - missing target ids fail closed
4. Binding tests:
   - worker lacking required role cannot bind
   - worker with correct role can bind without losing current `can_execute` semantics
5. Run/provenance tests:
   - `run_bound` emitted before realization
   - `RunState` carries `job_id`, `worker_id`, `role_id`, `authority_ref`
   - reducer derives `queued` and `pending` when those are the lawful states
   - duplicate labels with distinct ids do not alias
6. Regression tests:
   - worker conflict batching still uses write territory from executable jobs
   - existing convergence/evaluator behavior remains sourced from graph contracts, not duplicated onto GTL jobs
7. Work-surface tests:
   - `WorkSurface` is immutable
   - `WorkSurface` carries consumed context, emitted context, artifacts, findings, and attestations
   - phase-only distinctions do not introduce new wrapper types

These obligations define the minimum proof that the Claude build matches the constitutional design.

---

## 12. Bottom Line

The module design is:

- **6 GTL modules** — graph, operator_model, function_model, work_model, algebra, module_model
- **13 ABG kernel modules** — events, projection, binding, lineage, run, convergence, selection, provenance, correction, subwork, transport, interpret, selfhosting
- **3 ABG app modules** — services, cli, install
- **3 mapping modules** — capability, adapter, provenance

Every required definition has an explicit V2 home. Every V2 module traces to requirement families. No accidental law, no duplicate ontology.
