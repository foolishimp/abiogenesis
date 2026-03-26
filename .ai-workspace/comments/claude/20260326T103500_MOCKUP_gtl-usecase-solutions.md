# MOCKUP: GTL Use Case Solutions — Interface Design Exercise

**Author**: claude
**Date**: 2026-03-26T21:35:00+11:00
**Purpose**: Concrete GTL mock-ups for U1-U4 using the current type surface. Not production code — design probes to tune interfaces.
**Responds to**: `codex/20260326T202830_USECASES_gap-triggered-context-discovery-and-advanced-suite.md`

---

## Preamble: Current Type Surface Used

```python
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.operator_model import F_D, F_P, F_H, Operator, Evaluator, Rule
from gtl.function_model import GraphFunction
from gtl.work_model import Job, ContractRef, Role
from gtl.module_model import Module
from gtl.algebra import edge, compose, substitute, identity
```

All mock-ups use these types exactly as they exist in `builds/claude_code/code/gtl/`.
Where the current surface is insufficient, the gap is called out explicitly.

---

## U2: Gap-Triggered Context Discovery

### The domain problem

A regulatory pipeline traverses `requirements → design`. The pipeline needs schema/rule context from a large document corpus. If context is present, continue. If absent, discovery work is needed before design can close.

### Option A — Guarded pre-authored branch

The simplest option: the domain pre-authors a discovery subgraph and the graph contains both paths.

```python
# ── Nodes ──
requirements = Node("requirements", markov=("keys_testable", "traceable"))
design       = Node("design", markov=("implements_all_reqs", "adrs_present"))
context_pool = Node("context_pool", markov=("schema_extracted", "rules_identified"))

# ── Domain-supplied evaluators ──
context_sufficient = Evaluator(
    name="context_sufficient",
    regime=F_D,
    description="Deterministic check: required schema/rule context exists in workspace",
    binding="exec://domain/checks/context_sufficient.sh",
)

context_quality = Evaluator(
    name="context_quality",
    regime=F_P,
    description="Agent assesses whether discovered context is complete enough for design",
    binding="exec://domain/prompts/assess_context_quality.py",
)

design_quality = Evaluator(
    name="design_quality",
    regime=F_P,
    description="Agent assesses design against requirements with available context",
    binding="exec://domain/prompts/assess_design.py",
)

# ── Two-path graph ──
# Path 1: direct (context already present)
direct_vector = GraphVector(
    name="requirements→design",
    source=requirements,
    target=design,
    evaluators=(context_sufficient, design_quality),
    # GAP: no guard field to express "only if context_sufficient passes"
    # Currently both paths exist unconditionally in the graph.
)

# Path 2: discovery path
discovery_vector_1 = GraphVector(
    name="requirements→context_pool",
    source=requirements,
    target=context_pool,
    operators=(Operator(name="discover_context", regime=F_P,
                        binding="exec://domain/prompts/discover_context.py"),),
    evaluators=(context_quality,),
)

discovery_vector_2 = GraphVector(
    name="context_pool→design",
    source=context_pool,
    target=design,
    evaluators=(design_quality,),
)

# The full graph — both paths present
discovery_graph = Graph(
    name="requirements→design (with discovery)",
    inputs=(requirements,),
    outputs=(design,),
    nodes=(requirements, design, context_pool),
    vectors=(direct_vector, discovery_vector_1, discovery_vector_2),
)
```

**Interface gap identified**: GraphVector has no `guard` field. Both paths are always present. ABG would need to use evaluator results to decide which vectors are active. This works today because ABG picks the first unconverged vector — but it's implicit, not declared.

### Option B — Deferred refinement via substitute()

The coarse contract is `requirements → design`. When gap analysis shows context is insufficient, a domain callback produces the inner discovery graph, and `substitute()` applies it.

