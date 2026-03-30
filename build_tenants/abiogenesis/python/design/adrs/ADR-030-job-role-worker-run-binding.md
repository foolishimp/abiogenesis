# ADR-030: Semantic Job and Role in GTL, Executable Job and Binding in ABG

**Series**: abiogenesis / claude_code build
**Status**: Accepted
**Date**: 2026-03-26
**Implements**: REQ-L-GTL2-JOB, REQ-L-GTL2-ROLE, REQ-L-GTL2-MODULE, REQ-L-GTL2-IDENTITY, REQ-R-ABG2-WORKER, REQ-R-ABG2-BINDING, REQ-R-ABG2-RUN
**Scope**: `gtl/work_model.py`, `gtl/module_model.py`, `gtl/__init__.py`, `genesis/binding.py`, `genesis/services.py`, `genesis/run.py`, `genesis/provenance.py`, `genesis/selfhosting.py`, `gtl_spec/GTL_BOOTLOADER.md`, domain packages, tests

---

## Context

The active semantic surface is:

- GTL `Job` as durable semantic work contract
- GTL `Role` as semantic capability class
- ABG `Worker` as concrete actor identity
- ABG `Run` as execution attempt
- ABG `Binding` as `Worker -> Role` and `Run -> Job`

The Claude build kernel uses one executable-contract runtime shape:

- `genesis.binding.Job` is a runtime wrapper over one `GraphVector`
- `Worker.can_execute` drives capability, scope filtering, write-territory analysis, and conflict scheduling

That runtime shape cannot be replaced by a GTL `Job` declaration without losing working engine semantics. At the same time, keeping two unrelated `Job` concepts would reintroduce ontology drift.

The build therefore needs a precise split that:

1. introduces GTL `Job` and `Role` as first-class declarations
2. preserves the existing executable-contract surface needed by the kernel
3. keeps operational targeting and provenance id-based
4. avoids creating duplicate ownership of evaluator/convergence semantics
5. collapses phase-specific runtime wrappers into one immutable execution surface where possible

---

## Decision

### 1. Add `gtl.work_model`

This build introduces a new GTL module:

- `gtl.work_model`

It owns three declaration types:

```python
@dataclass(frozen=True)
class Attr:
    key: str
    value: Any

@dataclass(frozen=True)
class Attrs(Mapping[str, Any]):
    entries: tuple[Attr, ...] = ()

@dataclass(frozen=True)
class ContractRef:
    kind: str                  # current build: "graph_vector"
    target_id: str             # identity of the referenced GTL contract


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

`Role` and `Job` are first-class GTL declarations and therefore carry opaque identity per `REQ-L-GTL2-IDENTITY`.

### 2. `GraphVector` is the primary job contract target

`REQ-L-GTL2-JOB-003` allows jobs to reference `Graph`, `GraphFunction`, `GraphVector`, or equivalent contract references.

This build implements:

- `ContractRef.kind == "graph_vector"` as the only supported steady-state contract kind

Not part of this build:

- graph-level jobs
- graph-function-level jobs
- multi-contract orchestration over a single GTL job

If unsupported contract kinds are encountered, the build fails closed.

If a declared `ContractRef.target_id`:

- does not resolve
- resolves more than once
- or resolves to a non-`GraphVector` target in this build

the build also fails closed.

### 3. Roles are authoritative on jobs for execution binding in this build

The active requirement surface allows roles on jobs and, where lawful, on graph contracts.

This build implements the conservative subset:

- execution binding is driven by `Job.roles`
- direct role attachment on `GraphVector` / `GraphFunction` is deferred
- shipped modules declare explicit `Module.roles`
- shipped jobs either declare one or more required roles or explicitly declare `roles=()` as role-unconstrained work

This avoids unresolved precedence rules between:

- roles declared on a job
- roles declared on an underlying graph contract

Direct graph-contract role attachment is not part of this build. If it is added later, it must be introduced with an explicit compatibility rule. This ADR does not invent that rule.

Omitted role authorship is not a conformant steady-state module surface.

### 4. Rename the current runtime `Job` to `ExecutableJob`

The current `genesis.binding.Job` is renamed to:

- `ExecutableJob`

Its role is:

- resolve one GTL `Job` to one executable `GraphVector` contract for the current build
- expose the typed source/target surface the kernel already uses

Canonical shape:

```python
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
```

This preserves the current kernel contract while removing the `Job` name collision.

### 5. `Worker.can_execute` stays; roles are additive

`Worker.can_execute` is not replaced by roles.

Current kernel behavior depends on it for:

- scope filtering
- capability surface
- write-territory analysis
- conflict detection and batching

So `Worker` becomes:

```python
@dataclass
class Worker:
    id: str
    can_execute: list[ExecutableJob] = field(default_factory=list)
    role_ids: tuple[str, ...] = ()
    authority_ref: str | None = None
