# Validates: REQ-L-GTL2-MODULE
# Validates: REQ-L-GTL2-GRAPH
# Validates: REQ-L-GTL2-NODE
# (bridge-phase — validates V2 authoring; does NOT prove V2-native interpretation per REQ-R-ABG2-INTERPRET-001)
"""
V2 domain scenarios — validates the actual V2-rewritten domain packages.

Loads the real project_package, genesis_core, and abiogenesis Modules
and verifies the bridge produces structurally correct V1 runtime objects.

TRACE HONESTY: These tests prove that V2-authored domain Modules bridge
correctly into the V1 engine. They do NOT prove V2-native interpretation.
Full ABG2-INTERPRET satisfaction requires Phase 5.
"""
import pytest

from gtl.graph import Graph, Node, GraphVector
from gtl.module_model import Module
from genesis.graph_adapter import module_to_package


@pytest.mark.integration
class TestProjectPackageModule:
    """The genesis_sdlc project_package Module bridges correctly."""

    def test_module_is_pure_gtl(self):
        """project_package.module has no ABG imports at module level."""
        from gtl_spec.packages import project_package
        module = project_package.module

        assert isinstance(module, Module)
        assert module.name == "project_package"
        # No package/worker attributes — those were removed
        assert not hasattr(project_package, "package")
        assert not hasattr(project_package, "worker")

    def test_module_has_correct_structure(self):
        """7 nodes, 6 vectors, 1 graph, 17 requirements."""
        from gtl_spec.packages.project_package import module

        assert len(module.graphs) == 1
        graph = module.graphs[0]
        assert graph.name == "sdlc"

        assert len(graph.nodes) == 7
        node_names = {n.name for n in graph.nodes}
        assert node_names == {
            "intent", "requirements", "feature_decomp", "design",
            "code", "unit_tests", "uat_tests",
        }

        assert len(graph.vectors) == 6
        vec_names = {v.name for v in graph.vectors}
        assert "intent→requirements" in vec_names
        assert "code↔unit_tests" in vec_names
        assert "unit_tests→uat_tests" in vec_names

        assert len(module.metadata["requirements"]) == 17

    def test_bridge_produces_valid_package(self):
        """Bridge produces Package with correct assets, edges, operators, requirements."""
        from gtl_spec.packages.project_package import module

        pkg, worker = module_to_package(module, worker_id="test")

        assert pkg.name == "project_package"
        assert len(pkg.assets) == 7
        assert len(pkg.edges) == 6
        assert len(pkg.requirements) == 17
        assert worker.id == "test"
        assert len(worker.can_execute) == 6  # 6 vectors with evaluators = 6 jobs

    def test_co_evolve_on_tdd_edge(self):
        """code↔unit_tests vector has tuple source → co_evolve Edge."""
        from gtl_spec.packages.project_package import module

        # Check V2 vector
        graph = module.graphs[0]
        tdd_vec = [v for v in graph.vectors if v.name == "code↔unit_tests"][0]
        assert isinstance(tdd_vec.source, tuple)
        assert len(tdd_vec.source) == 2

        # Check bridge output
        pkg, _ = module_to_package(module)
        tdd_edge = [e for e in pkg.edges if e.name == "code↔unit_tests"][0]
        assert tdd_edge.co_evolve is True
        assert isinstance(tdd_edge.source, list)

    def test_rules_on_gated_edges(self):
        """Edges with F_H evaluators carry the standard_gate rule."""
        from gtl_spec.packages.project_package import module

        pkg, _ = module_to_package(module)
        gated_edges = [e for e in pkg.edges if e.rule is not None]
        assert len(gated_edges) >= 3  # intent→req, req→feat, feat→design, unit→uat

        for e in gated_edges:
            assert e.rule.name == "standard_gate"

    def test_contexts_flow_through(self):
        """Contexts defined on vectors appear in Package."""
        from gtl_spec.packages.project_package import module

        pkg, _ = module_to_package(module)
        ctx_names = {c.name for c in pkg.contexts}
        assert "bootloader" in ctx_names
        assert "genesis_sdlc_spec" in ctx_names

    def test_evaluator_commands_preserved(self):
        """V1 Evaluator command strings survive the bridge."""
        from gtl_spec.packages.project_package import module

        pkg, worker = module_to_package(module)
        # Find the impl_tags evaluator via jobs
        for job in worker.can_execute:
            for ev in job.evaluators:
                if ev.name == "impl_tags":
                    assert ev.binding != ""
                    assert "check-tags" in ev.binding
                    return
        pytest.fail("impl_tags evaluator not found in any job")


