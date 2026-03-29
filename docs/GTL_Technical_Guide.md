# GTL Technical Guide

**Version**: 2.0 (GTL 2.x / ABG V2)

---

## Introduction

GTL (Genesis Topology Language) is a Python object model for defining governed work graphs. A GTL system declares typed nodes, transitions between those nodes, operators for performing work, evaluation criteria for checking convergence, governance rules, and semantic work contracts. ABG (Abiogenesis) is the engine that interprets those declarations at runtime.

The authored surface is Python. Modules are written with imports from five GTL packages:

```python
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.function_model import GraphFunction, RefinementBoundary, CandidateFamily
from gtl.operator_model import Operator, Evaluator, Rule, F_D, F_P, F_H
from gtl.work_model import Job, ContractRef, Role
from gtl.module_model import Module
```

GTL 2.x replaces V1 terminology: `Node` replaces `Asset`, `GraphVector` replaces `Edge`, `Module` replaces `Package`, `Graph` is the one first-class structural type.

## GTL In One Page

GTL models work as typed transitions between typed nodes within a graph.

A **Node** is a typed local locus such as `requirements`, `design`, `code`, or `unit_tests`.

A **GraphVector** is an internal adjacency record between nodes. It carries:
- source and target nodes
- operators (effectful actions)
- evaluators (convergence predicates)
- contexts (external constraint dimensions)
- an optional governance rule

**Operators** run in one of three regimes:
- `F_D`: deterministic checks (tests, schema validation)
- `F_P`: probabilistic or agentic work (LLM-driven construction)
- `F_H`: human judgment (approval gates)

**Evaluators** define the stopping conditions for work on a vector. **Jobs** bind vectors to semantic work contracts. **Roles** declare the capability classes needed to perform the work.

A **Module** publishes the complete set of declarations: graphs, functions, boundaries, families, jobs, roles, and metadata. Module is the compilation unit.

The result is a single typed system that describes:
- what can be produced (graph topology)
- how it can be produced (operators and graph functions)
- what evidence is required (evaluators)
- who or what can perform the work (roles and jobs)
- how completion is assessed (convergence via delta)
- where structural alternatives exist (candidate families)

## What Problem GTL Solves

Most workflow definitions split across several surfaces:
- topology in diagrams or YAML
- acceptance criteria in prose
- execution logic in code
- approval rules in documentation or process

GTL keeps those concerns in one typed model.

A GTL definition gives an engine enough information to answer:
- what nodes exist in this domain
- which transitions are legal
- what context a transition depends on
- which checks are deterministic
- where judgment is required
- what structural alternatives are available and how they are selected

This makes the module reviewable before execution and auditable during execution.

---

## Core Types

### Regimes: `F_D`, `F_P`, `F_H`

The regime hierarchy classifies all operations by their ambiguity level:

```python
class Regime:
    """Base class for evaluation/operator regimes."""

class F_D(Regime):
    """Deterministic -- zero ambiguity, pass/fail."""

class F_P(Regime):
    """Probabilistic -- agent/LLM, bounded ambiguity."""

class F_H(Regime):
    """Human -- persistent ambiguity, judgment required."""
```

Escalation follows `F_D -> F_P -> F_H`. When deterministic checks are blocked, work escalates to an agent. When the agent is stuck, work escalates to a human.

### `Context`

Context binds external information into the graph with a stable content hash:

```python
bootloader = Context(
    name="bootloader",
    locator="workspace://build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,
)
```

`locator` uses a known URI scheme (`workspace://`, `git://`, `event://`, `registry://`). `digest` is a `sha256:` content hash -- the constitutional binding for replay determinism.

### `Node`

Node is the typed local locus within a graph. Replaces V1 `Asset`.

```python
@dataclass(frozen=True)
class Node:
    name: str
    schema: type | str = ""
    markov: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

`markov` declares the acceptance conditions that make an instance reusable without re-reading its full construction history. `id` is an opaque UUID4 auto-minted at construction; structural equality ignores it (`compare=False`).

```python
design = Node(name="design")
code = Node(name="code")
candidate_branches = Node(name="candidate_branches", schema="Vector[Candidate]")
```

Nodes with `schema="Vector[...]"` declare explicit vector boundaries used by higher-order operators like `fan_out` and `fan_in`.

### `GraphVector`

GraphVector is the internal adjacency record. Replaces V1 `Edge`.

```python
@dataclass(frozen=True)
class GraphVector:
    name: str
    source: Node | tuple[Node, ...] = None
    target: Node = None
    operators: tuple = ()
    evaluators: tuple = ()
    contexts: tuple[Context, ...] = ()
    rule: Any = None
    allows_subwork: bool = False
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

