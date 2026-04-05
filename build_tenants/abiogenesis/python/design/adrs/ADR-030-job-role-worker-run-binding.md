# ADR-030: Semantic Job and Role in GTL, Executable Job and Binding in ABG

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-03-26
**Implements**: REQ-L-GTL3-JOB, REQ-L-GTL3-ROLE, REQ-L-GTL3-GRAPHFUNCTION, REQ-L-GTL3-GRAPHVECTOR, REQ-L-GTL3-MODULE, REQ-L-GTL3-IDENTITY, REQ-R-ABG3-WORKER, REQ-R-ABG3-BINDING, REQ-R-ABG3-RUN, REQ-R-ABG3-GRAPHCALL
**Scope**: `gtl/work_model.py`, `gtl/function_model.py`, `gtl/module_model.py`, `genesis/binding.py`, `genesis/services.py`, `genesis/run.py`, `genesis/provenance.py`, domain packages, tests

---

## Context

The GTL 3 line now treats:

- `GraphFunction` as the sole public named callable carrier
- `GraphVector` as internal realized transition structure
- `Job` as the durable semantic work contract over published callable carriers
- `Role` as the semantic capability class required to perform, supervise, or approve work

The old vector-first public job-entry model made an internal realized boundary the thing semantic work called directly.

That shape breaks the intended carrier model, especially for recursive and higher-order graph functions.

The build needs one stable split that:

1. keeps GTL `Job` and `Role` as first-class declarations
2. makes published `GraphFunction` the public contract target for semantic work
3. keeps `GraphVector` internal for scheduling, convergence, proof, substitution, and replay
4. preserves ABG executable capability and provenance without duplicating language ownership
5. avoids hidden compatibility layers that continue teaching vector-first public work entry

---

## Decision

### 1. GTL `Job` binds published `GraphFunction`

`gtl.work_model` owns:

- `ContractRef`
- `Role`
- `Job`

`Job` is the durable semantic work contract.

For the current line, public semantic work binds published graph functions by identity through:

```python
ContractRef(kind="graph_function", target_id=<published_graph_function.id>)
```

Steady-state semantic job entry over bare `GraphVector` is not part of this line.

If a declared contract:

- does not resolve
- resolves more than once
- resolves to something other than a published `GraphFunction`

the build fails closed.

### 2. `GraphVector` remains internal executable structure

`GraphVector` is retained as internal realized structure and remains first-class for:

- operators
- evaluators
- rules
- invariant transition declarations
- local proof and closure boundaries
- substitution and refinement targets
- scheduling and replay surfaces

But `GraphVector` is not the public callable carrier.

### 3. `ExecutableJob` is ABG runtime realization of one GTL job over one internal vector

`genesis.binding.ExecutableJob` remains the engine carrier, but its meaning changes.

Canonical shape:

```python
@dataclass
class ExecutableJob:
    job: gtl.work_model.Job
    graph_function: GraphFunction | None
    materialization_id: str | None
    vector: GraphVector
```

Meaning:

- `job` preserves the semantic GTL contract
- `graph_function` is the published callable carrier being realized
- `materialization_id` preserves replayable graph-function realization identity
- `vector` is the internal executable boundary the kernel evaluates or dispatches

ABG runtime entry is therefore:

`Job -> GraphFunction -> materialized graph -> internal GraphVector traversal`

### 4. `module_to_executable_jobs()` materializes graph functions into executable vectors

`genesis.binding.module_to_executable_jobs()` shall:

1. resolve each GTL `Job` contract to a published `GraphFunction`
2. materialize that graph function lawfully
3. emit one or more `ExecutableJob` values over the internal vectors of that realized graph

This preserves the public callable carrier while keeping internal traversal explicit and typed.

### 5. Roles are authoritative on semantic jobs for binding in this build

Execution binding is driven by `Job.roles`.

Direct role attachment on `GraphFunction` or `GraphVector` is deferred.

Shipped modules declare explicit `Module.roles`.

Workers may lawfully realize an `ExecutableJob` only when:

- the executable capability is present or the internal step is otherwise role-compatible
- the worker satisfies the job's required roles
- any external authority surface is satisfied by the active runtime

### 6. No second convergence surface on GTL `Job`

GTL `Job` does not own evaluators.

Evaluator ownership stays on internal realized vectors.

`ExecutableJob` exposes evaluators as a derived property over `vector.evaluators`.

This keeps convergence truth single-owned.

### 7. Internal frame and termination jobs are runtime-local, not public semantic work

Recursive frame child steps and termination checks may use internal runtime-local `Job` wrappers.

Those internal runtime-local wrappers:

- are not published semantic work contracts
- do not redefine the public callable carrier
- may omit public contract refs because their lineage is already anchored by the parent public graph-function contract and frame provenance

---

## Consequences

### Positive

- public callable work now matches the recursive and higher-order GTL carrier model
- jobs, publication, materialization, and selection all line up around `GraphFunction`
- `GraphVector` keeps its real value as internal invariant-boundary structure
- ABG can stay vector-aware internally without leaking vector-first ontology into public work entry

### Required Follow-on

- re-author shipped GTL package jobs over published graph functions
- reprice runtime binding from vector-only public entry to graph-function-first materialization
- reprice tests so public job entry is proved over graph functions
- keep internal vector-level tests only where they are explicitly testing internal realized traversal
