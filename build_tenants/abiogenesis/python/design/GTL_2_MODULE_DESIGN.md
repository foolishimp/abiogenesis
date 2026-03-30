# GTL 2.x / ABG Module Design

**Status**: Accepted
**Date**: 2026-03-26
**Purpose**: Translate GTL 2.x constitutional law into concrete module boundaries, detailed domain model, dependency rules, and an implementation-ready module plan for the Claude build.

**Derived from**:
- [GTL_2_CONSTITUTIONAL_DESIGN.md](../../../../specification/GTL_2_CONSTITUTIONAL_DESIGN.md)
- [specification/requirements/](../../../../specification/requirements/)
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
6. `Role` and `Job` are GTL declaration types. `Worker`, `ExecutableJob`, `WorkSurface`, `Traversal`, `RunState`, and `LeafTask` are ABG runtime types. `WorkInstance` is a helper view over work identity in this build.
7. Provenance recording is an engine obligation even when the language requires provenance-carrying structure.
8. Higher-order operations belong to GTL semantics, but their realization belongs to ABG.
9. `Worker.can_execute` remains the executable capability and scheduling surface in this build; roles are additive, not a replacement.
10. Evaluator/convergence truth remains on GTL graph contracts. GTL `Job` does not create a second evaluator surface.
11. If two runtime structures differ only by lifecycle phase, they collapse into one type plus `RunState.state` and immutable `WorkSurface` unless they introduce distinct semantics.
12. If two public concepts are directly isomorphic, the build keeps one canonical concept and expresses the other as sugar, configuration, or helper structure.
13. `work_key` is the canonical ABG work identity. `feature` is application-facing sugar over `work_key`.
14. `vector_id` is the canonical runtime contract handle. `edge` or `vector_name` are readability fields only.
15. `PrecomputedManifest`, `WorkInstance`, `SelectionResult`, and `AgentResult` are helper shapes unless a requirement explicitly promotes them to public runtime ontology.
16. Do not solve structural choice with `GraphVector` flags. Guards, synthesis eligibility, harvest mode, profile identity, and similar concerns belong in GTL algebraic declarations, not as ad hoc vector booleans.
17. Do not treat current code-surface convenience as design law. If the current implementation shape conflicts with the algebraic requirement surface, the design follows the requirements and the implementation must catch up.
18. Parallel candidate harvest, evaluator multiplicity, and profile selection must be expressed as explicit topological or policy-visible declarations. They must not be inferred from tuple cardinality or hidden interpreter convention.
19. Published graph functions, canonical materialization, and graph-derived companion bundles are first-class design surfaces. They must not be hidden inside traversal helpers or deferred into alternate-engine mapping.
20. Prime GTL and ABG kernel surfaces are immutable value types. Mutation belongs only to effect interpreters and event stores, never to graph, materialization, or provenance declarations.
21. The build follows a functional-core, explicit-effect-shell discipline. Composition, substitution, recursion, materialization, and convergence operate over values; file I/O, transport, subprocess, and event emission remain interpreter-edge effects.
22. Published graph functions must resolve through replayable symbolic materializer references. Anonymous closures, ambient module state, and hidden interpreter capture are not lawful publication surfaces.
23. Prime public interfaces use named records and ordered attributes rather than generic `dict` bags. Helper shapes may remain pragmatic, but graph/materialization/traversal truth must stay typed and inspectable.
24. Recursive refinement is lawful only when each zoom/materialize/fold-back step preserves the outer contract and emits replayable provenance linking parent, child, and derived evaluator truth.
25. Interface satisfaction is structural. Node name, schema, and markov conditions participate in composition, substitution, selection, and materialization checks.
26. Event provenance context is explicit. Workflow version, work key, and run id are carried through event-context values, not mutable hidden stream state.

---

## 3. Target Module Stack

### 3.1 GTL language layer

