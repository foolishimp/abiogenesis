# ADR-008: F_H Gate Routing in the Iteration Loop

**Status**: accepted
**Date**: 2026-03-15
**Covers**: REQ-F-GATE-001

## Decision

F_H evaluators are detected at `bind_fd` time by checking the event stream for an
`approved{kind: fh_review}` event matching `{edge}` — i.e., `holdsAt(operative(edge, wv), now)`.
If no such event exists (or a subsequent `revoked{kind: fh_approval}` terminates the fluent),
the evaluator is in the `failing` set. The iteration loop in `schedule.py` emits
`fh_gate_pending` and exits with code 3, surfacing the gate criteria to the skill.

The skill either waits for human input or (in `--human-proxy` mode) evaluates the
F_H criteria using the proxy protocol and emits `approved{kind: fh_review}` with
`actor: "human-proxy"`.

## Rationale

- F_H gates are not retried — they block until an `approved` event initiates the operative fluent
- Detecting F_H at bind_fd time is correct: bind_fd knows the full evaluator set;
  it checks the stream for evidence of prior approval before declaring a gap
- Gate criteria are surfaced verbatim from `Evaluator.description` — no ambiguity

## Consequences

- `schedule.py` checks `fh_failing` list from bind_fd; emits `fh_gate_pending` + exits 3
- `approved{kind: fh_review}` is the prime operator that initiates operative(edge, wv)
- `revoked{kind: fh_approval}` terminates the fluent — scoped by workflow_version
- `actor` field is mandatory: `"human"` or `"human-proxy"` — never absent
- Proxy decisions are provisional; attended review can override via `/gen-review`
