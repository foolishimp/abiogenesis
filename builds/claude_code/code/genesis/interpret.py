# Implements: REQ-R-ABG2-INTERPRET
"""
genesis.interpret — Graph interpretation loop.

Owns iterate(), schedule(), zoom/substitution orchestration,
and event emission for delegated modules (selection, subwork).

Re-exports from genesis.schedule during Phase 3 migration.
Target: abg.interpret
"""
from genesis.schedule import (
    iterate,
    schedule,
    zoom,
    zoom_event,
    find_fragment_for_edge,
)