```python
# ── Coarse contract ──
requirements = Node("requirements", markov=("keys_testable", "traceable"))
design       = Node("design", markov=("implements_all_reqs", "adrs_present"))

context_sufficient = Evaluator(
    name="context_sufficient",
    regime=F_D,
    description="Deterministic check: required schema/rule context exists",
    binding="exec://domain/checks/context_sufficient.sh",
)

design_quality = Evaluator(
    name="design_quality",
    regime=F_P,
    description="Agent assesses design against requirements",
    binding="exec://domain/prompts/assess_design.py",
)

coarse_vector = GraphVector(
    name="requirements→design",
    source=requirements,
    target=design,
    evaluators=(context_sufficient, design_quality),
    # GAP: no synthesis-point declaration here.
    # How does ABG know this vector is refinement-eligible?
    # Option: allows_subwork=True is close but semantically different.
    # Proposed: tags=("synthesis:eligible",) as convention
    # Better: a first-class field like `allows_refinement=True`
    tags=("synthesis:eligible",),
)

coarse_graph = Graph(
    name="requirements→design",
    inputs=(requirements,),
    outputs=(design,),
    nodes=(requirements, design),
    vectors=(coarse_vector,),
)

# ── Domain-supplied refinement (produced by consumer callback) ──
# This is what the domain's synthesis hook returns when context is insufficient.

context_pool = Node("context_pool", markov=("schema_extracted", "rules_identified"))

context_quality = Evaluator(
    name="context_quality",
    regime=F_P,
    description="Agent assesses discovered context completeness",
    binding="exec://domain/prompts/assess_context_quality.py",
)

inner_graph = Graph(
    name="discovery_refinement",
    inputs=(requirements,),      # must match coarse vector source
    outputs=(design,),           # must match coarse vector target
    nodes=(requirements, context_pool, design),
    vectors=(
        GraphVector(
            name="requirements→context_pool",
            source=requirements,
            target=context_pool,
            operators=(Operator(name="discover_context", regime=F_P,
                                binding="exec://domain/prompts/discover_context.py"),),
            evaluators=(context_quality,),
        ),
        GraphVector(
            name="context_pool→design",
            source=context_pool,
            target=design,
            evaluators=(design_quality,),
        ),
    ),
)

# ── ABG applies the refinement ──
refined = substitute(coarse_graph, coarse_vector.id, inner_graph)

# refined now has:
#   inputs=(requirements,), outputs=(design,)  — outer contract preserved
#   nodes=(requirements, context_pool, design)
#   vectors=(requirements→context_pool, context_pool→design)
#   tags=("substituted:requirements→design",)  — provenance
```

**Interface gap identified**: No first-class synthesis-point declaration on GraphVector. The `tags=("synthesis:eligible",)` convention works but it's not enforced. REQ-L-GTL2-SYNTHESIS-001 says GTL shall provide a declarative surface — this needs to be a field, not a tag.

**What works well**: `substitute()` already does exactly what's needed. Interface validation (inner.inputs ⊆ vector.source, vector.target ∈ inner.outputs) is already enforced. Provenance tag is already added. The algebra is sufficient.

### Option C — Candidate family + evaluator selection

The domain publishes two GraphFunctions with the same interface. ABG enumerates candidates, and selection logic (F_D/F_P/F_H) chooses.

```python
# ── Shared interface ──
requirements = Node("requirements", markov=("keys_testable", "traceable"))
design       = Node("design", markov=("implements_all_reqs", "adrs_present"))

# ── Candidate 1: direct (context already present) ──
def _direct_template():
    return edge(
        requirements, design,
        evaluators=(
            Evaluator(name="context_sufficient", regime=F_D,
                      binding="exec://domain/checks/context_sufficient.sh"),
            Evaluator(name="design_quality", regime=F_P,
                      binding="exec://domain/prompts/assess_design.py"),
        ),
    )

gf_direct = GraphFunction(
    name="direct_design",
    inputs=(requirements,),
    outputs=(design,),
    template=_direct_template,
    effects=("deterministic",),
    tags=("profile:stable_domain", "complexity:low"),
)

# ── Candidate 2: discovery path ──
def _discovery_template():
    context_pool = Node("context_pool", markov=("schema_extracted",))
    return Graph(
        name="discovery→design",
        inputs=(requirements,),
        outputs=(design,),
        nodes=(requirements, context_pool, design),
        vectors=(
            GraphVector(
                name="requirements→context_pool",
                source=requirements, target=context_pool,
                operators=(Operator(name="discover", regime=F_P,
                                    binding="exec://domain/prompts/discover.py"),),
                evaluators=(Evaluator(name="context_quality", regime=F_P,
                                      binding="exec://domain/prompts/assess_context.py"),),
            ),
            GraphVector(
                name="context_pool→design",
                source=context_pool, target=design,
                evaluators=(Evaluator(name="design_quality", regime=F_P,
                                      binding="exec://domain/prompts/assess_design.py"),),
            ),
        ),
    )

gf_discovery = GraphFunction(
    name="discovery_design",
    inputs=(requirements,),
    outputs=(design,),
    template=_discovery_template,
    effects=("probabilistic",),
    tags=("profile:discovery_heavy", "complexity:high"),
)

# ── Module publishes both candidates ──
module = Module(
    name="regulatory_pipeline",
    graph_functions=(gf_direct, gf_discovery),
    # ABG's enumerate_candidates() will find both for the
    # requirements→design contract since they share the interface.
    # Selection is external: F_D rule, F_P analysis, or F_H judgment.
)
```

