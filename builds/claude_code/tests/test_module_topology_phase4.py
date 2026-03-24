# Validates: REQ-R-ABG2-INTERPRET
# Validates: REQ-F-CMD-001
# Validates: REQ-F-CMD-002
# Validates: REQ-F-CMD-003
# Validates: REQ-F-TAG-001
# Validates: REQ-F-BOOTDOC-001
# Validates: REQ-F-CORE-001
# Validates: REQ-R-ABG2-SELFHOSTING
"""
Phase 4 module topology tests — ABG application surface and mapping layer.

Asserts the target module structure from GTL_2_MODULE_DESIGN.md §3.3 (app)
and §3.4 (mapping). Same TDD approach: tests define the destination topology,
then modules are created to satisfy them.

Target modules:
  abg.services   — Scope, gen_gaps, gen_iterate, gen_start
  abg.cli        — _build_parser, _check_tags, traceability tooling
  abg.install    — workspace_bootstrap
  abg.selfhosting — bootloader consistency checks
"""
import importlib
import inspect
import pytest


# ── abg.services ─────────────────────────────────────────────────────────────

class TestServicesModule:
    """genesis.services: named app services (§3.3)."""

    def test_scope_importable(self):
        from genesis.services import Scope
        assert inspect.isclass(Scope)

    def test_gen_gaps_importable(self):
        from genesis.services import gen_gaps
        assert callable(gen_gaps)

    def test_gen_iterate_importable(self):
        from genesis.services import gen_iterate
        assert callable(gen_iterate)

    def test_gen_start_importable(self):
        from genesis.services import gen_start
        assert callable(gen_start)

    def test_active_work_keys_importable(self):
        """active_work_keys is lineage concern but currently in commands — re-exported here for V1 compat."""
        from genesis.services import active_work_keys
        assert callable(active_work_keys)

    def test_scope_is_same_as_commands_scope(self):
        """V1 backward compat: genesis.services.Scope IS genesis.commands.Scope."""
        from genesis.services import Scope
        from genesis.commands import Scope as CommandsScope
        assert Scope is CommandsScope

    def test_gen_gaps_is_same_as_commands(self):
        from genesis.services import gen_gaps
        from genesis.commands import gen_gaps as commands_gen_gaps
        assert gen_gaps is commands_gen_gaps

    def test_gen_iterate_is_same_as_commands(self):
        from genesis.services import gen_iterate
        from genesis.commands import gen_iterate as commands_gen_iterate
        assert gen_iterate is commands_gen_iterate

    def test_gen_start_is_same_as_commands(self):
        from genesis.services import gen_start
        from genesis.commands import gen_start as commands_gen_start
        assert gen_start is commands_gen_start


# ── abg.cli ──────────────────────────────────────────────────────────────────

class TestCliModule:
    """genesis.cli_adapter: CLI adapter (§3.3)."""

    def test_build_parser_importable(self):
        from genesis.cli_adapter import _build_parser
        assert callable(_build_parser)

    def test_check_tags_importable(self):
        from genesis.cli_adapter import _check_tags
        assert callable(_check_tags)

    def test_check_req_coverage_importable(self):
        from genesis.cli_adapter import _check_req_coverage
        assert callable(_check_req_coverage)

    def test_check_tag_coverage_importable(self):
        from genesis.cli_adapter import _check_tag_coverage
        assert callable(_check_tag_coverage)

    def test_main_importable(self):
        from genesis.cli_adapter import main
        assert callable(main)


# ── abg.install ──────────────────────────────────────────────────────────────

class TestInstallModule:
    """genesis.install: bootstrap and workspace scaffolding (§3.3)."""

    def test_workspace_bootstrap_importable(self):
        from genesis.install import workspace_bootstrap
        assert callable(workspace_bootstrap)

    def test_workspace_bootstrap_is_same_as_core(self):
        from genesis.install import workspace_bootstrap
        from genesis.core import workspace_bootstrap as core_bootstrap
        assert workspace_bootstrap is core_bootstrap


# ── abg.selfhosting ─────────────────────────────────────────────────────────

class TestSelfhostingModule:
    """genesis.selfhosting: derived artifact governance (§3.3)."""

    def test_check_bootloader_consistency_importable(self):
        from genesis.selfhosting import _check_bootloader_consistency
        assert callable(_check_bootloader_consistency)

    def test_check_bootloader_consistency_is_same_as_main(self):
        from genesis.selfhosting import _check_bootloader_consistency
        from genesis.__main__ import _check_bootloader_consistency as main_check
        assert _check_bootloader_consistency is main_check


# ── Dependency boundary checks ───────────────────────────────────────────────

class TestPhase4Boundaries:
    """§7.1 dependency rules for Phase 4 modules."""

    def test_services_does_not_import_cli(self):
        """abg.services must not import abg.cli."""
        src = inspect.getsource(importlib.import_module("genesis.services"))
        assert "genesis.cli_adapter" not in src
        assert "genesis.__main__" not in src

    def test_cli_does_not_import_kernel_modules(self):
        """abg.cli must not implement convergence, selection, or provenance logic."""
        src = inspect.getsource(importlib.import_module("genesis.cli_adapter"))
        # CLI re-exports from __main__, which is allowed to import services.
        # The boundary check is that cli_adapter itself doesn't import kernel modules directly.
        assert "genesis.schedule" not in src
        assert "genesis.bind" not in src

    def test_install_does_not_import_services(self):
        """abg.install must not depend on services layer."""
        src = inspect.getsource(importlib.import_module("genesis.install"))
        assert "genesis.commands" not in src
        assert "genesis.services" not in src

    def test_selfhosting_does_not_import_services(self):
        """abg.selfhosting must not depend on services layer."""
        src = inspect.getsource(importlib.import_module("genesis.selfhosting"))
        assert "genesis.commands" not in src
        assert "genesis.services" not in src


# ── Backward compatibility ───────────────────────────────────────────────────

class TestPhase4BackwardCompat:
    """Phase 4 modules must not break V1 import paths."""

    def test_commands_still_exports_scope(self):
        from genesis.commands import Scope
        assert inspect.isclass(Scope)

    def test_commands_still_exports_gen_gaps(self):
        from genesis.commands import gen_gaps
        assert callable(gen_gaps)

    def test_commands_still_exports_gen_iterate(self):
        from genesis.commands import gen_iterate
        assert callable(gen_iterate)

    def test_commands_still_exports_gen_start(self):
        from genesis.commands import gen_start
        assert callable(gen_start)

    def test_core_still_exports_workspace_bootstrap(self):
        from genesis.core import workspace_bootstrap
        assert callable(workspace_bootstrap)

    def test_main_still_exports_build_parser(self):
        from genesis.__main__ import _build_parser
        assert callable(_build_parser)

    def test_main_still_exports_main(self):
        from genesis.__main__ import main
        assert callable(main)
