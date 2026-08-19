import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import * as Effect from "effect/Effect";

import { expectedVerificationIdentity } from
  "../support/candidate-basis.mjs";
import {
  importInstalledPackageExport,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const selectedAdditions = Object.freeze([
  "abg.operation.catalog.admit#admit",
  "abg.operation.catalog.apply#node_type",
  "abg.operation.catalog.apply#overlay",
  "abg.operation.catalog.view#allowlist",
  "abg.operation.conformance.evaluate#gtl_program",
  "abg.operation.product.install#install",
  "abg.operation.project.read#catalog_describe",
  "abg.operation.project.read#catalog_list",
  "abg.operation.project.read#install_evidence",
  "abg.operation.project.read#release_evidence",
  "abg.operation.project.read#ticket_consensus",
  "abg.operation.project.read#workspace_status",
]);
const remainingKeys = Object.freeze([
  "abg.operation.interaction.respond#answer_escalation",
  "abg.operation.interaction.respond#approve",
  "abg.operation.interaction.respond#assess",
  "abg.operation.interaction.respond#reject",
  "abg.operation.interaction.respond#select",
  "abg.operation.product.materialize#configuration",
  "abg.operation.product.materialize#context_bootstrap",
  "abg.operation.result.assess#assess",
  "abg.operation.run.continue#current_intent",
  "abg.operation.run.continue#selected_action",
  "abg.operation.run.invoke#invoke",
  "abg.operation.run.invoke#start",
  "abg.operation.witness.admit#attest",
  "abg.operation.witness.admit#hygiene-stamp",
  "abg.operation.witness.admit#intake",
  "abg.operation.witness.admit#reprice",
  "abg.operation.witness.admit#run-resumed",
  "abg.operation.witness.admit#run-stopped",
]);
let admittedContractCatalog = null;
let admittedDefinitionContractCoordinates = null;

function keyOf(definition) {
  return `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product) {
  return Object.freeze({
    actor: coordinate(product, "actor://abiogenesis/t287/w2-05-worker"),
    attribution: coordinate(
      product,
      "attribution://abiogenesis/t287/w2-05-worker",
    ),
  });
}

function capabilityAuthority(product, definition) {
  return Object.freeze({
    requiredCapabilityRefs: [...definition.capabilityRefs],
    grants: [coordinate(
      product,
      `capability-grant://abiogenesis/t287/${encodeURIComponent(keyOf(definition))}`,
      { definitionKey: definition.definitionKey },
    )],
  });
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
    capability_grants: capabilityAuthority(product, definition),
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
    ...supplied,
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

function definitionCall({
  publicApi,
  product,
  operationId,
  memberKey,
  ordinal,
  request,
  slots = {},
  resources,
}) {
  const definition = definitionFor(publicApi, operationId, memberKey);
  const invocationRef =
    `invocation://abiogenesis/t287/w2-05/${String(ordinal).padStart(2, "0")}-${memberKey}`;
  const requestDigest = product.sha256Canonical(request);
  const admittedSlots = authoritySlots(product, definition, slots);
  const invocationAuthority = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    authorityDigest: product.sha256Canonical(admittedSlots),
    slots: admittedSlots,
  });
  const invocationDigest = product.sha256Canonical({
    definitionKey: definition.definitionKey,
    definitionDigest: definition.definitionDigest,
    invocationRef,
    requestDigest,
    authorityDigest: invocationAuthority.authorityDigest,
  });
  assert.ok(admittedContractCatalog, "installed contract catalog admitted");
  assert.ok(
    admittedDefinitionContractCoordinates,
    "installed definition contract coordinates admitted",
  );
  const operationContracts =
    admittedDefinitionContractCoordinates.operations.find((row) =>
      row.operationId === operationId
    );
  const memberContracts = operationContracts?.members.find((row) =>
    row.memberKey === memberKey
  );
  assert.ok(memberContracts, `${operationId}#${memberKey} contract coordinates`);
  const invocationContract = Object.freeze({
    contractCatalog: admittedContractCatalog,
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
  });
  return Object.freeze({
    invocation: Object.freeze({
      kind: "public_invocation",
      schemaVersion,
      invocationContract,
      invocationRef,
      invocationDigest,
      definitionRef: definition.definitionRef,
      definitionVersion: schemaVersion,
      definitionDigest: definition.definitionDigest,
      definitionKey: definition.definitionKey,
      contractCatalog: admittedContractCatalog,
      invocationAuthority,
      requestContract: memberContracts.slots.request,
      requestRef: `${invocationRef}/request`,
      requestDigest,
      request,
      expectedResultContract: memberContracts.slots.result,
      expectedRefusalContract: memberContracts.slots.refusal,
      expectedNonTerminalContract: memberContracts.slots.nonTerminal,
      correlationRef: "correlation://abiogenesis/t287/w2-05-owner-chain",
      eventTime: "2026-08-18T00:00:00.000Z",
      provenanceRefs: ["provenance://abiogenesis/t287/w2-05-worker"],
    }),
    resources,
  });
}

function rehashInvocation(product, call) {
  call.invocation.requestDigest = product.sha256Canonical(
    call.invocation.request,
  );
  call.invocation.invocationAuthority.authorityDigest =
    product.sha256Canonical(call.invocation.invocationAuthority.slots);
  call.invocation.invocationDigest = product.sha256Canonical({
    definitionKey: call.invocation.definitionKey,
    definitionDigest: call.invocation.definitionDigest,
    invocationRef: call.invocation.invocationRef,
    requestDigest: call.invocation.requestDigest,
    authorityDigest: call.invocation.invocationAuthority.authorityDigest,
  });
  return call;
}

async function runBinding(binding, call, label) {
  const value = await Effect.runPromise(binding(call));
  assert.equal(
    value.ownerOutput.outcomeKind,
    "result",
    `${label}: ${JSON.stringify(value.ownerOutput)}`,
  );
  return value;
}

function reopenEventResource(product, closeHandoff) {
  return Object.freeze({
    kind: "reopen_abg_event_resource",
    schemaVersion,
    closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff),
  });
}

function installedSpecifier(packageName, packageExportPath) {
  return packageExportPath === "."
    ? packageName
    : `${packageName}${packageExportPath.slice(1)}`;
}

