# T-051 Centralize Runtime Event And Failure Admission Truth

- id: T-051
- title: Centralize runtime event and failure admission truth
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: replace duplicated runtime event-kind and failure-class admission lists across M03 and M04 with one M03-owned source of truth consumed by downstream projections and admission surfaces
- change_class: realization_refactor
- re_entry_point: typescript_m03_m04_runtime_admission_realization
- triaged_at: 2026-04-25
- priority: medium
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-018 completed
  - T-035 completed
  - T-045 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/live_status/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`
- target_truth: M03 owns runtime event-kind and failure-class literal/admission truth once; M04 imports and consumes that truth without re-declaring it
- superseded_truth: `RuntimeEvent` variants, manual `emit.ts` validation, M03 transport failure parsing, and M04 live-status admission repeat event/failure literal law in separate files
- closure_law: this ticket closes only when adding or changing a runtime event kind or failure class requires one authoritative M03 contract/admission change and downstream consumers fail closed or compile fail when not updated
- evaluation_criteria:
  - event kind values are exported from one M03 source
  - failure class values and parser/admitter are exported from one M03 source
  - M04 live status imports the M03 source truth instead of restating literals
  - `emit.ts` validation is table/schema driven or otherwise derived from the same closed variant truth
  - negative tests prove drift between M03 and M04 cannot be silently accepted
- non_closure_conditions:
  - M04 continues to carry its own `RUNTIME_EVENT_KINDS`
  - failure classes are repeated in multiple parser functions
  - event admission remains a large independent switch that can drift from carrier truth
  - tests cover only happy-path event emission and not admission drift
- proof_surface:
  - module-derived unit tests for event/failure admission
  - integration proof through live-status admission
  - negative drift proof for unknown event/failure values
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: runtime event-kind and failure-class literals are repeated across M03 carrier, M03 event admission, M03 transport admission, and M04 live-status admission
- new_truth_path: M03 contract/admission module publishes one closed literal/parser source consumed by M03 and M04
- producers_old:
  - `code/src/abg/m03/contracts/carriers.ts`
  - `code/src/abg/m03/events/emit.ts`
  - `code/src/abg/m03/transport/admission.ts`
  - `code/src/app/m04/live_status/admission.ts`
- producers_new:
  - one M03 runtime event-kind source
  - one M03 runtime failure-class source/parser
  - derived/table-driven event admission helpers
- consumers_old:
  - M03 event sink
  - M03 transport
  - M04 live status
  - M05 proof lanes reading events/status
- consumers_new:
  - same consumers importing M03-owned admission truth
- derived_surfaces:
  - live-status projection
  - stop taxonomy
  - result assessment
  - sandbox/live proof reports

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] recurring realization patterns are checked against existing library/commonization surfaces
- [x] ticket declares library usage and names the governing library or rationale
- [x] if the work exists in more than one build tenant, this backlog/active ticket carries only one tenant lifecycle and any sibling tenant work lives on its own suffixed ticket
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Functional Review Criteria

1. Is there one M03-owned event/failure admission source?
2. Does M04 consume that source rather than reconstructing literal lists?
3. Can carrier truth and validator truth drift independently?
4. Does unknown or stale event/failure truth fail closed at admission?

## Required Break Order

1. Inventory all runtime event-kind and failure-class literal declarations.
2. Publish M03-owned literal/parser source truth.
3. Rebind M03 event admission and transport admission.
4. Rebind M04 live-status admission.
5. Add negative drift proof and remove duplicated literal lists.

## Closure Evidence

Completed on 2026-04-25.

- Added M03-owned `RUNTIME_EVENT_KIND_VALUES`, `RUNTIME_FAILURE_CLASS_VALUES`, and `TERMINAL_KIND_VALUES`.
- M03 event admission consumes the central failure and terminal value sets.
- M03 transport runtime-failure admission consumes the central failure value set.
- M04 live-status admission consumes the central runtime event, failure, and terminal value sets instead of restating them.
- Proof: `npm run test:semantic`, `npm run lint:semantic`, `git diff --check`.
