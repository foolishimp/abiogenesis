# ADR-015: Integration-Primary Test Architecture

**Status**: Accepted
**Date**: 2026-03-16
**Implements**: REQ-F-TEST-001, REQ-F-TEST-002

## Context

The abiogenesis engine is an orchestration system. Its failure modes live at seams
between components — bind_fd + gen_iterate, gen_iterate + gen_start --auto, event
emission + replay + projection, CLI contract + engine contract. Unit tests that isolate
individual functions prove parts work while the system still fails in the only way that
matters: the workflow.

Evidence: the C1 regression (gen_start auto-loop infinite-loops on mixed F_D+F_P) was
not caught by 210 unit tests. The test `test_auto_loop_stops_on_fd_gap` used a
synthetic pure-F_D package; the mixed F_D+F_P path was never exercised. The bug was
found by code reading, not by the test suite.

## Decision

**Primary test surface: command-level integration scenarios.**

Each integration test:
- Operates through the CLI (`genesis start`, `genesis gaps`, `genesis iterate`,
  `genesis emit-event`) or through the Python command functions against a real workspace
- Exercises the F_D→F_P→F_H evaluator chain end-to-end
- Uses real evaluator subprocess commands, not synthetic package fixtures
- Passes or fails on observable outcomes: exit code, event log contents, convergence
  state — not on internal state

**Secondary surface: property invariant tests.**

Property invariants that must hold across any workspace state:
- Replay determinism: `project(stream, T, I)` is identical for the same stream, always
- `gen_gaps` idempotence: running twice on a converged workspace emits no new events
- No duplicate `edge_converged` certificates: (edge, feature) pair appears exactly once
- Stale spec_hash never converges: F_P assessment from a different spec_hash does not
  satisfy `bind_fd()` for the current spec

**Minimal surface: write-primitive unit tests.**

Unit tests are retained only for the fundamental invariants of the event stream
substrate: `emit()` validation, `EventStream` append/read correctness, `project()`
determinism on a controlled stream. These are the axioms; if they break, nothing else
is diagnosable.

## Test file structure

```
builds/claude_code/tests/
├── test_integration_workflows.py   # Primary: 7 F_D→F_P→F_H lifecycle scenarios
├── test_property_invariants.py     # Secondary: 4-5 property tests
├── test_primitives.py              # Minimal: emit, project, EventStream (~15 tests)
└── [existing files trimmed]        # Unit tests retained only at primitive layer
```

## Integration scenario inventory (REQ-F-TEST-001)

| Scenario | Starting state | Chain exercised |
|---|---|---|
| Cold start → convergence | Empty stream | Full F_D→F_P→F_H(proxy) on all edges |
| Resume mid-lifecycle | Partially converged stream | Correct edge selection, no redundant dispatch |
| F_D blocks F_P (GATE-002) | Code missing, F_P pending | Auto-loop stops on fd_gap |
| Spec change invalidates F_P | Stale spec_hash in stream | F_P re-dispatched, stale assessment discarded |
| Proxy rejection halts edge | F_H criteria fail | Rejected edge not retried; others continue |
| Full convergence closes features | All edges delta=0 | active/ → completed/, full event trace |
| Replay determinism | Completed stream | project() on same stream identical twice |

## Property invariant inventory (REQ-F-TEST-002)

| Property | Test approach |
|---|---|
| Replay determinism | Append N events; project() twice; assert equal |
| gen_gaps idempotence | Run gen_gaps twice on converged workspace; assert no new edge_converged events |
| No duplicate certificates | Run gen_gaps in loop; count edge_converged per (edge, feature); assert ≤ 1 |
| Stale spec_hash rejection | Emit assessed{kind: fp} with wrong spec_hash; run gen_gaps; assert delta > 0 |

## Consequences

- Test count decreases significantly (from 223 to ~35-40)
- Test run time increases (integration tests spawn subprocesses)
- Coverage of actual failure modes increases substantially
- The C1 class of regression (seam failure not caught by unit tests) becomes detectable
- Unit tests that mirror implementation structure are removed; they add maintenance cost
  without adding diagnostic value at this abstraction level
