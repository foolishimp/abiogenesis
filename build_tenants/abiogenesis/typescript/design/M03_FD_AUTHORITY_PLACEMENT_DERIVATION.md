# M03 F_D Authority Placement Derivation

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-138
**Purpose**: Define how deterministic evaluator outcomes support construction
without taking ownership of ambiguous product-content closure.

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/gtl/REQ-L-GTL3-EVALUATOR.md`
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`
- `specification/requirements/abg/REQ-R-ABG3-ASSURANCE.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `build_tenants/abiogenesis/typescript/design/M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md`
- [T-138](../../../../.ai-workspace/tickets/completed/T-138-classify-fd-outcomes-by-authority-placement-and-pressure-routing.md)

## Problem

An `F_D` outcome shaped only as accepted or blocked cannot distinguish a broken
runtime protocol from a non-load-bearing diagnostic shape issue or unresolved
product meaning. That makes deterministic checks either over-block construction
or silently clear content pressure.

The placement rule is:

```text
F_D narrows, admits, preserves, routes, and diagnoses.
F_D does not close ambiguous product content.
```

## Decision

F_D blocked outcomes carry a closed severity class:

- `protocol_invalid`
- `construction_context_invalid`
- `diagnostic_shape_invalid`
- `content_unproven`

ABG derives routing from severity plus evaluator-declared consumed-field refs:

| Severity | Routing |
| --- | --- |
| `protocol_invalid` | block |
| `construction_context_invalid` | block |
| `diagnostic_shape_invalid` with affected consumed field | block |
| `diagnostic_shape_invalid` outside consumed fields | preserve pressure and continue |
| `content_unproven` | route to F_P/content pressure |

The consumed-field set is admitted GTL evaluator truth through
`Evaluator.consumedFieldRefs`. Operator judgment and prompt convention are not
authority sources for deciding whether a malformed field blocks.

## Contract

`FdEvaluationOutcome` is now an admitted authority-placement carrier:

```ts
interface FdEvaluationOutcome {
  kind: "fd_evaluation";
  status: "accepted" | "blocked";
  severityClass: FdAuthoritySeverityClass | null;
  routingDecision: FdPressureRoutingDecision;
  affectedFieldRefs: readonly string[];
  consumedFieldRefs: readonly string[];
  pressureRefs: readonly string[];
  diagnosticRefs: readonly string[];
  evidenceRefs: readonly string[];
  reason: string | null;
}
```

`fd_authority_outcome_admitted` records the admitted routing decision into the
runtime event spine so replay can inspect the same authority placement the
runner used.

## Runner Semantics

- `continue`: close the F_D vector normally.
- `block`: emit `terminal_reached(gap_stop)`.
- `preserve_pressure`: emit admitted F_D authority pressure, treat the vector as
  pass-through for traversal, and continue.
- `route_to_fp`: emit `terminal_reached(yielded)` so the construction substrate
  can re-enter through F_P/content pressure rather than deterministic closure.

## Implementation Map

- `gtl/m01/contracts/carriers.ts` adds `Evaluator.consumedFieldRefs`.
- `gtl/m01/admission/carriers.ts` admits consumed-field refs.
- `abg/m03/contracts/plugins.ts` derives F_D routing and admits outcome
  authority placement.
- `abg/m03/contracts/carriers.ts` declares F_D severity, routing, and runtime
  event truth.
- `abg/m03/contracts/event_factories.ts` constructs
  `fd_authority_outcome_admitted` events.
- `abg/m03/runner/engine_runner.ts` consumes routing in sync and async runner
  paths.
- `test_env/tests/test_t138_fd_authority_placement.test.mjs` proves all four
  severity classes and routing behaviors.

## Non-Goals

This ticket does not define product-specific content semantics. It only places
F_D outcomes at the ABG boundary so T-128/T-139 can route construction pressure
without treating deterministic shape checks as content closure.
