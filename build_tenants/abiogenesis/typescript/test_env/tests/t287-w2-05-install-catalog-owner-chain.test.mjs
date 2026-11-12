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
  "abg.operation.project.read#workspace_status",
]);
let admittedContractCatalog = null;
let admittedDefinitionContractCoordinates = null;
let ownerArtifact = null;
const actorRef = "actor://abiogenesis/t287/w2-05-worker";

function keyOf(definition) {
  return `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`;
}

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product) {
  return Object.freeze({
    actor: coordinate(product, actorRef),
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
  const requestDigest = product.sha256Canonical(request);
  const admittedSlots = authoritySlots(product, definition, slots);
  const authorityBody = Object.freeze({
    kind: "invocation_authority",
    definitionKey: definition.definitionKey,
    slots: admittedSlots,
  });
  const invocationAuthority = Object.freeze({
    ...authorityBody,
    authorityDigest: product.sha256Canonical(authorityBody),
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
  const invocationBody = Object.freeze({
    kind: "public_invocation",
    schemaVersion,
    invocationContract,
    definitionRef: definition.definitionRef,
    definitionVersion: schemaVersion,
    definitionDigest: definition.definitionDigest,
    definitionKey: definition.definitionKey,
    contractCatalog: admittedContractCatalog,
    invocationAuthority,
    requestContract: memberContracts.slots.request,
    requestRef:
      `public-request://abiogenesis/t287/w2-05/${String(ordinal).padStart(2, "0")}-${memberKey}`,
    requestDigest,
    request,
    expectedResultContract: memberContracts.slots.result,
    expectedRefusalContract: memberContracts.slots.refusal,
    expectedNonTerminalContract: memberContracts.slots.nonTerminal,
    correlationRef: "correlation://abiogenesis/t287/w2-05-owner-chain",
    eventTime: "2026-08-18T00:00:00.000Z",
    provenanceRefs: ["provenance://abiogenesis/t287/w2-05-worker"],
  });
  const invocationDigest = product.sha256Canonical(invocationBody);
  return Object.freeze({
    invocation: Object.freeze({
      ...invocationBody,
      invocationRef:
        `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`,
      invocationDigest,
    }),
    resources,
  });
}

// Definitions bound through withAdmissionAuthority validate every grant: each
// call carries the admission basis over the owner-verified artifact, the
// resolved trusted-developer authority and the grants constructed for its fixed
// definition packet. project.read members are not admission-bound and keep the
// invocation authority definitionCall supplies.
async function authorizedCall({ publicApi, product, packet, ordinal, request, slots = {}, resources, prefix = null }) {
  const { operationId, memberKey } = packet.definitionKey;
  const definition = definitionFor(publicApi, operationId, memberKey);
  const hash = product.sha256Canonical;
  const selected = authoritySlots(product, definition, slots);
  const data = {
    kind: "admission_capability_data", schemaVersion,
    definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
    ownerArtifact, request,
    resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots({ ...selected, capability_grants: null }) },
    boundEnvironment: packet.metadata.workspaceBindingRequirement === "forbidden"
      ? null : product.admissionEnvironmentSelection(prefix, selected.workspace_binding),
  };
  const authorityValue = { actorRef, authorityMode: "trusted_developer" };
  const approvalValue = { decision: "allow", actorRef, definitionRef: definition.definitionRef,
    definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(data).digest };
  const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef, authorityMode: "trusted_developer",
    authority: { ...coordinate(product, "authority://abiogenesis/t287/w2-05-worker", authorityValue), value: authorityValue },
    approval: { ...coordinate(product, `approval://abiogenesis/t287/w2-05/${ordinal}`, approvalValue), value: approvalValue } };
  const admitted = await product.constructAdmissionCapabilityGrants(authority, actorRef,
    { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data }, null);
  return definitionCall({ publicApi, product, operationId, memberKey, ordinal, request,
    slots: { ...slots, capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs],
      grants: admitted.grants.map((grant) => ({ ref: grant.grantRef, digest: grant.grantDigest })) } },
    resources: { ...resources, admissionAuthority: { basis: admitted.data, authority, grants: admitted.grants } } });
}

