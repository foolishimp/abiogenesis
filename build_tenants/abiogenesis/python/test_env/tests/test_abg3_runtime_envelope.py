# Validates: REQ-R-ABG3-EVENTS, REQ-R-ABG3-PROJECTION, REQ-R-ABG3-RUN, REQ-R-ABG3-GRAPHCALL, REQ-R-ABG3-FRAME, REQ-R-ABG3-CONTINUATION, REQ-R-ABG3-RETRY
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

from gtl.function_model import EnvRef, GraphFunction
from gtl.graph import Graph, GraphVector, GraphVector as RuntimeGraphVector, Node
from gtl.module_model import Module
from gtl.operator_model import Evaluator, F_D, F_P
from gtl.work_model import ContractRef, Job

from genesis import cli_adapter, services
from genesis.binding import (
    PrecomputedManifest,
    PromptAssemblyBudget,
    ResolvedEnvironment,
    ResolvedEnvironmentBinding,
    TargetAssetBinding,
    Worker,
    _assemble_prompt,
    bind_fh,
    bind_fp_certified,
    declared_fulfillment_obligations_for_job,
    declared_obligation_ledger_policy_for_job,
    module_to_executable_jobs,
    regime_binding_set_from_evaluator_partitions,
)
from genesis.dispatch_runtime import auto_dispatch_from_result, dispatch_bound_manifest_via_transport
from genesis.events import EventContext, EventStream, emit
from genesis.fulfillment_ledger import (
    make_published_fulfillment_ledger_ref,
    published_fulfillment_ledger_path,
)
from genesis.live_status import project_live_run_status
from genesis.install import workspace_bootstrap
from genesis.interpret import TraversalRuntime
from genesis.policy import resolve_policy_bundle
from genesis.projection import project
from genesis.result_ingest import _build_published_fulfillment_ledger, ingest_fp_result
from genesis.run import run_state
from genesis.transport import AgentCliContract, AgentResult, dispatch_agent_supervised


def _fp_result_payload(
    edge: str,
    *,
    actor: str = "codex",
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


def _prompt_manifest_contract() -> dict[str, object]:
    return {
        "prompt_assembly": {
            "sections": [],
            "prompt_compactions": [],
        },
        "prompt_compactions": [],
    }


def _write_test_published_ledger(
    workspace: Path,
    *,
    manifest_id: str,
    ledger: dict[str, object],
) -> tuple[Path, dict[str, str]]:
    ledger_path = published_fulfillment_ledger_path(workspace, manifest_id)
    ledger_path.parent.mkdir(parents=True, exist_ok=True)
    ledger_path.write_text(json.dumps(ledger), encoding="utf-8")
    return ledger_path, make_published_fulfillment_ledger_ref(manifest_id=manifest_id)


def _fp_module_and_executable_job(
    edge: str = "design→code",
    obligation_id: str = "code_complete",
):
    source = Node(name="design", schema="Design")
    target = Node(name="code", schema="Code")
    evaluator = Evaluator(obligation_id, F_P, "code satisfies the design contract")
    vector = GraphVector(
        name=edge,
        source=source,
        target=target,
        evaluators=(evaluator,),
    )
    graph = Graph(
        name="fp_runtime_envelope",
        inputs=(source,),
        outputs=(target,),
        nodes=(source, target),
        vectors=(vector,),
    )
    graph_function = GraphFunction.from_graph(
        name=edge,
        graph=graph,
        environment=EnvRef.from_contract(requires=graph.inputs, provides=graph.outputs),
    )
    job = Job(
        name=edge,
        contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),),
    )
    module = Module(
        name="fp_runtime_envelope",
        graphs=(graph,),
        graph_functions=(graph_function,),
        jobs=(job,),
    )
    executable_job = module_to_executable_jobs(module)[0]
    return module, executable_job, evaluator


def _fp_executable_job(edge: str = "design→code", obligation_id: str = "code_complete"):
    _, executable_job, evaluator = _fp_module_and_executable_job(
        edge=edge,
        obligation_id=obligation_id,
    )
    return executable_job, evaluator


def _dynamic_fp_executable_job(
    edge: str = "design→code",
    evaluator_name: str = "code_complete",
):
    source = Node(name="design", schema="Design")
    target = Node(name="code", schema="Code")
    evaluator = Evaluator(evaluator_name, F_P, "code satisfies the dynamic requirement set")
    vector = RuntimeGraphVector(
        name=edge,
        source=source,
        target=target,
        evaluators=(evaluator,),
        declarations={
            "obligation_ledger": {
                "signal_key": "dynamic_requirements",
                "adapter_ref": "helpers_dynamic_obligations:materialize_declared_obligation_ledger",
                "obligation_source_ref": "requirement_surface",
                "obligation_source_kind": "requirement_surface",
                "obligation_source_admission_basis": "authority_or_current_surface",
                "obligation_kind": "requirement",
                "derivation_rule": "identity",
                "carry_rule": "deterministic_requirement_membership",
                "fulfillment_rule": "behavioral_code_realization",
                "evidence_policy": "behavioral_code_evidence",
            }
        },
    )
    graph = Graph(
        name="dynamic_fp_runtime_envelope",
        inputs=(source,),
        outputs=(target,),
        nodes=(source, target),
        vectors=(vector,),
    )
    graph_function = GraphFunction.from_graph(
        name=edge,
        graph=graph,
        environment=EnvRef.from_contract(requires=graph.inputs, provides=graph.outputs),
    )
    job = Job(
        name=edge,
        contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),),
    )
    executable_job = module_to_executable_jobs(
        Module(
            name="dynamic_fp_runtime_envelope",
            graphs=(graph,),
            graph_functions=(graph_function,),
            jobs=(job,),
        )
    )[0]
    return executable_job, evaluator


def _static_obligation_job(obligation_count: int = 14):
    source = Node(name="design", schema="Design")
    target = Node(name="code", schema="Code")
    evaluators = tuple(
        Evaluator(
            f"REQ-{index:03d}",
            F_P,
            f"requirement {index:03d} is fulfilled",
        )
        for index in range(obligation_count)
    )
    vector = RuntimeGraphVector(
        name="design→code",
        source=source,
        target=target,
        evaluators=evaluators,
        declarations={
            "obligation_ledger": {
                "obligation_source_kind": "test_declared_fp_obligations",
                "obligation_source_ref": "test://static-obligation-job",
                "obligation_kind": "requirement",
                "carry_rule": "declared_fulfillment_obligation_set_totality",
                "fulfillment_rule": "per_obligation_fp_assessment",
                "evidence_policy": "agent_supplied_evidence_refs",
                "obligations": [
                    {
                        "id": evaluator.name,
                        "evaluator": evaluator.name,
                        "statement": evaluator.description,
                        "source_kind": "test_declared_fp_obligations",
                        "source_refs": [
                            f"test://static-obligation-job/obligation/{index}"
                        ],
                    }
                    for index, evaluator in enumerate(evaluators)
                ],
            }
        },
    )
    graph = Graph(
        name="static_obligation_prompt_graph",
        inputs=(source,),
        outputs=(target,),
        nodes=(source, target),
        vectors=(vector,),
    )
    graph_function = GraphFunction.from_graph(
        name="design→code",
        graph=graph,
        environment=EnvRef.from_contract(requires=graph.inputs, provides=graph.outputs),
    )
    job = Job(
        name="design→code",
        contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),),
    )
    executable_job = module_to_executable_jobs(
        Module(
            name="static_obligation_prompt_module",
            graphs=(graph,),
            graph_functions=(graph_function,),
            jobs=(job,),
        )
    )[0]
    return executable_job, source, target


def runtime_target_certification_hook(
    *,
    workspace: Path,
    manifest: dict[str, object],
    result_data: dict[str, object],
    published_ledger: dict[str, object],
    config: dict[str, object],
) -> dict[str, object]:
    binding = manifest.get("target_asset_binding")
    relative_path = ""
    if isinstance(binding, dict):
        value = binding.get("relative_path")
        if isinstance(value, str):
            relative_path = value
    if config.get("force_fail"):
        return {
            "passed": False,
            "reason": "declared_target_contract_failed",
            "relative_path": relative_path,
            "details": {"workspace": str(workspace), "edge": result_data.get("edge")},
        }
    return {
        "passed": True,
        "reason": "declared_target_contract_passed",
        "relative_path": relative_path,
        "details": {"obligation_count": len(published_ledger.get("obligations", []))},
    }


def test_prompt_includes_current_source_asset_snapshot_when_bound(tmp_path):
    output = tmp_path / "output"
    output.mkdir(parents=True, exist_ok=True)
    sequencing_path = output / "sequencing.md"
    sequencing_path.write_text(
        "# Sequencing Plan\n\n"
        "1. Implement ProjectStore primitives.\n"
        "2. Implement ProjectService.create_project with owner validation.\n"
        "3. Implement archive and search behavior with read-only archived handling.\n",
        encoding="utf-8",
    )
    design_path = output / "design.md"
    design_path.write_text("# placeholder\n", encoding="utf-8")

    source = Node(name="sequencing", schema="SequencingPlan")
    target = Node(name="design", schema="DesignDoc")
    evaluator = Evaluator("zoom_progress", F_P, "zoomed design planning step advances decomposition and sequencing")
    vector = RuntimeGraphVector(
        name="sequencing→design",
        source=source,
        target=target,
        evaluators=(evaluator,),
    )
    graph = Graph(
        name="prompt_snapshot_graph",
        inputs=(source,),
        outputs=(target,),
        nodes=(source, target),
        vectors=(vector,),
    )
    graph_function = GraphFunction.from_graph(
        name="sequencing→design",
        graph=graph,
        environment=EnvRef.from_contract(requires=graph.inputs, provides=graph.outputs),
    )
    job = Job(
        name="sequencing→design",
        contracts=(ContractRef(kind="graph_function", target_id=graph_function.id),),
    )
    executable_job = module_to_executable_jobs(
        Module(
            name="prompt_snapshot_module",
            graphs=(graph,),
            graph_functions=(graph_function,),
            jobs=(job,),
        )
    )[0]

    pre = PrecomputedManifest(
        executable_job=executable_job,
        current_asset={"status": "not_started", "edges_converged": []},
        regime_bindings=regime_binding_set_from_evaluator_partitions(failing=(evaluator,)),
        fd_results={},
        relevant_contexts={
            "design_standard": "design must declare at least three ordered decomposition/sequencing steps",
            "design_output_contract": "include a Sequencing section in output/design.md",
        },
    )
    asset_bindings = {
        "sequencing": TargetAssetBinding(
            asset_id="sequencing",
            uri="workspace://output/sequencing.md",
            relative_path="output/sequencing.md",
            path_kind="file",
            exists=True,
        ),
        "design": TargetAssetBinding(
            asset_id="design",
            uri="workspace://output/design.md",
            relative_path="output/design.md",
            path_kind="file",
            exists=True,
        ),
    }

    prompt_assembly = _assemble_prompt(
        pre,
        executable_job,
        "",
        workspace_root=tmp_path,
        asset_bindings=asset_bindings,
        target_binding=asset_bindings["design"],
    )

    prompt = prompt_assembly.prompt
    assert "[SOURCE ASSET SNAPSHOT]" in prompt
    assert "--- sequencing (output/sequencing.md) ---" in prompt
    assert "Implement ProjectStore primitives." in prompt
    assert "archive and search behavior with read-only archived handling." in prompt


