// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-014
// Validates: REQ-F-ODDSDLC-015
// Validates: REQ-F-ODDSDLC-017
// Investigates: T-034

import test from "node:test";
import assert from "node:assert/strict";

import {
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  admitSdlcConstructorResult,
  admitSdlcWorkReport,
  constructSdlcHookContractCatalog,
  defaultOperationForTarget,
  evaluateSdlcHookPostflight,
  evaluateSdlcHookPreflight,
  hookContractByEdgeName,
  minimalSdlcHookInvocationForContract,
  runSdlcHookTurn,
  SDLC_FUNCTION_CATALOG,
  SDLC_HOOK_TARGET_POLICY,
  SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG
} from "../../build/semantic/code/src/index.js";

function successfulConstructorResult(contract, targetAssetId) {
  return admitSdlcConstructorResult({
    operationType:
      contract.targetAssetType === "release_surface" ? "release" : "generate",
    outputIdentity: {
      assetId: targetAssetId,
      uri: `file:///workspace/${contract.targetAssetType}`,
      declaredType: contract.targetAssetType,
      digest: `sha256:out-${contract.targetAssetType}`,
      byteCount: 128
    },
    evidenceRefs: [
      {
        ref: `file:///workspace/${contract.targetAssetType}`,
        evidenceType: "materialized_asset",
        digest: `sha256:evidence-${contract.targetAssetType}`
      }
    ],
    generatedAssetContract: {
      contractName: "generated-asset-contract",
      targetAssetId,
      satisfied: true,
      materialized: true,
      diagnostics: [],
      foreignRealizationCandidates: []
    },
    ambiguityCandidates: []
  });
}

test("T-034 hook catalog covers each selected SDLC edge class with explicit contracts", () => {
  const catalog = constructSdlcHookContractCatalog();
  const classes = new Set(catalog.map((contract) => contract.edgeClass));

  assert(classes.has("bootstrap_specification"));
  assert(classes.has("design"));
  assert(classes.has("implementation"));
  assert(classes.has("qualification"));
  assert(classes.has("release"));
  assert(classes.has("operational_return"));

  for (const contract of catalog) {
    assert.equal(contract.kind, "sdlc_hook_contract");
    assert.equal(contract.transformProfile.constructiveFp.startsWith("fp://"), true);
    assert(contract.transformProfile.preflightFd.length > 0);
    assert(contract.transformProfile.postflightFd.length > 0);
    assert.equal(contract.workReportContract.requireGraphFunctionAuthority, true);
    assert.equal(contract.workReportContract.requireTargetBinding, true);
    assert.equal(contract.workReportContract.requireGeneratedAssetAttestation, true);
    assert.equal(contract.closurePolicy.traceTagsAloneSufficient, false);
    assert.equal(
      contract.closurePolicy.nextTraversalSelectionAuthority,
      "abg_runtime"
    );
    assert.equal(contract.closurePolicy.maySelectNextTraversal, false);
    assert.equal(
      contract.closurePolicy.unresolvedOutcomeAuthority,
      "abg_retry_repair"
    );
    assert.equal(contract.closurePolicy.continuationEvidenceRequired, true);
  }
});

test("T-051 hook target class and operation policy is declared data", () => {
  const catalog = constructSdlcHookContractCatalog();
  const policyByTarget = new Map(
    SDLC_HOOK_TARGET_POLICY.map((entry) => [entry.targetAssetType, entry])
  );
  const catalogTargets = [
    ...new Set([
      ...SDLC_FUNCTION_CATALOG.flatMap((entry) => entry.outputs),
      ...SDLC_REUSABLE_GRAPH_FUNCTION_CATALOG.filter((entry) =>
        entry.name === FG_CONFORM_PROJECT_AUTHORITY ||
        entry.name === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET
      ).flatMap((entry) => [entry.outputs[0]].filter(Boolean))
    ])
  ].sort();

  assert.deepStrictEqual([...policyByTarget.keys()].sort(), catalogTargets);
  assert.equal(policyByTarget.size, SDLC_HOOK_TARGET_POLICY.length);

  for (const contract of catalog) {
    const policy = policyByTarget.get(contract.targetAssetType);
    assert(policy);
    assert.equal(contract.edgeClass, policy.edgeClass);
    assert.equal(
      defaultOperationForTarget(contract.targetAssetType),
      policy.defaultOperation
    );
  }

  assert.equal(defaultOperationForTarget("release_surface"), "release");
  assert.equal(defaultOperationForTarget("deployment_surface"), "deploy");
  assert.equal(
    defaultOperationForTarget("component_realization_qualification_surface"),
    "qualify"
  );
  assert.equal(
    defaultOperationForTarget("component_test_qualification_surface"),
    "qualify"
  );
  assert.equal(
    defaultOperationForTarget("release_depth_parity_surface"),
    "qualify"
  );
  assert.equal(defaultOperationForTarget("test_run_archive_surface"), "qualify");
  assert.equal(
    defaultOperationForTarget("runtime_observation_surface"),
    "return"
  );
  assert.equal(defaultOperationForTarget("retrofit_plan_surface"), "retrofit");
});

