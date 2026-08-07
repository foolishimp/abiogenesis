import assert from "node:assert/strict";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { prepareDeveloperMiniProduct } from "../support/developer-mini-product.mjs";
import {
  constructClosedCatalogReadinessBasis,
  importInstalledPackageExport,
  runInstalledCli,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";
import { sha256Canonical } from "../../build/code/src/product/index.js";

const packageRoot = new URL("../..", import.meta.url).pathname;
let publicEpisodeOrdinal = 0;

function newEpisode(publicApi) {
  publicEpisodeOrdinal += 1;
  return publicApi.createRootOperationContext(
    join(tmpdir(), `abi5-external-${process.pid}-${publicEpisodeOrdinal}.events.jsonl`),
  );
}

function reopenScenario(publicApi, scenario) {
  return publicApi.reopenRootOperationContext(
    scenario.transcript.at(-1).payload.runtimePrefixAuthority,
  );
}

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
  const context = newEpisode(publicApi);
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

function redigestGapAuthority(authority) {
  const body = structuredClone(authority);
  delete body.authorityDigest;
  return {
    ...body,
    authorityDigest: sha256Canonical(body),
  };
}

function redigestObservationSnapshot(snapshot) {
  const body = structuredClone(snapshot);
  delete body.snapshotDigest;
  delete body.snapshotRef;
  const snapshotDigest = sha256Canonical(body);
  return {
    ...body,
    snapshotRef:
      `observation-snapshot://product/${snapshotDigest.slice("sha256:".length)}`,
    snapshotDigest,
  };
}

function withReducedProductSet(authority) {
  const next = structuredClone(authority);
  const rows = next.resolvedProductLock.rows.filter(
    (row) => row.productId === next.install.productId,
  );
  assert.equal(rows.length, 1);
  const dependencyEdges = [];
  const lockDigest = sha256Canonical({ rows, dependencyEdges });
  const lockId =
    `product-lock://abiogenesis/${lockDigest.slice("sha256:".length)}`;
  const orderedInstallRefs = [next.install.installId];
  const productSetDigest = sha256Canonical({
    orderedInstallRefs,
    lockId,
    lockDigest,
  });
  next.resolvedProductLock = {
    kind: "resolved_product_lock",
    schemaVersion: "5.0.0",
    lockId,
    lockDigest,
    rows,
    dependencyEdges,
  };
  next.productSet = {
    kind: "product_set",
    schemaVersion: "5.0.0",
    productSetId:
      `product-set://abiogenesis/${productSetDigest.slice("sha256:".length)}`,
    productSetDigest,
    orderedInstallRefs,
    lockId,
    lockDigest,
  };
  return redigestGapAuthority(next);
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

function actionCatalogFromGapAuthority(authority, programRef) {
  const programs = authority.publications.flatMap(
    (publication) => publication.programs,
  ).filter((program) => program.programRef === programRef);
  assert.equal(programs.length, 1);
  assert.ok(programs[0].actionCatalog);
  return programs[0].actionCatalog;
}

function oneSurfaceGraph(publication, mini) {
  const graph = publication.graphFunctions.find(
    (candidate) => candidate.id === mini.ids.oneSurfaceGraphFunctionRef,
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

function spanGraph(publication, mini) {
  const graph = publication.graphFunctions.find(
    (candidate) => candidate.id === mini.ids.spanGraphFunctionRef,
  );
  assert.ok(graph);
  return graph;
}

function withForwardSpanTarget(mini) {
  const publication = structuredClone(mini.publication);
  const graph = spanGraph(publication, mini);
  const application = graph.template.applications.find(
    (candidate) => candidate.relationKind === "re_enter",
  );
  assert.ok(application);
  application.targetProgramLocusRef = mini.ids.spanFinalizeLocusRef;
  application.outputContractRef = mini.ids.spanSelectionContractRef;
  const { applicationRef: _priorRef, ...body } = application;
  application.applicationRef =
    `graph-function-application://abiogenesis/${
      sha256Canonical(body).slice("sha256:".length)
    }`;
  const selector = graph.template.nodes[0].term.terms.find(
    (term) => term.programLocusRef === mini.ids.spanSelectorLocusRef,
  );
  assert.ok(selector);
  selector.compositionRef = application.applicationRef;
  return publication;
}

function withRepeatedSpanSelection(mini) {
  return withStageImplementation(
    mini.publication,
    mini.ids.spanSelectorImplementationBindingRef,
    mini.ids.spanSelectorRepeatImplementationRef,
    "realizeDeveloperSpanSelectorRepeat",
  );
}

function withDuplicatePublicAssetHandle(mini) {
  const publication = structuredClone(mini.publication);
  const program = publication.programs.find(
    (candidate) => candidate.programRef === mini.ids.programRef,
  );
  assert.ok(program?.publicAssetTargets);
  program.publicAssetTargets.push({
    kind: "program_public_asset_target",
    handle: mini.ids.greetingAssetHandle,
    assetRef: `${mini.ids.greetingAssetRef}/duplicate`,
    startRef: mini.ids.startRef,
  });
  return publication;
}

function withoutDefaultPublicStart(mini) {
  const publication = structuredClone(mini.publication);
  const program = publication.programs.find(
    (candidate) => candidate.programRef === mini.ids.programRef,
  );
  assert.ok(program);
  delete program.policies["abg.default_start_ref"];
  return publication;
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

function withSubstitutedRuntimeArchive(mini) {
  return withStageImplementation(
    mini.publication,
    mini.ids.evaluateActionImplementationBindingRef,
    mini.ids.evaluateActionSubstitutedArchiveImplementationRef,
    "realizeDeveloperEvaluateActionWithSubstitutedRuntimeArchive",
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
  const context = reopenScenario(publicApi, scenario);
  const setupOutcomes = [...scenario.setupOutcomes];
  try {
    for (const row of scenario.transcript.slice(6, -1)) {
      setupOutcomes.push(
        await publicApi.applyRootPublicInvocation(context, row),
      );
    }
    const start = structuredClone(scenario.transcript.at(-1));
    start.payload.input = options.observation?.({
      binding: setupOutcomes[5].result,
      mini,
      publication,
    }) ?? oneSurfaceObservation(
      mini,
      publication,
      setupOutcomes[5].result,
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
      options.responseVariant ?? "approve",
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
  assert.equal(
    responded.disposition,
    options.expectedResponseDisposition ?? "succeeded",
    JSON.stringify(responded),
  );
  if (responded.disposition !== "succeeded") {
    const eventLog = await readFile(scenario.eventLogPath, "utf8");
    const events = eventLog.trim().length === 0
      ? []
      : eventLog.trim().split(/\r?\n/u).map((line) => JSON.parse(line));
    return {
      completed: null,
      events,
      frontier,
      held,
      responded,
      scenario,
    };
  }
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
  return { completed, events, frontier, held, responded, scenario };
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
  const context = reopenScenario(publicApi, scenario);
  const outcomes = [...scenario.setupOutcomes];
  try {
    for (const row of scenario.transcript.slice(6)) {
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
    },
  );
  const context = reopenScenario(publicApi, scenario);
  const outcomes = [...scenario.setupOutcomes];
  try {
    for (const row of scenario.transcript.slice(6, -1)) {
      outcomes.push(await publicApi.applyRootPublicInvocation(context, row));
    }
    const start = structuredClone(scenario.transcript.at(-1));
    start.payload.input = options.observation?.({
      binding: outcomes[5].result,
      mini,
      publication,
    }) ?? oneSurfaceObservation(
      mini,
      publication,
      outcomes[5].result,
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
  const selectedMini = await mini.materializePublicationVariant(
    label,
    publication,
  );
  publication = selectedMini.publication;
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
  const publicTarget = target.publicTarget ?? null;
  const input = target.input ?? {
    kind: "developer_greeting_input",
    schemaVersion: "5.0.0",
    name: "Ada",
  };
  const refs = {
    verifyAbi: `${prefix}/verify-abiogenesis`,
    resolve: `${prefix}/resolve-products`,
    installAbi: `${prefix}/install-abiogenesis`,
    verifyMini: `${prefix}/verify-developer-product`,
    installMini: `${prefix}/install-developer-product`,
    bind: `${prefix}/workspace-bind`,
    catalog: `${prefix}/catalog-admit`,
    view: `${prefix}/catalog-view`,
    run: `${prefix}/run-invoke`,
  };
  const verifiedAbi = await harness.product.verifyProduct({
    artifactPath: harness.artifactPath,
    artifactRef: harness.artifactRef,
    ...expectedVerificationIdentity(harness.candidateBasis),
  });
  const verifiedMini = await harness.product.verifyProduct({
    artifactPath: selectedMini.artifactPath,
    artifactRef: selectedMini.artifactRef,
    ...expectedVerificationIdentity(selectedMini.basis),
  });
  assert.equal(verifiedAbi.kind, "verified_product_artifact");
  assert.equal(verifiedMini.kind, "verified_product_artifact");
  const resolvedLock = harness.product.constructResolvedProductLock([
    verifiedAbi,
    verifiedMini,
  ]);
  assert.equal(resolvedLock.kind, "resolved_product_lock");
  const workspaceId = `workspace://t270/${label}`;
  const authorizedActorRef = "actor://developer.example/trusted-developer";
  const authorityManifestRef = `manifest://t270/${label}/workspace-authority`;
  const roots = {
    toolchainRoot: abiInstalledRoot,
    productRoot: miniInstalledRoot,
    eventLogRoot,
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  };
  const readinessBasis = constructClosedCatalogReadinessBasis({
    product: harness.product,
    verifiedProducts: [verifiedAbi, verifiedMini],
    resolvedLock,
    installedRoots: [abiInstalledRoot, miniInstalledRoot],
    workspaceId,
    canonicalRoot: workspaceRoot,
    authorizedActorRef,
    authorityManifestRef,
    roots,
    publications: [publication],
  });
  const setupTranscript = [
    invocation("abg.operation.product.verify", "artifact", refs.verifyAbi, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    }),
    invocation("abg.operation.product.verify", "artifact", refs.verifyMini, {
      artifactPath: selectedMini.artifactPath,
      artifactRef: selectedMini.artifactRef,
      ...expectedVerificationIdentity(selectedMini.basis),
    }),
    invocation(
      "abg.operation.product.resolve",
      "verified_product_set",
      refs.resolve,
      {
        verifiedInvocationRefs: [refs.verifyAbi, refs.verifyMini],
      },
    ),
    invocation("abg.operation.product.install", "verified_artifact", refs.installAbi, {
      verifiedInvocationRef: refs.verifyAbi,
      resolvedLockInvocationRef: refs.resolve,
      artifactPath: harness.artifactPath,
      targetRoot: abiConsumer,
    }),
    invocation("abg.operation.product.install", "verified_artifact", refs.installMini, {
      verifiedInvocationRef: refs.verifyMini,
      resolvedLockInvocationRef: refs.resolve,
      artifactPath: selectedMini.artifactPath,
      targetRoot: miniConsumer,
    }),
    invocation("abg.operation.workspace.bind", "exact_product_set", refs.bind, {
      installInvocationRefs: [refs.installAbi, refs.installMini],
      workspaceId,
      canonicalRoot: workspaceRoot,
      authorizedActorRef,
      authorityManifestRef,
      roots,
    }),
  ];
  const eventLogPath = join(eventLogRoot, "developer-product.events.jsonl");
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `external-setup=${Date.now()}-${Math.random()}`,
  );
  const setupContext = installedPublic.createRootOperationContext(eventLogPath);
  const setupOutcomes = [];
  for (const request of setupTranscript) {
    const outcome = await installedPublic.applyRootPublicInvocation(setupContext, request);
    assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    setupOutcomes.push(outcome);
  }
  const runtimePrefixAuthority = installedPublic.projectRootOperationContextAuthority(
    setupContext,
  );
  installedPublic.closeRootOperationContext(setupContext);
  const executionTranscript = [
    invocation("abg.operation.catalog.admit", "module_publication", refs.catalog, {
      readinessBasis,
    }),
    invocation("abg.operation.catalog.view", "allowlist", refs.view, {
      catalogBasis: {
        readinessBasis,
        allowlist: [graphFunctionRef],
        applications: [],
      },
    }),
    invocation("abg.operation.run.invoke", runVariant, refs.run, {
      installInvocationRef: refs.installMini,
      workspaceBindingInvocationRef: refs.bind,
      catalogBasis: {
        readinessBasis,
        allowlist: [graphFunctionRef],
        applications: [],
      },
      programRef,
      actorRef: "actor://developer.example/trusted-developer",
      input,
      eventLogPath,
      runtimePrefixAuthority,
      ...(runVariant === "start"
        ? {
            rootMode:
              target.rootMode ??
              (publicTarget === null ? "supervised" : "direct"),
            scope: target.scope ?? "program",
            target: publicTarget ?? startRef,
            until: target.until ?? "converged",
            ...(publicTarget === null ? { startRef } : {}),
          }
        : { graphFunctionRef }),
    }),
  ];
  const transcript = [...setupTranscript, ...executionTranscript];
  const transcriptPath = join(root, "external-product.transcript.jsonl");
  await mkdir(root, { recursive: true });
  await writeFile(
    transcriptPath,
    `${executionTranscript.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );
  return {
    eventLogPath,
    miniInstalledRoot,
    transcript,
    setupOutcomes,
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
  assert.equal(outcomes.length, 9);
  assert.equal(
    outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(outcomes),
  );
  const binding = outcomes[5].result;
  assert.deepEqual(
    binding.lockedProductIds,
    [harness.candidateBasis.productId, mini.basis.productId],
  );
  assert.deepEqual(binding.dependencyEdges, [{
    kind: "requires",
    fromProductId: mini.basis.productId,
    toProductId: harness.candidateBasis.productId,
    packageVersion: harness.candidateBasis.packageVersion,
    compatibilityRef: "compatibility://abiogenesis/major/5",
    compatibilityDisposition: "compatible",
    requiredContractRefs: [
      "abg.contract.gtl.root-declaration",
      "abg.schema.public-operation-invocation",
    ],
    requiredCapabilityRefs: [
      "abg.capability.catalog.invoke-graph-function@5",
      "abg.capability.gtl.declare@5",
    ],
  }]);
  const result = outcomes[8];
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
  const operationContext = reopenScenario(publicApi, sdkScenario);
  const sdkOutcomes = [...sdkScenario.setupOutcomes];
  for (const row of sdkScenario.transcript.slice(6)) {
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
  assert.equal(malformedGtlRun.outcomes[6].disposition, "refused");
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

test("M5 starts Product-declared next and asset targets without a Public controller", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);

  for (const [label, publicTarget] of [
    ["public-next", "next"],
    [
      "public-asset",
      `asset:${mini.ids.greetingAssetHandle}`,
    ],
  ]) {
    const scenario = await externalScenario(
      harness,
      mini,
      label,
      mini.publication,
      {
        runVariant: "start",
        publicTarget,
      },
    );
    const run = await runInstalledCli(harness, scenario);
    assert.equal(run.exitCode, 0, JSON.stringify(run));
    const outcome = assertExternalOutcome(run.outcomes, harness, mini);
    assert.equal(outcome.replayAgreement, true);

    const events = (await readFile(scenario.eventLogPath, "utf8"))
      .trim()
      .split(/\r?\n/u)
      .map((line) => JSON.parse(line));
    const invocationAdmission = events.find(
      (event) => event.kind === "invocation_admitted",
    );
    assert.equal(
      invocationAdmission?.payload.publicStart.target,
      publicTarget,
    );
    assert.equal(
      invocationAdmission?.payload.publicStart.startRef,
      mini.ids.startRef,
    );
    assert.equal(
      invocationAdmission?.payload.publicStart.graphFunctionRef,
      mini.ids.graphFunctionRef,
    );
    assert.equal(
      invocationAdmission?.payload.publicStart.rootMode,
      "direct",
    );
    assert.equal(
      invocationAdmission?.payload.publicStart.until,
      "converged",
    );
    const openedGraphCall = events.find(
      (event) => event.kind === "graph_call_opened",
    );
    assert.equal(
      openedGraphCall?.payload.graphFunctionRef,
      mini.ids.graphFunctionRef,
    );
    assert.equal(
      events.some(
        (event) =>
          event.kind === "graph_call_opened" &&
          event.payload.graphFunctionRef === mini.ids.greetingAssetRef,
      ),
      false,
    );
  }

  const missingScenario = await externalScenario(
    harness,
    mini,
    "public-asset-missing",
    mini.publication,
    {
      runVariant: "start",
      publicTarget: "asset:missing",
    },
  );
  const missingRun = await runInstalledCli(harness, missingScenario);
  assert.equal(missingRun.exitCode, 2);
  assert.equal(missingRun.outcomes.at(-1).disposition, "refused");
  assert.equal(missingRun.outcomes.at(-1).runId, null);

  const missingDefaultScenario = await externalScenario(
    harness,
    mini,
    "public-next-missing-default",
    withoutDefaultPublicStart(mini),
    {
      runVariant: "start",
      publicTarget: "next",
    },
  );
  const missingDefaultRun = await runInstalledCli(
    harness,
    missingDefaultScenario,
  );
  assert.equal(missingDefaultRun.exitCode, 2);
  assert.equal(
    missingDefaultRun.outcomes.at(-1).disposition,
    "refused",
  );
  assert.equal(missingDefaultRun.outcomes.at(-1).runId, null);

  const duplicateScenario = await externalScenario(
    harness,
    mini,
    "public-asset-duplicate",
    withDuplicatePublicAssetHandle(mini),
    {
      runVariant: "start",
      publicTarget: `asset:${mini.ids.greetingAssetHandle}`,
    },
  );
  const duplicateRun = await runInstalledCli(harness, duplicateScenario);
  assert.equal(duplicateRun.exitCode, 2);
  assert.equal(duplicateRun.outcomes[6].disposition, "refused");
  assert.equal(duplicateRun.outcomes.at(-1).runId, null);

  const firstTraversalScenario = await externalScenario(
    harness,
    mini,
    "public-next-first-traversal",
    mini.publication,
    {
      runVariant: "start",
      publicTarget: "next",
      until: "first_traversal",
    },
  );
  const firstTraversalRun = await runInstalledCli(
    harness,
    firstTraversalScenario,
  );
  assert.equal(firstTraversalRun.exitCode, 2);
  assert.equal(
    firstTraversalRun.outcomes.at(-1).disposition,
    "refused",
  );
  assert.equal(firstTraversalRun.outcomes.at(-1).code, "invalid_request");
  assert.equal(
    Object.hasOwn(firstTraversalRun.outcomes.at(-1), "runId"),
    false,
  );

  const supervisedFirstTraversalScenario = await externalScenario(
    harness,
    mini,
    "supervised-first-traversal",
    mini.publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
      rootMode: "supervised",
      until: "first_traversal",
    },
  );
  const supervisedFirstTraversalRun = await runInstalledCli(
    harness,
    supervisedFirstTraversalScenario,
  );
  assert.equal(supervisedFirstTraversalRun.exitCode, 2);
  assert.equal(
    supervisedFirstTraversalRun.outcomes.at(-1).disposition,
    "refused",
  );
  assert.equal(
    supervisedFirstTraversalRun.outcomes.at(-1).code,
    "invalid_request",
  );
  assert.equal(
    Object.hasOwn(supervisedFirstTraversalRun.outcomes.at(-1), "runId"),
    false,
  );
});

test("M5 invokes external ticket work only through its owning Program and GraphFunction", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const scenario = await externalScenario(
    harness,
    mini,
    "external-ticket-work",
    mini.publication,
    {
      programRef: mini.ids.ticketProgramRef,
      graphFunctionRef: mini.ids.ticketGraphFunctionRef,
      input: {
        kind: "developer_ticket_work_input",
        schemaVersion: "5.0.0",
        ticketRef: "ticket://developer.example/T-001",
        requestedOutcome: "publish one replay-derived ticket result",
      },
    },
  );
  const run = await runInstalledCli(harness, scenario);
  assert.equal(run.exitCode, 0, run.stdout);
  assert.equal(
    run.outcomes.every((outcome) => outcome.disposition === "succeeded"),
    true,
    JSON.stringify(run.outcomes),
  );
  const outcome = run.outcomes.at(-1);
  assert.equal(outcome.replayAgreement, true);
  assert.equal(outcome.outputContractRef, mini.ids.ticketOutputContractRef);
  assert.deepEqual(outcome.result, {
    kind: "developer_ticket_work_output",
    schemaVersion: "5.0.0",
    ticketRef: "ticket://developer.example/T-001",
    disposition: "completed",
    summary: "Completed: publish one replay-derived ticket result",
  });
  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(
    events.some(
      (event) =>
        event.kind === "graph_call_opened" &&
        event.graphFunctionRef === mini.ids.ticketGraphFunctionRef,
    ),
    true,
  );
  assert.equal(
    events.some(
      (event) =>
        event.kind === "c_call_result_admitted" &&
        event.payload.contractRef === mini.ids.ticketOutputContractRef,
    ),
    true,
  );

  const crossWired = await externalScenario(
    harness,
    mini,
    "external-ticket-cross-wire",
    mini.publication,
    {
      programRef: mini.ids.programRef,
      graphFunctionRef: mini.ids.ticketGraphFunctionRef,
      input: {
        kind: "developer_ticket_work_input",
        schemaVersion: "5.0.0",
        ticketRef: "ticket://developer.example/T-001",
        requestedOutcome: "must not run under another Program",
      },
    },
  );
  const refused = await runInstalledCli(harness, crossWired);
  assert.equal(refused.exitCode, 2);
  assert.equal(refused.outcomes.at(-1).disposition, "refused");
  assert.equal(refused.outcomes.at(-1).runId, null);
});

test("M5 applies one Product-declared graph-span re-entry through the installed path", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const scenario = await externalScenario(
    harness,
    mini,
    "external-graph-span-reentry",
    mini.publication,
    {
      programRef: mini.ids.spanProgramRef,
      graphFunctionRef: mini.ids.spanGraphFunctionRef,
      runVariant: "start",
      publicTarget: "next",
      rootMode: "direct",
      until: "converged",
    },
  );
  const run = await runInstalledCli(harness, scenario);
  const events = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(
    run.exitCode,
    0,
    JSON.stringify({
      outcomes: run.outcomes,
      calls: events
        .filter((event) => event.kind.startsWith("c_call_"))
        .map((event) => ({
          kind: event.kind,
          locus: event.payload.programLocusRef,
          resultClass: event.payload.resultClass,
          value: event.payload.value,
        })),
    }),
  );
  assertExternalOutcome(run.outcomes, harness, mini);
  const invocationAdmission = events.find(
    (event) => event.kind === "invocation_admitted",
  );
  assert.equal(invocationAdmission?.payload.publicStart.rootMode, "direct");
  assert.equal(invocationAdmission?.payload.publicStart.until, "converged");
  const cCalls = events.filter(
    (event) =>
      event.kind === "c_call_opened" &&
      event.graphFunctionRef === mini.ids.spanGraphFunctionRef,
  );
  assert.deepEqual(
    cCalls.map((event) => event.payload.programLocusRef),
    [
      mini.ids.spanInitializeLocusRef,
      mini.ids.spanTargetLocusRef,
      mini.ids.spanSelectorLocusRef,
      mini.ids.spanTargetLocusRef,
      mini.ids.spanSelectorLocusRef,
      mini.ids.spanFinalizeLocusRef,
    ],
  );
  const routes = events.filter(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.payload.routeKind === "re_enter",
  );
  assert.equal(routes.length, 1);
  const [route] = routes;
  assert.equal(
    route.payload.graphSpanReentryProjection.sourceProgramLocusRef,
    mini.ids.spanSelectorLocusRef,
  );
  assert.equal(
    route.payload.graphSpanReentryProjection.targetProgramLocusRef,
    mini.ids.spanTargetLocusRef,
  );
  assert.equal(
    route.payload.cCallRef,
    cCalls[2].aggregateId,
  );
  const selectorJudgment = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.aggregateId === cCalls[2].aggregateId,
  );
  assert.ok(selectorJudgment);
  assert.equal(
    route.causationEventRefs.includes(selectorJudgment.eventId),
    true,
  );
  assert.equal(
    route.admissionOrdinal < cCalls[3].admissionOrdinal,
    true,
  );
  assert.equal(
    route.payload.graphSpanReentryProjection.targetInput.targetVisits,
    1,
  );
  assert.equal(
    route.payload.graphSpanReentryProjection.targetInput.reentryApplications,
    1,
  );
  assert.equal(events.at(-1)?.kind, "run_closed");

  const forwardScenario = await externalScenario(
    harness,
    mini,
    "external-graph-span-forward-target",
    withForwardSpanTarget(mini),
    {
      programRef: mini.ids.spanProgramRef,
      graphFunctionRef: mini.ids.spanGraphFunctionRef,
    },
  );
  const forwardRun = await runInstalledCli(harness, forwardScenario);
  assert.equal(forwardRun.exitCode, 2);
  assert.equal(forwardRun.outcomes[6].disposition, "refused");
  assert.equal(forwardRun.outcomes.at(-1).runId, null);

  const repeatedScenario = await externalScenario(
    harness,
    mini,
    "external-graph-span-repeat",
    withRepeatedSpanSelection(mini),
    {
      programRef: mini.ids.spanProgramRef,
      graphFunctionRef: mini.ids.spanGraphFunctionRef,
    },
  );
  const repeatedRun = await runInstalledCli(harness, repeatedScenario);
  assert.equal(repeatedRun.exitCode, 2);
  assert.equal(repeatedRun.outcomes.at(-1).disposition, "failed");
  const repeatedEvents = (await readFile(
    repeatedScenario.eventLogPath,
    "utf8",
  ))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  assert.equal(
    repeatedEvents.filter(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        event.payload.routeKind === "re_enter",
    ).length,
    1,
  );
  assert.equal(
    repeatedEvents.some((event) => event.kind === "runtime_failure_observed"),
    true,
  );
  assert.equal(repeatedEvents.at(-1)?.kind, "runtime_failure_observed");
  assert.equal(
    repeatedEvents.some((event) => event.kind === "run_closed"),
    false,
  );
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
    const operationContext = reopenScenario(publicApi, scenario);
    const setupOutcomes = [...scenario.setupOutcomes];
    const missingAuthorityOutcomes = [];
    try {
      for (const row of scenario.transcript.slice(6)) {
        setupOutcomes.push(
          await publicApi.applyRootPublicInvocation(operationContext, row),
        );
      }
      const held = setupOutcomes.at(-1);
      for (const row of [
        invocation(
          "abg.operation.project.read",
          "status",
          "invocation://t270/external-mixed/read-without-authority",
          {
            continuationRef: held.continuationRef,
          },
        ),
        invocation(
          "abg.operation.interaction.respond",
          "approve",
          "invocation://t270/external-mixed/respond-without-authority",
          {
            actorRef: "actor://developer.example/trusted-developer",
            capabilityRef: mini.ids.actorCapabilityRef,
            continuationRef: held.continuationRef,
            response: {
              kind: "developer_greeting_output",
              schemaVersion: "5.0.0",
              message: "Welcome Grace.",
            },
          },
        ),
        invocation(
          "abg.operation.run.continue",
          "current_intent",
          "invocation://t270/external-mixed/continue-without-authority",
          {
            actorRef: "actor://developer.example/trusted-developer",
            capabilityRef: mini.ids.actorCapabilityRef,
            continuationRef: held.continuationRef,
          },
        ),
      ]) {
        missingAuthorityOutcomes.push(
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
    assert.deepEqual(
      missingAuthorityOutcomes.map((outcome) => [
        outcome.disposition,
        outcome.result.code,
      ]),
      [
        ["refused", "missing_prerequisite"],
        ["refused", "missing_prerequisite"],
        ["refused", "missing_prerequisite"],
      ],
    );
    assert.equal(
      held.result.continuationAuthority.kind,
      "public_continuation_authority",
    );
    const openAuthority = JSON.parse(
      JSON.stringify(held.result.continuationAuthority),
    );
    const actorRef = "actor://developer.example/trusted-developer";
    const invocationAdmission = heldEvents.find(
      (event) => event.kind === "invocation_admitted",
    );
    assert.deepEqual(
      invocationAdmission?.payload.capabilityGrants.map((grant) => [
        grant.actorRef,
        grant.operationId,
        grant.capabilityRef,
      ]),
      [
        [
          actorRef,
          "abg.operation.run.invoke",
          "abg.capability.catalog.invoke-graph-function@5",
        ],
        [
          actorRef,
          "abg.operation.interaction.respond",
          mini.ids.actorCapabilityRef,
        ],
        [
          actorRef,
          "abg.operation.run.continue",
          mini.ids.actorCapabilityRef,
        ],
      ],
    );
    const response = {
      kind: "developer_greeting_output",
      schemaVersion: "5.0.0",
      message: "Welcome Grace.",
    };

    const repeatedRead = invocation(
      "abg.operation.project.read",
      "status",
      "invocation://t270/external-mixed/read-open",
      {
        continuationAuthority: openAuthority,
        continuationRef,
      },
    );
    const retainedReadContext = newEpisode(publicApi);
    let readOpen;
    let readOpenDuplicate;
    try {
      readOpen = await publicApi.applyRootPublicInvocation(
        retainedReadContext,
        repeatedRead,
      );
      readOpenDuplicate = await publicApi.applyRootPublicInvocation(
        retainedReadContext,
        repeatedRead,
      );
    } finally {
      publicApi.closeRootOperationContext(retainedReadContext);
    }
    const readOpenFresh = await applyInFreshContext(publicApi, repeatedRead);
    assert.deepEqual(
      [readOpen, readOpenDuplicate, readOpenFresh].map((outcome) => [
        outcome.disposition,
        outcome.result.status,
      ]),
      [
        ["succeeded", "open"],
        ["succeeded", "open"],
        ["succeeded", "open"],
      ],
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
    const authorityAfterMalformed = JSON.parse(
      JSON.stringify(malformedResponse.continuationAuthority),
    );

    const installedMiniProduct = await import(
      pathToFileURL(
        join(scenario.miniInstalledRoot, "build/index.js"),
      ).href
    );
    installedMiniProduct.resetInteractionResponseEvaluationCount();
    const wrongActor = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.interaction.respond",
        "approve",
        "invocation://t270/external-mixed/respond-wrong-actor",
        {
          actorRef: "actor://developer.example/substituted",
          capabilityRef: mini.ids.actorCapabilityRef,
          continuationAuthority: authorityAfterMalformed,
          continuationRef,
          response,
        },
      ),
    );
    assert.notEqual(wrongActor.disposition, "succeeded");
    assert.equal(
      installedMiniProduct.readInteractionResponseEvaluationCount(),
      0,
      "wrong actor must be refused before installed Product evaluation",
    );

    installedMiniProduct.resetInteractionResponseEvaluationCount();
    const wrongCapability = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.interaction.respond",
        "approve",
        "invocation://t270/external-mixed/respond-wrong-capability",
        {
          actorRef,
          capabilityRef:
            "capability://developer.example/greeting/unadmitted@5",
          continuationAuthority: authorityAfterMalformed,
          continuationRef,
          response,
        },
      ),
    );
    assert.equal(wrongCapability.disposition, "refused");
    assert.equal(wrongCapability.result.code, "owner_refusal");
    assert.equal(
      installedMiniProduct.readInteractionResponseEvaluationCount(),
      0,
      "wrong capability must be refused before installed Product evaluation",
    );

    installedMiniProduct.resetInteractionResponseEvaluationCount();
    const responded = await applyInFreshContext(
      publicApi,
      invocation(
        "abg.operation.interaction.respond",
        "approve",
        "invocation://t270/external-mixed/respond",
        {
          actorRef,
          capabilityRef: mini.ids.actorCapabilityRef,
          continuationAuthority: authorityAfterMalformed,
          continuationRef,
          response,
        },
      ),
    );
    assert.equal(responded.disposition, "succeeded", JSON.stringify(responded));
    assert.equal(responded.continuationStatus, "responded");
    assert.equal(
      installedMiniProduct.readInteractionResponseEvaluationCount(),
      1,
    );
    const respondedAuthority = JSON.parse(
      JSON.stringify(responded.result.continuationAuthority),
    );
    const duplicateRespondInvocation = invocation(
      "abg.operation.interaction.respond",
      "approve",
      "invocation://t270/external-mixed/respond",
      {
        actorRef,
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority: respondedAuthority,
        continuationRef,
        response,
      },
    );
    const retainedDuplicateContext = newEpisode(publicApi);
    let duplicateRespondRetained;
    let duplicateRespondRetainedAgain;
    try {
      duplicateRespondRetained = await publicApi.applyRootPublicInvocation(
        retainedDuplicateContext,
        duplicateRespondInvocation,
      );
      duplicateRespondRetainedAgain =
        await publicApi.applyRootPublicInvocation(
          retainedDuplicateContext,
          duplicateRespondInvocation,
        );
    } finally {
      publicApi.closeRootOperationContext(retainedDuplicateContext);
    }
    const duplicateRespondFresh = await applyInFreshContext(
      publicApi,
      duplicateRespondInvocation,
    );
    assert.deepEqual(
      [
        duplicateRespondRetained,
        duplicateRespondRetainedAgain,
        duplicateRespondFresh,
      ].map((outcome) => [outcome.disposition, outcome.result.code]),
      [
        ["refused", "target_mismatch"],
        ["refused", "target_mismatch"],
        ["refused", "target_mismatch"],
      ],
    );
    assert.equal(
      duplicateRespondFresh.continuationAuthority.kind,
      "public_continuation_authority",
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
  const missingActionContext = reopenScenario(publicApi, missingActionScenario);
  const missingActionOutcomes = [...missingActionScenario.setupOutcomes];
  try {
    for (const row of missingActionScenario.transcript.slice(6, -1)) {
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
      missingActionOutcomes[5].result,
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
  const operationContext = reopenScenario(publicApi, scenario);
  const setupOutcomes = [...scenario.setupOutcomes];
  try {
    for (const row of scenario.transcript.slice(6, -1)) {
      setupOutcomes.push(
        await publicApi.applyRootPublicInvocation(operationContext, row),
      );
    }
    const validStart = structuredClone(scenario.transcript.at(-1));
    validStart.payload.input = oneSurfaceObservation(
      mini,
      mini.publication,
      setupOutcomes[5].result,
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
    assert.equal(callerSelectedGraphFunction.code, "invalid_request");
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
  assert.equal(frontier.result.constructionStatus, "fh_input_required");
  const openActions = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "lawful-actions",
      "invocation://t272/external-one-surface/read-open-actions",
      {
        continuationAuthority: openAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(openActions.disposition, "succeeded", JSON.stringify(openActions));
  assert.equal(
    openActions.result.current.projectionRef,
    frontier.result.nextActionProjection.projectionRef,
  );
  assert.equal(
    openActions.result.current.selectedActionRef,
    mini.ids.approvalActionRef,
  );
  const unresolvedResult = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "result",
      "invocation://t272/external-one-surface/read-unresolved-result",
      {
        continuationAuthority: openAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(unresolvedResult.disposition, "refused");
  assert.equal(unresolvedResult.result.code, "target_mismatch");
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
  assert.equal(
    completed.continuationAuthority.kind,
    "public_continuation_authority",
  );
  const resolvedAuthority = JSON.parse(
    JSON.stringify(completed.continuationAuthority),
  );
  const durableBytesBeforeReads = await readFile(scenario.eventLogPath, "utf8");
  const resolvedStatus = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "status",
      "invocation://t272/external-one-surface/read-resolved-status",
      {
        continuationAuthority: resolvedAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(resolvedStatus.disposition, "succeeded");
  assert.equal(resolvedStatus.result.status, "resolved");
  assert.equal(
    resolvedStatus.result.constructionStatus,
    "construction_closed",
  );
  const resolvedResult = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "result",
      "invocation://t272/external-one-surface/read-resolved-result",
      {
        continuationAuthority: resolvedAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(resolvedResult.disposition, "succeeded");
  assert.equal(resolvedResult.result.kind, "public_result_projection");
  assert.equal(resolvedResult.result.closureEligible, true);
  assert.deepEqual(resolvedResult.result.value, completed.result);
  const resolvedReplay = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "replay",
      "invocation://t272/external-one-surface/read-resolved-replay",
      {
        continuationAuthority: resolvedAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(resolvedReplay.disposition, "succeeded");
  assert.equal(resolvedReplay.result.kind, "public_replay_projection");
  assert.equal(resolvedReplay.result.runId, completed.runId);
  assert.equal(
    resolvedReplay.result.events.at(-1).kind,
    "run_closed",
  );
  assert.deepEqual(
    resolvedReplay.result.events.map((event) => event.admissionOrdinal),
    [...resolvedReplay.result.events]
      .sort((left, right) => left.admissionOrdinal - right.admissionOrdinal)
      .map((event) => event.admissionOrdinal),
  );
  const resolvedActions = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "lawful-actions",
      "invocation://t272/external-one-surface/read-resolved-actions",
      {
        continuationAuthority: resolvedAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(resolvedActions.disposition, "succeeded");
  assert.equal(
    resolvedActions.result.current.disposition,
    "converged",
  );
  assert.equal(
    await readFile(scenario.eventLogPath, "utf8"),
    durableBytesBeforeReads,
  );
  const staleRead = await applyInFreshContext(
    publicApi,
    invocation(
      "abg.operation.project.read",
      "status",
      "invocation://t272/external-one-surface/read-stale-authority",
      {
        continuationAuthority: openAuthority,
        continuationRef,
      },
    ),
  );
  assert.equal(staleRead.disposition, "refused");
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
        result.outcomes[6].disposition,
        "refused",
        JSON.stringify(result.outcomes),
      );
      assert.match(
        result.outcomes[6].result.message,
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
        result.outcomes[6].disposition,
        "refused",
        JSON.stringify(result.outcomes),
      );
      assert.match(
        result.outcomes[6].result.message,
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
      const duplicateContinue = invocation(
        "abg.operation.run.continue",
        "current_intent",
        "invocation://t272/external-one-surface-unproven-output/continue",
        {
          actorRef: "actor://developer.example/trusted-developer",
          capabilityRef: mini.ids.actorCapabilityRef,
          continuationAuthority: JSON.parse(
            JSON.stringify(result.completed.continuationAuthority),
          ),
          continuationRef: result.held.continuationRef,
        },
      );
      const retainedContext = newEpisode(publicApi);
      let retainedDuplicate;
      let retainedDuplicateAgain;
      try {
        retainedDuplicate = await publicApi.applyRootPublicInvocation(
          retainedContext,
          duplicateContinue,
        );
        retainedDuplicateAgain = await publicApi.applyRootPublicInvocation(
          retainedContext,
          duplicateContinue,
        );
      } finally {
        publicApi.closeRootOperationContext(retainedContext);
      }
      const freshDuplicate = await applyInFreshContext(
        publicApi,
        duplicateContinue,
      );
      assert.deepEqual(
        [
          retainedDuplicate,
          retainedDuplicateAgain,
          freshDuplicate,
        ].map((outcome) => outcome.disposition),
        ["refused", "refused", "refused"],
      );
      const eventsAfterDuplicates = (await readFile(
        result.scenario.eventLogPath,
        "utf8",
      )).trim().split(/\r?\n/u).map((line) => JSON.parse(line));
      assert.equal(
        eventsAfterDuplicates.filter(
          (event) =>
            event.kind === "public_operation_admitted" &&
            event.payload.invocationRef === duplicateContinue.invocationRef,
        ).length,
        1,
        "durable invocation identity must reject retries in retained and fresh contexts",
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
        result.completed.continuationAuthority.kind,
        "public_continuation_authority",
      );
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
      const reopenedFailure = await applyInFreshContext(
        publicApi,
        invocation(
          "abg.operation.project.read",
          "status",
          "invocation://t270/external-one-surface/post-resume-failure-read",
          {
            continuationAuthority:
              result.completed.continuationAuthority,
            continuationRef: result.completed.continuationRef,
          },
        ),
      );
      assert.equal(
        reopenedFailure.disposition,
        "succeeded",
        JSON.stringify(reopenedFailure),
      );
      assert.equal(reopenedFailure.result.status, "resolved");
      assert.equal(reopenedFailure.result.runtimeStatus, "failed");
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
  const operationContext = reopenScenario(publicApi, scenario);
  const setupOutcomes = [...scenario.setupOutcomes];
  try {
    for (const row of scenario.transcript.slice(6, -1)) {
      setupOutcomes.push(
        await publicApi.applyRootPublicInvocation(operationContext, row),
      );
    }
    const start = structuredClone(scenario.transcript.at(-1));
    start.payload.input = oneSurfaceObservation(
      mini,
      mini.publication,
      setupOutcomes[5].result,
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
  assert.equal(refused.result.code, "target_mismatch");
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

test("M5 exposes a durable gap and re-enters it through the same external Product", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const installedPublic = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?gap-reentry=${Date.now()}`,
  );
  const scenario = await externalScenario(
    harness,
    mini,
    "external-one-surface-gap-reentry",
    mini.publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
    },
  );
  const setupContext = reopenScenario(installedPublic, scenario);
  const setupOutcomes = [...scenario.setupOutcomes];
  try {
    for (const row of scenario.transcript.slice(6, -1)) {
      setupOutcomes.push(
        await installedPublic.applyRootPublicInvocation(setupContext, row),
      );
    }
    const start = structuredClone(scenario.transcript.at(-1));
    const binding = setupOutcomes[5].result;
    const program = mini.publication.programs.find(
      (candidate) =>
        candidate.programRef === mini.ids.oneSurfaceProgramRef,
    );
    assert.ok(program?.actionCatalog);
    start.payload.input = mini.constructObservationSnapshot({
      workspaceBindingId: binding.bindingId,
      workspaceBindingDigest: binding.bindingDigest,
      actionCatalog: program.actionCatalog,
      availableActionRefs: [],
      name: "Margaret",
    });
    setupOutcomes.push(
      await installedPublic.applyRootPublicInvocation(setupContext, start),
    );
  } finally {
    installedPublic.closeRootOperationContext(setupContext);
  }
  assert.equal(
    setupOutcomes.slice(0, -1).every(
      (outcome) => outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(setupOutcomes),
  );
  const stopped = setupOutcomes.at(-1);
  const initialEvents = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  assert.equal(
    stopped.disposition,
    "gap_stop",
    JSON.stringify({
      stopped,
      finalEvents: initialEvents.slice(-4).map((event) => ({
        kind: event.kind,
        routeKind: event.payload?.routeKind ?? null,
        disposition: event.payload?.disposition ?? null,
      })),
    }),
  );
  assert.equal(stopped.result.kind, "construction_gap_stop");
  assert.equal(stopped.result.nextActionProjection.disposition, "no_action");
  assert.equal(
    stopped.result.nextActionProjection.noActionDisposition,
    "gap_stop",
  );
  const initialGapAuthority = JSON.parse(
    JSON.stringify(stopped.result.gapAuthority),
  );
  assert.equal(
    initialEvents.filter(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        event.payload.routeKind === "gap_stop",
    ).length,
    1,
  );
  assert.equal(
    initialEvents.filter((event) => event.kind === "run_stopped").length,
    1,
  );
  for (const prohibitedKind of [
    "construction_intent_selected",
    "fh_interaction_opened",
    "terminal_reached",
    "run_closed",
  ]) {
    assert.equal(
      initialEvents.filter((event) => event.kind === prohibitedKind).length,
      0,
      prohibitedKind,
    );
  }

  const gapRead = await applyInFreshContext(
    installedPublic,
    invocation(
      "abg.operation.project.read",
      "gaps",
      "invocation://t272/external-one-surface-gap-reentry/read-gap",
      {
        gapAuthority: initialGapAuthority,
        gapRef: stopped.result.gapRef,
      },
    ),
  );
  assert.equal(gapRead.disposition, "succeeded", JSON.stringify(gapRead));
  assert.equal(gapRead.result.kind, "public_gap_projection");
  assert.equal(gapRead.result.constructionStatus, "construction_stalled");
  assert.equal(gapRead.durableEventCount, stopped.durableEventCount);
  assert.equal(gapRead.eventLogDigest, stopped.eventLogDigest);
  assert.equal(
    gapRead.result.gapAuthority.source.sourceRunStoppedEventRef,
    initialGapAuthority.source.sourceRunStoppedEventRef,
  );
  assert.equal(
    initialEvents.find(
      (event) =>
        event.eventId ===
          gapRead.result.gapAuthority.source.sourceRunStoppedEventRef,
    )?.payload?.disposition,
    "gap_stop",
  );
  const gapAuthority = JSON.parse(
    JSON.stringify(gapRead.result.gapAuthority),
  );
  const source = gapAuthority.source;
  const reentry = structuredClone(scenario.transcript.at(-1));
  reentry.invocationRef =
    "invocation://t272/external-one-surface-gap-reentry/re-enter";
  reentry.correlationId =
    "correlation://t272/external-one-surface-gap-reentry/re-enter";
  reentry.payload.reentryAuthority = gapAuthority;
  reentry.payload.input = mini.constructObservationSnapshot({
    workspaceBindingId: gapAuthority.workspaceBinding.bindingId,
    workspaceBindingDigest: gapAuthority.workspaceBinding.bindingDigest,
    actionCatalog: actionCatalogFromGapAuthority(
      gapAuthority,
      mini.ids.oneSurfaceProgramRef,
    ),
    availableActionRefs: [mini.ids.approvalActionRef],
    name: "Margaret",
    priorGap: {
      sourceRunId: source.sourceRunId,
      sourceRouteRef: source.sourceRouteRef,
      gapRef: source.gapRef,
      nextActionProjectionRef: source.nextActionProjectionRef,
      nextActionProjectionDigest: source.nextActionProjectionDigest,
    },
  });
  const reentryAttempt = (suffix, authority = gapAuthority) => {
    const candidate = structuredClone(reentry);
    candidate.invocationRef =
      `invocation://t272/external-one-surface-gap-reentry/${suffix}`;
    candidate.correlationId =
      `correlation://t272/external-one-surface-gap-reentry/${suffix}`;
    candidate.payload.reentryAuthority = authority;
    return candidate;
  };
  const assertRefusedReentry = async (candidate) => {
    const outcome = await applyInFreshContext(installedPublic, candidate);
    assert.equal(outcome.disposition, "refused", JSON.stringify(outcome));
  };
  await context.test("refuses re-entry without durable gap authority", async () => {
    const missingAuthority = reentryAttempt("missing-authority");
    delete missingAuthority.payload.reentryAuthority;
    await assertRefusedReentry(missingAuthority);
  });
  await context.test("refuses a gap authority bound to another workspace", async () => {
    const wrongWorkspaceAuthority = structuredClone(gapAuthority);
    wrongWorkspaceAuthority.workspaceBinding.bindingId =
      `${wrongWorkspaceAuthority.workspaceBinding.bindingId}/substituted`;
    wrongWorkspaceAuthority.workspaceBinding.bindingDigest =
      `sha256:${"0".repeat(64)}`;
    await assertRefusedReentry(
      reentryAttempt(
        "wrong-workspace",
        redigestGapAuthority(wrongWorkspaceAuthority),
      ),
    );
  });
  await context.test("refuses a gap authority bound to another Program", async () => {
    const wrongProgramAuthority = structuredClone(gapAuthority);
    wrongProgramAuthority.publicStart.programRef =
      `${wrongProgramAuthority.publicStart.programRef}/substituted`;
    await assertRefusedReentry(
      reentryAttempt(
        "wrong-program",
        redigestGapAuthority(wrongProgramAuthority),
      ),
    );
  });
  await context.test("refuses a non-gap source route", async () => {
    const advanceEvent = initialEvents.find(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        event.runId === source.sourceRunId &&
        event.payload.routeKind === "advance",
    );
    assert.ok(advanceEvent);
    const nonGapAuthority = structuredClone(gapAuthority);
    nonGapAuthority.source.sourceRouteRef = advanceEvent.payload.routeRef;
    nonGapAuthority.source.sourceRouteDigest =
      advanceEvent.payload.routeDigest;
    nonGapAuthority.source.sourceRouteEventRef = advanceEvent.eventId;
    await assertRefusedReentry(
      reentryAttempt(
        "non-gap-source",
        redigestGapAuthority(nonGapAuthority),
      ),
    );
  });
  await context.test("refuses a self-consistent reduced ProductSet", async () => {
    assert.equal(gapAuthority.resolvedProductLock.rows.length, 2);
    assert.equal(gapAuthority.productSet.orderedInstallRefs.length, 2);
    await assertRefusedReentry(
      reentryAttempt(
        "reduced-product-set",
        withReducedProductSet(gapAuthority),
      ),
    );
  });
  const wrongGapReentry = structuredClone(reentry);
  wrongGapReentry.invocationRef =
    "invocation://t272/external-one-surface-gap-reentry/wrong-gap";
  wrongGapReentry.correlationId =
    "correlation://t272/external-one-surface-gap-reentry/wrong-gap";
  wrongGapReentry.payload.input = mini.constructObservationSnapshot({
    workspaceBindingId: gapAuthority.workspaceBinding.bindingId,
    workspaceBindingDigest: gapAuthority.workspaceBinding.bindingDigest,
    actionCatalog: actionCatalogFromGapAuthority(
      gapAuthority,
      mini.ids.oneSurfaceProgramRef,
    ),
    availableActionRefs: [mini.ids.approvalActionRef],
    name: "Margaret",
    priorGap: {
      sourceRunId: source.sourceRunId,
      sourceRouteRef: `${source.sourceRouteRef}/substituted`,
      gapRef: source.gapRef,
      nextActionProjectionRef: source.nextActionProjectionRef,
      nextActionProjectionDigest: source.nextActionProjectionDigest,
    },
  });
  const wrongGap = await applyInFreshContext(
    installedPublic,
    wrongGapReentry,
  );
  assert.equal(wrongGap.disposition, "refused", JSON.stringify(wrongGap));
  const held = await applyInFreshContext(installedPublic, reentry);
  assert.equal(held.disposition, "held", JSON.stringify(held));

  await context.test("refuses a rebased second consumption of the source gap", async () => {
    const rebasedAuthority = structuredClone(gapAuthority);
    rebasedAuthority.reopenAuthority =
      held.result.continuationAuthority.reopenAuthority;
    await assertRefusedReentry(
      reentryAttempt(
        "duplicate-consumption",
        redigestGapAuthority(rebasedAuthority),
      ),
    );
  });

  const staleRead = await applyInFreshContext(
    installedPublic,
    invocation(
      "abg.operation.project.read",
      "gaps",
      "invocation://t272/external-one-surface-gap-reentry/stale-read",
      {
        gapAuthority,
        gapRef: source.gapRef,
      },
    ),
  );
  assert.equal(staleRead.disposition, "refused", JSON.stringify(staleRead));

  const frontier = await applyInFreshContext(
    installedPublic,
    invocation(
      "abg.operation.project.read",
      "status",
      "invocation://t272/external-one-surface-gap-reentry/read-intent",
      {
        continuationAuthority: held.result.continuationAuthority,
        continuationRef: held.continuationRef,
      },
    ),
  );
  assert.equal(frontier.disposition, "succeeded", JSON.stringify(frontier));
  const responded = await applyInFreshContext(
    installedPublic,
    invocation(
      "abg.operation.interaction.respond",
      "approve",
      "invocation://t272/external-one-surface-gap-reentry/respond",
      {
        actorRef: "actor://developer.example/trusted-developer",
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority: held.result.continuationAuthority,
        continuationRef: held.continuationRef,
        response: {
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
  const completed = await applyInFreshContext(
    installedPublic,
    invocation(
      "abg.operation.run.continue",
      "current_intent",
      "invocation://t272/external-one-surface-gap-reentry/continue",
      {
        actorRef: "actor://developer.example/trusted-developer",
        capabilityRef: mini.ids.actorCapabilityRef,
        continuationAuthority: responded.result.continuationAuthority,
        continuationRef: held.continuationRef,
      },
    ),
  );
  assert.equal(completed.disposition, "succeeded", JSON.stringify(completed));
  assert.equal(completed.replayAgreement, true);

  const finalEvents = (await readFile(scenario.eventLogPath, "utf8"))
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  const admissions = finalEvents.filter(
    (event) => event.kind === "invocation_admitted",
  );
  assert.equal(admissions.length, 2);
  assert.equal(admissions[0].payload.reentryBasis, null);
  assert.equal(
    admissions[1].payload.reentryBasis.sourceRouteRef,
    source.sourceRouteRef,
  );
  assert.equal(
    admissions[1].payload.reentryBasis.sourceRouteEventRef,
    source.sourceRouteEventRef,
  );
  assert.equal(
    admissions[1].payload.reentryBasis.sourceRunStoppedEventRef,
    source.sourceRunStoppedEventRef,
  );
  assert.equal(
    admissions[1].payload.reentryBasis.nextActionProjectionRef,
    source.nextActionProjectionRef,
  );
  assert.equal(
    admissions[1].payload.reentryBasis.nextActionProjectionDigest,
    source.nextActionProjectionDigest,
  );
  assert.equal(
    finalEvents.filter((event) => event.kind === "run_closed").length,
    1,
  );
});

test("M5 preserves a Product-required reprice as a readable non-close stop", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const installedPublic = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?reprice-stop=${Date.now()}`,
  );
  const scenario = await externalScenario(
    harness,
    mini,
    "external-one-surface-reprice-stop",
    mini.publication,
    {
      runVariant: "start",
      startRef: mini.ids.oneSurfaceStartRef,
      programRef: mini.ids.oneSurfaceProgramRef,
      graphFunctionRef: mini.ids.oneSurfaceGraphFunctionRef,
    },
  );
  const setupContext = reopenScenario(installedPublic, scenario);
  const setupOutcomes = [...scenario.setupOutcomes];
  try {
    for (const row of scenario.transcript.slice(6, -1)) {
      setupOutcomes.push(
        await installedPublic.applyRootPublicInvocation(setupContext, row),
      );
    }
    const start = structuredClone(scenario.transcript.at(-1));
    const binding = setupOutcomes[5].result;
    const program = mini.publication.programs.find(
      (candidate) =>
        candidate.programRef === mini.ids.oneSurfaceProgramRef,
    );
    assert.ok(program?.actionCatalog);
    start.payload.input = mini.constructObservationSnapshot({
      workspaceBindingId: binding.bindingId,
      workspaceBindingDigest: binding.bindingDigest,
      actionCatalog: program.actionCatalog,
      availableActionRefs: [],
      changeAuthorityState: "requires_reprice",
      name: "Margaret",
    });
    const unsupported = structuredClone(start);
    unsupported.invocationRef =
      "invocation://t272/external-one-surface-reprice-stop/unsupported-disposition";
    unsupported.correlationId =
      "correlation://t272/external-one-surface-reprice-stop/unsupported-disposition";
    unsupported.payload.input = redigestObservationSnapshot({
      ...unsupported.payload.input,
      changeAuthorityState: "ticket_required",
    });
    const unsupportedOutcome =
      await installedPublic.applyRootPublicInvocation(
        setupContext,
        unsupported,
      );
    assert.equal(
      unsupportedOutcome.disposition,
      "refused",
      JSON.stringify(unsupportedOutcome),
    );
    assert.equal(unsupportedOutcome.runId, null);
    setupOutcomes.push(
      await installedPublic.applyRootPublicInvocation(setupContext, start),
    );
  } finally {
    installedPublic.closeRootOperationContext(setupContext);
  }

  assert.equal(
    setupOutcomes.slice(0, -1).every(
      (outcome) => outcome.disposition === "succeeded",
    ),
    true,
    JSON.stringify(setupOutcomes),
  );
  const stopped = setupOutcomes.at(-1);
  assert.equal(
    stopped.disposition,
    "reprice_required",
    JSON.stringify(stopped),
  );
  assert.equal(stopped.result.kind, "construction_no_action_stop");
  assert.equal(
    stopped.result.noActionDisposition,
    "reprice_required",
  );
  assert.equal(
    stopped.result.nextActionProjection.noActionDisposition,
    "reprice_required",
  );
  assert.equal(stopped.replayAgreement, true);

  const eventsBeforeRead = await readFile(scenario.eventLogPath, "utf8");
  const events = eventsBeforeRead
    .trim()
    .split(/\r?\n/u)
    .map((line) => JSON.parse(line));
  const stopEvent = events.find((event) => event.kind === "run_stopped");
  assert.equal(stopEvent?.payload.disposition, "reprice_required");
  assert.equal(
    events.filter(
      (event) =>
        event.kind === "traversal_route_admitted" &&
        event.payload.routeKind === "gap_stop" &&
        event.payload.nextActionProjection
          ?.noActionDisposition === "reprice_required",
    ).length,
    1,
  );
  for (const prohibitedKind of [
    "construction_intent_selected",
    "fh_interaction_opened",
    "terminal_reached",
    "run_closed",
  ]) {
    assert.equal(
      events.filter((event) => event.kind === prohibitedKind).length,
      0,
      prohibitedKind,
    );
  }

  const read = await applyInFreshContext(
    installedPublic,
    invocation(
      "abg.operation.project.read",
      "gaps",
      "invocation://t272/external-one-surface-reprice-stop/read",
      {
        gapAuthority: stopped.result.gapAuthority,
        gapRef: stopped.result.gapRef,
      },
    ),
  );
  assert.equal(read.disposition, "succeeded", JSON.stringify(read));
  assert.equal(read.result.constructionStatus, "reprice_required");
  assert.equal(
    read.result.nextActionProjection.noActionDisposition,
    "reprice_required",
  );
  assert.equal(
    await readFile(scenario.eventLogPath, "utf8"),
    eventsBeforeRead,
  );

  const reentry = structuredClone(scenario.transcript.at(-1));
  reentry.invocationRef =
    "invocation://t272/external-one-surface-reprice-stop/reentry-refused";
  reentry.correlationId =
    "correlation://t272/external-one-surface-reprice-stop/reentry-refused";
  reentry.payload.reentryAuthority = read.result.gapAuthority;
  const refused = await applyInFreshContext(installedPublic, reentry);
  assert.equal(refused.disposition, "refused", JSON.stringify(refused));
  assert.equal(
    await readFile(scenario.eventLogPath, "utf8"),
    eventsBeforeRead,
  );
});

test("M5 preserves governed correction dispositions through the external Product", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const mini = await prepareDeveloperMiniProduct(packageRoot, harness.scratch);
  const installedPublic = await import(
    `${pathToFileURL(join(
      harness.cliHost,
      "node_modules/@abiogenesis/typescript-tenant/build/code/src/public/index.js",
    )).href}?governed-corrections=${Date.now()}`,
  );
  const cases = [
    {
      authorityState: "repair_required",
      disposition: "repair",
    },
    {
      authorityState: "runtime_archive_inspection_required",
      disposition: "inspect_runtime_archive",
    },
    {
      authorityState: "reprice_authorized",
      disposition: "reprice",
    },
    {
      authorityState: "escalation_required",
      disposition: "escalate",
    },
  ];
  const correctionObservation = (authorityState) =>
    ({ binding, publication }) => {
      const program = publication.programs.find(
        (candidate) =>
          candidate.programRef === mini.ids.oneSurfaceProgramRef,
      );
      assert.ok(program?.actionCatalog);
      return mini.constructObservationSnapshot({
        workspaceBindingId: binding.bindingId,
        workspaceBindingDigest: binding.bindingDigest,
        actionCatalog: program.actionCatalog,
        changeAuthorityState: authorityState,
        name: "Margaret",
      });
    };

  for (const row of cases) {
    await context.test(row.disposition, async () => {
      const result = await oneSurfaceLifecycle(
        installedPublic,
        harness,
        mini,
        `external-one-surface-correction-${row.disposition}`,
        mini.publication,
        {
          observation: correctionObservation(row.authorityState),
          responseVariant: "answer_escalation",
          response: (frontier) => ({
            kind: "developer_human_approval",
            schemaVersion: "5.0.0",
            approved: true,
            constructionIntentRef: frontier.result.constructionIntentRef,
            correctionDisposition: row.disposition,
            message: `Apply ${row.disposition}.`,
            semanticEvidenceAssetRefs: [mini.ids.approvalAssetRef],
          }),
        },
      );
      const { completed, events, held } = result;
      assert.equal(
        completed.disposition,
        row.disposition,
        JSON.stringify(completed),
      );
      assert.equal(completed.replayAgreement, true);
      assert.equal(completed.continuationStatus, "resolved");
      assert.equal(completed.result.kind, "governed_correction_stop");
      assert.equal(completed.result.noActionDisposition, row.disposition);
      assert.equal(
        completed.result.nextActionProjection.noActionDisposition,
        row.disposition,
      );
      assert.equal(
        completed.result.edgeClosureDecision.disposition,
        "continue_candidate",
      );
      assert.equal(
        completed.result.edgeClosureDecision.correctionDisposition,
        row.disposition,
      );
      const archive = completed.result.runtimeArchiveInspection;
      assert.equal(archive.kind, "runtime_archive_inspection");
      assert.equal(archive.disposition, "inspected");
      assert.equal(archive.runtimeEvidenceEventRefs.length, 4);
      assert.equal(new Set(archive.runtimeEvidenceEventRefs).size, 4);
      assert.equal(
        archive.runtimeEvidenceEventRefs.every((eventRef) =>
          events.some((event) => event.eventId === eventRef)
        ),
        true,
      );

      const deltaIndex = events.findIndex(
        (event) => event.kind === "construction_delta_observed",
      );
      const correctionRouteIndex = events.findIndex(
        (event) =>
          event.kind === "traversal_route_admitted" &&
          event.payload.routeKind === "gap_stop" &&
          event.payload.nextActionProjection?.noActionDisposition ===
            row.disposition,
      );
      const stoppedIndex = events.findIndex(
        (event) =>
          event.kind === "run_stopped" &&
          event.payload.disposition === row.disposition,
      );
      assert.equal(deltaIndex >= 0, true);
      assert.equal(correctionRouteIndex > deltaIndex, true);
      assert.equal(stoppedIndex > correctionRouteIndex, true);
      for (const prohibitedKind of ["terminal_reached", "run_closed"]) {
        assert.equal(
          events.filter((event) => event.kind === prohibitedKind).length,
          0,
          prohibitedKind,
        );
      }

      const status = await applyInFreshContext(
        installedPublic,
        invocation(
          "abg.operation.project.read",
          "status",
          `invocation://t272/correction-${row.disposition}/status`,
          {
            continuationAuthority: completed.continuationAuthority,
            continuationRef: held.continuationRef,
          },
        ),
      );
      assert.equal(status.disposition, "succeeded", JSON.stringify(status));
      assert.equal(
        status.result.constructionStatus,
        `construction_${row.disposition}`,
      );
      assert.equal(status.result.runStoppedDisposition, row.disposition);
      assert.equal(
        status.result.actionEvaluation.edgeClosureDecision
          .correctionDisposition,
        row.disposition,
      );
      assert.equal(
        status.result.runtimeArchiveInspection.inspectionRef,
        archive.inspectionRef,
      );

      const replay = await applyInFreshContext(
        installedPublic,
        invocation(
          "abg.operation.project.read",
          "replay",
          `invocation://t272/correction-${row.disposition}/replay`,
          {
            continuationAuthority: status.result.continuationAuthority,
            continuationRef: held.continuationRef,
          },
        ),
      );
      assert.equal(replay.disposition, "succeeded", JSON.stringify(replay));
      assert.equal(replay.result.runId, completed.runId);
      assert.equal(
        replay.result.events.some(
          (event) =>
            event.kind === "run_stopped" &&
            event.payload.disposition === row.disposition,
        ),
        true,
      );
    });
  }

  await context.test(
    "refuses a human correction choice that differs from Product-observed pressure",
    async () => {
      const result = await oneSurfaceLifecycle(
        installedPublic,
        harness,
        mini,
        "external-one-surface-correction-wrong-choice",
        mini.publication,
        {
          observation: correctionObservation("repair_required"),
          expectedResponseDisposition: "refused",
          responseVariant: "answer_escalation",
          response: (frontier) => ({
            kind: "developer_human_approval",
            schemaVersion: "5.0.0",
            approved: true,
            constructionIntentRef: frontier.result.constructionIntentRef,
            correctionDisposition: "escalate",
            message: "Escalate instead.",
            semanticEvidenceAssetRefs: [mini.ids.approvalAssetRef],
          }),
        },
      );
      assert.equal(result.responded.disposition, "refused");
      assert.equal(result.responded.result.code, "target_mismatch");
      assert.equal(result.completed, null);
      assert.equal(
        result.events.some(
          (event) => event.kind === "fh_interaction_responded",
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
        result.events.some(
          (event) =>
            event.kind === "run_stopped" &&
            ["repair", "inspect_runtime_archive", "reprice", "escalate"]
              .includes(event.payload.disposition),
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
    "refuses a self-consistent runtime archive outside the admitted basis",
    async () => {
      const result = await oneSurfaceLifecycle(
        installedPublic,
        harness,
        mini,
        "external-one-surface-correction-substituted-archive",
        withSubstitutedRuntimeArchive(mini),
        {
          observation: correctionObservation("repair_required"),
          responseVariant: "answer_escalation",
          response: (frontier) => ({
            kind: "developer_human_approval",
            schemaVersion: "5.0.0",
            approved: true,
            constructionIntentRef: frontier.result.constructionIntentRef,
            correctionDisposition: "repair",
            message: "Apply repair.",
            semanticEvidenceAssetRefs: [mini.ids.approvalAssetRef],
          }),
        },
      );
      assert.notEqual(result.completed.disposition, "repair");
      assert.equal(
        result.events.some(
          (event) =>
            event.kind === "c_call_result_admitted" &&
            event.payload.value?.runtimeArchiveInspection
              ?.runtimeEvidenceEventRefs?.includes(
                "event://developer.example/unadmitted-runtime-archive-substitute",
              ),
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
        result.events.some(
          (event) =>
            event.kind === "run_stopped" &&
            event.payload.disposition === "repair",
        ),
        false,
      );
    },
  );

  await context.test(
    "refuses a correction response carried by the approval variant",
    async () => {
      const started = await oneSurfaceStart(
        installedPublic,
        harness,
        mini,
        "external-one-surface-correction-wrong-variant",
        mini.publication,
        {
          observation: correctionObservation("repair_required"),
        },
      );
      assert.equal(
        started.outcome.disposition,
        "held",
        JSON.stringify(started.outcome),
      );
      const frontier = await applyInFreshContext(
        installedPublic,
        invocation(
          "abg.operation.project.read",
          "status",
          "invocation://t272/correction-wrong-variant/status",
          {
            continuationAuthority:
              started.outcome.result.continuationAuthority,
            continuationRef: started.outcome.continuationRef,
          },
        ),
      );
      assert.equal(frontier.disposition, "succeeded", JSON.stringify(frontier));
      const before = await readFile(started.scenario.eventLogPath, "utf8");
      const refused = await applyInFreshContext(
        installedPublic,
        invocation(
          "abg.operation.interaction.respond",
          "approve",
          "invocation://t272/correction-wrong-variant/respond",
          {
            actorRef: "actor://developer.example/trusted-developer",
            capabilityRef: mini.ids.actorCapabilityRef,
            continuationAuthority: frontier.result.continuationAuthority,
            continuationRef: started.outcome.continuationRef,
            response: {
              kind: "developer_human_approval",
              schemaVersion: "5.0.0",
              approved: true,
              constructionIntentRef:
                frontier.result.constructionIntentRef,
              correctionDisposition: "repair",
              message: "Apply repair.",
              semanticEvidenceAssetRefs: [mini.ids.approvalAssetRef],
            },
          },
        ),
      );
      assert.equal(refused.disposition, "refused", JSON.stringify(refused));
      const after = await readFile(started.scenario.eventLogPath, "utf8");
      assert.equal(
        after.trim().split(/\r?\n/u).length,
        before.trim().split(/\r?\n/u).length + 1,
      );
      const appended = JSON.parse(after.trim().split(/\r?\n/u).at(-1));
      assert.equal(appended.kind, "public_operation_admitted");
      assert.equal(
        appended.payload.invocationRef,
        "invocation://t272/correction-wrong-variant/respond",
      );
      assert.equal(
        after.includes("\"kind\":\"fh_interaction_responded\""),
        false,
        "an authorized but Product-invalid response must not become response truth",
      );
    },
  );
});
