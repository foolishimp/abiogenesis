# Implements: REQ-F-GRAPH-001
# Implements: REQ-F-GRAPH-002
# Implements: REQ-F-COV-001
# Implements: REQ-F-BOOTDOC-001
# Implements: REQ-F-BOOTDOC-002
# Implements: REQ-F-BOOTDOC-003
"""Codex build package surface for abiogenesis."""

from gtl.core import (
    Package,
    Asset,
    Edge,
    Operator,
    Rule,
    Context,
    Evaluator,
    Job,
    Worker,
    F_D,
    F_P,
    F_H,
    consensus,
    OPERATIVE_ON_APPROVED,
    OPERATIVE_ON_APPROVED_NOT_SUPERSEDED,
)


bootloader = Context(
    name="bootloader",
    locator="workspace://builds/codex/code/gtl_spec/GENESIS_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,
)

this_spec = Context(
    name="abiogenesis_spec",
    locator="workspace://builds/codex/code/gtl_spec/packages/abiogenesis.py",
    digest="sha256:" + "0" * 64,
)

intent_doc = Context(
    name="intent",
    locator="workspace://specification/INTENT.md",
    digest="sha256:" + "0" * 64,
)

design_adrs = Context(
    name="design_adrs",
    locator="workspace://builds/codex/design/adrs/",
    digest="sha256:" + "0" * 64,
)

specification_dir = Context(
    name="specification_dir",
    locator="workspace://specification/",
    digest="sha256:" + "0" * 64,
)


codex_agent = Operator("codex_agent", F_P, "agent://codex/genesis")
human_gate = Operator("human_gate", F_H, "fh://single")
pytest_op = Operator(
    "pytest",
    F_D,
    "exec://python -m pytest builds/codex/tests/ -q --tb=short",
)
check_impl_op = Operator(
    "check_impl",
    F_D,
    "exec://python -m genesis check-tags --type implements --path builds/codex/code/genesis/",
)
check_test_op = Operator(
    "check_test",
    F_D,
    "exec://python -m genesis check-tags --type validates --path builds/codex/tests/",
)
check_bootloader_op = Operator(
    "check_bootloader",
    F_D,
    "exec://python -m genesis check-bootloader-consistency --spec-module gtl.core --bootloader builds/codex/code/gtl_spec/GTL_BOOTLOADER.md",
)


standard_gate = Rule("standard_gate", approve=consensus(1, 1), dissent="recorded")


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


e_intent_req = Edge(
    name="intent→requirements",
    source=intent,
    target=requirements,
    using=[codex_agent, human_gate],
    rule=standard_gate,
    context=[bootloader, this_spec],
)

e_req_feat = Edge(
    name="requirements→feature_decomp",
    source=requirements,
    target=feature_decomp,
    using=[codex_agent, human_gate],
    rule=standard_gate,
    context=[bootloader, this_spec, intent_doc],
)

e_feat_design = Edge(
    name="feature_decomp→design",
    source=feature_decomp,
    target=design,
    using=[codex_agent, human_gate],
    rule=standard_gate,
    context=[bootloader, this_spec, intent_doc],
)

e_design_bootdoc = Edge(
    name="design→bootloader_doc",
    source=design,
    target=bootloader_doc,
    using=[codex_agent, check_bootloader_op],
    context=[bootloader, this_spec, specification_dir],
)

e_design_code = Edge(
    name="design→code",
    source=design,
    target=code,
    using=[codex_agent, check_impl_op],
    context=[bootloader, this_spec, design_adrs],
)

e_tdd = Edge(
    name="code↔unit_tests",
    source=[code, unit_tests],
    target=unit_tests,
    co_evolve=True,
    using=[codex_agent, pytest_op, check_impl_op, check_test_op],
    context=[bootloader, this_spec, design_adrs],
)


eval_intent_fh = Evaluator(
    "intent_approved",
    F_H,
    "Human confirms: problem is clearly stated, value proposition is evident, scope is bounded",
)

eval_req_coverage = Evaluator(
    "req_coverage",
    F_D,
    "Every REQ key in Package.requirements appears in at least one feature vector satisfies field",
    command="python -m genesis check-req-coverage --package gtl_spec.packages.abiogenesis:package --features .ai-workspace/features/",
)
eval_decomp_fp = Evaluator(
    "decomp_complete",
    F_P,
    "Agent constructs feature vectors for all uncovered REQ keys and groups them into cohesive features",
)
eval_decomp_fh = Evaluator(
    "decomp_approved",
    F_H,
    "Human approves: feature set is complete, dependency order is correct, MVP boundary is clear",
)

