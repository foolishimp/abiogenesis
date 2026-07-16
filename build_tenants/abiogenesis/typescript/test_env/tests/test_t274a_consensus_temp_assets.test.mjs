import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { TextDecoder } from "node:util";

import Ajv from "ajv";
import { Ajv2020 } from "ajv/dist/2020.js";

import {
  CONSENSUS_ROUND_OUTCOME_VALUES,
  REVIEW_RULING_KIND_VALUES,
  admitConsensusPublicContract
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import {
  deriveConsensusPhaseAArtifactSet
} from "../../build/semantic/code/src/app/m04/public_contracts/consensus_contract_phase_a.js";
import {
  sha256DigestForBytes,
  stableJson
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const TENANT_ROOT = path.resolve(import.meta.dirname, "../..");
const DIGEST_A = `sha256:${"a".repeat(64)}`;
const DIGEST_B = `sha256:${"b".repeat(64)}`;

function reviewerProfile() {
  return {
    kind: "consensus_reviewer_profile",
    profileRef: "profile://reviewer/one",
    roleContractRef: "role://reviewer",
    configurationDigest: DIGEST_A,
    instructionContractRef: "contract://instruction/reviewer",
    resultContractRef: "contract://result/findings",
    capabilityRefs: ["capability://review"]
  };
}

function reviewRulings() {
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

function roundOutcome() {
  return {
    kind: "consensus_round_outcome",
    roundRef: "round://one",
    outcome: "closed_done",
    findingSetRefs: ["findings://one"],
    rulingRefs: ["ruling://one"],
    evidenceRefs: ["evidence://round/one"]
  };
}

function consensusResult() {
  return {
    kind: "consensus_result",
    subjectRef: "ticket://T-274A",
    subjectDigest: DIGEST_A,
    panelRef: "panel://one",
    policyRef: "policy://rounds/one",
    roundRefs: ["round://one"],
    findingSetRefs: ["findings://one"],
    rulings: reviewRulings(),
    classification: "unanimous_agreement",
    dissentProfileRefs: [],
    terminalOutcome: roundOutcome(),
    evidenceRefs: ["evidence://round/one"],
    lineageRefs: ["lineage://consensus/one"],
    resultRef: "result://consensus/one",
    replayRef: "replay://consensus/one",
    contractFailureRef: null
  };
}

const FIXTURES = Object.freeze({
  consensus_subject: Object.freeze({
    kind: "consensus_subject",
    subjectContractRef: "contract://ticket",
    subjectRef: "ticket://T-274A",
    subjectDigest: DIGEST_A,
    submittingActorRef: "actor://submitter",
    panelRef: "panel://one",
    roundPolicyRef: "policy://rounds/one",
    workspaceRef: "workspace://one",
    ticketRef: "ticket://T-274A",
    ticketDigest: DIGEST_A
  }),
  consensus_panel: Object.freeze({
    kind: "consensus_panel",
    panelRef: "panel://one",
    panelDigest: DIGEST_B,
    profiles: [reviewerProfile()]
  }),
  consensus_reviewer_profile: Object.freeze(reviewerProfile()),
  review_findings: Object.freeze({
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
  }),
  review_rulings: Object.freeze(reviewRulings()),
  consensus_round_policy: Object.freeze({
    kind: "consensus_round_policy",
    policyRef: "policy://rounds/one",
    policyDigest: DIGEST_A,
    roundBudget: 3,
    convergenceRuleRef: "rule://consensus/converge",
    disagreementRuleRef: "rule://consensus/disagree",
    escalationRuleRef: "rule://consensus/escalate",
    foldbackContractRef: "contract://consensus/foldback"
  }),
  consensus_round_outcome: Object.freeze(roundOutcome()),
  consensus_result: Object.freeze(consensusResult()),
  ticket_consensus_projection: Object.freeze({
    kind: "ticket_consensus_projection",
    projectionRef: "projection://ticket/T-274A/consensus",
    projectionDigest: DIGEST_B,
    ticketRef: "ticket://T-274A",
    ticketDigest: DIGEST_A,
    result: consensusResult()
  })
});

function parseArtifact(asset) {
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(asset.bytes));
}

test("T-274A derives nine schemas and two vocabularies as exact repeatable bytes", () => {
  const first = deriveConsensusPhaseAArtifactSet();
  const second = deriveConsensusPhaseAArtifactSet();

  assert.equal(first.schemaAssets.length, 9);
  assert.equal(first.vocabularyAssets.length, 2);
  assert.equal(first.artifactSetDigest, second.artifactSetDigest);
  assert.equal(Object.isFrozen(first.schemaAssets), true);
  assert.equal(Object.isFrozen(first.vocabularyAssets), true);

  const allFirst = [...first.schemaAssets, ...first.vocabularyAssets];
  const allSecond = [...second.schemaAssets, ...second.vocabularyAssets];
  assert.equal(new Set(allFirst.map(({ relativePath }) => relativePath)).size, 11);
  assert.equal(
    new Set(allFirst.map((asset) => asset.contractId ?? asset.vocabularyId)).size,
    11
  );
  for (const [index, asset] of allFirst.entries()) {
    const repeated = allSecond[index];
    assert.equal(repeated.relativePath, asset.relativePath);
    assert.deepEqual(repeated.bytes, asset.bytes);
    assert.equal(asset.digest, sha256DigestForBytes(asset.bytes));
  }
  for (const asset of first.schemaAssets) {
    assert.equal(asset.digest, asset.projectionWitness.projectionDigest);
    assert.equal(asset.coordinate.schemaDigest, asset.digest);
    assert.equal(asset.coordinate.contractDigest, asset.digest);
    assert.equal(parseArtifact(asset).$id, asset.contractId);
  }
});

test("T-274A materializes only temp assets and reads back exact bytes", async () => {
  const artifactSet = deriveConsensusPhaseAArtifactSet();
  const artifacts = [
    ...artifactSet.schemaAssets,
    ...artifactSet.vocabularyAssets
  ];
  for (const asset of artifacts) {
    await assert.rejects(
      access(path.join(TENANT_ROOT, asset.relativePath)),
      { code: "ENOENT" }
    );
  }

  const tempRoot = await mkdtemp(path.join(tmpdir(), "abg-t274a-"));
  try {
    for (const asset of artifacts) {
      const target = path.join(tempRoot, asset.relativePath);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, asset.bytes, { flag: "wx" });
      assert.deepEqual(await readFile(target), Buffer.from(asset.bytes));
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("T-274A derives both closed vocabularies from their native rosters", async () => {
  const artifactSet = deriveConsensusPhaseAArtifactSet();
  const byId = new Map(
    artifactSet.vocabularyAssets.map((asset) => [asset.vocabularyId, asset])
  );
  const expected = new Map([
    ["abg.vocabulary.review-ruling-kind", {
      sourceExport: "REVIEW_RULING_KIND_VALUES",
      values: REVIEW_RULING_KIND_VALUES
    }],
    ["abg.vocabulary.consensus-round-outcome", {
      sourceExport: "CONSENSUS_ROUND_OUTCOME_VALUES",
      values: CONSENSUS_ROUND_OUTCOME_VALUES
    }]
  ]);
  const vocabularySchema = JSON.parse(
    await readFile(
      path.join(TENANT_ROOT, "contracts/schemas/closed-vocabulary.schema.json"),
      "utf8"
    )
  );
  const validate = new Ajv({ strict: false }).compile(vocabularySchema);

  for (const [vocabularyId, basis] of expected) {
    const artifact = byId.get(vocabularyId);
    assert.ok(artifact);
    assert.equal(artifact.sourceExport, basis.sourceExport);
    assert.deepEqual(artifact.values, basis.values);
    const projected = parseArtifact(artifact);
    assert.equal(validate(projected), true, JSON.stringify(validate.errors));
    assert.equal(projected.vocabularyId, vocabularyId);
    assert.deepEqual(projected.values, basis.values);
  }
});

test("T-274A proves native and projected admission for the complete 9x9 matrix", () => {
  const artifactSet = deriveConsensusPhaseAArtifactSet();
  const validators = new Map(
    artifactSet.schemaAssets.map((asset) => [
      asset.contractKind,
      new Ajv2020({ strict: false }).compile(parseArtifact(asset))
    ])
  );
  let rejectedSubstitutions = 0;

  for (const [expectedKind, validate] of validators) {
    for (const [candidateKind, candidate] of Object.entries(FIXTURES)) {
      const shouldAdmit = candidateKind === expectedKind;
      assert.equal(
        validate(candidate),
        shouldAdmit,
        `${candidateKind} -> ${expectedKind}: ${stableJson(validate.errors)}`
      );
      if (shouldAdmit) {
        assert.doesNotThrow(() =>
          admitConsensusPublicContract(candidate, expectedKind)
        );
      } else {
        assert.throws(() =>
          admitConsensusPublicContract(candidate, expectedKind)
        );
        rejectedSubstitutions += 1;
      }
    }
  }
  assert.equal(rejectedSubstitutions, 72);
});
