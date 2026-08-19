import assert from "node:assert/strict";
import test from "node:test";

import * as abg from "../../build/code/src/abg/index.js";
import * as gtl from "../../build/code/src/gtl/index.js";
import { isExactLocusStep } from "../../build/code/src/hog/operator_support.js";

const LOCUS = "locus://test/hog/fh@5";
const ARM = "arm://test/hog/fh@5";
const COMPOSITION = "composition://test/hog/fh@5";
const REQUEST = "contract://test/hog/interaction-request@5";
const RESPONSE = "contract://test/hog/raw-response@5";
const ACTION_EVALUATION_BASIS =
  "contract://test/hog/action-evaluation-basis@5";
const CONTINUATION = "contract://test/hog/continuation@5";
const CAPABILITY = "capability://test/hog/respond@5";

function commonStop(term) {
  return {
    cursor: { kind: "traversal_cursor" },
    traversalScopeRef: "traversal-scope://test/hog@5",
    runId: "run://test/hog@5",
    graphCallId: "graph-call://test/hog@5",
    frameId: "frame://test/hog@5",
    nodeRef: "node://test/hog@5",
    programLocusRef: term.programLocusRef,
    edgeRef: "edge://test/hog@5",
    vectorIndex: term.vectorIndex,
    judgmentPredicateRef: term.judgmentPredicateRef,
    stageRole: term.stageRole,
    batchRef: null,
    taskOrdinal: null,
    attempt: 0,
    retryPath: [],
    armId: term.armId,
    compositionRef: term.compositionRef,
  };
}

function interactionTerm(outputCarrierRef = ACTION_EVALUATION_BASIS) {
  return gtl.C.of({
    input: gtl.cCarrier(REQUEST),
    output: gtl.cCarrier(outputCarrierRef),
    programLocusRef: LOCUS,
    stageRole: "intent",
    fibre: "F_H",
    armId: ARM,
    compositionRef: COMPOSITION,
    vectorIndex: 3,
    judgmentPredicateRef: "predicate://test/hog/preserve@5",
    resultBearing: false,
    requirement: {
      kind: "interaction_leaf_requirement",
      interactionKind: "human_approval",
      actorCapabilityRef: CAPABILITY,
      requestContractRef: REQUEST,
      responseContractRef: RESPONSE,
      continuationContractRef: CONTINUATION,
    },
  });
}

function interactionStop(term) {
  return abg.constructCCallLocusCandidate({
    ...commonStop(term),
    stopKind: "compute_locus",
    stopClass: "interaction",
    computeRegime: "F_H",
    interactionKind: term.requirement.interactionKind,
    actorCapabilityRef: term.requirement.actorCapabilityRef,
    requestContractRef: term.requirement.requestContractRef,
    responseContractRef: term.requirement.responseContractRef,
    continuationContractRef: term.requirement.continuationContractRef,
  });
}

test("HoG exact F_H locus preserves distinct raw-response and constructive-successor contracts", () => {
  const distinct = interactionTerm();
  const stop = interactionStop(distinct);
  assert.notEqual(distinct.outputCarrierRef, stop.responseContractRef);
  assert.equal(distinct.outputCarrierRef, ACTION_EVALUATION_BASIS);
  assert.equal(isExactLocusStep(stop, distinct), true);

  const sameResponseAndSuccessor = interactionTerm(RESPONSE);
  assert.equal(
    isExactLocusStep(
      interactionStop(sameResponseAndSuccessor),
      sameResponseAndSuccessor,
    ),
    true,
  );
});

test("HoG exact F_H locus refuses every changed interaction coordinate", () => {
  const term = interactionTerm();
  const stop = interactionStop(term);
  const mutations = {
    request: (candidate) => {
      candidate.requirement.requestContractRef += "/mutated";
    },
    response: (candidate) => {
      candidate.requirement.responseContractRef += "/mutated";
    },
    continuation: (candidate) => {
      candidate.requirement.continuationContractRef += "/mutated";
    },
    capability: (candidate) => {
      candidate.requirement.actorCapabilityRef += "/mutated";
    },
    locus: (candidate) => {
      candidate.programLocusRef += "/mutated";
    },
    arm: (candidate) => {
      candidate.armId += "/mutated";
    },
    composition: (candidate) => {
      candidate.compositionRef += "/mutated";
    },
    fibre: (candidate) => {
      candidate.fibre = "F_D";
    },
  };
  for (const [label, mutate] of Object.entries(mutations)) {
    const candidate = structuredClone(term);
    mutate(candidate);
    assert.equal(isExactLocusStep(stop, candidate), false, label);
  }
});

test("HoG exact executable locus retains its declared executable contracts", () => {
  const term = gtl.C.of({
    input: gtl.cCarrier("contract://test/hog/executable-input@5"),
    output: gtl.cCarrier("contract://test/hog/executable-output@5"),
    programLocusRef: "locus://test/hog/executable@5",
    stageRole: "transform",
    fibre: "F_D",
    armId: "arm://test/hog/executable@5",
    compositionRef: "composition://test/hog/executable@5",
    vectorIndex: 0,
    judgmentPredicateRef: "predicate://test/hog/executable@5",
    resultBearing: false,
    requirement: {
      kind: "executable_leaf_requirement",
      implementationBindingRef: "implementation-binding://test/hog@5",
      inputContractRef: "contract://test/hog/executable-input@5",
      outputContractRef: "contract://test/hog/executable-output@5",
      evidenceContractRef: "contract://test/hog/evidence@5",
      failureContractRef: "contract://test/hog/failure@5",
      refusalContractRef: "contract://test/hog/refusal@5",
      judgmentContractRef: "contract://test/hog/judgment@5",
    },
  });
  const stop = abg.constructCCallLocusCandidate({
    ...commonStop(term),
    stopKind: "compute_locus",
    stopClass: "executable",
    computeRegime: "F_D",
    implementationBindingRef: term.requirement.implementationBindingRef,
    inputContractRef: term.requirement.inputContractRef,
    outputContractRef: term.requirement.outputContractRef,
    evidenceContractRef: term.requirement.evidenceContractRef,
    failureContractRef: term.requirement.failureContractRef,
    refusalContractRef: term.requirement.refusalContractRef,
    judgmentContractRef: term.requirement.judgmentContractRef,
  });
  assert.equal(isExactLocusStep(stop, term), true);
});
