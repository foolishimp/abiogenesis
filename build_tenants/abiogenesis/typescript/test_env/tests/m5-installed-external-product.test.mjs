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
  const publicApi = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?external-one-surface=${Date.now()}`
  );
  const operationContext = publicApi.createRootOperationContext();
  const setupOutcomes = [];
  try {
    for (const row of scenario.transcript.slice(0, -1)) {
      setupOutcomes.push(
        await publicApi.applyRootPublicInvocation(operationContext, row),
      );
    }
    const validStart = scenario.transcript.at(-1);
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
  assert.deepEqual(completed.result, {
    kind: "developer_action_evaluation",
    schemaVersion: "5.0.0",
    constructionIntentRef: frontier.result.constructionIntentRef,
    targetOutcomeRef: mini.ids.targetOutcomeRef,
    decision: "close",
    message: "Welcome Margaret.",
  });
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
    ],
  );
  assert.deepEqual(
    events
      .filter((event) => event.kind === "c_call_result_admitted")
      .map((event) => event.payload.value.kind),
    [
      "developer_product_asset_model",
      "developer_gap_projection",
      "next_action_projection",
      "fh_pending_result",
      "developer_action_evaluation",
    ],
  );
  const intentRoute = events.find(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.constructionIntentRef ===
        frontier.result.constructionIntentRef,
  );
  const interactionOpened = events.find(
    (event) => event.kind === "fh_interaction_opened",
  );
  assert.ok(intentRoute);
  assert.ok(interactionOpened);
  assert.equal(
    intentRoute.payload.nextActionProjectionRef,
    frontier.result.nextActionProjection.projectionRef,
  );
  assert.equal(
    intentRoute.payload.constructionIntent.targetProgramLocusRef,
    mini.ids.interactionLocusRef,
  );
  assert.equal(
    interactionOpened.payload.constructionIntentRef,
    frontier.result.constructionIntentRef,
  );
  assert.ok(
    intentRoute.admissionOrdinal < interactionOpened.admissionOrdinal,
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
