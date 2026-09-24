import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.env.ABI5_GENERIC_JOB_BUILD_ROOT??resolve(import.meta.dirname,'../..');
const load=name=>import(pathToFileURL(join(root,'build/code/src',name+'.js')).href);
const [job,c2,construction,effect,hash,gtl]=await Promise.all(['product/semantic_job','product/worksite_command_execution',
 'product/worksite_construction','product/worksite_effect','shared/digests','gtl/semantic_stage_identity'].map(load));

test('retained native C2 evidence preserves file scope without constructing a legacy C1 task',async t=>{
 const selected=process.env.ABI5_NATIVE_EVIDENCE_EXTRACT;
 assert.ok(selected,'explicit closed owner extraction required; no runtime resource is read');
 const extracted=JSON.parse(await readFile(selected,'utf8'));
 const retained=extracted.lastOwnerFacts.find(row=>row.ownerAtom==='r54271').retainedInput;
 assert.equal(hash.sha256Canonical(retained.value),retained.subjectDigest);
 const {entry,source:execution}=retained.value,source=execution.task.sourceNativeWork;
 // Task rederivation uses the original declared command environment. This
 // process-local restoration has no effect on any retained or live process.
 const previousPath=process.env.PATH;process.env.PATH=execution.task.commands[0].environment.find(row=>row.name==='PATH').value;
 t.after(()=>{if(previousPath===undefined)delete process.env.PATH;else process.env.PATH=previousPath;});
 assert.equal(c2.isNativeWorksiteCommandExecutionObservation(execution),true);
 assert.equal(hash.sha256Canonical(job.constructNativeSemanticExecutionTask(entry,source)),hash.sha256Canonical(execution.task));
 const artifacts=job.nativeSemanticEvidenceArtifacts(entry,execution);assert.ok(artifacts);
 const targets=entry.assets.at(-1).candidate.design.targets;
 assert.equal(artifacts.length,targets.length);
 assert.deepEqual(source.task.writeRoots,targets.map(row=>row.relativePath));
 for(const [i,target] of targets.entries()){
  const row=execution.task.protectedObservations.find(row=>row.subject.relativePath===target.relativePath);
  const bytes=source.after.entries.find(row=>row.relativePath===target.relativePath);
  assert.equal(artifacts[i].subjectRef,row.subject.subjectRef);
  assert.equal(artifacts[i].observationRef,row.observation.observationRef);
  assert.equal(artifacts[i].base64,bytes.bytes);
  const territory=effect.constructWorksiteTerritory({...source.task,relativeRoot:target.relativePath,territoryUri:row.subject.subjectUri});
  assert.equal(effect.worksiteSubjectWithinTerritory(row.subject,territory),false,'file root is not a parent authority');
  assert.throws(()=>construction.constructWorksiteConstructionTask({...source.task,prompt:'retained counterexample',
   targets:[{subject:row.subject,territory,predecessorObservation:row.observation}]}),/W-bound subject, territory/);
 }
 const mutate=fn=>{const changed=structuredClone(execution);fn(changed);assert.equal(job.nativeSemanticEvidenceArtifacts(entry,changed),null);};
 mutate(value=>value.snapshotMembers.pop());
 mutate(value=>value.snapshotMembers[0].sourceObservationRef='test:wrong-predecessor');
 mutate(value=>value.task.protectedObservations[0].observation.fileDigest='sha256:'+'0'.repeat(64));
 mutate(value=>value.task.sourceNativeWork.after.entries=value.task.sourceNativeWork.after.entries.filter(row=>row.relativePath!==targets[0].relativePath));
 mutate(value=>value.task.sourceNativeWork.after.entries.find(row=>row.relativePath===targets[0].relativePath).bytes=Buffer.from('stale bytes').toString('base64'));
 mutate(value=>value.task.sourceNativeWork.task.writeRoots=['.']);
 mutate(value=>value.task.allowedWriteTerritories[0].relativePath=targets[0].relativePath);
 const crossed=structuredClone(entry);crossed.assets.at(-1).candidate.design.targets[0].relativePath='outside/other.mjs';
 assert.equal(job.nativeSemanticEvidenceArtifacts(crossed,execution),null,'different assessed target cannot borrow this C2');
 const outOfScope=structuredClone(entry);outOfScope.job.worksiteScope.writeRoots=['unrelated'];
 assert.equal(job.nativeSemanticEvidenceArtifacts(outOfScope,execution),null,'source construction outside governing scope refuses');
 const envelope={...entry,context:source.after,worksite:null,evidence:{kind:'semantic_worksite_evidence',
  constructionResultRef:'test:value-only-construction',constructionResultDigest:source.observationDigest,
  executionResultRef:'test:value-only-execution',executionResultDigest:execution.observationDigest,
  constructionResult:source,executionObservation:execution,artifacts}};
 assert.equal(job.isSemanticJobEnvelope(envelope),true);
 assert.equal(job.evaluateNativeSemanticRelation(gtl.SEMANTIC_STAGE_IDS.nativeEvidencePredicateRef,retained.value,envelope),true);
 const stage=entry.declaration.stages[entry.assets.length];
 const task=job.constructNativeSemanticTask(envelope,stage.declarationRef,'author',source.task,source.after);
 assert.ok(targets.every(row=>task.readFirst.includes(row.relativePath)),'Evidence actor receives every observed target');
 assert.deepEqual(execution.task.allowedWriteTerritories,retained.value.source.task.allowedWriteTerritories);
 t.diagnostic('Retained actual C2 value/observation/snapshot join only; runtime-prefix authentication, new admission and semantic assessment are not claimed.');
});
