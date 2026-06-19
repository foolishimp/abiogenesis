# odd_sdlc TypeScript Test Surface Map

**Status**: Active
**Date**: 2026-04-26

This map records TypeScript tenant proof lanes.

## T-027 Scaffold Lane

Derives from:

- `specification/requirements/13-odd-sdlc-typescript-tenant.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-027-scaffold-odd-sdlc-typescript-package-strict-lane-and-test-harness.md`

Canonical file:

- `test_env/tests/test_t027_scaffold.test.mjs`

The lane proves only package identity and scaffold status. It does not claim
domain behavior, graph publication, ABG binding, public start, projection,
constructor, or qualification parity.

## T-028 ABIogenesis Substrate Binding Lane

Derives from:

- `specification/requirements/13-odd-sdlc-typescript-tenant.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `build_tenants/typescript/design/ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.md`
- `.ai-workspace/tickets/completed/T-028-bind-odd-sdlc-typescript-to-abiogenesis-typescript-substrate-contract.md`

Canonical file:

- `test_env/tests/test_t028_abiogenesis_substrate_binding.test.mjs`

The lane proves that `odd_sdlc.TS` consumes ABIogenesis TypeScript through a
declared dependency, admits one substrate `ExecutionBasis`, and uses
ABI-derived replay projection for next-vector truth.

## T-029 Domain Carrier Lane

Derives from:

- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `specification/requirements/12-declarative-operational-state-transitions.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_FIRST_SLICE_IACS.md`
- `.ai-workspace/tickets/completed/T-029-realize-typescript-domain-asset-and-worksite-carriers.md`

Canonical file:

- `test_env/tests/test_t029_domain_carriers.test.mjs`

The lane proves closed immutable admission for asset, asset type, asset family,
asset binding, worksite, capability, work-act, operational command/result/state
projection, and runtime-return evidence carriers.

## T-030 Graph Catalog And Module Lane

Derives from:

- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `specification/requirements/12-declarative-operational-state-transitions.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`
- `.ai-workspace/tickets/completed/T-030-publish-typescript-gtl-function-catalog-and-executive-programs.md`
- `.ai-workspace/tickets/completed/T-049-design-typescript-reusable-odd-sdlc-graph-function-library.md`
- `.ai-workspace/tickets/completed/T-055-realize-typescript-reusable-single-typed-traversal-library-slice.md`
- `.ai-workspace/tickets/completed/T-056-realize-typescript-ingress-project-library-slice.md`

Canonical file:

- `test_env/tests/test_t030_graph_catalog_module.test.mjs`

The lane proves that SDLC programs are published as ABIogenesis GTL graph
functions, that executive programs materialize through ABI carriers, that jobs
cannot target unpublished graph functions, and that the first reusable library
graph function `Fg_single_typed_traversal` is published as GTL/module truth
with product leaf functions marked as specializations. It also proves
`Fg_ingress_project` is published as reusable GTL/module truth for bootstrap
project ingress.

## T-031 Workspace Ingress And Bootstrap Lineage Lane

Derives from:

- `specification/requirements/08-odd-sdlc-first-slice.md`
- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`
- `.ai-workspace/tickets/completed/T-031-realize-typescript-workspace-ingress-normalization-and-bootstrap-lineage.md`
- `.ai-workspace/tickets/completed/T-056-realize-typescript-ingress-project-library-slice.md`

Canonical file:

- `test_env/tests/test_t031_workspace_ingress.test.mjs`

The lane proves pure typed ingress over checked-in portable source snapshots:
source-input digests, authority markers, project constraints admission, imported
requirement authority, `Fg_ingress_project` ownership,
`IngressSourceSet`/`ProjectIngressContract` publication, explicit ambiguity and
bootstrap gap outputs, and `InputSet -> Project`/requirement lineage. It does
not depend on local filesystem fixtures.

The full repo-local `data_mapper.template` fixture is retained as optional local
reference comparison through `npm run test:reference:data-mapper` and
`test_env/fixtures/data_mapper_reference_manifest.md`. It is an independent
qualification workload, not part of `odd_sdlc` product scope.

## T-032 Query Domain And Gap Projection Lane

Derives from:

- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `build_tenants/python/design/GAP_ANALYSIS_DOSSIER.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-032-realize-typescript-query-domain-gaps-and-gap-dossier-projections.md`

Canonical file:

- `test_env/tests/test_t032_query_gap_projection.test.mjs`

