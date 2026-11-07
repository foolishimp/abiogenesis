// T-287 R2-b: the route-declared result.assess binding through the installed
// transport. One installed language Run supplies an admitted C-call result, its
// evidence and its execution basis; result.assess is then authorized through the
// admission authority and run by the installed CLI against the same event log.
// T-287 R2-c: product.materialize (context_bootstrap, configuration) through the same
// transport and log, each with its one admitted artifact event, its truth and its files.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, readdir, writeFile } from 'node:fs/promises';
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

// The authorized installed DefinitionCall for one product.materialize member at one handoff.
async function authorizedMaterializeCall(c, handoff, memberKey, request, identity) {
  const { e, product, publicApi } = c, hash = product.sha256Canonical;
  const contracts = await import(pathToFileURL(join(e.installedRoot, 'build/code/src/product/materialization_operation_contracts.js')).href);
  const packet = contracts.MATERIALIZATION_OPERATION_CONTRACTS[memberKey], key = packet.definitionKey;
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(d =>
    d.definitionKey.operationId === key.operationId && d.definitionKey.memberKey === key.memberKey);
  const binding = { ref: e.workspaceBinding.bindingId, digest: e.workspaceBinding.bindingDigest };
  const env = c.authority.admitCapabilityEnvironment(product.admissionEnvironmentSelection(handoff.prefix, binding));
  const actorRef = env.workspaceAuthorityBasis.authorizedActorRef;
  const slots = Object.fromEntries(SLOT_KEYS.map(k => [k, null]));
  Object.assign(slots, { workspace_binding: binding, product_set: env.productInstalls.map(c.environment.productInstallCoordinate),
    dependency_lock: { ref: env.resolvedProductLock.lockId, digest: env.resolvedProductLock.lockDigest },
    actor: { actor: { ref: actorRef, digest: hash({ actorRef }) }, attribution: { ref: `attribution://t287-r2c/${identity}`, digest: hash(identity) } } });
  const resources = { kind: 'product_materialize_resource_assertion', schemaVersion: '5.0.0',
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
    authority: { ref: 'authority://t287-r2c/developer', digest: hash(authorityValue), value: authorityValue },
    approval: { ref: `approval://t287-r2c/${identity}`, digest: hash(approvalValue), value: approvalValue } };
  const grants = await Promise.all(definition.capabilityRefs.map(cap => product.constructCapabilityGrant(authority, actorRef, key.operationId, cap,
    { kind: 'admission_capability_grant_construction_basis', fixedPacket: packet, data: basis })));
  slots.capability_grants = { requiredCapabilityRefs: definition.capabilityRefs, grants: grants.map(g => ({ ref: g.grantRef, digest: g.grantDigest })) };
  const contractCatalog = e.verified.definitionContractCoordinates.operations.find(o => o.operationId === key.operationId)
    .members.find(m => m.memberKey === key.memberKey).slots.request.contractCatalog;
  const call = publicApi.constructInstalledPublicDefinitionCall({ product, installedPublic: publicApi,
    definitionContractCoordinates: e.verified.definitionContractCoordinates, contractCatalog, ...key, request, slots,
    resources: { ...resources, admissionAuthority: { basis, authority, grants } }, requestRef: `public-request://t287-r2c/${identity}`,
    correlationRef: `correlation://t287-r2c/${identity}`, eventTime: '2026-10-28T00:00:00.000Z', provenanceRefs: ['provenance://t287-r2c/lane'] });
  return { call, env };
}

