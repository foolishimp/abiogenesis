# Implements: REQ-R-ABG2-SELFHOSTING
# Implements: REQ-F-BOOTDOC-001
# Implements: REQ-F-BOOTDOC-002
# Implements: REQ-F-BOOTDOC-003
"""
selfhosting — Derived artifact governance.

Bootloader consistency checks, drift detection.
Extracted from genesis.__main__ as part of V2 module decomposition.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path


def _check_bootloader_consistency(spec_module: str, bootloader_path: str) -> int:
    """
    Verify that all public GTL type names defined in a spec module appear in the
    bootloader doc.
    """
    import importlib
    import inspect

    try:
        mod = importlib.import_module(spec_module)
    except ImportError as exc:
        print(json.dumps({"error": f"cannot import {spec_module}: {exc}"}),
              file=sys.stderr)
        return 1

    all_defined = sorted(
        name for name, obj in inspect.getmembers(mod)
        if inspect.isclass(obj)
        and obj.__module__ == spec_module
        and not name.startswith("_")
    )

    _CORE_TYPES = {
        "ContractRef", "Context", "Evaluator", "Graph", "GraphVector",
        "F_D", "F_H", "F_P",
        "GraphFunction", "Job", "Module", "Node", "Operator", "Role", "Rule",
    }
    exported = sorted(name for name in all_defined if name in _CORE_TYPES)

    boot_path = Path(bootloader_path)
    if not boot_path.exists():
        print(json.dumps({"error": f"bootloader not found: {bootloader_path}"}),
              file=sys.stderr)
        return 1

    boot_text = boot_path.read_text(encoding="utf-8")

    missing = [name for name in exported if name not in boot_text]

    result = {
        "spec_module": spec_module,
        "bootloader": bootloader_path,
        "exported_types": exported,
        "exported_count": len(exported),
        "missing": missing,
        "passes": len(missing) == 0,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["passes"] else 1
