# Validates: REQ-R-ABG3-INTERPRET
# Validates: REQ-R-ABG3-SELFHOSTING
# Validates: REQ-R-ABG3-WORKER
# Validates: REQ-R-ABG3-EVENTS
# Validates: REQ-P-POLICY
# Validates: REQ-P-POLICY-001
from __future__ import annotations

import json
import textwrap
from pathlib import Path

import pytest

from gtl.algebra import deferred_refinement
from gtl.function_model import EnvRef, GraphFunction
from gtl.graph import Graph, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_P
from gtl.work_model import ContractRef, Job
from tests.helpers_obligation_ledger import declared_test_graph_vector as GraphVector

from genesis.binding import Worker, module_to_executable_jobs
from genesis import cli_adapter
from genesis import events as genesis_events
from genesis.fulfillment_ledger import make_published_fulfillment_ledger_ref
from genesis.identity import RuntimeIdentity
from genesis import install as genesis_install
from genesis.provenance import spec_hash_for
from genesis import services


def _fp_result_payload(
    edge: str,
    *,
    actor: str,
    obligation_id: str = "code_complete",
    fulfillment_status: str = "fulfilled",
    fulfillment_detail: str = "ok",
    extra: dict[str, object] | None = None,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "edge": edge,
        "actor": actor,
        "fulfillment_assessments": [
            {
                "id": obligation_id,
                "fulfillment_status": fulfillment_status,
                "fulfillment_detail": fulfillment_detail,
                "blocking_reasons": (
                    [fulfillment_detail]
                    if fulfillment_status in {"blocked", "unfulfilled"} and fulfillment_detail
                    else []
                ),
                "evidence_refs": (
                    [fulfillment_detail]
                    if fulfillment_status in {"fulfilled", "partial"} and fulfillment_detail
                    else []
                ),
            }
        ],
    }
    if extra:
        payload.update(extra)
    return payload


def _fulfillment_obligations(*entries: tuple[str, str] | str) -> list[dict[str, object]]:
    obligations: list[dict[str, object]] = []
    for index, entry in enumerate(entries):
        if isinstance(entry, tuple):
            obligation_id, statement = entry
        else:
            obligation_id, statement = entry, ""
        obligations.append(
            {
                "id": obligation_id,
                "evaluator": obligation_id,
                "statement": statement,
                "source_kind": "manifest_fulfillment_obligations",
                "source_refs": [f"manifest://fixture#fulfillment_obligations/{index}"],
            }
        )
    return obligations


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
    graph_function = GraphFunction.from_graph(
        name=vector.name,
        graph=graph,
        environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
    )
    return Module(
        name="runtime_identity_contract",
        graphs=(graph,),
        graph_functions=(graph_function,),
        refinement_boundaries=(deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),),
        jobs=(Job(name=vector.name, contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),)),),
        metadata={"requirements": requirements},
    )


def _runtime_contract_module_source() -> str:
    return textwrap.dedent(
        """\
        from gtl.algebra import deferred_refinement
        from gtl.function_model import EnvRef, GraphFunction
        from gtl.graph import Graph, GraphVector, Node
        from gtl.obligation_ledger import declared_fulfillment_obligation, obligation_ledger_declarations
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
            declarations=obligation_ledger_declarations(
                obligation_source_kind="test_declared_fp_obligations",
                obligation_source_ref="test://cli_adapter_auto#design→code",
                obligation_kind="fp_evaluator_obligation",
                carry_rule="declared_fulfillment_obligation_set_totality",
                fulfillment_rule="per_obligation_fp_assessment",
                evidence_policy="agent_supplied_evidence_refs",
                obligations=(
                    declared_fulfillment_obligation(
                        "code_complete",
                        evaluator="code_complete",
                        statement=code_complete.description,
                        source_kind="test_declared_fp_obligations",
                        source_refs=("test://cli_adapter_auto#design→code/obligation/0",),
                    ),
                ),
            ),
        )
        graph = Graph(
            name="runtime_identity_contract",
            inputs=(design,),
            outputs=(code,),
            nodes=(design, code),
            vectors=(vector,),
        )
        graph_function = GraphFunction.from_graph(
            name=vector.name,
            graph=graph,
            environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
        )
        module = Module(
            name="runtime_identity_contract",
            graphs=(graph,),
            graph_functions=(graph_function,),
            refinement_boundaries=(deferred_refinement(vector.name, inputs=(design,), outputs=(code,)),),
            jobs=(Job(name=vector.name, contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),)),),
            metadata={"requirements": ["REQ-RUNTIME-IDENTITY-001"]},
        )
        worker = Worker(
            id="gsdlc_router",
            can_execute=module_to_executable_jobs(module),
            authority_ref="runtime://role-dispatch",
        )
        """
    )