def test_prompt_assembly_budget_records_closed_compaction_and_respects_limit():
    budget = PromptAssemblyBudget()

    emitted = budget.compact_text(
        "0123456789abcdef",
        max_chars=10,
        surface="unit:surface",
        reason="unit_prompt_budget",
        inspection_ref="test://full-surface",
        marker="...[cut]",
    )

    assert len(emitted) <= 10
    assert emitted.endswith("...[cut]")
    assert [record.to_dict() for record in budget.records()] == [
        {
            "surface": "unit:surface",
            "reason": "unit_prompt_budget",
            "size_unit": "chars",
            "original_size": 16,
            "emitted_size": len(emitted),
            "budget_size": 10,
            "inspection_ref": "test://full-surface",
        }
    ]


def test_prompt_assembly_records_over_budget_fd_context_and_source_surfaces(tmp_path):
    output = tmp_path / "output"
    output.mkdir(parents=True, exist_ok=True)
    design_path = output / "design.md"
    design_path.write_text(
        "SOURCE_HEAD\n" + ("source-body\n" * 180) + "SOURCE_TAIL_MARKER\n",
        encoding="utf-8",
    )
    code_path = output / "code.py"
    code_path.write_text("# target\n", encoding="utf-8")

    _, executable_job, _ = _fp_module_and_executable_job()
    fd_evaluator = Evaluator(
        "traceability_scan",
        F_D,
        "code traceability scan must pass before F_P dispatch",
    )
    pre = PrecomputedManifest(
        executable_job=executable_job,
        current_asset={"status": "in_progress"},
        regime_bindings=regime_binding_set_from_evaluator_partitions(
            failing=(fd_evaluator,)
        ),
        fd_results={
            "traceability_scan": {
                "detail": {
                    "status": "failed",
                    "stderr": "stderr-detail " * 40,
                    "stdout": "stdout-detail " * 120,
                }
            }
        },
        relevant_contexts={
            "design_standard": "context-detail " * 220,
        },
    )
    asset_bindings = {
        "design": TargetAssetBinding(
            asset_id="design",
            uri="workspace://output/design.md",
            relative_path="output/design.md",
            path_kind="file",
            exists=True,
        ),
        "code": TargetAssetBinding(
            asset_id="code",
            uri="workspace://output/code.py",
            relative_path="output/code.py",
            path_kind="file",
            exists=True,
        ),
    }

    prompt_assembly = _assemble_prompt(
        pre,
        executable_job,
        "",
        workspace_root=tmp_path,
        asset_bindings=asset_bindings,
        target_binding=asset_bindings["code"],
    )

    records = prompt_assembly.prompt_compactions()
    reasons = {record["reason"] for record in records}
    assert "fd_stdout_prompt_budget" in reasons
    assert "fd_stderr_prompt_budget" in reasons
    assert "context_prompt_budget" in reasons
    assert "source_snapshot_prompt_budget" in reasons
    assert "SOURCE_HEAD" in prompt_assembly.prompt
    assert "SOURCE_TAIL_MARKER" not in prompt_assembly.prompt
    assert any(
        record["inspection_ref"] == "workspace://output/design.md"
        and record["original_size"] > record["emitted_size"]
        for record in records
    )
    assert all(
        {
            "surface",
            "reason",
            "size_unit",
            "original_size",
            "emitted_size",
            "budget_size",
            "inspection_ref",
        }
        <= set(record)
        for record in records
    )


def test_prompt_assembly_records_environment_and_obligation_omissions(tmp_path):
    executable_job, source, target = _static_obligation_job(obligation_count=14)
    archive = Node(name="archive", schema="Archive")
    catalog = Node(name="catalog", schema="Catalog")
    result_path = tmp_path / ".ai-workspace" / "fp_results" / "manifest-omissions.json"
    pre = PrecomputedManifest(
        executable_job=executable_job,
        current_asset={},
        regime_bindings=regime_binding_set_from_evaluator_partitions(),
        fd_results={},
        relevant_contexts={},
        resolved_environment=ResolvedEnvironment(
            requires=(source,),
            provides=(target,),
            carries=(source, target, archive, catalog),
            bindings=(
                ResolvedEnvironmentBinding(
                    node=source,
                    projection={"status": "converged"},
                    required=True,
                    produced_within_carrier=False,
                ),
                ResolvedEnvironmentBinding(
                    node=archive,
                    projection={"status": "converged"},
                    produced_within_carrier=True,
                ),
                ResolvedEnvironmentBinding(
                    node=catalog,
                    projection={"status": "converged"},
                    produced_within_carrier=True,
                ),
            ),
        ),
    )

    prompt_assembly = _assemble_prompt(
        pre,
        executable_job,
        str(result_path),
        workspace_root=tmp_path,
    )

    records = prompt_assembly.prompt_compactions()
    environment_record = next(
        record
        for record in records
        if record["reason"] == "environment_binding_prompt_budget"
    )
    obligation_record = next(
        record
        for record in records
        if record["reason"] == "fulfillment_obligation_prompt_budget"
    )

    assert environment_record["size_unit"] == "bindings"
    assert environment_record["original_size"] == 3
    assert environment_record["emitted_size"] == 1
    assert environment_record["budget_size"] == 1
    assert environment_record["inspection_ref"] == "fp_manifest.runtime_environment_contract"
    assert obligation_record["size_unit"] == "items"
    assert obligation_record["original_size"] == 14
    assert obligation_record["emitted_size"] == 12
    assert obligation_record["budget_size"] == 12
    assert "fp_manifests/manifest-omissions.json#fulfillment_obligations" in obligation_record["inspection_ref"]
    assert "carried bindings omitted from prompt: 2" in prompt_assembly.prompt
    assert "total declared obligations: 14" in prompt_assembly.prompt
    assert "omitted from prompt: 2" in prompt_assembly.prompt
    assert "REQ-013" not in prompt_assembly.prompt


def test_event_envelope_carries_top_level_runtime_refs(tmp_path):
    stream = EventStream.open(tmp_path)

    emit(
        "graph_call_opened",
        {"call_id": "call-1"},
        stream=stream,
        context=EventContext(
            workflow_version="wf-1",
            work_key="wk-1",
            run_id="run-1",
            aggregate_type="graph_call",
            aggregate_id="call-1",
            graph_function_id="gf-1",
            materialization_id="mat-1",
        ),
    )

    [event] = stream.all_events()
    assert event["event_id"]
    assert event["event_type"] == "graph_call_opened"
    assert event["aggregate_type"] == "graph_call"
    assert event["aggregate_id"] == "call-1"
    assert event["workflow_version"] == "wf-1"
    assert event["work_key"] == "wk-1"
    assert event["run_id"] == "run-1"
    assert event["graph_function_id"] == "gf-1"
    assert event["materialization_id"] == "mat-1"
    assert event["data"]["work_key"] == "wk-1"
    assert event["data"]["run_id"] == "run-1"


def test_run_projection_accepts_top_level_envelope_runtime_refs(tmp_path):
    stream = EventStream.open(tmp_path)

    emit(
        "run_started",
        {"edge": "design→code"},
        stream=stream,
        context=EventContext(
            workflow_version="wf-1",
            work_key="wk-1",
            run_id="run-1",
            job_id="job-1",
        ),
    )
    emit(
        "run_failed",
        {"failure_class": "transport_failure"},
        stream=stream,
        context=EventContext(
            workflow_version="wf-1",
            work_key="wk-1",
            run_id="run-1",
            job_id="job-1",
        ),
    )

    state = run_state(stream.all_events(), "run-1")
    assert state is not None
    assert state.state == "failed"
    assert state.job_id == "job-1"
    assert state.failure_class == "transport_failure"

    projected = project(stream, "run", "run-1")
    assert projected["status"] == "failed"
    assert projected["job_id"] == "job-1"
    assert projected["event_count"] == 2


def test_graph_call_and_continuation_projection_from_event_envelope(tmp_path):
    stream = EventStream.open(tmp_path)

    emit(
        "graph_call_opened",
        {"call_id": "call-1"},
        stream=stream,
        context=EventContext(
            run_id="run-1",
            aggregate_type="graph_call",
            aggregate_id="call-1",
            graph_function_id="gf-1",
            materialization_id="mat-1",
        ),
    )
    emit(
        "graph_call_closed",
        {"call_id": "call-1"},
        stream=stream,
        context=EventContext(
            run_id="run-1",
            aggregate_type="graph_call",
            aggregate_id="call-1",
            graph_function_id="gf-1",
            materialization_id="mat-1",
        ),
    )
    emit(
        "continuation_opened",
        {
            "continuation_id": "cont-1",
            "continuation_kind": "retry",
            "caused_by_event_id": "evt-root",
            "call_id": "call-1",
        },
        stream=stream,
        context=EventContext(
            run_id="run-1",
            aggregate_type="continuation",
            aggregate_id="cont-1",
        ),
    )
    emit(
        "continuation_superseded",
        {
            "continuation_id": "cont-1",
            "continuation_kind": "retry",
            "caused_by_event_id": "evt-root",
            "call_id": "call-1",
        },
        stream=stream,
        context=EventContext(
            run_id="run-1",
            aggregate_type="continuation",
            aggregate_id="cont-1",
        ),
    )

    graph_call = project(stream, "graph_call", "call-1")
    assert graph_call["status"] == "closed"
    assert graph_call["graph_function_id"] == "gf-1"
    assert graph_call["materialization_id"] == "mat-1"

    continuation = project(stream, "continuation", "cont-1")
    assert continuation["status"] == "superseded"
    assert continuation["continuation_kind"] == "retry"
    assert continuation["run_id"] == "run-1"
    assert continuation["call_id"] == "call-1"


