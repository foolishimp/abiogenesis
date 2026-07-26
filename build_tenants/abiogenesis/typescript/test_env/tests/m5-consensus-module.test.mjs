import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFile,
  mkdtemp,
  readFile,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import * as abg from "../../build/code/src/abg/index.js";
import { ROOT_EVENT_CONTRACT_DIGEST } from "../../build/code/src/abg/event_store.js";
import * as gtl from "../../build/code/src/gtl/index.js";
import {
  realizeConsensusReviewer,
  realizeConsensusSubmitter,
  realizeConsensusSubmitterTaskPreparation,
} from "../../build/code/src/implementation/consensus.js";
import { ABI5_SYSTEM_PRODUCT_SEMANTICS } from "../../build/code/src/product/builtin_semantics.js";
import * as product from "../../build/code/src/product/index.js";
import { ROOT_PUBLIC_OPERATION_IDS } from "../../build/code/src/public/index.js";
import {
  constructPublicRunProjectionAuthority,
  parsePublicRunProjectionAuthority,
} from "../../build/code/src/public/run_projection_authority.js";

const packageRoot = resolve(new URL("../..", import.meta.url).pathname);
const DIGEST = `sha256:${"1".repeat(64)}`;
const WORKSPACE = "workspace://developer/consensus/module-proof";
const ACTOR = "actor://developer/consensus/module-proof";

function artifactBasis() {
  return {
    productId: "product://abiogenesis/typescript-tenant@5.0.0-dev.286",
    artifactDigest: DIGEST,
    productContentDigest: DIGEST,
    productManifestDigest: DIGEST,
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
  };
}

function canonicalPolicy() {
  return gtl.constructConsensusRoundPolicy({
    policyRef: "policy://developer/consensus/module-proof@1",
    roundBudget: 2,
    convergenceRuleRef: gtl.CONSENSUS_IDS.convergenceRuleRef,
    disagreementRuleRef: gtl.CONSENSUS_IDS.disagreementRuleRef,
    escalationRuleRef: gtl.CONSENSUS_IDS.escalationRuleRef,
    foldbackContractRef: gtl.CONSENSUS_IDS.foldbackContractRef,
  });
}

function invocationFor(workspaceRef = WORKSPACE) {
  const subjectMaterialization =
    gtl.constructConsensusSubjectMaterialization({
      subjectContractRef: "contract://stdo/ticket@2",
      subjectRef: "ticket://abiogenesis/T-276",
      content: "# T-276\n\nExact module-proof Consensus subject.\n",
    });
  const instructions = ["author", "independent"].map((name) =>
    gtl.constructConsensusReviewerInstruction({
      instructionContractRef:
        `contract://developer/consensus/reviewer-instruction/${name}@1`,
      roleContractRef: `contract://developer/reviewer-role/${name}@1`,
      instructionText:
        `Review the exact materialized ticket as the ${name} profile.`,
      responseSchema: gtl.CONSENSUS_REVIEWER_RESPONSE_SCHEMA,
    })
  );
  const profiles = instructions.map((instruction, index) => {
    const name = ["author", "independent"][index];
    return (
    gtl.constructConsensusReviewerProfile({
      profileRef: `reviewer-profile://developer/${name}`,
      roleContractRef: instruction.roleContractRef,
      instructionContractRef: instruction.instructionContractRef,
      instructionDigest: instruction.instructionDigest,
      resultContractRef: gtl.CONSENSUS_IDS.findingsContractRef,
      capabilityRefs: [`capability://developer/reviewer/${name}`],
      actorRef: `actor://developer/reviewer/${name}`,
      workerBindingRef: `worker-binding://developer/reviewer/${name}`,
    })
    );
  });
  const panel = gtl.constructConsensusPanel(
    "panel://developer/consensus/module-proof",
    profiles,
  );
  const submitterInstruction = gtl.constructConsensusSubmitterInstruction({
    instructionContractRef:
      "contract://developer/consensus/submitter-instruction@1",
    roleContractRef: "contract://developer/submitter-role@1",
    instructionText:
      "Respond to every exact admitted reviewer finding for this round.",
    responseSchema: gtl.CONSENSUS_SUBMITTER_RESPONSE_SCHEMA,
  });
  const submitterProfile = gtl.constructConsensusSubmitterProfile({
    profileRef: "submitter-profile://developer/author",
    roleContractRef: submitterInstruction.roleContractRef,
    instructionContractRef: submitterInstruction.instructionContractRef,
    instructionDigest: submitterInstruction.instructionDigest,
    resultContractRef: gtl.CONSENSUS_IDS.submitterResponseContractRef,
    capabilityRefs: ["capability://developer/submitter/respond"],
    actorRef: ACTOR,
    workerBindingRef: "worker-binding://developer/submitter/author",
  });
  const policy = canonicalPolicy();
  const subject = gtl.constructConsensusSubject({
    subjectContractRef: "contract://stdo/ticket@2",
    subjectRef: "ticket://abiogenesis/T-276",
    subjectDigest: subjectMaterialization.contentDigest,
    submittingActorRef: ACTOR,
    panelRef: panel.panelRef,
    roundPolicyRef: policy.policyRef,
    workspaceRef,
    ticketRef: "ticket://abiogenesis/T-276",
    ticketDigest: subjectMaterialization.contentDigest,
  });
  return gtl.constructConsensusInvocation({
    invocationRef: "consensus-invocation://developer/module-proof",
    subject,
    subjectMaterialization,
    panel,
    instructions,
    submitterProfile,
    submitterInstruction,
    policy,
    transportLane: "closed_prompt_proof",
  });
}

function unresolvedCandidate(
  resultRef = "consensus-result://developer/unresolved",
) {
  return {
    kind: "consensus_result",
    schemaVersion: "5.0.0",
    subjectRef: "ticket://abiogenesis/T-276",
    subjectDigest: DIGEST,
    panelRef: "panel://developer/consensus/module-proof",
    policyRef: "policy://developer/consensus/module-proof@1",
    roundRefs: ["consensus-round://developer/1"],
    findingSetRefs: ["review-findings://developer/1"],
    submitterResponseRefs: ["submitter-response://developer/1"],
    rulings: [],
    classification: "unresolved_disagreement",
    dissentProfileRefs: ["reviewer-profile://developer/independent"],
    terminalOutcome: {
      kind: "consensus_round_outcome",
      schemaVersion: "5.0.0",
      roundRef: "consensus-round://developer/1",
      outcome: "escalate_fh",
      findingSetRefs: ["review-findings://developer/1"],
      rulingRefs: [],
      evidenceRefs: ["evidence://developer/1"],
    },
    evidenceRefs: ["evidence://developer/1"],
    lineageRefs: ["consensus-round://developer/1"],
    resultRef,
    contractFailureRef: null,
  };
}

function unresolvedResult(
  resultRef = "consensus-result://developer/unresolved",
) {
  return gtl.bindConsensusReplay(
    unresolvedCandidate(resultRef),
    `replay://abiogenesis/${resultRef.split("/").at(-1)}`,
  );
}

function escalationDecision(result, humanActorRef = ACTOR) {
  return {
    kind: "consensus_escalation_decision",
    schemaVersion: "5.0.0",
    unresolvedResult: result,
    unresolvedResultRef: result.resultRef,
    unresolvedResultDigest: product.sha256Canonical(result),
    decision: "accept_with_dissent",
    humanActorRef,
    rationaleRef: "rationale://developer/consensus/module-proof",
  };
}

