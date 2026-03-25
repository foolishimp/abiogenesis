# Implements: REQ-GTL-001
# Implements: REQ-GTL-002
# Implements: REQ-GTL-003
# Implements: REQ-GTL-004
# Implements: REQ-F-FRAG-001
# Implements: REQ-F-FRAG-002
"""
GTL constitutional object model — v0.3.0

Python library as the authored surface. No custom DSL parser.
AI assembles packages from this library; humans audit via normalised projections.

v0.3.0 additions (2026-03-15):
  WorkingSurface, Evaluator, Job, Worker, IterateProtocol — the typed execution model.
  Job<A,B> is the missing primitive that gives the system worker typing.
  Worker role = can_execute set — structural, not declarative.
  IterateProtocol declares the constitutional contract; the engine implements it.

v0.2.1 (Codex findings addressed 2026-03-14):
  1. Context: multi-resolver (git, workspace, event, registry), context_snapshot_id contract
  2. PackageSnapshot: explicit binding surface added
  3. Operative: typed, not free string
  4. Audit surface: topology vs traversal distinction clarified in docstrings
  5. Mutable defaults: field(default_factory=list) throughout

No external dependencies. Dataclasses + stdlib only.
"""
from __future__ import annotations
import warnings
from dataclasses import dataclass, field
from typing import Callable, Optional, Protocol


# ── V2 effect types ───────────────────────────────────────────────────────
# Canonical definitions live in gtl.operator_model (V2). Re-exported here
# for backward compatibility. V1 field names (category, command, uri,
# approve, dissent) are dead — use V2 vocabulary (regime, binding, description,
# kind, config).
from gtl.operator_model import (  # noqa: F401
    F_D, F_P, F_H, Regime,
    Evaluator, Operator, Rule,
    Consensus, consensus,
)


# ── Operative condition (Finding 3) ────────────────────────────────────────
# Typed prime-axis conditions. No free strings.

@dataclass(frozen=True)
class Operative:
    """
    Typed operability condition derived from prime axes.

    Prime axes: approved, superseded.
    Conditions compose from them — no ad hoc strings.

    Examples:
        Operative(approved=True)                        # operative when approved
        Operative(approved=True, not_superseded=True)   # operative when approved and not superseded
    """
    approved: bool = True
    not_superseded: bool = False

    def __repr__(self):
        parts = []
        if self.approved:
            parts.append("approved")
        if self.not_superseded:
            parts.append("not superseded")
        return " and ".join(parts) if parts else "always"

# Convenience constants
OPERATIVE_ON_APPROVED            = Operative(approved=True)
OPERATIVE_ON_APPROVED_NOT_SUPERSEDED = Operative(approved=True, not_superseded=True)


# ── Context resolver (Finding 1) ───────────────────────────────────────────
# Multi-resolver; digest is the constitutional binding; runtime derives context_snapshot_id.

_CONTEXT_SCHEMES = ("git://", "workspace://", "event://", "registry://")

@dataclass
class Context:
    """
    Externally-located, snapshot-bound constraint dimension.

    locator: URI using a known scheme — used for discovery and retrieval.
        git://      — versioned document in a git repository
        workspace:// — loaded from the local .ai-workspace/
        event://    — derived from a package-definition event stream
        registry:// — from a shared Genesis context registry

    digest: sha256 content hash — the constitutional binding for replay.
        The floating URI is not authoritative. The digest is.

    The runtime derives an immutable context_snapshot_id from (locator + digest).
    Replay binds to context_snapshot_id, not the live URI.
    """
    name: str
    locator: str    # e.g. "git://github.com/org/repo//ctx/file.yml@abc123"
    digest: str     # "sha256:..."

    def __post_init__(self):
        if not self.digest.startswith("sha256:"):
            raise ValueError(f"Context.digest must start with 'sha256:': {self.digest!r}")
        if not any(self.locator.startswith(s) for s in _CONTEXT_SCHEMES):
            raise ValueError(
                f"Context.locator must use a known scheme {_CONTEXT_SCHEMES}: {self.locator!r}"
            )


# ── V1 types still needed for quarantine period ──────────────────────────


@dataclass
class Asset:
    """
    Typed asset class. Instances are produced by traversing edges.

    governing_snapshots: populated at runtime on instances that cross package
        boundaries — carries the full provenance map of upstream constitutional
        surfaces. Declared here as a type-level annotation; runtime populates it.
    """
    name: str
    id_format: str
    lineage: list[Asset] = field(default_factory=list)
    markov: list[str] = field(default_factory=list)
    operative: Optional[Operative] = None


