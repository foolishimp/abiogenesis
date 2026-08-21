import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import { setupInstalledCliHarness } from
  "../support/root-cli-environment.mjs";

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("W2-05 Unit A/B post-append receipts cross both Cause and close-failure hosts", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
  });
  const loaderPath = join(harness.scratch, "unitab-private-seam-loader.mjs");
  await writeFile(loaderPath, [
    "export async function load(url, context, nextLoad) {",
    "  const loaded = await nextLoad(url, context);",
    "  const source = String(loaded.source);",
    "  if (url.endsWith('/build/code/src/product/install_definition_bindings.js')) {",
    "    return { ...loaded, shortCircuit: true, source: source + '\\nexport { installOwner as __unitInstallOwner };\\n' };",
    "  }",
    "  if (url.endsWith('/build/code/src/product/environment_definition_bindings.js')) {",
    "    return { ...loaded, shortCircuit: true, source: source + '\\nexport { bindOwner as __unitBindOwner };\\n' };",
    "  }",
    "  if (url.endsWith('/build/code/src/owner_bindings/run_invocation.js')) {",
    "    return { ...loaded, shortCircuit: true, source: source + '\\nexport { postAppendStage as __unitPostAppendStage };\\n' };",
    "  }",
    "  return loaded;",
    "}",
  ].join("\n"), "utf8");

  const probe = `
import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { syncBuiltinESMExports, createRequire } from "node:module";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = ${JSON.stringify(harness.installedPackageRoot)};
const scratch = ${JSON.stringify(harness.scratch)};
const artifactPath = ${JSON.stringify(harness.artifactPath)};
const candidateBasis = ${JSON.stringify(harness.candidateBasis)};
const moduleUrl = (relativePath) => pathToFileURL(join(root, relativePath)).href;
const [product, productEnvironment, abg, eventResourceModule, eventStore, effectHost, installModule, environmentModule, runModule] = await Promise.all([
  import(moduleUrl("build/code/src/product/index.js")),
  import(moduleUrl("build/code/src/product/environment.js")),
  import(moduleUrl("build/code/src/abg/index.js")),
  import(moduleUrl("build/code/src/abg/definition_event_resource.js")),
  import(moduleUrl("build/code/src/abg/event_store.js")),
  import(moduleUrl("build/code/src/shared/effect_definition.js")),
  import(moduleUrl("build/code/src/product/install_definition_bindings.js")),
  import(moduleUrl("build/code/src/product/environment_definition_bindings.js")),
  import(moduleUrl("build/code/src/owner_bindings/run_invocation.js")),
]);
const installedRequire = createRequire(pathToFileURL(join(root, "package.json")));
const Effect = await import(pathToFileURL(installedRequire.resolve("effect/Effect")).href);

const schemaVersion = "5.0.0";
const digestCoordinate = (ref, digest) => Object.freeze({ ref, digest });
const eventAssertion = (eventLogPath) => Object.freeze({
  kind: "new_abg_event_resource",
  schemaVersion,
  eventLogPath,
  locatorDigest: product.sha256Canonical({
    kind: "abg_event_log_locator",
    eventLogPath: resolve(eventLogPath),
  }),
});
const reopenAssertion = (handoff) => Object.freeze({
  kind: "reopen_abg_event_resource",
  schemaVersion,
  closeHandoff: handoff,
  handoffDigest: product.sha256Canonical(handoff),
});
const invocation = ({ operationId, memberKey, request, dependencyLock = null, ordinal }) => {
  const definitionKey = Object.freeze({ operationId, memberKey });
  const invocationRef = "invocation://abiogenesis/unitab/" + String(ordinal) + "-" + memberKey;
  return Object.freeze({
    definitionKey,
    definitionDigest: product.sha256Canonical({ definitionKey, schemaVersion }),
    invocationRef,
    requestDigest: product.sha256Canonical(request),
    request,
    invocationAuthority: Object.freeze({
      slots: Object.freeze({ dependency_lock: dependencyLock }),
    }),
    correlationRef: "correlation://abiogenesis/unitab/" + String(ordinal),
    eventTime: "2026-08-21T00:00:00.000Z",
  });
};

async function withInjectedPostAppendCause(label, action) {
  const originalPush = Array.prototype.push;
  const originalUnlinkSync = fs.unlinkSync;
  let appendFailures = 0;
  let closeAttempts = 0;
  Array.prototype.push = function (...items) {
    if (
      appendFailures === 0 &&
      items.length === 1 &&
      items[0]?.kind === "public_operation_artifact_admitted" &&
      String(new Error().stack).includes("admitRuntimeEventInternal")
    ) {
      appendFailures += 1;
      throw new TypeError(label);
    }
    return Reflect.apply(originalPush, this, items);
  };
  fs.unlinkSync = function (path, ...args) {
    if (
      String(path).includes("abiogenesis-event-store-locks-v5") &&
      !String(path).endsWith(".pending")
    ) {
      closeAttempts += 1;
    }
    return Reflect.apply(originalUnlinkSync, fs, [path, ...args]);
  };
  syncBuiltinESMExports();
  try {
    return Object.freeze({
      host: await action(),
      appendFailures,
      closeAttempts,
    });
  } finally {
    Array.prototype.push = originalPush;
    fs.unlinkSync = originalUnlinkSync;
    syncBuiltinESMExports();
  }
}

const verification = await product.ProductVerificationPort.verify({
  kind: "product_verification_packet",
  schemaVersion,
  memberKey: "verify",
  targetKind: "packed_artifact",
  request: {
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedArtifactDigest: candidateBasis.artifactDigest,
    expectedProductContentDigest: candidateBasis.productContentDigest,
    expectedManifestDigest: candidateBasis.manifestDigest,
    expectedProductId: candidateBasis.productId,
    expectedPackageName: candidateBasis.packageName,
    expectedPackageVersion: candidateBasis.packageVersion,
  },
});
assert.equal(verification.kind, "product_verification_success", JSON.stringify(verification));
const verified = verification.verifiedArtifact;
const resolvedLock = product.ProductEnvironmentPort.resolve({
  kind: "product_resolution_packet",
  schemaVersion,
  memberKey: "resolve",
  verifiedArtifacts: [verified],
});
assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
const lockCoordinate = digestCoordinate(resolvedLock.lockId, resolvedLock.lockDigest);
const packedArtifact = Object.freeze({
  kind: "product_verification_artifact_resource",
  schemaVersion,
  artifactPath,
  artifact: digestCoordinate(verified.artifactRef, verified.artifactDigest),
  productContent: digestCoordinate(
    "product-content://abiogenesis/" + verified.productContentDigest.slice("sha256:".length),
    verified.productContentDigest,
  ),
  descriptor: verification.coordinates.descriptor,
  contributionManifest: digestCoordinate(
    verified.contributionManifestRef,
    verified.contributionManifestDigest,
  ),
  manifestDigest: verified.manifestDigest,
  productId: verified.productId,
  packageName: verified.packageName,
  packageVersion: verified.packageVersion,
});

const eventLogRoot = join(scratch, "unitab-artifact-runtime");
await mkdir(eventLogRoot, { recursive: true });
const eventLogPath = join(eventLogRoot, "events.jsonl");
const installRoot = join(scratch, "unitab-installed-product");
const installRequest = Object.freeze({
  verifiedArtifact: verification.coordinates.verifiedArtifact,
  descriptor: verification.coordinates.descriptor,
  contributionManifest: packedArtifact.contributionManifest,
  resolvedLock: lockCoordinate,
  targetRoot: installRoot,
  installPolicy: "clean",
});
const installCall = Object.freeze({
  invocation: invocation({
    operationId: "abg.operation.product.install",
    memberKey: "install",
    request: installRequest,
    dependencyLock: lockCoordinate,
    ordinal: 1,
  }),
  resources: Object.freeze({
    kind: "product_install_resource_assertion",
    schemaVersion,
    eventResource: eventAssertion(eventLogPath),
    packedArtifact,
    verifiedArtifact: verified,
    resolvedLock,
  }),
});
const installFailure = await withInjectedPostAppendCause(
  "injected Product install post-append Cause",
  () => effectHost.runExactDefinition(
    installCall,
    installModule.__unitInstallOwner(installCall),
  ),
);
assert.equal(installFailure.appendFailures, 1);
assert.equal(installFailure.closeAttempts, 1);
assert.equal(installFailure.host.exitCode, 70);
assert.equal(installFailure.host.failure.failureKind, "defect_or_interruption");
assert.equal(installFailure.host.failure.fault, null);
assert.ok(installFailure.host.resources);
assert.match(installFailure.host.failure.cause, /injected Product install post-append Cause/u);
assert.equal(
  installFailure.host.resources.eventResource.closeHandoff.prefix.prefixLength,
  (await readFile(eventLogPath)).byteLength,
);
assert.ok(
  installFailure.host.resources.eventResource.closeHandoff.prefix.prefixLength >
    installFailure.host.resources.eventResource.entryPrefix.prefixLength,
);
const installTruth = abg.projectExactPrefixArtifactTruth(
  installFailure.host.resources.eventResource.closeHandoff.prefix,
);
assert.equal(installTruth.kind, "exact_prefix_artifact_truth_projection", JSON.stringify(installTruth));
const admittedInstall = abg.projectAdmittedProductInstallByInvocationRef(
  installTruth,
  installCall.invocation.invocationRef,
);
assert.ok(admittedInstall);

const workspaceRoot = join(scratch, "unitab-workspace");
await mkdir(workspaceRoot);
const workspaceCreation = await product.WorkspaceOperationPort.create({
  kind: "workspace_create_packet",
  schemaVersion,
  memberKey: "clean",
  targetRoot: workspaceRoot,
  scaffoldPolicy: "none",
});
assert.equal(workspaceCreation.kind, "workspace_create_result", JSON.stringify(workspaceCreation));
const authorityBody = Object.freeze({
  workspaceId: workspaceCreation.manifest.workspaceRef,
  canonicalRoot: workspaceCreation.manifest.canonicalRoot,
  authorityMode: "trusted_developer",
  authorizedActorRef: "actor://abiogenesis/unitab/worker",
});
const workspaceAuthority = product.constructWorkspaceAuthorityBasis({
  ...authorityBody,
  authorityManifestRef: "manifest://abiogenesis/unitab/workspace-authority",
  authorityManifestDigest: product.sha256Canonical(authorityBody),
});
assert.equal(workspaceAuthority.kind, "workspace_authority_basis", JSON.stringify(workspaceAuthority));
const declaredRoots = Object.freeze({
  toolchainRoot: root,
  productRoot: admittedInstall.install.installedRoot,
  eventLogRoot,
  runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
  projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
  archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
});
const installCoordinate = productEnvironment.productInstallCoordinate(
  admittedInstall.install,
);
const workspaceAuthorityCoordinate = digestCoordinate(
  workspaceAuthority.authorityBasisId,
  workspaceAuthority.authorityBasisDigest,
);
const rootKinds = [
  ["toolchain", "toolchainRoot"],
  ["product", "productRoot"],
  ["event_log", "eventLogRoot"],
  ["runtime_state", "runtimeStateRoot"],
  ["projection", "projectionRoot"],
  ["archive", "archiveRoot"],
];
const bindRequest = Object.freeze({
  workspaceAuthority: workspaceAuthorityCoordinate,
  installedSet: [installCoordinate],
  resolvedLock: lockCoordinate,
  declaredRoots: rootKinds.map(([rootKind, field]) => ({
    rootKind,
    path: declaredRoots[field],
  })),
});
const bindCall = Object.freeze({
  invocation: invocation({
    operationId: "abg.operation.workspace.bind",
    memberKey: "bind",
    request: bindRequest,
    ordinal: 2,
  }),
  resources: Object.freeze({
    kind: "product_workspace_binding_resource_assertion",
    schemaVersion,
    eventResource: reopenAssertion(
      installFailure.host.resources.eventResource.closeHandoff,
    ),
    workspaceAuthority,
    admittedInstalls: [admittedInstall.install],
    resolvedLock,
    declaredRoots,
  }),
});
const bindFailure = await withInjectedPostAppendCause(
  "injected workspace bind post-append Cause",
  () => effectHost.runExactDefinition(
    bindCall,
    environmentModule.__unitBindOwner(bindCall),
  ),
);
assert.equal(bindFailure.appendFailures, 1);
assert.equal(bindFailure.closeAttempts, 1);
assert.equal(bindFailure.host.exitCode, 70);
assert.equal(bindFailure.host.failure.failureKind, "defect_or_interruption");
assert.equal(bindFailure.host.failure.fault, null);
assert.ok(bindFailure.host.resources);
assert.match(bindFailure.host.failure.cause, /injected workspace bind post-append Cause/u);
assert.deepEqual(
  bindFailure.host.resources.eventResource.entryPrefix,
  installFailure.host.resources.eventResource.closeHandoff.prefix,
);
assert.equal(
  bindFailure.host.resources.eventResource.closeHandoff.prefix.prefixLength,
  (await readFile(eventLogPath)).byteLength,
);
assert.ok(
  bindFailure.host.resources.eventResource.closeHandoff.prefix.prefixLength >
    bindFailure.host.resources.eventResource.entryPrefix.prefixLength,
);
const bindingTruth = abg.projectExactPrefixArtifactTruth(
  bindFailure.host.resources.eventResource.closeHandoff.prefix,
);
assert.equal(bindingTruth.kind, "exact_prefix_artifact_truth_projection", JSON.stringify(bindingTruth));
assert.ok(abg.projectAdmittedWorkspaceBindingByInvocationRef(
  bindingTruth,
  bindCall.invocation.invocationRef,
  resolvedLock,
));

const runEventLogPath = join(eventLogRoot, "run-close.events.jsonl");
const acquired = eventResourceModule.acquireAbgEventResource(
  eventAssertion(runEventLogPath),
);
assert.equal(acquired.kind, "acquired_abg_event_resource", JSON.stringify(acquired));
const runEvent = eventStore.admitRuntimeEvent(acquired.resource.store, {
  kind: "public_operation_admitted",
  eventTime: "2026-08-21T00:00:00.000Z",
  aggregateType: "workspace",
  aggregateId: "invocation://abiogenesis/unitab/run-close",
  parentAggregateId: null,
  causationEventRefs: [],
  correlationId: "correlation://abiogenesis/unitab/run-close",
  workflowVersion: schemaVersion,
  scopeClass: "workspace",
  basisId: "basis://abiogenesis/unitab/run-close",
  payload: {
    invocationDigest: product.sha256Canonical({ run: "close-failure" }),
    invocationRef: "invocation://abiogenesis/unitab/run-close",
    operationId: "abg.operation.project.read",
    variant: "status",
  },
});
const runSuccessor = eventStore.selectHeldEventStoreDurablePrefix(
  acquired.resource.store,
);
assert.ok(runSuccessor.prefixLength > acquired.resource.entryPrefix.prefixLength);
const runIdentity = await stat(runEventLogPath);
const runLockPath = join(
  ${JSON.stringify(join((await import("node:os")).tmpdir(), "abiogenesis-event-store-locks-v5"))},
  String(runIdentity.dev) + "-" + String(runIdentity.ino) + ".lock",
);
const originalUnlinkSync = fs.unlinkSync;
let runCloseAttempts = 0;
fs.unlinkSync = function (path, ...args) {
  if (resolve(String(path)) === resolve(runLockPath)) {
    runCloseAttempts += 1;
    throw new Error("injected run close release failure");
  }
  return Reflect.apply(originalUnlinkSync, fs, [path, ...args]);
};
syncBuiltinESMExports();
const runDefinitionKey = Object.freeze({
  operationId: "abg.operation.run.invoke",
  memberKey: "invoke",
});
const runCall = Object.freeze({
  invocation: Object.freeze({
    definitionKey: runDefinitionKey,
    invocationRef: "invocation://abiogenesis/unitab/run-close-host",
  }),
  resources: null,
});
let runHost;
try {
  runHost = await effectHost.runExactDefinition(
    runCall,
    runModule.__unitPostAppendStage(
      runCall,
      acquired.resource,
      runSuccessor,
      Object.freeze({
        resolution: Object.freeze({
          resolution: Object.freeze({
            resolutionRef: "product-execution-resolution://abiogenesis/unitab",
            resolutionDigest: product.sha256Canonical({ resolution: "unitab" }),
          }),
        }),
      }),
      Object.freeze({
        invocationAdmissionRef: "invocation-admission://abiogenesis/unitab",
        invocationAdmissionDigest: product.sha256Canonical({ admission: "unitab" }),
      }),
      null,
      "injected_post_append_stage",
      Effect.die(new TypeError("injected run post-append stage Cause")),
    ),
  );
} finally {
  fs.unlinkSync = originalUnlinkSync;
  syncBuiltinESMExports();
}
assert.equal(runCloseAttempts, 1);
assert.equal(runHost.exitCode, 70);
assert.equal(runHost.failure.failureKind, "typed_execution_fault");
assert.equal(runHost.failure.fault.faultBoundary, "post_append");
assert.equal(runHost.failure.fault.stage, "injected_post_append_stage");
assert.equal(runHost.failure.fault.code, "injected_post_append_stage_defect");
assert.match(runHost.failure.fault.message, /injected run post-append stage Cause/u);
assert.match(runHost.failure.fault.evidence.closeFailure, /injected run close release failure/u);
assert.deepEqual(runHost.resources, runHost.failure.fault.resourceReceipt);
assert.deepEqual(
  runHost.resources.eventResource.closeHandoff.prefix,
  runSuccessor,
);
assert.deepEqual(runHost.resources.eventResource.entryPrefix, acquired.resource.entryPrefix);
assert.equal(runHost.resources.eventResource.closeHandoff.prefix.prefixLength, (await readFile(runEventLogPath)).byteLength);
await rm(runLockPath, { force: true });
const reopened = eventStore.reopenEventStore(
  runHost.resources.eventResource.closeHandoff.reopenAuthority,
);
assert.equal(reopened.kind, "reopened_event_store_context", JSON.stringify(reopened));
assert.deepEqual(reopened.store.readAll(), [runEvent]);
reopened.store.closeDurableLog();

console.log(JSON.stringify({
  install: installFailure,
  bind: bindFailure,
  run: { host: runHost, closeAttempts: runCloseAttempts },
}));
`;

  const { stdout } = await execFileAsync(
    process.execPath,
    ["--loader", loaderPath, "--input-type=module", "--eval", probe],
    {
      cwd: harness.cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 12 * 1024 * 1024,
    },
  );
  const result = JSON.parse(stdout.trim().split("\n").at(-1));
  assert.equal(result.install.host.failure.failureKind, "defect_or_interruption");
  assert.equal(result.install.host.failure.fault, null);
  assert.ok(result.install.host.resources);
  assert.equal(
    result.bind.host.failure.failureKind,
    "defect_or_interruption",
    JSON.stringify(result.bind.host),
  );
  assert.equal(result.bind.host.failure.fault, null);
  assert.ok(result.bind.host.resources);
  assert.equal(result.run.host.failure.failureKind, "typed_execution_fault");
  assert.deepEqual(
    result.run.host.resources,
    result.run.host.failure.fault.resourceReceipt,
  );
  assert.equal(result.install.closeAttempts, 1);
  assert.equal(result.bind.closeAttempts, 1);
  assert.equal(result.run.closeAttempts, 1);
});
