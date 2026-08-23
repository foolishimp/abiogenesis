import assert from "node:assert/strict";
import { access, mkdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import {
  applyCatalogDeclaration,
  buildGraphFunctionCatalog,
  narrowGraphFunctionCatalog,
  sha256Canonical,
} from "../../build/code/src/product/index.js";

import { prepareFlavoredCatalogProduct } from
  "../support/flavored-catalog-product.mjs";
import {
  constructClosedCatalogReadinessBasis,
  importInstalledPackageExport,
  runInstalledCli,
  runInstalledCodex,
  setupInstalledCliHarness as setupInstalledCliHarnessBase,
  writeCliTransportRequest,
} from "../support/root-cli-environment.mjs";

const packageRoot = new URL("../..", import.meta.url).pathname;

function setupInstalledCliHarness(context, root) {
  return setupInstalledCliHarnessBase(context, root, {
    candidateBasisSource: "packed_artifact",
  });
}

function invocation(operationId, variant, invocationRef, payload) {
  return {
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    operationId,
    variant,
    invocationRef,
    eventTime: "2026-07-25T00:00:00.000Z",
    correlationId: "correlation://t281/s06-portability",
    payload,
  };
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

function assertLiteralCarrierFlow(scenario) {
  const catalog = scenario.preRunOutcomes[6].result;
  const catalogView = scenario.preRunOutcomes[7].result;
  const applications = [
    scenario.preRunOutcomes[8].result,
    scenario.preRunOutcomes[9].result,
  ];
  assert.deepEqual(scenario.carrierFamily, {
    catalog,
    catalogView,
    applications,
  });
  assert.deepEqual(scenario.transcript[7].payload.catalog, catalog);
  for (const request of scenario.transcript.slice(8, 10)) {
    assert.deepEqual(request.payload.catalog, catalog);
    assert.deepEqual(request.payload.catalogView, catalogView);
  }
  const runPayload = scenario.transcript[10].payload;
  assert.deepEqual(runPayload.catalog, catalog);
  assert.deepEqual(runPayload.catalogView, catalogView);
  assert.deepEqual(runPayload.applications, applications);
}

function portableCarrierSemantics(carrierFamily) {
  return {
    catalogEntries: carrierFamily.catalog.entries,
    declarationEntries: carrierFamily.catalog.declarationEntries,
    viewEntries: carrierFamily.catalogView.entries,
    viewDeclarationEntries: carrierFamily.catalogView.declarationEntries,
    applications: carrierFamily.applications.map((application) => ({
      kind: application.kind,
      declaration: application.declaration,
      targetRef: application.targetRef,
      targetDigest: application.targetDigest,
      appliedValueRef: application.appliedValueRef,
      appliedValueDigest: application.appliedValueDigest,
    })),
  };
}

async function portabilityScenario(
  harness,
  flavored,
  label,
  expectReady = true,
  episodeTransport = "sdk",
) {
  if (!["sdk", "cli", "codex"].includes(episodeTransport)) {
    throw new TypeError("portability scenario requires one explicit transport");
  }
  const root = join(harness.scratch, label);
  const abiConsumer = join(root, "abiogenesis-product");
  const flavoredConsumer = join(root, "flavored-product");
  const workspaceRoot = join(root, "workspace");
  const abiInstalledRoot = join(
    abiConsumer,
    "node_modules",
    "@abiogenesis",
    "typescript-tenant",
  );
  const flavoredInstalledRoot = join(
    flavoredConsumer,
    "node_modules",
    "@abiogenesis-fixtures",
    "flavored-catalog-product",
  );
  const eventLogRoot = join(workspaceRoot, ".ai-workspace/events");
  const eventLogPath = join(eventLogRoot, "flavored-product.events.jsonl");
  const prefix = `invocation://t281/${label}`;
  const refs = {
    verifyAbi: `${prefix}/verify-abiogenesis`,
    resolve: `${prefix}/resolve-products`,
    installAbi: `${prefix}/install-abiogenesis`,
    verifyFlavored: `${prefix}/verify-flavored`,
    installFlavored: `${prefix}/install-flavored`,
    bind: `${prefix}/workspace-bind`,
    catalog: `${prefix}/catalog-admit`,
    view: `${prefix}/catalog-view`,
    applyNode: `${prefix}/catalog-apply-node`,
    applyOverlay: `${prefix}/catalog-apply-overlay`,
    run: `${prefix}/run-invoke`,
  };
  const allowlist = [
    flavored.ids.nodeTypeHandle,
    flavored.ids.overlayHandle,
    flavored.ids.graphFunctionRef,
  ];
  const workspaceId = `workspace://t281/${label}`;
  const authorizedActorRef = "actor://flavor.example/trusted-developer";
  const authorityManifestRef = `manifest://t281/${label}/workspace-authority`;
  const roots = {
    toolchainRoot: abiInstalledRoot,
    productRoot: flavoredInstalledRoot,
    eventLogRoot,
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  };
  await mkdir(root, { recursive: true });
  await mkdir(workspaceRoot, { recursive: true });

  const installedPublic = episodeTransport === "sdk"
    ? await importInstalledPackageExport(
        harness,
        "@abiogenesis/typescript-tenant/public",
        `setup-episode=${Date.now()}-${Math.random()}`,
      )
    : null;
  const setupContext = installedPublic?.createRootOperationContext(eventLogPath);
  const transportRuns = [];
  let closeHandoff = null;
  const executeEpisode = async (request, ordinal) => {
    if (episodeTransport === "sdk") {
      return installedPublic.applyRootPublicInvocation(
        setupContext,
        request,
      );
    }
    const episodePath = join(
      root,
      `portability.episode-${String(ordinal).padStart(2, "0")}.jsonl`,
    );
    await writeCliTransportRequest(episodePath, {
      acquisition: closeHandoff === null
        ? { kind: "new", eventLogPath }
        : { kind: "reopen", closeHandoff },
      invocation: request,
    });
    const transportRun = episodeTransport === "cli"
      ? await runInstalledCli(harness, { transcriptPath: episodePath })
      : await runInstalledCodex(harness, { transcriptPath: episodePath });
    const exactRun = transportRun.transportRuns.at(-1);
    assert.notEqual(exactRun.transportResult, null, exactRun.stderr);
    closeHandoff = exactRun.transportResult.closeHandoff;
    transportRuns.push(exactRun);
    return exactRun.transportResult.outcome;
  };
  const requireSuccess = (outcome) => {
    assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    return outcome.result;
  };

  const setupTranscript = [];
  const setupOutcomes = [];
  const verifyAbiRequest = invocation(
    "abg.operation.product.verify",
    "artifact",
    refs.verifyAbi,
    {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    },
  );
  setupTranscript.push(verifyAbiRequest);
  const verifyAbiOutcome = await executeEpisode(verifyAbiRequest, 0);
  setupOutcomes.push(verifyAbiOutcome);
  const verifiedAbi = requireSuccess(verifyAbiOutcome);

  const verifyFlavoredRequest = invocation(
    "abg.operation.product.verify",
    "artifact",
    refs.verifyFlavored,
    {
      artifactPath: flavored.artifactPath,
      artifactRef: flavored.artifactRef,
      ...expectedVerificationIdentity(flavored.basis),
    },
  );
  setupTranscript.push(verifyFlavoredRequest);
  const verifyFlavoredOutcome = await executeEpisode(verifyFlavoredRequest, 1);
  setupOutcomes.push(verifyFlavoredOutcome);
  const verifiedFlavored = requireSuccess(verifyFlavoredOutcome);

  const resolveRequest = invocation(
    "abg.operation.product.resolve",
    "verified_product_set",
    refs.resolve,
    {
      verifiedProductInputs: [
        { artifactPath: harness.artifactPath, verifiedProduct: verifiedAbi },
        { artifactPath: flavored.artifactPath, verifiedProduct: verifiedFlavored },
      ],
    },
  );
  setupTranscript.push(resolveRequest);
  const resolveOutcome = await executeEpisode(resolveRequest, 2);
  setupOutcomes.push(resolveOutcome);
  const resolvedLock = requireSuccess(resolveOutcome);

  const installAbiRequest = invocation(
    "abg.operation.product.install",
    "verified_artifact",
    refs.installAbi,
    {
      artifactPath: harness.artifactPath,
      verifiedProduct: verifiedAbi,
      resolvedLock,
      targetRoot: abiConsumer,
    },
  );
  setupTranscript.push(installAbiRequest);
  const installAbiOutcome = await executeEpisode(installAbiRequest, 3);
  setupOutcomes.push(installAbiOutcome);
  requireSuccess(installAbiOutcome);

  const installFlavoredRequest = invocation(
    "abg.operation.product.install",
    "verified_artifact",
    refs.installFlavored,
    {
      artifactPath: flavored.artifactPath,
      verifiedProduct: verifiedFlavored,
      resolvedLock,
      targetRoot: flavoredConsumer,
    },
  );
  setupTranscript.push(installFlavoredRequest);
  const installFlavoredOutcome = await executeEpisode(
    installFlavoredRequest,
    4,
  );
  setupOutcomes.push(installFlavoredOutcome);
  requireSuccess(installFlavoredOutcome);

  const workspaceRequest = invocation(
    "abg.operation.workspace.bind",
    "exact_product_set",
    refs.bind,
    {
      installInvocationRefs: [refs.installAbi, refs.installFlavored],
      workspaceId,
      canonicalRoot: workspaceRoot,
      authorizedActorRef,
      authorityManifestRef,
      roots,
    },
  );
  setupTranscript.push(workspaceRequest);
  const workspaceOutcome = await executeEpisode(workspaceRequest, 5);
  setupOutcomes.push(workspaceOutcome);
  requireSuccess(workspaceOutcome);
  if (episodeTransport === "sdk") {
    closeHandoff = installedPublic.projectRootOperationContextAuthority(
      setupContext,
    );
  }

  const installedAbg = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/abg",
    `portability-owner-projection=${Date.now()}-${Math.random()}`,
  );
  const artifactTruth = installedAbg.projectExactPrefixArtifactTruth(
    closeHandoff.prefix,
  );
  assert.equal(
    artifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(artifactTruth),
  );
  const readinessBasis = constructClosedCatalogReadinessBasis({
    abg: installedAbg,
    artifactTruth,
    verifiedProducts: [verifiedAbi, verifiedFlavored],
    resolvedLock,
    installInvocationRefs: [refs.installAbi, refs.installFlavored],
    workspaceBindingInvocationRef: refs.bind,
    publications: [flavored.publication],
  });
  if (!expectReady) return { readinessBasis };

  const executionTranscript = [];
  const preRunOutcomes = [...setupOutcomes];
  const executePreRun = async (request, ordinal) => {
    executionTranscript.push(request);
    const outcome = await executeEpisode(request, ordinal);
    preRunOutcomes.push(outcome);
    requireSuccess(outcome);
    return outcome;
  };
  const catalogOutcome = await executePreRun(invocation(
      "abg.operation.catalog.admit",
      "module_publication",
      refs.catalog,
      {
        readinessBasis,
      },
    ), 6);
  const catalog = catalogOutcome.result;
  assert.equal(catalog.kind, "graph_function_catalog");
  assert.deepEqual(
    catalog,
    harness.product.admitGraphFunctionCatalog(readinessBasis),
  );
  const viewOutcome = await executePreRun(invocation(
    "abg.operation.catalog.view",
    "allowlist",
    refs.view,
    { catalog, allowlist },
  ), 7);
  const catalogView = viewOutcome.result;
  assert.equal(catalogView.kind, "graph_function_catalog_view");
  assert.deepEqual(
    catalogView,
    harness.product.narrowGraphFunctionCatalog(catalog, allowlist),
  );
  const nodeApplicationRequest = invocation(
      "abg.operation.catalog.apply",
      "node_type",
      refs.applyNode,
      {
        catalog,
        catalogView,
        contributorRef: flavored.basis.productId,
        handle: flavored.ids.nodeTypeHandle,
        target: {
          kind: "program",
          programRef: flavored.ids.programRef,
        },
        value: flavored.nodeTypeValue,
      },
    );
  const nodeApplicationOutcome = await executePreRun(
    nodeApplicationRequest,
    8,
  );
  const overlayApplicationRequest = invocation(
      "abg.operation.catalog.apply",
      "overlay",
      refs.applyOverlay,
      {
        catalog,
        catalogView,
        contributorRef: flavored.basis.productId,
        handle: flavored.ids.overlayHandle,
        value: flavored.overlayValue,
      },
    );
  const overlayApplicationOutcome = await executePreRun(
    overlayApplicationRequest,
    9,
  );
  const applications = [
    nodeApplicationOutcome.result,
    overlayApplicationOutcome.result,
  ];
  assert.deepEqual(
    applications.map((application) => application.kind),
    ["declaration_application", "declaration_application"],
  );
  const runtimePrefixAuthority = closeHandoff;
  const runRequest = invocation("abg.operation.run.invoke", "direct", refs.run, {
      installInvocationRef: refs.installFlavored,
      workspaceBindingInvocationRef: refs.bind,
      catalog,
      catalogView,
      applications,
      programRef: flavored.ids.programRef,
      catalogHandle: flavored.ids.graphFunctionRef,
      actorRef: "actor://flavor.example/trusted-developer",
      input: {
        kind: "flavored_text_input",
        schemaVersion: "5.0.0",
        text: "portable product",
        tone: "bright",
      },
      eventLogPath,
      runtimePrefixAuthority,
    });
  executionTranscript.push(runRequest);
  const transcript = [...setupTranscript, ...executionTranscript];
  const transcriptPath = join(root, "portability.transcript.jsonl");
  const finalTransportRequest = await writeCliTransportRequest(transcriptPath, {
    acquisition: { kind: "reopen", closeHandoff },
    invocation: runRequest,
  });
  return {
    abiConsumer,
    eventLogPath,
    flavoredConsumer,
    refs,
    transcript,
    setupOutcomes,
    preRunOutcomes,
    transportRuns,
    transportExecutor: episodeTransport === "sdk" ? undefined : episodeTransport,
    episodeTransport,
    transportRequests: transportRuns.map((run) => run.transportRequest),
    transportResults: transportRuns.map((run) => run.transportResult),
    ownerProjections: { artifactTruth },
    closeHandoff,
    finalTransportRequest,
    carrierFamily: { catalog, catalogView, applications },
    transcriptPath,
    workspaceRoot,
  };
}

function assertPortableOutcome(run, flavored, carrierFamily) {
  assert.equal(
    run.exitCode,
    0,
    JSON.stringify({ outcomes: run.outcomes, stderr: run.stderr }, null, 2),
  );
  assert.ok(run.outcomes.length === 1 || run.outcomes.length === 11);
  assert.ok(run.outcomes.every((outcome) =>
    outcome.disposition === "succeeded"
  ));
  const runtimeOnly = run.outcomes.length === 1;
  const nodeApplication = run.outcomes[8];
  const overlayApplication = run.outcomes[9];
  const outcome = run.outcomes.at(-1);
  if (!runtimeOnly) assert.deepEqual(run.outcomes[2].result.dependencyEdges, [{
    kind: "requires",
    fromProductId: flavored.basis.productId,
    toProductId: run.outcomes[0].result.productId,
    packageVersion: "5.0.0-dev.287",
    compatibilityRef: "compatibility://abiogenesis/major/5",
    compatibilityDisposition: "compatible",
    requiredContractRefs: [
      "abg.contract.gtl.root-declaration",
      "abg.contract.product.verification",
      "abg.schema.public-operation-invocation",
    ],
    requiredCapabilityRefs: [
      "abg.capability.catalog.invoke-graph-function@5",
      "abg.capability.gtl.declare@5",
    ],
  }]);
  if (!runtimeOnly) assert.match(
    run.outcomes[2].result.nativeContractClosureDigest,
    /^sha256:[0-9a-f]{64}$/u,
  );
  if (!runtimeOnly) assert.deepEqual(nodeApplication.result, carrierFamily.applications[0]);
  if (!runtimeOnly) assert.deepEqual(overlayApplication.result, carrierFamily.applications[1]);
  if (!runtimeOnly) assert.equal(
    nodeApplication.result.declaration.declarationKind,
    "node_type",
  );
  if (!runtimeOnly) assert.equal(
    overlayApplication.result.declaration.declarationKind,
    "overlay",
  );
  if (!runtimeOnly) assert.equal(Object.hasOwn(nodeApplication.result, "admissionEventRef"), false);
  assert.deepEqual(outcome.result, {
    kind: "flavored_text_output",
    schemaVersion: "5.0.0",
    rendered: "PORTABLE PRODUCT!",
    styleRef: flavored.ids.styleRef,
  });
  assert.equal(outcome.replayAgreement, true);
  return outcome;
}

test(
  "S06 installs, applies, and invokes one independent flavored Product through SDK, CLI, and bounded delegate",
  async (context) => {
    const harness = await setupInstalledCliHarness(context, packageRoot);
    const flavored = await prepareFlavoredCatalogProduct(
      harness,
    );
    const cliScenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-cli",
      true,
      "cli",
    );
    const cliRun = await runInstalledCli(harness, cliScenario);
    assertLiteralCarrierFlow(cliScenario);
    const cliOutcome = assertPortableOutcome(
      cliRun,
      flavored,
      cliScenario.carrierFamily,
    );
    const installedAbg = await importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/abg",
      `terminal-quiescence=${Date.now()}`,
    );
    const cliEvents = installedAbg.readRuntimeEventsAtDurablePrefix(
      cliRun.transportResults.at(-1).closeHandoff.prefix,
    );
    const terminalPrefix = installedAbg.selectValidatedRuntimeEventPrefix(
      cliEvents,
      { runId: cliOutcome.runId },
    );
    const quiescence = installedAbg.projectRunQuiescence(terminalPrefix);
    assert.equal(quiescence.disposition, "quiescent_for_close");
    assert.deepEqual(quiescence.blockingFluents, []);
    for (const requiredKind of ["frame_closed", "graph_call_closed", "run_closed"]) {
      assert.ok(
        cliEvents.some((event) => event.kind === requiredKind),
        `installed execution prefix must carry ${requiredKind}`,
      );
    }
    const terminalOrdinal = cliEvents.findIndex((event) =>
      event.kind === "terminal_reached" || event.kind === "run_closed"
    );
    assert.notEqual(terminalOrdinal, -1);
    assert.equal(
      cliEvents.slice(terminalOrdinal + 1).some((event) =>
        event.kind === "traversal_route_admitted" ||
        event.kind === "retry_attempt_started" ||
        event.kind === "recursive_child_traversal_started" ||
        event.kind === "fh_continuation_opened"
      ),
      false,
      "an installed terminal prefix must expose no applicable continuation, retry, or recursion route",
    );
    assert.equal(
      cliEvents.some((event) =>
        event.kind === "public_operation_artifact_admitted" &&
        typeof event.payload?.operationId === "string" &&
        event.payload.operationId.startsWith("abg.operation.catalog.")
      ),
      false,
      "catalog construction, views, and applications must not manufacture runtime-event truth",
    );

    const codexScenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-codex",
      true,
      "codex",
    );
    const codexRun = await runInstalledCodex(harness, codexScenario);
    assertLiteralCarrierFlow(codexScenario);
    const codexOutcome = assertPortableOutcome(
      codexRun,
      flavored,
      codexScenario.carrierFamily,
    );
    assert.ok(codexRun.transportRuns.every((run) => run.executor === "abg.codex"));
    assert.ok(cliRun.transportRuns.every((run) => run.executor === "abg.cli"));
    assert.deepEqual(codexOutcome.result, cliOutcome.result);

    const sdkScenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-sdk",
    );
    assertLiteralCarrierFlow(sdkScenario);
    const installedPublic = await importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/public",
      `portability=${Date.now()}`,
    );
    let operationContext;
    const sdkOutcomes = [...sdkScenario.preRunOutcomes];
    try {
      const unrelatedWorkspaceRun = {
        ...sdkScenario.transcript.at(-1),
        invocationRef:
          "invocation://t281/unrelated-workspace/readiness-negative",
        payload: {
          ...sdkScenario.transcript.at(-1).payload,
          eventLogPath: join(
            sdkScenario.workspaceRoot,
            ".ai-workspace/events/unrelated-negative.events.jsonl",
          ),
          applications: cliScenario.carrierFamily.applications,
        },
      };
      const unrelatedContext = installedPublic.reopenRootOperationContext(
        sdkScenario.closeHandoff,
      );
      const unrelatedOutcome = await installedPublic.applyRootPublicInvocation(
        unrelatedContext,
        unrelatedWorkspaceRun,
      );
      installedPublic.closeRootOperationContext(unrelatedContext);
      assert.equal(unrelatedOutcome.disposition, "refused");
      assert.equal(unrelatedOutcome.result.code, "target_mismatch");
      operationContext = installedPublic.reopenRootOperationContext(
        sdkScenario.closeHandoff,
      );
      sdkOutcomes.push(
        await installedPublic.applyRootPublicInvocation(
          operationContext,
          sdkScenario.transcript.at(-1),
        ),
      );
    } finally {
      if (operationContext !== undefined) {
        installedPublic.closeRootOperationContext(operationContext);
      }
    }
    const sdkOutcome = assertPortableOutcome(
      { exitCode: 0, stderr: "", outcomes: sdkOutcomes },
      flavored,
      sdkScenario.carrierFamily,
    );
    assert.deepEqual(sdkOutcome.result, cliOutcome.result);
    assert.deepEqual(
      portableCarrierSemantics(codexScenario.carrierFamily),
      portableCarrierSemantics(cliScenario.carrierFamily),
    );
    assert.deepEqual(
      portableCarrierSemantics(sdkScenario.carrierFamily),
      portableCarrierSemantics(cliScenario.carrierFamily),
    );
  },
);