The lane proves read-only query-domain, gap, dossier, and span projections over
typed SDLC carriers, GTL publication, and ABI replay truth. It also proves that
query-domain fails closed when the admitted GTL module is missing catalog
functions.

## T-039 Query-Domain Structural Coherence Lane

Derives from:

- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-039-close-typescript-query-domain-structural-drift-over-admitted-gtl-module.md`

Canonical file:

- `test_env/tests/test_t039_query_domain_structural_drift.test.mjs`

The lane proves query-domain does not treat graph-function name equality as
structural equivalence. Same-name output drift, vector drift, and start-target
drift fail closed before catalog-derived ownership, program, or target read
models are published.

## T-040 Fixture Portability And Test-Lane Authority

Derives from:

- `specification_methodology/specification/standards/SPEC_METHOD.md`
- `build_tenants/typescript/test_env/fixtures/data_mapper_reference_manifest.md`
- `.ai-workspace/tickets/completed/T-040-govern-typescript-data-mapper-fixture-proof-portability-and-test-lane-authority.md`

Canonical file:

- `test_env/tests/test_t040_fixture_portability.test.mjs`

The lane proves required semantic closure excludes optional reference fixtures.
The `data_mapper.template` reference proof is explicitly classified as optional
local reference comparison and is run through `npm run test:reference:data-mapper`
from the repo-local fixture by default. `ODD_SDLC_DATA_MAPPER_TEMPLATE_ROOT`
overrides that default only when intentionally testing another fixture root.

## T-033 Public Start Lane

Derives from:

- `specification/requirements/08-odd-sdlc-first-slice.md`
- `build_tenants/python/design/FP_WORKER_ATTACHMENT_CONTRACT.md`
- `build_tenants/typescript/design/ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_POLICY_SURFACES.md`
- `.ai-workspace/tickets/completed/T-033-realize-typescript-public-start-admission-execution-contract-and-worker-attachment.md`
- `.ai-workspace/tickets/completed/T-057-extract-remaining-typescript-route-start-operational-policy-surfaces.md`

Canonical file:

- `test_env/tests/test_t033_public_start.test.mjs`

The lane proves closed public-start admission, query-domain target resolution,
execution-contract construction, F_P worker attachment blocking, and one ABI
handoff projection without tenant-local iteration. It also proves stale
query-domain/module pairs return typed blocked outcomes instead of throwing
through ABI admission.

T-057 adds proof that public-start target resolution policy is declared data
rather than private resolver branch folklore.

## T-034 Constructor And Evaluator Hook Lane

Derives from:

- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `specification/scenarios/09-odd-sdlc-software-domain-worksite-lifecycle.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_HOOK_CONTRACTS.md`
- `.ai-workspace/tickets/completed/T-034-realize-typescript-sdlc-constructor-and-evaluator-hook-set.md`
- `.ai-workspace/tickets/completed/T-050-split-typescript-hook-set-monolith-into-prime-seams.md`
- `.ai-workspace/tickets/completed/T-051-extract-typescript-policy-branch-mappings-into-catalog-surfaces.md`

Canonical file:

- `test_env/tests/test_t034_hook_set.test.mjs`

The lane proves SDLC-owned hook contracts over the published edge classes,
separate F_D preflight/postflight evaluation around F_P work-report admission,
graph-function authority for generated assets, requested/returned operation
matching, generated-asset contract blocking, ambiguity candidate preservation,
wrong-kind rejection for serialized work reports, and no tenant-local runtime
event or next-traversal selection. It also proves unresolved hook closure names
ABG runtime selection and retry-repair authority rather than leaving
`maySelectNextTraversal: false` as the only closure posture.

T-050 adds module-method proof for the same hook boundary. The hook seam is now
split into carriers, admission, catalog, evaluators, work-report projection,
fixtures, and hook-turn facade, with the structural carrier diagram recorded in
`ODD_SDLC_TYPESCRIPT_HOOK_CONTRACTS.md`.

T-051 adds hook policy proof. Target asset to edge-class and default-operation
mappings are declared in `hooks/policy.ts`, and the T-034 lane proves the
policy table exactly covers the graph function catalog outputs.

## T-035 Traceability And Requirement Closure Lane

Derives from:

- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TRACEABILITY_REQUIREMENT_CLOSURE.md`
- `.ai-workspace/tickets/completed/T-035-realize-typescript-traceability-lineage-and-requirement-closure.md`

