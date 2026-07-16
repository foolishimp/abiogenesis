# T-272 - Connect F_H Response To Replay Continuation

- id: T-272
- title: Connect F_H open, response, run continuation, and continuation consumption
- type: bug
- ticket_category: implementation_migration
- status: active
- phase_status: reconciled_design_accepted_runtime_reconciliation_pending
- review_status: fh_accepted_for_implementation_independent_closure_review_pending
- proof_status: runtime_reconciliation_pending
- delivery_phase: DS-2 integration
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Replace the disconnected legacy escalation, five public F_H operations,
    and combined run.resume path with one engine-derived F_H lifecycle:
    interaction.respond admits actor truth, then run.continue consumes the
    exact replay-derived continuation for the current construction intent.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design M03/M04 F_H interaction and
    continuation boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-16
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-258
- priority: critical
- migration_strategy: inside_out_hard_break
- library_usage: extend
- governing_library: >-
    build_tenants/abiogenesis/typescript/code/src/abg/m03/runner/
    fh_interaction.ts
- dependencies:
  - completed T-258 carrier admission
  - completed T-267
  - accepted T-270 public invocation/admission design
- authority_refs:
  - specification/INTENT.md interactive start and gaps loop
  - specification/PRODUCT.md accepted 19-operation One Surface projection
  - specification/requirements/abg/REQ-R-ABG3-CCALL.md
  - specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md
  - specification/requirements/abg/REQ-R-ABG3-EVENTS.md
  - specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/product/REQ-P-POLICY.md
- ontology_ref: >-
    build_tenants/abiogenesis/typescript/design/
    ABIOGENESIS_PUBLIC_CONTROL_PLANE_ONTOLOGY.md
- ontology_commit: 59e9dce4f47c1a2b6e7cb9ef140dbae39ea4143c
- ontology_digest: f817a7e730bec935f053138e85cb09aa6e0f693e558eaf287be502803da20ee8
- t270_design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_PUBLIC_CATALOG_INVOCATION_AUTHORITY_BEHAVIOR_DESIGN.md
- t270_design_digest: 71076f364d06a9725b5482ee0cdc84e64d29a4c18447a5ab4c41e1b62ba7f430
- t270_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T062747Z_DECISION_fh_accept_t270_reconciled_run_invoke_design.md
- prime_contraction_refs:
  - PC-007
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M03_M04_FH_RUNTIME_CONTINUATION_BEHAVIOR_DESIGN.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260716T065807Z_DECISION_fh_accept_t272_reconciled_continuation_design.md
- design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260716T065807Z_SELF_REVIEW_t272_reconciled_continuation_design.md
- prior_design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260715T064437Z_DECISION_fh_one_truth_no_legacy_compatibility.md
- prior_design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260715T070554Z_SELF_REVIEW_t270_t272_runtime_remediation.md

## Boundary

The engine derives interaction basis, graph call, frame, vector, C-call,
request, source carriers, causation, and continuation from current admitted
runtime truth. Each operation consumes its existing
`PublicFunctionDefinition<K>`, one distinct `PublicInvocation<K>`, and one
operation-indexed `InvocationAuthority<K>`, then emits the generic
`PublicOperationAdmittedRuntimeEvent` before its semantic function runs.
`abg.operation.interaction.respond` then admits only actor-attributed response
truth through AF-18. A later, distinct `abg.operation.run.continue` invocation
consumes the replay-derived continuation through the admitted GTL program and
ABG through AF-17.

Response and continuation actors and capability grants are independently
admitted against their respective definitions and policies. They need not be
equal unless a declared interaction or continuation policy explicitly requires
that equality.

The continuation conserves the same `GtlProgram`, current
`ConstructionIntent`, immutable `WorkspaceBinding`, `ExecutionBasis`, pending
interaction, and run-local `Continuation`. `AF-17 continueExecution` may resume
only that current intent. Fresh post-disposition selection of another action
uses `AF-14 admitConstructionIntent` then `AF-15 invokeGraphFunction`; it is not
relabeled as continuation. A newer `ObservationSnapshot` or replay cursor under
unchanged authority is ordinary progress, not `basis_fork_detected`. The
freshness order is AF-11 model synthesis from admitted intent lineage, the
prior model when present, and admitted product truth; AF-12 then consumes that
`ProductAssetModel` plus mutable worksite/replay observation input to admit an
`ObservationSnapshot` and gaps; AF-13 finally evaluates the next action from
the admitted AF-12 result.

