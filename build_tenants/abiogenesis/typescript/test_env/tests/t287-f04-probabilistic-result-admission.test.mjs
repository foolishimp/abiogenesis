// Validates: accepted M03 FpResultContractAdmission safe donor port.
// Validates: REQ-L-GTL3-C-ALGEBRA-018.
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-014.
// Validates: REQ-R-ABG3-PAYLOAD-006, -012, -021, -024, -028.

import test from "node:test";
import assert from "node:assert/strict";

import * as installedAbg from "../../build/code/src/abg/index.js";

const {
  admitFpResultContractEnvelope,
  admitFpResultContractText,
  fpResultLocusContractDefinition,
} = installedAbg;

const RESULT_CONTRACT_REF = "contract://t287/f04/raw-response@5";
const EDGE_REF = "edge://t287/f04/source-to-target";
const ACTOR_REF = "actor://t287/f04/reviewer";
const ASSESSMENT_A = "assessment://t287/f04/a";
const ASSESSMENT_B = "assessment://t287/f04/b";

function assessment(id, overrides = {}) {
  return {
    id,
    evaluator: `evaluator://${id.slice("assessment://".length)}`,
    fulfillment_status: "fulfilled",
    fulfillment_detail: "declared obligation is evidenced",
    blocking_reasons: [],
    evidence_refs: [`evidence://${id.slice("assessment://".length)}`],
    ...overrides,
  };
}

function transformResult(overrides = {}) {
  return {
    result_contract_ref: RESULT_CONTRACT_REF,
    edge: EDGE_REF,
    actor: ACTOR_REF,
    fulfillment_assessments: [assessment(ASSESSMENT_A)],
    target_value: {
      kind: "review_findings",
      schemaVersion: "5.0.0",
      recommendation: "accept",
    },
    ...overrides,
  };
}

function transformInput(rawResult = transformResult(), overrides = {}) {
  return {
    compositionStageRole: "transform",
    selectedResultContractRef: RESULT_CONTRACT_REF,
    expectedEdge: EDGE_REF,
    expectedActorRef: ACTOR_REF,
    expectedAssessmentRefs: [ASSESSMENT_A],
    rawResult,
    ...overrides,
  };
}

function transformTextInput(rawResultText, overrides = {}) {
  const { rawResult: _rawResult, ...input } = transformInput(undefined, overrides);
  return { ...input, rawResultText };
}

function assertRefusal(outcome, failureClass) {
  assert.equal(outcome.accepted, false);
  assert.equal(outcome.envelope, null);
  assert.equal(outcome.failure.failureClass, failureClass);
}

test("F04-D00 baseline records the built-in JSON.parse duplicate-key blind spot", () => {
  const parsed = JSON.parse('{"contract":"first","contract":"second"}');
  assert.deepEqual(parsed, { contract: "second" });
});

test("F04-D00 one accepted FpResultContractAdmission atom is present", () => {
  assert.equal(typeof admitFpResultContractEnvelope, "function");
  assert.equal(typeof admitFpResultContractText, "function");
  assert.equal(typeof fpResultLocusContractDefinition, "function");
});

test("F04-D01 locus selection is exact and chooses one of the two accepted profiles", () => {
  assert.deepEqual(fpResultLocusContractDefinition("transform"), {
    compositionStageRole: "transform",
    wireProfile: "attached_transform_result",
  });
  assert.deepEqual(fpResultLocusContractDefinition("evaluate"), {
    compositionStageRole: "evaluate",
    wireProfile: "standard_live_review",
  });
  assert.equal(fpResultLocusContractDefinition("consequence"), null);
  assert.equal(fpResultLocusContractDefinition("human_callout"), null);
});

test("F04-D02 transform admission separates evidence from the opaque target candidate", () => {
  const outcome = admitFpResultContractText(
    transformTextInput(JSON.stringify(transformResult())),
  );
  assert.equal(outcome.accepted, true);
  assert.equal(outcome.envelope.profile, "attached_transform_result");
  assert.equal(outcome.envelope.resultContractRef, RESULT_CONTRACT_REF);
  assert.deepEqual(outcome.envelope.resultArtifactCandidate, {
    result_contract_ref: RESULT_CONTRACT_REF,
    edge: EDGE_REF,
    actor: ACTOR_REF,
    fulfillment_assessments: [assessment(ASSESSMENT_A)],
  });
  assert.deepEqual(outcome.envelope.targetValueCandidate, {
    kind: "review_findings",
    schemaVersion: "5.0.0",
    recommendation: "accept",
  });
  assert.equal("target_value" in outcome.envelope.resultArtifactCandidate, false);
  assert.equal(Object.isFrozen(outcome.envelope), true);
  assert.equal(Object.isFrozen(outcome.envelope.targetValueCandidate), true);
});