async function installedCallableCensus(harness, publicApi, product) {
  const modules = new Map();
  const rows = [];
  for (const definition of publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions) {
    const callable = definition.executionBindingSpecification.callable;
    const specifier = installedSpecifier(
      callable.packageName,
      callable.packageExportPath,
    );
    let loaded = modules.get(specifier);
    if (loaded === undefined) {
      loaded = await importInstalledPackageExport(
        harness,
        specifier,
        `w2-05-census=${encodeURIComponent(specifier)}`,
      );
      modules.set(specifier, loaded);
    }
    let value = loaded[callable.namedExport];
    for (const member of callable.memberPath) value = value?.[member];
    rows.push(Object.freeze({
      definitionKey: keyOf(definition),
      packageExportPath: callable.packageExportPath,
      namedExport: callable.namedExport,
      memberPath: [...callable.memberPath],
      callable: typeof value === "function",
    }));
  }
  const report = Object.freeze({
    kind: "installed_owner_callable_census",
    schemaVersion,
    familyRef: publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.familyRef,
    familyDigest: publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.familyDigest,
    definitionCount: rows.length,
    callableCount: rows.filter((row) => row.callable).length,
    rows,
  });
  return Object.freeze({
    report,
    censusSha256: product.sha256Bytes(
      `${rows.filter((row) => row.callable).map((row) => row.definitionKey).join("\n")}\n`,
    ),
  });
}

