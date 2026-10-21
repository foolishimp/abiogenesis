import assert from "node:assert/strict";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import * as Effect from "effect/Effect";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
let installedHarness;
let cliOrdinal = 0;
const observedCalls = [];
const executionResolutions = [];

import { expectedVerificationIdentity } from
  "../support/candidate-basis.mjs";
import {
  importInstalledPackageExport,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
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

async function cliCall(call, acquisition) {
  const path = join(installedHarness.scratch, `steel-${++cliOrdinal}.jsonl`);
  await writeFile(path, `${JSON.stringify({
    kind: "abg_cli_transport_request", schemaVersion, acquisition, invocation: call,
  })}\n`);
  let stdout;
  try { ({ stdout } = await execFileAsync(installedHarness.cliPath, ["--jsonl", path], {
    cwd: installedHarness.cliHost, env: { ...process.env, NODE_OPTIONS: "" },
    timeout: 60_000, maxBuffer: 20 * 1024 * 1024,
  })); } catch (error) { stdout = error.stdout; }
  const outcome = JSON.parse(stdout);
  observedCalls.push({
    definitionKey: call.invocation?.definitionKey ?? null,
    invocationRef: call.invocation?.invocationRef ?? null,
    invocationDigest: call.invocation?.invocationDigest ?? null,
    requestSha256: installedHarness.product.sha256Canonical(call),
    acquisitionKind: acquisition.kind,
    outcomeSha256: installedHarness.product.sha256Canonical(outcome),
    transportKind: outcome.kind,
    exitCode: outcome.receipt?.exitCode ?? null,
    code: outcome.code ?? outcome.receipt?.failure?.fault?.code ?? null,
    ownerOutputKind: outcome.receipt?.ownerOutput?.outcomeKind ?? null,
    disposition: outcome.receipt?.ownerOutput?.value?.disposition ?? null,
    closePrefix: outcome.receipt?.resources?.eventResource?.closeHandoff?.prefix ?? null,
  });
  return outcome;
}
function acquisitionFor(call) {
  const resource = call.resources.eventResource;
  return resource === undefined ? { kind: "eventless" }
    : resource.kind === "new_abg_event_resource"
    ? { kind: "new", eventLogPath: resource.eventLogPath }
    : { kind: "reopen", closeHandoff: resource.closeHandoff };
}
async function runBinding(_binding, call, label) {
  const outcome = await cliCall(call, acquisitionFor(call));
  assert.equal(outcome.kind, "installed_definition_call_transport_result", `${label}: ${JSON.stringify(outcome)}`);
  const value = outcome.receipt;
  assert.equal(value.exitCode, 0, `${label}: ${JSON.stringify(value)}`);
  assert.equal(value.ownerOutput.outcomeKind, "result", label);
  return value;
}
async function refusedBeforeInstall(call, product, binding) {
  const mutations = [
    ["missing invocation", c => { delete c.invocation; }],
    ["missing request", c => { delete c.invocation.request; }],
    ["missing definition", c => { delete c.invocation.definitionDigest; }],
    ["wrong definition digest", c => { c.invocation.definitionDigest = `sha256:${"0".repeat(64)}`; }],
    ["wrong invocation digest", c => { c.invocation.invocationDigest = `sha256:${"0".repeat(64)}`; }],
    ["wrong request digest", c => { c.invocation.requestDigest = `sha256:${"0".repeat(64)}`; }],
    ["wrong authority digest", c => { c.invocation.invocationAuthority.authorityDigest = `sha256:${"0".repeat(64)}`; }],
    ["crossed definition", c => { c.invocation.definitionKey.memberKey = "verify"; rehashInvocation(product, c); }],
    ["crossed request", c => { c.invocation.request.installPolicy = "not-an-install-policy"; rehashInvocation(product, c); }],
    ["crossed schema", c => { c.invocation.expectedResultContract = c.invocation.requestContract; rehashInvocation(product, c); }],
    ["missing schema", c => { delete c.invocation.expectedRefusalContract; rehashInvocation(product, c); }],
    ["crossed authority", c => { c.invocation.invocationAuthority.definitionKey.memberKey = "verify"; rehashInvocation(product, c); }],
    ["forbidden workspace binding", c => { c.invocation.invocationAuthority.slots.workspace_binding = c.invocation.request.resolvedLock; rehashInvocation(product, c); }],
  ];
  for (const [label, mutate] of mutations) {
    const candidate = structuredClone(call); mutate(candidate);
    const outcome = await cliCall(candidate, acquisitionFor(call));
    assert.equal(outcome.kind, "installed_definition_call_transport_refusal", `${label}: ${JSON.stringify(outcome)}`);
    const exit = await Effect.runPromiseExit(binding(candidate));
    assert.equal(exit._tag, "Failure", label);
    await assert.rejects(stat(call.resources.eventResource.eventLogPath), { code: "ENOENT" }, label);
    await assert.rejects(stat(call.invocation.request.targetRoot), { code: "ENOENT" }, label);
  }
}

function reopenEventResource(product, closeHandoff) {
  return Object.freeze({
    kind: "reopen_abg_event_resource",
    schemaVersion,
    closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff),
  });
}

