import assert from "node:assert/strict";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { prepareDeveloperMiniProduct } from "../support/developer-mini-product.mjs";
import {
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { sha256Canonical } from "../../build/code/src/product/index.js";

const packageRoot = new URL("../..", import.meta.url).pathname;

function invocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-07-24T00:00:00.000Z",
    correlationId: "correlation://t270/external-product",
    payload,
  };
}

async function applyInFreshContext(publicApi, row) {
  const context = publicApi.createRootOperationContext();
  try {
    return await publicApi.applyRootPublicInvocation(context, row);
  } finally {
    publicApi.closeRootOperationContext(context);
  }
}

function expectedVerificationIdentity(basis) {
  return {
    expectedArtifactDigest: basis.artifactDigest,
    expectedProductContentDigest: basis.productContentDigest,
    expectedManifestDigest: basis.manifestDigest,
    expectedProductId: basis.productId,
    expectedPackageName: basis.packageName,
    expectedPackageVersion: basis.packageVersion,
  };
}

function oneSurfaceObservation(mini, publication, binding, name) {
  const program = publication.programs.find(
    (candidate) => candidate.programRef === mini.ids.oneSurfaceProgramRef,
  );
  assert.ok(program?.actionCatalog);
  assert.equal(typeof binding.bindingId, "string");
  assert.match(binding.bindingDigest, /^sha256:[a-f0-9]{64}$/u);
  return mini.constructObservationSnapshot({
    workspaceBindingId: binding.bindingId,
    workspaceBindingDigest: binding.bindingDigest,
    actionCatalog: program.actionCatalog,
    name,
  });
}

function oneSurfaceGraph(publication, mini) {
  const graph = publication.graphFunctions.find(
    (candidate) => candidate.name === mini.ids.oneSurfaceGraphFunctionRef,
  );
  assert.ok(graph);
  return graph;
}

function oneSurfaceClosure(publication, mini) {
  const closure = publication.closureContracts.find(
    (candidate) =>
      candidate.closureContractRef ===
        mini.ids.oneSurfaceClosureContractRef,
  );
  assert.ok(closure);
  return closure;
}

function oneSurfaceTerms(publication, mini) {
  const graph = oneSurfaceGraph(publication, mini);
  const terms = graph.template.nodes[0].term.terms;
  assert.equal(Array.isArray(terms), true);
  return terms;
}

function withOneSurfaceTerminal(mini, terminalIndex, stageRole) {
  const publication = structuredClone(mini.publication);
  const graph = oneSurfaceGraph(publication, mini);
  const composition = graph.template.nodes[0].term;
  composition.terms = composition.terms.slice(0, terminalIndex + 1);
  const terminal = composition.terms.at(-1);
  assert.ok(terminal);
  terminal.resultBearing = true;
  if (stageRole !== undefined) terminal.stageRole = stageRole;
  composition.outputCarrierRef = terminal.outputCarrierRef;
  graph.outputs = [terminal.outputCarrierRef];
  graph.environment.provides = [terminal.outputCarrierRef];
  oneSurfaceClosure(publication, mini).resultContractRef =
    terminal.outputCarrierRef;
  return publication;
}

function withScalarActionEvaluation(mini) {
  const publication = structuredClone(mini.publication);
  const terms = oneSurfaceTerms(publication, mini);
  terms[3].outputCarrierRef = mini.ids.approvalContractRef;
  terms[4].inputCarrierRef = mini.ids.approvalContractRef;
  terms[4].requirement.inputContractRef = mini.ids.approvalContractRef;
  const binding = publication.implementationBindings.find(
    (candidate) =>
      candidate.bindingRef ===
        mini.ids.evaluateActionImplementationBindingRef,
  );
  assert.ok(binding);
  binding.implementationRef =
    mini.ids.evaluateActionScalarImplementationRef;
  binding.inputContractRef = mini.ids.approvalContractRef;
  return publication;
}

function withIncompleteActionEvidence(mini) {
  const publication = structuredClone(mini.publication);
  const binding = publication.implementationBindings.find(
    (candidate) =>
      candidate.bindingRef ===
        mini.ids.evaluateActionImplementationBindingRef,
  );
  assert.ok(binding);
  binding.implementationRef =
    mini.ids.evaluateActionIncompleteEvidenceImplementationRef;
  binding.namedSymbol = "realizeDeveloperEvaluateActionWithoutEvidence";
  return publication;
}

function withStageImplementation(
  publication,
  bindingRef,
  implementationRef,
  namedSymbol,
) {
  const candidate = structuredClone(publication);
  const binding = candidate.implementationBindings.find(
    (row) => row.bindingRef === bindingRef,
  );
  assert.ok(binding);
  binding.implementationRef = implementationRef;
  binding.namedSymbol = namedSymbol;
  return candidate;
}

function withSubstitutedPolicy(mini) {
  return withStageImplementation(
    mini.publication,
    mini.ids.evalGapImplementationBindingRef,
    mini.ids.evalGapSubstitutedPolicyImplementationRef,
    "realizeDeveloperEvalGapWithSubstitutedPolicy",
  );
}

function withMissingAction(mini) {
  return withStageImplementation(
    mini.publication,
    mini.ids.evaluateNextImplementationBindingRef,
    mini.ids.evaluateNextMissingActionImplementationRef,
    "realizeDeveloperEvaluateNextWithMissingAction",
  );
}

function withSubstitutedWorkspace(mini) {
  return withStageImplementation(
    mini.publication,
    mini.ids.evaluateActionImplementationBindingRef,
    mini.ids.evaluateActionSubstitutedWorkspaceImplementationRef,
    "realizeDeveloperEvaluateActionWithSubstitutedWorkspace",
  );
}

function withRenamedOneSurfaceRoles(mini) {
  const publication = structuredClone(mini.publication);
  oneSurfaceTerms(publication, mini).forEach((term, index) => {
    term.stageRole = `descriptive-role-${index}`;
  });
  return publication;
}

