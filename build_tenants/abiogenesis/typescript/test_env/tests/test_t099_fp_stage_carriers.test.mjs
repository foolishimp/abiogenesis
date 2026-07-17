// Validates: REQ-R-ABG3-INTERPRET
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-CONVERGENCE
// Validates: T-099

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitFpTransformResultForRequest,
  admitResultArtifact,
  admitFpTransformResult,
  constructAssuranceAuthoritySnapshot,
  constructAssuranceEvidenceRow,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  defaultFpEvaluatorPlugin,
  deriveAdvancementTransition,
  dispatchRequestsForTransition,
  loadGtlTargetCarrierDefaultsBundle,
  resolveTargetCarrierContractBinding,
  runEngineIterate
} from "../../build/semantic/code/src/index.js";
import { canonicalRuntimeEvents } from "./support/canonical-runtime-events.mjs";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

function fpDispatchContract(ref) {
  return constructEnginePluginContract({
    driverRequirement: "sync_compatible",
    ref,
    pluginKind: "fp_dispatch",
    authority: "effect_plugin",
    inputCarrier: "EnginePluginInput",
    outputCarrier: "FpDispatchOutcome"
  });
}

function fulfilledArtifact(input) {
  return {
    edge: input.expectedEdge ?? input.edge,
    actor: "codex",
    fulfillment_assessments: input.expectedAssessmentIds.map((id) => ({
      id,
      evaluator: id,
      fulfillment_status: "fulfilled",
      fulfillment_detail: "transform result supplied evidence candidate",
      blocking_reasons: [],
      evidence_refs: [`evidence://t099/${encodeURIComponent(input.edge)}/${id}`]
    })),
    selected_worker_id: "worker://t099",
    selected_backend: "backend://node",
    role_id: "role://runtime",
    assignment_source: "policy_resolution",
    resolved_runtime_ref: "runtime://typescript/node"
  };
}

function externalAuthorityProvider() {
  return Object.freeze({
    authoritySnapshot: ({ scope }) =>
      constructAssuranceAuthoritySnapshot({
        scope,
        authorityRefs: [`req://t099/external/${scope.vectorIndex}`],
        inputRefs: ["input://t099/current"],
        authorityDigest: `authority-digest-t099-${scope.vectorIndex}`,
        inputDigest: "input-digest-t099-current",
        providerRefs: ["provider://t099/external-authority"],
        policyRefs: ["policy://t099/assurance"]
      })
  });
}

function providerMaterialAuthority() {
  return Object.freeze({
    authoritySnapshot: () => null,
    evidenceRows: ({ scope, authoritySnapshot }) =>
      [
        constructAssuranceEvidenceRow({
          scope,
          evidenceRef: `file://t099/current/${scope.vectorIndex}`,
          authorityRef: authoritySnapshot.authorityRefs[0],
          authorityDigest: authoritySnapshot.authorityDigest,
          inputDigest: authoritySnapshot.inputDigest,
          providerRefs: ["provider://t099/material-authority"],
          policyRefs: ["policy://t099/assurance/material-current"]
        })
      ]
  });
}

function targetCarrierFulfillmentEvents(
  basis,
  authorityRefFor = (vectorIndex) => `req://t099/external/${vectorIndex}`
) {
  const defaults = loadGtlTargetCarrierDefaultsBundle();
  const events = [];
  for (let vectorIndex = 0; vectorIndex < basis.graph.vectors.length; vectorIndex += 1) {
    const vector = basis.graph.vectors[vectorIndex];
    const binding = resolveTargetCarrierContractBinding({ vector, defaults });
    const payloadRef = `payload://t099/${vectorIndex}/target-carrier`;
    const digest = `digest://t099/${vectorIndex}/target-carrier`;
    events.push(
      constructPayloadObservedEvent({
        basis,
        vectorIndex,
        payloadRef,
        payloadClass: binding.outputCarrierKind,
        contractRef: binding.contractRef,
        digest,
        producerRef: "provider://t099/target-carrier",
        authorityRef: authorityRefFor(vectorIndex),
        inputDigest: "input-digest-t099-current",
        policyRefs: ["policy://t099/assurance"]
      }),
      constructPayloadValidatedEvent({
        basis,
        vectorIndex,
        payloadRef,
        contractRef: binding.contractRef,
        contractDigest: binding.configDigest,
        digest,
        validationRef: `validation://t099/${vectorIndex}/target-carrier`,
        policyRefs: ["policy://t099/assurance"]
      })
    );
  }
  return canonicalRuntimeEvents(events);
}

