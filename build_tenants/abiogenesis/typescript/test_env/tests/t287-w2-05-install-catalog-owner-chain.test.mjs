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
  "abg.operation.product.install#install",
]);
const remainingKeys = Object.freeze([
  "abg.operation.conformance.evaluate#gtl_program",
  "abg.operation.interaction.respond#answer_escalation",
  "abg.operation.interaction.respond#approve",
  "abg.operation.interaction.respond#assess",
  "abg.operation.interaction.respond#reject",
  "abg.operation.interaction.respond#select",
  "abg.operation.product.materialize#configuration",
  "abg.operation.product.materialize#context_bootstrap",
  "abg.operation.project.read#catalog_describe",
  "abg.operation.project.read#catalog_list",
  "abg.operation.project.read#install_evidence",
  "abg.operation.project.read#release_evidence",
  "abg.operation.project.read#ticket_consensus",
  "abg.operation.project.read#workspace_status",
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
  return Object.freeze({
    invocation: Object.freeze({
      kind: "public_invocation",
      schemaVersion,
      invocationRef,
      invocationDigest,
      definitionRef: definition.definitionRef,
      definitionVersion: schemaVersion,
      definitionDigest: definition.definitionDigest,
      definitionKey: definition.definitionKey,
      invocationAuthority,
      requestRef: `${invocationRef}/request`,
      requestDigest,
      request,
      correlationRef: "correlation://abiogenesis/t287/w2-05-owner-chain",
      eventTime: "2026-08-18T00:00:00.000Z",
      provenanceRefs: ["provenance://abiogenesis/t287/w2-05-worker"],
    }),
    resources,
  });
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
  const [publicApi, abg, gtl] = await Promise.all([
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
  assert.equal(census.report.callableCount, 31);
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
  const authorityManifest = Object.freeze({
    workspaceId: "workspace://abiogenesis/t287/w2-05",
    canonicalRoot: workspaceRoot,
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
    productRoot: installedRoot,
    eventLogRoot: join(workspaceRoot, ".ai-workspace/events"),
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
  })}\n`);
});
