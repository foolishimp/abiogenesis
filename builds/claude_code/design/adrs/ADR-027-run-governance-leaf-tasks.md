# ADR-027: V2 Run Governance and Leaf Tasks

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-RUN-001, REQ-F-RUN-002, REQ-F-RUN-003, REQ-F-RUN-004, REQ-F-LEAF-001, REQ-F-LEAF-002, REQ-F-LEAF-003, REQ-F-LEAF-004
**Depends on**: ADR-023 (work identity), ADR-024 (work-scoped convergence)
**Derives from**: INT-005 (V2 Kernel Evolution: Run Governance and Leaf Tasks)

## Context

The V1 engine treats F_P dispatch as fire-and-forget with two states: dispatched and assessed. There is no lifecycle model, no failure classification, no retry semantics, and no pending deduplication beyond a basic fluent check.

This means:
1. Transport failures (actor crash, timeout) are indistinguishable from bad output (actor produced invalid code)
2. Duplicate dispatch on the same edge happens when the auto-loop re-enters before the prior dispatch completes
3. No bounded retry — every failure requires manual re-dispatch
4. No sub-work primitive — complex iterate() calls either over-dispatch (full F_P for trivial work) or under-govern (inline code with no provenance)

## Decision

### Run lifecycle (REQ-F-RUN-001)

Each run `(work_key, run_id)` has an explicit state machine:

```
queued → started → dispatched → pending → assessed → converged
                                       ↘ failed
                                       ↘ timed_out
                                       ↘ superseded
```

State transitions are recorded in the event stream. `run_id` is generated at creation time and immutable — each WorkInstance represents exactly one attempt. Multiple runs on the same work_key are distinguishable by run_id and ordered by `event_time` (not by run_id — run_id is an identity, not an ordering criterion).

### Failure classification (REQ-F-RUN-002)

Transport failures, output failures, and certification failures are distinguished:

| Classification | Meaning | Retry eligible |
|---------------|---------|----------------|
| `transport_failure` | Actor unreachable, timeout, crash | Yes — automatic |
| `no_output` | Actor returned empty/invalid response | Yes — with different parameters |
| `bad_output` | Structurally invalid assessment | No — requires diagnosis |
| `certification_failure` | Output exists but F_D evaluators still fail | No — construction quality problem |

Failure classification is recorded in the event stream for observability and retry decisions. `certification_failure` is explicitly NOT a transport problem — the F_P actor already produced output, the deterministic checks still fail. This is surfaced as exit code 4 (fd_gap), not re-dispatched.

### Waiter deduplication (REQ-F-RUN-003)

At most one run for a given `(work_key, edge)` is in `dispatched` or `pending` state at any time. Arrival of a new convergence request while a run is pending returns the pending run_id — no duplicate dispatch.

Pending state has a maximum duration (timeout) — after which the run transitions to `timed_out` and a new run may be created.

**Supersession**: A `superseded` run is one whose work_key has been re-dispatched before the original run completed. If the original run's result arrives after supersession, it is recorded in the event stream (append-only) but not applied to convergence state. The superseded run's events carry a `superseded_by: run_id` field so replay can distinguish "recorded but not applied" from "applied."

### Retry with bounded backoff (REQ-F-RUN-004)

Transport failures trigger automatic retry up to a configurable maximum (default: 3). Each retry creates a new run_id on the same work_key — attempt history is preserved. Retry backoff is bounded (exponential with max). After max retries, the work transitions to `failed` with a summary of all attempt outcomes. Retry behavior is transparent in the event stream — each retry is visible as a distinct run.

### Bounded leaf tasks (REQ-F-LEAF-001, 002, 003)

Leaf tasks are bounded, schema-driven sub-work units that execute within iterate() without bypassing graph traversal:

```python
@dataclass(frozen=True)
class LeafTask:
    name: str
    input_schema: dict       # JSON schema for input
    output_schema: dict      # JSON schema for output
    timeout_ms: int          # explicit timeout
    tools_allowed: bool = False  # toolless by default
```

**Schema-driven**: Input validated before dispatch, output validated after return. **Bounded**: explicit timeout, no unbounded execution. **Toolless by default**: receives context and produces structured output without filesystem/network/subprocess access unless explicitly granted. **Atomic**: either produces valid output or fails.

Leaf tasks integrate with run governance:
- Each execution gets a `run_id`
- State transitions recorded in the event stream
- Failures classified using the same taxonomy
- Retryable under the same rules as REQ-F-RUN-004

Leaf tasks are subordinate to graph traversal:
- Dispatched WITHIN iterate(), not as separate graph edges
- Output contributes to the parent edge's convergence
- Number of leaf tasks per iterate() is bounded
- **Degenerate case:** engines without leaf task support use direct F_P dispatch

## Implementation

### Run state machine (schedule.py)

```python
@dataclass(frozen=True)
class RunState:
    work_key: str
    run_id: str
    edge: str
    state: str  # queued|started|dispatched|pending|assessed|converged|failed|timed_out|superseded
    failure_class: str | None = None  # transport_failure|no_output|bad_output|certification_failure
    attempt_number: int = 1
    superseded_by: str | None = None
```

State derived entirely from events — no mutable state. `run_state(stream, work_key, run_id)` replays events to derive current state.

### Pending check (commands.py)

Before dispatching F_P:
```python
pending = find_pending_run(stream, work_key, edge)
if pending:
    return {"status": "pending", "run_id": pending.run_id}
```

### Retry logic (commands.py)

On transport_failure:
```python
if attempt_number < max_retries:
    new_run_id = str(uuid.uuid4())
    emit("run_started", {"work_key": wk, "run_id": new_run_id, "attempt": attempt_number + 1})
    # re-dispatch with backoff
```

### Leaf task sub-dispatch (REQ-F-LEAF-004)

Leaf tasks use a parent/sub-run identity model. They inherit `work_key` from the parent — they are sub-work, not independent work.

```python
def dispatch_leaf(task: LeafTask, input_data: dict, parent_run_id: str) -> dict:
    """Synchronous sub-dispatch within iterate(). Caller blocks until done."""
    sub_run_id = f"{parent_run_id}/leaf/{task.name}"
    validate(input_data, task.input_schema)
    emit("leaf_task_started", {"task": task.name, "run_id": sub_run_id})
    try:
        result = execute_with_timeout(task, input_data, task.timeout_ms)
        validate(result, task.output_schema)
        emit("leaf_task_completed", {"task": task.name, "run_id": sub_run_id})
        return result
    except LeafTaskError as e:
        emit("leaf_task_failed", {
            "task": task.name, "run_id": sub_run_id,
            "failure_class": classify_failure(e),  # transport_failure | no_output | bad_output
        })
        raise  # parent decides: retry, fail iteration, or continue without
```

The parent iterate() call integrates the result into its own working surface — leaf output does not bypass the parent edge's convergence model.

## Consequences

- Every F_P dispatch attempt has a classifiable outcome
- Transport failures retry automatically — no manual re-dispatch for transient errors
- Duplicate dispatch is prevented by pending deduplication
- Pending runs time out after configurable duration
- Leaf tasks provide disciplined sub-work without bypassing graph traversal
- All lifecycle transitions visible in the event stream — full reconstructability
- Foundation for distributed saga coordination (future)
- **Degenerate case:** without run governance, F_P dispatch uses the existing two-state model (dispatched → assessed)
