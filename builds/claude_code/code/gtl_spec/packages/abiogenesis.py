"""
abiogenesis — project spec as V2 Module

V2 structure: Module/Graph/Node/GraphVector with V2 effect declarations
(Evaluator/Operator/Rule from gtl.operator_model).

abiogenesis follows the standard SDLC bootstrap graph:

    intent → requirements → feature_decomp → design → code ↔ unit_tests
                                                  └→ bootloader_doc

abiogenesis depends on itself (the GTL engine) and is built using it.
The engine lives at .genesis/genesis/; run as:
    PYTHONPATH=.genesis python -m genesis <command> --workspace .

No separate requirements document. REQ keys emerge from this Module
and are traced through feature vectors in .ai-workspace/features/.
"""

# V2 structural types
from gtl.graph import Graph, Node, GraphVector, Context
from gtl.module_model import Module
from gtl.work_model import Job, ContractRef, Role
from gtl.algebra import deferred_refinement

# V2 effect types — native vocabulary
from gtl.operator_model import (
    Evaluator, Operator, Rule,
    F_D, F_P, F_H,
)


# ── Contexts ──────────────────────────────────────────────────────────────────
# Digests are sha256 of the file content at package activation time.
# PENDING = not yet computed — update when file content stabilises.

bootloader = Context(
    name="bootloader",
    locator="workspace://builds/claude_code/code/gtl_spec/GTL_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,   # PENDING
)

this_spec = Context(
    name="abiogenesis_spec",
    locator="workspace://builds/claude_code/code/gtl_spec/packages/abiogenesis.py",
    digest="sha256:" + "0" * 64,   # PENDING — self-referential
)

intent_doc = Context(
    name="intent",
    locator="workspace://specification/INTENT.md",
    digest="sha256:" + "0" * 64,   # PENDING — written at intent edge
)

design_adrs = Context(
    name="design_adrs",
    locator="workspace://builds/claude_code/design/adrs/",
    digest="sha256:" + "0" * 64,   # PENDING — written at design edge
)

specification_dir = Context(
    name="specification_dir",
    locator="workspace://specification/",
    digest="sha256:" + "0" * 64,   # PENDING
)


# ── Operators (V2) ────────────────────────────────────────────────────────────

claude_agent  = Operator("claude_agent",  F_P, "agent://claude/genesis")
human_gate    = Operator("human_gate",    F_H, "fh://single")
pytest_op     = Operator("pytest",        F_D, "exec://python -m pytest builds/claude_code/tests/ -q -m 'not e2e'")
check_impl_op = Operator("check_impl",    F_D, "exec://python -m genesis check-tags --type implements --path builds/claude_code/code/genesis/")
check_test_op = Operator("check_test",    F_D, "exec://python -m genesis check-tags --type validates --path builds/claude_code/tests/")
check_bootloader_op = Operator("check_bootloader", F_D, "exec://python -m genesis check-bootloader-consistency --spec-module gtl --bootloader .genesis/gtl_spec/GTL_BOOTLOADER.md")


# ── Rules (V2) ───────────────────────────────────────────────────────────────

standard_gate = Rule(
    name="standard_gate", kind="gate",
    config={"approve": {"kind": "consensus", "n": 1, "m": 1}, "dissent": "recorded"},
)


# ── Nodes (V2 — replace Assets) ──────────────────────────────────────────────

intent = Node(name="intent")
requirements = Node(name="requirements")
feature_decomp = Node(name="feature_decomp")
design = Node(name="design")
code = Node(name="code")
unit_tests = Node(name="unit_tests")
bootloader_doc = Node(name="bootloader_doc")


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
    binding="exec://python -m genesis check-req-coverage --package gtl_spec.packages.abiogenesis:module --features .ai-workspace/features/",
)
eval_decomp_fp = Evaluator(
    "decomp_complete", F_P,
    "Construct feature vectors for all uncovered REQ keys — write one .yml per feature to "
    ".ai-workspace/features/active/ with a satisfies: list covering the assigned REQ-F-* keys. "
    "Group related keys into cohesive features. Each vector must cover at least one uncovered key; "
    "rebuild 2026-03-21 symmetric-revoke",
)
eval_decomp_fh = Evaluator(
    "decomp_approved", F_H,
    "Human approves: feature set is complete, dependency order is correct, MVP boundary is clear",
)

