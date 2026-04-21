# Validates: REQ-R-ABG3-INTERPRET
# Validates: REQ-R-ABG3-CONVERGENCE
# Validates: REQ-R-ABG3-POLICY
from __future__ import annotations

from dataclasses import fields, is_dataclass
from pathlib import Path
from typing import get_args, get_type_hints

from genesis.runtime_carrier import (
    AdvancementTransition,
    DispatchBindingRequest,
    ExecutionBasis,
    FdAdvanceTransition,
    FhEscalationTransition,
    IterationAdvanceDecision,
    IterationDispatchPlan,
    IterationOutcomePlan,
    FpDispatchPublicationPlan,
    FpDispatchRequiredTransition,
    FpDispatchTransition,
    TerminalTransition,
)
from genesis.policy import ResolvedPolicy
from genesis.binding import (
    FdBindingOutcome,
    FhBindingOutcome,
    FpCertificationOutcome,
    PromptAssembly,
    RegimeBindingSet,
    PrecomputedManifest,
)


def test_runtime_carrier_publishes_named_upstream_family() -> None:
    assert is_dataclass(ExecutionBasis)
    assert is_dataclass(FdAdvanceTransition)
    assert is_dataclass(FpDispatchRequiredTransition)
    assert is_dataclass(FpDispatchTransition)
    assert is_dataclass(DispatchBindingRequest)
    assert is_dataclass(IterationAdvanceDecision)
    assert is_dataclass(IterationDispatchPlan)
    assert is_dataclass(IterationOutcomePlan)
    assert is_dataclass(FpDispatchPublicationPlan)
    assert is_dataclass(FhEscalationTransition)
    assert is_dataclass(TerminalTransition)
    assert is_dataclass(FdBindingOutcome)
    assert is_dataclass(FhBindingOutcome)
    assert is_dataclass(FpCertificationOutcome)
    assert is_dataclass(RegimeBindingSet)


def test_execution_basis_excludes_runtime_config_dict_authority() -> None:
    field_names = {field.name for field in fields(ExecutionBasis)}

    assert "runtime_config" not in field_names
    assert "resolved_policy" not in field_names
    assert "policy" not in field_names
    assert "resolved_policy_bundle_ref" in field_names


def test_advancement_transition_family_is_closed_named_variants() -> None:
    variants = set(get_args(AdvancementTransition))

    assert variants == {
        FdAdvanceTransition,
        FpDispatchRequiredTransition,
        FpDispatchTransition,
        FhEscalationTransition,
        TerminalTransition,
    }


def test_fp_dispatch_requirement_is_its_own_typed_variant() -> None:
    hints = get_type_hints(FpDispatchRequiredTransition)

    assert "dispatch_ref" in hints
    assert "blocking_reason" not in hints


def test_iteration_decision_and_dispatch_request_use_typed_carriers() -> None:
    decision_hints = get_type_hints(IterationAdvanceDecision)
    request_field_names = {field.name for field in fields(DispatchBindingRequest)}

    assert decision_hints["resolved_policy"] is ResolvedPolicy
    assert "runtime_config" not in request_field_names
    assert "asset_bindings" in request_field_names


def test_precomputed_manifest_publishes_typed_regime_bindings() -> None:
    field_names = {field.name for field in fields(PrecomputedManifest)}
    hints = get_type_hints(PrecomputedManifest)

    assert "regime_bindings" in field_names
    assert hints["regime_bindings"] is RegimeBindingSet
    assert "failing_evaluators" not in field_names
    assert "passing_evaluators" not in field_names
    assert isinstance(PrecomputedManifest.failing_evaluators, property)
    assert isinstance(PrecomputedManifest.passing_evaluators, property)


def test_prompt_assembly_does_not_masquerade_as_string() -> None:
    assert "__str__" not in PromptAssembly.__dict__
    assert "__contains__" not in PromptAssembly.__dict__
    assert "__len__" not in PromptAssembly.__dict__
    assert "split" not in PromptAssembly.__dict__


def test_prompt_truncation_policy_is_confined_to_prompt_budget_carriers() -> None:
    genesis_root = Path(__file__).resolve().parents[2] / "code" / "genesis"
    allowed_budget_files = {
        genesis_root / "binding.py",
        genesis_root / "subwork.py",
    }

    for path in genesis_root.glob("*.py"):
        text = path.read_text(encoding="utf-8")
        assert "budget=None" not in text
        if path not in allowed_budget_files:
            assert "...[truncated]" not in text
            assert "max_chars" not in text
