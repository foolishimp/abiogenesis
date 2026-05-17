# M03 Construction Pressure Package Derivation

**Status**: Active
**Date**: 2026-05-16
**Ticket**: T-139
**Purpose**: Materialize the ABG substrate carrier that gives mixed F_P plus
deterministic follow-up construction the current evaluated pressure package.

## Source Authority

- `specification/PRODUCT.md`
- `specification/requirements/abg/REQ-R-ABG3-FP-CONSCIOUSNESS.md`
- `specification/requirements/abg/REQ-R-ABG3-PROJECTION.md`
- `specification/requirements/abg/REQ-R-ABG3-PAYLOAD.md`
- `specification/requirements/gtl/REQ-L-GTL3-HOOKS.md`
- `build_tenants/abiogenesis/typescript/design/M03_CONSTRUCTION_INTENT_RUNNER_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_OBSERVED_STATE_ADMISSION_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_OVERLAY_FRAME_CONTRACT_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_FD_AUTHORITY_PLACEMENT_DERIVATION.md`
- [T-139](../../../../.ai-workspace/tickets/active/T-139-materialize-construction-pressure-package-for-mixed-fp-and-deterministic-follow-up.md)

## Problem

The Python SDLC reference carried load-bearing construction context in a
manifest before the next worker pass: current workspace state, failing or
unproven evaluator output, obligation policy, target state, prior evidence, and
result path. That behavior was useful. The product-local outer loop that
assembled it was the wrong owner.

ABG needs one replay-visible carrier for this context. Without it, products
rebuild pressure in prompt text, gaps controllers, or installed operators. That
recreates controller-side authority and lets pressure disappear when a
projection says closed without evidence that the selected obligation was
actually cleared.

## Decision

ABG materializes `ConstructionPressurePackage` before graph action invocation.
The package is derived only from admitted or projected runtime truth:

- construction observation snapshot;
- admitted construction intent;
- action catalog;
- current construction projection;
- runtime aggregate projection, including observed state and overlay frames;
- F_D authority outcomes admitted into the event spine;
- product-supplied prior evidence and obligation policy refs.

The construction runner emits
`construction_pressure_package_materialized` before
`construction_graph_action_invoked`, passes the structured package through
`EnginePluginInput`, and then folds pressure survival from replay. Prompt
rendering remains outside ABG; consumers may render the package, but the package
is the substrate truth.

Pressure clearing is conservative. A package opens pressure refs. A later
`construction_delta_observed` for the same selected intent clears those pressure
refs only when the delta is closed and carries new evidence refs. Lawful
re-entry, reprice, or no-close policy can preserve pressure, but prompt text
cannot clear it.

## Contract

```ts
interface ConstructionPressureInputBasis {
  kind: "construction_pressure_input_basis";
  episodeId: string;
  observationId: string;
  basisRef: string;
  constructionProjectionRef: string;
  runtimeProjectionRef: string;
  overlayFrameProjectionRef: string;
  selectedIntentId: string;
  selectedActionRef: string;
  selectedOutcomeRef: string;
  executionTargetRef: string;
  observedStateRefs: readonly string[];
  fdOutcomeRefs: readonly string[];
  overlayFrameRefs: readonly string[];
  targetStateRefs: readonly string[];
  priorEvidenceRefs: readonly string[];
  obligationPolicyRefs: readonly string[];
}

interface ConstructionPressureRef {
  kind: "construction_pressure_ref";
  pressureRef: string;
  pressureKind: ConstructionPressureKind;
  sourceRef: string;
  targetOutcomeRefs: readonly string[];
  evidenceRefs: readonly string[];
  authorityRefs: readonly string[];
}

interface ConstructionPressurePackage {
  kind: "construction_pressure_package";
  packageRef: string;
  packageDigest: string;
  inputBasis: ConstructionPressureInputBasis;
  pressureRefs: readonly ConstructionPressureRef[];
  clearanceEvidence: readonly ConstructionPressureClearanceEvidence[];
}
```

Runtime event:

- `construction_pressure_package_materialized`

Projection:

- `ConstructionPressureProjection`

Runner boundary:

- `EnginePluginInput.constructionPressurePackage`
- `EnginePluginInput.constructionPressurePackageRef`
- `EnginePluginInput.constructionPressureRefs`

## Test35 Mapping

| Python/test35 manifest role | ABG pressure package field |
| --- | --- |
| current workspace/register state | `observedStateRefs` |
| failing or unproven evaluator output | `fdOutcomeRefs`, `priorEvidenceRefs`, `pressureRefs` |
| obligation policy | `obligationPolicyRefs` |
| target asset/result state | `targetStateRefs`, `selectedOutcomeRef` |
| selected next action | `selectedActionRef`, `executionTargetRef` |
| prior execution/evidence | `priorEvidenceRefs` |
| pressure that must survive | `pressureRefs`, `ConstructionPressureProjection.openPressureRefs` |

The mapping preserves behavior, not Python procedure shape. The ABG runtime is
the single loop. The package is admitted context for that loop.

## Closure Rules

- A package without observed-state refs rejects.
- A package without pressure refs rejects.
- Package identity is the digest of the input basis, pressure refs, and
  clearance evidence.
- The runner must pass the package as structured data to F_P, not only as
  rendered text.
- Pressure remains open until closed construction delta evidence clears the
  selected intent's package pressure.
- Products must not reconstruct the package from private controller reads.

## Implementation Map

- `code/src/abg/m03/contracts/construction_pressure_package.ts` owns the
  carrier, constructor, admission, materialized event constructor, and pressure
  projection.
- `code/src/abg/m03/contracts/construction_observation.ts` owns observation
  snapshots, pressure rows, and observation asset refs.
- `code/src/abg/m03/contracts/construction_event_causality.ts` owns
  construction event ordering and causality validation.
- `code/src/abg/m03/contracts/fp_consciousness.ts` remains the construction
  composition surface and compatibility export surface; it is not the pressure
  package semantic center.
- `code/src/abg/m03/contracts/carriers.ts` declares the materialized runtime
  event.
- `code/src/abg/m03/contracts/plugins.ts` extends `EnginePluginInput` with the
  structured pressure package.
- `code/src/abg/m03/runner/construction_runner.ts` materializes and emits the
  package before graph action invocation.
- `test_env/tests/test_t139_construction_pressure_package.test.mjs` proves
  package admission, event admission, open pressure survival, evidence clearing,
  and F_P plugin delivery.

## Non-Goals

This slice does not define product prompt rendering, product semantic
completion, or an SDLC-specific loop. The downstream deletion proof must happen
in the consuming product after this substrate surface is available.