test("T-099 F_P input exposes transform request and ABG admits transform evidence", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t099-transform"
  });
  const inputs = [];
  const events = [];

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t099-transform"),
    dispatch: (input) => {
      inputs.push(input);
      assert.equal(input.fpTransformRequest.kind, "fp_transform_request");
      assert.equal(input.fpTransformRequest.edge, input.edge);
      assert.equal(input.fpTransformRequest.resultRef, input.actorInvocationRef.resultRef);
      assert.equal(input.fpTransformRequest.retryFrontierRef, input.retryFrontier.frontierRef);
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: `result://t099/${encodeURIComponent(input.edge)}`,
        attachedResultArtifact: fulfilledArtifact(input)
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => events.push(event),
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(inputs.length, 3);

  const observed = events.filter((event) => event.kind === "payload_observed");
  const validated = events.filter((event) => event.kind === "payload_validated");
  const evidence = events.filter((event) => event.kind === "evidence_admitted");
  const authority = events.filter(
    (event) => event.kind === "authority_snapshot_admitted"
  );
  const ambiguity = events.filter(
    (event) => event.kind === "ambiguity_observation_admitted"
  );
  const closureInputs = events.filter(
    (event) => event.kind === "closure_input_published"
  );
  const transformObserved = observed.filter(
    (event) => event.contractRef === "contract://abg/fp-transform-evidence"
  );
  const evaluationObserved = observed.filter(
    (event) => event.payloadClass === "fp_evaluation_finding"
  );
  const evaluationRuleObserved = observed.filter(
    (event) => event.payloadClass === "evaluation_rule_outcome"
  );
  const composedStageObserved = observed.filter(
    (event) => event.payloadClass === "composed_stage_task_outcome"
  );
  const targetCarrierObserved = observed.filter((event) =>
    /^payload:target_carrier:sha256:[a-f0-9]{64}$/.test(event.payloadRef)
  );
  const transformValidated = validated.filter(
    (event) => event.contractRef === "contract://abg/fp-transform-evidence"
  );
  const evaluationValidated = validated.filter(
    (event) => event.contractRef === "contract://abg/fp-evaluation-finding"
  );
  const evaluationRuleValidated = validated.filter(
    (event) => event.contractRef === "contract://abg/evaluation-rule-outcome"
  );
  const composedStageValidated = validated.filter(
    (event) => event.contractRef === "contract://abg/composed-stage-task-outcome"
  );
  const targetCarrierValidated = validated.filter((event) =>
    /^payload:target_carrier:sha256:[a-f0-9]{64}$/.test(event.payloadRef)
  );
  const transformEvidence = evidence.filter((event) =>
    /^authority:fp_transform:[a-f0-9]{64}$/.test(event.authorityDigest ?? "")
  );
  const evaluationEvidence = evidence.filter((event) =>
    /^authority:fp_evaluation:sha256:[a-f0-9]{64}$/.test(
      event.authorityDigest ?? ""
    )
  );
  const transformAuthority = authority.filter((event) =>
    /^authority:fp_transform:[a-f0-9]{64}$/.test(event.authorityDigest)
  );
  const evaluationAuthority = authority.filter((event) =>
    /^authority:fp_evaluation:sha256:[a-f0-9]{64}$/.test(event.authorityDigest)
  );

  assert.equal(observed.length, 18);
  assert.equal(validated.length, 18);
  assert.equal(evidence.length, 9);
  assert.equal(authority.length, 6);
  assert.equal(transformObserved.length, 3);
  assert.equal(evaluationObserved.length, 3);
  assert.equal(evaluationRuleObserved.length, 3);
  assert.equal(composedStageObserved.length, 6);
  assert.equal(targetCarrierObserved.length, 3);
  assert.equal(transformValidated.length, 3);
  assert.equal(evaluationValidated.length, 3);
  assert.equal(evaluationRuleValidated.length, 3);
  assert.equal(composedStageValidated.length, 6);
  assert.equal(targetCarrierValidated.length, 3);
  assert.equal(transformEvidence.length, 3);
  assert.equal(evaluationEvidence.length, 6);
  assert.equal(transformAuthority.length, 3);
  assert.equal(evaluationAuthority.length, 3);
  assert.equal(ambiguity.length, 3);
  assert.equal(closureInputs.length, 3);
  assert.equal(
    inputs.every((input) =>
      /^fp-transform-request:[a-f0-9]{64}$/.test(
        input.fpTransformRequest.requestRef
      )
    ),
    true
  );
  assert.equal(
    transformAuthority.every((event) =>
      /^authority:fp_transform:[a-f0-9]{64}$/.test(event.authorityDigest) &&
      /^input:fp_transform:[a-f0-9]{64}$/.test(event.inputDigest)
    ),
    true
  );
  assert.equal(
    transformObserved.every((event) =>
      /^payload:fp_transform:[a-f0-9]{64}$/.test(event.payloadRef) &&
      /^digest:fp_transform:[a-f0-9]{64}$/.test(event.digest)
    ),
    true
  );
  assert.equal(
    transformObserved.every(
      (event) => event.contractRef === "contract://abg/fp-transform-evidence"
    ),
    true
  );
  assert.equal(
    observed
      .filter(
        (event) =>
          event.payloadClass !== "composed_stage_task_outcome" ||
          !event.authorityRef.startsWith("stage-task:consequence:")
      )
      .every((event) => event.actorInvocationId !== null),
    true
  );
  assert.equal(
    evidence.every((event) => event.complete === true && event.shallow === false),
    true
  );
});

