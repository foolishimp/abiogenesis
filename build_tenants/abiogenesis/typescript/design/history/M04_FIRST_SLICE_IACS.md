# M04 First Slice IACS

**Status**: Active
**Date**: 2026-04-23
**Derived from**: [M04_PUBLIC_START_DERIVATION.md](./M04_PUBLIC_START_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [T-012](../../.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md), [T-072](../../.ai-workspace/tickets/completed/T-072-realize-typescript-abg-start-to-iterate-engine-runner.md), [B-016](../../.ai-workspace/tickets/completed/B-016-standardize-abg-extension-hooks-under-a-consistent-ioc-contract-model.md)

## Purpose

Declare the first TypeScript `M04-app-bootstrap` slice as an explicit public
start carrier inventory so the package-first entry surface does not rediscover
public operator law by controller drift.

## M04 First Slice Boundary

The first TypeScript `M04` code wave is:

- one admitted public `gen-start` request carrier
- one closed public `gen-start` outcome family
- one explicit configured runtime or worker identity projection path
- one canonical route into completed `M03` `start -> iterate` engine carriers
  and canonical emit surfaces

This wave does **not** include:

- auto progression loops
- human-proxy approval flow
- event-ingress command surfaces
- result-assessment ingress surfaces
- live-status, proof-hold, or gap projections
- install/bootstrap or bootloader ownership
- sandbox/scenario qualification

## Upstream Authoritative Carriers Consumed By M04

`M04` builds over already-landed GTL and ABG truth.

The following carriers remain authoritative upstream inputs and are not
redefined by `M04`:

- `StartIntent`
- `ExecutionBasis`
- `AdvancementTransition`
- `RuntimeEvent`

`M04` may admit, project, and route through those carriers.
It must not recreate rival kernel carriers of its own.

## Irreducible Architectural Carrier Set

The first `M04` code wave is allowed exactly these prime carrier families:

1. `PublicStartRequest`
2. `PublicStartOutcome`

No other outer carrier family is prime in this wave.

Explicit variants of `PublicStartOutcome` are members of that one prime outcome
family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicStartRequest` | `M04-app-bootstrap` | authoritative public ingress | package/operator parser | none | `start(...)` route binding, `StartIntent` consumption, public start executor |
| `PublicStartOutcome` | `M04-app-bootstrap` | authoritative public operator outcome family | derived from admitted request plus completed `M03` engine-runner carrier/event truth | none | root package export, later auto/proxy loops, later observation/qualification lanes |

`PublicStartRequest` and `PublicStartOutcome` are the only prime `M04` outer
carriers in this first slice.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `PublicControlModes` | subordinate | nested product-policy detail carried by `PublicStartRequest` | admitted once by the public-start parser |
| `ConfiguredRuntimeSelector` | subordinate | explicit runtime/worker input detail, not an outer public carrier | admitted once by the public-start parser |
| `KernelRouteBinding` | subordinate | app-bootstrap route detail that binds `PublicStartRequest` to completed `M03` engine start admission | constructed once by `M04`, not exposed as a rival public carrier |
| `PublicStartContext` | subordinate | app-bootstrap route context shared by `start(...)` and the `publicStart(...)` subordinate adapter | carries admitted module, runtime identity, policy, and replay context but does not own traversal |
| `PublicRuntimeIdentityProjection` | subordinate | explicit projection detail inside the public outcome family | derived once from `ExecutionBasis.runtimeIdentity` |
| `PublicKernelTraceRef` | subordinate | public trace/provenance detail over kernel truth, not an outer carrier | derived once from `ExecutionBasis` / `AdvancementTransition` / `RuntimeEvent` |
| `PublicStopDetail` | subordinate | outcome-detail payload only | derived from kernel transition/event truth |
| `PublicStartAdvanced` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicStartOutcome` |
| `PublicStartBlocked` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicStartOutcome` |
| `PublicStartYielded` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicStartOutcome` |
| `PublicStartConverged` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicStartOutcome` |
| `PublicStartRejected` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicStartOutcome` |
| auto progression loop state | deferred | later `M04` wave above the first public start steel thread | successor ticket only |
| human proxy approval state | deferred | later `M04` wave above the first public start steel thread | successor ticket only |
| event-ingress command payloads | deferred | separate app ingress family | successor ticket only |
| result-assessment ingress payloads | deferred | separate app ingress family | successor ticket only |
| install/bootstrap payloads | deferred | delivery/install family outside the first public-start slice | successor ticket only |
| bootloader payloads | deferred | delivery/install family outside the first public-start slice | successor ticket only |

## M04 First Slice Rules

- `PublicStartRequest` preserves the public product grammar by carrying:
  - `startIntent: StartIntent`
  - orthogonal control modes outside `scope + target + until`
  - explicit configured runtime or worker identity input only when supplied
- `PublicStartRequest` does not recreate `scope`, `target`, or `until` as a
  rival raw authority after `StartIntent` is admitted.
- `PublicStartOutcome` is a closed discriminated family. Public operator code
  must pattern-match the outcome family rather than probing open result objects.
- `PublicStartOutcome` must preserve explicit runtime identity projection when
  runtime or worker identity is part of the active boundary.
- `PublicStartOutcome` may expose public trace or stop detail derived from
  completed `M03` truth, but it must not append or reinterpret runtime events
  directly.
- `M04` code routes public execution through `start(...)`, which calls the
  completed `M03` engine-owned runner. It must not recreate kernel law locally.
- `publicStart(...)` exists only as a subordinate adapter over
  `startFromRequest(...)`. It must not call lower M03 admission, transition,
  or emit functions directly.

## Promotion Rule

No subordinate payload may be promoted during the first `M04` code wave unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-012` before code lands.
