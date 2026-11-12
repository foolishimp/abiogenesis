# TypeScript Tenant Design

Current design notes for the TypeScript build tenant, by owner. Each line names what the note designs and the source modules under `code/src` that realize it.
Superseded, stale and record notes, and the sections cut from mixed notes, are in [history/README.md](history/README.md).

## Tenant-wide

- [ABI5_REALIZATION_CONSTITUTION](ABI5_REALIZATION_CONSTITUTION.md): local realization authority: module and owner tables, technology stack, common-library catalog, amendment rule. Applies to every module under `code/src`.
- [ABI5_STDO3_COMPUTATIONAL_BINDING](ABI5_STDO3_COMPUTATIONAL_BINDING.md): application of the selected STDO design profile to the Product and requirement owners: generic owner-binding algebra, the seven C constructors, exact-prefix reads. Realized by `abg/exact_prefix_bindings.ts`, `abg/traversal_route.ts`, `abg/c_call.ts`, `gtl/c_algebra.ts`.

## GTL

- [T287_G2_GTL_SERIALIZATION_PUBLICATION_DESIGN](T287_G2_GTL_SERIALIZATION_PUBLICATION_DESIGN.md): GTL serialization, raw admission and publication of declarations. Realized by `gtl/serialization.ts`, `gtl/serialization_contracts.ts`, `validator/raw_admission.ts`, `validator/validation.ts`.
- [T287_D1_REQUIREMENT_LIFECYCLE_DESIGN](T287_D1_REQUIREMENT_LIFECYCLE_DESIGN.md): native source and obligation handoff between requirement terms and contract fulfilment. Realized by `gtl/requirement_handoff.ts`, `product/requirement_handoff.ts`, `hog/ccall_lifecycle.ts`.
- [M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN](M05_S05_CONSENSUS_GLOBAL_TO_LOCAL_DESIGN.md): Consensus as an ordinary GTL library with its implementation. Realized by `gtl/consensus.ts`, `gtl/consensus_schema.ts`, `implementation/consensus.ts`.

## HoG

- [M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN](M03_DIRECT_GTL_TRAVERSAL_BEHAVIOR_DESIGN.md): direct GTL validation, traversal, runtime admission, replay and public projection. Realized by `hog/traversal.ts`, `hog/child_traversal.ts`, `validator/validation.ts`, `abg/replay.ts`.
- [M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN](M05_DIRECT_GTL_TRAVERSAL_EXPANSION_DESIGN.md): the `CProgramTerm` and its direct fold, the One Surface evidence fold, the ordinary-path Consensus and native portability. Realized by `gtl/c_algebra.ts`, `hog/traversal.ts`, `abg/traversal_route.ts`, `gtl/consensus.ts`.
- [M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN](M03_TYPED_RECURSE_RUNTIME_BEHAVIOR_DESIGN.md): recurse application: child preparation, child failure, bounded termination, foldback admission, parent re-entry and declared failed-child foldback. Realized by `hog/recursion_lifecycle.ts`, `hog/child_traversal.ts`, `gtl/serialization_contracts.ts`, `abg/graph_application.ts`, `abg/traversal_route.ts`.
- [T287_REGISTERED_GRAPH_SELECTION_DESIGN](T287_REGISTERED_GRAPH_SELECTION_DESIGN.md): selection among registered graphs and route proposal. Realized by `hog/route_proposal.ts`, `hog/child_traversal.ts`, `gtl/contracts.ts`, `gtl/source_path.ts`, `gtl/registered_selection.ts`.

## ABG

