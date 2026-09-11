import assert from 'node:assert/strict';
import { readFileSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { constructWorksitePreservedResultSource, constructWorksitePreservedResultArtifact,
  derivePreservedWorksiteCandidateBundle } from '../../build/code/src/product/worksite_construction_recovery.js';
import { projectPreservedWorksiteProposal } from '../../build/code/src/abg/worksite_construction_recovery.js';
import { constructWorksiteCandidateBundle } from '../../build/code/src/product/worksite_construction.js';
const sourceObservationPath=resolve(import.meta.dirname,'../../../preimages/source-observation.json');
const sourceObservation=JSON.parse(readFileSync(sourceObservationPath,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const selector=constructWorksitePreservedResultSource({kind:'worksite_preserved_result_source',schemaVersion:'5.0.0',
  historicalPrefix:sourceObservation.nativeEventStore.coordinate,sourceCCallRef:sourceObservation.nativeSource.cCallRef,
  actorInvocationRef:sourceObservation.nativeSource.actorInvocationRef});

test('actual retained D1 proposal, dispatch, 784 chunks and same-coordinate bundle; no admission or effects',()=>{
  const before=readFileSync(sourceObservation.nativeEventStore.path),statBefore=lstatSync(sourceObservation.nativeEventStore.path);
  assert.equal(sha(before),sourceObservation.nativeEventStore.sha256);
  const projected=projectPreservedWorksiteProposal(selector);
  assert.notEqual(projected,null,'native preserved-source projection must authenticate the actual retained source');
  assert.equal(projected.proof.requestDigest,sourceObservation.nativeSource.requestDigest);
  assert.equal(projected.proof.stdoutChunkEventRefs.length,784);
  assert.equal(projected.workerResult.files.length,22);
  const expected=constructWorksiteCandidateBundle(projected.originalTask,projected.workerResult);
  assert.equal(expected.files.reduce((n,row)=>n+Buffer.from(row.replacementBase64,'base64').length,0),111575);
  // Explicit synthetic current-owner coordinates exercise only the pure Product
  // construction relation. They are not passed as admitted native occurrences.
  const artifact=constructWorksitePreservedResultArtifact({source:selector,proof:projected.proof,
    originalTask:projected.originalTask,currentTask:projected.originalTask,workerResult:projected.workerResult,
    owner:{graphFunctionRef:'graph-function://test/preserved-result-mechanical@5',executionBasisRef:'execution-basis://test/mechanical',
      executionBasisDigest:'sha256:'+'1'.repeat(64),cCallRef:'c-call://test/mechanical'}});
  assert.deepEqual(derivePreservedWorksiteCandidateBundle(artifact),expected);
  for(const target of projected.originalTask.targets){const file=fileURLToPath(target.subject.subjectUri),stat=lstatSync(file),bytes=readFileSync(file),old=target.predecessorObservation;
    assert.equal(old.state,'file');assert.equal(`${stat.dev}:${stat.ino}`,old.fileIdentity);assert.equal('sha256:'+sha(bytes),old.fileDigest);assert.equal(bytes.length,old.byteLength);}
  const after=readFileSync(sourceObservation.nativeEventStore.path),statAfter=lstatSync(sourceObservation.nativeEventStore.path);
  assert.ok(after.equals(before));assert.equal(statAfter.dev,statBefore.dev);assert.equal(statAfter.ino,statBefore.ino);
  console.log(JSON.stringify({claim:'read-only historical projection and synthetic same-coordinate Product bundle, not native current admission',
    events:1891,eventLogSha256:sha(after),device:statAfter.dev,inode:statAfter.ino,proposalMembers:22,replacementBytes:111575,
    requestDigest:projected.proof.requestDigest,proposalDigest:projected.proof.proposal.digest,acknowledgmentDigest:projected.proof.acknowledgment.digest}));
});
