import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

async function readRunProjection(
  harness,
  projectionAuthority,
  variant,
  targetRef,
  label,
) {
  const transcriptPath = join(
    harness.scratch,
    `m5-consensus-${label}-${variant}-read.jsonl`,
  );
  await writeFile(
    transcriptPath,
    `${JSON.stringify(publicInvocation(
      "abg.operation.project.read",
      variant,
      `invocation://t276/consensus/${label}/read-${variant}`,
      {
        projectionAuthority,
        targetRef,
      },
    ))}\n`,
    "utf8",
  );
  return runInstalledCli(harness, { transcriptPath });
}

function roundDecisionFromHeldOutcome(held, ids) {
  const authority = held.result?.continuationAuthority;
  assert.equal(authority?.kind, "public_continuation_authority");
  assert.equal(
    authority.heldGraph.graphFunctionRef,
    ids.escalationGraphFunctionRef,
  );
  assert.deepEqual(
    authority.parentSuspensions.map((row) => row.kind),
    ["held_recursion_suspension", "held_workflow_suspension"],
  );
  const suspension = authority.parentSuspensions.find(
    (row) => row.kind === "held_recursion_suspension",
  );
  assert.ok(suspension, "held Consensus must retain its recursion suspension");
  assert.equal(
    suspension.parentGraph.graphFunctionRef,
    ids.graphFunctionRef,
  );
  assert.equal(
    suspension.sourceCursor.currentNodeRef,
    ids.finalizationLoopNodeRef,
  );
  assert.equal(
    suspension.sourceCursor.attempt,
    1,
    "the finalization application starts a fresh C-call attempt after round recursion",
  );
  assert.equal(
    authority.parentSuspensions[1].parentGraph.graphFunctionRef,
    ids.oneSurfaceGraphFunctionRef,
  );
  assert.equal(suspension.childInput?.kind, "consensus_resolution");
  assert.equal(suspension.childInput?.resolutionKind, "round_decision");
  return suspension.childInput;
}

async function completeHeldConsensus(
  harness,
  basis,
  installed,
  held,
  label,
  decisionKind = "accept_with_dissent",
  proveRefusals = false,
) {
  const actorRef = installed.transcript.at(-1).payload.actorRef;
  const roundDecision = roundDecisionFromHeldOutcome(
    held,
    basis.gtl.CONSENSUS_IDS,
  );
  assert.equal(
    roundDecision.result.classification,
    "unresolved_disagreement",
  );
  assert.equal(
    roundDecision.outcome.outcome,
    "escalate_fh",
  );
  const decisionBody = {
    kind: "consensus_escalation_decision",
    schemaVersion: "5.0.0",
    roundDecision,
    decision: decisionKind,
    humanActorRef: actorRef,
    rationaleRef:
      `rationale://abiogenesis/t276/${decisionKind}`,
  };
  const decisionDigest = basis.product.sha256Canonical(decisionBody);
  const decision = {
    ...decisionBody,
    decisionRef:
      `consensus-escalation-decision://abg/${
        decisionDigest.slice("sha256:".length)
      }`,
    decisionDigest,
  };
  const continuationTranscriptPath = join(
    harness.scratch,
    `m5-consensus-${label}-continuation.jsonl`,
  );
  let continuationAuthority = held.result.continuationAuthority;

  if (proveRefusals) {
    const invalidResponses = [{
      label: "wrong-decision",
      response: {
        ...decision,
        decisionRef: `${decision.decisionRef}/substituted`,
      },
    }, {
      label: "wrong-human-actor",
      response: {
        ...decision,
        humanActorRef: "actor://developer/consensus/substituted-human",
      },
    }];
    for (const invalid of invalidResponses) {
      const respondedCountBefore = (
        await eventsAt(installed.eventLogPath)
      ).filter((event) => event.kind === "fh_interaction_responded").length;
      await writeFile(
        continuationTranscriptPath,
        `${JSON.stringify(publicInvocation(
          "abg.operation.interaction.respond",
          "answer_escalation",
          `invocation://t276/consensus/${label}/respond-${invalid.label}`,
          {
            actorRef,
            capabilityRef: basis.gtl.CONSENSUS_IDS.actorCapabilityRef,
            continuationAuthority,
            continuationRef: held.continuationRef,
            response: invalid.response,
          },
        ))}\n`,
        "utf8",
      );
      const refused = await runInstalledCli(harness, {
        transcriptPath: continuationTranscriptPath,
      });
      assert.equal(refused.exitCode, 2, refused.stdout);
      assert.equal(refused.outcomes.at(-1).disposition, "refused");
      continuationAuthority =
        refused.outcomes.at(-1).continuationAuthority;
      assert.equal(
        continuationAuthority.kind,
        "public_continuation_authority",
      );
      const eventsAfter = await eventsAt(installed.eventLogPath);
      assert.equal(
        eventsAfter.filter(
          (event) => event.kind === "fh_interaction_responded",
        ).length,
        respondedCountBefore,
      );
    }
  }

  await writeFile(
    continuationTranscriptPath,
    `${JSON.stringify(publicInvocation(
      "abg.operation.interaction.respond",
      "answer_escalation",
      `invocation://t276/consensus/${label}/respond`,
      {
        actorRef,
        capabilityRef: basis.gtl.CONSENSUS_IDS.actorCapabilityRef,
        continuationAuthority,
        continuationRef: held.continuationRef,
        response: decision,
      },
    ))}\n`,
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

  await writeFile(
    continuationTranscriptPath,
    `${JSON.stringify(publicInvocation(
      "abg.operation.run.continue",
      "current_intent",
      `invocation://t276/consensus/${label}/continue`,
      {
        actorRef,
        capabilityRef: basis.gtl.CONSENSUS_IDS.actorCapabilityRef,
        continuationAuthority: responded.result.continuationAuthority,
        continuationRef: held.continuationRef,
      },
    ))}\n`,
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
  assert.equal(completed.runId, held.runId);
  assert.equal(completed.result.kind, "next_action_projection");
  assert.equal(completed.result.disposition, "converged");
  assert.equal(
    completed.projectionAuthority.kind,
    "public_run_projection_authority",
  );

  const events = await eventsAt(installed.eventLogPath);
  const admittedResults = [
    ...new Map(
      events
        .filter(
          (event) =>
            event.kind === "c_call_result_admitted" &&
            event.payload?.contractRef ===
              basis.gtl.CONSENSUS_IDS.resultCandidateContractRef &&
            event.payload?.value?.kind === "consensus_result_candidate",
        )
        .map((event) => [event.payload.resultRef, event]),
    ).values(),
  ];
  assert.equal(
    admittedResults.length,
    1,
    "one held Consensus Run must admit exactly one final result",
  );
  const consensusResult = admittedResults[0].payload.value;
  assert.equal(
    consensusResult.classification,
    decisionKind === "accept_with_dissent"
      ? "partial_agreement_with_dissent"
      : "unresolved_disagreement",
  );
  assert.equal(
    consensusResult.terminalOutcome.outcome,
    "escalate_fh",
    "F_H finalization must preserve immutable round truth",
  );
  assert.equal(
    events.filter(
      (event) => event.kind === "run_closed" && event.runId === held.runId,
    ).length,
    1,
  );
  assert.deepEqual(
    events
      .filter((event) => event.aggregateType === "continuation")
      .map((event) => event.kind),
    [
      "fh_interaction_opened",
      "fh_interaction_responded",
      "fh_interaction_resume_admitted",
    ],
  );
  return {
    completed,
    consensusResultEvent: admittedResults[0],
    events,
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
    "  const exactSubject = task?.subjectMaterialization?.content;",
    "  const exactInstruction = task?.instruction?.instructionText;",
    "  const profileRole = task?.profile?.roleContractRef;",
    "  if (typeof exactSubject !== 'string' || !exactSubject.includes('T-276')) process.exit(41);",
    "  if (typeof exactInstruction !== 'string' || !exactInstruction.includes(profileRole)) process.exit(42);",
    "  if (!prompt.includes(exactSubject) || !prompt.includes(exactInstruction)) process.exit(43);",
    "  const mode = process.env.ABG_CONSENSUS_TEST_MODE ?? 'agreement';",
    "  if (mode === 'transport_nonzero') process.exit(47);",
    "  if (mode === 'transport_timeout') { setInterval(() => {}, 1_000); return; }",
    "  if (mode === 'no_output') {",
    "    console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "    return;",
    "  }",
    "  if (task?.kind === 'consensus_submitter_task') {",
    "    const findingRefs = task.findingsVector.members.flatMap((member) => member.value.findings.map((finding) => finding.findingRef));",
    "    const disposition = findingRefs.length === 0 ? 'acknowledge' : mode === 'unresolved' ? 'dispute_findings' : 'address_findings';",
    "    const candidate = {",
    "      kind: 'consensus_submitter_response_candidate',",
    "      schemaVersion: '5.0.0',",
    "      disposition,",
    "      responseText: disposition === 'acknowledge' ? 'No admitted semantic findings require a response.' : disposition === 'address_findings' ? 'The exact admitted findings have been addressed for reviewer reconsideration.' : 'The submitter disputes the exact admitted findings.',",
    "      addressedFindingRefs: disposition === 'address_findings' ? findingRefs : [],",
    "      residualFindingRefs: disposition === 'dispute_findings' ? findingRefs : []",
    "    };",
    "    if (mode === 'malformed_submitter') candidate.unadmitted = true;",
    "    console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "    console.log(JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(candidate) }));",
    "    return;",
    "  }",
    "  const priorResponse = task?.priorSubmitterResponses?.at(-1);",
    "  const responseBound = task?.roundOrdinal === 2 && priorResponse?.roundOrdinal === 1 && priorResponse?.roundRef === task?.priorRoundRefs?.[0] && priorResponse?.disposition === 'address_findings' && priorResponse?.residualFindingRefs?.length === 0;",
    "  const revise = mode === 'unresolved' || (mode === 'dispute_then_agree' && !responseBound);",
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
    "  if (mode === 'valid_after_sigterm') {",
    "    process.on('SIGTERM', () => {",
    "      const transcript = [",
    "        JSON.stringify({ type: 'system', subtype: 'init' }),",
    "        JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(candidate) })",
    "      ].join('\\n');",
    "      process.stdout.write(`${transcript}\\n`, () => process.exit(0));",
    "    });",
    "    setInterval(() => {}, 1_000);",
    "    return;",
    "  }",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(candidate) }));",
    "  if (mode === 'valid_then_timeout') { setInterval(() => {}, 1_000); return; }",
    "  if (mode === 'valid_then_nonzero') process.exitCode = 47;",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

async function consensusBasis(
  harness,
  label,
  roundBudget,
  workspaceRef,
  profileNames = ["submitter-review", "independent-review"],
  acceptedFindingRulingKind = null,
) {
  const installedRoot = installedCliPackageRoot(harness);
  const gtl = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/gtl/index.js")).href}?consensus=${label}`
  );
  const product = await import(
    `${pathToFileURL(join(installedRoot, "build/code/src/product/index.js")).href}?consensus=${label}`
  );
  const publication = gtl.constructConsensusModulePublication({
    productId: harness.candidateBasis.productId,
    artifactDigest: harness.candidateBasis.artifactDigest,
    productContentDigest: harness.candidateBasis.productContentDigest,
    productManifestDigest: harness.candidateBasis.manifestDigest,
    packageName: harness.candidateBasis.packageName,
    packageVersion: harness.candidateBasis.packageVersion,
  });
  const instructions = profileNames.map((name) => {
    const roleContractRef =
      `contract://developer/reviewer-role/${name}@1`;
    return gtl.constructConsensusReviewerInstruction({
      instructionContractRef:
        `contract://developer/consensus/reviewer-instruction/${name}@1`,
      roleContractRef,
      instructionText:
        `Review the exact materialized ticket under ${roleContractRef}.`,
      responseSchema: gtl.CONSENSUS_REVIEWER_RESPONSE_SCHEMA,
    });
  });
  const profiles = instructions.map(
    (instruction, ordinal) => gtl.constructConsensusReviewerProfile({
      profileRef:
        `reviewer-profile://developer/${profileNames[ordinal]}`,
      roleContractRef: instruction.roleContractRef,
      instructionContractRef: instruction.instructionContractRef,
      instructionDigest: instruction.instructionDigest,
      resultContractRef: gtl.CONSENSUS_IDS.findingsContractRef,
      capabilityRefs: [
        "capability://developer/read-ticket",
        `capability://developer/review-role/${ordinal}`,
      ],
      actorRef:
        `actor://developer/reviewer/${profileNames[ordinal]}`,
      workerBindingRef:
        `worker-binding://developer/reviewer/${profileNames[ordinal]}`,
    }),
  );
  const panel = gtl.constructConsensusPanel(
    "panel://developer/submitter-independent@1",
    profiles,
  );
  const submitterInstruction = gtl.constructConsensusSubmitterInstruction({
    instructionContractRef:
      "contract://developer/consensus/submitter-instruction@1",
    roleContractRef: "contract://developer/submitter-role@1",
    instructionText:
      "Respond to every exact admitted reviewer finding under contract://developer/submitter-role@1.",
    responseSchema: gtl.CONSENSUS_SUBMITTER_RESPONSE_SCHEMA,
  });
  const submitterProfile = gtl.constructConsensusSubmitterProfile({
    profileRef: "submitter-profile://developer/consensus-submitter",
    roleContractRef: submitterInstruction.roleContractRef,
    instructionContractRef: submitterInstruction.instructionContractRef,
    instructionDigest: submitterInstruction.instructionDigest,
    resultContractRef: gtl.CONSENSUS_IDS.submitterResponseContractRef,
    capabilityRefs: ["capability://developer/consensus-submit-response"],
    actorRef: "actor://developer/consensus-submitter",
    workerBindingRef:
      "worker-binding://developer/consensus-submitter",
  });
  const rulingOverlay = acceptedFindingRulingKind === null
    ? null
    : gtl.constructConsensusRulingOverlay({
        overlayRef:
          `${gtl.CONSENSUS_IDS.rulingOverlayCatalogHandle}/${label}`,
        programRef: gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
        graphFunctionRef:
          gtl.CONSENSUS_IDS.roundReducerGraphFunctionRef,
        policyContractRef: gtl.CONSENSUS_IDS.policyContractRef,
        disagreementRuleRef: gtl.CONSENSUS_IDS.disagreementRuleRef,
        acceptedFindingRulingKind,
      });
  const policy = gtl.constructConsensusRoundPolicy({
    policyRef: `policy://developer/consensus/${label}@1`,
    roundBudget,
    convergenceRuleRef: gtl.CONSENSUS_IDS.convergenceRuleRef,
    disagreementRuleRef: gtl.CONSENSUS_IDS.disagreementRuleRef,
    rulingOverlay,
    escalationRuleRef: gtl.CONSENSUS_IDS.escalationRuleRef,
    foldbackContractRef: gtl.CONSENSUS_IDS.foldbackContractRef,
  });
  const ticketRef = "ticket://abiogenesis/T-276";
  const ticketContent = await readFile(
    resolve(
      packageRoot,
      "../../..",
      ".ai-workspace/tickets/completed/T-276-prove-installed-consensus-workspace-scenarios.md",
    ),
    "utf8",
  );
  const subjectMaterialization =
    gtl.constructConsensusSubjectMaterialization({
      subjectContractRef: "contract://stdo/ticket@2",
      subjectRef: ticketRef,
      content: ticketContent,
    });
  const ticketDigest = subjectMaterialization.contentDigest;
  const subject = gtl.constructConsensusSubject({
    subjectContractRef: "contract://stdo/ticket@2",
    subjectRef: ticketRef,
    subjectDigest: ticketDigest,
    submittingActorRef: "actor://developer/consensus-submitter",
    panelRef: panel.panelRef,
    roundPolicyRef: policy.policyRef,
    workspaceRef,
    ticketRef,
    ticketDigest,
  });
  const input = gtl.constructConsensusInvocation({
    invocationRef: `consensus-invocation://developer/${label}`,
    subject,
    subjectMaterialization,
    panel,
    instructions,
    submitterProfile,
    submitterInstruction,
    policy,
    transportLane: "closed_prompt_proof",
  });
  return {
    gtl,
    input,
    product,
    publication,
    catalogApplications:
      gtl.consensusCatalogApplicationBindings(input),
  };
}

