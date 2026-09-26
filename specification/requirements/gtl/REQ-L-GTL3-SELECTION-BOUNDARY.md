# REQ-L-GTL3-SELECTION-BOUNDARY — Structural Selection And Program Construction Boundary

**Status**: Active
**Category**: Constraint / Guarantee
**Date**: 2026-04-05
**Updated**: 2026-09-26
**Derives from**: [SPEC_METHOD.md](stdo://releases/v2.5.1-rc.1/standards/SPEC_METHOD.md), [INTENT.md](../../INTENT.md) INT-001, [ODD_METHOD.md](stdo://releases/v2.5.1-rc.1/standards/ODD_METHOD.md), [PRODUCT.md](../../PRODUCT.md#program-construction-boundary)

---

## Purpose

Define lawful structural selection and the task-to-Program construction
relation without hidden choice. Construction produces ordinary GTL above the
interpreter; it does not lower admitted GTL or supply runtime truth.

## Acceptance Criteria

**REQ-L-GTL3-SELECTION-BOUNDARY-001**: GTL may expose candidate families, interface equivalence, tags, and policy hints at a structural selection boundary.

**REQ-L-GTL3-SELECTION-BOUNDARY-002**: GTL shall not embed hidden workflow choice, business priority, or engine strategy.

**REQ-L-GTL3-SELECTION-BOUNDARY-003**: Selection belongs to deterministic rule execution, probabilistic contextual analysis, human judgment, or higher intent/business logic above the interpreter.

**REQ-L-GTL3-SELECTION-BOUNDARY-004**: The interpreter may enumerate lawful candidates. It shall not silently choose the best one.

**REQ-L-GTL3-SELECTION-BOUNDARY-005**: Candidate families shall preserve one explicit outer contract across all lawful candidates.

**REQ-L-GTL3-SELECTION-BOUNDARY-006**: `policy_hints` are visible to external evaluators and consumers. They are not executable selection semantics.

**REQ-L-GTL3-SELECTION-BOUNDARY-007**: A published `GraphFunction` bound by a semantic `Job` is a public callable carrier, not an implicit candidate-family alternative.

## Program Construction Calculus

This section owns the detailed construction contract selected by Product.
Symbols denote semantic views of existing subjects, not new API schemas,
runtime entities, services or stores. The equations constrain any selected
realization; they do not require one actor, event or workflow stage per equation.
An implementation of a general preprocessor needs its own Product grant.

### Basis And Interpretation

**REQ-L-GTL3-SELECTION-BOUNDARY-008**: Construction shall bind one explicit
basis and retain the original task's meaning through its decomposition.

| Symbol | Meaning |
|---|---|
| `T` | Task input, requested outcome, permitted scope and completion condition, as defined by the [execution calculus](../../PRODUCT.md#execution-and-context-calculus). |
| `K` | Applicable source constraints, reference-frame declarations, policies and owner rulings, with exact source identities. |
| `Q` | Relevant immutable observations of the mutable workspace, with their current, superseded or unknown dispositions. |
| `V` | Admitted assets, execution facts and judgments available for this use, with their provenance, support and invalidation conditions. |
| `F` | Available GraphFunction contracts and publication identities from the existing catalog. |
| `M` | Source-linked obligation model: conditions, dependency and alternative relations, evidence duties, applicability and explicit unresolved meaning. |
| `R` | Residual obligations and unresolved relations derived from that model and the current basis. |
| `U` | The bounded part of the residual selected for the next attempt, including required prerequisites. |
| `p` | Candidate ordinary GTL Program; `P` denotes it only after the existing owners admit it for execution. |

```text
Σ = (T, K, Q, V, F)
interpret(T, K) -> (M, unresolvedMeaning)
faithful(M, T, K)  requires  Φ_M ≡ Φ_T under K
```

`Φ_T` is the task owner's completion predicate. Equivalence is a semantic
obligation: a decomposition cannot remove a source condition, strengthen it
without authority, or substitute its own easier outcome. `M` preserves source
routes, conjunctions, alternatives, conditions, temporal dependencies,
qualifications and evidence roles. An unclassified source clause remains
visible uncertainty; it does not disappear because no graph node names it.
Discovered obligations may refine `M` without changing the original contract.
An intentional change to that contract follows its owner's re-entry.

Explicit typed relations can be processed mechanically. Interpreting open
prose, resolving ambiguous meaning or judging the adequacy of decomposition
requires its declared semantic judgment. A partial model can support bounded
discovery; it cannot establish complete source coverage. Indexed axioms route
to exact source meaning and supporting dependencies; the index does not decide
applicability or certify that interpretation.

### Residual And Increment Selection

**REQ-L-GTL3-SELECTION-BOUNDARY-009**: Residual derivation shall distinguish
established satisfaction from missing work, missing evidence and unresolved
meaning, and preserve the original completion relation.

```text
R_Σ = residual(M, Q, V)
eval(M, V ∪ X, Q) = eval(R_Σ, X, Q)
    [for extensions X preserving the support used to derive R_Σ]
(U, carriedResidual) = selectIncrement(R_Σ, declaredPolicy)
```

`eval` preserves true, false and unknown outcomes and their reasons, including
conflicting evidence. The reduction equation is a conservation condition over
already interpreted relations, not a proof of arbitrary natural language.
Its discharged premises retain their support refs. A relevant invalidator
requires affected residuals to be re-derived before reliance.

Evidence roles remain distinct under the
[requirements algebra](../abg/REQ-R-ABG3-REQUIREMENTS-ALGEBRA.md): an artifact,
its construction inputs, execution observations and semantic assessment do not
prove one another. A present artifact with missing execution evidence normally
creates an execution/evaluation obligation; missing evidence alone does not
establish that reconstruction is needed. Contradictory behavior may warrant a
repair within the unchanged task contract. It does not itself require changing
that contract.

`U` may select construction, execution, evaluation, discovery or an owner
decision. It retains the dependencies needed for that attempt; unselected
obligations remain in `carriedResidual`. Applicable predicates determine
required evaluations: true retains the duty, false permits exclusion with its
basis, unknown retains the uncertainty and withholds the dependent claim.
Selection examines the governing predicates, not only a caller-supplied list
of preferred frames. Required independent judgment is preserved.

A missing prerequisite can itself be selected as work. Unknowns block only
the claims or effects that depend on them; they do not prohibit lawful
investigation elsewhere. Satisfying `U` alone does not complete `T`. Alternative
branches and conditional duties retain their logic; residual reduction is not
subtraction from a flat checklist or a requirement-count score.

### Contract-Based Composition

**REQ-L-GTL3-SELECTION-BOUNDARY-010**: A constructed Program shall justify
its selected work through exact GraphFunction contracts and explicit bindings.

```text
contract(g) = (inputs, preconditions, outputs, effects,
               contextNeeds, evidenceDuties, declaredOutcome)
compose(F, U, Σ) -> (p, correspondence, gaps)
eligible(p, Σ) = lawfulGTL(p)
                 ∧ compatibleBindings(p, Σ)
                 ∧ permittedEffects(p, T, K)
                 ∧ conservedDuties(p, U, K)
                 ∧ warrantedCorrespondence(p, U, Σ)
```

The tuple projects existing [GraphFunction](REQ-L-GTL3-GRAPHFUNCTION.md),
interface, effect, context and proof declarations. It introduces no rival
function registry. `declaredOutcome` is a promise to attempt/establish the
contracted result through execution and evaluation, not a fact about a future
Run. The correspondence binds each selected obligation or prerequisite to its
proposed producer, evaluation, reuse or explicit gap.

For every required input, the Program binds an admissible supplied value or
the declared output of a predecessor/child relation. A future output is a
dependency, not a fabricated present asset. Type compatibility alone does not
prove semantic substitutability, provenance, authority or applicable evidence
sufficiency. Matching names or prompts is insufficient. Preconditions that
depend on runtime observations are established at their owning boundary before
the dependent effect; conditional paths preserve refusal and unknown outcomes.
Declared iteration and recursion retain GTL's existing termination and fold law.

Composition can select an existing Program, recompose compatible functions or
specialize declared parameters. If no available function can establish a
needed relation, return a capability gap or select authorized function-authoring
work. A newly authored function passes its owning publication, validation and
qualification duties before use; missing implementation is never hidden in an
adapter or prompt. Graph granularity follows consequential dependencies and
required independence, not a mandatory node per document or lifecycle label.

### Context Declaration And Actual Binding

**REQ-L-GTL3-SELECTION-BOUNDARY-011**: Construction shall declare the context
needed by each selected computation; actual context shall bind progressing
inputs and applicable evidence at that computation's invocation boundary.

```text
needs(c) = relevant closure of declared input, frame, constraint
           and supporting-evidence dependencies for computation c
bind(needs(c), currentInput_c, admittedState_c, currentBasis_c)
    -> selectedMaterial_c | explicit context gap
```

The owning [role-specific context calculus](../../PRODUCT.md#role-specific-context)
governs selection and rendering. Construction identifies required relations;
it does not snapshot the entire prospective Run or copy all history into every
instruction. A dependency closure preserves qualifications, exceptions and
unresolved meaning and retains evidence needed for the selected question,
including applicable counterevidence. Missing or unknown required dependencies
remain visible. Exact shared references must be accessible to the actor.
Each role receives a congruent question, operation grant and response contract.
The current consumer input comes from its actual declared producer; graph-entry
input and equal bytes cannot substitute for that relation.

### Admission, Iteration And Completion

**REQ-L-GTL3-SELECTION-BOUNDARY-012**: Construction results shall remain
proposals until their respective owners admit them. Iteration shall preserve
completed work, history, task meaning and the original completion predicate.

```text
construct(Σ) -> candidate(p, U, carriedResidual, correspondence, gaps)
             | established(completionEvidenceRefs)
             | gap(residual, cause, owningBoundary)

candidate p -> existing validation/publication/admission -> (P, B)
(P, B, S, W) -> existing execution calculus -> (S_next, W_next)
Σ_next = relevant current observations and admitted truth after that boundary
R_next = residual(M, Q_next, V_next)
complete(T, S_next) = Φ_T(admittedEvidence(S_next))
```

These result forms describe information, not new Public operation/result
variants. `established` reports an already warranted completion relation with
its supporting refs; the preprocessor cannot write closure or upgrade candidate
observations and judgments into admitted facts. Empty residuals from an
incomplete model do not establish `Φ_T`.

The [live-state and reuse law](../../PRODUCT.md#live-state-recovery-and-valid-reuse)
owns reusable evidence and recovery. A failed Run may leave valid work; a
completed Run may leave task obligations. Currentness and historical occurrence
are separate. Reusing an old artifact in new work does not retroactively alter
its construction inputs, actor provenance or Run. A required historical
relation that was absent remains absent; any prospective corrective work earns
its own evidence.

Recomposition produces a candidate with the identities required by ordinary
GTL publication and admission. It never rewrites a bound running `P` or `B`.
Reuse within an existing Program follows that Program's declared continuation;
changed topology follows the existing entry/re-entry authority. A proposed
route unavailable on the installed substrate stays a capability gap. This
calculus grants no autonomous cross-Run controller or future 5.1 response path.

### Judgment, Authority And Proportion

**REQ-L-GTL3-SELECTION-BOUNDARY-013**: Construction shall expose which
relations are computed, judged or reserved to the owner and conserve their
authority through reuse.

| Relation | Responsibility |
|---|---|
| Exact identities, typed edges, admitted dependencies, declared permissions and applicability predicates with total rules | Computed checks; unknown input remains typed uncertainty. |
| Meaning of prose, semantic function fit, contextual sufficiency, choice of useful increment and adequacy of evidence where no total rule exists | Judgment with its basis, scope and revising observations. |
| Changes to task meaning, permitted scope or acceptance conditions; reserved choices | The owning decision authority. |

This C/J/O distinction does not change GTL's `C` composition or `F_D/F_P/F_H`
semantics. Recorded judgments are reusable when their support remains valid
and the current use permits reuse; required independent assessment supplies
its own judgment. Hashes, schema compliance and cost savings cannot manufacture
semantic certainty or reserved authority.

**REQ-L-GTL3-SELECTION-BOUNDARY-014**: Selection shall justify a proportionate
attempt under the declared outcome and evidence duties.

```text
cost_of_attempt = interpretation + selection/construction + context
                  + execution + evaluation/admission + necessary recovery
```

Use available suitable compositions before unbounded search or repeated
function synthesis. A steel thread prioritizes consequential uncertainty and
interface reach while retaining the complete task contract. Narrow evaluation
may be sufficient when valid work already exists. Any additional role,
reconstruction or repeated derivation needs an applicable duty or invalidator.
Stochastic judgment need not choose identical graphs on repeated calls, but
irrelevant history alone cannot invalidate established obligations or force
reconstruction. The logical admissibility of a fixed candidate remains the
same when all its governing inputs remain the same.

Construction and retry follow the selected operation's finite scope and
stopping conditions. Repeating an unchanged unsuccessful composition without
new evidence, a changed premise or a declared bounded retry rationale returns
its unresolved cause to the owning policy; it does not create an implicit
loop. No global-optimality promise, universal time/token quota or new cost
ledger follows. The calculus does not prescribe distributed risk controls;
technological realization remains with the build tenant.

### Discriminating Cases

**REQ-L-GTL3-SELECTION-BOUNDARY-015**: Qualification of a selected construction
implementation shall discriminate the following relations through its actual
ordinary entry. These are model predictions, not a claim of tests already run
or an additional ABG 5.0 qualification campaign.

For the worked model, the task's unchanged predicate is:

```text
Φ = conforms(a, k) ∧ executed(e, a)
    ∧ assesses(j, e, k, requiredScope, satisfied)
    ∧ independent(j, author(a))
```

`a` is an artifact, `k` its source contract, `e` admitted execution evidence,
and `j` the required independent judgment. `requiredScope` is the full
assessment duty declared by that contract. `assesses` is true only when the
admitted, still-applicable judgment binds the exact `e` and `k`, covers that
required scope and establishes its required claims with a satisfactory verdict
under the owning assessment/evidence rules. Assessment occurrence, a narrower
positive verdict, a contrary verdict or an indeterminate result cannot satisfy
this relation. A schema-valid or generically positive response does not replace
that evidence and scope relation. All referenced dependencies and permissions
below are valid unless the row changes one explicitly. Suitable
construct, execute and assess functions are available. Repeated function names
in a row denote selected operations, not mandatory separate processes.

| Change in basis | Predicted lawful selection | Falsifier |
|---|---|---|
| `a` absent | Construct, execute and obtain the required assessment; preserve each evidence duty. | A plausible authored artifact closes `Φ` alone. |
| `a` valid; `e` missing | Execute the existing artifact, then assess. | Reconstruct solely because execution evidence is absent. |
| `a` and `e` valid; `j` missing | Assess the retained exact evidence. | Rerun construction/commands merely to recover an evaluator entry. |
| An independent `j` exists but is negative, indeterminate or covers only part of `requiredScope` | Retain the unsatisfied or unresolved assessment duty; select justified repair, investigation or the missing assessment while preserving valid support. | Assessment existence or a partial positive verdict closes `Φ`. |
| Every conjunct established | Report its admitted completion evidence; no new work is necessary. | Treat preprocessing or another review round as an unconditional closing event. |
| Only a dependency of `e` changes | Re-establish affected execution support and dependent `j`; retain unaffected `a`. | Restart all work, or keep stale `e` as current. |
| A failed attempt changes the workspace; after-observation unavailable | Withdraw affected currentness and select authorized observation/discovery before dependent reuse. | Infer rollback or preserve unsupported currentness. |
| Governing source additionally requires `constructedFrom(a, d)`; the old construction lacks that relation | Preserve valid behavioral evidence, retain the separate provenance obligation and select prospective work if authorized. | Manufacture an old input relation from today's matching files or weaken the source predicate. |
| A mandatory evaluation predicate is true, false or unknown | Include it, exclude it with its basis, or retain the unresolved duty respectively. | Accept a caller list that omits a required result; activate every possible frame regardless of applicability. |
| Candidate functions share a name/type but differ in effects, semantic result or independence | Accept only a contract-compatible candidate; return a gap if none fits. | Treat name/type equality as sufficient authorization. |
| Selected `U` closes while another mandatory residual remains | Preserve the residual and derive the next useful increment. | A completed Run closes the original task. |
| Add unrelated audit history with all governing dependencies unchanged | Preserve valid reuse and candidate admissibility. | Require history-wide reprocessing just to choose the next ordinary increment. |

Mechanical checks exercise declared relations and negative inputs. Semantic
qualification compares interpretation and selected work against the original
sources and an independently stated expected result. Installed execution proves
the actual candidate-to-admission-to-outcome composition; structural validity
alone proves neither semantic conservation nor user success. Qualification may
reuse still-valid evidence and combines cases where one thread discriminates
several duties; the table does not require a fresh LLM Run per row.
