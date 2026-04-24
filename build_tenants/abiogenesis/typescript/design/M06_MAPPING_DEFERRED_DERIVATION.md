# M06 Mapping Deferred Derivation

**Status**: Completed
**Date**: 2026-04-24
**Purpose**: Derive the TypeScript `M06-mapping-deferred` boundary from shared
module law and the released Python line so dormant alternate-runtime mapping
stays explicit and cannot open accidentally through local implementation drift.

## 1. Source Material

This boundary derives from:

- `build_tenants/common/design/modules/M06-mapping-deferred.yml`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/abiogenesis/python/design/README.md`
- `build_tenants/abiogenesis/python/design/ABG_3_MODULE_DESIGN.md`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`
- `build_tenants/abiogenesis/typescript/design/PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md`
- `.ai-workspace/tickets/completed/T-023-adjudicate-typescript-m06-mapping-deferred-trigger-boundary-under-explicit-deferred-only-law.md`

## 2. Position

The TypeScript tenant does not currently have an alternate runtime family.

Current truth remains:

- `M03-engine-kernel` is the canonical ABG engine
- `M04-app-bootstrap` is the canonical public and delivery-facing shell
- `M05-qualification-scenarios` proves the canonical line

`M06` therefore remains dormant.
It exists only as an explicit trigger boundary for a future alternate runtime
family that is materially different from the canonical ABG line.

## 3. Preserved Truth

This deferred boundary preserves these truths from the shared and Python lines:

- canonical ABG materialization, evaluator-bundle derivation, and provenance
  stay owned by `M03-engine-kernel`
- GTL language truth does not move into an alternate mapping family
- no shipping-line tests or implementation surfaces exist until an alternate
  runtime family is intentionally activated

## 4. Demoted Detail

The TypeScript line intentionally keeps these out of scope while `M06` is
dormant:

- speculative mapping adapters
- alternate backend bridges
- “just in case” capability abstractions
- placeholder runtime code or tests

Those are not lawful precursors to `M06`.

## 5. Activation Trigger

`M06` may open only when all of the following are true:

1. one named alternate runtime family is intentionally activated for the
   TypeScript tenant,
2. the need cannot be satisfied by a lawful extension to canonical `M03`,
   `M04`, or `M05`,
3. a successor ticket declares the alternate runtime family explicitly and
   supersedes `T-023`, and
4. the successor lands an `M06` derivation asset, trigger IACS, structural
   carrier diagram, and module-derived proof lanes before code.

## 6. TypeScript Consequence

While those triggers are absent:

- no `code/src/**/mapping/**` runtime family may open for `M06`
- no `test_env/tests/test_m06*` lane may exist
- `M06` remains a documented dormant boundary only

## 7. Required Assets

The dormant `M06` line is closure-ready only when this derivation is paired
with:

- `M06_MAPPING_DEFERRED_TRIGGER_IACS.md`
- `M06_MAPPING_DEFERRED_STRUCTURAL_CARRIER_DIAGRAM.md`

Those assets make the dormancy condition inspectable and prevent silent future
activation.
