import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  CONSENSUS_FP_DISPATCH_PLUGIN_REF,
  CONSENSUS_FP_EVALUATOR_PLUGIN_REF,
  CONSENSUS_REQUEST_SCHEMA_REF,
  CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF,
  standardConsensusFpDispatchPlugin,
  standardConsensusFpEvaluatorPlugin
} from "../../build/semantic/code/src/abg/m03/index.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";

const FAKE_REVIEWER_SCRIPT = String.raw`
const { appendFileSync } = require("node:fs");
const prompt = process.argv[1] ?? "";
const callLogPath = process.argv[2];
appendFileSync(callLogPath, "call\n");
if (prompt.includes("You are the declared submitter")) {
  const decisionText = /Disputed round decision: (\{.*\})/u.exec(prompt)?.[1];
  const decision = JSON.parse(decisionText ?? "{}");
  process.stdout.write(JSON.stringify({
    kind: "consensus_submitter_payload",
    decisionRef: decision.decisionRef,
    summary: "fixture submitter addressed the disputed findings",
    addressedFindingRefs: decision.dissentFindingRefs,
    evidenceRefs: ["evidence://fixture/submitter-response"]
  }));
  process.exit(0);
}
const profile = /Reviewer profile ref: ([^\n]+)/u.exec(prompt)?.[1] ?? "unknown";
const subject = /Subject ref: ([^\n]+)/u.exec(prompt)?.[1] ?? "unknown";
const round = Number.parseInt(/Round: (\d+)/u.exec(prompt)?.[1] ?? "1", 10);

if (round > 1 && !prompt.includes("consensus_submitter_response")) {
  process.stdout.write("missing-prior-submit-response");
  process.exit(0);
}

if (subject.includes("malformed-prose") && profile.includes("claude")) {
  process.stdout.write("not-json");
  process.exit(0);
}

const malformedEvidence = subject.includes("malformed-evidence") && profile.includes("claude");
const malformedRuling = subject.includes("malformed-ruling") && profile.includes("claude");
const unanimousObjection = subject.includes("unanimous-objection");
const rulingOnlyDispute = subject.includes("ruling-only-dispute");
const disputed =
  !rulingOnlyDispute &&
  (subject.includes("dispute") || subject.includes("escalate"));
const objection = unanimousObjection || (disputed && profile.includes("codex"));
const rulingKind =
  unanimousObjection || (rulingOnlyDispute && profile.includes("claude"))
    ? "deferment"
    : "decision_row";
const payload = {
  kind: "consensus_reviewer_payload",
  disposition: objection ? "revise" : "accept",
  findings: rulingOnlyDispute ? [] : [{
    kind: "consensus_reviewer_finding",
    findingRef: "finding://fixture/" + encodeURIComponent(profile) + "/round-" + round,
    claimRef: "claim://fixture/shared",
    findingKind: objection ? "objection" : "support",
    summary: objection ? "fixture objection" : "fixture support",
    evidenceRefs: ["evidence://fixture/" + encodeURIComponent(profile) + "/round-" + round]
  }],
  ruling: malformedRuling
    ? {
        kind: "consensus_ruling_proposal",
        rulingKind,
        summary: "fixture ruling",
        evidenceRefs: ["evidence://fixture/ruling"],
        prose: "undeclared field"
      }
    : {
        kind: "consensus_ruling_proposal",
        rulingKind,
        summary: "fixture ruling",
        evidenceRefs: ["evidence://fixture/ruling"]
      },
  evidenceRefs: malformedEvidence
    ? "evidence://fixture/not-an-array"
    : ["evidence://fixture/response/" + encodeURIComponent(profile)]
};
process.stdout.write(JSON.stringify(payload));
`;

function request(subjectName, maxRounds = 2) {
  const subject = {
    kind: "ticket_review_subject",
    ticketRef: `ticket://fixture/${subjectName}`,
    claimRefs: ["claim://fixture/shared"]
  };
  return {
    kind: "consensus_request",
    requestRef: `consensus-request://fixture/${subjectName}`,
    subjectRef: `subject://fixture/${subjectName}`,
    subject,
    subjectDigest: stableSha256Digest(subject),
    submitterRef: "actor://fixture/submitter",
    submitterWorkerRef: "worker://fixture/submitter",
    panelRef: "panel://fixture/codex-claude",
    policyRef: "policy://fixture/consensus",
    roundIndex: 1,
    maxRounds,
    reviewerProfiles: [
      {
        kind: "consensus_reviewer_profile",
        profileRef: "reviewer-profile://fixture/codex",
        profileConfigDigest: `sha256:${"a".repeat(64)}`,
        workerRef: "worker://fixture/codex",
        resultSchemaRef: CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF
      },
      {
        kind: "consensus_reviewer_profile",
        profileRef: "reviewer-profile://fixture/claude",
        profileConfigDigest: `sha256:${"b".repeat(64)}`,
        workerRef: "worker://fixture/claude",
        resultSchemaRef: CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF
      }
    ]
  };
}

