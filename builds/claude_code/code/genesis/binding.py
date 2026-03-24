# Implements: REQ-R-ABG2-INTERPRET
# Implements: REQ-R-ABG2-JOB-WORKER
"""
genesis.binding — Deterministic precomputation and capability model.

Re-exports from genesis.bind, genesis.manifest, genesis.core, and
gtl.core during Phase 2 migration.
Target: abg.binding
"""
from genesis.bind import (
    bind_fd, bind_fp, bind_fh,
    bind_fp_certified, run_fd_evaluator,
    select_relevant_contexts,
)
from genesis.manifest import PrecomputedManifest, BoundJob
from genesis.core import ContextResolver
from gtl.core import Job, Worker
