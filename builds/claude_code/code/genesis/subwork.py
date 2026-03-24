# Implements: REQ-R-ABG2-LEAFTASK
"""
genesis.subwork — Bounded sub-work realization.

Pure kernel module — dispatch_leaf() returns (output, failure_class).
Event emission delegated to genesis.interpret (§4.4).

Re-exports LeafTask and validate_leaf_schema from genesis.schedule,
dispatch_leaf from genesis.fp_dispatch during Phase 3 migration.

Target: abg.subwork
"""
from genesis.schedule import LeafTask, validate_leaf_schema
from genesis.fp_dispatch import dispatch_leaf
