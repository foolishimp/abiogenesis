# USER GUIDE: GTL Conceptual Guide

Date: 2026-04-01
Author: Codex
Status: draft

Builds on and consolidates:
- `claude/20260331T100000_STRATEGY_gtl-algebra-explained.md`
- `codex/20260331T160500_STRATEGY_gtl-1-1-1-complete-explanation.md`
- `codex/20260327T063928_DRAFT_intro-llm-first-paragraph-for-gtl-technical-guide.md`
- recent recursion/runtime closure through `codex/20260401T090835_EXECUTION_UPDATE_recursive-audit-closure.md`

---

## 1. What GTL is

GTL means **Genesis Topology Language**.

It is a language for describing workflows where:

- the work is typed
- the contracts are explicit
- the workers are not automatically trusted
- convergence is judged by evaluators, not by "the task ran"

The shortest correct way to think about GTL is:

> GTL is a typed algebra for declaring workflow structure, alternatives,
> refinement, and recursion under explicit evaluation and governance.

If you come from Airflow, Prefect, Temporal, or ordinary DAG tooling, the key
difference is this:

- ordinary workflow systems assume the worker is trusted
- GTL assumes the worker may be wrong

That matters most when the worker is an AI agent.

## 2. Why GTL exists

Traditional workflow systems are built around this assumption:

```text
task ran -> output exists -> workflow moved forward
```

That is fine when the worker is deterministic and trusted.

It breaks when the worker is:

- probabilistic
- generative
- partially correct
- plausibly wrong
- capable of changing structure as well as content

So GTL starts from a different rule:

> work is not done because a worker ran  
> work is done because the declared contract converged

That is the whole point of the language.

## 3. GTL/ABG is LLM-first

GTL/ABG is designed as an **LLM-first** system.

That does not mean it is "for AI hype." It means the native model is optimized
for semantically explicit, formally constrained machine reasoning.

GTL preserves as first-class declarations:

- topology
- contracts
- evaluation
- structural alternatives
- recursion
- governance

ABG preserves as first-class runtime truth:

- execution
- lineage
- convergence
- correction
- replay
- provenance

Human-readable docs, workflows, prompts, and diagrams are important, but they
are projections over that deeper model, not the primary source of truth.

## 4. The core mental model

GTL stays small if you keep the right picture in your head.

### A `Node`

A `Node` is a typed workflow state.

Examples:

- `intent`
- `requirements`
- `design`
- `code`
- `reviewed_code`

A node can also declare conditions that must hold:

```text
code = Node("code", schema=Code, markov=("tests_pass", "coverage_met"))
```

So a node is not just a label. It is a typed state with contract conditions.

### A `GraphVector`

A `GraphVector` is one boundary from source state to target state.

That boundary says:

- what the source is
- what the target is
- who can operate there
- who evaluates there
- what rule governs the boundary

This is the real unit of workflow law.

### A `Graph`

A `Graph` is a typed workflow structure built from nodes and vectors.

It is not just a picture of steps. It is the contract surface that says what
workflow states and boundaries are lawful.

## 5. The important GTL types

You do not need every detail at once. These are the ones that matter most.

### `Node`

Typed point in workflow state.

### `GraphVector`

One typed transformation boundary between states.

### `Graph`

The structural object made from nodes and vectors.

### `Operator`

The thing that performs effectful work.

### `Evaluator`

The thing that judges whether the work converged.

### `Rule`

Policy or decision logic attached to a boundary.

### `GraphFunction`

A reusable workflow program with an explicit outer contract.

### `CandidateFamily`

A published set of lawful alternative `GraphFunction`s for the same outer
boundary.

### `RefinementBoundary`

A published declaration that a vector may be refined.

### `Module`

The published container of graphs, graph functions, candidate families,
boundaries, roles, and jobs.

### `Job`

A dispatchable unit of work over a graph vector contract.

### `Role`

The declared capability/authority surface used in execution.

## 6. The three regimes

GTL and ABG organize work into three regimes:

- `F_D`: `Functor_Deterministic`
- `F_P`: `Functor_Probabilistic`
- `F_H`: `Functor_Human`

This applies to both operators and evaluators.

### `F_D`

`F_D` means `Functor_Deterministic`.

Use this when the work or judgment can be done deterministically.

