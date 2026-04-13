# T-003 Enhance ABG Repair Signal And Control Plane

- id: T-003
- title: Enhance ABG repair signal, runtime state taxonomy, and prompt/control-plane surfaces
- type: feature
- status: completed
- goal: runtime-repair-control-plane
- priority: high
- created_at: 2026-04-12
- updated_at: 2026-04-12
- dependencies: B-002

## Closure

This broad ticket is no longer the right active unit of work.

The `test28` review narrowed the immediate priorities:

- `odd_sdlc` should refactor its builder model from pure-function framing to a
  stateful iterator over the asset under construction
- `odd_sdlc` deterministic evaluators should emit richer repair-usable failure
  evidence through the surfaces ABG already carries

The remaining broader ABG / GTL questions are still real, but they have been
repriced out of the active ticket layer and captured as strategy until the
downstream work proves that current ABG surfaces are insufficient.

## Result

- the long-form platform content now lives in the strategy layer
- the immediate executable work is tracked in narrower `odd_method` tickets
- ABG should only be reopened as an active ticket if those downstream tickets
  prove a missing substrate capability rather than domain-local builder debt

## Links

- strategy: `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/codex/20260412T161241Z_STRATEGY_abg-repair-control-plane-deferred-after-sdlc-priority-cut.md`
- odd_method_ticket: `/Users/jim/src/apps/odd_method/.ai-workspace/tickets/active/T-002-refactor-odd-sdlc-from-pure-function-builder-framing-to-stateful-iterator.md`
- odd_method_ticket: `/Users/jim/src/apps/odd_method/.ai-workspace/tickets/active/B-002-emit-repair-usable-fd-evidence-from-odd-sdlc-evaluators.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md`