test("STEEL-BASIC-CLI-01 installed exact Public admits its eventless and event-bearing owner chain", async (context) => {
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
  installedHarness = harness;
  assert.equal("applyRootPublicInvocation" in publicApi, false);
  assert.equal("ROOT_PUBLIC_OPERATION_IDS" in publicApi, false);

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

  const verifyCall = definitionCall({ publicApi, product,
    operationId: "abg.operation.product.verify", memberKey: "verify", ordinal: 1,
    request: verifyRequest, resources: { kind: "product_verification_resources",
      schemaVersion, targetKind: "packed_artifact", packedArtifact },
  });
  const verifiedThroughCli = await runBinding(product.PRODUCT_VERIFICATION_DEFINITION_BINDINGS.verify,
    verifyCall, "product.verify");
  assert.deepEqual(verifiedThroughCli.ownerOutput.value.verifiedArtifact, ownerVerification.coordinates.verifiedArtifact);

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
    invocation: {
      ref: verifyCall.invocation.invocationRef,
      digest: verifyCall.invocation.invocationDigest,
    },
    outcome: verifiedThroughCli.ownerOutput.value.verifiedArtifact,
  });

  const resolveCall = definitionCall({ publicApi, product,
    operationId: "abg.operation.product.resolve", memberKey: "resolve", ordinal: 2,
    request: { requirements: [{ productId: verified.productId,
      packageVersion: verified.packageVersion, requiredContractRefs: [], requiredCapabilityRefs: [] }],
      verifiedCandidates: [verificationReference] },
    slots: { verification_references: [verificationReference] },
    resources: { kind: "product_resolution_resource_assertion", schemaVersion,
      verifiedPreimages: [{ verification: verificationReference, verifiedArtifact: verified,
        verificationOutput: verifiedThroughCli.ownerOutput }],
      nativeContractClosure: { selectorDispositions: [], occurrences: [], nativeBindings: [] } },
  });
  const resolvedThroughCli = await runBinding(product.PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS.resolve,
    resolveCall, "product.resolve");
  assert.deepEqual(resolvedThroughCli.ownerOutput.value.resolvedLock, lockCoordinate);
  const changedClosureCall = structuredClone(resolveCall);
  changedClosureCall.resources.nativeContractClosure.selectorDispositions.push({
    kind: "no_external_contribution", selectorRef: `sha256:${"1".repeat(64)}`,
    reason: "not_in_source_contract_meaning", checkerWitnessDigest: `sha256:${"2".repeat(64)}`,
  });
  const changedClosure = await cliCall(changedClosureCall, { kind: "eventless" });
  assert.equal(changedClosure.receipt.exitCode, 70);
  assert.equal(changedClosure.receipt.failure.fault.code, "product_resolution_execution_failure");
  assert.match(changedClosure.receipt.failure.fault.message, /resolved native closure differs/);


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
  await refusedBeforeInstall(installCall, product, product.PRODUCT_INSTALL_DEFINITION_BINDINGS.install);
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
    gtl.constructWorksiteConstructionModulePublication(artifactBasis),
    gtl.constructWorksiteCommandExecutionModulePublication(artifactBasis),
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
  assert.ok(admittedCatalog.ownerOutput.value.rows.length > 0);
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
  const eventlessPrefixBytes = await readFile(eventLogPath);
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

  const executionTargets = [product.WORKSITE_CONSTRUCTION_IDS, product.WORKSITE_COMMAND_EXECUTION_IDS];
  const executionAllowlist = executionTargets.map(({ graphFunctionRef }) => {
    const rows = catalog.entries.filter(({ definitionRef }) => definitionRef === graphFunctionRef);
    assert.equal(rows.length, 1);
    return rows[0].handle;
  }).sort();
  const executionViewCall = definitionCall({ publicApi, product,
    operationId: "abg.operation.catalog.view", memberKey: "allowlist", ordinal: 20,
    request: { catalog: admittedCatalog.ownerOutput.value.catalog, allowlist: executionAllowlist },
    slots: catalogSlots,
    resources: { kind: "catalog_view_resource_assertion", schemaVersion, catalog: structuredClone(catalog) },
  });
  const executionViewReceipt = await runBinding(product.CATALOG_DEFINITION_BINDINGS.view.allowlist,
    executionViewCall, "catalog.view C1/C2");
  const executionView = product.CatalogOperationPort.constructView({
    kind: "catalog_view_packet", schemaVersion, memberKey: "allowlist",
    catalog, allowlist: executionAllowlist,
  });
  assert.deepEqual(executionViewReceipt.ownerOutput.value.effectiveHandles, executionView.allowlist);
  assert.equal(catalog.boundPublications.length, 4);
  for (const target of executionTargets) {
    const rows = executionView.entries.filter(({ definitionRef }) => definitionRef === target.graphFunctionRef);
    assert.equal(rows.length, 1);
    const resolution = await product.ProductExecutionResolutionPort.resolve({
      catalog, catalogView: executionView, admittedInstalls: [installedTruth.install],
      verifyInstallAdmission: install => abg.hasAdmittedProductInstall(artifactTruth, install),
      programRef: target.programRef, selection: { kind: "direct", catalogHandle: rows[0].handle },
    });
    assert.equal(resolution.kind, "loaded_product_execution_resolution",
      `${target.programRef}: ${JSON.stringify({kind:resolution.kind, code:resolution.code, stage:resolution.stage, message:resolution.message})}`);
    const closure = resolution.declarationClosure;
    assert.equal(closure.semanticsOwner.moduleRef, closure.programPublication.moduleRef);
    assert.equal(closure.semanticsOwner.publicationDigest, closure.programPublicationDigest);
    assert.equal(closure.semanticsOwner.installId, installedTruth.install.installId);
    executionResolutions.push({ programRef: target.programRef,
      graphFunctionRef: target.graphFunctionRef, resolutionRef: resolution.resolution.resolutionRef,
      resolutionDigest: resolution.resolution.resolutionDigest,
      semanticsOwner: closure.semanticsOwner, boundPublicationCount: catalog.boundPublications.length });
    for (const [label, installedProducts, expectedCode] of [
      ["duplicate installed owner", [...catalog.readinessBasis.installedProducts, catalog.readinessBasis.installedProducts[0]], "ambiguous"],
      ["mismatched installed package", catalog.readinessBasis.installedProducts.map(install => ({...install, packageName: "@unrelated/owner"})), "wrong_owner"],
    ]) {
      const malformedCatalog = { ...catalog, readinessBasis: { ...catalog.readinessBasis, installedProducts } };
      const refused = product.resolveExecutionDeclarationClosure(malformedCatalog, executionView, target.programRef, target.graphFunctionRef);
      assert.equal(refused.kind, "execution_declaration_closure_refusal", label);
      assert.equal(refused.code, expectedCode, label);
    }
    const duplicatedProgramCatalog = { ...catalog, boundPublications: [...catalog.boundPublications, closure.programPublication] };
    const duplicatedProgram = product.resolveExecutionDeclarationClosure(duplicatedProgramCatalog, executionView, target.programRef, target.graphFunctionRef);
    assert.equal(duplicatedProgram.code, "ambiguous");
  }

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

  assert.deepEqual(await readFile(eventLogPath), eventlessPrefixBytes);
  const legacyEventPath = join(harness.scratch, "legacy-must-not-create.events.jsonl");
  const legacy = await cliCall({ kind: "public_invocation", schemaVersion,
    operationId: "abg.operation.product.verify", variant: "artifact",
    invocationRef: "invocation://legacy", payload: {} },
    { kind: "new", eventLogPath: legacyEventPath });
  assert.equal(legacy.kind, "installed_definition_call_transport_refusal");
  await assert.rejects(stat(legacyEventPath), { code: "ENOENT" });
  if (process.env.ABI5_STEEL_PUBLIC_EVIDENCE_PATH) {
    await writeFile(process.env.ABI5_STEEL_PUBLIC_EVIDENCE_PATH, `${JSON.stringify({
      kind: "steel_basic_cli_public_evidence", schemaVersion,
      artifactSha256: product.sha256Bytes(await readFile(harness.artifactPath)),
      productContentDigest: harness.candidateManifest.productContentDigest,
      installedPackageRoot: harness.installedPackageRoot,
      eventLogSha256: product.sha256Bytes(await readFile(eventLogPath)),
      calls: observedCalls,
      executionResolutions,
      assertions: { malformedInstallCallsBeforeEffect: 13, changedNativeClosureRefused: true,
        eventlessEventDelta: 0, legacyExportAbsent: true, legacyCliRefusedBeforeEffect: true, fullPublicationC1C2Resolution: true, genuineOwnerAmbiguityRefused: true },
    }, null, 2)}\n`);
  }
  context.diagnostic("installed Public verify/resolve/install/bind/catalog/view/apply chain completed; 13 pre-effect refusals, changed native-closure refusal, eventless zero event delta, legacy refusal");
});
