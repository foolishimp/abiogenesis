# Implements: REQ-L-GTL2-MODULE
"""
gtl.core — Re-exports for import compatibility.

Canonical definitions live in their respective modules:
    gtl.operator_model — Evaluator, Operator, Rule, F_D, F_P, F_H, consensus
    gtl.graph          — Context
    genesis.binding    — Job, Worker, WorkingSurface
"""
from gtl.operator_model import (  # noqa: F401
    F_D, F_P, F_H, Regime,
    Evaluator, Operator, Rule,
    Consensus, consensus,
)

from gtl.graph import Context  # noqa: F401


def __getattr__(name):
    if name in ("Job", "Worker", "WorkingSurface"):
        from genesis.binding import Job, Worker, WorkingSurface
        globals()["Job"] = Job
        globals()["Worker"] = Worker
        globals()["WorkingSurface"] = WorkingSurface
        return globals()[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
