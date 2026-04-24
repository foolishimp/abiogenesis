# T-026 Realize TypeScript `M03` governed F_P transport and result artifact protocol under explicit transport law

- id: T-026
- title: Realize TypeScript `M03` governed F_P transport and result artifact protocol under explicit transport law
- type: feature
- ticket_category: implementation_migration
- migration_strategy: inside_out_hard_break
- status: completed
- goal: typescript-tenant-m03-transport-protocol-wave
- change_intent: Add the late TypeScript `M03` governed transport and result-artifact protocol boundary so dispatch requests, environment sanitization, and result ingestion travel through one explicit protocol surface instead of ad hoc runtime helper agreement.
- change_class: design_reframe
- re_entry_point: design_surface
- priority: medium
- dependencies:
  - T-015 completed
  - T-024 completed
  - T-014 completed
- intake_source: `T-024` audit found Python ADR-022 and the Python transport/result-ingest code line are not yet explicitly carried or repriced in the TypeScript backlog
- affected_boundary: `build_tenants/abiogenesis/typescript/design/`, `build_tenants/abiogenesis/typescript/code/src/abg/m03/**`, `build_tenants/abiogenesis/typescript/code/src/app/m04/**`, `build_tenants/abiogenesis/typescript/test_env/**`
- triaged_at: 2026-04-24
- created_at: 2026-04-24
- updated_at: 2026-04-24
- authoritative_contract: before late transport/result protocol code opens, the tenant must declare one explicit derivation asset, one first-slice IACS, one Mermaid structural carrier diagram, one bounded strict lane, and one module-derived proof lane set; dispatch and result protocol truth must be carrier-owned and fail closed rather than hidden inside runtime helpers or shell scripts
- governing_design:
  - build_tenants/abiogenesis/typescript/design/README.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_MODULE_DESIGN.md
  - build_tenants/abiogenesis/typescript/design/ABG_3_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_DERIVATION.md
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md
  - build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md
  - build_tenants/abiogenesis/typescript/design/TYPESCRIPT_STRICT_LANE.md
  - build_tenants/common/design/modules/M03-engine-kernel.yml
  - build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md
  - build_tenants/abiogenesis/python/code/genesis/transport.py
  - build_tenants/abiogenesis/python/code/genesis/result_ingest.py
  - specification_methodology/specification/standards/DESIGN_MODULE_METHOD.md
  - specification_methodology/specification/standards/TICKET_METHOD.md
- constitutional_requirements:
  - specification/ABG_3_CONSTITUTIONAL_DESIGN.md
  - specification/requirements/abg/README.md
- links:
  - /Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-015-front-run-the-remaining-typescript-tenant-design-and-module-derivation-from-the-released-python-reference.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/transport.py
  - /Users/jim/src/apps/abiogenesis/build_tenants/abiogenesis/python/code/genesis/result_ingest.py
- target_truth: TypeScript `M03` owns one explicit governed transport and result-artifact protocol family so dispatch, environment sanitization, and result ingestion are typed, fail-closed, and carrier-owned across runtime boundaries
- superseded_truth: the current TypeScript tenant has bounded dispatch/event emission and lookup authority, but no explicit transport/result protocol wave equivalent to the Python ADR-022 line and transport/result-ingest implementation surfaces
- closure_law: this ticket closes only when the transport/result protocol boundary is declared, landed, and proven as one explicit governed family that preserves fail-closed dispatch and result ingestion semantics, keeps shell or adapter logic below the semantic center, and does not widen unrelated public carriers just to pass transport detail

## Migration Declaration

- old_truth_path: TypeScript transport/result protocol is implicit in current runtime and app boundaries while Python carries the only explicit transport/result protocol reference
- new_truth_path: one explicit TypeScript transport/result protocol family owned by `M03` and consumed by later runtime or app boundaries
- producers_old: Python ADR-022, transport, and result-ingest implementation surfaces
- producers_new: TypeScript transport protocol carriers, admission, and bounded effect-edge integration
- consumers_old: Python runtime, adapter, and proof surfaces
- consumers_new: TypeScript runtime, later event-ingress/result-assessment, and later installed qualification surfaces
- derived_surfaces:
  - bounded dispatch protocol surface
  - bounded result-artifact ingestion surface
  - later installed qualification and archive proof