test("T-034 closure policy separates tenant hook bounds from ABG re-entry authority", () => {
  const contract = hookContractByEdgeName("derive_code_surface");

  assert.equal(contract.closurePolicy.postflightFdRequired, true);
  assert.equal(contract.closurePolicy.generatedAssetContractMustPass, true);
  assert.equal(contract.closurePolicy.traceTagsAloneSufficient, false);
  assert.equal(contract.closurePolicy.maySelectNextTraversal, false);
  assert.equal(
    contract.closurePolicy.nextTraversalSelectionAuthority,
    "abg_runtime"
  );
  assert.equal(
    contract.closurePolicy.unresolvedOutcomeAuthority,
    "abg_retry_repair"
  );
  assert.equal(contract.closurePolicy.continuationEvidenceRequired, true);
});

test("T-034 preflight F_D and postflight F_D are separate from constructive F_P report admission", () => {
  const contract = hookContractByEdgeName("derive_code_surface");
  const targetAssetId = "asset://code_surface";
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId,
    fpWorkerContractRef: "worker://fp/local"
  });
  const preflight = evaluateSdlcHookPreflight({ contract, invocation });
  const outcome = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: successfulConstructorResult(contract, targetAssetId)
  });

  assert.equal(preflight.phase, "preflight_fd");
  assert.equal(preflight.status, "passed");
  assert.equal(outcome.postflight?.phase, "postflight_fd");
  assert.equal(outcome.postflight?.status, "passed");
  assert.equal(outcome.workReport?.kind, "sdlc_work_report");
  assert.equal(outcome.workReport?.targetBinding.assetIds[0], targetAssetId);
  assert.equal(
    outcome.workReport?.generatedAssetAuthority.graphFunctionName,
    contract.edgeName
  );
  assert.equal(
    outcome.workReport?.generatedAssetAuthority.selectedBy,
    "abg_selected_edge"
  );
  assert.equal(
    outcome.workReport?.generatedAssetAuthority.targetAssetType,
    contract.targetAssetType
  );
  assert.deepStrictEqual(outcome.emittedRuntimeEventKinds, []);
  assert(!("selectedNextGraphFunction" in outcome));
  assert(!("nextTraversal" in outcome));
});

test("T-034 preflight blocks missing F_P worker contract before construction", () => {
  const contract = hookContractByEdgeName("derive_design_surface");
  const targetAssetId = "asset://design_surface";
  const invocation = {
    ...minimalSdlcHookInvocationForContract({
      contract,
      targetAssetId,
      fpWorkerContractRef: "worker://fp/local"
    }),
    fpWorkerContractRef: null
  };
  const preflight = evaluateSdlcHookPreflight({ contract, invocation });
  const outcome = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: successfulConstructorResult(contract, targetAssetId)
  });

  assert.equal(preflight.status, "blocked");
  assert(preflight.blockingReasons.includes("fp_worker_contract_missing"));
  assert.equal(outcome.workReport, null);
  assert.equal(outcome.postflight, null);
});

test("T-034 postflight blocks trace-only shell output when generated asset contract fails", () => {
  const contract = hookContractByEdgeName("prepare_release_surface");
  const targetAssetId = "asset://release_surface";
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId,
    fpWorkerContractRef: "worker://fp/local"
  });
  const shellResult = admitSdlcConstructorResult({
    operationType: "release",
    outputIdentity: {
      assetId: targetAssetId,
      uri: "file:///workspace/release_surface",
      declaredType: "release_surface",
      digest: "sha256:trace-only",
      byteCount: 19
    },
    evidenceRefs: [
      {
        ref: "file:///workspace/release_surface",
        evidenceType: "trace_tag_text",
        digest: "sha256:req-tags-only"
      }
    ],
    generatedAssetContract: {
      contractName: "generated-asset-contract",
      targetAssetId,
      satisfied: false,
      materialized: true,
      diagnostics: ["only REQ tags were present"],
      foreignRealizationCandidates: []
    },
    ambiguityCandidates: []
  });
  const outcome = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: shellResult
  });

  assert.equal(outcome.preflight.status, "passed");
  assert.equal(outcome.postflight?.status, "blocked");
  assert(outcome.postflight?.blockingReasons.includes("generated_asset_contract_failed"));
});

test("T-034 postflight blocks when requested and returned operations disagree", () => {
  const contract = hookContractByEdgeName("derive_code_surface");
  const targetAssetId = "asset://code_surface";
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId,
    fpWorkerContractRef: "worker://fp/local"
  });
  const baseResult = successfulConstructorResult(contract, targetAssetId);
  const outcome = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: admitSdlcConstructorResult({
      operationType: "release",
      outputIdentity: {
        assetId: baseResult.outputIdentity.assetId,
        uri: baseResult.outputIdentity.uri,
        declaredType: baseResult.outputIdentity.declaredType,
        digest: baseResult.outputIdentity.digest,
        byteCount: baseResult.outputIdentity.byteCount
      },
      evidenceRefs: baseResult.evidenceRefs.map((evidence) => ({
        ref: evidence.ref,
        evidenceType: evidence.evidenceType,
        digest: evidence.digest
      })),
      generatedAssetContract: {
        contractName: baseResult.generatedAssetContract.contractName,
        targetAssetId: baseResult.generatedAssetContract.targetAssetId,
        satisfied: baseResult.generatedAssetContract.satisfied,
        materialized: baseResult.generatedAssetContract.materialized,
        diagnostics: baseResult.generatedAssetContract.diagnostics,
        foreignRealizationCandidates: []
      },
      ambiguityCandidates: []
    })
  });

  assert.equal(invocation.requestedOperation, "generate");
  assert.equal(outcome.workReport?.operationType, "release");
  assert.equal(outcome.postflight?.status, "blocked");
  assert(outcome.postflight?.blockingReasons.includes("requested_operation_mismatch"));
});

