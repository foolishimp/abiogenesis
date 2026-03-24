# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-002
# Validates: REQ-F-CORE-003
# Validates: REQ-F-CORE-004
# Validates: REQ-F-CORE-005
# Validates: REQ-F-CORE-006
# Validates: REQ-F-WKSP-001
# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-CMD-004
# Validates: REQ-F-GATE-002
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-BIND-001
# Validates: REQ-NFR-E2E-001
# Validates: REQ-NFR-SELF-001
"""
Sandbox E2E tests — Phase 5 self-hosting gate.

Demonstrates the genesis engine running a full lifecycle in a fresh sandbox:
  workspace_bootstrap → gen_gaps (gap found) → F_P dispatch → convergence recorded
  → gen_gaps again (delta = 0)

The F_P step is deterministic in the sandbox: the test acts as the F_P actor,
writing a code artifact and emitting assessed (kind=fp). This tests the engine's
lifecycle management, not the LLM. The LLM is always an external actor.

Marked with pytest.mark.integration — run via: pytest -m integration
"""
import json
import os
import pytest
import subprocess
import sys
from pathlib import Path


def _subprocess_env() -> dict:
    """Environment for subprocess genesis invocations: adds PYTHONPATH for engine + gtl_spec."""
    root = Path(__file__).resolve().parent.parent.parent.parent  # abiogenesis root
    env = os.environ.copy()
    paths = [
        str(root / "builds" / "claude_code" / "code"),
        str(root / ".genesis"),
        str(root),
    ]
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = os.pathsep.join(paths + ([existing] if existing else []))
    return env

from gtl.core import (
    Asset, Context, Edge, Evaluator, Job, Operator, Package, Rule, Worker,
    F_D, F_P, F_H, consensus,
)

from genesis.core import workspace_bootstrap, emit, project, ContextResolver
from genesis.bind import bind_fd, bind_fp, req_hash
from genesis.schedule import delta, iterate, schedule
from genesis.commands import Scope, gen_gaps, gen_iterate, gen_start
from genesis.manifest import BoundJob


# ── Sandbox package fixture ────────────────────────────────────────────────────

def _ensure_sandbox_context(workspace: Path) -> None:
    """Create the bootloader context file that the sandbox package references."""
    boot_dir = workspace / "gtl_spec"
    boot_dir.mkdir(parents=True, exist_ok=True)
    (boot_dir / "GTL_BOOTLOADER.md").write_text("# Sandbox Bootloader\n")


def _make_sandbox_package(workspace: Path):
    """
    Minimal Package for sandbox testing.

    One edge: design→code, with one F_D evaluator (impl_tags) and one F_P
    evaluator (code_complete). The sandbox test acts as the F_P actor.
    """
    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])
    op_fp = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_fd = Operator("check_tags", F_D,
                     "exec://python -m genesis check-tags --type implements --path .")
    ctx = Context(
        name="bootloader",
        locator="workspace://gtl_spec/GTL_BOOTLOADER.md",
        digest="sha256:" + "0" * 64,
    )
    edge = Edge(
        name="design→code",
        source=design,
        target=code,
        using=[op_fp, op_fd],
        context=[ctx],
    )
    eval_tags = Evaluator(
        "impl_tags", F_D, "all code files carry Implements: tags",
        command="python -m genesis check-tags --type implements --path code/",
    )
    eval_fp = Evaluator("code_complete", F_P, "agent: code implements spec")
    job = Job(edge=edge, evaluators=[eval_tags, eval_fp])
    rule = Rule("gate", approve=consensus(1, 1))
    pkg = Package(
        name="sandbox_test",
        assets=[design, code],
        edges=[edge],
        operators=[op_fp, op_fd],
        rules=[rule],
        contexts=[ctx],
    )
    worker = Worker(id="claude_code", can_execute=[job])
    return pkg, worker, job


# ── E2E tests ─────────────────────────────────────────────────────────────────

