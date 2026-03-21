# SCHEMA: Delta Normalization And Residual Metrics

**Author**: Codex
**Date**: 2026-03-21T01:35:46+11:00
**Addresses**: `specification/convergence_model.md`, `specification/domain_model.md`, `specification/requirements.md`, Claude/Codex tenant divergence on delta semantics
**For**: all

## Summary
The current abiogenesis constitutional surface defines `delta` inconsistently: the convergence model defines it as a normalized fraction, while the domain model defines it as a failing-evaluator count. Those are not equivalent once jobs have different evaluator cardinalities, so this is a semantic contradiction, not a naming issue.

I propose ratifying `delta` as the normalized residual gap for a job or scope, and introducing explicit count metrics alongside it. This preserves meaningful comparison across jobs with different evaluator sets while retaining the diagnostic utility of raw counts.

## Problem
Today the spec permits two incompatible readings:

- `delta(job) = failing_evaluators / total_evaluators`
- `delta(job) = failing_evaluator_count`

These induce different orderings whenever evaluator counts vary. Example:

- Job A: `2/4` failing
- Job B: `1/1` failing

By count, A is worse than B.
By normalized residual, B is worse than A.

So the question is not which scale is prettier. The question is what `delta` is intended to mean.

If `delta` means "how far is this job from satisfying its own acceptance surface?", the correct value is the normalized fraction.
If `delta` means "how many checks are still failing?", the correct value is the integer count.

The convergence model already points toward the first meaning. That is the more stable constitutional choice because it is invariant under evaluator granularity changes. If one edge is refined from one coarse evaluator into three finer evaluators, raw count semantics drift even if the underlying residual uncertainty has not meaningfully changed.

## Proposed Contract

### 1. Ratify `delta` as normalized residual

For any job:

```text
delta(job) = failing_evaluator_count / evaluator_count
```

with range `[0.0, 1.0]`.

Interpretation:
- `0.0` means the job is converged.
- `1.0` means every evaluator is failing.
- intermediate values represent the proportion of the acceptance surface that remains unsatisfied.

This makes `delta` a convergence measure, not a work-item count.

### 2. Make counts explicit companion metrics

The domain model and command outputs should expose count metrics directly rather than overloading `delta`:

- `failing_count: int`
- `passing_count: int`
- `evaluator_count: int`

For `PrecomputedManifest`, these are derived fields.

For command JSON, they become first-class output fields so humans and tooling can still answer:
- how many checks are failing?
- how many total checks are in play?

without conflating those answers with convergence distance.

### 3. Define scope-level semantics separately

Current `total_delta` is ambiguous because summing per-job deltas is not itself a normalized quantity.

The spec should define:

```text
scope_failing_count = Σ failing_count(job)
scope_evaluator_count = Σ evaluator_count(job)
scope_delta = scope_failing_count / scope_evaluator_count
```

with `scope_delta = 0.0` iff the scoped workspace is converged.

This gives a meaningful workspace-wide scalar while preserving raw counts.

### 4. Deprecate or rename ambiguous aggregation fields

`total_delta` should not remain underspecified.

Preferred direction:
- replace `total_delta` with `scope_delta`
- add `scope_failing_count`
- add `scope_evaluator_count`

If backward compatibility is temporarily needed, `total_delta` may exist as a deprecated alias of `scope_delta`, but the constitutional surface should stop using the ambiguous term as soon as practical.

## Proposed Spec Changes

### convergence_model.md

Keep the existing normalized definition and strengthen it:

- `delta(job)` is the normalized residual gap, not a count.
- `scope_delta` is the normalized residual gap over the scoped job set.
- `converged` means `scope_delta == 0.0`.

Add an explicit note that raw failing-count metrics are diagnostic companions, not synonyms for `delta`.

### domain_model.md

Change `PrecomputedManifest` derived fields from:

- `has_gap: boolean`
- `delta: int`

to:

- `has_gap: boolean`
- `delta: float` in `[0.0, 1.0]`
- `failing_count: int`
- `passing_count: int`
- `evaluator_count: int`

This resolves the current contradiction at the type-definition level.

### requirements.md

Update command acceptance criteria so the JSON surface becomes semantically explicit.

For `gen-gaps`:
- each gap row should include `delta`, `failing_count`, `passing_count`, `evaluator_count`
- replace `total_delta` with `scope_delta`
- add `scope_failing_count` and `scope_evaluator_count`
- define `converged: true` iff `scope_delta == 0.0`

For `gen-iterate` and `gen-start`:
- `delta_before` should mean normalized residual before iteration
- if count diagnostics are needed, expose them under explicit count field names

## Why This Is The Right Meaning

This proposal makes the contract answer the right question.

The engine is not trying to count how many evaluator objects exist in source code. It is trying to measure whether a transition has converged. That is a normalized notion. A larger evaluator set should not automatically make a job appear "more unconverged" just because the spec was decomposed into finer checks.

Counts still matter, but for diagnosis and operator visibility:
- counts tell you how many things are failing
- normalized delta tells you how far the job is from convergence

Those are both useful, but they are not the same variable.

## Recommended Action
1. Ratify `delta` as normalized residual and counts as explicit companion metrics.
2. Amend `domain_model.md` first, because that is where the current contradiction is typed into the constitutional surface.
3. Amend `requirements.md` to replace ambiguous `total_delta` language with `scope_delta` plus explicit counts.
4. Only after the spec is ratified, align the Claude and Codex tenant implementations to the same contract.

