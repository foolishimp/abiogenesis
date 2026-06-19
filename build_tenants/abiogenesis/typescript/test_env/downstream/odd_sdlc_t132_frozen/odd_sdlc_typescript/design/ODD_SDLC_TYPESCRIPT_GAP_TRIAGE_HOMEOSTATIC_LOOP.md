# ODD SDLC TypeScript Gap Triage Homeostatic Loop

## Scope

This design closes T-036 for the TypeScript tenant.

Python triage, homeostatic-loop, and work-item-routing modules are discovery
evidence. Their monolithic shape is not copied. T-018 is adopted as a TypeScript
design lesson: observation, classification, route binding, repricing proposal,
ticket routing, and loopback retirement remain separate seams.

## Carrier Chain

```text
ABG gap projection + SDLC gap dossier + requirement closure register
  -> gap observation
  -> triage classification
  -> route binding
  -> optional constitutional repricing proposal
  -> optional TICKET_METHOD work-item route
  -> loopback retirement or continued pressure
```

## Ownership

- ABG owns runtime event truth, replay, gap projection, continuation, and
  traversal selection.
- SDLC owns product-domain observation, classification, route proposals,
  constitutional proposal surfaces, and ticket-route proposals.
- TICKET_METHOD owns ticket lifecycle mechanics.

No triage carrier applies constitutional change, closes tickets, emits runtime
events, or selects an internal ABG vector.

## Published Graph Functions

The TypeScript GTL catalog publishes triage functions for:

- `observe_gap_pressure`
- `classify_gap_triage`
- `bind_gap_route`
- `propose_constitutional_repricing`
- `route_ticket_work_item`
- `retire_gap_after_loopback`

