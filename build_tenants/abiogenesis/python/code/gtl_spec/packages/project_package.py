"""
project_package — project spec as a GTL Module

This package follows the standard SDLC bootstrap graph:

    intent → requirements → feature_decomp → design → code ↔ unit_tests → uat_tests

UAT is constitutional: shipping requires sandbox e2e proof, not unit tests alone.
F_D evaluators must be acyclic — never invoke genesis subcommands from pytest.

The project package depends on abiogenesis (the GTL + ABG engine) and is built using it.
The engine lives at .genesis/genesis/; run as:
    PYTHONPATH=.genesis python -m genesis <command> --workspace .

No separate requirements document. REQ keys emerge from this Module
and are traced through feature vectors in .ai-workspace/features/.
"""

from gtl.function_model import GraphFunction
from gtl.graph import Graph, Node, Context, GraphVector
from gtl.module_model import Module
from gtl.work_model import Job, ContractRef, Role
from gtl.algebra import deferred_refinement, graph_function_for_vector
from gtl.obligation_ledger import (
    declared_fulfillment_obligation,
    obligation_ledger_declarations,
)

from gtl.operator_model import (
    Evaluator, Operator, Rule,
    F_D, F_P, F_H,
)


# ── Contexts ──────────────────────────────────────────────────────────────────
# Constraint surfaces loaded into the agent prompt at each edge.
# Digests are sha256 of file content — PENDING until content stabilises.

bootloader = Context(
    name="bootloader",
    locator="workspace://gtl_spec/GTL_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,   # PENDING
)

this_spec = Context(
    name="project_package_spec",
    locator="workspace://gtl_spec/packages/project_package.py",
    digest="sha256:" + "0" * 64,   # PENDING — self-referential
)

intent_doc = Context(
    name="intent",
    locator="workspace://INTENT.md",
    digest="sha256:" + "0" * 64,   # PENDING — written at intent edge
)

design_adrs = Context(
    name="design_adrs",
    locator="workspace://build_tenants/<family>/<variant>/design/adrs/",
    digest="sha256:" + "0" * 64,   # PENDING — written at design edge
)


# ── Operators ────────────────────────────────────────────────────────────────

claude_agent  = Operator("claude_agent",  F_P, "agent://claude/genesis")
human_gate    = Operator("human_gate",    F_H, "fh://single")
pytest_op     = Operator("pytest",        F_D, "exec://python -m pytest build_tenants/<family>/<variant>/tests/ -q -m 'not e2e'")
check_impl_op = Operator("check_impl",    F_D, "exec://python -m genesis check-tags --type implements --path build_tenants/<family>/<variant>/src/")
check_test_op = Operator("check_test",    F_D, "exec://python -m genesis check-tags --type validates --path build_tenants/<family>/<variant>/tests/")


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
uat_tests = Node(name="uat_tests")


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
    binding="exec://python -m genesis check-req-coverage --package gtl_spec.packages.project_package:module --features .ai-workspace/features/",
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
    "Agent: ADRs cover all features, tech stack is decided, interfaces are specified, no implementation details have leaked into spec",
)
eval_design_fh = Evaluator(
    "design_approved", F_H,
    "Human approves design before any code is written",
)

# design→code
eval_impl_tags = Evaluator(
    "impl_tags", F_D,
    "All source files carry at least one # Implements: REQ-* tag, zero untagged",
    binding="exec://python -m genesis check-tags --type implements --path build_tenants/<family>/<variant>/src/",
)
eval_code_fp = Evaluator(
    "code_complete", F_P,
    "Agent: code implements all features per design ADRs and remains importable.",
)

# code↔unit_tests
eval_tests_pass = Evaluator(
    "tests_pass", F_D,
    "pytest: zero failures, zero errors (excluding e2e tests — F_D evaluators must be acyclic)",
    binding="exec://python -m pytest build_tenants/<family>/<variant>/tests/ -q --tb=short -m 'not e2e'",
)
eval_test_tags = Evaluator(
    "validates_tags", F_D,
    "All test files carry at least one # Validates: REQ-* tag, zero untagged",
    binding="exec://python -m genesis check-tags --type validates --path build_tenants/<family>/<variant>/tests/",
)
eval_coverage_fp = Evaluator(
    "coverage_complete", F_P,
    "Agent: test suite covers all features; no REQ key without a corresponding test",
)

# unit_tests→uat_tests
eval_uat_report = Evaluator(
    "uat_sandbox_report", F_D,
    "Sandbox e2e report exists at .ai-workspace/uat/sandbox_report.json with all_pass: true",
    binding=(
        "exec://python -c \""
        "import json,sys,pathlib; "
        "r=pathlib.Path('.ai-workspace/uat/sandbox_report.json'); "
        "d=json.loads(r.read_text()) if r.exists() else {}; "
        "sys.exit(0 if d.get('all_pass') and d.get('install_success') else 1)"
        "\""
    ),
)
eval_uat_fp = Evaluator(
    "uat_e2e_passed", F_P,
    "Install into a fresh sandbox: "
    "python build_tenants/abiogenesis/python/code/gen-install.py --target /tmp/uat_sandbox_{timestamp} --project-slug {slug}. "
    "Then run e2e tests in that sandbox: "
    "PYTHONPATH=.genesis python -m pytest build_tenants/<family>/<variant>/tests/ -m e2e -q. "
    "Write a structured report to .ai-workspace/uat/sandbox_report.json: "
    "{install_success: bool, sandbox_path: str, test_count: int, pass_count: int, fail_count: int, all_pass: bool, timestamp: ISO}. "
    "Unit tests alone do not satisfy this edge — sandbox e2e is the acceptance proof.",
)
eval_uat_fh = Evaluator(
    "uat_accepted", F_H,
    "Human confirms: (1) .ai-workspace/uat/sandbox_report.json shows all_pass: true, "
    "(2) all e2e scenarios pass end-to-end in the sandbox, "
    "(3) every feature acceptance criterion is demonstrated by at least one scenario. "
    "No feature is shipped without sandbox proof.",
)


