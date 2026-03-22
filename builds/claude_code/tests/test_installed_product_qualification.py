# Validates: REQ-F-BOOT-001
# Validates: REQ-F-BOOT-002
# Validates: REQ-F-PKG-001
# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-GATE-002
# Validates: REQ-F-EVAL-002
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-EVAL-005
# Validates: REQ-F-BIND-001
# Validates: REQ-F-CORE-001
# Validates: REQ-F-CORE-002
# Validates: REQ-F-EC-004
# Validates: REQ-F-EC-005
# Validates: REQ-F-EC-006
# Validates: REQ-F-PROV-001
# Validates: REQ-F-PROV-002
# Validates: REQ-F-PROV-003
# Validates: REQ-F-PROV-004
# Validates: REQ-F-PROV-005
# Validates: REQ-F-TEST-001
"""
Product Qualification Integration Suite — ABG Kernel MVP Gate.

Proves the INSTALLED product works correctly across happy-path, failure-path,
and edge-path scenarios. Every test:
  1. Creates a fresh sandbox via gen-install.py
  2. Runs the installed engine through subprocess CLI calls
  3. Exercises the installed .genesis/ runtime — no build-tree imports at execution time

This is the product-owner / QA view of readiness. Unit-test totals are support
evidence; this suite is the primary gate.

Run: pytest -m e2e -k test_installed_product
"""
import json
import os
import subprocess
import sys
import textwrap
from pathlib import Path

import pytest


# ── Helpers ───────────────────────────────────────────────────────────────────

_INSTALLER = Path(__file__).resolve().parent.parent / "code" / "gen-install.py"


def _install_sandbox(target: Path, slug: str = "test_pkg") -> dict:
    """Run gen-install.py into a fresh target directory. Returns installer JSON."""
    result = subprocess.run(
        [sys.executable, str(_INSTALLER),
         "--target", str(target),
         "--project-slug", slug],
        capture_output=True, text=True,
    )
    assert result.returncode == 0, (
        f"gen-install.py failed:\nstdout: {result.stdout}\nstderr: {result.stderr}"
    )
    return json.loads(result.stdout)


def _installed_env(target: Path) -> dict:
    """Environment for subprocess genesis invocations against the INSTALLED runtime."""
    env = os.environ.copy()
    # Only the installed .genesis dir + the workspace — NO build-tree paths
    paths = [str(target / ".genesis"), str(target)]
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = os.pathsep.join(paths + ([existing] if existing else []))
    return env


def _run_genesis(target: Path, *args: str) -> subprocess.CompletedProcess:
    """Run an installed genesis command as subprocess."""
    return subprocess.run(
        [sys.executable, "-m", "genesis", *args, "--workspace", str(target)],
        capture_output=True, text=True,
        env=_installed_env(target),
    )


def _run_genesis_json(target: Path, *args: str) -> dict:
    """Run genesis command and parse JSON stdout."""
    result = _run_genesis(target, *args)
    assert result.returncode == 0, (
        f"genesis {' '.join(args)} failed (exit {result.returncode}):\n{result.stderr}"
    )
    return json.loads(result.stdout)


def _emit_event(target: Path, event_type: str, data: dict) -> subprocess.CompletedProcess:
    """Emit an event through the installed CLI."""
    return subprocess.run(
        [sys.executable, "-m", "genesis", "emit-event",
         "--type", event_type,
         "--data", json.dumps(data),
         "--workspace", str(target)],
        capture_output=True, text=True,
        env=_installed_env(target),
    )


def _write_raw_event(target: Path, event_type: str, data: dict) -> None:
    """Write an event directly to events.jsonl, bypassing CLI annotation.

    Use when the test needs to control fields the CLI would overwrite
    (e.g. workflow_version on approved events).
    """
    from datetime import datetime, timezone
    events_file = target / ".ai-workspace" / "events" / "events.jsonl"
    events_file.parent.mkdir(parents=True, exist_ok=True)
    event = {
        "event_type": event_type,
        "event_time": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }
    with events_file.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")


def _write_test_package(target: Path, package_code: str) -> None:
    """Write a test domain package and bind genesis.yml to it.

    The kernel installer seeds genesis_core as the default package.
    Tests define their own domain package — same pattern as GSDLC consuming ABG.
    """
    pkg_dir = target / ".genesis" / "gtl_spec" / "packages"
    pkg_dir.mkdir(parents=True, exist_ok=True)
    (pkg_dir / "test_pkg.py").write_text(package_code)
    # Bind genesis.yml to the test package (kernel default is genesis_core)
    (target / ".genesis" / "genesis.yml").write_text(
        "package: gtl_spec.packages.test_pkg:package\n"
        "worker:  gtl_spec.packages.test_pkg:worker\n"
    )


