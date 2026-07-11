// Validates: T-223 seven bounded packed-product negative families
// Validates: REQ-P-CATALOG, REQ-P-INSTALL, REQ-P-PUBLIC-CONTRACTS

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  appendFile,
  copyFile,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { admitWorkspaceRuntimeEventBytes } from "../../build/semantic/code/src/abg/m03/index.js";
import {
  ABG_CATALOG_INVOKE_GRAPH_FUNCTION_CAPABILITY_REF,
  abiogenesisPublicSdk,
  constructLiveCapabilityBinding,
  constructPublicOperationInvocation,
  createNodeBoundWorkspaceContext,
  createNodeProductIntakeContext,
  createNodeWorkspaceBindingContext,
  createNodeWorkspacePathContext,
  descriptorDigest,
  digestCanonicalIJson
} from "../../build/semantic/code/src/app/m04/index.js";
import {
  T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE
} from "../tools/publish_abg_product_contracts.mjs";
import { prepareT223AbgCandidate } from "../tools/t223_abg_candidate.mjs";
import {
  T223_FIXTURE_GRAPH_HANDLE,
  T223_FIXTURE_NODE_HANDLE,
  generateT223HelloWorldFixture
} from "../tools/t223_hello_world_fixture.mjs";

const ZERO_DIGEST = `sha256:${"0".repeat(64)}`;
const REQUIRED_ACTOR_OPERATIONS = new Set([
  "abg.operation.workspace.create",
  "abg.operation.install.install",
  "abg.operation.catalog.bind",
  "abg.operation.catalog.admit",
  "abg.operation.catalog.invoke"
]);

let invocationSequence = 0;

function assertAccepted(outcome, label) {
  assert.equal(outcome.kind, "accepted", `${label}: ${JSON.stringify(outcome)}`);
  return outcome.value;
}

function redigestDescriptor(descriptor, patch) {
  const provisional = {
    ...descriptor,
    ...patch,
    descriptorDigest: ZERO_DIGEST
  };
  return Object.freeze({
    ...provisional,
    descriptorDigest: descriptorDigest(provisional)
  });
}

function fixtureArtifact(fixture) {
  return Object.freeze({
    format: "npm_package_tgz",
    artifactPath: fixture.artifactPath,
    expectedArtifactDigest:
      fixture.sidecars.descriptor.distributionArtifactDigest,
    expectedProductContentDigest:
      fixture.sidecars.descriptor.productContentDigest
  });
}

function pairResolutionRequest(candidate, fixtureDescriptor) {
  return Object.freeze({
    requirements: Object.freeze([
      Object.freeze({
        productId: candidate.descriptor.productId,
        versionConstraint: candidate.descriptor.version,
        requiredContractRefs: candidate.descriptor.contractRefs,
        requiredCapabilityRefs: candidate.descriptor.capabilityRefs
      }),
      Object.freeze({
        productId: fixtureDescriptor.productId,
        versionConstraint: fixtureDescriptor.version,
        requiredContractRefs: fixtureDescriptor.contractRefs,
        requiredCapabilityRefs: fixtureDescriptor.capabilityRefs
      })
    ]),
    candidateDescriptors: Object.freeze([
      candidate.descriptor,
      fixtureDescriptor
    ])
  });
}

function publicInvoker(publicContractCatalog, proofRef) {
  return async (operationId, request, context) => {
    invocationSequence += 1;
    const invocationRef = `invocation://t223/negative/${invocationSequence}`;
    const invocation = constructPublicOperationInvocation({
      operationId,
      request,
      publicContractCatalog,
      invocationId: invocationRef,
      requestId: `request://t223/negative/${invocationSequence}`,
      actorRef: REQUIRED_ACTOR_OPERATIONS.has(operationId)
        ? "actor://t223/negative"
        : null,
      adapter: {
        kind: "native_sdk",
        ref: "sdk://t223/packed-negative-families"
      },
      provenanceRefs: [proofRef],
      correlationId: `correlation://t223/negative/${invocationSequence}`
    });
    switch (operationId) {
      case "abg.operation.workspace.create":
        return await abiogenesisPublicSdk.workspaceCreate(context, invocation);
      case "abg.operation.catalog.resolve":
        return await abiogenesisPublicSdk.catalogResolve(context, invocation);
      case "abg.operation.catalog.verify":
        return await abiogenesisPublicSdk.catalogVerify(context, invocation);
      case "abg.operation.install.install":
        return await abiogenesisPublicSdk.installProduct(context, invocation);
      case "abg.operation.catalog.bind":
        return await abiogenesisPublicSdk.catalogBind(context, invocation);
      case "abg.operation.catalog.admit":
        return await abiogenesisPublicSdk.catalogAdmit(context, invocation);
      case "abg.operation.catalog.allow":
        return await abiogenesisPublicSdk.catalogAllow(context, invocation);
      case "abg.operation.catalog.invoke":
        return await abiogenesisPublicSdk.catalogInvoke(context, invocation);
      default:
        throw new TypeError(`unsupported negative proof operation ${operationId}`);
    }
  };
}

