import { execFile } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import assert from "node:assert/strict";
import { declarations, ref, packageName, version } from "../fixtures/registered-selection-product/index.mjs";
const execFileAsync = promisify(execFile);
const schemaVersion = "5.0.0";
const operationId = "abg.operation.run.invoke";
export async function prepareRegisteredSelectionProduct({scratch, product, gtl, abiPublication,
  declarationFactory=declarations, fixtureFiles=[{path:'build/index.js',source:new URL('../fixtures/registered-selection-product/index.mjs',import.meta.url)}],
  abiPackageArchivePath, schemaAssets=[]}) {
  const publicationData = await declarationFactory(gtl);
  const productId = publicationData.owningProductId;
  const packageVersion = version;
  const {moduleRef, descriptorRef, contributionManifestRef} = publicationData;
  const program = publicationData.programs[0];
  const {programRef} = program;
  const start = program.starts.find(s => s.startRef === program.policies['abg.default_start_ref']) ?? program.starts[0];
  const {graphFunctionRef, startRef} = start;
  const nodeRef = publicationData.graphFunctions.find(g => g.name === graphFunctionRef).template.startNodeRef;
  const provenanceRef = ref('provenance','product');
  const sourceRoot = join(scratch, "registered-selection-data-product-source");
  await rm(sourceRoot, { force: true, recursive: true });
  await mkdir(join(sourceRoot, "build"), { recursive: true });
  await mkdir(join(sourceRoot, "contracts/capabilities"), { recursive: true });
  const packageJson = {
    name: packageName,
    version: packageVersion,
    type: "module",
    exports: { "./publication": "./build/publication.json" },
    files: ["build", "contracts", "product-toolchain-manifest.json"],
    ...(abiPackageArchivePath === undefined ? {} : {dependencies:{'@abiogenesis/typescript-tenant':`file:${abiPackageArchivePath}`}}),
  };
  const catalogSchema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
  };
  await writeFile(
    join(sourceRoot, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    join(sourceRoot, "build/publication.json"),
    `${product.canonicalJson(publicationData)}\n`,
    "utf8",
  );
  await writeFile(
    join(sourceRoot, "contracts/public-contract-catalog.schema.json"),
    `${product.canonicalJson(catalogSchema)}\n`,
    "utf8",
  );
  const capabilityDefinitionGraph =
    product.constructCapabilityDefinitionGraph([]);
  const capabilityDefinitionGraphBytes =
    product.capabilityDefinitionGraphAssetBytes(capabilityDefinitionGraph);
  await writeFile(
    join(sourceRoot, product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH),
    capabilityDefinitionGraphBytes,
  );
  const capabilityDefinitionGraphCoordinate =
    product.capabilityDefinitionGraphCoordinate(capabilityDefinitionGraph);
  for (const file of [...fixtureFiles,...schemaAssets]) { await mkdir(join(sourceRoot,file.path, ".."),{recursive:true}); await cp(file.source,join(sourceRoot,file.path)); }
  const productRelativeLocators = [
    ...[...fixtureFiles,...schemaAssets].map(file=>file.path),
    "contracts/public-contract-catalog.schema.json",
    "build/publication.json",
    "package.json",
  ];
  const payloadInventory = await Promise.all(
    productRelativeLocators.map(async (path) => ({
      path,
      sha256: await product.sha256File(join(sourceRoot, path)),
    })),
  );
  const productContentDigest = product.payloadInventoryDigest(payloadInventory);
  const placeholderDigest = `sha256:${"0".repeat(64)}`;
  const materializePublication = (
    identity,
    installedData = publicationData,
    gtlAuthority = gtl,
  ) =>
    gtlAuthority.modulePublication({
      kind: "module_publication",
      moduleVersion: "5.0.0",
      ...structuredClone(installedData),
      artifactDigest: identity.artifactDigest,
      productContentDigest: identity.productContentDigest,
      productManifestDigest: identity.manifestDigest,
      contributions: installedData.contributions.map((contribution) => ({
        ...structuredClone(contribution),
        provenanceRefs: [identity.artifactDigest, identity.manifestDigest],
      })),
    });
  const draftPublication = materializePublication({
    artifactDigest: placeholderDigest,
    productContentDigest,
    manifestDigest: placeholderDigest,
  });
  const catalogSchemaPath = "contracts/public-contract-catalog.schema.json";
  const catalogWithoutDigest = {
    schemaVersion: "5.0.0",
    catalogId: "catalog://registered-selection/public-contracts@5.0.0",
    catalogVersion: "5.0.0",
    catalogSchemaPath,
    catalogSchemaDigest: await product.sha256File(
      join(sourceRoot, catalogSchemaPath),
    ),
    rows: await Promise.all(schemaAssets.map(async asset => ({ contractId: asset.contractId, contractVersion: version,
      contractDigest: await product.sha256File(join(sourceRoot,asset.path)), contractKind:'schema_asset', owningProduct:productId,
      requirementAuthorityRefs:asset.requirementAuthorityRefs, capabilityIdentities:[],
      assetLocator:{path:asset.path,mediaType:'application/schema+json',schemaVersion:version,contentDigest:await product.sha256File(join(sourceRoot,asset.path))} }))),
  };
  const publicContractCatalog = {
    ...catalogWithoutDigest,
    catalogDigest: product.sha256Canonical(catalogWithoutDigest),
  };
  const contributionManifest = {
    kind: "product_contribution_manifest",
    schemaVersion: "5.0.0",
    contributionManifestRef,
    productId,
    productVersion: packageVersion,
    descriptorRef,
    productContentDigest,
    publicContractCatalogId: publicContractCatalog.catalogId,
    publicContractCatalogDigest: publicContractCatalog.catalogDigest,
    capabilityDefinitionGraph: capabilityDefinitionGraphCoordinate,
    publicationBindings: [{
      moduleRef,
      publicationDigest: product.modulePublicationSemanticDigest(
        draftPublication,
      ),
    }],
    rows: draftPublication.contributions.map((contribution) => ({
      moduleRef,
      handle: contribution.handle,
      kind: contribution.kind,
      declarationOrContractRef: contribution.declarationOrContractRef,
      owningProductId: contribution.owningProductId,
      programMembershipRefs: [...contribution.programMembershipRefs],
      compatibilityRefs: [...contribution.compatibilityRefs],
      provenanceRef,
      readinessPrerequisiteRefs: [...contribution.readinessPrerequisiteRefs],
    })),
  };
  const manifest = {
    kind: "abg_product_toolchain_manifest",
    schemaVersion: "5.0.0",
    productId,
    packageName,
    packageVersion,
    productContentDigest,
    productRelativeLocators,
    descriptorRef,
    publisherNamespace: "registered-selection",
    contributionManifestRef,
    contributionManifestDigest: product.sha256Canonical(contributionManifest),
    contributionManifest,
    compatibilityRefs: ["compatibility://abiogenesis/major/5"],
    declaredDependencies: [{
      kind: "requires",
      productId: abiPublication.owningProductId,
      packageVersion: abiPublication.productSemanticsBinding.packageVersion,
      compatibilityRef: "compatibility://abiogenesis/major/5",
      requiredContractRefs: [
        "abg.contract.gtl.root-declaration",
        "abg.schema.public-operation-invocation",
      ],
      requiredCapabilityRefs: [
        "abg.capability.catalog.invoke-graph-function@5",
        "abg.capability.gtl.declare@5",
      ],
    }],
    provenanceRef,
    declaredCapabilityRefs: [],
    capabilityDefinitionGraph: {
      ...capabilityDefinitionGraphCoordinate,
      assetLocator: {
        path: product.CAPABILITY_DEFINITION_GRAPH_ASSET_PATH,
        mediaType: "application/json",
        schemaVersion: "5.0.0",
        contentDigest: product.sha256Bytes(capabilityDefinitionGraphBytes),
      },
    },
    publicContractCatalog,
  };
  await writeFile(
    join(sourceRoot, "product-toolchain-manifest.json"),
    `${product.canonicalJson(manifest)}\n`,
    "utf8",
  );
  const artifacts = join(scratch, "registered-selection-artifacts");
  await mkdir(artifacts, { recursive: true });
  const { stdout } = await execFileAsync(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", artifacts],
    { cwd: sourceRoot, maxBuffer: 10 * 1024 * 1024 },
  );
  const [packResult] = JSON.parse(stdout);
  const artifactPath = join(artifacts, packResult.filename);
  const basis = {
    artifactDigest: await product.sha256File(artifactPath),
    manifestDigest: product.sha256Canonical(manifest),
    productContentDigest,
    productId,
    packageName,
    packageVersion,
  };
  return {
    artifactPath,
    artifactRef: basename(artifactPath),
    basis,
    ids: { graphFunctionRef, moduleRef, nodeRef, programRef, startRef },
    sourceRoot,
    async loadInstalledPublication({ installedRoot, gtl: installedGtl }) {
      const installedData = JSON.parse(
        await readFile(join(installedRoot, "build/publication.json"), "utf8"),
      );
      return materializePublication(basis, installedData, installedGtl);
    },
  };
}

