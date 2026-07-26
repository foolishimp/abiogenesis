# T-276 - Prove Installed Consensus Workspace Scenarios

> **Current disposition (2026-07-25):** `completed_at_7722806d`.
> T-276 delivered one source-blind installed driver for three outcome families over
> three explicit workspace bindings. The historical X operation-count and
> steel-thread sequence below remains donor evidence only.

- id: T-276
- title: Prove installed Consensus across three workspace applications
- type: test
- ticket_category: implementation_migration
- status: completed
- implementation_hold: completed
- implementation_hold_ref: GOAL-035 ABG5-S05 and M05 Section 13
- implementation_hold_effect: >-
    prove only the packed ordinary-path Consensus Product through one driver;
    fixtures provide inputs and attributed worker output but own no panel,
    recursion, event, continuation, result, or closure behavior
- phase_status: s05_complete
- review_status: proxy_accepted
- proof_status: s05_green
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- delivery_phase: M5_frontier_4
- change_intent: >-
    Prove the packed candidate's ordinary Consensus contract across agreement,
    recursive dispute, and unresolved F_H escalation in existing, alternate,
    and caller-created temporary workspaces.
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design/
    M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md Section 13
- triaged_at: 2026-07-14
- created_at: 2026-07-14
- updated_at: 2026-07-25
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

## S05 Completion

Implementation commit `7722806d9f0c385a0cb009cc3885389c7156f731`
proves agreement, dispute-then-agreement, and unresolved F_H escalation in
existing, alternate, and temporary workspaces through one packed installed
driver. Two attributed profiles participate in every round. Separate installed
CLI processes preserve unresolved hold, response, continuation, result, and
replay truth. The same package also reaches the canonical callable through its
Program-owned One Surface action.

Consensus is `13/13`; complete M5 is `120/120`; M4 is `26/26`; the external
Product remains `36/36`; and two package archives reproduce exact bytes. The
bounded proxy decision
`20260725T013500Z_DECISION_proxy_accept_s05_and_advance_s06.md` accepts the
exact candidate. T-276 is complete.

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
  -> catalog.apply(overlay) admits one immutable program-composition artifact
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

### Event Calculus delivery rule

The steel thread measures semantic delivery rather than catalog presence. A
public command is not an Event Calculus event. Its effect becomes runtime truth
only when the semantic owner emits its declared events or when an immutable
owner-authoritative artifact is followed by the single generic
`public_operation_artifact_admitted` boundary event. The latter event carries
operation, structural definition-key, invocation, disposition, and artifact
identity and initiates only `public_operation_artifact_available`; it never
owns the operation result or traversal control.

`workspace.create`, `product.install`, `workspace.bind`, `catalog.apply`,
`product.materialize`, and `release.snapshot` are classified as Rule-B
operations. `workspace.bind` is the first implemented consumer. Its sunny-day
checkpoint is earned only when the binding artifact is written, the boundary
event is
admitted, replay produces the expected availability fluent, and
`project.read` exposes that replay-derived state identically on a second
replay. Pure `project.read` and `catalog.view` emit no event. `run.invoke` and
`result.assess` retain their owning runtime event families. No per-operation
artifact event, fixture-authored event, or filesystem-only success satisfies
this gate.

The installed governor treats `catalog.view` as pure narrowing and AF-10
`catalog.apply(overlay)` as the only program-composition boundary. The view
shall not carry an execution-program coordinate. The application result's
existing `targetRef + targetDigest` identifies the effective admitted GTL
program while its distinct `applicationRef` identifies the immutable
DeclarationApplication artifact. `run.invoke` may proceed only when replay
proves that exact artifact boundary and the selected GraphFunction is both a
member of the target program and retained by the same view.

For the bounded sunny overlay proof, the apply request cites one exact admitted
target GraphFunction and the public catalog-admission basis. AF-10 alone derives
the resulting program coordinate. The installed driver shall not import or
reimplement that derivation; an overlay with zero or multiple target functions
stops at typed `target_invalid` in this slice.

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
