# Validates: REQ-R-ABG3-INTERPRET
# Validates: REQ-R-ABG3-SELFHOSTING
# Validates: REQ-R-ABG3-WORKER
# Validates: REQ-R-ABG3-EVENTS
# Validates: REQ-P-POLICY
# Validates: REQ-P-POLICY-001
from __future__ import annotations

import json
import sys
import textwrap
from pathlib import Path
from types import SimpleNamespace

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
from genesis.interpret import TraversalOutcome
from genesis import install as genesis_install
from genesis.lineage import active_work_keys
from genesis.policy import resolve_policy_bundle
from genesis.provenance import spec_hash_for
from genesis.runtime_carrier import FpDispatchTransition
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


def _multi_target_module() -> Module:
    requirements = ["REQ-RUNTIME-IDENTITY-001"]
    intent = Node(name="intent", schema="Intent")
    design = Node(name="design", schema="Design")
    code = Node(name="code", schema="Code")

    req_complete = Evaluator("req_complete", F_P, "requirements satisfy the intent contract")
    code_complete = Evaluator("code_complete", F_P, "code satisfies the design contract")

    req_vector = GraphVector(
        name="intent→design",
        source=intent,
        target=design,
        evaluators=(req_complete,),
    )
    code_vector = GraphVector(
        name="design→code",
        source=design,
        target=code,
        evaluators=(code_complete,),
    )
    req_graph = Graph(
        name="requirements_contract",
        inputs=(intent,),
        outputs=(design,),
        nodes=(intent, design),
        vectors=(req_vector,),
    )
    code_graph = Graph(
        name="code_contract",
        inputs=(design,),
        outputs=(code,),
        nodes=(design, code),
        vectors=(code_vector,),
    )
    req_fn = GraphFunction.from_graph(
        name="requirements_fn",
        graph=req_graph,
        environment=EnvRef.from_contract(requires=(intent,), provides=(design,)),
        declarations={"operator_handles": ("req-flow",)},
    )
    code_fn = GraphFunction.from_graph(
        name="code_fn",
        graph=code_graph,
        environment=EnvRef.from_contract(requires=(design,), provides=(code,)),
        declarations={"operator_handles": ("code-flow",)},
    )
    return Module(
        name="multi_target_contract",
        graphs=(req_graph, code_graph),
        graph_functions=(req_fn, code_fn),
        refinement_boundaries=(
            deferred_refinement(req_vector.name, inputs=(intent,), outputs=(design,)),
            deferred_refinement(code_vector.name, inputs=(design,), outputs=(code,)),
        ),
        jobs=(
            Job(name=req_vector.name, contracts=(ContractRef(kind="graph_function", target_id=req_fn.id),)),
            Job(name=code_vector.name, contracts=(ContractRef(kind="graph_function", target_id=code_fn.id),)),
        ),
        metadata={"requirements": requirements},
    )


def _ambiguous_target_module() -> Module:
    module = _runtime_contract_module()
    graph_function = module.graph_functions[0]
    return Module(
        name="ambiguous_target_contract",
        graphs=module.graphs,
        graph_functions=module.graph_functions,
        refinement_boundaries=module.refinement_boundaries,
        jobs=(
            Job(name="design→code.a", contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),)),
            Job(name="design→code.b", contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),)),
        ),
        metadata=module.metadata,
    )


def _module_with_unbound_helper_target() -> Module:
    module = _multi_target_module()
    helper_input = Node(name="helper_input", schema="HelperInput")
    helper_output = Node(name="helper_output", schema="HelperOutput")
    helper_vector = GraphVector(
        name="helper_input→helper_output",
        source=helper_input,
        target=helper_output,
        evaluators=(),
    )
    helper_graph = Graph(
        name="helper_contract",
        inputs=(helper_input,),
        outputs=(helper_output,),
        nodes=(helper_input, helper_output),
        vectors=(helper_vector,),
    )
    helper_fn = GraphFunction.from_graph(
        name="helper_fn",
        graph=helper_graph,
        environment=EnvRef.from_contract(requires=(helper_input,), provides=(helper_output,)),
        declarations={"operator_handles": ("helper-flow",)},
    )
    return Module(
        name="module_with_unbound_helper_target",
        graphs=(*module.graphs, helper_graph),
        graph_functions=(*module.graph_functions, helper_fn),
        refinement_boundaries=(
            *module.refinement_boundaries,
            deferred_refinement(helper_vector.name, inputs=(helper_input,), outputs=(helper_output,)),
        ),
        jobs=module.jobs,
        metadata=module.metadata,
    )


