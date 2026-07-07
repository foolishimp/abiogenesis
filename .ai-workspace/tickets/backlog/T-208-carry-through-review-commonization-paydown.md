# T-208 Carry-Through Review Commonization Paydown

- id: T-208
- type: chore
- ticket_category: ordinary
- status: backlog
- goal: hog-iteration-2-quality
- change_intent: consolidate the recurrence and parallel-truth seams confirmed
  by the T-205 carry-through workflow review (2026-07-08) that were classified
  cross-boundary and lawfully NOT absorbed into the active carry-through fix
- change_class: design_reframe
- re_entry_point: design_surface
- triaged_at: 2026-07-08
- created_at: 2026-07-08
- updated_at: 2026-07-08
- links: T-205 (carry-through applicability implementation + review rounds)

## Context

The T-205 principles review (4-lens workflow, adversarially verified) closed
its boundary_local findings in-wave. Three confirmed findings cross module
boundaries and are escrowed here per DMM 11B/11C — a third local rebuild of
any of these patterns is non-conformant by default.

## Items

1. Admission-support commonization (P5, third+ recurrence). The
   `{accepted, issues}` startup-admission scaffold and the verbatim
   `nonEmpty` type-guard exist at: `runner/c_call_handlers.ts`
   (admitHandlerRegistry), `contracts/temporal_property_runtime.ts`
   (admitTemporalPropertyStartup, typed-issue variant),
   `contracts/requirement_proof_carry_through_producer.ts` (now typed-issue),
   plus sibling predicates `isNonEmptyString` in `contracts/hog_program.ts`
   and `contracts/event_calculus.ts`. Extract one admission-support surface
   (shared result law, one non-empty/well-formed string guard, one
   finishAdmission). EXCLUDE `shared/validation/primitives.ts`
   nonEmptyStringSchema — it trims, a semantically different predicate;
   unifying it would change admission behavior.
2. T-188 test fixture family consolidation (P5). classificationTable /
   carryContract / envelope fixtures / startup-entry literals / admitted-event
   literals are duplicated across `test_t188_fold_gating_wiring.test.mjs` and
   `test_t188_requirement_proof_carry_through.test.mjs` (ref-string
   namespaces differ, bodies field-identical). Extract
   `test_env/tests/support/t188-carry-through-fixtures.mjs` (support/ is the
   established seam); ref differences become overrides. The shared
   startup-entry fixture must keep envelopeTemplate overridable.
3. requirements_route.ts coverage-prepend single seam (P3).
   `sourceTruthRefsByRequirementId` restates the coverage-ref prepend in two
   branches and silently drops refs for unbound requirements in
   multi-projection scope (fold outcome is still no_close_preserved by
   default, so no closure defect today). Hoist the merge to one seam and make
   the drop case an explicit decision. TRIAGE NOTE: if the decision is to let
   coverage-only refs survive for unbound requirements, check the behavior
   against `-013` before coding — that half may be requirement_reprice, not
   realization work.

## Acceptance

- one admission-support home consumed by all three startup admissions; the
  duplicated predicate deleted at every consumed site
- one fixture module consumed by both T-188 suites; duplicated fixture
  bodies deleted
- one prepend seam in sourceTruthRefsByRequirementId with the drop case
  explicit (comment or behavior, per triage)
- behavior-preserving throughout: t188 / t205 / semantic suites green with
  unchanged expectations except where triage explicitly repriced

## Non-closure

- a fourth local rebuild of any listed pattern
- unifying the trimming schema predicate with the admission guards
- absorbing the -013 behavior question silently into the seam hoist
