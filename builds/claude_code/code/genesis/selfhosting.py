# Implements: REQ-R-ABG2-SELFHOSTING
# Implements: REQ-F-BOOTDOC-001
# Implements: REQ-F-BOOTDOC-002
# Implements: REQ-F-BOOTDOC-003
"""
genesis.selfhosting — Derived artifact governance.

Bootloader consistency checks, drift detection.

Re-exports from genesis.__main__ during Phase 4 migration.
Target: abg.selfhosting
"""
from genesis.__main__ import _check_bootloader_consistency
