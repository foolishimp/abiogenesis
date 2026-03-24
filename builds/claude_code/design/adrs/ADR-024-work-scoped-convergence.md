# ADR-024: Work-Scoped Convergence and Scheduling

**Status**: Accepted
**Date**: 2026-03-24
**Implements**: REQ-F-WK-004, REQ-F-WK-005, REQ-F-TRAV-002, REQ-F-TRAV-003, REQ-F-CMD-001, REQ-F-CMD-004
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

### Single convergence law

`schedule.delta()` is the single convergence function — all command paths (`gen_gaps`, `gen_iterate`, `_derive_state`) use it for delta computation (REQ-F-TRAV-002). `bind_fd()` provides evaluator-level pass/fail detail but does not independently compute convergence.

```python
def delta(job: Job, stream: EventStream, workspace_root: Path,
          spec_hash: str, workflow_version: str, carry_forward: list,
          *, work_key: str | None = None) -> float:
```

`delta()` includes fold-back: when a work_key has spawned children (discovered from `work_spawned` events in the stream), convergence delegates to descendants transparently (REQ-F-TRAV-002 AC-2).

### Work instance generation

All command paths construct `WorkInstance` objects from the (jobs × work_keys) product before any convergence computation (REQ-F-TRAV-001 AC-1):

```python
instances = [
    WorkInstance(job=job, work_key=wk)
    for job in topological_order(jobs)
    for wk in work_keys
]
```

Convergence selection iterates over `WorkInstance` objects, not raw `(job, work_key)` tuples (REQ-F-TRAV-001 AC-2).

`WorkInstance` is a lightweight pairing:

```python
@dataclass(frozen=True)
class WorkInstance:
    job: Job
    work_key: str
    run_id: str | None = None  # generated at dispatch time
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

**Degenerate case:** when no work_keys are active, output is per-edge only.

### Degenerate case

When `active_work_keys()` returns empty, one WorkInstance per job with `work_key=None` is created. Global delta via `schedule.delta()`. All existing behaviour preserved.

## Implementation

### bind.py

`bind_fd()` accepts optional `work_key`. When present:
- F_D evaluator commands receive `WORK_KEY` environment variable
- Evaluators that support scoping (e.g., impl_coverage) filter by work_key
- Evaluators that are inherently global (e.g., tests_pass) run once and cache

### schedule.py

`WorkInstance` dataclass. `schedule.delta()` is the single convergence function. `iterate()` receives `work_key` and `run_id` from the `WorkInstance` and threads them through to `EventStream.append()` via ADR-023.

### commands.py

All command paths (`gen_gaps`, `gen_iterate`, `_derive_state`) construct `WorkInstance` objects and compute convergence via `schedule.delta()` (REQ-F-TRAV-001, REQ-F-TRAV-002). `bind_fd()` provides evaluator detail for gap reports and F_P manifests but does not independently determine convergence.

### Evaluator scoping

Two patterns:
1. **Scopeable evaluators** (impl_coverage, validates_coverage): accept `WORK_KEY` env var, filter their scan to files tagged with REQ keys in the work_key's `satisfies` list
2. **Global evaluators** (tests_pass, check_tags): run once per edge, result shared across all work instances on that edge

Global evaluators do not block work-scoped dispatch — if tests_pass is red but it's a global concern, individual work_keys can still be dispatched for F_P construction.

## Consequences

- Adding a new feature to a converged workspace produces delta > 0 for that feature's work_key
- gen-gaps reports per-feature convergence, not just per-edge
- The auto-loop processes work instances in dependency order
- **Degenerate case:** work_key absent preserves global traversal — no migration required
- Foundation for ADR-025 (spawn creates child work_keys), ADR-026 (correction law)
