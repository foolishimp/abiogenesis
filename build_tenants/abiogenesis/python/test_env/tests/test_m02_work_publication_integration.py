# Validates: REQ-L-GTL2-MODULE
# Validates: REQ-L-GTL2-JOB
# Validates: REQ-L-GTL2-ROLE
# Validates: REQ-L-GTL2-IDENTITY
# Validates: REQ-L-GTL2-SELECTION-BOUNDARY
# Validates: REQ-L-GTL2-ENGINE-INDEPENDENCE
"""
M02 work-publication integration lane.

This replaces the legacy publication/type contract cluster with checks over the
real authored package modules and their published job/role/traversal surfaces.
"""
from __future__ import annotations

import importlib
import inspect
from pathlib import Path

import pytest

from gtl.module_model import Module

from genesis.binding import module_to_executable_jobs
from genesis.selection import resolve_refinement_boundary
from genesis.services import Scope


def _package_source(module_name: str) -> str:
    return inspect.getsource(importlib.import_module(module_name))


@pytest.mark.integration
class TestM02WorkPublicationIntegration:
    def test_project_package_publishes_complete_jobs_roles_and_traversal_boundaries(self, tmp_path: Path) -> None:
        from gtl_spec.packages.project_package import module

        assert isinstance(module, Module)
        assert module.name == "project_package"

        graph = module.graphs[0]
        vector_by_id = {vector.id: vector for vector in graph.vectors}
        job_by_name = {job.name: job for job in module.jobs}
        boundary_by_name = {boundary.name: boundary for boundary in module.refinement_boundaries}

        assert len(graph.vectors) == len(module.jobs) == len(module.refinement_boundaries)
        assert {vector.name for vector in graph.vectors} == set(job_by_name) == set(boundary_by_name)

        constructor = next(role for role in module.roles if role.name == "constructor")
        executable_jobs = module_to_executable_jobs(module)
        assert len(executable_jobs) == len(graph.vectors)

        for executable_job in executable_jobs:
            vector = executable_job.vector
            gtl_job = executable_job.job
            assert len(gtl_job.contracts) == 1
            assert gtl_job.contracts[0].target_id == vector.id
            assert resolve_refinement_boundary(module, vector.id) is not None
            if any(evaluator.regime.__name__ == "F_P" for evaluator in vector.evaluators):
                assert gtl_job.roles == (constructor,)
            else:
                assert gtl_job.roles == ()

        scope = Scope(module=module, workspace_root=tmp_path, build="publication_router")
        assert len(scope.worker.can_execute) == len(graph.vectors)
        assert constructor.id in scope.worker.role_ids

    def test_abiogenesis_module_publishes_bootloader_surface_and_scope_is_executable(self, tmp_path: Path) -> None:
        from gtl_spec.packages.abiogenesis import module

        assert isinstance(module, Module)
        assert module.name == "abiogenesis"

        graph = module.graphs[0]
        node_names = {node.name for node in graph.nodes}
        vector_names = {vector.name for vector in graph.vectors}

        assert "bootloader_doc" in node_names
        assert "design→bootloader_doc" in vector_names

        executable_jobs = module_to_executable_jobs(module)
        target_names = {job.vector.target.name for job in executable_jobs}
        assert "bootloader_doc" in target_names

        scope = Scope(module=module, workspace_root=tmp_path, build="publication_router")
        assert len(scope.worker.can_execute) == len(graph.vectors)

        constructor = next(role for role in module.roles if role.name == "constructor")
        for job in module.jobs:
            if any(
                evaluator.regime.__name__ == "F_P"
                for evaluator in next(vector for vector in graph.vectors if vector.id == job.contracts[0].target_id).evaluators
            ):
                assert job.roles == (constructor,)

    def test_published_modules_remain_engine_independent_gtl_surfaces(self) -> None:
        project_source = _package_source("gtl_spec.packages.project_package")
        abiogenesis_source = _package_source("gtl_spec.packages.abiogenesis")

        for source in (project_source, abiogenesis_source):
            assert "from genesis" not in source
            assert "import genesis" not in source

    def test_published_modules_expose_stable_identity_and_contract_binding_surfaces(self) -> None:
        from gtl_spec.packages.project_package import module as project_module
        from gtl_spec.packages.abiogenesis import module as abiogenesis_module

        for module in (project_module, abiogenesis_module):
            assert module.roles, f"{module.name} must publish at least one semantic role"
            assert all(role.id for role in module.roles)
            assert all(job.id for job in module.jobs)
            assert all(boundary.id for boundary in module.refinement_boundaries)
            assert all(vector.id for graph in module.graphs for vector in graph.vectors)
            assert all(
                contract.kind == "graph_vector"
                and any(contract.target_id == vector.id for graph in module.graphs for vector in graph.vectors)
                for job in module.jobs
                for contract in job.contracts
            )
