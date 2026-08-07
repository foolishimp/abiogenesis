// Validates: accepted M03 FpResultContractAdmission safe donor port.
// Validates: REQ-L-GTL3-C-ALGEBRA-018.
// Validates: REQ-R-ABG3-INSTRUCTION-ASSEMBLY-014.
// Validates: REQ-R-ABG3-PAYLOAD-006, -012, -021, -024, -028.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import * as installedAbg from "../../build/code/src/abg/index.js";
import * as installedRoot from "../../build/code/src/index.js";

const {
  admitFpResultContractEnvelope,
  admitFpResultContractText,
} = installedAbg;

const RESULT_CONTRACT_REF = "contract://t287/f04/raw-response@5";
const EDGE_REF = "edge://t287/f04/source-to-target";
const ACTOR_REF = "actor://t287/f04/reviewer";
const ASSESSMENT_A = "assessment://t287/f04/a";
const ASSESSMENT_B = "assessment://t287/f04/b";
const ASSESSMENT_C = "assessment://t287/f04/c";

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

function reviewResult(overrides = {}) {
  return {
    resultContractRef: RESULT_CONTRACT_REF,
    accepted: true,
    closeDisposition: "close",
    assessmentIds: [ASSESSMENT_A],
    reasons: [],
    ...overrides,
  };
}

function reviewInput(rawResult = reviewResult(), overrides = {}) {
  return {
    compositionStageRole: "evaluate",
    selectedResultContractRef: RESULT_CONTRACT_REF,
    expectedEdge: null,
    expectedActorRef: ACTOR_REF,
    expectedAssessmentRefs: [ASSESSMENT_A],
    rawResult,
    ...overrides,
  };
}

function reviewTextInput(rawResultText, overrides = {}) {
  const { rawResult: _rawResult, ...input } = reviewInput(undefined, overrides);
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
  for (const surface of [installedAbg, installedRoot]) {
    assert.equal(typeof surface.admitFpResultContractEnvelope, "function");
    assert.equal(typeof surface.admitFpResultContractText, "function");
    for (const modulePolicyName of [
      "FP_RESULT_WIRE_PROFILE_VALUES",
      "FpResultLocusContractDefinition",
      "fpResultLocusContractDefinition",
    ]) {
      assert.equal(Object.hasOwn(surface, modulePolicyName), false);
    }
  }

  const abgDeclarations = readFileSync(
    new URL("../../build/code/src/abg/index.d.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    abgDeclarations,
    /FP_RESULT_WIRE_PROFILE_VALUES|FpResultLocusContractDefinition|fpResultLocusContractDefinition/u,
  );
});

test("F04-D01 module-local locus policy selects exactly two admission profiles", () => {
  const transform = admitFpResultContractEnvelope(transformInput());
  const review = admitFpResultContractEnvelope(reviewInput());
  assert.equal(transform.accepted, true);
  assert.equal(transform.envelope.profile, "attached_transform_result");
  assert.equal(review.accepted, true);
  assert.equal(review.envelope.profile, "standard_live_review");

  for (const compositionStageRole of ["consequence", "human_callout"]) {
    assertRefusal(
      admitFpResultContractEnvelope({
        ...transformInput(),
        compositionStageRole,
      }),
      "unsupported_locus",
    );
  }
});

