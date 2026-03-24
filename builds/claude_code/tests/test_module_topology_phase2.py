# Validates: REQ-R-ABG2-EVENTS
# Validates: REQ-R-ABG2-PROJECTION
# Validates: REQ-R-ABG2-PROVENANCE
# Validates: REQ-R-ABG2-CORRECTION
# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-R-ABG2-LINEAGE
# Validates: REQ-R-ABG2-RUN
# Validates: REQ-R-ABG2-CONVERGENCE
# Validates: REQ-R-ABG2-JOB-WORKER
"""
Module topology tests — Phase 2: ABG runtime kernel split.

These tests assert the TARGET module structure defined in
builds/claude_code/design/GTL_2_MODULE_DESIGN.md §3.2.

Phase 2 modules live under genesis.* (package rename to abg.* is
a future step). The module BOUNDARIES are what matter here.
"""
import importlib
import sys

import pytest


# ── genesis.events: EventStream, emit ─────────────────────────────────────

class TestAbgEventsModule:
    """genesis.events must export EventStream and emit."""

    def test_eventstream_exists(self):
        from genesis.events import EventStream
        assert EventStream is not None

    def test_emit_exists(self):
        from genesis.events import emit
        assert callable(emit)

    def test_init_stream_exists(self):
        from genesis.events import init_stream
        assert callable(init_stream)


# ── genesis.projection: project ───────────────────────────────────────────

class TestAbgProjectionModule:
    """genesis.projection must export project()."""

    def test_project_exists(self):
        from genesis.projection import project
        assert callable(project)


# ── genesis.provenance: req_hash, job_evaluator_hash ──────────────────────

class TestAbgProvenanceModule:
    """genesis.provenance must export provenance hash functions."""

    def test_req_hash_exists(self):
        from genesis.provenance import req_hash
        assert callable(req_hash)

    def test_job_evaluator_hash_exists(self):
        from genesis.provenance import job_evaluator_hash
        assert callable(job_evaluator_hash)


# ── genesis.correction: find_latest_reset ─────────────────────────────────

class TestAbgCorrectionModule:
    """genesis.correction must export reset/shadowing functions."""

    def test_find_latest_reset_exists(self):
        from genesis.correction import find_latest_reset
        assert callable(find_latest_reset)


# ── genesis.binding: PrecomputedManifest, BoundJob, bind_fd/fp/fh, Job, Worker

class TestAbgBindingModule:
    """genesis.binding must export binding types and functions."""

    def test_precomputed_manifest_exists(self):
        from genesis.binding import PrecomputedManifest
        assert PrecomputedManifest is not None

    def test_bound_job_exists(self):
        from genesis.binding import BoundJob
        assert BoundJob is not None

    def test_bind_fd_exists(self):
        from genesis.binding import bind_fd
        assert callable(bind_fd)

    def test_bind_fp_exists(self):
        from genesis.binding import bind_fp
        assert callable(bind_fp)

    def test_bind_fh_exists(self):
        from genesis.binding import bind_fh
        assert callable(bind_fh)

    def test_job_exists(self):
        """Job is an ABG binding type (REQ-R-ABG2-JOB-WORKER-001)."""
        from genesis.binding import Job
        assert Job is not None

    def test_worker_exists(self):
        """Worker is an ABG capability model (REQ-R-ABG2-JOB-WORKER-002)."""
        from genesis.binding import Worker
        assert Worker is not None

    def test_context_resolver_exists(self):
        from genesis.binding import ContextResolver
        assert ContextResolver is not None


# ── genesis.lineage: WorkInstance, spawn, _discover_children ──────────────

class TestAbgLineageModule:
    """genesis.lineage must export work identity and parent/child functions."""

    def test_work_instance_exists(self):
        from genesis.lineage import WorkInstance
        assert WorkInstance is not None

    def test_spawn_exists(self):
        from genesis.lineage import spawn
        assert callable(spawn)

    def test_discover_children_exists(self):
        from genesis.lineage import discover_children
        assert callable(discover_children)


# ── genesis.run: RunState, run_state, find_pending_run, supersede_run ─────

class TestAbgRunModule:
    """genesis.run must export run governance types and functions."""

    def test_runstate_exists(self):
        from genesis.run import RunState
        assert RunState is not None

    def test_run_state_fn_exists(self):
        from genesis.run import run_state
        assert callable(run_state)

    def test_find_pending_run_exists(self):
        from genesis.run import find_pending_run
        assert callable(find_pending_run)

    def test_supersede_run_exists(self):
        from genesis.run import supersede_run
        assert callable(supersede_run)


# ── genesis.convergence: delta, parent_converged, render_delta ────────────

class TestAbgConvergenceModule:
    """genesis.convergence must export convergence functions."""

    def test_delta_exists(self):
        from genesis.convergence import delta
        assert callable(delta)

    def test_parent_converged_exists(self):
        from genesis.convergence import parent_converged
        assert callable(parent_converged)

    def test_render_delta_exists(self):
        from genesis.convergence import render_delta
        assert callable(render_delta)


# ── Boundary: ABG kernel dependency rules ─────────────────────────────────

class TestAbgKernelBoundary:
    """ABG kernel modules must respect the dependency rules from §7.1."""

    @pytest.mark.parametrize("module_name", [
        "genesis.events",
    ])
    def test_events_no_binding_import(self, module_name):
        """genesis.events must not import genesis.binding or genesis.commands."""
        mod = importlib.import_module(module_name)
        source_file = getattr(mod, "__file__", "")
        if source_file:
            with open(source_file) as f:
                source = f.read()
            for line in source.splitlines():
                line = line.strip()
                if line.startswith("#"):
                    continue
                assert "genesis.binding" not in line and "genesis.commands" not in line, (
                    f"{module_name} has forbidden import: {line}"
                )
                assert ".commands" not in line or "import" not in line, (
                    f"{module_name} has forbidden import: {line}"
                )


# ── Backward compatibility: existing modules still work ───────────────────

class TestPhase2BackwardCompatibility:
    """Existing genesis.core, genesis.bind, genesis.schedule must still export everything."""

    @pytest.mark.parametrize("name", [
        "EventStream", "emit", "project", "init_stream",
    ])
    def test_genesis_core_still_exports(self, name):
        mod = importlib.import_module("genesis.core")
        assert hasattr(mod, name), f"genesis.core must still export {name}"

    @pytest.mark.parametrize("name", [
        "req_hash", "job_evaluator_hash", "find_latest_reset",
        "bind_fd", "bind_fp", "bind_fh",
    ])
    def test_genesis_bind_still_exports(self, name):
        mod = importlib.import_module("genesis.bind")
        assert hasattr(mod, name), f"genesis.bind must still export {name}"

    @pytest.mark.parametrize("name", [
        "WorkInstance", "RunState", "run_state", "find_pending_run",
        "supersede_run", "delta", "spawn", "parent_converged",
    ])
    def test_genesis_schedule_still_exports(self, name):
        mod = importlib.import_module("genesis.schedule")
        assert hasattr(mod, name), f"genesis.schedule must still export {name}"

    @pytest.mark.parametrize("name", [
        "PrecomputedManifest", "BoundJob",
    ])
    def test_genesis_manifest_still_exports(self, name):
        mod = importlib.import_module("genesis.manifest")
        assert hasattr(mod, name), f"genesis.manifest must still export {name}"
