# T-143 Define GTL Compute Notation Types Over Ratified Carriers

- id: T-143
- title: Define GTL compute notation types over ratified carriers
- type: feature
- ticket_category: realization_refactor
- status: completed
- review_status: passed
- build_tenant: typescript
- goal: disambiguate-gtl-abg-epistemology-without-renaming-ontology
- change_intent: Add a small TypeScript type surface that expresses `fn<A, B>.C`, `transform.C`, `evaluate.C`, and `consequence.C` as notation over existing `GraphFunction`, `Job`, `GraphVector`, and selected `abg.fn_composition` truth.
- change_class: design_reframe
- re_entry_point: design
- triaged_at: 2026-05-22
- created_at: 2026-05-22
- updated_at: 2026-05-22
- completed_at: 2026-05-22
- governance_scope: STDO Method
- governance_scope_expansion:
  - S: `SPEC_METHOD.md`
  - T: `TICKET_METHOD.md`
  - D: `DESIGN_MODULE_METHOD.md`
  - O: `ODD_METHOD.md`
- priority: high
- dependencies:
  - T-134
  - T-135
  - T-141
- affected_boundary: `specification/PRODUCT.md`, `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md`, `specification/requirements/gtl/README.md`, `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md`, `docs/USER_GUIDE.md`, `docs/LLM_GTL_APP_BUILDER_GUIDE.md`, `docs/README.md`, `docs/ABIOGENESIS_RC_NOTES.md`, `docs/ABIOGENESIS_RC_RELEASE_NOTE.md`, `README.md`, `build_tenants/abiogenesis/typescript/code/src/gtl/m02/contracts/**`, `.ai-workspace/comments/codex/20260522T103912Z_ANALYSIS_reliable_compute_model_syntax_review.md`
- target_truth: GTL-facing TypeScript types expose the epistemic notation over ratified GTL/ABG carriers without introducing a new public topology object, runtime carrier, or execution target.
- superseded_truth: Agents infer whether `F_D`, `F_P`, `F_H`, transformer output, evaluator output, ABG ledgers, assurance decisions, and downstream read models are distinct authority surfaces.
- closure_law: Closes only when the type surface compiles, is exported through the existing GTL module surface, keeps `C` as notation for selected `abg.fn_composition`, preserves ABG ownership of writes and ledgers, and has no runtime behavior change.
- requirement_authority:
  - REQ-L-GTL3-GRAPHFUNCTION
  - REQ-L-GTL3-JOB
  - REQ-L-GTL3-GRAPHVECTOR
  - REQ-L-GTL3-OPERATOR
  - REQ-L-GTL3-EVALUATOR
  - REQ-R-ABG3-FN-COMPOSITION
  - REQ-R-ABG3-ASSURANCE

## Problem

GTL and ABG already have the ontology and runtime carriers. The ambiguity is
epistemic: agents need one typed way to distinguish candidate production,
evaluation facts, ABG admission, ABG ledger projection, assurance decisions,
traversal transitions, and downstream read-model interpretation.

The type surface must not rename correct carriers or introduce a `ComputeUnit`
object. `C` is notation for selected `abg.fn_composition` at the owning GTL
boundary.

## Scope

- Add type-only GTL notation carriers for selected composition, stage roles,
  candidates, evaluations, admitted state refs, and consequence projection refs.
- Export the types through the existing GTL M02 contracts surface.
- Keep all ABG write/ledger authority outside GTL.
- Keep package/runtime behavior unchanged.

## Non-Goals

- Do not add a new GTL topology object.
- Do not add a new execution target.
- Do not rename `GraphFunction`, `Job`, `GraphVector`, `Operator`,
  `Evaluator`, `Rule`, `Context`, or `abg.fn_composition`.
- Do not introduce a new ABG runtime carrier.
- Do not change artifact schemas or ODD SDLC runtime behavior.

## Required Break Order

1. Add the type-only notation surface under GTL M02 contracts.
2. Export it through the existing M02 contracts index.
3. Add type regression coverage for impossible composition/evaluation states.
4. Verify semantic TypeScript build.
5. Verify semantic lint for the affected surface.
6. Record closure evidence.

## Impacted Interface Review Checklist

- [x] `C` is typed as selected composition notation, not a public object.
- [x] `Composition(...)` remains shorthand over `abg.fn_composition`.
- [x] `transform.C` emits candidates/evidence.
- [x] `evaluate.C` emits constrained evaluation finding refs, not closure-shaped
  boolean satisfaction.