function expectedWorkspaceBinding(basis, harness, scenario) {
  const publicContracts = harness.candidateManifest.publicContractCatalog.rows;
  const publicContractRefs = publicContracts.map(
    (row) => row.contractId,
  ).sort();
  const publicCapabilityRefs = [
    ...new Set(
      publicContracts.flatMap(
        (row) => row.capabilityIdentities ?? [],
      ),
    ),
  ].sort();
  const verified = {
    kind: "verified_product_artifact",
    schemaVersion: "5.0.0",
    disposition: "verified",
    artifactRef: harness.artifactRef,
    artifactDigest: harness.candidateBasis.artifactDigest,
    artifactByteLength: 1,
    productId: harness.candidateBasis.productId,
    packageName: harness.candidateBasis.packageName,
    packageVersion: harness.candidateBasis.packageVersion,
    productContentDigest: harness.candidateBasis.productContentDigest,
    manifestDigest: harness.candidateBasis.manifestDigest,
    descriptorRef: harness.candidateManifest.descriptorRef,
    publisherNamespace: harness.candidateManifest.publisherNamespace,
    contributionManifestRef:
      harness.candidateManifest.contributionManifestRef,
    contributionManifestDigest:
      harness.candidateManifest.contributionManifestDigest,
    contributionManifest: harness.candidateManifest.contributionManifest,
    compatibilityRefs: harness.candidateManifest.compatibilityRefs,
    declaredDependencies: harness.candidateManifest.declaredDependencies,
    provenanceRef: harness.candidateManifest.provenanceRef,
    declaredCapabilityRefs:
      harness.candidateManifest.declaredCapabilityRefs,
    catalogId: harness.candidateManifest.publicContractCatalog.catalogId,
    catalogDigest:
      harness.candidateManifest.publicContractCatalog.catalogDigest,
    publicContracts,
    publicContractRefs,
    publicCapabilityRefs,
    checkedPayloadFiles: harness.candidateManifest.productRelativeLocators.length,
  };
  const lock = basis.product.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock");
  const install = {
    kind: "product_install",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    installId:
      `product-install://${harness.candidateBasis.packageName}/${harness.candidateBasis.packageVersion}/${harness.candidateBasis.productContentDigest.slice("sha256:".length)}/${lock.lockDigest.slice("sha256:".length)}`,
    installedRoot: scenario.installedRoot,
    productId: harness.candidateBasis.productId,
    packageName: harness.candidateBasis.packageName,
    packageVersion: harness.candidateBasis.packageVersion,
    artifactDigest: harness.candidateBasis.artifactDigest,
    productContentDigest: harness.candidateBasis.productContentDigest,
    manifestDigest: harness.candidateBasis.manifestDigest,
    descriptorRef: harness.candidateManifest.descriptorRef,
    publisherNamespace: harness.candidateManifest.publisherNamespace,
    contributionManifestRef:
      harness.candidateManifest.contributionManifestRef,
    contributionManifestDigest:
      harness.candidateManifest.contributionManifestDigest,
    contributionManifest: harness.candidateManifest.contributionManifest,
    compatibilityRefs: harness.candidateManifest.compatibilityRefs,
    declaredDependencies: harness.candidateManifest.declaredDependencies,
    provenanceRef: harness.candidateManifest.provenanceRef,
    declaredCapabilityRefs:
      harness.candidateManifest.declaredCapabilityRefs,
    catalogId: harness.candidateManifest.publicContractCatalog.catalogId,
    catalogDigest:
      harness.candidateManifest.publicContractCatalog.catalogDigest,
    publicContracts,
    publicContractRefs,
    publicCapabilityRefs,
    resolvedLockId: lock.lockId,
    resolvedLockDigest: lock.lockDigest,
    admissionEventRef: "event://client/derived-install-basis",
  };
  const productSet = basis.product.constructProductSet([install], lock);
  assert.equal(productSet.kind, "product_set");
  const payload = scenario.transcript[3].payload;
  const authorityManifest = {
    workspaceId: payload.workspaceId,
    canonicalRoot: payload.canonicalRoot,
    authorityMode: "trusted_developer",
    authorizedActorRef: payload.authorizedActorRef,
  };
  const authority = basis.product.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: payload.authorityManifestRef,
    authorityManifestDigest:
      basis.product.sha256Canonical(authorityManifest),
  });
  assert.equal(authority.kind, "workspace_authority_basis");
  const binding = basis.product.constructWorkspaceBinding(
    authority,
    productSet,
    lock,
    payload.roots,
  );
  assert.equal(binding.kind, "workspace_binding_candidate");
  return binding;
}

