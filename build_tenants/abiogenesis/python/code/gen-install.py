#!/usr/bin/env python3
# Implements: REQ-R-ABG3-INTERPRET
# Implements: REQ-R-ABG3-SELFHOSTING
"""
gen-install.py — Genesis installer

Installs the Genesis engine into a target project so it can be invoked as:
    PYTHONPATH=.genesis python -m genesis <command>

Usage:
    python gen-install.py --target /path/to/project
    python gen-install.py --target .                          # current directory
    python gen-install.py --target . --verify                 # verify only
    python gen-install.py --target . --platform java          # non-Python build

What it installs (kernel only — domain packages own everything else):
    .genesis/genesis/           ← the engine modules
    .genesis/gtl/               ← the GTL type system (vendored, self-contained)
    .genesis/docs/              ← installed builder/reference docs and standards
    specification/              ← project-owned constitutional surfaces
    build_tenants/              ← project-owned realization roots
    docs/                       ← project-owned supporting docs
    .genesis/genesis.yml        ← bootstrap config (no default binding)
    .ai-workspace/              ← initial runtime/audit workspace skeleton
    AGENTS.md                   ← GTL bootloader appended (if not already present)
    CLAUDE.md                   ← GTL bootloader appended (if not already present)

The .genesis/genesis/ and .genesis/gtl/ directories are always replaced (idempotent reinstall).
Domain installers own: package/worker binding in genesis.yml, build_tenants/ scaffolding,
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

VERSION = "3.0.0"

# Instruction-file markers for idempotent GTL bootloader injection
_GTL_BOOTLOADER_START = "<!-- GTL_BOOTLOADER_START -->"
_GTL_BOOTLOADER_END = "<!-- GTL_BOOTLOADER_END -->"

# ── Templates ─────────────────────────────────────────────────────────────────

# GTL type system modules (relative to abiogenesis project root / gtl/)
GTL_MODULES = [
    "__init__.py",
    "graph.py",
    "operator_model.py",
    "function_model.py",
    "algebra.py",
    "module_model.py",
    "work_model.py",
]

# GTL bootloader source — installed as a file under .genesis/docs/ and also
# injected into CLAUDE.md at install time.
# Domain packages own their own directory structure; the kernel does not
# scaffold gtl_spec/ in the target.
_BOOTLOADER_FILE = "gtl_spec/GTL_BOOTLOADER.md"

_INSTALL_DOC_FILES = [
    "README.md",
    "LLM_GTL_APP_BUILDER_GUIDE.md",
    "GTL_Technical_Guide.md",
    "USER_GUIDE.md",
]


def _source_root() -> Path:
    """Root of the abiogenesis project (four levels up from build_tenants/abiogenesis/python/code/)."""
    return Path(__file__).resolve().parent.parent.parent.parent.parent


def _code_root() -> Path:
    """build_tenants/abiogenesis/python/code/ — where engine, gtl, and gtl_spec source live."""
    return Path(__file__).resolve().parent


def _engine_source() -> Path:
    return _code_root() / "genesis"


def _gtl_source() -> Path:
    return _code_root() / "gtl"


def _docs_source() -> Path:
    return _source_root() / "docs"


def _standards_source() -> Path:
    # Install from the local checked-out methodology repository.
    # Public master: https://github.com/foolishimp/specification_methodology
    return _source_root().parent / "specification_methodology" / "specification" / "standards"


def _templates_source() -> Path:
    return _standards_source() / "templates"


def _engine_modules() -> list[str]:
    """Return the full installed engine surface from source truth."""
    return sorted(path.name for path in _engine_source().glob("*.py"))


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
        "docs_files": [],
        "standards_file_count": 0,
        "scaffolded_files": [],
        "config_file": None,
        "errors": [],
    }

    if verify_only:
        return _verify(target, result, platform=platform)

    # ── Install engine ────────────────────────────────────────────────────────
    genesis_dir = target / ".genesis" / "genesis"
    genesis_dir.mkdir(parents=True, exist_ok=True)

    engine_modules = _engine_modules()
    for module in engine_modules:
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
            f"# runtime_build: codex\n"
            f"# runtime_backend: codex_cli\n"
            f"# runtime_authority_ref: runtime://role-dispatch\n"
        )
        config_path.write_text(config_text, encoding="utf-8")
    result["config_file"] = ".genesis/genesis.yml"

    # ── Scaffold initial .ai-workspace/ structure ───────────────────────────
    _scaffold_ai_workspace(target)

    # ── Ensure .ai-workspace/runtime/ exists ────────────────────────────────
    runtime_dir = target / ".ai-workspace" / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)

    # ── Install docs and standards ──────────────────────────────────────────
    _install_docs(target, result)

    # ── Seed project-owned scaffold ────────────────────────────────────────
    _scaffold_project(target, result, slug=slug, platform=platform)

    # ── Append GTL bootloader to AGENTS.md / CLAUDE.md ──────────────────────
    result["agents_md"] = install_agents_md(target)
    result["claude_md"] = install_claude_md(target)
    if result["agents_md"] == "source_missing" or result["claude_md"] == "source_missing":
        result["errors"].append("GTL bootloader source not found: gtl_spec/GTL_BOOTLOADER.md")

    # ── Emit install event ────────────────────────────────────────────────────
    _emit_install_event(target, result)

    result["status"] = "installed" if not result["errors"] else "partial"
    return result


def _verify(target: Path, result: dict, platform: str = "python") -> dict:
    genesis_dir = target / ".genesis" / "genesis"
    missing_engine = []
    for module in _engine_modules():
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
    missing_docs = []
    docs_dir = target / ".genesis" / "docs"
    for filename in _INSTALL_DOC_FILES:
        if not (docs_dir / filename).exists():
            missing_docs.append(filename)
    if not (docs_dir / "GTL_BOOTLOADER.md").exists():
        missing_docs.append("GTL_BOOTLOADER.md")
    standards_present = (docs_dir / "standards" / "SPEC_METHOD.md").exists()
    agents_present = (target / "AGENTS.md").exists()
    claude_present = (target / "CLAUDE.md").exists()
    result["missing_docs"] = missing_docs
    result["standards_present"] = standards_present
    result["agents_present"] = agents_present
    result["claude_present"] = claude_present
    result["config_present"] = config_present
    result["agent_cli"] = agent_cli

    result["status"] = (
        "ok"
        if not missing_engine and not missing_gtl and not missing_docs and standards_present
        and agents_present and claude_present
        and config_present
        else "incomplete"
    )
    return result


def _scaffold_ai_workspace(target: Path) -> None:
    """Create the initial .ai-workspace/ skeleton without changing runtime behavior."""
    ai_ws = target / ".ai-workspace"
    directories = [
        ai_ws / "events",
        ai_ws / "features" / "active",
        ai_ws / "features" / "completed",
        ai_ws / "context",
        ai_ws / "reviews" / "pending",
        ai_ws / "reviews" / "proxy-log",
        ai_ws / "comments" / "claude",
        ai_ws / "agents",
    ]
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)


def _slug_family(slug: str) -> str:
    return slug.upper()


def _write_if_missing(path: Path, text: str, result: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        return
    path.write_text(text, encoding="utf-8")
    result["scaffolded_files"].append(str(path))


def _copy_file_if_missing(src: Path, dst: Path, result: dict) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        return
    shutil.copy2(src, dst)
    result["scaffolded_files"].append(str(dst))


def _template_text(rel_path: str) -> str:
    return (_templates_source() / rel_path).read_text(encoding="utf-8")


def _method_surface_text(text: str) -> str:
    text = text.replace(
        "project-owned method surfaces under `specification/standards/`",
        "installed method surfaces under `.genesis/docs/standards/`",
    )
    text = text.replace("`specification/standards/`", "`.genesis/docs/standards/`")
    text = text.replace(
        "`specification/standards/templates/",
        "`.genesis/docs/standards/templates/",
    )
    return text


def _root_readme_text(project_name: str, slug: str, platform: str) -> str:
    return (
        f"# {project_name}\n\n"
        "This is a GTL/ABG project scaffold.\n\n"
        "Methodology master: `https://github.com/foolishimp/specification_methodology`\n\n"
        "Start with these surfaces:\n\n"
        "- `AGENTS.md`\n"
        "- `CLAUDE.md`\n"
        "- `.genesis/docs/standards/SPEC_METHOD.md`\n"
        "- `specification/INTENT.md`\n"
        "- `specification/PRODUCT.md`\n"
        "- `specification/GOALS.md`\n"
        "- `specification/requirements/`\n"
        f"- `build_tenants/{slug}/{platform}/`\n"
        "- `.genesis/docs/LLM_GTL_APP_BUILDER_GUIDE.md`\n"
    )


def _tenant_registry_text(slug: str, platform: str) -> str:
    return (
        "# Tenant Registry\n\n"
        "`build_tenants/` is the project-owned realization root beneath the shared project specification.\n\n"
        "Use it for one-to-many independent implementations of the same constitutional `specification/`.\n\n"
        "This file is the canonical registry surface for the project's build tenants.\n\n"
        "The constitutional `specification/` surface is singleton project truth.\n\n"
        "`build_tenants/` is many-valued realization structure beneath that truth.\n\n"
        "## Structure\n\n"
        "- `common/` holds shared realization/design law adopted across more than one tenant.\n"
        "- `<family>/<variant>/` holds one concrete tenant realization.\n\n"
        "## Registry\n\n"
        "Suggested lifecycle states include:\n\n"
        "- `Planned`\n"
        "- `In Development`\n"
        "- `Paused`\n"
        "- `Released`\n"
        "- `Deprecated`\n\n"
        "| Entry | Kind | Path | Status | Notes |\n"
        "| --- | --- | --- | --- | --- |\n"
        "| `common` | shared root | `build_tenants/common/` | Active | Shared realization law across tenants |\n"
        f"| `{slug}/{platform}` | variant | `build_tenants/{slug}/{platform}/` | Planned | Starter tenant scaffold seeded by installer |\n"
    )


def _requirements_text(slug: str) -> str:
    family = _slug_family(slug)
    text = _template_text("requirements/STARTER_REQUIREMENTS_TEMPLATE.md")
    text = text.replace("REQ-PROJ-STARTER-*", f"REQ-{family}-STARTER-*")
    text = text.replace("REQ-PROJ-STARTER-001", f"REQ-{family}-STARTER-001")
    return text


def _edge_override_text(slug: str, platform: str) -> str:
    text = _template_text("build_tenants/variant/design/fp/edge-overrides/EDGE_OVERRIDE_TEMPLATE.json")
    return text.replace("build_tenants/<techlabel>/design/README.md", f"build_tenants/{slug}/{platform}/design/README.md")


def _tenant_code_readme_text(slug: str, platform: str) -> str:
    return (
        "# Tenant Code\n\n"
        "This folder holds example app-owned bootstrap code.\n\n"
        "It is not part of GTL or ABG core.\n\n"
        "Use it as a starting point for:\n\n"
        "- app bootstrap\n"
        "- app initialization\n"
        "- binding a published GTL `Module`\n"
        "- running graph-function work through ABG services\n"
    )


def _tenant_code_init_text() -> str:
    return (
        '"""Starter tenant code surface."""\n'
        "\n"
        "from .app_bootstrap import AppConfig, GraphFunctionApp, bootstrap, initialize, gaps, iterate, start\n"
    )


def _tenant_app_bootstrap_text() -> str:
    return '''"""Example app-owned bootstrap and initialization surface.

