# GTL 2.x / ABG Interface Contracts

**Status**: Draft
**Date**: 2026-03-26
**Purpose**: Define the concrete interface contracts for the current algebraic work so unit tests and code can be derived from design without inventing semantics.

**Derived from**:
- [GTL_2_MODULE_DESIGN.md](./GTL_2_MODULE_DESIGN.md)
- [GTL_2_CONSTITUTIONAL_DESIGN.md](../../../../specification/GTL_2_CONSTITUTIONAL_DESIGN.md)
- [specification/requirements/](../../../../specification/requirements/)

**Primary requirement anchors**:
- `REQ-L-GTL2-GRAPHFUNCTION`
- `REQ-L-GTL2-SYNTHESIS`
- `REQ-L-GTL2-SELECTION-BOUNDARY`
- `REQ-L-GTL2-HOF`
- `REQ-L-GTL2-RULE`
- `REQ-M-GTL2-MAPPING`
- `REQ-M-GTL2-PROVENANCE`
- `REQ-R-ABG2-CONVERGENCE`
- `REQ-R-ABG2-SELECTION-APPLICATION`
- `REQ-R-ABG2-PROVENANCE`

---

## 1. Position

This document is the contract layer between:

- requirement truth
- module design
- unit tests
- implementation

It is intentionally stricter than the mockups.

For this cluster, the design choices are now:

- `compose` is variadic, left-folded composition
- `fan_out` and `fan_in` require explicit `over=` boundaries
- deferred refinement is a first-class `RefinementBoundary`
- lawful structural alternatives are a first-class `CandidateFamily`
- `Module` publishes `GraphFunction` and `CandidateFamily`
- canonical graph-function materialization is an explicit ABG contract, not a hidden interpret helper
- harvest is expressed as `fan_out -> fan_in -> gate`, not as special `GraphVector` flags

---

## 2. Non-Negotiable Rules

1. `GraphVector` is not a policy surface.
2. No interface in this document may smuggle strategic choice into ABG.
3. GTL declares boundaries, families, and hooks.
4. ABG executes deterministic protocol and provenance.
5. Domain bindings own prompt/program logic, metric logic, merge logic, and refinement logic.
6. Any ambiguity resolved here is resolved in favor of algebraic declaration over current-code convenience.
7. Prime interface types are immutable value records. Generic `dict` bags are not a lawful control plane for graph, traversal, or materialization truth.
8. Python implementation follows Scala-style discipline: algebraic data first, interpreter effects second.
9. Recursive zoom, materialization, and fold-back must remain replayable value transformations with explicit lineage and provenance.

---

## 3. GTL Declaration Contracts

### 3.1 `gtl.function_model.GraphFunction`

```python
@dataclass(frozen=True)
class Attr:
    key: str
    value: str

@dataclass(frozen=True)
class TemplateRef:
    kind: str                # python_ref | serialized
    ref: str                 # package.module:callable or URI
    version: str | None = None

type Attrs = tuple[Attr, ...]

@dataclass(frozen=True)
class GraphFunction:
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    template: TemplateRef
    id: str = field(default_factory=_mint_id, compare=False)
    effects: tuple[type[Regime], ...] = ()
    tags: tuple[str, ...] = ()
```

**Contract**
- Immutable and hashable by structural fields except `id`.
- `inputs` and `outputs` are the outer contract seen by callers.
- `template` is a replayable symbolic materializer reference. The interpreter may resolve it into executable code, but publication truth is the `TemplateRef`, not an anonymous closure.
- materialization inputs, selected profile, and structural parameters must remain externally visible through published module surfaces and runtime materialization records.
- A materialized graph must preserve the declared outer contract:
  - graph inputs == declared inputs
  - graph outputs == declared outputs
- `effects` are policy-visible and composition-visible.
- `tags` are descriptive only; they do not carry hidden control semantics.

**Fail closed**
- If the materialized graph does not preserve the declared outer contract, materialization fails.
- If a `TemplateRef` cannot be resolved lawfully by the interpreter, materialization fails.

**Unit-test obligations**
- immutability
- structural equality ignores `id`
- materialization preserves outer interface
- `effects` and `tags` are stable under round-trip construction

