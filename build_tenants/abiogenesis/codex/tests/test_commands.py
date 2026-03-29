# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-004
from __future__ import annotations

import json

from gtl.core import Asset, Edge, Evaluator, Operator, Package, F_D, F_P
from gtl.work_model import ContractRef, Job, Role

from genesis.commands import Scope, gen_gaps, gen_iterate
from genesis.core import workspace_bootstrap
from genesis.runtime_model import ExecutableJob, Worker


def _make_package(fp: bool = True) -> tuple[Package, Worker]:
    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}")
    op = Operator("agent", F_P, "agent://codex/test")
    edge = Edge(name="design→code", source=design, target=code, using=[op])
    evaluators = [Evaluator("code_complete", F_P, "needs agent")] if fp else [
        Evaluator("always_ok", F_D, "passes", command="python -c 'import sys; sys.exit(0)'")
    ]
    role = Role("codex_executor")
    job = Job(name="design_to_code", contracts=(ContractRef(kind="edge", target_id=edge.id),), roles=(role,))
    executable_job = ExecutableJob(job=job, edge=edge, evaluators=evaluators)
    worker = Worker(id="codex", can_execute=[executable_job], role_ids=(role.id,))
    package = Package(name="codex_pkg", assets=[design, code], edges=[edge], operators=[op], jobs=[job], roles=[role])
    return package, worker


def test_scope_reads_workflow_version_from_active_workflow(tmp_path):
    (tmp_path / ".genesis").mkdir()
    (tmp_path / ".genesis" / "active-workflow.json").write_text(
        json.dumps({"workflow": "demo", "version": "1.2.3"})
    )
    package, worker = _make_package()
    scope = Scope(package=package, workspace_root=tmp_path, worker=worker)
    assert scope.workflow_version == "demo@1.2.3"


def test_gen_iterate_dispatches_fp_and_writes_manifest(tmp_path):
    stream = workspace_bootstrap(tmp_path)
    package, worker = _make_package(fp=True)
    scope = Scope(package=package, workspace_root=tmp_path, worker=worker, feature="REQ-F-CMD")
    result = gen_iterate(scope, stream)
    assert result["status"] == "fp_dispatched"
    assert result["fp_manifest_path"]
    bound = [event for event in stream.all_events() if event["event_type"] == "run_bound"]
    assert bound[-1]["data"]["worker_id"] == "codex"
    assert bound[-1]["data"]["role_id"] == worker.role_ids[0]


def test_gen_gaps_emits_edge_certificate_with_feature(tmp_path):
    stream = workspace_bootstrap(tmp_path)
    package, worker = _make_package(fp=False)
    scope = Scope(package=package, workspace_root=tmp_path, worker=worker, feature="REQ-F-GRAPH")
    result = gen_gaps(scope, stream)
    assert result["converged"] is True
    certificates = [
        event for event in stream.all_events() if event["event_type"] == "edge_converged"
    ]
    assert certificates[-1]["data"]["feature"] == "REQ-F-GRAPH"


def test_gen_gaps_does_not_duplicate_edge_certificate(tmp_path):
    stream = workspace_bootstrap(tmp_path)
    package, worker = _make_package(fp=False)
    scope = Scope(package=package, workspace_root=tmp_path, worker=worker, feature="REQ-F-GRAPH")
    first = gen_gaps(scope, stream)
    second = gen_gaps(scope, stream)
    assert first["converged"] is True
    assert second["converged"] is True
    certificates = [
        event for event in stream.all_events() if event["event_type"] == "edge_converged"
    ]
    assert len(certificates) == 1


def test_gen_iterate_fails_closed_when_worker_lacks_required_role(tmp_path):
    stream = workspace_bootstrap(tmp_path)
    package, worker = _make_package(fp=True)
    worker.role_ids = ()
    scope = Scope(package=package, workspace_root=tmp_path, worker=worker, feature="REQ-F-CMD")
    result = gen_iterate(scope, stream)
    assert result["status"] == "nothing_to_do" or result["status"] == "error"
