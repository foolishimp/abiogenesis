# REVIEW: Codex Build Spec-Gap Audit

**Author**: Codex
**Date**: 2026-03-21T01:21:03+11:00
**Addresses**: Genesis V1 constitutional surfaces, `builds/claude_code/code/genesis`, `builds/codex/code/genesis`
**For**: all

## Summary
I implemented an independent Codex build of the abiogenesis engine under `builds/codex` from the constitutional surfaces, not by porting the Claude engine module-for-module. The result is a working engine slice with `14 passed` tests, but the exercise surfaced several places where the written spec and the Claude build do not determine a single conformant implementation.

The main outcome is not "Codex differs from Claude." The main outcome is that the current constitutional surface still permits materially different engines on delta semantics, context-failure behavior, evaluator-command safety, and tenant identity. Those need ratification if abiogenesis is meant to be an exemplar.

## What Was Built
- Vendored GTL substrate into `builds/codex/code/gtl`.
- Implemented a Codex engine slice in `builds/codex/code/genesis/`:
  `core.py`, `bind.py`, `schedule.py`, `manifest.py`, `commands.py`, `__main__.py`.
- Added tests in `builds/codex/tests/`.
- Verified the build with `python -m pytest builds/codex/tests -q` → `14 passed in 0.06s`.

This build is intentionally narrow. It proves the core engine model can be realized independently, and it forces ambiguous constitutional requirements to become explicit choices.

## Findings

### 1. Delta semantics are internally contradictory
`specification/convergence_model.md:13-38` defines delta as a float fraction of failing evaluators. `specification/domain_model.md:184-199` defines `PrecomputedManifest.delta` as an integer count. The requirements then mix both surfaces: `requirements.md:77-80` says `converged: true` iff `total_delta == 0.0`, but the Claude implementation returns integer `delta` in `builds/claude_code/code/genesis/manifest.py:39-42` and sums integer deltas in `builds/claude_code/code/genesis/commands.py:151-159`.

The Codex build had to choose. I implemented the convergence-model reading: `builds/codex/code/genesis/manifest.py:28-33` returns a fractional float, and `builds/codex/code/genesis/commands.py:50`, `builds/codex/code/genesis/commands.py:68`, and `builds/codex/code/genesis/commands.py:266` treat `total_delta` as a float.

This is not cosmetic. It changes JSON output, comparison thresholds, and any future prioritization logic based on delta magnitude.

### 2. Context resolution failure mode is not safely ratified
The domain model defines `ContextResolver.load()` as a real loader with digest verification and says unknown schemes are fatal in `specification/domain_model.md:156-167`. The Claude build, however, degrades missing `workspace://` locators into a sentinel string in `builds/claude_code/code/genesis/core.py:250-268`. The Codex build treats a missing workspace path as fatal in `builds/codex/code/genesis/core.py:142-157`.

The difference matters because the constitutional package surfaces still carry stale locators after the four-territory move:
- `builds/claude_code/code/gtl_spec/packages/abiogenesis.py:33-49`
- `builds/claude_code/code/gtl_spec/packages/genesis_core.py:28-49`

Those contexts still reference `workspace://gtl_spec/...`, `workspace://INTENT.md`, and `workspace://V1_DOCTRINE.md`, while the real sources now live under `builds/claude_code/code/gtl_spec/`, `specification/INTENT.md`, and `docs/V1_DOCTRINE.md`. A fail-open resolver hides that constitutional drift. A fail-closed resolver forces it into the open.

### 3. REQ-F-EVAL-001 contradicts the constitutional package commands
`specification/requirements.md:185-191` says F_D commands "must not invoke genesis subcommands." But the constitutional package specs do exactly that:
- `builds/claude_code/code/gtl_spec/packages/abiogenesis.py:178-214`
- `builds/claude_code/code/gtl_spec/packages/genesis_core.py:198-219`

Those evaluators rely on `python -m genesis check-tags`, `check-req-coverage`, `check-impl-coverage`, and `check-validates-coverage`.

The Codex build had to reinterpret the requirement to mean "must not invoke lifecycle-recursive subcommands" rather than "must not invoke any genesis subcommand." That choice is encoded in `builds/codex/code/genesis/__main__.py:188-202`, which rejects `genesis start` and `genesis iterate` recursion but permits diagnostic `check-*` subcommands. The Claude build currently does not enforce the requirement up front; it only hints at the issue on timeout in `builds/claude_code/code/genesis/bind.py:199-205`.

This is a real constitutional contradiction, not an implementation bug.

### 4. Tenant identity is still Claude-specific in the normative surface
The domain model hardcodes `Scope.build` default to `"claude_code"` in `specification/domain_model.md:172-183`. The Claude build follows that in `builds/claude_code/code/genesis/commands.py:111-117`. But an independent Codex tenant cannot honestly report itself as `claude_code`, so the Codex build uses `build="codex"` in `builds/codex/code/genesis/commands.py:21-33` and emits that identity in `builds/codex/code/genesis/commands.py:171-179`.

If abiogenesis is multi-tenant in principle, the constitutional surface should not encode one tenant as the normative default. If it is intentionally Claude-specific, then a Codex implementation is by definition outside the current spec and should be treated as an overlay, not a conformant peer build.

### 5. Worker resolution is underspecified between the domain model and Claude convenience behavior
The domain model presents `Scope.worker` as caller-provided in `specification/domain_model.md:172-183`. The Claude build still allows implicit self-hosting fallback when `worker is None` in `builds/claude_code/code/genesis/commands.py:100-117`. The Codex build made worker explicit and required in `builds/codex/code/genesis/commands.py:271-274`.

This is a smaller gap than the first four, but it has the same shape: the constitutional model says one thing, the live tenant adds convenience behavior that changes the contract surface.

## Recommended Action
1. Ratify delta semantics. Pick either fractional delta or integer failing-count delta, then align `convergence_model.md`, `domain_model.md`, `requirements.md`, both builds, and their tests.
2. Ratify context failure policy. If missing constitutional context is a real error, require fail-closed behavior and fix the stale package locators immediately. If fail-open is intentional, say so explicitly in the domain model and explain the safety rationale.
3. Rewrite REQ-F-EVAL-001 to match reality. The likely correct rule is: no lifecycle recursion (`start`, `iterate`, `gaps`) inside F_D evaluators, while diagnostic `check-*` subcommands are allowed.
4. Remove tenant bias from the constitutional surface. Replace `"claude_code"` defaults with a tenant-neutral default or make tenant identity an explicit required field.
5. Add cross-tenant conformance tests. The spec should own black-box behavior tests for delta, workflow-version formatting, context loading, and F_D command validation so future tenant builds cannot silently diverge.

Until those points are ratified, abiogenesis is close to self-consistent but not yet a single fully-determined engine spec. The Codex build demonstrates that the remaining gaps are small enough to isolate, but still significant enough to produce divergent implementations.
