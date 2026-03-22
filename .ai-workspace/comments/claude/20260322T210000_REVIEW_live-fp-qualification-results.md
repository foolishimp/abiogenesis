# REVIEW: Live F_P Prompt Sufficiency Qualification Results

**Author**: Claude
**Date**: 2026-03-22T21:00:00Z
**Addresses**: `scenario_helpers.py`, `test_live_fp_qualification.py`, ADR-020
**For**: all

## Summary

Live F_P qualification completed. Both scenarios pass 10/10 against deterministic judges via MCP transport (`@steipete/claude-code-mcp` v1.10.12, model: sonnet).

This closes the 2nd-to-last MVP hurdle identified in the Codex strategy doc (`20260322T092707_STRATEGY_live-fp-prompt-sufficiency-qualification.md`).

---

## Results

### Scenario 1: design→data_schema

| Run | Result | Evidence | Duration |
|-----|--------|----------|----------|
| 0 | PASS | 3 tables, snake_case, constraints, timestamps | 51s |
| 1 | PASS | 3 tables, snake_case, constraints, timestamps | 99s |
| 2 | PASS | 3 tables, snake_case, constraints, timestamps | 51s |
| 3 | PASS | 4 tables, snake_case, constraints, timestamps | 48s |
| 4 | PASS | 4 tables, snake_case, constraints, timestamps | 59s |
| 5 | PASS | 3 tables, snake_case, constraints, timestamps | 57s |
| 6 | PASS | 3 tables, snake_case, constraints, timestamps | 42s |
| 7 | PASS | 3 tables, snake_case, constraints, timestamps | 53s |
| 8 | PASS | 4 tables, snake_case, constraints, timestamps | 46s |
| 9 | PASS | 3 tables, snake_case, constraints, timestamps | 46s |

**Result: 10/10 PASS** | Total: 9.4 min | Avg per run: ~55s

### Scenario 2: requirements→uat_tests

| Run | Result | Evidence | Duration |
|-----|--------|----------|----------|
| 0 | PASS | 3 REQs covered, numbered steps, expected results, edge cases | 96s |
| 1 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 78s |
| 2 | PASS | 3 REQs covered, numbered steps, expected results, edge cases | 73s |
| 3 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 93s |
| 4 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 62s |
| 5 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 68s |
| 6 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 71s |
| 7 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 77s |
| 8 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 80s |
| 9 | PASS | 2 REQs covered, numbered steps, expected results, edge cases | 80s |

**Result: 10/10 PASS** | Total: 13.4 min | Avg per run: ~78s

---

## Deterministic Judge Checks

**Schema judge** (`_judge_schema`): CREATE TABLE present, snake_case naming, integrity constraints (NOT NULL/PK/FK/UNIQUE), created_at/updated_at timestamps

**UAT judge** (`_judge_uat`): REQ-key coverage, numbered executable steps, Expected Result sections, edge case coverage (boundary/error/invalid/negative/timeout/empty)

---

## Transport

Architecture: F_D → MCP → F_P.claudecode (ADR-020, ported from ai_sdlc_method ADR-023)

The MCP transport was recovered after `claude -p` subprocess was found to hang reliably when invoked from nested sessions. `@steipete/claude-code-mcp` via the Python `mcp` SDK (v1.17.0) provides the correct invocation model: structured tool call, no subprocess management, no nesting guard issues.

The actor receives full tool access via MCP and writes artifacts directly to the workspace. The test harness reads what the actor produced rather than capturing stdout.

---

## Observations

- **Schema is faster** (~55s avg) — smaller, more structured artifact (SQL)
- **UAT is slower** (~78s avg) — longer prose with more structural requirements
- **Zero failures** across 20 runs — the manifest prompt surface is sufficient for both domain hops
- **Actor uses tools** — writes artifacts directly via MCP tool access, not raw text output
- **Natural variation** — 3 vs 4 tables in schema runs shows the actor interprets context differently each time, but all pass the deterministic judge
- **REQ coverage** — some runs find 3 REQ-keys (actor adds beyond the 2 required), all cover the mandatory 2

---

## Release Claim

The live qualification evidence supports the release claim from the strategy doc:

1. The protocol works (proven by 452 unit/integration tests)
2. The archive is trustworthy (every run archived with manifest, prompt, raw response, artifact, judge verdict)
3. The prompt/manifest surface has been live-qualified against a real LLM within tolerance (20/20 runs pass deterministic judges)

---

## Archives

All runs archived at:
- `tests/runs/live_fp_qualification/<timestamp>_test_schema_qualification/`
- `tests/runs/live_fp_qualification/<timestamp>_test_uat_qualification/`

Each run contains: `manifest.json`, `prompt.txt`, `raw_response.txt`, `artifact.txt`, `judge_verdict.json`
