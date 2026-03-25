# Implements: REQ-F-GRAPH-001
# Implements: REQ-F-COV-001
"""Codex build legacy genesis_core package surface."""

from gtl.core import (
    Package,
    Asset,
    Edge,
    Operator,
    Rule,
    Context,
    Evaluator,
    F_D,
    F_P,
    F_H,
    consensus,
    OPERATIVE_ON_APPROVED,
    OPERATIVE_ON_APPROVED_NOT_SUPERSEDED,
)
from gtl.work_model import ContractRef, Job, Role
from genesis.runtime_model import ExecutableJob, Worker


bootloader = Context(
    name="bootloader",
    locator="workspace://builds/codex/code/gtl_spec/GTL_BOOTLOADER.md",
    digest="sha256:" + "0" * 64,
)

genesis_core_spec = Context(
    name="genesis_core_spec",
    locator="workspace://builds/codex/code/gtl_spec/packages/genesis_core.py",
    digest="sha256:" + "0" * 64,
)

design_adrs = Context(
    name="design_adrs",
    locator="workspace://builds/codex/design/adrs/",
    digest="sha256:" + "0" * 64,
)


codex_agent = Operator("codex_agent", F_P, "agent://codex/genesis")
pytest_op = Operator("pytest", F_D, "exec://python -m pytest builds/codex/tests/ -q")
check_tags_impl = Operator(
    "check_tags_impl",
    F_D,
    "exec://python -m genesis check-tags --type implements --path builds/codex/code/",
)
check_tags_test = Operator(
    "check_tags_test",
    F_D,
    "exec://python -m genesis check-tags --type validates --path builds/codex/tests/",
)
human_gate = Operator("human_gate", F_H, "fh://single")


standard_gate = Rule("standard_gate", approve=consensus(1, 1), dissent="recorded")


intent = Asset(name="intent", id_format="INT-{SEQ}", markov=["problem_stated", "value_proposition_clear", "scope_bounded"])
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
    markov=["adrs_recorded", "interfaces_specified", "no_implementation_details"],
    operative=OPERATIVE_ON_APPROVED_NOT_SUPERSEDED,
)
code = Asset(
    name="code",
    id_format="CODE-{SEQ}",
    lineage=[design],
    markov=["implements_tags_present", "six_modules_only", "importable"],
)
unit_tests = Asset(
    name="unit_tests",
    id_format="TEST-{SEQ}",
    lineage=[code],
    markov=["all_pass", "validates_tags_present"],
)


e_intent_req = Edge("intent→requirements", intent, requirements, using=[codex_agent, human_gate], rule=standard_gate, context=[bootloader])
e_req_feat = Edge("requirements→feature_decomp", requirements, feature_decomp, using=[codex_agent, human_gate], rule=standard_gate, context=[bootloader, genesis_core_spec])
e_feat_design = Edge("feature_decomp→design", feature_decomp, design, using=[codex_agent, human_gate], rule=standard_gate, context=[bootloader, genesis_core_spec])
e_design_code = Edge("design→code", design, code, using=[codex_agent, check_tags_impl], context=[bootloader, genesis_core_spec, design_adrs])
e_tdd = Edge("code↔unit_tests", [code, unit_tests], unit_tests, using=[codex_agent, pytest_op, check_tags_impl, check_tags_test], context=[bootloader, genesis_core_spec, design_adrs], co_evolve=True)


