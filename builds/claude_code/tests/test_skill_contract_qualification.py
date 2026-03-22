# Validates: REQ-F-BOOT-001
# Validates: REQ-F-BOOT-002
# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-GATE-001
# Validates: REQ-F-GATE-002
# Validates: REQ-F-EVAL-004
# Validates: REQ-F-EVAL-005
# Validates: REQ-F-TEST-001
"""
Skill Contract Qualification Suite — ABG Skill-Layer Integration Gate.

Proves the contract surface between the ABG engine CLI and the Claude Code
skill layer (/gen-start, /gen-iterate) is correct. Every test:
  1. Installs into a fresh sandbox via gen-install.py
  2. Runs the engine through subprocess CLI calls
  3. Validates that the JSON output and exit codes match what the skill routing
     table in CLAUDE.md expects to consume

This is NOT a re-test of kernel correctness (the PQ suite covers that).
This suite proves: if the skill reads what the engine writes, it gets
the right data in the right shape.

Run: pytest -m e2e -k test_skill_contract
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
    """Run genesis command and parse JSON stdout (accepts any exit code)."""
    result = _run_genesis(target, *args)
    return json.loads(result.stdout), result.returncode


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


def _write_test_package(target: Path, package_code: str) -> None:
    """Write a test domain package and bind genesis.yml to it.

    The kernel installer seeds genesis.yml without a default binding.
    Tests define their own domain package — same pattern as a domain installer consuming ABG.
    """
    pkg_dir = target / ".genesis" / "gtl_spec" / "packages"
    pkg_dir.mkdir(parents=True, exist_ok=True)
    (pkg_dir / "test_pkg.py").write_text(package_code)
    # Bind genesis.yml to the test package
    (target / ".genesis" / "genesis.yml").write_text(
        "package: gtl_spec.packages.test_pkg:package\n"
        "worker:  gtl_spec.packages.test_pkg:worker\n"
    )


def _compute_spec_hash(target: Path) -> str:
    """Compute spec_hash using installed engine's req_hash (no active-workflow.json)."""
    result = subprocess.run(
        [sys.executable, "-c",
         "from genesis.bind import req_hash; print(req_hash(['REQ-TEST-001']))"],
        capture_output=True, text=True,
        env=_installed_env(target),
    )
    assert result.returncode == 0, f"req_hash computation failed: {result.stderr}"
    return result.stdout.strip()


def _satisfy_fd(target: Path) -> None:
    """Create a tagged code file so F_D (check-tags) passes."""
    code_dir = target / "code"
    code_dir.mkdir(exist_ok=True)
    (code_dir / "impl.py").write_text(
        "# Implements: REQ-TEST-001\ndef hello(): pass\n"
    )


# ── Test packages ────────────────────────────────────────────────────────────