function pluginInput(requestValue, attemptIndex = 1) {
  return {
    cCallRef: "c-call://fixture/consensus",
    graphCallId: "graph-call://fixture/consensus",
    frameId: "frame://fixture/consensus",
    basisId: "basis://fixture/consensus",
    graphFunctionId: "graph-function://abg/consensus/submitter-reviewer-rounds",
    sourceProjectionRef: `projection://fixture/consensus/attempt-${String(attemptIndex)}`,
    vectorIndex: 0,
    edge: "consensus_round",
    expectedEdge: "consensus_round",
    expectedAssessmentIds: [],
    actorInvocationRef: {
      actorInvocationId: `actor-invocation://fixture/consensus/${String(attemptIndex)}`,
      attemptIndex,
      dispatchRef: `dispatch://fixture/consensus/${String(attemptIndex)}`,
      resultRef: null
    },
    retryAttemptRefs: Array.from({ length: attemptIndex - 1 }, (_, offset) => {
      const priorIndex = offset + 1;
      return {
      vectorIndex: 0,
      attemptIndex: priorIndex,
      sourceProjectionRef: `projection://fixture/consensus/attempt-${String(priorIndex)}`
      };
    }),
    priorAttemptResultArtifacts: [],
    inputAssetBindings: [{
      assetRef: "asset://fixture/consensus-request",
      assetType: CONSENSUS_REQUEST_SCHEMA_REF,
      uri: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(requestValue))}`
    }],
    instructionPromptManifest: {
      renderedPrompt: "Review the declared subject."
    },
    selectedRegimeBindingRef: "regime-binding://fixture/consensus",
    selectedCompositionRef: "abg.fn_composition://fixture/consensus",
    selectedCompositionDigest: `sha256:${"d".repeat(64)}`
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "abg-consensus-plugin-"));
  const callLogPath = path.join(root, "transport-calls.log");
  const capability = {
    agentContract: {
      agentKey: "generic",
      command: process.execPath,
      argsTemplate: ["-e", FAKE_REVIEWER_SCRIPT, "{prompt}", callLogPath],
      sanitizedEnvironmentPolicy: { prefixes: [] }
    },
    archiveRoot: root,
    cwd: process.cwd(),
    timeoutMs: 10_000,
    executorProfile: "local-spawn"
  };
  return {
    dispatch: standardConsensusFpDispatchPlugin(capability),
    evaluator: standardConsensusFpEvaluatorPlugin(),
    async transportCallCount() {
      try {
        const text = await readFile(callLogPath, "utf8");
        return text.split("\n").filter((line) => line.length > 0).length;
      } catch (error) {
        if (error !== null && typeof error === "object" && error.code === "ENOENT") {
          return 0;
        }
        throw error;
      }
    },
    async cleanup() {
      await rm(root, { recursive: true, force: true });
    }
  };
}

function consensusArtifact(outcome) {
  assert.equal(outcome.attachedResultArtifact.edge, "consensus_round");
  assert.equal(outcome.attachedResultArtifact.actor, "worker://abg/consensus-panel");
  assert.equal(
    outcome.attachedResultArtifact.fulfillment_assessments[0].id,
    "consensus_round_admitted"
  );
  return outcome.attachedResultArtifact.consensus_result;
}

function priorAttemptArtifact(outcome, attemptIndex = 1) {
  const body = outcome.attachedResultArtifact;
  return {
    kind: "engine_prior_attempt_result_artifact",
    actorInvocationId: `actor-invocation://fixture/consensus/${String(attemptIndex)}`,
    attemptIndex,
    resultRef: `result://fixture/consensus/${String(attemptIndex)}`,
    artifactRef: `artifact://fixture/consensus/${String(attemptIndex)}`,
    artifactDigest: stableSha256Digest(body),
    body
  };
}

