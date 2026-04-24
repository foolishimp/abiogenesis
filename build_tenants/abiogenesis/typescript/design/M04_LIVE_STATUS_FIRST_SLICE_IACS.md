# M04 Live Status First Slice IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [M04_LIVE_STATUS_DERIVATION.md](./M04_LIVE_STATUS_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [M04_FIRST_SLICE_IACS.md](./M04_FIRST_SLICE_IACS.md), [M04_CONTROL_LOOP_FIRST_SLICE_IACS.md](./M04_CONTROL_LOOP_FIRST_SLICE_IACS.md), [M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md](./M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md), [T-018](../../.ai-workspace/tickets/completed/T-018-realize-typescript-m04-live-status-projection-over-explicit-runtime-projection-law.md)

## Purpose

Declare the next TypeScript `M04-app-bootstrap` slice as an explicit
live-status carrier inventory so observation/projection stays a downstream
read-model over admitted public/runtime carriers rather than reforming a second
runtime or closure engine in app helpers.

## M04 Live-Status First Slice Boundary

The first TypeScript live-status wave is:

- one admitted public live-status request carrier
- one closed public live-status projection family
- one bounded projection over completed `M04` public carriers only
- one explicit runtime-identity projection path

This wave does **not** include:

- proof-hold projection
- archive or event-log replay
- CLI/operator install formatting
- sandbox/scenario qualification

## Upstream Authoritative Carriers Consumed By Live Status

This slice does not redefine runtime or app truth.

The following remain authoritative upstream truth and are consumed unchanged:

- `PublicStartRequest`
- `PublicStartOutcome`
- `PublicControlLoopRequest`
- `PublicControlLoopOutcome`
- `PublicResultAssessmentRequest`
- `PublicResultAssessmentOutcome`

## Irreducible Architectural Carrier Set

The first TypeScript live-status wave is allowed exactly these prime carrier
families:

1. `PublicLiveStatusRequest`
2. `PublicLiveStatusProjection`

Explicit variants of `PublicLiveStatusProjection` are members of that one prime
projection family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicLiveStatusRequest` | `M04-app-bootstrap` | authoritative public projection ingress | package/live-status parser | none | projection constructors |
| `PublicLiveStatusProjection` | `M04-app-bootstrap` | authoritative public live-status read model | derived from admitted request only | none | root package export, later install/bootstrap and qualification readers |

`PublicLiveStatusRequest` and `PublicLiveStatusProjection` are the only prime
outer carriers in this slice.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `ProjectionRuntimeIdentity` | subordinate | nested operator/runtime detail, not an outer carrier | derived from admitted upstream public outcome truth only |
| `ProjectionTraceRef` | subordinate | read-model provenance detail only | derived from admitted request only |
| `ProjectionResultAssessmentRef` | subordinate | nested observation detail, not a prime carrier | derived from admitted result-assessment carriers only |
| `ProjectionRequestBinding` | subordinate | route-owned detail binding the admitted public carriers into one projection | constructed once by `M04`, not exposed as a rival public carrier |
| `PublicLiveStatusReady` | prime family variant | explicit public projection variant, not a separate outer carrier family | pattern-matched as part of `PublicLiveStatusProjection` |
| `PublicLiveStatusAttention` | prime family variant | explicit public projection variant, not a separate outer carrier family | pattern-matched as part of `PublicLiveStatusProjection` |
| `PublicLiveStatusIdle` | prime family variant | explicit public projection variant, not a separate outer carrier family | pattern-matched as part of `PublicLiveStatusProjection` |
| proof-hold payloads | deferred | later projection family | successor ticket only |
| archive/install formatting payloads | deferred | delivery/install family | successor ticket only |
| sandbox qualification payloads | deferred | later qualification family | successor ticket only |

## M04 Live-Status First Slice Rules

- `PublicLiveStatusRequest` is the only lawful public ingress carrier for the
  first live-status slice.
- `PublicLiveStatusRequest` carries only admitted upstream public/runtime
  carriers; it does not accept open status dicts or handwritten live-state
  strings.
- `PublicLiveStatusProjection` is a closed discriminated family. Callers must
  pattern-match the projection family rather than probing open result objects.
- runtime identity projection remains explicit and is derived from admitted
  upstream public outcomes only.
- result-assessment observation is derived from admitted request/outcome truth,
  not reconstructed from raw artifact files.
- this slice is projection-only. It does not emit events, mutate runtime
  truth, or close independently of canonical upstream carriers.

## Promotion Rule

No subordinate payload may be promoted during the first live-status wave
unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-018` before code lands.
