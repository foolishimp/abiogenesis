# ADR-003: PrecomputedManifest and BoundJob Structure

**Status**: accepted
**Date**: 2026-03-15
**Derives from**: 20260315T050000_STRATEGY_fd-precomputation-attention-minimisation.md

## Decision

Two dataclasses form the bind surface:

```python
PrecomputedManifest:
    job: Job
    current_asset: dict                 # project(stream, source_type) result
    failing_evaluators: list[Evaluator] # delta > 0 — F_P must address
    passing_evaluators: list[Evaluator] # delta = 0 — excluded from F_P prompt
    fd_results: dict[str, Any]          # pytest output, check-tags counts, etc.
    relevant_contexts: dict[str, str]   # {context.name: resolved_text}
    delta_summary: str                  # "3 tests fail, 2 files untagged"

BoundJob:
    job: Job
    precomputed: PrecomputedManifest
    prompt: str                         # assembled F_P manifest
    result_path: str                    # where F_P writes output
```

The F_P manifest structure (assembled by bind_fp):
```
[INVARIANTS]       — hard constraints, always present
[CURRENT STATE]    — F_D-projected asset state
[GAP]              — failing evaluators only, with F_D results
[RELEVANT CONTEXT] — F_D-selected subset (not full context set)
[OUTPUT CONTRACT]  — target asset markov conditions + result_path
```

## Consequences

- `passing_evaluators` is NEVER included in the F_P prompt
- V1 context selection: bootloader always, spec if F_P failing, ADRs if code failing
- `result_path` is set by the caller; F_P writes its output there
- manifest.py contains only these dataclasses — no business logic
