# MOCKUP: GTL Solutions for U1-U4 on the Current Requirement Surface

**Category**: MOCKUP
**Date**: 2026-03-26T22:35:40+11:00
**Purpose**: make the current `U1-U4` use cases concrete enough to tune GTL interfaces and reveal remaining requirement gaps by pressure-testing the declaration surface

**Builds on**:
- `20260326T202830_USECASES_gap-triggered-context-discovery-and-advanced-suite.md`
- `20260326T190414_PROPOSAL_graphfunction-monadic-composition.md`
- live requirements under `specification/requirements`

---

## 1. Ground Rules

This is a **Python-native GTL mockup**, not a final API commitment.

It assumes the current constitutional split:

- **GTL declares topology and hook surfaces**
- **ABG executes the deterministic protocol**
- **domain implementations provide prompts, programs, evaluators, merge policies, and synthesis logic**

So the examples below intentionally avoid putting domain meaning into GTL or ABG.

They are trying to answer only:

- what should a lawful GTL declaration look like?
- where do domain hooks attach?
- which parts are topology, and which parts are domain logic?

---

## 2. Provisional Surface

The current requirements strongly suggest a surface *like* this:

```python
from gtl import (
    Node,
    Vector,
    GraphFunction,
    Evaluator,
    Rule,
    compose,
    identity,
    fan_out,
    fan_in,
    gate,
    recurse,
    deferred_refinement,
)
```

And with a Python-native declaration style roughly like:

```python
F_D = "F_D"
F_P = "F_P"
F_H = "F_H"

check_contract = Evaluator(
    name="check_contract",
    regime=F_D,
    description="Domain-defined closure check for this boundary",
    binding="exec://domain.check_contract",
    tags=("domain", "closure"),
)

consensus_rule = Rule(
    name="consensus_rule",
    kind="gate",
    config={
        "quorum": 3,
        "round_bound": 5,
        "aggregation_mode": "domain_defined",
    },
)
```

What is intentionally still open:

- whether profiles are a first-class type or policy-visible metadata
- whether evaluator sets are a distinct declaration type or a tuple field
- whether harvest is expressed as `fan_in(...)`, `gate(...)`, or a named helper over both

That is the point of the mockup.

---

## 3. U1 — Ranked Decomposition / Materialization Profiles

### Pressure

One logical builder should hydrate into different lawful shapes:

- `steelthread`
- `mvp`
- `optimal`

without hardcoding the profile choice into the interpreter.

### Mockup

```python
requirements = Node("requirements", schema="RequirementSet")
design = Node("design", schema="DesignSet")

profile_gate = Evaluator(
    name="select_materialization_profile",
    regime=F_P,
    description="Domain-defined choice of structural profile for the builder boundary",
    binding="exec://gsdlc.select_materialization_profile",
    tags=("profile", "selection"),
)

builder = GraphFunction(
    name="builder",
    inputs=(requirements,),
    outputs=(design,),
    template=lambda requirements: compose(
        analyze_requirements,
        shape_design,
        verify_design,
    ),
    effects=("profile_selectable",),
    tags=("builder",),
    profiles=("steelthread", "mvp", "optimal"),   # provisional surface
)

profiled_builder = gate(
    rule=Rule(
        name="materialization_profile_gate",
        kind="gate",
        config={"selection_mode": "external", "provenance": "required"},
    ),
    evaluators=(profile_gate,),
    graph_function=builder,
)
```

### What this says topologically

- one outer contract: `requirements -> design`
- multiple lawful structural profiles
- GTL exposes the profiles
- the domain chooses one
- ABG records which one was chosen

### Interface question this exposes

Do profiles belong:

- on `GraphFunction` directly?
- in a separate `VariantFamily` / `CandidateFamily` declaration?
- in `tags` / `policy_visible` metadata?

The requirements now say profiles must be possible.
This mockup helps decide the cleanest surface.

---

## 4. U2 — Gap-Triggered Context Discovery

### Pressure

A coarse contract `requirements -> design` may need discovery before it can lawfully close.
The engine must not know what the domain gap means.

### Mockup

