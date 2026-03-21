# Implements: REQ-F-CMD-001
# Implements: REQ-F-CMD-002
# Implements: REQ-F-CMD-003
# Implements: REQ-F-TAG-001
# Implements: REQ-F-TAG-002
# Implements: REQ-F-COV-001
# Implements: REQ-F-EVAL-001
# Implements: REQ-F-EVAL-004
# Implements: REQ-F-PROV-002
# Implements: REQ-F-BOOTDOC-002
"""CLI entry point for the Codex abiogenesis build."""

from __future__ import annotations

import argparse
import ast
import importlib
import json
import inspect
import re
import sys
from pathlib import Path

from gtl.core import F_D

from .commands import Scope, _read_workflow_version, gen_gaps, gen_iterate, gen_start
from .core import emit, workspace_bootstrap

REQ_RE = re.compile(r"REQ-[A-Z0-9-]+")


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="genesis")
    sub = parser.add_subparsers(dest="command", required=True)

    for name in ("gaps", "iterate", "start"):
        cmd = sub.add_parser(name)
        cmd.add_argument("--workspace", default=".")
        cmd.add_argument("--package")
        cmd.add_argument("--worker")
        cmd.add_argument("--feature")
        cmd.add_argument("--edge")
        if name == "start":
            cmd.add_argument("--auto", action="store_true")
            cmd.add_argument("--human-proxy", action="store_true")

    emit_cmd = sub.add_parser("emit-event")
    emit_cmd.add_argument("--workspace", default=".")
    emit_cmd.add_argument("--type", required=True)
    emit_cmd.add_argument("--data", required=True)

    tags = sub.add_parser("check-tags")
    tags.add_argument("--type", choices=("implements", "validates"), required=True)
    tags.add_argument("--path", required=True)

    req_cov = sub.add_parser("check-req-coverage")
    req_cov.add_argument("--spec", default="")
    req_cov.add_argument("--package", default="")
    req_cov.add_argument("--features", required=True)

    impl_cov = sub.add_parser("check-impl-coverage")
    impl_cov.add_argument("--package", required=True)
    impl_cov.add_argument("--path", required=True)

    val_cov = sub.add_parser("check-validates-coverage")
    val_cov.add_argument("--package", required=True)
    val_cov.add_argument("--path", required=True)

    boot = sub.add_parser("check-bootloader-consistency")
    boot.add_argument("--spec-module", required=True)
    boot.add_argument("--bootloader", required=True)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command == "check-tags":
        return _check_tags(args.type, args.path)
    if args.command == "check-req-coverage":
        return _check_req_coverage(args.spec, args.features, package_ref=args.package)
    if args.command == "check-impl-coverage":
        return _check_tag_coverage(args.package, args.path, "Implements")
    if args.command == "check-validates-coverage":
        return _check_tag_coverage(args.package, args.path, "Validates")
    if args.command == "check-bootloader-consistency":
        return _check_bootloader_consistency(args.spec_module, args.bootloader)
    if args.command == "emit-event":
        return _emit_event_cmd(args)

    if getattr(args, "human_proxy", False) and not getattr(args, "auto", False):
        print(json.dumps({"status": "error", "reason": "--human-proxy requires --auto"}, indent=2))
        return 1

    workspace = Path(args.workspace).resolve()
    stream = workspace_bootstrap(workspace)
    package, worker = _resolve_package_and_worker(args, workspace)
    scope = Scope(
        package=package,
        workspace_root=workspace,
        feature=args.feature,
        edge=args.edge,
        build="codex",
        worker=worker,
    )

    if args.command == "gaps":
        result = gen_gaps(scope, stream)
    elif args.command == "iterate":
        result = gen_iterate(scope, stream)
    else:
        result = gen_start(scope, stream, auto=args.auto)
        if getattr(args, "human_proxy", False):
            result["human_proxy"] = True

    print(json.dumps(result, indent=2))
    return _exit_code(result)


def _exit_code(result: dict) -> int:
    status = result.get("status")
    return {
        "converged": 0,
        "nothing_to_do": 0,
        "fp_dispatched": 2,
        "fh_gate_pending": 3,
        "fd_gap": 4,
        "max_iterations": 5,
    }.get(status, 1 if status == "error" else 0)


def _resolve_package_and_worker(args: argparse.Namespace, workspace: Path):
    _add_workspace_pythonpaths(workspace)
    config = _load_project_config(workspace)
    package_ref = args.package or config.get("package")
    worker_ref = args.worker or config.get("worker")
    if not package_ref or not worker_ref:
        raise RuntimeError("Package/worker not provided and .genesis/genesis.yml is incomplete")
    package = _import_symbol(package_ref)
    worker = _import_symbol(worker_ref)
    _validate_fd_commands(worker)
    return package, worker