- [ABG_EVENT_CALCULUS_IACS](ABG_EVENT_CALCULUS_IACS.md): the Event Calculus carrier set. Realized by `abg/event_calculus.ts`, `abg/calculus/rules.ts`, `abg/calculus/fold.ts`.
- [ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION](ABG_EVENT_CALCULUS_RUNTIME_LAW_DERIVATION.md): runtime law as Event Calculus axioms and `HoldsAt` folds. Realized by `abg/calculus/axioms.ts`, `abg/calculus/fold.ts`.
- [M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION](M03_PAYLOAD_LEDGER_EVENT_TOPOLOGY_DERIVATION.md): native definition material in durable event rows. Realized by `abg/event_body_encoding.ts`.
- [M03_INSTRUCTION_ASSEMBLY_DERIVATION](M03_INSTRUCTION_ASSEMBLY_DERIVATION.md): native binding and material lifetime of instruction assembly. Realized by `abg/instruction_assembly.ts`.
- [M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION](M03_SYSTEM_PROBE_OBSERVER_LIVENESS_DERIVATION.md): system probes, watchdog policy, the liveness observer projection and its disposition rules. Realized by `abg/runtime_liveness_contracts.ts`, `abg/runtime_liveness.ts`, `abg/calculus/liveness.ts`.
- [M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION](M03_TRAVERSAL_NON_PROGRESS_CONTINUATION_DERIVATION.md): timeout-to-failure mapping, artifact salvage and composition with liveness. Realized by `abg/transport_contracts.ts`, `abg/runtime_liveness.ts`.
- [T287_NATIVE_LIVENESS_CONSERVATION_DESIGN](T287_NATIVE_LIVENESS_CONSERVATION_DESIGN.md): native liveness conservation. Realized by `abg/runtime_liveness_contracts.ts`, `abg/event_contract_profiles.ts`.
- [T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN](T287_NATIVE_EVENT_CONTRACT_COMPATIBILITY_DESIGN.md): event-contract compatibility profiles. Realized by `abg/event_contract_profiles.ts`.
- [T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN](T287_TERMINAL_QUIESCENCE_OWNER_NETWORK_ACCEPTED_DESIGN.md): actor process lifecycle and terminal quiescence. Realized by `abg/actor_process.ts`.
- [T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN](T287_INTERRUPTED_EVENT_RESOURCE_RECOVERY_DESIGN.md): event-resource ownership and interrupted-resource recovery. Realized by `abg/event_store.ts`, `abg/definition_event_resource.ts`.
- [T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN](T289_IMMUTABLE_INSTALL_EVENT_BODIES_DESIGN.md): immutable installation event bodies. Realized by `abg/event_store.ts`, `abg/worksite_input_provenance.ts`, `abg/environment_admission.ts`.
- [T287_PENDING_CONSUMER_CONTINUATION_DESIGN](T287_PENDING_CONSUMER_CONTINUATION_DESIGN.md): continued work and exact execution resumption. Realized by `abg/invocation_admission.ts`, `abg/event_prefix.ts`, `abg/invocation_execution_truth.ts`, `product/run_invocation_operation.ts`.
- [T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN](T287_R10_TYPED_TERMINAL_OUTCOME_DESIGN.md): the typed terminal outcome and its read. Realized by `abg/terminal_result_contracts.ts`, `abg/project_read_ports.ts`.

## Product

- [ABI5_PROJECT_REFERENCE_FRAME_BASIS](ABI5_PROJECT_REFERENCE_FRAME_BASIS.md): the Project reference-frame basis and workspace authority. Realized by `product/invocation.ts`, `owner_bindings/run_invocation.ts`.
- [T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN](T287_DEFAULT_GOVERNANCE_LIBRARY_DESIGN.md): the default governance library. Realized by `product/default_library.ts`, `gtl/default_library.ts`, `abg/default_library.ts`.
- [T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN](T287_GRAPH_CATALOG_CONTRACTION_ACCEPTED_DESIGN.md): catalog construction as plain derived values. Realized by `product/catalog_operations.ts`.
- [T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN](T287_W2_R2_CONSUMER_DECLARATION_ADMISSION_DESIGN.md): consumer declaration admission and application. Realized by `product/declaration_application.ts`, `product/invocation.ts`, `abg/invocation_admission.ts`.
- [T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN](T287_STDO_RUN_ENVIRONMENT_PILOT_DESIGN.md): the governed run environment and role context. Realized by `product/stdo_environment.ts`, `gtl/stdo_run_environment.ts`.
- [T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN](T287_W2_R3_C0_MUTABLE_WORKSITE_CAUSALITY_DESIGN.md): mutable worksite causality. Realized by `product/worksite_operations.ts`, `product/worksite_effect.ts`, `implementation/worksite_file_replace.ts`.
- [T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN](T287_W2_R3_SINGLE_START_CONSTRUCTION_EXECUTION_DESIGN.md): single-start construction and execution. Realized by `product/worksite_preparation.ts`, `product/worksite_preparation_contracts.ts`.
- [T287_C2_FORWARD_REENTRY_DESIGN](T287_C2_FORWARD_REENTRY_DESIGN.md): forward re-entry of retained construction. Realized by `product/worksite_command_forward.ts`, `product/run_invocation_operation.ts`.
- [T287_D2_REQUIREMENT_LIFECYCLE_DESIGN](T287_D2_REQUIREMENT_LIFECYCLE_DESIGN.md): the evidence-bound affected lifecycle successor. Realized by `product/semantic_revision.ts`, `abg/semantic_revision.ts`.
- [T287_DECLARED_TESTING_CAPABILITY_DESIGN](T287_DECLARED_TESTING_CAPABILITY_DESIGN.md): declared testing-capability reuse. Realized by `product/semantic_stage.ts`, `abg/semantic_stage.ts`.
- [T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN](T287_PACKAGE_OWNED_NATIVE_DECLARATIONS_DESIGN.md): package-owned bundled native declarations. Realized by `product/declaration_exports.ts`, `product/verify_product.ts`.

