# Axiomatic Handoff: GraphFunction Recursion Correction

Date: 2026-04-01
Author: Codex
Context: follow-on to `20260401T063233_DESIGN_FAILURE_graphfunction-globalization-vs-recursive-locality.md`
Audience: Codex started from `/Users/jim/src/apps/abiogenesis`

## Purpose

This note is the stricter handoff for repairing ABG's `GraphFunction` runtime
semantics.

The earlier note identified the design failure. This note adds:

- the traced requirement/design/module evidence
- the exact place the semantic drift entered
- the axioms the repair must satisfy
- the concrete module/test changes required
- the safest repair order

## Executive Diagnosis

The current ABG `1.1.1` runtime is not merely missing a validation step.

It implements the wrong codomain for graph-function application.

What the constitutional/intent surfaces describe:

- recursive work identity
- local refinement
- stable outer contracts
- lineage/fold-back over child work

What the runtime currently does:

- materialize selected graph function
- substitute inner graph into containing graph
- rebuild jobs and worker capability over the new live vectors
- mutate the live module in scope

That is a global rewrite model with provenance.

It is not true recursive local execution.

## Primary Finding

The problem is not only legacy code retention. The drift is layered:

1. Intent and recursion semantics point toward local recursive execution.
2. GTL substitution requirements retained an older "zoom exposes inner graph"
   signal.
3. Design surfaces normalized substitution as the realization mechanism for
   recursive refinement.
4. ABG modules implemented that design literally.
5. Integration tests then locked the rewrite behavior in as expected truth.

So the failure is a specification/design/module split, not just a bad function.

## Evidence Chain

### 1. Constitutional / Intent Signal

`specification/INTENT.md`

- `INT-004` says the system requires recursive refinement and durable work
  identity as first-class law.
- It explicitly says the transport stays small and lawful while structure is
  added around it.
- It says zoom/refinement is local:
  - the outer graph still sees the same contract
  - the kernel does not change
  - refinement is local
- It also says the runtime unit is traversal of an invocation, not the algebra
  itself.

This is the strongest semantic signal in the tree.

### 2. GTL Capability Signal

`specification/requirements/gtl/REQ-L-GTL2-RECURSE.md`

- recursion may induce child or repeated graph-function application
- recursion preserves explainable parent/child lineage
- parent convergence may depend on child truth
- recursion preserves the outer interface

`specification/requirements/gtl/REQ-L-GTL2-GRAPHFUNCTION.md`

- graph function is the caller-visible contract boundary
- internal refinement may change realized structure while outer contract remains
  stable
- graph function is the unit of substitution, recursion, and higher-order
  application

These requirements align with private recursive invocation better than with
global topology mutation.

### 3. The Requirement-Level Drift

`specification/requirements/gtl/REQ-L-GTL2-SUBSTITUTE.md`

This is where the macro/globalization signal survives.

The critical clause is:

- substitution shall expose the refined internal structure
- inner graph vectors become visible graph structure within the outer graph

That is lawful as graph algebra.

It is not automatically lawful as runtime module semantics.

This requirement collapses two different statements:

- graph-level substitution exposes inner structure in the result graph
- runtime graph-function application should globalize inner structure

Only the first is justified.

The second is the mistake.

### 4. ABG Runtime / Lineage Signal

`specification/requirements/abg/REQ-R-ABG2-LINEAGE.md`

- `work_key` scopes convergence, replay, spawn/fold-back, selection, correction
- ABG supports spawn
- ABG supports fold-back
- composition/substitution/fan-out/fan-in/fold-back preserve explainable
  lineage

This requirement family is frame-friendly. It describes child work as lineage,
not as mandatory global vector promotion.

### 5. Design-Level Drift

`build_tenants/abiogenesis/python/design/README.md`

- "recursive refinement as lawful substitution over stable outer contracts"

`build_tenants/abiogenesis/python/design/GTL_2_INTERFACE_CONTRACTS.md`

