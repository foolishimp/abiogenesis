# GTL 2.x Constitutional Design

**Status**: Accepted
**Date**: 2026-03-25
**Purpose**: State the canonical present-tense GTL 2.x design, type model, language semantics, and GTL/ABG boundary as the authoritative design surface.

---

## 1. Position

GTL 2.x is a language redesign, not a parser redesign.

It remains:

- an embedded Python DSL
- an SDK
- a programmatic language surface

What changes is the semantic center and the rigor of the model.

GTL 2.x is:

- graph-first
- composition-first
- recursion-capable
- higher-order
- engine-agnostic

ABG is then positioned as:

- the canonical target engine surface for GTL

but not the only possible engine mapping.

---

## 2. Core Thesis

The irreducible structural type of GTL 2.x is `Graph`.

Everything structural is graph:

- a primitive graph vector is graph
- a multi-step workflow is graph
- a subgraph is graph
- a reusable workflow is graph
- a refined workflow is graph
- a recursively applied workflow is graph

There is no need for a second structural ontology.

This yields the core simplification:

- `Graph` is the one structural type
- `Node[T]` is the typed local locus of graph meaning
- `Operator` is the effectful action surface
- `Evaluator` is the convergence/attestation surface
- `GraphFunction` is the reusable workflow/program abstraction
- `Role` is the semantic capability class
- `Job` is the durable semantic work contract
- composition, substitution, recursion, and higher-order operators are graph semantics

---

## 2A. Layered Graph Model

The phrase "everything structural is graph" does not mean there is only one graph.

It means the same algebra appears at multiple layers.

### Topology graph

The admissible structure of work:

- what nodes exist
- what graph vectors are lawful
- what composition and substitution are admissible

This is GTL-owned.

### Materialized graph

A concrete graph instance produced from graph templates/functions and parameters.

This sits at the GTL/engine boundary.

### Execution graph

A concrete traversal of the topology/materialized graph under actual operator and evaluator activity.

This is engine-owned.

### Lineage graph

Multiple related graph executions across work lineage.

This is engine-owned.

### Composition graph

Graphs built from graphs/functions by composition, substitution, and higher-order combinators.

This is GTL-owned.

This layered view is the right answer to branching and collection-like behavior:

- fan-out is graph materialization into branching execution structure
- fan-in is graph reduction across branch executions
- promotion is graph reshaping between compatible interface forms

---

## 3. Constitutional Intent

### INT-GTL2-001: Graph Primacy and Typed Nodes

GTL 2.x shall treat `Graph` as the one first-class structural type.

Graphs shall be composed from typed nodes.

An edge is not a rival type.

It is a minimal graph vector between typed nodes.

### INT-GTL2-002: Embedded Python Form

GTL 2.x shall remain an embedded Python DSL/SDK.

It shall not depend on a new standalone parser or syntax.

### INT-GTL2-003: Operators as First-Class Regimes

GTL 2.x shall model effectful action through first-class `Operator` declarations.

The language must support at least:

- deterministic
- probabilistic
- human/judgment

### INT-GTL2-003A: Evaluators as First-Class Convergence Surfaces

GTL 2.x shall model convergence, checking, and attestation through first-class `Evaluator` declarations.

Operators do work.

Evaluators determine whether graph contracts have been satisfied.

### INT-GTL2-004: Graph Functions as Reusable Workflow Programs

GTL 2.x shall support reusable named workflow programs through `GraphFunction`.

### INT-GTL2-005: Composition and Substitution

GTL 2.x shall make lawful composition and lawful substitution native operations.

### INT-GTL2-005A: Deferred Synthesis and Lawful Refinement

GTL 2.x shall be able to declare lawful synthesis/refinement points where externally supplied logic may produce or select an interface-compatible refinement without embedding hidden strategic choice in the interpreter.

### INT-GTL2-006: Recursion and Higher-Order Graph Programming

GTL 2.x shall support:

- recursive graph application
- fan-out
- fan-in
- gating
- promotion

### INT-GTL2-007: Structural Selection Boundary

GTL 2.x may expose lawful candidates, interface families, tags, and hints.

GTL 2.x shall not embed hidden strategic choice.

### INT-GTL2-008: ABG as Canonical Interpreter

ABG shall be treated as the canonical target engine surface for GTL programs, not part of GTL's structural ontology.

Multiple ABG-compatible implementations may exist.

The current local/workspace implementation is only one realization of that surface.

### INT-GTL2-009: Engine Independence

GTL 2.x shall be defined independently of any single engine implementation.

### INT-GTL2-010: Replay Suitability

