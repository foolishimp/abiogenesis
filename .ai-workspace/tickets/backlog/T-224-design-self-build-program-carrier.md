# T-224 - Design The Self-Build Program Carrier

- id: T-224
- title: Design the self-build program carrier
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-1F
- priority: high
- change_intent: >-
    Define the bounded B5 declaration/data carrier that both the installed
    4.6.0-rc.3 predecessor and the future 5.0 candidate can admit and invoke.
- change_class: design_reframe
- re_entry_point: build_tenants/abiogenesis/typescript/design
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: M02 B5 publication and exact I4/I1 public catalog/start compatibility consumed by M03
- dependencies:
  - T-223
- authority_refs:
  - specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md

## Target Truth

`B5` is one immutable `self_build_program_manifest`, not a new compiler or
controller. It carries schema version, identity, version, digest, GTL Module
and GraphFunction refs, compatibility with exact P4/I4 and the 5.0 candidate
line, an S5 input-root contract, declared result/equivalence surfaces, and
required plugin/capability refs. It enters through the same installed catalog
and public invocation boundary as any other GraphFunction.

## Required Work

1. Define B5 identity, version, digest, compatibility, input, output, and error
   carriers under public contract row `abg.schema.self-build-program-manifest`.
2. Define the exact P4/I4 and future-I1 common contract subset.
3. Inventory the exact immutable I4 exported/public API and prove every
   stage-one B5 operation is reachable there; no new DS-1-only facade may be
   assumed to exist in P4/I4.
4. Define source isolation: S5 is immutable job input and never executable runtime fallback.
5. Define the bounded fixture action that demonstrates P4/I4 admission before full self-build work.
6. Define how the unchanged B5 identity is proven across both bootstrap stages.
7. Define B5's native/schema locators, authority refs, capability identities,
   version, and digest row in the cumulative public contract catalog.
8. Publish the design/IACS/carrier and feasibility proof contract.

## Closure Law

Close when T-225 can construct the exact B5 manifest and prove P4/I4
parse-bind-list-start feasibility without inventing private runtime shims or
depending on unfinished 5.0 behavior.

## Non-Closure Conditions

- B5 embeds executable ABG runtime or provider code from S5.
- P4/I4 is required to understand the complete future 5.0/G5 product.
- B5 compatibility does not explicitly cover both runtime lines.
- odd_glc becomes bootstrap compiler substrate.
- Equivalence meaning or deterministic/nondeterministic surfaces remain implicit.

## Proof Surface

- `git diff --check`
- exact carrier and compatibility review
- P4/I4 API reachability walk
- source-isolation threat-to-supported-path review
- phase-end authority/design self-review
