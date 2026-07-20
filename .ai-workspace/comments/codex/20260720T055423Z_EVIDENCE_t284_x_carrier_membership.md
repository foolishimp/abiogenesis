# EVIDENCE: T-284 Frozen-X Carrier Membership

**Author**: codex
**Observed at**: 2026-07-20T05:54:23Z
**Ticket**: T-284
**Status**: candidate evidence; M2 remains open

## Claim

The X carrier census in the T-284 correction vector is an ordered,
reproducible first-match partition of every path under
`build_tenants/abiogenesis/typescript/` at frozen X snapshot
`676766a648066eaa69dce05f636d5ec98fb40dec`.

The scope contains 1,935 paths. Every path has exactly one membership row.
There is no catch-all family: a path that matches no declared semantic,
support, export, package, or historical-artifact family fails reproduction.

## Reproduction

Feed the sorted output of this command to the script below on standard input:

```bash
git ls-tree -r --name-only \
  676766a648066eaa69dce05f636d5ec98fb40dec -- \
  build_tenants/abiogenesis/typescript
```

```js
const fs = require("fs");
const crypto = require("crypto");

const prefix = "build_tenants/abiogenesis/typescript/";
const paths = fs.readFileSync(0, "utf8").trim().split("\n").filter(Boolean);
const rules = [
  ["XC01", /^code\/src\/gtl\/m01\/(contracts\/|algebra\/(core|index|native_node_witness)\.ts|index\.ts)/],
  ["XC02", /^code\/src\/gtl\/m01\/algebra\/(c_algebra|c_algebra_declarations|hof)\.ts$/],
  ["XC03", /^code\/src\/gtl\/m01\/(admission|serialization)\//],
  ["XC04", /^code\/src\/gtl\/m02\//],
  ["XC05", /(^|\/)gtl_program_conformance\.ts$/],
  ["XC06", /(^|\/)(graph_function_application_compiler|hof_relation_compiler)\.ts$/],
  ["XC07", /(^|\/)(hog_program|hog_program_syntax|hog_program_resolution|runtime_program_catalog)\.ts$/],
  ["XC08", /(^|\/)(c_algebra_hog_compiler|execution_declaration_compiler)\.ts$/],
  ["XC09", /(^|\/)(graph_vector_c_program_compiler|graph_vector_execution_handoff)\.ts$/],
  ["XC10", /(^|\/)complete_c_program\.ts$/],
  ["XC11", /(^|\/)complete_c_program_runtime\.ts$/],
  ["XC12", /(^|\/)(workflow_c|workflow_c_runtime|c_batch|c_batch_runtime|c_retry|c_retry_policy|c_retry_runtime|typed_recurse|typed_recurse_runtime|hof_batch|hof_fan_in_runtime)\.ts$/],
  ["XC13", /(^|\/)engine_runner\.ts$/],
  ["XC14", /(^|\/)(runtime_catalog|runtime_graph_function_registry|declared_execution_context|catalog_input_admission|catalog_invocation|selected_catalog_execution)\.ts$/],
  ["XC15", /^(code\/src\/abg\/m03\/events\/|code\/src\/abg\/m03\/(contracts|runner)\/(c_call_|event_admission|event_factories|construction_event_causality|construction_runtime_events|payload_ledger|replay_attestation))/],
  ["XC16", /(^|\/)(event_calculus|continuation_transition|replay_admitted_runtime_result|replay_attestation|projection|traversal_non_progress|graph_span_reentry)\.ts$/],
  ["XC17", /(^|\/)fp_result_contract_admission\.ts$/],
  ["XC18", /(^|\/)(plugin_selection|plugins)\.ts$/],
  ["XC19", /(^|\/)(plugin_result_envelope|plugin_result_interface_contract|plugin_traversal_observer|live_plugin_archive|standard_live_plugins)\.ts$/],
  ["XC20", /(^|\/)retry_repair\.ts$/],
  ["XC21", /^(code\/src\/(abg\/m03\/(transport\/|runner\/attached_fp_worker)|shared\/(abg_library\/(agent_transport|transport_contracts)\.ts|traced_process\/)))/],
  ["XC22", /(^|\/)fh_interaction\.ts$/],
  ["XC23", /(^|\/)(executive_observer|observer_operation_contracts|tuner_operation_contracts|observer_tier|tuner_tier|executive_observer_runner)\.ts$/],
  ["XC24", /(^|\/)(fp_consciousness|construction_action_catalog|construction_action_kinds|construction_hook_resolution|construction_intent|construction_observation|construction_pressure_package|construction_priority|construction_progress|construction_projection|construction_validation|one_surface_authority)\.ts$/],
  ["XC25", /(^|\/)(one_surface_program_compiler|one_surface_program_runtime|one_surface_execution|one_surface_execution_ingress|one_surface_result_projection|one_surface_semantic_admission)\.ts$/],
  ["XC26", /(^|\/)(consensus_contract_family|consensus_gtl_body|consensus_instruction_protocol|review_consensus_modules|consensus_contract_phase_a|consensus_runtime_native_definitions)\.ts$/],
  ["XC27", /^(contracts\/(capabilities|catalog|native|operations|schemas|vocabularies)\/|code\/src\/app\/m04\/public_contracts\/)/],
  ["XC28", /^code\/src\/app\/m04\/public_sdk\//],
  ["XC29", /^code\/src\/(bin\/abg\.cli\.ts|app\/m04\/public_cli\/)/],
  ["XC31", /^code\/src\/app\/m04\/install_bootstrap\/typescript_installer\.ts$/],
  ["XC32", /^code\/src\/cli\/command\.ts$/],
  ["XC30", /^code\/src\/(cli\/|bin\/(abg\.install|abiogenesis)\.ts|app\/m04\/install_bootstrap\/)/],
  ["XC33", /^code\/src\/app\/m04\/(control\/|max_autonomy\/|start\.ts$|public_start\.ts$|admission\/public_start\.ts$)/],
  ["XC34", /^(code\/src\/app\/m04\/(product_intake|workspace|toolchain_binding|bootloader|contracts|asset_addressing|event_ingress|gaps|live_status|result_assessment)\/|code\/src\/app\/m04\/(index|live_capability|start_context)\.ts$)/],
  ["XC35", /^code\/src\/qualification\/m05\//],
  ["XC36", /(^|\/)(generated|manifests?)\/|(^|\/)[^/]*(catalog|manifest)[^/]*\.(json|jsonl)$/],
  ["XC37", /^test_env\/.*(compiled|compiler|hog_program|complete_c_program|execution_handoff|one_surface_program)/],
  ["XC38", /^test_env\//],
  ["XC39", /^design\//],
  ["XC40", /(^|\/)saga_frontier(_runner)?\.ts$/],
  ["XC41", /^code\/src\/abg\/m03\/(admission\/carriers|contracts\/(admission_hygiene|artifact_schemas|carriers|constructors|leaf_task|m03_owner_contract_set|output_allocation|result_assessment_relation|route_basis|runtime_schema_admission|runtime_support|traversal_execution_admission_internal|traversal_execution_contract|traversal_execution_family))\.ts$/],
  ["XC42", /^code\/src\/abg\/m03\/(contracts\/(allowed_consequence_traversal_catalog|composed_stage_set|consequence_traversal_action|fn_composition|fp_stages|hog_handler_bindings|hook_actions|iteration_state_action|node_type_satisfaction|regime_resolution|retry_frontier|temporal_algebra|temporal_properties|temporal_property_gates|temporal_property_runtime|traversal_modulation|workspace_zoom_foldback)|runner\/(standard_handler_runtime|standard_handlers))\.ts$/],
  ["XC43", /^code\/src\/abg\/m03\/contracts\/(assurance|assurance_register|current_observation|depth_proof_map|edge_assurance_contract|eval_suite|evaluation_set|mutation_outcomes|observed_state|overlay_frame|proof_strength_admission|runtime_liveness|test_report_verification|traversal_structure_probe)\.ts$/],
  ["XC44", /^code\/src\/abg\/m03\/contracts\/(declaration_reprice|default_instruction_startup|defect_intake|halt_diagnosis|instruction_assembly|requirement_event_payload_kinds|requirement_proof_carry_through|requirement_proof_carry_through_producer|requirements_algebra|requirements_route|run_segments|workspace_hygiene)\.ts$/],
  ["XC45", /^code\/src\/abg\/m03\/(contracts\/(catalog_operation_contracts|gtl_conformance_operation_contracts|one_surface_contract_family|one_surface_operation_contracts|private_public_operation_ingress|public_operation_artifact_boundary|runtime_authoring_operation_contracts|runtime_projection_operation_contracts)|runner\/(assurance_gate|construction_runner|public_operation_admission|public_runtime_projections|runtime_authoring_routes))\.ts$/],
  ["XC46", /^code\/src\/shared\/(abg_config\/load|abg_delivery_library\/(carriers|constructors|injection|materialization)|abg_library\/(carriers|expectations|proof|tenant_conformance_manifest)|engine_authority_fields|lever_registry\/(overrides|registry)|runtime_identity|validation\/(canonical_native_schema_projector|governed_enums|immutable_native_value|native_contract_primitives|native_named_check_registry|owner_native_operation_contract_source|primitives))\.ts$/],
  ["XC47", /^code\/src\/(abg\/(executive|m03\/(admission|contracts|runner)|requirements)\/index|abg\/m03\/index|app\/m04\/admission\/index|gtl\/requirements\/index|shared\/(abg_delivery_library|abg_library|lever_registry)\/index|index)\.ts$|^code\/src\/node_shims\.d\.ts$/],
  ["XC48", /^(\.gitignore|README\.md|code\/README\.md|config\/(abg\.config\.json|publication-runtime-profile\.json)|eslint\.config\.mjs|package-lock\.json|package\.json|tsconfig\.semantic-strict\.json)$/],
  ["XC49", /^(abiogenesis-typescript-tenant-.*\.tgz|node_modules)$/],
];

const counts = Object.fromEntries(rules.map(([id]) => [id, 0]));
const membership = [];

for (const fullPath of paths) {
  if (!fullPath.startsWith(prefix)) throw new Error(`out of scope: ${fullPath}`);
  const path = fullPath.slice(prefix.length);
  const match = rules.find(([, predicate]) => predicate.test(path));
  if (!match) throw new Error(`unclassified: ${path}`);
  counts[match[0]] += 1;
  membership.push(`${match[0]}\t${fullPath}`);
}

const bytes = `${membership.join("\n")}\n`;
console.log(JSON.stringify({
  total: membership.length,
  digest: crypto.createHash("sha256").update(bytes).digest("hex"),
  counts,
}, null, 2));
```