export async function constructInstalledStartCall({
  environment,
  publicApi,
  eventResource,
  input,
  identity = "st-1",
  runEnvironmentResourceFactory,
  programRef,
  rootMode = "direct",
  declaredStartRef,
  assetHandle,
  inputFactory,
  sourceResult,
}) {
  // One selection: next, one declared start, or one published asset handle.
  assert.ok(declaredStartRef === undefined || assetHandle === undefined, "start and asset selections are mutually exclusive");
  if (assetHandle !== undefined) assert.ok(typeof assetHandle === "string" && assetHandle.length > 0, "asset selection names one handle");
  // A retained-source start names one owner-derived source-result basis and
  // the Public authority it was projected under; otherwise the source is none.
  if (sourceResult !== undefined) assert.ok(sourceResult.basis && sourceResult.projectionAuthority, "a source start names its basis and projection authority");
  const {
    product,
    abg,
    catalog,
    catalogView,
    admittedInstalls,
    workspaceBinding,
    additionalProducts: [fixture] = [],
  } = environment;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: programRef ?? fixture.ids.programRef,
    selection: Object.freeze({
      kind: "start",
      scope: "program",
      target: assetHandle === undefined ? declaredStartRef ?? "next" : `asset:${assetHandle}`,
      ...(declaredStartRef === undefined ? {} : { startRef: declaredStartRef }),
      until: "converged",
      rootMode,
    }),
  });
  assert.equal(
    resolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(resolution),
  );
  if (inputFactory !== undefined) input = await inputFactory({ resolution, program: resolution.program, workspaceBinding });
  const admittedInput = product.admitInstalledProductInput(
    resolution.productSemantics,
    resolution.resolution.inputContract.contractRef,
    input,
  );
  assert.ok(admittedInput);
  const inputContract = Object.freeze({
    ref: resolution.resolution.inputContract.contractRef,
    digest: resolution.resolution.inputContractDigest,
  });
  const contractBoundInput = Object.freeze({
    contract: inputContract,
    valueRef: `value://odd-glc/${identity}/hello-input`,
    valueDigest: product.sha256Canonical(input),
    value: input,
  });
  const declaredRegimes = new Set([
    ...resolution.programValidation.executableLeafRows.map((row) => row.fibre),
    ...resolution.programValidation.interactionLeafRows.map((row) => row.fibre),
  ]);
  const policy = product.constructRootInvocationPolicy(
    workspaceBinding,
    resolution.program,
    resolution.programValidation.interactionLeafRows.map((row) => ({
      requirementKey: row.requirementKey,
      requirementKeyDigest: row.requirementKeyDigest,
      actorCapabilityRef: row.requirement.actorCapabilityRef,
    })),
    ["F_D", "F_P", "F_H"].filter((regime) => declaredRegimes.has(regime)),
    [],
  );
  const actorRef = workspaceBinding.authorizedActorRef;
  const fixedPacket = product.RUN_OPERATION_CONTRACTS.invoke.start;
  const grants = Object.freeze([
    product.constructCapabilityGrant(
      policy,
      actorRef,
      operationId,
      product.DIRECT_INVOKE_CAPABILITY,
      {
        admittedInstalls,
        workspaceBinding,
        fixedPacket,
      },
    ),
  ]);
  const authority = product.constructInvocationAuthority(
    actorRef,
    workspaceBinding,
    catalogView,
    resolution.program.programRef,
    resolution.selectedCatalogEntry,
    policy,
    grants,
    {
      admittedInstalls,
      workspaceBinding,
      fixedPacket,
    },
  );
  const program = Object.freeze({
    ref: resolution.resolution.programRef,
    digest: resolution.resolution.programDigest,
  });
  const view = Object.freeze({
    ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice("sha256:".length)}`,
    digest: catalogView.viewDigest,
  });
  const request = Object.freeze({
    program,
    scope: "program",
    target: assetHandle !== undefined ? Object.freeze({ kind: "asset", handle: assetHandle })
      : declaredStartRef === undefined ? Object.freeze({ kind: "next" }) : Object.freeze({
        kind: "declared_start", start: Object.freeze({
          ref: resolution.resolvedProgramStart.start.startRef,
          digest: product.sha256Canonical(resolution.resolvedProgramStart.start),
        }),
      }),
    until: "converged",
    catalogView: view,
    allowlist: Object.freeze([...catalogView.allowlist]),
    input: contractBoundInput,
    fhMode: "direct",
    rootMode,
    sourceBasis: sourceResult === undefined ? Object.freeze({ kind: "none" }) : Object.freeze({
      kind: "admitted_source_result",
      projectionAuthority: Object.freeze({ ref: sourceResult.projectionAuthority.ref, digest: sourceResult.projectionAuthority.digest }),
      sourceResult: Object.freeze({ ref: sourceResult.basis.sourceResultRef, digest: sourceResult.basis.sourceResultDigest }),
    }),
  });
  const steeringDigest = product.sha256Canonical(eventResource);
  const slots = Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze(admittedInstalls.map(product.productInstallCoordinate)),
    dependency_lock: Object.freeze({
      ref: workspaceBinding.lockId,
      digest: workspaceBinding.lockDigest,
    }),
    catalog_scope: Object.freeze({
      catalog: Object.freeze({
        ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice("sha256:".length)}`,
        digest: catalog.basisDigest,
      }),
      view,
      allowlist: request.allowlist,
    }),
    execution_program: program,
    graph_function: null,
    input_contract: contractBoundInput,
    session_policy: Object.freeze({
      ref: policy.policyRef,
      digest: policy.policyDigest,
    }),
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([
        ...product.RUN_OPERATION_CONTRACTS.invoke.start.metadata.capabilityRefs,
      ]),
      grants: Object.freeze(grants.map((grant) => Object.freeze({
        ref: grant.grantRef,
        digest: grant.grantDigest,
      }))),
    }),
    actor: Object.freeze({
      actor: Object.freeze({
        ref: actorRef,
        digest: product.sha256Canonical({ actorRef }),
      }),
      attribution: Object.freeze({
        ref: authority.authorityRef,
        digest: authority.authorityDigest,
      }),
    }),
    transport_steering: Object.freeze({
      ref: `transport-steering://abiogenesis/${steeringDigest.slice("sha256:".length)}`,
      digest: steeringDigest,
    }),
    verification_references: null,
    execution_basis: null,
  });
  const contractCatalog = environment.verified.definitionContractCoordinates
    ?.operations.find((candidate) => candidate.operationId === operationId)
    ?.members.find((candidate) => candidate.memberKey === "start")
    ?.slots.request.contractCatalog;
  assert.ok(
    contractCatalog,
    "verified ABIogenesis truth must issue the installed start contract catalog",
  );
  const resources = Object.freeze({
    kind: "run_invocation_resource_assertion",
    schemaVersion,
    eventResource,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    source: sourceResult === undefined ? Object.freeze({ kind: "none" })
      : Object.freeze({ kind: "admitted_source_result", basis: sourceResult.basis }),
    ...(runEnvironmentResourceFactory === undefined ? {} : {runEnvironmentResources:await runEnvironmentResourceFactory({authority,program:resolution.program,workspaceBinding,product})}),
  });
  return {
    workAuthority: authority,
    call: publicApi.constructInstalledPublicDefinitionCall({
      product,
      installedPublic: publicApi,
      definitionContractCoordinates:
        environment.verified.definitionContractCoordinates,
      contractCatalog,
      operationId,
      memberKey: "start",
      request,
      slots,
      resources,
      requestRef: `public-request://odd-glc/${identity}/run-start`,
      correlationRef: `correlation://odd-glc/${identity}/run-start`,
      eventTime: identity === "st-1"
        ? "2026-08-21T00:00:00.000Z"
        : "2026-08-22T01:00:00.000Z",
      provenanceRefs: [`provenance://odd-glc/${identity}-worker`],
    }),
    resolution,
    capabilityBasis: Object.freeze({
      actorRef,
      capabilityGrants: grants,
      policy,
      productInstalls: admittedInstalls,
      program: resolution.program,
      programValidation: resolution.programValidation,
      workspaceBinding,
    }),
  };
}

