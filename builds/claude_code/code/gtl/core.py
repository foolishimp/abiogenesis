# Implements: REQ-L-GTL2-MODULE
"""
gtl.core — Re-exports for import compatibility.

Canonical definitions live in their respective modules:
    gtl.operator_model — Evaluator, Operator, Rule, F_D, F_P, F_H
    gtl.graph          — Context
    genesis.binding    — ExecutableJob, Worker, WorkSurface
"""
from gtl.operator_model import (  # noqa: F401
    F_D, F_P, F_H, Regime,
    Evaluator, Operator, Rule,
)

from gtl.graph import Context  # noqa: F401


def __getattr__(name):
    _binding_names = {
        "Job": "ExecutableJob",
        "ExecutableJob": "ExecutableJob",
        "Worker": "Worker",
        "WorkSurface": "WorkSurface",
    }
    if name in _binding_names:
        from genesis import binding
        obj = getattr(binding, _binding_names[name])
        globals()[name] = obj
        return obj
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
