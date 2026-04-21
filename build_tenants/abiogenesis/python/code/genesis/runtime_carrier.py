# Implements: REQ-R-ABG3-INTERPRET, REQ-R-ABG3-EVENTS, REQ-R-ABG3-CONVERGENCE
"""
runtime_carrier — typed upstream runtime carriers for ABG advancement.

`ExecutionBasis` is the immutable admitted basis for one advancement attempt.
`AdvancementTransition` is the closed transition family interpreted over that
basis.

This module is the upstream publication for `B-027`. It names the carrier
family that replaces controller-owned runtime law and carries the planning
algebra consumed by the public start/iterate bindings.
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal, Mapping, TypeAlias

from gtl.operator_model import Evaluator, F_D, F_H, F_P

from .convergence import convergence_from_precomputed
from .binding import (
    BoundJob,
    PrecomputedManifest,
    ExecutableJob,
    TargetAssetBinding,
    declared_fulfillment_obligations_for_job,
    declared_obligation_ledger_policy_for_job,
)
from .identity import RuntimeIdentity
from .policy import ResolvedPolicy, admit_resolved_policy, resolved_policy_payload

if TYPE_CHECKING:
    from .services import StartIntent


TerminalKind: TypeAlias = Literal[
    "converged",
    "nothing_to_do",
    "gap_stop",
    "yielded",
    "dispatch_required",
    "human_gate_required",
    "traversal_applied",
]

BlockingReason: TypeAlias = Literal["fp_dispatch", "fh_gate", "fd_gap"]


@dataclass(frozen=True)
class ExecutionBasis:
    """Immutable admitted basis for one advancement attempt."""

    workspace_root: Path
    runtime_identity: RuntimeIdentity
    workflow_version: str
    executable_job: ExecutableJob | None = None
    start_intent: StartIntent | None = None
    run_id: str | None = None
    work_key: str | None = None
    frame_id: str | None = None
    frame_lineage_id: str | None = None
    resolved_policy_bundle_ref: str | None = None


@dataclass(frozen=True)
class FdAdvanceTransition:
    """Deterministic/runtime-preparation step over one admitted basis."""

    basis: ExecutionBasis
    status: Literal["ready"]
    precomputed: PrecomputedManifest | None = None
    kind: Literal["fd_advance"] = "fd_advance"


@dataclass(frozen=True)
class FpDispatchRequiredTransition:
    """Carrier-visible requirement to open governed F_P dispatch next."""

    basis: ExecutionBasis
    dispatch_ref: str | None = None
    kind: Literal["fp_dispatch_required"] = "fp_dispatch_required"


@dataclass(frozen=True)
class FpDispatchTransition:
    """Governed probabilistic dispatch step over one admitted basis."""

    basis: ExecutionBasis
    manifest_id: str
    dispatch_ref: str | None = None
    result_path: str | None = None
    kind: Literal["fp_dispatch"] = "fp_dispatch"


@dataclass(frozen=True)
class FpDispatchPublicationPlan:
    manifest_path: Path
    result_updates: dict[str, Any]
    manifest_payload: dict[str, Any]


@dataclass(frozen=True)
class IterationAdvanceDecision:
    basis: ExecutionBasis
    resolved_policy: ResolvedPolicy
    failures: RegimeFailures
    pre_transition: AdvancementTransition
    blocking_reason: BlockingReason | None


@dataclass(frozen=True)
class IterationDispatchPlan:
    binding_request: DispatchBindingRequest
    dispatch_transition: FpDispatchTransition | None


@dataclass(frozen=True)
class IterationOutcomePlan:
    result: dict[str, Any]
    transition: AdvancementTransition
    metadata: dict[str, Any]


@dataclass(frozen=True)
class FhEscalationTransition:
    """Human-admission step over one admitted basis."""

    basis: ExecutionBasis
    approval_subject_ref: str
    gate_reason: str
    kind: Literal["fh_escalation"] = "fh_escalation"


@dataclass(frozen=True)
class TerminalTransition:
    """Replay-visible terminal or projection step over one admitted basis."""

    basis: ExecutionBasis
    terminal_kind: TerminalKind
    reason: str | None = None
    kind: Literal["terminal"] = "terminal"


AdvancementTransition: TypeAlias = (
    FdAdvanceTransition
    | FpDispatchRequiredTransition
    | FpDispatchTransition
    | FhEscalationTransition
    | TerminalTransition
)


@dataclass(frozen=True)
class RegimeFailures:
    fd: tuple[Evaluator, ...]
    fp: tuple[Evaluator, ...]
    fh: tuple[Evaluator, ...]


@dataclass(frozen=True)
class DispatchBindingRequest:
    pre: PrecomputedManifest
    executable_job: ExecutableJob
    result_path: str
    workspace_root: Path
    asset_bindings: Mapping[str, TargetAssetBinding] | None
    manifest_id: str
    worker_id: str
    role_id: str | None
    authority_ref: str | None
    runtime_identity: RuntimeIdentity


def regime_failures(pre: PrecomputedManifest) -> RegimeFailures:
    failures = pre.regime_binding_truth().failures()
    return RegimeFailures(
        fd=failures.fd,
        fp=failures.fp,
        fh=failures.fh,
    )


def execution_basis_for_runtime(
    runtime: Any,
    *,
    frame_id: str | None = None,
    frame_lineage_id: str | None = None,
) -> ExecutionBasis:
    resolved_policy_bundle_ref = None
    runtime_policy = getattr(runtime, "resolved_policy", None)
    if isinstance(runtime_policy, ResolvedPolicy):
        resolved_policy_bundle_ref = runtime_policy.resolved_policy_bundle_ref
    elif isinstance(runtime_policy, Mapping):
        bundle_ref = runtime_policy.get("resolved_policy_bundle_ref")
        if isinstance(bundle_ref, str) and bundle_ref:
            resolved_policy_bundle_ref = bundle_ref
    return ExecutionBasis(
        workspace_root=runtime.workspace_root,
        executable_job=runtime.executable_job,
        runtime_identity=runtime.runtime_identity,
        workflow_version=runtime.workflow_version,
        run_id=runtime.run_id,
        work_key=runtime.work_key,
        frame_id=frame_id,
        frame_lineage_id=frame_lineage_id,
        resolved_policy_bundle_ref=resolved_policy_bundle_ref,
    )


def dispatch_ref_from_resolved_policy(
    resolved_policy: ResolvedPolicy | Mapping[str, Any] | None,
) -> str | None:
    if isinstance(resolved_policy, ResolvedPolicy):
        return resolved_policy.dispatch.ref or None
    if not isinstance(resolved_policy, Mapping):
        return None
    dispatch = resolved_policy.get("dispatch")
    if not isinstance(dispatch, Mapping):
        return None
    ref = dispatch.get("ref")
    if isinstance(ref, str) and ref:
        return ref
    return None


def fp_dispatch_transition(
    basis: ExecutionBasis,
    *,
    resolved_policy: ResolvedPolicy | Mapping[str, Any] | None,
    manifest_id: str,
    result_path: str | None = None,
) -> FpDispatchTransition:
    return FpDispatchTransition(
        basis=basis,
        manifest_id=manifest_id,
        dispatch_ref=dispatch_ref_from_resolved_policy(resolved_policy),
        result_path=result_path,
    )


def dispatch_transition_for_requirement(
    decision: IterationAdvanceDecision,
    *,
    manifest_id: str,
    result_path: str | None = None,
) -> FpDispatchTransition | None:
    if not isinstance(decision.pre_transition, FpDispatchRequiredTransition):
        return None
    return fp_dispatch_transition(
        decision.basis,
        resolved_policy=decision.resolved_policy,
        manifest_id=manifest_id,
        result_path=result_path,
    )


def iteration_advance_decision(
    *,
    basis: ExecutionBasis,
    pre: PrecomputedManifest,
    resolved_policy: ResolvedPolicy | Mapping[str, Any],
) -> IterationAdvanceDecision:
    admitted_policy = admit_resolved_policy(resolved_policy)
    if admitted_policy.resolved_policy_bundle_ref:
        basis = replace(
            basis,
            resolved_policy_bundle_ref=admitted_policy.resolved_policy_bundle_ref,
        )
    failures = regime_failures(pre)
    pre_transition = advance_transition_for_precomputed(
        basis,
        pre,
        resolved_policy=admitted_policy,
    )
    return IterationAdvanceDecision(
        basis=basis,
        resolved_policy=admitted_policy,
        failures=failures,
        pre_transition=pre_transition,
        blocking_reason=blocking_reason_for_transition(pre_transition),
    )


def iteration_advance_decision_with_basis(
    decision: IterationAdvanceDecision,
    basis: ExecutionBasis,
) -> IterationAdvanceDecision:
    if basis.resolved_policy_bundle_ref is None:
        bundle_ref = decision.resolved_policy.resolved_policy_bundle_ref
        if bundle_ref:
            basis = replace(basis, resolved_policy_bundle_ref=bundle_ref)
    return IterationAdvanceDecision(
        basis=basis,
        resolved_policy=decision.resolved_policy,
        failures=decision.failures,
        pre_transition=replace(decision.pre_transition, basis=basis),
        blocking_reason=decision.blocking_reason,
    )


def iteration_dispatch_plan(
    *,
    decision: IterationAdvanceDecision,
    pre: PrecomputedManifest,
    executable_job: ExecutableJob,
    workspace_root: Path,
    asset_bindings: Mapping[str, TargetAssetBinding] | None,
    manifest_id: str,
    result_path: str | None,
    worker_id: str,
    role_id: str | None,
    authority_ref: str | None,
    runtime_identity: RuntimeIdentity,
) -> IterationDispatchPlan:
    dispatch_transition = dispatch_transition_for_requirement(
        decision,
        manifest_id=manifest_id,
        result_path=result_path,
    )
    binding_request = DispatchBindingRequest(
        pre=pre,
        executable_job=executable_job,
        result_path=result_path or "",
        workspace_root=workspace_root,
        asset_bindings=asset_bindings,
        manifest_id=manifest_id,
        worker_id=worker_id,
        role_id=role_id,
        authority_ref=authority_ref,
        runtime_identity=runtime_identity,
    )
    return IterationDispatchPlan(
        binding_request=binding_request,
        dispatch_transition=dispatch_transition,
    )


def fp_dispatch_publication_plan(
    *,
    workspace_root: Path,
    transition: FpDispatchTransition,
    executable_job: ExecutableJob,
    pre: PrecomputedManifest,
    bound_job: BoundJob,
    resolved_policy: ResolvedPolicy | Mapping[str, Any],
    workflow_version: str,
    spec_hash: str,
    requirements: list[Any] | tuple[Any, ...],
    run_id: str,
    call_id: str,
    work_key: str | None,
    worker_id: str,
    role_id: str | None,
    authority_ref: str | None,
    graph_call_terminal_on_result: bool,
) -> FpDispatchPublicationPlan:
    result_path = transition.result_path or bound_job.result_path
    if not result_path:
        raise RuntimeError("fp dispatch publication requires a concrete result path")

    manifest_path = (
        workspace_root / ".ai-workspace" / "fp_manifests" / f"{transition.manifest_id}.json"
    )
    declared_obligation_policy = declared_obligation_ledger_policy_for_job(executable_job)

    src = executable_job.vector.source
    if isinstance(src, tuple):
        source_asset = [asset.name for asset in src]
        source_markov = {asset.name: asset.markov for asset in src}
    else:
        source_asset = src.name
        source_markov = {src.name: src.markov}

    contexts = []
    for ctx in executable_job.vector.contexts:
        ctx_entry: dict[str, Any] = {
            "name": ctx.name,
            "locator": ctx.locator,
            "digest": ctx.digest,
        }
        if ctx.name in pre.relevant_contexts:
            ctx_entry["content"] = pre.relevant_contexts[ctx.name]
        contexts.append(ctx_entry)

    manifest_payload: dict[str, Any] = {
        "manifest_id": transition.manifest_id,
        "call_id": call_id,
        "edge": executable_job.vector.name,
        "vector_id": executable_job.vector.id,
        "job_id": executable_job.job.id,
        "graph_function_id": (
            executable_job.graph_function.id if executable_job.graph_function is not None else ""
        ),
        "materialization_id": executable_job.materialization_id or "",
        "source_asset": source_asset,
        "target_asset": executable_job.vector.target.name,
        "source_markov": source_markov,
        "target_markov": executable_job.vector.target.markov,
        "failing_evaluators": [
            {
                "name": ev.name,
                "regime": ev.regime.__name__,
                "description": ev.description,
            }
            for ev in pre.failing_evaluators
        ],
        "fulfillment_obligations": declared_fulfillment_obligations_for_job(
            executable_job,
            workspace_root=workspace_root,
        ),
        "obligation_ledger_policy": declared_obligation_policy,
        "fd_failures": [
            {
                "name": ev.name,
                "binding": ev.binding,
                "description": ev.description,
            }
            for ev in regime_failures(pre).fd
        ],
        "fd_results": pre.fd_results,
        "delta": pre.delta,
        "unresolved_count": pre.unresolved_count,
        "delta_summary": pre.delta_summary,
        "contexts": contexts,
        "current_asset": pre.current_asset,
        "prompt": bound_job.prompt,
        "result_path": result_path,
        "target_asset_binding": bound_job.target_asset_binding,
        "environment_asset_bindings": bound_job.environment_asset_bindings,
        "target_asset_surface": bound_job.target_asset_surface,
        "environment_asset_surfaces": bound_job.environment_asset_surfaces,
        "runtime_environment_contract": bound_job.runtime_environment_contract,
        "spec_hash": spec_hash,
        "requirements": requirements,
        "workflow_version": workflow_version,
        "run_id": run_id,
        "worker_id": worker_id,
        "resolved_policy_bundle_ref": admit_resolved_policy(
            resolved_policy
        ).resolved_policy_bundle_ref,
        "resolved_policy": resolved_policy_payload(resolved_policy),
        "graph_call_terminal_on_result": graph_call_terminal_on_result,
        "execution_basis": execution_basis_payload(transition.basis),
        "advancement_transition": advancement_transition_payload(transition),
    }
    if work_key is not None:
        manifest_payload["work_key"] = work_key
    if role_id:
        manifest_payload["role_id"] = role_id
    if authority_ref:
        manifest_payload["authority_ref"] = authority_ref

    return FpDispatchPublicationPlan(
        manifest_path=manifest_path,
        result_updates={
            "fp_manifest_path": str(manifest_path),
            "manifest_id": transition.manifest_id,
            "fp_result_path": result_path,
        },
        manifest_payload=manifest_payload,
    )


def iterated_result_payload(
    *,
    executable_job: ExecutableJob,
    pre: PrecomputedManifest,
    bound_job: BoundJob,
    surface_artifacts: list[str] | tuple[str, ...],
    context_consumed_names: list[str],
    work_key: str | None,
    spec_hash: str,
    workflow_version: str,
    run_id: str,
    call_id: str,
    blocking_reason: BlockingReason | None,
    fh_failing: tuple[Evaluator, ...],
    pre_transition: AdvancementTransition,
    publication_plan: FpDispatchPublicationPlan | None = None,
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "status": "iterated",
        "edge": executable_job.vector.name,
        "work_key": work_key,
        "spec_hash": spec_hash,
        "workflow_version": workflow_version,
        "delta_before": pre.delta,
        "failing_evaluators": [ev.name for ev in pre.failing_evaluators],
        "surface_artifacts": list(surface_artifacts),
        "context_consumed": context_consumed_names,
        "prompt_words": len(bound_job.prompt.split()),
        "run_id": run_id,
        "call_id": call_id,
    }
    if blocking_reason is not None:
        result["blocking_reason"] = blocking_reason
    if publication_plan is not None:
        result.update(publication_plan.result_updates)
    if isinstance(pre_transition, FhEscalationTransition):
        result["fh_gate"] = {
            "edge": executable_job.vector.name,
            "evaluators": [ev.name for ev in fh_failing],
            "criteria": [ev.description for ev in fh_failing],
        }
    return result


def outcome_transition_for_iteration(
    *,
    basis: ExecutionBasis,
    pre_transition: AdvancementTransition,
    dispatch_transition: FpDispatchTransition | None,
    result: Mapping[str, Any],
) -> AdvancementTransition:
    if dispatch_transition is not None:
        return dispatch_transition
    if isinstance(pre_transition, FhEscalationTransition | TerminalTransition):
        return pre_transition
    return TerminalTransition(
        basis=basis,
        terminal_kind="traversal_applied",
        reason=str(result.get("reason") or result.get("status") or ""),
    )


def iteration_outcome_plan(
    *,
    basis: ExecutionBasis,
    pre_transition: AdvancementTransition,
    dispatch_transition: FpDispatchTransition | None,
    outer_surface_metadata: Mapping[str, Any],
    iter_surface_metadata: Mapping[str, Any],
    executable_job: ExecutableJob,
    pre: PrecomputedManifest,
    bound_job: BoundJob,
    surface_artifacts: list[str] | tuple[str, ...],
    context_consumed_names: list[str],
    work_key: str | None,
    spec_hash: str,
    workflow_version: str,
    run_id: str,
    call_id: str,
    blocking_reason: BlockingReason | None,
    fh_failing: tuple[Evaluator, ...],
    publication_plan: FpDispatchPublicationPlan | None,
    events_emitted: int,
) -> IterationOutcomePlan:
    result = iterated_result_payload(
        executable_job=executable_job,
        pre=pre,
        bound_job=bound_job,
        surface_artifacts=surface_artifacts,
        context_consumed_names=context_consumed_names,
        work_key=work_key,
        spec_hash=spec_hash,
        workflow_version=workflow_version,
        run_id=run_id,
        call_id=call_id,
        blocking_reason=blocking_reason,
        fh_failing=fh_failing,
        pre_transition=pre_transition,
        publication_plan=publication_plan,
    )
    result["events_emitted"] = events_emitted

    metadata = dict(iter_surface_metadata)
    metadata.update(outer_surface_metadata)
    metadata["traversal_outcome"] = {
        "status": result["status"],
        "run_id": run_id,
    }
    if blocking_reason is not None:
        metadata["traversal_outcome"]["blocking_reason"] = blocking_reason

    transition = outcome_transition_for_iteration(
        basis=basis,
        pre_transition=pre_transition,
        dispatch_transition=dispatch_transition,
        result=result,
    )
    attach_runtime_carrier_metadata(result, basis, transition)
    return IterationOutcomePlan(
        result=result,
        transition=transition,
        metadata=metadata,
    )


def advance_transition_for_precomputed(
    basis: ExecutionBasis,
    pre: PrecomputedManifest,
    *,
    resolved_policy: ResolvedPolicy | Mapping[str, Any] | None = None,
) -> AdvancementTransition:
    failures = regime_failures(pre)
    if failures.fh:
        return FhEscalationTransition(
            basis=basis,
            approval_subject_ref=(
                basis.executable_job.vector.name if basis.executable_job is not None else ""
            ),
            gate_reason="fh_gate",
        )
    if failures.fd:
        admitted_policy = (
            admit_resolved_policy(resolved_policy)
            if resolved_policy is not None
            else None
        )
        conv = convergence_from_precomputed(
            pre.executable_job.vector.id,
            pre,
            resolved_policy=(
                resolved_policy_payload(admitted_policy)
                if admitted_policy is not None
                else None
            ),
        )
        if conv.next_regime is F_P and conv.next_action in ("continue", "escalate"):
            return FpDispatchRequiredTransition(
                basis=basis,
                dispatch_ref=dispatch_ref_from_resolved_policy(admitted_policy),
            )
        if conv.next_regime is F_H and conv.next_action in ("continue", "escalate"):
            return FhEscalationTransition(
                basis=basis,
                approval_subject_ref=(
                    basis.executable_job.vector.name if basis.executable_job is not None else ""
                ),
                gate_reason="fh_gate",
            )
        return TerminalTransition(
            basis=basis,
            terminal_kind="gap_stop",
            reason="fd_gap",
        )
    if failures.fp:
        return FpDispatchRequiredTransition(
            basis=basis,
            dispatch_ref=dispatch_ref_from_resolved_policy(resolved_policy),
        )
    return FdAdvanceTransition(
        basis=basis,
        status="ready",
        precomputed=pre,
    )


def blocking_reason_for_transition(
    transition: AdvancementTransition,
) -> BlockingReason | None:
    if isinstance(transition, FpDispatchRequiredTransition | FpDispatchTransition):
        return "fp_dispatch"
    if isinstance(transition, FhEscalationTransition):
        return "fh_gate"
    if isinstance(transition, TerminalTransition) and transition.terminal_kind == "gap_stop":
        return "fd_gap"
    return None


def transition_blocks_progress(transition: AdvancementTransition) -> bool:
    return blocking_reason_for_transition(transition) is not None


def dispatch_ref_from_transition_payload(
    payload: Mapping[str, Any] | None,
) -> str | None:
    if not isinstance(payload, Mapping):
        return None
    if payload.get("kind") != "fp_dispatch":
        return None
    ref = payload.get("dispatch_ref")
    if isinstance(ref, str) and ref:
        return ref
    return None


def result_path_from_transition_payload(
    payload: Mapping[str, Any] | None,
) -> str | None:
    if not isinstance(payload, Mapping):
        return None
    if payload.get("kind") != "fp_dispatch":
        return None
    result_path = payload.get("result_path")
    if isinstance(result_path, str) and result_path:
        return result_path
    return None


def terminal_transition_from_operational_state(
    basis: ExecutionBasis,
    state: Mapping[str, Any],
) -> TerminalTransition | None:
    status = str(state.get("status") or "")
    if status == "converged":
        return TerminalTransition(
            basis=basis,
            terminal_kind="converged",
            reason="All jobs in scope have delta = 0. Run /gen-gaps for full report.",
        )
    if status == "nothing_to_do":
        return TerminalTransition(
            basis=basis,
            terminal_kind="nothing_to_do",
            reason=str(state.get("reason") or ""),
        )
    return None


def stop_predicate_from_transition(transition: AdvancementTransition) -> str:
    if isinstance(transition, FpDispatchRequiredTransition):
        return "dispatch_required"
    if isinstance(transition, FpDispatchTransition):
        return "dispatch_required"
    if isinstance(transition, FhEscalationTransition):
        return "human_gate_required"
    if isinstance(transition, TerminalTransition):
        if transition.terminal_kind == "converged":
            return "converged"
        if transition.terminal_kind == "yielded":
            return "yielded"
        if transition.terminal_kind == "nothing_to_do":
            return "gap_stop"
        return transition.terminal_kind
    return "traversal_applied"


def execution_basis_payload(basis: ExecutionBasis) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "workflow_version": basis.workflow_version,
        "workspace_root": str(basis.workspace_root),
        "run_id": basis.run_id,
        "work_key": basis.work_key,
        "frame_id": basis.frame_id,
        "frame_lineage_id": basis.frame_lineage_id,
        "resolved_policy_bundle_ref": basis.resolved_policy_bundle_ref,
        "runtime_identity": {
            "worker_id": basis.runtime_identity.worker_id,
            "backend_id": basis.runtime_identity.backend_id,
            "build_id": basis.runtime_identity.build_id,
            "assignment_source": basis.runtime_identity.assignment_source,
            "resolved_runtime_ref": basis.runtime_identity.resolved_runtime_ref,
        },
    }
    if basis.start_intent is not None:
        payload["until"] = basis.start_intent.until
        payload["target"] = basis.start_intent.target.public_ref()
    if basis.executable_job is not None:
        payload["job_id"] = basis.executable_job.job.id
        payload["job_name"] = basis.executable_job.job.name
        payload["edge"] = basis.executable_job.vector.name
        payload["vector_id"] = basis.executable_job.vector.id
        if basis.executable_job.graph_function is not None:
            payload["graph_function_id"] = basis.executable_job.graph_function.id
            payload["graph_function_name"] = basis.executable_job.graph_function.name
    return payload


def advancement_transition_payload(transition: AdvancementTransition) -> dict[str, Any]:
    if isinstance(transition, FpDispatchRequiredTransition):
        return {
            "kind": transition.kind,
            "dispatch_ref": transition.dispatch_ref,
        }
    if isinstance(transition, FpDispatchTransition):
        return {
            "kind": transition.kind,
            "manifest_id": transition.manifest_id,
            "dispatch_ref": transition.dispatch_ref,
            "result_path": transition.result_path,
        }
    if isinstance(transition, FhEscalationTransition):
        return {
            "kind": transition.kind,
            "approval_subject_ref": transition.approval_subject_ref,
            "gate_reason": transition.gate_reason,
        }
    if isinstance(transition, FdAdvanceTransition):
        return {
            "kind": transition.kind,
            "status": transition.status,
        }
    return {
        "kind": transition.kind,
        "terminal_kind": transition.terminal_kind,
        "reason": transition.reason,
    }


def attach_runtime_carrier_metadata(
    result: dict[str, Any],
    basis: ExecutionBasis,
    transition: AdvancementTransition,
) -> None:
    result["execution_basis"] = execution_basis_payload(basis)
    result["advancement_transition"] = advancement_transition_payload(transition)
