// Validates: T-277 PC-001, PC-002, and PC-003.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitConsensusDomainValue,
  admitConsensusPanel,
  admitConsensusResult,
  admitConsensusSubject,
  admitReviewFindings,
  admitReviewRulings,
  admitTicketConsensusProjection,
  CONSENSUS_PUBLIC_CONTRACT_FAMILY,
  CONSENSUS_PUBLIC_CONTRACT_DEFINITIONS,
  CONSENSUS_ROUND_OUTCOME_VALUES,
  REVIEW_RULING_KIND_VALUES
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import {
  ABG_CONSENSUS_GTL_MODULE
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_gtl_body.js";
import {
  ABG_CONSENSUS_MODULE_DECLARATIONS,
  deriveConsensusModuleDeclaration
} from "../../build/semantic/code/src/abg/m03/contracts/review_consensus_modules.js";

const DIGEST_A = `sha256:${"a".repeat(64)}`;
const DIGEST_B = `sha256:${"b".repeat(64)}`;

function profile(profileRef = "profile://reviewer/one") {
  return {
    kind: "consensus_reviewer_profile",
    profileRef,
    roleContractRef: "role://reviewer",
    configurationDigest: DIGEST_A,
    instructionContractRef: "contract://instruction/reviewer",
    resultContractRef: "contract://result/findings",
    capabilityRefs: ["capability://review"]
  };
}

function findings() {
  return {
    kind: "review_findings",
    profileRef: "profile://reviewer/one",
    configurationDigest: DIGEST_A,
    invocationRef: "invocation://review/one",
    outputDigest: DIGEST_B,
    evidenceRefs: ["evidence://finding/one"],
    findings: [{
      findingRef: "finding://one",
      findingContractRef: "contract://review/finding",
      findingPayloadRef: "payload://finding/one",
      evidenceRefs: ["evidence://finding/one"]
    }],
    residuals: [],
    refusal: null
  };
}

function rulings() {
  return {
    kind: "review_rulings",
    roundRef: "round://one",
    rows: [{
      rulingRef: "ruling://one",
      rulingKind: "decision_row",
      findingRefs: ["finding://one"],
      rationaleRef: "rationale://one",
      payloadRef: "payload://ruling/one"
    }]
  };
}

function outcome() {
  return {
    kind: "consensus_round_outcome",
    roundRef: "round://one",
    outcome: "closed_done",
    findingSetRefs: ["findings://one"],
    rulingRefs: ["ruling://one"],
    evidenceRefs: ["evidence://round/one"]
  };
}

function result() {
  return {
    kind: "consensus_result",
    subjectRef: "ticket://T-900",
    subjectDigest: DIGEST_A,
    panelRef: "panel://one",
    policyRef: "policy://rounds/one",
    roundRefs: ["round://one"],
    findingSetRefs: ["findings://one"],
    rulings: rulings(),
    classification: "unanimous_agreement",
    dissentProfileRefs: [],
    terminalOutcome: outcome(),
    evidenceRefs: ["evidence://round/one"],
    lineageRefs: ["lineage://consensus/one"],
    resultRef: "result://consensus/one",
    replayRef: "replay://consensus/one",
    contractFailureRef: null
  };
}

test("T-277 PC-001 exposes nine projections and one source for both vocabularies", () => {
  assert.equal(CONSENSUS_PUBLIC_CONTRACT_DEFINITIONS.length, 9);
  assert.equal(Object.keys(CONSENSUS_PUBLIC_CONTRACT_FAMILY).length, 9);
  assert.equal(
    new Set(CONSENSUS_PUBLIC_CONTRACT_DEFINITIONS.map((row) => row.contractId)).size,
    9
  );
  assert.deepEqual(REVIEW_RULING_KIND_VALUES, [
    "decision_row",
    "draft_ticket",
    "split_ticket",
    "deferment",
    "rejected_finding"
  ]);
  assert.deepEqual(CONSENSUS_ROUND_OUTCOME_VALUES, [
    "closed_done",
    "recurse_next_round",
    "escalate_fh"
  ]);
});

test("T-277 PC-003 admits exact public variants and rejects open or duplicate payloads", () => {
  const admitted = admitConsensusSubject({
    kind: "consensus_subject",
    subjectContractRef: "contract://ticket",
    subjectRef: "ticket://T-900",
    subjectDigest: DIGEST_A,
    submittingActorRef: "actor://submitter",
    panelRef: "panel://one",
    roundPolicyRef: "policy://rounds/one",
    workspaceRef: "workspace://one",
    ticketRef: "ticket://T-900",
    ticketDigest: DIGEST_A
  });
  assert.equal(admitted.subjectRef, "ticket://T-900");
  assert.equal(Object.prototype.hasOwnProperty.call(admitted, "fields"), false);

  assert.throws(
    () => admitConsensusSubject({ ...admitted, invented: true }),
    /expected exact keys/u
  );
  assert.throws(
    () => admitConsensusSubject({ ...admitted, ticketDigest: null }),
    /jointly present or absent/u
  );

  const validPanel = {
    kind: "consensus_panel",
    panelRef: "panel://one",
    panelDigest: DIGEST_B,
    profiles: [profile()]
  };
  assert.equal(admitConsensusPanel(validPanel).profiles.length, 1);
  const frozenPanel = admitConsensusPanel(validPanel);
  assert.equal(Object.isFrozen(frozenPanel), true);
  assert.equal(Object.isFrozen(frozenPanel.profiles), true);
  assert.equal(Object.isFrozen(frozenPanel.profiles[0]), true);
  assert.throws(
    () => admitConsensusPanel({
      ...validPanel,
      profiles: [profile(), profile()]
    }),
    /duplicate profile identity/u
  );
});

test("T-277 PC-001 closes cross-projection substitution", () => {
  const admittedFindings = admitReviewFindings(findings());
  const admittedRulings = admitReviewRulings(rulings());
  assert.equal(admittedFindings.kind, "review_findings");
  assert.equal(admittedRulings.kind, "review_rulings");
  assert.throws(() => admitReviewRulings(findings()), /exact keys|Expected "/u);
  assert.throws(() => admitConsensusResult(outcome()), /exact keys|Expected "/u);

  const admittedResult = admitConsensusResult(result());
  const projection = admitTicketConsensusProjection({
    kind: "ticket_consensus_projection",
    projectionRef: "projection://ticket/T-900/consensus",
    projectionDigest: DIGEST_B,
    ticketRef: "ticket://T-900",
    ticketDigest: DIGEST_A,
    result: admittedResult
  });
  assert.equal(projection.result.resultRef, "result://consensus/one");
  assert.throws(
    () => admitTicketConsensusProjection({ ...projection, ticketRef: "ticket://T-901" }),
    /does not match/u
  );
});

test("T-277 PC-003 closes graph-only variants without promoting them", () => {
  const assignment = admitConsensusDomainValue({
    kind: "reviewer_assignment",
    roundRef: "round://one",
    panelRef: "panel://one",
    profileRef: "profile://reviewer/one",
    panelOrdinal: 1,
    instructionContractRef: "contract://instruction/reviewer",
    resultContractRef: "contract://result/findings"
  }, "reviewer_assignment");
  assert.equal(assignment.panelOrdinal, 1);
  assert.throws(
    () => admitConsensusDomainValue({ ...assignment, fields: {} }, "reviewer_assignment"),
    /expected exact keys/u
  );
});

test("T-277 PC-002 derives the only Consensus declaration from the exact T-252 Module", () => {
  const declaration = deriveConsensusModuleDeclaration();
  const outer = ABG_CONSENSUS_GTL_MODULE.graphFunctions.find(
    (graphFunction) => graphFunction.id === declaration.graphFunctionRef
  );
  assert.ok(outer);
  assert.deepEqual(ABG_CONSENSUS_MODULE_DECLARATIONS, [declaration]);
  assert.equal(declaration.entryRef, "gtl://abg/consensus/submitter-reviewer-rounds");
  assert.equal(declaration.ownerRef, "owner://abg/substrate");
  assert.equal(declaration.sourceContractRef, outer.inputs[0].schema.ref);
  assert.equal(declaration.targetContractRef, outer.outputs[0].schema.ref);
  assert.equal(declaration.version, "5.0.0");

  assert.throws(
    () => deriveConsensusModuleDeclaration({
      ...ABG_CONSENSUS_GTL_MODULE,
      graphFunctions: ABG_CONSENSUS_GTL_MODULE.graphFunctions.filter(
        (graphFunction) => graphFunction.id !== declaration.graphFunctionRef
      )
    }),
    /exact admitted T-252 Module/u
  );
});