def test_run_start_auto_invokes_engine_dispatch_and_retries(monkeypatch, tmp_path: Path):
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
    dispatch_calls: list[tuple[str, Path, str]] = []

    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return next(results)

    def fake_auto_dispatch(result, workspace, *, config=None):
        dispatch_calls.append((result["edge"], workspace, config["runtime_backend"]))
        return {"status": "ok"}

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        human_proxy=False,
    )

    assert result["status"] == "converged"
    assert result["auto"] is True
    assert dispatch_calls == [("requirements→design", tmp_path, "codex_cli")]


def test_run_start_auto_surfaces_engine_dispatch_failure_without_shadow_booleans(
    monkeypatch,
    tmp_path: Path,
):
    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "edge": "requirements→design",
        }

    def fake_auto_dispatch(result, workspace, *, config=None):
        return {
            "status": "error",
            "stopped_by": "fp_runtime_failure",
            "failure_class": "transport_failure",
        }

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        human_proxy=False,
    )

    fp_dispatch_available = "auto_fp_dispatch_" + "available"
    fp_dispatch_handled = "auto_fp_dispatch_" + "handled"
    assert result["stopped_by"] == "fp_runtime_failure"
    assert result["failure_class"] == "transport_failure"
    assert fp_dispatch_available not in result
    assert fp_dispatch_handled not in result


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

    def fake_emit_human_proxy_approval(workspace, edge):
        approvals.append(edge)

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr(cli_adapter, "_emit_human_proxy_approval", fake_emit_human_proxy_approval)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        config={},
        human_proxy=True,
    )

    assert result["status"] == "converged"
    assert result["auto"] is True
    assert result["human_proxy"] is True
    assert approvals == ["design→review"]


def test_run_start_auto_continues_after_unblocked_iteration(monkeypatch, tmp_path: Path):
    results = iter(
        (
            {
                "status": "iterated",
                "edge": "design→code",
            },
            {
                "status": "converged",
                "message": "done",
            },
        )
    )

    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return next(results)

    monkeypatch.setattr(services, "gen_start", fake_gen_start)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        config={},
        human_proxy=False,
    )

    assert result["status"] == "converged"
    assert result["auto"] is True


def test_run_start_auto_stops_on_replay_derived_proof_hold(monkeypatch, tmp_path: Path):
    stream = genesis_install.workspace_bootstrap(tmp_path)
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    manifest_id = "manifest-proof-hold"
    (manifests_dir / f"{manifest_id}.json").write_text(
        json.dumps(
            {
                "manifest_id": manifest_id,
                "edge": "requirements→design",
                "spec_hash": "spec-proof-hold",
                "workflow_version": "wf-proof-hold",
            }
        ),
        encoding="utf-8",
    )
    for idx in range(2):
        genesis_events.emit(
            "proof_failed",
            {
                "edge": "requirements→design",
                "manifest_id": manifest_id,
                "policy_reason": f"proof_incomplete_{idx}",
            },
            stream=stream,
            context=genesis_events.EventContext(
                workflow_version="wf-proof-hold",
                run_id=f"run-proof-hold-{idx}",
            ),
        )

    def fake_gen_start(scope, stream, auto=False):
        assert auto is False
        return {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "edge": "requirements→design",
            "manifest_id": manifest_id,
        }

    dispatched: list[str] = []

    def fake_auto_dispatch(result, workspace, *, config=None):
        dispatched.append(result["edge"])
        return {"status": "ok"}

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_auto(
        object(),
        object(),
        workspace=tmp_path,
        config={"proof_hold_policy": {"failure_threshold": 2}},
        human_proxy=False,
    )

    assert result["status"] == "pending"
    assert result["stopped_by"] == "proof_hold"
    assert result["proof_hold_active"] is True
    assert result["proof_hold"]["failure_count"] == 2
    assert dispatched == []


