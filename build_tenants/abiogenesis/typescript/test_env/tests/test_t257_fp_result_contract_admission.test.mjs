// Validates: T-257
// Validates: REQ-L-GTL3-C-ALGEBRA-018
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-014
// Validates: REQ-R-ABG3-PAYLOAD-006

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitFpResultContractEnvelope,
  admitFpTransformResult,
  constructEnginePluginContract,
  constructFpDispatchOutcome,
  defaultFpEvaluatorPlugin,
  runEngineIterate,
  standardLiveFpEvaluatorPlugin
} from "../../build/semantic/code/src/index.js";
import {
  buildThreeStageBasis,
  m03InstructionAssemblyRequestFields
} from "./support/m03-iteration-fixtures.mjs";

const RESULT_CONTRACT_REF = "contract://t257/non-consensus/result";

function attachedArtifact(input, overrides = {}) {
  const assessmentIds =
    input.expectedAssessmentIds.length > 0
      ? input.expectedAssessmentIds
      : ["assessment://t257/runtime"];
  const status = overrides.status ?? "fulfilled";
  return {
    result_contract_ref:
      overrides.resultContractRef ??
      input.fpTransformRequest.selectedResultContractRef,
    edge: overrides.edge ?? input.expectedEdge ?? input.edge,
    actor: "worker://t257/non-consensus",
    fulfillment_assessments: assessmentIds.map((assessmentId) => ({
      id: assessmentId,
      evaluator: assessmentId,
      fulfillment_status: status,
      fulfillment_detail:
        status === "fulfilled" ? "result supplied" : "result incomplete",
      blocking_reasons:
        overrides.blockingReasons ??
        (status === "fulfilled" ? [] : ["result incomplete"]),
      evidence_refs: [`evidence://t257/${encodeURIComponent(assessmentId)}`]
    })),
    ...(overrides.extra ?? {})
  };
}

function fpDispatchPlugin(artifactFor) {
  return Object.freeze({
    contract: constructEnginePluginContract({
      driverRequirement: "sync_compatible",
      ref: "plugin://t257/non-consensus/fp-dispatch",
      pluginKind: "fp_dispatch",
      authority: "effect_plugin",
      inputCarrier: "EnginePluginInput",
      outputCarrier: "FpDispatchOutcome"
    }),
    dispatch(input) {
      assert.equal(
        input.fpTransformRequest.selectedResultContractRef,
        input.instructionPromptManifest.selectedOutputContractRef
      );
      assert.match(
        input.instructionPromptManifest.renderedPrompt,
        /Set result_contract_ref to /u
      );
      assert.equal(
        input.instructionPromptManifest.renderedPrompt.includes(
          JSON.stringify(input.fpTransformRequest.selectedResultContractRef)
        ),
        true
      );
      return constructFpDispatchOutcome({
        status: "dispatched",
        resultRef: input.actorInvocationRef.resultRef,
        attachedResultArtifact: artifactFor(input),
        evidenceRefs: [input.sourceProjectionRef]
      });
    }
  });
}

function runAttachedScenario(artifactFor) {
  const basis = buildThreeStageBasis({
    defaultRegime: "F_P",
    dispatchRef: "dispatch://t257/non-consensus"
  });
  const events = [];
  const result = runEngineIterate({
    basis,
    ...m03InstructionAssemblyRequestFields(basis, {
      targetContractRef: RESULT_CONTRACT_REF,
      namespace: "t257.non-consensus",
      prefix: "t257-non-consensus"
    }),
    eventSink: (event) => events.push(event),
    plugins: {
      fpDispatch: fpDispatchPlugin(artifactFor),
      fpEvaluator: defaultFpEvaluatorPlugin
    }
  });
  return { result, events };
}

function assertNoAcceptedOrClosedTruth(events) {
  assert.equal(
    events.some(
      (event) =>
        (event.kind === "payload_validated" &&
          event.payloadRef.startsWith("payload:target_carrier:")) ||
        event.kind === "vector_closed"
    ),
    false
  );
}

test("T-257 one admission atom closes both standard wire profiles", () => {
  const attached = admitFpResultContractEnvelope({
    profile: "attached_result_artifact",
    selectedResultContractRef: RESULT_CONTRACT_REF,
    rawResult: {
      result_contract_ref: RESULT_CONTRACT_REF,
      edge: "source->target",
      actor: "worker://t257",
      fulfillment_assessments: []
    }
  });
  assert.equal(attached.accepted, true);
  assert.equal(attached.envelope.resultContractRef, RESULT_CONTRACT_REF);

  const rawReview = {
    resultContractRef: RESULT_CONTRACT_REF,
    accepted: true,
    closeDisposition: "close",
    assessmentIds: [],
    reasons: []
  };
  const review = admitFpResultContractEnvelope({
    profile: "standard_live_review",
    selectedResultContractRef: RESULT_CONTRACT_REF,
    rawResult: rawReview
  });
  assert.equal(review.accepted, true);
  assert.equal(review.envelope.resultContractRef, RESULT_CONTRACT_REF);
  rawReview.assessmentIds.push("assessment://mutated-after-admission");
  assert.deepEqual(review.envelope.payload.assessmentIds, []);
  assert.equal(Object.isFrozen(review.envelope.payload), true);
  assert.equal(Object.isFrozen(review.envelope.payload.assessmentIds), true);
});

