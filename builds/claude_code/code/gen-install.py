#!/usr/bin/env python3
# Implements: REQ-F-WKSP-001
"""
gen-install.py — Genesis V1.0 installer

Installs the Genesis engine into a target project so it can be invoked as:
    PYTHONPATH=.genesis python -m genesis <command>

Usage:
    python gen-install.py --target /path/to/project
    python gen-install.py --target .                 # current directory
    python gen-install.py --target . --verify        # verify only

What it installs:
    .genesis/genesis/       ← the 6-module engine + __init__ + __main__
    spec/                   ← the GTL spec package (genesis_core.py + __init__)
    spec/GENESIS_BOOTLOADER.md  ← constraint context

The spec/ directory is copied only if it does not already exist in the target.
The .genesis/genesis/ directory is always replaced (idempotent reinstall).
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

VERSION = "1.0.0"

# Modules that constitute the engine (relative to this file's directory)
ENGINE_MODULES = [
    "__init__.py",
    "__main__.py",
    "core.py",
    "bind.py",
    "manifest.py",
    "schedule.py",
    "commands.py",
]

# Spec files to install (relative to project root — two levels up from this file)
SPEC_FILES = [
    "spec/__init__.py",
    "spec/packages/__init__.py",
    "spec/packages/genesis_core.py",
    "spec/GENESIS_BOOTLOADER.md",
]


def _source_root() -> Path:
    """Root of the abiogenesis project (two levels up from builds/claude_code/code/)."""
    return Path(__file__).resolve().parent.parent.parent.parent


def _engine_source() -> Path:
    return Path(__file__).resolve().parent / "genesis"


def install(target: Path, *, verify_only: bool = False) -> dict:
    target = target.resolve()
    source_root = _source_root()
    engine_src = _engine_source()

    result: dict = {
        "version": VERSION,
        "target": str(target),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "engine_files": [],
        "spec_files": [],
        "errors": [],
    }

    if verify_only:
        return _verify(target, result)

    # ── Install engine ────────────────────────────────────────────────────────
    genesis_dir = target / ".genesis" / "genesis"
    genesis_dir.mkdir(parents=True, exist_ok=True)

    for module in ENGINE_MODULES:
        src = engine_src / module
        dst = genesis_dir / module
        if not src.exists():
            result["errors"].append(f"Missing engine module: {src}")
            continue
        shutil.copy2(src, dst)
        result["engine_files"].append(module)

    # ── Install spec ──────────────────────────────────────────────────────────
    for rel in SPEC_FILES:
        src = source_root / rel
        dst = target / rel
        if not src.exists():
            result["errors"].append(f"Missing spec file: {src}")
            continue
        if src.resolve() == dst.resolve():
            # Installing into the source project itself — spec already in place
            result["spec_files"].append(rel)
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        result["spec_files"].append(rel)

    # ── Emit install event ────────────────────────────────────────────────────
    _emit_install_event(target, result)

    result["status"] = "installed" if not result["errors"] else "partial"
    return result


def _verify(target: Path, result: dict) -> dict:
    genesis_dir = target / ".genesis" / "genesis"
    missing_engine = []
    for module in ENGINE_MODULES:
        if not (genesis_dir / module).exists():
            missing_engine.append(module)

    missing_spec = []
    for rel in SPEC_FILES:
        if not (target / rel).exists():
            missing_spec.append(rel)

    result["missing_engine"] = missing_engine
    result["missing_spec"] = missing_spec
    result["status"] = "ok" if not missing_engine and not missing_spec else "incomplete"
    return result


def _emit_install_event(target: Path, install_result: dict) -> None:
    """Append genesis_installed event to .ai-workspace/events/events.jsonl."""
    events_dir = target / ".ai-workspace" / "events"
    events_dir.mkdir(parents=True, exist_ok=True)
    events_file = events_dir / "events.jsonl"

    event = {
        "event_type": "genesis_installed",
        "event_time": install_result["timestamp"],
        "data": {
            "version": VERSION,
            "engine_files": install_result["engine_files"],
            "spec_files": install_result["spec_files"],
            "target": install_result["target"],
        },
    }
    with events_file.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="gen-install",
        description=f"Genesis V{VERSION} installer",
    )
    parser.add_argument(
        "--target", metavar="DIR", default=".",
        help="Target project directory (default: cwd)",
    )
    parser.add_argument(
        "--verify", action="store_true",
        help="Verify installation only — do not install",
    )
    args = parser.parse_args()

    target = Path(args.target).resolve()
    if not target.is_dir():
        print(f"ERROR: target directory does not exist: {target}", file=sys.stderr)
        sys.exit(1)

    result = install(target, verify_only=args.verify)
    print(json.dumps(result, indent=2))
    sys.exit(0 if not result.get("errors") and result.get("status") != "incomplete" else 1)


if __name__ == "__main__":
    main()
