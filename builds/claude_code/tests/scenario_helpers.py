# Validates: REQ-F-BOOT-001
# Validates: REQ-F-PKG-001
"""
Shared kernel infrastructure for disjoint single-hop scenario fixtures.

Each scenario file is an independent mini-project that proves one A→B
transformation in a fresh sandbox. This module provides the shared kernel
plumbing — install, env, run, emit, read, assert — so each scenario file
focuses on its own domain, package, and truth assertions.

RunArchive: persistent forensic archive for every test run.
  tests/runs/<usecase_id>/<sortable_datetime>/
    workspace/       — full sandbox snapshot (immutable after run)
    run.json         — provenance: commit, timestamp, commands, exit codes
    stdout.log       — accumulated subprocess stdout
    stderr.log       — accumulated subprocess stderr
    summary.json     — converged/failed, evaluators, artifact paths
    artifacts/       — copies of manifests, result files

Rules:
  - Each run directory is immutable once written
  - Never overwrite a prior run
  - Failed runs are at least as valuable as passing runs

Not a test file — pytest will not collect this module.
"""
import json
import os
import shutil
import subprocess
import sys
import textwrap
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


_INSTALLER = Path(__file__).resolve().parent.parent / "code" / "gen-install.py"
_RUNS_DIR = Path(__file__).resolve().parent.parent / "test_runs"


