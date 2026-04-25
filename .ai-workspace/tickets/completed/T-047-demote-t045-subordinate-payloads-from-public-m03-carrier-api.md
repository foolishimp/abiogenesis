# T-047 Demote T045 Subordinate Payloads From Public M03 Carrier API

- id: T-047
- title: Demote T045 subordinate payloads from public M03 carrier API
- type: bug
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- source_ticket: T-045
- build_tenant: typescript
- goal: typescript-rc-authority-closure
- change_intent: repair the T045 carrier promotion defect where subordinate retry/repair and leaf-task payloads were exported as public top-level M03 contract types despite the IACS declaring only two new prime runtime families
- change_class: realization_refactor
- re_entry_point: typescript_m03_contract_realization
- triaged_at: 2026-04-25
- priority: high
- created_at: 2026-04-25
- updated_at: 2026-04-25
- dependencies:
  - T-042 completed
  - T-045 completed
- intake_source: Codex design-module-method governance review of the TypeScript build tenant on 2026-04-25
- affected_boundary: `build_tenants/abiogenesis/typescript/code/src/abg/m03/contracts/**`, `build_tenants/abiogenesis/typescript/design/M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md`, `build_tenants/abiogenesis/typescript/test_env/**`
- library_usage: none
- library_rationale: this is public M03 contract surface hygiene governed by the T045 IACS; no separate reusable helper library applies
- target_truth: T045 exposes only prime runtime carrier families and justified public variants; subordinate payload detail remains nested, private, or explicitly promoted by design authority
- superseded_truth: `RetryAttemptIdentity`, `RetryBudgetState`, `PromptRegenerationInput`, `ManifestRegenerationRef`, `ContinuationRepairLink`, `ParentRuntimeIdentity`, `LeafTaskEnvelope`, and `LeafTaskFailure` are exported as top-level public interfaces through `contracts/index.ts`
- closure_law: this ticket closes only when public exports match the T045 IACS promotion law, all consumers bind prime carriers or justified public variants, and no subordinate payload can be imported as independent M03 authority without a recorded promotion decision
- evaluation_criteria:
  - exported M03 contract API is inventoried against the T045 IACS prime/subordinate list
  - subordinate payloads are nested or private unless a promotion test is added to design
  - public consumers compile against prime carrier families instead of subordinate payload imports
  - package surface tests prove subordinate payload imports are unavailable or demoted
  - design and export barrel agree on what is public authority
- non_closure_conditions:
  - subordinate payloads remain exported through `contracts/index.ts`
  - downstream tests import subordinate payloads as standalone authority
  - promotion is justified only by current code convenience
  - carrier demotion breaks callers and is patched by re-exporting aliases without design authority
- proof_surface:
  - contract export inventory
  - TypeScript compile proof
  - module-derived carrier/API tests
  - negative proof for subordinate import or standalone construction where practical
  - `npm run test:semantic`
  - `git diff --check`

## Migration Declaration

- old_truth_path: subordinate payload interfaces are exported as top-level public M03 contract authority
- new_truth_path: only T045 prime carrier families and justified public variants are exported as public authority
- producers_old:
  - `code/src/abg/m03/contracts/carriers.ts`
  - `code/src/abg/m03/contracts/index.ts`
- producers_new:
  - T045 prime carrier constructors
  - T045 public carrier exports
  - design-recorded promotion decisions when any subordinate type must be public
- consumers_old:
  - M03 constructors and tests importing subordinate payloads directly
  - package consumers of `abg/m03/contracts`
- consumers_new:
  - M03 constructors consuming nested/private subordinate shapes
  - downstream consumers pattern-matching prime carrier families
- derived_surfaces:
  - package entrypoint exports
  - test fixture types
  - API documentation/readme surfaces if present

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

1. Does the public M03 API expose only prime authority or explicitly promoted public variants?
2. Can subordinate payloads still be imported and treated as standalone runtime truth?
3. Does the IACS explain every public exported carrier family?
4. Do tests prove the public export seam rather than only internal construction?

## Required Break Order

1. Inventory all exported T045 carrier names and consumers.
2. Classify each name as prime, public variant, nested subordinate, or private helper.
3. Remove or demote subordinate exports from the barrel.
4. Rebind internal consumers to nested/private types.
5. Add negative/public API proof that subordinate payloads do not stand as independent authority.

## Closure Evidence

Completed on 2026-04-25.

- `contracts/index.ts` no longer uses `export * from "./carriers.js"`.
- The M03 public contract barrel explicitly exports prime/public carrier families and omits T045 subordinate payload types.
- `constructLeafTaskFailure` is no longer exported through the public package surface; failed-event construction validates failure detail internally.
- Negative proof checks generated `contracts/index.d.ts` does not promote T045 subordinate payload type names.
- Proof: `npm run test:t045`, `npm run test:semantic`, `npm run lint:semantic`, `git diff --check`.