/** The typed pending_execution use request for one projected pending position,
 * with the Run digest of its opened root scope at `prefix`. A position without
 * progressed input (an effect_unknown cut) carries the literal `none`
 * coordinate; the owner refuses that position on its effect first. */
export async function pendingExecutionUseRequest({ environment, prefix, runId, pending }) {
  const { product, abg } = environment, root = pending.chain[0];
  const coordinate = (ref, digest) => Object.freeze({ ref, digest });
  const scope = abg.projectOpenedTraversalScopeForFrameAtPrefix?.(prefix, root.frameId) ??
    (await import(pathToFileURL(join(environment.installedRoot, "build/code/src/abg/open_call.js")).href))
      .projectOpenedTraversalScopeForFrameAtPrefix(prefix, root.frameId);
  return Object.freeze({
    run: coordinate(runId, scope.runDigest),
    continuation: coordinate(pending.continuationRef, pending.continuationDigest),
    pendingCursor: coordinate(pending.pendingCursorRef, pending.pendingCursorDigest),
    continuationInput: coordinate(pending.progressedInputRef ?? "none", pending.progressedInputDigest ?? product.sha256Canonical("none")),
    expectedBasis: coordinate(root.basisRef, root.basisDigest),
  });
}

/** One cold Public `run.continue` `current_intent` pending_execution call
 * factory over the existing owners: use selection, pending input projection,
 * the declared input contract and the capability-grant constructor. `start` is
 * the actual Public start (resolution, capability basis, work authority and
 * run-environment resources) whose authority the pending root admission
 * names. `call(identity, requestPatch)` acquires a fresh event resource per
 * call. Semantic and negative assertions stay with the caller. */
