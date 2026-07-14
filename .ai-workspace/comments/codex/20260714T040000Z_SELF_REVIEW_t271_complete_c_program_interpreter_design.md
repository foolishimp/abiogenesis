# T-271 Complete C-Program Interpreter Design Self-Review

**Date**: 2026-07-14
**Ticket**: `T-271`
**Design**: `build_tenants/abiogenesis/typescript/design/M03_COMPLETE_C_PROGRAM_INTERPRETER_BEHAVIOR_DESIGN.md`
**Disposition**: `pass_with_repairs_applied`

## Review Basis

The review compared the design against:

- `REQ-L-GTL3-C-ALGEBRA-001..-017`;
- `REQ-R-ABG3-CCALL-001..-017`;
- `REQ-R-ABG3-FN-COMP-015/-021` after T-269;
- the T-259 workflow, T-260 batch, T-261 retry, and T-262 recurse contracts;
- `DESIGN_MODULE_METHOD` section 5E; and
- the T-271 boundary and exit conditions.

No interpreter implementation was written during this review.

## Findings And Repairs

1. **Workflow wire authority overclaim**: the first draft made workflow
   cardinality depend on child wire authority that T-259 deliberately records
   as uncertified. Repaired by deriving only parent terminality from authored
   structure while retaining `childOuterContractRef: null` and
   `childWireContractCertified: false`.
2. **Cross-view participant omission**: compiler, replay, interpreter, atom,
   event-admission, and effect owners appeared in the sequence but not the
   domain model. Repaired by adding every owner and its relationship.
3. **Compiler/runtime outcome conflation**: compile refusal was incorrectly
   grouped with runtime outcomes requiring a plan. Repaired with the prime
   `CProgramCompilationOutcome`; only `compiled` carries a plan.
4. **Synthetic nested wrapper C-calls**: directly wrapping the current T-260
   or T-261 adapter around a composite child would enclose several real calls
   in one synthetic call. Repaired by requiring a bounded factorization of
   batch/retry coordination from leaf/workflow C-call ownership. Direct forms
   remain observationally equivalent.
5. **Composition-row overconstraint**: a one-row-per-call rule would reject the
   existing lawful batch fixture, where one unique F_D governance row applies
   to several task loci. Repaired with unique-fibre selection first, exact
   order only for ambiguity, and a distinct compiled locus record for every
   call.
6. **Recurse leakage**: the first draft could be read as allowing a workflow
   cycle when an outer recurse relation existed. Repaired by rejecting all
   workflow-reference cycles; GraphFunction recurse remains a separate T-262
   relation joined later by T-267/T-270.

## Cross-View Result

- Exactly three ordered Mermaid views exist: `classDiagram`,
  `sequenceDiagram`, `stateDiagram-v2`.
- Mermaid CLI `11.3.0` rendered three non-empty SVGs.
- Every sequence participant is in the domain model or is the explicit
  external caller.
- Every lifecycle transition names its compiler, replay, interpreter, atom,
  event, projection, or external owner.
- Batch, retry, nested workflow, held, blocked, retry, replay refusal, and
  terminal paths are visible.
- Raw effect output has no path to completed truth without atom/event
  admission.
- The closed plan union contains exactly the seven-constructor realization
  variants and no recurse variant.
- `git diff --check` passed for the design draft.

## Remaining Implementation Risks

These are proof obligations, not design blockers:

- the structural cardinality fold must preserve explicit result-bearing leaves
  and terminal workflow semantics without inference from labels;
- the batch/retry factorization must preserve every existing direct-form test;
- replay cursor identity must include plan path, batch task, and retry attempt
  without creating a second C-call namespace; and
- T-252 may lose only the `complete_c_program_interpreter` gap after the real
  mixed/nested tests execute.

## Verdict

`pass`. The design is internally coherent, bounded to T-271, and ready for
delegated F_H acceptance. This verdict does not close T-271, T-267, T-270, or
DS-3.
