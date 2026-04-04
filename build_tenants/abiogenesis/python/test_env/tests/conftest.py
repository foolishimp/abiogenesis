# Validates: REQ-P-QUAL
"""
Pytest conftest for the current test suite.

Shared markers plus the persistent run archive fixture for sandbox-backed
scenario and qualification tests.
"""
import pytest

from run_archive import create_run_archive


def pytest_configure(config):
    config.addinivalue_line("markers", "integration: integration tests (sandbox + domain-blind + qualification)")
    config.addinivalue_line("markers", "live_fp: live F_P qualification tests (requires claude CLI)")
    config.addinivalue_line("markers", "e2e: end-to-end tests (sandbox lifecycle)")
    config.addinivalue_line("markers", "usecase_id(name): stable run-archive grouping for postmortem")


@pytest.fixture
def run_archive(request):
    marker = request.node.get_closest_marker("usecase_id")
    if marker and marker.args:
        usecase_id = str(marker.args[0])
    else:
        usecase_id = request.node.module.__name__.split(".")[-1].replace("test_", "")

    archive = create_run_archive(usecase_id, request.node.name)
    yield archive
    test_passed = not hasattr(request.node, "rep_call") or request.node.rep_call.passed
    archive.finalize(test_passed=test_passed)


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)
