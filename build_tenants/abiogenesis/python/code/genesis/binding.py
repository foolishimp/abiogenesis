# Implements: REQ-R-ABG3-JOB-WORKER
# Implements: REQ-R-ABG3-BINDING
# Implements: REQ-R-ABG3-WORKER
# Implements: REQ-R-ABG3-PROVENANCE
# Implements: REQ-R-ABG3-CORRECTION
# Implements: REQ-R-ABG3-CONVERGENCE
"""
binding — Executable job resolution, deterministic precomputation, and capability model.

ExecutableJob, WorkSurface, Worker, ContextResolver,
PrecomputedManifest, bind_fd, bind_fp, bind_fh, bind_fp_certified,
run_fd_evaluator, select_relevant_contexts, render_delta.
"""
from __future__ import annotations

import hashlib
import importlib
import json as _json
import os
import re
import shlex
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, Literal, TypeAlias

from gtl.function_model import GraphFunction
from gtl.graph import Attrs, Graph, GraphVector, Node, Context, node_contract_key, _schema_key
from gtl.module_model import Module
from gtl.obligation_ledger import (
    OBLIGATION_LEDGER_DECLARATION_KEY,
    coerce_obligation_ledger_declaration,
    declared_fulfillment_obligation,
    validate_declared_fulfillment_obligations,
)
from gtl.operator_model import Evaluator, F_D, F_H, F_P
from gtl.work_model import Job as GtlJob, Role, ContractRef

from .correction import find_latest_reset
from .events import EventStream
from .fulfillment_ledger import (
    latest_fp_assessed_event,
    obligation_for_evaluator,
    resolve_published_fulfillment_ledger,
)
from .materialization import MaterializationRequest, materialize_graph_function
from .projection import project


# ── WorkSurface ────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class WorkSurface:
    """
    Immutable execution dossier — structured side-effect product of execution.

    events:            control surface — appended to event log.
    artifacts:         trace surface — evidence file paths.
    context_consumed:  provenance — Contexts read during execution.
    context_emitted:   provenance — Contexts emitted during execution.
    findings:          structured findings derived during execution.
    attestations:      structured attestations derived during execution.
    metadata:          realized output-side runtime metadata only.
    """
    events: tuple[dict, ...] = ()
    artifacts: tuple[str, ...] = ()
    context_consumed: tuple[Context, ...] = ()
    context_emitted: tuple[Context, ...] = ()
    findings: tuple[dict, ...] = ()
    attestations: tuple[dict, ...] = ()
    metadata: Attrs = field(default_factory=Attrs)

    def __post_init__(self) -> None:
        object.__setattr__(self, "metadata", Attrs.coerce(self.metadata))

    def is_auditable(self) -> bool:
        return bool(
            self.artifacts
            or self.events
            or self.findings
            or self.attestations
        )


# ── ExecutableJob ────────────────────────────────────────────────────────────

@dataclass
class ExecutableJob:
    """
    ABG runtime realization of a GTL Job over one internal GraphVector.

    Public semantic work binds published GraphFunction carriers.
    The runtime materializes that graph function, then traverses internal vectors.
    Source/target are Nodes (typed loci with markov conditions).
    The type signature is the worker capability discriminator.

    Invariant: vector.evaluators must not be empty (Bootloader §XVII).
    """
    job: GtlJob
    graph_function: GraphFunction | None
    materialization_id: str | None
    vector: GraphVector

    def __post_init__(self):
        if not self.vector.evaluators:
            raise ValueError(
                f"ExecutableJob '{self.vector.name}': evaluators must not be empty "
                f"(Bootloader §XVII invariant)"
            )
        if self.job.contracts:
            if any(ref.kind != "graph_function" for ref in self.job.contracts):
                raise ValueError(
                    "ExecutableJob requires GTL job contracts over published graph functions"
                )
            if self.graph_function is None:
                raise ValueError(
                    "ExecutableJob with GTL job contracts requires a resolved GraphFunction carrier"
                )
            contract_ids = {ref.target_id for ref in self.job.contracts}
            if self.graph_function.id not in contract_ids:
                raise ValueError(
                    f"ExecutableJob graph function {self.graph_function.name!r} is not bound by job "
                    f"{self.job.name!r}"
                )

    @property
    def evaluators(self) -> tuple:
        """Evaluators come from the GraphVector — no duplicate surface."""
        return self.vector.evaluators

    @property
    def source_type(self) -> Node | tuple[Node, ...]:
        """Input type — what this job reads."""
        return self.vector.source

    @property
    def target_type(self) -> Node:
        """Output type — what this job writes. Uniquely identifies write territory."""
        return self.vector.target


def declared_obligation_ledger_policy_for_job(job: ExecutableJob) -> dict[str, Any] | None:
    fp_evaluators = tuple(evaluator for evaluator in job.evaluators if evaluator.regime is F_P)
    if not fp_evaluators:
        return None
    raw_policy = job.vector.declarations.get(OBLIGATION_LEDGER_DECLARATION_KEY)
    policy = coerce_obligation_ledger_declaration(raw_policy)
    if policy is None:
        raise ValueError(
            f"ExecutableJob {job.vector.name!r} declares F_P evaluators but no "
            "GraphVector obligation_ledger declaration"
        )
    return policy


def _import_obligation_ledger_adapter(adapter_ref: str) -> Any:
    if ":" not in adapter_ref:
        raise ValueError(
            f"obligation_ledger.adapter_ref must use MODULE:SYMBOL form, got {adapter_ref!r}"
        )
    module_name, _, symbol_name = adapter_ref.partition(":")
    module = importlib.import_module(module_name)
    try:
        return getattr(module, symbol_name)
    except AttributeError as exc:
        raise ValueError(
            f"obligation_ledger.adapter_ref {adapter_ref!r} does not resolve to a symbol"
        ) from exc


def _materialized_dynamic_obligation_entries(
    job: ExecutableJob,
    *,
    policy: dict[str, Any],
    workspace_root: Path | None,
) -> list[dict[str, Any]]:
    if workspace_root is None:
        raise ValueError(
            f"ExecutableJob {job.vector.name!r} requires workspace_root to materialize an adapter-driven obligation_ledger"
        )
    adapter_ref = str(policy.get("adapter_ref") or "")
    adapter = _import_obligation_ledger_adapter(adapter_ref)
    materialized = (
        adapter(Path(workspace_root), dict(policy), edge_name=job.vector.name)
        if callable(adapter)
        else adapter
    )
    if not isinstance(materialized, dict):
        raise ValueError(
            f"obligation_ledger adapter {adapter_ref!r} must materialize to an object"
        )
    raw_obligations = materialized.get("obligations")
    if not isinstance(raw_obligations, list) or not raw_obligations:
        raise ValueError(
            f"obligation_ledger adapter {adapter_ref!r} materialized no obligations for edge {job.vector.name!r}"
        )
    return [dict(entry) for entry in raw_obligations if isinstance(entry, dict)]


def declared_fulfillment_obligations_for_job(
    job: ExecutableJob,
    *,
    workspace_root: Path | None = None,
) -> list[dict[str, Any]]:
    policy = declared_obligation_ledger_policy_for_job(job)
    if policy is None:
        return []
    declaration_family = str(policy.get("declaration_family") or "static_obligations")
    if declaration_family == "adapter_driven":
        raw_entries = _materialized_dynamic_obligation_entries(
            job,
            policy=policy,
            workspace_root=workspace_root,
        )
    else:
        raw_entries = [dict(entry) for entry in policy.get("obligations", ())]
    obligations: list[dict[str, Any]] = []
    for index, entry in enumerate(raw_entries):
        if not isinstance(entry, dict):
            raise ValueError(
                f"materialized obligation_ledger.obligations[{index}] must be an object"
            )
        obligations.append(
            declared_fulfillment_obligation(
                entry.get("id"),
                evaluator=entry.get("evaluator") or entry.get("id"),
                statement=entry.get("statement", ""),
                source_kind=entry.get("source_kind", policy.get("obligation_source_kind", "declared_obligation_ledger")),
                source_refs=entry.get("source_refs", ()),
            )
        )
    validate_declared_fulfillment_obligations(
        obligations,
        field="materialized obligation_ledger.obligations",
    )
    return obligations


def module_to_executable_jobs(module: Module) -> list[ExecutableJob]:
    """
    Resolve Module's GTL Jobs to ExecutableJobs.

    Each Job's ContractRef is resolved to a published GraphFunction by id.
    The GraphFunction is materialized and each realized GraphVector becomes one
    executable internal traversal boundary.
    Module.jobs must be populated — no auto-derivation.
    """
    if not module.jobs:
        raise ValueError(
            f"Module {module.name!r} has no explicit jobs. "
            f"All modules must declare jobs with ContractRef bindings."
        )

    gf_by_id: dict[str, GraphFunction] = {}
    for graph_function in module.graph_functions:
        gf_by_id[graph_function.id] = graph_function

    executable_jobs: list[ExecutableJob] = []
    for gtl_job in module.jobs:
        for ref in gtl_job.contracts:
            if ref.kind != "graph_function":
                raise ValueError(
                    f"Unsupported contract kind {ref.kind!r} in job {gtl_job.name!r}. "
                    "This build supports 'graph_function' only."
                )
            graph_function = gf_by_id.get(ref.target_id)
            if graph_function is None:
                raise ValueError(
                    f"ContractRef target_id {ref.target_id!r} in job {gtl_job.name!r} "
                    f"does not resolve to any published GraphFunction in the module."
                )
            record = materialize_graph_function(
                MaterializationRequest(graph_function=graph_function.name),
                module,
                published_graph_functions=(graph_function,),
            )
            for vector in record.graph.vectors:
                executable_jobs.append(
                    ExecutableJob(
                        job=gtl_job,
                        graph_function=graph_function,
                        materialization_id=record.materialization_id,
                        vector=vector,
                    )
                )
    return executable_jobs


# ── Worker ───────────────────────────────────────────────────────────────────

@dataclass
class Worker:
    """
    Concrete actor identity with executable capability.

    Scheduling rule:
        workers with disjoint writable_types run in parallel (safe)
        workers with overlapping writable_types must serialise (conflict)
    """
    id: str
    can_execute: list[ExecutableJob] = field(default_factory=list)
    role_ids: tuple[str, ...] = ()
    authority_ref: str | None = None

    def __post_init__(self):
        if not self.can_execute:
            raise ValueError(f"Worker '{self.id}': can_execute must not be empty")

    @property
    def writable_types(self) -> set[str]:
        """Target asset type names — this worker's write territory."""
        return {j.target_type.name for j in self.can_execute}

    @property
    def readable_types(self) -> set[str]:
        """Source asset type names — what this worker consumes."""
        result: set[str] = set()
        for j in self.can_execute:
            src = j.source_type
            if isinstance(src, tuple):
                result.update(a.name for a in src)
            else:
                result.add(src.name)
        return result

    def conflicts_with(self, other: Worker) -> bool:
        """True if serialisation is required — overlapping write territory."""
        return bool(self.writable_types & other.writable_types)

    def is_eligible(self, job: ExecutableJob) -> bool:
        """
        ADR-030 §5: conjunctive eligibility.

        A worker may lawfully realize a job only when:
        1. the ExecutableJob is in can_execute
        2. the worker satisfies the job's required roles
        3. authority_ref satisfies external policy (not enforced in this build)

        Returns True if eligible, False otherwise. Fails closed.
        """
        if job not in self.can_execute:
            return False
        if job.job.roles:
            required_role_ids = {r.id for r in job.job.roles}
            if not required_role_ids.issubset(set(self.role_ids)):
                return False
        return True


