# M05 Attached F_P Local Live Sandbox First Slice IACS

**Status**: Active
**Date**: 2026-04-27
**Derived from**: [M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_DERIVATION.md](./M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_DERIVATION.md), [M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md](./M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md), [T-085](../../../../.ai-workspace/tickets/backlog/T-085-prove-attached-fp-loop-through-local-live-installed-sandbox.md)

## Purpose

Declare the installed local live sandbox proof boundary for the attached F_P
loop.

## Boundary

This slice is:

- `M05-qualification`
- an installed package proof
- a local live process proof
- downstream of T-084 engine law
- archive-producing

This slice is not:

- a new engine carrier
- a downstream product runner
- an external probabilistic model test
- data_mapper qualification evidence

## Irreducible Carrier Set

This slice introduces no new product/runtime prime carriers.

It uses these existing carriers:

- installed root observation
- package-backed runtime import
- `PublicStartOutcome`
- `RuntimeEvent`
- `EnginePluginInput`
- `FpDispatchOutcome`
- sandbox archive payload

The sandbox archive payload is a proof artifact, not runtime authority.

## Module-Derived Test Map

| Proof lane | Required assertion |
| --- | --- |
| installed package surface | script imports `@abiogenesis/typescript-tenant` from the installed target |
| attached retry | first attempt blocks and ABG emits retry/continuation/progress event truth |
| replay-fed re-entry | second attempt observes retry attempt refs and prior progress refs |
| convergence | accepted attached results close all vectors and terminal convergence is emitted |
| archive | payload, event sequence, retry evidence, and postmortem are written under `test_env/test_runs/` |

## Non-Closure Conditions

- direct source import
- caller-owned repeated public start
- manual assessed-event injection
- no retry-progress assertion
- no durable archive

