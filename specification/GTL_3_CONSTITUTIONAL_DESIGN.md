# GTL 3 Constitutional Design

**Status**: Active
**Date**: 2026-04-05
**Purpose**: State the canonical present-tense GTL 3 design, type model,
language semantics, and GTL/ABG boundary as the constitutional authority for
GTL

---

## 1. Position

GTL 3 is the constitutional design for the GTL language.

This document is the GTL constitution.

GTL is an LLM-first, graph-first, algebraic governance control language with
Python-native declarative syntax.

It is graph-function-first, composition-first, recursion-capable, higher-order,
engine-agnostic, and governance-visible without tactic prescription.

GTL remains declaration law.

ABG-compatible engines remain lawful interpreters and enforcers of that
declared law.

---

## 2. Core Thesis

The irreducible structural type of GTL 3 remains `Graph`.

Everything structural is graph:

- a primitive graph step is graph
- a multi-step workflow is graph
- a refined workflow is graph
- a composed workflow is graph
- a recursively applied workflow is graph
- a higher-order workflow is graph

There is no need for a rival structural ontology.

The GTL 3 simplification is:

- `Graph` is the one structural type
- `Node` is the typed local locus of meaning
- `GraphVector` is the internal adjacency record for lawful transition inside
  realized graph structure
- `Operator` is the effectful action surface
- `Evaluator` is the convergence/attestation surface
- `Rule` is the declarative gate/constraint surface
- `GraphFunction` is the reusable workflow/program abstraction and the sole
  public named callable carrier
- `RefinementBoundary` and `CandidateFamily` expose lawful structural choice
  without hidden strategy
- `Role` is the semantic capability class
- `Job` is the durable semantic work contract
- `Module` is the publication boundary

GTL 3 adds one important clarification:

the language exposes inspectable hook attachment points for dispatch,
evaluation, escalation, proof, and closure, but the realization and
enforcement of those hooks belongs to ABG-compatible engines.

---

## 3. Constitutional Scope

This document establishes:

- graph primacy
- typed nodes and explicit interface law
- graph functions as reusable workflow programs
- lawful composition, substitution, recursion, and higher-order operators
- semantic jobs and roles
- engine independence with ABG-compatible engines as canonical interpreter
  family
- `Attrs` as the immutable metadata carrier for structured declaration surfaces
- explicit policy-visible declaration surfaces for:
  - dispatch intent
  - evaluation policy
  - escalation policy
  - deterministic proof surfaces
  - closure contracts

---

## 4. What GTL 3 Is And Is Not

### GTL 3 is

- an LLM-first, graph-first, algebraic governance control language with
  Python-native declarative syntax
- a compositional semantic library
- a declaration language for deterministic, probabilistic, and judgment-bearing
  workflow programs
- a language whose constructs can be interpreted by multiple engines
- a language whose canonical execution family is ABG-compatible, without
  collapsing language semantics into one runtime implementation

### GTL 3 is not

- a planner
- a business-priority engine
- a hidden strategy selector
- a runtime event model
- a store of concrete worker identities
- a backend-specific transport language
- a step-by-step solution procedure for LLMs

GTL 3 governs declared law, not internal thought process.

---

## 5. Design Principles

### 5.1 Graph Primacy

All workflow structure is graph.

### 5.2 Interface Truth

Composition, substitution, and recursion are lawful only when declared outer
contracts remain satisfied.

### 5.3 Separation Of Work And Convergence

Operators do work.

Evaluators determine whether the contract has converged.

Rules describe what must hold.

### 5.4 Separation Of Law And Strategy

GTL may expose candidates, hints, policies, and boundaries.

It does not silently choose the best path.

### 5.5 Separation Of Declaration And Runtime

GTL declares graph law, graph-function law, and policy-visible governance.

ABG-compatible engines realize execution, event truth, lineage, replay,
selection application, and enforcement.

### 5.6 Governance Without Micromanagement

GTL 3 may declare:

- invariant traversal
- dispatch intent
- evaluation policy
- escalation policy
- deterministic proof surfaces
- closure expectations

GTL 3 does not prescribe:

- internal agent tactics
- prompt choreography
- implementation procedure
- hidden strategic choice

---

## 6. Domain Model

### 6.1 Attr And Attrs

`Attr` and `Attrs` are first-class immutable metadata carriers for GTL 3 public
declaration surfaces.

`Attrs` is the canonical shape for policy-visible configuration and metadata in
GTL 3.

It is used by:

- `Rule.config`
- `GraphFunction.declarations`
- `GraphVector.declarations`
- `RefinementBoundary.hints`
- `CandidateFamily.policy_hints`
- `Role.policy_hooks`
- `Module.metadata`

This is part of GTL 3.

### 6.2 Context

`Context` is an externally located, snapshot-bound constraint dimension carried
by graph structure.

It binds:

- `name`
- `locator`
- `digest`

Context remains language-owned declaration truth, not an engine-owned event.

### 6.3 Node

`Node` is the typed local locus within a graph.

Canonical shape:

```python
@dataclass(frozen=True)
class Node:
    name: str
    schema: type | str = ""
    markov: tuple[str, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

`Node.markov` carries declared state, outcome, or acceptance conditions at that
locus.

This remains the primary language surface for invariant state declaration.

### 6.4 GraphVector

`GraphVector` is the internal adjacency record between typed nodes.

It is not a rival public ontology, but it is a real language declaration
surface and a real invariant-transition carrier.

It is not the public callable carrier of GTL 3.

Jobs and other public semantic work-entry surfaces do not target bare
`GraphVector` declarations.

Every operative transition boundary is owned by one or more published
`GraphFunction` surfaces, and vectors remain internal realized structure within
those graph-function carriers.

Current live shape:

```python
@dataclass(frozen=True)
class GraphVector:
    name: str
    source: Node | tuple[Node, ...]
    target: Node
    operators: tuple = ()
    evaluators: tuple = ()
    contexts: tuple[Context, ...] = ()
    rule: Any = None
    allows_subwork: bool = False
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

GTL 3 preserves this shape and adds one new constitutional surface:

```python
declarations: Attrs = field(default_factory=Attrs)
```

The purpose of `GraphVector.declarations` is to carry explicit
transition-governance declarations for one invariant traversal boundary,
including where needed:

- invariant transition description
- dispatch intent
- evaluation policy
- escalation policy
- deterministic proof surfaces
- closure contract

This is part of the GTL 3 constitutional type model.

`GraphVector` also carries two important transition-local truths directly on
`GraphVector`:

- `operators` and `evaluators` express the local constructive and convergence
  surfaces for the transition
- `rule` and `allows_subwork` express local constraint and bounded-subwork
  visibility

GTL 3 does not remove those surfaces.

It reframes them as part of a richer transition-governance declaration model,
where `allows_subwork` remains the simple present-tense capability flag and
`GraphVector.declarations` becomes the structured carrier for more explicit
dispatch, proof, and closure law.

### 6.5 Graph

`Graph` remains the one first-class structural type.

Canonical shape:

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

Graph declares:

- boundary interface
- internal structure
- local constraints
- declared or derived execution-regime visibility
- the unit of substitution and composition

### 6.6 Schema Families

`Node.schema` continues to support both concrete type references and symbolic
schema names.

`Vector[T]` remains the semantic foundation for cardinality-sensitive graph
materialization.

Asset-like state is still represented through `Node` plus `markov`.

There is no rival asset ontology at the language center.

### 6.7 Regimes, Operator, Evaluator, Rule

The regime family remains:

- `F_D`
- `F_P`
- `F_H`

Canonical shapes:

```python
@dataclass(frozen=True)
class Operator:
    name: str
    regime: type[Regime] = F_D
    binding: str = ""
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class Evaluator:
    name: str
    regime: type[Regime] = F_D
    description: str = ""
    binding: str = ""
    tags: tuple[str, ...] = ()

@dataclass(frozen=True)
class Rule:
    name: str
    kind: str = "policy"
    config: Attrs = field(default_factory=Attrs)
    tags: tuple[str, ...] = ()
```

The constitutional split remains:

- `Operator` = who/what does work
- `Evaluator` = who/what checks or attests convergence
- `Rule` = what must hold
- `gate(...)` = graph combinator that blocks or allows continuation based on
  those declarations

### 6.8 TemplateRef

`TemplateRef` is the replayable publication truth for graph-function templates.

Current live kinds are:

- `inline_graph`
- `symbolic`

This is canonical in GTL 3.

### 6.9 GraphFunction

`GraphFunction` remains the primary reusable GTL compute abstraction.

It is the sole public named callable carrier in GTL 3.

Canonical shape:

```python
@dataclass(frozen=True)
class GraphFunction:
    name: str
    inputs: tuple[Node, ...] = ()
    outputs: tuple[Node, ...] = ()
    template: TemplateRef | Graph | str | Callable[[], Graph] = ""
    effects: tuple = ()
    declarations: Attrs = field(default_factory=Attrs)
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

GTL 3 preserves this shape and makes one semantic strengthening:

`GraphFunction.declarations` is no longer merely a convenient metadata escape
hatch. It is the canonical policy-visible declaration surface for graph-function
level governance-hook attachment and publication truth.

At minimum, GTL 3 allows `GraphFunction.declarations` to carry structured
entries for:

- publication and materialization metadata
- hook references for dispatch, evaluation, escalation, proof, and closure
- opaque hook configuration
- frame-local publication surfaces and other graph-function-local declaration
  data

These declarations remain declarative. They do not prescribe tactics.

The graph-function model also establishes three important truths that
GTL 3 keeps explicit:

1. Construction-time coercion:
   `Graph`, `str`, and callable templates are coerced into `TemplateRef` so the
   published graph-function surface remains replayable publication truth.
2. Outer-contract validation:
   when the template is `inline_graph`, the materialized graph must preserve the
   declared `inputs` and `outputs` contract.
3. Declaration-preserving algebra:
   GTL algebra already treats `GraphFunction.declarations` as meaningful
   structural truth rather than inert metadata.
4. Public callable carrier:
   `GraphFunction` is the public callable carrier over one or more internal
   invariant transitions. A graph function may realize one vector, many
   vectors, composed graph structure, recursive graph structure, or
   higher-order graph structure, but callers bind to the published
   graph-function identity rather than to bare internal vectors.

That third point matters for rewrite authority:

- `compose(...)` merges declarations fail-closed on conflicting keys
- `recurse(...)` writes explicit `recursion` declarations containing
  termination and foldback law
- `gate(...)` writes explicit `gate` declarations containing target, rule, and
  evaluator bundle visibility

GTL 3 therefore strengthens an existing design direction rather than inventing
an unrelated policy layer.

### 6.10 RefinementBoundary

`RefinementBoundary` remains the declarative surface for lawful deferred
synthesis/refinement over a stable outer contract.

Canonical shape:

```python
@dataclass(frozen=True)
class RefinementBoundary:
    name: str
    inputs: tuple[Node, ...] = ()
    outputs: tuple[Node, ...] = ()
    hints: Attrs = field(default_factory=Attrs)
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

### 6.11 CandidateFamily

`CandidateFamily` remains the declarative surface for explicit lawful structural
alternatives without hidden choice.

Canonical shape:

```python
@dataclass(frozen=True)
class CandidateFamily:
    name: str
    inputs: tuple[Node, ...] = ()
    outputs: tuple[Node, ...] = ()
    candidates: tuple[GraphFunction, ...] = ()
    policy_hints: Attrs = field(default_factory=Attrs)
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

### 6.12 Role

`Role` is the semantic capability class required to perform, supervise, or
approve work.

Canonical shape:

```python
@dataclass(frozen=True)
class Role:
    name: str
    tags: tuple[str, ...] = ()
    policy_hooks: Attrs = field(default_factory=Attrs)
    id: str = field(default_factory=_mint_id, compare=False)
```

`Role` remains distinct from `Worker`.

`Role.policy_hooks` remains the policy-visible declaration input for external
policy resolution.

### 6.13 ContractRef

`ContractRef` is the indirection from a `Job` to the GTL contract it binds.

Canonical shape:

```python
@dataclass(frozen=True)
class ContractRef:
    kind: str
    target_id: str
