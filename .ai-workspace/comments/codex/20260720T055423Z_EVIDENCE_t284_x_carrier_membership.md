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

The scope contains 1,935 paths. Every path has exactly one membership row. A
path that matches no earlier semantic family enters `XC41`; that row is an
archive/refusal boundary and cannot be used as successor donor authority
without reviewed T-284 re-entry.

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
  ["XC08", /(^|\/)c_algebra_hog_compiler\.ts$/],
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
  ["XC41", /.*/],
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
membership SHA-256: 614610e79c37983cb37aaa3fc105f320c1429065766f98a9c36083ff9ccabccd
```

| Family | Paths | Family | Paths | Family | Paths |
|---|---:|---|---:|---|---:|
| XC01 | 14 | XC15 | 14 | XC29 | 3 |
| XC02 | 3 | XC16 | 8 | XC30 | 11 |
| XC03 | 4 | XC17 | 1 | XC31 | 1 |
| XC04 | 12 | XC18 | 2 | XC32 | 1 |
| XC05 | 1 | XC19 | 5 | XC33 | 14 |
| XC06 | 2 | XC20 | 1 | XC34 | 59 |
| XC07 | 3 | XC21 | 11 | XC35 | 30 |
| XC08 | 1 | XC22 | 1 | XC36 | 9 |
| XC09 | 2 | XC23 | 6 | XC37 | 8 |
| XC10 | 1 | XC24 | 12 | XC38 | 976 |
| XC11 | 1 | XC25 | 6 | XC39 | 278 |
| XC12 | 11 | XC26 | 6 | XC40 | 2 |
| XC13 | 1 | XC27 | 279 | XC41 | 120 |
| XC14 | 6 | XC28 | 9 | total | 1,935 |

`XC40` contains exactly the frozen saga-frontier contract and runner. `XC41`
contains no admitted donor by implication. If M3 needs one of its 120 paths,
the correction vector must be amended with an exact Product obligation,
destination, accepted loss, admission order, and owning proof before extraction.
