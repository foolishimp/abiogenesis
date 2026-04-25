# T-048 Replace Leaf-Task Open Payload Bags With Schema-Admitted Carriers

- id: T-048
- title: Replace leaf-task open payload bags with schema-admitted carriers
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: T-045
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: replace T045 leaf-task `Record<string, unknown>` payload truth with schema-admitted payload carriers so leaf input/output validation satisfies the IACS and TypeScript strict-lane guardrails
- change_class: realization_refactor
- re_entry_point: typescript_m03_leaf_task_realization
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-042 completed
  - T-045 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/**`, `build_tenants/abiogenesis/typescript/code/src/shared/validation/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: extend
- governing_library: `build_tenants/abiogenesis/typescript/code/src/shared/validation/**`
- target_truth: leaf-task input and output enter M03 as schema-admitted carriers or payload references, not as open JSON bags frozen after shallow object checks
- superseded_truth: `LeafTaskEnvelope.input` and `LeafTaskCompletedEvent.output` are `Readonly<Record<string, unknown>>`, constructors only freeze plain objects, and event admission only checks object shape
- closure_law: this ticket closes only when leaf-task input/output must pass explicit schema admission before dispatch/completion facts are admitted, and open object payloads cannot satisfy closure without schema truth
- evaluation_criteria:
  - leaf-task payload carriers name schema identity and admitted payload/result truth
  - constructors validate payloads against declared schema or require an admitted payload carrier
  - event admission rejects payloads that are merely plain objects
  - negative tests cover wrong schema, missing schema, and open object fallback
  - downstream tests and fixtures stop depending on raw `Record<string, unknown>` as semantic truth
- non_closure_conditions:
  - `Record<string, unknown>` remains the authoritative leaf input/output carrier
  - validation still means only plain-object detection
  - schema references are stored but not enforced
  - tests pass with arbitrary object payloads under a declared schema
- proof_surface:
  - module-derived unit tests for leaf-task admission
  - integration proof for parent-bound leaf-task completion
  - negative schema-admission proof
  - strict-lane proof
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: leaf-task input/output payloads are open object bags inside typed envelopes and completion events
- new_truth_path: leaf-task input/output payloads are admitted by schema before they become runtime/event truth
- producers_old:
  - `LeafTaskEnvelope.input`
  - `LeafTaskCompletedEvent.output`
  - `freezePayload(...)`
  - `assertRuntimeEvent(...)` plain object checks
- producers_new:
  - schema-admitted leaf-task input carrier
  - schema-admitted leaf-task output carrier or result reference
  - shared validation/admission helpers
- consumers_old:
  - M03 event emission
  - leaf-task tests and fixtures
  - runtime projection consumers
- consumers_new:
  - M03 leaf-task constructors
  - M03 event admission
  - M04/M05 projections and proof lanes consuming admitted payload truth
- derived_surfaces:
  - runtime events
  - aggregate projection
  - package fixtures
  - strict-lane/test-surface documentation

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

1. Does leaf-task payload truth have schema identity and admission proof?
2. Can an arbitrary plain object still pass as completed output?
3. Are payload references and payload values distinguished where full payload storage is not appropriate?
4. Does runtime event admission reject unadmitted object bags?

## Required Break Order

1. Inventory leaf-task input/output construction, event emission, event admission, and tests.
2. Publish the schema-admitted payload carrier or payload-reference contract.
3. Rebind envelope and completion event constructors to require admitted payload truth.
4. Rebind event admission to reject raw open object payloads.
5. Reprice fixtures and negative tests around schema admission rather than object shape.

## Closure Evidence

Completed on 2026-04-25.

- Added `AdmittedLeafTaskPayload` and `admitLeafTaskPayload(...)`.
- `LeafTaskEnvelope.input` now requires admitted payload truth.
- `LeafTaskCompletedEvent` now carries `outputPayloadRef` rather than an open output object.
- Leaf-task completion validates output schema admission before event construction.
- Negative proof rejects raw output payloads and schema-required-key misses.
- Proof: `npm run test:t045`, `npm run test:semantic`, `npm run lint:semantic`, `git diff --check`.
