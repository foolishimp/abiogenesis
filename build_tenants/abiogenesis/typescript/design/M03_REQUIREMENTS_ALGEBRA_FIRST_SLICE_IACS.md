# M03 Requirements Algebra First-Slice IACS

**Status**: Active
**Date**: 2026-06-26
**Purpose**: Declare the irreducible carrier set for T-162.

## Prime Carrier Set

| Carrier | Role | Why Prime |
| --- | --- | --- |
| `RequirementEventPayload` | admitted event payload for requirement-algebra truth | It is the only write-side input to replay. |
| `RequirementTerm` | closeable WHAT pressure identity | It carries stable requirement identity, source refs, spans, and policy refs. |
| `RequirementRelation` | typed relation between requirement terms/projections | Relation law must fail closed independently from term payload text. |
| `TraversalSpan` | graph-function/vector coverage identity | It binds requirements to existing GTL topology without creating a new topology anchor. |
| `EdgeRequirementEnvironment` | active edge-local pressure package | It is the finite input to projection/fold/query transforms. |
| `RequirementProjection` | active obligation/materialization/execution/evidence projection | It is the deterministic read model products consume. |
| `RequirementEvidenceBinding` | admitted/non-closing evidence binding | It separates evidence source, execution, and interpretation without closing by path shape. |
| `RequirementFoldProjection` | requirement-scoped fold projection | It maps to existing ABG assurance truth without owning closure. |
| `RequirementResidualProjection` | preserved pressure read model | It carries remaining span and owner surface without owning retry/re-entry. |
| `RequirementTestRelation` | compatibility-named requirement-to-proof evidence relation | It binds subject-artifact, verifier-artifact, verifier-execution, and interpretation projections without letting path shape, tool name, or pass status own evidence role or product policy. |
| `RequirementAssuranceClaim` | assurance-case read model | It renders claim/evidence/context over existing fold/residual truth. |

## Admitted Payload Carriers

`RequirementLedger` is a replay-derived projection, not a prime writable
carrier.

The following are admitted event payload carriers in the first slice, but they
remain subordinate to replay, environment construction, and projection:

- `AuthorityContextFragment`
- `DestinationTopology`
- `RequirementEdgeRef`

The ten `*AdmittedPayload`, `*BoundPayload`, and `*ProjectedPayload` wrappers
are subordinate discriminated-union members of `RequirementEventPayload`. They
are not independent prime carriers.

## Downstream Projection And Read-Model Carriers

The following are deterministic read models over admitted requirement carriers.
They do not own closure, traversal, retry, or re-entry authority:

- `RequirementQueryReadModel`
- `RequirementContextRouteProjection`
- `RequirementStructuralEvaluation`
- `RequirementAttenuationProjection`
- `RequirementExecutionScheduleProjection`
- `RequirementCompletenessReport`
- `RequirementCompletenessGateRow`

## Subordinate Or Deferred Families

The following begin subordinate or deferred unless a later promotion test proves
they are prime:

- `RequirementGraph`
- `RequirementGraphState`
- `RequirementGoal`
- `RequirementAssumption`
- `RequirementSoftGoal`
- `RequirementAgent`
- `RequirementOperation`
- `RequirementDomainObject`

`DestinationTopology` and `AuthorityContextFragment` are admitted payload
families in the first slice, but they are not independent closure or traversal
carriers. They constrain projection through environment construction.

## Promotion Tests

A subordinate family may be promoted only when all are true:

- it owns an identity-bearing semantic boundary not carried by an existing
  prime carrier;
- removing it would make projection fail closed rather than merely make typing
  less convenient;
- it does not duplicate event, ledger, assurance, retry, continuation, or
  re-entry authority;
- it has a negative test proving drift fails closed.

## Consolidation Decisions

- `RequirementFold` is named as `RequirementFoldProjection` in code to avoid
  implying closure authority.
- `RequirementResidual` is named as `RequirementResidualProjection` in code to
  avoid implying retry or re-entry authority.
- `RequirementLedger` is a read model returned by replay and has no admission
  constructor.
- Rich KAOS objects stay typed relation payloads or subordinate details in the
  first slice.