test("T-099 negative: request-scoped transform admission rejects mismatched results", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t099-transform-binding"
  });

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t099-transform-binding"),
    dispatch: (input) => {
      assert.throws(
        () =>
          admitFpTransformResultForRequest(input.fpTransformRequest, {
            kind: "fp_transform_result",
            requestRef: "fp-transform-request://wrong",
            actorInvocationId: input.fpTransformRequest.actorInvocationId,
            resultRef: input.fpTransformRequest.resultRef,
            artifactRef: "artifact://t099/mismatch",
            status: "returned",
            evidenceCandidates: [
              {
                candidateRef: "candidate://t099/mismatch",
                authorityRef: "authority://t099/mismatch",
                evidenceRefs: ["evidence://t099/mismatch"],
                providerRefs: ["provider://t099/mismatch"]
              }
            ]
          }),
        /active request/i
      );
      assert.throws(
        () =>
          admitFpTransformResultForRequest(input.fpTransformRequest, {
            kind: "fp_transform_result",
            requestRef: input.fpTransformRequest.requestRef,
            actorInvocationId: "actor-invocation://wrong",
            resultRef: input.fpTransformRequest.resultRef,
            artifactRef: "artifact://t099/mismatch",
            status: "returned",
            evidenceCandidates: [
              {
                candidateRef: "candidate://t099/mismatch",
                authorityRef: "authority://t099/mismatch",
                evidenceRefs: ["evidence://t099/mismatch"],
                providerRefs: ["provider://t099/mismatch"]
              }
            ]
          }),
        /active actor invocation/i
      );
      assert.throws(
        () =>
          admitFpTransformResultForRequest(input.fpTransformRequest, {
            kind: "fp_transform_result",
            requestRef: input.fpTransformRequest.requestRef,
            actorInvocationId: input.fpTransformRequest.actorInvocationId,
            resultRef: "result://wrong",
            artifactRef: "artifact://t099/mismatch",
            status: "returned",
            evidenceCandidates: [
              {
                candidateRef: "candidate://t099/mismatch",
                authorityRef: "authority://t099/mismatch",
                evidenceRefs: ["evidence://t099/mismatch"],
                providerRefs: ["provider://t099/mismatch"]
              }
            ]
          }),
        /active result ref/i
      );
      return constructFpDispatchOutcome({
        status: "dispatched",
        attachedResultArtifact: fulfilledArtifact(input)
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: () => {},
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin }
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
});

test("T-099 negative: fulfilled artifact admission requires evidence refs", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t099-empty-evidence"
  });
  const request = dispatchRequestsForTransition(
    deriveAdvancementTransition(basis)
  )[0];

  assert.throws(
    () =>
      admitResultArtifact(request, {
        edge: request.expectedEdge,
        actor: "codex",
        fulfillment_assessments: request.expectedAssessmentIds.map((id) => ({
          id,
          evaluator: id,
          fulfillment_status: "fulfilled",
          fulfillment_detail: "vacuous self-closure attempt",
          blocking_reasons: [],
          evidence_refs: []
        }))
      }),
    /fulfilled assessment requires non-empty evidence refs/i
  );
});

