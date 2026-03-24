# Implements: REQ-L-GTL2-GRAPHFUNCTION
"""
gtl.function_model — Reusable workflow programs.

GraphFunction is a parameterized graph template with explicit interface
and declared effects.

No external dependencies. Dataclasses + stdlib only.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from gtl.graph import Graph, Node


@dataclass(frozen=True)
class GraphFunction:
    """
    Reusable named workflow abstraction — materializable graph template.

    template: callable (Python DSL convenience) or serializable graph-template
    reference (str). The semantic contract is "materializable graph template."
    """
    name: str
    inputs: tuple[Node, ...] = ()
    outputs: tuple[Node, ...] = ()
    template: Callable[..., Graph] | str = ""
    effects: tuple = ()
    tags: tuple[str, ...] = ()