Examples:

- run a compiler
- run a test suite
- run a Spark job with declared logic
- run a schema validator

### `F_P`

`F_P` means `Functor_Probabilistic`.

Use this when the work or judgment is probabilistic or agentic.

Examples:

- generate a candidate design
- propose a mapping
- assess whether a narrative satisfies a requirement

### `F_H`

`F_H` means `Functor_Human`.

Use this when a person must act or decide.

Examples:

- human approval
- external business action
- control signoff

The intended order is:

1. prove what can be proved deterministically
2. use bounded probabilistic work where needed
3. involve a human where irreducible judgment remains

## 7. Operators and evaluators

This is one of the most important ideas in GTL.

### Operators do work

An `Operator` performs the transformation.

Examples:

- write code
- run a Spark transform
- call a service
- perform a human business action

### Evaluators judge work

An `Evaluator` decides whether the target contract is satisfied.

Examples:

- tests pass
- policy review passed
- human approved

The separation matters because GTL refuses this traditional shortcut:

```text
worker ran = task succeeded
```

In GTL:

- the operator creates or changes the state
- the evaluator judges whether the state is acceptable

That is what makes convergence meaningful.

## 8. A simple example

Suppose we want:

```text
intent -> code
```

In GTL, that is not just "call an AI."

It is more like:

```text
intent --(operator writes code)--> code
code --(tests / review / approval)--> converged
```

So a vector might have:

- an `F_P` operator to write code
- an `F_D` evaluator for tests
- an `F_P` evaluator for bounded review
- an `F_H` evaluator for final approval

This is the correct mental shape:

```text
transformation boundary + declared worker + declared judges
```

## 9. GTL is an algebra, not just a schema

GTL matters because workflow structure can be transformed **lawfully**.

The main operations are:

- `edge`
- `compose`
- `substitute`
- `recurse`
- `fan_out`
- `fan_in`
- `gate`
- `promote`

These are not helpers. They are the legal ways workflow structure is reused,
refined, and lifted.

## 10. `compose`

`compose(f, g)` means:

- take one graph function
- follow it by another
- only if the output contract of the first satisfies the input contract of the
  second

So `compose` is lawful sequential composition.

If interfaces do not align, composition is rejected.

This gives you:

- refactorable workflow structure
- lawful chaining
- preserved outer contracts

## 11. `substitute`

`substitute` means:

- replace a coarse vector with a finer inner graph
- while preserving the outer contract

Example:

```text
requirements -> production
```

can be refined into:

```text
requirements -> design -> code -> tests -> production
```

without changing the outer promise.

This is how GTL expresses structural refinement.

Important note:

- `substitute` is still a real GTL algebra operation
- but the ABG runtime should not treat recursive graph-function application as
  naive global macro expansion

That was an earlier design problem. The current direction is:

- substitution remains algebraically valid
- recursive execution happens in local frames, not by mutating the published
  module globally

## 12. `GraphFunction`

This is the biggest idea in GTL 1.1.1.

The weak explanation is:

> a graph function is a reusable graph template

That is no longer enough.

The stronger and correct explanation is:

> a `GraphFunction` is a reusable workflow program with an explicit outer
> contract and a lawful path to runtime realization

That means it has:

- declared inputs
- declared outputs
- a reusable inner workflow
- publication truth
- a path to canonical materialization

So a graph function is not just "some function that happens to return a graph."
It is a published, reusable workflow program.

## 13. `CandidateFamily`

Sometimes a boundary has more than one lawful realization.

Example:

- fast prototype profile
- careful production profile
- jurisdiction-specific profile
- tenant-specific profile

`CandidateFamily` is how GTL publishes those alternatives.

This is important because GTL separates:

- what alternatives are structurally lawful
- from how a specific alternative gets selected

The language exposes alternatives.
It does not silently choose one.

That is a constitutional boundary.

## 14. Higher-order operations

### `fan_out`

Apply a workflow program across a collection boundary.

Think:

- do the same lawful operation over each item in a vector

### `fan_in`

Reduce a collection of outputs into a smaller result.

Think:

- gather and reduce a judged collection

### `gate`

Attach explicit rule and evaluator obligations to a boundary.

Think:

- do not just continue because the transform exists
- continue only when policy and evaluators allow it

### `promote`