test("T-099 negative: blocked attached outcomes enter retry through typed transform status", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t099-blocked-transform"
  });
  const events = [];
  let attempts = 0;
  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t099-blocked-transform"),
    dispatch: (input) => {
      attempts += 1;
      if (attempts === 1) {
        return constructFpDispatchOutcome({
          status: "dispatched",
          attachedResultArtifact: {
            edge: input.expectedEdge ?? input.edge,
            actor: "codex",
            fulfillment_assessments: input.expectedAssessmentIds.map((id) => ({
              id,
              evaluator: id,
              fulfillment_status: "blocked",
              fulfillment_detail: "execution evidence missing",
              blocking_reasons: ["test_execution_evidence_missing"],
              evidence_refs: ["evidence://t099/blocked-attempt"]
            }))
          }
        });
      }
      return constructFpDispatchOutcome({
        status: "dispatched",
        attachedResultArtifact: fulfilledArtifact(input)
      });
    }
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    eventSink: (event) => events.push(event),
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin },
    maxAttachedFpAttempts: 2
  });
  const progress = events.filter(
    (event) => event.kind === "retry_progress_recorded"
  );

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(progress.length, 1);
  assert.equal(
    progress[0].progressSignalRefs.some((ref) =>
      ref.startsWith("fp_transform_status:blocked:")
    ),
    true
  );
  assert.equal(
    progress[0].progressSignalRefs.some((ref) =>
      ref.includes("test_execution_evidence_missing")
    ),
    true
  );
});

test("T-099 negative: worker fulfilled self-report cannot override assurance authority", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t099-self-closure"
  });

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t099-self-closure"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        attachedResultArtifact: fulfilledArtifact(input)
      })
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    runtimeEvents: targetCarrierFulfillmentEvents(basis),
    eventSink: () => {},
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin },
    assuranceProvider: externalAuthorityProvider()
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assert.equal(result.assuranceGate.kind, "assurance_blocked");
  assert.equal(
    result.assuranceGate.blockingStatuses.includes("orphan_evidence"),
    true
  );
  assert.equal(
    result.assuranceGate.reports.some((report) =>
      report.rowStatuses.includes("missing")
    ),
    true
  );
});

test("T-099 assurance gate admits provider current-material evidence rows", () => {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t099-material-provider"
  });

  const fpDispatch = Object.freeze({
    contract: fpDispatchContract("plugin://test/t099-material-provider"),
    dispatch: (input) =>
      constructFpDispatchOutcome({
        status: "dispatched",
        attachedResultArtifact: fulfilledArtifact(input)
      })
  });

  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis),
    runtimeEvents: targetCarrierFulfillmentEvents(basis),
    eventSink: () => {},
    plugins: { fpDispatch, fpEvaluator: defaultFpEvaluatorPlugin },
    assuranceProvider: providerMaterialAuthority()
  });

  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(result.assuranceGate.kind, "assurance_closed");
  assert.deepEqual(result.assuranceGate.closureDecisions, ["close"]);
  assert.equal(
    result.assuranceGate.scopeResults
      .filter((entry) => entry.kind === "evaluated")
      .every((entry) =>
        entry.projection.evidenceRows.some((row) =>
          row.evidenceRef.startsWith("file://t099/current/")
        )
      ),
    true
  );
});

test("T-099 negative: transform result cannot smuggle closure authority", () => {
  assert.throws(
    () =>
      admitFpTransformResult({
        kind: "fp_transform_result",
        requestRef: "fp-transform-request://negative",
        actorInvocationId: "actor://negative",
        resultRef: "result://negative",
        status: "returned",
        unresolvedReasons: [],
        evidenceCandidates: []
      }),
    /cannot own engine authority/i
  );

  assert.throws(
    () =>
      admitFpTransformResult({
        kind: "fp_transform_result",
        requestRef: "fp-transform-request://negative",
        actorInvocationId: "actor://negative",
        resultRef: "result://negative",
        status: "returned",
        runtimeEvents: [],
        evidenceCandidates: []
      }),
    /cannot own engine authority/i
  );
});
