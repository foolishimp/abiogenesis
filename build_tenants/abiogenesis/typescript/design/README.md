# build_tenants/abiogenesis/typescript — Design

TypeScript build - primary package-first release realization of abiogenesis.

## Status

This tenant is the primary TypeScript release line.

`build_tenants/abiogenesis/python/` remains a paused released reference
realization. This TypeScript tenant is the package-first proving and release
line for the current cut.

## Governing Truth

Constitutional authority lives in:

- `build_tenants/common/design/design_surface_map.md`
- `build_tenants/common/design/module_decomp.md`
- `build_tenants/common/design/modules/M01-gtl-core.yml`
- `build_tenants/common/design/modules/M02-work-publication.yml`
- `build_tenants/common/design/modules/M03-engine-kernel.yml`
- `build_tenants/common/design/modules/M04-app-bootstrap.yml`
- `specification/INTENT.md`
- `specification/PRODUCT.md`
- `specification/requirements/gtl/`
- `specification/requirements/abg/`
- `specification/requirements/mapping/`
- `specification/requirements/product/`

Tenant-local authority for this line lives here.

Python remains paused reference evidence.
It is source material for comparison and migration, not the authority that this
tenant is required to mimic file-for-file and not an active release gate while
paused.

## Governing Runtime Law

For the current TypeScript line, the governing runtime design decisions are:

- [TYPESCRIPT_REALIZATION_GUARDRAILS.md](./TYPESCRIPT_REALIZATION_GUARDRAILS.md)
- [ADR-040](./adrs/ADR-040-typescript-tenant-as-package-first-realization.md)
- [ADR-041](./adrs/ADR-041-runtime-execution-law-is-carrier-and-event-owned.md)
- [ADR-042](./adrs/ADR-042-deterministic-handling-must-not-structurally-block-governed-fp.md)
- [ADR-043](./adrs/ADR-043-runtime-advancement-uses-execution-basis-and-advancement-transition.md)

Read those ADRs first when judging:

- upfront carrier, typing, and governance guardrails
- package artifact versus binary artifact assumptions
- controller versus carrier ownership
- event truth versus controller-local reconstruction
- deterministic-first but F_P-biased fallback law
- whether a seam is lawful delivery binding or an illicit semantic center

For app/bootstrap boundaries, the shared structural baseline is
`build_tenants/common/design/modules/M04-app-bootstrap.yml`.
This tenant may bind that common law to package-first delivery, runtime
shells, and TypeScript entrypoints, but it must not restate a rival bootstrap
doctrine in tenant-local design.

## Design Index

Current tenant-local design truth and proposed next-boundary design packs live in:

- `MIGRATED_TYPESCRIPT_DESIGN_SOURCE_AUDIT.md`
- `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`
- `REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md`
- `REMAINING_TYPESCRIPT_OPTIMIZATION_LEDGER.md`
- `TYPESCRIPT_REALIZATION_GUARDRAILS.md`
- `TYPESCRIPT_STRICT_LANE.md`
- `GTL_3_MODULE_DESIGN.md`
- `GTL_3_FIRST_SLICE_IACS.md`
- `GTL_3_M02_WORK_PUBLICATION_IACS.md`
- `GTL_3_INTERFACE_CONTRACTS.md`
- `GTL_3_STRUCTURAL_CARRIER_DIAGRAM.md`
- `GTL_3_IMPLEMENTATION_PLAN.md`
- `ABG_3_MODULE_DESIGN.md`
- `ABG_3_FIRST_SLICE_IACS.md`
- `ABG_3_M03_STRUCTURAL_CARRIER_DIAGRAM.md`
- `ABG_COMMON_REALIZATION_LIBRARY_DERIVATION.md`
- `ABG_COMMON_REALIZATION_LIBRARY_FIRST_SLICE_IACS.md`
- `ABG_COMMON_REALIZATION_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `ABG_COMMON_DELIVERY_LIBRARY_DERIVATION.md`
- `ABG_COMMON_DELIVERY_LIBRARY_FIRST_SLICE_IACS.md`
- `ABG_COMMON_DELIVERY_LIBRARY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_TRANSPORT_PROTOCOL_DERIVATION.md`
- `M03_TRANSPORT_PROTOCOL_FIRST_SLICE_IACS.md`
- `M03_TRANSPORT_PROTOCOL_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_SUPERVISED_ACTOR_INVOCATION_DERIVATION.md`
- `M03_SUPERVISED_ACTOR_INVOCATION_FIRST_SLICE_IACS.md`
- `M03_SUPERVISED_ACTOR_INVOCATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_GRAPH_FUNCTION_ITERATION_DERIVATION.md`
- `M03_GRAPH_FUNCTION_ITERATION_FIRST_SLICE_IACS.md`
- `M03_GRAPH_FUNCTION_ITERATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_DERIVATION.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_IACS.md`
- `M03_M04_PLUGIN_CONTRACT_MODEL_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_GRAPH_APPLICATION_INSTANCE_SEMANTICS_DERIVATION.md`
- `M03_RETRY_REPAIR_LEAFTASK_DERIVATION.md`
- `M03_RETRY_REPAIR_LEAFTASK_FIRST_SLICE_IACS.md`
- `M03_RETRY_REPAIR_LEAFTASK_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_ATTACHED_FP_WORKER_LOOP_DERIVATION.md`
- `M03_ATTACHED_FP_WORKER_LOOP_FIRST_SLICE_IACS.md`
- `M03_ATTACHED_FP_WORKER_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_DERIVATION.md`
- `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_FIRST_SLICE_IACS.md`
- `M03_TRAVERSAL_ENVELOPE_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md`
- `M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_FIRST_SLICE_IACS.md`
- `M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md`
- `M03_FP_CONSCIOUSNESS_LOOP_DERIVATION.md`
- `M03_FP_CONSCIOUSNESS_LOOP_FIRST_SLICE_IACS.md`
- `M03_FP_CONSCIOUSNESS_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_ABG_FN_COMPOSITION_DERIVATION.md`
- `M03_ABG_FN_COMPOSITION_FIRST_SLICE_IACS.md`
- `M03_ABG_FN_COMPOSITION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_VECTOR_RUNTIME_REGIME_RESOLUTION_DERIVATION.md`
- `M03_VECTOR_RUNTIME_REGIME_RESOLUTION_FIRST_SLICE_IACS.md`
- `M03_VECTOR_RUNTIME_REGIME_RESOLUTION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_OBSERVED_STATE_ADMISSION_DERIVATION.md`
- `M03_OBSERVED_STATE_ADMISSION_FIRST_SLICE_IACS.md`
- `M03_OBSERVED_STATE_ADMISSION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_OVERLAY_FRAME_CONTRACT_DERIVATION.md`
- `M03_OVERLAY_FRAME_CONTRACT_FIRST_SLICE_IACS.md`
- `M03_OVERLAY_FRAME_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_FD_AUTHORITY_PLACEMENT_DERIVATION.md`
- `M03_FD_AUTHORITY_PLACEMENT_FIRST_SLICE_IACS.md`
- `M03_FD_AUTHORITY_PLACEMENT_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_CONSTRUCTION_INTENT_RUNNER_DERIVATION.md`
- `M03_CONSTRUCTION_INTENT_RUNNER_FIRST_SLICE_IACS.md`
- `M03_CONSTRUCTION_INTENT_RUNNER_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_CONSTRUCTION_PRESSURE_PACKAGE_DERIVATION.md`
- `M03_CONSTRUCTION_PRESSURE_PACKAGE_FIRST_SLICE_IACS.md`
- `M03_CONSTRUCTION_PRESSURE_PACKAGE_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_SAGA_FRONTIER_DERIVATION.md`
- `M03_SAGA_FRONTIER_FIRST_SLICE_IACS.md`
- `M03_TOTAL_ASSURANCE_PROJECTION_DERIVATION.md`
- `M03_TOTAL_ASSURANCE_PROJECTION_FIRST_SLICE_IACS.md`
- `M03_TOTAL_ASSURANCE_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_TOTAL_ASSURANCE_PROJECTION_PROOF_PLAN.md`
- `M03_EDGE_ASSURANCE_CONTRACT_DERIVATION.md`
- `M03_EDGE_ASSURANCE_CONTRACT_FIRST_SLICE_IACS.md`
- `M03_EDGE_ASSURANCE_CONTRACT_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md`
- `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_FIRST_SLICE_IACS.md`
- `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_PROOF_PLAN.md`
- `M03_M04_RUNTIME_FAILURE_TAXONOMY_DERIVATION.md`
- `M03_M04_RUNTIME_FAILURE_TAXONOMY_FIRST_SLICE_IACS.md`
- `M03_M04_RUNTIME_FAILURE_TAXONOMY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M03_OUTPUT_ALLOCATION_AND_WORKSPACE_ZOOM_FOLDBACK_DERIVATION.md`
  (T-082/T-100/T-102/T-104 output allocation, cross-workspace output authority,
  zoom foldback, eval projection, mini data-mapper W1/W2 forensic sandbox)
- `M03_GRAPH_SPAN_FOLDBACK_REENTRY_DERIVATION.md`
- `M04_PUBLIC_START_DERIVATION.md`
- `M04_FIRST_SLICE_IACS.md`
- `M04_PUBLIC_START_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_CONTROL_LOOP_DERIVATION.md`
- `M04_CONTROL_LOOP_FIRST_SLICE_IACS.md`
- `M04_CONTROL_LOOP_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_EVENT_INGRESS_DERIVATION.md`
- `M04_EVENT_INGRESS_FIRST_SLICE_IACS.md`
- `M04_EVENT_INGRESS_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_RESULT_ASSESSMENT_DERIVATION.md`
- `M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md`
- `M04_RESULT_ASSESSMENT_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_LIVE_STATUS_DERIVATION.md`
- `M04_LIVE_STATUS_FIRST_SLICE_IACS.md`
- `M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_INSTALL_BOOTSTRAP_DERIVATION.md`
- `M04_INSTALL_BOOTSTRAP_FIRST_SLICE_IACS.md`
- `M04_INSTALL_BOOTSTRAP_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_BOOTLOADER_DERIVATION.md`
- `M04_BOOTLOADER_FIRST_SLICE_IACS.md`
- `M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md`
- `M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md`
- `M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_PUBLIC_GAPS_PROJECTION_DERIVATION.md`
- `M04_PUBLIC_GAPS_PROJECTION_FIRST_SLICE_IACS.md`
- `M04_PUBLIC_GAPS_PROJECTION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M04_GAP_TRIAGE_GRAPH_FUNCTION_DERIVATION.md`
- `M04_MAXIMUM_AUTONOMY_GEN_START_DERIVATION.md`
- `M04_MAXIMUM_AUTONOMY_GEN_START_FIRST_SLICE_IACS.md`
- `M04_MAXIMUM_AUTONOMY_GEN_START_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_QUALIFICATION_DERIVATION.md`
- `M05_QUALIFICATION_FIRST_SLICE_IACS.md`
- `M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_FIRST_SLICE_IACS.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_DATA_MAPPER_REAL_INGRESS_PROOF_DERIVATION.md`
- `M05_RESEARCH_PRODUCT_LAB_SCENARIO_CATALOG_DERIVATION.md`
- `M05_INSTALLED_SANDBOX_DERIVATION.md`
- `M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_DERIVATION.md`
- `M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_FIRST_SLICE_IACS.md`
- `M05_ATTACHED_FP_LOCAL_LIVE_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_ARCHIVE_FINALIZATION_DERIVATION.md`
- `M05_ARCHIVE_FINALIZATION_FIRST_SLICE_IACS.md`
- `M05_ARCHIVE_FINALIZATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md`
- `M05_PUBLIC_SANDBOX_ARCHIVE_API_FIRST_SLICE_IACS.md`
- `M05_PUBLIC_SANDBOX_ARCHIVE_API_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md`
- `M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_LIVE_PORTFOLIO_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_INSTALLED_RESET_POSTMORTEM_DERIVATION.md`
- `M05_INSTALLED_RESET_POSTMORTEM_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_RESET_POSTMORTEM_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_RC_LIVE_UAT_DERIVATION.md`
- `M05_RC_LIVE_PORTFOLIO_DERIVATION.md`
- `M05_PYTHON_SANDBOX_BEHAVIOR_PORTFOLIO_DERIVATION.md`
- `M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md`
- `M06_MAPPING_DEFERRED_DERIVATION.md`
- `M06_MAPPING_DEFERRED_TRIGGER_IACS.md`
- `M06_MAPPING_DEFERRED_STRUCTURAL_CARRIER_DIAGRAM.md`
- `GTL_ODD_ZOOM_FOLD_ALGEBRA_DECISION.md`
- `M02_M03_LOOKUP_AUTHORITY_DERIVATION.md`
- `M02_M03_LOOKUP_AUTHORITY_IACS.md`
- `M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md`
- `adrs/`

The first implementation wave was completed by:

- `.ai-workspace/tickets/completed/T-009-build-the-typescript-tenant-first-slice-under-explicit-carrier-law.md`

`T-009` closed at GTL `M01` only.
The second implementation wave was completed by:

- `.ai-workspace/tickets/completed/T-010-realize-typescript-gtl-m02-work-publication-under-explicit-publication-carrier-law.md`

`T-010` closed at GTL `M02-work-publication` only.
The third implementation wave was completed by:

- `.ai-workspace/tickets/completed/T-011-realize-typescript-abg-first-runtime-slice-under-explicit-execution-event-carrier-law.md`

`T-011` closed at the first ABG runtime steel thread only.
The completed public-start implementation wave is:

- `.ai-workspace/tickets/completed/T-012-realize-typescript-m04-public-start-steel-thread-over-kernel-owned-runtime-law.md`

`T-012` completed the first `M04` public-start implementation wave.
That completed code wave remains intentionally narrow:

- one public start request carrier
- one closed public start outcome family
- one explicit configured runtime or worker identity projection path
- one canonical route into completed `M03` `start -> iterate` engine carriers

After T-072/T-074, `publicStart(...)` remains only a compatibility adapter over
`startFromRequest(...)`; it does not authorize a rival one-step public-start
runtime path or later `M04` auto/proxy/install/bootstrap widening.

The completed next `M04` control-loop wave is:

- `.ai-workspace/tickets/completed/T-013-realize-typescript-m04-control-modes-over-closed-public-start-outcome-law.md`

`T-013` completed the first bounded `M04` control-loop slice.
Its derivation, first-slice IACS, structural carrier diagram, strict lane, and
module-derived proof lanes are now declared and landed for that completed
control-loop slice.
It still does not authorize event-ingress, result-assessment,
install/bootstrap, bootloader, or sandbox/scenario widening.

The completed next `M04` event-ingress wave is:

- `.ai-workspace/tickets/completed/T-016-realize-typescript-m04-event-ingress-over-the-canonical-kernel-emission-surface.md`

`T-016` completed the bounded first `M04` event-ingress slice.
Its first-slice design assets are:

- `M04_EVENT_INGRESS_DERIVATION.md`
- `M04_EVENT_INGRESS_FIRST_SLICE_IACS.md`
- `M04_EVENT_INGRESS_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed first slice is bounded to app-owned `approved`, `revoked`, and
`reset` command ingress over canonical kernel emission.
It explicitly deferred `assessed`, result-artifact ingress, install/bootstrap,
bootloader, and sandbox/scenario widening.