async function oneSurfaceLifecycle(
  publicApi,
  harness,
  mini,
  label,
  publication,
  options = {},
) {
  const scenario = await externalScenario(
    harness,
    mini,
    label,
    publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: "Margaret",
      },
    },
  );
  const context = publicApi.createRootOperationContext();
  const setupOutcomes = [];
  try {
    for (const row of scenario.transcript.slice(0, -1)) {
      setupOutcomes.push(
        await publicApi.applyRootPublicInvocation(context, row),
      );
    }
    const start = structuredClone(scenario.transcript.at(-1));
    start.payload.input = oneSurfaceObservation(
      mini,
      publication,
      setupOutcomes[4].result,
      "Margaret",
    );
    setupOutcomes.push(
      await publicApi.applyRootPublicInvocation(context, start),
    );
  } finally {
    publicApi.closeRootOperationContext(context);
  }
  assert.equal(
    setupOutcomes.slice(0, -1).every(
      (outcome) => outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(setupOutcomes),
  );
  const held = setupOutcomes.at(-1);
  assert.equal(held.disposition, "held", JSON.stringify(held));
  const continuationAuthority = JSON.parse(
    JSON.stringify(held.result.continuationAuthority),
  );
  const frontier = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "status",
      `invocation://t272/${label}/read`,
      {
        continuationAuthority,
        continuationRef: held.continuationRef,
      },
    ),
  );
  assert.equal(frontier.disposition, "succeeded", JSON.stringify(frontier));
  const responded = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.interaction.respond",
      "approve",
      `invocation://t272/${label}/respond`,
      {
        actorRef: "actor://developer.example/trusted-developer",
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority,
        continuationRef: held.continuationRef,
        response: options.response?.(frontier) ?? {
            kind: "developer_human_approval",
            schemaVersion: "5.0.0",
            approved: true,
            constructionIntentRef: frontier.result.constructionIntentRef,
            message: "Welcome Margaret.",
            semanticEvidenceAssetRefs: [mini.ids.approvalAssetRef],
          },
      },
    ),
  );
  assert.equal(responded.disposition, "succeeded", JSON.stringify(responded));
  if (options.afterRespond !== undefined) {
    await options.afterRespond({
      continuationAuthority: JSON.parse(
        JSON.stringify(responded.result.continuationAuthority),
      ),
      continuationRef: held.continuationRef,
      scenario,
    });
  }
  const completed = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.run.continue",
      "current_intent",
      `invocation://t272/${label}/continue`,
      {
        actorRef: "actor://developer.example/trusted-developer",
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority: JSON.parse(
          JSON.stringify(responded.result.continuationAuthority),
        ),
        continuationRef: held.continuationRef,
      },
    ),
  );
  const eventLog = await readFile(scenario.eventLogPath, "utf8");
  const events = eventLog.trim().length === 0
    ? []
    : eventLog.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  return { completed, events, frontier, held, responded };
}

async function oneSurfaceAdmissionRefusal(
  publicApi,
  harness,
  mini,
  label,
  publication,
) {
  const scenario = await externalScenario(
    harness,
    mini,
    label,
    publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
    },
  );
  const context = publicApi.createRootOperationContext();
  const outcomes = [];
  try {
    for (const row of scenario.transcript) {
      outcomes.push(await publicApi.applyRootPublicInvocation(context, row));
    }
  } finally {
    publicApi.closeRootOperationContext(context);
  }
  return { outcomes, scenario };
}

async function oneSurfaceStart(
  publicApi,
  harness,
  mini,
  label,
  publication,
) {
  const scenario = await externalScenario(
    harness,
    mini,
    label,
    publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
    },
  );
  const context = publicApi.createRootOperationContext();
  const outcomes = [];
  try {
    for (const row of scenario.transcript.slice(0, -1)) {
      outcomes.push(await publicApi.applyRootPublicInvocation(context, row));
    }
    const start = structuredClone(scenario.transcript.at(-1));
    start.payload.input = oneSurfaceObservation(
      mini,
      publication,
      outcomes[4].result,
      "Margaret",
    );
    outcomes.push(await publicApi.applyRootPublicInvocation(context, start));
  } finally {
    publicApi.closeRootOperationContext(context);
  }
  const eventLog = await readFile(scenario.eventLogPath, "utf8");
  const events = eventLog.trim().length === 0
    ? []
    : eventLog.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
  return { events, outcome: outcomes.at(-1), outcomes, scenario };
}

