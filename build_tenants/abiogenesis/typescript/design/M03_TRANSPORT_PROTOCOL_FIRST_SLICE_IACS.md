# M03 Transport Protocol First Slice IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [ABG_3_FIRST_SLICE_IACS.md](./ABG_3_FIRST_SLICE_IACS.md), [M03_TRANSPORT_PROTOCOL_DERIVATION.md](./M03_TRANSPORT_PROTOCOL_DERIVATION.md), [adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md](./adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md), [adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md](./adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md)

## Purpose

Declare the first late-`M03` transport and result-artifact protocol slice as an
explicit carrier inventory so transport/result handling does not remain hidden
inside event helpers or shell conventions.

## First Slice Boundary

The late `M03` transport slice is:

- transport dispatch over closed `fp_dispatch` runtime truth
- admitted result-artifact receipt over foreign artifact payloads
- closed ingest outcome derivation before later event or app projection

This slice does **not** include:

- `M04` result-assessment or app-facing artifact review
- installed sandbox/archive publication
- PTY supervision or progress-lease orchestration as prime carriers
- runtime event projection families beyond the existing `RuntimeEvent` line

## Irreducible Architectural Carrier Set

The late `M03` transport slice is allowed exactly these prime carriers:

1. `DispatchRequest`
2. `ResultArtifact`
3. `ResultIngestOutcome`

No other top-level carrier is prime in this slice.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `DispatchRequest` | `M03-engine-kernel` | authoritative transport request | `dispatchRequestsForTransition(...)` | transport shell executes only this family | transport substrate, later `ResultArtifact` admission |
| `ResultArtifact` | `M03-engine-kernel` | authoritative admitted artifact receipt | `admitResultArtifact(...)` | none | `ResultIngestOutcome` derivation |
| `ResultIngestOutcome` | `M03-engine-kernel` | authoritative closed ingest family | `ingestResultArtifact(...)` | canonical event emission or later `M04` consumers | later runtime event emission, later `M04` result-assessment |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| transport contract | subordinate | transport policy detail, not a prime semantic boundary | admitted once into dispatch execution |
| environment sanitization policy | subordinate | nested transport policy detail | carried only inside the transport contract |
| artifact payload | subordinate | nested admitted artifact detail | admitted once into `ResultArtifact` |
| fulfillment assessment entries | subordinate | nested artifact payload detail | admitted once into `ResultArtifact` |
| identity issues | subordinate | nested ingest diagnostic detail | carried only inside `ResultIngestOutcome` |
| transport failure detail | subordinate | nested closed outcome detail | carried only inside `ResultIngestOutcome` |
| PTY supervision or progress-lease detail | deferred | runtime observability family, not first transport slice truth | later transport/progress wave only |
| local contract override | deferred | configuration extension, not first transport slice truth | later transport/config wave only |
| archive publication of result artifacts | deferred | downstream qualification/archive family | later `M05` wave only |

## Effect Boundary Rule

The transport effect edge does not erase carrier truth.

That means:

- dispatch execution accepts only `DispatchRequest` or `readonly DispatchRequest[]`
- artifact ingestion accepts only `ResultArtifact`
- foreign subprocess or shell output may appear as `unknown` only at named
  artifact admission parsers, never as the normal semantic input of transport
  or ingest kernels
- `ResultIngestOutcome` remains closed and typed; it is not an open error bag

## First Slice Rules

- `DispatchRequest` is derived only from closed runtime transition truth.
- Transport policy is explicit and subordinate; it is never ambient hidden
  runtime law.
- Result artifacts are admitted once and fail closed on malformed or
  contradictory truth.
- `ResultIngestOutcome` is the only lawful semantic result of ingest in this
  slice.
- Later `M04` result-assessment may consume ingest outcomes, but it must not
  recreate ingest truth procedurally.