@dataclass
class Edge:
    name: str
    source: Asset | list[Asset]     # list[Asset] = product arrow A × B × ...
    target: Asset
    using: list[Operator] = field(default_factory=list)
    confirm: str = "markov"         # "question" | "markov" | "hypothesis"
    rule: Optional[Rule] = None
    context: list[Context] = field(default_factory=list)
    co_evolve: bool = False         # True = both assets mutable in same iterate() call

    def __post_init__(self):
        if self.confirm not in ("question", "markov", "hypothesis"):
            raise ValueError(
                f"Edge.confirm must be question|markov|hypothesis, got {self.confirm!r}"
            )
        if self.co_evolve and not isinstance(self.source, list):
            raise ValueError(
                f"Edge '{self.name}': co_evolve=True requires source to be a list [A, B]"
            )


    # Evaluator, Operator, Rule are now V2 types from gtl.operator_model
    # Re-exported above. V1 definitions removed.
    # WorkingSurface canonical definition moved to genesis.binding (ABG runtime type).


# ── Job / Worker ───────────────────────────────────────────────────────────
# Canonical definitions live in genesis.binding (V2). Re-exported here
# for backward compatibility via lazy import to avoid circular dependency
# (genesis.binding imports from gtl.core at module level).
#
# Usage: `from gtl.core import Job, Worker` works — Python 3.7+ module
# __getattr__ fires on first access and caches the result.

