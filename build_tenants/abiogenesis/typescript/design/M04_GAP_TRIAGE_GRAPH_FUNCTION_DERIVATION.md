# M04 Gap Triage Graph-Function Boundary Derivation

**Status**: Active
**Date**: 2026-04-26
**Purpose**: Define the boundary between ABG gap observation and downstream
ODD graph-function triage work.

## Source Material

- `specification/requirements/product/REQ-P-POLICY.md`
- `specification/scenarios/09-research-product-lab-scenario-catalog.md`
- `M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md`
- `M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `odd_sdlc.python` source material: `triage.py`, `gap_dossier.py`,
  `homeostatic_loop.py`, and `work_item_routing.py`

Python SDLC is comparison material here. It demonstrates needed functionality:
gap dossiering, current-edge triage artifacts, route contracts, and loopback
closure evidence. It is not copied as TypeScript product law.

## Boundary Claim

ABG owns replay-derived observation.

Downstream ODD products own triage meaning.

The lawful shape is:

`ABG Gap Projection -> GTL GraphFunction(Triage) -> Product Work Decision`

The product work decision may be:

- create ticket
- update ticket
- create action
- defer
- reprice requirement, design, or product scope
- no-op because the gap is already resolved by replay truth

Ticket mechanics remain owned by the downstream product and
`TICKET_METHOD.md`.

## ABG Owns

- event truth
- replay projection
- current edge and current vector observation
- stop, hold, continuation, unresolved observation, and gap truth when those
  facts are ratified substrate facts
- read-only public gap projection
- enough structure for downstream graph functions to bind triage inputs

## Downstream Product Owns

- domain meaning of a gap
- whether the gap is a ticket, action, deferment, or repricing signal
- ticket title, priority, state, closure, and recurrence extraction
- product-local vocabulary such as proof hold or release blocker labels
- acceptance of triage output

## Graph-Function Carrier

A downstream triage program should publish a graph function equivalent to:

`GF_TRIAGE_GAP(RuntimeGapProjection, ProductPolicy, WorkInventory) -> TriageDecision`

The graph function may call other graph functions for:

- classify gap
- route to requirement/design/code/test/release boundary
- create ticket draft
- evaluate whether existing work already covers the gap
- produce repricing recommendation

None of those functions may mutate ABG runtime truth.

## Non-Ownership

ABG shall not:

- create tickets as substrate law
- decide ticket priority or closure
- encode downstream abbreviations as runtime taxonomy
- hide triage behavior inside `gaps` command code
- replace `TICKET_METHOD.md` with design-local ticket mechanics

## Proof Consequence

The existing `gen-gaps` tests prove read-only ABG observation. A future
downstream SDLC.TS proof should prove `GF_TRIAGE_GAP` as a graph-function
program over a real gap projection and a work inventory.
