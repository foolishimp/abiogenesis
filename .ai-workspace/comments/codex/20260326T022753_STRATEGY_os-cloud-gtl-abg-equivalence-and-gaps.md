# OS / Cloud / GTL-ABG Equivalence and Gaps

## Frame

`GTL` is the semantic SDK.

`ABG` is the canonical execution model.

The implementation stack is a projection target, not the authority surface.

The value of the comparison is gap discovery. Mature OS and cloud models already separate:

- definition from execution
- capability from concrete identity
- scheduling from permission
- durable work unit from execution instance
- semantic execution identity from underlying process plumbing

Those separations are the stress test for the `GTL / ABG` model.

---

## Equivalence Table

| Concern | Traditional OS / Programs | Cloud / Workflow Systems | `GTL` | `ABG` | ABIogenesis fulfillment |
| --- | --- | --- | --- | --- | --- |
| Structural program definition | executable, library, program source | workflow, DAG, process definition | `Graph`, `GraphFunction`, `Module` | consumes GTL | GTL defines the semantic work structure |
| Named work unit | service unit, cron unit, command entry | workflow, flow, job, task group | `Job` | resolves `Job -> ExecutableJob` | `Job` is the durable semantic work contract |
| Capability class | group, capability profile, role | worker pool tag, queue class, role | `Role` | binds `Worker -> Role` | `Role` says what kind of actor may perform the work |
| Concrete actor identity | process owner, daemon identity, service account | worker, agent, executor, runner | external hook only | `Worker` | `Worker` is the concrete runtime actor identity |
| Runnable contract | loaded image, runnable program | task instance payload, activity payload | semantic source only | `ExecutableJob` | ABG resolves a semantic job to a concrete executable contract |
| Execution instance | `PID` / process instance | run id, execution id, task instance id | none | `Run` / `run_id` | `RunID` is the semantic execution identity |
| Scheduling | kernel scheduler, cron, systemd timer | scheduler, trigger, deployment, cron | semantic schedule/job model later | owns run timing/order | ABG schedules and realizes runs |
| Dependency ordering | process tree, init order, pipes, IPC | DAG edges, dependencies, triggers | `GraphVector`, graph topology | traversal / interpretation | GTL defines the topology; ABG traverses it |
| Deterministic execution | local process / syscall work | deterministic task / container / job | `F_D` | deterministic evaluator / operator realization | deterministic work is first-class |
| Probabilistic execution | not first-class | agent call, ML service, async task | `F_P` | delegated / transport-backed realization | probabilistic work is first-class |
| Human gate | manual approval outside the OS | approval task, human-in-loop gate | `F_H`, `Rule`, `Evaluator` | approval / gating realization | human judgment is first-class |
| Permission to act | capabilities, DAC, MAC, groups | IAM, RBAC, policy binding | `Role`, policy hooks | `Worker.role_ids`, `authority_ref` | auth stays external; GTL/ABG carry the semantic hooks |
| Context / environment | env vars, files, cwd, stdin | inputs, artifacts, secrets, config | `Context` | context binding and resolution | context is explicit and digest-bound |
| Logs / emitted truth | stdout, stderr, syslog, auditd | run log, event stream | none | append-only events | ABG event stream is the canonical emitted truth |
| State reconstruction | proc table, journal replay | workflow history, state store | none | projection / reducers | ABG derives current truth from events |
| Output / artifact surface | filesystem outputs, side effects | artifacts, object storage, task outputs | target contracts | `WorkSurface` | `WorkSurface` is the immutable execution dossier |
| Provenance / audit | audit log, journald, tracing | execution history, lineage, metadata | semantic ids and contracts | provenance, lineage, hashes | ABG keeps replayable why/how truth |
| Retry / timeout / supersession | restart policy, watchdog, signal handling | retries, backoff, timeout, superseded runs | can be semantically declared later | run lifecycle | ABG owns attempt governance |
| Publication / packaging | package, binary, library namespace | project, package, deployment unit | `Module` | loads module | `Module` is the publication/import boundary |
| Boot / self-hosting | bootloader, init, system image | deployment bootstrap, control plane | bootloader-visible GTL surface | self-hosting and drift checks | ABIogenesis bootstraps and checks its own semantic surface |

---

## Core Reading

`GTL` is closest to:

- program definition
- service or work-unit definition
- semantic capability declaration
- workflow algebra
- `F_D / F_P / F_H` orchestration semantics

`ABG` is closest to:

- scheduler
- process manager
- service manager
- event log and state projection layer
- executor binding layer

This means:

- `GTL` defines what the program means
- `ABG` defines how that meaning becomes execution truth
- concrete technology realizes `ABG`, not `GTL`

---

## Important Non-1:1 Points

`RunID` is like a `PID`, but only at the ABG layer.

One `Run` may use zero, one, or many real OS processes underneath. OS `PID`s are transport plumbing. `RunID` is the semantic execution identity.

`Role` is not a user account or a worker.

It is a semantic capability class.