export function constructInstalledPendingCall({ environment, publicApi, continuation, prefix, request, start,
  eventResource, identityScope, eventTime, provenanceRef }) {
  const { product, admittedInstalls, workspaceBinding, catalog, catalogView } = environment;
  const use = continuation.selectPendingExecutionUse(prefix, request);
  assert.equal(use.kind, "pending_execution_use", JSON.stringify(use));
  assert.deepEqual([use.invocation.authorityRef, use.invocation.authorityDigest],
    [start.workAuthority.authorityRef, start.workAuthority.authorityDigest], "the pending root admission names the supplied start authority");
  const publications = start.resolution.declarationPublications;
  const pendingInput = continuation.projectPendingExecutionInputAtPrefix(prefix, use,
    (ref) => publications.flatMap((x) => x.graphFunctions).find((g) => g.name === ref) ?? null, start.resolution.programValidation);
  assert.ok(pendingInput, "pending input carrier projects");
  const inputDeclaration = publications.flatMap((x) => x.contracts).find((c) => c.contractRef === pendingInput.inputCarrierRef);
  assert.ok(inputDeclaration, "pending input carrier has one declared contract");
  const packet = product.RUN_OPERATION_CONTRACTS.continue.current_intent, pendingOperationId = packet.definitionKey.operationId;
  const { policy, actorRef } = start.capabilityBasis;
  const grant = product.constructCapabilityGrant(policy, actorRef, pendingOperationId, packet.metadata.capabilityRefs[0],
    { admittedInstalls, workspaceBinding, fixedPacket: packet });
  const r = start.resolution.resolution;
  const contractCatalog = environment.verified.definitionContractCoordinates.operations
    .find((o) => o.operationId === pendingOperationId).members.find((m) => m.memberKey === "current_intent").slots.request.contractCatalog;
  const call = (identity, requestPatch = {}) => {
    const resource = eventResource(), steering = product.sha256Canonical(resource);
    const slots = {
      workspace_binding: { ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest },
      product_set: admittedInstalls.map(product.productInstallCoordinate),
      dependency_lock: { ref: workspaceBinding.lockId, digest: workspaceBinding.lockDigest },
      catalog_scope: {
        catalog: { ref: `graph-function-catalog://abiogenesis/${catalog.basisDigest.slice(7)}`, digest: catalog.basisDigest },
        view: { ref: `graph-function-catalog-view://abiogenesis/${catalogView.viewDigest.slice(7)}`, digest: catalogView.viewDigest },
        allowlist: catalogView.allowlist,
      },
      execution_program: { ref: r.programRef, digest: r.programDigest },
      graph_function: { graphFunction: { ref: r.graphFunctionRef, digest: r.graphFunctionDigest }, membership: r.programGraphFunctionMembership },
      input_contract: { contract: { ref: inputDeclaration.contractRef, digest: product.sha256Canonical(inputDeclaration) },
        valueRef: pendingInput.input.inputRef, valueDigest: pendingInput.input.inputDigest, value: pendingInput.input.value },
      session_policy: { ref: policy.policyRef, digest: policy.policyDigest },
      capability_grants: { requiredCapabilityRefs: packet.metadata.capabilityRefs, grants: [{ ref: grant.grantRef, digest: grant.grantDigest }] },
      actor: { actor: { ref: actorRef, digest: product.sha256Canonical({ actorRef }) },
        attribution: { ref: start.workAuthority.authorityRef, digest: start.workAuthority.authorityDigest } },
      transport_steering: { ref: `transport-steering://abiogenesis/${steering.slice(7)}`, digest: steering },
      verification_references: null,
      execution_basis: request.expectedBasis,
    };
    return publicApi.constructInstalledPublicDefinitionCall({
      product, installedPublic: publicApi, definitionContractCoordinates: environment.verified.definitionContractCoordinates,
      contractCatalog, operationId: pendingOperationId, memberKey: "current_intent", request: { ...request, ...requestPatch }, slots,
      resources: { kind: "run_invocation_resource_assertion", schemaVersion, eventResource: resource, catalog, catalogView,
        applications: [], source: { kind: "none" },
        ...(start.call.resources?.runEnvironmentResources === undefined ? {} : { runEnvironmentResources: start.call.resources.runEnvironmentResources }) },
      requestRef: `public-request://${identityScope}/${identity}`, correlationRef: `correlation://${identityScope}/${identity}`,
      eventTime, provenanceRefs: [provenanceRef],
    });
  };
  return Object.freeze({ use, pendingInput, inputDeclaration, call });
}