### 3.2 `gtl.function_model.RefinementBoundary`

```python
@dataclass(frozen=True)
class RefinementBoundary:
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    id: str = field(default_factory=_mint_id, compare=False)
    hints: Attrs = ()
    tags: tuple[str, ...] = ()
```

**Contract**
- Declares a lawful synthesis/refinement point over a stable outer contract.
- Does not contain executable selection or synthesis logic.
- `hints` may carry policy-visible or capability-visible attributes only.
- Any graph/function later applied through this boundary must satisfy the declared `inputs` and `outputs`.

**Fail closed**
- A refinement boundary with hidden executable strategy or hidden candidate choice is invalid by design.

**Unit-test obligations**
- immutability
- stable outer contract
- `hints` are visible metadata only

### 3.3 `gtl.function_model.CandidateFamily`

```python
@dataclass(frozen=True)
class CandidateFamily:
    name: str
    inputs: tuple[Node, ...]
    outputs: tuple[Node, ...]
    candidates: tuple[GraphFunction, ...]
    id: str = field(default_factory=_mint_id, compare=False)
    policy_hints: Attrs = ()
    tags: tuple[str, ...] = ()
```

**Contract**
- Declares a named family of lawful alternatives over one outer contract.
- Every candidate must have exactly the declared `inputs` and `outputs`.
- Candidate order is preserved and publishable.
- `policy_hints` are visible immutable attributes for evaluators and external consumers but do not choose a candidate.

**Fail closed**
- Empty candidate families are invalid.
- A candidate whose outer contract differs from the family contract is invalid.

**Unit-test obligations**
- all candidates share exact outer contract
- candidate order is preserved
- immutability

### 3.4 `gtl.module_model.Module`

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
    metadata: Attrs = ()
