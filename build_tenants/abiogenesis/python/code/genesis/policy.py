# Implements: REQ-R-ABG3-POLICY
# Implements: REQ-R-ABG3-PROVENANCE
"""
policy — ABG3 policy bundle resolution over GTL hook attachment surfaces.
"""
from __future__ import annotations

import importlib
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from gtl.function_model import CandidateFamily, GraphFunction
from gtl.graph import Attrs, GraphVector
from gtl.work_model import Role


POLICY_CONCERNS = ("dispatch", "evaluation", "escalation", "proof", "closure")
DEFAULT_POLICY_BUNDLE_REF = "genesis.policy_defaults:broad_fp_first_bundle"


@dataclass(frozen=True)
class PolicyConcernSpec:
    ref: str
    config: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "ref": self.ref,
            "config": dict(self.config),
        }


@dataclass(frozen=True)
class ResolvedPolicy:
    resolved_policy_bundle_ref: str
    bundle_refs: tuple[str, ...]
    sources: dict[str, str]
    dispatch: PolicyConcernSpec
    evaluation: PolicyConcernSpec
    escalation: PolicyConcernSpec
    proof: PolicyConcernSpec
    closure: PolicyConcernSpec

    def concern(self, name: str) -> PolicyConcernSpec:
        if name not in POLICY_CONCERNS:
            raise KeyError(name)
        return getattr(self, name)

    def to_dict(self) -> dict[str, Any]:
        payload = {
            "resolved_policy_bundle_ref": self.resolved_policy_bundle_ref,
            "bundle_refs": tuple(self.bundle_refs),
            "sources": dict(self.sources),
        }
        for concern in POLICY_CONCERNS:
            payload[concern] = self.concern(concern).to_dict()
        return payload


def _mapping(value: Any) -> dict[str, Any]:
    if isinstance(value, Mapping):
        return dict(value)
    return {}


def _surface_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, Attrs):
        return value.to_dict()
    if isinstance(value, Mapping):
        return dict(value)
    return {}


def _import_ref(ref: str) -> Any:
    if ":" not in ref:
        raise ValueError(f"Hook reference must use MODULE:SYMBOL form, got {ref!r}")
    module_name, _, symbol_name = ref.partition(":")
    module = importlib.import_module(module_name)
    try:
        return getattr(module, symbol_name)
    except AttributeError as exc:
        raise ValueError(f"Hook reference {ref!r} does not resolve to a symbol") from exc


def materialize_policy_concern(
    policy_bundle: Mapping[str, Any] | ResolvedPolicy,
    concern: str,
) -> dict[str, Any]:
    """Resolve one concern ref/config into executable behavior metadata."""
    spec = admit_resolved_policy(policy_bundle).concern(concern)
    target = _import_ref(spec.ref)
    materialized = target(spec.config) if callable(target) else target
    if not isinstance(materialized, Mapping):
        raise ValueError(
            f"Resolved policy concern {concern!r} from {spec.ref!r} must materialize to a mapping"
        )
    result = dict(materialized)
    result.setdefault("ref", spec.ref)
    result.setdefault("config", dict(spec.config))
    return result


def _normalize_spec(
    value: Any,
    *,
    concern: str | None,
    source: str,
) -> dict[str, Any]:
    if isinstance(value, str):
        spec = {"ref": value, "config": {}}
    elif isinstance(value, Mapping):
        spec = {"ref": value.get("ref"), "config": _mapping(value.get("config"))}
    else:
        raise ValueError(f"{source} {concern or 'bundle'} must be a ref string or mapping")
    ref = spec.get("ref")
    if not isinstance(ref, str) or not ref:
        raise ValueError(f"{source} {concern or 'bundle'} must declare a non-empty ref")
    if not isinstance(spec["config"], dict):
        raise ValueError(f"{source} {concern or 'bundle'} config must be a mapping")
    return spec


def _resolve_bundle(spec: dict[str, Any], *, source: str) -> tuple[dict[str, Any], str]:
    bundle_factory = _import_ref(spec["ref"])
    bundle = bundle_factory(spec.get("config", {})) if callable(bundle_factory) else bundle_factory
    if not isinstance(bundle, Mapping):
        raise ValueError(f"{source} bundle ref {spec['ref']!r} must resolve to a mapping")
    return dict(bundle), spec["ref"]


def _concern_spec_from_value(
    value: Any,
    *,
    concern: str,
    source: str,
) -> PolicyConcernSpec:
    spec = _normalize_spec(value, concern=concern, source=source)
    return PolicyConcernSpec(
        ref=str(spec["ref"]),
        config=dict(spec.get("config", {})),
    )


def admit_resolved_policy(value: Mapping[str, Any] | ResolvedPolicy) -> ResolvedPolicy:
    if isinstance(value, ResolvedPolicy):
        return value
    if not isinstance(value, Mapping) or not value:
        raise ValueError("resolved policy carrier must be a non-empty mapping or ResolvedPolicy")

    bundle_ref = value.get("resolved_policy_bundle_ref")
    if not isinstance(bundle_ref, str) or not bundle_ref:
        bundle_ref = DEFAULT_POLICY_BUNDLE_REF

    raw_bundle_refs = value.get("bundle_refs")
    if isinstance(raw_bundle_refs, (list, tuple)):
        bundle_refs = tuple(ref for ref in raw_bundle_refs if isinstance(ref, str) and ref)
    else:
        bundle_refs = ()
    if not bundle_refs:
        bundle_refs = (bundle_ref,)

    raw_sources = value.get("sources")
    sources = dict(raw_sources) if isinstance(raw_sources, Mapping) else {}

    concerns = {
        concern: _concern_spec_from_value(
            value.get(concern),
            concern=concern,
            source="resolved_policy",
        )
        for concern in POLICY_CONCERNS
    }

    return ResolvedPolicy(
        resolved_policy_bundle_ref=bundle_ref,
        bundle_refs=bundle_refs,
        sources=sources,
        dispatch=concerns["dispatch"],
        evaluation=concerns["evaluation"],
        escalation=concerns["escalation"],
        proof=concerns["proof"],
        closure=concerns["closure"],
    )