def test_run_start_auto_supervised_retries_after_transport_failure_with_valid_artifact(
    monkeypatch,
    tmp_path: Path,
):
    calls = iter(
        (
            {
                "status": "error",
                "failure_class": "transport_failure",
            },
            {
                "status": "converged",
                "message": "recovered",
            },
        )
    )

    def fake_run_start_auto(scope, stream, *, workspace, config, human_proxy):
        return next(calls)

    statuses = iter(
        (
            {"result_artifact_valid": True, "live_state": "active"},
            {"result_artifact_valid": True, "live_state": "completed"},
        )
    )

    monkeypatch.setattr(cli_adapter, "_run_start_auto", fake_run_start_auto)
    monkeypatch.setattr(
        "genesis.live_status.project_live_run_status",
        lambda workspace, run_id=None, runtime_config=None: next(statuses),
    )

    result = cli_adapter._run_start_auto_supervised(
        object(),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        human_proxy=False,
    )

    assert result["status"] == "converged"
    assert result["root_supervision"] is True
    assert result["resumed_after_transport_failure"] is True


def test_run_status_cmd_prints_live_projection(capsys, monkeypatch, tmp_path: Path):
    monkeypatch.setattr(
        "genesis.live_status.project_live_run_status",
        lambda workspace, run_id=None, runtime_config=None: {
            "asset_type": "run_status",
            "run_id": run_id or "run-1",
            "live_state": "active",
        },
    )

    rc = cli_adapter._run_status_cmd(tmp_path, "run-1")

    assert rc == 0
    captured = json.loads(capsys.readouterr().out)
    assert captured["asset_type"] == "run_status"
    assert captured["run_id"] == "run-1"


def test_scope_reports_bound_worker_identity_when_no_runtime_build_is_declared(tmp_path: Path):
    module = _runtime_contract_module()
    worker = Worker(
        id="gsdlc_router",
        can_execute=module_to_executable_jobs(module),
        authority_ref="runtime://role-dispatch",
    )
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path, worker=worker)

    result = services.gen_gaps(scope, stream)

    assert result["scope"]["build"] is None
    assert result["scope"]["runtime_identity"]["worker_id"] == "gsdlc_router"
    assert result["scope"]["runtime_identity"]["authority_ref"] == "runtime://role-dispatch"


def test_scope_uses_engine_identity_when_no_runtime_build_or_worker_is_declared(tmp_path: Path):
    module = _runtime_contract_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path)

    result = services.gen_gaps(scope, stream)
    runtime_identity = result["scope"]["runtime_identity"]

    assert result["scope"]["build"] is None
    assert runtime_identity["engine_id"] == "genesis"
    assert runtime_identity["worker_id"] == runtime_identity["engine_id"]
    assert "build_id" not in runtime_identity


def test_scope_does_not_reinject_build_default_when_runtime_identity_is_partial(tmp_path: Path):
    module = _runtime_contract_module()
    worker = Worker(
        id="gsdlc_router",
        can_execute=module_to_executable_jobs(module),
        authority_ref="runtime://role-dispatch",
    )
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(
        module=module,
        workspace_root=tmp_path,
        worker=worker,
        runtime_identity=cli_adapter._resolve_runtime_identity({}, worker),
    )

    result = services.gen_gaps(scope, stream)

    assert result["scope"]["build"] is None
    assert "build_id" not in result["scope"]["runtime_identity"]
    assert result["scope"]["runtime_identity"]["worker_id"] == "gsdlc_router"


def test_scope_rejects_conflicting_runtime_build_inputs(tmp_path: Path):
    module = _runtime_contract_module()

    with pytest.raises(ValueError, match="build_id"):
        services.Scope(
            module=module,
            workspace_root=tmp_path,
            build="router-build",
            runtime_identity=RuntimeIdentity(build_id="declared-build"),
        )


def test_gen_start_uses_scope_module_when_deriving_operational_state(tmp_path: Path):
    module = _runtime_contract_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path)

    result = services.gen_start(scope, stream)

    assert result["status"] in {"iterated", "queued", "needs_selection", "converged", "dispatched"}