def _write_operator_asset_query_script(tmp_path: Path, payload: dict[str, object]) -> list[str]:
    script = tmp_path / "operator_asset_query.py"
    script.write_text(
        f"payload = {repr(payload)}\n"
        "import json\n"
        "print(json.dumps(payload))\n",
        encoding="utf-8",
    )
    return [sys.executable, str(script)]


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


def _start_intent(scope, *, until: str = "converged", target=None):
    return services.StartIntent(
        scope=scope,
        target=target if target is not None else services.StartTarget.next(),
        until=until,
    )


def test_run_start_until_converged_invokes_engine_dispatch_and_retries(monkeypatch, tmp_path: Path):
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

    def fake_gen_start(intent, stream):
        return next(results)

    def fake_auto_dispatch(result, workspace, *, config=None):
        dispatch_calls.append((result["edge"], workspace, config["runtime_backend"]))
        return {"status": "ok"}

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_until_converged(
        _start_intent(object()),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        fh_mode="direct",
    )

    assert result["status"] == "converged"
    assert result["fh_mode"] == "direct"
    assert dispatch_calls == [("requirements→design", tmp_path, "codex_cli")]


def test_run_start_until_converged_surfaces_engine_dispatch_failure_without_shadow_booleans(
    monkeypatch,
    tmp_path: Path,
):
    def fake_gen_start(intent, stream):
        return {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "stop_predicate": "dispatch_required",
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

    result = cli_adapter._run_start_until_converged(
        _start_intent(object()),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        fh_mode="direct",
    )

    fp_dispatch_available = "auto_fp_dispatch_" + "available"
    fp_dispatch_handled = "auto_fp_dispatch_" + "handled"
    assert result["stopped_by"] == "fp_runtime_failure"
    assert result["failure_class"] == "transport_failure"
    assert "continuation_id" not in result
    assert "handoff_kind" not in result
    assert "handoff_reason" not in result
    assert fp_dispatch_available not in result
    assert fp_dispatch_handled not in result


def test_run_start_until_converged_surfaces_retry_continuation_as_yield(monkeypatch, tmp_path: Path):
    def fake_gen_start(intent, stream):
        return {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "stop_predicate": "dispatch_required",
            "edge": "requirements→design",
        }

    def fake_auto_dispatch(result, workspace, *, config=None):
        return {
            "status": "yield",
            "stopped_by": "yield",
            "handoff_kind": "retry",
            "handoff_reason": "transport_failure",
            "failure_class": "transport_failure",
            "continuation_id": "cont-retry",
        }

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_until_converged(
        _start_intent(object()),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        fh_mode="direct",
    )

    assert result["status"] == "yield"
    assert result["stop_predicate"] == "yielded"
    assert result["stopped_by"] == "yield"
    assert result["handoff_kind"] == "retry"
    assert result["handoff_reason"] == "transport_failure"
    assert result["continuation_id"] == "cont-retry"


def test_run_start_until_converged_human_proxy_handles_fh_gate_and_retries(monkeypatch, tmp_path: Path):
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

    def fake_gen_start(intent, stream):
        return next(results)

    def fake_emit_human_proxy_approval(workspace, edge):
        approvals.append(edge)

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr(cli_adapter, "_emit_human_proxy_approval", fake_emit_human_proxy_approval)

    result = cli_adapter._run_start_until_converged(
        _start_intent(object()),
        object(),
        workspace=tmp_path,
        config={},
        fh_mode="human-proxy",
    )

    assert result["status"] == "converged"
    assert result["fh_mode"] == "human-proxy"
    assert approvals == ["design→review"]


def test_run_start_until_blocked_continues_after_unblocked_iteration(monkeypatch, tmp_path: Path):
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

    def fake_gen_start(intent, stream):
        return next(results)

    monkeypatch.setattr(services, "gen_start", fake_gen_start)

    result = cli_adapter._run_start_until_blocked(
        _start_intent(object(), until="blocked"),
        object(),
    )

    assert result["status"] == "converged"


def test_run_start_until_converged_stops_on_replay_derived_proof_hold(monkeypatch, tmp_path: Path):
    stream = genesis_install.workspace_bootstrap(tmp_path)
    for idx in range(2):
        genesis_events.emit(
            "proof_failed",
            {
                "edge": "requirements→design",
                "spec_hash": "spec-proof-hold",
                "policy_reason": f"proof_incomplete_{idx}",
            },
            stream=stream,
            context=genesis_events.EventContext(
                workflow_version="wf-proof-hold",
                run_id=f"run-proof-hold-{idx}",
            ),
        )

    def fake_gen_start(intent, stream):
        return {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "stop_predicate": "dispatch_required",
            "edge": "requirements→design",
            "spec_hash": "spec-proof-hold",
            "workflow_version": "wf-proof-hold",
            "resolved_policy": {
                **resolve_policy_bundle(),
                "proof": {
                    "ref": "genesis.policy_defaults:proof_recheck_after_fp",
                    "config": {"proof_hold": {"failure_threshold": 2}},
                },
            },
        }

    dispatched: list[str] = []

    def fake_auto_dispatch(result, workspace, *, config=None):
        dispatched.append(result["edge"])
        return {"status": "ok"}

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_until_converged(
        _start_intent(object()),
        object(),
        workspace=tmp_path,
        config={"proof_hold_policy": {"failure_threshold": 99}},
        fh_mode="direct",
    )

    assert result["status"] == "pending"
    assert result["stopped_by"] == "proof_hold"
    assert result["proof_hold_active"] is True
    assert result["proof_hold"]["failure_count"] == 2
    assert dispatched == []


def test_run_start_until_converged_ignores_proof_hold_when_policy_disabled(monkeypatch, tmp_path: Path):
    stream = genesis_install.workspace_bootstrap(tmp_path)
    for idx in range(2):
        genesis_events.emit(
            "proof_failed",
            {
                "edge": "requirements→design",
                "spec_hash": "spec-proof-hold-disabled",
                "policy_reason": f"proof_incomplete_{idx}",
            },
            stream=stream,
            context=genesis_events.EventContext(
                workflow_version="wf-proof-hold-disabled",
                run_id=f"run-proof-hold-disabled-{idx}",
            ),
        )

    results = iter(
        (
            {
                "status": "pending",
                "blocking_reason": "fp_dispatch",
                "stop_predicate": "dispatch_required",
                "edge": "requirements→design",
                "spec_hash": "spec-proof-hold-disabled",
                "workflow_version": "wf-proof-hold-disabled",
                "resolved_policy": {
                    **resolve_policy_bundle(),
                    "proof": {
                        "ref": "genesis.policy_defaults:proof_recheck_after_fp",
                        "config": {"enabled": False, "failure_threshold": 2},
                    },
                },
            },
            {
                "status": "converged",
                "message": "done",
            },
        )
    )
    dispatched: list[str] = []

    def fake_gen_start(intent, stream):
        return next(results)

    def fake_auto_dispatch(result, workspace, *, config=None):
        dispatched.append(result["edge"])
        return {"status": "ok"}

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_until_converged(
        _start_intent(object()),
        object(),
        workspace=tmp_path,
        config={"proof_hold_policy": {"enabled": True, "failure_threshold": 1}},
        fh_mode="direct",
    )

    assert result["status"] == "converged"
    assert dispatched == ["requirements→design"]


def test_run_start_until_converged_supervised_retries_after_transport_failure_with_valid_artifact(
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

    def fake_run_start_until_converged(intent, stream, *, workspace, config, fh_mode):
        return next(calls)

    statuses = iter(
        (
            {"result_artifact_valid": True, "live_state": "active"},
            {"result_artifact_valid": True, "live_state": "completed"},
        )
    )

    monkeypatch.setattr(cli_adapter, "_run_start_until_converged", fake_run_start_until_converged)
    monkeypatch.setattr(
        "genesis.live_status.project_live_run_status",
        lambda workspace, run_id=None: next(statuses),
    )

    result = cli_adapter._run_start_until_converged_supervised(
        _start_intent(object()),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        fh_mode="direct",
    )

    assert result["status"] == "converged"
    assert result["root_supervision"] is True
    assert result["resumed_after_transport_failure"] is True


def test_run_status_cmd_prints_live_projection(capsys, monkeypatch, tmp_path: Path):
    monkeypatch.setattr(
        "genesis.live_status.project_live_run_status",
        lambda workspace, run_id=None: {
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


def test_top_level_cli_help_teaches_only_public_operator_commands():
    parser = cli_adapter._build_parser()

    help_text = parser.format_help()

    assert "start" in help_text
    assert "gaps" in help_text
    assert "iterate" not in help_text
    assert "run-status" not in help_text


def test_resolve_start_target_graph_function_uses_published_catalog():
    module = _multi_target_module()

    target = services.resolve_start_target(module, "graph_function:code-flow")

    assert target.kind == "graph_function"
    assert target.handle == "code-flow"
    assert target.graph_function_name == "code_fn"
    assert target.target_id == module.graph_functions[1].id


def test_resolve_start_target_rejects_unknown_graph_function_handle():
    module = _multi_target_module()

    with pytest.raises(ValueError, match="unknown published graph-function handle"):
        services.resolve_start_target(module, "graph_function:missing")


def test_resolve_start_target_rejects_unbound_helper_graph_function_handle():
    module = _module_with_unbound_helper_target()

    with pytest.raises(ValueError, match="unknown published graph-function handle"):
        services.resolve_start_target(module, "graph_function:helper-flow")


def test_resolve_start_target_asset_uses_explicit_operator_asset_contract(tmp_path: Path):
    module = _multi_target_module()
    command = _write_operator_asset_query_script(
        tmp_path,
        {
            "assets": [
                {
                    "asset_id": "code_surface",
                    "uri": "file://build/code",
                    "metadata": {"relative_path": "build/code.py"},
                    "checkpoint": {"path_kind": "file", "exists": True},
                    "operator_target": {"kind": "graph_function", "handle": "code-flow"},
                }
            ]
        },
    )

    target = services.resolve_start_target(
        module,
        "asset:code_surface",
        workspace_root=tmp_path,
        operator_asset_contract=services.admit_operator_asset_query_contract(
            {"operator_asset_contract": {"command": command}},
            workspace_root=tmp_path,
        ),
    )

    assert target.kind == "asset"
    assert target.public_ref() == "asset:code_surface"
    assert target.asset_id == "code_surface"
    assert target.asset_uri == "file://build/code"
    assert target.asset_relative_path == "build/code.py"
    assert target.asset_exists is True
    assert target.target_id == module.graph_functions[1].id
    assert target.graph_function_name == "code_fn"


def test_resolve_start_target_asset_fails_closed_when_owner_missing(tmp_path: Path):
    module = _multi_target_module()
    command = _write_operator_asset_query_script(
        tmp_path,
        {
            "assets": [
                {
                    "asset_id": "code_surface",
                    "uri": "file://build/code",
                }
            ]
        },
    )

    with pytest.raises(ValueError, match="operator_target.kind='graph_function'"):
        services.resolve_start_target(
            module,
            "asset:code_surface",
            workspace_root=tmp_path,
            operator_asset_contract=services.admit_operator_asset_query_contract(
                {"operator_asset_contract": {"command": command}},
                workspace_root=tmp_path,
            ),
        )


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

    result = services.gen_start(_start_intent(scope, until="first_traversal"), stream)

    assert result["status"] in {"iterated", "queued", "needs_selection", "converged", "dispatched"}


def test_gen_start_graph_function_target_constrains_semantic_job(monkeypatch, tmp_path: Path):
    module = _multi_target_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path)
    targeted = services.resolve_start_target(module, "graph_function:code-flow")
    captured: dict[str, object] = {}

    def fake_derive_state(*, jobs, **kwargs):
        captured["derive_jobs"] = [job.job.name for job in jobs]
        return {"status": "in_progress", "delta": 1.0}

    def fake_iterate_kernel_outcome(scope_arg, stream_arg, *, jobs_override=None):
        captured["iterate_jobs"] = [job.job.name for job in jobs_override]
        carrier_basis = services.ExecutionBasis(
            workspace_root=tmp_path,
            executable_job=jobs_override[0],
            runtime_identity=scope.runtime_identity,
            workflow_version=scope.workflow_version,
        )
        return services.IterateKernelOutcome(
            result={"status": "pending", "blocking_reason": "fp_dispatch"},
            basis=carrier_basis,
            transition=FpDispatchTransition(
                basis=carrier_basis,
                manifest_id="fp-manifest",
            ),
        )

    monkeypatch.setattr(services, "derive_operational_state", fake_derive_state)
    monkeypatch.setattr(services, "_iterate_kernel_outcome", fake_iterate_kernel_outcome)

    result = services.gen_start(_start_intent(scope, until="first_traversal", target=targeted), stream)

    assert captured["derive_jobs"] == ["design→code"]
    assert captured["iterate_jobs"] == ["design→code"]
    assert result["target"] == "graph_function:code-flow"
    assert result["target_id"] == module.graph_functions[1].id
    assert result["graph_function_name"] == "code_fn"
    assert result["stop_predicate"] == "dispatch_required"
    assert result["execution_basis"]["target"] == "graph_function:code-flow"
    assert result["execution_basis"]["job_name"] == "design→code"
    assert result["advancement_transition"]["kind"] == "fp_dispatch"


def test_gen_start_asset_target_constrains_semantic_job(monkeypatch, tmp_path: Path):
    module = _multi_target_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path)
    targeted = services.resolve_start_target(
        module,
        "asset:code_surface",
        workspace_root=tmp_path,
        operator_asset_contract=services.admit_operator_asset_query_contract(
            {
                "operator_asset_contract": {
                    "command": _write_operator_asset_query_script(
                        tmp_path,
                        {
                            "assets": [
                                {
                                    "asset_id": "code_surface",
                                    "uri": "file://build/code",
                                    "metadata": {"relative_path": "build/code.py"},
                                    "checkpoint": {"path_kind": "file", "exists": True},
                                    "operator_target": {"kind": "graph_function", "handle": "code-flow"},
                                }
                            ]
                        },
                    )
                }
            },
            workspace_root=tmp_path,
        ),
    )
    captured: dict[str, object] = {}

    def fake_derive_state(*, jobs, **kwargs):
        captured["derive_jobs"] = [job.job.name for job in jobs]
        return {"status": "in_progress", "delta": 1.0}

    def fake_iterate_kernel_outcome(scope_arg, stream_arg, *, jobs_override=None):
        captured["iterate_jobs"] = [job.job.name for job in jobs_override]
        carrier_basis = services.ExecutionBasis(
            workspace_root=tmp_path,
            executable_job=jobs_override[0],
            runtime_identity=scope.runtime_identity,
            workflow_version=scope.workflow_version,
        )
        return services.IterateKernelOutcome(
            result={"status": "pending", "blocking_reason": "fp_dispatch"},
            basis=carrier_basis,
            transition=FpDispatchTransition(
                basis=carrier_basis,
                manifest_id="fp-manifest",
            ),
        )

    monkeypatch.setattr(services, "derive_operational_state", fake_derive_state)
    monkeypatch.setattr(services, "_iterate_kernel_outcome", fake_iterate_kernel_outcome)

    result = services.gen_start(_start_intent(scope, until="first_traversal", target=targeted), stream)

    assert captured["derive_jobs"] == ["design→code"]
    assert captured["iterate_jobs"] == ["design→code"]
    assert result["target"] == "asset:code_surface"
    assert result["target_id"] == module.graph_functions[1].id
    assert result["graph_function_name"] == "code_fn"
    assert result["asset_id"] == "code_surface"
    assert result["asset_uri"] == "file://build/code"
    assert result["asset_relative_path"] == "build/code.py"
    assert result["asset_exists"] is True
    assert result["stop_predicate"] == "dispatch_required"
    assert result["execution_basis"]["target"] == "asset:code_surface"
    assert result["execution_basis"]["job_name"] == "design→code"
    assert result["advancement_transition"]["kind"] == "fp_dispatch"


def test_gen_start_graph_function_target_fails_closed_on_multiple_semantic_jobs(tmp_path: Path):
    module = _ambiguous_target_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path)
    targeted = services.resolve_start_target(module, f"graph_function:{module.graph_functions[0].name}")

    result = services.gen_start(_start_intent(scope, until="first_traversal", target=targeted), stream)

    assert result["status"] == "error"
    assert "multiple semantic jobs" in result["reason"]
    assert result["target"] == f"graph_function:{module.graph_functions[0].name}"
    assert result["execution_basis"]["target"] == f"graph_function:{module.graph_functions[0].name}"
    assert result["advancement_transition"]["kind"] == "terminal"


def test_gen_start_next_converged_multi_job_scope_does_not_publish_arbitrary_job_identity(
    monkeypatch,
    tmp_path: Path,
):
    module = _multi_target_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path)

    def fake_derive_state(*, jobs, **kwargs):
        assert len(jobs) == 2
        return {"status": "converged"}

    monkeypatch.setattr(services, "derive_operational_state", fake_derive_state)
    monkeypatch.setattr(
        services,
        "_close_completed_features",
        lambda scope_arg, stream_arg, *, target: None,
    )

    result = services.gen_start(_start_intent(scope, until="converged"), stream)

    assert result["status"] == "converged"
    assert result["target"] == "next"
    assert result["stop_predicate"] == "converged"
    assert result["execution_basis"]["target"] == "next"
    assert "job_id" not in result["execution_basis"]
    assert "job_name" not in result["execution_basis"]
    assert "edge" not in result["execution_basis"]
    assert "graph_function_id" not in result["execution_basis"]


