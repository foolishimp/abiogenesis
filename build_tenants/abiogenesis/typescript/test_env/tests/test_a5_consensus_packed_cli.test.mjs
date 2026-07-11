// Validates: A5-CONSENSUS-01 packed, installed, agent-invocable SYSTEM GraphFunction
// Validates: REQ-P-CATALOG, REQ-P-INSTALL, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  canonicalizeIJson,
  digestCanonicalIJson
} from "../../build/semantic/code/src/app/m04/index.js";
import { prepareT223AbgCandidate } from "../tools/t223_abg_candidate.mjs";

const tenantRoot = path.resolve(import.meta.dirname, "../..");
const transportFixture = path.join(
  tenantRoot,
  "test_env/fixtures/a5_packed_consensus/fp-transport"
);
const CONSENSUS_HANDLE = "gtl://abg/consensus/submitter-reviewer-rounds";
const CONSENSUS_REQUEST_SCHEMA_REF = "abg.schema.consensus-request";
const CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF =
  "abg.schema.consensus-reviewer-response";
const INVOKE_CAPABILITY =
  "abg.capability.catalog.invoke-graph-function@5";

function assertAccepted(outcome, label) {
  assert.equal(outcome.kind, "accepted", `${label}: ${JSON.stringify(outcome)}`);
  return outcome;
}

function productArtifact(candidate) {
  return {
    format: "npm_package_tgz",
    artifactPath: candidate.artifactPath,
    expectedArtifactDigest: candidate.descriptor.distributionArtifactDigest,
    expectedProductContentDigest: candidate.descriptor.productContentDigest
  };
}

function resolutionRequest(candidate) {
  return {
    requirements: [
      {
        productId: candidate.descriptor.productId,
        versionConstraint: candidate.descriptor.version,
        requiredContractRefs: candidate.descriptor.contractRefs,
        requiredCapabilityRefs: candidate.descriptor.capabilityRefs
      }
    ],
    candidateDescriptors: [candidate.descriptor]
  };
}

function requestContract(candidate) {
  const row = candidate.publication.publication.catalog.rows.find(
    (candidateRow) =>
      candidateRow.contractId === CONSENSUS_REQUEST_SCHEMA_REF
  );
  assert.notEqual(row?.assetLocator, null);
  assert.notEqual(row?.assetLocator, undefined);
  return row.assetLocator;
}

function digest(character) {
  return `sha256:${character.repeat(64)}`;
}

function consensusRequest(scenario, maxRounds) {
  const subject = {
    kind: "ticket_review_subject",
    ticketRef: `ticket://a5/packed/${scenario}`,
    claimRefs: ["claim://a5/shared-release-claim"],
    statement: `Review the ${scenario} release claim.`
  };
  return {
    kind: "consensus_request",
    requestRef: `consensus-request://a5/packed/${scenario}`,
    subjectRef: `subject://a5/packed/${scenario}`,
    subject,
    subjectDigest: digestCanonicalIJson(subject),
    submitterRef: "actor://a5/packed/submitter",
    submitterWorkerRef: "worker://a5/packed/submitter",
    panelRef: "panel://a5/packed/codex-claude",
    policyRef: "policy://a5/packed/exact-claim-agreement",
    roundIndex: 1,
    maxRounds,
    reviewerProfiles: [
      {
        kind: "consensus_reviewer_profile",
        profileRef: "reviewer-profile://a5/packed/codex",
        profileConfigDigest: digest("a"),
        workerRef: "worker://a5/packed/codex",
        resultSchemaRef: CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF
      },
      {
        kind: "consensus_reviewer_profile",
        profileRef: "reviewer-profile://a5/packed/claude",
        profileConfigDigest: digest("b"),
        workerRef: "worker://a5/packed/claude",
        resultSchemaRef: CONSENSUS_REVIEWER_RESPONSE_SCHEMA_REF
      }
    ]
  };
}