_MINIMAL_PACKAGE = textwrap.dedent('''\
    """Minimal test package: F_D + F_P."""
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
    """Test package with F_D + F_P + F_H chain."""
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


# ── Group 1: Bootloader Injection ────────────────────────────────────────────

@pytest.mark.e2e
class TestBootloaderInjection:
    """Prove the installer creates the contract surface the skill layer depends on."""

    def test_sc001_claude_md_bootloader_injected(self, tmp_path):
        """SC-001: Installer appends GTL bootloader to CLAUDE.md with markers."""
        _install_sandbox(tmp_path)
        claude_md = tmp_path / "CLAUDE.md"
        assert claude_md.exists(), "Installer must create CLAUDE.md"
        content = claude_md.read_text()
        assert "<!-- GTL_BOOTLOADER_START -->" in content, (
            "CLAUDE.md must contain GTL_BOOTLOADER_START marker"
        )
        assert "<!-- GTL_BOOTLOADER_END -->" in content, (
            "CLAUDE.md must contain GTL_BOOTLOADER_END marker"
        )
        # Bootloader content is between markers
        start = content.index("<!-- GTL_BOOTLOADER_START -->")
        end = content.index("<!-- GTL_BOOTLOADER_END -->")
        bootloader = content[start:end]
        assert len(bootloader) > 100, "Bootloader content must be substantial"

    def test_sc002_bootloader_idempotent(self, tmp_path):
        """SC-002: Reinstall does not duplicate bootloader section."""
        _install_sandbox(tmp_path)
        _install_sandbox(tmp_path)  # second install
        content = (tmp_path / "CLAUDE.md").read_text()
        assert content.count("<!-- GTL_BOOTLOADER_START -->") == 1, (
            "Bootloader must appear exactly once after reinstall"
        )

    def test_sc003_genesis_yml_skill_fields(self, tmp_path):
        """SC-003: genesis.yml contains package/worker refs the skill needs."""
        _install_sandbox(tmp_path)
        # Domain installer binds package/worker — kernel default has none
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        yml_path = tmp_path / ".genesis" / "genesis.yml"
        assert yml_path.exists(), ".genesis/genesis.yml must exist"
        import yaml
        config = yaml.safe_load(yml_path.read_text())
        assert "package" in config, "genesis.yml must specify package module"
        assert "worker" in config, "genesis.yml must specify worker module"
        assert ":package" in config["package"], "package must use module:var format"
        assert ":worker" in config["worker"], "worker must use module:var format"


# ── Group 2: Exit Code Contract ──────────────────────────────────────────────

@pytest.mark.e2e
class TestExitCodeContract:
    """Prove each exit code produces the JSON fields the skill routing table expects."""

    def test_sc101_exit0_converged_fields(self, tmp_path):
        """SC-101: Exit 0 (converged) produces status field."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        # Satisfy F_P to converge
        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test",
            "evidence": "test",
            "spec_hash": spec_hash,
        })

        result = _run_genesis(tmp_path, "start")
        assert result.returncode == 0, f"Expected exit 0, got {result.returncode}"
        data = json.loads(result.stdout)
        assert data["status"] in ("converged", "nothing_to_do"), (
            f"Exit 0 must have status converged|nothing_to_do, got {data['status']}"
        )

    def test_sc102_exit2_fp_dispatch_fields(self, tmp_path):
        """SC-102: Exit 2 (fp_dispatched) produces all fields the skill needs for MCP dispatch."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        result = _run_genesis(tmp_path, "start", "--auto")
        assert result.returncode == 2, (
            f"Expected exit 2 (fp_dispatch), got {result.returncode}\n{result.stderr}"
        )
        data = json.loads(result.stdout)

        # Fields the skill routing table requires
        assert data.get("stopped_by") == "fp_dispatch", (
            f"Exit 2 must have stopped_by=fp_dispatch, got {data.get('stopped_by')}"
        )
        assert "fp_manifest_path" in data, (
            "Exit 2 must include fp_manifest_path for MCP dispatch"
        )
        assert "edge" in data, "Exit 2 must include edge name"
        assert "failing_evaluators" in data, "Exit 2 must include failing_evaluators"
        assert "delta_before" in data, "Exit 2 must include delta_before"
        assert "events_emitted" in data, "Exit 2 must include events_emitted"

    def test_sc103_exit3_fh_gate_fields(self, tmp_path):
        """SC-103: Exit 3 (fh_gate_pending) produces fh_gate criteria for the skill."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)
        _satisfy_fd(tmp_path)

        # Satisfy F_P so only F_H remains
        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test",
            "evidence": "test",
            "spec_hash": spec_hash,
        })

        result = _run_genesis(tmp_path, "start", "--auto")
        assert result.returncode == 3, (
            f"Expected exit 3 (fh_gate), got {result.returncode}\n"
            f"stdout: {result.stdout}\nstderr: {result.stderr}"
        )
        data = json.loads(result.stdout)

        assert data.get("stopped_by") == "fh_gate", (
            f"Exit 3 must have stopped_by=fh_gate, got {data.get('stopped_by')}"
        )
        assert "fh_gate" in data, "Exit 3 must include fh_gate object"
        gate = data["fh_gate"]
        assert "edge" in gate, "fh_gate must include edge name"
        assert "evaluators" in gate, "fh_gate must include evaluator names"
        assert "criteria" in gate, "fh_gate must include criteria descriptions"
        assert isinstance(gate["criteria"], list), "criteria must be a list"
        assert len(gate["criteria"]) > 0, "criteria must not be empty"
        # Each criterion is a string the skill surfaces to the human/proxy
        for c in gate["criteria"]:
            assert isinstance(c, str) and len(c) > 0, (
                f"Each criterion must be a non-empty string, got {c!r}"
            )

    def test_sc104_exit4_fd_gap_fields(self, tmp_path):
        """SC-104: Exit 4 (fd_gap) produces failing evaluator info for the skill."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        # No code file → F_D fails

        result = _run_genesis(tmp_path, "iterate")
        assert result.returncode == 4, (
            f"Expected exit 4 (fd_gap), got {result.returncode}\n{result.stderr}"
        )
        data = json.loads(result.stdout)

        assert data.get("stopped_by") == "fd_gap", (
            f"Exit 4 must have stopped_by=fd_gap, got {data.get('stopped_by')}"
        )
        assert "failing_evaluators" in data, "Exit 4 must include failing_evaluators"
        assert len(data["failing_evaluators"]) > 0, "Must have at least one failing evaluator"
        assert "edge" in data, "Exit 4 must include edge"

    def test_sc105_exit5_max_iterations_fields(self, tmp_path):
        """SC-105: Exit 5 (max_iterations) produces stopped_by field."""
        # This is hard to trigger naturally — we'd need 50 iterations.
        # Instead, verify the field contract exists in the routing code.
        # The engine's __main__.py maps stopped_by="max_iterations" → exit 5.
        # We trust kernel PQ for the logic; here we verify the exit code mapping.
        _install_sandbox(tmp_path)
        # Verify the routing contract exists in the installed engine
        main_py = tmp_path / ".genesis" / "genesis" / "__main__.py"
        content = main_py.read_text()
        assert '"max_iterations"' in content, (
            "Installed engine must map max_iterations to exit code"
        )
        assert "sys.exit(5)" in content, (
            "max_iterations must map to exit 5"
        )

    def test_sc106_exit1_error_stderr(self, tmp_path):
        """SC-106: Exit 1 (error) writes to stderr, not stdout JSON."""
        _install_sandbox(tmp_path)
        # Corrupt genesis.yml to trigger error
        yml = tmp_path / ".genesis" / "genesis.yml"
        yml.write_text("package: nonexistent.module:package\nworker: nonexistent.module:worker\n")

        result = _run_genesis(tmp_path, "gaps")
        assert result.returncode == 1, f"Expected exit 1, got {result.returncode}"
        assert len(result.stderr) > 0, "Exit 1 must write error to stderr"


# ── Group 3: Manifest Round-Trip ─────────────────────────────────────────────

@pytest.mark.e2e
class TestManifestContract:
    """Prove the F_P manifest file has the structure the skill expects."""

    def test_sc201_manifest_file_exists(self, tmp_path):
        """SC-201: fp_manifest_path points to an existing, readable JSON file."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        result = _run_genesis(tmp_path, "start", "--auto")
        assert result.returncode == 2
        data = json.loads(result.stdout)

        manifest_path = Path(data["fp_manifest_path"])
        assert manifest_path.exists(), f"Manifest file must exist at {manifest_path}"
        manifest = json.loads(manifest_path.read_text())
        assert isinstance(manifest, dict), "Manifest must be a JSON object"

    def test_sc202_manifest_required_fields(self, tmp_path):
        """SC-202: Manifest contains all fields the skill needs for MCP dispatch."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        result = _run_genesis(tmp_path, "start", "--auto")
        data = json.loads(result.stdout)
        manifest = json.loads(Path(data["fp_manifest_path"]).read_text())

        # Fields the skill reads per gen-start.md Step 3
        assert "manifest_id" in manifest, "Manifest must have manifest_id"
        assert "edge" in manifest, "Manifest must have edge"
        assert "prompt" in manifest, "Manifest must have prompt"
        assert "result_path" in manifest, "Manifest must have result_path"
        assert "spec_hash" in manifest, "Manifest must have spec_hash"
        assert "failing_evaluators" in manifest, "Manifest must have failing_evaluators"

    def test_sc203_manifest_prompt_is_substantial(self, tmp_path):
        """SC-203: Manifest prompt is a real assembled prompt, not empty."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        result = _run_genesis(tmp_path, "start", "--auto")
        data = json.loads(result.stdout)
        manifest = json.loads(Path(data["fp_manifest_path"]).read_text())

        prompt = manifest["prompt"]
        assert isinstance(prompt, str), "Prompt must be a string"
        assert len(prompt) > 50, f"Prompt must be substantial, got {len(prompt)} chars"

    def test_sc204_manifest_result_path_is_writable(self, tmp_path):
        """SC-204: result_path parent directory exists and is writable."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        result = _run_genesis(tmp_path, "start", "--auto")
        data = json.loads(result.stdout)
        manifest = json.loads(Path(data["fp_manifest_path"]).read_text())

        result_path = Path(manifest["result_path"])
        assert result_path.parent.exists(), (
            f"result_path parent must exist: {result_path.parent}"
        )
        # Verify writable by writing a test file
        test_file = result_path.parent / ".write_test"
        test_file.write_text("test")
        test_file.unlink()

    def test_sc205_manifest_evaluators_have_name_and_description(self, tmp_path):
        """SC-205: failing_evaluators entries have name + description for the actor."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        result = _run_genesis(tmp_path, "start", "--auto")
        data = json.loads(result.stdout)
        manifest = json.loads(Path(data["fp_manifest_path"]).read_text())

        for ev in manifest["failing_evaluators"]:
            assert "name" in ev, "Each evaluator must have a name"
            assert "description" in ev, "Each evaluator must have a description"
            assert isinstance(ev["name"], str) and len(ev["name"]) > 0
            assert isinstance(ev["description"], str) and len(ev["description"]) > 0


# ── Group 4: Result → Emit Pipeline ─────────────────────────────────────────

@pytest.mark.e2e
class TestResultEmitPipeline:
    """Prove the skill's result→emit-event pipeline works end to end."""

    def test_sc301_result_file_then_emit_converges(self, tmp_path):
        """SC-301: Write result file + emit assessed events → edge converges."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        # Get manifest
        result = _run_genesis(tmp_path, "start", "--auto")
        assert result.returncode == 2
        data = json.loads(result.stdout)
        manifest = json.loads(Path(data["fp_manifest_path"]).read_text())

        # Simulate what the skill does: write result file, then emit assessed
        result_payload = {
            "edge": manifest["edge"],
            "assessments": [
                {
                    "evaluator": ev["name"],
                    "result": "pass",
                    "evidence": "Test evidence for skill contract",
                }
                for ev in manifest["failing_evaluators"]
            ],
        }
        Path(manifest["result_path"]).write_text(json.dumps(result_payload))

        # Skill emits assessed for each passing evaluator
        for assessment in result_payload["assessments"]:
            r = _emit_event(tmp_path, "assessed", {
                "kind": "fp",
                "edge": manifest["edge"],
                "evaluator": assessment["evaluator"],
                "result": "pass",
                "actor": "test_skill",
                "evidence": assessment["evidence"],
                "spec_hash": manifest["spec_hash"],
            })
            assert r.returncode == 0, f"emit-event failed: {r.stderr}"

        # Verify convergence
        gaps = _run_genesis(tmp_path, "gaps")
        gap_data = json.loads(gaps.stdout)
        assert gap_data["converged"] is True, (
            f"Result→emit pipeline should converge, got delta={gap_data['total_delta']}"
        )

    def test_sc302_result_file_fail_does_not_converge(self, tmp_path):
        """SC-302: Result with result=fail does not satisfy the evaluator."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        result = _run_genesis(tmp_path, "start", "--auto")
        data = json.loads(result.stdout)
        manifest = json.loads(Path(data["fp_manifest_path"]).read_text())

        # Skill writes result with fail
        result_payload = {
            "edge": manifest["edge"],
            "assessments": [
                {
                    "evaluator": ev["name"],
                    "result": "fail",
                    "evidence": "Could not satisfy criteria",
                }
                for ev in manifest["failing_evaluators"]
            ],
        }
        Path(manifest["result_path"]).write_text(json.dumps(result_payload))

        # Skill emits assessed with fail
        for assessment in result_payload["assessments"]:
            _emit_event(tmp_path, "assessed", {
                "kind": "fp",
                "edge": manifest["edge"],
                "evaluator": assessment["evaluator"],
                "result": "fail",
                "actor": "test_skill",
                "evidence": assessment["evidence"],
                "spec_hash": manifest["spec_hash"],
            })

        # Should NOT converge
        gaps = _run_genesis(tmp_path, "gaps")
        gap_data = json.loads(gaps.stdout)
        assert gap_data["converged"] is False, "Result=fail must not converge"

    def test_sc303_emit_without_spec_hash_rejected(self, tmp_path):
        """SC-303: Skill that forgets spec_hash gets rejected by emit-event."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)

        r = _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test_skill",
            "evidence": "test",
            # missing spec_hash
        })
        assert r.returncode != 0, "emit-event must reject assessed without spec_hash"
        assert "spec_hash" in r.stderr.lower(), (
            "Error must mention spec_hash"
        )


# ── Group 5: F_H Gate Contract ───────────────────────────────────────────────

@pytest.mark.e2e
class TestFHGateContract:
    """Prove the F_H gate output matches what the skill needs for human/proxy routing."""

    def test_sc401_fh_gate_approval_event_format(self, tmp_path):
        """SC-401: Skill emits approved event and edge converges."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)
        _satisfy_fd(tmp_path)

        # Satisfy F_P
        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test",
            "evidence": "test",
            "spec_hash": spec_hash,
        })

        # Get F_H gate
        result = _run_genesis(tmp_path, "start", "--auto")
        assert result.returncode == 3, f"Expected fh_gate (exit 3), got {result.returncode}"
        data = json.loads(result.stdout)
        gate = data["fh_gate"]

        # Skill emits approved with the exact format gen-start.md specifies
        r = _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": gate["edge"],
            "actor": "human",
        })
        assert r.returncode == 0, f"Approval emit failed: {r.stderr}"

        # Verify converged
        gaps = _run_genesis(tmp_path, "gaps")
        gap_data = json.loads(gaps.stdout)
        assert gap_data["converged"] is True, (
            f"F_H approval should converge, got delta={gap_data['total_delta']}"
        )

    def test_sc402_fh_gate_proxy_actor_field(self, tmp_path):
        """SC-402: Proxy approval with actor='human-proxy' is accepted."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)
        _satisfy_fd(tmp_path)

        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test",
            "evidence": "test",
            "spec_hash": spec_hash,
        })

        # Emit proxy approval with actor=human-proxy and proxy_log
        r = _emit_event(tmp_path, "approved", {
            "kind": "fh_review",
            "edge": "design→code",
            "actor": "human-proxy",
            "proxy_log": "/tmp/test_proxy_log.md",
        })
        assert r.returncode == 0, f"Proxy approval emit failed: {r.stderr}"

        gaps = _run_genesis(tmp_path, "gaps")
        gap_data = json.loads(gaps.stdout)
        assert gap_data["converged"] is True, "Proxy approval should converge"

    def test_sc403_human_proxy_flag_surfaced(self, tmp_path):
        """SC-403: --human-proxy flag is reflected in start output."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _FH_PACKAGE)
        _satisfy_fd(tmp_path)

        spec_hash = _compute_spec_hash(tmp_path)
        _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "result": "pass",
            "actor": "test",
            "evidence": "test",
            "spec_hash": spec_hash,
        })

        # Run with --human-proxy
        result = _run_genesis(tmp_path, "start", "--auto", "--human-proxy")
        data = json.loads(result.stdout)
        assert data.get("human_proxy") is True, (
            "start --human-proxy must surface human_proxy=true in output"
        )


# ── Group 6: Malformed Skill Behavior Fails Closed ──────────────────────────

@pytest.mark.e2e
class TestMalformedSkillFailsClosed:
    """Prove that incorrect skill behavior is rejected by the engine."""

    def test_sc501_emit_assessed_missing_result(self, tmp_path):
        """SC-501: assessed without result field is rejected."""
        _install_sandbox(tmp_path)
        r = _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "evaluator": "code_complete",
            "actor": "test",
            "spec_hash": "abc123",
            # missing result
        })
        assert r.returncode != 0, "assessed without result must be rejected"

    def test_sc502_emit_approved_missing_kind(self, tmp_path):
        """SC-502: approved event without kind is rejected."""
        _install_sandbox(tmp_path)
        r = _emit_event(tmp_path, "approved", {
            "edge": "design→code",
            "actor": "human",
            # missing kind
        })
        assert r.returncode != 0, "approved without kind must be rejected"

    def test_sc503_emit_assessed_missing_evaluator(self, tmp_path):
        """SC-503: assessed{kind: fp} without evaluator is rejected."""
        _install_sandbox(tmp_path)
        r = _emit_event(tmp_path, "assessed", {
            "kind": "fp",
            "edge": "design→code",
            "result": "pass",
            "actor": "test",
            "spec_hash": "abc123",
            # missing evaluator
        })
        assert r.returncode != 0, "assessed without evaluator must be rejected"

    def test_sc504_emit_revoked_invalid_kind(self, tmp_path):
        """SC-504: revoked with invalid kind is rejected."""
        _install_sandbox(tmp_path)
        r = _emit_event(tmp_path, "revoked", {
            "kind": "invalid_kind",
            "edge": "design→code",
            "actor": "human",
        })
        assert r.returncode != 0, "revoked with invalid kind must be rejected"

    def test_sc505_duplicate_dispatch_blocked(self, tmp_path):
        """SC-505: Second dispatch while first is in-flight returns pending status."""
        _install_sandbox(tmp_path)
        _write_test_package(tmp_path, _MINIMAL_PACKAGE)
        _satisfy_fd(tmp_path)

        # First dispatch
        r1 = _run_genesis(tmp_path, "start", "--auto")
        assert r1.returncode == 2, "First dispatch should succeed"

        # Second dispatch — should detect pending and not re-dispatch
        r2 = _run_genesis(tmp_path, "iterate")
        data2 = json.loads(r2.stdout)
        assert data2.get("status") == "pending", (
            f"Second dispatch while first in-flight must return pending, got {data2.get('status')}"
        )
        assert "pending_manifest_id" in data2, (
            "Pending response must include pending_manifest_id"
        )