async function prepareBoundPair(input) {
  const publicContractCatalog =
    input.candidate.publication.publication.catalog;
  const invoke = publicInvoker(
    publicContractCatalog,
    `proof://t223/packed-negative/${input.label}`
  );
  const workspaceRoot = path.join(input.root, "workspace");
  const toolchainRoot = path.join(input.root, "toolchain");
  const workspaceContext = createNodeWorkspacePathContext({
    targetRoot: workspaceRoot,
    publicContractCatalog
  });
  const workspace = assertAccepted(
    await invoke(
      "abg.operation.workspace.create",
      {
        targetRoot: workspaceRoot,
        authorityMode: "clean_no_project_authority"
      },
      workspaceContext
    ),
    `${input.label} workspace.create`
  );
  const productContext = createNodeProductIntakeContext({
    publicContractCatalog,
    temporaryRoot: path.join(input.root, "temporary")
  });
  const lock = assertAccepted(
    await invoke(
      "abg.operation.catalog.resolve",
      pairResolutionRequest(
        input.candidate,
        input.fixture.sidecars.descriptor
      ),
      productContext
    ),
    `${input.label} catalog.resolve`
  );
  const products = [
    {
      artifact: input.candidate.artifact,
      contribution: input.candidate.contribution,
      descriptor: input.candidate.descriptor
    },
    {
      artifact: fixtureArtifact(input.fixture),
      contribution: input.fixture.sidecars.contribution,
      descriptor: input.fixture.sidecars.descriptor
    }
  ];
  const verified = [];
  for (const product of products) {
    verified.push(assertAccepted(
      await invoke(
        "abg.operation.catalog.verify",
        {
          artifact: product.artifact,
          descriptor: product.descriptor,
          contributionManifest: product.contribution,
          resolvedLock: lock
        },
        productContext
      ),
      `${input.label} catalog.verify ${product.descriptor.productId}`
    ));
  }
  const installed = [];
  for (const artifact of verified) {
    installed.push(assertAccepted(
      await invoke(
        "abg.operation.install.install",
        {
          verifiedArtifact: artifact,
          toolchainRoot,
          workspaceBindingRef: null
        },
        productContext
      ),
      `${input.label} install ${artifact.descriptor.productId}`
    ));
  }
  const bindingContext = await createNodeWorkspaceBindingContext({
    workspaceRoot,
    publicContractCatalog,
    installedProductRecords: installed
  });
  const binding = assertAccepted(
    await invoke(
      "abg.operation.catalog.bind",
      {
        workspaceId: workspace.workspaceId,
        workspaceManifestDigest: digestCanonicalIJson(workspace),
        resolvedLock: lock,
        installedProductRecords: installed,
        mutableStateRoots: null
      },
      bindingContext
    ),
    `${input.label} catalog.bind`
  );
  const boundContext = await createNodeBoundWorkspaceContext({
    workspaceRoot,
    publicContractCatalog
  });
  return Object.freeze({
    binding,
    boundContext,
    fixture: input.fixture,
    invoke,
    lock,
    productContext,
    publicContractCatalog,
    workspace,
    workspaceRoot
  });
}

async function admitPair(pair) {
  return await pair.invoke(
    "abg.operation.catalog.admit",
    {
      workspaceId: pair.workspace.workspaceId,
      bindingId: pair.binding.bindingId,
      resolvedLockId: pair.lock.lockId,
      productSetDigest: pair.binding.productSetDigest
    },
    pair.boundContext
  );
}

async function runtimeEvents(context) {
  return admitWorkspaceRuntimeEventBytes(
    await context.effects.readRuntimeEventBytes()
  ).orderedEvents;
}

