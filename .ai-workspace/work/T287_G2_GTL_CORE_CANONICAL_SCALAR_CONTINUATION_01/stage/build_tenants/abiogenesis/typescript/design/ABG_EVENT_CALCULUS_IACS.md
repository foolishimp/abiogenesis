# ABG Event Calculus IACS

**Status**: Active
**Date**: 2026-05-07
**Ticket**: T-120

## Irreducible Carrier Set

| Carrier | Owner | Role |
|---|---|---|
| `RuntimeEvent` | ABG M03 | admitted happened fact |
| `RuntimeFluent` | ABG M03 | replay-derived fact candidate |
| `RuntimeFluentPattern` | ABG M03 | clipping/derived-rule match shape |
| `RuntimeEventCalculusAxiom` | ABG M03 | event-kind to effect declaration |
| `RuntimeEventCalculusEffect` | ABG M03 | initiated, terminated, clipped, declipped fluents |
| `RuntimeEventCalculusProjection` | ABG M03 | `HoldsAt` read model |
| `RuntimeDerivedFluentRule` | ABG M03 | ramification hook over replayed fluents |

## Subordinate And Downstream Rows

`RuntimeEventCalculusEffectRow` is subordinate to
`RuntimeEventCalculusProjection`. It publishes replay evidence for audit, but it
does not become a second source of event/fluent law.

## Effect Boundary

The axiom table has no provider, runner, or product-policy effect. It only
maps admitted event truth to replay-derived fluent truth.

## Proof Surface

`test_t120_event_calculus_runtime_law.test.mjs` proves initiation, inertia,
clipping, undeclared-kind rejection, malformed fluent rejection, duplicate
axiom rejection, contradictory effect rejection, and projection parity for
vector closure.
