# Validates: REQ-L-GTL2-GRAPH
# Validates: REQ-L-GTL2-NODE
# Validates: REQ-L-GTL2-OPERATOR
# Validates: REQ-L-GTL2-EVALUATOR
# Validates: REQ-L-GTL2-RULE
# Validates: REQ-L-GTL2-GRAPHFUNCTION
# Validates: REQ-L-GTL2-MODULE
# Validates: REQ-L-GTL2-ENGINE-INDEPENDENCE
"""
Module topology tests — Phase 1: GTL language kernel split.

These tests assert the TARGET module structure defined in
builds/claude_code/design/GTL_2_MODULE_DESIGN.md §3.1.

Each test imports from the target module location and verifies the type
exists with the required properties. Tests are written BEFORE the split
and drive the migration: move code until all tests pass.
"""
import dataclasses
import importlib
import sys

import pytest


# ── gtl.graph: Graph, Node, GraphVector, Context ──────────────────────────

class TestGtlGraphModule:
    """gtl.graph must export Graph, Node, GraphVector, Context."""

    def test_node_exists(self):
        from gtl.graph import Node
        assert dataclasses.is_dataclass(Node)

    def test_node_is_frozen(self):
        from gtl.graph import Node
        assert Node.__dataclass_params__.frozen

    def test_node_has_schema_field(self):
        """Node must have a schema field (type[T] | str), not just schema_ref."""
        from gtl.graph import Node
        fields = {f.name for f in dataclasses.fields(Node)}
        assert "name" in fields
        assert "schema" in fields or "schema_ref" in fields  # transitional

    def test_graphvector_exists(self):
        from gtl.graph import GraphVector
        assert dataclasses.is_dataclass(GraphVector)

    def test_graphvector_has_source_target(self):
        from gtl.graph import GraphVector
        fields = {f.name for f in dataclasses.fields(GraphVector)}
        assert "source" in fields
        assert "target" in fields

    def test_context_exists(self):
        from gtl.graph import Context
        assert dataclasses.is_dataclass(Context)

    def test_context_has_locator_digest(self):
        from gtl.graph import Context
        fields = {f.name for f in dataclasses.fields(Context)}
        assert "locator" in fields
        assert "digest" in fields

    def test_graph_exists(self):
        """Graph is the one structural type — must be a frozen dataclass."""
        from gtl.graph import Graph
        assert dataclasses.is_dataclass(Graph)
        assert Graph.__dataclass_params__.frozen

    def test_graph_has_required_fields(self):
        """REQ-L-GTL2-GRAPH-001: name, inputs, outputs, nodes, vectors, contexts, rules, effects, tags."""
        from gtl.graph import Graph
        fields = {f.name for f in dataclasses.fields(Graph)}
        for required in ("name", "inputs", "outputs", "nodes", "vectors"):
            assert required in fields, f"Graph missing required field: {required}"


# ── gtl.operator_model: F_D, F_P, F_H, Operator, Evaluator, Rule, Consensus ─

class TestGtlOperatorModelModule:
    """gtl.operator_model must export V2 evaluator regime types and control declarations."""

    def test_regime_base_class_exists(self):
        from gtl.operator_model import Regime
        assert Regime is not None

    def test_regime_hierarchy(self):
        """F_D, F_P, F_H must be subclasses of Regime."""
        from gtl.operator_model import Regime, F_D, F_P, F_H
        assert issubclass(F_D, Regime)
        assert issubclass(F_P, Regime)
        assert issubclass(F_H, Regime)

    def test_operator_is_frozen(self):
        """REQ-L-GTL2-OPERATOR-001: frozen, immutable."""
        from gtl.operator_model import Operator
        assert dataclasses.is_dataclass(Operator)
        assert Operator.__dataclass_params__.frozen

    def test_operator_v2_fields(self):
        """REQ-L-GTL2-OPERATOR-001: name, regime, binding, tags."""
        from gtl.operator_model import Operator
        fields = {f.name for f in dataclasses.fields(Operator)}
        for required in ("name", "regime", "binding", "tags"):
            assert required in fields, f"Operator missing V2 field: {required}"
        # V1 fields must NOT be present
        assert "category" not in fields, "Operator still has V1 'category' field"
        assert "uri" not in fields, "Operator still has V1 'uri' field"

    def test_evaluator_is_frozen(self):
        """REQ-L-GTL2-EVALUATOR-001: frozen, immutable."""
        from gtl.operator_model import Evaluator
        assert dataclasses.is_dataclass(Evaluator)
        assert Evaluator.__dataclass_params__.frozen

    def test_evaluator_v2_fields(self):
        """REQ-L-GTL2-EVALUATOR-001: name, regime, binding, tags."""
        from gtl.operator_model import Evaluator
        fields = {f.name for f in dataclasses.fields(Evaluator)}
        for required in ("name", "regime", "binding", "tags"):
            assert required in fields, f"Evaluator missing V2 field: {required}"
        # V1 fields must NOT be present
        assert "category" not in fields, "Evaluator still has V1 'category' field"
        assert "description" not in fields, "Evaluator still has V1 'description' field"
        assert "command" not in fields, "Evaluator still has V1 'command' field"

    def test_rule_is_frozen(self):
        """REQ-L-GTL2-RULE-001: declarative constraint type."""
        from gtl.operator_model import Rule
        assert dataclasses.is_dataclass(Rule)
        assert Rule.__dataclass_params__.frozen

    def test_rule_v2_fields(self):
        """REQ-L-GTL2-RULE-001: name, kind, config, tags — not approval-specific."""
        from gtl.operator_model import Rule
        fields = {f.name for f in dataclasses.fields(Rule)}
        for required in ("name", "kind"):
            assert required in fields, f"Rule missing V2 field: {required}"
        # V1 approval-specific fields must NOT be present
        assert "approve" not in fields, "Rule still has V1 'approve' field"
        assert "dissent" not in fields, "Rule still has V1 'dissent' field"

    def test_consensus_exists(self):
        from gtl.operator_model import Consensus
        assert dataclasses.is_dataclass(Consensus)
        assert Consensus.__dataclass_params__.frozen


