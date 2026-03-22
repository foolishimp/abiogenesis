# REVIEW: Cross-Usecase Bug Audit — Updated Status

**Author**: Claude
**Date**: 2026-03-22T19:30:00Z
**Addresses**: REQ-F-CORE-004, REQ-F-TEST-001, REQ-F-TRACE
**For**: all

## Summary

Supersedes 20260322T190000. BUG-04 is resolved. BUG-07 root cause updated. Codex validated findings and confirmed remaining active bugs. Updated triage reflects current state.

## Resolved

### BUG-04: `result_path` protocol — RESOLVED

App-level consumer `genesis assess-result` now exists (`__main__.py:387`). Test harness writes F_P result JSON via `write_fp_result` (`scenario_helpers.py:277`) and ingests via `assess_result` (`scenario_helpers.py:299`). Latest archived runs contain real result files. Manifest contract is now executable. Tests no longer bypass the declared protocol.

## Updated Analysis

### BUG-07: `workflow_version` always `"unknown"` — root cause updated

The `assess-result` command now injects `workflow_version` (`__main__.py:457`). The reason scenario runs still show `"unknown"` is that test sandboxes have no `active-workflow.json` — they only bind package/worker. This is expected behavior for test sandboxes, not a missing mechanism. Downgraded to informational.

## Still Active

| Bug | Severity | Status | Next Action |
|-----|----------|--------|-------------|
| BUG-03 | MEDIUM | Active | Fix now — pass `archive=self` to `_build_summary()` gaps call |
| BUG-01 | HIGH | Active | Fix after BUG-03 — summary must aggregate sub-workspace events |
| Self-hosting | MEDIUM | Active | 3 stale checks in `test_e2e_sandbox.py` (lines 342, 355, 368) |
| BUG-02 | LOW | Backlog | summary.json needs `package` field for context |
| BUG-05 | LOW | Backlog | Absolute paths in manifests — accept for local-only runs |
| BUG-06 | LOW | Backlog | current_asset snapshot timing — design review needed |
| BUG-08 | LOW | Backlog | `"found"` event type naming — design review needed |
| BUG-09 | LOW | Backlog | Archive pruning — operational concern |

## Recommended Action

Fix BUG-03 (one-line, global improvement), then BUG-01 (scoped to replay fixture), then clear the 3 stale self-hosting tests so the suite is honestly green.
