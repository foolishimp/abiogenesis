# M03 ABG.Fn Composition First Slice IACS

**Status**: Active
**Date**: 2026-05-16
**Derived from**: [M03_ABG_FN_COMPOSITION_DERIVATION.md](./M03_ABG_FN_COMPOSITION_DERIVATION.md), [M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md](./M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md), [M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md](./M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md), `T-134`

## Purpose

Declare the irreducible carrier set for ABG.Fn composition before parser,
runtime, projection, export, or live-scenario implementation is treated as
design-method conformant.

## Boundary

This slice is:

- `M03-engine-kernel` carrier law over GTL host declarations;
- pure immutable composition selection, host binding, and authority validation;
- upstream of runner selection, assurance projection, payload ledger closure,
  traversal optimization, and construction pressure packaging;
- generic across downstream products.

This slice does not include:

- product-specific semantic schemas;
- prompt rendering;
- domain gain functions;
- downstream application validation;
- full parser/runtime implementation, which lands through dependent substrate
  tickets after T-128/T-135/T-136 prove the needed carrier shape.

## Irreducible Architectural Carrier Set

This slice introduces eight prime carrier families and two downstream
projection families:

1. `ABGFnCompositionContract`
2. `ABGFnCompositionSelection`
3. `ABGFnHostBinding`
4. `ABGFnRegimeBinding`
5. `ABGFnContextBinding`
6. `ABGFnCarrierBinding`
7. `ABGFnAssuranceBinding`
8. `ABGFnClosureContract`

Deferred prime carrier for optimization:

1. `ABGFnOptimizationContract`

Downstream projection families:

1. `ABGFnCompositionProjection`
2. `ABGFnCompositionReadModel`

`ABGFnCompositionContract` is prime because it is the single identity-bearing
contract for how regimes compose at one host boundary.

`ABGFnCompositionSelection` is prime because declaration precedence and default
source identity are replay law. Controller-local lookup is not enough.

`ABGFnHostBinding` is prime because composition identity must be bound to the
GTL host that owns it. Vector-local declarations are invalid without this
cross-check.

`ABGFnRegimeBinding` is prime because regime order, role, and authority decide
whether a value is construction evidence, human judgment, deterministic
validation, or closure.

`ABGFnContextBinding` is prime because standards and policy identity affect
replay equivalence.

`ABGFnCarrierBinding` is prime because payload and target-carrier admission
must be interpreted under selected composition identity.

`ABGFnAssuranceBinding` is prime because edge assurance findings and closure
folds must be interpreted under selected composition identity.

`ABGFnClosureContract` is prime because closure remains a deterministic
predicate over admitted evidence, not a worker or controller claim.

`ABGFnOptimizationContract` is deferred until optimization implementation but is
architecturally prime: it is the independent admission boundary for replacing a
mixed or probabilistic path with deterministic closure.

`ABGFnCompositionProjection` is downstream replay truth over selected
composition, admitted events, carrier status, assurance status, and closure
status.

`ABGFnCompositionReadModel` is downstream-only report/query shape. It cannot
close work.

## Authority And Role Matrix

