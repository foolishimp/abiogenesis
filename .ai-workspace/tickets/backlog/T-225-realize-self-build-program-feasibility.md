# T-225 - Realize Self-Build Program Feasibility

- id: T-225
- title: Realize self-build program feasibility
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-1F
- priority: high
- change_intent: >-
    Freeze B5 and prove exact installed P4/I4 can admit and start it through the
    public installed catalog path against a bounded fixture input.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-224
- build_tenant: typescript
- admission_condition: T-224 is completed and its design is current
- affected_boundary: exact I4 public catalog/start compatibility with the immutable B5 declaration carrier
- module_owners: M02 B5 publication, M03 exact-I4 start/runtime consumption, and M05 feasibility proof
- dependencies:
  - T-224
  - exact T-221 P4/I4 evidence
- authority_refs:
  - specification/requirements/abg/REQ-R-ABG3-SELFHOSTING.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - .ai-workspace/tickets/backlog/T-224-design-self-build-program-carrier.md

## Target Truth

In a fresh clean workspace, exact I4 installs and binds an immutable B5
manifest, lists its GraphFunction, starts it against a bounded fixture root,
and produces one known declared artifact without mutable S5 imports or private
shims. The exact manifest digest becomes the input to DS-5.

## Required Work

1. Materialize and checksum B5 exactly as designed, publish its exact public-
   contract-catalog row, and verify the schema/native locators and digest.
2. Select exact P4/I4 by T-221 package, tarball, and product-manifest identity.
3. Exercise only the exact I4 public exports admitted by T-224; do not route
   through a facade that exists only in the 5.0 development line.
4. Assert input-root confinement and absence of executable source fallback at
   the supported-path boundary.
5. Record the exact output and replay evidence consumed by DS-5.

## Closure Law

Close only on a source-blind fresh-workspace proof that exact I4 admits the
frozen B5 carrier and produces the known artifact, with exact identities and
replay evidence recorded for later use.

## Non-Closure Conditions

- A current source checkout, private import, compatibility patch, or test-only
  controller participates in execution.
- B5 changes after the proof without invalidating this closure.
- The proof claims full self-hosting or C1/C2 equivalence.

## Proof Surface

- B5 schema/type/admission tests
- clean I4 install and binding record
- public catalog list/start fixture proof
- exact output and replay digest record
- phase-end code review against T-224, T-218, PRODUCT, and SELFHOSTING
