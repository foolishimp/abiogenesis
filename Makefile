# ── Test Lanes ────────────────────────────────────────────────────────────────
#
# Default `make test` runs the fast lane (unit + scenario + integration).
# Expensive lanes (live_fp, e2e) are opt-in only.
#
# pyproject.toml addopts: -m 'not live_fp and not e2e'
# This means `pytest` alone already excludes expensive tests.
# The Makefile provides named lanes for clarity and CI integration.

PYTHONPATH_SET = PYTHONPATH=builds/claude_code/code:builds/claude_code/tests

# ── Fast lane (default) ─────────────────────────────────────────────────────
# Unit, scenario, integration, contract, property tests.
# No real LLM calls, no sandbox installs. ~60s.
.PHONY: test
test:
	$(PYTHONPATH_SET) python -m pytest -q --tb=short

# ── E2E lane ─────────────────────────────────────────────────────────────────
# Sandbox lifecycle tests (install, iterate, converge).
# No LLM calls but creates real sandbox directories.
.PHONY: test-e2e
test-e2e:
	$(PYTHONPATH_SET) python -m pytest -m e2e -q --tb=short

# ── Live F_P lane ────────────────────────────────────────────────────────────
# Real LLM qualification tests. Requires claude CLI on PATH.
# 22 tests × ~2min each ≈ 45min. Run before release.
.PHONY: test-live-fp
test-live-fp:
	$(PYTHONPATH_SET) python -m pytest -m live_fp -v --tb=short --timeout=600

# ── Full suite ───────────────────────────────────────────────────────────────
# Everything: fast + e2e + live_fp. Use for release qualification.
.PHONY: test-all
test-all:
	$(PYTHONPATH_SET) python -m pytest -m '' -v --tb=short --timeout=600

# ── Specific file ────────────────────────────────────────────────────────────
# Usage: make test-file FILE=builds/claude_code/tests/test_algebra.py
.PHONY: test-file
test-file:
	$(PYTHONPATH_SET) python -m pytest $(FILE) -v --tb=short
