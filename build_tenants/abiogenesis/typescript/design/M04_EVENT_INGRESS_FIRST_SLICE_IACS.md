# M04 Event Ingress First Slice IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [M04_EVENT_INGRESS_DERIVATION.md](./M04_EVENT_INGRESS_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md](./ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md), [T-016](../../.ai-workspace/tickets/active/T-016-realize-typescript-m04-event-ingress-over-the-canonical-kernel-emission-surface.md)

## Purpose

Declare the next TypeScript `M04-app-bootstrap` slice as an explicit
event-ingress carrier inventory so app-owned review or correction commands stay
above kernel-owned emission truth rather than reforming a rival append path in
package helpers.

## M04 Event-Ingress First Slice Boundary

The first TypeScript event-ingress wave is:

- one admitted public event-ingress request carrier
- one closed public event-ingress outcome family
- one bounded route for `approved`, `revoked`, and `reset` commands
- one canonical route that emits only through the kernel-owned emission surface

This wave does **not** include:

- `assessed`
- result-artifact ingestion
- fulfillment-ledger publication
- live-status projection
- install/bootstrap
- bootloader ownership
- sandbox/scenario qualification

## Upstream Authoritative Carriers Consumed By Event Ingress

This slice does not redefine kernel-owned emission truth.

The following remain authoritative upstream truth and are consumed unchanged:

- `RuntimeEvent`
- `emit(...)`

If the first slice requires additional emitted event variants for
`approved`, `revoked`, or `reset`, those variants become part of the canonical
`RuntimeEvent` family under the bounded `M03` emission surface rather than a
separate `M04` persistence carrier family.

## Irreducible Architectural Carrier Set

The first TypeScript event-ingress wave is allowed exactly these prime carrier
families:

1. `PublicEventIngressRequest`
2. `PublicEventIngressOutcome`

Explicit variants of `PublicEventIngressOutcome` are members of that one prime
outcome family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicEventIngressRequest` | `M04-app-bootstrap` | authoritative public event command ingress | package/event-ingress parser | none | event-ingress route binding, canonical emit routing |
| `PublicEventIngressOutcome` | `M04-app-bootstrap` | authoritative public event-ingress outcome family | derived from admitted request plus canonical emit result | none | root package export, later control-loop/public-start consumers, later qualification lanes |

`PublicEventIngressRequest` and `PublicEventIngressOutcome` are the only prime
outer carriers in this slice.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `EventIngressRouteBinding` | subordinate | route-owned detail binding the admitted request to canonical `emit(...)` | constructed once by `M04`, not exposed as a rival public carrier |
| `ApprovedCommandPayload` | subordinate | nested command payload detail, not an outer carrier | admitted once into `PublicEventIngressRequest` |
| `RevokedCommandPayload` | subordinate | nested command payload detail, not an outer carrier | admitted once into `PublicEventIngressRequest` |
| `ResetCommandPayload` | subordinate | nested command payload detail, not an outer carrier | admitted once into `PublicEventIngressRequest` |
| `EventIngressTraceRef` | subordinate | public trace/provenance detail only | derived only from canonical emission result |
| `ResetFollowupRef` | subordinate | downstream correction follow-up detail, not an outer carrier | derived only after canonical reset emission |
| `PublicEventIngressAccepted` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicEventIngressOutcome` |
| `PublicEventIngressRejected` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicEventIngressOutcome` |
| `assessed` command payloads | deferred | result-assessment family, not first-slice event-ingress truth | successor ticket only |
| result-artifact payloads | deferred | app-owned result/artifact intake, not first-slice event-ingress truth | successor ticket only |
| live-status projection payloads | deferred | later observation family, not part of the first event-ingress slice | successor ticket only |
| install/bootstrap payloads | deferred | delivery/install family outside this event-ingress slice | successor ticket only |
| bootloader payloads | deferred | delivery/install family outside this event-ingress slice | successor ticket only |
| sandbox/scenario carriers | deferred | later qualification family | successor ticket only |

## M04 Event-Ingress First Slice Rules

- `PublicEventIngressRequest` is the only lawful public ingress carrier for
  first-slice `approved`, `revoked`, and `reset` commands.
- `PublicEventIngressRequest` does not accept open event bags or generic
  `event_type + data` object truth once admitted.
- `PublicEventIngressRequest` may carry explicit workflow, run, or work-key
  provenance when that truth is available at ingress, but provenance remains
  nested and subordinate.
- `PublicEventIngressOutcome` is a closed discriminated family. Callers must
  pattern-match the outcome family rather than probing open result objects.
- `PublicEventIngressOutcome` may expose trace or follow-up detail derived from
  canonical emission truth, but it must not reinterpret raw event-stream
  storage directly.
- this slice routes to canonical `emit(...)` only. It may not append directly
  to any event log, archive, or projection file.
- `approved`, `revoked`, and `reset` remain explicit first-slice command
  variants. `assessed` remains deferred to `T-017`.
- if reset follow-up behavior is realized in this slice, it must remain below
  canonical reset emission and must not create a rival app-owned append path.

## Promotion Rule

No subordinate payload may be promoted during the first event-ingress wave
unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-016` before code lands.