The completed next `M04` result-assessment wave is:

- `.ai-workspace/tickets/completed/T-017-realize-typescript-m04-result-assessment-ingress-over-canonical-result-ingest-law.md`

`T-017` completed the bounded first result-assessment slice.
Its first-slice design assets are:

- `M04_RESULT_ASSESSMENT_DERIVATION.md`
- `M04_RESULT_ASSESSMENT_FIRST_SLICE_IACS.md`
- `M04_RESULT_ASSESSMENT_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed first slice is bounded to `assessed{kind: fp}` over the
completed canonical ingest boundary.
It explicitly defers non-F_P review, live-status, install/bootstrap,
bootloader, and sandbox/scenario widening.

The completed next `M04` live-status wave is:

- `.ai-workspace/tickets/completed/T-018-realize-typescript-m04-live-status-projection-over-explicit-runtime-projection-law.md`

`T-018` completed the bounded first live-status projection slice.
Its first-slice design assets are:

- `M04_LIVE_STATUS_DERIVATION.md`
- `M04_LIVE_STATUS_FIRST_SLICE_IACS.md`
- `M04_LIVE_STATUS_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed first slice is projection-only over admitted public/runtime
truth.
It explicitly defers install/bootstrap, bootloader, archive replay, and
sandbox/scenario widening.

