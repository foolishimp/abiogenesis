# odd_sdlc TypeScript Tenant First Slice IACS

**Status**: Active
**Date**: 2026-04-26
**Implements**: REQ-F-ODDSDLC-040, REQ-F-ODDSDLC-041, REQ-F-ODDSDLC-042, REQ-F-ODDSDLC-043
**Derives From**: `ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`

## Purpose

Declare the first TypeScript tenant Irreducible Architectural Carrier Set before
implementation.

## Prime Carrier Families

| Carrier family | Owning group | Role |
| --- | --- | --- |
| `SdlcAsset` | `domain/` | durable typed domain asset reference |
| `SdlcAssetType` | `domain/` | semantic asset role and evaluation vocabulary |
| `SdlcAssetBinding` | `domain/` | binding from concrete asset to typed node |
| `SdlcWorksite` | `domain/` | bounded active SDLC workspace/work wave |
| `SdlcCapability` | `domain/` | declared technology or worker capability |
| `SdlcWorkAct` | `domain/` | provenance-bearing work act |
| `SdlcGraphFunctionCatalog` | `graph/` | machine-readable SDLC graph-function program catalog |
| `SdlcExecutionContract` | `start/` | admitted execution basis for one prompt-bearing or dispatch-bearing edge |
| `SdlcPublicStartRequest` | `start/` | closed public ignition request |
| `SdlcPublicStartOutcome` | `start/` | public result over ABG outcome and SDLC policy |
| `SdlcWorkReport` | `hooks/` | bounded constructor/evaluator hook evidence |
| `SdlcLineageLedger` | `hooks/` | source/traversal/asset-element lineage |
| `SdlcRequirementClosureRegister` | `projection/` | current requirement closure truth |
| `SdlcGapDossier` | `projection/` | current edge/span read-only evaluator view over ABG construction priority truth |
| `SdlcTriageDecision` | `triage/` | downstream product decision over gap truth |
| `SdlcOperationalTransitionCommand` | `operational/` | requested side-effect transition |
| `SdlcOperationalResult` | `operational/` | admitted returned operational evidence |
| `SdlcOperationalStateProjection` | `operational/` | current read model over operational evidence |

## Consumed Substrate Carriers

These are consumed from ABIogenesis TypeScript and are not redefined:

- `Node`
- `GraphVector`
- `Graph`
- `GraphFunction`
- `Module`
- `Job`
- `ExecutionBasis`
- `RuntimeEvent`
- `RuntimeAggregateProjection`
- `IterationAdvanceDecision`
- `TraversalStructureProbe`
- `ConstructionObservationSnapshot`
- `ConstructionActionCatalogProjection`
- `ObservationToActionBindingProjection`
- `ConstructionPriorityScheme`
- `AffectPriorityPolicy`
- `ConstructionPriorityProjection`
- `ConstructionPriorityRow`

## Subordinate Payloads

| Payload | Parent | Rule |
| --- | --- | --- |
| source input digest | `SdlcAsset` or workspace ingress carrier | never source authority alone |
| asset family descriptor | `SdlcAssetType` | catalog detail, not a carrier peer |
| graph-function typed surface | `SdlcGraphFunctionCatalog` | query projection, not graph source truth |
| start target entry | `SdlcPublicStartRequest`/query projection | target binding only |
| worker attachment | `SdlcExecutionContract` | readiness detail |
| route binding | `SdlcTriageDecision` | product work routing detail |
| test lane evidence item | `SdlcRequirementClosureRegister` | proof detail |
| operation log line | `SdlcOperationalResult` | evidence detail |

## Admission Rules

- Raw workspace state is admitted once at ingress.
- Open JSON does not pass a module boundary.
- Graph functions are published before public target resolution.
- Execution contracts are admitted before F_P dispatch.
- Operational results are admitted separately from operational commands.
- Requirement closure reads admitted lineage, tests, and behavior evidence.
- Gap triage reads projections and emits product decisions, not ABG facts.
- Gap dossier next-asset/action preview must read ABG construction priority
  projection truth, or explicitly declare a narrower non-ranking preview.

## Effect Boundaries

Only these groups may write durable state:

- `workspace/` may publish normalized/admitted workspace surfaces.
- `hooks/` may publish one selected target asset and work report.
- `triage/` may publish downstream ticket/proposal/action surfaces.
- `operational/` may publish returned side-effect evidence.
- `qualification/` may write test run archives.

No group may emit ABG runtime events except through the ABIogenesis substrate
adapter and its public emission contract.

No group may rank construction actions locally when an ABG construction
priority projection is available. odd_sdlc may contribute domain observation
pressure, action rows, and policy labels, but ABG owns binding and priority
projection truth.

## Promotion Rule

A subordinate payload may become a prime carrier only after:

1. it owns independent identity,
2. it crosses module boundaries unchanged,
3. it appears in product or requirement law, and
4. the promotion is recorded in this IACS before code lands.
