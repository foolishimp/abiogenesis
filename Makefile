# ── Test Lanes ────────────────────────────────────────────────────────────────
#
# All tests are collected by default. Expensive tests (live_fp, e2e) self-skip
# when prerequisites aren't met (claude CLI not on PATH, no sandbox, etc.).
#
# Named lanes make intent explicit and set appropriate timeouts.

PYTEST = PYTHONPATH=builds/claude_code/code:builds/claude_code/tests python -m pytest

# ── Default: everything except e2e ───────────────────────────────────────────
# Includes live_fp (self-skips if claude not on PATH). ~60s.
.PHONY: test
test:
	$(PYTEST) -m 'not e2e' -q --tb=short

# ── E2E: sandbox lifecycle ───────────────────────────────────────────────────
# Creates real sandbox directories. No LLM calls.
.PHONY: test-e2e
test-e2e:
	$(PYTEST) -m e2e -q --tb=short

# ── Live F_P: real LLM qualification ────────────────────────────────────────
# 22 tests × ~2min each. Release gate. Requires claude CLI.
.PHONY: test-live-fp
test-live-fp:
	$(PYTEST) -m live_fp -v --tb=short --timeout=600

# ── Full: release qualification ──────────────────────────────────────────────
# Everything including e2e and live_fp.
.PHONY: test-all
test-all:
	$(PYTEST) -v --tb=short --timeout=600

# ── Single file ──────────────────────────────────────────────────────────────
# Usage: make test-file FILE=builds/claude_code/tests/test_algebra.py
.PHONY: test-file
test-file:
	$(PYTEST) $(FILE) -v --tb=short