Canonical file:

- `test_env/tests/test_t035_traceability_requirement_closure.test.mjs`

The lane proves lineage over admitted source, graph-function work reports,
generated asset authority, explicit proof claims, requirement closure register,
and repair frontier. Trace tags alone remain partial evidence and unresolved
requirements are carried forward.

## T-036 Gap Triage Homeostatic Route Lane

Derives from:

- `specification/requirements/11-odd-sdlc-homeostatic-gap-triage-and-intent-renewal.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_GAP_TRIAGE_HOMEOSTATIC_LOOP.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_POLICY_SURFACES.md`
- `.ai-workspace/tickets/completed/T-036-realize-typescript-gap-triage-homeostatic-loop-and-ticket-routing.md`
- `.ai-workspace/tickets/completed/T-057-extract-remaining-typescript-route-start-operational-policy-surfaces.md`

Canonical file:

- `test_env/tests/test_t036_gap_triage_homeostatic_route.test.mjs`

The lane proves observation, classification, route binding, constitutional
repricing proposal, ticket work-item route, and loopback retirement as separate
typed carriers. It also proves the triage workflow is published as GTL graph
functions and remains downstream of ABG gap truth and TICKET_METHOD ticket
authority.

T-057 adds proof that triage classification and route policies are declared
data surfaces consumed by the semantic kernel.

## T-037 Operational Transition And Runtime Return Lane

Derives from:

- `specification/requirements/12-declarative-operational-state-transitions.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_OPERATIONAL_TRANSITION_RUNTIME_RETURN.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_POLICY_SURFACES.md`
- `.ai-workspace/tickets/completed/T-037-realize-typescript-operational-transition-and-runtime-return-surfaces.md`
- `.ai-workspace/tickets/completed/T-057-extract-remaining-typescript-route-start-operational-policy-surfaces.md`

Canonical file:

- `test_env/tests/test_t037_operational_transition_runtime_return.test.mjs`

The lane proves operational command/result/projection separation, capability
gating, pending external evidence, admitted returned result projection, one-step
cooperative advance, and runtime-return evidence feeding observation and retrofit
graph functions.

T-057 adds proof that operational lane bindings are declared policy data.

## T-038 RC Qualification Lane

Derives from:

- `specification/requirements/13-odd-sdlc-typescript-tenant.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_RC_QUALIFICATION_REPORT.md`
- `.ai-workspace/tickets/completed/T-038-qualify-odd-sdlc-typescript-rc-against-python-functionality-and-odd-scenarios.md`

Canonical file:

- `test_env/tests/test_t038_rc_qualification.test.mjs`

The lane proves the bounded TypeScript RC claim through a composed harnessed
sandbox that walks ingress, query/start, hook evidence, requirement closure,
triage routing, operational build result admission, and runtime-return
observation, plus ABG-populated installed sandbox proof through `test:sandbox`.
It also proves that remaining full Python-replacement gaps are not part of the
bounded RC claim and are tracked by follow-up ticket authority.

## T-042 To T-046 Forensic Remediation Lanes

Derives from:

- `.ai-workspace/comments/codex/20260426T161728Z_FORENSIC_STDO_REVIEW_typescript_tenant_T025_T041.md`
- `.ai-workspace/tickets/completed/T-042-bind-requirement-closure-proof-to-same-generated-asset-contract.md`
- `.ai-workspace/tickets/completed/T-043-bind-runtime-return-observation-to-command-identity-and-lane.md`
- `.ai-workspace/tickets/completed/T-044-admit-worker-attachment-through-non-empty-transport-contract.md`
- `.ai-workspace/tickets/completed/T-045-promote-source-input-digests-to-sha256.md`
- `.ai-workspace/tickets/completed/T-046-repair-rc-report-ticket-authority-path.md`

Canonical files:

- `test_env/tests/test_t031_workspace_ingress.test.mjs`
- `test_env/tests/test_t033_public_start.test.mjs`
- `test_env/tests/test_t035_traceability_requirement_closure.test.mjs`
- `test_env/tests/test_t037_operational_transition_runtime_return.test.mjs`
- `test_env/tests/test_t038_rc_qualification.test.mjs`

The remediation lanes close the forensic STDO review defects without widening
the bounded RC claim. They prove same-entry requirement closure binding,
runtime-return command/lane binding, non-empty worker transport admission,
SHA-256 source-input identity, and corrected completed-ticket authority in the
shareable RC report.

