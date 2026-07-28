import assert from "node:assert/strict";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import { prepareFlavoredCatalogProduct } from
  "../support/flavored-catalog-product.mjs";
import {
  importInstalledPackageExport,
  runInstalledCli,
  runInstalledCodex,
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

async function eventsAt(path) {
  return (await readFile(path, "utf8"))
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function portabilityScenario(harness, flavored, label) {
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
  const transcript = [
    invocation("abg.operation.product.verify", "artifact", refs.verifyAbi, {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    }),
    invocation(
      "abg.operation.product.verify",
      "artifact",
      refs.verifyFlavored,
      {
        artifactPath: flavored.artifactPath,
        artifactRef: flavored.artifactRef,
        ...expectedVerificationIdentity(flavored.basis),
      },
    ),
    invocation(
      "abg.operation.product.resolve",
      "verified_product_set",
      refs.resolve,
      {
        verifiedInvocationRefs: [
          refs.verifyAbi,
          refs.verifyFlavored,
        ],
      },
    ),
    invocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installAbi,
      {
        verifiedInvocationRef: refs.verifyAbi,
        resolvedLockInvocationRef: refs.resolve,
        artifactPath: harness.artifactPath,
        targetRoot: abiConsumer,
      },
    ),
    invocation(
      "abg.operation.product.install",
      "verified_artifact",
      refs.installFlavored,
      {
        verifiedInvocationRef: refs.verifyFlavored,
        resolvedLockInvocationRef: refs.resolve,
        artifactPath: flavored.artifactPath,
        targetRoot: flavoredConsumer,
      },
    ),
    invocation(
      "abg.operation.workspace.bind",
      "exact_product_set",
      refs.bind,
      {
        installInvocationRefs: [refs.installAbi, refs.installFlavored],
        workspaceId: `workspace://t281/${label}`,
        canonicalRoot: workspaceRoot,
        authorizedActorRef: "actor://flavor.example/trusted-developer",
        authorityManifestRef:
          `manifest://t281/${label}/workspace-authority`,
        roots: {
          toolchainRoot: abiInstalledRoot,
          productRoot: flavoredInstalledRoot,
          eventLogRoot,
          runtimeStateRoot: join(
            workspaceRoot,
            ".ai-workspace/runtime",
          ),
          projectionRoot: join(
            workspaceRoot,
            ".ai-workspace/projections",
          ),
          archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
        },
      },
    ),
    invocation(
      "abg.operation.catalog.admit",
      "module_publication",
      refs.catalog,
      {
        publication: flavored.publication,
        verifiedInvocationRef: refs.verifyFlavored,
        workspaceBindingInvocationRef: refs.bind,
      },
    ),
    invocation("abg.operation.catalog.view", "allowlist", refs.view, {
      catalogInvocationRef: refs.catalog,
      allowlist: [
        flavored.ids.nodeTypeHandle,
        flavored.ids.overlayHandle,
        flavored.ids.graphFunctionRef,
      ],
    }),
    invocation(
      "abg.operation.catalog.apply",
      "node_type",
      refs.applyNode,
      {
        catalogViewInvocationRef: refs.view,
        contributorRef: flavored.basis.productId,
        handle: flavored.ids.nodeTypeHandle,
        productInstallInvocationRef: refs.installFlavored,
        target: {
          kind: "program",
          programRef: flavored.ids.programRef,
        },
        value: flavored.nodeTypeValue,
      },
    ),
    invocation(
      "abg.operation.catalog.apply",
      "overlay",
      refs.applyOverlay,
      {
        catalogViewInvocationRef: refs.view,
        contributorRef: flavored.basis.productId,
        handle: flavored.ids.overlayHandle,
        productInstallInvocationRef: refs.installFlavored,
        value: flavored.overlayValue,
      },
    ),
    invocation("abg.operation.run.invoke", "direct", refs.run, {
      installInvocationRef: refs.installFlavored,
      workspaceBindingInvocationRef: refs.bind,
      catalogViewInvocationRef: refs.view,
      catalogApplicationInvocationRefs: [
        refs.applyNode,
        refs.applyOverlay,
      ],
      programRef: flavored.ids.programRef,
      graphFunctionRef: flavored.ids.graphFunctionRef,
      actorRef: "actor://flavor.example/trusted-developer",
      input: {
        kind: "flavored_text_input",
        schemaVersion: "5.0.0",
        text: "portable product",
        tone: "bright",
      },
      eventLogPath,
    }),
  ];
  await mkdir(root, { recursive: true });
  const transcriptPath = join(root, "portability.transcript.jsonl");
  await writeFile(
    transcriptPath,
    `${transcript.map((row) => JSON.stringify(row)).join("\n")}\n`,
    "utf8",
  );
  return {
    abiConsumer,
    eventLogPath,
    flavoredConsumer,
    refs,
    transcript,
    transcriptPath,
    workspaceRoot,
  };
}

function assertPortableOutcome(run, flavored) {
  assert.equal(
    run.exitCode,
    0,
    JSON.stringify({ outcomes: run.outcomes, stderr: run.stderr }, null, 2),
  );
  assert.equal(run.outcomes.length, 11);
  assert.ok(run.outcomes.every((outcome) =>
    outcome.disposition === "succeeded"
  ));
  const nodeApplication = run.outcomes[8];
  const overlayApplication = run.outcomes[9];
  const outcome = run.outcomes[10];
  assert.deepEqual(run.outcomes[2].result.dependencyEdges, [{
    kind: "requires",
    fromProductId: flavored.basis.productId,
    toProductId: run.outcomes[0].result.productId,
    packageVersion: "5.0.0-dev.286",
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
  assert.equal(nodeApplication.result.contributionKind, "node_type");
  assert.equal(nodeApplication.result.applicationVariant, "node_type");
  assert.equal(nodeApplication.result.appliedValueRef, flavored.ids.nodeTypeRef);
  assert.deepEqual(nodeApplication.result.nodeTypeTarget, {
    kind: "program",
    targetRef: flavored.ids.programRef,
    targetDigest: nodeApplication.result.nodeTypeTarget.targetDigest,
    programRef: flavored.ids.programRef,
  });
  assert.equal(nodeApplication.result.contributorKind, "product");
  assert.equal(
    nodeApplication.result.contributorRef,
    flavored.basis.productId,
  );
  assert.equal(
    nodeApplication.result.contributorProvenanceRefs.includes(
      flavored.basis.artifactDigest,
    ),
    true,
  );
  assert.equal(
    nodeApplication.result.contributorProvenanceRefs.includes(
      flavored.basis.manifestDigest,
    ),
    true,
  );
  assert.equal(nodeApplication.result.admissionEventRef, null);
  assert.equal(
    nodeApplication.result.declarationOrContractRef,
    flavored.ids.nodeTypeRef,
  );
  assert.equal(overlayApplication.result.contributionKind, "overlay");
  assert.equal(overlayApplication.result.applicationVariant, "overlay");
  assert.equal(overlayApplication.result.nodeTypeTarget, null);
  assert.equal(
    overlayApplication.result.declarationOrContractRef,
    flavored.ids.overlayRef,
  );
  assert.deepEqual(
    overlayApplication.result.programMembershipRefs,
    [flavored.ids.programRef],
  );
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
    );
    const cliRun = await runInstalledCli(harness, cliScenario);
    const cliOutcome = assertPortableOutcome(cliRun, flavored);
    const cliEvents = await eventsAt(cliScenario.eventLogPath);
    assert.equal(
      cliEvents.some((event) =>
        event.kind === "public_operation_artifact_admitted" &&
        event.payload?.operationId === "abg.operation.catalog.view"
      ),
      true,
      "the persisted prefix must include the neighboring CatalogView event",
    );
    assert.equal(
      cliEvents.some((event) =>
        event.kind === "public_operation_artifact_admitted" &&
        event.payload?.operationId === "abg.operation.catalog.apply"
      ),
      false,
      "catalog.apply must not manufacture runtime-event truth",
    );

    await rm(cliScenario.abiConsumer, { recursive: true, force: true });
    await rm(
      cliScenario.flavoredConsumer,
      { recursive: true, force: true },
    );
    await rm(cliScenario.workspaceRoot, { recursive: true, force: true });
    const codexRun = await runInstalledCodex(harness, cliScenario);
    const codexOutcome = assertPortableOutcome(codexRun, flavored);
    assert.equal(codexRun.stdout, cliRun.stdout);
    assert.deepEqual(codexOutcome.result, cliOutcome.result);

    const sdkScenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-sdk",
    );
    const installedPublic = await importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/public",
      `portability=${Date.now()}`,
    );
    const operationContext = installedPublic.createRootOperationContext();
    const sdkOutcomes = [];
    try {
      for (const row of sdkScenario.transcript) {
        sdkOutcomes.push(
          await installedPublic.applyRootPublicInvocation(
            operationContext,
            row,
          ),
        );
      }
    } finally {
      installedPublic.closeRootOperationContext(operationContext);
    }
    const sdkOutcome = assertPortableOutcome(
      { exitCode: 0, stderr: "", outcomes: sdkOutcomes },
      flavored,
    );
    assert.deepEqual(sdkOutcome.result, cliOutcome.result);
  },
);

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
  const operationContext = installedPublic.createRootOperationContext();
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
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }

  const transcriptPath = join(
    harness.scratch,
    "public-contract-refusal.jsonl",
  );
  await writeFile(
    transcriptPath,
    `${JSON.stringify(unknownInvocation)}\n`,
    "utf8",
  );
  const cliRun = await runInstalledCli(harness, { transcriptPath });
  assert.equal(cliRun.exitCode, 2);
  assert.deepEqual(cliRun.outcomes, [sdkRefusal]);

  const timestampTranscriptPath = join(
    harness.scratch,
    "public-contract-timestamp-refusal.jsonl",
  );
  await writeFile(
    timestampTranscriptPath,
    `${JSON.stringify({
      ...unknownInvocation,
      operationId: "abg.operation.product.verify",
      eventTime: "2026-07-28",
    })}\n`,
    "utf8",
  );
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
      "PublicInvocationRefusal",
      "PublicOutcome",
      "RootPublicInvocation",
    ],
  );
  assert.equal(schema.$id, "abg.schema.public-operation-contract");
  assert.equal(
    schema.$defs.RootPublicInvocation.properties.operationId.enum.includes(
      "abg.operation.product.resolve",
    ),
    true,
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
    installedProduct.sha256Canonical([{
      packageExportPath: gtlRow.nativeTypedLocator.packageExportPath,
      declarationPath: gtlRow.nativeTypedLocator.declarationPath,
      declarationDigest: await installedProduct.sha256File(
        join(
          harness.installedPackageRoot,
          gtlRow.nativeTypedLocator.declarationPath,
        ),
      ),
    }]),
    "native contract digests must use only the constitutional declaration inventory",
  );
  for (const constructor of [
    "catalogContribution",
    "closureContract",
    "contractDeclaration",
    "implementationBinding",
    "modulePublication",
    "productSemanticsBinding",
  ]) {
    assert.equal(
      gtlRow.nativeTypedLocator.exportedSymbols.includes(constructor),
      true,
      `${constructor} must be present in the verified GTL export roster`,
    );
  }
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
  const operationContext = installedPublic.createRootOperationContext();
  try {
    for (const row of scenario.transcript.slice(0, 5)) {
      const outcome = await installedPublic.applyRootPublicInvocation(
        operationContext,
        row,
      );
      assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    }
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
    assert.equal(refused.result.code, "invalid_request");
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }
});

