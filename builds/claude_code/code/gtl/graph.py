# Implements: REQ-L-GTL2-GRAPH
# Implements: REQ-L-GTL2-NODE
# Implements: REQ-L-GTL2-INTERFACE
"""
gtl.graph — Graph structure primitives.

Graph is the one first-class structural type. Node[T] is the typed local
locus. GraphVector is the internal adjacency record (not public ontology).

No external dependencies. Dataclasses + stdlib only.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional


# ── Context ───────────────────────────────────────────────────────────────

_CONTEXT_SCHEMES = ("git://", "workspace://", "event://", "registry://")


@dataclass
class Context:
    """
    Externally-located, snapshot-bound constraint dimension.

    locator: URI using a known scheme — used for discovery and retrieval.
    digest: sha256 content hash — the constitutional binding for replay.
    """
    name: str
    locator: str
    digest: str

    def __post_init__(self):
        if not self.digest.startswith("sha256:"):
            raise ValueError(f"Context.digest must start with 'sha256:': {self.digest!r}")
        if not any(self.locator.startswith(s) for s in _CONTEXT_SCHEMES):
            raise ValueError(
                f"Context.locator must use a known scheme {_CONTEXT_SCHEMES}: {self.locator!r}"
            )


# ── Node (V2 name for Asset) ─────────────────────────────────────────────

@dataclass(frozen=True)
class Node:
    """
    Typed local locus within a graph. V2 replacement for Asset.

    schema: type reference or URI string — supports both concrete Python
    types and string references (e.g. "Vector[intent]").
    """
    name: str
    schema: type | str = ""
    tags: tuple[str, ...] = ()


# ── GraphVector (internal adjacency record) ──────────────────────────────

@dataclass(frozen=True)
class GraphVector:
    """
    Internal adjacency record. Not public ontology.

    Represents a directed step between typed nodes, carrying local
    operator/evaluator metadata. Used by the engine for scheduling,
    binding, and substitution.
    """
    name: str
    source: Node | tuple[Node, ...] = None  # type: ignore[assignment]
    target: Node = None                      # type: ignore[assignment]
    operators: tuple = ()
    evaluators: tuple = ()
    contexts: tuple[Context, ...] = ()
    rule: Any = None
    allows_subwork: bool = False
    tags: tuple[str, ...] = ()


# ── Graph ─────────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class Graph:
    """
    The one first-class structural type in GTL 2.x.

    All workflow structure is graph: a primitive edge, a multi-step workflow,
    a subgraph, a reusable workflow, a refined workflow.

    REQ-L-GTL2-GRAPH-001: frozen, immutable value type with name, inputs,
    outputs, nodes, vectors, contexts, rules, effects, tags.
    """
    name: str
    inputs: tuple[Node, ...] = ()
    outputs: tuple[Node, ...] = ()
    nodes: tuple[Node, ...] = ()
    vectors: tuple[GraphVector, ...] = ()
    contexts: tuple[Context, ...] = ()
    rules: tuple = ()
    effects: tuple = ()
    tags: tuple[str, ...] = ()
