import assert from "node:assert/strict";
import test from "node:test";

import {
  FhInteractionAdmissionError,
  admitFhInteractionResume,
  openFhInteraction,
  projectFhInteraction,
  projectFhInteractionForGraphCall,
  submitFhInteractionResponse
} from "../../build/semantic/code/src/abg/m03/runner/fh_interaction.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const CAPABILITY_REF = "capability://example/human-review";
const RESPONSE_CONTRACT_REF = "contract://example/human-decision";

function declaredRequest(overrides = {}) {
  const startupBlock = canonicalStartupBlock();
  const variant = Object.freeze({
    kind: "declared_execution_request",
    handoffRef: "abg://handoff/example/fh",
    stageRole: "human_callout",
    stageTermDigest: stableSha256Digest({ stage: "human_callout" }),
    contextContractRef: "abg://execution-context/example/fh",
    contextContractDigest: stableSha256Digest({ context: "example/fh" }),
    startupBlock,
    startupBlockDigest: startupBlock.blockDigest,
    regime: "F_H",
    interactionSubjectRef: "interaction-subject://example/review",
    declarationClosureDigest: stableSha256Digest({ declarations: "example" }),
    instructionProtocol: Object.freeze({
      instructionProtocolRef: "instruction-protocol://example/human",
      version: "1.0.0",
      instructionAssetNodeRef: "node://example/human-instruction",
      instructionAssetSurface: Object.freeze({ kind: "example_human_instruction" }),
      allowedStageRoles: Object.freeze(["human_callout"]),
      sections: Object.freeze([]),
      relevancePolicies: Object.freeze([]),
      compressionPolicy: Object.freeze({
        policyRef: "policy://example/full",
        mode: "full_admitted_content"
      }),
      proportionalityPolicyRef: "policy://example/proportionality",
      runtimeBindingSlotClasses: Object.freeze(["source_node"]),
      policyRefs: Object.freeze(["policy://example/human"]),
      sourceModuleRef: "gtl://module/example/instructions",
      sourceModuleDigest: stableSha256Digest({ module: "example/instructions" }),
      protocolDigest: stableSha256Digest({ protocol: "example/human" })
    }),
    selectedProtocolSectionRefs: Object.freeze([]),
    protocolClosureDigest: stableSha256Digest({ protocolClosure: "example" }),
    resultContractRef: RESPONSE_CONTRACT_REF,
    eligibleOperationIds: Object.freeze([
      "abg.operation.fh.select",
      "abg.operation.fh.approve",
      "abg.operation.fh.reject",
      "abg.operation.fh.assess",
      "abg.operation.fh.answer-escalation"
    ]),
    resumeEligibleOperationIds: Object.freeze([
      "abg.operation.fh.select",
      "abg.operation.fh.approve",
      "abg.operation.fh.reject",
      "abg.operation.fh.answer-escalation"
    ]),
    declaredChoiceRefs: Object.freeze([
      "choice://example/option-a",
      "choice://example/option-b"
    ]),
    targetBindingDigest: stableSha256Digest({ target: "example" }),
    capabilityRefs: Object.freeze([CAPABILITY_REF]),
    capabilityBasisDigest: stableSha256Digest({ capabilities: [CAPABILITY_REF] }),
    sourceCarrierRefs: Object.freeze(["carrier://example/review"]),
    sourceCarrierDigests: Object.freeze([
      stableSha256Digest({ carrier: "example/review" })
    ]),
    ...overrides
  });
  const requestDigest = stableSha256Digest(variant);
  return Object.freeze({
    ...variant,
    requestRef:
      `abg://declared-execution-request/${requestDigest.slice("sha256:".length)}`,
    requestDigest
  });
}

function canonicalStartupBlock(overrides = {}) {
  const basis = Object.freeze({
    kind: "graph_vector_traversal_startup_block",
    status: "startup_blocked_awaiting_t267",
    gapFamily: "traversal_execution_contracts",
    runtimeAddressable: false,
    effectsPermitted: false,
    authorityRefs: Object.freeze([
      "REQ-L-GTL3-C-ALGEBRA-016",
      "REQ-R-ABG3-INTERPRET-010",
      "REQ-R-ABG3-INTERPRET-027"
    ]),
    ...overrides
  });
  return Object.freeze({
    ...basis,
    blockDigest: stableSha256Digest(basis)
  });
}

