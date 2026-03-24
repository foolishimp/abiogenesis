# Implements: REQ-R-ABG2-LINEAGE
"""
genesis.lineage — Work identity and parent/child lineage.

Re-exports from genesis.schedule during Phase 2 migration.
Target: abg.lineage
"""
from genesis.schedule import (
    WorkInstance,
    spawn,
    _discover_children as discover_children,
)