function reviewerCandidate(recommendation = "accept") {
  const revise = recommendation === "revise";
  return {
    kind: "consensus_reviewer_candidate",
    schemaVersion: "5.0.0",
    recommendation,
    findings: revise
      ? [{
          findingContractRef:
            "contract://abg/consensus/material-dispute@5",
          findingPayloadRef:
            "finding-payload://developer/consensus/module-proof",
        }]
      : [],
    residualRefs: revise
      ? ["residual://developer/consensus/module-proof"]
      : [],
  };
}

function submitterCandidate(
  disposition = "acknowledge",
  findingRefs = [],
) {
  return {
    kind: "consensus_submitter_response_candidate",
    schemaVersion: "5.0.0",
    disposition,
    responseText: disposition === "acknowledge"
      ? "No admitted semantic findings require a response."
      : "The exact admitted findings have been addressed.",
    addressedFindingRefs:
      disposition === "address_findings" ? [...findingRefs] : [],
    residualFindingRefs:
      disposition === "dispute_findings" ? [...findingRefs] : [],
  };
}

function workerObservation(finalOutput, suffix) {
  return {
    actorInvocationRef:
      `actor-invocation://developer/module-proof/${suffix}`,
    transportBindingRef:
      `transport-binding://developer/module-proof/${suffix}`,
    transportBindingDigest: DIGEST,
    disposition: "success",
    failureClass: null,
    finalOutput,
    promptDigest: DIGEST,
    transportDigest: DIGEST,
    transportLane: "closed_prompt_proof",
    processStatus: 0,
    processSignal: null,
    timedOut: false,
    exitObserved: true,
    terminationConfirmed: true,
    progressEventCount: 0,
    toolCallCount: 0,
    artifactDigests: {
      output: DIGEST,
      prompt: DIGEST,
      stderr: DIGEST,
      stdout: DIGEST,
      transport: DIGEST,
    },
  };
}

async function findingsVectorFor(state, recommendation = "revise") {
  const members = await Promise.all(
    state.members.map(async (member, ordinal) => {
      const realized = await realizeConsensusReviewer(member.value, {
        async invokeWorker() {
          return workerObservation(
            JSON.stringify(reviewerCandidate(recommendation)),
            `reviewer-${state.roundOrdinal}-${ordinal}`,
          );
        },
      });
      assert.equal(realized.disposition, "success");
      assert.equal(gtl.isReviewFindings(realized.resultCandidate), true);
      return {
        ordinal,
        inputMemberRef: member.memberRef,
        outputMemberRef:
          `member://developer/module-proof/round-${state.roundOrdinal}/output-${ordinal}`,
        value: realized.resultCandidate,
      };
    }),
  );
  return {
    kind: "gtl_fan_out_vector",
    schemaVersion: "5.0.0",
    applicationRef: gtl.CONSENSUS_IDS.roundApplicationRef,
    members,
  };
}

async function responseFor(vector, disposition = "address_findings") {
  const prepared = realizeConsensusSubmitterTaskPreparation(vector);
  assert.equal(prepared.disposition, "success");
  const findingRefs = vector.members.flatMap((member) =>
    member.value.findings.map((finding) => finding.findingRef)
  );
  const realized = await realizeConsensusSubmitter(
    prepared.resultCandidate,
    {
      async invokeWorker() {
        return workerObservation(
          JSON.stringify(submitterCandidate(disposition, findingRefs)),
          `submitter-${prepared.resultCandidate.roundOrdinal}`,
        );
      },
    },
  );
  assert.equal(realized.disposition, "success");
  assert.equal(
    gtl.isConsensusSubmitterResponse(realized.resultCandidate),
    true,
  );
  return realized.resultCandidate;
}

function rehashSubmitterResponse(response) {
  const value = structuredClone(response);
  const {
    kind: _kind,
    schemaVersion: _schemaVersion,
    configurationDigest: _configurationDigest,
    task: _task,
    responseRef: _responseRef,
    outputDigest: _outputDigest,
    ...body
  } = value;
  value.outputDigest = product.sha256Canonical(body);
  value.responseRef =
    `submitter-response://abg/${value.outputDigest.slice("sha256:".length)}`;
  return value;
}

test("S05 module publishes the exact Consensus contracts, vocabularies, and ordinary GTL callable", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, "product-toolchain-manifest.json"), "utf8"),
  );
  const rows = new Map(
    manifest.publicContractCatalog.rows.map((row) => [row.contractId, row]),
  );
  const schemaBindings = new Map([
    ["abg.schema.consensus-subject", ["ConsensusSubject", "isConsensusSubject"]],
    ["abg.schema.consensus-panel", ["ConsensusPanel", "isConsensusPanel"]],
    [
      "abg.schema.consensus-reviewer-profile",
      ["ConsensusReviewerProfile", "isConsensusReviewerProfile"],
    ],
    [
      "abg.schema.consensus-submitter-profile",
      ["ConsensusSubmitterProfile", "isConsensusSubmitterProfile"],
    ],
    [
      "abg.schema.consensus-submitter-response",
      ["ConsensusSubmitterResponse", "isConsensusSubmitterResponse"],
    ],
    ["abg.schema.review-findings", ["ReviewFindings", "isReviewFindings"]],
    ["abg.schema.review-rulings", ["ReviewRulings", "isReviewRulings"]],
    [
      "abg.schema.consensus-round-policy",
      ["ConsensusRoundPolicy", "isConsensusRoundPolicy"],
    ],
    [
      "abg.schema.consensus-round-outcome",
      ["ConsensusRoundOutcome", "isConsensusRoundOutcome"],
    ],
    ["abg.schema.consensus-result", ["ConsensusResult", "isConsensusResult"]],
    [
      "abg.schema.ticket-consensus-projection",
      ["TicketConsensusProjection", "isTicketConsensusProjection"],
    ],
  ]);
  for (const [contractId, [definitionName, nativeSymbol]] of schemaBindings) {
    const row = rows.get(contractId);
    assert.ok(row, contractId);
    assert.equal(row.contractKind, "schema_asset");
    assert.equal(row.assetLocator.mediaType, "application/schema+json");
    assert.equal(
      row.assetLocator.definitionRef,
      `#/$defs/${definitionName}`,
    );
    const bytes = await readFile(
      resolve(packageRoot, row.assetLocator.path),
    );
    assert.equal(
      row.contractDigest,
      `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    );
    const schema = JSON.parse(bytes);
    assert.ok(schema.$defs[definitionName], contractId);
    assert.equal(typeof gtl[nativeSymbol], "function");
  }

  const vocabularyBindings = new Map([
    [
      "abg.vocabulary.review-ruling-kind",
      gtl.REVIEW_RULING_KIND_VALUES,
    ],
    [
      "abg.vocabulary.consensus-round-outcome",
      gtl.CONSENSUS_ROUND_OUTCOME_VALUES,
    ],
  ]);
  for (const [contractId, nativeValues] of vocabularyBindings) {
    const row = rows.get(contractId);
    assert.ok(row, contractId);
    assert.equal(row.contractKind, "vocabulary_asset");
    assert.equal(row.assetLocator.mediaType, "application/json");
    const bytes = await readFile(
      resolve(packageRoot, row.assetLocator.path),
    );
    assert.equal(
      row.contractDigest,
      `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    );
    const vocabulary = JSON.parse(bytes);
    assert.deepEqual(vocabulary.values, [...nativeValues]);
  }

  const publication = gtl.constructConsensusModulePublication(artifactBasis());
  const contribution = publication.contributions.find(
    (row) => row.handle === gtl.CONSENSUS_IDS.handle,
  );
  assert.equal(contribution.kind, "graph_function");
  assert.equal(
    contribution.declarationOrContractRef,
    gtl.CONSENSUS_IDS.graphFunctionRef,
  );
  assert.ok(
    publication.graphFunctions.some(
      (graphFunction) =>
        graphFunction.name === gtl.CONSENSUS_IDS.submitterGraphFunctionRef,
    ),
    "the canonical submitter GraphFunction must be published",
  );
  const submitterContribution = publication.contributions.find(
    (row) =>
      row.declarationOrContractRef ===
        gtl.CONSENSUS_IDS.submitterGraphFunctionRef,
  );
  assert.deepEqual(
    submitterContribution?.programMembershipRefs,
    [gtl.CONSENSUS_IDS.oneSurfaceProgramRef],
  );
  assert.equal(
    publication.programs.find(
      (program) =>
        program.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
    )?.callableMembership.includes(
      gtl.CONSENSUS_IDS.submitterGraphFunctionRef,
    ),
    true,
  );
  assert.equal(
    JSON.stringify(publication).match(/compiled|lowered/gu),
    null,
  );
  assert.equal(
    ROOT_PUBLIC_OPERATION_IDS.some((operationId) =>
      operationId.includes("consensus")
    ),
    false,
  );
  assert.equal(
    abg.ROOT_EVENT_KIND_VALUES.some((eventKind) =>
      eventKind.includes("consensus")
    ),
    false,
  );
});

