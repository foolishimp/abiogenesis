# Validates: REQ-R-ABG3-EVENTS, REQ-R-ABG3-PROJECTION, REQ-R-ABG3-RUN, REQ-R-ABG3-GRAPHCALL, REQ-R-ABG3-CONTINUATION
from __future__ import annotations

from genesis.events import EventContext, EventStream, emit
from genesis.projection import project
from genesis.run import run_state


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
