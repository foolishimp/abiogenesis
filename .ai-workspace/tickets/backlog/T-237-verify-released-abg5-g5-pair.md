# T-237 - Verify The Released ABG 5 And G5 Pair

- id: T-237
- title: Verify the released ABG 5 and G5 pair
- type: chore
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-8
- priority: high
- change_intent: >-
    Install the independently released ABG 5.0 and G5 products together and
    verify their exact compatibility, catalog binding, and bounded released-pair proof.
- change_class: realization_refactor
- re_entry_point: release_snapshots
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: public multi-product install/binding and released-pair verification over immutable remote products
- dependencies:
  - T-236
  - T-240
  - odd_glc T-037
  - odd_glc T-039
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-QUAL.md
  - /Users/jim/src/apps/specification_methodology/specification/standards/RELEASE_METHOD.md
  - .ai-workspace/tickets/backlog/T-238-design-a5r1-release-manifest-read-model.md

## Target Truth

The remote ABG 5.0 release and independently tapped G5 release install from
their immutable artifacts without rebuild or mutable-source fallback. Their
descriptors, dependency lock, manifests, versions, digests, and conformance
identities bind coherently; catalog inspection, Hello World, and the declared
released-pair verification pass.

## Required Work

1. Resolve both released remote refs and artifacts by exact identity and digest.
2. Fresh-install released ABG 5.0 and released G5 without rebuilding either.
3. Bind the pair through the public multi-product contract and verify the lock.
4. Inspect retained catalog rows and invoke the bounded released-pair scenario.
5. Reconcile release notes, manifests, checksums, tags, installs, and proof refs.
6. Append the terminal released-pair result and accepted RC qualification refs
   to the existing A5-R1 release manifest/read model without changing its
   pre-RC source-candidate verdict.

## Closure Law

Close when exact released artifacts bind and verify without source fallback,
all public released-pair claims resolve to immutable evidence, and a phase-end
review confirms no candidate bytes, local shims, or cross-repo authority blur
entered the proof.

## Non-Closure Conditions

- Either product is rebuilt, patched, or imported from mutable source.
- The pair resolves through a different lock or compatibility identity than qualified.
- G5 is represented as ABG compiler/runtime substrate.
- Local tags or artifacts substitute for verified remote release objects.

## Proof Surface

- remote object and checksum verification
- clean released-product install and binding
- released catalog inspection and bounded invocation
- pair manifest/provenance reconciliation
- phase-end release review against T-218, PRODUCT, QUAL, and RELEASE_METHOD