test("T-034 postflight preserves ambiguity candidates and rejects unbound output", () => {
  const contract = hookContractByEdgeName("derive_runtime_observation_surface");
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId: "asset://runtime_observation_surface",
    fpWorkerContractRef: "worker://fp/local"
  });
  const result = admitSdlcConstructorResult({
    operationType: "return",
    outputIdentity: {
      assetId: "asset://foreign_runtime_observation_surface",
      uri: "file:///workspace/runtime_observation_surface",
      declaredType: "runtime_observation_surface",
      digest: "sha256:runtime-return",
      byteCount: 64
    },
    evidenceRefs: [
      {
        ref: "file:///workspace/runtime_observation_surface",
        evidenceType: "runtime_return",
        digest: "sha256:runtime-return-evidence"
      }
    ],
    generatedAssetContract: {
      contractName: "generated-asset-contract",
      targetAssetId: "asset://foreign_runtime_observation_surface",
      satisfied: false,
      materialized: true,
      diagnostics: ["foreign candidate detected"],
      foreignRealizationCandidates: [
        {
          candidateId: "candidate://runtime/foreign",
          affectedAssetId: "asset://runtime_observation_surface",
          relativePath: "observations/foreign.md",
          reason: "materialized outside admitted target binding"
        }
      ]
    },
    ambiguityCandidates: [
      {
        candidateId: "candidate://runtime/foreign",
        affectedAssetId: "asset://runtime_observation_surface",
        relativePath: "observations/foreign.md",
        reason: "materialized outside admitted target binding"
      }
    ]
  });
  const report = runSdlcHookTurn({ contract, invocation, constructorResult: result })
    .workReport;

  assert(report);
  const postflight = evaluateSdlcHookPostflight({ contract, report });
  assert.equal(report.ambiguityCandidates.length, 1);
  assert.equal(postflight.status, "blocked");
  assert(postflight.blockingReasons.includes("output_identity_not_bound_to_target"));
  assert(postflight.blockingReasons.includes("ambiguity_candidates_preserved"));
});

test("T-034 serialized work report admission rejects wrong carrier kind", () => {
  const contract = hookContractByEdgeName("derive_code_surface");
  const targetAssetId = "asset://code_surface";
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId,
    fpWorkerContractRef: "worker://fp/local"
  });
  const report = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: successfulConstructorResult(contract, targetAssetId)
  }).workReport;

  assert(report);
  assert.throws(
    () =>
      admitSdlcWorkReport({
        kind: "not_sdlc_work_report",
        hookName: report.hookName,
        edgeName: report.edgeName,
        edgeClass: report.edgeClass,
        targetBinding: {
          nodeName: report.targetBinding.nodeName,
          assetIds: report.targetBinding.assetIds
        },
        requestedOperation: report.requestedOperation,
        operationType: report.operationType,
        inputIdentities: report.inputIdentities.map((identity) => ({
          assetId: identity.assetId,
          uri: identity.uri,
          declaredType: identity.declaredType,
          digest: identity.digest,
          byteCount: identity.byteCount
        })),
        outputIdentity: {
          assetId: report.outputIdentity.assetId,
          uri: report.outputIdentity.uri,
          declaredType: report.outputIdentity.declaredType,
          digest: report.outputIdentity.digest,
          byteCount: report.outputIdentity.byteCount
        },
        evidenceRefs: report.evidenceRefs.map((evidence) => ({
          ref: evidence.ref,
          evidenceType: evidence.evidenceType,
          digest: evidence.digest
        })),
        generatedAssetAuthority: {
          graphFunctionName: report.generatedAssetAuthority.graphFunctionName,
          selectedBy: report.generatedAssetAuthority.selectedBy,
          targetAssetType: report.generatedAssetAuthority.targetAssetType,
          targetAssetId: report.generatedAssetAuthority.targetAssetId
        },
        generatedAssetContract: {
          contractName: report.generatedAssetContract.contractName,
          targetAssetId: report.generatedAssetContract.targetAssetId,
          satisfied: report.generatedAssetContract.satisfied,
          materialized: report.generatedAssetContract.materialized,
          diagnostics: report.generatedAssetContract.diagnostics,
          foreignRealizationCandidates: []
        },
        ambiguityCandidates: [],
        emittedRuntimeEventKinds: []
      }),
    /kind/
  );
});