- `substitute()` says the result graph must expose the refined inner structure

`build_tenants/abiogenesis/python/design/GTL_2_MODULE_DESIGN.md`

- `abg.interpret` is described as "substitution orchestration"

That is the design pivot where recursive locality was translated into
substitution-driven runtime semantics.

### 6. Module-Level Reality

`build_tenants/abiogenesis/python/code/genesis/interpret.py`

`apply_selection(...)`

- validates the selected graph function
- materializes it
- calls `substitute(containing_graph, target_vec.id, inner_graph)`
- returns `SelectionResult` with `substituted_graph`

The docstring is explicit:

- caller is responsible for persisting the new topology
- e.g. rebuilding jobs from the updated module

`_selection_outcome(...)`

- takes `substituted_graph`
- rebuilds `updated_graphs`
- rebuilds jobs over the new live vectors
- rebuilds worker executable capability
- emits `work_spawned`
- returns `updated_module` and `updated_worker`

`build_tenants/abiogenesis/python/code/genesis/services.py`

- installs `outcome.updated_module` into `scope.module`
- installs `outcome.updated_worker` into `scope.worker`

This is not ambiguous. The runtime mutates the live executable module carrier.

### 7. Test Lock-In

`build_tenants/abiogenesis/python/test_env/tests/test_m03_engine_kernel_integration.py`

The test name itself is dispositive:

- `test_candidate_family_selection_rewrites_module_and_spawns_children`

It explicitly asserts:

- `outcome.updated_module is not None`
- the updated module's live vectors are the inner ones
- child work is spawned from those rewritten vectors

So the test suite does not merely tolerate rewrite semantics. It codifies them
as the expected success path.

## Secondary Finding

`gtl.algebra.recurse(...)` is only declarative.

It preserves recursion metadata on a `GraphFunction`, but ABG owns the execution
loop. There is no corresponding frame interpreter that realizes recursive
application as private local execution.

So the current system has:

- a recursion declaration surface
- a substitution/materialization runtime
- no dedicated recursive invocation runtime

That gap was silently filled by module rewrite.

## Root Cause Statement

The root cause is:

ABG treated graph-function application as graph substitution plus module
recompilation, because the design stack never cleanly separated:

- algebraic substitution over graphs
from
- recursive invocation over published runtime modules

That ambiguity allowed the old zoom/macro instinct to survive into the V2 line.

## Repair Axioms

Any repair should satisfy these axioms.

### AX-001 Published Module Stability

The published module carrier is the public runtime contract surface.

Selecting a graph function must not mutate that carrier by default.

### AX-002 Invocation Over Rewrite

Graph-function application is an invocation, not a module rewrite.

The runtime result of selection should be a frame/invocation plan, not a
substituted module.

### AX-003 Private Inner Topology

Inner vectors are frame-local unless explicitly exported.

They may be projected for inspection, but they are not peer live vectors in the
module-global traversal surface.

### AX-004 Stable Outer Boundary

The caller-visible traversable contract remains the outer vector.

Selection changes the realization of that boundary, not the published boundary
itself.

### AX-005 Lineage As Runtime Truth

Recursive descent is represented through child lineage keyed from the parent
`work_key`, not through rewriting the module graph.

### AX-006 Fold-Back, Not Promotion

Parent convergence consumes child/frame truth through fold-back.

The kernel should reduce child outcomes back into the parent boundary rather
than promoting child vectors into global topology.

### AX-007 Projection Distinction

"Materialized topology" is lawful only as:

- frame-local execution truth
- trace/projection artifact
- debug/inspection artifact
- compile/export artifact

It is not automatically the executable module topology.

### AX-008 Substitute Is Algebraic

`substitute()` remains lawful and useful.

But it should be treated as:

- graph algebra
- compile-time transformation
- inspection/projection utility

not the default runtime meaning of graph-function selection.

### AX-009 Closure Must Be Canonical Or Impossible