**What works well**: GraphFunction interface (inputs/outputs), tags for filtering, Module as catalog, `enumerate_candidates()` for discovery. This is the cleanest of the three options — no gaps in the current type surface.

**Interface gap**: No `SelectionPolicy` to declare *how* the choice should be made. Currently ABG auto-selects if exactly 1 match. Multi-candidate selection needs a declared policy (e.g., "try F_D rule first, fall back to F_P").

---

## U1: Ranked Decomposition / Materialization Profiles

### The domain problem

One SDLC pipeline, three delivery profiles: steelthread (3 edges), mvp (8 edges), optimal (11 edges). Same outer contract (intent → verified_code), different internal complexity.

```python
# ── Shared interface ──
intent = Node("intent", markov=("approved",))
verified_code = Node("verified_code", markov=("tests_pass", "coverage_met"))

# ── Profile: steelthread ──
def _steelthread_template():
    design = Node("design")
    code = Node("code")
    return Graph(
        name="steelthread",
        inputs=(intent,), outputs=(verified_code,),
        nodes=(intent, design, code, verified_code),
        vectors=(
            GraphVector(name="intent→design", source=intent, target=design,
                        evaluators=(Evaluator(name="design_ok", regime=F_P,
                                              binding="exec://gsdlc/prompts/design.py"),)),
            GraphVector(name="design→code", source=design, target=code,
                        evaluators=(Evaluator(name="code_ok", regime=F_P,
                                              binding="exec://gsdlc/prompts/code.py"),)),
            GraphVector(name="code→verified", source=code, target=verified_code,
                        evaluators=(Evaluator(name="tests", regime=F_D,
                                              binding="exec://gsdlc/checks/run_tests.sh"),)),
        ),
    )

gf_steelthread = GraphFunction(
    name="steelthread",
    inputs=(intent,), outputs=(verified_code,),
    template=_steelthread_template,
    effects=("probabilistic",),
    tags=("profile:steelthread", "edges:3"),
)

# ── Profile: mvp (adds requirements, feature_decomp, unit_tests, integration_tests) ──
def _mvp_template():
    reqs = Node("requirements", markov=("traceable",))
    feat = Node("feature_decomp")
    design = Node("design", markov=("adrs_present",))
    code = Node("code")
    unit_tests = Node("unit_tests", markov=("all_pass",))
    int_tests = Node("integration_tests", markov=("all_pass",))
    return Graph(
        name="mvp",
        inputs=(intent,), outputs=(verified_code,),
        nodes=(intent, reqs, feat, design, code, unit_tests, int_tests, verified_code),
        vectors=(
            GraphVector(name="intent→reqs", source=intent, target=reqs,
                        evaluators=(Evaluator(name="reqs_ok", regime=F_P,
                                              binding="exec://gsdlc/prompts/requirements.py"),)),
            GraphVector(name="reqs→feat", source=reqs, target=feat,
                        evaluators=(Evaluator(name="feat_ok", regime=F_H,
                                              description="Human approves feature decomposition"),)),
            GraphVector(name="feat→design", source=feat, target=design,
                        evaluators=(Evaluator(name="design_ok", regime=F_P,
                                              binding="exec://gsdlc/prompts/design.py"),)),
            GraphVector(name="design→code", source=design, target=code,
                        evaluators=(Evaluator(name="code_ok", regime=F_P,
                                              binding="exec://gsdlc/prompts/code.py"),)),
            GraphVector(name="code→unit", source=code, target=unit_tests,
                        evaluators=(Evaluator(name="unit_tests", regime=F_D,
                                              binding="exec://gsdlc/checks/run_unit.sh"),)),
            GraphVector(name="code→int", source=code, target=int_tests,
                        evaluators=(Evaluator(name="int_tests", regime=F_D,
                                              binding="exec://gsdlc/checks/run_integration.sh"),)),
            GraphVector(name="int→verified",
                        source=(unit_tests, int_tests),  # multi-input join
                        target=verified_code,
                        evaluators=(Evaluator(name="all_green", regime=F_D,
                                              binding="exec://gsdlc/checks/all_tests_pass.sh"),)),
        ),
    )

gf_mvp = GraphFunction(
    name="mvp",
    inputs=(intent,), outputs=(verified_code,),
    template=_mvp_template,
    effects=("probabilistic", "human_judgment"),
    tags=("profile:mvp", "edges:7"),
)

# ── Profile: optimal (full SDLC — adds UAT, user_guide, etc.) ──
# Similar pattern — omitted for brevity, same interface contract.

# ── Module with all profiles ──
sdlc_module = Module(
    name="gsdlc",
    graph_functions=(gf_steelthread, gf_mvp),  # + gf_optimal
    metadata={"profiles": ["steelthread", "mvp", "optimal"]},
)

# ── Selection via compose with a profile-selection GraphFunction ──
# ABG's enumerate_candidates() returns both for the intent→verified_code contract.
# Selection is domain-driven:
#   F_D: rule says "if complexity:low, use steelthread"
#   F_P: agent analyzes intent and recommends profile
#   F_H: human chooses
```

