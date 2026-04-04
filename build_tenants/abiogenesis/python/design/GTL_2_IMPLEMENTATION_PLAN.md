# GTL 2.x / ABG Implementation Plan

**Status**: Accepted for implementation
**Date**: 2026-03-26
**Purpose**: Convert the current constitutional/design/interface stack into a concrete implementation target for the Claude build, while explicitly rejecting shapes that would reintroduce debt.

**Derived from**:
- [GTL_2_CONSTITUTIONAL_DESIGN.md](../../../../specification/GTL_2_CONSTITUTIONAL_DESIGN.md)
- [GTL_2_MODULE_DESIGN.md](./GTL_2_MODULE_DESIGN.md)
- [GTL_2_INTERFACE_CONTRACTS.md](./GTL_2_INTERFACE_CONTRACTS.md)
- [specification/requirements/](../../../../specification/requirements/)

---

## 1. Position

This document is not a new design layer.

It is the implementation-facing read of the already accepted design. Its job is to:

- pressure-test candidate design instincts against the current requirements
- state which shapes are rejected
- state which module interfaces are now the implementation target
- define the delivery order for tests and code

The current direction is explicit:

- GTL stays algebraic and declarative
- ABG stays deterministic, replayable, and provenance-owning
- domains own prompts, programs, metrics, merge logic, and refinement logic
- the implementation target is Python with Scala-style discipline: immutable value records, pure transforms where possible, and explicit-effect interpreters at the shell

---

## 2. Pressure-Test Verdict

The current algebraic direction survives pressure-testing.

Convenience shapes that reintroduce debt do not.

The main implementation lesson is:

- most of the needed power already exists in the current operators
- what was missing was explicit declaration shape and explicit runtime ownership
- the implementation must not recover capability by hiding strategy inside interpreter conventions

This means implementation should strengthen:

- `GraphFunction`
- `RefinementBoundary`
- `CandidateFamily`
- `Traversal`
- `ConvergenceResult`
- `promote`

and should reject:

- `GraphVector` policy flags
- metadata-only strategy
- ABG-owned domain scoring/ranking
- implicit branch/evaluator/vector inference

---

## 3. Rejected Shapes

These are now considered design failures, not alternate valid implementations.

### 3.1 GraphVector Flag Creep

Rejected:

- `GraphVector.guard`
- `GraphVector.allows_refinement`
- `GraphVector.harvest_mode`
- `GraphVector.profile`

Reason:

- structural choice belongs to GTL algebraic declarations, not to ad hoc vector booleans
- these fields collapse strategy into the wrong layer
- they fail the `U1-U4` use cases by hiding policy inside interpreter-facing structure

Replacement:

- `gate(...)`
- `deferred_refinement(...)`
- `candidate_family(...)`
- `fan_out(...) -> promote(...) -> fan_in(...) -> gate(...)`

### 3.6 Anonymous Closures as Published Graph Truth

Rejected:

- published `GraphFunction.template` values that exist only as anonymous runtime closures
- publication surfaces that require ambient module state to explain what was materialized

Reason:

- replay and provenance require stable symbolic identity
- recursive zoom/materialize/fold-back needs the same published truth at every depth
- hidden closures resist law testing, cache identity, and import-time inspection

Replacement:

- symbolic `TemplateRef` publication
- interpreter-edge resolution of that symbolic reference

### 3.7 Dict-Shaped Prime Control Surfaces

Rejected:

- generic `dict` bags as the prime representation for graph-function parameters, traversal control, or materialization metadata

Reason:

- weakens inspection and law testing
- encourages hidden strategy and imperative mutation
- breaks the “Python, but it should feel like a Scala library” standard

Replacement:

- immutable named records and ordered attributes for prime public surfaces
- pragmatic dictionaries only inside helper/internal shapes, never as graph/materialization/traversal truth

### 3.2 Metadata-As-Strategy

Rejected:

- using generic metadata bags to hide:
  - candidate choice
  - refinement strategy
  - ranking mode
  - merge semantics

Reason:

- metadata is visibility surface, not strategic control plane
- hidden strategy breaks replay, provenance, and requirement trace

Replacement:

- policy-visible `Rule.config`
- explicit evaluator vectors
- explicit `CandidateFamily`
- explicit `RefinementBoundary`

### 3.3 Special Consensus or Harvest Engines

Rejected:

- separate “consensus engine” semantics in ABG
- separate “harvest engine” semantics in ABG

Reason:

- consensus and harvest are not distinct domain ontologies
- they are topological uses of existing operators plus domain-supplied evaluators/policies

Replacement:

- consensus:
  - evaluator vector
  - `delta(...)`
  - `gate(...)`
  - recursion / repeated traversal if needed
- harvest:
  - `fan_out(...)`
  - `promote(...)`
  - `fan_in(...)`
  - `gate(...)`

### 3.4 Profiles as Tags Only

Rejected:

- materialization profiles that exist only as tags, hints, or module metadata

Reason:

- `U1` requires named, policy-visible, provenance-carrying alternatives
- tags are descriptive; they do not publish lawful structural choice

Replacement:

- `CandidateFamily`

### 3.5 Traversal as Prose Only

Rejected:

- “traversal” existing only as a description of the loop

Reason:

- it prevents direct tests
- it makes runtime ownership fuzzy
- it weakens the symmetry with `ConvergenceResult` and `RefinementBoundary`

Replacement:

- explicit `Traversal`
- explicit `traverse(...)`

---

## 4. Prime Runtime / Declaration Triangle

The implementation center is now:

1. `Traversal`
2. `ConvergenceResult`
3. `RefinementBoundary`

These live in different layers on purpose:

- `Traversal` is ABG runtime orchestration
- `ConvergenceResult` is ABG runtime protocol output
- `RefinementBoundary` is GTL declaration truth

This is the correct asymmetry.

We do **not** unify them into one mega-type.

The functional reading is the point:

- GTL declares recursive structure and lawful substitution points
- ABG materializes and traverses values
- effects remain at the interpreter edge

That is the implementation bar for this line.

---

## 5. Module Implementation Targets

### 5.1 GTL Declaration Layer

#### `gtl.graph`

Implement:

- `Node`
- `GraphVector`
- `Context`
- `Graph`

Constraints:

- `GraphVector` remains internal adjacency truth
- no guard/refinement/profile/harvest semantics on `GraphVector`
- `Node[Vector[T]]` remains the representation for vectorized boundaries

#### `gtl.operator_model`

Implement:

- `Regime`, `F_D`, `F_P`, `F_H`
- `Operator`
- `Evaluator`
- `Rule`

Constraints:

- evaluators/rules declare policy-visible control surfaces only
- domain meaning stays in bindings/config, not in GTL runtime logic

#### `gtl.function_model`

Implement:

- `GraphFunction`
- `RefinementBoundary`
- `CandidateFamily`

Constraints:

- all are frozen/immutable
- all preserve explicit outer contracts
- `RefinementBoundary` carries no hidden strategy
- `CandidateFamily` is ordered and publishable

#### `gtl.module_model`

Implement:

- `Module`
- `ModuleImport`

Constraints:

- `graph_functions` and `candidate_families` are first-class publication surfaces
- candidate families are not helper-only implementation values

### 5.2 GTL Algebra Layer

#### `gtl.algebra`

Implement:

- `compose`
- `identity`
- `substitute`
- `recurse`
- `fan_out`
- `fan_in`
- `gate`
- `promote`
- `deferred_refinement`
- `candidate_family`

Constraints:

- all fail closed on interface/boundary mismatch
- no hidden inference where explicit boundary is required
- `promote` is explicit representation lift/join
- `gate` blocks or allows continuation; it does not invent strategy
- `deferred_refinement` constructs a declaration only
- `candidate_family` validates shared outer contract only

### 5.3 ABG Runtime Layer

#### `genesis/binding.py`

Implement or preserve:

- `ExecutableJob`
- `WorkSurface`
- worker/executable binding helpers

Constraints:

- `WorkSurface` is immutable output-side runtime truth
- `WorkSurface.metadata` is realized execution metadata, not control strategy

#### `genesis/convergence.py`

Implement:

- `EvaluatorOutcome`
- `ConvergenceResult`
- `delta(...)`

Constraints:

- deterministic aggregation only
- uses declared `Rule.config`
- no domain scoring invented in ABG
- evaluator vectors are explicit, replayable protocol inputs

#### `genesis/selection.py`

Implement:

- `SelectionDecision`
- `enumerate_candidates(...)`
- `accept_selection(...)`

Constraints:

- enumeration preserves order
- no ranking or scoring
- selection validation only

#### `genesis/interpret.py`

Implement:

- `Traversal`
- `traverse(...)`
- orchestration of:
  - materialization
  - convergence invocation
  - lawful selection/refinement application
  - event emission

Constraints:

- `Traversal.metadata` is input-side control/context metadata only
- no hidden strategy in traversal metadata
- event emission remains centralized here
- this module orchestrates but does not absorb selection/convergence semantics

---

## 6. Use-Case Realization Shape

### 6.1 U1 Materialization Profiles

Required shape:

- named alternatives published as `CandidateFamily`
- external/profile-aware selection
- provenance of selected profile

Implementation warning:

- do not encode profiles as tags-only shortcuts

### 6.2 U2 Gap-Triggered Context Discovery

Required shape:

- coarse path declared normally
- explicit `RefinementBoundary`
- evaluator/gate-triggered lawful refinement

Implementation warning:

- do not solve this with a `guard` or `allows_refinement` flag

### 6.3 U3 Consensus-Gated Review

Required shape:

- explicit evaluator vector
- `delta(...)`
- `gate(...)`
- repeat rounds through traversal/convergence, not a separate consensus subsystem

Implementation warning:

- do not hardcode “all evaluators must pass” except as the empty-policy default

### 6.4 U4 Parallel Worker Harvest

Required shape:

- `fan_out(...)`
- `promote(...)`
- `fan_in(...)`
- `gate(...)`

Implementation warning:

- do not smuggle harvest semantics into operator tuples or `GraphVector`

---

## 7. Delivery Order

Implementation should proceed in this order:

1. Pure GTL declarations
   - `GraphFunction`
   - `RefinementBoundary`
   - `CandidateFamily`
   - `Module` publication fields

2. Pure GTL algebra
   - `compose`
   - `identity`
   - `substitute`
   - `recurse`
   - `fan_out`
   - `fan_in`
   - `gate`
   - `promote`
   - declaration constructors

3. Pure ABG protocol surfaces
   - `EvaluatorOutcome`
   - `ConvergenceResult`
   - `delta`
   - `SelectionDecision`
   - `enumerate_candidates`
   - `accept_selection`

4. ABG traversal orchestration
   - `Traversal`
   - `traverse`

5. Use-case acceptance proofs
   - `U1-U4`

This order matters.

It prevents implementation from discovering interface shape by accident inside `genesis/interpret.py`.

---

## 8. Test Strategy

Tests should be layered in the same order:

### 8.1 Algebra Tests

Prove:

- contract preservation
- fail-closed mismatch behavior
- semantic identity preservation for `promote`
- no hidden control in declaration constructors

### 8.2 Runtime Contract Tests

Prove:

- `Traversal` immutability
- `Traversal.metadata` vs `WorkSurface.metadata` distinction
- `delta(...)` vector aggregation behavior
- selection validation without ranking
- centralized event ownership in `traverse(...)`

### 8.3 Use-Case Acceptance Tests

Prove:

- `U1` via `CandidateFamily`
- `U2` via `RefinementBoundary`
- `U3` via evaluator vectors + convergence
- `U4` via `fan_out -> promote -> fan_in -> gate`

---

## 9. Red Lines

If implementation needs any of the following, implementation is wrong:

- new `GraphVector` strategy flags
- hidden ranking in `enumerate_candidates`
- hidden refinement logic in `RefinementBoundary`
- implicit `fan_out` / `fan_in` / `promote` boundary inference
- domain scoring logic in `delta(...)`
- event emission split across selection/convergence helpers
- silent metadata inheritance from `Traversal` into `WorkSurface`

---

## 10. Bottom Line

The implementation target is now concrete.

The work is no longer:

- “how do we make the current code sort of support these use cases?”

It is now:

- “how do we implement the accepted algebraic/module contracts without leaking strategy back into ABG or structure back into `GraphVector`?”

That is the correct path to a clean GSDLC implementation.
