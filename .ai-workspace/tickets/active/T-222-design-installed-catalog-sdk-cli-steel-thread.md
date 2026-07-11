# T-222 - Design Installed Catalog, SDK, And CLI Steel Thread

- id: T-222
- title: Design installed catalog, SDK, and CLI steel thread
- type: feature
- ticket_category: ordinary
- status: active
- activated_at: 2026-07-11
- admission_condition: satisfied by completed T-219 specification-only walkthrough
- goal: abg-5-0-full-product-delivery
- phase: DS-1
- priority: high
- change_intent: >-
    Define the smallest source-independent product, contribution, install,
    catalog, public SDK, and thin CLI boundary needed to invoke one published
    Hello World GraphFunction from an exact installed product.
- change_class: design_reframe
- re_entry_point: build_tenants/common/design/modules/M02-work-publication.yml
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-218
- build_tenant: typescript
- affected_boundary: M02 product publication and M04 install/public SDK/CLI over reused M03 catalog/runtime authority
- dependencies:
  - T-218 target admission completed
  - T-219 specification reconciliation completed
- authority_refs:
  - specification/PRODUCT.md
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - specification/requirements/gtl/REQ-L-GTL3-MODULE.md
  - specification/requirements/gtl/REQ-L-GTL3-GRAPHFUNCTION.md
  - build_tenants/common/design/modules/M02-work-publication.yml
  - build_tenants/common/design/modules/M03-engine-kernel.yml
  - build_tenants/common/design/modules/M04-app-bootstrap.yml

## Target Truth

One minimal design extends the existing M02 publication, M03 runtime registry,
and M04 install/bootstrap surfaces with no rival loader or controller. It names:

- an immutable product descriptor and contribution manifest;
- the bootstrap `product-toolchain-manifest.json` public-contract-catalog carrier;
- source-blind workspace create/open carriers;
- exact artifact identity, version, digest, dependency, and compatibility;
- install and workspace binding of ABG plus catalog products;
- admission of retained `graph_function`, `node_type`, and `overlay` rows;
- a tenant-neutral catalog SDK for explicit admit, list, describe, allow,
  invoke, result, and replay;
- one host-neutral invocation descriptor shared by native, CLI, and host adapters;
- `abg.cli` as a thin adapter over that SDK; and
- a publisher-authored Hello World fixture product used only as contract proof.

Only `graph_function` is callable. M03 continues to own selection, GraphCall,
traversal, event, result, and replay truth.

DS-1 list and describe expose the generic catalog row contract: canonical
identity, kind, owner, exact product/descriptor/contribution/lock identities,
compatibility, readiness, eligibility, callability, session visibility, and
provenance. T-179 owns kind-specific `node_type` and `overlay` meaning and
application; DS-1 does not pre-empt that design.

## Required Work

1. Reuse-map the current M02 serialized-module admission, M03 runtime catalog,
   M04 installer/workspace binding, public start, result, and replay carriers.
2. Define distinct source-blind workspace create/open inputs, results, and
   errors without combining install, bind, catalog admission, or project scaffolding.
3. Define the missing product-artifact intake, contribution manifest, immutable
   resolved-lock carrier, and distinct resolved, verified, installed, bound,
   admitted, ready, session-visible, eligible, and callable states without
   importing mutable publisher source.
4. Define the public contract catalog bootstrap/schema, row identity and
   locator carriers, digest rules, baseline contract groups, canonical schema
   assets, non-circular canonical digest scopes, product-root-relative path law,
   mandatory GTL/install rows, and cumulative extension/version law for later phases.
5. Define exact SDK request, result, error, provenance, and host-neutral
   invocation-descriptor carriers.
6. Define the explicit binding-to-catalog-admission transition, then generic
   row list/describe versus callable selection semantics and narrowing-only
   session allowlists; leave kind-specific node/overlay
   inspection and application to T-179.
7. Define the CLI-to-SDK mapping and forbid CLI-owned worker or traversal logic.
8. Publish the required target map, IACS, structural carrier diagram, break
   order, mixed-state constraints, and focused proof obligations.

## Closure Law

Close when design names every carrier owner, producer, consumer, side effect,
error family, identity rule, and public boundary required by the DS-1 steel
thread; cites all reused surfaces; and leaves T-223 able to implement without
inventing product, catalog, runtime, or CLI semantics.

## Non-Closure Conditions

- A catalog product is allowed to load executable publisher source or invoke a worker.
- The SDK or CLI emits runtime events, selects private continuation state, or advances traversal.
- Catalog presence grants execution authority.
- A non-GraphFunction row becomes callable.
- The design introduces a hosted registry, signing system, product lifecycle,
  scheduler, second schema service, or hostile-local tamper framework.
- Exact typed inputs, outputs, errors, ownership, or installed proof are absent.

## Proof Surface

- `git diff --check`
- authority-to-design trace review
- carrier/IACS completeness review
- explicit reuse-versus-new inventory
- independent self-review against T-218, PRODUCT, and the proportional defense budget
