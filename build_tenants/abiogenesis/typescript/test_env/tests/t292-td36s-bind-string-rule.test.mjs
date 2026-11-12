// TD-36S (T-292). REQ-R-ABG3-BINDING-016 states the workspace bind string
// rule: the workspace identity, authority basis identity and authorized actor
// reference taken from the authority basis, the product set and lock
// identities, and each declared root are nonblank, equal to their trim and
// NUL-free; a bind request that carries any other value is refused. This lane
// states the door table through the installed Public bind operation
// (`PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS.bind`) and through the bind port
// (`ProductEnvironmentPort.bindWorkspace`), which returns the internal code:
// - an authority string (padded or NUL actor reference) is refused with
//   `invalid_workspace_authority`, Public `workspace_mismatch` (realization
//   constitution R25: workspace authority -> `workspace_mismatch`);
// - a declared root (last segment ends in whitespace, or holds a NUL) keeps
//   `invalid_declared_root`, Public `root_mismatch`;
// - a padded ProductSet string cannot be expressed on the Public request (the
//   request carries coordinates; `constructProductSet` mints the id). Through
//   `constructWorkspaceBinding` the ProductSet check refuses it first, with
//   `invalid_declared_root`.
// The workspace id must equal the workspace manifest's reference on this path,
// so it has no padded row here. A well-formed control binds through the same
// harness. Before TD-36S the actor rows returned `invalid_declared_root` and
// the Public `root_mismatch`.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import * as Effect from "effect/Effect";

import { expectedVerificationIdentity } from "../support/candidate-basis.mjs";
import {
  importInstalledPackageExport,
  setupInstalledCliHarness,
} from "../support/root-cli-environment.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
const actorRef = "actor://abiogenesis/t292/td36s-worker";

const AUTHORITY_REFUSAL = Object.freeze({
  kind: "environment_refusal", schemaVersion, disposition: "refused",
  code: "invalid_workspace_authority", message: "workspace authority fields must be explicit",
});
const ROOT_REFUSAL = Object.freeze({
  kind: "environment_refusal", schemaVersion, disposition: "refused",
  code: "invalid_declared_root", message: "workspace authority, ProductSet, and every declared root must be exact",
});

function coordinate(product, ref, value = { ref }) {
  return Object.freeze({ ref, digest: product.sha256Canonical(value) });
}

function actorAuthority(product) {
  return Object.freeze({
    actor: coordinate(product, actorRef),
    attribution: coordinate(product, "attribution://abiogenesis/t292/td36s-worker"),
  });
}

function authoritySlots(product, definition, supplied = {}) {
  return Object.freeze({
    workspace_binding: null, product_set: null, dependency_lock: null, catalog_scope: null,
    execution_program: null, graph_function: null, input_contract: null, session_policy: null,
    capability_grants: Object.freeze({
      requiredCapabilityRefs: [...definition.capabilityRefs],
      grants: [coordinate(product,
        `capability-grant://abiogenesis/t292/${encodeURIComponent(
          `${definition.definitionKey.operationId}#${definition.definitionKey.memberKey}`)}`,
        { definitionKey: definition.definitionKey })],
    }),
    actor: null, transport_steering: null, verification_references: null, execution_basis: null,
    ...supplied,
  });
}

function definitionFor(publicApi, operationId, memberKey) {
  const matches = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.filter((definition) =>
    definition.definitionKey.operationId === operationId && definition.definitionKey.memberKey === memberKey);
  assert.equal(matches.length, 1, `${operationId}#${memberKey}`);
  return matches[0];
}

function reopenEventResource(product, closeHandoff) {
  return Object.freeze({
    kind: "reopen_abg_event_resource", schemaVersion, closeHandoff,
    handoffDigest: product.sha256Canonical(closeHandoff),
  });
}

