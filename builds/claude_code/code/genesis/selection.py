# Implements: REQ-R-ABG2-SELECTION-APPLICATION
"""
genesis.selection — Candidate enumeration and validation.

Pure kernel module — returns SelectionDecision values.
Event emission delegated to interpret.apply_selection()
(per GTL_2_MODULE_DESIGN §4.4).

No side effects, no events, no I/O. Pure functions over V2 types.
"""
from __future__ import annotations

from dataclasses import dataclass

from gtl.graph import GraphVector, Node
from gtl.function_model import GraphFunction
from gtl.module_model import Module


@dataclass(frozen=True)
class SelectionDecision:
    """Replayable record of a workflow selection."""
    contract_id: str
    work_key: str
    graph_function: str
    selected_by: str
    selection_mode: str
    rationale: str = ""


def _vector_source_names(vector: GraphVector) -> set[str]:
    """Extract source node names from a vector (handles tuple sources)."""
    if isinstance(vector.source, tuple):
        return {n.name for n in vector.source}
    elif vector.source is not None:
        return {vector.source.name}
    return set()


def enumerate_candidates(module: Module, vector_id: str) -> list[GraphFunction]:
    """
    Find GraphFunctions in the Module whose interface matches a vector.

    vector_id: the .id of the target vector (REQ-L-GTL2-IDENTITY-006).

    A candidate matches when:
    - candidate.inputs names ⊆ vector source names (it can consume the source)
    - vector target name ∈ candidate.outputs names (it can produce the target)

    Returns all matches. Empty list when no graph_functions are declared
    or none match the vector interface.
    """
    # Find the vector in the Module's graphs — by id (REQ-L-GTL2-IDENTITY-006)
    target_vec = None
    for graph in module.graphs:
        for vec in graph.vectors:
            if vec.id == vector_id:
                target_vec = vec
                break
        if target_vec is not None:
            break

    if target_vec is None:
        return []

    vec_source_names = _vector_source_names(target_vec)
    vec_target_name = target_vec.target.name if target_vec.target else ""

    candidates = []
    for gf in module.graph_functions:
        gf_input_names = {n.name for n in gf.inputs}
        gf_output_names = {n.name for n in gf.outputs}

        if gf_input_names <= vec_source_names and vec_target_name in gf_output_names:
            candidates.append(gf)

    return candidates


def validate_selection(
    decision: SelectionDecision,
    candidate: GraphFunction,
    vector: GraphVector,
) -> bool:
    """
    Validate that a SelectionDecision is interface-compatible.

    Checks:
    - decision.graph_function matches candidate.name
    - decision.contract_id matches vector.id (REQ-L-GTL2-IDENTITY-006)
    - candidate interface satisfies vector (same rules as enumerate_candidates)
    """
    if decision.graph_function != candidate.name:
        return False
    if decision.contract_id != vector.id:
        return False

    vec_source_names = _vector_source_names(vector)
    vec_target_name = vector.target.name if vector.target else ""

    gf_input_names = {n.name for n in candidate.inputs}
    gf_output_names = {n.name for n in candidate.outputs}

    return gf_input_names <= vec_source_names and vec_target_name in gf_output_names
