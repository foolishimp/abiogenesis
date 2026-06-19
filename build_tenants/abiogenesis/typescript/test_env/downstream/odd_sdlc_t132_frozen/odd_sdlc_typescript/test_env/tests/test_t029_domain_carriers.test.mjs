// Validates: REQ-F-ODDSDLC-009
// Validates: REQ-F-ODDSDLC-010
// Validates: REQ-F-ODDSDLC-011
// Validates: REQ-F-ODDSDLC-012
// Validates: REQ-F-ODDSDLC-015
// Validates: REQ-F-ODDSDLC-016
// Validates: REQ-F-ODDSDLC-038
// Investigates: T-029

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  SOFTWARE_DOMAIN_ASSET_FAMILIES,
  SOFTWARE_DOMAIN_ASSET_TYPES,
  SOFTWARE_DOMAIN_WORK_ACT_TYPES,
  admitSdlcAsset,
  admitSdlcAssetBinding,
  admitSdlcCapability,
  admitSdlcConstructionEvidenceCycle,
  admitSdlcInstalledRunArchive,
  admitSdlcLawfulActionMenuEntry,
  admitSdlcOperationalResult,
  admitSdlcOperationalTransitionCommand,
  admitSdlcWorkAct,
  admitSdlcWorksiteAssetRef,
  admitSdlcWorksiteObservation,
  admitSdlcWorksite,
  projectSdlcOperationalState
} from "../../build/semantic/code/src/index.js";

function pythonCatalogSource() {
  return readFileSync(
    new URL(
      "../../../python/code/odd_sdlc/software_domain_catalog.py",
      import.meta.url
    ),
    "utf8"
  );
}

function namesFromConstructor(source, constructorName) {
  const expression = new RegExp(`${constructorName}\\(\\s*name="([^"]+)"`, "g");
  return [...source.matchAll(expression)].map((match) => match[1]);
}

test("T-029 admits closed SDLC asset, binding, worksite, and capability carriers", () => {
  const asset = admitSdlcAsset({
    assetId: "asset://req/001",
    uri: "file://specification/requirements/example.md",
    declaredType: "requirement_surface",
    family: "worksite_inputs",
    mutability: "mutable_checkpointed",
    provenance: {
      model: "imported",
      source: "operator",
      mutable: true,
      historyBasis: "imported workspace surface"
    },
    checkpoint: {
      exists: true,
      pathKind: "file",
      contentDigest: "sha256:abc",
      byteCount: 42
    }
  });
  const binding = admitSdlcAssetBinding({
    nodeName: "RequirementSurface",
    assetIds: [asset.assetId]
  });
  const worksite = admitSdlcWorksite({
    worksiteId: "worksite://example",
    rootUri: "file:///tmp/example",
    lifecycleState: "designing",
    activeAssetIds: [asset.assetId],
    systemAssetRefs: ["system://odd-sdlc/installed-runtime"],
    workspaceAssetRefs: [asset.assetId],
    runtimeEvidenceRefs: ["file://.ai-workspace/runtime/odd_sdlc/operator-runs/run"],
    selectedGraphFunctionRef: "graph-function:odd_sdlc:Fg_materialize_declared_product_asset",
    selectedActionRef: "construction-action://odd-sdlc/example"
  });
  const capability = admitSdlcCapability({
    capabilityId: "capability://ts/core-fd",
    family: "core_fd",
    binding: "fd://typescript/core",
    supportsAssetFamilies: ["worksite_inputs"],
    evidenceExpectation: "closed carrier admission"
  });
  const workAct = admitSdlcWorkAct({
    workActId: "work-act://import/001",
    descriptorName: "import",
    inputAssetIds: [],
    outputAssetIds: [asset.assetId],
    evidenceAssetIds: ["asset://evidence/import/001"],
    provenance: {
      model: "imported",
      source: "operator",
      mutable: false,
      historyBasis: "explicit import act"
    }
  });

  assert.equal(asset.kind, "sdlc_asset");
  assert.equal(asset.provenance.model, "imported");
  assert.equal(binding.nodeName, "RequirementSurface");
  assert.equal(worksite.lifecycleState, "designing");
  assert.equal(
    worksite.selectedGraphFunctionRef,
    "graph-function:odd_sdlc:Fg_materialize_declared_product_asset"
  );
  assert.deepStrictEqual(worksite.runtimeEvidenceRefs, [
    "file://.ai-workspace/runtime/odd_sdlc/operator-runs/run"
  ]);
  assert.equal(workAct.kind, "sdlc_work_act");
  assert.equal(workAct.descriptorName, "import");
  assert.equal(capability.family, "core_fd");
  assert(Object.isFrozen(asset));
  assert(Object.isFrozen(worksite));
});