## T-047 Pre-Refactor Sandbox Proof Lane

Derives from:

- `specification/requirements/04-verification.md`
- `specification/requirements/13-odd-sdlc-typescript-tenant.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TENANT_DERIVATION.md`
- `.ai-workspace/tickets/completed/T-047-realize-typescript-pre-refactor-sandbox-proof-lane.md`

Canonical file:

- `test_env/sandbox/test_t047_pre_refactor_sandbox.test.mjs`

Canonical command:

- `npm run test:sandbox`

The lane is the pre-consolidation refactor gate. It writes an archived sandbox
run under `test_env/test_runs/typescript_pre_refactor_sandbox/` with `run.json`,
`summary.json`, `stdout.log`, `stderr.log`, and `postmortem.md`.

The lane proves a composed `data_mapper`-shaped traversal:

```text
ingress
-> query/start
-> public ABG handoff
-> constructor/evaluator hook evidence
-> requirement closure proof
-> triage route
-> operational transition/result admission
-> runtime-return observation
```

It records expected and actual event sequences, timing, graph functions
exercised, admitted carriers, diagnostics, residual gaps, and ABG install
evidence. Full live `F_P`, full `odd_sdlc` CLI replacement, and Python live
archive comparison remain T-041.

Fixture authority is explicit. A checked-in portable fixture is RC-lane
authority. A mutable local `data_mapper.template` run is forensic/local
reference evidence and is not RC proof authority.

## B-068 Enterprise-Core Outcome Iteration Sandbox

Derives from:

- `.ai-workspace/tickets/completed/B-068-isolate-test35-recursive-realization-deepening-in-typescript-abg-line.md`
- `.ai-workspace/comments/codex/20260426T075607Z_PROOF_test35_recursive_realization_deepening_missing_from_ts.md`
- `build_tenants/typescript/design/ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_RECURSIVE_REALIZATION_DEEPENING.md`

Canonical file:

- `test_env/sandbox/test_b068_enterprise_core_outcome_iteration.test.mjs`

Canonical command:

- `npm run test:sandbox`

The lane isolates the test35 capability as outcome iteration. It publishes a
CDME enterprise-core graph function, drives it through constructor and evaluator
plugins, and requires ABG retry-repair/continuation events before the same
realization edge can converge.

The pass condition is discovery-oriented: either the sandbox proves outcome
iteration through ABG-governed re-entry, or it archives a precise ABG gap. The
current expected successful path proves two denied closures, two ABG
continuation re-openings, and final convergence only after the enterprise core
has test35-derived source inventory, behavioral test inventory, governed build
evidence, and governed test evidence.

The lane asserts stateful handoff: attempt 2 must receive attempt 1 artifact
state and blocking reasons, and attempt 3 must receive attempt 2 artifact state
and blocking reasons. It also asserts the exact ordered ABG runtime event
sequence. Its deterministic inventory evaluator rejects shallow enterprise-core
output when required source components, behavioral test components, governed
build evidence, or governed test evidence are absent. It also rejects
ungoverned `present` build/test evidence.

The sandbox uses governed evidence refs such as `build://` and `junit://` to
verify the refactor capability. It does not claim live `data_mapper` RC
qualification; that remains T-041.

## B-069 B-068 Hardening Lane

Derives from:

- `.ai-workspace/tickets/completed/B-069-harden-b068-outcome-iteration-sandbox-gap-and-archive-proof.md`
- `.ai-workspace/tickets/completed/B-068-isolate-test35-recursive-realization-deepening-in-typescript-abg-line.md`

Canonical files:

- `test_env/sandbox/test_b068_enterprise_core_outcome_iteration.test.mjs`
- `test_env/sandbox/test_t047_pre_refactor_sandbox.test.mjs`

Canonical command:

- `npm run test:sandbox`

The lane hardens the B-068 proof. Successful outcome iteration must archive
public handoff evidence for each re-entered attempt: prior artifact state,
prior source/test inventory, prior build/test evidence state, and unresolved
reasons consumed by the next attempt.

The gap path is explicit. A bounded non-convergent run must produce
`successMode=abg_gap_detected`, `laneVerdict=passed`,
`capabilityVerdict=not_proved`, `verdict=failed`, and an ABG retry-stop gap
such as `abg_retry_repair_stopped:retry_budget_exhausted`.

T-047 fixture authority is also explicit. Mutable local `data_mapper.template`
evidence is `forensic_local_reference`; it cannot be cited as RC proof
authority.

