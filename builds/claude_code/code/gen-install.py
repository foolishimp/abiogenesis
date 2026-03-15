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

# ── Templates ─────────────────────────────────────────────────────────────────

_CONFIG_TEMPLATE = """\
# Genesis project config — written by gen-install.py
# Override per-invocation with: --package MODULE:VAR --worker MODULE:VAR
package: spec.packages.{slug}:package
worker:  spec.packages.{slug}:worker
"""

_STARTER_PACKAGE_TEMPLATE = '''\
# Implements: REQ-F-PKG-001
"""
{slug} — project package for genesis.

Edit assets, edges, and evaluators to match your domain.
Run: PYTHONPATH=.genesis python -m genesis gaps --workspace .
"""
from gtl.core import (
    Asset, Edge, Evaluator, Job, Operator,
    Package, Worker, F_D, F_P,
)

# ── Assets ────────────────────────────────────────────────────────────────────
spec   = Asset(name="spec",   id_format="SPEC-{{SEQ}}")
output = Asset(name="output", id_format="OUT-{{SEQ}}",  lineage=[spec])

# ── Edge ──────────────────────────────────────────────────────────────────────
op = Operator("agent", F_P, "agent://claude/genesis")
edge = Edge(name="spec→output", source=spec, target=output, using=[op])

eval_ready = Evaluator(
    "workspace_ready", F_D,
    "workspace is initialised",
    command="python -c \\'import sys; sys.exit(0)\\'",
)
eval_complete = Evaluator(
    "output_complete", F_P,
    "agent: output satisfies spec",
)
job = Job(edge=edge, evaluators=[eval_ready, eval_complete])

# ── Package + Worker ──────────────────────────────────────────────────────────
package = Package(
    name="{slug}",
    assets=[spec, output],
    edges=[edge],
    operators=[op],
)
worker = Worker(id="claude_code", can_execute=[job])

if __name__ == "__main__":
    import json
    print(json.dumps({{
        "package": package.name,
        "assets": [a.name for a in package.assets],
        "edges": [e.name for e in package.edges],
        "worker": worker.id,
    }}, indent=2))
'''

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


def install(target: Path, *, verify_only: bool = False,
            slug: str = "project_package") -> dict:
    target = target.resolve()
    source_root = _source_root()
    engine_src = _engine_source()

    result: dict = {
        "version": VERSION,
        "target": str(target),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "engine_files": [],
        "spec_files": [],
        "config_file": None,
        "starter_spec": None,
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

    # ── Write .genesis/genesis.yml ────────────────────────────────────────────
    # Always written (idempotent reinstall of engine config).
    # genesis.yml is metadata only — it points to the Package/Worker.
    # The canonical spec lives in spec/packages/*.py (not overwritten here).
    config_path = target / ".genesis" / "genesis.yml"
    config_path.write_text(_CONFIG_TEMPLATE.format(slug=slug), encoding="utf-8")
    result["config_file"] = ".genesis/genesis.yml"

    # ── Write starter spec ────────────────────────────────────────────────────
    # Only written if the file does not already exist — never overwrites user edits.
    spec_pkg_dir = target / "spec" / "packages"
    spec_pkg_dir.mkdir(parents=True, exist_ok=True)
    (target / "spec" / "__init__.py").touch()
    (target / "spec" / "packages" / "__init__.py").touch()
    starter_path = spec_pkg_dir / f"{slug}.py"
    if not starter_path.exists():
        starter_path.write_text(
            _STARTER_PACKAGE_TEMPLATE.format(slug=slug), encoding="utf-8"
        )
        result["starter_spec"] = f"spec/packages/{slug}.py"

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

    config_present = (target / ".genesis" / "genesis.yml").exists()

    result["missing_engine"] = missing_engine
    result["missing_spec"] = missing_spec
    result["config_present"] = config_present
    result["status"] = (
        "ok" if not missing_engine and not missing_spec and config_present
        else "incomplete"
    )
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
    parser.add_argument(
        "--project-slug", metavar="SLUG", default="project_package",
        help=(
            "Python identifier used as the starter spec module name and config key. "
            "Default: project_package. Must be a valid Python identifier."
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

    result = install(target, verify_only=args.verify, slug=slug)
    print(json.dumps(result, indent=2))
    sys.exit(0 if not result.get("errors") and result.get("status") != "incomplete" else 1)


if __name__ == "__main__":
    main()