**What works well**: Same interface contract, tags for profile metadata, Module as catalog, effects for regime visibility. `enumerate_candidates()` finds all three. Existing types are sufficient.

**Interface gap**: Same as U2-C — no SelectionPolicy declaration. Also no way to express the *relationship* between profiles (steelthread ⊂ mvp ⊂ optimal) — tags hint at it but there's no structural ordering.

---

## U3: Consensus-Gated Review

### The domain problem

An artifact needs review by multiple agents/humans. Domain-defined consensus policy determines when enough agreement exists.

```python
# ── Nodes ──
artifact     = Node("artifact", markov=("complete", "linted"))
reviewed     = Node("reviewed_artifact", markov=("consensus_reached",))

# ── Evaluator set (EVALUATOR-008: explicit evaluator set on boundary) ──
reviewer_1 = Evaluator(
    name="reviewer_arch",
    regime=F_P,
    description="Architecture reviewer: assesses structural quality",
    binding="exec://domain/prompts/review_architecture.py",
    tags=("role:architect",),
)

reviewer_2 = Evaluator(
    name="reviewer_security",
    regime=F_P,
    description="Security reviewer: assesses vulnerability surface",
    binding="exec://domain/prompts/review_security.py",
    tags=("role:security",),
)

reviewer_3 = Evaluator(
    name="reviewer_product",
    regime=F_H,
    description="Product owner: approves fitness for purpose",
)

# ── Consensus rule (RULE-005: quorum, ordering, round bounds) ──
review_consensus = Rule(
    name="review_consensus",
    kind="consensus",
    config={
        "quorum": 2,           # 2 of 3 must pass
        "max_rounds": 3,       # bounded iteration
        "ordering": "parallel", # all evaluators run concurrently per round
        "aggregation": "majority",
        # Domain-defined: what "pass" means per evaluator is in the binding,
        # not here. This only declares the structural policy.
    },
)

# ── The review vector — evaluator set + consensus rule ──
review_vector = GraphVector(
    name="artifact→reviewed",
    source=artifact,
    target=reviewed,
    evaluators=(reviewer_1, reviewer_2, reviewer_3),
    rule=review_consensus,
    # ABG sees: 3 evaluators, consensus rule with quorum=2, max_rounds=3
    # ABG executes: fan-out to all 3, collect results, check quorum,
    #   loop if not met (up to max_rounds), escalate if stuck
    # Domain owns: what each reviewer checks, what "pass" means
)

review_graph = Graph(
    name="consensus_review",
    inputs=(artifact,),
    outputs=(reviewed,),
    nodes=(artifact, reviewed),
    vectors=(review_vector,),
)
```