## Result

```text
total: 1935
membership SHA-256: 9516301aa51dc0a41f832847d17268106c046d93a8a9f4a78c56991ba5b929f1
```

| Family | Paths | Family | Paths | Family | Paths |
|---|---:|---|---:|---|---:|
| XC01 | 14 | XC18 | 2 | XC35 | 30 |
| XC02 | 3 | XC19 | 5 | XC36 | 9 |
| XC03 | 4 | XC20 | 1 | XC37 | 8 |
| XC04 | 12 | XC21 | 11 | XC38 | 976 |
| XC05 | 1 | XC22 | 1 | XC39 | 278 |
| XC06 | 2 | XC23 | 6 | XC40 | 2 |
| XC07 | 3 | XC24 | 12 | XC41 | 15 |
| XC08 | 2 | XC25 | 6 | XC42 | 19 |
| XC09 | 2 | XC26 | 6 | XC43 | 14 |
| XC10 | 1 | XC27 | 279 | XC44 | 12 |
| XC11 | 1 | XC28 | 9 | XC45 | 13 |
| XC12 | 11 | XC29 | 3 | XC46 | 20 |
| XC13 | 1 | XC30 | 11 | XC47 | 13 |
| XC14 | 6 | XC31 | 1 | XC48 | 9 |
| XC15 | 14 | XC32 | 1 | XC49 | 4 |
| XC16 | 8 | XC33 | 14 | total | 1,935 |
| XC17 | 1 | XC34 | 59 |  |  |

`XC40` contains exactly the frozen saga-frontier contract and runner. The 120
paths formerly assigned to a generic catch-all now occupy `XC08` and
`XC41`-`XC49`. The executable partition has no fallback rule; an unmatched path
is a reproduction failure rather than an implicit archive decision.