```python
requirements = Node("requirements", schema="RequirementSet")
design = Node("design", schema="DesignSet")
context = Node("context", schema="ContextSet")

gap_fd = Evaluator(
    name="requirements_design_gap_fd",
    regime=F_D,
    description="Deterministic domain check for whether the boundary can close directly",
    binding="exec://gsdlc.requirements_design_gap_fd",
    tags=("gap", "deterministic"),
)

gap_fp = Evaluator(
    name="requirements_design_gap_fp",
    regime=F_P,
    description="Probabilistic/domain review of residual gap on the boundary",
    binding="exec://gsdlc.requirements_design_gap_fp",
    tags=("gap", "review"),
)

discover_context = deferred_refinement(
    name="discover_context",
    inputs=(requirements,),
    outputs=(context,),
    tags=("discovery", "refinement_boundary"),
    hints={"family": "gsdlc.context.discovery"},
)

requirements_to_design = GraphFunction(
    name="requirements_to_design",
    inputs=(requirements,),
    outputs=(design,),
    template=lambda requirements: compose(
        assess_requirements,
        gate(
            rule=Rule(
                name="requirements_design_gap_gate",
                kind="gate",
                config={
                    "escalation_order": (F_D, F_P, F_H),
                    "on_open": "trigger_refinement",
                },
            ),
            evaluators=(gap_fd, gap_fp),
            graph_function=discover_context,
        ),
        synthesize_design,
    ),
    effects=("may_refine",),
    tags=("requirements_to_design",),
)
```

### What this says topologically

- traversal hits a declared boundary
- evaluator outcomes may trigger lawful refinement
- GTL declares the boundary
- domain bindings define the metric
- ABG executes the protocol and records why refinement happened

### Interface question this exposes

Should `deferred_refinement(...)` be:

- a `GraphFunction`
- a boundary object consumed by `gate(...)`
- or metadata on a normal `GraphFunction`

Current requirements allow all three.
Design now has to choose.

---

## 5. U3 — Consensus-Gated Review

### Pressure

Multiple reviewers or review agents assess the same artifact.
The system loops until the review vector converges or escalation occurs.

### Mockup

```python
artifact = Node("artifact", schema="Artifact")
review = Node("review", schema="Review")
reviews = Node("reviews", schema="Vector[Review]")
decision = Node("decision", schema="Decision")

reviewer = GraphFunction(
    name="reviewer",
    inputs=(artifact,),
    outputs=(review,),
    template=lambda artifact: review_artifact,
    effects=("review",),
    tags=("reviewer",),
)

review_fd = Evaluator(
    name="review_vector_fd",
    regime=F_D,
    description="Deterministic structural checks over the review vector",
    binding="exec://gsdlc.review_vector_fd",
    tags=("review", "vector"),
)

review_fp = Evaluator(
    name="review_vector_fp",
    regime=F_P,
    description="Domain-defined convergence judgment over multiple reviews",
    binding="exec://gsdlc.review_vector_fp",
    tags=("review", "consensus"),
)

review_round = GraphFunction(
    name="review_round",
    inputs=(artifact,),
    outputs=(decision,),
    template=lambda artifact: compose(
        fan_out(reviewer),         # one review branch per reviewer/worker set
        fan_in(collate_reviews),   # produces explicit review vector
        gate(
            rule=Rule(
                name="review_consensus_gate",
                kind="gate",
                config={
                    "quorum": 3,
                    "round_bound": 5,
                    "aggregation_mode": "domain_defined",
                },
            ),
            evaluators=(review_fd, review_fp),
            graph_function=finalize_review_decision,
        ),
    ),
    effects=("review", "round_based"),
    tags=("review_round",),
)

consensus_review = recurse(
    graph_function=review_round,
    termination=Evaluator(
        name="review_closed",
        regime=F_D,
        description="Declared round termination condition for review recursion",
        binding="exec://gsdlc.review_closed",
        tags=("review", "termination"),
    ),
)
```

### What this says topologically

- review is just a vector-convergence problem
- `fan_out` creates the explicit review set
- `fan_in` makes the review vector explicit
- `gate` and evaluator bindings decide whether another round is needed
- recursion provides the loop, not a special consensus engine

### Interface question this exposes

Do we want:

- `fan_out(reviewer)` only
- or `fan_out(reviewer, over=reviewer_set)` as an explicit surface?

The requirements currently imply the latter need, but do not fix the syntax.

