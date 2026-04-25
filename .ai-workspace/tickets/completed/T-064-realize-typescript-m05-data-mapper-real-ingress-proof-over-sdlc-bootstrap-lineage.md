# T-064 Realize TypeScript M05 Data Mapper Real Ingress Proof Over SDLC Bootstrap Lineage

- id: T-064
- title: Realize TypeScript M05 data mapper real ingress proof over SDLC bootstrap lineage
- type: qualification
- ticket_category: substrate_semantics_investigation
- status: completed
- build_tenant: typescript
- goal: odd-native-sdlc-substrate-clarity
- change_intent: Prove that the existing TypeScript `SdlcBootstrapInputSet -> SdlcProject` bootstrap lineage carrier can consume the real `data_mapper.template` authority corpus plus recent generated data-mapper run surfaces, while preserving source-input lineage and comparing the proof against Python SDLC deterministic normalization behavior.
- change_class: realization_refactor
- re_entry_point: design_surface
- triaged_at: 2026-04-26
- priority: high
- created_at: 2026-04-26
- updated_at: 2026-04-26
- completed_at: 2026-04-26
- dependencies:
  - T-063 completed
- affected_boundary: `build_tenants/abiogenesis/typescript/design/**`, `build_tenants/abiogenesis/typescript/test_env/**`, `build_tenants/abiogenesis/typescript/package.json`
- intake_source: Operator request to retry the idealized bootstrap-lineage proof using the real `ai_sdlc_examples/local_projects/data_mapper/data_mapper.template` fixture, recent `data_mapper.testXX` generated runs, and Python SDLC ingest comparison.
- library_usage: none
- library_rationale: this is a fixture-backed M05 qualification proof over existing carriers, not a reusable runtime library.
- governing_design:
  - `build_tenants/abiogenesis/typescript/design/M05_SDLC_BOOTSTRAP_LINEAGE_DERIVATION.md`
  - `build_tenants/abiogenesis/typescript/design/M05_SDLC_BOOTSTRAP_LINEAGE_FIRST_SLICE_IACS.md`
  - `build_tenants/abiogenesis/typescript/design/M05_SDLC_BOOTSTRAP_LINEAGE_STRUCTURAL_CARRIER_DIAGRAM.md`
  - `build_tenants/abiogenesis/typescript/design/M05_DATA_MAPPER_REAL_INGRESS_PROOF_DERIVATION.md`
- target_truth: The TypeScript M05 bootstrap-lineage proof consumes real imported and generated data-mapper ingress surfaces by collapsing them into the existing `SdlcBootstrapInputSet` carrier before semantic derivation, without copying Python SDLC installer or constructor orchestration.
- closure_law: this ticket closes only when the real data-mapper fixture proof runs, samples the preserved template and latest generated run surfaces, compares Python normalization evidence, and verifies project, requirement, ambiguity, and lineage behavior through the existing M05 carrier set.
- evaluation_criteria:
  - design declares that no new prime carrier is introduced beyond the T-063 IACS
  - test harness reads `data_mapper.template` authority and context surfaces
  - test harness samples recent `data_mapper.test41`, `data_mapper.test42`, and `data_mapper.test43` generated surfaces
  - test harness reads Python SDLC normalization evidence and asserts the expected deterministic ingest actions are present
  - admitted input set contains real file digests and source URIs
  - derived `SdlcProject` preserves the CDME project identity
  - requirement elements include normalized imported requirement authority such as `REQ-LDM-001`
  - source-input lineage identifies which real file produced the derived requirement element
  - non-authority runtime/context surfaces remain visible as ambiguity entries rather than silently becoming semantic authority
  - focused test command is recorded in the TypeScript test surface map
- non_closure_conditions:
  - production M05 code reads the data-mapper fixture directly
  - test logic rewrites imported data-mapper project truth
  - Python normalization is copied into TypeScript as a public app behavior
  - lineage exists only in the test harness and not inside `SdlcDerivationLedger`
  - external fixture proof is added to the default semantic suite in a way that makes package-local tests depend on sibling workspace state
- proof_surface:
  - `M05_DATA_MAPPER_REAL_INGRESS_PROOF_DERIVATION.md`
  - `test_env/sandbox/test_m05_data_mapper_real_ingress.test.mjs`
  - `npm run test:t064`

## Closure Evidence

Completed on 2026-04-26.

Realization:

- `design/M05_DATA_MAPPER_REAL_INGRESS_PROOF_DERIVATION.md`
- `test_env/sandbox/test_m05_data_mapper_real_ingress.test.mjs`
- `package.json` script `test:t064`
- `test_env/test_surface_map.md` sandbox lane entry

Observed test result:

```text
tests 3
pass 3
fail 0
duration_ms 67.277917
```

Observed proof behavior:

- The sandbox lane samples `data_mapper.template` plus recent
  `data_mapper.test41`, `data_mapper.test42`, and `data_mapper.test43`
  generated run surfaces.
- The fixture proof reads Python SDLC normalization evidence and verifies
  imported-source summary creation, project-bootstrap creation, constraint
  normalization, and analysis-manifest publication.
- Real file URIs and SHA-256 digests are admitted into
  `SdlcBootstrapInputSet`.
- `deriveSdlcBootstrapProject(...)` returns CDME project identity:
  `Categorical Data Mapping & Computation Engine (CDME)`.
- Normalized imported requirement authority includes `REQ-LDM-001`.
- Element lineage answers which real source file produced the selected
  `REQ-LDM-001` requirement element.
- Runtime/context evidence that does not carry semantic authority remains
  visible as ambiguity rather than becoming silent project truth.

Verification:

```text
npm run test:t064
npm run lint:semantic
git diff --check
```

Result:

The idealized T-063 carrier proof now has a real-ingress sandbox proof over the
data-mapper fixture without widening production M05 code or copying Python SDLC
installer behavior into TypeScript.
