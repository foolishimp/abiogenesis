# M05 Installed Reset Postmortem Derivation

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md](./M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md), [M04_EVENT_INGRESS_DERIVATION.md](./M04_EVENT_INGRESS_DERIVATION.md), [M04_LIVE_STATUS_DERIVATION.md](./M04_LIVE_STATUS_DERIVATION.md), [T-032](../../.ai-workspace/tickets/completed/T-032-realize-typescript-m05-installed-reset-postmortem-parity-over-canonical-reset-and-continuation-law.md)

## Purpose

Derive one bounded `M05` installed reset-postmortem proof slice so the two
remaining Python sandbox reset audits are carried into the TypeScript installed
line without widening `M03`/`M04` into a new correction-runtime family.

## Python Reference Evidence

The source Python proofs are:

- `python/test_env/tests/test_sandbox_install.py`
  - `test_installed_runtime_reset_audit_supersedes_active_run_post_mortem`
  - `test_installed_runtime_reset_audit_abandons_open_continuation_post_mortem`
- `python/test_env/tests/sandbox_runtime.py`

Those proofs treat the following post-reset truths as authoritative:

- accepted workspace reset over an active run yields a `run_superseded`
  postmortem with `status = superseded`
- accepted workspace reset over an open continuation yields a
  `continuation_abandoned` postmortem with `status = abandoned`

## TypeScript Repricing Boundary

The TypeScript line already has:

- canonical reset command ingress in `M04`
- canonical live-status projection in `M04`
- canonical result-assessment ingress in `M04`
- installed-root proof in `M05`

It does **not** currently publish Python-style downstream runtime event kinds
for `run_superseded` or `continuation_abandoned`.

So this wave reprices the Python proof into one explicit `M05` installed proof
boundary:

- consume accepted reset ingress as upstream truth
- consume pre-reset run status and non-fulfilled assessment provenance as
  upstream
  truth
- derive the two authoritative installed postmortem facts in `M05`

This keeps correction follow-up ownership below `M04` reset ingress, which is
already declared in the `M04` event-ingress design.

## First-Slice Mapping

| Python reference behavior | TypeScript first-slice carrier law | Notes |
| --- | --- | --- |
| active run reset yields `run_superseded` | derive one `RunSupersededPostmortemRef` from accepted reset over pre-reset live run truth | uses authoritative `runId` already present in `PublicStartOutcome.trace` |
| open continuation reset yields `continuation_abandoned` | derive one `ContinuationAbandonedPostmortemRef` from accepted reset over non-fulfilled assessment provenance | current TypeScript line reprices continuation identity to deterministic manifest-owned proof identity |
| Python event-stream tail is `reset -> run_superseded` or `reset -> continuation_abandoned` | TypeScript first slice requires accepted reset plus explicit reset emission in the installed observation | keeps installed parity grounded in canonical reset ingress rather than helper-only reconstruction |

## Explicit Reprice

Python continuation identity is event-stream owned.
Current TypeScript first slice does not yet expose a first-class continuation
carrier outside proof.

So `T-032` uses this deterministic installed proof identity:

- `continuationId = "continuation:" + manifestId`

That reprice is lawful because:

- it is explicit here
- it is deterministic from admitted result-assessment provenance
- it stays inside the `M05` installed proof boundary
- it does not create a rival `M03`/`M04` runtime carrier

## Out Of Scope

This slice does not:

- add new `M03` runtime event kinds
- add new `M04` reset follow-up append paths
- reopen archive finalization
- widen live-status into correction history
