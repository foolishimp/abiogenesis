# Implements: REQ-R-ABG2-INTERPRET-001 (bridge only — not full satisfaction)
"""
genesis.graph_adapter — Bridge adapter: V2 Module → V1 runtime objects.

DEPRECATED — V1 compatibility only, not the execution target.
Still in the hot path (services.py, cli_adapter.py) until Job wraps
GraphVector directly and Scope consumes Module natively. Once the
structural rewiring completes (Phase 4e B1/B4), this module is deleted.

Converts a V2 Module (with Graph/Node/GraphVector) into the V1 runtime
objects (Package/Asset/Edge/Job/Worker) that the existing engine consumes.

Bridge contract:
- Node.markov → Asset.markov (REQ-L-GTL2-NODE-008)
- Evaluator fields: V2 vocabulary (regime/description/binding), not V1
- GraphVector.operators: V2 Operator instances from gtl.operator_model.
- Contexts are duck-type compatible between V1 and V2.
"""
from __future__ import annotations

from gtl.graph import Graph, Node, GraphVector
from gtl.module_model import Module
from gtl.core import Asset, Edge, Package
from genesis.binding import Job, Worker


def _node_to_asset(node: Node, *, id_format: str = "") -> Asset:
    """Convert V2 Node to V1 Asset. Preserves markov (REQ-L-GTL2-NODE-008)."""
    return Asset(
        name=node.name,
        id_format=id_format or f"{node.name.upper()}-{{SEQ}}",
        markov=list(node.markov),
    )


def module_to_package(
    module: Module,
    worker_id: str = "default",
) -> tuple[Package, Worker]:
    """Convert V2 Module → V1 (Package, Worker) for engine consumption.

    Walks module.graphs, converting:
      Node → Asset
      GraphVector → Edge + Job
      Module operators/contexts → Package operators/contexts

    Returns (Package, Worker) ready for Scope construction.
    """
    node_assets: dict[str, Asset] = {}
    all_edges: list[Edge] = []
    all_jobs: list[Job] = []
    all_operators: list = []
    all_rules: list = []
    all_contexts: list = []
    seen_op_names: set[str] = set()
    seen_rule_names: set[str] = set()
    seen_ctx_names: set[str] = set()

    for graph in module.graphs:
        # Convert nodes to assets
        for node in graph.nodes:
            if node.name not in node_assets:
                node_assets[node.name] = _node_to_asset(node)

        # Collect graph-level contexts
        for ctx in graph.contexts:
            if ctx.name not in seen_ctx_names:
                all_contexts.append(ctx)
                seen_ctx_names.add(ctx.name)

        # Convert vectors → edges + jobs
        for vec in graph.vectors:
            if vec.source is None or vec.target is None:
                continue

            # Source: single Node or tuple of Nodes
            if isinstance(vec.source, tuple):
                source = [node_assets[n.name] for n in vec.source]
            else:
                source = node_assets[vec.source.name]

            target = node_assets[vec.target.name]

            # Collect operators
            for op in vec.operators:
                if op.name not in seen_op_names:
                    all_operators.append(op)
                    seen_op_names.add(op.name)

            # Collect rules
            if vec.rule is not None:
                rule_name = getattr(vec.rule, "name", str(vec.rule))
                if rule_name not in seen_rule_names:
                    all_rules.append(vec.rule)
                    seen_rule_names.add(rule_name)

            # Collect vector-level contexts
            for ctx in vec.contexts:
                if ctx.name not in seen_ctx_names:
                    all_contexts.append(ctx)
                    seen_ctx_names.add(ctx.name)

            # Build V1 Edge
            co_evolve = isinstance(vec.source, tuple)
            edge = Edge(
                name=vec.name,
                source=source,
                target=target,
                using=list(vec.operators),
                rule=vec.rule,
                context=list(vec.contexts),
                co_evolve=co_evolve,
            )
            all_edges.append(edge)

            # Build Job if vector has evaluators
            if vec.evaluators:
                job = Job(vector=vec, evaluators=list(vec.evaluators))
                all_jobs.append(job)

    if not all_jobs:
        raise ValueError(
            f"module_to_package({module.name!r}): no jobs created — "
            f"GraphVectors must carry evaluators for the engine to iterate"
        )

    pkg = Package(
        name=module.name,
        assets=list(node_assets.values()),
        edges=all_edges,
        operators=all_operators,
        rules=all_rules,
        contexts=all_contexts,
        requirements=module.metadata.get("requirements", []),
    )

    worker = Worker(id=worker_id, can_execute=all_jobs)
    return pkg, worker
