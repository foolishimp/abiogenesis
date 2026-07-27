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
- The caller's contributor reference is a proposal, not provenance. A host
  value is attributed only to the exact admitted workspace actor under the
  trusted-developer authority basis. A Product value is attributed only when
  the exact loaded row-owning Product semantics provider returns its own
  contributor identity and attestation reference for that concrete value.
  Application records which authority relation supplied the attribution and
  cannot attribute the value to an unrelated locked Product.
- `catalog.apply` has exactly the `node_type` and `overlay` variants.
- A node-type row and value carry no callable Program membership. Its
  application separately binds the reusable type to one exact validated node
  or Program target ref and digest from the admitted publication.
- An overlay value binds the exact published Program composition it modifies.
- Before Product validation, ABG supplies one opaque candidate-scope identity
  owned by the exact event-store operation context. Product validation seals
  that scope together with the exact install, publication, row, value,
  membership, target, and contributor basis in a branded application
  candidate. ABG consumes the candidate once. Structural similarity, another
  store, or a second admission cannot mint or reuse that authority.
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
- treating a caller-supplied Product label as Product contributor attestation;
- attributing one Product's value to an unrelated locked Product;
- a node-type application without an admitted node or Program target;
- mandatory overlays that make the canonical rule unreachable;
- empty overlay Program membership; and
- `public_operation_artifact_admitted` or a catalog-specific runtime event for
  `catalog.apply`.

## Consequence

`catalog.apply` is a write operation with no runtime event. Its candidate and
admitted carrier are valid only inside the exact ABG event-store operation
context that owns the CatalogView, workspace binding, resolved lock, installed
Product semantics, value, target, and contributor basis. Candidate admission is
one-shot. Closing or replacing that context revokes pending candidates and
admitted applications; mirrored event history and structurally equal carriers
cannot cross to another store. Later invocation may consume the admitted
carrier before expiry; mere row presence, an unproven digest, or a contributor
label cannot control traversal.
