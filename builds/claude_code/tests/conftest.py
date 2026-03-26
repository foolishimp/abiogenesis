# Validates: REQ-F-BOOT-001
"""
Pytest conftest — provides the run_archive fixture for persistent forensic archives.

Every scenario test receives a RunArchive that persists the full sandbox
workspace, subprocess logs, provenance, and artifacts at:
  tests/runs/<usecase_id>/<YYYYMMDDTHHMMSS_testname>/

The archive is finalized on test teardown regardless of pass/fail.
Failed runs are at least as valuable as passing runs.
"""
import pytest
from scenario_helpers import create_run_archive


def pytest_configure(config):
    config.addinivalue_line("markers", "integration: integration tests (sandbox + domain-blind + qualification)")
    config.addinivalue_line("markers", "live_fp: live F_P qualification tests (requires claude CLI — opt-in only)")
    config.addinivalue_line("markers", "e2e: end-to-end tests (sandbox lifecycle — opt-in only)")


def pytest_collection_modifyitems(config, items):
    """Defense-in-depth: skip live_fp tests unless explicitly selected.

    Primary exclusion is via addopts in pyproject.toml. This hook catches
    cases where someone overrides -m without excluding live_fp.
    These tests invoke real LLM subprocess calls with 10-minute timeouts.
    """
    marker_expr = config.getoption("-m", default="")
    if "live_fp" in marker_expr:
        return  # explicitly requested — don't skip
    skip = pytest.mark.skip(reason="live_fp tests are opt-in only — run with: pytest -m live_fp")
    for item in items:
        if "live_fp" in item.keywords:
            item.add_marker(skip)


@pytest.fixture
def run_archive(request):
    """Persistent run archive for postmortem investigation.

    Yields a RunArchive with:
      .workspace  — Path to the sandbox directory (install target)
      .run_dir    — Path to the full archive directory
      .artifacts_dir — Path for copied manifests/results
      .log_subprocess(label, result) — log command output

    On teardown: writes run.json, summary.json, copies artifacts.
    """
    # Derive usecase from module name: tests.test_scenario_brief_to_article → brief_to_article
    module_name = request.node.module.__name__
    usecase = module_name.split(".")[-1].replace("test_scenario_", "")
    test_name = request.node.name

    archive = create_run_archive(usecase, test_name)
    yield archive

    # Finalize — determine pass/fail from test outcome
    test_passed = not hasattr(request.node, "rep_call") or request.node.rep_call.passed
    archive.finalize(test_passed=test_passed)


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Store test outcome on the item for the run_archive fixture to read."""
    import pluggy
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)