---

## 6. U4 — Parallel Worker Harvest

### Pressure

Multiple workers produce candidate outputs.
The candidate set is explicit.
Harvest/merge is explicit.
The final decision is replayable.

### Mockup

```python
task = Node("task", schema="Task")
candidate = Node("candidate", schema="Candidate")
candidates = Node("candidates", schema="Vector[Candidate]")
result = Node("result", schema="Result")

worker_attempt = GraphFunction(
    name="worker_attempt",
    inputs=(task,),
    outputs=(candidate,),
    template=lambda task: attempt_solution,
    effects=("parallel_candidate",),
    tags=("candidate_producer",),
)

harvest_fd = Evaluator(
    name="candidate_harvest_fd",
    regime=F_D,
    description="Deterministic checks over candidate completeness and compatibility",
    binding="exec://gsdlc.candidate_harvest_fd",
    tags=("harvest",),
)

harvest_fp = Evaluator(
    name="candidate_harvest_fp",
    regime=F_P,
    description="Domain-defined merge or selection judgment over candidate set",
    binding="exec://gsdlc.candidate_harvest_fp",
    tags=("harvest", "merge"),
)

parallel_harvest = GraphFunction(
    name="parallel_harvest",
    inputs=(task,),
    outputs=(result,),
    template=lambda task: compose(
        fan_out(worker_attempt),      # explicit candidate set
        fan_in(collate_candidates),   # explicit candidate vector
        gate(
            rule=Rule(
                name="harvest_gate",
                kind="gate",
                config={
                    "aggregation_mode": "domain_defined",
                    "selection_mode": "external",
                    "round_bound": 1,
                },
            ),
            evaluators=(harvest_fd, harvest_fp),
            graph_function=apply_harvest_decision,
        ),
    ),
    effects=("parallel_candidate_harvest",),
    tags=("harvest",),
)
```

### What this says topologically

- parallel generation is just explicit branching
- harvest is explicit reduction over a candidate vector
- merge semantics stay in the domain binding
- ABG records candidate-set provenance, evaluator outcomes, and final choice

### Interface question this exposes

Should there be a dedicated helper such as:

```python
harvest(...)
```

or is:

```python
fan_out(...) -> fan_in(...) -> gate(...)
```

already the correct prime structure?

This mockup is meant to test exactly that.

---

## 7. Common Pattern Revealed

All four use cases reduce to one reusable topological pattern:

```python
compose(
    fan_out(...) | identity(...),
    fan_in(...)  | identity(...),
    gate(...),
    deferred_refinement(...) | apply_selected_variant(...),
)
```

with:

- `GraphFunction` as the reusable compute unit
- `fan_out` / `fan_in` exposing vectors explicitly
- `gate` attaching policy-visible rule/evaluator boundaries
- `deferred_refinement` exposing lawful topology change
- ABG owning traversal, rounds, escalation, and provenance
- domains owning prompts, programs, metrics, merge semantics, and synthesis logic

That is a good sign.
It suggests we are finding reusable operators rather than piling up domain features.

---

## 8. Practical Gaps This Mockup Exposes

This mockup suggests the current requirements are close, but still leave some interface questions open:

1. **Profile declaration surface**
   - do named materialization profiles live on `GraphFunction`, in a candidate family, or in policy-visible metadata?

2. **Evaluator-set declaration surface**
   - is a tuple enough, or do we want an explicit `EvaluatorSet` / `ReviewSet` declaration?

3. **Harvest boundary shape**
   - is harvest just `fan_in + gate`, or should there be a named helper to make the pattern first-class?

4. **Vector binding surface**
   - should `fan_out` explicitly declare what set it ranges over, or should the vector live only in node schemas?

5. **Recursion round identity**
   - is round identity entirely ABG provenance, or does GTL need a more explicit recursive-round declaration surface?

These are now design questions, not requirement-level unknowns.

---

## 9. Recommended Next Move

Use these four mockups to tune:

- `gtl.function_model`
- `gtl.algebra`
- `gtl.operator_model`

before choosing one final public Python-native SDK shape.

The key test is:

- does the surface stay topological?
- does it remain thin-IoC?
- can GSDLC plug in its prompts/programs without ABG learning the domain?

If yes, the direction is working.