GTL 2.x constructs shall be defined so they can be lawfully interpreted by an event-sourced runtime.

### INT-GTL2-011: Clean Re-foundation

GTL 2.x shall be specified as a clean, internally coherent language design with present-tense constitutional wording.

### INT-GTL2-012: Semantic Jobs and Roles

GTL 2.x shall support durable semantic work contracts through `Job` and semantic capability classes through `Role`.

These belong to the language declaration surface, not to one runtime implementation.

### INT-GTL2-013: Worker / Run Realization with External Authority Boundary

ABG shall realize GTL jobs through `Run`, bind concrete `Worker` identities to GTL roles, and preserve external authority hooks without becoming the authentication or authority-resolution system.

---

## 4. What GTL 2.x Is and Is Not

### GTL 2.x is

- a graph-first Python DSL/SDK
- a compositional semantic library
- a language for expressing deterministic, probabilistic, and judgment-bearing workflow programs
- a structural definition that can map onto multiple runtimes
- a language whose canonical engine contract may have multiple implementations

### GTL 2.x is not

- a planner
- a business-priority engine
- a hidden workflow selector
- a runtime/event model
- a single-engine language whose semantics collapse into ABG

---

## 5. Domain Model

### 5.1 Graph

`Graph` is the primary workflow/program value.

Conceptually:

```python
@dataclass(frozen=True)
class Graph:
    name: str
    inputs: tuple[Node[Any], ...]
    outputs: tuple[Node[Any], ...]
    nodes: tuple[Node[Any], ...]
    vectors: tuple[GraphVector, ...]
    id: str
    contexts: tuple[Context, ...] = ()
    rules: tuple[Rule, ...] = ()
    effects: tuple[Regime, ...] = ()
    tags: tuple[str, ...] = ()
```

Responsibilities:

- declare boundary/interface
- contain internal structure
- carry local constraints
- declare or derive composed execution regimes
- serve as the unit of substitution and composition

### 5.2 Node[T]

`Node[T]` is the local typed locus within a graph.

Conceptually:

```python
@dataclass(frozen=True)
class Node(Generic[T]):
    name: str
    schema: type[T] | str
    id: str
    markov: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
```

Meaning:

- node references are graph-local while object identity remains explicit
- node type/schema defines the semantic kind that flows there
- node `markov` carries declared state/acceptance conditions at that locus
- multiple nodes may share the same schema while remaining distinct nodes

### 5.3 Interface

Interface is expressed through designated boundary nodes.

Inputs and outputs are graph roles over nodes, not a rival structural type.

### 5.4 GraphVector

`GraphVector` is a directed graph vector between typed nodes.

Conceptually:

```python
@dataclass(frozen=True)
class GraphVector:
    name: str
    source: Node[Any] | tuple[Node[Any], ...]
    target: Node[Any] | tuple[Node[Any], ...]
    id: str
    operators: tuple[Operator, ...] = ()
    evaluators: tuple[Evaluator, ...] = ()
    contexts: tuple[Context, ...] = ()
    rule: Rule | None = None
    tags: tuple[str, ...] = ()
```

It is:

- a graph-local contract step
- a minimal graph shape
- not a rival ontology

Publicly, `edge(a, b, operators=...) -> Graph` can remain as DSL sugar for a primitive graph.

### 5.5 Schema families

`Node[T]` supports schema families as type parameters:

- `Vector[T]` — when a node carries a collection of `T`. This is the semantic foundation for `fan_out`, `fan_in`, and `promote`. Graph materialization may depend on collection cardinality. `Vector[T]` is not a rival structural type — the locus is `Node[Vector[T]]`.
- Asset-style payload schemas are represented through `Node[T]` plus node markov conditions. `Asset` is not a structural center.

### 5.6 Operator

`Operator` is the typed effectful action surface.

Conceptually:

```python
@dataclass(frozen=True)
class Operator:
    name: str
    regime: Regime
    binding: str
    tags: tuple[str, ...] = ()
```

Regimes include:

- deterministic
- probabilistic
- human

Operators perform work or effectful transitions over graph contracts.

### 5.7 Evaluator

`Evaluator` is the typed convergence and attestation surface.

Conceptually:

```python
@dataclass(frozen=True)
class Evaluator:
    name: str
    regime: Regime
    binding: str
    description: str = ""
    tags: tuple[str, ...] = ()
```

Evaluators answer:

- is this graph contract satisfied?
- has this output converged?
- has this gate been passed?

Evaluators may be:

- deterministic checks
- probabilistic assessments
- human sign-offs

The constitutional split is:

- `Operator` answers "who/what does work"
- `Evaluator` answers "what checks or attests convergence"