function readAuthoritySlots(environment, packet, grants) {
  const { product, admittedInstalls, workspaceBinding } = environment;
  return Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze(admittedInstalls.map(product.productInstallCoordinate)),
    dependency_lock: Object.freeze({
      ref: workspaceBinding.lockId,
      digest: workspaceBinding.lockDigest,
    }),
    catalog_scope: null,
    execution_program: null,
    graph_function: null,
    input_contract: null,
    session_policy: null,
    capability_grants: Object.freeze({
      requiredCapabilityRefs: Object.freeze([...packet.metadata.capabilityRefs]),
      grants: Object.freeze(grants.map((grant) => Object.freeze({
        ref: grant.grantRef,
        digest: grant.grantDigest,
      }))),
    }),
    actor: null,
    transport_steering: null,
    verification_references: null,
    execution_basis: null,
  });
}

export function constructInstalledRunReadCall({
  environment,
  publicApi,
  projectReadContracts,
  memberKey,
  selector,
  source,
  eventResource,
  identity,
  contractCatalogOverride = null,
  definitionContractCoordinatesOverride = null,
  mutateRequest = (request) => request,
  mutateSlots = (slots) => slots,
}) {
  const { product, admittedInstalls, workspaceBinding } = environment;
  const packet = projectReadContracts.ABG_PROJECT_READ_CONTRACTS[memberKey];
  const grantBasis = Object.freeze({
    admittedInstalls,
    workspaceBinding,
    fixedPacket: packet,
  });
  const grants = Object.freeze(packet.metadata.capabilityRefs.map(
    (capabilityRef) => product.constructCapabilityGrant(
      environment.workspaceAuthority,
      workspaceBinding.authorizedActorRef,
      packet.definitionKey.operationId,
      capabilityRef,
      grantBasis,
    ),
  ));
  const request = mutateRequest(Object.freeze({
    caseKey: memberKey,
    source: Object.freeze({
      sourceKind: "run",
      sourceRef: source.ref,
      sourceDigest: source.digest,
    }),
    projectionBasis: Object.freeze({
      projectionBasisRef: eventResource.closeHandoff.prefix.eventLogRef,
      projectionBasisDigest:
        eventResource.closeHandoff.prefix.coordinateDigest,
    }),
    selector,
  }));
  const slots = mutateSlots(
    readAuthoritySlots(environment, packet, grants),
    grants,
  );
  const installedContractCatalog =
    environment.verified.definitionContractCoordinates
    ?.operations.find((candidate) =>
      candidate.operationId === packet.definitionKey.operationId
    )
    ?.members.find((candidate) => candidate.memberKey === memberKey)
    ?.slots.request.contractCatalog;
  assert.ok(
    installedContractCatalog,
    `${memberKey} requires its installed contract catalog coordinate`,
  );
  const contractCatalog = contractCatalogOverride ?? installedContractCatalog;
  return Object.freeze({
    packet,
    grants,
    call: publicApi.constructInstalledPublicDefinitionCall({
      product,
      installedPublic: publicApi,
      definitionContractCoordinates:
        definitionContractCoordinatesOverride ??
          environment.verified.definitionContractCoordinates,
      contractCatalog,
      operationId: packet.definitionKey.operationId,
      memberKey,
      request,
      slots,
      resources: Object.freeze({
        kind: "abg_project_read_resource_assertion",
        schemaVersion,
        eventResource,
      }),
      requestRef: `public-request://odd-glc/st-2b/${identity}`,
      correlationRef: `correlation://odd-glc/st-2b/${identity}`,
      eventTime: "2026-08-22T00:00:00.000Z",
      provenanceRefs: ["provenance://odd-glc/st-2b-worker"],
    }),
  });
}

