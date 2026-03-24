# Implements: REQ-R-ABG2-TRANSPORT
"""
genesis.transport — Agent transport surface.

Subprocess dispatch with environment sanitization (ADR-022).

Re-exports from genesis.fp_dispatch during Phase 3 migration.
Target: abg.transport
"""
from genesis.fp_dispatch import (
    AgentResult,
    AgentTransportError,
    dispatch_agent,
    classify_failure,
    has_agent,
    call_agent,
)
