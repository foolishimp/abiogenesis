import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
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

function catalogApplyBasis(product, view, invocationRef) {
  const operationId = "abg.operation.catalog.apply";
  const invocationPayloadDigest = product.sha256Canonical({
    probe: invocationRef,
  });
  return {
    operationId,
    definitionKey: operationId,
    definitionDigest: product.sha256Canonical({
      operationId,
      schemaVersion: "5.0.0",
    }),
    authorityScopeRef: view.viewId,
    authorityScopeDigest: view.viewDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      invocationRef,
      operationId,
      payloadDigest: invocationPayloadDigest,
    }),
    correlationId: "correlation://t270/s05-catalog-authority",
    eventTime: "2026-07-25T00:00:00.000Z",
    causationEventRefs: [view.admissionEventRef],
  };
}

function mirrorEventHistory(source, target, admitRuntimeEvent) {
  for (const event of source.readAll()) {
    const {
      eventId: expectedEventId,
      admissionOrdinal: _admissionOrdinal,
      payloadDigest: _payloadDigest,
      ...candidate
    } = event;
    const admitted = admitRuntimeEvent(target, candidate);
    assert.equal(admitted.eventId, expectedEventId);
  }
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
      "abg.operation.product.install",
      "verified_artifact",
      refs.installAbi,
      {
        verifiedInvocationRef: refs.verifyAbi,
        artifactPath: harness.artifactPath,
        targetRoot: abiConsumer,
      },
    ),
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
      "abg.operation.product.install",
      "verified_artifact",
      refs.installFlavored,
      {
        verifiedInvocationRef: refs.verifyFlavored,
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
        dependencyEdges: [{
          kind: "requires",
          fromProductId: flavored.basis.productId,
          toProductId: harness.candidateBasis.productId,
        }],
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
  assert.equal(run.outcomes.length, 10);
  assert.ok(run.outcomes.every((outcome) =>
    outcome.disposition === "succeeded"
  ));
  const nodeApplication = run.outcomes[7];
  const overlayApplication = run.outcomes[8];
  const outcome = run.outcomes[9];
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
      for (const row of scenario.transcript.slice(0, 7)) {
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
        scenario.transcript[7],
      );
      assert.equal(admittedNode.disposition, "succeeded");
      const application =
        operationContext.productState.catalogApplication(
          scenario.refs.applyNode,
        ).application;
      const installedPackageRoot = join(
        harness.cliHost,
        "node_modules",
        "@abiogenesis",
        "typescript-tenant",
      );
      const installedAbg = await import(
        pathToFileURL(
          join(installedPackageRoot, "build/code/src/abg/index.js"),
        ).href
      );
      const installedProduct = await import(
        pathToFileURL(
          join(installedPackageRoot, "build/code/src/product/index.js"),
        ).href
      );
      const installedEventStore = await import(
        pathToFileURL(
          join(
            installedPackageRoot,
            "build/code/src/abg/event_store.js",
          ),
        ).href
      );
      const installState = operationContext.productState.install(
        scenario.refs.installFlavored,
      );
      const viewState = operationContext.productState.catalogView(
        scenario.refs.view,
      );
      assert.ok(installState);
      assert.ok(viewState);
      const candidateScope = installedAbg.catalogApplicationCandidateScope(
        operationContext.store,
      );
      const semantics = await installedProduct.loadInstalledProductSemantics({
        install: installState.install,
        publication: viewState.catalogState.publication,
        verifyInstallAdmission: (install) =>
          installedAbg.hasAdmittedProductInstall(
            operationContext.store,
            install,
          ),
      });
      const constructNodeCandidate = (
        scope = candidateScope,
        provider = semantics,
      ) => {
        const candidate =
          installedProduct.constructCatalogApplicationCandidate(
            provider,
            {
              catalog: viewState.catalogState.catalog,
              view: viewState.view,
              workspaceBinding:
                viewState.catalogState.workspaceState.binding,
              lock: viewState.catalogState.workspaceState.lock,
              handle: flavored.ids.nodeTypeHandle,
              applicationVariant: "node_type",
              value: flavored.nodeTypeValue,
              contributorRef: flavored.basis.productId,
              nodeTypeTarget: {
                kind: "program",
                programRef: flavored.ids.programRef,
              },
              candidateScope: scope,
            },
          );
        assert.equal(
          candidate.kind,
          "catalog_application_candidate",
          JSON.stringify(candidate),
        );
        return candidate;
      };
      assert.equal(
        installedAbg.hasAdmittedCatalogApplication(
          operationContext.store,
          application,
        ),
        true,
      );
      assert.equal(
        application.contributorAuthorityKind,
        "installed_product_attestation",
      );
      assert.equal(
        application.contributorAuthorityRef,
        flavored.ids.contributorAttestationRef,
      );
      assert.equal(
        application.contributorProvenanceRefs.includes(
          flavored.ids.contributorAttestationRef,
        ),
        true,
      );
      const forgedCandidate = structuredClone({
        ...application,
        kind: "catalog_application_candidate",
        disposition: "candidate",
        applicationCandidateId: application.admissionCandidateRef,
        applicationCandidateDigest: application.applicationDigest,
      });
      assert.equal(
        installedProduct.isCatalogApplicationCandidate(
          forgedCandidate,
          candidateScope,
        ),
        false,
        "a structural receipt clone must not acquire Product validation authority",
      );
      const crossStoreCandidate = constructNodeCandidate();
      const foreignContext = installedPublic.createRootOperationContext();
      try {
        mirrorEventHistory(
          operationContext.store,
          foreignContext.store,
          installedEventStore.admitRuntimeEvent,
        );
        installedAbg.catalogApplicationCandidateScope(foreignContext.store);
        assert.equal(
          installedAbg.hasAdmittedCatalogView(
            foreignContext.store,
            viewState.view,
          ),
          true,
          "the foreign store must contain the exact mirrored CatalogView history",
        );
        assert.equal(
          installedAbg.hasAdmittedCatalogApplication(
            foreignContext.store,
            application,
          ),
          false,
          "an application must not cross its originating store",
        );
        const crossStoreAdmission = installedAbg.admitCatalogApplication(
          foreignContext.store,
          viewState.view,
          crossStoreCandidate,
          catalogApplyBasis(
            installedProduct,
            viewState.view,
            "invocation://t270/catalog-apply-cross-store",
          ),
        );
        assert.equal(
          crossStoreAdmission.kind,
          "catalog_admission_refusal",
        );
        assert.equal(crossStoreAdmission.code, "scope_mismatch");
      } finally {
        installedPublic.closeRootOperationContext(foreignContext);
      }
      await context.test(
        "direct ABG store closure revokes its genuine catalog candidate",
        async () => {
          const directCloseStore = new installedEventStore.AbgEventStore();
          mirrorEventHistory(
            operationContext.store,
            directCloseStore,
            installedEventStore.admitRuntimeEvent,
          );
          const directCloseScope =
            installedAbg.catalogApplicationCandidateScope(directCloseStore);
          const directCloseSemantics =
            await installedProduct.loadInstalledProductSemantics({
              install: installState.install,
              publication: viewState.catalogState.publication,
              verifyInstallAdmission: (install) =>
                installedAbg.hasAdmittedProductInstall(
                  directCloseStore,
                  install,
                ),
            });
          const directCloseCandidate = constructNodeCandidate(
            directCloseScope,
            directCloseSemantics,
          );
          directCloseStore.configureDurableLog(
            join(harness.scratch, "catalog-direct-close.events.jsonl"),
          );
          const reopenAuthority =
            directCloseStore.projectReopenAuthorityAndClose();
          assert.equal(
            reopenAuthority.kind,
            "event_store_reopen_authority",
          );
          const directCloseAdmission = installedAbg.admitCatalogApplication(
            directCloseStore,
            viewState.view,
            directCloseCandidate,
            catalogApplyBasis(
              installedProduct,
              viewState.view,
              "invocation://t270/catalog-apply-after-direct-store-close",
            ),
          );
          assert.equal(
            directCloseAdmission.kind,
            "catalog_admission_refusal",
          );
          assert.equal(directCloseAdmission.code, "scope_mismatch");
          assert.throws(
            () => installedAbg.catalogApplicationCandidateScope(
              directCloseStore,
            ),
            /revoked/u,
          );
        },
      );
      const oneShotCandidate = constructNodeCandidate();
      const oneShotAdmission = installedAbg.admitCatalogApplication(
        operationContext.store,
        viewState.view,
        oneShotCandidate,
        catalogApplyBasis(
          installedProduct,
          viewState.view,
          "invocation://t270/catalog-apply-one-shot",
        ),
      );
      assert.equal(oneShotAdmission.kind, "catalog_application");
      const repeatedAdmission = installedAbg.admitCatalogApplication(
        operationContext.store,
        viewState.view,
        oneShotCandidate,
        catalogApplyBasis(
          installedProduct,
          viewState.view,
          "invocation://t270/catalog-apply-one-shot-repeated",
        ),
      );
      assert.equal(repeatedAdmission.kind, "catalog_admission_refusal");
      assert.equal(repeatedAdmission.code, "scope_mismatch");
      const postCloseCandidate = constructNodeCandidate();
      const originatingStore = operationContext.store;
      installedPublic.closeRootOperationContext(operationContext);
      operationContextClosed = true;
      assert.equal(
        installedAbg.hasAdmittedCatalogApplication(
          originatingStore,
          application,
        ),
        false,
        "closing the operation context must revoke application authority",
      );
      const postCloseAdmission = installedAbg.admitCatalogApplication(
        originatingStore,
        viewState.view,
        postCloseCandidate,
        catalogApplyBasis(
          installedProduct,
          viewState.view,
          "invocation://t270/catalog-apply-after-close",
        ),
      );
      assert.equal(postCloseAdmission.kind, "catalog_admission_refusal");
      assert.equal(postCloseAdmission.code, "scope_mismatch");
      assert.throws(
        () => installedAbg.catalogApplicationCandidateScope(originatingStore),
        /revoked/u,
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
    /from\s+["'][.]{2}\/(?:abg|gtl|hog|implementation|product|public|validator)\//u,
  );
  assert.doesNotMatch(
    delegateSource,
    /GraphFunction|catalog\.apply|run\.invoke|continuation|closure/u,
  );
  assert.match(
    delegateSource,
    /spawn\(cliPath,\s*\["--jsonl", transcriptPath\]/u,
  );

  const flavoredSource = await readFile(
    join(
      packageRoot,
      "test_env/fixtures/flavored-catalog-product/src/index.ts",
    ),
    "utf8",
  );
  assert.match(
    flavoredSource,
    /from "@abiogenesis\/typescript-tenant\/product"/u,
  );
  assert.match(
    flavoredSource,
    /from "@abiogenesis\/typescript-tenant\/gtl"/u,
  );
  assert.doesNotMatch(
    flavoredSource,
    /build\/code\/src|from\s+["'][.]{1,2}\//u,
  );
});