The existing dirty runtime wave is preserved as provisional realization
evidence. Its legacy operation identities and combined resume carrier do not
earn closure against the ratified ontology.

## Prime Contraction Input

Consume the existing admitted `GtlProgram`, `ConstructionIntent`,
`WorkspaceBinding`, `ExecutionBasis`, interaction, C-call, held receipt, and
run-local `Continuation` carriers, plus the existing public definition,
invocation, invocation-authority, and operation-admission families. Do not
create operation-specific request authority, a merged session controller, a
second execution-basis family, or a route-specific continuation aggregate.
F_H open, response admission, public continuation admission, and continuation
consumption remain separate lifecycle transitions over the same authority.

The existing `FhInteractionResumeAdmittedEvent` remains an internal ABG
lifecycle fact emitted only after a distinct `run.continue` ingress and exact
replay admission. It is not a public operation identity or a second
`Continuation` aggregate. The generic `PublicOperationAdmittedRuntimeEvent`
proves ingress; the interaction event separately proves successful AF-17
admission and resolves the open `Continuation` at that same transition before
the successor receipt. A later `FhInteractionOpenedEvent` opens another member
of the same aggregate family with causal linkage; no later duplicate resolution
transition, new continuation aggregate, or event family is introduced.

The local design must record its IACS, Promotion Test, recurrence result, and
before/after authority counts under ADR-044 before implementation.

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] ratified Ontology commit and digest are traced
- [x] `interaction.respond` and `run.continue` are separate design transitions
- [x] both operations traverse PublicFunctionDefinition, PublicInvocation,
      InvocationAuthority, and generic public-operation event admission
- [x] current-intent `AF-17` and new-action `AF-14/AF-15` paths are disambiguated
- [x] observation freshness is separated from authority-basis change
- [x] AF-11 consumes lineage, prior model, and product truth; AF-12 alone adds
      mutable worksite/replay input; AF-13 consumes the admitted AF-12 result
- [x] response and continuation actor/grant admission is independently scoped
- [ ] legacy `run.resume` and five public F_H operation identities are removed
- [ ] internal continuation-admitted truth is derived only from `run.continue`
- [ ] mixed legacy/current operation truth is rejected
- [ ] runtime proof exercises the separated public operations
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] ticket declares library usage and names the governing library or rationale
- [x] this ticket carries one TypeScript tenant lifecycle
- [x] accepted T-270 design digest and decision are bound and consumed
- [ ] ticket wording, product wording, code, contracts, and proof claims are reconciled before closure

## Design Self-Review

- Domain, sequence, and state views preserve one admitted GTL program, current
  construction intent, immutable workspace binding, execution basis,
  interaction, and replay continuation.
- No view permits `interaction.respond` to continue execution or decide
  closure.
- No view permits `AF-17` to admit or invoke a newly selected action.
- New actions cross `AF-14` and `AF-15`; fresh observations under unchanged
  authority enter AF-12 after AF-11 has synthesized from lineage, prior model,
  and admitted product truth; AF-13 then consumes AF-12 truth without a basis
  fork.
- Generic public-operation admission and internal continuation admission remain
  distinct replay facts; neither duplicates the `Continuation` aggregate.
- Both public operations consume the common definition/invocation/authority
  family and emit generic operation-admission truth before AF-18 or AF-17.
- Actor and grant equality across the two operations is conditional on declared
  policy, never inferred from interaction identity.
- The successful AF-17 admission event resolves the open continuation once at
  admission; a repeated F_H hold opens a causally linked successor and remains
  nonterminal.
- The public surface contains `interaction.respond` and `run.continue`; it
  contains neither `run.resume` nor five independent F_H operation identities.
- The independently accepted T-270 design is bound by exact digest and decision
  reference. Runtime reconciliation remains stopped until this reconciled T-272
  design receives explicit F_H acceptance.

## Exit

A real engine-held F_H call opens one public interaction. One
`interaction.respond` variant admits a response without continuing. A later
`run.continue` consumes the same replay continuation and current intent through
`AF-17`; any newly selected action crosses `AF-14/AF-15`. The same admitted GTL
program, workspace binding, execution basis, graph call, and lineage survive
the current-intent path. Forged authority refuses, while a fresher observation
under unchanged authority remains lawful progress.
