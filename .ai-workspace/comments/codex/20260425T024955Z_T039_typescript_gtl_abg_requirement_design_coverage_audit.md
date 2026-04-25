# T-039 TypeScript GTL/ABG Requirement Design Coverage Audit

**Status**: Completed audit
**Ticket**: `T-039-audit-typescript-design-coverage-against-repaired-gtl-abg-requirement-authority`
**Date**: 2026-04-25

## Executive Result

The TypeScript line does not depend on the retired GTL/ABG monolith stubs for
live design authority.

GTL `M01` and `M02` are covered by tenant design. ABG `M03` and `M04` are not
uniformly closure-ready. The remaining gaps are structural and should be
processed as successor tickets:

- `T-041`: replay-derived graph-function iteration, next-edge planning, and
  aggregate projection design for TypeScript `M03`
- `T-042`: generic retry/repair plus bounded leaf-task governance design for
  TypeScript `M03`
- existing `T-035`: runtime/capability/failure taxonomy
- existing `B-030-TS`: complete callable `start` and stop taxonomy over public
  truth

`T-040` is unblocked for deletion of the temporary superseded stubs because no
live requirement, scenario, common design, tenant design, active ticket, or
backlog ticket needs them as authority.

## Coverage Matrix

| Family | Status | TypeScript/common design evidence | Gap / action |
| --- | --- | --- | --- |
| `REQ-L-GTL3-LANGUAGE` | covered | `GTL_3_MODULE_DESIGN.md`, `M01-gtl-core.yml` | none |
| `REQ-L-GTL3-ATTRS` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_FIRST_SLICE_IACS.md` | none |
| `REQ-L-GTL3-CONTEXT` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_FIRST_SLICE_IACS.md` | none |
| `REQ-L-GTL3-GRAPH` | covered | `GTL_3_MODULE_DESIGN.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | none |
| `REQ-L-GTL3-NODE` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | none |
| `REQ-L-GTL3-GRAPHVECTOR` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_FIRST_SLICE_IACS.md` | none |
| `REQ-L-GTL3-INTERFACE` | covered | `GTL_3_MODULE_DESIGN.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | none |
| `REQ-L-GTL3-OPERATOR` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | none |
| `REQ-L-GTL3-EVALUATOR` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | none |
| `REQ-L-GTL3-RULE` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md` | none |
| `REQ-L-GTL3-GRAPHFUNCTION` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_M02_WORK_PUBLICATION_IACS.md` | none |
| `REQ-L-GTL3-HOOKS` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_M02_WORK_PUBLICATION_IACS.md` | none |
| `REQ-L-GTL3-ROLE` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_M02_WORK_PUBLICATION_IACS.md` | none |
| `REQ-L-GTL3-JOB` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `GTL_3_M02_WORK_PUBLICATION_IACS.md` | none |
| `REQ-L-GTL3-IDENTITY` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `M02_M03_LOOKUP_AUTHORITY_IACS.md` | none |
| `REQ-L-GTL3-COMPOSE` | covered | `GTL_3_MODULE_DESIGN.md`, `GTL_3_IMPLEMENTATION_PLAN.md` | none |
| `REQ-L-GTL3-SUBSTITUTE` | covered | `GTL_3_MODULE_DESIGN.md`, `GTL_3_IMPLEMENTATION_PLAN.md` | none |
| `REQ-L-GTL3-RECURSE` | covered | `GTL_3_MODULE_DESIGN.md`, `M01-gtl-core.yml` | none |
| `REQ-L-GTL3-HOF` | covered | `GTL_3_MODULE_DESIGN.md`, `M01-gtl-core.yml` | none |
| `REQ-L-GTL3-LAWS` | covered | `GTL_3_INTERFACE_CONTRACTS.md`, `M01-gtl-core.yml` | none |
| `REQ-L-GTL3-MODULE` | covered | `GTL_3_M02_WORK_PUBLICATION_IACS.md`, `M02-work-publication.yml` | none |
| `REQ-L-GTL3-SELECTION-BOUNDARY` | covered | `GTL_3_M02_WORK_PUBLICATION_IACS.md`, `M02-work-publication.yml` | none |
| `REQ-L-GTL3-SUBWORK` | covered | `GTL_3_MODULE_DESIGN.md`, `M01-gtl-core.yml` | runtime realization is ABG-owned, not GTL gap |
| `REQ-L-GTL3-SYNTHESIS` | covered | `GTL_3_MODULE_DESIGN.md`, `M01-gtl-core.yml` | none |
| `REQ-R-ABG3-EVENTS` | partially_covered | `ABG_3_FIRST_SLICE_IACS.md`, `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md`, `M04_EVENT_INGRESS_*` | New canonical envelope and event-family completeness from `REQ-R-ABG3-EVENTS-010..011` need concrete TS `M03` carrier mapping; `T-041` |
| `REQ-R-ABG3-PROJECTION` | partially_covered | `M04_LIVE_STATUS_*`, `ABG_3_FIRST_SLICE_IACS.md` defers projections | Full run/graph-call/frame/continuation projection is not tenant-designed; `T-041` |
| `REQ-R-ABG3-BINDING` | partially_covered | `M02_M03_LOOKUP_AUTHORITY_*`, `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md` | Callable/job lookup exists, but live vector publication, environment merge, and asset-surface binding ACs need `M03` design; `T-041` |
| `REQ-R-ABG3-WORKER` | covered | `ADR-041`, `ADR-043`, `M04_FIRST_SLICE_IACS.md` runtime identity projection | none |
| `REQ-R-ABG3-JOB-WORKER` | covered | `GTL_3_M02_WORK_PUBLICATION_IACS.md`, `M02_M03_LOOKUP_AUTHORITY_IACS.md`, `ABG_3_FIRST_SLICE_IACS.md` | none |
| `REQ-R-ABG3-RUN` | partially_covered | `ABG_3_FIRST_SLICE_IACS.md`, `M04_PUBLIC_START_*`, `M04_MAXIMUM_AUTONOMY_*` | Stop/failure classes remain under `T-035` and `B-030-TS` |
| `REQ-R-ABG3-GRAPHCALL` | partially_covered | `ABG_3_MODULE_DESIGN.md`, `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md` carries graph-function identity | Missing concrete graph-call lifecycle/open/close/projection carrier design; `T-041` |
| `REQ-R-ABG3-FRAME` | partially_covered | `ExecutionBasis` carries `frameId` and `frameLineageId` | Missing frame lifecycle and foldback projection design; `T-041` |
| `REQ-R-ABG3-CONTINUATION` | partially_covered | `M05_INSTALLED_RESET_POSTMORTEM_*`, live-status/result-assessment surfaces | Missing full continuation aggregate lifecycle and retry-linked reopening design; `T-042` |
| `REQ-R-ABG3-LINEAGE` | partially_covered | `ABG_3_FIRST_SLICE_IACS.md`, `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md` | Needs graph-call/frame lineage under replay-derived iteration; `T-041` |
| `REQ-R-ABG3-CONVERGENCE` | partially_covered | `ADR-042`, `ADR-043`, `M04_RESULT_ASSESSMENT_*` | Failure taxonomy still blocked by `T-035` |
| `REQ-R-ABG3-POLICY` | partially_covered | `ADR-042`, `ADR-043`, `ExecutionBasis.resolvedPolicy` | Runtime/capability/failure taxonomy remains `T-035` |
| `REQ-R-ABG3-SELECTION-APPLICATION` | partially_covered | `M01/M02` candidate publication and common `M03` selection surface | Concrete selected graph-function application must open graph-call/frame truth; `T-041` |
| `REQ-R-ABG3-LEAFTASK` | missing_design | common `M03` lists `engine-kernel.subwork-surface` only | No TypeScript tenant design for bounded subordinate work; `T-042` |
| `REQ-R-ABG3-PROVENANCE` | partially_covered | `ABG_3_MODULE_DESIGN.md`, transport/result and live portfolio designs | Needs aggregate-level replay/iteration provenance with graph-call/frame truth; `T-041` |
| `REQ-R-ABG3-CORRECTION` | partially_covered | reset postmortem and continuation-adjacent M05 surfaces | Needs retry/correction lifecycle design under fresh attempt identity; `T-042` |
| `REQ-R-ABG3-RETRY` | missing_design | no direct common or TypeScript design owner found | Add TS `M03` retry/repair design; `T-042` |
| `REQ-R-ABG3-TRANSPORT` | partially_covered | `M03_TRANSPORT_PROTOCOL_*`, `ADR-042` | Transport failure class split remains `T-035` |
| `REQ-R-ABG3-INTERPRET` | partially_covered | `ABG_3_MODULE_DESIGN.md` states `5.3`; `M04_PUBLIC_START_DERIVATION.md` demotes only app loops | Missing concrete `M03` next-edge planning and iterate carrier design; `T-041` |
| `REQ-R-ABG3-SELFHOSTING` | covered | `M05` qualification surfaces, `M03-engine-kernel.yml` selfhosting surface | none |

## Gaps By Type

| Gap type | Finding | Successor |
| --- | --- | --- |
| Missing shared/tenant design | `REQ-R-ABG3-RETRY` has no current common-module or TS design owner | `T-042` |
| Missing tenant design | `REQ-R-ABG3-LEAFTASK` is named in common design but not designed in TS | `T-042` |
| Missing tenant design | replay-derived graph-function iteration is stated in `ABG_3_MODULE_DESIGN.md` but lacks concrete `M03` carrier/IACS/diagram proof | `T-041` |
| Missing tenant proof | current sandbox/live tests can prove selected scenarios but not full replay-derived next-edge progression over callable graph boundary | `T-041` |
| Missing implementation/proof | runtime/capability/failure taxonomy remains too coarse | existing `T-035` |
| Missing product-facing callable closure | complete callable `start` and stop taxonomy not landed | existing `B-030-TS` |

## Monolith Stub Decision

No live design surface in the TypeScript tenant needs the retired monolith
stubs as authority. The remaining pre-cleanup exact references were:

- repo bootstrap/source-of-truth pointers in `AGENTS.md` and `README.md`
- `T-040` cleanup ticket text

Those are cleanup targets, not design dependencies. `T-040` can proceed now.