| Carrier | Owning module | Role | Ingress boundary | Effect boundary | Downstream consumers |
|---|---|---|---|---|---|
| `GraphVector.declarations` | `M01-gtl-core` | vector-local declaration surface | published GTL | none | composition selection |
| `GraphFunction.declarations` | `M01-gtl-core` | graph-function default declaration | published GTL | none | composition selection |
| `Job.policyHooks` | `M02-work-publication` | job policy default | published work module | none | composition selection |
| `Role.policyHooks` | `M02-work-publication` | role policy default | published work module | none | composition selection |
| `Module.policyHooks` | `M02-work-publication` | module policy default | published module | none | composition selection |
| `ABGFnCompositionContract` | `M03-engine-kernel` | immutable composition contract | GTL hook/config admission | none | selection, runner, projection |
| `ABGFnCompositionSelection` | `M03-engine-kernel` | selected composition with precedence provenance | contract resolution | none | replay, runner, reports |
| `ABGFnHostBinding` | `M03-engine-kernel` | host identity lock | contract admission | none | selection, diagnostics |
| `ABGFnRegimeBinding` | `M03-engine-kernel` | ordered regime authority | contract admission | none | runner, assurance, pressure |
| `ABGFnContextBinding` | `M03-engine-kernel` | standards and policy identity | config/declaration admission | none | replay, assurance |
| `ABGFnCarrierBinding` | `M03-engine-kernel` | payload and target carrier identity | selected contract admission | none | payload ledger, closure |
| `ABGFnAssuranceBinding` | `M03-engine-kernel` | assurance identity | selected contract admission | none | assurance projection |
| `ABGFnClosureContract` | `M03-engine-kernel` | deterministic closure predicate | contract admission | runtime transition planning | assurance fold, runner |
| `ABGFnOptimizationContract` | `M03-engine-kernel` | deterministic replacement admission | optimization admission | none | traversal modulation |
| `ABGFnCompositionProjection` | `M03-engine-kernel` | downstream replay projection | admitted events/config | none | reports, tests, runner gates |
| `ABGFnCompositionReadModel` | `M03-engine-kernel` | downstream-only report model | projection read | none | reports, tests |

## Subordinate Payload Register

| Shape | Status | Why not prime | Admission rule |
|---|---|---|---|
| `contractDigest` | subordinate | identity payload under contract | deterministic normalized digest |
| standards refs | subordinate | context payload under one context carrier | non-empty refs under `ABGFnContextBinding` |
| policy refs | subordinate | context payload under one context carrier | admitted visible config or published asset |
| consumed field refs | subordinate | regime payload used by T-138 | non-empty refs under `ABGFnRegimeBinding` |
| input/output carrier refs | subordinate | regime and carrier payload | admitted refs or rejected |
| required/rejection evidence refs | subordinate | closure payload | admitted refs or missing evidence pressure |
| positive/negative case refs | subordinate until optimization | proof payload under optimization contract | admitted only with `ABGFnOptimizationContract` |
| rendered prompt sections | subordinate/out of scope | consumer adapter detail | not ABG composition truth |

## Collapse Decisions

- No new canonical GTL topology type is introduced.
- No product-specific schema engine is introduced.
- No prompt-rendering contract is introduced.
- No null composition contract is allowed for closure-capable boundaries.
- No code fallback object satisfies default composition authority.
- F_P evidence and F_H judgment remain evidence under selected composition;
  only F_D closure can close.
- Optimization is deferred from the first implementation slice but remains an
  explicit prime carrier family.

## Fail-Closed Rules

- Missing composition for a boundary that requires composition truth fails
  closed unless a visible default or published template supplies it.
- Malformed present declarations fail closed.
- Host mismatch fails closed.
- Contract digest mismatch fails closed.
- A non-F_D regime claiming closure authority fails closed.
- Missing standards or policy refs required by the selected contract fail
  closed.
- Target carrier digest mismatch remains non-closing pressure.
- Edge assurance digest mismatch remains non-closing pressure.
- Replay-time lazy filesystem/default lookup fails closed.
- Optimization without positive and negative equivalence cases fails closed.

## Module-Derived Proof Map

| Proof lane | Design source | Required assertion |
|---|---|---|
| IACS preservation | this IACS | parser/admission shapes map to prime carriers, not helper fragments |
| declaration precedence | this IACS | vector-local composition wins and wider defaults cannot override |
| host binding | this IACS | wrong vector/source/target/schema fails closed |
| regime authority | this IACS | only F_D closure authority is accepted |
| context identity | this IACS | standards/policy mismatch is replay non-equivalence |
| carrier binding | this IACS + target-carrier design | wrong target carrier digest cannot close |
| assurance binding | this IACS + edge-assurance design | wrong assurance digest cannot close |
| replay purity | this IACS | admitted config/events reproduce selected composition |
| optimization | this IACS | replacement requires source digest plus positive and negative cases |
