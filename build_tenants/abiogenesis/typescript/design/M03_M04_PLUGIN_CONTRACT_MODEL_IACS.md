# M03/M04 Plugin Contract Model IACS

**Status**: Active
**Date**: 2026-04-26
**Derived from**: [M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md](./M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md), [M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md](./M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md), [B-016](../../.ai-workspace/tickets/backlog/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md), [T-072](../../.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md)

## Purpose

Declare the irreducible TypeScript ABG plugin carriers for the T-072 runner
slice.

The design goal is collapse: one reusable plugin contract family, not a unique
callback language per seam.

## Irreducible Architectural Carrier Set

This slice introduces three prime carrier families:

1. `EnginePluginContract`
2. `EnginePluginInput`
3. `EnginePluginOutcome`

All plugin-specific records are variants or subordinate payloads under those
families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `EnginePluginContract` | `M03-engine-kernel` | admitted plugin capability declaration | plugin-set admission | none | runner, plugin inventory, proof |
| `EnginePluginInput` | `M03-engine-kernel` | admitted per-turn call input | runner-derived from `ExecutionBasis`, projection, decision, and transition | plugin call | plugin implementation |
| `EnginePluginOutcome` | `M03-engine-kernel` | admitted plugin result family | plugin output admission | runner-owned event/projection decisions | runner, public start projection |
| `EnginePluginInventoryEntry` | `M03-engine-kernel` | proof/read-model inventory over plugin seams and classified hook families | static design/code declaration | none | tests, B-016 review |

## Plugin Seam Inventory

| Seam | Classification | Binding status | Engine-owned law | Plugin-owned implementation scope | Required proof |
| --- | --- | --- | --- | --- | --- |
| runtime event sink | `Sink` | runner-consumed | event construction and admission | append/delivery of already-admitted event | sink receives events but cannot alter event payload |
| F_D evaluator | `EffectPlugin` | runner-consumed | next vector, evaluation event, closure event | deterministic status for one vector | accepted vector closes; malicious output fails |
| F_P dispatch transport | `EffectPlugin` | runner-consumed | dispatch/yield decision and dispatch event | external worker dispatch or result reference | dispatch yields; malicious output fails |
| F_H admission | `EffectPlugin` | runner-consumed | human gate stop decision and gate event admission | escalation or denial signal | gate input is admitted; event injection fails |
| result assessment | `EffectPlugin` | classified hook family | result ingest event authority | result artifact interpretation within contract | accepted artifact stays admitted result truth |
| event ingress | `Provider` | classified hook family | external-event admission | transport of external event candidate | unadmitted event shape fails |
| continuation/retry/repair | `EffectPlugin` | classified hook family | continuation identity and retry policy | bounded recovery suggestion | retry cannot select next vector |
| policy | `Provider` | classified hook family | resolved-policy admission | source of policy bundle data | missing regime fails |
| runtime identity | `Provider` | classified hook family | runtime identity admission | source of worker/backend/build identity | selector mismatch fails |
| operator asset | `Resolver` | classified hook family | asset target admission | handle-to-asset resolution | unknown handle fails |
| context/external asset | `Resolver` | classified hook family | context binding admission | context lookup | unknown context fails |
| gaps/live-status | `ProjectionConsumer` | classified hook family | projection is replay-derived | read-only presentation | projection cannot close work |
| GTL `hook_ref` | `DeclarationRef` | classified hook family | hook refs are declarations | downstream resolver target | hook ref cannot execute directly |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `EnginePluginRef` | subordinate | identity payload inside `EnginePluginContract` | non-empty string |
| `EnginePluginAuthority` | subordinate | classification field, not independent authority | closed vocabulary |
| `EnginePluginCallContext` | subordinate | per-call context inside `EnginePluginInput` | derived by runner |
| `FdEvaluationPayload` | outcome variant payload | deterministic result detail only | no event or vector authority fields |
| `FpDispatchPayload` | outcome variant payload | dispatch/yield detail only | no event or closure authority fields |
| `FhAdmissionPayload` | outcome variant payload | human gate detail only | no event or vector authority fields |
| `PluginForbiddenAuthorityFields` | subordinate proof list | negative-test guardrail | rejected during outcome admission |

## Collapse Decisions

- F_D, F_P, F_H, result ingest, event ingress, and continuation use one
  `EnginePluginOutcome` family with variants.
- policy and runtime identity use the same provider classification.
- asset and context use the same resolver classification.
- gaps/live-status are projection consumers, not engine plugins.
- `hook_ref` is a declaration reference, not a callback.
- inventory rows distinguish runner-consumed seams from classified-only hook
  families; classified-only rows do not claim runtime migration closure.

## Module-Derived Unit Test Map

| Proof lane | Design source | Required assertion |
| --- | --- | --- |
| plugin inventory completeness | this IACS | every seam has classification, authority, positive proof, negative proof |
| runtime binding status | this IACS | runner-consumed rows are limited to event sink, F_D, F_P, and F_H for this slice |
| F_D plugin substitution | F_D inventory row | accepted outcome closes through runner-owned events |
| F_P plugin yield | F_P inventory row | dispatch yields without caller-owned loop |
| F_H plugin gate | F_H inventory row | gate stops without plugin event authority |
| forbidden authority rejection | subordinate payload register | output with `runtimeEvents` or `nextVectorIndex` fails |
| global collapse | collapse decisions | repeated shapes map to common contract families |

## Non-Closure Conditions

- any plugin seam is only a raw callback
- a plugin can emit runtime events directly
- a plugin can choose the next vector
- a plugin can close a vector or graph call by returning open payload fields
- a third repeated contract shape is rebuilt locally instead of commonized