def _read_events(target: Path) -> list[dict]:
    """Read all events from the installed workspace event log."""
    events_path = target / ".ai-workspace" / "events" / "events.jsonl"
    if not events_path.exists():
        return []
    events = []
    for line in events_path.read_text().strip().split("\n"):
        if line.strip():
            events.append(json.loads(line))
    return events


def _compute_spec_hash(target: Path) -> str:
    """Compute the current spec_hash using the installed engine's req_hash.

    Used when no active-workflow.json exists (workflow_version == "unknown").
    """
    result = subprocess.run(
        [sys.executable, "-c", textwrap.dedent("""\
            import sys
            sys.path.insert(0, '.genesis')
            from genesis.bind import req_hash
            from gtl_spec.packages.test_pkg import package
            print(req_hash(package.requirements))
        """)],
        capture_output=True, text=True,
        cwd=str(target),
        env=_installed_env(target),
    )
    assert result.returncode == 0, f"Failed to compute spec_hash:\n{result.stderr}"
    return result.stdout.strip()


def _compute_job_evaluator_hash(target: Path) -> str:
    """Compute the provenance-aware spec_hash using job_evaluator_hash.

    Used when active-workflow.json exists (workflow_version != "unknown").
    """
    result = subprocess.run(
        [sys.executable, "-c", textwrap.dedent("""\
            import sys
            sys.path.insert(0, '.genesis')
            from genesis.bind import job_evaluator_hash
            from gtl_spec.packages.test_pkg import worker
            job = worker.can_execute[0]
            print(job_evaluator_hash(job))
        """)],
        capture_output=True, text=True,
        cwd=str(target),
        env=_installed_env(target),
    )
    assert result.returncode == 0, f"Failed to compute job_evaluator_hash:\n{result.stderr}"
    return result.stdout.strip()


# ── Minimal test package ──────────────────────────────────────────────────────

_MINIMAL_PACKAGE = textwrap.dedent('''\
    """Minimal test package for product qualification."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, F_H, consensus,
    )

    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])

    op_fp = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_fd = Operator("check_tags", F_D,
                     "exec://python -m genesis check-tags --type implements --path .")

    edge = Edge(
        name="design→code",
        source=design,
        target=code,
        using=[op_fp, op_fd],
    )

    eval_tags = Evaluator(
        "impl_tags", F_D, "all code files carry Implements: tags",
        command="python -m genesis check-tags --type implements --path code/",
    )
    eval_fp = Evaluator("code_complete", F_P, "agent: code implements design")

    job = Job(edge=edge, evaluators=[eval_tags, eval_fp])
    rule = Rule("gate", approve=consensus(1, 1))

    package = Package(
        name="test_pkg",
        assets=[design, code],
        edges=[edge],
        operators=[op_fp, op_fd],
        rules=[rule],
        requirements=["REQ-TEST-001"],
    )
    worker = Worker(id="claude_code", can_execute=[job])
''')

_FH_PACKAGE = textwrap.dedent('''\
    """Test package with F_D + F_P + F_H chain for full convergence proof."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, F_H, consensus,
    )

    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])

    op_fp = Operator("claude_agent", F_P, "agent://claude/genesis")
    op_fd = Operator("check_tags", F_D,
                     "exec://python -m genesis check-tags --type implements --path .")
    op_fh = Operator("human_gate", F_H, "fh://review")

    edge = Edge(
        name="design→code",
        source=design,
        target=code,
        using=[op_fp, op_fd, op_fh],
    )

    eval_tags = Evaluator(
        "impl_tags", F_D, "all code files carry Implements: tags",
        command="python -m genesis check-tags --type implements --path code/",
    )
    eval_fp = Evaluator("code_complete", F_P, "agent: code implements design")
    eval_fh = Evaluator("design_approved", F_H, "human approves design→code transition")

    job = Job(edge=edge, evaluators=[eval_tags, eval_fp, eval_fh])
    rule = Rule("gate", approve=consensus(1, 1))

    package = Package(
        name="test_pkg",
        assets=[design, code],
        edges=[edge],
        operators=[op_fp, op_fd, op_fh],
        rules=[rule],
        requirements=["REQ-TEST-001"],
    )
    worker = Worker(id="claude_code", can_execute=[job])
''')

_CONTEXT_PACKAGE = textwrap.dedent('''\
    """Test package with a context reference for fail-closed testing."""
    from gtl.core import (
        Asset, Context, Edge, Evaluator, Job, Operator,
        Package, Rule, Worker, F_D, F_P, consensus,
    )

    design = Asset(name="design", id_format="DES-{SEQ}")
    code = Asset(name="code", id_format="CODE-{SEQ}", lineage=[design])

    ctx = Context(
        name="required_doc",
        locator="workspace://required_context.md",
        digest="sha256:{digest}",
    )

    op_fp = Operator("claude_agent", F_P, "agent://claude/genesis")
    edge = Edge(
        name="design→code",
        source=design,
        target=code,
        using=[op_fp],
        context=[ctx],
    )

    eval_fp = Evaluator("code_complete", F_P, "agent: code implements design")
    job = Job(edge=edge, evaluators=[eval_fp])
    rule = Rule("gate", approve=consensus(1, 1))

    package = Package(
        name="test_pkg",
        assets=[design, code],
        edges=[edge],
        operators=[op_fp],
        rules=[rule],
        contexts=[ctx],
        requirements=["REQ-TEST-001"],
    )
    worker = Worker(id="claude_code", can_execute=[job])
''')