@pytest.mark.integration
class TestSandboxFullLifecycle:
    """Full lifecycle: bootstrap → gap → F_P dispatch → convergence."""

    def test_workspace_bootstrap_in_fresh_sandbox(self, tmp_path):
        """Fresh sandbox can be bootstrapped with a valid EventStream."""
        stream = workspace_bootstrap(tmp_path)
        assert (tmp_path / ".ai-workspace" / "events" / "events.jsonl").exists()
        assert (tmp_path / ".ai-workspace" / "features" / "active").is_dir()

    def test_gen_gaps_finds_gap_before_code_exists(self, tmp_path):
        """gen_gaps correctly identifies delta > 0 when no code exists."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, _ = _make_sandbox_package(tmp_path)
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        result = gen_gaps(scope, stream)

        assert result["total_delta"] > 0
        assert result["converged"] is False
        failing_names = [f for g in result["gaps"] for f in g["failing"]]
        assert "code_complete" in failing_names  # F_P not yet resolved

    def test_gen_iterate_escalates_fd_to_fp(self, tmp_path):
        """REQ-F-GATE-002 (ADR-021): F_D failure escalates to F_P dispatch."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, _ = _make_sandbox_package(tmp_path)
        _ensure_sandbox_context(tmp_path)
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)
        dispatched: list[BoundJob] = []

        # No code/ directory → impl_tags (F_D) fails → escalates to F_P
        result = gen_iterate(scope, stream, on_fp_dispatch=dispatched.append)

        assert result["status"] == "iterated"
        assert len(dispatched) == 1, "F_D failure must escalate to F_P dispatch"

    def test_gen_iterate_dispatches_fp_after_fd_passes(self, tmp_path):
        """REQ-F-GATE-002: F_P is dispatched once all F_D evaluators pass."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, _ = _make_sandbox_package(tmp_path)
        _ensure_sandbox_context(tmp_path)
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        # Create code with impl tag so F_D (impl_tags) passes
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-SANDBOX-001\ndef hello(): pass\n"
        )

        dispatched: list[BoundJob] = []
        result = gen_iterate(scope, stream, on_fp_dispatch=dispatched.append)

        assert result["status"] == "iterated"
        assert len(dispatched) == 1, "F_P must be dispatched when F_D passes"
        bound = dispatched[0]
        assert "PRECONDITIONS" in bound.prompt
        assert "GAP" in bound.prompt

    def test_full_lifecycle_fp_acts_and_converges(self, tmp_path):
        """
        Full E2E lifecycle:
          1. gen_gaps → delta > 0
          2. gen_iterate → F_P dispatch (test acts as F_P, creates code file)
          3. gen_gaps → delta = 0

        This is the self-hosting demonstration.
        """
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, job = _make_sandbox_package(tmp_path)
        _ensure_sandbox_context(tmp_path)
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        # ── Step 1: gap exists ──
        before = gen_gaps(scope, stream)
        assert before["total_delta"] > 0, "Expected gap before code exists"

        # ── Step 2: F_P acts — test creates code artifact ──
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-SANDBOX-001\n"
            "def hello() -> str:\n"
            "    return 'hello from sandbox'\n"
        )

        # F_P records its assessment — spec_hash required (REQ-F-EVAL-004) so that
        # bind_fd() can validate snapshot binding and not count stale assessments.
        spec_hash = req_hash(pkg.requirements)
        emit("assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "actor": "test_fp",
            "result": "pass",
            "evidence": "code/impl.py created with Implements tag",
            "spec_hash": spec_hash,
        })

        # ── Step 3: delta = 0 — engine freshly evaluates both F_D and F_P ──
        after = gen_gaps(scope, stream)

        assert after["total_delta"] == 0, (
            f"Expected delta=0 after F_P acted, got: {json.dumps(after, indent=2)}"
        )
        assert after["converged"] is True

    def test_event_log_records_work_truthfully(self, tmp_path):
        """Event log contains truthful records of the lifecycle."""
        stream = workspace_bootstrap(tmp_path)
        pkg, worker, _ = _make_sandbox_package(tmp_path)
        _ensure_sandbox_context(tmp_path)
        scope = Scope(package=pkg, workspace_root=tmp_path, worker=worker)

        # REQ-F-GATE-002: F_P is only dispatched after F_D passes.
        # Create code with impl tag so F_D passes and F_P is dispatched.
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-SANDBOX-001\ndef hello(): pass\n"
        )

        gen_iterate(scope, stream)

        events = stream.all_events()
        types = [e["event_type"] for e in events]
        assert "edge_started" in types    # engine recorded start
        assert "fp_dispatched" in types   # F_P was dispatched (after F_D passed)

        # All events have event_time
        for e in events:
            assert "event_time" in e, f"Event missing event_time: {e}"

    def test_project_derives_state_from_stream(self, tmp_path):
        """project() derives asset state from event stream — never from mutable state."""
        stream = workspace_bootstrap(tmp_path)

        # Before any events: not_started
        state = project(stream, "code", "CODE-001")
        assert state["status"] == "not_started"

        # After edge_started: in_progress
        emit("edge_started", {"feature": "CODE-001", "edge": "design→code"})
        state = project(stream, "code", "CODE-001")
        assert state["status"] == "in_progress"

        # After edge_converged: converged
        emit("edge_converged", {
            "feature": "CODE-001",
            "edge": "design→code",
            "target": "code",
        })
        state = project(stream, "code", "CODE-001")
        assert state["status"] == "converged"

    def test_schedule_trivial_single_worker(self, tmp_path):
        """schedule() with V1 single worker produces one batch."""
        _, worker, _ = _make_sandbox_package(tmp_path)
        batches = schedule([worker])
        assert len(batches) == 1
        assert batches[0] == [worker]

    def test_replay_deterministic(self, tmp_path):
        """Replay is deterministic: project(S, T, I) = project(S, T, I)."""
        stream = workspace_bootstrap(tmp_path)
        emit("edge_started", {"feature": "FEAT-E2E", "edge": "design→code"})
        emit("edge_converged", {
            "feature": "FEAT-E2E",
            "edge": "design→code",
            "target": "code",
        })

        state_1 = project(stream, "code", "FEAT-E2E")
        state_2 = project(stream, "code", "FEAT-E2E")
        assert state_1 == state_2  # deterministic

    def test_context_resolver_loads_workspace_file(self, tmp_path):
        """ContextResolver loads workspace:// locators relative to workspace root."""
        (tmp_path / "doc.md").write_text("# Sandbox Doc")
        resolver = ContextResolver(tmp_path)
        ctx = Context(
            name="doc",
            locator="workspace://doc.md",
            digest="sha256:" + "0" * 64,  # PENDING
        )
        content = resolver.load(ctx)
        assert "Sandbox Doc" in content