**What works well**: Evaluator tuple already supports multiple evaluators on one vector. Rule.config already supports arbitrary policy parameters. The evaluator multiplicity spec changes (EVALUATOR-008, RULE-005, CONVERGENCE-007/008) formalize exactly this pattern.

**What ABG needs to do** (already mostly works):
1. `bind_fd()` iterates evaluators — already does this
2. `delta()` counts failing evaluators as fraction — already does this
3. Per-evaluator event emission — needs explicit `assessed{evaluator: name}` per evaluator
4. Round management — `delta()` needs round awareness + max_rounds bound
5. Quorum check — `delta()` needs to check quorum from Rule.config instead of "all must pass"

**Interface gap**: `delta()` currently treats the evaluator tuple as "all must pass" (fraction of failures). CONVERGENCE-007/008 says it should support evaluator-result vectors with declared aggregation. The gap is small — change `delta()` to read the vector's Rule.config for aggregation mode instead of hardcoding "all pass."

---

## U4: Parallel Worker Harvest

### The domain problem

Multiple workers produce candidate outputs for a code generation task. A harvest policy selects the best candidate. The worker set, candidate set, and harvest decision are all explicit and replayable.

```python
# ── Nodes ──
design       = Node("design", markov=("approved",))
code         = Node("code", markov=("compiles", "tests_pass"))

# ── Worker-specific operators (each is a distinct F_P actor) ──
worker_fast = Operator(
    name="code_gen_fast",
    regime=F_P,
    binding="exec://domain/prompts/code_gen_fast.py",
    tags=("worker:fast", "strategy:greedy"),
)

worker_careful = Operator(
    name="code_gen_careful",
    regime=F_P,
    binding="exec://domain/prompts/code_gen_careful.py",
    tags=("worker:careful", "strategy:thorough"),
)

worker_creative = Operator(
    name="code_gen_creative",
    regime=F_P,
    binding="exec://domain/prompts/code_gen_creative.py",
    tags=("worker:creative", "strategy:exploratory"),
)

# ── Evaluators ──
compiles_check = Evaluator(
    name="compiles",
    regime=F_D,
    description="Code compiles without errors",
    binding="exec://domain/checks/compile.sh",
)

test_check = Evaluator(
    name="tests_pass",
    regime=F_D,
    description="All unit tests pass",
    binding="exec://domain/checks/run_tests.sh",
)

quality_judge = Evaluator(
    name="code_quality",
    regime=F_P,
    description="Agent assesses code quality, readability, and design adherence",
    binding="exec://domain/prompts/judge_code_quality.py",
)

# ── Harvest rule ──
harvest_rule = Rule(
    name="harvest_best",
    kind="harvest",
    config={
        "candidates": 3,          # expect 3 candidate outputs
        "selection": "scored",     # domain scoring function picks best
        "fallback": "first_passing",  # if scoring fails, take first that passes F_D
        "require_fd": True,        # all candidates must pass F_D before F_P scoring
    },
)

# ── Current surface limitation: one vector, one operator ──
# GraphVector.operators is a tuple, so multiple operators CAN be declared.
# But the semantics of "run all 3 operators and harvest results" is not
# expressed by the current type surface. It looks like:

harvest_vector = GraphVector(
    name="design→code",
    source=design,
    target=code,
    operators=(worker_fast, worker_careful, worker_creative),
    evaluators=(compiles_check, test_check, quality_judge),
    rule=harvest_rule,
    tags=("pattern:parallel_harvest",),
)

# ABG sees: 3 operators, 3 evaluators, harvest rule
# ABG should:
#   1. fan-out: dispatch all 3 operators (parallel or sequential per policy)
#   2. per-candidate F_D: run compiles + tests on each candidate
#   3. filter: discard candidates that fail F_D
#   4. F_P scoring: run quality_judge on surviving candidates
#   5. harvest: apply Rule.config selection policy
#   6. emit provenance: which candidates existed, which passed F_D,
#      which was selected, by what score

harvest_graph = Graph(
    name="parallel_harvest",
    inputs=(design,),
    outputs=(code,),
    nodes=(design, code),
    vectors=(harvest_vector,),
)
```