# ── ContextResolver ──────────────────────────────────────────────────────────

class ContextResolver:
    """
    Loads Context content by locator scheme + verifies digest.

    Schemes:
      workspace:// — local file or directory relative to workspace root
      git://        — NOT YET IMPLEMENTED
      event://      — NOT YET IMPLEMENTED
      registry://   — NOT YET IMPLEMENTED
    """

    def __init__(self, workspace_root: Path) -> None:
        self.workspace_root = workspace_root

    def load(self, ctx: Context) -> str:
        """Load context content and verify digest."""
        scheme = ctx.locator.split("://")[0]
        dispatch = {
            "workspace": self._load_workspace,
            "git":       self._load_git,
            "event":     self._load_event,
            "registry":  self._load_registry,
        }
        loader = dispatch.get(scheme)
        if loader is None:
            raise ValueError(f"Unknown context scheme: {scheme!r} in {ctx.locator!r}")

        content = loader(ctx.locator)
        self._verify_digest(ctx, content)
        return content

    def _load_workspace(self, locator: str) -> str:
        path_str = locator[len("workspace://"):]
        path = self.workspace_root / path_str

        if path.is_dir():
            parts: list[str] = []
            for pattern in ("*.md", "*.py", "*.txt", "*.yml"):
                for f in sorted(path.rglob(pattern)):
                    parts.append(f"# {f.relative_to(self.workspace_root)}")
                    parts.append(f.read_text(encoding="utf-8"))
                    parts.append("")
            if not parts:
                raise FileNotFoundError(
                    f"Context directory exists but contains no readable files: {path}"
                )
            return "\n".join(parts)

        if path.is_file():
            return path.read_text(encoding="utf-8")

        raise FileNotFoundError(f"Required context not found: {path}")

    def _load_git(self, locator: str) -> str:
        raise NotImplementedError(
            f"git:// context loading is not yet implemented: {locator!r}"
        )

    def _load_event(self, locator: str) -> str:
        raise NotImplementedError(
            f"event:// context loading is not yet implemented: {locator!r}"
        )

    def _load_registry(self, locator: str) -> str:
        raise NotImplementedError(
            f"registry:// context loading is not yet implemented: {locator!r}"
        )

    def _verify_digest(self, ctx: Context, content: str) -> None:
        """Verify sha256 digest. PENDING digests (all zeros) are skipped."""
        pending = "sha256:" + "0" * 64
        if ctx.digest == pending:
            return

        actual = "sha256:" + hashlib.sha256(content.encode("utf-8")).hexdigest()
        if actual != ctx.digest:
            raise ValueError(
                f"Context digest mismatch for {ctx.name!r}:\n"
                f"  expected: {ctx.digest}\n"
                f"  actual:   {actual}\n"
                "Replay integrity violation — context content has changed."
            )


# ── Runtime Environment ──────────────────────────────────────────────────────


@dataclass(frozen=True)
class ResolvedEnvironmentBinding:
    """
    One runtime binding visible at an executable contract boundary.

    produced_within_carrier distinguishes bindings that must be replay-derived
    from the current carrier from external/root inputs that remain authoritative
    entry conditions.
    """
    node: Node
    projection: dict[str, Any]
    required: bool = False
    provided: bool = False
    produced_within_carrier: bool = False
    required_sources: tuple[str, ...] = ()

    @property
    def display_status(self) -> str:
        status = str(self.projection.get("status", "unknown"))
        if not self.produced_within_carrier and status == "not_started":
            return "external_authority"
        return status


@dataclass(frozen=True)
class ResolvedEnvironment:
    """
    Runtime-resolved cumulative environment snapshot for one executable job.

    requires/provides describe the local execution boundary for the live vector.
    carries preserves the larger published carrier closure when available.
    """
    requires: tuple[Node, ...] = ()
    provides: tuple[Node, ...] = ()
    carries: tuple[Node, ...] = ()
    bindings: tuple[ResolvedEnvironmentBinding, ...] = ()
    vector_source_required_contexts: tuple[str, ...] = ()
    asset_surface_required_contexts: tuple[str, ...] = ()
    asset_surface_injected_required_contexts: tuple[str, ...] = ()
    missing_required: tuple[str, ...] = ()
    missing_asset_surface_contexts: tuple[str, ...] = ()
    conflicting_contracts: tuple[str, ...] = ()

    @classmethod
    def empty(cls) -> "ResolvedEnvironment":
        return cls()

    @property
    def ready(self) -> bool:
        return (
            not self.missing_required
            and not self.missing_asset_surface_contexts
            and not self.conflicting_contracts
        )

    def summary_lines(self) -> list[str]:
        lines: list[str] = []
        if self.asset_surface_injected_required_contexts:
            lines.append(
                "effective runtime boundary includes asset_surface-injected required bindings: "
                + ", ".join(self.asset_surface_injected_required_contexts)
            )
        if self.missing_required:
            lines.append(
                "missing internally produced required bindings: "
                + ", ".join(self.missing_required)
            )
        if self.missing_asset_surface_contexts:
            lines.append(
                "target asset_surface requires undeclared carried contexts: "
                + ", ".join(self.missing_asset_surface_contexts)
            )
        if self.conflicting_contracts:
            lines.append(
                "conflicting carried binding contracts: "
                + ", ".join(self.conflicting_contracts)
            )
        return lines


@dataclass(frozen=True)
class TargetAssetBinding:
    """Concrete workspace binding for a named asset/node when discoverable."""

    asset_id: str
    uri: str
    relative_path: str | None = None
    path_kind: str | None = None
    exists: bool | None = None
    generated_asset_contract: dict[str, Any] | None = None
    binding_source: str = "workspace_asset_query"

    def to_dict(self) -> dict[str, Any]:
        data = {
            "asset_id": self.asset_id,
            "uri": self.uri,
            "relative_path": self.relative_path,
            "path_kind": self.path_kind,
            "exists": self.exists,
            "binding_source": self.binding_source,
        }
        if self.generated_asset_contract is not None:
            data["generated_asset_contract"] = dict(self.generated_asset_contract)
        return data


@dataclass(frozen=True)
class AssetBindingQueryContract:
    command: tuple[str, ...]
    assets_key: str
    asset_id_key: str
    uri_key: str
    relative_path_key: str
    path_kind_key: str
    exists_key: str
    timeout_seconds: int
    binding_source: str
    explicit: bool
    pythonpath_entries: tuple[str, ...] = ()


ASSET_BINDING_QUERY_TIMEOUT_SECONDS: int = int(
    os.environ.get("ASSET_BINDING_QUERY_TIMEOUT_SECONDS", "15")
)


def _coerce_command_tokens(raw: Any, *, label: str) -> list[str]:
    if isinstance(raw, str):
        tokens = shlex.split(raw)
    elif isinstance(raw, (list, tuple)) and all(isinstance(token, str) for token in raw):
        tokens = list(raw)
    else:
        raise ValueError(f"{label} must be a shell-like string or list[str]")
    if not tokens:
        raise ValueError(f"{label} must not be empty")
    return tokens


def _coerce_mapping_or_json_object(raw: Any, *, label: str) -> dict[str, Any]:
    if isinstance(raw, dict):
        return dict(raw)
    if not isinstance(raw, str) or not raw.strip():
        raise ValueError(f"{label} must be a mapping or JSON object string")
    source = raw.strip()
    if not source.startswith("{"):
        raise ValueError(f"{label} string must be a JSON object")
    try:
        loaded = _json.loads(source)
    except _json.JSONDecodeError as exc:
        raise ValueError(f"{label} JSON string is invalid: {exc}") from exc
    if not isinstance(loaded, dict):
        raise ValueError(f"{label} JSON string must decode to an object")
    return dict(loaded)


def _runtime_pythonpath_entries(
    runtime_config: dict[str, Any] | None,
    *,
    workspace_root: Path | None,
) -> list[str]:
    if workspace_root is None:
        return []
    raw = dict(runtime_config or {}).get("pythonpath")
    if isinstance(raw, str):
        values = [raw]
    elif isinstance(raw, (list, tuple)):
        values = [item for item in raw if isinstance(item, str)]
    else:
        values = []
    entries: list[str] = []
    for value in values:
        stripped = value.strip()
        if not stripped:
            continue
        path = Path(stripped)
        if not path.is_absolute():
            path = (workspace_root / path).resolve()
        entries.append(str(path))
    return entries


def _workspace_command_env(
    *,
    runtime_config: dict[str, Any] | None,
    workspace_root: Path | None,
    pythonpath_entries: Sequence[str] | None = None,
) -> dict[str, str]:
    env = os.environ.copy()
    extra_entries = (
        list(pythonpath_entries)
        if pythonpath_entries is not None
        else _runtime_pythonpath_entries(runtime_config, workspace_root=workspace_root)
    )
    extra = os.pathsep.join(extra_entries)
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = os.pathsep.join(filter(None, [extra, existing]))
    return env


def _bounded_prompt_text(text: str, *, max_chars: int, marker: str) -> str:
    if len(text) <= max_chars:
        return text
    if max_chars <= 0:
        return ""
    suffix = f" {marker}" if marker else ""
    if len(suffix) >= max_chars:
        return suffix[:max_chars]
    body_limit = max_chars - len(suffix)
    body = text[:body_limit].rstrip()
    if not body:
        return suffix.strip()[:max_chars]
    return f"{body}{suffix}"[:max_chars]


def _markdown_heading_sections(text: str) -> list[str]:
    sections: list[list[str]] = []
    current: list[str] = []
    for line in text.splitlines():
        if line.startswith("## ") and current:
            sections.append(current)
            current = [line]
            continue
        current.append(line)
    if current:
        sections.append(current)
    return ["\n".join(section).strip() for section in sections if "\n".join(section).strip()]


def _bounded_markdown_context(text: str, *, max_chars: int, marker: str) -> str:
    if len(text) <= max_chars:
        return text
    sections = _markdown_heading_sections(text)
    if len(sections) < 3:
        return _bounded_prompt_text(text, max_chars=max_chars, marker=marker)
    section_budget = max(120, max_chars // len(sections))
    emitted_sections = [
        _bounded_prompt_text(section, max_chars=section_budget, marker="...")
        for section in sections
    ]
    emitted = "\n\n".join(emitted_sections)
    if len(emitted) <= max_chars:
        return emitted
    return _bounded_prompt_text(emitted, max_chars=max_chars, marker=marker)


@dataclass(frozen=True)
class WorkspaceAssetSnapshot:
    text: str
    relative_path: str
    original_chars: int
    inspection_ref: str


def _read_workspace_asset_snapshot(
    workspace_root: Path,
    relative_path: str,
) -> WorkspaceAssetSnapshot | None:
    """Load source text for a concrete workspace asset binding."""
    path = (workspace_root / relative_path).resolve()
    try:
        path.relative_to(workspace_root.resolve())
    except ValueError:
        return None
    if not path.exists():
        return None

    if path.is_file():
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            return None
        return WorkspaceAssetSnapshot(
            text=text,
            relative_path=relative_path,
            original_chars=len(text),
            inspection_ref=f"workspace://{relative_path}",
        )

    if path.is_dir():
        parts: list[str] = []
        for pattern in ("*.md", "*.txt", "*.py", "*.json", "*.yml", "*.yaml"):
            for asset_file in sorted(path.rglob(pattern)):
                try:
                    content = asset_file.read_text(encoding="utf-8")
                except (OSError, UnicodeDecodeError):
                    continue
                block = (
                    f"# {asset_file.relative_to(workspace_root)}\n"
                    f"{content.rstrip()}\n\n"
                )
                parts.append(block)
        if parts:
            text = "".join(parts).rstrip()
            return WorkspaceAssetSnapshot(
                text=text,
                relative_path=relative_path,
                original_chars=len(text),
                inspection_ref=f"workspace://{relative_path}",
            )
    return None


def _dig_path(payload: Any, dotted_path: str) -> Any:
    current = payload
    for segment in dotted_path.split("."):
        if not isinstance(current, dict) or segment not in current:
            return None
        current = current[segment]
    return current


def _coerce_boolish(value: Any) -> bool | None:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "1", "yes"}:
            return True
        if lowered in {"false", "0", "no"}:
            return False
    return None


