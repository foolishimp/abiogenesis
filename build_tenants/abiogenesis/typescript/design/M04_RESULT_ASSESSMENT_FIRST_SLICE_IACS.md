# M04 Result Assessment First Slice IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [M04_RESULT_ASSESSMENT_DERIVATION.md](./M04_RESULT_ASSESSMENT_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md](./M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md), [ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md](./ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md), [T-017](../../.ai-workspace/tickets/completed/T-017-realize-typescript-m04-result-assessment-ingress-over-canonical-result-ingest-law.md)

## Purpose

Declare the next TypeScript `M04-app-bootstrap` slice as an explicit
result-assessment carrier inventory so app-owned F_P assessment ingress stays
above kernel-owned ingest truth rather than reforming a second closure engine
in package helpers.

## M04 Result-Assessment First Slice Boundary

The first TypeScript result-assessment wave is:

- one admitted public result-assessment request carrier
- one closed public result-assessment outcome family
- one bounded route for `assessed{kind: fp}` over completed `ResultIngestOutcome`
  truth
- one canonical route that emits assessed runtime facts only through the
  kernel-owned emission surface

This wave does **not** include:

- `assessed{kind: fh_review}`
- proof/closure/convergence follow-on emission
- live-status projection
- install/bootstrap
- bootloader ownership
- sandbox/scenario qualification

## Upstream Authoritative Carriers Consumed By Result Assessment

This slice does not redefine kernel-owned ingest or emission truth.

The following remain authoritative upstream truth and are consumed unchanged:

- `DispatchRequest`
- `ResultArtifact`
- `ResultIngestOutcome`
- `RuntimeEvent`
- `emit(...)`

If the first slice requires an `assessed` emitted event variant, that variant
becomes part of the canonical `RuntimeEvent` family under the bounded kernel
emission surface rather than a separate `M04` persistence carrier family.

## Irreducible Architectural Carrier Set

The first TypeScript result-assessment wave is allowed exactly these prime
carrier families:

1. `PublicResultAssessmentRequest`
2. `PublicResultAssessmentOutcome`

Explicit variants of `PublicResultAssessmentOutcome` are members of that one
prime outcome family rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `PublicResultAssessmentRequest` | `M04-app-bootstrap` | authoritative public assessment ingress | package/result-assessment parser | none | result-assessment route binding, canonical ingest routing |
| `PublicResultAssessmentOutcome` | `M04-app-bootstrap` | authoritative public assessment outcome family | derived from admitted request plus canonical ingest and assessed-event emission | none | root package export, later live-status and qualification lanes |

`PublicResultAssessmentRequest` and `PublicResultAssessmentOutcome` are the
only prime outer carriers in this slice.

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `AssessmentIngressRouteBinding` | subordinate | route-owned detail binding admitted request to canonical ingest and assessed-event emission | constructed once by `M04`, not exposed as a rival public carrier |
| `AssessmentManifestProvenance` | subordinate | nested provenance detail, not an outer carrier | admitted once into `PublicResultAssessmentRequest` |
| `FulfillmentAssessmentRef` | subordinate | nested fulfillment/obligation detail | derived from admitted artifact or request payload only |
| `PublishedLedgerRef` | subordinate | nested publication detail, not a prime carrier | admitted once into `PublicResultAssessmentRequest` |
| `AssessmentTraceRef` | subordinate | public trace/provenance detail only | derived only from canonical ingest/emission result |
| `PublicResultAssessmentAccepted` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicResultAssessmentOutcome` |
| `PublicResultAssessmentRejected` | prime family variant | explicit public outcome variant, not a separate outer carrier family | pattern-matched as part of `PublicResultAssessmentOutcome` |
| `assessed{kind: fh_review}` payloads | deferred | non-F_P review family, not first-slice result-assessment truth | successor ticket only |
| proof/closure/convergence follow-on event payloads | deferred | later runtime/projection family, not first-slice assessment truth | successor ticket only |
| live-status projection payloads | deferred | later observation family | successor ticket only |
| install/bootstrap payloads | deferred | delivery/install family outside this assessment slice | successor ticket only |
| bootloader payloads | deferred | delivery/install family outside this assessment slice | successor ticket only |
| sandbox/scenario carriers | deferred | later qualification family | successor ticket only |

## M04 Result-Assessment First Slice Rules

- `PublicResultAssessmentRequest` is the only lawful public ingress carrier for
  first-slice `assessed{kind: fp}` truth.
- `PublicResultAssessmentRequest` does not accept open artifact bags or generic
  assessment payloads once admitted.
- `PublicResultAssessmentRequest` carries explicit manifest/spec/ledger/runtime
  provenance as nested subordinate truth, not as hidden helper reads.
- `PublicResultAssessmentOutcome` is a closed discriminated family. Callers
  must pattern-match the outcome family rather than probing open result
  objects.
- only canonical accepted ingest truth may produce `assessed{kind: fp}` in
  this slice.
- this slice routes through canonical ingest and canonical `emit(...)` only. It
  may not publish closure or convergence status directly.
- first-slice assessment remains bounded to `assessed{kind: fp}`. Non-F_P
  review adjudication remains deferred.

## Promotion Rule

No subordinate payload may be promoted during the first result-assessment wave
unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-017` before code lands.
