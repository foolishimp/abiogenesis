"""
genesis_sdlc — project spec as GTL Package

This file IS the spec. The type system is the law.

  Asset.markov     → acceptance criteria for that asset type
  Job.evaluators   → convergence tests for that edge
  Edge.context     → constraint surface for that transition
  Worker           → who executes what

genesis_sdlc follows the standard SDLC bootstrap graph:

    intent → requirements → feature_decomp → design → code ↔ unit_tests

genesis_sdlc depends on abiogenesis (the GTL engine) and is built using it.
The engine lives at .genesis/genesis/; run as:
    PYTHONPATH=.genesis python -m genesis <command> --workspace .

No separate requirements document. REQ keys emerge from this Package
and are traced through feature vectors in .ai-workspace/features/.
"""
from gtl.core import (
    Package, Asset, Edge, Operator, Rule, Context, Evaluator, Job, Worker,
    F_D, F_P, F_H, consensus,
    OPERATIVE_ON_APPROVED, OPERATIVE_ON_APPROVED_NOT_SUPERSEDED,
)


# ── Contexts ──────────────────────────────────────────────────────────────────
# Constraint surfaces loaded into the agent prompt at each edge.
# Digests are sha256 of file content — PENDING until content stabilises.

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


# ── Operators ─────────────────────────────────────────────────────────────────

claude_agent  = Operator("claude_agent",  F_P, "agent://claude/genesis")
human_gate    = Operator("human_gate",    F_H, "fh://single")
pytest_op     = Operator("pytest",        F_D, "exec://python -m pytest builds/claude_code/tests/ -q -m 'not e2e'")
check_impl_op = Operator("check_impl",    F_D, "exec://python -m genesis check-tags --type implements --path builds/claude_code/code/genesis/")
check_test_op = Operator("check_test",    F_D, "exec://python -m genesis check-tags --type validates --path builds/claude_code/tests/")
check_bootloader_op = Operator("check_bootloader", F_D, "exec://python -m genesis check-bootloader-consistency --spec-module gtl.core --bootloader .genesis/gtl_spec/GTL_BOOTLOADER.md")


# ── Rules ─────────────────────────────────────────────────────────────────────

standard_gate = Rule(
    "standard_gate", approve=consensus(1, 1), dissent="recorded"
)


# ── Assets ────────────────────────────────────────────────────────────────────
# markov conditions ARE the acceptance criteria for each asset type.

intent = Asset(
    name="intent",
    id_format="INT-{SEQ}",
    markov=["problem_stated", "value_proposition_clear", "scope_bounded"],
)

requirements = Asset(
    name="requirements",
    id_format="REQ-{SEQ}",
    lineage=[intent],
    markov=["keys_testable", "intent_covered", "no_implementation_details"],
    operative=OPERATIVE_ON_APPROVED,
)

feature_decomp = Asset(
    name="feature_decomp",
    id_format="FD-{SEQ}",
    lineage=[requirements],
    markov=["all_req_keys_covered", "dependency_dag_acyclic", "mvp_boundary_defined"],
    operative=OPERATIVE_ON_APPROVED,
)

design = Asset(
    name="design",
    id_format="DES-{SEQ}",
    lineage=[feature_decomp],
    markov=["adrs_recorded", "tech_stack_decided", "interfaces_specified", "no_implementation_details"],
    operative=OPERATIVE_ON_APPROVED_NOT_SUPERSEDED,
)

code = Asset(
    name="code",
    id_format="CODE-{SEQ}",
    lineage=[design],
    markov=["implements_tags_present", "importable", "no_v2_features"],
)

unit_tests = Asset(
    name="unit_tests",
    id_format="TEST-{SEQ}",
    lineage=[code],
    markov=["all_pass", "validates_tags_present"],
)

bootloader_doc = Asset(
    name="bootloader_doc",
    id_format="BOOTDOC-{SEQ}",
    lineage=[design],
    markov=["type_names_consistent", "axiom_references_correct"],
)


# ── Edges ─────────────────────────────────────────────────────────────────────

e_intent_req = Edge(
    name="intent→requirements",
    source=intent,
    target=requirements,
    using=[claude_agent, human_gate],
    rule=standard_gate,
    context=[bootloader, this_spec],
)

e_req_feat = Edge(
    name="requirements→feature_decomp",
    source=requirements,
    target=feature_decomp,
    using=[claude_agent, human_gate],
    rule=standard_gate,
    context=[bootloader, this_spec, intent_doc],
)

e_feat_design = Edge(
    name="feature_decomp→design",
    source=feature_decomp,
    target=design,
    using=[claude_agent, human_gate],
    rule=standard_gate,
    context=[bootloader, this_spec, intent_doc],
)

