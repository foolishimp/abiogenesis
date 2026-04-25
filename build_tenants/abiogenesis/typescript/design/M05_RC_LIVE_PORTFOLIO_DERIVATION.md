# M05 RC Live Portfolio Derivation

**Status**: Active
**Date**: 2026-04-24
**Derived from**: `M05_RC_LIVE_UAT_DERIVATION.md`,
`M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md`,
`M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`,
`REQ-P-QUAL.md`, `REQ-P-SCENARIOS.md`, and `T-037`.
**Purpose**: Extend the TypeScript RC live lane from one external-live edge to
the full Python live scenario family set.

## Position

The earlier RC live lane proved one real external F_P traversal:

- `requirements_to_uat`
- `requirements->uat_tests`

That was sufficient to prove the TypeScript transport/result/projection
boundary, but it was not the full Python live scenario portfolio.

The RC live portfolio now carries all five Python live scenario families into
the TypeScript external-live gate:

- `requirements_to_uat`
- `intent_to_requirements`
- `gsdlc_lite_requirements_design_code`
- `gsdlc_lite_design_review`
- `gsdlc_lite_zoom_design`

## Repriced Boundary

The Python live tests ask the worker to mutate sandbox files and then run
Python deterministic checks over those files.

The TypeScript product boundary is different. The current TypeScript live gate
asks the configured worker to return result-artifact truth for each declared
stage. That result is then admitted through the TypeScript transport/result
artifact protocol, assessed through `resultAssessment`, and projected through
`projectLiveStatus`.

This is a port of the live scenario families and external F_P stage breadth,
not a clone of Python's file-writing harness mechanics.

This RC live lane does not introduce a new typed module boundary. It reuses the
completed `M05` installed live-portfolio boundary declared by:

- `M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_LIVE_PORTFOLIO_STRUCTURAL_CARRIER_DIAGRAM.md`

The single source of scenario-family truth is the exported
`M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS` catalog. The installed deterministic
portfolio lane and this RC external-live lane must both consume that catalog;
neither lane may carry its own driftable scenario list.

## Required Portfolio

The portfolio has five scenarios and twelve external-live stages:

- `requirements_to_uat`: one asset-addressed stage
- `intent_to_requirements`: one graph-function stage
- `gsdlc_lite_requirements_design_code`: two staged-chain stages
- `gsdlc_lite_design_review`: three review-chain stages, including three
  design-review fulfillment assessments on the review stage
- `gsdlc_lite_zoom_design`: five zoom-chain stages

Every stage must:

- derive a TypeScript `DispatchRequest` from the installed package surface
- invoke a real configured F_P transport
- receive a worker-authored result artifact
- admit that artifact without identity gaps
- preserve the exact stage edge and assessment ids declared in
  `M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS`
- produce accepted result assessment
- project final status as `assessed`
- archive dispatch, prompt, raw response, result artifact, assessment, and
  projection evidence

## Command

The authoritative RC live command is:

- `npm run test:live`

That command is a required live gate. It must fail when the live environment or
configured backend is unavailable. Skipping is not a valid closure outcome for
this RC command.

The old single-edge RC live UAT lane remains directly runnable as:

- `npm run test:live:uat`

The live portfolio is excluded from `npm run test:semantic` because it depends
on a real configured F_P transport, but exclusion from semantic tests does not
make the RC live gate optional for RC closure.