// Every file under one directory, by path, with its bytes' digest (absent directory: none).
async function filesUnder(product, root) {
  const out = {};
  const walk = async dir => {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path); else out[path] = product.sha256Bytes(await readFile(path));
    }
  };
  await walk(root);
  return out;
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

  // T-287 R2-c: product.materialize through the same transport and log.
  const truthModule = await import(pathToFileURL(join(c.e.installedRoot, 'build/code/src/abg/artifact_truth.js')).href);
  const materializations = join(c.e.workspaceBinding.roots.projectionRoot, 'product-materializations');
  const rulingsRows = c.e.admittedInstalls.flatMap(i => i.publicContracts).filter(r => r.contractId === 'abg.schema.review-rulings');
  assert.equal(rulingsRows.length, 1);
  const rulings = { ref: rulingsRows[0].contractId, digest: rulingsRows[0].contractDigest };
  const ruling = [{ rulingRef: 'ruling://t287-r2c/1', rulingKind: 'deferment', findingRefs: [], rationaleRef: 'rationale://t287-r2c/1', payloadRef: 'payload://t287-r2c/1' }];
  const bindingPair = { ref: c.e.workspaceBinding.bindingId, digest: c.e.workspaceBinding.bindingDigest };
  const runMaterialize = async (identity, memberKey, request) => {
    const made = await authorizedMaterializeCall(c, handoff, memberKey, request, identity);
    assert.equal(made.call.resources.kind, 'product_materialize_resource_assertion');
    assert.equal(made.call.resources.eventResource.kind, 'reopen_abg_event_resource');
    const before = await readFile(new URL(handoff.prefix.eventLogRef));
    const filesBefore = await filesUnder(c.product, materializations);
    const output = (await runInstalledCliRequest({ scratch: c.e.scratch, installedRoot: c.e.installedRoot, identity,
      acquisition: { kind: 'reopen', closeHandoff: handoff }, call: made.call, expectedExitCode: null })).output;
    assert.equal(output.kind, 'installed_definition_call_transport_result', JSON.stringify(output));
    const receipt = output.receipt;
    assert.equal(receipt.failure, null, JSON.stringify(receipt));
    assert.equal(receipt.resources.kind, 'product_materialize_resource_receipt');
    assert.equal(receipt.resources.eventResource.kind, 'abg_event_resource_receipt');
    assert.deepEqual(receipt.resources.eventResource.entryPrefix, handoff.prefix);
    const entry = handoff;
    handoff = receipt.resources.eventResource.closeHandoff;
    const after = await readFile(new URL(handoff.prefix.eventLogRef));
    assert.equal(after.subarray(0, before.length).equals(before), true, `${identity} preserves its entry bytes`);
    return { made, receipt, entry, before, after, filesBefore };
  };
  // The positive case: the declared result, its one artifact event, its truth and its files.
  const materialized = async (identity, memberKey, request) => {
    const run = await runMaterialize(identity, memberKey, request);
    const { made, receipt, entry } = run;
    assert.equal(receipt.exitCode, 0, JSON.stringify(receipt.ownerOutput));
    assert.equal(receipt.ownerOutput.outcomeKind, 'result');
    const value = receipt.ownerOutput.value;
    assert.deepEqual(Object.keys(value).sort(), ['content', 'manifest', 'materializationKind', 'provenance', 'residuals', 'rows', 'subject']);
    assert.equal(value.materializationKind, memberKey);
    const workspacePair = { ref: made.env.workspaceAuthorityBasis.workspaceId, digest: made.env.workspaceAuthorityBasis.authorityBasisDigest };
    assert.deepEqual(value.subject, workspacePair);
    assert.deepEqual(value.residuals, []);
    assert.ok(value.rows.every(row => row.disposition === 'created'));
    assert.ok(value.provenance.some(p => p.ref === workspacePair.ref && p.digest === workspacePair.digest));
    assert.ok(value.provenance.some(p => p.ref === bindingPair.ref && p.digest === bindingPair.digest));
    const prior = c.events.readRuntimeEventsAtDurablePrefix(entry.prefix);
    const current = c.events.readRuntimeEventsAtDurablePrefix(handoff.prefix);
    assert.equal(current.length, prior.length + 1);
    const event = current.at(-1);
    assert.equal(event.kind, 'public_operation_artifact_admitted');
    assert.equal(event.payload.operationId, 'abg.operation.product.materialize');
    assert.equal(event.payload.memberKey, memberKey);
    assert.equal(event.payload.invocationRef, made.call.invocation.invocationRef);
    assert.equal(event.payload.authorityScopeRef, value.manifest.ref);
    assert.equal(event.payload.authorityScopeDigest, value.manifest.digest);
    assert.equal(event.payload.artifactRef, value.content.ref);
    assert.equal(event.payload.artifactDigest, value.content.digest);
    assert.deepEqual(event.causationEventRefs, [c.e.workspaceBinding.admissionEventRef]);
    assert.equal(event.payload.artifact.kind, 'product_materialization_artifact');
    // The truth reconstructed from the log by artifact_truth: one row at the scope, equal to the result's coordinates.
    const truth = truthModule.projectExactPrefixArtifactTruth(handoff.prefix);
    assert.equal(truth.kind, 'exact_prefix_artifact_truth_projection', JSON.stringify(truth));
    const rows = truth.rows.filter(row => row.authorityScopeRef === value.manifest.ref);
    assert.equal(rows.length, 1);
    const row = rows[0];
    assert.deepEqual([row.operationId, row.memberKey, row.authorityScopeDigest, row.artifactRef, row.artifactDigest, row.admissionEventRef],
      ['abg.operation.product.materialize', memberKey, value.manifest.digest, value.content.ref, value.content.digest, event.eventId]);
    const owned = row.artifact.result;
    assert.deepEqual(owned.subject, { workspaceRef: workspacePair.ref, workspaceDigest: workspacePair.digest,
      bindingRef: bindingPair.ref, bindingDigest: bindingPair.digest });
    assert.deepEqual([owned.manifest.manifestRef, owned.manifest.manifestDigest, owned.content.contentRef, owned.content.contentDigest],
      [value.manifest.ref, value.manifest.digest, value.content.ref, value.content.digest]);
    assert.deepEqual(owned.rows.map(r => ({ disposition: r.disposition, content: { ref: r.assetRef, digest: r.assetDigest } })), value.rows);
    assert.deepEqual(truthModule.projectExactPrefixArtifactTruth(entry.prefix).rows.filter(r => r.authorityScopeRef === value.manifest.ref), []);
    // The files the owner wrote, present at the manifest.
    const manifest = JSON.parse(await readFile(owned.manifest.manifestPath, 'utf8'));
    const { manifestRef, manifestDigest, ...manifestBody } = manifest;
    assert.deepEqual([manifestRef, manifestDigest], [value.manifest.ref, value.manifest.digest]);
    assert.equal(c.product.sha256Canonical(manifestBody), value.manifest.digest);
    assert.deepEqual(manifest.rows, owned.rows);
    for (const asset of manifest.rows) {
      const { assetRef, assetDigest, contentRef, contentDigest, ...assetBody } = JSON.parse(await readFile(asset.assetPath, 'utf8'));
      assert.equal(assetRef ?? contentRef, asset.assetRef);
      assert.equal(assetDigest ?? contentDigest, asset.assetDigest);
      assert.equal(c.product.sha256Canonical(assetBody), asset.assetDigest);
    }
    return { ...run, value, owned };
  };
  // The refusing case: a declared reason from an owner refusal, its issuePaths, the log bytes and the files unchanged.
  const refused = async (identity, memberKey, request, expected) => {
    const run = await runMaterialize(identity, memberKey, request);
    assert.equal(run.receipt.exitCode, 1, JSON.stringify(run.receipt.ownerOutput));
    assert.deepEqual(run.receipt.ownerOutput, { outcomeKind: 'refusal', value: expected });
    assert.equal(run.after.equals(run.before), true, 'a refusal appends nothing');
    assert.deepEqual(await filesUnder(c.product, materializations), run.filesBefore, 'a refusal writes no file');
    return run;
  };
  const workspace = () => {
    const env = c.authority.admitCapabilityEnvironment(c.product.admissionEnvironmentSelection(handoff.prefix, bindingPair));
    return { ref: env.workspaceAuthorityBasis.workspaceId, digest: env.workspaceAuthorityBasis.authorityBasisDigest };
  };

  await t.test('product.materialize#context_bootstrap: the declared result, its one artifact event, its truth and its files', async () => {
    const { owned } = await materialized('materialize-context-positive', 'context_bootstrap', { workspace: workspace(), binding: bindingPair,
      contextInputs: [{ name: 'review-rulings/deferment', contract: rulings, value: ruling }, { name: 'review-rulings/empty', contract: rulings, value: [] }] });
    assert.deepEqual(owned.rows.map(r => r.inputRef), ['review-rulings/deferment', 'review-rulings/empty']);
    assert.deepEqual(owned.rows.map(r => r.inputDigest), [c.product.sha256Canonical(ruling), c.product.sha256Canonical([])]);
  });

  await t.test('product.materialize#context_bootstrap: an owner refusal maps onto the declared reason with its issuePaths', async () => {
    // Two declared inputs with one content: the owner refuses its non-unique content addresses before any write.
    await refused('materialize-context-refusal', 'context_bootstrap', { workspace: workspace(), binding: bindingPair,
      contextInputs: [{ name: 'review-rulings/a', contract: rulings, value: [] }, { name: 'review-rulings/b', contract: rulings, value: [] }] },
    { code: 'input_mismatch', issuePaths: ['/contextInputs'], evidenceRefs: [] });
  });

  let configured;
  await t.test('product.materialize#configuration: the declared result, its one artifact event, its truth and its files', async () => {
    configured = await materialized('materialize-configuration-positive', 'configuration',
      { configurationContract: rulings, binding: bindingPair, inputs: ruling });
    assert.deepEqual(configured.owned.rows.map(r => [r.inputRef, r.inputDigest]), [[rulings.ref, c.product.sha256Canonical(ruling)]]);
    assert.ok(configured.value.provenance.some(p => p.ref === rulings.ref && p.digest === rulings.digest));
  });

  await t.test('product.materialize#configuration: an owner refusal maps onto the declared reason with its issuePaths', async () => {
    // The materialized content path now holds unequal bytes: the owner refuses to overwrite authority.
    const contentPath = configured.owned.content.contentPath;
    await writeFile(contentPath, '{}\n');
    await refused('materialize-configuration-refusal', 'configuration',
      { configurationContract: rulings, binding: bindingPair, inputs: ruling },
      { code: 'authority_mismatch', issuePaths: ['/binding'], evidenceRefs: [] });
    assert.equal(await readFile(contentPath, 'utf8'), '{}\n');
  });
});

