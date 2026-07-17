# T-276 - Prove Installed Consensus Workspace Scenarios

- id: T-276
- title: Prove installed Consensus across three workspace applications
- type: test
- ticket_category: ordinary
- status: active
- phase_status: early_red_installed_governor_proven_at_project_read_frontier
- review_status: steel_thread_governor_implementation_independently_accepted_closure_review_pending
- proof_status: packed_clean_install_16_missing_16_retired_zero_target_invocations
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: DS-4
- change_intent: >-
    Qualify the exact packed candidate through one public Consensus contract in
    existing, alternate, and caller-created temporary workspaces.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design M05 installed Consensus
    qualification boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-17
- owner: abiogenesis
- build_tenant: typescript
- source_ticket: T-268
- priority: critical
- dependencies:
  - T-267 declared-program conservation
  - T-268 admitted tenant-conformance manifest coverage
  - T-270 public catalog/start router
  - T-271 complete C-program interpretation
  - T-272 F_H continuation lifecycle
  - T-274 installed Consensus publication
  - T-275 attributed profiles and result projection
- authority_refs:
  - specification/requirements/product/REQ-P-CONSENSUS-013..018
  - specification/requirements/product/REQ-P-SCENARIOS-005
  - specification/requirements/product/REQ-P-QUAL-061
- prime_contraction_refs:
  - PC-008
- governing_prime_design_ref: >-
    build_tenants/abiogenesis/typescript/design/adrs/
    ADR-044-prime-contraction-is-a-cross-boundary-design-gate.md
- design_ref: >-
    build_tenants/abiogenesis/typescript/design/
    M04_M05_INSTALLED_CONSENSUS_SCENARIO_PRIME_CONTRACTION_BEHAVIOR_DESIGN.md
- design_acceptance_ref: >-
    .ai-workspace/comments/codex/
    20260714T154500Z_DECISION_fh_authorize_remaining_t277_refactor.md
- prime_design_self_review_ref: >-
    .ai-workspace/comments/codex/
    20260714T162000Z_SELF_REVIEW_t277_pc008_scenario_factorization.md
- steel_thread_governor_design_digest: >-
    1cca67612f32171edcaf597c0ec98f1208481d577f5496e097b5f6ff07e7d636
- steel_thread_governor_independent_review_ref: >-
    .ai-workspace/comments/codex/
    20260717T050121Z_DECISION_fh_accept_t276_steel_thread_governor.md
- steel_thread_governor_implementation_commit: 42db6661
- current_frontier_checkpoint_ref: >-
    .ai-workspace/comments/codex/
    20260717T061159Z_CHECKPOINT_t276_governor_t281_registry_link.md

## Boundary

Invoke the packed, installed SYSTEM-owned Consensus GraphFunction through
`abg.cli` over one real ticket and at least two differently attributed reviewer
profiles. Run agreement, material dispute with recursion, and exhausted or
unresolved dispute with F_H escalation through existing, alternate, and
temporary workspace applications of one public contract.

Fixtures provide inputs and attributed external ignition only. They do not
orchestrate the panel, invoke workers directly, emit events, construct
continuations, retry traversal, mutate tickets, or import mutable source.

## Delivery Governor

The caller-created temporary-workspace application is the early red-to-green
DS-2/DS-4 steel thread. It starts before this ticket can close and uses the
same source-blind installed driver required by the final proof:

```text
packed candidate
  -> clean temporary install
  -> preflight exact packed 19-operation family
  -> workspace.create(clean)
  -> workspace.bind
  -> catalog.admit
  -> project.read(catalog_list/catalog_describe) resolves Consensus
  -> catalog.view(allowlist)
  -> run.invoke(invoke) through installed abg.cli
  -> admitted result and replay
  -> project.read(ticket_consensus)
  -> typed CLI outcome
```

Before T-281 P1/P2, the source-blind packed-family preflight may stop only on
the typed first missing target coordinate and invokes no target operation. The
thread cannot publish or consume a partial operation family, fall back to the
retired operation roster, or treat a fixture-authored terminal result as
progress. Every current DS-2/DS-4 implementation checkpoint records whether it
removes, advances, or preserves that exact frontier.

The accepted early-red implementation proves that boundary from a clean pack
and detached install. The current candidate has 16 missing target identities,
16 retired identities, and zero target or workspace invocations. Those values
are a measured delivery frontier, not an installed-product success claim.

The first green thread is the non-escalation/converged path. The unresolved
F_H extension reuses the same driver and adds only
`interaction.respond(answer_escalation) -> run.continue(current_intent)`; it
is not a second harness. Application-specific installed-fixture provisioning
produces one uniform `InstalledWorkspaceApplication`; existing, alternate, and
temporary applications then follow the same Consensus driver before T-276
closes.

## Prime Contraction Input

Use one source-blind parameterized installed scenario driver. Existing,
alternate, and temporary workspaces are applications of one contract; outcome
families are fixture parameters, not separate orchestrators. The proof design
must decide whether three paired runs prove workspace invariance or whether all
nine combinations are required. Either way, one driver owns setup and
observation while every execution retains its own archive and exact basis.

The local design must record its IACS, Promotion Test, recurrence result, and
implementation/execution counts under ADR-044 before scenario code.

## Exit

All three outcome families and all three workspace applications expose typed
result and replay evidence tied to the exact installed product, catalog,
Module, tenant-conformance manifest, profiles, subject, and policy. Malformed
subjects, profiles, findings, rulings, policies, and outcomes remain typed
non-close truth. Accept the installed-proof design before building scenarios.
