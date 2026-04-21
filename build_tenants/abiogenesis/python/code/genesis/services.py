# Implements: REQ-R-ABG3-INTERPRET
# Implements: REQ-R-ABG3-BINDING
# Implements: REQ-R-ABG3-SELECTION-APPLICATION
"""
genesis.services — Named app services.

Orchestrates kernel modules into user-facing bindings:
gen_gaps, gen_iterate, gen_start, ScopeSelector, Scope, StartIntent.

The public named compositions are `gen-start` and `gen-gaps`. This module
provides the Python bindings `gen_start` and `gen_gaps` for those named
compositions. `gen_iterate` remains a lower-level traversal primitive beneath
that public operator surface. None introduce new kernel primitives. See
ADR-004 (Scope).

  /gen-gaps    = bind_fd over scope → delta_summary fields
  /gen-start   = derive state → select work item → traverse
"""
from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Any, Literal, Optional

from gtl.module_model import Module
from gtl.function_model import GraphFunction

from .binding import (
    ASSET_BINDING_QUERY_TIMEOUT_SECONDS,
    AssetBindingQueryContract,
    ExecutableJob,
    Worker,
    admit_asset_binding_query_contract,
    _coerce_boolish,
    _coerce_command_tokens,
    _coerce_mapping_or_json_object,
    _dig_path,
    _runtime_pythonpath_entries,
    _workspace_command_env,
    module_to_executable_jobs,
)
from .binding import WorkSurface
from .events import EventContext, EventStream, emit
from .identity import RuntimeIdentity
from .interpret import (
    derive_operational_gaps,
    derive_operational_state,
    plan_next_traversal,
    traverse,
)
from .lineage import _discover_children, active_work_keys, completed_feature_keys
from .provenance import _read_workflow_version
from .runtime_carrier import (
    AdvancementTransition,
    ExecutionBasis,
    TerminalTransition,
    attach_runtime_carrier_metadata,
    stop_predicate_from_transition,
    terminal_transition_from_operational_state,
)
from .selection import (
    validate_job_callable_vectors_are_published,
    validate_module_selection_surface,
    validate_module_traversal_surface,
)


# ── Workflow provenance helpers ───────────────────────────────────────────────

def _read_carry_forward(scope: "Scope") -> list[dict]:
    """
    Read approved_carry_forward from the variant manifest.json.

    Path: {workflow_root}/{pkg}/{variant}/{version}/manifest.json
    where workflow "my_domain.standard@0.2.0" → pkg="my_domain",
    variant="standard", version="0.2.0".

    When scope.workflow_root is set (from genesis.yml runtime contract), it is
    used as the base directory. Otherwise falls back to .genesis/workflows/.

    Returns [] if the manifest is absent or key missing.
    """
    workflow, version = scope.workflow_version.split("@", 1)
    parts = workflow.split(".", 1)
    pkg_name = parts[0]
    variant = parts[1] if len(parts) > 1 else "default"
    version_dir = "v" + version.replace(".", "_")
    if scope.workflow_root:
        wf_base = (scope.workspace_root / scope.workflow_root).resolve()
    else:
        wf_base = scope.workspace_root / ".genesis" / "workflows"
    manifest_path = (
        wf_base / pkg_name / variant / version_dir / "manifest.json"
    )
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        cf = data.get("approved_carry_forward", [])
        return cf if isinstance(cf, list) else []
    except Exception:
        return []


# ── Scope ─────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class ScopeSelector:
    """
    Public scope selector for operator-facing named compositions.

    The selection surface is small on purpose:
    - workspace: operate over the active workspace scope
    - work_key: operate over one declared work identity
    """

    kind: Literal["workspace", "work_key"]
    work_key: str | None = None

    def __post_init__(self) -> None:
        if self.kind not in {"workspace", "work_key"}:
            raise ValueError(f"unsupported scope selector kind: {self.kind!r}")
        if self.kind == "workspace" and self.work_key is not None:
            raise ValueError("workspace scope selector may not carry work_key")
        if self.kind == "work_key":
            work_key = (self.work_key or "").strip()
            if not work_key:
                raise ValueError("work_key scope selector requires a non-empty work_key")
            object.__setattr__(self, "work_key", work_key)


