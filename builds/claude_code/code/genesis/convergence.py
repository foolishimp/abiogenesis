# Implements: REQ-R-ABG2-CONVERGENCE
"""
genesis.convergence — Delta computation and convergence visibility.

Re-exports from genesis.schedule and genesis.bind during Phase 2 migration.
Target: abg.convergence
"""
from genesis.schedule import delta, parent_converged
from genesis.bind import render_delta
