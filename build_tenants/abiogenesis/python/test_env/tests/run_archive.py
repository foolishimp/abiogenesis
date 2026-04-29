# Implements: REQ-P-QUAL
# Validates: REQ-P-QUAL
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


_TESTS_DIR = Path(__file__).resolve().parent
_TEST_ENV = _TESTS_DIR.parent
_RUNS_DIR = _TEST_ENV / "test_runs"


def _safe_name(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("_") or "unnamed"


def _git_commit() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=str(_TEST_ENV.parent.parent.parent),
            capture_output=True,
            text=True,
            timeout=5,
        )
    except Exception:
        return "unknown"
    if result.returncode != 0:
        return "unknown"
    return result.stdout.strip() or "unknown"


@dataclass
class RunArchive:
    run_dir: Path
    workspace: Path
    artifacts_dir: Path
    usecase_id: str
    test_name: str
    timestamp: str
    notes: list[dict[str, Any]] = field(default_factory=list)
    summary_overrides: dict[str, Any] = field(default_factory=dict)
    _stdout_path: Path = field(init=False)
    _stderr_path: Path = field(init=False)
    _finalized: bool = field(default=False, init=False)

    def __post_init__(self) -> None:
        self._stdout_path = self.run_dir / "stdout.log"
        self._stderr_path = self.run_dir / "stderr.log"
        self._stdout_path.touch()
        self._stderr_path.touch()

    def note(self, label: str, **data: Any) -> None:
        self.notes.append({
            "label": label,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            **data,
        })

    def log_subprocess(self, label: str, result: subprocess.CompletedProcess) -> None:
        args = result.args if isinstance(result.args, list) else [str(result.args)]
        self.note(
            "subprocess",
            subprocess_label=label,
            args=args,
            returncode=result.returncode,
        )
        with open(self._stdout_path, "a", encoding="utf-8") as handle:
            handle.write(f"--- {label} (exit {result.returncode}) ---\n")
            handle.write(result.stdout or "")
            handle.write("\n")
        with open(self._stderr_path, "a", encoding="utf-8") as handle:
            handle.write(f"--- {label} (exit {result.returncode}) ---\n")
            handle.write(result.stderr or "")
            handle.write("\n")

    def log_agent_result(self, label: str, result: Any) -> None:
        self.note(
            "agent_observation",
            observation_label=label,
            agent=getattr(result, "agent", None),
            returncode=getattr(result, "returncode", None),
            timed_out=getattr(result, "timed_out", None),
            failure_class=getattr(result, "failure_class", None),
            artifact_status=getattr(result, "artifact_status", None),
            artifact_failure_class=getattr(result, "artifact_failure_class", None),
            progress_source=getattr(result, "progress_source", None),
            supervision_mode=getattr(result, "supervision_mode", None),
        )
        with open(self._stdout_path, "a", encoding="utf-8") as handle:
            handle.write(
                f"--- {label} agent stdout "
                f"(exit {getattr(result, 'returncode', 'unknown')}) ---\n"
            )
            handle.write(getattr(result, "stdout", "") or "")
            handle.write("\n")
        with open(self._stderr_path, "a", encoding="utf-8") as handle:
            handle.write(
                f"--- {label} agent stderr "
                f"(exit {getattr(result, 'returncode', 'unknown')}) ---\n"
            )
            handle.write(getattr(result, "stderr", "") or "")
            handle.write("\n")

    def capture_text(self, name: str, text: str) -> Path:
        path = self.artifacts_dir / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def capture_json(self, name: str, payload: Any) -> Path:
        path = self.artifacts_dir / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return path

    def copy_file(self, source: Path, *, dest_name: str | None = None) -> Path | None:
        if not source.exists():
            return None
        destination = self.artifacts_dir / (dest_name or source.name)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        return destination

    def update_summary(self, **data: Any) -> None:
        self.summary_overrides.update(data)

    def finalize(self, *, test_passed: bool) -> None:
        if self._finalized:
            return
        self._finalized = True

        summary = self._build_summary()
        summary["test_passed"] = test_passed
        (self.run_dir / "summary.json").write_text(
            json.dumps(summary, indent=2),
            encoding="utf-8",
        )

        run_meta = {
            "usecase_id": self.usecase_id,
            "test_name": self.test_name,
            "timestamp": self.timestamp,
            "test_passed": test_passed,
            "source_commit": _git_commit(),
            "python": sys.executable,
            "notes": self.notes,
        }
        (self.run_dir / "run.json").write_text(
            json.dumps(run_meta, indent=2),
            encoding="utf-8",
        )

        self._copy_workspace_artifacts()

    def _build_summary(self) -> dict[str, Any]:
        summary: dict[str, Any] = {
            "usecase_id": self.usecase_id,
            "test_name": self.test_name,
            "workspace": str(self.workspace),
        }

        events_path = self.workspace / ".ai-workspace" / "events" / "events.jsonl"
        events: list[dict[str, Any]] = []
        if events_path.exists():
            for line in events_path.read_text(encoding="utf-8").splitlines():
                if line.strip():
                    events.append(json.loads(line))
        summary["total_events"] = len(events)
        summary["event_types"] = sorted({event["event_type"] for event in events})

        manifests_dir = self.workspace / ".ai-workspace" / "fp_manifests"
        results_dir = self.workspace / ".ai-workspace" / "fp_results"
        summary["manifest_files"] = sorted(f.name for f in manifests_dir.glob("*.json")) if manifests_dir.exists() else []
        summary["result_files"] = sorted(f.name for f in results_dir.glob("*.json")) if results_dir.exists() else []

        summary.update(self.summary_overrides)
        return summary

    def _copy_workspace_artifacts(self) -> None:
        manifests_dir = self.workspace / ".ai-workspace" / "fp_manifests"
        if manifests_dir.exists():
            for manifest in manifests_dir.glob("*.json"):
                self.copy_file(manifest, dest_name=f"manifest_{manifest.name}")

        results_dir = self.workspace / ".ai-workspace" / "fp_results"
        if results_dir.exists():
            for result in results_dir.glob("*.json"):
                self.copy_file(result, dest_name=f"result_{result.name}")

        events_path = self.workspace / ".ai-workspace" / "events" / "events.jsonl"
        if events_path.exists():
            self.copy_file(events_path, dest_name="events.jsonl")


def create_run_archive(usecase_id: str, test_name: str) -> RunArchive:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    run_name = f"{timestamp}_{_safe_name(test_name)}"
    run_dir = _RUNS_DIR / _safe_name(usecase_id) / run_name
    run_dir.mkdir(parents=True, exist_ok=True)
    workspace = run_dir / "workspace"
    workspace.mkdir(parents=True, exist_ok=True)
    artifacts_dir = run_dir / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    return RunArchive(
        run_dir=run_dir,
        workspace=workspace,
        artifacts_dir=artifacts_dir,
        usecase_id=_safe_name(usecase_id),
        test_name=test_name,
        timestamp=timestamp,
    )