## T-052 ABG-Populated Installed Sandbox Contract

Derives from:

- `.ai-workspace/tickets/completed/T-052-require-abg-populated-installed-workspaces-for-all-typescript-sandboxes.md`
- `abiogenesis/.ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md`
- `abiogenesis/.ai-workspace/tickets/completed/T-077-export-typescript-m05-sandbox-archive-framework-as-public-downstream-api.md`

Canonical files:

- `test_env/sandbox/abg_installed_workspace.mjs`
- `test_env/sandbox/test_t052_abg_installed_sandbox_contract.test.mjs`
- `test_env/sandbox/test_t047_pre_refactor_sandbox.test.mjs`
- `test_env/sandbox/test_b068_enterprise_core_outcome_iteration.test.mjs`

Canonical command:

- `npm run test:sandbox`

The lane requires every current TypeScript sandbox test to provision a fresh
ABG-populated installed workspace through the public ABG TypeScript installer.
Each sandbox archive carries `abg_install/evidence.json`,
`abg_install/typescript-installer-manifest.json`,
`abg_install/install-manifest.json`, `abg_install/runtime_identity.json`,
`abg_install/command_probe.json`, `abg_install/events.jsonl`,
`abg_install/projection.json`, and public ABG `M05` archive qualification under
`abg_install/m05_archive/`.

The registry test fails closed if a sandbox omits
`provisionAbgInstalledSandbox(...)` or
`assertAbgInstalledSandboxEvidence(...)`. The shared fixture also imports
`@abiogenesis/typescript-tenant/qualification/m05` and records
`m05ArchiveQualification`, so the reusable ABG archive framework dependency is
closed for the current sandbox lane. This does not close the full `odd_sdlc`
Python-replacement lane in T-041.

## T-053 Live F_P data_mapper Qualification Lane

Derives from:

- `.ai-workspace/tickets/completed/T-053-build-typescript-live-fp-data-mapper-qualification-lane.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_LIVE_FP_DATA_MAPPER_QUALIFICATION.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_HOOK_CONTRACTS.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`

Canonical file:

- `test_env/live/test_t053_live_fp_data_mapper.test.mjs`

Canonical command:

- `ODD_SDLC_TS_LIVE_FP=1 npm run test:live`

The lane is disabled by default and runs only when explicitly enabled. The
accepted run provisions an ABG-installed workspace, reads the real
`data_mapper.template` source, opens public start over
`bootstrap_release_self_test`, dispatches an external Codex `F_P` worker for
the `derive_code_surface` edge, admits the generated artifact through
`SdlcConstructorResult`, and closes the hook postflight as passed.

Accepted local archive:

- `test_env/test_runs/t053_live_data_mapper/20260426T183216072Z_pid7194/`

The accepted archive records install evidence, prompt and manifest, worker
stdout/stderr, generated code, work report, constructor result, hook outcome,
run summary, and postmortem. It proves a live external `F_P` traversal class; it
does not prove full installed `odd_sdlc` CLI replacement, release-cut
packaging, or Python archive equivalence.

## T-058 Spec Method Entrypoint Lane

Derives from:

- `.ai-workspace/tickets/completed/T-058-realize-typescript-public-cli-adapter-over-graph-query-start-surfaces.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_SPEC_METHOD_ENTRYPOINT.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_POLICY_SURFACES.md`

Canonical file:

- `test_env/tests/test_t058_spec_method_entrypoint.test.mjs`

Canonical command:

- `npm run test:t058`

The lane proves the bounded installed Spec Method entrypoint for `catalog`,
`query-domain`, `gaps`, `start`, and `rc-report`. The shell binary is only a
process launcher over the same entrypoint. Command law, traversal selection,
retry/reentry, and runtime projection stay behind the installed
odd_sdlc/ABG boundary.

The lane also proves the package binary returns JSON, propagates command
errors, and does not contain local iteration or a hidden ABG runner.

This closes only the bounded command-adapter slice. It does not close
side-effecting install/normalize, release-cut packaging, or full Python
operational replacement.

## T-059 Install/Normalize And Release-Cut Adapter Lane

Derives from:

- `.ai-workspace/tickets/completed/T-059-realize-typescript-install-normalize-and-release-cut-adapters.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_INSTALL_RELEASE_ADAPTERS.md`
- `abiogenesis/.ai-workspace/tickets/completed/T-076-realize-typescript-abg-installer-for-downstream-sandbox-population.md`

