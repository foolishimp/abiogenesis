# Implements: REQ-F-CMD-001
# Implements: REQ-F-TAG-001
# Implements: REQ-F-TAG-002
# Implements: REQ-F-COV-001
"""
genesis.cli_adapter — CLI adapter.

Parser construction, command wiring, traceability checks.
Named cli_adapter to avoid collision with stdlib cli modules.

Re-exports from genesis.__main__ during Phase 4 migration.
Target: abg.cli
"""
from genesis.__main__ import (
    _build_parser,
    _check_tags,
    _check_req_coverage,
    _check_tag_coverage,
    main,
)
