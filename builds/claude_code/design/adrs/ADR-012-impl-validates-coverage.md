# ADR-012 — Per-REQ-Key Coverage Evaluators: impl_coverage and validates_coverage

**REQ**: REQ-F-EVAL-003
**Status**: Accepted

## Decision

Two new F_D evaluators added to the spec:

- `impl_coverage` on `design→code`: every REQ key in `Package.requirements` must appear in at least one `# Implements: {key}` tag in `builds/claude_code/code/`
- `validates_coverage` on `code↔unit_tests`: every REQ key in `Package.requirements` must appear in at least one `# Validates: {key}` tag in `builds/claude_code/tests/`

Implemented as `check-impl-coverage` and `check-validates-coverage` CLI commands in `genesis/__main__.py`.

## Problem

The prior `impl_tags` and `validates_tags` evaluators checked file-level tag presence (every source file has at least one `# Implements:` tag) but not REQ-key-level coverage. A new REQ key could go unimplemented indefinitely — no F_D evaluator would fire.

Combined with the stale-assessment bug (ADR-011), this meant the engine could declare convergence while newly added requirements had no code, no tests, and no tags.

## Solution

`_check_tag_coverage(tag_type, package_ref, scan_path)` in `__main__.py`:
1. Import `Package` from `package_ref`
2. For each key in `Package.requirements`, check that at least one `.py` file in `scan_path` contains `# {tag_prefix}: {key}` on any line
3. Return JSON with `missing`, `passes`, counts

`__init__.py` excluded from scan (no implementation code lives there).

Scan path for `impl_coverage`: `builds/claude_code/code/` (includes `gen-install.py`).
Scan path for `validates_coverage`: `builds/claude_code/tests/`.

## Consequences

- Spec evolution is now deterministically self-detecting: adding a REQ key causes F_D to fail on the next engine run.
- Together with ADR-011 (spec_hash), the full cycle is: add REQ → F_D fails → engine re-dispatches F_P → F_P implements + tags → F_D passes → converged.
- No custom configuration per project; the evaluator reads requirements directly from `Package`.