Canonical file:

- `test_env/tests/test_t059_install_release_adapter.test.mjs`

Canonical command:

- `npm run test:t059`

The lane proves the public TypeScript install and release-cut side-effect
adapters. Install packages `@odd-sdlc/typescript-tenant` into a target
workspace, invokes the public ABG TypeScript installer, binds `odd-sdlc-ts`,
`genesis-ts`, and `abiogenesis-ts`, and writes install manifest,
normalization projection, and bootstrap guidance. The installed `odd-sdlc-ts`
command is executed from the target workspace.

Release-cut writes a package artifact, release-cut manifest, postmortem, and
`odd-sdlc-ts` binary-binding proof.

The lane does not claim traversal, retry, live worker execution, or Python
archive equivalence. It closes the install/normalize and package release-cut
preconditions for T-041.

## T-060 TypeScript/Python Archive Comparison

Derives from:

- `.ai-workspace/tickets/completed/T-060-publish-typescript-live-vs-python-archive-comparison-postmortem.md`
- `build_tenants/typescript/qualification/ODD_SDLC_TYPESCRIPT_LIVE_PYTHON_ARCHIVE_COMPARISON.md`

Canonical guard:

- `test_env/tests/test_t038_rc_qualification.test.mjs`

Canonical command:

- `npm run test:t038`

The lane records the side-by-side comparison between the current TypeScript
live `data_mapper` single-edge archive, Python's historical passing live
code-edge archive, and Python's richer `data_mapper` yield-chain archive.
`data_mapper` is used as an independent sufficiency workload for SDLC
functionality. The comparison supports bounded TypeScript RC preconditions. It
does not claim full replacement of Python's historical multi-edge data_mapper
qualification depth.

## T-064 Installed Operator UX Replay Lane

Derives from:

- `.ai-workspace/tickets/active/T-064-define-and-realize-test46-installed-operator-ux-for-governed-typescript-sdlc-run.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_INSTALLED_OPERATOR_UX.md`
- `specification/requirements/14-odd-sdlc-installed-product-contract.md`

Canonical file:

- `test_env/tests/test_t064_installed_operator_ux.test.mjs`

Canonical command:

- `npm run test:t064`

The lane proves the first installed-operator loop above the bounded public CLI
adapter. A supplied `process://...` worker transport is admitted, a handoff
manifest is derived from the selected graph-function edge, the worker writes a
typed output artifact and JSON result report, deterministic postflight passes,
ABG-compatible runtime events are appended to `.ai-workspace/events/events.jsonl`,
and a second `gaps` projection advances from `derive_intent_surface` to
`derive_product_surface`.

The lane also guards the operator UX: default `gaps`/`start` serialization is
compact text, while `ODD_SDLC_TS_OUTPUT=json` preserves the full machine payload.

The lane closes only the one-edge installed-operator steel thread. It does not
claim full `data_mapper` RC depth, multi-edge autonomous convergence, or generic
ABG output allocation.

## T-066 Product Materialization Contract Lane

Derives from:

- `.ai-workspace/tickets/active/T-066-realize-typescript-downstream-product-code-materialization-over-odd-graph-functions.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_INSTALLED_OPERATOR_UX.md`
- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`

Canonical file:

- `test_env/tests/test_t066_product_materialization_contract.test.mjs`

Canonical command:

- `npm run test:t066`

The lane proves the first deterministic guard against the `data_mapper.test46.ts`
RC blocker: a `derive_code_surface` handoff carries a tenant-root product
materialization contract, admits a source file written under
`build_tenants/<tenant>/`, archives the materialized-file manifest, and rejects
markdown-only `code_surface.md` output as insufficient implementation
realization evidence.

This lane is necessary but not sufficient for full RC. The remaining `T-066`
bar is a fresh installed external `data_mapper` run that materializes a
non-trivial downstream source/test inventory and proves it through archive and
execution evidence.

## T-068 Conform Project Profile Lane

Derives from:

- `.ai-workspace/tickets/completed/T-068-realize-typescript-conform-project-profile-before-product-materialization.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_WORKSPACE_INGRESS_SEAMS.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_REUSABLE_GRAPH_FUNCTION_LIBRARY.md`
- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`

Canonical file:

- `test_env/tests/test_t068_conform_project_profile.test.mjs`

Canonical command:

- `npm run test:t068`