async function selectConsensusThroughOneSurface(
  basis,
  harness,
  scenario,
  consensusInvocation = basis.input,
) {
  const program = basis.publication.programs.find(
    (candidate) =>
      candidate.programRef === basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
  );
  assert.ok(program?.actionCatalog);
  const workspaceBinding = expectedWorkspaceBinding(
    basis,
    harness,
    scenario,
  );
  const observation = basis.gtl.constructConsensusObservationSnapshot({
    workspaceBindingId: workspaceBinding.bindingId,
    workspaceBindingDigest: workspaceBinding.bindingDigest,
    actionCatalog: program.actionCatalog,
    consensusInvocation,
  });
  const start = scenario.transcript.at(-1);
  start.variant = "start";
  start.payload = {
    installInvocationRef: scenario.refs.install,
    workspaceBindingInvocationRef: scenario.refs.bind,
    catalogViewInvocationRef: scenario.refs.view,
    catalogApplicationInvocationRefs: scenario.refs.applications,
    programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
    actorRef: scenario.transcript[3].payload.authorizedActorRef,
    input: observation,
    eventLogPath: scenario.eventLogPath,
    rootMode: "supervised",
    scope: "program",
    target: basis.gtl.CONSENSUS_IDS.oneSurfaceStartRef,
    until: "converged",
    startRef: basis.gtl.CONSENSUS_IDS.oneSurfaceStartRef,
  };
  await writeFile(
    scenario.transcriptPath,
    `${scenario.transcript.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );
  return observation;
}

async function eventsAt(path) {
  return (await readFile(path, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
}

async function eventsAtIfPresent(path) {
  try {
    return await eventsAt(path);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
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

function assertTicketConsensusProjection(gtl, projection, result) {
  assert.equal(gtl.isTicketConsensusProjection(projection), true);
  assert.equal(projection.ticketRef, "ticket://abiogenesis/T-276");
  assert.equal(projection.ticketRef, result.subjectRef);
  assert.equal(projection.ticketDigest, result.subjectDigest);
  assert.equal(projection.resultRef, result.resultRef);
  assert.equal(projection.replayRef, result.replayRef);
  assert.deepEqual(projection.roundRefs, result.roundRefs);
  assert.deepEqual(projection.findingSetRefs, result.findingSetRefs);
  assert.deepEqual(
    projection.submitterResponseRefs,
    result.submitterResponseRefs,
  );
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
    const workspaceId =
      `workspace://developer/consensus/${workspace.label}`;
    const basis = await consensusBasis(
      harness,
      `${workspace.label}-${scenario.label}`,
      scenario.roundBudget,
      workspaceId,
    );
    harness.rootPublication = basis.publication;
    const allowlist = [
      basis.gtl.CONSENSUS_IDS.handle,
      basis.gtl.CONSENSUS_IDS.roundGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.reviewerGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.submitterGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.roundReducerGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.escalationGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.escalationFinalizerGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      basis.gtl.CONSENSUS_IDS.subjectCatalogHandle,
      basis.gtl.CONSENSUS_IDS.reviewerProfileCatalogHandle,
      basis.gtl.CONSENSUS_IDS.reviewerInstructionCatalogHandle,
      basis.gtl.CONSENSUS_IDS.submitterProfileCatalogHandle,
      basis.gtl.CONSENSUS_IDS.submitterInstructionCatalogHandle,
      basis.gtl.CONSENSUS_IDS.policyCatalogHandle,
      basis.gtl.CONSENSUS_IDS.rulingOverlayCatalogHandle,
    ];
    const installed = await buildRootCliScenario(
      harness,
      `m5-consensus-${workspace.label}-${scenario.label}`,
      (payload) => payload,
      {
        programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
        graphFunctionRef:
          basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
        allowlist,
        input: basis.input,
        catalogApplications: basis.catalogApplications,
        workspaceId,
        workspaceRoot,
        eventLogFile: `${scenario.label}.events.jsonl`,
      },
    );
    await selectConsensusThroughOneSurface(basis, harness, installed);
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
    let outcome = run.outcomes.at(-1);
    let childResultEvent;
    if (scenario.label === "unresolved") {
      assert.equal(
        run.outcomes.slice(0, -1).every(
          (row) => row.disposition === "succeeded",
        ),
        true,
        JSON.stringify(run.outcomes),
      );
      assert.equal(outcome.disposition, "held", JSON.stringify(outcome));
      assert.equal(outcome.continuationStatus, "open");
      assert.equal(
        events.some((event) => event.kind === "run_closed"),
        false,
        "an unresolved source must remain in the same open Run",
      );
      const completed = await completeHeldConsensus(
        harness,
        basis,
        installed,
        outcome,
        `${workspace.label}-unresolved`,
        "accept_with_dissent",
        workspace.label === "existing",
      );
      outcome = completed.completed;
      events = completed.events;
      childResultEvent = completed.consensusResultEvent;
    } else {
      assert.equal(
        run.outcomes.every(
          (row) => row.disposition === "succeeded",
        ),
        true,
        JSON.stringify(run.outcomes),
      );
      childResultEvent = events.find(
        (event) =>
          event.kind === "c_call_result_admitted" &&
          event.payload?.contractRef ===
            basis.gtl.CONSENSUS_IDS.resultCandidateContractRef &&
          event.payload?.value?.kind === "consensus_result_candidate",
      );
    }
    assert.equal(outcome.replayAgreement, true);
    assert.equal(outcome.result.kind, "next_action_projection");
    assert.equal(outcome.result.disposition, "converged");
    assert.ok(childResultEvent, JSON.stringify(diagnosticSummary(events)));
    const consensusResultCandidate = childResultEvent.payload.value;
    assert.equal(
      Object.hasOwn(consensusResultCandidate, "replayRef"),
      false,
      "the admitted Product result candidate must not fabricate future replay identity",
    );
    assert.equal(
      consensusResultCandidate.terminalOutcome.outcome,
      scenario.label === "unresolved" ? "escalate_fh" : "closed_done",
    );
    assert.equal(
      consensusResultCandidate.classification,
      scenario.label === "unresolved"
        ? "partial_agreement_with_dissent"
        : scenario.expectedClassification,
    );
    assert.equal(
      consensusResultCandidate.roundRefs.length,
      scenario.expectedRounds,
    );
    assert.equal(
      consensusResultCandidate.submitterResponseRefs.length,
      scenario.expectedRounds,
      "every admitted round must expose one exact submitter response",
    );
    assert.equal(
      consensusResultCandidate.findingSetRefs.length,
      scenario.label === "agreement"
        ? 2
        : scenario.expectedRounds * 2,
    );
    assert.equal(
      outcome.projectionAuthority.kind,
      "public_run_projection_authority",
    );
    const eventCountBeforeRead = events.length;
    const readLabel = `${workspace.label}-${scenario.label}`;
    if (workspace.label === "existing" && scenario.label === "agreement") {
      const substitutedAuthority = structuredClone(
        outcome.projectionAuthority,
      );
      substitutedAuthority.install.installId =
        `${substitutedAuthority.install.installId}/substituted`;
      const {
        authorityDigest: _authorityDigest,
        ...substitutedAuthorityBody
      } = substitutedAuthority;
      substitutedAuthority.authorityDigest =
        basis.product.sha256Canonical(substitutedAuthorityBody);
      const refusedRead = await readRunProjection(
        harness,
        substitutedAuthority,
        "result",
        childResultEvent.payload.resultRef,
        `${readLabel}-substituted-product`,
      );
      assert.equal(refusedRead.exitCode, 2, refusedRead.stdout);
      assert.equal(
        (await eventsAt(installed.eventLogPath)).length,
        eventCountBeforeRead,
        "substituted Product read authority must append no runtime truth",
      );
      const substitutedSemanticsAuthority = structuredClone(
        outcome.projectionAuthority,
      );
      substitutedSemanticsAuthority.productSemanticsBinding.modulePath =
        "build/code/src/product/forged_semantics.js";
      const {
        authorityDigest: _semanticsAuthorityDigest,
        ...substitutedSemanticsAuthorityBody
      } = substitutedSemanticsAuthority;
      substitutedSemanticsAuthority.authorityDigest =
        basis.product.sha256Canonical(substitutedSemanticsAuthorityBody);
      const refusedSemanticsRead = await readRunProjection(
        harness,
        substitutedSemanticsAuthority,
        "result",
        childResultEvent.payload.resultRef,
        `${readLabel}-substituted-semantics`,
      );
      assert.equal(
        refusedSemanticsRead.exitCode,
        2,
        refusedSemanticsRead.stdout,
      );
      assert.equal(
        (await eventsAt(installed.eventLogPath)).length,
        eventCountBeforeRead,
        "substituted Product semantics binding must append no runtime truth",
      );
      const substitutedCatalogAuthority = structuredClone(
        outcome.projectionAuthority,
      );
      substitutedCatalogAuthority.catalogAdmissionEventRef =
        `${substitutedCatalogAuthority.catalogAdmissionEventRef}/substituted`;
      const {
        authorityDigest: _catalogAuthorityDigest,
        ...substitutedCatalogAuthorityBody
      } = substitutedCatalogAuthority;
      substitutedCatalogAuthority.authorityDigest =
        basis.product.sha256Canonical(substitutedCatalogAuthorityBody);
      const refusedCatalogRead = await readRunProjection(
        harness,
        substitutedCatalogAuthority,
        "result",
        childResultEvent.payload.resultRef,
        `${readLabel}-substituted-catalog-admission`,
      );
      assert.equal(
        refusedCatalogRead.exitCode,
        2,
        refusedCatalogRead.stdout,
      );
      assert.equal(
        (await eventsAt(installed.eventLogPath)).length,
        eventCountBeforeRead,
        "substituted catalog admission reference must append no runtime truth",
      );
      const refusedUnknownRead = await readRunProjection(
        harness,
        outcome.projectionAuthority,
        "ticket.unknown",
        childResultEvent.payload.resultRef,
        `${readLabel}-unknown-variant`,
      );
      assert.equal(
        refusedUnknownRead.exitCode,
        2,
        refusedUnknownRead.stdout,
      );
      assert.equal(
        (await eventsAt(installed.eventLogPath)).length,
        eventCountBeforeRead,
        "a read outside the exact Product-declared roster must append no runtime truth",
      );
    }
    const resultRead = await readRunProjection(
        harness,
        outcome.projectionAuthority,
        "result",
        childResultEvent.payload.resultRef,
        readLabel,
      );
    assert.equal(
      resultRead.exitCode,
      0,
      `${resultRead.stderr}\n${resultRead.stdout}`,
    );
    const resultProjection = resultRead.outcomes.at(-1);
    assert.equal(resultProjection.disposition, "succeeded");
    assert.equal(resultProjection.result.kind, "public_result_projection");
    assert.equal(
      basis.gtl.isConsensusResult(resultProjection.result.value),
      true,
      JSON.stringify(resultProjection.result.value),
    );
    assert.equal(
      resultProjection.result.value.replayRef,
      resultProjection.replayRef,
    );
    assert.equal(
      resultProjection.result.value.resultRef,
      childResultEvent.payload.resultRef,
    );
    const ticketRead = await readRunProjection(
      harness,
      resultProjection.projectionAuthority,
      "ticket.consensus",
      childResultEvent.payload.resultRef,
      readLabel,
    );
    assert.equal(
      ticketRead.exitCode,
      0,
      `${ticketRead.stderr}\n${ticketRead.stdout}`,
    );
    const ticketProjection = ticketRead.outcomes.at(-1);
    assert.equal(ticketProjection.disposition, "succeeded");
    assert.equal(ticketProjection.result.kind, "public_result_projection");
    assert.equal(
      ticketProjection.result.resultContractRef,
      basis.gtl.CONSENSUS_IDS.ticketProjectionContractRef,
    );
    assertTicketConsensusProjection(
      basis.gtl,
      ticketProjection.result.value,
      resultProjection.result.value,
    );
    const replayRead = await readRunProjection(
      harness,
      resultProjection.projectionAuthority,
      "replay",
      outcome.runId,
      readLabel,
    );
    assert.equal(
      replayRead.exitCode,
      0,
      `${replayRead.stderr}\n${replayRead.stdout}`,
    );
    const replayProjection = replayRead.outcomes.at(-1);
    assert.equal(replayProjection.disposition, "succeeded");
    assert.equal(replayProjection.result.kind, "public_replay_projection");
    assert.equal(
      replayProjection.result.replayRef,
      resultProjection.result.value.replayRef,
    );
    assert.equal(
      replayProjection.result.eventCount,
      replayProjection.result.events.length,
    );
    const replayEventRefs = new Set(
      replayProjection.result.events.map((event) => event.eventId),
    );
    assert.equal(
      events
        .filter((event) => event.runId === outcome.runId)
        .every((event) => replayEventRefs.has(event.eventId)),
      true,
    );
    assert.equal(
      (await eventsAt(installed.eventLogPath)).length,
      eventCountBeforeRead,
      "project.read must not append runtime truth",
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
          event.kind === "actor_invocation_started" &&
          event.payload?.implementationRef ===
            basis.gtl.CONSENSUS_IDS.submitterImplementationRef,
      ).length,
      scenario.expectedRounds,
      "each complete findings vector must invoke one attributed submitter F_P leaf",
    );
    const admittedSubmitterResponses = [
      ...new Map(events
      .filter(
        (event) =>
          event.kind === "c_call_result_admitted" &&
          event.payload?.contractRef ===
            basis.gtl.CONSENSUS_IDS.submitterResponseContractRef &&
          event.payload?.value?.kind === "consensus_submitter_response",
      )
      .map((event) => [event.payload.value.responseRef, event.payload.value]))
        .values(),
    ];
    assert.equal(
      admittedSubmitterResponses.length,
      scenario.expectedRounds,
    );
    assert.deepEqual(
      admittedSubmitterResponses.map((response) => response.responseRef),
      consensusResultCandidate.submitterResponseRefs,
    );
    if (scenario.expectedRounds > 1) {
      const reconsideredFindings = events
        .filter(
          (event) =>
            event.kind === "c_call_result_admitted" &&
            event.payload?.contractRef ===
              basis.gtl.CONSENSUS_IDS.findingsContractRef &&
            event.payload?.value?.kind === "review_findings" &&
            event.payload.value.roundOrdinal === 2,
        )
        .map((event) => event.payload.value);
      const uniqueReconsideredFindings = [
        ...new Map(
          reconsideredFindings.map((findings) => [
            `${findings.profileRef}\0${findings.outputDigest}`,
            findings,
          ]),
        ).values(),
      ];
      assert.equal(
        uniqueReconsideredFindings.length,
        2,
        "round-two retry and child C-call truth must project two unique reviewer results",
      );
      assert.equal(
        uniqueReconsideredFindings.every(
          (findings) =>
            findings.task.priorSubmitterResponses.length === 1 &&
            findings.task.priorSubmitterResponses[0].responseRef ===
              admittedSubmitterResponses[0].responseRef &&
            findings.task.priorSubmitterResponses[0].outputDigest ===
              admittedSubmitterResponses[0].outputDigest,
        ),
        true,
        "round-two reviewers must receive the exact admitted round-one response",
      );
    }
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
  });
  }
}

