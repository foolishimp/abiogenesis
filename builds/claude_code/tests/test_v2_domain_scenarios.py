# Validates: REQ-L-GTL2-MODULE
# Validates: REQ-L-GTL2-GRAPH
# Validates: REQ-L-GTL2-NODE
"""
Domain scenarios — validates the real domain package Modules.

Loads project_package, genesis_core, and abiogenesis Modules
and verifies structure, evaluators, and engine compatibility.
"""
import pytest

from gtl.graph import Graph, Node, GraphVector
from gtl.module_model import Module
from genesis.services import module_to_jobs


@pytest.mark.integration
class TestProjectPackageModule:
    """The genesis_sdlc project_package Module."""

    def test_module_is_pure_gtl(self):
        """project_package.module has no ABG imports at module level."""
        from gtl_spec.packages import project_package
        module = project_package.module

        assert isinstance(module, Module)
        assert module.name == "project_package"

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

    def test_module_to_jobs_produces_correct_jobs(self):
        """module_to_jobs() derives 6 Jobs from 6 vectors with evaluators."""
        from gtl_spec.packages.project_package import module

        jobs = module_to_jobs(module)
        assert len(jobs) == 6
        for job in jobs:
            assert isinstance(job.vector, GraphVector)
            assert len(job.evaluators) > 0

    def test_co_evolve_vector(self):
        """code↔unit_tests vector has tuple source."""
        from gtl_spec.packages.project_package import module

        graph = module.graphs[0]
        tdd_vec = [v for v in graph.vectors if v.name == "code↔unit_tests"][0]
        assert isinstance(tdd_vec.source, tuple)
        assert len(tdd_vec.source) == 2

    def test_evaluator_bindings_preserved(self):
        """Evaluator binding URIs survive module_to_jobs()."""
        from gtl_spec.packages.project_package import module

        jobs = module_to_jobs(module)
        found = False
        for job in jobs:
            for ev in job.evaluators:
                if ev.name == "impl_tags":
                    assert ev.binding != ""
                    assert "check-tags" in ev.binding
                    found = True
        assert found, "impl_tags evaluator not found in any job"


@pytest.mark.integration
class TestGenesisCoreModule:
    """The genesis_core Module."""

    def test_module_structure(self):
        """6 nodes, 5 vectors, 14 requirements."""
        from gtl_spec.packages.genesis_core import module

        assert isinstance(module, Module)
        assert module.name == "genesis_v1"
        assert len(module.graphs) == 1
        assert len(module.graphs[0].nodes) == 6
        assert len(module.graphs[0].vectors) == 5
        assert len(module.metadata["requirements"]) == 14

    def test_module_to_jobs(self):
        """module_to_jobs() derives correct Jobs."""
        from gtl_spec.packages.genesis_core import module

        jobs = module_to_jobs(module)
        assert len(jobs) == 5
        for job in jobs:
            assert isinstance(job.vector, GraphVector)


@pytest.mark.integration
class TestAbiogenesisModule:
    """The abiogenesis Module."""

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

    def test_module_to_jobs(self):
        """module_to_jobs() derives correct Jobs with bootloader_doc."""
        from gtl_spec.packages.abiogenesis import module

        jobs = module_to_jobs(module)
        assert len(jobs) == 6
        target_names = {j.vector.target.name for j in jobs}
        assert "bootloader_doc" in target_names


@pytest.mark.integration
class TestEngineIndependence:
    """GTL spec modules have no ABG engine imports."""

    def test_project_package_no_engine_imports(self):
        """project_package.py imports only from gtl.* — no genesis.*."""
        import importlib
        import inspect

        mod = importlib.import_module("gtl_spec.packages.project_package")
        source = inspect.getsource(mod)

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