async function externalScenario(
  harness,
  mini,
  label,
  publication = mini.publication,
  target = {},
) {
  const root = join(harness.scratch, label);
  const abiConsumer = join(root, "abiogenesis-product");
  const miniConsumer = join(root, "developer-product");
  const workspaceRoot = join(root, "workspace");
  const abiInstalledRoot = join(
    abiConsumer,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant",
  );
  const miniInstalledRoot = join(
    miniConsumer,
    "node_modules",
    "@abiogenesis-fixtures",
    "developer-mini-product",
  );
  const eventLogRoot = join(workspaceRoot, ".ai-workspace/events");
  const prefix = `invocation://t270/${label}`;
  const programRef = target.programRef ?? mini.ids.programRef;
  const graphFunctionRef =
    target.graphFunctionRef ?? mini.ids.graphFunctionRef;
  const runVariant = target.runVariant ?? "direct";
  const startRef = target.startRef ?? null;
  const input = target.input ?? {
    kind: "developer_greeting_input",
    schemaVersion: "5.0.0",
    name: "Ada",
  };
  const refs = {
    verifyAbi: `${prefix}/verify-abiogenesis`,
    installAbi: `${prefix}/install-abiogenesis`,
    verifyMini: `${prefix}/verify-developer-product`,
    installMini: `${prefix}/install-developer-product`,
    bind: `${prefix}/workspace-bind`,
    catalog: `${prefix}/catalog-admit`,
    view: `${prefix}/catalog-view`,
    run: `${prefix}/run-invoke`,
  };
  const transcript = [
    invocation("abg.operation.product.verify", "artifact", refs.verifyAbi, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    }),
    invocation("abg.operation.product.install", "verified_artifact", refs.installAbi, {
      verifiedInvocationRef: refs.verifyAbi,
      artifactPath: harness.artifactPath,
      targetRoot: abiConsumer,
    }),
    invocation("abg.operation.product.verify", "artifact", refs.verifyMini, {
      artifactPath: mini.artifactPath,
      artifactRef: mini.artifactRef,
      ...expectedVerificationIdentity(mini.basis),
    }),
    invocation("abg.operation.product.install", "verified_artifact", refs.installMini, {
      verifiedInvocationRef: refs.verifyMini,
      artifactPath: mini.artifactPath,
      targetRoot: miniConsumer,
    }),
    invocation("abg.operation.workspace.bind", "exact_product_set", refs.bind, {
      installInvocationRefs: [refs.installAbi, refs.installMini],
      dependencyEdges: [{
        kind: "requires",
        fromProductId: mini.basis.productId,
        toProductId: harness.candidateBasis.productId,
      }],
      workspaceId: `workspace://t270/${label}`,
      canonicalRoot: workspaceRoot,
      authorityManifestRef: `manifest://t270/${label}/workspace-authority`,
      roots: {
        toolchainRoot: abiInstalledRoot,
        productRoot: miniInstalledRoot,
        eventLogRoot,
        runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
        projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
        archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
      },
    }),
    invocation("abg.operation.catalog.admit", "module_publication", refs.catalog, {
      publication,
      verifiedInvocationRef: refs.verifyMini,
      workspaceBindingInvocationRef: refs.bind,
    }),
    invocation("abg.operation.catalog.view", "allowlist", refs.view, {
      catalogInvocationRef: refs.catalog,
      allowlist: [graphFunctionRef],
    }),
    invocation("abg.operation.run.invoke", runVariant, refs.run, {
      installInvocationRef: refs.installMini,
      workspaceBindingInvocationRef: refs.bind,
      catalogViewInvocationRef: refs.view,
      programRef,
      actorRef: "actor://developer.example/trusted-developer",
      input,
      eventLogPath: join(eventLogRoot, "developer-product.events.jsonl"),
      ...(runVariant === "start"
        ? {
            rootMode: "supervised",
            scope: "program",
            startRef,
            target: startRef,
            until: "converged",
          }
        : { graphFunctionRef }),
    }),
  ];
  const transcriptPath = join(root, "external-product.transcript.jsonl");
  await mkdir(root, { recursive: true });
  await writeFile(
    transcriptPath,
    `${transcript.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );
  return {
    eventLogPath: transcript.at(-1).payload.eventLogPath,
    miniInstalledRoot,
    transcript,
    transcriptPath,
  };
}

async function installMixedWorkerFixture(harness) {
  const bin = join(harness.scratch, "developer-mixed-worker");
  await mkdir(bin, { recursive: true });
  const command = join(bin, "claude");
  await writeFile(command, [
    "#!/usr/bin/env node",
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  const line = prompt.split(/\\r?\\n/u).find((row) => row.startsWith('{'));",
    "  const result = line === undefined ? null : JSON.parse(line);",
    "  console.log(JSON.stringify({ type: 'system', subtype: 'init' }));",
    "  console.log(JSON.stringify({ type: 'result', subtype: 'success', result: JSON.stringify(result) }));",
    "});",
    "",
  ].join("\n"), "utf8");
  await chmod(command, 0o755);
  return command;
}

function assertExternalOutcome(outcomes, harness, mini) {
  assert.equal(outcomes.length, 8);
  assert.equal(
    outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(outcomes),
  );
  const binding = outcomes[4].result;
  assert.deepEqual(
    binding.lockedProductIds,
    [harness.candidateBasis.productId, mini.basis.productId],
  );
  assert.deepEqual(binding.dependencyEdges, [{
    kind: "requires",
    fromProductId: mini.basis.productId,
    toProductId: harness.candidateBasis.productId,
  }]);
  const result = outcomes[7];
  assert.equal(result.replayAgreement, true);
  assert.deepEqual(result.result, {
    kind: "developer_greeting_output",
    schemaVersion: "5.0.0",
    message: "Welcome Ada.",
  });
  assert.equal(result.outputContractRef, mini.ids.outputContractRef);
  return result;
}

test("M5 installs and executes one independent developer-authored GTL Product through SDK and CLI", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);

  const cliScenario = await externalScenario(harness, mini, "external-cli");
  const cliRun = await runInstalledCli(harness, cliScenario);
  assert.equal(
    cliRun.exitCode,
    0,
    JSON.stringify({ stderr: cliRun.stderr, outcomes: cliRun.outcomes }),
  );
  const cliOutcome = assertExternalOutcome(cliRun.outcomes, harness, mini);

  const publicApi = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?external-sdk=${Date.now()}`
  );
  const sdkScenario = await externalScenario(harness, mini, "external-sdk");
  const operationContext = publicApi.createRootOperationContext();
  const sdkOutcomes = [];
  for (const row of sdkScenario.transcript) {
    sdkOutcomes.push(await publicApi.applyRootPublicInvocation(operationContext, row));
  }
  publicApi.closeRootOperationContext(operationContext);
  const sdkOutcome = assertExternalOutcome(sdkOutcomes, harness, mini);
  assert.deepEqual(sdkOutcome.result, cliOutcome.result);

  const events = (await readFile(cliScenario.eventLogPath, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  const admittedResult = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.payload.contractRef === mini.ids.outputContractRef,
  );
  assert.deepEqual(admittedResult.payload.value, cliOutcome.result);
  assert.equal(events.some((event) => event.kind === "run_closed"), true);

  const installedOperations = await readFile(
    join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/operations.js",
    ),
    "utf8",
  );
  assert.doesNotMatch(installedOperations, /developer\.example|developer-mini-product/u);

  const identityScenario = await externalScenario(
    harness,
    mini,
    "external-nonterminal-identity",
    mini.publication,
    {
      programRef: mini.ids.identityProgramRef,
      graphFunctionRef: mini.ids.identityGraphFunctionRef,
    },
  );
  const identityRun = await runInstalledCli(harness, identityScenario);
  assert.equal(identityRun.exitCode, 0, identityRun.stdout);
  assertExternalOutcome(identityRun.outcomes, harness, mini);
  const identityEvents = (await readFile(identityScenario.eventLogPath, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(
    identityEvents.some(
      (event) =>
        event.kind === "traversal_cursor_entered" &&
        event.payload.termPath?.join("/") ===
          ["node", mini.ids.identityNodeRef, "c"].join("/"),
    ),
    true,
  );
  assert.equal(
    identityEvents.filter((event) => event.kind === "c_call_opened").length,
    1,
  );

  const malformedGtl = structuredClone(mini.publication);
  malformedGtl.graphFunctions[0].template.nodes[0].term.kind =
    "c_not_a_constructor";
  const malformedGtlScenario = await externalScenario(
    harness,
    mini,
    "external-malformed-serialized-gtl",
    malformedGtl,
  );
  const malformedGtlRun = await runInstalledCli(harness, malformedGtlScenario);
  assert.equal(malformedGtlRun.exitCode, 2);
  assert.equal(malformedGtlRun.outcomes[5].disposition, "refused");
  assert.equal(malformedGtlRun.outcomes.at(-1).runId, null);

  const absentSemantics = structuredClone(mini.publication);
  absentSemantics.productSemanticsBinding.namedSymbol =
    "SUBSTITUTED_PRODUCT_SEMANTICS";
  const absentScenario = await externalScenario(
    harness,
    mini,
    "external-semantics-absent",
    absentSemantics,
  );
  const absentRun = await runInstalledCli(harness, absentScenario);
  assert.equal(absentRun.exitCode, 2);
  assert.equal(absentRun.outcomes.at(-1).disposition, "refused");
  assert.equal(absentRun.outcomes.at(-1).result.code, "target_mismatch");

  const unknownJudgment = structuredClone(mini.publication);
  const unknownPredicate =
    "predicate://developer.example/greeting/undeclared-substitute@5";
  unknownJudgment.graphFunctions[0].template.nodes[0].term.judgmentPredicateRef =
    unknownPredicate;
  unknownJudgment.graphFunctions[0].declarations["abg.judgment_predicate"] =
    unknownPredicate;
  const judgmentScenario = await externalScenario(
    harness,
    mini,
    "external-judgment-absent",
    unknownJudgment,
  );
  const judgmentRun = await runInstalledCli(harness, judgmentScenario);
  assert.equal(judgmentRun.exitCode, 2);
  assert.equal(judgmentRun.outcomes.at(-1).disposition, "failed");
  assert.equal(judgmentRun.outcomes.at(-1).result, null);
});