The completed common-library wave is:

- `.ai-workspace/tickets/completed/T-027-realize-a-tenant-local-abg-common-realization-library-for-expectation-derivation-contract-carriers-and-module-derived-proof-helpers.md`

`T-027` is bounded to the tenant-local reusable ABG common realization library
under `code/src/shared/abg_library/**`.
That completed wave lawfully absorbed only:

- dispatch-expectation realization carriers
- nested transport contract/policy realization carriers
- module-derived proof-helper profiles

It did not widen into new product carriers, shared/common propagation, or rival
runtime doctrine.

The completed late `M03` transport/result protocol wave is:

- `.ai-workspace/tickets/completed/T-026-realize-typescript-m03-governed-fp-transport-and-result-artifact-protocol-under-explicit-transport-law.md`

`T-026` completed the late `M03` transport/result protocol family under
`code/src/abg/m03/transport/**`.
Its repeated realization mechanics now consume the completed `T-027` library
slice without widening the owned `M03` protocol boundary.
The completed common-delivery-library wave is:

- `.ai-workspace/tickets/completed/T-028-realize-a-tenant-local-abg-common-delivery-library-for-installed-root-plans-verification-and-instruction-file-injection.md`

`T-028` completed the tenant-local reusable delivery library under
`code/src/shared/abg_delivery_library/**`.
That completed wave lawfully absorbed only:

- installed-root delivery-plan carriers
- delivery verification and writer carriers
- marker-bound instruction injection carriers

It did not widen into runtime semantics, public product carriers, or
shared/common propagation.
The completed next `M04` install/bootstrap wave is:

- `.ai-workspace/tickets/completed/T-019-realize-typescript-m04-install-bootstrap-under-package-first-installed-runtime-law.md`

`T-019` completed the bounded install/bootstrap delivery slice over explicit
installed-runtime request and outcome truth.
It explicitly deferred bootloader, public asset-addressing, and later sandbox
qualification widening.

The completed next `M04` bootloader wave is:

- `.ai-workspace/tickets/completed/T-020-realize-typescript-m04-bootloader-and-project-facing-delivery-operations-under-explicit-bootloader-law.md`

`T-020` completed the bounded bootloader and project-facing delivery slice.
Its first-slice design assets are:

- `M04_BOOTLOADER_DERIVATION.md`
- `M04_BOOTLOADER_FIRST_SLICE_IACS.md`
- `M04_BOOTLOADER_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed first slice is bounded to explicit bootloader document delivery,
marker-bound instruction-file injection, and verification-only project-facing
delivery truth.
It explicitly defers public asset-addressing and later qualification widening.

The completed next `M04` public asset-addressing wave is:

- `.ai-workspace/tickets/completed/T-025-realize-typescript-m04-public-asset-addressing-through-a-published-operator-asset-registry.md`

`T-025` completed the bounded public asset-addressing slice.
Its first-slice design assets are:

- `M04_PUBLIC_ASSET_ADDRESSING_DERIVATION.md`
- `M04_PUBLIC_ASSET_ADDRESSING_FIRST_SLICE_IACS.md`
- `M04_PUBLIC_ASSET_ADDRESSING_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed first slice is bounded to explicit asset-handle resolution
through one published operator asset registry and one governing graph-function
owner.
It explicitly defers qualification, sandbox/archive proof, and later mapping
repricing.
The latest completed design-only audit wave is:

- `.ai-workspace/tickets/completed/T-024-audit-the-migrated-typescript-design-and-adr-assets-against-the-python-reference-line.md`

`T-024` established the source-reconciliation baseline for the already-landed
TypeScript design line through `T-014`.
The latest completed forward-derivation wave is:

- `.ai-workspace/tickets/completed/T-015-front-run-the-remaining-typescript-tenant-design-and-module-derivation-from-the-released-python-reference.md`

`T-015` established the explicit remaining-wave design chain for late `M03`,
remaining `M04`, `M05`, and deferred `M06`, plus the optimization baseline for
those waves.
The latest completed cross-boundary cleanup wave is:

- `.ai-workspace/tickets/completed/T-014-reprice-typescript-m02-publication-lookup-and-m03-execution-resolution-under-explicit-lookup-authority.md`

`T-014` owns only the `M02 -> M03` lookup-authority boundary.
Its module-bounded design assets are:

- `M02_M03_LOOKUP_AUTHORITY_DERIVATION.md`
- `M02_M03_LOOKUP_AUTHORITY_IACS.md`
- `M02_M03_LOOKUP_AUTHORITY_STRUCTURAL_CARRIER_DIAGRAM.md`

The latest completed `M05` qualification wave is:

- `.ai-workspace/tickets/completed/T-022-realize-typescript-m05-installed-sandbox-live-lane-and-archive-proof-under-explicit-installed-runtime-qualification-law.md`

That completed `M05` line now spans two slices.
Its design assets are:

- `M05_QUALIFICATION_DERIVATION.md`
- `M05_QUALIFICATION_FIRST_SLICE_IACS.md`
- `M05_QUALIFICATION_STRUCTURAL_CARRIER_DIAGRAM.md`
- `M05_INSTALLED_SANDBOX_DERIVATION.md`
- `M05_INSTALLED_SANDBOX_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_SANDBOX_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed `M05` line is bounded to:

- method-trace qualification over live TypeScript design/module authority
- one fake-lane qualification harness over completed `M04` public/runtime truth
- installed-sandbox qualification over completed `M04` delivery outcomes
- one installed live-lane scenario over the installed package surface
- one archive-proof qualification over stable run roots
- one tenant-local qualification kernel under `code/src/qualification/m05/**`

The latest completed audit wave is:

- `.ai-workspace/tickets/completed/T-029-audit-typescript-installed-sandbox-and-live-lane-proof-against-the-python-reference-tests-at-equivalent-feature-coverage.md`

`T-029` completed the feature-equivalence audit over the completed TypeScript
installed-sandbox, live-lane, and archive proof surfaces.
It established the durable audit baseline in
`M05_PYTHON_SANDBOX_PROOF_EQUIVALENCE_AUDIT.md` and pushed the remaining
still-relevant misses into explicit follow-up tickets, now all completed:

- `T-030` archive writer/finalizer parity
- `T-031` installed live scenario portfolio parity
- `T-032` installed reset/postmortem parity

The latest completed follow-up implementation wave is:

- `.ai-workspace/tickets/completed/T-030-realize-typescript-m05-installed-run-archive-writer-and-postmortem-finalization-proof-under-explicit-archive-finalization-law.md`

`T-030` completed the bounded `M05` archive-finalization slice.
Its first-slice design assets are:

- `M05_ARCHIVE_FINALIZATION_DERIVATION.md`
- `M05_ARCHIVE_FINALIZATION_FIRST_SLICE_IACS.md`
- `M05_ARCHIVE_FINALIZATION_STRUCTURAL_CARRIER_DIAGRAM.md`

`T-077` promoted the completed M05 sandbox/archive substrate through a public
downstream package API.
Its first-slice design assets are:

- `M05_PUBLIC_SANDBOX_ARCHIVE_API_DERIVATION.md`
- `M05_PUBLIC_SANDBOX_ARCHIVE_API_FIRST_SLICE_IACS.md`
- `M05_PUBLIC_SANDBOX_ARCHIVE_API_STRUCTURAL_CARRIER_DIAGRAM.md`

The latest completed follow-up implementation wave is:

- `.ai-workspace/tickets/completed/T-032-realize-typescript-m05-installed-reset-postmortem-parity-over-canonical-reset-and-continuation-law.md`

`T-032` completed the bounded `M05` installed reset-postmortem slice.
Its first-slice design assets are:

- `M05_INSTALLED_RESET_POSTMORTEM_DERIVATION.md`
- `M05_INSTALLED_RESET_POSTMORTEM_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_RESET_POSTMORTEM_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed slice is bounded to:

- one installed reset-postmortem qualification boundary under
  `code/src/qualification/m05/**`
- one active-run supersession proof over accepted reset truth
- one open-continuation abandonment proof over admitted non-fulfilled
  assessment provenance
- one module-derived reset-postmortem unit lane
- one installed reset-postmortem integration lane
- one fail-closed reset-postmortem negative lane

The latest completed follow-up implementation wave is:

- `.ai-workspace/tickets/completed/T-031-realize-typescript-m05-installed-live-scenario-portfolio-parity-against-the-python-sandbox-live-reference-line.md`

`T-031` completed the bounded `M05` installed live-portfolio slice.
Its first-slice design assets are:

- `M05_INSTALLED_LIVE_PORTFOLIO_DERIVATION.md`
- `M05_INSTALLED_LIVE_PORTFOLIO_FIRST_SLICE_IACS.md`
- `M05_INSTALLED_LIVE_PORTFOLIO_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed slice is bounded to:

- one installed portfolio qualification request/outcome family
- one explicit scenario-result carrier over the Python live families
- one installed portfolio integration lane
- one module-derived installed-portfolio unit lane
- one fail-closed installed-portfolio negative lane

The completed next `M05` behavior portfolio wave is:

- `.ai-workspace/tickets/completed/T-036-port-python-archived-sandbox-behavior-portfolio-to-typescript-installed-package-lane.md`

`T-036` completed the 34-scenario Python archived sandbox behavior portfolio
port.
Its design asset is:

- `M05_PYTHON_SANDBOX_BEHAVIOR_PORTFOLIO_DERIVATION.md`

That completed slice adds:

- one explicit scenario-obligation catalog for the Python archived sandbox
  corpus
- one installed-package behavior portfolio qualifier
- one installed-package integration lane that runs 34 scenario obligations
- one durable portfolio report under `test_env/test_runs/`

The completed SDLC bootstrap-lineage PoC wave is:

- `.ai-workspace/tickets/completed/T-063-realize-typescript-m05-sdlc-bootstrap-lineage-poc-over-gtl-abg-provenance.md`

`T-063` completed the bounded `M05` SDLC-domain proof for conformant bootstrap
ingress and derived-element lineage over GTL/ABG provenance.
Its first-slice design assets are:

- `M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_FIRST_SLICE_IACS.md`
- `M05_SDLC_BOOTSTRAP_LINEAGE_STRUCTURAL_CARRIER_DIAGRAM.md`

That completed slice is bounded to:

- one admitted `SdlcBootstrapInputSet` over weak source material
- one `GF_BOOTSTRAP_PROJECT` graph function with
  `BootstrapInputSet->Project` shape
- one typed `SdlcProject` result
- one `SdlcDerivationLedger` carrying asset and element lineage
- one runtime-provenance join over existing ABG traversal truth
- one module-owned unit lane under `test:t063`

The completed RC live UAT wave is:

- `.ai-workspace/tickets/completed/T-033-realize-typescript-rc-live-qualification-lane-over-real-fp-transport-execution.md`

`T-033` completed a distinct TypeScript live sandbox UAT lane under the
`SPEC_METHOD.md` testing strategy taxonomy.
Its design asset is:

- `M05_RC_LIVE_UAT_DERIVATION.md`

That completed slice is bounded to:

- one opt-in single-edge live command, `npm run test:live:uat`
- one requirements-sourced sandbox UAT scenario
- real F_P transport execution through the TypeScript transport contract
- result-artifact ingestion, result assessment, live-status projection, and
  durable RC live evidence capture under the Python-sandbox-derived archive
  convention

The completed RC live portfolio wave is:

- `.ai-workspace/tickets/completed/T-037-port-python-live-scenario-portfolio-to-typescript-rc-external-live-lane.md`

`T-037` completed the external-live portfolio port for all five Python live
scenario families.
Its design asset is:

- `M05_RC_LIVE_PORTFOLIO_DERIVATION.md`

That completed slice is bounded to:

- one required RC portfolio live command, `npm run test:live`
- five Python live scenario families
- twelve real F_P stage dispatches through the TypeScript transport contract
- one shared scenario/stage/assessment catalog,
  `M05_REFERENCE_LIVE_SCENARIO_OBLIGATIONS`
- package materialization from `npm pack` before installed package import
- result-artifact ingestion, result assessment, live-status projection, and
  durable per-stage archive evidence

The completed deferred-only `M06` adjudication is:

- `.ai-workspace/tickets/completed/T-023-adjudicate-typescript-m06-mapping-deferred-trigger-boundary-under-explicit-deferred-only-law.md`

That completed boundary keeps alternate-runtime mapping dormant until a
successor ticket explicitly activates one named alternate runtime family.

For module ownership, shared `M01` to `M06` law remains upstream in
`build_tenants/common/design/`.
This tenant-local design root exists to bind those shared modules to
TypeScript-specific carrier, runtime, and packaging choices without rewriting
their shared structural authority.

## Design Derivation Order

The TypeScript tenant does not build from code-first porting.

The required order is:

1. constitutional `WHAT` in `specification/`
2. paused Python reference design as historical/reference `HOW`
3. TypeScript design mapping in `PYTHON_TO_TYPESCRIPT_DESIGN_DERIVATION.md`
4. source audit baseline in `MIGRATED_TYPESCRIPT_DESIGN_SOURCE_AUDIT.md`
5. forward remaining-wave baseline in `REMAINING_TYPESCRIPT_FORWARD_DERIVATION_PLAN.md`
6. module-bounded carrier assets such as IACS documents and structural carrier
   diagrams
7. implementation tickets
8. code

If a proposed TypeScript change cannot point to that chain, it is not yet ready
for implementation.

## Functional Design Stance

The implementation target is TypeScript with hard carrier law:

- discriminated unions for prime runtime and public carrier families
- readonly data carriers at the semantic center
- functional core with explicit effect shells
- parse or validate once at ingress, then carry typed truth inward
- no `any`, no unchecked `as`, and no open JSON trusted past ingress
- package-first distribution, with compiled executable delivery optional rather
  than primary

If a proposed implementation shape depends on mutable service objects, ambient
JSON bags, or controller-owned runtime meaning, it is probably the wrong shape
for this line.

## Current Tenant Consequence

This tenant is intentionally narrow in its first wave:

- establish tenant-local TypeScript design law
- front-load the Python and odd_sdlc failure lessons before code exists
- port the key runtime ADR chain from the Python line
- port the GTL and ABG design surfaces that are truly tenant-local
- delay code until the runtime, packaging, and typing posture are explicit

That keeps the migration inside one lawful re-entry point: `design_reframe`.