test("S05 serialized Consensus schema is one exact projection of native Product meaning", async () => {
  const schema = JSON.parse(
    await readFile(
      resolve(packageRoot, "contracts/schemas/consensus.schema.json"),
      "utf8",
    ),
  );
  assert.deepEqual(schema, gtl.CONSENSUS_PUBLIC_SCHEMA);
  assert.deepEqual(
    schema.$defs.ConsensusReviewerCandidate,
    gtl.CONSENSUS_REVIEWER_RESPONSE_SCHEMA,
  );
  assert.deepEqual(
    schema.$defs.ConsensusReviewerInstruction.properties.responseSchema.const,
    gtl.CONSENSUS_REVIEWER_RESPONSE_SCHEMA,
  );
  assert.deepEqual(
    schema.$defs.ConsensusSubmitterResponseCandidate,
    gtl.CONSENSUS_SUBMITTER_RESPONSE_SCHEMA,
  );
  assert.deepEqual(
    schema.$defs.ConsensusSubmitterInstruction.properties.responseSchema.const,
    gtl.CONSENSUS_SUBMITTER_RESPONSE_SCHEMA,
  );
  const acceptedReviewerCandidate = reviewerCandidate();
  const revisedReviewerCandidate = reviewerCandidate("revise");
  assert.equal(
    gtl.isConsensusReviewerCandidate(acceptedReviewerCandidate),
    true,
  );
  assert.equal(
    gtl.isConsensusReviewerCandidate(revisedReviewerCandidate),
    true,
  );
  assert.equal(
    gtl.isConsensusReviewerCandidate({
      ...acceptedReviewerCandidate,
      findings: revisedReviewerCandidate.findings,
    }),
    false,
    "an accept recommendation cannot carry findings",
  );
  assert.equal(
    gtl.isConsensusReviewerCandidate({
      ...revisedReviewerCandidate,
      findings: [],
    }),
    false,
    "a revise recommendation requires at least one finding",
  );
  assert.deepEqual(
    schema.$defs.ConsensusReviewerCandidate.allOf,
    gtl.CONSENSUS_REVIEWER_RESPONSE_SCHEMA.allOf,
  );
  const acknowledgedSubmitterCandidate = submitterCandidate();
  const addressedSubmitterCandidate = submitterCandidate(
    "address_findings",
    ["finding://developer/module-proof"],
  );
  assert.equal(
    gtl.isConsensusSubmitterResponseCandidate(
      acknowledgedSubmitterCandidate,
    ),
    true,
  );
  assert.equal(
    gtl.isConsensusSubmitterResponseCandidate(
      addressedSubmitterCandidate,
    ),
    true,
  );
  assert.equal(
    gtl.isConsensusSubmitterResponseCandidate({
      ...acknowledgedSubmitterCandidate,
      addressedFindingRefs: ["finding://developer/module-proof"],
    }),
    false,
    "an acknowledgement cannot claim addressed findings",
  );
  assert.equal(
    gtl.isConsensusSubmitterResponseCandidate({
      ...addressedSubmitterCandidate,
      addressedFindingRefs: [],
    }),
    false,
    "an address-findings response must identify at least one exact finding",
  );
  assert.deepEqual(
    schema.$defs.ConsensusSubmitterResponseCandidate.allOf,
    gtl.CONSENSUS_SUBMITTER_RESPONSE_SCHEMA.allOf,
  );
  assert.equal(
    schema.$defs.ConsensusReviewerTask.properties.priorSubmitterResponses
      .items.$ref,
    "#/$defs/ConsensusSubmitterResponseRecord",
  );
  for (
    const key of schema.$defs.ConsensusSubmitterResponseRecord.required
  ) {
    assert.deepEqual(
      schema.$defs.ConsensusSubmitterResponse.properties[key],
      schema.$defs.ConsensusSubmitterResponseRecord.properties[key],
      key,
    );
  }
  assert.deepEqual(
    schema.$defs.ReviewRulingKind.enum,
    [...gtl.REVIEW_RULING_KIND_VALUES],
  );
  assert.deepEqual(
    schema.$defs.ConsensusRoundOutcomeValue.enum,
    [...gtl.CONSENSUS_ROUND_OUTCOME_VALUES],
  );
  for (const [definitionName, requiredKeys] of Object.entries(
    gtl.CONSENSUS_SCHEMA_REQUIRED_KEYS,
  )) {
    if (definitionName === "ConsensusResultCandidate") {
      assert.deepEqual(
        requiredKeys,
        schema.$defs.ConsensusResult.required.filter(
          (key) => key !== "replayRef",
        ),
      );
      continue;
    }
    assert.deepEqual(
      requiredKeys,
      schema.$defs[definitionName].required,
      definitionName,
    );
  }

  const instruction = invocationFor().instructions[0];
  assert.equal(gtl.isConsensusReviewerInstruction(instruction), true);
  assert.equal(
    gtl.isConsensusReviewerInstruction({
      ...instruction,
      responseSchema: { type: "object" },
    }),
    false,
  );
  const candidate = unresolvedCandidate();
  assert.equal(gtl.isConsensusResultCandidate(candidate), true);
  assert.equal(
    gtl.isConsensusResult(candidate),
    false,
    "a semantic candidate is not the serialized replay-bound public result",
  );
  assert.equal(gtl.isConsensusResult(unresolvedResult()), true);
});

