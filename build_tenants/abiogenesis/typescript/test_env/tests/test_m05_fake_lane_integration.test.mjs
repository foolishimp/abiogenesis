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
  publicStart,
  resolvePublicAssetTarget
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  projectLiveStatus
} from "../../build/semantic/code/src/app/m04/live_status/projection.js";
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
import {
  invokeCanonicalResultAssessmentWithoutReplayEvidence
} from "./support/canonical-result-assessment-fixture.mjs";

test("M05 fake-lane integration: publicStart-only assessment is refused without replay-admitted evidence", async () => {
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
  assert.equal(startOutcome.stopPredicate, "gap_stop");

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
  const assessmentEventStart = events.length;
  const { outcome: assessmentOutcome } =
    await invokeCanonicalResultAssessmentWithoutReplayEvidence({
      assessmentRequest,
      events
    });

  assert.equal(assessmentOutcome.outcomeKind, "refusal");
  assert.equal(assessmentOutcome.value.code, "result_missing");
  assert.deepEqual(
    events.slice(assessmentEventStart).map((event) => event.kind),
    ["public_operation_admitted"]
  );

  const projection = projectLiveStatus(
    liveStatusPayload({
      start_request: startInput,
      start_outcome: startOutcome
    })
  );

  assert.equal(projection.kind, "attention");
  assert.equal(projection.runStatus, "blocked");

  const qualification = qualifyFakeLaneScenario(
    buildFakeLaneQualificationRequest({
      scenarioName: "asset-addressed-public-start-requires-replay-evidence",
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
      resultAssessmentKind: "rejected",
      liveStatusKind: projection.kind,
      liveRunStatus: projection.runStatus
    })
  );

  assert.equal(qualification.kind, "rejected");
  assert.equal(
    qualification.reason,
    "public start did not preserve dispatch_required blocking truth"
  );
  assert.equal(
    qualification.trace.find((entry) => entry.kind === "result_assessment")
      ?.valid,
    false
  );
  assert.equal(
    events.some((event) => event.kind === "assessed"),
    false
  );
});