@dataclass(frozen=True)
class StartTarget:
    """
    Canonical target selector behind `gen-start`.

    The public target handle may be user-facing, but canonical resolution must
    end at one published callable-carrier identity.
    """

    kind: Literal["next", "graph_function", "asset"]
    handle: str | None = None
    target_id: str | None = None
    graph_function_name: str | None = None
    asset_id: str | None = None
    asset_uri: str | None = None
    asset_relative_path: str | None = None
    asset_path_kind: str | None = None
    asset_exists: bool | None = None
    binding_source: str | None = None

    @classmethod
    def next(cls) -> "StartTarget":
        return cls(kind="next")

    @classmethod
    def graph_function(
        cls,
        *,
        handle: str,
        target_id: str,
        graph_function_name: str,
    ) -> "StartTarget":
        return cls(
            kind="graph_function",
            handle=handle,
            target_id=target_id,
            graph_function_name=graph_function_name,
        )

    @classmethod
    def asset(
        cls,
        *,
        handle: str,
        target_id: str,
        graph_function_name: str,
        asset_id: str,
        asset_uri: str,
        asset_relative_path: str | None = None,
        asset_path_kind: str | None = None,
        asset_exists: bool | None = None,
        binding_source: str | None = None,
    ) -> "StartTarget":
        return cls(
            kind="asset",
            handle=handle,
            target_id=target_id,
            graph_function_name=graph_function_name,
            asset_id=asset_id,
            asset_uri=asset_uri,
            asset_relative_path=asset_relative_path,
            asset_path_kind=asset_path_kind,
            asset_exists=asset_exists,
            binding_source=binding_source,
        )

    def __post_init__(self) -> None:
        if self.kind == "next":
            if any(
                value is not None
                for value in (
                    self.handle,
                    self.target_id,
                    self.graph_function_name,
                    self.asset_id,
                    self.asset_uri,
                    self.asset_relative_path,
                    self.asset_path_kind,
                    self.asset_exists,
                    self.binding_source,
                )
            ):
                raise ValueError("StartTarget(kind='next') may not carry target identity")
            return
        if self.kind not in {"graph_function", "asset"}:
            raise ValueError(f"unsupported gen-start target kind: {self.kind!r}")
        handle = (self.handle or "").strip()
        target_id = (self.target_id or "").strip()
        graph_function_name = (self.graph_function_name or "").strip()
        if not handle or not target_id or not graph_function_name:
            raise ValueError(
                "StartTarget graph-function-backed kinds require handle, target_id, and graph_function_name"
            )
        object.__setattr__(self, "handle", handle)
        object.__setattr__(self, "target_id", target_id)
        object.__setattr__(self, "graph_function_name", graph_function_name)
        if self.kind == "graph_function":
            if any(
                value is not None
                for value in (
                    self.asset_id,
                    self.asset_uri,
                    self.asset_relative_path,
                    self.asset_path_kind,
                    self.asset_exists,
                    self.binding_source,
                )
            ):
                raise ValueError(
                    "StartTarget(kind='graph_function') may not carry asset registry metadata"
                )
            return
        asset_id = (self.asset_id or "").strip()
        asset_uri = (self.asset_uri or "").strip()
        if not asset_id or not asset_uri:
            raise ValueError(
                "StartTarget(kind='asset') requires asset_id and asset_uri"
            )
        object.__setattr__(self, "asset_id", asset_id)
        object.__setattr__(self, "asset_uri", asset_uri)
        if isinstance(self.asset_relative_path, str) and not self.asset_relative_path.strip():
            object.__setattr__(self, "asset_relative_path", None)
        if isinstance(self.asset_path_kind, str) and not self.asset_path_kind.strip():
            object.__setattr__(self, "asset_path_kind", None)
        if isinstance(self.binding_source, str) and not self.binding_source.strip():
            object.__setattr__(self, "binding_source", None)

    def public_ref(self) -> str:
        if self.kind == "next":
            return "next"
        if self.kind == "asset":
            return f"asset:{self.handle}"
        return f"graph_function:{self.handle}"


GRAPH_FUNCTION_OPERATOR_HANDLES_KEY = "operator_handles"


def _declared_graph_function_operator_handles(graph_function: GraphFunction) -> tuple[str, ...]:
    raw = graph_function.declarations.get(GRAPH_FUNCTION_OPERATOR_HANDLES_KEY)
    handles: list[str] = [graph_function.name]
    if raw is None:
        return tuple(handles)
    if isinstance(raw, str):
        raw_values: tuple[Any, ...] = (raw,)
    elif isinstance(raw, (tuple, list)):
        raw_values = tuple(raw)
    else:
        raise ValueError(
            f"GraphFunction {graph_function.name!r} declarations.{GRAPH_FUNCTION_OPERATOR_HANDLES_KEY!r} "
            "must be a string or sequence of strings"
        )
    for value in raw_values:
        if not isinstance(value, str):
            raise ValueError(
                f"GraphFunction {graph_function.name!r} operator handle {value!r} must be a string"
            )
        handle = value.strip()
        if not handle:
            raise ValueError(f"GraphFunction {graph_function.name!r} declares an empty operator handle")
        if handle not in handles:
            handles.append(handle)
    return tuple(handles)


