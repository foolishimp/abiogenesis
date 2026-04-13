# STRATEGY: ABG Root-Cause Fixes For odd_sdlc

**Author**: codex
**Date**: 2026-04-08T09:39:18Z
**Addresses**: GTL/ABG substrate fixes exposed by the `odd_sdlc` postmortem and roadmap; separate dispatch boundary for runtime, policy, proof, and result-ingest repairs
**Status**: Draft

## Summary

This post extracts the GTL/ABG fixes from the `odd_sdlc` upgrade discussion so they can be dispatched separately from domain-model repair.

It describes both current reality and target direction.

Current reality:

- the builder guide says a GTL app includes policy hooks, ABG runtime, projection/audit, and proof surfaces
- the builder guide also says hook concerns include `dispatch`, `evaluation`, `escalation`, `proof`, and `closure`
- ABG currently resolves those concerns as policy metadata
- but some key concerns are not yet executed strongly enough in the runtime

Most importantly:

- `proof_recheck_after_fp` is declared in policy defaults, but the current ingest path in `build_tenants/abiogenesis/python/code/genesis/result_ingest.py` still emits `proof_passed` directly from the ingested `F_P` assessment payload
- `closure_require_resolution_or_fh` is declared in policy defaults, but current closure behavior is still largely a config gate rather than a full runtime closure evaluation
- the `F_P` result contract does not yet require a general machine-readable work report for what the worker actually changed
- pending `fp_dispatched` work can remain unresolved for long periods without explicit timed-out or stale-run runtime facts

Target direction:

- ABG should execute proof and closure concerns as real runtime behavior, not mostly as labels
- the runtime should support postflight deterministic validation after `F_P`
- the runtime should support a richer `F_P` result contract that includes both semantic assessment and work attestation
- unresolved `F_P` dispatch should have first-class timeout, stale, and retry semantics

This post is about substrate fixes only.
It is not the `odd_sdlc` domain roadmap.

## Analysis

### 1. The builder guide already authorizes substrate fixes

The builder guide is explicit:

- a GTL domain app is the full configured product boundary, not just domain configuration
- the app includes `Policy Hook Bindings`, `ABG Runtime`, `Projection / Audit Surface`, and `Proof Surface`
- the hook model includes `dispatch`, `evaluation`, `escalation`, `proof`, and `closure`
- ABG owns runtime truth and runtime progression, including proof and closure facts

That means root-cause runtime and policy fixes are in bounds when the substrate is the real failure source.

This is not a violation of the app/domain boundary.
It is the correct use of the GTL/ABG feature set.

### 2. Current ABG shortfalls exposed by the odd_sdlc failure

The `odd_sdlc` postmortem exposed domain defects, but it also exposed runtime shortfalls:

#### A. Proof policy semantics are not fully executed

In `build_tenants/abiogenesis/python/code/genesis/policy_defaults.py`, the proof concern is named `proof_recheck_after_fp`.

In `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`, current behavior is:

- ingest assessment payload
- if all assessments are `pass`, emit `proof_passed`

That means the runtime currently treats probabilistic attestation as sufficient proof, even when the policy name says post-`F_P` recheck.

#### B. Closure semantics are weaker than the declared model

The closure concern is declared as `closure_require_resolution_or_fh`.

But current ingest behavior still treats closure mostly as a config outcome rather than a full runtime closure judgment over:

- postflight deterministic state
- open continuations
- required closure conditions
- possibly required approval gates

#### C. F_P result contract is too thin

The current `F_P` result contract validates:

- `edge`
- `actor`
- `assessments`

That is enough for semantic attestation, but not enough for governed constructive work.

The runtime lacks a first-class machine-readable work report for:

- what target artifact was changed
- what operation occurred
- what digests changed
- what evidence was produced
- what contracts are being claimed

That weakens all postflight truth.

#### D. Pending F_P dispatch lifecycle is under-modeled

The runtime has projection support for `timed_out` run state in `build_tenants/abiogenesis/python/code/genesis/run.py`.

But the dispatch path does not yet emit a full first-class stale/timed-out lifecycle for long-unresolved `fp_dispatched` work.

That means a run can remain operationally ambiguous for too long.

#### E. Hook concerns materialize, but some are not yet real executable enforcement

`build_tenants/abiogenesis/python/code/genesis/policy.py` resolves and materializes all concerns.

That part is good.

The shortfall is downstream:

- dispatch is executed strongly
- escalation is executed meaningfully
- proof and closure are not yet executed with equivalent rigor

So the gap is not the existence of the hook model.
It is incomplete runtime realization of the hook model.

### 3. This is the substrate work package, not the domain package

The `odd_sdlc` domain package should handle:

- SDLC asset graph shape
- placeholder path removal
- domain-specific evaluator design
- lifecycle semantics for software delivery

The ABG/GTL package should handle:

- proof hook execution
- closure hook execution
- result contract extension
- pending/stale/timed-out `F_P` lifecycle
- event and projection semantics for those runtime states