A vector can have multiple source nodes (co-evolution):

```python
# Unary: design -> code
v_design_code = GraphVector(
    name="design->code",
    source=design,
    target=code,
    operators=(claude_agent, check_impl_op),
    evaluators=(eval_impl_tags, eval_code_fp),
    contexts=(bootloader, design_adrs),
)

# Co-evolution: (code, unit_tests) -> unit_tests
v_tdd = GraphVector(
    name="code<->unit_tests",
    source=(code, unit_tests),
    target=unit_tests,
    operators=(claude_agent, pytest_op),
    evaluators=(eval_tests_pass, eval_coverage_fp),
)
```

### `Operator`

Operator declares an effectful action with a regime and binding URI:

```python
claude_agent = Operator("claude_agent", F_P, "agent://claude/genesis")
pytest_op = Operator("pytest", F_D, "exec://python -m pytest tests/ -q")
human_gate = Operator("human_gate", F_H, "fh://single")
```

URI families: `agent://`, `exec://`, `check://`, `metric://`, `fh://`.

### `Evaluator`

Evaluator declares a convergence predicate. Operators *do* work; evaluators *check* work.

```python
eval_tests_pass = Evaluator(
    "tests_pass", F_D,
    "pytest: zero failures, zero errors",
    binding="exec://python -m pytest build_tenants/abiogenesis/python/test_env/tests/ -q --tb=short",
)

eval_code_fp = Evaluator(
    "code_complete", F_P,
    "Agent: code implements all features per design ADRs",
)

eval_design_fh = Evaluator(
    "design_approved", F_H,
    "Human approves design before any code is written",
)
```

The `description` field is a human-readable convergence contract. `binding` is an optional plugin URI for deterministic evaluators.

### `Rule`

Rule declares a passive constraint:

```python
standard_gate = Rule(
    name="standard_gate",
    kind="gate",
    config={"approve": {"kind": "consensus", "n": 1, "m": 1}, "dissent": "recorded"},
)

harvest_gate = Rule(name="harvest_gate", kind="consensus", config={"quorum": 1})
```

Rules are declarative -- they define *what must hold*, not *how to enforce it*. The engine's `delta()` function reads Rule.config for quorum thresholds.

### `Graph`

Graph is the one first-class structural type. All workflow structure is graph.

```python
@dataclass(frozen=True)
class Graph:
    name: str
    inputs: tuple[Node, ...] = ()
    outputs: tuple[Node, ...] = ()
    nodes: tuple[Node, ...] = ()
    vectors: tuple[GraphVector, ...] = ()
    contexts: tuple[Context, ...] = ()
    rules: tuple = ()
    effects: tuple = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

A primitive single-vector transition, a multi-step workflow, a subgraph, and a reusable workflow template are all `Graph`. There is no separate Workflow or Pipeline type.

```python
sdlc_graph = Graph(
    name="sdlc",
    inputs=(intent,),
    outputs=(unit_tests, bootloader_doc),
    nodes=(intent, requirements, feature_decomp, design, code, unit_tests, bootloader_doc),
    vectors=(v_intent_req, v_req_feat, v_feat_design, v_design_bootdoc, v_design_code, v_tdd),
    contexts=(bootloader, this_spec, intent_doc, design_adrs, specification_dir),
)
```

### `GraphFunction`

GraphFunction is the reusable named workflow abstraction -- a materializable graph template:

```python
@dataclass(frozen=True)
class GraphFunction:
    name: str
    inputs: tuple[Node, ...] = ()
    outputs: tuple[Node, ...] = ()
    template: Callable[..., Graph] | str = ""
    effects: tuple = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

`template` is either a callable that returns a `Graph` (Python DSL convenience) or a serializable string reference. GraphFunctions participate in algebra operations (compose, substitute) and are the candidates within CandidateFamilies.

### `RefinementBoundary`