| Target module | Owns | Primary types / functions | Requirement families |
| --- | --- | --- | --- |
| `gtl.graph` | Graph structure | `Graph`, `Node`, `GraphVector`, `Context` | REQ-L-GTL2-GRAPH, REQ-L-GTL2-NODE, REQ-L-GTL2-INTERFACE |
| `gtl.operator_model` | Effect and convergence declarations | `Operator`, `Evaluator`, `Rule`, `Regime` (F_D/F_P/F_H) | REQ-L-GTL2-OPERATOR, REQ-L-GTL2-EVALUATOR, REQ-L-GTL2-RULE |
| `gtl.function_model` | Reusable workflow programs and structural alternatives | `GraphFunction`, `RefinementBoundary`, `CandidateFamily` | REQ-L-GTL2-GRAPHFUNCTION, REQ-L-GTL2-SYNTHESIS, REQ-L-GTL2-SELECTION-BOUNDARY |
| `gtl.work_model` | Semantic work declarations | `ContractRef`, `Role`, `Job` | REQ-L-GTL2-ROLE, REQ-L-GTL2-JOB, REQ-L-GTL2-IDENTITY |
| `gtl.algebra` | Graph algebra | `compose`, `substitute`, `recurse`, `fan_out`, `fan_in`, `gate`, `promote`, `identity`, `deferred_refinement`, `candidate_family` | REQ-L-GTL2-COMPOSE, REQ-L-GTL2-SYNTHESIS, REQ-L-GTL2-SUBSTITUTE, REQ-L-GTL2-RECURSE, REQ-L-GTL2-HOF, REQ-L-GTL2-LAWS |
| `gtl.module_model` | Publication and imports | `Module`, `ModuleImport` | REQ-L-GTL2-MODULE, REQ-L-GTL2-SELECTION-BOUNDARY, REQ-L-GTL2-ENGINE-INDEPENDENCE |

### 3.2 ABG engine kernel

| Target module | Owns | Primary types / functions | Requirement families |
| --- | --- | --- | --- |
| `abg.events` | Append-only event substrate | `EventStream`, `EventContext`, `emit()`, event schema helpers | REQ-R-ABG2-EVENTS |
| `abg.projection` | Pure replay | `project()`, derived truth folds | REQ-R-ABG2-PROJECTION |
| `abg.binding` | Executable job resolution, deterministic precomputation, worker capability, role binding, immutable execution surfaces | `ExecutableJob`, `WorkSurface`, `Worker`, preparation helpers, `bind_fd()`, `bind_fp()`, `bind_fh()`, executable-job hashes | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-WORKER, REQ-R-ABG2-BINDING, REQ-R-ABG2-PROVENANCE |
| `abg.lineage` | Work identity and parent/child | `spawn()`, `discover_children()`, lineage queries, work-identity helpers | REQ-R-ABG2-LINEAGE |
| `abg.run` | Execution attempts | `RunState`, `run_state()`, `find_pending_run()`, `supersede_run()` | REQ-R-ABG2-RUN |
| `abg.convergence` | Delta and convergence | `delta()`, `parent_converged()`, evaluator-vector convergence, round visibility | REQ-R-ABG2-CONVERGENCE |
| `abg.selection` | Candidate enumeration and validation | `SelectionDecision`, candidate discovery, candidate-family/profile validation | REQ-R-ABG2-SELECTION-APPLICATION |
| `abg.materialization` | Canonical graph-function realization and graph-derived companion bundles | `MaterializationRequest`, `MaterializationRecord`, `CompanionBundle`, `materialize_graph_function()`, `derive_bundle()` | REQ-L-GTL2-GRAPHFUNCTION, REQ-M-GTL2-MAPPING, REQ-M-GTL2-PROVENANCE, REQ-R-ABG2-PROVENANCE |
| `abg.provenance` | Spec/workflow/selection provenance | `req_hash()`, `executable_job_hash()`, `spec_hash_for()`, workflow version reads, per-evaluator/aggregate carry-forward | REQ-R-ABG2-PROVENANCE |
| `abg.correction` | Correction and reset | `find_latest_reset()`, certification shadowing | REQ-R-ABG2-CORRECTION |
| `abg.subwork` | Bounded sub-work realization | `LeafTask`, `validate_leaf_schema()`, `dispatch_leaf()` | REQ-R-ABG2-LEAFTASK |
| `abg.transport` | Agent transport surface | `AgentTransportError`, `dispatch_agent()`, `classify_failure()`, transport-local result helpers | REQ-R-ABG2-TRANSPORT, ADR-022 |
| `abg.interpret` | Graph interpretation loop | `Traversal`, `traverse()`, graph materialization, next-action, substitution orchestration, event emission for delegated modules | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-SELECTION-APPLICATION (apply + emit) |
| `abg.selfhosting` | Derived artifact governance | bootloader consistency checks, drift detection | REQ-R-ABG2-SELFHOSTING |

### 3.3 ABG application surface

| Target module | Owns | Primary types / functions | Notes |
| --- | --- | --- | --- |
| `abg.services` | Named app services | `Scope`, `gen_gaps()`, `gen_iterate()`, `gen_start()` | Orchestrates kernel modules |
| `abg.cli` | CLI adapter | `_build_parser()`, command wiring, traceability checks | Implementation surface only |
| `abg.install` | Bootstrap/install | Installer, workspace scaffolding, `workspace_bootstrap()` | Implementation surface only |

