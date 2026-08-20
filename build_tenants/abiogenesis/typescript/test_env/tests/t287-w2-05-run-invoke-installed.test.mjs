import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  access,
  readFile,
  rename,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

import * as Effect from "effect/Effect";

import {
  importInstalledPackageExport,
  installedCliPackageRoot,
  resolveInstalledPackageExport,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const execFileAsync = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const operationId = "abg.operation.run.invoke";
const sentinel = Object.freeze([
  ["abg.operation.workspace.create#clean", "./product", "WORKSPACE_DEFINITION_BINDINGS", ["create", "clean"]],
  ["abg.operation.workspace.open#open", "./product", "WORKSPACE_DEFINITION_BINDINGS", ["open", "open"]],
  ["abg.operation.product.verify#verify", "./product", "PRODUCT_VERIFICATION_DEFINITION_BINDINGS", ["verify"]],
  ["abg.operation.product.resolve#resolve", "./product", "PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS", ["resolve"]],
  ["abg.operation.product.install#install", "./product", "PRODUCT_INSTALL_DEFINITION_BINDINGS", ["install"]],
  ["abg.operation.workspace.bind#bind", "./product", "PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS", ["bind"]],
  ["abg.operation.catalog.admit#admit", "./product", "CATALOG_DEFINITION_BINDINGS", ["admit"]],
  ["abg.operation.catalog.view#allowlist", "./product", "CATALOG_DEFINITION_BINDINGS", ["view", "allowlist"]],
  ["abg.operation.run.invoke#start", "./product", "RUN_DEFINITION_BINDINGS", ["invoke", "start"]],
  ["abg.operation.project.read#run_status", "./abg", "ABG_PROJECT_READ_DEFINITION_BINDINGS", ["run_status"]],
  ["abg.operation.project.read#run_result", "./abg", "ABG_PROJECT_READ_DEFINITION_BINDINGS", ["run_result"]],
  ["abg.operation.project.read#run_replay", "./abg", "ABG_PROJECT_READ_DEFINITION_BINDINGS", ["run_replay"]],
]);

function keyOf(definition) {
  return `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;
}

function installedSpecifier(packageName, exportPath) {
  return exportPath === "."
    ? packageName
    : `${packageName}${exportPath.slice(1)}`;
}

function valueAtPath(value, path) {
  return path.reduce((selected, part) => selected?.[part], value);
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function contractCoordinate(publicApi, definition, catalog, slot, definitionRef) {
  const asset = publicApi.PUBLIC_PROJECTION_PAYLOADS.operationContractAssets.find(
    (candidate) => candidate.operationId === definition.definitionKey.operationId,
  );
  assert.ok(asset);
  return Object.freeze({
    contractCatalog: catalog,
    flatRow: Object.freeze({
      contractId: definition.definitionKey.operationId,
      contractVersion: schemaVersion,
      contractDigest: asset.contentDigest,
    }),
    nestedSelector: Object.freeze({
      selectorKind: "operation_definition_slot",
      definitionKey: definition.definitionKey,
      slot,
      definitionRef,
    }),
  });
}

function runCall(publicApi, product, memberKey, ordinal) {
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
    (candidate) =>
      candidate.definitionKey.operationId === operationId &&
      candidate.definitionKey.memberKey === memberKey,
  );
  assert.ok(definition);
  const operation = publicApi.PUBLIC_OPERATION_CONTRACT_PROJECTIONS.find(
    (candidate) => candidate.operationId === operationId,
  );
  const member = operation?.definitions.find(
    (candidate) => candidate.definitionKey.memberKey === memberKey,
  );
  assert.ok(member);
  const program = coordinate(product, `program://w2-05/${memberKey}`);
  const catalogView = coordinate(product, `catalog-view://w2-05/${memberKey}`);
  const inputValue = Object.freeze({ admitted: memberKey });
  const inputContract = coordinate(
    product,
    `contract://w2-05/${memberKey}/input`,
  );
  const admittedInput = Object.freeze({
    contract: inputContract,
    valueRef: `value://w2-05/${memberKey}/input`,
    valueDigest: product.sha256Canonical(inputValue),
    value: inputValue,
  });
  const request = memberKey === "invoke"
    ? Object.freeze({
        program,
        catalogHandle: "graph-function://w2-05/direct",
        inputContract,
        input: inputValue,
        catalogView,
        allowlist: Object.freeze([]),
        sourceBasis: Object.freeze({ kind: "none" }),
      })
    : Object.freeze({
        program,
        scope: "program",
        target: Object.freeze({ kind: "next" }),
        until: "converged",
        catalogView,
        allowlist: Object.freeze([]),
        input: admittedInput,
        fhMode: "direct",
        rootMode: "supervised",
        sourceBasis: Object.freeze({ kind: "none" }),
      });
  const slots = Object.freeze({
    workspace_binding: coordinate(product, `workspace-binding://w2-05/${memberKey}`),
    product_set: Object.freeze([coordinate(product, `product-set://w2-05/${memberKey}`)]),
    dependency_lock: coordinate(product, `product-lock://w2-05/${memberKey}`),
    catalog_scope: Object.freeze({
      catalog: coordinate(product, `catalog://w2-05/${memberKey}`),
      view: catalogView,
      allowlist: Object.freeze([]),
    }),
    execution_program: program,
    graph_function: memberKey === "invoke"
      ? Object.freeze({
          graphFunction: coordinate(product, "graph-function://w2-05/direct"),
          membership: coordinate(product, "program-membership://w2-05/direct"),
        })
      : null,
    input_contract: admittedInput,
    session_policy: coordinate(product, `session-policy://w2-05/${memberKey}`),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...definition.capabilityRefs]),
      grants: Object.freeze([coordinate(product, `capability-grant://w2-05/${memberKey}`)]),
    }),
    actor: Object.freeze({
      actor: coordinate(product, `actor://w2-05/${memberKey}`),
      attribution: coordinate(product, `attribution://w2-05/${memberKey}`),
    }),
    transport_steering: coordinate(product, `transport-steering://w2-05/${memberKey}`),
    verification_references: null,
    execution_basis: null,
  });
  const invocationAuthority = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    authorityDigest: product.sha256Canonical(slots),
    slots,
  });
  const catalog = Object.freeze({
    productId: "product://abiogenesis/typescript-tenant@5",
    productContentDigest: product.sha256Canonical({ product: "run-binding-proof" }),
    catalogId: "catalog://abiogenesis/public-contracts@5",
    catalogVersion: schemaVersion,
    catalogDigest: product.sha256Canonical({ catalog: "run-binding-proof" }),
  });
  const invocationRef =
    `invocation://abiogenesis/t287/w2-05/${String(ordinal).padStart(2, "0")}-${memberKey}`;
  const requestDigest = product.sha256Canonical(request);
  return Object.freeze({
    kind: "public_invocation",
    schemaVersion,
    invocationContract: Object.freeze({
      contractCatalog: catalog,
      flatRow: Object.freeze({
        contractId: "abg.schema.public-operation-invocation",
        contractVersion: schemaVersion,
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
    invocationRef,
    invocationDigest: product.sha256Canonical({
      definitionKey: definition.definitionKey,
      definitionDigest: definition.definitionDigest,
      invocationRef,
      requestDigest,
      authorityDigest: invocationAuthority.authorityDigest,
    }),
    definitionRef: definition.definitionRef,
    definitionVersion: schemaVersion,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog: catalog,
    invocationAuthority,
    requestContract: contractCoordinate(
      publicApi,
      definition,
      catalog,
      "request",
      member.requestContract.definitionRef,
    ),
    requestRef: `${invocationRef}/request`,
    requestDigest,
    request,
    expectedResultContract: contractCoordinate(
      publicApi,
      definition,
      catalog,
      "result",
      member.resultContract.definitionRef,
    ),
    expectedRefusalContract: contractCoordinate(
      publicApi,
      definition,
      catalog,
      "refusal",
      member.refusalContract.definitionRef,
    ),
    expectedNonTerminalContract: contractCoordinate(
      publicApi,
      definition,
      catalog,
      "non_terminal",
      member.nonTerminalContract.definitionRef,
    ),
    correlationRef: `correlation://abiogenesis/t287/w2-05/${memberKey}`,
    eventTime: "2026-08-20T00:00:00.000Z",
    provenanceRefs: Object.freeze([
      "provenance://abiogenesis/t287/w2-05-worker",
    ]),
  });
}

function newEventResource(product, eventLogPath) {
  return Object.freeze({
    kind: "new_abg_event_resource",
    schemaVersion,
    eventLogPath,
    locatorDigest: product.sha256Canonical({
      kind: "abg_event_log_locator",
      eventLogPath: resolve(eventLogPath),
    }),
  });
}

function reopenEventResource(product, closeHandoff, handoffDigest) {
  return Object.freeze({
    kind: "reopen_abg_event_resource",
    schemaVersion,
    closeHandoff,
    handoffDigest: handoffDigest ?? product.sha256Canonical(closeHandoff),
  });
}

function runResources(product, eventResource) {
  const eventLogPath = eventResource.kind === "new_abg_event_resource"
    ? eventResource.eventLogPath
    : eventResource.closeHandoff.reopenAuthority.eventLogPath;
  const root = dirname(eventLogPath);
  const basisDigest = product.sha256Canonical({ catalog: "unadmitted" });
  const bindingDigest = product.sha256Canonical({ binding: "unadmitted" });
  const readinessBasisDigest = product.sha256Canonical({ readiness: "unadmitted" });
  const lockDigest = product.sha256Canonical({ lock: "unadmitted" });
  const productSetDigest = product.sha256Canonical({ productSet: "unadmitted" });
  const workspaceBinding = Object.freeze({
    kind: "workspace_binding_candidate",
    schemaVersion,
    bindingId: "workspace-binding://w2-05/unadmitted",
    bindingDigest,
    workspaceId: "workspace://w2-05/unadmitted",
    authorityBasisId: "workspace-authority://w2-05/unadmitted",
    authorityBasisDigest: product.sha256Canonical({ authority: "unadmitted" }),
    authorizedActorRef: "actor://w2-05/unadmitted",
    productSetId: "product-set://w2-05/unadmitted",
    productSetDigest,
    lockId: "product-lock://w2-05/unadmitted",
    lockDigest,
    roots: Object.freeze({
      toolchainRoot: root,
      productRoot: root,
      eventLogRoot: root,
      runtimeStateRoot: root,
      projectionRoot: root,
      archiveRoot: root,
    }),
  });
  return Object.freeze({
    kind: "run_invocation_resource_assertion",
    schemaVersion,
    eventResource,
    catalog: Object.freeze({
      kind: "graph_function_catalog",
      schemaVersion,
      basisDigest,
      publicationDigests: Object.freeze([]),
      entries: Object.freeze([]),
      byHandle: Object.freeze({}),
      declarationEntries: Object.freeze([]),
      declarationsByHandle: Object.freeze({}),
      readinessBasisDigest,
      workspaceBindingId: workspaceBinding.bindingId,
      workspaceBindingDigest: bindingDigest,
      lockId: workspaceBinding.lockId,
      lockDigest,
      productSetId: workspaceBinding.productSetId,
      productSetDigest,
      readinessBasis: Object.freeze({
        workspaceBinding,
        resolvedLock: Object.freeze({
          kind: "resolved_product_lock",
          schemaVersion,
          lockId: workspaceBinding.lockId,
          lockDigest,
          nativeContractClosureDigest: product.sha256Canonical({ native: "unadmitted" }),
          rows: Object.freeze([]),
          dependencyEdges: Object.freeze([]),
        }),
        verifiedProducts: Object.freeze([]),
        installedProducts: Object.freeze([]),
        publications: Object.freeze([]),
      }),
      boundPublications: Object.freeze([]),
      rowDispositions: Object.freeze([]),
    }),
    catalogView: Object.freeze({
      kind: "graph_function_catalog_view",
      catalogBasisDigest: basisDigest,
      allowlist: Object.freeze([]),
      entries: Object.freeze([]),
      byHandle: Object.freeze({}),
      declarationEntries: Object.freeze([]),
      declarationsByHandle: Object.freeze({}),
      viewDigest: product.sha256Canonical({ view: "unadmitted" }),
    }),
    applications: Object.freeze([]),
    source: Object.freeze({ kind: "none" }),
  });
}

function callWithResources(invocation, resources) {
  return Object.freeze({ invocation, resources });
}

function wrongPrefixHandoff(product, closeHandoff) {
  const wrongPrefixDigest = product.sha256Bytes("wrong-prefix-byte");
  const prefixBody = Object.freeze({
    kind: closeHandoff.prefix.kind,
    schemaVersion: closeHandoff.prefix.schemaVersion,
    eventLogRef: closeHandoff.prefix.eventLogRef,
    prefixLength: 1,
    prefixDigest: wrongPrefixDigest,
    storeIdentity: closeHandoff.prefix.storeIdentity,
  });
  const reopenAuthorityBody = Object.freeze({
    kind: closeHandoff.reopenAuthority.kind,
    schemaVersion: closeHandoff.reopenAuthority.schemaVersion,
    eventLogPath: closeHandoff.reopenAuthority.eventLogPath,
    device: closeHandoff.reopenAuthority.device,
    inode: closeHandoff.reopenAuthority.inode,
    eventLogDigest: wrongPrefixDigest,
    durableByteLength: 1,
    eventContractDigest: closeHandoff.reopenAuthority.eventContractDigest,
  });
  return Object.freeze({
    prefix: Object.freeze({
      ...prefixBody,
      coordinateDigest: product.sha256Canonical(prefixBody),
    }),
    reopenAuthority: Object.freeze({
      ...reopenAuthorityBody,
      authorityDigest: product.sha256Canonical(reopenAuthorityBody),
    }),
  });
}

async function faultOf(program) {
  return Effect.runPromise(Effect.flip(program));
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

test("W2-05 packed run.invoke bindings are exact, source-blind, and close one prefix", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
  });
  const [publicApi, product] = await Promise.all([
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/public",
      "w2-05-run-binding-public",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/product",
      "w2-05-run-binding-product",
    ),
  ]);
  assert.equal(harness.packageJson.dependencies.effect, "3.22.1");
  assert.equal(harness.packageJson.dependencies.valibot, "1.4.2");
  const installedRoot = installedCliPackageRoot(harness);
  const runManifestRows =
    harness.candidateManifest.publicContractCatalog.rows.filter(
      (row) => row.contractId === operationId,
    );
  assert.equal(runManifestRows.length, 1);
  const runManifestRow = runManifestRows[0];
  assert.equal(
    runManifestRow.assetLocator.path,
    "contracts/public-operations/run/invoke/operation-contract.json",
  );
  const runContractPath = resolve(
    installedRoot,
    runManifestRow.assetLocator.path,
  );
  const runContractRelation = relative(installedRoot, runContractPath);
  assert.equal(
    runContractRelation === ".." || runContractRelation.startsWith(`..${sep}`),
    false,
  );
  assert.equal(isAbsolute(runContractRelation), false);
  const runContractBytes = await readFile(runContractPath);
  assert.equal(
    product.sha256Bytes(runContractBytes),
    runManifestRow.assetLocator.contentDigest,
  );
  assert.equal(
    runManifestRow.contractDigest,
    runManifestRow.assetLocator.contentDigest,
  );
  const installedRunContract = JSON.parse(runContractBytes.toString("utf8"));
  assert.equal(installedRunContract.operationId, operationId);
  assert.equal(installedRunContract.definitions.length, 2);
  for (const serialized of installedRunContract.definitions) {
    const live = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
      (definition) => keyOf(definition) === keyOf(serialized),
    );
    assert.ok(live, keyOf(serialized));
    assert.equal(live.definitionDigest, serialized.definitionDigest);
    assert.deepEqual(
      live.executionBindingSpecification,
      serialized.executionBindingSpecification,
    );
    assert.equal(
      live.executionBindingSpecificationDigest,
      product.sha256Canonical(live.executionBindingSpecification),
    );
  }

  assert.deepEqual(
    sentinel.map(([key]) => key),
    [
      "abg.operation.workspace.create#clean",
      "abg.operation.workspace.open#open",
      "abg.operation.product.verify#verify",
      "abg.operation.product.resolve#resolve",
      "abg.operation.product.install#install",
      "abg.operation.workspace.bind#bind",
      "abg.operation.catalog.admit#admit",
      "abg.operation.catalog.view#allowlist",
      "abg.operation.run.invoke#start",
      "abg.operation.project.read#run_status",
      "abg.operation.project.read#run_result",
      "abg.operation.project.read#run_replay",
    ],
  );
  const installedModules = new Map();
  for (const [key, exportPath, namedExport, memberPath] of sentinel) {
    const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(
      (candidate) => keyOf(candidate) === key,
    );
    assert.ok(definition, key);
    const callable = definition.executionBindingSpecification.callable;
    assert.equal(callable.packageName, "@abiogenesis/typescript-tenant", key);
    assert.equal(callable.packageExportPath, exportPath, key);
    assert.equal(callable.namedExport, namedExport, key);
    assert.deepEqual(callable.memberPath, memberPath, key);
    assert.equal(callable.ownerAuthorityRef, definition.semanticAuthorityRef, key);
    assert.match(callable.callableContractDigest, /^sha256:[0-9a-f]{64}$/u, key);
    const specifier = installedSpecifier(
      callable.packageName,
      exportPath,
    );
    let loaded = installedModules.get(specifier);
    if (loaded === undefined) {
      loaded = await importInstalledPackageExport(
        harness,
        specifier,
        `w2-05-sentinel=${encodeURIComponent(specifier)}`,
      );
      installedModules.set(specifier, loaded);
    }
    assert.equal(
      typeof valueAtPath(loaded[namedExport], memberPath),
      "function",
      key,
    );
  }

  const runDefinitions = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions
    .filter((definition) => definition.definitionKey.operationId === operationId)
    .sort((left, right) =>
      left.definitionKey.memberKey.localeCompare(right.definitionKey.memberKey)
    );
  assert.deepEqual(
    runDefinitions.map((definition) => ({
      memberKey: definition.definitionKey.memberKey,
      definitionDigest: definition.definitionDigest,
      packageName: definition.executionBindingSpecification.callable.packageName,
      packageExportPath:
        definition.executionBindingSpecification.callable.packageExportPath,
      namedExport: definition.executionBindingSpecification.callable.namedExport,
      memberPath: definition.executionBindingSpecification.callable.memberPath,
      callableContractDigest:
        definition.executionBindingSpecification.callable.callableContractDigest,
    })),
    [
      {
        memberKey: "invoke",
        definitionDigest: "sha256:754dd3a0c571272f6d1679e1b04634e9df0ea569383a99554207f97b3ea357ec",
        packageName: "@abiogenesis/typescript-tenant",
        packageExportPath: "./product",
        namedExport: "RUN_DEFINITION_BINDINGS",
        memberPath: ["invoke", "invoke"],
        callableContractDigest: "sha256:f9fa3fa0faffe2facafa5ad712c251d8e31df126d35e5371a1a79e401b4c9629",
      },
      {
        memberKey: "start",
        definitionDigest: "sha256:36c98e15de1559f311710c6d7b23a70aebddb64804fd164ab75e0a6046d3bfd1",
        packageName: "@abiogenesis/typescript-tenant",
        packageExportPath: "./product",
        namedExport: "RUN_DEFINITION_BINDINGS",
        memberPath: ["invoke", "start"],
        callableContractDigest: "sha256:d06a48cb77631fbea6e9550848b4fcbd8aadb477af6de8ecc8f99ac72327b4fc",
      },
    ],
  );
  assert.deepEqual(Object.keys(product.RUN_DEFINITION_BINDINGS), ["invoke"]);
  assert.deepEqual(
    Object.keys(product.RUN_DEFINITION_BINDINGS.invoke).sort(),
    ["invoke", "start"],
  );
  assert.equal(product.RUN_INVOCATION_DEFINITION_BINDINGS, undefined);
  const invoke = product.RUN_DEFINITION_BINDINGS.invoke.invoke;
  const start = product.RUN_DEFINITION_BINDINGS.invoke.start;

  const invokeInvocation = runCall(publicApi, product, "invoke", 1);
  const startInvocation = runCall(publicApi, product, "start", 2);
  const invokeLog = join(harness.scratch, "run-invoke-binding.events.jsonl");
  const startLog = join(harness.scratch, "run-start-binding.events.jsonl");
  const invokeResult = await Effect.runPromise(invoke(callWithResources(
    invokeInvocation,
    runResources(product, newEventResource(product, invokeLog)),
  )));
  const startResult = await Effect.runPromise(start(callWithResources(
    startInvocation,
    runResources(product, newEventResource(product, startLog)),
  )));
  for (const [label, result, eventLogPath] of [
    ["invoke", invokeResult, invokeLog],
    ["start", startResult, startLog],
  ]) {
    assert.equal(result.ownerOutput.outcomeKind, "refusal", label);
    assert.equal(result.ownerOutput.value.code, "invalid_program", label);
    assert.equal(result.resources.eventResource.entryPrefix.prefixLength, 0, label);
    assert.equal(
      result.resources.eventResource.closeHandoff.prefix.prefixLength,
      0,
      label,
    );
    assert.equal((await readFile(eventLogPath)).length, 0, label);
  }

  const malformedPath = join(harness.scratch, "malformed-resource.events.jsonl");
  const malformedResources = Object.freeze({
    ...runResources(product, newEventResource(product, malformedPath)),
    unexpected: true,
  });
  const malformedFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    malformedResources,
  )));
  assert.equal(malformedFault.code, "invalid_resource_assertion");
  assert.equal(await exists(malformedPath), false);

  const malformedCatalogPath = join(
    harness.scratch,
    "malformed-catalog.events.jsonl",
  );
  const structurallyValidResources = runResources(
    product,
    newEventResource(product, malformedCatalogPath),
  );
  const malformedCatalogFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    Object.freeze({
      ...structurallyValidResources,
      catalog: Object.freeze({
        ...structurallyValidResources.catalog,
        unexpected: true,
      }),
    }),
  )));
  assert.equal(malformedCatalogFault.code, "invalid_resource_assertion");
  assert.equal(await exists(malformedCatalogPath), false);

  const crossInvokePath = join(harness.scratch, "cross-invoke.events.jsonl");
  const crossStartPath = join(harness.scratch, "cross-start.events.jsonl");
  const invokeCoordinateFault = await faultOf(invoke(callWithResources(
    startInvocation,
    runResources(product, newEventResource(product, crossInvokePath)),
  )));
  const startCoordinateFault = await faultOf(start(callWithResources(
    invokeInvocation,
    runResources(product, newEventResource(product, crossStartPath)),
  )));
  assert.equal(invokeCoordinateFault.code, "call_identity_mismatch");
  assert.equal(startCoordinateFault.code, "call_identity_mismatch");
  assert.equal(await exists(crossInvokePath), false);
  assert.equal(await exists(crossStartPath), false);

  const closeHandoff = invokeResult.resources.eventResource.closeHandoff;
  const originalBytes = await readFile(invokeLog);
  const forgedDigestFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    runResources(
      product,
      reopenEventResource(product, closeHandoff, `sha256:${"f".repeat(64)}`),
    ),
  )));
  assert.equal(forgedDigestFault.stage, "resource_acquisition");
  assert.equal(forgedDigestFault.code, "invalid_handoff");
  assert.deepEqual(await readFile(invokeLog), originalBytes);

  const wrongPrefix = wrongPrefixHandoff(product, closeHandoff);
  assert.equal(wrongPrefix.prefix.prefixLength, 1);
  assert.equal(wrongPrefix.reopenAuthority.durableByteLength, 1);
  assert.notEqual(
    wrongPrefix.prefix.coordinateDigest,
    closeHandoff.prefix.coordinateDigest,
  );
  const wrongPrefixFault = await faultOf(invoke(callWithResources(
    invokeInvocation,
    runResources(product, reopenEventResource(product, wrongPrefix)),
  )));
  assert.equal(wrongPrefixFault.stage, "resource_acquisition");
  assert.equal(wrongPrefixFault.code, "acquisition_refused");
  assert.deepEqual(
    await readFile(invokeLog),
    originalBytes,
    "wrong exact prefix admission does not duplicate an append",
  );

  const installedProductTarget = await resolveInstalledPackageExport(
    harness,
    "@abiogenesis/typescript-tenant/product",
  );
  const targetRelation = relative(installedRoot, installedProductTarget);
  assert.notEqual(targetRelation, "");
  assert.equal(targetRelation === ".." || targetRelation.startsWith(`..${sep}`), false);
  assert.equal(isAbsolute(targetRelation), false);
  assert.equal(installedProductTarget.startsWith(packageRoot), false);

  const probe = [
    "const module = await import('@abiogenesis/typescript-tenant/product');",
    "console.log(typeof module.RUN_DEFINITION_BINDINGS?.invoke?.start);",
  ].join("\n");
  const present = await execFileAsync(
    process.execPath,
    ["--input-type=module", "--eval", probe],
    {
      cwd: harness.cliHost,
      env: { ...process.env, NODE_OPTIONS: "" },
      maxBuffer: 1024 * 1024,
    },
  );
  assert.equal(present.stdout.trim(), "function");
  const heldTarget = `${installedProductTarget}.source-blind-held`;
  await rename(installedProductTarget, heldTarget);
  try {
    await assert.rejects(
      execFileAsync(
        process.execPath,
        ["--input-type=module", "--eval", probe],
        {
          cwd: harness.cliHost,
          env: { ...process.env, NODE_OPTIONS: "" },
          maxBuffer: 1024 * 1024,
        },
      ),
      (error) => {
        assert.match(String(error.stderr), /ERR_MODULE_NOT_FOUND|Cannot find module/u);
        return true;
      },
    );
  } finally {
    await rename(heldTarget, installedProductTarget);
  }
});