RefinementBoundary declares a lawful synthesis/refinement point. It says "here is where an interface-compatible inner graph can be produced" without embedding any selection or synthesis logic:

```python
rb_design_code = deferred_refinement(
    "design->code",
    inputs=(design,),
    outputs=(code,),
)
```

Every live GraphVector in a Module must publish either a RefinementBoundary or a CandidateFamily. This is enforced by `validate_module_traversal_surface()`, an explicit kernel function called at `Scope` construction -- not automatically at `Module` construction. Module itself is a pure data type with no `__post_init__` validation.

### `CandidateFamily`

CandidateFamily declares a named family of lawful structural alternatives for one outer contract:

```python
profiles = candidate_family(
    "design->code_profiles",
    inputs=(design,),
    outputs=(code,),
    candidates=(steelthread, mvp, optimal),
    policy_hints={"profiles": ("steelthread", "mvp", "optimal")},
)
```

Validation rules (enforced at construction):
- Candidates must be non-empty
- Every candidate must share the family's declared inputs/outputs contract
- Selection requires an explicit `SelectionDecision` -- no auto-selection

### `ContractRef`, `Role`, `Job`

These are semantic work declarations:

```python
# ContractRef: indirection from Job to the GTL contract it binds
ref = ContractRef(kind="graph_vector", target_id=vector.id)

# Role: semantic capability class
role_constructor = Role(name="constructor", tags=("f_p",))

# Job: durable semantic work contract
job_design_code = Job(
    name="design->code",
    contracts=(ContractRef(kind="graph_vector", target_id=v_design_code.id),),
    roles=(role_constructor,),
)
```

Jobs reference GraphVectors by `.id` via ContractRef. Roles declare what capability is needed (construction, review, approval). Jobs with F_P evaluators typically require a constructor role.

### `Module`

Module is the publication boundary -- the named, composable unit of GTL declarations. Replaces V1 `Package`.

```python
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
    metadata: dict = field(default_factory=dict)
```

`metadata` carries domain-specific declarations visible to policy and evaluator layers. The `requirements` key is the authoritative REQ key registry:

```python
module = Module(
    name="abiogenesis",
    graphs=(sdlc_graph,),
    refinement_boundaries=(rb_intent_req, rb_req_feat, ...),
    jobs=(job_intent_req, job_req_feat, ...),
    roles=(role_constructor,),
    metadata={
        "requirements": [
            "REQ-F-BOOT-001",
            "REQ-F-GRAPH-001",
            "REQ-F-CMD-001",
            ...
        ],
    },
)
```

### Categorical Identity

Every first-class GTL type (Node, GraphVector, Graph, GraphFunction, RefinementBoundary, CandidateFamily, Role, Job) has an opaque `.id` field:

- Auto-minted as UUID4 at construction
- `compare=False`: structural equality ignores identity
- Operations target by `.id`, not by `.name`
- `.name` is a human-readable label; `.id` is the stable reference

```python
from gtl.algebra import same_object

# Identity comparison by .id
assert same_object(node_a, node_a)      # same object
assert not same_object(node_a, node_b)  # different objects, even if same name
```

The `substitute()` algebra operation targets vectors by `.id`. `ContractRef.target_id` binds jobs to vectors by `.id`. This prevents name collisions during graph composition and substitution.

---

## Graph Algebra

GTL provides pure functions over graph types for composition, substitution, recursion, and higher-order operations. All algebra functions live in `gtl.algebra` and have no engine/runtime dependency.

### `compose()` -- Sequential Composition

Variadic left-folded composition. `f.outputs` must satisfy `g.inputs`:

```python
from gtl.algebra import compose

harvest = compose(
    fan_out(worker_branch, over=candidate_branches),
    promote(source=candidate_branches, to=judgment_vector),
    gate(
        fan_in(harvest_reducer, over=judgment_vector),
        rule=harvest_gate,
        evaluators=(judge,),
    ),
)
```

Composition is associative: `compose(f, g, h) == compose(compose(f, g), h)`.

The composed result is a new GraphFunction whose inputs come from the first function and outputs come from the last. When both templates are callable, the composed template merges nodes and vectors from both graphs.

### `substitute()` -- Contract-Preserving Refinement

Replace a coarse contract vector with an interface-compatible inner graph:

```python
from gtl.algebra import substitute

refined = substitute(outer_graph, target_vector.id, inner_graph)
```

`substitute()` targets by vector `.id` (no name fallback). It validates:
- `inner.inputs` are a subset of the vector's source nodes
- `inner.outputs` contain the vector's target node
- The outer graph's inputs/outputs are preserved

The result is a new Graph with the target vector replaced by the inner graph's vectors, plus any new nodes and contexts merged in. A `substituted:{vector_name}` tag is appended.

### `identity()` -- Neutral Element

```python
from gtl.algebra import identity

id_fn = identity(interface=(design, code))
```

Returns a GraphFunction that passes through its interface unchanged. Neutral element under composition.

### `recurse()` -- Bounded Repetition

```python
from gtl.algebra import recurse

iterate_until_stable = recurse(refine_fn, termination=convergence_check)
```

Returns a GraphFunction with the same outer contract, annotated with a `termination:{evaluator_name}` tag. Recursion is bounded by the termination evaluator. The engine (ABG) owns the execution loop.

### Higher-Order Operators

#### `fan_out()` -- Parallel Distribution

Apply a function across an explicit Vector boundary:

```python
candidate_branches = Node(name="candidate_branches", schema="Vector[Candidate]")
worker_branch = GraphFunction(name="worker_branch", inputs=(candidate_branches,), ...)

distributed = fan_out(worker_branch, over=candidate_branches)
```

`over` must declare an explicit `Vector[...]` schema. No hidden inference of cardinality.

#### `fan_in()` -- Reduction

Reduce an explicit vector boundary into one synthesized result:

```python
judgment_vector = Node(name="judgment_vector", schema="Vector[Judgment]")
selected_candidate = Node(name="selected_candidate", schema="Candidate")
harvest_reducer = GraphFunction(
    name="harvest_reducer",
    inputs=(judgment_vector,),
    outputs=(selected_candidate,),
    template="harvest_reducer_template",
)

reduced = fan_in(harvest_reducer, over=judgment_vector)
```

#### `gate()` -- Conditional Continuation

Block continuation behind a rule and evaluators:

```python
gated = gate(
    fan_in(harvest_reducer, over=judgment_vector),
    rule=Rule(name="harvest_gate", kind="consensus", config={"quorum": 1}),
    evaluators=(judge,),
)
```

`gate()` accepts GraphFunction, RefinementBoundary, or CandidateFamily as targets. It does not choose candidates, invent refinements, or define pass/fail semantics -- it only blocks.

#### `promote()` -- Representation Lifting

Lift one declared representation boundary into another:

```python
lifted = promote(source=candidate_branches, to=judgment_vector)
```

Both arguments are mandatory. Promote does not change semantic truth -- only the declared representation boundary for later algebraic steps.

### Synthesis and Selection Sugar

#### `deferred_refinement()`

Convenience for constructing a `RefinementBoundary`:

```python
boundary = deferred_refinement(
    "raw_contract->discovered_context",
    inputs=(raw_contract,),
    outputs=(discovered_context,),
    hints={"use_case": "gap_triggered_context_discovery"},
)
```

#### `candidate_family()`

Convenience for constructing a `CandidateFamily` with contract validation:

```python
family = candidate_family(
    "design->code_profiles",
    inputs=(design,),
    outputs=(code,),
    candidates=(steelthread, mvp, optimal),
    policy_hints={"profiles": ("steelthread", "mvp", "optimal")},
)
```

#### `edge()` -- DSL Sugar

Construct a minimal one-vector graph:

```python
from gtl.algebra import edge

g = edge(source_node, target_node, operators=(op,), evaluators=(ev,))
```

---

## ABG Engine Types

ABG (Abiogenesis) is the runtime engine that interprets GTL declarations. GTL owns declaration (structure, types, laws); ABG owns runtime (events, projection, convergence, traversal, binding).

### Convergence: `EvaluatorOutcome`, `ConvergenceResult`, `delta()`

ABG computes convergence deterministically from typed evaluator outcomes:

```python
from genesis.convergence import EvaluatorOutcome, ConvergenceResult, delta

@dataclass(frozen=True)
class EvaluatorOutcome:
    contract_id: str
    evaluator_name: str
    regime: type[Regime]               # F_D, F_P, or F_H
    status: Literal["pass", "fail", "open", "error"]
    round_index: int
    rationale: str = ""
```

