# T-268 - Publish ABG 5 Tenant-Conformance Manifest Consensus Coverage

- id: T-268
- title: Publish ABG 5 tenant-conformance manifest Consensus coverage
- type: feature
- ticket_category: ordinary
- status: active
- phase_status: blocked_by_ds1_ds3_review_remediation
- review_status: design_required
- goal: GOAL-035 stable ABIogenesis 5.0 baseline
- change_intent: >-
    Publish exact canonical ABG 5 capability coverage only after the selected
    Consensus program, traversal contract, public router, and F_H continuation
    path conserve the same admitted truth.
- delivery_phase: DS-4
- change_class: design_reframe
- re_entry_point: >-
    build_tenants/abiogenesis/typescript/design canonical tenant-conformance
    manifest publication boundary
- triaged_at: 2026-07-14
- created_at: 2026-07-13
- updated_at: 2026-07-14
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- source_ticket: T-252
- dependencies:
  - completed T-255 canonical-manifest admission and capability-coverage contract
  - active T-252 topology and exhaustive census repair
  - active T-262 parent-rebind repair
  - active T-267 declared-program conservation repair
  - T-270 public catalog/start integration
  - T-271 complete C-program interpretation
  - T-272 F_H lifecycle integration
- authority_refs:
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/GOALS.md DS-4
- design_input_ref: build_tenants/abiogenesis/typescript/design/M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md

## Boundary

Publish the ABG 5.0 `abg.schema.tenant-conformance-manifest` with exact
Consensus coverage required by DS-4. This extends one canonical engine/build-
tenant manifest; it does not create a Consensus-owned manifest or a second
capability-profile authority.

The canonical manifest binds its schema, manifest, engine, and public-contract-
catalog identities and digests; publishes exact capability claims and
dependencies; and maps every Consensus GraphFunction effect ref to one
supported public capability identity. It also publishes the carrier
classifications, applicable conformance-rule identities, causal predecessor
refs, and owning bounded-proof refs required by
`REQ-M-GTL3-CAPABILITY-010..015`.

T-268 publishes canonical manifest truth. M04 admits that manifest against the
existing public contract catalog. T-255 derives a basis-preserving capability-
coverage projection and decides effect compatibility. T-268 does not self-admit
the manifest and does not own handoff publication or runtime admission.

## T-252 Census Gap Ownership

- gap_family: tenant_conformance_manifest_consensus_coverage_missing

This family is active because T-255 now emits a typed canonical-manifest block
for each effect-bearing Consensus handoff. T-268 owns publication of the
missing canonical manifest coverage; it does not own M04 admission, T-255
projection, or T-267 traversal authority.

## Entry And Exit

Enter during DS-4 after the Consensus public schemas and public contract catalog
are stable enough to supply exact identity/version/digest rows. Accept a
three-view design before code. Exit requires the published ABG 5.0 manifest to
pass M04 canonical admission, cover every exact T-264 effect requirement through
catalog-resolved capabilities, preserve dependent-capability closure, and make
the otherwise eligible T-252 handoffs publishable without changing body bytes.
Those handoffs remain startup-blocked until T-267 independently closes
traversal result-interface and bind-conservation authority. Release
qualification must resolve the manifest's required bounded-proof refs; T-268
may not convert their presence into fabricated proof success.

## Non-Closure

A Consensus-owned manifest, a second tenant capability profile, package
presence, plugin refs, test names, source paths, unversioned feature labels, a
locally minted catalog, a manifest that omits dependency closure, a coverage
projection submitted as authority, a manifest that admits itself, or any claim
that manifest coverage authorizes traversal before T-267.