test("M5 reopens and completes an external mixed F_D/F_P/F_H program through separate public operations", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const command = await installMixedWorkerFixture(harness);
  const scenario = await externalScenario(
    harness,
    mini,
    "external-mixed-fibres",
    mini.publication,
    {
      programRef: mini.ids.mixedProgramRef,
      graphFunctionRef: mini.ids.mixedGraphFunctionRef,
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: "Grace",
      },
    },
  );
  const publicApi = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?external-fh-sdk=${Date.now()}`
  );
  const priorCommand = process.env.ABG_TS_CLAUDE_COMMAND;
  process.env.ABG_TS_CLAUDE_COMMAND = command;
  try {
    const operationContext = publicApi.createRootOperationContext();
    const setupOutcomes = [];
    try {
      for (const row of scenario.transcript) {
        setupOutcomes.push(
          await publicApi.applyRootPublicInvocation(operationContext, row),
        );
      }
    } finally {
      publicApi.closeRootOperationContext(operationContext);
    }
    assert.equal(
      setupOutcomes.slice(0, -1).every(
        (outcome) => outcome.disposition === "succeeded",
      ),
      true,
      JSON.stringify(setupOutcomes),
    );
    const held = setupOutcomes.at(-1);
    const heldEvents = (await readFile(scenario.eventLogPath, "utf8"))
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    assert.equal(
      held.disposition,
      "held",
      JSON.stringify({ held, eventTail: heldEvents.slice(-12) }),
    );
    assert.equal(typeof held.continuationRef, "string");
    assert.equal(held.continuationStatus, "open");
    const continuationRef = held.continuationRef;
    assert.equal(
      held.result.continuationAuthority.kind,
      "public_continuation_authority",
    );
    const openAuthority = JSON.parse(
      JSON.stringify(held.result.continuationAuthority),
    );
    const actorRef = "actor://developer.example/trusted-developer";
    const response = {
      kind: "developer_greeting_output",
      schemaVersion: "5.0.0",
      message: "Welcome Grace.",
    };

    const readOpen = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.project.read",
        "status",
        "invocation://t270/external-mixed/read-open",
        {
          continuationAuthority: openAuthority,
          continuationRef,
        },
      ),
    );
    assert.equal(readOpen.disposition, "succeeded", JSON.stringify(readOpen));
    assert.equal(readOpen.result.status, "open");

    const malformedResponse = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.interaction.respond",
        "approve",
        "invocation://t270/external-mixed/respond-malformed",
        {
          actorRef,
          capabilityRef: mini.ids.actorCapabilityRef,
          continuationAuthority: openAuthority,
          continuationRef,
          response: { ...response, substituted: true },
        },
      ),
    );
    assert.equal(malformedResponse.disposition, "refused");
    assert.equal(malformedResponse.result.code, "target_mismatch");

    const wrongActor = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.interaction.respond",
        "approve",
        "invocation://t270/external-mixed/respond-wrong-actor",
        {
          actorRef: "actor://developer.example/substituted",
          capabilityRef: mini.ids.actorCapabilityRef,
          continuationAuthority: openAuthority,
          continuationRef,
          response,
        },
      ),
    );
    assert.notEqual(wrongActor.disposition, "succeeded");

    const responded = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.interaction.respond",
        "approve",
        "invocation://t270/external-mixed/respond",
        {
          actorRef,
          capabilityRef: mini.ids.actorCapabilityRef,
          continuationAuthority: openAuthority,
          continuationRef,
          response,
        },
      ),
    );
    assert.equal(responded.disposition, "succeeded", JSON.stringify(responded));
    assert.equal(responded.continuationStatus, "responded");
    const respondedAuthority = JSON.parse(
      JSON.stringify(responded.result.continuationAuthority),
    );

    const readResponded = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.project.read",
        "status",
        "invocation://t270/external-mixed/read-responded",
        {
          continuationAuthority: respondedAuthority,
          continuationRef,
        },
      ),
    );
    assert.equal(
      readResponded.disposition,
      "succeeded",
      JSON.stringify(readResponded),
    );
    assert.equal(readResponded.result.status, "responded");

    const completed = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.run.continue",
        "current_intent",
        "invocation://t270/external-mixed/continue",
        {
          actorRef,
          capabilityRef: mini.ids.actorCapabilityRef,
          continuationAuthority: respondedAuthority,
          continuationRef,
        },
      ),
    );
    const events = (await readFile(scenario.eventLogPath, "utf8"))
      .trim()
      .split(/\r?\n/u)
      .map((line) => JSON.parse(line));
    assert.equal(
      completed.disposition,
      "succeeded",
      JSON.stringify({
        completed,
        runtimeFailures: events.filter(
          (event) => event.kind === "runtime_failure_observed",
        ),
      }),
    );
    assert.equal(completed.continuationStatus, "resolved");
    assert.equal(completed.runId, held.runId);
    assert.equal(completed.replayAgreement, true);
    assert.deepEqual(completed.result, response);

    assert.deepEqual(
      events
        .filter((event) => event.kind === "c_call_fibre_selected")
        .map((event) => event.payload.regime),
      ["F_D", "F_P", "F_H", "F_D"],
    );
    assert.equal(
      events.filter((event) => event.kind === "c_call_opened").length,
      4,
    );
    assert.equal(
      events.filter((event) => event.kind === "c_call_result_admitted").length,
      4,
    );
    assert.equal(
      events.filter((event) => event.kind === "c_call_judged").length,
      4,
    );
    assert.deepEqual(
      events
        .filter((event) =>
          event.aggregateType === "continuation" &&
          event.aggregateId === continuationRef)
        .map((event) => event.kind),
      [
        "fh_interaction_opened",
        "fh_interaction_responded",
        "fh_interaction_resume_admitted",
      ],
    );
    assert.equal(
      events.filter((event) => event.kind === "run_closed").length,
      1,
    );
    assert.deepEqual(
      events.map((event) => event.admissionOrdinal),
      events.map((_, index) => index + 1),
    );
  } finally {
    if (priorCommand === undefined) {
      delete process.env.ABG_TS_CLAUDE_COMMAND;
    } else {
      process.env.ABG_TS_CLAUDE_COMMAND = priorCommand;
    }
  }
});

test("M5 starts an external supervised GTL Program whose One Surface order survives F_H continuation", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const publicApi = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?external-one-surface=${Date.now()}`
  );
  const missingSelectedAction = structuredClone(mini.publication);
  const missingActionProgram = missingSelectedAction.programs.find(
    (program) => program.programRef === mini.ids.oneSurfaceProgramRef,
  );
  missingActionProgram.actionCatalog.rows[0].actionRef =
    "action://developer.example/greeting/substituted@5";
  const missingActionCatalogBody = {
    kind: missingActionProgram.actionCatalog.kind,
    schemaVersion: missingActionProgram.actionCatalog.schemaVersion,
    rows: missingActionProgram.actionCatalog.rows,
  };
  const missingActionCatalogDigest = sha256Canonical(
    missingActionCatalogBody,
  );
  missingActionProgram.actionCatalog.catalogDigest =
    missingActionCatalogDigest;
  missingActionProgram.actionCatalog.catalogRef =
    `action-catalog://product/${missingActionCatalogDigest.slice("sha256:".length)}`;
  const missingActionScenario = await externalScenario(
    harness,
    mini,
    "external-one-surface-missing-selected-action",
    missingSelectedAction,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: "Margaret",
      },
    },
  );
  const missingActionContext = publicApi.createRootOperationContext();
  const missingActionOutcomes = [];
  try {
    for (const row of missingActionScenario.transcript.slice(0, -1)) {
      missingActionOutcomes.push(
        await publicApi.applyRootPublicInvocation(
          missingActionContext,
          row,
        ),
      );
    }
    const start = structuredClone(missingActionScenario.transcript.at(-1));
    start.payload.input = oneSurfaceObservation(
      mini,
      mini.publication,
      missingActionOutcomes[4].result,
      "Margaret",
    );
    missingActionOutcomes.push(
      await publicApi.applyRootPublicInvocation(missingActionContext, start),
    );
  } finally {
    publicApi.closeRootOperationContext(missingActionContext);
  }
  assert.notEqual(missingActionOutcomes.at(-1).disposition, "held");
  assert.equal(missingActionOutcomes.at(-1).runId, null);

  const scenario = await externalScenario(
    harness,
    mini,
    "external-one-surface",
    mini.publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: "Margaret",
      },
    },
  );
  const operationContext = publicApi.createRootOperationContext();
  const setupOutcomes = [];
  try {
    for (const row of scenario.transcript.slice(0, -1)) {
      setupOutcomes.push(
        await publicApi.applyRootPublicInvocation(operationContext, row),
      );
    }
    const validStart = structuredClone(scenario.transcript.at(-1));
    validStart.payload.input = oneSurfaceObservation(
      mini,
      mini.publication,
      setupOutcomes[4].result,
      "Margaret",
    );
    const callerSelectedGraphFunction = await publicApi.applyRootPublicInvocation(
      operationContext,
      {
        ...validStart,
        invocationRef: `${validStart.invocationRef}/caller-selected-graph-function`,
        payload: {
          ...validStart.payload,
          graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
        },
      },
    );
    assert.equal(callerSelectedGraphFunction.disposition, "refused");
    assert.equal(callerSelectedGraphFunction.result.code, "invalid_request");
    setupOutcomes.push(
      await publicApi.applyRootPublicInvocation(operationContext, validStart),
    );
  } finally {
    publicApi.closeRootOperationContext(operationContext);
  }
  assert.equal(
    setupOutcomes.slice(0, -1).every(
      (outcome) => outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(setupOutcomes),
  );
  const held = setupOutcomes.at(-1);
  assert.equal(held.disposition, "held", JSON.stringify(held));
  assert.equal(held.variant, "start");
  assert.equal(held.continuationStatus, "open");
  const continuationRef = held.continuationRef;
  const openAuthority = JSON.parse(
    JSON.stringify(held.result.continuationAuthority),
  );
  const actorRef = "actor://developer.example/trusted-developer";

  const frontier = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "status",
      "invocation://t272/external-one-surface/read-frontier",
      {
        continuationAuthority: openAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(frontier.disposition, "succeeded", JSON.stringify(frontier));
  assert.equal(frontier.result.status, "open");
  assert.equal(frontier.result.continuationRef, continuationRef);
  assert.equal(
    frontier.result.nextActionProjection.kind,
    "next_action_projection",
  );
  assert.equal(
    frontier.result.nextActionProjection.targetProgramLocusRef,
    mini.ids.interactionLocusRef,
  );
  assert.equal(
    frontier.result.nextActionProjection.programRef,
    mini.ids.oneSurfaceProgramRef,
  );
  assert.match(
    frontier.result.constructionIntentRef,
    /^construction-intent:\/\/abiogenesis\//u,
  );
  const response = {
    kind: "developer_human_approval",
    schemaVersion: "5.0.0",
    approved: true,
    constructionIntentRef: frontier.result.constructionIntentRef,
    message: "Welcome Margaret.",
    semanticEvidenceAssetRefs: [mini.ids.approvalAssetRef],
  };

  const responded = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.interaction.respond",
      "approve",
      "invocation://t272/external-one-surface/respond",
      {
        actorRef,
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority: openAuthority,
        continuationRef,
        response,
      },
    ),
  );
  assert.equal(responded.disposition, "succeeded", JSON.stringify(responded));
  const completed = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.run.continue",
      "current_intent",
      "invocation://t272/external-one-surface/continue",
      {
        actorRef,
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority: JSON.parse(
          JSON.stringify(responded.result.continuationAuthority),
        ),
        continuationRef,
      },
    ),
  );
  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  assert.equal(
    completed.disposition,
    "succeeded",
    JSON.stringify({
      completed,
      runtimeFailures: events.filter(
        (event) => event.kind === "runtime_failure_observed",
      ),
    }),
  );
  assert.equal(completed.result.kind, "next_action_projection");
  assert.equal(completed.result.schemaVersion, "5.0.0");
  assert.equal(completed.result.disposition, "converged");
  assert.equal(
    completed.result.constructionIntentRef,
    frontier.result.constructionIntentRef,
  );
  assert.equal(completed.result.targetOutcomeRef, mini.ids.targetOutcomeRef);
  assert.deepEqual(completed.result.lawfulBasisRefs, [
    completed.result.constructionIntentRef,
    completed.result.edgeClosureDecisionRef,
    completed.result.gapRef,
  ]);
  assert.equal(completed.continuationStatus, "resolved");
  assert.equal(completed.runId, held.runId);
  assert.equal(completed.replayAgreement, true);
  assert.deepEqual(
    events
      .filter((event) => event.kind === "c_call_opened")
      .map((event) => event.payload.programLocusRef),
    [
      mini.ids.synthesizeModelLocusRef,
      mini.ids.evalGapLocusRef,
      mini.ids.evaluateNextLocusRef,
      mini.ids.interactionLocusRef,
      mini.ids.evaluateActionLocusRef,
      mini.ids.refreshModelLocusRef,
      mini.ids.refreshGapLocusRef,
      mini.ids.refreshEvaluateNextLocusRef,
    ],
  );
  assert.deepEqual(
    events
      .filter((event) => event.kind === "c_call_result_admitted")
      .map((event) => event.payload.value.kind),
    [
      "observation_snapshot",
      "next_action_basis",
      "next_action_projection",
      "fh_pending_result",
      "action_evaluation_projection",
      "observation_snapshot",
      "next_action_basis",
      "next_action_projection",
    ],
  );
  const intentEvent = events.find(
    (event) =>
      event.kind === "construction_intent_selected" &&
      event.payload.constructionIntentRef ===
        frontier.result.constructionIntentRef,
  );
  const interactionOpened = events.find(
    (event) => event.kind === "fh_interaction_opened",
  );
  const interactionResponded = events.find(
    (event) => event.kind === "fh_interaction_responded",
  );
  const interactionResumed = events.find(
    (event) => event.kind === "fh_interaction_resume_admitted",
  );
  const constructionDelta = events.find(
    (event) =>
      event.kind === "construction_delta_observed" &&
      event.payload.constructionIntentRef ===
        frontier.result.constructionIntentRef,
  );
  const refreshOpened = events.find(
    (event) =>
      event.kind === "c_call_opened" &&
      event.payload.programLocusRef === mini.ids.refreshModelLocusRef,
  );
  const runClosed = events.find((event) => event.kind === "run_closed");
  assert.ok(intentEvent);
  assert.ok(interactionOpened);
  assert.ok(interactionResponded);
  assert.ok(interactionResumed);
  assert.ok(constructionDelta);
  assert.ok(refreshOpened);
  assert.ok(runClosed);
  assert.equal(
    intentEvent.payload.nextActionProjectionRef,
    frontier.result.nextActionProjection.projectionRef,
  );
  assert.equal(
    intentEvent.payload.constructionIntent.targetProgramLocusRef,
    mini.ids.interactionLocusRef,
  );
  assert.equal(
    intentEvent.payload.constructionIntent.constructionCompositionRef,
    mini.ids.oneSurfaceCompositionRef,
  );
  assert.equal(
    intentEvent.payload.constructionIntent.nextActionAuthorityRef,
    mini.ids.evaluateNextAuthorityRef,
  );
  assert.equal(
    interactionOpened.payload.constructionIntentRef,
    frontier.result.constructionIntentRef,
  );
  assert.ok(
    intentEvent.admissionOrdinal < interactionOpened.admissionOrdinal,
  );
  assert.ok(
    interactionOpened.admissionOrdinal <
      interactionResponded.admissionOrdinal,
  );
  assert.ok(
    interactionResponded.admissionOrdinal <
      interactionResumed.admissionOrdinal,
  );
  assert.ok(
    interactionResumed.admissionOrdinal <
      constructionDelta.admissionOrdinal,
  );
  assert.ok(
    constructionDelta.admissionOrdinal < refreshOpened.admissionOrdinal,
  );
  assert.ok(refreshOpened.admissionOrdinal < runClosed.admissionOrdinal);
  assert.equal(
    constructionDelta.payload.edgeClosureDecisionRef,
    completed.result.edgeClosureDecisionRef,
  );
  assert.equal(
    constructionDelta.payload.actionEvaluation.kind,
    "action_evaluation_projection",
  );
  assert.deepEqual(
    constructionDelta.payload.edgeFulfillmentLedger.rows,
    [{
      obligationRef: mini.ids.approvalObligationRef,
      evidenceRefs: [interactionResponded.payload.responseRef],
      evidenceAssetRefs: [mini.ids.approvalAssetRef],
      disposition: "fulfilled",
    }],
  );
  assert.equal(
    constructionDelta.payload.edgeClosureDecision.disposition,
    "close_candidate",
  );
  assert.equal(
    constructionDelta.payload.constructionCompositionRef,
    mini.ids.oneSurfaceCompositionRef,
  );
  assert.match(
    constructionDelta.payload.actionEvaluationAdmissionRef,
    /^action-evaluation-admission:\/\/abiogenesis\//u,
  );
  assert.match(
    constructionDelta.payload.actionEvaluationAdmissionDigest,
    /^sha256:[a-f0-9]{64}$/u,
  );
  assert.equal(
    constructionDelta.payload.actionEvaluationAdmission.kind,
    "admitted_action_evaluation",
  );
  assert.equal(
    constructionDelta.payload.actionEvaluationAdmission
      .actionEvaluationAdmissionRef,
    constructionDelta.payload.actionEvaluationAdmissionRef,
  );
  assert.equal(
    constructionDelta.payload.actionEvaluationAdmission
      .actionEvaluationAdmissionDigest,
    constructionDelta.payload.actionEvaluationAdmissionDigest,
  );
  const {
    kind: _admissionKind,
    schemaVersion: _admissionSchemaVersion,
    actionEvaluationAdmissionRef: _admissionRef,
    actionEvaluationAdmissionDigest: _admissionDigest,
    ...actionEvaluationAdmissionBody
  } = constructionDelta.payload.actionEvaluationAdmission;
  assert.equal(
    sha256Canonical(actionEvaluationAdmissionBody),
    constructionDelta.payload.actionEvaluationAdmissionDigest,
  );
  assert.equal(
    constructionDelta.payload.runtimeEvidenceEventRefs.every(
      (eventRef) => events.some((event) => event.eventId === eventRef),
    ),
    true,
  );
  const admittedInvocation = events.find(
    (event) => event.kind === "invocation_admitted",
  );
  assert.equal(admittedInvocation.payload.invocationVariant, "start");
  assert.equal(
    admittedInvocation.payload.graphFunctionRef,
    mini.ids.oneSurfaceGraphFunctionRef,
  );
  assert.equal(events.filter((event) => event.kind === "run_closed").length, 1);
});