export async function runInstalledCliRequest({
  scratch,
  installedRoot,
  identity,
  acquisition,
  call,
  expectedExitCode = 0,
  environment = {},
}) {
  const requestPath = join(scratch, `st4-${identity}-request.jsonl`);
  const cliPath = join(installedRoot, "build/code/src/public/cli.js");
  await writeFile(requestPath, `${JSON.stringify({
    kind: "abg_cli_transport_request",
    schemaVersion,
    acquisition,
    invocation: call,
  })}\n`);
  const started = performance.now();
  let execution;
  try {
    execution = await execFileAsync(
      process.execPath,
      [cliPath, "--jsonl", requestPath],
      { cwd: scratch, env: environment, maxBuffer: 10 * 1024 * 1024 },
    );
    if (expectedExitCode !== null) assert.equal(expectedExitCode, 0, `${identity} CLI exit`);
  } catch (error) {
    if (expectedExitCode !== null) assert.equal(error.code, expectedExitCode, `${identity} CLI exit`);
    execution = error;
  }
  assert.equal(execution.stderr, "", `${identity} CLI stderr`);
  const lines = execution.stdout.trim().split(/\r?\n/u);
  assert.equal(lines.length, 1, `${identity} one CLI output`);
  return Object.freeze({
    wallMs: performance.now() - started,
    cliPath,
    requestPath,
    output: JSON.parse(lines[0]),
  });
}
