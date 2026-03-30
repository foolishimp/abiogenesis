# STRATEGY: GTL Algebra — A Simplified Explanation

**Author**: Claude
**Date**: 2026-03-31
**Addresses**: GTL 2.x language surface — explanatory pseudocode for external audiences
**Status**: Draft

## Summary

GTL (Graph Type Language) is an algebraic language for defining workflows where AI agents do the work. This post strips away the implementation and shows the algebra in pseudocode — what it is, why it exists, and how it differs from every other workflow system.

## The Problem

Every workflow system before this assumes trusted workers:

```
# Airflow / Prefect / Temporal — the worker is trusted
task_a >> task_b >> task_c    # if it runs, it's correct
```

AI agents are untrusted. They produce probabilistic output. "The agent finished" is not evidence that the output is correct. GTL exists because you need formal structure to reason about correctness when your workers can't be trusted.

## Part 1: Types

GTL has surprisingly few types. Everything is built from these:

```
Node(name, schema, markov)          -- typed point in a workflow
Graph(inputs, outputs, vectors)     -- the one structural type
GraphFunction(inputs, outputs, template)  -- reusable workflow program
```

A `Node` is a typed locus — a point in the workflow with a declared type and acceptance conditions:

```
intent      = Node("intent",       schema=Text,  markov=("approved",))
code        = Node("code",         schema=Code,  markov=("tests_pass", "coverage_met"))
reviewed    = Node("reviewed",     schema=Code,  markov=("human_approved",))
```

The `markov` conditions are the contract: upstream conditions that hold (source nodes) and conditions the work must satisfy (target nodes).

## Part 2: The Three Regimes

Every workflow step is checked by evaluators in one of three regimes:

```
F_D  -- deterministic: tests, type checks, coverage. Machine-provable.
F_P  -- probabilistic: an AI agent assesses the output. Bounded judgment.
F_H  -- human: a person reviews and approves. Irreducible judgment.
```

These aren't just labels. They're an escalation ladder:

```
F_D checks first.           -- can we prove it?
  if F_D can't close it  -> F_P assesses.   -- can an agent judge it?
  if F_P can't close it  -> F_H reviews.    -- a human must decide.
```

Deterministic proof always precedes probabilistic judgment. Agent judgment always precedes human review. You never ask a human what a test suite can answer.

## Part 3: Operators and Evaluators

Two kinds of actors, constitutionally separated:

```
Operator(name, regime, binding)     -- does work
Evaluator(name, regime, binding)    -- checks work
```

The separation is the point. The thing that writes code is not the thing that judges whether the code is correct. In traditional workflows this distinction doesn't exist because the worker's output is correct by construction.

```
write_code   = Operator("write_code",   regime=F_P, binding="claude")
run_tests    = Evaluator("run_tests",   regime=F_D, binding="pytest")
review_code  = Evaluator("review_code", regime=F_P, binding="claude")
human_ok     = Evaluator("human_ok",    regime=F_H, binding="approval_gate")
```

## Part 4: Building Workflows with the Algebra

### edge — the primitive

The smallest workflow is one step between two nodes:

```
step = edge(intent, code,
            operators  = [write_code],
            evaluators = [run_tests, review_code, human_ok])
```

This says: "Transform intent into code. An AI writes it. Then: tests must pass (F_D), another AI reviews it (F_P), a human approves it (F_H)."

This is already different from every DAG builder. The step doesn't just *run* — it *converges*.

### compose — chaining workflows

```
design_it  = GraphFunction("design",  inputs=[intent],  outputs=[design])
build_it   = GraphFunction("build",   inputs=[design],  outputs=[code])
verify_it  = GraphFunction("verify",  inputs=[code],    outputs=[tested])

pipeline = compose(design_it, build_it, verify_it)
-- pipeline: intent -> tested
```

Composition is lawful only when interfaces align — the outputs of one step satisfy the inputs of the next. This isn't just convention, it's enforced:

```
compose(build_it, design_it)   -- ERROR: code does not satisfy intent
```

Composition is associative:

```
compose(compose(f, g), h)  ==  compose(f, compose(g, h))
```

And there's an identity:

```
id = identity([code])          -- does nothing, preserves interface
compose(f, id)  ==  f          -- identity law
compose(id, f)  ==  f
```