test("S06 exact catalog carrier family refuses forged and legacy inputs before runtime truth", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "carrier-family-negatives",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `carrier-family-negatives=${Date.now()}`,
  );
  const digestForgery = `sha256:${"f".repeat(64)}`;
  const forgedCatalog = structuredClone(scenario.transcript[7]);
  forgedCatalog.invocationRef += "/forged-catalog";
  forgedCatalog.payload.catalog.basisDigest = digestForgery;

  const forgedView = structuredClone(scenario.transcript[8]);
  forgedView.invocationRef += "/forged-view";
  forgedView.payload.catalogView.viewDigest = digestForgery;

  const forgedApplication = structuredClone(scenario.transcript[10]);
  forgedApplication.invocationRef += "/forged-application";
  forgedApplication.payload.applications[0].applicationDigest = digestForgery;

  const legacyCombinedCarrier = structuredClone(scenario.transcript[10]);
  legacyCombinedCarrier.invocationRef += "/legacy-combined-carrier";
  const {
    applications,
    catalog,
    catalogView,
    ...runPayload
  } = legacyCombinedCarrier.payload;
  const legacyCombinedCarrierKey = ["catalog", "Basis"].join("");
  legacyCombinedCarrier.payload = {
    ...runPayload,
    [legacyCombinedCarrierKey]: {
      readinessBasis: catalog.readinessBasis,
      allowlist: catalogView.allowlist,
      applications,
    },
  };

  const cases = [
    {
      label: "forged catalog",
      request: forgedCatalog,
      operationId: "abg.operation.catalog.view",
      code: "target_mismatch",
    },
    {
      label: "forged view",
      request: forgedView,
      operationId: "abg.operation.catalog.apply",
      code: "target_mismatch",
    },
    {
      label: "forged application",
      request: forgedApplication,
      operationId: "abg.operation.run.invoke",
      code: "target_mismatch",
    },
  ];
  for (const row of cases) {
    const eventBytesBefore = await readFile(scenario.eventLogPath);
    const operationContext = installedPublic.reopenRootOperationContext(
      scenario.closeHandoff,
    );
    const refused = await installedPublic.applyRootPublicInvocation(
      operationContext,
      row.request,
    );
    installedPublic.closeRootOperationContext(operationContext);
    assert.equal(refused.kind, "public_outcome", row.label);
    assert.equal(refused.operationId, row.operationId, row.label);
    assert.equal(refused.disposition, "refused", row.label);
    assert.equal(refused.result.code, row.code, row.label);
    assert.deepEqual(await readFile(scenario.eventLogPath), eventBytesBefore, row.label);
  }

  const eventBytesBeforeLegacy = await readFile(scenario.eventLogPath);
  const legacyContext = installedPublic.reopenRootOperationContext(
    scenario.closeHandoff,
  );
  const legacyRefusal = await installedPublic.applyRootPublicInvocation(
    legacyContext,
    legacyCombinedCarrier,
  );
  installedPublic.closeRootOperationContext(legacyContext);
  assert.equal(legacyRefusal.kind, "public_invocation_refusal");
  assert.equal(legacyRefusal.code, "invalid_request");
  assert.deepEqual(
    await readFile(scenario.eventLogPath),
    eventBytesBeforeLegacy,
    "legacy combined catalog carrier must append no runtime truth",
  );
});

