# GTL 2.x / ABG Module Design

**Status**: Accepted
**Date**: 2026-03-24
**Purpose**: Translate GTL 2.x constitutional law into concrete module boundaries, detailed domain model, dependency rules, and a current-to-target decomposition plan.

**Derived from**:
- [GTL_2_CONSTITUTIONAL_DESIGN.md](../../specification/GTL_2_CONSTITUTIONAL_DESIGN.md)
- [GTL_2_ABG_CONTRACT.md](../../specification/GTL_2_ABG_CONTRACT.md)
- [specification/requirements/](../../specification/requirements/)
- [ADR-022](adrs/ADR-022-subprocess-transport-with-env-sanitization.md)

---

## 1. Position

This document is the intermediate step between design and code.

It does not create new constitutional law. It answers:

- given the GTL 2.x constitution and the ABG target engine contract,
- what are the concrete module boundaries,
- what are the detailed types,
- and how should the current codebase be decomposed?

---

## 2. Design Rules

1. GTL modules must not import ABG modules.
2. ABG core may import GTL declarations, but GTL may not depend on ABG runtime types.
3. Product policy and CLI behavior must not leak into GTL core modules.
4. Transport is replaceable behind an ABG runtime boundary.
5. `Graph` is public ontology; `GraphVector` is implementation structure.
6. `Job`, `Worker`, `RunState`, `WorkInstance`, and `LeafTask` are ABG runtime types, not GTL language types.
7. Provenance recording is an engine obligation even when the language requires provenance-carrying structure.
8. Higher-order operations belong to GTL semantics, but their realization belongs to ABG.

---

## 3. Target Module Stack

### 3.1 GTL language layer

| Target module | Owns | Primary types / functions | Requirement families |
| --- | --- | --- | --- |
| `gtl.graph` | Graph structure | `Graph`, `Node`, `GraphVector`, `Context` | REQ-L-GTL2-GRAPH, REQ-L-GTL2-NODE, REQ-L-GTL2-INTERFACE |
| `gtl.operator_model` | Effect and convergence declarations | `Operator`, `Evaluator`, `Rule`, `Consensus`, `Regime` (F_D/F_P/F_H) | REQ-L-GTL2-OPERATOR, REQ-L-GTL2-EVALUATOR, REQ-L-GTL2-RULE |
| `gtl.function_model` | Reusable workflow programs | `GraphFunction`, `GraphTemplate` | REQ-L-GTL2-GRAPHFUNCTION |
| `gtl.algebra` | Graph algebra | `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `identity` | REQ-L-GTL2-COMPOSE, REQ-L-GTL2-SUBSTITUTE, REQ-L-GTL2-RECURSE, REQ-L-GTL2-HOF, REQ-L-GTL2-LAWS |
| `gtl.module_model` | Publication and imports | `Module`, `ModuleImport` | REQ-L-GTL2-MODULE, REQ-L-GTL2-SELECTION-BOUNDARY, REQ-L-GTL2-ENGINE-INDEPENDENCE |

### 3.2 ABG engine kernel

| Target module | Owns | Primary types / functions | Requirement families |
| --- | --- | --- | --- |
| `abg.events` | Append-only event substrate | `EventStream`, `emit()`, event schema helpers | REQ-R-ABG2-EVENTS |
| `abg.projection` | Pure replay | `project()`, derived truth folds | REQ-R-ABG2-PROJECTION |
| `abg.binding` | Deterministic precomputation and capability model | `PrecomputedManifest`, `BoundJob`, `Job`, `Worker`, `bind_fd()`, `bind_fp()`, `bind_fh()`, spec hashes | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-PROVENANCE, REQ-R-ABG2-JOB-WORKER |
| `abg.lineage` | Work identity and parent/child | `WorkInstance`, `spawn()`, `fold_back()`, `_discover_children()`, lineage queries | REQ-R-ABG2-LINEAGE |
| `abg.run` | Execution attempts | `RunState`, `run_state()`, `find_pending_run()`, `supersede_run()` | REQ-R-ABG2-RUN |
| `abg.convergence` | Delta and convergence | `delta()`, `parent_converged()`, convergence visibility | REQ-R-ABG2-CONVERGENCE |
| `abg.selection` | Candidate enumeration and validation | `SelectionDecision`, candidate discovery, selection validation | REQ-R-ABG2-SELECTION-APPLICATION |
| `abg.provenance` | Spec/workflow/selection provenance | `req_hash()`, `job_evaluator_hash()`, workflow version reads, carry-forward | REQ-R-ABG2-PROVENANCE |
| `abg.correction` | Correction and reset | `find_latest_reset()`, certification shadowing | REQ-R-ABG2-CORRECTION |
| `abg.subwork` | Bounded sub-work realization | `LeafTask`, `validate_leaf_schema()`, `dispatch_leaf()` | REQ-R-ABG2-LEAFTASK |
| `abg.transport` | Agent transport surface | `AgentResult`, `AgentTransportError`, `dispatch_agent()`, `classify_failure()` | REQ-R-ABG2-TRANSPORT, ADR-022 |
| `abg.interpret` | Graph interpretation loop | graph materialization, traversal, next-action, substitution orchestration | REQ-R-ABG2-INTERPRET |
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
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class GraphVector:
    """Internal adjacency record. Not public ontology."""
    name: str
    source: Node
    target: Node
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
    binding: str
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class Consensus:
    n: int
    m: int

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
    effects: tuple[type[Regime], ...] = ()
    tags: tuple[str, ...] = ()
```