def test_gen_start_converged_emits_feature_completion_events_without_mutating_feature_files(
    monkeypatch,
    tmp_path: Path,
):
    module = _runtime_contract_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    active_dir = tmp_path / ".ai-workspace" / "features" / "active"
    active_dir.mkdir(parents=True, exist_ok=True)
    feature_path = active_dir / "REQ-FEAT-1.yml"
    feature_text = "id: REQ-FEAT-1\nstatus: active\n"
    feature_path.write_text(feature_text, encoding="utf-8")
    scope = services.Scope(module=module, workspace_root=tmp_path)

    monkeypatch.setattr(
        services,
        "derive_operational_state",
        lambda **kwargs: {"status": "converged"},
    )

    result = services.gen_start(_start_intent(scope, until="converged"), stream)

    assert result["status"] == "converged"
    assert feature_path.read_text(encoding="utf-8") == feature_text
    completed = [event for event in stream.all_events() if event["event_type"] == "feature_completed"]
    assert len(completed) == 1
    assert completed[0]["data"]["work_key"] == "REQ-FEAT-1"
    assert active_work_keys(tmp_path, stream) == []


def test_gen_start_converged_work_key_scope_completes_only_selected_feature(
    monkeypatch,
    tmp_path: Path,
):
    module = _runtime_contract_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    active_dir = tmp_path / ".ai-workspace" / "features" / "active"
    active_dir.mkdir(parents=True, exist_ok=True)
    (active_dir / "REQ-FEAT-1.yml").write_text("id: REQ-FEAT-1\nstatus: active\n", encoding="utf-8")
    (active_dir / "REQ-FEAT-2.yml").write_text("id: REQ-FEAT-2\nstatus: active\n", encoding="utf-8")
    scope = services.Scope(
        module=module,
        workspace_root=tmp_path,
        selector=services.ScopeSelector(kind="work_key", work_key="REQ-FEAT-1"),
    )

    monkeypatch.setattr(
        services,
        "derive_operational_state",
        lambda **kwargs: {"status": "converged"},
    )

    result = services.gen_start(_start_intent(scope, until="converged"), stream)

    assert result["status"] == "converged"
    completed = [event for event in stream.all_events() if event["event_type"] == "feature_completed"]
    assert [event["data"]["work_key"] for event in completed] == ["REQ-FEAT-1"]
    assert active_work_keys(tmp_path, stream) == ["REQ-FEAT-2"]


