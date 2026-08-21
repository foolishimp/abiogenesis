import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourceRoot = join(packageRoot, "code/src");

async function typescriptSources(root) {
  const discovered = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) discovered.push(...await typescriptSources(path));
    if (entry.isFile() && entry.name.endsWith(".ts")) discovered.push(path);
  }
  return discovered;
}

function callWithKey(definitionKey) {
  return Object.freeze({
    invocation: Object.freeze({
      definitionKey,
      invocationRef: "invocation://abiogenesis/unit-a/host-pre-fault",
    }),
    resources: null,
  });
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function exactWorkspaceInvocation(publicApi, product, request) {
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions
    .find((candidate) =>
      candidate.definitionKey.operationId ===
        "abg.operation.workspace.create" &&
      candidate.definitionKey.memberKey === "clean"
    );
  assert.ok(definition);
  const operation = publicApi.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(
    (candidate) =>
      candidate.operationId === definition.definitionKey.operationId,
  );
  const member = operation?.definitions.find((candidate) =>
    candidate.definitionKey.memberKey === definition.definitionKey.memberKey
  );
  const asset = publicApi.PUBLIC_PROJECTION_PAYLOADS.operationContractAssets
    .find((candidate) =>
      candidate.operationId === definition.definitionKey.operationId
    );
  assert.ok(member);
  assert.ok(asset);
  const catalog = Object.freeze({
    productId: "product://abiogenesis/typescript-tenant@5",
    productContentDigest: product.sha256Canonical({
      product: "canonical-host-projection-cause",
    }),
    catalogId: "catalog://abiogenesis/public-contracts@5",
    catalogVersion: "5.0.0",
    catalogDigest: product.sha256Canonical({
      catalog: "canonical-host-projection-cause",
    }),
  });
  const contractCoordinate = (slot, definitionRef) => Object.freeze({
    contractCatalog: catalog,
    flatRow: Object.freeze({
      contractId: definition.definitionKey.operationId,
      contractVersion: "5.0.0",
      contractDigest: asset.contentDigest,
    }),
    nestedSelector: Object.freeze({
      selectorKind: "operation_definition_slot",
      definitionKey: definition.definitionKey,
      slot,
      definitionRef,
    }),
  });
  const slots = Object.freeze({
    workspace_binding: null,
    product_set: null,
    dependency_lock: null,
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...definition.capabilityRefs]),
      grants: Object.freeze([
        coordinate(product, "capability-grant://abiogenesis/unit-a/workspace"),
      ]),
    }),
    actor: Object.freeze({
      actor: coordinate(product, "actor://abiogenesis/unit-a/worker"),
      attribution: coordinate(
        product,
        "attribution://abiogenesis/unit-a/worker",
      ),
    }),
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
  });
  const authorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots,
  });
  const invocationAuthority = Object.freeze({
    ...authorityBody,
    authorityDigest: product.sha256Canonical(authorityBody),
  });
  const requestDigest = product.sha256Canonical(request);
  const identity = Object.freeze({
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    invocationContract: Object.freeze({
      contractCatalog: catalog,
      flatRow: Object.freeze({
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: "5.0.0",
        contractDigest:
          publicApi.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
      }),
      nestedSelector: Object.freeze({
        selectorKind: "schema_definition",
        definitionKey: null,
        slot: null,
        definitionRef: "#/$defs/PublicInvocation",
      }),
    }),
    definitionRef: definition.definitionRef,
    definitionVersion: "5.0.0",
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog: catalog,
    invocationAuthority,
    requestContract: contractCoordinate(
      "request",
      member.requestContract.definitionRef,
    ),
    requestRef: "public-request://abiogenesis/unit-a/projection-cause",
    requestDigest,
    request,
    expectedResultContract: contractCoordinate(
      "result",
      member.resultContract.definitionRef,
    ),
    expectedRefusalContract: contractCoordinate(
      "refusal",
      member.refusalContract.definitionRef,
    ),
    expectedNonTerminalContract: null,
    correlationRef: "correlation://abiogenesis/unit-a/projection-cause",
    eventTime: "2026-08-21T00:00:00.000Z",
    provenanceRefs: Object.freeze([
      "provenance://abiogenesis/unit-a-worker",
    ]),
  });
  const invocationDigest = product.sha256Canonical(identity);
  return Object.freeze({
    ...identity,
    invocationRef:
      `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
    invocationDigest,
  });
}

function productInstallAdmissionBasis(product, install, predecessorPrefix) {
  const operationId = "abg.operation.product.install";
  const memberKey = "install";
  const invocationRef = "invocation://abiogenesis/unit-a/admit-product-install";
  const invocationPayloadDigest = product.sha256Canonical({});
  const definitionDigest = product.sha256Canonical({
    operationId,
    memberKey,
    schemaVersion: "5.0.0",
  });
  return Object.freeze({
    operationId,
    memberKey,
    definitionDigest,
    authorityScopeRef: install.installId,
    authorityScopeDigest: install.productContentDigest,
    invocationRef,
    invocationPayloadDigest,
    invocationDigest: product.sha256Canonical({
      definitionDigest,
      invocationRef,
      invocationPayloadDigest,
      memberKey,
      operationId,
    }),
    correlationId: "correlation://abiogenesis/unit-a/installed-host",
    eventTime: "2026-08-21T00:00:00.000Z",
    causationEventRefs: Object.freeze([]),
    predecessorPrefix,
  });
}

test("one installed SDK/CLI host replaces the erased loader and legacy Public path", async () => {
  const [packageJsonText, sdkSource, cliSource, publicIndexSource] =
    await Promise.all([
      readFile(join(packageRoot, "package.json"), "utf8"),
      readFile(join(sourceRoot, "public/sdk.ts"), "utf8"),
      readFile(join(sourceRoot, "public/cli.ts"), "utf8"),
      readFile(join(sourceRoot, "public/index.ts"), "utf8"),
    ]);
  const packageJson = JSON.parse(packageJsonText);

  assert.equal(packageJson.exports["./installed-loader"], undefined);
  assert.match(publicIndexSource, /invokeInstalledDefinition/u);
  assert.doesNotMatch(
    sdkSource,
    /\bas unknown as\b/u,
    "the SDK must preserve the selected call, resource, and receipt indexes",
  );
  assert.doesNotMatch(
    `${publicIndexSource}\n${cliSource}`,
    /applyRootPublicInvocation|createRootOperationContext|reopenRootOperationContext|runEffectProgram|Effect\.run/u,
  );
  assert.equal(
    [...sdkSource.matchAll(/\brunExactDefinition\s*\(/gu)].length,
    1,
  );
  assert.equal(
    [...sdkSource.matchAll(/\bloadVerifiedInstalledDefinitionBinding\s*\(/gu)]
      .length,
    1,
  );
  assert.equal(
    [...cliSource.matchAll(/\binvokeInstalledDefinition\s*\(/gu)].length,
    1,
  );

  assert.deepEqual(
    (await readdir(join(sourceRoot, "public"))).sort(),
    ["cli.ts", "codex_cli.ts", "index.ts", "sdk.ts"],
    "the source Public membrane contains no legacy carrier, projection, or host",
  );

  const productionHostCallers = [];
  const legacyPublicSources = [];
  for (const path of await typescriptSources(sourceRoot)) {
    const source = await readFile(path, "utf8");
    if (/\brunExactDefinition\s*\(/u.test(source)) {
      productionHostCallers.push(relative(sourceRoot, path));
    }
    if (
      /RootPublicInvocation|ROOT_PUBLIC_OPERATION_DEFINITIONS|applyRootPublicInvocation|parseRootPublicInvocation/u
        .test(source)
    ) legacyPublicSources.push(relative(sourceRoot, path));
  }
  assert.deepEqual(productionHostCallers, ["public/sdk.ts"]);
  assert.deepEqual(legacyPublicSources, []);
});

test("installed SDK types preserve exact call and receipt indexes", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-unit-a-sdk-types-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));
  const moduleSpecifier = (absoluteTarget) => {
    const candidate = relative(scratch, absoluteTarget).split("\\").join("/");
    return candidate.startsWith(".") ? candidate : `./${candidate}`;
  };
  const publicModule = moduleSpecifier(
    join(packageRoot, "build/code/src/public/index.js"),
  );
  const effectDefinitionModule = moduleSpecifier(
    join(packageRoot, "build/code/src/shared/effect_definition.js"),
  );
  const workspaceBindingModule = moduleSpecifier(
    join(packageRoot, "build/code/src/product/workspace_definition_bindings.js"),
  );
  const installBindingModule = moduleSpecifier(
    join(packageRoot, "build/code/src/product/install_definition_bindings.js"),
  );
  const probePath = join(scratch, "exact-installed-sdk-indexes.mts");
  await writeFile(probePath, `
import type {
  InstalledDefinitionCallFor,
  InstalledDefinitionHostReceiptFor,
} from ${JSON.stringify(publicModule)};
import type {
  DefinitionHostReceipt,
  ExactDefinitionCallable,
} from ${JSON.stringify(effectDefinitionModule)};
import { WORKSPACE_DEFINITION_BINDINGS } from ${JSON.stringify(workspaceBindingModule)};
import { PRODUCT_INSTALL_DEFINITION_BINDINGS } from ${JSON.stringify(installBindingModule)};

type SameType<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
    (<T>() => T extends Right ? 1 : 2)
    ? (<T>() => T extends Right ? 1 : 2) extends
        (<T>() => T extends Left ? 1 : 2)
      ? true
      : false
    : false;
type AssertType<T extends true> = T;
type CallableKey<TCallable> =
  TCallable extends ExactDefinitionCallable<
    infer TPacket,
    infer _TResources,
    infer _TResourceReceipt
  > ? TPacket["definitionKey"]
  : never;
type CallableCall<TCallable> =
  TCallable extends ExactDefinitionCallable<
    infer TPacket,
    infer TResources,
    infer _TResourceReceipt
  > ? Parameters<ExactDefinitionCallable<TPacket, TResources, never>>[0]
  : never;
type CallableHostReceipt<TCallable> =
  TCallable extends ExactDefinitionCallable<
    infer TPacket,
    infer _TResources,
    infer TResourceReceipt
  > ? DefinitionHostReceipt<TPacket, TResourceReceipt>
  : never;

type WorkspaceCleanCallable =
  typeof WORKSPACE_DEFINITION_BINDINGS.create.clean;
type ProductInstallCallable =
  typeof PRODUCT_INSTALL_DEFINITION_BINDINGS.install;
type WorkspaceCleanCall = CallableCall<WorkspaceCleanCallable>;
type ProductInstallCall = CallableCall<ProductInstallCallable>;
type WorkspaceCleanHostReceipt = CallableHostReceipt<WorkspaceCleanCallable>;
type ProductInstallHostReceipt = CallableHostReceipt<ProductInstallCallable>;

type _WorkspaceCleanCallIndexIsExact = AssertType<SameType<
  InstalledDefinitionCallFor<CallableKey<WorkspaceCleanCallable>>,
  WorkspaceCleanCall
>>;
type _WorkspaceCleanReceiptIndexIsExact = AssertType<SameType<
  InstalledDefinitionHostReceiptFor<CallableKey<WorkspaceCleanCallable>>,
  WorkspaceCleanHostReceipt
>>;
type _ProductInstallCallIndexIsExact = AssertType<SameType<
  InstalledDefinitionCallFor<CallableKey<ProductInstallCallable>>,
  ProductInstallCall
>>;
type _ProductInstallReceiptIndexIsExact = AssertType<SameType<
  InstalledDefinitionHostReceiptFor<CallableKey<ProductInstallCallable>>,
  ProductInstallHostReceipt
>>;
type _CallResourcesRemainDistinct = AssertType<
  SameType<WorkspaceCleanCall, ProductInstallCall> extends false ? true : false
>;
type _HostReceiptsRemainDistinct = AssertType<
  SameType<WorkspaceCleanHostReceipt, ProductInstallHostReceipt> extends false
    ? true
    : false
>;
`, "utf8");

  await execFileAsync(
    process.execPath,
    [
      join(packageRoot, "node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--exactOptionalPropertyTypes",
      "--noUncheckedIndexedAccess",
      "--skipLibCheck",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--target",
      "ES2022",
      probePath,
    ],
    { cwd: packageRoot, maxBuffer: 4 * 1024 * 1024 },
  );
});

test("packed Public and CLI project the same actual host pre-fault receipt", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-unit-a-host-"));
  context.after(async () => rm(scratch, { force: true, recursive: true }));

  const sourcePublic = await import(
    `${pathToFileURL(join(packageRoot, "build/code/src/public/index.js")).href}?source=${Date.now()}`
  );
  const { stdout: packOutput } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", scratch],
    { cwd: packageRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(packOutput);
  assert.equal(typeof packResult.filename, "string");
  await execFileAsync(
    "tar",
    ["-xzf", join(scratch, packResult.filename), "-C", scratch],
  );

  const packedRoot = join(scratch, "package");
  assert.deepEqual(
    (await readdir(join(packedRoot, "build/code/src/public"))).sort(),
    [
      "cli.d.ts",
      "cli.js",
      "codex_cli.d.ts",
      "codex_cli.js",
      "index.d.ts",
      "index.js",
      "sdk.d.ts",
      "sdk.js",
    ],
    "the packed Public membrane contains no file-importable legacy host",
  );
  const packedProduct = await import(
    `${pathToFileURL(join(packedRoot, "build/code/src/product/index.js")).href}?product=${Date.now()}`
  );
  const packedManifest = JSON.parse(
    await readFile(join(packedRoot, "product-toolchain-manifest.json"), "utf8"),
  );
  const artifactPath = join(scratch, packResult.filename);
  const verifiedProduct = await packedProduct.verifyProduct({
    artifactPath,
    artifactRef: basename(artifactPath),
    expectedArtifactDigest: await packedProduct.sha256File(artifactPath),
    expectedProductContentDigest: packedManifest.productContentDigest,
    expectedManifestDigest: packedProduct.sha256Canonical(packedManifest),
    expectedProductId: packedManifest.productId,
    expectedPackageName: packedManifest.packageName,
    expectedPackageVersion: packedManifest.packageVersion,
  });
  assert.equal(
    verifiedProduct.kind,
    "verified_product_artifact",
    JSON.stringify(verifiedProduct),
  );
  const resolvedLock = packedProduct.constructResolvedProductLock([
    verifiedProduct,
  ]);
  assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
  const installed = await packedProduct.installProduct({
    artifactPath,
    targetRoot: join(scratch, "consumer"),
    verifiedArtifact: verifiedProduct,
    resolvedLock,
  });
  assert.equal(installed.disposition, "materialized", JSON.stringify(installed));

  const installedAbg = await import(
    `${pathToFileURL(join(installed.installedRoot, "build/code/src/abg/index.js")).href}?abg=${Date.now()}`
  );
  await mkdir(join(scratch, "runtime"));
  const acquired = installedAbg.createNewEmptyAppendSink({
    kind: "new_empty_append_sink_request",
    schemaVersion: "5.0.0",
    eventLogPath: join(scratch, "runtime/events.jsonl"),
  });
  assert.equal("store" in acquired, true, JSON.stringify(acquired));
  context.after(() => acquired.store.closeDurableLog());

  const admittedInstall = installedAbg.admitProductInstall(
    acquired.store,
    installed,
    productInstallAdmissionBasis(packedProduct, installed, acquired.prefix),
    resolvedLock,
  );
  assert.equal(
    admittedInstall.kind,
    "artifact_owner_result",
    JSON.stringify(admittedInstall),
  );

  const packedPublic = await import(
    `${pathToFileURL(join(packedRoot, "build/code/src/public/index.js")).href}?packed=${Date.now()}`
  );
  assert.deepEqual(Object.keys(packedPublic).sort(), Object.keys(sourcePublic).sort());
  assert.equal(typeof packedPublic.invokeInstalledDefinition, "function");
  for (const legacy of [
    "applyRootPublicInvocation",
    "createRootOperationContext",
    "parseRootPublicInvocation",
  ]) {
    assert.equal(legacy in packedPublic, false);
  }

  const definitionKey = Object.freeze({
    operationId: "abg.operation.workspace.create",
    memberKey: "clean",
  });
  const basis = Object.freeze({
    install: admittedInstall.value,
    artifactTruth: admittedInstall.artifactTruth,
    verifiedProduct,
    resolvedLock,
    definitionKey,
  });
  const call = callWithKey(definitionKey);
  const [sourceResult, packedResult] = await Promise.all([
    sourcePublic.invokeInstalledDefinition(basis, call),
    packedPublic.invokeInstalledDefinition(basis, call),
  ]);
  assert.deepEqual(packedResult, sourceResult);
  assert.equal(sourceResult.kind, "definition_host_receipt");
  assert.equal(sourceResult.exitCode, 70);
  assert.equal(sourceResult.ownerOutput, null);
  assert.equal(sourceResult.resources, null);
  assert.equal(sourceResult.failure.failureKind, "typed_execution_fault");
  assert.equal(sourceResult.failure.fault.faultBoundary, "pre_acquisition_or_pre_append");
  assert.equal(sourceResult.failure.fault.stage, "call_admission");
  assert.equal(sourceResult.failure.fault.code, "call_identity_mismatch");
  assert.equal(sourceResult.failure.fault.resourceReceipt, null);

  const synchronousThrowCall = {
    invocation: exactWorkspaceInvocation(
      sourcePublic,
      packedProduct,
      Object.freeze({
        targetRoot: join(scratch, "projection-cause-workspace"),
        createPolicy: "clean",
        scaffoldPolicy: "none",
      }),
    ),
    get resources() {
      throw new Error("injected synchronous callable admission failure");
    },
  };
  const synchronousThrowHost = await packedPublic.invokeInstalledDefinition(
    basis,
    synchronousThrowCall,
  );
  assert.equal(synchronousThrowHost.kind, "definition_host_receipt");
  assert.equal(synchronousThrowHost.exitCode, 70);
  assert.equal(synchronousThrowHost.resources, null);
  assert.equal(
    synchronousThrowHost.failure.failureKind,
    "defect_or_interruption",
  );
  assert.match(
    synchronousThrowHost.failure.cause,
    /injected synchronous callable admission failure/u,
  );

  const requestPath = join(scratch, "request.jsonl");
  await writeFile(requestPath, `${JSON.stringify({
    kind: "abg_cli_transport_request",
    schemaVersion: "5.0.0",
    bindingBasis: basis,
    call,
  })}\n`, "utf8");
  const cliRun = await execFileAsync(
    process.execPath,
    [
      join(installed.installedRoot, "build/code/src/public/cli.js"),
      "--jsonl",
      requestPath,
    ],
    { encoding: "utf8" },
  ).catch((error) => error);
  assert.equal(cliRun.code, 70, cliRun.stderr);
  assert.equal(cliRun.stderr, "");
  assert.deepEqual(JSON.parse(cliRun.stdout), sourceResult);
});
