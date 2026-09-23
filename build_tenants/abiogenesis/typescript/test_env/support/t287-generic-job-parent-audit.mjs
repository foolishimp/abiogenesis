import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

/** Historical gate-body reconstruction only. Every value comes from existing
 * prefix/CCall/environment owners. The historical read explicitly does NOT
 * assert current-prefix authority, and the physical function is cut before
 * its first writer call. No store is opened for append and no event is made. */
export async function auditRetainedGenericParentGate({ scratch, sourceRoot }) {
  const installedRoot = join(scratch, "consumer/node_modules/@abiogenesis/typescript-tenant");
  const load = (root, name) => import(pathToFileURL(join(root, "build/code/src", name + ".js")).href);
  const [abg, gtl, product, effect, authorityOwner, physical, jobs, contracts, calls, executions] = await Promise.all([
    "abg/index", "gtl/index", "product/index", "product/worksite_effect", "implementation/leaf_execution_authority",
    "implementation/worksite_file_replace", "abg/semantic_job", "product/contracts", "abg/c_call", "abg/execution_basis",
  ].map(name => load(installedRoot, name)));
  const [outcome, invocation] = await Promise.all(["full-outcome.json", "full-call.json"].map(async name =>
    JSON.parse(await readFile(join(scratch, name), "utf8"))));
  const full = outcome.resources.eventResource.closeHandoff.prefix, events = abg.readRuntimeEventsAtDurablePrefix(full);
  const selected = events.find(e => e.kind === "c_call_fibre_selected" && e.payload.implementationRef === physical.WORKSITE_FILE_PARENTS_IMPLEMENTATION.implementationRef);
  assert.ok(selected);
  const evidenced = events.find(e => e.kind === "c_call_evidenced" && e.aggregateId === selected.aggregateId); assert.ok(evidenced);
  const originalBytes = await readFile(fileURLToPath(full.eventLogRef));
  const cutBytes = Buffer.from(originalBytes.subarray(0, full.prefixLength).toString("utf8").split("\n").slice(0, evidenced.admissionOrdinal - 1).join("\n") + "\n");
  const body = { kind: "durable_prefix_coordinate", schemaVersion: "5.0.0", eventLogRef: full.eventLogRef,
    prefixLength: cutBytes.length, prefixDigest: product.sha256Bytes(cutBytes), storeIdentity: full.storeIdentity };
  const cut = { ...body, coordinateDigest: product.sha256Canonical(body) };
  const before = abg.readRuntimeEventsAtDurablePrefix(cut), prefix = abg.selectValidatedRuntimeEventPrefix(before);
  assert.throws(() => abg.readRuntimeEventsAtDurablePrefix(cut, { requireCurrent: true }), "closed history does not grant current dispatch authority");
  const opened = before.find(e => e.kind === "c_call_opened" && e.aggregateId === selected.aggregateId);
  const basis = abg.rehydrateExecutionBasisAtPrefix(prefix, opened.basisId); assert.ok(basis);
  const set = abg.rehydrateAdmittedImplementationSetAtPrefix(prefix, basis.implementationSetRef); assert.ok(set);
  const resolution = set.rows.find(row => row.implementationRef === selected.payload.implementationRef && row.graphFunctionRef === basis.graphFunctionRef); assert.ok(resolution);
  const publications = invocation.resources.catalog.boundPublications;
  const publication = publications.find(p => p.programs.some(p => p.programRef === basis.programRef)); assert.ok(publication);
  const graphFunction = publications.flatMap(p => p.graphFunctions).find(g => g.name === basis.graphFunctionRef); assert.ok(graphFunction);
  const graph = gtl.materializeGraph(graphFunction, { invocationAdmissionRef: basis.invocationAdmissionRef,
    admittedInputRef: basis.rawInputAdmissionRef, admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue });
  const cCall = calls.projectOpenedCCallCarrierAtPrefix(prefix, graph, opened.aggregateId); assert.ok(cCall);
  const environment = abg.projectExactPrefixWorkspaceEnvironment(cut, { ref: basis.workspaceBindingId, digest: basis.workspaceBindingDigest });
  assert.equal(environment.kind, "exact_prefix_workspace_environment");
  const request = basis.rawInputValue, hash = product.sha256Canonical;
  const authority = authorityOwner.constructLeafExecutionAuthority({ actorRef: basis.actorRef, workspaceBinding: environment.workspaceBinding,
    workspaceBindingIdentity: basis.workspaceBindingId, workspaceBindingDigest: basis.workspaceBindingDigest,
    executionBasis: basis, executionBasisRef: basis.basisRef, executionBasisDigest: basis.basisDigest,
    programRef: basis.programRef, programDigest: basis.programDigest, programPublication: publication,
    graphFunctionRef: basis.graphFunctionRef, graphFunctionDigest: basis.graphFunctionDigest,
    cCall, cCallRef: cCall.cCallRef, cCallDigest: cCall.cCallDigest, predecessorPrefix: cut,
    implementationSet: set, implementationSetRef: set.implementationSetRef, implementationSetDigest: set.implementationSetDigest,
    leafResolutionCandidateRef: resolution.leafResolutionCandidateRef, leafResolutionCandidateDigest: resolution.leafResolutionCandidateDigest,
    implementationResolutionRef: `implementation-resolution://abiogenesis/${hash(resolution).slice(7)}`,
    implementationResolutionDigest: hash(resolution), implementationResolution: resolution,
    implementationBindingRef: resolution.implementationBindingRef, implementationBindingDigest: resolution.implementationBindingDigest,
    implementationRef: resolution.implementationRef, implementationOwnerRef: resolution.implementationOwnerProductId,
    effectUri: effect.WORKSITE_FILE_PARENTS_EFFECT_URI, handlerRef: effect.WORKSITE_FILE_PARENTS_HANDLER_REF,
    handlerDigest: effect.WORKSITE_FILE_PARENTS_HANDLER_DIGEST,
    capabilityGrantRef: request.capabilityGrant.grantRef, capabilityGrantDigest: request.capabilityGrant.grantDigest });
  const occurrence = { executionAuthority: authority, cCallRef: cCall.cCallRef, runId: cCall.runId, graphCallId: cCall.graphCallId,
    frameId: cCall.frameId, programLocusRef: cCall.programLocusRef, taskOrdinal: cCall.taskOrdinal, attempt: cCall.attempt };
  const install = environment.productInstalls.find(i => i.productId === resolution.implementationOwnerProductId); assert.ok(install);
  const ownerPublication = publications.find(p => product.modulePublicationSemanticDigest(p) === resolution.implementationPublicationDigest); assert.ok(ownerPublication);
  assert.equal(ownerPublication.implementationBindings.filter(b => b.bindingRef === resolution.implementationBindingRef &&
    b.implementationRef === resolution.implementationRef && b.packageName === resolution.packageName && b.packageVersion === resolution.packageVersion &&
    b.modulePath === resolution.modulePath && b.namedSymbol === resolution.namedSymbol).length, 1);
  assert.equal(install.contributionManifest.publicationBindings.filter(b => b.moduleRef === ownerPublication.moduleRef &&
    b.publicationDigest === resolution.implementationPublicationDigest).length, 1);
  const owner = { install, coordinate: { productId: install.productId, publicationDigest: resolution.implementationPublicationDigest,
    declarationKind: "implementation_binding", declarationRef: resolution.implementationBindingRef } };
  const historicalRead = coordinate => {
    assert.deepEqual(coordinate, cut); return abg.readRuntimeEventsAtDurablePrefix(cut);
  };
  const scope = { ...abg, ...calls, ...executions, ...product, ...effect, ...authorityOwner, ...physical, ...contracts,
    WORKSITE_FILE_PARENTS_IDS: gtl.WORKSITE_FILE_PARENTS_IDS, validateWorksiteFileParentsPlanAtPrefix: jobs.validateWorksiteFileParentsPlanAtPrefix,
    authority: { implementationSet: set }, implementationOwner: candidate => hash(candidate) === hash(resolution) ? owner : null,
    graphFunctionByRef: ref => ref === graphFunction.name ? graphFunction : null,
    readRuntimeEventsAtDurablePrefix: historicalRead, semanticJobOwner: jobs };
  const construct = text => Function(...Object.keys(scope), `"use strict";return (${text});`)(...Object.values(scope));
  const gateText = async root => {
    const text = await readFile(join(root, "build/code/src/implementation/leaf_invocation_port.js"), "utf8");
    const start = text.indexOf("function hasExactWorksiteLeafExecutionAuthority(");
    const end = text.indexOf("function resolveWorkerContracts(", start); assert.ok(start > 0 && end > start);
    return text.slice(start, end).trim();
  };
  const call = { input: request, inputDigest: hash(request), occurrence };
  assert.equal(construct(await gateText(installedRoot))(call, resolution), false, "actual old gate refuses this closed parent arm");
  assert.equal(construct(await gateText(sourceRoot))(call, resolution), true, "all repaired gate relations hold at the authenticated historical cut; currentness is not asserted");
  const physicalText = await readFile(join(installedRoot, "build/code/src/implementation/worksite_file_replace.js"), "utf8");
  const start = physicalText.indexOf("export async function realizeWorksiteFileParents(");
  const end = physicalText.indexOf("const outcome = await createWorksiteFileParents(", start); assert.ok(start >= 0 && end > start);
  const { kind: _kind, schemaVersion: _schema, descriptorDigest: _digest, ...descriptor } = physical.WORKSITE_FILE_PARENTS_IMPLEMENTATION_DESCRIPTOR;
  scope.fileParentsDescriptorBody = descriptor;
  const prefixFunction = physicalText.slice(start, end).replace(/^export /, "")
    .replace('await import("../abg/semantic_job.js")', "semanticJobOwner") + "return { authorization, protectedInstallRoots }; }";
  const checked = await construct(prefixFunction)(request, occurrence, resolution, hash(request));
  assert.ok(checked); assert.equal(checked.authorization.kind, "worksite_file_parents_authorization");
  assert.equal(effect.isWorksiteFileParentsAuthorization(checked.authorization), true);
  assert.deepEqual(await readFile(fileURLToPath(full.eventLogRef)), originalBytes, "no event or historical byte was changed");
  return { scope: "historical dispatch and pre-effect guard relations only; no current authority or physical dispatch claim",
    scratch, prefix: full, auditedCut: cut, admittedPlanGuard: true, oldGate: false, correctedGate: true,
    physicalPreEffectRelations: true, parentAuthorizationRef: checked.authorization.authorizationRef, physicalWriterCalls: 0 };
}