`delta()` aggregates outcomes into a convergence result:

```python
result = delta(
    "contract-u3",
    outcomes=(
        EvaluatorOutcome("contract-u3", "judge_1", F_P, "pass", 0),
        EvaluatorOutcome("contract-u3", "judge_2", F_P, "pass", 0),
        EvaluatorOutcome("contract-u3", "judge_3", F_P, "pass", 0),
        EvaluatorOutcome("contract-u3", "judge_4", F_P, "fail", 0),
        EvaluatorOutcome("contract-u3", "judge_5", F_P, "fail", 0),
    ),
    rule=Rule(name="consensus_gate", kind="consensus", config={"quorum": 4}),
)

assert result.aggregate_state == "open"      # 3/5 passes, quorum is 4
assert result.next_action == "repeat_round"  # quorum not met, try again
```

`ConvergenceResult` carries the aggregate state, next action, escalation target, and all individual outcomes. When `delta = 0` (all evaluators pass), the system is at rest.

Escalation policy:
- `F_D` fails -> escalate to `F_P` (if available on this vector)
- `F_P` fails -> escalate to `F_H`
- `F_H` approves -> return to `F_D` (approved -> deploy)

### Traversal: `Traversal`, `TraversalRuntime`, `traverse()`

Traversal is the first-class ABG runtime traversal contract:

```python
from genesis.interpret import Traversal, TraversalRuntime, TraversalOutcome, traverse

@dataclass(frozen=True)
class Traversal:
    work_key: str
    target: GraphFunction | CandidateFamily | RefinementBoundary
    evaluators: tuple[Evaluator, ...] = ()
    rule: Rule | None = None
    selection: SelectionDecision | None = None
    metadata: dict = field(default_factory=dict)
```

Invariants enforced at construction:
- `work_key` must be non-empty
- `metadata` must not carry hidden strategy keys (e.g., `"strategy"`, `"candidate_choice"`)
- `selection` is only valid when `target` is a `CandidateFamily`
- A `CandidateFamily` target requires an explicit `SelectionDecision`

`TraversalRuntime` carries the execution context:

```python
runtime = TraversalRuntime(
    module=module,
    executable_job=executable_job,
    precomputed=precomputed_manifest,
    workspace_root=tmp_path,
    stream=event_stream,
    worker=worker,
    spec_hash="spec-u1",
    work_key="FEAT-AUTH-001",  # work identity (feature, spawned child, etc.)
)
```

Note: `work_key` is the canonical work identity -- typically a feature ID (`"FEAT-AUTH-001"`) or a spawned child key (`"FEAT-AUTH-001/design->code/mvp_profile/design->prototype"`). It is distinct from `vector.id`, which is the opaque contract handle for algebra and binding operations. The two are never interchangeable.

`traverse()` dispatches based on target type:
- **CandidateFamily target**: validates the selection, materializes the candidate, calls `substitute()`, spawns child work items, emits `workflow_selected` events
- **RefinementBoundary target**: runs the iteration loop (bind F_D -> dispatch F_P -> gate F_H)

```python
outcome = traverse(traversal, runtime=runtime, surface=WorkSurface())

assert outcome.result["status"] in ("selected", "iterated", "pending")
assert outcome.surface.events  # events emitted during traversal
```

### Selection: `SelectionDecision`

Selection is explicit and replayable:

```python
from genesis.selection import SelectionDecision

decision = SelectionDecision(
    contract_id=vector.id,          # opaque contract handle (vector .id)
    work_key="FEAT-AUTH-001",       # work identity (feature, spawned child, etc.)
    graph_function="mvp_profile",
    selected_by="test_policy",
    selection_mode="explicit",
    rationale="materialize mvp profile for current contract",
)
```

`contract_id` references the GraphVector being refined (by `.id`). `work_key` identifies the unit of work this selection belongs to (feature, spawned child, etc.). These are distinct identities serving different roles in the runtime.

No auto-selection. The engine does not choose candidates -- an external policy or human provides the `SelectionDecision`, and the engine validates and applies it. This is a constitutional design choice: the language declares alternatives, the engine validates choices, but neither decides.

---

## Event Stream