```python
# gtl.module_model

@dataclass(frozen=True)
class ModuleImport:
    source: str              # module name
    names: tuple[str, ...]   # imported graph function names
    version: str = ""

@dataclass(frozen=True)
class Module:
    name: str
    graphs: tuple[Graph, ...] = ()
    graph_functions: tuple[GraphFunction, ...] = ()
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
- `edge()` returns `Graph`, not `Edge`. Edge-as-type is retired from public ontology.
- `GraphVector` is internal — not exported from `gtl.graph.__init__` unless needed by engine internals.

### 4.4 Event delegation pattern

`abg.selection` and `abg.subwork` are pure kernel modules — they return structured values (`SelectionDecision`, leaf task results) but do not emit events themselves. Event emission is delegated to the caller (`abg.interpret` or `abg.services`), which has access to `abg.events`.

This follows the same principle as the F_P contract: "F_P does not call the event logger. F_P produces artifacts; F_D reads them and emits events."

Concretely:
- `abg.selection` returns `SelectionDecision` → caller emits `workflow_selected` event
- `abg.subwork.dispatch_leaf()` returns `(output, failure_class)` → caller emits `leaf_task_started`/`completed`/`failed`

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
    job: Job
    current_state: dict
    failing_evaluators: list[Evaluator]
    passing_evaluators: list[Evaluator]
    fd_results: dict
    relevant_contexts: dict
    missing_contexts: list[str]
    delta_summary: str

@dataclass
class BoundJob:
    job: Job
    precomputed: PrecomputedManifest
    prompt: str
    result_path: str
    manifest_id: str

# abg.lineage
@dataclass(frozen=True)
class WorkInstance:
    job: Job
    work_key: str
    run_id: str

# abg.run
@dataclass(frozen=True)
class RunState:
    work_key: str
    run_id: str
    contract_id: str
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
    feature: str
    vector_name: str
    build: str
    worker_ref: str
    workflow_version: str
    work_key: str
    run_id: str
```

### 5.2 ABG runtime types that move out of GTL

| Current GTL type | V2 home | Rationale |
| --- | --- | --- |
| `Job` | `abg.binding` | Runtime scheduling unit, not language type |
| `Worker` | `abg.binding` | Execution capability model, engine-owned (REQ-R-ABG2-JOB-WORKER) |
| `WorkingSurface` | `abg.interpret` | Execution trace, not language type |
| `IterateProtocol` | `abg.interpret` | Engine contract, not language type |
| `PackageSnapshot` | `abg.provenance` | Runtime binding artifact |
| `Overlay` | retired | V1 extension mechanism; Module imports replace it |