def _load_project_config(workspace: Path) -> dict:
    path = workspace / ".genesis" / "genesis.yml"
    if not path.exists():
        return {}
    result: dict[str, object] = {}
    current_list: str | None = None
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("- ") and current_list:
            result.setdefault(current_list, [])
            assert isinstance(result[current_list], list)
            result[current_list].append(stripped[2:].strip())
            continue
        if ":" not in stripped:
            continue
        key, value = stripped.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value:
            result[key] = value
            current_list = None
        else:
            result[key] = []
            current_list = key
    return result


def _add_workspace_pythonpaths(workspace: Path) -> None:
    candidates = [workspace, workspace / ".genesis"]
    config = _load_project_config(workspace)
    for extra in config.get("pythonpath", []):
        candidates.append((workspace / extra).resolve())
    for candidate in reversed(candidates):
        path = str(candidate)
        if path not in sys.path:
            sys.path.insert(0, path)


def _import_symbol(ref: str):
    module_name, _, attr = ref.partition(":")
    if not module_name or not attr:
        raise RuntimeError(f"Invalid symbol reference: {ref}")
    try:
        module = importlib.import_module(module_name)
    except Exception as exc:
        raise RuntimeError(f"Cannot import {module_name}: {exc}") from exc
    try:
        return getattr(module, attr)
    except AttributeError as exc:
        raise RuntimeError(f"Module {module_name} has no symbol {attr}") from exc


def _validate_fd_commands(worker) -> None:
    for job in worker.can_execute:
        for evaluator in job.evaluators:
            if evaluator.category is not F_D:
                continue
            command = evaluator.command.strip()
            if not command:
                raise RuntimeError(f"F_D evaluator {evaluator.name} has empty command")
            lowered = command.lower()
            if any(
                phrase in lowered
                for phrase in (
                    "python -m genesis start",
                    "python -m genesis iterate",
                    "python -m genesis gaps",
                    "python -m genesis emit-event",
                )
            ):
                raise RuntimeError(f"F_D evaluator {evaluator.name} invokes lifecycle recursion")
            if "python -m pytest" in lowered and "not e2e" not in lowered and "--ignore" not in lowered:
                raise RuntimeError(
                    f"F_D evaluator {evaluator.name} runs pytest without constraining e2e scope"
                )


def _emit_event_cmd(args: argparse.Namespace) -> int:
    workspace = Path(args.workspace).resolve()
    workspace_bootstrap(workspace)
    try:
        payload = json.loads(args.data)
    except json.JSONDecodeError as exc:
        print(f"ERROR: invalid JSON payload: {exc}", file=sys.stderr)
        return 1
    errors = _validate_emit_payload(args.type, payload)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    workflow_version = _read_workflow_version(workspace)
    if workflow_version != "unknown":
        payload.setdefault("workflow_version", workflow_version)
    emit(args.type, payload)
    print(json.dumps({"status": "ok", "event_type": args.type}, indent=2))
    return 0


def _validate_emit_payload(event_type: str, data: dict) -> list[str]:
    errors: list[str] = []
    if event_type == "approved":
        for field in ("kind", "edge", "actor"):
            if field not in data:
                errors.append(f"approved requires '{field}' field")
        if data.get("actor") == "human-proxy" and "proxy_log" not in data:
            errors.append("approved with actor 'human-proxy' requires 'proxy_log' field")
    if event_type == "revoked":
        for field in ("kind", "edge", "actor", "reason"):
            if field not in data:
                errors.append(f"revoked requires '{field}' field")
    if event_type == "assessed":
        if "kind" not in data:
            errors.append("assessed requires 'kind' field")
        elif data["kind"] == "fp":
            for field in ("edge", "evaluator", "result", "spec_hash"):
                if field not in data:
                    errors.append(f"assessed{{kind: fp}} requires '{field}' field")
            if data.get("result") not in {"pass", "fail"}:
                errors.append("assessed{kind: fp} 'result' must be 'pass' or 'fail'")
        elif data["kind"] == "fh_review":
            for field in ("edge", "actor", "reason", "result"):
                if field not in data:
                    errors.append(f"assessed{{kind: fh_review}} requires '{field}' field")
            if data.get("result") != "reject":
                errors.append("assessed{kind: fh_review} 'result' must be 'reject'")
    return errors


