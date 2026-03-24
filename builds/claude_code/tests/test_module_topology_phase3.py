# Validates: REQ-R-ABG2-SELECTION-APPLICATION
# Validates: REQ-R-ABG2-LEAFTASK
# Validates: REQ-R-ABG2-TRANSPORT
# Validates: REQ-R-ABG2-INTERPRET
"""
Module topology tests — Phase 3: Interpretation and transport split.

These tests assert the TARGET module structure defined in
builds/claude_code/design/GTL_2_MODULE_DESIGN.md §3.2 (continued).

Phase 3 modules: selection, subwork, transport, interpret.
"""
import importlib

import pytest


# ── genesis.selection: SelectionDecision, candidate enumeration ───────────

class TestAbgSelectionModule:
    """genesis.selection must export selection types."""

    def test_selection_decision_exists(self):
        from genesis.selection import SelectionDecision
        assert SelectionDecision is not None

    def test_selection_decision_is_frozen(self):
        import dataclasses
        from genesis.selection import SelectionDecision
        assert dataclasses.is_dataclass(SelectionDecision)
        assert SelectionDecision.__dataclass_params__.frozen


# ── genesis.subwork: LeafTask, validate_leaf_schema, dispatch_leaf ────────

class TestAbgSubworkModule:
    """genesis.subwork must export leaf task types and functions."""

    def test_leaftask_exists(self):
        from genesis.subwork import LeafTask
        assert LeafTask is not None

    def test_leaftask_is_frozen(self):
        import dataclasses
        from genesis.subwork import LeafTask
        assert dataclasses.is_dataclass(LeafTask)
        assert LeafTask.__dataclass_params__.frozen

    def test_validate_leaf_schema_exists(self):
        from genesis.subwork import validate_leaf_schema
        assert callable(validate_leaf_schema)

    def test_dispatch_leaf_exists(self):
        from genesis.subwork import dispatch_leaf
        assert callable(dispatch_leaf)


# ── genesis.transport: AgentResult, dispatch_agent, classify_failure ──────

class TestAbgTransportModule:
    """genesis.transport must export transport types and functions."""

    def test_agent_result_exists(self):
        from genesis.transport import AgentResult
        assert AgentResult is not None

    def test_agent_transport_error_exists(self):
        from genesis.transport import AgentTransportError
        assert AgentTransportError is not None
        assert issubclass(AgentTransportError, Exception)

    def test_dispatch_agent_exists(self):
        from genesis.transport import dispatch_agent
        assert callable(dispatch_agent)

    def test_classify_failure_exists(self):
        from genesis.transport import classify_failure
        assert callable(classify_failure)

    def test_has_agent_exists(self):
        from genesis.transport import has_agent
        assert callable(has_agent)


# ── genesis.interpret: iterate, schedule, zoom ────────────────────────────

class TestAbgInterpretModule:
    """genesis.interpret must export the graph interpretation loop."""

    def test_iterate_exists(self):
        from genesis.interpret import iterate
        assert callable(iterate)

    def test_schedule_exists(self):
        from genesis.interpret import schedule
        assert callable(schedule)

    def test_zoom_exists(self):
        from genesis.interpret import zoom
        assert callable(zoom)

    def test_zoom_event_exists(self):
        from genesis.interpret import zoom_event
        assert callable(zoom_event)

    def test_find_fragment_for_edge_exists(self):
        from genesis.interpret import find_fragment_for_edge
        assert callable(find_fragment_for_edge)


# ── Boundary: transport isolation ─────────────────────────────────────────

class TestPhase3Boundary:
    """Transport must not import convergence, CLI, or product policy."""

    def test_transport_no_convergence_import(self):
        mod = importlib.import_module("genesis.transport")
        source_file = getattr(mod, "__file__", "")
        if source_file:
            with open(source_file) as f:
                source = f.read()
            for line in source.splitlines():
                line = line.strip()
                if line.startswith("#"):
                    continue
                assert "convergence" not in line or "import" not in line, (
                    f"genesis.transport has forbidden import: {line}"
                )


# ── Backward compatibility ────────────────────────────────────────────────

class TestPhase3BackwardCompatibility:
    """Existing genesis.schedule and genesis.fp_dispatch must still export everything."""

    @pytest.mark.parametrize("name", [
        "iterate", "schedule", "zoom", "zoom_event", "find_fragment_for_edge",
        "LeafTask", "validate_leaf_schema",
    ])
    def test_genesis_schedule_still_exports(self, name):
        mod = importlib.import_module("genesis.schedule")
        assert hasattr(mod, name), f"genesis.schedule must still export {name}"

    @pytest.mark.parametrize("name", [
        "AgentResult", "AgentTransportError", "dispatch_agent",
        "classify_failure", "has_agent", "dispatch_leaf",
    ])
    def test_genesis_fp_dispatch_still_exports(self, name):
        mod = importlib.import_module("genesis.fp_dispatch")
        assert hasattr(mod, name), f"genesis.fp_dispatch must still export {name}"