@pytest.mark.integration
class TestGenesisCoreModule:
    """The genesis_core Module bridges correctly."""

    def test_module_structure(self):
        """6 nodes, 5 vectors, 14 requirements."""
        from gtl_spec.packages.genesis_core import module

        assert isinstance(module, Module)
        assert module.name == "genesis_v1"
        assert len(module.graphs) == 1
        assert len(module.graphs[0].nodes) == 6
        assert len(module.graphs[0].vectors) == 5
        assert len(module.metadata["requirements"]) == 14

    def test_bridge_produces_valid_package(self):
        """Bridge produces correct Package."""
        from gtl_spec.packages.genesis_core import module

        pkg, worker = module_to_package(module, worker_id="test")
        assert pkg.name == "genesis_v1"
        assert len(pkg.assets) == 6
        assert len(pkg.edges) == 5
        assert len(pkg.requirements) == 14


@pytest.mark.integration
class TestAbiogenesisModule:
    """The abiogenesis Module bridges correctly."""

    def test_module_structure(self):
        """7 nodes (including bootloader_doc), 6 vectors, 45 requirements."""
        from gtl_spec.packages.abiogenesis import module

        assert isinstance(module, Module)
        assert module.name == "abiogenesis"
        assert len(module.graphs) == 1

        graph = module.graphs[0]
        assert len(graph.nodes) == 7
        node_names = {n.name for n in graph.nodes}
        assert "bootloader_doc" in node_names

        assert len(graph.vectors) == 6
        assert len(module.metadata["requirements"]) == 45

    def test_bridge_produces_valid_package(self):
        """Bridge produces correct Package with bootloader_doc asset."""
        from gtl_spec.packages.abiogenesis import module

        pkg, worker = module_to_package(module, worker_id="test")
        assert pkg.name == "abiogenesis"
        assert len(pkg.assets) == 7
        assert len(pkg.edges) == 6
        assert len(pkg.requirements) == 45

        asset_names = {a.name for a in pkg.assets}
        assert "bootloader_doc" in asset_names


@pytest.mark.integration
class TestEngineIndependence:
    """GTL spec modules have no ABG engine imports."""

    def test_project_package_no_engine_imports(self):
        """project_package.py imports only from gtl.* — no genesis.*."""
        import importlib
        import inspect

        mod = importlib.import_module("gtl_spec.packages.project_package")
        source = inspect.getsource(mod)

        # No 'from genesis' imports at module level
        import_lines = [
            line.strip() for line in source.splitlines()
            if line.strip().startswith("from genesis") or line.strip().startswith("import genesis")
        ]
        assert import_lines == [], f"Found ABG imports: {import_lines}"

    def test_genesis_core_no_engine_imports(self):
        """genesis_core.py imports only from gtl.* — no genesis.*."""
        import importlib
        import inspect

        mod = importlib.import_module("gtl_spec.packages.genesis_core")
        source = inspect.getsource(mod)

        import_lines = [
            line.strip() for line in source.splitlines()
            if line.strip().startswith("from genesis") or line.strip().startswith("import genesis")
        ]
        assert import_lines == [], f"Found ABG imports: {import_lines}"

    def test_abiogenesis_no_engine_imports(self):
        """abiogenesis.py imports only from gtl.* — no genesis.*."""
        import importlib
        import inspect

        mod = importlib.import_module("gtl_spec.packages.abiogenesis")
        source = inspect.getsource(mod)

        import_lines = [
            line.strip() for line in source.splitlines()
            if line.strip().startswith("from genesis") or line.strip().startswith("import genesis")
        ]
        assert import_lines == [], f"Found ABG imports: {import_lines}"
