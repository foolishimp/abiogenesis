// T-287 R2-b: the route-declared result.assess binding through the installed
// transport. One installed language Run supplies an admitted C-call result, its
// evidence and its execution basis; result.assess is then authorized through the
// admission authority and run by the installed CLI against the same event log.
// product.materialize has no installed binding (R2-b stop: its artifact event has
// no checked ingress), so it has no case here.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInstalledLanguageTest } from '../support/installed-language-test.mjs';
import { runInstalledCliRequest } from '../support/registered-graph-selection.mjs';

const packageRoot = fileURLToPath(new URL('../..', import.meta.url));
const SLOT_KEYS = ['workspace_binding', 'product_set', 'dependency_lock', 'catalog_scope', 'execution_program', 'graph_function',
  'input_contract', 'session_policy', 'capability_grants', 'actor', 'transport_steering', 'verification_references', 'execution_basis'];

async function installedOwners(proof) {
  const e = proof.environment, load = p => import(pathToFileURL(join(e.installedRoot, `build/code/src/${p}.js`)).href);
  const product = await load('product/index');
  const ownerRequest = { artifactPath: e.artifactPaths[0], artifactRef: basename(e.artifactPaths[0]),
    expectedArtifactDigest: e.verified.artifactDigest, expectedProductContentDigest: e.verified.productContentDigest,
    expectedManifestDigest: e.verified.manifestDigest, expectedProductId: e.verified.productId,
    expectedPackageName: e.verified.packageName, expectedPackageVersion: e.verified.packageVersion };
  // One verification by the installed owner, reused by every grant construction below.
  const verified = await product.verifyProduct(ownerRequest);
  assert.equal(verified.disposition, 'verified', JSON.stringify(verified));
  assert.equal(verified.artifactDigest, e.verified.artifactDigest);
  return { e, product, ownerRequest, verified, publicApi: await load('public/index'), events: await load('abg/event_store'),
    authority: await load('product/admission_authority'), environment: await load('product/environment'),
    contracts: await load('product/interaction_operation_contracts') };
}

// The authorized installed DefinitionCall for result.assess at one handoff.
async function authorizedAssessCall(c, handoff, request, identity) {
  const { e, product, publicApi } = c, hash = product.sha256Canonical;
  const packet = c.contracts.RESULT_OPERATION_CONTRACTS.assess, key = packet.definitionKey;
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
    d.definitionKey.operationId === key.operationId && d.definitionKey.memberKey === key.memberKey);
  const binding = { ref: e.workspaceBinding.bindingId, digest: e.workspaceBinding.bindingDigest };
  const env = c.authority.admitCapabilityEnvironment(product.admissionEnvironmentSelection(handoff.prefix, binding));
  const actorRef = env.workspaceAuthorityBasis.authorizedActorRef;
  const slots = Object.fromEntries(SLOT_KEYS.map(k => [k, null]));
  Object.assign(slots, { workspace_binding: binding, product_set: env.productInstalls.map(c.environment.productInstallCoordinate),
    dependency_lock: { ref: env.resolvedProductLock.lockId, digest: env.resolvedProductLock.lockDigest },
    actor: { actor: { ref: actorRef, digest: hash({ actorRef }) }, attribution: { ref: `attribution://t287-r2b/${identity}`, digest: hash(identity) } },
    execution_basis: request.currentBasis });
  const resources = { kind: 'result_assess_resource_assertion', schemaVersion: '5.0.0',
    eventResource: { kind: 'reopen_abg_event_resource', schemaVersion: '5.0.0', closeHandoff: handoff, handoffDigest: hash(handoff) } };
  const basis = { kind: 'admission_capability_data', schemaVersion: '5.0.0',
    definition: { definitionKey: definition.definitionKey, definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest,
      owner: { ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest } },
    ownerArtifact: { request: c.ownerRequest, verified: c.verified }, request,
    resourceScope: { resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots) },
    boundEnvironment: product.admissionEnvironmentSelection(handoff.prefix, binding) };
  const authorityValue = { actorRef, authorityMode: 'trusted_developer' };
  const approvalValue = { decision: 'allow', actorRef, definitionRef: definition.definitionRef, definitionDigest: definition.definitionDigest,
    requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest };
  const authority = { kind: 'resolved_admission_authority', schemaVersion: '5.0.0', actorRef, authorityMode: 'trusted_developer',
    authority: { ref: 'authority://t287-r2b/developer', digest: hash(authorityValue), value: authorityValue },
    approval: { ref: `approval://t287-r2b/${identity}`, digest: hash(approvalValue), value: approvalValue } };
  const grants = await Promise.all(definition.capabilityRefs.map(cap => product.constructCapabilityGrant(authority, actorRef, key.operationId, cap,
    { kind: 'admission_capability_grant_construction_basis', fixedPacket: packet, data: basis })));
  slots.capability_grants = { requiredCapabilityRefs: definition.capabilityRefs, grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) };
  const contractCatalog = e.verified.definitionContractCoordinates.operations.find(o => o.operationId === key.operationId)
    .members.find(m => m.memberKey === key.memberKey).slots.request.contractCatalog;
  const call = publicApi.constructInstalledPublicDefinitionCall({ product, installedPublic: publicApi,
    definitionContractCoordinates: e.verified.definitionContractCoordinates, contractCatalog, ...key, request, slots,
    resources: { ...resources, admissionAuthority: { basis, authority, grants } }, requestRef: `public-request://t287-r2b/${identity}`,
    correlationRef: `correlation://t287-r2b/${identity}`, eventTime: '2026-10-27T00:00:00.000Z', provenanceRefs: ['provenance://t287-r2b/lane'] });
  return { call, grants, actorRef };
}