test("T-029 admits current installed run consequence-chain carriers", () => {
  const systemRef = admitSdlcWorksiteAssetRef({
    ref: "file://workspace/.abiogenesis/odd_sdlc/typescript/install-manifest.json",
    role: "system_asset",
    description: "installed odd_sdlc product payload"
  });
  const workspaceRef = admitSdlcWorksiteAssetRef({
    ref: "file://workspace/build_tenants/hello_world_rust/src/main.rs",
    role: "product_materialization",
    description: "materialized Rust source file"
  });
  const observation = admitSdlcWorksiteObservation({
    observationRef: "observation://odd-sdlc/post-action/run",
    worksiteId: "worksite://t133",
    systemAssetRefs: [systemRef.ref],
    workspaceAssetRefs: [workspaceRef.ref],
    runtimeEvidenceRefs: [
      "file://workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/run/sdlc_worksite_evidence.json"
    ],
    selectedGraphFunctionRef: "graph-function:odd_sdlc:Fg_materialize_declared_product_asset",
    selectedActionRef: "construction-action://odd-sdlc/public-start/Fg_materialize_declared_product_asset",
    targetBindingRefs: ["target-binding://odd-sdlc/component_code_surface"],
    predecessorRefs: ["construction-intent://odd-sdlc/public-start/Fg_materialize_declared_product_asset"]
  });
  const action = admitSdlcLawfulActionMenuEntry({
    actionId: "action:build_rust_product",
    graphFunctionRef: "graph-function:odd_sdlc:Fg_materialize_declared_product_asset",
    sourceAssetRefs: ["asset:start_document", "asset:installed_odd_sdlc"],
    targetAssetRef: "asset:rust_product_files",
    expectedCarrierRef: "schema://odd_sdlc/component_code_surface",
    humanDecision: "continue",
    retryActionRef: "action:repair_rust_product_files",
    donePredicate: "Cargo.toml and src/main.rs exist under build_tenants/hello_world_rust"
  });
  const archive = admitSdlcInstalledRunArchive({
    archiveRoot: "file://test_runs/t133/run",
    workspaceRoot: "file://test_runs/t133/run/workspace",
    runtimeRoot: "file://test_runs/t133/run/workspace/.ai-workspace/runtime/odd_sdlc",
    operatorRunRefs: [
      "file://test_runs/t133/run/workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/run"
    ],
    processTraceRefs: [
      "file://test_runs/t133/run/workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/run/worker_process_events.jsonl.trace"
    ],
    productEvidenceRefs: [
      "file://test_runs/t133/run/workspace/.ai-workspace/runtime/odd_sdlc/operator-runs/run/product_materialization_manifest.json"
    ],
    executionProofRefs: ["file://test_runs/t133/run/rust_hello_world_execution_proof.json"]
  });
  const cycle = admitSdlcConstructionEvidenceCycle({
    cycleRef: "cycle://odd-sdlc/t133/product-materialization",
    worksiteObservationRef: observation.observationRef,
    constructionIntentRef: "construction-intent://odd-sdlc/public-start/Fg_materialize_declared_product_asset",
    workerProcessRef: "file://runtime/operator-runs/run/worker_process_summary.json",
    edgeFulfillmentLedgerRef: "ledger://odd-sdlc/runtime/operator-runs/run/edge-fulfillment",
    closureDecisionRef: "closure-decision://odd-sdlc/runtime/operator-runs/run/edge-fulfillment/1",
    nextActionProjectionRef: "next-action://odd-sdlc/runtime/operator-runs/run/close/no-action",
    materializationManifestRef: "file://runtime/operator-runs/run/product_materialization_manifest.json",
    executionProofRefs: archive.executionProofRefs,
    predecessorRefs: [observation.observationRef, action.actionId]
  });

  assert.equal(systemRef.role, "system_asset");
  assert.equal(action.humanDecision, "continue");
  assert.equal(observation.targetBindingRefs[0], "target-binding://odd-sdlc/component_code_surface");
  assert.equal(archive.runtimeRoot.endsWith(".ai-workspace/runtime/odd_sdlc"), true);
  assert.equal(cycle.nextActionProjectionRef, "next-action://odd-sdlc/runtime/operator-runs/run/close/no-action");
  assert(Object.isFrozen(cycle));
});