function openedFixture(request = declaredRequest()) {
  const events = [];
  const opened = openFhInteraction({
    request,
    basisId: "basis://example/1",
    graphFunctionId: "graph-function://example/review",
    graphCallId: "graph-call://example/1",
    frameId: "frame://example/1",
    vectorIndex: 3,
    edge: "Review -> Decision",
    cCallRef: "c-call://example/1/human",
    causationEventRefs: [],
    correlationId: "correlation://example/1",
    priorEvents: [],
    eventSink: (event) => events.push(event)
  });
  return { request, events, opened };
}

function responseInput(value, overrides = {}) {
  return {
    interactionRef: value.opened.interactionRef,
    interactionBasisDigest: value.opened.interactionBasisDigest,
    operationId: "abg.operation.fh.approve",
    invocationId: "invocation://example/fh/1",
    requestId: "request://example/fh/1",
    actorRef: "actor://example/reviewer",
    responseContractRef: RESPONSE_CONTRACT_REF,
    choiceRef: null,
    value: { approved: true, rationale: "evidence is sufficient" },
    evidenceRefs: ["evidence://example/review/1"],
    capabilityRefs: [CAPABILITY_REF],
    capabilityProvenanceRefs: ["capability-provenance://example/reviewer"],
    correlationId: "correlation://example/fh/1",
    priorEvents: value.events,
    eventSink: (event) => value.events.push(event),
    ...overrides
  };
}

function openedIdentityBasis(event) {
  return Object.freeze({
    kind: "fh_interaction_basis",
    basisId: event.basisId,
    graphFunctionId: event.graphFunctionId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    vectorIndex: event.vectorIndex,
    edge: event.edge,
    cCallRef: event.cCallRef,
    interactionSubjectRef: event.interactionSubjectRef,
    continuationRef: event.continuationRef,
    requestRef: event.requestRef,
    requestDigest: event.requestDigest,
    responseContractRef: event.responseContractRef,
    eligibleOperationIds: event.eligibleOperationIds,
    resumeEligibleOperationIds: event.resumeEligibleOperationIds,
    declaredChoiceRefs: event.declaredChoiceRefs,
    requiredCapabilityRefs: event.requiredCapabilityRefs,
    capabilityBasisDigest: event.capabilityBasisDigest,
    sourceCarrierRefs: event.sourceCarrierRefs,
    sourceCarrierDigests: event.sourceCarrierDigests
  });
}

function reidentifyOpened(event, overrides) {
  const candidate = Object.freeze({ ...event, ...overrides });
  const interactionBasisDigest = stableSha256Digest(
    openedIdentityBasis(candidate)
  );
  return Object.freeze({
    ...candidate,
    interactionRef:
      `abg://fh-interaction/${interactionBasisDigest.slice("sha256:".length)}`,
    interactionBasisDigest
  });
}

function assertAdmissionCode(code, action) {
  assert.throws(
    action,
    (error) =>
      error instanceof FhInteractionAdmissionError && error.code === code
  );
}

test("T-258 opens and projects one generic non-Consensus pending interaction", () => {
  const value = openedFixture();
  assert.equal(value.events.length, 1);
  assert.equal(value.opened.kind, "fh_interaction_opened");
  const projection = projectFhInteraction(
    value.events,
    value.opened.interactionRef
  );
  assert.notEqual(projection, null);
  assert.equal(projection.status, "pending");
  assert.equal(projection.continuationRef, value.opened.continuationRef);
  assert.deepEqual(projection.requiredCapabilityRefs, [CAPABILITY_REF]);
  assert.equal(
    projectFhInteractionForGraphCall(value.events, value.opened.graphCallId)
      ?.interactionRef,
    value.opened.interactionRef
  );
});

test("T-258 admits one actor-attributed response and resumes the same continuation", () => {
  const value = openedFixture();
  const response = submitFhInteractionResponse(responseInput(value));
  assert.equal(response.replayed, false);
  assert.equal(response.event.kind, "fh_interaction_responded");
  assert.equal(response.projection.status, "responded");
  assert.equal(response.projection.responseActorRef, "actor://example/reviewer");
  assert.equal(value.events.length, 2);

  const responseReplay = submitFhInteractionResponse(responseInput(value));
  assert.equal(responseReplay.replayed, true);
  assert.equal(responseReplay.event.eventId, response.event.eventId);
  assert.equal(value.events.length, 2);

  const resumeInput = {
    interactionRef: response.projection.interactionRef,
    interactionBasisDigest: response.projection.interactionBasisDigest,
    responseRef: response.projection.responseRef,
    continuationRef: response.projection.continuationRef,
    invocationId: "invocation://example/resume/1",
    requestId: "request://example/resume/1",
    actorRef: "actor://example/reviewer",
    correlationId: "correlation://example/resume/1",
    priorEvents: value.events,
    eventSink: (event) => value.events.push(event)
  };
  const resumed = admitFhInteractionResume(resumeInput);
  assert.equal(resumed.replayed, false);
  assert.equal(resumed.projection.status, "resume_admitted");
  assert.equal(
    resumed.projection.continuationRef,
    response.projection.continuationRef
  );
  assert.equal(value.events.length, 3);

  const resumeReplay = admitFhInteractionResume(resumeInput);
  assert.equal(resumeReplay.replayed, true);
  assert.equal(resumeReplay.event.eventId, resumed.event.eventId);
  assert.equal(value.events.length, 3);
});

