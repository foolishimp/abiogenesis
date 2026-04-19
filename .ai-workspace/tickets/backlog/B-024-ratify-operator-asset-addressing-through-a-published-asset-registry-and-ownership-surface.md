# B-024 Ratify Operator Asset Addressing Through A Published Asset Registry And Ownership Surface

- id: B-024
- title: Ratify operator asset addressing through a published asset registry and ownership surface
- type: feature
- status: backlog
- goal: operator-asset-addressing
- change_intent: Add operator-facing asset addressing as an explicit product capability rather than an implicit tweak to target resolution. Operators should be able to target published asset handles from `gen-start`, but only through a published registry and ownership surface that resolves those handles into lawful traversal boundaries.
- change_class: product_reprice
- re_entry_point: product_definition
- priority: high
- intake_source: operator UX direction 2026-04-19 after ABG B-018 review
- dependencies: B-021, B-022
- affected_boundary: product/operator capability definition, asset-addressing model, published asset registry / ownership surfaces, downstream domain contract
- triaged_at: 2026-04-19
- created_at: 2026-04-19
- updated_at: 2026-04-19

## Context

Operators also want to be able to say:

- `gen-start --target asset:<handle>`

That is not a small parser tweak.

It requires a product-visible asset-addressing capability:

- a published registry of addressable assets
- a published ownership / boundary surface that resolves an asset handle into
  the governing traversal boundary

Current GTL/ABG goals already ratify bind-time asset surfaces and contract
resolution at GTL/ABG boundaries. They do not yet ratify a general public
operator asset-addressing surface.

## Problem Statement

ABG does not yet have ratified product truth for public operator asset
addressing.

Without that product-level capability:

- `asset:<handle>` risks collapsing into fuzzy path lore
- ABG would have to guess ownership or boundary semantics it does not own
- downstream domains such as `odd_sdlc` cannot publish reusable asset entry
  points cleanly over one substrate contract

## Required Direction

Ratify public operator asset addressing as a product capability above the ABG
substrate.

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

- ABG product/operator surfaces ratify asset addressing as a public capability
- operator asset handles resolve only through published registry and ownership
  surfaces
- unresolved, unowned, or ambiguously owned assets fail closed
- downstream domains can supply domain-owned asset registry / ownership truth
  without ABG inventing their semantics
- asset addressing is tracked separately from public graph-function
  addressability and does not hide inside it