test("S05 module binds exact policy identities and the invocation workspace", () => {
  const policy = canonicalPolicy();
  assert.equal(gtl.isConsensusRoundPolicy(policy), true);
  for (const field of [
    "convergenceRuleRef",
    "disagreementRuleRef",
    "escalationRuleRef",
    "foldbackContractRef",
  ]) {
    const mutated = structuredClone(policy);
    mutated[field] = `${mutated[field]}/substituted`;
    const { policyDigest: _policyDigest, ...body } = mutated;
    mutated.policyDigest = product.sha256Canonical(body);
    assert.equal(gtl.isConsensusRoundPolicy(mutated), false, field);
  }

  const publication = gtl.constructConsensusModulePublication(artifactBasis());
  const program = publication.programs.find(
    (candidate) =>
      candidate.programRef === gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
  );
  const input = invocationFor();
  const basis = {
    input,
    workspaceBindingId: "workspace-binding://developer/module-proof",
    workspaceBindingDigest: DIGEST,
    workspaceId: WORKSPACE,
    actionCatalog: program.actionCatalog,
    sourceResultBasis: null,
  };
  assert.equal(
    abg.hasExactInvocationObservationBasis(
      input,
      basis.workspaceBindingId,
      basis.workspaceBindingDigest,
      program,
    ),
    true,
  );
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.validateInvocationBasis(basis),
    true,
  );
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.validateInvocationBasis({
      ...basis,
      workspaceId: `${WORKSPACE}/substituted`,
    }),
    false,
  );

  const observation = gtl.constructConsensusObservationSnapshot({
    workspaceBindingId: basis.workspaceBindingId,
    workspaceBindingDigest: basis.workspaceBindingDigest,
    actionCatalog: program.actionCatalog,
    consensusInvocation: input,
  });
  const observationBasis = {
    ...basis,
    input: observation,
  };
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.validateInvocationBasis(observationBasis),
    true,
  );
  const crossWorkspaceObservation =
    gtl.constructConsensusObservationSnapshot({
      workspaceBindingId: basis.workspaceBindingId,
      workspaceBindingDigest: basis.workspaceBindingDigest,
      actionCatalog: program.actionCatalog,
      consensusInvocation: invocationFor(`${WORKSPACE}/substituted`),
    });
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.validateInvocationBasis({
      ...observationBasis,
      input: crossWorkspaceObservation,
    }),
    false,
  );
});

test("S05 ticket Consensus binds ticket identity to the exact subject bytes", () => {
  const invocation = invocationFor();
  const wrongRef = structuredClone(invocation.subject);
  wrongRef.ticketRef = `${wrongRef.subjectRef}/other`;
  assert.equal(gtl.isConsensusSubject(wrongRef), false);
  assert.throws(
    () => gtl.constructConsensusSubject(wrongRef),
    /exact immutable identity/u,
  );

  const wrongDigest = structuredClone(invocation.subject);
  wrongDigest.ticketDigest = `sha256:${"2".repeat(64)}`;
  assert.equal(gtl.isConsensusSubject(wrongDigest), false);
  assert.throws(
    () => gtl.constructConsensusSubject(wrongDigest),
    /exact immutable identity/u,
  );
});

test("S05 reviewer profiles bind every execution-affecting configuration field", () => {
  const invocation = structuredClone(invocationFor());
  const profile = invocation.panel.profiles[0];
  profile.instructionContractRef =
    `${profile.instructionContractRef}/substituted`;
  const { panelDigest: _panelDigest, ...panelBody } = invocation.panel;
  invocation.panel.panelDigest = product.sha256Canonical(panelBody);

  assert.equal(
    gtl.isConsensusReviewerProfile(profile),
    false,
    "a stale configuration digest must not authorize substituted reviewer configuration",
  );
  assert.equal(gtl.isConsensusPanel(invocation.panel), false);
  assert.equal(gtl.isConsensusInvocation(invocation), false);
});

test("S05 admits one explicit reviewer without hard-coding panel cardinality", () => {
  const invocation = invocationFor();
  const panel = gtl.constructConsensusPanel(
    `${invocation.panel.panelRef}/singleton`,
    [invocation.panel.profiles[0]],
  );
  const subject = gtl.constructConsensusSubject({
    ...invocation.subject,
    panelRef: panel.panelRef,
  });
  const singleton = gtl.constructConsensusInvocation({
    ...invocation,
    subject,
    panel,
    instructions: [invocation.instructions[0]],
  });
  assert.equal(gtl.isConsensusPanel(panel), true);
  assert.equal(gtl.isConsensusInvocation(singleton), true);
});

test("S05 Product response semantics bind the exact pending result and acting actor", () => {
  const pending = unresolvedResult();
  const basis = {
    requestContractRef: gtl.CONSENSUS_IDS.escalationRequestContractRef,
    responseContractRef: gtl.CONSENSUS_IDS.escalationDecisionContractRef,
    requestValue: pending,
    actingActorRef: ACTOR,
  };
  assert.notEqual(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.evaluateInteractionResponse(
      basis,
      escalationDecision(pending),
    ),
    null,
  );
  const other = unresolvedResult(`${pending.resultRef}/other`);
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.evaluateInteractionResponse(
      basis,
      escalationDecision(other),
    ),
    null,
  );
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.evaluateInteractionResponse(
      basis,
      escalationDecision(pending, `${ACTOR}/other`),
    ),
    null,
  );
});

