import test from "node:test";
import assert from "node:assert/strict";

import {
  admitConsensusRequest,
  admitConsensusReviewerResponse,
  admitConsensusSubmitterResponse,
  bindConsensusSubmitterResponse,
  reduceConsensusRound
} from "../../build/semantic/code/src/abg/m03/contracts/consensus.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

function digest(character) {
  return `sha256:${character.repeat(64)}`;
}

function profile(name, character) {
  return {
    kind: "consensus_reviewer_profile",
    profileRef: `reviewer-profile://abg/${name}`,
    profileConfigDigest: digest(character),
    workerRef: `worker://${name}`,
    resultSchemaRef: "schema://abg/consensus/reviewer-response/v1"
  };
}

const CODEX = profile("codex", "a");
const CLAUDE = profile("claude", "b");
const SUBJECT = Object.freeze({
  kind: "ticket_review_subject",
  ticketRef: "ticket://abiogenesis/T-242",
  claims: Object.freeze([
    Object.freeze({
      claimRef: "claim://a5/release-scope",
      statement: "ABIogenesis 5.0 admits the bounded Consensus GraphFunction."
    })
  ])
});

function request(overrides = {}) {
  return admitConsensusRequest({
    kind: "consensus_request",
    requestRef: "consensus-request://a5/ticket-242/round-1",
    subjectRef: "ticket://abiogenesis/T-242",
    subject: SUBJECT,
    subjectDigest: stableSha256Digest(SUBJECT),
    submitterRef: "actor://operator/jim",
    submitterWorkerRef: "worker://submitter/jim",
    panelRef: "panel://abg/codex-claude",
    policyRef: "policy://abg/consensus/two-rounds",
    roundIndex: 1,
    maxRounds: 2,
    reviewerProfiles: [CODEX, CLAUDE],
    ...overrides
  });
}

function submitterResponse(requestValue, decision, overrides = {}) {
  return admitConsensusSubmitterResponse({
    kind: "consensus_submitter_response",
    requestRef: requestValue.requestRef,
    subjectRef: requestValue.subjectRef,
    subjectDigest: requestValue.subjectDigest,
    roundIndex: requestValue.roundIndex,
    decisionRef: decision.decisionRef,
    submitterRef: requestValue.submitterRef,
    submitterWorkerRef: requestValue.submitterWorkerRef,
    invocationRef: `actor-invocation://a5/submitter/round-${requestValue.roundIndex}`,
    outputDigest: digest("8"),
    summary: "Addressed the reviewer dissent for the verification round.",
    addressedFindingRefs: decision.dissentFindingRefs,
    evidenceRefs: ["evidence://a5/submitter/response"],
    ...overrides
  });
}

function ruling(rulingKind = "decision_row", name = rulingKind) {
  return {
    kind: "consensus_ruling_proposal",
    rulingKind,
    summary: `${name} ruling`,
    evidenceRefs: [`evidence://a5/ruling/${name}`]
  };
}

function finding(name, findingKind = "support", claimName = name) {
  return {
    kind: "consensus_reviewer_finding",
    findingRef: `finding://a5/${name}`,
    claimRef: `claim://a5/${claimName}`,
    findingKind,
    summary: `${name} summary`,
    evidenceRefs: [`evidence://a5/${name}`]
  };
}

function response(requestValue, profileValue, input = {}) {
  const disposition = input.disposition ?? "accept";
  const findings = input.findings ?? [
    finding(`${profileValue.profileRef.split("/").at(-1)}-support`)
  ];
  const reviewerKey = profileValue.profileRef.split("/").at(-1);
  return admitConsensusReviewerResponse({
    kind: "consensus_reviewer_response",
    requestRef: requestValue.requestRef,
    subjectRef: requestValue.subjectRef,
    subjectDigest: requestValue.subjectDigest,
    roundIndex: requestValue.roundIndex,
    reviewerProfileRef: profileValue.profileRef,
    reviewerProfileDigest:
      input.profileDigest ?? profileValue.profileConfigDigest,
    invocationRef: `actor-invocation://a5/${reviewerKey}/round-${requestValue.roundIndex}`,
    outputDigest: digest(reviewerKey === "codex" ? "d" : "e"),
    disposition,
    findings,
    ruling: input.ruling ?? ruling(),
    evidenceRefs: [`evidence://a5/${reviewerKey}/response`]
  });
}

