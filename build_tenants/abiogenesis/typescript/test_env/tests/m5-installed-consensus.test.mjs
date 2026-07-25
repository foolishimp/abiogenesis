import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import {
  buildRootCliScenario,
  installedCliPackageRoot,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const packageRoot = new URL("../..", import.meta.url).pathname;

function digest(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function publicInvocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId: "correlation://t276/installed-consensus",
    payload,
  };
}

async function installConsensusWorker(harness) {
  const bin = join(harness.scratch, "consensus-worker");
  await mkdir(bin, { recursive: true });
  const command = join(bin, "claude");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const taskLine = prompt.split(/\\r?\\n/u).find((line) => line.startsWith('Task: '));",
    "  const task = taskLine === undefined ? null : JSON.parse(taskLine.slice('Task: '.length));",
    "  const mode = process.env.ABG_CONSENSUS_TEST_MODE ?? 'agreement';",
    "  const revise = mode === 'unresolved' || (mode === 'dispute_then_agree' && task?.roundOrdinal === 1);",
    "  const candidate = {",
    "    kind: 'consensus_reviewer_candidate',",
    "    schemaVersion: '5.0.0',",
    "    recommendation: revise ? 'revise' : 'accept',",
    "    findings: revise ? [{",
    "      findingContractRef: 'contract://abg/consensus/material-dispute@5',",
    "      findingPayloadRef: `finding-payload://${task.profile.profileRef}/round-${task.roundOrdinal}`",
    "    }] : [],",
    "    residualRefs: revise ? [`residual://${task.profile.profileRef}/round-${task.roundOrdinal}`] : []",
    "  };",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(candidate) }));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function consensusBasis(harness, label, roundBudget) {
  const installedRoot = installedCliPackageRoot(harness);
  const gtl = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/gtl/index.js")).href}?consensus=${label}`
  );
  const publication = gtl.constructConsensusModulePublication({
    productId: harness.candidateBasis.productId,
    artifactDigest: harness.candidateBasis.artifactDigest,
    productContentDigest: harness.candidateBasis.productContentDigest,
    productManifestDigest: harness.candidateBasis.manifestDigest,
    packageName: harness.candidateBasis.packageName,
    packageVersion: harness.candidateBasis.packageVersion,
  });
  const profiles = ["submitter-review", "independent-review"].map(
    (name, ordinal) => gtl.constructConsensusReviewerProfile({
      profileRef: `reviewer-profile://developer/${name}`,
      roleContractRef: `contract://developer/reviewer-role/${name}@1`,
      instructionContractRef:
        "contract://abg/consensus/reviewer-instruction@5",
      resultContractRef: gtl.CONSENSUS_IDS.findingsContractRef,
      capabilityRefs: [
        "capability://developer/read-ticket",
        `capability://developer/review-role/${ordinal}`,
      ],
      actorRef: `actor://developer/reviewer/${name}`,
      workerBindingRef: `worker-binding://developer/reviewer/${name}`,
    }),
  );
  const panel = gtl.constructConsensusPanel(
    "panel://developer/submitter-independent@1",
    profiles,
  );
  const policy = gtl.constructConsensusRoundPolicy({
    policyRef: `policy://developer/consensus/${label}@1`,
    roundBudget,
    convergenceRuleRef: "rule://abg/consensus/exact-agreement@5",
    disagreementRuleRef: "rule://abg/consensus/material-dispute@5",
    escalationRuleRef: "rule://abg/consensus/unresolved-to-fh@5",
    foldbackContractRef: "contract://abg/consensus/round-foldback@5",
  });
  const ticketRef = "ticket://abiogenesis/T-276";
  const ticketBytes = await readFile(
    resolve(
      packageRoot,
      "../../..",
      ".ai-workspace/tickets/active/T-276-prove-installed-consensus-workspace-scenarios.md",
    ),
  );
  const ticketDigest = digest(ticketBytes);
  const subject = gtl.constructConsensusSubject({
    subjectContractRef: "contract://stdo/ticket@2",
    subjectRef: ticketRef,
    subjectDigest: ticketDigest,
    submittingActorRef: "actor://developer/consensus-submitter",
    panelRef: panel.panelRef,
    roundPolicyRef: policy.policyRef,
    workspaceRef: `workspace://developer/consensus/${label}`,
    ticketRef,
    ticketDigest,
  });
  const input = gtl.constructConsensusInvocation({
    invocationRef: `consensus-invocation://developer/${label}`,
    subject,
    panel,
    policy,
    transportLane: "closed_prompt_proof",
  });
  return { gtl, input, publication };
}

