# T-228 - Realize Non-Callable Catalog Kind Semantics

- id: T-228
- title: Realize non-callable catalog kind semantics
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-2
- priority: high
- change_intent: >-
    Implement the narrowed T-179 design for kind-specific public description
    and ABG-owned application of retained `node_type` and `overlay` catalog contributions.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-179
- build_tenant: typescript
- admission_condition: T-179 is completed and its narrowed design is current
- affected_boundary: kind-specific node_type/overlay description and ABG-owned application below generic catalog reads
- module_owners: M02 kind publication, M03 admission/application, M04 public description, and M05 installed proof
- dependencies:
  - T-179
  - T-227
- authority_refs:
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/gtl/REQ-L-GTL3-NODE.md
  - specification/requirements/gtl/REQ-L-GTL3-LANGUAGE-CAPABILITY-MODEL.md
  - .ai-workspace/tickets/active/T-179-design-non-graph-registry-entry-runtime-semantics.md

## Target Truth

Installed catalog consumers already receive generic row metadata through
T-223. This leaf adds kind-specific description of `node_type` and `overlay`
meaning. ABG applies them only at their typed owning admission/startup boundary;
neither kind becomes a GraphFunction invocation candidate, and no downstream
loader or registry gains runtime authority.

## Required Work

1. Implement the exact kind-specific public descriptions and typed internal
   application APIs from T-179 without duplicating T-223 generic row projection.
2. Preserve GraphFunction-only callable selection mechanically.
3. Publish the exact node-type and overlay description/application native and
   canonical schema rows, capability identities, versions, locators, and
   digests in the cumulative product contract catalog.
4. Prove installed consumers resolve those rows and reject stale, missing, or
   digest-mismatched kind contracts.
5. Prove installed contribution admission and application with publisher-neutral fixtures.
6. Prove product-local activation, CLI invocation, and GraphFunction selection all refuse.
7. Supply the contract needed by odd_glc T-033 without importing odd_glc domain law.

## Closure Law

Close when both retained non-callable kinds are source-blind inspectable and
ABG-owned application is proven through the designed boundary, with negative
proof that neither is callable or product-locally activated, and the exact
public contract/capability rows resolve from the installed product catalog.

## Non-Closure Conditions

- Other registry kinds enter public 5.0 scope.
- odd_glc vocabulary or policy becomes ABG law.
- Catalog presence activates an entry.
- A CLI, SDK, or product-local loader applies runtime truth directly.

## Proof Surface

- focused catalog-kind admission/projection/application tests
- callable-selection negative differential
- installed publisher-neutral fixture
- full relevant registry/runtime gates
- phase-end code review against T-179, T-218, PRODUCT, and ODD ownership axioms