test("T-257 contract atom rejects missing, wrong, and undeclared identity", () => {
  const cases = [
    {
      rawResult: {
        edge: "source->target",
        actor: "worker://t257",
        fulfillment_assessments: []
      },
      failureClass: "missing_contract_identity"
    },
    {
      rawResult: {
        result_contract_ref: "contract://t257/wrong",
        edge: "source->target",
        actor: "worker://t257",
        fulfillment_assessments: []
      },
      failureClass: "contract_identity_mismatch"
    },
    {
      rawResult: {
        result_contract_ref: ` ${RESULT_CONTRACT_REF}`,
        edge: "source->target",
        actor: "worker://t257",
        fulfillment_assessments: []
      },
      failureClass: "missing_contract_identity"
    },
    {
      rawResult: {
        result_contract_ref: RESULT_CONTRACT_REF,
        edge: "source->target",
        actor: "worker://t257",
        fulfillment_assessments: [],
        closureDecision: "close"
      },
      failureClass: "undeclared_field"
    },
    {
      rawResult: {
        result_contract_ref: RESULT_CONTRACT_REF,
        edge: "source->target",
        actor: "worker://t257",
        fulfillment_assessments: [],
        selected_worker_id: "worker://worker-authored"
      },
      failureClass: "undeclared_field"
    }
  ];
  for (const row of cases) {
    const outcome = admitFpResultContractEnvelope({
      profile: "attached_result_artifact",
      selectedResultContractRef: RESULT_CONTRACT_REF,
      rawResult: row.rawResult
    });
    assert.equal(outcome.accepted, false);
    assert.equal(outcome.failure.failureClass, row.failureClass);
  }

  const nonJson = admitFpResultContractEnvelope({
    profile: "attached_result_artifact",
    selectedResultContractRef: RESULT_CONTRACT_REF,
    rawResult: {
      result_contract_ref: RESULT_CONTRACT_REF,
      edge: "source->target",
      actor: undefined,
      fulfillment_assessments: []
    }
  });
  assert.equal(nonJson.accepted, false);
  assert.equal(nonJson.failure.failureClass, "malformed_result");
});

test("T-257 transform status combinations are closed", () => {
  const base = {
    kind: "fp_transform_result",
    requestRef: "request://t257/status",
    actorInvocationId: "actor://t257/status",
    resultRef: "result://t257/status",
    resultContractRef: RESULT_CONTRACT_REF,
    artifactRef: "artifact://t257/status"
  };
  assert.throws(
    () =>
      admitFpTransformResult({
        ...base,
        status: "returned",
        reason: "worker says complete",
        evidenceCandidates: []
      }),
    /returned result requires null/u
  );
  assert.throws(
    () =>
      admitFpTransformResult({
        ...base,
        status: "contract_failed",
        reason: "bad contract",
        evidenceCandidates: [
          {
            candidateRef: "candidate://t257/status",
            authorityRef: "authority://t257/status",
            evidenceRefs: ["evidence://t257/status"],
            providerRefs: ["provider://t257/status"]
          }
        ]
      }),
    /failed result cannot admit evidence/u
  );
  assert.throws(
    () =>
      admitFpTransformResult({
        ...base,
        status: "blocked",
        reason: null,
        evidenceCandidates: []
      }),
    /blocked result requires a reason/u
  );
});

test("T-257 valid selected-contract artifact traverses admission before closure", () => {
  const { result, events } = runAttachedScenario((input) =>
    attachedArtifact(input)
  );
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(
    events.some((event) => event.kind === "payload_validated"),
    true
  );
  assert.equal(events.some((event) => event.kind === "vector_closed"), true);
});

test("T-257 malformed selected contract exhausts without accepted or closed truth", () => {
  const { result, events } = runAttachedScenario((input) =>
    attachedArtifact(input, { resultContractRef: "contract://t257/wrong" })
  );
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assertNoAcceptedOrClosedTruth(events);
});

test("T-257 incomplete result retries once and then admits a complete result", () => {
  let attempt = 0;
  const { result, events } = runAttachedScenario((input) => {
    attempt += 1;
    return attachedArtifact(input, {
      status: attempt === 1 ? "partial" : "fulfilled"
    });
  });
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "converged");
  assert.equal(
    events.some((event) => event.kind === "retry_attempt_opened"),
    true
  );
  assert.equal(events.some((event) => event.kind === "vector_closed"), true);
});

