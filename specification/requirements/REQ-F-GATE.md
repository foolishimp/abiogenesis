# Human Gates (REQ-F-GATE-*)

**Traces to**: INT-001

### REQ-F-GATE-001 — F_H evaluators gate spec/design boundaries

Human approval is required at spec and design boundaries before downstream work proceeds.

**Acceptance Criteria**:
- AC-1: F_H evaluators detected at `bind_fd()` time by projecting the event stream for `approved{kind: fh_review}` events
- AC-2: If no operative approval exists, the evaluator is in the `failing` set
- AC-3: `iterate()` emits `fh_gate_pending` with evaluator criteria and exits code 3
- AC-4: F_H gate criteria surfaced verbatim from `Evaluator.description`
- AC-5: `actor` field mandatory on all `approved` events: `"human"` or `"human-proxy"` — never absent

### REQ-F-GATE-002 — F_D evaluator findings escalate to F_P; F_D+F_P must pass before F_H

The evaluator ladder is capability escalation: F_D runs first because deterministic machinery is cheapest; unresolved deterministic deficits escalate to F_P; unresolved judgment escalates to F_H. F_D failure is not a gate — it is the trigger for escalation (INT-001).

**Acceptance Criteria**:
- AC-1: On edges with unresolved F_P evaluators and no pending dispatch: F_D evaluator findings emit `found{kind: fd_findings}` and `fp_dispatched` in the same iteration. F_D findings included in F_P manifest via `fd_results`.
- AC-2: On edges with unresolved F_P evaluators and an existing pending dispatch: return `status: "pending"` without duplicate dispatch.
- AC-3: All F_D and F_P evaluators must pass before any `fh_gate_pending` event is emitted.
- AC-4: F_P certified but F_D still failing → `found{kind: fd_gap}`, exit code 4 — construction quality problem.
- AC-5: On edges without F_P evaluators: F_D failure → `found{kind: fd_gap}`, terminal.
- AC-6: Fatal engine errors (context integrity violations, malformed config, runtime failures) propagate as exceptions — not evaluator escalation. Missing upstream artifacts are ordinary unconverged state, not fatal.