### 5.3 GTL types that are renamed or reinterpreted

| Current GTL type | V2 type | Module | Change |
| --- | --- | --- | --- |
| `Asset` | `Node` | `gtl.graph` | Reinterpreted as typed graph locus |
| `Edge` | `GraphVector` | `gtl.graph` (internal) | Demoted from public ontology to implementation record |
| `Fragment` | retired | — | Transitional abstraction; `Graph` + `substitute()` replaces it |
| `Package` | `Module` | `gtl.module_model` | Expanded to full publication/import boundary |
| `Operative` | retired | — | V1 approval vocabulary; `Rule` + `Evaluator` replace it |

---

## 6. Current-to-Target File Decomposition

### 6.1 `gtl/core.py` → GTL modules

| Current definition | Target module | Target type/function |
| --- | --- | --- |
| `F_D`, `F_P`, `F_H` | `gtl.operator_model` | `Regime` subclasses |
| `Consensus` | `gtl.operator_model` | `Consensus` |
| `Operative` | retired | — |
| `Context` | `gtl.graph` | `Context` |
| `Rule` | `gtl.operator_model` | `Rule` |
| `Operator` | `gtl.operator_model` | `Operator` |
| `Asset` | `gtl.graph` | `Node` (renamed) |
| `Edge` | `gtl.graph` | `GraphVector` (internal, renamed) |
| `Evaluator` | `gtl.operator_model` | `Evaluator` |
| `WorkingSurface` | `abg.interpret` | moved to ABG |
| `Job` | `abg.binding` | moved to ABG |
| `Worker` | `abg.binding` | moved to ABG kernel (REQ-R-ABG2-JOB-WORKER) |
| `IterateProtocol` | `abg.interpret` | moved to ABG |
| `Fragment` | retired | `Graph` + `substitute()` |
| `Overlay` | retired | `Module` imports |
| `PackageSnapshot` | `abg.provenance` | moved to ABG |
| `Package` | `gtl.module_model` | `Module` (renamed) |

### 6.2 `genesis/core.py` → ABG modules

| Current definition | Target module | Notes |
| --- | --- | --- |
| `EventStream` | `abg.events` | |
| `init_stream()` | `abg.events` | |
| `init_snapshot()` | `abg.provenance` | |
| `emit()` | `abg.events` | |
| `project()` | `abg.projection` | |
| `ContextResolver` | `abg.binding` | Context loading for precomputation |
| `workspace_bootstrap()` | `abg.install` | |

### 6.3 `genesis/bind.py` → ABG modules

| Current definition | Target module | Notes |
| --- | --- | --- |
| `req_hash()` | `abg.provenance` | |
| `job_evaluator_hash()` | `abg.provenance` | |
| `find_latest_reset()` | `abg.correction` | |
| `bind_fh()` | `abg.binding` | |
| `bind_fp_certified()` | `abg.binding` | |
| `run_fd_evaluator()` | `abg.binding` | |
| `bind_fd()` | `abg.binding` | |
| `bind_fp()` | `abg.binding` | |
| `_assemble_prompt()` | `abg.binding` | |
| `select_relevant_contexts()` | `abg.binding` | |
| `render_delta()` | `abg.convergence` | |

### 6.4 `genesis/schedule.py` → ABG modules

| Current definition | Target module | Notes |
| --- | --- | --- |
| `WorkInstance` | `abg.lineage` | |
| `RunState` | `abg.run` | |
| `LeafTask` | `abg.subwork` | |
| `validate_leaf_schema()` | `abg.subwork` | |
| `run_state()` | `abg.run` | |
| `find_pending_run()` | `abg.run` | |
| `supersede_run()` | `abg.run` | |
| `_discover_children()` | `abg.lineage` | |
| `delta()` | `abg.convergence` | |
| `iterate()` | `abg.interpret` | |
| `schedule()` | `abg.interpret` | |
| `zoom()` | `abg.interpret` | Applies `substitute()` from `gtl.algebra` |
| `zoom_event()` | `abg.interpret` | |
| `find_fragment_for_edge()` | `abg.interpret` | Becomes candidate enumeration |
| `spawn()` | `abg.lineage` | |
| `parent_converged()` | `abg.convergence` | |