### 3.4 Engine mapping layer

Canonical engine mapping of published graph functions into executable graph surfaces is part of the ABG kernel. `abg.materialization` owns lawful materialization and graph-derived companion bundle derivation for the canonical engine. `abg.provenance` owns replayable recording of graph-function identity, materialization identity, and bundle derivation truth.

Alternate runtime families remain deferred. Capability profiles, alternate engine adapters, and non-ABG mapping surfaces stay outside the ABG 1.1 shipping line until those runtimes are intentionally designed.

---

## 4. GTL Domain Model

### 4.1 Types

```python
# design-level immutable helpers

@dataclass(frozen=True)
class Attr:
    key: str
    value: Any

@dataclass(frozen=True)
class TemplateRef:
    kind: str                # inline_graph | symbolic
    ref: str
    graph: Graph | None = None
    version: str | None = None

@dataclass(frozen=True)
class Attrs(Mapping[str, Any]):
    entries: tuple[Attr, ...] = ()
type BundleKind = Literal["selected_subgraph", "evaluator_bundle", "profile_manifest"]

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
    """Internal adjacency record. Not public ontology or policy surface."""
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
    config: Attrs = ()
    tags: tuple[str, ...] = ()
```

```python
# gtl.function_model

@dataclass(frozen=True)
class GraphFunction:
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    template: TemplateRef
    id: str = field(default_factory=_mint_id, compare=False)
    effects: tuple[type[Regime], ...] = ()
    declarations: Attrs = ()
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class RefinementBoundary:
    """Explicit lawful refinement/synthesis boundary over a stable outer contract."""
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    id: str = field(default_factory=_mint_id, compare=False)
    hints: Attrs = ()
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class CandidateFamily:
    """Named family of lawful structural alternatives for one outer contract."""
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    candidates: tuple[GraphFunction, ...]
    id: str = field(default_factory=_mint_id, compare=False)
    policy_hints: Attrs = ()
    tags: tuple[str, ...] = ()
```

```python
# abg.materialization

@dataclass(frozen=True)
class MaterializationRequest:
    graph_function: str
    profile: str | None = None
    parameters: Attrs = ()

@dataclass(frozen=True)
class MaterializationRecord:
    materialization_id: str
    module: str
    graph_function: str
    graph_function_id: str
    template_kind: str
    template_ref: str
    profile: str | None = None
    parameters: Attrs = ()
    graph: Graph

@dataclass(frozen=True)
class CompanionBundle:
    kind: BundleKind
    materialization_id: str
    values: Attrs = ()
```

Deferred synthesis/refinement and structural alternatives are part of the same ownership surface. `RefinementBoundary` and `CandidateFamily` are the preferred design direction because they keep strategic choice outside the interpreter while making the contract boundary explicit. Equivalent representations are only acceptable if they preserve the same algebraic separation.

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
    policy_hooks: Attrs = ()
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
    refinement_boundaries: tuple[RefinementBoundary, ...] = ()
    candidate_families: tuple[CandidateFamily, ...] = ()
    jobs: tuple[Job, ...] = ()
    roles: tuple[Role, ...] = ()
    operators: tuple[Operator, ...] = ()
    evaluators: tuple[Evaluator, ...] = ()
    rules: tuple[Rule, ...] = ()
    imports: tuple[ModuleImport, ...] = ()
    metadata: Attrs = ()
```

### 4.2 DSL sugar

```python
# gtl.algebra (public convenience)

def edge(source: Node, target: Node, *, operators=(), evaluators=(), **kw) -> Graph:
    """Construct a minimal one-vector graph."""

def compose(*functions: GraphFunction) -> GraphFunction:
    """Variadic left-folded composition when adjacent interfaces align."""

def substitute(outer: Graph, contract_vector: str, inner: Graph) -> Graph:
    """Replace a coarse contract step with an interface-compatible inner graph."""

def recurse(graph_function: GraphFunction, termination: Evaluator) -> GraphFunction:
    """Express repeated or child graph-function application under a declared termination contract."""

def fan_out(f: GraphFunction, *, over: Node) -> GraphFunction:
    """Apply f across an explicit Vector[T] boundary."""

def fan_in(reducer: GraphFunction, *, over: Node) -> GraphFunction:
    """Reduce an explicit vector boundary into one synthesized result."""

def gate(
    target: GraphFunction | RefinementBoundary | CandidateFamily,
    *,
    rule: Rule,
    evaluators: tuple[Evaluator, ...],
) -> GraphFunction:
    """Block continuation or trigger lawful next action over an explicit boundary."""

