# M05 Installed Live Portfolio Derivation

**Status**: Completed
**Date**: 2026-04-24
**Purpose**: Derive the TypeScript `M05` installed live-scenario portfolio from
the released Python sandbox live reference line so the TypeScript tenant proves
the same still-relevant scenario families at equivalent feature breadth over
the installed package surface.

## 1. Source Material

This boundary derives from:

- `build_tenants/abiogenesis/python/test_env/tests/test_sandbox_usecases_live.py`
- `build_tenants/abiogenesis/python/test_env/tests/sandbox_runtime.py`
- `build_tenants/abiogenesis/python/design/SCENARIO_INTENT_TO_TAGGED_REQUIREMENTS.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_REQUIREMENTS_TO_UAT.md`
- `build_tenants/abiogenesis/python/design/SCENARIO_GSDLC_LITE_REQUIREMENTS_DESIGN_CODE.md`
- `build_tenants/abiogenesis/python/design/GSDLC_LITE_QUALIFICATION_LADDER.md`
- `build_tenants/abiogenesis/typescript/design/M05_INSTALLED_SANDBOX_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`
- `.ai-workspace/tickets/completed/T-031-realize-typescript-m05-installed-live-scenario-portfolio-parity-against-the-python-sandbox-live-reference-line.md`

## 2. Position

The current TypeScript line already proves:

- one installed runtime root
- one bounded installed live scenario
- canonical archive finalization and archive qualification

The Python line proves a broader live family:

- `requirements_to_uat`
- `intent_to_requirements`
- `gsdlc_lite_requirements_design_code`
- `gsdlc_lite_design_review`
- `gsdlc_lite_zoom_design`

The TypeScript line therefore needs one explicit installed live-portfolio
boundary inside `M05`, not a larger runtime redesign.

## 3. Preserved Boundary Truth

This slice preserves these Python truths:

- installed live qualification is a scenario portfolio, not one demo path
- each live scenario must map to an explicit scenario authority surface
- the installed package surface must execute the portfolio, not only source-tree
  helpers
- GSDLC-lite breadth includes:
  - one single-edge requirements-to-UAT scenario
  - one single-edge intent-to-requirements scenario
  - one staged requirements-to-design-to-code chain
  - one review-chain scenario with multi-evaluator review breadth
  - one zoom-chain scenario with child-chain breadth and parent fold-back

## 4. Repriced Python Detail

The TypeScript line intentionally reprices these Python mechanics:

- real live-agent subprocess transport
- Python installer and `PYTHONPATH`-shaped hermetic execution
- direct `Traversal` and `CandidateFamily` harness logic in the live tests

Instead, the TypeScript line uses:

- installed Node package-surface scripts
- deterministic scenario profiles over completed `M03` and `M04` boundaries
- explicit installed scenario-result carriers
- explicit portfolio qualification over scenario mode, stage breadth, authority
  refs, event evidence, and final run status

This is a lawful repricing because the feature breadth stays explicit and the
installed line remains the execution surface under test.

## 5. First TypeScript Installed Live-Portfolio Target

This slice should realize only:

- one `InstalledLiveScenarioPortfolioRequest` carrier
- one `InstalledLiveScenarioPortfolioOutcome` family
- one explicit installed scenario-result carrier
- one installed portfolio integration lane over the five Python scenario
  families
- one module-derived unit lane
- one fail-closed negative lane

This slice should **not** widen into:

- reset/postmortem replay
- transport-failure retry
- human-proxy qualification
- new public runtime carriers

## 6. Python-To-TypeScript Mapping

| Python live family | TypeScript target boundary | TypeScript consequence |
| --- | --- | --- |
| `requirements_to_uat` | installed scenario result with `asset_addressed` mode | TypeScript proves one installed asset-addressed single-edge scenario |
| `intent_to_requirements` | installed scenario result with `graph_function` mode | TypeScript proves one installed direct graph-function single-edge scenario |
| `gsdlc_lite_requirements_design_code` | installed scenario result with `staged_chain` mode | TypeScript proves one installed two-stage chain over completed `M04` surfaces |
| `gsdlc_lite_design_review` | installed scenario result with `review_chain` mode | TypeScript proves one installed three-stage chain and review breadth through multi-assessment evidence |
| `gsdlc_lite_zoom_design` | installed scenario result with `zoom_chain` mode | TypeScript proves one installed five-stage zoom/fold-back breadth without reintroducing Python traversal harness ownership |

## 7. Required Assets

This derivation is completed by:

- `M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_LIVE_PORTFOLIO_STRUCTURAL_CARRIER_DIAGRAM.md`
- the installed live-portfolio code boundary under `qualification/m05`
- the `T-031` proof lanes