```

For semantic work contracts in GTL 3, the current lawful callable target kind
is:

- `graph_function`

`ContractRef` remains an indirection shape rather than a direct embedded link,
but GTL 3 does not treat internal `graph_vector` boundaries as public semantic
work targets.

### 6.14 Job

`Job` remains the durable semantic work contract.

Canonical shape:

```python
@dataclass(frozen=True)
class Job:
    name: str
    contracts: tuple[ContractRef, ...] = ()
    roles: tuple[Role, ...] = ()
    tags: tuple[str, ...] = ()
    id: str = field(default_factory=_mint_id, compare=False)
```

GTL 3 preserves that shape and clarifies:

- `Job` names durable semantic work
- `Job` binds one or more published `GraphFunction` carriers by identity
- `Run` is one engine-owned realization of that work
- `Worker` is one concrete engine-owned actor identity

The engine may materialize and traverse internal graph structure beneath the
bound graph function, but that internal structure does not replace the
graph-function carrier as the public work-entry surface.

### 6.15 ModuleImport And Module

`ModuleImport` and `Module` remain the publication boundary for GTL
declarations.

Current live shape:

```python
@dataclass(frozen=True)
class ModuleImport:
    source: str
    names: tuple[str, ...] = ()
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
    metadata: Attrs = field(default_factory=Attrs)