test("M5 installed Consensus closes the same Run with an unresolved result when F_H rejects", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId = "workspace://developer/consensus/fh-reject";
  const basis = await consensusBasis(
    harness,
    "fh-reject",
    2,
    workspaceId,
  );
  harness.rootPublication = basis.publication;
  const installed = await buildRootCliScenario(
    harness,
    "m5-consensus-fh-reject",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: "fh-reject.events.jsonl",
      workspaceId,
    },
  );
  await selectConsensusThroughOneSurface(basis, harness, installed);
  const sourceRun = await runInstalledCli(harness, installed, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: "unresolved",
    },
  });
  assert.equal(sourceRun.exitCode, 0, sourceRun.stderr);
  const held = sourceRun.outcomes.at(-1);
  assert.equal(held.disposition, "held", JSON.stringify(held));
  const completed = await completeHeldConsensus(
    harness,
    basis,
    installed,
    held,
    "fh-reject",
    "reject",
  );
  assert.equal(
    completed.consensusResultEvent.payload.value.classification,
    "unresolved_disagreement",
  );
});

test("M5 Consensus publication validates its canonical handle and ordinary callable body", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const basis = await consensusBasis(
    harness,
    "publication",
    2,
    "workspace://developer/consensus/publication",
  );
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

test("M5 installed Consensus admits one explicit reviewer through the ordinary path", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId =
    "workspace://developer/consensus/single-reviewer";
  const basis = await consensusBasis(
    harness,
    "single-reviewer",
    1,
    workspaceId,
    ["single-reviewer"],
  );
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    "m5-consensus-single-reviewer",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: "single-reviewer.events.jsonl",
      workspaceId,
    },
  );
  await selectConsensusThroughOneSurface(basis, harness, scenario);
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: "agree",
    },
  });
  assert.equal(
    run.exitCode,
    0,
    `${run.stderr}\n${JSON.stringify(run.outcomes.at(-1))}`,
  );
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
  assert.equal(outcome.result.kind, "next_action_projection");
  assert.equal(outcome.result.disposition, "converged");
  const events = await eventsAtIfPresent(scenario.eventLogPath);
  const childResult = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload?.contractRef ===
        basis.gtl.CONSENSUS_IDS.resultCandidateContractRef &&
      event.payload?.value?.kind === "consensus_result_candidate",
  );
  assert.ok(childResult);
  assert.equal(
    childResult.payload.value.terminalOutcome.outcome,
    "closed_done",
  );
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "actor_process_started" &&
        event.graphFunctionRef ===
          basis.gtl.CONSENSUS_IDS.reviewerGraphFunctionRef,
    ).length,
    1,
  );
});