test("S06 run ingress refuses valid readiness without exact durable install and workspace admission before runtime effects", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "runtime-admission-negatives",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `runtime-negative-public=${Date.now()}`,
  );
  const run = scenario.transcript.at(-1);

  const absentPath = join(
    scenario.workspaceRoot,
    ".ai-workspace/events/absent-admission.events.jsonl",
  );
  const emptyContext = installedPublic.createRootOperationContext(absentPath);
  const absentAuthority = installedPublic.projectRootOperationContextAuthority(
    emptyContext,
  );
  installedPublic.closeRootOperationContext(emptyContext);
  const absentBytes = await readFile(absentPath);
  const absentContext = installedPublic.reopenRootOperationContext(absentAuthority);
  const absent = await installedPublic.applyRootPublicInvocation(absentContext, {
    ...run,
    invocationRef: `${run.invocationRef}/absent-admission`,
    payload: {
      ...run.payload,
      eventLogPath: absentPath,
      runtimePrefixAuthority: absentAuthority,
    },
  });
  installedPublic.closeRootOperationContext(absentContext);
  assert.equal(absent.disposition, "refused");
  assert.equal(absent.result.code, "missing_prerequisite");
  assert.deepEqual(await readFile(absentPath), absentBytes);

  const admittedBytes = await readFile(scenario.eventLogPath);
  const mismatchContext = installedPublic.reopenRootOperationContext(
    scenario.closeHandoff,
  );
  const mismatch = await installedPublic.applyRootPublicInvocation(mismatchContext, {
    ...run,
    invocationRef: `${run.invocationRef}/workspace-ref-mismatch`,
    payload: {
      ...run.payload,
      workspaceBindingInvocationRef: `${scenario.refs.bind}/substituted`,
    },
  });
  installedPublic.closeRootOperationContext(mismatchContext);
  assert.equal(mismatch.disposition, "refused");
  assert.equal(mismatch.result.code, "missing_prerequisite");
  assert.deepEqual(await readFile(scenario.eventLogPath), admittedBytes);

  for (const request of [
    scenario.transcript[3],
    {
      ...scenario.transcript[3],
      payload: {
        ...scenario.transcript[3].payload,
        targetRoot: `${scenario.transcript[3].payload.targetRoot}/substituted`,
      },
    },
  ]) {
    const duplicateContext = installedPublic.reopenRootOperationContext(
      scenario.closeHandoff,
    );
    const duplicate = await installedPublic.applyRootPublicInvocation(
      duplicateContext,
      request,
    );
    installedPublic.closeRootOperationContext(duplicateContext);
    assert.equal(duplicate.disposition, "refused");
    assert.equal(duplicate.result.code, "duplicate_invocation");
    assert.deepEqual(await readFile(scenario.eventLogPath), admittedBytes);
  }
});