function rehashInvocation(product, call) {
  call.invocation.requestDigest = product.sha256Canonical(
    call.invocation.request,
  );
  const {
    authorityDigest: _authorityDigest,
    ...authorityBody
  } = call.invocation.invocationAuthority;
  call.invocation.invocationAuthority.authorityDigest =
    product.sha256Canonical(authorityBody);
  const {
    invocationRef: _invocationRef,
    invocationDigest: _invocationDigest,
    ...invocationBody
  } = call.invocation;
  call.invocation.invocationDigest = product.sha256Canonical(invocationBody);
  call.invocation.invocationRef =
    `invocation://abiogenesis/${call.invocation.invocationDigest.slice("sha256:".length)}`;
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

const MECHANICS_PATH = "build/code/src/public/binding/definition_binding_mechanics.js";
const OWNER_CHAIN_PATHS = Object.freeze([
  "build/code/src/product/install_definition_bindings.js",
  "build/code/src/product/catalog_definition_bindings.js",
  "build/code/src/product/project_read_definition_bindings.js",
  "build/code/src/validator/conformance_definition_bindings.js",
  MECHANICS_PATH,
]);
// Removed legacy root seams. This source check proves only that the installed
// owner chain no longer names them. It judges no collection: owner facts and
// their identity, admission, currentness and lifetime rest on behavioral owner
// proof (the installed chain below and §10.11 Proof), not on token absence.
const REMOVED_LEGACY_SEAMS = Object.freeze([
  "applyRootPublicInvocation",
  "createRootOperationContext",
  "legacyRequest",
]);

function assertOwnerChainSource(path, source) {
  assert.doesNotMatch(source, /applyRootPublicInvocation|createRootOperationContext|legacyRequest/u, path);
}

const CALL_LOCAL_COLLECTIONS = Object.freeze([
  ["call-local visited Map", [
    "function walk(value, visited) {",
    "  if (visited.has(value)) return true;",
    "  visited.set(value, true);",
    "  return Object.values(value).every((member) =>",
    "    typeof member !== \"object\" || member === null || walk(member, visited));",
    "}",
    "export const established = (value) => walk(value, new Map());",
  ].join("\n")],
  ["call-local WeakMap", "export function count(values) {\n  const seen = new WeakMap();\n  for (const value of values) seen.set(value, true);\n  return values.filter((value) => seen.has(value)).length;\n}"],
  ["collection mention", "// A WeakMap or new Map() here is ordinary call-local bookkeeping."],
]);

test("W2-05 owner-chain static oracle permits call-local collections and mentions", () => {
  for (const path of OWNER_CHAIN_PATHS) {
    for (const [label, source] of CALL_LOCAL_COLLECTIONS) {
      assert.doesNotThrow(() => assertOwnerChainSource(path, source), `${path}: ${label}`);
    }
  }
});

test("W2-05 owner-chain static oracle rejects removed legacy root seams", () => {
  for (const path of OWNER_CHAIN_PATHS) {
    for (const seam of REMOVED_LEGACY_SEAMS) {
      for (const [label, source] of CALL_LOCAL_COLLECTIONS) {
        assert.throws(() => assertOwnerChainSource(path, `${source}\n${seam}();`),
          assert.AssertionError, `${path}: ${seam} beside ${label}`);
      }
    }
  }
});

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
  // RETIRED (T-290 C-18b, superseded cut): the W2-05 cut's frozen callable
  // census (39 callable, 17 named remaining, release_evidence unbound, 28
  // earlier keys and their digest). Later work bound five more definitions
  // (project.read#release_evidence, run.continue#current_intent and
  // #selected_action, witness.admit#reprice and #run-stopped); the census was
  // the cut's delta, not a claim about the Product at head. The W2-05
  // additions stay callable.
  assert.deepEqual(
    loadedKeys.filter((key) => selectedAdditions.includes(key)),
    selectedAdditions,
  );
  // T-292 TD-26 P1: the W2-05 addition project.read#ticket_consensus stays
  // declared without a binding until its withdrawal.
  assert.ok(missingKeys.includes("abg.operation.project.read#ticket_consensus"));

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
  ownerArtifact = Object.freeze({ request: verificationPacket.request, verified });
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
  const installCall = await authorizedCall({
    publicApi,
    product,
    packet: product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install,
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
    authorizedActorRef: actorRef,
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
  const bindCall = await authorizedCall({
    publicApi,
    product,
    packet: product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind,
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
      workspaceManifest,
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
  // The Product's contribution manifest binds its ten core publications
  // (scripts/generate-product-manifest.mjs); the catalog admits exactly them.
  const publications = Object.freeze([
    gtl.constructDefaultGovernanceLibraryModulePublication(artifactBasis),
    gtl.constructConsensusModulePublication(artifactBasis),
    gtl.constructWorksiteConstructionModulePublication(artifactBasis),
    gtl.constructWorksiteCommandExecutionModulePublication(artifactBasis),
    gtl.constructNativeWorkspaceWorkModulePublication(artifactBasis),
    gtl.constructRequirementHandoffModulePublication(artifactBasis),
    gtl.constructSemanticStageModulePublication(artifactBasis),
    gtl.constructSemanticRevisionModulePublication(artifactBasis),
    gtl.constructSelfConformanceModulePublication(artifactBasis),
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
  const boundPrefix = binding.resources.eventResource.closeHandoff.prefix;
  const catalogCall = await authorizedCall({
    publicApi,
    product,
    packet: product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
    ordinal: 5,
    request: catalogRequest,
    slots: catalogSlots,
    resources: catalogResources,
    prefix: boundPrefix,
  });
  const admittedCatalog = await runBinding(
    product.CATALOG_DEFINITION_BINDINGS.admit,
    catalogCall,
    "catalog.admit",
  );
  // One disposition row per contribution manifest input row (the W2-05 cut's
  // four-publication count, 43, is restated to the relation).
  assert.equal(
    admittedCatalog.ownerOutput.value.rows.length,
    verified.contributionManifest.rows.length,
  );
  assert.deepEqual(
    admittedCatalog.resources.eventResource.closeHandoff.prefix,
    binding.resources.eventResource.closeHandoff.prefix,
  );
  const independentlyReconstructedCatalog = await runBinding(
    product.CATALOG_DEFINITION_BINDINGS.admit,
    await authorizedCall({
      publicApi,
      product,
      packet: product.CATALOG_OPERATION_SOURCE_DECLARATIONS.admit,
      ordinal: 6,
      request: structuredClone(catalogRequest),
      slots: structuredClone(catalogSlots),
      resources: structuredClone(catalogResources),
      prefix: boundPrefix,
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
  const viewCall = await authorizedCall({
    publicApi,
    product,
    packet: product.CATALOG_OPERATION_SOURCE_DECLARATIONS.view.allowlist,
    ordinal: 7,
    request: viewRequest,
    slots: catalogSlots,
    prefix: boundPrefix,
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

  const workspaceCatalogSlots = Object.freeze({
    workspace_binding: binding.ownerOutput.value.binding,
    product_set: [install.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate,
    catalog_scope: Object.freeze({
      ref: admittedCatalog.ownerOutput.value.catalog.ref,
      digest: admittedCatalog.ownerOutput.value.catalog.digest,
    }),
  });
  const environmentReadSlots = Object.freeze({
    workspace_binding: binding.ownerOutput.value.binding,
    product_set: [install.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate,
  });
  // RETIRED (T-290 C-18b, removed surface): catalog.apply over the core
  // consensus node_type and overlay rows with caller-asserted application
  // basis, validation receipt and contributor coordinates. At head the owner
  // derives all three from an explicit construction (prefix, Program, target,
  // value, installed schema assets: constructCatalogApplicationResources), and
  // the core consensus schema asset ($id abg.schema.consensus@5) carries no
  // schema whose $id is a row's contract ref, so these rows have no Public
  // application. steel-consumer-declaration owns the Public apply claim over a
  // consumer's installed schemas; m5-consensus-module owns the native one.

  const projectionBasis = (memberKey, value) => Object.freeze({
    basisRef: `projection-basis://abiogenesis/t287/w2-05/${memberKey}`,
    basisDigest: product.sha256Canonical(value),
    value: Object.freeze(value),
  });
  // The read owner admits I-JSON resources only. The exact artifact truth
  // projection carries its derivation proof as a symbol member, so it travels
  // as a detached copy and the owner reconstructs it cold.
  const readResources = (packet, additional = {}) => Object.freeze({
    kind: "product_project_read_resource_assertion",
    schemaVersion,
    packet: Object.freeze(packet),
    ...additional,
    ...("artifactTruth" in additional
      ? { artifactTruth: structuredClone(additional.artifactTruth) }
      : {}),
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
    }, { artifactTruth }),
  });
  const catalogListRead = await runBinding(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list,
    catalogListCall,
    "project.read#catalog_list",
  );
  assert.equal(
    catalogListRead.ownerOutput.value.projection.rows.length,
    catalog.entries.length + catalog.declarationEntries.length,
  );

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
    }, { artifactTruth }),
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
    }, { artifactTruth }),
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
  assert.equal(
    Object.hasOwn(product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS, "ticket_consensus"),
    false,
  );
  const ticketConsensusUnavailableFault =
    await publicApi.runInstalledDefinitionCallTransport(
      { kind: "eventless" },
      ticketConsensusUnavailableCall,
    );
  assert.equal(
    ticketConsensusUnavailableFault.kind,
    "installed_definition_call_transport_refusal",
  );
  assert.equal(
    ticketConsensusUnavailableFault.code,
    "installed_binding_unavailable",
  );

  for (const [label, mutate] of [
    ["blank request ref", (call) => {
      call.invocation.requestRef = "";
    }],
    ["blank correlation ref", (call) => {
      call.invocation.correlationRef = "";
    }],
    ["invalid event time", (call) => {
      call.invocation.eventTime = "18 August 2026";
    }],
    ["blank provenance ref", (call) => {
      call.invocation.provenanceRefs = [""];
    }],
    ["unstructured capability grant", (call) => {
      call.invocation.invocationAuthority.slots.capability_grants.grants = [{}];
    }],
  ]) {
    const malformedInvocationCall = structuredClone(catalogListCall);
    mutate(malformedInvocationCall);
    rehashInvocation(product, malformedInvocationCall);
    const malformedInvocationFault = await Effect.runPromise(Effect.flip(
      product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list(
        malformedInvocationCall,
      ),
    ));
    assert.equal(
      malformedInvocationFault.code,
      "call_identity_mismatch",
      label,
    );
  }

  for (const [label, sourceCall, bindingUnderTest] of [
    [
      "catalog list synchronized entry forgery",
      catalogListCall,
      product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list,
    ],
    [
      "catalog describe synchronized entry forgery",
      catalogDescribeCall,
      product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_describe,
    ],
  ]) {
    const forgedCatalogCall = structuredClone(sourceCall);
    const forgedEntry = forgedCatalogCall.resources.packet.catalog.entries[0];
    forgedEntry.entryDigest = product.sha256Canonical({
      forgedCatalogHandle: forgedEntry.handle,
    });
    forgedCatalogCall.resources.packet.catalog.byHandle[forgedEntry.handle]
      .entryDigest = forgedEntry.entryDigest;
    const forgedCatalogFault = await Effect.runPromise(Effect.flip(
      bindingUnderTest(forgedCatalogCall),
    ));
    assert.equal(
      forgedCatalogFault.code,
      "resource_relation_mismatch",
      label,
    );
  }

  const preBindingArtifactTruth = abg.projectExactPrefixArtifactTruth(
    install.resources.eventResource.closeHandoff.prefix,
  );
  assert.equal(preBindingArtifactTruth.rows.length, 1);
  for (const [label, sourceCall, bindingUnderTest] of [
    [
      "catalog list unadmitted environment basis",
      catalogListCall,
      product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list,
    ],
    [
      "catalog describe unadmitted environment basis",
      catalogDescribeCall,
      product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_describe,
    ],
  ]) {
    const unadmittedCatalogCall = structuredClone(sourceCall);
    unadmittedCatalogCall.resources.artifactTruth =
      structuredClone(preBindingArtifactTruth);
    const unadmittedCatalogFault = await Effect.runPromise(Effect.flip(
      bindingUnderTest(unadmittedCatalogCall),
    ));
    assert.equal(
      unadmittedCatalogFault.code,
      "resource_relation_mismatch",
      label,
    );
  }

  const hiddenCatalogRow = [
    ...catalog.entries,
    ...catalog.declarationEntries,
  ].find((row) => !allowlist.includes(row.handle));
  assert.ok(hiddenCatalogRow, "catalog contains a row hidden by the session view");
  const expandedView = product.CatalogOperationPort.constructView({
    kind: "catalog_view_packet",
    schemaVersion,
    memberKey: "allowlist",
    catalog,
    allowlist: [...allowlist, hiddenCatalogRow.handle],
  });
  assert.equal(expandedView.kind, "graph_function_catalog_view");
  const forgedExpandedView = structuredClone(expandedView);
  forgedExpandedView.viewDigest = view.viewDigest;
  const forgedSessionAllowlistCall = structuredClone(sessionCatalogListCall);
  forgedSessionAllowlistCall.resources.packet.selector.visibility.view =
    forgedExpandedView;
  forgedSessionAllowlistCall.invocation.invocationAuthority.slots
    .catalog_scope.allowlist = [...forgedExpandedView.allowlist];
  rehashInvocation(product, forgedSessionAllowlistCall);
  const forgedSessionAllowlistFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.catalog_list(
      forgedSessionAllowlistCall,
    ),
  ));
  assert.equal(
    forgedSessionAllowlistFault.code,
    "resource_relation_mismatch",
  );

  const alternateInstallManifestCall = structuredClone(installEvidenceCall);
  const alternateInstallManifestValue = {
    ...alternateInstallManifestCall.resources.packet.selector.manifest.value,
    forgedManifest: true,
  };
  const alternateInstallManifest = {
    manifestRef: `${manifest.manifestRef}.alternate`,
    manifestDigest: product.sha256Canonical(alternateInstallManifestValue),
    value: alternateInstallManifestValue,
  };
  alternateInstallManifestCall.resources.packet.selector.manifest =
    alternateInstallManifest;
  alternateInstallManifestCall.invocation.request.selector.manifest = {
    ref: alternateInstallManifest.manifestRef,
    digest: alternateInstallManifest.manifestDigest,
  };
  rehashInvocation(product, alternateInstallManifestCall);
  const alternateInstallManifestFault = await Effect.runPromise(Effect.flip(
    product.PRODUCT_PROJECT_READ_DEFINITION_BINDINGS.install_evidence(
      alternateInstallManifestCall,
    ),
  ));
  assert.equal(
    alternateInstallManifestFault.code,
    "resource_relation_mismatch",
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
  staleWorkspaceCall.resources.artifactTruth = structuredClone(
    abg.projectExactPrefixArtifactTruth(
      install.resources.eventResource.closeHandoff.prefix,
    ),
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

  // A declared-inventory conformance evaluates a Program of the admitted
  // catalog over its exact bound publications and a view of the Program's
  // members (declarationCatalog). The W2-05 cut's test-owned root publication
  // is no longer a catalog publication; a core consensus Program stands for it.
  const conformancePublication = publications[1];
  const conformanceProgram = conformancePublication.programs[0];
  assert.ok(conformanceProgram);
  const conformanceProgramCoordinate = Object.freeze({
    ref: conformanceProgram.programRef,
    digest: product.sha256Canonical(conformanceProgram),
  });
  const conformanceLaw = coordinate(
    product,
    "law://abiogenesis/validator/gtl-program@5",
  );
  const lawfulInventory = catalog.boundPublications;
  const conformanceRequest = Object.freeze({
    program: conformanceProgramCoordinate,
    conformanceLaw,
    inventoryBasis: Object.freeze({
      kind: "declared_inventory",
      inventory: Object.freeze(lawfulInventory.map((publication) => coordinate(
        product,
        publication.moduleRef,
        publication,
      ))),
    }),
  });
  const conformanceCatalogView = product.narrowGraphFunctionCatalog(
    catalog,
    catalog.entries
      .filter((row) => row.programMembershipRefs.includes(conformanceProgram.programRef))
      .map((row) => row.handle)
      .sort(),
  );
  const conformanceSlots = Object.freeze({
    workspace_binding: binding.ownerOutput.value.binding,
    product_set: [install.ownerOutput.value.installedProduct],
    dependency_lock: lockCoordinate,
    actor: actorAuthority(product),
  });
  const conformanceResources = (law, declaredInventory) => Object.freeze({
    kind: "conformance_evaluation_resource_assertion",
    schemaVersion,
    packet: Object.freeze({
      kind: "conformance_evaluate_packet",
      schemaVersion,
      memberKey: "gtl_program",
      publication: conformancePublication,
      program: conformanceProgram,
    }),
    conformanceLaw: law,
    declaredInventory: Object.freeze(declaredInventory),
    declarationCatalog: Object.freeze({ catalog, catalogView: conformanceCatalogView }),
  });
  // Each conformance call, and each altered one below, is authorized as
  // supplied, so the conformance owner judges it.
  const conformanceCall = (ordinal, request, resources) => authorizedCall({
    publicApi,
    product,
    packet: validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program,
    ordinal,
    request,
    slots: conformanceSlots,
    resources,
    prefix: boundPrefix,
  });
  const conformance = await runBinding(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program,
    await conformanceCall(26, conformanceRequest, conformanceResources(conformanceLaw, lawfulInventory)),
    "conformance.evaluate#gtl_program",
  );
  assert.equal(conformance.ownerOutput.value.disposition, "passed");

  const forgedProgramCall = await conformanceCall(27, {
    ...conformanceRequest,
    program: { ...conformanceProgramCoordinate, digest: product.sha256Canonical({ forged: "program" }) },
  }, conformanceResources(conformanceLaw, lawfulInventory));
  const forgedProgramFault = await Effect.runPromise(Effect.flip(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(
      forgedProgramCall,
    ),
  ));
  const conformanceRelationMismatch = (label, fault) => {
    assert.equal(fault.kind, "definition_execution_fault", label);
    assert.equal(fault.stage, "resource_admission", label);
    assert.equal(fault.code, "resource_relation_mismatch", label);
    assert.equal(
      fault.message,
      "conformance packet differs from the public Program, law, or inventory coordinates",
      label,
    );
  };
  conformanceRelationMismatch("forged Program", forgedProgramFault);

  const forgedConformanceBasisCall = await conformanceCall(28, {
    ...conformanceRequest,
    conformanceLaw: coordinate(product, "law://abiogenesis/validator/unrelated@5"),
  }, conformanceResources(conformanceLaw, lawfulInventory));
  const forgedConformanceBasisFault = await Effect.runPromise(Effect.flip(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(
      forgedConformanceBasisCall,
    ),
  ));
  conformanceRelationMismatch("forged law", forgedConformanceBasisFault);

  const unrelatedLaw = coordinate(
    product,
    "law://abiogenesis/validator/unrelated@5",
  );
  const synchronizedUnrelatedLawCall = await conformanceCall(29, {
    ...conformanceRequest,
    conformanceLaw: unrelatedLaw,
  }, conformanceResources(unrelatedLaw, lawfulInventory));
  const synchronizedUnrelatedLaw = await Effect.runPromise(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(
      synchronizedUnrelatedLawCall,
    ),
  );
  assert.equal(synchronizedUnrelatedLaw.ownerOutput.outcomeKind, "refusal");
  assert.equal(synchronizedUnrelatedLaw.ownerOutput.value.code, "law_mismatch");

  const duplicateInventoryCall = await conformanceCall(30, conformanceRequest,
    conformanceResources(conformanceLaw, [...lawfulInventory, structuredClone(conformancePublication)]));
  const duplicateInventoryFault = await Effect.runPromise(Effect.flip(
    validator.CONFORMANCE_DEFINITION_BINDINGS.evaluate.gtl_program(
      duplicateInventoryCall,
    ),
  ));
  conformanceRelationMismatch("duplicate inventory", duplicateInventoryFault);

  // RETIRED (T-290 C-18b, removed surface): the forged process-local view arm
  // of catalog.apply, built on the retired caller-asserted application request
  // above.

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

  for (const path of OWNER_CHAIN_PATHS) {
    assertOwnerChainSource(path, await readFile(join(harness.installedPackageRoot, path), "utf8"));
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
    remainingKeys: missingKeys,
    eventCountBeforeCatalog: 2,
    eventCountAfterCatalog: 2,
    ticketConsensusUnavailableCode: ticketConsensusUnavailableFault.code,
  })}\n`);
});