function deterministicValidationCapabilityFactory(counter) {
  return ({ workspaceRoot, archiveRoot, steering }) => {
    counter.calls += 1;
    const capability = Object.freeze({
      agentContract: Object.freeze({
        agentKey: "generic",
        command: process.execPath,
        argsTemplate: Object.freeze(["--eval", "process.exit(0)", "{prompt}"]),
        sanitizedEnvironmentPolicy: Object.freeze({
          prefixes: Object.freeze([])
        })
      }),
      archiveRoot,
      cwd: workspaceRoot,
      timeoutMs: steering.timeoutMs,
      executorProfile: steering.profile
    });
    return constructLiveCapabilityBinding({
      workspaceRoot,
      agentKey: "generic",
      agentKeySource: "flag",
      executorProfile: steering.profile,
      executorProfileSource: "flag",
      timeoutMs: steering.timeoutMs,
      timeoutMsSource: "flag",
      pluginCapabilities: Object.freeze({
        liveFpDispatch: capability,
        liveFpEvaluator: capability
      })
    });
  };
}

function graphInvokeRequest(pair, admission, view, overrides = {}) {
  const graphRow = pair.fixture.sidecars.contribution.rows.find(
    (row) => row.canonicalHandle === T223_FIXTURE_GRAPH_HANDLE
  );
  assert.notEqual(graphRow, undefined);
  const contractRow = pair.fixture.product.catalog.rows.find(
    (row) => row.contractId === graphRow.contractRef
  );
  assert.notEqual(contractRow?.assetLocator, null);
  assert.notEqual(contractRow?.assetLocator, undefined);
  return {
    workspaceId: pair.workspace.workspaceId,
    bindingId: pair.binding.bindingId,
    resolvedLockId: pair.lock.lockId,
    catalogId: admission.catalogId,
    catalogVersion: admission.catalogVersion,
    catalogDigest: admission.catalogDigest,
    allowedHandles: null,
    sessionView: view,
    graphFunctionHandle: T223_FIXTURE_GRAPH_HANDLE,
    interfaceRef: graphRow.interfaceRef,
    inputId: "input://t223/negative/hello",
    inputSchemaId: contractRow.assetLocator.schemaId,
    inputSchemaVersion: contractRow.assetLocator.schemaVersion,
    inputSchemaDigest: contractRow.assetLocator.digest,
    input: { greeting: "world" },
    requiredCapabilityRefs: graphRow.capabilityRefs,
    actorRef: "actor://t223/negative",
    transportSteering: {
      agent: "generic",
      model: null,
      profile: "local-spawn",
      timeoutMs: 1000
    },
    ...overrides
  };
}