# ── Self-hosting gate ─────────────────────────────────────────────────────────

@pytest.mark.integration
class TestSelfHosting:
    """
    Phase C target-state gate: the genesis engine evaluates its own workspace
    and must report converged=True.

    This test asserts a live workspace property (delta=0 across all edges).
    It is Phase C work — real state reconciliation, not Phase B kernel proofs.
    Run only after human F_H approvals and F_P assessments are recorded.
    """

    @pytest.mark.skip(reason="Self-hosting is now a project-level proof — requires ABG domain package (not kernel default)")
    def test_engine_evaluates_own_workspace(self):
        """
        Run `python -m genesis gaps` against the abiogenesis workspace.
        The engine must report delta=0 (self-converged).

        Requires: an abiogenesis domain package installed as a project on
        top of ABG, same pattern as GSDLC consuming ABG. Currently skipped
        until the ABG self-hosting project package is defined.
        """
        result = subprocess.run(
            [sys.executable, "-m", "genesis", "gaps", "--workspace", "."],
            capture_output=True, text=True, env=_subprocess_env(),
        )
        assert result.returncode == 0, (
            f"genesis gaps failed:\n{result.stderr}"
        )
        data = json.loads(result.stdout)
        assert data["converged"] is True, (
            f"Expected converged=True, got total_delta={data['total_delta']}\n"
            f"Gaps: {json.dumps(data['gaps'], indent=2)}"
        )

    def test_check_tags_impl_passes_on_own_code(self):
        """All genesis code files carry # Implements: tags."""
        code_path = str(Path(__file__).resolve().parent.parent / "code")
        result = subprocess.run(
            [sys.executable, "-m", "genesis", "check-tags",
             "--type", "implements",
             "--path", code_path],
            capture_output=True, text=True, env=_subprocess_env(),
        )
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        assert data["passes"] is True
        assert data["untagged_count"] == 0

    def test_check_tags_validates_passes_on_own_tests(self):
        """All genesis test files carry # Validates: tags."""
        tests_path = str(Path(__file__).resolve().parent)
        result = subprocess.run(
            [sys.executable, "-m", "genesis", "check-tags",
             "--type", "validates",
             "--path", tests_path],
            capture_output=True, text=True, env=_subprocess_env(),
        )
        assert result.returncode == 0
        data = json.loads(result.stdout)
        assert data["passes"] is True
        assert data["untagged_count"] == 0

    def test_modules_present(self):
        """All expected modules exist in the genesis package."""
        genesis_dir = Path(__file__).resolve().parent.parent / "code" / "genesis"
        # V1 core modules
        required = {"core", "bind", "schedule", "manifest", "commands", "fp_dispatch", "__main__"}
        # Phase 2 kernel modules (re-export shims during migration)
        required |= {"events", "projection", "provenance", "correction", "binding",
                      "lineage", "run", "convergence"}
        # Phase 3 interpretation and transport modules
        required |= {"selection", "subwork", "transport", "interpret"}
        found = {f.stem for f in genesis_dir.glob("*.py") if f.stem != "__init__"}
        assert required <= found, f"Missing modules: {required - found}"

    def test_engine_importable(self):
        """The genesis package is importable — Phase 1 health check."""
        import genesis
        from genesis.core import emit, project, workspace_bootstrap, EventStream
        from genesis.bind import bind_fd, bind_fp
        from genesis.schedule import delta, iterate, schedule
        from genesis.commands import gen_start, gen_iterate, gen_gaps, Scope
        from genesis.manifest import PrecomputedManifest, BoundJob
        from genesis.fp_dispatch import has_mcp_transport, call_claude_code_mcp
        assert genesis.__version__ == "1.0.3"