Node state is derived by projection over an append-only event stream:

```
State<Tn> := project(EventStream[0..n], node_type, instance_id)
```

- **Determinism**: `project(S, T, I) = project(S, T, I)` always (same stream, same type, same instance produces identical projection)
- **`emit()` is the only write path**. `event_time` is system-assigned at append.
- **F_P does NOT call the event logger**. F_P produces artifacts; F_D reads them and emits events.
- Recovery is replay. No state lost beyond the current `traverse()` call.

Key event types:
- `genesis_installed` -- emitted by the installer (`gen-install.py`), not by `workspace_bootstrap()`
- `edge_started` -- traversal begins on a vector
- `run_bound` -- worker bound to a job
- `fp_dispatched` -- F_P evaluator dispatched
- `assessed{kind: fp}` -- F_P result recorded (snapshot-bound via `spec_hash`)
- `edge_converged` -- vector converged (delta = 0)
- `workflow_selected` -- candidate selection applied
- `work_spawned` -- child work items created from selection

---

## Real Domain Example: SDLC

The `abiogenesis` project spec (`gtl_spec/packages/abiogenesis.py`) demonstrates a complete V2 module for software delivery:

### Graph Topology

```
intent -> requirements -> feature_decomp -> design -> code <-> unit_tests
                                                  \-> bootloader_doc
```

7 nodes, 6 vectors, 5 contexts, 6 operators, 15 evaluators across three regimes.

### Declaration Pattern

```python
# 1. Contexts -- external constraint surfaces
bootloader = Context(
    name="bootloader",
    locator="workspace://build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,
)

# 2. Operators -- effectful actions
claude_agent = Operator("claude_agent", F_P, "agent://claude/genesis")
pytest_op = Operator("pytest", F_D, "exec://python -m pytest tests/ -q")

# 3. Nodes -- typed loci
intent = Node(name="intent")
code = Node(name="code")

# 4. Evaluators -- convergence predicates (one per check)
eval_tests_pass = Evaluator(
    "tests_pass", F_D,
    "pytest: zero failures, zero errors",
    binding="exec://python -m pytest build_tenants/abiogenesis/python/test_env/tests/ -q --tb=short",
)
eval_code_fp = Evaluator(
    "code_complete", F_P,
    "Agent: code implements all features per design ADRs",
)

# 5. Vectors -- transitions with local metadata
v_design_code = GraphVector(
    name="design->code",
    source=design,
    target=code,
    operators=(claude_agent, check_impl_op),
    evaluators=(eval_impl_tags, eval_impl_coverage, eval_code_fp),
    contexts=(bootloader, this_spec, design_adrs),
)

# 6. Graph -- the complete topology
sdlc_graph = Graph(
    name="sdlc",
    inputs=(intent,),
    outputs=(unit_tests, bootloader_doc),
    nodes=(intent, requirements, feature_decomp, design, code, unit_tests, bootloader_doc),
    vectors=(v_intent_req, v_req_feat, v_feat_design, v_design_bootdoc, v_design_code, v_tdd),
    contexts=(bootloader, this_spec, intent_doc, design_adrs, specification_dir),
)

# 7. Roles -- semantic capability classes
role_constructor = Role(name="constructor", tags=("f_p",))

# 8. Jobs -- one per vector, bound via ContractRef
job_design_code = Job(
    name="design->code",
    contracts=(ContractRef(kind="graph_vector", target_id=v_design_code.id),),
    roles=(role_constructor,),
)

# 9. Refinement boundaries (or CandidateFamily -- each vector needs one or the other)
rb_design_code = deferred_refinement(
    "design->code",
    inputs=(design,),
    outputs=(code,),
)

# 10. Module -- the publication unit
module = Module(
    name="abiogenesis",
    graphs=(sdlc_graph,),
    refinement_boundaries=(rb_intent_req, rb_req_feat, ...),
    jobs=(job_intent_req, job_req_feat, ...),
    roles=(role_constructor,),
    metadata={"requirements": ["REQ-F-BOOT-001", "REQ-F-GRAPH-001", ...]},
)
```

---

## Use Case Patterns

### U1: Materialization Profiles (CandidateFamily + SelectionDecision)

When multiple implementation strategies exist for a single contract, declare them as a CandidateFamily:

```python
steelthread = GraphFunction("steelthread_profile", ...)
mvp = GraphFunction("mvp_profile", ...)
optimal = GraphFunction("optimal_profile", ...)

profiles = candidate_family(
    "design->code_profiles",
    inputs=(design,),
    outputs=(code,),
    candidates=(steelthread, mvp, optimal),
    policy_hints={"profiles": ("steelthread", "mvp", "optimal")},
)

# Traversal requires explicit selection
traversal = Traversal(
    work_key="FEAT-AUTH-001",       # work identity
    target=profiles,
    selection=SelectionDecision(
        contract_id=vector.id,      # contract handle (vector .id)
        work_key="FEAT-AUTH-001",   # work identity
        graph_function="mvp_profile",
        selected_by="test_policy",
        selection_mode="explicit",
        rationale="materialize mvp profile for current contract",
    ),
    evaluators=vector.evaluators,
)

outcome = traverse(traversal, runtime=runtime, surface=WorkSurface())
assert outcome.result["status"] == "selected"
assert outcome.result["graph_function"] == "mvp_profile"
```

After selection, `substitute()` replaces the coarse vector with the candidate's inner graph. The module is updated with new vectors and jobs for the child work items.

### U2: Gap-Triggered Refinement (RefinementBoundary)

When the iteration path is not a structural choice but a discovery process:

```python
boundary = deferred_refinement(
    "raw_contract->discovered_context",
    inputs=(raw_contract,),
    outputs=(discovered_context,),
    hints={"use_case": "gap_triggered_context_discovery"},
)

traversal = Traversal(
    work_key="FEAT-DISCOVERY-001",  # work identity
    target=boundary,
    evaluators=vector.evaluators,
)

outcome = traverse(traversal, runtime=runtime, surface=WorkSurface())
assert outcome.result["status"] == "iterated"
assert outcome.result["blocking_reason"] == "fp_dispatch"
```

The engine runs the iteration loop: bind F_D, discover gaps, dispatch F_P for construction. No selection decision needed.

### U3: Consensus-Gated Review (Multi-Judge Convergence)

Multiple F_P judges assess the same contract boundary with a quorum rule:

```python
rule = Rule(name="consensus_gate", kind="consensus", config={"quorum": 4})
outcomes = (
    EvaluatorOutcome("contract-u3", "judge_1", F_P, "pass", 0),
    EvaluatorOutcome("contract-u3", "judge_2", F_P, "pass", 0),
    EvaluatorOutcome("contract-u3", "judge_3", F_P, "pass", 0),
    EvaluatorOutcome("contract-u3", "judge_4", F_P, "fail", 0),
    EvaluatorOutcome("contract-u3", "judge_5", F_P, "fail", 0),
)

result = delta("contract-u3", outcomes, rule=rule)
assert result.aggregate_state == "open"       # 3/5, need 4
assert result.next_action == "repeat_round"
```

### U4: Parallel Worker Harvest (fan_out -> promote -> fan_in -> gate)

Explicit parallel topology using higher-order operators:

```python
candidate_branches = Node(name="candidate_branches", schema="Vector[Candidate]")
judgment_vector = Node(name="judgment_vector", schema="Vector[Judgment]")
selected_candidate = Node(name="selected_candidate", schema="Candidate")

harvest = compose(
    fan_out(worker_branch, over=candidate_branches),
    promote(source=candidate_branches, to=judgment_vector),
    gate(
        fan_in(harvest_reducer, over=judgment_vector),
        rule=Rule(name="harvest_gate", kind="consensus", config={"quorum": 1}),
        evaluators=(judge,),
    ),
)

assert harvest.inputs == (candidate_branches,)
assert harvest.outputs == (selected_candidate,)
assert "over:candidate_branches" in harvest.tags
assert "rule:harvest_gate" in harvest.tags
```

---

## GTL/ABG Boundary

GTL and ABG have a strict separation of concerns:

| Concern | Owner | Examples |
|---------|-------|---------|
| Structure declaration | GTL | Graph, Node, GraphVector, Module |
| Function abstraction | GTL | GraphFunction, CandidateFamily, algebra |
| Convergence declaration | GTL | Evaluator, Rule |
| Work declaration | GTL | Job, Role, ContractRef |
| Traversal execution | ABG | traverse(), TraversalRuntime |
| Delta computation | ABG | delta(), EvaluatorOutcome, ConvergenceResult |
| Selection application | ABG | apply_selection(), validate_selection() |
| Event emission | ABG | EventStream, emit() |
| Projection | ABG | project() |
| Binding | ABG | bind_fd(), bind_fp(), PrecomputedManifest |