test("S06 SDK and CLI consume one serialized public operation contract", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `public-contract=${Date.now()}`,
  );
  const unknownInvocation = invocation(
    "abg.operation.unknown",
    "unknown",
    "invocation://t281/public-contract/unknown",
    {},
  );
  const operationContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "public-contract.events.jsonl"),
  );
  let sdkRefusal;
  let timestampRefusal;
  try {
    sdkRefusal = await installedPublic.applyRootPublicInvocation(
      operationContext,
      unknownInvocation,
    );
    assert.deepEqual(
      sdkRefusal,
      installedPublic.parseRootPublicInvocation(unknownInvocation),
    );
    assert.equal(sdkRefusal.kind, "public_invocation_refusal");
    assert.equal(sdkRefusal.code, "invalid_request");
    assert.equal(
      (
        await installedPublic.applyRootPublicInvocation(
          operationContext,
          {
            ...unknownInvocation,
            operationId: "abg.operation.product.verify",
            surplus: true,
          },
        )
      ).kind,
      "public_invocation_refusal",
    );
    assert.equal(
      (
        await installedPublic.applyRootPublicInvocation(
          operationContext,
          {
            ...unknownInvocation,
            operationId: "abg.operation.product.verify",
            payload: { unsupported: undefined },
          },
        )
      ).kind,
      "public_invocation_refusal",
    );
    timestampRefusal = await installedPublic.applyRootPublicInvocation(
      operationContext,
      {
        ...unknownInvocation,
        operationId: "abg.operation.product.verify",
        eventTime: "2026-07-28",
      },
    );
    assert.equal(timestampRefusal.kind, "public_invocation_refusal");
    assert.equal(timestampRefusal.code, "invalid_request");
    const wrongVariant = installedPublic.parseRootPublicInvocation({
      ...unknownInvocation,
      operationId: "abg.operation.product.resolve",
      variant: "artifact",
      payload: {
        verifiedProductInputs: [{
          artifactPath: "/tmp/product.tgz",
          verifiedProduct: {},
        }],
      },
    });
    assert.equal(wrongVariant.kind, "public_invocation_refusal");
    assert.equal(wrongVariant.code, "invalid_request");
    const missingVariantField = installedPublic.parseRootPublicInvocation({
      ...unknownInvocation,
      operationId: "abg.operation.product.resolve",
      variant: "verified_product_set",
      payload: {},
    });
    assert.equal(missingVariantField.kind, "public_invocation_refusal");
    assert.equal(missingVariantField.code, "invalid_request");
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }

  const transcriptPath = join(
    harness.scratch,
    "public-contract-refusal.jsonl",
  );
  await writeCliTransportRequest(transcriptPath, {
    acquisition: {
      kind: "new",
      eventLogPath: join(harness.scratch, "public-contract-cli.events.jsonl"),
    },
    invocation: unknownInvocation,
  });
  const cliRun = await runInstalledCli(harness, { transcriptPath });
  assert.equal(cliRun.exitCode, 2);
  assert.deepEqual(cliRun.outcomes, [sdkRefusal]);

  const timestampTranscriptPath = join(
    harness.scratch,
    "public-contract-timestamp-refusal.jsonl",
  );
  await writeCliTransportRequest(timestampTranscriptPath, {
    acquisition: {
      kind: "new",
      eventLogPath: join(
        harness.scratch,
        "public-contract-timestamp-cli.events.jsonl",
      ),
    },
    invocation: {
      ...unknownInvocation,
      operationId: "abg.operation.product.verify",
      eventTime: "2026-07-28",
    },
  });
  const timestampCliRun = await runInstalledCli(
    harness,
    { transcriptPath: timestampTranscriptPath },
  );
  assert.equal(timestampCliRun.exitCode, 2);
  assert.deepEqual(timestampCliRun.outcomes, [timestampRefusal]);

  const schema = JSON.parse(
    await readFile(
      join(
        harness.installedPackageRoot,
        "contracts/schemas/public-operation.schema.json",
      ),
      "utf8",
    ),
  );
  assert.deepEqual(
    Object.keys(schema.$defs).sort(),
    [
      "ProductDependencyEdgeProjection",
      "PublicInvocationRefusal",
      "PublicOutcome",
      "ResolvedProductLockProjection",
      "RootPublicInvocation",
    ],
  );
  assert.equal(schema.$id, "abg.schema.public-operation-contract");
  const resolveInvocationSchema =
    schema.$defs.RootPublicInvocation.oneOf.find(
      (candidate) =>
        candidate.properties.operationId.const ===
          "abg.operation.product.resolve" &&
        candidate.properties.variant.const === "verified_product_set",
    );
  assert.ok(resolveInvocationSchema);
  assert.deepEqual(
    resolveInvocationSchema.properties.payload.required,
    ["verifiedProductInputs"],
  );
  assert.equal(
    resolveInvocationSchema.properties.payload.additionalProperties,
    false,
  );
  assert.equal(
    schema.$defs.ResolvedProductLockProjection.required.includes(
      "nativeContractClosureDigest",
    ),
    true,
  );
  assert.ok(
    schema.$defs.PublicOutcome.allOf[0].oneOf.some(
      (candidate) =>
        candidate.properties.operationId.const ===
          "abg.operation.product.resolve" &&
        candidate.properties.variant.const === "verified_product_set",
    ),
  );
  assert.ok(
    schema.$defs.PublicOutcome.allOf.some(
      (candidate) =>
        candidate.then?.properties.result.$ref ===
        "#/$defs/ResolvedProductLockProjection",
    ),
  );
  const publicRows =
    harness.candidateManifest.publicContractCatalog.rows.filter((row) =>
      [
        "abg.schema.public-operation-contract",
        "abg.schema.public-operation-invocation",
        "abg.schema.public-operation-outcome",
      ].includes(row.contractId)
    );
  assert.deepEqual(
    publicRows.map((row) => row.contractId).sort(),
    [
      "abg.schema.public-operation-contract",
      "abg.schema.public-operation-invocation",
      "abg.schema.public-operation-outcome",
    ],
  );
  assert.ok(publicRows.every((row) =>
    row.assetLocator.path === "contracts/schemas/public-operation.schema.json" &&
    row.nativeTypedLocator.packageExportPath === "./public" &&
    row.contractDigest === row.assetLocator.contentDigest &&
    row.capabilityIdentities.includes(
      "abg.capability.operator.public-contract@5",
    )
  ));

  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `public-contract-digest=${Date.now()}`,
  );
  const gtlRow = harness.candidateManifest.publicContractCatalog.rows.find(
    (row) => row.contractId === "abg.contract.gtl.root-declaration",
  );
  assert.equal(
    gtlRow.nativeTypedLocator.namedSymbol,
    "GTL_DECLARATION_CONSTRUCTORS",
  );
  assert.equal(
    gtlRow.capabilityIdentities.includes("abg.capability.gtl.declare@5"),
    true,
  );
  assert.equal(
    gtlRow.contractDigest,
    installedProduct.sha256Canonical(
      gtlRow.nativeTypedLocator.declarationInventory,
    ),
    "native contract digests must use only the constitutional declaration inventory",
  );
  for (const entry of gtlRow.nativeTypedLocator.declarationInventory) {
    assert.equal(
      entry.declarationDigest,
      await installedProduct.sha256File(
        join(harness.installedPackageRoot, entry.declarationPath),
      ),
      `native declaration inventory must bind ${entry.declarationPath}`,
    );
  }
  assert.equal(
    Object.hasOwn(gtlRow.nativeTypedLocator, "exportedSymbols"),
    false,
    "a native contract must not publish complete module export authority",
  );
  assert.equal(
    Object.hasOwn(gtlRow.nativeTypedLocator, "externalPackageSpecifiers"),
    false,
    "external declaration evidence must remain private to verification",
  );
  assert.equal(
    "resolveNativeDeclarationClosures" in installedProduct,
    false,
    "native analysis must not become a public Product helper",
  );
});

