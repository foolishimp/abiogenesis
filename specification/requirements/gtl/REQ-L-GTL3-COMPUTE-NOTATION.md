# REQ-L-GTL3-COMPUTE-NOTATION - Epistemology Over Ratified Ontology

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-07-11
**Derives from**: [SPEC_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md), [ODD_METHOD.md](/Users/jim/src/apps/specification_methodology/specification/standards/ODD_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [PRODUCT.md](../../PRODUCT.md), [REQ-L-GTL3-GRAPHFUNCTION.md](REQ-L-GTL3-GRAPHFUNCTION.md), [REQ-L-GTL3-GRAPHVECTOR.md](REQ-L-GTL3-GRAPHVECTOR.md), [REQ-L-GTL3-JOB.md](REQ-L-GTL3-JOB.md), [REQ-L-GTL3-EVALUATOR.md](REQ-L-GTL3-EVALUATOR.md), [REQ-L-GTL3-HOOKS.md](REQ-L-GTL3-HOOKS.md), [REQ-R-ABG3-FN-COMPOSITION.md](../abg/REQ-R-ABG3-FN-COMPOSITION.md), [REQ-R-ABG3-ASSURANCE.md](../abg/REQ-R-ABG3-ASSURANCE.md), [REQ-R-ABG3-PAYLOAD.md](../abg/REQ-R-ABG3-PAYLOAD.md), [T-143](../../../.ai-workspace/tickets/completed/T-143-define-gtl-compute-notation-types-over-ratified-carriers.md)

---

## Purpose

Define the GTL-facing epistemology over the ratified GTL ontology and ABG
runtime ontology without adding a new GTL topology object, ABG runtime carrier,
or execution target.

The notation exists so authors and tools can distinguish what exists from how
it is known. Ontology names the lawful carriers. Epistemology names the
knowledge states over those carriers: candidate production, evaluation
findings, ABG admission, ABG ledger/projection truth, assurance fold,
traversal transition, and downstream consequence projection.

## Scope

This requirement governs notation such as `fn<A, B>.C`, `transform.C`,
`evaluate.C`, and `consequence.C`, and the ontology/epistemology boundary those
terms rely on.

It is notation over existing GTL ontology and ABG runtime truth. It is not a
literal GTL language extension and not a second public carrier.

## Ontology Boundary

GTL ontology contains the authored language carriers:

- `Graph`
- `Node`
- `GraphVector`
- `Context`
- `Operator`
- `Evaluator`
- `Rule`
- `GraphFunction`
- `RefinementBoundary`
- `CandidateFamily`
- `ContractRef`
- `Role`
- `Job`
- `Module`

ABG runtime ontology contains interpreter-owned runtime truth, including:

- selected `abg.fn_composition`
- runtime events
- `Run`
- `GraphCall`
- `Frame`
- `ExecutionBasis`
- `AdvancementTransition`
- `IterationAdvanceDecision`
- `Continuation`
- payload admission and payload ledgers
- assurance projection and closure fold
- traversal transition and replay projection

Product ontology remains outside GTL and ABG. A downstream product may define
pressure maps, acceptance lenses, lifecycle registers, and domain read models,
but those meanings are product projections over ABG-admitted facts, not new GTL
or ABG ontology.

## Epistemic Boundary

The stable epistemic flow is:

```text
A
  -> transform.C
  -> candidate/evidence refs
  -> evaluate.C
  -> evaluation finding refs
  -> ABG admission
  -> ABG events, ledgers, assurance projection, traversal projection
  -> consequence.C
  -> product read-model interpretation
  -> B or lawful continuation
```

`C` is selected composition notation: the selected `abg.fn_composition`
contract identity for the owning boundary.

## Acceptance Criteria

**REQ-L-GTL3-COMPUTE-NOTATION-001**: GTL compute epistemology shall preserve the ratified ontology names. It shall not rename `Graph`, `Node`, `GraphVector`, `Context`, `Operator`, `Evaluator`, `Rule`, `GraphFunction`, `RefinementBoundary`, `CandidateFamily`, `ContractRef`, `Role`, `Job`, `Module`, or `abg.fn_composition`.

**REQ-L-GTL3-COMPUTE-NOTATION-002**: `fn<A, B>.C` shall be interpreted only as notation over a published `GraphFunction` bound by `Job`, optional realized `GraphVector` context, and selected `abg.fn_composition` identity.

**REQ-L-GTL3-COMPUTE-NOTATION-003**: `C` shall mean selected composition notation. It shall not introduce `ComputeUnit`, `ReliableCompute`, a topology anchor, a public callable carrier, an ABG runtime carrier, or an execution target.

**REQ-L-GTL3-COMPUTE-NOTATION-004**: Selected composition notation shall preserve the ABG composition contract ref, digest, host binding, declaration source, ordered regime bindings, standards context, policy context, carrier context, assurance context, deterministic closure contract, and optimization contract when present.

**REQ-L-GTL3-COMPUTE-NOTATION-005**: `transform.C` shall denote candidate and evidence production under the selected composition. It shall not emit runtime events, write ledgers, select traversal, or close a boundary.

**REQ-L-GTL3-COMPUTE-NOTATION-006**: `evaluate.C` shall denote an evaluation-set phase under the selected composition. Evaluation rules may produce deterministic registers, semantic findings, gain, metrics, close disposition proposals, residual pressure, continuation refs, evidence refs, authority refs, and diagnostics, but they shall not directly close, write, select, transition, or emit runtime truth.

**REQ-L-GTL3-COMPUTE-NOTATION-007**: ABG admission shall be the epistemic boundary where candidate/evaluation payloads become runtime facts. Before ABG admission, plugin and evaluator returns are proposed evidence, not event truth, ledger truth, projection truth, traversal truth, or closure truth.

**REQ-L-GTL3-COMPUTE-NOTATION-008**: `consequence.C` shall denote a projection reference over ABG-admitted state, assurance decision refs, traversal transition refs, and downstream read-model refs. It shall not be an independent action stage with authority to mutate runtime truth.

**REQ-L-GTL3-COMPUTE-NOTATION-009**: Regime-binding notation shall distinguish selected composition host from declaration source. Hook declarations, policy hooks, visible defaults, and templates may be sources of selected composition truth, but they shall not appear as owning composition hosts.

**REQ-L-GTL3-COMPUTE-NOTATION-010**: Regime-binding notation shall make non-`F_D` closure authority unrepresentable. `F_P` and `F_H` may construct, diagnose, repair, rank, supply evidence, judge, escalate, or stand absentia under ABG law, but they shall not claim closure authority.

**REQ-L-GTL3-COMPUTE-NOTATION-011**: Evaluation, admitted-state, and consequence notation shall carry selected composition ref and digest, or a causally linked composition selection ref, whenever the stage participates in an `abg.fn_composition` governed boundary.

**REQ-L-GTL3-COMPUTE-NOTATION-012**: ABG shall remain the owner of event emission, payload admission, ledger projection, assurance fold, traversal transition, continuation, closure, correction, and replay truth. GTL compute notation may point at those surfaces but shall not write them.

**REQ-L-GTL3-COMPUTE-NOTATION-013**: Product-specific pressure, gain meaning, and read-model interpretation shall remain product-owned projections over ABG-admitted facts. GTL compute notation shall not standardize downstream product strategy semantics.

**REQ-L-GTL3-COMPUTE-NOTATION-014**: Documentation, examples, and published tenant contracts that use the notation shall state that `Composition(...)` is display shorthand for selected `abg.fn_composition`, not a separate source of truth.

**REQ-L-GTL3-COMPUTE-NOTATION-015**: GTL compute notation shall expose compute plugin categories for `transform.C`, `evaluate.C`, and `consequence.C`. Each category shall preserve selected composition ref, digest, selection ref, regime binding ref when present, input carrier refs, output carrier refs, evidence refs, and non-authority flags proving the plugin cannot write ledgers, emit runtime events, select traversal, or close the boundary.

**REQ-L-GTL3-COMPUTE-NOTATION-016**: `plugin.transform.C` shall denote candidate/evidence computation, `plugin.evaluate.C` shall denote evaluation-rule computation inside the evaluation-set phase, and `plugin.consequence.C` shall denote consequence/read-model projection computation. These category names shall be used on public runtime observer and hook/action surfaces instead of the ambiguous `eval` stage name.

**REQ-L-GTL3-COMPUTE-NOTATION-017**: `F_H` shall be represented as an external human-callout compute category when it participates in composition. The category shall require `F_H`, shall state that human work is external to ABG, and shall require response admission before any human result can affect runtime truth.

**REQ-L-GTL3-COMPUTE-NOTATION-018**: ABG.system side effects shall appear between plugin compute categories. A product plugin may compute and return typed values or refs, but only ABG.system may admit them, write events, derive ledgers, fold assurance, select traversal, replay continuation, or close.

**REQ-L-GTL3-COMPUTE-NOTATION-019**: The deterministic event-sourced case shall be represented as a lawful reduction of the same composition notation. A fully `F_D` graph remains a program graph over ABG admission/events/replay, not a separate API or shortcut around selected composition identity.

**REQ-L-GTL3-COMPUTE-NOTATION-020**: `evaluate.C.F_D.register_rule[*]` shall be first-class evaluation work when declared by selected composition. Deterministic register rules may derive read-only shape, lineage, coverage, target-carrier, observed-state, and domain register facts, but their outputs remain proposed values until ABG admission.

**REQ-L-GTL3-COMPUTE-NOTATION-021**: `evaluate.C.F_P.semantic_judgment_rule[*]` shall evaluate over admitted transform truth plus admitted evaluation registers when ambiguity remains. F_P semantic judgment may propose disposition and residual pressure, but closure remains ABG-owned assurance fold truth.

**REQ-L-GTL3-COMPUTE-NOTATION-022**: Evaluation-set notation shall allow ordered and parallel rule batches only over read-only admitted facts. Replay identity shall derive from the selected composition identity, declared rule refs, batch/dependency refs, and admitted outcomes, not from wall-clock completion order.

**REQ-L-GTL3-COMPUTE-NOTATION-023**: A scalar `FpEvaluationOutcome` shall be treated as a lawful one-rule reduction of `evaluate.C`, not as a second public evaluation carrier or a product-local runtime loop.

**REQ-L-GTL3-COMPUTE-NOTATION-024**: Any composed `.C` stage shall be representable as a stage-set phase under selected composition. Scalar `transform.C`, `evaluate.C`, and `consequence.C` plugin calls shall be one-task reductions of the stage-set law, not privileged alternate execution paths.

**REQ-L-GTL3-COMPUTE-NOTATION-025**: `TraversalUnit<A, B>` shall be the GTL/ABG notation for one closeable traversal atom under selected graph-function execution, internal graph-vector boundary, selected composition, admitted attempt envelope, admitted stage outputs, assurance fold, consequence projection, traversal transition, and replay disposition. It shall not introduce a new GTL topology object, public callable carrier, plugin callback, overlay, registry, CLI command, or runtime controller.

**REQ-L-GTL3-COMPUTE-NOTATION-026**: Consequence bind shall mean `plugin.consequence.C` plus ABG consequence admission, traversal transition, and replay continuation. `plugin.consequence.C` alone shall not be described as owning bind, traversal transition, replay, closure, or next-unit selection.

**REQ-L-GTL3-COMPUTE-NOTATION-027**: A traversal unit shall be interpretable as a function over admitted intent-lineage truth: `traverse<A, B>(intent_lineage, context, A) -> (B, obligation_delta)`. The notation is a law over existing GTL/ABG carriers, not a new callable API. `intent_lineage` includes admitted intent refs, lineage refs, source and target carrier refs, materialization or output-allocation refs, carried obligation refs, residual pressure refs, and lawful basis refs. `obligation_delta` records how each carried obligation is realized, refined, deferred to a named downstream unit, blocked, repriced, preserved as no-close pressure, or discharged by terminal truth.

**REQ-L-GTL3-COMPUTE-NOTATION-028**: Consequence bind shall preserve intent-lineage and obligation conservation across traversal-unit composition. A close or next-unit selection is non-conformant when any carried obligation, target-carrier binding, materialization target, role requirement, staged-authority ref, or downstream terminal pressure disappears without admitted realization evidence, refinement, downstream deferral, block, re-entry, reprice, no-close preservation, or terminal projection.