- [x] `consequence.C` is a projection ref over ABG-admitted state and preserves
  selected composition identity.
- [x] Plugins are typed regime-bound steps, not write owners.
- [x] ABG remains owner of events, ledgers, writes, closure, continuation, and replay truth.
- [x] Downstream product pressure remains product read-model meaning over ABG-admitted facts.
- [x] Only `F_D` regime bindings can type closure authority.
- [x] Composition host kind is distinct from declaration source/hook kind.
- [x] Type regression rejects non-`F_D` closure authority.
- [x] Type regression rejects hook surfaces as selected composition hosts.
- [x] Type regression rejects boolean evaluator closure and admitted/consequence refs without selected composition identity.

## Post-Review Repairs

- Replaced independent `authority: "closure"` with a discriminated
  `GtlCompositionRegimeBinding` union so non-`F_D` bindings cannot claim
  closure authority.
- Replaced generic evaluator `satisfied: boolean` output with constrained
  evaluation finding refs carrying close disposition, residual pressure,
  continuation, evidence, authority, and composition identity refs.
- Added composition ref, digest, and selection ref to admitted state and
  consequence projection refs.
- Split selected composition host binding from declaration source so hooks do
  not appear as owning composition hosts.

## Specification Method Repair: 2026-05-22

Post-closure review found the code/type slice had outpaced its product,
requirement, and documentation authority. The repair expands T-143 from a
narrow TypeScript type proof into the full epistemology-over-ontology surface.

Added and aligned:

- `specification/requirements/gtl/REQ-L-GTL3-COMPUTE-NOTATION.md` now defines
  the full ontology/epistemology boundary:
  - GTL ontology: `Graph`, `Node`, `GraphVector`, `Context`, `Operator`,
    `Evaluator`, `Rule`, `GraphFunction`, `RefinementBoundary`,
    `CandidateFamily`, `ContractRef`, `Role`, `Job`, and `Module`.
  - ABG runtime ontology: selected `abg.fn_composition`, runtime events,
    `Run`, `GraphCall`, `Frame`, `ExecutionBasis`,
    `AdvancementTransition`, `IterationAdvanceDecision`, `Continuation`,
    payload admission, payload ledgers, assurance projection, closure fold,
    traversal transition, and replay projection.
  - Epistemic flow:
    `A -> transform.C -> candidate/evidence refs -> evaluate.C -> finding refs -> ABG admission -> events/ledgers/projections -> consequence.C -> product read model -> B or lawful continuation`.
- `specification/PRODUCT.md` now carries the same ontology/epistemology surface
  as product law.
- `specification/requirements/abg/REQ-R-ABG3-FN-COMPOSITION.md` now states that
  ABG interprets `fn<A, B>.C`, `transform.C`, `evaluate.C`, and
  `consequence.C` as epistemic notation over selected `abg.fn_composition`,
  not as a new ABG carrier, execution target, closure path, ledger writer, or
  controller surface.
- `docs/USER_GUIDE.md`, `docs/LLM_GTL_APP_BUILDER_GUIDE.md`, `docs/README.md`,
  `docs/ABIOGENESIS_RC_NOTES.md`, `docs/ABIOGENESIS_RC_RELEASE_NOTE.md`, and
  `README.md` now expose the same boundary for humans and agent builders.
- Type and test headers now reference `REQ-L-GTL3-COMPUTE-NOTATION`.

This preserves the existing ontology and clarifies how claims become known and
authorized over it. It does not add runtime behavior.

## Closure Evidence

- [x] `npm run test:t143`
  - pass: 1 test
- [x] `npm run build:semantic`
- [x] `npm run lint:semantic`
- [x] `npx eslint --max-warnings=0 test_env/tests/test_t143_gtl_compute_notation_types.test.mjs`
- [x] `git diff --check`

Specification repair proof on 2026-05-22:

- [x] `npm run test:t143`
- [x] `npm run build:semantic`
- [x] `npm run lint:semantic`
- [x] `npx eslint --max-warnings=0 test_env/tests/test_t143_gtl_compute_notation_types.test.mjs`
- [x] `git diff --check`

## Closure Review

Closed for release inclusion on 2026-05-22.

- The exported notation is type-only and adds no runtime execution target.
- `C` remains notation over selected `abg.fn_composition`; it is not a new GTL
  topology object or public ABG carrier.
- The type regression locks the review fixes: non-`F_D` closure authority,
  hook-as-host declarations, closure-shaped boolean evaluation, and missing
  selected-composition identity are compiler-rejected states.
- Active ticket surface is empty after this closure.