This file is a starting example. It is not part of GTL or ABG core.

Use it to keep app bootstrap and runtime binding explicit:

- bootstrap creates the app configuration boundary
- initialize binds a published GTL module to the ABG runtime
- gaps / iterate / start expose the engine through app-owned functions
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from gtl.module_model import Module

from genesis.binding import Worker
from genesis.events import EventStream
from genesis.install import workspace_bootstrap
from genesis.services import Scope, gen_gaps, gen_iterate, gen_start


@dataclass(frozen=True)
class AppConfig:
    workspace_root: Path
    runtime_config: dict[str, Any] = field(default_factory=dict)
    build: str | None = None


@dataclass
class GraphFunctionApp:
    config: AppConfig
    module: Module
    stream: EventStream
    worker: Worker | None = None

    def scope(self) -> Scope:
        return Scope(
            module=self.module,
            workspace_root=self.config.workspace_root,
            build=self.config.build,
            worker=self.worker,
            runtime_config=self.config.runtime_config,
        )


def bootstrap(
    *,
    workspace_root: str | Path = ".",
    runtime_config: dict[str, Any] | None = None,
    build: str | None = None,
) -> AppConfig:
    return AppConfig(
        workspace_root=Path(workspace_root).resolve(),
        runtime_config=dict(runtime_config or {}),
        build=build,
    )


