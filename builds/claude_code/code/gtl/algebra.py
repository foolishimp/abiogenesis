# Implements: REQ-L-GTL2-COMPOSE (edge() only; compose/substitute are stubs)
"""
gtl.algebra — Graph algebra: composition, substitution, DSL sugar.

Pure functions over GTL graph types. No engine/runtime dependency.
"""
from __future__ import annotations

from gtl.graph import Graph, Node, GraphVector
from gtl.function_model import GraphFunction


def edge(source: Node, target: Node, *, operators=(), evaluators=(), **kw) -> Graph:
    """Construct a minimal one-vector graph (DSL sugar)."""
    vector = GraphVector(
        name=f"{source.name}→{target.name}",
        source=source,
        target=target,
        operators=operators,
        evaluators=evaluators,
        **kw,
    )
    return Graph(
        name=f"{source.name}→{target.name}",
        inputs=(source,),
        outputs=(target,),
        nodes=(source, target),
        vectors=(vector,),
    )


def compose(f: GraphFunction, g: GraphFunction) -> GraphFunction:
    """Sequential composition when f.outputs satisfy g.inputs."""
    # Stub — full implementation in Phase 2+
    raise NotImplementedError("compose() — Phase 2 implementation")


def substitute(outer: Graph, contract_vector: str, inner: Graph) -> Graph:
    """Replace a coarse contract step with an interface-compatible inner graph."""
    # Stub — full implementation in Phase 2+
    raise NotImplementedError("substitute() — Phase 2 implementation")