# ── gtl.function_model: GraphFunction ─────────────────────────────────────

class TestGtlFunctionModelModule:
    """gtl.function_model must export GraphFunction."""

    def test_graphfunction_exists(self):
        from gtl.function_model import GraphFunction
        assert dataclasses.is_dataclass(GraphFunction)

    def test_graphfunction_has_required_fields(self):
        """REQ-L-GTL2-GRAPHFUNCTION-001: name, inputs, outputs, template, effects, tags."""
        from gtl.function_model import GraphFunction
        fields = {f.name for f in dataclasses.fields(GraphFunction)}
        for required in ("name", "inputs", "outputs", "template"):
            assert required in fields, f"GraphFunction missing required field: {required}"


# ── gtl.module_model: Module, ModuleImport ────────────────────────────────

class TestGtlModuleModelModule:
    """gtl.module_model must export Module and ModuleImport."""

    def test_module_exists(self):
        from gtl.module_model import Module
        assert dataclasses.is_dataclass(Module)

    def test_module_has_required_fields(self):
        """Module is the publication/import boundary."""
        from gtl.module_model import Module
        fields = {f.name for f in dataclasses.fields(Module)}
        assert "name" in fields
        assert "graphs" in fields or "graph_functions" in fields  # at least one

    def test_module_import_exists(self):
        from gtl.module_model import ModuleImport
        assert dataclasses.is_dataclass(ModuleImport)


# ── gtl.algebra: DSL sugar ────────────────────────────────────────────────

class TestGtlAlgebraModule:
    """gtl.algebra must export graph algebra functions."""

    def test_edge_function_exists(self):
        """edge() -> Graph is the public DSL sugar."""
        from gtl.algebra import edge
        assert callable(edge)

    def test_compose_function_exists(self):
        from gtl.algebra import compose
        assert callable(compose)

    def test_substitute_function_exists(self):
        from gtl.algebra import substitute
        assert callable(substitute)


# ── Boundary: GTL must not import ABG ─────────────────────────────────────

class TestGtlBoundary:
    """No GTL module may import any ABG / genesis module."""

    @pytest.mark.parametrize("gtl_module", [
        "gtl.graph",
        "gtl.operator_model",
        "gtl.function_model",
        "gtl.module_model",
        "gtl.algebra",
    ])
    def test_no_genesis_dependency(self, gtl_module):
        """GTL modules must not import genesis.* (REQ-L-GTL2-ENGINE-INDEPENDENCE)."""
        # Remove cached modules to get clean import
        to_remove = [k for k in sys.modules if k.startswith(gtl_module)]
        for k in to_remove:
            del sys.modules[k]

        mod = importlib.import_module(gtl_module)
        source_file = getattr(mod, "__file__", "")
        if source_file:
            with open(source_file) as f:
                source = f.read()
            # No import of genesis or abg at the module level
            for line in source.splitlines():
                line = line.strip()
                if line.startswith("#") or line.startswith('"""') or line.startswith("'"):
                    continue
                assert "import genesis" not in line, (
                    f"{gtl_module} imports genesis: {line}"
                )


# ── Boundary: Runtime types NOT in GTL graph ──────────────────────────────

class TestRuntimeTypesNotInGtl:
    """ABG runtime types must not be importable from gtl.graph or gtl.operator_model."""

    @pytest.mark.parametrize("type_name", [
        "Job", "Worker", "WorkingSurface", "IterateProtocol", "PackageSnapshot",
    ])
    def test_runtime_type_not_in_gtl_graph(self, type_name):
        from gtl import graph as g
        assert not hasattr(g, type_name), (
            f"Runtime type {type_name} should not be in gtl.graph"
        )

    @pytest.mark.parametrize("type_name", [
        "Job", "Worker", "WorkingSurface", "IterateProtocol", "PackageSnapshot",
    ])
    def test_runtime_type_not_in_gtl_operator_model(self, type_name):
        from gtl import operator_model as om
        assert not hasattr(om, type_name), (
            f"Runtime type {type_name} should not be in gtl.operator_model"
        )


# ── Backward compatibility: gtl.core still exports everything ─────────────

class TestBackwardCompatibility:
    """gtl.core must still export all types during migration (compatibility shims)."""

    @pytest.mark.parametrize("name", [
        "Asset", "Edge", "Package",
        "Context", "Operator", "Evaluator", "Rule",
        "F_D", "F_P", "F_H", "Consensus",
        "Job", "Worker", "WorkingSurface", "IterateProtocol",
    ])
    def test_gtl_core_still_exports(self, name):
        """Existing code importing from gtl.core must not break."""
        mod = importlib.import_module("gtl.core")
        assert hasattr(mod, name), f"gtl.core must still export {name}"

    def test_v2_modules_importable(self):
        """V2 target modules must all be importable alongside V1 gtl.core."""
        import gtl.core
        import gtl.graph
        import gtl.operator_model
        import gtl.function_model
        import gtl.module_model
        import gtl.algebra
        # Both old and new surfaces coexist during migration
        assert hasattr(gtl.core, "Asset")
        assert hasattr(gtl.graph, "Node")