def initialize(module: Module, config: AppConfig, *, worker: Worker | None = None) -> GraphFunctionApp:
    stream = workspace_bootstrap(config.workspace_root)
    return GraphFunctionApp(config=config, module=module, stream=stream, worker=worker)


def gaps(app: GraphFunctionApp) -> dict:
    return gen_gaps(app.scope(), app.stream)


def iterate(app: GraphFunctionApp) -> dict:
    return gen_iterate(app.scope(), app.stream)


def start(app: GraphFunctionApp, *, auto: bool = False) -> dict:
    return gen_start(app.scope(), app.stream, auto=auto)
'''


def _scaffold_project(target: Path, result: dict, *, slug: str, platform: str) -> None:
    project_name = target.name
    _write_if_missing(target / "README.md", _root_readme_text(project_name, slug, platform), result)
    _write_if_missing(
        target / "specification" / "INTENT.md",
        _method_surface_text(_template_text("INTENT_TEMPLATE.md")).replace("# Project Intent", f"# {project_name} Intent"),
        result,
    )
    _write_if_missing(
        target / "specification" / "PRODUCT.md",
        _method_surface_text(_template_text("PRODUCT_TEMPLATE.md")).replace("# Project Product", f"# {project_name} Product"),
        result,
    )
    _write_if_missing(
        target / "specification" / "GOALS.md",
        _method_surface_text(_template_text("GOALS_TEMPLATE.md")).replace("# Project Goals", f"# {project_name} Goals"),
        result,
    )
    _write_if_missing(
        target / "specification" / "requirements" / "README.md",
        _method_surface_text(_template_text("requirements/README_TEMPLATE.md")),
        result,
    )
    _write_if_missing(
        target / "specification" / "requirements" / "00-starter.md",
        _requirements_text(slug),
        result,
    )
    _write_if_missing(
        target / "docs" / "README.md",
        _template_text("docs/README_TEMPLATE.md"),
        result,
    )
    _write_if_missing(
        target / "build_tenants" / "TENANT_REGISTRY.md",
        _tenant_registry_text(slug, platform),
        result,
    )
    _write_if_missing(
        target / "build_tenants" / "common" / "README.md",
        _template_text("build_tenants/common/README_TEMPLATE.md"),
        result,
    )
    _write_if_missing(
        target / "build_tenants" / "common" / "design" / "README.md",
        _template_text("build_tenants/common/design/README_TEMPLATE.md"),
        result,
    )
    tenant_root = target / "build_tenants" / slug / platform
    _write_if_missing(
        tenant_root / "README.md",
        _template_text("build_tenants/variant/README_TEMPLATE.md"),
        result,
    )
    _write_if_missing(
        tenant_root / "design" / "README.md",
        _method_surface_text(_template_text("build_tenants/variant/design/README_TEMPLATE.md")),
        result,
    )
    _write_if_missing(
        tenant_root / "design" / "fp" / "README.md",
        _template_text("build_tenants/variant/design/fp/README_TEMPLATE.md"),
        result,
    )
    _write_if_missing(
        tenant_root / "design" / "fp" / "INTENT.md",
        _template_text("build_tenants/variant/design/fp/INTENT_TEMPLATE.md"),
        result,
    )
    _write_if_missing(
        tenant_root / "design" / "fp" / "edge-overrides" / "README.md",
        _template_text("build_tenants/variant/design/fp/edge-overrides/README_TEMPLATE.md"),
        result,
    )
    _write_if_missing(
        tenant_root / "design" / "fp" / "edge-overrides" / "EDGE_OVERRIDE_TEMPLATE.json",
        _edge_override_text(slug, platform),
        result,
    )
    _write_if_missing(
        tenant_root / "code" / "README.md",
        _tenant_code_readme_text(slug, platform),
        result,
    )
    _write_if_missing(
        tenant_root / "code" / "__init__.py",
        _tenant_code_init_text(),
        result,
    )
    _write_if_missing(
        tenant_root / "code" / "app_bootstrap.py",
        _tenant_app_bootstrap_text(),
        result,
    )


def _install_docs(target: Path, result: dict) -> None:
    docs_src = _docs_source()
    docs_dir = target / ".genesis" / "docs"
    docs_dir.mkdir(parents=True, exist_ok=True)

    for filename in _INSTALL_DOC_FILES:
        src = docs_src / filename
        dst = docs_dir / filename
        if not src.exists():
            result["errors"].append(f"Missing docs source: {src}")
            continue
        shutil.copy2(src, dst)
        result["docs_files"].append(filename)

    bootloader_src = _code_root() / _BOOTLOADER_FILE
    bootloader_dst = docs_dir / "GTL_BOOTLOADER.md"
    if not bootloader_src.exists():
        result["errors"].append(f"Missing GTL bootloader source: {bootloader_src}")
    else:
        shutil.copy2(bootloader_src, bootloader_dst)
        result["docs_files"].append("GTL_BOOTLOADER.md")

    standards_src = _standards_source()
    standards_dst = docs_dir / "standards"
    if not standards_src.exists():
        result["errors"].append(f"Missing standards source: {standards_src}")
        return

    shutil.copytree(standards_src, standards_dst, dirs_exist_ok=True)
    result["standards_file_count"] = sum(1 for path in standards_dst.rglob("*") if path.is_file())


def _install_instruction_bootloader(target: Path, filename: str) -> str:
    """Append the GTL bootloader to one instruction file between markers.

    Writes the current GTL bootloader section only.
    """
    bootloader_path = _code_root() / "gtl_spec" / "GTL_BOOTLOADER.md"
    if not bootloader_path.exists():
        return "source_missing"

    bootloader = bootloader_path.read_text(encoding="utf-8")
    section = f"{_GTL_BOOTLOADER_START}\n{bootloader}\n{_GTL_BOOTLOADER_END}"

    instruction_file = target / filename
    if instruction_file.exists():
        existing = instruction_file.read_text(encoding="utf-8")

        if _GTL_BOOTLOADER_START in existing:
            pattern = re.compile(
                re.escape(_GTL_BOOTLOADER_START) + r".*?" + re.escape(_GTL_BOOTLOADER_END),
                re.DOTALL,
            )
            updated = pattern.sub(section.rstrip(), existing)
            instruction_file.write_text(updated, encoding="utf-8")
            return "updated"
        else:
            with open(instruction_file, "w", encoding="utf-8") as f:
                f.write(existing.rstrip() + f"\n\n{section}\n")
            return "appended"
    else:
        instruction_file.write_text(section + "\n", encoding="utf-8")
        return "created"


def install_agents_md(target: Path) -> str:
    return _install_instruction_bootloader(target, "AGENTS.md")


def install_claude_md(target: Path) -> str:
    return _install_instruction_bootloader(target, "CLAUDE.md")


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
            "Build tenant variant name — used as the build_tenants/<family>/<variant>/ directory label. "
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