def promote(*, source: Node, to: Node) -> GraphFunction:
    """Lift or normalize one declared representation boundary into another without changing semantic truth."""

def identity(interface: tuple[Node, ...]) -> GraphFunction:
    """Identity graph function preserving interface."""

def deferred_refinement(
    name: str,
    *,
    inputs: tuple[Node, ...],
    outputs: tuple[Node, ...],
    hints: Attrs = (),
    tags: tuple[str, ...] = (),
) -> RefinementBoundary:
    """Declare a lawful refinement/synthesis boundary without embedding strategy."""

def candidate_family(
    name: str,
    *,
    inputs: tuple[Node, ...],
    outputs: tuple[Node, ...],
    candidates: tuple[GraphFunction, ...],
    policy_hints: Attrs = (),
    tags: tuple[str, ...] = (),
) -> CandidateFamily:
    """Declare a named family of lawful alternatives over one contract boundary."""
```

### 4.3 Notes

- `Node[T]` preserves `Generic[T]` parameterization. `Vector[T]` is expressed as `Node[Vector[T]]` via the schema parameter. No separate structural type.
- Prime graph/materialization surfaces use immutable record types even in Python. The implementation target is Python with Scala-style algebraic discipline, not Python convenience objects with hidden mutable payloads.
- `GraphFunction.template` is a replayable `TemplateRef`, not an anonymous runtime closure. `inline_graph` supports direct algebraic composition and tests; `symbolic` defers realization to the materializer/interpreter while keeping publication truth inspectable.
- `GraphFunction.declarations` is the structured higher-order companion to the outer contract. Recursion and gating preserve inspectable declaration truth there rather than collapsing to tags alone.
- Canonical engine materialization is a first-class runtime step owned by `abg.materialization`, not an implicit side effect of `abg.interpret`.
- Interface compatibility is structural by node name, schema, and markov conditions; name-only matching is not lawful composition or selection.
- Deferred synthesis/refinement is a declared GTL boundary, not imperative runtime mutation. `RefinementBoundary` is the preferred design center because it makes contract truth explicit without introducing vector flags.
- Named materialization profiles and other lawful structural alternatives are best expressed as `CandidateFamily` over a shared contract boundary. Profile choice is external; GTL only publishes the alternatives.
- Policy-visible structural parameters for materialization are carried through immutable `MaterializationRequest.parameters` attributes and must be declared by the publishing module surface rather than inferred from ambient interpreter state.
- `Module` is the publication surface for `GraphFunction`, `RefinementBoundary`, and `CandidateFamily` declarations. Traversal/refinement topology and alternate structural families must be publishable and importable, not ad hoc helper values hidden in implementation code.
- Graph-derived companion bundles are lawful only when they preserve replayable provenance back to a published graph-function materialization.
- Recursive zoom/materialize/fold-back must remain a value transformation sequence. Parent traversal chooses lawful next action, child materialization/refinement produces new immutable records, and fold-back re-enters convergence with explicit lineage and provenance rather than in-place graph mutation.
- `promote` is the explicit representation-lift / join operator in the algebra. It is used when structure must be normalized between fan-out and later reduction or continuation.
- Harvest is not a separate GTL primitive in the current design. The preferred algebraic shape is explicit `fan_out(...) -> promote(...) -> fan_in(...) -> gate(...)` when a representation lift is needed, not hidden "parallel operator tuple" semantics.
- `promote(...)` is explicit because representation lifting is part of the algebra, not an incidental side effect of composition. It is the current design home for lawful normalization/join between declared boundaries.
- `GraphVector` does not carry guard, refinement, harvest, or profile fields. Those concerns belong to `gtl.function_model`, `gtl.algebra`, and policy-visible rule/evaluator declarations.
- `gtl.work_model.Job` is the durable semantic work contract. In this build, `ContractRef(kind=\"graph_vector\")` is the supported steady-state target.
- Roles are declared on jobs in this build. Direct role attachment on graph contracts is deferred until precedence semantics are ratified.
- `edge()` returns `Graph`. `GraphVector` remains the internal contract-step record.
- `GraphVector` is internal — not exported from `gtl.graph.__init__` unless needed by engine internals.
- `Consensus` is not a GTL type. Consensus thresholds are expressed inline in `Rule.config`.
- `work_key` is the canonical runtime work identity. `feature` is an application alias over the same identity.
- `vector_id` is the canonical runtime handle for a contract step. `edge` and `vector_name` are additive readability fields only.
- `Traversal` is a first-class ABG runtime contract. `PrecomputedManifest`, `WorkInstance`, `SelectionResult`, and `AgentResult` remain helper shapes, not prime public ontology.
- Event emission remains an interpreter-edge effect, but the provenance context for that emission is explicit through `EventContext`, not mutable stream-local state.

### 4.4 Event delegation pattern

`abg.selection` and `abg.subwork` are pure kernel modules — they return structured values but do not emit events themselves. Event emission is the responsibility of `abg.interpret`, which has access to `abg.events` via its `abg.*` import rule.

`abg.services` does not emit events directly — it orchestrates through `abg.interpret`, which owns the event emission path.

This follows the same principle as the F_P contract: "F_P does not call the event logger. F_P produces artifacts; F_D reads them and emits events."

Concretely:
- `abg.selection` returns `SelectionDecision` → `abg.interpret` emits `workflow_selected` event
- `abg.subwork.dispatch_leaf()` returns `(output, failure_class)` → `abg.interpret` emits `leaf_task_started`/`completed`/`failed`

**Selection responsibility split**: `abg.selection` owns candidate enumeration and interface validation (REQ-R-ABG2-SELECTION-APPLICATION-001, -003, -004). Strategic choice remains external and must arrive as an explicit `SelectionDecision`. `abg.interpret` owns lawful application — performing the substitution and emitting the selection provenance event (REQ-R-ABG2-SELECTION-APPLICATION-002).

**Convergence responsibility split**: GTL declares evaluator multiplicity, vector topology, and policy-visible rule parameters. `abg.convergence` executes rounds, ordering, and aggregate convergence deterministically. Domain bindings still define the meaning of the judgments.

**Traversal responsibility split**: `abg.interpret` owns the named `Traversal` contract and the `traverse()` entrypoint. It may invoke graph-function materialization, convergence, and lawful selection/refinement, but it does so only through delegated kernel modules and remains the sole event-emission path.

---

## 5. ABG Runtime Model

### 5.1 Types

```python
# abg.events
@dataclass(frozen=True)
class EventContext:
    workflow_version: str = "unknown"
    work_key: str | None = None
    run_id: str | None = None

class EventStream:
    path: Path
    # append(event_type, data, *, context=None)

# abg.binding
@dataclass
class PrecomputedManifest:
    executable_job: ExecutableJob
    current_asset: dict
    failing_evaluators: list[Evaluator]
    passing_evaluators: list[Evaluator]
    fd_results: dict
    relevant_contexts: dict
    missing_contexts: list[str]
    unresolved_count: int
    delta: float
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
    events: tuple[dict, ...] = ()
    artifacts: tuple[str, ...] = ()
    context_consumed: tuple[Context, ...] = ()
    context_emitted: tuple[Context, ...] = ()
    findings: tuple[dict, ...] = ()
    attestations: tuple[dict, ...] = ()
    metadata: Attrs = ()  # realized output-side runtime metadata only

@dataclass(frozen=True)
class Traversal:
    work_key: str
    target: GraphFunction | CandidateFamily | RefinementBoundary
    evaluators: tuple[Evaluator, ...] = ()
    rule: Rule | None = None
    selection: SelectionDecision | None = None
    metadata: Attrs = ()  # input-side runtime metadata only; no hidden strategy

@dataclass
class Worker:
    id: str
    can_execute: list[ExecutableJob]
    role_ids: tuple[str, ...] = ()
    authority_ref: str | None = None

@dataclass(frozen=True)
class RuntimeIdentity:
    engine_id: str = "genesis"
    build_id: str | None = None
    worker_id: str | None = None
    backend_id: str | None = None
    authority_ref: str | None = None

    # compatibility projection: build_id -> worker_id -> engine_id

# abg.lineage
@dataclass(frozen=True)
class WorkInstance:
    """Helper view over one work identity before/alongside run realization."""
    executable_job: ExecutableJob
    work_key: str | None = None
    run_id: str = field(default_factory=lambda: str(uuid.uuid4()))

# abg.run
@dataclass(frozen=True)
class RunState:
    work_key: str | None
    run_id: str
    edge: str
    state: str               # queued|started|dispatched|pending|assessed|failed|timed_out|superseded
    vector_id: str | None = None
    job_id: str | None = None
    worker_id: str | None = None
    role_id: str | None = None
    authority_ref: str | None = None
    failure_class: str | None = None
    attempt_number: int = 1
    superseded_by: str | None = None

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
    module: Module
    workspace_root: Path
    work_key_filter: str | None = None
    edge_filter: str | None = None
    build: str | None = None  # compatibility projection only
    runtime_identity: RuntimeIdentity | None = None
    worker: Worker | None = None
    workflow_version: str = "unknown"

# abg.interpret
@dataclass
class TraversalRuntime:
    module: Module
    executable_job: ExecutableJob
    precomputed: PrecomputedManifest
    workspace_root: Path
    stream: EventStream
    worker: Worker
    spec_hash: str
    runtime_identity: RuntimeIdentity | None = None
    build: str | None = None

@dataclass(frozen=True)
class TraversalOutcome:
    surface: WorkSurface
    result: dict
    updated_module: Module | None = None
    updated_worker: Worker | None = None
```

### 5.2 Canonical ABG runtime types

| Runtime type | Module | Rationale |
| --- | --- | --- |
| `ExecutableJob` | `abg.binding` | Executable resolution of one GTL job to one graph-vector contract |
| `Worker` | `abg.binding` | Concrete actor identity with executable capability, role ids, and authority hook |
| `RuntimeIdentity` | `abg.identity` | Structured engine/build/worker/backend provenance for one runtime scope, with compatibility projection `build_id -> worker_id -> engine_id` |
| `WorkSurface` | `abg.binding` | Immutable execution dossier, elastic context carrier, and audit surface |
| `RunState` | `abg.run` | Execution-attempt lifecycle truth |
| `Traversal` | `abg.interpret` | First-class traversal contract over a target with evaluators and rule |
| `TraversalOutcome` | `abg.interpret` | Immutable result of one traversal attempt, including updated module/worker when refinement occurs |
| `SelectionDecision` | `abg.selection` | Lawful selection/application decision |
| `LeafTask` | `abg.subwork` | Bounded delegated sub-work |
| `Scope` | `abg.services` | Named application/service boundary |

### 5.3 Canonical GTL declaration interpretations

| Concept | GTL surface | Module | Note |
| --- | --- | --- | --- |
| Structural locus | `Node` | `gtl.graph` | Typed graph-local semantic locus |
| Minimal contract step | `GraphVector` | `gtl.graph` | Internal adjacency contract; not rival public ontology |
| Publication boundary | `Module` | `gtl.module_model` | Named, composable declaration boundary |
| Structural alternative family | `CandidateFamily` | `gtl.function_model` + `gtl.module_model` | Named lawful alternatives over one outer contract |
| Semantic capability | `Role` | `gtl.work_model` | Language-owned capability class |
| Semantic work contract | `Job` | `gtl.work_model` | Durable work declaration that binds to GTL contracts |

---

## 6. Canonical Claude Build File Ownership

### 6.1 GTL language files

| Concrete file | Conceptual module | Owns |
| --- | --- | --- |
| `gtl/graph.py` | `gtl.graph` | `Graph`, `Node`, `GraphVector`, `Context` |
| `gtl/operator_model.py` | `gtl.operator_model` | `Operator`, `Evaluator`, `Rule`, `Regime` |
| `gtl/function_model.py` | `gtl.function_model` | `GraphFunction`, `RefinementBoundary`, `CandidateFamily` |
| `gtl/work_model.py` | `gtl.work_model` | `ContractRef`, `Role`, `Job` |
| `gtl/algebra.py` | `gtl.algebra` | compose/substitute/recurse/fan-out/fan-in/gate/promote/deferred_refinement/candidate_family |
| `gtl/module_model.py` | `gtl.module_model` | `Module`, `ModuleImport`, publication of `GraphFunction`, `RefinementBoundary`, and `CandidateFamily` |
| `gtl/__init__.py` | public GTL surface | GTL-only exports |

### 6.2 ABG kernel files

| Concrete file | Conceptual module | Owns |
| --- | --- | --- |
| `genesis/binding.py` | `abg.binding` | `ExecutableJob`, `Worker`, `WorkSurface`, `PrecomputedManifest`, precomputation, prompt assembly |
| `genesis/run.py` | `abg.run` | `RunState`, reducers, pending detection, supersession |
| `genesis/convergence.py` | `abg.convergence` | delta, parent-convergence truth, evaluator-vector aggregation, round handling |
| `genesis/selection.py` | `abg.selection` | `SelectionDecision`, candidate enumeration, family/profile validation |
| `genesis/materialization.py` | `abg.materialization` | `MaterializationRequest`, `MaterializationRecord`, `CompanionBundle`, canonical graph-function materialization, companion-bundle derivation |
| `genesis/provenance.py` | `abg.provenance` | `req_hash()`, `executable_job_hash()`, workflow version reads, per-evaluator and aggregate carry-forward |
| `genesis/correction.py` | `abg.correction` | correction and reset helpers |
| `genesis/subwork.py` | `abg.subwork` | `LeafTask`, schema validation, bounded dispatch |
| `genesis/transport.py` | `abg.transport` | agent dispatch, transport classification, environment sanitization |
| `genesis/interpret.py` | `abg.interpret` | `Traversal`, `traverse()`, schedule, apply-selection, delegated-module event emission |

### 6.3 ABG application and bootstrap files

| Concrete file | Conceptual module | Owns |
| --- | --- | --- |
| `genesis/identity.py` | `abg.identity` | `RuntimeIdentity`, neutral compatibility build projection, worker-bound runtime provenance |
| `genesis/services.py` | `abg.services` | `Scope`, orchestration, service-level command flows |
| `genesis/cli_adapter.py` | `abg.cli` | parser, command wiring, traceability command adapters |
| `genesis/selfhosting.py` | `abg.selfhosting` | structural bootloader consistency and drift checks over exported GTL surface |
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
abg.identity        → (stdlib only)
abg.projection      → abg.events
abg.provenance      → abg.events
abg.correction      → abg.events
abg.binding         → abg.events, abg.projection, abg.provenance, gtl.graph, gtl.operator_model, gtl.work_model
abg.lineage         → abg.events, abg.binding
abg.run             → abg.events
abg.convergence     → abg.events, abg.binding, abg.lineage, abg.run, abg.correction
abg.selection       → gtl.graph, gtl.function_model, gtl.module_model  # returns SelectionDecision; caller emits events
abg.materialization → gtl.graph, gtl.function_model, gtl.module_model, abg.provenance
abg.subwork         → abg.transport                                   # returns (output, failure_class); caller emits events
abg.transport       → (stdlib + subprocess only)
abg.interpret       → abg.*, gtl.*, (except abg.services, abg.cli, abg.install)
abg.selfhosting     → abg.events, abg.binding, gtl.graph

abg.services        → abg.identity, abg.interpret, abg.convergence, abg.provenance
abg.cli             → abg.identity, abg.services, abg.install
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
| GTL graph programming | REQ-L-GTL2-GRAPHFUNCTION, REQ-L-GTL2-COMPOSE, REQ-L-GTL2-SYNTHESIS, REQ-L-GTL2-SUBSTITUTE, REQ-L-GTL2-RECURSE, REQ-L-GTL2-HOF, REQ-L-GTL2-SUBWORK |
| GTL work declarations | REQ-L-GTL2-JOB, REQ-L-GTL2-ROLE, REQ-L-GTL2-IDENTITY |
| GTL publication boundary | REQ-L-GTL2-MODULE, REQ-L-GTL2-SELECTION-BOUNDARY, REQ-L-GTL2-ENGINE-INDEPENDENCE |
| ABG event and replay kernel | REQ-R-ABG2-EVENTS, REQ-R-ABG2-PROJECTION |
| ABG interpretation kernel | REQ-R-ABG2-INTERPRET, REQ-R-ABG2-CONVERGENCE, REQ-R-ABG2-SELECTION-APPLICATION (apply + emit) |
| ABG materialization kernel | REQ-L-GTL2-GRAPHFUNCTION, REQ-M-GTL2-MAPPING, REQ-M-GTL2-PROVENANCE, REQ-R-ABG2-PROVENANCE |
| ABG identity and attempt governance | REQ-R-ABG2-LINEAGE, REQ-R-ABG2-RUN, REQ-R-ABG2-WORKER, REQ-R-ABG2-BINDING |
| ABG provenance and correction | REQ-R-ABG2-PROVENANCE, REQ-R-ABG2-CORRECTION |
| ABG selection and subwork | REQ-R-ABG2-SELECTION-APPLICATION (enumerate + validate), REQ-R-ABG2-LEAFTASK |
| ABG transport | REQ-R-ABG2-TRANSPORT |
| ABG self-hosting | REQ-R-ABG2-SELFHOSTING |
| Alternate runtime mapping layer | REQ-M-GTL2-CAPABILITY |
| Product layer | REQ-P-POLICY, REQ-P-SCENARIOS, REQ-P-QUAL |

---

## 9. Claude Build Module Structure

### GTL declaration kernel

- `gtl.graph` is the structural kernel
- `gtl.operator_model` is the effect and convergence declaration surface
- `gtl.function_model` is the reusable workflow-program surface
- `gtl.function_model` also owns explicit refinement boundaries and named structural alternative families
- `gtl.work_model` is the semantic work-declaration surface
- `gtl.module_model` is the publication and import boundary

**State**: GTL is a pure declaration layer with no runtime ownership leakage.

### ABG execution kernel

- `abg.events` and `abg.projection` are append-only replay truth
- `abg.binding`, `abg.run`, `abg.lineage`, and `abg.convergence` are execution-attempt governance
- `abg.materialization` is canonical graph-function realization and graph-derived companion-bundle derivation
- `abg.provenance` and `abg.correction` are runtime truth-maintenance modules

**State**: the ABG kernel is explicit and testable by responsibility.

### Interpretation, selection, and transport

- `abg.convergence` owns the deterministic protocol of gap triggering, escalation, and convergence visibility
- `abg.selection` is lawful candidate enumeration and validation
- `abg.subwork` is bounded delegated work
- `abg.transport` is the agent transport surface
- `abg.interpret` is the graph-interpretation loop

**State**: engine traversal, evaluator-vector convergence, escalation protocol, and delegated realization match the GTL contract while domain-specific gap semantics remain evaluator-defined.

### Application, self-hosting, and mapping

- `abg.services` is the service and application orchestration layer
- `abg.cli` is the command adapter only
- `abg.install` is the bootstrap and install surface
- `abg.selfhosting` is the bootloader and drift governance layer
- `mapping.*` is the alternate-engine mapping surface

**State**: runtime interfaces and alternate engine mappings remain separated from the kernel.

---

## 10. Claude Build Conformance

For the Claude build to conform to this module design:

1. `gtl.work_model` defines `ContractRef`, `Role`, and GTL `Job`.
2. `gtl.module_model.Module` owns explicit `jobs`, `roles`, and `candidate_families`, and `ModuleImport.names` refers to declaration names.
3. `ExecutableJob` is the only runtime job wrapper; phase-only wrappers do not define runtime ontology.
4. `Worker` retains `can_execute` and adds `role_ids` plus `authority_ref`.
5. `Module.jobs` resolve to executable jobs by `GraphVector.id`; unsupported or unresolved contract kinds fail closed.
6. `WorkSurface` is immutable and carries consumed context, emitted context, artifacts, findings, attestations, and stage-local metadata.
7. `run_bound` and id-first binding provenance preserve `job_id`, `worker_id`, `role_id`, `authority_ref`, and `vector_id` where useful.
8. executable-job hashing incorporates GTL job semantics, role semantics, resolved contract identity, evaluator definitions, and bound context digests using a stable serialization.
9. domain packages publish explicit jobs, roles, and candidate families as part of the authored `Module` surface.
10. structural alternatives, profiles, and refinement boundaries are declared in GTL surfaces rather than inferred from `GraphVector` flags or operator-tuple conventions.
11. canonical execution of a published graph function passes through `MaterializationRequest` and yields a replayable `MaterializationRecord`.
12. graph-derived companion bundles preserve derivation back to one materialization record and do not replace graph as primary structural truth.
13. when refined structure declares deterministic proof surfaces, evaluator bundles are derived from the same replayable materialization/refinement chain rather than from interpreter-local hidden state.

---

## 11. QA Proof Obligations

The minimum proof lane for this correction is:

1. GTL contract tests for `ContractRef`, `Role`, and `Job`:
   - frozen
   - id-bearing
   - structural equality ignores id
2. Module tests:
   - `Module` owns jobs, roles, and candidate families
   - imported jobs, roles, and candidate families preserve declaration identity and provenance
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
8. Algebraic boundary tests:
   - `RefinementBoundary` exposes stable outer contract and carries no hidden selection logic
   - `CandidateFamily` declares lawful alternatives over a shared boundary
   - `fan_out -> fan_in -> gate` can express consensus review and harvest without special `GraphVector` flags
9. Materialization tests:
   - published graph functions materialize through an explicit request/record surface
   - materialization fails closed on undeclared profile or structural parameter use
   - graph-derived companion bundles preserve derivation to one materialization record
   - evaluator-bundle derivation is replayable from refined structure and does not depend on ambient interpreter state

These obligations define the minimum proof that the Claude build matches the constitutional design.

---

## 12. Bottom Line

The module design is:

- **6 GTL modules** — graph, operator_model, function_model, work_model, algebra, module_model
- **14 ABG kernel modules** — events, projection, binding, lineage, run, convergence, selection, materialization, provenance, correction, subwork, transport, interpret, selfhosting
- **3 ABG app modules** — services, cli, install
- **3 mapping modules** — capability, adapter, provenance for alternate runtime families

Every required definition has an explicit V2 home. Every V2 module traces to requirement families. No accidental law, no duplicate ontology.
