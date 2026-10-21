# M03 F_D Authority Placement First Slice IACS

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-138

## Irreducible Architectural Carrier Set

### `FdAuthoritySeverityClass`

Prime carrier role: closed classification for a deterministic non-acceptance.

Values:

- `protocol_invalid`
- `construction_context_invalid`
- `diagnostic_shape_invalid`
- `content_unproven`

Why prime:

Accepted/blocked alone is not enough authority placement. The runner must know
whether deterministic evidence is a protocol defect, construction context
defect, non-load-bearing diagnostic shape defect, or unresolved product content.

### `ConsumedFieldSet`

Prime carrier role: evaluator-declared field refs read by downstream routing,
execution construction, pressure projection, or closure.

First-slice representation:

- `Evaluator.consumedFieldRefs`
- `EnginePluginInput.consumedFieldRefs`
- `FdEvaluationOutcome.consumedFieldRefs`

Why prime:

The diagnostic-shape boundary is decidable only if ABG knows which fields are
actually read downstream. This cannot be operator judgment.

### `FdPressureRoutingDecision`

Prime carrier role: admitted runner action derived from severity and consumed
fields.

Values:

- `continue`
- `block`
- `preserve_pressure`
- `route_to_fp`

Why prime:

The runner, event spine, and later construction-pressure package need the same
routing identity. Hiding routing inside plugin prose would recreate drift.

### `FdAuthorityOutcome`

Prime carrier role: admitted deterministic outcome with authority placement.

First-slice representation:

- `FdEvaluationOutcome`
- `fd_authority_outcome_admitted`

Required fields:

- status
- severity class or null
- routing decision
- affected field refs
- consumed field refs
- pressure refs
- diagnostic refs
- evidence refs

Why prime:

This is the object that proves F_D is supporting construction rather than
claiming product-content closure.

### `FdAuthorityDiagnostic`

Prime carrier role: visible diagnostic refs explaining severity and routing.

First-slice representation:

- `fd_severity:<class>`
- `fd_routing:<decision>`

Why prime:

The system needs residual pressure and auditability without making display
messages or raw validator rows the semantic carrier.

## Subordinate Payloads

Subordinate payloads in this slice:

- raw validator messages
- parser stack traces
- display-only notes
- worker-facing explanation text
- unadmitted plugin-proposed routing labels

These payloads can explain an F_D outcome, but they do not decide runner
routing.

## Promotion Test

Promote a field or diagnostic to a top-level F_D authority carrier only if a
runner, routing rule, execution-construction rule, pressure projector, or
closure predicate reads it. Otherwise keep it subordinate and preserve pressure
through `diagnostic_shape_invalid`.

## Effect Edges

```text
Evaluator.consumedFieldRefs
  + FdEvaluationOutcome.severityClass
  + FdEvaluationOutcome.affectedFieldRefs
  -> FdPressureRoutingDecision
  -> fd_authority_outcome_admitted
  -> runner block | continue | preserve pressure | route to F_P
```

## First Slice Proof

The first slice is complete when:

- blocked F_D outcomes without severity fail admission;
- plugin-supplied routing cannot contradict admitted routing;
- protocol/context invalid outcomes block;
- diagnostic shape invalid outside consumed fields preserves pressure and
  continues;
- diagnostic shape invalid on consumed fields blocks;
- content unproven yields to F_P/content pressure.
