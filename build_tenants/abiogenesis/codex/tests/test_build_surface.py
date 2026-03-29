# Validates: REQ-F-BOOTDOC-001
# Validates: REQ-F-BOOTDOC-002
# Validates: REQ-F-GRAPH-001
from __future__ import annotations

from pathlib import Path

from genesis.__main__ import _check_bootloader_consistency, _validate_fd_commands
from gtl_spec.packages import abiogenesis as abiogenesis_pkg
from gtl_spec.packages import genesis_core as genesis_core_pkg


def test_codex_package_surface_uses_codex_paths():
    assert abiogenesis_pkg.worker.id == "codex"
    assert abiogenesis_pkg.this_spec.locator == "workspace://build_tenants/abiogenesis/codex/code/gtl_spec/packages/abiogenesis.py"
    assert abiogenesis_pkg.design_adrs.locator == "workspace://build_tenants/abiogenesis/codex/design/adrs/"
    assert any(job.edge.name == "design→bootloader_doc" for job in abiogenesis_pkg.worker.can_execute)
    assert abiogenesis_pkg.package.jobs
    assert abiogenesis_pkg.package.roles


def test_genesis_core_surface_uses_codex_paths():
    assert genesis_core_pkg.worker.id == "codex"
    assert genesis_core_pkg.genesis_core_spec.locator.endswith("build_tenants/abiogenesis/codex/code/gtl_spec/packages/genesis_core.py")


def test_check_bootloader_consistency_passes_for_codex_bootloader():
    bootloader = Path(__file__).resolve().parent.parent / "code" / "gtl_spec" / "GTL_BOOTLOADER.md"
    assert _check_bootloader_consistency("gtl.core", str(bootloader)) == 0


def test_codex_package_worker_passes_fd_command_validation():
    _validate_fd_commands(abiogenesis_pkg.worker)