test("M5 derives governed construction closure from replay truth rather than terminal labels", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const publicApi = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?external-one-surface-closure-mutations=${Date.now()}`
  );

  await context.test(
    "refuses terminal closure immediately after evaluateAction",
    async () => {
      const result = await oneSurfaceAdmissionRefusal(
        publicApi,
        harness,
        mini,
        "external-one-surface-early-evaluate-action-terminal",
        withOneSurfaceTerminal(mini, 4),
      );
      assert.equal(
        result.outcomes[5].disposition,
        "refused",
        JSON.stringify(result.outcomes),
      );
      assert.match(
        result.outcomes[5].result.message,
        /construction composition/u,
      );
      assert.equal(result.outcomes.at(-1).runId, null);
    },
  );

  await context.test(
    "accepts convergence after every descriptive stage role is renamed",
    async () => {
      const result = await oneSurfaceLifecycle(
        publicApi,
        harness,
        mini,
        "external-one-surface-renamed-terminal-role",
        withRenamedOneSurfaceRoles(mini),
      );
      assert.equal(
        result.completed.disposition,
        "succeeded",
        JSON.stringify(result.completed),
      );
      assert.equal(
        result.events.filter((event) => event.kind === "run_closed").length,
        1,
      );
    },
  );

  await context.test(
    "refuses terminal closure directly from the F_H resume",
    async () => {
      const result = await oneSurfaceAdmissionRefusal(
        publicApi,
        harness,
        mini,
        "external-one-surface-terminal-fh-resume",
        withOneSurfaceTerminal(mini, 3),
      );
      assert.equal(
        result.outcomes[5].disposition,
        "refused",
        JSON.stringify(result.outcomes),
      );
      assert.match(
        result.outcomes[5].result.message,
        /construction composition/u,
      );
      assert.equal(result.outcomes.at(-1).runId, null);
    },
  );

  await context.test(
    "refuses the old scalar approval input in place of ActionEvaluationBasis",
    async () => {
      const result = await oneSurfaceLifecycle(
        publicApi,
        harness,
        mini,
        "external-one-surface-scalar-evaluation-basis",
        withScalarActionEvaluation(mini),
      );
      assert.notEqual(result.completed.disposition, "succeeded");
      assert.equal(
        result.events.filter(
          (event) => event.kind === "construction_delta_observed",
        ).length,
        0,
      );
      assert.equal(
        result.events.filter((event) => event.kind === "run_closed").length,
        0,
      );
    },
  );

  await context.test(
    "refuses a ledger and decision that omit the admitted evidence",
    async () => {
      const result = await oneSurfaceLifecycle(
        publicApi,
        harness,
        mini,
        "external-one-surface-incomplete-evidence-ledger",
        withIncompleteActionEvidence(mini),
      );
      assert.notEqual(result.completed.disposition, "succeeded");
      assert.equal(
        result.events.filter(
          (event) => event.kind === "construction_delta_observed",
        ).length,
        0,
      );
      assert.equal(
        result.events.filter((event) => event.kind === "run_closed").length,
        0,
      );
    },
  );
});

test("M5 admits construction truth only against the exact Product and runtime basis", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const publicApi = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?external-one-surface-authority-mutations=${Date.now()}`
  );
  const traversalRoute = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/abg/traversal_route.js",
    )).href}?external-one-surface-lineage=${Date.now()}`
  );

  await context.test(
    "refuses run closure while another frame retains an unresolved construction intent",
    () => {
      const program = mini.publication.programs.find(
        (candidate) =>
          candidate.programRef === mini.ids.oneSurfaceProgramRef,
      );
      assert.ok(program?.constructionComposition);
      const composition = program.constructionComposition;
      const intent = (ordinal, frameId, intentRef) => ({
        kind: "construction_intent_selected",
        runId: "run://lineage-mutation",
        graphCallId: `graph-call://${frameId}`,
        frameId,
        admissionOrdinal: ordinal,
        payload: {
          constructionIntentRef: intentRef,
          constructionIntentDigest: `sha256:${String(ordinal).padStart(64, "0")}`,
        },
      });
      const delta = (ordinal, source) => ({
        kind: "construction_delta_observed",
        runId: source.runId,
        graphCallId: source.graphCallId,
        frameId: source.frameId,
        admissionOrdinal: ordinal,
        payload: {
          constructionIntentRef:
            source.payload.constructionIntentRef,
          constructionIntentDigest:
            source.payload.constructionIntentDigest,
          constructionCompositionRef: composition.compositionRef,
          constructionCompositionDigest: composition.compositionDigest,
          actionEvaluationAdmissionRef:
            `action-evaluation-admission://mutation/${ordinal}`,
          actionEvaluationAdmissionDigest:
            `sha256:${String(ordinal).padStart(64, "0")}`,
        },
      });
      const first = intent(1, "frame://lineage/one", "intent://lineage/one");
      const second = intent(3, "frame://lineage/two", "intent://lineage/two");
      const events = [first, delta(2, first), second];
      assert.equal(
        traversalRoute.hasResolvedRunConstructionIntentLineage(
          events,
          first.runId,
          composition.compositionRef,
          composition.compositionDigest,
        ),
        false,
      );
      assert.equal(
        traversalRoute.hasResolvedRunConstructionIntentLineage(
          [...events, delta(4, second)],
          first.runId,
          composition.compositionRef,
          composition.compositionDigest,
        ),
        true,
      );
    },
  );

  await context.test(
    "refuses a Product-valid substituted construction policy before intent admission",
    async () => {
      const result = await oneSurfaceStart(
        publicApi,
        harness,
        mini,
        "external-one-surface-substituted-policy",
        withSubstitutedPolicy(mini),
      );
      assert.notEqual(result.outcome.disposition, "held");
      assert.equal(
        result.events.some(
          (event) =>
            event.kind === "c_call_result_admitted" &&
            event.payload.value?.kind === "next_action_basis" &&
            event.payload.value?.declaredPolicy?.policyRef?.includes(
              "substituted",
            ),
        ),
        true,
      );
      assert.equal(
        result.events.some(
          (event) => event.kind === "construction_intent_selected",
        ),
        false,
      );
      assert.equal(
        result.events.some((event) => event.kind === "fh_interaction_opened"),
        false,
      );
    },
  );

  await context.test(
    "refuses a Product-valid action candidate absent from the admitted catalog at intent admission",
    async () => {
      const result = await oneSurfaceStart(
        publicApi,
        harness,
        mini,
        "external-one-surface-missing-action",
        withMissingAction(mini),
      );
      assert.notEqual(result.outcome.disposition, "held");
      assert.equal(
        result.events.some(
          (event) =>
            event.kind === "c_call_result_admitted" &&
            event.payload.value?.kind === "next_action_projection" &&
            event.payload.value?.selectedActionRef?.includes(
              "unpublished-substitute",
            ),
        ),
        true,
      );
      assert.equal(
        result.events.some(
          (event) => event.kind === "construction_intent_selected",
        ),
        false,
      );
    },
  );

  await context.test(
    "refuses expected but unobserved output assets before continuation resume",
    async () => {
      const result = await oneSurfaceLifecycle(
        publicApi,
        harness,
        mini,
        "external-one-surface-unproven-output",
        mini.publication,
        {
          response: (frontier) => ({
            kind: "developer_human_approval",
            schemaVersion: "5.0.0",
            approved: true,
            constructionIntentRef: frontier.result.constructionIntentRef,
            message: "Welcome Margaret.",
            semanticEvidenceAssetRefs: [],
          }),
        },
      );
      assert.equal(result.responded.disposition, "succeeded");
      assert.equal(result.completed.disposition, "refused");
      assert.equal(
        result.events.some(
          (event) => event.kind === "fh_interaction_resume_admitted",
        ),
        false,
      );
      assert.equal(
        result.events.some(
          (event) => event.kind === "construction_delta_observed",
        ),
        false,
      );
      assert.equal(
        result.events.some((event) => event.kind === "run_closed"),
        false,
      );
    },
  );

  await context.test(
    "refuses a self-consistent workspace fork during action evaluation",
    async () => {
      const result = await oneSurfaceLifecycle(
        publicApi,
        harness,
        mini,
        "external-one-surface-substituted-workspace",
        withSubstitutedWorkspace(mini),
      );
      assert.notEqual(result.completed.disposition, "succeeded");
      assert.equal(
        result.events.some(
          (event) =>
            event.kind === "c_call_result_admitted" &&
            event.payload.value?.kind === "action_evaluation_projection" &&
            event.payload.value?.observationSnapshot?.workspaceBinding
              ?.workspaceBindingId?.includes("substituted-workspace"),
        ),
        true,
      );
      assert.equal(
        result.events.some(
          (event) => event.kind === "construction_delta_observed",
        ),
        false,
      );
      assert.equal(
        result.events.some((event) => event.kind === "run_closed"),
        false,
      );
    },
  );

  await context.test(
    "totalizes an installed-byte failure after continuation resume",
    async () => {
      const result = await oneSurfaceLifecycle(
        publicApi,
        harness,
        mini,
        "external-one-surface-post-resume-failure",
        mini.publication,
        {
          afterRespond: async ({ scenario }) => {
            const installedModule = join(
              scenario.miniInstalledRoot,
              "build/index.js",
            );
            const bytes = await readFile(installedModule, "utf8");
            await writeFile(installedModule, `${bytes}\n`, "utf8");
          },
        },
      );
      assert.equal(result.completed.disposition, "refused");
      assert.equal(
        result.events.some(
          (event) => event.kind === "fh_interaction_resume_admitted",
        ),
        true,
      );
      const failure = result.events.find(
        (event) =>
          event.kind === "runtime_failure_observed" &&
          event.payload.diagnosticRef ===
            "diagnostic://abiogenesis/continuation/post-resume-failure@5",
      );
      assert.ok(failure);
      assert.equal(
        result.events.some((event) => event.kind === "run_closed"),
        false,
      );
    },
  );
});