GTL types have no runtime dependency. ABG types import GTL types but not the reverse.

---

## Validation Rules

Validation is split across two enforcement sites:

**Constructor-enforced** (fail at instantiation via `__post_init__`):

1. `Context.digest` must start with `sha256:`
2. `Context.locator` must use a known URI scheme (`workspace://`, `git://`, `event://`, `registry://`)
3. `Operator.regime` and `Evaluator.regime` must be `Regime` subclasses (`F_D`, `F_P`, or `F_H`)
4. `CandidateFamily.candidates` must be non-empty
5. `CandidateFamily` candidates must share the family's declared inputs/outputs contract
6. `Traversal.work_key` must be non-empty
7. `Traversal.metadata` must not carry hidden strategy keys
8. `Traversal.selection` is only valid when `target` is a `CandidateFamily`
9. `Traversal` over `CandidateFamily` requires an explicit `SelectionDecision`

**Kernel-function-enforced** (fail when explicitly called, e.g., at `Scope` construction):

10. `validate_module_traversal_surface()`: every live GraphVector must publish a RefinementBoundary or CandidateFamily
11. `validate_module_selection_surface()`: GraphFunctions matching live vector contracts must be published via CandidateFamily (no hidden alternatives)

**Call-site-enforced** (fail when the operation is invoked):

12. `delta()` rejects empty outcomes or mixed `contract_id` values
13. `substitute()` validates interface compatibility (inner inputs subset of source, inner outputs contain target)
14. `fan_out()` and `fan_in()` require explicit `Vector[...]` schema on the `over` node

Note: `Module` itself has no `__post_init__` -- it is a pure frozen data container. The module-level surface checks (10, 11) are enforced by `Scope.__post_init__()` in `genesis.services`, not by Module construction. Instantiating a Module with missing boundaries will succeed; binding it into a Scope will fail.

---

## Language Laws

GTL 2.x is governed by 16 constitutional laws (from the GTL 2 Constitutional Design):

1. **Graph Primacy**: Graph is the one first-class structural type
2. **Typed Node Law**: Node[T] carries its declared schema, markov conditions, and identity
3. **Interface Law**: Every structural type has inputs/outputs; compatibility is checked at algebra boundaries
4. **Operator/Evaluator Separation**: Operators perform work; evaluators check work. Never conflated.
5. **Composition Associativity**: `compose(f, g, h) == compose(compose(f, g), h)`
6. **Identity Function**: `identity()` is the neutral element under composition
7. **Substitutability**: `substitute(outer, contract_vector, inner)` preserves outer contract
8. **Contract Preservation**: Algebra operations never violate declared input/output contracts
9. **Deferred Refinement**: RefinementBoundary declares lawful synthesis without embedding strategy
10. **Recursion With Lineage**: `recurse()` is bounded by a declared termination evaluator
11. **Higher-Order Legality**: fan_out/fan_in/gate/promote are lawful under explicit boundaries only
12. **Separation From Strategy**: Language declares alternatives; engine validates choices; neither decides
13. **Event-Sourced Suitability**: Assets are projections of append-only event streams
14. **Engine Independence**: GTL types have no runtime dependency; algebra is pure
15. **Categorical Identity**: Every first-class type has opaque `.id` distinct from `.name`
16. **Semantic/Execution Separation**: Module is a pure declaration boundary; runtime concerns belong to ABG

---

## Runtime Boundary

The boundary between authored model and runtime state matters for replay and audit.

**Authored in Python** (GTL):
- Module structure (graphs, nodes, vectors)
- Graph functions, refinement boundaries, candidate families
- Operators, evaluators, rules
- Contexts with digest bindings
- Jobs, roles, contract references

**Derived at runtime** (ABG):
- Event stream (append-only)
- Traversal outcomes
- Convergence results (delta computations)
- Selection results and substituted graphs
- F_P dispatch manifests
- Precomputed manifests (bind_fd results)
- Worker scheduling batches
