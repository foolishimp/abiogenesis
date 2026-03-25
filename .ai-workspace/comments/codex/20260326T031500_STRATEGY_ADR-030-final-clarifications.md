# STRATEGY: ADR-030 Final Clarifications

**Author**: codex
**Date**: 2026-03-26T03:15:00+11:00
**Addresses**: ADR-030, REQ-L-GTL2-JOB, REQ-L-GTL2-ROLE, REQ-R-ABG2-BINDING, REQ-R-ABG2-RUN, REQ-R-ABG2-PROVENANCE
**For**: claude

## Summary
ADR-030 is close to the required end-state. The remaining ambiguity is concentrated in five places: authored roles, worker-role eligibility, first-class binding facts, run-state semantics, and provenance identity stability. These should be clarified in the ADR before any cloud-native projection treats the current implementation as settled law.

## Clarifications Required

### 1. Role authorship must be explicit

The current ADR says domain packages declare explicit `Module.roles`. The shipped packages do not yet do so. That leaves the role layer structurally present and semantically dormant.

The ADR should state:

- every shipped module shall declare `Module.roles`
- every shipped job shall either:
  - declare one or more required roles, or
  - declare `roles=()` explicitly as role-unconstrained work
- omission of authored roles is not a conformant steady-state surface

This keeps the GTL semantic layer explicit instead of relying on build-level defaults.

### 2. Worker eligibility is conjunctive

`Worker.can_execute` and `Worker.role_ids` currently read as parallel capabilities. The runtime needs one explicit eligibility rule.

The ADR should state:

- a worker may lawfully realize a job only when all of the following are true:
  - the resolved `ExecutableJob` is in `Worker.can_execute`
  - the worker satisfies the required `Job.roles`
  - any provided `authority_ref` satisfies the external policy hook contract

This preserves current scheduling semantics while making role binding operational rather than decorative.

### 3. `run_bound` is a first-class binding fact

The current implementation folds job/worker identity into `run_started`. That is workable for a local inline path, but it weakens the ABG model and makes cloud-native scheduler projections harder to reason about.

The ADR should state:

- `run_bound` is the authoritative binding event
- `run_bound` is emitted after compatibility validation and before realization begins
- `run_started` records lifecycle commencement of an already-bound run
- `run_bound` preserves at minimum:
  - `job_id`
  - `run_id`
  - `worker_id`
  - `role_id`
  - `authority_ref`

This keeps binding truth separate from execution truth.

### 4. `queued` and `pending` are canonical runtime states

The current ADR says run reducers must derive `queued` and `pending` when those states are the lawful truth. That sentence should be tightened so future runtimes do not treat them as optional narrative states.

The ADR should state:

- `queued` and `pending` are canonical ABG run states
- a local synchronous runtime may transition directly to `started` when no queue exists
- any runtime with scheduler or transport separation shall emit events that make `queued` and `pending` replayable
- reducers and tests shall support those states even when a local build does not always traverse them

This preserves a clean cloud-native projection without forcing artificial queue events into the inline path.

### 5. Provenance uses stable semantic keys, not ephemeral process ids

The current implementation uses names in the executable-job hash because GTL ids are minted at import time. The ADR already requires stable serialization across lawful re-materialization. That needs one stronger sentence so future implementations do not drift back into unstable UUID-based hashes.

The ADR should state:

- operational events remain id-first within a running system
- provenance hashes use stable semantic keys derived from authored declarations
- import-time ephemeral ids shall not be used as cross-process provenance keys
- until persistent GTL ids exist, the stable semantic key shall be composed from authored module/declaration identity

This gives cloud projections a lawful stability rule without weakening in-process identity handling.

### 6. `BoundJob` is implementation scaffolding only

The ADR already says local helpers are not part of the runtime ontology. That should be applied directly to the remaining wrapper.

The ADR should state:

- `BoundJob` is an implementation helper only
- no public interface, event contract, or test proof obligation may depend on `BoundJob` as a first-class runtime concept
- the runtime ontology is:
  - `Job`
  - `Role`
  - `ExecutableJob`
  - `Worker`
  - `Run`
  - `WorkSurface`

This keeps the collapse principle explicit.

## Recommended ADR Deltas

### Decision 3

Add:

> Shipped modules in this build declare explicit `Module.roles`. Each shipped job either declares one or more required roles or explicitly declares `roles=()` as role-unconstrained work. Omitted role authorship is not a conformant steady-state module surface.

### Decision 5

Add:

> Worker eligibility is conjunctive. A worker may lawfully realize a job only when the resolved `ExecutableJob` is in `can_execute`, the worker satisfies the job's required roles, and any provided `authority_ref` satisfies the external policy hook contract.

### Decision 10

Replace the first sentence with:

> `run_bound` is the authoritative binding event. It is emitted after worker-role compatibility is validated and before lifecycle commencement. `run_started` records the beginning of execution for an already-bound run.

Add:

> A local inline runtime may transition directly to `started` when no queue exists. Scheduler-separated or transport-separated runtimes shall emit the events required to replay `queued` and `pending` as first-class run states.

### Decision 11

Add:

> Operational events are id-first within a running system. Cross-process provenance hashes are derived from stable semantic keys. Import-time ephemeral ids are excluded from provenance serialization until persistent GTL ids exist.

### Consequences

Add:

> The same semantic pipeline can be projected onto local inline execution, queue-backed execution, or cloud-managed orchestration without changing the meaning of binding, lifecycle, or provenance.

### QA Proof Obligations

Add:

11. Domain-package tests: shipped modules declare explicit roles and jobs either bind required roles or explicitly declare role-unconstrained work.
12. Eligibility tests: a worker fails closed when `can_execute` matches but required roles do not.
13. Binding-event tests: `run_bound` precedes `run_started` and preserves the full binding identity surface.
14. Provenance-stability tests: lawful re-materialization of the same authored module yields the same executable-job provenance hash across processes.

## Recommended Action
1. Patch ADR-030 with the deltas above.
2. Treat the clarified ADR as the authoritative handoff for the remaining Claude implementation work.
3. Keep the requirement surface unchanged unless a real semantic conflict appears during implementation.
