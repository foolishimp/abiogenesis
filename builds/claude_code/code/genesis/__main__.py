# Implements: REQ-F-CMD-001
# Implements: REQ-F-CMD-002
# Implements: REQ-F-CMD-003
"""
__main__ — CLI entry point for the genesis engine.

Usage:
  python -m genesis start  [--auto] [--feature F] [--edge E] [--workspace W]
  python -m genesis iterate [--feature F] [--edge E] [--workspace W]
  python -m genesis gaps    [--feature F] [--workspace W]
  python -m genesis check-tags --type implements|validates --path PATH

  gen start ...   (via project.scripts entry point)
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="genesis",
        description="Genesis engine — GTL-first AI SDLC V1",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # ── gen start ────────────────────────────────────────────────────────────
    p_start = sub.add_parser("start", help="Derive state → bind → iterate")
    p_start.add_argument("--auto", action="store_true",
                         help="Loop until converged or blocked by F_H gate")
    p_start.add_argument("--feature", metavar="F",
                         help="Scope to a specific feature vector ID")
    p_start.add_argument("--edge", metavar="E",
                         help="Override edge selection")
    p_start.add_argument("--workspace", metavar="W", default=".",
                         help="Workspace root (default: cwd)")

    # ── gen iterate ───────────────────────────────────────────────────────────
    p_iter = sub.add_parser("iterate", help="Bind one Job → iterate exactly once")
    p_iter.add_argument("--feature", metavar="F", help="Feature vector ID")
    p_iter.add_argument("--edge", metavar="E", help="Edge name")
    p_iter.add_argument("--workspace", metavar="W", default=".",
                        help="Workspace root (default: cwd)")

    # ── gen gaps ──────────────────────────────────────────────────────────────
    p_gaps = sub.add_parser("gaps", help="bind_fd over scope → delta summary")
    p_gaps.add_argument("--feature", metavar="F",
                        help="Scope to a specific feature vector ID")
    p_gaps.add_argument("--workspace", metavar="W", default=".",
                        help="Workspace root (default: cwd)")

    # ── check-tags ────────────────────────────────────────────────────────────
    p_tags = sub.add_parser("check-tags",
                            help="Verify Implements:/Validates: tags in source files")
    p_tags.add_argument("--type", choices=["implements", "validates"], required=True,
                        help="Tag type to check")
    p_tags.add_argument("--path", required=True,
                        help="Directory to scan")

    # ── check-req-coverage ────────────────────────────────────────────────────
    p_cov = sub.add_parser("check-req-coverage",
                           help="Verify every REQ-* key in spec appears in a feature vector")
    src = p_cov.add_mutually_exclusive_group(required=True)
    src.add_argument("--spec",
                     help="Path to spec file to grep for REQ-* keys (legacy)")
    src.add_argument("--package", metavar="MODULE:VAR",
                     help="Import path to a Package object, e.g. spec.packages.genesis_core:genesis_v1")
    p_cov.add_argument("--features", required=True,
                       help="Directory containing feature vector YAML files")

    return parser


def _check_tags(tag_type: str, scan_path: str) -> int:
    """
    Scan .py files for required tags.

    Implements: checks for '# Implements:'
    Validates:  checks for '# Validates:'

    Exits 0 if all files are tagged, 1 if any are untagged.
    Prints untagged file paths to stdout.
    """
    tag = "# Implements:" if tag_type == "implements" else "# Validates:"
    path = Path(scan_path)

    if not path.exists():
        print(f"ERROR: path does not exist: {path}", file=sys.stderr)
        return 1

    untagged = []
    for f in sorted(path.rglob("*.py")):
        if f.name == "__init__.py":
            continue
        if tag not in f.read_text(encoding="utf-8"):
            untagged.append(str(f))

    result = {
        "tag": tag,
        "path": str(path),
        "scanned": len([f for f in path.rglob("*.py") if f.name != "__init__.py"]),
        "untagged_count": len(untagged),
        "untagged": untagged,
        "passes": len(untagged) == 0,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["passes"] else 1


def _check_req_coverage(spec_path: str, features_dir: str,
                        package_ref: str | None = None) -> int:
    """
    Verify every REQ-* key in the spec appears in at least one feature vector.

    Two source modes:
      package_ref  — import MODULE:VAR, read Package.requirements (authoritative)
      spec_path    — grep the file for REQ-* tokens (legacy / fallback)

    Exits 0 if all keys covered, 1 if any gaps exist.
    Prints a JSON result to stdout.
    """
    import re

    features = Path(features_dir)
    if not features.exists():
        print(json.dumps({"error": f"features dir not found: {features_dir}"}), file=sys.stderr)
        return 1

    # ── Resolve spec_keys ────────────────────────────────────────────────────
    if package_ref:
        # Package-authoritative path: MODULE:VAR
        if ":" not in package_ref:
            print(json.dumps({"error": f"--package must be MODULE:VAR, got {package_ref!r}"}),
                  file=sys.stderr)
            return 1
        module_name, var_name = package_ref.rsplit(":", 1)
        try:
            import importlib
            mod = importlib.import_module(module_name)
        except ImportError as exc:
            print(json.dumps({"error": f"cannot import {module_name}: {exc}"}), file=sys.stderr)
            return 1
        pkg = getattr(mod, var_name, None)
        if pkg is None:
            print(json.dumps({"error": f"{var_name!r} not found in {module_name}"}),
                  file=sys.stderr)
            return 1
        spec_keys = set(getattr(pkg, "requirements", []))
        source = f"package:{package_ref}"
    else:
        # Grep-based legacy path
        spec = Path(spec_path)
        if not spec.exists():
            print(json.dumps({"error": f"spec not found: {spec_path}"}), file=sys.stderr)
            return 1
        spec_text = spec.read_text(encoding="utf-8")
        spec_keys = set(re.findall(r"REQ-[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*", spec_text))
        source = str(spec_path)

    # ── Scan feature vectors for covered keys ────────────────────────────────
    covered_keys: set[str] = set()
    for yml in features.rglob("*.yml"):
        text = yml.read_text(encoding="utf-8")
        covered_keys.update(re.findall(r"REQ-[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*", text))

    uncovered = sorted(spec_keys - covered_keys)
    result = {
        "spec": source,
        "features_dir": features_dir,
        "spec_keys": sorted(spec_keys),
        "covered_count": len(spec_keys) - len(uncovered),
        "total_count": len(spec_keys),
        "uncovered": uncovered,
        "passes": len(uncovered) == 0,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["passes"] else 1


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    # Lightweight commands — no engine stack needed
    if args.command == "check-tags":
        sys.exit(_check_tags(args.type, args.path))
    if args.command == "check-req-coverage":
        sys.exit(_check_req_coverage(
            spec_path=args.spec or "",
            features_dir=args.features,
            package_ref=getattr(args, "package", None),
        ))

    # All other commands need the engine
    workspace = Path(getattr(args, "workspace", ".")).resolve()

    # Ensure spec is importable from workspace root
    if str(workspace) not in sys.path:
        sys.path.insert(0, str(workspace))

    from .core import workspace_bootstrap
    stream = workspace_bootstrap(workspace)

    from .commands import Scope, gen_gaps, gen_iterate, gen_start

    try:
        from spec.packages.genesis_core import genesis_v1 as package  # type: ignore[import]
    except ImportError as exc:
        print(
            f"ERROR: cannot import spec.packages.genesis_core from {workspace}.\n"
            f"Run: cd {workspace} && python spec/packages/genesis_core.py\n"
            f"Original: {exc}",
            file=sys.stderr,
        )
        sys.exit(1)

    scope = Scope(
        package=package,
        workspace_root=workspace,
        feature=getattr(args, "feature", None),
        edge=getattr(args, "edge", None),
    )

    if args.command == "start":
        result = gen_start(scope, stream, auto=getattr(args, "auto", False))
    elif args.command == "iterate":
        result = gen_iterate(scope, stream)
    elif args.command == "gaps":
        result = gen_gaps(scope, stream)
    else:
        parser.print_help()
        sys.exit(1)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