# ── Group 1: Deployment Qualification ─────────────────────────────────────────

@pytest.mark.e2e
class TestDeploymentQualification:
    """PQ-001 through PQ-004: Prove the installed product exists and is runnable."""

    def test_pq001_fresh_install_creates_runnable_runtime(self, tmp_path):
        """PQ-001: Fresh kernel install + domain package creates runnable runtime."""
        _install_sandbox(tmp_path)

        # Kernel structural assertions
        assert (tmp_path / ".genesis" / "genesis").is_dir()
        assert (tmp_path / ".genesis" / "gtl").is_dir()
        assert (tmp_path / ".genesis" / "gtl_spec").is_dir()
        assert (tmp_path / ".genesis" / "genesis.yml").is_file()

        # Domain package written by test (same pattern as GSDLC consuming ABG)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Runtime assertion: installed engine runs without import failure
        gaps = _run_genesis(tmp_path, "gaps")
        assert gaps.returncode == 0, (
            f"Installed runtime failed to run genesis gaps:\n{gaps.stderr}"
        )
        data = json.loads(gaps.stdout)
        assert "converged" in data

    def test_pq002_reinstall_is_idempotent(self, tmp_path):
        """PQ-002: Reinstall does not clobber domain package."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Mutate the domain package (simulating user customization)
        starter = tmp_path / ".genesis" / "gtl_spec" / "packages" / "test_pkg.py"
        original = starter.read_text()
        starter.write_text("# User customized\n" + original)

        # Reinstall kernel
        _install_sandbox(tmp_path)

        # Domain package must NOT be overwritten by kernel reinstall
        content = starter.read_text()
        assert content.startswith("# User customized"), \
            "Kernel reinstall clobbered domain package"

        # Engine must still be runnable (re-bind genesis.yml since kernel reset it)
        (tmp_path / ".genesis" / "genesis.yml").write_text(
            "package: gtl_spec.packages.test_pkg:package\n"
            "worker:  gtl_spec.packages.test_pkg:worker\n"
        )
        gaps = _run_genesis(tmp_path, "gaps")
        assert gaps.returncode == 0

    def test_pq003_verify_passes_on_valid_install(self, tmp_path):
        """PQ-003: --verify reports success on a valid install."""
        _install_sandbox(tmp_path)
        result = subprocess.run(
            [sys.executable, str(_INSTALLER),
             "--target", str(tmp_path), "--verify"],
            capture_output=True, text=True,
        )
        assert result.returncode == 0
        data = json.loads(result.stdout)
        assert data["status"] == "ok"

    def test_pq004_bad_config_fails_cleanly(self, tmp_path):
        """PQ-004: Corrupt genesis.yml fails with clear error, not crash."""
        _install_sandbox(tmp_path)

        # Corrupt the package reference
        config = tmp_path / ".genesis" / "genesis.yml"
        config.write_text("package: nonexistent.module:package\nworker: nonexistent.module:worker\n")

        result = _run_genesis(tmp_path, "gaps")
        assert result.returncode != 0, "Bad config should fail"
        assert result.stderr.strip(), "Should produce error message on stderr"


# ── Group 2: Core Operational Flow ────────────────────────────────────────────

@pytest.mark.e2e
class TestCoreOperationalFlow:
    """PQ-101 through PQ-105: Prove the deployed kernel works on the happy path."""

    def test_pq101_cold_start_gap_reported_truthfully(self, tmp_path):
        """PQ-101: Fresh installed sandbox reports gap truthfully."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        data = _run_genesis_json(tmp_path, "gaps")
        assert data["converged"] is False
        assert data["total_delta"] > 0
        assert len(data["gaps"]) > 0

        # Failing evaluators should match the package state
        failing_names = [f for g in data["gaps"] for f in g["failing"]]
        assert len(failing_names) > 0, "Should report at least one failing evaluator"

    def test_pq102_fd_blocks_fp_dispatch(self, tmp_path):
        """PQ-102: F_D failure blocks F_P dispatch — no code artifact exists."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # No code/ directory → F_D (impl_tags) must fail → F_P must not dispatch
        result = _run_genesis(tmp_path, "iterate")
        # Exit 4 = fd_gap: F_D evaluators are failing, F_P not dispatched
        assert result.returncode == 4, (
            f"Expected exit 4 (fd_gap), got exit {result.returncode}:\n"
            f"stdout: {result.stdout}\nstderr: {result.stderr}"
        )
        data = json.loads(result.stdout)
        assert data["status"] == "iterated", "Expected iterated status"
        assert data.get("stopped_by") == "fd_gap", \
            f"Expected stopped_by=fd_gap, got {data.get('stopped_by')}"
        assert "fp_manifest_path" not in data, \
            "F_P manifest must not be produced when F_D is failing"

        events = _read_events(tmp_path)
        event_types = [e["event_type"] for e in events]
        assert "fp_dispatched" not in event_types, \
            "fp_dispatched must not appear when F_D is failing"

    def test_pq103_fp_dispatch_after_fd_passes(self, tmp_path):
        """PQ-103: F_P dispatch occurs once F_D evaluators pass."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Create code artifact so F_D (impl_tags) passes
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        result = _run_genesis(tmp_path, "iterate")
        assert result.returncode == 0, (
            f"Expected success, got {result.returncode}:\n{result.stderr}"
        )
        data = json.loads(result.stdout)
        assert "fp_manifest_path" in data, "F_P dispatch must produce manifest path"

        events = _read_events(tmp_path)
        event_types = [e["event_type"] for e in events]
        assert "fp_dispatched" in event_types, \
            "fp_dispatched must appear after F_D passes"

    def test_pq104_full_fd_fp_fh_chain_converges(self, tmp_path):
        """PQ-104: Full F_D→F_P→F_H chain converges through installed engine."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)

        # Initial gap
        before = _run_genesis_json(tmp_path, "gaps")
        assert before["converged"] is False
        assert before["total_delta"] > 0

        # Create code artifact → F_D passes
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        # Act as F_P: emit assessed{kind: fp, result: pass}
        spec_hash = _compute_spec_hash(tmp_path)
        r = _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code/impl.py created",
            "spec_hash": spec_hash,
        })
        assert r.returncode == 0, f"Failed to emit F_P assessment:\n{r.stderr}"

        # Act as F_H: emit approved{kind: fh_review}
        r = _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
        })
        assert r.returncode == 0, f"Failed to emit F_H approval:\n{r.stderr}"

        # Verify convergence
        after = _run_genesis_json(tmp_path, "gaps")
        assert after["converged"] is True, (
            f"Expected converged=True, got total_delta={after['total_delta']}\n"
            f"Gaps: {json.dumps(after['gaps'], indent=2)}"
        )
        assert after["total_delta"] == 0

    def test_pq105_gen_start_auto_blocks_correctly(self, tmp_path):
        """PQ-105: gen-start --auto blocks on unresolved F_P, does not lie about convergence."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Create code so F_D passes — auto should then block on F_P dispatch
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        result = _run_genesis(tmp_path, "start", "--auto")
        # Exit 2 = fp_dispatched (blocked waiting for external F_P actor)
        assert result.returncode == 2, (
            f"gen-start --auto should block on F_P dispatch (exit 2), "
            f"got exit {result.returncode}:\nstdout: {result.stdout}\nstderr: {result.stderr}"
        )
        data = json.loads(result.stdout)
        assert data.get("stopped_by") == "fp_dispatch", \
            f"Expected stopped_by=fp_dispatch, got {data.get('stopped_by')}"
        assert "fp_manifest_path" in data, "Blocked state must include manifest path"