def test_gen_start_converged_targeted_graph_function_does_not_complete_features(
    monkeypatch,
    tmp_path: Path,
):
    module = _multi_target_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    active_dir = tmp_path / ".ai-workspace" / "features" / "active"
    active_dir.mkdir(parents=True, exist_ok=True)
    (active_dir / "REQ-FEAT-1.yml").write_text("id: REQ-FEAT-1\nstatus: active\n", encoding="utf-8")
    (active_dir / "REQ-FEAT-2.yml").write_text("id: REQ-FEAT-2\nstatus: active\n", encoding="utf-8")
    scope = services.Scope(module=module, workspace_root=tmp_path)
    targeted = services.resolve_start_target(module, "graph_function:code-flow")

    monkeypatch.setattr(
        services,
        "derive_operational_state",
        lambda **kwargs: {"status": "converged"},
    )

    result = services.gen_start(_start_intent(scope, until="converged", target=targeted), stream)

    assert result["status"] == "converged"
    assert [event for event in stream.all_events() if event["event_type"] == "feature_completed"] == []
    assert active_work_keys(tmp_path, stream) == ["REQ-FEAT-1", "REQ-FEAT-2"]


def test_edge_scoped_reset_reopens_completed_feature_activeness(tmp_path: Path):
    stream = genesis_install.workspace_bootstrap(tmp_path)
    active_dir = tmp_path / ".ai-workspace" / "features" / "active"
    active_dir.mkdir(parents=True, exist_ok=True)
    (active_dir / "REQ-FEAT-1.yml").write_text("id: REQ-FEAT-1\nstatus: active\n", encoding="utf-8")

    genesis_events.emit(
        "feature_completed",
        {
            "work_key": "REQ-FEAT-1",
            "feature_id": "REQ-FEAT-1",
            "feature_path": ".ai-workspace/features/active/REQ-FEAT-1.yml",
        },
        stream=stream,
        context=genesis_events.EventContext(workflow_version="demo.workflow@3.0.0", work_key="REQ-FEAT-1"),
    )
    assert active_work_keys(tmp_path, stream) == []

    genesis_events.emit(
        "reset",
        {
            "scope": "edge",
            "edge": "design→code",
            "work_key": "REQ-FEAT-1",
        },
        stream=stream,
        context=genesis_events.EventContext(workflow_version="demo.workflow@3.0.0", work_key="REQ-FEAT-1"),
    )

    assert active_work_keys(tmp_path, stream) == ["REQ-FEAT-1"]