test("S06 verified Product and resolved lock truth are deeply immutable", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `immutable-product=${Date.now()}`,
  );
  const verified = await installedProduct.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  assert.equal(verified.kind, "verified_product_artifact");
  assert.equal(Object.isFrozen(verified), true);
  assert.equal(Object.isFrozen(verified.compatibilityRefs), true);
  assert.equal(Object.isFrozen(verified.contributionManifest), true);
  assert.equal(Object.isFrozen(verified.contributionManifest.rows), true);
  assert.equal(
    Object.isFrozen(
      verified.contributionManifest.rows[0].readinessPrerequisiteRefs,
    ),
    true,
  );
  assert.throws(
    () => {
      verified.compatibilityRefs[0] =
        "compatibility://abiogenesis/major/999";
    },
    TypeError,
  );
  const lock = installedProduct.constructResolvedProductLock([verified]);
  assert.equal(lock.kind, "resolved_product_lock");
  assert.equal(Object.isFrozen(lock), true);
  assert.equal(Object.isFrozen(lock.rows), true);
  assert.equal(Object.isFrozen(lock.rows[0].publicContracts), true);
  assert.throws(
    () => {
      lock.rows[0].publicContractRefs[0] =
        "abg.contract.public.forged";
    },
    TypeError,
  );
});

test("S06 workspace binding rejects caller-authored dependency edges", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "flavored-host-dependency",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `host-dependency=${Date.now()}`,
  );
  const operationContext = installedPublic.reopenRootOperationContext(
    scenario.closeHandoff,
  );
  try {
    const forgedBind = structuredClone(scenario.transcript[5]);
    forgedBind.invocationRef =
      "invocation://t281/flavored-host-dependency/forged-bind";
    forgedBind.payload.dependencyEdges = [{
      kind: "requires",
      fromProductId: harness.candidateBasis.productId,
      toProductId: flavored.basis.productId,
    }];
    const refused = await installedPublic.applyRootPublicInvocation(
      operationContext,
      forgedBind,
    );
    assert.equal(refused.disposition, "refused");
    assert.equal(refused.code, "invalid_request");
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }
});

test("S06 catalog construction rejects unequal publications with one module identity", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const unequal = structuredClone(flavored.publication);
  unequal.graphFunctions[0].effects = [
    "effect://flavor.example/text/forged@5",
  ];
  const refused = buildGraphFunctionCatalog([
    flavored.publication,
    unequal,
  ]);
  assert.equal(refused.kind, "catalog_construction_refusal");
  assert.equal(refused.code, "publication_identity_collision");
});

