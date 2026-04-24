# M05 Installed Reset Postmortem First-Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M05_INSTALLED_RESET_POSTMORTEM_DERIVATION.md](./M05_INSTALLED_RESET_POSTMORTEM_DERIVATION.md), [M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md](./M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md), [M04_EVENT_INGRESS_FIRST_SLICE_IACS.md](./M04_EVENT_INGRESS_FIRST_SLICE_IACS.md), [T-032](../../.ai-workspace/tickets/completed/T-032-realize-typescript-m05-installed-reset-postmortem-parity-over-canonical-reset-and-continuation-law.md)

## Purpose

Declare the `M05` installed reset-postmortem slice as an explicit carrier
inventory so Python reset/postmortem parity is proved through one bounded
qualification family instead of ad hoc installed scripts.

## Boundary

This slice is bounded to:

- installed reset/postmortem qualification over completed installed-root truth
- one observation family for the two Python reset parity cases
- one outcome family that closes run supersession and continuation abandonment
  parity

This slice does not own:

- reset command ingress itself
- runtime event append behavior below canonical reset emission
- first-class continuation runtime carriers
- archive finalization

## Prime Carrier Families

The installed reset-postmortem slice is allowed exactly these prime carrier
families:

1. `InstalledResetPostmortemRequest`
2. `InstalledResetPostmortemOutcome`

## Authority Matrix

| Carrier | Module owner | Role | Produced by | Consumed by | Notes |
| --- | --- | --- | --- | --- | --- |
| `InstalledResetPostmortemRequest` | `M05-qualification-scenarios` | authoritative installed reset/postmortem request | installed proof harness after installed qualification passes | reset/postmortem qualifier only | carries explicit observations for the two Python reset parity families |
| `InstalledResetPostmortemOutcome` | `M05-qualification-scenarios` | authoritative installed reset/postmortem outcome family | reset/postmortem qualifier only | parity audit and later closure review | closes the final Python reset parity gap without widening runtime law |

## Subordinate Register

| Subordinate carrier | Status | Why subordinate | Notes |
| --- | --- | --- | --- |
| `InstalledResetPostmortemObservation` | subordinate | nested under one request only | carries one installed parity observation |
| `RunSupersededPostmortemRef` | subordinate | derived proof detail under one passed outcome | keeps run supersession below the prime outcome boundary |
| `ContinuationAbandonedPostmortemRef` | subordinate | derived proof detail under one passed outcome | keeps continuation abandonment below the prime outcome boundary |
| `InstalledResetPostmortemGapRef` | subordinate | rejection detail only | derived only from qualification failure |
| installed sandbox qualification outcome | already completed upstream | upstream installed truth, not owned here | must already be passed before reset/postmortem qualification |

## First-Slice Rules

- reset/postmortem qualification must consume completed installed sandbox
  qualification as upstream truth
- the request must carry both Python parity cases:
  `active_run_superseded` and `open_continuation_abandoned`
- each observation must preserve accepted reset truth and explicit reset
  emission
- active-run parity must preserve authoritative `runId`
- continuation parity must preserve admitted non-fulfilled result-assessment
  provenance
- continuation identity may be deterministically derived from `manifestId`
  only inside this installed proof boundary
- no new runtime append path may be introduced here

## Promotion Rule

No subordinate carrier above may be promoted to a new top-level peer unless:

1. reuse across a separate module boundary is demonstrated,
2. the new public/top-level role is declared here first, and
3. the promotion is recorded here and in `T-032` before code lands.