def test_gen_gaps_projects_current_identity_proof_hold(tmp_path: Path):
    module = _runtime_contract_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(
        module=module,
        workspace_root=tmp_path,
        runtime_config={
            "default_policy_bundle": {
                "ref": "genesis.policy_defaults:broad_fp_first_bundle",
                "config": {"proof": {"proof_hold": {"failure_threshold": 2}}},
            }
        },
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
                "spec_hash": spec_hash,
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
        ["genesis", "gaps", "--scope", "workspace", "--workspace", str(tmp_path)],
    )

    cli_adapter.main()

    output = json.loads(capsys.readouterr().out)
    assert output["scope"]["build"] == "codex"
    assert output["scope"]["runtime_identity"]["engine_id"] == "genesis"
    assert output["scope"]["runtime_identity"]["worker_id"] == "gsdlc_router"
    assert output["scope"]["runtime_identity"]["backend_id"] == "codex_cli"
    assert output["scope"]["runtime_identity"]["authority_ref"] == "runtime://role-dispatch"


def test_main_routes_start_converged_human_proxy_through_cli_loop(
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

    def fake_run_start_until_converged(intent, stream, *, workspace, config, fh_mode):
        called["intent"] = intent
        called["stream"] = stream
        called["workspace"] = workspace
        called["config"] = config
        called["fh_mode"] = fh_mode
        return {"status": "converged", "message": "ok", "fh_mode": fh_mode}

    def fail_gen_start(*args, **kwargs):
        raise AssertionError("main() should not bypass the converged start loop")

    monkeypatch.setattr(cli_adapter, "_load_project_config", fake_load_project_config)
    monkeypatch.setattr(cli_adapter, "_resolve_module", fake_resolve_module)
    monkeypatch.setattr(cli_adapter, "_run_start_until_converged", fake_run_start_until_converged)
    monkeypatch.setattr(genesis_install, "workspace_bootstrap", fake_workspace_bootstrap)
    monkeypatch.setattr(services, "Scope", FakeScope)
    monkeypatch.setattr(services, "gen_start", fail_gen_start)
    monkeypatch.setattr(services, "StartIntent", services.StartIntent)
    monkeypatch.setattr(services, "ScopeSelector", services.ScopeSelector)
    monkeypatch.setattr(
        genesis_events,
        "init_snapshot",
        lambda snapshot_id: called.setdefault("snapshot_id", snapshot_id),
    )
    monkeypatch.setattr(
        "sys.argv",
        [
            "genesis",
            "start",
            "--scope",
            "workspace",
            "--target",
            "next",
            "--until",
            "converged",
            "--fh-mode",
            "human-proxy",
            "--workspace",
            str(tmp_path),
        ],
    )

    cli_adapter.main()

    output = capsys.readouterr().out
    assert "\"status\": \"converged\"" in output
    assert called["workspace"] == tmp_path
    assert called["config"] == {"module": "demo.module:module", "pythonpath": []}
    assert called["fh_mode"] == "human-proxy"


def test_main_rejects_fh_mode_when_until_is_not_converged(monkeypatch, tmp_path: Path, capsys):
    class FakeModule:
        name = "demo_module"

    class FakeScope:
        def __init__(self, **kwargs):
            self.module = kwargs["module"]
            self.workflow_version = "demo-workflow@3.0.0"

    monkeypatch.setattr(
        cli_adapter,
        "_load_project_config",
        lambda workspace: {"module": "demo.module:module", "pythonpath": []},
    )
    monkeypatch.setattr(cli_adapter, "_resolve_module", lambda args, workspace: FakeModule())
    monkeypatch.setattr(genesis_install, "workspace_bootstrap", lambda workspace: object())
    monkeypatch.setattr(services, "Scope", FakeScope)
    monkeypatch.setattr(services, "StartIntent", services.StartIntent)
    monkeypatch.setattr(services, "ScopeSelector", services.ScopeSelector)
    monkeypatch.setattr(
        genesis_events,
        "init_snapshot",
        lambda snapshot_id: None,
    )
    monkeypatch.setattr(
        "sys.argv",
        [
            "genesis",
            "start",
            "--scope",
            "workspace",
            "--target",
            "next",
            "--until",
            "blocked",
            "--fh-mode",
            "human-proxy",
            "--workspace",
            str(tmp_path),
        ],
    )

    with pytest.raises(SystemExit) as exc:
        cli_adapter.main()

    assert exc.value.code == 1
    payload = json.loads(capsys.readouterr().out)
    assert payload["status"] == "error"
    assert payload["reason"] == "--fh-mode is only lawful when --until converged"


def test_main_rejects_root_mode_when_until_is_not_converged(monkeypatch, tmp_path: Path, capsys):
    class FakeModule:
        name = "demo_module"

    class FakeScope:
        def __init__(self, **kwargs):
            self.module = kwargs["module"]
            self.workflow_version = "demo-workflow@3.0.0"

    monkeypatch.setattr(
        cli_adapter,
        "_load_project_config",
        lambda workspace: {"module": "demo.module:module", "pythonpath": []},
    )
    monkeypatch.setattr(cli_adapter, "_resolve_module", lambda args, workspace: FakeModule())
    monkeypatch.setattr(genesis_install, "workspace_bootstrap", lambda workspace: object())
    monkeypatch.setattr(services, "Scope", FakeScope)
    monkeypatch.setattr(services, "StartIntent", services.StartIntent)
    monkeypatch.setattr(services, "ScopeSelector", services.ScopeSelector)
    monkeypatch.setattr(
        genesis_events,
        "init_snapshot",
        lambda snapshot_id: None,
    )
    monkeypatch.setattr(
        "sys.argv",
        [
            "genesis",
            "start",
            "--scope",
            "workspace",
            "--target",
            "next",
            "--until",
            "first_traversal",
            "--root-mode",
            "supervised",
            "--workspace",
            str(tmp_path),
        ],
    )

    with pytest.raises(SystemExit) as exc:
        cli_adapter.main()

    assert exc.value.code == 1
    payload = json.loads(capsys.readouterr().out)
    assert payload["status"] == "error"
    assert payload["reason"] == "--root-mode is only lawful when --until converged"


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
                "resolved_policy": resolve_policy_bundle(),
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
                "resolved_policy": resolve_policy_bundle(),
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


def test_gen_start_remains_one_step_engine_progression(monkeypatch, tmp_path: Path):
    calls = {"derive": 0, "iterate": 0}
    module = _runtime_contract_module()
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path)

    def fake_derive_state(*, jobs, **kwargs):
        calls["derive"] += 1
        assert len(jobs) == 1
        return {"status": "in_progress", "delta": 1.0}

    def fake_iterate_kernel_outcome(scope, stream, *, jobs_override=None):
        calls["iterate"] += 1
        carrier_basis = services.ExecutionBasis(
            workspace_root=tmp_path,
            runtime_identity=scope.runtime_identity,
            workflow_version=scope.workflow_version,
            run_id="kernel-run",
        )
        return services.IterateKernelOutcome(
            result={"status": "pending", "blocking_reason": "fp_dispatch"},
            basis=carrier_basis,
            transition=FpDispatchTransition(
                basis=carrier_basis,
                manifest_id="fp-manifest",
            ),
        )

    monkeypatch.setattr(services, "derive_operational_state", fake_derive_state)
    monkeypatch.setattr(services, "_iterate_kernel_outcome", fake_iterate_kernel_outcome)

    result = services.gen_start(
        services.StartIntent(scope=scope, target=services.StartTarget.next(), until="first_traversal"),
        stream,
    )

    assert result["status"] == "pending"
    assert result["blocking_reason"] == "fp_dispatch"
    assert result["target"] == "next"
    assert result["until"] == "first_traversal"
    assert result["stop_predicate"] == "dispatch_required"
    assert result["execution_basis"]["run_id"] == "kernel-run"
    assert result["advancement_transition"]["kind"] == "fp_dispatch"
    assert calls == {"derive": 1, "iterate": 1}


