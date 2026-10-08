import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {basename, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {setupInstalledRootCatalog} from '../../../../../build_tenants/abiogenesis/typescript/test_env/support/root-installed-environment.mjs';
import {prepareLanguageStructuralFixture} from '../../../../../build_tenants/abiogenesis/typescript/test_env/support/language-structural-fixture.mjs';
import {GRAPH_EDGE_IDS, STRUCTURAL_IDS, constructStructuralInput} from '../../../../../build_tenants/abiogenesis/typescript/test_env/fixtures/language-structural/program.mjs';
import {constructInstalledStartCall, constructInstalledRunReadCall, runInstalledCliRequest} from '../../../../../build_tenants/abiogenesis/typescript/test_env/support/registered-graph-selection.mjs';
import {expectedVerificationIdentity} from '../../../../../build_tenants/abiogenesis/typescript/test_env/support/candidate-basis.mjs';

const tenant = fileURLToPath(new URL('../../../../../build_tenants/abiogenesis/typescript/', import.meta.url));
const phase = fileURLToPath(new URL('.', import.meta.url));
const schemaVersion = '5.0.0';

// This is an external test client. Public envelopes, grants, slots and all
// interpretation come from actual installed canonical owners, not this file.
async function conformanceCall(environment, publicApi, packet, request, resources, prefix, identity) {
  const {product, admittedInstalls, workspaceBinding, verified} = environment;
  const {PUBLIC_AUTHORITY_SLOTS} = await import(pathToFileURL(join(environment.installedRoot,
    'build/code/src/shared/public_function_contracts.js')).href);
  const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(row =>
    row.definitionKey.operationId === packet.definitionKey.operationId && row.definitionKey.memberKey === packet.definitionKey.memberKey);
  assert.ok(definition);
  const hash = product.sha256Canonical, coord = (ref, value) => ({ref, digest: hash(value)});
  const actorRef = workspaceBinding.authorizedActorRef;
  const slots = {...Object.fromEntries(PUBLIC_AUTHORITY_SLOTS.map(key => [key, null])),
    workspace_binding: {ref: workspaceBinding.bindingId, digest: workspaceBinding.bindingDigest},
    dependency_lock: {ref: workspaceBinding.lockId, digest: workspaceBinding.lockDigest},
    product_set: admittedInstalls.map(product.productInstallCoordinate),
    actor: {actor: coord(actorRef, {actorRef}), attribution: {ref: environment.workspaceAuthority.authorityBasisId, digest: environment.workspaceAuthority.authorityBasisDigest}},
    capability_grants: {requiredCapabilityRefs: [...definition.capabilityRefs], grants: []}};
  const ownerRequest = {artifactPath: environment.artifactPath, artifactRef: basename(environment.artifactPath),
    ...expectedVerificationIdentity(verified)};
  const basis = {kind: 'admission_capability_data', schemaVersion,
    definition: {definitionKey: definition.definitionKey, definitionRef: definition.definitionRef,
      definitionDigest: definition.definitionDigest, owner: {ref: packet.owner.authorityRef, digest: packet.owner.authorityDigest}},
    ownerArtifact: {request: ownerRequest, verified}, request,
    resourceScope: {resourcesDigest: hash(resources), authoritySlots: product.admissionAuthoritySlots(slots)},
    boundEnvironment: product.admissionEnvironmentSelection(prefix, slots.workspace_binding)};
  const authorityValue = {actorRef, authorityMode: 'trusted_developer'};
  const approvalValue = {decision: 'allow', actorRef, definitionRef: definition.definitionRef,
    definitionDigest: definition.definitionDigest, requestDigest: hash(request), scopeDigest: product.admissionAuthorityScope(basis).digest};
  const authority = {kind: 'resolved_admission_authority', schemaVersion, actorRef, authorityMode: 'trusted_developer',
    authority: {...coord(`authority://external-test/${identity}`, authorityValue), value: authorityValue},
    approval: {...coord(`approval://external-test/${identity}`, approvalValue), value: approvalValue}};
  const grants = await Promise.all(definition.capabilityRefs.map(ref => product.constructCapabilityGrant(
    authority, actorRef, definition.definitionKey.operationId, ref,
    {kind: 'admission_capability_grant_construction_basis', fixedPacket: packet, data: basis})));
  slots.capability_grants.grants = grants.map(row => ({ref: row.grantRef, digest: row.grantDigest}));
  const member = verified.definitionContractCoordinates.operations.find(row => row.operationId === packet.definitionKey.operationId)
    ?.members.find(row => row.memberKey === packet.definitionKey.memberKey);
  assert.ok(member);
  return publicApi.constructInstalledPublicDefinitionCall({product, installedPublic: publicApi,
    definitionContractCoordinates: verified.definitionContractCoordinates, contractCatalog: member.slots.request.contractCatalog,
    ...packet.definitionKey, request, slots, resources: {...resources, admissionAuthority: {basis, authority, grants}},
    requestRef: `public-request://external-test/81/${identity}`, correlationRef: 'correlation://external-test/81',
    eventTime: new Date().toISOString(), provenanceRefs: ['provenance://external-test/81']});
}

// Called only after Root grants actual install/publication/execution. Importing
// or syntax-checking this module executes no setup, CLI or runtime operation.
export async function executeInstalledGraphProof({artifactPath, artifactSha256, installHost,
  expectedProductContentDigest, expectedManifestDigest, evidenceRoot}) {
  for (const value of [artifactPath, artifactSha256, installHost, expectedProductContentDigest, expectedManifestDigest, evidenceRoot])
    assert.equal(typeof value, 'string', 'exact frozen identity and destination are required');
  assert.equal(process.env.NODE_OPTIONS ?? '', '', 'no heap/cap override');
  await mkdir(evidenceRoot, {recursive: false});
  const save = async (name, value) => writeFile(join(evidenceRoot, name), `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'});
  const setupAccounting = {wallMs: {}};
  const environment = await setupInstalledRootCatalog({after() {}}, tenant, {
    frozenArtifact: {artifactPath, artifactSha256, installHost}, candidateBasisSource: 'packed_artifact',
    workspaceProductIndex: 1, programRef: GRAPH_EDGE_IDS.programRef, graphFunctionRef: GRAPH_EDGE_IDS.graphFunctionRef,
    prepareAdditionalProducts: async basis => [await prepareLanguageStructuralFixture(basis)], setupAccounting});
  const {product, abg, installedRoot, scratch, verified} = environment;
  assert.equal(verified.productContentDigest, expectedProductContentDigest);
  assert.equal(verified.manifestDigest, expectedManifestDigest);
  const publicApi = await import(pathToFileURL(join(installedRoot, 'build/code/src/public/index.js')).href);
  const validator = await import(pathToFileURL(join(installedRoot, 'build/code/src/validator/index.js')).href);
  const fixed = validator.CONFORMANCE_OPERATION_CONTRACTS.evaluate.gtl_program;
  const setupHandoff = environment.store.projectReopenAuthorityAndClose();
  const setupBytes = await readFile(new URL(setupHandoff.prefix.eventLogRef));
  assert.equal(abg.readRuntimeEventsAtDurablePrefix(setupHandoff.prefix)
    .filter(row => row.kind === 'c_call_opened').length, 0);
  await save('setup.json', {artifactPath, artifactSha256, installedRoot, scratch,
    productContentDigest: verified.productContentDigest, manifestDigest: verified.manifestDigest,
    setupAccounting, setupHandoff, installedProducts: environment.admittedInstalls});
  const lawRef = 'law://abiogenesis/validator/gtl-program@5';
  const law = {ref: lawRef, digest: product.sha256Canonical({ref: lawRef})};
  const negatives = [];
  for (const id of ['duplicate-node', 'terminal-outgoing', 'ordinary-double-edge']) {
    const packet = JSON.parse(await readFile(join(phase, `${id}.json`), 'utf8'));
    const request = {program: {ref: packet.program.programRef, digest: product.sha256Canonical(packet.program)},
      conformanceLaw: law, inventoryBasis: {kind: 'program_only'}};
    const resources = {kind: 'conformance_evaluation_resource_assertion', schemaVersion, packet,
      conformanceLaw: law, declaredInventory: environment.publications};
    const call = await conformanceCall(environment, publicApi, fixed, request, resources, setupHandoff.prefix, id);
    const execution = await runInstalledCliRequest({scratch, installedRoot, identity: `81-${id}`,
      acquisition: {kind: 'eventless'}, call, expectedExitCode: 1});
    await save(`${id}.receipt.json`, {call, execution});
    assert.equal(execution.output.kind, 'installed_definition_call_transport_result');
    assert.equal(execution.output.receipt.ownerOutput.outcomeKind, 'refusal');
    assert.equal(execution.output.receipt.ownerOutput.value.code, 'invalid_program');
    assert.deepEqual(await readFile(new URL(setupHandoff.prefix.eventLogRef)), setupBytes, 'static refusal has no leaf/runtime effect');
    assert.equal(abg.readRuntimeEventsAtDurablePrefix(setupHandoff.prefix)
      .filter(row => row.kind === 'c_call_opened').length, 0);
    negatives.push({id, invocation: call.invocation.invocationRef, request: request.program,
      packetDigest: product.sha256Canonical(packet), receipt: execution.output.receipt});
  }
  const publication = environment.additionalPublications[0];
  const program = publication.programs.find(row => row.programRef === GRAPH_EDGE_IDS.programRef);
  assert.ok(program);
  const positiveRequest = {program: {ref: program.programRef, digest: product.sha256Canonical(program)}, conformanceLaw: law,
    inventoryBasis: {kind: 'declared_inventory', inventory: environment.publications.map(pub =>
      ({ref: pub.moduleRef, digest: product.sha256Canonical(pub)})).sort((a,b) => a.ref.localeCompare(b.ref))}};
  const positiveResources = {kind: 'conformance_evaluation_resource_assertion', schemaVersion,
    packet: {kind: 'conformance_evaluate_packet', schemaVersion, memberKey: 'gtl_program', publication, program},
    conformanceLaw: law, declaredInventory: environment.publications,
    declarationCatalog: {catalog: environment.catalog, catalogView: environment.catalogView}};
  const positiveCall = await conformanceCall(environment, publicApi, fixed, positiveRequest, positiveResources, setupHandoff.prefix, 'declared-positive');
  const positive = await runInstalledCliRequest({scratch, installedRoot, identity: '81-declared-positive',
    acquisition: {kind: 'eventless'}, call: positiveCall});
  await save('declared-positive.receipt.json', {call: positiveCall, execution: positive});
  assert.equal(positive.output.receipt.ownerOutput.value.disposition, 'passed');
  assert.deepEqual(await readFile(new URL(setupHandoff.prefix.eventLogRef)), setupBytes);
  const eventResource = {kind: 'reopen_abg_event_resource', schemaVersion, closeHandoff: setupHandoff,
    handoffDigest: product.sha256Canonical(setupHandoff)};
  const {call, resolution} = await constructInstalledStartCall({environment, publicApi, eventResource,
    input: constructStructuralInput('  Qualification  '), identity: '81-graph-edge',
    programRef: GRAPH_EDGE_IDS.programRef});
  assert.equal(resolution.resolvedProgramStart.start.startRef, GRAPH_EDGE_IDS.startRef);
  const execution = await runInstalledCliRequest({scratch, installedRoot, identity: '81-graph-edge',
    acquisition: {kind: 'reopen', closeHandoff: setupHandoff}, call});
  await save('graph-edge.receipt.json', {call, resolution, execution});
  const receipt = execution.output.receipt, handoff = receipt.resources.eventResource.closeHandoff;
  const events = abg.readRuntimeEventsAtDurablePrefix(handoff.prefix);
  const calls = events.filter(row => row.kind === 'c_call_opened'), results = events.filter(row => row.kind === 'c_call_result_admitted');
  const fibres = events.filter(row => row.kind === 'c_call_fibre_selected'), routes = events.filter(row => row.kind === 'traversal_route_admitted');
  assert.equal(calls.length, 2); assert.equal(results.length, 2); assert.equal(fibres.length, 2);
  assert.deepEqual(results[0].payload.value, {kind: 'normalized_data', schemaVersion, subject: 'Qualification'});
  assert.equal(results[1].payload.contractRef, STRUCTURAL_IDS.outputContractRef);
  assert.deepEqual(results[1].payload.value, {kind: 'data_output', schemaVersion, message: 'Qualification'});
  assert.deepEqual(routes.map(row => row.payload.routeKind), ['advance','terminal']);
  assert.equal(new Set(fibres.map(row => row.payload.compositionRef)).size, 1);
  assert.notEqual(routes[0].payload.targetCursorRef, null);
  assert.equal(routes[1].payload.targetCursorRef, null);
  assert.equal(events.filter(row => row.kind === 'run_closed').length, 1);
  assert.equal(resolution.resolution.programOwner.productId, environment.additionalProducts[0].basis.productId);
  assert.equal(resolution.declarationClosure.semanticsOwner.productId, environment.additionalProducts[0].basis.productId);
  assert.equal(resolution.implementationSetCandidate.rows.every(row =>
    row.implementationOwnerProductId === environment.additionalProducts[0].basis.productId), true);
  assert.ok(receipt.resources.run);
  const projectionContracts = await import(pathToFileURL(join(installedRoot, 'build/code/src/abg/project_read_operation_contracts.js')).href);
  const reads = [];
  for (const memberKey of ['run_result','run_replay']) {
    const {call: readCall} = constructInstalledRunReadCall({environment, publicApi, projectReadContracts: projectionContracts,
      memberKey, selector: memberKey === 'run_replay' ? {kind: 'ordinal_page', fromOrdinal: 0, limit: 4096} : {kind: 'none'},
      source: receipt.resources.run, eventResource: {...eventResource, closeHandoff: handoff, handoffDigest: product.sha256Canonical(handoff)},
      identity: `81-${memberKey}`});
    const before = await readFile(new URL(handoff.prefix.eventLogRef));
    const read = await runInstalledCliRequest({scratch, installedRoot, identity: `81-${memberKey}`,
      acquisition: {kind: 'reopen', closeHandoff: handoff}, call: readCall});
    await save(`${memberKey}.receipt.json`, {call: readCall, execution: read});
    assert.equal(read.output.receipt.ownerOutput.outcomeKind, 'result');
    assert.deepEqual(read.output.receipt.resources.eventResource.closeHandoff.prefix, handoff.prefix);
    assert.deepEqual(await readFile(new URL(handoff.prefix.eventLogRef)), before);
    reads.push({memberKey, receipt: read.output.receipt});
  }
  assert.equal(await product.installedProductContentMatches(environment.installCandidate), true);
  const result = {kind: 'bounded_installed_graph_law_proof', negatives, positive: positive.output.receipt,
    cCalls: calls.map(row => row.eventRef), results: results.map(row => row.eventRef), routes: routes.map(row => row.eventRef),
    closeHandoff: handoff, reads, noProviderOrDataMapperExecution: true};
  await save('result.json', result); return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = Object.fromEntries(process.argv.slice(2).reduce((rows, key, index, all) =>
    index % 2 === 0 ? [...rows, [key, all[index + 1]]] : rows, []));
  const names = {'--artifact-path':'artifactPath', '--artifact-sha256':'artifactSha256', '--install-host':'installHost',
    '--expected-content':'expectedProductContentDigest', '--expected-manifest':'expectedManifestDigest', '--evidence-root':'evidenceRoot'};
  assert.deepEqual(Object.keys(args).sort(), Object.keys(names).sort(), 'Root must supply exact frozen candidate/host and execution destination');
  await executeInstalledGraphProof(Object.fromEntries(Object.entries(names).map(([key,name]) => [name,args[key]])));
}
