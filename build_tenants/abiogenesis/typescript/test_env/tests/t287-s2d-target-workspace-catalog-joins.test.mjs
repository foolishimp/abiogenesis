import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import * as Effect from "effect/Effect";

import {
  constructWorkspaceAuthorityBasis,
  createWorkspace,
  reconstructWorkspaceManifest,
  sha256Canonical,
  buildGraphFunctionCatalog,
  CATALOG_DEFINITION_BINDINGS,
  WORKSPACE_DEFINITION_BINDINGS,
} from "../../build/code/src/product/index.js";
import {
  constructConsensusModulePublication,
  constructHelloWorldModulePublication,
  HELLO_WORLD_IDS,
} from "../../build/code/src/gtl/index.js";
import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import {
  importInstalledPackageExport,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const actorRef = "actor://abiogenesis/t287/s2d";
const actor = Object.freeze({
  ref: actorRef,
  digest: sha256Canonical({ actorRef }),
});
const attribution = Object.freeze({
  ref: "actor-attribution://abiogenesis/t287/s2d/create",
  digest: "sha256:dc6b59d8e48a8c91a6ec09cdaf2b3788e1fd5c1d899e664f8d94038c2ff26b5c",
});

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function createPacket(targetRoot, overrides = {}) {
  return {
    kind: "workspace_create_packet",
    schemaVersion: "5.0.0",
    memberKey: "clean",
    targetRoot,
    scaffoldPolicy: "none",
    actor,
    actorAttribution: attribution,
    ...overrides,
  };
}

function createDefinitionCall(targetRoot, supplied = {}) {
  const actorAuthority = supplied.actorAuthority ?? {
    actor,
    attribution,
  };
  return {
    invocation: {
      definitionKey: {
        operationId: "abg.operation.workspace.create",
        memberKey: "clean",
      },
      request: {
        createPolicy: "clean",
        scaffoldPolicy: "none",
        targetRoot,
      },
      invocationAuthority: {
        slots: { actor: actorAuthority },
      },
    },
    resources: supplied.resources ?? {
      kind: "workspace_resource_assertion",
      schemaVersion: "5.0.0",
      targetRoot,
      targetRootDigest: sha256Canonical({
        kind: "workspace_target",
        targetRoot,
      }),
    },
  };
}

test("T-287 S2D refuses crossed target authority preimages before workspace effect", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-s2d-target-"));
  context.after(() => rm(scratch, { force: true, recursive: true }));
  const targetRoot = join(scratch, "target");

  const created = await createWorkspace(createPacket(targetRoot));
  assert.equal(created.kind, "workspace_create_result", JSON.stringify(created));
  if (created.kind !== "workspace_create_result") return;
  assert.deepEqual(created.manifest.actor, actor);
  assert.deepEqual(created.manifest.actorAttribution, attribution);

  const basis = constructWorkspaceAuthorityBasis({
    workspaceManifest: created.manifest,
  });
  assert.equal(basis.kind, "workspace_authority_basis", JSON.stringify(basis));
  if (basis.kind !== "workspace_authority_basis") return;
  assert.equal(basis.authorizedActorRef, actor.ref);
  assert.equal(basis.actorAttributionRef, attribution.ref);
  assert.equal(basis.authorityManifestRef, created.manifest.workspaceRef);
  assert.equal(basis.authorityManifestDigest, created.manifest.workspaceDigest);

  const crossed = [
    ["caller actor", (value) => { value.actor.ref += "/caller"; }],
    ["caller attribution", (value) => { value.actorAttribution.ref += "/caller"; }],
    ["crossed target root", (value) => { value.canonicalRoot += "/crossed"; }],
    ["crossed authority actor", (value) => {
      value.authorityBasis.authorizedActorRef += "/crossed";
    }],
    ["crossed attribution", (value) => {
      value.authorityBasis.actorAttributionDigest =
        `sha256:${"0".repeat(64)}`;
    }],
  ];
  for (const [label, mutate] of crossed) {
    const candidate = structuredClone(created.manifest);
    mutate(candidate);
    assert.equal(reconstructWorkspaceManifest(candidate), null, label);
    assert.equal(
      constructWorkspaceAuthorityBasis({ workspaceManifest: candidate }).kind,
      "environment_refusal",
      label,
    );
  }

  for (const [label, packet] of [
    ["caller-minted actor", createPacket(join(scratch, "caller-actor"), {
      actor: { ...actor, digest: `sha256:${"1".repeat(64)}` },
    })],
    ["malformed attribution", createPacket(join(scratch, "malformed-attribution"), {
      actorAttribution: { ...attribution, digest: "not-a-digest" },
    })],
  ]) {
    const refused = await createWorkspace(packet);
    assert.equal(refused.kind, "workspace_operation_refusal", label);
    assert.equal(await exists(packet.targetRoot), false, label);
  }

  // No wide/free authority input can reconstruct the target Actor transition.
  assert.equal(constructWorkspaceAuthorityBasis({
    workspaceId: created.manifest.workspaceRef,
    canonicalRoot: created.manifest.canonicalRoot,
    authorityMode: "trusted_developer",
    authorizedActorRef: actor.ref,
    authorityManifestRef: created.manifest.workspaceRef,
    authorityManifestDigest: created.manifest.workspaceDigest,
  }).kind, "environment_refusal");
});

