# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-R-ABG2-SELFHOSTING
# Validates: REQ-R-ABG2-WORKER
from __future__ import annotations

import json
import textwrap
from pathlib import Path

from gtl.algebra import deferred_refinement
from gtl.graph import Graph, GraphVector, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_P
from gtl.work_model import ContractRef, Job

from genesis.binding import Worker, module_to_executable_jobs
from genesis import cli_adapter
from genesis import events as genesis_events
from genesis import install as genesis_install
from genesis import services


def _runtime_contract_module() -> Module:
    requirements = ["REQ-RUNTIME-IDENTITY-001"]
    design = Node(name="design", schema="Design")
    code = Node(name="code", schema="Code")
    code_complete = Evaluator("code_complete", F_P, "code satisfies the design contract")
    vector = GraphVector(
        name="design→code",
        source=design,
        target=code,
        evaluators=(code_complete,),
    )
    graph = Graph(
        name="runtime_identity_contract",
        inputs=(design,),
        outputs=(code,),
        nodes=(design, code),
        vectors=(vector,),
    )
    return Module(
        name="runtime_identity_contract",
        graphs=(graph,),
        refinement_boundaries=(deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),),
        jobs=(Job(name=vector.name, contracts=(ContractRef(kind="graph_vector", target_id=vector.id),)),),
        metadata={"requirements": requirements},
    )


def _runtime_contract_module_source() -> str:
    return textwrap.dedent(
        """\
        from gtl.algebra import deferred_refinement
        from gtl.graph import Graph, GraphVector, Node
        from gtl.module_model import Module
        from gtl.operator_model import Evaluator, F_P
        from gtl.work_model import ContractRef, Job
        from genesis.binding import Worker, module_to_executable_jobs

        design = Node(name="design", schema="Design")
        code = Node(name="code", schema="Code")
        code_complete = Evaluator("code_complete", F_P, "code satisfies the design contract")
        vector = GraphVector(
            name="design→code",
            source=design,
            target=code,
            evaluators=(code_complete,),
        )
        graph = Graph(
            name="runtime_identity_contract",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(vector,),
        )
        module = Module(
            name="runtime_identity_contract",
            graphs=(graph,),
            refinement_boundaries=(deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),),
            jobs=(Job(name=vector.name, contracts=(ContractRef(kind="graph_vector", target_id=vector.id),)),),
            metadata={"requirements": ["REQ-RUNTIME-IDENTITY-001"]},
        )
        worker = Worker(
            id="gsdlc_router",
            can_execute=module_to_executable_jobs(module),
            authority_ref="runtime://role-dispatch",
        )
        """
    )


def test_run_start_auto_invokes_fp_dispatch_hook_and_retries(monkeypatch, tmp_path: Path):
    results = iter(
        (
            {
                "status": "iterated",
                "blocking_reason": "fp_dispatch",
                "edge": "requirements→design",
                "fp_manifest_path": str(tmp_path / "manifest.json"),
            },
            {
                "status": "converged",
                "message": "done",
            },
        )
    )
    hook_calls: list[tuple[str, Path]] = []

    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return next(results)

    def fake_fp_dispatch(result, workspace):
        hook_calls.append((result["edge"], workspace))
        return True

    def fake_resolve(mod_ref, hook_name):
        if hook_name == "auto_fp_dispatch":
            return fake_fp_dispatch
        return None

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr(cli_adapter, "_resolve_runtime_hook", fake_resolve)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        mod_ref="demo.module:module",
        human_proxy=False,
    )

    assert result["status"] == "converged"
    assert result["auto"] is True
    assert hook_calls == [("requirements→design", tmp_path)]


def test_run_start_auto_human_proxy_handles_fh_gate_and_retries(monkeypatch, tmp_path: Path):
    results = iter(
        (
            {
                "status": "pending",
                "blocking_reason": "fh_gate",
                "edge": "design→review",
            },
            {
                "status": "converged",
                "message": "done",
            },
        )
    )
    approvals: list[str] = []

    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return next(results)

    def fake_resolve(mod_ref, hook_name):
        return None

    def fake_emit_human_proxy_approval(workspace, edge):
        approvals.append(edge)

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr(cli_adapter, "_resolve_runtime_hook", fake_resolve)
    monkeypatch.setattr(cli_adapter, "_emit_human_proxy_approval", fake_emit_human_proxy_approval)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        mod_ref="demo.module:module",
        human_proxy=True,
    )

    assert result["status"] == "converged"
    assert result["auto"] is True
    assert result["human_proxy"] is True
    assert approvals == ["design→review"]


def test_scope_reports_bound_worker_identity_when_no_runtime_build_is_declared(tmp_path: Path):
    module = _runtime_contract_module()
    worker = Worker(
        id="gsdlc_router",
        can_execute=module_to_executable_jobs(module),
        authority_ref="runtime://role-dispatch",
    )
    scope = services.Scope(module=module, workspace_root=tmp_path, worker=worker)

    result = services.gen_gaps(scope, genesis_install.workspace_bootstrap(tmp_path))

    assert result["scope"]["build"] == "gsdlc_router"
    assert result["scope"]["runtime_identity"]["worker_id"] == "gsdlc_router"
    assert result["scope"]["runtime_identity"]["authority_ref"] == "runtime://role-dispatch"


