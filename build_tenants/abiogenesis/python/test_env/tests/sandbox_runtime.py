# Validates: REQ-R-ABG2-INTERPRET
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from run_archive import RunArchive


_TESTS_DIR = Path(__file__).resolve().parent
_CLAUDE_BUILD = _TESTS_DIR.parent.parent
_INSTALLER = _CLAUDE_BUILD / "code" / "gen-install.py"


def install_real_sandbox(target: Path, *, archive: RunArchive | None = None) -> dict[str, Any]:
    result = subprocess.run(
        [sys.executable, str(_INSTALLER), "--target", str(target)],
        capture_output=True,
        text=True,
        timeout=120,
    )
    if archive is not None:
        archive.log_subprocess("gen-install.py", result)
    assert result.returncode == 0, (
        f"gen-install.py failed (exit {result.returncode})\n"
        f"stdout:\n{result.stdout}\n\nstderr:\n{result.stderr}"
    )
    payload = json.loads(result.stdout)
    if archive is not None:
        archive.capture_json("install_result.json", payload)
        archive.update_summary(
            installer_status=payload.get("status"),
            installer_target=payload.get("target"),
        )
    return payload
