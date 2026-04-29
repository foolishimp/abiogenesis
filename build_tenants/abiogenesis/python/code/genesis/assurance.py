# Implements: REQ-R-ABG3-ASSURANCE
# Implements: REQ-R-ABG3-EVENTS
# Implements: REQ-R-ABG3-PROJECTION
# Implements: REQ-R-ABG3-CONVERGENCE
"""assurance — total ambiguity projection and closure fold.

This module is the Python tenant realization of the ABG total assurance
carrier. It is intentionally independent of downstream product semantics:
authority snapshots and evidence rows are inputs, ambiguity rows are projected,
and closure is a fold over projected rows.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, is_dataclass
from typing import Any, Literal, Mapping, TypeAlias


AssuranceAmbiguityStatus: TypeAlias = Literal[
    "fulfilled",
    "partial",
    "missing",
    "stale_input",
    "authority_missing",
    "orphan_evidence",
    "contradictory_authority",
    "contradictory_evidence",
    "deferred",
    "event_ledger_invalid",
]

ASSURANCE_AMBIGUITY_STATUS_VALUES: tuple[AssuranceAmbiguityStatus, ...] = (
    "fulfilled",
    "partial",
    "missing",
    "stale_input",
    "authority_missing",
    "orphan_evidence",
    "contradictory_authority",
    "contradictory_evidence",
    "deferred",
    "event_ledger_invalid",
)

AssuranceClosureDecisionKind: TypeAlias = Literal[
    "close",
    "retry",
    "reprice",
    "block",
    "qualified_defer",
]

ASSURANCE_CLOSURE_DECISION_KIND_VALUES: tuple[AssuranceClosureDecisionKind, ...] = (
    "close",
    "retry",
    "reprice",
    "block",
    "qualified_defer",
)


@dataclass(frozen=True)
class AssuranceScopeRef:
    basis_id: str
    graph_function_id: str
    graph_call_id: str
    frame_id: str
    vector_index: int
    edge: str
    continuation_id: str | None = None
    kind: Literal["assurance_scope_ref"] = "assurance_scope_ref"


@dataclass(frozen=True)
class AssuranceAuthoritySnapshot:
    scope: AssuranceScopeRef
    authority_refs: tuple[str, ...]
    input_refs: tuple[str, ...]
    authority_digest: str
    input_digest: str
    closure_capable: bool = True
    contradictory_authority: bool = False
    deferred_authority_refs: tuple[str, ...] = ()
    provider_refs: tuple[str, ...] = ()
    policy_refs: tuple[str, ...] = ()
    kind: Literal["assurance_authority_snapshot"] = "assurance_authority_snapshot"


@dataclass(frozen=True)
class AssuranceEvidenceRow:
    evidence_ref: str
    scope: AssuranceScopeRef
    authority_ref: str | None
    authority_digest: str | None
    input_digest: str | None
    event_refs: tuple[str, ...] = ()
    provider_refs: tuple[str, ...] = ()
    policy_refs: tuple[str, ...] = ()
    bound_to_scope: bool = True
    complete: bool = True
    shallow: bool = False
    contradicts_authority: bool = False
    deferred: bool = False
    kind: Literal["assurance_evidence_row"] = "assurance_evidence_row"


@dataclass(frozen=True)
class AssuranceAmbiguityRow:
    row_id: str
    status: AssuranceAmbiguityStatus
    scope: AssuranceScopeRef
    authority_ref: str | None
    evidence_refs: tuple[str, ...]
    authority_digest: str
    input_digest: str
    event_refs: tuple[str, ...]
    provider_refs: tuple[str, ...]
    policy_refs: tuple[str, ...]
    reason: str
    kind: Literal["assurance_ambiguity_row"] = "assurance_ambiguity_row"


@dataclass(frozen=True)
class PriorClosureSnapshotRef:
    authority_digest: str
    input_digest: str
    projection_ref: str


@dataclass(frozen=True)
class AssuranceProjection:
    scope: AssuranceScopeRef
    authority_snapshot: AssuranceAuthoritySnapshot
    evidence_rows: tuple[AssuranceEvidenceRow, ...]
    ambiguity_rows: tuple[AssuranceAmbiguityRow, ...]
    source_projection_ref: str
    projection_ref: str
    kind: Literal["assurance_projection"] = "assurance_projection"


@dataclass(frozen=True)
class AssuranceClosureDecision:
    decision: AssuranceClosureDecisionKind
    scope: AssuranceScopeRef
    projection_ref: str
    blocking_statuses: tuple[AssuranceAmbiguityStatus, ...]
    row_ids: tuple[str, ...]
    reason: str
    kind: Literal["assurance_closure_decision"] = "assurance_closure_decision"


@dataclass(frozen=True)
class AssuranceReportReadModel:
    projection_ref: str
    closure_decision: AssuranceClosureDecisionKind
    row_statuses: tuple[AssuranceAmbiguityStatus, ...]
    row_ids: tuple[str, ...]
    kind: Literal["assurance_report_read_model"] = "assurance_report_read_model"


FORBIDDEN_ASSURANCE_PROVIDER_FIELDS = frozenset(
    {
        "runtime_events",
        "events",
        "next_vector_index",
        "closed_vector_indexes",
        "transition",
        "closure_kind",
        "closure_decision",
        "decision",
        "may_close_traversal",
        "may_emit_runtime_events",
        "may_select_next_vector",
    }
)


def _require_non_empty(value: str, label: str) -> str:
    if not isinstance(value, str) or value == "":
        raise TypeError(f"{label} must be a non-empty string")
    return value


def _strings(values: tuple[str, ...] | list[str], label: str) -> tuple[str, ...]:
    normalized = tuple(values)
    for index, value in enumerate(normalized):
        _require_non_empty(value, f"{label}[{index}]")
    return tuple(sorted(normalized))


def _nullable_string(value: str | None, label: str) -> str | None:
    if value is None:
        return None
    return _require_non_empty(value, label)


def construct_assurance_scope_ref(
    *,
    basis_id: str,
    graph_function_id: str,
    graph_call_id: str,
    frame_id: str,
    vector_index: int,
    edge: str,
    continuation_id: str | None = None,
) -> AssuranceScopeRef:
    if vector_index < 0:
        raise TypeError("AssuranceScopeRef.vector_index must be non-negative")
    return AssuranceScopeRef(
        basis_id=_require_non_empty(basis_id, "AssuranceScopeRef.basis_id"),
        graph_function_id=_require_non_empty(
            graph_function_id,
            "AssuranceScopeRef.graph_function_id",
        ),
        graph_call_id=_require_non_empty(
            graph_call_id,
            "AssuranceScopeRef.graph_call_id",
        ),
        frame_id=_require_non_empty(frame_id, "AssuranceScopeRef.frame_id"),
        vector_index=vector_index,
        edge=_require_non_empty(edge, "AssuranceScopeRef.edge"),
        continuation_id=_nullable_string(
            continuation_id,
            "AssuranceScopeRef.continuation_id",
        ),
    )


def construct_assurance_authority_snapshot(
    *,
    scope: AssuranceScopeRef,
    authority_refs: tuple[str, ...] | list[str],
    input_refs: tuple[str, ...] | list[str] = (),
    authority_digest: str,
    input_digest: str,
    closure_capable: bool = True,
    contradictory_authority: bool = False,
    deferred_authority_refs: tuple[str, ...] | list[str] = (),
    provider_refs: tuple[str, ...] | list[str] = (),
    policy_refs: tuple[str, ...] | list[str] = (),
) -> AssuranceAuthoritySnapshot:
    return AssuranceAuthoritySnapshot(
        scope=scope,
        authority_refs=_strings(authority_refs, "AssuranceAuthoritySnapshot.authority_refs"),
        input_refs=_strings(input_refs, "AssuranceAuthoritySnapshot.input_refs"),
        authority_digest=_require_non_empty(
            authority_digest,
            "AssuranceAuthoritySnapshot.authority_digest",
        ),
        input_digest=_require_non_empty(
            input_digest,
            "AssuranceAuthoritySnapshot.input_digest",
        ),
        closure_capable=closure_capable,
        contradictory_authority=contradictory_authority,
        deferred_authority_refs=_strings(
            deferred_authority_refs,
            "AssuranceAuthoritySnapshot.deferred_authority_refs",
        ),
        provider_refs=_strings(provider_refs, "AssuranceAuthoritySnapshot.provider_refs"),
        policy_refs=_strings(policy_refs, "AssuranceAuthoritySnapshot.policy_refs"),
    )


def construct_assurance_evidence_row(
    *,
    evidence_ref: str,
    scope: AssuranceScopeRef,
    authority_ref: str | None = None,
    authority_digest: str | None = None,
    input_digest: str | None = None,
    event_refs: tuple[str, ...] | list[str] = (),
    provider_refs: tuple[str, ...] | list[str] = (),
    policy_refs: tuple[str, ...] | list[str] = (),
    bound_to_scope: bool = True,
    complete: bool = True,
    shallow: bool = False,
    contradicts_authority: bool = False,
    deferred: bool = False,
) -> AssuranceEvidenceRow:
    return AssuranceEvidenceRow(
        evidence_ref=_require_non_empty(evidence_ref, "AssuranceEvidenceRow.evidence_ref"),
        scope=scope,
        authority_ref=_nullable_string(authority_ref, "AssuranceEvidenceRow.authority_ref"),
        authority_digest=_nullable_string(
            authority_digest,
            "AssuranceEvidenceRow.authority_digest",
        ),
        input_digest=_nullable_string(input_digest, "AssuranceEvidenceRow.input_digest"),
        event_refs=_strings(event_refs, "AssuranceEvidenceRow.event_refs"),
        provider_refs=_strings(provider_refs, "AssuranceEvidenceRow.provider_refs"),
        policy_refs=_strings(policy_refs, "AssuranceEvidenceRow.policy_refs"),
        bound_to_scope=bound_to_scope,
        complete=complete,
        shallow=shallow,
        contradicts_authority=contradicts_authority,
        deferred=deferred,
    )


def _same_scope(left: AssuranceScopeRef, right: AssuranceScopeRef) -> bool:
    return left == right


def _row_id(
    scope: AssuranceScopeRef,
    status: AssuranceAmbiguityStatus,
    authority_ref: str | None,
    evidence_refs: tuple[str, ...],
    serial: str,
) -> str:
    return ":".join(
        [
            "assurance-row",
            scope.basis_id,
            scope.graph_call_id,
            scope.frame_id,
            str(scope.vector_index),
            status,
            authority_ref or "none",
            ",".join(evidence_refs) or serial,
        ]
    )


def _construct_ambiguity_row(
    *,
    status: AssuranceAmbiguityStatus,
    scope: AssuranceScopeRef,
    authority_ref: str | None,
    authority_digest: str,
    input_digest: str,
    reason: str,
    serial: str,
    evidence_refs: tuple[str, ...] | list[str] = (),
    event_refs: tuple[str, ...] | list[str] = (),
    provider_refs: tuple[str, ...] | list[str] = (),
    policy_refs: tuple[str, ...] | list[str] = (),
) -> AssuranceAmbiguityRow:
    normalized_evidence_refs = _strings(evidence_refs, "AssuranceAmbiguityRow.evidence_refs")
    return AssuranceAmbiguityRow(
        row_id=_row_id(scope, status, authority_ref, normalized_evidence_refs, serial),
        status=status,
        scope=scope,
        authority_ref=authority_ref,
        evidence_refs=normalized_evidence_refs,
        authority_digest=_require_non_empty(
            authority_digest,
            "AssuranceAmbiguityRow.authority_digest",
        ),
        input_digest=_require_non_empty(input_digest, "AssuranceAmbiguityRow.input_digest"),
        event_refs=_strings(event_refs, "AssuranceAmbiguityRow.event_refs"),
        provider_refs=_strings(provider_refs, "AssuranceAmbiguityRow.provider_refs"),
        policy_refs=_strings(policy_refs, "AssuranceAmbiguityRow.policy_refs"),
        reason=_require_non_empty(reason, "AssuranceAmbiguityRow.reason"),
    )


def _is_current_fulfillment_evidence(
    snapshot: AssuranceAuthoritySnapshot,
    evidence: AssuranceEvidenceRow,
) -> bool:
    return (
        evidence.bound_to_scope
        and evidence.complete
        and not evidence.shallow
        and not evidence.contradicts_authority
        and not evidence.deferred
        and (evidence.authority_digest is None or evidence.authority_digest == snapshot.authority_digest)
        and (evidence.input_digest is None or evidence.input_digest == snapshot.input_digest)
    )


def assurance_projection_ref(
    scope: AssuranceScopeRef,
    authority_snapshot: AssuranceAuthoritySnapshot,
    ambiguity_rows: tuple[AssuranceAmbiguityRow, ...],
) -> str:
    statuses = ",".join(row.status for row in ambiguity_rows)
    return ":".join(
        [
            "assurance_projection",
            scope.basis_id,
            scope.graph_call_id,
            scope.frame_id,
            str(scope.vector_index),
            authority_snapshot.authority_digest,
            authority_snapshot.input_digest,
            statuses,
        ]
    )


def derive_assurance_projection(
    *,
    authority_snapshot: AssuranceAuthoritySnapshot,
    evidence_rows: tuple[AssuranceEvidenceRow, ...] | list[AssuranceEvidenceRow] = (),
    event_ledger_valid: bool = True,
    prior_closure_snapshot: PriorClosureSnapshotRef | None = None,
    source_projection_ref: str = "runtime_projection://unspecified",
) -> AssuranceProjection:
    scope = authority_snapshot.scope
    snapshot = authority_snapshot
    evidence = tuple(evidence_rows)
    authority_refs = set(snapshot.authority_refs)
    deferred_refs = set(snapshot.deferred_authority_refs)
    rows: list[AssuranceAmbiguityRow] = []

    if not event_ledger_valid:
        rows.append(
            _construct_ambiguity_row(
                status="event_ledger_invalid",
                scope=scope,
                authority_ref=None,
                authority_digest=snapshot.authority_digest,
                input_digest=snapshot.input_digest,
                provider_refs=snapshot.provider_refs,
                policy_refs=snapshot.policy_refs,
                reason="event_ledger_invalid",
                serial="event-ledger",
            )
        )

    if snapshot.closure_capable and not snapshot.authority_refs:
        rows.append(
            _construct_ambiguity_row(
                status="authority_missing",
                scope=scope,
                authority_ref=None,
                authority_digest=snapshot.authority_digest,
                input_digest=snapshot.input_digest,
                provider_refs=snapshot.provider_refs,
                policy_refs=snapshot.policy_refs,
                reason="closure_capable_scope_has_no_current_authority",
                serial="authority-missing",
            )
        )

    if snapshot.contradictory_authority:
        refs: tuple[str | None, ...] = snapshot.authority_refs or (None,)
        for authority_ref in refs:
            rows.append(
                _construct_ambiguity_row(
                    status="contradictory_authority",
                    scope=scope,
                    authority_ref=authority_ref,
                    authority_digest=snapshot.authority_digest,
                    input_digest=snapshot.input_digest,
                    provider_refs=snapshot.provider_refs,
                    policy_refs=snapshot.policy_refs,
                    reason="current_authority_conflicts",
                    serial=authority_ref or "contradictory-authority",
                )
            )

    if prior_closure_snapshot is not None and (
        prior_closure_snapshot.authority_digest != snapshot.authority_digest
        or prior_closure_snapshot.input_digest != snapshot.input_digest
    ):
        rows.append(
            _construct_ambiguity_row(
                status="stale_input",
                scope=scope,
                authority_ref=None,
                evidence_refs=(prior_closure_snapshot.projection_ref,),
                authority_digest=snapshot.authority_digest,
                input_digest=snapshot.input_digest,
                provider_refs=snapshot.provider_refs,
                policy_refs=snapshot.policy_refs,
                reason="prior_closure_projection_digest_is_stale",
                serial="stale-input",
            )
        )

    for row in evidence:
        if (
            not row.bound_to_scope
            or not _same_scope(row.scope, scope)
            or row.authority_ref is None
            or row.authority_ref not in authority_refs
        ):
            rows.append(
                _construct_ambiguity_row(
                    status="orphan_evidence",
                    scope=scope,
                    authority_ref=row.authority_ref,
                    evidence_refs=(row.evidence_ref,),
                    authority_digest=snapshot.authority_digest,
                    input_digest=snapshot.input_digest,
                    event_refs=row.event_refs,
                    provider_refs=row.provider_refs,
                    policy_refs=row.policy_refs,
                    reason="evidence_has_no_current_scope_authority_binding",
                    serial=row.evidence_ref,
                )
            )

    for authority_ref in snapshot.authority_refs:
        matching = tuple(
            row
            for row in evidence
            if row.bound_to_scope
            and _same_scope(row.scope, scope)
            and row.authority_ref == authority_ref
        )
        if authority_ref in deferred_refs:
            rows.append(
                _construct_ambiguity_row(
                    status="deferred",
                    scope=scope,
                    authority_ref=authority_ref,
                    evidence_refs=tuple(row.evidence_ref for row in matching),
                    authority_digest=snapshot.authority_digest,
                    input_digest=snapshot.input_digest,
                    provider_refs=snapshot.provider_refs,
                    policy_refs=snapshot.policy_refs,
                    reason="authority_is_lawfully_deferred_by_policy",
                    serial=authority_ref,
                )
            )
            continue
        if not matching:
            rows.append(
                _construct_ambiguity_row(
                    status="missing",
                    scope=scope,
                    authority_ref=authority_ref,
                    authority_digest=snapshot.authority_digest,
                    input_digest=snapshot.input_digest,
                    provider_refs=snapshot.provider_refs,
                    policy_refs=snapshot.policy_refs,
                    reason="required_authority_bound_evidence_is_missing",
                    serial=authority_ref,
                )
            )
            continue
        if any(row.contradicts_authority for row in matching):
            rows.append(
                _construct_ambiguity_row(
                    status="contradictory_evidence",
                    scope=scope,
                    authority_ref=authority_ref,
                    evidence_refs=tuple(row.evidence_ref for row in matching),
                    authority_digest=snapshot.authority_digest,
                    input_digest=snapshot.input_digest,
                    event_refs=tuple(ref for row in matching for ref in row.event_refs),
                    provider_refs=snapshot.provider_refs,
                    policy_refs=snapshot.policy_refs,
                    reason="admitted_evidence_conflicts_with_current_authority",
                    serial=authority_ref,
                )
            )
            continue
        if any(_is_current_fulfillment_evidence(snapshot, row) for row in matching):
            rows.append(
                _construct_ambiguity_row(
                    status="fulfilled",
                    scope=scope,
                    authority_ref=authority_ref,
                    evidence_refs=tuple(row.evidence_ref for row in matching),
                    authority_digest=snapshot.authority_digest,
                    input_digest=snapshot.input_digest,
                    event_refs=tuple(ref for row in matching for ref in row.event_refs),
                    provider_refs=snapshot.provider_refs,
                    policy_refs=snapshot.policy_refs,
                    reason="current_evidence_fulfills_authority",
                    serial=authority_ref,
                )
            )
            continue
        rows.append(
            _construct_ambiguity_row(
                status="partial",
                scope=scope,
                authority_ref=authority_ref,
                evidence_refs=tuple(row.evidence_ref for row in matching),
                authority_digest=snapshot.authority_digest,
                input_digest=snapshot.input_digest,
                event_refs=tuple(ref for row in matching for ref in row.event_refs),
                provider_refs=snapshot.provider_refs,
                policy_refs=snapshot.policy_refs,
                reason="evidence_is_shallow_incomplete_unbound_or_stale",
                serial=authority_ref,
            )
        )

    ambiguity_rows = tuple(rows)
    projection_ref = assurance_projection_ref(scope, snapshot, ambiguity_rows)
    return AssuranceProjection(
        scope=scope,
        authority_snapshot=snapshot,
        evidence_rows=evidence,
        ambiguity_rows=ambiguity_rows,
        source_projection_ref=_require_non_empty(
            source_projection_ref,
            "AssuranceProjection.source_projection_ref",
        ),
        projection_ref=projection_ref,
    )


def _status_rows(
    projection: AssuranceProjection,
    status: AssuranceAmbiguityStatus,
) -> tuple[AssuranceAmbiguityRow, ...]:
    return tuple(row for row in projection.ambiguity_rows if row.status == status)


def _unique_statuses(rows: tuple[AssuranceAmbiguityRow, ...]) -> tuple[AssuranceAmbiguityStatus, ...]:
    return tuple(sorted({row.status for row in rows}))


def _decision(
    projection: AssuranceProjection,
    decision: AssuranceClosureDecisionKind,
    reason: str,
    rows: tuple[AssuranceAmbiguityRow, ...],
) -> AssuranceClosureDecision:
    return AssuranceClosureDecision(
        decision=decision,
        scope=projection.scope,
        projection_ref=projection.projection_ref,
        blocking_statuses=_unique_statuses(rows),
        row_ids=tuple(sorted(row.row_id for row in rows)),
        reason=_require_non_empty(reason, "AssuranceClosureDecision.reason"),
    )


def derive_assurance_closure_decision(
    projection: AssuranceProjection,
) -> AssuranceClosureDecision:
    priority: tuple[
        tuple[AssuranceAmbiguityStatus, AssuranceClosureDecisionKind, str],
        ...,
    ] = (
        ("event_ledger_invalid", "block", "event_ledger_invalid_blocks_assurance"),
        ("contradictory_authority", "reprice", "contradictory_authority_requires_reprice"),
        ("stale_input", "retry", "stale_input_invalidates_prior_closure"),
        ("authority_missing", "reprice", "missing_authority_requires_reprice"),
        ("contradictory_evidence", "block", "contradictory_evidence_blocks_assurance"),
        ("orphan_evidence", "block", "orphan_evidence_cannot_satisfy_authority"),
    )
    for status, decision_kind, reason in priority:
        rows = _status_rows(projection, status)
        if rows:
            return _decision(projection, decision_kind, reason, rows)

    incomplete_rows = tuple(
        row for row in projection.ambiguity_rows if row.status in {"partial", "missing"}
    )
    if incomplete_rows:
        return _decision(
            projection,
            "retry",
            "partial_or_missing_evidence_requires_retry_or_repair",
            incomplete_rows,
        )

    deferred_rows = _status_rows(projection, "deferred")
    required_non_closing = tuple(
        row for row in projection.ambiguity_rows if row.status not in {"fulfilled", "deferred"}
    )
    if deferred_rows and not required_non_closing:
        return _decision(
            projection,
            "qualified_defer",
            "all_unfulfilled_rows_are_lawfully_deferred",
            deferred_rows,
        )

    fulfilled_rows = _status_rows(projection, "fulfilled")
    if fulfilled_rows and len(fulfilled_rows) == len(projection.ambiguity_rows):
        return _decision(
            projection,
            "close",
            "all_required_rows_are_fulfilled",
            (),
        )

    return _decision(
        projection,
        "block",
        "assurance_projection_has_no_closing_rows",
        projection.ambiguity_rows,
    )


def derive_assurance_report_read_model(
    *,
    projection: AssuranceProjection,
    decision: AssuranceClosureDecision,
) -> AssuranceReportReadModel:
    if decision.projection_ref != projection.projection_ref:
        raise TypeError("Assurance report requires decision for projection")
    return AssuranceReportReadModel(
        projection_ref=projection.projection_ref,
        closure_decision=decision.decision,
        row_statuses=_unique_statuses(projection.ambiguity_rows),
        row_ids=tuple(sorted(row.row_id for row in projection.ambiguity_rows)),
    )


def admit_assurance_provider_output(
    output: Mapping[str, Any] | object,
    label: str = "AssuranceProviderOutput",
) -> dict[str, Any]:
    if is_dataclass(output):
        payload = asdict(output)
    elif isinstance(output, Mapping):
        payload = dict(output)
    else:
        raise TypeError(f"{label} must be a mapping or dataclass carrier")
    for field in FORBIDDEN_ASSURANCE_PROVIDER_FIELDS:
        if field in payload:
            raise TypeError(
                f"{label}.{field}: assurance provider output cannot own engine authority"
            )
    return payload
