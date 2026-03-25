# Separate Process: Job / Role / Worker Requirement Cascade

## Purpose

Track the `Job / Role / Worker / Run` semantic clarification as a separate process from the current V2 refactor and V1 retirement work.

This should not be folded into the Phase 4e cleanup stream by accident.

The current refactor is primarily about:

- removing V1 carriers from the hot path
- flipping the public surface to V2
- rewriting the proof lane to native V2

The `Job / Role / Worker` work is different.
It is a semantic expansion / correction of the model itself.

## Why Separate

The current requirement `REQ-R-ABG2-JOB-WORKER` is too blunt.

It treats `Job` and `Worker` as if they are merely runtime scheduling concepts.
That loses important semantic meaning from V1:

- `Job` was not just a queue item
- `Worker` was not just a process
- together they expressed capability and identity semantics

This needs to be handled as its own constitutional correction, not as a side effect of structural rewiring.

## Target Model

### GTL

- `Job`: durable semantic work contract
- `Role`: capability class required by a job or graph contract

### ABG

- `Worker`: concrete actor identity
- `Run`: execution instance associated to a job
- `Binding`: `Worker` binds to `Role`; `Run` realizes `Job`

### External

- authentication remains out of scope
- authority resolution remains out of scope
- ABG records the result of that external resolution via `worker_id` and `authority_ref`

## Intended Semantics

### Job

`Job` is a durable semantic contract with domain meaning.

Examples:

- `end_of_day_liquidity_calc`
- `daily_tax_rollup`
- `schema_discovery_for_feed_X`

A job is not merely "something on a queue".
It is a named work contract that can accumulate many runs over time.

### Role

`Role` is the semantic capability class required to perform or supervise a job or graph contract.

Examples:

- `liquidity_calculator`
- `code_reviewer`
- `regulatory_approver`

### Worker

`Worker` is the concrete actor identity in ABG.

Examples:

- a specific agent identity
- a human approver identity
- a calculation engine identity
- a service identity

### Run

`Run` is one concrete execution instance of a job.

A job may have many runs.
A run is where execution truth, timing, success/failure, and provenance live.

### Binding

The core binding rule is:

- `Worker binds to Role`
- `Run realizes Job`

And the run records:

- `job_id`
- `run_id`
- `worker_id`
- `role`
- `authority_ref`

## Immediate Requirement Work

### 1. Add `REQ-L-GTL2-ROLE`

GTL needs a first-class semantic concept for role / capability class.

This avoids forcing all agency semantics into ABG runtime objects.

### 2. Add `REQ-L-GTL2-JOB` or `REQ-L-GTL2-ORCHESTRATION`

GTL needs a semantic concept for durable jobs.

A job should be able to carry:

- semantic name
- graph/vector/function contract reference
- required role
- possibly orchestration declarations later (trigger, schedule, KPI, window)

### 3. Replace / refine `REQ-R-ABG2-JOB-WORKER`

Current requirement is too compressed.

It should be refined into:

- `Worker` as concrete actor identity
- `Run` as execution instance
- `Binding` as worker-to-role / run-to-job realization

### 4. Make auth scope explicit

Authentication is out of scope.

The requirement stack should explicitly say:

- auth is external
- authority resolution is external
- ABG only accepts / records identity and authority references as hooks

## Cascade Plan

Once ratified, cascade in this order:

1. requirements
2. ADR / design tables
3. GTL types
4. ABG run / binding / provenance model
5. native orchestration scenarios

## Design Consequences

### GTL

Should eventually declare:

- `Job`
- `Role`
- later: orchestration semantics such as dependencies, triggers, windows, KPIs

### ABG

Should realize:

- `Worker`
- `Run`
- `Binding`
- provenance of worker / role / authority / run

### Provenance

The model should preserve:

- which job was being realized
- which run instance occurred
- which worker executed it
- under which role
- under which authority reference

## Non-Goals

This process is not:

- IAM design
- authentication design
- session / token / credential handling
- a reason to block the current V2 cleanup

It is a semantic correction and extension that should be handled deliberately after the current runtime cut is stabilized.

## Recommended Execution Rule

Do not let this model be inferred implicitly from refactor choices in `binding.py`.

If `Job / Role / Worker / Run` are going to be part of the live ontology, they need:

- explicit requirement grounding
- explicit ADR/design ownership
- explicit scenario proof

Otherwise the implementation will harden accidental law again.
