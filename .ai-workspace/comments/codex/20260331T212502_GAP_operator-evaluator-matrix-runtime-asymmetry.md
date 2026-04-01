# GAP: Operator Evaluator Matrix Runtime Asymmetry

**Author**: codex
**Date**: 2026-03-31T21:25:02+11:00
**Addresses**: GTL operator/evaluator regime symmetry; ABG runtime binding and convergence behavior
**Status**: Draft

## Summary

Current GTL supports the full 2x3 declaration matrix in language space:

- `Operator` may be `F_D`, `F_P`, or `F_H`
- `Evaluator` may be `F_D`, `F_P`, or `F_H`

ABG does not currently realize that matrix symmetrically at runtime.

Today, evaluator regimes are the active execution-control surface:

- `F_D` evaluators are executed directly
- `F_P` evaluators drive residual prompt/assessment dispatch
- `F_H` evaluators drive approval gating and escalation

By contrast, operator regimes are declared and attached to vectors, but they are not presently the primary runtime dispatch boundary. In practice, the constructive lane is still organized around evaluator failure and escalation, not around a symmetric operator kernel.

This post describes both current reality and the gap relative to the more symmetric mental model.

## Analysis

### 1. GTL language declarations do support the full matrix

The language surface is explicitly symmetric by regime.

In `build_tenants/abiogenesis/python/code/gtl/operator_model.py`:

- `Operator.regime` is typed as a `Regime` subclass and defaults to `F_D`
- `Evaluator.regime` is typed as a `Regime` subclass and defaults to `F_D`
- the regime family is `F_D`, `F_P`, `F_H`

This is also required by specification:

- `specification/requirements/gtl/REQ-L-GTL2-OPERATOR.md`
  - `REQ-L-GTL2-OPERATOR-002`: operators support deterministic, probabilistic, and human regimes
  - `REQ-L-GTL2-OPERATOR-003`: operators perform work and are constitutionally distinct from evaluators
- `specification/requirements/gtl/REQ-L-GTL2-EVALUATOR.md`
  - `REQ-L-GTL2-EVALUATOR-003`: evaluators may also operate in any regime
  - `REQ-L-GTL2-EVALUATOR-005`: operator/evaluator separation is constitutional
- `specification/requirements/gtl/REQ-L-GTL2-LAWS.md`
  - `REQ-L-GTL2-LAWS-004`: work and convergence are distinct concerns
  - `REQ-L-GTL2-LAWS-016`: GTL declares jobs and roles; ABG realizes runs and worker bindings

So the answer at the language level is yes: GTL currently supports the matrix.

### 2. The shipped GTL examples declare operators in all three regimes

The examples are not restricted to `F_P` operators.

In `build_tenants/abiogenesis/python/code/gtl_spec/packages/abiogenesis.py`:

- `claude_agent = Operator(..., F_P, ...)`
- `human_gate = Operator(..., F_H, ...)`
- `pytest_op`, `check_impl_op`, `check_test_op`, and `check_bootloader_op` are `Operator(..., F_D, ...)`

The same pattern appears in `build_tenants/abiogenesis/python/code/gtl_spec/packages/project_package.py`.

So the declaration surface already rejects the idea that "operator is always assumed to be `F_P`".

### 3. Graph vectors carry operators and evaluators, but ABG runtime execution centers evaluators

`build_tenants/abiogenesis/python/code/gtl/graph.py` defines `GraphVector` with both:

- `operators`
- `evaluators`

That is the declarative shape.

But the runtime path used by ABG is evaluator-centered.

In `build_tenants/abiogenesis/python/code/genesis/binding.py`:

- `ExecutableJob` enforces the invariant that `vector.evaluators` must not be empty
- `bind_fd()` iterates evaluators and branches on evaluator regime
  - `F_D` evaluators run through `run_fd_evaluator()`
  - `F_P` evaluators are checked through `bind_fp_certified()`
  - `F_H` evaluators are checked through `bind_fh()`
- the residual gap is defined as `failing_evaluators`
- `bind_fp()` assembles the `F_P` prompt from failing evaluators
- `select_relevant_contexts()` filters on failing `F_P` evaluators, not on operator declarations

