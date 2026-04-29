---
id: T-077
title: Export TypeScript M05 sandbox archive framework as public downstream API
type: dependency
ticket_category: rc_followup
status: completed
goal: expose common ABG sandbox/archive substrate for downstream ODD products
change_intent: Promote the TypeScript M05 sandbox/archive qualification primitives needed by downstream products from private test-local code to a public package API.
change_class: design_reframe
re_entry_point: design
affected_boundary: ABIogenesis TypeScript M05 public exports, downstream sandbox/archive framework convergence, package API stability
priority: high
triaged_at: 2026-04-26T18:10:29Z
created_at: 2026-04-26T18:10:29Z
updated_at: 2026-04-27T09:00:20Z
dependencies:
  - REQ-P-INSTALL active
  - T-076 completed
  - T-080 completed full installer capability review
governance_scope: STDO Method
governance_scope_expansion:
  - S: SPEC_METHOD.md
  - T: TICKET_METHOD.md
  - D: DESIGN_MODULE_METHOD.md
  - O: ODD_METHOD.md
intake_source: odd_sdlc T-048 found that downstream TypeScript sandbox lanes need a common ABG-owned archive framework but current M05 archive helpers are not public package exports.
requirement_authority:
  - specification/PRODUCT.md Installed Substrate Contract
  - specification/requirements/product/REQ-P-INSTALL.md
target_truth: ABIogenesis TypeScript publishes the reusable M05 sandbox/archive qualification framework through a stable public export so downstream products can consume it without private build-path imports.
superseded_truth: downstream products may permanently duplicate ABG sandbox/archive mechanics or import private ABIogenesis M05 test paths.
closure_law: this ticket closes only when the exported API is designed, typed, tested, documented, and consumed by at least one downstream proof or explicitly marked as not required by the downstream design.
---

# T-077: TypeScript M05 Public Sandbox Archive API

## Problem

Downstream ODD products need a common sandbox/archive framework that records
install manifests, command bindings, runtime identity, event/projection
evidence, and postmortem output.

ABIogenesis TypeScript owns the substrate concepts, and M05 already contains
qualification/archive proof logic. The current public package exports do not
expose that framework as a downstream dependency surface.

Without a public API, downstream products must either duplicate archive logic
or import private ABIogenesis test/build paths. Both are wrong as enduring
architecture.

## Required Direction

1. Identify the reusable M05 sandbox/archive carriers and transforms.
2. Design the public export surface under the TypeScript package API.
3. Keep domain-specific scenario meaning out of the ABG substrate API.
4. Provide tests that prove downstream code can consume the API through package
   exports, not private paths.
5. Update downstream documentation or proof lanes that rely on the common API.

## Acceptance

- ABIogenesis TypeScript has a public M05 sandbox/archive export.
- The export is package-consumable after `npm pack` / installer population.
- The export covers archive manifest, runtime identity, command binding,
  event/projection, and postmortem evidence primitives.
- At least one downstream lane consumes it or records an explicit design
  decision not to consume it for that release.

## Non-Closure Conditions

- downstream products import private ABIogenesis build/test paths
- tenant-local archive duplication is treated as the permanent common sandbox
  framework
- export is added without a design/module review under Design Module Method

## Closure

Completed 2026-04-27.

### STDO Triage

- S: `REQ-P-INSTALL` owns installed downstream-consumable runtime substrate.
- T: this ticket is the durable work item and closure surface.
- D: design reframe was the correct re-entry point because existing M05
  carriers existed, but package/API authority and archive evidence vocabulary
  needed a public-surface design.
- O: implementation keeps the substrate generic. Downstream scenario meaning is
  not absorbed into ABG.

### Design Evidence

- `build_tenants/abiogenesis/typescript/design/M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M05_PUBLIC_SANDBOX_ARCHIVE_API_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M05_PUBLIC_SANDBOX_ARCHIVE_API_STRUCTURAL_CARRIER_DIAGRAM.md`

### Realization Evidence

- package export: `@abiogenesis/typescript-tenant/qualification/m05`
- widened `RunArchiveFileKind`:
  `runtime_identity`, `command_binding`, `projection`, and `postmortem`
  are required archive evidence kinds.
- public installed-runtime proof:
  `build_tenants/abiogenesis/typescript/test_env/tests/test_t077_m05_public_sandbox_archive_api_integration.test.mjs`

### Verification

- `npm run test:t077`: 1 passed
- `npm run test:t030`: 3 passed
- `npm run test:t022`: 6 passed
- `npm run test:t076`: 4 passed
- `npm run lint:semantic`: passed

### Closure Claim

ABIogenesis TypeScript now publishes the M05 sandbox/archive substrate through a
stable package export. A package-installed runtime imports the public subpath,
finalizes an archive, qualifies it, and proves required manifest, runtime
identity, command binding, event/projection, postmortem, and workspace artifact
evidence without private build-path imports.
