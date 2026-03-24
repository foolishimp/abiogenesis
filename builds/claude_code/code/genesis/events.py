# Implements: REQ-R-ABG2-EVENTS
"""
genesis.events — Append-only event substrate.

Re-exports from genesis.core during Phase 2 migration.
Target: abg.events
"""
from genesis.core import EventStream, emit, init_stream, init_snapshot