### 6.5 `genesis/commands.py` → ABG application surface

| Current definition | Target module | Notes |
| --- | --- | --- |
| `Scope` | `abg.services` | |
| `gen_gaps()` | `abg.services` | |
| `gen_iterate()` | `abg.services` | |
| `gen_start()` | `abg.services` | |
| `active_work_keys()` | `abg.lineage` | |
| `_resolve_work_keys()` | `abg.services` | |
| `_derive_state()` | `abg.services` | |
| `_resolve_worker()` | `abg.services` | |
| `_scoped_jobs()` | `abg.services` | |
| `_close_completed_features()` | `abg.services` | Product policy |
| `_known_feature_ids()` | `abg.services` | Product policy |
| `_read_workflow_version()` | `abg.provenance` | |
| `_read_carry_forward()` | `abg.provenance` | |

### 6.6 `genesis/fp_dispatch.py` → ABG transport + subwork

| Current definition | Target module | Notes |
| --- | --- | --- |
| `AgentTransportError` | `abg.transport` | |
| `AgentResult` | `abg.transport` | |
| `has_agent()` | `abg.transport` | |
| `call_agent()` | `abg.transport` | |
| `dispatch_agent()` | `abg.transport` | |
| `classify_failure()` | `abg.transport` | |
| `dispatch_leaf()` | `abg.subwork` | |
| `_agent_command()` | `abg.transport` | |
| `_build_args()` | `abg.transport` | |
| `_sanitized_env()` | `abg.transport` | |
| `has_mcp_transport()` | retired | Legacy alias |
| `call_claude_code_mcp()` | retired | Legacy alias |

### 6.7 `genesis/manifest.py` → ABG binding

| Current definition | Target module | Notes |
| --- | --- | --- |
| `PrecomputedManifest` | `abg.binding` | |
| `BoundJob` | `abg.binding` | |

### 6.8 `genesis/__main__.py` → ABG CLI

| Current definition | Target module | Notes |
| --- | --- | --- |
| `_build_parser()` | `abg.cli` | |
| `_check_tags()` | `abg.cli` | Traceability tooling |
| `_check_req_coverage()` | `abg.cli` | Traceability tooling |
| `_check_tag_coverage()` | `abg.cli` | Traceability tooling |
| `_check_bootloader_consistency()` | `abg.selfhosting` | |
| `_assess_result_cmd()` | `abg.services` | Event ingestion |

---

## 7. Dependency Rules

### 7.1 Allowed dependencies (→ = "may import")