test("S06 unresolved dependency lock refuses before Product materialization", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "flavored-preinstall-lock",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `preinstall-lock=${Date.now()}`,
  );
  const operationContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "preinstall-lock.events.jsonl"),
  );
  try {
    for (const row of scenario.transcript.slice(0, 2)) {
      const outcome = await installedPublic.applyRootPublicInvocation(
        operationContext,
        row,
      );
      assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    }
    const unresolvedResolution = structuredClone(scenario.transcript[2]);
    unresolvedResolution.invocationRef =
      "invocation://t281/flavored-preinstall-lock/unresolved-resolution";
    unresolvedResolution.payload.verifiedProductInputs = [
      unresolvedResolution.payload.verifiedProductInputs[1],
    ];
    const refused = await installedPublic.applyRootPublicInvocation(
      operationContext,
      unresolvedResolution,
    );
    assert.equal(refused.disposition, "refused");
    assert.equal(refused.result.kind, "product_resolution_refusal");
    assert.equal(refused.result.disposition, "unresolved");
    assert.equal(refused.result.code, "unresolved");
    assert.match(refused.result.message, /lock resolution refused/u);
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }
});

test("S06 external side-effect declaration imports refuse during Product resolution", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "side-effect-declaration"),
    {
      transformDeclaration: (declaration) =>
        `${declaration}\nimport "@abiogenesis/typescript-tenant/gtl";\n`,
    },
  );
  const verifiedAbi = await harness.product.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  const verifiedFlavored = await harness.product.verifyProduct({
    artifactPath: flavored.artifactPath,
    artifactRef: flavored.artifactRef,
    ...expectedVerificationIdentity(flavored.basis),
  });
  assert.equal(verifiedAbi.kind, "verified_product_artifact");
  assert.equal(verifiedFlavored.kind, "verified_product_artifact");
  const refused = harness.product.constructResolvedProductLock([
    verifiedAbi,
    verifiedFlavored,
  ]);
  assert.equal(refused.kind, "environment_refusal");
  assert.equal(refused.code, "incompatible_dependency");
  assert.match(refused.message, /side-effect-only/u);
});

test("S06 verified native evidence retains reachable self-package subpath roots", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "self-package-subpath"),
    { addSelfPackageSubpath: true },
  );
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "flavored-self-package-subpath",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `self-package-subpath=${Date.now()}`,
  );
  const operationContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "self-package-subpath.events.jsonl"),
  );
  try {
    let outcome;
    for (const row of scenario.transcript.slice(0, 3)) {
      outcome = await installedPublic.applyRootPublicInvocation(
        operationContext,
        row,
      );
      assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    }
    assert.equal(outcome.result.kind, "resolved_product_lock");
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }
});