async function readCalls(callLogPath) {
  try {
    return (await readFile(callLogPath, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

class PackedCli {
  constructor(input) {
    this.cliPath = input.cliPath;
    this.contractCatalogPath = input.contractCatalogPath;
    this.cwd = input.cwd;
    this.environment = input.environment;
    this.sequence = 0;
  }

  async operation(words, request, options = {}) {
    this.sequence += 1;
    const requestPath = path.join(
      this.cwd,
      `request-${String(this.sequence).padStart(3, "0")}.json`
    );
    await writeFile(requestPath, canonicalizeIJson(request), "utf8");
    const args = [
      ...words,
      "--request",
      requestPath,
      "--contract-catalog",
      this.contractCatalogPath
    ];
    if (options.workspaceRoot !== undefined) {
      args.push("--workspace-root", options.workspaceRoot);
    }
    if (options.actorRef !== undefined) {
      args.push("--actor", options.actorRef);
    }
    const result = spawnSync(this.cliPath, args, {
      cwd: this.cwd,
      env: this.environment,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024
    });
    const admittedStatuses = options.admittedStatuses ?? [0];
    assert.equal(
      admittedStatuses.includes(result.status),
      true,
      `${options.label ?? words.join(" ")} exited ${String(result.status)}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
    assert.equal(result.stderr, "", `${words.join(" ")} wrote stderr`);
    return JSON.parse(result.stdout);
  }
}

async function prepareWorkspace(input) {
  const workspace = assertAccepted(
    await input.cli.operation(
      ["workspace", "create"],
      {
        targetRoot: input.workspaceRoot,
        authorityMode: "clean_no_project_authority"
      },
      {
        workspaceRoot: input.workspaceRoot,
        actorRef: "actor://a5/packed/workspace"
      }
    ),
    "workspace.create"
  ).value;
  assertAccepted(
    await input.cli.operation(
      ["workspace", "open"],
      {
        targetRoot: input.workspaceRoot,
        expectedWorkspaceSchemaVersion: 1
      },
      { workspaceRoot: input.workspaceRoot }
    ),
    "workspace.open"
  );
  const binding = assertAccepted(
    await input.cli.operation(
      ["catalog", "bind"],
      {
        workspaceId: workspace.workspaceId,
        workspaceManifestDigest: digestCanonicalIJson(workspace),
        resolvedLock: input.lock,
        installedProductRecords: [input.installed],
        mutableStateRoots: null
      },
      {
        workspaceRoot: input.workspaceRoot,
        actorRef: "actor://a5/packed/binder"
      }
    ),
    "catalog.bind"
  ).value;
  const admission = assertAccepted(
    await input.cli.operation(
      ["catalog", "admit"],
      {
        workspaceId: workspace.workspaceId,
        bindingId: binding.bindingId,
        resolvedLockId: input.lock.lockId,
        productSetDigest: binding.productSetDigest
      },
      {
        workspaceRoot: input.workspaceRoot,
        actorRef: "actor://a5/packed/catalog"
      }
    ),
    "catalog.admit"
  ).value;
  const description = assertAccepted(
    await input.cli.operation(
      ["catalog", "describe"],
      {
        workspaceId: workspace.workspaceId,
        catalogId: admission.catalogId,
        handle: CONSENSUS_HANDLE,
        allowedHandles: null,
        sessionView: null
      },
      { workspaceRoot: input.workspaceRoot }
    ),
    "catalog.describe Consensus"
  ).value;
  assert.equal(description.canonicalHandle, CONSENSUS_HANDLE);
  assert.equal(description.callable, true);
  assert.equal(
    description.declarationRef,
    "graph-function://abg/consensus/submitter-reviewer-rounds"
  );
  const view = assertAccepted(
    await input.cli.operation(
      ["catalog", "allow"],
      {
        workspaceId: workspace.workspaceId,
        catalogId: admission.catalogId,
        handles: [CONSENSUS_HANDLE]
      },
      { workspaceRoot: input.workspaceRoot }
    ),
    "catalog.allow Consensus"
  ).value;
  return { admission, binding, description, view, workspace };
}

async function invokeConsensus(input) {
  const request = consensusRequest(input.scenario, input.maxRounds);
  const invoked = assertAccepted(
    await input.cli.operation(
      ["catalog", "invoke"],
      {
        workspaceId: input.runtime.workspace.workspaceId,
        bindingId: input.runtime.binding.bindingId,
        resolvedLockId: input.lock.lockId,
        catalogId: input.runtime.admission.catalogId,
        catalogVersion: input.runtime.admission.catalogVersion,
        catalogDigest: input.runtime.admission.catalogDigest,
        allowedHandles: null,
        sessionView: input.runtime.view,
        graphFunctionHandle: CONSENSUS_HANDLE,
        interfaceRef: input.runtime.description.interfaceRef,
        inputId: `input://a5/packed/${input.scenario}`,
        inputSchemaId: input.contract.schemaId,
        inputSchemaVersion: input.contract.schemaVersion,
        inputSchemaDigest: input.contract.digest,
        input: request,
        requiredCapabilityRefs: [INVOKE_CAPABILITY],
        actorRef: request.submitterRef,
        transportSteering: {
          agent: "generic",
          model: null,
          profile: "local-spawn",
          timeoutMs: 30_000
        }
      },
      {
        workspaceRoot: input.workspaceRoot,
        actorRef: request.submitterRef,
        label: `catalog.invoke ${input.scenario}`,
        admittedStatuses: [0, 3]
      }
    ),
    `catalog.invoke ${input.scenario}`
  );
  const graphCallId = invoked.value.graphCallId;
  const result = assertAccepted(
    await input.cli.operation(
      ["result"],
      {
        workspaceId: input.runtime.workspace.workspaceId,
        graphCallId
      },
      { workspaceRoot: input.workspaceRoot }
    ),
    `read.result ${input.scenario}`
  );
  const replay = assertAccepted(
    await input.cli.operation(
      ["replay"],
      {
        workspaceId: input.runtime.workspace.workspaceId,
        subject: { kind: "graph_call", graphCallId },
        fromOrdinal: 0,
        limit: 1000
      },
      { workspaceRoot: input.workspaceRoot }
    ),
    `read.replay ${input.scenario}`
  );
  assert.deepEqual(result.value, invoked.value);
  assert.equal(replay.value.subject.graphCallId, graphCallId);
  assert.equal(
    replay.value.events.filter(
      (event) =>
        event.kind === "graph_function_selected" &&
        event.selectedEntryRef === CONSENSUS_HANDLE
    ).length,
    1
  );
  return {
    invoked,
    replay,
    result,
    workspaceId: input.runtime.workspace.workspaceId,
    workspaceRoot: input.workspaceRoot
  };
}

function consensusArtifact(report) {
  const body = report.result.value.admittedArtifact?.body;
  assert.equal(body?.actor, "worker://abg/consensus-panel");
  assert.equal(body?.fulfillment_assessments?.[0]?.id, "consensus_round_admitted");
  assert.equal(body?.consensus_result?.kind, "consensus_result");
  return body.consensus_result;
}

function replayConsensusArtifacts(report) {
  return report.replay.value.events
    .filter(
      (event) =>
        event.kind === "actor_result_artifact_observed" &&
        typeof event.artifactContentExcerpt === "string"
    )
    .map((event) => JSON.parse(event.artifactContentExcerpt))
    .filter((body) => body?.consensus_result?.kind === "consensus_result")
    .map((body) => body.consensus_result);
}

function actorAttemptIndexes(report) {
  return report.replay.value.events
    .filter((event) => event.kind === "actor_invocation_started")
    .map((event) => event.attemptIndex);
}

function terminalEvents(report) {
  return report.replay.value.events.filter(
    (event) => event.kind === "terminal_reached"
  );
}

function closureEventSummary(report) {
  return report.replay.value.events
    .filter((event) =>
      /assurance|closure|continuation|evaluation|fp_/u.test(event.kind)
    )
    .map((event) => ({
      kind: event.kind,
      closureDecision: event.closureDecision,
      closeDisposition: event.closeDisposition,
      executiveDisposition: event.executiveDisposition,
      projectionRef: event.projectionRef,
      reason: event.reason,
      rowRefs: event.rowRefs,
      status: event.status,
      terminalKind: event.terminalKind,
      vectorIndex: event.vectorIndex
    }));
}

test("A5 packed abg.cli invokes SYSTEM Consensus over named, alternate, and temporary workspace roots", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-a5-packed-consensus-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const candidate = await prepareT223AbgCandidate({
    outputRoot: path.join(root, "candidate")
  });
  const consumerRoot = path.join(root, "consumer");
  await mkdir(consumerRoot, { recursive: true });
  await cp(transportFixture, path.join(consumerRoot, "fp-transport"));
  await chmod(path.join(consumerRoot, "fp-transport"), 0o755);
  const install = spawnSync(
    "npm",
    [
      "install",
      "--save-exact",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      candidate.artifactPath
    ],
    { cwd: consumerRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  assert.equal(
    install.status,
    0,
    `packed candidate install failed\n${install.stdout}\n${install.stderr}`
  );
  const installedPackageRoot = path.join(
    consumerRoot,
    "node_modules/@abiogenesis/typescript-tenant"
  );
  const callLogPath = path.join(root, "consensus-calls.jsonl");
  const cli = new PackedCli({
    cliPath: path.join(consumerRoot, "node_modules/.bin/abg.cli"),
    contractCatalogPath: path.join(
      installedPackageRoot,
      "contracts/public-contract-catalog.json"
    ),
    cwd: consumerRoot,
    environment: {
      ...process.env,
      PATH: `${consumerRoot}${path.delimiter}${path.join(
        consumerRoot,
        "node_modules/.bin"
      )}${path.delimiter}${process.env.PATH ?? ""}`,
      A5_CONSENSUS_CALL_LOG: callLogPath
    }
  });
  const lock = assertAccepted(
    await cli.operation(["catalog", "resolve"], resolutionRequest(candidate)),
    "catalog.resolve"
  ).value;
  const verified = assertAccepted(
    await cli.operation(["catalog", "verify"], {
      artifact: productArtifact(candidate),
      descriptor: candidate.descriptor,
      contributionManifest: candidate.contribution,
      resolvedLock: lock
    }),
    "catalog.verify"
  ).value;
  const installed = assertAccepted(
    await cli.operation(
      ["install"],
      {
        verifiedArtifact: verified,
        toolchainRoot: path.join(root, "toolchain"),
        workspaceBindingRef: null
      },
      { actorRef: "actor://a5/packed/installer" }
    ),
    "install"
  ).value;
  const callerTemporaryRoot = await mkdtemp(
    path.join(root, "caller-created-workspace-")
  );
  await rm(callerTemporaryRoot, { recursive: true, force: true });
  const applications = [
    {
      application: "named",
      scenario: "converge",
      maxRounds: 2,
      workspaceRoot: path.join(root, "workspaces/named")
    },
    {
      application: "alternate",
      scenario: "dispute",
      maxRounds: 2,
      workspaceRoot: path.join(root, "alternate/location")
    },
    {
      application: "caller_temporary",
      scenario: "escalate",
      maxRounds: 1,
      workspaceRoot: callerTemporaryRoot
    }
  ];
  const reports = {};
  for (const application of applications) {
    const runtime = await prepareWorkspace({
      cli,
      installed,
      lock,
      workspaceRoot: application.workspaceRoot
    });
    reports[application.application] = await invokeConsensus({
      cli,
      contract: requestContract(candidate),
      lock,
      runtime,
      scenario: application.scenario,
      maxRounds: application.maxRounds,
      workspaceRoot: application.workspaceRoot
    });
  }

  const namedArtifact = consensusArtifact(reports.named);
  assert.equal(reports.named.invoked.disposition, "converged");
  assert.equal(namedArtifact.finalOutcome, "closed_done");
  assert.equal(namedArtifact.rulingKind, "decision_row");
  assert.equal(namedArtifact.nextAction, "admit_ruling");
  assert.deepEqual(
    namedArtifact.rounds.map((round) => round.decision.outcome),
    ["closed_done"]
  );
  assert.deepEqual(
    namedArtifact.rounds[0].decision.reviewerProfileRefs,
    [
      "reviewer-profile://a5/packed/codex",
      "reviewer-profile://a5/packed/claude"
    ]
  );
  assert.equal(namedArtifact.rounds[0].decision.decisionRef.length > 0, true);
  assert.equal(namedArtifact.rounds[0].decision.evidenceRefs.length >= 6, true);
  assert.equal(
    namedArtifact.rounds[0].responses.every(
      (response) =>
        response.ruling.kind === "consensus_ruling_proposal" &&
        response.ruling.rulingKind === "decision_row"
    ),
    true
  );
  assert.equal(
    namedArtifact.rounds[0].request.subject.kind,
    "ticket_review_subject"
  );
  assert.deepEqual(actorAttemptIndexes(reports.named), [1]);
  assert.equal(
    terminalEvents(reports.named).at(-1)?.terminalKind,
    "converged",
    JSON.stringify({
      disposition: reports.named.invoked.disposition,
      terminalReason: reports.named.result.value.result.terminalReason,
      terminalEvents: terminalEvents(reports.named),
      closureEvents: closureEventSummary(reports.named)
    })
  );

  const alternateArtifact = consensusArtifact(reports.alternate);
  assert.equal(reports.alternate.invoked.disposition, "converged");
  assert.equal(alternateArtifact.finalOutcome, "closed_done");
  assert.equal(alternateArtifact.rulingKind, "decision_row");
  assert.equal(alternateArtifact.nextAction, "admit_ruling");
  assert.deepEqual(
    alternateArtifact.rounds.map((round) => round.decision.outcome),
    ["closed_done"]
  );
  assert.equal(alternateArtifact.rounds[0].request.roundIndex, 2);
  assert.equal(alternateArtifact.priorRoundRefs.length, 1);
  assert.equal(alternateArtifact.rounds[0].submitterResponse, null);
  const alternateAttemptArtifacts = replayConsensusArtifacts(
    reports.alternate
  );
  assert.equal(alternateAttemptArtifacts.length, 2);
  assert.equal(
    alternateAttemptArtifacts[0].finalOutcome,
    "recurse_next_round"
  );
  assert.equal(
    alternateAttemptArtifacts[0].nextAction,
    "verify_next_round"
  );
  assert.equal(
    alternateAttemptArtifacts[0].rounds[0].submitterResponse.kind,
    "consensus_submitter_response"
  );
  assert.equal(
    alternateAttemptArtifacts[0].rounds[0].submitterResponse.submitterWorkerRef,
    "worker://a5/packed/submitter"
  );
  assert.deepEqual(
    alternateAttemptArtifacts[0].rounds[0].submitterResponse.addressedFindingRefs,
    alternateAttemptArtifacts[0].rounds[0].decision.dissentFindingRefs
  );
  assert.deepEqual(alternateArtifact.priorRoundRefs, [
    alternateAttemptArtifacts[0].resultDigest
  ]);
  assert.deepEqual(actorAttemptIndexes(reports.alternate), [1, 2]);
  const repeatedCallOpenFacts = reports.alternate.replay.value.events.filter(
    (event) => event.kind === "graph_call_opened"
  );
  assert.equal(repeatedCallOpenFacts.length, 2);
  assert.deepEqual(
    [...new Set(repeatedCallOpenFacts.map((event) => event.graphCallId))],
    [reports.alternate.result.value.graphCallId]
  );
  assert.equal(terminalEvents(reports.alternate).at(-1)?.terminalKind, "converged");

  const temporaryArtifact = consensusArtifact(reports.caller_temporary);
  assert.equal(temporaryArtifact.finalOutcome, "escalate_fh");
  assert.equal(temporaryArtifact.rulingKind, null);
  assert.equal(temporaryArtifact.nextAction, "fh_adjudicate");
  assert.deepEqual(
    temporaryArtifact.rounds.map((round) => round.decision.outcome),
    ["escalate_fh"]
  );
  assert.equal(
    reports.caller_temporary.invoked.disposition,
    "human_gate_required",
    JSON.stringify({
      closureEvents: closureEventSummary(reports.caller_temporary),
      terminalEvents: terminalEvents(reports.caller_temporary)
    })
  );
  assert.deepEqual(actorAttemptIndexes(reports.caller_temporary), [1]);
  assert.equal(
    terminalEvents(reports.caller_temporary).at(-1)?.terminalKind,
    "human_gate_required"
  );

  const calls = await readCalls(callLogPath);
  assert.equal(calls.length, 9);
  assert.deepEqual(
    applications.map((application) => ({
      application: application.application,
      root: reports[application.application].workspaceRoot
    })),
    applications.map(({ application, workspaceRoot }) => ({
      application,
      root: workspaceRoot
    }))
  );
  assert.equal(
    new Set(
      applications.map(
        (application) => reports[application.application].workspaceId
      )
    ).size,
    3
  );
  assert.deepEqual(
    [...new Set(calls.filter((call) => call.role === "reviewer").map((call) => call.profile))].sort(),
    [
      "reviewer-profile://a5/packed/claude",
      "reviewer-profile://a5/packed/codex"
    ]
  );
  const disputeCalls = calls.filter((call) =>
    call.subject.includes("dispute")
  );
  assert.equal(disputeCalls.length, 5);
  assert.equal(
    disputeCalls.filter((call) => call.role === "submitter").length,
    1
  );
  assert.equal(
    disputeCalls.filter(
      (call) =>
        call.role === "reviewer" &&
        call.round === 2 &&
        call.hasPriorSubmitterResponse
    ).length,
    2
  );

  const malformedRuntime = await prepareWorkspace({
    cli,
    installed,
    lock,
    workspaceRoot: path.join(root, "workspaces/malformed")
  });
  const malformed = await invokeConsensus({
    cli,
    contract: requestContract(candidate),
    lock,
    runtime: malformedRuntime,
    scenario: "malformed",
    maxRounds: 1,
    workspaceRoot: path.join(root, "workspaces/malformed")
  });
  assert.equal(malformed.invoked.disposition, "blocked");
  assert.match(
    malformed.result.value.result.terminalReason,
    /retry_exhausted/u
  );
  assert.equal(malformed.result.value.admittedArtifact, undefined);
  const malformedActorClosures = malformed.replay.value.events.filter(
    (event) => event.kind === "actor_invocation_closed"
  );
  const failedActorClosures = malformedActorClosures.filter(
    (event) => event.closureStatus !== "completed"
  );
  assert.equal(failedActorClosures.length > 0, true);
  assert.equal(
    failedActorClosures.every(
      (event) => event.closureFailureClass === "contract_failure"
    ),
    true
  );
  const malformedAttemptIndexes = actorAttemptIndexes(malformed);
  assert.deepEqual(malformedAttemptIndexes, [1, 2, 3, 4]);
  assert.equal(
    malformed.replay.value.events.some(
      (event) => event.kind === "actor_result_artifact_observed"
    ),
    false
  );
  assert.equal(replayConsensusArtifacts(malformed).length, 0);
  assert.equal(terminalEvents(malformed).at(-1)?.terminalKind, "gap_stop");
  const allCalls = await readCalls(callLogPath);
  const expectedMalformedCalls =
    malformedAttemptIndexes.length *
    consensusRequest("malformed", 1).reviewerProfiles.length;
  assert.equal(
    allCalls.filter((call) => call.subject.includes("malformed")).length,
    expectedMalformedCalls
  );
  assert.equal(allCalls.length, calls.length + expectedMalformedCalls);
});