def published_graph_function_target_catalog(module: Module) -> dict[str, dict[str, Any]]:
    """
    Publish the operator-facing graph-function target catalog for one module.

    Each handle resolves to one canonical callable-carrier identity.
    """
    job_names_by_target_id: dict[str, set[str]] = {}
    for job in module.jobs:
        for contract in job.contracts:
            if contract.kind != "graph_function":
                continue
            job_names_by_target_id.setdefault(contract.target_id, set()).add(job.name)

    catalog: dict[str, dict[str, Any]] = {}
    for graph_function in module.graph_functions:
        job_names = tuple(sorted(job_names_by_target_id.get(graph_function.id, ())))
        if not job_names:
            continue
        entry = {
            "target_id": graph_function.id,
            "graph_function_name": graph_function.name,
            "job_names": job_names,
        }
        for handle in _declared_graph_function_operator_handles(graph_function):
            existing = catalog.get(handle)
            if existing is not None and existing["target_id"] != graph_function.id:
                raise ValueError(
                    f"Module {module.name!r} publishes ambiguous graph-function operator handle {handle!r}"
                )
            catalog[handle] = entry
    return catalog


def _graph_function_name_by_id(module: Module) -> dict[str, str]:
    return {graph_function.id: graph_function.name for graph_function in module.graph_functions}


@dataclass(frozen=True)
class OperatorAssetQueryContract:
    command: tuple[str, ...]
    assets_key: str
    handle_key: str
    asset_id_key: str
    uri_key: str
    relative_path_key: str
    path_kind_key: str
    exists_key: str
    owner_kind_key: str
    owner_handle_key: str
    owner_target_id_key: str
    timeout_seconds: int
    binding_source: str
    pythonpath_entries: tuple[str, ...] = ()


def admit_operator_asset_query_contract(
    runtime_config: dict[str, Any] | None,
    *,
    workspace_root: Path | None,
) -> OperatorAssetQueryContract | None:
    config = dict(runtime_config or {})
    explicit = config.get("operator_asset_contract")
    if explicit is None:
        return None
    contract_map = _coerce_mapping_or_json_object(
        explicit,
        label="runtime_config.operator_asset_contract",
    )
    return OperatorAssetQueryContract(
        command=tuple(
            _coerce_command_tokens(
                contract_map.get("command"),
                label="runtime_config.operator_asset_contract.command",
            )
        ),
        assets_key=str(contract_map.get("assets_key", "assets")),
        handle_key=str(contract_map.get("handle_key", "asset_id")),
        asset_id_key=str(contract_map.get("asset_id_key", "asset_id")),
        uri_key=str(contract_map.get("uri_key", "uri")),
        relative_path_key=str(contract_map.get("relative_path_key", "metadata.relative_path")),
        path_kind_key=str(contract_map.get("path_kind_key", "checkpoint.path_kind")),
        exists_key=str(contract_map.get("exists_key", "checkpoint.exists")),
        owner_kind_key=str(contract_map.get("owner_kind_key", "operator_target.kind")),
        owner_handle_key=str(contract_map.get("owner_handle_key", "operator_target.handle")),
        owner_target_id_key=str(contract_map.get("owner_target_id_key", "operator_target.target_id")),
        timeout_seconds=int(contract_map.get("timeout_seconds", ASSET_BINDING_QUERY_TIMEOUT_SECONDS)),
        binding_source=str(
            contract_map.get("binding_source", "runtime_config.operator_asset_contract")
        ),
        pythonpath_entries=tuple(
            _runtime_pythonpath_entries(runtime_config, workspace_root=workspace_root)
        ),
    )