test("A5 Consensus request admission requires two unique reviewer profiles", () => {
  assert.throws(
    () => request({ reviewerProfiles: [CODEX] }),
    /at least two profiles/u
  );
  assert.throws(
    () => request({ reviewerProfiles: [CODEX, { ...CODEX }] }),
    /unique profileRef/u
  );
  assert.throws(
    () => request({ roundIndex: 3, maxRounds: 2 }),
    /must not exceed maxRounds/u
  );
  assert.throws(
    () => request({ subjectDigest: digest("c") }),
    /does not match the admitted subject/u
  );
  assert.throws(
    () => request({ subject: { invalid: Number.NaN } }),
    /non-finite numbers are not I-JSON/u
  );
});

test("A5 Consensus reviewer admission rejects malformed F_P output before reduction", () => {
  const admittedRequest = request();
  const base = {
    kind: "consensus_reviewer_response",
    requestRef: admittedRequest.requestRef,
    subjectRef: admittedRequest.subjectRef,
    subjectDigest: admittedRequest.subjectDigest,
    roundIndex: admittedRequest.roundIndex,
    reviewerProfileRef: CODEX.profileRef,
    reviewerProfileDigest: CODEX.profileConfigDigest,
    invocationRef: "actor-invocation://a5/codex/malformed",
    outputDigest: digest("f"),
    disposition: "accept",
    findings: [finding("malformed-support")],
    ruling: ruling(),
    evidenceRefs: ["evidence://a5/malformed"]
  };
  assert.throws(
    () => admitConsensusReviewerResponse({ ...base, inventedAuthority: true }),
    /field set mismatch.*inventedAuthority/u
  );
  assert.throws(
    () => admitConsensusReviewerResponse({ ...base, outputDigest: "sha256:no" }),
    /lowercase sha256 digest/u
  );
  assert.throws(
    () => admitConsensusReviewerResponse({
      ...base,
      disposition: "revise",
      findings: [finding("revise-without-objection")]
    }),
    /revise admits only objection findings/u
  );
  assert.throws(
    () => admitConsensusReviewerResponse({
      ...base,
      disposition: "escalate",
      findings: []
    }),
    /escalate requires at least one unresolved finding/u
  );
  assert.throws(
    () => admitConsensusReviewerResponse({
      ...base,
      ruling: { ...ruling(), rulingKind: "invented_ruling" }
    }),
    /rulingKind must be one of/u
  );
  assert.throws(
    () => admitConsensusReviewerResponse({
      ...base,
      findings: [{ ...finding("unknown-finding-field"), unexpected: "no" }]
    }),
    /field set mismatch.*unexpected/u
  );
  assert.throws(
    () => admitConsensusReviewerResponse({
      ...base,
      findings: [
        finding("duplicate-claim-one", "support", "duplicate-claim"),
        finding("duplicate-claim-two", "support", "duplicate-claim")
      ]
    }),
    /unique claimRef/u
  );
});