def test_gen_gaps_projects_current_identity_proof_hold(tmp_path: Path):
    module = _runtime_contract_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(
        module=module,
        workspace_root=tmp_path,
        runtime_config={"proof_hold_policy": {"failure_threshold": 2}},
    )
    job = module_to_executable_jobs(module)[0]
    spec_hash = spec_hash_for(
        workflow_version=scope.workflow_version,
        executable_job=job,
        requirements=module.metadata.get("requirements", ()),
    )
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    manifest_id = "manifest-gap-proof-hold"
    (manifests_dir / f"{manifest_id}.json").write_text(
        json.dumps(
            {
                "manifest_id": manifest_id,
                "edge": "design→code",
                "spec_hash": spec_hash,
                "workflow_version": scope.workflow_version,
            }
        ),
        encoding="utf-8",
    )
    for idx in range(2):
        genesis_events.emit(
            "proof_failed",
            {
                "edge": "design→code",
                "manifest_id": manifest_id,
                "policy_reason": f"proof_incomplete_{idx}",
            },
            stream=stream,
            context=genesis_events.EventContext(
                workflow_version=scope.workflow_version,
                run_id=f"run-gap-proof-hold-{idx}",
            ),
        )

    result = services.gen_gaps(scope, stream)

    assert result["gaps"][0]["proof_hold_active"] is True
    assert result["gaps"][0]["proof_hold"]["failure_count"] == 2


def test_resolve_runtime_identity_reads_runtime_prefixed_keys_only():
    identity = cli_adapter._resolve_runtime_identity(
        {
            "runtime_engine": "codex-kernel",
            "runtime_build": "codex",
            "runtime_worker_id": "gsdlc_router",
            "runtime_backend": "codex_cli",
            "runtime_authority_ref": "runtime://role-dispatch",
            "runtime_assignment_source": "runtime://session-override/constructor",
            "runtime_resolved_runtime_ref": "runtime://resolved/constructor/codex",
            "engine": "ignored-engine",
            "build": "ignored-build",
            "backend": "ignored-backend",
            "authority_ref": "runtime://ignored-authority",
            "assignment_source": "runtime://ignored-assignment",
            "resolved_runtime_ref": "runtime://ignored-resolved",
        }
    )

    assert identity.engine_id == "codex-kernel"
    assert identity.build_id == "codex"
    assert identity.worker_id == "gsdlc_router"
    assert identity.backend_id == "codex_cli"
    assert identity.authority_ref == "runtime://role-dispatch"
    assert identity.assignment_source == "runtime://session-override/constructor"
    assert identity.resolved_runtime_ref == "runtime://resolved/constructor/codex"


def test_resolve_runtime_identity_ignores_unprefixed_keys():
    identity = cli_adapter._resolve_runtime_identity(
        {
            "engine": "ignored-engine",
            "build": "ignored-build",
            "backend": "ignored-backend",
            "authority_ref": "runtime://ignored-authority",
            "assignment_source": "runtime://ignored-assignment",
            "resolved_runtime_ref": "runtime://ignored-resolved",
        }
    )

    assert identity.engine_id == "genesis"
    assert identity.build_id is None
    assert identity.worker_id is None
    assert identity.backend_id is None
    assert identity.authority_ref is None
    assert identity.assignment_source is None
    assert identity.resolved_runtime_ref is None


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
            self.workflow_version = "demo-workflow@3.0.0"

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

    def fake_run_start_auto(scope, stream, *, workspace, config, human_proxy):
        called["auto_scope"] = scope
        called["auto_stream"] = stream
        called["auto_workspace"] = workspace
        called["auto_config"] = config
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
    assert called["auto_config"] == {"module": "demo.module:module", "pythonpath": []}
    assert called["auto_human_proxy"] is True


def test_attach_pending_recovery_contract_surfaces_exact_assess_result_next_step(tmp_path: Path):
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = manifests_dir / "manifest-pending.json"
    manifest_path.write_text(
        json.dumps(
            {
                "manifest_id": "manifest-pending",
                "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-pending.json"),
            }
        ),
        encoding="utf-8",
    )

    enriched = cli_adapter._attach_pending_recovery_contract(
        {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "manifest_id": "manifest-pending",
            "fp_manifest_path": str(manifest_path),
        },
        tmp_path,
    )

    assert enriched["fp_result_path"] == str(
        tmp_path / ".ai-workspace" / "fp_results" / "manifest-pending.json"
    )
    assert enriched["recovery"] == {
        "manifest_id": "manifest-pending",
        "fp_manifest_path": str(manifest_path),
        "fp_result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-pending.json"),
        "next_step": "assess-result",
        "assess_result_command": (
            "python -m genesis assess-result --result "
            + str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-pending.json")
            + " --workspace "
            + str(tmp_path)
        ),
    }