test("T-287 S2D create binding preserves only the admitted Actor attribution", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-s2d-owner-"));
  context.after(() => rm(scratch, { force: true, recursive: true }));
  const targetRoot = join(scratch, "target");
  const created = await Effect.runPromise(
    WORKSPACE_DEFINITION_BINDINGS.create.clean(createDefinitionCall(targetRoot)),
  );
  assert.equal(created.ownerOutput.outcomeKind, "result");
  assert.equal(created.resources.manifest === null, false);

  const falsifiers = [
    ["crossed actor", createDefinitionCall(join(scratch, "crossed-actor"), {
      actorAuthority: {
        actor: { ...actor, ref: `${actor.ref}/crossed` },
        attribution,
      },
    })],
    ["crossed attribution", createDefinitionCall(join(scratch, "crossed-attribution"), {
      actorAuthority: {
        actor,
        attribution: { ...attribution, digest: "not-a-digest" },
      },
    })],
    ["crossed resource root", createDefinitionCall(join(scratch, "crossed-root"), {
      resources: {
        kind: "workspace_resource_assertion",
        schemaVersion: "5.0.0",
        targetRoot: join(scratch, "other-root"),
        targetRootDigest: sha256Canonical({
          kind: "workspace_target",
          targetRoot: join(scratch, "other-root"),
        }),
      },
    })],
  ];
  for (const [label, call] of falsifiers) {
    const fault = await Effect.runPromise(Effect.flip(
      WORKSPACE_DEFINITION_BINDINGS.create.clean(call),
    ));
    assert.equal(fault.stage, "resource_admission", label);
    assert.equal(await exists(call.invocation.request.targetRoot), false, label);
  }
});

test("T-287 S2D catalog refuses rival rows and view lacks no-causal-basis escape", async (context) => {
  const scratch = await mkdtemp(join(tmpdir(), "abi5-s2d-catalog-"));
  context.after(() => rm(scratch, { force: true, recursive: true }));
  const untouched = join(scratch, "no-append-or-view-write");
  const artifact = {
    productId: "product://abiogenesis/t287/s2d@5",
    artifactDigest: `sha256:${"1".repeat(64)}`,
    productContentDigest: `sha256:${"2".repeat(64)}`,
    productManifestDigest: `sha256:${"3".repeat(64)}`,
    packageName: "@abiogenesis/t287-s2d",
    packageVersion: "5.0.0",
  };
  const hello = constructHelloWorldModulePublication(artifact);
  const rival = structuredClone(constructConsensusModulePublication(artifact));
  rival.contributions[0].handle = HELLO_WORLD_IDS.graphFunctionRef;
  const rivalCatalog = buildGraphFunctionCatalog([hello, rival]);
  assert.equal(rivalCatalog.kind, "catalog_construction_refusal");
  assert.equal(rivalCatalog.code, "canonical_handle_collision");

  const noCausalBasis = await Effect.runPromise(Effect.flip(
    CATALOG_DEFINITION_BINDINGS.view.allowlist({
      invocation: {
        definitionKey: {
          operationId: "abg.operation.catalog.view",
          memberKey: "allowlist",
        },
        request: { catalog: { ref: "catalog://forged", digest: `sha256:${"4".repeat(64)}` } },
        invocationAuthority: { slots: {} },
      },
      resources: {
        kind: "catalog_view_resource_assertion",
        schemaVersion: "5.0.0",
        catalog: {},
      },
    }),
  ));
  assert.equal(noCausalBasis.stage, "resource_admission");
  assert.equal(await exists(untouched), false);
});

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product, attributionRef) {
  const actorRef = "actor://abiogenesis/t287/s2d-target";
  return Object.freeze({
    actor: Object.freeze({
      ref: actorRef,
      digest: product.sha256Canonical({ actorRef }),
    }),
    attribution: coordinate(product, attributionRef),
  });
}