test("M5 starts canonical Consensus through the installed One Surface GTL Program", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId = "workspace://t286/m5-consensus-one-surface";
  const basis = await consensusBasis(
    harness,
    "one-surface",
    2,
    workspaceId,
  );
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
      catalogApplications: basis.catalogApplications,
      eventLogFile: "one-surface.events.jsonl",
      authorizedActorRef: "actor://abiogenesis/t276/trusted-developer",
      workspaceId,
    },
  );
  const {
    operationContext,
    outcomes,
    publicApi,
  } = await applyInstalledTranscriptPrefix(
    harness,
    scenario,
    scenario.transcript.length - 1,
  );
  assert.equal(
    outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(outcomes),
  );
  const workspaceBinding = outcomes[3].result;
  assert.equal(
    typeof workspaceBinding.bindingId,
    "string",
    JSON.stringify(outcomes[3]),
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
    catalogApplicationInvocationRefs: scenario.refs.applications,
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

  const events = await eventsAtIfPresent(scenario.eventLogPath);
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
        basis.gtl.CONSENSUS_IDS.resultCandidateContractRef,
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
  const childRead = await readRunProjection(
    harness,
    completed.projectionAuthority,
    "result",
    childResult.payload.resultRef,
    "one-surface-child",
  );
  assert.equal(
    childRead.exitCode,
    0,
    `${childRead.stderr}\n${childRead.stdout}`,
  );
  const childProjection = childRead.outcomes.at(-1);
  assert.equal(childProjection.disposition, "succeeded");
  assert.equal(childProjection.result.kind, "public_result_projection");
  assert.equal(
    basis.gtl.isConsensusResult(childProjection.result.value),
    true,
  );
  assert.equal(
    childProjection.result.value.replayRef,
    childProjection.replayRef,
  );
});