// The materialization site of the shared schema-asset admission: the binding's
// own request admission over one supplied bound environment. The admission,
// `admitInstalledSchemaAsset` and the refusal mapping run as built; the module's
// request admission is reached by one appended export of its own constant.
test('T-287 R3-b product.materialize lands each schema-asset admission refusal as the contract member', async t => {
  const { mkdtemp, mkdir, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { dirname, resolve } = await import('node:path');
  const { SourceTextModule, SyntheticModule } = await import('node:vm');
  const { sha256Bytes, sha256Canonical: hash } = await import('../../build/code/src/shared/digests.js');
  const installedRoot = await mkdtemp(join(tmpdir(), 't287-r3b-materialize-'));
  t.after(() => rm(installedRoot, { recursive: true, force: true }));
  const contractId = 'abg.schema.r3b-configuration', productId = 'product://abiogenesis/r3b-materialize@5';
  const documentBytes = dialect => Buffer.from(JSON.stringify({ $schema: dialect, $id: contractId, type: 'array', items: { type: 'string' } }));
  const current = documentBytes('https://json-schema.org/draft/2020-12/schema'), draft07 = documentBytes('http://json-schema.org/draft-07/schema#');
  await mkdir(join(installedRoot, 'schemas'), { recursive: true });
  await writeFile(join(installedRoot, 'schemas/configuration.schema.json'), current);
  await writeFile(join(installedRoot, 'schemas/draft07.schema.json'), draft07);
  await writeFile(join(installedRoot, 'schemas/changed.schema.json'), Buffer.concat([current, Buffer.from('\n')]));
  const contractRow = (locator, bytes = current) => ({ contractKind: 'schema_asset', contractId, owningProduct: productId, contractVersion: '5.0.0',
    contractDigest: sha256Bytes(bytes), ...(locator === null ? {} : { assetLocator: { mediaType: 'application/schema+json',
      path: 'schemas/configuration.schema.json', contentDigest: sha256Bytes(bytes), ...locator } }) });
  const binding = { bindingId: 'binding://abiogenesis/r3b-materialize@5', bindingDigest: hash('binding') };
  const environment = row => ({ kind: 'exact_prefix_workspace_environment', workspaceBinding: binding,
    workspaceAuthorityBasis: { workspaceId: 'workspace://abiogenesis/r3b-materialize@5', authorityBasisDigest: hash('authority') },
    productInstalls: [{ productId, installedRoot, publicContracts: [row] }] });
  const file = fileURLToPath(new URL('../../build/code/src/product/materialization_definition_bindings.js', import.meta.url));
  const site = new SourceTextModule(`${await readFile(file, 'utf8')}\nexport { ADMIT_REQUEST as componentAdmitRequest };\n`, { identifier: file });
  await site.link(async specifier => {
    const actual = await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(file), specifier)).href : specifier);
    return new SyntheticModule(Object.keys(actual), function () { for (const [k, v] of Object.entries(actual)) this.setExport(k, v); });
  });
  await site.evaluate();
  const admit = site.namespace.componentAdmitRequest, pair = { ref: binding.bindingId, digest: binding.bindingDigest };
  const configuration = (row, inputs = ['ruling']) => admit.configuration({ configurationContract: { ref: contractId, digest: row.contractDigest },
    binding: pair, inputs }, environment(row));
  const context = (row, value = ['ruling']) => admit.context_bootstrap({ workspace: { ref: 'workspace://abiogenesis/r3b-materialize@5', digest: hash('authority') },
    binding: pair, contextInputs: [{ name: 'r3b/input', contract: { ref: contractId, digest: row.contractDigest }, value }] }, environment(row));
  // The falsifier: the admitted asset passes every check; only the value then decides.
  const admitted = configuration(contractRow({}));
  assert.equal(admitted.kind, 'packet', JSON.stringify(admitted));
  assert.deepEqual(admitted.packet.configurationContract, contractRow({}));
  assert.deepEqual(configuration(contractRow({}), [1]), { kind: 'refusal', code: 'input_mismatch', path: '/inputs' });
  assert.equal(context(contractRow({})).kind, 'packet');
  const refusals = {
    'locator (media type)': contractRow({ mediaType: 'application/json' }),
    'locator (absent)': contractRow(null),
    locus: contractRow({ path: '../outside.schema.json' }),
    bytes: contractRow({ path: 'schemas/changed.schema.json' }),
    dialect: contractRow({ path: 'schemas/draft07.schema.json' }, draft07),
  };
  for (const [check, row] of Object.entries(refusals)) {
    assert.deepEqual(configuration(row), { kind: 'refusal', code: 'contract_mismatch', path: '/configurationContract' }, check);
    assert.deepEqual(context(row), { kind: 'refusal', code: 'input_mismatch', path: '/contextInputs/0/contract' }, check);
  }
});