def admit_asset_binding_query_contract(
    runtime_config: dict[str, Any] | None,
    *,
    workspace_root: Path | None,
) -> AssetBindingQueryContract | None:
    """Admit one asset-binding query contract from ingress config."""
    config = dict(runtime_config or {})
    explicit = config.get("asset_binding_contract")
    if explicit is not None:
        contract_map = _coerce_mapping_or_json_object(
            explicit,
            label="runtime_config.asset_binding_contract",
        )
        command = tuple(
            _coerce_command_tokens(
                contract_map.get("command"),
                label="runtime_config.asset_binding_contract.command",
            )
        )
        pythonpath_entries = tuple(
            _runtime_pythonpath_entries(runtime_config, workspace_root=workspace_root)
        )
        return AssetBindingQueryContract(
            command=command,
            assets_key=str(contract_map.get("assets_key", "assets")),
            asset_id_key=str(contract_map.get("asset_id_key", "asset_id")),
            uri_key=str(contract_map.get("uri_key", "uri")),
            relative_path_key=str(contract_map.get("relative_path_key", "metadata.relative_path")),
            path_kind_key=str(contract_map.get("path_kind_key", "checkpoint.path_kind")),
            exists_key=str(contract_map.get("exists_key", "checkpoint.exists")),
            timeout_seconds=int(contract_map.get("timeout_seconds", ASSET_BINDING_QUERY_TIMEOUT_SECONDS)),
            binding_source=str(
                contract_map.get("binding_source", "runtime_config.asset_binding_contract")
            ),
            explicit=True,
            pythonpath_entries=pythonpath_entries,
        )

    domain_package = config.get("domain_package")
    if not isinstance(domain_package, str) or not domain_package.strip():
        return None
    return AssetBindingQueryContract(
        command=(
            sys.executable,
            "-m",
            domain_package.strip(),
            "query-domain",
            "--workspace",
            ".",
        ),
        assets_key="assets",
        asset_id_key="asset_id",
        uri_key="uri",
        relative_path_key="metadata.relative_path",
        path_kind_key="checkpoint.path_kind",
        exists_key="checkpoint.exists",
        timeout_seconds=ASSET_BINDING_QUERY_TIMEOUT_SECONDS,
        binding_source="runtime_config.domain_package",
        explicit=False,
        pythonpath_entries=tuple(
            _runtime_pythonpath_entries(runtime_config, workspace_root=workspace_root)
        ),
    )


def resolve_workspace_asset_bindings(
    *,
    workspace_root: Path | None,
    contract: AssetBindingQueryContract | None = None,
) -> dict[str, TargetAssetBinding]:
    """
    Resolve concrete asset bindings from an optional workspace asset query surface.

    When runtime_config provides an explicit asset_binding_contract, failures are
    configuration defects and must fail closed. When only a default domain_package
    query is available, discovery remains best-effort.
    """
    if contract is None:
        return {}
    if workspace_root is None:
        if contract.explicit:
            raise ValueError(
                "runtime_config.asset_binding_contract requires a workspace_root"
            )
        return {}

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
        if contract.explicit:
            raise ValueError(
                f"workspace asset query failed: {exc}"
            ) from exc
        return {}

    if result.returncode != 0:
        if contract.explicit:
            detail = result.stderr.strip() or result.stdout.strip() or f"returncode={result.returncode}"
            raise ValueError(f"workspace asset query failed: {detail}")
        return {}

    try:
        payload = _json.loads(result.stdout)
    except _json.JSONDecodeError as exc:
        if contract.explicit:
            raise ValueError("workspace asset query did not return valid JSON") from exc
        return {}

    assets = _dig_path(payload, contract.assets_key)
    if not isinstance(assets, list):
        if contract.explicit:
            raise ValueError("workspace asset query JSON must expose a list at assets_key")
        return {}

    resolved: dict[str, TargetAssetBinding] = {}
    for entry in assets:
        if not isinstance(entry, dict):
            continue
        asset_id = _dig_path(entry, contract.asset_id_key)
        uri = _dig_path(entry, contract.uri_key)
        if not isinstance(asset_id, str) or not asset_id or not isinstance(uri, str) or not uri:
            continue
        relative_path = _dig_path(entry, contract.relative_path_key)
        path_kind = _dig_path(entry, contract.path_kind_key)
        exists = _coerce_boolish(_dig_path(entry, contract.exists_key))
        generated_asset_contract = entry.get("generated_asset_contract")
        resolved[asset_id] = TargetAssetBinding(
            asset_id=asset_id,
            uri=uri,
            relative_path=relative_path if isinstance(relative_path, str) and relative_path else None,
            path_kind=path_kind if isinstance(path_kind, str) and path_kind else None,
            exists=exists,
            generated_asset_contract=(
                dict(generated_asset_contract)
                if isinstance(generated_asset_contract, dict)
                else None
            ),
            binding_source=contract.binding_source,
        )
    return resolved


def _source_nodes(source: Node | tuple[Node, ...]) -> tuple[Node, ...]:
    return source if isinstance(source, tuple) else (source,)


def _stable_node_union(*values: tuple[Node, ...]) -> tuple[Node, ...]:
    merged: list[Node] = []
    seen_names: set[str] = set()
    for nodes in values:
        for node in nodes:
            if node.name in seen_names:
                continue
            seen_names.add(node.name)
            merged.append(node)
    return tuple(merged)


def _materialized_carrier_graph(
    job: ExecutableJob,
    module: Module | None,
) -> Graph | None:
    if module is None or job.graph_function is None:
        return None
    record = materialize_graph_function(
        MaterializationRequest(graph_function=job.graph_function.name),
        module,
        published_graph_functions=(job.graph_function,),
    )
    return record.graph


def resolve_runtime_environment(
    job: ExecutableJob,
    stream: EventStream,
    *,
    module: Module | None = None,
    work_key: str | None = None,
) -> ResolvedEnvironment:
    """
    Resolve the executable runtime environment for one live vector.

    Local execution requires the vector source contract. The carried closure is
    inherited from the published graph function when present, then widened with
    the live vector boundary. Required bindings produced inside the same carrier
    must be replay-visible before dispatch.
    """
    requires = list(_source_nodes(job.vector.source))
    vector_source_required_contexts = tuple(node.name for node in requires)
    provides = (job.vector.target,)
    published_carries = (
        job.graph_function.environment.carries
        if job.graph_function is not None
        else ()
    )
    carries = _stable_node_union(published_carries, tuple(requires), provides)
    carry_nodes_by_name = {node.name: node for node in carries}

    missing_asset_surface_contexts: list[str] = []
    asset_surface_required_contexts: list[str] = []
    asset_surface_injected_required_contexts: list[str] = []
    required_names = {node.name for node in requires}
    for context_name in job.vector.target.asset_surface.required_contexts:
        if context_name not in asset_surface_required_contexts:
            asset_surface_required_contexts.append(context_name)
        context_node = carry_nodes_by_name.get(context_name)
        if context_node is None:
            if context_name not in missing_asset_surface_contexts:
                missing_asset_surface_contexts.append(context_name)
            continue
        if context_name not in required_names:
            requires.append(context_node)
            required_names.add(context_name)
            asset_surface_injected_required_contexts.append(context_name)
    requires = tuple(requires)

    contract_by_name: dict[str, tuple[str, str, tuple[str, ...]]] = {}
    conflicting_contracts: list[str] = []
    for node in carries:
        contract = node_contract_key(node)
        existing = contract_by_name.get(node.name)
        if existing is None:
            contract_by_name[node.name] = contract
            continue
        if existing != contract and node.name not in conflicting_contracts:
            conflicting_contracts.append(node.name)

    materialized_graph = _materialized_carrier_graph(job, module)
    produced_within_carrier = (
        {vector.target.name for vector in materialized_graph.vectors}
        if materialized_graph is not None
        else set()
    )

    bindings: list[ResolvedEnvironmentBinding] = []
    binding_by_name: dict[str, ResolvedEnvironmentBinding] = {}
    provided_names = {node.name for node in provides}
    for node in carries:
        if node.name in binding_by_name:
            continue
        binding = ResolvedEnvironmentBinding(
            node=node,
            projection=project(stream, node.name, "current", work_key=work_key),
            required=node.name in required_names,
            provided=node.name in provided_names,
            produced_within_carrier=node.name in produced_within_carrier,
            required_sources=tuple(
                source
                for source, enabled in (
                    ("vector_source", node.name in vector_source_required_contexts),
                    ("asset_surface", node.name in asset_surface_required_contexts),
                )
                if enabled
            ),
        )
        bindings.append(binding)
        binding_by_name[node.name] = binding

    missing_required = tuple(
        node.name
        for node in requires
        if node.name not in conflicting_contracts
        and binding_by_name[node.name].produced_within_carrier
        and binding_by_name[node.name].projection.get("status") == "not_started"
    )

    return ResolvedEnvironment(
        requires=requires,
        provides=provides,
        carries=carries,
        bindings=tuple(bindings),
        vector_source_required_contexts=vector_source_required_contexts,
        asset_surface_required_contexts=tuple(asset_surface_required_contexts),
        asset_surface_injected_required_contexts=tuple(asset_surface_injected_required_contexts),
        missing_required=missing_required,
        missing_asset_surface_contexts=tuple(missing_asset_surface_contexts),
        conflicting_contracts=tuple(conflicting_contracts),
    )


# ── Regime binding algebra ───────────────────────────────────────────────────


@dataclass(frozen=True)
class FdBindingOutcome:
    evaluator: Evaluator
    passes: bool
    detail: Any
    kind: Literal["fd"] = "fd"


@dataclass(frozen=True)
class FhBindingOutcome:
    evaluator: Evaluator
    admitted: bool
    admission_required: bool
    ledger_ref: str | None = None
    reason: str | None = None
    kind: Literal["fh"] = "fh"


@dataclass(frozen=True)
class FpCertificationOutcome:
    evaluator: Evaluator
    certified: bool
    certification_scope: str | None = None
    ledger_ref: str | None = None
    reason: str | None = None
    kind: Literal["fp"] = "fp"


RegimeBindingOutcome: TypeAlias = (
    FdBindingOutcome | FhBindingOutcome | FpCertificationOutcome
)


@dataclass(frozen=True)
class RegimeFailureSet:
    fd: tuple[Evaluator, ...] = ()
    fh: tuple[Evaluator, ...] = ()
    fp: tuple[Evaluator, ...] = ()