test("S06 catalog admission rejects contribution truth absent from the verified Product", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(harness);
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "flavored-contribution-forgery",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `contribution-forgery=${Date.now()}`,
  );
  const operationContext = installedPublic.createRootOperationContext();
  try {
    for (const row of scenario.transcript.slice(0, 6)) {
      const outcome = await installedPublic.applyRootPublicInvocation(
        operationContext,
        row,
      );
      assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    }
    const forgedCatalog = structuredClone(scenario.transcript[6]);
    forgedCatalog.invocationRef =
      "invocation://t281/flavored-contribution-forgery/catalog";
    forgedCatalog.payload.publication.contributions[0].compatibilityRefs = [
      "compatibility://abiogenesis/major/999",
    ];
    const refused = await installedPublic.applyRootPublicInvocation(
      operationContext,
      forgedCatalog,
    );
    assert.equal(refused.disposition, "refused");
    assert.equal(refused.result.code, "owner_refusal");
    assert.match(
      refused.result.message,
      /publisher-authored Product truth/u,
    );

    const changedEffect = structuredClone(scenario.transcript[6]);
    changedEffect.invocationRef =
      "invocation://t281/flavored-contribution-forgery/effect";
    changedEffect.payload.publication.graphFunctions[0].effects = [
      "effect://flavor.example/text/forged@5",
    ];
    const effectRefusal = await installedPublic.applyRootPublicInvocation(
      operationContext,
      changedEffect,
    );
    assert.equal(effectRefusal.disposition, "refused");
    assert.match(
      effectRefusal.result.message,
      /complete module publication differs/u,
    );

    const changedReadiness = structuredClone(scenario.transcript[6]);
    changedReadiness.invocationRef =
      "invocation://t281/flavored-contribution-forgery/readiness";
    changedReadiness.payload.publication.contributions[0]
      .readinessPrerequisiteRefs = [];
    const readinessRefusal = await installedPublic.applyRootPublicInvocation(
      operationContext,
      changedReadiness,
    );
    assert.equal(readinessRefusal.disposition, "refused");
    assert.match(
      readinessRefusal.result.message,
      /publisher-authored Product truth/u,
    );
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }
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
  const operationContext = installedPublic.createRootOperationContext();
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
    unresolvedResolution.payload.verifiedInvocationRefs = [
      scenario.refs.verifyFlavored,
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
    await assert.rejects(access(scenario.flavoredConsumer));
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
      transformPublicContract: (row) => ({
        ...row,
        nativeTypedLocator: {
          packageName:
            "@abiogenesis-fixtures/flavored-catalog-product",
          packageExportPath: ".",
          namedSymbol: "ForgedNativeContract",
          exportedSymbols: ["ForgedNativeContract"],
          declarationPath: "build/index.d.ts",
        },
      }),
      expectedCode: "catalog_mismatch",
    },
  ];
  for (const row of cases) {
    const flavored = await prepareFlavoredCatalogProduct(
      harness,
      join(harness.scratch, row.label),
      { transformPublicContract: row.transformPublicContract },
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

test("S06 catalog readiness requires an exact admitted prerequisite", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const flavored = await prepareFlavoredCatalogProduct(
    harness,
    join(harness.scratch, "unresolved-readiness"),
    {
      transformPublication: (publication) => {
        publication.contributions[0].readinessPrerequisiteRefs = [
          "readiness://flavor.example/never-admitted@5",
        ];
        return publication;
      },
    },
  );
  const scenario = await portabilityScenario(
    harness,
    flavored,
    "flavored-unresolved-readiness",
  );
  const installedPublic = await importInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/public",
    `unresolved-readiness=${Date.now()}`,
  );
  const operationContext = installedPublic.createRootOperationContext();
  try {
    for (const row of scenario.transcript.slice(0, 6)) {
      const outcome = await installedPublic.applyRootPublicInvocation(
        operationContext,
        row,
      );
      assert.equal(outcome.disposition, "succeeded", JSON.stringify(outcome));
    }
    const refused = await installedPublic.applyRootPublicInvocation(
      operationContext,
      scenario.transcript[6],
    );
    assert.equal(refused.disposition, "refused");
    assert.equal(refused.result.kind, "catalog_admission_refusal");
    assert.equal(refused.result.disposition, "unready");
    assert.equal(refused.result.code, "unready");
    assert.match(
      refused.result.message,
      /unresolved readiness prerequisite/u,
    );
  } finally {
    installedPublic.closeRootOperationContext(operationContext);
  }
});