```

Meaning:

- `can_execute` preserves executable capability and scheduling semantics
- `role_ids` declare which GTL roles this worker may fill
- `authority_ref` preserves externally resolved authority input

Worker eligibility is conjunctive. A worker may lawfully realize a job only when:

- the resolved `ExecutableJob` is present in `can_execute`
- the worker satisfies the job's required roles
- any provided `authority_ref` satisfies the external policy hook contract

Dispatch paths enforce this eligibility rule before emitting `run_bound` or `run_started`.

### 6. Standardize on immutable `WorkSurface`

This build does not preserve a family of phase-specific wrapper types such as:

- `BoundJob`
- `PreparedJob`
- `ResolvedJob`
- `EvaluatedJob`

The common returned execution carrier is:

- `WorkSurface`

`WorkSurface` is immutable and owns:

- execution evidence
- consumed and emitted context
- artifacts
- findings and attestations
- stage-local metadata required for audit or lawful promotion upstream

`Run` owns lifecycle identity and state.

`ExecutableJob` owns the resolved executable contract.

`WorkSurface` owns the elastic execution dossier.

If a local helper is needed to carry prompt assembly or pre-dispatch packaging,
it is an implementation helper only. It is not part of the runtime ontology.

`BoundJob` is therefore an implementation scaffold only. No public interface,
event contract, or proof obligation treats it as a first-class runtime concept.

### 7. No second convergence surface on GTL `Job`

GTL `Job` does not own evaluators.

Evaluator ownership stays where it already belongs:

- `GraphVector.evaluators`

`ExecutableJob` exposes evaluators as a derived property over the resolved vector.

This avoids duplicated convergence truth across:

- GTL `Job`
- GTL `GraphVector`
- ABG executable contracts

### 8. Explicit GTL jobs are required

Execution resolves `Module.jobs` into `ExecutableJob`s.

This build does not define runtime synthesis of durable GTL `Job` declarations.

Modules that omit explicit jobs are not conformant to the target design.

Any lawful topology rewrite that synthesizes or rebuilds GTL jobs preserves the same conformance rule:

- each synthesized job declares required roles, or
- each synthesized job explicitly declares `roles=()` as role-unconstrained work

Vectors or contracts introduced by refinement do not create implicit roleless jobs on the live surface.

### 9. Binding and run provenance are id-first

Operational records use ids, not labels, for semantic handles.

The binding record and run-related events preserve at minimum:

- `job_id`
- `run_id`
- `worker_id`
- `role_id`
- `authority_ref`

Additive fields such as:

- `job_name`
- `role_name`
- `vector_id`
- `edge`

may be recorded for readability, but they are not the operational handle.

### 10. Add a binding event and align run-state realization

This build adds:

- `run_bound`

`run_bound` is the authoritative binding event. It is emitted after
worker-role compatibility is validated and before lifecycle commencement.
`run_started` records the beginning of execution for an already-bound run.

`RunState` is extended to carry:

- `job_id`
- `worker_id`
- `role_id`
- `authority_ref`
- optionally `vector_id`

Run reducers must also be brought into conformance with the active run
requirement surface, including explicit derivation of `queued` and `pending`
when those states are the lawful truth.

`queued` and `pending` are canonical ABG run states. A local inline runtime may
transition directly to `started` when no queue exists. A scheduler-separated or
transport-separated runtime shall emit the events required to replay `queued`
and `pending` as first-class run states.

### 11. Provenance hash incorporates executable-job semantics

The executable-job provenance hash includes:

- declared job identity
- resolved contract identity
- required role identity
- evaluator definitions
- bound context digests

This ensures provenance truth includes job and role semantics rather than only evaluator text.

The concrete serialization must remain stable across lawful re-materialization of the same module.

Operational events remain id-first within a running system. Cross-process
provenance hashes use stable semantic keys derived from authored declarations.
Import-time ephemeral ids are excluded from provenance serialization until
persistent GTL ids exist.

---

## Module Changes

### GTL

- add `gtl.work_model`
- extend `gtl.module_model.Module` with `jobs` and `roles`
- broaden `ModuleImport.names` from graph-function-only naming to declaration naming
- export `Job`, `Role`, and `ContractRef` from `gtl.__init__`

### ABG

- rename `genesis.binding.Job` -> `ExecutableJob`
- extend `Worker` with `role_ids` and `authority_ref` while retaining `can_execute`
- replace `module_to_jobs()` with `module_to_executable_jobs()` that resolves `Module.jobs`
- standardize the returned execution dossier as immutable `WorkSurface`
- extend `RunState` and run reducers for binding identity fields
- emit and replay `run_bound`
- widen self-hosting / bootloader type surfaces to include GTL `Job` and `Role`

### Domain packages

- declare explicit `Module.roles`
- declare explicit `Module.jobs`
- declare job roles explicitly or explicitly declare `roles=()`
- resolve jobs to graph-vector contracts by id

---

## Consequences

### Positive

- GTL `Job` and `Role` become real declarations rather than implicit runtime concepts
- the kernel keeps its current executable scheduling semantics
- role/authority hooks become explicit without inventing IAM
- provenance becomes referentially sound for job/role binding
- the runtime ontology collapses back to `ExecutableJob`, `Run`, and immutable `WorkSurface` instead of proliferating wrapper names
- the same semantic pipeline can be projected onto local inline execution, queue-backed execution, or cloud-managed orchestration without changing the meaning of binding, lifecycle, or provenance

### Negative

- the runtime must preserve a separate `ExecutableJob` concept alongside GTL `Job`
- domain packages must declare jobs explicitly
- direct graph-contract role attachment remains deferred until precedence semantics are ratified

---

## Non-Decisions

This ADR does not yet define:

- orchestration declarations such as schedules, triggers, windows, or KPIs
- graph-level or graph-function-level job execution in this build
- direct role attachment precedence on graph contracts
- authentication or authority resolution logic

---

## QA Proof Obligations

Minimum proof set for implementation:

1. Contract tests: `Job`, `Role`, and `ContractRef` are frozen, id-bearing GTL declarations.
2. Module tests: `Module` owns jobs and roles; import surfaces preserve them.
3. Resolution tests: explicit GTL jobs resolve to `ExecutableJob`s by `GraphVector.id`.
4. Negative resolution tests: unsupported contract kinds and unknown target ids fail closed.
5. Binding tests: worker without required role cannot lawfully realize a run.
6. Provenance tests: `run_bound` preserves `job_id`, `run_id`, `worker_id`, `role_id`, `authority_ref`.
7. Identity tests: duplicate labels with distinct ids do not alias in binding or run history.
8. Regression tests: current worker conflict scheduling semantics remain intact after role introduction.
9. Work-surface tests: immutable `WorkSurface` carries consumed context, emitted context, artifacts, findings, and attestations without mutation.
10. Run-state tests: reducer derives `queued` and `pending` when those states are the lawful truth.
11. Domain-package tests: shipped modules declare explicit roles and jobs either bind required roles or explicitly declare role-unconstrained work.
12. Eligibility tests: a worker fails closed when `can_execute` matches but required roles do not.
13. Binding-event tests: `run_bound` precedes `run_started` and preserves the full binding identity surface.
14. Provenance-stability tests: lawful re-materialization of the same authored module yields the same executable-job provenance hash across processes.
