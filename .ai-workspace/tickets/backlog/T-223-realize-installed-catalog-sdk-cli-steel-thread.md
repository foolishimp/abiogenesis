# T-223 - Realize Installed Catalog, SDK, And CLI Steel Thread

- id: T-223
- title: Realize installed catalog, SDK, and CLI steel thread
- type: feature
- ticket_category: ordinary
- status: backlog
- goal: abg-5-0-full-product-delivery
- phase: DS-1
- priority: high
- change_intent: >-
    Implement the approved DS-1 design as one packed-product Hello World path
    over the existing ABG runtime, then prove its bounded likely failures.
- change_class: realization_refactor
- re_entry_point: build_tenants/abiogenesis/typescript/code
- triaged_at: 2026-07-11
- created_at: 2026-07-11
- updated_at: 2026-07-11
- source_ticket: T-222
- build_tenant: typescript
- admission_condition: T-222 is completed and its design is current
- affected_boundary: M02 publication and M04 install/public SDK/CLI over reused M03 catalog and runtime authority
- dependencies:
  - T-222
- authority_refs:
  - specification/requirements/product/REQ-P-CATALOG.md
  - specification/requirements/product/REQ-P-INSTALL.md
  - specification/requirements/product/REQ-P-POLICY.md
  - specification/requirements/product/REQ-P-PUBLIC-CONTRACTS.md
  - build_tenants/abiogenesis/typescript/design
  - .ai-workspace/tickets/active/T-222-design-installed-catalog-sdk-cli-steel-thread.md

## Target Truth

From a clean workspace created or opened through the public contract, an exact
candidate tarball and one minimal catalog fixture install, bind, and admit
without source imports. The public SDK and `abg.cli`
list and describe the generic metadata of retained catalog rows, narrow an
allowlist, invoke Hello World by canonical GraphFunction handle, and read typed
result and replay truth. Kind-specific node/overlay semantics remain T-179/T-228 work.

## Required Work

1. Implement the approved descriptor, contribution, resolved-lock, install,
   binding, explicit catalog-admission, catalog-state, SDK, and CLI carriers
   through the designated modules.
2. Extend `product-toolchain-manifest.json` with the admitted public contract
   catalog, static schema assets, baseline contract-group rows, exact locators,
   canonical non-circular digest verification, mandatory GTL/install schema
   rows, and product-root-relative path admission; publish DS-1 operation rows
   without claiming later rows.
3. Implement distinct source-blind workspace create/open operations and the
   versioned host-neutral invocation descriptor.
4. Package a source-blind publisher-authored Hello World fixture containing
   declarations and permitted assets only.
5. Preserve M03 as the only runtime-selection and execution authority.
6. Prove the sunny-day installed SDK and CLI paths first.
7. After deterministic installed proof and one typed transport/capability
   preflight, run one packed-and-installed live Hello World sandbox through the
   same public path and preserve its response, result, event, and replay evidence.
8. Add focused negatives for incompatible identity/range/digest/interface,
   unresolved dependency or handle, duplicate identity/shadow, allowlist
   widening, malformed input, missing capability preflight, and source/private import.
9. Re-run existing semantic, install, registry, start, result, and replay suites.

## Closure Law

Close only when the DS-1 installed vertical proof passes from packed artifacts,
all seven bounded negative families return typed failures at their owning
boundary, existing gates remain green, and the implementation matches the
approved design without private imports or a second controller.

## Non-Closure Conditions

- The proof runs from the source tree or a test-only runtime shim.
- The fixture is treated as a separately supported release product.
- CLI and SDK paths differ in runtime meaning.
- Any worker, event, continuation, traversal, or closure authority is duplicated.
- Broad hostile-local hardening displaces the constructive path.

## Proof Surface

- deterministic TypeScript suite and semantic lint
- package dry-run and closed file census
- fresh installed Hello World through public SDK
- fresh installed Hello World through `abg.cli`
- one preflighted packed-product live Hello World sandbox
- typed result and replay assertions
- seven bounded negative differentials
- phase-end code review against T-222, T-218, and PRODUCT