```

**Contract**
- `Module` is the publication boundary for `GraphFunction`, `RefinementBoundary`, and `CandidateFamily`.
- Imported declaration names must refer to publishable declaration identities.
- `refinement_boundaries` are first-class published declarations for traversal/refinement points.
- `candidate_families` are first-class published declarations, not implementation-only helpers.

**Unit-test obligations**
- publishes graph functions, refinement boundaries, and candidate families
- import names preserve declaration identity

---

## 4. GTL Algebra Contracts

### 4.1 `compose(*functions)`

```python
def compose(*functions: GraphFunction) -> GraphFunction
```

**Contract**
- Requires at least two functions.
- Evaluates as a left-fold:
  - `compose(f1, f2, f3)` == `compose(compose(f1, f2), f3)`
- For each adjacent pair, `outputs(left)` must satisfy `inputs(right)`.
- Returns a new `GraphFunction` with:
  - `inputs = first.inputs`
  - `outputs = last.outputs`
  - `effects = stable left-to-right union of all effects`
  - `tags = stable left-to-right union of all tags`

**Fail closed**
- zero or one arguments is invalid
- any interface mismatch is invalid

**Unit-test obligations**
- left-fold equivalence
- interface mismatch rejection
- stable effect propagation

### 4.2 `identity(interface)`

```python
def identity(interface: tuple[Node, ...]) -> GraphFunction
```

**Contract**
- Returns a neutral graph function over the same interface.
- `compose(identity(I), f)` and `compose(f, identity(O))` are semantically equivalent to `f` where interfaces align.

### 4.3 `substitute(outer, contract_vector, inner)`

```python
def substitute(outer: Graph, contract_vector: str, inner: Graph) -> Graph
```

**Contract**
- Replaces one coarse contract step in `outer` with `inner`.
- `inner` must preserve the outer contract of the replaced vector.
- The result graph must expose the refined inner structure.
- The outer graph’s boundary remains unchanged.

**Fail closed**
- unknown `contract_vector`
- contract mismatch between outer vector boundary and inner graph boundary

**Unit-test obligations**
- outer boundary preserved
- refined structure exposed
- provenance-relevant metadata remains derivable

### 4.4 `recurse(graph_function, termination)`

```python
def recurse(graph_function: GraphFunction, termination: Evaluator) -> GraphFunction
```

**Contract**
- Returns a graph function with the same outer contract as `graph_function`.
- Recursive or repeated realization must remain bounded by `termination`.
- Recursion does not change the caller-visible outer interface.

### 4.5 `fan_out(f, *, over)`

```python
def fan_out(f: GraphFunction, *, over: Node) -> GraphFunction
```

**Contract**
- `over` is mandatory. No hidden inference.
- `over` must denote an explicit vector boundary.
- `f` must be applicable across the element contract represented by `over`.
- Returns a graph function whose outer contract is vectorized relative to `f`.

**Design note**
- Exact derived output-node naming is implementation-defined, but schema/interface truth is not.

### 4.6 `fan_in(reducer, *, over)`

```python
def fan_in(reducer: GraphFunction, *, over: Node) -> GraphFunction
```

**Contract**
- `over` is mandatory. No hidden inference.
- `over` must denote the vector boundary being reduced.
- Returns a graph function that consumes the explicit vector boundary and produces the reducer output contract.

### 4.7 `gate(target, *, rule, evaluators)`

```python
def gate(
    target: GraphFunction | RefinementBoundary | CandidateFamily,
    *,
    rule: Rule,
    evaluators: tuple[Evaluator, ...],
) -> GraphFunction
```

**Contract**
- Declares that continuation or lawful next action is blocked behind `rule + evaluators`.
- `target` may be:
  - a normal `GraphFunction`
  - a `RefinementBoundary`
  - a `CandidateFamily`
- The returned graph function preserves the outer contract of `target`.
- `gate` does not choose a candidate, invent a refinement, or define domain pass/fail semantics.

**Fail closed**
- empty evaluator tuple is invalid
- target with no explicit outer contract is invalid

### 4.8 `promote(*, source, to)`

```python
def promote(*, source: Node, to: Node) -> GraphFunction
```

**Contract**
- Declares a lawful representation lift from one explicit boundary to another.
- `source` and `to` are both mandatory. No hidden inference.
- `promote` does not change semantic truth; it changes only the declared representation boundary available to later algebraic steps.
- The returned `GraphFunction` is lawful only when the lifted representation remains interface-compatible with the surrounding composition.

**Design note**
- `promote` is the explicit representation-lift / join operator in the current algebra.
- It is especially relevant when `fan_out(...)` produces a nested or vectorized representation that must be normalized before later reduction or gating.

**Fail closed**
- missing `source` or `to`
- incompatible representation boundary
- use of `promote` to smuggle strategy or domain scoring

**Unit-test obligations**
- explicit source/to boundary preservation
- no semantic-identity drift across the lift
- fail-closed on incompatible boundary pairs

### 4.9 `deferred_refinement(...)`

```python
def deferred_refinement(
    name: str,
    *,
    inputs: tuple[Node, ...],
    outputs: tuple[Node, ...],
    hints: Attrs = (),
    tags: tuple[str, ...] = (),
) -> RefinementBoundary
```

**Contract**
- Constructs a `RefinementBoundary` and nothing more.
- No callback, binding, or strategy may be embedded here.

### 4.10 `candidate_family(...)`

```python
def candidate_family(
    name: str,
    *,
    inputs: tuple[Node, ...],
    outputs: tuple[Node, ...],
    candidates: tuple[GraphFunction, ...],
    policy_hints: Attrs = (),
    tags: tuple[str, ...] = (),
) -> CandidateFamily
```

**Contract**
- Constructs a `CandidateFamily`.
- Validates shared outer contract across all candidates.

---

## 5. ABG Runtime Contracts

These are runtime contracts for the current ABG execution surface.

`Traversal` and `ConvergenceResult` are first-class execution contracts.
`SelectionDecision` remains a delegated helper result rather than a separate execution loop.

### 5.1 `abg.interpret.Traversal`

```python
@dataclass(frozen=True)
class Traversal:
    work_key: str
    target: GraphFunction | CandidateFamily | RefinementBoundary
    evaluators: tuple[Evaluator, ...] = ()
    rule: Rule | None = None
    selection: SelectionDecision | None = None
    metadata: Attrs = ()
