# T-034 Close TypeScript `M04` proof-hold projection as downstream-abbreviation misdiagnosis

- id: T-034
- title: Close TypeScript `M04` proof-hold projection as downstream-abbreviation misdiagnosis
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- closure_kind: misdiagnosis_noop
- source_ticket: B-030-TS
- build_tenant: typescript
- goal: typescript-tenant-m04-proof-hold-projection
- change_intent: Close the deferred TypeScript proof-hold ticket without implementation because it incorrectly made a downstream/product abbreviation into TypeScript `M04` substrate-owned stop/status law.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- dependencies:
  - B-030-TS backlog
  - T-018 completed
- intake_source: `B-030-TS` application to TypeScript exposed proof-hold as a still-missing public stop/status input.
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-25
- completed_at: 2026-04-25
- library_usage: none
- library_rationale: no reusable TypeScript implementation pattern is introduced because the ticket is closed as a scope diagnosis correction.
- authoritative_contract: TypeScript `M04` owns canonical typed public/control/runtime truth. Downstream systems may own product abbreviations and presentation labels such as `proof_hold`; those labels must not be forced into the `M04` substrate taxonomy by this ticket.
- governing_design:
  - build_tenants/abiogenesis/typescript/design/M04_LIVE_STATUS_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M04_MAXIMUM_AUTONOMY_GEN_START_DERIVATION.md
  - .ai-workspace/tickets/completed/B-030-TS-realize-typescript-m04-complete-start-callable-surface-and-stop-taxonomy-over-canonical-public-control-truth.md
- constitutional_requirements:
  - specification/requirements/product/REQ-P-POLICY.md
- target_truth: downstream products and wrappers can derive their own proof-hold abbreviations from canonical product policy/read-model truth without requiring TypeScript `M04` to publish `proof_hold` as a substrate-owned public stop class.
- superseded_truth: TypeScript has a mandatory `M04` proof-hold projection gap that must be closed before the callable-start and stop-taxonomy wave can proceed.
- closure_law: this ticket closes because the required work was mis-scoped. No TypeScript proof-hold projection is delivered or claimed here.

## Original Misdiagnosis

The original ticket treated Python's `proof_hold` projection as a missing
TypeScript `M04` public start/live-status stop class.

That diagnosis was too broad for the TypeScript `M04` boundary. The current
TypeScript live-status design already says proof-hold projection is outside the
first-slice `M04` projection wave. The corrected reading is stronger:

- `M04` should expose canonical typed public/control/runtime truth.
- Product policy and downstream read models may project hold meaning from that
  truth when they own that product behavior.
- Downstream systems own abbreviations, labels, exit-code doctrine, and local
  presentation vocabulary such as `proof_hold`.
- `M04` must not import a downstream abbreviation merely to make wrapper UX
  easier.

## Closure Result

`T-034` is closed without implementation.

The work item is not evidence that proof-hold semantics are impossible or
unwanted. It is evidence that this specific TypeScript `M04` implementation
ticket had the wrong ownership boundary.

Future work may still introduce canonical structured hold facts if a ratified
product policy surface requires them. That future work must not make the
downstream abbreviation itself the substrate-owned truth.
