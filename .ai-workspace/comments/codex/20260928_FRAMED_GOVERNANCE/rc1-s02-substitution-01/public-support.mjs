// Extracted ordinary package loader and Public start construction only.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const schemaVersion='5.0.0',readJson=async p=>JSON.parse(await readFile(p,'utf8')),load=p=>import(pathToFileURL(p).href);
const confined = (root, path) => {
  assert.equal(typeof path, "string");
  const target = resolve(root, path), rel = relative(resolve(root), target);
  assert.ok(rel && !isAbsolute(rel) && rel !== ".." && !rel.startsWith("../"), "declared locator must stay inside its selected package/root");
  return target;
};

/** Resolve only package-declared public exports and bin; callers select the root. */
export async function loadPackageExport(packageRoot, expectedName, exportPath) {
  const manifest = await readJson(join(packageRoot, "package.json"));
  assert.equal(manifest.name, expectedName);
  const entry = manifest.exports?.[exportPath];
  const locator = typeof entry === "string" ? entry : entry?.import;
  assert.equal(typeof locator, "string", `missing declared public export ${expectedName}${exportPath.slice(1)}`);
  return load(confined(packageRoot, locator));
}
export async function declaredCli(packageRoot) {
  const manifest = await readJson(join(packageRoot, "package.json"));
  assert.equal(manifest.name, "@abiogenesis/typescript-tenant");
  assert.equal(typeof manifest.bin?.["abg.cli"], "string", "missing declared abg.cli bin");
  return confined(packageRoot, manifest.bin["abg.cli"]);
}
export const loadRuntime = async root => Object.fromEntries(await Promise.all(
  ["product", "gtl", "abg", "public", "validator"].map(async name =>
    [name, await loadPackageExport(root, "@abiogenesis/typescript-tenant", "./" + name)])));
export async function constructStart({ environment, publicApi, eventResource, inputFactory, selection, lookupSelection }) {
  const operationId = "abg.operation.run.invoke";
  const {
    product,
    abg,
    catalog,
    catalogView,
    admittedInstalls,
    workspaceBinding,
  } = environment;
  const resolution = await product.ProductExecutionResolutionPort.resolve({
    catalog,
    catalogView: lookupSelection?.catalogView ?? catalogView,
    admittedInstalls,
    verifyInstallAdmission: (install) =>
      abg.hasAdmittedProductInstall(environment.artifactTruth, install),
    programRef: selection.programRef,
    selection: lookupSelection?.selection ?? selection.selection,
  });
  assert.equal(
    resolution.kind,
    "loaded_product_execution_resolution",
    JSON.stringify(resolution),
  );
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
  const selectedInput = await inputFactory({ grants, resolution });
  const admittedInput = product.admitInstalledProductInput(
    resolution.productSemantics, resolution.resolution.inputContract.contractRef, selectedInput,
  );
  assert.ok(admittedInput);
  const inputContract = Object.freeze({ ref: resolution.resolution.inputContract.contractRef,
    digest: resolution.resolution.inputContractDigest });
  const contractBoundInput = Object.freeze({ contract: inputContract,
    valueRef: selection.inputRef,
    valueDigest: product.sha256Canonical(selectedInput), value: selectedInput });
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
    scope: selection.selection.scope,
    target: Object.freeze(selection.selection.target === "graph_function" ? { kind: "graph_function", handle: selection.selection.graphFunctionHandle } : { kind: selection.selection.target }),
    until: selection.selection.until,
    catalogView: view,
    allowlist: Object.freeze([...catalogView.allowlist]),
    input: contractBoundInput,
    fhMode: selection.fhMode,
    rootMode: selection.selection.rootMode,
    sourceBasis: selection.sourceBasis,
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
    graph_function: selection.selection.target === "graph_function" ? { graphFunction: { ref: resolution.resolution.graphFunctionRef, digest: resolution.resolution.graphFunctionDigest }, membership: resolution.resolution.programGraphFunctionMembership } : null,
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
    applicationResources: Object.freeze([]),
    source: Object.freeze({ kind: "none" }),
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
      requestRef: selection.requestRef,
      correlationRef: selection.correlationRef,
      eventTime: new Date().toISOString(),
      provenanceRefs: selection.provenanceRefs,
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