def resolved_policy_payload(value: Mapping[str, Any] | ResolvedPolicy) -> dict[str, Any]:
    return admit_resolved_policy(value).to_dict()


def _surface_concern_value(surface: Mapping[str, Any], concern: str) -> Any:
    for key in (concern, f"{concern}_policy"):
        if key in surface:
            return surface[key]
    return None


def _apply_policy_surface(
    resolved: dict[str, Any],
    source_by_concern: dict[str, str],
    bundle_refs: list[str],
    surface: Mapping[str, Any],
    *,
    source: str,
) -> None:
    bundle_value = surface.get("policy_bundle")
    if bundle_value is None:
        bundle_value = surface.get("default_policy_bundle")
    if bundle_value is not None:
        bundle_spec = _normalize_spec(bundle_value, concern=None, source=source)
        bundle, bundle_ref = _resolve_bundle(bundle_spec, source=source)
        bundle_refs.append(bundle_ref)
        for concern in POLICY_CONCERNS:
            if concern not in bundle:
                continue
            concern_spec = _normalize_spec(bundle[concern], concern=concern, source=f"{source} bundle")
            resolved[concern] = concern_spec
            source_by_concern[concern] = f"{source}:bundle"

    for concern in POLICY_CONCERNS:
        concern_value = _surface_concern_value(surface, concern)
        if concern_value is None:
            continue
        concern_spec = _normalize_spec(concern_value, concern=concern, source=source)
        resolved[concern] = concern_spec
        source_by_concern[concern] = source


def _policy_ingress_surface(runtime_config: Mapping[str, Any] | None) -> dict[str, Any]:
    if runtime_config is None:
        return {}
    surface = _surface_dict(runtime_config)
    illegal_keys = [
        key
        for concern in POLICY_CONCERNS
        for key in (concern, f"{concern}_policy")
        if key in surface
    ]
    if illegal_keys:
        joined = ", ".join(sorted(illegal_keys))
        raise ValueError(
            "runtime_config policy ingress may only declare policy_bundle/default_policy_bundle; "
            f"illegal direct concern overrides: {joined}"
        )
    ingress: dict[str, Any] = {}
    if "policy_bundle" in surface:
        ingress["policy_bundle"] = surface["policy_bundle"]
    if "default_policy_bundle" in surface:
        ingress["default_policy_bundle"] = surface["default_policy_bundle"]
    return ingress


def resolve_policy_bundle(
    *,
    vector: GraphVector | None = None,
    graph_function: GraphFunction | None = None,
    roles: Sequence[Role] = (),
    candidate_family: CandidateFamily | None = None,
    runtime_config: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Resolve the effective ABG3 policy bundle for one concrete traversal boundary.

    Precedence is low-to-high:
      broad default -> runtime-config default bundle ingress -> candidate family -> roles
      -> graph function -> graph vector
    """
    resolved: dict[str, Any] = {}
    source_by_concern: dict[str, str] = {}
    bundle_refs: list[str] = []

    _apply_policy_surface(
        resolved,
        source_by_concern,
        bundle_refs,
        {"default_policy_bundle": DEFAULT_POLICY_BUNDLE_REF},
        source="abg_default",
    )
    runtime_ingress = _policy_ingress_surface(runtime_config)
    if runtime_ingress:
        _apply_policy_surface(
            resolved,
            source_by_concern,
            bundle_refs,
            runtime_ingress,
            source="runtime_config",
        )
    if candidate_family is not None:
        _apply_policy_surface(
            resolved,
            source_by_concern,
            bundle_refs,
            _surface_dict(candidate_family.policy_hints),
            source="candidate_family.policy_hints",
        )
    for index, role in enumerate(roles):
        _apply_policy_surface(
            resolved,
            source_by_concern,
            bundle_refs,
            _surface_dict(role.policy_hooks),
            source=f"role.policy_hooks[{index}]",
        )
    if graph_function is not None:
        _apply_policy_surface(
            resolved,
            source_by_concern,
            bundle_refs,
            _surface_dict(graph_function.declarations),
            source="graph_function.declarations",
        )
    if vector is not None:
        _apply_policy_surface(
            resolved,
            source_by_concern,
            bundle_refs,
            _surface_dict(vector.declarations),
            source="graph_vector.declarations",
        )

    for concern in POLICY_CONCERNS:
        if concern not in resolved:
            raise ValueError(f"Resolved policy is missing required concern {concern!r}")
        # Validate that the hook ref resolves now so malformed policy fails closed.
        _import_ref(resolved[concern]["ref"])

    policy = {
        "resolved_policy_bundle_ref": bundle_refs[-1] if bundle_refs else DEFAULT_POLICY_BUNDLE_REF,
        "bundle_refs": tuple(bundle_refs),
        "sources": source_by_concern,
    }
    policy.update(resolved)
    return policy