# feature_decomp→design
eval_design_fp = Evaluator(
    "design_coherent", F_P,
    "Agent: ADRs cover all features, tech stack is decided, interfaces are specified, no implementation details have leaked into spec; "
    "rebuild 2026-03-21 symmetric-revoke",
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
    "and axiom references are consistent with the source code; "
    "rebuild 2026-03-21 symmetric-revoke",
)

# design→code
eval_impl_tags = Evaluator(
    "impl_tags", F_D,
    "All source files carry at least one # Implements: REQ-* tag, zero untagged",
    binding="exec://python -m genesis check-tags --type implements --path builds/claude_code/code/genesis/",
)
eval_impl_coverage = Evaluator(
    "impl_coverage", F_D,
    "Every REQ key in Module.metadata.requirements appears in ≥1 source file as # Implements: {key}",
    binding="exec://python -m genesis check-impl-coverage --package gtl_spec.packages.abiogenesis:module --path builds/claude_code/",
)
eval_code_fp = Evaluator(
    "code_complete", F_P,
    "Agent: code implements all features per design ADRs; no V2 features present; importable; "
    "rebuild 2026-03-21 symmetric-revoke",
)

# code↔unit_tests
eval_tests_pass = Evaluator(
    "tests_pass", F_D,
    "pytest: zero failures, zero errors",
    binding="exec://python -m pytest builds/claude_code/tests/ -q --tb=short -m 'not e2e'",
)
eval_test_tags = Evaluator(
    "validates_tags", F_D,
    "All test files carry at least one # Validates: REQ-* tag, zero untagged",
    binding="exec://python -m genesis check-tags --type validates --path builds/claude_code/tests/",
)
eval_validates_coverage = Evaluator(
    "validates_coverage", F_D,
    "Every REQ key in Module.metadata.requirements appears in ≥1 test file as # Validates: {key}",
    binding="exec://python -m genesis check-validates-coverage --package gtl_spec.packages.abiogenesis:module --path builds/claude_code/tests/",
)
eval_coverage_fp = Evaluator(
    "coverage_complete", F_P,
    "Agent: test suite covers all features; no REQ key without a corresponding test; "
    "rebuild 2026-03-21 symmetric-revoke",
)


# ── Graph Vectors (V2 — replace Edges) ───────────────────────────────────────
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


# ── Roles (V2 — semantic capability classes) ─────────────────────────────────
# ADR-030 §3: shipped modules declare explicit Module.roles.

role_constructor = Role(name="constructor", tags=("f_p",))


# ── Jobs (V2 — explicit GTL Job per vector) ──────────────────────────────────
# Each Job binds to its GraphVector via ContractRef. No auto-derivation.
# ADR-030 §3: jobs with F_P evaluators require constructor role;
# F_H-only or F_D-only jobs explicitly declare roles=().

