# Validates: REQ-P-SCENARIOS
from __future__ import annotations

from pathlib import Path
from typing import Any


def materialize_declared_obligation_ledger(
    workspace_root: Path,
    declaration: dict[str, Any] | Any,
    *,
    edge_name: str,
) -> dict[str, Any]:
    return {
        "scope": edge_name,
        "edge": edge_name,
        "workspace_root": str(workspace_root),
        "obligations": [
            {
                "id": "REQ-001",
                "statement": "Requirement REQ-001 is realized on this edge",
                "source_kind": "dynamic_test_adapter",
                "source_refs": ["spec://requirements/REQ-001"],
            },
            {
                "id": "REQ-002",
                "statement": "Requirement REQ-002 is realized on this edge",
                "source_kind": "dynamic_test_adapter",
                "source_refs": ["spec://requirements/REQ-002"],
            },
        ],
        "declaration": dict(declaration) if isinstance(declaration, dict) else {},
    }
