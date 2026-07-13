import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  admitFpTransformResult,
  standardLiveFpEvaluatorPlugin
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  admitDispatchRequest,
  admitResultArtifact
} from "../../build/semantic/code/src/abg/m03/transport/index.js";

const TRANSFORM_RESULT = Object.freeze({
  kind: "fp_transform_result",
  requestRef: "fp-transform-request://t220/output",
  actorInvocationId: "actor://t220/output",
  resultRef: "result://t220/output",
  status: "returned",
  evidenceCandidates: Object.freeze([])
});

let evaluatorInvocation = 0;
const RESULT_CONTRACT_REF = "contract://t220/fp-output";

function reviewScript(overrides = {}) {
  return `console.log(${JSON.stringify(
    JSON.stringify({
      resultContractRef: RESULT_CONTRACT_REF,
      accepted: true,
      closeDisposition: "close",
      assessmentIds: [],
      reasons: [],
      ...overrides
    })
  )})`;
}

function capabilityWith(script) {
  const root = mkdtempSync(path.join(tmpdir(), "t220-fp-output-"));
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
    labelPrefix: "t220"
  };
}

function evaluatorInput(expectedAssessmentIds) {
  evaluatorInvocation += 1;
  return {
    basisId: "basis://t220/fp-output",
    vectorIndex: 0,
    sourceProjectionRef: "projection://t220/fp-output",
    instructionPromptManifest: Object.freeze({
      renderedPrompt: "return the declared review JSON object",
      manifestRef: "manifest://t220/fp-output",
      selectedOutputContractRef: RESULT_CONTRACT_REF
    }),
    expectedAssessmentIds,
    selectedCompositionRef: "composition://t220/fp-output",
    selectedCompositionDigest: "digest://t220/fp-output",
    selectedRegimeBindingRef: null,
    cCallRef: `c-call://t220/fp-output/${String(evaluatorInvocation)}`
  };
}

function dispatchRequest() {
  return admitDispatchRequest({
    kind: "fp_dispatch_request",
    basisId: "basis://t220/fp-output",
    graphFunctionId: "graph-function://t220/fp-output",
    jobId: "job://t220/fp-output",
    dispatchRef: "dispatch://t220/fp-output",
    workerId: "worker://t220/fp-output",
    backendId: "backend://t220/fp-output",
    resultRef: "result://t220/fp-output",
    expectedEdge: "source->target",
    expectedAssessmentIds: ["complete"],
    transportContract: {
      agentKey: "generic",
      command: "worker",
      argsTemplate: [],
      sanitizedEnvironmentPolicy: { prefixes: [] }
    }
  });
}

test("T-220 F_P transform admission rejects an unknown top-level response field", () => {
  assert.throws(
    () => admitFpTransformResult({ ...TRANSFORM_RESULT, requestReff: "typo" }),
    /\.requestReff: unknown field/u
  );
});

test("T-220 F_P transform admission rejects an unknown evidence field", () => {
  assert.throws(
    () =>
      admitFpTransformResult({
        ...TRANSFORM_RESULT,
        evidenceCandidates: [
          {
            candidateRef: "candidate://t220/output",
            authorityRef: "authority://t220/output",
            evidenceRefs: ["evidence://t220/output"],
            providerRefs: ["provider://t220/output"],
            closeDispostion: "close"
          }
        ]
      }),
    /\.closeDispostion: unknown field/u
  );
});

test("T-220 F_P transform admission rejects complete evidence without a ref", () => {
  assert.throws(
    () =>
      admitFpTransformResult({
        ...TRANSFORM_RESULT,
        evidenceCandidates: [
          {
            candidateRef: "candidate://t220/no-evidence",
            authorityRef: "authority://t220/no-evidence",
            evidenceRefs: [],
            providerRefs: ["provider://t220/no-evidence"],
            complete: true
          }
        ]
      }),
    /complete evidence requires at least one evidence ref/u
  );
});

test("T-220 attached F_P artifact admission closes assessment and failure rows", () => {
  const request = dispatchRequest();
  const artifact = {
    edge: "source->target",
    actor: "worker",
    fulfillment_assessments: [
      {
        id: "complete",
        fulfillment_status: "fulfilled",
        evidence_refs: ["evidence://t220/complete"]
      }
    ]
  };
  assert.throws(
    () =>
      admitResultArtifact(request, {
        ...artifact,
        fulfillment_assessments: [
          { ...artifact.fulfillment_assessments[0], evidnce_refs: [] }
        ]
      }),
    /\.evidnce_refs: unknown field/u
  );
  assert.throws(
    () =>
      admitResultArtifact(request, {
        kind: "runtime_failure",
        failureClass: "runtime_failure",
        detail: "worker failed",
        retryy: true
      }),
    /\.retryy: unknown field/u
  );
  assert.throws(
    () =>
      admitResultArtifact(request, {
        ...artifact,
        fulfillment_assessments: [
          {
            ...artifact.fulfillment_assessments[0],
            blocking_reasons: ["still blocked"]
          }
        ]
      }),
    /fulfilled assessment cannot carry blocking reasons/u
  );
});

test("T-220 live evaluator blocks malformed assessment identity and unknown fields", async () => {
  const cases = [
    [
      reviewScript({ assessmentIds: ["a1", "bogus"] }),
      /unexpected ids: bogus/u
    ],
    [
      reviewScript({ assessmentIds: ["a1", "a1"] }),
      /must not contain duplicates/u
    ],
    [
      reviewScript({ assessmentIds: ["a1"], closeDispostion: "retry" }),
      /undeclared fields: closeDispostion/u
    ]
  ];
  for (const [script, expectedReason] of cases) {
    const outcome = await standardLiveFpEvaluatorPlugin(
      capabilityWith(script)
    ).evaluate(evaluatorInput(["a1"]));
    assert.equal(outcome.status, "blocked");
    assert.match(outcome.reason, expectedReason);
    assert.match(outcome.reason, /contract_failure/u);
  }
});

test("T-220 live evaluator treats missing expected assessment as retry, not closure", async () => {
  const outcome = await standardLiveFpEvaluatorPlugin(
    capabilityWith(reviewScript())
  ).evaluate(evaluatorInput(["a1"]));
  assert.equal(outcome.status, "evaluated");
  assert.equal(outcome.ambiguityStatus, "partial");
  assert.equal(outcome.findings[0].closeDisposition, "retry");
  assert.equal(outcome.findings[0].executiveDisposition, "local_repair");
});