test("A5 Consensus reduction deterministically closes exact claim agreement", () => {
  const admittedRequest = request();
  const codex = response(admittedRequest, CODEX, {
    findings: [finding("codex-shared-support", "support", "shared")]
  });
  const claude = response(admittedRequest, CLAUDE, {
    findings: [finding("claude-shared-support", "support", "shared")]
  });
  const forward = reduceConsensusRound({
    request: admittedRequest,
    responses: [codex, claude]
  });
  const reversed = reduceConsensusRound({
    request: admittedRequest,
    responses: [claude, codex]
  });

  assert.deepEqual(reversed, forward);
  assert.equal(forward.outcome, "closed_done");
  assert.deepEqual(forward.reviewerProfileRefs, [CODEX.profileRef, CLAUDE.profileRef]);
  assert.equal(forward.reviewerResponseRefs.length, 2);
  assert.deepEqual(forward.dissentFindingRefs, []);
  assert.deepEqual(forward.dissentResponseRefs, []);
  assert.equal(forward.rulingKind, "decision_row");
  assert.equal(forward.nextAction, "admit_ruling");
  assert.match(forward.decisionRef, /^consensus-decision:sha256:[a-f0-9]{64}$/u);
});

test("A5 Consensus reduction closes exact unanimous objection as a typed ruling", () => {
  const admittedRequest = request();
  const decision = reduceConsensusRound({
    request: admittedRequest,
    responses: [
      response(admittedRequest, CODEX, {
        disposition: "revise",
        findings: [finding("codex-objection", "objection", "shared")],
        ruling: ruling("draft_ticket", "codex-draft")
      }),
      response(admittedRequest, CLAUDE, {
        disposition: "revise",
        findings: [finding("claude-objection", "objection", "shared")],
        ruling: ruling("draft_ticket", "claude-draft")
      })
    ]
  });

  assert.equal(decision.outcome, "closed_done");
  assert.equal(decision.rulingKind, "draft_ticket");
  assert.equal(decision.nextAction, "admit_ruling");
  assert.deepEqual(decision.dissentFindingRefs, []);
  assert.deepEqual(decision.dissentResponseRefs, []);
});

test("A5 Consensus reduction permits explicit empty agreement but not silent ruling disagreement", () => {
  const admittedRequest = request();
  const agreed = reduceConsensusRound({
    request: admittedRequest,
    responses: [
      response(admittedRequest, CODEX, { findings: [] }),
      response(admittedRequest, CLAUDE, { findings: [] })
    ]
  });
  assert.equal(agreed.outcome, "closed_done");
  assert.equal(agreed.rulingKind, "decision_row");

  const disputed = reduceConsensusRound({
    request: admittedRequest,
    responses: [
      response(admittedRequest, CODEX, { findings: [] }),
      response(admittedRequest, CLAUDE, {
        findings: [],
        ruling: ruling("deferment")
      })
    ]
  });
  assert.equal(disputed.outcome, "recurse_next_round");
  assert.equal(disputed.rulingKind, null);
  assert.equal(disputed.nextAction, "verify_next_round");
  assert.deepEqual(disputed.dissentFindingRefs, []);
  assert.equal(disputed.dissentResponseRefs.length, 2);
  const admittedSubmitterResponse = submitterResponse(admittedRequest, disputed);
  assert.deepEqual(admittedSubmitterResponse.addressedFindingRefs, []);
  assert.equal(
    bindConsensusSubmitterResponse({
      request: admittedRequest,
      decision: disputed,
      response: admittedSubmitterResponse
    }),
    admittedSubmitterResponse
  );
});

test("A5 Consensus reduction treats profile-unique accepted claims as dissent", () => {
  const admittedRequest = request();
  const decision = reduceConsensusRound({
    request: admittedRequest,
    responses: [
      response(admittedRequest, CODEX, {
        findings: [finding("codex-unique-support")]
      }),
      response(admittedRequest, CLAUDE, {
        findings: [finding("claude-unique-support")]
      })
    ]
  });

  assert.equal(decision.outcome, "recurse_next_round");
  assert.equal(decision.rulingKind, null);
  assert.equal(decision.nextAction, "verify_next_round");
  assert.deepEqual(decision.dissentFindingRefs, [
    "finding://a5/claude-unique-support",
    "finding://a5/codex-unique-support"
  ]);
  assert.equal(decision.dissentResponseRefs.length, 2);
});