The lane proves the missing bootstrap layer:

```text
{ documents } -> conform project -> graph program execution
```

It uses generic tenant registries, not data_mapper-specific assumptions, to
derive selected tenant root, module inventory, capability contracts, execution
contracts, realization mode, and handoff evidence before product
materialization.

## T-076 Deterministic Traversal State Machine Lane

Derives from:

- `.ai-workspace/tickets/active/T-076-reconcile-test35-and-typescript-deterministic-traversal-state-machines.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_DETERMINISTIC_TRAVERSAL_STATE_MACHINE.md`

Canonical file:

- `test_env/tests/test_t076_deterministic_traversal_state_machine.test.mjs`

Canonical command:

- `npm run test:t076`

The lane proves a failed `derive_code_surface` postflight becomes admitted
retry/gap truth and that the next handoff carries prior gap evidence. It now
also folds the materialization and obligation-carry assurance ledgers over the
same failure and repair path.

## T-077 Through T-084 Assurance Ledger Lane

Derives from:

- `.ai-workspace/tickets/completed/T-077-implement-materialization-assurance-ledger.md`
- `.ai-workspace/tickets/completed/T-078-implement-semantic-convergence-assurance-ledger.md`
- `.ai-workspace/tickets/completed/T-079-implement-obligation-carry-assurance-ledger.md`
- `.ai-workspace/tickets/completed/T-080-implement-requirement-fulfillment-assurance-ledger.md`
- `.ai-workspace/tickets/completed/T-081-implement-ambiguity-assurance-ledger.md`
- `.ai-workspace/tickets/completed/T-082-implement-capability-assurance-ledger.md`
- `.ai-workspace/tickets/completed/T-083-implement-shallow-realization-assurance-ledger.md`
- `.ai-workspace/tickets/completed/T-084-compose-assurance-ledgers-into-traversal-satisfaction-tests.md`

Canonical files:

- `test_env/tests/test_t077_t083_assurance_ledgers.test.mjs`
- `test_env/tests/test_t084_assurance_ledger_composition.test.mjs`

Canonical commands:

- `npm run test:t077-t083`
- `npm run test:t084`

The lane implements the assurance registers as explicit graph-visible ledger
functions. Each dimension emits a typed `sdlc_assurance_ledger`, and T-084 folds
the ledgers into `TraversalRequirementSatisfaction` with deterministic
precedence for close, retry, blocked, and reprice outcomes. The lane does not
change ABG.

## T-087 Through T-091 Induction And Traversal Pressure Lanes

Derives from:

- `.ai-workspace/tickets/active/T-087-realize-typescript-project-induction-as-fd-graph-function-before-downstream-traversal.md`
- `.ai-workspace/tickets/completed/T-088-realize-typescript-cumulative-traversal-intent-package-from-test35-pressure.md`
- `.ai-workspace/tickets/completed/T-089-harden-traversal-intent-pressure-enforcement-on-every-prompt-edge.md`
- `.ai-workspace/tickets/active/T-091-harden-typescript-traversal-closure-against-lossy-obligation-carriers.md`
- `.ai-workspace/tickets/active/T-096-prove-managed-traversal-bootstrap-from-unordered-source-set.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TRAVERSAL_INTENT_PACKAGE.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_WORKSPACE_INGRESS_SEAMS.md`

Canonical files:

- `test_env/fixtures/data_mapper_induction_manifest.md`
- `test_env/fixtures/internal_data_mapper_fixture.mjs`
- `test_env/tests/test_t087_project_induction.test.mjs`
- `test_env/tests/test_t088_traversal_intent_package.test.mjs`
- `test_env/tests/test_t089_traversal_pressure_enforcement.test.mjs`
- `test_env/tests/test_t091_traversal_obligation_payload.test.mjs`
- `test_env/tests/test_t096_managed_traversal_bootstrap.test.mjs`
- `test_env/sandbox/test_t087_t091_t096_internal_data_mapper_induction_sandbox.test.mjs`

Canonical commands:

- `npm run test:t087`
- `npm run test:t088`
- `npm run test:t089`
- `npm run test:t091`
- `npm run test:t096`
- `npm run test:t087-t096:data-mapper-sandbox`