test("S05 Product semantics own invocation-basis validation and replay projection", () => {
  const invocation = invocationFor();
  const validateInvocationBasis =
    ABI5_SYSTEM_PRODUCT_SEMANTICS.validateInvocationBasis;
  assert.equal(
    validateInvocationBasis({
      input: invocation,
      workspaceBindingId: "workspace-binding://developer/module-proof",
      workspaceBindingDigest: DIGEST,
      workspaceId: WORKSPACE,
      actionCatalog: null,
      sourceResultBasis: null,
    }),
    true,
  );
  assert.equal(
    validateInvocationBasis({
      input: invocation,
      workspaceBindingId: "workspace-binding://developer/module-proof",
      workspaceBindingDigest: DIGEST,
      workspaceId: `${WORKSPACE}/other`,
      actionCatalog: null,
      sourceResultBasis: null,
    }),
    false,
  );

  const pending = unresolvedCandidate();
  const replayRef = "replay://abiogenesis/module-proof";
  const projected = ABI5_SYSTEM_PRODUCT_SEMANTICS.projectPublicResult({
    value: pending,
    admittedResultRef: "result://abg/module-proof",
    replayRef,
  });
  assert.equal(gtl.isConsensusResult(projected), true);
  assert.equal(projected.replayRef, replayRef);
  assert.notEqual(
    "result://abg/module-proof",
    pending.resultRef,
    "ABG admission identity and Product semantic identity remain distinct",
  );
  const sourceResultBasis = {
    kind: "invocation_source_result_basis",
    schemaVersion: "5.0.0",
    basisRef: "invocation-source-result://abiogenesis/module-proof",
    basisDigest: DIGEST,
    publicAuthorityDigest: DIGEST,
    sourceInvocationAdmissionRef:
      "invocation-admission://abiogenesis/module-proof",
    sourceInvocationRef: "invocation://abiogenesis/module-proof",
    sourceRunId: "run://abiogenesis/module-proof",
    sourceGraphCallId: "graph-call://abiogenesis/module-proof",
    sourceGraphFunctionRef: gtl.CONSENSUS_IDS.graphFunctionRef,
    sourceCCallRef: "c-call://abiogenesis/module-proof",
    sourceResultAdmissionEventRef:
      "event://abiogenesis/module-proof/result",
    sourceResultJudgmentEventRef:
      "event://abiogenesis/module-proof/judgment",
    sourceResultRef: "result://abg/module-proof",
    sourceResultDigest: product.sha256Canonical(pending),
    sourceResultValueDigest: product.sha256Canonical(pending),
    sourceResultContractRef: gtl.CONSENSUS_IDS.resultContractRef,
    sourceResultValue: pending,
    sourceReplayRef: replayRef,
    sourceReplayDigest: DIGEST,
    sourceWorkspaceId: WORKSPACE,
    workspaceBindingId: "workspace-binding://developer/module-proof",
    workspaceBindingDigest: DIGEST,
  };
  assert.equal(
    validateInvocationBasis({
      input: projected,
      workspaceBindingId: "workspace-binding://developer/module-proof",
      workspaceBindingDigest: DIGEST,
      workspaceId: WORKSPACE,
      actionCatalog: null,
      sourceResultBasis,
    }),
    true,
  );
  assert.equal(
    validateInvocationBasis({
      input: projected,
      workspaceBindingId: "workspace-binding://developer/module-proof",
      workspaceBindingDigest: DIGEST,
      workspaceId: WORKSPACE,
      actionCatalog: null,
      sourceResultBasis: null,
    }),
    false,
  );
  assert.equal(
    validateInvocationBasis({
      input: projected,
      workspaceBindingId: "workspace-binding://developer/module-proof",
      workspaceBindingDigest: DIGEST,
      workspaceId: `${WORKSPACE}/substituted`,
      actionCatalog: null,
      sourceResultBasis,
    }),
    false,
  );
  assert.equal(
    validateInvocationBasis({
      input: projected,
      workspaceBindingId: "workspace-binding://developer/module-proof",
      workspaceBindingDigest: DIGEST,
      workspaceId: WORKSPACE,
      actionCatalog: null,
      sourceResultBasis: {
        ...sourceResultBasis,
        sourceGraphFunctionRef:
          gtl.CONSENSUS_IDS.escalationGraphFunctionRef,
      },
    }),
    false,
  );
});

test("S05 ABG binds each durable Run to its exact admitted invocation", async () => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-s05-run-binding-"));
  const sourcePath = resolve(
    packageRoot,
    "test_env/proof/abi5-root-r10.events.jsonl",
  );
  const transcriptPath = resolve(
    packageRoot,
    "test_env/proof/abi5-root-r10.transcript.json",
  );
  const eventLogPath = join(scratch, "abi5-root-r10.events.jsonl");
  try {
    await copyFile(sourcePath, eventLogPath);
    const transcript = JSON.parse(await readFile(transcriptPath, "utf8"));
    const bytes = await readFile(eventLogPath);
    const status = await stat(eventLogPath);
    const authorityBody = {
      kind: "event_store_reopen_authority",
      schemaVersion: "5.0.0",
      eventLogPath,
      device: status.dev,
      inode: status.ino,
      eventLogDigest:
        `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
      durableByteLength: bytes.byteLength,
      eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST,
    };
    const reopened = abg.reopenEventStore({
      ...authorityBody,
      authorityDigest: product.sha256Canonical(authorityBody),
    });
    assert.equal(
      reopened.kind,
      "reopened_event_store_context",
      JSON.stringify(reopened),
    );
    if (reopened.kind !== "reopened_event_store_context") return;
    try {
      const runOpens = reopened.store.readAll().filter(
        (event) => event.kind === "run_segment_opened",
      );
      assert.equal(runOpens.length, 2);
      const admissions = runOpens.map((event) =>
        abg.rehydrateInvocationAdmission(
          reopened.store,
          event.payload.invocationAdmissionRef,
        )
      );
      assert.ok(admissions[0]);
      assert.ok(admissions[1]);
      assert.equal(
        abg.hasInvocationRunBinding(
          reopened.store,
          admissions[0],
          runOpens[0].runId,
        ),
        true,
      );
      assert.equal(
        abg.hasInvocationRunBinding(
          reopened.store,
          admissions[0],
          runOpens[1].runId,
        ),
        false,
      );
      assert.equal(
        abg.hasInvocationRunBinding(
          reopened.store,
          admissions[1],
          runOpens[0].runId,
        ),
        false,
      );
      assert.equal(
        abg.hasInvocationRunBinding(
          reopened.store,
          admissions[1],
          runOpens[1].runId,
        ),
        true,
      );
      const installEvent = reopened.store.readAll().find(
        (event) =>
          event.kind === "public_operation_artifact_admitted" &&
          event.payload.operationId === "abg.operation.product.install",
      );
      const catalogEvent = reopened.store.readAll().find(
        (event) =>
          event.kind === "public_operation_artifact_admitted" &&
          event.payload.operationId === "abg.operation.catalog.admit",
      );
      const catalogViewEvent = reopened.store.readAll().find(
        (event) =>
          event.kind === "public_operation_artifact_admitted" &&
          event.payload.operationId === "abg.operation.catalog.view",
      );
      assert.ok(installEvent);
      assert.ok(catalogEvent);
      assert.ok(catalogViewEvent);
      const verification = transcript[0].payload;
      const install = {
        kind: "product_install",
        schemaVersion: "5.0.0",
        disposition: "admitted",
        installId: installEvent.aggregateId,
        installedRoot: join(
          transcript[1].payload.targetRoot,
          "node_modules",
          "@abiogenesis",
          "typescript-tenant",
        ),
        productId: verification.expectedProductId,
        packageName: verification.expectedPackageName,
        packageVersion: verification.expectedPackageVersion,
        artifactDigest: verification.expectedArtifactDigest,
        productContentDigest: verification.expectedProductContentDigest,
        manifestDigest: verification.expectedManifestDigest,
        admissionEventRef: installEvent.eventId,
      };
      const publication = transcript[3].payload.publication;
      const productSemanticsBasis = {
        install,
        workspaceBindingId: catalogEvent.payload.authorityScopeRef,
        workspaceBindingDigest: catalogEvent.payload.authorityScopeDigest,
        catalogId: catalogViewEvent.payload.authorityScopeRef,
        catalogDigest: catalogEvent.payload.artifactDigest,
        catalogAdmissionEventRef: catalogEvent.eventId,
        catalogViewId:
          `catalog-view://abiogenesis/${catalogViewEvent.payload.artifactDigest.slice("sha256:".length)}`,
        catalogViewDigest: catalogViewEvent.payload.artifactDigest,
        catalogViewAdmissionEventRef: catalogViewEvent.eventId,
        publicationDigest: catalogEvent.payload.publicationDigest,
        productSemanticsBinding: publication.productSemanticsBinding,
      };
      assert.equal(
        abg.hasAdmittedProductSemanticsBasis(
          reopened.store,
          productSemanticsBasis,
        ),
        true,
      );
      const replays = runOpens.map((event) =>
        abg.replay(reopened.store, { runId: event.runId })
      );
      const resultRefs = replays.map(
        (replay) =>
          replay.cCalls.find((cCall) => cCall.resultRef !== null)?.resultRef,
      );
      assert.equal(typeof resultRefs[0], "string");
      assert.equal(typeof resultRefs[1], "string");
      const ownRunBasis = abg.deriveInvocationSourceResultBasis(
        reopened.store,
        {
          publicAuthorityDigest: DIGEST,
          runtimeInvocationRef: admissions[0].invocationRef,
          invocationAdmissionRef:
            runOpens[0].payload.invocationAdmissionRef,
          runId: runOpens[0].runId,
          resultRef: resultRefs[0],
          productSemanticsBasis,
        },
      );
      assert.ok(ownRunBasis);
      assert.equal(ownRunBasis.sourceRunId, runOpens[0].runId);
      const crossPairedRunBasis = abg.deriveInvocationSourceResultBasis(
        reopened.store,
        {
          publicAuthorityDigest: DIGEST,
          runtimeInvocationRef: admissions[0].invocationRef,
          invocationAdmissionRef:
            runOpens[0].payload.invocationAdmissionRef,
          runId: runOpens[1].runId,
          resultRef: resultRefs[1],
          productSemanticsBasis,
        },
      );
      assert.equal(
        crossPairedRunBasis,
        null,
        "a source-result basis must not cross-pair one admitted invocation with another Run",
      );
    } finally {
      reopened.store.closeDurableLog();
    }
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});

