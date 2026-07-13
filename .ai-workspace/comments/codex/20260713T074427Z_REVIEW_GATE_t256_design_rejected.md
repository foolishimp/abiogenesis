# Review Gate: T-256 Design Rejected

## Verdict

`rejected_pending_bounded_repair`.

The prior acceptance interpretation is invalid. T-256 returns to design work.
The prototype remains uncommitted and must not advance until the repaired
design receives independent review and a new explicit F_H decision.

## Confirmed Findings

1. `sourceSchemaRef`, `sourceTypeRef`, and `appliesToRegime` duplicate truth
   that `REQ-R-ABG3-INSTRUCTION-ASSEMBLY-002/-003` requires the compiler to
   derive from admitted Node, C-program, stage, and composition carriers.
2. The design does not structurally map its declaration inputs into the
   canonical `InstructionAssemblyRule -> CompiledPromptPlan ->
   InstructionEnvelope -> PromptManifest` path. Without that bridge, the
   proposed request is a parallel instruction carrier.
3. The lifecycle validates stage truth before catalog-bound program
   resolution, while the sequence and blocked-capability law require the
   reverse order.
4. Serialized snake_case keys and decoded camelCase properties are presented
   as one supposedly exact wire vocabulary.
5. Lifecycle transitions omit their owning admission/compiler/interpreter,
   contrary to `DESIGN_MODULE_METHOD` section 5E.
6. Existing `ModuleLookupAuthority` resolves GraphFunctions and Jobs only; it
   cannot be cited as Rule or Node lookup authority without realization
   change.

## Repair Boundary

- Keep the existing ticket and architecture direction.
- Preserve T-255, T-267, and T-268 blocking.
- Retain one admitted runtime catalog and Module authority path.
- Reprice the profile as field-path declarations only; derive Node and regime
  truth.
- Make T-256 a compiler input adapter into the existing instruction assembly
  carriers, not a competing request path.
- Correct the three views and proof matrix before any implementation resumes.

## Prototype Disposition

The dirty implementation is preserved as a non-authoritative prototype. It
must be reconciled against the repaired design or discarded only after a later
accepted design ruling. No prototype code is admitted by this review.
