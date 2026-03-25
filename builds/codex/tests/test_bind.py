# Validates: REQ-F-EVAL-002
# Validates: REQ-F-GATE-001
from __future__ import annotations

from gtl.core import Asset, Edge, Evaluator, Operator, F_D, F_H, F_P
from gtl.work_model import ContractRef, Job, Role

from genesis.bind import bind_fd, executable_job_hash, req_hash
from genesis.core import ContextResolver, workspace_bootstrap
from genesis.runtime_model import ExecutableJob


def _make_job() -> ExecutableJob:
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("agent", F_P, "agent://codex/test")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    role = Role("codex_executor")
    job = Job(
        name="design_to_code",
        contracts=(ContractRef(kind="edge", target_id=edge.id),),
        roles=(role,),
    )
    return ExecutableJob(
        job=job,
        edge=edge,
        evaluators=[
            Evaluator("fd_ok", F_D, "passes", command="python -c 'import sys; sys.exit(0)'"),
            Evaluator("fp_pending", F_P, "needs assessment"),
        ],
    )


def test_req_hash_is_deterministic():
    assert req_hash(["REQ-B", "REQ-A"]) == req_hash(["REQ-A", "REQ-B"])


def test_executable_job_hash_normalises_whitespace():
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("agent", F_P, "agent://codex/test")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    role = Role("codex_executor")
    semantic_job = Job(name="design_to_code", contracts=(ContractRef(kind="edge", target_id=edge.id),), roles=(role,))
    job_a = ExecutableJob(job=semantic_job, edge=edge, evaluators=[Evaluator("x", F_P, "hello  world")])
    job_b = ExecutableJob(job=semantic_job, edge=edge, evaluators=[Evaluator("x", F_P, "hello world")])
    assert executable_job_hash(job_a) == executable_job_hash(job_b)


def test_executable_job_hash_changes_when_role_changes():
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("agent", F_P, "agent://codex/test")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    job_a = ExecutableJob(
        job=Job(
            name="design_to_code",
            contracts=(ContractRef(kind="edge", target_id=edge.id),),
            roles=(Role("codex_executor"),),
        ),
        edge=edge,
        evaluators=[Evaluator("x", F_P, "hello world")],
    )
    job_b = ExecutableJob(
        job=Job(
            name="design_to_code",
            contracts=(ContractRef(kind="edge", target_id=edge.id),),
            roles=(Role("reviewer"),),
        ),
        edge=edge,
        evaluators=[Evaluator("x", F_P, "hello world")],
    )
    assert executable_job_hash(job_a) != executable_job_hash(job_b)


def test_bind_fd_uses_fractional_delta(tmp_path):
    stream = workspace_bootstrap(tmp_path)
    resolver = ContextResolver(tmp_path)
    pre = bind_fd(_make_job(), stream, resolver, tmp_path, spec_hash="deadbeef")
    assert pre.delta == 0.5


def test_bind_fd_human_gate_passes_after_approval(tmp_path):
    stream = workspace_bootstrap(tmp_path)
    stream.workflow_version = "wf@1.0"
    stream.append(
        "approved",
        {"kind": "fh_review", "edge": "design→code", "actor": "human"},
    )
    src = Asset(name="design", id_format="DES-{SEQ}")
    tgt = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("human", F_H, "fh://single")
    edge = Edge(name="design→code", source=src, target=tgt, using=[op])
    job = ExecutableJob(
        job=Job(
            name="design_to_code",
            contracts=(ContractRef(kind="edge", target_id=edge.id),),
            roles=(Role("codex_executor"),),
        ),
        edge=edge,
        evaluators=[Evaluator("review", F_H, "approve design")],
    )
    resolver = ContextResolver(tmp_path)
    pre = bind_fd(job, stream, resolver, tmp_path, current_workflow_version="wf@1.0")
    assert pre.delta == 0.0
