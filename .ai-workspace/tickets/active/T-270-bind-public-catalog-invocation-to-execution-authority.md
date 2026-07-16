# T-270 - Bind Public run.invoke To Admitted One Surface Execution Authority

- id: T-270
- title: Bind public run.invoke to admitted One Surface execution authority
- type: bug
- ticket_category: implementation_migration
- status: active
- phase_status: reconciled_design_accepted_neutral_contract_milestone_active_runtime_reconciliation_pending
- review_status: fh_accepted_for_implementation_independent_closure_review_pending
- proof_status: pending
- delivery_phase: DS-2 integration
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Join one admitted PublicInvocation<run.invoke>, its exact InvocationAuthority,
    immutable WorkspaceBinding, admitted GtlProgram, narrowing CatalogView,
    program-owned GraphFunction, admitted NextActionProjection, and AF-14
    ConstructionIntent to the existing T-255/T-267/T-271 compiler chain; mint
    one subordinate non-effect start-admission witness and one sole
    effect-authorizing ExecutionBasis without selecting or ordering One Surface
    work.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design public invocation and compiled
    execution handoff boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-16
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-255
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    catalog_invocation.ts
- dependencies:
  - ratified T-278 Ontology digest f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8
  - accepted One Surface AF-11, AF-12, AF-13, AF-14, and AF-16 authority contracts
  - accepted 19-operation PublicFunctionDefinition family
  - completed T-255
  - completed T-267
  - completed T-271
- downstream_dependencies:
  - T-281 P1 consumes the neutral owner-native run.invoke contract family
  - T-272 continuation consumes held F_H truth
  - T-268 aggregates the final tenant capability manifest
  - T-276 owns installed existing, alternate, and temporary-workspace scenarios
- authority_refs:
  - specification/GOALS.md DS-2
  - specification/INTENT.md public invocation spine
  - specification/PRODUCT.md public operator contract and One Surface
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md 008..010
  - specification/requirements/product/REQ-P-POLICY.md 019..025, 053..054, 062..064
  - specification/requirements/mapping/REQ-M-GTL3-PROGRAM-TRAVERSAL.md 001..010
  - specification/requirements/abg/REQ-R-ABG3-INTERPRET.md 002, 009..013, 029..030
  - specification/requirements/abg/REQ-R-ABG3-BINDING.md 015..018
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md 022..024, 026..027
- prime_contraction_refs:
  - PC-007
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md
- pre_ontology_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260714T140354Z_DECISION_fh_authorize_t277_implementation.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T062747Z_DECISION_fh_accept_t270_reconciled_run_invoke_design.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T062747Z_SELF_REVIEW_t270_reconciled_run_invoke_design.md

## Boundary

Delivery has two ordered milestones. The pre-P1 milestone publishes the exact
neutral owner-native request, result, refusal, and non-terminal contracts for
`run.invoke(invoke | start)`. It performs no public admission, selection,
handler call, event emission, or runtime effect and imports no M04 public
carrier. T-281 P1 composes those owner contracts into the private definition
family. Only then may the public runtime-integration milestone below resume.

Public ingress validates, admits, and transports one `run.invoke` request. The
admitted GTL program owns AF-11 through AF-16 ordering. `invoke` constrains its
`ActionCatalog` to one exact member function; `start` carries scope, target, and
until constraints. Both still pass AF-13 selection and AF-14 intent admission.

T-270 begins only after AF-13 has admitted a `NextActionProjection` and AF-14
has admitted a matching `ConstructionIntent`. It verifies the exact
program/function/view/binding/invocation-authority/intent join, consumes the
immutable T-255 handoff, T-271 plan, T-256 execution contexts, and T-267 static
admission, then derives one subordinate T-270 start-admission witness and admits
one `ExecutionBasis`. T-267 and the witness remain no-effect truth;
`ExecutionBasis` is the sole effect authority.

Runtime evidence returns to program-owned AF-16. A held F_H result remains a
truthful nonterminal for T-272. T-270 does not select work, evaluate closure,
admit capability truth, or project a public terminal directly from a raw
runtime result.

## Prime Contraction Input

Consume the accepted `PublicFunctionDefinition`, `PublicInvocation`,
`InvocationAuthority`, `WorkspaceBinding`, `GtlProgram`, `CatalogView`,
`NextActionProjection`, `ConstructionIntent`, T-255/T-256/T-267/T-271 carriers,
`ExecutionBasis`, and event-backed result truth. Derive one subordinate
`ProgramExecutionAuthoritySet`; do not promote it into a public/session/basis
authority.

Use a minimal admitted generic capability definition/grant/manifest fixture for
focused T-270 proof. T-268 final manifest aggregation is downstream and cannot
be a closure dependency of this generic authority join.

## Hard Break

- no `abg.operation.catalog.invoke` public authority;
- no GraphFunction-as-program or Module-as-program claim;
- no ingress-owned selection, orchestration, closure, or action evaluation;
- no caller-authored runtime authority;
- no mutation of T-267 or conversion of `effectsPermitted: false`;
- no compatibility, fallback, or profile-free route;
- no Consensus-specific branch;
- no T-270-owned capability inference or final manifest;
- no F_H response or continuation; and
- no direct raw runtime-result to public-terminal shortcut.

## Migration Checklist

- [x] superseded public identity and authority path are named
- [x] accepted One Surface input and output boundaries are named
- [x] retained compiler/interpreter carriers are named
- [ ] neutral owner-native run.invoke request/result/refusal/non-terminal contracts are admitted without public or runtime output
- [ ] reconciled three-view design receives independent F_H acceptance
- [ ] provisional runtime is reconciled to the accepted design
- [ ] old identity, fallback, and direct-selection paths are removed
- [ ] current operation family, schemas, SDK, CLI, and tests derive one truth
- [ ] implementation receives independent authority-path review

## Exit

The neutral contract milestone is complete when both variants have exact
owner-native request, result, refusal, and non-terminal schemas with stable
coordinates and malformed-input/output negatives, while M03 imports no M04
public-contract implementation. That milestone is a T-281 P1 input and does
not satisfy the runtime exits below.

1. Generic non-Consensus and unchanged Consensus programs use the same AF-14 /
   AF-15 authority join and T-255/T-267/T-271 execution path.
2. `invoke` and `start` share one `run.invoke` definition; neither bypasses
   AF-13 or AF-14.
3. Cross-program, nonmember, outside-view, noncallable, stale-program/view,
   stale-intent, stale-next-action, authority mutation, missing capability,
   compiler-chain drift, row/locus drift, and basis drift all refuse before an
   effect.
4. The exact T-267 value remains unchanged and no-effect. A subordinate T-270
   start-admission witness must match before the one `ExecutionBasis` is
   admitted; only that basis authorizes execution.
5. Completed, held, blocked, and runtime-failed outcomes remain distinct;
   completed evidence reaches AF-16 and held truth reaches T-272.
6. A T-270 hard-break scan proves the old `catalog.invoke` operation,
   second-start and profile-free fallbacks, and their old schemas, SDK rows, and
   CLI rows are absent. T-272 owns the separate `run.resume` and `fh.*` scan.
7. Focused semantic, GTL, packed, publication, governance, Prime, and design
   gates are green from one tree.

Existing, alternate, and temporary-workspace installed scenarios are T-276
proof, not T-270 closure work.