These aren't academic niceties. They mean you can refactor workflow composition without changing what the workflow promises.

### substitute — refining a coarse step

This is where it gets interesting. Say you have a coarse workflow:

```
coarse = edge(requirements, production)    -- one giant step
```

You can refine it by substituting a finer graph:

```
finer = Graph("detailed_pipeline",
    inputs  = [requirements],
    outputs = [production],
    vectors = [
        edge(requirements, design,     evaluators=[design_check]),
        edge(design,       code,       evaluators=[test_suite]),
        edge(code,         production, evaluators=[human_review]),
    ])

refined = substitute(coarse, target_vector_id, finer)
```

The algebra guarantees: **the outer contract is preserved**. Before substitution, the workflow promised `requirements -> production`. After substitution, it still promises `requirements -> production`. But internally, it now has three steps instead of one.

This is how GTL workflows evolve during execution. An AI agent might determine that a coarse step needs decomposition. The engine applies `substitute()`, the graph grows, new child work is spawned — and the outer contract remains intact.

Traditional workflow systems don't need this because their graphs are static. GTL needs it because AI agents operating under evaluation may trigger structural refinement.

### recurse — bounded iteration

```
iterate_code = recurse(build_it, termination=tests_pass_evaluator)
```

"Keep applying `build_it` until the termination evaluator says stop." The outer contract is preserved — `iterate_code` still promises `design -> code`. The engine owns the loop. Lineage is preserved across iterations.

## Part 5: Structural Alternatives

Sometimes there are multiple lawful ways to do something:

```
fast_build = GraphFunction("fast",   inputs=[design], outputs=[code],
                           template=quick_prototype)

careful_build = GraphFunction("careful", inputs=[design], outputs=[code],
                              template=full_tdd_cycle)

build_family = candidate_family("how_to_build",
    inputs     = [design],
    outputs    = [code],
    candidates = [fast_build, careful_build])
```

The language exposes the alternatives. It does **not** choose between them. Selection belongs to:
- **F_D rules** (deterministic policy: "if production, use careful")
- **F_P assessment** (an agent picks based on context)
- **F_H judgment** (a human decides)
- **Business logic above the interpreter**

The interpreter enumerates candidates. It never silently picks the "best" one. This is a constitutional boundary — the language exposes structure, not strategy.

```
-- The engine can do this:
candidates = enumerate(build_family)    -- [fast_build, careful_build]

-- The engine cannot do this:
best = pick_best(build_family)          -- ILLEGAL: hidden strategy
```

## Part 6: Higher-Order Operations

### fan_out — parallel application

```
items      = Node("items", schema="Vector[requirement]")
process    = GraphFunction("process", inputs=[req], outputs=[design])

parallel   = fan_out(process, over=items)
-- applies process to each item in the vector
```

### fan_in — reduction

```
results    = Node("results", schema="Vector[design]")
merge      = GraphFunction("merge", inputs=[results], outputs=[final])

collected  = fan_in(merge, over=results)
```

### gate — conditional continuation

```
approved = gate(build_it,
                rule       = Rule("quality", kind="consensus", config={"quorum": 2}),
                evaluators = [test_suite, code_review])
-- build_it cannot proceed until rule + evaluators pass
```

### promote — representation lift

```
lifted = promote(source=raw_events, to=structured_summary)
-- declares a representation boundary change
```

## Part 7: The Convergence Gradient

This is the core idea. Every other workflow system has binary completion: done or not done. GTL has a gradient:

```
delta(state, constraints) -> work
```

When delta = 0, the system is at rest. Same computation at every scale:

```
-- single evaluator
delta = 1 evaluator failing / 3 total = 0.33

-- one edge
delta = 0.33   -- tests pass, review fails, human pending

-- one feature (multiple edges)
delta = sum of edge deltas

-- entire project
delta = sum of feature deltas
```

The gradient drives the engine. Each iteration reduces delta. The engine selects the first unconverged edge, dispatches work, evaluates the result, records events, recomputes delta. When delta reaches zero across all edges, the system has converged.