test("F04-D02 transform admission separates evidence from the opaque target candidate", () => {
  const outcome = admitFpResultContractText(
    transformTextInput(JSON.stringify(transformResult())),
  );
  assert.equal(outcome.accepted, true);
  assert.equal(outcome.envelope.profile, "attached_transform_result");
  assert.equal(outcome.envelope.resultContractRef, RESULT_CONTRACT_REF);
  assert.equal(outcome.envelope.actorRef, ACTOR_REF);
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

  for (const outcome of [
    admitFpResultContractEnvelope(transformInput(undefined, {
      expectedActorRef: null,
    })),
    admitFpResultContractEnvelope(reviewInput(undefined, {
      expectedActorRef: null,
    })),
    admitFpResultContractText(transformTextInput(
      JSON.stringify(transformResult()),
      { expectedActorRef: null },
    )),
    admitFpResultContractText(reviewTextInput(
      JSON.stringify(reviewResult()),
      { expectedActorRef: null },
    )),
    admitFpResultContractEnvelope(reviewInput(undefined, {
      expectedActorRef: ` ${ACTOR_REF}`,
    })),
    admitFpResultContractText(reviewTextInput(
      JSON.stringify(reviewResult()),
      { expectedActorRef: `${ACTOR_REF} ` },
    )),
  ]) {
    assertRefusal(outcome, "actor_mismatch");
  }

  const wrongActorResult = transformResult({
    actor: "actor://t287/f04/foreign",
  });
  assertRefusal(
    admitFpResultContractEnvelope(transformInput(wrongActorResult)),
    "actor_mismatch",
  );
  assertRefusal(
    admitFpResultContractText(
      transformTextInput(JSON.stringify(wrongActorResult)),
    ),
    "actor_mismatch",
  );
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

test("F04-D07 request assessment rosters are canonical sets", () => {
  const reverseWireResult = transformResult({
    fulfillment_assessments: [
      assessment(ASSESSMENT_B),
      assessment(ASSESSMENT_A),
    ],
  });
  const forward = admitFpResultContractEnvelope(transformInput(reverseWireResult, {
    expectedAssessmentRefs: [ASSESSMENT_A, ASSESSMENT_B],
  }));
  const reverse = admitFpResultContractEnvelope(transformInput(reverseWireResult, {
    expectedAssessmentRefs: [ASSESSMENT_B, ASSESSMENT_A],
  }));
  assert.equal(forward.accepted, true);
  assert.equal(reverse.accepted, true);
  assert.equal(JSON.stringify(forward), JSON.stringify(reverse));

  const forwardWire = admitFpResultContractEnvelope(transformInput(transformResult({
    fulfillment_assessments: [
      assessment(ASSESSMENT_A),
      assessment(ASSESSMENT_B),
    ],
  }), {
    expectedAssessmentRefs: [ASSESSMENT_A, ASSESSMENT_B],
  }));
  assert.equal(forwardWire.accepted, true);
  assert.notEqual(
    forwardWire.envelope.payloadDigest,
    reverse.envelope.payloadDigest,
  );

  const reviewForward = admitFpResultContractEnvelope(reviewInput(reviewResult({
    assessmentIds: [ASSESSMENT_B, ASSESSMENT_A],
  }), {
    expectedAssessmentRefs: [ASSESSMENT_A, ASSESSMENT_B],
  }));
  const reviewReverse = admitFpResultContractEnvelope(reviewInput(reviewResult({
    assessmentIds: [ASSESSMENT_B, ASSESSMENT_A],
  }), {
    expectedAssessmentRefs: [ASSESSMENT_B, ASSESSMENT_A],
  }));
  assert.equal(reviewForward.accepted, true);
  assert.equal(JSON.stringify(reviewForward), JSON.stringify(reviewReverse));

  const incompleteExpectedForward = [
    ASSESSMENT_C,
    ASSESSMENT_B,
    ASSESSMENT_A,
  ];
  const incompleteExpectedReverse = [...incompleteExpectedForward].reverse();
  const incompleteTransformForward = admitFpResultContractEnvelope(
    transformInput(transformResult(), {
      expectedAssessmentRefs: incompleteExpectedForward,
    }),
  );
  const incompleteTransformReverse = admitFpResultContractEnvelope(
    transformInput(transformResult(), {
      expectedAssessmentRefs: incompleteExpectedReverse,
    }),
  );
  assertRefusal(incompleteTransformForward, "incomplete_result");
  assert.equal(
    JSON.stringify(incompleteTransformForward),
    JSON.stringify(incompleteTransformReverse),
  );
  assert.equal(
    incompleteTransformForward.failure.detail,
    `transform result is missing assessments: ${ASSESSMENT_B}, ${ASSESSMENT_C}`,
  );

  const incompleteReviewForward = admitFpResultContractEnvelope(
    reviewInput(reviewResult(), {
      expectedAssessmentRefs: incompleteExpectedForward,
    }),
  );
  const incompleteReviewReverse = admitFpResultContractEnvelope(
    reviewInput(reviewResult(), {
      expectedAssessmentRefs: incompleteExpectedReverse,
    }),
  );
  assertRefusal(incompleteReviewForward, "incomplete_result");
  assert.equal(
    JSON.stringify(incompleteReviewForward),
    JSON.stringify(incompleteReviewReverse),
  );
  assert.equal(
    incompleteReviewForward.failure.detail,
    `live review is missing assessments: ${ASSESSMENT_B}, ${ASSESSMENT_C}`,
  );

  for (const input of [
    transformInput(undefined, {
      expectedAssessmentRefs: [ASSESSMENT_A, ASSESSMENT_A],
    }),
    reviewInput(undefined, {
      expectedAssessmentRefs: [ASSESSMENT_A, ASSESSMENT_A],
    }),
  ]) {
    assertRefusal(
      admitFpResultContractEnvelope(input),
      "contradictory_result",
    );
  }
});

test("F04-D08 live-review profile is closed and cannot acquire target or closure authority", () => {
  const rawReview = reviewResult();
  const input = reviewInput(rawReview);
  const outcome = admitFpResultContractEnvelope(input);
  assert.equal(outcome.accepted, true);
  assert.equal(outcome.envelope.profile, "standard_live_review");
  assert.equal(outcome.envelope.actorRef, ACTOR_REF);
  assert.deepEqual(outcome.envelope.reviewCandidate, rawReview);

  for (const undeclared of [
    { target_value: { sideDoor: true } },
    { actor: "actor://t287/f04/untrusted-echo" },
  ]) {
    assertRefusal(
      admitFpResultContractEnvelope({
        ...input,
        rawResult: { ...rawReview, ...undeclared },
      }),
      "undeclared_field",
    );
  }
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

test("F04-D09 raw I-JSON accessors refuse without one getter call", () => {
  let getterCalls = 0;
  const accessorContract = transformResult();
  delete accessorContract.result_contract_ref;
  Object.defineProperty(accessorContract, "result_contract_ref", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return RESULT_CONTRACT_REF;
    },
  });
  assertRefusal(
    admitFpResultContractEnvelope(transformInput(accessorContract)),
    "malformed_result",
  );
  assert.equal(getterCalls, 0);

  const accessorObject = {};
  Object.defineProperty(accessorObject, "answer", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return 42;
    },
  });
  assertRefusal(
    admitFpResultContractEnvelope(transformInput(transformResult({
      target_value: accessorObject,
    }))),
    "malformed_result",
  );
  assert.equal(getterCalls, 0);

  const accessorArray = [];
  Object.defineProperty(accessorArray, "0", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return assessment(ASSESSMENT_A);
    },
  });
  assertRefusal(
    admitFpResultContractEnvelope(transformInput(transformResult({
      fulfillment_assessments: accessorArray,
    }))),
    "malformed_result",
  );
  assert.equal(getterCalls, 0);
});