def test_emit_workspace_event_uses_canonical_emit_with_explicit_event_context(
    monkeypatch,
    tmp_path: Path,
):
    captured: dict[str, object] = {}

    def fake_emit(event_type, data, *, stream=None, context=None, package_snapshot_id=None):
        captured["event_type"] = event_type
        captured["data"] = data
        captured["stream"] = stream
        captured["context"] = context
        captured["package_snapshot_id"] = package_snapshot_id

    monkeypatch.setattr("genesis.events.emit", fake_emit)

    cli_adapter._emit_workspace_event(
        tmp_path,
        "approved",
        {"kind": "fh_review", "edge": "design→review", "actor": "human"},
        workflow_version="demo.workflow@3.0.0",
        work_key="REQ-1",
        run_id="run-123",
    )

    assert captured["event_type"] == "approved"
    assert captured["data"] == {
        "kind": "fh_review",
        "edge": "design→review",
        "actor": "human",
    }
    assert captured["stream"].path == tmp_path / ".ai-workspace" / "events" / "events.jsonl"
    assert captured["context"] == genesis_events.EventContext(
        workflow_version="demo.workflow@3.0.0",
        work_key="REQ-1",
        run_id="run-123",
    )
    assert captured["package_snapshot_id"] is None


def test_emit_event_cmd_routes_through_workspace_event_helper(
    monkeypatch,
    tmp_path: Path,
):
    runtime_dir = tmp_path / ".ai-workspace" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    (runtime_dir / "active-workflow.json").write_text(
        json.dumps({"workflow": "demo.workflow", "version": "3.0.0"}),
        encoding="utf-8",
    )

    calls: list[dict[str, object]] = []

    def fake_emit_workspace_event(
        workspace,
        event_type,
        data,
        *,
        workflow_version="unknown",
        work_key=None,
        run_id=None,
    ):
        calls.append(
            {
                "workspace": workspace,
                "event_type": event_type,
                "data": dict(data),
                "workflow_version": workflow_version,
                "work_key": work_key,
                "run_id": run_id,
            }
        )

    monkeypatch.setattr(cli_adapter, "_emit_workspace_event", fake_emit_workspace_event)

    rc = cli_adapter._emit_event_cmd(
        "approved",
        json.dumps({"kind": "fh_review", "edge": "design→review", "actor": "human"}),
        tmp_path,
    )

    assert rc == 0
    assert calls == [
        {
            "workspace": tmp_path,
            "event_type": "approved",
            "data": {
                "kind": "fh_review",
                "edge": "design→review",
                "actor": "human",
                "workflow_version": "demo.workflow@3.0.0",
            },
            "workflow_version": "demo.workflow@3.0.0",
            "work_key": None,
            "run_id": None,
        }
    ]