def test_gen_iterate_uses_typed_traversal_outcome_over_result_payload(monkeypatch, tmp_path: Path):
    module = _runtime_contract_module()
    worker = Worker(
        id="typed_outcome_router",
        can_execute=module_to_executable_jobs(module),
    )
    stream = genesis_install.workspace_bootstrap(tmp_path)
    scope = services.Scope(module=module, workspace_root=tmp_path, worker=worker)
    executable_job = module_to_executable_jobs(module)[0]
    carrier_basis = services.ExecutionBasis(
        workspace_root=tmp_path,
        executable_job=executable_job,
        runtime_identity=scope.runtime_identity,
        workflow_version=scope.workflow_version,
        run_id=scope.run_id,
    )
    typed_transition = FpDispatchTransition(
        basis=carrier_basis,
        manifest_id="typed-manifest",
        dispatch_ref="runtime://dispatch",
        result_path=str(tmp_path / ".ai-workspace" / "fp_results" / "typed-manifest.json"),
    )

    def fake_plan_next_traversal(**kwargs):
        return SimpleNamespace(traversal=object(), runtime=object(), result={})

    def fake_traverse(traversal, *, runtime, surface=None):
        return TraversalOutcome(
            surface=services.WorkSurface(),
            result={
                "status": "pending",
                "blocking_reason": "fd_gap",
                "advancement_transition": {"kind": "terminal", "terminal_kind": "gap_stop"},
            },
            basis=carrier_basis,
            transition=typed_transition,
        )

    monkeypatch.setattr(services, "plan_next_traversal", fake_plan_next_traversal)
    monkeypatch.setattr(services, "traverse", fake_traverse)

    result = services.gen_iterate(scope, stream)

    assert result["advancement_transition"]["kind"] == "fp_dispatch"
    assert result["advancement_transition"]["manifest_id"] == "typed-manifest"
    assert result["advancement_transition"]["dispatch_ref"] == "runtime://dispatch"
    assert result["advancement_transition"]["result_path"].endswith("typed-manifest.json")