test("F04-D10 raw I-JSON arrays are dense identity-exact data arrays", () => {
  const customPrototype = [assessment(ASSESSMENT_A)];
  Object.setPrototypeOf(customPrototype, Object.create(Array.prototype));

  const sparse = new Array(1);

  const extra = [assessment(ASSESSMENT_A)];
  extra.named = "undeclared";

  const hidden = [assessment(ASSESSMENT_A)];
  Object.defineProperty(hidden, "hidden", {
    enumerable: false,
    value: "undeclared",
  });

  const symbol = [assessment(ASSESSMENT_A)];
  symbol[Symbol("undeclared")] = true;

  const hiddenIndex = [assessment(ASSESSMENT_A)];
  Object.defineProperty(hiddenIndex, "0", {
    enumerable: false,
    value: assessment(ASSESSMENT_A),
  });

  for (const fulfillment_assessments of [
    customPrototype,
    sparse,
    extra,
    hidden,
    symbol,
    hiddenIndex,
  ]) {
    assertRefusal(
      admitFpResultContractEnvelope(transformInput(transformResult({
        fulfillment_assessments,
      }))),
      "malformed_result",
    );
  }
});

test("F04-D11 raw I-JSON objects expose only enumerable string data members", () => {
  const customPrototype = Object.assign(
    Object.create({ inherited: true }),
    { ordinary: true },
  );

  const hidden = { ordinary: true };
  Object.defineProperty(hidden, "hidden", {
    enumerable: false,
    value: "undeclared",
  });

  const symbol = { ordinary: true };
  symbol[Symbol("undeclared")] = true;

  for (const target_value of [customPrototype, hidden, symbol]) {
    assertRefusal(
      admitFpResultContractEnvelope(transformInput(transformResult({
        target_value,
      }))),
      "malformed_result",
    );
  }

  const hiddenTopLevel = transformResult();
  Object.defineProperty(hiddenTopLevel, "hidden", {
    enumerable: false,
    value: "undeclared",
  });
  assertRefusal(
    admitFpResultContractEnvelope(transformInput(hiddenTopLevel)),
    "malformed_result",
  );

  const symbolTopLevel = transformResult();
  symbolTopLevel[Symbol("undeclared")] = true;
  assertRefusal(
    admitFpResultContractEnvelope(transformInput(symbolTopLevel)),
    "malformed_result",
  );
});

