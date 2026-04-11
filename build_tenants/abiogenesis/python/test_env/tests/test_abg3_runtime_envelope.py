# Validates: REQ-R-ABG3-EVENTS, REQ-R-ABG3-PROJECTION, REQ-R-ABG3-RUN, REQ-R-ABG3-GRAPHCALL, REQ-R-ABG3-FRAME, REQ-R-ABG3-CONTINUATION, REQ-R-ABG3-RETRY
from __future__ import annotations

import json

from genesis.dispatch_runtime import auto_dispatch_from_result, dispatch_bound_manifest_via_transport
from genesis.events import EventContext, EventStream, emit
from genesis.install import workspace_bootstrap
from genesis.projection import project
from genesis.result_ingest import ingest_fp_result
from genesis.run import run_state
from genesis.transport import AgentResult


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
        "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-1.json"),
        "spec_hash": "spec-1",
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None):
        return AgentResult(stdout="", stderr="boom", returncode=1, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "error"
    assert summary["failure_class"] == "transport_failure"

    stream = EventStream.open(tmp_path)
    event_types = [event["event_type"] for event in stream.all_events()]
    assert event_types == [
        "graph_call_opened",
        "worker_turn_started",
        "worker_turn_failed",
        "graph_call_failed",
        "continuation_opened",
        "run_failed",
    ]

    graph_call = project(stream, "graph_call", "call-manifest-1")
    assert graph_call["status"] == "failed"
    assert graph_call["failure_class"] == "transport_failure"

    continuation = project(stream, "continuation", summary["continuation_id"])
    assert continuation["status"] == "open"
    assert continuation["continuation_kind"] == "retry"
    assert continuation["run_id"] == "run-1"

    run = project(stream, "run", "run-1")
    assert run["status"] == "failed"
    assert run["failure_class"] == "transport_failure"


def test_dispatch_runtime_forwards_local_transport_contract_config(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-forward.json"
    result_path.write_text(
        json.dumps(
            {
                "edge": "design→code",
                "actor": "codex",
                "assessments": [
                    {
                        "evaluator": "code_complete",
                        "result": "pass",
                        "evidence": "ok",
                    }
                ],
            }
        ),
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
        "result_path": str(result_path),
        "spec_hash": "spec-forward",
    }
    forwarded: dict[str, object] = {}

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None):
        forwarded["agent"] = agent
        forwarded["timeout"] = timeout
        forwarded["config"] = config
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent", fake_dispatch_agent)

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


def test_dispatch_runtime_ingests_result_and_closes_graph_call(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-2.json"
    result_path.write_text(
        json.dumps(
            {
                "edge": "design→code",
                "actor": "codex",
                "assessments": [
                    {
                        "evaluator": "code_complete",
                        "result": "pass",
                        "evidence": "ok",
                    }
                ],
            }
        ),
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
        "result_path": str(result_path),
        "spec_hash": "spec-2",
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None):
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["call_id"] == "call-manifest-2"
    assert summary["events_emitted"] == 5

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
                "result_path": str(tmp_path / ".ai-workspace" / "fp_results" / "manifest-derive.json"),
            }
        ),
        encoding="utf-8",
    )

    def fake_dispatch(manifest, workspace, *, config=None, hook_config=None):
        assert manifest["manifest_id"] == "manifest-derive"
        assert workspace == tmp_path
        return {"status": "ok", "call_id": manifest["call_id"], "events_emitted": 0}

    monkeypatch.setattr(
        "genesis.dispatch_runtime.dispatch_bound_manifest_via_transport",
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


def test_successful_ingest_resolves_preexisting_open_continuation(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-3.json"
    result_path.write_text(
        json.dumps(
            {
                "edge": "design→code",
                "actor": "codex",
                "assessments": [
                    {
                        "evaluator": "code_complete",
                        "result": "pass",
                        "evidence": "ok",
                    }
                ],
            }
        ),
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
        "result_path": str(result_path),
        "spec_hash": "spec-3",
    }

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300, config=None):
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    continuation = project(EventStream.open(tmp_path), "continuation", "cont-open")
    assert continuation["status"] == "resolved"


def test_ingest_fd_gap_after_fp_returns_pending_not_runtime_failure(monkeypatch, tmp_path):
    workspace_bootstrap(tmp_path)
    results_dir = tmp_path / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / "manifest-fd-gap.json"
    result_path.write_text(
        json.dumps(
            {
                "edge": "design→code",
                "actor": "codex",
                "assessments": [
                    {
                        "evaluator": "code_traceability_present",
                        "result": "pass",
                        "evidence": "constructor attempted repair",
                    }
                ],
            }
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
        "delta_summary": "delta = 1 — 1 evaluator failing: code_traceability_present",
    }

    monkeypatch.setattr(
        "genesis.result_ingest._rerun_manifest_fd_failures",
        lambda workspace, manifest, work_key=None: {
            "passed": False,
            "failures": [{"name": "code_traceability_present"}],
        },
    )
    monkeypatch.setattr(
        "genesis.result_ingest._target_binding_materialization",
        lambda workspace, manifest: {"passed": True, "reason": "resolved"},
    )

    summary = ingest_fp_result(result_path, tmp_path, manifest_data=manifest)

    assert summary["status"] == "pending"
    assert summary["blocking_reason"] == "fd_gap"
    assert summary["stopped_by"] == "fd_gap"

    events = EventStream.open(tmp_path).all_events()
    assert [event["event_type"] for event in events] == [
        "assessed",
        "proof_passed",
        "closure_failed",
        "found",
        "graph_call_failed",
        "run_completed",
    ]
    found = events[-1]
    assert events[3]["data"]["kind"] == "fd_gap"
    assert events[3]["data"]["failing"] == ["code_traceability_present"]
    assert events[4]["data"]["failure_class"] == "certification_failure"
    graph_call = project(EventStream.open(tmp_path), "graph_call", "call-fd-gap")
    run = project(EventStream.open(tmp_path), "run", "run-fd-gap")
    assert graph_call["status"] == "failed"
    assert graph_call["failure_class"] == "certification_failure"
    assert run["status"] == "completed"


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
