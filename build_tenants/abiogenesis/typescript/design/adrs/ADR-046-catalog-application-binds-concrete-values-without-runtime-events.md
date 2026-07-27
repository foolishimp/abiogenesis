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
- The contributor is either the admitted workspace actor or the exact
  row-owning installed Product in the resolved lock; application preserves that
  contributor's provenance and cannot attribute the value to an unrelated
  locked Product.
- `catalog.apply` has exactly the `node_type` and `overlay` variants.
- A node-type row and value carry no callable Program membership. Its
  application separately binds the reusable type to one exact validated node
  or Program target ref and digest from the admitted publication.
- An overlay value binds the exact published Program composition it modifies.
- Product validation seals the exact install, publication, row, value,
  membership, target, and contributor basis in an opaque receipt carried by
  the Product-branded application candidate. Structural similarity cannot mint
  that receipt.
- The canonical Consensus disagreement rule needs no overlay. An alternative
  ruling exists only when its concrete overlay is applied.
- ABG verifies and admits the operation-local application carrier without
  appending a runtime or generic artifact event.

URI hierarchy is identity composition, not a second registry, resolver, or
inheritance mechanism. Catalog row selection remains exact.

## Rejected Alternatives

- a Consensus-specific catalog or policy registry;
- a caller-supplied value reference and digest without the value preimage;
- a structural value or receipt that did not pass the row-owning installed
  Product validator;
- copying category-row ownership onto a downstream value;
- attributing one Product's value to an unrelated locked Product;
- a node-type application without an admitted node or Program target;
- mandatory overlays that make the canonical rule unreachable;
- empty overlay Program membership; and
- `public_operation_artifact_admitted` or a catalog-specific runtime event for
  `catalog.apply`.

## Consequence

`catalog.apply` is a write operation with no runtime event. Its admitted carrier
is valid only inside the exact ABG event-store operation context that owns the
CatalogView, workspace binding, resolved lock, installed Product semantics,
value, target, and contributor basis. Closing or replacing that context revokes
the in-memory application authority; a structurally equal carrier cannot cross
to another store. Later invocation may consume that exact carrier before
expiry; mere row presence or an unproven digest cannot control traversal.