test("T-257 contradictory and unattributed results remain non-closing", () => {
  const cases = [
    (input) =>
      attachedArtifact(input, {
        blockingReasons: ["contradicts fulfilled status"]
      }),
    (input) => attachedArtifact(input, { edge: "wrong->edge" })
  ];
  for (const artifactFor of cases) {
    const { result, events } = runAttachedScenario(artifactFor);
    assert.equal(result.transition.kind, "terminal");
    assert.equal(result.transition.terminalKind, "gap_stop");
    assertNoAcceptedOrClosedTruth(events);
  }
});

test("T-257 nonretryable runtime failure stops on the first attempt", () => {
  let attempts = 0;
  const { result, events } = runAttachedScenario(() => {
    attempts += 1;
    return {
      kind: "runtime_failure",
      failureClass: "runtime_failure",
      detail: "nonretryable runtime failure"
    };
  });
  assert.equal(attempts, 1);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assertNoAcceptedOrClosedTruth(events);
});

test("T-257 retryable incomplete output exhausts three retries after its initial attempt", () => {
  let attempts = 0;
  const { result, events } = runAttachedScenario((input) => {
    attempts += 1;
    return attachedArtifact(input, { status: "partial" });
  });
  assert.equal(attempts, 4);
  assert.equal(result.transition.kind, "terminal");
  assert.equal(result.transition.terminalKind, "gap_stop");
  assertNoAcceptedOrClosedTruth(events);
});

function capabilityWith(script) {
  const root = mkdtempSync(path.join(tmpdir(), "t257-live-review-"));
  return {
    agentContract: Object.freeze({
      agentKey: "generic",
      command: process.execPath,
      argsTemplate: Object.freeze(["-e", script]),
      sanitizedEnvironmentPolicy: Object.freeze({ prefixes: Object.freeze([]) })
    }),
    archiveRoot: path.join(root, "archive"),
    cwd: root,
    timeoutMs: 30000,
    labelPrefix: "t257"
  };
}

function evaluatorInput() {
  return {
    basisId: "basis://t257/live-review",
    vectorIndex: 0,
    sourceProjectionRef: "projection://t257/live-review",
    instructionPromptManifest: {
      renderedPrompt: "return the declared review object",
      manifestRef: "manifest://t257/live-review",
      selectedOutputContractRef: RESULT_CONTRACT_REF
    },
    expectedAssessmentIds: ["assessment://t257/live-review"],
    selectedCompositionRef: "composition://t257/live-review",
    selectedCompositionDigest: "digest://t257/live-review",
    selectedRegimeBindingRef: null,
    cCallRef: `c-call://t257/live-review/${Math.random().toString(16).slice(2)}`
  };
}

function validReview() {
  return {
    resultContractRef: RESULT_CONTRACT_REF,
    accepted: true,
    closeDisposition: "close",
    assessmentIds: ["assessment://t257/live-review"],
    reasons: []
  };
}

test("T-257 live review accepts exact JSON and rejects surrounding prose", async () => {
  const exact = await standardLiveFpEvaluatorPlugin(
    capabilityWith(`console.log(${JSON.stringify(JSON.stringify(validReview()))})`)
  ).evaluate(evaluatorInput());
  assert.equal(exact.status, "evaluated");
  assert.equal(exact.resultContractRef, RESULT_CONTRACT_REF);

  const wrapped = await standardLiveFpEvaluatorPlugin(
    capabilityWith(
      `console.log(${JSON.stringify(`result: ${JSON.stringify(validReview())}`)})`
    )
  ).evaluate(evaluatorInput());
  assert.equal(wrapped.status, "blocked");
  assert.match(wrapped.reason, /review unparsable/u);
  assert.match(wrapped.reason, /contract_failure/u);

  const nonJsonWhitespace = await standardLiveFpEvaluatorPlugin(
    capabilityWith(
      `console.log(${JSON.stringify(`\u00a0${JSON.stringify(validReview())}\u00a0`)})`
    )
  ).evaluate(evaluatorInput());
  assert.equal(nonJsonWhitespace.status, "blocked");
  assert.match(nonJsonWhitespace.reason, /review unparsable/u);

  const duplicateAccepted = await standardLiveFpEvaluatorPlugin(
    capabilityWith(
      `process.stdout.write(${JSON.stringify(
        `{"resultContractRef":${JSON.stringify(RESULT_CONTRACT_REF)},"accepted":false,"accepted":true,"closeDisposition":"close","assessmentIds":["assessment://t257/live-review"],"reasons":[]}`
      )})`
    )
  ).evaluate(evaluatorInput());
  assert.equal(duplicateAccepted.status, "blocked");
  assert.match(duplicateAccepted.reason, /duplicate object property/u);
});
