# Validates: REQ-R-ABG3-EVENTS, REQ-R-ABG3-PROJECTION, REQ-R-ABG3-RUN, REQ-R-ABG3-GRAPHCALL, REQ-R-ABG3-FRAME, REQ-R-ABG3-CONTINUATION
from __future__ import annotations

import json

from genesis.dispatch_runtime import dispatch_bound_manifest_via_transport
from genesis.events import EventContext, EventStream, emit
from genesis.projection import project
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

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300):
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


def test_dispatch_runtime_ingests_result_and_closes_graph_call(monkeypatch, tmp_path):
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

    def fake_dispatch_agent(prompt, work_folder, *, agent="claude", timeout=300):
        return AgentResult(stdout="ok", stderr="", returncode=0, agent=agent)

    monkeypatch.setattr("genesis.dispatch_runtime.dispatch_agent", fake_dispatch_agent)

    summary = dispatch_bound_manifest_via_transport(
        manifest,
        tmp_path,
        config={"runtime_backend": "codex_cli"},
    )

    assert summary["status"] == "ok"
    assert summary["call_id"] == "call-manifest-2"
    assert summary["events_emitted"] == 1

    stream = EventStream.open(tmp_path)
    event_types = [event["event_type"] for event in stream.all_events()]
    assert event_types == [
        "graph_call_opened",
        "worker_turn_started",
        "worker_turn_completed",
        "assessed",
        "graph_call_closed",
    ]

    graph_call = project(stream, "graph_call", "call-manifest-2")
    assert graph_call["status"] == "closed"
    assert graph_call["graph_function_id"] == "gf-2"

    run = project(stream, "run", "run-2")
    assert run["status"] == "assessed_pass"
