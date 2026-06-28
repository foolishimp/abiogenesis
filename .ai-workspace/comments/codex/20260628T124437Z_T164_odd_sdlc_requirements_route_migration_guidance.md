# T-164 odd_sdlc Requirements-Route Migration Guidance

**Status**: Commentary handoff for downstream rebuild planning  
**Source identity**: abiogenesis `271a6d4`, package `4.1.0-rc.11`; audited odd_sdlc `/Users/jim/src/apps/odd_sdlc` at `52d1962`  
**Governing ticket**: `.ai-workspace/tickets/active/T-164-realize-gtl-abg-requirements-algebra-route-for-downstream-lifecycle-consumers.md`

## Boundary

`odd_sdlc` must consume the GTL/ABG requirements route directly. It must not
port its local requirement middle into odd_glc, odd_sdlc, or another product
namespace.

Generic requirements-algebra functions and carriers belong to GTL/ABG when
multiple ODD domains need them identically. Software delivery may label and
interpret admitted truth, but it does not own requirement compilation, evidence
binding, assurance folds, residual projections, lifecycle disposition, replay,
continuation, or re-entry authority.

## Replacement Map

| odd_sdlc local surface | Replace with |
| --- | --- |
| `SdlcRequirementClosureRegister` | `RequirementLedger`, `EdgeRequirementEnvironment`, fold/residual read models |
| `SdlcRequirementFulfillmentPublicProjection` | `abg.requirements.projectLifecycleState` |
| `SdlcEdgeEvidenceAdmission` | `RequirementEvidenceBinding` over admitted runtime evidence events |
| `SdlcEdgeGain` / `SdlcEdgeObligationGain` | requirement obligation, materialization, schedule, and evidence-expectation projections |
| `SdlcEdgeResidualPressure` | `RequirementResidualProjection` and attenuation classification |
| `SdlcEdgeAssuranceCloseDecision` | requirement fold over ABG assurance closure truth |
| `SdlcEdgeFulfillmentLedger` | replay-derived requirement ledger and projection events |
| `SdlcEdgeClosureDecision` | ABG assurance/continuation transition plus requirement lifecycle disposition |
| `SdlcNextActionProjection` | requirement lifecycle disposition joined with ABG continuation/re-entry truth |
| gap triage helpers | ABG context routing, residual classification, and lawful re-entry projection with product policy overlays |

## Migration Rule

Downstream rebuild work should delete peer-ledger authority, not preserve it as
compatibility glue. The replacement path is:

1. author requirement terms through `gtl.requirements`;
2. let ABG admit declarations and runtime evidence;
3. let ABG emit requirement evidence, fold, residual, and disposition
   projection facts on the traversal path;
4. consume `abg.requirements` read-only queries;
5. add SDLC lifecycle labels, policy overlays, and presentation-only read
   models over admitted GTL/ABG truth.

If an SDLC behavior cannot be expressed without a product-local requirement
compiler, closure ledger, residual ledger, or next-action router, that is an
upstream GTL/ABG gap or a product requirement reprice. It is not authorization
to rebuild the old local middle.