// O1 (O-TYPE (A)): product.materialize's artifact relation admits each context
// input value where its digest is taken, and the binding admits the artifact
// body before the artifact ingress. JSON.parse and the canonical digest accept
// a lone surrogate and an unsafe integer; admission refuses them on each
// site's own channel: the relation's `false`, the binding's
// `product_materialization_artifact_refused` fault before any admission.
test('O1 (A): the materialization artifact relation refuses a context input value outside I-JSON (false)', async () => {
  const { privateOwner } = await import('../support/r10-private-owner-harness.mjs');
  const { sha256Canonical: hash } = await import('../../build/code/src/shared/digests.js');
  const binding = { bindingId: 'binding://abiogenesis/o1-materialize@5', bindingDigest: hash('binding'),
    admissionEventRef: 'event://o1/binding', roots: { projectionRoot: '/o1/projection' } };
  const basis = { workspaceId: 'workspace://abiogenesis/o1-materialize@5', authorityBasisDigest: hash('authority') };
  const owner = await privateOwner('abg/artifact_truth.js', ['materializationArtifactCorresponds'], {
    './environment_admission.js': { projectExactPrefixWorkspaceEnvironment: () => ({ kind: 'exact_prefix_workspace_environment',
      workspaceBinding: binding, workspaceAuthorityBasis: basis, productInstalls: [] }) } });
  const hex = digest => digest.slice('sha256:'.length), memberKey = 'context_bootstrap', order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  const root = join(binding.roots.projectionRoot, 'product-materializations', memberKey);
  const subject = { workspaceRef: basis.workspaceId, workspaceDigest: basis.authorityBasisDigest, bindingRef: binding.bindingId,
    bindingDigest: binding.bindingDigest };
  const pair = { ref: binding.bindingId, digest: binding.bindingDigest };
  // The relation's own reconstruction, recomputed here over the value given.
  const corresponds = value => {
    const input = { inputRef: 'o1/input', inputDigest: hash(value), content: value };
    const assetDigest = hash({ kind: 'generated_product_asset', schemaVersion: '5.0.0', materializationKind: memberKey, ...subject, ...input });
    const rows = [{ inputRef: input.inputRef, inputDigest: input.inputDigest, assetRef: `generated-product-asset://abiogenesis/${hex(assetDigest)}`,
      assetDigest, assetPath: join(root, 'content', `${hex(assetDigest)}.json`), disposition: 'created' }];
    const contentDigest = hash(rows.map(row => row.assetDigest));
    const content = { contentRef: `context-bootstrap-content://abiogenesis/${hex(contentDigest)}`, contentDigest, contentPath: root };
    const provenance = [{ provenanceRef: subject.workspaceRef, provenanceDigest: subject.workspaceDigest },
      { provenanceRef: subject.bindingRef, provenanceDigest: subject.bindingDigest },
      { provenanceRef: input.inputRef, provenanceDigest: input.inputDigest }].sort((a, b) => order(a.provenanceRef, b.provenanceRef));
    const manifestDigest = hash({ kind: 'product_materialization_manifest', schemaVersion: '5.0.0', materializationKind: memberKey, ...subject,
      contentRef: content.contentRef, contentDigest, rows, validationDisposition: 'admitted', residuals: [], provenance });
    const manifest = { manifestRef: `product-materialization-manifest://abiogenesis/${hex(manifestDigest)}`, manifestDigest,
      manifestPath: join(root, 'manifests', `${hex(manifestDigest)}.json`) };
    const invocation = { operationId: 'abg.operation.product.materialize', memberKey };
    const artifact = { kind: 'product_materialization_artifact', schemaVersion: '5.0.0', memberKey, invocation,
      entryPrefix: { coordinateDigest: hash('entry') }, workspaceBinding: pair,
      request: { binding: pair, workspace: { ref: subject.workspaceRef, digest: subject.workspaceDigest }, contextInputs: [{ name: input.inputRef, value }] },
      result: { kind: 'product_materialization_result', schemaVersion: '5.0.0', disposition: 'materialized', materializationKind: memberKey,
        subject, content, manifest, rows, validationDisposition: 'admitted', residuals: [], provenance } };
    return owner.materializationArtifactCorresponds(artifact, {}, { causationEventRefs: [binding.admissionEventRef] },
      { invocation, scope: { ref: manifest.manifestRef, digest: manifestDigest }, artifact: { ref: content.contentRef, digest: contentDigest } });
  };
  assert.equal(corresponds(['ruling']), true, 'the reconstructed context artifact corresponds');
  assert.equal(corresponds(['\ud800']), false, 'a lone surrogate');
  assert.equal(corresponds([9007199254740993]), false, 'an unsafe integer');
});

