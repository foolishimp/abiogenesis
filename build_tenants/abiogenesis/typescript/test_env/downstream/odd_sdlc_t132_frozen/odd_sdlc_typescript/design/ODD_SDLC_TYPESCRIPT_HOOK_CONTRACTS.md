# odd_sdlc TypeScript Hook Contracts

**Status**: Active
**Date**: 2026-04-26
**Implements**: REQ-F-ODDSDLC-013, REQ-F-ODDSDLC-014, REQ-F-ODDSDLC-015, REQ-F-ODDSDLC-017
**Derives From**: `ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`, `ODD_SDLC_TYPESCRIPT_TENANT_FIRST_SLICE_IACS.md`, `build_tenants/python/design/fp/DETERMINISTIC_REPAIR_FRONTIER.md`

## Position

The hook layer is SDLC-owned IoC for one ABG-selected edge. It is not graph
iteration, public start, or ticket routing.

The prime carrier is `SdlcWorkReport`. It carries the bounded proof that a
constructive turn produced or updated one governed target asset under a declared
contract.

The Python constructor, F_D checks, and repair frontier are behavior evidence.
They are not a module template. The TypeScript realization consolidates them
into one ODD hook-contract surface with separate preflight F_D, constructive
F_P result, and postflight F_D projections.

## Irreducible Architectural Carrier Set

| Carrier | Role |
| --- | --- |
| `SdlcHookContract` | edge-class contract over source assets, target asset, F_D/F_P/F_H dependencies, work report, and closure policy |
| `SdlcHookInvocation` | admitted request from an ABG-selected edge to a tenant hook |
| `SdlcConstructorResult` | bounded F_P construction result before postflight acceptance |
| `SdlcGeneratedAssetAuthority` | graph-function authority for the generated target asset |
| `SdlcWorkReport` | machine-readable evidence returned to ABG/domain projections |
| `SdlcEvaluatorResult` | deterministic preflight or postflight result with blocking reasons |

These carriers are prime for the hook boundary:

- `SdlcHookContract` owns edge law
- `SdlcHookInvocation` owns the selected-edge handoff
- `SdlcConstructorResult` owns returned constructive result shape before
  postflight proof
- `SdlcGeneratedAssetAuthority` owns graph-function-generated asset authority
- `SdlcWorkReport` owns the proof payload returned to projections
- `SdlcEvaluatorResult` owns deterministic pass/block evidence

No carrier owns ABG event truth, retry, continuation, public start, or ticket
state.

## Structural Carrier Diagram

```text
graph catalog truth
  -> hooks/catalog.ts
       produces SdlcHookContract

ABG-selected edge handoff
  -> hooks/admission.ts
       admits SdlcHookInvocation

F_P constructor return
  -> hooks/admission.ts
       admits SdlcConstructorResult

SdlcHookContract + SdlcHookInvocation
  -> hooks/evaluators.ts
       derives preflight SdlcEvaluatorResult

SdlcHookContract + SdlcHookInvocation + SdlcConstructorResult
  -> hooks/work_report.ts
       derives admitted SdlcWorkReport

SdlcHookContract + SdlcWorkReport
  -> hooks/evaluators.ts
       derives postflight SdlcEvaluatorResult

preflight + optional SdlcWorkReport + postflight
  -> hooks/hook_set.ts
       derives SdlcHookTurnOutcome

test/module proof lanes
  -> hooks/fixtures.ts
       derive minimal SdlcHookInvocation fixtures
```

Visibility:

- public: carrier types, admissions, catalog functions, evaluator functions,
  declared hook target policy, work-report construction, hook-turn facade
- proof-only helper: `minimalSdlcHookInvocationForContract`
- private: parsing helpers, payload projection helpers, matching helpers

## Module Shape

The hook boundary is split into prime deterministic seams.