eval_intent_fh = Evaluator("intent_approved", F_H, "Human confirms intent is clear, bounded, and non-trivial")
eval_feat_fd = Evaluator("req_coverage", F_D, "Every REQ key appears in a feature vector", command="python -m genesis check-req-coverage --package gtl_spec.packages.genesis_core:package --features .ai-workspace/features/")
eval_feat_fh = Evaluator("feat_approved", F_H, "Human approves decomposition, DAG order, and MVP boundary")
eval_design_fp = Evaluator("design_complete", F_P, "Agent specifies interfaces, bind split, and manifest structure")
eval_design_fh = Evaluator("design_approved", F_H, "Human approves design before any code is written")
eval_code_tags = Evaluator("impl_tags", F_D, "All code files carry Implements traceability markers", command="python -m genesis check-tags --type implements --path builds/codex/code/")
eval_six_modules = Evaluator("six_modules", F_D, "exactly six engine modules exist", command="python -c \"import os,sys; p='builds/codex/code/genesis'; m={f[:-3] for f in os.listdir(p) if f.endswith('.py') and f!='__init__.py'}; e={'core','bind','schedule','manifest','commands','__main__'}; sys.exit(0 if m==e else 1)\"")
eval_code_fp = Evaluator("code_complete", F_P, "Agent implements the engine without V2 leakage")
eval_tests_pass = Evaluator("tests_pass", F_D, "pytest reports zero failures and zero errors", command="python -m pytest builds/codex/tests/ -q --tb=short -m 'not e2e'")
eval_test_tags = Evaluator("validates_tags", F_D, "All test files carry Validates traceability markers", command="python -m genesis check-tags --type validates --path builds/codex/tests/")


codex_executor = Role(name="codex_executor", tags=("runtime", "codex"))

job_intent_req = Job(
    name="intent_to_requirements",
    contracts=(ContractRef(kind="edge", target_id=e_intent_req.id),),
    roles=(codex_executor,),
)
job_req_feat = Job(
    name="requirements_to_feature_decomp",
    contracts=(ContractRef(kind="edge", target_id=e_req_feat.id),),
    roles=(codex_executor,),
)
job_feat_design = Job(
    name="feature_decomp_to_design",
    contracts=(ContractRef(kind="edge", target_id=e_feat_design.id),),
    roles=(codex_executor,),
)
job_design_code = Job(
    name="design_to_code",
    contracts=(ContractRef(kind="edge", target_id=e_design_code.id),),
    roles=(codex_executor,),
)
job_tdd = Job(
    name="code_to_unit_tests",
    contracts=(ContractRef(kind="edge", target_id=e_tdd.id),),
    roles=(codex_executor,),
)

exec_job_intent_req = ExecutableJob(job=job_intent_req, edge=e_intent_req, evaluators=[eval_intent_fh])
exec_job_req_feat = ExecutableJob(job=job_req_feat, edge=e_req_feat, evaluators=[eval_feat_fd, eval_feat_fh])
exec_job_feat_design = ExecutableJob(job=job_feat_design, edge=e_feat_design, evaluators=[eval_design_fp, eval_design_fh])
exec_job_design_code = ExecutableJob(job=job_design_code, edge=e_design_code, evaluators=[eval_code_tags, eval_six_modules, eval_code_fp])
exec_job_tdd = ExecutableJob(job=job_tdd, edge=e_tdd, evaluators=[eval_tests_pass, eval_test_tags])

worker = Worker(
    id="codex",
    can_execute=[exec_job_intent_req, exec_job_req_feat, exec_job_feat_design, exec_job_design_code, exec_job_tdd],
    role_ids=(codex_executor.id,),
)


package = Package(
    name="genesis_core",
    assets=[intent, requirements, feature_decomp, design, code, unit_tests],
    edges=[e_intent_req, e_req_feat, e_feat_design, e_design_code, e_tdd],
    operators=[codex_agent, pytest_op, check_tags_impl, check_tags_test, human_gate],
    rules=[standard_gate],
    contexts=[bootloader, genesis_core_spec, design_adrs],
    jobs=[job_intent_req, job_req_feat, job_feat_design, job_design_code, job_tdd],
    roles=[codex_executor],
    requirements=[
        "REQ-F-GRAPH-001",
        "REQ-F-CMD-001",
        "REQ-F-CMD-002",
        "REQ-F-CMD-003",
        "REQ-F-TAG-001",
        "REQ-F-TAG-002",
        "REQ-F-COV-001",
    ],
)
