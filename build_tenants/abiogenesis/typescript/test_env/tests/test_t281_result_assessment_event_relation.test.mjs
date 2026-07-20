import assert from "node:assert/strict";
import test from "node:test";

import {
  RESULT_ASSESSMENT_DERIVED_FLUENT_RULE,
  assertRuntimeEvent,
  constructRuntimeFluent,
  deriveResultAssessmentRuntimeSubjectRelation,
  deriveRuntimeEventCalculusProjection,
  holdsAt
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const RUNTIME_SUBJECT = Object.freeze({
  basisId: "basis://t281/result-assessment",
  graphCallId: "graph-call://t281/result-assessment",
  frameId: "frame://t281/result-assessment",
  vectorIndex: 0,
  runtimeResult: Object.freeze({
    ref: "payload://t281/result-assessment",
    digest: stableSha256Digest({ result: "t281-result-assessment" })
  })
});

test("T-281 result relation refuses assessment truth without a T-271 replay relation", () => {
  assert.throws(
    () => deriveResultAssessmentRuntimeSubjectRelation({
      events: [],
      assessmentRef:
        "assessment:0000000000000000000000000000000000000000000000000000000000000000",
      runtimeSubject: RUNTIME_SUBJECT
    }),
    /replay-admitted assessed truth/u
  );
});

test("T-281 assessed event admission requires exact runtime-result coordinates", () => {
  assert.throws(
    () => assertRuntimeEvent({
      kind: "assessed",
      assessmentKind: "fp",
      edge: "source->target",
      obligationId: "proof://t281/result-assessment",
      publishedLedgerRef: "c-call-evidence://t281/result-assessment",
      actor: "actor://t281/result-assessor",
      specHash: stableSha256Digest({ prompt: "t281" }),
      manifestId: "manifest://t281/result-assessment",
      workflowVersion: "program://t281/result-assessment",
      runId: null,
      workKey: null,
      selectedWorkerId: null,
      selectedBackend: null,
      roleId: null,
      authorityRef: null,
      assignmentSource: null,
      resolvedRuntimeRef: null
    }),
    /assessmentRef|basisId|runtimeResult/u
  );
});

test("T-281 missing assessed replay derives no assessment fluent", () => {
  const calculus = deriveRuntimeEventCalculusProjection({
    events: [],
    derivedRules: [RESULT_ASSESSMENT_DERIVED_FLUENT_RULE]
  });
  assert.equal(
    holdsAt(
      calculus,
      constructRuntimeFluent({
        name: "result_assessment_admitted",
        scope: "vector",
        basisId: RUNTIME_SUBJECT.basisId,
        graphCallId: RUNTIME_SUBJECT.graphCallId,
        frameId: RUNTIME_SUBJECT.frameId,
        runId: null,
        workKey: null,
        vectorIndex: RUNTIME_SUBJECT.vectorIndex,
        edge: "source->target",
        constraintRef: RUNTIME_SUBJECT.runtimeResult.ref,
        ref:
          "assessment:0000000000000000000000000000000000000000000000000000000000000000"
      })
    ),
    false
  );
});