test("F04-D03 exact I-JSON framing refuses wrappers, non-objects, and duplicate keys", () => {
  const valid = JSON.stringify(transformResult());
  const duplicateContract = valid.replace(
    `{"result_contract_ref":"${RESULT_CONTRACT_REF}"`,
    `{"result_contract_ref":"${RESULT_CONTRACT_REF}","result_contract_ref":"${RESULT_CONTRACT_REF}"`,
  );
  for (const rawResultText of [
    `result: ${valid}`,
    `\`\`\`json\n${valid}\n\`\`\``,
    `${valid} trailing`,
    "[]",
    "null",
    duplicateContract,
  ]) {
    assertRefusal(
      admitFpResultContractText(transformTextInput(rawResultText)),
      "malformed_result",
    );
  }
});

test("F04-D04 closed transform vocabulary and selected contract refuse before projection", () => {
  const cases = [
    [
      { ...transformResult(), result_contract_ref: undefined },
      "missing_contract_identity",
    ],
    [
      { ...transformResult(), result_contract_ref: "contract://t287/f04/wrong@5" },
      "contract_identity_mismatch",
    ],
    [
      { ...transformResult(), closureDecision: "close" },
      "undeclared_field",
    ],
    [
      Object.fromEntries(
        Object.entries(transformResult()).filter(([field]) => field !== "target_value"),
      ),
      "missing_required_field",
    ],
  ];
  for (const [rawResult, failureClass] of cases) {
    assertRefusal(
      admitFpResultContractEnvelope(transformInput(rawResult)),
      failureClass,
    );
  }
});

test("F04-D05 edge, actor, and assessment roster are request-owned", () => {
  const cases = [
    [transformResult({ edge: "edge://t287/f04/foreign" }), "edge_mismatch"],
    [transformResult({ actor: "actor://t287/f04/foreign" }), "actor_mismatch"],
    [
      transformResult({ fulfillment_assessments: [assessment(ASSESSMENT_B)] }),
      "assessment_roster_mismatch",
    ],
    [
      transformResult({
        fulfillment_assessments: [
          assessment(ASSESSMENT_A),
          assessment(ASSESSMENT_A),
        ],
      }),
      "contradictory_result",
    ],
  ];
  for (const [rawResult, failureClass] of cases) {
    assertRefusal(
      admitFpResultContractEnvelope(transformInput(rawResult)),
      failureClass,
    );
  }
});

test("F04-D06 incomplete and contradictory assessments are typed non-close refusals", () => {
  const cases = [
    [transformResult({ fulfillment_assessments: [] }), "incomplete_result"],
    [
      transformResult({
        fulfillment_assessments: [assessment(ASSESSMENT_A, { evidence_refs: [] })],
      }),
      "incomplete_result",
    ],
    [
      transformResult({
        fulfillment_assessments: [assessment(ASSESSMENT_A, {
          blocking_reasons: ["missing proof"],
        })],
      }),
      "contradictory_result",
    ],
    [
      transformResult({
        fulfillment_assessments: [assessment(ASSESSMENT_A, {
          fulfillment_status: "partial",
          blocking_reasons: ["missing proof"],
        })],
      }),
      "incomplete_result",
    ],
  ];
  for (const [rawResult, failureClass] of cases) {
    assertRefusal(
      admitFpResultContractEnvelope(transformInput(rawResult)),
      failureClass,
    );
  }
});

test("F04-D07 assessment identity is a set relation, not caller-order identity", () => {
  const rawResult = transformResult({
    fulfillment_assessments: [
      assessment(ASSESSMENT_B),
      assessment(ASSESSMENT_A),
    ],
  });
  const forward = admitFpResultContractEnvelope(transformInput(rawResult, {
    expectedAssessmentRefs: [ASSESSMENT_A, ASSESSMENT_B],
  }));
  const reverse = admitFpResultContractEnvelope(transformInput(rawResult, {
    expectedAssessmentRefs: [ASSESSMENT_B, ASSESSMENT_A],
  }));
  assert.equal(forward.accepted, true);
  assert.equal(reverse.accepted, true);
  assert.equal(forward.envelope.payloadDigest, reverse.envelope.payloadDigest);
});

