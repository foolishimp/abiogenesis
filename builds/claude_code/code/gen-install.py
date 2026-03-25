#!/usr/bin/env python3
# Implements: REQ-F-WKSP-001
# Implements: REQ-F-BOOT-001
# Implements: REQ-F-BOOT-002
"""
gen-install.py — Genesis V1.0 installer

Installs the Genesis engine into a target project so it can be invoked as:
    PYTHONPATH=.genesis python -m genesis <command>

Usage:
    python gen-install.py --target /path/to/project
    python gen-install.py --target .                          # current directory
    python gen-install.py --target . --verify                 # verify only
    python gen-install.py --target . --platform java          # non-Python build

What it installs (kernel only — domain packages own everything else):
    .genesis/genesis/           ← the engine modules (8 files including fp_dispatch)
    .genesis/gtl/               ← the GTL type system (vendored, self-contained)
    .genesis/genesis.yml        ← bootstrap config (no default binding)
    CLAUDE.md                   ← GTL bootloader appended (if not already present)

The .genesis/genesis/ and .genesis/gtl/ directories are always replaced (idempotent reinstall).
Domain installers own: package/worker binding in genesis.yml, builds/ scaffolding,
their own spec packages, and the runtime contract.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

VERSION = "1.0.3"

# CLAUDE.md markers for idempotent GTL bootloader injection
_GTL_BOOTLOADER_START = "<!-- GTL_BOOTLOADER_START -->"
_GTL_BOOTLOADER_END = "<!-- GTL_BOOTLOADER_END -->"

# ── Templates ─────────────────────────────────────────────────────────────────

# Modules that constitute the engine (relative to this file's directory)
ENGINE_MODULES = [
    "__init__.py",
    "__main__.py",
    "events.py",
    "transport.py",
    "projection.py",
    "correction.py",
    "provenance.py",
    "run.py",
    "lineage.py",
    "subwork.py",
    "binding.py",
    "convergence.py",
    "interpret.py",
    "selfhosting.py",
    "install.py",
    "services.py",
    "cli_adapter.py",
    "selection.py",
]

# GTL type system modules (relative to abiogenesis project root / gtl/)
GTL_MODULES = [
    "__init__.py",
    "core.py",
    "graph.py",
    "operator_model.py",
    "function_model.py",
    "algebra.py",
    "module_model.py",
]

# GTL bootloader source — injected into CLAUDE.md at install time.
# Not installed as a file — the bootloader lives in CLAUDE.md after install.
# Domain packages own their own directory structure; the kernel does not
# scaffold gtl_spec/ in the target.
_BOOTLOADER_FILE = "gtl_spec/GTL_BOOTLOADER.md"


def _source_root() -> Path:
    """Root of the abiogenesis project (three levels up from builds/claude_code/code/)."""
    return Path(__file__).resolve().parent.parent.parent.parent


def _code_root() -> Path:
    """builds/claude_code/code/ — where engine, gtl, and gtl_spec source live."""
    return Path(__file__).resolve().parent


def _engine_source() -> Path:
    return _code_root() / "genesis"


def _gtl_source() -> Path:
    return _code_root() / "gtl"


def install(target: Path, *, verify_only: bool = False,
            slug: str = "project_package",
            platform: str = "python") -> dict:
    target = target.resolve()
    source_root = _source_root()
    engine_src = _engine_source()

    result: dict = {
        "version": VERSION,
        "target": str(target),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "engine_files": [],
        "gtl_files": [],
        "config_file": None,
        "errors": [],
    }

    if verify_only:
        return _verify(target, result, platform=platform)

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

    # ── Install GTL type system ───────────────────────────────────────────────
    # Vendored into .genesis/gtl/ so PYTHONPATH=.genesis is fully self-contained.
    # This ensures the correct gtl version is used regardless of what is installed
    # in the environment's site-packages.
    gtl_src = _gtl_source()
    gtl_dir = target / ".genesis" / "gtl"
    if gtl_src.resolve() != gtl_dir.resolve():
        gtl_dir.mkdir(parents=True, exist_ok=True)
        for module in GTL_MODULES:
            src = gtl_src / module
            dst = gtl_dir / module
            if not src.exists():
                result["errors"].append(f"Missing GTL module: {src}")
                continue
            shutil.copy2(src, dst)
            result["gtl_files"].append(module)
    else:
        result["gtl_files"] = list(GTL_MODULES)

    # ── Write .genesis/genesis.yml (kernel default only) ──────────────────────
    # On first install: seed a minimal kernel default (genesis_core binding).
    # On reinstall: do not touch — domain installers update this file to set
    # domain_config, package, worker, pythonpath as needed.
    # ABG does not own package/worker/pythonpath — those are domain-installer artifacts.
    config_path = target / ".genesis" / "genesis.yml"

    if not config_path.exists():
        config_text = (
            f"# Genesis kernel default — written by gen-install.py v{VERSION}\n"
            f"#\n"
            f"# This file is the engine's bootstrap config. Domain installers\n"
            f"# set package, worker, and runtime_contract when they install.\n"
            f"# Without a domain package, the engine has no graph to iterate.\n"
            f"#\n"
            f"# runtime_contract: path/to/domain/genesis.yml\n"
            f"# package: your_domain.package:package\n"
            f"# worker:  your_domain.package:worker\n"
        )
        config_path.write_text(config_text, encoding="utf-8")
    result["config_file"] = ".genesis/genesis.yml"

    # ── Ensure .ai-workspace/runtime/ exists + migrate legacy provenance ────
    runtime_dir = target / ".ai-workspace" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    runtime_awj = runtime_dir / "active-workflow.json"
    legacy_awj = target / ".genesis" / "active-workflow.json"
    if not runtime_awj.exists() and legacy_awj.exists():
        # Migrate: legacy .genesis/ → mutable .ai-workspace/runtime/
        shutil.copy2(legacy_awj, runtime_awj)
        result.setdefault("migrations", []).append(
            "active-workflow.json: .genesis/ → .ai-workspace/runtime/"
        )

    # ── Append GTL bootloader to CLAUDE.md ───────────────────────────────────
    result["claude_md"] = install_claude_md(target)
    if result["claude_md"] == "source_missing":
        result["errors"].append("GTL bootloader source not found: gtl_spec/GTL_BOOTLOADER.md")

    # ── Emit install event ────────────────────────────────────────────────────
    _emit_install_event(target, result)

    result["status"] = "installed" if not result["errors"] else "partial"
    return result


def _verify(target: Path, result: dict, platform: str = "python") -> dict:
    genesis_dir = target / ".genesis" / "genesis"
    missing_engine = []
    for module in ENGINE_MODULES:
        if not (genesis_dir / module).exists():
            missing_engine.append(module)

    gtl_dir = target / ".genesis" / "gtl"
    missing_gtl = []
    for module in GTL_MODULES:
        if not (gtl_dir / module).exists():
            missing_gtl.append(module)

    config_present = (target / ".genesis" / "genesis.yml").exists()
    agent_cli = shutil.which("claude") is not None

    result["missing_engine"] = missing_engine
    result["missing_gtl"] = missing_gtl
    result["config_present"] = config_present
    result["agent_cli"] = agent_cli

    result["status"] = (
        "ok"
        if not missing_engine and not missing_gtl
        and config_present
        else "incomplete"
    )
    return result


def install_claude_md(target: Path) -> str:
    """Append the GTL bootloader to CLAUDE.md between markers.

    Each GTL Package appends its own bootloader to CLAUDE.md.
    abiogenesis appends the universal GTL formal system (sections I–XI).
    Domain packages (e.g. genesis_sdlc) append their own domain bootloader.

    If a legacy monolithic GENESIS_BOOTLOADER block is found, it is removed —
    the split bootloaders supersede it.
    """
    bootloader_path = _code_root() / "gtl_spec" / "GTL_BOOTLOADER.md"
    if not bootloader_path.exists():
        return "source_missing"

    bootloader = bootloader_path.read_text(encoding="utf-8")
    section = f"{_GTL_BOOTLOADER_START}\n{bootloader}\n{_GTL_BOOTLOADER_END}"

    # Legacy markers from the monolithic bootloader
    _LEGACY_START = "<!-- GENESIS_BOOTLOADER_START -->"
    _LEGACY_END = "<!-- GENESIS_BOOTLOADER_END -->"

    claude_md = target / "CLAUDE.md"
    if claude_md.exists():
        existing = claude_md.read_text(encoding="utf-8")

        # Remove legacy monolithic bootloader if present
        if _LEGACY_START in existing and _LEGACY_END in existing:
            legacy_pattern = re.compile(
                re.escape(_LEGACY_START) + r".*?" + re.escape(_LEGACY_END),
                re.DOTALL,
            )
            existing = legacy_pattern.sub("", existing)

        if _GTL_BOOTLOADER_START in existing:
            pattern = re.compile(
                re.escape(_GTL_BOOTLOADER_START) + r".*?" + re.escape(_GTL_BOOTLOADER_END),
                re.DOTALL,
            )
            updated = pattern.sub(section.rstrip(), existing)
            claude_md.write_text(updated, encoding="utf-8")
            return "updated"
        else:
            with open(claude_md, "w", encoding="utf-8") as f:
                f.write(existing.rstrip() + f"\n\n{section}\n")
            return "appended"
    else:
        claude_md.write_text(section + "\n", encoding="utf-8")
        return "created"


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
            "gtl_files": install_result["gtl_files"],
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
    parser.add_argument(
        "--project-slug", metavar="SLUG", default="project_package",
        help=(
            "Python identifier used as the starter spec module name and config key. "
            "Default: project_package. Must be a valid Python identifier."
        ),
    )
    parser.add_argument(
        "--platform", metavar="PLATFORM", default="python",
        help=(
            "Build platform name — used as the builds/<platform>/ directory name. "
            "Default: python. Examples: java, go, bedrock."
        ),
    )
    args = parser.parse_args()

    slug = args.project_slug
    if not slug.isidentifier():
        print(f"ERROR: --project-slug must be a valid Python identifier, got {slug!r}",
              file=sys.stderr)
        sys.exit(1)

    target = Path(args.target).resolve()
    if not target.is_dir():
        print(f"ERROR: target directory does not exist: {target}", file=sys.stderr)
        sys.exit(1)

    result = install(target, verify_only=args.verify, slug=slug, platform=args.platform)
    print(json.dumps(result, indent=2))
    sys.exit(0 if not result.get("errors") and result.get("status") != "incomplete" else 1)


if __name__ == "__main__":
    main()