```

**Contract**
- Names one runtime traversal attempt over one GTL contract boundary.
- `target` may be a `GraphFunction`, `CandidateFamily`, or `RefinementBoundary`.
- `selection` is required when `target` is a `CandidateFamily`, and invalid otherwise.
- `evaluators` is an explicit evaluator vector for this traversal boundary.
- `rule` is policy-visible aggregation/governance input, not hidden business logic.
- `metadata` is visible input-side runtime attributes only; it must not carry hidden strategy.
- `Traversal.metadata` and `WorkSurface.metadata` are not the same field semantically:
  - `Traversal.metadata` expresses declared runtime input/control context
  - `WorkSurface.metadata` expresses realized execution state and emitted facts
- Any carry-forward from `Traversal.metadata` into `WorkSurface.metadata` must be explicit and provenance-safe.

**Fail closed**
- empty `work_key`
- a `rule` or evaluator set that contradicts the target boundary contract
- `CandidateFamily` target without an explicit `SelectionDecision`
- `SelectionDecision` supplied for a non-`CandidateFamily` target
- metadata that attempts to hide strategy or candidate choice

**Unit-test obligations**
- immutability
- target identity and outer contract remain stable
- explicit selection is required for `CandidateFamily` traversal
- explicit evaluator vector is preserved
- no hidden strategy in `metadata`

### 5.2 `abg.interpret.traverse(...)`

```python
def traverse(
    traversal: Traversal,
    *,
    surface: WorkSurface,
) -> WorkSurface
```

**Contract**
- Owns one deterministic traversal attempt over the named boundary.
- May materialize a `GraphFunction`, realize a `RefinementBoundary`, or apply a lawful selection from a `CandidateFamily` only through delegated modules.
- Delegates:
  - graph-function materialization and graph-derived bundle derivation to `abg.materialization`
  - convergence aggregation to `abg.convergence`
  - selection validation to `abg.selection`
  - provenance carry-forward to `abg.provenance`
- Owns event emission for delegated results.
- Returns the next immutable `WorkSurface` and does not invent domain semantics.
- Returned `WorkSurface.metadata` is output-side realized metadata; it may include explicit carry-forward from `Traversal.metadata`, but it must not silently inherit hidden control strategy.

**Fail closed**
- target/surface contract mismatch
- delegated module returns an unlawful result
- event emission would misrepresent delegated truth

### 5.3 `abg.materialization.MaterializationRequest`

```python
@dataclass(frozen=True)
class MaterializationRequest:
    module_name: str
    graph_function_id: str
    input_refs: tuple[str, ...] = ()
    profile: str | None = None
    parameters: Attrs = ()
```

**Contract**
- Names one explicit request to realize one published graph function for canonical engine execution.
- `graph_function_id` must resolve through the published module surface.
- `profile` and `parameters` are policy-visible. They must not be inferred from ambient interpreter state.
- `parameters` must be lawful for the published graph-function/materialization surface.

**Fail closed**
- unknown module or graph-function identity
- undeclared profile
- undeclared structural parameter
- hidden strategy encoded in the request

### 5.4 `abg.materialization.MaterializationRecord`

```python
@dataclass(frozen=True)
class MaterializationRecord:
    materialization_id: str
    module_name: str
    graph_function_id: str
    graph_id: str
    profile: str | None = None
    parameters: Attrs = ()
    input_refs: tuple[str, ...] = ()
    bundle_ids: tuple[str, ...] = ()
```

**Contract**
- Records one lawful canonical-engine realization of one published graph function.
- Preserves replayable identity for:
  - graph function
  - selected profile
  - declared structural parameters
  - resulting graph
- `materialization_id` is the canonical provenance handle for downstream binding and bundle derivation.

### 5.5 `abg.materialization.materialize_graph_function(...)`

```python
def materialize_graph_function(
    request: MaterializationRequest,
    *,
    module: Module,
) -> MaterializationRecord
```

**Contract**
- Materializes a published graph function into one lawful executable graph surface for the canonical engine.
- Fails closed when the request is not declared by the published module surface.
- Preserves the outer contract of the targeted graph function.
- Emits no events directly; event emission remains the responsibility of `abg.interpret`.

### 5.6 `abg.materialization.CompanionBundle`

```python
@dataclass(frozen=True)
class CompanionBundle:
    bundle_id: str
    kind: str
    materialization_id: str
    payload_ref: str
