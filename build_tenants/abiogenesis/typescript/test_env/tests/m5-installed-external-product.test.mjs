import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
      allowlist: [mini.ids.graphFunctionRef],
    }),
    invocation("abg.operation.run.invoke", "direct", refs.run, {
      installInvocationRef: refs.installMini,
      workspaceBindingInvocationRef: refs.bind,
      catalogViewInvocationRef: refs.view,
      programRef: mini.ids.programRef,
      graphFunctionRef: mini.ids.graphFunctionRef,
      actorRef: "actor://developer.example/trusted-developer",
      input: {
        kind: "developer_greeting_input",
        schemaVersion: "5.0.0",
        name: "Ada",
      },
      eventLogPath: join(eventLogRoot, "developer-product.events.jsonl"),
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
  assert.equal(cliRun.exitCode, 0, cliRun.stderr);
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
