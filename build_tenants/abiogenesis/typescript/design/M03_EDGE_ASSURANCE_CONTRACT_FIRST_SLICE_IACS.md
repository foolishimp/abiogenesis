# M03 Edge Assurance Contract First Slice IACS

**Status**: Active
**Date**: 2026-05-13
**Derived from**: [M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md](./M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md), [M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md](./M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md), `T-130`, `T-131`

## Purpose

Declare the irreducible carrier set for GTL-declared edge assurance and recorded
F_P hook findings before the TypeScript implementation is treated as closed.

## Boundary

This slice is:

- `M03-engine-kernel` carrier law over GTL declarations,
- pure immutable contract resolution and admission,
- upstream of assurance projection and runner transition choice,
- compatible with M01/M02 declaration carriers,
- generic across downstream products.

This slice does not include:

- odd_sdlc-specific requirement ledgers,
- a scalar percent-complete metric,
- F_D semantic closure for generic software work,
- direct plugin event or projection authority,
- full runner integration for every hook class.

## Irreducible Architectural Carrier Set

This slice introduces six prime carrier families and two downstream projection
families:

1. `EdgeAssuranceContract`
2. `EdgeAssuranceContractSelection`
3. `EdgeAssuranceAbsentiaResolution`
4. `HookActionRecord`
5. `HookFindingAdmission`
6. `FpEdgeAssuranceEvalFinding`

Downstream projection families:

1. `EdgeAssuranceEvaluationProjection`
2. `EdgeAssuranceEvaluationReadModel`

`EdgeAssuranceContract` is prime because it is the public edge-level contract
that binds gain, close, residual pressure, evidence, authority, and composition
law.

`EdgeAssuranceContractSelection` is prime because precedence is runtime law. The
selected source and config digest must be replay-visible; a controller-local
lookup is not enough.

`EdgeAssuranceAbsentiaResolution` is prime because absence has semantics:
F_H assurance is required. Absence is not a null contract.

`HookActionRecord` is prime because T-130 makes the hook call itself an admitted
runtime object. Returned findings cannot become projection inputs without this
causal record.

`HookFindingAdmission` is prime because plugin findings are not owned truth until
ABG admits or rejects them against the hook contract.

`FpEdgeAssuranceEvalFinding` is prime because it crosses the plugin boundary and
carries edge-gain, close-disposition, residual, evidence, authority, and
composition contribution refs under the selected contract.

`EdgeAssuranceEvaluationProjection` is not plugin output. It is the first
ABG-owned projection over the selected contract, hook action, admitted finding,
assurance projection, and assurance closure fold.

