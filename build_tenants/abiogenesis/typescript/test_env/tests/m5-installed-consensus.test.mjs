import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import {
  applyInstalledTranscriptPrefix,
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
    "  if (mode === 'malformed_finding') candidate.unadmitted = true;",
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
      ".ai-workspace/tickets/completed/T-276-prove-installed-consensus-workspace-scenarios.md",
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
      basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
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
      let respondedAuthority = held.result.continuationAuthority;
      if (workspace.label === "existing") {
        const substitutedDecision = {
          ...decision,
          unresolvedResultRef: `${decision.unresolvedResultRef}/substituted`,
        };
        const substitutedResponseInvocation = publicInvocation(
          "abg.operation.interaction.respond",
          "answer_escalation",
          "invocation://t276/consensus/unresolved/respond-substituted",
          {
            actorRef,
            capabilityRef: basis.gtl.CONSENSUS_IDS.actorCapabilityRef,
            continuationAuthority: respondedAuthority,
            continuationRef: held.continuationRef,
            response: substitutedDecision,
          },
        );
        await writeFile(
          continuationTranscriptPath,
          `${JSON.stringify(substitutedResponseInvocation)}\n`,
          "utf8",
        );
        const substitutedResponseRun = await runInstalledCli(harness, {
          transcriptPath: continuationTranscriptPath,
        });
        assert.equal(substitutedResponseRun.exitCode, 2);
        assert.equal(
          substitutedResponseRun.outcomes.at(-1).disposition,
          "refused",
        );
        respondedAuthority =
          substitutedResponseRun.outcomes.at(-1).continuationAuthority;
        assert.equal(
          respondedAuthority.kind,
          "public_continuation_authority",
        );
      }
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

test("M5 starts canonical Consensus through the installed One Surface GTL Program", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const basis = await consensusBasis(harness, "one-surface", 2);
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    "m5-consensus-one-surface",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef: basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      eventLogFile: "one-surface.events.jsonl",
      authorizedActorRef: "actor://abiogenesis/t276/trusted-developer",
    },
  );
  const {
    operationContext,
    outcomes,
    publicApi,
  } = await applyInstalledTranscriptPrefix(harness, scenario);
  assert.equal(
    outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(outcomes),
  );
  const workspaceBinding = outcomes[2].result;
  assert.equal(
    typeof workspaceBinding.bindingId,
    "string",
    JSON.stringify(outcomes[2]),
  );
  assert.match(workspaceBinding.bindingId, /^workspace-binding:\/\//u);
  assert.match(workspaceBinding.bindingDigest, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(
    basis.publication.programs.find(
      (program) =>
        program.programRef === basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
    ).actionCatalog.kind,
    "action_catalog",
  );
  const oneSurfaceProgram = basis.publication.programs.find(
    (program) =>
      program.programRef === basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
  );
  const observation = basis.gtl.constructConsensusObservationSnapshot({
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    actionCatalog: oneSurfaceProgram.actionCatalog,
    consensusInvocation: basis.input,
  });
  const start = structuredClone(scenario.transcript.at(-1));
  start.variant = "start";
  start.payload = {
    installInvocationRef: scenario.refs.install,
    workspaceBindingInvocationRef: scenario.refs.bind,
    catalogViewInvocationRef: scenario.refs.view,
    programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
    actorRef: "actor://abiogenesis/t276/trusted-developer",
    input: observation,
    eventLogPath: scenario.eventLogPath,
    rootMode: "supervised",
    scope: "program",
    target: basis.gtl.CONSENSUS_IDS.oneSurfaceStartRef,
    until: "converged",
    startRef: basis.gtl.CONSENSUS_IDS.oneSurfaceStartRef,
  };

  const priorCommand = process.env.ABG_TS_CLAUDE_COMMAND;
  const priorMode = process.env.ABG_CONSENSUS_TEST_MODE;
  let completed;
  try {
    process.env.ABG_TS_CLAUDE_COMMAND = command;
    process.env.ABG_CONSENSUS_TEST_MODE = "agreement";
    completed = await publicApi.applyRootPublicInvocation(
      operationContext,
      start,
    );
  } finally {
    publicApi.closeRootOperationContext(operationContext);
    if (priorCommand === undefined) {
      delete process.env.ABG_TS_CLAUDE_COMMAND;
    } else {
      process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
    }
    if (priorMode === undefined) {
      delete process.env.ABG_CONSENSUS_TEST_MODE;
    } else {
      process.env.ABG_CONSENSUS_TEST_MODE = priorMode;
    }
  }

  const events = await eventsAt(scenario.eventLogPath);
  assert.equal(
    completed.disposition,
    "succeeded",
    `${JSON.stringify(completed)}\n${JSON.stringify(diagnosticSummary(events))}\n${JSON.stringify(diagnosticTail(events))}`,
  );
  assert.equal(completed.replayAgreement, true);
  assert.equal(completed.result.kind, "next_action_projection");
  assert.equal(completed.result.disposition, "converged");

  const intent = events.find(
    (event) => event.kind === "construction_intent_selected",
  );
  const childOpen = events.find(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.payload.graphFunctionRef ===
        basis.gtl.CONSENSUS_IDS.graphFunctionRef,
  );
  const childResult = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef ===
        basis.gtl.CONSENSUS_IDS.resultContractRef,
  );
  const delta = events.find(
    (event) => event.kind === "construction_delta_observed",
  );
  const refresh = events.find(
    (event) =>
      event.kind === "c_call_opened" &&
      event.payload.programLocusRef ===
        basis.gtl.CONSENSUS_IDS.refreshModelLocusRef,
  );
  const runClosed = events.find((event) => event.kind === "run_closed");

  assert.ok(intent);
  assert.ok(childOpen);
  assert.ok(childResult);
  assert.ok(delta);
  assert.ok(refresh);
  assert.ok(runClosed);
  assert.equal(
    intent.payload.constructionIntent.actionKind,
    "invoke_graph_function",
  );
  assert.equal(
    intent.payload.constructionIntent.selectedGraphFunctionRef,
    basis.gtl.CONSENSUS_IDS.graphFunctionRef,
  );
  assert.equal(
    intent.payload.constructionIntent.targetInputRef,
    basis.input.invocationRef,
  );
  assert.equal(
    delta.payload.edgeFulfillmentLedger.rows[0].evidenceRefs[0],
    childResult.payload.resultRef,
  );
  assert.equal(
    completed.result.edgeClosureDecisionRef,
    delta.payload.edgeClosureDecisionRef,
  );
  assert.ok(intent.admissionOrdinal < childOpen.admissionOrdinal);
  assert.ok(childOpen.admissionOrdinal < childResult.admissionOrdinal);
  assert.ok(childResult.admissionOrdinal < delta.admissionOrdinal);
  assert.ok(delta.admissionOrdinal < refresh.admissionOrdinal);
  assert.ok(refresh.admissionOrdinal < runClosed.admissionOrdinal);
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 Consensus refuses malformed and cross-basis Product values before a Run opens", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const basis = await consensusBasis(harness, "invalid-values", 2);
  harness.rootPublication = basis.publication;
  const allowlist = basis.publication.contributions.map((row) => row.handle);
  const mutations = [{
    label: "subject-extra-field",
    mutate(input) {
      input.subject.unadmitted = true;
    },
  }, {
    label: "duplicate-panel-profile",
    mutate(input) {
      input.panel.profiles[1] = structuredClone(input.panel.profiles[0]);
    },
  }, {
    label: "invalid-round-policy",
    mutate(input) {
      input.policy.roundBudget = 0;
    },
  }, {
    label: "cross-basis-panel",
    mutate(input) {
      input.subject.panelRef = `${input.subject.panelRef}/substituted`;
    },
  }];
  for (const mutation of mutations) {
    const input = structuredClone(basis.input);
    mutation.mutate(input);
    const scenario = await buildRootCliScenario(
      harness,
      `m5-consensus-${mutation.label}`,
      (payload) => payload,
      {
        programRef: basis.gtl.CONSENSUS_IDS.programRef,
        graphFunctionRef: basis.gtl.CONSENSUS_IDS.graphFunctionRef,
        allowlist,
        input,
        eventLogFile: `${mutation.label}.events.jsonl`,
      },
    );
    const run = await runInstalledCli(harness, scenario);
    assert.equal(run.exitCode, 2, run.stdout);
    assert.equal(run.outcomes.at(-1).disposition, "refused");
    assert.equal(run.outcomes.at(-1).runId, null);
  }
});

test("M5 Consensus refuses malformed attributed reviewer output before successful foldback or closure", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const basis = await consensusBasis(harness, "malformed-reviewer", 2);
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    "m5-consensus-malformed-reviewer",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.programRef,
      graphFunctionRef: basis.gtl.CONSENSUS_IDS.graphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      eventLogFile: "malformed-reviewer.events.jsonl",
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: "malformed_finding",
    },
  });
  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(
    run.outcomes.at(-1).disposition,
    "failed",
    JSON.stringify(run.outcomes.at(-1)),
  );
  const events = await eventsAt(scenario.eventLogPath);
  const fanOutCompletion = events.find(
    (event) => event.kind === "fan_out_completion_admitted",
  );
  assert.equal(fanOutCompletion?.payload.completionKind, "partial_stop");
  assert.equal(
    events.some(
      (event) =>
        event.kind === "child_foldback_admitted" &&
        event.payload.childDisposition === "closed",
    ),
    false,
  );
  assert.equal(events.some((event) => event.kind === "run_closed"), false);
  assert.equal(events.at(-1).kind, "runtime_failure_observed");
});
