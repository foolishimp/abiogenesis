# Implements: REQ-R-ABG2-SELECTION-APPLICATION
"""
genesis.selection — Candidate enumeration and validation.

Pure kernel module — returns SelectionDecision values.
Event emission delegated to genesis.interpret (§4.4).

Target: abg.selection
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SelectionDecision:
    """Replayable record of a workflow selection."""
    contract_id: str
    work_key: str
    graph_function: str
    selected_by: str
    selection_mode: str
    rationale: str = ""
