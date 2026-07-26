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
import { realizeConsensusReviewer } from "../../build/code/src/implementation/consensus.js";
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
  const profiles = ["author", "independent"].map((name) =>
    gtl.constructConsensusReviewerProfile({
      profileRef: `reviewer-profile://developer/${name}`,
      roleContractRef: `contract://developer/reviewer-role/${name}@1`,
      instructionContractRef:
        "contract://developer/consensus/reviewer-instruction@1",
      resultContractRef: gtl.CONSENSUS_IDS.findingsContractRef,
      capabilityRefs: [`capability://developer/reviewer/${name}`],
      actorRef: `actor://developer/reviewer/${name}`,
      workerBindingRef: `worker-binding://developer/reviewer/${name}`,
    })
  );
  const panel = gtl.constructConsensusPanel(
    "panel://developer/consensus/module-proof",
    profiles,
  );
  const policy = canonicalPolicy();
  const subject = gtl.constructConsensusSubject({
    subjectContractRef: "contract://stdo/ticket@2",
    subjectRef: "ticket://abiogenesis/T-276",
    subjectDigest: DIGEST,
    submittingActorRef: ACTOR,
    panelRef: panel.panelRef,
    roundPolicyRef: policy.policyRef,
    workspaceRef,
    ticketRef: "ticket://abiogenesis/T-276",
    ticketDigest: DIGEST,
  });
  return gtl.constructConsensusInvocation({
    invocationRef: "consensus-invocation://developer/module-proof",
    subject,
    panel,
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

test("S05 module publishes the exact Consensus contracts, vocabularies, and ordinary GTL callable", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, "product-toolchain-manifest.json"), "utf8"),
  );
  const required = [
    "abg.schema.consensus-subject",
    "abg.schema.consensus-panel",
    "abg.schema.consensus-reviewer-profile",
    "abg.schema.review-findings",
    "abg.schema.review-rulings",
    "abg.schema.consensus-round-policy",
    "abg.schema.consensus-round-outcome",
    "abg.schema.consensus-result",
    "abg.schema.ticket-consensus-projection",
    "abg.vocabulary.review-ruling-kind",
    "abg.vocabulary.consensus-round-outcome",
  ];
  const rows = new Map(
    manifest.publicContractCatalog.rows.map((row) => [row.contractId, row]),
  );
  for (const contractId of required) {
    const row = rows.get(contractId);
    assert.ok(row, contractId);
    assert.equal(row.nativeTypedLocator.packageExportPath, "./gtl");
    assert.notEqual(gtl[row.nativeTypedLocator.namedSymbol], undefined);
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
    (candidate) => candidate.programRef === gtl.CONSENSUS_IDS.programRef,
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
  const eventLogPath = join(scratch, "abi5-root-r10.events.jsonl");
  try {
    await copyFile(sourcePath, eventLogPath);
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
    } finally {
      reopened.store.closeDurableLog();
    }
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});

test("S05 reviewer realization carries the Product-declared instruction contract", async () => {
  const invocation = invocationFor();
  const task = {
    kind: "consensus_reviewer_task",
    schemaVersion: "5.0.0",
    invocationRef: invocation.invocationRef,
    roundRef: "consensus-round://developer/module-proof/1",
    roundOrdinal: 1,
    subject: invocation.subject,
    panelRef: invocation.panel.panelRef,
    policy: invocation.policy,
    profile: invocation.panel.profiles[0],
    priorRoundRefs: [],
    priorFindingSetRefs: [],
    priorRulings: [],
    priorDissentProfileRefs: [],
    priorEvidenceRefs: [],
    transportLane: invocation.transportLane,
  };
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
        finalOutput: JSON.stringify({
          kind: "consensus_reviewer_candidate",
          schemaVersion: "5.0.0",
          recommendation: "accept",
          findings: [],
          residualRefs: [],
        }),
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
  for (const source of [publicSource, executionBasisSource]) {
    assert.doesNotMatch(
      source,
      /\b(?:Consensus|consensus|isConsensus|bindConsensus)\b/,
    );
  }
});