```
gtl.graph           → (stdlib only)
gtl.operator_model  → (stdlib only)
gtl.function_model  → gtl.graph, gtl.operator_model
gtl.algebra         → gtl.graph, gtl.operator_model, gtl.function_model
gtl.module_model    → gtl.graph, gtl.operator_model, gtl.function_model

abg.events          → (stdlib only)
abg.projection      → abg.events
abg.provenance      → abg.events
abg.correction      → abg.events
abg.binding         → abg.events, abg.projection, abg.provenance, gtl.graph, gtl.operator_model
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
| GTL publication boundary | REQ-L-GTL2-MODULE, REQ-L-GTL2-SELECTION-BOUNDARY, REQ-L-GTL2-ENGINE-INDEPENDENCE |
| ABG event and replay kernel | REQ-R-ABG2-EVENTS, REQ-R-ABG2-PROJECTION |
| ABG interpretation kernel | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-CONVERGENCE |
| ABG identity and attempt governance | REQ-R-ABG2-LINEAGE, REQ-R-ABG2-RUN, REQ-R-ABG2-JOB-WORKER |
| ABG provenance and correction | REQ-R-ABG2-PROVENANCE, REQ-R-ABG2-CORRECTION |
| ABG selection and subwork | REQ-R-ABG2-SELECTION-APPLICATION, REQ-R-ABG2-LEAFTASK |
| ABG transport | REQ-R-ABG2-TRANSPORT |
| ABG self-hosting | REQ-R-ABG2-SELFHOSTING |
| Mapping layer | REQ-M-GTL2-MAPPING, REQ-M-GTL2-CAPABILITY, REQ-M-GTL2-PROVENANCE |
| Product layer | REQ-P-POLICY, REQ-P-SCENARIOS, REQ-P-LIBRARIES |

---

## 9. Decomposition Order

### Phase 1: Language kernel split

- Carve `gtl.graph` (Graph, Node, GraphVector, Context)
- Carve `gtl.operator_model` (Operator, Evaluator, Rule, Regime, Consensus)
- Carve `gtl.function_model` (GraphFunction)
- Carve `gtl.module_model` (Module, ModuleImport)

**Outcome**: GTL stops being mixed with runtime types. `Asset` → `Node`, `Edge` → `GraphVector`, `Package` → `Module`, `Fragment` retired.

### Phase 2: Runtime kernel split

- Carve `abg.events` (EventStream, emit)
- Carve `abg.projection` (project)
- Carve `abg.provenance` (req_hash, job_evaluator_hash, workflow version)
- Carve `abg.correction` (find_latest_reset)
- Carve `abg.binding` (bind_fd, bind_fp, bind_fh, PrecomputedManifest, BoundJob)
- Carve `abg.lineage` (WorkInstance, spawn, _discover_children)
- Carve `abg.run` (RunState, run_state, find_pending_run, supersede_run)
- Carve `abg.convergence` (delta, parent_converged, render_delta)

**Outcome**: ABG kernel is explicit and testable by responsibility.

### Phase 3: Interpretation and transport split

- Carve `abg.selection` (SelectionDecision, candidate enumeration)
- Carve `abg.subwork` (LeafTask, validate_leaf_schema, dispatch_leaf)
- Carve `abg.transport` (AgentResult, dispatch_agent, classify_failure)
- Carve `abg.interpret` (iterate, schedule, zoom, graph materialization)

**Outcome**: Engine surface matches the GTL 2.x contract.

### Phase 4: App and mapping split

- Carve `abg.services` (Scope, gen_gaps, gen_iterate, gen_start)
- Carve `abg.cli` (parser, command wiring)
- Carve `abg.install` (workspace_bootstrap, installer)
- Carve `abg.selfhosting` (bootloader consistency)
- Define `mapping.*` (future — Wave 2+)

**Outcome**: Interfaces and alternate engine mappings cleanly separated from kernel.

---

## 10. Immediate Implementation Guidance

If work starts now, the first concrete refactor is:

1. **Split `gtl/core.py`** into `gtl/graph.py`, `gtl/operator_model.py`, `gtl/function_model.py`, `gtl/module_model.py`
2. **Move runtime types out of GTL**: `Job`, `Worker`, `WorkingSurface`, `IterateProtocol`, `PackageSnapshot` → ABG modules
3. **Rename**: `Asset` → `Node`, `Edge` → `GraphVector`, `Package` → `Module`
4. **Retire**: `Fragment`, `Overlay`, `Operative`
5. **Create `gtl/algebra.py`** with `compose`, `substitute`, `edge()` sugar
6. **Isolate `abg.events`** and `abg.projection`** from `genesis/core.py`
7. **Isolate `abg.transport`** from `genesis/fp_dispatch.py`
8. **Keep `abg.services` and `abg.cli`** as thin orchestration layers

This gives the fastest path from current code to a module structure that matches the constitutional design.

---

## 11. Bottom Line

The module design is:

- **5 GTL modules** — graph, operator_model, function_model, algebra, module_model
- **13 ABG kernel modules** — events, projection, binding, lineage, run, convergence, selection, provenance, correction, subwork, transport, interpret, selfhosting
- **3 ABG app modules** — services, cli, install
- **3 mapping modules** — capability, adapter, provenance

Every current definition (87 total across 9 files) has an explicit V2 home. Every V2 module traces to requirement families. No orphaned code, no accidental law.