test("F04-D08 live-review profile is closed and cannot acquire target or closure authority", () => {
  const rawReview = {
    resultContractRef: RESULT_CONTRACT_REF,
    accepted: true,
    closeDisposition: "close",
    assessmentIds: [ASSESSMENT_A],
    reasons: [],
  };
  const input = {
    compositionStageRole: "evaluate",
    selectedResultContractRef: RESULT_CONTRACT_REF,
    expectedEdge: null,
    expectedActorRef: null,
    expectedAssessmentRefs: [ASSESSMENT_A],
    rawResult: rawReview,
  };
  const outcome = admitFpResultContractEnvelope(input);
  assert.equal(outcome.accepted, true);
  assert.equal(outcome.envelope.profile, "standard_live_review");
  assert.deepEqual(outcome.envelope.reviewCandidate, rawReview);

  assertRefusal(
    admitFpResultContractEnvelope({
      ...input,
      rawResult: { ...rawReview, target_value: { sideDoor: true } },
    }),
    "undeclared_field",
  );
  assertRefusal(
    admitFpResultContractEnvelope({
      ...input,
      rawResult: { ...rawReview, accepted: true, closeDisposition: "retry" },
    }),
    "contradictory_result",
  );
  assertRefusal(
    admitFpResultContractEnvelope({
      ...input,
      rawResult: {
        ...rawReview,
        accepted: false,
        closeDisposition: "retry",
        reasons: ["unresolved"],
      },
    }),
    "incomplete_result",
  );
});

test("F04-D09 non-I-JSON raw object members refuse at the same atom", () => {
  assertRefusal(
    admitFpResultContractEnvelope(transformInput({
      ...transformResult(),
      actor: undefined,
    })),
    "malformed_result",
  );
});

test("F04-D10 unsafe integral raw values refuse while the safe boundary admits", () => {
  const unsafeIntegral = Number.MAX_SAFE_INTEGER + 1;
  assert.equal(Number.isInteger(unsafeIntegral), true);
  assert.equal(Number.isSafeInteger(unsafeIntegral), false);
  assertRefusal(
    admitFpResultContractEnvelope(transformInput(transformResult({
      target_value: { n: unsafeIntegral },
    }))),
    "malformed_result",
  );

  const safe = admitFpResultContractEnvelope(transformInput(transformResult({
    target_value: { n: Number.MAX_SAFE_INTEGER },
  })));
  assert.equal(safe.accepted, true);
  assert.deepEqual(safe.envelope.targetValueCandidate, {
    n: Number.MAX_SAFE_INTEGER,
  });
});

test("F04-D11 unsafe integral text refuses instead of admitting its rounded value", () => {
  const template = JSON.stringify(transformResult({
    target_value: { n: "NUMBER_LITERAL" },
  }));
  const unsafeText = template.replace(
    '"NUMBER_LITERAL"',
    "9007199254740993",
  );
  const rounded = JSON.parse(unsafeText).target_value.n;
  assert.equal(rounded, 9007199254740992);
  assert.equal(Number.isSafeInteger(rounded), false);
  assertRefusal(
    admitFpResultContractText(transformTextInput(unsafeText)),
    "malformed_result",
  );

  const safeText = template.replace(
    '"NUMBER_LITERAL"',
    "9007199254740991",
  );
  const safe = admitFpResultContractText(transformTextInput(safeText));
  assert.equal(safe.accepted, true);
  assert.deepEqual(safe.envelope.targetValueCandidate, {
    n: Number.MAX_SAFE_INTEGER,
  });
});

test.todo("F04-05 dependency-red: installed F_P dispatch must invoke this atom before effects");
test.todo("F04-08 dependency-red: selected final target schema must admit the opaque target candidate");
test.todo("F04-10 dependency-red: evidence, target result, and event facts must append atomically");
test.todo("F04-11 dependency-red: fresh-process runtime proof requires the installed composition");
test.todo("F04-12 dependency-red: compose, batch, workflow, recursion, and retry loci remain unintegrated");
test.todo("F04-13 dependency-red: retry classification remains Event Calculus-owned");
test.todo("F04-14 dependency-red: only admitted result events may reach consequential projection");
