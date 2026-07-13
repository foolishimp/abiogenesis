# T-268 - Publish Consensus Tenant Capability Profile

- id: T-268
- status: backlog
- phase_status: deferred_to_ds4
- review_status: design_required
- delivery_phase: DS-4
- change_class: design_reframe
- owner: abiogenesis
- build_tenant: typescript
- priority: critical
- source_ticket: T-252
- dependency: T-255 exact capability-profile admission contract
- authority_refs:
  - specification/requirements/mapping/REQ-M-GTL3-CAPABILITY.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/GOALS.md DS-4
- design_input_ref: build_tenants/abiogenesis/typescript/design/M03_COMPILED_EXECUTION_HANDOFF_BEHAVIOR_DESIGN.md

## Boundary

Publish the exact versioned Consensus tenant capability profile required by
DS-4. The profile binds its schema, manifest, engine, and public-contract-catalog
identities and digests; publishes exact capability claims and dependencies; and
maps every Consensus GraphFunction effect ref to one supported public capability
identity. It also publishes the carrier classifications, applicable conformance
rule identities, causal predecessor refs, and owning bounded-proof refs required
by `REQ-M-GTL3-CAPABILITY-010..015`.

T-268 publishes profile truth. T-255 admits that profile and decides
effect-to-capability compatibility. T-268 does not self-admit the profile and
does not own handoff acceptance.

## Deferred Gap Ownership

- gap_family: tenant_capability_profile_missing

This family becomes an active T-252 compiler gap only when T-255 replaces its
current false deferred acceptance with a typed capability block. Promote this
ticket to active before that regenerated census is admitted.

## Entry And Exit

Enter during DS-4 after the Consensus public schemas and public contract catalog
are stable enough to supply exact identity/version/digest rows. Accept a
three-view design before code. Exit requires the published profile to pass the
T-255 admission function, cover every exact T-264 effect requirement through
catalog-resolved capabilities, preserve dependent-capability closure, and make
the otherwise eligible T-252 handoffs compatible without changing body bytes.
Release qualification must resolve the profile's required bounded-proof refs;
T-268 may not convert their presence into fabricated proof success.

## Non-Closure

Package presence, plugin refs, test names, source paths, unversioned feature
labels, a locally minted catalog, a profile that omits dependency closure, or a
profile that admits itself.