test('T-287 R2-b result.assess through the installed transport: the declared result and an owner refusal', { timeout: 1800000 }, async t => {
  const proof = await runInstalledLanguageTest(t, packageRoot, { readback: false, identity: 't287-r2b-assess' });
  const c = await installedOwners(proof), hash = c.product.sha256Canonical;
  let handoff = proof.handoff;
  const rows = c.events.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  const results = rows.filter(r => r.kind === 'c_call_result_admitted');
  assert.equal(results.length, 1);
  const result = results[0];
  const basisEvent = rows.find(r => r.kind === 'basis_admitted' && r.payload.basisRef === result.basisId);
  assert.equal(basisEvent.payload.actorRef, c.e.workspaceBinding.authorizedActorRef);
  const currentBasis = { ref: basisEvent.payload.basisRef, digest: basisEvent.payload.basisDigest };
  const evidence = rows.filter(r => r.kind === 'c_call_evidenced' && r.aggregateId === result.payload.cCallRef)
    .map(r => ({ ref: r.payload.evidenceRef, digest: r.payload.evidenceDigest }));
  assert.deepEqual(evidence.map(r => r.ref).sort(), [...result.payload.evidenceRefs].sort());
  const expectedResult = { ref: result.payload.resultRef, digest: result.payload.resultDigest };
  const contractRows = c.e.admittedInstalls.flatMap(i => i.publicContracts).filter(r => r.contractId === 'abg.operation.result.assess');
  assert.equal(contractRows.length, 1);
  const assessmentContract = { ref: contractRows[0].contractId, digest: contractRows[0].contractDigest };
  const assessRequest = suppliedEvidence => {
    const value = { kind: 'result_assessment_value', schemaVersion: '5.0.0', expectedResult, disposition: 'admitted', closureEligible: true, residuals: [] };
    const valueDigest = hash(value);
    return { expectedResult, assessmentContract,
      assessment: { kind: 'contract_admitted_assessment_value', schemaVersion: '5.0.0', contract: assessmentContract,
        valueRef: `assessment-value://abiogenesis/${valueDigest.slice('sha256:'.length)}`, valueDigest, value },
      evidence: suppliedEvidence, currentBasis };
  };
  const run = async (identity, request) => {
    const made = await authorizedAssessCall(c, handoff, request, identity);
    assert.equal(made.call.resources.kind, 'result_assess_resource_assertion');
    assert.equal(made.call.resources.eventResource.kind, 'reopen_abg_event_resource');
    const before = await readFile(new URL(handoff.prefix.eventLogRef));
    const output = (await runInstalledCliRequest({ scratch: c.e.scratch, installedRoot: c.e.installedRoot, identity,
      acquisition: { kind: 'reopen', closeHandoff: handoff }, call: made.call, expectedExitCode: null })).output;
    assert.equal(output.kind, 'installed_definition_call_transport_result', JSON.stringify(output));
    const receipt = output.receipt;
    assert.equal(receipt.failure, null, JSON.stringify(receipt));
    assert.equal(receipt.resources.kind, 'result_assess_resource_receipt');
    assert.equal(receipt.resources.eventResource.kind, 'abg_event_resource_receipt');
    assert.deepEqual(receipt.resources.eventResource.entryPrefix, handoff.prefix);
    const entry = handoff;
    handoff = receipt.resources.eventResource.closeHandoff;
    const after = await readFile(new URL(handoff.prefix.eventLogRef));
    assert.equal(after.subarray(0, before.length).equals(before), true, `${identity} preserves its entry bytes`);
    return { made, receipt, entry, before, after };
  };

  await t.test('an owner refusal maps onto the declared reason with its issuePaths and evidence', async () => {
    const foreign = { ref: 'evidence://abiogenesis/' + '0'.repeat(64), digest: 'sha256:' + '0'.repeat(64) };
    const { receipt, before, after } = await run('assess-refusal', assessRequest([foreign]));
    assert.equal(receipt.exitCode, 1);
    assert.deepEqual(receipt.ownerOutput, { outcomeKind: 'refusal',
      value: { code: 'evidence_mismatch', issuePaths: ['/evidence'], evidenceRefs: [foreign.ref] } });
    assert.equal(after.equals(before), true, 'a refusal appends nothing');
  });

  await t.test('the declared result from the owner, its one assessed event, and its resources', async () => {
    const request = assessRequest(evidence);
    const { made, receipt, entry } = await run('assess-positive', request);
    assert.equal(receipt.exitCode, 0);
    assert.equal(receipt.ownerOutput.outcomeKind, 'result');
    const value = receipt.ownerOutput.value;
    assert.deepEqual(Object.keys(value).sort(), ['assessment', 'closureEligible', 'disposition', 'evidence', 'residuals']);
    assert.equal(value.disposition, 'admitted');
    assert.equal(value.closureEligible, true);
    assert.deepEqual(value.residuals, []);
    assert.deepEqual(value.evidence, evidence);
    const prior = c.events.readRuntimeEventsAtDurablePrefix(entry.prefix);
    const current = c.events.readRuntimeEventsAtDurablePrefix(handoff.prefix);
    assert.equal(current.length, prior.length + 1);
    const assessed = current.at(-1);
    assert.equal(assessed.kind, 'assessed');
    assert.equal(assessed.aggregateId, result.payload.cCallRef);
    assert.equal(assessed.basisId, currentBasis.ref);
    assert.ok(assessed.causationEventRefs.includes(c.e.workspaceBinding.admissionEventRef), 'caused by the binding admission');
    assert.equal(assessed.payload.assessmentRef, value.assessment.ref);
    assert.equal(assessed.payload.assessmentDigest, value.assessment.digest);
    assert.equal(assessed.payload.assessment.assessmentContract.digest, assessmentContract.digest);
    assert.equal(assessed.payload.actorRef, made.actorRef);
    assert.equal(assessed.payload.actorDigest, hash({ actorRef: made.actorRef }));
    // The owner-native grant is the projection of the admitted Public grant row.
    const [grant] = made.grants;
    const grantDigest = hash({ actorRef: grant.actorRef, operationId: grant.operationId, capabilityRef: grant.capabilityRef });
    assert.equal(grant.capabilityRef, 'abg.capability.runtime.admit-fp-result@5');
    assert.equal(assessed.payload.capabilityGrantDigest, grantDigest);
    assert.equal(assessed.payload.capabilityGrantRef, `capability-grant://abiogenesis/${grantDigest.slice('sha256:'.length)}`);
    assert.equal(assessed.payload.invocationRef, made.call.invocation.invocationRef);
    assert.equal(assessed.payload.executionBasisRef, currentBasis.ref);
  });
});