@dataclass(frozen=True)
class RegimeBindingSet:
    outcomes: tuple[RegimeBindingOutcome, ...] = ()

    def outcome_for(self, evaluator_name: str) -> RegimeBindingOutcome | None:
        for outcome in self.outcomes:
            if outcome.evaluator.name == evaluator_name:
                return outcome
        return None

    def passing_evaluators(self) -> tuple[Evaluator, ...]:
        passing: list[Evaluator] = []
        for outcome in self.outcomes:
            if isinstance(outcome, FdBindingOutcome) and outcome.passes:
                passing.append(outcome.evaluator)
            elif isinstance(outcome, FhBindingOutcome) and outcome.admitted:
                passing.append(outcome.evaluator)
            elif isinstance(outcome, FpCertificationOutcome) and outcome.certified:
                passing.append(outcome.evaluator)
        return tuple(passing)

    def failing_evaluators(self) -> tuple[Evaluator, ...]:
        failing: list[Evaluator] = []
        for outcome in self.outcomes:
            if isinstance(outcome, FdBindingOutcome) and not outcome.passes:
                failing.append(outcome.evaluator)
            elif isinstance(outcome, FhBindingOutcome) and not outcome.admitted:
                failing.append(outcome.evaluator)
            elif isinstance(outcome, FpCertificationOutcome) and not outcome.certified:
                failing.append(outcome.evaluator)
        return tuple(failing)

    def failures(self) -> RegimeFailureSet:
        fd: list[Evaluator] = []
        fh: list[Evaluator] = []
        fp: list[Evaluator] = []
        for outcome in self.outcomes:
            if isinstance(outcome, FdBindingOutcome):
                if not outcome.passes:
                    fd.append(outcome.evaluator)
                continue
            if isinstance(outcome, FhBindingOutcome):
                if not outcome.admitted:
                    fh.append(outcome.evaluator)
                continue
            if not outcome.certified:
                fp.append(outcome.evaluator)
        return RegimeFailureSet(fd=tuple(fd), fh=tuple(fh), fp=tuple(fp))

    def fd_results(self) -> dict[str, Any]:
        return {
            outcome.evaluator.name: {
                "passes": outcome.passes,
                "detail": outcome.detail,
            }
            for outcome in self.outcomes
            if isinstance(outcome, FdBindingOutcome)
        }


def regime_binding_set_from_evaluator_partitions(
    *,
    failing: Iterable[Evaluator] = (),
    passing: Iterable[Evaluator] = (),
    fd_results: dict[str, Any] | None = None,
) -> RegimeBindingSet:
    """Build typed regime truth from explicit evaluator partitions.

    This is for tests and adapter fixtures that do not run the F_D binder.
    Runtime code must publish the resulting RegimeBindingSet, never retain the
    input partitions as an independent authority.
    """
    fd_results = fd_results or {}
    passing_tuple = tuple(passing)
    failing_tuple = tuple(failing)
    overlap = {ev.name for ev in passing_tuple} & {ev.name for ev in failing_tuple}
    if overlap:
        raise ValueError(
            "regime binding partitions must not declare the same evaluator as passing and failing: "
            + ", ".join(sorted(overlap))
        )
    outcomes: list[RegimeBindingOutcome] = []
    for ev in passing_tuple:
        if ev.regime is F_D:
            outcomes.append(FdBindingOutcome(ev, passes=True, detail=fd_results.get(ev.name, {})))
        elif ev.regime is F_H:
            outcomes.append(FhBindingOutcome(ev, admitted=True, admission_required=True))
        elif ev.regime is F_P:
            outcomes.append(FpCertificationOutcome(ev, certified=True))
    for ev in failing_tuple:
        if ev.regime is F_D:
            outcomes.append(FdBindingOutcome(ev, passes=False, detail=fd_results.get(ev.name, {})))
        elif ev.regime is F_H:
            outcomes.append(
                FhBindingOutcome(
                    ev,
                    admitted=False,
                    admission_required=True,
                    reason="fixture_declared_open",
                )
            )
        elif ev.regime is F_P:
            outcomes.append(
                FpCertificationOutcome(
                    ev,
                    certified=False,
                    reason="fixture_declared_open",
                )
            )
    return RegimeBindingSet(outcomes=tuple(outcomes))


# ── PrecomputedManifest and BoundJob ─────────────────────────────────────────

@dataclass
class PrecomputedManifest:
    """
    F_D pre-computation output. The residual gap.

    passing_evaluators are NEVER included in the F_P prompt.
    """
    executable_job: ExecutableJob
    current_asset: dict
    regime_bindings: RegimeBindingSet
    fd_results: dict[str, Any]
    relevant_contexts: dict[str, str]
    resolved_environment: ResolvedEnvironment = field(default_factory=ResolvedEnvironment.empty)
    missing_contexts: list[str] = field(default_factory=list)
    delta_summary: str = ""

    def __post_init__(self) -> None:
        self.regime_binding_truth()

    def regime_binding_truth(self) -> RegimeBindingSet:
        if not isinstance(self.regime_bindings, RegimeBindingSet):
            raise ValueError("PrecomputedManifest requires RegimeBindingSet carrier truth")
        return self.regime_bindings

    @property
    def failing_evaluators(self) -> tuple[Evaluator, ...]:
        return self.regime_binding_truth().failing_evaluators()

    @property
    def passing_evaluators(self) -> tuple[Evaluator, ...]:
        return self.regime_binding_truth().passing_evaluators()

    @property
    def has_gap(self) -> bool:
        return bool(self.failing_evaluators) or not self.resolved_environment.ready

    @property
    def unresolved_count(self) -> int:
        return len(self.failing_evaluators) + (0 if self.resolved_environment.ready else 1)

    @property
    def delta(self) -> float:
        total = len(self.executable_job.evaluators)
        if total == 0:
            return 0.0
        return self.unresolved_count / total


@dataclass(frozen=True)
class PromptCompactionRecord:
    """Closed prompt-budget record published into manifests and events."""

    surface: str
    reason: str
    size_unit: Literal["chars", "items", "bindings"]
    original_size: int
    emitted_size: int
    budget_size: int
    inspection_ref: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "surface": self.surface,
            "reason": self.reason,
            "size_unit": self.size_unit,
            "original_size": self.original_size,
            "emitted_size": self.emitted_size,
            "budget_size": self.budget_size,
            "inspection_ref": self.inspection_ref,
        }


@dataclass(frozen=True)
class PromptSection:
    """One rendered prompt section and the compaction records it caused."""

    name: str
    text: str
    compactions: tuple[PromptCompactionRecord, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "emitted_chars": len(self.text),
            "prompt_compactions": [
                record.to_dict() for record in self.compactions
            ],
        }


@dataclass(frozen=True)
class PromptAssembly:
    """Admitted F_P prompt interface: emitted text plus prompt-budget truth."""

    prompt: str
    compactions: tuple[PromptCompactionRecord, ...] = ()
    sections: tuple[PromptSection, ...] = ()

    def prompt_compactions(self) -> list[dict[str, Any]]:
        return [record.to_dict() for record in self.compactions]

    def to_dict(self) -> dict[str, Any]:
        return {
            "sections": [section.to_dict() for section in self.sections],
            "prompt_compactions": self.prompt_compactions(),
        }


@dataclass
class BoundJob:
    """Implementation helper — an executable job with resolved context, ready for F_P dispatch."""
    executable_job: ExecutableJob
    precomputed: PrecomputedManifest
    prompt_assembly: PromptAssembly
    result_path: str = ""
    manifest_id: str = ""
    worker_id: str = ""
    role_id: str = ""
    authority_ref: str = ""
    selected_worker_id: str = ""
    selected_backend: str = ""
    assignment_source: str = ""
    resolved_runtime_ref: str = ""
    target_asset_binding: dict[str, Any] | None = None
    environment_asset_bindings: dict[str, dict[str, Any]] = field(default_factory=dict)
    target_asset_surface: dict[str, Any] | None = None
    environment_asset_surfaces: dict[str, dict[str, Any]] = field(default_factory=dict)
    runtime_environment_contract: dict[str, Any] = field(default_factory=dict)

    @property
    def prompt(self) -> str:
        return self.prompt_assembly.prompt

    @property
    def prompt_compactions(self) -> list[dict[str, Any]]:
        return self.prompt_assembly.prompt_compactions()


def _asset_surface_summary(node: Node) -> dict[str, Any] | None:
    surface = node.asset_surface
    if not surface.declared:
        return None
    return {
        "kind": surface.kind,
        "schema": _schema_key(node.schema),
        "required_contexts": list(surface.required_contexts),
        "standards_refs": list(surface.standards_refs),
        "output_contract_refs": list(surface.output_contract_refs),
    }


def _runtime_environment_contract_summary(
    resolved_environment: ResolvedEnvironment,
) -> dict[str, Any]:
    return {
        "vector_source_required_contexts": list(
            resolved_environment.vector_source_required_contexts
        ),
        "asset_surface_required_contexts": list(
            resolved_environment.asset_surface_required_contexts
        ),
        "asset_surface_injected_required_contexts": list(
            resolved_environment.asset_surface_injected_required_contexts
        ),
        "effective_required_contexts": [
            node.name for node in resolved_environment.requires
        ],
    }


def _event_time_value(event: dict) -> datetime | None:
    raw = event.get("event_time")
    if not isinstance(raw, str) or not raw:
        return None
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return None


# ── F_H gate — Event Calculus ────────────────────────────────────────────────


def fh_binding_outcomes(
    job: ExecutableJob,
    all_events: list[dict],
    current_workflow_version: str = "unknown",
    *,
    work_key: str | None = None,
    workspace_root: Path | None = None,
) -> tuple[FhBindingOutcome, ...]:
    evaluators = tuple(ev for ev in job.evaluators if ev.regime is F_H)
    if not evaluators:
        return ()
    resolved_ledger = resolve_published_fulfillment_ledger(
        all_events,
        edge=job.vector.name,
        work_key=work_key,
        current_workflow_version=current_workflow_version,
        workspace=workspace_root,
    )
    if resolved_ledger is None:
        return tuple(
            FhBindingOutcome(
                evaluator=ev,
                admitted=False,
                admission_required=True,
                reason="missing_published_fulfillment_ledger",
            )
            for ev in evaluators
        )
    admission_required = bool(resolved_ledger.get("admission_required"))
    admitted = bool(resolved_ledger.get("admitted")) if admission_required else True
    ledger_ref = resolved_ledger.get("published_ledger_ref")
    return tuple(
        FhBindingOutcome(
            evaluator=ev,
            admitted=admitted,
            admission_required=admission_required,
            ledger_ref=ledger_ref if isinstance(ledger_ref, str) and ledger_ref else None,
        )
        for ev in evaluators
    )


def bind_fh(
    job: ExecutableJob,
    all_events: list[dict],
    current_workflow_version: str = "unknown",
    *,
    work_key: str | None = None,
    workspace_root: Path | None = None,
) -> bool:
    """
    Resolve the current ledger-backed admission state for this edge/work slice.
    """
    outcomes = fh_binding_outcomes(
        job,
        all_events,
        current_workflow_version,
        work_key=work_key,
        workspace_root=workspace_root,
    )
    return bool(outcomes) and all(outcome.admitted for outcome in outcomes)


# ── F_P certification — Event Calculus ───────────────────────────────────────