eval_design_fp = Evaluator(
    "design_coherent",
    F_P,
    "Agent records design decisions, specifies interfaces, and keeps implementation details out of the spec",
)
eval_design_fh = Evaluator(
    "design_approved",
    F_H,
    "Human approves design before any code is written",
)

eval_bootdoc_consistency = Evaluator(
    "gtl_type_consistency",
    F_D,
    "All exported type names from gtl/core.py appear in GTL_BOOTLOADER.md",
    command="python -m genesis check-bootloader-consistency --spec-module gtl.core --bootloader builds/codex/code/gtl_spec/GTL_BOOTLOADER.md",
)
eval_bootdoc_fp = Evaluator(
    "synthesize_bootloader",
    F_P,
    "Agent keeps bootloader prose aligned with the GTL type system and engine axioms",
)

eval_impl_tags = Evaluator(
    "impl_tags",
    F_D,
    "All source files carry at least one Implements traceability marker",
    command="python -m genesis check-tags --type implements --path builds/codex/code/genesis/",
)
eval_impl_coverage = Evaluator(
    "impl_coverage",
    F_D,
    "Every REQ key in Package.requirements appears in source traceability markers",
    command="python -m genesis check-impl-coverage --package gtl_spec.packages.abiogenesis:package --path builds/codex/",
)
eval_code_fp = Evaluator(
    "code_complete",
    F_P,
    "Agent produces importable code aligned with design and without V2 leakage",
)

eval_tests_pass = Evaluator(
    "tests_pass",
    F_D,
    "pytest reports zero failures and zero errors",
    command="python -m pytest builds/codex/tests/ -q --tb=short -m 'not e2e'",
)
eval_test_tags = Evaluator(
    "validates_tags",
    F_D,
    "All test files carry at least one Validates traceability marker",
    command="python -m genesis check-tags --type validates --path builds/codex/tests/",
)
eval_validates_coverage = Evaluator(
    "validates_coverage",
    F_D,
    "Every REQ key in Package.requirements appears in test traceability markers",
    command="python -m genesis check-validates-coverage --package gtl_spec.packages.abiogenesis:package --path builds/codex/tests/",
)
eval_coverage_fp = Evaluator(
    "coverage_complete",
    F_P,
    "Agent keeps the test surface aligned with the requirement registry",
)


job_intent_req = Job(e_intent_req, [eval_intent_fh])
job_req_feat = Job(e_req_feat, [eval_req_coverage, eval_decomp_fp, eval_decomp_fh])
job_feat_design = Job(e_feat_design, [eval_design_fp, eval_design_fh])
job_design_bootdoc = Job(e_design_bootdoc, [eval_bootdoc_consistency, eval_bootdoc_fp])
job_design_code = Job(e_design_code, [eval_impl_tags, eval_impl_coverage, eval_code_fp])
job_tdd = Job(e_tdd, [eval_tests_pass, eval_test_tags, eval_validates_coverage, eval_coverage_fp])


worker = Worker(
    id="codex",
    can_execute=[job_intent_req, job_req_feat, job_feat_design, job_design_bootdoc, job_design_code, job_tdd],
)


package = Package(
    name="abiogenesis",
    assets=[intent, requirements, feature_decomp, design, code, unit_tests, bootloader_doc],
    edges=[e_intent_req, e_req_feat, e_feat_design, e_design_bootdoc, e_design_code, e_tdd],
    operators=[codex_agent, human_gate, pytest_op, check_impl_op, check_test_op, check_bootloader_op],
    rules=[standard_gate],
    contexts=[bootloader, this_spec, intent_doc, design_adrs, specification_dir],
    requirements=[
        "REQ-F-GRAPH-001",
        "REQ-F-GRAPH-002",
        "REQ-F-CMD-001",
        "REQ-F-CMD-002",
        "REQ-F-CMD-003",
        "REQ-F-CMD-004",
        "REQ-F-GATE-001",
        "REQ-F-GATE-002",
        "REQ-F-TAG-001",
        "REQ-F-TAG-002",
        "REQ-F-COV-001",
        "REQ-F-EVAL-001",
        "REQ-F-EVAL-002",
        "REQ-F-EVAL-003",
        "REQ-F-EVAL-004",
        "REQ-F-EVAL-005",
        "REQ-F-BIND-001",
        "REQ-F-CORE-001",
        "REQ-F-VIS-001",
        "REQ-F-PROV-001",
        "REQ-F-PROV-002",
        "REQ-F-PROV-003",
        "REQ-F-PROV-004",
        "REQ-F-BOOTDOC-001",
        "REQ-F-BOOTDOC-002",
        "REQ-F-BOOTDOC-003",
    ],
)
