# Validates: REQ-R-ABG3-ASSURANCE
# Validates: REQ-R-ABG3-EVENTS
# Validates: REQ-R-ABG3-PROJECTION
# Validates: REQ-R-ABG3-CONVERGENCE
# Validates: T-091
# Validates: T-092-PY
from __future__ import annotations

import pytest

from genesis.assurance import (
    PriorClosureSnapshotRef,
    admit_assurance_provider_output,
    construct_assurance_authority_snapshot,
    construct_assurance_evidence_row,
    construct_assurance_scope_ref,
    derive_assurance_closure_decision,
    derive_assurance_projection,
    derive_assurance_report_read_model,
)


def scope():
    return construct_assurance_scope_ref(
        basis_id="basis://py-assurance",
        graph_function_id="graph-function://py-assurance",
        graph_call_id="graph-call://py-assurance",
        frame_id="frame://py-assurance",
        vector_index=0,
        edge="input->requirements",
    )


def snapshot(scope_ref, **overrides):
    return construct_assurance_authority_snapshot(
        scope=scope_ref,
        authority_refs=overrides.get("authority_refs", ("req://assurance/a",)),
        input_refs=overrides.get("input_refs", ("input://current",)),
        authority_digest=overrides.get("authority_digest", "authority-digest-current"),
        input_digest=overrides.get("input_digest", "input-digest-current"),
        closure_capable=overrides.get("closure_capable", True),
        contradictory_authority=overrides.get("contradictory_authority", False),
        deferred_authority_refs=overrides.get("deferred_authority_refs", ()),
        provider_refs=("provider://authority",),
        policy_refs=("policy://assurance",),
    )


def evidence(scope_ref, **overrides):
    authority_ref = overrides.get("authority_ref", "req://assurance/a")
    return construct_assurance_evidence_row(
        scope=scope_ref,
        evidence_ref=overrides.get("evidence_ref", "evidence://current"),
        authority_ref=authority_ref,
        authority_digest=overrides.get("authority_digest", "authority-digest-current"),
        input_digest=overrides.get("input_digest", "input-digest-current"),
        event_refs=overrides.get("event_refs", ("event://evidence",)),
        provider_refs=("provider://evidence",),
        policy_refs=("policy://assurance",),
        bound_to_scope=overrides.get("bound_to_scope", True),
        complete=overrides.get("complete", True),
        shallow=overrides.get("shallow", False),
        contradicts_authority=overrides.get("contradicts_authority", False),
        deferred=overrides.get("deferred", False),
    )


def derive(**kwargs):
    projection = derive_assurance_projection(**kwargs)
    decision = derive_assurance_closure_decision(projection)
    return projection, decision, {row.status for row in projection.ambiguity_rows}


@pytest.mark.parametrize(
    ("name", "expected_status", "expected_decision", "build"),
    [
        (
            "fulfilled",
            "fulfilled",
            "close",
            lambda: (snapshot(scope()), (evidence(scope()),), {}),
        ),
        (
            "partial",
            "partial",
            "retry",
            lambda: (snapshot(scope()), (evidence(scope(), shallow=True),), {}),
        ),
        (
            "missing",
            "missing",
            "retry",
            lambda: (snapshot(scope()), (), {}),
        ),
        (
            "stale_input",
            "stale_input",
            "retry",
            lambda: (
                snapshot(scope()),
                (evidence(scope()),),
                {
                    "prior_closure_snapshot": PriorClosureSnapshotRef(
                        authority_digest="authority-digest-old",
                        input_digest="input-digest-current",
                        projection_ref="assurance_projection://old",
                    )
                },
            ),
        ),
        (
            "authority_missing",
            "authority_missing",
            "reprice",
            lambda: (snapshot(scope(), authority_refs=()), (), {}),
        ),
        (
            "orphan_evidence",
            "orphan_evidence",
            "block",
            lambda: (snapshot(scope()), (evidence(scope(), authority_ref=None),), {}),
        ),
        (
            "contradictory_authority",
            "contradictory_authority",
            "reprice",
            lambda: (snapshot(scope(), contradictory_authority=True), (), {}),
        ),
        (
            "contradictory_evidence",
            "contradictory_evidence",
            "block",
            lambda: (
                snapshot(scope()),
                (evidence(scope(), contradicts_authority=True),),
                {},
            ),
        ),
        (
            "deferred",
            "deferred",
            "qualified_defer",
            lambda: (
                snapshot(scope(), deferred_authority_refs=("req://assurance/a",)),
                (),
                {},
            ),
        ),
        (
            "event_ledger_invalid",
            "event_ledger_invalid",
            "block",
            lambda: (snapshot(scope()), (), {"event_ledger_valid": False}),
        ),
    ],
)
def test_t092_py_assurance_projection_emits_total_status_matrix(
    name,
    expected_status,
    expected_decision,
    build,
):
    authority_snapshot, evidence_rows, extra = build()

    projection, decision, statuses = derive(
        authority_snapshot=authority_snapshot,
        evidence_rows=evidence_rows,
        **extra,
    )

    assert expected_status in statuses, name
    assert decision.decision == expected_decision
    assert projection.projection_ref


def test_t092_py_stale_input_beats_fulfilled_evidence():
    scope_ref = scope()

    projection, decision, statuses = derive(
        authority_snapshot=snapshot(scope_ref),
        evidence_rows=(evidence(scope_ref),),
        prior_closure_snapshot=PriorClosureSnapshotRef(
            authority_digest="authority-digest-old",
            input_digest="input-digest-old",
            projection_ref="assurance_projection://old",
        ),
    )

    assert "fulfilled" in statuses
    assert "stale_input" in statuses
    assert decision.decision == "retry"
    assert projection.projection_ref


def test_t092_py_superseded_closure_register_is_evidence_only():
    scope_ref = scope()

    _, decision, statuses = derive(
        authority_snapshot=snapshot(scope_ref),
        evidence_rows=(),
        prior_closure_snapshot=PriorClosureSnapshotRef(
            authority_digest="authority-digest-current",
            input_digest="input-digest-current",
            projection_ref="assurance_projection://old",
        ),
    )

    assert statuses == {"missing"}
    assert decision.decision == "retry"


def test_t092_py_assurance_provider_output_cannot_smuggle_engine_authority():
    with pytest.raises(TypeError, match="cannot own engine authority"):
        admit_assurance_provider_output(
            {
                "evidence_ref": "evidence://a",
                "may_close_traversal": True,
            },
            "ProviderOutput",
        )


def test_t092_py_projection_is_deterministic_and_reports_are_read_models():
    scope_ref = scope()
    input_payload = {
        "authority_snapshot": snapshot(scope_ref),
        "evidence_rows": (evidence(scope_ref),),
        "source_projection_ref": "runtime_projection://current",
    }

    first = derive_assurance_projection(**input_payload)
    second = derive_assurance_projection(**input_payload)
    first_decision = derive_assurance_closure_decision(first)
    second_decision = derive_assurance_closure_decision(second)
    report = derive_assurance_report_read_model(
        projection=first,
        decision=first_decision,
    )

    assert first == second
    assert first_decision == second_decision
    assert report.projection_ref == first.projection_ref
    assert report.closure_decision == "close"
    assert report.row_statuses == ("fulfilled",)