# ══════════════════════════════════════════════════════════════════════════════
# RunArchive — persistent forensic archive
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class RunArchive:
    """Persistent archive for a single test run.

    The archive captures the full sandbox workspace, subprocess logs,
    provenance metadata, and key artifacts for postmortem investigation.
    """
    run_dir: Path
    workspace: Path
    artifacts_dir: Path
    usecase_id: str
    test_name: str
    timestamp: str
    _commands: list = field(default_factory=list)
    _stdout_path: Path = field(init=False)
    _stderr_path: Path = field(init=False)
    _finalized: bool = field(default=False)

    def __post_init__(self):
        self._stdout_path = self.run_dir / "stdout.log"
        self._stderr_path = self.run_dir / "stderr.log"

    def log_subprocess(self, label: str, result: subprocess.CompletedProcess) -> None:
        """Record a subprocess invocation to logs and command list."""
        self._commands.append({
            "label": label,
            "args": result.args if isinstance(result.args, list) else str(result.args),
            "returncode": result.returncode,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        with open(self._stdout_path, "a") as f:
            f.write(f"─── {label} (exit {result.returncode}) ───\n")
            f.write(result.stdout or "")
            f.write("\n")
        with open(self._stderr_path, "a") as f:
            f.write(f"─── {label} (exit {result.returncode}) ───\n")
            f.write(result.stderr or "")
            f.write("\n")

    def finalize(self, *, test_passed: bool = True) -> None:
        """Write run.json, summary.json, and copy artifacts. Called once."""
        if self._finalized:
            return
        self._finalized = True

        # ── summary.json: build first (may log a gaps subprocess) ──
        summary = self._build_summary()
        (self.run_dir / "summary.json").write_text(
            json.dumps(summary, indent=2), encoding="utf-8")

        # ── run.json: provenance (written after summary so all commands are captured) ──
        source_commit = _get_git_commit()
        run_meta = {
            "usecase_id": self.usecase_id,
            "test_name": self.test_name,
            "timestamp": self.timestamp,
            "test_passed": test_passed,
            "source_commit": source_commit,
            "installer": str(_INSTALLER),
            "python": sys.executable,
            "commands": self._commands,
        }
        (self.run_dir / "run.json").write_text(
            json.dumps(run_meta, indent=2), encoding="utf-8")

        # ── artifacts/: copy manifests + results ──
        self._copy_artifacts()

    def _build_summary(self) -> dict:
        """Build summary from workspace state.

        Handles both single-workspace and multi-workspace (sub-sandbox) tests.
        If the root workspace has no events, walks immediate subdirectories
        for sub-workspaces and aggregates their events.
        """
        events = read_events(self.workspace)

        # Detect sub-workspaces: if root has no events, check for sandbox subdirs
        sub_workspaces: list[dict] = []
        if not events:
            for child in sorted(self.workspace.iterdir()):
                if child.is_dir() and (child / ".ai-workspace" / "events" / "events.jsonl").exists():
                    sub_events = read_events(child)
                    if sub_events:
                        events.extend(sub_events)
                        sub_workspaces.append({
                            "name": child.name,
                            "event_count": len(sub_events),
                        })

        summary: dict = {
            "usecase_id": self.usecase_id,
            "test_name": self.test_name,
            "total_events": len(events),
            "event_types": list({e["event_type"] for e in events}),
        }
        if sub_workspaces:
            summary["sub_workspaces"] = sub_workspaces

        # Try to get final gaps state — use first sub-workspace if root has no package
        gaps_target = self.workspace
        if sub_workspaces:
            # Use first sub-workspace that has a genesis install
            for child in sorted(self.workspace.iterdir()):
                if child.is_dir() and (child / ".genesis" / "genesis.yml").exists():
                    gaps_target = child
                    break

        try:
            gaps_data = run_genesis_json(
                gaps_target, "gaps", archive=self,
                label="finalize gaps",
            )
            summary["converged"] = gaps_data.get("converged")
            summary["total_delta"] = gaps_data.get("total_delta")
            summary["failing_evaluators"] = [
                f for g in gaps_data.get("gaps", []) for f in g.get("failing", [])
            ]
        except (AssertionError, json.JSONDecodeError):
            summary["converged"] = None
            summary["total_delta"] = None
            summary["failing_evaluators"] = []

        # Key artifact paths — check root and sub-workspaces
        manifest_files = []
        result_files = []
        for ws in [self.workspace] + [self.workspace / sw["name"] for sw in sub_workspaces]:
            mdir = ws / ".ai-workspace" / "fp_manifests"
            if mdir.exists():
                manifest_files.extend(str(f.name) for f in mdir.glob("*.json"))
            rdir = ws / ".ai-workspace" / "fp_results"
            if rdir.exists():
                result_files.extend(str(f.name) for f in rdir.glob("*.json"))
        if manifest_files:
            summary["manifest_files"] = manifest_files
        if result_files:
            summary["result_files"] = result_files

        return summary

    def _copy_artifacts(self) -> None:
        """Copy key artifacts to the artifacts/ directory.

        Handles sub-workspaces: copies from root and any sandbox subdirs.
        """
        workspaces = [self.workspace]
        # Detect sub-workspaces
        for child in sorted(self.workspace.iterdir()):
            if child.is_dir() and (child / ".ai-workspace").exists():
                workspaces.append(child)

        all_events: list[str] = []
        for ws in workspaces:
            prefix = f"{ws.name}_" if ws != self.workspace else ""

            # Manifests
            mdir = ws / ".ai-workspace" / "fp_manifests"
            if mdir.exists():
                for f in mdir.glob("*.json"):
                    shutil.copy2(f, self.artifacts_dir / f"{prefix}manifest_{f.name}")

            # Results
            rdir = ws / ".ai-workspace" / "fp_results"
            if rdir.exists():
                for f in rdir.glob("*.json"):
                    shutil.copy2(f, self.artifacts_dir / f"{prefix}result_{f.name}")

            # Event log — aggregate into single file
            efile = ws / ".ai-workspace" / "events" / "events.jsonl"
            if efile.exists():
                content = efile.read_text().strip()
                if content:
                    all_events.append(content)

        if all_events:
            (self.artifacts_dir / "events.jsonl").write_text(
                "\n".join(all_events) + "\n", encoding="utf-8")


def create_run_archive(usecase_id: str, test_name: str) -> RunArchive:
    """Create a new persistent run archive directory.

    Structure: tests/runs/<usecase_id>/<YYYYMMDDTHHMMSS_testname>/
    """
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    run_name = f"{ts}_{test_name}"
    run_dir = _RUNS_DIR / usecase_id / run_name
    run_dir.mkdir(parents=True, exist_ok=True)

    workspace = run_dir / "workspace"
    workspace.mkdir(exist_ok=True)
    artifacts = run_dir / "artifacts"
    artifacts.mkdir(exist_ok=True)

    return RunArchive(
        run_dir=run_dir,
        workspace=workspace,
        artifacts_dir=artifacts,
        usecase_id=usecase_id,
        test_name=test_name,
        timestamp=ts,
    )


def _get_git_commit() -> str:
    """Get current git commit hash for provenance."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True, text=True, timeout=5,
        )
        return result.stdout.strip() if result.returncode == 0 else "unknown"
    except Exception:
        return "unknown"


# ══════════════════════════════════════════════════════════════════════════════
# Kernel infrastructure helpers
# ══════════════════════════════════════════════════════════════════════════════

def install_sandbox(target: Path, archive: Optional[RunArchive] = None) -> dict:
    """Run gen-install.py into a fresh target directory. Returns installer JSON."""
    result = subprocess.run(
        [sys.executable, str(_INSTALLER), "--target", str(target)],
        capture_output=True, text=True,
    )
    if archive:
        archive.log_subprocess("gen-install.py", result)
    assert result.returncode == 0, (
        f"gen-install.py failed:\nstdout: {result.stdout}\nstderr: {result.stderr}"
    )
    return json.loads(result.stdout)


def installed_env(target: Path) -> dict:
    """Environment for subprocess genesis invocations against the INSTALLED runtime."""
    env = os.environ.copy()
    paths = [str(target / ".genesis"), str(target)]
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = os.pathsep.join(paths + ([existing] if existing else []))
    return env


def run_genesis(
    target: Path, *args: str, archive: Optional[RunArchive] = None,
    label: str = "",
) -> subprocess.CompletedProcess:
    """Run an installed genesis command as subprocess."""
    result = subprocess.run(
        [sys.executable, "-m", "genesis", *args, "--workspace", str(target)],
        capture_output=True, text=True,
        env=installed_env(target),
    )
    if archive:
        archive.log_subprocess(label or f"genesis {' '.join(args)}", result)
    return result


def run_genesis_json(
    target: Path, *args: str, archive: Optional[RunArchive] = None,
    label: str = "",
) -> dict:
    """Run genesis command and parse JSON stdout."""
    result = run_genesis(target, *args, archive=archive, label=label)
    assert result.returncode == 0, (
        f"genesis {' '.join(args)} failed (exit {result.returncode}):\n{result.stderr}"
    )
    return json.loads(result.stdout)


def emit_event(
    target: Path, event_type: str, data: dict,
    archive: Optional[RunArchive] = None,
) -> subprocess.CompletedProcess:
    """Emit an event through the installed CLI."""
    result = subprocess.run(
        [sys.executable, "-m", "genesis", "emit-event",
         "--type", event_type,
         "--data", json.dumps(data),
         "--workspace", str(target)],
        capture_output=True, text=True,
        env=installed_env(target),
    )
    if archive:
        archive.log_subprocess(f"emit-event {event_type}", result)
    return result


def write_fp_result(
    target: Path, manifest_id: str, edge_name: str,
    assessments: list[dict],
    actor: str = "test_agent",
) -> Path:
    """Write an F_P result JSON file to the result_path location.

    This simulates what a real F_P actor does: read the manifest, do work,
    write the assessment JSON to result_path. Returns the result file path.
    """
    results_dir = target / ".ai-workspace" / "fp_results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_file = results_dir / f"{manifest_id}.json"
    result_data = {
        "edge": edge_name,
        "actor": actor,
        "assessments": assessments,
    }
    result_file.write_text(json.dumps(result_data, indent=2), encoding="utf-8")
    return result_file


def assess_result(
    target: Path, result_path: Path,
    archive: Optional[RunArchive] = None,
) -> subprocess.CompletedProcess:
    """Ingest F_P result via the assess-result command.

    This is the app-level consumer that closes the result_path protocol.
    Both skill layer and test harness use this same path.
    """
    result = subprocess.run(
        [sys.executable, "-m", "genesis", "assess-result",
         "--result", str(result_path),
         "--workspace", str(target)],
        capture_output=True, text=True,
        env=installed_env(target),
    )
    if archive:
        archive.log_subprocess("assess-result", result)
    return result


def read_events(target: Path) -> list[dict]:
    """Read all events from the installed workspace event log."""
    events_path = target / ".ai-workspace" / "events" / "events.jsonl"
    if not events_path.exists():
        return []
    events = []
    for line in events_path.read_text().strip().split("\n"):
        if line.strip():
            events.append(json.loads(line))
    return events


def compute_spec_hash(
    target: Path, archive: Optional[RunArchive] = None,
) -> str:
    """Compute the current spec_hash using the same logic as the engine.

    Mirrors commands.py spec_hash selection:
      - workflow_version == "unknown" → req_hash(package.requirements)
      - workflow_version != "unknown" → job_evaluator_hash(job)
    """
    result = subprocess.run(
        [sys.executable, "-c", textwrap.dedent("""\
            import json, sys
            from pathlib import Path
            sys.path.insert(0, '.genesis')
            from genesis.bind import req_hash, job_evaluator_hash
            from genesis.commands import _read_workflow_version
            from gtl_spec.packages.test_pkg import package, worker

            wv = _read_workflow_version(Path('.'))
            if wv == 'unknown':
                print(req_hash(package.requirements))
            else:
                print(job_evaluator_hash(worker.can_execute[0]))
        """)],
        capture_output=True, text=True,
        cwd=str(target),
        env=installed_env(target),
    )
    if archive:
        archive.log_subprocess("compute_spec_hash", result)
    assert result.returncode == 0, f"Failed to compute spec_hash:\n{result.stderr}"
    return result.stdout.strip()


def write_test_package(target: Path, package_code: str) -> None:
    """Write a test domain package and bind genesis.yml to it.

    Also writes active-workflow.json so workflow_version is populated
    in assessed events — the test sandbox must provide the same runtime
    contract a real workspace does.
    """
    pkg_dir = target / ".genesis" / "gtl_spec" / "packages"
    pkg_dir.mkdir(parents=True, exist_ok=True)
    # v1.0.0 installer no longer ships gtl_spec/ — test sandbox must provide __init__.py
    (target / ".genesis" / "gtl_spec" / "__init__.py").touch()
    (pkg_dir / "__init__.py").touch()
    (pkg_dir / "test_pkg.py").write_text(package_code)
    (target / ".genesis" / "genesis.yml").write_text(
        "package: gtl_spec.packages.test_pkg:package\n"
        "worker:  gtl_spec.packages.test_pkg:worker\n"
        "active_workflow: .ai-workspace/runtime/active-workflow.json\n"
    )
    # Active workflow metadata — mutable runtime state lives under .ai-workspace/
    # (.genesis/ is immutable installed runtime)
    runtime_dir = target / ".ai-workspace" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    (runtime_dir / "active-workflow.json").write_text(
        json.dumps({
            "workflow": "test_harness",
            "version": "1.0.0",
        }, indent=2),
        encoding="utf-8",
    )


# ── Manifest truth assertion ────────────────────────────────────────────────

def assert_manifest_truth(
    manifest: dict,
    *,
    edge_name: str,
    source_asset: str | list[str],
    target_asset: str,
    source_markov: dict[str, list[str]],
    target_markov: list[str],
    requirements: list[str],
    fp_evaluator: str,
    context_names: list[str],
    context_content_markers: dict[str, str],
) -> None:
    """Assert the 4-element manifest truth bar for any hop.

    process:     edge, evaluators, source/target
    intent:      requirements, markov conditions
    context:     full refs with resolved content
    destination: target asset, result path, work surface
    """
    # ── PROCESS ──
    assert manifest["edge"] == edge_name
    assert manifest["source_asset"] == source_asset
    assert manifest["target_asset"] == target_asset
    assert len(manifest["failing_evaluators"]) > 0, "Must list failing evaluators"
    for ev in manifest["failing_evaluators"]:
        assert "name" in ev and "category" in ev and "description" in ev
    failing_names = [ev["name"] for ev in manifest["failing_evaluators"]]
    assert fp_evaluator in failing_names, \
        f"F_P evaluator {fp_evaluator!r} must be in failing list, got {failing_names}"

    # ── INTENT ──
    assert manifest["requirements"] == requirements, \
        f"Manifest requirements mismatch: {manifest.get('requirements')}"
    assert manifest["target_markov"] == target_markov, \
        f"target_markov mismatch: {manifest.get('target_markov')}"
    assert manifest["source_markov"] == source_markov, \
        f"source_markov mismatch: {manifest.get('source_markov')}"

    # ── CONTEXT ──
    manifest_ctx_names = [c["name"] for c in manifest["contexts"]]
    for name in context_names:
        assert name in manifest_ctx_names, \
            f"Context {name!r} missing from manifest contexts: {manifest_ctx_names}"
    for ctx in manifest["contexts"]:
        assert "locator" in ctx and "digest" in ctx, \
            f"Context {ctx['name']!r} missing locator/digest"
        assert "content" in ctx, f"Context {ctx['name']!r} missing resolved content"
        if ctx["name"] in context_content_markers:
            marker = context_content_markers[ctx["name"]]
            assert marker in ctx["content"], (
                f"Context {ctx['name']!r} content does not contain expected marker "
                f"{marker!r} — got {ctx['content'][:100]}..."
            )

    # ── DESTINATION ──
    assert manifest["target_asset"] == target_asset
    assert manifest["result_path"], "result_path must be non-empty"
    assert Path(manifest["result_path"]).parent.exists(), \
        "result_path parent directory must exist"

    # ── PROMPT SECTIONS ──
    prompt = manifest["prompt"]
    for section in ("[PRECONDITIONS]", "[CURRENT STATE]", "[GAP]", "[OUTPUT CONTRACT]"):
        assert section in prompt, f"Prompt missing {section}"
    if context_names:
        assert "[CONTEXT]" in prompt, "Prompt must have CONTEXT section"


# ── Dispatch helper ──────────────────────────────────────────────────────────

def dispatch_fp_and_read_manifest(
    target: Path, artifact_path: str, artifact_content: str,
    archive: Optional[RunArchive] = None,
) -> dict:
    """Create F_D artifact, run iterate, return the manifest JSON."""
    art = target / artifact_path
    art.parent.mkdir(parents=True, exist_ok=True)
    art.write_text(artifact_content)

    result = run_genesis(target, "iterate", archive=archive)
    assert result.returncode == 0, (
        f"Expected exit 0 (F_P dispatch), got {result.returncode}:\n{result.stderr}"
    )
    data = json.loads(result.stdout)
    assert "fp_manifest_path" in data, "F_P dispatch must produce manifest path"

    manifest_path = Path(data["fp_manifest_path"])
    assert manifest_path.exists(), f"Manifest file not found at {manifest_path}"
    return json.loads(manifest_path.read_text())


# ── Full lifecycle helper ────────────────────────────────────────────────────

def run_full_lifecycle(
    target: Path,
    *,
    edge_name: str,
    fp_evaluator: str,
    artifact_path: str,
    artifact_content: str,
    archive: Optional[RunArchive] = None,
) -> None:
    """Run the full gap → F_D pass → iterate → F_P result → assess → converge lifecycle.

    Steps:
      1. gen_gaps → delta > 0 (pre-condition)
      2. Create artifact (F_D passes)
      3. gen_iterate → edge_started + fp_dispatched (F_P dispatch with manifest)
      4. F_P writes result JSON to result_path (simulated)
      5. genesis assess-result ingests result → emits assessed events
      6. gen_gaps → delta = 0, edge_converged certificate

    This exercises the real result_path protocol — no direct emit_event calls.
    """
    # 1. Before: gap exists
    before = run_genesis_json(target, "gaps", archive=archive)
    assert before["converged"] is False
    assert before["total_delta"] > 0

    # 2. F_D: create artifact so F_D evaluator passes
    art = target / artifact_path
    art.parent.mkdir(parents=True, exist_ok=True)
    art.write_text(artifact_content)

    # 3. Iterate: emits edge_started + fp_dispatched, produces manifest
    iter_result = run_genesis(target, "iterate", archive=archive)
    assert iter_result.returncode == 0, (
        f"gen iterate failed (exit {iter_result.returncode}):\n{iter_result.stderr}"
    )
    iter_data = json.loads(iter_result.stdout)
    assert "fp_manifest_path" in iter_data, (
        "iterate must produce fp_manifest_path for F_P dispatch"
    )

    # Extract manifest_id from the manifest path
    manifest_path = Path(iter_data["fp_manifest_path"])
    manifest_id = manifest_path.stem

    # 4. F_P: simulate agent writing result to result_path
    result_file = write_fp_result(
        target, manifest_id, edge_name,
        assessments=[{
            "evaluator": fp_evaluator,
            "result": "pass",
            "evidence": f"{artifact_path} created and satisfies requirements",
        }],
    )

    # 5. App: ingest result via assess-result command (the real protocol)
    r = assess_result(target, result_file, archive=archive)
    assert r.returncode == 0, (
        f"assess-result failed (exit {r.returncode}):\n{r.stderr}"
    )

    # 5. After: converged — gen_gaps emits edge_converged certificate
    after = run_genesis_json(target, "gaps", archive=archive)
    assert after["total_delta"] == 0, (
        f"Expected delta=0 after F_P acted, got delta={after['total_delta']}\n"
        f"Gaps: {json.dumps(after['gaps'], indent=2)}"
    )
    assert after["converged"] is True


# ── Judged lifecycle — real F_P semantic testing ─────────────────────────────

# Judge callable signature:
#   judge(artifact: Path, manifest: dict) -> list[dict]
# Each dict: {"evaluator": str, "result": "pass"|"fail", "evidence": str}
# The judge inspects the actual produced artifact against domain rules.
# It does NOT simulate — it really checks.

from typing import Callable

JudgeFn = Callable[[Path, dict], list[dict]]


@dataclass
class IterationResult:
    """One iterate → judge → assess cycle."""
    iteration: int
    artifact_path: str
    manifest_id: str
    assessments: list[dict]
    passed: bool
    gaps_after: dict


def run_judged_iteration(
    target: Path,
    *,
    artifact_path: str,
    artifact_content: str,
    edge_name: str,
    judge: JudgeFn,
    archive: Optional[RunArchive] = None,
    iteration: int = 1,
) -> IterationResult:
    """Single iterate → judge → assess cycle with a real deterministic judge.

    1. Write/overwrite artifact (simulates the F_P actor producing output)
    2. Run iterate to get the manifest
    3. Pass the artifact and manifest to the judge
    4. Write judge assessments via result_path protocol
    5. Ingest via assess-result
    6. Read gaps to see if converged

    Returns IterationResult with full detail for archive inspection.
    """
    label_prefix = f"iter-{iteration}"

    # 1. Write artifact
    art = target / artifact_path
    art.parent.mkdir(parents=True, exist_ok=True)
    art.write_text(artifact_content, encoding="utf-8")

    # 2. Iterate → manifest
    iter_result = run_genesis(
        target, "iterate", archive=archive,
        label=f"{label_prefix} iterate",
    )
    assert iter_result.returncode == 0, (
        f"iterate failed on iteration {iteration} (exit {iter_result.returncode}):\n"
        f"{iter_result.stderr}"
    )
    iter_data = json.loads(iter_result.stdout)
    assert "fp_manifest_path" in iter_data, (
        f"iterate must produce fp_manifest_path on iteration {iteration}"
    )
    manifest_path = Path(iter_data["fp_manifest_path"])
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest_id = manifest_path.stem

    # 3. Judge: real inspection of the artifact
    assessments = judge(art, manifest)
    assert len(assessments) > 0, "judge must return at least one assessment"
    for a in assessments:
        assert "evaluator" in a and "result" in a and "evidence" in a, (
            f"judge assessment missing required fields: {a}"
        )

    # 4. Write result via protocol
    result_file = write_fp_result(
        target, manifest_id, edge_name, assessments,
        actor=f"judge_iter{iteration}",
    )

    # 5. Ingest
    r = assess_result(target, result_file, archive=archive)
    assert r.returncode == 0, (
        f"assess-result failed on iteration {iteration}:\n{r.stderr}"
    )

    # 6. Gaps
    gaps = run_genesis_json(
        target, "gaps", archive=archive,
        label=f"{label_prefix} gaps",
    )
    passed = all(a["result"] == "pass" for a in assessments)

    return IterationResult(
        iteration=iteration,
        artifact_path=artifact_path,
        manifest_id=manifest_id,
        assessments=assessments,
        passed=passed,
        gaps_after=gaps,
    )


def run_judged_lifecycle(
    target: Path,
    *,
    edge_name: str,
    fp_evaluator: str,
    artifact_path: str,
    artifacts: list[str],
    judge: JudgeFn,
    archive: Optional[RunArchive] = None,
) -> list[IterationResult]:
    """Multi-iteration lifecycle with a real deterministic judge.

    Each entry in `artifacts` is the artifact content for one iteration.
    The judge inspects each produced artifact and returns real assessments.
    Earlier iterations should fail; the final iteration should converge.

    Returns the full list of IterationResults for archive/postmortem.
    """
    assert len(artifacts) >= 1, "need at least one artifact to iterate"

    # Pre-condition: gap exists
    before = run_genesis_json(target, "gaps", archive=archive, label="pre-check gaps")
    assert before["converged"] is False
    assert before["total_delta"] > 0

    # F_D: create initial artifact so F_D passes (use first artifact)
    art = target / artifact_path
    art.parent.mkdir(parents=True, exist_ok=True)
    art.write_text(artifacts[0], encoding="utf-8")

    results: list[IterationResult] = []
    for i, content in enumerate(artifacts, start=1):
        r = run_judged_iteration(
            target,
            artifact_path=artifact_path,
            artifact_content=content,
            edge_name=edge_name,
            judge=judge,
            archive=archive,
            iteration=i,
        )
        results.append(r)
        if r.gaps_after.get("converged"):
            break

    return results


# ── Event chain / postmortem assertions ──────────────────────────────────────

def assert_event_chain(
    target: Path,
    *,
    edge_name: str,
    fp_evaluator: str,
    package_name: str,
    artifact_path: str,
    expect_converged: bool = True,
) -> None:
    """Assert the full event audit trail is inspectable and explains the lifecycle.

    This is the postmortem proof — can the system explain what happened and why?

    Checks:
    1. Event ordering: genesis_installed → edge_started → fp_dispatched → assessed → edge_converged
    2. Provenance: every event has event_time, each carries correct data fields
    3. Inspectability: which edge ran, which evaluators, what manifest, why dispatch/convergence
    """
    events = read_events(target)
    types = [e["event_type"] for e in events]

    # ── 1. Required events exist ──
    assert "genesis_installed" in types, \
        "Audit trail must record kernel installation"
    assert "edge_started" in types, \
        "Audit trail must record edge start"

    # ── 2. Every event has event_time (provenance) ──
    for e in events:
        assert "event_time" in e, f"Event missing event_time: {e['event_type']}"
        assert "event_type" in e

    # ── 3. edge_started carries correct edge identity ──
    started = [e for e in events if e["event_type"] == "edge_started"]
    assert len(started) >= 1
    assert started[-1]["data"]["edge"] == edge_name, \
        f"edge_started must reference {edge_name}"
    assert "target" in started[-1]["data"], \
        "edge_started must carry target asset for project() filtering"

    # ── 4. F_P dispatch event carries provenance ──
    dispatched = [e for e in events if e["event_type"] == "fp_dispatched"]
    assert len(dispatched) >= 1, "F_P dispatch event must be recorded"
    fp_evt = dispatched[-1]
    assert fp_evt["data"]["edge"] == edge_name
    assert fp_evaluator in fp_evt["data"]["failing_evaluators"], \
        f"fp_dispatched must list {fp_evaluator} in failing_evaluators"
    assert "manifest_id" in fp_evt["data"], \
        "fp_dispatched must carry manifest_id for traceability"

    # ── 5. F_P assessment carries provenance ──
    assessed = [e for e in events if e["event_type"] == "assessed"]
    assert len(assessed) >= 1, "assessed event must exist"
    a = assessed[-1]
    assert a["data"]["edge"] == edge_name
    assert a["data"]["evaluator"] == fp_evaluator
    assert a["data"]["result"] == "pass"
    assert "actor" in a["data"], "assessed must record who acted"
    assert "evidence" in a["data"], "assessed must record evidence"
    assert "spec_hash" in a["data"], "assessed must carry spec_hash for provenance binding"

    # ── 6. Convergence certificate (if expected) ──
    if expect_converged:
        conv = [e for e in events if e["event_type"] == "edge_converged"]
        assert len(conv) >= 1, "edge_converged certificate must be emitted"
        cert = conv[-1]
        assert cert["data"]["edge"] == edge_name
        assert cert["data"]["delta"] == 0
        assert "certified_by" in cert["data"]

    # ── 7. Event ordering: started before dispatched before assessed ──
    started_idx = next(i for i, e in enumerate(events) if e["event_type"] == "edge_started")
    dispatched_idx = next(i for i, e in enumerate(events) if e["event_type"] == "fp_dispatched")
    assessed_idx = next(i for i, e in enumerate(events) if e["event_type"] == "assessed")
    assert started_idx < dispatched_idx, "edge_started must precede fp_dispatched"
    assert dispatched_idx < assessed_idx, "fp_dispatched must precede assessed"

    if expect_converged:
        converged_idx = next(i for i, e in enumerate(events) if e["event_type"] == "edge_converged")
        assert assessed_idx < converged_idx, "assessed must precede edge_converged"


def assert_failure_inspectable(
    target: Path, archive: Optional[RunArchive] = None,
) -> None:
    """Assert that gap failures produce inspectable diagnostic evidence.

    When the system has NOT converged, the gap report must contain enough
    information for a postmortem: which edge, which evaluators failed,
    what delta, and a summary.
    """
    data = run_genesis_json(target, "gaps", archive=archive)
    assert data["converged"] is False
    assert data["total_delta"] > 0

    for gap in data["gaps"]:
        assert "edge" in gap, "Gap must identify the edge"
        assert "delta" in gap, "Gap must report delta"
        assert "failing" in gap, "Gap must list failing evaluators"
        assert "delta_summary" in gap, "Gap must include delta_summary for diagnosis"
        assert len(gap["failing"]) > 0, "Failing list must be non-empty for unconverged edge"
        for name in gap["failing"]:
            assert isinstance(name, str) and len(name) > 0

    assert "scope" in data
    assert "package" in data["scope"]


# ══════════════════════════════════════════════════════════════════════════════
# Live F_P qualification — real LLM prompt sufficiency testing
# ══════════════════════════════════════════════════════════════════════════════

@dataclass
class LiveFpResult:
    """Result of a single live F_P invocation via subprocess → claude -p."""
    manifest: dict
    raw_response: str
    artifact_content: str
    model: str
    judge_assessments: list[dict]
    judge_passed: bool
    gaps_after: dict
    converged: bool


# Subprocess transport — single implementation in genesis.fp_dispatch (ADR-022).
# Tests and production share the same code path.
from genesis.fp_dispatch import has_agent, call_agent

# Re-export under legacy names for existing references
_has_mcp_transport = lambda: has_agent("claude")
_call_claude_code_mcp = lambda prompt, path: call_agent(prompt, path, agent="claude")


def invoke_live_fp(
    target: Path,
    *,
    artifact_path: str,
    edge_name: str,
    judge: JudgeFn,
    archive: Optional[RunArchive] = None,
    model: str = "sonnet",
) -> LiveFpResult:
    """Invoke a real LLM via subprocess using the F_P dispatch contract.

    Architecture: F_D → subprocess → F_P (ADR-022)
    Transport: claude -p with CLAUDE* env vars stripped

    This is the prompt sufficiency test:
      1. Run iterate to get the real manifest
      2. Send the manifest prompt via subprocess — nothing more
      3. Read the LLM's artifact output
      4. Run the deterministic judge as cross-check
      5. Ingest via assess-result protocol
      6. Check gaps for convergence

    The LLM receives ONLY what production guarantees.
    No hidden side channels. No extra instructions.
    """
    assert _has_mcp_transport(), (
        "Claude Code CLI required for live F_P qualification"
    )

    label_prefix = "live-fp"

    # 1. Iterate → manifest
    iter_result = run_genesis(target, "iterate", archive=archive, label=f"{label_prefix} iterate")
    assert iter_result.returncode == 0, (
        f"iterate failed (exit {iter_result.returncode}):\n{iter_result.stderr}"
    )
    iter_data = json.loads(iter_result.stdout)
    assert "fp_manifest_path" in iter_data, "iterate must produce fp_manifest_path"

    manifest_path = Path(iter_data["fp_manifest_path"])
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    # 2. Send exactly the manifest prompt via subprocess — nothing more
    prompt = manifest["prompt"]
    raw_response = _call_claude_code_mcp(prompt, str(target))

    # Archive the subprocess invocation
    if archive:
        archive._commands.append({
            "label": f"{label_prefix} claude -p",
            "args": ["claude", "-p", "--output-format", "text", "<prompt>"],
            "returncode": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

    # 3. Read the artifact — agent has tool access and may write it directly
    art = target / artifact_path
    art.parent.mkdir(parents=True, exist_ok=True)
    if art.exists() and art.stat().st_size > len("# placeholder\n"):
        # Actor wrote the artifact via tools — read what it produced
        artifact_content = art.read_text(encoding="utf-8")
    else:
        # Actor returned content as text response — write it as the artifact
        artifact_content = raw_response
        art.write_text(raw_response, encoding="utf-8")

    # 4. Run the deterministic judge
    assessments = judge(art, manifest)
    judge_passed = all(a["result"] == "pass" for a in assessments)

    # 5. Write judge assessments via result_path protocol
    manifest_id = manifest_path.stem
    result_file = write_fp_result(
        target, manifest_id, edge_name, assessments,
        actor=f"live_fp_{model}",
    )
    r = assess_result(target, result_file, archive=archive)
    assert r.returncode == 0, f"assess-result failed:\n{r.stderr}"

    # 6. Check gaps
    gaps = run_genesis_json(target, "gaps", archive=archive, label=f"{label_prefix} gaps")

    # Archive the live run evidence
    if archive:
        live_dir = archive.artifacts_dir / "live_fp"
        live_dir.mkdir(parents=True, exist_ok=True)
        (live_dir / "manifest.json").write_text(
            json.dumps(manifest, indent=2), encoding="utf-8")
        (live_dir / "prompt.txt").write_text(prompt, encoding="utf-8")
        (live_dir / "raw_response.txt").write_text(raw_response, encoding="utf-8")
        (live_dir / "artifact.txt").write_text(artifact_content, encoding="utf-8")
        (live_dir / "judge_verdict.json").write_text(json.dumps({
            "passed": judge_passed,
            "assessments": assessments,
            "model": model,
            "transport": "subprocess:claude-p",
        }, indent=2), encoding="utf-8")

    return LiveFpResult(
        manifest=manifest,
        raw_response=raw_response,
        artifact_content=artifact_content,
        model=model,
        judge_assessments=assessments,
        judge_passed=judge_passed,
        gaps_after=gaps,
        converged=gaps.get("converged", False),
    )
