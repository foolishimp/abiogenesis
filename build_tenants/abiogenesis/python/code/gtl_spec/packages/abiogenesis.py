# Implements: REQ-P-SCENARIOS
"""
abiogenesis — project spec as a GTL Module

abiogenesis follows the standard SDLC bootstrap graph:

    intent → requirements → feature_decomp → design → code ↔ unit_tests
                                                  └→ bootloader_doc

abiogenesis depends on itself (the GTL engine) and is built using it.
The engine lives at .genesis/genesis/; run as:
    PYTHONPATH=.genesis python -m genesis <command> --workspace .

No separate requirements document. REQ keys emerge from this Module
and are traced through feature vectors in .ai-workspace/features/.
"""

from gtl.function_model import GraphFunction
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.module_model import Module
from gtl.work_model import Job, ContractRef, Role
from gtl.algebra import deferred_refinement

from gtl.operator_model import (
    Evaluator, Operator, Rule,
    F_D, F_P, F_H,
)


# ── Contexts ──────────────────────────────────────────────────────────────────
# Digests are sha256 of the file content at package activation time.
# PENDING = not yet computed — update when file content stabilises.

bootloader = Context(
    name="bootloader",
    locator="workspace://build_tenants/abiogenesis/python/code/gtl_spec/GTL_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,   # PENDING
)

this_spec = Context(
    name="abiogenesis_spec",
    locator="workspace://build_tenants/abiogenesis/python/code/gtl_spec/packages/abiogenesis.py",
    digest="sha256:" + "0" * 64,   # PENDING — self-referential
)

intent_doc = Context(
    name="intent",
    locator="workspace://specification/INTENT.md",
    digest="sha256:" + "0" * 64,   # PENDING — written at intent edge
)

design_adrs = Context(
    name="design_adrs",
    locator="workspace://build_tenants/abiogenesis/python/design/adrs/",
    digest="sha256:" + "0" * 64,   # PENDING — written at design edge
)

specification_dir = Context(
    name="specification_dir",
    locator="workspace://specification/",
    digest="sha256:" + "0" * 64,   # PENDING
)


# ── Operators ────────────────────────────────────────────────────────────────

claude_agent  = Operator("claude_agent",  F_P, "agent://claude/genesis")
human_gate    = Operator("human_gate",    F_H, "fh://single")
pytest_op     = Operator("pytest",        F_D, "exec://python -m pytest build_tenants/abiogenesis/python/test_env/tests/ -q -m 'not e2e'")
check_impl_op = Operator("check_impl",    F_D, "exec://python -m genesis check-tags --type implements --path build_tenants/abiogenesis/python/code/genesis/")
check_test_op = Operator("check_test",    F_D, "exec://python -m genesis check-tags --type validates --path build_tenants/abiogenesis/python/test_env/tests/")
check_bootloader_op = Operator("check_bootloader", F_D, "exec://python -m genesis check-bootloader-consistency --spec-module gtl --bootloader .genesis/gtl_spec/GTL_BOOTLOADER.md")


# ── Rules ───────────────────────────────────────────────────────────────────

standard_gate = Rule(
    name="standard_gate", kind="gate",
    config={"approve": {"kind": "consensus", "n": 1, "m": 1}, "dissent": "recorded"},
)


# ── Nodes ───────────────────────────────────────────────────────────────────

intent = Node(name="intent")
requirements = Node(name="requirements")
feature_decomp = Node(name="feature_decomp")
design = Node(name="design")
code = Node(name="code")
unit_tests = Node(name="unit_tests")
bootloader_doc = Node(name="bootloader_doc")


# ── Evaluators ──────────────────────────────────────────────────────────────

# intent→requirements
eval_intent_fh = Evaluator(
    "intent_approved", F_H,
    "Human confirms: problem is clearly stated, value proposition is evident, scope is bounded",
)

# requirements→feature_decomp
eval_req_coverage = Evaluator(
    "req_coverage", F_D,
    "Every REQ key in Module.metadata.requirements appears in ≥1 feature vector satisfies: field",
    binding="exec://python -m genesis check-req-coverage --package gtl_spec.packages.abiogenesis:module --features .ai-workspace/features/",
)
eval_decomp_fp = Evaluator(
    "decomp_complete", F_P,
    "Construct feature vectors for all uncovered REQ keys — write one .yml per feature to "
    ".ai-workspace/features/active/ with a satisfies: list covering the assigned REQ-* keys. "
    "Group related keys into cohesive features. Each vector must cover at least one uncovered key.",
)
eval_decomp_fh = Evaluator(
    "decomp_approved", F_H,
    "Human approves: feature set is complete, dependency order is correct, MVP boundary is clear",
)