`EdgeAssuranceEvaluationReadModel` is downstream-only. It renders the projection
for reports and tests and cannot close work.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
|---|---|---|---|---|---|
| `GraphVector.declarations` | `M01-gtl-core` | vector-local declaration surface | published GTL | none | edge assurance resolution |
| `GraphFunction.declarations` | `M01-gtl-core` | graph-function default declaration | published GTL | none | edge assurance resolution |
| `Job.policyHooks` | `M02-work-publication` | job policy default | published work module | none | edge assurance resolution |
| `Role.policyHooks` | `M02-work-publication` | role policy default | published work module | none | edge assurance resolution |
| `Module.policyHooks` | `M02-work-publication` | module policy default | published work module | none | edge assurance resolution |
| `EdgeAssuranceContract` | `M03-engine-kernel` | immutable edge assurance contract | GTL hook ref/config admission | none | hook action, assurance projection |
| `EdgeAssuranceContractSelection` | `M03-engine-kernel` | selected contract with precedence provenance | contract resolution | none | hook action, replay, reports |
| `EdgeAssuranceAbsentiaResolution` | `M03-engine-kernel` | F_H-required absentia default | contract resolution | none | runner, reports, human loop |
| `HookActionRecord` | `M03-engine-kernel` | replay-visible hook call record | ABG plugin-call boundary | plugin invocation | admission, replay, reports |
| `FpEdgeAssuranceEvalFinding` | plugin-returned carrier admitted by `M03` | returned edge eval finding | plugin output admission | plugin invocation | admission, assurance projection |
| `HookFindingAdmission` | `M03-engine-kernel` | admitted/rejected finding status | ABG admission | none | assurance projection, reports |
| `AssuranceProjection` | `M03-engine-kernel` | downstream total row projection | admitted findings and evidence | none | closure fold, reports |
| `AssuranceClosureDecision` | `M03-engine-kernel` | only assurance close/retry/reprice/block/defer decision | projection fold | runtime transition planning | runner, reports |
| `EdgeAssuranceEvaluationProjection` | `M03-engine-kernel` | gain/close/residual/next-action projection over an admitted eval finding | ABG projection | none | reports, downstream registers |
| `EdgeAssuranceEvaluationReadModel` | `M03-engine-kernel` | read model over edge assurance evaluation projection | deterministic read model | none | reports, tests |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
|---|---|---|---|
| `HookRef.config` | subordinate | GTL hook payload under declaration | parsed into `EdgeAssuranceContract` or rejected |
| `ConfigDigest` | subordinate | identity payload for replay | deterministic over contract config |
| `MetricRef` | subordinate | domain metric pointer | non-empty ref under finding |
| `GainReportRef` | subordinate | domain report pointer | non-empty ref under finding |
| `ResidualPressureRef` | subordinate | domain residual pointer | optional non-empty refs under finding |
| `ContinuationRef` | subordinate | proposed next-basis pointer | optional non-empty refs under finding |
| `CompositionContributionRef` | subordinate | A-to-Z composition pointer | non-empty ref under finding |
| `ForbiddenAuthorityField` | subordinate | validation vocabulary | rejected at admission |

## Collapse Decisions

- No `UnitOfCompute` carrier is introduced.
- No SDLC-specific requirement ledger is introduced in ABG.
- No scalar gain metric is introduced as generic law.
- No plugin-owned closure, event, ledger, projection, or vector-selection field
  is admitted.
- `HookFindingReturned` is represented by the returned finding ref recorded on
  `HookActionRecord`; it does not need a separate prime carrier in this slice.
- `HookContributionProjected` is represented for this slice by
  `EdgeAssuranceEvaluationProjection`. The prime input remains
  `HookFindingAdmission`.
- F_D remains structural unless a domain supplies deterministic semantic law.

## Fail-Closed Rules

- Duplicate declaration attrs fail closed.
- A present `abg.edge_assurance_contract` attr that is not a `hook_ref` fails
  closed.
- Missing required contract refs fail closed.
- Duplicate required refs fail closed.
- Multiple role defaults fail closed unless a resolved policy supplies a single
  role.
- Missing edge assurance resolves to `EdgeAssuranceAbsentiaResolution`.
- F_P eval findings with runtime event, ledger, projection, selected vector,
  transition, or closure-authority fields fail closed.
- Hook findings cannot be admitted without a matching `HookActionRecord` ref and
  selected edge assurance contract ref.

## Module-Derived Proof Map

| Proof lane | Design source | Required assertion |
|---|---|---|
| resolution precedence | this IACS | vector beats graph function, job, role, module, and defaults |
| absentia default | this IACS | missing contract produces F_H-required absentia |
| malformed declaration | this IACS | invalid or duplicate declarations throw |
| eval finding shape | this IACS | gain, close, residual, evidence, authority, composition refs are typed |
| plugin authority limit | T-130 and this IACS | eval findings cannot smuggle engine authority |
| hook action replay | T-130 and this IACS | hook action -> finding -> admission is reconstructable from refs |
| assurance bridge | total assurance IACS | admitted findings can feed projection without becoming closure truth |
| edge evaluation projection | this IACS | admitted finding plus assurance fold projects gain, residual, continuation, and next-action basis |
| qualified defer basis | this IACS | qualified defer carries continuation, residual, and composition contribution refs |
| close non-override | this IACS | F_P proposed close cannot override non-close assurance fold |
| F_H semantic split | this IACS | F_P human-assurance proposal is distinct from F_H absentia for missing contract |