Evaluators are first-class GTL declarations.

Their realization is plugin-dependent.

So the clean split is:

- GTL declares `Evaluator`
- engine plugins provide evaluator bindings/implementations
- ABG-compatible engines create evaluation instances, attempts, results, and provenance

### 5.8 Rule

`Rule` is a declarative constraint or gate.

Conceptually:

```python
@dataclass(frozen=True)
class Rule:
    name: str
    kind: str = "policy"
    config: dict[str, Any] = field(default_factory=dict)
    tags: tuple[str, ...] = ()
```

Examples:

- consensus thresholds
- policy gates
- type-consistency rules
- coverage rules

Rules are passive declarations.

They describe what must hold.

Gate behavior belongs in `config`, not in Rule-level execution fields.

### 5.9 GraphFunction

`GraphFunction` is the primary reusable GTL compute abstraction.

Conceptually:

```python
@dataclass(frozen=True)
class GraphFunction:
    name: str
    inputs: tuple[Node[Any], ...]
    outputs: tuple[Node[Any], ...]
    template: Callable[..., Graph] | GraphTemplate
    id: str
    effects: tuple[Regime, ...] = ()
    tags: tuple[str, ...] = ()
```

Semantically, a graph function is a parameterized graph template with a stable outer contract.

An algebraic reading is:

```text
GraphFunction : A -> Workflow[B]
```

This is not a mandatory runtime type.

It means `GraphFunction` is the lawful unit of reuse, composition, refinement, recursion, and higher-order application.

In the embedded Python DSL, that template may be authored as a callable that materializes a graph.

`GraphTemplate` here means any serializable or materializable graph-template representation.

The callable form is an authoring convenience, not the semantic requirement.

For engine independence, the semantic contract is not "arbitrary Python behavior."

It is "materializable graph template with explicit interface and declared effects."

Graph materialization may legitimately depend on parameters such as:

- input cardinality
- selected workflow family
- policy-visible structural parameters

What is engine-independent is the template contract and resulting graph semantics, not the host-language callable itself.

The `effects` surface is used for:

- static analysis
- candidate filtering
- engine capability matching
- human-vs-machine workflow visibility

### 5.10 Role

`Role` is the semantic capability class required to perform, supervise, or approve work.

Conceptually:

```python
@dataclass(frozen=True)
class Role:
    name: str
    id: str
    tags: tuple[str, ...] = ()
    policy_hooks: dict[str, Any] = field(default_factory=dict)
```

`Role` is not a concrete actor identity.

It expresses semantic capability and approval class in the language.

Authentication and authority resolution remain external to GTL.

### 5.11 Job

`Job` is the durable semantic work contract.

Conceptually:

```python
@dataclass(frozen=True)
class Job:
    name: str
    id: str
    contract_refs: tuple[str, ...] = ()
    roles: tuple[Role, ...] = ()
    tags: tuple[str, ...] = ()
```

Semantically, a job is not one run attempt.

It is the named work contract that may be realized many times by an engine.

The exact contract reference form may vary by implementation.

What is constitutional is:

- durable semantic identity
- reference to GTL work semantics
- declared role requirements

### 5.12 Module

`Module` is the top-level organizational unit.

Conceptually:

```python
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
    imports: tuple[str, ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)
```

A module owns:

- graphs
- graph functions
- jobs
- roles
- operators
- evaluators
- rules
- imports
- metadata visible to policy/evaluator layers

Modules may be published as reusable workflow libraries.

Imported graph functions must preserve:

- interface truth
- declared effects
- module provenance

---

## 6. Core Semantics

### 6.1 Graph primacy

All workflow structure is graph.

### 6.2 Typed node primacy

Local graph meaning is carried by typed nodes.

### 6.3 Interface satisfaction

Composition and substitution are only lawful when interfaces align.

### 6.4 Evaluator separation

Work and convergence remain distinct concerns.

Operators perform or dispatch work.

Evaluators check or attest convergence.

### 6.5 Contract preservation

Internal refinement may change structure but must preserve declared outer contract.

### 6.6 Reuse

Named workflows are reusable through graph functions, not through copied structure.

### 6.7 Deferred lawful refinement

Deferred synthesis/refinement may change internal realized structure but must preserve the declared outer contract.

The language may declare that a refinement boundary exists and what contract it must satisfy.

The language shall not hide strategic choice inside the interpreter.

### 6.8 Higher-order legality

Fan-out, fan-in, gate, and promote must preserve interface/type truth.

### 6.9 Bounded sub-work expressibility

The language may declare that a graph vector or graph function permits bounded sub-work dispatch.

The runtime realization of that declaration is not a language primitive.