test("F04-D12 ordinary raw objects and exact text have identical admission", () => {
  const rawResult = transformResult({
    fulfillment_assessments: [
      assessment(ASSESSMENT_B),
      assessment(ASSESSMENT_A),
    ],
    target_value: {
      "scalar-\u{1f642}": "evidence-\u{1f680}",
      normalizedZero: -0,
      nested: [null, true, Number.MAX_SAFE_INTEGER],
    },
  });
  const overrides = {
    expectedAssessmentRefs: [ASSESSMENT_A, ASSESSMENT_B],
  };
  const raw = admitFpResultContractEnvelope(transformInput(rawResult, overrides));
  const text = admitFpResultContractText(
    transformTextInput(JSON.stringify(rawResult), overrides),
  );
  assert.equal(raw.accepted, true);
  assert.equal(JSON.stringify(raw), JSON.stringify(text));
  assert.equal(raw.envelope.targetValueCandidate.normalizedZero, 0);

  for (const invalidUnicode of [
    admitFpResultContractEnvelope(transformInput(transformResult({
      target_value: { invalid: "\ud800" },
    }))),
    admitFpResultContractText(transformTextInput(JSON.stringify(transformResult({
      target_value: { invalid: "\ud800" },
    })))),
  ]) {
    assertRefusal(invalidUnicode, "malformed_result");
  }
});

test("F04-D13 finite safe-number law is identical at raw and text ingress", () => {
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

  for (const n of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assertRefusal(
      admitFpResultContractEnvelope(transformInput(transformResult({
        target_value: { n },
      }))),
      "malformed_result",
    );
  }

  const infiniteText = JSON.stringify(transformResult({
    target_value: { n: "NUMBER_LITERAL" },
  })).replace('"NUMBER_LITERAL"', "1e400");
  assertRefusal(
    admitFpResultContractText(transformTextInput(infiniteText)),
    "malformed_result",
  );
});

test("F04-D14 unsafe integral text refuses instead of admitting its rounded value", () => {
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