test("S06 Product verification resolves contract authority and exact locators", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `contract-locators=${Date.now()}`,
  );
  const nativeOnlyContract = (row, native) => {
    delete row.assetLocator;
    return {
      ...row,
      contractDigest: native.nativeContractDigest,
      contractKind: "native_typed_group",
      nativeTypedLocator: native.nativeTypedLocator,
    };
  };
  const cases = [
    {
      label: "missing-version",
      transformPublicContract: (row) => {
        delete row.contractVersion;
        return row;
      },
      expectedCode: "catalog_mismatch",
    },
    {
      label: "empty-authority",
      transformPublicContract: (row) => ({
        ...row,
        requirementAuthorityRefs: [],
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "empty-capability",
      transformPublicContract: (row) => ({
        ...row,
        capabilityIdentities: [],
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "missing-definition",
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$defs/DoesNotExist",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "missing-native-symbol",
      transformPublicContract: (row, native) => ({
        ...row,
        nativeTypedLocator: {
          ...native.nativeTypedLocator,
          namedSymbol: "ForgedNativeContract",
        },
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "invalid-native-declaration",
      transformDeclaration: (declaration) =>
        `${declaration}\nexport declare const Forged:;\n`,
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
    {
      label: "invalid-external-import-syntax",
      transformDeclaration: (declaration) =>
        `${declaration}\nimport { Missing as } from "@abiogenesis/typescript-tenant/gtl";\n`,
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
    {
      label: "unresolved-native-reexport",
      transformDeclaration: (declaration) =>
        `${declaration}\nexport { Missing } from "./missing.js";\n`,
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
    {
      label: "quoted-false-native-symbol",
      transformDeclaration: (declaration) =>
        `${declaration}\nexport declare const EXPORT_BAIT: "export const MissingSymbol";\n`,
      transformPublicContract: (row, native) => {
        delete row.assetLocator;
        return {
          ...row,
          contractDigest: native.nativeContractDigest,
          contractKind: "native_typed_group",
          nativeTypedLocator: {
            ...native.nativeTypedLocator,
            namedSymbol: "MissingSymbol",
          },
        };
      },
      expectedCode: "catalog_mismatch",
    },
    {
      label: "non-schema-definition",
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$id",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "malformed-pointer-escape",
      transformSchema: (schema) => ({
        ...schema,
        $defs: { "~2": { type: "object" } },
      }),
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$defs/~2",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "dangling-pointer-escape",
      transformSchema: (schema) => ({
        ...schema,
        $defs: { "~": { type: "object" } },
      }),
      transformPublicContract: (row) => ({
        ...row,
        assetLocator: {
          ...row.assetLocator,
          definitionRef: "#/$defs/~",
        },
      }),
      expectedCode: "contract_asset_mismatch",
    },
    {
      label: "native-kind-asset-digest",
      transformPublicContract: (row, native) => ({
        ...row,
        contractKind: "native_typed_group",
        nativeTypedLocator: native.nativeTypedLocator,
      }),
      expectedCode: "catalog_mismatch",
    },
    {
      label: "duplicate-native-coordinate",
      transformPublicContract: nativeOnlyContract,
      expectedCode: "catalog_mismatch",
    },
  ];
  for (const row of cases) {
    const flavored = await prepareFlavoredCatalogProduct(
      harness,
      join(harness.scratch, row.label),
      {
        transformDeclaration: row.transformDeclaration,
        transformPublicContract: row.transformPublicContract,
        transformSchema: row.transformSchema,
      },
    );
    const refused = await installedProduct.verifyProduct({
      artifactPath: flavored.artifactPath,
      artifactRef: flavored.artifactRef,
      ...expectedVerificationIdentity(flavored.basis),
    });
    assert.equal(refused.kind, "product_verification_refusal", row.label);
    assert.equal(refused.code, row.expectedCode, row.label);
  }
});

test("S06 Product verification resolves JSON Schema array pointers", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const installedProduct = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
    `array-pointers=${Date.now()}`,
  );
  for (
    const definitionRef of [
      "#/oneOf/0",
      "#/oneOf/0/additionalProperties",
    ]
  ) {
    const flavored = await prepareFlavoredCatalogProduct(
      harness,
      join(
        harness.scratch,
        `array-pointer-${definitionRef.endsWith("0") ? "schema" : "boolean"}`,
      ),
      {
        transformPublicContract: (row) => ({
          ...row,
          assetLocator: {
            ...row.assetLocator,
            definitionRef,
          },
        }),
      },
    );
    const verified = await installedProduct.verifyProduct({
      artifactPath: flavored.artifactPath,
      artifactRef: flavored.artifactRef,
      ...expectedVerificationIdentity(flavored.basis),
    });
    assert.equal(
      verified.kind,
      "verified_product_artifact",
      `${definitionRef}: ${JSON.stringify(verified)}`,
    );
  }
});

test("S06 catalog admission proves one complete pure readiness basis and refuses substituted truth", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "dependency-readiness"),
    {
      transformPublication: (publication) => {
        publication.contributions[0].readinessPrerequisiteRefs = [
          "abg.capability.gtl.declare@5",
        ];
        return publication;
      },
    },
  );
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "dependency-readiness",
  );
  const basis = scenario.transcript[6].payload.readinessBasis;
  const catalog = harness.product.admitGraphFunctionCatalog(basis);
  assert.equal(catalog.kind, "graph_function_catalog");
  assert.ok(catalog.entries.length > 0);
  assert.equal(catalog.rowDispositions.length, flavored.publication.contributions.length);
  assert.equal(catalog.rowDispositions.every((row) => row.disposition === "admitted"), true);
  assert.equal(
    catalog.rowDispositions.some((row) =>
      row.readinessPrerequisiteRefs.includes("abg.capability.gtl.declare@5")
    ),
    true,
  );
  assert.equal(Object.hasOwn(catalog, "admissionEventRef"), false);
  assert.equal(Object.hasOwn(catalog, "admittedRows"), false);

  for (const [label, mutate, disposition] of [
    ["descriptor", (candidate) => {
      candidate.publications[0].descriptorRef = "descriptor://unrelated/product";
    }, "rejected"],
    ["provenance", (candidate) => {
      candidate.publications[0].contributions[0].provenanceRefs = [
        `sha256:${"9".repeat(64)}`,
      ];
    }, "rejected"],
    ["compatibility", (candidate) => {
      candidate.publications[0].contributions[0].compatibilityRefs = [
        "compatibility://unrelated/major/99",
      ];
    }, "rejected"],
  ]) {
    const substituted = structuredClone(basis);
    mutate(substituted);
    const result = harness.product.admitGraphFunctionCatalog(substituted);
    assert.equal(result.kind, "graph_function_catalog", label);
    const mutatedHandle = substituted.publications[0].contributions[0].handle;
    assert.equal(
      result.rowDispositions.find((row) => row.handle === mutatedHandle)?.disposition,
      disposition,
      label,
    );
    if (label === "compatibility") {
      assert.equal(
        result.rowDispositions.find((row) => row.handle === mutatedHandle)?.reason,
        "publication_identity_mismatch",
      );
    }
    assert.equal(result.entries.some((entry) => entry.handle === mutatedHandle), false);
  }

  for (const [label, mutate, code] of [
    ["verified Product", (candidate) => {
      candidate.verifiedProducts = candidate.verifiedProducts.slice(0, 1);
    }, "verified_product_mismatch"],
    ["installed Product", (candidate) => {
      candidate.installedProducts = candidate.installedProducts.slice(0, 1);
    }, "installed_product_mismatch"],
  ]) {
    const substituted = structuredClone(basis);
    mutate(substituted);
    const refused = harness.product.admitGraphFunctionCatalog(substituted);
    assert.equal(refused.kind, "catalog_construction_refusal", label);
    assert.equal(refused.code, code, label);
  }

  const repeated = harness.product.admitGraphFunctionCatalog(structuredClone(basis));
  assert.deepEqual(repeated, catalog);

  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `pure-catalog-repeat=${Date.now()}`,
  );
  const retainedContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "pure-catalog-retained.events.jsonl"),
  );
  const freshContext = installedPublic.createRootOperationContext(
    join(harness.scratch, "pure-catalog-fresh.events.jsonl"),
  );
  try {
    const request = scenario.transcript[6];
    const first = await installedPublic.applyRootPublicInvocation(retainedContext, request);
    const sameContextRepeat = await installedPublic.applyRootPublicInvocation(retainedContext, request);
    const freshContextRepeat = await installedPublic.applyRootPublicInvocation(freshContext, request);
    assert.equal(first.disposition, "succeeded", JSON.stringify(first));
    assert.deepEqual(sameContextRepeat, first);
    assert.deepEqual(freshContextRepeat, first);

    const mixedRequest = structuredClone(request);
    mixedRequest.invocationRef += "/mixed-row-dispositions";
    const mixedRows = mixedRequest.payload.readinessBasis
      .publications[0].contributions;
    mixedRows[0].provenanceRefs = [`sha256:${"8".repeat(64)}`];
    mixedRows[1].compatibilityRefs = ["compatibility://unrelated/major/99"];
    mixedRows[2].readinessPrerequisiteRefs = [
      "abg.capability.unpublished-direct-edge@5",
    ];
    const mixedOutcome = await installedPublic.applyRootPublicInvocation(
      freshContext,
      mixedRequest,
    );
    assert.equal(mixedOutcome.disposition, "succeeded", JSON.stringify(mixedOutcome));
    const dispositions = new Map(
      mixedOutcome.result.rowDispositions.map((row) => [row.handle, row.disposition]),
    );
    assert.equal(dispositions.get(mixedRows[0].handle), "rejected");
    assert.equal(dispositions.get(mixedRows[1].handle), "incompatible");
    assert.equal(dispositions.get(mixedRows[2].handle), "unready");
    assert.equal(
      mixedOutcome.result.rowDispositions.length,
      mixedRows.length,
    );
    assert.deepEqual(freshContext.store.readAll(), []);

    const publicationsOnlyView = structuredClone(scenario.transcript[7]);
    publicationsOnlyView.invocationRef += "/publications-only";
    publicationsOnlyView.payload = {
      allowlist: [flavored.ids.graphFunctionRef],
      catalog: { publications: [flavored.publication] },
    };
    const bypass = await installedPublic.applyRootPublicInvocation(
      freshContext,
      publicationsOnlyView,
    );
    assert.equal(bypass.disposition, "refused");
    assert.deepEqual(freshContext.store.readAll(), []);

    const applyRequest = scenario.transcript[8];
    const applyContextOne = installedPublic.createRootOperationContext(
      join(harness.scratch, "catalog-apply-one.events.jsonl"),
    );
    const applyContextTwo = installedPublic.createRootOperationContext(
      join(harness.scratch, "catalog-apply-two.events.jsonl"),
    );
    try {
      const appliedOne = await installedPublic.applyRootPublicInvocation(
        applyContextOne,
        applyRequest,
      );
      const appliedTwo = await installedPublic.applyRootPublicInvocation(
        applyContextTwo,
        applyRequest,
      );
      assert.equal(appliedOne.disposition, "succeeded", JSON.stringify(appliedOne));
      assert.deepEqual(appliedTwo, appliedOne);
      assert.deepEqual(applyContextOne.store.readAll(), []);
      assert.deepEqual(applyContextTwo.store.readAll(), []);
    } finally {
      installedPublic.closeRootOperationContext(applyContextOne);
      installedPublic.closeRootOperationContext(applyContextTwo);
    }
  } finally {
    installedPublic.closeRootOperationContext(retainedContext);
    installedPublic.closeRootOperationContext(freshContext);
  }
});

test("S06 catalog narrowing refuses unknown handles without an admission fallback", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "unresolved-readiness"),
    {
      transformPublication: (publication) => publication,
    },
  );
  const catalog = buildGraphFunctionCatalog([flavored.publication]);
  assert.equal(catalog.kind, "graph_function_catalog");
  const refused = narrowGraphFunctionCatalog(
    catalog,
    ["graph-function://flavor.example/never-published@5"],
  );
  assert.equal(refused.kind, "catalog_construction_refusal");
  assert.equal(refused.code, "unknown_allowlist_entry");
});

test("S06 catalog readiness refuses a prerequisite absent from every direct dependency edge", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const missingRef = "abg.capability.unpublished-direct-edge@5";
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "missing-direct-edge"),
    {
      transformPublication: (publication) => {
        publication.contributions[0].readinessPrerequisiteRefs = [missingRef];
        return publication;
      },
    },
  );
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "missing-direct-edge",
    false,
  );
  const refused = harness.product.admitGraphFunctionCatalog(
    scenario.readinessBasis,
  );
  assert.equal(refused.kind, "graph_function_catalog");
  assert.equal(refused.rowDispositions[0].disposition, "unready");
  assert.match(refused.rowDispositions[0].reason, new RegExp(missingRef.replaceAll(".", "\\."), "u"));
});