test("M5 rejects direct invocation of the supervised canonical Consensus root before a Run opens", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const workspaceId = "workspace://t286/m5-consensus-direct-refusal";
  const basis = await consensusBasis(
    harness,
    "direct-refusal",
    2,
    workspaceId,
  );
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    "m5-consensus-direct-refusal",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef: basis.gtl.CONSENSUS_IDS.graphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: "direct-refusal.events.jsonl",
      workspaceId,
    },
  );
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND:
        "__direct_supervised_consensus_must_not_reach_worker__",
    },
  });
  assert.equal(run.exitCode, 2, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.disposition, "refused", JSON.stringify(outcome));
  assert.equal(outcome.runId, null);
  const events = await eventsAtIfPresent(scenario.eventLogPath);
  assert.equal(
    events.some((event) =>
      event.kind === "invocation_admitted" ||
      event.kind === "run_segment_opened" ||
      event.kind === "actor_process_started"
    ),
    false,
  );
});

test("M5 Consensus refuses malformed and cross-basis Product values before a Run opens", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const workspaceId = "workspace://developer/consensus/invalid-values";
  const basis = await consensusBasis(
    harness,
    "invalid-values",
    2,
    workspaceId,
  );
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
  }, {
    label: "cross-basis-workspace",
    mutate(input) {
      input.subject.workspaceRef = `${input.subject.workspaceRef}/substituted`;
    },
  }, {
    label: "cross-paired-ticket-ref",
    mutate(input) {
      input.subject.ticketRef = `${input.subject.subjectRef}/substituted`;
    },
  }, {
    label: "cross-paired-ticket-digest",
    mutate(input) {
      input.subject.ticketDigest = `sha256:${"2".repeat(64)}`;
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
        programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
        graphFunctionRef:
          basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
        allowlist,
        input,
        catalogApplications: basis.catalogApplications,
        eventLogFile: `${mutation.label}.events.jsonl`,
        workspaceId,
      },
    );
    await selectConsensusThroughOneSurface(basis, harness, scenario);
    const malformedObservation = structuredClone(
      scenario.transcript.at(-1).payload.input,
    );
    malformedObservation.consensusInvocation = input;
    const {
      snapshotDigest: _snapshotDigest,
      snapshotRef: _snapshotRef,
      ...observationBody
    } = malformedObservation;
    malformedObservation.snapshotDigest =
      basis.product.sha256Canonical(observationBody);
    malformedObservation.snapshotRef =
      `observation-snapshot://product/${malformedObservation.snapshotDigest.slice("sha256:".length)}`;
    scenario.transcript.at(-1).payload.input = malformedObservation;
    await writeFile(
      scenario.transcriptPath,
      `${scenario.transcript.map((row) => JSON.stringify(row)).join("\n")}\n`,
      "utf8",
    );
    const run = await runInstalledCli(harness, scenario, {
      environment: {
        ABG_TS_CLAUDE_COMMAND:
          "__invalid_consensus_input_must_not_reach_worker__",
      },
    });
    assert.equal(run.exitCode, 2, run.stdout);
    assert.equal(
      run.outcomes.at(-1).disposition,
      "refused",
      `${mutation.label}: ${JSON.stringify(run.outcomes.at(-1))}`,
    );
    assert.equal(run.outcomes.at(-1).runId, null);
  }
});

test("M5 Consensus refuses uncataloged values and unapplied overlays before a Run opens", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const workspaceId =
    "workspace://developer/consensus/catalog-application-refusal";
  const basis = await consensusBasis(
    harness,
    "catalog-application-refusal",
    2,
    workspaceId,
  );
  harness.rootPublication = basis.publication;
  const allowlist = basis.publication.contributions.map((row) => row.handle);

  const substitutedProfile =
    basis.gtl.constructConsensusReviewerProfile({
      ...basis.input.panel.profiles[0],
      profileRef: "reviewer-profile://downstream/uncataloged",
    });
  const substitutedPanel = basis.gtl.constructConsensusPanel(
    basis.input.panel.panelRef,
    [
      substitutedProfile,
      ...basis.input.panel.profiles.slice(1),
    ],
  );
  const uncatalogedProfileInvocation =
    basis.gtl.constructConsensusInvocation({
      ...basis.input,
      panel: substitutedPanel,
    });

  const substitutedOverlay =
    basis.gtl.constructConsensusRulingOverlay({
      overlayRef: basis.gtl.CONSENSUS_IDS.rulingOverlayCatalogHandle,
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.roundReducerGraphFunctionRef,
      policyContractRef: basis.gtl.CONSENSUS_IDS.policyContractRef,
      disagreementRuleRef: basis.gtl.CONSENSUS_IDS.disagreementRuleRef,
      acceptedFindingRulingKind: "rejected_finding",
    });
  const substitutedPolicy =
    basis.gtl.constructConsensusRoundPolicy({
      ...basis.input.policy,
      rulingOverlay: substitutedOverlay,
    });
  const unappliedOverlayInvocation =
    basis.gtl.constructConsensusInvocation({
      ...basis.input,
      policy: substitutedPolicy,
    });

  const cases = [{
    label: "uncataloged-profile",
    input: uncatalogedProfileInvocation,
    applications: basis.catalogApplications,
  }, {
    label: "unapplied-overlay",
    input: unappliedOverlayInvocation,
    applications: basis.catalogApplications,
  }, {
    label: "missing-instruction-application",
    input: basis.input,
    applications: basis.catalogApplications.filter(
      (binding) =>
        binding.handle !==
          basis.gtl.CONSENSUS_IDS.reviewerInstructionCatalogHandle,
    ),
  }];

  for (const row of cases) {
    const scenario = await buildRootCliScenario(
      harness,
      `m5-consensus-${row.label}`,
      (payload) => payload,
      {
        programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
        graphFunctionRef:
          basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
        allowlist,
        input: row.input,
        catalogApplications: row.applications,
        eventLogFile: `${row.label}.events.jsonl`,
        workspaceId,
      },
    );
    await selectConsensusThroughOneSurface(
      basis,
      harness,
      scenario,
      row.input,
    );
    const run = await runInstalledCli(harness, scenario, {
      environment: {
        ABG_TS_CLAUDE_COMMAND:
          "__uncataloged_consensus_basis_must_not_reach_worker__",
      },
    });
    assert.equal(run.exitCode, 2, `${row.label}: ${run.stdout}`);
    const events = await eventsAtIfPresent(scenario.eventLogPath);
    assert.equal(
      events.some((event) =>
        event.kind === "run_segment_opened" ||
        event.kind === "actor_process_started"
      ),
      false,
      `${row.label} must refuse before Run or actor effects`,
    );
  }
});

