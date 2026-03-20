# Implements: REQ-CORE-001
"""
abiogenesis_meta — The bootstrap package.

Defines the project that builds genesis_v1 using the bootstrap compiler
(genesis_sdlc). This package is the self-referential
surface: genesis building genesis.

The bootstrap sequence:
  Phase 0-1: Bootstrap compiler (v3.1.0) drives this package
  Phase 2-4: V1 engine progressively takes over
  Phase 5:   abiogenesis drives its own code↔unit_tests edge → self-hosting confirmed

When self-hosting is confirmed, this package is superseded by genesis_v1
operating on itself directly.
"""
from gtl_spec.packages.genesis_core import (
    genesis_v1,
    worker_claude_code,
    bootloader, v1_doctrine,
    claude_agent, human_gate,
    standard_gate,
    F_D, F_P, F_H,
)
from gtl.core import Asset, Edge, Evaluator, Job, Worker, Overlay, Context, Operator, consensus

# ── Bootstrap context ─────────────────────────────────────────────────────────

bootstrap_compiler = Context(
    name="bootstrap_compiler",
    locator="workspace://.genesis/genesis/__main__.py",
    digest="sha256:" + "0" * 64,   # PENDING — genesis_sdlc bootstrap compiler
)

# ── Bootstrap overlay ─────────────────────────────────────────────────────────
# Restricts genesis_v1 to the V1 done path only.
# No extensions. No additional edges. Pure restriction.

bootstrap = Overlay(
    name="bootstrap",
    on=genesis_v1,
    restrict_to=["intent", "requirements", "feature_decomp", "design", "code", "unit_tests"],
    approve=consensus(1, 1),
)

# ── Self-hosting evaluator ────────────────────────────────────────────────────
# The final gate: V1 engine runs its own code↔unit_tests edge.

eval_self_host = Evaluator(
    "self_hosting",
    F_D,
    "e2e: abiogenesis V1 engine drives its own code↔unit_tests convergence "
    "without bootstrap compiler in hot path",
)

# ── Self-hosting job ──────────────────────────────────────────────────────────
# This job is NOT in genesis_v1. It is the bootstrap completion gate.
# When this converges, the project is done.

self_host_check = Operator(
    "self_host_check", F_D,
    "exec://python -m genesis start --feature genesis_v1 --edge code↔unit_tests"
)

# Note: self_hosting_job is separate from genesis_v1.
# It is the meta-job — running the engine on itself.
