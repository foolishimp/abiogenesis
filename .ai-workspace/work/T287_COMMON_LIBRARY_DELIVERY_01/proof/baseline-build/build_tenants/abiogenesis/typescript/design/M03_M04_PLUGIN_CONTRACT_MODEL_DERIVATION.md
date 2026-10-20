# M03/M04 Plugin Contract Model Derivation

**Status**: Active
**Date**: 2026-04-26
**Derived from**: [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md](./M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md), [M04_PUBLIC_START_DERIVATION.md](./M04_PUBLIC_START_DERIVATION.md), [M04_CONTROL_LOOP_DERIVATION.md](./M04_CONTROL_LOOP_DERIVATION.md), [B-016](../../.ai-workspace/tickets/completed/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md), [T-072](../../.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md)

## Purpose

Define the TypeScript ABG plugin contract model required by the engine-owned
`start -> iterate` runner.

This boundary exists so the runner can consume domain behavior, transport,
identity, policy, asset, context, continuation, event, and projection extensions
without moving framework authority outside ABG.

## Boundary

The plugin contract model belongs to the TypeScript ABG runtime boundary:

- `M03-engine-kernel` owns traversal, iteration, closure, continuation, event
  admission, and replay-derived next work.
- `M04-app-bootstrap` may expose public start, projection, CLI, and adapter
  bindings.
- plugins provide effect-edge implementation, provider data, resolver data, or
  downstream projection consumption.

Plugins do not own:

- next-vector selection
- iteration loops
- traversal closure
- graph-function identity
- runtime event authority
- public stop taxonomy

## Design Problem

The current TypeScript line has several extension-like seams:

- runtime event sink
- deterministic evaluator behavior
- probabilistic dispatch transport
- human admission behavior
- result assessment
- event ingress
- retry, repair, and continuation behavior
- policy and runtime identity binding
- operator-asset and context resolution
- public gaps and live-status projections
- GTL `hook_ref` declarations

Without one plugin model, each seam can grow its own callback shape, result
payload, parser re-entry path, or local authority rule. That is boundary
inflation and it recreates framework authority outside the engine.

## Target Shape

Runner-consumed plugins collapse into one contract family:

```text
PluginRef
  -> PluginContract
  -> admitted PluginInput
  -> plugin implementation
  -> admitted PluginOutcome
  -> ABG-owned event/projection/continuation law
```

The plugin implementation may produce only the outcome carrier authorized for
that seam. ABG admits that outcome and then decides whether to emit, close,
yield, retry, continue, or stop.

The inventory classifies every current TypeScript hook family into an explicit
binding lane. No current row may remain a generic classified-only placeholder.

Binding lanes:

- `runner_consumed`: consumed by the M03 engine runner.
- `public_runtime_consumed`: consumed by an M04 public runtime surface while ABG
  retains runtime law.
- `engine_law_consumed`: implemented as ABG-owned law rather than downstream
  plugin authority.
- `read_model_consumed`: consumed only as replay-derived projection truth.
- `declarative_contract`: admitted declaration only; no executable plugin
  authority exists in the current TypeScript surface.

## Local Collapse

The implementation must collapse local drift:

- raw callback input collapses into admitted plugin input carriers
- plugin output collapses into one closed outcome family
- repeated parser or loader re-entry collapses into direct carrier consumption
- event append attempts collapse into `RuntimeEventSink` consumption through ABG
  emission only
- vector movement, closure, retry, and continuation authority stays in the
  runner, not plugin result payloads

## Global Collapse

The implementation must compare all runner-consumed seams and wider classified
hook families, then reuse one contract family when authority is the same.

Allowed global variants:

- sink
- effect plugin
- provider
- resolver
- projection consumer
- declaration reference

A seam may avoid the common family only when it has distinct authority,
visibility, or effect-edge law. That reason must be recorded in the plugin
inventory.

## Proof Rule

Every executable plugin seam requires:

- positive substitution proof
- negative authority proof
- module-derived trace to this design, the plugin IACS, and the structural
  carrier diagram

No proof may count if the plugin selects the next vector, emits unadmitted
runtime truth, closes a traversal, or runs an iteration loop.

Read-model and declarative-contract rows require proof that they cannot execute
hidden runtime authority. Future executable context or declaration resolution
must open a boundary ticket before it can move into a runtime-consumed lane.