test('O1 (A): the materialization binding refuses an artifact body outside I-JSON before the artifact ingress', async t => {
  const { mkdtemp, mkdir, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { dirname, resolve } = await import('node:path');
  const { SourceTextModule, SyntheticModule } = await import('node:vm');
  const Effect = await import('effect/Effect');
  const { sha256Bytes, sha256Canonical: hash } = await import('../../build/code/src/shared/digests.js');
  const { MATERIALIZATION_OPERATION_CONTRACTS } = await import('../../build/code/src/product/materialization_operation_contracts.js');
  const installedRoot = await mkdtemp(join(tmpdir(), 't287-o1-materialize-'));
  t.after(() => rm(installedRoot, { recursive: true, force: true }));
  const contractId = 'abg.schema.o1-context', productId = 'product://abiogenesis/o1-materialize@5';
  const schema = Buffer.from(JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', $id: contractId, type: 'array', items: { type: 'string' } }));
  await mkdir(join(installedRoot, 'schemas'), { recursive: true });
  await writeFile(join(installedRoot, 'schemas/context.schema.json'), schema);
  const row = { contractKind: 'schema_asset', contractId, owningProduct: productId, contractVersion: '5.0.0', contractDigest: sha256Bytes(schema),
    assetLocator: { mediaType: 'application/schema+json', path: 'schemas/context.schema.json', contentDigest: sha256Bytes(schema) } };
  const actorRef = 'actor://abiogenesis/o1', binding = { bindingId: 'binding://abiogenesis/o1-materialize@5', bindingDigest: hash('binding'),
    admissionEventRef: 'event://o1/binding', authorityBasisId: 'authority://o1', authorityBasisDigest: hash('authority') };
  const entryPrefix = { kind: 'durable_prefix_coordinate', coordinateDigest: hash('entry') };
  const workspace = { workspaceId: 'workspace://abiogenesis/o1-materialize@5', authorityBasisDigest: hash('authority'), authorizedActorRef: actorRef };
  const environment = { kind: 'exact_prefix_workspace_environment', prefix: entryPrefix, workspaceBinding: binding, workspaceAuthorityBasis: workspace,
    productInstalls: [{ productId, installedRoot, publicContracts: [row] }], resolvedProductLock: { lockId: 'lock://o1', lockDigest: hash('lock') } };
  const pair = { ref: binding.bindingId, digest: binding.bindingDigest }, catalog = { ref: 'catalog://o1', digest: hash('catalog') };
  const packet = MATERIALIZATION_OPERATION_CONTRACTS.context_bootstrap, admissions = [];
  let native;
  // Supplied lookup assumptions: the install coordinate, a fresh invocation,
  // no truth row at the scope, the owner's result, the artifact ingress and
  // the resource release. The request admission, the declared output and the
  // body admission are the module's own.
  const assumptions = {
    './environment.js': { productInstallCoordinate: install => ({ productId: install.productId }) },
    '../abg/effectful_invocation_truth.js': { projectEffectfulPublicInvocationTruthAtPrefix: () => ({ disposition: 'available' }) },
    './materialization_operations.js': { materializeContextBootstrap: async () => native },
    '../abg/artifact_truth.js': { projectOwnedPrefixArtifactTruth: () => ({ kind: 'exact_prefix_artifact_truth_projection', rows: [] }) },
    '../abg/environment_admission.js': { admitArtifact: (...args) => { admissions.push(args); return { disposition: 'admitted' }; } },
    '../abg/definition_event_resource.js': { abandonAbgEventResource: () => {} },
  };
  const file = fileURLToPath(new URL('../../build/code/src/product/materialization_definition_bindings.js', import.meta.url));
  const site = new SourceTextModule(`${await readFile(file, 'utf8')}\nexport { materializeOwner as componentMaterializeOwner };\n`, { identifier: file });
  await site.link(async specifier => {
    const actual = { ...await import(specifier.startsWith('.') ? pathToFileURL(resolve(dirname(file), specifier)).href : specifier),
      ...(assumptions[specifier] ?? {}) };
    return new SyntheticModule(Object.keys(actual), function () { for (const [k, v] of Object.entries(actual)) this.setExport(k, v); });
  });
  await site.evaluate();
  const request = { workspace: { ref: workspace.workspaceId, digest: workspace.authorityBasisDigest }, binding: pair,
    contextInputs: [{ name: 'o1/input', contract: { ref: contractId, digest: row.contractDigest }, value: ['ruling'] }] };
  const call = { invocation: { invocationAuthority: { slots: { actor: { actor: { ref: actorRef } }, workspace_binding: pair,
    product_set: [{ productId }], dependency_lock: { ref: 'lock://o1', digest: hash('lock') } } }, request, contractCatalog: catalog,
    definitionDigest: hash('definition'), invocationRef: 'invocation://o1/materialize', requestDigest: hash(request),
    correlationRef: 'correlation://o1', eventTime: '2026-10-28T00:00:00.000Z' }, resources: { eventResource: {} } };
  const approved = { grants: [{ actorRef, operationId: packet.definitionKey.operationId, capabilityRef: packet.metadata.capabilityRefs[0],
    operationContract: { contractCatalog: catalog } }], authority: { actorRef } };
  const coordinate = (scheme, label) => ({ ref: `${scheme}://abiogenesis/${hash(label).slice(7)}`, digest: hash(label) });
  const result = contentPath => {
    const content = coordinate('context-bootstrap-content', 'content'), manifest = coordinate('product-materialization-manifest', 'manifest');
    const asset = coordinate('generated-product-asset', 'asset');
    return { kind: 'product_materialization_result', schemaVersion: '5.0.0', disposition: 'materialized', materializationKind: 'context_bootstrap',
      subject: { workspaceRef: workspace.workspaceId, workspaceDigest: workspace.authorityBasisDigest, bindingRef: pair.ref, bindingDigest: pair.digest },
      content: { contentRef: content.ref, contentDigest: content.digest, contentPath },
      manifest: { manifestRef: manifest.ref, manifestDigest: manifest.digest, manifestPath: '/o1/manifest.json' },
      rows: [{ inputRef: 'o1/input', inputDigest: hash(['ruling']), assetRef: asset.ref, assetDigest: asset.digest, assetPath: '/o1/asset.json',
        disposition: 'created' }],
      validationDisposition: 'admitted', residuals: [], provenance: [{ provenanceRef: 'o1/input', provenanceDigest: hash(['ruling']) }] };
  };
  const run = async contentPath => {
    native = result(contentPath); admissions.length = 0;
    const exit = await Effect.runPromiseExit(site.namespace.componentMaterializeOwner('context_bootstrap', call, approved, environment,
      { entryPrefix, store: {} }));
    return { exit, admissions: [...admissions] };
  };
  const admitted = await run('/o1/content');
  assert.equal(admitted.admissions.length, 1, JSON.stringify(admitted.exit));
  assert.deepEqual(admitted.admissions[0][5], { artifact: { kind: 'product_materialization_artifact', schemaVersion: '5.0.0',
    memberKey: 'context_bootstrap', invocation: admitted.admissions[0][5].artifact.invocation, entryPrefix, workspaceBinding: pair, request, result: native } });
  const refused = await run('/o1/\ud800');
  assert.equal(refused.admissions.length, 0, 'no artifact admission is attempted');
  assert.equal(refused.exit._tag, 'Failure');
  assert.equal(refused.exit.cause.error?.stage, 'abg_admission', JSON.stringify(refused.exit.cause));
  assert.equal(refused.exit.cause.error.code, 'product_materialization_artifact_refused');
});