def test_assess_result_cmd_routes_manifest_provenance_through_workspace_event_helper(
    monkeypatch,
    tmp_path: Path,
):
    runtime_dir = tmp_path / ".ai-workspace" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    (runtime_dir / "active-workflow.json").write_text(
        json.dumps({"workflow": "demo.workflow", "version": "3.0.0"}),
        encoding="utf-8",
    )

    result_path = tmp_path / "judge-result.json"
    result_path.write_text(
        json.dumps(
            _fp_result_payload(
                "design→code",
                actor="codex",
                fulfillment_detail="all checks pass",
                extra={
                    "worker_id": "codex",
                    "backend_id": "codex_cli",
                    "role_id": "constructor",
                },
            )
        ),
        encoding="utf-8",
    )
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    (manifests_dir / "judge-result.json").write_text(
        json.dumps(
            {
                "spec_hash": "abc123",
                "run_id": "run-42",
                "work_key": "REQ-7/design→code",
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
                "authority_ref": "runtime://role-dispatch",
                "assignment_source": "runtime://session-override/constructor",
                "resolved_runtime_ref": "runtime://resolved/constructor/codex",
            }
        ),
        encoding="utf-8",
    )

    calls: list[dict[str, object]] = []

    def fake_emit_workspace_event(
        workspace,
        event_type,
        data,
        *,
        workflow_version="unknown",
        work_key=None,
        run_id=None,
    ):
        calls.append(
            {
                "workspace": workspace,
                "event_type": event_type,
                "data": dict(data),
                "workflow_version": workflow_version,
                "work_key": work_key,
                "run_id": run_id,
            }
        )

    monkeypatch.setattr(cli_adapter, "_emit_workspace_event", fake_emit_workspace_event)

    rc = cli_adapter._assess_result_cmd(str(result_path), tmp_path)

    assert rc == 0
    assert [call["event_type"] for call in calls] == [
        "assessed",
        "proof_passed",
        "closure_passed",
        "edge_converged",
        "run_completed",
    ]
    assert calls[0] == {
        "workspace": tmp_path,
        "event_type": "assessed",
        "data": {
            "kind": "fp",
            "edge": "design→code",
            "obligation_id": "code_complete",
            "published_ledger_ref": make_published_fulfillment_ledger_ref(
                manifest_id="judge-result"
            ),
            "actor": "codex",
            "spec_hash": "abc123",
            "manifest_id": "judge-result",
            "workflow_version": "demo.workflow@3.0.0",
            "selected_worker_id": "codex",
            "backend_id": "codex_cli",
            "selected_backend": "codex_cli",
            "role_id": "constructor",
            "authority_ref": "runtime://role-dispatch",
            "assignment_source": "runtime://session-override/constructor",
            "resolved_runtime_ref": "runtime://resolved/constructor/codex",
        },
        "workflow_version": "demo.workflow@3.0.0",
        "work_key": "REQ-7/design→code",
        "run_id": "run-42",
    }


def test_assess_result_cmd_ignores_unprefixed_backend_field(monkeypatch, tmp_path: Path):
    runtime_dir = tmp_path / ".ai-workspace" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    (runtime_dir / "active-workflow.json").write_text(
        json.dumps({"workflow": "demo.workflow", "version": "3.0.0"}),
        encoding="utf-8",
    )

    result_path = tmp_path / "judge-result.json"
    result_path.write_text(
        json.dumps(
            _fp_result_payload(
                "design→code",
                actor="codex",
                fulfillment_detail="all checks pass",
                extra={
                    "worker_id": "codex",
                    "backend": "ignored-codex-cli",
                    "role_id": "constructor",
                },
            )
        ),
        encoding="utf-8",
    )
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    (manifests_dir / "judge-result.json").write_text(
        json.dumps(
            {
                "spec_hash": "abc123",
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
            }
        ),
        encoding="utf-8",
    )

    calls: list[dict[str, object]] = []

    def fake_emit_workspace_event(
        workspace,
        event_type,
        data,
        *,
        workflow_version="unknown",
        work_key=None,
        run_id=None,
    ):
        calls.append(
            {
                "workspace": workspace,
                "event_type": event_type,
                "data": dict(data),
                "workflow_version": workflow_version,
                "work_key": work_key,
                "run_id": run_id,
            }
        )

    monkeypatch.setattr(cli_adapter, "_emit_workspace_event", fake_emit_workspace_event)

    rc = cli_adapter._assess_result_cmd(str(result_path), tmp_path)

    assert rc == 0
    assert calls[0]["data"]["selected_worker_id"] == "codex"
    assert "backend_id" not in calls[0]["data"]
    assert "selected_backend" not in calls[0]["data"]


def test_gen_start_auto_remains_one_step_engine_progression(monkeypatch):
    calls = {"derive": 0, "iterate": 0}

    def fake_derive_state(scope, stream):
        calls["derive"] += 1
        return {"status": "in_progress", "delta": 1.0}

    def fake_gen_iterate(scope, stream):
        calls["iterate"] += 1
        return {"status": "pending", "blocking_reason": "fp_dispatch"}

    monkeypatch.setattr(services, "_derive_state", fake_derive_state)
    monkeypatch.setattr(services, "gen_iterate", fake_gen_iterate)

    result = services.gen_start(object(), object(), auto=True)

    assert result == {
        "status": "pending",
        "blocking_reason": "fp_dispatch",
        "auto": True,
    }
    assert calls == {"derive": 1, "iterate": 1}