test("S06 Codex delegate rejects substituted and missing CLI paths", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot);
  const transcriptPath = join(harness.scratch, "codex-preflight.jsonl");
  await writeFile(transcriptPath, "\n", "utf8");
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

test(
  "S05 catalog.apply keeps concrete-value authority inside one operation context",
  async (context) => {
    const harness = await setupInstalledCliHarness(context, packageRoot);
    const flavored = await prepareFlavoredCatalogProduct(
      harness,
    );
    const scenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-apply-refusals",
    );
    const installedPublic = await importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/public",
      `apply-refusal=${Date.now()}`,
    );
    const operationContext = installedPublic.createRootOperationContext();
    let operationContextClosed = false;
    try {
      for (const row of scenario.transcript.slice(0, 8)) {
        const outcome = await installedPublic.applyRootPublicInvocation(
          operationContext,
          row,
        );
        assert.equal(outcome.disposition, "succeeded");
      }
      const callable = await installedPublic.applyRootPublicInvocation(
        operationContext,
        invocation(
          "abg.operation.catalog.apply",
          "node_type",
          "invocation://t281/apply-callable-refusal",
          {
            catalogViewInvocationRef: scenario.refs.view,
            contributorRef: flavored.basis.productId,
            handle: flavored.ids.graphFunctionRef,
            productInstallInvocationRef: scenario.refs.installFlavored,
            target: {
              kind: "program",
              programRef: flavored.ids.programRef,
            },
            value: flavored.nodeTypeValue,
          },
        ),
      );
      assert.equal(callable.disposition, "refused");
      assert.match(
        callable.result.message,
        /GraphFunction rows remain callable/u,
      );
      const unknown = await installedPublic.applyRootPublicInvocation(
        operationContext,
        invocation(
          "abg.operation.catalog.apply",
          "overlay",
          "invocation://t281/apply-unknown-refusal",
          {
            catalogViewInvocationRef: scenario.refs.view,
            contributorRef: flavored.basis.productId,
            handle: "overlay://flavor.example/unknown@5",
            productInstallInvocationRef: scenario.refs.installFlavored,
            value: flavored.overlayValue,
          },
        ),
      );
      assert.equal(unknown.disposition, "refused");
      assert.match(
        unknown.result.message,
        /absent from the admitted CatalogView/u,
      );
      const fabricatedDigest =
        await installedPublic.applyRootPublicInvocation(
          operationContext,
          invocation(
            "abg.operation.catalog.apply",
            "node_type",
            "invocation://t281/apply-fabricated-digest-refusal",
            {
              catalogViewInvocationRef: scenario.refs.view,
              handle: flavored.ids.nodeTypeHandle,
              valueRef: flavored.ids.nodeTypeRef,
              valueDigest: `sha256:${"f".repeat(64)}`,
            },
          ),
      );
      assert.equal(fabricatedDigest.disposition, "refused");
      assert.match(fabricatedDigest.result.message, /undeclared fields/u);
      const invalidContributor =
        await installedPublic.applyRootPublicInvocation(
          operationContext,
          invocation(
            "abg.operation.catalog.apply",
            "node_type",
            "invocation://t281/apply-invalid-contributor-refusal",
            {
              catalogViewInvocationRef: scenario.refs.view,
              contributorRef: "product://flavor.example/unlocked@5",
              handle: flavored.ids.nodeTypeHandle,
              productInstallInvocationRef: scenario.refs.installFlavored,
              target: {
                kind: "program",
                programRef: flavored.ids.programRef,
              },
              value: flavored.nodeTypeValue,
            },
          ),
        );
      assert.equal(invalidContributor.disposition, "refused");
      assert.match(
        invalidContributor.result.message,
        /neither the admitted workspace actor.*exact row-owning installed Product/u,
      );
      const unrelatedLockedContributor =
        await installedPublic.applyRootPublicInvocation(
          operationContext,
          invocation(
            "abg.operation.catalog.apply",
            "node_type",
            "invocation://t281/apply-unrelated-locked-contributor-refusal",
            {
              catalogViewInvocationRef: scenario.refs.view,
              contributorRef: harness.candidateBasis.productId,
              handle: flavored.ids.nodeTypeHandle,
              productInstallInvocationRef: scenario.refs.installFlavored,
              target: {
                kind: "program",
                programRef: flavored.ids.programRef,
              },
              value: flavored.nodeTypeValue,
            },
          ),
        );
      assert.equal(unrelatedLockedContributor.disposition, "refused");
      assert.match(
        unrelatedLockedContributor.result.message,
        /exact row-owning installed Product/u,
      );
      const wrongVariant = await installedPublic.applyRootPublicInvocation(
        operationContext,
        invocation(
          "abg.operation.catalog.apply",
          "overlay",
          "invocation://t281/apply-wrong-variant-refusal",
          {
            catalogViewInvocationRef: scenario.refs.view,
            contributorRef: flavored.basis.productId,
            handle: flavored.ids.nodeTypeHandle,
            productInstallInvocationRef: scenario.refs.installFlavored,
            value: flavored.nodeTypeValue,
          },
        ),
      );
      assert.equal(wrongVariant.disposition, "refused");
      assert.match(wrongVariant.result.message, /variant differs/u);

      const missingTarget = await installedPublic.applyRootPublicInvocation(
        operationContext,
        invocation(
          "abg.operation.catalog.apply",
          "node_type",
          "invocation://t281/apply-missing-target-refusal",
          {
            catalogViewInvocationRef: scenario.refs.view,
            contributorRef: flavored.basis.productId,
            handle: flavored.ids.nodeTypeHandle,
            productInstallInvocationRef: scenario.refs.installFlavored,
            value: flavored.nodeTypeValue,
          },
        ),
      );
      assert.equal(missingTarget.disposition, "refused");
      assert.match(missingTarget.result.message, /payload\.target/u);

      const admittedNode = await installedPublic.applyRootPublicInvocation(
        operationContext,
        scenario.transcript[8],
      );
      assert.equal(admittedNode.disposition, "succeeded");
      assert.equal(
        Object.hasOwn(operationContext, "productState"),
        false,
        "Product operation state must remain opaque at the public boundary",
      );
      assert.equal(admittedNode.result.kind, "catalog_application");
      assert.equal(
        admittedNode.result.appliedValueRef,
        flavored.ids.nodeTypeRef,
      );

      const foreignContext = installedPublic.createRootOperationContext();
      try {
        const crossContext = await installedPublic.applyRootPublicInvocation(
          foreignContext,
          {
            ...structuredClone(scenario.transcript[8]),
            invocationRef:
              "invocation://t270/catalog-apply-cross-operation-context",
          },
        );
        assert.equal(crossContext.disposition, "refused");
        assert.match(
          crossContext.result.message,
          /CatalogView invocation .* is not admitted in this transcript/u,
        );
      } finally {
        installedPublic.closeRootOperationContext(foreignContext);
      }

      installedPublic.closeRootOperationContext(operationContext);
      operationContextClosed = true;
      await assert.rejects(
        installedPublic.applyRootPublicInvocation(
          operationContext,
          {
            ...structuredClone(scenario.transcript[8]),
            invocationRef:
              "invocation://t270/catalog-apply-after-operation-close",
          },
        ),
        /root operation context is closed/u,
      );
    } finally {
      if (!operationContextClosed) {
        installedPublic.closeRootOperationContext(operationContext);
      }
    }
  },
);

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
    /from "@abiogenesis\/typescript-tenant\/product"/u,
  );
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
