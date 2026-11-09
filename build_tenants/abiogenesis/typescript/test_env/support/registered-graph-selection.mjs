import { execFile } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import assert from "node:assert/strict";
import { declarations, ref, packageName, version } from "../fixtures/registered-selection-product/index.mjs";
const execFileAsync = promisify(execFile);
const schemaVersion = "5.0.0";
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

/** One installed `run.invoke` start through the shipped SDK constructor. The
 * Product run owner populates the request and authority slots from the
 * selection, input and source intent; support supplies scenario data only. */
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
  const constructed = await publicApi.constructInstalledStartCall({
    selection: Object.freeze({
      memberKey: "start",
      target: assetHandle !== undefined ? Object.freeze({ kind: "asset", handle: assetHandle })
        : declaredStartRef === undefined ? Object.freeze({ kind: "next" })
        : Object.freeze({ kind: "declared_start", startRef: declaredStartRef }),
      rootMode,
      fhMode: "direct",
    }),
    programRef: programRef ?? fixture.ids.programRef,
    catalog,
    catalogView,
    applications: Object.freeze([]),
    admittedInstalls,
    workspaceBinding,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    actorRef: workspaceBinding.authorizedActorRef,
    input: inputFactory === undefined ? Object.freeze({ value: input }) : Object.freeze({
      factory: ({ resolution }) => inputFactory({ resolution, program: resolution.program, workspaceBinding }),
    }),
    inputValueRef: `value://odd-glc/${identity}/hello-input`,
    source: sourceResult === undefined ? Object.freeze({ kind: "none" }) : Object.freeze({
      kind: "admitted_source_result",
      basis: sourceResult.basis,
      projectionAuthority: sourceResult.projectionAuthority,
    }),
    ...(runEnvironmentResourceFactory === undefined ? {} : {
      runEnvironmentResources: (populated) => runEnvironmentResourceFactory({ ...populated, product }),
    }),
    eventResource,
    envelope: Object.freeze({
      definitionContractCoordinates: environment.verified.definitionContractCoordinates,
      requestRef: `public-request://odd-glc/${identity}/run-start`,
      correlationRef: `correlation://odd-glc/${identity}/run-start`,
      eventTime: identity === "st-1"
        ? "2026-08-21T00:00:00.000Z"
        : "2026-08-22T01:00:00.000Z",
      provenanceRefs: [`provenance://odd-glc/${identity}-worker`],
    }),
  });
  if (constructed.kind !== "installed_start_call") assert.fail(JSON.stringify(constructed));
  const { population } = constructed;
  return {
    workAuthority: population.authority,
    call: constructed.call,
    resolution: population.resolution,
    capabilityBasis: Object.freeze({
      actorRef: workspaceBinding.authorizedActorRef,
      capabilityGrants: population.grants,
      policy: population.policy,
      productInstalls: admittedInstalls,
      program: population.resolution.program,
      programValidation: population.resolution.programValidation,
      workspaceBinding,
    }),
  };
}

/** The typed pending_execution use request for one projected pending
 * position, through the ABG use-request projection. */
export async function pendingExecutionUseRequest({ environment, prefix, runId, pending }) {
  assert.equal(pending.runId, runId, "the pending position belongs to the named Run");
  const request = environment.abg.projectPendingExecutionUseRequest(prefix, pending);
  assert.ok(request, "the pending root scope is opened at the prefix");
  return request;
}

/** One cold Public `run.continue` `current_intent` pending_execution call
 * through the shipped SDK constructor. ABG and Product owners reconstruct the
 * use, resolution, policy, grant and attribution from the log; no start object
 * supplies authority. `expectedAuthority` is an assertion only and
 * `runEnvironmentResources` an explicit resource. `call(identity)` populates
 * at a fresh event resource. `replay(identity, requestPatch)` is the explicit
 * negative: the first canonical population, its request patched and its
 * transport steering restamped for the fresh resource. */
