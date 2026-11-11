# M05 Installed Live Portfolio First-Slice IACS

**Status**: Completed
**Date**: 2026-04-24
**Derived from**: [M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md](./M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md), [M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md](./M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md), [T-031](../../.ai-workspace/tickets/completed/T-031-realize-typescript-m05-installed-live-scenario-portfolio-parity-against-the-python-sandbox-live-reference-line.md)

## Purpose

Declare the `M05` installed live-portfolio slice as an explicit carrier
inventory so the Python live scenario families are carried into the TypeScript
installed proof surface as one bounded portfolio rather than as ad hoc scripts.

## Boundary

This slice is bounded to:

- installed portfolio qualification over completed installed-root truth
- one exported reference-obligation catalog for the Python live families
- explicit scenario-result carriers for those reference obligations
- portfolio proof over scenario authority, execution breadth, and runtime event
  evidence

This slice does not own:

- installed root delivery itself
- archive finalization or archive qualification
- reset/postmortem replay
- transport retry

## Prime Carrier Families

The installed live-portfolio slice is allowed exactly these prime carrier
families:

1. `InstalledLiveScenarioPortfolioRequest`
2. `InstalledLiveScenarioPortfolioOutcome`

## Authority Matrix

| Carrier | Module owner | Role | Produced by | Consumed by | Notes |
| --- | --- | --- | --- | --- | --- |
| `InstalledLiveScenarioPortfolioRequest` | `M05-qualification-scenarios` | authoritative installed portfolio request | test/support harness after installed-root qualification passes | portfolio qualifier only | carries the explicit Python live families as scenario results |
| `InstalledLiveScenarioPortfolioOutcome` | `M05-qualification-scenarios` | authoritative installed portfolio outcome family | portfolio qualifier only | installed parity review, future audit surfaces | closes the installed live breadth gap without widening runtime law |

## Subordinate Register

| Subordinate carrier | Status | Why subordinate | Notes |
| --- | --- | --- | --- |
| `InstalledLiveScenarioResult` | subordinate | nested under one portfolio request only | carries one scenario family result |
| `InstalledLiveScenarioStageResult` | subordinate | nested under one scenario result only | carries exact stage identity, edge, asset handle, and assessment ids |
| `InstalledLiveScenarioPortfolioGapRef` | subordinate | rejection detail only | derived only from portfolio qualification failure |
| `M05ReferenceLiveScenarioObligation` | subordinate authoritative catalog entry | consumed by the qualifier as source obligation truth | carries scenario authority, mode, exact stages, and minimum breadth |
| `M05ReferenceObligation` | subordinate audit catalog entry | consumed by method trace and review only | maps Python reference assets to TypeScript proof refs |
| installed root qualification outcome | already completed upstream | consumed as upstream truth, not owned here | must already be passed before portfolio qualification |

## First-Slice Rules

- installed live-portfolio qualification must consume completed installed-root
  qualification as upstream truth
- portfolio qualification must require all still-relevant Python live scenario
  families
- each scenario result must carry explicit scenario authority refs
- each scenario result must preserve exact mode, stage identity, edge identity,
  asset handle, and assessment ids from `M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS`
- each scenario result must prove canonical runtime-event evidence:
  `basis_admitted`, `fp_dispatch_requested`, and `assessed`
- each scenario result must end in `runStatus = assessed`

## Promotion Rule

No subordinate carrier above may be promoted to a new top-level peer unless:

1. reuse across a separate module boundary is demonstrated,
2. the new public/top-level role is declared here first, and
3. the promotion is recorded here and in `T-031` before code lands.