test("T-029 admission rejects open payloads and malformed lifecycle values", () => {
  assert.throws(
    () =>
      admitSdlcWorksite({
        worksiteId: "worksite://bad",
        rootUri: "file:///tmp/bad",
        lifecycleState: "unknown",
        activeAssetIds: []
      }),
    /lifecycleState/
  );
  assert.throws(
    () =>
      admitSdlcAsset({
        assetId: "asset://bad",
        uri: "file://bad",
        declaredType: "code_surface",
        family: "implementation_branch",
        mutability: "mutable_checkpointed",
        provenance: {
          model: "generated",
          source: "fp",
          mutable: true,
          historyBasis: "test"
        },
        checkpoint: null,
        loose: true
      }),
    /unexpected field/
  );
  assert.throws(
    () =>
      admitSdlcAsset({
        assetId: "asset://bad",
        uri: "file://bad",
        declaredType: "code_surface",
        family: "implementation_branch",
        mutability: "mutable_checkpointed",
        provenance: {
          model: "generated",
          source: "fp",
          mutable: true,
          historyBasis: "test"
        },
        checkpoint: null,
        loose: true,
        alsoLoose: true
      }),
    /loose: unexpected field; .*alsoLoose: unexpected field/u
  );
  assert.throws(
    () =>
      admitSdlcWorksiteAssetRef({
        ref: "file://bad",
        role: "hidden_controller",
        description: "bad role"
      }),
    /role/
  );
});

test("T-029 TypeScript catalog preserves Python software-domain family and work-act names", () => {
  const source = pythonCatalogSource();
  assert.deepStrictEqual(
    SOFTWARE_DOMAIN_ASSET_FAMILIES.map((entry) => entry.name),
    [
      ...namesFromConstructor(source, "AssetFamilyDescriptor"),
      "governance_loop",
      "builder_scenario_contracts",
      "installed_traversal_run",
      "consequence_chain"
    ]
  );
  assert.deepStrictEqual(
    SOFTWARE_DOMAIN_WORK_ACT_TYPES.map((entry) => entry.name),
    namesFromConstructor(source, "WorkActDescriptor")
  );

  const assetTypeNames = new Set(SOFTWARE_DOMAIN_ASSET_TYPES.map((entry) => entry.name));
  for (const required of [
    "bootstrap_start_document_surface",
    "scenario_contract_surface",
    "lawful_action_menu_surface",
    "operator_run_archive_surface",
    "worksite_evidence_surface",
    "construction_intent_surface",
    "edge_fulfillment_ledger_surface",
    "edge_closure_decision_surface",
    "next_action_projection_surface",
    "product_materialization_manifest_surface",
    "execution_proof_surface"
  ]) {
    assert(assetTypeNames.has(required), required);
  }
  for (const family of SOFTWARE_DOMAIN_ASSET_FAMILIES) {
    for (const assetTypeName of family.representativeAssetTypes) {
      assert(assetTypeNames.has(assetTypeName), assetTypeName);
    }
  }
});

test("T-029 operational command, result, and projection remain distinct for runtime return", () => {
  const command = admitSdlcOperationalTransitionCommand({
    commandId: "command://runtime-return/001",
    lane: "runtime_return",
    requiredSubstrateBinding: "runtime://abiogenesis/typescript",
    capabilityContract: "operational_fd",
    returnedEvidenceExpectation: "runtime observation asset",
    targetAssetIds: ["asset://runtime/observation/001"]
  });
  const pending = projectSdlcOperationalState({
    command,
    results: [],
    runtimeFactRefs: ["abg://run/001"]
  });
  const result = admitSdlcOperationalResult({
    kind: "sdlc_operational_result",
    resultId: "result://runtime-return/001",
    commandId: command.commandId,
    status: "succeeded",
    evidenceAssetIds: ["asset://runtime/observation/001"],
    returnedAt: "2026-04-26T00:00:00Z"
  });
  const projected = projectSdlcOperationalState({
    command,
    results: [result],
    runtimeFactRefs: ["abg://run/001", "abg://event/returned"]
  });

  assert.equal(command.kind, "sdlc_operational_transition_command");
  assert.equal(result.kind, "sdlc_operational_result");
  assert.equal(pending.state, "pending");
  assert.equal(projected.kind, "sdlc_operational_state_projection");
  assert.equal(projected.state, "succeeded");
  assert.deepStrictEqual(projected.sourceResultIds, [result.resultId]);
  assert.throws(
    () =>
      projectSdlcOperationalState({
        command,
        results: [
          admitSdlcOperationalResult({
            kind: "sdlc_operational_result",
            resultId: "result://other",
            commandId: "command://other",
            status: "failed",
            evidenceAssetIds: [],
            returnedAt: null
          })
        ],
        runtimeFactRefs: []
      }),
    /another command/
  );
  assert.throws(
    () =>
      admitSdlcOperationalResult({
        kind: "not_sdlc_operational_result",
        resultId: "result://bad-kind",
        commandId: command.commandId,
        status: "succeeded",
        evidenceAssetIds: [],
        returnedAt: null
      }),
    /kind/
  );
});