export async function constructInstalledPendingCall({ environment, publicApi, continuation, prefix, request,
  expectedAuthority, runEnvironmentResources, eventResource, identityScope, eventTime, provenanceRef }) {
  const { product, catalog, catalogView } = environment;
  const use = continuation.selectPendingExecutionUse(prefix, request);
  assert.equal(use.kind, "pending_execution_use", JSON.stringify(use));
  if (expectedAuthority !== undefined) {
    assert.deepEqual([use.invocation.authorityRef, use.invocation.authorityDigest],
      [expectedAuthority.authorityRef, expectedAuthority.authorityDigest], "the pending root admission names the expected authority");
  }
  const envelope = (identity) => Object.freeze({
    definitionContractCoordinates: environment.verified.definitionContractCoordinates,
    requestRef: `public-request://${identityScope}/${identity}`,
    correlationRef: `correlation://${identityScope}/${identity}`,
    eventTime,
    provenanceRefs: [provenanceRef],
  });
  const construct = async (identity, resource) => {
    const constructed = await publicApi.constructInstalledPendingCall({
      selection: Object.freeze({ kind: "pending_execution", runRef: request.run.ref, continuation: request.continuation }),
      catalog,
      catalogView,
      applications: Object.freeze([]),
      eventResource: resource,
      ...(runEnvironmentResources === undefined ? {} : { runEnvironmentResources }),
      envelope: envelope(identity),
    });
    if (constructed.kind !== "installed_pending_call") assert.fail(JSON.stringify(constructed));
    return constructed;
  };
  const first = await construct("population", eventResource());
  assert.equal(product.canonicalJson(first.population.request), product.canonicalJson(request), "the owner populates the projected use request");
  const call = async (identity) => (await construct(identity, eventResource())).call;
  const replay = (identity, requestPatch = {}) => {
    const resource = eventResource(), steering = product.sha256Canonical(resource), identityEnvelope = envelope(identity);
    return publicApi.constructInstalledPublicDefinitionCall({
      product, installedPublic: publicApi, definitionContractCoordinates: identityEnvelope.definitionContractCoordinates,
      contractCatalog: first.call.invocation.contractCatalog, operationId: "abg.operation.run.continue", memberKey: "current_intent",
      request: { ...first.population.request, ...requestPatch },
      slots: { ...first.population.slots, transport_steering: { ref: `transport-steering://abiogenesis/${steering.slice(7)}`, digest: steering } },
      resources: { ...first.call.resources, eventResource: resource },
      requestRef: identityEnvelope.requestRef, correlationRef: identityEnvelope.correlationRef,
      eventTime, provenanceRefs: identityEnvelope.provenanceRefs,
    });
  };
  return Object.freeze({ use, population: first.population, call, replay });
}

/** One run read through the shipped SDK constructor; ABG populates the source
 * coordinate and the authority the read kernel admits. */
export function constructInstalledRunReadCall({
  environment,
  publicApi,
  memberKey,
  selector,
  source,
  eventResource,
  identity,
}) {
  const { workspaceBinding } = environment;
  const constructed = publicApi.constructInstalledRunReadCall({
    memberKey,
    workspaceBinding: Object.freeze({ ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest }),
    sourceRef: source.ref,
    selector,
    eventResource,
    envelope: Object.freeze({
      definitionContractCoordinates: environment.verified.definitionContractCoordinates,
      requestRef: `public-request://odd-glc/st-2b/${identity}`,
      correlationRef: `correlation://odd-glc/st-2b/${identity}`,
      eventTime: "2026-08-22T00:00:00.000Z",
      provenanceRefs: ["provenance://odd-glc/st-2b-worker"],
    }),
  });
  if (constructed.kind !== "installed_run_read_call") assert.fail(`${memberKey} ${JSON.stringify(constructed)}`);
  assert.deepEqual([constructed.population.source.ref, constructed.population.source.digest], [source.ref, source.digest],
    `${memberKey} populated source`);
  return Object.freeze({
    packet: constructed.population.packet,
    grants: constructed.population.grants,
    call: constructed.call,
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