This separation matters because a domain repair without a runtime repair will still leave the substrate too trusting of `F_P` attestation.

## Goals

### Goal 1: Make proof a real runtime concern

Success means:

- proof policy is executed, not merely labeled
- successful `F_P` attestation does not automatically produce `proof_passed`
- the runtime can run postflight deterministic proof checks after `F_P`

### Goal 2: Make closure a real runtime concern

Success means:

- closure policy is executed, not merely labeled
- closure depends on declared conditions such as proof, continuation resolution, and required approvals
- closure facts are runtime truth, not mostly a thin wrapper over config

### Goal 3: Expand the F_P result contract

Success means:

- the runtime accepts both semantic assessments and a structured work report
- any app can require artifact-attestation or work-report fields without ad hoc domain-specific hacks
- result ingest can validate the shape of constructive claims before accepting them

### Goal 4: Add first-class pending/stale/timed-out F_P lifecycle

Success means:

- long-running or missing `F_P` results become explicit runtime facts
- projection can distinguish:
  - pending
  - stale
  - timed_out
  - retried
  - superseded
- audit and operator tooling can reason about these states from runtime facts alone

### Goal 5: Strengthen policy-hook realization

Success means:

- hook concerns are not just resolved into metadata
- proof and closure concerns are executed with the same seriousness as dispatch and escalation
- apps can rely on the declared hook model without inventing shadow runtimes

## Tasks

### Task Group A: Proof hook execution

1. Define the runtime contract for proof execution after `F_P`.
2. Implement actual post-`F_P` proof behavior in `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`.
3. Recompute or rebind live postflight state before emitting `proof_passed`.
4. Allow proof concerns to run deterministic attestation hooks over live artifacts and declared evidence.
5. Ensure `proof_passed` is emitted only after those checks clear.

### Task Group B: Closure hook execution

1. Define closure as a runtime evaluation over declared closure conditions, not just config toggles.
2. Implement full closure execution after proof resolution.
3. Require closure evaluation to inspect:
   - proof state
   - open continuations
   - required approvals
   - required closure policies
4. Emit `closure_passed` only when those runtime conditions actually hold.

### Task Group C: General F_P work-report schema

1. Extend the `F_P` result contract beyond `edge` + `actor` + `assessments`.
2. Add a general machine-readable work-report payload for constructive work.
3. Require support for fields such as:
   - operation type
   - target binding or target path
   - input digests
   - output digests
   - evidence refs
   - claimed contracts satisfied
4. Validate the work-report schema during result ingest.
5. Keep the schema substrate-level and domain-agnostic so apps can specialize without inventing incompatible result formats.

### Task Group D: Postflight deterministic evaluation pipeline

1. Add a substrate-level postflight evaluation step after successful `F_P` ingest.
2. Make the pipeline re-run declared deterministic proof checks against live runtime truth.
3. Support artifact-attestation hooks as part of the proof concern.
4. Ensure this works for generic apps, not just `odd_sdlc`.

### Task Group E: Pending / stale / timed-out F_P lifecycle

1. Define explicit runtime facts for stale and timed-out `F_P` dispatch.
2. Emit `run_timed_out` or equivalent runtime facts when `F_P` remains unresolved beyond policy thresholds.
3. Add projection support for stale/pending/timed-out distinctions in run and graph-call state.
4. Preserve retry and supersession semantics cleanly.
5. Ensure dispatch-runtime and projection semantics agree.

### Task Group F: Event and provenance strengthening

1. Strengthen causal linkage between:
   - `fp_dispatched`
   - worker turn execution
   - result ingest
   - proof
   - closure
2. Make it easier to identify which worker session or result artifact produced which proof or closure fact.
3. Keep these as runtime facts rather than client-side lore.

### Task Group G: Builder-guide and runtime alignment

1. Reconcile runtime behavior with the claims in `docs/LLM_GTL_APP_BUILDER_GUIDE.md`.
2. Update the guide if hook semantics or result-contract semantics are extended.
3. Ensure the guide accurately describes:
   - what proof does
   - what closure does
   - what constructive dispatch must return

### Task Group H: Substrate regression suite

1. Add tests proving that `proof_recheck_after_fp` is actually executed.
2. Add tests proving that closure evaluation inspects runtime state rather than just config.
3. Add tests for the expanded `F_P` result contract.
4. Add tests for stale/timed-out dispatch lifecycle and projection.
5. Add tests proving the runtime fails closed on malformed work reports.

## Recommended Action

1. Dispatch this work as a separate ABG/GTL substrate track from the `odd_sdlc` domain upgrade.
2. Treat Task Groups A through E as the core runtime repair tranche.
3. Treat Task Groups F through H as the stabilization and ratification tranche.
4. Do not defer these fixes if the substrate is the real source of failure; root-cause repair belongs in GTL/ABG when GTL/ABG owns the relevant truth surface.
