import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { prepareFlavoredCatalogProduct } from
  "../support/flavored-catalog-product.mjs";
import {
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
      "declaration",
      refs.applyNode,
      {
        catalogViewInvocationRef: refs.view,
        handle: flavored.ids.nodeTypeHandle,
      },
    ),
    invocation(
      "abg.operation.catalog.apply",
      "declaration",
      refs.applyOverlay,
      {
        catalogViewInvocationRef: refs.view,
        handle: flavored.ids.overlayHandle,
      },
    ),
    invocation("abg.operation.run.invoke", "direct", refs.run, {
      installInvocationRef: refs.installFlavored,
      workspaceBindingInvocationRef: refs.bind,
      catalogViewInvocationRef: refs.view,
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
  assert.equal(
    nodeApplication.result.declarationOrContractRef,
    flavored.ids.nodeTypeRef,
  );
  assert.equal(overlayApplication.result.contributionKind, "overlay");
  assert.equal(
    overlayApplication.result.declarationOrContractRef,
    flavored.ids.overlayRef,
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

function withoutPhysicalReopenIdentity(outcome) {
  if (outcome.projectionAuthority === undefined) {
    return outcome;
  }
  const {
    outcomeDigest: _outcomeDigest,
    projectionAuthority,
    ...outcomeBody
  } = outcome;
  const {
    authorityDigest: _projectionDigest,
    reopenAuthority,
    ...projectionBody
  } = projectionAuthority;
  const {
    authorityDigest: _reopenDigest,
    inode: _inode,
    ...reopenBody
  } = reopenAuthority;
  return {
    ...outcomeBody,
    projectionAuthority: {
      ...projectionBody,
      reopenAuthority: reopenBody,
    },
  };
}

test(
  "S06 installs, applies, and invokes one independent flavored Product through SDK, CLI, and bounded delegate",
  async (context) => {
    const harness = await setupInstalledCliHarness(context, packageRoot);
    const flavored = await prepareFlavoredCatalogProduct(
      packageRoot,
      harness.scratch,
    );
    const cliScenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-cli",
    );
    const cliRun = await runInstalledCli(harness, cliScenario);
    const cliOutcome = assertPortableOutcome(cliRun, flavored);

    await rm(cliScenario.abiConsumer, { recursive: true, force: true });
    await rm(
      cliScenario.flavoredConsumer,
      { recursive: true, force: true },
    );
    await rm(cliScenario.workspaceRoot, { recursive: true, force: true });
    const codexRun = await runInstalledCodex(harness, cliScenario);
    const codexOutcome = assertPortableOutcome(codexRun, flavored);
    assert.deepEqual(
      codexRun.outcomes.map(withoutPhysicalReopenIdentity),
      cliRun.outcomes.map(withoutPhysicalReopenIdentity),
    );
    assert.deepEqual(codexOutcome.result, cliOutcome.result);

    const sdkScenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-sdk",
    );
    const installedPublic = await import(
      `${
        pathToFileURL(
          join(
            harness.cliHost,
            "node_modules",
            "@abiogenesis",
            "typescript-tenant",
            "build/code/src/public/index.js",
          ),
        ).href
      }?portability=${Date.now()}`
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
  "S06 catalog.apply refuses callable and unknown rows before declaration admission",
  async (context) => {
    const harness = await setupInstalledCliHarness(context, packageRoot);
    const flavored = await prepareFlavoredCatalogProduct(
      packageRoot,
      harness.scratch,
    );
    const scenario = await portabilityScenario(
      harness,
      flavored,
      "flavored-apply-refusals",
    );
    const installedPublic = await import(
      `${
        pathToFileURL(
          join(
            harness.cliHost,
            "node_modules",
            "@abiogenesis",
            "typescript-tenant",
            "build/code/src/public/index.js",
          ),
        ).href
      }?apply-refusal=${Date.now()}`
    );
    const operationContext = installedPublic.createRootOperationContext();
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
          "declaration",
          "invocation://t281/apply-callable-refusal",
          {
            catalogViewInvocationRef: scenario.refs.view,
            handle: flavored.ids.graphFunctionRef,
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
          "declaration",
          "invocation://t281/apply-unknown-refusal",
          {
            catalogViewInvocationRef: scenario.refs.view,
            handle: "overlay://flavor.example/unknown@5",
          },
        ),
      );
      assert.equal(unknown.disposition, "refused");
      assert.match(unknown.result.message, /not present in the admitted view/u);
    } finally {
      installedPublic.closeRootOperationContext(operationContext);
    }
  },
);

test("S06 Codex delegate contains transport only", async () => {
  const source = await readFile(
    join(packageRoot, "code/src/public/codex_cli.ts"),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /from\s+["'][.]{2}\/(?:abg|gtl|hog|implementation|product|public|validator)\//u,
  );
  assert.doesNotMatch(
    source,
    /GraphFunction|catalog\.apply|run\.invoke|continuation|closure/u,
  );
  assert.match(source, /spawn\(cliPath,\s*\["--jsonl", transcriptPath\]/u);
});