test("A5 Consensus reduction treats different finding kinds for one claim as dissent", () => {
  const admittedRequest = request();
  const codex = response(admittedRequest, CODEX, {
    disposition: "revise",
    findings: [finding("codex-objection", "objection", "shared-dispute")]
  });
  const claude = response(admittedRequest, CLAUDE, {
    findings: [finding("claude-support", "support", "shared-dispute")]
  });
  const decision = reduceConsensusRound({
    request: admittedRequest,
    responses: [codex, claude]
  });

  assert.equal(decision.outcome, "recurse_next_round");
  assert.equal(decision.rulingKind, null);
  assert.deepEqual(decision.dissentFindingRefs, [
    "finding://a5/claude-support",
    "finding://a5/codex-objection"
  ]);
});

test("A5 Consensus reduction recurses unresolved judgment then escalates at the round limit", () => {
  const firstRound = request();
  const explicit = reduceConsensusRound({
    request: firstRound,
    responses: [
      response(firstRound, CODEX, {
        disposition: "escalate",
        findings: [finding("codex-unresolved", "unresolved", "uncertain")]
      }),
      response(firstRound, CLAUDE, {
        disposition: "escalate",
        findings: [finding("claude-unresolved", "unresolved", "uncertain")]
      })
    ]
  });
  assert.equal(explicit.outcome, "recurse_next_round");
  assert.equal(explicit.nextAction, "verify_next_round");

  const finalRound = request({
    requestRef: "consensus-request://a5/ticket-242/round-2",
    roundIndex: 2
  });
  const exhausted = reduceConsensusRound({
    request: finalRound,
    responses: [
      response(finalRound, CODEX, {
        disposition: "revise",
        findings: [finding("codex-final-objection", "objection", "final-dispute")]
      }),
      response(finalRound, CLAUDE, {
        findings: [finding("claude-final-support", "support", "final-dispute")]
      })
    ]
  });
  assert.equal(exhausted.outcome, "escalate_fh");
  assert.equal(exhausted.rulingKind, null);
  assert.equal(exhausted.nextAction, "fh_adjudicate");
});

test("A5 Consensus ruling disagreement recurses then escalates at the declared limit", () => {
  const firstRound = request();
  const firstDecision = reduceConsensusRound({
    request: firstRound,
    responses: [
      response(firstRound, CODEX, {
        findings: [finding("codex-ruling-support", "support", "shared")]
      }),
      response(firstRound, CLAUDE, {
        findings: [finding("claude-ruling-support", "support", "shared")],
        ruling: ruling("deferment")
      })
    ]
  });
  assert.equal(firstDecision.outcome, "recurse_next_round");
  assert.equal(firstDecision.rulingKind, null);

  const finalRound = request({
    requestRef: "consensus-request://a5/ticket-242/round-2-ruling-dispute",
    roundIndex: 2
  });
  const finalDecision = reduceConsensusRound({
    request: finalRound,
    responses: [
      response(finalRound, CODEX, {
        findings: [finding("codex-final-ruling", "support", "shared")]
      }),
      response(finalRound, CLAUDE, {
        findings: [finding("claude-final-ruling", "support", "shared")],
        ruling: ruling("deferment")
      })
    ]
  });
  assert.equal(finalDecision.outcome, "escalate_fh");
  assert.equal(finalDecision.rulingKind, null);
  assert.equal(finalDecision.nextAction, "fh_adjudicate");
});

test("A5 Consensus admits and binds one submitter response to recurse dissent", () => {
  const admittedRequest = request();
  const decision = reduceConsensusRound({
    request: admittedRequest,
    responses: [
      response(admittedRequest, CODEX, {
        findings: [finding("codex-submitter-dissent", "support", "codex-claim")]
      }),
      response(admittedRequest, CLAUDE, {
        findings: [finding("claude-submitter-dissent", "support", "claude-claim")]
      })
    ]
  });
  const admittedResponse = submitterResponse(admittedRequest, decision);

  assert.equal(
    bindConsensusSubmitterResponse({
      request: admittedRequest,
      decision,
      response: admittedResponse
    }),
    admittedResponse
  );
  assert.match(
    admittedResponse.responseRef,
    /^consensus-submitter-response:sha256:[a-f0-9]{64}$/u
  );
  assert.deepEqual(
    admittedResponse.addressedFindingRefs,
    decision.dissentFindingRefs
  );
});

