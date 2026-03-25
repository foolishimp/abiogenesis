"""
GTL — Genesis Topology Language, V2.

Public surface:

    gtl.graph          — Graph, Node, GraphVector, Context
    gtl.operator_model — Regime, F_D, F_P, F_H, Operator, Evaluator, Rule
    gtl.function_model — GraphFunction
    gtl.module_model   — Module, ModuleImport
    gtl.algebra        — edge, compose, substitute, identity

V1 types (Package, Asset, Edge, Fragment, Overlay) remain in gtl.core
for backward compatibility during quarantine. They are not the public surface.
"""
from .graph import Graph, Node, GraphVector, Context
from .operator_model import (
    Regime, F_D, F_P, F_H,
    Operator, Evaluator, Rule,
    Consensus, consensus,
)
from .function_model import GraphFunction
from .module_model import Module, ModuleImport

__all__ = [
    # Graph structure
    "Graph", "Node", "GraphVector", "Context",
    # Operator model
    "Regime", "F_D", "F_P", "F_H",
    "Operator", "Evaluator", "Rule",
    "Consensus", "consensus",
    # Function model
    "GraphFunction",
    # Module model
    "Module", "ModuleImport",
]