## Migration Checklist

- [x] old truth path is named explicitly
- [x] new truth path is named explicitly
- [x] producer set for the new truth is listed
- [x] consumer set for the new truth is listed
- [x] projection/read-model surfaces are listed
- [x] old truth path is removed or explicitly demoted from authority
- [x] mixed-state behavior is no longer accepted as closure evidence
- [x] tests proving mixed old/new behavior are removed or repriced
- [x] ticket wording, product wording, and proof claims are reconciled before closure

## Expected Build Output

- `M03_TRANSPORT_PROTOCOL_DERIVATION.md`
- `M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`
- `M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md`
- one bounded `code/src/abg/m03/transport/**` slice or equivalent module-owned surface
- `test_m03_transport_protocol_unit.test.mjs`
- `test_m03_transport_protocol_integration.test.mjs`
- `t026-m03-transport-protocol-negative.test.mjs`

## Current Implementation State

The required pre-code design assets are landed at:

- `build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_DERIVATION.md`
- `build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`
- `build_tenants/abiogenesis/typescript/design/M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md`

The bounded implementation and proof surface now lives at:

- `build_tenants/abiogenesis/typescript/code/src/abg/m03/transport/**`
- `build_tenants/abiogenesis/typescript/code/src/shared/abg_library/**`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_transport_protocol_unit.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/test_m03_transport_protocol_integration.test.mjs`
- `build_tenants/abiogenesis/typescript/test_env/tests/t026-m03-transport-protocol-negative.test.mjs`

The completed library-adoption dependency is:

- `.ai-workspace/tickets/completed/T-027-realize-a-tenant-local-abg-common-realization-library-for-expectation-derivation-contract-carriers-and-module-derived-proof-helpers.md`

`T-026` now consumes the first `T-027` library slice for reusable
dispatch-expectation and transport-contract realization while staying bounded
to the `M03` transport protocol family.

## Python Source Asset Inventory

- `build_tenants/abiogenesis/python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md`
- `build_tenants/abiogenesis/python/code/genesis/transport.py`
- `build_tenants/abiogenesis/python/code/genesis/result_ingest.py`
- `build_tenants/abiogenesis/python/test_env/test_surface_map.md`

## Python Source Reconciliation Checklist

- [x] `python/design/adrs/ADR-022-subprocess-transport-with-env-sanitization.md` reconciled for transport ownership, env sanitization, and result path truth
- [x] `python/code/genesis/transport.py` reconciled for dispatch protocol and effect-edge ownership
- [x] `python/code/genesis/result_ingest.py` reconciled for result-artifact ingestion and fail-closed parsing
- [x] `python/test_env/test_surface_map.md` reconciled into future TypeScript transport/result proof lanes

## Functional Realization Review Checklist

- [x] transport/result protocol remains carrier-owned and typed rather than helper-owned convention
- [x] shell or adapter code stays below the semantic center
- [x] dispatch and result ingestion both fail closed on malformed or contradictory payloads
- [x] environment sanitization is explicit rather than ambient
- [x] local cleanup is absorbed only inside the owning wave; cross-boundary opportunities create triage tickets
- [x] canonical expectation derivation now consumes reusable library carriers instead of helper-invented local truth
- [x] nested transport contract and sanitization policy are realized as explicit carrier-owned detail

## Impacted Interface Review Checklist

- [x] no rival transport helper path exists beside the declared protocol boundary
- [x] runtime event and transition truth stay upstream of transport detail
- [x] negative proof rejects malformed dispatch or result-artifact payloads

## Completion

It completes only when:

- the transport/result protocol design/module assets exist before code
- the bounded strict lane is green
- unit, integration, and negative proofs are green
- transport and result ingestion fail closed on malformed or contradictory payloads
- every Python source asset listed above is reconciled or explicitly marked redundant

## Closure Evidence

- `code/src/abg/m03/transport/**` remains the owned protocol boundary
- reusable expectation and transport-contract realization is now consumed from
  `code/src/shared/abg_library/**` without widening the public `M03` transport
  surface
- `npm run build:semantic` green
- `npm run lint:semantic` green
- `npm run test:t026` green
- `npm run test:semantic` green
