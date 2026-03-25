# Implements: REQ-CORE-001
"""
genesis_core — Core specification as Module.

Module/Graph/Node/GraphVector with effect declarations
(Evaluator/Operator/Rule from gtl.operator_model).
  Module          → publication boundary (replaces Package)

No separate requirements document. REQ keys emerge from this Module.

Built on: imp_codex/code/gtl/core.py v0.3.0
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
# Digests are sha256 of the file content at package activation time.
# PENDING = not yet computed — update when file content stabilises.

bootloader = Context(
    name="bootloader",
    locator="workspace://.genesis/gtl_spec/GTL_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,   # PENDING
)

genesis_core_spec = Context(
    name="genesis_core_spec",
    locator="workspace://.genesis/gtl_spec/packages/genesis_core.py",
    digest="sha256:" + "0" * 64,   # PENDING — self-referential, computed at activation
)

design_adrs = Context(
    name="design_adrs",
    locator="workspace://builds/claude_code/design/adrs/",
    digest="sha256:" + "0" * 64,   # PENDING — computed after ADRs are written
)

v1_doctrine = Context(
    name="v1_doctrine",
    locator="workspace://docs/V1_DOCTRINE.md",
    digest="sha256:" + "0" * 64,   # PENDING
)


# ── Operators (V2) ────────────────────────────────────────────────────────────

claude_agent = Operator(
    "claude_agent", F_P, "agent://claude/genesis"
)
pytest_op = Operator(
    "pytest", F_D, "exec://python -m pytest builds/claude_code/tests/ -q"
)
check_tags_impl = Operator(
    "check_tags_impl", F_D,
    "exec://python -m genesis check-tags --type implements --path builds/claude_code/code/"
)
check_tags_test = Operator(
    "check_tags_test", F_D,
    "exec://python -m genesis check-tags --type validates --path builds/claude_code/tests/"
)
human_gate = Operator(
    "human_gate", F_H, "fh://single"
)


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


# ── Evaluators (V2) ──────────────────────────────────────────────────────────

# intent→requirements
eval_intent_fh     = Evaluator("intent_approved",    F_H, "Human confirms intent is clear, bounded, and non-trivial")

# requirements→feature_decomp
eval_feat_fd       = Evaluator("req_coverage",       F_D, "Every REQ key appears in ≥1 feature vector satisfies: field",
                               binding="exec://python -m genesis check-req-coverage --package gtl_spec.packages.genesis_core:module --features .ai-workspace/features/")
eval_feat_fh       = Evaluator("feat_approved",      F_H, "Human approves decomposition, DAG order, and MVP boundary")

# feature_decomp→design
eval_design_fp     = Evaluator("design_complete",    F_P, "Agent: ADRs specify all 6 functions, bind split, scope type, manifest structure")
eval_design_fh     = Evaluator("design_approved",    F_H, "Human approves design before any code is written")

# design→code
eval_code_tags     = Evaluator("impl_tags",          F_D, "check-tags: all code files carry Implements: REQ-* tags, 0 untagged",
                               binding="exec://python -m genesis check-tags --type implements --path builds/claude_code/code/")
eval_engine_modules = Evaluator("engine_modules",     F_D, "exactly 7 modules: core, bind, schedule, manifest, commands, fp_dispatch, __main__",
                               binding="exec://python -c \"import os,sys; p='builds/claude_code/code/genesis'; m={f[:-3] for f in os.listdir(p) if f.endswith('.py') and f!='__init__.py'}; e={'core','bind','schedule','manifest','commands','fp_dispatch','__main__'}; diff=m^e; print('extra:',m-e,'missing:',e-m) if diff else print('OK'); sys.exit(0 if not diff else 1)\"")
eval_code_fp       = Evaluator("code_complete",      F_P, "Agent: code implements all modules per design ADRs; no V2 features present")

# code↔unit_tests
eval_tests_pass    = Evaluator("tests_pass",         F_D, "pytest: 0 failures, 0 errors",
                               binding="exec://python -m pytest builds/claude_code/tests/ -q --tb=short --ignore=builds/claude_code/tests/test_e2e_sandbox.py")
eval_coverage      = Evaluator("coverage_80",        F_D, "coverage >= 80%",
                               binding="exec://python -m pytest builds/claude_code/tests/ --cov=genesis --cov-report=term-missing -q --ignore=builds/claude_code/tests/test_e2e_sandbox.py")
eval_test_tags     = Evaluator("validates_tags",     F_D, "check-tags: all test files carry Validates: REQ-* tags, 0 untagged",
                               binding="exec://python -m genesis check-tags --type validates --path builds/claude_code/tests/")
eval_sandbox_e2e   = Evaluator("sandbox_e2e",        F_D, "sandbox lifecycle: gen_gaps/iterate/converge in a fresh isolated workspace",
                               binding="exec://python -m pytest builds/claude_code/tests/test_e2e_sandbox.py -m 'e2e and not phase_c' -q --tb=short")


# ── Graph Vectors (V2 — replace Edges) ───────────────────────────────────────
# Each vector carries its own operators, evaluators, and contexts.
# The bridge adapter creates Job/Worker from these automatically.

v_intent_req = GraphVector(
    name="intent→requirements",
    source=intent,
    target=requirements,
    operators=(claude_agent, human_gate),
    evaluators=(eval_intent_fh,),
    contexts=(bootloader, v1_doctrine),
    rule=standard_gate,
)

v_req_feat = GraphVector(
    name="requirements→feature_decomp",
    source=requirements,
    target=feature_decomp,
    operators=(claude_agent, human_gate),
    evaluators=(eval_feat_fd, eval_feat_fh),
    contexts=(bootloader, genesis_core_spec),
    rule=standard_gate,
)

v_feat_design = GraphVector(
    name="feature_decomp→design",
    source=feature_decomp,
    target=design,
    operators=(claude_agent, human_gate),
    evaluators=(eval_design_fp, eval_design_fh),
    contexts=(bootloader, genesis_core_spec, v1_doctrine),
    rule=standard_gate,
)

v_design_code = GraphVector(
    name="design→code",
    source=design,
    target=code,
    operators=(claude_agent, check_tags_impl),
    evaluators=(eval_code_tags, eval_engine_modules, eval_code_fp),
    contexts=(bootloader, genesis_core_spec, design_adrs),
)

v_tdd = GraphVector(
    name="code↔unit_tests",
    source=(code, unit_tests),
    target=unit_tests,
    operators=(claude_agent, pytest_op, check_tags_impl, check_tags_test),
    evaluators=(eval_tests_pass, eval_coverage, eval_test_tags, eval_sandbox_e2e),
    contexts=(bootloader, genesis_core_spec, design_adrs),
)


# ── SDLC Graph ───────────────────────────────────────────────────────────────

sdlc_graph = Graph(
    name="sdlc",
    inputs=(intent,),
    outputs=(unit_tests,),
    nodes=(intent, requirements, feature_decomp, design, code, unit_tests),
    vectors=(v_intent_req, v_req_feat, v_feat_design, v_design_code, v_tdd),
    contexts=(bootloader, genesis_core_spec, design_adrs, v1_doctrine),
)


# ── Module (V2 — replaces Package) ──────────────────────────────────────────

module = Module(
    name="genesis_v1",
    graphs=(sdlc_graph,),
    metadata={
        "requirements": [
            # Core engine
            "REQ-F-CORE-001",
            "REQ-F-CORE-002",
            "REQ-F-CORE-003",
            "REQ-F-CORE-004",
            "REQ-F-CORE-005",
            "REQ-F-CORE-006",
            # Commands
            "REQ-F-CMD-001",
            "REQ-F-CMD-002",
            "REQ-F-CMD-003",
            # Workspace
            "REQ-F-WKSP-001",
            "REQ-F-WKSP-002",
            # Non-functional
            "REQ-NFR-TEST-001",
            "REQ-NFR-E2E-001",
            "REQ-NFR-SELF-001",
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