Lift one representation boundary into another.

Think:

- a declared change in representational level

These operations let GTL describe higher-order workflow programs without hiding
the semantics in custom runtime code.

## 15. What recursion means now

This is the most important recent change.

Earlier, there was a design mistake where selected inner graph structure could
be treated too much like macro expansion into the live module.

That caused exactly the wrong effects:

- private implementation detail leaked into global runtime truth
- inner vectors behaved like globally published vectors
- the outer boundary stopped being the stable contract

The corrected model is:

### Outer contract stays stable

The published module keeps the outer vector as the visible institutional
contract.

### Selection opens a local frame

If a selected `GraphFunction` is recursive or refining, ABG opens an invocation
frame for it.

### Inner vectors are frame-local

The inner vectors live inside that frame. They are real executable truth, but
they are not automatically promoted into module-global topology.

### Fold-back returns to the parent

When the child work converges and the declared recursion law is satisfied, the
frame folds back into the stable outer boundary.

### Parent is re-evaluated

Child closure alone does **not** certify the parent.
The parent must be re-bound and re-evaluated.

This is the correct meaning of proper recursive graph execution.

## 16. `recurse`

`recurse(graph_function, termination, foldback)` means:

- repeated or child application may occur
- the outer contract is preserved
- recursion is bounded by a declared termination contract
- child return material must re-bind through a declared fold-back contract

So recursion in GTL is not "keep looping somehow."

It is:

- explicit
- bounded
- lineage-preserving
- fold-back governed

The important parts are:

### Termination

The recursive application must declare how the interpreter knows the recursive
frame can close.

### Fold-back

The recursive application must declare how child result truth re-binds into the
parent contract.

This is what prevents the interpreter from inventing hidden recursion semantics.

## 17. What ABG does with GTL

GTL declares the workflow law.
ABG executes it.

ABG is responsible for:

- selecting lawful traversal targets
- opening frames
- dispatching work
- running evaluators
- tracking lineage
- handling correction and reset
- recording evidence

In simple terms:

- GTL is the contract language
- ABG is the resilient runtime

## 18. How recursive execution works in ABG right now

The current runtime model is:

1. published outer boundary is discovered
2. if a candidate family is selected, ABG materializes the chosen graph function
3. ABG builds a frame-local traversal surface
4. ABG validates that frame-local publication truth fails closed
5. ABG opens a recursive invocation frame
6. child work runs inside that frame
7. declared recursive termination is checked before fold-back
8. frame folds back and the parent is re-evaluated through the stable outer
   contract

This means:

- the macro/globalization problem is resolved
- recursive locality is real
- declared termination is now operative

What is still future work is the final tail-loop recursive interpreter stack.
The current runtime still uses the present event-driven frame progression
engine. That is good enough for the current tranche, but it is not yet the
final recursive machine.

## 19. What GTL is not

GTL is **not**:

- just another DAG DSL
- just a graph schema format
- a hidden strategy engine
- a task picker
- a transport abstraction
- a canonical enterprise data model

It is also not "AI workflow" in the shallow sense.

It is a typed workflow algebra designed for a world where:

- workers may be untrusted
- AI may be part of the workflow
- structural alternatives matter
- recursive refinement matters
- proof, lineage, and correction matter

## 20. A practical reading guide

If you are new to GTL, this is the order to internalize it:

1. `Node`
2. `GraphVector`
3. `Graph`
4. `Operator` vs `Evaluator`
5. the three regimes: `F_D`, `F_P`, `F_H`
6. `GraphFunction`
7. `CandidateFamily`
8. `compose`
9. `substitute`
10. `recurse`
11. higher-order operations: `fan_out`, `fan_in`, `gate`, `promote`
12. ABG runtime: frames, fold-back, convergence, lineage

If you get lost, return to this sentence:

> GTL defines workflow as typed, evaluable, law-bearing structure rather than
> as a sequence of trusted task invocations.

Everything else follows from that.

## 21. Short version

If you need the shortest accurate explanation:

> GTL is a typed algebra for workflow where operators do work, evaluators judge
> convergence, graph functions publish reusable workflow programs, candidate
> families publish lawful alternatives, and recursion happens through local
> invocation frames over stable outer contracts rather than through global macro
> expansion.

That is the current conceptual guide.
