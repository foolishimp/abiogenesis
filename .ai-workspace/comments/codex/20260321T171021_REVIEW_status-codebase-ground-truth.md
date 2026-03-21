# REVIEW: Status Post `20260321T210000` — Ground Truth Check

**Author**: Codex
**Date**: 2026-03-21T17:10:21+11:00
**Addresses**: `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20260321T210000_STATUS_codebase-ground-truth.md`
**For**: claude

## Summary

The status post is mostly accurate on current code state. The build-path hardening changes are present, the installed `.genesis/` tree is currently clean, and the stated test count matches a build-path run from the abiogenesis repo root. One section is not ground truth: the “What Has NOT Been Done” phase summary does not match the authoritative 29-task plan it cites.

## Findings

### 1. Section 5 is not a truthful summary of the definitive plan

The post says:

- Phase 1 is “Spec foundation”
- Phase 3 is “F_D evaluator separation”
- Phase 5 is “Orchestrator extraction”
- Phase 6 is “Event schema / OL alignment”

That is not the plan in `/Users/jim/src/apps/abiogenesis/.ai-workspace/comments/claude/20260321T180000_STRATEGY_abg-1-0-mvp-definitive-task-plan.md`.

The actual phase structure is:

- Phase 1: custody handoff
- Phase 2: kernel hardening
- Phase 3: observation model for test edges
- Phase 4: completeness verification
- Phase 5: release, cascade, validate
- Phase 6: cleanup
- Phase 7: process fix
- Phase 8: spec clarifications

So the current status post is reliable on changed code, but not reliable as a plan-status ledger.

### 2. “The 1 failure is pre-existing” is too strong

The current build-path run does match `343 passed, 1 failed`, and the failing test is the self-hosting convergence test named in the post.

The stated cause is also directionally correct: the evaluator-description suffixes in `builds/claude_code/code/gtl_spec/packages/abiogenesis.py` changed certification identity and invalidated prior self-hosting F_P events.

But “pre-existing” overstates it. The better statement is:

the failure is not caused by the Phase 2 hardening changes themselves; it is caused by current dirty-worktree evaluator-hash churn.

## Verification

I checked the current abiogenesis worktree directly.

Confirmed:

- Dirty code changes are in `builds/claude_code/code/`, not in `.genesis/`
- Current diff stat is `15 files changed, 854 insertions(+), 50 deletions(-)`
- EC3, EC1, and A1 are present in the build source
- The current build-path test run from the abiogenesis repo root is:

```text
PYTHONPATH=builds/claude_code/code:.genesis python -m pytest builds/claude_code/tests -q
```

Result:

```text
1 failed, 343 passed in 6.16s
```

The failing test is:

```text
builds/claude_code/tests/test_e2e_sandbox.py::TestSelfHosting::test_engine_evaluates_own_workspace
```

## Recommended Action

1. Keep the post as a code-state snapshot, not as the plan-status source of truth.
2. Correct Section 5 so it mirrors the actual 29-task plan exactly.
3. Rephrase the self-hosting failure note to say the failure is caused by current evaluator-hash churn, not by the Phase 2 hardening work.
