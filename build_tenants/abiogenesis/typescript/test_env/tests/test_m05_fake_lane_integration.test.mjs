// Validates: REQ-P-QUAL
// Validates: REQ-P-SCENARIOS

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitExecutionBasis,
  deriveAdvancementTransition,
  dispatchRequestsForTransition
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  admitOperatorAssetQueryContract,
  admitPublicStartRequest,
  projectLiveStatus,
  publicStart,
  resolvePublicAssetTarget,
  resultAssessment
} from "../../build/semantic/code/src/app/m04/index.js";
import { qualifyFakeLaneScenario } from "../../build/semantic/code/src/qualification/m05/index.js";
import {
  assetAddressingStartContext,
  operatorAssetContractPayload,
  operatorAssetRegistryPayload,
  publicAssetAddressingPayload,
  registryRunnerFromPayload
} from "./support/asset-addressing-fixtures.mjs";
import {
  liveStatusPayload,
  resolvedPolicyIdentity,
  resultAssessmentPayload
} from "./support/m04-fixtures.mjs";
import { buildFakeLaneQualificationRequest } from "./support/m05-fixtures.mjs";

test("M05 fake-lane integration: module-derived scenario composes asset addressing, public start, result assessment, and live status over canonical runtime truth", async () => {
  const { module, codeProfile, publicStartInput, publicStartContext } =
    assetAddressingStartContext();
  const contract = admitOperatorAssetQueryContract(
    operatorAssetContractPayload()
  );

  const resolved = await resolvePublicAssetTarget(
    publicAssetAddressingPayload("code_surface"),
    {
      module,
      workspaceRoot: "/workspace/demo",
      operatorAssetContract: contract
    },
    registryRunnerFromPayload(
      operatorAssetRegistryPayload([
        {
          asset_id: "code_surface",
          uri: "file://build/code",
          operator_target: {
            kind: "graph_function",
            handle: "code_flow"
          }
        }
      ])
    )
  );

  assert.equal(resolved.kind, "resolved");

  const events = [];
  const startInput = publicStartInput(resolved.target.ownerHandle);
  const fpContext = {
    ...publicStartContext,
    resolvedPolicy: resolvedPolicyIdentity({
      resolvedPolicyBundleRef: "policy://public-fp",
      defaultRegime: "F_P",
      dispatchRef: "dispatch://codex"
    })
  };
  const startOutcome = publicStart(startInput, fpContext, (event) => {
    events.push(event);
  });

  assert.equal(startOutcome.kind, "blocked");
  assert.equal(startOutcome.stopPredicate, "dispatch_required");

  const startRequest = admitPublicStartRequest(startInput);
  const dispatchRequest = dispatchRequestsForTransition(
    deriveAdvancementTransition(
      admitExecutionBasis({
        startIntent: startRequest.startIntent,
        module: fpContext.module,
        runtimeIdentity: fpContext.runtimeIdentity,
        resolvedPolicy: fpContext.resolvedPolicy,
        runId: fpContext.runId ?? null,
        workKey: fpContext.workKey ?? null,
        frameId: fpContext.frameId ?? null,
        frameLineageId: fpContext.frameLineageId ?? null
      })
    )
  )[0];

  assert.equal(dispatchRequest.graphFunctionId, codeProfile.id);

  const assessmentRequest = resultAssessmentPayload(dispatchRequest, {
    manifest_provenance: {
      spec_hash: "spec://typescript-dev",
      manifest_id: "manifest://m05-fake-lane",
      workflow_version: "wf://typescript-dev",
      run_id: fpContext.runId,
      work_key: fpContext.workKey,
      authority_ref: "authority://runtime",
      selected_worker_id: dispatchRequest.workerId,
      selected_backend: dispatchRequest.backendId,
      role_id: "role://runtime",
      assignment_source: "policy_resolution",
      resolved_runtime_ref: "runtime://typescript/node"
    }
  });
  const assessmentOutcome = resultAssessment(assessmentRequest, (event) => {
    events.push(event);
  });

  assert.equal(assessmentOutcome.kind, "accepted");

  const projection = projectLiveStatus(
    liveStatusPayload({
      start_request: startInput,
      start_outcome: startOutcome,
      result_assessment_request: assessmentRequest,
      result_assessment_outcome: assessmentOutcome
    })
  );

  assert.equal(projection.kind, "ready");
  assert.equal(projection.runStatus, "assessed");

  const qualification = qualifyFakeLaneScenario(
    buildFakeLaneQualificationRequest({
      scenarioName: "asset-addressed-public-start-to-assessed-ready",
      scenarioAuthorityRefs: [
        "SCN-I2R-001",
        "SCN-R2U-001",
        "SCN-GSDLCLITE-001"
      ],
      assetAddressingKind: resolved.kind,
      resolvedTargetKind: resolved.target.ownerKind,
      resolvedTargetHandle: resolved.target.ownerHandle,
      dispatchExpectedEdge: dispatchRequest.expectedEdge,
      startOutcomeKind: startOutcome.kind,
      startStopPredicate: startOutcome.kind === "blocked"
        ? startOutcome.stopPredicate
        : null,
      emittedEventKinds: events.map((event) => event.kind),
      resultAssessmentKind: assessmentOutcome.kind,
      liveStatusKind: projection.kind,
      liveRunStatus: projection.runStatus
    })
  );

  assert.deepStrictEqual(qualification, {
    kind: "passed",
    scenarioName: "asset-addressed-public-start-to-assessed-ready",
    scenarioAuthorityRefs: [
      "SCN-I2R-001",
      "SCN-R2U-001",
      "SCN-GSDLCLITE-001"
    ],
    trace: [
      {
        kind: "scenario_authority",
        valid: true,
        detail: "scenario authority refs present"
      },
      {
        kind: "asset_addressing",
        valid: true,
        detail: "resolved code_flow"
      },
      {
        kind: "public_start",
        valid: true,
        detail: "public start reached canonical dispatch_required stop"
      },
      {
        kind: "dispatch_request",
        valid: true,
        detail: `dispatch request preserved ${dispatchRequest.expectedEdge}`
      },
      {
        kind: "result_assessment",
        valid: true,
        detail: "result assessment accepted and emitted assessed runtime truth"
      },
      {
        kind: "live_status",
        valid: true,
        detail: "live status projected assessed ready truth"
      }
    ]
  });
});