def _check_tags(kind: str, path_str: str) -> int:
    path = Path(path_str)
    if not path.exists():
        print(json.dumps({"passes": False, "reason": f"path not found: {path}"}, indent=2))
        return 1
    marker = "Implements" if kind == "implements" else "Validates"
    untagged = []
    for file_path in sorted(path.rglob("*.py")):
        if file_path.name == "__init__.py":
            continue
        text = file_path.read_text(encoding="utf-8")
        if f"# {marker}:" not in text:
            untagged.append(str(file_path))
    result = {
        "passes": not untagged,
        "untagged": untagged,
        "untagged_count": len(untagged),
    }
    print(json.dumps(result, indent=2))
    return 0 if result["passes"] else 1


def _check_bootloader_consistency(spec_module: str, bootloader_path: str) -> int:
    try:
        module = importlib.import_module(spec_module)
    except Exception as exc:
        print(json.dumps({"error": f"cannot import {spec_module}: {exc}"}, indent=2))
        return 1

    all_defined = sorted(
        name
        for name, obj in inspect.getmembers(module)
        if inspect.isclass(obj) and obj.__module__ == spec_module and not name.startswith("_")
    )
    core_types = {
        "Asset",
        "Context",
        "Edge",
        "Evaluator",
        "F_D",
        "F_H",
        "F_P",
        "Job",
        "Operator",
        "Package",
        "Rule",
        "Worker",
    }
    exported = [name for name in all_defined if name in core_types]

    bootloader = Path(bootloader_path)
    if not bootloader.exists():
        print(json.dumps({"error": f"bootloader not found: {bootloader_path}"}, indent=2))
        return 1
    text = bootloader.read_text(encoding="utf-8")
    missing = [name for name in exported if name not in text]
    result = {
        "spec_module": spec_module,
        "bootloader": bootloader_path,
        "exported_types": exported,
        "exported_count": len(exported),
        "missing": missing,
        "passes": not missing,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["passes"] else 1


def _check_req_coverage(spec_path: str, features_dir: str, *, package_ref: str = "") -> int:
    feature_path = Path(features_dir)
    if not feature_path.exists():
        print(json.dumps({"passes": False, "reason": "features directory missing"}, indent=2))
        return 1
    if package_ref:
        package = _import_symbol(package_ref)
        spec_keys = list(package.requirements)
    else:
        spec_file = Path(spec_path)
        if not spec_file.exists():
            print(json.dumps({"passes": False, "reason": "spec file missing"}, indent=2))
            return 1
        spec_keys = sorted(set(REQ_RE.findall(spec_file.read_text(encoding="utf-8"))))
    covered = _feature_satisfies(feature_path)
    uncovered = [key for key in spec_keys if key not in covered]
    result = {
        "spec_keys": spec_keys,
        "covered_count": len(spec_keys) - len(uncovered),
        "total_count": len(spec_keys),
        "uncovered": uncovered,
        "passes": not uncovered,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["passes"] else 1


def _check_tag_coverage(package_ref: str, path_str: str, marker: str) -> int:
    package = _import_symbol(package_ref)
    root = Path(path_str)
    if not root.exists():
        print(json.dumps({"passes": False, "reason": "path missing"}, indent=2))
        return 1
    present: set[str] = set()
    tag_prefix = f"# {marker}:"
    for file_path in sorted(root.rglob("*.py")):
        text = file_path.read_text(encoding="utf-8")
        if tag_prefix in text:
            present.update(REQ_RE.findall(text))
    uncovered = [key for key in package.requirements if key not in present]
    result = {
        "marker": marker,
        "total_count": len(package.requirements),
        "uncovered": uncovered,
        "passes": not uncovered,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["passes"] else 1


def _feature_satisfies(features_dir: Path) -> set[str]:
    satisfies: set[str] = set()
    for path in sorted(features_dir.rglob("*.yml")):
        text = path.read_text(encoding="utf-8")
        inline = re.search(r"^\s*satisfies:\s*(\[.*\])\s*$", text, re.MULTILINE)
        if inline:
            try:
                values = ast.literal_eval(inline.group(1))
            except Exception:
                values = []
            satisfies.update(str(value) for value in values)
            continue
        collecting = False
        for line in text.splitlines():
            stripped = line.strip()
            if stripped.startswith("satisfies:"):
                collecting = True
                continue
            if collecting and stripped.startswith("- "):
                satisfies.add(stripped[2:].strip())
            elif collecting and stripped and not stripped.startswith("#"):
                collecting = False
    return satisfies


if __name__ == "__main__":
    raise SystemExit(main())