ABG may realize it through `LeafTask` or an equivalent runtime construct.

This is the clean answer to leaf-task placement:

- GTL can express bounded sub-work capability
- ABG-compatible engines choose how to realize that capability operationally

### 6.10 Execution collapse

ABG execution collapses to lawful iteration over a single contract step.

In the current V2 surface that step is the realized `GraphVector`.

This implies:

- semantic naming belongs to `Job`
- capability class belongs to `Role`
- execution identity belongs to `Run`
- evidence, emitted context, and audit dossier belong to immutable `WorkSurface`

Lifecycle distinctions belong on `Run.state` and corresponding work-surface stage, not in proliferating wrapper types.

If two runtime structures differ only by lifecycle phase, they should collapse into one type plus state unless they introduce new semantics.

If two public concepts are directly isomorphic, the language and runtime keep one canonical concept and express the other as sugar, configuration, or helper structure.

---

## 7. Core Operations

### 7.1 Compose

```python
compose(f, g)
```

Compose two graph functions when interfaces align.

### 7.2 Primitive edge construction

```python
edge(a, b, operators=...) -> Graph
```

Construct a minimal graph vector from typed node `a` to typed node `b`.

### 7.3 Substitute

```python
substitute(outer_graph, contract_vector, inner_graph)
```

Replace a coarse contract step with a finer graph.

`contract_vector` is a graph vector contract, not a rival structural type.

### 7.4 Recurse

```python
recurse(graph_function, termination)
```

Express that graph-function application may induce child or repeated graph applications under a declared termination contract.

### 7.4A Deferred synthesis / refinement

```text
deferred_refinement(contract_boundary, constraints, hints?)
```

Declare that an interface-compatible graph/function may be produced or selected at this boundary and later applied through lawful substitution.

The exact implementation surface is intentionally open.

### 7.5 Fan-out

```python
fan_out(f)
```

Apply a graph function across a collection/vector.

### 7.6 Fan-in

```python
fan_in(r)
```

Reduce branch outputs into one synthesized result.

### 7.7 Gate

```python
gate(g)
```

Require a gate before continuation or promotion.

Consensus belongs here as rule shape, not as rival public ontology.

`gate(...)` is the active combinator that applies rules and/or evaluators to control flow.

So the relationship is:

- `Rule` = declarative statement of what must hold
- `Evaluator` = mechanism of checking/attesting whether it holds
- `gate(...)` = graph combinator that blocks or allows continuation based on those declarations and checks

### 7.8 Promote

```python
promote(p)
```

Lift one representation into another.

Examples:

- event to vector
- vector to branches
- branch outputs to synthesized context

---

## 8. Language Laws

1. Graph primacy
2. Typed node law
3. Interface law
4. Operator/evaluator separation
5. Composition associativity
6. Identity graph function
7. Substitutability at interface-equivalent boundaries
8. Contract preservation under substitution
9. Recursion with preserved lineage semantics
10. Higher-order legality
11. Separation from strategic choice
12. Suitability for event-sourced interpretation
13. Engine independence of language semantics
14. Categorical identity for first-class declarations
15. Semantic work / execution separation

---

## 9. Selection Boundary

The language may expose:

- candidate families
- interface equivalence
- tags
- optional policy hints

But the language should not embed:

- hidden workflow choice
- business priority
- engine strategy

Selection belongs to:

- deterministic rule execution
- probabilistic contextual analysis
- human judgment
- business/intent logic above the interpreter

The interpreter may enumerate lawful candidates.

It should not silently decide the "best" one.

---

## 10. Language vs Runtime Boundary

### GTL owns

- graph structure
- typed nodes
- interfaces
- operators and regimes
- evaluators and regimes
- rules
- graph functions
- composition
- substitution
- recursion as language capability
- bounded sub-work declarations
- higher-order graph operations
- semantic jobs
- semantic roles
- module/library structure

### ABG owns

- event emission
- projection
- convergence/delta
- work lineage
- worker identity
- worker/role binding
- run attempts
- authority references provided by external systems
- immutable work surfaces carrying execution evidence and emitted context
- retries
- correction/reset
- provenance
- replay
- next-action determination
- LeafTask runtime dispatch and bounded sub-work execution
- working surfaces and execution traces

This separation is constitutional, not incidental.

---

## 11. ABG as Canonical Target Engine Surface

ABG consumes:

- GTL graphs
- GTL graph functions
- GTL jobs
- GTL roles
- GTL operators
- GTL rules
- module declarations
- event history

ABG then:

1. materializes graph functions when needed
2. enumerates lawful candidate graphs if refinement/composition is needed
3. receives selection from deterministic, probabilistic, human, or business logic
4. applies substitution/composition
5. binds workers to roles and realizes jobs through runs
6. executes operator surfaces
7. executes evaluator surfaces
8. emits immutable work surfaces carrying execution evidence and promotable context
9. emits events
10. replays truth
11. computes convergence

ABG is the canonical target engine surface because it is explicitly designed around:

- event emission
- replay
- convergence
- lineage
- correction
- provenance

An ABG-compatible implementation may be:

- local/workspace oriented
- distributed/cloud first
- queue driven
- service oriented

as long as it preserves the ABG surface contract expected by GTL.

---

## 12. Engine Mappings

GTL 2.x is not defined by one engine.

It should be possible to interpret or map GTL programs onto:

- ABG
- Temporal
- Prefect
- Step Functions
- other future runtimes

ABG is canonical because it is designed around GTL's event-sourced convergence model.

Other engines may support:

- full mappings
- partial mappings
- capability-profile mappings

depending on their execution model.

The language definition must stay independent of any one backend.

The ABG surface is one mapping target family.

Other engines are alternate mapping targets, potentially with reduced fidelity.

Engines publish capability profiles against the active requirement families and mapping requirements, not against a separate migration-era capability matrix.

---

## 13. Authoritative Alignment

This document is the authoritative design statement for GTL 2.x and the GTL/ABG boundary.

The live requirement surface expresses that design through four active layers.

### 13.1 GTL language requirement families

- `REQ-L-GTL2-GRAPH`
- `REQ-L-GTL2-NODE`
- `REQ-L-GTL2-INTERFACE`
- `REQ-L-GTL2-OPERATOR`
- `REQ-L-GTL2-EVALUATOR`
- `REQ-L-GTL2-RULE`
- `REQ-L-GTL2-GRAPHFUNCTION`
- `REQ-L-GTL2-ROLE`
- `REQ-L-GTL2-JOB`
- `REQ-L-GTL2-COMPOSE`
- `REQ-L-GTL2-SYNTHESIS`
- `REQ-L-GTL2-SUBSTITUTE`
- `REQ-L-GTL2-RECURSE`
- `REQ-L-GTL2-SUBWORK`
- `REQ-L-GTL2-HOF`
- `REQ-L-GTL2-MODULE`
- `REQ-L-GTL2-SELECTION-BOUNDARY`
- `REQ-L-GTL2-IDENTITY`
- `REQ-L-GTL2-LAWS`
- `REQ-L-GTL2-ENGINE-INDEPENDENCE`

### 13.2 ABG engine requirement families

- `REQ-R-ABG2-INTERPRET`
- `REQ-R-ABG2-EVENTS`
- `REQ-R-ABG2-PROJECTION`
- `REQ-R-ABG2-CONVERGENCE`
- `REQ-R-ABG2-LINEAGE`
- `REQ-R-ABG2-RUN`
- `REQ-R-ABG2-CORRECTION`
- `REQ-R-ABG2-PROVENANCE`
- `REQ-R-ABG2-SELECTION-APPLICATION`
- `REQ-R-ABG2-WORKER`
- `REQ-R-ABG2-BINDING`
- `REQ-R-ABG2-LEAFTASK`
- `REQ-R-ABG2-SELFHOSTING`

### 13.3 Engine-mapping requirement families

- `REQ-M-GTL2-MAPPING`
- `REQ-M-GTL2-CAPABILITY`
- `REQ-M-GTL2-PROVENANCE`

### 13.4 Product and scenario requirement families

- `REQ-P-POLICY`
- `REQ-P-SCENARIOS`

---

## 14. Guiding Statement

GTL 2.x is a graph-first Python DSL/SDK for expressing deterministic, probabilistic, and judgment-bearing workflow programs through graphs, typed nodes, operators, evaluators, graph functions, and higher-order graph composition, with ABG serving as the canonical target engine surface and other engines remaining possible mapping targets.

---

## 15. Bottom Line

The main simplification is this:

**everything structural is graph.**

From that:

- node meaning becomes explicit through `Node[T]`
- graph vector becomes the minimal graph contract step
- reusable workflows become `GraphFunction`
- durable semantic work becomes `Job`
- semantic capability becomes `Role`
- execution attempts become `Run`
- execution evidence and elastic context collapse into immutable `WorkSurface`
- refinement becomes substitution
- recursion becomes graph application over lineage
- fan-out/fan-in/gate/promote become graph operators
- ABG becomes the interpreter and run-time realization rather than the language
- GTL becomes portable across engines rather than trapped in one runtime

This is the coherent GTL 2.x design.
