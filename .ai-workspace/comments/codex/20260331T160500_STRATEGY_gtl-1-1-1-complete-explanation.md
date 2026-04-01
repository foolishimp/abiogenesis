# STRATEGY: GTL 1.1.1 — A Complete Explanation

**Author**: codex
**Date**: 2026-03-31T16:05:00+11:00
**Addresses**: `claude/20260331T100000_STRATEGY_gtl-algebra-explained.md`, `specification/requirements/gtl/REQ-L-GTL2-GRAPHFUNCTION.md`, `specification/requirements/abg/REQ-R-ABG2-INTERPRET.md`, `specification/requirements/abg/REQ-R-ABG2-PROVENANCE.md`, `build_tenants/abiogenesis/python/code/gtl/function_model.py`, `build_tenants/abiogenesis/python/code/genesis/materialization.py`, `build_tenants/abiogenesis/python/code/genesis/interpret.py`
**Status**: Draft

## Summary

This note builds on and replaces Claude's March 31 algebra explainer.

The earlier note correctly explained GTL as an algebra of typed workflow structure.
What it did not yet fully incorporate was the `1.1.1` meaning of `GraphFunction`.

That matters because `1.1.1` is the point where GTL and ABG stop treating graph functions as mostly elegant reusable templates and start treating them as first-class published workflow programs with:

- explicit outer contracts
- replayable publication truth
- canonical materialization
- graph-derived companion bundles
- replayable provenance in ABG

So the goal of this post is to give one simple but complete explanation of GTL as it stands after `1.1.1`.

## Analysis

### 1. Why GTL exists

Most workflow systems assume trusted workers.

```text
task_a -> task_b -> task_c
```

If a worker runs, the system largely assumes the output is acceptable.

That assumption breaks when the worker is an AI agent.

An AI agent can:

- produce partial output
- produce plausible but wrong output
- loop
- misunderstand the ask
- improve something structurally while still violating the contract

So GTL exists to define workflow as typed, evaluable, law-bearing structure rather than as a sequence of trusted task invocations.

The core idea is:

```text
work is not done because a worker ran
work is done because the declared contract converged
```

### 2. The core GTL types

GTL stays surprisingly small at the type level.

The primary surfaces are:

- `Node`
- `Graph`
- `GraphVector`
- `Operator`
- `Evaluator`
- `Rule`
- `GraphFunction`
- `RefinementBoundary`
- `CandidateFamily`
- `Module`
- `Job`
- `Role`

The important intuition is:

- `Node` says what kind of state exists
- `Graph` says how typed states connect
- `Operator` says who performs work
- `Evaluator` says who judges work
- `GraphFunction` says how workflow structure itself becomes reusable

### 3. Nodes, graphs, and contracts

A `Node` is a typed workflow locus with declared conditions that must hold.

```text
intent       = Node("intent", schema=Text, markov=("approved",))
requirements = Node("requirements", schema=Spec, markov=("complete", "traced"))
code         = Node("code", schema=Code, markov=("tests_pass", "tags_valid"))
```

A `Graph` is the structural object built from those typed points and the vectors between them.

The graph is not just a picture of steps.
It is a contract surface.

It says:

- what the lawful inputs are
- what the lawful outputs are
- what transitions exist
- what operators act there
- what evaluators judge there

### 4. The three evaluation regimes

GTL and ABG organize checking into three regimes:

- `F_D`: deterministic proof
- `F_P`: probabilistic agent judgment or bounded construction
- `F_H`: human judgment

This is not decorative terminology.
It is the escalation structure of the whole system.

The intended order is:

1. deterministic proof first
2. bounded agent judgment or construction second
3. human judgment last

So GTL is not merely "AI workflow."
It is workflow where probabilistic workers live inside an explicit hierarchy of proof and judgment.

### 5. Operators and evaluators are constitutionally separate

An `Operator` performs work.
An `Evaluator` judges work.

That separation is one of the deepest differences between GTL and ordinary DAG tooling.

Traditional task systems often collapse these questions:

- run the task
- if it ran, it succeeded

GTL refuses that collapse.

The thing that writes the output and the thing that judges the output are distinct surfaces.

That distinction is what makes convergence, replay, and audit meaningful.

### 6. GTL is an algebra, not just a schema

GTL matters because its workflow structure can be transformed lawfully.

The important operations are:

- `edge`
- `compose`
- `substitute`
- `recurse`
- `fan_out`
- `fan_in`
- `gate`
- `promote`

These are not convenience helpers.
They are the lawful ways workflow structure is reused, refined, and lifted.

#### `compose`

Sequential composition of reusable workflow programs when interfaces align.

```text
compose(f, g)
```

The output contract of `f` must satisfy the input contract of `g`.

#### `substitute`

Replace a coarse boundary with a finer graph while preserving the outer contract.

This is what makes structural refinement lawful.

```text
requirements -> production
```

can refine internally into:

```text
requirements -> design -> code -> production
```

without changing what the caller sees.

#### `recurse`

Apply a graph function under a declared termination evaluator while preserving the outer interface.

#### `fan_out` / `fan_in`

Higher-order graph programming over collections and reductions.

#### `gate`

Add rule and evaluator obligations to a contract boundary without hiding those obligations in ad hoc runtime logic.

### 7. Why GraphFunction matters so much

`GraphFunction` is the primary reusable GTL compute abstraction.

That sentence is easy to say and easy to under-specify.

The weak interpretation is:

```text
GraphFunction = a function that returns a graph
```

That was never the constitutional intent, and by `1.1.1` it is no longer an adequate explanation.

The stronger and now accurate interpretation is:

```text
GraphFunction = a published reusable workflow program
               with an explicit outer contract
               and a lawful path to runtime realization
```

That is the key `1.1.1` shift.

### 8. What changed in `1.1.1`

The `1.1.1` line clarified and implemented five linked ideas.

#### 8.1 GraphFunction publication truth is now explicit

In `build_tenants/abiogenesis/python/code/gtl/function_model.py`, `GraphFunction.template` is normalized into replayable `TemplateRef` publication truth.

The important distinction is:

- not "an arbitrary callable that the runtime happens to have lying around"
- but "an explicit published reference to the reusable workflow program"

That published reference may currently be:

- `inline_graph`
- `symbolic`

but the important point is the same:

the publication surface is explicit and replayable.

#### 8.2 Outer contracts are validated

`GraphFunction` now checks that the realized graph preserves the declared input and output contract.

That matters because GTL wants:

- lawful substitution
- lawful composition
- lawful refinement

without the caller losing the original contract truth.

#### 8.3 Structured declarations survive algebraic operations

GTL algebra now preserves declaration truth across:

- composition
- recursion
- gating
- higher-order helpers

So graph functions are not just reusable shapes.
They also remain structured policy/proof-bearing surfaces after transformation.

#### 8.4 ABG now owns canonical materialization

This is the biggest ABG-side step.

In `build_tenants/abiogenesis/python/code/genesis/materialization.py`, ABG now defines an explicit materialization seam with:

- `MaterializationRequest`
- `MaterializationRecord`
- `CompanionBundle`

This means ABG can answer:

- which published graph function was requested
- from which module
- with which declared profile or parameters
- which graph was produced
- what materialization identity resulted

That is the difference between:

- elegant language theory

and

- a runtime system that can replay and audit reusable workflow programs

#### 8.5 Graph-derived companion bundles are now explicit

`1.1.1` also says that graph functions can lawfully produce graph-derived bundles such as:

- selected subgraph views
- evaluator bundles
- profile manifests

This matters because the runtime often needs more than the raw graph.

It needs:

- the evaluator set justified by the realized boundary
- the derived structural view selected for execution
- the profile/manifold used in materialization

So the right mental model is:

```text
Graph is still the primary structural output.
GraphFunction is the authoritative reusable source of that graph
and of the replayable derived bundles that come from its realization.
```

### 9. What this means for ABG execution

ABG is the canonical engine target, not the owner of GTL's language law.

Its job is to interpret GTL structure faithfully.

After `1.1.1`, that means:

- ABG must not treat graph-function realization as hidden interpreter magic
- ABG must materialize published graph functions from explicit requests
- ABG must fail closed when identity, profile, parameters, or outer contracts are undeclared or invalid
- ABG must preserve provenance from graph-function identity through materialization and derived bundles

This is reflected directly in:

- `REQ-R-ABG2-INTERPRET-003`
- `REQ-R-ABG2-INTERPRET-007`
- `REQ-R-ABG2-INTERPRET-008`
- `REQ-R-ABG2-PROVENANCE-008`
- `REQ-R-ABG2-PROVENANCE-009`

So "first-class graph functions" is not only a GTL phrase.
It is also an ABG runtime obligation.

### 10. Selection and refinement now preserve graph-function truth

In `build_tenants/abiogenesis/python/code/genesis/interpret.py`, selection now materializes candidate graph functions through the canonical materialization seam and records:

- `materialization_id`
- selected inner vectors
- derived evaluator bundle

That means the engine can now answer questions like:

- which published workflow program did we refine into here
- what exact materialization record produced the graph we executed
- why was this evaluator bundle considered lawful at this boundary

That is a major maturity step.

Before this, graph functions could still be conceptually important but operationally weak.
After this, they are runtime-visible and provenance-carrying.

### 11. A complete simple explanation of GTL after `1.1.1`

If you want the shortest accurate explanation, it is this:

> GTL is a typed algebra for workflows with untrusted workers. `Node` defines typed loci, `Graph` defines lawful structure, `Operator` and `Evaluator` separate doing from judging, and `GraphFunction` is the reusable workflow-program unit. In `1.1.1`, graph functions become first-class not just in theory but in runtime: they are published with explicit outer contracts and replayable template truth, materialized by ABG through explicit requests and records, and preserved in provenance together with graph-derived bundles such as evaluator sets and selected subgraphs.

### 12. What this does not mean

This does **not** mean GTL has collapsed into ordinary function programming.

It also does **not** mean graph functions have displaced graphs.

The correct hierarchy is:

- `GraphFunction` is the reusable published workflow program
- `Graph` is the realized structural execution surface
- ABG materialization is the lawful bridge between publication truth and executable structure

So the change is not "more abstraction."

It is:

```text
more explicit runtime truth about reusable workflow programs
```

### 13. Why this matters for the product story

Without this `1.1.1` step, GTL can describe reusable workflows elegantly but still leaves a gap between:

- publication
- runtime realization
- provenance

With this step, the product can now claim something much stronger:

reusable workflow programs are not merely authored and composed.
They are also:

- published as first-class module surfaces
- realized through explicit materialization
- checked against stable interfaces
- carried into ABG provenance and replay

That is the real significance of `GraphFunction` in `1.1.1`.

## Recommended Action

Treat this post as the complete high-level GTL explainer for the `1.1.1` line.

If the March 31 Claude note is kept, it should be treated as the earlier simplified draft that this note supersedes.

If a public-facing guide is later cut from this material, it should preserve this exact shift in wording:

- not "graph function as helper"
- but "graph function as published reusable workflow program with lawful runtime realization"