def fp_certification_outcome(
    job: ExecutableJob,
    ev: Evaluator,
    all_events: list[dict],
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    *,
    work_key: str | None = None,
    workspace_root: Path | None = None,
) -> FpCertificationOutcome:
    reset_boundary = find_latest_reset(all_events, edge=job.vector.name, work_key=work_key)
    reset_time = _event_time_value(reset_boundary) if reset_boundary else None
    latest_assessed = latest_fp_assessed_event(
        all_events,
        edge=job.vector.name,
        work_key=work_key,
        spec_hash=spec_hash,
    )
    latest_assessed_time = _event_time_value(latest_assessed) if latest_assessed is not None else None
    ledger_ref = None

    if latest_assessed is None:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            reason="no_fp_assessed_event",
        )

    if reset_time is not None and latest_assessed_time is not None and latest_assessed_time <= reset_time:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            reason="shadowed_by_reset",
        )

    raw_ledger_ref = latest_assessed.get("data", {}).get("published_ledger_ref")
    if isinstance(raw_ledger_ref, str) and raw_ledger_ref:
        ledger_ref = raw_ledger_ref
    ledger_data = resolve_published_fulfillment_ledger(
        all_events,
        edge=job.vector.name,
        work_key=work_key,
        spec_hash=spec_hash,
        current_workflow_version=current_workflow_version,
        workspace=workspace_root,
        ledger_ref=ledger_ref,
    )
    if ledger_data is None:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            ledger_ref=ledger_ref,
            reason="missing_published_fulfillment_ledger",
        )
    if ledger_data.get("edge") != job.vector.name:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            ledger_ref=ledger_ref,
            reason="ledger_edge_mismatch",
        )
    certification_scope = ledger_data.get("certification_scope")
    if ledger_data.get("carry_converged") is False:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            ledger_ref=ledger_ref,
            certification_scope=str(certification_scope or ""),
            reason="carry_not_converged",
        )
    if ledger_data.get("admitted") is not True:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            ledger_ref=ledger_ref,
            certification_scope=str(certification_scope or ""),
            reason="ledger_not_admitted",
        )
    if ledger_data.get("target_certification_passed", True) is not True:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            ledger_ref=ledger_ref,
            certification_scope=str(certification_scope or ""),
            reason="target_certification_failed",
        )
    if certification_scope == "edge":
        certified = bool(ledger_data.get("edge_converged"))
        return FpCertificationOutcome(
            evaluator=ev,
            certified=certified,
            ledger_ref=ledger_ref,
            certification_scope="edge",
            reason=None if certified else "edge_not_converged",
        )
    obligation = obligation_for_evaluator(ledger_data, ev.name)
    if obligation is None:
        return FpCertificationOutcome(
            evaluator=ev,
            certified=False,
            ledger_ref=ledger_ref,
            certification_scope=str(certification_scope or "obligation"),
            reason="missing_obligation",
        )
    certified = obligation.get("fulfillment_status") == "fulfilled"
    return FpCertificationOutcome(
        evaluator=ev,
        certified=certified,
        ledger_ref=ledger_ref,
        certification_scope=str(certification_scope or "obligation"),
        reason=None if certified else "obligation_not_fulfilled",
    )


def bind_fp_certified(
    job: ExecutableJob,
    ev: Evaluator,
    all_events: list[dict],
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    *,
    work_key: str | None = None,
    workspace_root: Path | None = None,
) -> bool:
    """
    Evaluate holdsAt(certified(edge, work_key, evaluator, spec_hash, wv), now).

    Reset boundary (ADR-026): certifications before the latest applicable reset
    are shadowed.

    Runtime truth is sourced from the published fulfillment ledger, not from
    raw event payload fields. The assessed event is only the discovery pointer
    to the current ledger publication for this obligation.
    """
    return fp_certification_outcome(
        job,
        ev,
        all_events,
        spec_hash,
        current_workflow_version,
        work_key=work_key,
        workspace_root=workspace_root,
    ).certified


# ── F_D evaluator runner ──────────────────────────────────────────────────────

FD_TIMEOUT_SECONDS: int = int(os.environ.get("FD_TIMEOUT_SECONDS", "120"))