e_design_code = Edge(
    name="design→code",
    source=design,
    target=code,
    using=[claude_agent, check_impl_op],
    context=[bootloader, this_spec, design_adrs],
)

e_design_bootdoc = Edge(
    name="design→bootloader_doc",
    source=design,
    target=bootloader_doc,
    using=[claude_agent, check_bootloader_op],
    context=[bootloader, this_spec, specification_dir],
)

e_tdd = Edge(
    name="code↔unit_tests",
    source=[code, unit_tests],
    target=unit_tests,
    co_evolve=True,
    using=[claude_agent, pytest_op, check_impl_op, check_test_op],
    context=[bootloader, this_spec, design_adrs],
)


# ── Evaluators ────────────────────────────────────────────────────────────────

# intent→requirements
eval_intent_fh = Evaluator(
    "intent_approved", F_H,
    "Human confirms: problem is clearly stated, value proposition is evident, scope is bounded",
)

# requirements→feature_decomp
eval_req_coverage = Evaluator(
    "req_coverage", F_D,
    "Every REQ key in Package.requirements appears in ≥1 feature vector satisfies: field",
    command="python -m genesis check-req-coverage --package gtl_spec.packages.abiogenesis:package --features .ai-workspace/features/",
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
    "All exported type names from gtl/core.py appear in GTL_BOOTLOADER.md",
    command="python -m genesis check-bootloader-consistency --spec-module gtl.core --bootloader .genesis/gtl_spec/GTL_BOOTLOADER.md",
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
    command="python -m genesis check-tags --type implements --path builds/claude_code/code/genesis/",
)
eval_impl_coverage = Evaluator(
    "impl_coverage", F_D,
    "Every REQ key in Package.requirements appears in ≥1 source file as # Implements: {key}",
    command="python -m genesis check-impl-coverage --package gtl_spec.packages.abiogenesis:package --path builds/claude_code/",
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
    command="python -m pytest builds/claude_code/tests/ -q --tb=short -m 'not e2e'",
)
eval_test_tags = Evaluator(
    "validates_tags", F_D,
    "All test files carry at least one # Validates: REQ-* tag, zero untagged",
    command="python -m genesis check-tags --type validates --path builds/claude_code/tests/",
)
eval_validates_coverage = Evaluator(
    "validates_coverage", F_D,
    "Every REQ key in Package.requirements appears in ≥1 test file as # Validates: {key}",
    command="python -m genesis check-validates-coverage --package gtl_spec.packages.abiogenesis:package --path builds/claude_code/tests/",
)
eval_coverage_fp = Evaluator(
    "coverage_complete", F_P,
    "Agent: test suite covers all features; no REQ key without a corresponding test; "
    "rebuild 2026-03-21 symmetric-revoke",
)


# ── Jobs ──────────────────────────────────────────────────────────────────────

job_intent_req    = Job(e_intent_req,      [eval_intent_fh])
job_req_feat      = Job(e_req_feat,        [eval_req_coverage, eval_decomp_fp, eval_decomp_fh])
job_feat_design   = Job(e_feat_design,     [eval_design_fp, eval_design_fh])
job_design_bootdoc = Job(e_design_bootdoc, [eval_bootdoc_consistency, eval_bootdoc_fp])
job_design_code   = Job(e_design_code,     [eval_impl_tags, eval_impl_coverage, eval_code_fp])
job_tdd           = Job(e_tdd,             [eval_tests_pass, eval_test_tags, eval_validates_coverage, eval_coverage_fp])


# ── Worker ────────────────────────────────────────────────────────────────────

worker = Worker(
    id="claude_code",
    can_execute=[job_intent_req, job_req_feat, job_feat_design, job_design_bootdoc, job_design_code, job_tdd],
)


# ── Package ───────────────────────────────────────────────────────────────────
# requirements list is the authoritative REQ key registry for this project.
# Add keys here as requirements are written; check-req-coverage enforces coverage.

package = Package(
    name="abiogenesis",
    assets=[intent, requirements, feature_decomp, design, code, unit_tests, bootloader_doc],
    edges=[e_intent_req, e_req_feat, e_feat_design, e_design_bootdoc, e_design_code, e_tdd],
    operators=[claude_agent, human_gate, pytest_op, check_impl_op, check_test_op, check_bootloader_op],
    rules=[standard_gate],
    contexts=[bootloader, this_spec, intent_doc, design_adrs, specification_dir],
    requirements=[
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
)


if __name__ == "__main__":
    import json
    print(json.dumps({
        "package": package.name,
        "assets": [a.name for a in package.assets],
        "edges": [e.name for e in package.edges],
        "jobs": len(worker.can_execute),
        "worker": worker.id,
        "requirements": package.requirements,
    }, indent=2))