| Module | Classification | Owns | Does Not Own |
| --- | --- | --- | --- |
| `hooks/carriers.ts` | Carrier module | immutable hook carriers, enum values, and empty runtime-event constant | admission, evaluation, graph traversal |
| `hooks/admission.ts` | Binding/admission module | closed parsing and admission for hook payloads and work reports | policy classification, work-report construction, postflight semantics |
| `hooks/policy.ts` | Policy catalog module | declared hook target asset to edge-class/default-operation policy data | contract construction, runtime execution, hidden fallback branches |
| `hooks/catalog.ts` | Catalog module | contract derivation from graph catalog entries using declared hook policy | runtime execution, hook turn state, ABG continuation |
| `hooks/evaluators.ts` | Semantic kernel module | deterministic preflight and postflight F_D over admitted carriers | F_P construction, work-report construction, next traversal |
| `hooks/work_report.ts` | Projection/materialization module | projection from invocation plus constructor result into admitted `SdlcWorkReport` | validation policy beyond report admission, ABG events |
| `hooks/fixtures.ts` | Test fixture module | minimal module-derived hook invocation helper used by proof lanes | production workflow, operator command behavior |
| `hooks/hook_set.ts` | Facade/composition module | one hook turn: preflight, optional work-report construction, postflight | catalog truth, payload admission truth, retry, continuation, next-vector selection |
| `hooks/index.ts` | Public export boundary | stable package exports for the hook seam family | semantic ownership |

This split is local optimization. It reduces the hook monolith without changing
the public hook behavior or increasing semantic truth surfaces. Each new module
has one owner and one reason to exist.

The global optimization is that these seams now sit under the reusable graph
function library:

- each product hook contract is a specialization of `Fg_single_typed_traversal`
- ingress-specific bootstrap proof is owned by `Fg_ingress_project`
- hook evaluation remains deterministic `F_D` around one ABG-selected edge
- unresolved closure still returns evidence to ABG instead of running a local
  retry loop

T-051 extracts hook target edge-class and default-operation policy into
`hooks/policy.ts`. Route, start-target, and operational-lane policy extraction
remain separate follow-up work because those are separate module boundaries.

## Design-Module Review

The active hook boundary stays lawful under `DESIGN_MODULE_METHOD.md` by these
checks:

- one owner per truth surface: carriers, admission, catalog, evaluation,
  work-report projection, test fixture construction, and hook-turn composition
  are separate owners
- no new runtime truth: no hook module emits ABG events, selects vectors, calls
  public start, or opens retry
- no duplicate closure law: closure policy remains carried by
  `SdlcHookContract`; evaluators only apply it to admitted facts
- no hidden graph function: graph-function program truth remains under
  `graph/` and the reusable graph-function library
- tests remain module-owned: T-034 exercises hook contracts, admissions,
  evaluators, work-report projection, and hook-turn composition through the
  public hook boundary

## Evaluation Law

Preflight F_D checks binding, source presence, target contract, and F_P worker
contract readiness before construction.

Constructive F_P returns a constructor result and work report. It does not
select the next traversal.

Closure policy separates two authorities:

- SDLC hooks may not select the next traversal locally.
- Unresolved realization depth is returned to ABG as retry/continuation
  evidence. ABG owns the resulting re-entry, event truth, continuation truth,
  and stop law.

Postflight F_D checks output identity, target binding, evidence refs,
graph-function asset authority, requested/returned operation agreement,
generated-asset attestation, and ambiguity candidates before proof can count.

Local optimization keeps contract admission and evaluator projection in the
hook layer. Global optimization is that every SDLC edge class reads the same
contract shape instead of carrying a bespoke constructor path.

## Non-Ownership

Hooks must not:

- emit ABG runtime events directly
- call public start recursively
- infer a next graph vector
- implement a tenant-local retry loop
- accept trace tags or comments as behavioral fulfillment
- merge foreign realization candidates into the target silently

When F_D/F_P/F_H evidence denies closure, the hook contract can identify the
runtime consequence as ABG retry repair, but the hook does not perform that
continuation itself.