test("S05 reviewer realization carries the Product-declared instruction contract", async () => {
  const invocation = invocationFor();
  const state = gtl.initializeConsensus(invocation);
  const task = state.members[0].value;
  assert.equal(gtl.isConsensusReviewerTask(task), true);
  const workerContracts =
    ABI5_SYSTEM_PRODUCT_SEMANTICS.resolveProbabilisticWorkerContracts({
      inputContractRef: gtl.CONSENSUS_IDS.reviewerTaskContractRef,
      outputContractRef: gtl.CONSENSUS_IDS.findingsContractRef,
      input: task,
    });
  assert.deepEqual(workerContracts, {
    instructionContractRef: task.profile.instructionContractRef,
    resultContractRef: task.profile.resultContractRef,
  });
  let request = null;
  const candidate = await realizeConsensusReviewer(task, {
    async invokeWorker(value) {
      request = value;
      return {
        actorInvocationRef: "actor-invocation://developer/module-proof",
        transportBindingRef: "transport-binding://developer/module-proof",
        transportBindingDigest: DIGEST,
        disposition: "success",
        failureClass: null,
        finalOutput: JSON.stringify(reviewerCandidate()),
        promptDigest: DIGEST,
        transportDigest: DIGEST,
        transportLane: task.transportLane,
        processStatus: 0,
        processSignal: null,
        timedOut: false,
        exitObserved: true,
        terminationConfirmed: true,
        progressEventCount: 0,
        toolCallCount: 0,
        artifactDigests: {
          output: DIGEST,
          prompt: DIGEST,
          stderr: DIGEST,
          stdout: DIGEST,
          transport: DIGEST,
        },
      };
    },
  });
  assert.equal(candidate.disposition, "success");
  assert.equal(
    request.instructionContractRef,
    task.profile.instructionContractRef,
  );
  assert.equal(
    request.prompt.includes(task.subjectMaterialization.content),
    true,
  );
  assert.equal(
    request.prompt.includes(task.instruction.instructionText),
    true,
  );
  assert.deepEqual(
    request.responseJsonSchema,
    task.instruction.responseSchema,
  );

  const refusedCandidate = await realizeConsensusReviewer(task, {
    async invokeWorker() {
      return {
        actorInvocationRef: "actor-invocation://developer/module-proof/refused",
        transportBindingRef: "transport-binding://developer/module-proof",
        transportBindingDigest: DIGEST,
        disposition: "success",
        failureClass: null,
        finalOutput: "{\"unadmitted\":true}",
        promptDigest: DIGEST,
        transportDigest: DIGEST,
        transportLane: task.transportLane,
        processStatus: 0,
        processSignal: null,
        timedOut: false,
        exitObserved: true,
        terminationConfirmed: true,
        progressEventCount: 0,
        toolCallCount: 0,
        artifactDigests: {
          output: DIGEST,
          prompt: DIGEST,
          stderr: DIGEST,
          stdout: DIGEST,
          transport: DIGEST,
        },
      };
    },
  });
  assert.equal(refusedCandidate.disposition, "success");
  assert.equal(
    gtl.isReviewFindings(refusedCandidate.resultCandidate),
    true,
  );
  assert.notEqual(refusedCandidate.resultCandidate.refusalRef, null);
  const refusedVector = await findingsVectorFor(state, "accept");
  refusedVector.members[0].value = refusedCandidate.resultCandidate;
  const submitterTaskCandidate =
    realizeConsensusSubmitterTaskPreparation(refusedVector);
  const submitterResponseCandidate = await realizeConsensusSubmitter(
    submitterTaskCandidate.resultCandidate,
    {
      async invokeWorker() {
        return {
          actorInvocationRef:
            "actor-invocation://developer/module-proof/submitter",
          transportBindingRef:
            "transport-binding://developer/module-proof/submitter",
          transportBindingDigest: DIGEST,
          disposition: "success",
          failureClass: null,
          finalOutput: JSON.stringify(submitterCandidate()),
          promptDigest: DIGEST,
          transportDigest: DIGEST,
          transportLane: task.transportLane,
          processStatus: 0,
          processSignal: null,
          timedOut: false,
          exitObserved: true,
          terminationConfirmed: true,
          progressEventCount: 0,
          toolCallCount: 0,
          artifactDigests: {
            output: DIGEST,
            prompt: DIGEST,
            stderr: DIGEST,
            stdout: DIGEST,
            transport: DIGEST,
          },
        };
      },
    },
  );
  assert.equal(submitterResponseCandidate.disposition, "success");
  const terminalState = gtl.reduceConsensusRound(
    submitterResponseCandidate.resultCandidate,
  );
  assert.equal(terminalState.terminal, true);
  assert.equal(terminalState.terminalOutcome.outcome, "escalate_fh");
  const contractFailure = gtl.projectConsensusResult(terminalState);
  assert.equal(contractFailure.classification, "contract_failure");
  assert.notEqual(contractFailure.contractFailureRef, null);
  const replayBoundContractFailure = gtl.bindConsensusReplay(
    contractFailure,
    "replay://abiogenesis/module-proof/contract-failure",
  );
  assert.equal(
    gtl.isConsensusEscalationRequest(replayBoundContractFailure),
    false,
  );
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.admitInput(
      gtl.CONSENSUS_IDS.escalationRequestContractRef,
      replayBoundContractFailure,
    ),
    null,
  );
  assert.equal(
    gtl.isConsensusEscalationDecision(
      escalationDecision(replayBoundContractFailure),
    ),
    false,
  );

  const transportFailure = await realizeConsensusReviewer(task, {
    async invokeWorker() {
      return {
        actorInvocationRef:
          "actor-invocation://developer/module-proof/transport-failure",
        transportBindingRef: "transport-binding://developer/module-proof",
        transportBindingDigest: DIGEST,
        disposition: "failure",
        failureClass: "no_output",
        finalOutput: "",
        promptDigest: DIGEST,
        transportDigest: DIGEST,
        transportLane: task.transportLane,
        processStatus: 0,
        processSignal: null,
        timedOut: false,
        exitObserved: true,
        terminationConfirmed: true,
        progressEventCount: 0,
        toolCallCount: 0,
        artifactDigests: {
          output: DIGEST,
          prompt: DIGEST,
          stderr: DIGEST,
          stdout: DIGEST,
          transport: DIGEST,
        },
      };
    },
  });
  assert.equal(transportFailure.disposition, "failure");
  assert.equal(transportFailure.resultCandidate.kind, "consensus_failure");
  assert.equal(transportFailure.resultCandidate.failureClass, "no_output");
  assert.equal(
    gtl.isReviewFindings(transportFailure.resultCandidate),
    false,
    "transport failure must not become a semantic contract-failure finding",
  );

  const salvagedCandidate = await realizeConsensusReviewer(task, {
    async invokeWorker() {
      return {
        actorInvocationRef:
          "actor-invocation://developer/module-proof/salvaged",
        transportBindingRef: "transport-binding://developer/module-proof",
        transportBindingDigest: DIGEST,
        disposition: "failure",
        failureClass: "transport_failure",
        finalOutput: JSON.stringify(reviewerCandidate()),
        promptDigest: DIGEST,
        transportDigest: DIGEST,
        transportLane: task.transportLane,
        processStatus: 47,
        processSignal: null,
        timedOut: false,
        exitObserved: true,
        terminationConfirmed: true,
        progressEventCount: 0,
        toolCallCount: 0,
        artifactDigests: {
          output: DIGEST,
          prompt: DIGEST,
          stderr: DIGEST,
          stdout: DIGEST,
          transport: DIGEST,
        },
      };
    },
  });
  assert.equal(salvagedCandidate.disposition, "success");
  assert.equal(
    gtl.isReviewFindings(salvagedCandidate.resultCandidate),
    true,
  );
  assert.equal(salvagedCandidate.resultCandidate.recommendation, "accept");
});