```

**Contract**
- Represents a graph-derived companion bundle such as:
  - selected subgraph
  - evaluator bundle
  - profile manifest
- Does not replace graph as primary structural truth.
- Must preserve derivation back to one `MaterializationRecord`.
- The evaluator-bundle case is a first-class consequence of refined structure, not an implementation afterthought.

### 5.7 `abg.materialization.derive_bundle(...)`

```python
def derive_bundle(
    record: MaterializationRecord,
    *,
    kind: str,
) -> CompanionBundle
```

**Contract**
- Derives one graph-derived companion bundle from one canonical materialization record.
- `kind="evaluator_bundle"` is the canonical path when refined structure declares deterministic proof surfaces for the realized boundary.
- Fails closed on unsupported bundle kinds.
- Preserves replayable derivation to the originating materialization.

### 5.8 `abg.convergence.EvaluatorOutcome`

```python
@dataclass(frozen=True)
class EvaluatorOutcome:
    contract_id: str
    evaluator_name: str
    regime: type[Regime]
    status: Literal["pass", "fail", "open", "error"]
    round_index: int
    rationale: str = ""
    payload_ref: str | None = None
```

**Contract**
- One outcome per evaluator invocation over one contract boundary in one round.
- Carries no domain semantics beyond normalized status.

### 5.9 `abg.convergence.ConvergenceResult`

```python
@dataclass(frozen=True)
class ConvergenceResult:
    contract_id: str
    outcomes: tuple[EvaluatorOutcome, ...]
    aggregate_state: Literal["closed", "open", "error"]
    next_action: Literal["continue", "repeat_round", "escalate", "fail"]
    next_regime: type[Regime] | None
    round_index: int
```

**Contract**
- Aggregate protocol result over one round or one evaluator-result vector.
- `aggregate_state` is determined from declared rule/evaluator surface, never hidden domain logic.
- `next_action` is protocol output, not business logic.

### 5.10 `abg.convergence.delta(...)`

```python
def delta(
    contract_id: str,
    outcomes: tuple[EvaluatorOutcome, ...],
    *,
    rule: Rule | None = None,
) -> ConvergenceResult
```

**Contract**
- Deterministically aggregates one evaluator or evaluator-result vector.
- Uses declared `Rule.config` for quorum, ordering, round bounds, or aggregation mode when present.
- Defaults to all-pass only when no explicit aggregation policy is declared.
- Must not invent domain scoring or merge semantics.

**Fail closed**
- empty `outcomes`
- mixed `contract_id`
- invalid or contradictory rule config

### 5.11 `abg.selection.SelectionDecision`

```python
@dataclass(frozen=True)
class SelectionDecision:
    contract_id: str
    work_key: str
    graph_function: str
    selected_by: str
    selection_mode: str
    rationale: str