test("M5 installed Consensus consumes an applied overlay to select ruling behavior", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId =
    "workspace://developer/consensus/applied-ruling-overlay";
  const basis = await consensusBasis(
    harness,
    "applied-ruling-overlay",
    3,
    workspaceId,
    ["submitter-review", "independent-review"],
    "rejected_finding",
  );
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    "m5-consensus-applied-ruling-overlay",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: "applied-ruling-overlay.events.jsonl",
      workspaceId,
    },
  );
  await selectConsensusThroughOneSurface(basis, harness, scenario);
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: "dispute_then_agree",
    },
  });
  assert.equal(run.exitCode, 0, JSON.stringify(run.outcomes.at(-1)));
  const events = await eventsAt(scenario.eventLogPath);
  const resultEvent = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload?.contractRef ===
        basis.gtl.CONSENSUS_IDS.resultCandidateContractRef &&
      event.payload?.value?.kind === "consensus_result_candidate",
  );
  assert.ok(resultEvent, JSON.stringify(diagnosticSummary(events)));
  assert.equal(
    resultEvent.payload.value.rulings.length > 0 &&
      resultEvent.payload.value.rulings.every(
        (ruling) => ruling.rulingKind === "rejected_finding",
      ),
    true,
    "the exact applied overlay must control every non-refusal ruling",
  );
});

test("M5 Consensus exposes no direct support start outside same-Run continuation", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId = "workspace://developer/consensus/no-direct-support";
  const basis = await consensusBasis(
    harness,
    "no-direct-support",
    2,
    workspaceId,
  );
  harness.rootPublication = basis.publication;
  const allowlist = basis.publication.contributions.map((row) => row.handle);
  const source = await buildRootCliScenario(
    harness,
    "m5-consensus-no-direct-support-source",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist,
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: "no-direct-support-source.events.jsonl",
      workspaceId,
    },
  );
  await selectConsensusThroughOneSurface(basis, harness, source);
  const sourceRun = await runInstalledCli(harness, source, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: "unresolved",
    },
  });
  assert.equal(sourceRun.exitCode, 0, sourceRun.stderr);
  const held = sourceRun.outcomes.at(-1);
  assert.equal(held.disposition, "held", JSON.stringify(held));
  assert.equal(held.continuationStatus, "open");
  const roundDecision = roundDecisionFromHeldOutcome(
    held,
    basis.gtl.CONSENSUS_IDS,
  );
  const sourceEvents = await eventsAt(source.eventLogPath);
  assert.equal(
    sourceEvents.some((event) => event.kind === "run_closed"),
    false,
  );
  const sourceEventCount = sourceEvents.length;

  const directSupport = await buildRootCliScenario(
    harness,
    "m5-consensus-no-direct-support-attempt",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef: basis.gtl.CONSENSUS_IDS.escalationGraphFunctionRef,
      allowlist,
      input: roundDecision,
      eventLogFile: "no-direct-support-attempt.events.jsonl",
      workspaceId,
    },
  );
  const directSupportRun = await runInstalledCli(harness, directSupport);
  assert.equal(directSupportRun.exitCode, 2, directSupportRun.stderr);
  assert.equal(directSupportRun.outcomes.at(-1).disposition, "refused");
  assert.equal(directSupportRun.outcomes.at(-1).runId, null);
  assert.equal(
    (await eventsAtIfPresent(directSupport.eventLogPath)).some(
      (event) =>
        event.kind === "invocation_admitted" ||
        event.kind === "fh_interaction_opened",
    ),
    false,
    "the F_H child is not a public start",
  );
  assert.equal(
    (await eventsAt(source.eventLogPath)).length,
    sourceEventCount,
    "a separate direct-support attempt must not append to the held Run",
  );
});

test("M5 Consensus projects malformed attributed reviewer output as typed contract failure", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId = "workspace://developer/consensus/malformed-reviewer";
  const basis = await consensusBasis(
    harness,
    "malformed-reviewer",
    2,
    workspaceId,
  );
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    "m5-consensus-malformed-reviewer",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: "malformed-reviewer.events.jsonl",
      workspaceId,
    },
  );
  await selectConsensusThroughOneSurface(basis, harness, scenario);
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: "malformed_finding",
    },
  });
  const events = await eventsAt(scenario.eventLogPath);
  assert.equal(run.exitCode, 0, run.stdout);
  const outcome = run.outcomes.at(-1);
  assert.equal(
    outcome.disposition,
    "succeeded",
    JSON.stringify(outcome),
  );
  assert.equal(outcome.replayAgreement, true);
  assert.equal(outcome.result.kind, "next_action_projection");
  assert.equal(outcome.result.disposition, "converged");
  const fanOutCompletion = events.find(
    (event) => event.kind === "fan_out_completion_admitted",
  );
  assert.equal(fanOutCompletion?.payload.completionKind, "complete_vector");
  const refusedFindings = events
    .filter(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.contractRef ===
          basis.gtl.CONSENSUS_IDS.findingsContractRef &&
        event.payload?.value?.kind === "review_findings",
    )
    .map((event) => event.payload.value);
  const uniqueRefusedFindings = [
    ...new Map(
      refusedFindings.map((findings) => [findings.outputDigest, findings]),
    ).values(),
  ];
  assert.equal(uniqueRefusedFindings.length, 2);
  assert.equal(
    uniqueRefusedFindings.every(
      (findings) =>
        findings.recommendation === "revise" &&
        findings.refusalRef !== null &&
        findings.findings.length === 0 &&
        findings.residualRefs.length > 0,
    ),
    true,
  );
  const childResultEvent = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload?.contractRef ===
        basis.gtl.CONSENSUS_IDS.resultCandidateContractRef &&
      event.payload?.value?.kind === "consensus_result_candidate",
  );
  assert.ok(childResultEvent, JSON.stringify(diagnosticSummary(events)));
  const consensusResultCandidate = childResultEvent.payload.value;
  assert.equal(consensusResultCandidate.classification, "contract_failure");
  assert.equal(
    consensusResultCandidate.terminalOutcome.outcome,
    "closed_done",
  );
  assert.equal(typeof consensusResultCandidate.contractFailureRef, "string");
  assert.equal(
    Object.hasOwn(consensusResultCandidate, "replayRef"),
    false,
    "the admitted Product result candidate must not fabricate replay identity",
  );
  const eventCountBeforeRead = events.length;
  const resultRead = await readRunProjection(
    harness,
    outcome.projectionAuthority,
    "result",
    childResultEvent.payload.resultRef,
    "malformed-reviewer",
  );
  assert.equal(
    resultRead.exitCode,
    0,
    `${resultRead.stderr}\n${resultRead.stdout}`,
  );
  const resultProjection = resultRead.outcomes.at(-1);
  assert.equal(resultProjection.disposition, "succeeded");
  assert.equal(resultProjection.result.kind, "public_result_projection");
  assert.equal(
    basis.gtl.isConsensusResult(resultProjection.result.value),
    true,
    JSON.stringify(resultProjection.result.value),
  );
  assert.equal(
    resultProjection.result.value.classification,
    "contract_failure",
  );
  assert.equal(
    resultProjection.result.value.contractFailureRef,
    consensusResultCandidate.contractFailureRef,
  );
  assert.equal(
    resultProjection.result.value.replayRef,
    resultProjection.replayRef,
  );
  const replayRead = await readRunProjection(
    harness,
    resultProjection.projectionAuthority,
    "replay",
    outcome.runId,
    "malformed-reviewer",
  );
  assert.equal(
    replayRead.exitCode,
    0,
    `${replayRead.stderr}\n${replayRead.stdout}`,
  );
  assert.equal(
    replayRead.outcomes.at(-1).result.replayRef,
    resultProjection.result.value.replayRef,
  );
  assert.equal(
    events.some((event) => event.kind === "fh_interaction_opened"),
    false,
    "contract failure closes without opening an F_H hold",
  );
  assert.equal(
    (await eventsAt(scenario.eventLogPath)).length,
    eventCountBeforeRead,
    "typed contract-failure reads must not append runtime truth",
  );
  assert.equal(events.at(-1).kind, "run_closed");
});

