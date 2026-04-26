# T-067 Design ODD-Native Gap Triage As Graph-Function-Addressable Follow-Up Work

- id: T-067
- title: Design ODD-native gap triage as graph-function-addressable follow-up work
- type: spike
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: research-product-lab-abg-sufficiency
- change_intent: Define the lawful boundary where ABG exposes gap truth and downstream ODD/SDLC graph functions triage that truth into ticket or action work without ABG owning ticket-process semantics.
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-04-26
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-066 completed
- affected_boundary: `specification/requirements/abg/**`, `specification/requirements/product/**`, `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/gaps/**`
- intake_source: Operator goal note `comments/jim/goals_0426` item 2: `Gap -> Triage -> Ticket/TBD Action` as SDLC graph functions that close the ABG loop.
- library_usage: none
- library_rationale: this is a boundary-design ticket between ABG substrate and downstream ODD/SDLC application semantics.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M04_PUBLIC_GAPS_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md`
- target_truth: ABG exposes gap, hold, stop, continuation, and unresolved-observation truth as replay-derived projection. Triage is a downstream graph-function-addressable work boundary that may produce a ticket, action, deferment, or repricing decision under the downstream product and `TICKET_METHOD.md`.
- current_truth: TypeScript `gaps` is replay-derived and read-only, but the graph-function boundary for turning gap truth into triage work is not yet designed.
- closure_law: this ticket closes only when the design states what ABG owns, what downstream SDLC owns, how `Gap -> Triage` is addressed as graph-function work, and how ticket creation remains governed by `TICKET_METHOD.md`.
- evaluation_criteria:
  - gap projection remains read-only ABG/M04 observation
  - triage is modeled as an ODD graph function, not an imperative service method
  - ticket creation is described as downstream product behavior governed by `TICKET_METHOD.md`
  - ABG does not own ticket closure, priority, backlog state, or process mechanics
  - proof or follow-up tickets identify the minimal TypeScript test lane needed
- non_closure_conditions:
  - ABG runtime starts creating tickets as substrate law
  - `gen-gaps` mutates runtime truth or starts traversal
  - triage semantics are hidden inside M04 projection code
  - ticket/process authority conflicts with `TICKET_METHOD.md`
- proof_surface:
  - design derivation or ADR
  - optional requirements update if current product requirements are missing this boundary
  - downstream implementation tickets if code is required

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `specification/requirements/product/REQ-P-POLICY.md`
- `build_tenants/abiogenesis/typescript/design/M04_GAP_TRIAGE_GRAPH_FUNCTION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/README.md`

Result:

ABG gap observation remains read-only replay-derived substrate truth. Gap
triage is modeled as downstream graph-function-addressable product work, and
ticket creation or ticket mutation remains governed by the downstream product
and `TICKET_METHOD.md`.
