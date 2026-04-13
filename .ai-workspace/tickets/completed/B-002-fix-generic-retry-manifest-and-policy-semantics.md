# B-002 Fix Generic Retry Manifest And Policy Semantics

- id: B-002
- title: Fix generic retry manifest and policy semantics for ABG edge traversal
- type: bug
- status: completed
- goal: runtime-retry-governance
- priority: critical
- created_at: 2026-04-12
- updated_at: 2026-04-12
- completed_at: 2026-04-12
- dependencies: B-001

## Triage

- intake: bug / regression / operator finding / release blocker
- affected_boundary: abiogenesis retry semantics, graph-call attempt identity, manifest lifecycle, and retry-policy contract
- lawful_change_class: requirement_reprice
- lawful_re_entry: abiogenesis requirements for retry identity, retry prompt construction, retry control, and ABG/domain override boundaries
- downstream_proof_span: abiogenesis runtime and installed-sandbox proof, then odd_method consumption through install and live downstream evidence

## Why This Is Requirement Reprice

The current behavior is not only an implementation defect.

The existing ABG requirements are strong enough to say the current stale-retry
behavior is wrong:

- retries must mint fresh attempt identity
- stale progress must not become current truth
- continuation across regimes is lawful

But they are not precise enough to define the generic retry contract needed for
same-edge repair and domain override.

This bug therefore begins by disambiguating constitutional runtime
requirements before changing design or code. The intended direction remains
stable. What changes is the required truth governing retry behavior.

## Bug

ABG currently allows a stopped edge to be retriggered, but the retry semantics
are not generic or sufficiently specified.

Observed failure shape in `data_mapper.test27`:

- the second `derive_code_surface` retry reused the prior manifest instead of
  minting a fresh retry attempt surface
- the prompt therefore carried stale target-binding state
- deterministic failure evidence was too weak for targeted repair
- the runtime did not clearly separate substrate retry behavior from
  domain-level retry override

This creates drift between intended ABG behavior and actual retry behavior:

- runtime state is evolving
- asset-under-construction is stateful
- but prompt truth may be stale across retries

That is a substrate bug.

## Intended Fix

ABG retry must be generic and current-state-derived.

The target model is:

- each retryable edge attempt mints a fresh attempt identity and fresh prompt
- retry prompts are reconstructed from current workspace/runtime state
- retry prompts instruct the agent to inspect the current target asset, determine
  progress, identify the remaining gap, and continue construction
- prior attempts remain runtime history, not frozen prompt truth
- ABG owns retry framework semantics and default policy
- domains may override retry control declaratively at lawful GTL/policy
  surfaces

## ABG / Domain Separation

### ABG Owns

- retry attempt identity and lineage
- manifest lifecycle
- prompt regeneration on retry
- generic retry policy framework
- generic retry stop/continue/escalate semantics
- runtime comparison facts needed to determine whether new signal was produced

### Domain Owns

- evaluator meaning
- structured repair evidence emitted by evaluator/check surfaces
- which findings are retryable, advisory, or hard-stop under declared policy
- retry-budget and escalation overrides attached through lawful GTL/policy
  surfaces

ABG must not hard-code `odd_sdlc` retry logic.
`odd_sdlc` must not implement a shadow retry runtime.

## Task List

- [x] Disambiguate ABG requirements so retry semantics are explicit rather than implied.
- [x] Define fresh retry attempt law: retryable same-edge attempts mint fresh
  runtime attempt identity and fresh prompt/manifest truth.
- [x] Define prompt regeneration law: retry prompts are derived from current
  workspace/runtime state, not reused stale manifest state.
- [x] Define generic retry-control law: bounded same-edge repair is allowed while
  retry policy says continue and new signal is still being produced.
- [x] Define generic stationary-failure law: retry stops or escalates when
  configured retry budget is exhausted or successive attempts produce no new
  signal.
- [x] Define ABG/domain override boundary for retry policy, including what
  remains substrate-owned and what may be overridden by domain GTL/policy
  surfaces.
- [x] Reframe ABG design/runtime implementation to satisfy the repriced retry
  requirements.
- [x] Fix pending-run and manifest-reuse behavior so stopped retryable edges do
  not redispatch stale manifests.
- [x] Regenerate retry prompts from fresh bindings and current deterministic
  findings on every retry.
- [ ] Improve deterministic repair evidence carried into the prompt so retries
  can target the remaining gap.
- [x] Add ABG proof lanes covering fresh retry identity, fresh prompt
  regeneration, same-edge bounded repair, and stationary-failure stop behavior.
- [ ] Re-run live downstream proof through odd_method install composition and
  compare retry behavior against `data_mapper.test27`.

## Current State

Completed in `abiogenesis`:

- explicit retry requirements published at `REQ-R-ABG3-RETRY`
- constitutional design and replay/correction scenario updated for fresh retry
  attempt truth
- retry prompt construction now carries a generic current-state-first working
  method
- retry manifests now mint microsecond-resolution identities to prevent
  same-second collisions
- unresolved `fd_gap` attempts now terminalize prior run and graph-call truth so
  a later retry opens a fresh attempt instead of redispatching stale manifest
  state
- ABG proof lanes and full suite are green at `259 passed, 5 deselected`

Follow-on enhancement work:

- richer structured deterministic repair evidence
- progress/stationarity fact model
- retry vs lawful re-entry vs replacement taxonomy
- compact/reference-first prompt composition

Those are now carried by
[`T-003-enhance-abg-repair-signal-and-control-plane.md`](/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/T-003-enhance-abg-repair-signal-and-control-plane.md).

## Acceptance

- ABG retry semantics are explicitly defined at requirement level
- retryable same-edge attempts mint fresh attempt identity and fresh manifest
  truth
- retry prompts are regenerated from current workspace state
- retry prompts instruct the agent to inspect current progress before continuing
- stale prompt state is not reused as current truth
- ABG exposes generic retry-control behavior without hard-coding domain-specific
  retry logic
- domains can override retry behavior only through declared GTL/policy surfaces
- installed downstream proof shows retry behavior consistent with the repriced
  requirement set

## Closure

Closed on 2026-04-12.

The bug-specific retry-manifest and stale-prompt semantics are fixed in ABG.
The remaining work exposed by `test28` is enhancement work, not unresolved bug
scope, and is tracked under `T-003`.

## Links

- parent: `/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/active/B-001-reprice-abg-provenance-runtime-boundary-wave.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/SPEC_METHOD.md`
- standard: `/Users/jim/src/apps/specification_methodology/specification/standards/TICKET_METHOD.md`
- evidence: `/Users/jim/src/apps/ai_sdlc_examples/local_projects/data_mapper.test27/.ai-workspace/events/events.jsonl`