```

**Contract**
- Records an externally made choice that has been validated as lawful.
- Does not imply ABG made the strategic choice.

### 5.12 `abg.selection.enumerate_candidates(...)`

```python
def enumerate_candidates(family: CandidateFamily) -> tuple[GraphFunction, ...]
```

**Contract**
- Returns family candidates in declared order.
- Performs no ranking or filtering beyond lawful family membership.

### 5.13 `abg.selection.accept_selection(...)`

```python
def accept_selection(
    family: CandidateFamily,
    candidate: GraphFunction,
    *,
    contract_id: str,
    work_key: str,
    selected_by: str,
    selection_mode: str,
    rationale: str = "",
) -> SelectionDecision
```

**Contract**
- Validates that `candidate` belongs to `family`.
- Validates that candidate still satisfies the family contract.
- Returns a `SelectionDecision` for later application by `abg.interpret`.

**Fail closed**
- candidate not in family
- interface mismatch

---

## 6. Provenance Contracts

### 6.1 Materialization provenance

For one canonical graph-function materialization, the runtime must preserve:

- published graph-function identity
- selected profile
- declared structural parameters
- resulting graph identity
- materialization identity

This is the runtime consequence of:
- `REQ-L-GTL2-GRAPHFUNCTION-011`
- `REQ-L-GTL2-GRAPHFUNCTION-012`
- `REQ-M-GTL2-MAPPING-004`
- `REQ-M-GTL2-PROVENANCE-003`
- `REQ-R-ABG2-PROVENANCE-008`

### 6.2 Evaluation provenance

For one evaluator or evaluator set on one contract boundary, the runtime must preserve:

- contract identity
- evaluator identity
- regime
- round index
- normalized outcome
- any aggregate convergence decision derived from the set

This is the runtime consequence of:
- `REQ-R-ABG2-PROVENANCE-005`
- `REQ-R-ABG2-PROVENANCE-006`

### 6.3 Selection and profile provenance

When a `CandidateFamily` alternative or named profile is selected, the runtime must preserve:

- family identity
- selected candidate identity
- selecting mechanism
- rationale when provided

This is the runtime consequence of:
- `REQ-R-ABG2-PROVENANCE-003`
- `REQ-R-ABG2-PROVENANCE-007`

### 6.4 Graph-derived bundle provenance

When a selected subgraph, evaluator bundle, or profile manifest is derived from one canonical graph-function materialization, the runtime must preserve:

- bundle identity
- bundle kind
- originating materialization identity
- originating graph-function identity

For the evaluator-bundle case, provenance must also remain sufficient to answer which refined structure or realized boundary justified the deterministic evaluator set.

This is the runtime consequence of:
- `REQ-L-GTL2-GRAPHFUNCTION-013`
- `REQ-M-GTL2-MAPPING-005`
- `REQ-M-GTL2-PROVENANCE-004`
- `REQ-R-ABG2-PROVENANCE-009`

### 6.5 Refinement provenance

When a `RefinementBoundary` is realized, the runtime must preserve:

- boundary identity
- applied graph/function identity
- why the refinement was triggered

This is the runtime consequence of:
- `REQ-L-GTL2-SYNTHESIS-006`
- `REQ-R-ABG2-PROVENANCE-002`

---

## 7. Current Non-Goals

This interface-contract pass does **not** define:

- alternate engine mapping contracts
- BPM/source-compilation contracts
- hydration/degradation contracts
- public CLI surface
- current-code migration adapters

Those are separate work.

---

## 8. Test Derivation Checklist

At minimum, unit tests derived from this document should prove:

1. `GraphFunction`, `RefinementBoundary`, and `CandidateFamily` are immutable and contract-stable.
2. `compose` is variadic, left-folded, and fail-closed on interface mismatch.
3. `substitute` preserves the outer graph boundary and exposes refined structure.
4. `fan_out` and `fan_in` require explicit `over=` boundaries.
5. `gate` preserves target outer contract and never chooses strategy.
6. `candidate_family` rejects mixed-contract candidates.
7. `promote` preserves declared representation truth and fails closed on incompatible boundaries.
8. `Traversal` is immutable, preserves its target boundary, and carries only explicit evaluator/rule inputs.
9. `traverse` delegates materialization/convergence/selection/provenance rather than inventing strategy locally.
10. `Traversal.metadata` and `WorkSurface.metadata` remain semantically distinct, with only explicit carry-forward.
11. `enumerate_candidates` preserves declared order and performs no ranking.
12. `accept_selection` validates membership and returns lawful `SelectionDecision`.
13. `delta` aggregates evaluator vectors from declared rule config rather than hardcoded all-pass behavior.
14. `MaterializationRequest` and `MaterializationRecord` preserve explicit graph-function/profile/parameter truth.
15. `derive_bundle` preserves derivation back to one materialization record.
16. `derive_bundle(kind="evaluator_bundle")` is replayable from refined structure and does not require interpreter-local hidden state.
17. provenance helpers can represent:
   - per-evaluator outcomes
   - aggregate convergence
   - selected profile/candidate
   - applied refinement
   - graph-function materialization
   - graph-derived companion bundles

---

## 9. Bottom Line

The current code/test implementation should be derived from this contract set:

- GTL stays algebraic and declarative
- ABG stays protocol-owning and provenance-owning
- domains stay responsible for prompts, programs, metrics, and merge logic

If code needs a shortcut that violates these contracts, the shortcut is wrong.