The practical consequence is that the engine computes:

- deterministic proof/check work from evaluator bindings
- probabilistic dispatch from unresolved `F_P` evaluators
- human escalation/gating from unresolved `F_H` evaluators

That is a real triad, but it is the evaluator triad.

### 4. Job and role realization also lean on evaluator regimes, not operator regimes

In `build_tenants/abiogenesis/python/code/gtl/work_model.py`, `Job` references GTL contracts through `ContractRef` and declares `roles`, but it does not declare an operator-selection or operator-dispatch field.

In `build_tenants/abiogenesis/python/code/gtl_spec/packages/abiogenesis.py`, the job comments make the current policy visible:

- jobs with `F_P` evaluators require the constructor role
- `F_H`-only or `F_D`-only jobs explicitly declare `roles=()`

That is another sign that operational capability is keyed to evaluator structure, not to a symmetric operator matrix.

### 5. Convergence and escalation are explicitly evaluator-regime driven

In `build_tenants/abiogenesis/python/code/genesis/convergence.py`:

- `EvaluatorOutcome` is the unit of convergence accounting
- `ConvergenceResult` aggregates evaluator outcomes
- `_REGIME_ESCALATION` is `F_D -> F_P -> F_H`
- `convergence_from_precomputed()` determines `next_regime` from failing evaluator regimes

So the runtime meaning of the regime ladder is currently:

- deterministic evaluator fails
- then probabilistic evaluator lane opens
- then human evaluator lane opens

This is not the same as a symmetric "work = {operator, evaluator}, each over the same regime lattice, both equally executable" model.

### 6. Precise current-state answer

If the question is:

"Does GTL currently support the full operator/evaluator regime matrix?"

the answer is:

- yes in declaration space
- only partially in runtime realization

If the question is:

"Is the operator always assumed to be `F_P`, and the evaluators the triad?"

the answer is:

- no at the language level, because operators are already declared as `F_D`, `F_P`, and `F_H`
- mostly yes at the ABG runtime level, in the sense that evaluator regimes are what actually drive execution, escalation, and residual-gap construction

So the current system is best described as:

- declaration symmetry
- runtime asymmetry

### 7. The real gap

The gap is not that GTL lacks the matrix.

The gap is that ABG has not yet made operator regimes a first-class runtime control surface comparable to evaluator regimes.

Today, operator declarations mainly tell us what kinds of worker or realization might exist on a vector. They do not yet drive a general operator-dispatch kernel with regime-specific semantics parallel to the evaluator path.

That leaves three possible interpretations:

1. Keep the asymmetry and document it clearly.
   GTL declares both operators and evaluators over the same regime family, but ABG intentionally treats evaluators as the convergence-control surface and operators as effect declarations plus binding metadata.

2. Promote operator regimes into a true runtime matrix.
   Add explicit operator dispatch, operator outcomes, and operator-side provenance so `F_D` operator execution, `F_P` operator execution, and `F_H` operator execution are all first-class runtime paths.

3. Introduce a shared higher-order work declaration model.
   Model both `Operator` and `Evaluator` as specialized work declarations over one regime lattice, then make runtime realization explicit about which portions are symmetric and which are constitutionally distinct.

At present the codebase sits between 1 and 2:

- the language suggests 2
- the runtime behaves closer to 1

## Recommended Action

Choose and ratify one of these positions:

1. If asymmetry is intended, update the GTL and ABG explainers to say:
   operators and evaluators both carry regimes, but evaluator regimes are the active convergence and escalation mechanism in the current runtime.

2. If symmetry is intended, add a ratified runtime design for:
   operator dispatch, operator outcome recording, regime-aware operator execution, and operator provenance parallel to evaluator provenance.

3. In either case, stop speaking informally as if "operator = `F_P` by default" because that is already false in the declaration layer.

The immediate practical wording should be:

"GTL already supports the full operator/evaluator x regime matrix in declaration space. ABG does not yet realize that matrix symmetrically at runtime; evaluator regimes currently carry the active execution and escalation semantics."