# feature_decomp→design
eval_design_fp = Evaluator(
    "design_coherent", F_P,
    "Agent: ADRs cover all features, tech stack is decided, interfaces are specified, and no implementation details have leaked into spec.",
)
eval_design_fh = Evaluator(
    "design_approved", F_H,
    "Human approves design before any code is written",
)

# design→bootloader_doc
eval_bootdoc_consistency = Evaluator(
    "gtl_type_consistency", F_D,
    "All exported type names from the gtl package appear in GTL_BOOTLOADER.md",
    binding="exec://python -m genesis check-bootloader-consistency --spec-module gtl --bootloader .genesis/gtl_spec/GTL_BOOTLOADER.md",
)
eval_bootdoc_fp = Evaluator(
    "synthesize_bootloader", F_P,
    "Agent renders specification content into bootloader markdown, ensuring all GTL type names "
    "and axiom references are consistent with the source code.",
)

# design→code
eval_impl_tags = Evaluator(
    "impl_tags", F_D,
    "All source files carry at least one # Implements: REQ-* tag, zero untagged",
    binding="exec://python -m genesis check-tags --type implements --path build_tenants/abiogenesis/python/code/genesis/",
)
eval_impl_coverage = Evaluator(
    "impl_coverage", F_D,
    "Every REQ key in Module.metadata.requirements appears in ≥1 source file as # Implements: {key}",
    binding="exec://python -m genesis check-impl-coverage --package gtl_spec.packages.abiogenesis:module --path build_tenants/abiogenesis/python/",
)
eval_code_fp = Evaluator(
    "code_complete", F_P,
    "Agent: code implements all features per design ADRs and remains importable.",
)

# code↔unit_tests
eval_tests_pass = Evaluator(
    "tests_pass", F_D,
    "pytest: zero failures, zero errors",
    binding="exec://python -m pytest build_tenants/abiogenesis/python/test_env/tests/ -q --tb=short -m 'not e2e'",
)
eval_test_tags = Evaluator(
    "validates_tags", F_D,
    "All test files carry at least one # Validates: REQ-* tag, zero untagged",
    binding="exec://python -m genesis check-tags --type validates --path build_tenants/abiogenesis/python/test_env/tests/",
)
eval_validates_coverage = Evaluator(
    "validates_coverage", F_D,
    "Every REQ key in Module.metadata.requirements appears in ≥1 test file as # Validates: {key}",
    binding="exec://python -m genesis check-validates-coverage --package gtl_spec.packages.abiogenesis:module --path build_tenants/abiogenesis/python/test_env/tests/",
)
eval_coverage_fp = Evaluator(
    "coverage_complete", F_P,
    "Agent: test suite covers all features and no REQ key lacks a corresponding test.",
)


# ── Graph Vectors ────────────────────────────────────────────────────────────
# Each vector carries its own operators, evaluators, and contexts.

v_intent_req = GraphVector(
    name="intent→requirements",
    source=intent,
    target=requirements,
    operators=(claude_agent, human_gate),
    evaluators=(eval_intent_fh,),
    contexts=(bootloader, this_spec),
    rule=standard_gate,
)

v_req_feat = GraphVector(
    name="requirements→feature_decomp",
    source=requirements,
    target=feature_decomp,
    operators=(claude_agent, human_gate),
    evaluators=(eval_req_coverage, eval_decomp_fp, eval_decomp_fh),
    contexts=(bootloader, this_spec, intent_doc),
    rule=standard_gate,
)

v_feat_design = GraphVector(
    name="feature_decomp→design",
    source=feature_decomp,
    target=design,
    operators=(claude_agent, human_gate),
    evaluators=(eval_design_fp, eval_design_fh),
    contexts=(bootloader, this_spec, intent_doc),
    rule=standard_gate,
)