job_intent_req = Job(
    name="intent→requirements",
    contracts=(ContractRef(kind="graph_vector", target_id=v_intent_req.id),),
    roles=(),  # F_H only — no construction capability needed
)
job_req_feat = Job(
    name="requirements→feature_decomp",
    contracts=(ContractRef(kind="graph_vector", target_id=v_req_feat.id),),
    roles=(role_constructor,),
)
job_feat_design = Job(
    name="feature_decomp→design",
    contracts=(ContractRef(kind="graph_vector", target_id=v_feat_design.id),),
    roles=(role_constructor,),
)
job_design_bootdoc = Job(
    name="design→bootloader_doc",
    contracts=(ContractRef(kind="graph_vector", target_id=v_design_bootdoc.id),),
    roles=(role_constructor,),
)
job_design_code = Job(
    name="design→code",
    contracts=(ContractRef(kind="graph_vector", target_id=v_design_code.id),),
    roles=(role_constructor,),
)
job_tdd = Job(
    name="code↔unit_tests",
    contracts=(ContractRef(kind="graph_vector", target_id=v_tdd.id),),
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


# ── Module (V2 — replaces Package) ──────────────────────────────────────────
# requirements list is the authoritative REQ key registry for this project.
# Add keys here as requirements are written; check-req-coverage enforces coverage.

module = Module(
    name="abiogenesis",
    graphs=(sdlc_graph,),
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
            # Bootstrap
            "REQ-F-BOOT-001",   # gen-install bootstraps .genesis/ into target project
            "REQ-F-BOOT-002",   # .genesis/genesis.yml config resolves Package/Worker
            "REQ-F-PKG-001",    # Starter spec generated for new projects
            # SDLC graph
            "REQ-F-GRAPH-001",  # GTL Package defines 6-asset SDLC graph
            "REQ-F-GRAPH-002",  # Asset.markov conditions are acceptance criteria
            # Commands
            "REQ-F-CMD-001",    # gen gaps reports delta per edge
            "REQ-F-CMD-002",    # gen iterate runs one bind-and-iterate pass
            "REQ-F-CMD-003",    # gen start --auto loops until blocked
            "REQ-F-CMD-004",    # edge_converged certificate includes feature field; deduplication by (edge, feature) pair
            # Human gates
            "REQ-F-GATE-001",   # F_H evaluators gate spec/design boundaries
            "REQ-F-GATE-002",   # F_D must all pass before F_P dispatch; F_D+F_P before F_H
            # Traceability
            "REQ-F-TAG-001",    # Implements: tags enforced on all source files
            "REQ-F-TAG-002",    # Validates: tags enforced on all test files
            "REQ-F-COV-001",    # REQ key coverage enforced by check-req-coverage
            # Documentation
            "REQ-F-DOCS-001",   # User guide covers install, first session, operating loop
            # Evaluator safety
            "REQ-F-EVAL-001",   # F_D evaluator commands validated at spec load
            "REQ-F-EVAL-002",   # assessed{kind: fp} snapshot-bound via spec_hash
            "REQ-F-EVAL-003",   # per-REQ-key impl/validates coverage enforcement
            "REQ-F-EVAL-004",   # emit-event CLI rejects malformed prime operator payloads
            "REQ-F-EVAL-005",   # emit() write primitive validates prime operator payloads
            # Feature lifecycle
            "REQ-F-VIS-001",    # gen-start marks completed features and moves them
            # Workspace
            "REQ-F-WKSP-001",   # Workspace bootstrap creates event stream path
            # Engine correctness
            "REQ-F-BIND-001",   # ContextResolver digest mismatch halts execution
            "REQ-F-CORE-001",   # project() current projection observes edge_started events
            "REQ-F-CORE-002",   # Projection determinism invariant
            "REQ-F-CORE-003",   # Event stream completeness — all prior states reconstructable
            "REQ-F-CORE-004",   # bind_fd() produces PrecomputedManifest
            "REQ-F-CORE-005",   # ContextResolver loads and verifies context documents
            "REQ-F-CORE-006",   # Worker scheduling partitions by write territory
            # Test architecture
            "REQ-F-TEST-001",   # Integration-primary test surface
            "REQ-F-TEST-002",   # Property invariant tests
            # Workflow provenance
            "REQ-F-PROV-001",   # Workflow version read from active-workflow.json
            "REQ-F-PROV-002",   # Events annotated with workflow_version
            "REQ-F-PROV-003",   # job_evaluator_hash replaces req_hash when provenance present
            "REQ-F-PROV-004",   # Carry-forward preserves approvals across version upgrades
            "REQ-F-PROV-005",   # Orphan tolerance for graph evolution
            # Event Calculus foundation
            "REQ-F-EC-001",     # Five prime operators as basis set
            "REQ-F-EC-002",     # Two fluents: operative and certified
            "REQ-F-EC-003",     # Three convergence models (F_D live, F_P/F_H projected)
            "REQ-F-EC-004",     # Revocation terminates fluents symmetrically
            "REQ-F-EC-005",     # Rejection is judgment, not revocation
            "REQ-F-EC-006",     # assessed{kind: fp} result values
            # Bootloader as graph asset (INT-002)
            "REQ-F-BOOTDOC-001",  # bootloader_doc is a graph asset with design lineage
            "REQ-F-BOOTDOC-002",  # F_D evaluator checks GTL type consistency
            "REQ-F-BOOTDOC-003",  # Bootloader converges before downstream install gates
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