test("S06 catalog application delegates target and value meaning to Product semantics", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "catalog-application-semantics"),
  );
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "catalog-application-semantics",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `catalog-application-semantics=${Date.now()}`,
  );
  const operationContext = installedPublic.reopenRootOperationContext(
    scenario.closeHandoff,
  );
  try {
    const valid = await installedPublic.applyRootPublicInvocation(
      operationContext,
      scenario.transcript[8],
    );
    assert.equal(valid.disposition, "succeeded", JSON.stringify(valid));
    assert.equal(valid.result.appliedValueRef, flavored.ids.nodeTypeRef);

    const bogusValue = structuredClone(scenario.transcript[8]);
    bogusValue.invocationRef += "/bogus-value";
    bogusValue.payload.value.nodeTypeRef = "node-type://unrelated/value@5";
    const valueRefusal = await installedPublic.applyRootPublicInvocation(
      operationContext,
      bogusValue,
    );
    assert.equal(valueRefusal.disposition, "refused");
    assert.equal(valueRefusal.result.code, "target_mismatch");

    const bogusTarget = structuredClone(scenario.transcript[8]);
    bogusTarget.invocationRef += "/bogus-target";
    bogusTarget.payload.target.programRef = "program://unrelated/target@5";
    const targetRefusal = await installedPublic.applyRootPublicInvocation(
      operationContext,
      bogusTarget,
    );
    assert.equal(targetRefusal.disposition, "refused");
    assert.equal(targetRefusal.result.code, "target_mismatch");

    const substitutedRun = structuredClone(scenario.transcript.at(-1));
    substitutedRun.invocationRef += "/substituted-readiness";
    substitutedRun.payload.catalog.readinessBasis.workspaceBinding.workspaceId =
      "workspace://unrelated/catalog-readiness";
    const runRefusal = await installedPublic.applyRootPublicInvocation(
      operationContext,
      substitutedRun,
    );
    assert.equal(runRefusal.disposition, "refused");
    assert.equal(runRefusal.result.code, "target_mismatch");
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }
});

test("S06 Codex delegate rejects substituted and missing CLI paths", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const transcriptPath = join(harness.scratch, "codex-preflight.jsonl");
  await writeCliTransportRequest(transcriptPath, {
    acquisition: {
      kind: "new",
      eventLogPath: join(harness.scratch, "codex-preflight.events.jsonl"),
    },
    invocation: invocation(
      "abg.operation.unknown",
      "unknown",
      "invocation://t281/codex-preflight/unknown",
      {},
    ),
  });
  const scenario = { transcriptPath };

  const substituted = await runInstalledCodex(harness, scenario, {
    cliPath: "/bin/echo",
  });
  assert.equal(substituted.exitCode, 2);
  assert.equal(substituted.stdout, "");
  assert.match(
    substituted.stderr,
    /requires the exact sibling installed abg\.cli/u,
  );

  const missing = await runInstalledCodex(harness, scenario, {
    cliPath: join(harness.scratch, "missing-abg.cli"),
  });
  assert.equal(missing.exitCode, 2);
  assert.equal(missing.stdout, "");
  assert.match(
    missing.stderr,
    /paths must identify exact absolute files/u,
  );
});

test("S06 catalog applications are pure reconstructible values", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const catalog = buildGraphFunctionCatalog([flavored.publication]);
  assert.equal(catalog.kind, "graph_function_catalog");
  const view = narrowGraphFunctionCatalog(catalog, [
    flavored.ids.nodeTypeHandle,
    flavored.ids.overlayHandle,
    flavored.ids.graphFunctionRef,
  ]);
  assert.equal(view.kind, "graph_function_catalog_view");

  const nodeTarget = {
    kind: "program",
    programRef: flavored.ids.programRef,
  };
  const nodeTargetDigest = sha256Canonical(nodeTarget);
  const nodeValueDigest = sha256Canonical(flavored.nodeTypeValue);
  const nodeInput = {
    applicationKind: "node_type",
    handle: flavored.ids.nodeTypeHandle,
    targetRef:
      `catalog-target://abiogenesis/${nodeTargetDigest.slice("sha256:".length)}`,
    targetDigest: nodeTargetDigest,
    appliedValueRef:
      `catalog-value://abiogenesis/${nodeValueDigest.slice("sha256:".length)}`,
    appliedValueDigest: nodeValueDigest,
  };
  const node = applyCatalogDeclaration(view, nodeInput);
  assert.equal(node.kind, "declaration_application");
  assert.deepEqual(
    applyCatalogDeclaration(structuredClone(view), structuredClone(nodeInput)),
    node,
  );
  assert.equal(Object.hasOwn(node, "admissionEventRef"), false);

  const overlayTarget = { contributorRef: flavored.basis.productId };
  const overlayTargetDigest = sha256Canonical(overlayTarget);
  const overlayValueDigest = sha256Canonical(flavored.overlayValue);
  const overlay = applyCatalogDeclaration(view, {
    applicationKind: "overlay",
    handle: flavored.ids.overlayHandle,
    targetRef:
      `catalog-target://abiogenesis/${overlayTargetDigest.slice("sha256:".length)}`,
    targetDigest: overlayTargetDigest,
    appliedValueRef:
      `catalog-value://abiogenesis/${overlayValueDigest.slice("sha256:".length)}`,
    appliedValueDigest: overlayValueDigest,
  });
  assert.equal(overlay.kind, "declaration_application");

  const callable = applyCatalogDeclaration(view, {
    ...nodeInput,
    handle: flavored.ids.graphFunctionRef,
  });
  assert.equal(callable.kind, "declaration_application_refusal");
  assert.equal(callable.code, "outside_view");
  const wrongKind = applyCatalogDeclaration(view, {
    ...nodeInput,
    applicationKind: "overlay",
  });
  assert.equal(wrongKind.kind, "declaration_application_refusal");
  assert.equal(wrongKind.code, "kind_mismatch");
});

test("S06 Codex delegate and flavored Product keep their public boundaries", async () => {
  const delegateSource = await readFile(
    join(packageRoot, "code/src/public/codex_cli.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    delegateSource,
    /(?:from\s+["'][.]{2}\/(?:abg|gtl|hog|implementation|product|public|validator)\/|import\s*\(|require\s*\()/u,
  );
  assert.doesNotMatch(
    delegateSource,
    /GraphFunction|catalog\.apply|run\.invoke|continuation|closure/u,
  );
  assert.match(
    delegateSource,
    /spawn\(installedCliPath,\s*\["--jsonl", transcriptPath\]/u,
  );
  assert.doesNotMatch(
    delegateSource,
    /spawn\(cliPath,/u,
  );

  const flavoredRuntimeSource = await readFile(
    join(
      packageRoot,
      "test_env/fixtures/flavored-catalog-product/src/index.ts",
    ),
    "utf8",
  );
  const flavoredPublicationSource = await readFile(
    join(
      packageRoot,
      "test_env/fixtures/flavored-catalog-product/src/publication.ts",
    ),
    "utf8",
  );
  const flavoredSource =
    `${flavoredRuntimeSource}\n${flavoredPublicationSource}`;
  assert.match(
    flavoredSource,
    /from "@abiogenesis\/typescript-tenant\/gtl"/u,
  );
  assert.doesNotMatch(
    flavoredRuntimeSource,
    /from "@abiogenesis\/typescript-tenant\/gtl"/u,
    "installed effect and semantics code must not depend on declaration-time GTL constructors",
  );
  for (const constructor of [
    "catalogContribution",
    "closureContract",
    "contractDeclaration",
    "implementationBinding",
    "modulePublication",
    "productSemanticsBinding",
  ]) {
    assert.match(
      flavoredSource,
      new RegExp(`declarations\\.${constructor}\\(`, "u"),
    );
  }
  assert.doesNotMatch(
    flavoredSource,
    /build\/code\/src|from\s+["'][.]{2}\/|(?:import|require)\s*\(\s*["'](?:[.]{2}\/|@abiogenesis\/typescript-tenant\/build\/)/u,
  );
});
