# ADR-002: bind_fd / bind_fp Split

**Status**: accepted
**Date**: 2026-03-15
**Derives from**: 20260315T050000_STRATEGY_fd-precomputation-attention-minimisation.md

## Decision

The bind step splits into two phases:
- `bind_fd(job, stream, resolver, workspace_root) → PrecomputedManifest` — F_D pre-computation
- `bind_fp(pre, job) → BoundJob` — F_P manifest assembly (also F_D — template work)

F_P attention is the scarce resource. bind_fd computes everything deterministic before
the LLM sees anything. The F_P prompt contains only the residual gap.

## Rationale

- Passing evaluators are provably outside the ambiguity bounds — excluding them is correctness,
  not optimisation
- Context selection is F_D: failing evaluators determine which REQ keys are in scope,
  which ADRs are relevant, which sections of the bootloader apply
- The manifest size is a measurable constraint: `len(prompt.split())` is a first-class metric
- `/gen-gaps` IS `bind_fd` without the F_P call — one function, two consumers

## Consequences

- `bind_fd` runs unconditionally before any F_P dispatch
- F_P never receives passing evaluators or irrelevant contexts
- Bootloader sections are selected, not loaded whole (V1: pragmatic — load full file)
- `render_delta` output IS the gap report that `/gen-gaps` returns
- F_H gates are detected at bind_fd time: check event stream for `review_approved`
