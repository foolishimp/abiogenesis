# Implements: REQ-F-CORE-001
"""
genesis.install — Bootstrap and workspace scaffolding.

Workspace initialization, event stream creation, directory structure.

Re-exports from genesis.core during Phase 4 migration.
Target: abg.install
"""
from genesis.core import workspace_bootstrap
