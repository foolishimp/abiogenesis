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
  abiPackageArchivePath}) {
  const publicationData = await declarationFactory(gtl);
  const productId = publicationData.owningProductId;
  const packageVersion = version;
  const {moduleRef, descriptorRef, contributionManifestRef} = publicationData;
  const programRef = ref('program','root');
  const graphFunctionRef = ref('graph-function','root');
  const nodeRef = ref('node','select');
  const startRef = ref('start','root');
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
  for (const file of fixtureFiles) await cp(file.source,join(sourceRoot,file.path));
  const productRelativeLocators = [
    ...fixtureFiles.map(file=>file.path),
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
    rows: [],
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
}) {
  const {
    product,
    abg,
    catalog,
    catalogView,
    admittedInstalls,
    workspaceBinding,
    additionalProducts: [fixture],
  } = environment;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView,
    admittedInstalls,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: fixture.ids.programRef,
    selection: Object.freeze({
      kind: "start",
      scope: "program",
      target: "next",
      until: "converged",
      rootMode: "direct",
    }),
  });
  assert.equal(
    resolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(resolution),
  );
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
    target: Object.freeze({ kind: "next" }),
    until: "converged",
    catalogView: view,
    allowlist: Object.freeze([...catalogView.allowlist]),
    input: contractBoundInput,
    fhMode: "direct",
    rootMode: "direct",
    sourceBasis: Object.freeze({ kind: "none" }),
  });
  const steeringDigest = product.sha256Canonical(eventResource);
  const slots = Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze(admittedInstalls.map((install) => Object.freeze({
      ref: install.installId,
      digest: install.productContentDigest,
    }))),
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
    source: Object.freeze({ kind: "none" }),
    ...(runEnvironmentResourceFactory === undefined ? {} : {runEnvironmentResources:await runEnvironmentResourceFactory({authority,program:resolution.program,workspaceBinding,product})}),
  });
  return {
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

function readAuthoritySlots(environment, packet, grants) {
  const { admittedInstalls, workspaceBinding } = environment;
  return Object.freeze({
    workspace_binding: Object.freeze({
      ref: workspaceBinding.bindingId,
      digest: workspaceBinding.bindingDigest,
    }),
    product_set: Object.freeze(admittedInstalls.map((install) => Object.freeze({
      ref: install.installId,
      digest: install.productContentDigest,
    }))),
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
