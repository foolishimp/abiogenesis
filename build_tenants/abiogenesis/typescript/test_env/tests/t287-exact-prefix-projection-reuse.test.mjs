import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,writeFile,rename} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadProjectionOwners,filePrefix,sha256} from '../support/t287-exact-prefix-projection-reuse.mjs';

const packageRoot=process.env.ABI5_PREFIX_PACKAGE_ROOT??resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const proofRoot=process.env.ABI5_PREFIX_PROOF_ROOT;
const owners=await loadProjectionOwners(packageRoot);
const resign=value=>{const {coordinateDigest,...body}=value;return {...body,coordinateDigest:owners.digests.sha256Canonical(body)};};
const project=p=>owners.artifact.projectExactPrefixArtifactTruth(p);

test('T287 disposable reuse preserves prefix/profile/file checks and rejects mutable forgeries',async()=>{
  assert.ok(proofRoot,'explicit fresh proof territory required');await mkdir(proofRoot,{recursive:true});
  const scratch=await mkdtemp(join(proofRoot,'reuse-'));
  const files=[];
  for(let i=0;i<3;i++){const path=join(scratch,'empty-'+i+'.jsonl');await writeFile(path,'',{flag:'wx'});files.push(await filePrefix(path,Buffer.alloc(0),owners));}
  const first=project(files[0]);assert.equal(first.kind,'exact_prefix_artifact_truth_projection');
  assert.strictEqual(project(structuredClone(files[0])),first,'structural reuse discriminator');
  assert.equal(Object.isFrozen(first),true);assert.equal(Object.isFrozen(first.prefix.storeIdentity),true);
  const supplied=structuredClone(first);assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(supplied),true);
  supplied.projectionDigest='sha256:'+'0'.repeat(64);
  assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(supplied),false,'forged projection not an authority');
  const changed=structuredClone(files[0]);changed.prefixDigest='sha256:'+'1'.repeat(64);
  assert.equal(project(resign(changed)).code,'prefix_digest_mismatch');
  assert.equal(project({...files[0],scope:{runId:'unadmitted'}}).kind,'exact_prefix_artifact_truth_projection_refusal');
  const profile=structuredClone(files[0]);profile.storeIdentity.eventContractDigest='sha256:'+'f'.repeat(64);
  assert.equal(project(resign(profile)).code,'event_contract_digest_mismatch');
  const legacy=resign({...structuredClone(files[0]),storeIdentity:{...files[0].storeIdentity,eventContractDigest:owners.events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST}});
  const legacyResult=project(legacy);assert.equal(legacyResult.kind,'exact_prefix_artifact_truth_projection');
  assert.notStrictEqual(legacyResult,first,'distinct known profile gets a distinct computation');
  const accessor={...files[0]};let accessed=0;Object.defineProperty(accessor,'prefixDigest',{enumerable:true,get(){accessed++;return files[0].prefixDigest;}});
  Object.freeze(accessor);
  assert.equal(project(accessor).kind,'exact_prefix_artifact_truth_projection_refusal');assert.equal(accessed,0,'reject live getter before read/key can diverge');
  const mutable=structuredClone(files[0]);assert.equal(project(mutable).projectionDigest,first.projectionDigest);mutable.prefixLength=1;
  assert.equal(project(resign(mutable)).code,'prefix_length_mismatch');
  // Historical selection remains valid after append, but explicit currentness does not.
  await writeFile(fileURLToPath(files[0].eventLogRef),'not an admitted suffix');
  assert.equal(project(files[0]).projectionDigest,first.projectionDigest);
  assert.throws(()=>owners.events.readRuntimeEventsAtDurablePrefix(files[0],{requireCurrent:true}),e=>e.code==='prefix_length_mismatch');
  await rename(fileURLToPath(files[0].eventLogRef),join(scratch,'original-empty'));
  await writeFile(fileURLToPath(files[0].eventLogRef),'',{flag:'wx'});
  assert.equal(project(files[0]).code,'file_identity_mismatch','cache cannot authorize replacement inode');
  const one=project(files[1]);project(files[2]);project(legacy);
  // A valid third distinct file evicts the oldest of the bounded two entries.
  const fourthPath=join(scratch,'empty-3.jsonl');await writeFile(fourthPath,'',{flag:'wx'});
  project(await filePrefix(fourthPath,Buffer.alloc(0),owners));
  const again=project(files[1]);assert.notStrictEqual(again,one);assert.equal(again.projectionDigest,one.projectionDigest);
});