test("T-258 distinguishes an admitted JSON null response from a pending interaction", () => {
  const value = openedFixture();
  const response = submitFhInteractionResponse(
    responseInput(value, { value: null })
  );
  assert.equal(response.projection.status, "responded");
  assert.notEqual(response.projection.responseRef, null);
  assert.equal(response.projection.responseValue, null);
});

test("T-258 refuses stale, undeclared, ungrounded, and conflicting responses", () => {
  const value = openedFixture();
  assertAdmissionCode("unknown_interaction", () =>
    submitFhInteractionResponse(responseInput(value, {
      interactionRef: "abg://fh-interaction/unknown"
    }))
  );
  assertAdmissionCode("stale_basis", () =>
    submitFhInteractionResponse(responseInput(value, {
      interactionBasisDigest: stableSha256Digest({ stale: true })
    }))
  );
  assertAdmissionCode("operation_not_declared", () =>
    submitFhInteractionResponse(responseInput(value, {
      operationId: "abg.operation.fh.unknown"
    }))
  );
  assertAdmissionCode("response_contract_mismatch", () =>
    submitFhInteractionResponse(responseInput(value, {
      responseContractRef: "contract://example/wrong"
    }))
  );
  assertAdmissionCode("choice_not_declared", () =>
    submitFhInteractionResponse(responseInput(value, {
      operationId: "abg.operation.fh.select",
      choiceRef: "choice://example/not-declared"
    }))
  );
  assertAdmissionCode("capability_mismatch", () =>
    submitFhInteractionResponse(responseInput(value, { capabilityRefs: [] }))
  );
  assertAdmissionCode("capability_provenance_missing", () =>
    submitFhInteractionResponse(responseInput(value, {
      capabilityProvenanceRefs: []
    }))
  );
  assertAdmissionCode("evidence_missing", () =>
    submitFhInteractionResponse(responseInput(value, { evidenceRefs: [] }))
  );

  submitFhInteractionResponse(responseInput(value));
  assertAdmissionCode("interaction_not_pending", () =>
    submitFhInteractionResponse(responseInput(value, {
      value: { approved: false }
    }))
  );
});

test("T-258 refuses invalid selection, non-resumable response, and resume drift", () => {
  const selected = openedFixture();
  assertAdmissionCode("choice_not_declared", () =>
    submitFhInteractionResponse(responseInput(selected, {
      operationId: "abg.operation.fh.select",
      choiceRef: null
    }))
  );

  const held = openedFixture();
  const assessment = submitFhInteractionResponse(responseInput(held, {
    operationId: "abg.operation.fh.assess",
    value: { assessment: "more evidence required" }
  }));
  assert.equal(assessment.projection.status, "held");
  assertAdmissionCode("response_not_resume_eligible", () =>
    admitFhInteractionResume({
      interactionRef: assessment.projection.interactionRef,
      interactionBasisDigest: assessment.projection.interactionBasisDigest,
      responseRef: assessment.projection.responseRef,
      continuationRef: assessment.projection.continuationRef,
      invocationId: "invocation://example/resume/held",
      requestId: "request://example/resume/held",
      actorRef: "actor://example/reviewer",
      correlationId: "correlation://example/resume/held",
      priorEvents: held.events,
      eventSink: (event) => held.events.push(event)
    })
  );

  const value = openedFixture();
  const response = submitFhInteractionResponse(responseInput(value));
  const resumeBasis = {
    interactionRef: response.projection.interactionRef,
    interactionBasisDigest: response.projection.interactionBasisDigest,
    responseRef: response.projection.responseRef,
    continuationRef: response.projection.continuationRef,
    invocationId: "invocation://example/resume/drift",
    requestId: "request://example/resume/drift",
    actorRef: "actor://example/reviewer",
    correlationId: "correlation://example/resume/drift",
    priorEvents: value.events,
    eventSink: (event) => value.events.push(event)
  };
  assertAdmissionCode("response_mismatch", () =>
    admitFhInteractionResume({
      ...resumeBasis,
      responseRef: "abg://fh-response/wrong"
    })
  );
  assertAdmissionCode("continuation_mismatch", () =>
    admitFhInteractionResume({
      ...resumeBasis,
      continuationRef: "abg://fh-continuation/wrong"
    })
  );
});