```

GTL 3 makes explicit:

- refinement boundaries are first-class module publication surfaces
- candidate families are first-class module publication surfaces
- module metadata is an immutable policy-visible declaration surface

---

## 7. Structured Hook Surfaces

GTL 3 uses `Attrs` to carry structured hook surfaces and other inspectable
declaration data.

For governance concerns, GTL 3 provides hook attachment points rather than a
policy DSL.

Those hook surfaces may appear on:

- `GraphFunction.declarations`
- `GraphVector.declarations`
- `Role.policy_hooks`
- `CandidateFamily.policy_hints`

The constitutional meaning is intentionally narrow:

1. GTL may declare that a concern exists at a boundary.
2. GTL may attach a stable hook reference for that concern.
3. GTL may attach opaque configuration for the resolved hook.
4. GTL may expose precedence and scope across graph-function, graph-vector,
   role, and candidate-family surfaces.

GTL does not define the internal semantics of policy evaluation through a
specialized in-language vocabulary.

ABG-compatible engines resolve declared hook references to executable policy
implementations and enforce the resulting behavior.

These hook surfaces are language-visible, inspectable, and replayable.

They are not runtime tactics.

---

## 8. Core Semantics

### 8.1 Graph Primacy

All workflow structure is graph.

### 8.2 Typed Node Primacy

Local graph meaning is carried by typed nodes.

### 8.3 Interface Satisfaction

Composition and substitution are lawful only when interfaces align.

### 8.4 Reuse

Named workflows are reusable through graph functions, not copied structure.

### 8.5 Contract Preservation

Refinement may change internals but must preserve the declared outer contract.

### 8.6 Recursion With Preserved Lineage

Recursive graph-function application preserves explainable work lineage and
explicit foldback law.

### 8.7 Higher-Order Legality

Fan-out, fan-in, gate, and promote preserve interface/type truth.

### 8.8 Selection Boundary Without Hidden Choice

Candidate families and refinement boundaries may expose lawful alternatives and
policy-visible hints without deciding among them.

### 8.9 Governance As Hook Attachment

Dispatch, evaluation, escalation, deterministic proof, and closure may be
declared as hook attachments and opaque configuration on GTL surfaces.

### 8.10 No Tactic Prescription

These declarations constrain lawful execution and proof.

They do not prescribe how an agent or deterministic subsystem must solve the
constructive problem.

---

## 9. Core Operations

GTL 3 preserves the current algebraic operations:

- `edge(a, b, operators=...) -> Graph`
- `compose(f, g, ...)`
- `identity(interface)`
- `substitute(outer_graph, contract_vector, inner_graph)`
- `recurse(graph_function, termination, *, foldback)`
- `fan_out(f, *, over=node)`
- `fan_in(reducer, *, over=node)`
- `gate(target, *, rule, evaluators)`
- `promote(source=..., to=...)`
- `deferred_refinement(...)`
- `candidate_family(...)`

These remain language operations.

ABG-compatible engines may interpret their results, but the interpreter does
not own their semantics.

The algebra also establishes these declaration-preserving behaviors:

- `compose(...)` preserves outer contract and deterministically merges effects,
  tags, and declarations
- `recurse(...)` preserves outer contract while making recursion law visible in
  declarations rather than hiding it in interpreter-local policy
- `gate(...)` preserves visible rule/evaluator gating as declaration truth
- higher-order operators preserve interface visibility without silently choosing
  strategy

---

## 10. Language Laws

1. Graph primacy
2. Typed node law
3. Interface law
4. Operator/evaluator separation
5. Composition associativity
6. Identity graph function
7. Substitutability at interface-equivalent boundaries
8. Contract preservation under substitution
9. Recursion with preserved lineage and explicit foldback
10. Higher-order legality
11. Separation from hidden strategic choice
12. Suitability for event-sourced interpretation
13. Engine independence of language semantics
14. Categorical identity for first-class declarations
15. Semantic work / execution separation with graph functions as the public
    callable carrier
16. Governance by hook attachment rather than tactic prescription or a policy
    semantic language
17. Explicit invariant traversal visibility
18. Replayable policy-visible declaration truth

---

## 11. Language Vs Runtime Boundary

### GTL owns

- graph structure
- typed nodes
- interfaces
- contexts
- operators and regimes
- evaluators and regimes
- rules
- graph functions
- refinement boundaries
- candidate families
- composition
- substitution
- recursion as language capability
- higher-order graph operations
- bounded sub-work declarations
- semantic jobs
- semantic jobs over published graph functions
- semantic roles
- module/library structure
- policy hook declarations and opaque hook configuration for dispatch,
  evaluation, escalation, proof, and closure

### ABG-compatible engines own

- worker identity
- worker/role binding
- concrete transport choice
- run attempts
- runtime fact emission
- projection
- convergence/delta
- lineage
- provenance
- replay
- next-action determination
- retries and correction
- runtime enforcement of GTL-declared policy
- bounded sub-work runtime realization

This split is constitutional.

GTL declares.

ABG-compatible engines enforce and emit runtime truth.

---

## 12. Governance Additions

Outcome-driven development requires GTL to expose clear governance hook
surfaces.

GTL 3 therefore adds these constitutional expectations:

1. A contract boundary can declare its intended invariant traversal explicitly.
2. A contract boundary can attach dispatch, evaluation, escalation, proof, and
   closure hooks without naming concrete workers or transports.
3. Role surfaces can attach policy hooks that ABG may consume during authority,
   eligibility, assignment, or approval resolution.
4. Hook references and opaque configuration remain inspectable and replayable.
5. GTL does not define a dedicated policy semantic language beyond these hook
   attachment surfaces.

These additions are not anti-agentic.

They are the language surfaces that let powerful agentic coders operate under
declared law while ABG preserves replayable fact truth.

---

## 13. Authority

This document is the constitutional authority for GTL.

Requirements, design elaborations, implementation, and ABG integrations shall
conform to it.

---

## 14. Guiding Statement

GTL 3 is an LLM-first, graph-first, algebraic governance control language with
Python-native declarative syntax for expressing deterministic, probabilistic,
and judgment-bearing workflow programs through graphs, typed nodes, graph
vectors, operators, evaluators, rules, graph functions, semantic jobs,
semantic roles, and higher-order graph algebra, with explicit governance hook
surfaces for dispatch, evaluation, escalation, proof, and closure, and with
ABG-compatible engines serving as the lawful interpreters and enforcers of
that declared truth.

---

## 15. Bottom Line

The simplification remains:

**everything structural is graph.**

The strengthening is:

**the important governance around graph execution is declared in GTL and
enforced by ABG-compatible engines.**
