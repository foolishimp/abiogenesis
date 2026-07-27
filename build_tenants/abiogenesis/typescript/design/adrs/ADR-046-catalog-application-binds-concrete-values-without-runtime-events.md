# ADR-046 - Catalog application binds concrete values without runtime events

**Status**: Proposed for the T-270 S05 repair cut

**Date**: 2026-07-27

**Owner**: T-270

## Context

Catalog rows describe reusable contribution kinds. Presence cannot authorize a
particular downstream subject, profile, policy, node type, or overlay.
`REQ-P-CATALOG-030` also forbids node-type and overlay application from
emitting a runtime event. The previous generic artifact-boundary projection
could admit a caller-authored digest and append an event without proving the
concrete value or its contributor.

## Decision

ABIogenesis retains one catalog.

- A selected row URI identifies the contribution category.
- Its applied child URI derives from the canonical digest of one concrete value.
- The row-owning installed Product validates that value under the row contract
  and derives its value reference and Program memberships.
- The contributor is either the admitted workspace actor or one exact Product
  in the resolved lock; application preserves that contributor's provenance.
- A node-type value carries no Program membership.
- An overlay value binds the exact published Program composition it modifies.
- The canonical Consensus disagreement rule needs no overlay. An alternative
  ruling exists only when its concrete overlay is applied.
- ABG verifies and admits the operation-local application carrier without
  appending a runtime or generic artifact event.

URI hierarchy is identity composition, not a second registry, resolver, or
inheritance mechanism. Catalog row selection remains exact.

## Rejected Alternatives

- a Consensus-specific catalog or policy registry;
- a caller-supplied value reference and digest without the value preimage;
- copying category-row ownership onto a downstream value;
- mandatory overlays that make the canonical rule unreachable;
- empty overlay Program membership; and
- `public_operation_artifact_admitted` or a catalog-specific runtime event for
  `catalog.apply`.

## Consequence

`catalog.apply` is a write operation with no runtime event. Its admitted carrier
is valid only inside the operation context that owns the exact CatalogView,
workspace binding, resolved lock, installed Product semantics, value, and
contributor basis. Later invocation may consume that exact carrier; mere row
presence or an unproven digest cannot control traversal.