def test_scope_does_not_reinject_legacy_build_default_when_runtime_identity_is_partial(tmp_path: Path):
    module = _runtime_contract_module()
    worker = Worker(
        id="gsdlc_router",
        can_execute=module_to_executable_jobs(module),
        authority_ref="runtime://role-dispatch",
    )
    scope = services.Scope(
        module=module,
        workspace_root=tmp_path,
        worker=worker,
        runtime_identity=cli_adapter._resolve_runtime_identity({}, worker),
    )

    result = services.gen_gaps(scope, genesis_install.workspace_bootstrap(tmp_path))

    assert result["scope"]["build"] == "gsdlc_router"
    assert result["scope"]["runtime_identity"]["build_id"] == "gsdlc_router"
    assert result["scope"]["runtime_identity"]["worker_id"] == "gsdlc_router"


def test_main_gaps_uses_configured_worker_and_runtime_identity_from_runtime_contract(
    monkeypatch,
    tmp_path: Path,
    capsys,
):
    (tmp_path / ".genesis").mkdir(parents=True, exist_ok=True)
    (tmp_path / "demo_runtime.py").write_text(_runtime_contract_module_source(), encoding="utf-8")
    (tmp_path / ".genesis" / "genesis.yml").write_text(
        "runtime_contract: runtime.yml\n",
        encoding="utf-8",
    )
    (tmp_path / "runtime.yml").write_text(
        "\n".join(
            (
                "module: demo_runtime:module",
                "worker: demo_runtime:worker",
                "runtime_build: codex",
                "runtime_backend: codex_cli",
                "runtime_authority_ref: runtime://role-dispatch",
            )
        )
        + "\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(
        "sys.argv",
        ["genesis", "gaps", "--workspace", str(tmp_path)],
    )

    cli_adapter.main()

    output = json.loads(capsys.readouterr().out)
    assert output["scope"]["build"] == "codex"
    assert output["scope"]["runtime_identity"]["engine_id"] == "genesis"
    assert output["scope"]["runtime_identity"]["worker_id"] == "gsdlc_router"
    assert output["scope"]["runtime_identity"]["backend_id"] == "codex_cli"
    assert output["scope"]["runtime_identity"]["authority_ref"] == "runtime://role-dispatch"


def test_main_routes_start_auto_human_proxy_through_cli_auto_loop(
    monkeypatch,
    tmp_path: Path,
    capsys,
):
    class FakeModule:
        name = "demo_module"

    class FakeScope:
        def __init__(self, **kwargs):
            self.module = kwargs["module"]
            self.workflow_version = "demo-workflow@1.1.0"

    called: dict[str, object] = {}

    def fake_workspace_bootstrap(workspace):
        called["workspace_bootstrap"] = workspace
        return object()

    def fake_load_project_config(workspace):
        called["config_workspace"] = workspace
        return {"module": "demo.module:module", "pythonpath": []}

    def fake_resolve_module(args, workspace):
        called["resolved_workspace"] = workspace
        return FakeModule()

    def fake_run_start_auto(scope, stream, *, workspace, mod_ref, human_proxy):
        called["auto_scope"] = scope
        called["auto_stream"] = stream
        called["auto_workspace"] = workspace
        called["auto_mod_ref"] = mod_ref
        called["auto_human_proxy"] = human_proxy
        return {"status": "converged", "message": "ok", "auto": True, "human_proxy": True}

    def fail_gen_start(*args, **kwargs):
        raise AssertionError("main() should not call gen_start(auto=True) directly")

    monkeypatch.setattr(cli_adapter, "_load_project_config", fake_load_project_config)
    monkeypatch.setattr(cli_adapter, "_resolve_module", fake_resolve_module)
    monkeypatch.setattr(cli_adapter, "_run_start_auto", fake_run_start_auto)
    monkeypatch.setattr(genesis_install, "workspace_bootstrap", fake_workspace_bootstrap)
    monkeypatch.setattr(services, "Scope", FakeScope)
    monkeypatch.setattr(services, "gen_start", fail_gen_start)
    monkeypatch.setattr(
        genesis_events,
        "init_snapshot",
        lambda snapshot_id: called.setdefault("snapshot_id", snapshot_id),
    )
    monkeypatch.setattr(
        "sys.argv",
        ["genesis", "start", "--auto", "--human-proxy", "--workspace", str(tmp_path)],
    )

    cli_adapter.main()

    output = capsys.readouterr().out
    assert "\"status\": \"converged\"" in output
    assert called["auto_workspace"] == tmp_path
    assert called["auto_mod_ref"] == "demo.module:module"
    assert called["auto_human_proxy"] is True