# ── Group 3: Failure Semantics ────────────────────────────────────────────────

@pytest.mark.e2e
class TestFailureSemantics:
    """PQ-201 through PQ-207: Prove the product fails correctly."""

    def test_pq201_missing_context_fails_closed(self, tmp_path):
        """PQ-201: Missing required context fails closed — explicit error, no F_P dispatch."""
        _install_sandbox(tmp_path)
        # Package references workspace://required_context.md which doesn't exist
        pkg_code = _CONTEXT_PACKAGE.replace("{digest}", "0" * 64)
        _write_test_package(tmp_path, pkg_code)

        result = _run_genesis(tmp_path, "iterate")
        # Must exit non-zero — fail closed, not silent success
        assert result.returncode != 0, (
            f"Missing context must fail closed (non-zero exit), "
            f"got exit {result.returncode}:\nstdout: {result.stdout}"
        )
        # Error output must identify the problem
        combined = result.stderr + result.stdout
        assert "context" in combined.lower() or "missing" in combined.lower() or \
            "not found" in combined.lower() or "error" in combined.lower(), (
            f"Error output must identify context problem:\nstderr: {result.stderr}\nstdout: {result.stdout}"
        )
        events = _read_events(tmp_path)
        fp_events = [e for e in events if e["event_type"] == "fp_dispatched"]
        assert len(fp_events) == 0, "F_P must not dispatch when required context is missing"

    def test_pq202_digest_mismatch_fails_closed(self, tmp_path):
        """PQ-202: Context digest mismatch fails closed — explicit error, no sentinel substitution."""
        _install_sandbox(tmp_path)
        # Create the context file but with wrong digest
        (tmp_path / "required_context.md").write_text("# Real content")
        pkg_code = _CONTEXT_PACKAGE.replace("{digest}", "a" * 64)
        _write_test_package(tmp_path, pkg_code)

        result = _run_genesis(tmp_path, "iterate")
        # Must exit non-zero — fail closed on integrity violation
        assert result.returncode != 0, (
            f"Digest mismatch must fail closed (non-zero exit), "
            f"got exit {result.returncode}:\nstdout: {result.stdout}"
        )
        # Error output must identify the integrity failure
        combined = result.stderr + result.stdout
        assert "digest" in combined.lower() or "mismatch" in combined.lower() or \
            "integrity" in combined.lower() or "hash" in combined.lower(), (
            f"Error output must identify digest problem:\nstderr: {result.stderr}\nstdout: {result.stdout}"
        )
        events = _read_events(tmp_path)
        fp_events = [e for e in events if e["event_type"] == "fp_dispatched"]
        assert len(fp_events) == 0, "F_P must not dispatch on digest mismatch"

    def test_pq203_stale_spec_hash_does_not_satisfy(self, tmp_path):
        """PQ-203: Stale spec_hash does not satisfy current F_P evaluator."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Create code so F_D passes
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        # Emit assessed with STALE spec_hash
        r = _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "stale assessment",
            "spec_hash": "deadbeef" * 2,  # intentionally wrong
        })
        assert r.returncode == 0, f"Should accept the event (validation is at bind time):\n{r.stderr}"

        # gen-gaps should still report gap — stale hash ignored
        data = _run_genesis_json(tmp_path, "gaps")
        failing_names = [f for g in data["gaps"] for f in g["failing"]]
        assert "code_complete" in failing_names, \
            "Stale spec_hash must NOT satisfy F_P evaluator"

    def test_pq204_missing_spec_hash_rejected(self, tmp_path):
        """PQ-204: assessed{kind: fp} without spec_hash is rejected by CLI."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        r = _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            # No spec_hash — must be rejected
        })
        assert r.returncode != 0, "assessed{kind: fp} without spec_hash must be rejected"

    def test_pq205_malformed_prime_payloads_rejected(self, tmp_path):
        """PQ-205: Malformed prime operator payloads are rejected."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # approved without kind
        r = _emit_event(tmp_path, "approved", {"edge": "design→code", "actor": "human"})
        assert r.returncode != 0, "approved without kind must be rejected"

        # revoked without kind
        r = _emit_event(tmp_path, "revoked", {
            "edge": "design→code", "actor": "human", "reason": "test",
        })
        assert r.returncode != 0, "revoked without kind must be rejected"

    def test_pq206_orphan_event_tolerance(self, tmp_path):
        """PQ-206: Events for edges not in the package are silently tolerated."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Inject event for a nonexistent edge
        r = _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "nonexistent→nowhere",
            "actor": "human",
        })
        assert r.returncode == 0, f"Orphan event should be accepted:\n{r.stderr}"

        # gen-gaps must still work — no crash from orphan
        data = _run_genesis_json(tmp_path, "gaps")
        assert "converged" in data, "gen-gaps must handle orphan events gracefully"
        # Orphan must not create false convergence
        assert data["converged"] is False, "Orphan event must not create false convergence"

    def test_pq207_rejection_is_not_revocation(self, tmp_path):
        """PQ-207: F_H rejection does not revoke approval or certification."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)

        # Create code so F_D passes
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        # Emit F_P pass
        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code created",
            "spec_hash": spec_hash,
        })

        # Emit F_H approval
        _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
        })

        # Verify converged
        mid = _run_genesis_json(tmp_path, "gaps")
        assert mid["converged"] is True, "Should be converged after F_D+F_P+F_H"

        # Now emit an F_H rejection — this must NOT revoke the approval
        r = _emit_event(tmp_path, "assessed", {
            "kind": "fh_review",
            "edge": "design→code",
            "result": "reject",
            "actor": "human",
            "reason": "testing rejection semantics",
        })
        assert r.returncode == 0

        # Should still be converged — rejection is happensAt only
        after = _run_genesis_json(tmp_path, "gaps")
        assert after["converged"] is True, (
            "F_H rejection must NOT revoke prior approval — "
            f"got total_delta={after['total_delta']}"
        )


# ── Group 4: State Integrity And Replay ───────────────────────────────────────

@pytest.mark.e2e
class TestStateIntegrity:
    """PQ-301 through PQ-304: Prove the deployed runtime is deterministic."""

    def test_pq301_replay_determinism(self, tmp_path):
        """PQ-301: Same event sequence in fresh sandboxes produces identical projection."""
        results = []
        for i in range(2):
            ws = tmp_path / f"sandbox_{i}"
            ws.mkdir()
            _install_sandbox(ws)
            _write_test_package(ws, _MINIMAL_PACKAGE)
            data = _run_genesis_json(ws, "gaps")
            results.append(data)

        # Compare full gap structure, not just summary fields
        assert results[0]["total_delta"] == results[1]["total_delta"], \
            "Replay must be deterministic — total_delta diverged"
        assert results[0]["converged"] == results[1]["converged"], \
            "Replay must be deterministic — converged diverged"
        assert results[0]["jobs_considered"] == results[1]["jobs_considered"], \
            "Replay must be deterministic — jobs_considered diverged"
        # Compare per-gap detail: edge names, delta values, failing/passing sets
        for g0, g1 in zip(results[0]["gaps"], results[1]["gaps"]):
            assert g0["edge"] == g1["edge"], f"Edge mismatch: {g0['edge']} vs {g1['edge']}"
            assert g0["delta"] == g1["delta"], f"Delta mismatch on {g0['edge']}"
            assert sorted(g0["failing"]) == sorted(g1["failing"]), \
                f"Failing set mismatch on {g0['edge']}"
            assert sorted(g0["passing"]) == sorted(g1["passing"]), \
                f"Passing set mismatch on {g0['edge']}"

    def test_pq302_gen_gaps_idempotence(self, tmp_path):
        """PQ-302: Repeated gen-gaps with no state changes returns identical results."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        first = _run_genesis_json(tmp_path, "gaps")
        second = _run_genesis_json(tmp_path, "gaps")

        # Full payload comparison — not just summary fields
        assert first["total_delta"] == second["total_delta"]
        assert first["converged"] == second["converged"]
        assert first["jobs_considered"] == second["jobs_considered"]
        assert len(first["gaps"]) == len(second["gaps"])
        for g0, g1 in zip(first["gaps"], second["gaps"]):
            assert g0["edge"] == g1["edge"]
            assert g0["delta"] == g1["delta"]
            assert sorted(g0["failing"]) == sorted(g1["failing"])
            assert sorted(g0["passing"]) == sorted(g1["passing"])
        # No side-effect events from read-only gaps command
        events_after_first = _read_events(tmp_path)
        first_count = len(events_after_first)
        _run_genesis_json(tmp_path, "gaps")
        events_after_third = _read_events(tmp_path)
        assert len(events_after_third) == first_count, \
            "gen-gaps must not emit events — read-only command"

    def test_pq303_no_stale_cert_after_evaluator_change(self, tmp_path):
        """PQ-303: Changing evaluator identity invalidates prior certification.

        Requires active-workflow.json to activate provenance-aware spec_hash
        (job_evaluator_hash). Without it, engine uses req_hash which only
        tracks requirement key changes, not evaluator description changes.
        """
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Enable provenance so engine uses job_evaluator_hash
        awj = tmp_path / ".genesis" / "active-workflow.json"
        awj.write_text(json.dumps({
            "workflow": "test_workflow",
            "version": "1.0.0",
        }))

        # Create code so F_D passes
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        # Compute job_evaluator_hash (provenance-aware)
        spec_hash = _compute_job_evaluator_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code created",
            "spec_hash": spec_hash,
        })

        # Verify F_P passes
        mid = _run_genesis_json(tmp_path, "gaps")
        mid_failing = [f for g in mid["gaps"] for f in g["failing"]]
        assert "code_complete" not in mid_failing, "F_P should pass with valid spec_hash"

        # Now change the evaluator description (changes job_evaluator_hash)
        changed_pkg = _MINIMAL_PACKAGE.replace(
            '"agent: code implements design"',
            '"agent: code implements design (v2 updated)"',
        )
        _write_test_package(tmp_path, changed_pkg)

        # Prior certification must now be stale
        after = _run_genesis_json(tmp_path, "gaps")
        after_failing = [f for g in after["gaps"] for f in g["failing"]]
        assert "code_complete" in after_failing, \
            "Prior certification must be invalidated after evaluator change"

    def test_pq304_illegal_transition_no_false_convergence(self, tmp_path):
        """PQ-304: Emitting approval/certification without F_D passing does not converge."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # No code directory — F_D will fail
        # Emit F_P pass anyway
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "fake",
            "spec_hash": "0" * 16,
        })

        # gen-gaps must still report non-converged (F_D still failing)
        data = _run_genesis_json(tmp_path, "gaps")
        assert data["converged"] is False, \
            "Must not converge when F_D is still failing despite F_P pass"


# ── Group 5: Boundary And Installer Discipline ────────────────────────────────

@pytest.mark.e2e
class TestBoundaryDiscipline:
    """PQ-401 through PQ-402: Prove installer creates correct artifacts."""

    def test_pq401_installed_runtime_no_build_tree_dependency(self, tmp_path):
        """PQ-401: Installed runtime operates from .genesis/ without build-tree imports."""
        _install_sandbox(tmp_path)

        # Run with ONLY .genesis on PYTHONPATH — no build tree
        env = os.environ.copy()
        env["PYTHONPATH"] = str(tmp_path / ".genesis")
        result = subprocess.run(
            [sys.executable, "-m", "genesis", "gaps", "--workspace", str(tmp_path)],
            capture_output=True, text=True,
            env=env,
        )
        assert result.returncode == 0, (
            f"Installed runtime must work without build tree:\n{result.stderr}"
        )

    def test_pq402_installer_creates_only_kernel_artifacts(self, tmp_path):
        """PQ-402: Installer creates .genesis/ contract — no unintended artifacts."""
        _install_sandbox(tmp_path)

        # .genesis/ must exist with expected structure
        genesis_dir = tmp_path / ".genesis"
        assert genesis_dir.is_dir()
        assert (genesis_dir / "genesis").is_dir()
        assert (genesis_dir / "gtl").is_dir()
        assert (genesis_dir / "gtl_spec").is_dir()
        assert (genesis_dir / "genesis.yml").is_file()

        # Verify no unexpected top-level directories beyond declared scope
        top_level = {p.name for p in tmp_path.iterdir()}
        # installer creates: .genesis, .ai-workspace (known leak), builds, CLAUDE.md
        # Everything present should be from a known set
        known = {".genesis", ".ai-workspace", "builds", "CLAUDE.md"}
        unexpected = top_level - known
        assert not unexpected, (
            f"Installer created unexpected artifacts: {unexpected}"
        )


# ── Group 6: F_P Fail Path ───────────────────────────────────────────────────

@pytest.mark.e2e
class TestFpFailPath:
    """PQ-106 through PQ-108: Prove the F_P fail branch works correctly."""

    def test_pq106_fp_fail_leaves_edge_open(self, tmp_path):
        """PQ-106: assessed{kind: fp, result: fail} does not satisfy F_P convergence."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        # Create code so F_D passes
        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        # Emit F_P FAIL assessment
        spec_hash = _compute_spec_hash(tmp_path)
        r = _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "fail",
            "actor": "test_fp",
            "evidence": "code does not satisfy design",
            "spec_hash": spec_hash,
        })
        assert r.returncode == 0, f"F_P fail assessment should be accepted:\n{r.stderr}"

        # Edge must still be open — fail does not initiate certified fluent
        data = _run_genesis_json(tmp_path, "gaps")
        failing = [f for g in data["gaps"] for f in g["failing"]]
        assert "code_complete" in failing, \
            "F_P fail assessment must NOT satisfy convergence — edge stays open"
        assert data["converged"] is False

    def test_pq107_fp_fail_then_pass_converges(self, tmp_path):
        """PQ-107: F_P fail followed by F_P pass converges correctly."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        spec_hash = _compute_spec_hash(tmp_path)

        # First attempt: F_P fails
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "fail",
            "actor": "test_fp",
            "evidence": "first attempt insufficient",
            "spec_hash": spec_hash,
        })

        # Verify still open
        mid = _run_genesis_json(tmp_path, "gaps")
        assert mid["converged"] is False

        # Second attempt: F_P passes
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "second attempt satisfactory",
            "spec_hash": spec_hash,
        })

        # Now should converge (F_D passing + F_P passing)
        after = _run_genesis_json(tmp_path, "gaps")
        assert after["converged"] is True, (
            f"F_P pass after fail should converge, got delta={after['total_delta']}"
        )

    def test_pq108_fp_fail_does_not_block_redispatch(self, tmp_path):
        """PQ-108: After F_P fail, gen-iterate can re-dispatch F_P."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        spec_hash = _compute_spec_hash(tmp_path)

        # F_P fails
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "fail",
            "actor": "test_fp",
            "evidence": "insufficient",
            "spec_hash": spec_hash,
        })

        # gen-iterate should still dispatch F_P again (F_D passes, F_P not satisfied)
        result = _run_genesis(tmp_path, "iterate")
        assert result.returncode == 0, (
            f"iterate after F_P fail should succeed:\n{result.stderr}"
        )
        data = json.loads(result.stdout)
        assert "fp_manifest_path" in data, \
            "F_P must be re-dispatched after prior F_P fail"