async function eventsAt(path) {
  return (await readFile(path, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
}

function diagnosticTail(events) {
  return events.slice(-12).map((event) => ({
    kind: event.kind,
    graphFunctionRef: event.graphFunctionRef,
    frameId: event.frameId,
    payload: {
      cCallRef: event.payload?.cCallRef,
      contractRef: event.payload?.contractRef,
      diagnosticRef: event.payload?.diagnosticRef,
      failureRef: event.payload?.failureRef,
      graphFunctionRef: event.payload?.graphFunctionRef,
      resultContractRef: event.payload?.resultContractRef,
      resultRef: event.payload?.resultRef,
    },
  }));
}

function diagnosticSummary(events) {
  const counts = {};
  for (const event of events) {
    counts[event.kind] = (counts[event.kind] ?? 0) + 1;
  }
  return {
    counts,
    graphCalls: events
      .filter((event) => event.kind === "graph_call_opened")
      .map((event) => event.graphFunctionRef),
    fanOutCompletions: events
      .filter((event) => event.kind === "fan_out_completion_admitted")
      .map((event) => ({
        completionKind: event.payload?.completionKind,
        outputVectorRef: event.payload?.outputVectorRef,
        taskCount: event.payload?.taskRows?.length,
      })),
    runtimeFailures: events
      .filter((event) => event.kind === "runtime_failure_observed")
      .map((event) => event.payload),
  };
}

function assertTicketConsensusProjection(gtl, result, replayRef) {
  assert.equal(typeof replayRef, "string");
  const projection = gtl.projectTicketConsensus(result, replayRef);
  assert.equal(gtl.isTicketConsensusProjection(projection), true);
  assert.equal(projection.ticketRef, "ticket://abiogenesis/T-276");
  assert.equal(projection.ticketRef, result.subjectRef);
  assert.equal(projection.ticketDigest, result.subjectDigest);
  assert.equal(projection.resultRef, result.resultRef);
  assert.equal(projection.replayRef, replayRef);
  assert.deepEqual(projection.roundRefs, result.roundRefs);
  assert.deepEqual(projection.findingSetRefs, result.findingSetRefs);
  assert.deepEqual(projection.rulings, result.rulings);
  assert.deepEqual(projection.terminalOutcome, result.terminalOutcome);
  assert.deepEqual(projection.evidenceRefs, result.evidenceRefs);
}

const consensusScenarios = [{
  label: "agreement",
  roundBudget: 2,
  expectedOutcome: "closed_done",
  expectedClassification: "unanimous_agreement",
  expectedRounds: 1,
}, {
  label: "dispute_then_agree",
  roundBudget: 3,
  expectedOutcome: "closed_done",
  expectedClassification: "partial_agreement_with_dissent",
  expectedRounds: 2,
}, {
  label: "unresolved",
  roundBudget: 2,
  expectedOutcome: "escalate_fh",
  expectedClassification: "unresolved_disagreement",
  expectedRounds: 2,
}];

const workspaceApplications = [{
  label: "existing",
  preexisting: true,
}, {
  label: "alternate",
  preexisting: true,
}, {
  label: "temporary",
  preexisting: false,
}];

for (const workspace of workspaceApplications) {
  for (const scenario of consensusScenarios) {
    test(`M5 installed Consensus reaches ${scenario.label} in the ${workspace.label} workspace`, async (context) => {
    const harness = await setupInstalledCliHarness(context, packageRoot);
    const command = await installConsensusWorker(harness);
    const workspaceRoot = join(
      harness.scratch,
      "workspace-applications",
      workspace.label,
    );
    if (workspace.preexisting) {
      await mkdir(workspaceRoot, { recursive: true });
      await writeFile(
        join(workspaceRoot, ".workspace-identity"),
        `${workspace.label}\n`,
        "utf8",
      );
    }
    const basis = await consensusBasis(
      harness,
      `${workspace.label}-${scenario.label}`,
      scenario.roundBudget,
    );
    harness.rootPublication = basis.publication;
    const allowlist = [
      basis.gtl.CONSENSUS_IDS.handle,
      basis.gtl.CONSENSUS_IDS.roundLoopGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.roundGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.reviewerGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.reducerGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.projectorGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.escalationGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.escalationFinalizerGraphFunctionRef,
    ];
    const installed = await buildRootCliScenario(
      harness,
      `m5-consensus-${workspace.label}-${scenario.label}`,
      (payload) => payload,
      {
        programRef: basis.gtl.CONSENSUS_IDS.programRef,
        graphFunctionRef: basis.gtl.CONSENSUS_IDS.graphFunctionRef,
        allowlist,
        input: basis.input,
        workspaceId:
          `workspace://developer/consensus/${workspace.label}`,
        workspaceRoot,
        eventLogFile: `${scenario.label}.events.jsonl`,
      },
    );
    const run = await runInstalledCli(harness, installed, {
      environment: {
        ABG_TS_CLAUDE_COMMAND: command,
        ABG_CONSENSUS_TEST_MODE: scenario.label,
      },
    });
    let events = [];
    try {
      events = await eventsAt(installed.eventLogPath);
    } catch {
      // Admission failures can lawfully occur before an event sink exists.
    }
    assert.equal(
      run.exitCode,
      0,
      `${JSON.stringify(run.outcomes.at(-1))}\n${run.stderr}\n${JSON.stringify(diagnosticSummary(events))}\n${JSON.stringify(diagnosticTail(events))}`,
    );
    assert.equal(
      run.outcomes.every((outcome) => outcome.disposition === "succeeded"),
      true,
      JSON.stringify(run.outcomes),
    );
    const outcome = run.outcomes.at(-1);
    assert.equal(outcome.replayAgreement, true);
    assert.equal(outcome.result.kind, "consensus_result");
    assert.equal(
      outcome.result.terminalOutcome.outcome,
      scenario.expectedOutcome,
    );
    assert.equal(
      outcome.result.classification,
      scenario.expectedClassification,
    );
    assert.equal(outcome.result.roundRefs.length, scenario.expectedRounds);
    assert.equal(
      outcome.result.findingSetRefs.length,
      scenario.label === "agreement"
        ? 2
        : scenario.expectedRounds * 2,
    );
    assertTicketConsensusProjection(
      basis.gtl,
      outcome.result,
      outcome.replayRef,
    );
    assert.equal(
      events.filter(
        (event) =>
          event.kind === "actor_process_started" &&
          event.graphFunctionRef ===
            basis.gtl.CONSENSUS_IDS.reviewerGraphFunctionRef,
      ).length,
      scenario.expectedRounds * 2,
    );
    assert.equal(
      events.filter(
        (event) =>
          event.kind === "fan_out_completion_admitted" &&
          event.payload.completionKind === "complete_vector",
      ).length,
      scenario.expectedRounds,
    );
    assert.equal(
      events.some(
        (event) =>
          event.kind === "graph_call_opened" &&
          event.graphFunctionRef ===
            basis.gtl.CONSENSUS_IDS.roundGraphFunctionRef,
      ),
      true,
    );
    assert.equal(events.at(-1).kind, "run_closed");

    if (scenario.label === "unresolved") {
      const escalation = await buildRootCliScenario(
        harness,
        `m5-consensus-${workspace.label}-unresolved-fh`,
        (payload) => payload,
        {
          programRef: basis.gtl.CONSENSUS_IDS.programRef,
          graphFunctionRef:
            basis.gtl.CONSENSUS_IDS.escalationGraphFunctionRef,
          allowlist,
          input: outcome.result,
          workspaceId:
            `workspace://developer/consensus/${workspace.label}`,
          workspaceRoot,
          eventLogFile: "unresolved-fh.events.jsonl",
        },
      );
      const heldRun = await runInstalledCli(harness, escalation);
      assert.equal(
        heldRun.exitCode,
        0,
        `${heldRun.stderr}\n${JSON.stringify(heldRun.outcomes.at(-1))}`,
      );
      assert.equal(
        heldRun.outcomes.slice(0, -1).every(
          (row) => row.disposition === "succeeded",
        ),
        true,
        JSON.stringify(heldRun.outcomes),
      );
      const held = heldRun.outcomes.at(-1);
      assert.equal(held.disposition, "held", JSON.stringify(held));
      assert.equal(held.continuationStatus, "open");

      const product = await import(
        `${pathToFileURL(join(
          installedCliPackageRoot(harness),
          "build/code/src/product/index.js",
        )).href}?consensus-escalation=unresolved`,
      );
      const actorRef =
        escalation.transcript.at(-1).payload.actorRef;
      const decision = {
        kind: "consensus_escalation_decision",
        schemaVersion: "5.0.0",
        unresolvedResult: outcome.result,
        unresolvedResultRef: outcome.result.resultRef,
        unresolvedResultDigest: product.sha256Canonical(outcome.result),
        decision: "accept_with_dissent",
        humanActorRef: actorRef,
        rationaleRef: "rationale://abiogenesis/t276/accept-with-dissent",
      };
      const continuationTranscriptPath = join(
        harness.scratch,
        "m5-consensus-unresolved-fh-continuation.jsonl",
      );
      const respondedAuthority = held.result.continuationAuthority;
      const responseInvocation = publicInvocation(
        "abg.operation.interaction.respond",
        "answer_escalation",
        "invocation://t276/consensus/unresolved/respond",
        {
          actorRef,
          capabilityRef: basis.gtl.CONSENSUS_IDS.actorCapabilityRef,
          continuationAuthority: respondedAuthority,
          continuationRef: held.continuationRef,
          response: decision,
        },
      );
      await writeFile(
        continuationTranscriptPath,
        `${JSON.stringify(responseInvocation)}\n`,
        "utf8",
      );
      const responseRun = await runInstalledCli(harness, {
        transcriptPath: continuationTranscriptPath,
      });
      assert.equal(
        responseRun.exitCode,
        0,
        `${responseRun.stderr}\n${JSON.stringify(responseRun.outcomes.at(-1))}`,
      );
      const responded = responseRun.outcomes.at(-1);
      assert.equal(responded.disposition, "succeeded", JSON.stringify(responded));
      assert.equal(responded.continuationStatus, "responded");

      const continueInvocation = publicInvocation(
        "abg.operation.run.continue",
        "current_intent",
        "invocation://t276/consensus/unresolved/continue",
        {
          actorRef,
          capabilityRef: basis.gtl.CONSENSUS_IDS.actorCapabilityRef,
          continuationAuthority: responded.result.continuationAuthority,
          continuationRef: held.continuationRef,
        },
      );
      await writeFile(
        continuationTranscriptPath,
        `${JSON.stringify(continueInvocation)}\n`,
        "utf8",
      );
      const continuedRun = await runInstalledCli(harness, {
        transcriptPath: continuationTranscriptPath,
      });
      assert.equal(
        continuedRun.exitCode,
        0,
        `${continuedRun.stderr}\n${JSON.stringify(continuedRun.outcomes.at(-1))}`,
      );
      const completed = continuedRun.outcomes.at(-1);
      assert.equal(completed.disposition, "succeeded", JSON.stringify(completed));
      assert.equal(completed.continuationStatus, "resolved");
      assert.equal(completed.result.kind, "consensus_result");
      assert.equal(
        completed.result.classification,
        "partial_agreement_with_dissent",
      );
      assert.equal(completed.result.terminalOutcome.outcome, "closed_done");
      assert.equal(completed.result.subjectRef, outcome.result.subjectRef);
      assert.equal(completed.result.subjectDigest, outcome.result.subjectDigest);
      assert.equal(completed.result.panelRef, outcome.result.panelRef);
      assert.equal(completed.result.policyRef, outcome.result.policyRef);
      assert.deepEqual(completed.result.roundRefs, outcome.result.roundRefs);
      assert.deepEqual(
        completed.result.findingSetRefs,
        outcome.result.findingSetRefs,
      );
      assertTicketConsensusProjection(
        basis.gtl,
        completed.result,
        completed.replayRef,
      );
      const escalationEvents = await eventsAt(escalation.eventLogPath);
      assert.deepEqual(
        escalationEvents
          .filter((event) => event.aggregateType === "continuation")
          .map((event) => event.kind),
        [
          "fh_interaction_opened",
          "fh_interaction_responded",
          "fh_interaction_resume_admitted",
        ],
      );
      assert.equal(escalationEvents.at(-1).kind, "run_closed");
    }
  });
  }
}

test("M5 Consensus publication validates its canonical handle and ordinary callable body", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const basis = await consensusBasis(harness, "publication", 2);
  const rootContribution = basis.publication.contributions.find(
    (row) => row.handle === basis.gtl.CONSENSUS_IDS.handle,
  );
  assert.equal(rootContribution.kind, "graph_function");
  assert.equal(
    rootContribution.declarationOrContractRef,
    basis.gtl.CONSENSUS_IDS.graphFunctionRef,
  );
  assert.equal(
    basis.publication.programs[0].publicAssetTargets[0].handle,
    basis.gtl.CONSENSUS_IDS.handle,
  );
  assert.equal(
    basis.publication.graphFunctions.some((graphFunction) =>
      JSON.stringify(graphFunction.template).includes("compiled")
    ),
    false,
  );
});