test("M5 Consensus refuses malformed submitter output before reviewer reconsideration", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId =
    "workspace://developer/consensus/malformed-submitter";
  const basis = await consensusBasis(
    harness,
    "malformed-submitter",
    2,
    workspaceId,
  );
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    "m5-consensus-malformed-submitter",
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: "malformed-submitter.events.jsonl",
      workspaceId,
    },
  );
  await selectConsensusThroughOneSurface(basis, harness, scenario);
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: "malformed_submitter",
    },
  });
  const events = await eventsAt(scenario.eventLogPath);
  assert.equal(run.exitCode, 2, run.stdout);
  assert.equal(run.outcomes.at(-1).disposition, "failed");
  const roundOneFindings = events
    .filter(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.contractRef ===
          basis.gtl.CONSENSUS_IDS.findingsContractRef &&
        event.payload?.value?.roundOrdinal === 1,
    )
    .map((event) => event.payload.value);
  assert.equal(
    new Set(roundOneFindings.map((findings) => findings.profileRef)).size,
    2,
  );
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "actor_invocation_started" &&
        event.payload?.implementationRef ===
          basis.gtl.CONSENSUS_IDS.submitterImplementationRef,
    ).length,
    1,
    "one malformed submitter effect must stop before round two",
  );
  const submitterFailure = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload?.contractRef ===
        basis.gtl.CONSENSUS_IDS.failureContractRef &&
      event.payload?.value?.failureClass === "result_contract_failure",
  );
  assert.ok(submitterFailure, JSON.stringify(diagnosticTail(events)));
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.contractRef ===
          basis.gtl.CONSENSUS_IDS.submitterResponseContractRef,
    ),
    false,
    "malformed output must not become an admitted submitter response",
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.contractRef ===
          basis.gtl.CONSENSUS_IDS.findingsContractRef &&
        event.payload?.value?.roundOrdinal === 2,
    ),
    false,
    "reviewer round two must not open without an admitted response",
  );
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "graph_call_opened" &&
        event.graphFunctionRef ===
          basis.gtl.CONSENSUS_IDS.roundGraphFunctionRef,
    ).length,
    1,
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.contractRef ===
          basis.gtl.CONSENSUS_IDS.resultCandidateContractRef,
    ),
    false,
  );
  assert.equal(events.some((event) => event.kind === "run_closed"), false);
  assert.equal(events.some((event) => event.kind === "run_stopped"), true);
});

for (const transportCase of [{
  label: "nonzero-exit",
  mode: "transport_nonzero",
  expectedFailureClass: "transport_failure",
}, {
  label: "no-output",
  mode: "no_output",
  expectedFailureClass: "no_output",
}, {
  label: "timeout",
  mode: "transport_timeout",
  expectedFailureClass: "transport_failure",
}, {
  label: "post-timeout output",
  mode: "valid_after_sigterm",
  expectedFailureClass: "transport_failure",
}]) {
  test(`M5 Consensus preserves ${transportCase.label} as transport failure truth`, async (context) => {
    const harness = await setupInstalledCliHarness(context, packageRoot);
    const command = await installConsensusWorker(harness);
    const workspaceId =
      `workspace://developer/consensus/${transportCase.label}`;
    const basis = await consensusBasis(
      harness,
      transportCase.label,
      2,
      workspaceId,
    );
    harness.rootPublication = basis.publication;
    const scenario = await buildRootCliScenario(
      harness,
      `m5-consensus-${transportCase.label}`,
      (payload) => payload,
      {
        programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
        graphFunctionRef:
          basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
        allowlist: basis.publication.contributions.map((row) => row.handle),
        input: basis.input,
        catalogApplications: basis.catalogApplications,
        eventLogFile: `${transportCase.label}.events.jsonl`,
        workspaceId,
      },
    );
    await selectConsensusThroughOneSurface(basis, harness, scenario);
    const run = await runInstalledCli(harness, scenario, {
      environment: {
        ABG_TS_CLAUDE_COMMAND: command,
        ABG_CONSENSUS_TEST_MODE: transportCase.mode,
        ABG_TS_FP_TIMEOUT_MS:
          transportCase.mode === "transport_timeout" ||
              transportCase.mode === "valid_after_sigterm"
            ? "250"
            : "2000",
        ABG_TS_FP_TERMINATION_GRACE_MS: "50",
      },
    });
    const events = await eventsAt(scenario.eventLogPath);
    assert.equal(run.exitCode, 2, run.stdout);
    assert.equal(run.outcomes.at(-1).disposition, "failed");
    const actorFailure = events.find(
      (event) => event.kind === "actor_invocation_failed",
    );
    assert.equal(
      actorFailure?.payload.failureClass,
      transportCase.expectedFailureClass,
      JSON.stringify(diagnosticSummary(events)),
    );
    const failureResult = events.find(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.contractRef ===
          basis.gtl.CONSENSUS_IDS.failureContractRef &&
        event.payload?.value?.kind === "consensus_failure",
    );
    assert.equal(
      failureResult?.payload.value.failureClass,
      transportCase.expectedFailureClass,
      JSON.stringify(diagnosticTail(events)),
    );
    assert.equal(
      events.some(
        (event) =>
          event.kind === "c_call_result_admitted" &&
          event.payload?.contractRef ===
            basis.gtl.CONSENSUS_IDS.resultCandidateContractRef &&
          event.payload?.value?.classification === "contract_failure",
      ),
      false,
      "transport failure must not become a semantic Consensus result",
    );
    assert.equal(
      events.some((event) => event.kind === "run_stopped"),
      true,
      JSON.stringify(diagnosticTail(events)),
    );
  });
}

for (const salvageCase of [{
  label: "nonzero exit",
  mode: "valid_then_nonzero",
  timeoutMs: "2000",
  expectedStatus: 47,
  expectedTimedOut: false,
}, {
  label: "timeout",
  mode: "valid_then_timeout",
  timeoutMs: "1000",
  expectedStatus: null,
  expectedTimedOut: true,
}]) {
test(`M5 Consensus salvages a valid reviewer candidate observed before ${salvageCase.label}`, async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const command = await installConsensusWorker(harness);
  const workspaceId =
    `workspace://developer/consensus/valid-before-${salvageCase.mode}`;
  const basis = await consensusBasis(
    harness,
    `valid-before-${salvageCase.mode}`,
    2,
    workspaceId,
  );
  harness.rootPublication = basis.publication;
  const scenario = await buildRootCliScenario(
    harness,
    `m5-consensus-valid-before-${salvageCase.mode}`,
    (payload) => payload,
    {
      programRef: basis.gtl.CONSENSUS_IDS.oneSurfaceProgramRef,
      graphFunctionRef:
        basis.gtl.CONSENSUS_IDS.oneSurfaceGraphFunctionRef,
      allowlist: basis.publication.contributions.map((row) => row.handle),
      input: basis.input,
      catalogApplications: basis.catalogApplications,
      eventLogFile: `valid-before-${salvageCase.mode}.events.jsonl`,
      workspaceId,
    },
  );
  await selectConsensusThroughOneSurface(basis, harness, scenario);
  const run = await runInstalledCli(harness, scenario, {
    environment: {
      ABG_TS_CLAUDE_COMMAND: command,
      ABG_CONSENSUS_TEST_MODE: salvageCase.mode,
      ABG_TS_FP_TIMEOUT_MS: salvageCase.timeoutMs,
      ABG_TS_FP_TERMINATION_GRACE_MS: "50",
    },
  });
  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(run.outcomes.at(-1).disposition, "succeeded");
  const events = await eventsAt(scenario.eventLogPath);
  const transportEvidence = events.filter(
    (event) =>
      event.kind === "c_call_evidenced" &&
      event.payload?.evidenceClass === "probabilistic_transport" &&
      event.payload?.transportDisposition === "failure" &&
      event.payload?.transportFailureClass === "transport_failure",
  );
  assert.equal(transportEvidence.length >= 2, true);
  assert.equal(
    transportEvidence.every(
      (event) =>
        event.payload.processStatus === salvageCase.expectedStatus &&
        event.payload.timedOut === salvageCase.expectedTimedOut,
    ),
    true,
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.contractRef ===
          basis.gtl.CONSENSUS_IDS.findingsContractRef &&
        event.payload?.value?.kind === "review_findings",
    ),
    true,
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload?.value?.kind === "consensus_failure",
    ),
    false,
  );
  assert.equal(events.at(-1).kind, "run_closed");
});
}