test("T-223 packed products fail closed across the seven bounded negative families", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t223-negatives-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const candidate = await prepareT223AbgCandidate({
    outputRoot: path.join(root, "candidate")
  });
  const fixture = await generateT223HelloWorldFixture({
    root: path.join(root, "fixture"),
    abgVersion: candidate.descriptor.version
  });
  const pair = await prepareBoundPair({
    candidate,
    fixture,
    label: "base",
    root: path.join(root, "base")
  });
  const admission = assertAccepted(await admitPair(pair), "base catalog.admit");
  const graphView = assertAccepted(
    await pair.invoke(
      "abg.operation.catalog.allow",
      {
        workspaceId: pair.workspace.workspaceId,
        catalogId: admission.catalogId,
        handles: [T223_FIXTURE_GRAPH_HANDLE]
      },
      pair.boundContext
    ),
    "base graph allowlist"
  );
  const validationCapabilityCalls = { calls: 0 };
  const validationContext = await createNodeBoundWorkspaceContext({
    workspaceRoot: pair.workspaceRoot,
    publicContractCatalog: pair.publicContractCatalog,
    operatorCapabilityFactories: {
      [ABG_CATALOG_INVOKE_GRAPH_FUNCTION_CAPABILITY_REF]:
        deterministicValidationCapabilityFactory(validationCapabilityCalls)
    }
  });

  await t.test("identity, range, digest, and interface incompatibility are typed", async () => {
    const rangeDescriptor = redigestDescriptor(
      fixture.sidecars.descriptor,
      { abgCompatibility: ">=6.0.0 <7.0.0" }
    );
    const range = await pair.invoke(
      "abg.operation.catalog.resolve",
      pairResolutionRequest(candidate, rangeDescriptor),
      pair.productContext
    );
    assert.equal(range.kind, "refused");
    assert.equal(range.code, "incompatible");

    const identityDescriptor = redigestDescriptor(
      fixture.sidecars.descriptor,
      { publisher: "wrong-publisher" }
    );
    const identity = await pair.invoke(
      "abg.operation.catalog.verify",
      {
        artifact: fixtureArtifact(fixture),
        descriptor: identityDescriptor,
        contributionManifest: fixture.sidecars.contribution,
        resolvedLock: pair.lock
      },
      pair.productContext
    );
    assert.equal(identity.kind, "refused");
    assert.equal(
      ["descriptor_mismatch", "contribution_mismatch", "lock_mismatch"].includes(
        identity.code
      ),
      true,
      JSON.stringify(identity)
    );

    const damagedArtifactPath = path.join(root, "damaged-fixture.tgz");
    await copyFile(fixture.artifactPath, damagedArtifactPath);
    await appendFile(damagedArtifactPath, "damaged", "utf8");
    const digest = await pair.invoke(
      "abg.operation.catalog.verify",
      {
        artifact: {
          ...fixtureArtifact(fixture),
          artifactPath: damagedArtifactPath
        },
        descriptor: fixture.sidecars.descriptor,
        contributionManifest: fixture.sidecars.contribution,
        resolvedLock: pair.lock
      },
      pair.productContext
    );
    assert.equal(digest.kind, "refused");
    assert.equal(
      ["identity_mismatch", "content_mismatch"].includes(digest.code),
      true,
      JSON.stringify(digest)
    );
    assert.match(digest.message, /digest/ui);

    const eventBytes = await validationContext.effects.readRuntimeEventBytes();
    const capabilityCalls = validationCapabilityCalls.calls;
    const wrongInterface = await pair.invoke(
      "abg.operation.catalog.invoke",
      graphInvokeRequest(pair, admission, graphView, {
        interfaceRef: "interface://fixture/wrong/v1"
      }),
      validationContext
    );
    assert.equal(wrongInterface.kind, "refused");
    assert.equal(wrongInterface.code, "interface_mismatch");
    assert.deepEqual(
      await validationContext.effects.readRuntimeEventBytes(),
      eventBytes
    );
    assert.equal(validationCapabilityCalls.calls, capabilityCalls);
  });

  await t.test("unresolved dependency and handle stop at resolution and catalog lookup", async () => {
    const unresolvedDescriptor = redigestDescriptor(
      fixture.sidecars.descriptor,
      {
        dependencies: [
          ...fixture.sidecars.descriptor.dependencies,
          {
            productId: "fixture.missing",
            versionConstraint: "1.0.0",
            requiredContractRefs: [],
            requiredCapabilityRefs: []
          }
        ]
      }
    );
    const unresolvedDependency = await pair.invoke(
      "abg.operation.catalog.resolve",
      pairResolutionRequest(candidate, unresolvedDescriptor),
      pair.productContext
    );
    assert.equal(unresolvedDependency.kind, "refused");
    assert.equal(unresolvedDependency.code, "unresolved");

    const unresolvedHandle = await pair.invoke(
      "abg.operation.catalog.allow",
      {
        workspaceId: pair.workspace.workspaceId,
        catalogId: admission.catalogId,
        handles: ["graph-function://fixture/missing"]
      },
      pair.boundContext
    );
    assert.equal(unresolvedHandle.kind, "refused");
    assert.equal(unresolvedHandle.code, "unknown_handle");
  });

  await t.test("a real Module-backed product declaration cannot shadow SYSTEM identity", async () => {
    const shadowFixture = await generateT223HelloWorldFixture({
      root: path.join(root, "shadow-fixture"),
      abgVersion: candidate.descriptor.version,
      shadowSystemGraphFunctionHandle:
        T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE
    });
    const shadowPair = await prepareBoundPair({
      candidate,
      fixture: shadowFixture,
      label: "shadow",
      root: path.join(root, "shadow")
    });
    const shadowAdmission = await admitPair(shadowPair);
    assert.equal(shadowAdmission.kind, "refused");
    assert.equal(
      ["required_row_rejected", "product_conflict"].includes(
        shadowAdmission.code
      ),
      true,
      JSON.stringify(shadowAdmission)
    );
    const events = await runtimeEvents(shadowPair.boundContext);
    assert.notEqual(
      events.find(
        (event) =>
          event.kind === "registry_entry_rejected" &&
          event.declarationRef === T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE &&
          event.libraryScope === "product"
      ),
      undefined
    );
    assert.equal(
      events.find(
        (event) =>
          event.kind === "registry_entry_admitted" &&
          event.entryRef === T223_ABG_SYSTEM_GRAPH_FUNCTION_HANDLE &&
          event.libraryScope === "product"
      ),
      undefined,
      "the conflicting product declaration must never silently shadow SYSTEM"
    );
  });

  await t.test("allowlist widening and disallowed selection are typed before execution", async () => {
    const nodeView = assertAccepted(
      await pair.invoke(
        "abg.operation.catalog.allow",
        {
          workspaceId: pair.workspace.workspaceId,
          catalogId: admission.catalogId,
          handles: [T223_FIXTURE_NODE_HANDLE]
        },
        pair.boundContext
      ),
      "node allowlist"
    );
    const eventBytes = await validationContext.effects.readRuntimeEventBytes();
    const capabilityCalls = validationCapabilityCalls.calls;
    await assert.rejects(
      pair.invoke(
        "abg.operation.catalog.invoke",
        graphInvokeRequest(pair, admission, graphView, {
          allowedHandles: [
            T223_FIXTURE_GRAPH_HANDLE,
            T223_FIXTURE_NODE_HANDLE
          ]
        }),
        validationContext
      ),
      /allowedHandles and sessionView are mutually exclusive/u
    );

    const disallowed = await pair.invoke(
      "abg.operation.catalog.invoke",
      graphInvokeRequest(pair, admission, nodeView),
      validationContext
    );
    assert.equal(disallowed.kind, "refused");
    assert.equal(disallowed.code, "disallowed", JSON.stringify(disallowed));
    assert.deepEqual(
      await validationContext.effects.readRuntimeEventBytes(),
      eventBytes
    );
    assert.equal(validationCapabilityCalls.calls, capabilityCalls);
  });

  await t.test("malformed input is rejected without runtime effects", async () => {
    const eventBytes = await validationContext.effects.readRuntimeEventBytes();
    const capabilityCalls = validationCapabilityCalls.calls;
    const malformed = await pair.invoke(
      "abg.operation.catalog.invoke",
      graphInvokeRequest(pair, admission, graphView, {
        input: { greeting: 42 }
      }),
      validationContext
    );
    assert.equal(malformed.kind, "refused");
    assert.equal(malformed.code, "input_invalid");
    assert.deepEqual(
      await validationContext.effects.readRuntimeEventBytes(),
      eventBytes
    );
    assert.equal(validationCapabilityCalls.calls, capabilityCalls);
  });

  await t.test("missing worker capability is refused before GraphCall", async () => {
    const nodeContext = await createNodeBoundWorkspaceContext({
      workspaceRoot: pair.workspaceRoot,
      publicContractCatalog: pair.publicContractCatalog
    });
    const missingCapabilityContext = Object.freeze({
      ...nodeContext,
      effects: Object.freeze({
        ...nodeContext.effects,
        operatorCapabilityFactories: Object.freeze({})
      })
    });
    const eventBytes = await missingCapabilityContext.effects.readRuntimeEventBytes();
    const missing = await pair.invoke(
      "abg.operation.catalog.invoke",
      graphInvokeRequest(pair, admission, graphView),
      missingCapabilityContext
    );
    assert.equal(missing.kind, "refused");
    assert.equal(missing.code, "missing_capability");
    assert.match(missing.message, /capability factory is unavailable/u);
    assert.deepEqual(
      await missingCapabilityContext.effects.readRuntimeEventBytes(),
      eventBytes
    );
    assert.equal(
      (await runtimeEvents(missingCapabilityContext)).some(
        (event) => event.kind === "graph_call_opened"
      ),
      false
    );
  });

  await t.test("the packed product rejects private package imports and the fixture ships no source", async () => {
    const fixtureEntries = await pair.productContext.effects.inspectArtifact(
      fixtureArtifact(fixture)
    );
    assert.equal(
      fixtureEntries.some((entry) =>
        /\.(?:cjs|js|mjs|ts)$/u.test(entry.relativePath)
      ),
      false
    );

    const extractedRoot = path.join(root, "private-import-package");
    const packageRoot = path.join(extractedRoot, "extracted");
    const consumerRoot = path.join(extractedRoot, "consumer");
    const installedScope = path.join(
      consumerRoot,
      "node_modules/@abiogenesis"
    );
    await mkdir(packageRoot, { recursive: true });
    await mkdir(installedScope, { recursive: true });
    const extracted = spawnSync(
      "tar",
      ["-xzf", candidate.artifactPath, "-C", packageRoot],
      { encoding: "utf8" }
    );
    assert.equal(
      extracted.status,
      0,
      extracted.stderr || extracted.stdout
    );
    await symlink(
      path.join(packageRoot, "package"),
      path.join(installedScope, "typescript-tenant"),
      "dir"
    );
    await writeFile(
      path.join(consumerRoot, "package.json"),
      '{"type":"module"}',
      "utf8"
    );
    const privateImport = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        "await import('@abiogenesis/typescript-tenant/code/src/app/m04/index.js')"
      ],
      { cwd: consumerRoot, encoding: "utf8" }
    );
    assert.notEqual(privateImport.status, 0);
    assert.match(privateImport.stderr, /ERR_PACKAGE_PATH_NOT_EXPORTED/u);
  });
});
