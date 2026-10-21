import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const tenant = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const buildRoot = process.env.ABG_WORKSITE_BUILD_ROOT ?? join(tenant, "build/code/src");
export async function loadWorksiteOwner() {
  const load = path => import(pathToFileURL(join(buildRoot, path)).href);
  return { ...(await load("shared/digests.js")), ...(await load("product/worksite_effect.js")),
    ...(await load("product/worksite_operations.js")), ...(await load("product/environment.js")) };
}

// Cold owner coordinates deliberately do not assert ABG admission. These test
// physical owner behavior; installed/native lineage qualification is separate.
export async function worksiteFixture(product) {
  const scratch = await realpath(await mkdtemp(join(tmpdir(), "abi5-generic-worksite-fixture-")));
  const canonicalRoot = join(scratch, "worksite");
  await mkdir(canonicalRoot);
  const digest = label => product.sha256Canonical({ label });
  const id = (scheme, value) => `${scheme}://abiogenesis/${value.slice(7)}`;
  const manifest = { workspaceId: "workspace://generic-worksite/test", canonicalRoot,
    authorityMode: "trusted_developer", authorizedActorRef: "actor://generic-worksite/test" };
  const workspaceAuthorityBasis = product.constructWorkspaceAuthorityBasis({ ...manifest,
    authorityManifestRef: "manifest://generic-worksite/authority", authorityManifestDigest: product.sha256Canonical(manifest) });
  assert.equal(workspaceAuthorityBasis.kind, "workspace_authority_basis");
  const bindingBody = { workspaceId: manifest.workspaceId, authorityBasisId: workspaceAuthorityBasis.authorityBasisId,
    authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest, authorizedActorRef: manifest.authorizedActorRef,
    productSetId: "product-set://generic-worksite/test", productSetDigest: digest("products"), lockId: "lock://generic-worksite/test", lockDigest: digest("lock"),
    roots: Object.fromEntries(["toolchain", "product", "eventLog", "runtimeState", "projection", "archive"].map(name => [`${name}Root`, join(scratch, name)])) };
  const bindingDigest = product.sha256Canonical(bindingBody);
  const workspaceBinding = { kind: "workspace_binding", schemaVersion: "5.0.0", bindingId: id("workspace-binding", bindingDigest), bindingDigest,
    ...bindingBody, admissionEventRef: "event://generic-worksite/binding" };
  const grantBody = {
    definitionKey: { operationId: "abg.operation.run.invoke", memberKey: "invoke" }, definitionRef: "definition://generic-worksite/invoke", definitionDigest: digest("definition"),
    capabilityDefinition: { graphId: "capability-graph://generic-worksite/test", graphVersion: "5.0.0", graphDigest: digest("capability-graph"),
      capabilityId: "capability://abiogenesis/run.invoke", capabilityDefinitionRef: "capability-definition://generic-worksite/test", capabilityDefinitionDigest: digest("capability-definition") },
    operationContract: {
      contractCatalog: { productId: "product://generic-worksite/test", productContentDigest: digest("product"), catalogId: "catalog://generic-worksite/test", catalogVersion: "5.0.0", catalogDigest: digest("catalog") },
      flatRow: { contractId: "contract://generic-worksite/request", contractVersion: "5.0.0", contractDigest: digest("contract") },
      nestedSelector: { selectorKind: "flat_contract", definitionKey: null, slot: null, definitionRef: null },
    }, operationId: "abg.operation.run.invoke", capabilityRef: "capability://abiogenesis/run.invoke", actorRef: manifest.authorizedActorRef,
    approvalRef: workspaceAuthorityBasis.authorityBasisId, approvalDigest: workspaceAuthorityBasis.authorityBasisDigest,
    policyRef: "policy://generic-worksite/test", policyDigest: digest("policy"), scopeRef: workspaceBinding.bindingId, scopeDigest: bindingDigest,
    authorityBasisRef: workspaceAuthorityBasis.authorityBasisId, authorityBasisDigest: workspaceAuthorityBasis.authorityBasisDigest,
  };
  const grantDigest = product.sha256Canonical(grantBody);
  const capabilityGrant = { kind: "capability_grant", schemaVersion: "5.0.0", grantRef: id("capability-grant", grantDigest), grantDigest, ...grantBody };
  const rowBody = {
    requirementKey: "requirement://generic-worksite/test", requirementKeyDigest: digest("requirement"), catalogBasisDigest: digest("catalog-basis"), catalogViewDigest: digest("catalog-view"),
    publicationDigest: digest("publication"), programValidationRef: "program-validation://generic-worksite/test", graphFunctionRef: "graph-function://abiogenesis/worksite/file-parents@5",
    graphFunctionDigest: digest("graph"), graphFunctionOwnerProductId: "product://generic-worksite/test", graphFunctionPublicationDigest: digest("graph-publication"),
    nodeRef: "node://generic-worksite/test", programLocusRef: "program-locus://generic-worksite/test", implementationBindingRef: "implementation-binding://generic-worksite/test",
    implementationRef: "implementation://generic-worksite/test", packageName: "@abiogenesis/typescript-tenant", packageVersion: "5.0.0-dev.286",
    modulePath: "build/code/src/implementation/worksite_file_replace.js", namedSymbol: "realizeWorksiteFileParents", implementationOwnerProductId: "product://generic-worksite/test",
    computeRegime: "F_D", inputContractRef: "contract://generic-worksite/input", outputContractRef: "contract://generic-worksite/output",
    failureContractRef: "contract://generic-worksite/failure", refusalContractRef: "contract://generic-worksite/refusal",
    implementationBindingDigest: digest("implementation-binding"), implementationDescriptorDigest: digest("implementation-descriptor"), implementationPublicationDigest: digest("implementation-publication"),
  };
  const leafResolutionCandidateDigest = product.sha256Canonical(rowBody);
  const row = { kind: "admitted_implementation_resolution_row", schemaVersion: "5.0.0", disposition: "admitted",
    leafResolutionCandidateRef: id("leaf-resolution-candidate", leafResolutionCandidateDigest), leafResolutionCandidateDigest, ...rowBody };
  const setBody = { rows: [row] };
  const implementationSetDigest = product.sha256Canonical(setBody);
  const implementationSet = { kind: "admitted_implementation_set", schemaVersion: "5.0.0", disposition: "admitted",
    implementationSetRef: id("implementation-set", implementationSetDigest), implementationSetDigest, ...setBody, admissionEventRef: "event://generic-worksite/implementation" };
  const basisBody = { workspaceBindingId: workspaceBinding.bindingId, workspaceBindingDigest: bindingDigest, actorRef: manifest.authorizedActorRef,
    programRef: "program://generic-worksite/test", programDigest: digest("program"), graphFunctionRef: row.graphFunctionRef, graphFunctionDigest: row.graphFunctionDigest,
    implementationSetRef: implementationSet.implementationSetRef, implementationSetDigest };
  const basisDigest = product.sha256Canonical(basisBody);
  const executionBasis = { kind: "execution_basis", schemaVersion: "5.0.0", disposition: "admitted", basisRef: id("execution-basis", basisDigest), basisDigest, ...basisBody,
    admissionEventRef: "event://generic-worksite/basis" };
  const callBody = { basisId: executionBasis.basisRef, graphCallId: "graph-call://generic-worksite/test", frameId: "frame://generic-worksite/test",
    vectorIndex: 0, stageRole: "file-parents", taskOrdinal: null, attempt: 1, programLocusRef: row.programLocusRef, retryPath: [] };
  const cCallDigest = product.sha256Canonical(callBody);
  const cCall = { kind: "c_call", schemaVersion: "5.0.0", cCallRef: `c-call:${cCallDigest}`, cCallDigest, ...callBody,
    callClass: "leaf", regime: "F_D", graphFunctionRef: row.graphFunctionRef, implementationSetRef: implementationSet.implementationSetRef,
    implementationRequirementKey: row.requirementKey, implementationBindingRef: row.implementationBindingRef, implementationRef: row.implementationRef,
    inputContractRef: row.inputContractRef, outputContractRef: row.outputContractRef, failureContractRef: row.failureContractRef, refusalContractRef: row.refusalContractRef,
    openedEventRef: "event://generic-worksite/opened", fibreSelectedEventRef: "event://generic-worksite/selected" };
  const territory = product.constructWorksiteTerritory({ workspaceAuthorityBasis, workspaceBinding, relativeRoot: ".", territoryUri: pathToFileURL(canonicalRoot).href });
  assert.equal(territory.kind, "worksite_territory");
  const base = { workspaceAuthorityBasis, workspaceBinding, capabilityGrant, executionBasis, implementationSet, cCall };
  return { ...base, product, scratch, canonicalRoot, territory,
    request: async (paths = ["src/nested/main.js"], overrides = {}) => product.observeWorksiteFileParents({ ...base,
      sourceEnvelopeRef: "envelope://generic-worksite/design", sourceEnvelopeDigest: digest("envelope"),
      sourceDesignAssetRef: "asset://generic-worksite/design", sourceDesignAssetDigest: digest("design"), jobRef: "job://generic-worksite/one", jobDigest: digest("job"),
      parentWriteRoots: ["."], targets: paths.map(relativePath => ({ relativePath, territory })), ...overrides }),
    authorize: request => product.constructWorksiteFileParentsAuthorization({ ...base, request }),
    create: async (request, overrides = {}) => product.createWorksiteFileParents({ ...base, request,
      authorization: product.constructWorksiteFileParentsAuthorization({ ...base, request }), ...overrides }),
  };
}