## Implementation

- [T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN](T287_W2_R3_C1_LIVE_LLM_WORKSITE_CONSTRUCTION_DESIGN.md): live-LLM worksite construction. Realized by `implementation/worksite_construction.ts`, `product/worksite_construction.ts`, `gtl/worksite_construction.ts`.
- [T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN](T287_W2_R3_C2_WORKSITE_COMMAND_EXECUTION_DESIGN.md): worksite command execution. Realized by `implementation/worksite_command_execution.ts`, `implementation/worksite_command_helper.ts`, `product/worksite_command_execution.ts`.
- [T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN](T287_W2_R3_C3_BRANCH_CONSTRUCTION_AGGREGATE_DESIGN.md): the branch-construction aggregate. Realized by `implementation/worksite_branch_construction.ts`, `product/worksite_branch_construction.ts`.
- [T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN](T287_C1_PRESERVED_RESULT_ARTIFACT_DESIGN.md): the preserved result artifact of construction. Realized by `implementation/worksite_construction.ts`, `product/worksite_construction_recovery.ts`, `abg/worksite_construction_recovery.ts`.
- [T287_NATIVE_WORKSPACE_WORK_DESIGN](T287_NATIVE_WORKSPACE_WORK_DESIGN.md): native workspace work. Realized by `implementation/native_workspace_work.ts`, `product/native_workspace_work.ts`, `abg/native_worksite_execution.ts`.

## Validator

- [T287_D4_SELF_CONFORMANCE_DESIGN](T287_D4_SELF_CONFORMANCE_DESIGN.md): qualification-bound self-conformance. Realized by `validator/conformance_operation.ts`, `validator/self_conformance.ts`, `product/public_contract_publication.ts`.

## Public

- [M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN](M05_S06_PUBLIC_FUNCTION_AND_NATIVE_OCCURRENCE_CLOSURE_DESIGN.md): the public function family and native occurrence closure. Realized by `product/project_read_ports.ts`, `abg/project_read_ports.ts`, `product/declaration_exports.ts`.
- [M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN](M05_S06_AXIOMATIC_AUTHORITY_AND_EXACT_PUBLIC_CONSTRUCTION_DESIGN.md): axiomatic authority and exact public construction. Realized by `abg/project_read_ports.ts`, `abg/closure.ts`, `abg/continuation.ts`, `validator/conformance_operation.ts`.
- [M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN](M05_S06_NATIVE_CONTRACT_CLOSURE_DESIGN.md): native contract closure. Realized by `owner_bindings/run_invocation.ts`, `product/contracts.ts`.
- [T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION](T287_PUBLIC_DEFINITION_CALL_CONSTRUCTION.md): installed Public DefinitionCall construction. Realized by `public/installed_public_definition_call.ts`, `shared/public_invocation.ts`, `product/invocation.ts`.

## Shared

- [ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN](ABI5_COMMON_COMPUTATIONAL_CAPABILITY_LIBRARY_DESIGN.md): the common computational capability library: values, selection, process lifetime and owner carriage. Realized by `shared/value/record.ts`, `shared/select/exact_match.ts`, `shared/owned_process_lifetime.ts`, `shared/owned_process_state.ts`.

## Tests and qualification

- [T287_D4_D5_NATIVE_QUALIFICATION_DESIGN](T287_D4_D5_NATIVE_QUALIFICATION_DESIGN.md): native assessment and the sole qualification verdict. Realized by `validator/qualification.ts`, `validator/qualification_contracts.ts`, `abg/qualification_proof.ts`.
- [T287_F11_CARRIER_RESOURCE_DESIGN](T287_F11_CARRIER_RESOURCE_DESIGN.md): qualification carrier resources. Realized by `validator/qualification_resources.ts`, `abg/qualification_proof.ts`.
- [T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN](T287_F11_REUSABLE_QUALIFICATION_LIBRARY_TARGET_DESIGN.md): the reusable qualification library. Realized by `validator/qualification.ts`, `validator/self_conformance_contracts.ts`.

## Release

- [T287_D6_RC6_RELEASE_IDENTITY_DESIGN](T287_D6_RC6_RELEASE_IDENTITY_DESIGN.md): release identity and native publication. Realized by `product/release_snapshot_operations.ts`, `implementation/release_publication.ts`, `product/release_acceptance.ts`.
- [T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN](T287_S1_ROOT_ARTIFACT_CARRIER_DESIGN.md): the source-independent artifact proof. Realized by `product/verify_product.ts`.
