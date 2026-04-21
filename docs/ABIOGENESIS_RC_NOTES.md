# abiogenesis 3.2.0 RC Notes

This note records release-candidate caveats and accepted framework behavior
for the current `abiogenesis` B-027 runtime-carrier wave.

## Accepted Framework Behavior

### Runtime Law Is Carrier And Event Owned

The current RC makes typed runtime carriers and replay-visible events the
authoritative source for advancement, convergence, dispatch, and projection
truth.

That means:

- public advancement consumes `ExecutionBasis` and `AdvancementTransition`
  truth produced by the kernel
- iteration planning consumes `IterationAdvanceDecision` instead of local
  controller branches
- `RegimeBindingSet` is the singular `F_D` / `F_P` / `F_H` regime truth used by
  convergence and runtime publication
- feature completion is emitted as event truth and active-work state is
  projected by replay
- removing the carrier path is a fail-closed defect, not a degraded legacy mode

### Runtime Config Is Ingress, Not Runtime Law

The current RC demotes runtime configuration to an adapter/bootstrap ingress
surface.

That means:

- dispatch, result ingest, proof-hold, live-status, and asset-binding contract
  paths consume resolved/admitted carrier truth
- missing carrier truth fails closed rather than resolving policy or contract
  meaning mid-flight
- downstream consumers must move to the installed 3.2.0 boundary instead of
  depending on older `runtime_config` side-channel semantics

### Provenance-Ready Runtime Is Now Mandatory

The current RC removes `"unknown"` as a lawful governed-runtime provenance
mode.

That means:

- governed runtime initialization now requires valid workflow metadata
- missing or malformed active-workflow metadata is a runtime defect, not a
  compatibility fallback
- CLI and runtime entry points fail closed when provenance metadata is absent
  or invalid

This is an interface cut in the substrate runtime boundary, not a downstream
compatibility feature.

### Install And Bootstrap Seed Workflow Truth By Construction

The current RC treats provenance readiness as part of the install/bootstrap
contract.

That means:

- install/bootstrap writes active workflow metadata into the runtime surface
- fresh installed workspaces start provenance-ready rather than degrading at
  first use
- runtime truth now assumes versioned workflow metadata exists because install
  guarantees it

### Approval And Runtime Identity Are Versioned More Strictly

The current RC strengthens the identity carried by runtime approvals and
probabilistic assessment reuse.

That means:

- bare edge-name `F_H` approvals no longer authorize governed traversal
- runtime `spec_hash` now binds workflow version, executable-job structure, and
  requirement truth
- stale probabilistic assessments reopen when active workflow or requirements
  truth changes

### Unresolved Post-Continuation Deterministic Gaps Surface As `fd_gap`

The current RC keeps `F_D -> F_P` continuation lawful, but it no longer
misclassifies an unresolved deterministic gap as a generic runtime failure
after the constructive turn returns.

That means:

- when a constructive continuation finishes and closure reruns the declared
  deterministic checks
- and those deterministic checks are still the active blocker
- the runtime now surfaces that state back out as `fd_gap`
- instead of reporting `probabilistic_non_convergence` / `fp_runtime_failure`

### Retry Attempts Now Rebind Current Truth

The current RC makes retry attempts current-state-derived rather than stale
manifest replay.

That means:

- retryable attempts now mint fresh manifest identity at finer than one-second
  resolution
- retry prompts are rebuilt from current workspace and runtime state rather than
  redispatching an old prompt
- the generic prompt now instructs the actor to inspect the current target
  asset, determine realized progress, identify the remaining gap, and continue
  from present state

### Stopped `fd_gap` Attempts Now Terminalize Prior Run And GraphCall Truth

The current RC no longer leaves a retryable stopped attempt looking live in run
and graph-call projection.

That means:

- unresolved deterministic closure after `F_D -> F_P` still stops as `fd_gap`
- but the stopped bounded attempt now emits terminal graph-call and run truth
- later retries therefore open fresh attempt identity instead of reusing a
  stale in-flight manifest

## Current Known Limitation

### Downstream Consumers Must Refactor To The Released Boundary

This RC does not provide a backward-compatibility shim for removed provenance
fallback behavior.

That means:

- downstream consumers such as `odd_method` must consume this RC through their
  installer path
- downstream `.genesis` truth is refreshed by install, not by manual source
  mirroring
- downstream green status is a separate refactor/proof wave, not part of this
  ABG RC note itself

### Structured Deterministic Repair Evidence Remains Domain-Owned

This RC makes retry prompts fresh and current-state-derived, but it does not
invent domain-specific repair hints where a domain evaluator emits no structured
detail.

That means:

- ABG now carries generic retry law and fresh prompt truth
- richer missing-item or repair-target evidence still belongs to the domain
  evaluator surface
- downstream domains such as `odd_method` may still improve their evaluator
  output independently of this RC

## Current Verification Footer

The current release-candidate proving footer is:

- `317 passed`
- `19 deselected`

from:

- `python -m pytest build_tenants/abiogenesis/python/test_env/tests -q`

The live F_P qualification footer is:

- `5 passed`
- `600s`

from the Claude-run live harness:

- `CODEX_LIVE_FP=1 python -m pytest -m live_fp -x -v -s build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