**What works well**: GraphVector.operators already accepts a tuple of operators. Rule.config can express the harvest policy. Evaluators assess each candidate. The types are sufficient for *declaration*.

**Interface gap**: ABG doesn't know the operators should run in parallel and produce competing candidates. Currently operators on a vector are just metadata — ABG doesn't dispatch them. The missing semantics:
- "these operators produce competing candidates, not sequential steps"
- "evaluate each candidate independently, then harvest"
- This is where HOF-008 (fan_out/fan_in over operator/evaluator vectors) becomes real

**Possible resolution without new types**: Use the `allows_subwork=True` field + LeafTask pattern. Each operator becomes a leaf task, each candidate is a leaf result, harvest is the parent vector's convergence check. This is close to how ABG already handles subwork — the gap is making it explicit that the subwork pattern is "parallel candidates" not "sequential decomposition."

---

## U2 + U3 Composed: Discovery With Consensus Review

The power test — compose use cases.

```python
# ── Discovery graph function (from U2 Option B) ──
gf_discovery = GraphFunction(
    name="discovery_design",
    inputs=(requirements,),
    outputs=(design,),
    template=_discovery_template,  # from U2 above
    effects=("probabilistic",),
)

# ── Consensus review graph function (from U3) ──
gf_review = GraphFunction(
    name="consensus_review",
    inputs=(design,),        # input = design (output of discovery)
    outputs=(reviewed,),
    template=lambda: review_graph,  # from U3 above
    effects=("probabilistic", "human_judgment"),
)

# ── Compose them ──
gf_discovery_then_review = compose(gf_discovery, gf_review)
# Result:
#   name = "discovery_design;consensus_review"
#   inputs = (requirements,)
#   outputs = (reviewed,)
#   effects = ("probabilistic", "probabilistic", "human_judgment")
#   template = composed callable that materializes the union graph
```

**What works well**: `compose()` handles this correctly today. Interface validation passes (discovery.outputs satisfies review.inputs). Effects propagate. Template composition materializes the union graph. This is the monadic bind working as designed.

---

## Summary: Interface Gaps Found

| Gap | Use Case | Current State | Proposed Fix | Size |
|-----|----------|--------------|-------------|------|
| **No guard/condition on GraphVector** | U2-A | Both paths always present | Add `guard: str = ""` field — predicate reference, ABG evaluates | Small |
| **No synthesis-point declaration** | U2-B | `tags=("synthesis:eligible",)` convention | Add `allows_refinement: bool = False` field on GraphVector | Small |
| **No SelectionPolicy** | U2-C, U1 | Auto-select if 1 match, undefined for N matches | Add policy declaration on Module or GraphVector (can start as Rule.config) | Small |
| **Harvest semantics for parallel operators** | U4 | Operators are metadata, not dispatched | Clarify operator-tuple semantics + extend `allows_subwork` pattern for parallel candidates | Medium |
| **Round-aware convergence** | U3, U4 | `delta()` has no round concept | Read Rule.config for max_rounds/quorum, add round tracking in events | Medium |
| **Quorum-based delta** | U3 | `delta()` = fraction of failing evaluators (all must pass) | Read Rule.config.aggregation to determine pass/fail threshold | Small |

### What already works without changes

- `compose()` — sequential composition with interface validation
- `substitute()` — lawful refinement with outer contract preservation + provenance
- `enumerate_candidates()` — multi-candidate discovery by interface matching
- Evaluator tuples on GraphVector — multiple evaluators already declared
- Rule.config — arbitrary policy parameters already supported
- Module as catalog — graph functions, evaluators, rules all publishable
- GraphFunction interface — explicit inputs/outputs, effects, tags
- `identity()` — neutral element under composition

### What the mock-ups prove

1. **The current types are very close.** Four use cases, six small gaps. No new types needed — just field additions and ABG behavior changes.
2. **compose() and substitute() are the right primitives.** U2-B and the composed U2+U3 scenario work today.
3. **Evaluator multiplicity on GraphVector already works declaratively.** ABG just needs to read Rule.config for aggregation policy instead of hardcoding "all must pass."
4. **The biggest gap is ABG execution semantics, not GTL types.** The types can express U1-U4 today (with minor field additions). The gap is in how ABG interprets operator tuples, round bounds, and quorum policies.