test('T287 retained scope and same-inode byte mutation cannot reuse false truth',{skip:!process.env.ABI5_PREFIX_EVENT_PATH},async()=>{
  const path=process.env.ABI5_PREFIX_EVENT_PATH,bytes=await readFile(path);
  assert.equal(sha256(bytes),process.env.ABI5_PREFIX_EXPECTED_SHA256);
  const coordinate=await filePrefix(path,bytes,owners,240),full=project(coordinate);
  assert.equal(full.kind,'exact_prefix_artifact_truth_projection');
  const forged=structuredClone(full);forged.rows[0].artifact.packageVersion='forged';
  const {projectionRef,projectionDigest,...forgedBody}=forged;
  forged.projectionDigest=owners.digests.sha256Canonical(forgedBody);
  forged.projectionRef='artifact-truth-projection://abiogenesis/'+forged.projectionDigest.slice(7);
  assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(forged),false,'self-consistent forged artifact is still not event truth');
  const wrongProfile=resign({...structuredClone(coordinate),storeIdentity:{...coordinate.storeIdentity,eventContractDigest:owners.events.LEGACY_ROOT_EVENT_CONTRACT_DIGEST}});
  assert.equal(project(wrongProfile).kind,'exact_prefix_artifact_truth_projection_refusal','known but crossed profile refuses actual current history');
  const records=bytes.toString('utf8').trimEnd().split('\n').map(JSON.parse),binding=records[2].payload;
  const mismatch=owners.environment.projectExactPrefixWorkspaceEnvironment(coordinate,{ref:binding.artifactRef,digest:'sha256:'+'0'.repeat(64)});
  assert.equal(mismatch.code,'workspace_binding_mismatch');
  const missing=owners.environment.projectExactPrefixWorkspaceEnvironment(coordinate,{ref:'workspace-binding://unknown',digest:binding.authorityScopeDigest});
  assert.equal(missing.code,'workspace_binding_missing');
  const events=owners.events.readRuntimeEventsAtDurablePrefix(coordinate);
  const scope=owners.prefix.selectValidatedRuntimeEventPrefix(events,{runId:'run://abiogenesis/2b9cc78738fc8051898018dd68d0d7bd710faeb0b480504f4c01c2fefc392371'});
  const scoped=owners.artifact.projectValidatedPrefixArtifactTruth(coordinate,scope);
  assert.equal(scoped.rows.length,0);
  assert.equal(owners.artifact.validateExactPrefixArtifactTruthProjection(scoped),false);
  assert.strictEqual(project(coordinate),full,'scoped computation cannot poison unscoped owner cache');
  const scratch=await mkdtemp(join(proofRoot,'bytes-')),copy=join(scratch,'events.jsonl');
  const initial=Buffer.from(bytes.toString('utf8').trimEnd().split('\n').slice(0,27).join('\n')+'\n');
  await writeFile(copy,initial,{flag:'wx'});const copied=await filePrefix(copy,initial,owners);
  assert.equal(project(copied).kind,'exact_prefix_artifact_truth_projection');
  const corrupt=Buffer.from(initial);corrupt[20]^=1;await writeFile(copy,corrupt);
  assert.equal(project(copied).code,'prefix_digest_mismatch','same inode changed bytes cannot hit');
  await writeFile(copy,Buffer.alloc(0));assert.equal(project(copied).code,'prefix_length_mismatch');
  assert.equal(sha256(await readFile(path)),process.env.ABI5_PREFIX_EXPECTED_SHA256);
});
