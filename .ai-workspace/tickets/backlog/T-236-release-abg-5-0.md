# T-236 - Release ABG 5.0

- id: T-236
- title: Release ABG 5.0
- type: chore
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-8
- priority: high
- change_intent: >-
    Tap the accepted T-240 RC lineage as ABG 5.0, reconcile the version and
    release-asset delta, and verify the immutable final product remotely.
- change_class: realization_refactor
- re_entry_point: release_snapshots
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: ABG release snapshot, package, Git branch/tag, remote publication, and installed release identity
- dependencies:
  - T-240
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-QUAL.md
  - specification/requirements/product/REQ-P-SCENARIOS.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/RELEASE_METHOD.md
- target_version: 5.0.0
- target_package: '@abiogenesis/typescript-tenant@5.0.0'

## Target Truth

The ABG 5.0 branch, annotated tag, release tarball, package identity, product
manifest, release snapshot, checksums, notes, installed identity, and proof
manifest identify one tapped cut descended coherently from the accepted T-240
RC. Version and release-scoped asset changes are explicit; product behavior,
declarations, public contracts, and dependencies are unchanged. This identity is
the immutable ABG dependency consumed by odd_glc T-037 and T-237.

## Ordered Release Work

1. Verify T-240 green, accepted RC identity, operator review, and coherent RC lineage.
2. Tap `5.0.0`; update only version and release-scoped assets and reconcile the
   final delta. Any behavioral change reopens the RC window.
3. Pack and inspect final `5.0.0`; fresh-install only that artifact and rerun
   deterministic, identity, Hello World, and primary operator-loop gates affected by the delta.
   Resolve and bind the frozen G5 source candidate under final ABG version/digest
   and rerun the bounded affected data-mapper compatibility smoke before tag.
4. Commit release assets and create the ABG release commit and annotated tag.
5. Push the release branch and tag and verify remote object identities.
6. Reconcile package, manifests, checksums, notes, branch, tag, and installed identity.
7. Record a later main-only closure commit only if immutable tag self-reference is impossible.

## Closure Law

Close when remote branch, annotated tag, package, product, snapshot, checksum,
and installed identities match the tapped `5.0.0` cut; its lineage and allowed
delta from the accepted T-240 RC are reconciled; and every ABG 5.0 public
release claim is backed by the immutable release record.

## Non-Closure Conditions

- Product behavior, declarations, public contracts, or dependencies differ from the accepted T-240 RC.
- A failed gate is bypassed or rerun against modified code without reopening upstream phases.
- G5 is bundled into ABG or treated as self-host compiler substrate.
- Local tags or artifacts are claimed as published without remote verification.

## Proof Surface

- package dry-run and closed file census
- fresh installed exact-artifact smoke and operator loop
- annotated tag and remote branch object verification
- release snapshot and checksum validation
- frozen G5 descriptor/binding and affected installed campaign compatibility
- phase-end release/code review against T-218, PRODUCT, RELEASE_METHOD, T-235, and T-240