# ── Group 7: Installed Provenance Scenarios ───────────────────────────────────

@pytest.mark.e2e
class TestInstalledProvenance:
    """PQ-601 through PQ-605: Prove provenance binding works in the installed runtime."""

    def _enable_provenance(self, target: Path, workflow: str = "test_wf",
                           version: str = "1.0.0") -> None:
        """Install active-workflow.json to activate provenance-aware spec_hash."""
        awj = target / ".genesis" / "active-workflow.json"
        awj.write_text(json.dumps({"workflow": workflow, "version": version}))

    def test_pq601_workflow_version_mismatch_blocks_approval(self, tmp_path):
        """PQ-601: Approval from one workflow_version does not satisfy another."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)
        self._enable_provenance(tmp_path, version="1.0.0")

        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        # F_P pass with correct provenance hash
        spec_hash = _compute_job_evaluator_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code created",
            "spec_hash": spec_hash,
        })

        # Approval from a DIFFERENT workflow version — write raw to bypass
        # CLI annotation which overwrites workflow_version from active-workflow.json
        _write_raw_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
            "workflow_version": "test_wf@0.9.0",  # wrong version
        })

        # Should NOT converge — approval version doesn't match current
        data = _run_genesis_json(tmp_path, "gaps")
        failing = [f for g in data["gaps"] for f in g["failing"]]
        assert "design_approved" in failing, (
            "Approval from wrong workflow_version must not satisfy F_H gate"
        )

    def test_pq602_workflow_version_match_satisfies_approval(self, tmp_path):
        """PQ-602: Approval with matching workflow_version satisfies the gate."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)
        self._enable_provenance(tmp_path, version="1.0.0")

        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        spec_hash = _compute_job_evaluator_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code created",
            "spec_hash": spec_hash,
        })

        # Approval with MATCHING workflow version
        _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
            "workflow_version": "test_wf@1.0.0",
        })

        data = _run_genesis_json(tmp_path, "gaps")
        assert data["converged"] is True, (
            f"Matching workflow_version approval should converge, "
            f"got delta={data['total_delta']}, gaps={json.dumps(data['gaps'], indent=2)}"
        )

    def test_pq603_revocation_terminates_operative_fluent(self, tmp_path):
        """PQ-603: revoked{kind: fh_approval} terminates the operative fluent."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)

        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code created",
            "spec_hash": spec_hash,
        })

        # Approve
        _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
        })

        # Verify converged
        mid = _run_genesis_json(tmp_path, "gaps")
        assert mid["converged"] is True, "Should be converged before revocation"

        # Revoke the approval
        r = _emit_event(tmp_path, "revoked", {
            "kind": "fh_approval",
            "edge": "design→code",
            "actor": "human",
            "reason": "testing revocation semantics",
        })
        assert r.returncode == 0, f"Revocation should be accepted:\n{r.stderr}"

        # F_H gate should now be open again
        after = _run_genesis_json(tmp_path, "gaps")
        failing = [f for g in after["gaps"] for f in g["failing"]]
        assert "design_approved" in failing, (
            "Revocation must terminate operative fluent — F_H gate should reopen"
        )
        assert after["converged"] is False

    def test_pq604_revocation_then_reapproval_converges(self, tmp_path):
        """PQ-604: Re-approval after revocation restores convergence."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)

        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code created",
            "spec_hash": spec_hash,
        })

        # Approve → revoke → re-approve
        _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
        })
        _emit_event(tmp_path, "revoked", {
            "kind": "fh_approval",
            "edge": "design→code",
            "actor": "human",
            "reason": "rethinking",
        })
        _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human",
        })

        # Should converge again — re-approval postdates revocation
        after = _run_genesis_json(tmp_path, "gaps")
        assert after["converged"] is True, (
            f"Re-approval after revocation should converge, "
            f"got delta={after['total_delta']}"
        )

    def test_pq605_fp_revocation_terminates_certified_fluent(self, tmp_path):
        """PQ-605: revoked{kind: fp_assessment} terminates the certified fluent."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        code_dir = tmp_path / "code"
        code_dir.mkdir(exist_ok=True)
        (code_dir / "impl.py").write_text(
            "# Implements: REQ-TEST-001\ndef hello(): pass\n"
        )

        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_fp",
            "evidence": "code created",
            "spec_hash": spec_hash,
        })

        # Verify F_P converged
        mid = _run_genesis_json(tmp_path, "gaps")
        assert mid["converged"] is True, "Should converge with F_D+F_P passing"

        # Revoke the F_P assessment
        r = _emit_event(tmp_path, "revoked", {
            "kind": "fp_assessment",
            "edge": "design→code",
            "actor": "human",
            "reason": "testing F_P revocation semantics",
        })
        assert r.returncode == 0, f"F_P revocation should be accepted:\n{r.stderr}"

        # Certified fluent should be terminated — F_P gap reopens
        after = _run_genesis_json(tmp_path, "gaps")
        failing = [f for g in after["gaps"] for f in g["failing"]]
        assert "code_complete" in failing, (
            "F_P revocation must terminate certified fluent — edge should reopen"
        )
        assert after["converged"] is False
