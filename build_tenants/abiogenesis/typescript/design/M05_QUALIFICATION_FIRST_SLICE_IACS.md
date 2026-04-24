# M05 Qualification First Slice IACS

**Status**: Active
**Date**: 2026-04-24
**Derived from**: [M05_QUALIFICATION_DERIVATION.md](./M05_QUALIFICATION_DERIVATION.md), [ABG_3_MODULE_DESIGN.md](./ABG_3_MODULE_DESIGN.md), [ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md](./ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md), [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md), [T-021](../../.ai-workspace/tickets/completed/T-021-realize-typescript-m05-qualification-foundation-under-module-derived-method-trace-and-fake-lane-law.md)

## Purpose

Declare the first TypeScript `M05-qualification-scenarios` slice as an
explicit carrier inventory so method trace and fake-lane proof remain closed,
module-derived, and separate from later installed sandbox or archive
mechanics.

## M05 Qualification First Slice Boundary

The first TypeScript `M05` wave is:

- one method-trace qualification request carrier
- one method-trace qualification outcome family
- one fake-lane qualification request carrier
- one fake-lane qualification outcome family
- one bounded qualification kernel that evaluates already observed module truth

This wave does **not** include:

- installed sandbox requests or outcomes
- live-lane transport proof
- durable archive or postmortem outputs
- install/bootstrap or bootloader delivery carriers
- alternate-runtime mapping triggers

## Upstream Authoritative Carriers Consumed By M05

This slice does not redefine GTL, ABG, or `M04` truth.

The following remain authoritative upstream truth and are consumed unchanged:

- `PublicAssetAddressingOutcome`
- `PublicStartRequest`
- `PublicStartOutcome`
- `DispatchRequest`
- `PublicResultAssessmentRequest`
- `PublicResultAssessmentOutcome`
- `PublicLiveStatusProjection`

`M05` consumes those already-admitted carriers and evaluates qualification
truth over them. It does not reconstruct runtime or app semantics from open
payloads.

## Irreducible Architectural Carrier Set

The first TypeScript `M05` wave is allowed exactly these prime carrier
families:

1. `MethodTraceQualificationRequest`
2. `MethodTraceQualificationOutcome`
3. `FakeLaneQualificationRequest`
4. `FakeLaneQualificationOutcome`

Explicit pass or reject variants are members of the two outcome families
rather than separate outer carrier families.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
| --- | --- | --- | --- | --- | --- |
| `MethodTraceQualificationRequest` | `M05-qualification-scenarios` | authoritative qualification trace request | test/support fixture reads live design and proof surfaces, then admits closed refs | none | method-trace evaluation |
| `MethodTraceQualificationOutcome` | `M05-qualification-scenarios` | authoritative method-trace outcome family | derived from admitted trace request only | none | unit lane, closure review, later installed sandbox gating |
| `FakeLaneQualificationRequest` | `M05-qualification-scenarios` | authoritative fake-lane proof request | integration harness admits already observed `M04` and `M03` truth | none | fake-lane evaluation |
| `FakeLaneQualificationOutcome` | `M05-qualification-scenarios` | authoritative fake-lane outcome family | derived from admitted fake-lane request only | none | integration lane, later live-lane parity review |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
| --- | --- | --- | --- |
| `QualificationDesignAssetRef` | subordinate | trace detail nested under one method-trace request | admitted once into `MethodTraceQualificationRequest` |
| `QualificationProofLaneRef` | subordinate | proof-lane detail nested under one method-trace request | admitted once into `MethodTraceQualificationRequest` |
| `QualificationSourceAssetRef` | subordinate | Python reference detail nested under one method-trace request | admitted once into `MethodTraceQualificationRequest` |
| `MethodTraceGapRef` | subordinate | rejection detail, not an outer carrier | derived only from method-trace evaluation |
| `MethodTraceQualificationPassed` | prime family variant | explicit method-trace outcome variant | pattern-matched as part of `MethodTraceQualificationOutcome` |
| `MethodTraceQualificationRejected` | prime family variant | explicit method-trace outcome variant | pattern-matched as part of `MethodTraceQualificationOutcome` |
| `FakeLaneStepRef` | subordinate | per-step proof detail only | derived only from fake-lane evaluation |
| `FakeLaneQualificationPassed` | prime family variant | explicit fake-lane outcome variant | pattern-matched as part of `FakeLaneQualificationOutcome` |
| `FakeLaneQualificationRejected` | prime family variant | explicit fake-lane outcome variant | pattern-matched as part of `FakeLaneQualificationOutcome` |
| installed sandbox request/outcome | deferred | later installed-runtime qualification family | successor ticket only |
| live-lane transport proof | deferred | later installed-runtime qualification family | successor ticket only |
| run archive / postmortem carriers | deferred | later installed-runtime qualification family | successor ticket only |
| delivery-plan and injection carriers | deferred | owned by completed `M04` and delivery-library waves | successor ticket only |
| `M06` mapping trigger carriers | deferred | alternate-runtime trigger family, not `M05` first-slice truth | successor ticket only |

## M05 Qualification First Slice Rules

- `MethodTraceQualificationRequest` is the only lawful first-slice carrier for
  module-derived trace checks over `M05` qualification assets.
- `MethodTraceQualificationRequest` does not inspect filesystem truth directly.
  It consumes closed asset refs already derived by the test/support harness.
- `MethodTraceQualificationOutcome` is a closed discriminated family.
  Callers must pattern-match it rather than probing open result objects.
- `FakeLaneQualificationRequest` is the only lawful first-slice carrier for
  scenario proof over completed `M04` public/runtime surfaces.
- `FakeLaneQualificationRequest` consumes already admitted upstream carriers or
  projections; it does not reinterpret raw event logs or file writes as a
  rival semantic center.
- `FakeLaneQualificationOutcome` is a closed discriminated family.
- This first slice proves qualification over source-tree and module-derived
  truth only. Installed sandbox, live lane, and archive proof remain deferred
  to `T-022`.

## Promotion Rule

No subordinate payload may be promoted during the first `M05` wave unless:

1. it acquires independent public or persisted authority,
2. it crosses more than one module boundary unchanged, and
3. the promotion is recorded here and in `T-021` before code lands.