test("T-258 rejects forged declared-request and replay identity", () => {
  const request = declaredRequest();
  const forgedRequest = Object.freeze({
    ...request,
    resultContractRef: "contract://example/forged"
  });
  assertAdmissionCode("replay_invalid", () => openedFixture(forgedRequest));

  const effectsPermittedBlock = canonicalStartupBlock({
    effectsPermitted: true
  });
  assertAdmissionCode("replay_invalid", () =>
    openedFixture(
      declaredRequest({
        startupBlock: effectsPermittedBlock,
        startupBlockDigest: effectsPermittedBlock.blockDigest
      })
    )
  );
  assertAdmissionCode("replay_invalid", () =>
    openedFixture(declaredRequest({ sourceCarrierDigests: [] }))
  );

  const value = openedFixture();
  const forgedOpened = Object.freeze({
    ...value.opened,
    interactionSubjectRef: "interaction-subject://example/forged"
  });
  assertAdmissionCode("replay_invalid", () =>
    projectFhInteraction([forgedOpened], forgedOpened.interactionRef)
  );

  const mismatchedCarriers = reidentifyOpened(value.opened, {
    sourceCarrierDigests: Object.freeze([])
  });
  assertAdmissionCode("replay_invalid", () =>
    projectFhInteraction([mismatchedCarriers], mismatchedCarriers.interactionRef)
  );
});

test("T-258 replay revalidates response and resume lifecycle ownership", () => {
  const value = openedFixture();
  const response = submitFhInteractionResponse(responseInput(value));
  const wrongResponseOwner = Object.freeze({
    ...response.event,
    graphCallId: "graph-call://example/other"
  });
  assertAdmissionCode("replay_invalid", () =>
    projectFhInteraction(
      [value.opened, wrongResponseOwner],
      value.opened.interactionRef
    )
  );
  const wrongResponseCause = Object.freeze({
    ...response.event,
    causationEventRefs: Object.freeze([])
  });
  assertAdmissionCode("replay_invalid", () =>
    projectFhInteraction(
      [value.opened, wrongResponseCause],
      value.opened.interactionRef
    )
  );

  const resumed = admitFhInteractionResume({
    interactionRef: response.projection.interactionRef,
    interactionBasisDigest: response.projection.interactionBasisDigest,
    responseRef: response.projection.responseRef,
    continuationRef: response.projection.continuationRef,
    invocationId: "invocation://example/resume/replay-ownership",
    requestId: "request://example/resume/replay-ownership",
    actorRef: "actor://example/reviewer",
    correlationId: "correlation://example/resume/replay-ownership",
    priorEvents: value.events,
    eventSink: (event) => value.events.push(event)
  });
  const wrongResumeOwner = Object.freeze({
    ...resumed.event,
    basisId: "basis://example/other"
  });
  assertAdmissionCode("replay_invalid", () =>
    projectFhInteraction(
      [value.opened, response.event, wrongResumeOwner],
      value.opened.interactionRef
    )
  );
  const wrongResumeCause = Object.freeze({
    ...resumed.event,
    causationEventRefs: Object.freeze([value.opened.eventId])
  });
  assertAdmissionCode("replay_invalid", () =>
    projectFhInteraction(
      [value.opened, response.event, wrongResumeCause],
      value.opened.interactionRef
    )
  );
});

test("T-258 fails closed when one GraphCall contains multiple interactions", () => {
  const value = openedFixture();
  const secondRequest = declaredRequest({
    interactionSubjectRef: "interaction-subject://example/second-review"
  });
  openFhInteraction({
    request: secondRequest,
    basisId: "basis://example/1",
    graphFunctionId: "graph-function://example/review",
    graphCallId: value.opened.graphCallId,
    frameId: "frame://example/1",
    vectorIndex: 4,
    edge: "SecondReview -> Decision",
    cCallRef: "c-call://example/1/second-human",
    causationEventRefs: [],
    correlationId: "correlation://example/second-review",
    priorEvents: value.events,
    eventSink: (event) => value.events.push(event)
  });
  assertAdmissionCode("ambiguous_interaction", () =>
    projectFhInteractionForGraphCall(value.events, value.opened.graphCallId)
  );
});