// The owner-chain call construction of t287-w2-05-install-catalog-owner-chain:
// the admission basis over the owner-verified artifact, the resolved
// trusted-developer authority and the grants for the fixed definition packet.
async function authorizedCall(ctx, { packet, ordinal, request, slots, resources }) {
  const { publicApi, product, ownerArtifact, contractCatalog, contractCoordinates } = ctx;
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
      ? null : product.admissionEnvironmentSelection(null, selected.workspace_binding),
  };
  const authorityValue = { actorRef, authorityMode: "trusted_developer" };
  const approvalValue = { decision: "allow", actorRef, definitionRef: definition.definitionRef,
    definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(data).digest };
  const authority = { kind: "resolved_admission_authority", schemaVersion, actorRef, authorityMode: "trusted_developer",
    authority: { ...coordinate(product, "authority://abiogenesis/t292/td36s-worker", authorityValue), value: authorityValue },
    approval: { ...coordinate(product, `approval://abiogenesis/t292/td36s/${ordinal}`, approvalValue), value: approvalValue } };
  const admitted = await product.constructAdmissionCapabilityGrants(authority, actorRef,
    { kind: "admission_capability_grant_construction_basis", fixedPacket: packet, data }, null);
  const admittedSlots = authoritySlots(product, definition, { ...slots,
    capability_grants: { requiredCapabilityRefs: [...definition.capabilityRefs],
      grants: admitted.grants.map((grant) => ({ ref: grant.grantRef, digest: grant.grantDigest })) } });
  const authorityBody = Object.freeze({ kind: "invocation_authority", definitionKey: definition.definitionKey, slots: admittedSlots });
  const memberContracts = contractCoordinates.operations.find((row) => row.operationId === operationId)
    ?.members.find((row) => row.memberKey === memberKey);
  assert.ok(memberContracts, `${operationId}#${memberKey} contract coordinates`);
  const invocationBody = Object.freeze({
    kind: "public_invocation", schemaVersion,
    invocationContract: Object.freeze({
      contractCatalog,
      flatRow: Object.freeze({ contractId: "abg.schema.public-operation-invocation", contractVersion: schemaVersion,
        contractDigest: publicApi.PUBLIC_PROJECTION_PAYLOADS.commonSchemaAsset.contentDigest }),
      nestedSelector: Object.freeze({ selectorKind: "schema_definition", definitionKey: null, slot: null,
        definitionRef: "#/$defs/PublicInvocation" }),
    }),
    definitionRef: definition.definitionRef, definitionVersion: schemaVersion,
    definitionDigest: definition.definitionDigest, definitionKey: definition.definitionKey,
    contractCatalog,
    invocationAuthority: Object.freeze({ ...authorityBody, authorityDigest: hash(authorityBody) }),
    requestContract: memberContracts.slots.request,
    requestRef: `public-request://abiogenesis/t292/td36s/${String(ordinal).padStart(2, "0")}-${memberKey}`,
    requestDigest: hash(request), request,
    expectedResultContract: memberContracts.slots.result,
    expectedRefusalContract: memberContracts.slots.refusal,
    expectedNonTerminalContract: memberContracts.slots.nonTerminal,
    correlationRef: "correlation://abiogenesis/t292/td36s",
    eventTime: "2026-11-12T00:00:00.000Z",
    provenanceRefs: ["provenance://abiogenesis/t292/td36s-worker"],
  });
  const invocationDigest = hash(invocationBody);
  return Object.freeze({
    invocation: Object.freeze({ ...invocationBody,
      invocationRef: `invocation://abiogenesis/${invocationDigest.slice("sha256:".length)}`, invocationDigest }),
    resources: { ...resources, admissionAuthority: { basis: admitted.data, authority, grants: admitted.grants } },
  });
}