test("A5 Consensus plugin admits one unanimous support round in the standard artifact wrapper", async () => {
  const subject = request("converge");
  const runtime = await fixture();
  try {
    const input = pluginInput(subject);
    const outcome = await runtime.dispatch.dispatch(input);
    assert.equal(runtime.dispatch.contract.ref, CONSENSUS_FP_DISPATCH_PLUGIN_REF);
    assert.equal(outcome.status, "dispatched", outcome.reason);
    const artifact = consensusArtifact(outcome);
    assert.equal(artifact.finalOutcome, "closed_done");
    assert.equal(artifact.rulingKind, "decision_row");
    assert.equal(artifact.rounds.length, 1);
    assert.deepEqual(
      artifact.rounds[0].decision.reviewerProfileRefs,
      subject.reviewerProfiles.map((profile) => profile.profileRef)
    );
    assert.equal(await runtime.transportCallCount(), subject.reviewerProfiles.length);
    assert.equal(artifact.rounds[0].submitterResponse, null);

    const evaluation = runtime.evaluator.evaluate({
      ...input,
      attachedResultArtifact: outcome.attachedResultArtifact
    });
    assert.equal(runtime.evaluator.contract.ref, CONSENSUS_FP_EVALUATOR_PLUGIN_REF);
    assert.equal(evaluation.status, "evaluated");
    assert.equal(evaluation.findings[0].closeDisposition, "close");
    assert.equal(evaluation.findings[0].executiveDisposition, "close_candidate");
  } finally {
    await runtime.cleanup();
  }
});

test("A5 Consensus plugin retries an unadmitted worker attempt in the same semantic round", async () => {
  const subject = request("converge-after-malformed-attempt");
  const runtime = await fixture();
  try {
    const outcome = await runtime.dispatch.dispatch(pluginInput(subject, 2));
    assert.equal(outcome.status, "dispatched", outcome.reason);
    const artifact = consensusArtifact(outcome);
    assert.equal(artifact.finalOutcome, "closed_done");
    assert.equal(artifact.rounds[0].request.roundIndex, 1);
    assert.deepEqual(artifact.priorRoundRefs, []);
  } finally {
    await runtime.cleanup();
  }
});

test("A5 Consensus plugin returns one disputed round for engine-owned retry", async () => {
  const subject = request("dispute");
  const runtime = await fixture();
  try {
    const input = pluginInput(subject);
    const outcome = await runtime.dispatch.dispatch(input);
    assert.equal(outcome.status, "dispatched", outcome.reason);
    const artifact = consensusArtifact(outcome);
    assert.equal(artifact.finalOutcome, "recurse_next_round");
    assert.equal(artifact.rounds.length, 1);
    assert.equal(artifact.rounds[0].request.roundIndex, 1);
    assert.equal(
      await runtime.transportCallCount(),
      subject.reviewerProfiles.length + 1
    );
    assert.notEqual(artifact.rounds[0].submitterResponse, null);
    assert.deepEqual(
      artifact.rounds[0].submitterResponse.addressedFindingRefs.slice().sort(),
      artifact.rounds[0].decision.dissentFindingRefs.slice().sort()
    );

    const evaluation = runtime.evaluator.evaluate({
      ...input,
      attachedResultArtifact: outcome.attachedResultArtifact
    });
    assert.equal(evaluation.status, "evaluated");
    assert.equal(evaluation.findings[0].closeDisposition, "retry");
    assert.equal(evaluation.findings[0].executiveDisposition, "local_repair");
  } finally {
    await runtime.cleanup();
  }
});

test("A5 Consensus plugin admits a submitter response for a ruling-only dispute", async () => {
  const subject = request("ruling-only-dispute");
  const runtime = await fixture();
  try {
    const outcome = await runtime.dispatch.dispatch(pluginInput(subject));
    assert.equal(outcome.status, "dispatched", outcome.reason);
    const artifact = consensusArtifact(outcome);
    assert.equal(artifact.finalOutcome, "recurse_next_round");
    assert.deepEqual(artifact.rounds[0].decision.dissentFindingRefs, []);
    assert.deepEqual(
      artifact.rounds[0].submitterResponse.addressedFindingRefs,
      []
    );
  } finally {
    await runtime.cleanup();
  }
});

