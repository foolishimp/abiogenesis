# T-241 - Reprice Exact I4 Bootstrap Compatibility Profile

- id: T-241
- title: Reprice exact I4 bootstrap compatibility profile
- type: requirements
- ticket_category: ordinary
- status: completed
- closed_at: 2026-07-11
- activated_at: 2026-07-11
- goal: abg-5-0-full-product-delivery
- phase: DS-1F
- priority: high
- change_intent: >-
    Remove the contradiction between the immutable 4.6.0-rc.3 predecessor and
    requirements written for 5.0 catalog-bearing product roots, without
    creating a general legacy-product exemption.
- change_class: requirement_reprice
- re_entry_point: specification/requirements/product/REQ-P-INSTALL.md
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-224
- affected_boundary: exact P4/I4 bootstrap selection versus 5.0 installed public-contract conformance
- dependencies:
  - T-221
  - T-223
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - .ai-workspace/tickets/completed/T-221-close-exact-4-6-prior-release-boundary.md
  - .ai-workspace/tickets/active/T-224-design-self-build-program-carrier.md

## Target Truth

Exact P4/I4 remains the immutable 4.6.0-rc.3 predecessor. It may be selected
only for the B5 stage-one bootstrap through its exact package, tarball,
installed-manifest, public Module, and public start identities. It is not and
does not become a 5.0 catalog-bearing product. ABIogenesis 5.0 and later product
roots remain fail-closed on the full public-contract catalog requirement.

## Required Work

1. Scope the 5.0 public-contract bootstrap requirement to products claiming
   conformance to that product line rather than retroactively to every prior
   released product.
2. Add one closed exact-bootstrap-predecessor install profile bound to the
   identities ratified by T-221 and SELFHOSTING-004.
3. Define B5 as a specialized serialized GTL Module so exact I4 can admit the
   same declaration bytes through its released public Module/start contract.
4. State that only the 5.0 leg additionally uses the 5.0 catalog/SDK contract;
   no facade, mutable patch, or inferred capability may make I4 appear to
   implement it.
5. Rebind T-224 to the repriced requirements before design closes.

## Closure Law

Close when INSTALL, PUBLIC-CONTRACTS, and SELFHOSTING state one non-
contradictory exact-I4 path, preserve full 5.0 fail-closed catalog law, and
leave T-224 able to define the carrier without mutating I4 or inventing a
compatibility controller.

## Non-Closure Conditions

- Any product other than exact T-221 P4/I4 inherits the predecessor profile.
- I4 is described as a conformant 5.0 product or as exposing DS-1 SDK/CLI
  operations.
- Package presence substitutes for exact tarball and installed-manifest truth.
- B5 becomes an executable wrapper, compiler, runtime, or second controller.
- Requirement truth is weakened merely to make a test pass.

## Proof Surface

- exact T-221 identity comparison
- exact I4 package/export and installed-manifest inventory
- requirement cross-reference review
- T-224 feasibility re-entry review
- `git diff --check`

## Execution Record

- Verified exact P4/I4 against T-221: package
  `@abiogenesis/typescript-tenant@4.6.0-rc.3`, tarball SHA-256
  `9cffb372c0dfc00983a5d0e882efbc3d0c3ac937a56f313000f35a4473358113`,
  and installed-manifest SHA-256
  `92b3f94dd32bca9368a9511d823cc8b6e2eae75cd7168c9e901d3cbe8eadf07d`.
- Verified the immutable I4 package publishes the public GTL Module,
  StartIntent, execution-basis/event, and callable-start contracts but no 5.0
  public contract catalog, SDK, `abg.cli`, or DS-1 operation set.
- Scoped PUBLIC-CONTRACTS-001 and INSTALL-008A to products claiming 5.0-or-
  later conformance and added one identity-closed INSTALL-008B predecessor
  profile. No other legacy product inherits it.
- Repriced SELFHOSTING-006/007/013 so B5 is a specialized serialized GTL
  Module, exact I4 admits its frozen bytes through released public contracts,
  and only the 5.0 leg additionally uses the catalog/SDK contract.
- Updated GOAL-035's present-tense DS-1F owner chain without changing the goal
  or accepted product scope.
- Independent requirement review verified the exact identities and public
  exports. Its one finding was repaired: the catalog exception no longer says
  it exclusively governs I4, so every other applicable install/binding law
  remains effective.
- `git diff --check`, requirement-identity uniqueness, exact checksum, and
  cross-reference checks pass.

## Closure Disposition

T-241 is complete. Exact I4 is a closed bootstrap-predecessor profile, not a
5.0 catalog product. Full 5.0 contract-catalog admission remains fail-closed.
T-224 may design one immutable B5 Module with separate existing I4 and 5.0
ingress profiles and no compatibility facade.