v_design_bootdoc = GraphVector(
    name="design→bootloader_doc",
    source=design,
    target=bootloader_doc,
    operators=(claude_agent, check_bootloader_op),
    evaluators=(eval_bootdoc_consistency, eval_bootdoc_fp),
    contexts=(bootloader, this_spec, specification_dir),
)

v_design_code = GraphVector(
    name="design→code",
    source=design,
    target=code,
    operators=(claude_agent, check_impl_op),
    evaluators=(eval_impl_tags, eval_impl_coverage, eval_code_fp),
    contexts=(bootloader, this_spec, design_adrs),
)

v_tdd = GraphVector(
    name="code↔unit_tests",
    source=(code, unit_tests),
    target=unit_tests,
    operators=(claude_agent, pytest_op, check_impl_op, check_test_op),
    evaluators=(eval_tests_pass, eval_test_tags, eval_validates_coverage, eval_coverage_fp),
    contexts=(bootloader, this_spec, design_adrs),
)


# ── SDLC Graph ───────────────────────────────────────────────────────────────

sdlc_graph = Graph(
    name="sdlc",
    inputs=(intent,),
    outputs=(unit_tests, bootloader_doc),
    nodes=(intent, requirements, feature_decomp, design, code, unit_tests, bootloader_doc),
    vectors=(v_intent_req, v_req_feat, v_feat_design, v_design_bootdoc, v_design_code, v_tdd),
    contexts=(bootloader, this_spec, intent_doc, design_adrs, specification_dir),
)


def _graph_function_for_vector(vector: GraphVector) -> GraphFunction:
    source = vector.source if isinstance(vector.source, tuple) else (vector.source,)
    return GraphFunction.from_graph(
        name=vector.name,
        graph=Graph(
            name=f"{vector.name}_workflow",
            inputs=source,
            outputs=(vector.target,),
            nodes=tuple(dict.fromkeys((*source, vector.target))),
            vectors=(vector,),
            contexts=vector.contexts,
        ),
    )


gf_intent_req = _graph_function_for_vector(v_intent_req)
gf_req_feat = _graph_function_for_vector(v_req_feat)
gf_feat_design = _graph_function_for_vector(v_feat_design)
gf_design_bootdoc = _graph_function_for_vector(v_design_bootdoc)
gf_design_code = _graph_function_for_vector(v_design_code)
gf_tdd = _graph_function_for_vector(v_tdd)


# ── Roles (semantic capability classes) ──────────────────────────────────────
# ADR-030 §3: shipped modules declare explicit Module.roles.

role_constructor = Role(name="constructor", tags=("f_p",))


# ── Jobs (explicit GTL Job per graph function) ───────────────────────────────
# Each Job binds to one published GraphFunction via ContractRef. No auto-derivation.
# ADR-030 §3: jobs with F_P evaluators require constructor role;
# F_H-only or F_D-only jobs explicitly declare roles=().

job_intent_req = Job(
    name="intent→requirements",
    contracts=(ContractRef(kind="graph_function", target_id=gf_intent_req.id),),
    roles=(),  # F_H only — no construction capability needed
)
job_req_feat = Job(
    name="requirements→feature_decomp",
    contracts=(ContractRef(kind="graph_function", target_id=gf_req_feat.id),),
    roles=(role_constructor,),
)
job_feat_design = Job(
    name="feature_decomp→design",
    contracts=(ContractRef(kind="graph_function", target_id=gf_feat_design.id),),
    roles=(role_constructor,),
)
job_design_bootdoc = Job(
    name="design→bootloader_doc",
    contracts=(ContractRef(kind="graph_function", target_id=gf_design_bootdoc.id),),
    roles=(role_constructor,),
)
job_design_code = Job(
    name="design→code",
    contracts=(ContractRef(kind="graph_function", target_id=gf_design_code.id),),
    roles=(role_constructor,),
)
job_tdd = Job(
    name="code↔unit_tests",
    contracts=(ContractRef(kind="graph_function", target_id=gf_tdd.id),),
    roles=(role_constructor,),
)


# ── Published traversal boundaries ──────────────────────────────────────────

