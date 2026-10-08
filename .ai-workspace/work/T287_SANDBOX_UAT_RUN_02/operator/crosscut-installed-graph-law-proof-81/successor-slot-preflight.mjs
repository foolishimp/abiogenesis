import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {executeInstalledGraphProof} from './driver-successor.mjs';

assert.equal(typeof executeInstalledGraphProof, 'function');
assert.equal(process.env.NODE_OPTIONS ?? '', '');
const setup = JSON.parse(await readFile(new URL('./execution/setup.json', import.meta.url), 'utf8'));
const product = await import(pathToFileURL(join(setup.installedRoot, 'build/code/src/product/index.js')).href);
const publicApi = await import(pathToFileURL(join(setup.installedRoot, 'build/code/src/public/index.js')).href);
const {PUBLIC_AUTHORITY_SLOTS} = await import(pathToFileURL(join(setup.installedRoot,
  'build/code/src/shared/public_function_contracts.js')).href);
const physical = await readFile(new URL(setup.setupHandoff.prefix.eventLogRef));
const crypto = await import('node:crypto');
assert.equal(`sha256:${crypto.createHash('sha256').update(physical).digest('hex')}`, setup.setupHandoff.prefix.prefixDigest);
const rows = physical.toString('utf8').trimEnd().split('\n').map(line => JSON.parse(line));
const producer = rows.find(row => row.payload.operationId === 'abg.operation.workspace.bind');
const authority = producer.payload.workspaceAuthorityBasis;
const binding = producer.payload.artifact;
const input = Object.fromEntries(['workspaceId', 'canonicalRoot', 'authorityMode', 'authorizedActorRef',
  'authorityManifestRef', 'authorityManifestDigest'].map(key => [key, authority[key]]));
assert.deepEqual(product.constructWorkspaceAuthorityBasis(input), authority);
assert.equal(authority.authorizedActorRef, binding.authorizedActorRef);
const definition = publicApi.PUBLIC_FUNCTION_DEFINITION_FAMILY.definitions.find(row =>
  row.definitionKey.operationId === 'abg.operation.conformance.evaluate' && row.definitionKey.memberKey === 'gtl_program');
assert.ok(definition);
const slots = {...Object.fromEntries(PUBLIC_AUTHORITY_SLOTS.map(key => [key, null])),
  workspace_binding: {ref: binding.bindingId, digest: binding.bindingDigest},
  dependency_lock: {ref: binding.lockId, digest: binding.lockDigest},
  product_set: setup.installedProducts.map(product.productInstallCoordinate),
  actor: {actor: {ref: binding.authorizedActorRef, digest: product.sha256Canonical({actorRef: binding.authorizedActorRef})},
    attribution: {ref: authority.authorityBasisId, digest: authority.authorityBasisDigest}},
  capability_grants: {requiredCapabilityRefs: [...definition.capabilityRefs], grants: []}};
const result = product.admissionAuthoritySlots(slots);
assert.equal(result.actor.attribution.ref, authority.authorityBasisId);
assert.equal(result.actor.attribution.digest, authority.authorityBasisDigest);
assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
assert.equal(rows.filter(row => row.kind === 'c_call_opened').length, 0);
console.log(JSON.stringify({kind: 'pure_successor_slot_shape_preflight', passed: true,
  basisProducer: producer.eventRef, authorityBasisId: authority.authorityBasisId,
  authorityBasisDigest: authority.authorityBasisDigest, declaredInstalledProducts: slots.product_set.length,
  noPublicDispatch: true, noGrantOrRuntimeAdmission: true}));