The lane proves the first bootstrap graph edge and every prompt-bearing worker
handoff preserve cumulative traversal pressure. T-091 closes the lossy-carrier
failure found in `data_mapper.test52.ts`: imported requirement markers are
expanded back to concrete source refs, source digests, and bounded source
snippets before handoff, deterministic requirement-family files are materialized
from concrete bootstrap requirement lines, marker-only requirements are
rejected before worker dispatch, and postflight rejects a fulfilled requirement
assessment that cites only input authority without output coverage evidence.

The internal data_mapper sandbox is a live installed-workspace regression lane.
It copies the checked-in fixture under `test_env/test_runs`, installs the current
TypeScript product into that workspace, runs `gaps`, runs `start`, and asserts
the produced `conform_project_report.json`, canonical project constraints,
requirement-family files, source refs, and post-induction route. It does not use
`ODD_SDLC_DATA_MAPPER_TEMPLATE_ROOT` and does not read `ai_sdlc_examples`.

## T-102/T-109 ABG RC6 SDLC Lifecycle Ledger Lanes

Derives from:

- `.ai-workspace/tickets/active/T-102-define-typed-fp-function-stages-and-abg-owned-admission-flow.md`
- `.ai-workspace/tickets/active/T-109-publish-authoritative-edge-ledger-lineage-chain-for-typescript-traversal-parity.md`
- `specification/requirements/13-odd-sdlc-typescript-tenant.md`
- `specification/requirements/15-odd-sdlc-scheduling-phase.md`

Canonical files:

- `test_env/fixtures/t102_t109_rc6_mini_sdlc_lifecycle.mjs`
- `test_env/sandbox/test_t102_t109_abg_rc6_semantic_ledger_sandbox.test.mjs`
- `test_env/live/test_t102_t109_abg_rc6_live_semantic_ledger.test.mjs`

Canonical commands:

- `npm run test:t102-t109:rc6-sandbox`
- `ODD_SDLC_TS_T109_LIVE=1 npm run test:t102-t109:rc6-live`

The lane proves the same mini `odd_sdlc` lifecycle result in deterministic and
live form. The lifecycle is not a generic data transform: `Workspace.system`
bootstrap input produces `Workspace.A.requirements.ledger`,
`Workspace.A.requirements.schedule`, design, implementation, and qualification
surfaces. The evaluator checks semantic content requirement-by-requirement and
keeps F_D mechanical checks non-closing.

## T-168 Design-Consumer Test Pipeline Lane

Derives from:

- `.ai-workspace/tickets/active/T-168-build-design-consumer-test-pipeline-for-co-affirming-implementation.md`
- `specification/requirements/10-odd-sdlc-software-domain-buildout.md`
- `specification/requirements/13-odd-sdlc-typescript-tenant.md`
- `specification/requirements/16-edge-gain-closure-contract.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TEST_PIPELINE.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TRAVERSAL_ASSURANCE_INTEGRATION.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_EDGE_GAIN_CLOSURE_CONTRACT.md`

Canonical file:

- `test_env/tests/test_t168_design_consumer_test_pipeline.test.mjs`

Canonical command:

- `npm run test:t168`

The lane proves the test pipeline is a graph-correlated design consumer, not a
harness-only assertion. It checks the test lifecycle nodes and producing graph
functions, binds test cases to test data, expected results, declared execution
evidence, verification rows, and a co-affirmation ledger, and blocks closure
when case range, data, framework execution, observed tests, or verification are
missing. It also proves the current full overlay cannot collapse
`derive_component_code_surface` into product convergence before the required
test and release lifecycle closes.

## T-169 Target Carrier Contract Lane

Derives from:

- `.ai-workspace/tickets/active/T-169-implement-gtl-target-carrier-contracts-for-sdlc-vector-outputs.md`
- `/Users/jim/src/apps/abiogenesis/.ai-workspace/tickets/completed/T-133-declare-gtl-target-carrier-contracts-for-graph-vector-outputs.md`
- `specification/requirements/17-target-carrier-contracts.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_TARGET_CARRIER_CONTRACTS.md`
- `build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_EDGE_GAIN_CLOSURE_CONTRACT.md`

Canonical file:

- `test_env/tests/test_t169_target_carrier_contracts.test.mjs`

Canonical command:

- `npm run test:t169`

The lane proves close-capable SDLC graph-vector outputs carry product-owned GTL
target carrier declarations, handoff manifests project the selected contract
ref and digest, candidate admission accepts and rejects carrier envelopes from
the same contract row, and rejected or missing target-carrier admission prevents
edge closure while preserving carrier identity in fulfillment and closure
surfaces.