test("S05 exact submitter-response basis gates reviewer reconsideration", async () => {
  const initial = gtl.initializeConsensus(invocationFor());
  const firstVector = await findingsVectorFor(initial);
  const firstResponse = await responseFor(
    firstVector,
    "address_findings",
  );
  const admittedEvidence = [{
    evidenceRef: "evidence://abiogenesis/module-proof",
    evidenceDigest: DIGEST,
    evidenceClass: "probabilistic_transport",
    outputDigest: firstResponse.outputDigest,
    transportDigest: DIGEST,
  }];
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.validateResultEvidenceLineage({
      outputContractRef: gtl.CONSENSUS_IDS.submitterResponseContractRef,
      value: firstResponse,
      admittedEvidence,
    }),
    true,
  );
  const forgedEvidence = structuredClone(firstResponse);
  forgedEvidence.evidenceRefs = [
    "transport-evidence://abg/forged-semantic-lineage",
  ];
  const forgedEvidenceResponse = rehashSubmitterResponse(forgedEvidence);
  assert.equal(
    gtl.isConsensusSubmitterResponse(forgedEvidenceResponse),
    true,
    "the Product response remains structurally valid before ABG evidence reconciliation",
  );
  assert.equal(
    ABI5_SYSTEM_PRODUCT_SEMANTICS.validateResultEvidenceLineage({
      outputContractRef: gtl.CONSENSUS_IDS.submitterResponseContractRef,
      value: forgedEvidenceResponse,
      admittedEvidence,
    }),
    false,
    "semantic evidence must derive from the exact ABG-admitted transport evidence",
  );
  const partialVector = structuredClone(firstVector);
  partialVector.members = partialVector.members.slice(0, 1);
  assert.equal(
    gtl.isConsensusFindingsVector(partialVector),
    false,
    "a partial findings vector cannot shrink the admitted panel",
  );
  assert.throws(
    () => realizeConsensusSubmitterTaskPreparation(partialVector),
    /requires one exact findings vector/,
  );
  const reorderedVector = structuredClone(firstVector);
  reorderedVector.members.reverse();
  reorderedVector.members.forEach((member, ordinal) => {
    member.ordinal = ordinal;
  });
  assert.equal(
    gtl.isConsensusFindingsVector(reorderedVector),
    false,
    "a findings vector cannot reorder the admitted panel",
  );
  const otherRoundVector = await findingsVectorFor(
    gtl.initializeConsensus(invocationFor(`${WORKSPACE}/other-basis`)),
  );
  const crossBasisVector = structuredClone(firstVector);
  crossBasisVector.members[1] = structuredClone(otherRoundVector.members[1]);
  assert.equal(
    gtl.isConsensusFindingsVector(crossBasisVector),
    false,
    "panel-shaped findings from another invocation basis cannot enter the vector",
  );
  const reconsideration = gtl.reduceConsensusRound(firstResponse);

  assert.equal(reconsideration.terminal, false);
  assert.equal(reconsideration.roundOrdinal, 2);
  assert.equal(reconsideration.submitterResponses.length, 1);
  assert.equal(
    reconsideration.submitterResponses[0].responseRef,
    firstResponse.responseRef,
  );
  assert.equal(
    reconsideration.members.every(
      (member) =>
        member.value.roundOrdinal === 2 &&
        member.value.priorRoundRefs[0] === firstResponse.roundRef &&
        member.value.priorSubmitterResponses.length === 1 &&
        member.value.priorSubmitterResponses[0].responseRef ===
          firstResponse.responseRef &&
        member.value.priorSubmitterResponses[0].outputDigest ===
          firstResponse.outputDigest,
    ),
    true,
    "round two must carry the exact admitted response for reviewer reconsideration",
  );

  assert.throws(
    () => gtl.reduceConsensusRound(undefined),
    /requires one exact admitted submitter response/,
    "missing response cannot construct successor-round state",
  );

  const assertRefused = (candidate, label) => {
    assert.equal(
      gtl.isConsensusSubmitterResponse(candidate),
      false,
      label,
    );
    assert.equal(
      ABI5_SYSTEM_PRODUCT_SEMANTICS.validateContractValue(
        "consensus_submitter_response",
        candidate,
      ),
      false,
      `${label}: Product contract admission`,
    );
    assert.throws(
      () => gtl.reduceConsensusRound(candidate),
      /requires one exact admitted submitter response/,
      `${label}: no successor state`,
    );
  };

  const wrongSubmitter = structuredClone(firstResponse);
  wrongSubmitter.submittingActorRef =
    "actor://developer/consensus/wrong-submitter";
  assertRefused(
    rehashSubmitterResponse(wrongSubmitter),
    "wrong submitter must refuse",
  );

  const wrongProfile = structuredClone(firstResponse);
  wrongProfile.profileRef =
    "submitter-profile://developer/wrong-profile";
  assertRefused(
    rehashSubmitterResponse(wrongProfile),
    "wrong submitter profile must refuse",
  );

  const wrongConfiguration = structuredClone(firstResponse);
  wrongConfiguration.configurationDigest = DIGEST;
  assertRefused(
    wrongConfiguration,
    "wrong submitter configuration must refuse",
  );

  const forgedIdentity = structuredClone(firstResponse);
  forgedIdentity.responseRef =
    `${forgedIdentity.responseRef}/forged`;
  assertRefused(forgedIdentity, "forged response identity must refuse");

  const unboundVector = structuredClone(firstResponse);
  unboundVector.findingsVectorDigest = DIGEST;
  assertRefused(
    rehashSubmitterResponse(unboundVector),
    "response unbound from the exact findings vector must refuse",
  );

  const secondVector = await findingsVectorFor(reconsideration);
  const secondResponse = await responseFor(
    secondVector,
    "address_findings",
  );
  const wrongPriorRound = structuredClone(secondResponse);
  wrongPriorRound.task.priorRoundRefs[0] =
    "consensus-round://developer/wrong-prior-round";
  assertRefused(
    rehashSubmitterResponse(wrongPriorRound),
    "wrong prior round must refuse",
  );

  const unchangedPriorResponse = structuredClone(secondResponse);
  unchangedPriorResponse.task.priorSubmitterResponseRefs[0] =
    "submitter-response://developer/unbound-prior-response";
  assertRefused(
    rehashSubmitterResponse(unchangedPriorResponse),
    "unchanged or unbound prior response must refuse",
  );
});