def __getattr__(name):
    if name in ("Job", "Worker", "WorkingSurface"):
        from genesis.binding import Job, Worker, WorkingSurface
        globals()["Job"] = Job
        globals()["Worker"] = Worker
        globals()["WorkingSurface"] = WorkingSurface
        return globals()[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


# ── iterate() protocol ─────────────────────────────────────────────────────

class IterateProtocol(Protocol):
    """
    Constitutional contract for the universal iteration function.

    GTL declares the signature. The engine (.genesis/) implements it.
    Job is a parameter — the iterator is domain-blind.

        iterate(job, evaluator_fn, asset) → (Asset<B>, WorkingSurface)

    Loops until evaluator_fn(candidate) is True, accumulating WorkingSurface.
    The fixed-point combinator over Job × Evaluator.
    """
    def __call__(
        self,
        job: Job,
        evaluator_fn: Callable[[Asset], bool],
        asset: Asset,
    ) -> tuple[Asset, WorkingSurface]: ...


# ── Fragment ──────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class Fragment:
    """
    Compositional subgraph unit — a reusable piece of graph with typed ports.

    .. deprecated:: V2
        Replaced by ``gtl.algebra.compose()`` and ``gtl.algebra.substitute()``
        operating on ``gtl.graph.Graph`` / ``gtl.function_model.GraphFunction``.
        Fragment will be removed once selection/application uses the V2 algebra.

    A Fragment is smaller than a Package: it defines a subgraph with explicit
    input/output contracts. Internal assets and edges are encapsulated — the
    outer graph sees only the ports.

    inputs:  Assets that must be provided by the outer graph (or a prior Fragment).
    outputs: Assets that the outer graph can consume (or a subsequent Fragment).
    assets:  Internal assets — not visible outside the fragment.
    edges:   Internal edges — carry their own evaluators.
    contexts: Additional constraint surfaces scoped to this fragment.

    Frozen for consistency with all other GTL types (ADR-017).
    """
    name: str
    inputs: tuple[Asset, ...] = ()
    outputs: tuple[Asset, ...] = ()
    assets: tuple[Asset, ...] = ()
    edges: tuple[Edge, ...] = ()
    contexts: tuple[Context, ...] = ()

    def __post_init__(self):
        if not self.outputs:
            raise ValueError(
                f"Fragment '{self.name}': must have at least one output"
            )
        # Verify internal edges reference only internal or port assets
        valid_names = (
            {a.name for a in self.inputs}
            | {a.name for a in self.outputs}
            | {a.name for a in self.assets}
        )
        for edge in self.edges:
            sources = edge.source if isinstance(edge.source, list) else [edge.source]
            for src in sources:
                if src.name not in valid_names:
                    raise ValueError(
                        f"Fragment '{self.name}', edge '{edge.name}': "
                        f"source '{src.name}' not in fragment scope"
                    )
            if edge.target.name not in valid_names:
                raise ValueError(
                    f"Fragment '{self.name}', edge '{edge.name}': "
                    f"target '{edge.target.name}' not in fragment scope"
                )

    @property
    def all_assets(self) -> tuple[Asset, ...]:
        """All assets: inputs + outputs + internal."""
        return self.inputs + self.outputs + self.assets


@dataclass
class Overlay:
    """
    Lawful package extension (add_*) or restriction (restrict_to).
    Both forms require approve — overlay activation is a governance act.

    .. deprecated:: V2
        Replaced by ``gtl.algebra.compose()`` and ``gtl.algebra.substitute()``
        operating on ``gtl.module_model.Module``. Overlay will be removed
        once Module composition supersedes Package overlays.

    Restriction overlays ARE profiles. No separate profile mechanism.
    """
    name: str
    on: "Package"
    restrict_to: Optional[list[str]] = None
    add_assets: list[Asset] = field(default_factory=list)
    add_edges: list[Edge] = field(default_factory=list)
    add_operators: list[Operator] = field(default_factory=list)
    add_rules: list[Rule] = field(default_factory=list)
    add_contexts: list[Context] = field(default_factory=list)
    max_iter: Optional[int] = None
    approve: Optional[Consensus] = None

    def __post_init__(self):
        if self.approve is None:
            raise ValueError(f"Overlay '{self.name}' must declare approve=consensus(n/m)")
        if self.restrict_to is not None and any([
            self.add_assets, self.add_edges, self.add_operators,
            self.add_rules, self.add_contexts,
        ]):
            raise ValueError(f"Overlay '{self.name}': restrict_to and add_* are mutually exclusive")


# ── PackageSnapshot (Finding 2) ────────────────────────────────────────────

@dataclass
class PackageSnapshot:
    """
    Runtime artifact — projection of package-definition events at a point in time.
    Never authored directly in GTL. Produced by the runtime when an overlay is activated
    through the governance pipeline.

    .. deprecated:: V2
        Coupled to ``Package``. Will be removed when ``Module`` replaces
        ``Package`` as the publication boundary. Provenance binding in V2
        uses Module metadata and event-stream projection instead.

    Constitutional binding contract:
        Every work event (edge_started, iteration_completed, edge_converged) must carry
        package_snapshot_id. This is non-optional. It is the mechanism by which exact
        historical replay under the correct law is possible.

    governing_snapshots[]:
        Artifacts crossing package boundaries carry this field — a list of all upstream
        snapshot IDs that materially shaped the artifact. Downstream work traces full
        provenance, not just the immediate parent snapshot.
    """
    snapshot_id: str        # e.g. "snap-genesis-obligations-v1.2.0"
    package_name: str
    version: str
    activated_at: str       # ISO 8601
    activated_by: str       # ID of the governance event that activated this snapshot

    def to_dict(self) -> dict:
        """Serialise to package_snapshot_activated event payload."""
        return {
            "event_type": "package_snapshot_activated",
            "snapshot_id": self.snapshot_id,
            "package_name": self.package_name,
            "version": self.version,
            "activated_at": self.activated_at,
            "activated_by": self.activated_by,
        }

    def work_binding(self) -> dict:
        """Minimal fields every work event must carry."""
        return {
            "package_name": self.package_name,
            "package_snapshot_id": self.snapshot_id,
        }


# ── Package ────────────────────────────────────────────────────────────────

@dataclass
class Package:
    """
    Bounded constitutional world.

    .. deprecated:: V2
        Legacy V1 type. Replaced by ``gtl.module_model.Module`` in V2.
        Module is a pure declaration boundary; runtime concerns (workers,
        requirements) belong to ABG. Package remains for backward compatibility
        with V1 domain packages and will be removed once all domain packages
        author Module/Graph/Node directly.

    Validated at construction — all invariants enforced immediately.
    Runtime serialises Package + governance event → PackageSnapshot.

    Audit surfaces (Finding 4):
        to_mermaid() renders TOPOLOGY — static package structure, background context.
        The primary operational human surface is TRAVERSAL — where work is now relative
        to the topology. Traversal is generated by the runtime from PackageSnapshot × work_events.
        These are distinct: topology does not change during a work run; traversal does.

    requirements: canonical list of REQ-* keys this Package is responsible for.
        Used by check-req-coverage as the authoritative source — no grepping.
        Empty = grep fallback (legacy mode).
    """
    name: str
    assets: list[Asset] = field(default_factory=list)
    edges: list[Edge] = field(default_factory=list)
    operators: list[Operator] = field(default_factory=list)
    rules: list[Rule] = field(default_factory=list)
    contexts: list[Context] = field(default_factory=list)
    overlays: list[Overlay] = field(default_factory=list)
    requirements: list[str] = field(default_factory=list)
    fragments: list[Fragment] = field(default_factory=list)

    def __post_init__(self):
        self._validate()
        if self.fragments:
            self._validate_composition()

    def _validate(self):
        errors = []
        declared_ops = {op.name for op in self.operators}

        for edge in self.edges:
            # Closed operator surface
            for op in edge.using:
                if op.name not in declared_ops:
                    errors.append(
                        f"Edge '{edge.name}': operator '{op.name}' not declared in package"
                    )
            # co_evolve consistency
            if edge.co_evolve and not isinstance(edge.source, list):
                errors.append(
                    f"Edge '{edge.name}': co_evolve=True requires source to be a list [A, B]"
                )

        if errors:
            raise ValueError(
                "Package validation failed:\n" + "\n".join(f"  - {e}" for e in errors)
            )

        # Warn about assets with no inbound edge that aren't graph roots.
        # An asset is a "target" if it appears as the target of any edge.
        # An asset is a "source" if it appears as the source of any edge.
        # A graph root is an asset that is a source but never a target.
        # An unreachable asset is one that is never a target AND never a source
        # (i.e., it appears in no edge at all), or more precisely: it has no
        # inbound edge and is not a graph root (not a source of any edge).
        targets: set[str] = set()
        sources: set[str] = set()
        for edge in self.edges:
            targets.add(edge.target.name)
            if isinstance(edge.source, list):
                sources.update(a.name for a in edge.source)
            else:
                sources.add(edge.source.name)

        for asset in self.assets:
            if asset.name not in targets and asset.name not in sources:
                warnings.warn(
                    f"Asset '{asset.name}' has no inbound edge and is not a "
                    f"graph root — it may be unreachable",
                    stacklevel=2,
                )

    def _validate_composition(self):
        """
        Validate fragment composition contracts (REQ-F-FRAG-002).

        For each fragment:
        - Inputs must be satisfied by existing Package assets or prior fragment outputs
        - The composed graph (package edges + all fragment edges) must be a valid DAG
        """
        errors = []
        # Collect all available asset names from the package level
        available = {a.name for a in self.assets}
        for edge in self.edges:
            # Targets produced by existing edges are available
            available.add(edge.target.name)

        for frag in self.fragments:
            # Check inputs are satisfied
            for inp in frag.inputs:
                if inp.name not in available:
                    errors.append(
                        f"Fragment '{frag.name}': input '{inp.name}' not provided "
                        f"by package assets or prior fragment outputs"
                    )
            # Fragment outputs become available for subsequent fragments
            for out in frag.outputs:
                available.add(out.name)

        if errors:
            raise ValueError(
                "Fragment composition failed:\n"
                + "\n".join(f"  - {e}" for e in errors)
            )

        # Verify composed graph is acyclic (topological sort).
        # Collect all edges: package + all fragment internals.
        all_edges = list(self.edges)
        for frag in self.fragments:
            all_edges.extend(frag.edges)

        # Build adjacency and in-degree for topological sort
        nodes: set[str] = set()
        adj: dict[str, list[str]] = {}
        in_deg: dict[str, int] = {}
        for edge in all_edges:
            sources = edge.source if isinstance(edge.source, list) else [edge.source]
            tgt = edge.target.name
            nodes.add(tgt)
            in_deg.setdefault(tgt, 0)
            for s in sources:
                nodes.add(s.name)
                in_deg.setdefault(s.name, 0)
                adj.setdefault(s.name, []).append(tgt)
                in_deg[tgt] = in_deg.get(tgt, 0) + 1

        # Kahn's algorithm — detect cycles
        # co_evolve edges are bidirectional in structure but NOT cycles:
        # they represent mutual refinement within a single iterate() call.
        # Skip cycle detection for co_evolve edges (they're intentional).
        queue = [n for n in nodes if in_deg.get(n, 0) == 0]
        visited = 0
        while queue:
            node = queue.pop(0)
            visited += 1
            for neighbor in adj.get(node, []):
                in_deg[neighbor] -= 1
                if in_deg[neighbor] == 0:
                    queue.append(neighbor)

        if visited < len(nodes):
            errors.append(
                "Fragment composition introduces a cycle in the graph"
            )
            raise ValueError(
                "Fragment composition failed:\n"
                + "\n".join(f"  - {e}" for e in errors)
            )

    def describe(self) -> str:
        lines = [f"Package: {self.name}"]
        lines.append(f"  assets    ({len(self.assets)}): " + ", ".join(a.name for a in self.assets))
        lines.append(f"  operators ({len(self.operators)}): " + ", ".join(o.name for o in self.operators))
        lines.append(f"  rules     ({len(self.rules)}): " + ", ".join(r.name for r in self.rules))
        lines.append(f"  contexts  ({len(self.contexts)}): " + ", ".join(c.name for c in self.contexts))
        lines.append(f"  edges     ({len(self.edges)}):")
        for e in self.edges:
            src = (
                " × ".join(a.name for a in e.source)
                if isinstance(e.source, list)
                else e.source.name
            )
            arrow = "<->" if e.co_evolve else "->"
            gov = f"  [govern: {e.rule.name}]" if e.rule else ""
            ops = ", ".join(o.name for o in e.using)
            lines.append(f"    {e.name}: {src} {arrow} {e.target.name}  confirm={e.confirm}{gov}")
            lines.append(f"      using: {ops}")
        if self.overlays:
            lines.append(f"  overlays  ({len(self.overlays)}):")
            for ov in self.overlays:
                if ov.restrict_to:
                    lines.append(
                        f"    {ov.name}: restrict to [{', '.join(ov.restrict_to)}]"
                        + (f" max_iter={ov.max_iter}" if ov.max_iter else "")
                    )
                else:
                    lines.append(f"    {ov.name}: additive")
        return "\n".join(lines)

    def to_mermaid(self, overlay: Optional[Overlay] = None) -> str:
        """
        Render package TOPOLOGY as a Mermaid flowchart.

        This is TOPOLOGY — the static package structure. It is background context,
        not the primary operational human surface. The operational surface is TRAVERSAL:
        where work is now relative to this topology, generated from PackageSnapshot × work_events.

        If an overlay with restrict_to is supplied, only those assets/edges are shown.
        LLM-generated Mermaid from Package.describe() is acceptable for documentation.
        Deterministic to_mermaid() is warranted when review-grade projection is required.
        """
        active_asset_names: Optional[set[str]] = None
        if overlay and overlay.restrict_to:
            active_asset_names = set(overlay.restrict_to)

        def _node(a: Asset) -> str:
            label = a.name.replace("_", " ")
            if a.operative:
                return f'  {a.name}(["{label}\\noperative: {a.operative}"])'
            return f'  {a.name}["{label}"]'

        def _visible(a: Asset) -> bool:
            return active_asset_names is None or a.name in active_asset_names

        lines = ["```mermaid", "graph LR"]
        lines.append("  classDef governed fill:#ffeeba,stroke:#d4a017")
        lines.append("  classDef product  fill:#d4edda,stroke:#28a745")
        lines.append("  classDef coevolve fill:#cce5ff,stroke:#004085")

        for a in self.assets:
            if _visible(a):
                lines.append(_node(a))

        for e in self.edges:
            sources = e.source if isinstance(e.source, list) else [e.source]
            if not all(_visible(s) for s in sources) or not _visible(e.target):
                continue

            ops_label = ", ".join(o.name for o in e.using[:2])
            if len(e.using) > 2:
                ops_label += f" +{len(e.using)-2}"
            edge_label = f"|{ops_label} [{e.confirm}]|"

            if e.co_evolve:
                a, b = sources[0], sources[1]
                lines.append(f"  {a.name} <-->|co_evolve| {b.name}")
                lines.append(f"  {a.name}:::coevolve")
                lines.append(f"  {b.name}:::coevolve")
            elif len(sources) > 1:
                join = "join_" + "_".join(s.name for s in sources)
                join_label = " × ".join(s.name for s in sources)
                lines.append(f'  {join}(("{join_label}"))')
                for s in sources:
                    lines.append(f"  {s.name} --> {join}")
                lines.append(f"  {join} --{edge_label}--> {e.target.name}")
                lines.append(f"  {join}:::product")
            else:
                src = sources[0]
                lines.append(f"  {src.name} --{edge_label}--> {e.target.name}")
                if e.rule:
                    lines.append(f"  {e.target.name}:::governed")

        lines.append("```")
        return "\n".join(lines)