function definitionFor(publicApi, operationId, memberKey) {
  const matches = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter(
    (definition) =>
      definition.definitionKey.operationId === operationId &&
      definition.definitionKey.memberKey === memberKey,
  );
  assert.equal(matches.length, 1, `${operationId}#${memberKey}`);
  return matches[0];
}

function authoritySlots(product, definition, supplied = {}) {
  return Object.freeze({
    workspace_binding: null,
    product_set: null,
    dependency_lock: null,
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: Object.freeze({
      requiredCapabilityRefs: [...definition.capabilityRefs],
      grants: [coordinate(
        product,
        `capability-grant://abiogenesis/t287/s2d/${encodeURIComponent(
          `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`,
        )}`,
        { definitionKey: definition.definitionKey },
      )],
    }),
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
    ...supplied,
  });
}

function exactDefinitionCall({
  publicApi,
  product,
  contractCatalog,
  contractCoordinates,
  operationId,
  memberKey,
  ordinal,
  request,
  slots = {},
  resources,
}) {
  const definition = definitionFor(publicApi, operationId, memberKey);
  const operationContracts = contractCoordinates.operations.find(
    (row) => row.operationId === operationId,
  );
  const memberContracts = operationContracts?.members.find(
    (row) => row.memberKey === memberKey,
  );
  assert.ok(memberContracts, `${operationId}#${memberKey} contract coordinates`);
  const admittedSlots = authoritySlots(product, definition, slots);
  const invocationAuthorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots: admittedSlots,
  });
  const invocationAuthority = Object.freeze({
    ...invocationAuthorityBody,
    authorityDigest: product.sha256Canonical(invocationAuthorityBody),
  });
  const invocationContract = Object.freeze({
    contractCatalog,
    flatRow: Object.freeze({
      contractId: "abg.schema.public-operation-invocation",
      contractVersion: "5.0.0",
      contractDigest: publicApi.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest,
    }),
    nestedSelector: Object.freeze({
      selectorKind: "schema_definition",
      definitionKey: null,
      slot: null,
      definitionRef: "#/$defs/PublicInvocation",
    }),
  });
  const requestRef = `request://abiogenesis/t287/s2d/${ordinal}-${memberKey}`;
  const invocationBody = Object.freeze({
    kind: "public_invocation",
    schemaVersion: "5.0.0",
    invocationContract,
    definitionRef: definition.definitionRef,
    definitionVersion: "5.0.0",
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog,
    invocationAuthority,
    requestContract: memberContracts.slots.request,
    requestRef,
    requestDigest: product.sha256Canonical(request),
    request,
    expectedResultContract: memberContracts.slots.result,
    expectedRefusalContract: memberContracts.slots.refusal,
    expectedNonTerminalContract: memberContracts.slots.nonTerminal,
    correlationRef: "correlation://abiogenesis/t287/s2d-target-workspace-catalog",
    eventTime: "2026-08-22T00:00:00.000Z",
    provenanceRefs: ["provenance://abiogenesis/t287/s2d"],
  });
  const invocationDigest = product.sha256Canonical(invocationBody);
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef: `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  });
}

function reopenEventResource(product, closeHandoff) {
  return Object.freeze({
    kind: "reopen_abg_event_resource",
    schemaVersion: "5.0.0",
    closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff),
  });
}

async function runExactTransport(publicApi, call, label) {
  const result = await publicApi.runInstalledDefinitionCallTransport(call);
  assert.equal(result.kind, "installed_definition_call_transport_result", label);
  assert.equal(result.disposition, "owner_completed", `${label}: ${JSON.stringify(result)}`);
  assert.equal(result.receipt.ownerOutput.outcomeKind, "result", label);
  assert.notEqual(result.outcome, null, label);
  return result;
}

test("T-287 S2D exact calls join target workspace bind, catalog admission, and view", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
  });
  const [publicApi, abg, gtl] = await Promise.all([
    importInstalledPackageExport(harness, "@abiogenesis/typescript-tenant/public", "t287-s2d-public"),
    importInstalledPackageExport(harness, "@abiogenesis/typescript-tenant/abg", "t287-s2d-abg"),
    importInstalledPackageExport(harness, "@abiogenesis/typescript-tenant/gtl", "t287-s2d-gtl"),
  ]);
  const product = harness.product;
  const verification = await product.ProductVerificationPort.verify({
    kind: "product_verification_packet",
    schemaVersion: "5.0.0",
    memberKey: "verify",
    targetKind: "packed_artifact",
    request: {
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    },
  });
  assert.equal(verification.kind, "product_verification_success", JSON.stringify(verification));
  if (verification.kind !== "product_verification_success") return;
  const verified = verification.verifiedArtifact;
  const resolvedLock = product.ProductEnvironmentPort.resolve({
    kind: "product_resolution_packet",
    schemaVersion: "5.0.0",
    memberKey: "resolve",
    verifiedArtifacts: [verified],
  });
  assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
  if (resolvedLock.kind !== "resolved_product_lock") return;
  const contractCatalog = Object.freeze({
    productId: verified.productId,
    productContentDigest: verified.productContentDigest,
    catalogId: verified.catalogId,
    catalogVersion: "5.0.0",
    catalogDigest: verified.catalogDigest,
  });
  const contractCoordinates = verified.definitionContractCoordinates;
  assert.ok(contractCoordinates);
  const packedArtifact = Object.freeze({
    kind: "product_verification_artifact_resource",
    schemaVersion: "5.0.0",
    artifactPath: harness.artifactPath,
    artifact: Object.freeze({ ref: verified.artifactRef, digest: verified.artifactDigest }),
    productContent: coordinate(
      product,
      `product-content://abiogenesis/${verified.productContentDigest.slice("sha256:".length)}`,
      { digest: verified.productContentDigest },
    ),
    descriptor: verification.coordinates.descriptor,
    contributionManifest: Object.freeze({
      ref: verified.contributionManifestRef,
      digest: verified.contributionManifestDigest,
    }),
    manifestDigest: verified.manifestDigest,
    productId: verified.productId,
    packageName: verified.packageName,
    packageVersion: verified.packageVersion,
  });
  const lockCoordinate = Object.freeze({ ref: resolvedLock.lockId, digest: resolvedLock.lockDigest });
  const installRoot = join(harness.scratch, "installed-product");
  const installRequest = Object.freeze({
    verifiedArtifact: verification.coordinates.verifiedArtifact,
    descriptor: verification.coordinates.descriptor,
    contributionManifest: packedArtifact.contributionManifest,
    resolvedLock: lockCoordinate,
    targetRoot: installRoot,
    installPolicy: "clean",
  });
  const installCall = exactDefinitionCall({
    publicApi,
    product,
    contractCatalog,
    contractCoordinates,
    operationId: "abg.operation.product.install",
    memberKey: "install",
    ordinal: 1,
    request: installRequest,
    slots: {
      dependency_lock: lockCoordinate,
      verification_references: [Object.freeze({
        invocation: coordinate(product, "invocation://abiogenesis/t287/s2d/verify"),
        outcome: verification.coordinates.verifiedArtifact,
      })],
      actor: actorAuthority(product, "attribution://abiogenesis/t287/s2d/install"),
    },
    resources: Object.freeze({
      kind: "product_install_resource_assertion",
      schemaVersion: "5.0.0",
      eventResource: Object.freeze({
        kind: "new_abg_event_resource",
        schemaVersion: "5.0.0",
        eventLogPath: join(harness.scratch, "s2d.events.jsonl"),
        locatorDigest: product.sha256Canonical({
          kind: "abg_event_log_locator",
          eventLogPath: resolve(harness.scratch, "s2d.events.jsonl"),
        }),
      }),
      packedArtifact,
      verifiedArtifact: verified,
      resolvedLock,
    }),
  });
  const install = await runExactTransport(publicApi, installCall, "product.install");
  const installedTruth = abg.projectAdmittedProductInstallByInvocationRef(
    abg.projectExactPrefixArtifactTruth(install.receipt.resources.eventResource.closeHandoff.prefix),
    installCall.invocation.invocationRef,
  );
  assert.ok(installedTruth, "product.install must expose one exact-prefix projection");

  const workspaceRoot = join(harness.scratch, "target-workspace");
  const createCall = exactDefinitionCall({
    publicApi,
    product,
    contractCatalog,
    contractCoordinates,
    operationId: "abg.operation.workspace.create",
    memberKey: "clean",
    ordinal: 2,
    request: Object.freeze({ createPolicy: "clean", scaffoldPolicy: "none", targetRoot: workspaceRoot }),
    slots: { actor: actorAuthority(product, "attribution://abiogenesis/t287/s2d/create") },
    resources: Object.freeze({
      kind: "workspace_resource_assertion",
      schemaVersion: "5.0.0",
      targetRoot: workspaceRoot,
      targetRootDigest: product.sha256Canonical({ kind: "workspace_target", targetRoot: workspaceRoot }),
    }),
  });
  await runExactTransport(publicApi, createCall, "workspace.create#clean");
  const workspaceManifest = product.reconstructWorkspaceManifest(JSON.parse(
    await readFile(join(workspaceRoot, ".abiogenesis", "workspace-manifest.json"), "utf8"),
  ));
  assert.ok(workspaceManifest, "workspace.create must persist its exact target manifest");
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({ workspaceManifest });
  assert.equal(workspaceAuthority.kind, "workspace_authority_basis", JSON.stringify(workspaceAuthority));
  if (workspaceAuthority.kind !== "workspace_authority_basis") return;
  const roots = Object.freeze({
    toolchainRoot: harness.installedPackageRoot,
    productRoot: installedTruth.install.installedRoot,
    eventLogRoot: join(workspaceRoot, ".abiogenesis", "events"),
    runtimeStateRoot: join(workspaceRoot, ".abiogenesis", "runtime"),
    projectionRoot: join(workspaceRoot, ".abiogenesis", "projections"),
    archiveRoot: join(workspaceRoot, ".abiogenesis", "archive"),
  });
  const rootRows = Object.freeze([
    ["toolchain", "toolchainRoot"],
    ["product", "productRoot"],
    ["event_log", "eventLogRoot"],
    ["runtime_state", "runtimeStateRoot"],
    ["projection", "projectionRoot"],
    ["archive", "archiveRoot"],
  ].map(([rootKind, field]) => ({ rootKind, path: roots[field] })));
  const bindCall = exactDefinitionCall({
    publicApi,
    product,
    contractCatalog,
    contractCoordinates,
    operationId: "abg.operation.workspace.bind",
    memberKey: "bind",
    ordinal: 3,
    request: Object.freeze({
      workspaceAuthority: Object.freeze({
        ref: workspaceAuthority.authorityBasisId,
        digest: workspaceAuthority.authorityBasisDigest,
      }),
      installedSet: [install.receipt.ownerOutput.value.installedProduct],
      resolvedLock: lockCoordinate,
      declaredRoots: rootRows,
    }),
    slots: {
      product_set: [install.receipt.ownerOutput.value.installedProduct],
      dependency_lock: lockCoordinate,
      actor: actorAuthority(product, "attribution://abiogenesis/t287/s2d/bind"),
    },
    resources: Object.freeze({
      kind: "product_workspace_binding_resource_assertion",
      schemaVersion: "5.0.0",
      eventResource: reopenEventResource(product, install.receipt.resources.eventResource.closeHandoff),
      workspaceAuthority,
      workspaceManifest,
      admittedInstalls: [installedTruth.install],
      resolvedLock,
      declaredRoots: roots,
    }),
  });
  const binding = await runExactTransport(publicApi, bindCall, "workspace.bind#bind");
  const bindingTruth = abg.projectAdmittedWorkspaceBindingByInvocationRef(
    abg.projectExactPrefixArtifactTruth(binding.receipt.resources.eventResource.closeHandoff.prefix),
    bindCall.invocation.invocationRef,
    resolvedLock,
  );
  assert.ok(bindingTruth, "workspace.bind must expose one admitted target binding");

  const artifactBasis = Object.freeze({
    productId: harness.candidateBasis.productId,
    artifactDigest: harness.candidateBasis.artifactDigest,
    productContentDigest: harness.candidateBasis.productContentDigest,
    productManifestDigest: harness.candidateBasis.manifestDigest,
    packageName: harness.candidateBasis.packageName,
    packageVersion: harness.candidateBasis.packageVersion,
  });
  const publications = Object.freeze([
    harness.rootPublication,
    gtl.constructConsensusModulePublication(artifactBasis),
  ]);
  const catalogRequest = Object.freeze({
    workspaceBinding: binding.receipt.ownerOutput.value.binding,
    descriptors: [verification.coordinates.descriptor],
    contributionManifests: [packedArtifact.contributionManifest],
    resolvedLock: lockCoordinate,
  });
  const catalogSlots = Object.freeze({
    workspace_binding: binding.receipt.ownerOutput.value.binding,
    product_set: [install.receipt.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate,
    actor: actorAuthority(product, "attribution://abiogenesis/t287/s2d/catalog"),
  });
  const catalogCall = exactDefinitionCall({
    publicApi,
    product,
    contractCatalog,
    contractCoordinates,
    operationId: "abg.operation.catalog.admit",
    memberKey: "admit",
    ordinal: 4,
    request: catalogRequest,
    slots: catalogSlots,
    resources: Object.freeze({
      kind: "catalog_admission_resource_assertion",
      schemaVersion: "5.0.0",
      eventResource: reopenEventResource(product, binding.receipt.resources.eventResource.closeHandoff),
      workspaceBinding: bindingTruth.binding,
      resolvedLock,
      verifiedProducts: [verified],
      admittedInstalls: [installedTruth.install],
      publications,
    }),
  });
  const catalogAdmission = await runExactTransport(publicApi, catalogCall, "catalog.admit#admit");
  assert.deepEqual(
    catalogAdmission.receipt.resources.eventResource.closeHandoff.prefix,
    binding.receipt.resources.eventResource.closeHandoff.prefix,
    "catalog admission is eventless after the admitted target binding",
  );
  const catalog = product.CatalogOperationPort.admit({
    kind: "catalog_admit_packet",
    schemaVersion: "5.0.0",
    memberKey: "admit",
    readinessBasis: {
      workspaceBinding: bindingTruth.candidate,
      resolvedLock,
      verifiedProducts: [verified],
      installedProducts: [installedTruth.candidate],
      publications,
    },
  });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  if (catalog.kind !== "graph_function_catalog") return;
  const allowlist = [catalog.entries[0].handle];
  const viewCall = exactDefinitionCall({
    publicApi,
    product,
    contractCatalog,
    contractCoordinates,
    operationId: "abg.operation.catalog.view",
    memberKey: "allowlist",
    ordinal: 5,
    request: Object.freeze({ catalog: catalogAdmission.receipt.ownerOutput.value.catalog, allowlist }),
    slots: catalogSlots,
    resources: Object.freeze({
      kind: "catalog_view_resource_assertion",
      schemaVersion: "5.0.0",
      catalog,
      admittedCatalog: catalogAdmission.receipt.resources,
    }),
  });
  const view = await runExactTransport(publicApi, viewCall, "catalog.view#allowlist");
  assert.deepEqual(view.receipt.resources.catalog, catalogAdmission.receipt.ownerOutput.value.catalog);
  assert.deepEqual(
    view.receipt.resources,
    (await runExactTransport(publicApi, viewCall, "catalog.view#allowlist replay")).receipt.resources,
    "view remains a pure projection of the admitted catalog receipt",
  );

  const bytesBeforeRefusal = await readFile(join(harness.scratch, "s2d.events.jsonl"));
  const forged = structuredClone(catalogCall);
  forged.invocation.definitionDigest = `sha256:${"0".repeat(64)}`;
  const refusal = await publicApi.runInstalledDefinitionCallTransport(forged);
  assert.equal(refusal.kind, "installed_definition_call_transport_refusal");
  assert.equal(refusal.code, "invalid_definition_call");
  assert.deepEqual(
    await readFile(join(harness.scratch, "s2d.events.jsonl")),
    bytesBeforeRefusal,
    "an exact-DefinitionCall refusal appends no ABG effect",
  );
});