rb_intent_req = deferred_refinement(
    v_intent_req.name,
    inputs=(intent,),
    outputs=(requirements,),
)
rb_req_feat = deferred_refinement(
    v_req_feat.name,
    inputs=(requirements,),
    outputs=(feature_decomp,),
)
rb_feat_design = deferred_refinement(
    v_feat_design.name,
    inputs=(feature_decomp,),
    outputs=(design,),
)
rb_design_bootdoc = deferred_refinement(
    v_design_bootdoc.name,
    inputs=(design,),
    outputs=(bootloader_doc,),
)
rb_design_code = deferred_refinement(
    v_design_code.name,
    inputs=(design,),
    outputs=(code,),
)
rb_tdd = deferred_refinement(
    v_tdd.name,
    inputs=(code, unit_tests),
    outputs=(unit_tests,),
)


# ── Module ──────────────────────────────────────────────────────────────────
# requirements list is the authoritative REQ key registry for this project.
# Add keys here as requirements are written; check-req-coverage enforces coverage.

module = Module(
    name="abiogenesis",
    graphs=(sdlc_graph,),
    graph_functions=(
        gf_intent_req,
        gf_req_feat,
        gf_feat_design,
        gf_design_bootdoc,
        gf_design_code,
        gf_tdd,
    ),
    refinement_boundaries=(
        rb_intent_req,
        rb_req_feat,
        rb_feat_design,
        rb_design_bootdoc,
        rb_design_code,
        rb_tdd,
    ),
    jobs=(job_intent_req, job_req_feat, job_feat_design, job_design_bootdoc, job_design_code, job_tdd),
    roles=(role_constructor,),
    metadata={
        "requirements": [
            "REQ-L-GTL3-LANGUAGE",
            "REQ-L-GTL3-ATTRS",
            "REQ-L-GTL3-CONTEXT",
            "REQ-L-GTL3-GRAPH",
            "REQ-L-GTL3-NODE",
            "REQ-L-GTL3-GRAPHVECTOR",
            "REQ-L-GTL3-INTERFACE",
            "REQ-L-GTL3-OPERATOR",
            "REQ-L-GTL3-EVALUATOR",
            "REQ-L-GTL3-RULE",
            "REQ-L-GTL3-GRAPHFUNCTION",
            "REQ-L-GTL3-HOOKS",
            "REQ-L-GTL3-COMPOSE",
            "REQ-L-GTL3-SUBSTITUTE",
            "REQ-L-GTL3-RECURSE",
            "REQ-L-GTL3-HOF",
            "REQ-L-GTL3-LAWS",
            "REQ-L-GTL3-SYNTHESIS",
            "REQ-L-GTL3-SELECTION-BOUNDARY",
            "REQ-L-GTL3-IDENTITY",
            "REQ-L-GTL3-MODULE",
            "REQ-L-GTL3-JOB",
            "REQ-L-GTL3-ROLE",
            "REQ-L-GTL3-SUBWORK",
            "REQ-R-ABG3-JOB-WORKER",
            "REQ-R-ABG3-BINDING",
            "REQ-R-ABG3-WORKER",
            "REQ-R-ABG3-PROVENANCE",
            "REQ-R-ABG3-CORRECTION",
            "REQ-R-ABG3-CONVERGENCE",
            "REQ-R-ABG3-EVENTS",
            "REQ-R-ABG3-LINEAGE",
            "REQ-R-ABG3-PROJECTION",
            "REQ-R-ABG3-SELECTION-APPLICATION",
            "REQ-R-ABG3-RUN",
            "REQ-R-ABG3-GRAPHCALL",
            "REQ-R-ABG3-FRAME",
            "REQ-R-ABG3-CONTINUATION",
            "REQ-R-ABG3-LEAFTASK",
            "REQ-R-ABG3-POLICY",
            "REQ-R-ABG3-TRANSPORT",
            "REQ-R-ABG3-INTERPRET",
            "REQ-R-ABG3-SELFHOSTING",
            "REQ-M-GTL3-MAPPING",
            "REQ-P-POLICY",
            "REQ-P-SCENARIOS",
            "REQ-P-QUAL",
        ],
    },
)


if __name__ == "__main__":
    import json
    print(json.dumps({
        "module": module.name,
        "graphs": [g.name for g in module.graphs],
        "nodes": [n.name for n in sdlc_graph.nodes],
        "vectors": [v.name for v in sdlc_graph.vectors],
        "requirements": module.metadata["requirements"],
    }, indent=2))
