"""
GTL — Genesis Topology Language.

    gtl.graph          — Graph, Node, GraphVector, Context
    gtl.operator_model — Regime, F_D, F_P, F_H, Operator, Evaluator, Rule
    gtl.function_model — GraphFunction
    gtl.work_model     — ContractRef, Role, Job
    gtl.module_model   — Module, ModuleImport
    gtl.algebra        — edge, compose, substitute, identity

Prime GTL surface: Context, Node, Graph, GraphFunction, Operator, Evaluator,
Rule, Job, Role, Module. ContractRef and ModuleImport are structural helpers.
"""
from .graph import Graph, Node, GraphVector, Context
from .operator_model import (
    Regime, F_D, F_P, F_H,
    Operator, Evaluator, Rule,
)
from .function_model import GraphFunction
from .work_model import ContractRef, Role, Job
from .module_model import Module, ModuleImport

__all__ = [
    # Graph structure (prime)
    "Graph", "Node", "GraphVector", "Context",
    # Operator model (prime)
    "Regime", "F_D", "F_P", "F_H",
    "Operator", "Evaluator", "Rule",
    # Function model (prime)
    "GraphFunction",
    # Work model (prime)
    "ContractRef", "Role", "Job",
    # Module model (prime)
    "Module", "ModuleImport",
]