`Worker` is not a role.

It is the concrete actor identity that may fulfill one or more roles.

`WorkSurface` is not just logs.

It is:

- emitted events
- artifacts
- consumed and emitted context
- findings and attestations
- immutable execution dossier

`F_D / F_P / F_H` is stronger than most existing runtimes expose directly.

That is one place where ABIogenesis is not just copying an OS or workflow system. It is defining a more semantically explicit execution model.

---

## Gaps Exposed by the Comparison

### 1. Job versus orchestration unit is still underspecified

The model now has `Job` and `Run`.

The comparison suggests one more stable distinction may be needed later:

- semantic `Job`
- operational schedule / deployment / trigger
- `Run`

Today `Run` exists and `Job` exists.

The stable operational unit that accumulates run history under schedules is still thin.

This matters for:

- "runs at 4pm daily"
- SLA / KPI measurement
- repeated late runs
- environment-specific orchestration

### 2. Role exists semantically, but worker-role binding is still thin

The comparison says the model needs:

- semantic capability class
- concrete actor identity
- binding rule between them

The current shape has the nouns, but the operational binding semantics are still light.

The key unresolved question is:

- is `Worker.can_execute` a concrete dispatch table
- or is dispatch derived from `Worker -> Role -> Job`

The mature model likely needs both:

- role compatibility
- concrete executable capability

### 3. Worker is one concept doing two jobs

The comparison suggests `Worker` currently mixes:

- actor identity
- executable capability set

That may remain acceptable.

If it does not, the model may later need a clearer split between:

- actor identity
- runtime capability profile

For now this is not necessarily a bug. It is a pressure point.

### 4. Run is present, but deployment / schedule / trigger is not first-class enough

OS and cloud models separate:

- what should run
- when it should run
- what actually ran

The current `GTL / ABG` model clearly has:

- `Job`
- `Run`

It does not yet have a strong first-class semantic and runtime story for:

- `Schedule`
- `Trigger`
- `Window`
- KPI / SLA

That is the orchestration gap.

### 5. WorkSurface is strong, but its relationship to events should stay explicit

The comparison shows two truths:

- append-only event truth
- accumulated execution dossier

The model should keep them distinct:

- events remain canonical replay truth
- `WorkSurface` is the immutable accumulated evidence surface

If that line blurs, the ontology gets noisy again.

### 6. Authority hook is right, but the binding contract should be sharper

The OS / cloud comparison supports the current decision:

- authentication is external
- authority resolution is external
- ABG records the result

The missing precision is the exact binding contract:

- does a run bind a worker under a role with an authority snapshot
- or only a worker id and optional authority ref

The stronger model is:

- `Run` binds `Worker` under `Role`
- records `authority_ref`

That is enough hook surface without rebuilding IAM.

### 7. GTL likely owns more of the operating model than is currently surfaced

The comparison suggests `GTL` does not only define static graph topology.

It also defines part of the operating model:

- semantic jobs
- semantic roles
- possibly future schedules, triggers, windows, KPIs

This does not make GTL a runtime.

It makes GTL the semantic source for more than structure alone.

### 8. ABG needs a cleaner equivalent of the OS service manager

OS and cloud systems have a stable concept between definition and execution:

- service unit
- deployment
- scheduled job

ABG currently has:

- module
- worker
- run

It likely still needs a stronger operational unit above `Run` and below pure semantic `Job`.

That may become:

- deployment
- schedule
- or another orchestration-owned binding surface

### 9. The projection discipline must stay explicit

The comparison is useful only if the direction of authority remains clear:

- GTL is the semantic definition
- ABG is the canonical realization
- technology is a projection target

If implementation details flow back into the model unchecked, the ontology will drift toward whatever runtime happened to be used first.

---

## Current Working Model

The current clean reading is:

- `GTL` defines the semantic SDK
- `Graph`, `GraphFunction`, `Job`, `Role`, `Module`, `Operator`, `Evaluator`, `Rule` are the language surface
- `ABG` realizes those semantics through `ExecutableJob`, `Worker`, `Run`, events, projection, convergence, and `WorkSurface`
- the implementation stack is a projection from that model onto concrete technology

That model is internally coherent.

The remaining gaps are mostly:

- orchestration depth
- worker-role binding depth
- operational unit depth between `Job` and `Run`

---

## Questions Worth Carrying Forward

1. Does ABG need a first-class `Deployment` or equivalent orchestration unit between `Job` and `Run`?
2. Should dispatch be governed by `Worker.can_execute`, `Worker -> Role`, or both?
3. Is `Worker` stable as one type, or should identity and capability be separated later?
4. Which orchestration concepts should become first-class in GTL: `Schedule`, `Trigger`, `Window`, `KPI`?
5. What is the minimum binding record for a lawful run: `job_id`, `run_id`, `worker_id`, `role_id`, `authority_ref`, `vector_id`?
6. What is the long-term relationship between event truth and `WorkSurface` truth?

These are the main semantic pressure points exposed by the comparison.