def _fp_obligation_declarations(
    vector_name: str,
    *obligations: tuple[str, str, str],
) -> dict:
    return obligation_ledger_declarations(
        obligation_source_kind="package_declared_fp_obligations",
        obligation_source_ref=f"package://gtl_spec.packages.project_package#{vector_name}",
        obligation_kind="fp_evaluator_obligation",
        carry_rule="declared_fulfillment_obligation_set_totality",
        fulfillment_rule="per_obligation_fp_assessment",
        evidence_policy="agent_supplied_evidence_refs",
        obligations=[
            declared_fulfillment_obligation(
                obligation_id,
                evaluator=evaluator,
                statement=statement,
                source_kind="package_declared_fp_obligations",
                source_refs=(f"package://gtl_spec.packages.project_package#{vector_name}/obligation/{obligation_id}",),
            )
            for obligation_id, evaluator, statement in obligations
        ],
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
    declarations=_fp_obligation_declarations(
        "requirements→feature_decomp",
        ("decomp_complete", "decomp_complete", eval_decomp_fp.description),
    ),
)

v_feat_design = GraphVector(
    name="feature_decomp→design",
    source=feature_decomp,
    target=design,
    operators=(claude_agent, human_gate),
    evaluators=(eval_design_fp, eval_design_fh),
    contexts=(bootloader, this_spec, intent_doc),
    rule=standard_gate,
    declarations=_fp_obligation_declarations(
        "feature_decomp→design",
        ("design_coherent", "design_coherent", eval_design_fp.description),
    ),
)

v_design_code = GraphVector(
    name="design→code",
    source=design,
    target=code,
    operators=(claude_agent, check_impl_op),
    evaluators=(eval_impl_tags, eval_code_fp),
    contexts=(bootloader, this_spec, design_adrs),
    declarations=_fp_obligation_declarations(
        "design→code",
        ("code_complete", "code_complete", eval_code_fp.description),
    ),
)

v_tdd = GraphVector(
    name="code↔unit_tests",
    source=(code, unit_tests),
    target=unit_tests,
    operators=(claude_agent, pytest_op, check_impl_op, check_test_op),
    evaluators=(eval_tests_pass, eval_test_tags, eval_coverage_fp),
    contexts=(bootloader, this_spec, design_adrs),
    declarations=_fp_obligation_declarations(
        "code↔unit_tests",
        ("coverage_complete", "coverage_complete", eval_coverage_fp.description),
    ),
)

v_unit_uat = GraphVector(
    name="unit_tests→uat_tests",
    source=unit_tests,
    target=uat_tests,
    operators=(claude_agent, human_gate),
    evaluators=(eval_uat_report, eval_uat_fp, eval_uat_fh),
    contexts=(bootloader, this_spec, design_adrs),
    rule=standard_gate,
    declarations=_fp_obligation_declarations(
        "unit_tests→uat_tests",
        ("uat_e2e_passed", "uat_e2e_passed", eval_uat_fp.description),
    ),
)


# ── SDLC Graph ───────────────────────────────────────────────────────────────

sdlc_graph = Graph(
    name="sdlc",
    inputs=(intent,),
    outputs=(uat_tests,),
    nodes=(intent, requirements, feature_decomp, design, code, unit_tests, uat_tests),
    vectors=(v_intent_req, v_req_feat, v_feat_design, v_design_code, v_tdd, v_unit_uat),
    contexts=(bootloader, this_spec, intent_doc, design_adrs),
)

gf_intent_req = graph_function_for_vector(v_intent_req)
gf_req_feat = graph_function_for_vector(v_req_feat)
gf_feat_design = graph_function_for_vector(v_feat_design)
gf_design_code = graph_function_for_vector(v_design_code)
gf_tdd = graph_function_for_vector(v_tdd)
gf_unit_uat = graph_function_for_vector(v_unit_uat)


# ── Roles (semantic capability classes) ──────────────────────────────────────

role_constructor = Role(name="constructor", tags=("f_p",))


# ── Jobs (explicit GTL Job per graph function) ───────────────────────────────
# ADR-030 §3: jobs with F_P evaluators require constructor role;
# F_H-only or F_D-only jobs explicitly declare roles=().

job_intent_req = Job(
    name="intent→requirements",
    contracts=(ContractRef(kind="graph_function", target_id=gf_intent_req.id),),
    roles=(),  # F_H only
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
job_unit_uat = Job(
    name="unit_tests→uat_tests",
    contracts=(ContractRef(kind="graph_function", target_id=gf_unit_uat.id),),
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
rb_unit_uat = deferred_refinement(
    v_unit_uat.name,
    inputs=(unit_tests,),
    outputs=(uat_tests,),
)


# ── Module ──────────────────────────────────────────────────────────────────
# requirements list is the authoritative REQ key registry for this project.
# Add keys here as requirements are written; check-req-coverage enforces coverage.

module = Module(
    name="project_package",
    graphs=(sdlc_graph,),
    graph_functions=(
        gf_intent_req,
        gf_req_feat,
        gf_feat_design,
        gf_design_code,
        gf_tdd,
        gf_unit_uat,
    ),
    refinement_boundaries=(
        rb_intent_req,
        rb_req_feat,
        rb_feat_design,
        rb_design_code,
        rb_tdd,
        rb_unit_uat,
    ),
    jobs=(job_intent_req, job_req_feat, job_feat_design, job_design_code, job_tdd, job_unit_uat),
    roles=(role_constructor,),
    metadata={
        "requirements": [
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