test("TD-36S: the Public bind names the cause of each string refusal", async (t) => {
  const harness = await setupInstalledCliHarness(t, packageRoot, {
    candidateBasisSource: "packed_artifact", rootPublicationKinds: ["worksite_construction"],
  });
  const publicApi = await importInstalledPackageExport(harness, "@abiogenesis/typescript-tenant/public", "td36s-public");
  const product = harness.product;

  const verificationPacket = Object.freeze({
    kind: "product_verification_packet", schemaVersion, memberKey: "verify", targetKind: "packed_artifact",
    request: Object.freeze({ artifactPath: harness.artifactPath, artifactRef: harness.artifactRef,
      ...expectedVerificationIdentity(harness.candidateBasis) }),
  });
  const ownerVerification = await product.ProductVerificationPort.verify(verificationPacket);
  assert.equal(ownerVerification.kind, "product_verification_success", JSON.stringify(ownerVerification));
  const verified = ownerVerification.verifiedArtifact;
  const ctx = {
    publicApi, product,
    ownerArtifact: Object.freeze({ request: verificationPacket.request, verified }),
    contractCatalog: Object.freeze({ productId: verified.productId, productContentDigest: verified.productContentDigest,
      catalogId: verified.catalogId, catalogVersion: schemaVersion, catalogDigest: verified.catalogDigest }),
    contractCoordinates: verified.definitionContractCoordinates,
  };
  const resolvedLock = product.ProductEnvironmentPort.resolve({
    kind: "product_resolution_packet", schemaVersion, memberKey: "resolve", verifiedArtifacts: [verified],
  });
  assert.equal(resolvedLock.kind, "resolved_product_lock", JSON.stringify(resolvedLock));
  const lockCoordinate = Object.freeze({ ref: resolvedLock.lockId, digest: resolvedLock.lockDigest });
  const packedArtifact = Object.freeze({
    kind: "product_verification_artifact_resource", schemaVersion, artifactPath: harness.artifactPath,
    artifact: Object.freeze({ ref: verified.artifactRef, digest: verified.artifactDigest }),
    productContent: Object.freeze({
      ref: `product-content://abiogenesis/${verified.productContentDigest.slice("sha256:".length)}`,
      digest: verified.productContentDigest,
    }),
    descriptor: ownerVerification.coordinates.descriptor,
    contributionManifest: Object.freeze({ ref: verified.contributionManifestRef, digest: verified.contributionManifestDigest }),
    manifestDigest: verified.manifestDigest, productId: verified.productId,
    packageName: verified.packageName, packageVersion: verified.packageVersion,
  });
  const verifyRequest = Object.freeze({
    targetKind: "packed_artifact", artifact: packedArtifact.artifact, productContent: packedArtifact.productContent,
    descriptor: packedArtifact.descriptor, contributionManifest: packedArtifact.contributionManifest,
    declaredDependencies: verified.declaredDependencies,
    compatibilityInputs: verified.compatibilityRefs.map((compatibilityRef) => ({
      compatibilityRef, subjectRef: packedArtifact.productContent.ref })),
  });

  const eventLogPath = join(harness.scratch, "td36s.events.jsonl");
  const installRequest = Object.freeze({
    verifiedArtifact: ownerVerification.coordinates.verifiedArtifact,
    descriptor: ownerVerification.coordinates.descriptor,
    contributionManifest: packedArtifact.contributionManifest,
    resolvedLock: lockCoordinate,
    targetRoot: join(harness.scratch, "installed-product"),
    installPolicy: "clean",
  });
  const installCall = await authorizedCall(ctx, {
    packet: product.PRODUCT_INSTALL_SOURCE_DECLARATIONS.install, ordinal: 1, request: installRequest,
    slots: { dependency_lock: lockCoordinate,
      verification_references: [Object.freeze({
        invocation: coordinate(product, "invocation://abiogenesis/t292/td36s/00-verify", verifyRequest),
        outcome: ownerVerification.coordinates.verifiedArtifact,
      })],
      actor: actorAuthority(product) },
    resources: Object.freeze({
      kind: "product_install_resource_assertion", schemaVersion,
      eventResource: Object.freeze({ kind: "new_abg_event_resource", schemaVersion, eventLogPath,
        locatorDigest: product.sha256Canonical({ kind: "abg_event_log_locator", eventLogPath: resolve(eventLogPath) }) }),
      packedArtifact, verifiedArtifact: verified, resolvedLock,
    }),
  });
  const install = await Effect.runPromise(product.PRODUCT_INSTALL_DEFINITION_BINDINGS.install(installCall));
  assert.equal(install.ownerOutput.outcomeKind, "result", JSON.stringify(install.ownerOutput));
  const abg = await importInstalledPackageExport(harness, "@abiogenesis/typescript-tenant/abg", "td36s-abg");
  const installedTruth = abg.projectAdmittedProductInstallByInvocationRef(
    abg.projectExactPrefixArtifactTruth(install.resources.eventResource.closeHandoff.prefix),
    installCall.invocation.invocationRef,
  );
  assert.ok(installedTruth);
  const installedProduct = install.ownerOutput.value.installedProduct;

  const workspaceRoot = join(harness.scratch, "workspace");
  await mkdir(workspaceRoot);
  const workspaceCreation = await product.WorkspaceOperationPort.create({
    kind: "workspace_create_packet", schemaVersion, memberKey: "clean", targetRoot: workspaceRoot, scaffoldPolicy: "none",
  });
  assert.equal(workspaceCreation.kind, "workspace_create_result", JSON.stringify(workspaceCreation));
  const workspaceManifest = workspaceCreation.manifest;
  const authorityFor = (authorizedActorRef) => {
    const manifest = Object.freeze({ workspaceId: workspaceManifest.workspaceRef,
      canonicalRoot: workspaceManifest.canonicalRoot, authorityMode: "trusted_developer", authorizedActorRef });
    return product.constructWorkspaceAuthorityBasis({ ...manifest,
      authorityManifestRef: "manifest://abiogenesis/t292/td36s/workspace-authority",
      authorityManifestDigest: product.sha256Canonical(manifest) });
  };
  const rootsFor = (eventLogRoot = join(workspaceRoot, ".ai-workspace/events")) => Object.freeze({
    toolchainRoot: harness.installedPackageRoot, productRoot: installedTruth.install.installedRoot, eventLogRoot,
    runtimeStateRoot: join(workspaceRoot, ".ai-workspace/runtime"),
    projectionRoot: join(workspaceRoot, ".ai-workspace/projections"),
    archiveRoot: join(workspaceRoot, ".ai-workspace/archive"),
  });
  const rootKindByField = [["toolchain", "toolchainRoot"], ["product", "productRoot"], ["event_log", "eventLogRoot"],
    ["runtime_state", "runtimeStateRoot"], ["projection", "projectionRoot"], ["archive", "archiveRoot"]];

  let closeHandoff = install.resources.eventResource.closeHandoff;
  let ordinal = 2;
  const publicBind = async (authority, declaredRoots) => {
    const call = await authorizedCall(ctx, {
      packet: product.PRODUCT_ENVIRONMENT_SOURCE_DECLARATIONS.bind, ordinal: ordinal++,
      request: Object.freeze({
        workspaceAuthority: { ref: authority.authorityBasisId, digest: authority.authorityBasisDigest },
        installedSet: [installedProduct], resolvedLock: lockCoordinate,
        declaredRoots: rootKindByField.map(([rootKind, field]) => ({ rootKind, path: declaredRoots[field] })),
      }),
      slots: { product_set: [installedProduct], dependency_lock: lockCoordinate, actor: actorAuthority(product) },
      resources: Object.freeze({
        kind: "product_workspace_binding_resource_assertion", schemaVersion,
        eventResource: reopenEventResource(product, closeHandoff),
        workspaceAuthority: authority, workspaceManifest,
        admittedInstalls: [installedTruth.install], resolvedLock, declaredRoots,
      }),
    });
    const value = await Effect.runPromise(product.PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS.bind(call));
    closeHandoff = value.resources.eventResource.closeHandoff;
    return value.ownerOutput;
  };
  const portBind = (authority, roots) => product.ProductEnvironmentPort.bindWorkspace({
    kind: "workspace_binding_packet", schemaVersion, memberKey: "bind",
    admittedInstalls: [installedTruth.install], resolvedLock,
    authority: { workspaceId: authority.workspaceId, canonicalRoot: authority.canonicalRoot,
      authorityMode: authority.authorityMode, authorizedActorRef: authority.authorizedActorRef,
      authorityManifestRef: authority.authorityManifestRef, authorityManifestDigest: authority.authorityManifestDigest },
    roots,
  });

  const rows = [
    ["a padded actor reference", " actor://abiogenesis/t292/td36s ", undefined, AUTHORITY_REFUSAL, "workspace_mismatch"],
    ["an actor reference with a NUL", "actor://abiogenesis/t292/\0td36s", undefined, AUTHORITY_REFUSAL, "workspace_mismatch"],
    ["a root whose last segment ends in whitespace", actorRef, join(workspaceRoot, ".ai-workspace/events "), ROOT_REFUSAL, "root_mismatch"],
    ["a root with a NUL", actorRef, join(workspaceRoot, ".ai-workspace/ev\0ents"), ROOT_REFUSAL, "root_mismatch"],
  ];
  for (const [label, actor, eventLogRoot, internal, publicCode] of rows) {
    await t.test(`bind refuses ${label}: ${internal.code}, Public ${publicCode}`, async () => {
      const authority = authorityFor(actor);
      assert.equal(authority.kind, "workspace_authority_basis", `${label}: the authority basis admits it`);
      const roots = rootsFor(eventLogRoot);
      const port = portBind(authority, roots);
      const output = await publicBind(authority, roots);
      assert.equal(output.outcomeKind, "refusal", `${label}: ${JSON.stringify(output)}`);
      // Both observations in one comparison: the bind port's internal refusal
      // and the Public bind's refusal value.
      assert.deepEqual({ port: { ...port }, public: output.value },
        { port: internal, public: { code: publicCode, issuePaths: ["/request"], evidenceRefs: [] } }, label);
    });
  }

  await t.test("a padded ProductSet string is refused by the ProductSet check first: invalid_declared_root", () => {
    const authority = authorityFor(actorRef);
    const productSet = product.constructProductSet([installedTruth.install], resolvedLock);
    assert.equal(productSet.kind, "product_set", JSON.stringify(productSet));
    for (const [field, padded] of [["productSetId", ` ${productSet.productSetId} `], ["lockId", `${productSet.lockId} `]]) {
      const candidate = { ...productSet, [field]: padded };
      assert.equal(product.isProductSet(candidate, resolvedLock), false, `${field}: ProductSet check`);
      assert.deepEqual({ ...product.constructWorkspaceBinding(authority, candidate, resolvedLock, rootsFor()) },
        ROOT_REFUSAL, `${field}: constructor`);
    }
  });

  await t.test("control: a well-formed bind returns a binding through the same harness", async () => {
    const authority = authorityFor(actorRef);
    const roots = rootsFor();
    assert.equal(portBind(authority, roots).kind, "workspace_binding_candidate");
    const output = await publicBind(authority, roots);
    assert.equal(output.outcomeKind, "result", JSON.stringify(output));
    assert.equal(output.value.binding.ref.startsWith("workspace-binding://abiogenesis/"), true, JSON.stringify(output.value));
  });
});