test("W2-05 installed Product install and catalog owners compose without catalog runtime truth", async (context) => {
  const harness = await setupInstalledCliHarness(context, packageRoot, {
    candidateBasisSource: "packed_artifact",
  });
  const [publicApi, abg, gtl, validator] = await Promise.all([
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/public",
      "w2-05-public",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/abg",
      "w2-05-abg",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/gtl",
      "w2-05-gtl",
    ),
    importInstalledPackageExport(
      harness,
      "@abiogenesis/typescript-tenant/validator",
      "w2-05-validator",
    ),
  ]);
  const product = harness.product;

  const census = await installedCallableCensus(
    harness,
    publicApi,
    product,
  );
  const loadedKeys = census.report.rows
    .filter((row) => row.callable)
    .map(({ definitionKey }) => definitionKey)
    .sort();
  const missingKeys = census.report.rows
    .filter((row) => !row.callable)
    .map(({ definitionKey }) => definitionKey)
    .sort();
  assert.equal(census.report.definitionCount, 56);
  assert.equal(census.report.callableCount, 38);
  assert.deepEqual(missingKeys, remainingKeys);
  assert.deepEqual(
    loadedKeys.filter((key) => selectedAdditions.includes(key)),
    selectedAdditions,
  );
  assert.equal(loadedKeys.filter((key) => !selectedAdditions.includes(key)).length, 26);
  assert.equal(
    product.sha256Bytes(
      `${census.report.rows
        .filter((row) => row.callable && !selectedAdditions.includes(row.definitionKey))
        .map((row) => row.definitionKey)
        .join("\n")}\n`,
    ),
    "sha256:3791684da16f7aefa96eafd293eab1742b57e95008e0052dbc21fd7a8b2dce92",
  );

  const verificationPacket = Object.freeze({
    kind: "product_verification_packet",
    schemaVersion,
    memberKey: "verify",
    targetKind: "packed_artifact",
    request: Object.freeze({
      artifactPath: harness.artifactPath,
      artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis),
    }),
  });
  const ownerVerification = await product.ProductVerificationPort.verify(
    verificationPacket,
  );
  assert.equal(
    ownerVerification.kind,
    "product_verification_success",
    JSON.stringify(ownerVerification),
  );
  const verified = ownerVerification.verifiedArtifact;
  assert.ok(verified.definitionContractCoordinates);
  admittedContractCatalog = Object.freeze({
    productId: verified.productId,
    productContentDigest: verified.productContentDigest,
    catalogId: verified.catalogId,
    catalogVersion: schemaVersion,
    catalogDigest: verified.catalogDigest,
  });
  admittedDefinitionContractCoordinates =
    verified.definitionContractCoordinates;
  const packedArtifact = Object.freeze({
    kind: "product_verification_artifact_resource",
    schemaVersion,
    artifactPath: harness.artifactPath,
    artifact: Object.freeze({
      ref: verified.artifactRef,
      digest: verified.artifactDigest,
    }),
    productContent: Object.freeze({
      ref: `product-content://abiogenesis/${verified.productContentDigest.slice("sha256:".length)}`,
      digest: verified.productContentDigest,
    }),
    descriptor: ownerVerification.coordinates.descriptor,
    contributionManifest: Object.freeze({
      ref: verified.contributionManifestRef,
      digest: verified.contributionManifestDigest,
    }),
    manifestDigest: verified.manifestDigest,
    productId: verified.productId,
    packageName: verified.packageName,
    packageVersion: verified.packageVersion,
  });
  const verifyRequest = Object.freeze({
    targetKind: "packed_artifact",
    artifact: packedArtifact.artifact,
    productContent: packedArtifact.productContent,
    descriptor: packedArtifact.descriptor,
    contributionManifest: packedArtifact.contributionManifest,
    declaredDependencies: verified.declaredDependencies,
    compatibilityInputs: verified.compatibilityRefs.map((compatibilityRef) => ({
      compatibilityRef,
      subjectRef: packedArtifact.productContent.ref,
    })),
  });
  assert.deepEqual(verifyRequest.artifact, packedArtifact.artifact);
  assert.deepEqual(
    ownerVerification.coordinates.verifiedArtifact,
    {
      ref: verified.verificationRef,
      digest: verified.verificationDigest,
    },
  );

  const resolvedLock = product.ProductEnvironmentPort.resolve({
    kind: "product_resolution_packet",
    schemaVersion,
    memberKey: "resolve",
    verifiedArtifacts: [verified],
  });
  assert.equal(
    resolvedLock.kind,
    "resolved_product_lock",
    JSON.stringify(resolvedLock),
  );
  const lockCoordinate = Object.freeze({
    ref: resolvedLock.lockId,
    digest: resolvedLock.lockDigest,
  });
  const verificationReference = Object.freeze({
    invocation: coordinate(
      product,
      "invocation://abiogenesis/t287/w2-05/01-verify",
      verifyRequest,
    ),
    outcome: ownerVerification.coordinates.verifiedArtifact,
  });

  const eventLogPath = join(harness.scratch, "w2-05-owner-chain.events.jsonl");
  const installedRoot = join(harness.scratch, "installed-product");
  const installRequest = Object.freeze({
    verifiedArtifact: ownerVerification.coordinates.verifiedArtifact,
    descriptor: ownerVerification.coordinates.descriptor,
    contributionManifest: packedArtifact.contributionManifest,
    resolvedLock: lockCoordinate,
    targetRoot: installedRoot,
    installPolicy: "clean",
  });
  const installCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.product.install",
    memberKey: "install",
    ordinal: 3,
    request: installRequest,
    slots: {
      dependency_lock: lockCoordinate,
      verification_references: [verificationReference],
      actor: actorAuthority(product),
    },
    resources: Object.freeze({
      kind: "product_install_resource_assertion",
      schemaVersion,
      eventResource: Object.freeze({
        kind: "new_abg_event_resource",
        schemaVersion,
        eventLogPath,
        locatorDigest: product.sha256Canonical({
          kind: "abg_event_log_locator",
          eventLogPath: resolve(eventLogPath),
        }),
      }),
      packedArtifact,
      verifiedArtifact: verified,
      resolvedLock,
    }),
  });
  const install = await runBinding(
    product.PRODUCT_INSTALL_DEFINITION_BINDINGS.install,
    installCall,
    "product.install",
  );
  assert.equal(install.ownerOutput.value.disposition, "materialized");
  let artifactTruth = abg.projectExactPrefixArtifactTruth(
    install.resources.eventResource.closeHandoff.prefix,
  );
  assert.equal(
    artifactTruth.kind,
    "exact_prefix_artifact_truth_projection",
    JSON.stringify(artifactTruth),
  );
  assert.equal(artifactTruth.rows.length, 1);
  const installedTruth = abg.projectAdmittedProductInstallByInvocationRef(
    artifactTruth,
    installCall.invocation.invocationRef,
  );
  assert.ok(installedTruth);
  assert.deepEqual(
    install.ownerOutput.value.installedProduct,
    install.resources.installedProduct,
  );

  const workspaceRoot = join(harness.scratch, "workspace");
  await mkdir(workspaceRoot);
  const workspaceCreation = await product.WorkspaceOperationPort.create({
    kind: "workspace_create_packet",
    schemaVersion,
    memberKey: "clean",
    targetRoot: workspaceRoot,
    scaffoldPolicy: "none",
  });
  assert.equal(
    workspaceCreation.kind,
    "workspace_create_result",
    JSON.stringify(workspaceCreation),
  );
  const workspaceManifest = workspaceCreation.manifest;
  const authorityManifest = Object.freeze({
    workspaceId: workspaceManifest.workspaceRef,
    canonicalRoot: workspaceManifest.canonicalRoot,
    authorityMode: "trusted_developer",
    authorizedActorRef: "actor://abiogenesis/t287/w2-05-worker",
  });
  const workspaceAuthority = product.constructWorkspaceAuthorityBasis({
    ...authorityManifest,
    authorityManifestRef: "manifest://abiogenesis/t287/w2-05/workspace-authority",
    authorityManifestDigest: product.sha256Canonical(authorityManifest),
  });
  assert.equal(
    workspaceAuthority.kind,
    "workspace_authority_basis",
    JSON.stringify(workspaceAuthority),
  );
  const declaredRoots = Object.freeze({
    toolchainRoot: harness.installedPackageRoot,
    productRoot: installedTruth.install.installedRoot,
    eventLogRoot: dirname(eventLogPath),
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  });
  const rootKindByField = Object.freeze([
    ["toolchain", "toolchainRoot"],
    ["product", "productRoot"],
    ["event_log", "eventLogRoot"],
    ["runtime_state", "runtimeStateRoot"],
    ["projection", "projectionRoot"],
    ["archive", "archiveRoot"],
  ]);
  const workspaceAuthorityCoordinate = Object.freeze({
    ref: workspaceAuthority.authorityBasisId,
    digest: workspaceAuthority.authorityBasisDigest,
  });
  const bindRequest = Object.freeze({
    workspaceAuthority: workspaceAuthorityCoordinate,
    installedSet: [install.ownerOutput.value.installedProduct],
    resolvedLock: lockCoordinate,
    declaredRoots: rootKindByField.map(([rootKind, field]) => ({
      rootKind,
      path: declaredRoots[field],
    })),
  });
  const bindCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.workspace.bind",
    memberKey: "bind",
    ordinal: 4,
    request: bindRequest,
    slots: {
      product_set: [install.ownerOutput.value.installedProduct],
      dependency_lock: lockCoordinate,
      actor: actorAuthority(product),
    },
    resources: Object.freeze({
      kind: "product_workspace_binding_resource_assertion",
      schemaVersion,
      eventResource: reopenEventResource(
        product,
        install.resources.eventResource.closeHandoff,
      ),
      workspaceAuthority,
      admittedInstalls: [installedTruth.install],
      resolvedLock,
      declaredRoots,
    }),
  });
  const binding = await runBinding(
    product.PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS.bind,
    bindCall,
    "workspace.bind",
  );
  artifactTruth = abg.projectExactPrefixArtifactTruth(
    binding.resources.eventResource.closeHandoff.prefix,
  );
  assert.equal(artifactTruth.rows.length, 2);
  const workspaceTruth = abg.projectAdmittedWorkspaceBindingByInvocationRef(
    artifactTruth,
    bindCall.invocation.invocationRef,
    resolvedLock,
  );
  assert.ok(workspaceTruth);
  const prefixBeforeCatalog = await readFile(eventLogPath);

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
  assert.deepEqual(
    publications.map(product.modulePublicationSemanticDigest).sort(),
    verified.contributionManifest.publicationBindings
      .map(({ publicationDigest }) => publicationDigest)
      .sort(),
  );
  const catalogRequest = Object.freeze({
    workspaceBinding: binding.ownerOutput.value.binding,
    descriptors: [ownerVerification.coordinates.descriptor],
    contributionManifests: [packedArtifact.contributionManifest],
    resolvedLock: lockCoordinate,
  });
  const catalogResources = Object.freeze({
    kind: "catalog_admission_resource_assertion",
    schemaVersion,
    eventResource: reopenEventResource(
      product,
      binding.resources.eventResource.closeHandoff,
    ),
    workspaceBinding: workspaceTruth.binding,
    resolvedLock,
    verifiedProducts: [verified],
    admittedInstalls: [installedTruth.install],
    publications,
  });
  const catalogSlots = Object.freeze({
    workspace_binding: binding.ownerOutput.value.binding,
    product_set: [install.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate,
    actor: actorAuthority(product),
  });
  const catalogCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.catalog.admit",
    memberKey: "admit",
    ordinal: 5,
    request: catalogRequest,
    slots: catalogSlots,
    resources: catalogResources,
  });
  const admittedCatalog = await runBinding(
    product.CATALOG_DEFINITION_BINDINGS.admit,
    catalogCall,
    "catalog.admit",
  );
  assert.equal(admittedCatalog.ownerOutput.value.rows.length, 35);
  assert.deepEqual(
    admittedCatalog.resources.eventResource.closeHandoff.prefix,
    binding.resources.eventResource.closeHandoff.prefix,
  );
  const independentlyReconstructedCatalog = await runBinding(
    product.CATALOG_DEFINITION_BINDINGS.admit,
    definitionCall({
      publicApi,
      product,
      operationId: "abg.operation.catalog.admit",
      memberKey: "admit",
      ordinal: 6,
      request: structuredClone(catalogRequest),
      slots: structuredClone(catalogSlots),
      resources: structuredClone(catalogResources),
    }),
    "catalog.admit independently reconstructed",
  );
  assert.deepEqual(
    independentlyReconstructedCatalog.ownerOutput,
    admittedCatalog.ownerOutput,
  );

  const readinessBasis = Object.freeze({
    workspaceBinding: workspaceTruth.candidate,
    resolvedLock,
    verifiedProducts: [verified],
    installedProducts: [installedTruth.candidate],
    publications,
  });
  const catalog = product.CatalogOperationPort.admit({
    kind: "catalog_admit_packet",
    schemaVersion,
    memberKey: "admit",
    readinessBasis,
  });
  assert.equal(catalog.kind, "graph_function_catalog", JSON.stringify(catalog));
  assert.deepEqual(
    admittedCatalog.ownerOutput.value.catalog,
    admittedCatalog.resources.catalog,
  );
  const nodeRow = catalog.declarationEntries.find(
    ({ declarationKind }) => declarationKind === "node_type",
  );
  const overlayRow = catalog.declarationEntries.find(
    ({ declarationKind }) => declarationKind === "overlay",
  );
  assert.ok(nodeRow);
  assert.ok(overlayRow);
  const allowlist = [nodeRow.handle, overlayRow.handle].sort();
  const viewRequest = Object.freeze({
    catalog: admittedCatalog.ownerOutput.value.catalog,
    allowlist,
  });
  const viewCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.catalog.view",
    memberKey: "allowlist",
    ordinal: 7,
    request: viewRequest,
    slots: catalogSlots,
    resources: Object.freeze({
      kind: "catalog_view_resource_assertion",
      schemaVersion,
      catalog: structuredClone(catalog),
    }),
  });
  const narrowed = await runBinding(
    product.CATALOG_DEFINITION_BINDINGS.view.allowlist,
    viewCall,
    "catalog.view",
  );
  const view = product.CatalogOperationPort.constructView({
    kind: "catalog_view_packet",
    schemaVersion,
    memberKey: "allowlist",
    catalog: structuredClone(catalog),
    allowlist: structuredClone(allowlist),
  });
  assert.equal(view.kind, "graph_function_catalog_view", JSON.stringify(view));
  assert.deepEqual(narrowed.ownerOutput.value.effectiveHandles, view.allowlist);

  const catalogScope = Object.freeze({
    catalog: admittedCatalog.ownerOutput.value.catalog,
    view: narrowed.ownerOutput.value.view,
    allowlist,
  });
  const applicationSlots = Object.freeze({
    ...catalogSlots,
    catalog_scope: catalogScope,
  });
  const workspaceCatalogSlots = Object.freeze({
    workspace_binding: binding.ownerOutput.value.binding,
    product_set: [install.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate,
    catalog_scope: admittedCatalog.ownerOutput.value.catalog,
  });
  const environmentReadSlots = Object.freeze({
    workspace_binding: binding.ownerOutput.value.binding,
    product_set: [install.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate,
  });
  const applicationBasis = coordinate(
    product,
    "catalog-application-basis://abiogenesis/t287/w2-05",
  );
  const validationReceipt = coordinate(
    product,
    "product-validation-receipt://abiogenesis/t287/w2-05",
  );
  const contributor = coordinate(
    product,
    "product-contributor://abiogenesis/t287/w2-05",
  );
  const nodeTarget = coordinate(
    product,
    publications[1].programs[0].programRef,
    publications[1].programs[0],
  );
  const applicationRequest = (memberKey, row, target) => Object.freeze({
    applicationKind: memberKey,
    catalogRow: Object.freeze({ ref: row.handle, digest: row.entryDigest }),
    catalogView: narrowed.ownerOutput.value.view,
    declaration: Object.freeze({
      ref: row.declarationOrContractRef,
      digest: row.entryDigest,
    }),
    target,
    applicationBasis,
    validationReceipt,
    contributor,
  });
  const apply = async (memberKey, row, target, ordinal) => {
    const request = applicationRequest(memberKey, row, target);
    return runBinding(
      product.CATALOG_DEFINITION_BINDINGS.apply[memberKey],
      definitionCall({
        publicApi,
        product,
        operationId: "abg.operation.catalog.apply",
        memberKey,
        ordinal,
        request,
        slots: applicationSlots,
        resources: Object.freeze({
          kind: "catalog_application_resource_assertion",
          schemaVersion,
          catalog: structuredClone(catalog),
          catalogRow: structuredClone(row),
          catalogView: structuredClone(view),
          applicationBasis,
          validationReceipt,
          contributor,
        }),
      }),
      `catalog.apply#${memberKey}`,
    );
  };
  const nodeApplication = await apply("node_type", nodeRow, nodeTarget, 8);
  const overlayApplication = await apply("overlay", overlayRow, null, 9);
  assert.deepEqual(nodeApplication.ownerOutput.value.target, nodeTarget);
  assert.equal(overlayApplication.ownerOutput.value.target, null);
  assert.notEqual(
    nodeApplication.ownerOutput.value.application.digest,
    overlayApplication.ownerOutput.value.application.digest,
  );

  const projectionBasis = (memberKey, value) => Object.freeze({
    basisRef: `projection-basis://abiogenesis/t287/w2-05/${memberKey}`,
    basisDigest: product.sha256Canonical(value),
    value: Object.freeze(value),
  });
  const readResources = (packet, additional = {}) => Object.freeze({
    kind: "product_project_read_resource_assertion",
    schemaVersion,
    packet: Object.freeze(packet),
    ...additional,
  });
  const readRequest = (caseKey, sourceKind, source, basis, selector) =>
    Object.freeze({
      caseKey,
      source: Object.freeze({
        sourceKind,
        sourceRef: source.ref,
        sourceDigest: source.digest,
      }),
      projectionBasis: Object.freeze({
        projectionBasisRef: basis.basisRef,
        projectionBasisDigest: basis.basisDigest,
      }),
      selector,
    });

  const catalogBasis = projectionBasis("catalog", {
    catalog: admittedCatalog.ownerOutput.value.catalog,
  });
  const catalogListRequest = readRequest(
    "catalog_list",
    "catalog",
    admittedCatalog.ownerOutput.value.catalog,
    catalogBasis,
    Object.freeze({
      kind: "catalog_list",
      visibility: Object.freeze({ kind: "workspace_catalog" }),
    }),
  );
  const catalogListCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.project.read",
    memberKey: "catalog_list",
    ordinal: 20,
    request: catalogListRequest,
    slots: workspaceCatalogSlots,
    resources: readResources({
      kind: "product_project_read_packet",
      schemaVersion,
      memberKey: "catalog_list",
      sourceRef: admittedCatalog.ownerOutput.value.catalog.ref,
      sourceDigest: admittedCatalog.ownerOutput.value.catalog.digest,
      projectionBasis: catalogBasis,
      catalog,
      selector: Object.freeze({
        kind: "catalog_list",
        visibility: Object.freeze({ kind: "workspace_catalog" }),
      }),
    }),
  });
  const catalogListRead = await runBinding(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list,
    catalogListCall,
    "project.read#catalog_list",
  );
  assert.equal(catalogListRead.ownerOutput.value.projection.rows.length, 35);

  const sessionViewCoordinate = Object.freeze({
    ref: `graph-function-catalog-view://abiogenesis/${
      view.viewDigest.slice("sha256:".length)
    }`,
    digest: view.viewDigest,
  });
  const sessionCatalogSlots = Object.freeze({
    ...workspaceCatalogSlots,
    catalog_scope: Object.freeze({
      catalog: admittedCatalog.ownerOutput.value.catalog,
      view: sessionViewCoordinate,
      allowlist,
    }),
  });
  const sessionCatalogListCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.project.read",
    memberKey: "catalog_list",
    ordinal: 201,
    request: readRequest(
      "catalog_list",
      "catalog",
      admittedCatalog.ownerOutput.value.catalog,
      catalogBasis,
      Object.freeze({
        kind: "catalog_list",
        visibility: Object.freeze({
          kind: "session_view",
          view: sessionViewCoordinate,
        }),
      }),
    ),
    slots: sessionCatalogSlots,
    resources: readResources({
      kind: "product_project_read_packet",
      schemaVersion,
      memberKey: "catalog_list",
      sourceRef: admittedCatalog.ownerOutput.value.catalog.ref,
      sourceDigest: admittedCatalog.ownerOutput.value.catalog.digest,
      projectionBasis: catalogBasis,
      catalog,
      selector: Object.freeze({
        kind: "catalog_list",
        visibility: Object.freeze({ kind: "session_view", view }),
      }),
    }),
  });
  const sessionCatalogList = await runBinding(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list,
    sessionCatalogListCall,
    "project.read#catalog_list session view",
  );
  assert.equal(
    sessionCatalogList.ownerOutput.value.projection.rows.length,
    allowlist.length,
  );

  const describedHandle = catalogListRead.ownerOutput.value.projection.rows[0].handle;
  const catalogDescribeCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.project.read",
    memberKey: "catalog_describe",
    ordinal: 21,
    request: readRequest(
      "catalog_describe",
      "catalog",
      admittedCatalog.ownerOutput.value.catalog,
      catalogBasis,
      Object.freeze({
        kind: "catalog_describe",
        handle: describedHandle,
        visibilityBasis: admittedCatalog.ownerOutput.value.catalog,
      }),
    ),
    slots: workspaceCatalogSlots,
    resources: readResources({
      kind: "product_project_read_packet",
      schemaVersion,
      memberKey: "catalog_describe",
      sourceRef: admittedCatalog.ownerOutput.value.catalog.ref,
      sourceDigest: admittedCatalog.ownerOutput.value.catalog.digest,
      projectionBasis: catalogBasis,
      catalog,
      selector: Object.freeze({
        kind: "catalog_describe",
        handle: describedHandle,
        visibility: Object.freeze({ kind: "workspace_catalog" }),
      }),
    }),
  });
  const catalogDescription = await runBinding(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_describe,
    catalogDescribeCall,
    "project.read#catalog_describe",
  );
  assert.equal(
    catalogDescription.ownerOutput.value.projection.handle,
    describedHandle,
  );

  const productSet = product.constructProductSet(
    [installedTruth.install],
    resolvedLock,
  );
  assert.equal(productSet.kind, "product_set", JSON.stringify(productSet));
  const workspaceBasis = projectionBasis("workspace_status", {
    binding: binding.ownerOutput.value.binding,
  });
  const workspaceStatusCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.project.read",
    memberKey: "workspace_status",
    ordinal: 22,
    request: readRequest(
      "workspace_status",
      "workspace_binding",
      binding.ownerOutput.value.binding,
      workspaceBasis,
      Object.freeze({ kind: "none" }),
    ),
    slots: environmentReadSlots,
    resources: readResources({
      kind: "product_project_read_packet",
      schemaVersion,
      memberKey: "workspace_status",
      sourceRef: binding.ownerOutput.value.binding.ref,
      sourceDigest: binding.ownerOutput.value.binding.digest,
      projectionBasis: workspaceBasis,
      binding: workspaceTruth.binding,
      resolvedLock,
      productSet,
      configurationCoordinates: Object.freeze([]),
      catalogCoordinate: admittedCatalog.ownerOutput.value.catalog,
      selector: Object.freeze({ kind: "none" }),
    }, { artifactTruth, workspaceManifest }),
  });
  const workspaceStatus = await runBinding(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.workspace_status,
    workspaceStatusCall,
    "project.read#workspace_status",
  );
  assert.equal(workspaceStatus.ownerOutput.value.projection.readiness, "ready");

  const installSource = Object.freeze({
    ref: installedTruth.install.installId,
    digest: product.sha256Canonical(installedTruth.install),
  });
  const manifestValue = Object.freeze(JSON.parse(await readFile(
    join(installedTruth.install.installedRoot, "product-toolchain-manifest.json"),
    "utf8",
  )));
  const manifest = Object.freeze({
    manifestRef: install.resources.installManifest.ref,
    manifestDigest: install.resources.installManifest.digest,
    value: manifestValue,
  });
  const installBasis = projectionBasis("install_evidence", {
    install: installSource,
  });
  const installEvidenceCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.project.read",
    memberKey: "install_evidence",
    ordinal: 23,
    request: readRequest(
      "install_evidence",
      "installed_product",
      installSource,
      installBasis,
      Object.freeze({
        kind: "install_manifest",
        manifest: Object.freeze({
          ref: manifest.manifestRef,
          digest: manifest.manifestDigest,
        }),
      }),
    ),
    resources: readResources({
      kind: "product_project_read_packet",
      schemaVersion,
      memberKey: "install_evidence",
      sourceRef: installSource.ref,
      sourceDigest: installSource.digest,
      projectionBasis: installBasis,
      install: installedTruth.install,
      selector: Object.freeze({ kind: "install_manifest", manifest }),
    }, { artifactTruth }),
  });
  const installEvidence = await runBinding(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.install_evidence,
    installEvidenceCall,
    "project.read#install_evidence",
  );
  assert.deepEqual(
    installEvidence.ownerOutput.value.projection.manifest,
    installEvidenceCall.invocation.request.selector.manifest,
  );

  const releaseSource = coordinate(
    product,
    "release-cut://abiogenesis/t287/w2-05/unavailable",
  );
  const releaseBasis = projectionBasis("release_evidence", {
    releaseCut: releaseSource,
  });
  const releaseManifestValue = Object.freeze({
    kind: "unavailable_release_snapshot_manifest",
    releaseCut: releaseSource,
  });
  const releaseManifest = Object.freeze({
    manifestRef: "manifest://abiogenesis/t287/w2-05/unavailable",
    manifestDigest: product.sha256Canonical(releaseManifestValue),
    value: releaseManifestValue,
  });
  const releaseManifestCoordinate = Object.freeze({
    ref: releaseManifest.manifestRef,
    digest: releaseManifest.manifestDigest,
  });
  const releaseEvidenceCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.project.read",
    memberKey: "release_evidence",
    ordinal: 24,
    request: readRequest(
      "release_evidence",
      "release_cut",
      releaseSource,
      releaseBasis,
      Object.freeze({
        kind: "release_snapshot_manifest",
        manifest: releaseManifestCoordinate,
      }),
    ),
    resources: readResources({
      kind: "product_project_read_packet",
      schemaVersion,
      memberKey: "release_evidence",
      sourceRef: releaseSource.ref,
      sourceDigest: releaseSource.digest,
      projectionBasis: releaseBasis,
      releaseSnapshotRefusal: Object.freeze({
        kind: "release_snapshot_refusal",
        schemaVersion,
        disposition: "refused",
        memberKey: "qualify",
        code: "wrong_subject_kind",
        message: "no immutable release cut is published",
        requestedIdentity: null,
        qualificationBasisRef: null,
        qualificationBasisDigest: null,
        lawBasisRef: null,
        lawBasisDigest: null,
        verdictRef: null,
        verdictDigest: null,
      }),
      selector: Object.freeze({ kind: "release_snapshot_unavailable" }),
    }, { releaseManifest }),
  });
  const releaseEvidence = await Effect.runPromise(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.release_evidence(
      releaseEvidenceCall,
    ),
  );
  assert.equal(releaseEvidence.ownerOutput.outcomeKind, "refusal");
  assert.equal(releaseEvidence.ownerOutput.value.code, "not_ready");

  const unavailableRunId = "run://abiogenesis/t287/w2-05/not-issued";
  const unavailableGraphCallId =
    "graph-call://abiogenesis/t287/w2-05/not-issued";
  const unavailableRunTruth = abg.projectRunTruthAtDurablePrefix(
    artifactTruth.prefix,
    unavailableRunId,
  );
  assert.equal(unavailableRunTruth.kind, "abg_run_truth_refusal");
  assert.equal(unavailableRunTruth.code, "target_absent");
  const unavailableConsensusSource = coordinate(
    product,
    "consensus-result://abiogenesis/t287/w2-05/not-issued",
  );
  const unavailableConsensusBasis = projectionBasis("ticket_consensus", {
    requestedSource: unavailableConsensusSource,
  });
  const unavailableTicketSelector = Object.freeze({
    kind: "ticket_consensus",
    ticket: coordinate(product, "ticket://abiogenesis/T-287"),
    outputAuthority: coordinate(
      product,
      "result://abiogenesis/t287/w2-05/not-issued",
    ),
    replayBasis: coordinate(
      product,
      "replay://abiogenesis/t287/w2-05/not-issued",
    ),
  });
  const unavailableTicketPacket = Object.freeze({
    kind: "product_project_read_packet",
    schemaVersion,
    memberKey: "ticket_consensus",
    sourceRef: unavailableConsensusSource.ref,
    sourceDigest: unavailableConsensusSource.digest,
    projectionBasis: unavailableConsensusBasis,
    selector: unavailableTicketSelector,
  });
  assert.equal("consensusResult" in unavailableTicketPacket, false);
  const ticketConsensusUnavailableCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.project.read",
    memberKey: "ticket_consensus",
    ordinal: 25,
    request: readRequest(
      "ticket_consensus",
      "consensus_result",
      unavailableConsensusSource,
      unavailableConsensusBasis,
      unavailableTicketSelector,
    ),
    slots: environmentReadSlots,
    resources: readResources(unavailableTicketPacket, {
      artifactTruth,
      runtime: Object.freeze({
        prefix: artifactTruth.prefix,
        runId: unavailableRunId,
        graphCallId: unavailableGraphCallId,
      }),
    }),
  });
  const ticketDefinition = definitionFor(
    publicApi,
    "abg.operation.project.read",
    "ticket_consensus",
  );
  assert.equal(
    keyOf(ticketDefinition),
    "abg.operation.project.read#ticket_consensus",
  );
  assert.deepEqual(
    ticketConsensusUnavailableCall.invocation.definitionKey,
    ticketDefinition.definitionKey,
  );
  const ticketConsensusUnavailableFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.ticket_consensus(
      ticketConsensusUnavailableCall,
    ),
  ));
  assert.equal(
    ticketConsensusUnavailableFault.kind,
    "definition_execution_fault",
  );
  assert.equal(ticketConsensusUnavailableFault.stage, "resource_admission");
  assert.equal(
    ticketConsensusUnavailableFault.code,
    "resource_relation_mismatch",
  );
  assert.equal(
    ticketConsensusUnavailableFault.message,
    "ticket consensus packet differs from the public source, basis, or selector coordinates",
  );

  const forgedCatalogBasisCall = structuredClone(catalogListCall);
  forgedCatalogBasisCall.invocation.request.projectionBasis.projectionBasisDigest =
    product.sha256Canonical({ forged: "projection-basis" });
  const forgedCatalogBasisFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list(
      forgedCatalogBasisCall,
    ),
  ));
  assert.equal(forgedCatalogBasisFault.kind, "definition_execution_fault");
  assert.equal(forgedCatalogBasisFault.stage, "resource_admission");

  const forbiddenCatalogActorCall = rehashInvocation(
    product,
    structuredClone(catalogListCall),
  );
  forbiddenCatalogActorCall.invocation.invocationAuthority.slots.actor =
    actorAuthority(product);
  rehashInvocation(product, forbiddenCatalogActorCall);
  const forbiddenCatalogActorFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list(
      forbiddenCatalogActorCall,
    ),
  ));
  assert.equal(forbiddenCatalogActorFault.code, "call_identity_mismatch");

  const missingCatalogScopeCall = structuredClone(catalogListCall);
  missingCatalogScopeCall.invocation.invocationAuthority.slots.catalog_scope =
    null;
  rehashInvocation(product, missingCatalogScopeCall);
  const missingCatalogScopeFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list(
      missingCatalogScopeCall,
    ),
  ));
  assert.equal(missingCatalogScopeFault.code, "call_identity_mismatch");

  const forgedDefinitionCall = structuredClone(catalogListCall);
  forgedDefinitionCall.invocation.definitionRef =
    `${forgedDefinitionCall.invocation.definitionRef}/unrelated`;
  const forgedDefinitionFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list(
      forgedDefinitionCall,
    ),
  ));
  assert.equal(forgedDefinitionFault.code, "call_identity_mismatch");

  for (const authorityKind of ["workspace", "product", "lock"]) {
    const forgedAuthorityCall = structuredClone(workspaceStatusCall);
    const slots = forgedAuthorityCall.invocation.invocationAuthority.slots;
    if (authorityKind === "workspace") {
      slots.workspace_binding = coordinate(
        product,
        "workspace-binding://abiogenesis/t287/unrelated",
      );
    } else if (authorityKind === "product") {
      slots.product_set = [coordinate(
        product,
        "product-install://abiogenesis/t287/unrelated",
      )];
    } else {
      slots.dependency_lock = coordinate(
        product,
        "resolved-lock://abiogenesis/t287/unrelated",
      );
    }
    rehashInvocation(product, forgedAuthorityCall);
    const forgedAuthorityFault = await Effect.runPromise(Effect.flip(
      product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.workspace_status(
        forgedAuthorityCall,
      ),
    ));
    assert.equal(
      forgedAuthorityFault.code,
      "resource_relation_mismatch",
      authorityKind,
    );
  }

  const staleWorkspaceCall = structuredClone(workspaceStatusCall);
  staleWorkspaceCall.resources.artifactTruth =
    abg.projectExactPrefixArtifactTruth(
      install.resources.eventResource.closeHandoff.prefix,
    );
  const staleWorkspaceFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.workspace_status(
      staleWorkspaceCall,
    ),
  ));
  assert.equal(staleWorkspaceFault.code, "resource_relation_mismatch");

  const forgedSessionRefCall = structuredClone(sessionCatalogListCall);
  forgedSessionRefCall.invocation.request.selector.visibility.view.ref =
    `${sessionViewCoordinate.ref}/forged`;
  forgedSessionRefCall.invocation.invocationAuthority.slots.catalog_scope.view.ref =
    forgedSessionRefCall.invocation.request.selector.visibility.view.ref;
  rehashInvocation(product, forgedSessionRefCall);
  const forgedSessionRefFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list(
      forgedSessionRefCall,
    ),
  ));
  assert.equal(forgedSessionRefFault.code, "resource_relation_mismatch");

  for (const mismatch of ["ref", "digest"]) {
    const forgedReleaseManifestCall = structuredClone(releaseEvidenceCall);
    if (mismatch === "ref") {
      forgedReleaseManifestCall.resources.releaseManifest.manifestRef +=
        "/forged";
    } else {
      forgedReleaseManifestCall.resources.releaseManifest.manifestDigest =
        product.sha256Canonical({ forged: "release-manifest" });
    }
    const forgedReleaseManifestFault = await Effect.runPromise(Effect.flip(
      product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.release_evidence(
        forgedReleaseManifestCall,
      ),
    ));
    assert.equal(
      forgedReleaseManifestFault.code,
      "resource_relation_mismatch",
      mismatch,
    );
  }

  const conformanceProgram = harness.rootPublication.programs[0];
  assert.ok(conformanceProgram);
  const conformanceProgramCoordinate = Object.freeze({
    ref: conformanceProgram.programRef,
    digest: product.sha256Canonical(conformanceProgram),
  });
  const conformancePublicationCoordinate = Object.freeze({
    ref: harness.rootPublication.moduleRef,
    digest: product.sha256Canonical(harness.rootPublication),
  });
  const consensusPublicationCoordinate = Object.freeze({
    ref: publications[1].moduleRef,
    digest: product.sha256Canonical(publications[1]),
  });
  const conformanceLaw = coordinate(
    product,
    "law://abiogenesis/validator/gtl-program@5",
  );
  const conformanceRequest = Object.freeze({
    program: conformanceProgramCoordinate,
    conformanceLaw,
    inventoryBasis: Object.freeze({
      kind: "declared_inventory",
      inventory: Object.freeze([
        consensusPublicationCoordinate,
        conformancePublicationCoordinate,
      ]),
    }),
  });
  const conformanceCall = definitionCall({
    publicApi,
    product,
    operationId: "abg.operation.conformance.evaluate",
    memberKey: "gtl_program",
    ordinal: 26,
    request: conformanceRequest,
    slots: {
      workspace_binding: binding.ownerOutput.value.binding,
      product_set: [install.ownerOutput.value.installedProduct],
      dependency_lock: lockCoordinate,
      actor: actorAuthority(product),
    },
    resources: Object.freeze({
      kind: "conformance_evaluation_resource_assertion",
      schemaVersion,
      packet: Object.freeze({
        kind: "conformance_evaluate_packet",
        schemaVersion,
        memberKey: "gtl_program",
        publication: harness.rootPublication,
        program: conformanceProgram,
      }),
      conformanceLaw,
      artifactTruth,
      declaredInventory: Object.freeze([
        harness.rootPublication,
        publications[1],
      ]),
    }),
  });
  const conformance = await runBinding(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program,
    conformanceCall,
    "conformance.evaluate#gtl_program",
  );
  assert.ok(["passed", "failed"].includes(conformance.ownerOutput.value.disposition));

  const forgedProgramCall = structuredClone(conformanceCall);
  forgedProgramCall.invocation.request.program.digest = product.sha256Canonical({
    forged: "program",
  });
  rehashInvocation(product, forgedProgramCall);
  const forgedProgramFault = await Effect.runPromise(Effect.flip(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(
      forgedProgramCall,
    ),
  ));
  assert.equal(forgedProgramFault.kind, "definition_execution_fault");
  assert.equal(forgedProgramFault.stage, "resource_admission");

  const forgedConformanceBasisCall = structuredClone(conformanceCall);
  forgedConformanceBasisCall.invocation.request.conformanceLaw = coordinate(
    product,
    "law://abiogenesis/validator/unrelated@5",
  );
  rehashInvocation(product, forgedConformanceBasisCall);
  const forgedConformanceBasisFault = await Effect.runPromise(Effect.flip(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(
      forgedConformanceBasisCall,
    ),
  ));
  assert.equal(
    forgedConformanceBasisFault.code,
    "resource_relation_mismatch",
  );

  const duplicateInventoryCall = structuredClone(conformanceCall);
  duplicateInventoryCall.resources.declaredInventory.push(
    structuredClone(harness.rootPublication),
  );
  const duplicateInventoryFault = await Effect.runPromise(Effect.flip(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(
      duplicateInventoryCall,
    ),
  ));
  assert.equal(duplicateInventoryFault.code, "resource_relation_mismatch");

  const forgedView = structuredClone(view);
  const forgedOverlay = {
    ...forgedView.declarationsByHandle[overlayRow.handle],
    provenanceRefs: [
      ...forgedView.declarationsByHandle[overlayRow.handle].provenanceRefs,
      "provenance://forged-process-local-view",
    ],
  };
  forgedView.declarationEntries = forgedView.declarationEntries.map((row) =>
    row.handle === overlayRow.handle ? forgedOverlay : row
  );
  forgedView.declarationsByHandle[overlayRow.handle] = forgedOverlay;
  const forgedViewFault = await Effect.runPromise(Effect.flip(
    product.CATALOG_DEFINITION_BINDINGS.apply.node_type(definitionCall({
      publicApi,
      product,
      operationId: "abg.operation.catalog.apply",
      memberKey: "node_type",
      ordinal: 10,
      request: applicationRequest("node_type", nodeRow, nodeTarget),
      slots: applicationSlots,
      resources: Object.freeze({
        kind: "catalog_application_resource_assertion",
        schemaVersion,
        catalog: structuredClone(catalog),
        catalogRow: structuredClone(nodeRow),
        catalogView: forgedView,
        applicationBasis,
        validationReceipt,
        contributor,
      }),
    })),
  ));
  assert.equal(forgedViewFault.kind, "definition_execution_fault");
  assert.equal(forgedViewFault.stage, "resource_admission");

  const prefixAfterCatalog = await readFile(eventLogPath);
  assert.deepEqual(prefixAfterCatalog, prefixBeforeCatalog);
  const finalTruth = abg.projectExactPrefixArtifactTruth(
    admittedCatalog.resources.eventResource.closeHandoff.prefix,
  );
  assert.equal(finalTruth.rows.length, 2);
  assert.deepEqual(
    finalTruth.rows.map(({ operationId }) => operationId).sort(),
    [
      "abg.operation.product.install",
      "abg.operation.workspace.bind",
    ],
  );

  for (const path of [
    "build/code/src/product/install_definition_bindings.js",
    "build/code/src/product/catalog_definition_bindings.js",
    "build/code/src/product/project_read_definition_bindings.js",
    "build/code/src/validator/conformance_definition_bindings.js",
    "build/code/src/shared/definition_binding_mechanics.js",
  ]) {
    const source = await readFile(join(harness.installedPackageRoot, path), "utf8");
    assert.doesNotMatch(
      source,
      /applyRootPublicInvocation|createRootOperationContext|WeakMap|new Map|legacyRequest/u,
      path,
    );
  }
  assert.equal("PUBLIC_DEFINITION_BINDINGS" in publicApi, false);
  assert.equal("LEGACY_DEFINITION_BINDINGS" in publicApi, false);

  const tarballDigest = await product.sha256File(harness.artifactPath);
  process.stdout.write(`W2_05_PROOF ${JSON.stringify({
    tarballDigest,
    artifactDigest: harness.candidateBasis.artifactDigest,
    productContentDigest: harness.candidateBasis.productContentDigest,
    manifestDigest: harness.candidateBasis.manifestDigest,
    censusSha256: census.censusSha256,
    callableCount: census.report.callableCount,
    definitionCount: census.report.definitionCount,
    addedKeys: selectedAdditions,
    remainingKeys,
    eventCountBeforeCatalog: 2,
    eventCountAfterCatalog: 2,
    ticketConsensusUnavailableCode: ticketConsensusUnavailableFault.code,
  })}\n`);
});