def test_dispatch_runtime_emits_failure_graph_call_and_continuation(monkeypatch, tmp_path):
    manifest = {
        "manifest_id": "manifest-1",
        "call_id": "call-manifest-1",
        "edge": "design→code",
        "run_id": "run-1",
        "workflow_version": "wf-1",
        "graph_function_id": "gf-1",
        "materialization_id": "mat-1",
        "vector_id": "vec-1",
        "job_id": "job-1",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-1.json"),
        "spec_hash": "spec-1",
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        return AgentResult(stdout="", stderr="boom", returncode=1, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "yield"
    assert summary["stopped_by"] == "yield"
    assert summary["handoff_kind"] == "retry"
    assert summary["handoff_reason"] == "transport_failure"
    assert summary["failure_class"] == "transport_failure"

    stream = EventStream.open(tmp_path)
    event_types = [event["event_type"] for event in stream.all_events()]
    assert event_types == [
        "graph_call_opened",
        "worker_turn_started",
        "worker_turn_failed",
        "graph_call_failed",
        "continuation_opened",
        "run_yielded",
    ]

    graph_call = project(stream, "graph_call", "call-manifest-1")
    assert graph_call["status"] == "failed"
    assert graph_call["failure_class"] == "transport_failure"

    continuation = project(stream, "continuation", summary["continuation_id"])
    assert continuation["status"] == "open"
    assert continuation["continuation_kind"] == "retry"
    assert continuation["run_id"] == "run-1"

    run = project(stream, "run", "run-1")
    assert run["status"] == "yielded"


def test_dispatch_runtime_retry_continuation_projects_live_status_as_yielded(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    manifest = {
        "manifest_id": "manifest-live-retry",
        "call_id": "call-live-retry",
        "edge": "design→code",
        "run_id": "run-live-retry",
        "work_key": "wk-live-retry",
        "workflow_version": "wf-live-retry",
        "graph_function_id": "gf-live-retry",
        "materialization_id": "mat-live-retry",
        "vector_id": "vec-live-retry",
        "job_id": "job-live-retry",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-live-retry.json"),
        "spec_hash": "spec-live-retry",
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        return AgentResult(stdout="", stderr="boom", returncode=1, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "yield"

    status = project_live_run_status(tmp_path, run_id="run-live-retry")
    assert status["live_state"] == "yielded"
    assert status["run_status"] == "yielded"
    assert status["failure_class"] == "transport_failure"
    assert status["graph_call_status"] == "failed"
    assert status["open_continuations"] == [
        {
            "continuation_id": summary["continuation_id"],
            "continuation_kind": "retry",
            "call_id": "call-live-retry",
            "status": "open",
        }
    ]


def test_dispatch_runtime_rejects_prompt_only_manifest_without_admitted_budget(tmp_path):
    manifest = {
        "manifest_id": "manifest-prompt-only",
        "call_id": "call-prompt-only",
        "edge": "design→code",
        "run_id": "run-prompt-only",
        "prompt": "write code",
        "result_path": str(
            tmp_path / ".ai-workspace" / "fp_results" / "manifest-prompt-only.json"
        ),
    }

    with pytest.raises(ValueError, match="prompt_compactions"):
        dispatch_bound_manifest_via_transport(
            manifest,
            tmp_path,
            config={"runtime_backend": "codex_cli"},
        )


def test_dispatch_runtime_forwards_local_transport_contract_config(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-forward.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-forward",
        "call_id": "call-manifest-forward",
        "edge": "design→code",
        "run_id": "run-forward",
        "workflow_version": "wf-forward",
        "graph_function_id": "gf-forward",
        "materialization_id": "mat-forward",
        "vector_id": "vec-forward",
        "job_id": "job-forward",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(result_path),
        "spec_hash": "spec-forward",
        "resolved_policy": resolve_policy_bundle(),
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
    }
    forwarded: dict[str, object] = {}

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        forwarded["agent"] = agent
        forwarded["timeout"] = timeout
        forwarded["config"] = config
        forwarded["manifest"] = kwargs.get("manifest")
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)
    (tmp_path / "local_transport_contract.json").write_text(
        json.dumps({"codex": {}}),
        encoding="utf-8",
    )

    config = {
        "runtime_backend": "codex_cli",
        "transport_contract": "local_transport_contract.json",
    }
    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config=config,
    )

    assert summary["status"] == "ok"
    assert forwarded["agent"] == "codex"
    assert forwarded["timeout"] == 300
    assert forwarded["config"] == config
    assert forwarded["manifest"]["manifest_id"] == "manifest-forward"


def test_dispatch_runtime_classifies_missing_local_transport_contract_as_policy_config_defect(tmp_path):
    manifest = {
        "manifest_id": "manifest-missing-contract",
        "call_id": "call-missing-contract",
        "edge": "design→code",
        "run_id": "run-missing-contract",
        "workflow_version": "wf-missing-contract",
        "graph_function_id": "gf-missing-contract",
        "materialization_id": "mat-missing-contract",
        "vector_id": "vec-missing-contract",
        "job_id": "job-missing-contract",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-missing-contract.json"),
        "spec_hash": "spec-missing-contract",
    }

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={
            "runtime_backend": "codex_cli",
            "transport_contract": "missing_transport_contract.json",
        },
    )

    assert summary["status"] == "error"
    assert summary["failure_class"] == "policy_config_defect"
    assert "continuation_id" not in summary
    assert "handoff_kind" not in summary
    assert "handoff_reason" not in summary

    events = EventStream.open(tmp_path).all_events()
    event_types = [event["event_type"] for event in events]
    assert "continuation_opened" not in event_types
    assert "run_yielded" not in event_types
    assert event_types == [
        "graph_call_opened",
        "graph_call_failed",
        "run_failed",
    ]

    status = project_live_run_status(tmp_path, run_id="run-missing-contract")
    assert status["live_state"] == "failed"
    assert status["run_status"] == "failed"
    assert status["failure_class"] == "policy_config_defect"
    assert status["open_continuations"] == []


def test_dispatch_runtime_runtime_defect_stays_terminal_without_retry_continuation(
    monkeypatch,
    tmp_path,
):
    workspace_bootstrap(tmp_path)
    manifest = {
        "manifest_id": "manifest-runtime-defect",
        "call_id": "call-runtime-defect",
        "edge": "design→code",
        "run_id": "run-runtime-defect",
        "work_key": "wk-runtime-defect",
        "workflow_version": "wf-runtime-defect",
        "graph_function_id": "gf-runtime-defect",
        "materialization_id": "mat-runtime-defect",
        "vector_id": "vec-runtime-defect",
        "job_id": "job-runtime-defect",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-runtime-defect.json"),
        "spec_hash": "spec-runtime-defect",
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        return AgentResult(
            stdout="",
            stderr="engine runtime defect",
            returncode=-1,
            agent=agent,
            failure_class="runtime_defect",
            supervision_mode="supervised",
        )

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "error"
    assert summary["stopped_by"] == "fp_runtime_failure"
    assert summary["failure_class"] == "runtime_defect"
    assert "continuation_id" not in summary
    assert "handoff_kind" not in summary
    assert "handoff_reason" not in summary

    events = EventStream.open(tmp_path).all_events()
    assert [event["event_type"] for event in events] == [
        "graph_call_opened",
        "worker_turn_started",
        "worker_turn_failed",
        "graph_call_failed",
        "run_failed",
    ]
    assert all(event["event_type"] != "continuation_opened" for event in events)
    assert all(event["event_type"] != "run_yielded" for event in events)

    status = project_live_run_status(tmp_path, run_id="run-runtime-defect")
    assert status["live_state"] == "failed"
    assert status["run_status"] == "failed"
    assert status["failure_class"] == "runtime_defect"
    assert status["open_continuations"] == []


def test_dispatch_runtime_ingests_result_and_closes_graph_call(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-2.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-2",
        "call_id": "call-manifest-2",
        "edge": "design→code",
        "run_id": "run-2",
        "work_key": "wk-2",
        "workflow_version": "wf-2",
        "graph_function_id": "gf-2",
        "materialization_id": "mat-2",
        "vector_id": "vec-2",
        "job_id": "job-2",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(result_path),
        "spec_hash": "spec-2",
        "resolved_policy": resolve_policy_bundle(),
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["call_id"] == "call-manifest-2"
    assert summary["events_emitted"] == 6

    stream = EventStream.open(tmp_path)
    events = stream.all_events()
    event_types = [event["event_type"] for event in events]
    assert event_types == [
        "graph_call_opened",
        "worker_turn_started",
        "worker_turn_succeeded",
        "assessed",
        "proof_passed",
        "closure_passed",
        "edge_converged",
        "graph_call_closed",
        "run_completed",
    ]
    aggregate_types = {event["event_type"]: event["aggregate_type"] for event in events}
    assert aggregate_types["assessed"] == "graph_call"
    assert aggregate_types["proof_passed"] == "graph_call"
    assert aggregate_types["closure_passed"] == "graph_call"
    assert aggregate_types["graph_call_closed"] == "graph_call"
    assert aggregate_types["run_completed"] == "run"

    graph_call = project(stream, "graph_call", "call-manifest-2")
    assert graph_call["status"] == "closed"
    assert graph_call["graph_function_id"] == "gf-2"

    run = project(stream, "run", "run-2")
    assert run["status"] == "completed"


def test_dispatch_runtime_missing_resolved_policy_emits_fail_closed_runtime_truth(
    monkeypatch,
    tmp_path,
):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-missing-policy-dispatch.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-missing-policy-dispatch",
        "call_id": "call-missing-policy-dispatch",
        "edge": "design→code",
        "run_id": "run-missing-policy-dispatch",
        "workflow_version": "wf-missing-policy-dispatch",
        "graph_function_id": "gf-missing-policy-dispatch",
        "materialization_id": "mat-missing-policy-dispatch",
        "vector_id": "vec-missing-policy-dispatch",
        "job_id": "job-missing-policy-dispatch",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(result_path),
        "spec_hash": "spec-missing-policy-dispatch",
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "error"
    assert summary["failure_class"] == "policy_config_defect"
    assert "resolved_policy" in summary["reason"]

    stream = EventStream.open(tmp_path)
    event_types = [event["event_type"] for event in stream.all_events()]
    assert event_types == [
        "graph_call_opened",
        "worker_turn_started",
        "worker_turn_succeeded",
        "graph_call_failed",
        "run_failed",
    ]


def test_ingest_rejects_manifest_missing_fulfillment_obligations(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-missing-obligations.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-missing-obligations",
        "call_id": "call-missing-obligations",
        "edge": "design→code",
        "run_id": "run-missing-obligations",
        "workflow_version": "wf-missing-obligations",
        "graph_function_id": "gf-missing-obligations",
        "materialization_id": "mat-missing-obligations",
        "vector_id": "vec-missing-obligations",
        "job_id": "job-missing-obligations",
        "prompt": "write code",
        "result_path": str(result_path),
        "spec_hash": "spec-missing-obligations",
    }

    with pytest.raises(ValueError, match="manifest missing fulfillment_obligations"):
        ingest_fp_result(result_path, tmp_path, manifest_data=manifest)


def test_ingest_requires_target_binding_materialization_before_success_lifecycle(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    manifest_id = "manifest-missing-target"
    result_path = results_dir / f"{manifest_id}.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": manifest_id,
        "call_id": "call-missing-target",
        "edge": "design→code",
        "run_id": "run-missing-target",
        "workflow_version": "wf-missing-target",
        "graph_function_id": "gf-missing-target",
        "materialization_id": "mat-missing-target",
        "vector_id": "vec-missing-target",
        "job_id": "job-missing-target",
        "prompt": "write code",
        "result_path": str(result_path),
        "spec_hash": "spec-missing-target",
        "resolved_policy": resolve_policy_bundle(),
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
        "target_asset_binding": {
            "asset_id": "code",
            "uri": "workspace://output/code.py",
            "relative_path": "output/code.py",
            "path_kind": "file",
            "exists": False,
        },
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "yield"
    assert summary["stopped_by"] == "yield"
    assert summary["handoff_kind"] == "repair"
    assert summary["handoff_reason"] == "target_binding_not_materialized"
    assert summary["failure_class"] == "certification_failure"
    assert summary["continuation_id"]

    ledger = json.loads(
        published_fulfillment_ledger_path(tmp_path, manifest_id).read_text(encoding="utf-8")
    )
    assert ledger["target_materialization_passed"] is False
    assert ledger["target_materialization_reason"] == "target_binding_not_materialized"
    assert ledger["target_certification_passed"] is False
    assert ledger["target_certification_reason"] == "target_binding_not_materialized"
    assert ledger["edge_converged"] is False

    event_types = [
        event["event_type"] for event in EventStream.open(tmp_path).all_events()
    ]
    assert "proof_passed" not in event_types
    assert "closure_passed" not in event_types
    assert "edge_converged" not in event_types
    assert "proof_failed" in event_types
    assert "run_yielded" in event_types


def test_ingest_fail_closes_when_manifest_omits_resolved_policy(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-missing-policy.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-missing-policy",
        "call_id": "call-missing-policy",
        "edge": "design→code",
        "run_id": "run-missing-policy",
        "workflow_version": "wf-missing-policy",
        "graph_function_id": "gf-missing-policy",
        "materialization_id": "mat-missing-policy",
        "vector_id": "vec-missing-policy",
        "job_id": "job-missing-policy",
        "prompt": "write code",
        "result_path": str(result_path),
        "spec_hash": "spec-missing-policy",
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
    }

    with pytest.raises(ValueError, match="manifest must carry resolved_policy"):
        ingest_fp_result(result_path, tmp_path, manifest_data=manifest)


def test_traversal_runtime_requires_admitted_resolved_policy(tmp_path):
    workspace_bootstrap(tmp_path)
    module, executable_job, _ = _fp_module_and_executable_job()
    stream = EventStream.open(tmp_path)
    precomputed = PrecomputedManifest(
        executable_job=executable_job,
        current_asset={},
        regime_bindings=regime_binding_set_from_evaluator_partitions(),
        fd_results={},
        relevant_contexts={},
    )

    with pytest.raises(ValueError, match="requires admitted resolved_policy carrier truth"):
        TraversalRuntime(
            module=module,
            executable_job=executable_job,
            precomputed=precomputed,
            workspace_root=tmp_path,
            stream=stream,
            worker=Worker(id="runtime-envelope", can_execute=[executable_job]),
            spec_hash="spec-runtime-envelope",
        )


def test_auto_dispatch_preserved_result_missing_resolved_policy_emits_fail_closed_runtime_truth(
    tmp_path,
):
    workspace_bootstrap(tmp_path)
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-missing-policy-preserved.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest_path = manifests_dir / "manifest-missing-policy-preserved.json"
    manifest_path.write_text(
        json.dumps(
            {
                "manifest_id": "manifest-missing-policy-preserved",
                "call_id": "call-missing-policy-preserved",
                "edge": "design→code",
                "run_id": "run-missing-policy-preserved",
                "workflow_version": "wf-missing-policy-preserved",
                "graph_function_id": "gf-missing-policy-preserved",
                "materialization_id": "mat-missing-policy-preserved",
                "vector_id": "vec-missing-policy-preserved",
                "job_id": "job-missing-policy-preserved",
                "spec_hash": "spec-missing-policy-preserved",
                **_prompt_manifest_contract(),
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
                "advancement_transition": {
                    "kind": "fp_dispatch",
                    "manifest_id": "manifest-missing-policy-preserved",
                    "dispatch_ref": "test.dispatch:carrier",
                    "result_path": str(result_path),
                },
            }
        ),
        encoding="utf-8",
    )

    summary = auto_dispatch_from_result(
        {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "manifest_id": "manifest-missing-policy-preserved",
            "run_id": "run-missing-policy-preserved",
            "call_id": "call-missing-policy-preserved",
            "edge": "design→code",
            "advancement_transition": {
                "kind": "fp_dispatch",
                "manifest_id": "manifest-missing-policy-preserved",
                "dispatch_ref": "test.dispatch:carrier",
                "result_path": str(result_path),
            },
        },
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "error"
    assert summary["failure_class"] == "policy_config_defect"
    assert "resolved_policy" in summary["reason"]

    event_types = [event["event_type"] for event in EventStream.open(tmp_path).all_events()]
    assert event_types == [
        "worker_turn_salvaged",
        "graph_call_opened",
        "graph_call_failed",
        "run_failed",
    ]


def test_ingest_applies_declared_target_certification_hook_before_closure(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    output_dir = tmp_path / "output"
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "code.py").write_text("print('ok')\n", encoding="utf-8")
    manifest_id = "manifest-hook-target"
    result_path = results_dir / f"{manifest_id}.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    resolved_policy = resolve_policy_bundle()
    resolved_policy["closure"] = {
        "ref": "genesis.policy_defaults:closure_require_resolution_or_fh",
        "config": {
            "target_certification_ref": (
                "tests.test_abg3_runtime_envelope:runtime_target_certification_hook"
            ),
            "target_certification_config": {"force_fail": True},
        },
    }
    manifest = {
        "manifest_id": manifest_id,
        "call_id": "call-hook-target",
        "edge": "design→code",
        "run_id": "run-hook-target",
        "workflow_version": "wf-hook-target",
        "graph_function_id": "gf-hook-target",
        "materialization_id": "mat-hook-target",
        "vector_id": "vec-hook-target",
        "job_id": "job-hook-target",
        "prompt": "write code",
        "result_path": str(result_path),
        "spec_hash": "spec-hook-target",
        "resolved_policy": resolved_policy,
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
        "target_asset_binding": {
            "asset_id": "code",
            "uri": "workspace://output/code.py",
            "relative_path": "output/code.py",
            "path_kind": "file",
            "exists": True,
        },
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "yield"
    assert summary["stopped_by"] == "yield"
    assert summary["handoff_kind"] == "repair"
    assert summary["handoff_reason"] == "declared_target_contract_failed"
    assert summary["failure_class"] == "certification_failure"
    assert summary["continuation_id"]

    ledger = json.loads(
        published_fulfillment_ledger_path(tmp_path, manifest_id).read_text(encoding="utf-8")
    )
    assert ledger["target_materialization_passed"] is True
    assert ledger["target_certification_passed"] is False
    assert ledger["target_certification_source"] == "target_certification_hook"
    assert ledger["target_certification_reason"] == "declared_target_contract_failed"
    assert ledger["target_certification_hook_ref"] == (
        "tests.test_abg3_runtime_envelope:runtime_target_certification_hook"
    )
    assert ledger["edge_converged"] is False


def test_bind_fp_certified_requires_admitted_ledger(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _fp_executable_job()
    ledger_path, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-admitted",
        ledger={
            "edge": executable_job.vector.name,
            "spec_hash": "spec-admitted",
            "workflow_version": "wf-admitted",
            "admission_required": True,
            "carry_converged": True,
            "admitted": False,
            "obligations": [
                {
                    "id": evaluator.name,
                    "evaluator": evaluator.name,
                    "fulfillment_status": "fulfilled",
                }
            ],
        },
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": evaluator.name,
            "spec_hash": "spec-admitted",
            "workflow_version": "wf-admitted",
            "manifest_id": "manifest-admitted",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-admitted"),
    )

    assert bind_fp_certified(
        executable_job,
        evaluator,
        stream.all_events(),
        spec_hash="spec-admitted",
        current_workflow_version="wf-admitted",
        workspace_root=tmp_path,
    ) is False


def test_bind_fp_certified_requires_target_certification_passed(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _fp_executable_job()
    _, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-target-cert",
        ledger={
            "edge": executable_job.vector.name,
            "spec_hash": "spec-target-cert",
            "workflow_version": "wf-target-cert",
            "admission_required": False,
            "carry_converged": True,
            "fulfillment_converged": True,
            "admitted": True,
            "target_certification_passed": False,
            "target_certification_reason": "declared_target_contract_failed",
            "obligations": [
                {
                    "id": evaluator.name,
                    "evaluator": evaluator.name,
                    "fulfillment_status": "fulfilled",
                }
            ],
        },
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": evaluator.name,
            "spec_hash": "spec-target-cert",
            "workflow_version": "wf-target-cert",
            "manifest_id": "manifest-target-cert",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-target-cert"),
    )

    assert bind_fp_certified(
        executable_job,
        evaluator,
        stream.all_events(),
        spec_hash="spec-target-cert",
        current_workflow_version="wf-target-cert",
        workspace_root=tmp_path,
    ) is False


def test_bind_fp_certified_accepts_manifest_evaluator_mapping(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _fp_executable_job()
    _, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-mapped",
        ledger={
            "edge": executable_job.vector.name,
            "spec_hash": "spec-mapped",
            "workflow_version": "wf-mapped",
            "admission_required": False,
            "carry_converged": True,
            "admitted": True,
            "obligations": [
                {
                    "id": "req-001",
                    "evaluator": evaluator.name,
                    "fulfillment_status": "fulfilled",
                }
            ],
        },
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": "req-001",
            "spec_hash": "spec-mapped",
            "workflow_version": "wf-mapped",
            "manifest_id": "manifest-mapped",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-mapped"),
    )

    assert bind_fp_certified(
        executable_job,
        evaluator,
        stream.all_events(),
        spec_hash="spec-mapped",
        current_workflow_version="wf-mapped",
        workspace_root=tmp_path,
    ) is True


def test_dynamic_obligation_ledger_materializes_manifest_set_and_certifies_at_edge_scope(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _dynamic_fp_executable_job()
    obligations = declared_fulfillment_obligations_for_job(
        executable_job,
        workspace_root=tmp_path,
    )
    policy = declared_obligation_ledger_policy_for_job(executable_job)

    assert [entry["id"] for entry in obligations] == ["REQ-001", "REQ-002"]
    assert policy is not None
    assert policy["declaration_family"] == "adapter_driven"
    assert policy["certification_scope"] == "edge"

    ledger = _build_published_fulfillment_ledger(
        manifest={
            "manifest_id": "manifest-dynamic",
            "edge": executable_job.vector.name,
            "spec_hash": "spec-dynamic",
            "workflow_version": "wf-dynamic",
            "fulfillment_obligations": obligations,
            "obligation_ledger_policy": policy,
        },
        manifest_id="manifest-dynamic",
        result_data={
            "edge": executable_job.vector.name,
            "actor": "codex",
            "fulfillment_assessments": [
                {
                    "id": "REQ-001",
                    "fulfillment_status": "fulfilled",
                    "fulfillment_detail": "req-001 covered",
                    "blocking_reasons": [],
                    "evidence_refs": ["code/req-001.py"],
                },
                {
                    "id": "REQ-002",
                    "fulfillment_status": "fulfilled",
                    "fulfillment_detail": "req-002 covered",
                    "blocking_reasons": [],
                    "evidence_refs": ["code/req-002.py"],
                },
            ],
        },
        spec_hash="spec-dynamic",
        workflow_version="wf-dynamic",
    )
    _, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-dynamic",
        ledger=ledger,
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": "REQ-001",
            "spec_hash": "spec-dynamic",
            "workflow_version": "wf-dynamic",
            "manifest_id": "manifest-dynamic",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-dynamic"),
    )

    assert ledger["declaration_family"] == "adapter_driven"
    assert ledger["certification_scope"] == "edge"
    assert ledger["signal_key"] == "dynamic_requirements"
    assert [entry["evaluator"] for entry in ledger["obligations"]] == ["REQ-001", "REQ-002"]
    assert bind_fp_certified(
        executable_job,
        evaluator,
        stream.all_events(),
        spec_hash="spec-dynamic",
        current_workflow_version="wf-dynamic",
        workspace_root=tmp_path,
    ) is True


def test_bind_fp_certified_uses_fh_approval_to_admit_resolved_ledger(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _fp_executable_job()
    _, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-approved",
        ledger={
            "edge": executable_job.vector.name,
            "spec_hash": "spec-approved",
            "workflow_version": "wf-approved",
            "admission_required": True,
            "admitted": False,
            "carry_converged": True,
            "fulfillment_converged": True,
            "obligations": [
                {
                    "id": "req-approved",
                    "evaluator": evaluator.name,
                    "fulfillment_status": "fulfilled",
                }
            ],
        },
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": "req-approved",
            "spec_hash": "spec-approved",
            "workflow_version": "wf-approved",
            "manifest_id": "manifest-approved",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-approved"),
    )
    emit(
        "approved",
        {
            "kind": "fh_review",
            "edge": executable_job.vector.name,
            "actor": "test_human",
        },
        stream=stream,
        context=EventContext(workflow_version="wf-approved"),
    )

    assert bind_fp_certified(
        executable_job,
        evaluator,
        stream.all_events(),
        spec_hash="spec-approved",
        current_workflow_version="wf-approved",
        workspace_root=tmp_path,
    ) is True


def test_bind_fh_requires_resolved_fulfillment_ledger_not_raw_approval(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, _ = _fp_executable_job()

    emit(
        "approved",
        {
            "kind": "fh_review",
            "edge": executable_job.vector.name,
            "actor": "test_human",
        },
        stream=stream,
        context=EventContext(workflow_version="wf-fh"),
    )

    assert bind_fh(
        executable_job,
        stream.all_events(),
        current_workflow_version="wf-fh",
        workspace_root=tmp_path,
    ) is False


def test_approved_republishes_ledger_and_emits_closure_followups(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _fp_executable_job()
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    (manifests_dir / "manifest-followup.json").write_text(
        json.dumps(
            {
                "manifest_id": "manifest-followup",
                "edge": executable_job.vector.name,
                "spec_hash": "spec-followup",
                "workflow_version": "wf-followup",
                "run_id": "run-followup",
                "fulfillment_admission_required": True,
                "fulfillment_obligations": _fulfillment_obligations(
                    (evaluator.name, "code satisfies the design contract")
                ),
            }
        ),
        encoding="utf-8",
    )
    ledger_path, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-followup",
        ledger={
            "edge": executable_job.vector.name,
            "spec_hash": "spec-followup",
            "workflow_version": "wf-followup",
            "admission_required": True,
            "admitted": False,
            "admission_basis": "pending_fh_review",
            "carry_converged": True,
            "fulfillment_converged": True,
            "edge_converged": False,
            "obligations": [
                {
                    "id": evaluator.name,
                    "evaluator": evaluator.name,
                    "fulfillment_status": "fulfilled",
                }
            ],
        },
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": evaluator.name,
            "spec_hash": "spec-followup",
            "workflow_version": "wf-followup",
            "manifest_id": "manifest-followup",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-followup", run_id="run-followup"),
    )
    emit(
        "approved",
        {
            "kind": "fh_review",
            "edge": executable_job.vector.name,
            "actor": "test_human",
            "workflow_version": "wf-followup",
        },
        stream=stream,
        context=EventContext(workflow_version="wf-followup", run_id="run-followup"),
    )

    updated = json.loads(ledger_path.read_text(encoding="utf-8"))
    assert updated["admitted"] is True
    assert updated["edge_converged"] is True
    assert [event["event_type"] for event in stream.all_events()][-4:] == [
        "proof_passed",
        "closure_passed",
        "edge_converged",
        "run_completed",
    ]


def test_revoked_reopens_edge_projection_and_demotes_ledger(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _fp_executable_job()
    ledger_path, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-revoked",
        ledger={
            "edge": executable_job.vector.name,
            "spec_hash": "spec-revoked",
            "workflow_version": "wf-revoked",
            "admission_required": True,
            "admitted": True,
            "admission_basis": "approved_fh_review",
            "carry_converged": True,
            "fulfillment_converged": True,
            "edge_converged": True,
            "obligations": [
                {
                    "id": evaluator.name,
                    "evaluator": evaluator.name,
                    "fulfillment_status": "fulfilled",
                }
            ],
        },
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": evaluator.name,
            "spec_hash": "spec-revoked",
            "workflow_version": "wf-revoked",
            "manifest_id": "manifest-revoked",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-revoked"),
    )
    emit(
        "edge_converged",
        {
            "edge": executable_job.vector.name,
            "target": executable_job.vector.target.name,
            "delta": 0,
            "certified_by": "published_fulfillment_ledger",
        },
        stream=stream,
        context=EventContext(workflow_version="wf-revoked"),
    )
    emit(
        "revoked",
        {
            "kind": "fh_approval",
            "edge": executable_job.vector.name,
            "actor": "test_human",
            "reason": "retracted",
            "workflow_version": "wf-revoked",
        },
        stream=stream,
        context=EventContext(workflow_version="wf-revoked"),
    )

    updated = json.loads(ledger_path.read_text(encoding="utf-8"))
    assert updated["admitted"] is False
    assert updated["edge_converged"] is False
    assert any(event["event_type"] == "edge_reopened" for event in stream.all_events())
    assert project(stream, executable_job.vector.target.name, "current")["status"] == "in_progress"


def test_projection_reset_clears_converged_edge_status(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, _ = _fp_executable_job()

    emit(
        "edge_converged",
        {
            "edge": executable_job.vector.name,
            "target": executable_job.vector.target.name,
            "work_key": "wk-reset",
            "delta": 0,
            "certified_by": "published_fulfillment_ledger",
        },
        stream=stream,
        context=EventContext(workflow_version="wf-reset", work_key="wk-reset"),
    )
    emit(
        "reset",
        {
            "scope": "work_key",
            "work_key": "wk-reset",
        },
        stream=stream,
        context=EventContext(workflow_version="wf-reset", work_key="wk-reset"),
    )

    projected = project(stream, executable_job.vector.target.name, "current", work_key="wk-reset")
    assert projected["status"] == "not_started"
    assert projected["edges_converged"] == []


def test_published_ledger_is_total_over_declared_obligations():
    ledger = _build_published_fulfillment_ledger(
        manifest={
            "fulfillment_obligations": [
                {
                    "id": "req-1",
                    "evaluator": "code_complete",
                    "statement": "code satisfies the design contract",
                },
                {
                    "id": "req-2",
                    "evaluator": "tests_complete",
                    "statement": "tests satisfy the design contract",
                },
            ]
        },
        manifest_id="manifest-total",
        result_data={
            "edge": "design→code",
            "actor": "codex",
            "fulfillment_assessments": [
                {
                    "id": "req-1",
                    "fulfillment_status": "fulfilled",
                    "fulfillment_detail": "implemented",
                    "blocking_reasons": [],
                    "evidence_refs": ["implemented"],
                }
            ],
        },
        spec_hash="spec-total",
        workflow_version="wf-total",
    )

    assert ledger["expected_count"] == 2
    assert ledger["missing_count"] == 1
    assert len(ledger["obligations"]) == 2
    assert ledger["obligations"][1]["id"] == "req-2"
    assert ledger["obligations"][1]["assessment_present"] is False
    assert ledger["obligations"][1]["fulfillment_status"] == "unfulfilled"


def test_ingest_unadmitted_ledger_fails_proof_and_opens_fh_review(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-fh-review.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ready for human review")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-fh-review",
        "call_id": "call-fh-review",
        "edge": "design→code",
        "run_id": "run-fh-review",
        "work_key": "wk-fh-review",
        "workflow_version": "wf-fh-review",
        "graph_function_id": "gf-fh-review",
        "materialization_id": "mat-fh-review",
        "vector_id": "vec-fh-review",
        "job_id": "job-fh-review",
        "prompt": "write code",
        "result_path": str(result_path),
        "spec_hash": "spec-fh-review",
        "resolved_policy": resolve_policy_bundle(),
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
        "fulfillment_admission_required": True,
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "yield"
    assert summary["stopped_by"] == "yield"
    assert summary["handoff_kind"] == "fh_review"
    assert summary["handoff_reason"] == "pending_fh_review"
    assert summary["failure_class"] == "probabilistic_non_convergence"
    assert summary["continuation_id"]

    events = EventStream.open(tmp_path).all_events()
    assert [event["event_type"] for event in events] == [
        "assessed",
        "proof_failed",
        "graph_call_failed",
        "continuation_opened",
        "run_yielded",
    ]
    assert events[1]["data"]["policy_reason"] == "pending_fh_review"
    continuation = project(EventStream.open(tmp_path), "continuation", summary["continuation_id"])
    assert continuation["status"] == "open"
    assert continuation["continuation_kind"] == "fh_review"


def test_ingest_repair_continuation_projects_live_status_as_yielded(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    manifest_id = "manifest-live-repair"
    result_path = results_dir / f"{manifest_id}.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": manifest_id,
        "call_id": "call-live-repair",
        "edge": "design→code",
        "run_id": "run-live-repair",
        "work_key": "wk-live-repair",
        "workflow_version": "wf-live-repair",
        "graph_function_id": "gf-live-repair",
        "materialization_id": "mat-live-repair",
        "vector_id": "vec-live-repair",
        "job_id": "job-live-repair",
        "prompt": "write code",
        "result_path": str(result_path),
        "spec_hash": "spec-live-repair",
        "resolved_policy": resolve_policy_bundle(),
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
        "target_asset_binding": {
            "asset_id": "code",
            "uri": "workspace://output/code.py",
            "relative_path": "output/code.py",
            "path_kind": "file",
            "exists": False,
        },
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "yield"

    status = project_live_run_status(tmp_path, run_id="run-live-repair")
    assert status["live_state"] == "yielded"
    assert status["run_status"] == "yielded"
    assert status["failure_class"] == "certification_failure"
    assert status["graph_call_status"] == "failed"
    assert status["open_continuations"] == [
        {
            "continuation_id": summary["continuation_id"],
            "continuation_kind": "repair",
            "call_id": "call-live-repair",
            "status": "open",
        }
    ]


def test_bind_fp_certified_rejects_missing_obligation_row(tmp_path):
    stream = EventStream.open(tmp_path)
    executable_job, evaluator = _fp_executable_job()
    _, ledger_ref = _write_test_published_ledger(
        tmp_path,
        manifest_id="manifest-missing-row",
        ledger={
            "edge": executable_job.vector.name,
            "spec_hash": "spec-missing-row",
            "workflow_version": "wf-missing-row",
            "carry_converged": True,
            "admitted": True,
            "obligations": [],
        },
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": executable_job.vector.name,
            "obligation_id": evaluator.name,
            "spec_hash": "spec-missing-row",
            "workflow_version": "wf-missing-row",
            "manifest_id": "manifest-missing-row",
            "published_ledger_ref": ledger_ref,
        },
        stream=stream,
        context=EventContext(workflow_version="wf-missing-row"),
    )

    assert bind_fp_certified(
        executable_job,
        evaluator,
        stream.all_events(),
        spec_hash="spec-missing-row",
        current_workflow_version="wf-missing-row",
        workspace_root=tmp_path,
    ) is False


def test_auto_dispatch_missing_manifest_path_emits_fail_closed_runtime_truth(tmp_path):
    summary = auto_dispatch_from_result(
        {
            "status": "iterated",
            "blocking_reason": "fp_dispatch",
            "run_id": "run-defect",
            "call_id": "call-defect",
            "edge": "design→code",
        },
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "error"
    assert summary["failure_class"] == "policy_config_defect"

    stream = EventStream.open(tmp_path)
    assert [event["event_type"] for event in stream.all_events()] == [
        "graph_call_opened",
        "graph_call_failed",
        "run_failed",
    ]


def test_auto_dispatch_derives_manifest_path_from_manifest_id(tmp_path, monkeypatch):
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = manifests_dir / "manifest-derive.json"
    manifest_path.write_text(
        json.dumps(
            {
                "manifest_id": "manifest-derive",
                "call_id": "call-manifest-derive",
                "edge": "design→code",
                "run_id": "run-manifest-derive",
                "graph_function_id": "gf-manifest-derive",
                "failing_evaluators": [
                    {
                        "name": "code_complete",
                        "regime": "F_P",
                        "description": "code satisfies the design contract",
                    }
                ],
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
                "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-derive.json"),
                **_prompt_manifest_contract(),
                "resolved_policy": {
                    "dispatch": {
                        "ref": "genesis.dispatch_runtime:dispatch_bound_manifest_via_supervised_transport",
                        "config": {},
                    }
                },
            }
        ),
        encoding="utf-8",
    )

    def fake_dispatch(manifest, workspace, *, config=None, hook_config=None):
        assert manifest["manifest_id"] == "manifest-derive"
        assert workspace == tmp_path
        return {"status": "ok", "call_id": manifest["call_id"], "events_emitted": 0}

    monkeypatch.setattr(
        "genesis.dispatch_runtime.dispatch_bound_manifest_via_supervised_transport",
        fake_dispatch,
    )

    summary = auto_dispatch_from_result(
        {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "manifest_id": "manifest-derive",
            "run_id": "run-manifest-derive",
            "call_id": "call-manifest-derive",
            "edge": "design→code",
        },
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["call_id"] == "call-manifest-derive"


def test_auto_dispatch_prefers_manifest_carrier_dispatch_ref_over_policy_resolution(
    tmp_path,
    monkeypatch,
):
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = manifests_dir / "manifest-carrier.json"
    manifest_path.write_text(
        json.dumps(
            {
                "manifest_id": "manifest-carrier",
                "call_id": "call-manifest-carrier",
                "edge": "design→code",
                "run_id": "run-manifest-carrier",
                "graph_function_id": "gf-manifest-carrier",
                "failing_evaluators": [
                    {
                        "name": "code_complete",
                        "regime": "F_P",
                        "description": "code satisfies the design contract",
                    }
                ],
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
                "result_path": str(
                    tmp_path / ".ai-workspace" / "fp_results" / "manifest-carrier.json"
                ),
                **_prompt_manifest_contract(),
                "advancement_transition": {
                    "kind": "fp_dispatch",
                    "manifest_id": "manifest-carrier",
                    "dispatch_ref": "test.dispatch:carrier",
                    "result_path": str(
                        tmp_path / ".ai-workspace" / "fp_results" / "manifest-carrier.json"
                    ),
                },
            }
        ),
        encoding="utf-8",
    )

    def fail_resolve_policy_bundle(*args, **kwargs):
        raise AssertionError("carrier dispatch ref should make policy resolution unnecessary")

    def fake_dispatch(manifest, workspace, *, config=None, hook_config=None):
        assert manifest["manifest_id"] == "manifest-carrier"
        assert workspace == tmp_path
        assert hook_config is None
        return {"status": "ok", "call_id": manifest["call_id"], "events_emitted": 0}

    def fake_import_ref(ref):
        assert ref == "test.dispatch:carrier"
        return fake_dispatch

    monkeypatch.setattr(
        "genesis.policy.resolve_policy_bundle",
        fail_resolve_policy_bundle,
    )
    monkeypatch.setattr(
        "genesis.policy._import_ref",
        fake_import_ref,
    )

    summary = auto_dispatch_from_result(
        {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "manifest_id": "manifest-carrier",
            "run_id": "run-manifest-carrier",
            "call_id": "call-manifest-carrier",
            "edge": "design→code",
        },
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["call_id"] == "call-manifest-carrier"


def test_auto_dispatch_salvages_result_via_carrier_result_path_when_manifest_omits_it(
    tmp_path,
    monkeypatch,
):
    workspace_bootstrap(tmp_path)
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-carrier-path.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest_path = manifests_dir / "manifest-carrier-path.json"
    manifest_path.write_text(
        json.dumps(
            {
                "manifest_id": "manifest-carrier-path",
                "call_id": "call-manifest-carrier-path",
                "edge": "design→code",
                "run_id": "run-manifest-carrier-path",
                "work_key": "wk-manifest-carrier-path",
                "workflow_version": "wf-manifest-carrier-path",
                "graph_function_id": "gf-manifest-carrier-path",
                "materialization_id": "mat-manifest-carrier-path",
                "vector_id": "vec-manifest-carrier-path",
                "job_id": "job-manifest-carrier-path",
                "spec_hash": "spec-manifest-carrier-path",
                "resolved_policy": resolve_policy_bundle(),
                **_prompt_manifest_contract(),
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
                "advancement_transition": {
                    "kind": "fp_dispatch",
                    "manifest_id": "manifest-carrier-path",
                    "dispatch_ref": "test.dispatch:carrier",
                    "result_path": str(result_path),
                },
            }
        ),
        encoding="utf-8",
    )

    from genesis.policy import _import_ref as real_import_ref

    def selective_import_ref(ref):
        if ref == "test.dispatch:carrier":
            raise AssertionError(f"dispatch should not run when preserved result exists: {ref}")
        return real_import_ref(ref)

    monkeypatch.setattr("genesis.policy._import_ref", selective_import_ref)

    summary = auto_dispatch_from_result(
        {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "manifest_id": "manifest-carrier-path",
            "run_id": "run-manifest-carrier-path",
            "call_id": "call-manifest-carrier-path",
            "edge": "design→code",
            "advancement_transition": {
                "kind": "fp_dispatch",
                "manifest_id": "manifest-carrier-path",
                "dispatch_ref": "test.dispatch:carrier",
                "result_path": str(result_path),
            },
        },
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["salvage_mode"] == "idempotent_reentry"


def test_successful_ingest_resolves_preexisting_open_continuation(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-3.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    stream = EventStream.open(tmp_path)
    emit(
        "continuation_opened",
        {
            "continuation_id": "cont-open",
            "continuation_kind": "retry",
            "call_id": "call-manifest-3",
        },
        stream=stream,
        context=EventContext(
            run_id="run-3",
            aggregate_type="continuation",
            aggregate_id="cont-open",
        ),
    )
    manifest = {
        "manifest_id": "manifest-3",
        "call_id": "call-manifest-3",
        "edge": "design→code",
        "run_id": "run-3",
        "work_key": "wk-3",
        "workflow_version": "wf-3",
        "graph_function_id": "gf-3",
        "materialization_id": "mat-3",
        "vector_id": "vec-3",
        "job_id": "job-3",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(result_path),
        "spec_hash": "spec-3",
        "resolved_policy": resolve_policy_bundle(),
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    continuation = project(EventStream.open(tmp_path), "continuation", "cont-open")
    assert continuation["status"] == "resolved"


def test_ingest_post_transform_fd_findings_no_longer_stop_closure(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-fd-gap.json"
    result_path.write_text(
        json.dumps(
            _fp_result_payload(
                "design→code",
                obligation_id="code_traceability_present",
                fulfillment_detail="constructor attempted repair",
            )
        ),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-fd-gap",
        "call_id": "call-fd-gap",
        "edge": "design→code",
        "run_id": "run-fd-gap",
        "work_key": "wk-fd-gap",
        "workflow_version": "wf-fd-gap",
        "graph_function_id": "gf-fd-gap",
        "materialization_id": "mat-fd-gap",
        "vector_id": "vec-fd-gap",
        "job_id": "job-fd-gap",
        "prompt": "repair code",
        "result_path": str(result_path),
        "spec_hash": "spec-fd-gap",
        "resolved_policy": resolve_policy_bundle(),
        "delta_summary": "delta = 1 — 1 evaluator failing: code_traceability_present",
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_traceability_present", "constructor attempted repair")
        ),
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "ok"

    events = EventStream.open(tmp_path).all_events()
    assert [event["event_type"] for event in events] == [
        "assessed",
        "proof_passed",
        "closure_passed",
        "edge_converged",
        "graph_call_closed",
        "run_completed",
    ]
    graph_call = project(EventStream.open(tmp_path), "graph_call", "call-fd-gap")
    run = project(EventStream.open(tmp_path), "run", "run-fd-gap")
    assert graph_call["status"] == "closed"
    assert run["status"] == "completed"


def test_converged_ingest_resolves_preexisting_open_continuation(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-yield-resolve.json"
    result_path.write_text(
        json.dumps(
            _fp_result_payload(
                "design→code",
                obligation_id="code_traceability_present",
                fulfillment_detail="constructor attempted repair",
            )
        ),
        encoding="utf-8",
    )
    stream = EventStream.open(tmp_path)
    emit(
        "continuation_opened",
        {
            "continuation_id": "cont-stale",
            "continuation_kind": "retry",
            "call_id": "call-yield-resolve",
        },
        stream=stream,
        context=EventContext(
            run_id="run-yield-resolve",
            aggregate_type="continuation",
            aggregate_id="cont-stale",
            call_id="call-yield-resolve",
        ),
    )
    manifest = {
        "manifest_id": "manifest-yield-resolve",
        "call_id": "call-yield-resolve",
        "edge": "design→code",
        "run_id": "run-yield-resolve",
        "work_key": "wk-yield-resolve",
        "workflow_version": "wf-yield-resolve",
        "graph_function_id": "gf-yield-resolve",
        "materialization_id": "mat-yield-resolve",
        "vector_id": "vec-yield-resolve",
        "job_id": "job-yield-resolve",
        "prompt": "repair code",
        "result_path": str(result_path),
        "spec_hash": "spec-yield-resolve",
        "resolved_policy": resolve_policy_bundle(),
        "delta_summary": "delta = 1 — 1 evaluator failing: code_traceability_present",
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_traceability_present", "constructor attempted repair")
        ),
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "ok"
    events = EventStream.open(tmp_path).all_events()
    assert [event["event_type"] for event in events] == [
        "continuation_opened",
        "assessed",
        "proof_passed",
        "continuation_resolved",
        "closure_passed",
        "edge_converged",
        "graph_call_closed",
        "run_completed",
    ]
    stale = project(EventStream.open(tmp_path), "continuation", "cont-stale")
    assert stale["status"] == "resolved"


def test_ingest_no_longer_emits_fd_findings_after_carrier_convergence(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-taxonomy.json"
    result_path.write_text(
        json.dumps(
            _fp_result_payload(
                "design→code",
                obligation_id="code_traceability_present",
                fulfillment_detail="constructor attempted repair",
            )
        ),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-taxonomy",
        "call_id": "call-taxonomy",
        "edge": "design→code",
        "run_id": "run-taxonomy",
        "work_key": "wk-taxonomy",
        "workflow_version": "wf-taxonomy",
        "graph_function_id": "gf-taxonomy",
        "materialization_id": "mat-taxonomy",
        "vector_id": "vec-taxonomy",
        "job_id": "job-taxonomy",
        "prompt": "repair code",
        "result_path": str(result_path),
        "spec_hash": "spec-taxonomy",
        "resolved_policy": resolve_policy_bundle(),
        "delta_summary": "delta = 1 — 1 evaluator failing: code_traceability_present",
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_traceability_present", "constructor attempted repair")
        ),
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "ok"
    assert not any(
        event["event_type"] == "found"
        for event in EventStream.open(tmp_path).all_events()
    )


def test_ingest_target_binding_checks_no_longer_block_after_carrier_convergence(tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-target-binding.json"
    result_path.write_text(
        json.dumps(
            _fp_result_payload(
                "design→code",
                obligation_id="code_traceability_present",
                fulfillment_detail="constructor returned code",
            )
        ),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-target-binding",
        "call_id": "call-target-binding",
        "edge": "design→code",
        "run_id": "run-target-binding",
        "work_key": "wk-target-binding",
        "workflow_version": "wf-target-binding",
        "graph_function_id": "gf-target-binding",
        "materialization_id": "mat-target-binding",
        "vector_id": "vec-target-binding",
        "job_id": "job-target-binding",
        "prompt": "repair code",
        "result_path": str(result_path),
        "spec_hash": "spec-target-binding",
        "resolved_policy": resolve_policy_bundle(),
        "delta_summary": "delta = 1 — 1 evaluator failing: code_traceability_present",
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_traceability_present", "constructor returned code")
        ),
    }

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "ok"

    events = EventStream.open(tmp_path).all_events()
    assert [event["event_type"] for event in events] == [
        "assessed",
        "proof_passed",
        "closure_passed",
        "edge_converged",
        "graph_call_closed",
        "run_completed",
    ]


def test_run_projection_accepts_yielded_runtime_truth(tmp_path):
    stream = EventStream.open(tmp_path)

    emit(
        "run_started",
        {"edge": "design→code"},
        stream=stream,
        context=EventContext(
            workflow_version="wf-yield",
            work_key="wk-yield",
            run_id="run-yield",
            job_id="job-yield",
        ),
    )
    emit(
        "run_yielded",
        {
            "edge": "design→code",
            "continuation_id": "cont-yield",
            "handoff_kind": "observer_handoff",
            "handoff_reason": "fd_findings",
        },
        stream=stream,
        context=EventContext(
            workflow_version="wf-yield",
            work_key="wk-yield",
            run_id="run-yield",
            job_id="job-yield",
        ),
    )

    state = run_state(stream.all_events(), "run-yield")
    assert state is not None
    assert state.state == "yielded"

    projected = project(stream, "run", "run-yield")
    assert projected["status"] == "yielded"
    assert projected["job_id"] == "job-yield"


def test_run_start_until_converged_yields_without_immediate_redispatch(monkeypatch, tmp_path):
    gen_start_calls: list[int] = []

    def fake_gen_start(intent, stream):
        gen_start_calls.append(1)
        return {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "stop_predicate": "dispatch_required",
            "edge": "requirements→design",
            "fp_manifest_path": str(tmp_path / "manifest.json"),
        }

    def fake_auto_dispatch(result, workspace, *, config=None):
        return {
            "status": "yield",
            "stopped_by": "yield",
            "handoff_kind": "observer_handoff",
            "handoff_reason": "fd_findings",
            "continuation_id": "cont-yield",
        }

    monkeypatch.setattr(services, "gen_start", fake_gen_start)
    monkeypatch.setattr("genesis.dispatch_runtime.auto_dispatch_from_result", fake_auto_dispatch)

    result = cli_adapter._run_start_until_converged(
        services.StartIntent(scope=object(), target=services.StartTarget.next(), until="converged"),
        object(),
        workspace=tmp_path,
        config={"runtime_backend": "codex_cli"},
        fh_mode="direct",
    )

    assert gen_start_calls == [1]
    assert result["status"] == "yield"
    assert result["stopped_by"] == "yield"
    assert result["handoff_kind"] == "observer_handoff"
    assert result["handoff_reason"] == "fd_findings"


def test_dispatch_runtime_salvages_timed_out_transport_when_valid_result_exists(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-salvage.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="artifact already persisted")),
        encoding="utf-8",
    )
    manifest = {
        "manifest_id": "manifest-salvage",
        "call_id": "call-salvage",
        "edge": "design→code",
        "run_id": "run-salvage",
        "work_key": "wk-salvage",
        "workflow_version": "wf-salvage",
        "graph_function_id": "gf-salvage",
        "materialization_id": "mat-salvage",
        "vector_id": "vec-salvage",
        "job_id": "job-salvage",
        "prompt": "write code",
        **_prompt_manifest_contract(),
        "result_path": str(result_path),
        "spec_hash": "spec-salvage",
        "resolved_policy": resolve_policy_bundle(),
        "failing_evaluators": [{"name": "code_complete"}],
        "fulfillment_obligations": _fulfillment_obligations(
            ("code_complete", "code satisfies the design contract")
        ),
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None, **kwargs):
        return AgentResult(
            stdout="",
            stderr="timed out",
            returncode=-1,
            agent=agent,
            timed_out=True,
            failure_class="transport_failure",
        )

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent_supervised", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["salvage_mode"] == "transport_failure_preserved_artifact"
    event_types = [event["event_type"] for event in EventStream.open(tmp_path).all_events()]
    assert event_types == [
        "graph_call_opened",
        "worker_turn_started",
        "worker_turn_salvaged",
        "assessed",
        "proof_passed",
        "closure_passed",
        "edge_converged",
        "graph_call_closed",
        "run_completed",
    ]


def test_auto_dispatch_reuses_preserved_result_without_redispatch(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-reuse.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="already assessed")),
        encoding="utf-8",
    )
    manifest_path = manifests_dir / "manifest-reuse.json"
    manifest_path.write_text(
        json.dumps(
            {
                "manifest_id": "manifest-reuse",
                "call_id": "call-reuse",
                "edge": "design→code",
                "run_id": "run-reuse",
                "work_key": "wk-reuse",
                "workflow_version": "wf-reuse",
                "graph_function_id": "gf-reuse",
                "materialization_id": "mat-reuse",
                "vector_id": "vec-reuse",
                "job_id": "job-reuse",
                "prompt": "write code",
                **_prompt_manifest_contract(),
                "result_path": str(result_path),
                "spec_hash": "spec-reuse",
                "failing_evaluators": [{"name": "code_complete"}],
                "resolved_policy": resolve_policy_bundle(),
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
            }
        ),
        encoding="utf-8",
    )

    def fail_dispatch(*args, **kwargs):
        raise AssertionError("redispatch should not occur when a valid preserved result exists")

    monkeypatch.setattr(
        "genesis.dispatch_runtime.dispatch_bound_manifest_via_supervised_transport",
        fail_dispatch,
    )

    summary = auto_dispatch_from_result(
        {
            "status": "pending",
            "blocking_reason": "fp_dispatch",
            "manifest_id": "manifest-reuse",
            "run_id": "run-reuse",
            "call_id": "call-reuse",
            "edge": "design→code",
        },
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["salvage_mode"] == "idempotent_reentry"


def test_live_run_status_reports_active_edge_and_artifact_state(tmp_path):
    workspace_bootstrap(tmp_path)
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    manifest_id = "manifest-status"
    manifest_path = manifests_dir / f"{manifest_id}.json"
    result_path = results_dir / f"{manifest_id}.json"
    result_path.write_text(
        json.dumps(_fp_result_payload("design→code", fulfillment_detail="ok")),
        encoding="utf-8",
    )
    manifest_path.write_text(
        json.dumps(
            {
                "manifest_id": manifest_id,
                "call_id": "call-status",
                "edge": "design→code",
                "run_id": "run-status",
                "result_path": str(result_path),
                "failing_evaluators": [{"name": "code_complete"}],
                "fulfillment_obligations": _fulfillment_obligations(
                    ("code_complete", "code satisfies the design contract")
                ),
                "resolved_policy": {
                    "dispatch": {
                        "ref": "genesis.dispatch_runtime:dispatch_bound_manifest_via_supervised_transport",
                        "config": {"timeout": 300, "mode": "supervised"},
                    }
                },
            }
        ),
        encoding="utf-8",
    )
    stream = EventStream.open(tmp_path)
    emit(
        "run_started",
        {"edge": "design→code"},
        stream=stream,
        context=EventContext(run_id="run-status", work_key="wk-status"),
    )
    emit(
        "graph_call_opened",
        {"call_id": "call-status", "edge": "design→code", "manifest_id": manifest_id},
        stream=stream,
        context=EventContext(run_id="run-status", aggregate_type="graph_call", aggregate_id="call-status"),
    )
    emit(
        "worker_turn_started",
        {"call_id": "call-status", "edge": "design→code", "dispatch_mode": "supervised"},
        stream=stream,
        context=EventContext(run_id="run-status", aggregate_type="graph_call", aggregate_id="call-status"),
    )

    status = project_live_run_status(tmp_path, run_id="run-status")

    assert status["live_state"] == "active"
    assert status["active_edge"] == "design→code"
    assert status["active_call_id"] == "call-status"
    assert status["dispatch_mode"] == "supervised"
    assert status["result_artifact_valid"] is True


def test_live_run_status_resolves_published_ledger_from_assessed_event_pointer(tmp_path):
    workspace_bootstrap(tmp_path)
    manifest_id = "manifest-ledger-pointer"
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    (manifests_dir / f"{manifest_id}.json").write_text(
        json.dumps(
            {
                "manifest_id": manifest_id,
                "workflow_version": "wf-pointer",
                "spec_hash": "spec-pointer",
                "result_path": str(tmp_path / "missing-result.json"),
            }
        ),
        encoding="utf-8",
    )

    custom_ledger = published_fulfillment_ledger_path(tmp_path, manifest_id)
    custom_ledger.parent.mkdir(parents=True, exist_ok=True)
    custom_ledger.write_text(
        json.dumps(
            {
                "manifest_id": manifest_id,
                "edge": "design→code",
                "spec_hash": "spec-pointer",
                "workflow_version": "wf-pointer",
                "admission_required": False,
                "admitted": True,
                "carry_converged": True,
                "fulfillment_converged": True,
                "edge_converged": True,
                "obligations": [
                    {
                        "id": "req-pointer",
                        "evaluator": "code_complete",
                        "fulfillment_status": "fulfilled",
                    }
                ],
            }
        ),
        encoding="utf-8",
    )

    stream = EventStream.open(tmp_path)
    emit(
        "run_started",
        {"edge": "design→code"},
        stream=stream,
        context=EventContext(run_id="run-pointer", work_key="wk-pointer"),
    )
    emit(
        "graph_call_opened",
        {"call_id": "call-pointer", "edge": "design→code", "manifest_id": manifest_id},
        stream=stream,
        context=EventContext(run_id="run-pointer", aggregate_type="graph_call", aggregate_id="call-pointer"),
    )
    emit(
        "assessed",
        {
            "kind": "fp",
            "edge": "design→code",
            "obligation_id": "req-pointer",
            "spec_hash": "spec-pointer",
            "workflow_version": "wf-pointer",
            "manifest_id": manifest_id,
            "published_ledger_ref": make_published_fulfillment_ledger_ref(
                manifest_id=manifest_id
            ),
        },
        stream=stream,
        context=EventContext(
            run_id="run-pointer",
            work_key="wk-pointer",
            aggregate_type="graph_call",
            aggregate_id="call-pointer",
        ),
    )

    status = project_live_run_status(tmp_path, run_id="run-pointer")

    assert status["published_fulfillment_ledger_ref"] == make_published_fulfillment_ledger_ref(
        manifest_id=manifest_id
    )
    assert status["published_fulfillment_admitted"] is True
    assert status["published_fulfillment_edge_converged"] is True


def test_live_run_status_projects_and_clears_proof_hold_via_reset(tmp_path):
    workspace_bootstrap(tmp_path)
    manifest_id = "manifest-proof-hold-status"
    manifests_dir = tmp_path / ".ai-workspace" / "fp_manifests"
    manifests_dir.mkdir(parents=True, exist_ok=True)
    (manifests_dir / f"{manifest_id}.json").write_text(
        json.dumps(
            {
                "manifest_id": manifest_id,
                "edge": "design→code",
                "run_id": "run-proof-hold-status",
                "spec_hash": "spec-proof-hold-status",
                "workflow_version": "wf-proof-hold-status",
                "resolved_policy": {
                    "proof": {
                        "ref": "genesis.policy_defaults:proof_recheck_after_fp",
                        "config": {"proof_hold": {"failure_threshold": 2}},
                    }
                },
            }
        ),
        encoding="utf-8",
    )

    stream = EventStream.open(tmp_path)
    emit(
        "run_started",
        {"edge": "design→code"},
        stream=stream,
        context=EventContext(
            workflow_version="wf-proof-hold-status",
            run_id="run-proof-hold-status",
        ),
    )
    emit(
        "graph_call_opened",
        {"call_id": "call-proof-hold-status", "edge": "design→code", "manifest_id": manifest_id},
        stream=stream,
        context=EventContext(
            workflow_version="wf-proof-hold-status",
            run_id="run-proof-hold-status",
            aggregate_type="graph_call",
            aggregate_id="call-proof-hold-status",
        ),
    )
    for idx in range(2):
        emit(
            "proof_failed",
            {
                "edge": "design→code",
                "spec_hash": "spec-proof-hold-status",
                "policy_reason": f"proof_incomplete_{idx}",
            },
            stream=stream,
            context=EventContext(
                workflow_version="wf-proof-hold-status",
                run_id="run-proof-hold-status",
                aggregate_type="run",
                aggregate_id="run-proof-hold-status",
            ),
        )

    status = project_live_run_status(
        tmp_path,
        run_id="run-proof-hold-status",
    )

    assert status["proof_hold_active"] is True
    assert status["proof_hold"]["failure_count"] == 2
    assert status["proof_hold"]["policy_source"] == "resolved_policy.proof.config.proof_hold"

    emit(
        "reset",
        {"scope": "workspace", "actor": "tester", "reason": "clear proof hold"},
        stream=stream,
        context=EventContext(workflow_version="wf-proof-hold-status"),
    )

    cleared = project_live_run_status(
        tmp_path,
        run_id="run-proof-hold-status",
    )

    assert cleared["proof_hold_active"] is False
    assert cleared["proof_hold"]["failure_count"] == 0
    assert cleared["proof_hold"]["last_clear"]["kind"] == "reset"


def test_dispatch_agent_supervised_pty_observes_terminal_progress_and_artifact(monkeypatch, tmp_path):
    script_path = tmp_path / "fake_terminal_agent.py"
    script_path.write_text(
        "\n".join(
            [
                "from pathlib import Path",
                "import json",
                "import sys",
                "import time",
                "result_path = Path(sys.argv[1])",
                "print('agent-start', flush=True)",
                "time.sleep(0.05)",
                "result_path.write_text(json.dumps({",
                "    'edge': 'design→code',",
                "    'actor': 'claude',",
                "    'fulfillment_assessments': [{'id': 'code_complete', 'fulfillment_status': 'fulfilled', 'fulfillment_detail': 'ok', 'blocking_reasons': [], 'evidence_refs': ['ok']}],",
                "}), encoding='utf-8')",
                "print('agent-finished', flush=True)",
                "time.sleep(0.05)",
            ]
        ),
        encoding="utf-8",
    )
    result_path = tmp_path / "terminal-result.json"
    manifest = {
        "edge": "design→code",
        "failing_evaluators": [{"name": "code_complete"}],
    }
    progress_events: list[str] = []

    def fake_contract(agent, *, config=None, work_folder=None):
        return AgentCliContract(
            command=sys.executable,
            args_template=(str(script_path), "{prompt}"),
            terminal_mode="pty",
        )

    monkeypatch.setattr("genesis.transport._resolve_agent_contract", fake_contract)

    result = dispatch_agent_supervised(
        str(result_path),
        str(tmp_path),
        agent="claude",
        result_path=str(result_path),
        payload_validator=lambda payload: isinstance(payload, dict),
        manifest=manifest,
        progress_callback=lambda data: progress_events.append(str(data.get("event_type"))),
    )

    assert result.timed_out is False
    assert result.artifact_observed_live is True
    assert result.supervision_mode == "supervised_terminal"
    assert "worker_turn_progress" in progress_events
    assert "result_artifact_observed" in progress_events


def test_dispatch_agent_supervised_pty_ignores_progress_callback_exceptions(monkeypatch, tmp_path):
    script_path = tmp_path / "fake_terminal_agent_exn.py"
    script_path.write_text(
        "\n".join(
            [
                "from pathlib import Path",
                "import json",
                "import sys",
                "result_path = Path(sys.argv[1])",
                "print('agent-start', flush=True)",
                "result_path.write_text(json.dumps({",
                "    'edge': 'design→code',",
                "    'actor': 'claude',",
                "    'fulfillment_assessments': [{'id': 'code_complete', 'fulfillment_status': 'fulfilled', 'fulfillment_detail': 'ok', 'blocking_reasons': [], 'evidence_refs': ['ok']}],",
                "}), encoding='utf-8')",
            ]
        ),
        encoding="utf-8",
    )
    result_path = tmp_path / "terminal-callback-result.json"
    manifest = {
        "edge": "design→code",
        "failing_evaluators": [{"name": "code_complete"}],
    }

    def fake_contract(agent, *, config=None, work_folder=None):
        return AgentCliContract(
            command=sys.executable,
            args_template=(str(script_path), "{prompt}"),
            terminal_mode="pty",
        )

    def bad_callback(data):
        raise RuntimeError(f"unexpected progress callback payload: {data!r}")

    monkeypatch.setattr("genesis.transport._resolve_agent_contract", fake_contract)

    result = dispatch_agent_supervised(
        str(result_path),
        str(tmp_path),
        agent="claude",
        result_path=str(result_path),
        payload_validator=lambda payload: isinstance(payload, dict),
        manifest=manifest,
        progress_callback=bad_callback,
    )

    assert result.timed_out is False
    assert result.artifact_observed_live is True
    assert result.supervision_mode == "supervised_terminal"


def test_reset_emits_supersession_truth_for_active_run_scope(tmp_path):
    stream = EventStream.open(tmp_path)

    emit(
        "run_started",
        {"edge": "design→code", "run_id": "run-old", "work_key": "wk-reset"},
        stream=stream,
    )
    emit(
        "continuation_opened",
        {
            "continuation_id": "cont-reset",
            "continuation_kind": "retry",
            "call_id": "call-old",
        },
        stream=stream,
        context=EventContext(
            work_key="wk-reset",
            run_id="run-old",
            aggregate_type="continuation",
            aggregate_id="cont-reset",
            call_id="call-old",
        ),
    )

    emit(
        "reset",
        {
            "scope": "work_key",
            "work_key": "wk-reset",
            "actor": "tester",
            "reason": "restart corrected execution",
        },
        stream=stream,
    )

    events = stream.all_events()
    assert [event["event_type"] for event in events] == [
        "run_started",
        "continuation_opened",
        "reset",
        "continuation_superseded",
        "run_superseded",
    ]

    continuation = project(stream, "continuation", "cont-reset")
    assert continuation["status"] == "superseded"

    run = project(stream, "run", "run-old")
    assert run["status"] == "superseded"
    assert run["superseded_by"].startswith("reset:")


def test_reset_emits_abandonment_truth_for_open_continuation_after_terminal_run(tmp_path):
    stream = EventStream.open(tmp_path)

    emit(
        "run_failed",
        {
            "edge": "design→code",
            "run_id": "run-terminal",
            "work_key": "wk-terminal",
            "failure_class": "proof_failure",
        },
        stream=stream,
    )
    emit(
        "continuation_opened",
        {
            "continuation_id": "cont-terminal",
            "continuation_kind": "repair",
            "call_id": "call-terminal",
        },
        stream=stream,
        context=EventContext(
            work_key="wk-terminal",
            run_id="run-terminal",
            aggregate_type="continuation",
            aggregate_id="cont-terminal",
            call_id="call-terminal",
        ),
    )

    emit(
        "reset",
        {
            "scope": "work_key",
            "work_key": "wk-terminal",
            "actor": "tester",
            "reason": "discard stale repair obligation",
        },
        stream=stream,
    )

    events = stream.all_events()
    assert [event["event_type"] for event in events] == [
        "run_failed",
        "continuation_opened",
        "reset",
        "continuation_abandoned",
    ]

    continuation = project(stream, "continuation", "cont-terminal")
    assert continuation["status"] == "abandoned"
