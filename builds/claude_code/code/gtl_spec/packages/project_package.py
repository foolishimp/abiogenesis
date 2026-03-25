"""
genesis_sdlc — project spec as V2 Module

V2 structure: Module/Graph/Node/GraphVector with V2 effect declarations
(Evaluator/Operator/Rule from gtl.operator_model).

genesis_sdlc follows the standard SDLC bootstrap graph:

    intent → requirements → feature_decomp → design → code ↔ unit_tests → uat_tests

UAT is constitutional: shipping requires sandbox e2e proof, not unit tests alone.
F_D evaluators must be acyclic — never invoke genesis subcommands from pytest.

genesis_sdlc depends on abiogenesis (the GTL engine) and is built using it.
The engine lives at .genesis/genesis/; run as:
    PYTHONPATH=.genesis python -m genesis <command> --workspace .

No separate requirements document. REQ keys emerge from this Module
and are traced through feature vectors in .ai-workspace/features/.
"""

# V2 structural types
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.module_model import Module

# V2 effect types — native vocabulary
from gtl.operator_model import (
    Evaluator, Operator, Rule,
    F_D, F_P, F_H, consensus,
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
    name="genesis_sdlc_spec",
    locator="workspace://gtl_spec/packages/genesis_sdlc.py",
    digest="sha256:" + "0" * 64,   # PENDING — self-referential
)

intent_doc = Context(
    name="intent",
    locator="workspace://INTENT.md",
    digest="sha256:" + "0" * 64,   # PENDING — written at intent edge
)

design_adrs = Context(
    name="design_adrs",
    locator="workspace://builds/python/design/adrs/",
    digest="sha256:" + "0" * 64,   # PENDING — written at design edge
)


# ── Operators (V2) ────────────────────────────────────────────────────────────

claude_agent  = Operator("claude_agent",  F_P, "agent://claude/genesis")
human_gate    = Operator("human_gate",    F_H, "fh://single")
pytest_op     = Operator("pytest",        F_D, "exec://python -m pytest builds/python/tests/ -q -m 'not e2e'")
check_impl_op = Operator("check_impl",    F_D, "exec://python -m genesis check-tags --type implements --path builds/python/src/")
check_test_op = Operator("check_test",    F_D, "exec://python -m genesis check-tags --type validates --path builds/python/tests/")


# ── Rules (V2) ───────────────────────────────────────────────────────────────

standard_gate = Rule(
    name="standard_gate", kind="gate",
    config={"approve": consensus(1, 1), "dissent": "recorded"},
)


# ── Nodes (V2 — replace Assets) ──────────────────────────────────────────────

intent = Node(name="intent")
requirements = Node(name="requirements")
feature_decomp = Node(name="feature_decomp")
design = Node(name="design")
code = Node(name="code")
unit_tests = Node(name="unit_tests")
uat_tests = Node(name="uat_tests")


# ── Evaluators (V2) ──────────────────────────────────────────────────────────

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
    ".ai-workspace/features/active/ with a satisfies: list covering the assigned REQ-F-* keys. "
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
    binding="exec://python -m genesis check-tags --type implements --path builds/python/src/",
)
eval_code_fp = Evaluator(
    "code_complete", F_P,
    "Agent: code implements all features per design ADRs; no V2 features present; importable",
)

# code↔unit_tests
eval_tests_pass = Evaluator(
    "tests_pass", F_D,
    "pytest: zero failures, zero errors (excluding e2e tests — F_D evaluators must be acyclic)",
    binding="exec://python -m pytest builds/python/tests/ -q --tb=short -m 'not e2e'",
)
eval_test_tags = Evaluator(
    "validates_tags", F_D,
    "All test files carry at least one # Validates: REQ-* tag, zero untagged",
    binding="exec://python -m genesis check-tags --type validates --path builds/python/tests/",
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
    "python builds/python/src/genesis_sdlc/install.py --target /tmp/uat_sandbox_{timestamp} --project-slug {slug}. "
    "Then run e2e tests in that sandbox: "
    "PYTHONPATH=.genesis python -m pytest builds/python/tests/ -m e2e -q. "
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


# ── Graph Vectors (V2 — replace Edges) ───────────────────────────────────────
# Each vector carries its own operators, evaluators, and contexts.
# The bridge adapter creates Job/Worker from these automatically.

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

v_design_code = GraphVector(
    name="design→code",
    source=design,
    target=code,
    operators=(claude_agent, check_impl_op),
    evaluators=(eval_impl_tags, eval_code_fp),
    contexts=(bootloader, this_spec, design_adrs),
)

v_tdd = GraphVector(
    name="code↔unit_tests",
    source=(code, unit_tests),
    target=unit_tests,
    operators=(claude_agent, pytest_op, check_impl_op, check_test_op),
    evaluators=(eval_tests_pass, eval_test_tags, eval_coverage_fp),
    contexts=(bootloader, this_spec, design_adrs),
)

v_unit_uat = GraphVector(
    name="unit_tests→uat_tests",
    source=unit_tests,
    target=uat_tests,
    operators=(claude_agent, human_gate),
    evaluators=(eval_uat_report, eval_uat_fp, eval_uat_fh),
    contexts=(bootloader, this_spec, design_adrs),
    rule=standard_gate,
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


# ── Module (V2 — replaces Package) ──────────────────────────────────────────
# requirements list is the authoritative REQ key registry for this project.
# Add keys here as requirements are written; check-req-coverage enforces coverage.

module = Module(
    name="project_package",
    graphs=(sdlc_graph,),
    metadata={
        "requirements": [
            # Bootstrap
            "REQ-F-BOOT-001",   # gen-install bootstraps .genesis/ into target project
            "REQ-F-BOOT-002",   # .genesis/genesis.yml config resolves Package/Worker
            # SDLC graph
            "REQ-F-GRAPH-001",  # GTL Package defines 7-asset SDLC graph
            "REQ-F-GRAPH-002",  # Asset.markov conditions are acceptance criteria
            # Commands
            "REQ-F-CMD-001",    # gen gaps reports delta per edge
            "REQ-F-CMD-002",    # gen iterate runs one bind-and-iterate pass
            "REQ-F-CMD-003",    # gen start --auto loops until blocked
            # Human gates
            "REQ-F-GATE-001",   # F_H evaluators gate spec/design boundaries
            # Traceability
            "REQ-F-TAG-001",    # Implements: tags enforced on all source files
            "REQ-F-TAG-002",    # Validates: tags enforced on all test files
            "REQ-F-COV-001",    # REQ key coverage enforced by check-req-coverage
            # Documentation
            "REQ-F-DOCS-001",   # User guide covers install, first session, operating loop
            # UAT
            "REQ-F-UAT-001",    # unit_tests→uat_tests edge: sandbox install + e2e proof required to ship
            # Backlog
            "REQ-F-BACKLOG-001",  # .ai-workspace/backlog/BL-*.yml schema and directory convention
            "REQ-F-BACKLOG-002",  # sensory system surfaces ready items in gen gaps/status output
            "REQ-F-BACKLOG-003",  # gen backlog list — show all items with status
            "REQ-F-BACKLOG-004",  # gen backlog promote BL-xxx — emit intent_raised, mark promoted
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
