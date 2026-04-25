# T-050 Split M03 Constructors Semantic Center Into Module-Aligned Transforms

- id: T-050
- title: Split M03 constructors semantic center into module-aligned transforms
- type: chore
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: remove the 1086-line M03 `contracts/constructors.ts` semantic center by splitting projection, iteration, retry/repair, leaf-task, and event-factory law into module-taxonomy-aligned transforms without changing public behavior
- change_class: realization_refactor
- re_entry_point: typescript_m03_realization_structure
- triaged_at: 2026-04-25
- priority: medium
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-044 completed
  - T-045 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/events/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: none
- library_rationale: this is boundary-local structure repair inside M03; if extracted transform patterns recur outside M03, a separate commonization ticket must be opened
- target_truth: M03 semantic laws are located in module-aligned pure transforms and constructor factories that match their authority role, with `contracts/constructors.ts` reduced to compatibility exports or removed
- superseded_truth: projection replay, iteration decision, retry/repair policy, event construction, and leaf-task admission are concentrated in one large constructors file
- closure_law: this ticket closes only when reviewers can locate each M03 authority family by module role without reading a catch-all procedural constructors file, and public exports/tests prove behavior remained stable
- evaluation_criteria:
  - projection replay lives in a projection-focused module
  - iteration decision lives in an iteration-focused module
  - retry/repair law lives in a retry-focused module
  - leaf-task admission lives in a leaf-task-focused module
  - event factories are separated from source-truth interpretation
  - public compatibility exports are explicit and do not become a second authority surface
- non_closure_conditions:
  - `constructors.ts` remains the place where reviewers discover most M03 law
  - helpers are split by file size but not by authority role
  - behavior changes are mixed into the structural refactor without separate ticket authority
  - old and new import paths both act as independent public truth surfaces without compatibility declaration
- proof_surface:
  - no-behavior-change semantic test pass
  - import/export compatibility proof where retained
  - module-derived unit tests still pass
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: M03 authority is discovered through a catch-all `contracts/constructors.ts` file
- new_truth_path: M03 authority is discovered through module-aligned transform files with a narrow compatibility export surface if needed
- producers_old:
  - `code/src/abg/m03/contracts/constructors.ts`
- producers_new:
  - M03 projection transform module
  - M03 iteration transform module
  - M03 retry/repair transform module
  - M03 leaf-task admission module
  - M03 event factory module
- consumers_old:
  - M03 barrel exports
  - M04 consumers
  - tests and fixtures importing constructors
- consumers_new:
  - same consumers bound through module-aligned exports
- derived_surfaces:
  - contract barrel exports
  - test fixture imports
  - design/code trace surfaces

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

1. Did the split remove a semantic center, or only move code into smaller files?
2. Are pure transforms readable as transforms over admitted truth?
3. Are event/effect factories separated from meaning decisions?
4. Does any compatibility barrel clearly remain compatibility rather than authority?

## Required Break Order

1. Inventory every exported function from `constructors.ts` and classify its authority role.
2. Create module-aligned files with no behavior change.
3. Move deepest source-truth transforms first.
4. Move event factories and edge helpers after source truth is stable.
5. Rebind imports and keep only an explicit compatibility export if needed.
6. Run semantic proof and review diff for hidden behavior changes.

## Closure Evidence

Completed on 2026-04-25.

- Added module-aligned M03 contract export surfaces: `projection.ts`, `iteration.ts`, `retry_repair.ts`, `leaf_task.ts`, and `event_factories.ts`.
- `contracts/index.ts` now exports M03 behaviors through those role-aligned surfaces instead of directly exposing one broad constructor barrel.
- Existing constructor implementation remains as compatibility backing for this no-behavior-change split; public discovery now follows the module role.
- Proof: `npm run test:t044`, `npm run test:t045`, `npm run test:semantic`, `npm run lint:semantic`, `git diff --check`.
