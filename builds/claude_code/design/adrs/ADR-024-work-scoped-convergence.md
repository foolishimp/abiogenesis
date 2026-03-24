# ADR-024: Work-Scoped Convergence and Scheduling

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-WK-004, REQ-F-WK-005
**Depends on**: ADR-023 (work_key, run_id)
**Derives from**: INT-004 (Recursive Work Identity and Compositional Graphs)

## Context

With work_key established (ADR-023), two problems remain:

1. **delta() is global.** `delta(job)` counts failing evaluators for the edge as a whole. It cannot answer "is feature X converged on this edge?" — only "is this edge converged globally." This is why adding a new feature to a converged workspace reports delta=0.

2. **The scheduler has no work enumeration.** It processes jobs in topological edge order, but each job is a single unit. There is no mechanism to generate multiple work instances for the same edge when multiple features need work.

## Decision

### Work-scoped delta

```python
def delta(job: Job, *, work_key: str | None = None) -> float:
```

When `work_key` is provided:
- F_D evaluators run scoped to the work_key's write territory (e.g., only the files belonging to that feature's module)
- F_P convergence checks filter `assessed` events by `work_key`
- F_H convergence checks filter `approved` events by `work_key`

When `work_key` is absent: global edge convergence (V1 behaviour).

### Work instance generation

The scheduler enumerates active work_keys and pairs them with jobs:

```python
def schedule(jobs: list[Job], work_keys: list[str]) -> list[WorkInstance]:
    instances = []
    for job in topological_order(jobs):
        for wk in work_keys:
            if delta(job, work_key=wk) > 0:
                instances.append(WorkInstance(job=job, work_key=wk))
    return instances
```

`WorkInstance` is a lightweight pairing:

```python
@dataclass(frozen=True)
class WorkInstance:
    job: Job
    work_key: str
    run_id: str  # generated at dispatch time
```

### Work key sources

V1 work_keys are derived from feature vectors:

```python
def active_work_keys(workspace: Path) -> list[str]:
    """Enumerate work_keys from active feature vectors."""
    keys = []
    for fv in load_active_features(workspace):
        keys.append(fv.feature_id)  # e.g., "REQ-F-AUTH"
    return keys
```

Future sources: module decomposition, explicit scope override, spawn (ADR-025).

### Topological ordering with work_key dependencies

Work instances are processed in topological edge order. Within the same edge, work_key dependency chains are respected:

- Parent work_key `INT-001/REQ-042` must converge before child `INT-001/REQ-042/module.auth` is scheduled
- Sibling work_keys on the same edge are independent and may execute concurrently (subject to territory conflict rules from REQ-F-CORE-006)

### gen-gaps per-work_key reporting

```json
{
  "converged": false,
  "total_delta": 3.0,
  "gaps": [
    {
      "edge": "design→code",
      "work_key": "REQ-F-AUTH",
      "delta": 2.0,
      "failing": ["impl_coverage", "tests_pass"]
    },
    {
      "edge": "design→code",
      "work_key": "REQ-F-LOGGING",
      "delta": 1.0,
      "failing": ["impl_coverage"]
    }
  ]
}
```

When no work_keys are active, output is V1 format (per-edge only).

### V1 degenerate case

When `active_work_keys()` returns empty (no feature vectors, or feature vectors without work_key mapping), the scheduler falls back to V1: one work instance per job, no work_key, global delta. All existing behaviour preserved.

## Implementation

### bind.py

`bind_fd()` accepts optional `work_key`. When present:
- F_D evaluator commands receive `WORK_KEY` environment variable
- Evaluators that support scoping (e.g., impl_coverage) filter by work_key
- Evaluators that are inherently global (e.g., tests_pass) run once and cache

### schedule.py

New `WorkInstance` dataclass. `schedule()` gains work_key enumeration. `iterate()` receives `work_key` and `run_id` from the `WorkInstance` and threads them through to `EventStream.append()` via ADR-023.

### commands.py

`gen_gaps()` iterates over `(job, work_key)` pairs when work_keys are active. `gen_iterate()` selects the first unconverged `WorkInstance` instead of the first unconverged `Job`.

### Evaluator scoping

Two patterns:
1. **Scopeable evaluators** (impl_coverage, validates_coverage): accept `WORK_KEY` env var, filter their scan to files tagged with REQ keys in the work_key's `satisfies` list
2. **Global evaluators** (tests_pass, check_tags): run once per edge, result shared across all work instances on that edge

Global evaluators do not block work-scoped dispatch — if tests_pass is red but it's a global concern, individual work_keys can still be dispatched for F_P construction.

## Consequences

- Adding a new feature to a converged workspace produces delta > 0 for that feature's work_key
- gen-gaps reports per-feature convergence, not just per-edge
- The auto-loop processes work instances in dependency order
- V1 behaviour is the degenerate case — no migration required
- Foundation for ADR-025 (spawn creates child work_keys)