```
while delta(project) > 0:
    edge = first_unconverged(project)
    work = dispatch(edge.operator)           -- AI agent does work
    for evaluator in edge.evaluators:
        result = evaluate(work, evaluator)   -- check the work
        emit(assessed, result)               -- record to event stream
    delta = recompute(project)               -- did it get closer?
```

This is fundamentally different from retry logic. Retry says "it failed, try again." The gradient says "it's 60% converged — these specific evaluators still need to pass, at these specific regimes, and here's the deterministic proof that precedes the probabilistic judgment."

## Part 8: Events and Replay

Everything is event-sourced. The event stream is append-only:

```
emit("edge_started",   {edge: "design->code", worker: "claude"})
emit("assessed",       {edge: "design->code", evaluator: "tests", result: "pass"})
emit("assessed",       {edge: "design->code", evaluator: "review", result: "fail"})
-- iterate, agent tries again
emit("assessed",       {edge: "design->code", evaluator: "review", result: "pass"})
emit("fh_gate_pending",{edge: "design->code", evaluator: "human_ok"})
emit("approved",       {edge: "design->code", kind: "fh_review"})
emit("edge_converged", {edge: "design->code", delta: 0})
```

State is never stored. It's always projected from the event stream:

```
state = project(event_stream, "code", "current")
-- reconstructs the current state of the "code" asset from all events
```

This means the system is replayable. You can reconstruct the exact state at any point in history. You can answer "why did the system accept this output?" by replaying the evaluation chain.

## Part 9: Putting It All Together

Here's a complete workflow in algebraic pseudocode:

```
-- Nodes with typed contracts
intent   = Node("intent",       markov=("approved",))
reqs     = Node("requirements", markov=("traced", "complete"))
design   = Node("design",       markov=("coherent", "approved"))
code     = Node("code",         markov=("tests_pass", "tags_valid"))
verified = Node("verified",     markov=("human_approved",))

-- Evaluators across three regimes
req_check     = Evaluator("req_coverage",    regime=F_D, binding="check-tags")
design_check  = Evaluator("design_coherent", regime=F_P, binding="claude")
design_human  = Evaluator("design_approved", regime=F_H, binding="approval")
test_suite    = Evaluator("tests_pass",      regime=F_D, binding="pytest")
code_review   = Evaluator("code_review",     regime=F_P, binding="claude")
final_human   = Evaluator("ship_approval",   regime=F_H, binding="approval")

-- Workflow steps
spec     = GraphFunction("specify",  [intent],  [reqs],     template=...)
design   = GraphFunction("design",   [reqs],    [design],   template=...)
build    = GraphFunction("build",    [design],  [code],     template=...)
verify   = GraphFunction("verify",   [code],    [verified], template=...)

-- Compose into a pipeline
pipeline = compose(spec, design, build, verify)
-- pipeline: intent -> verified

-- Package as a module
sdlc = Module("my_sdlc",
    graphs          = [materialize(pipeline)],
    graph_functions = [spec, design, build, verify],
    jobs            = [Job("spec_work",   contract=spec_vector),
                       Job("design_work", contract=design_vector),
                       Job("build_work",  contract=build_vector),
                       Job("verify_work", contract=verify_vector)],
    roles           = [Role("constructor"), Role("reviewer")])

-- Run it
-- The engine takes over:
-- 1. Computes delta across all edges
-- 2. Selects first unconverged edge
-- 3. Runs F_D evaluators (deterministic checks)
-- 4. If F_D gap remains, dispatches F_P (AI agent)
-- 5. If F_P gap remains, escalates to F_H (human)
-- 6. Records everything as events
-- 7. Recomputes delta
-- 8. Repeats until delta = 0 everywhere
```

## Why This Matters

Traditional workflow: "Run A, then B, then C. If B fails, retry."

GTL: "Here is a typed graph with algebraic composition laws, multi-regime evaluation, convergence gradient, event-sourced replay, and structural alternatives with explicit selection boundaries. AI agents do the work. The algebra guarantees that every graph transformation preserves its contract. The engine converges toward correctness rather than running to completion."

The algebra isn't complexity for its own sake. It's the minimum formal structure required to trust AI agents with real work.

## Recommended Action

Use this as the basis for external explanation of GTL. The algebraic pseudocode hides Python dataclass machinery while preserving the essential semantics. Can be adapted for blog posts, documentation, or technical presentations.
