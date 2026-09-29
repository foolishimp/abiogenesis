# ABG Event Calculus Runtime Law Derivation

**Status**: Active
**Date**: 2026-05-06
**Tickets**: T-120, T-119

## Claim

ABG runtime truth is declared as Event Calculus law over admitted events.
Projection read models consume that law; they do not own separate semantic
transition authority.

## Boundary

- `Happens(e)` is an admitted `RuntimeEvent`.
- `Initiates`, `Terminates`, clipping, and declipping are declared in the M03
  Event Calculus axiom table.
- `HoldsAt(f)` is derived by replay.
- Projection modules may sort, summarize, and expose read models over derived
  fluents.
- Product policy and provider state do not create runtime truth unless ABG
  admits an event.

## First Slice

The first declared event set covers basis, graph call, frame, vector plan,
vector evaluation, vector closure, retry repair, continuation repair, reset,
and the temporal timer/scheduled-continuation extension needed by T-119.

The aggregate projection now checks vector closure through the declared EC
effect for `vector_closed` before applying its existing ordering law.

## Non-Authority

The EC layer is not a controller. It derives fluent truth from event truth.
ABG iteration still decides traversal advancement and closure through the
existing runtime decision path.