test("M5 refuses a Product-valid F_H response bound to a different construction intent", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const scenario = await externalScenario(
    harness,
    mini,
    "external-one-surface-wrong-intent",
    mini.publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: "Margaret",
      },
    },
  );
  const publicApi = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?external-one-surface-wrong-intent=${Date.now()}`
  );
  const operationContext = publicApi.createRootOperationContext();
  const setupOutcomes = [];
  try {
    for (const row of scenario.transcript.slice(0, -1)) {
      setupOutcomes.push(
        await publicApi.applyRootPublicInvocation(operationContext, row),
      );
    }
    const start = structuredClone(scenario.transcript.at(-1));
    start.payload.input = oneSurfaceObservation(
      mini,
      mini.publication,
      setupOutcomes[4].result,
      "Margaret",
    );
    setupOutcomes.push(
      await publicApi.applyRootPublicInvocation(operationContext, start),
    );
  } finally {
    publicApi.closeRootOperationContext(operationContext);
  }
  assert.equal(
    setupOutcomes.slice(0, -1).every(
      (outcome) => outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(setupOutcomes),
  );
  const held = setupOutcomes.at(-1);
  assert.equal(held.disposition, "held", JSON.stringify(held));
  const openAuthority = JSON.parse(
    JSON.stringify(held.result.continuationAuthority),
  );
  const frontier = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "status",
      "invocation://t272/external-one-surface-wrong-intent/read",
      {
        continuationAuthority: openAuthority,
        continuationRef: held.continuationRef,
      },
    ),
  );
  assert.equal(frontier.disposition, "succeeded", JSON.stringify(frontier));

  const refused = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.interaction.respond",
      "approve",
      "invocation://t272/external-one-surface-wrong-intent/respond",
      {
        actorRef: "actor://developer.example/trusted-developer",
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority: openAuthority,
        continuationRef: held.continuationRef,
        response: {
          kind: "developer_human_approval",
          schemaVersion: "5.0.0",
          approved: true,
          constructionIntentRef:
            `construction-intent://abiogenesis/${"0".repeat(64)}`,
          message: "Welcome Margaret.",
          semanticEvidenceAssetRefs: [mini.ids.approvalAssetRef],
        },
      },
    ),
  );
  assert.equal(refused.disposition, "refused", JSON.stringify(refused));
  assert.equal(refused.result.code, "owner_refusal");
  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  assert.equal(
    events.filter((event) => event.kind === "fh_interaction_responded").length,
    0,
  );
  assert.equal(
    events.filter((event) => event.kind === "run_closed").length,
    0,
  );
});