test("S05 Product judgment binds reviewer and submitter output to the exact input task", async () => {
  const firstState = gtl.initializeConsensus(
    invocationFor("workspace://developer/consensus/cross-pair-a"),
  );
  const secondState = gtl.initializeConsensus(
    invocationFor("workspace://developer/consensus/cross-pair-b"),
  );
  const firstReviewerTask = firstState.members[0].value;
  const secondReviewerResult = await realizeConsensusReviewer(
    secondState.members[0].value,
    {
      async invokeWorker() {
        return workerObservation(
          JSON.stringify(reviewerCandidate("revise")),
          "reviewer-cross-pair",
        );
      },
    },
  );
  assert.equal(secondReviewerResult.disposition, "success");
  assert.equal(
    gtl.resolveConsensusJudgmentRelation(
      gtl.CONSENSUS_IDS.reviewerPredicateRef,
    ).evaluate(firstReviewerTask, secondReviewerResult.resultCandidate),
    false,
    "valid reviewer output for another task must not advance",
  );

  const firstVector = await findingsVectorFor(firstState);
  const secondVector = await findingsVectorFor(secondState);
  const firstSubmitterTask =
    realizeConsensusSubmitterTaskPreparation(firstVector).resultCandidate;
  const secondSubmitterResponse = await responseFor(
    secondVector,
    "address_findings",
  );
  assert.equal(
    gtl.resolveConsensusJudgmentRelation(
      gtl.CONSENSUS_IDS.submitterPredicateRef,
    ).evaluate(firstSubmitterTask, secondSubmitterResponse),
    false,
    "valid submitter output for another findings vector must not advance",
  );
});

test("S05 public result binds real replay while its authority rejects digest tampering", () => {
  const pending = unresolvedCandidate();
  const result = gtl.bindConsensusReplay(
    pending,
    "replay://abiogenesis/module-proof",
  );
  assert.equal(gtl.isConsensusResult(result), true);
  assert.equal(
    gtl.projectTicketConsensus(result).replayRef,
    result.replayRef,
  );

  const reopenBody = {
    kind: "event_store_reopen_authority",
    schemaVersion: "5.0.0",
    eventLogPath: "/tmp/abiogenesis-module-proof.events.jsonl",
    device: 1,
    inode: 1,
    eventLogDigest: DIGEST,
    durableByteLength: 0,
    eventContractDigest: ROOT_EVENT_CONTRACT_DIGEST,
  };
  const authority = constructPublicRunProjectionAuthority({
    reopenAuthority: {
      ...reopenBody,
      authorityDigest: product.sha256Canonical(reopenBody),
    },
    runtimeInvocationRef: "invocation://developer/module-proof",
    invocationAdmissionRef: "invocation-admission://developer/module-proof",
    runId: "run://developer/module-proof",
    graphCallId: "graph-call://developer/module-proof",
    resultRef: pending.resultRef,
    outputContractRef: gtl.CONSENSUS_IDS.resultContractRef,
    install: {
      kind: "product_install",
      schemaVersion: "5.0.0",
      disposition: "admitted",
      installId: "install://developer/module-proof",
      installedRoot: "/tmp/abiogenesis-module-proof",
      productId: artifactBasis().productId,
      packageName: artifactBasis().packageName,
      packageVersion: artifactBasis().packageVersion,
      artifactDigest: DIGEST,
      productContentDigest: DIGEST,
      manifestDigest: DIGEST,
      admissionEventRef: "event://developer/install-admitted",
    },
    workspaceId: WORKSPACE,
    workspaceBindingId: "workspace-binding://developer/module-proof",
    workspaceBindingDigest: DIGEST,
    catalogId: "catalog://abiogenesis/module-proof",
    catalogDigest: DIGEST,
    catalogAdmissionEventRef: "event://developer/catalog-admitted",
    catalogViewId: "catalog-view://abiogenesis/module-proof",
    catalogViewDigest: DIGEST,
    catalogViewAdmissionEventRef: "event://developer/catalog-view-admitted",
    publicationDigest: DIGEST,
    productSemanticsBinding: {
      kind: "product_semantics_binding",
      bindingRef: gtl.CONSENSUS_IDS.productSemanticsBindingRef,
      packageName: artifactBasis().packageName,
      packageVersion: artifactBasis().packageVersion,
      modulePath: "build/code/src/product/builtin_semantics.js",
      namedSymbol: "ABI5_SYSTEM_PRODUCT_SEMANTICS",
    },
  });
  assert.notEqual(parsePublicRunProjectionAuthority(authority), null);
  assert.equal(Object.hasOwn(authority, "catalog"), false);
  assert.equal(Object.hasOwn(authority, "catalogView"), false);
  assert.equal(Object.hasOwn(authority, "modulePublication"), false);
  assert.equal(
    parsePublicRunProjectionAuthority({
      ...authority,
      resultRef: `${pending.resultRef}/tampered`,
    }),
    null,
  );
});

test("S05 generic Public and ABG invocation basis contain no Consensus branch", async () => {
  const publicSource = await readFile(
    resolve(packageRoot, "code/src/public/operations.ts"),
    "utf8",
  );
  const executionBasisSource = await readFile(
    resolve(packageRoot, "code/src/abg/execution_basis.ts"),
    "utf8",
  );
  const hogExecutionSource = await readFile(
    resolve(packageRoot, "code/src/hog/execute.ts"),
    "utf8",
  );
  for (const source of [publicSource, executionBasisSource]) {
    assert.doesNotMatch(
      source,
      /\b(?:Consensus|consensus|isConsensus|bindConsensus)\b/,
    );
  }
  const resultAdmissionStart = hogExecutionSource.indexOf(
    "const result = admitResult(",
  );
  const resultAdmissionEnd = hogExecutionSource.indexOf(
    "if (result.kind === \"c_call_admission_rejection\")",
    resultAdmissionStart,
  );
  assert.ok(resultAdmissionStart >= 0 && resultAdmissionEnd > resultAdmissionStart);
  const resultAdmission = hogExecutionSource.slice(
    resultAdmissionStart,
    resultAdmissionEnd,
  );
  assert.match(
    resultAdmission,
    /validateSuccessResult\(value\)\s*&&\s*input\.leafPort\.validateResultEvidenceLineage\(/u,
    "generic HoG result admission must invoke the Product evidence-lineage relation",
  );
  assert.match(
    resultAdmission,
    /evidence\.map\(/u,
    "the Product relation must receive the exact admitted C-call evidence basis",
  );
});