test("A5 Consensus plugin escalates dissent on the declared final engine attempt", async () => {
  const subject = request("escalate", 2);
  const runtime = await fixture();
  try {
    const firstInput = pluginInput(subject, 1);
    const firstOutcome = await runtime.dispatch.dispatch(firstInput);
    assert.equal(firstOutcome.status, "dispatched", firstOutcome.reason);
    const firstArtifact = consensusArtifact(firstOutcome);
    assert.equal(firstArtifact.finalOutcome, "recurse_next_round");
    assert.notEqual(firstArtifact.rounds[0].submitterResponse, null);
    const input = {
      ...pluginInput(subject, 2),
      priorAttemptResultArtifacts: [priorAttemptArtifact(firstOutcome)]
    };
    const outcome = await runtime.dispatch.dispatch(input);
    assert.equal(outcome.status, "dispatched", outcome.reason);
    const artifact = consensusArtifact(outcome);
    assert.equal(artifact.finalOutcome, "escalate_fh");
    assert.equal(artifact.rounds.length, 1);
    assert.equal(artifact.rounds[0].request.roundIndex, 2);
    assert.deepEqual(artifact.priorRoundRefs, [
      firstArtifact.resultDigest
    ]);
    assert.equal(
      await runtime.transportCallCount(),
      subject.reviewerProfiles.length * 2 + 1
    );

    const evaluation = runtime.evaluator.evaluate({
      ...input,
      attachedResultArtifact: outcome.attachedResultArtifact
    });
    assert.equal(evaluation.status, "evaluated");
    assert.equal(
      evaluation.findings[0].closeDisposition,
      "human_gate_required"
    );
    assert.equal(evaluation.findings[0].executiveDisposition, "block");
  } finally {
    await runtime.cleanup();
  }
});

test("A5 Consensus plugin rejects contradictory prior round content even with a recomputed outer digest", async () => {
  const subject = request("dispute");
  const runtime = await fixture();
  try {
    const firstOutcome = await runtime.dispatch.dispatch(pluginInput(subject, 1));
    assert.equal(firstOutcome.status, "dispatched", firstOutcome.reason);
    const prior = priorAttemptArtifact(firstOutcome);
    const result = prior.body.consensus_result;
    const tamperedBasis = {
      ...result,
      rounds: [{
        ...result.rounds[0],
        request: {
          ...result.rounds[0].request,
          subjectRef: "subject://fixture/tampered"
        }
      }]
    };
    delete tamperedBasis.resultDigest;
    const tamperedResult = {
      ...tamperedBasis,
      resultDigest: stableSha256Digest(tamperedBasis)
    };
    const outcome = await runtime.dispatch.dispatch({
      ...pluginInput(subject, 2),
      priorAttemptResultArtifacts: [{
        ...prior,
        body: { ...prior.body, consensus_result: tamperedResult }
      }]
    });
    assert.equal(outcome.status, "blocked");
    assert.match(outcome.reason, /continuation foldback admission failed/u);
    assert.equal(outcome.attachedResultArtifact, null);
  } finally {
    await runtime.cleanup();
  }
});

test("A5 Consensus plugin closes an agreed objection with the declared ruling", async () => {
  const subject = request("unanimous-objection");
  const runtime = await fixture();
  try {
    const outcome = await runtime.dispatch.dispatch(pluginInput(subject));
    assert.equal(outcome.status, "dispatched", outcome.reason);
    const artifact = consensusArtifact(outcome);
    assert.equal(artifact.finalOutcome, "closed_done");
    assert.equal(artifact.rulingKind, "deferment");
    assert.equal(artifact.rounds[0].decision.dissentFindingRefs.length, 0);
    assert.equal(await runtime.transportCallCount(), subject.reviewerProfiles.length);
  } finally {
    await runtime.cleanup();
  }
});

for (const malformedSubject of [
  "malformed-evidence",
  "malformed-ruling",
  "malformed-prose"
]) {
  test(`A5 Consensus plugin blocks ${malformedSubject} reviewer output as contract failure`, async () => {
    const subject = request(malformedSubject);
    const runtime = await fixture();
    try {
      const outcome = await runtime.dispatch.dispatch(pluginInput(subject));
      assert.equal(outcome.status, "blocked");
      assert.match(outcome.reason, /contract_failure/u);
      assert.equal(outcome.attachedResultArtifact, null);
      assert.equal(await runtime.transportCallCount(), subject.reviewerProfiles.length);
    } finally {
      await runtime.cleanup();
    }
  });
}
