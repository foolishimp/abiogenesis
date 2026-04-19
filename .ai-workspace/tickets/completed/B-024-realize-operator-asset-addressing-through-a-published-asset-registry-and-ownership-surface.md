# B-024 Realize Operator Asset Addressing Through A Published Asset Registry And Ownership Surface

- id: B-024
- title: Realize operator asset addressing through a published asset registry and ownership surface
- type: feature
- status: completed
- goal: operator-asset-addressing
- change_intent: Realize the already-ratified operator-facing asset target family through one published asset registry and ownership surface. Operators should be able to target published asset handles from `gen-start`, but only through a published registry and ownership surface that resolves those handles into lawful traversal boundaries.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: high
- intake_source: operator UX direction 2026-04-19 after ABG B-018 review
- dependencies: B-021, B-022
- affected_boundary: product/operator capability definition, asset-addressing model, published asset registry / ownership surfaces, downstream domain contract
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- activated_at: 2026-04-19
- completed_at: 2026-04-19
- updated_at: 2026-04-19
- authoritative_contract: `asset:<published_handle>` resolves only through a published operator asset registry and ownership surface to one governing callable-carrier boundary
- superseded_surface: inferred ownership from local paths, stock-install asset examples with no published registry, and any asset-targeting story without a governing design surface
- closure_law: every published asset handle resolves through the published registry and ownership surface to one governing graph-function carrier or fails closed
- producer_set: `OPERATOR_ASSET_REGISTRY_AND_OWNERSHIP_SURFACE.md`, `runtime_config.operator_asset_contract`, downstream registry command output
- consumer_set: `resolve_start_target(...)`, `gen_start(...)`, CLI target binding, install/docs examples
- derived_projections: normalized asset-target metadata, design index, product/docs examples, target-resolution tests
- old_path_classification: inferred ownership from path lore=`remove`; generic stock-install asset example=`remove`; published registry command=`re-authorize`

## Context

Operators can now say:

- `gen-start --target asset:<handle>`

That is not a small parser tweak. It requires one realized asset-addressing
surface:

- a published registry of addressable assets
- a published ownership / boundary surface that resolves an asset handle into
  the governing traversal boundary

The product and policy surfaces now ratify that public target family. The
remaining work is to publish and enforce the governing design/realization
surface exactly.

## Problem Statement

ABG product truth now ratifies public operator asset addressing, but the live
design/realization cut still has to publish and consume one governing registry
and ownership surface for that target family.

Without that design/realization surface:

- `asset:<handle>` risks collapsing into fuzzy path lore
- ABG would have to guess ownership or boundary semantics it does not own
- downstream domains such as `odd_sdlc` cannot publish reusable asset entry
  points cleanly over one substrate contract

## Required Direction

Realize public operator asset addressing through one published asset registry
and ownership surface above the ABG substrate.

That capability should require:

- a published asset registry of operator-addressable asset handles
- a published ownership / boundary surface that resolves each handle into its
  governing traversal boundary
- fail-closed behavior for unresolved, unowned, or ambiguously owned assets

The initial operator asset family may include:

- document
- code
- ticket / work item
- comment / review
- URI-addressed external or imported asset handles

The important law is not the concrete taxonomy. The important law is that
asset addressing is published and governed, not inferred from local path lore.

## Acceptance

- ABG design/realization surfaces publish one operator asset registry and
  ownership surface for the already-ratified public target family
- operator asset handles resolve only through published registry and ownership
  surfaces
- unresolved, unowned, or ambiguously owned assets fail closed
- downstream domains can supply domain-owned asset registry / ownership truth
  without ABG inventing their semantics
- asset addressing is tracked separately from public graph-function
  addressability and does not hide inside it