def run_fd_evaluator(
    ev: Evaluator,
    current_asset: dict,
    workspace_root: Path,
    *,
    work_key: str | None = None,
) -> tuple[bool, Any]:
    """
    Run one F_D evaluator. Returns (passes: bool, detail: Any).

    Fails closed: an F_D evaluator with no binding is a misconfigured evaluator.
    """
    if ev.regime is not F_D:
        raise TypeError(
            f"run_fd_evaluator called on non-F_D evaluator: {ev.name!r} "
            f"(regime={ev.regime.__name__})"
        )
    # Extract shell command from binding URI (ABG runtime concern)
    shell_command = ev.binding
    if shell_command.startswith("exec://"):
        shell_command = shell_command[len("exec://"):]
    if not shell_command:
        return False, {
            "status": "error",
            "reason": f"F_D evaluator {ev.name!r} has no binding — misconfigured evaluator",
        }

    env = os.environ.copy()
    extra = os.pathsep.join(p for p in sys.path if p)
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = os.pathsep.join(filter(None, [extra, existing]))
    if work_key is not None:
        env["WORK_KEY"] = work_key

    try:
        result = subprocess.run(
            shell_command, shell=True, cwd=workspace_root,
            capture_output=True, text=True, env=env,
            timeout=FD_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        return False, {
            "status": "timeout",
            "reason": (
                f"F_D evaluator {ev.name!r} exceeded {FD_TIMEOUT_SECONDS}s wall-clock limit. "
                "Check that the command does not re-enter orchestration (start/iterate/gaps/emit-event) "
                "and excludes long-running test suites."
            ),
        }
    return result.returncode == 0, {
        "returncode": result.returncode,
        "stdout": result.stdout[-3000:],
        "stderr": result.stderr[-500:],
    }


def fd_binding_outcomes(
    job: ExecutableJob,
    *,
    current_asset: dict,
    workspace_root: Path,
    work_key: str | None = None,
) -> tuple[FdBindingOutcome, ...]:
    return tuple(
        FdBindingOutcome(
            evaluator=ev,
            passes=passes,
            detail=detail,
        )
        for ev in job.evaluators
        if ev.regime is F_D
        for passes, detail in (run_fd_evaluator(ev, current_asset, workspace_root, work_key=work_key),)
    )


def regime_binding_set(
    job: ExecutableJob,
    *,
    current_asset: dict,
    all_events: list[dict],
    workspace_root: Path,
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    work_key: str | None = None,
) -> RegimeBindingSet:
    fd_outcomes = {
        outcome.evaluator.name: outcome
        for outcome in fd_binding_outcomes(
            job,
            current_asset=current_asset,
            workspace_root=workspace_root,
            work_key=work_key,
        )
    }
    fh_outcomes = {
        outcome.evaluator.name: outcome
        for outcome in fh_binding_outcomes(
            job,
            all_events,
            current_workflow_version,
            work_key=work_key,
            workspace_root=workspace_root,
        )
    }
    fp_outcomes = {
        outcome.evaluator.name: outcome
        for outcome in (
            fp_certification_outcome(
                job,
                ev,
                all_events,
                spec_hash,
                current_workflow_version,
                work_key=work_key,
                workspace_root=workspace_root,
            )
            for ev in job.evaluators
            if ev.regime is F_P
        )
    }
    ordered: list[RegimeBindingOutcome] = []
    for ev in job.evaluators:
        if ev.regime is F_D:
            ordered.append(fd_outcomes[ev.name])
        elif ev.regime is F_H:
            ordered.append(fh_outcomes[ev.name])
        elif ev.regime is F_P:
            ordered.append(fp_outcomes[ev.name])
    return RegimeBindingSet(outcomes=tuple(ordered))


# ── bind_fd ───────────────────────────────────────────────────────────────────

def bind_fd(
    job: ExecutableJob,
    stream: EventStream,
    resolver: ContextResolver,
    workspace_root: Path,
    spec_hash: str | None = None,
    current_workflow_version: str = "unknown",
    carry_forward: list[dict] | None = None,
    module: Module | None = None,
    *,
    work_key: str | None = None,
) -> PrecomputedManifest:
    """
    F_D pre-computation phase. Everything computable without an LLM.
    Produces the residual gap — the minimal surface F_P must address.
    """
    resolved_environment = resolve_runtime_environment(
        job,
        stream,
        module=module,
        work_key=work_key,
    )
    source_name = resolved_environment.requires[0].name
    current = next(
        (
            binding.projection
            for binding in resolved_environment.bindings
            if binding.node.name == source_name
        ),
        project(stream, source_name, "current", work_key=work_key),
    )

    bindings = regime_binding_set(
        job,
        current_asset=current,
        all_events=stream.all_events(),
        workspace_root=workspace_root,
        spec_hash=spec_hash,
        current_workflow_version=current_workflow_version,
        work_key=work_key,
    )
    failing = list(bindings.failing_evaluators())
    passing = list(bindings.passing_evaluators())
    fd_results = bindings.fd_results()

    relevant_ctxs = select_relevant_contexts(job.vector.contexts, failing)
    resolved: dict[str, str] = {}
    _missing_contexts: list[str] = []
    for ctx in relevant_ctxs:
        try:
            resolved[ctx.name] = resolver.load(ctx)
        except NotImplementedError as exc:
            resolved[ctx.name] = f"[context unavailable: {exc}]"
        except FileNotFoundError as exc:
            resolved[ctx.name] = f"[context not found: {exc}]"
            _missing_contexts.append(ctx.name)

    summary = render_delta(fd_results, failing, environment=resolved_environment)

    return PrecomputedManifest(
        executable_job=job,
        current_asset=current,
        regime_bindings=bindings,
        resolved_environment=resolved_environment,
        fd_results=fd_results,
        relevant_contexts=resolved,
        missing_contexts=_missing_contexts,
        delta_summary=summary,
    )


# ── bind_fp ───────────────────────────────────────────────────────────────────

_FD_PROMPT_DETAIL_CHAR_LIMIT = 700
_FD_PROMPT_JSON_ITEM_LIMIT = 3
_PROMPT_CONTEXT_CHAR_LIMIT = 1800
_SOURCE_SNAPSHOT_TOTAL_CHAR_LIMIT = 1000
_SOURCE_SNAPSHOT_MIN_CHAR_LIMIT = 500


@dataclass
class PromptAssemblyBudget:
    """Single prompt-budget boundary that records every compaction decision."""

    events: list[PromptCompactionRecord] = field(default_factory=list)
    fd_detail_char_limit: int = _FD_PROMPT_DETAIL_CHAR_LIMIT
    context_char_limit: int = _PROMPT_CONTEXT_CHAR_LIMIT
    source_snapshot_total_char_limit: int = _SOURCE_SNAPSHOT_TOTAL_CHAR_LIMIT
    source_snapshot_min_char_limit: int = _SOURCE_SNAPSHOT_MIN_CHAR_LIMIT

    def checkpoint(self) -> int:
        return len(self.events)

    def section(self, name: str, text: str, checkpoint: int) -> PromptSection:
        return PromptSection(
            name=name,
            text=text,
            compactions=tuple(self.events[checkpoint:]),
        )

    def assembly(self, sections: Iterable[PromptSection]) -> PromptAssembly:
        section_tuple = tuple(section for section in sections if section.text)
        return PromptAssembly(
            prompt="\n\n".join(section.text for section in section_tuple),
            compactions=tuple(self.events),
            sections=section_tuple,
        )

    def records(self) -> tuple[PromptCompactionRecord, ...]:
        return tuple(self.events)

    def source_snapshot_budget(self, source_count: int) -> int:
        return max(
            self.source_snapshot_min_char_limit,
            self.source_snapshot_total_char_limit // max(1, source_count),
        )

    def record(
        self,
        *,
        surface: str,
        reason: str,
        size_unit: Literal["chars", "items", "bindings"],
        original_size: int,
        emitted_size: int,
        budget_size: int,
        inspection_ref: str,
    ) -> None:
        self.events.append(
            PromptCompactionRecord(
                surface=surface,
                reason=reason,
                size_unit=size_unit,
                original_size=original_size,
                emitted_size=emitted_size,
                budget_size=budget_size,
                inspection_ref=inspection_ref,
            )
        )

    def compact_text(
        self,
        value: Any,
        *,
        max_chars: int,
        surface: str,
        reason: str,
        inspection_ref: str,
        marker: str = "...[truncated]",
    ) -> str:
        text = str(value).strip()
        if len(text) <= max_chars:
            return text
        emitted = _bounded_prompt_text(text, max_chars=max_chars, marker=marker)
        self.record(
            surface=surface,
            reason=reason,
            size_unit="chars",
            original_size=len(text),
            emitted_size=len(emitted),
            budget_size=max_chars,
            inspection_ref=inspection_ref,
        )
        return emitted

    def compact_context(
        self,
        name: str,
        content: str,
        *,
        inspection_ref: str,
    ) -> str:
        text = str(content).strip()
        if len(text) <= self.context_char_limit:
            return text
        marker = "...[context truncated; inspect the source context reference for the full surface]"
        emitted = _bounded_markdown_context(
            text,
            max_chars=self.context_char_limit,
            marker=marker,
        )
        self.record(
            surface=f"context:{name}",
            reason="context_prompt_budget",
            size_unit="chars",
            original_size=len(text),
            emitted_size=len(emitted),
            budget_size=self.context_char_limit,
            inspection_ref=inspection_ref,
        )
        return emitted

    def record_source_snapshot(
        self,
        *,
        node_name: str,
        relative_path: str,
        original_chars: int,
        emitted_chars: int,
        budget_chars: int,
    ) -> None:
        if original_chars <= emitted_chars:
            return
        self.record(
            surface=f"source_asset:{node_name}",
            reason="source_snapshot_prompt_budget",
            size_unit="chars",
            original_size=original_chars,
            emitted_size=emitted_chars,
            budget_size=budget_chars,
            inspection_ref=f"workspace://{relative_path}",
        )

    def record_omitted_obligations(
        self,
        *,
        edge: str,
        total_count: int,
        emitted_count: int,
        budget_count: int,
        inspection_ref: str,
    ) -> None:
        if total_count <= emitted_count:
            return
        self.record(
            surface=f"output_contract:{edge}:fulfillment_obligations",
            reason="fulfillment_obligation_prompt_budget",
            size_unit="items",
            original_size=total_count,
            emitted_size=emitted_count,
            budget_size=budget_count,
            inspection_ref=inspection_ref,
        )

    def record_omitted_environment_bindings(
        self,
        *,
        edge: str,
        total_count: int,
        emitted_count: int,
        budget_count: int,
        inspection_ref: str,
    ) -> None:
        if total_count <= emitted_count:
            return
        self.record(
            surface=f"runtime_environment:{edge}:carried_bindings",
            reason="environment_binding_prompt_budget",
            size_unit="bindings",
            original_size=total_count,
            emitted_size=emitted_count,
            budget_size=budget_count,
            inspection_ref=inspection_ref,
        )

    def record_json_summary(
        self,
        *,
        surface: str,
        reason: str,
        original_count: int,
        emitted_count: int,
        budget_count: int,
        inspection_ref: str = "fp_manifest.fd_results",
    ) -> None:
        if original_count <= emitted_count:
            return
        self.record(
            surface=surface,
            reason=reason,
            size_unit="items",
            original_size=original_count,
            emitted_size=emitted_count,
            budget_size=budget_count,
            inspection_ref=inspection_ref,
        )


def _compact_json_scalar(
    value: Any,
    *,
    budget: PromptAssemblyBudget,
    surface: str = "fd_result:json_scalar",
) -> str:
    text = _json.dumps(value, sort_keys=True) if isinstance(value, (dict, list)) else str(value)
    return budget.compact_text(
        text,
        max_chars=180,
        surface=surface,
        reason="json_scalar_prompt_budget",
        inspection_ref="fp_manifest.fd_results",
    )


def _compact_fd_json_output(
    value: Any,
    *,
    budget: PromptAssemblyBudget,
    surface: str = "fd_result:stdout",
) -> str:
    if isinstance(value, list):
        lines = [f"json_list entries={len(value)}"]
        visible_items = value[:_FD_PROMPT_JSON_ITEM_LIMIT]
        for index, item in enumerate(visible_items, start=1):
            if isinstance(item, dict):
                selected: list[str] = []
                selected_keys: list[str] = []
                for key in (
                    "asset_id",
                    "edge",
                    "status",
                    "traceability_status",
                    "contract_satisfied",
                    "reason",
                    "marker_path",
                    "target_path",
                    "missing_requirement_ids",
                    "missing_from_current_requirement_surface",
                ):
                    if key in item:
                        selected_keys.append(key)
                        selected.append(
                            f"{key}="
                            + _compact_json_scalar(
                                item[key],
                                budget=budget,
                                surface=f"{surface}:item{index}:{key}",
                            )
                        )
                if not selected:
                    summarized_keys = sorted(str(key) for key in item)[:8]
                    selected_keys = summarized_keys
                    selected.append("keys=" + ",".join(summarized_keys))
                budget.record_json_summary(
                    surface=f"{surface}:item{index}:keys",
                    reason="fd_json_object_key_prompt_budget",
                    original_count=len(item),
                    emitted_count=len(selected_keys),
                    budget_count=len(selected_keys),
                )
                lines.append(f"item{index}: " + "; ".join(selected))
            else:
                lines.append(
                    f"item{index}: "
                    + _compact_json_scalar(
                        item,
                        budget=budget,
                        surface=f"{surface}:item{index}",
                    )
                )
        if len(value) > _FD_PROMPT_JSON_ITEM_LIMIT:
            budget.record_json_summary(
                surface=f"{surface}:items",
                reason="fd_json_list_prompt_budget",
                original_count=len(value),
                emitted_count=len(visible_items),
                budget_count=_FD_PROMPT_JSON_ITEM_LIMIT,
            )
            lines.append(f"... {len(value) - _FD_PROMPT_JSON_ITEM_LIMIT} more item(s)")
        return " | ".join(lines)
    if isinstance(value, dict):
        selected = []
        selected_keys = []
        for key in (
            "status",
            "reason",
            "asset_id",
            "edge",
            "traceability_status",
            "contract_satisfied",
            "missing_requirement_ids",
            "missing_code_traceability_ids",
            "missing_planned_test_traceability_ids",
            "missing_realized_test_traceability_ids",
            "unexpected_requirement_ids",
            "blocking_obligation_ids",
            "orphan_code_files",
            "orphan_test_files",
        ):
            if key in value:
                selected_keys.append(key)
                selected.append(
                    f"{key}="
                    + _compact_json_scalar(value[key], budget=budget, surface=f"{surface}:{key}")
                )
        if selected:
            budget.record_json_summary(
                surface=f"{surface}:keys",
                reason="fd_json_object_key_prompt_budget",
                original_count=len(value),
                emitted_count=len(selected_keys),
                budget_count=len(selected_keys),
            )
            return "; ".join(selected)
        summarized_keys = sorted(str(key) for key in value)[:10]
        budget.record_json_summary(
            surface=f"{surface}:keys",
            reason="fd_json_object_key_prompt_budget",
            original_count=len(value),
            emitted_count=len(summarized_keys),
            budget_count=len(summarized_keys),
        )
        return "json_object keys=" + ",".join(summarized_keys)
    return _compact_json_scalar(value, budget=budget, surface=surface)


def _compact_fd_stdout(stdout: Any, *, budget: PromptAssemblyBudget, surface: str) -> str:
    text = str(stdout).strip()
    if not text:
        return ""
    try:
        parsed = _json.loads(text)
    except Exception:
        return budget.compact_text(
            text,
            max_chars=_FD_PROMPT_DETAIL_CHAR_LIMIT,
            surface=surface,
            reason="fd_stdout_prompt_budget",
            inspection_ref="fp_manifest.fd_results",
        )
    return _compact_fd_json_output(parsed, budget=budget, surface=surface)


def _compact_fd_prompt_detail(
    detail: Any,
    *,
    budget: PromptAssemblyBudget,
    evaluator_name: str = "unknown",
) -> str:
    payload = detail.get("detail", detail) if isinstance(detail, dict) else detail
    if not isinstance(payload, dict):
        return budget.compact_text(
            payload,
            max_chars=_FD_PROMPT_DETAIL_CHAR_LIMIT,
            surface=f"fd_result:{evaluator_name}",
            reason="fd_result_prompt_budget",
            inspection_ref="fp_manifest.fd_results",
        )

    parts: list[str] = []
    for key in ("status", "reason", "returncode"):
        if key in payload:
            parts.append(
                f"{key}="
                + _compact_json_scalar(
                    payload[key],
                    budget=budget,
                    surface=f"fd_result:{evaluator_name}:{key}",
                )
            )
    stderr = str(payload.get("stderr") or "").strip()
    if stderr:
        stderr_text = budget.compact_text(
            stderr,
            max_chars=240,
            surface=f"fd_result:{evaluator_name}:stderr",
            reason="fd_stderr_prompt_budget",
            inspection_ref="fp_manifest.fd_results",
        )
        parts.append("stderr=" + stderr_text)
    stdout = _compact_fd_stdout(
        payload.get("stdout", ""),
        budget=budget,
        surface=f"fd_result:{evaluator_name}:stdout",
    )
    if stdout:
        parts.append(f"stdout={stdout}")
    if not parts:
        summarized_keys = sorted(str(key) for key in payload)[:10]
        budget.record_json_summary(
            surface=f"fd_result:{evaluator_name}:keys",
            reason="fd_result_key_prompt_budget",
            original_count=len(payload),
            emitted_count=len(summarized_keys),
            budget_count=len(summarized_keys),
        )
        parts.append("keys=" + ",".join(summarized_keys))
    joined = "; ".join(parts)
    return budget.compact_text(
        joined,
        max_chars=budget.fd_detail_char_limit,
        surface=f"fd_result:{evaluator_name}",
        reason="fd_result_prompt_budget",
        inspection_ref="fp_manifest.fd_results",
    )


def _render_fd_detail_for_delta(detail: Any) -> str:
    payload = detail.get("detail", detail) if isinstance(detail, dict) else detail
    if isinstance(payload, (dict, list)):
        try:
            return _json.dumps(payload, sort_keys=True)
        except TypeError:
            return str(payload)
    return str(payload)


def _prompt_source_identity(job: ExecutableJob) -> tuple[str, dict[str, Any], tuple[Node, ...]]:
    src = job.vector.source
    if isinstance(src, tuple):
        return (
            " × ".join(a.name for a in src),
            {a.name: a.markov for a in src},
            src,
        )
    return src.name, {src.name: src.markov}, (src,)


def _render_preconditions_section(
    src_markov: dict[str, Any],
    budget: PromptAssemblyBudget,
) -> PromptSection:
    checkpoint = budget.checkpoint()
    lines = ["[PRECONDITIONS] — upstream asset stability (these hold):"]
    for name, conditions in src_markov.items():
        if conditions:
            lines.append(f"  {name}: {conditions}")
        else:
            lines.append(f"  {name}: (no markov conditions)")
    return budget.section("preconditions", "\n".join(lines), checkpoint)


def _render_current_state_section(
    pre: PrecomputedManifest,
    job: ExecutableJob,
    *,
    src_name: str,
    budget: PromptAssemblyBudget,
) -> PromptSection:
    checkpoint = budget.checkpoint()
    return budget.section(
        "current_state",
        (
            f"[CURRENT STATE]\n"
            f"Edge: {job.vector.name}\n"
            f"Source asset: {src_name}\n"
            f"Target asset: {job.vector.target.name}\n"
            f"Status: {pre.current_asset.get('status', 'unknown')}\n"
            f"Edges converged: {pre.current_asset.get('edges_converged', [])}"
        ),
        checkpoint,
    )


def _render_working_method_section(
    target_binding: TargetAssetBinding | None,
    budget: PromptAssemblyBudget,
) -> PromptSection:
    checkpoint = budget.checkpoint()
    lines = ["[WORKING METHOD] — current-state-first execution is mandatory:"]
    if target_binding is not None:
        relative_path = target_binding.relative_path
        if isinstance(relative_path, str) and relative_path:
            lines.append(
                f"  1. Inspect the current target asset state at {relative_path} before making changes."
            )
        else:
            lines.append(
                "  1. Inspect the current target asset state in the bound workspace location before making changes."
            )
    else:
        lines.append(
            "  1. Inspect the current target asset state in workspace before making changes."
        )
    lines.extend(
        [
            "  2. Determine what is already realized and what remains unresolved.",
            "  3. Treat the current workspace state as truth; prior manifests and prior prompts are historical evidence only.",
            "  4. Continue construction from the present state and reduce the unresolved gap before assessment.",
        ]
    )
    return budget.section("working_method", "\n".join(lines), checkpoint)


def _render_gap_section(
    pre: PrecomputedManifest,
    budget: PromptAssemblyBudget,
) -> PromptSection:
    checkpoint = budget.checkpoint()
    lines = [f"[GAP] — {len(pre.failing_evaluators)} evaluator(s) failing:"]
    for ev in pre.failing_evaluators:
        detail = pre.fd_results.get(ev.name, {})
        lines.append(f"  {ev.name} ({ev.regime.__name__}): {ev.description}")
        if detail:
            lines.append(
                "    F_D result: "
                + _compact_fd_prompt_detail(
                    detail,
                    budget=budget,
                    evaluator_name=ev.name,
                )
            )
    if not pre.failing_evaluators:
        lines.append("  (none — all evaluators pass)")
    return budget.section("gap", "\n".join(lines), checkpoint)


def _render_deterministic_failures_section(
    pre: PrecomputedManifest,
    budget: PromptAssemblyBudget,
) -> PromptSection | None:
    fd_failures = [ev for ev in pre.failing_evaluators if ev.regime is F_D]
    if not fd_failures:
        return None
    checkpoint = budget.checkpoint()
    lines = ["[DETERMINISTIC FAILURES] — clear these before asking for assessment:"]
    for ev in fd_failures:
        detail = pre.fd_results.get(ev.name, {})
        lines.append(
            f"  {ev.name}: "
            + _compact_fd_prompt_detail(
                detail,
                budget=budget,
                evaluator_name=ev.name,
            )
        )
    return budget.section("deterministic_failures", "\n".join(lines), checkpoint)


def _render_context_section(
    pre: PrecomputedManifest,
    job: ExecutableJob,
    budget: PromptAssemblyBudget,
) -> PromptSection | None:
    if not pre.relevant_contexts:
        return None
    checkpoint = budget.checkpoint()
    context_refs = {
        ctx.name: (
            ctx.locator
            or f"fp_manifest.contexts[name={ctx.name}].content"
        )
        for ctx in job.vector.contexts
    }
    lines = ["[CONTEXT] — constraint surface for this edge:"]
    for name, content in pre.relevant_contexts.items():
        lines.append(
            f"\n--- {name} ---\n"
            + budget.compact_context(
                name,
                content,
                inspection_ref=context_refs.get(
                    name,
                    f"fp_manifest.contexts[name={name}].content",
                ),
            )
        )
    return budget.section("context", "\n".join(lines), checkpoint)


def _render_source_asset_snapshot_section(
    *,
    source_nodes: tuple[Node, ...],
    workspace_root: Path | None,
    asset_bindings: dict[str, TargetAssetBinding],
    budget: PromptAssemblyBudget,
) -> PromptSection | None:
    if workspace_root is None:
        return None
    source_bindings = [
        (node, binding)
        for node in source_nodes
        for binding in (asset_bindings.get(node.name),)
        if binding is not None and binding.relative_path
    ]
    snapshot_budget = budget.source_snapshot_budget(len(source_bindings))
    checkpoint = budget.checkpoint()
    source_snapshots: list[str] = []
    for node, binding in source_bindings:
        snapshot = _read_workspace_asset_snapshot(
            workspace_root,
            binding.relative_path,
        )
        if snapshot:
            emitted_snapshot = budget.compact_text(
                snapshot.text,
                max_chars=snapshot_budget,
                surface=f"source_asset:{node.name}",
                reason="source_snapshot_prompt_budget",
                inspection_ref=snapshot.inspection_ref,
            )
            source_snapshots.append(
                "\n".join(
                    [
                        f"--- {node.name} ({binding.relative_path}) ---",
                        emitted_snapshot,
                    ]
                )
            )
    if not source_snapshots:
        return None
    return budget.section(
        "source_asset_snapshot",
        "\n".join(
            ["[SOURCE ASSET SNAPSHOT] — current upstream asset content in workspace:"]
            + source_snapshots
        ),
        checkpoint,
    )


def _mandatory_contexts_for_prompt(
    pre: PrecomputedManifest,
    target: Node,
) -> tuple[str, ...]:
    return tuple(
        dict.fromkeys(
            list(
                name
                for name in pre.relevant_contexts
                if "standard" in name or "output_contract" in name or "contract" in name
            )
            + list(target.asset_surface.standards_refs)
            + list(target.asset_surface.output_contract_refs)
        )
    )


def _render_environment_section(
    pre: PrecomputedManifest,
    job: ExecutableJob,
    *,
    asset_bindings: dict[str, TargetAssetBinding],
    budget: PromptAssemblyBudget,
) -> PromptSection | None:
    if not pre.resolved_environment.bindings:
        return None
    checkpoint = budget.checkpoint()
    lines = ["[ENVIRONMENT] — resolved runtime environment for this edge:"]
    omitted_carried_bindings = 0
    emitted_environment_bindings = 0
    for binding in pre.resolved_environment.bindings:
        if not binding.required and not binding.provided:
            omitted_carried_bindings += 1
            continue
        emitted_environment_bindings += 1
        roles: list[str] = []
        if binding.required:
            roles.append("required")
        if binding.provided:
            roles.append("provided")
        if not roles:
            roles.append("carried")
        origin = (
            "internal_carrier"
            if binding.produced_within_carrier
            else "external_entry"
        )
        required_via_suffix = ""
        if binding.required_sources:
            required_via_suffix = " required_via=" + "+".join(binding.required_sources)
        asset_kind_suffix = ""
        if binding.node.asset_surface.kind:
            asset_kind_suffix = f" asset_kind={binding.node.asset_surface.kind}"
        asset_binding = asset_bindings.get(binding.node.name)
        location_suffix = ""
        if asset_binding is not None:
            location_parts = []
            if asset_binding.relative_path:
                location_parts.append(f"path={asset_binding.relative_path}")
            if asset_binding.path_kind:
                location_parts.append(f"kind={asset_binding.path_kind}")
            if asset_binding.exists is not None:
                location_parts.append(f"exists={str(asset_binding.exists).lower()}")
            if asset_binding.uri:
                location_parts.append(f"uri={asset_binding.uri}")
            if location_parts:
                location_suffix = " " + " ".join(location_parts)
        lines.append(
            f"  {binding.node.name} [{', '.join(roles)}] "
            f"schema={binding.node.schema!r} status={binding.display_status} origin={origin}"
            f"{required_via_suffix}{asset_kind_suffix}{location_suffix}"
        )
    if omitted_carried_bindings:
        budget.record_omitted_environment_bindings(
            edge=job.vector.name,
            total_count=len(pre.resolved_environment.bindings),
            emitted_count=emitted_environment_bindings,
            budget_count=emitted_environment_bindings,
            inspection_ref="fp_manifest.runtime_environment_contract",
        )
        lines.append(
            f"  carried bindings omitted from prompt: {omitted_carried_bindings}; "
            "inspect the asset query surface or runtime manifest for the full environment."
        )
    if not pre.resolved_environment.ready:
        lines.extend(
            f"  BLOCKED: {line}"
            for line in pre.resolved_environment.summary_lines()
        )
    return budget.section("environment", "\n".join(lines), checkpoint)


def _render_required_boundary_section(
    pre: PrecomputedManifest,
    budget: PromptAssemblyBudget,
) -> PromptSection:
    checkpoint = budget.checkpoint()
    contract_summary = _runtime_environment_contract_summary(pre.resolved_environment)
    lines = [
        "[REQUIRED BOUNDARY] — invocation-local effective required bindings for this edge:",
        "  vector_source_required_contexts: "
        + (
            ", ".join(contract_summary["vector_source_required_contexts"])
            or "(none)"
        ),
        "  asset_surface_required_contexts: "
        + (
            ", ".join(contract_summary["asset_surface_required_contexts"])
            or "(none)"
        ),
        "  asset_surface_injected_required_contexts: "
        + (
            ", ".join(contract_summary["asset_surface_injected_required_contexts"])
            or "(none)"
        ),
        "  effective_required_contexts: "
        + (
            ", ".join(contract_summary["effective_required_contexts"])
            or "(none)"
        ),
        "  note: this merge is invocation-local runtime interpretation, not a rewrite of published GTL module topology.",
    ]
    return budget.section("required_boundary", "\n".join(lines), checkpoint)


def _render_asset_surface_section(
    target: Node,
    budget: PromptAssemblyBudget,
) -> PromptSection | None:
    if not target.asset_surface.declared:
        return None
    checkpoint = budget.checkpoint()
    lines = [
        "[ASSET SURFACE] — declared target asset contract:",
        f"  kind: {target.asset_surface.kind or '(unspecified)'}",
        f"  schema: {_schema_key(target.schema)}",
    ]
    if target.asset_surface.required_contexts:
        lines.append(
            "  required_contexts: " + ", ".join(target.asset_surface.required_contexts)
        )
    if target.asset_surface.standards_refs:
        lines.append(
            "  standards_refs: " + ", ".join(target.asset_surface.standards_refs)
        )
    if target.asset_surface.output_contract_refs:
        lines.append(
            "  output_contract_refs: "
            + ", ".join(target.asset_surface.output_contract_refs)
        )
    return budget.section("asset_surface", "\n".join(lines), checkpoint)


def _render_target_binding_sections(
    target_binding: TargetAssetBinding | None,
    budget: PromptAssemblyBudget,
) -> tuple[PromptSection, ...]:
    if target_binding is None:
        return ()
    checkpoint = budget.checkpoint()
    lines = [
        "[TARGET BINDING] — concrete workspace destination for the produced asset:",
        f"  asset_id: {target_binding.asset_id}",
        f"  uri: {target_binding.uri}",
    ]
    if target_binding.relative_path:
        lines.append(f"  relative_path: {target_binding.relative_path}")
    if target_binding.path_kind:
        lines.append(f"  path_kind: {target_binding.path_kind}")
    if target_binding.exists is not None:
        lines.append(f"  exists: {str(target_binding.exists).lower()}")
    sections = [budget.section("target_binding", "\n".join(lines), checkpoint)]
    if target_binding.generated_asset_contract:
        checkpoint = budget.checkpoint()
        contract = target_binding.generated_asset_contract
        contract_lines = [
            "[GENERATED ASSET CONTRACT] — target output must satisfy this published contract:",
        ]
        for key in (
            "asset_id",
            "materialization_kind",
            "relative_path",
            "marker_path",
            "marker_text",
            "heading_prefix",
        ):
            value = contract.get(key)
            if value not in (None, ""):
                contract_lines.append(f"  {key}: {value}")
        sections.append(
            budget.section(
                "generated_asset_contract",
                "\n".join(contract_lines),
                checkpoint,
            )
        )
    return tuple(sections)


def _render_output_contract_section(
    *,
    job: ExecutableJob,
    target: Node,
    pre: PrecomputedManifest,
    declared_fulfillment_obligations: list[dict[str, Any]],
    result_path: str,
    budget: PromptAssemblyBudget,
) -> PromptSection:
    checkpoint = budget.checkpoint()
    assessment_contract = ""
    if declared_fulfillment_obligations and result_path:
        manifest_ref = str(result_path).replace("/fp_results/", "/fp_manifests/")
        obligation_ids = [
            str(obligation["id"])
            for obligation in declared_fulfillment_obligations
        ]
        inline_limit = 12
        visible_ids = obligation_ids[:inline_limit]
        omitted_count = max(0, len(obligation_ids) - len(visible_ids))
        if omitted_count:
            budget.record_omitted_obligations(
                edge=job.vector.name,
                total_count=len(obligation_ids),
                emitted_count=len(visible_ids),
                budget_count=inline_limit,
                inspection_ref=f"{manifest_ref}#fulfillment_obligations",
            )
        obligation_lines = [
            f"- total declared obligations: {len(obligation_ids)}",
            "- inline obligation ids: " + (", ".join(visible_ids) if visible_ids else "(none)"),
        ]
        if omitted_count:
            obligation_lines.append(
                f"- omitted from prompt: {omitted_count}; read `{manifest_ref}` key `fulfillment_obligations` for the full set"
            )
        assessment_contract = (
            f"\n\nWrite fulfillment assessment JSON to: {result_path}\n"
            f"Format: {{{{'edge': '{job.vector.name}', 'actor': '<your_agent_id>', "
            "'fulfillment_assessments': [{\"id\": \"<declared_obligation_id>\", "
            "\"fulfillment_status\": \"fulfilled|partial|blocked|unfulfilled\", "
            "\"fulfillment_detail\": \"...\", \"blocking_reasons\": [\"...\"], "
            "\"evidence_refs\": [\"...\"]}]}}\n"
            + "\n".join(obligation_lines)
            + "\nUse every declared fulfillment obligation id exactly as published for this dispatch. "
            "The app reads this file, publishes the current fulfillment ledger, and emits discovery events — do NOT call emit-event yourself."
        )
    return budget.section(
        "output_contract",
        (
            f"[OUTPUT CONTRACT]\n"
            f"Produce: {target.name} asset\n"
            f"Satisfying markov conditions: {target.markov}\n"
            f"Current failing evaluators: {[ev.name for ev in pre.failing_evaluators]}\n"
            f"Declared fulfillment obligations: {len(declared_fulfillment_obligations)} published in the F_P manifest"
            + assessment_contract
        ),
        checkpoint,
    )


def _render_declared_obligation_policy_sections(
    declared_obligation_policy: dict[str, Any] | None,
    budget: PromptAssemblyBudget,
) -> tuple[PromptSection, ...]:
    if declared_obligation_policy is None:
        return ()
    checkpoint = budget.checkpoint()
    sections = [
        budget.section(
            "declared_obligation_ledger_policy",
            "\n".join(
                [
                    "[DECLARED OBLIGATION LEDGER POLICY]",
                    f"  declaration_family: {declared_obligation_policy['declaration_family']}",
                    f"  obligation_source_ref: {declared_obligation_policy['obligation_source_ref']}",
                    f"  obligation_kind: {declared_obligation_policy['obligation_kind']}",
                    f"  certification_scope: {declared_obligation_policy['certification_scope']}",
                    f"  carry_rule: {declared_obligation_policy['carry_rule']}",
                    f"  fulfillment_rule: {declared_obligation_policy['fulfillment_rule']}",
                    f"  evidence_policy: {declared_obligation_policy['evidence_policy']}",
                ]
            ),
            checkpoint,
        )
    ]
    if declared_obligation_policy.get("adapter_ref"):
        checkpoint = budget.checkpoint()
        sections.append(
            budget.section(
                "declared_obligation_ledger_adapter",
                "\n".join(
                    [
                        "[DECLARED OBLIGATION LEDGER ADAPTER]",
                        f"  signal_key: {declared_obligation_policy.get('signal_key', '')}",
                        f"  adapter_ref: {declared_obligation_policy.get('adapter_ref', '')}",
                        f"  derivation_rule: {declared_obligation_policy.get('derivation_rule', '')}",
                    ]
                ),
                checkpoint,
            )
        )
    return tuple(sections)


def _render_execution_rules_section(
    mandatory_contexts: tuple[str, ...],
    budget: PromptAssemblyBudget,
) -> PromptSection:
    checkpoint = budget.checkpoint()
    lines = [
        "[EXECUTION RULES]",
        "- Update the workspace artifact(s), not just the assessment file.",
        "- Clear every deterministic F_D failure before treating the work as done.",
        "- Treat standards and output-contract contexts as mandatory acceptance checks.",
        "- Self-check the artifact against the target markov conditions before writing assessment JSON.",
    ]
    if mandatory_contexts:
        lines.append(
            "- Mandatory contexts for this edge: " + ", ".join(mandatory_contexts)
        )
    return budget.section("execution_rules", "\n".join(lines), checkpoint)


def _construct_bound_job(
    pre: PrecomputedManifest,
    job: ExecutableJob,
    result_path: str = "",
    *,
    workspace_root: Path | None = None,
    asset_bindings: dict[str, TargetAssetBinding] | None = None,
) -> BoundJob:
    if pre.missing_contexts:
        raise FileNotFoundError(
            f"Cannot dispatch F_P: required context(s) not found: "
            f"{', '.join(pre.missing_contexts)}. "
            f"Fix the context locators or provide the missing files before iterating."
        )
    if not pre.resolved_environment.ready:
        details = pre.resolved_environment.summary_lines()
        raise ValueError(
            "Cannot dispatch F_P: runtime environment unresolved: "
            + "; ".join(details)
        )
    asset_bindings = dict(asset_bindings or {})
    target_binding = asset_bindings.get(job.vector.target.name)
    if asset_bindings and target_binding is None:
        raise ValueError(
            f"Cannot dispatch F_P: target asset binding for {job.vector.target.name!r} "
            "is not present in the workspace asset query surface."
        )
    prompt_assembly = _assemble_prompt(
        pre,
        job,
        result_path,
        workspace_root=workspace_root,
        asset_bindings=asset_bindings,
        target_binding=target_binding,
    )
    environment_names = {
        env_binding.node.name
        for env_binding in pre.resolved_environment.bindings
    }
    return BoundJob(
        executable_job=job,
        precomputed=pre,
        prompt_assembly=prompt_assembly,
        result_path=result_path,
        target_asset_binding=None if target_binding is None else target_binding.to_dict(),
        environment_asset_bindings={
            name: binding.to_dict()
            for name, binding in asset_bindings.items()
            if name in environment_names
        },
        target_asset_surface=_asset_surface_summary(job.vector.target),
        environment_asset_surfaces={
            binding.node.name: summary
            for binding in pre.resolved_environment.bindings
            if (summary := _asset_surface_summary(binding.node)) is not None
        },
        runtime_environment_contract=_runtime_environment_contract_summary(
            pre.resolved_environment
        ),
    )


def bind_fp(
    pre: PrecomputedManifest,
    job: ExecutableJob,
    result_path: str = "",
    *,
    workspace_root: Path | None = None,
    asset_bindings: dict[str, TargetAssetBinding] | None = None,
) -> BoundJob:
    """
    Assemble the minimal F_P manifest from pre-computed material.
    Raises FileNotFoundError if required context failed to resolve.
    """
    return _construct_bound_job(
        pre,
        job,
        result_path,
        workspace_root=workspace_root,
        asset_bindings=asset_bindings,
    )


def _assemble_prompt(
    pre: PrecomputedManifest,
    job: ExecutableJob,
    result_path: str = "",
    *,
    workspace_root: Path | None = None,
    asset_bindings: dict[str, TargetAssetBinding] | None = None,
    target_binding: TargetAssetBinding | None = None,
) -> PromptAssembly:
    """Assemble the F_P prompt."""
    asset_bindings = asset_bindings or {}
    budget = PromptAssemblyBudget()
    src_name, src_markov, source_nodes = _prompt_source_identity(job)
    target = job.vector.target
    mandatory_contexts = _mandatory_contexts_for_prompt(pre, target)
    declared_obligation_policy = (
        declared_obligation_ledger_policy_for_job(job) if result_path else None
    )
    declared_fulfillment_obligations = (
        declared_fulfillment_obligations_for_job(job, workspace_root=workspace_root)
        if declared_obligation_policy is not None
        else []
    )

    sections: list[PromptSection] = [
        _render_preconditions_section(src_markov, budget),
        _render_current_state_section(pre, job, src_name=src_name, budget=budget),
        _render_working_method_section(target_binding, budget),
        _render_gap_section(pre, budget),
    ]
    sections.extend(
        section
        for section in (
            _render_deterministic_failures_section(pre, budget),
            _render_context_section(pre, job, budget),
            _render_source_asset_snapshot_section(
                source_nodes=source_nodes,
                workspace_root=workspace_root,
                asset_bindings=asset_bindings,
                budget=budget,
            ),
            _render_environment_section(
                pre,
                job,
                asset_bindings=asset_bindings,
                budget=budget,
            ),
        )
        if section is not None
    )
    sections.append(_render_required_boundary_section(pre, budget))
    asset_surface_section = _render_asset_surface_section(target, budget)
    if asset_surface_section is not None:
        sections.append(asset_surface_section)
    sections.extend(_render_target_binding_sections(target_binding, budget))
    sections.append(
        _render_output_contract_section(
            job=job,
            target=target,
            pre=pre,
            declared_fulfillment_obligations=declared_fulfillment_obligations,
            result_path=result_path,
            budget=budget,
        )
    )
    sections.extend(
        _render_declared_obligation_policy_sections(
            declared_obligation_policy,
            budget,
        )
    )
    sections.append(_render_execution_rules_section(mandatory_contexts, budget))

    return budget.assembly(sections)


# ── select_relevant_contexts ──────────────────────────────────────────────────

def select_relevant_contexts(
    all_contexts: list[Context],
    failing: list[Evaluator],
) -> list[Context]:
    """F_D: filter contexts to those relevant to the failing evaluators."""
    if not failing:
        return []
    fp_failing = [ev for ev in failing if ev.regime is F_P]
    if not fp_failing:
        return []
    return list(all_contexts)


# ── render_delta ─────────────────────────────────────────────────────────────

def render_delta(
    fd_results: dict[str, Any],
    failing: list[Evaluator],
    environment: ResolvedEnvironment | None = None,
) -> str:
    """Render a structured human-readable gap description."""
    if environment is not None and not environment.ready and not failing:
        lines = ["delta = 1 — runtime environment unresolved:"]
        lines.extend(f"  {line}" for line in environment.summary_lines())
        return "\n".join(lines)

    if not failing:
        return "delta = 0 — all evaluators pass"

    lines = [f"delta = {len(failing)} — {len(failing)} evaluator(s) failing:"]
    for ev in failing:
        detail = fd_results.get(ev.name, {})
        lines.append(
            f"  {ev.name} ({ev.regime.__name__}): "
            + _render_fd_detail_for_delta(detail)
        )
    if environment is not None and not environment.ready:
        lines.append("  runtime environment unresolved:")
        lines.extend(f"    {line}" for line in environment.summary_lines())

    return "\n".join(lines)
