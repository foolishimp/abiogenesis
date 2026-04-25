# T-042 Design TypeScript M03 Generic Retry/Repair And Leaf-Task Governance

- id: T-042
- title: Design TypeScript M03 generic retry/repair and leaf-task governance
- type: feature
- ticket_category: ordinary
- status: completed
- goal: typescript-rc-authority-closure
- change_intent: declare the missing TypeScript M03 design authority for generic retry/repair law and bounded subordinate work before implementation or proof tickets open
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies: T-039 completed, T-043 completed
- affected_boundary: `build_tenants/common/design/`, `build_tenants/abiogenesis/typescript/design/`, `.ai-workspace/tickets/backlog/`
- intake_source: `T-039` requirement-to-TypeScript-design audit
- target_truth: common and TypeScript M03 design surfaces explicitly own retry/repair and leaf-task governance, including fresh attempt identity, current-state prompt/manifest truth, bounded retry budgets, subordinate runtime identity, and failure classification
- superseded_truth: retry/repair and leaf-task behavior are required by ABG but not yet carried by concrete TypeScript design authority and proof-lane declarations
- closure_law: this ticket closes only when shared versus tenant ownership is declared, carrier inventories and proof lanes are explicit, and any implementation/test work is carried by successor tickets rather than hidden in this design ticket
- evaluation_criteria:
  - common design ownership is declared or explicitly rejected for shared retry law
  - TypeScript design declares retry/repair and leaf-task carrier inventories or separates them into lawful sub-slices
  - required positive and negative proof lanes are named as successor work if not already covered
  - stale-manifest reuse, top-level leaf-task workflow drift, and in-place continuation mutation are rejected by design
- non_closure_conditions:
  - the ticket implements code or tests as part of its own closure
  - retry semantics live only in transport helpers, CLI loops, or package-local orchestration
  - leaf-task execution becomes a rival top-level workflow ontology
  - successor implementation/proof scope remains ambiguous
- proof_surface:
  - updated common module design if shared ownership changes
  - TypeScript design assets under `build_tenants/abiogenesis/typescript/design/`
  - successor implementation/proof ticket list or explicit no-op justification
  - `git diff --check`

## Walkthrough Gate

`T-043` completed the walkthrough and found no missing requirement authority
blocking this ticket. This ticket may open as design work only; implementation
or proof remains successor work unless already covered by an admitted ticket.

## Context

`T-039` found two active ABG requirement families without sufficient
TypeScript design ownership:

- `REQ-R-ABG3-RETRY`
- `REQ-R-ABG3-LEAFTASK`

Retry is not merely transport retry. It is substrate-owned retry/repair law
over fresh runtime identity, current-state prompt and manifest truth, bounded
attempt budgets, progress signal, and authoritative stop or escalation events.

Leaf-task governance is not arbitrary helper dispatch. It is bounded
subordinate work under parent runtime identity with schema-validated IO,
distinct failure classification, and replay-visible facts.

## Governing Requirements

- `specification/requirements/abg/REQ-R-ABG3-RETRY.md`
- `specification/requirements/abg/REQ-R-ABG3-LEAFTASK.md`
- `specification/requirements/abg/REQ-R-ABG3-CONTINUATION.md`
- `specification/requirements/abg/REQ-R-ABG3-CORRECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-EVENTS.md`

## Scope

Design the TypeScript/common M03 surface for:

- fresh attempt identity for retryable same-edge repair
- regenerated prompt/manifest truth from current workspace/runtime state
- bounded retry budget and stationary-failure stop or escalation
- continuation termination/reopen linkage for retry, repair, and correction
- bounded leaf-task input/output carriers
- parent-bound runtime identity for leaf-task execution
- leaf-task failure classification at runtime/payload boundary
- replay-visible events or authoritative parent-bound facts for leaf work

## Acceptance

- Common design explicitly owns `REQ-R-ABG3-RETRY` if it remains shared M03 law.
- TypeScript design declares one retry/repair carrier inventory and one
  leaf-task carrier inventory, or explicitly separates them into lawful
  sub-slices before implementation.
- The design rejects redispatching stale prompt or manifest truth as current
  truth.
- The design keeps leaf-task execution subordinate to the parent runtime
  boundary.
- The design declares proof lanes for fresh identity on retry and fail-closed
  stale manifest reuse.
- The design declares proof lanes for leaf-task failure classification without
  parsing probabilistic worker internals as domain truth.
- Successor implementation/proof tickets are created or confirmed if code or
  test work remains.

## Non-Closure Conditions

- Retry semantics live only in transport helpers, CLI loops, or package-local
  orchestration.
- Leaf-task execution becomes a rival top-level workflow ontology.
- Continuation/correction truth is mutated in place rather than closed and
  reopened by authoritative event truth.
- The design claims closure by test intent only, without declaring the carrier
  truth that proof must exercise.
- Implementation or test work is hidden inside this design ticket.

## Proof Surface

- Updated common module design if shared ownership changes.
- TypeScript design assets under `build_tenants/abiogenesis/typescript/design/`.
- Successor implementation/proof ticket list or explicit no-op justification.
- `git diff --check`

## Closure Evidence

- Common design ownership updated:
  - `build_tenants/common/design/module_decomp.md`
  - `build_tenants/common/design/modules/M03-engine-kernel.yml`
  - `build_tenants/common/design/design_surface_map.md`
- TypeScript derivation asset:
  `build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md`
- TypeScript first-slice IACS:
  `build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md`
- TypeScript structural carrier diagram:
  `build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_STRUCTURAL_CARRIER_DIAGRAM.md`
- Tenant design index updated:
  `build_tenants/abiogenesis/typescript/design/README.md`
- ABG module design now points at the concrete retry/repair and leaf-task
  design pack:
  `build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md`
- Successor implementation/proof ticket created:
  `.ai-workspace/tickets/backlog/T-045-realize-typescript-m03-retry-repair-and-leaf-task-governance.md`
