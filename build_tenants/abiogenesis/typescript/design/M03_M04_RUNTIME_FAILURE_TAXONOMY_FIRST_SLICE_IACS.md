# M03/M04 Runtime Failure Taxonomy First Slice IACS

**Status**: Active
**Date**: 2026-04-25
**Derived from**: [M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md](./M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md), [M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md](./M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md), [M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md](./M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md), [M04_LIVE_STATUS_FIRST_SLICE_IACS.md](./M04_LIVE_STATUS_FIRST_SLICE_IACS.md)

## Purpose

Declare the carrier inventory for the TypeScript runtime failure taxonomy
before code changes widen `M03` transport/result ingest and `M04`
result-assessment/live-status projection.

## Boundary

This slice is:

- canonical `M03` runtime failure classification
- public `M04` consumption of that classification
- a hard break from legacy `transport_failure | no_output | contract_failure`
- a prerequisite for the `B-030-TS` stop taxonomy

This slice is not:

- retry/repair implementation
- graph-function iteration implementation
- installed archive or live-run supervision
- domain-specific policy naming
- downstream wrapper abbreviation authority

## Upstream Authoritative Carriers Consumed

This slice consumes:

- `DispatchRequest`
- `ResultArtifact`
- `ResultIngestOutcome`
- `PublicResultAssessmentRequest`
- `PublicResultAssessmentOutcome`
- `PublicLiveStatusRequest`
- `PublicLiveStatusProjection`

## Irreducible Architectural Carrier Set

This slice introduces one canonical prime taxonomy:

1. `RuntimeFailureClass`

It replaces the old `TransportFailureClass` family. `ResultArtifact`,
`ResultIngestOutcome`, public result assessment, and live status carry that
single class rather than deriving separate local labels.

## RuntimeFailureClass Register

| Class | Owner | Meaning | Not this |
| --- | --- | --- | --- |
| `runtime_unavailable` | `M03` | runtime, worker, backend, command, package, or dispatch substrate cannot be resolved or invoked | worker produced a bad result |
| `capability_missing` | `M03` | runtime exists but lacks a declared graph/task/tool/model/role capability | runtime crashed while trying |
| `runtime_failure` | `M03` | runtime accepted dispatch but failed during execution | payload is malformed or absent |
| `payload_contract_failure` | `M03` | result payload is absent, malformed, incomplete, or schema-invalid | admitted payload contradicts declared identity |

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Downstream consumers |
| --- | --- | --- | --- | --- |
| `RuntimeFailureClass` | `M03-engine-kernel` | canonical failure class | result-artifact admission | result assessment, live status, stop taxonomy |
| `ResultArtifact.runtimeFailure` | `M03-engine-kernel` | failure payload under one result artifact | `admitResultArtifact` | `ingestResultArtifact` |
| `ResultIngestOutcome{kind: runtime_failure}` | `M03-engine-kernel` | closed ingest outcome for runtime/payload failure | `ingestResultArtifact` | `M04 result_assessment` |
| `PublicResultAssessmentRejected.failureClass` | `M04-app-bootstrap` | public carry-through of M03 class | result-assessment route | live status, operator projection |
| `ProjectionResultAssessmentRef.failureClass` | `M04-app-bootstrap` | read-model exposure of M03 class | live-status projection | public status readers |

## Admission Rules

- `admitResultArtifact` accepts runtime failure envelopes only when
  `kind === "runtime_failure"`.
- The runtime failure envelope must carry one supported `failureClass`.
- Unsupported or legacy failure classes fail closed.
- Normal payload admission still validates fulfillment assessment structure
  before result ingest can accept or reject it.
- `M04` result-assessment admission carries an existing `failureClass`; it does
  not parse reason text to create one.

## Projection Rules

- M04 result assessment maps runtime failure ingest to public
  `kind: "rejected"` plus `ingestKind: "runtime_failure"` and the original
  `failureClass`.
- M04 live status projects a runtime-failure assessment as `kind: "attention"`.
- The attention `runStatus` is the canonical `failureClass`.
- The result-assessment projection exposes both status and `failureClass`.
- Generic `rejected` remains reserved for admitted payload contradictions.

## Proof Lane Set

Implementation must land proof that:

- each supported `RuntimeFailureClass` is admitted and preserved through M03
  ingest
- unsupported failure classes fail closed at M03 admission
- legacy `transport_failure`, `no_output`, and `contract_failure` classes are
  not accepted as canonical classes
- M04 result assessment carries `failureClass` from M03 without deriving it
  from reason text
- M04 live status projects runtime-failure attention using `failureClass`
- normal identity mismatch still remains generic `rejected`
- downstream qualification/wrapper tests cannot reconstruct the class locally

## Promotion Rule

No failure label may be promoted into a separate public stop taxonomy until
`B-030-TS` opens over this carrier set and declares the stop taxonomy mapping.