def published_operator_asset_target_catalog(
    module: Module,
    *,
    workspace_root: Path | None,
    operator_asset_contract: OperatorAssetQueryContract | None = None,
) -> dict[str, dict[str, Any]]:
    contract = operator_asset_contract
    if contract is None:
        return {}
    if workspace_root is None:
        raise ValueError("operator asset contract requires a workspace_root")

    timeout = contract.timeout_seconds
    try:
        result = subprocess.run(
            list(contract.command),
            cwd=workspace_root,
            capture_output=True,
            text=True,
            env=_workspace_command_env(
                runtime_config=None,
                workspace_root=workspace_root,
                pythonpath_entries=contract.pythonpath_entries,
            ),
            timeout=float(timeout),
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise ValueError(f"operator asset query failed: {exc}") from exc

    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or f"returncode={result.returncode}"
        raise ValueError(f"operator asset query failed: {detail}")

    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise ValueError("operator asset query did not return valid JSON") from exc

    assets = _dig_path(payload, contract.assets_key)
    if not isinstance(assets, list):
        raise ValueError("operator asset query JSON must expose a list at assets_key")

    graph_catalog = published_graph_function_target_catalog(module)
    graph_names_by_id = _graph_function_name_by_id(module)
    catalog: dict[str, dict[str, Any]] = {}
    for index, entry in enumerate(assets):
        if not isinstance(entry, dict):
            raise ValueError(f"operator asset query entry {index} must be an object")
        handle = _dig_path(entry, contract.handle_key)
        asset_id = _dig_path(entry, contract.asset_id_key)
        uri = _dig_path(entry, contract.uri_key)
        owner_kind = _dig_path(entry, contract.owner_kind_key)
        owner_handle = _dig_path(entry, contract.owner_handle_key)
        owner_target_id = _dig_path(entry, contract.owner_target_id_key)
        if not isinstance(handle, str) or not handle.strip():
            raise ValueError(f"operator asset query entry {index} must publish a non-empty handle")
        if not isinstance(asset_id, str) or not asset_id.strip():
            raise ValueError(
                f"operator asset query entry {index} must publish a non-empty asset_id"
            )
        if not isinstance(uri, str) or not uri.strip():
            raise ValueError(
                f"operator asset query entry {index} must publish a non-empty uri"
            )
        if owner_kind != "graph_function":
            raise ValueError(
                f"operator asset handle {handle!r} must publish operator_target.kind='graph_function'"
            )
        resolved_target_id: str | None = None
        graph_function_name: str | None = None
        if isinstance(owner_handle, str) and owner_handle.strip():
            owner_handle = owner_handle.strip()
            graph_entry = graph_catalog.get(owner_handle)
            if graph_entry is None:
                raise ValueError(
                    f"operator asset handle {handle!r} references unknown graph-function handle {owner_handle!r}"
                )
            resolved_target_id = str(graph_entry["target_id"])
            graph_function_name = str(graph_entry["graph_function_name"])
        else:
            owner_handle = None
        if isinstance(owner_target_id, str) and owner_target_id.strip():
            owner_target_id = owner_target_id.strip()
            graph_name_from_id = graph_names_by_id.get(owner_target_id)
            if graph_name_from_id is None:
                raise ValueError(
                    f"operator asset handle {handle!r} references unknown graph-function target_id {owner_target_id!r}"
                )
            if resolved_target_id is not None and resolved_target_id != owner_target_id:
                raise ValueError(
                    f"operator asset handle {handle!r} publishes conflicting graph-function ownership"
                )
            resolved_target_id = owner_target_id
            graph_function_name = graph_name_from_id
        if resolved_target_id is None or graph_function_name is None:
            raise ValueError(
                f"operator asset handle {handle!r} must publish operator_target.handle or operator_target.target_id"
            )
        relative_path = _dig_path(entry, contract.relative_path_key)
        path_kind = _dig_path(entry, contract.path_kind_key)
        exists = _coerce_boolish(_dig_path(entry, contract.exists_key))
        catalog_entry = {
            "handle": handle.strip(),
            "asset_id": asset_id.strip(),
            "uri": uri.strip(),
            "relative_path": relative_path if isinstance(relative_path, str) and relative_path else None,
            "path_kind": path_kind if isinstance(path_kind, str) and path_kind else None,
            "exists": exists,
            "target_id": resolved_target_id,
            "graph_function_name": graph_function_name,
            "owner_handle": owner_handle,
            "binding_source": contract.binding_source,
        }
        existing = catalog.get(catalog_entry["handle"])
        if existing is not None and existing != catalog_entry:
            raise ValueError(
                f"operator asset query publishes ambiguous asset handle {catalog_entry['handle']!r}"
            )
        catalog[catalog_entry["handle"]] = catalog_entry
    return catalog


def resolve_start_target(
    module: Module,
    raw_target: str,
    *,
    workspace_root: Path | None = None,
    operator_asset_contract: OperatorAssetQueryContract | None = None,
) -> StartTarget:
    value = (raw_target or "").strip()
    if value == "next":
        return StartTarget.next()
    graph_prefix = "graph_function:"
    asset_prefix = "asset:"
    if value.startswith(graph_prefix):
        handle = value[len(graph_prefix):].strip()
        if not handle:
            raise ValueError("graph_function target requires a non-empty published handle")
        catalog = published_graph_function_target_catalog(module)
        entry = catalog.get(handle)
        if entry is None:
            raise ValueError(
                f"unknown published graph-function handle {handle!r} for module {module.name!r}"
            )
        return StartTarget.graph_function(
            handle=handle,
            target_id=str(entry["target_id"]),
            graph_function_name=str(entry["graph_function_name"]),
        )
    if not value.startswith(asset_prefix):
        raise ValueError(
            "target must be 'next', 'graph_function:<published_handle>', or 'asset:<published_handle>'"
        )
    handle = value[len(asset_prefix):].strip()
    if not handle:
        raise ValueError("asset target requires a non-empty published handle")
    if operator_asset_contract is None:
        raise ValueError(
            "asset target resolution requires a published operator asset contract"
        )
    catalog = published_operator_asset_target_catalog(
        module,
        workspace_root=workspace_root,
        operator_asset_contract=operator_asset_contract,
    )
    entry = catalog.get(handle)
    if entry is None:
        raise ValueError(
            f"unknown published asset handle {handle!r} for module {module.name!r}"
        )
    return StartTarget.asset(
        handle=handle,
        target_id=str(entry["target_id"]),
        graph_function_name=str(entry["graph_function_name"]),
        asset_id=str(entry["asset_id"]),
        asset_uri=str(entry["uri"]),
        asset_relative_path=entry.get("relative_path"),
        asset_path_kind=entry.get("path_kind"),
        asset_exists=entry.get("exists"),
        binding_source=str(entry["binding_source"]),
    )


@dataclass(frozen=True)
class StartIntent:
    """
    Internal normalization contract behind `gen-start`.

    This type does not own control modes or adapter spellings. It carries only
    traversal request truth: scope + target + until.
    """

    scope: "Scope"
    target: StartTarget
    until: Literal["first_traversal", "blocked", "converged"]

    def __post_init__(self) -> None:
        if self.until not in {"first_traversal", "blocked", "converged"}:
            raise ValueError(f"unsupported gen-start until: {self.until!r}")


@dataclass
class Scope:
    """
    First-class scope object. Every command requires one. No ambient inference.

    Ambiguous scope fails closed — the command returns an error describing the
    available scopes rather than guessing. See ADR-004.

    module: Module — the authoritative entry point. ExecutableJobs and Worker are
        derived directly from Module via module_to_executable_jobs().

    workflow_version: derived at construction from active-workflow.json.
        "{workflow}@{version}" when file present and valid.
        Missing or malformed workflow metadata is a runtime defect.

    Runtime identity is distinct from worker binding. `build` remains nullable
    reporting metadata, not canonical worker/role/binding truth.
    """
    module: Module = None
    workspace_root: Path = field(default_factory=lambda: Path("."))
    selector: ScopeSelector = field(default_factory=lambda: ScopeSelector(kind="workspace"))
    diagnostic_edge_override: Optional[str] = None
    build: str | None = None
    runtime_identity: Optional[RuntimeIdentity] = None
    worker: Optional[Worker] = None   # explicit worker; None = derived
    active_workflow_path: Optional[str] = None  # runtime contract: path to active-workflow.json
    workflow_root: Optional[str] = None         # runtime contract: base dir for workflow releases
    work_key: Optional[str] = None    # work identity (ADR-023); None = global scope
    run_id: Optional[str] = None      # attempt identity (ADR-023); None = global scope
    runtime_config: dict = field(default_factory=dict)
    operator_asset_contract: "OperatorAssetQueryContract | None" = None
    asset_binding_contract: AssetBindingQueryContract | None = None
    workflow_version: str = field(init=False, default="")

    def __post_init__(self) -> None:
        if self.module is None:
            raise ValueError("Scope requires a Module.")
        validate_module_selection_surface(self.module)
        validate_job_callable_vectors_are_published(self.module)
        validate_module_traversal_surface(self.module)

        if self.runtime_identity is None:
            self.runtime_identity = RuntimeIdentity(build_id=self.build)
        else:
            self.runtime_identity = self.runtime_identity.with_report_build_id(self.build)

        # Derive Worker from Module's graph-function-bound jobs.
        # ADR-030 §5: a single resolved worker may satisfy all declared roles.
        if self.worker is None:
            jobs = module_to_executable_jobs(self.module)
            role_ids = tuple(r.id for r in self.module.roles)
            self.worker = Worker(
                id=self.runtime_identity.worker_id or self.runtime_identity.engine_id,
                can_execute=jobs,
                role_ids=role_ids,
                authority_ref=self.runtime_identity.authority_ref,
            )

        self.runtime_identity = self.runtime_identity.bind_worker(self.worker)
        self.build = self.runtime_identity.report_build_id()
        if self.operator_asset_contract is None:
            self.operator_asset_contract = admit_operator_asset_query_contract(
                self.runtime_config,
                workspace_root=self.workspace_root,
            )
        if self.asset_binding_contract is None:
            self.asset_binding_contract = admit_asset_binding_query_contract(
                self.runtime_config,
                workspace_root=self.workspace_root,
            )

        self.workflow_version = _read_workflow_version(
            self.workspace_root, self.active_workflow_path
        )


# ── work_key enumeration ────────────────────────────────────────────────────

# active_work_keys is re-exported from .lineage (imported above).


def _resolve_work_keys(scope: "Scope",
                       stream: Optional["EventStream"] = None) -> list[str]:
    """
    Determine active work_keys for this scope.

    Priority:
    1. scope.work_key set explicitly (CLI override) → [scope.work_key]
    2. scope.selector kind=work_key → [scope.selector.work_key]
    3. Enumerate from active feature vectors + spawned children
    4. Empty list → global scope (no work_key scoping)
    """
    if scope.work_key is not None:
        return [scope.work_key]
    if scope.selector.kind == "work_key":
        return [scope.selector.work_key]
    return active_work_keys(scope.workspace_root, stream)


# ── gen_gaps — bind_fd over scope ─────────────────────────────────────────────

def gen_gaps(scope: Scope, stream: EventStream) -> dict:
    """
    /gen-gaps = bind_fd over selected jobs → return delta_summary fields.

    Requires explicit Scope — fails closed on ambiguity.
    Runs bind_fd only (no F_P dispatch).

    Returns: jobs considered, failing evaluators per job, total delta.
    """
    worker = _resolve_worker(scope)
    return derive_operational_gaps(
        module=scope.module,
        workspace_root=scope.workspace_root,
        stream=stream,
        worker=worker,
        jobs=_scoped_jobs(scope, worker),
        work_keys=tuple(_resolve_work_keys(scope, stream)),
        requirements=scope.module.metadata.get("requirements", ()),
        workflow_version=scope.workflow_version,
        runtime_identity=scope.runtime_identity,
        runtime_config=scope.runtime_config,
        edge_override=scope.diagnostic_edge_override,
        scope_selector=scope.selector,
        carry_forward=_read_carry_forward(scope),
    )


# ── gen_iterate — internal traversal primitive ───────────────────────────────


@dataclass(frozen=True)
class IterateKernelOutcome:
    result: dict[str, Any]
    basis: ExecutionBasis
    transition: AdvancementTransition


def _iterate_kernel_outcome(
    scope: Scope,
    stream: EventStream,
    *,
    jobs_override: list[ExecutableJob] | None = None,
) -> IterateKernelOutcome:
    worker = _resolve_worker(scope)
    jobs = list(jobs_override) if jobs_override is not None else _scoped_jobs(scope, worker)
    basis = _execution_basis_for_scope(scope, jobs=jobs)

    if not jobs:
        result = {"status": "nothing_to_do", "reason": "no jobs in scope"}
        transition = TerminalTransition(
            basis=basis,
            terminal_kind="nothing_to_do",
            reason=result["reason"],
        )
        return IterateKernelOutcome(result=result, basis=basis, transition=transition)

    plan = plan_next_traversal(
        module=scope.module,
        workspace_root=scope.workspace_root,
        stream=stream,
        worker=worker,
        jobs=jobs,
        work_keys=tuple(_resolve_work_keys(scope, stream)),
        requirements=scope.module.metadata.get("requirements", ()),
        workflow_version=scope.workflow_version,
        runtime_identity=scope.runtime_identity,
        build=scope.build,
        edge_filter=scope.diagnostic_edge_override,
        run_id=scope.run_id,
        runtime_config=scope.runtime_config,
        asset_binding_contract=scope.asset_binding_contract,
        carry_forward=_read_carry_forward(scope),
    )
    if plan.traversal is None or plan.runtime is None:
        result = dict(plan.result)
        transition = _transition_from_plan_result(basis, result)
        return IterateKernelOutcome(result=result, basis=basis, transition=transition)

    outcome = traverse(plan.traversal, runtime=plan.runtime, surface=WorkSurface())
    result = dict(outcome.result)
    if outcome.basis is None or outcome.transition is None:
        raise RuntimeError(
            "iterated traversal outcome must carry typed runtime basis and transition"
        )
    return IterateKernelOutcome(
        result=result,
        basis=outcome.basis,
        transition=outcome.transition,
    )


def gen_iterate(
    scope: Scope,
    stream: EventStream,
    *,
    jobs_override: list[ExecutableJob] | None = None,
) -> dict:
    """
    Internal one-step traversal primitive beneath `/gen-start`.

    The most important command to keep pure.
    One Job. One contract boundary. One iterate call.
    When work_keys are active, selects the first unconverged (job, work_key) pair.
    """
    outcome = _iterate_kernel_outcome(scope, stream, jobs_override=jobs_override)
    result = dict(outcome.result)
    attach_runtime_carrier_metadata(result, outcome.basis, outcome.transition)
    return result


# ── gen_start — state machine ──────────────────────────────────────────────────

def gen_start(
    intent: StartIntent,
    stream: EventStream,
) -> dict:
    """
    /gen-start = normalize one start intent into one lawful advancement result.

    Control modes and adapter spellings live above this function. The named
    composition owns traversal request truth only.
    """
    scope = intent.scope
    worker = _resolve_worker(scope)
    jobs = _resolve_start_jobs(scope, worker, intent.target)
    if isinstance(jobs, dict):
        result = dict(jobs)
        basis = _execution_basis_for_scope(scope, intent=intent, jobs=None)
        transition = TerminalTransition(
            basis=basis,
            terminal_kind="gap_stop",
            reason=result.get("reason"),
        )
        _attach_target_metadata(result, intent.target)
        result["until"] = intent.until
        result["stop_predicate"] = stop_predicate_from_transition(transition)
        attach_runtime_carrier_metadata(result, basis, transition)
        return result

    basis = _execution_basis_for_scope(scope, intent=intent, jobs=jobs)
    state = derive_operational_state(
        workspace_root=scope.workspace_root,
        stream=stream,
        module=scope.module,
        worker=worker,
        jobs=jobs,
        work_keys=tuple(_resolve_work_keys(scope, stream)),
        requirements=scope.module.metadata.get("requirements", ()),
        workflow_version=scope.workflow_version,
        edge_filter=scope.diagnostic_edge_override,
        carry_forward=_read_carry_forward(scope),
    )
    state_transition = terminal_transition_from_operational_state(basis, state)

    if state_transition is not None and state_transition.terminal_kind == "converged":
        _close_completed_features(scope, stream, target=intent.target)
        result = {
            "status": "converged",
            "message": state_transition.reason,
            "until": intent.until,
        }
        result["stop_predicate"] = stop_predicate_from_transition(state_transition)
        _attach_target_metadata(result, intent.target)
        attach_runtime_carrier_metadata(result, basis, state_transition)
        return result

    if state_transition is not None and state_transition.terminal_kind == "nothing_to_do":
        result = {
            "status": "nothing_to_do",
            "reason": state_transition.reason or "",
            "until": intent.until,
        }
        result["stop_predicate"] = stop_predicate_from_transition(state_transition)
        _attach_target_metadata(result, intent.target)
        attach_runtime_carrier_metadata(result, basis, state_transition)
        return result

    iterate_outcome = _iterate_kernel_outcome(scope, stream, jobs_override=jobs)
    result = dict(iterate_outcome.result)
    result["until"] = intent.until
    transition = iterate_outcome.transition
    result["stop_predicate"] = stop_predicate_from_transition(transition)
    _attach_target_metadata(result, intent.target)
    attach_runtime_carrier_metadata(
        result,
        replace(iterate_outcome.basis, start_intent=intent),
        transition,
    )
    return result


def _execution_basis_for_scope(
    scope: Scope,
    *,
    intent: StartIntent | None = None,
    jobs: list[ExecutableJob] | None = None,
) -> ExecutionBasis:
    executable_job = jobs[0] if jobs and len(jobs) == 1 else None
    return ExecutionBasis(
        workspace_root=scope.workspace_root,
        executable_job=executable_job,
        runtime_identity=scope.runtime_identity,
        workflow_version=scope.workflow_version,
        start_intent=intent,
        run_id=scope.run_id,
        work_key=scope.work_key,
    )

def _transition_from_plan_result(
    basis: ExecutionBasis,
    result: dict[str, Any],
) -> AdvancementTransition:
    status = str(result.get("status") or "")
    reason = str(result.get("reason") or "") or None
    if status == "converged":
        return TerminalTransition(basis=basis, terminal_kind="converged", reason=reason)
    if status == "nothing_to_do":
        return TerminalTransition(basis=basis, terminal_kind="nothing_to_do", reason=reason)
    if status == "blocked":
        return TerminalTransition(basis=basis, terminal_kind="gap_stop", reason=reason)
    if status == "in_progress":
        return TerminalTransition(basis=basis, terminal_kind="traversal_applied", reason=reason)
    return TerminalTransition(basis=basis, terminal_kind="traversal_applied", reason=reason)


# ── internal helpers ──────────────────────────────────────────────────────────

def _resolve_worker(scope: Scope) -> Worker:
    """
    Resolve the worker for the given scope.

    Domain-blind: scope.worker must be explicitly supplied by the caller.
    The CLI resolves worker from --worker flag or .genesis/genesis.yml.
    """
    if scope.worker is None:
        raise RuntimeError(
            "scope.worker is None — supply worker via Scope(worker=...) "
            "or configure .genesis/genesis.yml (written by gen-install.py)"
        )
    return scope.worker


def _scoped_jobs(scope: Scope, worker: Worker) -> list[ExecutableJob]:
    """
    Return jobs from worker.can_execute, filtered by scope overrides.

    diagnostic edge override: exact match on job.vector.name — narrows which
    jobs run for internal/debug traversal.

    work-key scope: existence validation only.
      Single-trajectory scope — Jobs are not tagged by work_key.
      work_key:FEAT-CORE validates that feature exists in the workspace;
      it does not narrow which jobs run (all jobs cover the single trajectory).
      Unknown work_key → empty list (fails closed; caller reports error).
    """
    jobs = list(worker.can_execute)

    if scope.selector.kind == "work_key":
        known = _known_feature_ids(scope.workspace_root)
        if scope.selector.work_key not in known:
            return []  # fail closed — unknown feature

    if scope.diagnostic_edge_override:
        jobs = [j for j in jobs if j.vector.name == scope.diagnostic_edge_override]

    return jobs


def _resolve_start_jobs(
    scope: Scope,
    worker: Worker,
    target: StartTarget,
) -> list[ExecutableJob] | dict:
    jobs = _scoped_jobs(scope, worker)
    if target.kind == "next":
        return jobs

    filtered = [
        job
        for job in jobs
        if job.graph_function is not None and job.graph_function.id == target.target_id
    ]
    if not filtered:
        return {
            "status": "error",
            "reason": (
                f"no executable semantic job in scope is bound to start target "
                f"{target.public_ref()!r}"
            ),
        }

    semantic_job_ids = {job.job.id for job in filtered}
    if len(semantic_job_ids) > 1:
        semantic_job_names = sorted({job.job.name for job in filtered})
        return {
            "status": "error",
            "reason": (
                f"start target {target.public_ref()!r} is bound by multiple semantic jobs "
                f"in scope: {semantic_job_names}"
            ),
        }
    return filtered


def _attach_target_metadata(result: dict[str, Any], target: StartTarget) -> None:
    result["target"] = target.public_ref()
    if target.kind in {"graph_function", "asset"}:
        result["target_id"] = target.target_id
        result["graph_function_name"] = target.graph_function_name
    if target.kind == "asset":
        result["asset_id"] = target.asset_id
        result["asset_uri"] = target.asset_uri
        if target.asset_relative_path is not None:
            result["asset_relative_path"] = target.asset_relative_path
        if target.asset_path_kind is not None:
            result["asset_path_kind"] = target.asset_path_kind
        if target.asset_exists is not None:
            result["asset_exists"] = target.asset_exists
        if target.binding_source is not None:
            result["asset_binding_source"] = target.binding_source


def _selected_feature_work_keys_for_completion(
    scope: Scope,
    *,
    target: StartTarget,
    active_feature_keys: set[str],
) -> set[str]:
    if target.kind != "next":
        return set()
    scoped_work_key = scope.work_key
    if scoped_work_key is None and scope.selector.kind == "work_key":
        scoped_work_key = scope.selector.work_key
    if scoped_work_key is None:
        return set(active_feature_keys)
    return {
        key
        for key in active_feature_keys
        if key == scoped_work_key or scoped_work_key.startswith(key + "/")
    }


def _close_completed_features(
    scope: Scope,
    stream: EventStream,
    *,
    target: StartTarget,
) -> None:
    """
    Emit feature-completion runtime truth for active feature work keys.

    Runtime completion is event-owned. Feature YAML location is no longer the
    authoritative signal for whether a work_key remains active.
    """
    active_dir = scope.workspace_root / ".ai-workspace" / "features" / "active"
    if not active_dir.exists():
        return
    active_feature_keys = {yml.stem for yml in sorted(active_dir.glob("*.yml"))}
    eligible_feature_keys = _selected_feature_work_keys_for_completion(
        scope,
        target=target,
        active_feature_keys=active_feature_keys,
    )
    if not eligible_feature_keys:
        return
    existing_completed = completed_feature_keys(stream.all_events())
    for work_key in sorted(eligible_feature_keys):
        if work_key in existing_completed:
            continue
        yml = active_dir / f"{work_key}.yml"
        emit(
            "feature_completed",
            {
                "work_key": work_key,
                "feature_id": work_key,
                "feature_path": str(yml.relative_to(scope.workspace_root)),
            },
            stream=stream,
            context=EventContext(
                workflow_version=scope.workflow_version,
                work_key=work_key,
            ),
        )


def _known_feature_ids(workspace_root: Path) -> set[str]:
    """Return feature IDs from YAML filenames in .ai-workspace/features/."""
    features_dir = workspace_root / ".ai-workspace" / "features"
    ids: set[str] = set()
    for subdir in ("active", "completed"):
        d = features_dir / subdir
        if d.exists():
            ids.update(f.stem for f in d.glob("*.yml"))
    return ids