test("A5 Consensus submitter response rejects malformed shape, basis, and dissent coverage", () => {
  const admittedRequest = request();
  const decision = reduceConsensusRound({
    request: admittedRequest,
    responses: [
      response(admittedRequest, CODEX, {
        findings: [finding("codex-coverage", "support", "codex-claim")]
      }),
      response(admittedRequest, CLAUDE, {
        findings: [finding("claude-coverage", "support", "claude-claim")]
      })
    ]
  });

  assert.throws(
    () => submitterResponse(admittedRequest, decision, { invented: true }),
    /field set mismatch.*invented/u
  );
  assert.throws(
    () =>
      submitterResponse(admittedRequest, decision, {
        addressedFindingRefs: [
          decision.dissentFindingRefs[0],
          decision.dissentFindingRefs[0]
        ]
      }),
    /must not contain duplicate values/u
  );

  const wrongDecision = submitterResponse(admittedRequest, decision, {
    decisionRef: "consensus-decision:wrong"
  });
  assert.throws(
    () =>
      bindConsensusSubmitterResponse({
        request: admittedRequest,
        decision,
        response: wrongDecision
      }),
    /does not match the admitted request and decision basis/u
  );

  const wrongSubmitter = submitterResponse(admittedRequest, decision, {
    submitterWorkerRef: "worker://submitter/other"
  });
  assert.throws(
    () =>
      bindConsensusSubmitterResponse({
        request: admittedRequest,
        decision,
        response: wrongSubmitter
      }),
    /does not match the declared submitter binding/u
  );

  const incomplete = submitterResponse(admittedRequest, decision, {
    addressedFindingRefs: [decision.dissentFindingRefs[0]]
  });
  assert.throws(
    () =>
      bindConsensusSubmitterResponse({
        request: admittedRequest,
        decision,
        response: incomplete
      }),
    /must exactly address the decision dissentFindingRefs/u
  );

  const valid = submitterResponse(admittedRequest, decision);
  assert.throws(
    () =>
      bindConsensusSubmitterResponse({
        request: admittedRequest,
        decision,
        response: { ...valid }
      }),
    /requires an admitted submitter response/u
  );
});

test("A5 Consensus submitter response is not admitted for a terminal decision", () => {
  const admittedRequest = request();
  const decision = reduceConsensusRound({
    request: admittedRequest,
    responses: [
      response(admittedRequest, CODEX, {
        findings: [finding("codex-terminal", "support", "shared")]
      }),
      response(admittedRequest, CLAUDE, {
        findings: [finding("claude-terminal", "support", "shared")]
      })
    ]
  });
  const admittedResponse = submitterResponse(admittedRequest, decision);

  assert.throws(
    () =>
      bindConsensusSubmitterResponse({
        request: admittedRequest,
        decision,
        response: admittedResponse
      }),
    /admitted only for recurse_next_round/u
  );
});

test("A5 Consensus reduction rejects incomplete, misbound, or unadmitted responses", () => {
  const admittedRequest = request();
  const codex = response(admittedRequest, CODEX);
  const claude = response(admittedRequest, CLAUDE);

  assert.throws(
    () => reduceConsensusRound({ request: admittedRequest, responses: [codex] }),
    /exactly one response/u
  );
  assert.throws(
    () => reduceConsensusRound({
      request: admittedRequest,
      responses: [codex, response(admittedRequest, CLAUDE, { profileDigest: digest("9") })]
    }),
    /does not match its admitted profile digest/u
  );
  assert.throws(
    () => reduceConsensusRound({
      request: admittedRequest,
      responses: [{ ...codex }, claude]
    }),
    /requires admitted reviewer responses/u
  );
});