If ABG retains any operative global-rewrite mode, it must be implemented as one
canonical closure operator that transports all module-level witnesses together
and fails before escape.

No caller-side cleanup.
No partial repair.

## Required Design Corrections

### 1. Requirement Corrections

Update the GTL/ABG requirement surfaces so they no longer imply that runtime
graph-function application globalizes inner vectors.

Minimum changes:

- tighten `REQ-L-GTL2-SUBSTITUTE`
  - keep graph-level exposure semantics
  - remove or qualify any implication that runtime application promotes inner
    vectors into module-global execution space
- strengthen `REQ-L-GTL2-RECURSE`
  - make invocation-local recursion explicit
  - state that child applications are lineage, not module mutation
- strengthen `REQ-R-ABG2-INTERPRET`
  - ABG shall realize graph-function application as invocation/frame execution
    over a stable published module surface
- strengthen `REQ-R-ABG2-LINEAGE`
  - fold-back is the parent convergence mechanism for recursive graph-function
    application

### 2. Design Corrections

`abg.interpret` should no longer be described as substitution orchestration.

Introduce a design surface for invocation semantics, for example:

- `InvocationFrame`
- `FrameStep`
- `FrameOutcome`
- `FoldBackOutcome`
- optional `FrameProjection`

Design intent:

- selection creates frame
- frame owns inner graph execution
- projection reads frame-local topology
- parent vector remains the public contract

### 3. Module Corrections

Refactor `genesis.interpret` so:

- `apply_selection(...)` does not return `substituted_graph`
- it returns something like `InvocationPlan` or `FrameSpec`
- `_selection_outcome(...)` does not rebuild module/jobs/worker
- it opens child lineage / frame state and returns a selected/invoked outcome
- `gen_iterate()` does not replace `scope.module` on graph-function selection

### 4. Event / Projection Corrections

Add frame-aware event truth rather than treating child vectors as new global
vectors.

Likely needed events:

- `workflow_selected`
- `frame_opened`
- `frame_step_started`
- `frame_step_completed`
- `frame_foldback`
- `frame_closed`

Projection then answers:

- current parent vector state
- frame-local current state
- fold-back status
- child lineage truth

### 5. Test Corrections

Retire rewrite-based assertions as the primary success case.

Replace with tests that prove:

- selection does not mutate the published module carrier
- inner vectors are not globally traversable by default
- child work exists as lineage/frame truth
- parent convergence depends on fold-back
- frame projection exposes inner topology without rewriting module topology

The current integration test is actively encoding the wrong contract and should
be treated as repair work, not as guardrail truth.

## Safe Repair Order

Do not start by patching `genesis_sdlc` again.
Fix ABG first.

Suggested order:

1. Freeze the current globalization path
   - mark `materialized` or rewrite-like runtime modes as experimental/non-prime
   - do not deepen them

2. Correct requirement language
   - especially `SUBSTITUTE`, `RECURSE`, `INTERPRET`, `LINEAGE`

3. Correct design docs
   - replace "substitution orchestration" with frame execution semantics

4. Introduce frame types and projection model
   - without deleting current code yet

5. Add new tests for frame-local semantics
   - before deleting rewrite path

6. Change selection runtime to return invocation/frame state
   - not updated module

7. Remove module-rewrite expectations from tests

8. Only then consider whether a separate compile/export mode should still use
   `substitute()`

## Anti-Goals

Do not repair this by:

- synthesizing more `RefinementBoundary` entries for inner vectors
- rebuilding more jobs or worker capability after selection
- making module rewrite more complete
- treating inspection topology as execution topology

Those only harden the wrong model.

## Short Handoff

The job is not "fix materialized topology."

The job is:

- restore ABG's runtime semantics so `GraphFunction` selection is recursive and
  local
- keep the published module carrier stable
- move child execution into invocation frames and lineage
- make projection/fold-back, not module rewrite, the mechanism of recursive
  refinement

If a fix starts by asking "how do I publish the inner vectors globally?" it is
already pointed the wrong way.
